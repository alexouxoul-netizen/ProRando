/* RandoVista V9.7 — ergonomic polish. No change to GPX, profiles or journal. */
(() => {
  'use strict';
  const button = document.getElementById('rv-back-top');
  const shell = document.querySelector('.app-shell');
  const tabs = [...document.querySelectorAll('.bottom-nav [data-tab]')];
  const views = ['prepare','evaluate','randos'].map(t => document.getElementById('view-'+t));
  if(!button || !shell || !views.every(Boolean)) return;
  const activeView = () => views.find(v => !v.hidden) || views[0];
  function update(){
    const view = activeView();
    button.hidden = !!(shell.classList.contains('map-full') || view.scrollTop < 380);
    tabs.forEach(t => {
      if(t.classList.contains('active')) t.setAttribute('aria-current','page');
      else t.removeAttribute('aria-current');
    });
  }
  views.forEach(v => v.addEventListener('scroll',update,{passive:true}));
  tabs.forEach(t => t.addEventListener('click',() => requestAnimationFrame(update)));
  document.addEventListener('pr:route-loaded',() => requestAnimationFrame(update));
  document.getElementById('map-fullscreen')?.addEventListener('click',() => requestAnimationFrame(update));
  button.addEventListener('click', () => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    activeView().scrollTo({top:0,behavior:reduced?'auto':'smooth'});
    if(reduced) update();
  });
  update();
})();
