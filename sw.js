const C='poketracker-v5';
const A=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(a=>Promise.all(a.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method==='GET'&&new URL(e.request.url).origin===location.origin){
  const path=new URL(e.request.url).pathname;
  if(path.endsWith('/app.js')||path.endsWith('/index.html')||path.endsWith('/sw.js')){
   e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(C).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));
  }else e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
 }
});
