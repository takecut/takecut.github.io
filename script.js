// LOADING SCREEN
// Mobile: tela de renderização em tela cheia, sem ficar lenta demais e sem flash entre o loading e o site.
(function () {
  var isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.matchMedia("(max-width: 768px)").matches;
  var storageKey = "takecutLoadingScreenSeen_20260706-final-cache-bust";
  var loadScreen = document.getElementById("loadingScreen");
  var loadBar = document.getElementById("loadingBar");
  var root = document.documentElement;

  // Tempo suficiente para parecer premium, mas sem irritar o usuário.
  var MIN_DISPLAY_TIME = 3000;
  var MAX_DISPLAY_TIME = 6500;
  var VIDEO_WAIT_LIMIT = 3800;

  function storageGet(key) {
    try { return window.localStorage.getItem(key); }
    catch (e) { return null; }
  }

  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); }
    catch (e) { /* Se o navegador bloquear storage, o site continua funcionando. */ }
  }

  function lockPageBehindLoading() {
    root.classList.add("takecut-loading-active");
    if (document.body) document.body.classList.add("takecut-loading-active");
  }

  function unlockPageBehindLoading() {
    root.classList.remove("takecut-loading-active");
    if (document.body) document.body.classList.remove("takecut-loading-active");
  }

  function removeLoadingScreen() {
    if (loadScreen) loadScreen.remove();
  }

  // Desktop não usa loading screen. Mobile sempre mostra o loading antes do site.
  // Não usamos localStorage aqui, porque o bug vinha justamente do site aparecer em visitas seguintes.
  if (!loadScreen || !loadBar || !isMobileDevice) {
    unlockPageBehindLoading();
    removeLoadingScreen();
    return;
  }

  lockPageBehindLoading();
  loadScreen.classList.add("active");
  loadScreen.removeAttribute("hidden");

  var startedAt = Date.now();
  var progress = 0;
  var finished = false;

  // Progresso com ritmo bonito, mas mais rápido que a versão anterior.
  var interval = setInterval(function () {
    var target = 90;
    var remaining = target - progress;
    var step = Math.max(0.45, remaining * 0.05);
    progress = Math.min(progress + step, target);
    loadBar.style.width = progress.toFixed(1) + "%";
  }, 75);

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function waitForWindowLoad() {
    if (document.readyState === "complete") return Promise.resolve();
    return new Promise(function (resolve) {
      window.addEventListener("load", resolve, { once: true });
      setTimeout(resolve, 2600);
    });
  }

  function waitForImage(img) {
    if (!img || img.complete) return Promise.resolve();
    return new Promise(function (resolve) {
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", resolve, { once: true });
      setTimeout(resolve, 2200);
    });
  }

  function getActiveHeroBackgroundVideoForLoading() {
    var isMobile = window.matchMedia("(max-width: 768px)").matches;
    return document.querySelector(isMobile ? ".bg-video-mobile" : ".bg-video-desktop") || document.querySelector(".js-hero-bg-video");
  }

  function waitForHeroBackgroundVideo() {
    var video = getActiveHeroBackgroundVideoForLoading();
    if (!video) return Promise.resolve();

    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    // HAVE_CURRENT_DATA já evita abrir com tela preta, sem obrigar a esperar o vídeo inteiro.
    if (video.readyState >= 2) return Promise.resolve();

    return new Promise(function (resolve) {
      var done = false;
      var timeout = setTimeout(finish, VIDEO_WAIT_LIMIT);

      function finish() {
        if (done) return;
        done = true;
        clearTimeout(timeout);
        video.removeEventListener("loadeddata", finish);
        video.removeEventListener("canplay", finish);
        video.removeEventListener("canplaythrough", finish);
        video.removeEventListener("error", finish);
        resolve();
      }

      video.addEventListener("loadeddata", finish, { once: true });
      video.addEventListener("canplay", finish, { once: true });
      video.addEventListener("canplaythrough", finish, { once: true });
      video.addEventListener("error", finish, { once: true });

      try { video.load(); } catch (e) {}
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () { /* O toque do usuário libera depois, se o navegador bloquear. */ });
      }
    });
  }

  function waitForCriticalAssets() {
    var selectors = [
      "#loadingScreen img",
      ".navbar .logo img",
      ".showreel .thumb"
    ];

    var imagePromises = [];
    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (el.tagName === "IMG") imagePromises.push(waitForImage(el));
      });
    });

    return Promise.all(imagePromises.concat([
      waitForWindowLoad(),
      waitForHeroBackgroundVideo()
    ]));
  }

  function revealPageBehindOverlay(callback) {
    // Primeiro libera o site ATRÁS do loading ainda opaco.
    // Isso evita o flash onde aparecem só estrelas/disco por alguns milésimos.
    unlockPageBehindLoading();

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        setTimeout(callback, 80);
      });
    });
  }

  function finishLoading() {
    if (finished) return;
    finished = true;
    clearInterval(interval);

    var elapsed = Date.now() - startedAt;
    var remainingMinimum = Math.max(0, MIN_DISPLAY_TIME - elapsed);

    wait(remainingMinimum).then(function () {
      loadBar.style.width = "100%";

      setTimeout(function () {
        revealPageBehindOverlay(function () {
          loadScreen.classList.add("done");
          loadScreen.style.opacity = "0";
          loadScreen.style.pointerEvents = "none";
          loadScreen.style.transition = "opacity 0.52s ease";

          setTimeout(removeLoadingScreen, 620);
        });
      }, 320);
    });
  }

  waitForCriticalAssets().then(finishLoading);

  // Segurança: se a rede estiver ruim demais, não prende o usuário para sempre.
  setTimeout(finishLoading, MAX_DISPLAY_TIME);
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
  setupDesktopHeroVideoLoopHotfix();

  // LAZY LOAD DE VÍDEOS: carrega antes de entrar na tela para não atrasar ao tocar.
  setupSmartVideoLoading();
  setupPortfolioPriorityVideos();
  setupAdaptivePortfolioCarousel();
  setupTabletPortfolioVideoPreparation();
  setupPlayableVideoControlsGuard();
  setupMobileCardReveal();
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

  var isDesktopHero = window.matchMedia && window.matchMedia("(min-width: 769px)").matches;

  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.controls = false;
  video.disablePictureInPicture = true;
  video.preload = "auto";

  // Desktop: Opera costuma exibir overlay quando o loop nativo reinicia.
  // Por isso, no desktop o loop fica manual; no mobile o loop nativo permanece.
  video.loop = !isDesktopHero;
  if (isDesktopHero) {
    video.removeAttribute("loop");
  } else {
    video.setAttribute("loop", "");
  }

  video.removeAttribute("controls");
  video.setAttribute("muted", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("disablepictureinpicture", "");
  video.setAttribute("disableremoteplayback", "");
  video.setAttribute("aria-hidden", "true");
  video.setAttribute("tabindex", "-1");
  video.setAttribute("controlslist", "nodownload noremoteplayback nofullscreen noplaybackrate");

  if (video.controlsList && typeof video.controlsList.add === "function") {
    try {
      video.controlsList.add("nodownload");
      video.controlsList.add("noremoteplayback");
      video.controlsList.add("nofullscreen");
      video.controlsList.add("noplaybackrate");
    } catch (e) {}
  }

  video.style.pointerEvents = "none";
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
function prepareInlineVideoForPlay(video) {
  if (!video) return;

  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.controls = true;
  video.preload = "auto";
  video.style.display = "block";

  // Não força load() toda vez no clique: em alguns celulares isso resetava o vídeo
  // e fazia o play ficar preso no primeiro frame/thumbnail.
  if (video.dataset.loaded !== "true") {
    loadVideoSafely(video);
  }
}

function tryPlayInlineVideo(video) {
  if (!video) return;

  var playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(function () {
      // Se o navegador bloquear mesmo após o toque, mantém os controles visíveis para o usuário iniciar manualmente.
    });
  }
}

