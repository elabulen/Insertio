/* InsertiO – fonctionnement hors connexion. Ne met en cache que l'application, jamais les dossiers des jeunes. */
const V = "insertio-5.1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "logo.png", "icon-192.png", "icon-512.png", "icon-maskable.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    // réseau d'abord (pour recevoir les mises à jour), cache si hors connexion
    e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; })
      .catch(() => caches.match(r).then(m => m || (r.mode === "navigate" ? caches.match("index.html") : undefined))));
  } else if (/cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.host)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; })));
  }
});
