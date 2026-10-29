// Answer checking. Runtimes are isolated in serialized, restartable browser workers.
import { st } from './state.js';
import { createRunner } from './runner.js';
import { matchesAnswer, restrictionError } from './answers.js';
export { norm } from './answers.js';
export const GV = 5;
export const isGleam = p => p?.run?.lang === 'gleam' || !!p?.b?.some(b => b.s?.some(g => g.lang === 'gleam'));
export const runs = q => q.k === 'blank' && (!!q.r || !!q.ev || !!q.sql);
export const HOW = {
  run: 'Checked against accepted answers, then Python doctests. Other blanks use the official answers. Tests do not prove every input works.',
  gleam: 'Checked against accepted answers, then by compiling your code and running the problem’s tests in Gleam. Other blanks use official answers; stated restrictions still apply.',
  gleamEval: 'Checked by compiling your answer in Gleam and comparing its value with the expression.',
  sql: 'Executed in SQLite on several datasets and compared with the expected results.',
  text: 'Compared with accepted answer text. Capitalization and string contents matter. This answer is not executed.',
  gleamText: 'Compared with accepted Gleam answer text. Capitalization and string contents matter. This answer is not executed.',
  choice: 'Checked against the accepted choices'
};
export function howChecked(q, p) {
  if (q.k !== 'blank') return HOW.choice;
  if (q.sql) return HOW.sql;
  if (!runs(q)) return isGleam(p) ? HOW.gleamText : HOW.text;
  return isGleam(p) ? q.ev ? HOW.gleamEval : HOW.gleam : HOW.run;
}
export function loadingText(q, p) {
  if (q.sql) return 'Checking SQL in SQLite…';
  if (!runs(q)) return '';
  if (isGleam(p)) return gleamLoaded() ? 'Compiling…' : 'Loading Gleam (first run downloads the compiler)…';
  return pyLoaded() ? 'Running…' : 'Loading Python (first run takes a few seconds)…';
}
const py = createRunner(() => {
  const src = `importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
const ready=(async()=>{self.py=await loadPyodide();py.runPython(${JSON.stringify(st.bank.prelude + String.fromCharCode(10) + (st.bank.sqlPrelude || ''))})})();
let sqlReady;
onmessage=async ({data})=>{
  const {id,full,test,sql}=data;
  try { await ready; if(sql) await (sqlReady ||= py.loadPackage('sqlite3')); }
  catch(e) { postMessage({id,r:{ok:false,unavailable:true,err:'Python or SQLite failed to load: '+String(e.message||e)}});return; }
  postMessage({id,loaded:true});
  let r;
  try {
    if(sql){py.globals.set('SQL_JOB',JSON.stringify(sql));r=JSON.parse(py.runPython('__import__("json").dumps(run_sql(__import__("json").loads(SQL_JOB)))'));}
    else {py.globals.set('SRC',full);py.globals.set('TST',test);r=JSON.parse(py.runPython('__import__("json").dumps(run_tests(SRC,TST))'));}
  }catch(e){r={ok:false,err:String(e.message||e)}}
  postMessage({id,r});
};`;
  const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
  try { return new Worker(url); } finally { URL.revokeObjectURL(url); }
}, 'Python / SQLite');
const gl = createRunner(() => new Worker(st.gleam.worker, { type: 'module' }), 'Gleam');
export const pyLoaded = () => py.loaded();
export const gleamLoaded = () => gl.loaded();
export const runGleam = source => gl({ base: st.gleam.base, source });
export const runPy = (full, test) => py({ full, test });
export const runSQL = sql => py({ sql });
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
// The Gleam module checked for an answer: the problem's code with blanks filled, then its tests (or, for an
// "evaluates to" question, one test that the expression equals the answer).
export function gleamSource(R, q, vals, answer) {
  const code = R.c.map(c => fill(c, R.b, vals)).join('\n\n');
  return q.ev ? `${code}\n\npub fn answer_test() {\n  assert { ${q.ev} } == {\n    ${answer}\n  }\n}\n` : `${code}\n\n${R.t}\n`;
}

