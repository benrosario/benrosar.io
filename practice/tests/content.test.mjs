// Content and collection checks: valid references, unique ids, answer formats, scope, recommendations and coverage.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBank } from '../scripts/build.mjs';
import { validate } from '../scripts/validate.mjs';
import { resolveCollection, counts, collectionCounts, sharedIn, questionTopics, timedPool, timedLengths, pickTimed, QID, sortExams, sortOptions } from '../src/js/model.js';

const bank = await loadBank();
const views = Object.fromEntries(bank.collections.map(c => [c.id, resolveCollection(bank, c.id)]));
const find = (cid, qid) => views[cid].exams.flatMap(ex => ex.problems.flatMap(P => P.qs)).find(x => x.qid === qid);

test('the content bundle validates (references, ids, answer formats, timed pools)', () => {
  assert.deepEqual(validate(bank), []);
});

test('every source question is stored once with a permanent id', () => {
  const qids = bank.exams.flatMap(e => e.p.flatMap(p => p.b.filter(b => b.k).map(b => QID(e.id, b))));
  assert.equal(new Set(qids).size, qids.length);
  const pids = bank.exams.flatMap(e => e.p.map(p => p.id));
  assert.equal(new Set(pids).size, pids.length);
  // Ids saved answers have always used still exist (spot checks from before study collections).
  for (const id of ['61a-sp23-mt2|1', '61a-fa25-mt2|34', '61a-su23-final|104', '61a-sp26-mt2|34']) assert.ok(qids.includes(id), id);
});

test('the four study options exist in order, each with in-scope questions', () => {
  assert.deepEqual(bank.collections.map(c => c.id), ['midterm1', 'midterm2', 'midterm3', 'final']);
  for (const v of Object.values(views)) assert.ok(collectionCounts({}, v).n > 50, v.id);
});

test('Midterm 3 keeps the original curation exactly', () => {
  const v = views.midterm3;
  assert.deepEqual(v.exams.map(e => e.id), bank.legacyOrder);
  // Per-exam counted questions, as the sidebar showed them before (n of "0/n").
  assert.deepEqual(v.exams.map(e => counts({}, e).n), [18, 104, 24, 26, 71, 30, 28, 59, 32, 26]);
  assert.equal(find('midterm3', '61a-sp23-mt2|4').oos, true); // "Staff say to skip: 2"
  assert.deepEqual(find('midterm3', '61a-fa25-mt2|30').tags, ['dn']);
  assert.ok(v.exams.every(e => !e.partial));
});

test('out of scope is relative to the selected study option', () => {
  // A list-mutation question: excluded from Midterm 2 (taught later), counted on the final.
  const q = '61a-sp24-mt2|19';
  assert.equal(find('midterm2', q).oos, true);
  assert.match(find('midterm2', q).why, /mutation/);
  assert.equal(find('final', q).oos, false);
  // Staff skipped 2(c) of Fall 2024 Midterm 2 for Midterm 3; it is an efficiency question, which is on the final.
  assert.equal(find('midterm3', '61a-fa24-mt2|8').oos, true);
  assert.equal(find('final', '61a-fa24-mt2|8').oos, false);
  // Scheme isn't on the Fall 2026 topic list, so Scheme parts are out of scope for the final.
  const scheme = find('final', '61a-su23-final|7');
  assert.equal(scheme.oos, true); assert.match(scheme.why, /Scheme/);
  // Midterm 1 doesn't include recursion.
  assert.equal(views.midterm1.exams.some(ex => ex.problems.some(P => P.qs.some(x => !x.oos && (questionTopics(P.p, x.q) || []).includes('RECURSION')))), false);
});

test('recommendations belong to their collection', () => {
  const tagged = cid => views[cid].exams.flatMap(ex => ex.problems.flatMap(P => P.qs.filter(x => x.tags.length))).length;
  assert.equal(tagged('midterm3'), 61); // 47 DeNero and 16 CSM picks; two questions have both
  for (const cid of ['midterm1', 'midterm2', 'final']) { assert.equal(tagged(cid), 0); assert.ok(views[cid].noPicks); }
});

test('a shared question counts toward every collection that includes it', () => {
  const qid = '61a-fa26-mt1|7', S = { [qid]: { v: 'x', ok: true } };
  assert.deepEqual(sharedIn(Object.values(views), qid), ['midterm1', 'final']);
  assert.equal(collectionCounts(S, views.midterm1).ok, 1);
  assert.equal(collectionCounts(S, views.final).ok, 1);
  assert.equal(collectionCounts(S, views.midterm3).ok, 0);
  // An answer to an out-of-scope question doesn't count anywhere it's out of scope.
  const oos = { '61a-sp24-mt2|19': { v: 'x', ok: true } };
  assert.equal(collectionCounts(oos, views.midterm2).ok, 0);
  assert.equal(collectionCounts(oos, views.final).ok, 1);
});

test('the final covers material from after Midterm 3 and every earlier segment', () => {
  const live = views.final.exams.flatMap(ex => ex.problems.flatMap(P => P.qs.filter(x => !x.oos).map(x => questionTopics(P.p, x.q) || [])));
  const has = t => live.some(x => x.includes(t));
  for (const t of ['SQL', 'CONTROL', 'RECURSION', 'LINKED_LISTS', 'TREES', 'OBJECTS', 'GENERATORS', 'EFFICIENCY']) assert.ok(has(t), t);
  assert.ok(views.final.exams.some(e => e.id === '61a-fa25-final'));
});

