const CACHE='fitness-manager-shell-v63';
const SHELL=['./version.json','./index.html','./install-check.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('fitness-manager-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   try{
    const response=await fetch(event.request);
    if(response.ok&&response.type==='basic'){
     const scope=new URL(self.registration.scope);
     const isApp=url.pathname===scope.pathname||url.pathname===new URL('./index.html',scope).pathname;
     await cache.put(isApp?'./index.html':event.request,response.clone());
    }
    return response;
   }catch{
    return await cache.match(event.request)||await cache.match('./index.html');
   }
  })());
  return;
 }
 // Update checks must reach the server, including requests without a query string.
 if(url.pathname===new URL('./version.json',self.registration.scope).pathname){
  event.respondWith(fetch(event.request,{cache:'no-store'}));return;
 }
 event.respondWith(caches.open(CACHE).then(async cache=>await cache.match(event.request)||fetch(event.request)));
});
