// Offline use. Registers the service worker (../sw.js), which keeps the page, its files and the runtimes, and draws
// the "Make available offline" button (the playground's toolbar and the home page): it downloads both runtimes, even
// when the background download was skipped, asks the browser to keep them (storage.persist), and then shows
// "Works offline" once everything is in the service worker's caches.
// Not registered in automated browsers (the UI tests) unless the URL has ?sw=1.
import { st } from './state.js';
import { status, onStatus, downloadAll, LANGS } from './runtimes.js';

let registered = false, state = 'unknown', pct = 0; // state: unknown | idle | saving | ready | failed
const mounts = new Set();

export function initOffline() {
  if (!('serviceWorker' in navigator) || !('caches' in window)) return;
  if (navigator.webdriver && new URLSearchParams(location.search).get('sw') !== '1') return;
  registered = true;
  navigator.serviceWorker.register('/sw.js').catch(() => { registered = false; state = 'unknown'; draw(); });
  // The background download finishing can complete the offline copy.
  onStatus(() => { if (state === 'idle' && LANGS.every(l => status[l].state === 'ready')) check(); });
}
// Resolves once the service worker controls the page (waiting at most 5 s): files fetched then are kept offline.
export function swControl() {
  if (!registered || navigator.serviceWorker.controller) return Promise.resolve();
  return new Promise(res => { navigator.serviceWorker.addEventListener('controllerchange', res, { once: true }); setTimeout(res, 5000); });
}
// Whether everything is cached: the page, its files, and every runtime file.
export async function offlineReady() {
  if (!registered) return false;
  const R = st.runtimes, urls = [...R.shell, ...LANGS.flatMap(l => R[l].files.map(([f]) => R[l].base + f))];
  for (const u of urls) if (!await caches.match(u, { ignoreSearch: true })) return false;
  return true;
}

// Show the button in el (hidden where there's no service worker). It stays current as downloads finish.
export function mountOffline(el) {
  mounts.add(el);
  if (state === 'unknown' && registered) check(); else draw();
}
async function check() { const ok = await offlineReady(); if (state !== 'saving') state = ok ? 'ready' : 'idle'; draw(); }
const TIP = 'Saves the questions, Python and Gleam in this browser (about 20 MB), so practice and the playground work without a connection';
function draw() {
  for (const el of mounts) {
    if (!el.isConnected) { mounts.delete(el); continue; }
    el.hidden = state === 'unknown'; el.className = 'offl ' + state;
    if (state === 'ready') { el.innerHTML = '<span data-tip="Python, Gleam and the questions are saved in this browser">✓ Works offline</span>'; continue; }
    el.innerHTML = `<button type="button" data-tip="${TIP}"${state === 'saving' ? ' disabled' : ''}>${state === 'saving' ? `Saving for offline… ${pct}%` : state === 'failed' ? 'Couldn’t save for offline. Try again' : 'Make available offline'}</button>`;
    el.querySelector('button').onclick = save;
  }
}
async function save() {
  state = 'saving'; pct = 0; draw();
  try { await navigator.storage?.persist?.(); } catch {} // so the browser doesn't clear it when space runs low
  const total = LANGS.reduce((n, l) => n + status[l].total, 0);
  const off = onStatus(() => { pct = Math.floor(100 * LANGS.reduce((n, l) => n + Math.min(status[l].loaded, status[l].total), 0) / total); draw(); });
  try { await downloadAll(true); state = await offlineReady() ? 'ready' : 'failed'; } catch { state = 'failed'; }
  off(); draw();
}
