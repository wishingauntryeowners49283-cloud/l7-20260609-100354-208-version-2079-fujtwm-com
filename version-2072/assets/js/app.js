(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });

        show(0);

        if (slides.length > 1) {
            setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var scope = panel.parentElement || document;
        var input = panel.querySelector('[data-filter-input]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var items = Array.prototype.slice.call(scope.querySelectorAll('.filter-item'));

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var typeValue = typeSelect ? typeSelect.value : '';
            var yearValue = yearSelect ? yearSelect.value : '';

            items.forEach(function (item) {
                var text = item.getAttribute('data-search') || '';
                var itemType = item.getAttribute('data-type') || '';
                var itemYear = item.getAttribute('data-year') || '';
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (typeValue && itemType !== typeValue) {
                    matched = false;
                }

                if (yearValue && itemYear !== yearValue) {
                    matched = false;
                }

                item.classList.toggle('hidden-by-filter', !matched);
            });
        }

        [input, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });

    document.querySelectorAll('.movie-player').forEach(function (player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('.play-cover');
        var stream = player.getAttribute('data-stream');
        var hlsPlayer = null;

        if (!video || !stream) {
            return;
        }

        function prepare() {
            if (video.getAttribute('data-ready') === 'yes') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsPlayer = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsPlayer.loadSource(stream);
                hlsPlayer.attachMedia(video);
            } else {
                video.src = stream;
            }

            video.setAttribute('data-ready', 'yes');
        }

        function start() {
            prepare();
            video.controls = true;

            if (cover) {
                cover.classList.add('hidden');
            }

            var promise = video.play();

            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsPlayer) {
                hlsPlayer.destroy();
            }
        });
    });
})();
