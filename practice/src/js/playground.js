// The playground: write and run Python or Gleam in the page's main area (the sidebar is hidden while it's open).
// Files: a scratch file for each language (made again when a language has no file left), playgrounds the student makes and names (mine-…), one for each share link
// opened, and one for each practice problem imported (picker.js; the file id is the problem id); each keeps its own code, stdin, output tab, cursor and scroll position, saved in localStorage['cs61a-playground-v1'] 400 ms after a change and when the page
// is hidden. The Recent menu lists them all. Scratch files and the student's own stay until removed; of the rest, only the 30 most recently used are kept.
// Gleam compiles and runs as you type, like playground.gleam.run; Python runs on Run (⌘↵), or as you type with
// Auto-run. Both use the page's runtimes: the Python worker practice checks use, and a Gleam worker of the
// playground's own that only keeps the newest run.
// During a timed practice exam the playground is locked: its button is hidden, and links to it open the attempt.
import { st } from './state.js';
import { $, esc, SV, confirmBtn, copyText, isMac, reduced } from './util.js';
import { createEditor } from './editor.js';
import { createRunner } from './runner.js';
import { pyJob, pyLoaded, stopPy } from './grading.js';
import { status as rt, onStatus } from './runtimes.js';
import { record, setProblem } from './nav.js';
import { showPT, ptTick } from './timed.js';
import { syncHome, render } from './practice.js';
import { ev } from './events.js';
import { openPicker } from './picker.js';
import { mountOffline } from './offline.js';
import { findProblem, codeFor, findAnyProblem, importCode } from './problems.js';
import { segHTML } from './highlight.js';
import { goTo } from './practice.js';
import { select } from './selector.js';

const KEY = 'cs61a-playground-v1', KEEP = 30, RUN_MS = 10000, NAME = { py: 'Python', gleam: 'Gleam' };
const STARTER = {
  py: `def square(x):
    """Return x squared.

    >>> square(4)
    16
    """
    return x * x


print(square(12))
`,
  gleam: `import gleam/int
import gleam/io

pub fn main() {
  io.println("2 to the 10 is " <> int.to_string(pow(2, 10)))
}

pub fn pow(base: Int, exp: Int) -> Int {
  case exp {
    0 -> 1
    _ -> base * pow(base, exp - 1)
  }
}

pub fn pow_test() {
  assert pow(2, 10) == 1024
}
`,
};
const RUNKEY = isMac ? '⌘↵' : 'Ctrl+Enter';
const scratch = lang => 'scratch-' + lang;
export const locked = () => !!st.S._pt && !st.S._pt.done;

const gl = createRunner(() => new Worker(st.gleam.worker, { type: 'module' }), 'Gleam', { latestWins: true, runMs: RUN_MS });
let P = null, ed = null, el = null, drawn = false, saveT, liveT, stopT, runId = 0, stopped = 0, resetting = false, compiled = {}, warming = null;
const file = () => P.files[P.cur];
export const currentFile = () => P?.cur;

// ---- saved state ----
function load() {
  let s = null; try { s = JSON.parse(localStorage.getItem(KEY)); } catch {}
  P = s?.v === 1 && s.files ? s : { v: 1, cur: scratch('py'), files: { [scratch('py')]: blank('py'), [scratch('gleam')]: blank('gleam') }, auto: false };
  if (!P.files[P.cur]) P.cur = byRecent()[0] ?? latest('py');
}
function save() {
  clearTimeout(saveT); if (!P) return;
  if (ed) Object.assign(file(), ed.state());
  const others = Object.keys(P.files).filter(id => !id.startsWith('scratch-') && !id.startsWith('mine-') && id !== P.cur).sort((a, b) => P.files[b].at - P.files[a].at);
  for (const id of others.slice(KEEP - 1)) delete P.files[id];
  let err = '';
  try { localStorage.setItem(KEY, JSON.stringify(P)); }
  catch (e) { err = e?.name === 'QuotaExceededError' ? 'This browser’s storage is full' : 'This browser isn’t letting the page save'; }
  const n = el?.querySelector('.pgsave'); if (n) { n.hidden = !err; n.textContent = err && `${err}, so the playground isn’t being saved. Copy anything you want to keep.`; }
}
const saveSoon = () => { clearTimeout(saveT); saveT = setTimeout(save, 400); };

// ---- share links: #py=<code> or #gleam=<code>, the code deflated (z) or, without CompressionStream, as is (u) ----
const b64u = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const through = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
async function pack(text) {
  const raw = new TextEncoder().encode(text);
  return typeof CompressionStream == 'function' ? 'z' + b64u(await through(raw, new CompressionStream('deflate-raw'))) : 'u' + b64u(raw);
}
async function unpack(s) {
  const bytes = unb64u(s.slice(1));
  return new TextDecoder().decode(s[0] === 'z' ? await through(bytes, new DecompressionStream('deflate-raw')) : bytes);
}
const shareLink = async f => `${location.origin}${location.pathname}?exam=${st.cid}&view=play#${f.lang}=${await pack(f.code)}`;

// ---- the view ----
const ICON = { run: SV('<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>'), tests: SV('<path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8"/>'),
  spin: SV('<path d="M21 12a9 9 0 1 1-6.2-8.56"/>'), stop: SV('<rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" stroke="none"/>'),
  import: SV('<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>'),
  share: SV('<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>'),
  close: SV('<path d="M6 6l12 12M18 6 6 18"/>'), chev: SV('<path d="m6 9 6 6 6-6"/>'), plus: SV('<path d="M12 5v14M5 12h14"/>'), recent: SV('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>'),
  trash: SV('<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2M10 11v6M14 11v6"/>') };
