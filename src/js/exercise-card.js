const sprite = new URL('../images/icons.svg', import.meta.url).href;

function icon(name) {
  return `<svg class="icon" aria-hidden="true"><use href="${sprite}#${name}"></use></svg>`;
}

export function exerciseCard(
  { _id, name, rating, burnedCalories, time, bodyPart, target },
  { removable = false } = {}
) {
  const middle = removable
    ? `<button class="exercise-remove" type="button" aria-label="Remove ${name} from favorites" data-remove-id="${_id}">
        ${icon('icon-trash')}
      </button>`
    : `<span class="exercise-rating">${Number(rating).toFixed(1)} ${icon('icon-star')}</span>`;

  return `<li class="exercise-card">
    <div class="exercise-top">
      <span class="exercise-badge">Workout</span>
      ${middle}
      <button class="exercise-start" type="button" data-exercise-id="${_id}">
        Start ${icon('icon-arrow')}
      </button>
    </div>
    <h3 class="exercise-name">
      <span class="exercise-icon" aria-hidden="true">${icon('icon-running')}</span>
      <span class="exercise-name-text">${name}</span>
    </h3>
    <ul class="exercise-meta">
      <li><span class="exercise-meta-label">Burned calories:</span> ${burnedCalories} / ${time} min</li>
      <li><span class="exercise-meta-label">Body part:</span> <span class="exercise-meta-value">${bodyPart}</span></li>
      <li><span class="exercise-meta-label">Target:</span> <span class="exercise-meta-value">${target}</span></li>
    </ul>
  </li>`;
}
