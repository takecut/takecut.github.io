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
  setupPortfolioPriorityVideos();
  setupAdaptivePortfolioCarousel();
});



// HERO BACKGROUND — autoplay robusto para desktop/mobile
// Hotfix: evita recarregar o vídeo em todo resize do celular.
// Em mobile, a barra do navegador abre/fecha ao rolar a tela e dispara resize;
// se a gente chama video.load() nesse momento, o background dá piscada/travada.
let currentHeroBgMode = null;

function getHeroBgMode() {
  return window.matchMedia("(max-width: 768px)").matches ? "mobile" : "desktop";
}

function getActiveHeroBackgroundVideo() {
  const mode = getHeroBgMode();
  return document.querySelector(mode === "mobile" ? ".bg-video-mobile" : ".bg-video-desktop") || document.querySelector(".js-hero-bg-video");
}

function prepareHeroBackgroundVideo(video) {
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
}

function tryPlayHeroBackgroundVideo(video, shouldLoad) {
  if (!video) return;
  prepareHeroBackgroundVideo(video);

  // Só carrega no primeiro preparo/troca desktop↔mobile. Não recarrega durante scroll.
  if (shouldLoad || video.dataset.heroPrepared !== "true") {
    video.dataset.heroPrepared = "true";
    try { video.load(); } catch (e) {}
  }

  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(function () {
      video.classList.add("hero-bg-waiting-play");
    });
  }
}

function syncHeroBackgroundVideo(forceLoad) {
  const mode = getHeroBgMode();
  const activeVideo = getActiveHeroBackgroundVideo();
  const changedMode = currentHeroBgMode !== mode;
  currentHeroBgMode = mode;

  document.querySelectorAll(".js-hero-bg-video").forEach(function (video) {
    prepareHeroBackgroundVideo(video);
    if (video !== activeVideo) {
      try { video.pause(); } catch (e) {}
    }
  });

  tryPlayHeroBackgroundVideo(activeVideo, forceLoad || changedMode);
}

function setupHeroBackgroundVideo() {
  const videos = document.querySelectorAll(".js-hero-bg-video");
  if (!videos.length) return;

  syncHeroBackgroundVideo(true);

  function retryActiveHeroVideo() {
    syncHeroBackgroundVideo(false);
  }

  window.addEventListener("pageshow", retryActiveHeroVideo);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) retryActiveHeroVideo();
  });

  // Troca somente quando cruza desktop/mobile. Evita bug causado pelo resize da barra do navegador no celular.
  const breakpoint = window.matchMedia("(max-width: 768px)");
  if (typeof breakpoint.addEventListener === "function") {
    breakpoint.addEventListener("change", function () { syncHeroBackgroundVideo(true); });
  } else if (typeof breakpoint.addListener === "function") {
    breakpoint.addListener(function () { syncHeroBackgroundVideo(true); });
  }

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


// PORTFÓLIO — garante que o card "Vídeo emocional" carregue no desktop.
// Alguns navegadores deixam vídeos autoplay/preload none em espera dentro do carrossel.
function setupPortfolioPriorityVideos() {
  const priorityPortfolioVideos = document.querySelectorAll("video[data-portfolio-priority='true']");
  if (!priorityPortfolioVideos.length) return;

  function prepare(video) {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "auto";
    try { video.load(); } catch (e) {}
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        // Se o navegador economizar autoplay, ao menos o vídeo já fica preparado para aparecer.
      });
    }
  }

  priorityPortfolioVideos.forEach(prepare);

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) priorityPortfolioVideos.forEach(prepare);
  });
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
function getPortfolioCarouselStep(carousel) {
  if (!carousel) return 336;

  const card = carousel.querySelector(".portfolio-card") || carousel.querySelector(".carousel-item");
  const styles = window.getComputedStyle(carousel);
  const gap = parseFloat(styles.columnGap || styles.gap) || 16;
  const cardWidth = card ? card.getBoundingClientRect().width : 320;

  return cardWidth + gap;
}

function normalizePortfolioCarouselScroll() {
  const carousel = document.getElementById("carousel");
  if (!carousel) return;

  const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);

  // Se todos os cards couberem na tela, garante que o carrossel fique alinhado no início.
  if (maxScroll <= 2) {
    carousel.scrollTo({ left: 0, behavior: "auto" });
    return;
  }

  if (carousel.scrollLeft > maxScroll) {
    carousel.scrollTo({ left: maxScroll, behavior: "auto" });
  }
}

function setupAdaptivePortfolioCarousel() {
  const carousel = document.getElementById("carousel");
  if (!carousel) return;

  normalizePortfolioCarouselScroll();

  let resizeFrame = null;
  window.addEventListener("resize", function () {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(normalizePortfolioCarouselScroll);
  });

  window.addEventListener("load", normalizePortfolioCarouselScroll, { once: true });
}

function scrollPortfolio(direction) {
  const carousel = document.getElementById("carousel");
  if (!carousel) return;

  const itemWidth = getPortfolioCarouselStep(carousel);
  const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);

  if (maxScroll <= 2) {
    carousel.scrollTo({ left: 0, behavior: "smooth" });
    return;
  }

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
    const duration = randomBetween(4, 20);
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

// HOTFIX UNIVERSO — garante que a camada das estrelas/discos esteja visível
// mesmo quando o navegador/mobile falha na primeira montagem da camada fixa.
(function universeVisibilityWatchdog() {
  function revealUniverseLayer() {
    const starsBg = document.getElementById("starsBg");
    if (!starsBg) return;

    starsBg.style.display = "block";
    starsBg.style.visibility = "visible";
    starsBg.style.opacity = "1";
    starsBg.style.position = "fixed";
    starsBg.style.inset = "0";
    starsBg.style.width = "100vw";
    starsBg.style.height = "100vh";
    starsBg.style.pointerEvents = "none";
    starsBg.style.overflow = "hidden";
    starsBg.style.zIndex = "1";

    if (!starsBg.children.length) {
      starsBg.dataset.ready = "";
      try { createUniverse(); } catch (e) {}
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", revealUniverseLayer, { once: true });
  } else {
    revealUniverseLayer();
  }

  window.addEventListener("load", revealUniverseLayer, { once: true });
  window.addEventListener("pageshow", revealUniverseLayer);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) revealUniverseLayer();
  });

  setTimeout(revealUniverseLayer, 300);
  setTimeout(revealUniverseLayer, 1200);
})();


// ANTI DEVTOOLS
(function () {
  document.addEventListener("keydown", function (e) {
    if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73)) {
      e.preventDefault();
      return false;
    }
  });
})();
