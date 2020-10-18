import { html } from "./preact.js";
import { useEffect } from "./preact.js";
import { createStateAtom, useStateAtom, useAtomSetState } from "./atoms.js";

export const toastAtom = createStateAtom();

export function useToast() {
  const setState = useAtomSetState(toastAtom);

  function show(msg, type) {
    setState({
      msg,
      type,
    });
  }

  return { show };
}

export function Toast() {
  const [state, setState] = useStateAtom(toastAtom);

  useEffect(() => {
    const timer = setTimeout(() => setState(null), 5000);

    return () => clearTimeout(timer);
  }, [state]);

  if (!state) return null;

  const { msg, type = "primary" } = state;

  if (!["success", "error", "warning", "primary"].includes(type)) {
    console.log("showToast: unknown toast " + type);
  }

  return html`<div class="Toast toast-${type}">${msg}</div>`;
}
