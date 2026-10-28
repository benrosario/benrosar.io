// Checking answers.
// - Multiple choice / select all: compared with the official choice(s); `also` lists other choices the staff accepted.
// - Fill in the blank: first compared with every accepted answer, ignoring case, spacing, a trailing ";" and quote style.
//   If that fails and the blank belongs to Python code with doctests (question field `r`), the answer is put into the
//   code (other blanks get their official answers) and the doctests are run in Pyodide (Python in a web worker).
//   Scheme, SQL and blanks without doctests are only ever compared as text; the UI says so and offers "I was right".
import { st } from './state.js';

export const GV = 4; // bump when grading changes so old wrong answers can be re-checked
export const runs = q => q.k == 'blank' && !!q.r;
export const HOW = {
  run: 'Checked by comparing with the official answer, then by running your code against the problem’s doctests in Python',
  text: 'Checked by comparing with the official answer text (ignoring spacing, capitalization and quote style). It is not run.',
  choice: 'Checked against the official choice',
};
export const howChecked = q => q.k != 'blank' ? HOW.choice : runs(q) ? HOW.run : HOW.text;

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
export async function grade(q, v, p) {
  if (q.k == 'mc') return { ok: v === q.a || !!q.also?.includes(v) };
  if (q.k == 'sata') return { ok: [...q.a].sort() + '' == [...v].sort() + '' };
  if (q.a.some(x => norm(x) == norm(v))) return { ok: true, how: 'Matches the official answer' };
  if (!q.r) return { ok: false };
  const R = p.run, vals = { ...R.v }, parts = q.r.length > 1 ? v.split('\n').filter(x => x.trim()).map(x => x.trim()) : [dedent(v)];
  if (parts.length != q.r.length) return { ok: false, out: `This question has ${q.r.length} blanks. Put each on its own line.` };
  q.r.forEach((b, i) => vals[b] = parts[i]);
  const full = R.c.map(c => fill(c, R.b, vals)).join('\n\n'), r = await runPy(full, fill(R.c[R.ch[q.r[0]]], R.b, vals));
  return r.ok ? { ok: true, how: `Ran your code: all ${r.n} doctests passed` } : { ok: false, out: 'Ran your code: ' + (r.failed ? `${r.failed} of ${r.n} doctests failed:\n` : '') + (r.err || '').trim() };
}
export function keyText(q) { if (q.k == 'mc') return q.o[q.a] + (q.also?.length ? '\n\nAlso accepted: ' + q.also.map(i => q.o[i]).join(', ') : ''); if (q.k == 'sata') return q.a.map(i => q.o[i]).join('\n'); return q.a.join('\n\nor\n\n'); }
