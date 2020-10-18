import { h } from "./preact.js";

export function HtmlBlock({ as = "span", html, ...props }) {
  return h(as, {
    dangerouslySetInnerHTML: {
      __html: html,
    },
    ...props,
  });
}
