// The practice view: sidebar of source exams in the selected collection, the selected exam's problems, and progress.
import { st, cs } from './state.js';
import { $, esc, slide, confirmBtn, confetti, reduced, AI_ICON, wireAI } from './util.js';
import { segHTML, wireFills, FILLS } from './highlight.js';
import { grade, keyText, GV, pyLoaded, howChecked, runs } from './grading.js';
import { aiPrompt } from './ai.js';
import { counts, collectionCounts, sharedIn, sortExams, sortOptions, SORTS } from './model.js';
import { ev } from './events.js';
import { ptHistNav, renderPT } from './timed.js';

const m = $('#m'), nav = $('#nav'), flt = $('#flt');
const TIPICON = { dn: '★', csm: '◆', oos: '⊘', note: 'ⓘ' }, BADGE = { dn: 'DeNero pick', csm: 'CSM pick', oos: 'Out of scope' };
const KIND = { mc: 'Multiple choice', sata: 'Select all that apply', blank: 'Fill in the blank' };
export const FNAME = { todo: 'unanswered', no: 'incorrect', rec: 'recommended', scope: 'in-scope' };
const shortT = t => t.replace(/\s*\([\d.?]+ pts\)$/, '');
const labelOf = id => st.views[id].label;
// How the selected collection reads mid-sentence: "Midterm 2", "the final".
const ref = () => st.view.ref || st.view.label;
const list = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a.at(-1);
// Other collections where a question also counts (for reset wording and tooltips).
const alsoIn = qid => sharedIn(Object.values(st.views), qid).filter(c => c !== st.cid).map(labelOf);

const keep = (f, x, s) => !(f == 'todo' && s || f == 'no' && (!s || s.ok) || f == 'rec' && !x.tags.length || f == 'scope' && x.oos);
// The selected collection's sort ({by, desc}); falls back to the suggested order.
export function sortState() {
  const s = cs().sort || {}, by = sortOptions(st.view).includes(s.by) ? s.by : 'suggested';
  return { by, desc: s.by === by ? !!s.desc : SORTS[by].dir == 'desc' };
}
const hasPicks = () => st.view.exams.some(ex => ex.problems.some(P => P.qs.some(x => x.tags.length)));

export function sidebar() {
  if (st.ptView) return; nav.innerHTML = ''; const f = flt.value, fl = f != 'all', C = cs(); let any = 0;
  const t = collectionCounts(st.S, st.view), cp = document.createElement('div'); cp.className = 'cprog'; cp.id = 'cprog';
  cp.textContent = `${t.ok}/${t.n} correct across ${st.view.label} · ${t.a} answered`; nav.append(cp);
  if (fl) { const h = document.createElement('div'); h.className = 'fhint'; h.textContent = `Showing ${FNAME[f]} questions from all exams`; nav.append(h); }
  const so = sortState();
  sortExams(st.view, st.S, so.by, so.desc).forEach(i => {
    const ex = st.view.exams[i], d = document.createElement('details'), c = counts(st.S, ex);
    const match = P => fl ? P.qs.filter(x => keep(f, x, st.S[x.qid])) : null, em = fl ? ex.problems.reduce((k, P) => k + match(P).length, 0) : 0;
    if (fl && !em) return; any++;
    d.open = fl ? ((C.fo || {})[ex.id] !== 0) : !!(C.open || {})[ex.id]; if (i == st.cur) d.className = 'cur';
    d.innerHTML = `<summary><button class="tg" type="button" aria-label="Show or hide ${esc(ex.t)} problems" data-tip="Show or hide problems without switching exams" aria-expanded="${d.open}"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="nm">${esc(ex.t)}</span>${fl ? `<span class="ct" title="${em} matching">${em}</span>` : c.n && c.ok == c.n ? '<span class="done" title="Complete" aria-label="Complete">✓</span>' : `<span class="ct">${c.ok}/${c.n}</span>`}</summary>`;
    const lst = document.createElement('div'); lst.className = 'lst';
    ex.problems.forEach((P, j) => {
      const mq = match(P); if (fl && !mq.length) return; const a = document.createElement('a'), pc = counts(st.S, ex, P); a.href = '#p-' + i + '-' + j;
      const g = P.qs.flatMap(x => x.tags);
      a.innerHTML = `<span class="nm">${esc(shortT(P.p.t))}</span>${!pc.n ? `<span class="skp" title="Out of scope for ${esc(ref())}">skip</span>` : pc.ok == pc.n ? '<span class="done sm" aria-label="Complete">✓</span>' : ''}${g.includes('dn') ? '<span class="star" data-tip="Has a Prof. DeNero pick">★</span>' : g.includes('csm') ? '<span class="dia" data-tip="Has a CSM tutors\' pick">◆</span>' : ''}${fl ? `<span class="ct">${mq.length}</span>` : ''}`;
      a.onclick = e => { e.preventDefault(); goTo(i, j, fl ? mq[0].q.id : null); }; lst.append(a);
    });
    d.append(lst);
    d.querySelector('summary').addEventListener('click', e => {
      e.preventDefault(); if (e.target.closest('.tg')) { toggleExam(d, ex.id, !d.open); return; }
      if (st.cur != i) { st.cur = i; if (!fl) { (C.open = C.open || {})[ex.id] = 1; pendingOpen = ex.id; } render(); scrollTo(0, 0); } else toggleExam(d, ex.id, !d.open);
    });
    nav.append(d); if (pendingOpen == ex.id) { pendingOpen = null; d.open = false; toggleExam(d, ex.id, true); }
  });
  if (fl && !any) { const h = document.createElement('div'); h.className = 'fhint';
    h.textContent = f == 'rec' && !hasPicks() ? (st.view.noPicks || `No question picks have been published for ${st.view.label}, so nothing is marked recommended.`) : `No ${FNAME[f]} questions right now.`; nav.append(h); }
  ptHistNav(nav);
}
let pendingOpen = null;
function toggleExam(d, id, open) {
  const C = cs(); if (flt.value != 'all') (C.fo = C.fo || {})[id] = open ? 1 : 0; else (C.open = C.open || {})[id] = open ? 1 : 0;
  st.save(); d.querySelector('.tg').setAttribute('aria-expanded', open); const l = d.querySelector('.lst');
  if (reduced() || !l.animate) { d.open = open; return; }
  l.getAnimations().forEach(a => a.cancel());
  if (open) { d.open = true; const h = l.scrollHeight; l.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' }); }
  else { const h = l.scrollHeight; l.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 180, easing: 'ease-in' }).onfinish = () => { d.open = false; }; }
}

