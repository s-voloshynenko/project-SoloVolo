import { getExercises, getFilters } from './api';
import { notifyError } from './notify';
import { renderPagination } from './pagination';

const tablet = window.matchMedia('(min-width: 768px)');
const sprite = new URL('../images/icons.svg', import.meta.url).href;

const state = {
  view: 'categories',
  filter: 'Muscles',
  category: '',
  keyword: '',
  page: 1,
};

let refs = {};

function pageSize() {
  if (state.view === 'categories') return tablet.matches ? 12 : 9;
  return tablet.matches ? 10 : 8;
}

function categoryMarkup({ name, filter, imgURL }) {
  return `<li>
    <button class="category-card" type="button" data-category="${name}">
      <img class="category-img" src="${imgURL}" alt="" loading="lazy" width="290" height="242" />
      <span class="category-name">${name}</span>
      <span class="category-filter">${filter}</span>
    </button>
  </li>`;
}

function exerciseMarkup({
  _id,
  name,
  rating,
  burnedCalories,
  time,
  bodyPart,
  target,
}) {
  return `<li class="exercise-card">
    <div class="exercise-top">
      <span class="exercise-badge">Workout</span>
      <span class="exercise-rating">
        ${Number(rating).toFixed(1)}
        <svg class="icon" aria-hidden="true"><use href="${sprite}#icon-star"></use></svg>
      </span>
      <button class="exercise-start" type="button" data-exercise-id="${_id}">
        Start
        <svg class="icon" aria-hidden="true"><use href="${sprite}#icon-arrow"></use></svg>
      </button>
    </div>
    <h3 class="exercise-name">
      <span class="exercise-icon" aria-hidden="true">
        <svg class="icon"><use href="${sprite}#icon-running"></use></svg>
      </span>
      <span class="exercise-name-text">${name}</span>
    </h3>
    <ul class="exercise-meta">
      <li><span class="exercise-meta-label">Burned calories:</span> ${burnedCalories} / ${time} min</li>
      <li><span class="exercise-meta-label">Body part:</span> <span class="exercise-meta-value">${bodyPart}</span></li>
      <li><span class="exercise-meta-label">Target:</span> <span class="exercise-meta-value">${target}</span></li>
    </ul>
  </li>`;
}

function showEmpty(message) {
  refs.empty.textContent = message;
  refs.empty.hidden = !message;
}

async function load() {
  const isCategories = state.view === 'categories';

  try {
    const data = isCategories
      ? await getFilters({
          filter: state.filter,
          page: state.page,
          limit: pageSize(),
        })
      : await getExercises({
          filter: state.filter,
          category: state.category,
          keyword: state.keyword,
          page: state.page,
          limit: pageSize(),
        });

    const items = data.results;
    const list = isCategories ? refs.categories : refs.exercises;
    list.innerHTML = items
      .map(isCategories ? categoryMarkup : exerciseMarkup)
      .join('');

    refs.categories.hidden = !isCategories;
    refs.exercises.hidden = isCategories;

    if (items.length) {
      showEmpty('');
    } else {
      showEmpty(
        isCategories
          ? 'Nothing found for this filter. Try another one.'
          : 'No exercises found. Try another keyword or category.'
      );
    }

    renderPagination(refs.pagination, {
      page: state.page,
      totalPages: Number(data.totalPages),
    });
  } catch (error) {
    refs.categories.innerHTML = '';
    refs.exercises.innerHTML = '';
    showEmpty('Something went wrong. Please try again later.');
    renderPagination(refs.pagination, { page: 1, totalPages: 0 });
    notifyError(
      error.response?.data?.message || 'Could not load data, please try again.'
    );
  }
}

function setHeading() {
  const hasCategory = state.view === 'exercises';
  refs.slash.hidden = !hasCategory;
  refs.label.hidden = !hasCategory;
  refs.label.textContent = hasCategory ? state.category : '';
  refs.search.hidden = !hasCategory;
}

function resetSearch() {
  state.keyword = '';
  refs.search.reset();
  refs.clear.hidden = true;
}

function showCategories() {
  state.view = 'categories';
  state.category = '';
  state.page = 1;
  resetSearch();
  setHeading();
  load();
}

function showExercises(category) {
  state.view = 'exercises';
  state.category = category;
  state.page = 1;
  resetSearch();
  setHeading();
  load();
}

function setActiveFilter(button) {
  refs.filters.querySelectorAll('.filter-btn').forEach(btn => {
    const active = btn === button;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

export function initCatalog() {
  refs = {
    filters: document.querySelector('[data-filters]'),
    categories: document.querySelector('[data-categories]'),
    exercises: document.querySelector('[data-exercises]'),
    empty: document.querySelector('[data-catalog-empty]'),
    pagination: document.querySelector('[data-catalog-pagination]'),
    slash: document.querySelector('[data-category-slash]'),
    label: document.querySelector('[data-category-label]'),
    search: document.querySelector('[data-search-form]'),
    clear: document.querySelector('[data-search-clear]'),
  };

  if (!refs.filters || !refs.categories) return;

  refs.filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    if (button.dataset.filter === state.filter && state.view === 'categories')
      return;

    state.filter = button.dataset.filter;
    setActiveFilter(button);
    showCategories();
  });

  refs.categories.addEventListener('click', event => {
    const card = event.target.closest('[data-category]');
    if (card) showExercises(card.dataset.category);
  });

  refs.search.addEventListener('submit', event => {
    event.preventDefault();
    state.keyword = refs.search.elements.keyword.value.trim();
    state.page = 1;
    load();
  });

  refs.search.elements.keyword.addEventListener('input', event => {
    refs.clear.hidden = !event.target.value;
  });

  refs.clear.addEventListener('click', () => {
    const hadKeyword = Boolean(state.keyword);
    resetSearch();
    refs.search.elements.keyword.focus();
    if (hadKeyword) {
      state.page = 1;
      load();
    }
  });

  refs.pagination.addEventListener('click', event => {
    const button = event.target.closest('[data-page]');
    if (!button) return;

    const page = Number(button.dataset.page);
    if (page === state.page) return;

    state.page = page;
    load();
  });

  tablet.addEventListener('change', () => {
    state.page = 1;
    load();
  });

  load();
}
