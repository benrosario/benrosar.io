// The practice view: sidebar of source exams in the selected collection, the selected exam's problems, and progress.
import { st, cs } from './state.js';
import { $, esc, slide, confirmBtn, confetti, reduced, AI_ICON, wireAI } from './util.js';
import { segHTML, wireFills, FILLS } from './highlight.js';
import { grade, keyText, GV, howChecked, runs, loadingText, canCheckSolution, gradeSolution, solutionQuestions } from './grading.js';
import { aiPrompt } from './ai.js';
import { counts, collectionCounts, sharedIn, sortExams, sortOptions, SORTS } from './model.js';
import { ev } from './events.js';
import { ptHistNav, renderPT } from './timed.js';
import { dropdown, ddSync } from './chrome.js';
import { hintsFor, explanationHTML } from './learning.js';
import { topicStats, matchesTopic, missedQuestion } from './study.js';

const m = $('#m'), nav = $('#nav'), flt = $('#flt');
const TIPICON = { dn: '★', csm: '◆', oos: '⊘', note: 'ⓘ', adapted: '⇄' }, BADGE = { dn: 'DeNero pick', csm: 'CSM pick', oos: 'Out of scope' };
const KIND = { mc: 'Multiple choice', sata: 'Select all that apply', blank: 'Fill in the blank' };
export const FNAME = { todo: 'unanswered', no: 'incorrect', rec: 'recommended', scope: 'in-scope', missed: 'previously missed' };
const shortT = t => t.replace(/\s*\([\d.?]+ pts\)$/, '');
const labelOf = id => st.views[id].label;
// How the selected collection reads mid-sentence: "Midterm 2", "the final".
const ref = () => st.view.ref || st.view.label;
const list = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a.at(-1);
// Other collections where a question also counts (for reset wording and tooltips).
const alsoIn = qid => sharedIn(Object.values(st.views), qid).filter(c => c !== st.cid).map(labelOf);

function wholeSolution(section,p,ex) {
  const row = document.createElement('div'); row.className='whole';
  row.innerHTML='<button type="button">Check whole solution</button><p class="mut">Runs all your code blanks together. Fill every blank first; no official answers are substituted.</p><div class="whole-result" role="status" aria-live="polite"></div>';
  const button=row.querySelector('button'), out=row.querySelector('.whole-result');
  button.onclick=async()=>{
    button.disabled=true; out.textContent='Checking your whole solution…';
    const answers=Object.fromEntries(p.b.filter(q=>q.k).map(q=>{ const id=ex.id+'|'+q.id; return [q.id,st.S._dr?.[id] ?? st.S[id]?.v]; }));
    try { const g=await gradeSolution(p,answers); out.textContent=g.how || g.out; out.className='whole-result '+(g.ok?'ok':''); }
    catch(e) { out.textContent='Could not check. Try again. '+e.message; }
    finally { button.disabled=false; }
  };
  section.append(row);
}
// The first exam with a question the current topic and filter show, so picking one lands on something to practice.
export function firstMatch() {
  const topic=cs().topic;
  return st.view.exams.findIndex(ex=>ex.problems.some(P=>P.qs.some(x=>!x.oos && matchesTopic(topic,P.p,x.q) && (flt.value!=='missed' || missedQuestion(st.S,x.qid)))));
}
function chooseTopic(topic) {
  cs().topic=topic; const i=firstMatch(); if(i>=0) st.cur=i;
  st.save(); render(); scrollTo(0,0);
}
// Topic: a chip beside Sort, below the sidebar's top line, whose menu lists each topic with its progress (touch devices get the native picker).
let topicMenu, topicByKey={};
const topicLabel=k=>topicByKey[k]?.label || 'All topics';
export function initTopicControls() {
  const dd=document.createElement('div'); dd.className='dd'; dd.id='tdd';
  dd.innerHTML=`<select id="topic" aria-label="Practice topic"></select><button class="ddb chip" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="tddm" aria-label="Practice topic" data-tip="Practice one topic. Each shows how many of its questions you have right."><span></span><svg width="10" height="7" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button><ul class="ddm" id="tddm" role="listbox" aria-label="Practice topic" hidden></ul>`;
  $('#sortbar').append(dd);
  const select=dd.querySelector('select'); select.onchange=()=>chooseTopic(select.value);
  topicMenu=dropdown(dd, { head: 'Topic · correct of total', label: o => 'Topic: ' + (o.value ? topicLabel(o.value) : 'All'), opt: o => {
    const t=topicByKey[o.value]; if(!t) return esc(o.text);
    const acc=t.answered ? `${Math.round(100*t.correct/t.answered)}% accuracy (correct ÷ answered)` : 'Not started';
    return `<span class="tpn" data-tip="${esc(acc)}"><span class="tpl">${esc(t.label)}</span><span class="sub">${t.correct}/${t.total}</span><span class="tpb"><i style="width:${100*t.correct/t.total}%"></i></span></span>`; } });
  syncTopics();
}
function syncTopics() {
  const select=document.querySelector('#topic'); if(!select) return;
  const ts=topicStats(st.view,st.S); topicByKey=Object.fromEntries(ts.map(t=>[t.topic,t]));
  select.innerHTML='<option value="">All topics</option>'+ts.map(t=>`<option value="${esc(t.topic)}">${esc(t.label)} · ${t.correct}/${t.total}</option>`).join('');
  if(cs().topic && !topicByKey[cs().topic]) cs().topic='';
  select.value=cs().topic || ''; topicMenu.sync();
  // "Previously missed" in the filter carries the count the old Review missed button showed.
  const n=st.view.exams.flatMap(ex=>ex.problems.flatMap(P=>P.qs.filter(x=>!x.oos && missedQuestion(st.S,x.qid)))).length;
  flt.querySelector('option[value=missed]').textContent=`Previously missed (${n})`; ddSync();
}

