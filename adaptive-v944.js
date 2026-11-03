/* RandoVista V9.4.4 TEST — calibration personnelle prudente.
 * Local only, opt-in per profile, no GPX metric/experience-level mutation.
 * One distinct GPX = one observation; technical/unknown routes excluded.
 */
(() => {'use strict';
 const $=id=>document.getElementById(id);
 const KEY='randovista-calibration-v944';
 const MIN=3;
 const TIERS={low:0,moderate:1,high:2};
 const empty=()=>({version:944,enabled:{},resetAt:{}});
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const dict=v=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
 function validSettings(s){
  if(!dict(s)||s.version!==944||!dict(s.enabled)||!dict(s.resetAt))return false;
  const es=Object.entries(s.enabled), rs=Object.entries(s.resetAt);
  if(es.length>60||rs.length>60)return false;
  return es.every(([k,v])=>k.length>0&&k.length<=200&&typeof v==='boolean'&&k!=='__proto__')&&
         rs.every(([k,v])=>k.length>0&&k.length<=200&&Number.isSafeInteger(v)&&v>=0&&v<=Date.now()+86400000&&k!=='__proto__');
 }
 let settings=empty();
 try{const raw=localStorage.getItem(KEY);if(raw){const imported=JSON.parse(raw);if(validSettings(imported))settings=imported;else console.warn('RandoVista : paramètres de calibration invalides, données conservées dans le stockage.');}}
 catch(err){console.warn('RandoVista : paramètres de calibration illisibles',err);}
 function persistSettings(next){
  if(!validSettings(next))throw Error('Réglages de calibration invalides');
  localStorage.setItem(KEY,JSON.stringify(next));settings=next;
  window.dispatchEvent(new CustomEvent('rv:calibration-changed'));
 }
 function active(){return window.proRandoProfiles?.getActive?.()||null;}
 function entries(){return window.RandoVistaJournal?.getEntries?.()||[];}
 function observedTier(e){
  // Seules les expériences sans difficulté de terrain signalée peuvent calibrer un modèle purement GPX.
  if(e.terrain?.length)return null;
  if(e.feeling==='avoid'&&e.effort>=4&&(e.up==='hard'||e.down==='hard'))return 2;
  if(e.feeling==='repeat'&&e.effort<=2&&e.up==='easy'&&e.down==='easy')return 0;
  if(e.feeling==='possible'&&e.effort>=3&&e.effort<=4)return 1;
  return null; // Résultat ambigu, ne pas forcer un apprentissage.
 }
 function analyze(hiker,list,config=settings){
  const none={offset:0,eligible:0,disagreements:0,agree:0,positive:0,negative:0,excluded:0,min:MIN,enabled:false,temporary:!!hiker?.temporary};
  if(!hiker||typeof hiker.id!=='string'||!Number.isInteger(hiker.level))return none;
  const result={...none,enabled:own(config.enabled,hiker.id)&&config.enabled[hiker.id]===true};
  const cutoff=own(config.resetAt,hiker.id)?config.resetAt[hiker.id]:0;
  const ownEntries=list.filter(e=>e?.profileId===hiker.id);
  const distinct=new Map();
  for(const e of ownEntries){
   const p=e.prediction;
   if(!e.routeKey||!p||p.profileLevel!==hiker.level||(e.created||0)<=cutoff||
      !own(TIERS,p.baseTier||p.tier)||!Number.isFinite(e.created)){
     result.excluded++;continue;
   }
   const current=distinct.get(e.routeKey);
   if(!current||current.created<e.created)distinct.set(e.routeKey,e);
  }
  for(const e of distinct.values()){
   const obs=observedTier(e);
   if(obs===null){result.excluded++;continue;}
   const predicted=TIERS[e.prediction.baseTier||e.prediction.tier];
   const vote=Math.sign(obs-predicted);
   result.eligible++;
   if(vote>0)result.positive++;
   else if(vote<0)result.negative++;
   else result.agree++;
  }
  result.disagreements=result.positive+result.negative;
  // ≥3 GPX différents, ≥3 écarts de même sens, ≥75 % des observations : correction ±1 maximum.
  // Le simple ajout d'une observation ne peut provoquer un saut de plusieurs niveaux.
  if(result.eligible>=MIN){
   if(result.positive>=3&&result.positive/result.eligible>=0.75&&result.positive-result.negative>=3)result.offset=1;
   else if(result.negative>=3&&result.negative/result.eligible>=0.75&&result.negative-result.positive>=3)result.offset=-1;
  }
  return result;
 }
 function getAdjustment(hiker){
  const result=analyze(hiker,entries());
  return {...result,offset:result.enabled&&!result.temporary?result.offset:0};
 }
 function publishState(){
  const h=active(), data=analyze(h,entries());
  const toggle=$('adaptive-enable'),desc=$('adaptive-description'),detail=$('adaptive-details'),compact=$('adaptive-compact'),reset=$('adaptive-reset');
  if(!toggle)return;
  toggle.checked=data.enabled;
  toggle.disabled=!h||!!h.temporary;
  reset.disabled=!h||!!h.temporary;
  const name=h?.name||'ce profil';
  desc.textContent='Calibrage facultatif pour '+name+'. Les mesures GPX et le niveau enregistré ne changent jamais.';
  if(h?.temporary){compact.textContent='Pause';detail.textContent='Simulation temporaire : calibration suspendue. Aucun réglage n’est modifié.';return;}
  if(data.eligible<MIN){
   compact.textContent=data.eligible+'/'+MIN+' sorties';
   detail.textContent=data.eligible+' trace'+(data.eligible>1?'s':'')+' GPX exploitable'+(data.eligible>1?'s':'')+' sur '+MIN+' nécessaires. Les passages techniques déclarés, les prévisions indisponibles et les résultats ambigus sont exclus.';
  } else if(data.offset){
   compact.textContent=data.enabled?'Actif '+(data.offset>0?'+1':'−1'):'Prêt (désactivé)';
   detail.textContent=data.eligible+' traces distinctes retenues · '+data.positive+' sortie(s) plus exigeante(s) que prévu · '+data.negative+' moins exigeante(s) · '+data.agree+' cohérente(s). Proposition : '+(data.offset>0?'+1':'−1')+' point maximum au score du verdict.';
  } else {
   compact.textContent=data.enabled?'Observation':'Désactivé';
   detail.textContent=data.eligible+' traces distinctes retenues, mais pas de tendance suffisamment constante pour ajuster le verdict. Les règles de départ restent appliquées.';
  }
 }
 $('adaptive-enable')?.addEventListener('change',event=>{
  const h=active();if(!h||h.temporary){publishState();return;}
  const next={version:944,enabled:{...settings.enabled,[h.id]:event.target.checked},resetAt:{...settings.resetAt}};
  try{persistSettings(next);}
  catch(err){alert('Impossible d’enregistrer ce choix : '+err.message);}
  publishState();
 });
 $('adaptive-reset')?.addEventListener('click',()=>{
  const h=active();if(!h||h.temporary)return;
  if(!confirm('Repartir de zéro pour « '+h.name+' » ? Les anciens retours restent dans le carnet, mais ne serviront plus au calibrage.'))return;
  const next={version:944,enabled:{...settings.enabled},resetAt:{...settings.resetAt,[h.id]:Date.now()}};
  try{persistSettings(next);}
  catch(err){alert('Impossible de réinitialiser le calibrage : '+err.message);}
  publishState();
 });
 // Sauvegarde facultative : le carnet peut exporter ses réglages avec son historique.
 function exportSettings(){return JSON.parse(JSON.stringify(settings));}
 function importSettings(s){
  if(!validSettings(s))throw Error('Réglages de calibration incorrects');
  persistSettings({version:944,enabled:{...s.enabled},resetAt:{...s.resetAt}});
  publishState();
 }
 window.RandoVistaAdaptive={getAdjustment,analyze,exportSettings,importSettings,validSettings,observedTier};
 for(const ev of ['rv:profile-changed','rv:journal-changed','rv:calibration-changed'])window.addEventListener(ev,publishState);
 publishState();
})();
