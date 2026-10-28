// Timed practice exams, drawn from the selected collection's pool and graded only on submit.
// - Midterm 3 draws modified versions of the staff-recommended problems (pool "modified", content/timed/midterm3.json).
// - Other collections draw original past-exam problems from their own scope (pool "source"); the page says so.
// One attempt can be active at a time (S._pt); it keeps running, and submits itself, whatever collection is selected.
// Each attempt records its collection (c), content version (cv), pool, problem ids, question keys and a small
// snapshot of each question so it stays reviewable if the question bank changes later. History: S._pth (newest first, 20).
import { st, cs } from './state.js';
import { $, esc, SV, fmtT, fmtMin, fmtClock, confirmBtn, AI_ICON, wireAI } from './util.js';
import { segHTML, segText, wireFills, FILLS } from './highlight.js';
import { grade, keyText, howChecked, loadingText, runs } from './grading.js';
import { aiPrompt } from './ai.js';
import { timedPool, timedLengths, pickTimed } from './model.js';
import { ev } from './events.js';
import { render } from './practice.js';

const m = $('#m'), nav = $('#nav'), ptb = $('#ptb');
const PTICON = SV('<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>'), BACKICON = SV('<path d="M19 12H5M12 19l-7-7 7-7"/>');
let ptBusy = false, PROB = null, MOD = {};
const lookup = () => { if (!PROB) { PROB = {}; for (const e of st.bank.exams) for (const p of e.p) PROB[p.id] = { p, e }; for (const k in st.bank.timed) MOD[k] = Object.fromEntries(st.bank.timed[k].map(p => [p.id, p])); } };
const label = c => st.views[c]?.label || c;
// The problem an attempt's id refers to, from the current bank (null if it no longer exists).
function prob(X, id) { lookup(); return X.pool == 'source' ? PROB[id]?.p || null : MOD[X.set || 'midterm3']?.[id] || null; }
const srcOf = (X, id) => { lookup(); const P = PROB[id]?.p;
  if (X.pool != 'source') return prob(X, id)?.src || X.snap?.src?.[id] || '';
  return P ? (P.adapted ? `Adapted to Gleam by this site from ${P.adapted.from}` : `${PROB[id].e.t}, Q${P.n}`) : X.snap?.src?.[id] || ''; };
const blankAns = v => v == null || (typeof v == 'string' && !v.trim()) || (Array.isArray(v) && !v.length);
export const ptX = () => st.ptHist != null ? (st.S._pth || []).find(h => h.d === st.ptHist && h.ids) : st.S._pt;

// Questions of an attempt in order: {p, pi, q, key}. Falls back to the stored snapshot for anything the bank lost.
function ptQs(X) {
  const keys = X.keys || X.ids.flatMap((id, pi) => (prob(X, id)?.b || []).filter(b => b.k).map(q => pi + '|' + q.id));
  return keys.map(key => {
    const [pi, qid] = key.split('|'), id = X.ids[pi], p = prob(X, id), q = p?.b.find(b => b.k && String(b.id) === qid);
    if (p && q) return { p, pi: +pi, q, key };
    const s = X.snap?.q?.[key] || { k: 'blank', l: '(This question is no longer in the question bank.)', a: [''] };
    return { p: p || { t: X.snap?.t?.[id] || id, b: [] }, pi: +pi, q: { id: qid, k: s.k, l: [{ p: s.l }], o: s.o, a: s.a }, key, gone: true };
  });
}
// A compact snapshot (titles, sources, question text, choices and keys) stored with the attempt.
function snapshot(X) {
  const t = {}, src = {}, q = {};
  X.ids.forEach(id => { t[id] = prob(X, id).t; src[id] = srcOf(X, id); });
  for (const x of ptQs(X)) q[x.key] = { k: x.q.k, l: segText(x.q.l).slice(0, 600), a: x.q.a, ...(x.q.o ? { o: x.q.o } : {}) };
  return { t, src, q };
}

