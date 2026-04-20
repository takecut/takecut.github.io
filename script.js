function toggleMenu() {
  document.querySelector(".nav-links").classList.toggle("active");
}

function openVideo(src) {
  const modal = document.getElementById("videoModal");
  const video = document.getElementById("modalVideo");

  modal.style.display = "flex";

  video.src = src;

  video.onloadedmetadata = () => {
    video.style.width = "auto";
    video.style.height = "auto";
    video.style.maxWidth = "90vw";
    video.style.maxHeight = "90vh";
  };

  video.play();
}

function closeVideo() {
  const modal = document.getElementById("videoModal");
  const video = document.getElementById("modalVideo");

  modal.style.display = "none";
  video.pause();
  video.src = "";
}

function playVideo(element) {
  const thumb = element.querySelector(".thumb");
  const btn = element.querySelector(".play-btn");
  const video = element.querySelector(".video");

  thumb.style.display = "none";
  btn.style.display = "none";
  video.style.display = "block";

  video.play();
}

function scrollCarousel(direction) {
  const carousel = document.getElementById("carousel");
  const itemWidth = 500;  // ← Ajuste conforme seus vídeos
  
  const maxScroll = carousel.scrollWidth - carousel.clientWidth;

  if (direction === -1 && carousel.scrollLeft <= 0) {
    carousel.scrollTo({ left: maxScroll, behavior: "smooth" });
    return;
  }

  if (direction === 1 && carousel.scrollLeft >= maxScroll - 10) {
    carousel.scrollTo({ left: 0, behavior: "smooth" });
    return;
  }

  carousel.scrollBy({
    left: direction * itemWidth,
    behavior: "smooth"
  });
}
  
  if (direction === 1 && carousel.scrollLeft >= maxScroll - 10) {
    carousel.scrollTo({ left: 0, behavior: "smooth" });
    return;
  }
  
  carousel.scrollBy({
    left: direction * itemWidth,
    behavior: "smooth"
  });
}

// 🌌 CRIA O UNIVERSO
function createUniverse() {
  const starsBg = document.getElementById('starsBg');

  for(let i = 0; i < 50; i++) {
    const star = document.createElement('div');
    star.className = 'stars';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    starsBg.appendChild(star);
  }

  for(let i = 0; i < 3; i++) {
    const comet = document.createElement('div');
    comet.className = 'comet';
    comet.style.left = Math.random() * 100 + '%';
    comet.style.top = Math.random() * 50 + '%';
    starsBg.appendChild(comet);
  }
}

// Executa quando carrega
window.addEventListener('load', createUniverse);
