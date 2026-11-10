/* V11 atomic app shell: fixed release assets, no cache of auth or cloud data. */
const CACHE='randovista-v111-verdict-coherence-test-5';
const ASSETS=["./verdict-rules.js", "./gpx-engine.js", "./advisor-v105.js", "./", "./index.html", "./journal-v944.js", "./adaptive-v944.js", "./verdict-v75.js", "./radar-v73.js", "./compare-v102.js", "./library-v8.js", "./cloud-config.js", "./storage-v11.js", "./dashboard-v100.js", "./icon-512.png", "./v9.js", "./profiles-v81.js", "./sync-v11.js", "./icon.png", "./ui-v7.js", "./compare-gpx-v104.js", "./manifest.json", "./recap-v103.js", "./boot-v11.js", "./script.js", "./climbs-v74.js", "./sync-core-v11.js", "./style.css", "./polish-v97.js", "./leaflet.js", "./supabase.js", "./leaflet.css", "./chart.umd.js", "./rv-layers-2x.png", "./rv-marker-icon-2x.png", "./rv-marker-icon.png", "./rv-marker-shadow.png", "./rv-layers.png"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const r=event.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin)return;
 const paths=new Set(ASSETS.map(a=>new URL(a,self.registration.scope).pathname));
 if(!paths.has(u.pathname)&&r.mode!=='navigate')return;
 event.respondWith(caches.open(CACHE).then(async c=>{
  const hit=await c.match(r,{ignoreSearch:true});if(hit)return hit;
  if(r.mode==='navigate')return (await c.match('./index.html'))||fetch(r);
  return fetch(r);
 }));
});

self.addEventListener('install',event => { self.skipWaiting(); });
self.addEventListener('activate',event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('randovista-') && k !== CACHE).map(k => caches.delete(k))))); });
