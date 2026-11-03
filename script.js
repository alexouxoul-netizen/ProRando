/* Pro Rando — moteur d'analyse GPX fiabilisé */

const map = L.map('map', { center: [46.6, 2.4], zoom: 6 });
let currentLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
const currentLayerGroup = L.layerGroup().addTo(map);
const hoverMarker = L.circleMarker([0, 0], {
    radius: 7, color: '#ffffff', weight: 2, fillColor: '#0984e3', fillOpacity: 1
});
let chart = null;
let gainChart = null;
let sharedChartIndex = -1;
let lastTrackPoints = [];
let lastGpxXml = null;
let selectedDescentLayer = null;

// La pente est estimée sur une fenêtre locale plutôt qu'entre deux points GPS bruts.
// Cela stabilise les couleurs sans modifier les altitudes ni les D+/D- cumulés.
const SLOPE_WINDOW_METERS = 30;

function changeLayer() {
    const value = document.getElementById('layer-select').value;
    const url = value === 'topo'
        ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    map.removeLayer(currentLayer);
    currentLayer = L.tileLayer(url, {
        attribution: value === 'topo'
            ? '&copy; OpenTopoMap contributors'
            : '&copy; OpenStreetMap contributors'
    }).addTo(map);
}

const legend = L.control({ position: 'bottomleft' });
legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML = '<b>Montée (+)</b><br>' +
        '<i style="background:#55A630"></i> &lt;10% ' +
        '<i style="background:#FF9F43"></i> 10–15% ' +
        '<i style="background:#EE5253"></i> 15–25% ' +
        '<i style="background:#000000"></i> &gt;25%<br>' +
        '<b>Descente (-)</b><br>' +
        '<i style="background:#ffafcc"></i> &lt;10% ' +
        '<i style="background:#00cec9"></i> 10–15% ' +
        '<i style="background:#0984e3"></i> 15–25% ' +
        '<i style="background:#6c5ce7"></i> &gt;25%';
    L.DomEvent.disableClickPropagation(div);
    return div;
};
// V7.1 : légende à la demande dans les commandes de la carte.

function getPenteColor(pente) {
    if (pente >= 0) {
        if (pente < 10) return '#55A630';
        if (pente < 15) return '#FF9F43';
        if (pente < 25) return '#EE5253';
        return '#000000';
    }
    const absoluteSlope = Math.abs(pente);
    if (absoluteSlope < 10) return '#ffafcc';
    if (absoluteSlope < 15) return '#00cec9';
    if (absoluteSlope < 25) return '#0984e3';
    return '#6c5ce7';
}

function getElementsByLocalName(xmlDoc, name) {
    return Array.from(xmlDoc.getElementsByTagNameNS('*', name));
}

// Interpole l'altitude à une distance donnée le long du parcours.
// Renvoie null si l'intervalle concerné ne possède pas deux altitudes valides.
function elevationAtDistance(points, cumulativeDistances, targetDistance) {
    if (targetDistance < 0 || targetDistance > cumulativeDistances[cumulativeDistances.length - 1]) return null;

    let low = 0;
    let high = cumulativeDistances.length - 1;
    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (cumulativeDistances[middle] < targetDistance) low = middle + 1;
        else high = middle;
    }

    let right = low;
    if (right === 0) return points[0].elevation;
    if (cumulativeDistances[right] === targetDistance) return points[right].elevation;

    const left = right - 1;
    const distanceSpan = cumulativeDistances[right] - cumulativeDistances[left];
    const leftElevation = points[left].elevation;
    const rightElevation = points[right].elevation;
    if (distanceSpan <= 0 || leftElevation === null || rightElevation === null) return null;

    const ratio = (targetDistance - cumulativeDistances[left]) / distanceSpan;
    return leftElevation + (rightElevation - leftElevation) * ratio;
}

