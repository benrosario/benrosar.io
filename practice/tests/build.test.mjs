// The build is reproducible, the deployed folder and the local preview copy agree with it, and the analytics Worker
// records the study collection.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, ROOT } from '../scripts/build.mjs';
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

test('practice/public (what wrangler deploys) matches a fresh build', { skip: !existsSync(join(ROOT, 'public/index.html')) && 'not built yet' }, () => {
  assert.deepEqual(compare(a, join(ROOT, 'public')), [], 'run npm run practice:build');
});

test('the exam-practice preview copy matches a fresh build', { skip: !existsSync(join(DEFAULT_PREVIEW, '.preview-manifest.json')) && 'no synced preview' }, () => {
  assert.deepEqual(compare(a, DEFAULT_PREVIEW), [], 'run npm run practice:sync');
});

test('the analytics Worker stores the collection in blob8 and accepts study_select', async () => {
  const points = [];
  const body = { u: 'u', s: 's', e: [{ n: 'check', c: 'midterm2', x: '61a-fa25-mt2', q: '61a-fa25-mt2|9', k: 'blank', ok: true, run: true },
    { n: 'study_select', c: 'final', v: 'final' }, { n: 'exam_open', x: '61a-sp23-mt2' }, { n: 'bogus' }] };
  const res = await worker.fetch(new Request('https://practice.benrosar.io/e', { method: 'POST', body: JSON.stringify(body) }), { EVENTS: { writeDataPoint: p => points.push(p) } });
  assert.equal(res.status, 204);
  assert.equal(points.length, 3);
  assert.deepEqual(points[0].blobs, ['check', 'u', 's', '61a-fa25-mt2', '61a-fa25-mt2|9', 'blank', '', 'midterm2']);
  assert.deepEqual(points[0].doubles.slice(0, 2), [1, 1]);
  assert.equal(points[1].blobs[5], 'final');
  assert.equal(points[2].blobs[7], '', 'events without a collection keep an empty blob8, like historical ones');
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
