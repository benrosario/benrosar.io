// Browser storage: one JSON object under KEY (the same key the site has always used).
//
// Saved answers  "<exam id>|<question id>": {v, ok, m?, o?, gv}   (permanent question ids, shared by every collection)
// Preferences    _uid, _theme, _hl, _sw (sidebar width), _zoom, _tm (countdown timer), _view ('pt' when on timed practice)
// Schema 3 adds  _sv: 3, _c (selected collection), _cs: {<collection>: {ex, f, open, fo, y, ptlen}},
//                _dr: {<qid>: draft} unchecked answers, and collection/content-version fields on timed attempts.
// Schema 2 (before study collections) used _ex (index of the selected exam), _f, _open, _fo and _ptlen; migration
// copies them into _cs.midterm3 and leaves the old fields in place, so an older build of the page still works.
export const KEY = 'cs61a-practice-v2', BACKUP = KEY + ':before-sv3', SCHEMA = 3;

// Bring a saved state object up to SCHEMA. Pure and repeatable: running it again changes nothing.
// ctx: {legacyOrder: exam ids in the schema-2 sidebar order, defaultCollection, collections: ids}
export function migrate(S, ctx) {
  if (!S || typeof S !== 'object' || Array.isArray(S)) S = {};
  const from = S._sv || 2;
  if (from < 3) {
    const returning = Object.keys(S).some(k => k !== '_uid');
    S._cs = obj(S._cs);
    if (returning && !S._cs.midterm3) {
      const i = Number.isInteger(+S._ex) ? +S._ex : 0;
      S._cs.midterm3 = { ex: ctx.legacyOrder[i] || ctx.legacyOrder[0], f: S._f || 'all', open: obj(S._open), fo: obj(S._fo) };
      if (S._ptlen != null) S._cs.midterm3.ptlen = S._ptlen;
    }
    if (!S._c) S._c = returning ? 'midterm3' : ctx.defaultCollection;
    // Timed attempts before schema 3 were all Midterm 3 practice exams drawn from the modified-problem pool.
    const tag = x => { if (x && typeof x === 'object' && !x.c) Object.assign(x, { c: 'midterm3', pool: 'modified', set: 'midterm3', cv: 'legacy' }); };
    tag(S._pt);
    if (!Array.isArray(S._pth)) { if (S._pth != null) S._pth = []; } else S._pth.forEach(tag);
    S._sv = 3;
  }
  if (!ctx.collections.includes(S._c)) S._c = ctx.defaultCollection;
  return S;
}
const obj = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

// Load, migrate and back up (once) the pre-migration copy. Storage that fails to parse is copied aside, not lost.
export function load(ctx, ls = globalThis.localStorage) {
  let raw = null, S = {};
  try { raw = ls.getItem(KEY); } catch (e) {}
  if (raw) { try { S = JSON.parse(raw) || {}; } catch (e) { S = {}; try { ls.setItem(KEY + ':unreadable', raw); } catch (_) {} } }
  const before = S._sv || (raw ? 2 : SCHEMA);
  S = migrate(S, ctx);
  if (raw && before < SCHEMA) { try { if (ls.getItem(BACKUP) == null) ls.setItem(BACKUP, raw); } catch (e) {} }
  return S;
}
export function saver(S, ls = globalThis.localStorage) {
  return () => { try { ls.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
}
