(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === active);
        });
    }

    function startAuto() {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startAuto();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(active - 1);
            startAuto();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(active + 1);
            startAuto();
        });
    }

    showSlide(0);
    startAuto();

    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var noResult = document.querySelector('[data-no-result]');

    function filterCards() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-genre') || '',
                card.getAttribute('data-tags') || ''
            ].join(' ').toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!selectedYear || cardYear === selectedYear);
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (noResult) {
            noResult.style.display = visible ? 'none' : 'block';
        }
    }

    if (input) {
        input.addEventListener('input', filterCards);
    }
    if (year) {
        year.addEventListener('change', filterCards);
    }
})();