function ptStart(L) {
  const V = st.view, T = V.timed, pool = timedPool(st.bank, V), now = Date.now();
  const ids = pickTimed(pool, L.count, st.S._ptseen || {}, !!T.balanced);
  st.S._ptseen = st.S._ptseen || {}; ids.forEach(id => st.S._ptseen[id] = (st.S._ptseen[id] || 0) + 1);
  const X = { c: st.cid, cv: st.bank.version, pool: T.pool, set: T.set, min: L.min, ids, start: now, end: now + L.min * 6e4, ans: {} };
  // Source problems only include the questions in scope for this collection; modified problems include every question.
  if (T.pool == 'source') X.keys = ids.flatMap((id, pi) => { const P = findInView(V, id); return P.qs.filter(x => !x.oos).map(x => pi + '|' + x.q.id); });
  X.snap = snapshot(X);
  st.S._pt = X; st.save(); ev('pt_start', { x: 'pt' + L.min, q: ids.join(',') }); renderPT(); scrollTo(0, 0); ptTick();
}
const findInView = (V, id) => { for (const ex of V.exams) for (const P of ex.problems) if (P.p.id === id) return P; return null; };

export function showPT(on) {
  st.ptView = on; if (!on) st.ptHist = null; st.S._view = on ? 'pt' : ''; st.save(); document.body.classList.toggle('ptm', on);
  if (on) renderPT(); else render(); scrollTo(0, 0); ptTick();
}

export function renderPT() {
  if (st.ptHist != null && !ptX()) st.ptHist = null;
  const X = ptX(); m.innerHTML = ''; nav.innerHTML = ''; FILLS.length = 0; if (!X) return ptHome();
  const rev = !!X.done, all = ptQs(X), nt = document.createElement('div'); nt.className = 'note';
  const other = X.c !== st.cid ? `<b>This is your ${esc(label(X.c))} practice exam.</b> You’re studying for ${esc(st.view.label)}; switching didn’t pause or restart it. ` : '';
  const changed = all.some(x => x.gone) ? ' Some questions have changed since this attempt, so they show only the saved question text and answer key.' : '';
  const fromPool = X.pool == 'source' ? 'Each problem is an original past exam problem; its source is shown under the title.' : 'Each problem is a modified version of a recommended past exam problem; its source is shown under the title.';
  if (rev) {
    const ok = all.filter(k => X.res[k.key]?.ok).length, used = X.sub - X.start;
    nt.innerHTML = other + (st.ptHist != null ? `<b>${esc(label(X.c))} attempt from ${esc(ptDate(X.d))}.</b> ` : '') + (X.lost ? 'Your answers to this attempt weren’t saved, so only the questions and official answers are shown. ' : '') + `<b>Score: ${ok}/${all.length} questions (${Math.round(100 * ok / all.length)}%).</b> ${X.sub >= X.end - 500 ? 'Time ran out, so the exam submitted itself.' : `Submitted after ${fmtT(used)} of ${fmtClock(X.min)}.`} <span class="mut">${fromPool}${changed}</span>`;
  } else nt.innerHTML = other + `<b>${esc(label(X.c))} practice exam · ${fmtMin(X.min)}.</b> ${X.ids.length} problems, ${all.length} questions. Your answers save as you type. Nothing is checked until you submit, and the exam submits itself when time runs out.${X.pool == 'source' ? ' These are original past exam problems, so you may have seen some of them.' : ''}`;
  m.append(nt);
  X.ids.forEach((id, pi) => {
    const p = prob(X, id) || { t: X.snap?.t?.[id] || id, b: [] }, d = document.createElement('section'); d.className = 'prob'; d.id = 'pt-' + pi; d.style.scrollMarginTop = '64px';
    const src = srcOf(X, id);
    // Adapted problems say so during the exam too; other sources are only shown afterwards.
    const tip = p.adapted ? `<span class="tip adapted">⇄ ${esc(rev ? src : 'Adapted to Gleam by this site from a Scheme exam problem')}</span>` : rev && src ? `<span class="tip oos">${X.pool == 'source' ? 'From' : 'Based on'} ${esc(src)}</span>` : '';
    d.innerHTML = `<h2>${pi + 1}. ${esc(p.t)}</h2>` + (tip ? `<div class="tips">${tip}</div>` : '');
    const mine = all.filter(x => x.pi == pi), keys = new Set(mine.map(x => x.key));
    p.b.forEach(b => {
      if (b.s) { const t = document.createElement('div'); t.className = 'txt';
        // Hide the "Show all answers" fills until the exam is over.
        t.innerHTML = segHTML(rev ? b.s : b.s.map(g => g.f ? { ...g, f: null } : g)); if (rev) wireFills(t); d.append(t); return; }
      if (keys.has(pi + '|' + b.id)) d.append(ptCard(mine.find(x => x.key == pi + '|' + b.id), p, rev, X));
    });
    mine.filter(x => x.gone).forEach(x => d.append(ptCard(x, p, rev, X)));
    m.append(d);
  });
  const end = document.createElement('div'); end.className = 'ptend'; end.innerHTML = endButtons(X, rev, false); m.append(end);
  ptSide(); ptWire(document); ptTick();
}
function endButtons(X, rev, side) {
  if (st.ptHist != null) return '<button class="p" data-act="home">' + (st.S._pt && !st.S._pt.done ? 'Back to your exam' : 'Practice exam home') + '</button><button data-act="back">Back to practice questions</button>';
  if (rev) return '<button class="p" data-act="new">Take another exam</button><button data-act="back">Back to practice questions</button>';
  return '<button class="p" data-act="submit">Submit exam</button>' + (side ? '<button data-act="quit" data-tip="Throw away this attempt">Quit exam</button>' : '');
}

