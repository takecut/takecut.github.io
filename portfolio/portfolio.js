(function () {
  "use strict";

  /* Troque somente este ID para alterar o projeto em destaque. */
  const FEATURED_PROJECT_ID = "ia-marca";

  /* Fonte única de dados do portfólio. Novos projetos devem ser adicionados aqui. */
  const projects = [
    {
      id: "entrevista-corporativa",
      title: "Vídeo de entrevista para marca",
      shortTitle: "Entrevista para marca",
      format: "reels",
      niche: "corporativo",
      objective: "contar-historia",
      thumbnail: "/thumbp6.jpg",
      video: "/video6.mp4",
      vertical: true,
      description: "Edição vertical com legenda, identidade visual e ritmo de redes sociais para transformar uma entrevista em conteúdo claro, profissional e fácil de assistir.",
      techniques: ["Edição", "Motion Graphics", "Legendas", "Color Grading"]
    },
    {
      id: "conteudo-social",
      title: "Conteúdo para redes sociais",
      shortTitle: "Conteúdo de retenção",
      format: "reels",
      niche: "comercio",
      objective: "prender-atencao",
      thumbnail: "/thumb1.png",
      video: "/videor.mp4",
      vertical: true,
      description: "Edição rápida, visual forte e mensagem fácil de entender para aumentar retenção em Reels, TikTok e campanhas de alcance.",
      techniques: ["Edição", "Sound Design", "Motion Graphics", "Legendas"]
    },
    {
      id: "institucional-vertical",
      title: "Vídeo institucional",
      shortTitle: "Autoridade de marca",
      format: "institucional",
      niche: "corporativo",
      objective: "contar-historia",
      thumbnail: "/thumb2.png",
      video: "/videor2.mp4",
      vertical: true,
      description: "Conteúdo profissional para apresentar a empresa com clareza, gerar confiança e fortalecer a percepção da marca.",
      techniques: ["Edição", "Roteiro", "Motion Graphics", "Color Grading"]
    },
    {
      id: "hospedagem-tematica",
      title: "Reels para hospedagem temática",
      shortTitle: "Tour para hospedagem",
      format: "reels",
      niche: "turismo",
      objective: "vender",
      thumbnail: "/thumbp8.jpg",
      video: "/video8.mp4",
      vertical: true,
      description: "Tour vertical com cortes guiados e ritmo de descoberta para apresentar o ambiente, valorizar a experiência e despertar vontade de reservar.",
      techniques: ["Edição", "Captação", "Sound Design", "Legendas"]
    },
    {
      id: "anuncio-produto",
      title: "Anúncio para produto",
      shortTitle: "Criativo comercial",
      format: "comerciais",
      niche: "produto",
      objective: "vender",
      thumbnail: "/thumbp1.png",
      video: "/video1.mp4",
      vertical: false,
      description: "Vídeo curto com cortes objetivos, destaque visual para a oferta e ritmo pensado para segurar a atenção logo nos primeiros segundos.",
      techniques: ["Edição", "Sound Design", "Motion Graphics", "Color Grading"]
    },
    {
      id: "youtube-narrativo",
      title: "Vídeo para YouTube",
      shortTitle: "Narrativa e ritmo",
      format: "youtube",
      niche: "corporativo",
      objective: "contar-historia",
      thumbnail: "/thumbp4.png",
      video: "/video4.mp4",
      vertical: false,
      description: "Cenas organizadas com ritmo, estética e narrativa para deixar a comunicação mais memorável e manter o público acompanhando até o fim.",
      techniques: ["Edição", "Sound Design", "Roteiro", "Color Grading"]
    },
    {
      id: "conversa-3d",
      title: "Animação 3D de conversa",
      shortTitle: "Animação com profundidade",
      format: "youtube",
      niche: "produto",
      objective: "criar-impossivel",
      thumbnail: "/thumbp9.jpg",
      video: "/video9.mp4",
      vertical: false,
      description: "Câmera 3D, movimento de profundidade e composição de mensagens transformam uma conversa simples em uma cena visualmente narrativa.",
      techniques: ["3D", "Motion Graphics", "Edição", "Sound Design"]
    },
    {
      id: "video-emocional",
      title: "Vídeo emocional",
      shortTitle: "Memória afetiva",
      format: "emocionais",
      niche: "eventos",
      objective: "contar-historia",
      thumbnail: "/thumbp5.png",
      video: "/video5.mp4",
      vertical: false,
      description: "Edição com trilha, cortes e narrativa para transformar momentos importantes em uma lembrança bonita, marcante e fácil de reassistir.",
      techniques: ["Edição", "Storytelling", "Sound Design", "Color Grading"]
    },
    {
      id: "cinematografico-ia",
      title: "Cena cinematográfica 100% IA",
      shortTitle: "Campanha conceitual",
      format: "ia",
      niche: "criacao-ia",
      objective: "criar-impossivel",
      thumbnail: "/thumbp7.jpg",
      video: "/video7.mp4",
      vertical: false,
      description: "Projeto criado com inteligência artificial para construir atmosfera e apresentar uma ideia difícil ou cara de produzir com captação tradicional.",
      techniques: ["IA", "VFX", "Sound Design", "Color Grading"]
    },
    {
      id: "ia-marca",
      title: "Cena com IA para marca",
      shortTitle: "Comercial cinematográfico + IA",
      format: "ia",
      niche: "criacao-ia",
      objective: "criar-impossivel",
      thumbnail: "/thumbia1.jpg",
      video: "/videoia3c.mp4",
      vertical: false,
      description: "Estética de maquete, movimento de câmera e construção visual transformam uma ideia comercial em uma cena chamativa e memorável.",
      techniques: ["IA", "Direção", "VFX", "Sound Design", "Color Grading"]
    }
  ];

  const formatLabels = {
    reels: "Reels",
    comerciais: "Comerciais",
    ia: "Vídeos com IA",
    institucional: "Institucional",
    youtube: "YouTube",
    emocionais: "Emocionais"
  };

  const nicheLabels = {
    imobiliario: "Imobiliário",
    games: "Games",
    automotivo: "Automotivo",
    turismo: "Turismo",
    comercio: "Comércio",
    corporativo: "Corporativo",
    produto: "Produto",
    eventos: "Eventos",
    "criacao-ia": "Criação com IA"
  };

  const objectiveLabels = {
    vender: "Vender",
    "prender-atencao": "Prender atenção",
    "criar-impossivel": "Criar algo impossível",
    "contar-historia": "Contar uma história"
  };

  const collections = [
    { id: "reels", description: "Conteúdo rápido para redes, turismo, negócios e retenção." },
    { id: "comerciais", description: "Projetos orientados a oferta, produto e decisão de compra." },
    { id: "ia", description: "Cenas conceituais, campanhas e universos criados com IA." },
    { id: "institucional", description: "Comunicação de marca com clareza, autoridade e identidade." },
    { id: "youtube", description: "Narrativas amplas, ritmo e animações para conteúdo horizontal." },
    { id: "emocionais", description: "Histórias, homenagens e memórias construídas com sensibilidade." }
  ];

  const objectives = [
    {
      id: "vender",
      description: "Anúncios, produtos, serviços, turismo e criativos comerciais.",
      icon: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 18h16M6 15l4-4 3 3 5-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 7h2.5v2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    },
    {
      id: "prender-atencao",
      description: "Reels, conteúdo de retenção, redes sociais e vídeos rápidos.",
      icon: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5.2c5 0 8.3 6.8 8.3 6.8S17 18.8 12 18.8 3.7 12 3.7 12 7 5.2 12 5.2Z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2.8" stroke="currentColor" stroke-width="2"/></svg>'
    },
    {
      id: "criar-impossivel",
      description: "Inteligência artificial, VFX, 3D e cenas fora do comum.",
      icon: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" fill="currentColor"/></svg>'
    },
    {
      id: "contar-historia",
      description: "Institucionais, YouTube, emocionais e filmes de marca.",
      icon: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4.5h9a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3v-12Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8.5 9h5M8.5 13h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17 8.5h2v11h-2" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
    }
  ];

  const state = {
    source: projects.slice(),
    visible: projects.slice(),
    filterMode: "format",
    activeFilter: "all",
    pageSize: window.matchMedia("(max-width: 768px)").matches ? 3 : 4,
    shown: 0,
    viewerSequence: projects.slice(),
    viewerIndex: 0,
    lastFocus: null
  };

  const $ = function (selector) { return document.querySelector(selector); };
  const featuredHost = $("#featuredProject");
  const objectiveGrid = $("#objectiveGrid");
  const collectionGrid = $("#collectionGrid");
  const gallery = $("#projectGallery");
  const projectGrid = $("#projectGrid");
  const filterStrip = $("#galleryFilters");
  const loadMore = $("#loadMore");
  const marketsList = $("#marketsList");
  const viewer = $("#projectViewer");

  function labelFor(map, key) {
    return map[key] || key;
  }

  function whatsappFor(project) {
    const message = "Olá, vi o projeto “" + project.title + "” no portfólio da Take Cut e quero criar algo nessa direção.";
    return "https://wa.me/551153044748?text=" + encodeURIComponent(message);
  }

  function renderFeatured() {
    const project = projects.find(function (item) { return item.id === FEATURED_PROJECT_ID; }) || projects[0];
    featuredHost.innerHTML = [
      '<article class="featured-card">',
      '  <button class="featured-media" type="button" data-open-project="' + project.id + '" aria-label="Assistir ' + project.title + '">',
      '    <img src="' + project.thumbnail + '" alt="Thumbnail do projeto ' + project.title + '" width="960" height="600" fetchpriority="high" decoding="async">',
      '    <span class="featured-play"><span class="featured-play-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 6.8v10.4L17.5 12 9 6.8Z"/></svg></span> Assistir projeto</span>',
      "  </button>",
      '  <div class="featured-copy">',
      '    <span class="featured-label">' + project.shortTitle + "</span>",
      "    <h3>" + project.title + "</h3>",
      "    <p>" + project.description + "</p>",
      '    <div class="featured-meta"><span>' + labelFor(formatLabels, project.format) + "</span><span>" + labelFor(nicheLabels, project.niche) + "</span><span>" + labelFor(objectiveLabels, project.objective) + "</span></div>",
      '    <button class="featured-action" type="button" data-open-project="' + project.id + '">Ver detalhes do projeto</button>',
      "  </div>",
      "</article>"
    ].join("");
  }

  function renderObjectives() {
    objectiveGrid.innerHTML = objectives.map(function (objective) {
      const count = projects.filter(function (project) { return project.objective === objective.id; }).length;
      return [
        '<button class="objective-card" type="button" data-objective="' + objective.id + '">',
        '  <span class="objective-icon">' + objective.icon + "</span>",
        '  <span class="objective-copy"><strong>' + objectiveLabels[objective.id] + "</strong><span>" + objective.description + "</span></span>",
        '  <span class="objective-arrow" aria-hidden="true">→</span>',
        '  <span class="sr-only">' + count + (count === 1 ? " projeto" : " projetos") + "</span>",
        "</button>"
      ].join("");
    }).join("");
  }

  function renderCollections() {
    collectionGrid.innerHTML = collections.map(function (collection) {
      const collectionProjects = projects.filter(function (project) { return project.format === collection.id; });
      const thumbs = collectionProjects.slice(0, 3).map(function (project) {
        return '<span class="collection-thumb"><img src="' + project.thumbnail + '" alt="" width="560" height="350" loading="lazy" decoding="async"></span>';
      }).join("");
      return [
        '<button class="collection-card" type="button" data-collection="' + collection.id + '">',
        '  <span class="collection-stack" aria-hidden="true">' + thumbs + "</span>",
        '  <span class="collection-info">',
        '    <small>' + collectionProjects.length + (collectionProjects.length === 1 ? " projeto" : " projetos") + "</small>",
        '    <span class="collection-title">' + formatLabels[collection.id] + "</span>",
        '    <span class="collection-description">' + collection.description + "</span>",
        '    <span class="collection-link">Explorar collection <span aria-hidden="true">→</span></span>',
        "  </span>",
        "</button>"
      ].join("");
    }).join("");
  }

  function renderMarkets() {
    const existingNiches = Array.from(new Set(projects.map(function (project) { return project.niche; }))).filter(function (niche) { return niche !== "criacao-ia"; });
    marketsList.innerHTML = existingNiches.map(function (niche) {
      const count = projects.filter(function (project) { return project.niche === niche; }).length;
      return '<button class="market-button" type="button" data-niche="' + niche + '">' + nicheLabels[niche] + " <small>" + count + "</small></button>";
    }).join("");
  }

  function openGallery(options) {
    state.source = options.projects.slice();
    state.visible = options.projects.slice();
    state.filterMode = options.filterMode;
    state.activeFilter = "all";
    state.shown = 0;
    $("#galleryKicker").textContent = options.kicker;
    $("#galleryTitle").textContent = options.title;
    $("#galleryDescription").textContent = options.description;
    gallery.hidden = false;
    renderFilters();
    renderProjectBatch(true);
    window.requestAnimationFrame(function () {
      gallery.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function renderFilters() {
    const map = state.filterMode === "niche" ? nicheLabels : formatLabels;
    const keys = Array.from(new Set(state.source.map(function (project) { return project[state.filterMode]; })));
    const chips = [{ id: "all", label: "Todos" }].concat(keys.length > 1 ? keys.map(function (key) { return { id: key, label: labelFor(map, key) }; }) : []);
    filterStrip.innerHTML = chips.map(function (chip) {
      const active = chip.id === state.activeFilter;
      return '<button class="filter-chip' + (active ? " active" : "") + '" type="button" data-gallery-filter="' + chip.id + '" aria-pressed="' + active + '">' + chip.label + "</button>";
    }).join("");
  }

  function applyGalleryFilter(filter) {
    state.activeFilter = filter;
    state.visible = filter === "all" ? state.source.slice() : state.source.filter(function (project) {
      return project[state.filterMode] === filter;
    });
    state.shown = 0;
    renderFilters();
    renderProjectBatch(true);
  }

  function projectCard(project, index) {
    return [
      '<article class="project-card' + (project.vertical ? " is-vertical" : "") + '" tabindex="0" role="button" aria-label="Abrir projeto ' + project.title + '" data-project-id="' + project.id + '" style="animation-delay:' + Math.min(index * 45, 180) + 'ms">',
      '  <div class="project-thumb">',
      '    <img src="' + project.thumbnail + '" alt="Thumbnail de ' + project.title + '" width="560" height="350" loading="lazy" decoding="async">',
      '    <span class="project-indicator" aria-hidden="true"></span>',
      '    <span class="project-play"><span><svg class="play-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.8v10.4L17.5 12 9 6.8Z"/></svg><span class="project-play-label">Assistir</span></span></span>',
      "  </div>",
      '  <div class="project-copy">',
      "    <small>" + project.shortTitle + "</small>",
      "    <h3>" + project.title + "</h3>",
      "    <p>" + labelFor(nicheLabels, project.niche) + " • " + labelFor(formatLabels, project.format) + "</p>",
      '    <div class="project-meta"><span>' + project.techniques[0] + "</span><span>" + project.techniques[1] + "</span></div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function renderProjectBatch(reset) {
    if (reset) projectGrid.innerHTML = "";
    const nextLimit = Math.min(state.shown + state.pageSize, state.visible.length);
    const nextProjects = state.visible.slice(state.shown, nextLimit);
    const startIndex = state.shown;
    projectGrid.insertAdjacentHTML("beforeend", nextProjects.map(function (project, index) {
      return projectCard(project, startIndex + index);
    }).join(""));
    state.shown = nextLimit;
    attachCardInteractions();
    loadMore.hidden = state.shown >= state.visible.length;
    $("#galleryCount").textContent = state.shown + " de " + state.visible.length + (state.visible.length === 1 ? " projeto" : " projetos");
  }

  function attachCardInteractions() {
    projectGrid.querySelectorAll(".project-card:not([data-ready])").forEach(function (card) {
      card.dataset.ready = "true";
      const project = projects.find(function (item) { return item.id === card.dataset.projectId; });
      card.addEventListener("click", function () { openViewer(project, state.visible); });
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openViewer(project, state.visible);
        }
      });
      if (window.matchMedia("(min-width: 769px) and (hover: hover) and (pointer: fine)").matches) attachHoverPreview(card, project);
    });
  }

  function attachHoverPreview(card, project) {
    let timer = 0;
    let stopTimer = 0;
    function stopPreview() {
      window.clearTimeout(timer);
      window.clearTimeout(stopTimer);
      const video = card.querySelector(".project-preview");
      if (!video) return;
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.remove();
    }
    card.addEventListener("mouseenter", function () {
      timer = window.setTimeout(function () {
        if (card.querySelector(".project-preview")) return;
        document.querySelectorAll(".project-preview").forEach(function (other) {
          other.pause();
          other.remove();
        });
        const video = document.createElement("video");
        video.className = "project-preview";
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.preload = "metadata";
        video.poster = project.thumbnail;
        video.src = project.video;
        card.querySelector(".project-thumb").prepend(video);
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") playPromise.catch(function () {});
        stopTimer = window.setTimeout(stopPreview, 4000);
      }, 260);
    });
    card.addEventListener("mouseleave", stopPreview);
    card.addEventListener("blur", stopPreview);
  }

  function openViewer(project, sequence) {
    if (!project) return;
    state.lastFocus = document.activeElement;
    state.viewerSequence = sequence && sequence.length ? sequence.slice() : projects.slice();
    state.viewerIndex = Math.max(0, state.viewerSequence.findIndex(function (item) { return item.id === project.id; }));
    renderViewerProject(project);
    viewer.hidden = false;
    document.body.classList.add("viewer-open");
    viewer.querySelector(".viewer-close").focus();
  }

  function renderViewerProject(project) {
    const media = $("#viewerMedia");
    const previousVideo = media.querySelector("video");
    if (previousVideo) previousVideo.pause();
    media.classList.toggle("is-vertical", project.vertical);
    media.innerHTML = '<video controls playsinline preload="metadata" poster="' + project.thumbnail + '"><source src="' + project.video + '" type="video/mp4"></video>';
    $("#viewerCategory").textContent = labelFor(formatLabels, project.format) + " / " + labelFor(nicheLabels, project.niche);
    $("#viewerTitle").textContent = project.title;
    $("#viewerDescription").textContent = project.description;
    $("#viewerTechniques").innerHTML = project.techniques.map(function (technique) { return "<span>" + technique + "</span>"; }).join("");
    $("#viewerCta").href = whatsappFor(project);
    $("#viewerPosition").textContent = (state.viewerIndex + 1) + " / " + state.viewerSequence.length;
    const video = media.querySelector("video");
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") playPromise.catch(function () {});
  }

  function navigateViewer(direction) {
    state.viewerIndex = (state.viewerIndex + direction + state.viewerSequence.length) % state.viewerSequence.length;
    renderViewerProject(state.viewerSequence[state.viewerIndex]);
  }

  function closeViewer() {
    const video = $("#viewerMedia video");
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
    $("#viewerMedia").innerHTML = "";
    viewer.hidden = true;
    document.body.classList.remove("viewer-open");
    if (state.lastFocus && typeof state.lastFocus.focus === "function") state.lastFocus.focus();
  }

  function bindEvents() {
    objectiveGrid.addEventListener("click", function (event) {
      const button = event.target.closest("[data-objective]");
      if (!button) return;
      const objective = button.dataset.objective;
      openGallery({
        projects: projects.filter(function (project) { return project.objective === objective; }),
        filterMode: "format",
        kicker: "Exploração por objetivo",
        title: objectiveLabels[objective],
        description: objectives.find(function (item) { return item.id === objective; }).description
      });
    });

    collectionGrid.addEventListener("click", function (event) {
      const button = event.target.closest("[data-collection]");
      if (!button) return;
      const format = button.dataset.collection;
      const collection = collections.find(function (item) { return item.id === format; });
      openGallery({
        projects: projects.filter(function (project) { return project.format === format; }),
        filterMode: "niche",
        kicker: "Collection",
        title: formatLabels[format],
        description: collection.description
      });
    });

    marketsList.addEventListener("click", function (event) {
      const button = event.target.closest("[data-niche]");
      if (!button) return;
      const niche = button.dataset.niche;
      openGallery({
        projects: projects.filter(function (project) { return project.niche === niche; }),
        filterMode: "format",
        kicker: "Exploração por mercado",
        title: nicheLabels[niche],
        description: "Projetos criados para o mercado de " + nicheLabels[niche].toLowerCase() + "."
      });
    });

    filterStrip.addEventListener("click", function (event) {
      const button = event.target.closest("[data-gallery-filter]");
      if (button) applyGalleryFilter(button.dataset.galleryFilter);
    });

    loadMore.addEventListener("click", function () { renderProjectBatch(false); });
    $("#closeGallery").addEventListener("click", function () { gallery.hidden = true; });
    $("#previousProject").addEventListener("click", function () { navigateViewer(-1); });
    $("#nextProject").addEventListener("click", function () { navigateViewer(1); });
    viewer.querySelectorAll("[data-close-viewer]").forEach(function (button) { button.addEventListener("click", closeViewer); });

    document.addEventListener("click", function (event) {
      const opener = event.target.closest("[data-open-project]");
      if (!opener) return;
      const project = projects.find(function (item) { return item.id === opener.dataset.openProject; });
      openViewer(project, projects);
    });

    document.addEventListener("keydown", function (event) {
      if (viewer.hidden) {
        const opener = event.target.closest && event.target.closest("[data-open-project]");
        if (opener && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          const project = projects.find(function (item) { return item.id === opener.dataset.openProject; });
          openViewer(project, projects);
        }
        return;
      }
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") navigateViewer(-1);
      if (event.key === "ArrowRight") navigateViewer(1);
      if (event.key === "Tab") {
        const focusable = Array.from(viewer.querySelectorAll('button:not([disabled]), a[href], video[controls]'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    window.addEventListener("pagehide", function () {
      document.querySelectorAll("video").forEach(function (video) { video.pause(); });
    });
  }

  renderFeatured();
  renderObjectives();
  renderCollections();
  renderMarkets();
  bindEvents();
})();
