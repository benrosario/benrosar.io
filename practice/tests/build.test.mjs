// The build is reproducible, the deployed folder and the local preview copy agree with it, every course builds, and
// the analytics Worker records the study collection.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, ROOT, COURSES } from '../scripts/build.mjs';
import { compare, DEFAULT_PREVIEW } from '../scripts/sync-preview.mjs';
import worker from '../worker.js';

const a = mkdtempSync(join(tmpdir(), 'practice-a-')), b = mkdtempSync(join(tmpdir(), 'practice-b-'));
await build(a); await build(b);

test('two builds are identical (content-hashed asset names)', () => {
  assert.deepEqual(compare(a, b), []);
  const html = readFileSync(join(a, 'index.html'), 'utf8');
  assert.match(html, /assets\/app\.[0-9a-f]{10}\.js/);
  assert.match(html, /data-content="\/assets\/content\.[0-9a-f]{10}\.json"/);
});

test('the service worker and the background download list exactly the files the build serves', () => {
  const html = readFileSync(join(a, 'index.html'), 'utf8'), sw = readFileSync(join(a, 'sw.js'), 'utf8');
  const R = JSON.parse(html.match(/<script type="application\/json" id="runtimes">(.*?)<\/script>/)[1]);
  const M = JSON.parse(sw.match(/const MANIFEST = (\{.*?\});/)[1]);
  assert.deepEqual(M.shell, R.shell);
  assert.equal(M.shell[0], '/');
  for (const u of M.shell.slice(1)) assert.ok(existsSync(join(a, u)), u);
  assert.deepEqual(M.runtimes, [R.py.base, R.gleam.base]);
  for (const l of ['py', 'gleam']) for (const [f, size] of R[l].files) assert.equal(readFileSync(join(a, R[l].base, f)).length, size, R[l].base + f);
  assert.ok(R.py.files.some(([f]) => f === 'pyodide.asm.wasm') && R.py.files.some(([f]) => f === 'sqlite3-1.0.0.zip'));
  assert.match(html, /data-py-worker="\/assets\/py-worker\.[0-9a-f]{10}\.js" data-py-base="\/assets\/pyodide\/0\.26\.4\/"/);
  assert.doesNotMatch(html + readFileSync(join(a, R.shell.find(u => /app\./.test(u))), 'utf8'), /cdn\.jsdelivr\.net/, 'Python is served by the site');
  assert.equal(readFileSync(join(a, '_headers'), 'utf8'), '/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/sw.js\n  Cache-Control: no-cache\n');
});

test('practice/public/61a (what wrangler deploys) matches a fresh build', { skip: !existsSync(join(ROOT, 'public/61a/index.html')) && 'not built yet' }, () => {
  assert.deepEqual(compare(a, join(ROOT, 'public/61a')), [], 'run npm run practice:build');
});

test('the exam-practice preview copy matches a fresh build', { skip: !existsSync(join(DEFAULT_PREVIEW, '.preview-manifest.json')) && 'no synced preview' }, () => {
  assert.deepEqual(compare(a, DEFAULT_PREVIEW), [], 'run npm run practice:sync');
});

