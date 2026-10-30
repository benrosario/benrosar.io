// Receives batched usage events from the practice page (POST /e) and writes them to Workers Analytics Engine,
// and emails feedback messages to Ben (POST /f, see feedback below).
// Every other path is served straight from ./public without running this Worker (see run_worker_first).
//
// Data point layout (query with the Analytics Engine SQL API, dataset "practice_events"):
//   index1  anonymous visitor id
//   blob1   event name: exam_open | problem_open | check | reveal | exam_complete | theme | pt_start | pt_submit | study_select
//           | pg_open | pg_run | pg_share | pg_import | pg_from_practice (the playground)
//   blob2   anonymous visitor id     blob3  page-load session id
//   blob4   source exam id (the original past exam, e.g. 61a-fa25-mt2), or pt<minutes> for a timed practice exam
//           (pt50, pt110, pt180, ...; which collection's exam it was is in blob8)
//   blob5   question id, problem title for problem_open, or comma-separated problem ids for pt_*
//   blob6   question kind (mc | sata | blank), theme (auto | light | dark), timeout | manual for pt_submit,
//           the newly selected collection for study_select, or the language for pg_run (py | py-tests | gleam |
//           gleam-tests) and pg_share (py | gleam), or the fill for pg_import (blanks | mine | solution)
//   blob7   country (from Cloudflare)
//   blob8   study collection selected when the event happened: midterm1 | midterm2 | midterm3 | final.
//           Empty for events sent before study collections existed; those were all Midterm 3 practice.
//   double1 check result: 1 correct, 0 wrong, -1 not a check
//   double2 1 if the check ran code (Python doctests or Gleam tests), else 0
//   double3 pt_submit: questions correct    double4 pt_submit: question count    double5 pt_submit: seconds used
const NAMES = new Set(['exam_open', 'problem_open', 'check', 'reveal', 'exam_complete', 'theme', 'pt_start', 'pt_submit', 'study_select']);
const num = v => (Number.isFinite(v) ? v : 0);
const str = (v, n = 120) => (typeof v === 'string' ? v.slice(0, n) : '');

// POST /f {m: message, p: page path, c: collection, hp: honeypot}. The message is emailed to FEEDBACK_TO, a Wrangler
// secret, so the address never appears in this public repo or the page; it must be a verified Email Routing destination.
// It's sent from FEEDBACK_FROM on benrosar.io, and visitors give no address. A filled-in honeypot (a field people can't
// see) gets a silent 204, and FEEDBACK_LIMIT caps each IP at a few messages a minute.
async function feedback(req, env) {
  if (req.method !== 'POST') return new Response(null, { status: 405 });
  const text = await req.text();
  if (text.length > 16384) return new Response(null, { status: 413 });
  let body;
  try { body = JSON.parse(text) } catch { return new Response(null, { status: 400 }) }
  if (body?.hp) return new Response(null, { status: 204 });
  const msg = str(body?.m, 4000).trim();
  if (!msg) return new Response(null, { status: 400 });
  const ip = req.headers.get('cf-connecting-ip') || '';
  if (env.FEEDBACK_LIMIT && !(await env.FEEDBACK_LIMIT.limit({ key: ip })).success) return new Response(null, { status: 429 });
  if (!env.FEEDBACK_TO || !env.FEEDBACK_FROM) return new Response(null, { status: 503 });
  const about = [['Page', str(body?.p, 300)], ['Studying for', str(body?.c, 16)], ['Country', str(req.cf?.country, 8)]]
    .filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
  try {
    await env.SEND_EMAIL.send({ from: env.FEEDBACK_FROM, to: env.FEEDBACK_TO, subject: 'cs61a practice feedback', text: `${msg}\n\n--\n${about}` });
  } catch (e) {
    console.error('feedback email failed', e);
    return new Response(null, { status: 502 });
  }
  return new Response(null, { status: 204 });
}

export default {
  async fetch(req, env) {
    const path = new URL(req.url).pathname;
    if (path === '/f') return feedback(req, env);
    if (path !== '/e') return new Response('Not found', { status: 404 });
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
