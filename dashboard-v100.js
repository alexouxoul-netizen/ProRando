/* RandoVista V10.1 TEST — tableau de bord consultatif : aucune écriture de données. */
(()=>{'use strict';
 const $=id=>document.getElementById(id), panel=$('rv-dashboard');if(!panel)return;
 const filter=$('rv-dashboard-profile'),context=$('rv-dashboard-context'),recent=$('rv-dashboard-recent');
 const number=n=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1}).format(n);
 const dateText=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)?s.split('-').reverse().join('/'):'';
 const feeling={repeat:'À refaire avec plaisir',possible:'Faisable mais exigeante',avoid:'À éviter'};
 const text=(el,value)=>{el.textContent=value;};
 const chartNS='http://www.w3.org/2000/svg';
 const makeSVG=(tag,attrs={})=>{const node=document.createElementNS(chartNS,tag);for(const [key,val] of Object.entries(attrs))node.setAttribute(key,String(val));return node;};
 function drawChart(targetId,selected,field,title,color){
  const target=$(targetId);if(!target)return;
  target.replaceChildren();
  const dated=selected.filter(e=>typeof e.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(e.date)&&Number.isInteger(e[field])&&e[field]>=1&&e[field]<=5);
  dated.sort((a,b)=>a.date.localeCompare(b.date)||(Number(a.created)||0)-(Number(b.created)||0));
  const points=dated.slice(-12);
  if(!points.length){const empty=document.createElement('p');empty.className='rv-dashboard-chart-empty';empty.textContent='Pas encore de sorties datées avec une note exploitable.';target.append(empty);return;}
  const w=320,h=146,l=28,r=12,t=15,b=27,plotW=w-l-r,plotH=h-t-b;
  const x=i=>l+(points.length===1?plotW/2:i*plotW/(points.length-1));
  const y=v=>t+(5-v)*plotH/4;
  const svg=makeSVG('svg',{viewBox:`0 0 ${w} ${h}`,role:'img','aria-label':`${title} : ${points.length} sortie(s) datée(s), valeurs de 1 à 5`});
  for(const val of [1,3,5]){
    svg.append(makeSVG('line',{x1:l,y1:y(val),x2:w-r,y2:y(val),stroke:'currentColor','stroke-opacity':'.13','stroke-width':'1'}));
    const label=makeSVG('text',{x:l-9,y:y(val)+3,'text-anchor':'end'});label.textContent=String(val);svg.append(label);
  }
  const path=points.map((e,i)=>`${i?'L':'M'} ${x(i).toFixed(1)} ${y(e[field]).toFixed(1)}`).join(' ');
  if(points.length>1)svg.append(makeSVG('path',{d:path,fill:'none',stroke:color,'stroke-width':'2.7','stroke-linecap':'round','stroke-linejoin':'round'}));
  points.forEach((e,i)=>{const point=makeSVG('circle',{cx:x(i),cy:y(e[field]),r:points.length>9?3.4:4,fill:color,stroke:'white','stroke-width':'1.5'});const tooltip=makeSVG('title');tooltip.textContent=`${dateText(e.date)} : ${e[field]}/5 — ${e.route||'Randonnée'}`;point.append(tooltip);svg.append(point);});
  const first=makeSVG('text',{x:l,y:h-6,'text-anchor':'start'});first.textContent=dateText(points[0].date);svg.append(first);
  if(points.length>1){const last=makeSVG('text',{x:w-r,y:h-6,'text-anchor':'end'});last.textContent=dateText(points[points.length-1].date);svg.append(last);}
  target.append(svg);
 }
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
  drawChart('rv-chart-effort',selected,'effort','Difficulté ressentie','#397b55');
  drawChart('rv-chart-fatigue',selected,'fatigue','Fatigue à l’arrivée','#a47d40');
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
 $('rv-dashboard-fold')?.addEventListener('toggle',()=>{if($('rv-dashboard-fold').open)render();});
 $('rv-dashboard-open-journal').addEventListener('click',()=>window.proRandoUI?.showTab('evaluate'));
 window.addEventListener('rv:journal-changed',render);
 window.addEventListener('rv:profile-changed',render);
 document.querySelector('[data-tab="randos"]')?.addEventListener('click',render);
 render();
 window.RandoVistaDashboard={refresh:render};
})();
