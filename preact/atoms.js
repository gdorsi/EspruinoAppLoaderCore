import { h, createContext } from "./preact.js";
import {
  useContext,
  useMemo,
  useReducer,
  useLayoutEffect,
} from "./preact.js";

//find a better name
function makeAtomsState() {
  const atomsMap = new WeakMap();

  function use(atomRef) {
    let atom = atomsMap.get(atomRef);

    if (!atom) {
      atom = atomRef(use);
      atomsMap.set(atomRef, atom);
    }

    return atom;
  }

  return use;
}

const ctx = createContext(makeAtomsState());

export function AtomsState({ children }) {
  return h(ctx.Provider, { value: useMemo(makeAtomsState, []) }, children);
}

export function createStateAtom(init, effect) {
  return function (atomsState) {
    const listeners = new Set();
    let cleanup;

    const atom = {
      add: listeners.add.bind(listeners),
      remove: listeners.delete.bind(listeners),
      state: null,
      setState,
    };

    function setState(state) {
      if (typeof state === "function") {
        state = state(atom.state);
      }

      if (state === atom.state) return;

      atom.state = state;
      listeners.forEach((cb) => cb(state));

      effect &&
        requestAnimationFrame(() => {
          queueMicrotask(() => {
            cleanup && cleanup();
            cleanup = effect(state, atomsState);
          });
        });
    }

    //triggers the effects on startup
    setState(init);

    return atom;
  };
}

export function createDataAtom(fetcher, effect) {
  return function (atomsState) {
    const atom = createStateAtom({ init: true, fetchData, mutate }, effect)(atomsState);

    let promise;

    function fetchData(value) {
      if (typeof value === "function") {
        value = value(atom.state);
      }

      const current = (promise = fetcher(value));

      current
        .then((data) => {
          if (current === promise) {
            atom.setState({ data, fetchData, mutate });
          }
        })
        .catch((error) => {
          if (current === promise) {
            atom.setState({ data: atom.state.data, error, fetchData, mutate });
          }
        });
    }

    function mutate(data) {
      atom.setState({ data, fetchData, mutate });
    }

    atom.fetch = fetchData;
    atom.mutate = mutate;

    return atom;
  };
}

export function useAtom(atomRef, subscribe) {
  const atom = useContext(ctx)(atomRef);

  const [, forceRender] = useReducer((state) => !state, 0);

  useLayoutEffect(() => {
    if (!subscribe) return;

    atom.add(forceRender);

    return () => atom.remove(forceRender);
  }, []);


  return atom;
}

export function useStateAtom(atomRef) {
  const atom = useAtom(atomRef, true);

  return [atom.state, atom.setState];
}

export function useAtomSetState(atomRef) {
  return useAtom(atomRef).setState;
}

export function useAtomValue(atomRef) {
  return useAtom(atomRef, true).state;
}
