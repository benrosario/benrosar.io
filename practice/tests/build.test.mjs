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
