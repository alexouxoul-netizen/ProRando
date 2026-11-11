/* V11 atomic app shell: fixed release assets, no cache of auth or cloud data. */
const CACHE='randovista-v112-library-test-20261111-final';
const ASSETS=["./smart-library.js", "./offline-v11.js", "./verdict-rules.js", "./gpx-engine.js", "./advisor-v105.js", "./", "./index.html", "./journal-v944.js", "./adaptive-v944.js", "./verdict-v75.js", "./radar-v73.js", "./compare-v102.js", "./library-v8.js", "./cloud-config.js", "./storage-v11.js", "./dashboard-v100.js", "./icon-512.png", "./v9.js", "./profiles-v81.js", "./sync-v11.js", "./icon.png", "./ui-v7.js", "./compare-gpx-v104.js", "./manifest.json", "./recap-v103.js", "./boot-v11.js", "./script.js", "./climbs-v74.js", "./sync-core-v11.js", "./style.css", "./polish-v97.js", "./leaflet.js", "./supabase.js", "./leaflet.css", "./chart.umd.js", "./rv-layers-2x.png", "./rv-marker-icon-2x.png", "./rv-marker-icon.png", "./rv-marker-shadow.png", "./rv-layers.png"];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);await cache.addAll(ASSETS);await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('randovista-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();
})()));
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

self.addEventListener('message',event=>{
 if(!['RV_OFFLINE_STATUS','RV_OFFLINE_REFRESH'].includes(event.data?.type)||!event.ports[0])return;
 event.waitUntil((async()=>{
  try{
   const cache=await caches.open(CACHE);if(event.data.type==='RV_OFFLINE_REFRESH')await cache.addAll(ASSETS);
   const checks=await Promise.all(ASSETS.map(async asset=>({asset,present:!!await cache.match(asset)})));
   const missing=checks.filter(item=>!item.present).map(item=>item.asset);
   event.ports[0].postMessage({cache:CACHE,ready:missing.length===0,missing});
  }catch(error){event.ports[0].postMessage({error:error.message||'Préparation du cache impossible'});}
 })());
});
