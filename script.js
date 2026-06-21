// LOADING SCREEN
// Aparece somente uma vez no mobile. Depois disso, o usuário pode voltar ao site sem ver a tela de renderização de novo.
(function () {
  var isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.matchMedia("(max-width: 768px)").matches;
  var storageKey = "takecutLoadingScreenSeen";
  var loadScreen = document.getElementById("loadingScreen");
  var loadBar = document.getElementById("loadingBar");

  function storageGet(key) {
    try { return window.localStorage.getItem(key); }
    catch (e) { return null; }
  }

  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); }
    catch (e) { /* Se o navegador bloquear storage, o site continua funcionando. */ }
  }

  function removeLoadingScreen() {
    if (loadScreen) loadScreen.remove();
  }

  // Desktop não usa loading screen. Mobile só usa na primeira visita.
  if (!loadScreen || !loadBar || !isMobileDevice || storageGet(storageKey) === "true") {
    removeLoadingScreen();
    return;
  }

  storageSet(storageKey, "true");
  loadScreen.classList.add("active");

  var progress = 0;
  var finished = false;
  var interval = setInterval(function () {
    var remaining = 100 - progress;
    var step = Math.max(1, remaining * 0.06);
    progress = Math.min(progress + step, 94);
    loadBar.style.width = progress + "%";
  }, 60);

  // Não espera TODAS as imagens do site, porque isso fazia logos e imagens distantes segurarem o loader.
  function waitForCriticalImages() {
    var selectors = ["#loadingScreen img", ".navbar .logo img", ".showreel .thumb"];
    var images = [];

    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (img) {
        if (images.indexOf(img) === -1) images.push(img);
      });
    });

    var promises = images.map(function (img) {
      if (img.complete) return Promise.resolve();
      return new Promise(function (resolve) {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    return Promise.all(promises);
  }

  function finishLoading() {
    if (finished) return;
    finished = true;
    clearInterval(interval);
    loadBar.style.width = "100%";

    setTimeout(function () {
      loadScreen.style.opacity = "0";
      loadScreen.style.transition = "opacity 0.5s ease";
      setTimeout(removeLoadingScreen, 500);
    }, 260);
  }

  window.addEventListener("load", function () {
    waitForCriticalImages().then(finishLoading);
  }, { once: true });

  // Segurança: se algo travar, fecha mesmo assim.
  setTimeout(finishLoading, 3500);
})();

// MENU
function toggleMenu() {
  document.querySelector(".nav-links").classList.toggle("active");
}

document.addEventListener("DOMContentLoaded", function () {
  // Fecha menu ao clicar em link
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
      document.querySelector(".nav-links").classList.remove("active");
    });
  });

  // LAZY LOAD DE VÍDEOS: só carrega quando entra na tela
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const video = entry.target;
          // Só inicia se ainda não carregou
          if (video.readyState === 0) {
            video.load();
          }
          videoObserver.unobserve(video);
        }
      });
    }, { rootMargin: "200px" });

    // Observa todos os vídeos com preload="none" exceto o bg do hero
    document.querySelectorAll("video[preload='none']:not(.bg-video)").forEach(function (v) {
      videoObserver.observe(v);
    });
  }
});

// MODAL
function openVideo(src) {
  const modal = document.getElementById("videoModal");
  const video = document.getElementById("modalVideo");
  modal.style.display = "flex";
  video.src = src;
  video.play();
}

function closeVideo() {
  const modal = document.getElementById("videoModal");
  const video = document.getElementById("modalVideo");
  modal.style.display = "none";
  video.pause();
  video.src = "";
}

// PLAY INLINE
function playVideo(element) {
  element.querySelector(".thumb").style.display = "none";
  element.querySelector(".play-btn").style.display = "none";
  const video = element.querySelector(".video");
  video.style.display = "block";
  video.play();
}

