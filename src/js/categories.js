import { getFilters } from './api';
import { notifyError } from './notify';
import { renderPagination } from './pagination';

const tablet = window.matchMedia('(min-width: 768px)');

const state = {
  filter: 'Muscles',
  page: 1,
};

let refs = {};

function pageSize() {
  return tablet.matches ? 12 : 9;
}

function cardMarkup({ name, filter, imgURL }) {
  return `<li>
    <button class="category-card" type="button" data-category="${name}" data-filter="${filter}">
      <img class="category-img" src="${imgURL}" alt="" loading="lazy" width="290" height="242" />
      <span class="category-name">${name}</span>
      <span class="category-filter">${filter}</span>
    </button>
  </li>`;
}

async function loadCategories() {
  try {
    const { results, totalPages } = await getFilters({
      filter: state.filter,
      page: state.page,
      limit: pageSize(),
    });

    refs.list.innerHTML = results.map(cardMarkup).join('');
    refs.empty.hidden = results.length > 0;
    renderPagination(refs.pagination, {
      page: state.page,
      totalPages: Number(totalPages),
    });
  } catch (error) {
    refs.list.innerHTML = '';
    refs.empty.hidden = false;
    renderPagination(refs.pagination, { page: 1, totalPages: 0 });
    notifyError(
      error.response?.data?.message ||
        'Could not load categories, please try again.'
    );
  }
}

function setActiveFilter(button) {
  refs.filters.querySelectorAll('.filter-btn').forEach(btn => {
    const active = btn === button;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

export function initCategories() {
  refs = {
    filters: document.querySelector('[data-filters]'),
    list: document.querySelector('[data-categories]'),
    empty: document.querySelector('[data-categories-empty]'),
    pagination: document.querySelector('[data-categories-pagination]'),
  };

  if (!refs.filters || !refs.list) return;

  refs.filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button || button.dataset.filter === state.filter) return;

    state.filter = button.dataset.filter;
    state.page = 1;
    setActiveFilter(button);
    loadCategories();
  });

  refs.pagination.addEventListener('click', event => {
    const button = event.target.closest('[data-page]');
    if (!button) return;

    const page = Number(button.dataset.page);
    if (page === state.page) return;

    state.page = page;
    loadCategories();
  });

  tablet.addEventListener('change', () => {
    state.page = 1;
    loadCategories();
  });

  loadCategories();
}
