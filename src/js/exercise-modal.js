import { getExerciseById } from './api';
import { addFavorite, isFavorite, removeFavorite } from './favorites-store';
import { createModal } from './modal';
import { notifyError } from './notify';
import { initRatingModal, openRatingModal } from './rating-modal';

let refs = {};
let modal = null;
let pendingId = '';
let exercise = null;
let lastFocus = null;

function updateFavoriteButton() {
  const saved = isFavorite(exercise._id);
  refs.favoriteLabel.textContent = saved
    ? 'Remove from favorites'
    : 'Add to favorites';
  refs.favorite.classList.toggle('is-saved', saved);
}

function render(data) {
  const filled = Math.round(data.rating);

  refs.media.hidden = !data.gifUrl;
  if (data.gifUrl) {
    const gif = new Image(270, 259);
    gif.className = 'exercise-gif';
    gif.src = data.gifUrl;
    gif.alt = `${data.name} exercise`;
    refs.media.replaceChildren(gif);
  } else {
    refs.media.replaceChildren();
  }

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

function onFavoriteClick() {
  if (isFavorite(exercise._id)) {
    removeFavorite(exercise._id);
  } else {
    addFavorite(exercise);
  }
  updateFavoriteButton();
}

function show() {
  render(exercise);
  modal.open();
}

function onRateClick() {
  const id = exercise._id;
  modal.close('swap', { unlockScroll: false });
  openRatingModal(id, {
    onDone: () => openExerciseModal(id, { keepFocus: true }),
    onCancel: show,
  });
}

export function closeExerciseModal() {
  modal.close('cancel');
}

export async function openExerciseModal(id, { keepFocus = false } = {}) {
  pendingId = id;
  if (!keepFocus && !modal.isOpen()) {
    lastFocus = document.activeElement;
  }

  let data;
  try {
    data = await getExerciseById(id);
  } catch (error) {
    if (pendingId !== id) return;
    notifyError(
      error.response?.data?.message ||
        'Could not load the exercise, please try again.'
    );
    if (keepFocus) {
      document.body.classList.remove('no-scroll');
      lastFocus?.focus();
    }
    return;
  }

  if (pendingId !== id) return;
  exercise = data;
  show();
}

export function initExerciseModal() {
  const backdrop = document.querySelector('[data-exercise-backdrop]');
  if (!backdrop) return;

  const find = name => backdrop.querySelector(`[data-${name}]`);
  refs = {
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
    rate: find('rating-open'),
  };

  modal = createModal(backdrop, {
    closeButton: find('exercise-close'),
    onClose: reason => {
      if (reason !== 'swap') lastFocus?.focus();
    },
  });

  refs.favorite.addEventListener('click', onFavoriteClick);
  refs.rate.addEventListener('click', onRateClick);
  refs.rate.hidden = !initRatingModal();

  document.addEventListener('click', event => {
    const start = event.target.closest('[data-exercise-id]');
    if (start) openExerciseModal(start.dataset.exerciseId);
  });
}
