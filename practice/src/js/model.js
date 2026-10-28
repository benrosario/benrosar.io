// Pure data logic shared by the app, the build and the Node tests (no DOM, no storage).
//
// Content model
//   bank.exams[]       source exams, each stored once: {id, t (original title), src (provenance), p: problems}
//   problem            {id (permanent, "<exam>/<n>"), n, t, b: blocks, run?, topics?: [{n, t}] staff topic tags}
//   question block     {id (number, unique in its exam), k: mc|sata|blank, l, a, o?, r?, x?, part?, sub?}
//   question id (qid)  "<exam id>|<question id>", the key saved answers have always used
//   bank.collections[] study options ("Studying for"), each referencing shared content with its own scope,
//                      recommendations, notes and timed-practice settings
export const QID = (examId, q) => examId + '|' + q.id;
const ROMAN = /^(i|ii|iii|iv|v|vi|vii|viii|ix|x)\.(\s|$)/;
const PART = /^\(([a-z])\s?\)/;
// Tags in the staff index that describe a question's format rather than a topic.
export const FORMAT_TAGS = new Set(['WWPD']);

// Which part (a, b, ...) and sub-part (i, ii, ...) each question belongs to, from the problem's headers and labels.
export function questionParts(p) {
  const out = {}; let hdr = null;
  for (const b of p.b) {
    if (b.s) { for (const g of b.s) { const m = g.h && g.h.match(PART); if (m) hdr = m[1]; } continue; }
    const label = (b.l.find(g => g.p != null)?.p || '').trim();
    if (hdr) out[b.id] = { part: hdr, sub: label.match(ROMAN)?.[1] || null };
    else out[b.id] = { part: label.match(PART)?.[1] || null, sub: null };
  }
  return out;
}

// Staff numbers look like "3", "3a", "3a,b,c", "6b.i", "3c,e" or (typo) "33.a.iii".
export function parseStaffNum(n) {
  const rest = String(n).replace(/^\d+\.?/, '');
  if (!rest) return { parts: null, sub: null };
  const [letters, sub] = rest.split('.');
  return { parts: letters.split(',').map(x => x.trim()).filter(Boolean), sub: sub || null };
}

// The staff topic tags that apply to one question, or null when the problem has no staff tags.
// A question whose part can't be matched to a tagged part gets the union of every part's tags (the conservative choice).
export function questionTopics(p, q) {
  if (!p.topics?.length) return null;
  const E = p.topics.map(x => ({ ...parseStaffNum(x.n), t: x.t }));
  const whole = E.filter(x => !x.parts);
  const hit = E.filter(x => x.parts && q.part && x.parts.includes(q.part) && (!x.sub || !q.sub || x.sub === q.sub));
  const use = hit.length ? [...hit, ...whole] : E;
  return [...new Set(use.flatMap(x => x.t))].sort();
}

const byId = list => Object.fromEntries(list.map(x => [x.id, x]));

// Resolve a collection against the bank into what the app shows: source exams in collection order, each with the
// problems it includes and, per question, whether it counts (in scope), why not, and any recommendation tags.
export function resolveCollection(bank, cid) {
  const C = bank.collections.find(c => c.id === cid);
  if (!C) throw new Error('unknown collection ' + cid);
  const EX = bank._ex || (bank._ex = byId(bank.exams));
  const allowed = C.scope.basis === 'topics' ? new Set(C.scope.topics) : null;
  const exams = C.exams.map(ce => {
    const e = EX[ce.exam];
    if (!e) throw new Error(`${cid}: unknown exam ${ce.exam}`);
    const oos = new Set(ce.oos || []), keep = new Set(ce.keep || []), drop = new Set(ce.drop || []);
    const tags = {};
    for (const k in ce.picks || {}) for (const id of ce.picks[k]) (tags[id] = tags[id] || []).push(k);
    const problems = [];
    for (const p of e.p) {
      if (ce.problems && !ce.problems.includes(p.id)) continue;
      const qs = p.b.filter(b => b.k).map(q => {
        let out = false, why = '';
        if (oos.has(q.id)) { out = true; why = ce.oosWhy?.[q.id] || C.scope.skipText || 'Out of scope'; }
        else if (allowed && !keep.has(q.id)) {
          const t = questionTopics(p, q);
          if (drop.has(q.id)) { out = true; why = ce.dropWhy?.[q.id] || 'Not covered on this exam'; }
          else if (!t) { out = true; why = 'No topic tags, so not counted'; }
          else {
            const miss = t.filter(x => !FORMAT_TAGS.has(x) && !allowed.has(x));
            // A collection can explain a topic it leaves out (e.g. Scheme: "Gleam replaced it this semester").
            if (miss.length) { out = true; why = miss.map(x => C.scope.why?.[x]).find(Boolean) || 'Not covered: ' + miss.map(topicName).join(', '); }
          }
        }
        return { q, qid: QID(e.id, q), oos: out, why, tags: tags[q.id] || [] };
      });
      // Topic-based collections leave out problems with nothing in scope (shared text stays intact for the rest).
      if (allowed && !ce.problems && !qs.some(x => !x.oos)) continue;
      problems.push({ p, qs, tips: ce.tips?.[p.id] || null });
    }
    return { e, id: e.id, t: e.t, note: ce.note || '', skip: ce.skip || [], problems, partial: problems.length < e.p.length, total: e.p.length };
  });
  return { ...C, exams };
}

