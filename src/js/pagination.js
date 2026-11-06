export function renderPagination(list, { page, totalPages }) {
  if (!list) return;

  if (totalPages <= 1) {
    list.innerHTML = '';
    return;
  }

  list.innerHTML = Array.from({ length: totalPages }, (_, i) => {
    const number = i + 1;
    const current = number === page;
    return `<li>
      <button class="pagination-btn${current ? ' is-current' : ''}" type="button"
        data-page="${number}" aria-label="Page ${number}"${current ? ' aria-current="page"' : ''}>
        ${number}
      </button>
    </li>`;
  }).join('');
}
