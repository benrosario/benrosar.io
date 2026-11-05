// Usage events: queued in memory and sent in one beacon when the tab is hidden; only on the live site.
// Every event carries `c`, the selected study collection (midterm1 | midterm2 | midterm3 | final); `x` stays the
// source exam id (or pt<minutes> for a timed practice exam). See ../../worker.js for how they are stored.
import { st } from './state.js';
import { COURSE } from './course.js';

const HOST = globalThis.location?.hostname || ''; // none in Node, where grading.js is tested
const LIVE = HOST === new URL(COURSE.url).hostname;
// ?ev=1 on a local server turns events on, for the UI tests (tests/ui/analytics.test.mjs).
export const EVON = LIVE || (/^(127\.0\.0\.1|localhost)$/.test(HOST) && new URLSearchParams(location.search).has('ev'));
const SID = Math.random().toString(36).slice(2, 10), ONCE = new Set(); let EQ = [];
export function initEvents() {
  if (EVON && !st.S._uid) { st.S._uid = crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36); st.save(); }
  addEventListener('visibilitychange', () => { if (document.visibilityState == 'hidden') flushEv(); }); addEventListener('pagehide', flushEv);
  if (EVON) { wireLinks(); wireErrors(); }
  if (COURSE.id === '61a' && LIVE) { const s = document.createElement('script'); s.defer = true; s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.dataset.cfBeacon = JSON.stringify({ token: '99d6c5ac1ddb482bbb2706d1bd61bea6' }); document.head.append(s); }
}
export function ev(n, d) { if (!EVON) return; EQ.push({ n, c: st.cid, ...d }); if (EQ.length >= 25) flushEv(); }
// At most once per page load, for things that could otherwise repeat on every save or render.
export function evOnce(key, n, d) { if (ONCE.has(key)) return; ONCE.add(key); ev(n, d); }

// The page load: where it came from (the domain only), the kind of device, whether it's installed, the build, and the
// days since this browser's first recorded visit.
export function sessionStart() {
  if (!EVON) return;
  if (!st.S._first) { st.S._first = Date.now(); st.save(); }
  let ref = ''; try { const h = new URL(document.referrer).hostname; if (h !== location.hostname) ref = h; } catch (e) {}
  const v = matchMedia('(pointer: coarse)').matches ? (innerWidth < 768 ? 'phone' : 'tablet') : 'desktop';
  const build = document.querySelector('script[data-content]')?.src.match(/app\.([0-9a-f]+)\.js/)?.[1] || '';
  ev('session_start', { v, src: ref, res: matchMedia('(display-mode: standalone)').matches ? 'installed' : 'browser', x: build, cnt: Math.floor((Date.now() - st.S._first) / 864e5) });
}
// Links that leave the site: the social ones by name, the rest by domain. Middle clicks count too.
function wireLinks() {
  const onClick = e => {
    const a = e.target.closest?.('a[href]'); if (!a || a.hostname === location.hostname || !/^https?:$/.test(a.protocol)) return;
    if (a.closest('.sitesocials')) ev('social_click', { v: a.classList.contains('ig') ? 'instagram' : 'linkedin' });
    else ev('source_open', { x: st.view?.exams[st.cur]?.id || '', src: a.hostname });
  };
  document.addEventListener('click', onClick); document.addEventListener('auxclick', onClick);
}
// Uncaught errors from this site's own scripts: the error's class and file, never its message. Capped so a failing loop can't flood the queue.
function wireErrors() {
  const report = (error, src) => { if (ONCE.size > 20) return;
    const res = /^[A-Za-z]{1,32}$/.test(error?.name || '') ? error.name : 'Unknown';
    evOnce(`err:${res}:${src}`, 'js_error', { res, src }); };
  addEventListener('error', e => { if (!e.filename?.startsWith(location.origin)) return; report(e.error, e.filename.split('/').pop().split('.')[0]); });
  addEventListener('unhandledrejection', e => report(e.reason, 'promise'));
}
function flushEv() { if (!EQ.length) return; const b = JSON.stringify({ u: st.S?._uid, s: SID, e: EQ }); EQ = []; try { navigator.sendBeacon('/e', b); } catch (e) {} }