export function answerParts(q, v) {
  const ids = q.r || q.code;
  const parts = ids.length > 1 ? String(v).split('\n').filter(x => x.trim()).map(x => x.trim()) : [dedent(String(v))];
  return parts.length === ids.length ? Object.fromEntries(ids.map((b, i) => [b, parts[i]])) : null;
}
export function sqlJob(p, q, answer, overrides = {}) {
  const c = p.sql.chunks[q.sql.chunk], vals = { ...c.f, ...overrides, [q.sql.key]: answer };
  const query = c.c.replace(/⟪([a-z])⟫/g, (_, k) => vals[k]);
  const expected = c.c.replace(/⟪([a-z])⟫/g, (_, k) => c.f[k]);
  return { query, expected, fixtures: p.sql.fixtures, ordered: !!c.ordered, table: c.table || null };
}
function result(r, language, evaluated = false) {
  if (r.unavailable) return { ok: false, unavailable: true, out: r.err + ' Your answer has not been marked wrong. Press Check to retry.' };
  if (r.ok) return { ok: true, ran: true, how: evaluated ? 'Compiled your answer in Gleam: it equals the value' : language === 'Gleam' ? `Compiled and ran your Gleam code: ${r.n === 1 ? 'the test passed' : `all ${r.n} tests passed`}` : language === 'SQL' ? `SQL results match on all ${r.n} datasets` : `Ran your code: all ${r.n} doctests passed` };
  return { ok: false, ran: true, out: r.compile ? (evaluated ? 'Your answer didn’t compile as a Gleam value of the right type:\n' : 'Your Gleam code didn’t compile:\n') + r.err : evaluated ? 'Compiled your answer in Gleam: it doesn’t equal the value.\n' + (r.err || '') : `${language}: ` + (r.failed ? `${r.failed} of ${r.n} tests failed:\n` : '') + (r.err || 'No tests were found.') };
}
export async function grade(q, v, p) {
  if (q.k === 'mc') return { ok: v === q.a || !!q.also?.includes(v) };
  if (q.k === 'sata') return { ok: [...q.a].sort() + '' === [...v].sort() + '' };
  const restriction = restrictionError(q, p, v);
  if (restriction) return { ok: false, out: 'Problem restriction: ' + restriction };
  // SQL always executes: matching the key alone must not conceal a broken reference query.
  if (q.sql) return result(await runSQL(sqlJob(p, q, v)), 'SQL');
  const lang = isGleam(p) ? 'gleam' : 'py';
  if (q.a.some(x => matchesAnswer(v, x, lang, runs(q)))) return { ok: true, how: 'Matches the official answer' };
  if (!runs(q)) return { ok: false };
  const R = p.run, vals = { ...R.v };
  if (!q.ev) {
    const parts = answerParts(q, v);
    if (!parts) return { ok: false, out: `This question has ${q.r.length} blanks. Put each on its own line.` };
    Object.assign(vals, parts);
  }
  if (R.lang === 'gleam') return result(await runGleam(gleamSource(R, q, vals, v)), 'Gleam', !!q.ev);
  return result(await runPy(R.c.map(c => fill(c, R.b, vals)).join('\n\n'), fill(R.c[R.ch[q.r[0]]], R.b, vals)), 'Python');
}
export const solutionQuestions = p => p.b.filter(q => q.k && (q.r || q.code || q.sql));
export const pythonSolutionTests = (R, vals) => [...new Set(Object.values(R.ch))].map(i=>fill(R.c[i],R.b,vals)).join('\n\n');
export function canCheckSolution(p) {
  const qs = solutionQuestions(p);
  return !!p.sql || !!p.run && qs.length > 0 && Object.keys(p.run.b).every(id => qs.some(q => (q.r || q.code || []).includes(id)));
}
// The caller supplies only the student's saved/draft answers. No official filler is used for a code solution.
export async function gradeSolution(p, answers) {
  const qs = solutionQuestions(p), vals = {};
  for (const q of qs) {
    const v = answers[q.id];
    if (v == null || v === '' || Array.isArray(v) && !v.length) return { ok: false, out: 'Answer every code blank in this problem before checking the whole solution.' };
    if(q.k === 'sata' && [...q.a].sort()+'' !== [...v].sort()+'') return {ok:false,out:'Review the select-all code choices before checking the whole solution.'};
    const text = q.k === 'mc' ? q.o[v] : q.k === 'sata' ? q.o[v[0]] : v;
    const restriction = restrictionError(q, p, text);
    if (restriction) return { ok: false, out: 'Problem restriction: ' + restriction };
    if (!q.sql) { const parts = answerParts(q, text); if (!parts) return { ok: false, out: 'Put each blank on its own line.' }; Object.assign(vals, parts); }
  }
  if (p.sql) {
    let n = 0;
    for (let i = 0; i < p.sql.chunks.length; i++) {
      const group = qs.filter(q => q.sql.chunk === i), q = group[0]; if (!q) continue;
      const overrides = Object.fromEntries(group.map(q => [q.sql.key, q.k === 'mc' ? q.o[answers[q.id]] : answers[q.id]]));
      const r = await runSQL(sqlJob(p, q, overrides[q.sql.key], overrides));
      if (!r.ok) return result(r, 'SQL'); n += r.n;
    }
    return { ok: true, ran: true, how: `Whole SQL solution passed ${n} dataset checks` };
  }
  if (!canCheckSolution(p)) return { ok: false, out: 'This problem does not yet have a complete executable template.' };
  const R = p.run;
  return R.lang === 'gleam' ? result(await runGleam(gleamSource(R, {}, vals)), 'Gleam') : result(await runPy(R.c.map(c => fill(c, R.b, vals)).join('\n\n'), pythonSolutionTests(R,vals)), 'Python');
}
export function keyText(q) { if (q.k == 'mc') return q.o[q.a] + (q.also?.length ? '\n\nAlso accepted: ' + q.also.map(i => q.o[i]).join(', ') : ''); if (q.k == 'sata') return q.a.map(i => q.o[i]).join('\n'); return q.a.join('\n\nor\n\n'); }
