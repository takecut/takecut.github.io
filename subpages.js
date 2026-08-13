(function () {
  "use strict";

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createUniverse() {
    const starsBg = document.getElementById("starsBg");
    if (!starsBg) return;
    if (starsBg.dataset.ready === "true" && starsBg.children.length) return;

    starsBg.innerHTML = "";
    starsBg.dataset.ready = "true";

    const isMobile = window.innerWidth <= 768;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < (isMobile ? 45 : 80); i++) {
      const star = document.createElement("div");
      star.className = "stars";
      star.style.cssText = [
        "left:" + randomBetween(0, 100).toFixed(2) + "%",
        "top:" + randomBetween(0, 100).toFixed(2) + "%",
        "animation-delay:" + randomBetween(0, 3).toFixed(2) + "s",
        "animation-duration:" + randomBetween(2, 5).toFixed(2) + "s"
      ].join(";");
      fragment.appendChild(star);
    }

    const lanes = isMobile
      ? [{ min: 46, max: 54, scaleMin: 0.88, scaleMax: 1.08 }]
      : [
          { min: 16, max: 23, scaleMin: 0.78, scaleMax: 0.96 },
          { min: 46, max: 55, scaleMin: 0.96, scaleMax: 1.18 },
          { min: 74, max: 83, scaleMin: 0.82, scaleMax: 1.05 }
        ];

    lanes.forEach(function (lane, index) {
      const duration = isMobile ? 6 : 15;
      const delay = isMobile ? -randomBetween(0, duration) : [0, 3, 6][index];
      const ufo = document.createElement("div");
      ufo.className = "ufo";
      ufo.style.cssText = [
        "left:0",
        "top:" + randomBetween(lane.min, lane.max).toFixed(1) + "%",
        "animation-delay:" + delay.toFixed(1) + "s",
        "--ufo-duration:" + duration.toFixed(1) + "s",
        "--ufo-scale:" + randomBetween(lane.scaleMin, lane.scaleMax).toFixed(2),
        "--ufo-start-x:" + randomBetween(-38, -24).toFixed(1) + "vw",
        "--ufo-mid-x:" + randomBetween(32, 45).toFixed(1) + "vw",
        "--ufo-mid-y:" + randomBetween(-3, 3).toFixed(1) + "vh",
        "--ufo-late-x:" + randomBetween(72, 86).toFixed(1) + "vw",
        "--ufo-late-y:" + randomBetween(-3, 3).toFixed(1) + "vh",
        "--ufo-end-x:" + randomBetween(118, 134).toFixed(1) + "vw",
        "--ufo-end-y:" + randomBetween(-3, 3).toFixed(1) + "vh",
        "--ufo-rotate-start:" + randomBetween(-8, -3).toFixed(1) + "deg",
        "--ufo-rotate-mid:" + randomBetween(-2, 4).toFixed(1) + "deg",
        "--ufo-rotate-late:" + randomBetween(-4, 3).toFixed(1) + "deg",
        "--ufo-rotate-end:" + randomBetween(3, 8).toFixed(1) + "deg"
      ].join(";");
      fragment.appendChild(ufo);
    });

    starsBg.appendChild(fragment);
  }

  window.toggleMenu = function () {
    const nav = document.querySelector(".nav-links");
    const toggle = document.querySelector(".menu-toggle");
    if (!nav || !toggle) return;
    const isOpen = nav.classList.toggle("active");
    toggle.setAttribute("aria-expanded", String(isOpen));
  };

  function initializePage() {
    createUniverse();
    document.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        const nav = document.querySelector(".nav-links");
        const toggle = document.querySelector(".menu-toggle");
        if (nav) nav.classList.remove("active");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage, { once: true });
  } else {
    initializePage();
  }

  window.addEventListener("pageshow", createUniverse);
})();
