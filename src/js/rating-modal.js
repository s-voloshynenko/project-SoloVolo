import { rateExercise } from './api';
import { notifyError, notifySuccess } from './notify';

let refs = {};
let exerciseId = '';
let callbacks = {};

function resetForm() {
  refs.form.reset();
  refs.value.textContent = '0.0';
}

function onKeydown(event) {
  if (event.key === 'Escape') close('cancel');
}

function onBackdropClick(event) {
  if (event.target === refs.backdrop) close('cancel');
}

function onCloseClick() {
  close('cancel');
}

function onRateChange(event) {
  if (event.target.name === 'rate') {
    refs.value.textContent = Number(event.target.value).toFixed(1);
  }
}

function errorMessage(error) {
  if (error.response?.status === 409)
    return 'You have already rated this exercise with this email.';
  return (
    error.response?.data?.message ||
    'Could not send the rating, please try again.'
  );
}

async function onSubmit(event) {
  event.preventDefault();

  const { rate, email, review } = refs.form.elements;
  if (!refs.form.checkValidity()) {
    refs.form.reportValidity();
    return;
  }

  refs.submit.disabled = true;
  try {
    await rateExercise(exerciseId, {
      rate: Number(rate.value),
      email: email.value.trim(),
      review: review.value.trim(),
    });
    notifySuccess('Thank you, your rating has been saved!');
    close('done');
  } catch (error) {
    notifyError(errorMessage(error));
  } finally {
    refs.submit.disabled = false;
  }
}

function close(reason) {
  refs.backdrop.classList.remove('is-open');
  document.removeEventListener('keydown', onKeydown);
  refs.backdrop.removeEventListener('click', onBackdropClick);
  refs.close.removeEventListener('click', onCloseClick);
  refs.form.removeEventListener('change', onRateChange);
  refs.form.removeEventListener('submit', onSubmit);
  resetForm();

  const callback = reason === 'done' ? callbacks.onDone : callbacks.onCancel;
  callback?.();
}

export function openRatingModal(id, { onDone, onCancel } = {}) {
  exerciseId = id;
  callbacks = { onDone, onCancel };

  refs.backdrop.classList.add('is-open');
  document.body.classList.add('no-scroll');
  document.addEventListener('keydown', onKeydown);
  refs.backdrop.addEventListener('click', onBackdropClick);
  refs.close.addEventListener('click', onCloseClick);
  refs.form.addEventListener('change', onRateChange);
  refs.form.addEventListener('submit', onSubmit);
  refs.form.querySelector('input[name="rate"]').focus();
}

export function initRatingModal() {
  const backdrop = document.querySelector('[data-rating-backdrop]');
  if (!backdrop) return false;

  refs = {
    backdrop,
    close: backdrop.querySelector('[data-rating-close]'),
    form: backdrop.querySelector('[data-rating-form]'),
    value: backdrop.querySelector('[data-rating-value]'),
    submit: backdrop.querySelector('[type="submit"]'),
  };
  return true;
}
