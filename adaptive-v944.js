/* RandoVista V9.8 TEST — calibration prudente, références terrain et contexte de parcours.
 * Local only, opt-in per profile, no GPX metric/experience-level mutation.
 * One distinct GPX = one physical observation; technical hikes retained as terrain references.
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
   journalTotal:0,usableEvaluations:0,distinctTracks:0,terrainReferences:[],physicalExamples:[],ignored:{},audit:[],classifications:Object.create(null)};
  if(!hiker||typeof hiker.id!=='string'||!Number.isInteger(hiker.level))return none;
  const result={...none,enabled:own(config.enabled,hiker.id)&&config.enabled[hiker.id]===true};
  const cutoff=own(config.resetAt,hiker.id)?config.resetAt[hiker.id]:0;
  const ownEntries=list.filter(e=>e?.profileId===hiker.id);
  result.journalTotal=ownEntries.length;
  const used=new Set(), known=new Set(), terrainSeen=new Set();
  const rows=ownEntries.slice().sort((a,b)=>(b?.created||0)-(a?.created||0));
  function skip(e,reason){
   result.classifications[e.id]={kind:'excluded',reason};
   result.ignored[reason]=(result.ignored[reason]||0)+1;
   result.audit.push({route:String(e?.route||'Randonnée sans nom').slice(0,100),reason});
  }
  for(const e of rows){
   if(e.routeKey)known.add(e.routeKey);
   // IMPORTANT : les retours techniques forment un registre de références
   // indépendant du calcul physique. Ils n'exigent ni prévision historique,
   // ni identifiant de GPX, et ne sont pas effacés par le reset du calibrage.
   // Une ancienne référence sans routeKey reste consultable, mais on ne la
   // rapproche JAMAIS automatiquement d'un GPX sur la seule base de son nom.
   if(Array.isArray(e.terrain)&&e.terrain.length){
    const referenceId=e.routeKey||('legacy:'+e.id);
    result.classifications[e.id]={kind:'terrain',duplicate:terrainSeen.has(referenceId),linked:!!e.routeKey};
    if(!terrainSeen.has(referenceId)){
     terrainSeen.add(referenceId);
     result.terrainReferences.push({route:String(e.route||'Randonnée').slice(0,100),
      routeKey:e.routeKey||null,linked:!!e.routeKey,feeling:e.feeling,effort:e.effort,
      terrain:e.terrain.slice(),date:e.date});
    }
    // Classée comme référence terrain, PAS comme sortie rejetée.
    continue;
   }
   if(cutoff>0&&(e.created||0)<=cutoff){skip(e,'beforeReset');continue;}
   if(!e.routeKey){skip(e,'missingRoute');continue;}
   if(!e.prediction){skip(e,'missingPrediction');continue;}
   const tier=tierAtCurrentLevel(e.prediction,hiker.level);
   if(tier===null){
    skip(e,e.prediction?.profileLevel!==hiker.level?'differentLevel':'unknownPrediction');continue;
   }
   const obs=observedTier(e);
   if(obs===null){skip(e,'ambiguous');continue;}
   result.usableEvaluations++;
   if(used.has(e.routeKey)){skip(e,'duplicate');continue;}
   used.add(e.routeKey);
   result.eligible++;
   const vote=Math.sign(obs-TIERS[tier]);
   result.classifications[e.id]={kind:'physical',vote};
   // Garder le sens du retour avec ses mesures : des sorties comparables
   // mais contradictoires ne doivent pas valider une tendance générale.
   const distance=Number(e.prediction.distanceKm), ascent=Number(e.prediction.ascentM);
   if(Number.isFinite(distance)&&distance>0&&distance<500&&Number.isFinite(ascent)&&ascent>=0&&ascent<15000){
    result.physicalExamples.push({routeKey:e.routeKey,distanceKm:distance,ascentM:ascent,vote});
   }
   if(vote>0)result.positive++;
   else if(vote<0)result.negative++;
   else result.agree++;
  }
  result.distinctTracks=known.size;
  result.excluded=result.audit.length; // Exclusions réelles uniquement, hors références terrain.
  result.disagreements=result.positive+result.negative;
  // >=3 GPX différents, >=3 écarts de même sens et >=75 % des observations.
  if(result.eligible>=MIN){
   if(result.positive>=3&&result.positive/result.eligible>=0.75&&result.positive-result.negative>=3)result.offset=1;
   else if(result.negative>=3&&result.negative/result.eligible>=0.75&&result.negative-result.positive>=3)result.offset=-1;
  }
  return result;
 }
 function getReferenceForRoute(hiker, key){
  if(!hiker||!key||hiker.temporary)return null; // Les anciennes références sans GPX restent visibles, sans fausse correspondance.
  const ownEntries=entries().filter(e=>e?.profileId===hiker.id&&e.routeKey===key&&Array.isArray(e.terrain)&&e.terrain.length);
  ownEntries.sort((a,b)=>(b?.created||0)-(a?.created||0));
  const e=ownEntries[0];
  return e?{route:e.route,feeling:e.feeling,effort:e.effort,terrain:e.terrain.slice(),date:e.date,count:ownEntries.length}:null;
 }
 // Un ajustement global n'est pas forcément transférable à un parcours
 // d'un tout autre ordre de grandeur. Conditions volontairement larges,
 // utilisées seulement si l'historique possède >=3 GPX mesurés.
 function isComparable(sample, current){
  const d=sample.distanceKm/current.distanceKm;
  // +100 m rend le test stable sur les parcours presque plats.
  const a=(sample.ascentM+100)/(current.ascentM+100);
  return d>=0.5&&d<=2&&a>=0.4&&a<=2.5;
 }
 function getAdjustment(hiker,context){
  const result=analyze(hiker,entries());
  const allowed=result.enabled&&!result.temporary;
  const raw=allowed?result.offset:0;
  const current={distanceKm:Number(context?.distanceKm),ascentM:Number(context?.ascentM)};
  const hasContext=Number.isFinite(current.distanceKm)&&current.distanceKm>0&&Number.isFinite(current.ascentM)&&current.ascentM>=0;
  let comparableCount=null,reason='';
  if(result.temporary)reason='Simulation temporaire : calibration en pause.';
  else if(!result.enabled)reason='Calibration désactivée pour ce profil.';
  else if(!raw)reason=result.eligible<MIN?'Pas encore assez de sorties exploitables.':'Pas de tendance suffisamment constante.';
  else if(hasContext&&result.physicalExamples.length>=MIN){
   const similar=result.physicalExamples.filter(e=>isComparable(e,current));
   comparableCount=similar.length;
   if(comparableCount<MIN)reason='Parcours trop différent des sorties de référence : correction suspendue.';
   else {
    const same=similar.filter(e=>e.vote===Math.sign(raw)).length;
    const opposite=similar.filter(e=>e.vote===-Math.sign(raw)).length;
    if(same>=MIN&&same/similar.length>=0.75&&same-opposite>=MIN){
     reason='Correction prudente confirmée par '+same+' retour(s) cohérent(s) sur des parcours comparables.';
    }else reason='Retours comparables insuffisamment cohérents : correction suspendue.';
   }
  }else if(raw)reason='Correction prudente issue du carnet ; comparaison fine indisponible pour cet historique.';
  const contextAllows=comparableCount===null|| (comparableCount>=MIN&&reason.startsWith('Correction prudente confirmée'));
  const offset=raw&&contextAllows?raw:0;
  return {...result,offset,candidateOffset:raw,comparableCount,reason};
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
   detail.textContent=data.eligible+' trace'+(data.eligible>1?'s':'')+' GPX exploitable'+(data.eligible>1?'s':'')+' sur '+MIN+' nécessaires pour ajuster les pentes. Les sorties techniques restent utilisées comme références terrain, visibles ci-dessous.';
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
   data.distinctTracks+' GPX identifié(s) · '+data.eligible+' trace(s) utilisées pour le calibrage du relief · '+
   data.terrainReferences.length+' référence(s) de terrain conservée(s) · '+data.excluded+' retour(s) non retenu(s) · '+data.terrainReferences.filter(r=>!r.linked).length+' référence(s) sans lien GPX.';
  const terrainBox=$('adaptive-terrain-references');
  if(terrainBox){
   terrainBox.replaceChildren();
   const headline=document.createElement('strong');
   headline.textContent='Références terrain ('+data.terrainReferences.length+')';
   terrainBox.append(headline);
   const explain=document.createElement('p');
   explain.textContent='Les sorties techniques restent conservées, même si elles sont anciennes. Si le carnet ne contient pas l’empreinte GPX, la référence apparaît ici mais ne peut pas être associée automatiquement à une trace sur la simple ressemblance du nom.';
   terrainBox.append(explain);
   const legend={rocks:'pierriers',technical:'passages techniques',exposed:'exposition',mud:'boue / terrain glissant'};
   const feelings={avoid:'À éviter pour ce profil',possible:'Exigeante mais faisable',repeat:'À refaire avec plaisir'};
   for(const r of data.terrainReferences.slice(0,20)){
    const line=document.createElement('p');
    line.textContent='🥾 '+r.route+' — '+r.effort+'/5 · '+(feelings[r.feeling]||'Bilan enregistré')+' · '+r.terrain.map(t=>legend[t]||t).join(', ')+(r.linked?' · GPX identifié':' · Ancien retour (GPX non lié)');
    terrainBox.append(line);
   }
   if(data.terrainReferences.length>20){const line=document.createElement('p');line.textContent='… et '+(data.terrainReferences.length-20)+' autre(s).';terrainBox.append(line);}
  }
  const audit=$('adaptive-audit-list');
  if(audit){
   audit.replaceChildren();
   const reasons=Object.entries(data.ignored).filter(([,n])=>n>0);
   if(!reasons.length){
    const li=document.createElement('li');li.textContent='Aucune autre sortie exclue. Les références terrain sont comptées séparément.';audit.append(li);
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
 window.addEventListener('rv:calibration-preview',event=>{
  const el=$('adaptive-context');if(!el)return;
  const info=event.detail;
  if(!info){el.textContent='Charge un GPX pour vérifier la comparabilité avec les randonnées précédentes.';return;}
  const applied=info.offset;
  const candidate=info.candidateOffset;
  el.textContent=(applied?'✓ Ajustement appliqué : '+(applied>0?'+1':'−1')+' point. ':
    candidate?'⚠ Ajustement non appliqué sur cette trace. ':'')+
    (info.reason||'Aucun ajustement nécessaire.')+
    (info.comparableCount!==null?' '+info.comparableCount+' GPX de référence comparables.':'');
 });
 window.RandoVistaAdaptive={getAdjustment,getReferenceForRoute,analyze,exportSettings,importSettings,validSettings,observedTier,isComparable};
 for(const ev of ['rv:profile-changed','rv:journal-changed','rv:calibration-changed'])window.addEventListener(ev,publishState);
 window.addEventListener('rv:sync-applied',()=>{settings=JSON.parse(localStorage.getItem(KEY)||'null')||empty();publishState();});
 publishState();
})();
