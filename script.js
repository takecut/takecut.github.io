// LOADING SCREEN
// Detecta mobile por userAgent — mais confiável que innerWidth
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
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
      document.querySelector(".nav-links").classList.remove("active");
    });
  });

  // LAZY LOAD DE VÍDEOS
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const video = entry.target;
          if (video.readyState === 0) video.load();
          videoObserver.unobserve(video);
        }
      });
    }, { rootMargin: "200px" });

    document.querySelectorAll("video[preload='none']:not(.bg-video)").forEach(function (v) {
      videoObserver.observe(v);
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
function createUniverse() {
  const starsBg = document.getElementById("starsBg");
  const isMobile = window.innerWidth <= 768;
  const starCount = isMobile ? 40 : 100;
  const cometCount = isMobile ? 1 : 3;
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

  for (let i = 0; i < cometCount; i++) {
    const comet = document.createElement("div");
    comet.className = "comet";
    comet.style.cssText =
      "left:" + (Math.random() * 100) + "%;top:" + (Math.random() * 50) +
      "%;animation-delay:" + (Math.random() * 3) + "s;animation-duration:" +
      (Math.random() * 4 + 6) + "s";
    fragment.appendChild(comet);
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

  const ITEM_HEIGHT = 118;
  let offset = Math.floor(count / 2) * ITEM_HEIGHT;
  let startY = 0;
  let startOffset = 0;
  let locked = false;
  let atStart = false;
  let atEnd = false;
  let passedEdge = false;

  function render() {
    const maxOffset = Math.floor(count / 2) * ITEM_HEIGHT;
    const minOffset = -Math.floor(count / 2) * ITEM_HEIGHT;
    atStart = offset >= maxOffset - 5;
    atEnd   = offset <= minOffset + 5;

    items.forEach(function(item, i) {
      const dist = (offset / ITEM_HEIGHT) - (i - Math.floor(count / 2));
      const rotX = Math.max(-60, Math.min(60, dist * 22));
      const scale = Math.max(0.6, 1 - Math.abs(dist) * 0.13);
      const opacity = Math.max(0.2, 1 - Math.abs(dist) * 0.28);
      const translateY = dist * ITEM_HEIGHT;

  function snapToNearest() {
    const maxOffset = Math.floor(count / 2) * ITEM_HEIGHT;
    const minOffset = -Math.floor(count / 2) * ITEM_HEIGHT;
    const snapped = Math.round(offset / ITEM_HEIGHT) * ITEM_HEIGHT;
    offset = Math.max(minOffset, Math.min(maxOffset, snapped));
    render();
  }

  section.addEventListener("touchstart", function(e) {
    startY = e.touches[0].clientY;
    startOffset = offset;
    passedEdge = false;
    locked = false;
  }, { passive: true });

  section.addEventListener("touchmove", function(e) {
    const dy = e.touches[0].clientY - startY;
    const maxOffset = Math.floor(count / 2) * ITEM_HEIGHT;
    const minOffset = -Math.floor(count / 2) * ITEM_HEIGHT;

    if ((atStart && dy > 0) || (atEnd && dy < 0)) {
      if (!passedEdge && Math.abs(dy) > 40) {
        passedEdge = true;
        locked = true;
      }
    }

    if (locked) return;

    e.preventDefault();

    offset = startOffset + dy;
    if (offset > maxOffset) {
      offset = maxOffset + (offset - maxOffset) * 0.25;
    } else if (offset < minOffset) {
      offset = minOffset - (minOffset - offset) * 0.25;
    }

    render();
  }, { passive: false });

  section.addEventListener("touchend", function() {
    if (!locked) snapToNearest();
    locked = false;
    passedEdge = false;
  }, { passive: true });

  render();
}