// The main area always shows the selected exam (its problems in this collection) in full; the filter only narrows the sidebar.
let evEx = null;
export function render() {
  if (st.ptView) return renderPT(); const ex = st.view.exams[st.cur]; cs().ex = ex.id; st.save(); m.innerHTML = ''; FILLS.length = 0;
  const key = st.cid + ':' + ex.id; if (key !== evEx) { evEx = key; ev('exam_open', { x: ex.id }); }
  const nt = document.createElement('div'); nt.className = 'note';
  const staff = st.view.scope.basis == 'staff';
  nt.innerHTML = `<b>${esc(ex.t)}.</b> ${esc(ex.note)} ${ex.skip.length ? 'Staff say to skip: ' + ex.skip.map(x => '<span class="ref">' + esc(x) + '</span>').join(', ') + '.' : staff ? 'Nothing is flagged to skip.' : ''}${ex.partial ? ` Showing the ${ex.problems.length} of ${ex.total} problems that cover ${esc(ref())} material.` : ''}${ex.e.omitted?.length ? ` ${omittedText(ex.e.omitted)}` : ''} <span class="mut">${staff ? 'Out-of-scope questions don’t count toward your progress.' : `Questions marked out of scope cover topics that aren’t on ${esc(ref())}, so they don’t count toward your progress.`}</span>`;
  m.append(nt);
  ex.problems.forEach((P, j) => {
    const p = P.p, d = document.createElement('section'); d.className = 'prob'; d.id = `p-${st.cur}-${j}`; d.style.scrollMarginTop = '64px';
    d.innerHTML = `<h2>${esc(p.t)}</h2>` + (P.tips ? `<div class="tips">${P.tips.map(t => `<span class="tip ${t.k}">${TIPICON[t.k]} ${esc(t.t)}</span>`).join('')}</div>` : '');
    let qi = 0;
    p.b.forEach(b => {
      if (b.s) { const t = document.createElement('div'); t.className = 'txt'; t.innerHTML = segHTML(b.s); wireFills(t); d.append(t); return; }
      const x = P.qs[qi++], w = card(x, P, ex); w.id = `q-${st.cur}-${b.id}`; w.style.scrollMarginTop = '72px'; d.append(w);
    });
    m.append(d);
  });
  wireReset(ex);
  stats();
}
// "Problems 1 and 5 of the original exam aren’t on this site (…)."
function omittedText(o) {
  const ns = o.map(x => x.n), why = [...new Set(o.map(x => x.why))];
  return `${ns.length > 1 ? 'Problems ' + list(ns) : 'Problem ' + ns[0]} of the original exam ${ns.length > 1 ? 'aren’t' : 'isn’t'} on this site (${esc(why.join('; '))}).`;
}
// Jump to exam i, problem j (and optionally a question) without disturbing anything else.
export function goTo(i, j, qid) {
  if (st.cur != i) { st.cur = i; render(); } else sidebar(); const ex = st.view.exams[i];
  ev('problem_open', { x: ex.id, q: shortT(ex.problems[j].p.t) });
  const el = document.getElementById(qid != null ? `q-${i}-${qid}` : `p-${i}-${j}`) || document.getElementById(`p-${i}-${j}`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function card(x, P, ex) {
  const q = x.q, id = x.qid, p = P.p, wrap = document.createElement('div'); wrap.className = 'qw';
  const c = document.createElement('div'), sv = st.S[id]; c.className = 'q' + (sv ? sv.ok ? ' ok' : ' no' : '') + (x.oos ? ' oosq' : '');
  const badges = (x.oos ? [`<span class="badge oos" data-tip="${esc(`Out of scope for ${ref()}: ${x.why}`)}">${TIPICON.oos} ${BADGE.oos}</span>`] : [])
    .concat(x.tags.map(k => `<span class="badge ${k}">${TIPICON[k]} ${BADGE[k]}</span>`));
  const also = alsoIn(id);
  let h = `<div class="qh"><div class="tag">${KIND[q.k]}${badges.join('')}</div><span class="fb" role="status" aria-live="polite"></span></div><div class="ql">${segHTML(q.l)}</div>`;
  if (q.k == 'blank') h += `<textarea rows="${q.r ? q.r.length : 1}" spellcheck="false" placeholder="Your answer…" aria-label="Your answer"></textarea>`;
  else q.o.forEach((o, i) => h += `<label class="o"><input type="${q.k == 'mc' ? 'radio' : 'checkbox'}" name="${esc(id)}" value="${i}"><span>${esc(o)}</span></label>`);
  h += `<div class="row"><button class="p ck" data-tip="${esc(howChecked(q))}">Check</button><button class="sh">Show answer</button><button class="ai" hidden data-tip="Copies a prompt about your mistake. Paste it into ChatGPT, Claude, or any AI chat.">${AI_ICON}<span>Ask AI why</span></button><button class="rst" data-tip="${esc('Clear your answer to this question' + (also.length ? `. It also counts toward ${list(also)}, so it clears there too.` : ''))}">Reset</button></div><div class="out" hidden></div><div class="ans" hidden></div>`;
  c.innerHTML = h; wireFills(c);
  const ta = c.querySelector('textarea'), grow = () => { if (!ta) return; ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 2 + 'px'; }, ins = [...c.querySelectorAll('input')], fb = c.querySelector('.fb'), an = c.querySelector('.ans'), out = c.querySelector('.out');
  const showKey = () => { an.innerHTML = `<h4>Official answer</h4><div class="k">${esc(keyText(q))}</div>` + (q.x ? `<div class="x">${esc(q.x)}</div>` : ''); slide(an, true); };
  const ai = c.querySelector('.ai'); wireAI(ai, () => { const s = st.S[id]; return s && aiPrompt(ex.t, p, q, s.v, s.o, st.view.label); });
  const complete = c0 => { const c1 = counts(st.S, ex); if (c1.ok == c1.n && c0.ok < c0.n) ev('exam_complete', { x: ex.id }); };
  function show(ok, msg, o) {
    c.className = 'q ' + (ok ? 'ok' : 'no') + (x.oos ? ' oosq' : ''); ai.hidden = !!ok; fb.className = 'fb ' + (ok ? 'ok' : 'no');
    fb.innerHTML = ok ? '✓ ' + esc(msg || 'Correct') : '✗ Not quite' + (q.k == 'blank' ? ' <button class="mk" data-tip="Count this as correct, e.g. if your answer works but is written differently">I was right</button>' : '');
    const mk = fb.querySelector('.mk'); if (mk) mk.onclick = () => { const c0 = counts(st.S, ex); st.S[id].ok = true; st.S[id].m = 'Marked correct by you'; st.save(); show(true, st.S[id].m); out.hidden = true; stats(); complete(c0); };
    // A text-only blank that didn't match: say plainly that nothing was run.
    if (!ok && !o && q.k == 'blank' && !runs(q)) o = 'Compared with the official answer text (ignoring spacing, capitalization and quote style). This answer wasn’t run, so if yours is equivalent, press “I was right”.';
    out.hidden = !o; out.textContent = o || ''; if (ok && !an.hidden) slide(an, false);
  }
  const setInputs = v => { if (ta) ta.value = v; else ins.forEach(i => i.checked = q.k == 'mc' ? v === +i.value : v.includes(+i.value)); };
  if (sv) {
    setInputs(sv.v); show(sv.ok, sv.m, sv.o);
    // A wrong answer saved by an older checker: re-check text answers now; ask before running code.
    if (!sv.ok && sv.gv !== GV && q.k == 'blank') {
      if (!q.r) grade(q, sv.v, p).then(g => { if (g.ok) { st.S[id] = { v: sv.v, ok: true, m: g.how, gv: GV }; st.save(); show(true, g.how); stats(); } });
      else fb.insertAdjacentHTML('beforeend', '<span class="stale">Checker updated since you answered. Press Check again.</span>');
    }
  }
  // An unchecked answer (typed or picked, not yet checked) survives re-renders, collection switches and reloads.
  const dr = st.S._dr?.[id]; if (dr != null) setInputs(dr);
  function get() { if (ta) return ta.value; if (q.k == 'mc') { const i = ins.find(i => i.checked); return i ? +i.value : null; } return ins.filter(i => i.checked).map(i => +i.value); }
  let dt; const draft = () => { const v = get(), s = st.S[id]; st.S._dr = st.S._dr || {};
    if (s && JSON.stringify(s.v) === JSON.stringify(v) || v === null || v === '' || (Array.isArray(v) && !v.length && !s)) delete st.S._dr[id]; else st.S._dr[id] = v;
    clearTimeout(dt); dt = setTimeout(st.save, 250); };
  if (ta) ta.addEventListener('input', draft); ins.forEach(i => i.addEventListener('change', draft));
  const ck = c.querySelector('.ck'); ck.onclick = async () => {
    const v = get(); if (v === null || (typeof v == 'string' && !v.trim()) || (Array.isArray(v) && !v.length)) { fb.className = 'fb no'; fb.textContent = 'Enter an answer first'; return; }
    ck.disabled = true; fb.className = 'fb'; fb.textContent = q.r && !pyLoaded() ? 'Loading Python (first run takes a few seconds)…' : q.r ? 'Running…' : '';
    const c0 = counts(st.S, ex);
    const g = await grade(q, v, p); ck.disabled = false; st.S[id] = { v, ok: g.ok, m: g.how, o: g.out, gv: GV }; if (st.S._dr) delete st.S._dr[id]; st.save(); show(g.ok, g.how, g.out); stats(); if (g.ok) confetti(ck);
    ev('check', { x: ex.id, q: id, k: q.k, ok: g.ok, run: /^Ran your code/.test(g.how || g.out || '') }); complete(c0);
    if (!g.ok) { c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); }
  };
  c.addEventListener('animationend', () => c.classList.remove('shake'));
  const sh = c.querySelector('.sh'); confirmBtn(sh, () => { showKey(); ev('reveal', { x: ex.id, q: id, k: q.k }); }, () => !an.hidden && (slide(an, false), true));
  confirmBtn(c.querySelector('.rst'), () => { delete st.S[id]; if (st.S._dr) delete st.S._dr[id]; st.save(); const nw = card(x, P, ex); nw.id = wrap.id; nw.style.scrollMarginTop = wrap.style.scrollMarginTop; wrap.replaceWith(nw); stats(); });
  if (ta) { ta.addEventListener('input', grow); requestAnimationFrame(grow); ta.onkeydown = e => { if (e.key == 'Enter' && (e.metaKey || e.ctrlKey)) ck.click(); }; }
  wrap.append(c, an); return wrap;
}

// "Reset exam" clears the questions shown for this exam in this collection; the tooltip says exactly what that touches.
function wireReset(ex) {
  const rs = $('#rs'), ids = ex.problems.flatMap(P => P.qs.map(x => x.qid));
  const saved = () => ids.filter(id => st.S[id] || st.S._dr?.[id] != null).length;
  const also = [...new Set(ids.flatMap(alsoIn))];
  rs.dataset.tip = `Clear your saved answers to the ${ids.length} questions from ${ex.t} shown here` + (also.length ? `. Some also count toward ${list(also)}, so their progress there resets too.` : '.');
  rs.setAttribute('aria-label', 'Reset exam: ' + rs.dataset.tip);
  confirmBtn(rs, () => { ids.forEach(id => { delete st.S[id]; if (st.S._dr) delete st.S._dr[id]; }); st.save(); render(); },
    null, () => { const n = saved(); return n ? `Clear ${n} saved answer${n > 1 ? 's' : ''}?` : 'Nothing saved yet'; });
}

export function stats() {
  if (st.ptView) return; sidebar(); const c = counts(st.S, st.view.exams[st.cur]);
  $('#pb').style.width = (c.n ? 100 * c.ok / c.n : 0) + '%'; $('#stat').textContent = `${c.ok}/${c.n} correct · ${c.a} answered`;
}
