// The playground: write and run Python or Gleam in the page's main area (the sidebar is hidden while it's open).
// Files: a scratch file for each language, one for each share link opened, and one for each practice problem imported
// (picker.js; the file id is the problem id); each keeps its own code, stdin, output tab, cursor and scroll position, saved in localStorage['cs61a-playground-v1'] 400 ms after a change and when the page
// is hidden. Only the 30 most recently used files besides the scratch files are kept.
// Gleam compiles and runs as you type, like playground.gleam.run; Python runs on Run (⌘↵), or as you type with
// Auto-run. Both use the page's runtimes: the Python worker practice checks use, and a Gleam worker of the
// playground's own that only keeps the newest run.
// During a timed practice exam the playground is locked: its button is hidden, and links to it open the attempt.
import { st } from './state.js';
import { $, esc, SV, confirmBtn, copyText, isMac } from './util.js';
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
import { findProblem, codeFor, canSolve } from './problems.js';
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
let P = null, ed = null, el = null, saveT, liveT, stopT, runId = 0, stopped = 0, resetting = false, compiled = {}, warming = null;
const file = () => P.files[P.cur];
export const currentFile = () => P?.cur;

// ---- saved state ----
function load() {
  let s = null; try { s = JSON.parse(localStorage.getItem(KEY)); } catch {}
  P = s?.v === 1 && s.files ? s : { v: 1, cur: scratch('py'), files: {}, auto: false };
  for (const lang of ['py', 'gleam']) P.files[scratch(lang)] ||= { lang, title: 'Scratch', code: STARTER[lang], orig: STARTER[lang], stdin: '', tab: 'out', mode: 'main', at: 0 };
  if (!P.files[P.cur]) P.cur = scratch('py');
}
function save() {
  clearTimeout(saveT); if (!P) return;
  if (ed) Object.assign(file(), ed.state());
  const others = Object.keys(P.files).filter(id => !id.startsWith('scratch-') && id !== P.cur).sort((a, b) => P.files[b].at - P.files[a].at);
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
const ICON = { run: SV('<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>'), stop: SV('<rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" stroke="none"/>'),
  import: SV('<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>'),
  share: SV('<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>') };
function renderPG() {
  const m = $('#m'); m.innerHTML = `<section class="pg" aria-label="Playground">
<div class="pgbar">
  <div class="seg" role="radiogroup" aria-label="Language"><button type="button" role="radio" data-l="py">Python</button><button type="button" role="radio" data-l="gleam">Gleam</button></div>
  <button type="button" data-act="import" data-tip="Import a practice problem (${isMac ? '⌘K' : 'Ctrl+K'})">${ICON.import}<span>Import problem</span></button>
  <span class="pgt"></span><span class="pgrt" role="status"></span><span class="offl" hidden></span>
  <span class="pgsp"></span>
  <label class="pgauto" data-tip="Run your Python each time you stop typing"><input type="checkbox"> Auto-run</label>
  <span class="pglive mut">Runs as you type</span>
  <button type="button" class="p" data-act="run" data-tip="Run (${RUNKEY})">${ICON.run}<span>Run</span></button>
  <button type="button" data-act="tests"></button>
  <button type="button" data-act="stop" hidden>${ICON.stop}<span>Stop</span></button>
  <button type="button" data-act="share" data-tip="Copy a link that opens this code in the playground">${ICON.share}<span>Share</span></button>
  <button type="button" data-act="reset">Reset</button>
</div>
<p class="pgsave note" role="alert" hidden></p>
<details class="pgprob" hidden><summary><span class="pgpt"></span> <span class="pgpx mut"></span></summary>
  <div class="pgpa"><span class="mut">Start again with</span><button type="button" data-f="blanks">Blanks</button><button type="button" data-f="mine">My answers</button><button type="button" data-f="solution">Solution</button><span class="pgsp"></span><button type="button" class="pgpo">Open in practice</button></div>
  <div class="pgpb"></div></details>
<div class="pgmain">
  <div class="pged"></div>
  <div class="pgout">
    <div class="pgtabs" role="tablist" aria-label="Output"><button type="button" role="tab" data-t="out">Output</button><button type="button" role="tab" data-t="js"><span class="pglg">Compiled </span>JavaScript</button><button type="button" role="tab" data-t="erl"><span class="pglg">Compiled </span>Erlang</button></div>
    <div class="pgstat"><span class="pgmsg" role="status"></span><button type="button" class="pgundo" hidden>Undo</button></div>
    <pre class="pgo" role="tabpanel" tabindex="0"></pre>
    <details class="pgin"><summary>Input <span class="mut">(stdin, read by input())</span></summary><textarea spellcheck="false" aria-label="Input for input(), one line per call"></textarea></details>
  </div>
</div>
<p class="pghint mut">Tab indents and Shift+Tab outdents; press Escape, then Tab, to leave the editor. ${isMac ? '⌘/' : 'Ctrl+/'} comments lines out.</p>
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
  mountOffline(el.querySelector('.offl'));
  const prob = el.querySelector('.pgprob');
  prob.ontoggle = () => { file().panel = prob.open; saveSoon(); };
  prob.querySelectorAll('[data-f]').forEach(b => b.onclick = () => refill(b.dataset.f));
  prob.querySelector('.pgpo').onclick = () => openInPractice(file().src);
  confirmBtn(act('reset'), reset, () => file().code === file().orig);
  el.querySelector('.pgundo').onclick = undoReset;
  el.querySelectorAll('.pgtabs button').forEach(b => b.onclick = () => tab(b.dataset.t));
  const stdin = el.querySelector('.pgin textarea');
  stdin.oninput = () => { file().stdin = stdin.value; saveSoon(); if (P.auto) live(800); };
  stdin.onkeydown = e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run('main', true); } };
}

// Show file id in the editor and toolbar.
function open(id) {
  if (ed && P.files[P.cur]) Object.assign(file(), ed.state());
  P.cur = id; const f = file(); f.at = Date.now(); f.tab ||= 'out'; f.mode ||= 'main';
  ed.load(f.code, f.lang); ed.restore(f);
  el.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-checked', b.dataset.l === f.lang));
  el.querySelector('.pgt').textContent = f.title;
  el.querySelector('.pgauto').hidden = f.lang !== 'py'; el.querySelector('.pgauto input').checked = !!P.auto;
  el.querySelector('.pglive').hidden = f.lang !== 'gleam';
  el.querySelector('[data-act=tests]').textContent = f.lang === 'py' ? 'Run doctests' : 'Run tests';
  el.querySelector('[data-act=tests]').dataset.tip = f.lang === 'py' ? 'Run the >>> examples in your docstrings' : 'Run every pub fn whose name ends in _test';
  el.querySelector('.pgtabs').hidden = f.lang !== 'gleam';
  el.querySelector('.pgin').hidden = f.lang !== 'py'; el.querySelector('.pgin textarea').value = f.stdin || ''; if (f.stdin) el.querySelector('.pgin').open = true;
  el.querySelector('.pgundo').hidden = P.prev?.id !== id;
  panel(f);
  compiled = {}; runId++; tab(f.lang === 'gleam' ? f.tab : 'out', false);
  if (f.lang === 'gleam') run(f.mode);
  else { msg(''); out(`<span class="mut">${f.src ? `Press Run doctests to check this code, or Run (${RUNKEY}) to run it.` : `Press Run (${RUNKEY}) to run your code.`}</span>`); warmPy(); }
  rtPaint(); record(); saveSoon();
}
// The language buttons open that language's most recently used file.
function pick(lang) {
  if (file().lang === lang) return;
  const id = Object.keys(P.files).filter(k => P.files[k].lang === lang).sort((a, b) => P.files[b].at - P.files[a].at)[0];
  open(id); ed.focus();
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
  if (user) ev('pg_run', { v: lang + (mode === 'tests' ? '-tests' : '') });
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
  const box = el.querySelector('.pgprob'), x = f.src && findProblem(f.src.p);
  box.hidden = !f.src; if (!f.src) return;
  box.open = f.panel !== false;
  el.querySelector('.pgpt').textContent = f.title; el.querySelector('.pgpx').textContent = f.src.xt;
  box.querySelector('.pgpa').hidden = !x;
  if (!x) { box.querySelector('.pgpb').textContent = 'This problem is no longer on the site.'; return; }
  const segs = s => segHTML(s.map(g => g.f ? { ...g, f: undefined } : g));
  box.querySelector('.pgpb').innerHTML = x.p.b.map(b => b.s ? segs(b.s) : `<div class="pgq">${segs(b.l)}</div>`).join('');
  const sol = box.querySelector('[data-f=solution]'); sol.disabled = !canSolve(x);
  sol.dataset.tip = sol.disabled ? 'Unlocks once you’ve checked an answer to each of its questions in practice' : 'Fill the blanks with the official answers';
}
// Start the file again from the problem, as an edit that Undo (or ⌘Z) takes back.
function refill(fill) {
  const f = file(), x = findProblem(f.src.p); if (!x || fill === 'solution' && !canSolve(x)) return;
  P.prev = { id: P.cur, code: f.code };
  f.orig = codeFor(x, fill); f.src.fill = fill;
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
  if (!st.pgView) {
    st.pgView = true; document.body.classList.add('pgm'); pgb.setAttribute('aria-pressed', 'true'); syncHome();
    renderPG(); scrollTo({ top: 0, behavior: 'instant' }); ev('pg_open', {});
  }
  open(id && P.files[id] ? id : P.cur); ptTick();
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
  addEventListener('pagehide', save); addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
  onStatus(() => rtPaint());
  if (st.pgWant != null) showPG(st.pgWant || undefined);
}
