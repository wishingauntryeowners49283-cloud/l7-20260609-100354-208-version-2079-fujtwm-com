(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupHeader() {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 10);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }
  }

  function setupSearchForms() {
    document.querySelectorAll(".search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        input.value = input.value.trim();
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var active = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }

    var keyword = panel.querySelector("[data-filter-keyword]");
    var region = panel.querySelector("[data-filter-region]");
    var year = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var noResults = document.querySelector("[data-no-results]");

    function includesText(value, query) {
      return String(value || "").toLowerCase().indexOf(query) !== -1;
    }

    function applyFilters() {
      var query = keyword ? keyword.value.trim().toLowerCase() : "";
      var selectedRegion = region ? region.value : "";
      var selectedYear = year ? year.value : "";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();

        var matchKeyword = !query || includesText(text, query);
        var matchRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
        var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var isVisible = matchKeyword && matchRegion && matchYear;

        card.style.display = isVisible ? "" : "none";
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    [keyword, region, year].forEach(function (field) {
      if (field) {
        field.addEventListener("input", applyFilters);
        field.addEventListener("change", applyFilters);
      }
    });
  }

  function createCard(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      '<a class="movie-card" href="' + escapeHtml(item.url) + '" data-title="' + escapeHtml(item.title) + '" data-region="' + escapeHtml(item.region) + '" data-year="' + escapeHtml(item.year) + '" data-type="' + escapeHtml(item.type) + '" data-tags="' + escapeHtml(item.genre + " " + item.tags.join(" ")) + '">',
      "<article>",
      '<div class="card-cover">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<div class="card-shade"><span class="play-pill">▶</span></div>',
      '<span class="card-region">' + escapeHtml(item.region) + '</span>',
      "</div>",
      '<div class="card-body">',
      "<h3>" + escapeHtml(item.title) + "</h3>",
      "<p>" + escapeHtml(item.oneLine) + "</p>",
      '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.category) + '</span></div>',
      '<div class="card-tags">' + tags + '</div>',
      "</div>",
      "</article>",
      "</a>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var root = document.querySelector("[data-search-results]");
    if (!root || !window.SEARCH_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-input]");
    var heading = document.querySelector("[data-search-heading]");

    if (input) {
      input.value = query;
    }

    var normalized = query.toLowerCase();
    var results = window.SEARCH_MOVIES.filter(function (item) {
      if (!normalized) {
        return true;
      }
      return [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.oneLine,
        item.tags.join(" ")
      ].join(" ").toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 120);

    if (heading) {
      heading.textContent = query ? "搜索结果：" + query : "片库搜索";
    }

    if (!results.length) {
      root.innerHTML = '<div class="no-results is-visible">没有找到匹配内容，可以更换关键词继续搜索。</div>';
      return;
    }

    root.innerHTML = '<div class="movie-grid">' + results.map(createCard).join("") + "</div>";
  }

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playerOverlay");
    var hlsInstance = null;
    var loaded = false;

    if (!video) {
      return;
    }

    function loadAndPlay() {
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(sourceUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
        loaded = true;
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", loadAndPlay);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        loadAndPlay();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupHeader();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
