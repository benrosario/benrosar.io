// Service worker that lets the practice site, with its Python and Gleam, work offline (registered by js/offline.js).
// The build replaces MANIFEST: {version, shell: [the page and its hashed files], runtimes: [each runtime's directory]}.
//   The page ("/", whatever its query):  from the network when it answers within 3 seconds (and then cached), so a
//                                        deploy shows up as soon as there's a connection; otherwise the cached copy.
//   The page's files (assets/*.js …):    cached when this version installs. Their names change with their contents.
//   Python and Gleam (assets/pyodide/<version>/, assets/gleam/<version>/): cached the first time each file is fetched
//                                        (the background download fetches them all), until a deploy stops using them.
//   Anything else (POST /e and /f, other sites): left to the browser.
const MANIFEST = /*MANIFEST*/ null;
const SHELL = 'shell-' + MANIFEST.version, RUNTIME = base => 'runtime-' + base;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(MANIFEST.shell)).then(() => self.skipWaiting()));
});
// Drop what the previous version cached that this one doesn't use, and take over open pages straight away.
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keep = new Set([SHELL, ...MANIFEST.runtimes.map(RUNTIME)]);
    for (const name of await caches.keys()) if (!keep.has(name)) await caches.delete(name);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.mode === 'navigate') return e.respondWith(page(req));
  const base = MANIFEST.runtimes.find(b => url.pathname.startsWith(b));
  if (base) return e.respondWith(cached(RUNTIME(base), req));
  if (MANIFEST.shell.includes(url.pathname)) return e.respondWith(cached(SHELL, req));
});

async function cached(name, req) {
  const cache = await caches.open(name), hit = await cache.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.status === 200) await cache.put(req, res.clone()).catch(() => {}); // a full cache only means no offline copy
  return res;
}
async function page(req) {
  const cache = await caches.open(SHELL);
  const net = fetch(req).then(res => { if (res.status === 200 && !res.redirected) cache.put('/', res.clone()).catch(() => {}); return res; });
  try { return await Promise.race([net, new Promise((_, no) => setTimeout(no, 3000))]); }
  catch { return (await cache.match('/')) || net; }
}
