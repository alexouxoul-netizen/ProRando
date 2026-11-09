(async function(){'use strict';
const shell=document.querySelector('.app-shell');shell.inert=true;
function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error('Fichier indisponible : '+src));document.body.append(s);});}
async function start(){
 await load('sync-core-v11.js');await load('storage-v11.js');await RVStore.init();
 for(const src of ['leaflet.js','chart.umd.js','supabase.js','cloud-config.js','gpx-engine.js','script.js','ui-v7.js','radar-v73.js','climbs-v74.js','verdict-v75.js','library-v8.js','profiles-v81.js','journal-v944.js','adaptive-v944.js','v9.js','polish-v97.js','dashboard-v100.js','compare-v102.js','recap-v103.js','compare-gpx-v104.js','advisor-v105.js','sync-v11.js'])await load(src);
 document.getElementById('layer-select').addEventListener('change',changeLayer);
 shell.inert=false;
 if('serviceWorker'in navigator){try{await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready;document.getElementById('rv-offline-status').textContent='Application prête hors connexion. Les fonds de carte nécessitent le réseau ; le tracé et les analyses restent disponibles.';}catch(e){document.getElementById('rv-offline-status').textContent='Cache hors connexion non installé. Réessaie avec une connexion.';}}
}
function failure(e){shell.inert=true;const p=document.createElement('p');p.className='rv-boot-error';p.textContent='RandoVista ne peut pas démarrer : '+e.message+' Tes données ne sont pas effacées. Ferme les autres onglets puis recharge cette page.';document.body.prepend(p);}
try{
 if(!navigator.locks){window.RVCloudBlocked=true;await start();document.getElementById('rv-offline-status').textContent='Mode local : HTTPS et un navigateur récent sont nécessaires au compte partagé et au cache hors connexion.';return;}
 await navigator.locks.request('randovista-v11-app',{ifAvailable:true},async lock=>{
  if(!lock)throw Error('RandoVista est déjà ouvert dans un autre onglet');
  await start();await new Promise(resolve=>window.addEventListener('pagehide',resolve,{once:true}));
 });
}catch(e){failure(e);}
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
})();