function renderPG() {
  const m = $('#m'); m.innerHTML = `<section class="pg" aria-label="Playground">
<div class="pgbar">
  <div class="pgrc"><button type="button" data-act="new" aria-haspopup="menu" aria-expanded="false" aria-controls="pgnp" data-tip="Start a new playground">${ICON.plus}<span>New</span></button><div class="pgrp pgnp" id="pgnp" role="menu" aria-label="New playground" hidden><div class="srth">New playground</div><button type="button" role="menuitem" data-new="py"><span class="pglg-tag py">Py</span>Python</button><button type="button" role="menuitem" data-new="gleam"><span class="pglg-tag gleam">Gl</span>Gleam</button></div></div>
  <div class="seg" role="radiogroup" aria-label="Language"><button type="button" role="radio" data-l="py">Python</button><button type="button" role="radio" data-l="gleam">Gleam</button></div>
  <button type="button" data-act="import" data-tip="Import a practice problem (${isMac ? '⌘K' : 'Ctrl+K'})">${ICON.import}<span>Import problem</span></button>
  <div class="pgrc"><button type="button" data-act="recent" aria-haspopup="dialog" aria-expanded="false" aria-controls="pgrp" data-tip="Your playgrounds and imported problems: switch, start a new one, or remove one">${ICON.recent}<span>Recent</span></button><div class="pgrp" id="pgrp" role="dialog" aria-label="Recent playgrounds" hidden></div></div>
  <span class="pgt"></span><input class="pgtn" aria-label="Playground name" maxlength="60" spellcheck="false" autocomplete="off" hidden><span class="pgrt" role="status"></span><span class="offl" hidden></span>
  <span class="pgsp"></span>
  <label class="pgauto" data-tip="Run your Python each time you stop typing"><input type="checkbox"> Auto-run</label>
  <span class="pglive mut">Runs as you type</span>
  <button type="button" class="p" data-act="run" data-tip="Run (${RUNKEY})">${ICON.run}<span>Run</span></button>
  <button type="button" data-act="tests">${ICON.tests}<span></span></button>
  <button type="button" data-act="stop" hidden>${ICON.stop}<span>Stop</span></button>
  <button type="button" data-act="share" data-tip="Copy a link that opens this code in the playground">${ICON.share}<span>Share</span></button>
  <button type="button" data-act="reset">${ICON.trash}<span>Reset</span></button>
</div>
<p class="pgsave note" role="alert" hidden></p>
<div class="pgpw" hidden><section class="pgprob" aria-label="Problem">
  <div class="pgph"><button type="button" class="pgptg" aria-expanded="true" aria-controls="pgpb">${ICON.chev}<span><span class="pgpt"></span> <span class="pgpx mut"></span></span></button>
    <div class="pgpa"><span class="mut">Replace code with</span><div class="seg" role="group" aria-label="Replace code with"><button type="button" data-f="blanks">Blanks</button><button type="button" data-f="mine">My answers</button><button type="button" data-f="solution">Solution</button></div><span class="pgpd" aria-hidden="true"></span><button type="button" class="pgpo">Open in practice</button></div>
    <button type="button" class="pgpc" aria-label="Close problem" data-tip="Close this problem. Your code for it is kept: open it again from Recent.">${ICON.close}</button></div>
  <div class="pgpb" id="pgpb"></div><div class="pgrs" role="separator" aria-orientation="horizontal" aria-label="Resize the problem" tabindex="0" data-tip="Drag to resize · double-click to reset"></div></section></div>
<div class="pgmain">
  <div class="pged"></div>
  <div class="pgcs" role="separator" aria-orientation="vertical" aria-label="Resize the editor and output" tabindex="0" data-tip="Drag to resize · double-click to reset"><div class="pgx" data-tip="Drag to resize the problem, editor and output"></div></div>
  <div class="pgout">
    <div class="pgtabs" role="tablist" aria-label="Output"><button type="button" role="tab" data-t="out">Output</button><button type="button" role="tab" data-t="js"><span class="pglg">Compiled </span>JavaScript</button><button type="button" role="tab" data-t="erl"><span class="pglg">Compiled </span>Erlang</button></div>
    <div class="pgstat"><span class="pgmsg" role="status"></span><button type="button" class="pgundo" hidden>Undo</button></div>
    <pre class="pgo" role="tabpanel" tabindex="0"></pre>
    <details class="pgin"><summary>Input <span class="mut">(stdin, read by input())</span></summary><div class="pgis" role="separator" aria-orientation="horizontal" aria-label="Resize the input" tabindex="0" data-tip="Drag to resize · double-click to reset"></div><textarea spellcheck="false" aria-label="Input for input(), one line per call"></textarea></details>
  </div>
</div>
<p class="pghint mut">Tab indents and Shift+Tab outdents; press Escape, then Tab or Shift+Tab, to leave the editor. ${isMac ? '⌘/' : 'Ctrl+/'} comments lines out.</p>
</section>`;
  el = m.querySelector('.pg');
  ed = createEditor(el.querySelector('.pged'), { lang: 'py', label: 'Code', onChange, onRun: () => run('main', true) });
  el.querySelectorAll('.seg button').forEach(b => b.onclick = () => pick(b.dataset.l));
  el.querySelector('.pgauto input').onchange = e => { P.auto = e.target.checked; saveSoon(); if (P.auto) run('main'); };
  const act = a => el.querySelector(`[data-act=${a}]`);
  act('run').onclick = () => run('main', true);
  act('tests').onclick = () => run('tests', true);
  act('stop').onclick = stop;
  act('share').onclick = share;
  act('import').onclick = pickProblem;
  wireMenus();
  mountOffline(el.querySelector('.offl'));
  const prob = el.querySelector('.pgprob'); drawn = false;
  prob.querySelector('.pgptg').onclick = () => fold(prob, prob.classList.contains('shut'));
  prob.querySelectorAll('[data-f]').forEach(b => b.onclick = () => confirmRefill(b.dataset.f, b));
  prob.querySelector('.pgpo').onclick = () => openInPractice(file().src);
  el.querySelector('.pgpc').onclick = () => { open(latest(file().lang, P.cur)); ed.focus(); };
  confirmBtn(act('reset'), reset, () => file().code === file().orig);
  el.querySelector('.pgundo').onclick = undoReset;
  el.querySelectorAll('.pgtabs button').forEach(b => b.onclick = () => tab(b.dataset.t));
  const stdin = el.querySelector('.pgin textarea');
  stdin.oninput = () => { file().stdin = stdin.value; saveSoon(); if (P.auto) live(800); };
  stdin.onkeydown = e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run('main', true); } };
  wireSizes();
}

