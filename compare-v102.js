/* RandoVista V10.2 TEST — comparer les derniers retours de deux profils sur un même GPX.
   Lecture seule : ne modifie ni carnet, ni niveaux, ni calibration. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const panel=$('rv-compare');if(!panel)return;
 const selectA=$('rv-compare-a'), selectB=$('rv-compare-b');
 const result=$('rv-compare-results'), status=$('rv-compare-status');
 const feeling={repeat:'À refaire avec plaisir',possible:'Faisable mais exigeante',avoid:'À éviter'};
 const terrain={rocks:'Pierriers',technical:'Passages techniques',exposed:'Passages exposés',mud:'Terrain glissant'};
 const difficulty={easy:'Faciles',ok:'Soutenues / faisables',hard:'Très difficiles'};
 let expanded=false;
 const elem=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el;};
 const prettyDate=(date)=>/^\d{4}-\d{2}-\d{2}$/.test(date||'')?date.split('-').reverse().join('/'):'';
 const newest=(x,y)=>String(x.date||'').localeCompare(String(y.date||''))||(Number(x.created)||0)-(Number(y.created)||0)||String(x.id||'').localeCompare(String(y.id||''));
 function commonRoutes(entries,a,b){
  if(!a||!b||a===b)return [];
  const grouped=new Map();
  for(const entry of entries){
   if(!entry||typeof entry.routeKey!=='string'||!/^gpx-[\w-]+$/.test(entry.routeKey)||!entry.routeKey.length||![a,b].includes(entry.profileId))continue;
   let group=grouped.get(entry.routeKey);if(!group){group=new Map();grouped.set(entry.routeKey,group);}
   const previous=group.get(entry.profileId);
   if(!previous||newest(entry,previous)>0)group.set(entry.profileId,entry);
  }
  const shared=[];
  for(const [key,group] of grouped){if(group.has(a)&&group.has(b)){const first=group.get(a),second=group.get(b);shared.push({key,first,second,date:newest(first,second)>=0?first.date:second.date});}}
  shared.sort((x,y)=>String(y.date).localeCompare(String(x.date))||x.key.localeCompare(y.key));
  return shared;
 }
 function getEntries(){try{return window.RandoVistaJournal?.getEntries?.()||[];}catch(err){console.warn('Comparaison indisponible :',err);return [];}}
 function getProfiles(entries){
  const names=new Map();
  // Garder les profils actuels même sans retour ; conserver les anciens profils archivés depuis le carnet.
  document.querySelectorAll('#hiker-select option').forEach(opt=>{if(opt.value)names.set(opt.value,opt.textContent.trim());});
  for(const entry of entries){if(entry?.profileId&&!names.has(entry.profileId))names.set(entry.profileId,entry.profileName||'Ancien profil');}
  return names;
 }
 function repopulate(select,profiles,preferred){
  const current=select.value;
  select.replaceChildren();
  for(const [id,name] of profiles){const opt=elem('option','',name);opt.value=id;select.append(opt);}
  if(profiles.has(current))select.value=current;
  else if(preferred&&profiles.has(preferred))select.value=preferred;
 }
 function line(label,value){const row=elem('div','rv-compare-line');row.append(elem('span','',label),elem('strong','',value));return row;}
 function personCard(entry,name,tag){
  const card=elem('div','rv-compare-person rv-compare-'+tag);
  const heading=elem('div','rv-compare-person-head');heading.append(elem('strong','',name),elem('small','',prettyDate(entry.date)));card.append(heading);
  const metrics=elem('div','rv-compare-metrics');metrics.append(line('Difficulté',entry.effort+'/5'),line('Fatigue',entry.fatigue+'/5'));card.append(metrics);
  card.append(line('Montées',difficulty[entry.up]||'Non précisé'),line('Descentes',difficulty[entry.down]||'Non précisé'));
  card.append(elem('p','rv-compare-feeling',feeling[entry.feeling]||'Bilan non précisé'));
  if(entry.terrain?.length)card.append(elem('p','rv-compare-terrain','Terrain : '+entry.terrain.map(t=>terrain[t]||t).join(', ')));
  return card;
 }
 function makeCard(item,profileA,profileB){
  const first=item.first,second=item.second;
  const card=elem('article','rv-compare-route');
  const head=elem('div','rv-compare-route-head');head.append(elem('strong','',first.route||second.route||'Randonnée'),elem('small','',''));
  head.lastChild.textContent='Même trace GPX';card.append(head);
  if(first.route!==second.route)card.append(elem('p','rv-compare-note','Cette trace porte des noms différents dans les deux évaluations.'));
  const gap=first.effort-second.effort;
  const insight=gap===0?'Même difficulté ressentie ('+first.effort+'/5).':(gap>0?profileA:profileB)+' l’a trouvée plus difficile de '+Math.abs(gap)+' point'+(Math.abs(gap)>1?'s':'')+'/5.';
  card.append(elem('p','rv-compare-insight',insight));
  const sides=elem('div','rv-compare-sides');sides.append(personCard(first,profileA,'a'),personCard(second,profileB,'b'));card.append(sides);
  return card;
 }
 function render(){
  const entries=getEntries(),profiles=getProfiles(entries),ids=[...profiles.keys()],active=window.proRandoProfiles?.getActive?.()?.id;
  repopulate(selectA,profiles,active||ids[0]);
  repopulate(selectB,profiles,ids.find(id=>id!==selectA.value));
  result.replaceChildren();$('rv-compare-more').hidden=true;
  if(ids.length<2){status.textContent='Il faut au moins deux profils pour comparer des expériences.';return;}
  if(selectA.value===selectB.value){status.textContent='Choisis deux profils différents pour la comparaison.';return;}
  const shared=commonRoutes(entries,selectA.value,selectB.value);
  status.textContent=shared.length+' parcours GPX commun'+(shared.length>1?'s':'')+' évalué'+(shared.length>1?'s':'')+' par les deux profils.';
  if(!shared.length){
   const text=elem('p','rv-compare-empty','Aucun même GPX évalué par ces deux profils pour le moment. Dans Évaluer → Historique des sorties, associe les anciennes évaluations au bon GPX, puis réessaie ici.');
   result.append(text);return;
  }
  for(const item of shared.slice(0,expanded?shared.length:4))result.append(makeCard(item,profiles.get(selectA.value),profiles.get(selectB.value)));
  const more=$('rv-compare-more');if(shared.length>4){more.hidden=false;more.textContent=expanded?'Afficher moins':'Afficher les '+(shared.length-4)+' autre(s) parcours';}
 }
 selectA.addEventListener('change',()=>{expanded=false;render();});
 selectB.addEventListener('change',()=>{expanded=false;render();});
 $('rv-compare-more').addEventListener('click',()=>{expanded=!expanded;render();});
 panel.addEventListener('toggle',()=>{if(panel.open)render();});
 window.addEventListener('rv:journal-changed',render);
 window.addEventListener('rv:profile-changed',render);
 document.querySelector('[data-tab="randos"]')?.addEventListener('click',render);
 window.RandoVistaComparison={refresh:render,commonRoutes};
 render();
})();
