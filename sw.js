/* V11 atomic app shell: fixed release assets, no cache of auth or cloud data. */
const CACHE='randovista-v11-test-4';
const ASSETS=["./advisor-v105.js", "./", "./index.html", "./journal-v944.js", "./adaptive-v944.js", "./verdict-v75.js", "./radar-v73.js", "./compare-v102.js", "./library-v8.js", "./cloud-config.js", "./storage-v11.js", "./dashboard-v100.js", "./icon-512.png", "./v9.js", "./profiles-v81.js", "./sync-v11.js", "./icon.png", "./ui-v7.js", "./compare-gpx-v104.js", "./manifest.json", "./recap-v103.js", "./boot-v11.js", "./script.js", "./climbs-v74.js", "./sync-core-v11.js", "./style.css", "./polish-v97.js", "./vendor/leaflet.js", "./vendor/supabase.js", "./vendor/leaflet.css", "./vendor/chart.umd.js", "./vendor/images/layers-2x.png", "./vendor/images/marker-icon-2x.png", "./vendor/images/marker-icon.png", "./vendor/images/marker-shadow.png", "./vendor/images/layers.png"];
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