// Each problem's correct share as last drawn in the sidebar, so a redraw can animate only what changed.
const drawn = new Map();
// Partly done problem: a gray ring whose blue arc is the share of parts answered correctly.
const ring = c => `<svg class="ring" width="14" height="14" viewBox="0 0 14 14" role="img" aria-label="${c.ok} of ${c.n} correct"><title>${c.ok}/${c.n} correct</title><circle cx="7" cy="7" r="5.25" pathLength="100"/>${c.ok ? `<circle class="arc" cx="7" cy="7" r="5.25" pathLength="100" stroke-dasharray="${100 * c.ok / c.n} 100"/>` : ''}</svg>`;
const keep = (f, x, s) => !(f == 'todo' && s || f == 'no' && (!s || s.ok) || f == 'rec' && !x.tags.length || f == 'scope' && x.oos || f == 'missed' && !missedQuestion(st.S,x.qid));
// The selected collection's sort ({by, desc}); falls back to the suggested order.
export function sortState() {
  const s = cs().sort || {}, by = sortOptions(st.view).includes(s.by) ? s.by : 'suggested';
  return { by, desc: s.by === by ? !!s.desc : SORTS[by].dir == 'desc' };
}
const hasPicks = () => st.view.exams.some(ex => ex.problems.some(P => P.qs.some(x => x.tags.length)));

