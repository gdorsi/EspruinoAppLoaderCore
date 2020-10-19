import { html } from "./preact.js";
import { marked } from "./marked.js";
import { useEffect, useState } from "./preact.js";
import { Dialog } from "./Dialog.js";
import { HtmlBlock } from "./HtmlBlock.js";

export function AppReadmeDialog({ onClose, app }) {
  const [contents, setContents] = useState(null);

  const appPath = `apps/${app.id}/`;

  useEffect(() => {
    fetch(appPath + app.readme)
      .then((res) => (res.ok ? res.text() : Promise.reject()))
      .then((text) => setContents(marked(text, { baseUrl: appPath })))
      .catch(() => {
        setContents("Failed to load README.");
      });
  }, []);

  if (contents === null) return null;

  return html`
    <${Dialog}
      onClose=${onClose}
      header=${app.name}
      children=${html`<${HtmlBlock} html=${contents} />`}
    />
  `;
}
