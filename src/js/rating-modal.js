import { rateExercise } from './api';
import { createModal } from './modal';
import { notifyError, notifySuccess } from './notify';

let refs = {};
let modal = null;
let exerciseId = '';
let callbacks = {};

function errorMessage(error) {
  if (error.response?.status === 409) {
    return 'You have already rated this exercise with this email.';
  }
  return (
    error.response?.data?.message ||
    'Could not send the rating, please try again.'
  );
}

function onRateChange(event) {
  if (event.target.name === 'rate') {
    refs.value.textContent = Number(event.target.value).toFixed(1);
  }
}

async function onSubmit(event) {
  event.preventDefault();

  if (!refs.form.checkValidity()) {
    refs.form.reportValidity();
    return;
  }

  const { rate, email, review } = refs.form.elements;
  refs.submit.disabled = true;

  try {
    await rateExercise(exerciseId, {
      rate: Number(rate.value),
      email: email.value.trim(),
      review: review.value.trim(),
    });
    notifySuccess('Thank you, your rating has been saved!');
    modal.close('done', { unlockScroll: false });
  } catch (error) {
    notifyError(errorMessage(error));
  } finally {
    refs.submit.disabled = false;
  }
}

function onClose(reason) {
  refs.form.reset();
  refs.value.textContent = '0.0';

  const callback = reason === 'done' ? callbacks.onDone : callbacks.onCancel;
  callback?.();
}

export function openRatingModal(id, { onDone, onCancel } = {}) {
  exerciseId = id;
  callbacks = { onDone, onCancel };
  modal.open();
}

export function initRatingModal() {
  const backdrop = document.querySelector('[data-rating-backdrop]');
  if (!backdrop) return false;

  refs = {
    form: backdrop.querySelector('[data-rating-form]'),
    value: backdrop.querySelector('[data-rating-value]'),
    submit: backdrop.querySelector('[type="submit"]'),
  };

  modal = createModal(backdrop, {
    closeButton: backdrop.querySelector('[data-rating-close]'),
    onClose,
  });

  refs.form.addEventListener('change', onRateChange);
  refs.form.addEventListener('submit', onSubmit);
  return true;
}
