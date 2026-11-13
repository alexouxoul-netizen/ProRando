(function(){'use strict';
 const CACHE='randovista-v1154-rc2-expert-20261113';
 const $=id=>document.getElementById(id);let busy=false,ready=false;
 function network(){const el=$('rv-network-status');if(el){el.textContent=navigator.onLine?'Réseau détecté · les données restent enregistrées sur cet appareil.':'Hors connexion · parcours enregistrés, analyses et carnet disponibles sur cet appareil.';el.dataset.offline=String(!navigator.onLine);}}
 function status(text){const el=$('rv-offline-status');if(el)el.textContent=text;}
 function waitActivated(worker){return new Promise((resolve,reject)=>{if(worker.state==='activated'){resolve(worker);return;}let timer=setTimeout(()=>finish(Error('Une mise à jour attend la fermeture des onglets. Ferme toutes les fenêtres RandoVista, puis rouvre l’application.')),15000);const changed=()=>{if(worker.state==='activated')finish();else if(worker.state==='redundant')finish(Error('La préparation a été interrompue.'));};function finish(error){clearTimeout(timer);worker.removeEventListener('statechange',changed);error?reject(error):resolve(worker);}worker.addEventListener('statechange',changed);changed();});}
 function message(worker,type){return new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('Le cache hors connexion ne répond pas.'));},5000);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();e.data?.error?reject(Error(e.data.error)):resolve(e.data);};worker.postMessage({type},[channel.port2]);});}
 async function prepare(options={}){
  if(busy)return ready;busy=true;const button=$('rv-offline-refresh');if(button)button.disabled=true;
  try{
   if(!('serviceWorker'in navigator))throw Error('Le hors connexion nécessite HTTPS et un navigateur compatible.');
   let registration=await navigator.serviceWorker.getRegistration('./');
   try{registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});}catch(error){if(!registration?.active)throw error;}
   const candidate=registration.installing||registration.waiting;
   if(candidate)await waitActivated(candidate);
   const worker=registration.active||candidate;if(!worker)throw Error('Ouvre l’application avec une connexion pour préparer le hors connexion.');
   if(options.refresh&&navigator.onLine)await message(worker,'RV_OFFLINE_REFRESH');
   const check=await message(worker,'RV_OFFLINE_STATUS');
   ready=check.cache===CACHE&&check.ready===true;
   if(!ready)throw Error(check.cache!==CACHE?'Une autre version est encore active. Ferme complètement puis rouvre l’application.':'Certains fichiers manquent. Prépare le hors connexion avec une connexion.');
   status('Application prête hors connexion : parcours enregistrés, analyses et carnet. Les fonds de carte nécessitent le réseau.');return true;
  }catch(error){ready=false;status('Hors connexion non confirmé : '+(error.message||'préparation indisponible')+' Les données enregistrées sont conservées.');return false;}
  finally{busy=false;if(button)button.disabled=false;network();}
 }
 $('rv-offline-refresh')?.addEventListener('click',()=>prepare({refresh:true}));
 window.addEventListener('online',network);window.addEventListener('offline',network);network();
 window.RVOffline={prepare,get ready(){return ready;},cacheVersion:CACHE};
})();
