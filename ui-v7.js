/* Interface Pro Rando V7 — présentation uniquement, moteur GPX V6.5 conservé */
(() => {
 const $ = id => document.getElementById(id);
 const chartEl = $('chart-container');
 const tabs = ['map','profile','difficulties','analysis'];
 let activeTab = 'map';
 function resizeVisuals(){requestAnimationFrame(()=>{if(typeof map!=='undefined')map.invalidateSize();if(typeof chart!=='undefined'&&chart)chart.resize();});}
 function moveChart(host){if(host && chartEl.parentNode!==host){host.appendChild(chartEl);resizeVisuals();}}
 function showTab(tab){if(!tabs.includes(tab))return;activeTab=tab;tabs.forEach(t=>{$('view-'+t).hidden=t!==tab;document.querySelector(`[data-tab="${t}"]`).classList.toggle('active',t===tab);});if(tab==='profile'){moveChart($('chart-slot-profile'));}else if(tab==='map'&&!$('profile-sheet').hidden){moveChart($('chart-slot-sheet'));}resizeVisuals();}
 document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
 function openSheet(){showTab('map');$('profile-sheet').hidden=false;moveChart($('chart-slot-sheet'));resizeVisuals();}
 $('map-profile-button').addEventListener('click',openSheet);
 $('profile-on-map').addEventListener('click',openSheet);
 $('sheet-close').addEventListener('click',()=>{$('profile-sheet').hidden=true;moveChart($('chart-slot-profile'));resizeVisuals();});
 $('sheet-expand').addEventListener('click',()=>{showTab('profile');$('profile-sheet').hidden=true;});
 $('map-fullscreen').addEventListener('click',()=>{document.querySelector('.app-shell').classList.toggle('map-full');resizeVisuals();});

 $('summary-toggle').addEventListener('click',()=>{const el=$('summary-expanded');el.hidden=!el.hidden;$('summary-toggle').setAttribute('aria-expanded',String(!el.hidden));});
 $('change-route').addEventListener('click',()=>{$('route-menu').open=false;$('gpx-file').click();});
 $('gpx-file').addEventListener('change',e=>{const f=e.target.files?.[0];if(f){$('route-name').textContent=f.name;$('summary-title').textContent=f.name.replace(/\.gpx$/i,'');$('route-menu').open=false;showTab('map');setTimeout(refreshSummary,200);setTimeout(refreshSummary,700);}});
 function refreshSummary(){const txt=id=>$(id)?.textContent?.trim()||'—';$('summary-distance').textContent=txt('dist-total')+' km';$('summary-ascent').textContent=txt('d-plus');$('summary-time').textContent=txt('walking-time');$('summary-effort').textContent=txt('effort-distance');$('summary-grade').textContent=txt('difficulty-level');$('summary-subtitle').textContent=txt('dist-total')+' km · D+ '+txt('d-plus');}
 new MutationObserver(refreshSummary).observe($('difficulty-level'),{childList:true,characterData:true,subtree:true});
 $('distance-override').addEventListener('change',()=>setTimeout(refreshSummary,150));
 // Les alertes V6.5 restent cliquables et recentrent la carte même depuis un autre onglet.
 $('descent-alert').addEventListener('click',e=>{if(e.target.closest('.descent-jump')){showTab('map');setTimeout(resizeVisuals,60);}},true);
 // Le profil doit rester présent dans un conteneur visible lors de l'import.
 moveChart($('chart-slot-profile'));showTab('map');
 window.addEventListener('resize',resizeVisuals);
})();
