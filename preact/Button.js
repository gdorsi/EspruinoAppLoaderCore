import { html } from "./preact.js";

export function Button({
  primary,
  secondary,
  active,
  light,
  rounded,
  label,
  as = "button",
  children,
  ...props
}) {
  const classes = [
    "Button",
    primary && "Button--primary",
    secondary && "Button--secondary",
    rounded && "Button--rounded",
    active && "Button--active",
    light && "Button--light",
  ]
    .filter(Boolean)
    .join(" ");

  return html`<${as} class=${classes} aria-label="${label}" ...${props}>
    ${children}
  <//>`;
}