// ---- resizing: the editor/output split, the problem's height, the input's height, and the corner that moves the first two at once ----
// Sizes are shared by every file and saved in P.ui: w (the editor's share of the width), ph and ih (problem and input heights in px).
const W0 = 1.15 / 2.15, clamp = (v, lo, hi) => Math.round(Math.max(lo, Math.min(hi, v)));
function sizes() {
  const ui = P.ui ||= {}, w = ui.w ?? W0, main = el.querySelector('.pgmain'), pb = el.querySelector('.pgpb');
  main.style.setProperty('--pgl', w + 'fr'); main.style.setProperty('--pgr', 1 - w + 'fr');
  pb.style.height = ui.ph ? ui.ph + 'px' : ''; pb.style.maxHeight = ui.ph ? 'none' : '';
  el.querySelector('.pgin textarea').style.height = ui.ih ? ui.ih + 'px' : '';
}
// Drag (or arrow keys on) splitter h: start() reads the sizes as the drag begins, move(dx, dy, s) sets new ones; a double-click resets.
function splitter(h, cls, start, move, reset) {
  const set = (dx, dy, s) => { move(dx, dy, s); sizes(); };
  h.onpointerdown = e => {
    if (e.button) return; e.preventDefault(); e.stopPropagation(); h.setPointerCapture(e.pointerId);
    const s = start(), x0 = e.clientX, y0 = e.clientY; h.classList.add('on'); document.body.classList.add('drag', cls);
    h.onpointermove = ev => set(ev.clientX - x0, ev.clientY - y0, s);
    h.onpointerup = h.onpointercancel = () => { h.onpointermove = null; h.classList.remove('on'); document.body.classList.remove('drag', cls); saveSoon(); };
  };
  h.ondblclick = e => { e.stopPropagation(); reset(); sizes(); saveSoon(); };
  if (h.tabIndex >= 0) h.onkeydown = e => { const d = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[e.key]; if (!d) return; e.preventDefault(); set(...d, start()); saveSoon(); };
}
function wireSizes() {
  const q = s => el.querySelector(s), main = q('.pgmain'), pb = q('.pgpb'), ta = q('.pgin textarea');
  // Each side keeps at least 220px, the panes under the problem at least 160px, and the output 60px above the input.
  const col = () => ({ l: q('.pged').offsetWidth, W: main.clientWidth - q('.pgcs').offsetWidth }), row = () => ({ h: pb.offsetHeight, room: main.offsetHeight - Math.max(160, q('.pgout').offsetHeight - q('.pgo').offsetHeight + 60) });
  const moveCol = (dx, s) => { P.ui.w = clamp(s.l + dx, 220, s.W - 220) / s.W; }, moveRow = (dy, s) => { P.ui.ph = clamp(s.h + dy, 48, s.h + s.room); };
  splitter(q('.pgcs'), 'dragc', col, (dx, dy, s) => moveCol(dx, s), () => delete P.ui.w);
  splitter(q('.pgrs'), 'dragr', row, (dx, dy, s) => moveRow(dy, s), () => delete P.ui.ph);
  splitter(q('.pgx'), 'dragm', () => ({ ...col(), ...row() }), (dx, dy, s) => { moveCol(dx, s); moveRow(dy, s); }, () => { delete P.ui.w; delete P.ui.ph; });
  splitter(ta.previousElementSibling, 'dragr', () => ({ h: ta.offsetHeight, room: q('.pgo').offsetHeight - 60 }), (dx, dy, s) => { P.ui.ih = clamp(s.h - dy, 40, s.h + s.room); }, () => delete P.ui.ih);
  sizes();
}

