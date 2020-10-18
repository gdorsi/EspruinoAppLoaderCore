import { html } from "./preact.js";
import { useEffect, useRef, useState } from "./preact.js";
import { Dialog } from "./Dialog.js";
import { useComms } from "./useComms.js";

export function AppInterfaceDialog({ onClose, app }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef();
  const Comms = useComms();

  useEffect(() => {
    if (!loaded) return;

    const { contentWindow: iframeWindow } = ref.current;

    function handleMessage(event) {
      const msg = event.data;

      if (msg.type === "eval") {
        Puck.eval(msg.data, function (result) {
          iframeWindow.postMessage({
            type: "evalrsp",
            data: result,
            id: msg.id,
          });
        });
      } else if (msg.type === "write") {
        Puck.write(msg.data, function (result) {
          iframeWindow.postMessage({
            type: "writersp",
            data: result,
            id: msg.id,
          });
        });
      } else if (msg.type === "readstoragefile") {
        Comms.readStorageFile(msg.data /*filename*/).then(function (result) {
          iframeWindow.postMessage({
            type: "readstoragefilersp",
            data: result,
            id: msg.id,
          });
        });
      }

      iframeWindow.postMessage({ type: "init" });
    }

    iframeWindow.addEventListener("message", handleMessage);

    return () => {
      iframeWindow.removeEventListener("message", handleMessage);
    };
  }, [loaded]);

  return html`
    <${Dialog}
      onClose=${onClose}
      header=${app.name}
      body=${html`<iframe
        src="apps/${app.id}/${app.interface}"
        style="width:100%;min-height:50vh;border:0px;"
        onLoad=${() => setLoaded(true)}
        ref=${ref}
      ></iframe>`}
    />
  `;
}
