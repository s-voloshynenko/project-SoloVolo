import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const base = {
  position: 'topRight',
  timeout: 4000,
};

export function notifySuccess(message) {
  iziToast.success({ ...base, message });
}

export function notifyError(message) {
  iziToast.error({ ...base, message });
}
