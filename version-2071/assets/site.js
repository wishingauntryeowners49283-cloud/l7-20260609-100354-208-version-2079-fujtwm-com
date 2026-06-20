(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mainNav = document.querySelector("[data-main-nav]");
    if (menuButton && mainNav) {
      menuButton.addEventListener("click", function () {
        mainNav.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5600);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      restart();
    }

    var searchInput = document.querySelector("[data-movie-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var activeValue = "";

    function normalize(text) {
      return String(text || "").trim().toLowerCase();
    }

    function filterCards() {
      var query = normalize(searchInput ? searchInput.value : "");
      cards.forEach(function (card) {
        var source = normalize(card.getAttribute("data-search"));
        var matchedQuery = !query || source.indexOf(query) !== -1;
        var matchedFilter = !activeValue || source.indexOf(activeValue) !== -1;
        card.classList.toggle("hidden", !(matchedQuery && matchedFilter));
      });
    }

    if (searchInput && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get("q") || "";
      if (queryValue) {
        searchInput.value = queryValue;
      }
      searchInput.addEventListener("input", filterCards);
      filterCards();
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeValue = normalize(button.getAttribute("data-filter-value"));
        filterButtons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        filterCards();
      });
    });
  });
})();
