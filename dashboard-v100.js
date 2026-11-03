/* RandoVista V10.0 TEST — tableau de bord consultatif : aucune écriture de données. */
(()=>{'use strict';
 const $=id=>document.getElementById(id), panel=$('rv-dashboard');if(!panel)return;
 const filter=$('rv-dashboard-profile'),context=$('rv-dashboard-context'),recent=$('rv-dashboard-recent');
 const number=n=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1}).format(n);
 const dateText=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)?s.split('-').reverse().join('/'):'';
 const feeling={repeat:'À refaire avec plaisir',possible:'Faisable mais exigeante',avoid:'À éviter'};
 const text=(el,value)=>{el.textContent=value;};
 function render(){
  let entries=[];try{entries=window.RandoVistaJournal?.getEntries?.()||[];}catch(err){console.warn('Tableau de bord : carnet indisponible',err);}
  const profile=window.proRandoProfiles?.getActive?.()||null;
  const all=filter.value==='all';const selected=all?entries:entries.filter(e=>e.profileId===profile?.id);
  const valid=selected.filter(e=>Number.isInteger(e.effort)&&e.effort>=1&&e.effort<=5&&Number.isInteger(e.fatigue)&&e.fatigue>=1&&e.fatigue<=5);
  const mean=field=>valid.length?number(valid.reduce((acc,e)=>acc+e[field],0)/valid.length)+'/5':'—';
  text(context,all?'Toutes les sorties évaluées, tous profils confondus':profile?'Historique de '+profile.name:'Sélectionne un profil pour consulter son historique');
  text($('rv-dashboard-count'),String(selected.length));text($('rv-dashboard-effort'),mean('effort'));
  text($('rv-dashboard-fatigue'),mean('fatigue'));
  text($('rv-dashboard-technical'),String(selected.filter(e=>Array.isArray(e.terrain)&&e.terrain.length>0).length));
  // Les mesures proviennent des prévisions enregistrées ; les anciennes sorties ne sont pas extrapolées.
  const withDistance=selected.filter(e=>e.prediction&&Number.isFinite(e.prediction.distanceKm)&&e.prediction.distanceKm>0);
  const sum=withDistance.reduce((acc,e)=>acc+e.prediction.distanceKm,0);
  text($('rv-dashboard-distance'),withDistance.length?'Distance des parcours documentés : '+number(sum)+' km sur '+withDistance.length+' sortie'+(withDistance.length>1?'s':'')+' (distance des GPX, pas une mesure d’activité).':'Distance des parcours : non disponible dans les évaluations enregistrées.');
  recent.replaceChildren();
  if(!selected.length){const p=document.createElement('p');p.className='rv-dashboard-empty';p.textContent='Aucune sortie évaluée pour cette sélection. Ajoute un retour dans Évaluer pour commencer ton historique.';recent.append(p);return;}
  const sorted=selected.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||(Number(b.created)||0)-(Number(a.created)||0));
  for(const e of sorted.slice(0,4)){
   const row=document.createElement('div');row.className='rv-dashboard-entry';
   const left=document.createElement('div');const name=document.createElement('strong');name.textContent=e.route||'Randonnée';
   const sub=document.createElement('small');sub.textContent=dateText(e.date)+(all?' · '+(e.profileName||'Profil'):'')+' · '+(feeling[e.feeling]||'Bilan non indiqué');left.append(name,sub);
   const grade=document.createElement('span');grade.className='rv-dashboard-grade';grade.textContent=Number.isInteger(e.effort)?e.effort+'/5':'—';row.append(left,grade);recent.append(row);
  }
 }
 filter.addEventListener('change',render);
 $('rv-dashboard-open-journal').addEventListener('click',()=>window.proRandoUI?.showTab('evaluate'));
 window.addEventListener('rv:journal-changed',render);
 window.addEventListener('rv:profile-changed',render);
 document.querySelector('[data-tab="randos"]')?.addEventListener('click',render);
 render();
 window.RandoVistaDashboard={refresh:render};
})();
