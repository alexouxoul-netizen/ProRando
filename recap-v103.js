/* RandoVista V10.3 — Bilan post-randonnée explicable.
 * Ne modifie aucun retour, GPX, profil ou réglage de calibration.
 * Compare des catégories (pas une note prévisionnelle /5, non enregistrée).
 */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const TIERS={low:0,moderate:1,high:2};
 const TIER_LABELS={low:'Plutôt adaptée',moderate:'Exigeante',high:'À éviter'};
 const TERRAIN={rocks:'Pierriers / pierres instables',technical:'Passages techniques',exposed:'Passages exposés',mud:'Boue / terrain glissant'};
 const FEELINGS={repeat:'À refaire avec plaisir',possible:'Faisable, mais exigeante',avoid:'À éviter pour ce profil'};
 const REASONS={heat:'La forte chaleur a influencé cette sortie : son ressenti est conservé sans durcir les prévisions des autres parcours.',incompletePrediction:'La prévision utilisait un GPX partiel : ce retour ne sert pas au calibrage global.',beforeReset:'Ce retour date d’avant la remise à zéro de la calibration.',missingPrediction:'L’ancienne évaluation ne possède pas de prévision mémorisée.',missingRoute:'Ce retour n’est pas encore associé à un GPX identifié.',differentLevel:'Le niveau du profil a changé et la prévision historique est insuffisante pour recalculer la référence.',unknownPrediction:'La prévision GPX était indisponible.',ambiguous:'La difficulté ressentie est absente ou invalide.',duplicate:'Un retour plus récent du même GPX représente déjà cette trace dans le calibrage physique.'};
 const getEntries=()=>window.RandoVistaJournal?.getEntries?.()||[];
 const active=()=>window.proRandoProfiles?.getActive?.()||null;
 let selectedId=null;
 function observation(e){return e.effort<=2?0:e.effort===3?1:2;}
 function classifyComparison(e){
  const predicted=e?.prediction?.tier;
  if(!Object.prototype.hasOwnProperty.call(TIERS,predicted))return {forecast:'Prévision non conservée',comparison:'Impossible de mesurer l’écart : cette évaluation ne contient pas de catégorie de difficulté prévue exploitable.',kind:'unknown'};
  const observed=observation(e),gap=observed-TIERS[predicted];
  const comparison=gap>0?'La difficulté ressentie se situe dans une catégorie plus élevée que la prévision.':
   gap<0?'La difficulté ressentie se situe dans une catégorie moins élevée que la prévision.':
   'La difficulté ressentie se situe dans la même catégorie que la prévision.';
  return {forecast:TIER_LABELS[predicted],comparison,kind:gap>0?'harder':gap<0?'easier':'aligned'};
 }
 function detailsFor(e){
  const list=[];
  if(e.up==='hard')list.push('Montées : très difficiles selon ton retour.');
  else if(e.up==='ok')list.push('Montées : soutenues mais faisables.');
  if(e.down==='hard')list.push('Descentes : très difficiles selon ton retour.');
  else if(e.down==='ok')list.push('Descentes : attention nécessaire.');
  if(e.conditions?.includes('heat'))list.push('Conditions signalées : forte chaleur ayant augmenté l’effort.');
  for(const t of e.terrain||[])if(TERRAIN[t])list.push('Terrain signalé : '+TERRAIN[t].toLowerCase()+'.');
  if(Number(e.fatigue)>=4)list.push('Fatigue à l’arrivée : '+e.fatigue+'/5.');
  list.push('Bilan personnel : '+(FEELINGS[e.feeling]||'Non renseigné')+'.');
  if(e.notes?.trim())list.push('Ton commentaire : '+e.notes.trim().slice(0,220)+(e.notes.trim().length>220?'…':''));
  return list;
 }
 function calibrationFor(e, hiker, analysis){
  if(!hiker||hiker.id!==e.profileId)return 'Cette évaluation est conservée dans le carnet. Sélectionne son profil pour consulter son rôle dans la calibration individuelle.';
  if(hiker.temporary)return 'Simulation temporaire active : la calibration est en pause. Le retour reste enregistré.';
  if(!analysis)return 'Le statut de calibration ne peut pas être déterminé pour le moment. Le retour reste conservé.';
  const item=analysis.classifications?.[e.id];
  if(!item)return 'Le statut de cette évaluation n’est pas disponible dans le calibrage actuel.';
  if(item.kind==='terrain')return 'Référence terrain conservée'+(item.duplicate?' (autre retour du même tracé déjà présent)':'')+'. Les difficultés techniques documentent cette randonnée, mais ne modifient pas artificiellement le calcul des pentes.';
  if(item.kind==='excluded')return (REASONS[item.reason]||'Ce retour ne satisfait pas encore les critères du calibrage physique.')+' Il reste enregistré dans le carnet.';
  if(item.kind==='physical'){
   const prefix='GPX retenu pour le calibrage du relief ('+analysis.eligible+' trace'+(analysis.eligible>1?'s':'')+' distincte'+(analysis.eligible>1?'s':'')+'). ';
   if(!analysis.enabled)return prefix+'La calibration est actuellement désactivée pour ce profil.';
   if(analysis.eligible<analysis.min)return prefix+'Il faut au moins '+analysis.min+' traces distinctes et des retours cohérents avant un ajustement.';
   return prefix+'Le sens des retours est étudié collectivement. Cette sortie seule ne déclenche pas de modification ; un ajustement reste limité et peut être suspendu pour un GPX non comparable.';
  }
  return 'Retour conservé dans le carnet.';
 }
 function makeReport(e,hiker,analysis){
  const comparison=classifyComparison(e);
  return {route:e.route,profile:e.profileName,date:e.date,effort:e.effort,forecast:comparison.forecast,comparison:comparison.comparison,kind:comparison.kind,details:detailsFor(e),calibration:calibrationFor(e,hiker,analysis)};
 }
 function show(entryId,opts={}){
  const entry=getEntries().find(e=>e?.id===entryId);
  const panel=$('rv-recap');if(!panel)return false;
  if(!entry){selectedId=null;panel.hidden=true;return false;}
  const hiker=active();
  const calibration=(hiker?.id===entry.profileId&&!hiker?.temporary)?window.RandoVistaAdaptive?.analyze?.(hiker,getEntries()):null;
  const report=makeReport(entry,hiker,calibration);
  selectedId=entryId;
  $('rv-recap-context').textContent=report.route+' · '+report.profile+' · '+(report.date?.split('-').reverse().join('/')||'Date inconnue');
  $('rv-recap-prediction').textContent=report.forecast;
  $('rv-recap-observed').textContent=report.effort+'/5';
  $('rv-recap-comparison').textContent=report.comparison;
  const ul=$('rv-recap-evidence');ul.replaceChildren();
  for(const d of report.details){const li=document.createElement('li');li.textContent=d;ul.append(li);}
  $('rv-recap-calibration').textContent=report.calibration;
  panel.hidden=false;
  if(opts.scroll){requestAnimationFrame(()=>panel.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth',block:'nearest'}));}
  return true;
 }
 function close(){selectedId=null;$('rv-recap').hidden=true;}
 $('rv-recap-close')?.addEventListener('click',close);
 window.addEventListener('rv:journal-entry-saved',event=>{const id=event.detail?.id;if(id)show(id,{scroll:true});});
 window.addEventListener('rv:journal-changed',()=>{if(selectedId)show(selectedId);});
 window.addEventListener('rv:profile-changed',()=>{if(selectedId)show(selectedId);});
 window.addEventListener('rv:calibration-changed',()=>{if(selectedId)show(selectedId);});
 window.RandoVistaRecap={show,close,classifyComparison,detailsFor,calibrationFor,makeReport};
})();