function requestVideoFullscreen(video) {
  if (!video) return;

  var isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.matchMedia("(max-width: 768px)").matches;
  if (!isMobileDevice) return;

  try {
    if (typeof video.webkitEnterFullscreen === "function") {
      video.webkitEnterFullscreen();
      return;
    }

    var requestFullscreen =
      video.requestFullscreen ||
      video.webkitRequestFullscreen ||
      video.msRequestFullscreen ||
      video.mozRequestFullScreen;

    if (typeof requestFullscreen === "function") {
      var fullscreenPromise = requestFullscreen.call(video);
      if (fullscreenPromise && typeof fullscreenPromise.catch === "function") {
        fullscreenPromise.catch(function () {
          // Nem todo navegador permite fullscreen programático; nesse caso o vídeo fica com controles nativos.
        });
      }
    }
  } catch (e) {
    // Fullscreen é melhoria progressiva. Se falhar, o vídeo continua tocando normal.
  }
}

function setupPlayableVideoControlsGuard() {
  document.querySelectorAll(".video-box .video").forEach(function (video) {
    ["click", "touchstart", "pointerdown"].forEach(function (eventName) {
      video.addEventListener(eventName, function (event) {
        // Impede que o toque nos controles do vídeo suba para a div com onclick=playVideo().
        // Sem isso, ao pausar, o card recebia o clique e mandava o vídeo tocar de novo.
        event.stopPropagation();
      }, { passive: true });
    });
  });
}

