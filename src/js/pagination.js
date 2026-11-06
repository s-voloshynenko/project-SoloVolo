const sprite = new URL('../images/icons.svg', import.meta.url).href;

function pageButton(number, page) {
  const current = number === page;
  return `<li>
    <button class="pagination-btn${current ? ' is-current' : ''}" type="button"
      data-page="${number}" aria-label="Page ${number}"${current ? ' aria-current="page"' : ''}>
      ${number}
    </button>
  </li>`;
}

function arrowButton(target, label, icon, disabled, prev) {
  return `<li>
    <button class="pagination-btn pagination-arrow${prev ? ' is-prev' : ''}" type="button"
      data-page="${target}" aria-label="${label}"${disabled ? ' disabled' : ''}>
      <svg class="icon" aria-hidden="true"><use href="${sprite}#${icon}"></use></svg>
    </button>
  </li>`;
}

function pageNumbers(page, totalPages) {
  if (totalPages <= 5)
    return Array.from({ length: totalPages }, (_, i) => i + 1);

  const start = Math.min(Math.max(page - 1, 1), totalPages - 2);
  const numbers = [start, start + 1, start + 2];
  if (start > 1) numbers.unshift('...');
  if (start + 2 < totalPages) numbers.push('...');
  return numbers;
}

export function renderPagination(list, { page, totalPages }) {
  if (!list) return;

  if (totalPages <= 1) {
    list.innerHTML = '';
    return;
  }

  const withArrows = totalPages > 3;
  const first = page === 1;
  const last = page === totalPages;

  const numbers = pageNumbers(page, totalPages)
    .map(item =>
      item === '...'
        ? '<li class="pagination-dots" aria-hidden="true">...</li>'
        : pageButton(item, page)
    )
    .join('');

  list.innerHTML = withArrows
    ? [
        arrowButton(1, 'First page', 'icon-chevron-double-right', first, true),
        arrowButton(
          page - 1,
          'Previous page',
          'icon-chevron-right',
          first,
          true
        ),
        numbers,
        arrowButton(page + 1, 'Next page', 'icon-chevron-right', last, false),
        arrowButton(
          totalPages,
          'Last page',
          'icon-chevron-double-right',
          last,
          false
        ),
      ].join('')
    : numbers;
}
