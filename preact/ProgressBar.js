import { html } from "./preact.js";
import { useEffect } from "./preact.js";
import { createStateAtom, useStateAtom, useAtomSetState } from "./atoms.js";

export const progressBarAtom = createStateAtom({ visible: false });

export function useProgressBar() {
  const setState = useAtomSetState(progressBarAtom);

  function show(text) {
    setState((state) => ({ ...state, text, visible: true }));
  }

  function hide() {
    setState({ visible: false });
  }

  function setRange(min, max) {
    setState((state) => ({ ...state, range: [min, max], percent: 0 }));
  }

  function setPercent(percent) {
    setState((state) => ({ ...state, percent }));
  }

  return { show, hide, setRange, setPercent };
}

export function ProgressBar() {
  const [state, setState] = useStateAtom(progressBarAtom);

  useEffect(() => {
    if (!state) return;

    /// Add progress handler so we get nice uploads
    Puck.writeProgress = function (charsSent, charsTotal) {
      if (charsSent === undefined) {
        return;
      }

      setState((state) => ({
        ...state,
        percent: charsSent / charsTotal,
      }));
    };

    return () => {
      Puck.writeProgress = null;
    };
  }, [state]);

  if (state.visible === false) return null;

  let percent = state.percent || 0;

  if (state.range) {
    const [min, max] = state.range;
    percent = min + (max - min) * percent;
  }

  return html`<div class="Toast">
    <div class="Loader"></div>
    <div>${state.text}</div>
    <div>${(percent * 100).toFixed(0)}%</div>
  </div>`;
}
