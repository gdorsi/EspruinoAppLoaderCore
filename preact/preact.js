import htm from "https://cdn.skypack.dev/htm@3.0.4";

import { h, render, createContext } from "https://cdn.skypack.dev/preact@10.5.4";
export {
  useEffect,
  useRef,
  useState,
  useReducer,
  useLayoutEffect,
  useContext,
  useMemo
} from "https://cdn.skypack.dev/preact@10.5.4/hooks";
export { createPortal } from "https://cdn.skypack.dev/preact@10.5.4/compat";

export const html = htm.bind(h);

export { h, render, createContext };