// Progress for one exam (or one problem) in a resolved collection: only in-scope questions count.
export function counts(S, ex, prob) {
  let n = 0, ok = 0, a = 0;
  for (const P of prob ? [prob] : ex.problems) for (const x of P.qs) { if (x.oos) continue; n++; const s = S[x.qid]; if (s) { a++; if (s.ok) ok++; } }
  return { n, ok, a };
}
export function collectionCounts(S, view) {
  const t = { n: 0, ok: 0, a: 0 };
  for (const ex of view.exams) { const c = counts(S, ex); t.n += c.n; t.ok += c.ok; t.a += c.a; }
  return t;
}
// Every collection that includes (and counts) a question, by label: used to explain shared progress and resets.
export function sharedIn(views, qid) {
  return views.filter(v => v.exams.some(ex => ex.problems.some(P => P.qs.some(x => x.qid === qid && !x.oos)))).map(v => v.id);
}

// ---- timed practice ----
// Pool entries: {id, bucket, src} where id names a modified problem (pool "modified") or a source problem ("source").
export function timedPool(bank, view) {
  const T = view.timed;
  if (T.pool === 'modified') return (bank.timed[T.set] || []).map(p => ({ id: p.id, bucket: p.bucket || 'all', src: p.src }));
  const out = [];
  for (const ex of view.exams) for (const P of ex.problems) {
    const live = P.qs.filter(x => !x.oos);
    if (live.length < (T.minQuestions || 1)) continue;
    if (/\(0(\.0)? pts\)$/.test(P.p.t)) continue; // A+ problems (no points) aren't drawn for timed exams
    if (T.exclude?.includes(P.p.id)) continue;
    out.push({ id: P.p.id, bucket: bucketOf(T, P, view), src: P.p.adapted ? `Adapted to Gleam by this site from ${P.p.adapted.from}` : `${ex.t}, Q${P.p.n}`, exam: ex.id });
  }
  return out;
}
// The topic group a problem belongs to (for balanced selection): the first group whose topics it uses.
function bucketOf(T, P, view) {
  if (!T.buckets) return 'all';
  const t = new Set(P.qs.filter(x => !x.oos).flatMap(x => questionTopics(P.p, x.q) || []));
  for (const b of T.buckets) if (b.topics.some(x => t.has(x))) return b.id;
  return T.buckets.at(-1).id;
}
// Which lengths the pool can support: a length needs `count` problems, and a balanced one needs problems from at least
// `minBuckets` topic groups.
export function timedLengths(view, pool) {
  const buckets = new Set(pool.map(x => x.bucket)).size, T = view.timed;
  return T.lengths.map(L => ({ ...L, ok: pool.length >= L.count && (!T.balanced || buckets >= Math.min(L.count, T.minBuckets || 2)) }));
}
// Draw n problems: least-used first (ties random) so retakes rotate through the pool. When balanced, take problems
// round-robin across topic buckets and avoid repeating a source exam while another option exists.
export function pickTimed(pool, n, seen = {}, balanced = false, rand = Math.random) {
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const ranked = shuffle(pool).sort((a, b) => (seen[a.id] || 0) - (seen[b.id] || 0));
  if (!balanced) return shuffle(ranked.slice(0, n).map(x => x.id));
  const groups = {}; for (const x of ranked) (groups[x.bucket] = groups[x.bucket] || []).push(x);
  const order = shuffle(Object.keys(groups)), out = [], exams = new Set();
  while (out.length < n && order.some(k => groups[k].length)) {
    for (const k of order) {
      if (out.length >= n || !groups[k].length) continue;
      let i = groups[k].findIndex(x => !x.exam || !exams.has(x.exam)); if (i < 0) i = 0;
      const [x] = groups[k].splice(i, 1); out.push(x); if (x.exam) exams.add(x.exam);
    }
  }
  return out.map(x => x.id);
}

