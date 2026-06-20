(function () {
  'use strict';

  const data = Array.isArray(window.MOVIE_DATA) ? window.MOVIE_DATA : [];
  const keywordInput = document.getElementById('search-keyword');
  const submitButton = document.getElementById('search-submit');
  const regionSelect = document.getElementById('filter-region');
  const typeSelect = document.getElementById('filter-type');
  const yearSelect = document.getElementById('filter-year');
  const genreSelect = document.getElementById('filter-genre');
  const sortSelect = document.getElementById('filter-sort');
  const resultsWrap = document.getElementById('search-results');
  const summary = document.getElementById('result-summary');
  const loadMoreButton = document.getElementById('load-more');
  const pageSize = 48;
  let visibleCount = pageSize;
  let currentResults = [];

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function matchesKeyword(item, keyword) {
    if (!keyword) {
      return true;
    }

    const haystack = [
      item.title,
      item.region,
      item.type,
      item.year,
      item.genre,
      item.tags,
      item.oneLine,
    ].join(' ').toLowerCase();

    return haystack.includes(keyword);
  }

  function cardTemplate(item) {
    const tags = item.tags
      .slice(0, 3)
      .map((tag) => `<span>${escapeHtml(tag)}</span>`)
      .join('');

    return `
      <article class="movie-card">
        <a href="${item.url}" class="movie-card__link" aria-label="查看${escapeHtml(item.title)}详情">
          <div class="cover-shell">
            <img class="movie-cover" src="${item.image}" alt="${escapeHtml(item.title)}海报" loading="lazy">
            <span class="quality-badge">高清</span>
            <span class="score-badge">${item.rating}</span>
          </div>
          <div class="movie-card__body">
            <h3>${escapeHtml(item.title)}</h3>
            <p class="movie-card__meta">${escapeHtml(item.year)} · ${escapeHtml(item.region)} · ${escapeHtml(item.type)}</p>
            <p class="movie-card__desc">${escapeHtml(item.oneLine)}</p>
            <div class="movie-card__tags">${tags}</div>
          </div>
        </a>
      </article>`;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function sortResults(items) {
    const mode = sortSelect ? sortSelect.value : 'views';
    const copy = items.slice();

    copy.sort((a, b) => {
      if (mode === 'rating') {
        return Number(b.rating) - Number(a.rating);
      }
      if (mode === 'year') {
        return Number(b.year) - Number(a.year);
      }
      if (mode === 'title') {
        return a.title.localeCompare(b.title, 'zh-Hans-CN');
      }
      return Number(b.views) - Number(a.views);
    });

    return copy;
  }

  function collectResults() {
    const keyword = normalize(keywordInput ? keywordInput.value : '');
    const region = regionSelect ? regionSelect.value : '';
    const type = typeSelect ? typeSelect.value : '';
    const year = yearSelect ? yearSelect.value : '';
    const genre = genreSelect ? genreSelect.value : '';

    currentResults = sortResults(data.filter((item) => {
      return matchesKeyword(item, keyword)
        && (!region || item.region === region)
        && (!type || item.type === type)
        && (!year || item.year === year)
        && (!genre || item.genreTokens.includes(genre));
    }));
  }

  function render() {
    collectResults();

    const visible = currentResults.slice(0, visibleCount);
    resultsWrap.innerHTML = visible.map(cardTemplate).join('');
    summary.textContent = `共找到 ${currentResults.length} 部影片，当前显示 ${visible.length} 部。`;

    if (loadMoreButton) {
      loadMoreButton.style.display = visible.length < currentResults.length ? 'inline-flex' : 'none';
    }
  }

  function resetAndRender() {
    visibleCount = pageSize;
    render();
  }

  if (keywordInput) {
    keywordInput.value = getQueryParam('q');
    keywordInput.addEventListener('input', resetAndRender);
  }

  if (submitButton) {
    submitButton.addEventListener('click', resetAndRender);
  }

  [regionSelect, typeSelect, yearSelect, genreSelect, sortSelect].forEach((control) => {
    if (control) {
      control.addEventListener('change', resetAndRender);
    }
  });

  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', () => {
      visibleCount += pageSize;
      render();
    });
  }

  render();
})();
