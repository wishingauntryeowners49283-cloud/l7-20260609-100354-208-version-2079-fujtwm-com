(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-pressed', i === index ? 'true' : 'false');
      });
    }

    function play() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    if (slides.length > 1) {
      show(0);
      play();
    }
  }

  function initImages() {
    selectAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-hidden');
      });
    });
  }

  function initFilters() {
    var cards = selectAll('[data-card]');
    var input = document.getElementById('movie-filter');
    var region = document.getElementById('filter-region');
    var type = document.getElementById('filter-type');
    var year = document.getElementById('filter-year');
    var clear = document.getElementById('filter-clear');
    var empty = document.querySelector('[data-empty]');
    if (!cards.length || (!input && !region && !type && !year)) {
      return;
    }

    function getValue(node) {
      return node ? node.value.trim().toLowerCase() : '';
    }

    function apply() {
      var q = getValue(input);
      var r = getValue(region);
      var t = getValue(type);
      var y = getValue(year);
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var match = true;

        if (q && text.indexOf(q) === -1) {
          match = false;
        }
        if (r && cardRegion.indexOf(r) === -1) {
          match = false;
        }
        if (t && cardType.indexOf(t) === -1) {
          match = false;
        }
        if (y && cardYear !== y) {
          match = false;
        }

        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });

    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        if (year) {
          year.value = '';
        }
        apply();
      });
    }

    apply();
  }

  function initHeroSearch() {
    var form = document.querySelector('[data-hero-search]');
    if (!form) {
      return;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var q = input ? input.value.trim() : '';
      var target = form.getAttribute('action') || 'search.html';
      if (q) {
        window.location.href = target + '?q=' + encodeURIComponent(q);
      } else {
        window.location.href = target;
      }
    });
  }

  function initSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var input = document.getElementById('movie-filter');
    if (q && input) {
      input.value = q;
      input.dispatchEvent(new Event('input'));
    }
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.play-overlay');
      var status = player.querySelector('.player-status');
      var streamUrl = player.getAttribute('data-play-url');
      var started = false;
      var hlsInstance = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function start() {
        if (!video || !streamUrl) {
          setStatus('播放暂时不可用');
          return;
        }
        player.classList.add('is-playing');
        setStatus('正在加载播放...');

        if (!started) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setStatus('播放连接繁忙，请稍后重试');
                player.classList.remove('is-playing');
              }
            });
          } else {
            video.src = streamUrl;
          }
          started = true;
        }

        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.then(function () {
            setStatus('正在播放');
          }).catch(function () {
            setStatus('点击视频继续播放');
            player.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!started || video.paused) {
            start();
          }
        });
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
          setStatus('正在播放');
        });
        video.addEventListener('pause', function () {
          if (started) {
            setStatus('已暂停');
          }
        });
        video.addEventListener('ended', function () {
          setStatus('播放结束');
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initImages();
    initHeroSearch();
    initSearchQuery();
    initFilters();
    initPlayers();
  });
}());
