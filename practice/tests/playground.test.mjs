// The playground's runtimes and problem imports, in Node: running a Gleam module's main (the same WebAssembly
// compiler the site serves), Python's run.py (with python3), the runner's live-run options, and every importable
// practice problem built three ways (blanks fail, the solution passes).
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { loadBank } from '../scripts/build.mjs';
import { ensureGleam, nodeCompiler, gleamAssets } from '../scripts/gleam-toolchain.mjs';
import { runMain, runTests, capture, withEchoDict, describe } from '../src/js/gleam-core.js';
import { instrument, rewrite, recorder } from '../src/js/gleam-step.js';
import { collector } from '../src/js/output.js';
import { createRunner } from '../src/js/runner.js';
import { st } from '../src/js/state.js';
import { problems, codeFor, canSolve, hasAnswers, findAnyProblem, importCode } from '../src/js/problems.js';
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
async function gleam(source, edit = js => js) {
  const c = C.compile(source); assert.ok(!c.error, c.error);
  const f = join(dir, `m${n++}.mjs`); writeFileSync(f, withEchoDict(edit(c.js))); return import(pathToFileURL(f).href);
}
// Step through Gleam source as the worker does: with probes, then the module's main (or fn) with a recorder.
async function stepGleam(source, { max, fn } = {}) {
  const i = instrument(source); assert.ok(i, 'instrumented');
  const mod = await gleam(i.source, js => rewrite(js, i.lines));
  let size = () => 0; const rec = recorder({ show: inspect, size: () => size(), describe: (f, e) => describe(f, e, inspect), max });
  globalThis.__gleamStep = rec.hooks;
  try { const r = fn ? fn(mod) : runMain(mod, inspect, null, col => { size = col.size; }); rec.end(); return { ...r, steps: rec.steps, cut: rec.cut, source: i.source }; }
  finally { delete globalThis.__gleamStep; }
}
// A step as text: event:line, then each frame as name(vars)->return value.
const show = s => `${s.ev}:${s.l} ${s.st.map(f => `${f.fn}(${f.vars.map(v => v.join('=')).join(',')})${f.ret ? '->' + f.ret : ''}${f.loop ? '[loop]' : ''}`).join(' ')}`.trim();
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

test('Gleam Step: probes keep every line where it was, and each statement, case arm, call and return is a step', async () => {
  const src = 'import gleam/io\nimport gleam/int\n\npub fn main() {\n  let r = fact(2)\n  io.println(int.to_string(r))\n  r |> echo\n  sum(2, 0)\n}\n\nfn fact(n) {\n  case n {\n    0 -> 1\n    _ ->\n      n * fact(n - 1)\n  }\n}\n\nfn sum(n, acc) {\n  case n {\n    0 -> acc\n    _ -> sum(n - 1, acc + n)\n  }\n}\n';
  const r = await stepGleam(src);
  assert.deepEqual(r.source.split('\n').slice(0, 25).map(l => l.replace(/playground_step\(\d+\) |\{ playground_step\(\d+\) | \}$/g, '')), src.split('\n').slice(0, 25).map(l => l.replace(/ \}$/, '')), 'only additions within lines');
  assert.deepEqual(r.steps.map(show), [
    'call:4 main()', 'line:5 main()', 'call:11 main() fact(n=2)', 'line:12 main() fact(n=2)', 'line:15 main() fact(n=2)',
    'call:11 main() fact(n=2) fact(n=1)', 'line:12 main() fact(n=2) fact(n=1)', 'line:15 main() fact(n=2) fact(n=1)',
    'call:11 main() fact(n=2) fact(n=1) fact(n=0)', 'line:12 main() fact(n=2) fact(n=1) fact(n=0)', 'line:13 main() fact(n=2) fact(n=1) fact(n=0)',
    'return:13 main() fact(n=2) fact(n=1) fact(n=0)->1', 'return:15 main() fact(n=2) fact(n=1)->1', 'return:15 main() fact(n=2)->2',
    'line:6 main(r=2)', 'line:7 main(r=2)', 'line:8 main(r=2)',
    'call:19 main(r=2) sum(n=2,acc=0)[loop]', 'line:20 main(r=2) sum(n=2,acc=0)[loop]', 'line:22 main(r=2) sum(n=2,acc=0)[loop]',
    'line:20 main(r=2) sum(n=1,acc=2)[loop]', 'line:22 main(r=2) sum(n=1,acc=2)[loop]', 'line:20 main(r=2) sum(n=0,acc=3)[loop]', 'line:21 main(r=2) sum(n=0,acc=3)[loop]',
    'return:21 main(r=2) sum(n=0,acc=3)->3[loop]', 'return:8 main(r=2)->3', 'end:8']);
  assert.deepEqual(r.steps.filter(s => s.ev === 'line' && s.l >= 6 && s.l <= 8).map(s => s.o), [0, 2, 25], 'o counts what was printed by then');
});

