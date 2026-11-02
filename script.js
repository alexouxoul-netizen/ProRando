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
let lastTrackPoints = [];

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
legend.addTo(map);

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

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function resetStats() {
    ['dist-total', 'd-plus', 'd-moins'].forEach(id => setText(id, '-'));
    ['m-bleu1', 'm-bleu2', 'm-bleu3', 'm-violet', 'm-vert', 'm-orange', 'm-rouge', 'm-noir']
        .forEach(id => setText(id, '0 m'));
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
            analyserGPX(loadEvent.target.result);
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

    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        if (i > 0) {
            const previous = points[i - 1];
            const segmentDistance = map.distance(previous.latLng, point.latLng);
            distance += segmentDistance;

            // Une pente n’est calculée que si les deux altitudes sont disponibles
            // et si le segment possède une longueur non nulle.
            if (segmentDistance > 0 && previous.elevation !== null && point.elevation !== null) {
                const elevationDifference = point.elevation - previous.elevation;
                const slope = (elevationDifference / segmentDistance) * 100;
                const absoluteSlope = Math.abs(slope);
                if (elevationDifference > 0) {
                    dPlus += elevationDifference;
                    if (absoluteSlope < 10) uphill.easy += segmentDistance;
                    else if (absoluteSlope < 15) uphill.moderate += segmentDistance;
                    else if (absoluteSlope < 25) uphill.hard += segmentDistance;
                    else uphill.extreme += segmentDistance;
                } else if (elevationDifference < 0) {
                    dMoins += Math.abs(elevationDifference);
                    if (absoluteSlope < 10) downhill.easy += segmentDistance;
                    else if (absoluteSlope < 15) downhill.moderate += segmentDistance;
                    else if (absoluteSlope < 25) downhill.hard += segmentDistance;
                    else downhill.extreme += segmentDistance;
                }
                L.polyline([previous.latLng, point.latLng], {
                    color: getPenteColor(slope), weight: 5, opacity: 0.9
                }).addTo(currentLayerGroup).bindPopup('Pente : ' + slope.toFixed(1) + '%');
            } else {
                // Le tracé reste visible même si l’altitude manque.
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

    lastTrackPoints = points;
    map.fitBounds(L.latLngBounds(validLatLngs), { padding: [20, 20] });

    setText('dist-total', (distance / 1000).toFixed(1));
    setText('d-plus', Math.round(dPlus) + ' m');
    setText('d-moins', Math.round(dMoins) + ' m');
    setText('m-vert', Math.round(uphill.easy) + ' m');
    setText('m-orange', Math.round(uphill.moderate) + ' m');
    setText('m-rouge', Math.round(uphill.hard) + ' m');
    setText('m-noir', Math.round(uphill.extreme) + ' m');
    setText('m-bleu1', Math.round(downhill.easy) + ' m');
    setText('m-bleu2', Math.round(downhill.moderate) + ' m');
    setText('m-bleu3', Math.round(downhill.hard) + ' m');
    setText('m-violet', Math.round(downhill.extreme) + ' m');

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
                            return ['D+ cumulé : ' + dPlusList[index] + ' m', 'D- cumulé : ' + dMoinsList[index] + ' m'];
                        }
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Distance (km)' }, ticks: { maxTicksLimit: 8 } },
                y: { title: { display: true, text: 'Altitude (m)' } }
            },
            onHover: (event, activeElements) => {
                if (activeElements.length) {
                    const index = activeElements[0].index;
                    const selectedPoint = points[index];
                    if (selectedPoint) hoverMarker.setLatLng(selectedPoint.latLng).addTo(map);
                } else {
                    hoverMarker.remove();
                }
            }
        }
    });
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
