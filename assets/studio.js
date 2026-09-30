/* Take Cut: progressive enhancement. Project pages work without JavaScript. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const connection = navigator.connection;
  let paused = reduced.matches || !!connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '');
  const viewer = $('#projectViewer');
  const menu = $('#mobileMenu');
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') document.body.classList.add('keyboard-navigation');
  });
  document.addEventListener('pointerdown', () => document.body.classList.remove('keyboard-navigation'), {passive:true});
  // Keep keyboard navigation in the open overlay, including browsers whose
  // native video controls otherwise hand Tab focus back to browser chrome.
  [menu, viewer].filter(Boolean).forEach(dialog => dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll('a[href],button:not(:disabled),video[controls],[tabindex="0"]')].filter(el => el.getClientRects().length);
    const first = items[0], last = items.at(-1);
    if (!first) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }));
  const hero = $('#heroVideo');
  let activePreview = null;
  let activeFullVideo = null;
  let heroVisible = true;
  let catalog = [];
  let currentProject = '';
  let returnFocus = null;
  const canAnimate = () => !paused && !document.hidden && !viewer?.open && !menu?.open && (!activeFullVideo || activeFullVideo.paused);
  const safePlay = video => { const result = video.play(); if (result) result.catch(() => {}); };
  function stopPreview() {
    if (!activePreview) return;
    const video = activePreview.querySelector('video');
    video.pause(); video.removeAttribute('src'); video.load();
    activePreview.classList.remove('is-previewing'); activePreview = null;
  }
  function startPreview(media) {
    if (!canAnimate() || media.closest('[hidden]') || activePreview === media) return;
    stopPreview(); activePreview = media;
    const video = media.querySelector('video');
    video.muted = true; video.src = media.dataset.preview;
    video.onplaying = () => { if (activePreview === media) media.classList.add('is-previewing'); };
    safePlay(video);
    if (hero) hero.pause();
  }
  function updateMotion() {
    document.body.classList.toggle('motion-paused', paused || document.hidden);
    $$('.motion-toggle').forEach(button => {
      button.setAttribute('aria-pressed', String(paused));
      button.textContent = paused ? 'Ativar animações' : 'Pausar animações';
    });
    if (!canAnimate()) stopPreview();
    if (hero) {
      if (canAnimate() && heroVisible && !activePreview) {
        if (!hero.hasAttribute('src')) hero.src = matchMedia('(max-width:700px)').matches ? hero.dataset.mobile : hero.dataset.desktop;
        hero.muted = true; safePlay(hero);
      } else hero.pause();
    }
  }
  $$('.motion-toggle').forEach(button => button.addEventListener('click', () => { paused = !paused; updateMotion(); }));
  reduced.addEventListener('change', () => { paused = reduced.matches; updateMotion(); });
  document.addEventListener('visibilitychange', updateMotion);
  document.addEventListener('play', event => {
    const video = event.target;
    if (!(video instanceof HTMLVideoElement) || video === hero || video.closest('[data-preview]')) return;
    if (activeFullVideo && activeFullVideo !== video) activeFullVideo.pause();
    activeFullVideo = video; stopPreview(); hero?.pause();
  }, true);
  window.addEventListener('pagehide', () => { stopPreview(); hero?.pause(); });
  const stars = $('#starsBg');
  if (stars) {
    const layer = document.createElement('div'); layer.className = 'near-stars';
    const count = innerWidth < 700 ? 35 : 70;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('i'); star.className = 'star';
      star.style.left = ((i * 61.803) % 100) + '%'; star.style.top = ((i * 37.91 + 11) % 100) + '%';
      star.style.setProperty('--duration', (5 + i % 7) + 's'); layer.append(star);
    }
    stars.append(layer);
  }
  let scrollQueued = false;
  const atmosphereRegions = $$('#home,#contact,#work,.portfolio-section,.project-film');
  const onScroll = () => {
    if (scrollQueued) return; scrollQueued = true;
    requestAnimationFrame(() => {
      $('#siteHeader')?.classList.toggle('is-scrolled', scrollY > 24);
      const zone = atmosphereRegions.find(el => { const r = el.getBoundingClientRect(); return r.top < innerHeight * .6 && r.bottom > innerHeight * .6; });
      stars?.style.setProperty('--atmosphere-opacity', zone?.id === 'home' || zone?.id === 'contact' ? '1' : zone ? '.4' : '.7');
      if (canAnimate() && fine.matches) stars?.style.setProperty('--star-shift', Math.min(scrollY * .008, 12) + 'px');
      scrollQueued = false;
    });
  };
  addEventListener('scroll', onScroll, {passive: true}); onScroll();
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); }
    }), {threshold: .08});
    document.body.classList.add('motion-ready'); $$('[data-reveal]').forEach(el => reveal.observe(el));
    if (hero) new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; updateMotion(); }, {threshold: .1}).observe(hero);
  }
  if (menu) {
    const toggle = $('.menu-toggle');
    toggle.addEventListener('click', () => { menu.showModal(); toggle.setAttribute('aria-expanded', 'true'); document.body.classList.add('dialog-open'); updateMotion(); });
    $('[data-close-menu]').addEventListener('click', () => menu.close());
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.close()));
    menu.addEventListener('close', () => { toggle.setAttribute('aria-expanded', 'false'); document.body.classList.remove('dialog-open'); updateMotion(); });
  }
  const visibleMedia = new Map();
  if ('IntersectionObserver' in window) {
    const previews = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.intersectionRatio >= .65) visibleMedia.set(entry.target, entry.intersectionRatio); else visibleMedia.delete(entry.target); });
      if (!fine.matches) {
        const candidates = [...visibleMedia.keys()].filter(el => !el.closest('[hidden]'));
        candidates.sort((a,b) => Math.abs(a.getBoundingClientRect().top + a.clientHeight/2 - innerHeight/2) - Math.abs(b.getBoundingClientRect().top + b.clientHeight/2 - innerHeight/2));
        if (candidates[0]) startPreview(candidates[0]); else stopPreview();
      } else if (activePreview && !visibleMedia.has(activePreview)) stopPreview();
    }, {threshold: [0,.65,1]});
    $$('[data-preview]').forEach(media => previews.observe(media));
  }
  $$('[data-preview]').forEach(media => {
    const link = media.closest('a');
    link.addEventListener('pointerenter', () => { if (fine.matches) startPreview(media); });
    link.addEventListener('pointerleave', () => { if (fine.matches && activePreview === media) { stopPreview(); updateMotion(); } });
    link.addEventListener('focus', () => { if (fine.matches) startPreview(media); });
    link.addEventListener('blur', () => { if (activePreview === media) stopPreview(); });
  });
  const grid = $('#projectGrid');
  let objective = 'all', category = 'all', limit = 8;
  const cards = grid ? [...grid.children] : [];
  function applyFilters(reset = true) {
    if (!grid) return;
    stopPreview(); if (reset) limit = innerWidth <= 700 ? 4 : 8;
    const matches = cards.filter(card => (objective === 'all' || card.dataset.objective.split(' ').includes(objective)) && (category === 'all' || card.dataset.category.split('|').includes(category)));
    cards.forEach(card => { card.hidden = !matches.includes(card) || matches.indexOf(card) >= limit; });
    $('#resultCount').textContent = `${matches.length} ${matches.length === 1 ? 'projeto' : 'projetos'}`;
    $('#emptyState').hidden = matches.length > 0; $('#loadMore').hidden = matches.length <= limit;
    $$('[data-objective-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.objectiveFilter === objective)));
    $$('[data-category-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.categoryFilter === category)));
  }
  $$('[data-objective-filter]').forEach(button => button.addEventListener('click', () => { objective = button.dataset.objectiveFilter; applyFilters(); }));
  $$('[data-category-filter]').forEach(button => button.addEventListener('click', () => { category = button.dataset.categoryFilter; applyFilters(); }));
  $('[data-reset-filters]')?.addEventListener('click', () => { objective = category = 'all'; applyFilters(); $('[data-objective-filter]')?.focus(); });
  $('#loadMore')?.addEventListener('click', () => { const previous = cards.filter(c => !c.hidden); limit += 8; applyFilters(false); cards.find(c => !c.hidden && !previous.includes(c))?.querySelector('a')?.focus(); });
  applyFilters();
  function projectSequence() {
    return [...new Set($$('[data-project-card]').filter(el => !el.hidden).map(el => el.dataset.projectCard))].filter(id => catalog.some(p => p.id === id));
  }
  function showProject(id) {
    const project = catalog.find(p => p.id === id); if (!project) return false;
    currentProject = id;
    const media = $('#viewerMedia'); media.querySelector('video')?.pause(); media.replaceChildren();
    const video = document.createElement('video');
    video.controls = true; video.playsInline = true; video.preload = 'metadata'; video.poster = project.thumbnail; video.src = project.fullVideo;
    video.setAttribute('aria-label', project.title); media.append(video);
    $('#viewerTitle').textContent = project.title; $('#viewerCategory').textContent = project.category.join(' / ');
    $('#viewerDescription').textContent = project.description;
    $('#viewerTechniques').replaceChildren(...project.techniques.map(text => { const span = document.createElement('span'); span.textContent = text; return span; }));
    $('#viewerDetails').href = '/portfolio/' + project.slug + '/';
    $('#viewerCta').href = 'https://wa.me/551153044748?text=' + encodeURIComponent(`Olá, vi o projeto "${project.title}" no portfólio da Take Cut e quero conversar sobre um vídeo nesse estilo.`);
    const sequence = projectSequence(); const index = sequence.indexOf(id);
    $('#viewerPosition').textContent = `${index + 1} / ${sequence.length}`;
    $('#previousProject').disabled = $('#nextProject').disabled = sequence.length < 2;
    if (!viewer.open) { viewer.showModal(); document.body.classList.add('dialog-open'); }
    viewer.scrollTop = 0; updateMotion(); safePlay(video); return true;
  }
  $$('a[data-project]').forEach(link => link.addEventListener('click', event => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !catalog.length) return;
    returnFocus = link; if (showProject(link.dataset.project)) event.preventDefault();
  }));
  if ($('[data-project]')) fetch('/assets/projects.json').then(response => { if (!response.ok) throw new Error('Catalog unavailable'); return response.json(); }).then(data => { if (Array.isArray(data)) catalog = data; }).catch(() => {});
  $('[data-close-viewer]')?.addEventListener('click', () => viewer.close());
  viewer?.addEventListener('click', event => { if (event.target === viewer) { const r = viewer.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) viewer.close(); } });
  viewer?.addEventListener('close', () => {
    const video = $('#viewerMedia video'); if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
    $('#viewerMedia').replaceChildren(); document.body.classList.remove('dialog-open'); returnFocus?.focus({preventScroll:true}); updateMotion();
  });
  function stepProject(step) { const sequence = projectSequence(); const index = sequence.indexOf(currentProject); showProject(sequence[(index + step + sequence.length) % sequence.length]); }
  $('#previousProject')?.addEventListener('click', () => stepProject(-1));
  $('#nextProject')?.addEventListener('click', () => stepProject(1));
  const craftItems = $$('.craft-item');
  const craftAnimations = new Map();
  function finishCraft(item, expanded) {
    const state = craftAnimations.get(item);
    if (state) { state.animation.onfinish = null; state.animation.cancel(); }
    craftAnimations.delete(item);
    item.open = expanded;
    item.classList.remove('is-animating');
  }
  function toggleCraft(item, expanded) {
    const start = item.getBoundingClientRect().height;
    finishCraft(item, true);
    if (expanded) {
      const image = $('.craft-visual img');
      if (image) image.src = item.dataset.processImage;
    }
    if (reduced.matches || paused || !item.animate) { finishCraft(item, expanded); return; }
    const end = expanded ? item.getBoundingClientRect().height : item.querySelector('summary').getBoundingClientRect().height + 1;
    item.classList.add('is-animating');
    const animation = item.animate([{height: start + 'px'}, {height: end + 'px'}], {
      duration: 320, easing: 'cubic-bezier(.22,1,.36,1)'
    });
    craftAnimations.set(item, {animation, expanded});
    animation.onfinish = () => finishCraft(item, expanded);
  }
  craftItems.forEach(item => item.querySelector('summary').addEventListener('click', event => {
    event.preventDefault();
    const expanded = !(craftAnimations.get(item)?.expanded ?? item.open);
    if (expanded) craftItems.forEach(other => {
      if (other !== item && (craftAnimations.get(other)?.expanded ?? other.open)) toggleCraft(other, false);
    });
    toggleCraft(item, expanded);
  }));
  const finishCraftAnimations = () => [...craftAnimations].forEach(([item,state]) => finishCraft(item, state.expanded));
  addEventListener('resize', finishCraftAnimations);
  reduced.addEventListener('change', finishCraftAnimations);
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function filterGear() {
    const query = normalize($('#searchInput')?.value || '');
    const selected = $$('.gear-filters input:checked').map(input => input.value);
    let count = 0;
    $$('[data-gear-category]').forEach(item => { item.hidden = !(normalize(item.dataset.gearName).includes(query) && (!selected.length || selected.includes(item.dataset.gearCategory))); if (!item.hidden) count++; });
    if ($('#gearCount')) $('#gearCount').textContent = `${count} ${count === 1 ? 'equipamento' : 'equipamentos'}`;
    if ($('#gearEmpty')) $('#gearEmpty').hidden = count > 0;
  }
  $('#searchInput')?.addEventListener('input', filterGear); $$('.gear-filters input').forEach(input => input.addEventListener('change', filterGear));
  const reviews = $$('.review-slide'); let reviewIndex = 0;
  function stepReview(step) { if (!reviews.length) return; reviewIndex = (reviewIndex + step + reviews.length) % reviews.length; reviews.forEach((r,i) => { r.hidden = i !== reviewIndex; }); $('#reviewPosition').textContent = `${String(reviewIndex+1).padStart(2,'0')} / ${String(reviews.length).padStart(2,'0')}`; }
  $$('[data-review-step]').forEach(button => button.addEventListener('click', () => stepReview(Number(button.dataset.reviewStep))));
  let touch = null;
  $('.reviews-stage')?.addEventListener('touchstart', event => { touch = event.changedTouches[0]; }, {passive:true});
  $('.reviews-stage')?.addEventListener('touchend', event => { if (!touch) return; const end = event.changedTouches[0]; const dx = end.clientX - touch.clientX; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(end.clientY-touch.clientY)) stepReview(dx > 0 ? -1 : 1); touch = null; }, {passive:true});
  const cursor = $('.custom-cursor');
  document.addEventListener('pointermove', event => {
    const active = fine.matches && !reduced.matches && !paused && !!event.target.closest('.work-media') && !viewer.open;
    cursor.classList.toggle('is-active', active);
    if (active) cursor.style.transform = `translate(${event.clientX-33}px,${event.clientY-33}px)`;
  }, {passive:true});
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download') || reduced.matches) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol) || url.pathname === location.pathname) return;
    event.preventDefault(); document.body.classList.add('is-leaving'); stopPreview();
    setTimeout(() => location.assign(url.href), 220);
  });
  addEventListener('pageshow', () => document.body.classList.remove('is-leaving'));
  updateMotion();
})();
