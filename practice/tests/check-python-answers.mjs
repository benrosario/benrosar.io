// Run the doctests of every code-checked problem with the official answers filled in (and each accepted alternative
// for each blank), using local python3 and the same prelude and fill logic as the site. Catches transcription errors.
// Usage: node practice/tests/check-python-answers.mjs [exam-id-prefix]   Exit code 1 on any failure.
import { spawnSync } from 'node:child_process';
import { loadBank } from '../scripts/build.mjs';
import { fill, dedent } from '../src/js/grading.js';

// Accepted answers the staff allow on paper that aren't runnable Python; the site accepts them by text match.
// Also official answers that don't run as written (see the explanation on those questions).
const TEXT_ONLY = {
  '61a-sp23-mt2/5 q26': ['yes + s for s in f(n, k) if not s or s[0] != no'],
  '61a-su23-midterm/3 q9': ['pow(10, i) * n % 10'],
  '61a-su23-midterm/3 q13': ['return digit_widget(4)(digit_widget(8)(n))'],
};

export async function pythonJobs(filter = '') {
  const bank = await loadBank(), jobs = [];
  const add = (where, p) => {
    const R = p.run; if (!R) return;
    // 1. Every chunk that has blanks, all official answers.
    R.c.forEach((c, i) => { if (/⟦B/.test(c)) jobs.push({ where: `${where} chunk ${i}`, full: R.c.map(x => fill(x, R.b, R.v)).join('\n\n'), test: fill(c, R.b, R.v) }); });
    // 2. Each accepted answer of each code-checked blank question, others official (as the site grades it).
    for (const q of p.b) if (q.k == 'blank' && q.r) for (const a of q.a) {
      if (TEXT_ONLY[`${where} q${q.id}`]?.includes(a)) continue;
      const vals = { ...R.v }, parts = q.r.length > 1 ? a.split('\n').filter(x => x.trim()).map(x => x.trim()) : [dedent(a)];
      if (parts.length != q.r.length) { jobs.push({ where: `${where} q${q.id}`, bad: `answer has ${parts.length} lines for ${q.r.length} blanks: ${a}` }); continue; }
      q.r.forEach((b, i) => vals[b] = parts[i]);
      jobs.push({ where: `${where} q${q.id} [${a.slice(0, 40)}]`, full: R.c.map(x => fill(x, R.b, vals)).join('\n\n'), test: fill(R.c[R.ch[q.r[0]]], R.b, vals) });
    }
  };
  for (const e of bank.exams) if (e.id.startsWith(filter)) for (const p of e.p) add(p.id, p);
  if (!filter) for (const k in bank.timed) for (const p of bank.timed[k]) add(`timed/${k}/${p.id}`, p);
  return { bank, jobs };
}

const DRIVER = `
import json, sys
exec(sys.argv[1])
out = []
for j in json.load(sys.stdin):
    try: r = run_tests(j['full'], j['test'])
    except Exception as e: r = {'ok': False, 'err': repr(e)}
    out.append(r)
print(json.dumps(out))
`;
export function runJobs(bank, jobs) {
  const live = jobs.filter(j => !j.bad);
  const r = spawnSync('python3', ['-c', DRIVER, bank.prelude], { input: JSON.stringify(live), encoding: 'utf8', maxBuffer: 1 << 26, timeout: 300000 });
  if (r.status !== 0) throw new Error('python3 failed: ' + r.stderr);
  const res = JSON.parse(r.stdout), fails = jobs.filter(j => j.bad).map(j => `${j.where}: ${j.bad}`);
  live.forEach((j, i) => { if (!res[i].ok || !res[i].n) fails.push(`${j.where}: ${res[i].n ? `${res[i].failed}/${res[i].n} failed` : 'no doctests ran'}\n${(res[i].err || '').slice(0, 700)}`); });
  return { total: live.length, fails };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { bank, jobs } = await pythonJobs(process.argv[2] || '');
  const { total, fails } = runJobs(bank, jobs);
  console.log(`${total} doctest runs, ${fails.length} failures`);
  for (const f of fails) console.log('FAIL', f);
  process.exit(fails.length ? 1 : 0);
}
