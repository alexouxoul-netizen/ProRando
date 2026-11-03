/* RandoVista V9.4.6 TEST — calibration personnelle et audit des sorties.
 * Local only, opt-in per profile, no GPX metric/experience-level mutation.
 * One distinct GPX = one observation; technical/unknown routes excluded.
 */
(() => {'use strict';
 const $=id=>document.getElementById(id);
 const KEY='randovista-calibration-v944';
 const MIN=3;
 const TIERS={low:0,moderate:1,high:2};
 // Même échelle que le calcul de verdict : permet la comparaison à niveau actuel
 // lorsque le carnet a mémorisé le score brut (V9.4.4 et suivantes).
 const LEVEL_OFFSETS=[3,0,-2,-4,-6];
 const REASON_LABELS={
  beforeReset:'Avant remise à zéro',
  missingPrediction:'Ancien retour : prévision non enregistrée',
  missingRoute:'Ancien retour : identité du GPX absente',
  differentLevel:'Niveau du profil différent, score de référence insuffisant',
  unknownPrediction:'Prévision GPX indisponible',
  technical:'Terrain signalé (pierriers, exposition, boue ou passages techniques)',
  ambiguous:'Difficulté ressentie absente ou invalide',
  duplicate:'Même tracé déjà représenté par un retour utilisable'
 };
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
  // La difficulté physique (1–5) et le plaisir de refaire un parcours sont
  // deux notions distinctes. Une sortie notée 3/5 et « à refaire avec plaisir »
  // reste une observation modérée, jamais une combinaison contradictoire.
  // Les terrains techniques restent exclus du calibrage des seules pentes GPX.
  if(e?.terrain?.length)return null;
  if(!Number.isInteger(e?.effort)||e.effort<1||e.effort>5)return null;
  if(e.effort<=2)return 0;
  if(e.effort===3)return 1;
  return 2;
 }
 function tierAtCurrentLevel(p,currentLevel){
  if(!p||!Number.isInteger(p.profileLevel)||p.profileLevel<0||p.profileLevel>4)return null;
  if(p.profileLevel===currentLevel){
   const base=p.baseTier||p.tier;
   return own(TIERS,base)?base:null;
  }
  // Ne JAMAIS inventer une prévision historique. On recalcule uniquement si
  // la prévision a conservé son score brut et si le clamp à 0 n'a pas perdu
  // d'information (c'est-à-dire score>0 ou ancien offset >= 0).
  if(!Number.isInteger(p.baseScore)||p.baseScore<0||p.baseScore>100||
      (p.baseScore===0&&LEVEL_OFFSETS[p.profileLevel]<0))return null;
  const intrinsic=p.baseScore-LEVEL_OFFSETS[p.profileLevel];
  if(intrinsic<0)return null;
  const score=Math.max(0,intrinsic+LEVEL_OFFSETS[currentLevel]);
  return score>=7?'high':score>=3?'moderate':'low';
 }
 function analyze(hiker,list,config=settings){
  const none={offset:0,eligible:0,disagreements:0,agree:0,positive:0,negative:0,
   excluded:0,min:MIN,enabled:false,temporary:!!hiker?.temporary,
   journalTotal:0,usableEvaluations:0,distinctTracks:0,ignored:{},audit:[]};
  if(!hiker||typeof hiker.id!=='string'||!Number.isInteger(hiker.level))return none;
  const result={...none,enabled:own(config.enabled,hiker.id)&&config.enabled[hiker.id]===true};
  const cutoff=own(config.resetAt,hiker.id)?config.resetAt[hiker.id]:0;
  const ownEntries=list.filter(e=>e?.profileId===hiker.id);
  result.journalTotal=ownEntries.length;
  const used=new Set(), known=new Set();
  const rows=ownEntries.slice().sort((a,b)=>(b?.created||0)-(a?.created||0));
  function skip(e,reason){
   result.ignored[reason]=(result.ignored[reason]||0)+1;
   result.audit.push({route:String(e?.route||'Randonnée sans nom').slice(0,100),reason});
  }
  for(const e of rows){
   if(e.routeKey)known.add(e.routeKey);
   if(cutoff>0&&(e.created||0)<=cutoff){skip(e,'beforeReset');continue;}
   if(!e.routeKey){skip(e,'missingRoute');continue;}
   if(!e.prediction){skip(e,'missingPrediction');continue;}
   const tier=tierAtCurrentLevel(e.prediction,hiker.level);
   if(tier===null){
    skip(e,e.prediction?.profileLevel!==hiker.level?'differentLevel':'unknownPrediction');continue;
   }
   if(e.terrain?.length){skip(e,'technical');continue;}
   const obs=observedTier(e);
   if(obs===null){skip(e,'ambiguous');continue;}
   // Un GPX peut être effectué plusieurs fois : tous les retours restent dans
   // le carnet, mais un même tracé ne pèse qu'une fois dans l'ajustement.
   result.usableEvaluations++;
   if(used.has(e.routeKey)){skip(e,'duplicate');continue;}
   used.add(e.routeKey);
   result.eligible++;
   const vote=Math.sign(obs-TIERS[tier]);
   if(vote>0)result.positive++;
   else if(vote<0)result.negative++;
   else result.agree++;
  }
  result.distinctTracks=known.size;
  result.excluded=rows.length-result.eligible;
  result.disagreements=result.positive+result.negative;
  // >=3 GPX différents, >=3 écarts de même sens et >=75 % des observations.
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
  if(h?.temporary){compact.textContent='Pause';detail.textContent='Simulation temporaire : calibration suspendue. Aucun réglage n’est modifié.';}
  else if(data.eligible<MIN){
   compact.textContent=data.eligible+'/'+MIN+' sorties';
   detail.textContent=data.eligible+' trace'+(data.eligible>1?'s':'')+' GPX exploitable'+(data.eligible>1?'s':'')+' sur '+MIN+' nécessaires. Les terrains techniques déclarés, les prévisions indisponibles et les difficultés ressenties invalides sont exclus.';
  } else if(data.offset){
   compact.textContent=data.enabled?'Actif '+(data.offset>0?'+1':'−1'):'Prêt (désactivé)';
   detail.textContent=data.eligible+' traces distinctes retenues · '+data.positive+' sortie(s) plus exigeante(s) que prévu · '+data.negative+' moins exigeante(s) · '+data.agree+' cohérente(s). Proposition : '+(data.offset>0?'+1':'−1')+' point maximum au score du verdict.';
  } else {
   compact.textContent=data.enabled?'Observation':'Désactivé';
   detail.textContent=data.eligible+' traces distinctes retenues, mais pas de tendance suffisamment constante pour ajuster le verdict. Les règles de départ restent appliquées.';
  }
  // Transparence : les anciennes randonnées restent dans le carnet, mais
  // leur seule présence ne suffit pas à recalibrer une prévision GPX.
  const stats=$('adaptive-stats');
  if(stats)stats.textContent=data.journalTotal+' retour(s) dans le carnet de ce profil · '+
   data.distinctTracks+' GPX identifié(s) · '+data.eligible+' trace(s) exploitable(s) pour le calibrage.';
  const audit=$('adaptive-audit-list');
  if(audit){
   audit.replaceChildren();
   const reasons=Object.entries(data.ignored).filter(([,n])=>n>0);
   if(!reasons.length){
    const li=document.createElement('li');li.textContent='Aucune exclusion : tous les retours exploitables sont utilisés.';audit.append(li);
   } else {
    for(const [reason,count] of reasons){
     const li=document.createElement('li');
     li.textContent=count+' × '+(REASON_LABELS[reason]||reason);
     audit.append(li);
    }
   }
  }
  const detailList=$('adaptive-audit-routes');
  if(detailList){
   detailList.replaceChildren();
   for(const item of data.audit.slice(0,25)){
    const li=document.createElement('li');
    li.textContent=item.route+' — '+(REASON_LABELS[item.reason]||item.reason);
    detailList.append(li);
   }
   if(data.audit.length>25){const li=document.createElement('li');li.textContent='… et '+(data.audit.length-25)+' autre(s).';detailList.append(li);}
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
