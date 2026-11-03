/* Interface Pro Rando V7 — présentation uniquement, moteur GPX V6.5 conservé */
(() => {
 const $ = id => document.getElementById(id);
 const chartEl = $('chart-container');
 const tabs = ['prepare','evaluate','randos'];
 let activeTab = 'prepare';
 function resizeVisuals(){requestAnimationFrame(()=>{if(typeof map!=='undefined')map.invalidateSize();if(typeof chart!=='undefined'&&chart)chart.resize();if(typeof gainChart!=='undefined'&&gainChart)gainChart.resize();});}
 function moveChart(host){if(host && chartEl.parentNode!==host){host.appendChild(chartEl);resizeVisuals();}}
 function showTab(tab){
   const alias={map:'prepare',profile:'prepare',difficulties:'prepare',analysis:'prepare',library:'randos'};
   tab=alias[tab]||tab;
   if(!tabs.includes(tab))return;
   if(tab!=='prepare')toggleLegend(false);
   activeTab=tab;
   tabs.forEach(t=>{ $('view-'+t).hidden=t!==tab;document.querySelector(`[data-tab="${t}"]`).classList.toggle('active',t===tab); });
   if(tab==='prepare'){
     const host=$('profile-sheet').hidden?$('chart-slot-compare'):$('chart-slot-sheet');
     moveChart(host);
   }
   resizeVisuals();
 }
 document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
 function openSheet(){showTab('prepare');$('profile-sheet').hidden=false;moveChart($('chart-slot-sheet'));resizeVisuals();}
 $('map-profile-button').addEventListener('click',openSheet);
 $('compare-on-map').addEventListener('click',()=>{showTab('prepare');$('profile-sheet').hidden=true;moveChart($('chart-slot-compare')); const idx=window.proRandoRelief?.getIndex();if(Number.isInteger(idx)&&idx>=0){window.proRandoRelief.select(idx);requestAnimationFrame(()=>{map.invalidateSize();window.proRandoRelief.focusOnMap();});}});
 const legendToggle=$('legend-toggle'), legendPanel=$('slope-legend');
 function toggleLegend(force){const open=typeof force==='boolean'?force:legendPanel.hidden;legendPanel.hidden=!open;legendToggle.setAttribute('aria-expanded',String(open));}
 legendToggle.addEventListener('click',()=>toggleLegend());
 $('legend-close').addEventListener('click',()=>toggleLegend(false));
 map.on('click',()=>toggleLegend(false));
 $('profile-on-map').addEventListener('click',()=>{openSheet();requestAnimationFrame(()=>{map.invalidateSize();window.proRandoRelief?.focusOnMap();});});
 $('sheet-close').addEventListener('click',()=>{$('profile-sheet').hidden=true;moveChart($('chart-slot-compare'));resizeVisuals();});
 $('sheet-expand').addEventListener('click',()=>{showTab('prepare');$('profile-sheet').hidden=true;});
 $('map-fullscreen').addEventListener('click',()=>{document.querySelector('.app-shell').classList.toggle('map-full');resizeVisuals();});

 $('rv93-library')?.addEventListener('click',()=>window.RandoVistaLibrary?.show());
 $('summary-toggle').addEventListener('click',()=>{const el=$('summary-expanded');el.hidden=!el.hidden;$('summary-toggle').setAttribute('aria-expanded',String(!el.hidden));});
 $('change-route').addEventListener('click',()=>{$('route-menu').open=false;$('gpx-file').click();});
 function refreshSummary(){
   const route=window.RandoVistaRoutes?.active;
   const txt=id=>$(id)?.textContent?.trim()||'—';
   const loaded=!!route;
   $('summary-title').textContent=loaded?route.name:'Aucun parcours sélectionné';
   $('summary-distance').textContent=loaded?txt('dist-total')+' km':'—';
   $('summary-ascent').textContent=loaded?txt('d-plus'):'—';
   $('summary-time').textContent=loaded?txt('walking-time'):'—';
   $('summary-effort').textContent=loaded?txt('effort-distance'):'—';
   const grade=loaded?txt('difficulty-level'):'—';
   $('summary-grade').hidden=!loaded||grade==='—'||grade==='-';
   $('summary-grade').textContent=grade;
   $('summary-subtitle').textContent=loaded?txt('dist-total')+' km · D+ '+txt('d-plus'):'Choisissez une randonnée pour afficher son analyse personnalisée.';
   const cta=document.querySelector('.v91-cta');
   cta?.classList.toggle('rv-route-ready',loaded);
   const heading=cta?.querySelector('strong');
   if(heading)heading.textContent=loaded?'Parcours chargé':'Choisissez votre itinéraire';
   const hint=cta?.querySelector('p');
   if(hint)hint.textContent=loaded?route.name:'Importez un GPX ou retrouvez une randonnée enregistrée.';
   const importLabel=cta?.querySelector('.v91-import');
   if(importLabel)importLabel.textContent=loaded?'↻ Changer':'＋ Importer un GPX';
 }
 document.addEventListener('rv:route-state',e=>{
   if(e.detail?.status==='loading'){$('summary-subtitle').textContent='Analyse en cours…';return;}
   refreshSummary();
 });
 document.addEventListener('pr:route-loaded',()=>{showTab('prepare');refreshSummary();});
 refreshSummary();
 // Les alertes V6.5 restent cliquables et recentrent la carte même depuis un autre onglet.
 $('descent-alert').addEventListener('click',e=>{if(e.target.closest('.descent-jump')){showTab('prepare');setTimeout(resizeVisuals,60);}},true);
 // Le profil doit rester présent dans un conteneur visible lors de l'import.
 moveChart($('chart-slot-compare'));showTab('prepare');
 document.addEventListener('pr:route-loaded',e=>{
   if(e.detail?.name) $('route-name').textContent=e.detail.name.replace(/\.gpx$/i,'')+'.gpx';
   showTab('prepare');refreshSummary();setTimeout(refreshSummary,150);setTimeout(refreshSummary,600);
 });
 window.proRandoUI={showTab,showMapPoint:(index)=>{
   showTab('prepare');
   $('profile-sheet').hidden=true;
   moveChart($('chart-slot-compare'));
   if(Number.isInteger(index))window.proRandoRelief?.select(index);
   // Le conteneur Préparer défile indépendamment de la page sur mobile.
   // Amener la carte à l'écran AVANT le zoom, sinon le clic semble inactif.
   const view=$('view-prepare'), mapWrap=document.querySelector('.v9-map');
   if(view&&mapWrap){view.scrollTo({top:Math.max(0,mapWrap.offsetTop-view.offsetTop-12),behavior:'smooth'});mapWrap.scrollIntoView({behavior:'smooth',block:'center'});}
   requestAnimationFrame(()=>{map.invalidateSize();window.proRandoRelief?.focusOnMap();});
   setTimeout(()=>{map.invalidateSize();window.proRandoRelief?.focusOnMap();},350);
 }};
 window.addEventListener('resize',resizeVisuals);
})();
