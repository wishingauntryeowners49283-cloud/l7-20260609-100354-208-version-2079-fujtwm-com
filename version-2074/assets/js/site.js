(function () {
  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function openMobileNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var links = document.querySelector('[data-nav-links]');

    if (!toggle || !links) {
      return;
    }

    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  function initMovieFilters() {
    var searchBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));

    searchBlocks.forEach(function (block) {
      var input = block.querySelector('[data-search-input]');
      var typeSelect = block.querySelector('[data-filter-type]');
      var yearSelect = block.querySelector('[data-filter-year]');
      var sortSelect = block.querySelector('[data-sort-select]');
      var targetSelector = block.getAttribute('data-card-filter');
      var target = document.querySelector(targetSelector);
      var resultCount = document.querySelector('[data-result-count]');
      var emptyState = document.querySelector('[data-empty-state]');

      if (!target) {
        return;
      }

      var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));
      var params = new URLSearchParams(window.location.search);
      var keywordFromUrl = params.get('q');

      if (input && keywordFromUrl) {
        input.value = keywordFromUrl;
      }

      function cardMatches(card) {
        var keyword = normalize(input ? input.value : '');
        var typeValue = normalize(typeSelect ? typeSelect.value : '');
        var yearValue = normalize(yearSelect ? yearSelect.value : '');
        var searchText = normalize(card.getAttribute('data-search'));
        var typeText = normalize(card.getAttribute('data-type'));
        var yearText = normalize(card.getAttribute('data-year'));

        if (keyword && searchText.indexOf(keyword) === -1) {
          return false;
        }

        if (typeValue && typeText.indexOf(typeValue) === -1) {
          return false;
        }

        if (yearValue && yearText !== yearValue) {
          return false;
        }

        return true;
      }

      function sortCards(visibleCards) {
        if (!sortSelect) {
          return visibleCards;
        }

        var mode = sortSelect.value;
        var sorted = visibleCards.slice();

        sorted.sort(function (a, b) {
          if (mode === 'views') {
            return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
          }

          if (mode === 'rating') {
            return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
          }

          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });

        return sorted;
      }

      function applyFilter() {
        var visibleCards = cards.filter(cardMatches);
        var sortedVisibleCards = sortCards(visibleCards);
        var fragment = document.createDocumentFragment();

        sortedVisibleCards.forEach(function (card) {
          card.hidden = false;
          fragment.appendChild(card);
        });

        cards.forEach(function (card) {
          if (visibleCards.indexOf(card) === -1) {
            card.hidden = true;
            fragment.appendChild(card);
          }
        });

        target.appendChild(fragment);

        if (resultCount) {
          resultCount.textContent = String(visibleCards.length);
        }

        if (emptyState) {
          emptyState.classList.toggle('is-visible', visibleCards.length === 0);
        }
      }

      [input, typeSelect, yearSelect, sortSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      applyFilter();
    });
  }

  function initShareButtons() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-share]'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var title = document.title;
        var url = window.location.href;

        if (navigator.share) {
          navigator.share({ title: title, url: url }).catch(function () {});
          return;
        }

        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            button.textContent = '链接已复制';
            window.setTimeout(function () {
              button.textContent = '分享页面';
            }, 1800);
          });
        }
      });
    });
  }

  function initBackToTop() {
    var button = document.querySelector('[data-back-to-top]');

    if (!button) {
      return;
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    openMobileNavigation();
    initHeroSlider();
    initMovieFilters();
    initShareButtons();
    initBackToTop();
  });
})();