test('timed pools are collection specific and lengths match what the pool supports', () => {
  const pools = Object.fromEntries(Object.values(views).map(v => [v.id, timedPool(bank, v)]));
  assert.equal(pools.midterm3.length, 13); // the modified-problem pool, unchanged
  assert.ok(pools.midterm3.every(x => bank.timed.midterm3.some(p => p.id === x.id)));
  for (const v of Object.values(views)) for (const L of timedLengths(v, pools[v.id])) assert.ok(L.ok, `${v.id} ${L.min}`);
  assert.deepEqual(views.final.timed.lengths.map(L => [L.min, L.count]), [[50, 3], [110, 6], [180, 9]]);
  // A pool too small for a length is not offered.
  assert.equal(timedLengths(views.final, pools.final.slice(0, 2)).every(L => !L.ok), true);
  // No A+ (0 point) problems in timed pools.
  assert.ok(pools.final.every(x => !/\(0(\.0)? pts\)/.test(bank.exams.flatMap(e => e.p).find(p => p.id === x.id).t)));
});

test('the comprehensive final draws a balanced mix', () => {
  const pool = timedPool(bank, views.final);
  let seed = 7; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 25; i++) {
    const short = pickTimed(pool, 3, {}, true, rand).map(id => pool.find(x => x.id === id));
    assert.equal(new Set(short.map(x => x.bucket)).size, 3, 'the 50-minute final mixes 3 topic groups');
    const ids = pickTimed(pool, 9, {}, true, rand), picked = ids.map(id => pool.find(x => x.id === id));
    assert.equal(new Set(ids).size, 9);
    assert.ok(new Set(picked.map(x => x.bucket)).size >= 4, 'topic groups');
    assert.ok(picked.some(x => x.bucket === 'sql'), 'SQL from after Midterm 3');
    assert.ok(new Set(picked.map(x => x.exam)).size >= 8, 'source exams');
  }
  // Least-used problems are drawn first.
  const seen = Object.fromEntries(pool.map(x => [x.id, 5])); seen[pool[0].id] = 0;
  assert.ok(pickTimed(pool, 6, seen, true, rand).includes(pool[0].id));
});

test('sidebar sorting: date, answered, direction and ties', () => {
  const v = views.final, ids = (by, desc, S = {}) => sortExams(v, S, by, desc).map(i => v.exams[i].id);
  assert.deepEqual(ids('suggested', false), v.exams.map(e => e.id));
  assert.deepEqual(ids('suggested', true), v.exams.map(e => e.id).reverse());
  // Newest first; within a term the order the exams were given (final after the midterms).
  assert.deepEqual(ids('date', true).slice(0, 5), ['61a-fa26-mt1', '61a-sp26-mt2', '61a-fa25-final', '61a-fa25-mt2', '61a-fa25-mt1']);
  // Oldest first is the reverse, except that the undated adapted set stays last.
  assert.deepEqual(ids('date', false).slice(0, -1), ids('date', true).slice(0, -1).reverse());
  assert.equal(ids('date', false).at(-1), '61a-fa26-gleam-adapted');
  assert.equal(ids('date', true).at(-1), '61a-fa26-gleam-adapted');
  // There's no exam-type sort; a saved one falls back to the suggested order.
  assert.ok(!sortOptions(v).includes('kind'));
  assert.deepEqual(ids('kind', false), ids('suggested', false));
  // Answered and progress count only this collection's in-scope questions.
  const S = { '61a-sp23-mt2|1': { v: 'x', ok: true }, '61a-sp23-mt2|2': { v: 'y', ok: false }, '61a-fa25-mt1|1': { v: 'z', ok: true } };
  assert.deepEqual(ids('answered', true, S).slice(0, 2), ['61a-sp23-mt2', '61a-fa25-mt1']);
  assert.equal(ids('progress', true, S)[0], '61a-fa25-mt1');
  assert.equal(ids('answered', false, S).includes('61a-sp23-mt2'), true);
  // Staff picks are only offered where a collection has them.
  assert.ok(sortOptions(views.midterm3).includes('picks'));
  assert.ok(!sortOptions(views.final).includes('picks'));
  assert.equal(ids('nonsense', false).join(), ids('suggested', false).join());
  // Ties (equal answered counts) go to the newest exam.
  assert.equal(ids('answered', false)[0], '61a-fa26-mt1');
});

test('Gleam replaces Scheme on the final: adapted problems count, Scheme stays out with the reason', async () => {
  const { grade, isGleam, howChecked } = await import('../src/js/grading.js');
  const ex = views.final.exams.find(e => e.id === '61a-fa26-gleam-adapted');
  assert.ok(ex && counts({}, ex).n >= 30, 'adapted Gleam problems are in the final');
  assert.ok(ex.problems.every(P => P.p.adapted?.from && P.p.adapted.problem), 'every adapted problem names its original');
  assert.match(find('final', '61a-su23-final|7').why, /Gleam replaced it/);
  // Gleam is only on the final (it's taught after Midterm 3).
  for (const cid of ['midterm1', 'midterm2', 'midterm3']) assert.ok(!views[cid].exams.some(e => e.id === '61a-fa26-gleam-adapted'));
  // The final's timed pool has a Gleam group.
  assert.ok(timedPool(bank, views.final).filter(x => x.bucket === 'gleam').length >= 3);
  // Gleam text answers are case-sensitive (Ok is not ok); other languages aren't.
  const P = ex.problems.find(P => P.p.id.endsWith('/3')).p, q = P.b.find(b => b.id === 25);
  assert.ok(isGleam(P));
  assert.equal((await grade({ ...q, ev: undefined }, 'Error(Nil)', P)).ok, true);
  assert.equal((await grade({ ...q, ev: undefined }, 'error(nil)', P)).ok, false);
  assert.match(howChecked(q, P), /compiling your answer in Gleam/);
  assert.match(howChecked(P.b.find(b => b.id === 19), P), /compiling your code and running the problem’s tests in Gleam/);
});
