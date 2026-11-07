const SHOW_DELAY = 200;

let loader = null;
let pending = 0;
let timer = null;

function getLoader() {
  loader ??= document.querySelector('[data-loader]');
  return loader;
}

export function showLoader() {
  pending += 1;
  if (pending > 1 || !getLoader()) return;

  timer = setTimeout(() => {
    loader.hidden = false;
  }, SHOW_DELAY);
}

export function hideLoader() {
  pending = Math.max(pending - 1, 0);
  if (pending > 0 || !getLoader()) return;

  clearTimeout(timer);
  loader.hidden = true;
}