test('Gleam Step: shadowing, use and anonymous functions, panics, and the step limit', async () => {
  const u = await stepGleam('import gleam/result\nimport gleam/list\n\npub fn main() {\n  let x = 1\n  let x = x + 1\n  use y <- result.try(Ok(x))\n  let zs = list.map([1, 2], fn(z) {\n    z * y\n  })\n  let assert [a, ..] = zs\n  Ok(a)\n}\n');
  assert.ok(u.ok);
  assert.deepEqual(u.steps.map(show).filter(s => /^(line|return):(6|7|9|11)/.test(s)), ['line:6 main(x=1)', 'line:7 main(x=2)', 'line:9 main(x=2) fn(y=2) fn(z=1)', 'return:9 main(x=2) fn(y=2) fn(z=1)->2',
    'line:9 main(x=2) fn(y=2) fn(z=2)', 'return:9 main(x=2) fn(y=2) fn(z=2)->4', 'line:11 main(x=2) fn(y=2,zs=[2, 4])', 'return:7 main(x=2)->Ok(2)'], 'a shadowed name shows its newest value; a closure\'s frame shows its own names');
  const p = await stepGleam('pub fn main() {\n  f(1)\n}\n\nfn f(x) {\n  let y = x + 1\n  panic as "boom"\n}\n');
  assert.equal(p.err, 'main: boom (src/solution.gleam, line 7)');
  assert.deepEqual(p.steps.slice(-2).map(s => [show(s), s.exc]), [['exc:7 main() f(x=1,y=2)', 'f: boom'], ['end:7', undefined]]);
  const l = await stepGleam('pub fn main() {\n  go(0)\n}\n\nfn go(n) {\n  go(n + 1)\n}\n', { max: 40 });
  assert.deepEqual([l.cut, l.steps.length, show(l.steps.at(-1))], [true, 40, 'line:6 main() go(n=36)[loop]']);
  // Code the probes can't follow isn't stepped, and the source has the same lines.
  assert.equal(instrument('pub fn main() {\n  1\n'), null);
});

