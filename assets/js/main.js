(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMobileNav() {
    const button = document.querySelector('.mobile-nav-toggle');
    const nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      const open = nav.hasAttribute('hidden');
      if (open) {
        nav.removeAttribute('hidden');
      } else {
        nav.setAttribute('hidden', '');
      }
      button.setAttribute('aria-expanded', String(open));
    });
  }

  function setupHero() {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    if (slides.length < 2) {
      return;
    }
    let index = 0;
    let timer = null;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        activate(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        activate(index + 1);
        start();
      });
    }
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilters() {
    const scopes = Array.from(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      const panel = scope.querySelector('[data-filter-panel]');
      const grid = scope.querySelector('[data-filter-grid]');
      if (!panel || !grid) {
        return;
      }
      const search = panel.querySelector('[data-filter-search]');
      const region = panel.querySelector('[data-filter-region]');
      const type = panel.querySelector('[data-filter-type]');
      const empty = scope.querySelector('[data-filter-empty]');
      const cards = Array.from(grid.querySelectorAll('.movie-card'));

      function apply() {
        const keyword = normalize(search && search.value);
        const regionValue = normalize(region && region.value);
        const typeValue = normalize(type && type.value);
        let visible = 0;
        cards.forEach(function (card) {
          const text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' '));
          const regionText = normalize(card.getAttribute('data-region'));
          const typeText = normalize(card.getAttribute('data-type'));
          const matched = (!keyword || text.indexOf(keyword) !== -1) &&
            (!regionValue || regionText === regionValue) &&
            (!typeValue || typeText === typeValue);
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [search, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFilters();
  });
})();
