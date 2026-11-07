const base = {
  position: 'topRight',
  timeout: 4000,
};

let toastPromise = null;

function loadToast() {
  toastPromise ??= Promise.all([
    import('izitoast'),
    import('izitoast/dist/css/iziToast.min.css'),
  ]).then(([module]) => module.default);
  return toastPromise;
}

export async function notifySuccess(message) {
  const iziToast = await loadToast();
  iziToast.success({ ...base, message });
}

export async function notifyError(message) {
  const iziToast = await loadToast();
  iziToast.error({ ...base, message });
}