// Show file id in the editor and toolbar.
function open(id) {
  const switched = drawn && id !== P.cur;
  if (ed && P.files[P.cur]) Object.assign(file(), ed.state());
  P.cur = id; const f = file(); f.at = Date.now(); f.tab ||= 'out'; f.mode ||= 'main';
  ed.load(f.code, f.lang); ed.restore(f);
  el.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-checked', b.dataset.l === f.lang));
  el.querySelector('.pgt').textContent = f.title;
  const own = id.startsWith('mine-'), tn = el.querySelector('.pgtn'); el.querySelector('.pgt').hidden = own; tn.hidden = !own; tn.value = f.title; tn.size = Math.max(8, f.title.length + 1);
  el.querySelector('.pgauto').hidden = f.lang !== 'py'; el.querySelector('.pgauto input').checked = !!P.auto;
  el.querySelector('.pglive').hidden = f.lang !== 'gleam';
  el.querySelector('[data-act=tests] span').textContent = f.lang === 'py' ? 'Run doctests' : 'Run tests'; busy(null);
  el.querySelector('[data-act=tests]').dataset.tip = f.lang === 'py' ? 'Run the >>> examples in your docstrings' : 'Run every pub fn whose name ends in _test';
  el.querySelector('.pgtabs').hidden = f.lang !== 'gleam';
  el.querySelector('.pgin').hidden = f.lang !== 'py'; el.querySelector('.pgin textarea').value = f.stdin || ''; if (f.stdin) el.querySelector('.pgin').open = true;
  el.querySelector('.pgundo').hidden = P.prev?.id !== id;
  panel(f);
  compiled = {}; runId++; tab(f.lang === 'gleam' ? f.tab : 'out', false);
  if (f.lang === 'gleam') run(f.mode);
  else { msg(''); out(`<span class="mut">${f.src ? `Press Run doctests to check this code, or Run (${RUNKEY}) to run it.` : `Press Run (${RUNKEY}) to run your code.`}</span>`); warmPy(); }
  rtPaint(); record(); saveSoon();
  if (switched && !reduced()) el.querySelector('.pgmain').animate([{ opacity: .3, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
  drawn = true;
}
// The language buttons open that language's most recently used file.
function pick(lang) {
  if (file().lang === lang) return;
  open(latest(lang)); ed.focus();
}
const byRecent = () => Object.keys(P.files).sort((a, b) => P.files[b].at - P.files[a].at);
const blank = lang => ({ lang, title: 'Scratch', code: STARTER[lang], orig: STARTER[lang], stdin: '', tab: 'out', mode: 'main', at: 0 });
// The language's most recently used file other than skip, or a new scratch file when it has none.
function latest(lang, skip) {
  const id = byRecent().find(k => k !== skip && P.files[k].lang === lang);
  if (id) return id; P.files[scratch(lang)] = blank(lang); return scratch(lang);
}

// ---- the New and Recent menus ----
let pops = [], hideRecent = () => {};
// A small panel p under button b, opened and closed like the sidebar's Sort panel. Escape closes; Up and Down move
// between its items. Returns hide(focus).
function popover(b, p, items, draw) {
  const hide = focus => {
    if (p.hidden) return; p.classList.remove('in'); b.setAttribute('aria-expanded', 'false');
    if (reduced()) p.hidden = true; else setTimeout(() => { if (!p.classList.contains('in')) p.hidden = true; }, 150);
    if (focus) b.focus();
  };
  b.onclick = () => {
    if (!p.hidden && p.classList.contains('in')) return hide();
    draw?.(); p.hidden = false; b.setAttribute('aria-expanded', 'true'); requestAnimationFrame(() => p.classList.add('in'));
    (p.querySelector(items + '[aria-current]') || p.querySelector(items))?.focus();
  };
  p.onkeydown = e => {
    if (e.key === 'Escape') { e.preventDefault(); return hide(true); }
    const bs = [...p.querySelectorAll(items)], i = bs.indexOf(document.activeElement), j = { ArrowDown: i + 1, ArrowUp: i - 1 }[e.key];
    if (j == null || i < 0) return; e.preventDefault(); bs[(j + bs.length) % bs.length].focus();
  };
  p.addEventListener('focusout', () => setTimeout(() => { if (el && !p.hidden && !p.contains(document.activeElement) && document.activeElement !== b) hide(); }, 100));
  pops.push([b.parentNode, hide]); return hide;
}
const ago = t => { const m = Math.round((Date.now() - t) / 6e4);
  return !t ? 'not opened yet' : m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : m < 2880 ? 'yesterday' : new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); };
// What's in a file of the student's own, for the menu: its first few function names.
const names = f => [...f.code.matchAll(f.lang === 'py' ? /^def (\w+)/gm : /^(?:pub )?fn (\w+)/gm)].slice(0, 3).map(m => m[1]).join(', ');
// Recent: every saved file, newest first, each tagged with its language; open one or remove one.
function drawRecent() {
  const row = id => { const f = P.files[id], what = f.src ? f.src.xt : id.startsWith('shared-') ? 'Shared link' : names(f);
    return `<li><button type="button" class="pgro" data-id="${esc(id)}"${id === P.cur ? ' aria-current="true"' : ''}><b><span class="pglg-tag ${f.lang}">${f.lang === 'py' ? 'Py' : 'Gl'}</span>${esc(f.title)}</b><span class="mut">${[NAME[f.lang], what, ago(f.at)].filter(Boolean).map(esc).join(' · ')}</span></button>`
      + `<button type="button" class="pgrx" data-id="${esc(id)}" aria-label="Remove ${esc(NAME[f.lang] + ' ' + f.title)}" data-tip="Remove it and its code from this browser">${ICON.trash}</button></li>`; };
  const p = el.querySelector('.pgrp:not(.pgnp)');
  p.innerHTML = `<div class="srth">Recent playgrounds</div><ul class="pgrls">${byRecent().map(row).join('')}</ul>`
    + `<p class="pgrf mut">Saved in this browser. Your playgrounds stay until you remove them; imported problems and shared links keep the ${KEEP} most recent.</p>`;
  p.querySelectorAll('.pgro').forEach(b => b.onclick = () => { hideRecent(); open(b.dataset.id); ed.focus(); });
  p.querySelectorAll('.pgrx').forEach((b, i) => confirmBtn(b, () => { removeFile(b.dataset.id); p.querySelectorAll('.pgro')[i]?.focus(); }, null, () => 'Remove?'));
}
function wireMenus() {
  pops = [];
  const np = el.querySelector('.pgnp'), hideNew = popover(el.querySelector('[data-act=new]'), np, '[data-new]');
  np.querySelectorAll('[data-new]').forEach(b => b.onclick = () => { hideNew(); newFile(b.dataset.new); });
  hideRecent = popover(el.querySelector('[data-act=recent]'), el.querySelector('.pgrp:not(.pgnp)'), '.pgro', drawRecent);
  // The name of a playground of the student's own, edited in the toolbar.
  const tn = el.querySelector('.pgtn');
  tn.oninput = () => { file().title = tn.value.trim() || 'Untitled'; tn.size = Math.max(8, tn.value.length + 1); saveSoon(); };
  tn.onblur = () => { tn.value = file().title; };
  tn.onkeydown = e => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); ed.focus(); } };
}
// A new playground of the student's own, starting from the language's example; its name is selected to type over.
function newFile(lang) {
  const n = Object.keys(P.files).filter(k => k.startsWith('mine-') && P.files[k].lang === lang).length + 1, id = 'mine-' + Date.now().toString(36);
  P.files[id] = { lang, title: `${NAME[lang]} playground ${n}`, code: STARTER[lang], orig: STARTER[lang], stdin: '', tab: 'out', mode: 'main', at: Date.now() };
  open(id); const tn = el.querySelector('.pgtn'); tn.focus(); tn.select();
}
// Remove a file; removing the open one opens the most recently used file left (a new scratch file if there's none).
function removeFile(id) {
  const lang = P.files[id].lang; delete P.files[id]; if (P.prev?.id === id) P.prev = null;
  if (id === P.cur) open(byRecent()[0] ?? latest(lang)); else save();
  drawRecent();
}
function onChange(code) {
  const f = file(); f.code = code; f.at = Date.now(); saveSoon();
  if (!resetting && P.prev?.id === P.cur) { P.prev = null; el.querySelector('.pgundo').hidden = true; }
  if (f.lang === 'gleam') live(300); else if (P.auto) live(800);
}
function live(ms) { clearTimeout(liveT); liveT = setTimeout(() => run(null), ms); }

