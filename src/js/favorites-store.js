const STORAGE_KEY = 'your-energy-favorites';

export function getFavorites() {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function save(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
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
