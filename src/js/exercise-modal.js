import { getExerciseById } from './api';
import { addFavorite, isFavorite, removeFavorite } from './favorites-store';
import { notifyError } from './notify';

const sprite = new URL('../images/icons.svg', import.meta.url).href;

let refs = {};
let exercise = null;
let lastFocus = null;

function starsMarkup(rating) {
  const filled = Math.round(rating);
  return Array.from(
    { length: 5 },
    (_, i) =>
      `<svg class="icon rating-star${i < filled ? ' is-filled' : ''}" aria-hidden="true"><use href="${sprite}#icon-star"></use></svg>`
  ).join('');
}

function stat(label, value, plain = false) {
  return `<li class="exercise-stat">
    <span class="exercise-stat-label">${label}</span>
    <span class="exercise-stat-value${plain ? ' is-plain' : ''}">${value}</span>
  </li>`;
}

function favoriteButton(id) {
  const saved = isFavorite(id);
  return `${saved ? 'Remove from favorites' : 'Add to favorites'}
    <svg class="icon" aria-hidden="true"><use href="${sprite}#icon-${saved ? 'trash' : 'heart'}"></use></svg>`;
}

function render(data) {
  const rating = Number(data.rating).toFixed(1);
  refs.content.innerHTML = `
    <img class="exercise-gif" src="${data.gifUrl}" alt="${data.name} exercise" width="270" height="259" />
    <div class="exercise-info">
      <h2 class="exercise-modal-title" id="exercise-modal-title">${data.name}</h2>
      <div class="rating rating-dark">
        <span class="rating-value">${rating}<span class="visually-hidden"> out of 5</span></span>
        ${starsMarkup(data.rating)}
      </div>
      <ul class="exercise-stats">
        ${stat('Target', data.target)}
        ${stat('Body Part', data.bodyPart)}
        ${stat('Equipment', data.equipment)}
        ${stat('Popular', data.popularity)}
        ${stat('Burned calories', `${data.burnedCalories}/${data.time} min`, true)}
      </ul>
      <p class="exercise-description">${data.description}</p>
      <div class="exercise-actions">
        <button class="btn btn-filled" type="button" data-favorite-toggle>${favoriteButton(data._id)}</button>
        <button class="btn btn-outline" type="button" data-rating-open hidden>Give a rating</button>
      </div>
    </div>`;
}

function onKeydown(event) {
  if (event.key === 'Escape') closeExerciseModal();
}

function onBackdropClick(event) {
  if (event.target === refs.backdrop) closeExerciseModal();
}

function onContentClick(event) {
  const toggle = event.target.closest('[data-favorite-toggle]');
  if (!toggle || !exercise) return;

  if (isFavorite(exercise._id)) {
    removeFavorite(exercise._id);
  } else {
    addFavorite(exercise);
  }
  toggle.innerHTML = favoriteButton(exercise._id);
}

export function closeExerciseModal() {
  refs.backdrop.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
  document.removeEventListener('keydown', onKeydown);
  refs.backdrop.removeEventListener('click', onBackdropClick);
  refs.close.removeEventListener('click', closeExerciseModal);
  refs.content.removeEventListener('click', onContentClick);
  lastFocus?.focus();
}

export async function openExerciseModal(id) {
  try {
    exercise = await getExerciseById(id);
  } catch (error) {
    notifyError(
      error.response?.data?.message ||
        'Could not load the exercise, please try again.'
    );
    return;
  }

  lastFocus = document.activeElement;
  render(exercise);
  refs.backdrop.classList.add('is-open');
  document.body.classList.add('no-scroll');

  document.addEventListener('keydown', onKeydown);
  refs.backdrop.addEventListener('click', onBackdropClick);
  refs.close.addEventListener('click', closeExerciseModal);
  refs.content.addEventListener('click', onContentClick);
  refs.close.focus();
}

export function initExerciseModal() {
  refs = {
    backdrop: document.querySelector('[data-exercise-backdrop]'),
    close: document.querySelector('[data-exercise-close]'),
    content: document.querySelector('[data-exercise-content]'),
  };

  if (!refs.backdrop) return;

  document.addEventListener('click', event => {
    const start = event.target.closest('[data-exercise-id]');
    if (start) openExerciseModal(start.dataset.exerciseId);
  });
}