function tab(t, rerun = true) {
  const f = file(); f.tab = t; saveSoon();
  el.querySelectorAll('.pgtabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.t === t));
  if (t === 'out') return out(lastOut);
  if (t === 'erl' && compiled.erlang == null && !compiled.erlangErr && rerun) return run(null);
  code();
}
// Compiled code for the JavaScript and Erlang tabs.
function code() {
  const t = file().tab; if (t === 'out') return;
  const text = t === 'js' ? compiled.js : compiled.erlang ?? compiled.erlangErr;
  el.querySelector('.pgo').innerHTML = text ? esc(text) : `<span class="mut">${compiled.compileErr ? 'Your code doesn’t compile yet.' : 'Compiling…'}</span>`;
}
let lastOut = '';
function out(html) { lastOut = html; if (!el || (file().lang === 'gleam' && file().tab !== 'out')) return; el.querySelector('.pgo').innerHTML = html; }
const msg = (text, cls = '') => { const m = el.querySelector('.pgmsg'); m.textContent = text; m.className = 'pgmsg ' + cls; };

// ---- running ----
async function run(mode, user = false) {
  if (!el) return;
  clearTimeout(liveT);
  const f = file(), id = ++runId, lang = f.lang, t0 = performance.now();
  mode = f.mode = mode || f.mode || 'main';
  if (user) { ev('pg_run', { v: lang + (mode === 'tests' ? '-tests' : '') }); busy(el.querySelector(`[data-act=${mode === 'tests' ? 'tests' : 'run'}]`)); }
  const loaded = lang === 'py' ? pyLoaded() : gl.loaded();
  msg(loaded ? 'Running…' : `Starting ${NAME[lang]}…`); rtPaint(lang, !loaded);
  clearTimeout(stopT); stopT = setTimeout(() => { if (id === runId) el.querySelector('[data-act=stop]').hidden = false; }, 500);
  let shown = null;
  const progress = p => {
    if (id !== runId) return;
    if (p.compiled) { compiled = p.compiled; code(); }
    if (p.out) { shown = p.out; out(outputHTML({ out: p.out })); msg('Running…'); }
    rtPaint();
  };
  const r = lang === 'py'
    ? await pyJob({ source: f.code, stdin: f.stdin || '', mode }, progress, { runMs: RUN_MS })
    : await gl({ base: st.gleam.base, source: f.code, mode, erlang: f.tab === 'erl' }, progress);
  if (id !== runId || r.superseded) return;
  busy(null);
  clearTimeout(stopT); el.querySelector('[data-act=stop]').hidden = true; rtPaint();
  const ms = Math.round(performance.now() - t0), result = { ...r, out: r.out || shown || [] };
  if ('js' in r) compiled = { js: r.js, erlang: r.erlang, erlangErr: r.erlangErr };
  if (r.compile) compiled = { compileErr: true };
  out(outputHTML(result, mode)); code();
  const tests = lang === 'py' ? 'doctests' : 'tests', took = ms < 1000 ? ms + ' ms' : (ms / 1000).toFixed(1) + ' s';
  if (stopped === id) msg('Stopped.');
  else if (r.unavailable) msg(r.err, 'no');
  else if (r.compile) msg('Doesn’t compile', 'no');
  else if (/^Timed out/.test(r.err || '')) msg(`Stopped after ${RUN_MS / 1000} seconds`, 'no');
  else if (mode === 'tests') msg(r.ok ? `${tests[0].toUpperCase() + tests.slice(1)} passed` : r.n ? `${r.failed} of ${r.n} ${tests} failed` : `No ${tests} found`, r.ok ? 'ok' : 'no');
  // The time only when the runtime was already running: otherwise it's mostly starting up.
  else msg(r.ok ? (loaded ? `Finished in ${took}` : 'Finished') : 'Stopped with an error', r.ok ? '' : 'no');
}
// The Run or Run tests button pressed (b) gives a small press and spins until the run ends; busy(null) stops it.
function busy(b) {
  el.querySelectorAll('[data-act=run],[data-act=tests]').forEach(x => {
    const on = x === b; if (x.classList.contains('busy') === on) return;
    x.classList.toggle('busy', on); x.querySelector('svg').outerHTML = on ? ICON.spin : ICON[x.dataset.act];
  });
  if (b && !reduced()) b.animate([{ transform: 'scale(.94)' }, { transform: 'none' }], { duration: 200, easing: 'cubic-bezier(.2,.8,.2,1)' });
}
function outputHTML(r, mode) {
  const tests = file().lang === 'py' ? 'doctest' : 'test';
  let h = (r.out || []).map(c => `<span${c.s === 'err' ? ' class="se"' : ''}>${esc(c.t).replace(/^src\/main\.gleam:\d+$/gm, '<span class="mut">$&</span>')}</span>`).join('');
  if (r.warnings?.length) h += r.warnings.map(w => `<span class="pgw">${esc(w)}\n\n</span>`).join('');
  if (mode === 'tests' && r.ok) h += `<span class="pgok">✓ ${r.n === 1 ? `The ${tests} passed` : `All ${r.n} ${tests}s passed`}</span>`;
  else if (mode === 'tests' && !r.n && !r.compile && !r.unavailable) h += `<span class="pge">No ${tests}s found. ${tests === 'doctest' ? 'Add >>> examples to a docstring.' : 'Add a pub fn whose name ends in _test.'}</span>`;
  if (r.err && !r.unavailable) h += `<span class="pge">${esc(r.err)}</span>`;
  return h || '<span class="mut">No output.</span>';
}
// Stopping ends the worker; Python starts again straight away so the next run doesn't wait (Gleam starts on its next run).
function stop() {
  stopped = runId; clearTimeout(liveT);
  if (file().lang === 'py') { stopPy(); warmPy(); } else gl.dispose();
}
function warmPy() { if (!pyLoaded() && !warming) { warming = pyJob({}).finally(() => { warming = null; rtPaint(); }); rtPaint('py', true); } }

// The runtime indicator: downloading, starting, ready.
let starting = {};
function rtPaint(lang, start) {
  if (start != null) starting[lang] = start;
  if (!el) return;
  const l = file().lang, loaded = l === 'py' ? pyLoaded() : gl.loaded(), s = rt[l], e = el.querySelector('.pgrt');
  if (loaded) starting[l] = false;
  e.textContent = loaded ? `${NAME[l]} ready`
    : s?.state === 'downloading' ? `Downloading ${NAME[l]}… ${Math.floor(100 * s.loaded / s.total)}%`
    : starting[l] || warming && l === 'py' ? `Starting ${NAME[l]}…` : '';
  e.className = 'pgrt' + (loaded ? ' on' : '');
}

// ---- reset and share ----
function reset() {
  const f = file(); P.prev = { id: P.cur, code: f.code };
  resetting = true; ed.replace(f.orig); resetting = false;
  el.querySelector('.pgundo').hidden = false; save();
}
function undoReset() {
  if (P.prev?.id !== P.cur) return;
  resetting = true; ed.replace(P.prev.code); resetting = false;
  P.prev = null; el.querySelector('.pgundo').hidden = true; save();
}
async function share() {
  const b = el.querySelector('[data-act=share] span'), f = file();
  const ok = await copyText(await shareLink(f)); ev('pg_share', { v: f.lang });
  b.textContent = ok ? 'Link copied' : 'Couldn’t copy'; setTimeout(() => { b.textContent = 'Share'; }, 2000);
}

// ---- practice problems ----
// Make the file for problem x, its blanks filled with fill ('blanks' | 'mine' | 'solution').
function addProblem(x, fill) {
  const code = codeFor(x, fill);
  P.files[x.p.id] = { lang: x.lang, title: x.p.t, code, orig: code, src: { p: x.p.id, x: x.e.id, xt: x.e.t, fill }, stdin: '', tab: 'out', mode: 'tests', panel: true, at: Date.now() };
  ev('pg_import', { x: x.e.id, q: x.p.id, v: fill });
}
function pickProblem() {
  P.pick ||= { lang: '', all: false, fill: 'mine' };
  openPicker({ prefs: P.pick, save: saveSoon, has: id => !!P.files[id], pick: (x, fill) => { if (!P.files[x.p.id]) addProblem(x, fill); open(x.p.id); ed.focus(); } });
}
// The problem's statement above the editor (its text and questions, without answers), for an imported file.
function panel(f) {
  const wrap = el.querySelector('.pgpw'), box = wrap.querySelector('.pgprob'), x = f.src && findAnyProblem(f.src.p);
  if (!f.src) return showPanel(wrap, false);
  setOpen(box, f.panel !== false);
  el.querySelector('.pgpt').textContent = x?.p.t || f.title; el.querySelector('.pgpx').textContent = f.src.xt;
  box.querySelector('.pgpa').hidden = !x;
  if (!x) box.querySelector('.pgpb').textContent = 'This problem is no longer on the site.';
  else {
    const segs = s => segHTML(s.map(g => g.f ? { ...g, f: undefined } : g));
    box.querySelector('.pgpb').innerHTML = x.p.b.map(b => b.s ? segs(b.s) : `<div class="pgq">${segs(b.l)}</div>`).join('');
    const sol = box.querySelector('[data-f=solution]'); sol.disabled = false;
    sol.dataset.tip = 'Fill the blanks with the official answers';
    box.querySelector('.pgpa .seg').hidden = !!f.combined;
    box.querySelector('.pgpa>.mut').hidden = !!f.combined;
  }
  showPanel(wrap, true);
}
// Show or hide the problem panel. Once the view is drawn it slides in or out (the gap under it too) and the panes
// below follow; a panel already showing fades to its new problem.
function showPanel(wrap, show) {
  const was = !wrap.hidden && wrap.dataset.to !== 'hide'; wrap.anim = null; wrap.getAnimations().forEach(a => a.cancel()); wrap.style.overflow = ''; delete wrap.dataset.to;
  if (!drawn || reduced()) { wrap.hidden = !show; return; }
  if (was === show) { if (show) wrap.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' }); return; }
  wrap.hidden = false; wrap.dataset.to = show ? 'show' : 'hide'; wrap.style.overflow = 'hidden';
  const full = { height: wrap.offsetHeight + 'px', marginBottom: '0px', opacity: 1, transform: 'none' }, shut = { height: '0px', marginBottom: '-10px', opacity: 0, transform: 'translateY(-6px)' };
  const a = wrap.anim = wrap.animate(show ? [shut, full] : [full, shut], { duration: show ? 280 : 200, easing: show ? 'cubic-bezier(.2,.8,.2,1)' : 'ease-in' });
  a.onfinish = () => { if (wrap.anim !== a) return; wrap.style.overflow = ''; delete wrap.dataset.to; if (!show) wrap.hidden = true; };
}
// Open or close the problem's statement (shut hides it); the title row and its buttons always show. content: false
// leaves the statement as it is, for fold to hide once its animation ends.
function setOpen(d, open, content = true) {
  d.querySelector('.pgptg').setAttribute('aria-expanded', open); if (content) d.classList.toggle('shut', !open);
  if (file().panel !== open) { file().panel = open; saveSoon(); }
}
// The same, animating the panel's height (the editor and output take up the difference).
function fold(d, open) {
  if (reduced() || !d.animate) return setOpen(d, open);
  const h0 = d.offsetHeight; d.getAnimations().forEach(a => a.cancel());
  d.classList.remove('shut'); setOpen(d, open, false);
  const h1 = open ? d.offsetHeight : d.offsetHeight - d.clientHeight + d.querySelector('.pgph').offsetHeight;
  d.style.overflow = 'hidden';
  const a = d.anim = d.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: open ? 220 : 180, easing: open ? 'cubic-bezier(.2,.8,.2,1)' : 'ease-in' });
  a.onfinish = () => { if (d.anim !== a) return; d.style.overflow = ''; d.classList.toggle('shut', !open); };
}
let replaceDialog;
function confirmRefill(fill, trigger) {
  const f = file(), id = P.cur, x = f.src && findAnyProblem(f.src.p);
  if (!x || f.combined || locked()) return;
  const label = {solution:'solution', blanks:'blanks', mine:'my answers'}[fill];
  const description = {solution:'the official solution', blanks:'the blank problem template', mine:'your current practice answers'}[fill];
  if (!replaceDialog) {
    replaceDialog = document.createElement('dialog'); replaceDialog.className = 'pgreplace';
    replaceDialog.setAttribute('aria-labelledby','pgreplace-title'); replaceDialog.setAttribute('aria-describedby','pgreplace-description');
    document.body.append(replaceDialog);
  }
  replaceDialog.innerHTML = `<form method="dialog"><h2 id="pgreplace-title">Replace playground code?</h2><p id="pgreplace-description">Are you sure? This will replace all code in “${esc(f.title)}” with ${description} for “${esc(x.p.t)}”.</p><div class="pgreplace-actions"><button type="submit" value="cancel" autofocus>Cancel</button><button type="submit" class="p" value="replace">Replace with ${label}</button></div></form>`;
  replaceDialog.returnValue = '';
  replaceDialog.onclose = () => { if (replaceDialog.returnValue !== 'replace' && trigger.isConnected) trigger.focus(); };
  replaceDialog.querySelector('form').onsubmit = e => {
    e.preventDefault();
    const confirm = e.submitter?.value === 'replace';
    replaceDialog.close(confirm ? 'replace' : 'cancel');
    if (confirm && st.pgView && P.cur === id && file() === f && !locked()) { refill(fill); ed.focus(); }
  };
  replaceDialog.showModal(); replaceDialog.querySelector('[value=cancel]').focus();
}

