// Back and Forward between views. Each view is a history entry with its own URL: an exam, a problem jumped to from
// the sidebar, the home page, timed practice (or a past attempt under review), and each file in the playground, in a
// study collection. So the header's ← → buttons, the browser's own buttons and the keyboard shortcuts all move between
// them, and a reload or a shared link reopens the same view.
//   ?exam=<collection>&x=<exam id>[&p=<problem number>]   ?exam=<collection>&view=home
//   ?exam=<collection>&view=timed[&attempt=<submit time>]  ?exam=<collection>&view=play[&f=<playground file>]
// A link without x or view (?exam=final) opens the collection's last view, as before.
// The renderers call record() whenever they draw a view; it adds an entry when the view differs from the current one
// (or replaces it while the page starts and while Back/Forward redraws). Each entry remembers its scroll position.
import { st } from './state.js';
import { $, SV, isMac } from './util.js';
import { render } from './practice.js';
import { renderPT, showPT } from './timed.js';
import { select } from './selector.js';
import { showPG, leavePG, currentFile } from './playground.js';

const MAX = 'cs61a-practice-nav'; // sessionStorage: the newest entry's index, for the Forward button
let booting = true, restoring = false, problem = null;

function describe() {
  const d = { c: st.cid };
  if (st.pgView) { d.v = 'play'; d.f = currentFile(); }
  else if (st.ptView) { d.v = 'timed'; if (st.ptHist != null) d.a = st.ptHist; }
  else if (st.cur < 0) d.v = 'home';
  else { d.x = st.view.exams[st.cur].id; if (problem?.x === d.x) d.p = problem.p; }
  return d;
}
const same = (a, b) => !!a && !!b && ['c', 'v', 'x', 'p', 'a', 'f'].every(k => a[k] === b[k]);
function url(d) {
  const u = new URL(location.href), s = u.searchParams;
  for (const k of ['exam', 'x', 'p', 'view', 'attempt', 'f']) s.delete(k);
  s.set('exam', d.c);
  if (d.x) s.set('x', d.x); if (d.p) s.set('p', d.p); if (d.v) s.set('view', d.v); if (d.a != null) s.set('attempt', d.a); if (d.f) s.set('f', d.f);
  u.hash = '';
  return u;
}
const entry = () => history.state?.nav;
const maxIndex = () => { try { return +sessionStorage.getItem(MAX) || 0; } catch { return entry()?.i || 0; } };
const setMax = i => { try { sessionStorage.setItem(MAX, i); } catch {} };

// The problem jumped to in exam x (shown in the URL until another exam opens).
export function setProblem(x, problemId) { problem = { x, p: problemId.slice(x.length + 1) }; }

export function record() {
  const d = describe(), cur = entry();
  if (problem && problem.x !== d.x) problem = null;
  if (same(d, cur)) return;
  if (cur && !booting && !restoring) {
    history.replaceState({ nav: { ...cur, y: scrollY } }, ''); // where the view being left was scrolled to
    history.pushState({ nav: { ...d, i: cur.i + 1 } }, '', url(d)); setMax(cur.i + 1);
  } else {
    const i = cur?.i ?? 0; history.replaceState({ nav: { ...d, i, y: cur?.y } }, '', url(d)); if (!cur) setMax(0);
  }
  sync();
}

