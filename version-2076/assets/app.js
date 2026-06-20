const navButton = document.querySelector('[data-nav-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (navButton && mobileMenu) {
  navButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('is-open');
  });
}

const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
const heroDots = Array.from(document.querySelectorAll('[data-hero-dot]'));
let heroIndex = 0;
let heroTimer = null;

function showHero(index) {
  if (!heroSlides.length) {
    return;
  }
  heroIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === heroIndex);
  });
  heroDots.forEach((dot, dotIndex) => {
    dot.classList.toggle('is-active', dotIndex === heroIndex);
  });
}

function startHero() {
  if (heroSlides.length < 2) {
    return;
  }
  heroTimer = window.setInterval(() => {
    showHero(heroIndex + 1);
  }, 5200);
}

heroDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }
    showHero(index);
    startHero();
  });
});

showHero(0);
startHero();

const localFilter = document.querySelector('[data-local-filter]');
const filterCards = Array.from(document.querySelectorAll('[data-card]'));

if (localFilter && filterCards.length) {
  localFilter.addEventListener('input', () => {
    const value = localFilter.value.trim().toLowerCase();
    filterCards.forEach((card) => {
      const text = [
        card.dataset.title,
        card.dataset.genre,
        card.dataset.region,
        card.dataset.year,
        card.dataset.type
      ].join(' ').toLowerCase();
      card.classList.toggle('is-filtered-out', value && !text.includes(value));
    });
  });
}
