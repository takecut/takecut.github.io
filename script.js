// LOADING SCREEN
// Detecta mobile por largura OU por userAgent (funciona no Inspecionar e no iPhone real)
var isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

if (isMobileDevice) {
  var loadScreen = document.getElementById("loadingScreen");
  var loadBar = document.getElementById("loadingBar");

  if (loadScreen && loadBar) {
    // Adiciona classe .active para mostrar (CSS usa display:none por padrão)
    loadScreen.classList.add("active");

    var progress = 0;
    var interval = setInterval(function() {
      var remaining = 100 - progress;
      var step = Math.max(0.8, remaining * 0.05);
      progress = Math.min(progress + step, 95);
      loadBar.style.width = progress + "%";
    }, 60);

    function waitForImages() {
      var images = document.querySelectorAll("img");
      var promises = [];
      images.forEach(function(img) {
        if (img.complete) return;
        promises.push(new Promise(function(resolve) {
          img.onload = resolve;
          img.onerror = resolve;
        }));
      });
      return Promise.all(promises);
    }

    window.addEventListener("load", function() {
      waitForImages().then(function() {
        clearInterval(interval);
        loadBar.style.width = "100%";
        setTimeout(function() {
          loadScreen.style.opacity = "0";
          loadScreen.style.transition = "opacity 0.5s ease";
          setTimeout(function() { loadScreen.remove(); }, 500);
        }, 300);
      });
    });

    // Segurança: fecha em 6s de qualquer forma
    setTimeout(function() {
      if (document.getElementById("loadingScreen")) {
        clearInterval(interval);
        loadBar.style.width = "100%";
        setTimeout(function() {
          loadScreen.style.opacity = "0";
          loadScreen.style.transition = "opacity 0.5s ease";
          setTimeout(function() { loadScreen.remove(); }, 500);
        }, 300);
      }
    }, 6000);
  }
}

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
  const isMobile = window.innerWidth <= 768;
  const starCount = isMobile ? 40 : 100;
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

  for (let i = 0; i < ufoCount; i++) {
    const ufo = document.createElement("div");
    const scale = (Math.random() * 0.45 + 0.8).toFixed(2);
    ufo.className = "ufo";
    ufo.style.cssText =
      "left:" + (Math.random() * 30 - 10) + "vw;top:" + (Math.random() * 45 + 4) +
      "%;animation-delay:" + (Math.random() * 8) + "s;animation-duration:" +
      (Math.random() * 6 + 12) + "s;--ufo-scale:" + scale + ";";
    fragment.appendChild(ufo);
  }

  starsBg.appendChild(fragment);
}

window.addEventListener("load", createUniverse);

// ANTI DEVTOOLS
(function () {
  document.addEventListener("keydown", function (e) {
    if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73)) {
      e.preventDefault();
      return false;
    }
  });
})();