function ptCard(x, p, rev, X) {
  const { q, key } = x, w = document.createElement('div'), c = document.createElement('div'), v = X.ans[key], r = rev ? X.res[key] : null, busy = !!X.grading;
  w.className = 'qw'; w.id = 'ptq-' + key.replace('|', '-'); c.className = 'q' + (r && !X.lost ? r.ok ? ' ok' : ' no' : '');
  const tag = { mc: 'Multiple choice', sata: 'Select all that apply', blank: 'Fill in the blank' }[q.k], dis = rev || busy ? ' disabled' : '';
  let h = `<div class="qh"><div class="tag">${tag}</div><span class="fb" role="status"></span></div><div class="ql">${segHTML(q.l)}</div>`;
  if (q.k == 'blank') h += `<textarea rows="1" spellcheck="false" aria-label="Your answer" placeholder="${rev ? X.lost ? '(not saved)' : '(no answer)' : 'Your answer…'}"${dis}></textarea>`;
  else q.o.forEach((o, i) => {
    const right = rev && (q.k == 'mc' ? q.a === i || !!q.also?.includes(i) : q.a.includes(i)), picked = v != null && (q.k == 'mc' ? v === i : v.includes(i));
    h += `<label class="o${right ? ' right' : rev && picked ? ' wrong' : ''}"><input type="${q.k == 'mc' ? 'radio' : 'checkbox'}" name="pt-${key}" value="${i}"${dis}><span>${esc(o)}</span></label>`;
  });
  if (r && !r.ok && !r.none && !x.gone) h += `<div class="row"><button class="ai" data-tip="Copies a prompt about your mistake. Paste it into ChatGPT, Claude, or any AI chat.">${AI_ICON}<span>Ask AI why</span></button></div><div class="out"></div>`;
  c.innerHTML = h;
  const ta = c.querySelector('textarea'), ins = [...c.querySelectorAll('input')], grow = () => { if (!ta) return; ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 2 + 'px'; };
  if (ta) { ta.value = v || ''; ta.addEventListener('input', grow); requestAnimationFrame(grow); } else if (v != null) ins.forEach(i => i.checked = q.k == 'mc' ? v === +i.value : v.includes(+i.value));
  if (!rev) {
    if (ta) ta.oninput = () => { X.ans[key] = ta.value; st.save(); ptCounts(); };
    ins.forEach(i => i.onchange = () => { X.ans[key] = q.k == 'mc' ? +i.value : ins.filter(y => y.checked).map(y => +y.value); st.save(); ptCounts(); });
  }
  w.append(c);
  if (r) {
    const fb = c.querySelector('.fb'); fb.className = 'fb ' + (X.lost ? '' : r.ok ? 'ok' : 'no');
    fb.innerHTML = r.ok ? '✓ ' + esc(r.m || 'Correct') : X.lost ? 'Your answer wasn’t saved' : r.none ? '✗ Not answered' : '✗ Not quite' + (q.k == 'blank' ? ' <button class="mk" data-tip="Count this as correct, e.g. if your answer works but is written differently">I was right</button>' : '');
    const mk = fb.querySelector('.mk'); if (mk) mk.onclick = () => { r.ok = true; r.m = 'Marked correct by you'; const hs = (st.S._pth || []).find(h => h.d == X.sub); if (hs) { hs.ok++; if (hs !== X && hs.res && hs.res[key]) Object.assign(hs.res[key], { ok: true, m: r.m }); } st.save(); const y = scrollY; renderPT(); scrollTo(0, y); };
    const out = c.querySelector('.out'); if (out) { const o = r.o || (q.k == 'blank' && !runs(q) ? 'Compared with the official answer text; this answer wasn’t run.' : ''); out.hidden = !o; out.textContent = o; }
    const ai = c.querySelector('.ai'); if (ai) wireAI(ai, () => aiPrompt('Timed practice exam', p, q, v, r.o, label(X.c)));
    const an = document.createElement('div'); an.className = 'ans'; an.innerHTML = `<h4>Official answer</h4><div class="k">${esc(keyText(q))}</div>` + (q.x ? `<div class="x">${esc(q.x)}</div>` : ''); w.append(an);
  } else if (!rev) c.querySelector('.qh .tag').dataset.tip = howChecked(q, p) + ' when you submit.';
  return w;
}

