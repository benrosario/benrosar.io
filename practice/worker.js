// Receives batched usage events from the practice page (POST /e) and writes them to Workers Analytics Engine.
// Every other path is served straight from ./public without running this Worker (see run_worker_first).
//
// Data point layout (query with the Analytics Engine SQL API, dataset "practice_events"):
//   index1  anonymous visitor id
//   blob1   event name: exam_open | problem_open | check | reveal | exam_complete | theme | pt_start | pt_submit | study_select
//   blob2   anonymous visitor id     blob3  page-load session id
//   blob4   source exam id (the original past exam, e.g. 61a-fa25-mt2), or pt<minutes> for a timed practice exam
//           (pt50, pt110, pt180, ...; which collection's exam it was is in blob8)
//   blob5   question id, problem title for problem_open, or comma-separated problem ids for pt_*
//   blob6   question kind (mc | sata | blank), theme (auto | light | dark), timeout | manual for pt_submit,
//           or the newly selected collection for study_select
//   blob7   country (from Cloudflare)
//   blob8   study collection selected when the event happened: midterm1 | midterm2 | midterm3 | final.
//           Empty for events sent before study collections existed; those were all Midterm 3 practice.
//   double1 check result: 1 correct, 0 wrong, -1 not a check
//   double2 1 if the check ran code (Python doctests or Gleam tests), else 0
//   double3 pt_submit: questions correct    double4 pt_submit: question count    double5 pt_submit: seconds used
const NAMES = new Set(['exam_open', 'problem_open', 'check', 'reveal', 'exam_complete', 'theme', 'pt_start', 'pt_submit', 'study_select']);
const num = v => (Number.isFinite(v) ? v : 0);
const str = (v, n = 120) => (typeof v === 'string' ? v.slice(0, n) : '');

export default {
  async fetch(req, env) {
    if (new URL(req.url).pathname !== '/e') return new Response('Not found', { status: 404 });
    if (req.method !== 'POST') return new Response(null, { status: 405 });
    const text = await req.text();
    if (text.length > 32768) return new Response(null, { status: 413 });
    let body;
    try { body = JSON.parse(text) } catch { return new Response(null, { status: 400 }) }
    const uid = str(body?.u, 64), sid = str(body?.s, 32), country = str(req.cf?.country, 8);
    const events = Array.isArray(body?.e) ? body.e.slice(0, 50) : [];
    for (const e of events) {
      if (!NAMES.has(e?.n)) continue;
      env.EVENTS.writeDataPoint({
        indexes: [uid],
        blobs: [e.n, uid, sid, str(e.x), str(e.q, 200), str(e.k || e.v, 16), country, str(e.c, 16)],
        doubles: [e.n === 'check' ? (e.ok ? 1 : 0) : -1, e.run ? 1 : 0, num(e.ok), num(e.tot), num(e.sec)],
      });
    }
    return new Response(null, { status: 204 });
  },
};