// ---- topic names ----
const NAMES = { VARS_AND_FUNCTIONS: 'variables and functions', CONTROL: 'control', HIGHER_ORDER_FUNCTIONS: 'higher-order functions',
  ENVIRONMENT_DIAGRAMS: 'environment diagrams', LAMBDAS: 'lambdas', RECURSION: 'recursion', TREE_RECURSION: 'tree recursion',
  SEQUENCES: 'sequences', LISTS: 'lists', DATA_ABSTRACTION: 'data abstraction', TREES: 'trees', MUTABILITY: 'mutability',
  ITERATORS: 'iterators', GENERATORS: 'generators', OBJECTS: 'objects', INHERITANCE: 'inheritance', REPRESENTATION: 'string representation',
  MUTABLE_TREES: 'mutable trees', LINKED_LISTS: 'linked lists', GROWTH: 'orders of growth', EFFICIENCY: 'efficiency',
  INTERPRETERS: 'interpreters', SQL: 'SQL', SCHEME: 'Scheme', SCHEME_LISTS: 'Scheme lists', MACROS: 'macros', TAIL_RECURSION: 'tail recursion',
  PROGRAMS_AS_DATA: 'programs as data', NONLOCAL: 'nonlocal', SELF_REFERENCE: 'self-reference', BNF: 'BNF', REGEX: 'regular expressions', WWPD: 'what would Python display',
  SCHEME_DATA_ABSTRACTION: 'Scheme data abstraction', GLEAM: 'Gleam', FUNCTIONAL_PROGRAMMING: 'functional programming', ALGEBRAIC_DATA_TYPES: 'algebraic data types',
  IMMUTABLE_DATA: 'immutable data', PATTERN_MATCHING: 'pattern matching' };
export const topicName = t => NAMES[t] || t.toLowerCase().replace(/_/g, ' ');

// ---- sorting the sidebar's source exams ----
// When an exam was given, from its id ("61a-fa25-mt2" -> Fall 2025): a number that sorts chronologically.
const SEASON = { sp: 0, su: 1, fa: 2 };
export function examDate(id) { const m = id.match(/-(sp|su|fa)(\d\d)-/); return m ? (2000 + +m[2]) * 10 + SEASON[m[1]] : 0; }
// What kind of exam it originally was (orders a term's exams by date). A summer term's only midterm comes between
// Midterm 1 and Midterm 2.
export const KINDS = { mt1: { rank: 1, label: 'Midterm 1' }, midterm: { rank: 1.5, label: 'Summer midterm' }, mt2: { rank: 2, label: 'Midterm 2' }, final: { rank: 3, label: 'Final' } };
export const examKind = id => id.match(/-(mt1|mt2|midterm|final)$/)?.[1] || 'final';
// Sort options: key(ex, S) gives the value to sort by (ascending); dir is the default direction when chosen;
// asc/desc name each direction for the toggle. Ties go newest exam first, then the collection's suggested order.
export const SORTS = {
  suggested: { label: 'Suggested', key: (ex, S, i) => i, dir: 'asc', asc: 'Suggested order', desc: 'Reversed' },
  // Within a term, exams were given in the order Midterm 1, (summer) midterm, Midterm 2, final.
  // (A set of problems adapted by this site isn't an exam and has no date.)
  date: { label: 'Exam date', key: ex => ex.e?.src?.adapted ? null : examDate(ex.id) + KINDS[examKind(ex.id)].rank / 10, dir: 'desc', asc: 'Oldest first', desc: 'Newest first' },
  answered: { label: 'Answered', key: (ex, S) => counts(S, ex).a, dir: 'asc', asc: 'Fewest answered first', desc: 'Most answered first' },
  progress: { label: 'Progress', key: (ex, S) => { const c = counts(S, ex); return c.n ? c.ok / c.n : 0; }, dir: 'asc', asc: 'Least done first', desc: 'Most done first' },
  length: { label: 'Length', key: (ex, S) => counts(S, ex).n, dir: 'asc', asc: 'Shortest first', desc: 'Longest first' },
  picks: { label: 'Staff picks', key: ex => ex.problems.reduce((k, P) => k + P.qs.filter(x => x.tags.length).length, 0), dir: 'desc', asc: 'Fewest picks first', desc: 'Most picks first', needsPicks: true },
};
// Sort options that make sense for a collection (no "Staff picks" where there are none).
export const sortOptions = view => Object.keys(SORTS).filter(k => !SORTS[k].needsPicks || view.exams.some(ex => SORTS.picks.key(ex) > 0));
// Indexes into view.exams in display order. Entries with no value (an undated set) go last either way.
export function sortExams(view, S, by = 'suggested', desc = false) {
  const s = SORTS[by] || SORTS.suggested, k = view.exams.map((ex, i) => s.key(ex, S, i)), d = view.exams.map(ex => SORTS.date.key(ex) ?? 0);
  return view.exams.map((_, i) => i).sort((a, b) => (k[a] == null) - (k[b] == null) || (k[a] - k[b]) * (desc ? -1 : 1) || d[b] - d[a] || a - b);
}
