/* Pro Rando V7.5 — aide indicative calibrée sur les préférences déclarées, non un diagnostic de terrain. */
(() => {
  const $ = id => document.getElementById(id);
  const fmt = m => (m/1000).toFixed(1).replace('.', ',');
  const altAt = (pts, ds, d) => {
    let lo=0, hi=ds.length-1;
    while(lo<hi){const mid=(lo+hi)>>1;if(ds[mid]<d)lo=mid+1;else hi=mid;}
    if(!lo)return pts[0].elevation;
    const a=pts[lo-1].elevation,b=pts[lo].elevation,span=ds[lo]-ds[lo-1];
    return Number.isFinite(a)&&Number.isFinite(b)&&span>0 ? a+(b-a)*(d-ds[lo-1])/span : null;
  };
  const addFactor = (text) => {const div=document.createElement('div');div.className='verdict-factor';div.textContent=text;$('verdict-factors').append(div);};
  let lastTrack=null;
  const feelingNames={avoid:'À éviter pour ce profil',possible:'Exigeante, mais faisable',repeat:'À refaire avec plaisir'};
  const terrainNames={rocks:'pierriers',technical:'passages techniques',exposed:'passages exposés',mud:'boue / terrain glissant'};
  const predictedNames={low:'Plutôt adaptée',moderate:'Exigeante',high:'À éviter'};
  function renderPastExperience(active, baseLevel, actualLevel){
    const host=$('rv-experience');if(!host)return;
    host.hidden=true;
    if(!active||active.temporary)return;
    const key=window.RandoVistaJournal?.getActiveRouteKey?.();
    if(!key)return;
    const all=window.RandoVistaJournal?.getEntries?.();
    if(!Array.isArray(all))return;
    const matches=all.filter(e=>e&&e.profileId===active.id&&e.routeKey===key&&Number.isInteger(e.effort)&&e.effort>=1&&e.effort<=5)
      .sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.created||0)-(a.created||0));
    if(!matches.length)return;
    const last=matches[0];
    $('rv-experience-count').textContent=matches.length+' retour'+(matches.length>1?'s':'');
    $('rv-experience-effort').textContent=last.effort+'/5';
    $('rv-experience-feeling').textContent=feelingNames[last.feeling]||'Bilan enregistré';
    const terrains=Array.isArray(last.terrain)?last.terrain.map(t=>terrainNames[t]).filter(Boolean):[];
    $('rv-experience-terrain').hidden=!terrains.length;
    $('rv-experience-terrain').textContent=terrains.length?'⚠ Terrain signalé : '+terrains.join(', ')+'.':'';
    const notes=String(last.notes||'').trim().slice(0,240);
    $('rv-experience-notes').hidden=!notes;
    $('rv-experience-notes').textContent=notes?'« '+notes+(String(last.notes||'').trim().length>240?'…':'')+' »':'';
    $('rv-experience-difference').textContent='Prévision physique GPX : '+(predictedNames[baseLevel]||'Indisponible')+' · Expérience réelle : '+last.effort+'/5. Les passages techniques ne sont pas déduits du GPX.';
    let date='';
    if(/^\d{4}-\d{2}-\d{2}$/.test(last.date||'')) date=last.date.slice(8,10)+'/'+last.date.slice(5,7)+'/'+last.date.slice(0,4);
    $('rv-experience-footer').textContent=(date?'Dernière évaluation le '+date+'. ':'')+'Même fichier GPX, même profil. Ce retour est distinct du calcul physique et n’est jamais extrapolé automatiquement à d’autres sentiers.';
    host.hidden=false;
  }
  function renderVerdict(track) {
    const {points:pts,distances:ds,coarseTrack}=track;
    const total=ds.at(-1), status=$('verdict-status'), details=$('verdict-explanation'), locate=$('verdict-locate');
    $('verdict-factors').replaceChildren();locate.hidden=true;locate.onclick=null;if($('rv-experience'))$('rv-experience').hidden=true;
    if(!Number.isFinite(total)||total<100||pts.length<2){status.dataset.level='unknown';status.dataset.baseLevel='unknown';delete status.dataset.baseScore;status.textContent='Analyse indisponible';details.textContent='Trace trop courte.';return;}
    const bins=[];let totalRise=0, steepUp=0, verySteepUp=0, steepDown=0, maxUp=0, knownSpan=0;
    for(let a=0;a<total;a+=50){
      const b=Math.min(total,a+50),z0=altAt(pts,ds,a),z1=altAt(pts,ds,b);
      if(!RVGPX.intervalKnown(pts,ds,a,b)||!Number.isFinite(z0)||!Number.isFinite(z1))continue;
      knownSpan+=b-a;
      const slope=(z1-z0)/(b-a)*100,rise=Math.max(0,z1-z0);
      bins.push({a,b,slope,rise});totalRise+=rise;
      if(slope>=15)steepUp+=b-a;
      if(slope>=25)verySteepUp+=b-a;
      if(slope<=-15)steepDown+=b-a;
      maxUp=Math.max(maxUp,slope);
    }
    // Sans altitudes fiables, ne jamais afficher à tort un avis favorable.
    if (knownSpan / total < 0.85) {
      status.dataset.level='unknown';status.dataset.baseLevel='unknown';delete status.dataset.baseScore;
      status.textContent='⚪ Verdict indisponible : altitudes insuffisantes';
      details.textContent='Cette trace ne contient pas assez de données altimétriques pour évaluer les pentes et les dénivelés. La distance GPS reste consultable.';
      addFactor('⚠ Altitudes exploitables sur '+Math.round(knownSpan/total*100)+' % du parcours seulement.');
      return;
    }
    // Groupes de montées : 3 % minimum, petites interruptions de 100 m tolérées.
    const climbs=[];let current=null;
    const finish=()=>{if(current&&current.up>=100&&current.rise>=8){current.length=current.end-current.start;climbs.push(current);}current=null;};
    for(const b of bins){
      if(b.slope>=3){if(current&&b.a-current.last>100)finish();if(!current)current={start:b.a,end:b.b,last:b.b,up:0,rise:0,steep:0};current.end=b.b;current.last=b.b;current.up+=b.b-b.a;current.rise+=b.rise;if(b.slope>=15)current.steep+=b.b-b.a;}
      else if(current&&b.b-current.last>100)finish();
    }finish();
    const hardest=climbs.reduce((best,c)=>!best||c.rise*(1+c.steep/Math.max(c.up,1))>best.rise*(1+best.steep/Math.max(best.up,1))?c:best,null);
    // V11.1 (étalonnage pilote) : séparer les montées progressives des rampes
    // raides et répétées. Les profils, la technicité documentée et la calibration
    // individuelle demeurent distincts de ce score GPX physique de base.
    // La correction manuelle de distance concerne seulement la charge de
    // distance; les repères kilométriques cartographiques restent ceux du GPX.
    const manualKm = Number($('distance-override')?.value);
    const effortKm = Number.isFinite(manualKm) && manualKm > 0 && manualKm <= 100
      ? manualKm : total / 1000;
    const score=RVVerdictRules.intrinsic({distanceKm:effortKm,rise:totalRise,steepUp,verySteepUp,steepDown,hardest});
    const active = window.proRandoProfiles?.getActive?.();
    const chosenLevel = Number.isInteger(active?.level) ? active.level : 1;
    // Garde une marge plus élevée pour les tout débutants, sans rejeter par
    // principe les randonnées progressives accessibles avec des pauses.
    const {baseScore:baselineScore,level:baseLevel}=RVVerdictRules.forProfile(score,chosenLevel);
    const adaptive=window.RandoVistaAdaptive?.getAdjustment?.(active,{
      distanceKm:effortKm,ascentM:totalRise
    });
    // Ne déclenche pas un recalcul du verdict : seulement son explication.
    window.dispatchEvent(new CustomEvent('rv:calibration-preview',{detail:adaptive||null}));
    const correction=Number.isInteger(adaptive?.offset)?Math.max(-1,Math.min(1,adaptive.offset)):0;
    const adjustedScore=Math.max(0,baselineScore+correction);
    const level=RVVerdictRules.classify(adjustedScore);
    // La prévision brute est conservée dans le carnet, même si le calibrage est activé.
    status.dataset.baseLevel=baseLevel;
    status.dataset.baseScore=String(baselineScore);
    status.dataset.level=level;
    status.textContent=level==='high'?'🔴 À éviter pour ce niveau':level==='moderate'?'🟠 Exigeante, mais potentiellement faisable':'🟢 A priori adaptée à ce niveau';
    details.textContent=level==='high'?'Plusieurs indicateurs d’effort dépassent les repères prudents définis pour les randonnées habituellement appréciées.':level==='moderate'?'Des passages demanderont un effort notable : vérifier les montées et prévoir des pauses.':'Le GPX ne montre pas de combinaison majeure de difficultés physiques selon les repères choisis.';
    // Référence issue du carnet pour CE GPX exact et CE profil, distincte du
    // calcul des pentes. Ne jamais extrapoler les pierriers à un autre tracé.
    const activeKey=window.RandoVistaJournal?.getActiveRouteKey?.();
    const terrainRef=window.RandoVistaAdaptive?.getReferenceForRoute?.(active,activeKey);
    if(terrainRef){
      const terrainNames={rocks:'pierriers',technical:'passages techniques',exposed:'passages exposés',mud:'terrain glissant'};
      const desc=terrainRef.terrain.map(t=>terrainNames[t]||t).join(', ');
      if(terrainRef.feeling==='avoid'){
        status.dataset.level='high';
        status.textContent='🔴 À éviter : référence terrain enregistrée';
        details.textContent='Tu as déjà évalué ce tracé comme « à éviter » pour ce profil. Ce retour réel prime sur le seul calcul physique du GPX ; les difficultés techniques ne sont pas détectables dans les altitudes.';
      }
      // L'expérience vécue apparaît dans son encart dédié ci-dessous, sans doublon.
    }
    if(track.measurementIncomplete){
      status.textContent+=' — analyse partielle';
      details.textContent+=' Des portions du parcours ne sont pas enregistrées : cet avis concerne uniquement les portions disponibles.';
      addFactor('⚠ Parcours incomplet : distance, dénivelés et difficulté réelle peuvent être sous-estimés.');
    }
    renderPastExperience(active,baseLevel,level);
    if(correction)addFactor('🎯 Calibration personnelle : '+(correction>0?'+1':'−1')+' point sur le score, après '+adaptive.eligible+' randonnées distinctes. Le GPX et le niveau du profil sont inchangés.');
    addFactor('👤 Niveau analysé : '+(active?.name||'Référence')+' — '+(['Très débutant','Débutant','Bon marcheur','Aguerri','Expert'][chosenLevel])+(active?.temporary?' (simulation temporaire)':'')+'.');
    addFactor('↗ Montée cumulée estimée : +'+Math.round(Number.isFinite(track.measurementAscent)?track.measurementAscent:totalRise)+' m · '+Math.round(steepUp)+' m à 15 % ou plus, dont '+Math.round(verySteepUp)+' m à 25 % ou plus.');
    addFactor('↘ Descente à 15 % ou plus : '+Math.round(steepDown)+' m · Distance totale : '+fmt(total)+' km.');
    if(hardest)addFactor('🏔 Montée la plus éprouvante : km '+fmt(hardest.start)+' à '+fmt(hardest.end)+' · environ +'+Math.round(hardest.rise)+' m sur '+fmt(hardest.length)+' km.');
    if(Number.isFinite(manualKm)&&manualKm>0&&manualKm<=100&&Math.abs(manualKm-total/1000)>0.05)addFactor('📏 Distance corrigée : '+manualKm.toFixed(1).replace('.',',')+' km pour estimer l’effort. Les repères sur la carte suivent la trace GPS brute.');
    if(coarseTrack)addFactor('⚠ Trace GPS peu détaillée : les passages courts et raides peuvent être sous-estimés.');
    if(hardest){locate.hidden=false;locate.onclick=()=>{const d=(hardest.start+hardest.end)/2;let lo=0,hi=ds.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(ds[mid]<d)lo=mid+1;else hi=mid;}window.proRandoUI?.showMapPoint(lo);};}
  }
  window.addEventListener('pr-radar-data', event => {
    lastTrack=event.detail;
    renderVerdict(lastTrack);
  });
  for(const name of ['rv:profile-changed','rv:journal-changed','rv:calibration-changed']) {
    window.addEventListener(name, () => {if(lastTrack)renderVerdict(lastTrack);});
  }
})();