function playVideo(element, clickEvent) {
  if (clickEvent && clickEvent.target && clickEvent.target.tagName === "VIDEO") return;

  const thumb = element.querySelector(".thumb");
  const playBtn = element.querySelector(".play-btn");
  const video = element.querySelector(".video");
  if (!video) return;

  element.classList.add("is-video-open");

  if (thumb) thumb.style.display = "none";
  if (playBtn) playBtn.style.display = "none";

  prepareInlineVideoForPlay(video);

  // Garante que o vídeo clicado tenha prioridade e evita vários sons tocando juntos.
  document.querySelectorAll("video.video").forEach(function (otherVideo) {
    if (otherVideo !== video) otherVideo.pause();
  });

  tryPlayInlineVideo(video);
  requestVideoFullscreen(video);
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
    ? [
        // Mobile continua com apenas 1 disco no centro para não poluir a tela pequena.
        { min: 46, max: 54, scaleMin: 0.88, scaleMax: 1.08 }
      ]
    : [
        // Desktop: topo, meio e baixo com distância visual maior entre eles.
        { min: 16, max: 23, scaleMin: 0.78, scaleMax: 0.96 }, // topo
        { min: 46, max: 55, scaleMin: 0.96, scaleMax: 1.18 }, // meio
        { min: 74, max: 83, scaleMin: 0.82, scaleMax: 1.05 }  // baixo
      ];

  function createUfoElement(lane, duration, animationDelay) {
    const ufo = document.createElement("div");
    const scale = randomBetween(lane.scaleMin, lane.scaleMax).toFixed(2);

    ufo.className = "ufo";
    ufo.style.cssText = [
      "left:0",
      "top:" + randomBetween(lane.min, lane.max).toFixed(1) + "%",
      "animation-delay:" + animationDelay.toFixed(1) + "s",
      "--ufo-duration:" + duration.toFixed(1) + "s",
      "--ufo-scale:" + scale,
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

    return ufo;
  }

  if (isMobile) {
    const mobileDuration = 6;
    const mobileUfo = createUfoElement(
      ufoLanes[0],
      mobileDuration,
      -randomBetween(0, mobileDuration)
    );

    fragment.appendChild(mobileUfo);
    starsBg.appendChild(fragment);
    return true;
  }

  // Desktop: os 3 discos ficam ativos na mesma tela, mas entram em momentos diferentes.
  // Ordem fixa: topo entra primeiro, meio entra 3s depois, baixo entra 3s depois do meio.
  const desktopDuration = 15;
  const desktopDelays = [0, 3, 6];

  for (let i = 0; i < ufoLanes.length; i++) {
    const ufo = createUfoElement(ufoLanes[i], desktopDuration, desktopDelays[i]);
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


// MOBILE: revela o restante dos cards por seta no primeiro card da seção.
function setupMobileCardReveal() {
  const breakpoint = window.matchMedia("(max-width: 768px)");
  const groups = [
    {
      gridSelector: "#how-it-works .steps-grid",
      cardSelector: "article",
      label: "Como funciona"
    },
    {
      gridSelector: "#nichos .niche-grid",
      cardSelector: "a",
      ignoreSelector: ".niche-desktop-only",
      label: "Páginas por nicho"
    },
    {
      gridSelector: "#bastidores .process-steps",
      cardSelector: ".process-step",
      label: "Por trás da edição"
    },
    {
      gridSelector: ".testimonials .google-reviews-grid",
      cardSelector: ".google-review-card",
      label: "Quem já confiou na Take Cut"
    },
    {
      gridSelector: "#faq .faq-review-grid",
      cardSelector: ".faq-card",
      label: "FAQ"
    }
  ];

  function getDirectCards(grid, selector) {
    return Array.prototype.slice.call(grid.children).filter(function (child) {
      return child.matches(selector);
    });
  }

  function getEligibleCards(grid, config) {
    return getDirectCards(grid, config.cardSelector).filter(function (card) {
      return !config.ignoreSelector || !card.matches(config.ignoreSelector);
    });
  }

  function ensureRevealButton(firstCard, grid, config) {
    var button = Array.prototype.slice.call(firstCard.children).find(function (child) {
      return child.classList && child.classList.contains("mobile-reveal-arrow");
    });

    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "mobile-reveal-arrow";
      button.innerHTML = '<span aria-hidden="true"></span>';
      firstCard.appendChild(button);

      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        var willExpand = !grid.classList.contains("is-expanded");
        grid.classList.toggle("is-expanded");

        // Anima somente quando o usuário revela os cards, não em updates automáticos.
        if (willExpand) grid.dataset.animateReveal = "true";

        updateGroup(config);
      });
    }

    var expanded = grid.classList.contains("is-expanded");
    button.setAttribute("aria-expanded", expanded ? "true" : "false");
    button.setAttribute("aria-label", expanded ? "Ocultar cards de " + config.label : "Mostrar mais cards de " + config.label);
  }

  function updateGroup(config) {
    const grid = document.querySelector(config.gridSelector);
    if (!grid) return;

    const allCards = getDirectCards(grid, config.cardSelector);
    const eligibleCards = getEligibleCards(grid, config);
    if (eligibleCards.length < 2) return;

    grid.classList.add("mobile-collapsible-grid");

    allCards.forEach(function (card) {
      card.classList.add("mobile-collapse-card");
      card.classList.remove("is-first-collapsible-card", "is-collapsible-hidden");
    });

    const firstCard = eligibleCards[0];
    firstCard.classList.add("is-first-collapsible-card");
    ensureRevealButton(firstCard, grid, config);

    const expanded = grid.classList.contains("is-expanded");
    const shouldAnimateReveal = grid.dataset.animateReveal === "true";

    eligibleCards.forEach(function (card, index) {
      card.style.setProperty("--mobile-reveal-order", String(Math.max(index - 1, 0)));

      if (breakpoint.matches && !expanded && index > 0) {
        card.classList.add("is-collapsible-hidden");
        card.classList.remove("is-collapsible-revealed");
      } else {
        card.classList.remove("is-collapsible-hidden");

        if (breakpoint.matches && expanded && shouldAnimateReveal && index > 0) {
          card.classList.remove("is-collapsible-revealed");

          // Reinicia o keyframe mesmo se o usuário fechar e abrir de novo.
          void card.offsetWidth;
          card.classList.add("is-collapsible-revealed");
        } else if (!expanded || !breakpoint.matches) {
          card.classList.remove("is-collapsible-revealed");
        }
      }
    });

    if (shouldAnimateReveal) delete grid.dataset.animateReveal;
  }

  function updateAllGroups() {
    groups.forEach(updateGroup);
  }

  updateAllGroups();

  if (typeof breakpoint.addEventListener === "function") {
    breakpoint.addEventListener("change", updateAllGroups);
  } else if (typeof breakpoint.addListener === "function") {
    breakpoint.addListener(updateAllGroups);
  }

  window.addEventListener("pageshow", updateAllGroups);
}


