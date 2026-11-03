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
  function renderVerdict(track) {
    const {points:pts,distances:ds,coarseTrack}=track;
    const total=ds.at(-1), status=$('verdict-status'), details=$('verdict-explanation'), locate=$('verdict-locate');
    $('verdict-factors').replaceChildren();locate.hidden=true;locate.onclick=null;
    if(!Number.isFinite(total)||total<100||pts.length<2){status.dataset.level='unknown';status.dataset.baseLevel='unknown';delete status.dataset.baseScore;status.textContent='Analyse indisponible';details.textContent='Trace trop courte.';return;}
    const bins=[];let totalRise=0, steepUp=0, verySteepUp=0, steepDown=0, maxUp=0, knownSpan=0;
    for(let a=0;a<total;a+=50){
      const b=Math.min(total,a+50),z0=altAt(pts,ds,a),z1=altAt(pts,ds,b);
      if(!Number.isFinite(z0)||!Number.isFinite(z1))continue;
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
    // Indicateurs transparents, à ajuster après essais sur randonnées de référence.
    let score=0;
    if(total>=18000)score+=2;else if(total>=12000)score++;
    if(totalRise>=700)score+=3;else if(totalRise>=450)score+=2;else if(totalRise>=250)score++;
    if(steepUp>=650)score+=3;else if(steepUp>=250)score+=2;else if(steepUp>=100)score++;
    if(verySteepUp>=150)score+=2;else if(verySteepUp>=50)score++;
    if(hardest&&hardest.rise>=300)score+=2;else if(hardest&&hardest.rise>=160)score++;
    if(steepDown>=500)score+=2;else if(steepDown>=200)score++;
    // Ajustement indicatif de la sensibilité selon le niveau actif.
    // Les indicateurs physiques GPX restent inchangés.
    const active = window.proRandoProfiles?.getActive?.();
    const chosenLevel = Number.isInteger(active?.level) ? active.level : 1;
    const offsets = [3, 0, -2, -4, -6];
    const baselineScore = Math.max(0, score + offsets[Math.max(0,Math.min(4,chosenLevel))]);
    const baseLevel=baselineScore>=7?'high':baselineScore>=3?'moderate':'low';
    const adaptive=window.RandoVistaAdaptive?.getAdjustment?.(active);
    const correction=Number.isInteger(adaptive?.offset)?Math.max(-1,Math.min(1,adaptive.offset)):0;
    const adjustedScore=Math.max(0,baselineScore+correction);
    const level=adjustedScore>=7?'high':adjustedScore>=3?'moderate':'low';
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
      addFactor('🥾 Déjà parcourue ('+terrainRef.date+') : ressenti '+terrainRef.effort+'/5 · '+(terrainRef.feeling==='avoid'?'à éviter':terrainRef.feeling==='repeat'?'à refaire avec plaisir':'exigeante mais faisable')+' · terrain : '+desc+'.');
    }
    if(correction)addFactor('🎯 Calibration personnelle : '+(correction>0?'+1':'−1')+' point sur le score, après '+adaptive.eligible+' randonnées distinctes. Le GPX et le niveau du profil sont inchangés.');
    addFactor('👤 Niveau analysé : '+(active?.name||'Référence')+' — '+(['Très débutant','Débutant','Bon marcheur','Aguerri','Expert'][chosenLevel])+(active?.temporary?' (simulation temporaire)':'')+'.');
    addFactor('↗ Montée cumulée estimée : +'+Math.round(totalRise)+' m · '+Math.round(steepUp)+' m à 15 % ou plus, dont '+Math.round(verySteepUp)+' m à 25 % ou plus.');
    addFactor('↘ Descente à 15 % ou plus : '+Math.round(steepDown)+' m · Distance totale : '+fmt(total)+' km.');
    if(hardest)addFactor('🏔 Montée la plus éprouvante : km '+fmt(hardest.start)+' à '+fmt(hardest.end)+' · environ +'+Math.round(hardest.rise)+' m sur '+fmt(hardest.length)+' km.');
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