// The exam drawn first last time, so a redraw knows when the selection changed.
let lastSel = null;
export function sidebar() {
  if (st.ptView) return;
  // Note where each exam sits on screen so the redraw can slide it from there (FLIP). Only within one collection.
  const sel = st.cid + '|' + st.view.exams[st.cur].id, same = lastSel?.startsWith(st.cid + '|'), moved = sel !== lastSel; lastSel = sel;
  const was = same && !reduced() ? new Map([...nav.querySelectorAll('details[data-x]')].map(d => [d.dataset.x, d.getBoundingClientRect().top])) : new Map();
  nav.innerHTML = ''; const f = flt.value, C = cs(), fl = f != 'all' || !!C.topic, finished = []; let any = 0;
  const t = collectionCounts(st.S, st.view), cp = document.createElement('div'); cp.className = 'cprog'; cp.id = 'cprog';
  cp.textContent = `${t.ok}/${t.n} correct across ${st.view.label} · ${t.a} answered`; nav.append(cp); syncTopics();
  if (fl) { const h = document.createElement('div'); h.className = 'fhint'; h.textContent = `Showing ${FNAME[f] || 'matching'} questions from all exams`; nav.append(h); }
  const so = sortState();
  // The selected exam comes first; the rest follow the chosen sort.
  const order = sortExams(st.view, st.S, so.by, so.desc), k = order.indexOf(st.cur); if (k > 0) order.unshift(order.splice(k, 1)[0]);
  order.forEach(i => {
    const ex = st.view.exams[i], d = document.createElement('details'), c = counts(st.S, ex);
    const match = P => fl ? P.qs.filter(x => keep(f, x, st.S[x.qid]) && matchesTopic(C.topic,P.p,x.q) && (!C.topic || !x.oos)) : null, em = fl ? ex.problems.reduce((k, P) => k + match(P).length, 0) : 0;
    if (fl && !em) return; any++;
    d.open = fl ? ((C.fo || {})[ex.id] !== 0) : !!(C.open || {})[ex.id]; d.dataset.x = ex.id; if (i == st.cur) d.className = 'cur';
    d.innerHTML = `<summary><button class="tg" type="button" aria-label="Show or hide ${esc(ex.t)} problems" data-tip="Show or hide problems without switching exams" aria-expanded="${d.open}"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="nm">${esc(ex.t)}</span>${fl ? `<span class="ct" title="${em} matching">${em}</span>` : c.n && c.ok == c.n ? '<span class="done" title="Complete" aria-label="Complete">✓</span>' : `<span class="ct">${c.ok}/${c.n}</span>`}</summary>`;
    const lst = document.createElement('div'); lst.className = 'lst';
    ex.problems.forEach((P, j) => {
      const mq = match(P); if (fl && !mq.length) return; const a = document.createElement('a'), pc = counts(st.S, ex, P); a.href = '#p-' + i + '-' + j;
      const g = P.qs.flatMap(x => x.tags);
      a.innerHTML = `<span class="nm">${esc(shortT(P.p.t))}</span>${!pc.n ? `<span class="skp" title="Out of scope for ${esc(ref())}">skip</span>` : pc.ok == pc.n ? '<span class="done sm" aria-label="Complete">✓</span>' : pc.a ? ring(pc) : ''}${g.includes('dn') ? '<span class="star" data-tip="Has a Prof. DeNero pick">★</span>' : g.includes('csm') ? '<span class="dia" data-tip="Has a CSM tutors\' pick">◆</span>' : ''}${fl ? `<span class="ct">${mq.length}</span>` : ''}`;
      a.onclick = e => { e.preventDefault(); goTo(i, j, fl ? mq[0].q.id : null); }; lst.append(a);
      if (pc.n) { const key = st.cid + '|' + P.p.id, was = drawn.get(key), now = pc.ok / pc.n; drawn.set(key, now);
        if (now == 1 && was != null && was < 1) finished.push(a.querySelector('.done'));
        const arc = a.querySelector('.arc'); if (arc && now !== was && !reduced() && arc.animate) arc.animate([{ strokeDasharray: `${100 * (was || 0)} 100` }, { strokeDasharray: `${100 * now} 100` }], { duration: 650, easing: 'cubic-bezier(.3,.7,.2,1)' }); }
    });
    d.append(lst);
    d.querySelector('summary').addEventListener('click', e => {
      e.preventDefault(); if (e.target.closest('.tg')) { toggleExam(d, ex.id, !d.open); return; }
      if (st.cur != i) { st.cur = i; if (!fl) { (C.open = C.open || {})[ex.id] = 1; pendingOpen = ex.id; } render(); scrollTo(0, 0); } else toggleExam(d, ex.id, !d.open);
    });
    nav.append(d); if (pendingOpen == ex.id) { pendingOpen = null; d.open = false; toggleExam(d, ex.id, true); }
  });
  if (fl && !any) { const h = document.createElement('div'); h.className = 'fhint';
    h.textContent = f == 'rec' && !hasPicks() ? (st.view.noPicks || `No question picks have been published for ${st.view.label}, so nothing is marked recommended.`) : `No ${FNAME[f] || 'matching'} questions right now.`; nav.append(h); }
  ptHistNav(nav);
  // A new selection rises to the top: scroll the list up to it, then slide every exam from where it was on screen.
  if (moved && same) $('#side').scrollTop = 0;
  if (was.size) nav.querySelectorAll('details[data-x]').forEach(d => { const y = was.get(d.dataset.x); if (y == null) return; const dy = y - d.getBoundingClientRect().top;
    if (Math.abs(dy) > 1) d.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' }); });
  // A problem just finished: pop its check mark and give it a small burst, if it is in view in the sidebar.
  finished.forEach(d => { const r = d.getBoundingClientRect(), b = $('#side').getBoundingClientRect(); if (!r.width || r.top < b.top || r.bottom > b.bottom || reduced()) return;
    d.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.35)', offset: .6 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' }); confetti(d, true); });
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
    const selected = P.qs.filter(x => matchesTopic(cs().topic,P.p,x.q) && (!cs().topic || !x.oos) && (flt.value !== 'missed' || missedQuestion(st.S,x.qid)));
    if (!selected.length) return;
    const p = P.p, d = document.createElement('section'); d.className = 'prob'; d.id = `p-${st.cur}-${j}`; d.style.scrollMarginTop = '64px';
    const tips = [...(p.adapted ? [{ k: 'adapted', t: `Adapted to Gleam by this site from ${p.adapted.from}; not written by course staff` }] : []), ...(P.tips || [])];
    d.innerHTML = `<h2>${esc(p.t)}</h2>` + (tips.length ? `<div class="tips">${tips.map(t => `<span class="tip ${t.k}">${TIPICON[t.k]} ${esc(t.t)}</span>`).join('')}</div>` : '');
    if (p.authored) d.insertAdjacentHTML('beforeend','<p class="authored">Original practice written by this site; not a past exam or course-staff problem.</p>');
    let qi = 0;
    p.b.forEach(b => {
      if (b.s) { const t = document.createElement('div'); t.className = 'txt'; t.innerHTML = segHTML(b.s); wireFills(t); d.append(t); return; }
      const x = P.qs[qi++]; if (!selected.includes(x)) return; const w = card(x, P, ex); w.id = `q-${st.cur}-${b.id}`; w.style.scrollMarginTop = '72px'; d.append(w);
    });
    if (canCheckSolution(p) && solutionQuestions(p).every(q=>selected.some(x=>x.q===q))) wholeSolution(d,p,ex);
    m.append(d);
  });
  if(!m.querySelector('.prob')) { const empty=document.createElement('p'); empty.className='note'; empty.textContent='No matching questions in this exam. Choose another topic or switch the filter to All questions.'; m.append(empty); }
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
  h += `<div class="row"><button class="p ck" data-tip="${esc(howChecked(q, p))}">Check</button><button class="hint" type="button" aria-expanded="false">Hint</button><button class="sh">Show answer</button><button class="ai" hidden data-tip="Copies a prompt about your mistake. Paste it into ChatGPT, Claude, or any AI chat.">${AI_ICON}<span>Ask AI why</span></button><button class="rst" data-tip="${esc('Clear your answer to this question' + (also.length ? `. It also counts toward ${list(also)}, so it clears there too.` : ''))}">Reset</button></div><div class="hints" hidden aria-live="polite"></div><div class="out" hidden></div><div class="ans" hidden></div>`;
  c.innerHTML = h; wireFills(c);
  const ta = c.querySelector('textarea'), grow = () => { if (!ta) return; ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 2 + 'px'; }, ins = [...c.querySelectorAll('input')], fb = c.querySelector('.fb'), an = c.querySelector('.ans'), out = c.querySelector('.out');
  const showKey = () => { an.innerHTML = `<h4>Official answer</h4><div class="k">${esc(keyText(q))}</div>` + explanationHTML(p,q); slide(an, true); };
  const hint = c.querySelector('.hint'), hints = hintsFor(p,q), hintBox = c.querySelector('.hints'); let shown = 0;
  hint.onclick = () => { hintBox.hidden = false; hint.setAttribute('aria-expanded','true'); const item = document.createElement('p'); item.textContent = `${++shown}. ${hints[shown-1]}`; hintBox.append(item); hint.textContent = shown < hints.length ? 'Next hint' : 'Hints shown'; hint.disabled = shown >= hints.length; };
  const ai = c.querySelector('.ai'); wireAI(ai, () => { const s = st.S[id]; return s && aiPrompt(ex.t, p, q, s.v, s.o, st.view.label); });
  const complete = c0 => { const c1 = counts(st.S, ex); if (c1.ok == c1.n && c0.ok < c0.n) ev('exam_complete', { x: ex.id }); };
  function show(ok, msg, o) {
    c.className = 'q ' + (ok ? 'ok' : 'no') + (x.oos ? ' oosq' : ''); ai.hidden = !!ok; fb.className = 'fb ' + (ok ? 'ok' : 'no');
    fb.innerHTML = ok ? '✓ ' + esc(msg || 'Correct') : '✗ Not quite' + (q.k == 'blank' ? ' <button class="mk" data-tip="Count this as correct, e.g. if your answer works but is written differently">I was right</button>' : '');
    const mk = fb.querySelector('.mk'); if (mk) mk.onclick = () => { const c0 = counts(st.S, ex); st.S[id].ok = true; st.S[id].m = 'Marked correct by you'; st.save(); show(true, st.S[id].m); out.hidden = true; stats(); complete(c0); };
    // A text-only blank that didn't match: say plainly that nothing was run.
    if (!ok && !o && q.k == 'blank' && !runs(q)) o = `Compared with the official answer text (capitalization and string contents matter). This answer wasn’t run, so if yours is equivalent, press “I was right”.`;
    out.hidden = !o; out.textContent = o || ''; if (ok && !an.hidden) slide(an, false);
  }
  const setInputs = v => { if (ta) ta.value = v; else ins.forEach(i => i.checked = q.k == 'mc' ? v === +i.value : v.includes(+i.value)); };
  if (sv) {
    setInputs(sv.v); show(sv.ok, sv.m, sv.o);
    // A wrong answer saved by an older checker: re-check text answers now; ask before running code.
    if (sv.gv !== GV && q.k == 'blank') {
      if (!runs(q)) grade(q, sv.v, p).then(g => { if (g.ok) { st.S[id] = { v: sv.v, ok: true, m: g.how, gv: GV }; st.save(); show(true, g.how); stats(); } });
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
    ck.disabled = true; fb.className = 'fb'; fb.textContent = loadingText(q, p);
    const c0 = counts(st.S, ex);
    let g; try { g = await grade(q, v, p); } catch (e) { g = {unavailable:true,out:'Checking could not finish. Press Check to retry. ' + e.message}; } finally { ck.disabled = false; }
    if (g.unavailable) { fb.className='fb'; fb.textContent='Could not check · retry'; out.hidden=false; out.textContent=g.out; return; }
    const previous = st.S[id]; st.S[id] = { v, ok: g.ok, m: g.how, o: g.out, gv: GV, misses: (previous?.misses || (previous && !previous.ok ? 1 : 0)) + (g.ok ? 0 : 1) }; if (st.S._dr) delete st.S._dr[id]; st.save(); show(g.ok, g.how, g.out); stats(); if (g.ok) confetti(ck);
    ev('check', { x: ex.id, q: id, k: q.k, ok: g.ok, run: !!g.ran }); complete(c0);
    if (!g.ok) { c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); }
  };
  c.addEventListener('animationend', () => c.classList.remove('shake'));
  const sh = c.querySelector('.sh'); confirmBtn(sh, () => { showKey(); ev('reveal', { x: ex.id, q: id, k: q.k }); }, () => !an.hidden && (slide(an, false), true));
  confirmBtn(c.querySelector('.rst'), () => { delete st.S[id]; if (st.S._dr) delete st.S._dr[id]; if(st.S._missed) delete st.S._missed[id]; st.save(); const nw = card(x, P, ex); nw.id = wrap.id; nw.style.scrollMarginTop = wrap.style.scrollMarginTop; wrap.replaceWith(nw); stats(); });
  if (ta) { ta.addEventListener('input', grow); requestAnimationFrame(grow); ta.onkeydown = e => { if (e.key == 'Enter' && (e.metaKey || e.ctrlKey)) ck.click(); }; }
  wrap.append(c, an); return wrap;
}

