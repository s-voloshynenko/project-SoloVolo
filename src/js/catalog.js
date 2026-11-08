import { getExercises, getFilters } from './api';
import { notifyError } from './notify';
import { exerciseCard } from './exercise-card';
import { renderPagination } from './pagination';
import { scrollToIfHidden } from './scroll-to';

const tablet = window.matchMedia('(min-width: 768px)');
const START_TIMEOUT = 3000;

const state = {
  view: 'categories',
  filter: 'Muscles',
  category: '',
  keyword: '',
  page: 1,
};

let refs = {};
let lastRequest = 0;

function pageSize() {
  if (state.view === 'categories') return tablet.matches ? 12 : 9;
  return tablet.matches ? 10 : 8;
}

function categoryMarkup({ name, filter, imgURL }) {
  return `<li>
    <button class="category-card" type="button" data-category="${name}">
      <img class="category-img" src="${imgURL}" alt="" loading="lazy" fetchpriority="low" decoding="async" width="290" height="242" />
      <span class="category-name">${name}</span>
      <span class="category-filter">${filter}</span>
    </button>
  </li>`;
}

function showEmpty(message) {
  refs.empty.textContent = message;
  refs.empty.hidden = !message;
}

async function load({ scroll = false } = {}) {
  const isCategories = state.view === 'categories';
  const request = ++lastRequest;

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

    if (request !== lastRequest) return;

    const items = data.results ?? [];
    const list = isCategories ? refs.categories : refs.exercises;
    list.innerHTML = items
      .map(isCategories ? categoryMarkup : item => exerciseCard(item))
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
      totalPages: Number(data.totalPages) || 0,
    });

    if (scroll) scrollToIfHidden(refs.head);
  } catch (error) {
    if (request !== lastRequest) return;

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
  load({ scroll: true });
}

function showExercises(category) {
  state.view = 'exercises';
  state.category = category;
  state.page = 1;
  resetSearch();
  setHeading();
  load({ scroll: true });
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
    head: document.querySelector('[data-catalog-head]'),
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
    load({ scroll: true });
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
      load({ scroll: true });
    }
  });

  refs.pagination.addEventListener('click', event => {
    const button = event.target.closest('[data-page]');
    if (!button) return;

    const page = Number(button.dataset.page);
    if (page === state.page) return;

    state.page = page;
    load({ scroll: true });
  });

  tablet.addEventListener('change', () => {
    state.page = 1;
    load();
  });

  startAfterHeroPaint();
}

function supportsLcp() {
  return Boolean(
    window.PerformanceObserver?.supportedEntryTypes?.includes(
      'largest-contentful-paint'
    )
  );
}

function startAfterHeroPaint() {
  let started = false;
  let observer = null;
  let heroWatcher = null;
  let timer = null;

  function start() {
    if (started) return;
    started = true;
    clearTimeout(timer);
    observer?.disconnect();
    heroWatcher?.disconnect();
    window.removeEventListener('load', start);
    if (lastRequest === 0) load();
  }

  timer = setTimeout(start, START_TIMEOUT);

  // after a refresh the page can open scrolled down, so the hero never paints
  const hero = document.querySelector('.hero-img');
  if (!hero) {
    start();
    return;
  }
  if (window.IntersectionObserver) {
    heroWatcher = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) start();
    });
    heroWatcher.observe(hero);
  }

  if (supportsLcp()) {
    observer = new PerformanceObserver(list => {
      const heroPainted = list
        .getEntries()
        .some(entry => entry.element?.classList.contains('hero-img'));
      if (heroPainted) start();
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } else if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start);
  }
}