// ANTI DEVTOOLS
(function () {
  document.addEventListener("keydown", function (e) {
    if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73)) {
      e.preventDefault();
      return false;
    }
  });
})();

// TAKE CUT — iPad portfolio video preparation 20260706
// Prepara os vídeos do carrossel no tablet para evitar o flash/recorte antes do metadata carregar.
function setupTabletPortfolioVideoPreparation() {
  if (!window.matchMedia) return;

  var isTablet = window.matchMedia("(min-width: 769px) and (max-width: 1366px)").matches ||
                 window.matchMedia("(min-width: 769px) and (hover: none) and (pointer: coarse)").matches;
  if (!isTablet) return;

  var videos = document.querySelectorAll("#portfolioCarousel video, .portfolio-page-card.is-vertical video");
  videos.forEach(function (video) {
    video.muted = video.hasAttribute("muted") ? video.muted : video.muted;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.style.objectFit = "contain";
    video.style.objectPosition = "center center";
    video.style.backgroundColor = "#080809";
    try { video.load(); } catch (e) {}
  });
}

// TAKE CUT — HOTFIX DESKTOP 20260710 ATUALIZADO
// Opera pode exibir um overlay nativo quando o vídeo de background reinicia.
// Este loop manual reinicia antes do último frame e mantém o vídeo sem controles nativos.
function setupDesktopHeroVideoLoopHotfix() {
  if (!window.matchMedia || !window.matchMedia("(min-width: 769px)").matches) return;

  function safePlay(video) {
    if (!video) return;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  function harden(video) {
    if (!video) return;

    prepareHeroBackgroundVideo(video);
    video.loop = false;
    video.removeAttribute("loop");

    if (video.dataset.takecutDesktopLoopHotfix === "true") {
      safePlay(video);
      return;
    }

    video.dataset.takecutDesktopLoopHotfix = "true";

    video.addEventListener("timeupdate", function () {
      if (!window.matchMedia("(min-width: 769px)").matches) return;
      if (!video.duration || !isFinite(video.duration)) return;

      var remaining = video.duration - video.currentTime;
      if (remaining > 0 && remaining < 0.14) {
        try {
          video.currentTime = 0.06;
        } catch (e) {}
        safePlay(video);
      }
    }, { passive: true });

    video.addEventListener("ended", function () {
      if (!window.matchMedia("(min-width: 769px)").matches) return;
      try {
        video.currentTime = 0.06;
      } catch (e) {}
      safePlay(video);
    });

    safePlay(video);
  }

  document.querySelectorAll(".js-hero-bg-video, .bg-video").forEach(harden);
}

// Reaplica após o DOMContentLoaded porque o setup original também prepara o hero.
(function () {
  function applyDesktopHeroVideoLoopHotfix() {
    setupDesktopHeroVideoLoopHotfix();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(applyDesktopHeroVideoLoopHotfix, 0);
    setTimeout(applyDesktopHeroVideoLoopHotfix, 350);
  });

  window.addEventListener("pageshow", applyDesktopHeroVideoLoopHotfix);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) applyDesktopHeroVideoLoopHotfix();
  });
})();

