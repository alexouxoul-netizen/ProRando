/* Bridge keeps all legacy keys, DB names and record fields. */
(function(){'use strict';
const KEYS=['pro-rando-hiker-profiles-v81','pro-rando-journal-v82','randovista-calibration-v944'];
const request=r=>new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
function open(name,store,opts){return new Promise((resolve,reject)=>{const r=indexedDB.open(name,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(store))r.result.createObjectStore(store,opts);};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Ferme les autres onglets RandoVista puis réessaie.'));});}
let routesDB,metaDB,blocked=false;
async function transaction(db,store,mode,action){return new Promise((resolve,reject)=>{const t=db.transaction(store,mode);let result;try{const r=action(t.objectStore(store));if(r)r.onsuccess=()=>{result=r.result;};}catch(e){t.abort();reject(e);return;}t.oncomplete=()=>resolve(result);t.onabort=t.onerror=()=>reject(t.error||Error('Écriture interrompue'));});}
const metaGet=key=>transaction(metaDB,'state','readonly',s=>s.get(key));
const metaSet=(key,value)=>transaction(metaDB,'state','readwrite',s=>s.put(value,key));
const raw=()=>Object.fromEntries(KEYS.map(k=>[k,localStorage.getItem(k)]));
function writeRaw(values){for(const k of KEYS){if(values[k]===null)localStorage.removeItem(k);else localStorage.setItem(k,values[k]);}}
async function writeRoutes(routes){await transaction(routesDB,'routes','readwrite',s=>{s.clear();for(const r of routes)s.put(r);});}
async function snapshot(){
 const before=raw(),routes=await transaction(routesDB,'routes','readonly',s=>s.getAll());
 if(!RVSyncCore.equal(before,raw()))throw Error('Données en cours de modification. Réessaie dans un instant.');
 return {app:'RandoVista',type:'complete-backup',version:11,createdAt:new Date().toISOString(),localStorage:before,routes};
}
function parse(snapshot){
 const result=Object.create(null),values=snapshot.localStorage;
 const p=values[KEYS[0]]===null?{profiles:[],selected:null}:JSON.parse(values[KEYS[0]]);
 const j=values[KEYS[1]]===null?[]:JSON.parse(values[KEYS[1]]);
 const a=values[KEYS[2]]===null?{version:944,enabled:{},resetAt:{}}:JSON.parse(values[KEYS[2]]);
 if(!Array.isArray(p.profiles)||!Array.isArray(j)||!a.enabled||!a.resetAt)throw Error('Données locales illisibles : exporte une sauvegarde avant de continuer.');
 function add(prefix,items){for(const v of items){if(typeof v.id!=='string'||!v.id||result[prefix+v.id])throw Error('Identifiants invalides ou dupliqués');result[prefix+v.id]=v;}}
 add('profile/',p.profiles);add('journal/',j);add('route/',snapshot.routes);
 for(const id of new Set([...Object.keys(a.enabled),...Object.keys(a.resetAt)])){
  result['calibration/'+id]={};if(Object.hasOwn(a.enabled,id))result['calibration/'+id].enabled=a.enabled[id];if(Object.hasOwn(a.resetAt,id))result['calibration/'+id].resetAt=a.resetAt[id];
 }
 return result;
}
function validate(data){
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Données distantes invalides');
 const profiles=[],journal=[],routes=[],calibration={version:944,enabled:{},resetAt:{}};
 for(const [key,v] of Object.entries(data)){
  const slash=key.indexOf('/'),kind=key.slice(0,slash),id=key.slice(slash+1);
  if(!id||['__proto__','constructor','prototype'].includes(id)||!v||typeof v!=='object')throw Error('Identifiant distant invalide');
  if(kind==='profile'){if(v.id!==id)throw Error('Profil invalide');profiles.push(v);}
  else if(kind==='journal'){if(v.id!==id)throw Error('Sortie invalide');journal.push(v);}
  else if(kind==='route'){if(v.id!==id||typeof v.name!=='string'||typeof v.xml!=='string'||v.xml.length>15000000||typeof v.favorite!=='boolean'||!Number.isFinite(v.updated))throw Error('GPX distant invalide');routes.push(v);}
  else if(kind==='calibration'){if(Object.hasOwn(v,'enabled'))calibration.enabled[id]=v.enabled;if(Object.hasOwn(v,'resetAt'))calibration.resetAt[id]=v.resetAt;}
  else throw Error('Version de données non prise en charge');
 }
 if(profiles.length&&!window.proRandoProfiles?.validate?.({profiles,selected:profiles[0].id}))throw Error('Profils invalides ou limite dépassée');
 if(journal.length>600||!journal.every(e=>window.RandoVistaJournal?.validate?.(e)))throw Error('Carnet invalide ou limite dépassée');
 if(!window.RandoVistaAdaptive?.validSettings(calibration))throw Error('Calibration invalide');
 return {profiles,journal,routes,calibration};
}
function materialize(data,previous){
 const {profiles,journal,routes,calibration}=validate(data);
 const values={...previous.localStorage};
 if(!profiles.length)throw Error('La synchronisation doit conserver au moins un profil.');
 const old=values[KEYS[0]]?JSON.parse(values[KEYS[0]]):{};
 values[KEYS[0]]=JSON.stringify({...old,profiles,selected:profiles.some(p=>p.id===old.selected)?old.selected:profiles[0].id});
 values[KEYS[1]]=JSON.stringify(journal);values[KEYS[2]]=JSON.stringify(calibration);
 return {...previous,localStorage:values,routes};
}
async function commit(next,expected,meta){
 if(blocked)throw Error("Rouvre RandoVista pour terminer la récupération des données.");
 const current=await snapshot();
 if(!RVSyncCore.equal(current.localStorage,expected.localStorage)||!RVSyncCore.equal(current.routes,expected.routes))throw Error('Les données ont changé pendant la synchronisation. Nouvelle tentative nécessaire.');
 document.querySelector('.app-shell').inert=true;
 try{
  await metaSet('recovery',current); // Durable before any mutation; startup rolls back interrupted writes.
  writeRaw(next.localStorage);await writeRoutes(next.routes);
  await transaction(metaDB,'state','readwrite',s=>{s.put(current,'lastBackup');if(meta)s.put(meta,'sync');s.delete('recovery');});
 }catch(e){
  try{writeRaw(current.localStorage);await writeRoutes(current.routes);await transaction(metaDB,'state','readwrite',s=>s.delete('recovery'));}catch(_){blocked=true;throw Error('Restauration nécessaire : ferme puis rouvre RandoVista avant toute modification.');}
  throw e;
 }finally{document.querySelector('.app-shell').inert=blocked;}
 window.dispatchEvent(new CustomEvent('rv:sync-applied'));
}
async function init(){
 [routesDB,metaDB]=await Promise.all([open('pro-rando-library','routes',{keyPath:'id'}),open('randovista-v11-state','state')]);
 const pending=await metaGet('recovery');if(pending){writeRaw(pending.localStorage);await writeRoutes(pending.routes);await transaction(metaDB,'state','readwrite',s=>s.delete('recovery'));}
 if(!await metaGet('initialBackup'))await metaSet('initialBackup',await snapshot());
}
window.RVStore={isBlocked:()=>blocked,init,snapshot,parse,validate,materialize,commit,metaGet,metaSet,KEYS};
})();
