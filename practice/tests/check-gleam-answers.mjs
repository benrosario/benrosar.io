// Compile and run every Gleam problem's tests with the official answers (and each accepted alternative), using the
// same Gleam compiler and standard library the site serves, running in Node. Also checks that the tests notice a
// missing answer: each code blank replaced by `todo` must fail. Exit code 1 on any failure.
// Usage: node practice/tests/check-gleam-answers.mjs
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadBank } from '../scripts/build.mjs';
import { ensureGleam, nodeCompiler, gleamAssets } from '../scripts/gleam-toolchain.mjs';
import { gleamSource, dedent } from '../src/js/grading.js';
import { runTests } from '../src/js/gleam-core.js';

// Accepted answers that are only right together with another blank's swapped answer (the original key let the two
// checks go in either blank); the site accepts them by text match, so they aren't run one blank at a time.
const TEXT_ONLY = {
  '61a-fa26-gleam-adapted/1 q5': ['list.length(t0.branches) == list.length(t1.branches)'],
  '61a-fa26-gleam-adapted/1 q6': ['t0.label == t1.label'],
};

export function gleamJobs(bank) {
  const jobs = [];
  for (const e of bank.exams) for (const p of e.p) {
    const R = p.run; if (R?.lang != 'gleam') continue;
    jobs.push({ where: `${p.id} official`, source: gleamSource(R, {}, R.v), expect: true });
    for (const q of p.b) {
      if (q.k != 'blank') continue;
      if (q.ev) for (const a of q.a) jobs.push({ where: `${p.id} q${q.id} = ${a}`, source: gleamSource(R, q, R.v, a), expect: true });
      if (q.r) {
        for (const a of q.a) {
          if (TEXT_ONLY[`${p.id} q${q.id}`]?.includes(a)) continue;
          const vals = { ...R.v }, parts = q.r.length > 1 ? a.split('\n').filter(x => x.trim()) : [dedent(a)];
          q.r.forEach((b, i) => vals[b] = parts[i]);
          jobs.push({ where: `${p.id} q${q.id} [${a.slice(0, 40)}]`, source: gleamSource(R, q, vals), expect: true });
        }
        jobs.push({ where: `${p.id} q${q.id} left as todo`, source: gleamSource(R, q, { ...R.v, ...Object.fromEntries(q.r.map(b => [b, 'todo'])) }), expect: false });
      }
    }
  }
  return jobs;
}

export async function runGleamJobs(jobs) {
  const dir = mkdtempSync(join(tmpdir(), 'practice-gleam-')), C = await nodeCompiler(await ensureGleam()), assets = await gleamAssets();
  for (const f in assets) if (f.startsWith('build/')) { const p = join(dir, f.slice(6)); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, assets[f]); }
  const { inspect } = await import(pathToFileURL(join(dir, 'gleam/string.mjs')).href);
  const fails = []; let n = 0;
  for (const j of jobs) {
    const c = C.compile(j.source); let r;
    if (c.error) r = { ok: false, err: c.error };
    else { const f = join(dir, `solution_${n++}.mjs`); writeFileSync(f, c.js); r = runTests(await import(pathToFileURL(f).href), inspect); }
    if (r.ok !== j.expect) fails.push(`${j.where}: expected ${j.expect ? 'to pass' : 'to fail'}\n${(r.err || '').slice(0, 800)}`);
  }
  rmSync(dir, { recursive: true, force: true });
  return { total: jobs.length, fails };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { total, fails } = await runGleamJobs(gleamJobs(await loadBank()));
  console.log(`${total} Gleam compile-and-test runs, ${fails.length} failures`);
  for (const f of fails) console.log('FAIL', f);
  process.exit(fails.length ? 1 : 0);
}
