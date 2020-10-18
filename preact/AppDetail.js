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
import { IconHeart, IconOpenExternalLink } from "./Icons.js";
import { Dialog } from "./Dialog.js";
import { AppVersion } from "./AppVersion.js";

export function AppDetail({ onClose, app }) {
  const installer = useAppInstaller();

  const installWizardPrompt = usePrompt(installer.install);
  const appInterfacePrompt = usePrompt();
  const emulatorPrompt = usePrompt();
  const readmePrompt = usePrompt();

  const { description, categories, avatar, canUpdate, appInstalled } = app;

  const body = html`<article class="AppDetail">
    <header class="AppDetail__header">
      <img class="AppDetail__avatar" src=${avatar} alt=${app.name} />
      <div class="AppDetail__info">
        <div class="AppDetail__title">${app.name} <${AppVersion} app=${app} /></div>
        <div>
          ${categories.map(
            (category) => html`<${Chip} key=${category}>#${category}<//>`
          )}
        </div>
        <div>
          ${canUpdate &&
          html`<${Button} primary onClick=${() => installer.update(app)}>
            Update
          <//>`}
          ${appInstalled
            ? html`<${Button} primary onClick=${() => installer.remove(app)}>
                Remove
              <//>`
            : html`<${Button}
                primary
                onClick=${() =>
                  app.custom
                    ? installWizardPrompt.show()
                    : installer.install(app)}
              >
                Install
              <//>`}
          <${Button}
            href=${app.github}
            target="_blank"
            rel="noopener"
            as="a"
            active
            >GitHub <${IconOpenExternalLink}
          /><//>
        </div>
      </div>
      <div>
        <${Button} active rounded><${IconHeart} /><//>
      </div>
    </header>
    <main class="AppDetail__description">
      <${HtmlBlock} as="div" html="${description}" />
    </main>
    <footer class="AppCard__content"></footer>
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
  </article> `;

  return html` <${Dialog} onClose=${onClose} body=${body} /> `;
}
