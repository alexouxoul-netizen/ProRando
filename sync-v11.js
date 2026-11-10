(function(){'use strict';
const $=id=>document.getElementById(id),C=RVSyncCore,S=RVStore;
let client=null,busy=false,timer=null,pending=null,draft=false;
$('journal-form').addEventListener('input',()=>{draft=true;});
window.addEventListener('rv:journal-entry-saved',()=>{draft=false;schedule();});
const status=text=>{$('rv-sync-status').textContent=text;};
function download(name,data){const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000);}
function displayDate(value){const date=new Date(value);return value&&Number.isFinite(date.getTime())?date.toLocaleString('fr-FR'):'date inconnue';}
async function refreshBackupStatus(){
 const [last,restore,review]=await Promise.all([S.metaGet('backupExport'),S.metaGet('lastRestore'),S.metaGet('restoreReview')]);
 const exported=$('rv-backup-status');if(exported)exported.textContent=last?'Dernier export préparé : '+displayDate(last.preparedAt)+' · '+last.fileName:'Aucune date d’export complet enregistrée sur cet appareil.';
 const restored=$('rv-restore-status');if(restored)restored.textContent=restore?'Dernière restauration : '+displayDate(restore.restoredAt)+(review?.required?' · Synchronisation en attente de ta confirmation.':''):'';
}
async function backup(){
 if(busy)throw Error('Attends la fin de l’opération en cours.');if(draft)throw Error('Enregistre le ressenti en cours avant d’exporter toutes tes données.');busy=true;$('rv-backup-all').disabled=true;
 try{
  const snapshot=await S.snapshot();if(draft)throw Error('Enregistre le ressenti en cours avant d’exporter toutes tes données.');const now=new Date(),pad=n=>String(n).padStart(2,'0');
  const fileName='RandoVista-sauvegarde-'+now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())+'-'+pad(now.getHours())+pad(now.getMinutes())+pad(now.getSeconds())+'.json';
  download(fileName,snapshot);
  try{await S.metaSet('backupExport',{preparedAt:now.toISOString(),fileName,sourceCreatedAt:snapshot.createdAt});await refreshBackupStatus();status('Sauvegarde complète préparée. Vérifie que le fichier est bien présent dans tes téléchargements.');}
  catch(e){status('Le fichier a été préparé, mais la date de cet export n’a pas pu être mémorisée : '+e.message);}
 }finally{busy=false;$('rv-backup-all').disabled=false;}
}
function describe(value){if(value===undefined)return 'Supprimé';return JSON.stringify(value,null,2).slice(0,1200);}
function showConflicts(conflicts){
 const host=$('rv-sync-conflicts');host.replaceChildren();
 for(const c of conflicts){const box=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=c.local?.name||c.remote?.name||c.local?.route||c.remote?.route||c.key;box.append(legend);
  for(const [label,value] of [['Cet appareil',c.local],['Compte partagé',c.remote]]){const d=document.createElement('details'),s=document.createElement('summary'),pre=document.createElement('pre');s.textContent=label;pre.textContent=describe(value);d.append(s,pre);box.append(d);}
  const select=document.createElement('select');select.dataset.key=c.key;select.setAttribute('aria-label','Version à conserver pour '+legend.textContent);
  for(const [v,t] of [['','Choisir la version à conserver…'],['local','Cet appareil'],['remote','Compte partagé']]){const o=document.createElement('option');o.value=v;o.textContent=t;select.append(o);}box.append(select);host.append(box);
 }
 $('rv-resolve').hidden=false;status(conflicts.length+' conflit(s) : aucune donnée remplacée. Choisis les versions à conserver.');
}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>sync(),1200);}
async function session(){if(!client)return null;const {data,error}=await client.auth.getSession();if(error)throw error;return data.session;}
async function sync(resolution){
 if(busy||!client||S.isBlocked?.())return;
 if(draft){status("Synchronisation en pause pendant la saisie du carnet. Enregistre ton ressenti pour reprendre.");return;}
 if(!navigator.onLine){status('Hors connexion · tes modifications restent sur cet appareil.');return;}
 busy=true;$('rv-sync-now').disabled=true;
 try{
  if((await S.metaGet('restoreReview'))?.required){status('Données restaurées sur cet appareil. Clique sur Synchroniser pour confirmer la reprise avec le compte partagé.');return;}
  const auth=await session();if(!auth){status('Mode local · connecte le compte partagé pour synchroniser.');return;}
  const meta=await S.metaGet('sync')||{owner:null,base:{}};
  if(!meta.owner){status('Compte connecté · associe cet appareil pour démarrer la synchronisation.');$('rv-bind').hidden=false;return;}
  if(meta.owner!==auth.user.id)throw Error('Cet appareil est associé à un autre compte. Reconnecte le compte RandoVista initial.');
  $('rv-bind').hidden=true;
  const before=await S.snapshot(),local=S.parse(before);S.validate(local);
  const {data:row,error}=await client.from('rv_spaces').select('revision,data').eq('user_id',auth.user.id).maybeSingle();if(error)throw error;
  const remote=row?.data||{},revision=row?.revision||0;S.validate(remote);
  let choices={};
  if(resolution){if(!pending||!C.equal(local,pending.local)||!C.equal(remote,pending.remote))throw Error('Les données ont changé : vérifie à nouveau les conflits.');choices=resolution;}
  const merged=C.merge(meta.base,local,remote,choices);
  if(merged.conflicts.length){if(!resolution&&pending&&C.equal(pending.local,local)&&C.equal(pending.remote,remote))return;pending={local,remote};await S.metaSet('conflictBackup',{before,remote,base:meta.base});showConflicts(merged.conflicts);return;}
  S.validate(merged.data);
  // Check applicability before publishing (not after server acceptance).
  const next=S.materialize(merged.data,before);
  if(draft)throw Error('Une saisie du carnet a commencé. Enregistre-la avant de reprendre');
  let committedRevision=revision;
  if(!C.equal(merged.data,remote)){
   const {data,error}=await client.rpc('rv_sync_commit',{expected_revision:revision,next_data:merged.data});if(error)throw error;
   if(data?.conflict){status('Un autre appareil vient de modifier les données. Nouvelle tentative…');schedule();return;}
   if(!data||!Number.isSafeInteger(data.revision))throw Error('Réponse serveur invalide');committedRevision=data.revision;
  }
  // Never apply a remote response after an intervening local edit.
  if(draft)throw Error('Une saisie du carnet a commencé. Les données reçues attendent son enregistrement');
  const nextMeta={owner:meta.owner,base:merged.data,revision:committedRevision,lastSync:new Date().toISOString()};
  if(!C.equal(local,merged.data))await S.commit(next,before,nextMeta);
  else{
   const now=await S.snapshot();if(!C.equal(S.parse(now),local))throw Error('Modification locale pendant l’envoi : une nouvelle synchronisation est nécessaire.');
   await S.metaSet('sync',nextMeta);
  }
  pending=null;$('rv-sync-conflicts').replaceChildren();$('rv-resolve').hidden=true;
  status('Synchronisé à '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})+' · '+auth.user.email);
 }catch(e){status('Synchronisation en attente : '+(e.message||'connexion indisponible')+'. Les données locales sont conservées.');}
 finally{busy=false;$('rv-sync-now').disabled=!client;}
}
$('rv-backup-all').onclick=()=>backup().catch(e=>status(e.message));
$('rv-backup-last').onclick=async()=>{try{const b=await S.metaGet('lastBackup');if(b)download('RandoVista-avant-derniere-fusion.json',b);else status('Aucune fusion ni restauration effectuée.');}catch(e){status(e.message);}};
$('rv-backup-initial').onclick=async()=>{try{download('RandoVista-avant-V11.json',await S.metaGet('initialBackup'));}catch(e){status(e.message);}};
$('rv-backup-conflict').onclick=async()=>{try{const b=await S.metaGet('conflictBackup');if(b)download('RandoVista-conflit.json',b);else status('Aucun conflit sauvegardé.');}catch(e){status(e.message);}};
$('rv-restore-all').onchange=async e=>{
 const f=e.target.files?.[0];if(!f)return;
 if(busy){status('Attends la fin de la synchronisation.');e.target.value='';return;}
 busy=true;
 try{
  if(draft)throw Error('Enregistre le ressenti en cours avant de restaurer.');
  document.querySelector('.app-shell').inert=true;
  const incoming=JSON.parse(await f.text()),summary=S.inspectBackup(incoming);
  if(draft)throw Error('Enregistre le ressenti en cours avant de restaurer.');
  const date=summary.createdAt?displayDate(summary.createdAt):'date inconnue';
  if(!confirm('Restaurer la sauvegarde du '+date+' ?\n'+summary.profiles+' profil(s), '+summary.routes+' GPX, '+summary.journal+' retour(s), '+summary.favorites+' favori(s).\nLes données actuelles seront conservées dans une copie de secours avant remplacement. La synchronisation restera en pause jusqu’à ta confirmation.'))return;
  const before=await S.snapshot();if(draft)throw Error('Enregistre le ressenti en cours avant de restaurer.');await S.commit(incoming,before,null,{restoring:true});
  await refreshBackupStatus();status('Sauvegarde restaurée sur cet appareil. Une copie de l’état précédent est disponible. La synchronisation attend ta confirmation.');
 }catch(err){status('Restauration impossible : '+err.message);}finally{busy=false;document.querySelector('.app-shell').inert=!!S.isBlocked?.();e.target.value='';}
};
$('rv-resolve').onclick=()=>{
 const choices=Object.fromEntries([...$('rv-sync-conflicts').querySelectorAll('select')].map(e=>[e.dataset.key,e.value]));
 if(Object.values(choices).some(v=>!v)){status('Choisis une version pour chaque conflit.');return;}sync(choices);
};
$('rv-sync-now').onclick=async()=>{
 if(busy){status('Attends la fin de l’opération en cours.');return;}
 if(draft){status('Enregistre le ressenti en cours avant de synchroniser.');return;}
 try{
  if((await S.metaGet('restoreReview'))?.required){
   if(!confirm('Reprendre la synchronisation des données restaurées avec le compte partagé ? Les différences seront vérifiées et les conflits éventuels te seront présentés avant remplacement.'))return;
   await S.metaSet('restoreReview',null);await refreshBackupStatus();
  }
  await sync();
 }catch(e){status('Synchronisation en attente : '+e.message);}
};
$('rv-bind').onclick=async()=>{
 if(busy){status('Attends la fin de la synchronisation.');return;}
 busy=true;
 try{const a=await session();if(!a)return;
  const current=await S.metaGet('sync');
  if(current?.owner){if(current.owner!==a.user.id)throw Error('Cet appareil est déjà associé à un autre compte');$('rv-bind').hidden=true;schedule();return;}
  if(!confirm('Associer les données de cet appareil au compte '+a.user.email+' ? Une sauvegarde sera conservée avant toute fusion.'))return;
  await S.metaSet('sync',{owner:a.user.id,base:{}});$('rv-bind').hidden=true;schedule();
 }catch(e){status(e.message);}finally{busy=false;}
};
$('rv-login-form').onsubmit=async e=>{
 e.preventDefault();if(!client)return;
 if(busy){status('Attends la fin de la synchronisation.');return;}
 busy=true;$('rv-login-send').disabled=true;
 try{
  const {error}=await client.auth.signInWithPassword({email:$('rv-email').value.trim(),password:$('rv-password').value});
  if(error)throw error;
  status('Compte connecté. La synchronisation va vérifier cet appareil.');schedule();
 }catch(e){status('Connexion impossible : '+e.message);}
 finally{$('rv-password').value='';busy=false;$('rv-login-send').disabled=false;}
};
$('rv-logout').onclick=async()=>{if(busy){status('Attends la fin de la synchronisation.');return;}const {error}=await client.auth.signOut({scope:'local'});status(error?error.message:'Déconnecté · tes données restent disponibles sur cet appareil.');};
const cfg=window.RVCloudConfig;
if(cfg?.url&&cfg?.publishableKey&&!window.RVCloudBlocked){
 try{
  const url=new URL(cfg.url);if(url.protocol!=='https:')throw Error('Une adresse HTTPS est nécessaire');
  client=supabase.createClient(url.origin,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'randovista-v11-auth'}});
  $('rv-cloud-off').hidden=true;$('rv-login-form').hidden=false;$('rv-logout').hidden=false;$('rv-sync-now').disabled=false;
  client.auth.onAuthStateChange(()=>schedule());schedule();
 }catch(e){status('Configuration du compte invalide : '+e.message);}
}else status('V11 TEST · mode local prêt. Le compte partagé sera disponible après configuration.');
for(const ev of ['rv:profile-changed','rv:journal-changed','rv:calibration-changed','rv:library-changed','online'])window.addEventListener(ev,schedule);
window.addEventListener('offline',()=>status('Hors connexion · tes modifications restent sur cet appareil.'));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
setInterval(()=>{if(!document.hidden)sync();},30000);
refreshBackupStatus().catch(e=>{const el=$('rv-backup-status');if(el)el.textContent='Date de sauvegarde indisponible : '+e.message;});
window.RandoVistaSync={sync,backup,refreshBackupStatus};
})();
