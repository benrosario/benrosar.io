// The playground's runtimes and problem imports, in Node: running a Gleam module's main (the same WebAssembly
// compiler the site serves), Python's run.py (with python3), the runner's live-run options, and every importable
// practice problem built three ways (blanks fail, the solution passes).
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { loadBank } from '../scripts/build.mjs';
import { ensureGleam, nodeCompiler, gleamAssets } from '../scripts/gleam-toolchain.mjs';
import { runMain, runTests, capture, withEchoDict } from '../src/js/gleam-core.js';
import { collector } from '../src/js/output.js';
import { createRunner } from '../src/js/runner.js';
import { st } from '../src/js/state.js';
import { problems, codeFor, canSolve, hasAnswers } from '../src/js/problems.js';
import { solutionQuestions } from '../src/js/grading.js';
import { runGleamJobs } from './check-gleam-answers.mjs';

const RUN_PY = join(dirname(fileURLToPath(import.meta.url)), '../src/py/run.py');
const bank = await loadBank();
st.bank = bank; st.S = {};

// Compile Gleam source and import it, with the standard library laid out as the site serves it.
const dir = mkdtempSync(join(tmpdir(), 'playground-gleam-')), C = await nodeCompiler(await ensureGleam());
for (const [f, data] of Object.entries(await gleamAssets())) if (f.startsWith('build/')) { const p = join(dir, f.slice(6)); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, data); }
const { inspect } = await import(pathToFileURL(join(dir, 'gleam/string.mjs')).href);
let n = 0;
async function gleam(source) {
  const c = C.compile(source); assert.ok(!c.error, c.error);
  const f = join(dir, `m${n++}.mjs`); writeFileSync(f, withEchoDict(c.js)); return import(pathToFileURL(f).href);
}
test.after(() => rmSync(dir, { recursive: true, force: true }));
const text = (out, s) => out.filter(c => c.s === s).map(c => c.t).join('');