test('every course builds; one with no languages has no runtimes, workers or playground data', async () => {
  const out = {};
  for (const id of COURSES.filter(id => id !== '61a')) await build(out[id] = mkdtempSync(join(tmpdir(), `practice-${id}-`)), { course: id });
  const c = out['61b'];
  const html = readFileSync(join(c, 'index.html'), 'utf8'), sw = readFileSync(join(c, 'sw.js'), 'utf8');
  const course = JSON.parse(html.match(/<script type="application\/json" id="course">(.*?)<\/script>/)[1]);
  assert.equal(course.id, '61b'); assert.deepEqual(course.langs, []);
  assert.match(html, /<title>cs61b practice<\/title>/); assert.match(html, /localStorage\.getItem\("cs61b-practice-v2"\)/);
  assert.deepEqual(Object.keys(JSON.parse(html.match(/id="runtimes">(.*?)<\/script>/)[1])), ['shell']);
  assert.deepEqual(JSON.parse(sw.match(/const MANIFEST = (\{.*?\});/)[1]).runtimes, []);
  assert.doesNotMatch(html, /data-(py|gleam)-/);
  assert.ok(!existsSync(join(c, 'assets/pyodide')) && !existsSync(join(c, 'assets/gleam')));
  assert.equal('prelude' in JSON.parse(readFileSync(join(c, html.match(/data-content="\/(assets\/content\.[0-9a-f]+\.json)"/)[1]), 'utf8')), false);
  const bank = JSON.parse(readFileSync(join(c, html.match(/data-content="\/(assets\/content\.[0-9a-f]+\.json)"/)[1]), 'utf8'));
  const midterm1 = bank.collections.find(x => x.id === 'midterm1');
  const final = bank.collections.find(x => x.id === 'final');
  const sourceMidterm1 = bank.exams.filter(x => x.id.endsWith('-mt1')).map(x => x.id);
  assert.deepEqual(midterm1.exams.map(x => x.exam).sort(), sourceMidterm1.sort());
  for (const id of sourceMidterm1) assert.ok(final.exams.some(x => x.exam === id), `${id} missing from final`);
  const sourceFinals = bank.exams.filter(x => x.id.endsWith('-final') && x.id.startsWith('61b-'));
  assert.equal(sourceFinals.length, 15, 'all downloaded 61B Finals are included');
  for (const exam of sourceFinals) {
    assert.ok(final.exams.some(x => x.exam === exam.id), `${exam.id} missing from final collection`);
    assert.ok(exam.p.some(p => p.b.some(b => b.k)), `${exam.id} has no graded questions`);
    assert.match(exam.src.exam, /^https:\/\/drive\.google\.com\/file\/d\/[^/]+\/view$/);
    assert.match(exam.src.sol, /^https:\/\/drive\.google\.com\/file\/d\/[^/]+\/view$/);
  }
  const scoredProblems = {
    sp15: '1,2,3,4,5,7,8,9', sp16: '1,2,3,4,5,6,8,9',
    sp17: '1,2,3,4,5,6,8,9,10', sp18: '1,2,3,4,5,6,7', sp19: '1,2,4,5,6,7,8,9',
  };
  for (const [term, numbers] of Object.entries(scoredProblems)) {
    const exam = bank.exams.find(x => x.id === `61b-${term}-mt1`);
    assert.equal(exam?.p.map(x => x.n).join(), numbers, `${term} scored problems`);
  }
});

test('CS 61A keeps the storage keys its visitors already have', () => {
  const html = readFileSync(join(a, 'index.html'), 'utf8');
  assert.match(html, /localStorage\.getItem\("cs61a-practice-v2"\)/);
  assert.match(html, /<title>cs61a practice<\/title>/);
});

test('the analytics Worker stores the collection in blob8 and accepts study_select', async () => {
  const points = [];
  const body = { u: 'u', s: 's', e: [{ n: 'check', c: 'midterm2', x: '61a-fa25-mt2', q: '61a-fa25-mt2|9', k: 'blank', ok: true, run: true },
    { n: 'study_select', c: 'final', v: 'final' }, { n: 'exam_open', x: '61a-sp23-mt2' }, { n: 'bogus' }] };
  const res = await worker.fetch(new Request('https://practice.benrosar.io/e', { method: 'POST', body: JSON.stringify(body) }), { COURSE: '61b', EVENTS: { writeDataPoint: p => points.push(p) } });
  assert.equal(res.status, 204);
  assert.equal(points.length, 3);
  assert.deepEqual(points[0].blobs, ['check', 'u', 's', '61a-fa25-mt2', '61a-fa25-mt2|9', 'blank', '', 'midterm2', '', '', '61b']);
  assert.deepEqual(points[0].doubles.slice(0, 2), [1, 1]);
  assert.equal(points[1].blobs[5], 'final');
  assert.equal(points[2].blobs[7], '', 'events without a collection keep an empty blob8, like historical ones');
});

