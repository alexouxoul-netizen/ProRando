/* RandoVista V10.5 TEST — aide à la décision AVANT de partir.
 * Calcul descriptif à partir des points déjà analysés par le moteur GPX.
 * Ne touche ni aux scores, ni à l'état actif, ni aux profils ou au carnet.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const host = $('rv105-advisor');
  if (!host) return;
  const headline = $('rv105-headline');
  const highlights = $('rv105-highlights');
  const context = $('rv105-context');
  const caveat = $('rv105-caveat');
  const tip = $('rv105-tip');
  const numberKm = m => (m / 1000).toFixed(1).replace('.', ',');
  const numberM = m => Math.round(m) + ' m';
  const rangeKm = (a, b) => 'km ' + numberKm(a) + ' à ' + numberKm(b);
  const levelNames = ['Très débutant', 'Débutant', 'Bon marcheur', 'Aguerri', 'Expert'];
  let lastTrack = null, lastFacts = null;

  function altitudeAt(points, ds, d) { return RVGPX.at(points, ds, d); }

  function getFacts(track) {
    const pts = track?.points, ds = track?.distances;
    if (!Array.isArray(pts) || !Array.isArray(ds) || pts.length !== ds.length || ds.length < 2) return null;
    const total = ds[ds.length - 1];
    if (!Number.isFinite(total) || total < 100) return null;
    const bins = [];
    let known = 0, ascent = 0, steepUp = 0, verySteepUp = 0, steepDown = 0;
    for (let start=0; start<total; start+=50) {
      const end=Math.min(total,start+50), a=altitudeAt(pts,ds,start), b=altitudeAt(pts,ds,end);
      if (!RVGPX.intervalKnown(pts,ds,start,end) || !Number.isFinite(a) || !Number.isFinite(b)) { bins.push({start,end,slope:null,rise:0,drop:0}); continue; }
      const slope=100*(b-a)/(end-start), rise=Math.max(0,b-a), drop=Math.max(0,a-b);
      known+=end-start;ascent+=rise;
      if (slope>=15) steepUp+=end-start;
      if (slope>=25) verySteepUp+=end-start;
      if (slope<=-15) steepDown+=end-start;
      bins.push({start,end,slope,rise,drop});
    }
    // Regroupe les montées avec un répit de 100 m au maximum, comme le verdict V7.5.
    const climbs=[];let climb=null;
    const finishClimb=()=>{
      if (climb && climb.up>=100 && climb.rise>=8) {
        climb.length=climb.end-climb.start;
        climb.load=climb.rise*(1+climb.steep/Math.max(1,climb.up));
        climbs.push(climb);
      }
      climb=null;
    };
    for (const b of bins) {
      if (b.slope !== null && b.slope>=3) {
        if (climb && b.start-climb.lastUpEnd>100)finishClimb();
        if (!climb)climb={start:b.start,end:b.end,lastUpEnd:b.end,up:0,rise:0,steep:0,max:0};
        climb.end=b.end;climb.lastUpEnd=b.end;climb.up+=b.end-b.start;climb.rise+=b.rise;
        if (b.slope>=15)climb.steep+=b.end-b.start;
        climb.max=Math.max(climb.max,b.slope);
      } else if (climb && b.end-climb.lastUpEnd>100)finishClimb();
    }
    finishClimb();
    climbs.sort((a,b)=>b.load-a.load);

    // Descentes >= 15 % sur des tranches de 50 m ; répit de 100 m toléré.
    const descents=[];let descent=null;
    const finishDescent=()=>{
      if (descent && descent.steep>=100) {
        descent.length=descent.end-descent.start;
        descents.push(descent);
      }
      descent=null;
    };
    for (const b of bins) {
      if (b.slope !== null && b.slope<=-15) {
        if (descent && b.start-descent.lastEnd>100)finishDescent();
        if (!descent)descent={start:b.start,end:b.end,lastEnd:b.end,steep:0,drop:0,max:0};
        descent.end=b.end;descent.lastEnd=b.end;descent.steep+=b.end-b.start;
        descent.drop+=b.drop;descent.max=Math.max(descent.max,-b.slope);
      } else if (descent && b.end-descent.lastEnd>100)finishDescent();
    }
    finishDescent();
    descents.sort((a,b)=>b.steep-a.steep || b.drop-a.drop);
    // Enchaînements de deux montées notables ; cet indicateur ne prédit pas la fatigue réelle.
    const order=climbs.slice().sort((a,b)=>a.start-b.start);
    const closePairs=[];
    for (let i=1;i<order.length;i++) {
      const gap=order[i].start-order[i-1].end;
      if (gap>=0 && gap<=350 && order[i].rise>=35 && order[i-1].rise>=35)
        closePairs.push({a:order[i-1],b:order[i],gap});
    }
    return {total,incomplete:!!track.measurementIncomplete,knownShare:known/total,altitudeOk:known/total>=.85,ascent,
      steepUp,verySteepUp,steepDown,climbs,descents,closePairs,
      coarse:!!track.coarseTrack,distances:ds};
  }

  function nearestIndex(ds,d) {
    let lo=0,hi=ds.length-1;
    while(lo<hi){const mid=(lo+hi)>>>1;if(ds[mid]<d)lo=mid+1;else hi=mid;}
    return lo>0 && Math.abs(ds[lo-1]-d)<Math.abs(ds[lo]-d) ? lo-1 : lo;
  }
  function addPoint(text,position,important=false){
    const li=document.createElement('li');li.className='rv105-point'+(important?' rv105-priority':'');
    const span=document.createElement('span');span.textContent=text;li.append(span);
    if(Number.isFinite(position) && lastFacts?.distances?.length){
      const button=document.createElement('button');button.type='button';button.className='rv105-map-jump';
      button.textContent='Voir sur la carte';button.setAttribute('aria-label','Localiser ce passage sur la carte');
      button.addEventListener('click',()=>{
        if (typeof window.proRandoUI?.showMapPoint==='function')
          window.proRandoUI.showMapPoint(nearestIndex(lastFacts.distances,position));
      });li.append(button);
    }
    highlights.append(li);
  }
  function render(){
    if(!lastFacts){host.hidden=true;return;}
    const facts=lastFacts,profile=window.proRandoProfiles?.getActive?.();
    const status=$('verdict-status'),level=status?.dataset.level||'unknown';
    const chosen=Number.isInteger(profile?.level)?Math.max(0,Math.min(4,profile.level)):1;
    const label=profile?.name||'ce profil';
    const route=window.RandoVistaRoutes?.active;
    const ref=!profile?.temporary && route?.xml
      ? window.RandoVistaAdaptive?.getReferenceForRoute?.(profile,window.RandoVistaJournal?.fingerprint?.(route.xml)) : null;
    const refAvoid=ref?.feeling==='avoid';
    const manual=Number($('distance-override')?.value);
    const manuallyCorrected=manual>0 && manual<=100;
    host.hidden=false;highlights.replaceChildren();host.dataset.tone=refAvoid?'high':level;
    context.textContent='Pour '+label+' · '+levelNames[chosen]+(profile?.temporary?' · simulation temporaire':'')+' · '+numberKm(facts.total)+' km GPX'+(manuallyCorrected?' · distance saisie : '+manual.toFixed(1).replace('.',',')+' km':'');
    if(!facts.altitudeOk || (level==='unknown'&&!refAvoid)){
      headline.textContent=refAvoid
        ? 'Attention : ce GPX a déjà été signalé « à éviter » pour ce profil. Le relief est en plus insuffisamment documenté.'
        : 'Relief insuffisamment documenté : impossible de juger si cette randonnée est adaptée.';
      addPoint('Altitudes exploitables sur environ '+Math.round(facts.knownShare*100)+' % du tracé : vérifie une autre source ou une trace altimétrique fiable.',null,true);
      tip.textContent='Pour choisir : privilégie un itinéraire dont le dénivelé et les pentes sont connus, puis vérifie la fiche du parcours.';
    }else{
      if(refAvoid)headline.textContent='Attention : ce même parcours a déjà été évalué « à éviter » pour ce profil. Cette expérience doit peser dans ton choix.';
      else if(level==='high')headline.textContent='Ce parcours paraît trop exigeant pour '+label+' selon le relief et la distance. Recherche une option plus douce.';
      else if(level==='moderate')headline.textContent='Randonnée envisageable, mais certains efforts méritent d’être anticipés pour '+label+'.';
      else if(facts.total>=12000 && chosen<=1)headline.textContent='Les pentes semblent modérées, mais '+numberKm(facts.total)+' km représentent une distance importante pour un profil débutant. Ne te fie pas seulement au verdict favorable.';
      else headline.textContent='Le relief paraît plutôt compatible avec '+label+' ; examine tout de même les passages ci-dessous avant de décider.';

      const main=facts.climbs[0];
      const important=level==='high'||level==='moderate';
      if(main && (main.rise>=40 || main.length>=600)){
        addPoint('Montée principale '+rangeKm(main.start,main.end)+' : environ +'+numberM(main.rise)+' sur '+numberKm(main.length)+' km'+(main.steep>=100?', dont '+numberM(main.steep)+' à 15 % ou plus':'')+'.', (main.start+main.end)/2,important);
      }
      const down=facts.descents[0];
      if(down && (facts.steepDown>=100 || down.steep>=100)){
        addPoint('Descente raide '+rangeKm(down.start,down.end)+' : '+numberM(down.steep)+' à −15 % ou plus. La descente peut aussi être fatigante.',(down.start+down.end)/2,important);
      }
      if(facts.verySteepUp>=50 && (!main || facts.verySteepUp>main.steep*0.85)){
        addPoint('Pentes très raides : '+numberM(facts.verySteepUp)+' de montée à 25 % ou plus, réparties sur le GPX.',null,important);
      } else if(facts.steepUp>=200 && main?.steep<facts.steepUp*0.6){
        addPoint('Plusieurs secteurs raides : '+numberM(facts.steepUp)+' de montée à 15 % ou plus au total.',null,important);
      }
      if(highlights.children.length<3 && facts.closePairs.length){
        const p=facts.closePairs[0];
        addPoint('Deux montées se suivent avec seulement '+numberM(p.gap)+' de parcours entre elles : prévoir une récupération adaptée.',(p.b.start+p.a.end)/2,important);
      }
      if(highlights.children.length<3 && (facts.total>=12000 || facts.ascent>=450)){
        addPoint('Effort global : '+numberKm(facts.total)+' km et environ +'+numberM(facts.ascent)+' de montée cumulée. Adapte pauses et rythme au profil.',null,important);
      }
      if(!highlights.children.length){
        addPoint('Aucune longue montée ni descente raide dominante repérée dans les altitudes de ce GPX. Cela ne renseigne pas l’état réel du sentier.',null,false);
      }
      const choiceHint=level==='high'||refAvoid
        ? 'Pour choisir : compare avec une randonnée plus courte, avec moins de dénivelé et surtout moins de portions raides.'
        : level==='moderate'
        ? 'Pour choisir : compare la longueur de la montée principale et les pentes raides avec une autre randonnée ; prévois des pauses.'
        : 'Pour choisir : confronte ces passages à un second GPX et aux informations terrain de la fiche de randonnée.';
      tip.textContent=choiceHint;
    }
    if(facts.incomplete && facts.altitudeOk) addPoint('Analyse partielle : seules les portions enregistrées sont prises en compte ; le parcours complet peut être plus exigeant.',null,true);
    // Les données incertaines ne doivent jamais être remplacées par de fausses assurances.
    caveat.textContent=(manuallyCorrected?'La distance saisie sert au résumé, mais les repères kilométriques restent basés sur le GPX brut. ':'')+
      (facts.coarse?'⚠ Trace GPS peu détaillée : les passages courts peuvent être sous-estimés. ':'')+
      'Pentes estimées par tranches de 50 m. Le GPX ne permet pas de connaître les pierriers, l’exposition, l’état du chemin ou la météo. Vérifie la description et les conditions avant de partir.';
  }

  window.addEventListener('pr-radar-data',event=>{
    lastTrack=event.detail||null;lastFacts=getFacts(lastTrack);render();
  });
  for(const name of ['rv:profile-changed','rv:calibration-changed','rv:journal-changed']){
    window.addEventListener(name,render);
  }
  document.addEventListener('rv:route-state',event=>{
    if(event.detail?.status==='error'||event.detail?.status==='loading')return;
    if(event.detail?.status==='ready'||event.detail?.status==='updated')render();
  });
  window.RandoVistaAdvisor={getFacts,render};
})();
