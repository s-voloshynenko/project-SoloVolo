export function initHeader() {
  const page = window.location.pathname.endsWith('favorites.html')
    ? 'favorites'
    : 'home';

  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    if (link.dataset.page === page) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });
}
