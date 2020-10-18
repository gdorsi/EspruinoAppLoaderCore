import { html } from "./preact.js";

export function AppVersion({ app }) {
  const { version, appInstalled, canUpdate } = app;

  const installed = appInstalled && appInstalled.version;

  if (canUpdate) return html`
    <span class="AppVersion">v${installed} | latest v${version}</span>
  `

  return html`<span class="AppVersion">v${version}</span>`;
}
