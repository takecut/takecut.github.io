// LOADING SCREEN
// Detecta mobile por largura OU por userAgent (funciona no Inspecionar e no iPhone real)
var isMobileDevice = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

if (isMobileDevice) {
  var loadScreen = document.getElementById("loadingScreen");
  var loadBar = document.getElementById("loadingBar");

  if (loadScreen && loadBar) {
    // Garante que o loading apareça imediatamente
    loadScreen.style.display = "flex";

    var progress = 0;

    var interval = setInterval(function() {
      var remaining = 100 - progress;
      var step = Math.max(0.8, remaining * 0.05);
      progress = Math.min(progress + step, 95);
      loadBar.style.width = progress + "%";
    }, 60);

    // Completa quando a página carregar
    window.addEventListener("load", function() {
      clearInterval(interval);
      loadBar.style.width = "100%";
      setTimeout(function() {
        loadScreen.style.opacity = "0";
        loadScreen.style.transition = "opacity 0.5s ease";
        setTimeout(function() { loadScreen.remove(); }, 500);
      }, 350);
    });

    // Segurança: se demorar mais de 6s, fecha de qualquer jeito
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

// =====================================================
// 🎡 PICKER CIRCULAR — DEPOIMENTOS E FAQ (MOBILE)
// =====================================================
function initPicker(section) {
  if (window.innerWidth > 768) return;

  const grid = section.querySelector(".testimonials-grid, .faq-list");
  if (!grid) return;

  const items = Array.from(grid.children);
  const count = items.length;
  if (count === 0) return;

  // Insere fades nas bordas
  ["top", "bottom"].forEach(function(pos) {
    const fade = document.createElement("div");
    fade.className = "picker-fade " + pos;
    section.appendChild(fade);
  });

  const ITEM_HEIGHT = 118; // altura do card + gap
  let currentIndex = 0;    // item central atual
  let startY = 0;
  let startOffset = 0;
  let offset = 0;          // offset de pixels do scroll
  let locked = false;      // true = scroll da página liberado
  let atStart = false;
  let atEnd = false;
  let passedEdge = false;  // passou da borda com força suficiente

  // Aplica posição e efeito 3D em cada item
  function render() {
    items.forEach(function(item, i) {
      // Distância em itens do centro
      const dist = (offset / ITEM_HEIGHT) - (i - Math.floor(count / 2));
      const normalDist = dist; // positivo = acima do centro

      // Rotação no eixo X simulando o cilindro
      const rotX = Math.max(-60, Math.min(60, normalDist * 22));
      // Escala: item central = 1, demais menores
      const scale = Math.max(0.6, 1 - Math.abs(normalDist) * 0.13);
      // Opacidade: central = 1, demais mais transparentes
      const opacity = Math.max(0.2, 1 - Math.abs(normalDist) * 0.28);
      // Deslocamento Y para simular a curvatura
      const translateY = normalDist * ITEM_HEIGHT;

      item.style.transform =
        "translateY(" + translateY + "px) rotateX(" + rotX + "deg) scale(" + scale + ")";
      item.style.opacity = opacity;

      // Destaque no item central
      if (Math.abs(normalDist) < 0.5) {
        item.style.boxShadow = "0 0 20px rgba(0,255,178,0.2)";
        item.style.borderColor = "rgba(0,255,178,0.3)";
      } else {
        item.style.boxShadow = "none";
        item.style.borderColor = "";
      }
    });

    // Verifica se está nos extremos
    const maxOffset = Math.floor(count / 2) * ITEM_HEIGHT;
    const minOffset = -Math.floor(count / 2) * ITEM_HEIGHT;
    atStart = offset >= maxOffset - 5;
    atEnd = offset <= minOffset + 5;
  }

  // Snap para o item mais próximo
  function snapToNearest() {
    const snapped = Math.round(offset / ITEM_HEIGHT) * ITEM_HEIGHT;
    const maxOffset = Math.floor(count / 2) * ITEM_HEIGHT;
    const minOffset = -Math.floor(count / 2) * ITEM_HEIGHT;
    offset = Math.max(minOffset, Math.min(maxOffset, snapped));
    render();
  }

  // ---- Touch events ----
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

    // Se já chegou no extremo e continua arrastando na mesma direção
    if (atStart && dy > 0 && !passedEdge) {
      // Está no topo e arrasta para baixo (tenta ir antes do primeiro)
      if (Math.abs(dy) > 40) {
        passedEdge = true;
        locked = true;
      }
    } else if (atEnd && dy < 0 && !passedEdge) {
      // Está no final e arrasta para cima (tenta ir depois do último)
      if (Math.abs(dy) > 40) {
        passedEdge = true;
        locked = true;
      }
    }

    if (locked) return; // deixa o scroll da página acontecer

    // Previne o scroll da página enquanto usa o picker
    e.preventDefault();

    offset = startOffset + dy;
    // Resistência nos extremos (rubber band)
    if (offset > maxOffset) {
      const over = offset - maxOffset;
      offset = maxOffset + over * 0.25;
    } else if (offset < minOffset) {
      const over = minOffset - offset;
      offset = minOffset - over * 0.25;
    }

    render();
  }, { passive: false });

  section.addEventListener("touchend", function() {
    if (!locked) snapToNearest();
    locked = false;
    passedEdge = false;
  }, { passive: true });

  // Posição inicial: primeiro item ao centro
  offset = Math.floor(count / 2) * ITEM_HEIGHT;
  render();
}

// Inicializa os pickers quando a página carregar
document.addEventListener("DOMContentLoaded", function() {
  if (window.innerWidth <= 768) {
    var testimonials = document.querySelector(".testimonials");
    var faq = document.querySelector(".faq");
    if (testimonials) initPicker(testimonials);
    if (faq) initPicker(faq);
  }
});