test('Gleam main: print without newlines, echo with dicts on stderr, panics with their line', async () => {
  const r = runMain(await gleam(`import gleam/io\nimport gleam/dict\npub fn main() {\n  io.print("a")\n  io.print("b")\n  io.println("!")\n  io.println_error("oops")\n  echo dict.from_list([#("k", 1)])\n}`), inspect);
  assert.equal(r.ok, true);
  assert.equal(text(r.out, 'out'), 'ab!\n');
  assert.match(text(r.out, 'err'), /^oops\nsrc\/solution\.gleam:8\ndict\.from_list\(\[#\("k", 1\)\]\)\n$/);
  const p = runMain(await gleam(`import gleam/io\npub fn main() {\n  io.println("before")\n  panic as "boom"\n}`), inspect);
  assert.equal(text(p.out, 'out'), 'before\n');
  assert.equal(p.err, 'main: boom (src/solution.gleam, line 4)');
  assert.match(runMain(await gleam('pub fn f() { 1 }'), inspect).err, /no `pub fn main\(\)`.*run the tests/);
  // Tests print too; the output is collected around them.
  const mod = await gleam(`import gleam/io\npub fn add(a, b) { a + b }\npub fn add_test() {\n  io.println("testing")\n  assert add(1, 2) == 4\n}`);
  let t; const out = capture(() => { t = runTests(mod, inspect); });
  assert.equal(text(out, 'out'), 'testing\n'); assert.equal(t.failed, 1); assert.match(t.err, /left: {2}3\n {2}right: 4/);
});

test('output is joined per stream, cut off at 100,000 characters, and sent while running', () => {
  const sent = [], c = collector(o => sent.push(o));
  c.write('out', 'a'); c.write('out', 'b'); c.write('err', 'x'); c.write('out', 'c');
  assert.deepEqual(c.out, [{ s: 'out', t: 'ab' }, { s: 'err', t: 'x' }, { s: 'out', t: 'c' }]);
  const big = collector(); for (let i = 0; i < 30; i++) big.write('out', 'y'.repeat(5000));
  assert.ok(big.out[0].t.length < 100100); assert.match(big.out[0].t, /output cut off at 100,000 characters/);
});

// A fake worker: answers each request after `ms`, with progress first.
const fake = ms => () => ({ postMessage(d) { setTimeout(() => this.onmessage({ data: { id: d.id, loaded: true } }), 1); setTimeout(() => { this.onmessage({ data: { id: d.id, p: { out: 'x' } } }); this.onmessage({ data: { id: d.id, r: { ok: true, v: d.v, restart: d.restart } } }); }, ms); }, terminate() { this.dead = true; } });
test('live runs: newest wins, a stuck run is stopped, progress arrives, each run can have its own time limit', async () => {
  const R = createRunner(fake(10), 'Test', { latestWins: true, staleMs: 30, runMs: 1000 }), prog = [];
  assert.deepEqual(await Promise.all([R({ v: 1 }, p => prog.push(p)), R({ v: 2 }), R({ v: 3 })]), [{ ok: true, v: 1, restart: undefined }, { superseded: true }, { ok: true, v: 3, restart: undefined }]);
  assert.deepEqual(prog, [{ out: 'x' }]);
  const S = createRunner(fake(200), 'Test', { latestWins: true, staleMs: 30 }); const a = S({ v: 1 }); await new Promise(r => setTimeout(r, 60));
  assert.deepEqual((await Promise.all([a, S({ v: 2 })])).map(r => r.superseded || r.v), [true, 2]);
  const T = createRunner(() => ({ postMessage(d) { queueMicrotask(() => this.onmessage({ data: { id: d.id, loaded: true } })); }, terminate() {} }), 'Test', { runMs: 5000 });
  assert.equal((await T({}, null, { runMs: 20 })).err, 'Timed out after 0.02 seconds (infinite loop or recursion?)');
  let made = 0; const U = createRunner(() => { made++; return fake(1)(); }, 'Test');
  await U({ restart: true }); await U({}); assert.equal(made, 2, 'a result asking for a restart gets a fresh worker');
});

function python(script, input) {
  const r = spawnSync('python3', ['-I', '-c', script], { input: JSON.stringify(input), encoding: 'utf8', maxBuffer: 64 << 20 });
  assert.equal(r.status, 0, r.stderr); return JSON.parse(r.stdout);
}
test('Python programs: stdin like a terminal, stderr, tracebacks of the program\'s own lines only, exit', () => {
  const cases = { input: ['name = input("Name? ")\nprint("hi", name)\nimport sys\nprint("w", file=sys.stderr)', 'Ben\n'], eof: ['input()', ''],
    error: ['import json\ndef f(x):\n    return json.loads(x)\nf("{")', ''], syntax: ['def f(:\n  pass', ''], exit0: ['print(1)\nraise SystemExit', ''], exitMsg: ['raise SystemExit("bye")', ''], noLink: ['Link', ''] };
  const r = python(`import json, runpy, sys\nrun = runpy.run_path(${JSON.stringify(RUN_PY)})['run_program']\nout = {}\nfor k, (src, stdin) in json.load(sys.stdin).items():\n    o = []\n    res = json.loads(run(src, stdin, lambda s, t: o.append([s, t])))\n    out[k] = {**res, 'out': o}\nprint(json.dumps(out))`, cases);
  assert.deepEqual(r.input.out, [['out', 'Name? '], ['out', 'Ben\n'], ['out', 'hi'], ['out', ' '], ['out', 'Ben'], ['out', '\n'], ['err', 'w'], ['err', '\n']]);
  assert.match(r.eof.err, /EOFError: input\(\) ran out of lines/); assert.doesNotMatch(r.eof.err, /run\.py/);
  assert.match(r.error.err, /File "main\.py", line 4[\s\S]*File "main\.py", line 3, in f[\s\S]*JSONDecodeError/); assert.doesNotMatch(r.error.err, /json\/decoder|run\.py/);
  assert.match(r.syntax.err, /File "main\.py", line 1[\s\S]*SyntaxError/);
  assert.deepEqual([r.exit0.ok, r.exitMsg.ok, r.exitMsg.err], [true, false, 'bye']);
  assert.match(r.noLink.err, /NameError: name 'Link' is not defined/);
});

// Practice never runs this stub (its blanks are all in the first part), but Run doctests runs every doctest.
const STUB_DOCTESTS = { '61a-fa23-mt2/5': 'only_long_paths is an unfinished stub in the exam template' };
test('every importable problem: the solution passes, blanks fail, and it runs on its own', async () => {
  const all = problems(); assert.equal(all.length, bank.exams.flatMap(e => e.p).filter(p => p.run).length);
  const py = all.filter(x => x.lang === 'py').map(x => ({ id: x.p.id, solution: codeFor(x, 'solution'), blanks: codeFor(x, 'blanks') }));
  const r = python(`import json, runpy, sys\nd = json.load(sys.stdin); pre = {}; exec(d['prelude'], pre)\nrun = runpy.run_path(${JSON.stringify(RUN_PY)})['run_program']\nout = {}\nfor f in d['files']:\n    out[f['id']] = {'doctests': pre['run_tests'](f['solution'])['ok'], 'program': json.loads(run(f['solution'], '', lambda s, t: None)), 'blanks': pre['run_tests'](f['blanks'])['ok']}\nprint(json.dumps(out))`, { prelude: bank.prelude, files: py });
  for (const [id, x] of Object.entries(r)) {
    assert.equal(x.doctests, !STUB_DOCTESTS[id], `${id}: the solution's doctests`);
    assert.ok(x.program.ok, `${id} runs as a program: ${x.program.err}`);
    assert.equal(x.blanks, false, `${id}: blanks must fail`);
  }
  const gl = all.filter(x => x.lang === 'gleam').flatMap(x => [{ where: x.p.id + ' solution', source: codeFor(x, 'solution'), expect: true }, { where: x.p.id + ' blanks', source: codeFor(x, 'blanks'), expect: false }]);
  const g = await runGleamJobs(gl); assert.deepEqual(g.fails, []); assert.ok(g.total >= 16);
  // Problems using the course's classes get them, so Run works as well as Run doctests.
  assert.ok(py.some(f => /^# The definition CS 61A uses for Tree\.\nclass Tree:/m.test(f.solution)));
});

test('My answers fills in drafts first, then checked answers; the solution unlocks once every code question is checked', () => {
  const x = problems().find(x => x.p.id === '61a-fa26-extra-practice/3'), qs = solutionQuestions(x.p), key = q => `${x.e.id}|${q.id}`;
  assert.equal(qs.length, 2);
  st.S = {}; assert.equal(hasAnswers(x), false); assert.equal(canSolve(x), false); assert.equal(codeFor(x, 'mine'), codeFor(x, 'blanks'));
  st.S = { [key(qs[0])]: { v: '0', ok: true }, _dr: { [key(qs[1])]: 'value' } };
  assert.match(codeFor(x, 'mine'), /Empty -> 0\n\s+Data\(value\) -> value/); assert.equal(canSolve(x), false, 'a draft isn’t a check');
  st.S[key(qs[1])] = { v: 'wrong', ok: false }; assert.equal(canSolve(x), true, 'checked, even wrong, unlocks it');
  assert.match(codeFor(x, 'mine'), /Data\(value\) -> value/, 'the draft wins over the checked answer');
  assert.match(codeFor(x, 'blanks'), /Empty -> todo\n\s+Data\(value\) -> todo/);
  st.S = {};
});
