(function () {
  'use strict';

  const root = document.documentElement;
  const base = root.dataset.base || '';

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  function openSearch(query) {
    const keyword = query.trim();
    const target = keyword ? `${base}search.html?q=${encodeURIComponent(keyword)}` : `${base}search.html`;
    window.location.href = target;
  }

  qsa('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = qs('input[name="q"]', form) || qs('input[type="search"]', form);
      openSearch(input ? input.value : '');
    });
  });

  const menuToggle = qs('[data-menu-toggle]');
  const siteNav = qs('[data-site-nav]');

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      siteNav.classList.toggle('is-open');
    });
  }

  document.addEventListener('error', (event) => {
    const target = event.target;
    if (target && target.tagName === 'IMG') {
      target.classList.add('image-missing');
      target.removeAttribute('src');
    }
  }, true);

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  qsa('.nav-link').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (href.endsWith(currentFile)) {
      link.classList.add('is-active');
    }
  });

  const carousel = qs('[data-hero-carousel]');
  if (!carousel) {
    return;
  }

  const slides = qsa('[data-hero-slide]', carousel);
  const nextButton = qs('[data-hero-next]', carousel);
  const prevButton = qs('[data-hero-prev]', carousel);
  const dotsWrap = qs('[data-hero-dots]', carousel);
  let activeIndex = 0;
  let timer = null;

  function setActive(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    qsa('.hero-dot', dotsWrap).forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  function startTimer() {
    stopTimer();
    timer = window.setInterval(() => setActive(activeIndex + 1), 5200);
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (slides.length > 1 && dotsWrap) {
    slides.forEach((slide, index) => {
      const dot = document.createElement('button');
      dot.className = 'hero-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `切换到第 ${index + 1} 个推荐`);
      dot.addEventListener('click', () => {
        setActive(index);
        startTimer();
      });
      dotsWrap.appendChild(dot);
    });

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        setActive(activeIndex + 1);
        startTimer();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        setActive(activeIndex - 1);
        startTimer();
      });
    }

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    setActive(0);
    startTimer();
  }
})();
