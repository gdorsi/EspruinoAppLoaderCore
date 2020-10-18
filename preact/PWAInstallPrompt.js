import { useEffect, useState } from "./preact.js";
import { html } from "./preact.js";

addEventListener("appinstalled", (event) => {
  console.log("👍", "appinstalled", event);
});

/* Only register a service worker if it's supported */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

export function PWAInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState();

  useEffect(() => {
    const showPrompt = (event) => {
      console.log("👍", "beforeinstallprompt", event);

      // Stash the event so it can be triggered later.
      // Shows the install prompt
      setPromptEvent(event);
    };

    addEventListener("beforeinstallprompt", showPrompt);

    return () => removeEventListener("beforeinstallprompt", showPrompt);
  }, []);

  if (!promptEvent) return null;

  function handleClick() {
    console.log("👍", "butInstall-clicked");

    // Show the install prompt.
    promptEvent.prompt();
    // Log the result
    promptEvent.userChoice.then((result) => {
      console.log("👍", "userChoice", result);
      // Reset the deferred prompt variable, since
      // prompt() can only be called once.
      // Hides the install button
      setPromptEvent(null);
    });
  }

  return html`
    <footer
      class="floating navbar-primary navbar"
      style="bottom:0;left:0;right:0;z-index:1;"
    >
      <button class="btn" onClick=${() => setPromptEvent(null)}>
        Dismiss
      </button>
      <button class="btn" onClick=${handleClick}>
        Install
      </button>
    </footer>
  `;
}
