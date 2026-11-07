const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled])';

export function createModal(backdrop, { closeButton, onClose } = {}) {
  let isOpen = false;

  function trapFocus(event) {
    const items = [...backdrop.querySelectorAll(FOCUSABLE)].filter(
      item => !item.hidden && item.offsetParent !== null
    );
    if (!items.length) return;

    const first = items[0];
    const last = items.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onKeydown(event) {
    if (event.key === 'Escape') close('cancel');
    if (event.key === 'Tab') trapFocus(event);
  }

  function onBackdropClick(event) {
    if (event.target === backdrop) close('cancel');
  }

  function onCloseClick() {
    close('cancel');
  }

  function open(focusTarget = closeButton) {
    if (isOpen) return;
    isOpen = true;

    backdrop.classList.add('is-open');
    document.body.classList.add('no-scroll');
    document.addEventListener('keydown', onKeydown);
    backdrop.addEventListener('click', onBackdropClick);
    closeButton?.addEventListener('click', onCloseClick);
    focusTarget?.focus();
  }

  function close(reason = 'cancel', { unlockScroll = true } = {}) {
    if (!isOpen) return;
    isOpen = false;

    backdrop.classList.remove('is-open');
    if (unlockScroll) document.body.classList.remove('no-scroll');
    document.removeEventListener('keydown', onKeydown);
    backdrop.removeEventListener('click', onBackdropClick);
    closeButton?.removeEventListener('click', onCloseClick);
    onClose?.(reason);
  }

  return { open, close, isOpen: () => isOpen };
}
