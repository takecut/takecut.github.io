// Event listeners replace inline handlers so CSP can reject injected handlers.
(function () {
  "use strict";

  function bind(selector, eventName, handler) {
    document.querySelectorAll(selector).forEach(function (element) {
      element.addEventListener(eventName, handler);
    });
  }

  function initialize() {
    bind('.menu-toggle', 'click', function () { window.toggleMenu(); });
    bind('[data-carousel-direction]', 'click', function () {
      window.scrollPortfolio(Number(this.dataset.carouselDirection));
    });
    bind('[data-play-video]', 'click', function (event) { window.playVideo(this, event); });
    bind('[data-play-video]', 'keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.playVideo(this, event);
      }
    });
    bind('[data-close-video]', 'click', function () { window.closeVideo(); });
    bind('#searchInput', 'input', function () { window.filtrarTudo(); });
    bind('.search-btn', 'click', function () { window.filtrarTudo(); });
    bind('.filtros input[type="checkbox"]', 'change', function () { window.filtrarTudo(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
