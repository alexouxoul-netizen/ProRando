/* RandoVista V9.4.3 TEST — carnet fiable, compatible avec les journaux V8.2.
   Pas d'apprentissage automatique : les prévisions sont enregistrées à titre de référence. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
// Ne pas renommer cette clé : les anciens carnets doivent rester disponibles après mise à jour.
const KEY='pro-rando-journal-v82', MAX=600;
const terrainValues=['rocks','technical','exposed','mud'];
const tiers=['low','moderate','high','unknown'];
const feelings={repeat:'À refaire',possible:'Exigeante mais faisable',avoid:'À éviter'};
let entries=[];
let fingerprintSource=null, fingerprintValue=null;
const id=()=>('j'+Date.now().toString(36)+Math.random().toString(36).slice(2,11));
const str=(v)=>typeof v==='string'?v:'';
const dateIsValid=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const [y,m,d]=s.split('-').map(Number);const dt=new Date(Date.UTC(y,m-1,d));return dt.getUTCFullYear()===y&&dt.getUTCMonth()===m-1&&dt.getUTCDate()===d;};
function valid(e){
 if(!e||typeof e!=='object'||Array.isArray(e)||typeof e.id!=='string'||!e.id||e.id.length>100||typeof e.profileId!=='string'||!e.profileId||e.profileId.length>200||typeof e.profileName!=='string'||e.profileName.length>200||typeof e.route!=='string'||!e.route||e.route.length>300||!dateIsValid(e.date)||![1,2,3,4,5].includes(e.effort)||![1,2,3,4,5].includes(e.fatigue)||!['easy','ok','hard'].includes(e.up)||!['easy','ok','hard'].includes(e.down)||!['repeat','possible','avoid'].includes(e.feeling)||!Array.isArray(e.terrain)||e.terrain.length>terrainValues.length||!e.terrain.every(v=>terrainValues.includes(v))||typeof e.notes!=='string'||e.notes.length>1200)return false;
 if(e.routeKey!==undefined&&(typeof e.routeKey!=='string'||e.routeKey.length>80))return false;
 if(e.prediction!==undefined){const p=e.prediction;if(!p||typeof p!=='object'||Array.isArray(p)||!tiers.includes(p.tier)||typeof p.verdict!=='string'||p.verdict.length>200||typeof p.physicalGrade!=='string'||p.physicalGrade.length>15||!Number.isInteger(p.profileLevel)||p.profileLevel<0||p.profileLevel>4||!Number.isFinite(p.distanceKm)||p.distanceKm<0||p.distanceKm>10000||!Number.isFinite(p.ascentM)||p.ascentM<0||p.ascentM>100000)return false;}
 return true;
}
try{
 const data=JSON.parse(localStorage.getItem(KEY)||'[]');
 if(Array.isArray(data)){
  entries=data.filter(valid).slice(0,MAX);
  if(entries.length!==data.length)console.warn('RandoVista : certains retours du carnet sont invalides ou dépassent la limite ; conserver une sauvegarde avant toute modification.');
 }
}catch(e){console.warn('Carnet illisible : conservation de la donnée brute dans le stockage',e);}
function persist(next){ // Transaction : ne mettre à jour la mémoire qu'après réussite du stockage.
 localStorage.setItem(KEY,JSON.stringify(next));entries=next;
}
function active(){return window.proRandoProfiles?.getActive?.()||null;}
function route(){return window.RandoVistaRoutes?.active||null;}
function currentRouteName(){const r=route();return r?str(r.name).replace(/\.gpx$/i,'').slice(0,200):null;}
// Identifiant stable pour le contenu exact d'un GPX : évite de confondre deux fichiers de même nom.
// Empreinte non cryptographique : ce n'est pas une preuve d'authenticité du fichier.
function routeKey(r){
 if(!r||typeof r.xml!=='string')return null;
 if(r.xml===fingerprintSource&&fingerprintValue)return fingerprintValue;
 const xml=r.xml;let h1=0x811c9dc5,h2=0x9e3779b9;
 for(let i=0;i<xml.length;i++){
  const n=xml.charCodeAt(i);
  h1=Math.imul(h1^n,0x01000193);
  h2=Math.imul(h2^(n+(i&255)),0x85ebca6b);
 }
 fingerprintSource=xml;
 fingerprintValue='gpx-'+xml.length.toString(36)+'-'+(h1>>>0).toString(16).padStart(8,'0')+'-'+(h2>>>0).toString(16).padStart(8,'0');
 return fingerprintValue;
}
function todayLocal(){const d=new Date(),pad=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function node(tag,cls,value){const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n;}
function snapshot(p){
 const status=$('verdict-status');const tier=tiers.includes(status?.dataset.level)?status.dataset.level:'unknown';
 const distance=Number.parseFloat(str($('dist-total')?.textContent).replace(',','.'));
 const ascent=Number.parseFloat(str($('d-plus')?.textContent).replace(/\s/g,'').replace(',','.'));
 return {tier,verdict:str(status?.textContent).trim().slice(0,200),physicalGrade:str($('difficulty-level')?.textContent).trim().slice(0,15),profileLevel:p.level,distanceKm:Number.isFinite(distance)&&distance>=0?distance:0,ascentM:Number.isFinite(ascent)&&ascent>=0?ascent:0};
}
function refresh(){
 const p=active(),r=route(),name=currentRouteName(),sim=!!p?.temporary;
 const ctx=$('journal-context');
 if(!r)ctx.textContent='Aucune randonnée chargée · Choisissez un GPX pour enregistrer votre ressenti.';
 else ctx.textContent='Parcours : '+name+' · Profil : '+(p?.name||'—')+(sim?' · Simulation active (enregistrement désactivé)':'');
 $('journal-route-actions').hidden=!!r;
 $('journal-form').querySelector('[type=submit]').disabled=!r||!p||sim;
 const all=$('journal-history-filter').value==='all';
 const visible=(all?entries:entries.filter(e=>e.profileId===p?.id)).slice().sort((a,b)=>b.date.localeCompare(a.date)||(Number(b.created)||0)-(Number(a.created)||0));
 $('journal-count').textContent=visible.length+' sortie'+(visible.length>1?'s':'');
 const host=$('journal-history');host.replaceChildren();
 if(!visible.length){host.append(node('p','journal-empty',all?'Aucune sortie enregistrée dans ce carnet.':'Aucun ressenti enregistré pour ce profil.'));return;}
 const key=routeKey(r);
 for(const e of visible.slice(0,30)){
  const item=node('article','journal-entry');
  const title=node('strong','',e.route);item.append(title);
  const line=e.date.split('-').reverse().join('/')+' · Difficulté '+e.effort+'/5 · Fatigue '+e.fatigue+'/5 · '+feelings[e.feeling];
  item.append(node('small','',line));
  if(all)item.append(node('small','journal-entry-profile','👤 '+e.profileName));
  if(key&&e.routeKey===key)item.append(node('span','journal-route-match','✓ Même tracé GPX'));
  if(e.prediction)item.append(node('small','journal-prediction','Prévision lors de l’évaluation : '+(e.prediction.verdict||'Indisponible')+' · Profil niveau '+(e.prediction.profileLevel+1)+'/5'));
  if(e.terrain?.length)item.append(node('small','journal-entry-terrain','Terrain : '+e.terrain.map(t=>({rocks:'pierriers',technical:'passages techniques',exposed:'passages exposés',mud:'terrain glissant'}[t])).join(', ')));
  if(e.notes)item.append(node('p','',e.notes));
  const del=node('button','','Supprimer ce retour');del.type='button';
  del.addEventListener('click',()=>{
   if(!confirm('Supprimer définitivement ce retour d’expérience ?'))return;
   try{persist(entries.filter(x=>x.id!==e.id));$('journal-message').textContent='Retour supprimé.';refresh();}
   catch(err){$('journal-message').textContent='Suppression impossible : '+err.message;}
  });
  item.append(del);host.append(item);
 }
 if(visible.length>30)host.append(node('p','journal-empty','Seuls les 30 retours les plus récents sont affichés. L’export contient les '+visible.length+' retours de cette sélection.'));
}
$('journal-date').value=todayLocal();$('journal-date').max=todayLocal();
for(const field of ['effort','fatigue'])$('journal-'+field).addEventListener('input',e=>$('journal-'+field+'-label').textContent=e.target.value+'/5');
$('journal-history-filter').addEventListener('change',refresh);
$('journal-open-library').addEventListener('click',()=>window.RandoVistaLibrary?.show());
$('journal-choose-gpx').addEventListener('click',()=>$('gpx-file').click());
$('journal-form').addEventListener('submit',event=>{
 event.preventDefault();
 const p=active(),r=route(),name=currentRouteName(),msg=$('journal-message');
 if(!p||p.temporary||!r||!name){msg.textContent='Choisis un parcours et désactive la simulation pour enregistrer.';return;}
 if(entries.length>=MAX){msg.textContent='Carnet plein : exporte une sauvegarde avant de supprimer d’anciens retours.';return;}
 const date=$('journal-date').value;
 if(!dateIsValid(date)||date>todayLocal()){msg.textContent='Indique une date de sortie valide, sans dépasser aujourd’hui.';return;}
 const entry={
  id:id(),profileId:p.id,profileName:p.name,route:name,routeKey:routeKey(r),date,
  effort:Number($('journal-effort').value),fatigue:Number($('journal-fatigue').value),
  up:$('journal-up').value,down:$('journal-down').value,
  terrain:[...document.querySelectorAll('#journal-form input[name="terrain"]:checked')].map(x=>x.value),
  feeling:$('journal-feeling').value,notes:$('journal-notes').value.trim().slice(0,1200),
  created:Date.now(),prediction:snapshot(p)
 };
 if(!valid(entry)){msg.textContent='Certaines informations sont invalides. Vérifie le formulaire.';return;}
 try{persist([entry,...entries]);msg.textContent='✓ Ressenti enregistré pour '+p.name+' sur « '+name+' ».';refresh();}
 catch(err){msg.textContent='Enregistrement impossible : espace de stockage plein ou indisponible. Exporte ton carnet. '+err.message;}
});
function download(data){
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='randovista-carnet-v943.json';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),5000);
}
$('journal-export').addEventListener('click',()=>download({app:'RandoVista',type:'hike-journal',version:943,exported:new Date().toISOString(),entries}));
$('journal-import').addEventListener('change',async event=>{
 const file=event.target.files?.[0];if(!file)return;
 try{
  if(file.size>2000000)throw Error('Fichier trop volumineux');
  const data=JSON.parse(await file.text());
  if(!['Pro Rando','RandoVista'].includes(data?.app)||data.type!=='hike-journal'||!Array.isArray(data.entries)||data.entries.length>MAX||!data.entries.every(valid))throw Error('Format de sauvegarde de carnet invalide');
  if(!confirm('Restaurer '+data.entries.length+' retour(s) ? Les retours existants seront conservés et fusionnés.'))return;
  const next=entries.slice(),seen=new Map(next.map(e=>[e.id,e]));let added=0;
  for(const imported of data.entries){
   const collision=seen.get(imported.id);
   if(collision&&JSON.stringify(collision)===JSON.stringify(imported))continue;
   const entry=collision?{...imported,id:id()}:imported;
   while(seen.has(entry.id))entry.id=id();
   next.push(entry);seen.set(entry.id,entry);added++;
  }
  if(next.length>MAX)throw Error('Limite de '+MAX+' retours dépassée');
  persist(next);refresh();alert('Carnet restauré : '+added+' nouveau(x) retour(s).');
 }catch(err){alert('Restauration impossible : '+err.message);}
 finally{event.target.value='';}
});
window.addEventListener('rv:profile-changed',()=>{$('journal-message').textContent='';refresh();});
document.addEventListener('rv:route-state',event=>{if(['ready','updated','error'].includes(event.detail?.status)){$('journal-message').textContent='';refresh();}});
refresh();
})();