function ptSide() {
  const X = ptX(), rev = !!X.done, all = ptQs(X), s = document.createElement('div'); s.className = 'ptside';
  let h = rev ? `<div class="ptscore">${all.filter(k => X.res[k.key]?.ok).length}/${all.length}</div><div class="ptsub mut">questions correct</div>`
    : `<div class="ptclock" id="ptclock">${fmtT(Math.max(0, X.end - Date.now()))}</div><div class="ptsub mut" id="ptleft">left of ${fmtClock(X.min)}${X.c !== st.cid ? ' · ' + esc(label(X.c)) : ''}</div>`;
  X.ids.forEach((id, pi) => { h += `<a href="#pt-${pi}" data-pi="${pi}"><span class="nm">${pi + 1}. ${esc((prob(X, id)?.t || X.snap?.t?.[id] || id).replace(/\s*\([\d.]+ pts\)$/, ''))}</span><span class="ct" id="ptc-${pi}"></span></a>`; });
  h += `<div class="ptbtns">${endButtons(X, rev, true)}</div>`;
  s.innerHTML = h; nav.append(s);
  s.querySelectorAll('a').forEach(a => a.onclick = e => { e.preventDefault(); document.getElementById('pt-' + a.dataset.pi)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  ptCounts();
}
// Sidebar counts: answered/total while taking the exam, correct/total in review.
function ptCounts() {
  const X = ptX(); if (!X) return; const all = ptQs(X);
  X.ids.forEach((_, pi) => {
    const el = $('#ptc-' + pi); if (!el) return; const qs = all.filter(k => k.pi == pi);
    const n = X.done ? qs.filter(k => X.res[k.key]?.ok).length : qs.filter(k => !blankAns(X.ans[k.key])).length;
    el.innerHTML = X.done && n == qs.length ? '<span class="done sm" aria-label="All correct">✓</span>' : `${n}/${qs.length}`; el.title = X.done ? 'correct' : 'answered';
  });
}
function ptWire(root) {
  root.querySelectorAll('[data-act]').forEach(b => {
    if (b._w) return; b._w = 1; const a = b.dataset.act;
    if (a == 'submit') confirmBtn(b, () => ptSubmit());
    else if (a == 'quit') confirmBtn(b, () => { st.S._pt = null; st.save(); renderPT(); scrollTo(0, 0); ptTick(); });
    else if (a == 'new') b.onclick = () => { st.S._pt = null; st.save(); renderPT(); scrollTo(0, 0); ptTick(); };
    else if (a == 'back') b.onclick = () => showPT(false);
    else if (a == 'home') b.onclick = () => { st.ptHist = null; if (st.S._pt && st.S._pt.done) { st.S._pt = null; st.save(); } renderPT(); scrollTo(0, 0); ptTick(); };
  });
}

function ptHome() {
  const V = st.view, T = V.timed, pool = timedPool(st.bank, V), Ls = timedLengths(V, pool), C = cs();
  const qper = pool.length ? questionsPer(V, pool) : 0, q = n => Math.max(1, Math.round(qper * n / 5) * 5);
  let sel = Ls.find(L => L.ok && L.min == C.ptlen) || Ls.find(L => L.ok);
  const H = (st.S._pth || []).filter(x => x.c == st.cid), others = (st.S._pth || []).length - H.length;
  m.innerHTML = `<section class="prob pthome"><h2>Timed practice exam · ${esc(V.label)}</h2>
<p>${esc(T.intro)}</p>
${Ls.length ? `<div class="ptopts" role="radiogroup" aria-label="Exam length">${Ls.map(L => `<button type="button" class="ptopt" role="radio" aria-checked="${L === sel}" data-min="${L.min}"${L.ok ? '' : ' disabled'}><b>${fmtMin(L.min)}</b><span>${L.ok ? `${L.count} problems · about ${q(L.count)} questions${L.note ? ' · ' + esc(L.note) : ''}` : `Needs ${L.count} problems; ${pool.length} available`}</span></button>`).join('')}</div>` : ''}
<ul class="ptrules"><li>The clock starts when you press Start exam.</li><li>Nothing is checked until you submit. Then you get your score and every official answer with explanations.</li><li>Python fill-in blanks that come with doctests are checked by running your code; everything else is compared with the official answer, and you can mark an equivalent text answer correct.</li><li>When time runs out, the exam submits itself.</li><li>Answers are saved in this browser, so reloading the page won't lose them.</li></ul>
${sel ? '<button class="p" id="ptgo">Start exam</button>' : `<p class="mut">There aren’t enough ${esc(V.label)} problems for a timed exam yet.</p>`}
${H.length ? `<h3>Past ${esc(V.label)} attempts</h3><table class="pth"><thead><tr><th>Date</th><th>Length</th><th>Score</th><th>Time used</th></tr></thead><tbody>${H.map(x => `<tr><td>${x.ids ? `<a href="#" class="pthl" data-d="${x.d}">${esc(ptDate(x.d))}</a>` : esc(ptDate(x.d))}</td><td>${fmtClock(x.min)}</td><td>${x.ok}/${x.n} (${Math.round(100 * x.ok / x.n)}%)</td><td>${fmtT(x.used)}</td></tr>`).join('')}</tbody></table>` : ''}
${others ? `<p class="mut">You have ${others} past attempt${others > 1 ? 's' : ''} for other exams. Switch “Studying for” to see ${others > 1 ? 'them' : 'it'}.</p>` : ''}
</section>`;
  nav.innerHTML = '<div class="ptside"><div class="fhint">Pick a length, then press Start exam. Use the button in the top left to go back to the practice questions.</div></div>';
  const opts = [...m.querySelectorAll('.ptopt')];
  opts.forEach(o => o.onclick = () => { if (o.disabled) return; C.ptlen = +o.dataset.min; sel = Ls.find(L => L.min == C.ptlen); st.save(); opts.forEach(x => x.setAttribute('aria-checked', x === o)); });
  const go = $('#ptgo'); if (go) go.onclick = () => ptStart(sel);
  m.querySelectorAll('.pthl').forEach(a => a.onclick = e => { e.preventDefault(); ptOpen(+a.dataset.d); });
}
function questionsPer(V, pool) {
  if (V.timed.pool == 'modified') { const P = st.bank.timed[V.timed.set]; return P.reduce((n, p) => n + p.b.filter(b => b.k).length, 0) / P.length; }
  const ids = new Set(pool.map(x => x.id)); let n = 0;
  for (const ex of V.exams) for (const P of ex.problems) if (ids.has(P.p.id)) n += P.qs.filter(x => !x.oos).length;
  return n / pool.length;
}
// Function declarations below may run during the first render (sidebar -> ptHistNav).
export function ptDate(d) { return new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
function ptOpen(d) { st.ptHist = d; st.ptView = true; st.S._view = 'pt'; st.save(); document.body.classList.add('ptm'); renderPT(); scrollTo(0, 0); ptTick(); }
export function ptHistNav(nav) {
  const H = (st.S._pth || []).filter(x => x.c == st.cid); if (!H.length) return; const box = document.createElement('div'); box.className = 'hist';
  box.innerHTML = '<div class="histh">Practice exam history</div>' + H.map(x => {
    const lab = `<span class="nm">${esc(ptDate(x.d))} · ${fmtMin(x.min, true)}</span><span class="ct">${x.ok}/${x.n}</span>`;
    return x.ids ? `<a href="#" data-d="${x.d}" data-tip="Review this attempt">${lab}</a>` : `<div class="old" data-tip="Only the score was saved for this attempt">${lab}</div>`;
  }).join('');
  box.querySelectorAll('a').forEach(a => a.onclick = e => { e.preventDefault(); ptOpen(+a.dataset.d); }); nav.append(box);
}

async function ptSubmit() {
  const X = st.S._pt; if (!X || X.done || ptBusy) return; ptBusy = true; X.grading = 1; X.sub = X.sub || Math.min(Date.now(), X.end); st.save();
  if (st.ptView) { const y = scrollY; renderPT(); scrollTo(0, y); } ptTick();
  const all = ptQs(X), res = {}; let i = 0;
  for (const { p, q, key, gone } of all) {
    const v = X.ans[key], c = $('#ptclock'); i++;
    if (c) { c.classList.add('busy'); c.textContent = !blankAns(v) && /^Loading/.test(loadingText(q, p)) ? loadingText(q, p).replace(/ \(.*/, '') : `Grading ${i}/${all.length}`; }
    if (blankAns(v)) { res[key] = { ok: false, none: 1 }; continue; }
    if (gone) { res[key] = { ok: false, o: 'This question changed before the exam was graded.' }; continue; }
    try { const g = await grade(q, v, p); res[key] = { ok: g.ok, m: g.how, o: g.out }; } catch (e) { res[key] = { ok: false, o: String(e) }; }
  }
  const ok = all.filter(k => res[k.key].ok).length;
  X.res = res; X.done = 1; delete X.grading; ptBusy = false;
  ev('pt_submit', { c: X.c, x: 'pt' + X.min, q: X.ids.join(','), v: X.sub >= X.end - 500 ? 'timeout' : 'manual', ok, tot: all.length, sec: Math.round((X.sub - X.start) / 1e3) });
  const kept = Object.fromEntries(Object.entries(res).map(([k, v]) => [k, v.o ? { ...v, o: v.o.slice(0, 600) } : v]));
  const H = { d: X.sub, c: X.c, cv: X.cv, pool: X.pool, set: X.set, min: X.min, ok, n: all.length, used: X.sub - X.start, ids: X.ids, keys: X.keys, ans: X.ans, res: kept, snap: X.snap, start: X.start, end: X.end, sub: X.sub, done: 1 };
  if (!H.keys) delete H.keys; if (!H.snap) delete H.snap; if (!H.set) delete H.set;
  st.S._pth = [H, ...(st.S._pth || [])].slice(0, 20); st.save();
  if (st.ptView) { renderPT(); scrollTo(0, 0); } ptTick();
}

// Runs twice a second: exam clock, the header button's label, and the automatic submit when time is up.
export function ptTick() {
  const X = st.S._pt, live = !!X && !X.done && !X.grading, left = live ? Math.max(0, X.end - Date.now()) : 0;
  if (live && left <= 0) { ptSubmit(); return; }
  const c = $('#ptclock'); if (c && live) { c.textContent = fmtT(left); c.classList.toggle('low', left <= 5 * 6e4); }
  const lbl = st.ptView ? 'Practice questions' : live ? 'Exam · ' + fmtT(left) : X && X.grading ? 'Grading exam…' : 'Practice exam', cls = !st.ptView && (live || X && X.grading) ? 'run' : '';
  const tip = st.ptView ? 'Back to the past-exam practice questions' : live ? `Return to your ${label(X.c)} practice exam` : `Take a timed ${st.view.label} practice exam`;
  if (ptb.dataset.l !== lbl || ptb.dataset.tip !== tip) { ptb.dataset.l = lbl; ptb.innerHTML = (st.ptView ? BACKICON : PTICON) + `<span>${esc(lbl)}</span>`; ptb.dataset.tip = tip; ptb.setAttribute('aria-label', lbl); }
  ptb.className = cls;
}
export function initTimed() {
  ptb.onclick = () => showPT(!st.ptView);
  if (st.S._view == 'pt') showPT(true);
  setInterval(ptTick, 500); ptTick();
  if (st.S._pt && st.S._pt.grading && !st.S._pt.done) { delete st.S._pt.grading; ptSubmit(); }
}
