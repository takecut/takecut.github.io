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

  // HERO BACKGROUND: força autoplay mudo/inline em celulares mais chatos.
  setupHeroBackgroundVideo();

  // LAZY LOAD DE VÍDEOS: carrega antes de entrar na tela para não atrasar ao tocar.
  setupSmartVideoLoading();
});



// HERO BACKGROUND — autoplay robusto para desktop/mobile
function getActiveHeroBackgroundVideo() {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  return document.querySelector(isMobile ? ".bg-video-mobile" : ".bg-video-desktop") || document.querySelector(".js-hero-bg-video");
}

function tryPlayHeroBackgroundVideo(video) {
  if (!video) return;

  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  video.controls = false;
  video.removeAttribute("controls");
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("aria-hidden", "true");
  video.preload = "auto";

  try { video.load(); } catch (e) {}

  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(function () {
      // Se o navegador bloquear autoplay, fica no poster e tenta novamente quando houver interação.
      video.classList.add("hero-bg-waiting-play");
    });
  }
}

function setupHeroBackgroundVideo() {
  const videos = document.querySelectorAll(".js-hero-bg-video");
  if (!videos.length) return;

  const activeVideo = getActiveHeroBackgroundVideo();

  videos.forEach(function (video) {
    video.controls = false;
    video.removeAttribute("controls");
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    if (video !== activeVideo) {
      try { video.pause(); } catch (e) {}
    }
  });

  tryPlayHeroBackgroundVideo(activeVideo);

  function retryActiveHeroVideo() {
    tryPlayHeroBackgroundVideo(getActiveHeroBackgroundVideo());
  }

  window.addEventListener("pageshow", retryActiveHeroVideo);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) retryActiveHeroVideo();
  });
  window.addEventListener("resize", retryActiveHeroVideo);

  // Em celulares que bloqueiam autoplay no primeiro load, qualquer toque libera sem mostrar botão nativo.
  document.addEventListener("touchstart", retryActiveHeroVideo, { once: true, passive: true });
  document.addEventListener("click", retryActiveHeroVideo, { once: true });
}

// VÍDEOS IMPORTANTES — prepara Cases e Resultados antes do usuário tocar.
function loadVideoSafely(video) {
  if (!video || video.dataset.loaded === "true") return;
  video.dataset.loaded = "true";
  video.preload = "auto";
  try { video.load(); } catch (e) {}
}

function setupSmartVideoLoading() {
  const priorityVideos = Array.prototype.slice.call(document.querySelectorAll("video[data-priority-video='true']"));
  const lazyVideos = Array.prototype.slice.call(document.querySelectorAll("video[preload='none']:not(.bg-video)"));
  const allVideos = priorityVideos.concat(lazyVideos).filter(function (video, index, list) {
    return list.indexOf(video) === index;
  });

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadVideoSafely(entry.target);
          videoObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "1200px 0px" });

    allVideos.forEach(function (video) {
      videoObserver.observe(video);
    });
  } else {
    allVideos.forEach(loadVideoSafely);
  }

  function warmUpPriorityVideos() {
    priorityVideos.forEach(loadVideoSafely);
  }

  if ("requestIdleCallback" in window) {
    requestIdleCallback(warmUpPriorityVideos, { timeout: 1800 });
  } else {
    setTimeout(warmUpPriorityVideos, 1200);
  }
}

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
  const thumb = element.querySelector(".thumb");
  const playBtn = element.querySelector(".play-btn");
  const video = element.querySelector(".video");
  if (!video) return;

  if (thumb) thumb.style.display = "none";
  if (playBtn) playBtn.style.display = "none";

  video.style.display = "block";
  video.preload = "auto";

  // Garante que o vídeo clicado tenha prioridade e evita vários sons tocando juntos.
  document.querySelectorAll("video.video").forEach(function (otherVideo) {
    if (otherVideo !== video) otherVideo.pause();
  });

  try { video.load(); } catch (e) {}

  var playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(function () {
      // Alguns celulares só liberam play após o toque terminar. Tenta de novo no próximo frame.
      requestAnimationFrame(function () {
        try { video.play(); } catch (e) {}
      });
    });
  }
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
  if (!starsBg) return false;
  if (starsBg.dataset.ready === "true" && starsBg.children.length > 0) return true;

  starsBg.innerHTML = "";
  starsBg.dataset.ready = "true";

  const isMobile = window.innerWidth <= 768;
  const starCount = isMobile ? 45 : 80;
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
    const duration = randomBetween(6, 20);
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
  return true;
}

function ensureUniverse() {
  if (createUniverse()) return;
  setTimeout(createUniverse, 250);
}

function startUniverse() {
  // Roda em mais de um momento para evitar bug mobile em que a camada fixa só aparece depois de voltar página.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureUniverse, { once: true });
  } else {
    ensureUniverse();
  }

  window.addEventListener("load", ensureUniverse, { once: true });
  window.addEventListener("pageshow", ensureUniverse);
  setTimeout(ensureUniverse, 700);
  setTimeout(ensureUniverse, 1800);

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) ensureUniverse();
  });
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
