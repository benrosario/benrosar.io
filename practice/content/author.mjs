// Helpers for writing newly imported exams as content/exams/<id>.mjs (same shape as the JSON exams).
//
//   export default exam('61a-fa26-mt1', 'Fall 2026 Midterm 1', 'fa26/mt1/61a-fa26-mt1', 'fa26-mt1', [
//     problem('1', 'What Would Python Display? (6.0 pts)', [ text(...), py(`...`), blank(1, '(a)', ['1']), ... ]),
//   ]);
//
// Question ids are written out explicitly so they stay permanent (saved answers are keyed by them).
// Code blocks use ⟪a⟫ for lettered blanks; fills: {a: 'official answer'} power "Show all answers".
// problem(..., {run: true}) makes fill-in blanks checkable by running doctests: every Python code block of the problem
// (in order) becomes the program, each ⟪x⟫ a blank B<n>_<i>, and blank(..., {r: 'x'}) ties a question to it.
// problem(..., {run: 'gleam'}) does the same for Gleam: the gl() blocks become one module, and the glTests() block
// (shown on the page as the problem's tests) holds *_test functions that are run with each answer.
// blank(..., {ev: 'expression'}) in a Gleam problem is an "evaluates to" question, checked by compiling
// `assert <expression> == <answer>` after the problem's code.
import { questionParts } from '../src/js/model.js';
export const text = (...ps) => ps.map(p => typeof p == 'string' ? { p } : p);
export const h = t => ({ h: t });
// py(code, fills, {norun: true}) leaves a block out of the program that run: true builds (e.g. an interpreter session);
// {runCode} checks answers against a variant of the block, e.g. with an "implementation not shown" helper filled in;
// {runFills} gives official answers for blanks that only the runCode variant has (e.g. a line to replace).
export const py = (c, f, o = {}) => ({ c: c.replace(/^\n/, '').replace(/\s+$/, ''), lang: 'py', ...(f ? { f } : {}), ...o });
export const gl = (c, f, o = {}) => ({ c: c.replace(/^\n/, '').replace(/\s+$/, ''), lang: 'gleam', ...(f ? { f } : {}), ...o });
export const glTests = c => ({ c: c.replace(/^\n/, '').replace(/\s+$/, ''), lang: 'gleam', test: true });
export const sql = (c, f) => ({ c: c.replace(/^\n/, '').replace(/\s+$/, ''), lang: 'sql', ...(f ? { f } : {}) });
export const seg = (...s) => ({ s: s.flat() });

const label = l => typeof l == 'string' ? [{ p: l }] : l;
// Questions. `part`/`sub` say which part of the problem they belong to when the label doesn't show it.
export const blank = (id, l, a, o = {}) => ({ id, l: label(l), k: 'blank', a: [].concat(a), ...o });
export const mc = (id, l, opts, a, o = {}) => ({ id, l: label(l), k: 'mc', o: opts, a, ...o });
export const sata = (id, l, opts, a, o = {}) => ({ id, l: label(l), k: 'sata', o: opts, a, ...o });

// topics: the course staff's tags for this problem from https://cs61a.org/resources/_exams/exam_problems_*.json,
// as [{n, t}] exactly like the annotate-topics script writes them. Entries with by: 'site' are this site's own
// classification, used where the staff index has no entry or a wrong one for the problem.
// support: code the exam leaves out (e.g. "implementation omitted") that the doctests need; it is added to the program
// that checks answers but never shown.
// adapted: {from, problem} marks a problem this site adapted from another (e.g. a Scheme problem rewritten in Gleam);
// the page labels it everywhere it appears.
export function problem(n, t, topics, blocks, { run = false, support = [], adapted } = {}) {
  const b = [], segs = [];
  for (const x of blocks.flat()) {
    if (x.k) { b.push(x); continue; }
    const s = x.s || [x]; segs.push(...s);
    const last = b.at(-1); if (last && last.s) last.s.push(...s); else b.push({ s: [...s] });
  }
  return { n, t: `${n}. ${t}`, b, topics, ...(adapted ? { adapted } : {}), ...(run ? { _run: run, _support: support } : {}) };
}
function makeRun(p, pn, support, lang) {
  const segs = p.b.filter(x => x.s).flatMap(x => x.s);
  const code = segs.filter(g => g.lang == (lang == 'gleam' ? 'gleam' : 'py') && !g.norun && !g.test);
  const ids = {}, run = { c: [], b: {}, ch: {}, v: {} }; let k = 0;
  code.forEach((g, ci) => {
    run.c.push((g.runCode ?? g.c).split('\n').map(line => {
      const alone = /^\s*⟪([a-z])⟫\s*$/.test(line);
      return line.replace(/⟪([a-z])⟫/g, (t, x) => {
        const id = ids[x] || (ids[x] = `B${pn}_${k++}`);
        const v = g.f?.[x] ?? g.runFills?.[x];
        run.b[id] = alone; run.ch[id] = ci; if (v != null) run.v[id] = v; return '⟦' + id + '⟧';
      });
    }).join('\n'));
  });
  for (const c of support) run.c.push(c.replace(/^\n/, '').replace(/\s+$/, ''));
  if (lang == 'gleam') {
    run.lang = 'gleam'; run.t = segs.filter(g => g.test).map(g => g.c).join('\n\n');
    if (!run.t && p.b.some(q => q.k && q.r)) throw new Error(`${p.id}: a Gleam problem with code blanks needs a glTests() block`);
  }
  for (const q of p.b) if (q.k && q.r) q.r = [].concat(q.r).map(x => { if (!ids[x]) throw new Error(`${p.id}: question ${q.id} refers to unknown blank (${x})`); return ids[x]; });
  return run;
}

// exam(id, title, path under https://cs61a.org/resources/ without .pdf, staff topic-index label, problems)
// For a set of adapted problems, pass path null: there is no single source exam (each problem names its own).
export function exam(id, t, path, topicsLabel, problems) {
  const base = path && 'https://cs61a.org/resources/' + path;
  const p = problems.map((x, i) => {
    const { _run, _support, ...rest } = x; const out = { id: `${id}/${x.n}`, ...rest };
    if (_run) out.run = makeRun(out, i, _support, _run); else for (const q of out.b) if (q.k) { delete q.r; delete q.ev; }
    if (out.run && !Object.keys(out.run.c).length) delete out.run;
    const parts = questionParts(out);
    for (const q of out.b) if (q.k && !q.part && parts[q.id].part) { q.part = parts[q.id].part; if (parts[q.id].sub) q.sub = parts[q.id].sub; }
    for (const g of out.b.filter(b => b.s).flatMap(b => b.s)) { delete g.norun; delete g.runCode; delete g.runFills; }
    return out;
  });
  return { id, t, src: base ? { exam: base + '.pdf', sol: base + '_sol.pdf', topics: topicsLabel } : { adapted: true }, p };
}
