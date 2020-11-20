import { html } from "./preact.js";

/**
 * Warn the page must be served over HTTPS
 * The `beforeinstallprompt` event won't fire if the page is served over HTTP.
 * Installability requires a service worker with a fetch event handler, and
 * if the page isn't served over HTTPS, the service worker won't load.
 */
export function HttpsBanner() {
  if (location.href.startsWith("https") || location.hostname === "localhost")
    return null;

  return html`<div class="Toast">
    <b>STOP!</b> This page <b>must</b> be served over HTTPS. Please
    <a
      href="#https"
      onClick=${() => {
        location.href = location.href.replace(`http://`, "https://");
      }}
      >reload this page via HTTPS</a
    >
  </div>`;
}
