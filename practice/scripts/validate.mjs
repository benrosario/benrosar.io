// Content checks run by every build (and by the tests): references, ids, answer formats, scope and coverage.
// Returns a list of error strings; an empty list means the bundle is valid.
import { resolveCollection, timedPool, timedLengths, questionTopics, FORMAT_TAGS, QID } from '../src/js/model.js';

const LANGS = new Set(['py', 'scm', 'sql']), KINDS = new Set(['mc', 'sata', 'blank']);
export const KNOWN_TOPICS = new Set(['VARS_AND_FUNCTIONS', 'CONTROL', 'HIGHER_ORDER_FUNCTIONS', 'ENVIRONMENT_DIAGRAMS', 'LAMBDAS', 'RECURSION', 'TREE_RECURSION',
  'SEQUENCES', 'LISTS', 'DATA_ABSTRACTION', 'TREES', 'MUTABILITY', 'ITERATORS', 'GENERATORS', 'OBJECTS', 'INHERITANCE', 'REPRESENTATION', 'MUTABLE_TREES',
  'LINKED_LISTS', 'GROWTH', 'EFFICIENCY', 'INTERPRETERS', 'SQL', 'SCHEME', 'SCHEME_LISTS', 'MACROS', 'TAIL_RECURSION', 'PROGRAMS_AS_DATA', 'NONLOCAL',
  'SELF_REFERENCE', 'BNF', 'REGEX', 'UNTAGGED', 'WWPD', 'SCHEME_DATA_ABSTRACTION']);

function checkSegs(segs, where, E) {
  if (!Array.isArray(segs) || !segs.length) return E.push(`${where}: empty text`);
  for (const g of segs) {
    const kinds = ['p', 'c', 'h'].filter(k => g[k] != null);
    if (kinds.length !== 1) { E.push(`${where}: segment needs exactly one of p/c/h`); continue; }
    if (g.c != null) {
      if (!LANGS.has(g.lang)) E.push(`${where}: code has unknown lang ${g.lang}`);
      for (const k in g.f || {}) if (!g.c.includes('⟪' + k + '⟫')) E.push(`${where}: answer fill (${k}) has no ⟪${k}⟫ blank`);
    }
  }
}
export function checkProblem(p, where, E) {
  const seen = new Set();
  if (!p.t) E.push(`${where}: missing title`);
  if (!Array.isArray(p.b) || !p.b.some(b => b.k)) E.push(`${where}: no questions`);
  for (const b of p.b || []) {
    if (b.s) { checkSegs(b.s, where, E); continue; }
    const w = `${where} q${b.id}`;
    if (!Number.isInteger(b.id) && typeof b.id !== 'string') E.push(`${w}: bad id`);
    if (seen.has(b.id)) E.push(`${w}: duplicate question id in problem`); seen.add(b.id);
    if (!KINDS.has(b.k)) { E.push(`${w}: unknown kind ${b.k}`); continue; }
    checkSegs(b.l, w, E);
    if (b.k == 'mc' && !(Array.isArray(b.o) && b.o.length > 1 && Number.isInteger(b.a) && b.a >= 0 && b.a < b.o.length)) E.push(`${w}: multiple choice needs options and an answer index`);
    if (b.also && !(b.k == 'mc' && Array.isArray(b.also) && b.also.every(i => Number.isInteger(i) && i >= 0 && i < b.o.length && i !== b.a))) E.push(`${w}: bad also-accepted choices`);
    if (b.k == 'sata' && !(Array.isArray(b.o) && Array.isArray(b.a) && b.a.length && b.a.every(i => Number.isInteger(i) && i >= 0 && i < b.o.length) && new Set(b.a).size == b.a.length)) E.push(`${w}: select-all needs options and answer indexes`);
    if (b.k == 'blank' && !(Array.isArray(b.a) && b.a.length && b.a.every(x => typeof x == 'string' && x.trim()))) E.push(`${w}: blank needs accepted answers`);
    if (b.r) {
      if (!p.run) E.push(`${w}: runs code but the problem has no run section`);
      else for (const id of b.r) {
        if (!(id in p.run.b) || !(id in p.run.ch)) E.push(`${w}: unknown code blank ${id}`);
        else if (!p.run.c[p.run.ch[id]]?.includes('⟦' + id + '⟧')) E.push(`${w}: code blank ${id} not in its chunk`);
      }
    }
  }
  if (p.run) for (const id in p.run.v || {}) if (!(id in p.run.b)) E.push(`${where}: run value for unknown blank ${id}`);
}

