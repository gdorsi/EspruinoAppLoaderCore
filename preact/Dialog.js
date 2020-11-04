import { html } from "./preact.js";
import { createPortal } from "./preact.js";
import { useEffect, useRef, useState } from "./preact.js";
import { Button } from "./Button.js";
import { IconClose } from "./Icons.js";

function getFocusableElements(el) {
  return el.querySelectorAll(
    'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
  );
}

export function Dialog({ children, header, onClose }) {
  const container = document.getElementById("modals");

  function handleClose(evt) {
    evt.preventDefault();
    onClose();
  }

  useEffect(() => {
    const upHandler = ({ code, which }) => {
      if (code === "Escape" || which === 27) {
        onClose();
      }
    };

    addEventListener("keyup", upHandler);

    return () => {
      removeEventListener("keyup", upHandler);
    };
  }, [onClose]);

  const ref = useRef();

  useEffect(() => {
    const focusedElBeforeOpen = document.activeElement;

    const focusableElements = getFocusableElements(
      ref.current.querySelector(".Dialog__content")
    );

    //The close button is focused only when it is the only focusable element
    const focusedEl = focusableElements[1] || focusableElements[0];

    focusedEl.focus();

    return () => {
      focusedElBeforeOpen && focusedElBeforeOpen.focus();
    };
  }, []);

  useEffect(() => {
    const focusTrap = (evt) => {
      const { code, which, shiftKey } = evt;

      if (code !== "Tab" && which !== 9) return;

      const focusableElements = getFocusableElements(
        ref.current.querySelector(".Dialog__content")
      );

      if (focusableElements.length === 1) {
        evt.preventDefault();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (shiftKey) {
        if (document.activeElement === first) {
          evt.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          evt.preventDefault();
          first.focus();
        }
      }
    };

    addEventListener("keydown", focusTrap);

    return () => {
      removeEventListener("keydown", focusTrap);
    };
  }, []);

  return createPortal(
    html`
      <div role="dialog" class="Dialog" ref=${ref}>
        <a
          href="#close"
          class="Dialog__overlay"
          aria-label="Close"
          onClick=${handleClose}
        ></a>
        <div class="Dialog__content">
          <div class="Dialog__close">
            <${Button} secondary rounded label="Close" onClick=${handleClose}>
              <${IconClose} />
            <//>
          </div>
          <div class="Dialog__body">
            ${header && html`<div class="Dialog__title">${header}</div>`}
            ${children}
          </div>
        </div>
      </div>
    `,
    container
  );
}

export function Confirm({ header, body, onConfirm, onClose }) {
  return html`
    <${Dialog} header=${header} onClose=${onClose}>
      ${body}

      <button class="btn btn-primary" onClick=${onConfirm}>Yes</button>
      <button class="btn" onClick=${onClose}>No</button>
    <//>
  `;
}

export function usePrompt(onConfirm) {
  const [isOpen, setOpen] = useState(false);

  function show() {
    setOpen(true);
  }

  function handleConfirm(...args) {
    onConfirm && onConfirm(...args);
    setOpen(false);
  }

  function handleClose() {
    setOpen(false);
  }

  return {
    show,
    onConfirm: handleConfirm,
    onClose: handleClose,
    isOpen,
  };
}
