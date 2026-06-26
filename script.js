var map = L.map('map', {center: [46.6, 2.4], zoom: 6});
var currentLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
var currentLayerGroup = L.layerGroup().addTo(map);
var hoverMarker = L.marker([0, 0], {interactive: false, opacity: 0}).addTo(map); // Le curseur de synchro
var chart = null;

function changeLayer() {
    var val = document.getElementById('layer-select').value;
    map.removeLayer(currentLayer);
    currentLayer = (val === 'topo') ? L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png') : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    currentLayer.addTo(map);
}

var legend = L.control({position: 'bottomleft'});
legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML = '<b>Montée (+)</b><br><i style="background:#55A630"></i> <10% <i style="background:#FF9F43"></i> 10-15% <i style="background:#EE5253"></i> 15-25% <i style="background:#000000"></i> >25%<br>' +
                    '<b>Descente (-)</b><br><i style="background:#ffafcc"></i> <10% <i style="background:#00cec9"></i> 10-15% <i style="background:#0984e3"></i> 15-25% <i style="background:#0605552d"></i> >25%';
    return div;
};
legend.addTo(map);

function getPenteColor(pente) {
    if (pente > 0) {
        if (pente < 10) return "#55A630"; if (pente < 15) return "#FF9F43"; if (pente < 25) return "#EE5253"; return "#000000";
    } else {
        let p = Math.abs(pente);
        if (p < 10) return "#ffafcc"; if (p < 15) return "#00cec9"; if (p < 25) return "#0984e3"; return "#0605552d";
    }
}

document.getElementById('gpx-file').addEventListener('change', function(e) {
    var reader = new FileReader();
    reader.onload = function(evt) { analyserGPX(evt.target.result); };
    reader.readAsText(e.target.files[0]);
});

function analyserGPX(xmlString) {
    currentLayerGroup.clearLayers();
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlString, "text/xml");
    var trkpts = xmlDoc.getElementsByTagName("trkpt");
    
    let dist = 0, dPlus = 0, dMoins = 0;
    let points = [], dists = [], eles = [], dPlusList = [], dMoinsList = [];
    let m = { v:0, o:0, r:0, n:0, b1:0, b2:0, b3:0, vi:0 };

    for (let i = 0; i < trkpts.length; i++) {
        let lat = parseFloat(trkpts[i].getAttribute("lat"));
        let lon = parseFloat(trkpts[i].getAttribute("lon"));
        let ele = parseFloat(trkpts[i].getElementsByTagName("ele")[0].textContent);
        
        if (i > 0) {
            let d = map.distance(points[i-1], [lat, lon]);
            dist += d;
            let diff = ele - eles[i-1];
            let pente = (diff / d) * 100;
            if (diff > 0) {
                dPlus += diff;
                if (pente < 10) m.v += d; else if (pente < 15) m.o += d; else if (pente < 25) m.r += d; else m.n += d;
            } else {
                dMoins += Math.abs(diff);
                let ap = Math.abs(pente);
                if (ap < 10) m.b1 += d; else if (ap < 15) m.b2 += d; else if (ap < 25) m.b3 += d; else m.vi += d;
            }
            L.polyline([points[i-1], [lat, lon]], {color: getPenteColor(pente), weight: 5})
             .addTo(currentLayerGroup)
             .bindPopup("Pente : " + pente.toFixed(1) + "%");
        }
        points.push([lat, lon]); eles.push(ele);
        dists.push((dist/1000).toFixed(2));
        dPlusList.push(Math.round(dPlus));
        dMoinsList.push(Math.round(dMoins));
    }
    
    map.fitBounds(L.polyline(points).getBounds());
    
    // Stats & Waypoints
    document.getElementById('m-bleu1').innerText = Math.round(m.b1);
    document.getElementById('m-bleu2').innerText = Math.round(m.b2);
    document.getElementById('m-bleu3').innerText = Math.round(m.b3);
    document.getElementById('m-violet').innerText = Math.round(m.vi);
    document.getElementById('dist-total').innerText = (dist/1000).toFixed(1);
    document.getElementById('d-plus').innerText = Math.round(dPlus);
    document.getElementById('d-moins').innerText = Math.round(dMoins);
    document.getElementById('m-vert').innerText = Math.round(m.v);
    document.getElementById('m-orange').innerText = Math.round(m.o);
    document.getElementById('m-rouge').innerText = Math.round(m.r);
    document.getElementById('m-noir').innerText = Math.round(m.n);
    // ... (rajoute les autres m- si besoin)

    var wpts = xmlDoc.getElementsByTagName("wpt");
    for (let wp of wpts) {
        L.marker([wp.getAttribute("lat"), wp.getAttribute("lon")]).addTo(currentLayerGroup).bindPopup(wp.getElementsByTagName("name")[0].textContent);
    }

    if (chart) chart.destroy();
    chart = new Chart(document.getElementById('elevationChart'), {
        type: 'line',
        data: { labels: dists, datasets: [{ label: 'Altitude (m)', data: eles, borderColor: '#0984e3', fill: true, pointRadius: 0 }] },
        options: { 
            responsive: true, maintainAspectRatio: false, 
            plugins: { 
                tooltip: { 
                    mode: 'index', intersect: false, 
                    external: function(ctx) {
                        let idx = ctx.tooltip.dataPoints ? ctx.tooltip.dataPoints[0].dataIndex : null;
                        if (idx !== null) { hoverMarker.setLatLng(points[idx]).setOpacity(1); } else { hoverMarker.setOpacity(0); }
                    },
                    callbacks: { label: function(c) { return ['Alt: ' + Math.round(c.raw) + 'm', 'D+: ' + dPlusList[c.dataIndex] + 'm', 'D-: ' + dMoinsList[c.dataIndex] + 'm']; } } 
                } 
            } 
        }
    });
}
const cacheName = 'pro-rando-v3';
const assets = ['index.html', 'style.css', 'script.js', 'icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(assets)));
});

self.addEventListener('fetch', (e) => {
  // Si c'est une requête vers OpenStreetMap, on essaie le cache d'abord
  if (e.request.url.includes('tile.openstreetmap.org')) {
    e.respondWith(
      caches.match(e.request).then((res) => {
        return res || fetch(e.request).then((networkResponse) => {
          // On clone la réponse pour la mettre en cache
          const clone = networkResponse.clone();
          caches.open(cacheName).then((cache) => cache.put(e.request, clone));
          return networkResponse;
        });
      })
    );
  } else {
    // Sinon comportement normal
    e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
  }
});
// Ajout du suivi GPS
var markerGPS = L.marker([0, 0]).addTo(map); // Marqueur invisible au début
var circleGPS = L.circle([0, 0], {radius: 0}).addTo(map); // Cercle de précision

function onLocationFound(e) {
    var radius = e.accuracy;
    markerGPS.setLatLng(e.latlng);
    circleGPS.setLatLng(e.latlng).setRadius(radius);
    // Optionnel : recentrer la carte sur toi
    // map.setView(e.latlng, 15);
}

function onLocationError(e) {
    alert("Impossible d'obtenir ta position : " + e.message);
}

// Lancer la géolocalisation en mode suivi continu
map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
map.locate({setView: false, watch: true, enableHighAccuracy: true});
