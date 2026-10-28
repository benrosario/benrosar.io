// Checking answers.
// - Multiple choice / select all: compared with the official choice(s); `also` lists other choices the staff accepted.
// - Fill in the blank: first compared with every accepted answer, ignoring spacing and a trailing ";" (and, except for
//   Gleam, which is case-sensitive, capitalization and quote style). If that fails and the blank can be run:
//   - Python (question field `r`, problem run.lang absent): the answer is put into the code (other blanks get their
//     official answers) and the doctests are run in Pyodide (Python in a web worker).
//   - Gleam (run.lang 'gleam'): the same, but the module is compiled with the official Gleam compiler (WebAssembly)
//     and the problem's *_test functions run (gleam-worker.js). An "evaluates to" question (field `ev`) is checked by
//     compiling `assert <expression> == <your answer>`.
//   Scheme, SQL and blanks that can't run are only ever compared as text; the UI says so and offers "I was right".
import { st } from './state.js';

export const GV = 4; // bump when grading changes so old wrong answers can be re-checked
export const isGleam = p => p?.run?.lang == 'gleam' || !!p?.b?.some(b => b.s?.some(g => g.lang == 'gleam'));
export const runs = q => q.k == 'blank' && (!!q.r || !!q.ev);
export const HOW = {
  run: 'Checked by comparing with the official answer, then by running your code against the problem’s doctests in Python',
  gleam: 'Checked by comparing with the official answer, then by compiling your code and running the problem’s tests in Gleam',
  gleamEval: 'Checked by comparing with the official answer, then by compiling your answer in Gleam and checking it equals the value',
  text: 'Checked by comparing with the official answer text (ignoring spacing, capitalization and quote style). It is not run.',
  gleamText: 'Checked by comparing with the official answer text (ignoring spacing; Gleam is case-sensitive). It is not run.',
  choice: 'Checked against the official choice',
};
export function howChecked(q, p) {
  if (q.k != 'blank') return HOW.choice;
  if (!runs(q)) return isGleam(p) ? HOW.gleamText : HOW.text;
  return p?.run?.lang == 'gleam' ? (q.ev ? HOW.gleamEval : HOW.gleam) : HOW.run;
}
// What to show while a check runs (the first run downloads Python or the Gleam compiler).
export function loadingText(q, p) {
  if (!runs(q)) return '';
  if (p?.run?.lang == 'gleam') return gleamLoaded() ? 'Compiling…' : 'Loading Gleam (first run downloads the compiler)…';
  return pyLoaded() ? 'Running…' : 'Loading Python (first run takes a few seconds)…';
}

// ---- Python runner: Pyodide in a worker, restarted on timeout ----
let W = null, wReady = null, jobs = {}, seq = 0;
export const pyLoaded = () => !!W;
function worker() {
  if (W) return;
  const WSRC = `importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
const ready=(async()=>{self.py=await loadPyodide();py.runPython(${JSON.stringify(st.bank.prelude)});postMessage({ready:1})})();
onmessage=async e=>{await ready;let r;try{py.globals.set('SRC',e.data.full);py.globals.set('TST',e.data.test);r=JSON.parse(py.runPython('import json\\njson.dumps(run_tests(SRC, TST))'))}catch(err){r={ok:false,err:String(err)}}postMessage({id:e.data.id,r})}`;
  W = new Worker(URL.createObjectURL(new Blob([WSRC], { type: 'text/javascript' })));
  wReady = new Promise(res => { W.onmessage = e => { if (e.data.ready) return res(); const j = jobs[e.data.id]; if (j) { clearTimeout(j.t); delete jobs[e.data.id]; j.res(e.data.r); } }; });
  W.onerror = e => { Object.values(jobs).forEach(j => j.res({ ok: false, err: 'Python failed to load: ' + (e.message || 'network error') })); jobs = {}; W = null; };
}
async function runPy(full, test) {
  worker(); const id = ++seq; const p = new Promise(res => jobs[id] = { res }); await wReady;
  jobs[id] && (jobs[id].t = setTimeout(() => { const j = jobs[id]; delete jobs[id]; W.terminate(); W = null; j.res({ ok: false, err: 'Timed out after 8 seconds (infinite loop or recursion?)' }); }, 8000));
  W.postMessage({ id, full, test }); return p;
}

// ---- Gleam runner: the official compiler (WebAssembly) in a module worker, restarted on timeout ----
// The first check downloads the compiler (served from assets/gleam/<version>/), so the 8-second limit on running the
// code starts once the worker says the compiler is loaded.
let GW = null, gjobs = {}, gseq = 0, gwarm = false;
export const gleamLoaded = () => gwarm;
function gleamWorker() {
  if (GW) return;
  GW = new Worker(st.gleam.worker, { type: 'module' });
  GW.onmessage = e => {
    const j = gjobs[e.data.id]; if (!j) return; clearTimeout(j.t); gwarm = true;
    if (e.data.loaded) { j.t = timeout(e.data.id, 8000); return; }
    delete gjobs[e.data.id]; j.res(e.data.r);
  };
  GW.onerror = e => { Object.values(gjobs).forEach(j => j.res({ ok: false, err: 'Gleam failed to load: ' + (e.message || 'network error') })); gjobs = {}; GW = null; gwarm = false; };
}
const timeout = (id, ms) => setTimeout(() => {
  const j = gjobs[id]; if (!j) return; delete gjobs[id]; GW?.terminate(); GW = null; gwarm = false;
  j.res({ ok: false, err: ms > 8000 ? 'Gleam took too long to load. Check your connection and try again.' : 'Timed out after 8 seconds (infinite loop or recursion?)' });
}, ms);
export function runGleam(source) {
  gleamWorker(); const id = ++gseq;
  return new Promise(res => { gjobs[id] = { res }; gjobs[id].t = timeout(id, 60000); GW.postMessage({ id, base: st.gleam.base, source }); });
}

