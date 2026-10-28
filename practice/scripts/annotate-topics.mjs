// Copy the course staff's per-problem topic tags into content/exams/*.json (maintenance tool).
// The tags come from the "Exam Questions by Topic" index on the CS 61A resources page:
//   https://cs61a.org/resources/_exams/exam_problems_{mt1,mt2,final}.json
// Usage: node practice/scripts/annotate-topics.mjs <dir containing those three JSON files>
// For each problem it stores the staff entries verbatim as `topics: [{n, t}]` (n = staff's problem/part number),
// and gives each question a `part` (and `sub`, e.g. "iii") so collections can resolve topics per question.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './build.mjs';
import { questionParts } from '../src/js/model.js';

const dir = process.argv[2];
if (!dir) { console.error('usage: annotate-topics.mjs <staff-json-dir>'); process.exit(1); }
const staff = {};
for (const f of ['exam_problems_mt1', 'exam_problems_mt2', 'exam_problems_final'])
  for (const e of JSON.parse(readFileSync(join(dir, f + '.json'), 'utf8')).exams) staff[e.label] = e;
const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
const titleOf = t => t.replace(/^\d+\.\s*/, '').replace(/\s*\([\d.?]+ pts\)$/, '');
let report = [];
for (const f of readdirSync(join(ROOT, 'content/exams')).filter(f => f.endsWith('.json'))) {
  const path = join(ROOT, 'content/exams', f), e = JSON.parse(readFileSync(path, 'utf8'));
  const s = staff[e.src?.topics];
  if (!s) { report.push(`${e.id}: no staff index entry (${e.src?.topics})`); continue; }
  for (const p of e.p) {
    const t = norm(titleOf(p.t));
    // Match by title (staff numbering has typos such as "22.a.i" for 2(a)(i)), falling back to the problem number.
    let entries = s.problems.filter(x => norm(x.title) === t || (t.length > 6 && norm(x.title).startsWith(t.slice(0, 20))));
    if (!entries.length) entries = s.problems.filter(x => x.number.match(/^\d+/)?.[0] === p.n);
    if (!entries.length) { report.push(`${e.id} ${p.n} "${titleOf(p.t)}": no staff tags`); delete p.topics; continue; }
    p.topics = entries.map(x => ({ n: x.number, t: x.topics }));
    const parts = questionParts(p);
    p.b.forEach(b => { if (!b.k) return; const pt = parts[b.id]; if (pt.part) b.part = pt.part; else delete b.part; if (pt.sub) b.sub = pt.sub; else delete b.sub; });
  }
  writeFileSync(path, JSON.stringify(e, null, 1) + '\n');
}
console.log(report.length ? report.join('\n') : 'all problems tagged');