// Draw the view an entry describes (Back/Forward). A playground entry opens the attempt during a timed exam.
function apply(d) {
  restoring = true;
  try {
    if (d.c !== st.cid && st.views[d.c]) select(d.c);
    if (d.v === 'play') showPG(d.f);
    else {
      leavePG();
      if (d.v === 'timed') { st.ptHist = d.a ?? null; if (st.ptView) renderPT(); else showPT(true); }
      else {
        st.cur = d.v === 'home' ? -1 : st.view.exams.findIndex(ex => ex.id === d.x);
        problem = d.p ? { x: d.x, p: d.p } : null;
        if (st.ptView) showPT(false); else render();
      }
    }
    scrollTo({ top: 0, behavior: 'instant' }); land(d);
  } finally { restoring = false; }
  record();
}
// Scroll to where the entry was left, or else to its problem.
function land(d) {
  if (d.y != null) return scrollTo({ top: d.y, behavior: 'instant' });
  const j = d.p ? st.view.exams[st.cur]?.problems.findIndex(P => P.p.id === `${d.x}/${d.p}`) : -1;
  if (j >= 0) document.getElementById(`p-${st.cur}-${j}`)?.scrollIntoView({ block: 'start', behavior: 'instant' });
}

const back = $('#nvb'), fwd = $('#nvf');
const canGo = dir => { const i = entry()?.i ?? 0; return dir < 0 ? i > 0 : i < maxIndex(); };
const go = dir => dir < 0 ? history.back() : history.forward();
function sync() { back.disabled = !canGo(-1); fwd.disabled = !canGo(1); }

// Before the first render: open the view the URL names (selector.js has already chosen the collection).
// The playground opens after the first render (initPlayground), from st.pgWant.
export function initNav() {
  history.scrollRestoration = 'manual';
  const s = new URLSearchParams(location.search), v = s.get('view'), x = s.get('x');
  if (v === 'timed') { st.S._view = 'pt'; if (+s.get('attempt')) st.ptHist = +s.get('attempt'); } // initTimed opens it
  else if (v === 'home') { st.S._view = ''; st.cur = -1; }
  else if (v === 'play') { st.S._view = ''; st.pgWant = s.get('f') || ''; }
  else if (x) { const i = st.view.exams.findIndex(ex => ex.id === x); if (i >= 0) { st.S._view = ''; st.cur = i; if (s.get('p')) problem = { x, p: s.get('p') }; } }
  const keys = isMac ? ['⌘[', '⌘]'] : ['Alt+←', 'Alt+→'];
  back.innerHTML = SV('<path d="M15 18l-6-6 6-6"/>'); fwd.innerHTML = SV('<path d="M9 18l6-6-6-6"/>');
  back.dataset.tip = `Back (${keys[0]})`; fwd.dataset.tip = `Forward (${keys[1]})`;
  back.setAttribute('aria-keyshortcuts', isMac ? 'Meta+BracketLeft' : 'Alt+ArrowLeft'); fwd.setAttribute('aria-keyshortcuts', isMac ? 'Meta+BracketRight' : 'Alt+ArrowRight');
  back.onclick = () => go(-1); fwd.onclick = () => go(1);
  addEventListener('popstate', e => { const d = e.state?.nav; if (d) apply(d); sync(); });
  addEventListener('keydown', onKey, true);
  let t; addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(() => { const d = entry(); if (d && d.y !== scrollY) history.replaceState({ nav: { ...d, y: scrollY } }, ''); }, 400); }, { passive: true });
}
// After the first views are drawn: from now on, a new view is a new entry. A reload lands where the entry was left.
export function navReady() {
  booting = false; record();
  const d = entry(); if (d && (d.y != null || d.p)) land(d);
  sync();
}

// Mac: ⌘[ and ⌘] anywhere, and ⌘← ⌘→ outside text fields (where they move the cursor). Elsewhere: Alt+← and Alt+→.
// Where there's nowhere to go in this site, the browser does what it normally would.
function onKey(e) {
  if (e.shiftKey || e.ctrlKey) return;
  const bracket = e.code === 'BracketLeft' ? -1 : e.code === 'BracketRight' ? 1 : 0, arrow = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
  const typing = !!e.target.closest?.('input, textarea, select, [contenteditable=""], [contenteditable=true]');
  const dir = isMac ? e.metaKey && !e.altKey && (bracket || (!typing && arrow)) : e.altKey && !e.metaKey && arrow;
  if (!dir || !canGo(dir)) return;
  e.preventDefault(); go(dir);
}
