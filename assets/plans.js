(() => {
  'use strict';
  if (!document.body.classList.contains('plans-page')) return;
  const tabs = [...document.querySelectorAll('[data-plan-tab]')];
  const panels = [...document.querySelectorAll('.plans-panel')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motionAllowed = () => !reduced.matches && !document.body.classList.contains('motion-paused');
  const list = document.querySelector('.plans-tabs');
  list.setAttribute('role', 'tablist');
  const hashPanel = panels.findIndex(panel => '#'+panel.id === location.hash);
  let active = hashPanel >= 0 ? hashPanel : 0;
  function select(index, animate = true) {
    const scrollPosition = window.scrollY;
    active = index;
    tabs.forEach((tab,i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      tab.classList.toggle('is-active', i === index);
      panels[i].hidden = i !== index;
    });
    if (animate) window.scrollTo({top:scrollPosition,behavior:'instant'});
    if (animate && motionAllowed()) {
      panels[index].animate([{opacity:0, transform:'translateY(8px)'},{opacity:1, transform:'translateY(0)'}], {duration:240,easing:'ease-out'});
    }
  }
  tabs.forEach((tab,i) => {
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls',panels[i].id);
    panels[i].setAttribute('role','tabpanel');
    panels[i].setAttribute('aria-labelledby',tab.id);
    panels[i].tabIndex = 0;
    tab.addEventListener('click',event => { event.preventDefault(); select(i); });
    tab.addEventListener('keydown',event => {
      const next = event.key === 'ArrowRight' ? (active+1)%tabs.length : event.key === 'ArrowLeft' ? (active+tabs.length-1)%tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1 : null;
      if (next != null) { event.preventDefault(); select(next); tabs[next].focus({preventScroll:true}); }
      if (event.key === ' ') { event.preventDefault(); select(i); }
    });
  });
  select(active, false);
  document.body.classList.add('plans-enhanced');
  document.querySelectorAll('.plans-condition').forEach(details => {
    const summary = details.querySelector('summary');
    const answer = details.querySelector('.condition-answer');
    let timer;
    let expanded = false;
    summary.setAttribute('aria-expanded','false');
    summary.addEventListener('click',event => {
      event.preventDefault();
      clearTimeout(timer);
      expanded = !expanded;
      summary.setAttribute('aria-expanded',String(expanded));
      if (expanded) {
        details.open = true;
        // Establish the collapsed size before transitioning to the content's natural height.
        void answer.offsetHeight;
        details.classList.add('is-expanded');
      } else {
        details.classList.remove('is-expanded');
        timer = setTimeout(() => { if (!expanded) details.open = false; },motionAllowed()?260:0);
      }
    });
  });
})();
