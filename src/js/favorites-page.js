import { exerciseCard } from './exercise-card';
import { getFavorites, removeFavorite } from './favorites-store';
import { renderPagination } from './pagination';

const tablet = window.matchMedia('(min-width: 768px)');
const desktop = window.matchMedia('(min-width: 1440px)');

let refs = {};
let page = 1;

function pageSize() {
  if (desktop.matches) return Infinity;
  return tablet.matches ? 10 : 8;
}

function render() {
  const favorites = getFavorites();
  const size = pageSize();
  const totalPages = Number.isFinite(size)
    ? Math.ceil(favorites.length / size)
    : 1;
  page = Math.min(page, Math.max(totalPages, 1));

  const items = Number.isFinite(size)
    ? favorites.slice((page - 1) * size, page * size)
    : favorites;

  refs.list.innerHTML = items
    .map(item => exerciseCard(item, { removable: true }))
    .join('');
  refs.list.hidden = favorites.length === 0;
  refs.empty.hidden = favorites.length > 0;
  renderPagination(refs.pagination, { page, totalPages });
}

export function initFavoritesPage() {
  refs = {
    list: document.querySelector('[data-favorites-list]'),
    empty: document.querySelector('[data-favorites-empty]'),
    pagination: document.querySelector('[data-favorites-pagination]'),
  };

  if (!refs.list) return;

  refs.list.addEventListener('click', event => {
    const button = event.target.closest('[data-remove-id]');
    if (button) removeFavorite(button.dataset.removeId);
  });

  refs.pagination.addEventListener('click', event => {
    const button = event.target.closest('[data-page]');
    if (!button) return;
    page = Number(button.dataset.page);
    render();
  });

  document.addEventListener('favorites:change', render);
  tablet.addEventListener('change', render);
  desktop.addEventListener('change', render);

  render();
}
