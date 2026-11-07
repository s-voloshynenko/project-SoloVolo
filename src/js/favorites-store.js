import { notifyError } from './notify';

const STORAGE_KEY = 'your-energy-favorites';

function isExercise(item) {
  return Boolean(item) && typeof item._id === 'string';
}

export function getFavorites() {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(list) ? list.filter(isExercise) : [];
  } catch {
    return [];
  }
}

function save(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    notifyError('Could not save favorites in this browser.');
    return;
  }
  document.dispatchEvent(new CustomEvent('favorites:change'));
}

export function isFavorite(id) {
  return getFavorites().some(item => item._id === id);
}

export function addFavorite(exercise) {
  if (isFavorite(exercise._id)) return;
  save([...getFavorites(), exercise]);
}

export function removeFavorite(id) {
  save(getFavorites().filter(item => item._id !== id));
}
