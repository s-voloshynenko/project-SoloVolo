import { getExerciseById } from './api';
import { addFavorite, isFavorite, removeFavorite } from './favorites-store';
import { notifyError } from './notify';

let refs = {};
let exercise = null;
let lastFocus = null;

function updateFavoriteButton() {
  const saved = isFavorite(exercise._id);
  refs.favoriteLabel.textContent = saved
    ? 'Remove from favorites'
    : 'Add to favorites';
  refs.favoriteAdd.hidden = saved;
  refs.favoriteRemove.hidden = !saved;
}

function render(data) {
  const filled = Math.round(data.rating);

  const gif = new Image(270, 259);
  gif.className = 'exercise-gif';
  gif.src = data.gifUrl;
  gif.alt = `${data.name} exercise`;
  refs.media.replaceChildren(gif);

  refs.name.textContent = data.name;
  refs.rating.textContent = Number(data.rating).toFixed(1);
  refs.stars.forEach((star, i) =>
    star.classList.toggle('is-filled', i < filled)
  );
  refs.target.textContent = data.target;
  refs.bodyPart.textContent = data.bodyPart;
  refs.equipment.textContent = data.equipment;
  refs.popularity.textContent = data.popularity;
  refs.calories.textContent = `${data.burnedCalories}/${data.time} min`;
  refs.description.textContent = data.description;
  updateFavoriteButton();
}

function onKeydown(event) {
  if (event.key === 'Escape') closeExerciseModal();
}

function onBackdropClick(event) {
  if (event.target === refs.backdrop) closeExerciseModal();
}

function onFavoriteClick() {
  if (isFavorite(exercise._id)) {
    removeFavorite(exercise._id);
  } else {
    addFavorite(exercise);
  }
  updateFavoriteButton();
}

export function closeExerciseModal() {
  refs.backdrop.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
  document.removeEventListener('keydown', onKeydown);
  refs.backdrop.removeEventListener('click', onBackdropClick);
  refs.close.removeEventListener('click', closeExerciseModal);
  refs.favorite.removeEventListener('click', onFavoriteClick);
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
  refs.favorite.addEventListener('click', onFavoriteClick);
  refs.close.focus();
}

export function initExerciseModal() {
  const backdrop = document.querySelector('[data-exercise-backdrop]');
  if (!backdrop) return;

  const find = name => backdrop.querySelector(`[data-${name}]`);
  refs = {
    backdrop,
    close: find('exercise-close'),
    media: find('exercise-media'),
    name: find('exercise-name'),
    rating: find('exercise-rating'),
    stars: backdrop.querySelectorAll('[data-exercise-star]'),
    target: find('exercise-target'),
    bodyPart: find('exercise-bodypart'),
    equipment: find('exercise-equipment'),
    popularity: find('exercise-popularity'),
    calories: find('exercise-calories'),
    description: find('exercise-description'),
    favorite: find('favorite-toggle'),
    favoriteLabel: find('favorite-label'),
    favoriteAdd: find('favorite-add'),
    favoriteRemove: find('favorite-remove'),
  };

  document.addEventListener('click', event => {
    const start = event.target.closest('[data-exercise-id]');
    if (start) openExerciseModal(start.dataset.exerciseId);
  });
}
