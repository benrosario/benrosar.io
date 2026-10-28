// Storage migration: representative saved data from before study collections (schema 2) keeps everything.
import test from 'node:test';
import assert from 'node:assert/strict';
import { migrate, load, KEY, BACKUP } from '../src/js/store.js';

const legacyOrder = ['61a-sp23-mt2', '61a-su23-final', '61a-fa23-mt2', '61a-sp24-mt2'];
const ctx = { legacyOrder, defaultCollection: 'final', collections: ['midterm1', 'midterm2', 'midterm3', 'final'] };
const clone = x => JSON.parse(JSON.stringify(x));
// Shaped like a real schema-2 save: answers, preferences, navigation, an active attempt and history.
const LEGACY = {
  _uid: 'abc', _theme: 'dark', _hl: false, _sw: 400, _zoom: 1.2, _ex: 2, _f: 'no', _open: { '61a-fa23-mt2': 1 }, _fo: { '61a-sp23-mt2': 0 },
  _tm: { dur: 3e6, left: 3e6, end: 0, up: false, snd: true }, _ptlen: 110, _ptseen: { suffix: 2 }, _view: '',
  '61a-sp23-mt2|1': { v: '[1, [3]]', ok: true, m: 'Matches the official answer', gv: 4 },
  '61a-fa23-mt2|13': { v: [0, 2], ok: false, gv: 4 },
  _pt: { min: 50, ids: ['suffix', 'rises'], start: 1000, end: 3001000, ans: { '0|1': 'sum(s[k:])' } },
  _pth: [{ d: 5000, min: 110, ok: 20, n: 40, used: 6000, ids: ['in-order'], ans: {}, res: {}, start: 1, end: 2, sub: 5000, done: 1 }, { d: 4000, min: 50, ok: 3, n: 20, used: 100 }],
};

test('schema 2 data migrates without losing anything', () => {
  const S = migrate(clone(LEGACY), ctx);
  assert.equal(S._sv, 3);
  assert.equal(S._c, 'midterm3', 'returning users keep Midterm 3');
  assert.deepEqual(S._cs.midterm3, { ex: '61a-fa23-mt2', f: 'no', open: { '61a-fa23-mt2': 1 }, fo: { '61a-sp23-mt2': 0 }, ptlen: 110 });
  for (const k of ['_uid', '_theme', '_hl', '_sw', '_zoom', '_tm', '_ptseen', '61a-sp23-mt2|1', '61a-fa23-mt2|13']) assert.deepEqual(S[k], LEGACY[k], k);
  // The active attempt keeps its deadline and answers and is labeled as a Midterm 3 attempt from the modified pool.
  assert.deepEqual({ ...S._pt }, { ...LEGACY._pt, c: 'midterm3', pool: 'modified', set: 'midterm3', cv: 'legacy' });
  assert.equal(S._pth.length, 2);
  assert.ok(S._pth.every(h => h.c === 'midterm3' && h.cv === 'legacy'));
  // Old fields stay, so an older build of the page still works after a rollback.
  for (const k of ['_ex', '_f', '_open', '_fo', '_ptlen']) assert.deepEqual(S[k], LEGACY[k], k);
});

test('migration is repeatable', () => {
  const once = migrate(clone(LEGACY), ctx), twice = migrate(clone(once), ctx);
  assert.deepEqual(twice, once);
});

test('new visitors start on the default collection; a bad saved collection falls back', () => {
  assert.equal(migrate({}, ctx)._c, 'final');
  assert.equal(migrate({ _uid: 'x' }, ctx)._c, 'final');
  assert.equal(migrate({ _sv: 3, _c: 'nope', _cs: {} }, ctx)._c, 'final');
});

test('odd or damaged values are handled', () => {
  assert.equal(migrate({ _ex: 99 }, ctx)._cs.midterm3.ex, legacyOrder[0]);
  assert.deepEqual(migrate({ _pth: 'junk' }, ctx)._pth, []);
  assert.equal(migrate(null, ctx)._sv, 3);
});

function fakeStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), map: m };
}
test('load backs up the schema 2 copy once and never discards unreadable data', () => {
  const raw = JSON.stringify(LEGACY), ls = fakeStorage({ [KEY]: raw });
  const S = load({ ...ctx }, ls);
  assert.equal(S._c, 'midterm3');
  assert.equal(ls.getItem(BACKUP), raw);
  ls.setItem(KEY, JSON.stringify(S)); load({ ...ctx }, ls);
  assert.equal(ls.getItem(BACKUP), raw, 'backup is not overwritten');
  const bad = fakeStorage({ [KEY]: '{not json' });
  assert.equal(load({ ...ctx }, bad)._c, 'final');
  assert.equal(bad.getItem(KEY + ':unreadable'), '{not json');
});
