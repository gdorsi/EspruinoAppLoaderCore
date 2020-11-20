import { html } from "./preact.js";

export function Chip({ value, active, children, onClick }) {
  return html`<${onClick ? 'button' : 'div'}
    class="Chip ${active ? "Chip--active" : onClick ? "Chip--interactive" : ""}"
    onClick=${() => onClick && onClick(value)}
  >
    ${children}
  <//>`;
}
