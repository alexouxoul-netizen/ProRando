/* Pro Rando V7.4 — indicateurs descriptifs des montées, sans modifier la note de difficulté. */
(() => {
  const $ = id => document.getElementById(id);
  const km = m => (m / 1000).toFixed(2).replace('.', ',');
  const metres = m => Math.round(m) + ' m';
  const elAt = (points, distances, m) => {
    let lo = 0, hi = distances.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (distances[mid] < m) lo = mid + 1; else hi = mid; }
    if (lo === 0) return points[0].elevation;
    const a = points[lo - 1].elevation, b = points[lo].elevation, d = distances[lo] - distances[lo - 1];
    return Number.isFinite(a) && Number.isFinite(b) && d > 0 ? a + (b - a) * (m - distances[lo - 1]) / d : null;
  };
  function focus(m, distances) {
    let lo = 0, hi = distances.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (distances[mid] < m) lo = mid + 1; else hi = mid; }
    const i = lo && Math.abs(distances[lo - 1] - m) < Math.abs(distances[lo] - m) ? lo - 1 : lo;
    window.proRandoUI?.showMapPoint(i);
  }
  function addButton(host, className, heading, main, detail, callback, extra) {
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = className;
    const a = document.createElement('small'); a.textContent = heading;
    const b = document.createElement('strong'); b.textContent = main;
    const c = document.createElement('span'); c.textContent = detail;
    btn.append(a, b, c);
    if (extra) { const e = document.createElement('em'); e.textContent = extra; btn.append(e); }
    btn.addEventListener('click', callback); host.append(btn);
  }
  window.addEventListener('pr-radar-data', event => {
    const {points, distances, coarseTrack} = event.detail;
    const highlights = $('climb-highlights'), list = $('climb-list');
    highlights.replaceChildren(); list.replaceChildren();
    const total = distances[distances.length - 1];
    if (!Number.isFinite(total) || total < 100) { $('climb-intro').textContent = 'Trace trop courte pour analyser les montées.'; return; }
    // Échantillons de 50 m. Seuil 3 % ; tolérance de 100 m de répit au sein d'une montée.
    const bins = [];
    for (let a = 0; a < total; a += 50) {
      const b = Math.min(total, a + 50), z0 = elAt(points, distances, a), z1 = elAt(points, distances, b);
      const slope = Number.isFinite(z0) && Number.isFinite(z1) ? 100 * (z1 - z0) / (b - a) : null;
      bins.push({a, b, slope, rise: slope === null ? 0 : Math.max(0, z1 - z0)});
    }
    const climbs = []; let active = null;
    const finish = () => {
      if (active && active.upDistance >= 100 && active.ascent >= 8) {
        active.end = active.lastUpEnd;
        active.length = active.end - active.start;
        active.mean = active.ascent / Math.max(1, active.upDistance) * 100;
        active.load = active.ascent * (1 + Math.min(active.steepDistance / Math.max(1, active.upDistance), 1)) + active.upDistance * 0.015;
        climbs.push(active);
      }
      active = null;
    };
    for (const bin of bins) {
      if (bin.slope !== null && bin.slope >= 3) {
        if (active && bin.a - active.lastUpEnd > 100) finish();
        if (!active) active = {start:bin.a, end:bin.b, lastUpEnd:bin.b, ascent:0, upDistance:0, steepDistance:0, maxSlope:0};
        active.lastUpEnd = bin.b;
        active.ascent += bin.rise; active.upDistance += bin.b - bin.a;
        if (bin.slope >= 15) active.steepDistance += bin.b - bin.a;
        active.maxSlope = Math.max(active.maxSlope, bin.slope);
      } else if (active && bin.b - active.lastUpEnd > 100) finish();
    }
    finish();
    $('climb-intro').textContent = climbs.length ? `${climbs.length} montée(s) significative(s) détectée(s). Appuie sur une fiche pour la localiser sur la carte.` : 'Aucune montée significative détectée avec les critères de cette analyse.';
    $('climb-quality').textContent = (coarseTrack ? '⚠ Trace GPS peu détaillée : résultats indicatifs. ' : '') + 'Estimations par tranches de 50 m ; une montée est retenue à partir de 100 m de pente montante et 8 m de D+. Les replats de 100 m maximum peuvent être regroupés. La technicité du terrain n’est pas évaluée.';
    if (!climbs.length) { const p = document.createElement('p'); p.className = 'climb-empty'; p.textContent = 'Les pentes du parcours restent visibles dans le radar ci-dessus.'; list.append(p); return; }
    const steepest = climbs.reduce((a,b) => b.maxSlope > a.maxSlope ? b : a);
    const hardest = climbs.reduce((a,b) => b.load > a.load ? b : a);
    const idx = c => climbs.indexOf(c) + 1;
    addButton(highlights, 'climb-highlight', 'PENTE LA PLUS RAIDE', Math.round(steepest.maxSlope) + ' %', `Montée n°${idx(steepest)} · pente sur 50 m`, () => focus((steepest.start + steepest.end)/2, distances));
    addButton(highlights, 'climb-highlight', 'EFFORT LE PLUS SOUTENU', '+' + metres(hardest.ascent), `Montée n°${idx(hardest)} · ${km(hardest.length)} km`, () => focus((hardest.start + hardest.end)/2, distances));
    const h = document.createElement('h4'); h.textContent = 'Montées dans l’ordre du parcours'; list.append(h);
    climbs.slice(0, 16).forEach((c, i) => {
      const gap = i ? c.start - climbs[i-1].end : null;
      const recovery = gap === null ? 'Première montée' : gap < 200 ? 'Très peu de distance entre les montées' : gap < 600 ? 'Récupération courte entre les montées' : 'Distance de récupération plus importante';
      addButton(list, 'climb-item', `MONTÉE ${i+1} · KM ${km(c.start)}–${km(c.end)}`,
        `${km(c.length)} km · +${metres(c.ascent)}`,
        `Pente montante moyenne ≈ ${c.mean.toFixed(1).replace('.', ',')} % · maximum sur 50 m ≈ ${Math.round(c.maxSlope)} % · ${metres(c.steepDistance)} à 15 % ou plus`,
        () => focus((c.start+c.end)/2, distances), recovery);
    });
    if (climbs.length > 16) { const p = document.createElement('p'); p.className = 'climb-empty'; p.textContent = `${climbs.length-16} autres montées détectées, non affichées pour garder une liste lisible.`; list.append(p); }
  });
})();