// TAKE CUT — Promo após 3 minutos + dica de orientação mobile 20260714
(function () {
  var PROMO_DELAY_MS = 180000;
  var PROMO_COOLDOWN_MS = 12 * 60 * 60 * 1000;
  var promoKey = "takecutPromoOfferSeen_v20260714";
  var orientKey = "takecutOrientationHintSeen_v20260714";

  function now() {
    return Date.now ? Date.now() : new Date().getTime();
  }

  function getStoredNumber(key) {
    try {
      var value = window.localStorage.getItem(key);
      return value ? parseInt(value, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  function setStoredNumber(key) {
    try {
      window.localStorage.setItem(key, String(now()));
    } catch (e) {}
  }

  function sessionHas(key) {
    try { return window.sessionStorage.getItem(key) === "true"; }
    catch (e) { return false; }
  }

  function sessionSet(key) {
    try { window.sessionStorage.setItem(key, "true"); }
    catch (e) {}
  }

  function showElement(el) {
    if (!el) return;
    el.hidden = false;
    requestAnimationFrame(function () {
      el.classList.add("is-visible");
    });
  }

  function hideElement(el) {
    if (!el) return;
    el.classList.remove("is-visible");
    setTimeout(function () {
      el.hidden = true;
    }, 360);
  }

  function setupPromoOffer() {
    var promo = document.getElementById("takecutPromoOffer");
    if (!promo) return;

    var lastSeen = getStoredNumber(promoKey);
    if (lastSeen && now() - lastSeen < PROMO_COOLDOWN_MS) return;

    promo.querySelectorAll("[data-tc-promo-close]").forEach(function (button) {
      button.addEventListener("click", function () {
        setStoredNumber(promoKey);
        hideElement(promo);
      });
    });

    var cta = promo.querySelector(".tc-promo-cta");
    if (cta) {
      cta.addEventListener("click", function () {
        setStoredNumber(promoKey);
      });
    }

    setTimeout(function () {
      if (document.hidden) return;
      setStoredNumber(promoKey);
      showElement(promo);
    }, PROMO_DELAY_MS);

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) return;
      if (promo.classList.contains("is-visible")) {
        setStoredNumber(promoKey);
      }
    });
  }

  function isMobilePortrait() {
    if (!window.matchMedia) return false;
    return window.matchMedia("(max-width: 768px)").matches && window.matchMedia("(orientation: portrait)").matches;
  }

  function setupOrientationHint() {
    var hint = document.getElementById("takecutOrientationHint");
    if (!hint || !isMobilePortrait() || sessionHas(orientKey)) return;

    function closeHint() {
      sessionSet(orientKey);
      hideElement(hint);
    }

    hint.querySelectorAll("[data-tc-orientation-close]").forEach(function (button) {
      button.addEventListener("click", closeHint);
    });

    function showHintOnce() {
      if (!isMobilePortrait() || sessionHas(orientKey)) return;
      sessionSet(orientKey);
      showElement(hint);
      setTimeout(function () {
        hideElement(hint);
      }, 9000);
    }

    var targets = document.querySelectorAll(".showreel-video, #videos-ia .video-box.horizontal, #videos-ia .video-box.destaque");
    if (!targets.length) return;

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            setTimeout(showHintOnce, 550);
            observer.disconnect();
          }
        });
      }, { threshold: [0.35], rootMargin: "0px 0px -12% 0px" });

      targets.forEach(function (target) {
        observer.observe(target);
      });
    } else {
      targets.forEach(function (target) {
        target.addEventListener("click", showHintOnce, { once: true });
      });
    }

    if (window.matchMedia) {
      var orientationQuery = window.matchMedia("(orientation: landscape)");
      var handleOrientationChange = function () {
        if (orientationQuery.matches) hideElement(hint);
      };
      if (typeof orientationQuery.addEventListener === "function") {
        orientationQuery.addEventListener("change", handleOrientationChange);
      } else if (typeof orientationQuery.addListener === "function") {
        orientationQuery.addListener(handleOrientationChange);
      }
    }
  }

  function initTakecutMessages() {
    setupPromoOffer();
    setupOrientationHint();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTakecutMessages, { once: true });
  } else {
    initTakecutMessages();
  }
})();

