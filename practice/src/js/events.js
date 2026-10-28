// Usage events: queued in memory and sent in one beacon when the tab is hidden; only on the live site.
// Every event carries `c`, the selected study collection (midterm1 | midterm2 | midterm3 | final); `x` stays the
// source exam id (or pt<minutes> for a timed practice exam). See ../../worker.js for how they are stored.
import { st } from './state.js';

export const EVON = location.hostname == 'practice.benrosar.io';
const SID = Math.random().toString(36).slice(2, 10); let EQ = [];
export function initEvents() {
  if (EVON && !st.S._uid) { st.S._uid = crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36); st.save(); }
  addEventListener('visibilitychange', () => { if (document.visibilityState == 'hidden') flushEv(); }); addEventListener('pagehide', flushEv);
  if (EVON) { const s = document.createElement('script'); s.defer = true; s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.dataset.cfBeacon = JSON.stringify({ token: '99d6c5ac1ddb482bbb2706d1bd61bea6' }); document.head.append(s); }
}
export function ev(n, d) { if (!EVON) return; EQ.push({ n, c: st.cid, ...d }); if (EQ.length >= 25) flushEv(); }
function flushEv() { if (!EQ.length) return; const b = JSON.stringify({ u: st.S._uid, s: SID, e: EQ }); EQ = []; try { navigator.sendBeacon('/e', b); } catch (e) {} }
