function toggleMenu() {
  document.querySelector(".nav-links").classList.toggle("active");
}

// Fecha o menu ao clicar em qualquer link
// Usando DOMContentLoaded para garantir que os links existem no iOS
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll(".nav-links a").forEach(function(link) {
    link.addEventListener("click", function() {
      document.querySelector(".nav-links").classList.remove("active");
    });
  });
});

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

// 🌌 CRIA O UNIVERSO
function createUniverse() {
  const starsBg = document.getElementById('starsBg');
  
  for(let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.className = 'stars';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (Math.random() * 3 + 2) + 's';
    starsBg.appendChild(star);
  }
  
  for(let i = 0; i < 3; i++) {
    const comet = document.createElement('div');
    comet.className = 'comet';
    comet.style.left = Math.random() * 100 + '%';
    comet.style.top = Math.random() * 50 + '%';
    comet.style.animationDelay = Math.random() * 3 + 's';
    comet.style.animationDuration = (Math.random() * 4 + 6) + 's';
    starsBg.appendChild(comet);
  }
}

window.addEventListener('load', createUniverse);

// ANTI DEVTOOLS
(function() {
  document.addEventListener('keydown', function(e) {
    if(e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73)) {
      e.preventDefault();
      return false;
    }
  });
})();
