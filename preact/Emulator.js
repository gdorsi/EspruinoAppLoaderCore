import { html } from "./preact.js";
import { Dialog } from "./Dialog.js";

function getEmulatorURL(app) {
  let file = app.storage.find((f) => f.name.endsWith(".js"));
  if (!file) {
    console.error("No entrypoint found for " + app.id);
    return;
  }
  let baseurl = window.location.href;
  baseurl = baseurl.substr(0, baseurl.lastIndexOf("/"));
  let url = baseurl + "/apps/" + app.id + "/" + file.url;

  return `/emulator.html?codeurl=${url}`;
}

export function EmulatorDialog({ onClose, app }) {
  return html`
    <${Dialog}
      onClose=${onClose}
      header=${app.name}
      children=${html`<iframe
        src=${getEmulatorURL(app)}
        style="width: 264px;height: 244px;border:0px;"
      ></iframe>`}
    />
  `;
}
