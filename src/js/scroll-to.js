const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export function scrollToIfHidden(element) {
  if (!element) return;

  const { top } = element.getBoundingClientRect();
  if (top >= 0 && top < window.innerHeight) return;

  element.scrollIntoView({
    behavior: reducedMotion.matches ? 'auto' : 'smooth',
    block: 'start',
  });
}