// Put answers into code: ⟦B0_1⟧ marks a blank; a blank alone on its line may hold several lines.
export function fill(text, alone, vals) {
  return text.split('\n').map(line => {
    for (const [, bid] of [...line.matchAll(/⟦(B[0-9_]+)⟧/g)]) {
      const tok = '⟦' + bid + '⟧'; let v = vals[bid];
      if (v != null && line.endsWith(tok + ':')) v = v.trimEnd().replace(/:$/, '');
      if (alone[bid]) { const pre = line.slice(0, line.indexOf(tok)); line = (v ?? 'pass').split('\n').map(x => pre + x).join('\n'); }
      else line = line.replace(tok, () => (v ?? '__unfilled__').split('\n').join(' '));
    }
    return line;
  }).join('\n');
}
// Remove indentation shared by every line (and blank edges), so pasted or indented answers line up with the blank.
export function dedent(t) {
  const L = t.replace(/\t/g, '    ').split('\n'); while (L.length && !L[0].trim()) L.shift(); while (L.length && !L.at(-1).trim()) L.pop();
  const n = Math.min(...L.filter(l => l.trim()).map(l => l.match(/^ */)[0].length)); return L.map(l => l.slice(n).trimEnd()).join('\n');
}
export const norm = s => s.toLowerCase().replace(/"/g, "'").replace(/\s+/g, '').replace(/;$/, '');
const normGleam = s => s.replace(/\s+/g, '').replace(/;$/, '');
// The Gleam module checked for an answer: the problem's code with blanks filled, then its tests (or, for an
// "evaluates to" question, one test that the expression equals the answer).
export function gleamSource(R, q, vals, answer) {
  const code = R.c.map(c => fill(c, R.b, vals)).join('\n\n');
  return q.ev ? `${code}\n\npub fn answer_test() {\n  assert { ${q.ev} } == {\n    ${answer}\n  }\n}\n` : `${code}\n\n${R.t}\n`;
}
export async function grade(q, v, p) {
  if (q.k == 'mc') return { ok: v === q.a || !!q.also?.includes(v) };
  if (q.k == 'sata') return { ok: [...q.a].sort() + '' == [...v].sort() + '' };
  const n = isGleam(p) ? normGleam : norm;
  if (q.a.some(x => n(x) == n(v))) return { ok: true, how: 'Matches the official answer' };
  if (!runs(q)) return { ok: false };
  const R = p.run, vals = { ...R.v };
  if (R.lang == 'gleam') {
    if (!q.ev) {
      const parts = q.r.length > 1 ? v.split('\n').filter(x => x.trim()).map(x => x.trim()) : [dedent(v)];
      if (parts.length != q.r.length) return { ok: false, out: `This question has ${q.r.length} blanks. Put each on its own line.` };
      q.r.forEach((b, i) => vals[b] = parts[i]);
    }
    const r = await runGleam(gleamSource(R, q, vals, v));
    if (r.ok) return { ok: true, ran: true, how: q.ev ? 'Compiled your answer in Gleam: it equals the value' : `Compiled and ran your Gleam code: ${r.n == 1 ? 'the test passed' : `all ${r.n} tests passed`}` };
    if (r.compile) return { ok: false, ran: true, out: (q.ev ? 'Your answer didn’t compile as a Gleam value of the right type:\n' : 'Your Gleam code didn’t compile:\n') + r.err };
    return { ok: false, ran: r.n != null, out: q.ev ? 'Compiled your answer in Gleam: it doesn’t equal the value.\n' + (r.err || '') : 'Compiled and ran your Gleam code: ' + (r.failed ? `${r.failed} of ${r.n} tests failed:\n` : '') + (r.err || '').trim() };
  }
  const parts = q.r.length > 1 ? v.split('\n').filter(x => x.trim()).map(x => x.trim()) : [dedent(v)];
  if (parts.length != q.r.length) return { ok: false, out: `This question has ${q.r.length} blanks. Put each on its own line.` };
  q.r.forEach((b, i) => vals[b] = parts[i]);
  const full = R.c.map(c => fill(c, R.b, vals)).join('\n\n'), r = await runPy(full, fill(R.c[R.ch[q.r[0]]], R.b, vals));
  return r.ok ? { ok: true, ran: true, how: `Ran your code: all ${r.n} doctests passed` } : { ok: false, ran: true, out: 'Ran your code: ' + (r.failed ? `${r.failed} of ${r.n} doctests failed:\n` : '') + (r.err || '').trim() };
}
export function keyText(q) { if (q.k == 'mc') return q.o[q.a] + (q.also?.length ? '\n\nAlso accepted: ' + q.also.map(i => q.o[i]).join(', ') : ''); if (q.k == 'sata') return q.a.map(i => q.o[i]).join('\n'); return q.a.join('\n\nor\n\n'); }
