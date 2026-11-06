const FOCUSABLE = 'a[href], button:not([disabled])';

export function initMobileMenu() {
  const openBtn = document.querySelector('[data-menu-open]');
  const closeBtn = document.querySelector('[data-menu-close]');
  const backdrop = document.querySelector('[data-menu-backdrop]');
  const menu = document.querySelector('[data-menu]');

  if (!openBtn || !closeBtn || !backdrop || !menu) return;

  const desktop = window.matchMedia('(min-width: 768px)');
  let isOpen = false;

  function setOpen(open, returnFocus = true) {
    isOpen = open;
    backdrop.classList.toggle('is-open', open);
    menu.inert = !open;
    openBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);

    if (open) {
      closeBtn.focus();
      document.addEventListener('keydown', onKeydown);
    } else {
      document.removeEventListener('keydown', onKeydown);
      if (returnFocus) openBtn.focus();
    }
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (event.key !== 'Tab') return;

    const items = [...menu.querySelectorAll(FOCUSABLE)];
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

  openBtn.addEventListener('click', () => setOpen(true));
  closeBtn.addEventListener('click', () => setOpen(false));

  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) setOpen(false);
  });

  menu.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false, false);
  });

  desktop.addEventListener('change', event => {
    if (event.matches && isOpen) setOpen(false, false);
  });
}