// CARROSSEL
function scrollPortfolio(direction) {
  const carousel = document.getElementById("carousel");
  const item = carousel.querySelector(".carousel-item");
  const itemWidth = item ? item.offsetWidth + 16 : 336;
  const maxScroll = carousel.scrollWidth - carousel.clientWidth;
  if (direction === -1 && carousel.scrollLeft <= 0) {
    carousel.scrollTo({ left: maxScroll, behavior: "smooth" });
    return;
  }
  if (direction === 1 && carousel.scrollLeft >= maxScroll - 10) {
    carousel.scrollTo({ left: 0, behavior: "smooth" });
    return;
  }
  carousel.scrollBy({ left: direction * itemWidth, behavior: "smooth" });
}

// UNIVERSO DE FUNDO
// No mobile reduz estrelas pela metade para poupar CPU
function createUniverse() {
  const starsBg = document.getElementById("starsBg");
  if (!starsBg || starsBg.dataset.ready === "true") return;
  starsBg.dataset.ready = "true";

  const isMobile = window.innerWidth <= 768;
  const starCount = isMobile ? 38 : 80;
  const ufoCount = isMobile ? 1 : 3;

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("div");
    star.className = "stars";
    star.style.cssText =
      "left:" + (Math.random() * 100) + "%;top:" + (Math.random() * 100) +
      "%;animation-delay:" + (Math.random() * 3) + "s;animation-duration:" +
      (Math.random() * 3 + 2) + "s";
    fragment.appendChild(star);
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  const ufoLanes = isMobile
    ? [{ min: 46, max: 54 }]
    : [
        { min: 34, max: 40 },
        { min: 48, max: 56 },
        { min: 62, max: 68 }
      ];

  for (let i = 0; i < ufoCount; i++) {
    const ufo = document.createElement("div");
    const lane = ufoLanes[i % ufoLanes.length];
    const duration = randomBetween(12, 20);
    const scale = randomBetween(0.78, 1.18).toFixed(2);
    const phaseDelay = isMobile
      ? -randomBetween(0, duration)
      : -((duration / ufoCount) * i + randomBetween(0, 1.8));

    ufo.className = "ufo";
    ufo.style.cssText = [
      "left:0",
      "top:" + randomBetween(lane.min, lane.max).toFixed(1) + "%",
      "animation-delay:" + phaseDelay.toFixed(1) + "s",
      "--ufo-duration:" + duration.toFixed(1) + "s",
      "--ufo-scale:" + scale,
      "--ufo-start-x:" + randomBetween(-36, -22).toFixed(1) + "vw",
      "--ufo-mid-x:" + randomBetween(30, 44).toFixed(1) + "vw",
      "--ufo-mid-y:" + randomBetween(-6, 6).toFixed(1) + "vh",
      "--ufo-late-x:" + randomBetween(68, 84).toFixed(1) + "vw",
      "--ufo-late-y:" + randomBetween(-4, 5).toFixed(1) + "vh",
      "--ufo-end-x:" + randomBetween(114, 130).toFixed(1) + "vw",
      "--ufo-end-y:" + randomBetween(-4, 5).toFixed(1) + "vh",
      "--ufo-rotate-start:" + randomBetween(-8, -3).toFixed(1) + "deg",
      "--ufo-rotate-mid:" + randomBetween(-2, 4).toFixed(1) + "deg",
      "--ufo-rotate-late:" + randomBetween(-4, 3).toFixed(1) + "deg",
      "--ufo-rotate-end:" + randomBetween(3, 8).toFixed(1) + "deg"
    ].join(";");

    fragment.appendChild(ufo);
  }

  starsBg.appendChild(fragment);
}

function startUniverse() {
  // Antes era no window.load. Isso atrasava estrelas/nave no mobile.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createUniverse, { once: true });
  } else {
    createUniverse();
  }
}

startUniverse();

// ANTI DEVTOOLS
(function () {
  document.addEventListener("keydown", function (e) {
    if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73)) {
      e.preventDefault();
      return false;
    }
  });
})();
