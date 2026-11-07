export function createModal(backdrop, { closeButton, onClose } = {}) {
  function onKeydown(event) {
    if (event.key === 'Escape') close('cancel');
  }

  function onBackdropClick(event) {
    if (event.target === backdrop) close('cancel');
  }

  function onCloseClick() {
    close('cancel');
  }

  function open(focusTarget = closeButton) {
    backdrop.classList.add('is-open');
    document.body.classList.add('no-scroll');
    document.addEventListener('keydown', onKeydown);
    backdrop.addEventListener('click', onBackdropClick);
    closeButton?.addEventListener('click', onCloseClick);
    focusTarget?.focus();
  }

  function close(reason = 'cancel', { unlockScroll = true } = {}) {
    backdrop.classList.remove('is-open');
    if (unlockScroll) document.body.classList.remove('no-scroll');
    document.removeEventListener('keydown', onKeydown);
    backdrop.removeEventListener('click', onBackdropClick);
    closeButton?.removeEventListener('click', onCloseClick);
    onClose?.(reason);
  }

  return { open, close };
}
