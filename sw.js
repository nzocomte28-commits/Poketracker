const CACHE='poketracker-v44';
const FILES=['./','./index.html','./styles.css','./styles-v23.css','./styles-pixel.css','./app.js','./config.js','./manifest.webmanifest','./icon.svg','./icon-180.png','./assets/pixel-mascot.png','./assets/pixel-canopy.png','./assets/tile-collection.webp','./assets/tile-pokedex.webp','./assets/tile-series.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('poketracker-')&&x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method==='GET'&&new URL(e.request.url).origin===location.origin)e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request)))});
