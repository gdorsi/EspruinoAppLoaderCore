import { PreInstallWizardDialog } from "./PreInstallWizardDialog.js";
import { usePrompt } from "./Dialog.js";
import { EmulatorDialog } from "./Emulator.js";
import { AppReadmeDialog } from "./AppReadme.js";
import { AppInterfaceDialog } from "./AppInterface.js";
import { HtmlBlock } from "./HtmlBlock.js";
import { useAppInstaller } from "./useAppInstaller.js";
import { html } from "./preact.js";
import { Chip } from "./Chip.js";
import { Button } from "./Button.js";
import { IconHeart } from "./Icons.js";
import { AppDetail } from "./AppDetail.js";
import { AppVersion } from "./AppVersion.js";

export function AppCard({ app }) {
  const installer = useAppInstaller();

  const installWizardPrompt = usePrompt(installer.install);
  const appInterfacePrompt = usePrompt();
  const emulatorPrompt = usePrompt();
  const readmePrompt = usePrompt();
  const detailDialog = usePrompt();

  const { description, mainCategory, avatar, canUpdate, appInstalled } = app;

  function handleClick(evt) {
    // Someone blocked the navigation
    if (evt.defaultPrevented) {
      return;
    }

    detailDialog.show();
  }

  return html`<article class="AppCard" onClick=${handleClick}>
    <header>
      <img class="AppCard__avatar" src=${avatar} alt=${app.name} />
      <div class="AppCard__actions">
        <button><${IconHeart} /></button>
      </div>
    </header>
    <div class="AppCard__title">${app.name} <${AppVersion} app=${app} /></div>
    <${HtmlBlock} as="div" html="${description}" />
    <footer class="AppCard__footer">
      <${Chip}>#${mainCategory}<//>
      <div class="AppCard__actions" onClick=${(evt) => evt.preventDefault()}>
        ${canUpdate &&
        html`<${Button} primary active onClick=${() => installer.update(app)}>
          Update
        <//>`}
        ${appInstalled
          ? html`<${Button}
              primary
              active
              onClick=${() => installer.remove(app)}
            >
              Remove
            <//>`
          : html`<${Button}
              primary
              active
              onClick=${() =>
                app.custom
                  ? installWizardPrompt.show()
                  : installer.install(app)}
            >
              Install
            <//>`}
      </div>
    </footer>
    ${installWizardPrompt.isOpen &&
    html`<${PreInstallWizardDialog}
      app=${app}
      onClose=${installWizardPrompt.onClose}
      onConfirm=${installWizardPrompt.onConfirm}
    />`}
    ${appInterfacePrompt.isOpen &&
    html`<${AppInterfaceDialog}
      app=${app}
      onClose=${appInterfacePrompt.onClose}
    />`}
    ${emulatorPrompt.isOpen &&
    html`<${EmulatorDialog} app=${app} onClose=${emulatorPrompt.onClose} />`}
    ${readmePrompt.isOpen &&
    html`<${AppReadmeDialog} app=${app} onClose=${readmePrompt.onClose} />`}
    ${detailDialog.isOpen &&
    html`<${AppDetail} app=${app} onClose=${detailDialog.onClose} />`}
  </article> `;
}
