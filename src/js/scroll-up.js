const THRESHOLD = 600;

export function initScrollUp() {
  const button = document.querySelector('[data-scroll-up]');
  if (!button) return;

  let ticking = false;

  function update() {
    button.classList.toggle('is-visible', window.scrollY > THRESHOLD);
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  update();
}
