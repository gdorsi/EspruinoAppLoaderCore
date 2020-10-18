import { Toast } from "./Toast.js";
import { HttpsBanner } from "./HttpsBanner.js";
import { ProgressBar } from "./ProgressBar.js";
import { AppsLibrary } from "./AppsLibrary.js";
import { InstalledApps } from "./InstalledApps.js";
import { About } from "./About.js";
import { Header } from "./Header.js";
import { html, render } from "./preact.js";

window.Const = {
  /* Are we only putting a single app on a device? If so
  apps should all be saved as .bootcde and we write info
  about the current app into app.info */
  SINGLE_APP_ONLY: false,
};

function Main() {
  const activeTab = 'library'; //TODO Router

  return html`<${Header} />
    <${HttpsBanner} />
    <div class="ToastContainer">
      <${Toast} />
      <${ProgressBar} />
    </div>
    <div class="container bangle-tab">
      ${activeTab === "library"
        ? html`<${AppsLibrary} />`
        : activeTab === "myapps"
        ? html`<${InstalledApps} />`
        : html`<${About} />`}
    </div>`;
}

render(html`<${Main} />`, document.querySelector("#root"));
