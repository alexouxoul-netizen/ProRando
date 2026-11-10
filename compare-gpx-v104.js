/* RandoVista V10.4 TEST — comparaison de deux GPX avant la randonnée.
 * Lecture indépendante : aucune analyse ne touche à la carte, à la trace active,
 * au carnet ni aux profils. Les seuils physiques/verdict reproduisent V10.3.
 */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const root=$('rv104-comparator');if(!root)return;
 const R=6371000, maxXml=15000000;
 const profiles=['Très débutant','Débutant','Bon marcheur','Aguerri','Expert'];
 const labels={low:'A priori adaptée',moderate:'Exigeante, mais potentiellement faisable',high:'À éviter pour ce niveau',unknown:'Difficulté indisponible'};
 const caches={a:null,b:null},readSeq={a:0,b:0};let saved=[],revision=0;
 const option=(value,label)=>{const o=document.createElement('option');o.value=value;o.textContent=label;return o;};
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const km=n=>(n/1000).toFixed(2).replace('.',',')+' km';
 const meter=n=>Math.round(n)+' m';
 const routeName=name=>String(name||'Randonnée').replace(/\.gpx$/i,'').slice(0,150);
 const classify=score=>RVVerdictRules.classify(score);
 function getPoints(xml){
  if(typeof xml!=='string'||!xml.trim()||xml.length>maxXml)throw Error('GPX vide ou trop volumineux (15 Mo maximum).');
  const doc=new DOMParser().parseFromString(xml,'application/xml');
  if(doc.getElementsByTagName('parsererror').length)throw Error('GPX invalide ou endommagé.');
  const get=(parent,name)=>Array.from(parent.getElementsByTagNameNS('*',name));
  let raw=get(doc,'trkpt');if(!raw.length)raw=get(doc,'rtept');
  if(!raw.length)throw Error('Aucun point de parcours GPX trouvé.');
  const points=[];
  for(const node of raw){
   const lat=Number(node.getAttribute('lat')),lon=Number(node.getAttribute('lon'));
   if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)continue;
   const elevationNode=get(node,'ele')[0];
   const e=elevationNode?Number(elevationNode.textContent):NaN;
   points.push({lat,lon,elevation:Number.isFinite(e)?e:null});
  }
  if(points.length<2)throw Error('Le fichier doit contenir au moins deux points GPS valides.');
  return points;
 }
 function geoDistance(a,b){
  const phi1=a.lat*Math.PI/180,phi2=b.lat*Math.PI/180,dp=(b.lat-a.lat)*Math.PI/180,dl=(b.lon-a.lon)*Math.PI/180;
  const h=Math.sin(dp/2)**2+Math.cos(phi1)*Math.cos(phi2)*Math.sin(dl/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
 }
 function at(points,ds,target){return RVGPX.at(points,ds,target);}
 function slopeAt(points,ds,i){return RVGPX.slope(points,ds,i);}
 function parseMetrics(xml){
  if(typeof xml!=='string'||!xml.trim()||xml.length>maxXml)throw Error('GPX vide ou trop volumineux.');
  const measurement=RVGPX.analyze(RVGPX.read(new DOMParser().parseFromString(xml,'application/xml')));
  const points=measurement.points,ds=measurement.distances;
  const distance=ds[ds.length-1];if(!Number.isFinite(distance)||distance<100)throw Error('GPX trop court : moins de 100 mètres exploitables.');
  let ascent=0,descent=0,knownMeters=0,steepUp=0,steepDown=0,verySteepUp=0;
  const uphill={easy:0,moderate:0,hard:0,extreme:0};
  let longest=0,run=0,gap=0;
  for(let i=1;i<points.length;i++){
   const len=ds[i]-ds[i-1],a=points[i-1],b=points[i];
   if(len<=0)continue;
   if(a.elevation!==null&&b.elevation!==null){
    knownMeters+=len;

    const slope=slopeAt(points,ds,i);
    if(slope!==null){
     const abs=Math.abs(slope);
     if(slope>=0){const key=abs<10?'easy':abs<15?'moderate':abs<25?'hard':'extreme';uphill[key]+=len;}
     if(slope>=15)steepUp+=len;if(slope>=25)verySteepUp+=len;
     if(slope<=-15)steepDown+=len;
    }
   }
   const s=slopeAt(points,ds,i);
   if(s!==null&&s>=3){run+=len+gap;gap=0;}
   else{gap+=len;if(gap>80){longest=Math.max(longest,run);run=0;gap=0;}}
  }
  longest=Math.max(longest,run);
  ascent=measurement.ascent;descent=measurement.descent;
  const knownShare=measurement.knownShare;
  const altitudeOk=knownShare>=.85;
  const bins=[];let rise50=0,steep50=0,verySteep50=0,down50=0,known50=0;
  for(let a=0;a<distance;a+=50){
   const b=Math.min(distance,a+50),z0=at(points,ds,a),z1=at(points,ds,b);
   if(!RVGPX.intervalKnown(points,ds,a,b)||!Number.isFinite(z0)||!Number.isFinite(z1))continue;
   known50+=b-a;
   const slope=(z1-z0)/(b-a)*100,rise=Math.max(0,z1-z0);
   bins.push({a,b,slope,rise});rise50+=rise;
   if(slope>=15)steep50+=b-a;
   if(slope>=25)verySteep50+=b-a;
   if(slope<=-15)down50+=b-a;
  }
  // Montées du verdict V7.5 : continuité à 3 %, interruptions de 100 m.
  const climbs=[];let current=null;
  const finish=()=>{if(current&&current.up>=100&&current.rise>=8){current.length=current.end-current.start;climbs.push(current);}current=null;};
  for(const b of bins){
   if(b.slope>=3){
    if(current&&b.a-current.last>100)finish();
    if(!current)current={start:b.a,end:b.b,last:b.b,up:0,rise:0,steep:0};
    current.end=b.b;current.last=b.b;current.up+=b.b-b.a;current.rise+=b.rise;
    if(b.slope>=15)current.steep+=b.b-b.a;
   }else if(current&&b.b-current.last>100)finish();
  }finish();
  const hardest=climbs.reduce((best,c)=>!best||c.rise*(1+c.steep/Math.max(c.up,1))>best.rise*(1+best.steep/Math.max(best.up,1))?c:best,null);
  let physicalGrade=null;
  if(altitudeOk){
   const distanceKm=distance/1000,steep=uphill.hard+uphill.extreme,plus=uphill.extreme;
   const base=distanceKm*.07+ascent*.0014;
   const steepLoad=Math.min(2.1,steep/700)+Math.min(1.1,plus/250);
   const sustainedLoad=Math.min(.7,longest/4000);
   const fatigueLoad=distanceKm>=14&&ascent>=450&&steep>=900?1.65+Math.min(.5,(distanceKm-14)*.1):0;
   const score=base+steepLoad+sustainedLoad+fatigueLoad;
   physicalGrade=score<1.1?1:score<2.7?2:score<3.5?3:score<4.35?4:5;
   if(steep>=500&&steep/Math.max(1,distance)>.13)physicalGrade=Math.max(physicalGrade,3);
  }
  const intrinsic=RVVerdictRules.intrinsic({distanceKm:distance/1000,rise:rise50,steepUp:steep50,verySteepUp:verySteep50,steepDown:down50,hardest});
  const spacings=[];for(let i=1;i<ds.length;i++){const d=ds[i]-ds[i-1];if(d>.2)spacings.push(d);}spacings.sort((a,b)=>a-b);
  const coarse=(spacings.length?spacings[Math.floor(spacings.length/2)]:Infinity)>15||points.length<50;
  return {distance,ascent,descent,knownShare,incomplete:measurement.quality.breaks>0||measurement.quality.invalid>0,altitudeOk:altitudeOk&&known50/distance>=.85,physicalGrade,
   uphill,steepUp,steepDown,verySteepUp,longest,hardest,coarse,intrinsic,
   verdictRise:rise50,verdictSteep:steep50,verdictDescent:down50,points:points.length};
 }
 function evaluate(metrics,profile,xml){
  if(!metrics||!profile)return {level:'unknown',score:null,baseScore:null,calibration:null,reference:null,history:null};
  const key=window.RandoVistaJournal?.fingerprint?.(xml);
  const reference=window.RandoVistaAdaptive?.getReferenceForRoute?.(profile,key)||null;
  let history=null;
  if(key&&!profile.temporary){
   const matches=(window.RandoVistaJournal?.getEntries?.()||[])
    .filter(e=>e?.profileId===profile.id&&e.routeKey===key&&Number.isInteger(e.effort)&&e.effort>=1&&e.effort<=5)
    .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||(Number(b.created)||0)-(Number(a.created)||0));
   if(matches.length)history=matches[0];
  }
  if(!metrics.altitudeOk){
   // Si la difficulté physique est inconnue, un retour « à éviter » reste
   // une alerte réelle, sans prétendre déduire les pentes absentes.
   const knownAvoid=reference?.feeling==='avoid';
   return {level:'unknown',score:null,baseScore:null,calibration:null,reference,history,offset:0,missingAlt:true};
  }
  const level=Number.isInteger(profile.level)?Math.max(0,Math.min(4,profile.level)):1;
  const {baseScore}=RVVerdictRules.forProfile(metrics.intrinsic,level);
  const correction=window.RandoVistaAdaptive?.getAdjustment?.(profile,{distanceKm:metrics.distance/1000,ascentM:metrics.verdictRise});
  const offset=Number.isInteger(correction?.offset)?Math.max(-1,Math.min(1,correction.offset)):0;
  const score=Math.max(0,baseScore+offset);
  const knownAvoid=reference?.feeling==='avoid';
  return {level:knownAvoid?'high':classify(score),score,baseScore,calibration:correction,reference,history,offset};
 }

 function analyze(xml,name){return {xml,name:routeName(name),metrics:parseMetrics(xml)};}
 const choice=id=>caches[id];
 function setChoice(id,entry){caches[id]=entry;$('rv104-name-'+id).textContent=entry?entry.name:'Aucun parcours choisi';render();}
 function updateSelects(){
  saved=saved.filter(r=>typeof r.xml==='string'&&typeof r.name==='string');
  const current=window.RandoVistaRoutes?.active;
  for(const id of ['a','b']){
   const select=$('rv104-source-'+id),previous=select.value;
   select.replaceChildren(option('','Choisir une source…'));
   if(current)select.append(option('active','Parcours actuellement préparé : '+current.name));
   for(const r of saved)select.append(option('saved:'+r.id,'Bibliothèque : '+r.name));
   if(id==='a'&&current&&(previous===''||previous==='active')&&(!caches.a||caches.a.origin==='active')){
    select.value='active';
    try{caches.a={...analyze(current.xml,current.name),origin:'active'};$('rv104-name-a').textContent=caches.a.name;}
    catch(err){caches.a=null;select.value='';$('rv104-name-a').textContent='Aucun parcours choisi';}
   }else if([...select.options].some(o=>o.value===previous))select.value=previous;
  }
 }
 async function loadLibrary(){
  const previous=revision;
  try{saved=await window.RandoVistaLibrary?.getSavedRoutes?.()||[];
   if(previous!==revision)return;
   updateSelects();render();
  }catch(err){saved=[];updateSelects();$('rv104-message').textContent='Bibliothèque indisponible : tu peux importer deux fichiers GPX directement.';}
 }
 async function onSource(id){
  readSeq[id]++;
  const select=$('rv104-source-'+id),value=select.value;
  if(!value){setChoice(id,null);return;}
  let chosen=null;
  if(value==='active'){
   const current=window.RandoVistaRoutes?.active;
   if(current)chosen={xml:current.xml,name:current.name,origin:'active'};
  }else if(value.startsWith('saved:')){
   const r=saved.find(x=>x.id===value.slice(6));if(r)chosen={xml:r.xml,name:r.name,origin:'library'};
  }
  try{
   if(!chosen)throw Error('Parcours non trouvé dans la bibliothèque.');
   const record={...analyze(chosen.xml,chosen.name),origin:chosen.origin};setChoice(id,record);
  }catch(err){caches[id]=null;$('rv104-name-'+id).textContent='Aucun parcours choisi';render();$('rv104-message').textContent='Parcours '+id.toUpperCase()+' : '+err.message;}
 }
 function makeLine(label,value){const p=el('div','rv104-line');p.append(el('span','',label),el('strong','',value));return p;}
 function makeCard(id,entry,report,profile){
  const {metrics:m,name}=entry;
  const card=el('article','rv104-card');
  const header=el('div','rv104-card-head');header.append(el('span','rv104-letter',id.toUpperCase()),el('strong','',name));card.append(header);
  const verdict=el('p','rv104-verdict rv104-'+report.level,labels[report.level]);card.append(verdict);
  const lines=el('div','rv104-lines');
  lines.append(makeLine('Distance'+(m.incomplete?' (partielle)':''),km(m.distance)),makeLine('Dénivelé +',m.altitudeOk?('+'+meter(m.ascent)):'Non disponible'));
  lines.append(makeLine('Dénivelé −',m.altitudeOk?('−'+meter(m.descent)):'Non disponible'));
  lines.append(makeLine('Note physique GPX',m.physicalGrade!==null&&m.altitudeOk?m.physicalGrade+'/5':'Non disponible'));
  lines.append(makeLine('Montées ≥ 15 % (50 m)',m.altitudeOk?meter(m.verdictSteep):'Inconnues'));
  lines.append(makeLine('Descentes ≤ −15 % (50 m)',m.altitudeOk?meter(m.verdictDescent):'Inconnues'));
  if(m.hardest&&m.altitudeOk)lines.append(makeLine('Montée exigeante','km '+(m.hardest.start/1000).toFixed(1).replace('.',',')+'–'+(m.hardest.end/1000).toFixed(1).replace('.',',')+' (+'+meter(m.hardest.rise)+')'));
  card.append(lines);
  if(m.coarse)card.append(el('p','rv104-caution','⚠ Trace peu détaillée : certains passages courts et raides peuvent être sous-estimés.'));
  if(m.incomplete)card.append(el('p','rv104-caution','⚠ Analyse partielle : ces mesures et cet avis concernent uniquement les portions enregistrées ; le parcours complet peut être plus exigeant.'));
  if(!m.altitudeOk)card.append(el('p','rv104-caution','⚠ Altitudes insuffisantes : verdict impossible. Ne pas interpréter une distance courte comme une randonnée facile.'));
  if(report.history){
   const label={repeat:'À refaire avec plaisir',possible:'Faisable, mais exigeante',avoid:'À éviter pour ce profil'}[report.history.feeling]||'Bilan conservé';
   card.append(el('p','rv104-history','🥾 Déjà parcourue pour ce profil : '+report.history.effort+'/5 · '+label+'.'));
  }
  if(report.history?.conditions?.includes('heat'))card.append(el('p','rv104-history','☀ Forte chaleur signalée pour cette sortie : le ressenti est conservé sans calibrage des autres parcours.'));
  if(report.reference?.feeling==='avoid')card.append(el('p','rv104-history-warning','⚠ Référence terrain « à éviter » pour ce profil : ce retour réel prime sur la prévision physique.'));
  else if(report.history?.feeling==='avoid')card.append(el('p','rv104-history-warning','⚠ Retour précédent « à éviter » conservé dans le carnet, distinct de cette prévision physique.'));
  else if(report.reference&&!report.history)card.append(el('p','rv104-history','Expérience de terrain enregistrée pour ce même GPX et ce profil.'));
  if(report.offset)card.append(el('p','rv104-calibration','🎯 Calibrage personnel : '+(report.offset>0?'+1':'−1')+' point sur le score.'));
  const action=el('button','rv104-choose-btn','Préparer ce parcours');action.type='button';action.addEventListener('click',()=>{
   const current=window.RandoVistaRoutes?.active;
   if(current?.xml===entry.xml){root.open=false;window.proRandoUI?.showTab?.('prepare');$('personal-verdict')?.scrollIntoView?.({behavior:'smooth',block:'start'});return;}
   if(!window.confirm('Remplacer le parcours actuellement préparé par « '+entry.name+' » ?'))return;
   if(window.RandoVistaRoutes?.load?.(entry.xml,entry.name,'comparison')){
    root.open=false;window.proRandoUI?.showTab?.('prepare');$('personal-verdict')?.scrollIntoView?.({behavior:'smooth',block:'start'});
   }
  });card.append(action);
  return card;
 }
 function recommendation(a,b,ma,mb){
  const title=el('strong','', 'Conseil pour le profil choisi');
  const text=el('p','');
  if(ma.level==='unknown'||mb.level==='unknown')text.textContent='Comparaison insuffisante : au moins un GPX manque d’altitudes fiables. Vérifie les données avant de choisir.';
  else if(ma.level==='high'&&mb.level==='high')text.textContent='Aucun des deux parcours ne semble adapté à ce profil. Mieux vaut chercher une randonnée moins exigeante.';
  else {
   const tiers={low:0,moderate:1,high:2};
   const diff=tiers[ma.level]-tiers[mb.level];
   if(diff===0){
    const gap=ma.score-mb.score;
    if(Math.abs(gap)<2)text.textContent='Les deux parcours ont un niveau d’exigence proche pour ce profil. Aucun choix nettement préférable selon le GPX.';
    else {
     const chosen=gap<0?a:b;
     text.textContent='« '+chosen.name+' » paraît légèrement moins exigeante dans la même catégorie, selon le relief et les distances. Compare les passages clés et vérifie le terrain.';
    }
   }else{
    const chosen=diff<0?a:b;
    text.textContent='« '+chosen.name+' » semble mieux adaptée à ce profil : son verdict est moins exigeant que celui de l’autre parcours.';
   }
  }
  const factors=el('p','rv104-rationale');
  const d=Math.abs(a.metrics.distance-b.metrics.distance),h=Math.abs(a.metrics.ascent-b.metrics.ascent);
  factors.textContent='Écarts mesurés : '+km(d)+' de distance et '+(a.metrics.altitudeOk&&b.metrics.altitudeOk?meter(h)+' de D+':'D+ non comparables')+'.';
  return [title,text,factors];
 }
 function render(){
  const output=$('rv104-output'),results=$('rv104-results'),decision=$('rv104-decision');
  results.replaceChildren();decision.replaceChildren();
  if(!choice('a')||!choice('b')){
   output.hidden=true;$('rv104-message').textContent='Choisis deux randonnées pour les comparer.';return;
  }
  const a=choice('a'),b=choice('b');
  if(a.xml===b.xml){output.hidden=true;$('rv104-message').textContent='Tu as sélectionné deux fois le même GPX. Choisis deux parcours différents.';return;}
  const profile=window.proRandoProfiles?.getActive?.();
  if(!profile){output.hidden=true;$('rv104-message').textContent='Sélectionne un profil randonneur avant de comparer.';return;}
  const pa=evaluate(a.metrics,profile,a.xml),pb=evaluate(b.metrics,profile,b.xml);
  results.append(makeCard('a',a,pa,profile),makeCard('b',b,pb,profile));
  decision.append(...recommendation(a,b,pa,pb));
  $('rv104-message').textContent='Comparaison pour « '+profile.name+' » ('+profiles[profile.level]+(profile.temporary?' · simulation temporaire':'')+').';
  output.hidden=false;
 }
 for(const id of ['a','b']){
  $('rv104-source-'+id).addEventListener('change',()=>onSource(id));
  $('rv104-file-'+id).addEventListener('change',async event=>{
   const file=event.target.files?.[0];if(!file)return;
   const request=++readSeq[id];
   caches[id]=null;render();
   $('rv104-name-'+id).textContent='Analyse en cours…';
   $('rv104-message').textContent='Lecture du GPX '+id.toUpperCase()+'…';
   try{
    if(file.size>maxXml)throw Error('Ce GPX dépasse 15 Mo.');
    const xml=await file.text();
    if(request!==readSeq[id])return;
    const entry={...analyze(xml,file.name),origin:'file'};
    $('rv104-source-'+id).value='';setChoice(id,entry);
   }catch(err){if(request===readSeq[id]){caches[id]=null;render();$('rv104-name-'+id).textContent='Aucun parcours choisi';$('rv104-message').textContent='GPX '+id.toUpperCase()+' : '+err.message;}}
   finally{event.target.value='';}
  });
 }
 root.addEventListener('toggle',()=>{if(root.open){revision++;loadLibrary();}});
 document.addEventListener('rv:route-state',e=>{
  if(!['ready','updated'].includes(e.detail?.status))return;
  const changed=['a','b'].filter(id=>caches[id]?.origin==='active');
  for(const id of changed){const active=window.RandoVistaRoutes?.active;
   if(active){try{caches[id]={...analyze(active.xml,active.name),origin:'active'};$('rv104-name-'+id).textContent=caches[id].name;}catch(err){caches[id]=null;}}
  }
  if(root.open){revision++;loadLibrary();}render();
 });
 for(const name of ['rv:profile-changed','rv:calibration-changed','rv:journal-changed'])window.addEventListener(name,render);
 // Expose seulement les calculs en lecture pour tests de non-régression.
 window.RandoVistaGPXComparator={parseMetrics,evaluate,analyze,render};
 if(window.RandoVistaRoutes?.active){const r=window.RandoVistaRoutes.active;try{caches.a={...analyze(r.xml,r.name),origin:'active'};$('rv104-name-a').textContent=caches.a.name;}catch(err){console.warn('Comparateur : GPX actif invalide',err);}}
 updateSelects();render();
})();
