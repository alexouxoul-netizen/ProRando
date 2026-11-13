/* Pro Rando V8 : bibliothèque locale IndexedDB, import/export et favoris. */
(()=>{'use strict';
const $=id=>document.getElementById(id);let db=null,records=[],filter='',renameId=null;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function openDB(){return new Promise((resolve,reject)=>{if(!('indexedDB'in window)){reject(new Error('Stockage indisponible'));return;}const r=indexedDB.open('pro-rando-library',1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('routes'))d.createObjectStore('routes',{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function tx(mode,action){return new Promise((resolve,reject)=>{const t=db.transaction('routes',mode),s=t.objectStore('routes');let value;const r=action(s);if(r){r.onsuccess=()=>value=r.result;}t.oncomplete=()=>{resolve(value);if(mode==='readwrite')window.dispatchEvent(new CustomEvent('rv:library-changed'));};t.onabort=t.onerror=()=>reject(t.error||new Error('Écriture interrompue'));});}
async function reload(){records=await tx('readonly',s=>s.getAll());render();}
function render(){if(window.RVSmartLibrary){window.RVSmartLibrary.update(records);return;}const host=$('library-list');if(!host)return;const q=filter.toLocaleLowerCase('fr');const rows=records.filter(r=>r.name.toLocaleLowerCase('fr').includes(q)).sort((a,b)=>Number(b.favorite)-Number(a.favorite)||b.updated-a.updated);$('library-count').textContent=`${records.length} parcours enregistré${records.length>1?'s':''}`;host.innerHTML=rows.length?rows.map(r=>`<article class="library-route"><div class="library-route-main"><strong>${escape(r.name)}</strong><small>${new Date(r.updated).toLocaleDateString('fr-FR')} · ${Math.round(new Blob([r.xml]).size/1024)} Ko</small></div><div class="library-actions"><button type="button" data-open="${escape(r.id)}" aria-label="Ouvrir ${escape(r.name)}">Ouvrir</button><button type="button" data-rename="${escape(r.id)}" aria-label="Renommer ${escape(r.name)}">Renommer</button><button type="button" data-fav="${escape(r.id)}" aria-label="Favori" title="Favori">${r.favorite?'★':'☆'}</button><button type="button" data-delete="${escape(r.id)}" aria-label="Supprimer ${escape(r.name)}" title="Supprimer">✕</button></div></article>`).join(''):'<p class="library-empty">Aucune randonnée trouvée. Importe un GPX pour commencer.</p>';}
function show(){ $('library-panel').hidden=false;$('route-menu').open=false;window.proRandoUI?.showTab?.('randos');reload().catch(report);}
function hide(){window.proRandoUI?.showTab?.('prepare');}
function report(err){console.error('Bibliothèque Pro Rando',err);alert('Bibliothèque indisponible : '+(err?.message||'erreur inconnue'));}
async function save(name,xml){if(!db)throw new Error('Bibliothèque locale indisponible. Réessaie après le démarrage.');if(!xml)throw new Error('GPX manquant');const normalized=name.replace(/\.gpx$/i,'').trim()||'Randonnée';const existing=records.find(r=>r.name===normalized && r.xml===xml);const record={id:existing?.id||('r'+Date.now()+'-'+Math.random().toString(36).slice(2,8)),name:normalized,xml,updated:Date.now(),favorite:!!existing?.favorite};await tx('readwrite',s=>{if(!existing){s.put({...record,visitStatus:'planned'});return;}const request=s.get(existing.id);request.onsuccess=()=>{const current=request.result||existing;s.put({...current,...record,favorite:!!current.favorite});};});await reload();const status=$('rv-storage-status');if(status){status.hidden=true;status.textContent='';}}
async function load(r){if(!r)return;try{window.RVSmartLibrary?.prepareProfile?.();if(!window.RandoVistaRoutes.load(r.xml,r.name,'library'))return;hide();}catch(e){report(e);}}
async function rename(id,value){
 const name=typeof value==='string'?value.trim():'';
 if(!name||name.length>200)throw new Error('Le nom doit contenir entre 1 et 200 caractères.');
 if(!db)throw new Error('Bibliothèque locale indisponible sur cet appareil');
 let previous=null,renamed=null;
 await tx('readwrite',store=>{
  const request=store.get(id);
  request.onsuccess=()=>{const record=request.result;if(!record)return;previous=record;
   if(record.name===name){renamed=record;return;}
   renamed={...record,name,updated:Math.max(Date.now(),(Number(record.updated)||0)+1)};
   store.put(renamed);
  };
 });
 if(!renamed)throw new Error('Ce parcours n’est plus disponible. Recharge la bibliothèque.');
 if(previous.name!==renamed.name)window.RandoVistaRoutes?.rename?.(previous.xml,previous.name,renamed.name);
 await reload();return renamed;
}
async function toggleFavorite(id){
 let saved=null;
 await tx('readwrite',store=>{const request=store.get(id);request.onsuccess=()=>{const current=request.result;if(!current)return;saved={...current,favorite:!current.favorite,updated:Math.max(Date.now(),(Number(current.updated)||0)+1)};store.put(saved);};});
 if(!saved)throw Error('Ce parcours n’est plus disponible. Recharge la bibliothèque.');
 await reload();return saved;
}
async function setVisitStatus(id,value){
 if(!['','planned','done'].includes(value))throw Error('Classement de randonnée invalide.');
 if(!db)throw Error('Bibliothèque locale indisponible sur cet appareil');
 let saved=null;
 await tx('readwrite',store=>{const request=store.get(id);request.onsuccess=()=>{const record=request.result;if(!record)return;
  if((record.visitStatus||'')===value){saved=record;return;}
  saved={...record,updated:Math.max(Date.now(),(Number(record.updated)||0)+1)};
  if(value)saved.visitStatus=value;else delete saved.visitStatus;store.put(saved);
 };});
 if(!saved)throw Error('Ce parcours n’est plus disponible. Recharge la bibliothèque.');
 await reload();return saved;
}
async function importRouteRecords(rows){
 if(!Array.isArray(rows))throw Error('Format de sauvegarde invalide');
 const ids=new Set();for(const row of rows)if(typeof row?.id==='string'){if(ids.has(row.id))throw Error('Identifiants de parcours dupliqués. Aucun parcours importé.');ids.add(row.id);}
 for(const row of rows)if(row&&Object.hasOwn(row,'visitStatus')&&!['planned','done'].includes(row.visitStatus))throw Error('Classement invalide dans la sauvegarde. Aucun parcours importé.');
 let count=0;
 await tx('readwrite',store=>{for(const row of rows){if(!row||typeof row.name!=='string'||typeof row.xml!=='string'||!row.xml.includes('<')||row.xml.length>15000000)continue;
  const id=typeof row.id==='string'?row.id:('r'+Date.now()+'-'+count),request=store.get(id);
  request.onsuccess=()=>{const previous=request.result,next={...previous,id,name:row.name.slice(0,200),xml:row.xml,updated:Number(row.updated)||Date.now(),favorite:!!row.favorite};if(Object.hasOwn(row,'visitStatus'))next.visitStatus=row.visitStatus;store.put(next);};
  count++;
 }});await reload();return count;
}
function download(name,content){const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
async function init(){try{db=await openDB();await reload();$('library-open').disabled=false;}catch(e){$('library-open').disabled=true;console.warn('IndexedDB indisponible',e);}}
$('library-open').addEventListener('click',show);$('library-close').addEventListener('click',hide);
$('library-search').addEventListener('input',e=>{filter=e.target.value;render();});
$('library-list').addEventListener('change',async e=>{const select=e.target,id=select.dataset?.visitStatus;if(!id)return;select.disabled=true;try{await setVisitStatus(id,select.value);}catch(error){report(error);await reload().catch(report);}finally{select.disabled=false;}});
$('library-list').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const id=b.dataset.open||b.dataset.fav||b.dataset.rename||b.dataset.delete;const r=records.find(x=>x.id===id);if(!r)return;try{if(b.dataset.open){await load(r);}else if(b.dataset.rename){openRename(r);}else if(b.dataset.fav){await toggleFavorite(r.id);}else if(b.dataset.delete&&confirm(`Supprimer « ${r.name} » de la bibliothèque ?`)){await tx('readwrite',s=>s.delete(r.id));await reload();}}catch(err){report(err);}});
function openRename(record){renameId=record.id;$('library-rename-input').value=record.name;$('library-rename-message').textContent='';$('library-rename-editor').hidden=false;$('library-rename-editor').scrollIntoView?.({block:'center'});$('library-rename-input').focus?.();$('library-rename-input').select?.();}
function closeRename(){renameId=null;$('library-rename-editor').hidden=true;$('library-search').focus?.();}
$('library-rename-cancel').addEventListener('click',closeRename);
$('library-rename-form').addEventListener('submit',async event=>{event.preventDefault();if(!renameId)return;const id=renameId;$('library-rename-submit').disabled=true;$('library-rename-cancel').disabled=true;$('library-rename-message').textContent='Enregistrement…';try{await rename(id,$('library-rename-input').value);closeRename();}catch(error){$('library-rename-message').textContent=error.message||'Enregistrement impossible. Réessaie.';}finally{$('library-rename-submit').disabled=false;$('library-rename-cancel').disabled=false;}});
$('library-export').addEventListener('click',()=>download('pro-rando-sauvegarde.json',JSON.stringify({app:'Pro Rando',version:8,exported:new Date().toISOString(),routes:records},null,2)));
$('library-import').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data.app!=='Pro Rando'||!Array.isArray(data.routes))throw new Error('Format de sauvegarde invalide');if(!confirm(`Importer ${data.routes.length} parcours dans la bibliothèque ?`))return;const count=await importRouteRecords(data.routes);alert(`${count} parcours importé(s).`);}catch(err){report(err);}finally{e.target.value='';}});
document.addEventListener('rv:route-state',async e=>{if(e.detail?.status!=='ready'||e.detail?.source!=='import')return;const route=window.RandoVistaRoutes.active;if(!route)return;try{await save(route.name,route.xml);}catch(err){console.warn('GPX non sauvegardé',err);const status=$('rv-storage-status');if(status){status.hidden=false;status.textContent='Ce GPX est analysé mais n’a pas pu être enregistré dans Mes randos. Garde ton fichier original et réessaie après avoir libéré du stockage.';}}});
// Lecture seule : expose les GPX effectivement enregistrés, sans modifier leur contenu.
// L'association avec le carnet est TOUJOURS un choix explicite de l'utilisateur.
async function getSavedRoutes(){
 if(!db)throw new Error('Bibliothèque locale indisponible sur cet appareil');
 const result=await tx('readonly',store=>store.getAll());
 return result.filter(r=>typeof r?.id==='string'&&typeof r.name==='string'&&typeof r.xml==='string')
  .map(r=>({id:r.id,name:r.name,xml:r.xml}));
}
window.RandoVistaLibrary={show,reload,save,getSavedRoutes,rename,setVisitStatus,importRouteRecords,getRecords:()=>records.slice()};
window.addEventListener('rv:sync-applied',()=>reload().catch(report));
init();
})();
