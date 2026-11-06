import { subscribe } from './api';
import { notifyError, notifySuccess } from './notify';

function errorMessage(error) {
  if (error.response?.status === 409) {
    return 'This email is already subscribed.';
  }
  return (
    error.response?.data?.message ||
    'Something went wrong, please try again later.'
  );
}

export function initSubscription() {
  const form = document.querySelector('[data-subscribe-form]');
  if (!form) return;

  const button = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const email = form.elements.email.value.trim();
    if (!form.checkValidity() || !email) {
      form.reportValidity();
      return;
    }

    button.disabled = true;

    try {
      const { message } = await subscribe(email);
      notifySuccess(message || 'You are subscribed to new exercises!');
      form.reset();
    } catch (error) {
      notifyError(errorMessage(error));
    } finally {
      button.disabled = false;
    }
  });
}