// Start the file again from the problem, as an edit that Undo (or ⌘Z) takes back.
function refill(fill) {
  const f = file(), x = findAnyProblem(f.src.p); if (!x || f.combined) return;
  P.prev = { id: P.cur, code: f.code };
  f.orig = importCode(x, fill, f.lang); f.src.fill = fill;
  resetting = true; ed.replace(f.orig); resetting = false;
  el.querySelector('.pgundo').hidden = false; save();
}
// Go to the problem in practice: in the study option being studied, or else the first one that has it.
function openInPractice(src) {
  for (const cid of [st.cid, ...st.bank.collections.map(c => c.id)]) {
    const v = st.views[cid], i = v.exams.findIndex(ex => ex.id === src.x), j = i < 0 ? -1 : v.exams[i].problems.findIndex(P => P.p.id === src.p);
    if (j < 0) continue;
    // Draw the exam even when practice was already on it (goTo would only redraw the sidebar), as one history entry.
    leavePG(); if (cid !== st.cid) select(cid);
    setProblem(src.x, src.p); st.cur = i; render();
    return goTo(i, j);
  }
}
// "Open in playground" on a practice problem: its file as it was left, or a new one with the student's answers.
export function openProblem(id) { if (!locked()) showPG(id); }

// ---- entering and leaving ----
const pgb = $('#pgb');
// Open the playground on file id (or the last file used). Locked during a timed practice exam.
export function showPG(id) {
  if (locked()) return showPT(true);
  if (!P) load();
  if (id && !P.files[id]) { const x = findProblem(id); if (x) addProblem(x, 'mine'); } // a link to a problem not in the playground yet
  if (st.ptView) { st.ptView = false; st.ptHist = null; st.S._view = ''; st.save(); document.body.classList.remove('ptm'); }
  const entering = !st.pgView;
  if (entering) {
    st.pgView = true; document.body.classList.add('pgm'); pgb.setAttribute('aria-pressed', 'true'); syncHome();
    renderPG(); scrollTo({ top: 0, behavior: 'instant' }); ev('pg_open', {});
  }
  open(id && P.files[id] ? id : P.cur); ptTick();
  // The view rises in, its toolbar, problem and panes one after another.
  if (entering && !reduced()) [...el.children].filter(n => !n.hidden).forEach((n, i) => n.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: i * 45, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
}
// Close the view (the caller draws the next one). Runs still going are ignored; the workers stay ready.
export function leavePG() {
  if (!st.pgView) return;
  save(); clearTimeout(liveT); runId++;
  st.pgView = false; el = ed = null; document.body.classList.remove('pgm'); pgb.setAttribute('aria-pressed', 'false');
}

// A share link's #py=… or #gleam=…, read as the page loads: the first render rewrites the URL without it.
const SHARED = location.hash.match(/^#(py|gleam)=([zu][A-Za-z0-9_-]*)$/);

// At startup, after the first render: a share link becomes a new file, and the playground opens if the URL asks for
// it (nav.js sets st.pgWant) or a share link was opened.
export async function initPlayground() {
  load();
  pgb.innerHTML = SV('<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>') + '<span>Playground</span>';
  pgb.dataset.tip = 'Playground: write and run Python or Gleam';
  pgb.onclick = () => { if (!st.pgView) return showPG(); leavePG(); render(); scrollTo({ top: 0, behavior: 'instant' }); };
  const h = SHARED;
  if (h) {
    try {
      const code = await unpack(h[2]), id = 'shared-' + Date.now().toString(36);
      P.files[id] = { lang: h[1], title: 'Shared code', code, orig: code, stdin: '', tab: 'out', mode: 'main', at: Date.now() };
      P.cur = id; st.pgWant = id; save();
    } catch { st.pgWant ??= ''; }
  }
  // ⌘K / Ctrl+K: import a problem, from anywhere (opening the playground first). Not during a practice exam.
  addEventListener('keydown', e => {
    if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey || e.key.toLowerCase() !== 'k' || locked() || document.querySelector('dialog[open]')) return;
    e.preventDefault(); if (!st.pgView) showPG(); pickProblem();
  });
  document.addEventListener('mousedown', e => { if (el) for (const [box, hide] of pops) if (!box.contains(e.target)) hide(); });
  addEventListener('pagehide', save); addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
  onStatus(() => rtPaint());
  if (st.pgWant != null) showPG(st.pgWant || undefined);
}

// Destinations for Add to playground. Only matching languages can share executable code.
export function playgroundDestinations(id) {
  if (!P) load(); const x = findAnyProblem(id); if (!x) return [];
  return byRecent().filter(id => !(x.p.run || x.hasCode) || P.files[id].lang === x.lang).map(id => ({id, title:P.files[id].title, lang:P.files[id].lang}));
}
export function addToPlayground(id, destination, fill = 'mine') {
  if (locked()) return showPT(true);
  if (!P) load(); const x = findAnyProblem(id); if (!x) return;
  const target = destination && P.files[destination];
  if (destination && (!target || (x.p.run || x.hasCode) && target.lang !== x.lang)) return;
  const lang = target?.lang || x.lang, code = importCode(x, fill, lang);
  const src = {p:x.p.id,x:x.e.id,xt:x.e.t,fill};
  let next = destination;
  if (target) {
    P.prev = {id:destination,code:target.code};
    const prefix = lang === 'gleam' ? '// ' : '# ';
    let joined = target.code.trimEnd() + '\n\n' + prefix + x.e.t + ' · ' + x.p.t + '\n' + code;
    if (lang === 'gleam') {
      const imports = [...new Set(joined.match(/^import [^\n]+/gm) || [])];
      joined = imports.join('\n') + '\n\n' + joined.replace(/^import [^\n]+\n?/gm, '');
    }
    Object.assign(target,{code:joined,orig:joined,src,combined:true,at:Date.now()});
  } else {
    next = 'mine-' + crypto.randomUUID();
    P.files[next] = {lang,title:x.p.t,code,orig:code,src,stdin:'',tab:'out',mode:x.p.run?'tests':'main',panel:true,at:Date.now()};
  }
  save(); showPG(next); save(); ed.focus();
  ev('pg_import',{x:x.e.id,q:x.p.id,v:fill});
}