// "Reset exam" clears the questions shown for this exam in this collection; the tooltip says exactly what that touches.
function wireReset(ex) {
  const rs = $('#rs'), ids = ex.problems.flatMap(P => P.qs.map(x => x.qid));
  const saved = () => ids.filter(id => st.S[id] || st.S._dr?.[id] != null || st.S._missed?.[id]).length;
  const also = [...new Set(ids.flatMap(alsoIn))];
  rs.dataset.tip = `Clear your saved answers to the ${ids.length} questions from ${ex.t} shown here` + (also.length ? `. Some also count toward ${list(also)}, so their progress there resets too.` : '.');
  rs.setAttribute('aria-label', 'Reset exam: ' + rs.dataset.tip);
  confirmBtn(rs, () => { ids.forEach(id => { delete st.S[id]; if (st.S._dr) delete st.S._dr[id]; if(st.S._missed) delete st.S._missed[id]; }); st.save(); render(); },
    null, () => { const n = saved(); return n ? `Clear ${n} saved answer${n > 1 ? 's' : ''}?` : 'Nothing saved yet'; });
}

export function stats() {
  if (st.ptView) return; sidebar(); const c = counts(st.S, st.view.exams[st.cur]);
  $('#pb').style.width = (c.n ? 100 * c.ok / c.n : 0) + '%'; $('#stat').textContent = `${c.ok}/${c.n} correct · ${c.a} answered`;
}
