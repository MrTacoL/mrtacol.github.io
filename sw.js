// Offline support: keeps the site and arcade working without internet after the first visit.
// Pages/scripts are network-first (so updates show up right away) with the cache as fallback.
// Songs and the video are left to the network; they stream with range requests.
const CACHE = 'mrtacosi-v1';
const CORE = [
  './', './index.html', './arcade.html', './arcade.js',
  './games/action-1.js', './games/action-2.js', './games/puzzle.js', './games/board-quick.js',
  './styles.css', './music-hover.css', './site-extras.css', './tool-dock-fix.css', './draw-mobile-fix.css',
  './config.js', './edge-video-fix.js', './script.js', './music-hover.js', './site-widgets.js', './contact-links.js',
  './site-extras.js', './tool-dock-fix.js', './utterances-guestbook.js', './remove-mood-card.js', './draw-focus.js',
  './music-playlist.js', './music-player.js', './assets/icons/favicon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || /\.(mp3|mp4)$/i.test(url.pathname)) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