// Pente moyenne locale centrée sur le milieu du segment (fenêtre de 30 m).
// Aux extrémités du parcours, la fenêtre est automatiquement raccourcie.
function getLocalSlope(points, cumulativeDistances, segmentIndex, windowMeters = SLOPE_WINDOW_METERS) {
    const segmentStart = cumulativeDistances[segmentIndex - 1];
    const segmentEnd = cumulativeDistances[segmentIndex];
    const midpoint = (segmentStart + segmentEnd) / 2;
    const halfWindow = windowMeters / 2;
    const start = Math.max(0, midpoint - halfWindow);
    const end = Math.min(cumulativeDistances[cumulativeDistances.length - 1], midpoint + halfWindow);
    const horizontalDistance = end - start;

    if (horizontalDistance <= 0) return null;
    const startElevation = elevationAtDistance(points, cumulativeDistances, start);
    const endElevation = elevationAtDistance(points, cumulativeDistances, end);
    if (startElevation === null || endElevation === null) return null;

    return ((endElevation - startElevation) / horizontalDistance) * 100;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function resetStats() {
    ['dist-total', 'd-plus', 'd-moins'].forEach(id => setText(id, '-'));
    ['m-bleu1', 'm-bleu2', 'm-bleu3', 'm-violet', 'm-vert', 'm-orange', 'm-rouge', 'm-noir']
        .forEach(id => setText(id, '0 m'));
    setText('difficulty-level', '—');
    setText('difficulty-name', "En attente d'un GPX");
    setText('effort-distance', '— km-effort');
    setText('walking-time', '—');
    setText('difficulty-reason', 'Charge physique estimée');
    setText('climb-warning', '—');
    setText('longest-climb', '—');
    setText('gpx-quality', '—');
    setText('descent-warning', '—');
    setText('descent-alert', '');
    document.getElementById('descent-alert')?.classList.add('is-hidden');
    if (selectedDescentLayer) { map.removeLayer(selectedDescentLayer); selectedDescentLayer = null; }
    const panel = document.getElementById('difficulty');
    if (panel) delete panel.dataset.level;
}

// Indicateur physique simple et transparent : distance-effort = distance (km) + D+ (m) / 100.
// Le temps indicatif suit une allure moyenne de 4 km/h + 600 m de montée par heure.
// Ces repères ne prétendent pas mesurer la technicité, l'exposition ou l'état du terrain.
function calculateDifficulty(distanceMeters, ascentMeters, descentMeters, uphill, climbs) {
    const corrected = Number(document.getElementById("distance-override")?.value);
    const distanceKm = corrected > 0 && corrected <= 100 ? corrected : distanceMeters / 1000;
    const effortKm = distanceKm + ascentMeters / 100;
    const steep = uphill.hard + uphill.extreme;
    const steepPlus = uphill.extreme;
    const longest = climbs.longest;
    // V6.1 : calibration expérimentale sur trois parcours réels.
    // On réduit le poids de la distance et renforce les pentes >15 % et >25 %.
    // Le GPX ne permet pas de déduire la présence de pierriers ou l'exposition.
    const base = distanceKm * 0.07 + ascentMeters * 0.0014;
    const steepLoad = Math.min(2.1, steep / 700) + Math.min(1.1, steepPlus / 250);
    const sustainedLoad = Math.min(0.7, longest / 4000);
    // Fatigue cumulative : n’intervient que sur les longues randonnées avec D+ et montées raides significatifs.
    // Ne modifie pas les références courtes ou modérées.
    const fatigueLoad = distanceKm >= 14 && ascentMeters >= 450 && steep >= 900
        ? 1.65 + Math.min(0.5, (distanceKm - 14) * 0.1) : 0;
    const score = base + steepLoad + sustainedLoad + fatigueLoad;
    let level = score < 1.1 ? 1 : score < 2.7 ? 2 : score < 3.5 ? 3 : score < 4.35 ? 4 : 5;
    // Une montée concentrée reste pénalisante, même sur une courte trace.
    if (steep >= 500 && steep / Math.max(1, distanceMeters) > 0.13) level = Math.max(level, 3);
    const names = ['Très accessible', 'Modérée', 'Soutenue', 'Difficile', 'Très difficile'];
    const reasons = [];
    if (steep >= 250) reasons.push('montées raides : ' + Math.round(steep) + ' m');
    if (longest >= 700) reasons.push('montée continue : ' + Math.round(longest) + ' m');
    if (distanceKm >= 14) reasons.push('long parcours');
    if (fatigueLoad > 0) reasons.push('fatigue cumulative : distance + dénivelé + fortes pentes');
    if (!reasons.length) reasons.push('pentes plutôt progressives');
    const estimatedHours = distanceKm / 4 + ascentMeters / 600 + descentMeters / 1200;
    const totalMinutes = Math.max(1, Math.round(estimatedHours * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const timeLabel = hours > 0 ? hours + ' h' + (minutes ? ' ' + String(minutes).padStart(2, '0') : '') : totalMinutes + ' min';
    setText('difficulty-level', level + '/5');
    setText('difficulty-name', names[level - 1]);
    setText('effort-distance', effortKm.toFixed(1) + ' km-effort');
    setText('walking-time', timeLabel);
    setText('difficulty-reason', reasons.join(' · '));
    setText('climb-warning', steep >= 250 ? '⚠ Montées raides : ' + Math.round(steep) + ' m cumulés' : '✓ Peu de montées très raides détectées');
    setText('longest-climb', Math.round(longest) + ' m');
    const panel = document.getElementById('difficulty');
    if (panel) panel.dataset.level = level;
}

// Regroupe les montées continues avec tolérance pour les courts replats.
// Utilise les pentes lissées existantes pour conserver la cohérence de la carte.
function analyzeClimbs(points, cumulativeDistances) {
    let longest = 0, run = 0, gap = 0;
    for (let i = 1; i < points.length; i++) {
        const length = cumulativeDistances[i] - cumulativeDistances[i - 1];
        if (length <= 0) continue;
        const slope = getLocalSlope(points, cumulativeDistances, i);
        if (slope !== null && slope >= 3) {
            run += length + gap;
            gap = 0;
        } else {
            gap += length;
            if (gap > 80) { longest = Math.max(longest, run); run = 0; gap = 0; }
        }
    }
    return { longest: Math.max(longest, run) };
}

function afficherErreur(message) {
    alert(message);
}

const fileInput = document.getElementById('gpx-file');
fileInput.addEventListener('change', function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!/\.gpx$/i.test(file.name)) {
        afficherErreur('Choisis un fichier au format GPX.');
        fileInput.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function (loadEvent) {
        try {
            lastGpxXml = loadEvent.target.result;
            analyserGPX(lastGpxXml);
        } catch (error) {
            console.error('Erreur pendant l’analyse GPX :', error);
            afficherErreur('Une erreur est survenue pendant la lecture du GPX. Vérifie que le fichier est valide.');
        }
    };
    reader.onerror = function () {
        afficherErreur('Impossible de lire ce fichier GPX.');
    };
    reader.readAsText(file);
});

function analyserGPX(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    if (xmlDoc.getElementsByTagName('parsererror').length) {
        afficherErreur('Le fichier GPX semble invalide ou endommagé.');
        return;
    }

    // Certains GPX contiennent une trace (trkpt), d’autres une route (rtept).
    let rawPoints = getElementsByLocalName(xmlDoc, 'trkpt');
    if (!rawPoints.length) rawPoints = getElementsByLocalName(xmlDoc, 'rtept');
    if (!rawPoints.length) {
        afficherErreur('Aucun point de parcours trouvé dans ce fichier GPX.');
        return;
    }

    const points = [];
    for (const node of rawPoints) {
        const lat = Number(node.getAttribute('lat'));
        const lon = Number(node.getAttribute('lon'));
        const eleNode = getElementsByLocalName(node, 'ele')[0];
        const elevationValue = eleNode ? Number(eleNode.textContent) : NaN;
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
        points.push({
            lat,
            lon,
            elevation: Number.isFinite(elevationValue) ? elevationValue : null,
            latLng: L.latLng(lat, lon)
        });
    }

    if (points.length < 2) {
        afficherErreur('Le fichier doit contenir au moins deux points GPS valides.');
        return;
    }

    currentLayerGroup.clearLayers();
    hoverMarker.remove();
    let distance = 0;
    let dPlus = 0;
    let dMoins = 0;
    const uphill = { easy: 0, moderate: 0, hard: 0, extreme: 0 };
    const downhill = { easy: 0, moderate: 0, hard: 0, extreme: 0 };
    const distancesKm = [];
    const elevations = [];
    const dPlusList = [];
    const dMoinsList = [];
    const validLatLngs = points.map(point => point.latLng);
    const cumulativeDistances = [0];
    for (let i = 1; i < points.length; i++) {
        cumulativeDistances.push(cumulativeDistances[i - 1] + map.distance(points[i - 1].latLng, points[i].latLng));
    }

    // Qualité de la géométrie : la médiane évite de confondre quelques pauses GPS
    // avec une trace entière simplifiée. Ne prétend pas mesurer la précision altimétrique.
    const spacings = [];
    for (let i = 1; i < cumulativeDistances.length; i++) {
        const delta = cumulativeDistances[i] - cumulativeDistances[i - 1];
        if (delta > 0.2) spacings.push(delta);
    }
    spacings.sort((a, b) => a - b);
    const medianSpacing = spacings.length ? spacings[Math.floor(spacings.length / 2)] : Infinity;
    const coarseTrack = medianSpacing > 15 || points.length < 50;
    // La fenêtre courte sert uniquement à la couleur et au repérage des descentes.
    // La note de difficulté reste fondée sur la fenêtre historique de 30 m.
    const visualWindow = coarseTrack ? 30 : 20;
    setText('gpx-quality', coarseTrack
        ? '⚠ Trace peu détaillée (espacement médian ' + Math.round(medianSpacing) + ' m) : les pentes courtes peuvent être sous-estimées.'
        : '✓ Trace suffisamment détaillée pour rechercher des pentes sur 20 m (précision de l’altitude non garantie).');
    let steepDescentMeters = 0;
    let extremeDescentMeters = 0;
    let strongestDescent = 0;
    const steepDescentSections = [];
    let currentSteepSection = null;
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        distance = cumulativeDistances[i];
        if (i > 0) {
            const previous = points[i - 1];
            const segmentDistance = cumulativeDistances[i] - cumulativeDistances[i - 1];
            distance = cumulativeDistances[i];

            // Les D+ / D- restent calculés sur les altitudes GPX d'origine.
            // Seule la classification/coloration utilise une pente locale sur 30 m.
            if (segmentDistance > 0 && previous.elevation !== null && point.elevation !== null) {
                const elevationDifference = point.elevation - previous.elevation;
                if (elevationDifference > 0) dPlus += elevationDifference;
                else if (elevationDifference < 0) dMoins += Math.abs(elevationDifference);

                const slope = getLocalSlope(points, cumulativeDistances, i);
                const displaySlope = getLocalSlope(points, cumulativeDistances, i, visualWindow);
                if (displaySlope !== null && displaySlope < strongestDescent) strongestDescent = displaySlope;
                // Regroupe les tronçons descendants raides contigus, sans changer les couleurs.
                // Les micro-pauses de pente inférieures à 20 m ne coupent pas un passage.
                if (displaySlope !== null && displaySlope <= -15) {
                    if (!currentSteepSection || cumulativeDistances[i - 1] - currentSteepSection.lastSteepEnd > 20) {
                        if (currentSteepSection) steepDescentSections.push(currentSteepSection);
                        currentSteepSection = { start: cumulativeDistances[i - 1], lastSteepEnd: cumulativeDistances[i], minSlope: displaySlope, steepMeters: segmentDistance };
                    } else {
                        currentSteepSection.lastSteepEnd = cumulativeDistances[i];
                        currentSteepSection.minSlope = Math.min(currentSteepSection.minSlope, displaySlope);
                        currentSteepSection.steepMeters += segmentDistance;
                    }
                }
                if (displaySlope !== null && displaySlope <= -15) steepDescentMeters += segmentDistance;
                if (displaySlope !== null && displaySlope <= -25) extremeDescentMeters += segmentDistance;
                if (slope !== null) {
                    const absoluteSlope = Math.abs(slope);
                    if (slope >= 0) {
                        if (absoluteSlope < 10) uphill.easy += segmentDistance;
                        else if (absoluteSlope < 15) uphill.moderate += segmentDistance;
                        else if (absoluteSlope < 25) uphill.hard += segmentDistance;
                        else uphill.extreme += segmentDistance;
                    } else {
                        if (absoluteSlope < 10) downhill.easy += segmentDistance;
                        else if (absoluteSlope < 15) downhill.moderate += segmentDistance;
                        else if (absoluteSlope < 25) downhill.hard += segmentDistance;
                        else downhill.extreme += segmentDistance;
                    }
                    L.polyline([previous.latLng, point.latLng], {
                        color: getPenteColor(displaySlope === null ? slope : displaySlope), weight: 5, opacity: 0.9
                    }).addTo(currentLayerGroup).bindPopup('Pente locale (' + visualWindow + ' m) : ' + (displaySlope === null ? slope : displaySlope).toFixed(1) + '%');
                } else {
                    L.polyline([previous.latLng, point.latLng], {
                        color: '#777777', weight: 4, opacity: 0.75
                    }).addTo(currentLayerGroup).bindPopup('Pente indisponible (altitude manquante à proximité)');
                }
            } else {
                // Le tracé reste visible même si l’altitude manque ou si le segment est nul.
                L.polyline([previous.latLng, point.latLng], {
                    color: '#777777', weight: 4, opacity: 0.75
                }).addTo(currentLayerGroup);
            }
        }

        distancesKm.push(Number((distance / 1000).toFixed(3)));
        elevations.push(point.elevation);
        dPlusList.push(Math.round(dPlus));
        dMoinsList.push(Math.round(dMoins));
    }

    if (currentSteepSection) steepDescentSections.push(currentSteepSection);
    // Afficher jusqu'à trois passages significatifs, classés par longueur raide cumulée.
    // Le classement est indépendant de la note globale et ne modifie aucune couleur.
    const significantDescents = steepDescentSections
        .filter(section => section.steepMeters >= 30)
        .sort((a, b) => b.steepMeters - a.steepMeters || a.minSlope - b.minSlope)
        .slice(0, 3);
    const descentAlert = document.getElementById('descent-alert');
    if (selectedDescentLayer) { map.removeLayer(selectedDescentLayer); selectedDescentLayer = null; }
    if (descentAlert) {
        descentAlert.replaceChildren();
        if (significantDescents.length) {
            const heading = document.createElement('strong');
            heading.textContent = '⚠ Passages de descente raide détectés — cliquer pour localiser';
            descentAlert.appendChild(heading);
            const list = document.createElement('ol');
            list.className = 'descent-list';
            for (const section of significantDescents) {
                const item = document.createElement('li');
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'descent-jump';
                const km = meters => (meters / 1000).toFixed(2).replace('.', ',');
                button.textContent = 'Km ' + km(section.start) + '–' + km(section.lastSteepEnd) +
                    ' · ' + Math.round(section.steepMeters) + ' m raides · jusqu’à ' +
                    Math.abs(section.minSlope).toFixed(0) + ' % estimés';
                button.addEventListener('click', () => {
                    if (selectedDescentLayer) map.removeLayer(selectedDescentLayer);
                    const sectionPoints = points.filter((point, index) =>
                        cumulativeDistances[index] >= section.start && cumulativeDistances[index] <= section.lastSteepEnd
                    ).map(point => point.latLng);
                    // Inclure les deux points qui encadrent le passage, même s'il est court.
                    const startIndex = Math.max(0, cumulativeDistances.findIndex(d => d >= section.start) - 1);
                    let endIndex = cumulativeDistances.findIndex(d => d >= section.lastSteepEnd);
                    if (endIndex < 0) endIndex = points.length - 1;
                    sectionPoints.unshift(points[startIndex].latLng);
                    sectionPoints.push(points[endIndex].latLng);
                    selectedDescentLayer = L.polyline(sectionPoints, {
                        color: '#ffde59', weight: 9, opacity: 0.85, interactive: false
                    }).addTo(map);
                    map.fitBounds(selectedDescentLayer.getBounds(), { padding: [65, 65], maxZoom: 16 });
                    button.focus();
                });
                item.appendChild(button);
                list.appendChild(item);
            }
            descentAlert.appendChild(list);
            const note = document.createElement('small');
            note.textContent = 'Pentes estimées depuis le GPX : terrain et sécurité non évalués.';
            descentAlert.appendChild(note);
            descentAlert.classList.remove('is-hidden');
        } else {
            descentAlert.classList.add('is-hidden');
        }
    }
    setText('descent-warning', steepDescentMeters >= 20
        ? '↘ Descentes raides détectées : ' + Math.round(steepDescentMeters) + ' m à plus de 15 %, dont ' + Math.round(extremeDescentMeters) + ' m à plus de 25 % (pente locale minimale ' + strongestDescent.toFixed(1) + ' %).'
        : '↘ Aucune descente durable à plus de 15 % détectée dans les altitudes du fichier.');
    lastTrackPoints = points;
    map.fitBounds(L.latLngBounds(validLatLngs), { padding: [20, 20] });

    const manualKm = Number(document.getElementById('distance-override')?.value);
    setText('dist-total', (manualKm > 0 && manualKm <= 100 ? manualKm : distance / 1000).toFixed(1));
    setText('distance-info', manualKm > 0 && manualKm <= 100 ? 'Distance corrigée manuellement (trace GPS conservée)' : 'Distance GPS brute : vérifier en cas de dérive');
    setText('d-plus', Math.round(dPlus) + ' m');
    setText('d-moins', Math.round(dMoins) + ' m');
    setText('up-total', '+' + Math.round(dPlus) + ' m');
    setText('down-total', '−' + Math.round(dMoins) + ' m');
    setText('m-vert', Math.round(uphill.easy) + ' m');
    setText('m-orange', Math.round(uphill.moderate) + ' m');
    setText('m-rouge', Math.round(uphill.hard) + ' m');
    setText('m-noir', Math.round(uphill.extreme) + ' m');
    setText('m-bleu1', Math.round(downhill.easy) + ' m');
    setText('m-bleu2', Math.round(downhill.moderate) + ' m');
    setText('m-bleu3', Math.round(downhill.hard) + ' m');
    setText('m-violet', Math.round(downhill.extreme) + ' m');

    // Affiche un indice d'effort et une durée indicative, sans prétendre évaluer la technicité.
    calculateDifficulty(distance, dPlus, dMoins, uphill, analyzeClimbs(points, cumulativeDistances));

    // Affichage des waypoints, sans supposer qu’ils possèdent un nom.
    for (const waypoint of getElementsByLocalName(xmlDoc, 'wpt')) {
        const lat = Number(waypoint.getAttribute('lat'));
        const lon = Number(waypoint.getAttribute('lon'));
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
        const nameNode = getElementsByLocalName(waypoint, 'name')[0];
        const name = nameNode ? nameNode.textContent.trim() : 'Point de passage';
        L.marker([lat, lon]).addTo(currentLayerGroup).bindPopup(name || 'Point de passage');
    }

    if (chart) chart.destroy();
    if (gainChart) { gainChart.destroy(); gainChart = null; }
    sharedChartIndex = -1;
    const canvas = document.getElementById('elevationChart');
    chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: distancesKm,
            datasets: [{
                label: 'Altitude', data: elevations,
                borderColor: '#0984e3', backgroundColor: 'rgba(9,132,227,0.12)',
                fill: true, pointRadius: 0, pointHitRadius: 12,
                borderWidth: 2, spanGaps: false, tension: 0.15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index', intersect: false,
                    callbacks: {
                        title: context => context.length ? 'Distance : ' + Number(context[0].label).toFixed(2) + ' km' : '',
                        label: context => context.raw === null
                            ? 'Altitude indisponible'
                            : 'Altitude : ' + Math.round(context.raw) + ' m',
                        afterBody: context => {
                            if (!context.length) return [];
                            const index = context[0].dataIndex;
                            const local = index > 0 ? getLocalSlope(points, cumulativeDistances, index) : 0;
                            const start = cumulativeDistances[index];
                            const finish = Math.min(cumulativeDistances[cumulativeDistances.length - 1], start + 100);
                            const a0 = elevationAtDistance(points, cumulativeDistances, start);
                            const a1 = elevationAtDistance(points, cumulativeDistances, finish);
                            const future = finish > start && Number.isFinite(a0) && Number.isFinite(a1) ? (a1-a0)/(finish-start)*100 : null;
                            const direction = local > 1 ? 'Montée' : local < -1 ? 'Descente' : 'Plat';
                            const lines = ['D+ cumulé : ' + dPlusList[index] + ' m', 'D- cumulé : ' + dMoinsList[index] + ' m'];
                            if (Number.isFinite(local)) lines.push('Pente locale : ' + (local > 0 ? '+' : '') + local.toFixed(1) + '% (' + direction + ')' + (Math.abs(local) >= 15 ? ' ⚠ Forte pente' : ''));
                            if (future !== null) lines.push('Prochains ' + Math.round(finish-start) + ' m : ' + (future > 0 ? '+' : '') + future.toFixed(1) + '% (moyenne)');
                            return lines;
                        }
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Distance (km)' }, ticks: { maxTicksLimit: 8 } },
                y: { title: { display: true, text: 'Altitude (m)' } }
            },
            onHover: (event, activeElements) => {
                if (activeElements.length) syncReliefCursor(activeElements[0].index, 'altitude');
                else clearReliefCursor();
            }
        }
    });
    // Deuxième graphique : mêmes points GPX, même abscisse, valeurs cumulées réelles.
    const gainCanvas = document.getElementById('gainChart');
    if (gainCanvas) {
        gainChart = new Chart(gainCanvas, {
            type: 'line',
            data: { labels: distancesKm, datasets: [
                { label: 'D+ cumulé', data: dPlusList, borderColor: '#FF9F43', backgroundColor: 'transparent', pointRadius: 0, pointHitRadius: 15, borderWidth: 2.5, tension: 0 },
                { label: 'D− cumulé', data: dMoinsList, borderColor: '#0984e3', backgroundColor: 'transparent', pointRadius: 0, pointHitRadius: 15, borderWidth: 2.5, tension: 0 }
            ] },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: {
                    title: items => items.length ? 'Km ' + Number(items[0].label).toFixed(2) : '',
                    label: item => item.dataset.label + ' : ' + Math.round(item.raw) + ' m'
                } } },
                scales: { x: { ticks: { maxTicksLimit: 6 }, title: { display: true, text: 'Distance (km)' } }, y: { beginAtZero: true, title: { display: true, text: 'Dénivelé (m)' } } },
                onHover: (event, elements) => { if (elements.length) syncReliefCursor(elements[0].index, 'gain'); else clearReliefCursor(); }
            }
        });
    }
    // Exposer uniquement la sélection courante pour la navigation de l'interface.
    window.proRandoRelief = { select: i => syncReliefCursor(i, 'external'), getIndex: () => sharedChartIndex };
    function syncReliefCursor(index, source) {
        if (!Number.isInteger(index) || index < 0 || index >= points.length) return;
        sharedChartIndex = index;
        hoverMarker.setLatLng(points[index].latLng).addTo(map);
        const readout = document.getElementById('compare-readout');
        if (readout) readout.textContent = 'Km ' + distancesKm[index].toFixed(2) + '  ·  Alt. ' + (Number.isFinite(elevations[index]) ? Math.round(elevations[index]) + ' m' : '—') + '  ·  D+ ' + dPlusList[index] + ' m  ·  D− ' + dMoinsList[index] + ' m';
        // Mettre à jour l'autre graphique sans relancer son événement tactile.
        if (source !== 'altitude' && chart) {
            chart.setActiveElements([{ datasetIndex: 0, index }]);
            chart.tooltip?.setActiveElements([{ datasetIndex: 0, index }], { x: chart.chartArea.left, y: chart.chartArea.top });
            chart.update('none');
        }
        if (source !== 'gain' && gainChart) {
            gainChart.setActiveElements([{ datasetIndex: 0, index }, { datasetIndex: 1, index }]);
            gainChart.tooltip?.setActiveElements([{ datasetIndex: 0, index }, { datasetIndex: 1, index }], { x: gainChart.chartArea.left, y: gainChart.chartArea.top });
            gainChart.update('none');
        }
    }
    function clearReliefCursor() {
        // Conserver le dernier point sélectionné pour le retrouver sur la carte.
    }
}

// Géolocalisation ponctuelle : évite de suivre la position en permanence
// et de consommer inutilement la batterie de l’iPhone.
const locateButton = document.getElementById('locate-button');
if (locateButton) {
    locateButton.addEventListener('click', () => {
        if (!navigator.geolocation) {
            afficherErreur('La géolocalisation n’est pas disponible sur cet appareil.');
            return;
        }
        map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true, timeout: 10000 });
    });
}

map.on('locationfound', event => {
    if (window.gpsMarker) map.removeLayer(window.gpsMarker);
    if (window.gpsAccuracy) map.removeLayer(window.gpsAccuracy);
    window.gpsMarker = L.marker(event.latlng).addTo(map).bindPopup('Votre position');
    window.gpsAccuracy = L.circle(event.latlng, { radius: event.accuracy, color: '#0984e3', fillOpacity: 0.08 }).addTo(map);
});
map.on('locationerror', event => afficherErreur('Impossible d’obtenir votre position : ' + event.message));

// Recalcule les statistiques après correction manuelle, sans demander de recharger le fichier.
document.getElementById('distance-override')?.addEventListener('change', () => { if (lastGpxXml) analyserGPX(lastGpxXml); });
