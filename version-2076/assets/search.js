import { searchItems } from './search-data.js';

const form = document.querySelector('[data-search-form]');
const input = document.querySelector('[data-search-input]');
const results = document.querySelector('[data-search-results]');
const status = document.querySelector('[data-search-status]');

function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('q') || '').trim();
}

function createCard(item) {
  const tags = item.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  return `
<article class="movie-card">
  <a class="poster-link" href="${item.href}">
    <span class="poster-wrap">
      <img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy">
      <span class="poster-play">▶</span>
    </span>
  </a>
  <div class="movie-card-body">
    <div class="movie-meta-line">
      <span>${escapeHtml(String(item.year || '精选'))}</span>
      <span>${escapeHtml(item.region)}</span>
      <span>${escapeHtml(item.type)}</span>
    </div>
    <h3><a href="${item.href}">${escapeHtml(item.title)}</a></h3>
    <p>${escapeHtml(item.summary)}</p>
    <div class="tag-row">${tags}</div>
  </div>
</article>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function render(query) {
  if (!results || !status) {
    return;
  }

  const text = query.trim().toLowerCase();
  if (!text) {
    return;
  }

  const matched = searchItems.filter((item) => {
    const haystack = [
      item.title,
      item.year,
      item.region,
      item.type,
      item.genre,
      item.summary,
      item.tags.join(' ')
    ].join(' ').toLowerCase();
    return haystack.includes(text);
  }).slice(0, 120);

  if (input) {
    input.value = query;
  }

  status.textContent = matched.length ? `“${query}”相关影片` : `未找到“${query}”相关影片`;
  results.innerHTML = matched.map(createCard).join('');
}

const initialQuery = getQuery();
render(initialQuery);

if (form && input) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    const url = query ? `./search.html?q=${encodeURIComponent(query)}` : './search.html';
    window.history.replaceState(null, '', url);
    render(query);
  });
}
