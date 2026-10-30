// Background download of the Python and Gleam runtimes (about 15 MB and 5 MB), so the first run or check doesn't
// wait for them. Once the page has loaded and the browser is idle, each runtime's files are fetched one at a time at
// low priority. With the service worker in control (offline.js), that stores them for offline use; otherwise they
// land in the browser's cache, where the workers later find them. Skipped when the visitor has asked to save data or
// is on a 2G connection (the runtimes then load on first use, as before), and in automated browsers such as the UI
// tests, unless the URL has ?prefetch=1. "Make available offline" downloads them anyway (downloadAll).
// The build lists each runtime's files and sizes in <script type="application/json" id="runtimes">:
// {py: {base, files: [[name, bytes], …]}, gleam: {…}, shell: [the page's own files]}.
import { st } from './state.js';
import { swControl } from './offline.js';

export const LANGS = ['py', 'gleam'];
const subs = new Set(), jobs = {};
// status[lang]: {state: 'waiting' | 'downloading' | 'ready' | 'skipped' | 'failed', loaded, total} (bytes)
export const status = {};
export const onStatus = fn => { subs.add(fn); return () => subs.delete(fn); };
let last = 0;
function set(lang, change, force = true) {
  Object.assign(status[lang], change);
  if (!force && Date.now() - last < 100) return; // progress: at most every 100 ms
  last = Date.now(); subs.forEach(fn => fn(lang, status[lang]));
}

function skipReason() {
  if (new URLSearchParams(location.search).get('prefetch') === '1') return '';
  const c = navigator.connection;
  if (c?.saveData) return 'saveData';
  if (/2g/.test(c?.effectiveType || '')) return 'slow';
  if (navigator.webdriver) return 'automated';
  return '';
}

async function download(lang) {
  await swControl(); // so the files go through the service worker into its cache
  const m = st.runtimes[lang], s = status[lang];
  set(lang, { state: 'downloading', loaded: 0 });
  for (const [f, size] of m.files) {
    const res = await fetch(m.base + f, { priority: 'low' });
    if (!res.ok) throw new Error(`${f}: HTTP ${res.status}`);
    // Read the whole body: that's what stores it. Sizes are uncompressed, as the body is.
    const reader = res.body.getReader(), start = s.loaded;
    for (let r; !(r = await reader.read()).done;) set(lang, { loaded: s.loaded + r.value.length }, false);
    s.loaded = start + size;
  }
  set(lang, { state: 'ready', loaded: s.total });
}
// One download per runtime at a time, shared by the background download and downloadAll; a failed one can be retried.
function get(lang) {
  if (status[lang].state === 'ready') return Promise.resolve();
  return jobs[lang] ||= download(lang).catch(e => { set(lang, { state: 'failed', err: String(e.message || e) }); throw e; }).finally(() => { jobs[lang] = null; });
}
// Every runtime, one after the other, whether or not the background download was skipped. Rejects if one fails.
// again: fetch runtimes already downloaded too, for files that reached the browser's cache before the service worker
// was in control (its own cache answers at once for those it has).
export async function downloadAll(again) {
  for (const lang of LANGS) { if (again && status[lang].state === 'ready') status[lang].state = 'waiting'; await get(lang); }
}

// Call fn once lang's files are in the cache; never if the download was skipped or failed (they'd be fetched now).
export function whenDownloaded(lang, fn) {
  const s = status[lang]?.state;
  if (s === 'ready') return fn();
  if (s !== 'waiting' && s !== 'downloading') return;
  const off = onStatus((l, x) => { if (l !== lang || x.state === 'downloading') return; off(); if (x.state === 'ready') fn(); });
}

// Called once at startup; the download waits until the browser is idle.
export function prefetchRuntimes() {
  const why = skipReason();
  for (const lang of LANGS) {
    const total = st.runtimes[lang].files.reduce((n, [, b]) => n + b, 0);
    status[lang] = { state: why ? 'skipped' : 'waiting', why, loaded: 0, total };
  }
  if (why) return;
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 2000));
  idle(async () => { for (const lang of LANGS) await get(lang).catch(() => {}); }, { timeout: 5000 });
}
