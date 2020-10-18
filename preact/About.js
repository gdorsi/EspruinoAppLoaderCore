import { useStateAtom } from "./atoms.js";
import { Confirm, usePrompt } from "./Dialog.js";
import { useAppsUtils, pretokeniseAtom } from "./useAppsUtils.js";
import { useAppInstaller } from "./useAppInstaller.js";
import { html } from "./preact.js";

export function About() {
  const installer = useAppInstaller();
  const utils = useAppsUtils();

  const removeAllPrompt = usePrompt(installer.removeAll);
  const installDefaultPrompt = usePrompt(installer.resetToDefaultApps);
  const [pretokenise, setPretokenise] = useStateAtom(pretokeniseAtom);

  //TODO apploaderlinks
  return html`<div class="hero bg-gray">
      <div class="hero-body">
        <a href="https://banglejs.com" target="_blank"
          ><img src="img/banglejs-logo-mid.png" alt="Bangle.js"
        /></a>
        <h2>App Loader</h2>
        <p>
          A tool for uploading and removing apps from
          <a href="https://banglejs.com" target="_blank"
            >Bangle.js Smart Watches</a
          >
        </p>
      </div>
    </div>
    <div class="container" style="padding-top: 8px;">
      <p id="apploaderlinks"></p>
      <p>
        Check out
        <a href="https://github.com/espruino/BangleApps" target="_blank"
          >the Source on GitHub</a
        >, or find out
        <a href="https://www.espruino.com/Bangle.js+App+Loader" target="_blank"
          >how to add your own app</a
        >
      </p>
      <p>
        Using <a href="https://espruino.com/" target="_blank">Espruino</a>,
        Icons from <a href="https://icons8.com/" target="_blank">icons8.com</a>
      </p>

      <h3>Utilities</h3>
      <p>
        <button class="btn" onClick=${utils.setTime}>Set Bangle.js Time</button>
        <button class="btn" onClick=${removeAllPrompt.show}>
          Remove all Apps
        </button>
        <button class="btn" onClick=${installDefaultPrompt.show}>
          Install default apps
        </button>
      </p>
      <h3>Settings</h3>
      <div class="form-group">
        <label class="form-switch">
          <input
            type="checkbox"
            onChange=${(evt) => setPretokenise(evt.target.checked)}
            checked=${pretokenise}
          />
          <i class="form-icon"></i> Pretokenise apps before upload (smaller,
          faster apps)
        </label>
      </div>
      ${removeAllPrompt.isOpen &&
    html`
        <${Confirm}
          header="Remove all"
          body="Really remove all apps?"
          onConfirm=${removeAllPrompt.onConfirm}
          onClose=${removeAllPrompt.onClose}
        />
      `}
      ${installDefaultPrompt.isOpen &&
    html`
        <${Confirm}
          header="Install Defaults"
          body="Remove everything and install default apps?"
          onConfirm=${installDefaultPrompt.onConfirm}
          onClose=${installDefaultPrompt.onClose}
        />
      `}
    </div>`;
}
