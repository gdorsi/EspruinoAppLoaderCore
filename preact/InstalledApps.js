import { useInstalledApps } from "./useInstalledApps.js";
import { useAppList } from "./useAppList.js";
import { AppCard } from "./AppCard.js";
import { html } from "./preact.js";

export function InstalledApps() {
  const { data: appList } = useAppList();
  const installedApps = useInstalledApps();

  const list =
    installedApps.list &&
    installedApps.list.map((appInstalled) => {
      let app = appList.find((a) => a.id == appInstalled.id);

      return html`<${AppCard}
        key=${app.id}
        app=${app}
        appInstalled=${appInstalled}
      />`;
    });

  return html`<button
      class="btn refresh"
      onClick=${installedApps.loadFromTheDevice}
    >
      Refresh...</button
    >${list}`;
}
