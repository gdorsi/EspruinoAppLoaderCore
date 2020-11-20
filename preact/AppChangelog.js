import { html } from "./preact.js";
import { marked } from "./marked.js";
import { useEffect, useState } from "./preact.js";
import { HtmlBlock } from "./HtmlBlock.js";

export function AppChangelog({ app }) {
  const [changes, setChanges] = useState(null);

  useEffect(() => {
    fetch(`apps/${app.id}/ChangeLog`)
      .then((res) => (res.ok ? res.text() : Promise.reject()))
      .then((text) => setChanges(text.split('\n').reverse()));
  }, []);

  if (changes === null) return null;

  return html`<div class="ChangeLog">
    ${changes.map((change, i) => html`<div class="ChangeLog__change" key=${i}>${change}</div>`)}
  </div>`;
}
