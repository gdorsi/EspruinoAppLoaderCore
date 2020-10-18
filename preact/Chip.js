import { html } from "./preact.js";

export function Chip({ value, active, children, onClick }) {
  return html`<button
    class="Chip ${active ? "Chip--active" : onClick ? "Chip--interactive" : ""}"
    onClick=${() => onClick && onClick(value)}
  >
    ${children}
  </button>`;
}