export function validate(bank) {
  const E = [], examIds = new Set(), probIds = new Set();
  for (const e of bank.exams) {
    if (examIds.has(e.id)) E.push(`duplicate exam id ${e.id}`); examIds.add(e.id);
    if (!e.t) E.push(`${e.id}: missing title`);
    if (!e.src?.exam || !e.src?.sol) E.push(`${e.id}: missing source links`);
    const qids = new Set();
    for (const p of e.p) {
      if (p.id !== `${e.id}/${p.n}`) E.push(`${e.id}: problem id ${p.id} should be ${e.id}/${p.n}`);
      if (probIds.has(p.id)) E.push(`duplicate problem id ${p.id}`); probIds.add(p.id);
      checkProblem(p, p.id, E);
      for (const b of p.b) if (b.k) { if (qids.has(b.id)) E.push(`${QID(e.id, b)}: duplicate question id in exam`); qids.add(b.id); }
      for (const t of (p.topics || []).flatMap(x => x.t)) if (!KNOWN_TOPICS.has(t)) E.push(`${p.id}: unknown staff topic ${t}`);
    }
  }
  for (const k in bank.timed) {
    const ids = new Set();
    for (const p of bank.timed[k]) { if (ids.has(p.id)) E.push(`timed ${k}: duplicate id ${p.id}`); ids.add(p.id); if (!p.src) E.push(`timed ${k}/${p.id}: missing source`); checkProblem(p, `timed ${k}/${p.id}`, E); }
  }
  const EX = Object.fromEntries(bank.exams.map(e => [e.id, e]));
  for (const C of bank.collections) {
    const w = `collection ${C.id}`;
    if (!C.label || !C.sub || !C.coverage?.text || !C.timed?.intro) E.push(`${w}: missing label, subtitle, coverage or timed intro`);
    if (C.scope.basis === 'topics') for (const t of C.scope.topics) if (!KNOWN_TOPICS.has(t) || FORMAT_TAGS.has(t)) E.push(`${w}: bad scope topic ${t}`);
    const listed = new Set();
    for (const ce of C.exams) {
      const e = EX[ce.exam]; if (!e) { E.push(`${w}: unknown exam ${ce.exam}`); continue; }
      if (listed.has(ce.exam)) E.push(`${w}: exam ${ce.exam} listed twice`); listed.add(ce.exam);
      const q = new Set(e.p.flatMap(p => p.b.filter(b => b.k).map(b => b.id))), pids = new Set(e.p.map(p => p.id));
      for (const k of ['oos', 'keep', 'drop']) for (const id of ce[k] || []) if (!q.has(id)) E.push(`${w}: ${k} names unknown question ${ce.exam}|${id}`);
      for (const k in ce.picks || {}) for (const id of ce.picks[k]) if (!q.has(id)) E.push(`${w}: pick names unknown question ${ce.exam}|${id}`);
      for (const k in ce.dropWhy || {}) if (!(ce.drop || []).includes(+k)) E.push(`${w}: dropWhy for a question not dropped (${ce.exam}|${k})`);
      for (const id of [...(ce.problems || []), ...Object.keys(ce.tips || {})]) if (!pids.has(id)) E.push(`${w}: unknown problem ${id}`);
    }
    let V; try { V = resolveCollection(bank, C.id); } catch (err) { E.push(`${w}: ${err.message}`); continue; }
    const live = V.exams.flatMap(ex => ex.problems.flatMap(P => P.qs.filter(x => !x.oos)));
    if (!live.length) E.push(`${w}: no in-scope questions`);
    for (const ex of V.exams) if (!ex.problems.length) E.push(`${w}: ${ex.id} has no problems in scope`);
    // Topic-based scope needs staff tags (or an explicit keep/drop) for every question it counts or excludes.
    if (C.scope.basis === 'topics') for (const ex of V.exams) for (const P of ex.problems) for (const x of P.qs)
      if (!questionTopics(P.p, x.q) && !(C.exams.find(c => c.exam == ex.id).keep || []).includes(x.q.id) && !(C.exams.find(c => c.exam == ex.id).drop || []).includes(x.q.id)) E.push(`${w}: ${x.qid} has no topic tags and no keep/drop decision`);
    const T = C.timed;
    if (T.pool === 'modified' && !bank.timed[T.set]) E.push(`${w}: unknown timed set ${T.set}`);
    const pool = timedPool(bank, V);
    for (const L of timedLengths(V, pool)) if (!L.ok) E.push(`${w}: timed length ${L.min} min needs ${L.count} problems; the pool has ${pool.length} in ${new Set(pool.map(x => x.bucket)).size} topic groups`);
  }
  if (bank.collections.map(c => c.id).join() !== 'midterm1,midterm2,midterm3,final') E.push('collections must be midterm1, midterm2, midterm3, final in that order');
  if (!bank.collections.some(c => c.id === bank.defaultCollection)) E.push('defaultCollection is not a collection');
  return E;
}