test('the analytics Worker stores outcomes, durations and counts', async () => {
  const points = [], body = { u: 'u', s: 's', e: [{ n: 'pg_run', v: 'py-tests', src: 'warm', res: 'failed', ms: 42, cnt: 5, bad: 2 }] };
  await worker.fetch(new Request('https://practice.benrosar.io/e', { method: 'POST', body: JSON.stringify(body) }), { COURSE: '61a', EVENTS: { writeDataPoint: p => points.push(p) } });
  assert.deepEqual(points[0].blobs.slice(8), ['warm', 'failed', '61a']);
  assert.deepEqual(points[0].doubles.slice(5), [42, 5, 2]);
});

test('the analytics Worker accepts every event the page sends', async () => {
  const dir = join(ROOT, 'src/js'), names = new Set();
  // The first argument of each ev() or evOnce() call, including both sides of a ternary. (src/app.js isn't in the build.)
  for (const f of readdirSync(dir).filter(f => f.endsWith('.js'))) for (const [, args] of readFileSync(join(dir, f), 'utf8').matchAll(/\bev\(([^,)]+)[,)]/g))
    for (const [, name] of args.slice(args.indexOf('?') + 1).matchAll(/'([a-z0-9_]+)'/g)) names.add(name);
  for (const f of readdirSync(dir).filter(f => f.endsWith('.js'))) for (const [, name] of readFileSync(join(dir, f), 'utf8').matchAll(/\bevOnce\([^,]+,\s*'([a-z0-9_]+)'/g)) names.add(name);
  assert.ok(names.has('pg_run') && names.has('pg_step') && names.has('save_blocked') && names.size > 25, `found ${names.size} events`);
  const accepted = new Set(), e = [...names].map(n => ({ n }));
  for (let i = 0; i < e.length; i += 50) await worker.fetch(new Request('https://practice.benrosar.io/e', { method: 'POST', body: JSON.stringify({ u: 'u', s: 's', e: e.slice(i, i + 50) }) }), { EVENTS: { writeDataPoint: p => accepted.add(p.blobs[0]) } });
  assert.deepEqual([...names].filter(n => !accepted.has(n)), []);
});

test('the feedback Worker emails the message to FEEDBACK_TO and drops honeypot, empty and rate-limited posts', async () => {
  const sent = []; let allow = true;
  const env = { FEEDBACK_TO: 'owner@example.com', FEEDBACK_FROM: 'feedback@benrosar.io',
    SEND_EMAIL: { send: async m => { sent.push(m); } }, FEEDBACK_LIMIT: { limit: async () => ({ success: allow }) } };
  const post = (body, e = env) => worker.fetch(new Request('https://practice.benrosar.io/f', { method: 'POST', body: JSON.stringify(body) }), e);
  assert.equal((await post({ m: '  Q3 answer looks wrong  ', p: '/?exam=final', c: 'final' })).status, 204);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'owner@example.com');
  assert.equal(sent[0].from, 'feedback@benrosar.io');
  assert.match(sent[0].text, /^Q3 answer looks wrong\n\n--\nPage: \/\?exam=final\nStudying for: final$/);
  assert.equal((await post({ m: 'spam', hp: 'x' })).status, 204, 'a filled honeypot looks like success');
  assert.equal((await post({ m: '   ' })).status, 400);
  allow = false;
  assert.equal((await post({ m: 'again' })).status, 429);
  allow = true;
  assert.equal((await post({ m: 'hi' }, { ...env, FEEDBACK_TO: undefined })).status, 503);
  assert.equal((await post({ m: 'hi' }, { ...env, SEND_EMAIL: { send: async () => { throw new Error('nope'); } } })).status, 502);
  assert.equal(sent.length, 1);
  assert.equal((await worker.fetch(new Request('https://practice.benrosar.io/f'), env)).status, 405);
});