test('Gleam Step: every importable problem and the playground\'s example compile with probes and pass or fail their tests as before', async () => {
  const sources = [...problems().filter(x => x.lang === 'gleam').flatMap(x => [codeFor(x, 'solution'), codeFor(x, 'blanks')]), readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/js/playground.js'), 'utf8').match(/gleam: `([\s\S]*?)`,\n/)[1]];
  let stepped = 0;
  for (const src of sources) {
    if (C.compile(src).error) continue; // some blanks don't compile yet (Step then shows the compile error)
    stepped++;
    const plain = runTests(await gleam(src), inspect), traced = await stepGleam(src, { fn: m => runTests(m, inspect) });
    assert.deepEqual([traced.ok, traced.n, traced.failed], [plain.ok, plain.n, plain.failed], src);
    assert.ok(traced.steps.length > 1 || !plain.n, 'the tests\' functions are steps');
  }
  assert.ok(stepped >= 15, `${stepped} stepped`);
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

test('Python Step: each line, call and return with the frames, exceptions where raised, output so far, and a step limit', () => {
  const cases = { calls: ['def sq(x):\n    return x * x\n\nprint(sq(3))\ny = sq(4)\n', '', 2000], input: ['n = input("n? ")\nprint(n)\n', '5\n', 2000],
    fact: ['def fact(n):\n    if n == 0:\n        return 1\n    return n * fact(n - 1)\n\nfact(2)\n', '', 2000],
    caught: ['import math\ntry:\n    1 / 0\nexcept ZeroDivisionError:\n    z = math.pi\n', '', 2000], error: ['def f():\n    return 1 / 0\nf()\n', '', 2000],
    loop: ['i = 0\nwhile True:\n    i += 1\n', '', 50], repr: ['class X:\n    def __repr__(self):\n        print("side effect")\n        return "X!" * 200\n\nx = X()\n', '', 2000] };
  const r = python(`import json, runpy, sys\ntrace = runpy.run_path(${JSON.stringify(RUN_PY)})['trace_program']\nout = {}\nfor k, (src, stdin, cap) in json.load(sys.stdin).items():\n    o = []\n    out[k] = {**json.loads(trace(src, stdin, lambda s, t: o.append(t), cap)), 'out': ''.join(o)}\nprint(json.dumps(out))`, cases);
  const evs = k => r[k].steps.map(s => `${s.ev}:${s.l}`).join(' ');
  assert.equal(evs('calls'), 'line:1 line:4 call:1 line:2 return:2 line:5 call:1 line:2 return:2 end:2');
  const c = r.calls.steps;
  assert.deepEqual(c[3].st.map(f => [f.fn, f.vars]), [['Global', [['sq', '<function sq>']]], ['sq', [['x', '3']]]]);
  assert.equal(c[4].st[1].ret, '9'); assert.deepEqual([c[4].o, c[5].o], [0, 2], 'o counts what was printed by then');
  assert.notEqual(c[3].st[1].id, c[7].st[1].id, 'each call is its own frame');
  assert.deepEqual(c.at(-1).st[0].vars, [['sq', '<function sq>'], ['y', '16']]);
  assert.deepEqual(r.input.steps.map(s => s.o), [0, 5, 7]); assert.equal(r.input.out, 'n? 5\n5\n');
  assert.deepEqual(r.fact.steps.filter(s => s.ev === 'return').map(s => [s.st.length, s.st.at(-1).ret]), [[4, '1'], [3, '1'], [2, '2']]);
  assert.deepEqual(r.caught.steps.filter(s => s.ev === 'exc').map(s => [s.l, s.exc]), [[3, 'ZeroDivisionError: division by zero']]);
  assert.ok(r.caught.ok); assert.ok(!r.caught.steps.at(-1).st[0].vars.some(([k]) => k === 'math'), 'modules are left out');
  assert.equal(evs('error'), 'line:1 line:3 call:1 line:2 exc:2 end:2', 'a frame left by an exception has no return value');
  assert.match(r.error.err, /File "main\.py", line 2, in f[\s\S]*ZeroDivisionError/); assert.equal(r.error.ok, false);
  assert.deepEqual([r.loop.ok, r.loop.cut, r.loop.steps.length, r.loop.err], [true, true, 50, '']);
  const x = r.repr.steps.at(-1).st[0].vars.find(([k]) => k === 'x')[1];
  assert.equal(x.length, 80, 'long values are cut short'); assert.equal(r.repr.out, '', 'what showing a value prints is not the program\'s output');
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

test('My answers fills in drafts first, then checked answers; solutions are available without checked answers', () => {
  const x = problems().find(x => x.p.id === '61a-fa26-extra-practice/3'), qs = solutionQuestions(x.p), key = q => `${x.e.id}|${q.id}`;
  assert.equal(qs.length, 2);
  st.S = {}; assert.equal(hasAnswers(x), false); assert.equal(canSolve(x), true); assert.equal(codeFor(x, 'mine'), codeFor(x, 'blanks'));
  st.S = { [key(qs[0])]: { v: '0', ok: true }, _dr: { [key(qs[1])]: 'value' } };
  assert.match(codeFor(x, 'mine'), /Empty -> 0\n\s+Data\(value\) -> value/); assert.equal(canSolve(x), true, 'solutions do not require checked answers');
  st.S[key(qs[1])] = { v: 'wrong', ok: false }; assert.equal(canSolve(x), true, 'solution availability is independent of checks');
  assert.match(codeFor(x, 'mine'), /Data\(value\) -> value/, 'the draft wins over the checked answer');
  assert.match(codeFor(x, 'blanks'), /Empty -> todo\n\s+Data\(value\) -> todo/);
  st.S = {};
});

test('displayed Python code stays executable while instructions and expected answers are comments', () => {
  st.S = {};
  const x = findAnyProblem('61a-fa25-final/1'), code = importCode(x,'solution');
  assert.match(code,/^def times\(/m); assert.match(code,/^times\(2, 3, 10\)/m);
  assert.match(code,/^# Assume the following code has been executed\./m);
  const r = spawnSync('python3',['-I','-c',code],{encoding:'utf8'});
  assert.equal(r.status,0,r.stderr); assert.equal(r.stdout,'300\n-2\n4\n2\n');
  const transcript = importCode(findAnyProblem('61a-fa26-mt1/1'),'solution');
  assert.doesNotMatch(transcript,/^>>>/m); assert.match(transcript,/^# None = 0$/m);
  const t = spawnSync('python3',['-I','-c',transcript],{encoding:'utf8'});
  assert.equal(t.status,0,t.stderr); assert.equal(t.stdout,'1\nNone = 0\nso\nNone + None = zero?\n');
});

test('displayed Gleam templates import as code, with solution, blanks and drafts preserved', async () => {
  const x = {lang:'gleam',e:{id:'test',t:'Example'},p:{t:'Gleam example',b:[{s:[{p:'Return the answer.'},{c:'pub fn answer() { ⟪a⟫ }',lang:'gleam',f:{a:'42'}}]},{id:1,k:'blank',l:[{p:'Fill in blank (a).'}],a:['42']}]}};
  st.S = {};
  const code = importCode(x,'solution'); assert.match(code,/^pub fn answer\(\) \{ 42 \}/m);
  assert.equal((await gleam(code)).answer(),42); assert.match(importCode(x,'blanks'),/\{ todo \}/);
  st.S = {_dr:{'test|1':'8'}}; assert.equal((await gleam(importCode(x,'mine'))).answer(),8); st.S={};
});

test('displayed Python imports have valid syntax, including tracebacks and omitted implementations', () => {
  const files = bank.exams.flatMap(e=>e.p.filter(p=>!p.run).map(p=>findAnyProblem(p.id))).filter(x=>x.lang==='py'&&x.hasCode).map(x=>({id:x.p.id,code:importCode(x,'solution')}));
  const errors = python(`import ast,json,sys\nbad=[]\nfor x in json.load(sys.stdin):\n try: ast.parse(x['code'])\n except SyntaxError as e: bad.append(x['id']+': '+str(e))\nprint(json.dumps(bad))`,files);
  assert.deepEqual(errors,[]);
});
