import { useAppList } from "./useAppList.js";
import { html } from "./preact.js";
import { AppCard } from "./AppCard.js";

export function AppList() {
  const visibleApps = useAppList();

  return html`<div class="AppList">
    ${visibleApps.map(
      (app) => html`<${AppCard}
        key=${app.id}
        app=${app}
        appInstalled=${app.appInstalled}
      />`
    )}
  </div>`;
}
