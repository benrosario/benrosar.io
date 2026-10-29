// "Studying for": picks the study collection, keeps it in the URL (?exam=midterm2) and remembers each collection's
// navigation (selected exam, filter, open sidebar groups, scroll position) separately.
// It is a dropdown beside the filter, in the same style (native picker on touch devices).
import { st, cs } from './state.js';
import { $, esc } from './util.js';
import { render } from './practice.js';
import { renderPT, ptTick } from './timed.js';
import { ddSync, dropdown } from './chrome.js';
import { ev } from './events.js';
import { drawSort } from './sort.js';

const ALIAS = { mt1: 'midterm1', mt2: 'midterm2', mt3: 'midterm3', 'midterm-1': 'midterm1', 'midterm-2': 'midterm2', 'midterm-3': 'midterm3', comprehensive: 'final' };
export const fromURL = () => { const v = (new URLSearchParams(location.search).get('exam') || '').toLowerCase(); const id = ALIAS[v] || v; return st.views[id] ? id : null; };
function setURL(cid, push) {
  const u = new URL(location.href); if (u.searchParams.get('exam') === cid) return; u.searchParams.set('exam', cid);
  history[push ? 'pushState' : 'replaceState']({ exam: cid }, '', u);
}

const sel = $('#study'), ddb = $('#sdd .ddb');
// The button shows the option's name; the custom menu also shows its coverage, and the tooltip says it in full.
const full = v => v.id == 'final' ? `${v.label} (${v.sub.toLowerCase()})` : v.label;
const menu = dropdown($('#sdd'), { head: 'Studying for', label: o => st.views[o.value].label,
  opt: o => `${esc(st.views[o.value].label)}<span class="sub">${esc(st.views[o.value].sub)}</span>` });
function draw() {
  if (!sel.options.length) sel.innerHTML = st.bank.collections.map(c => `<option value="${c.id}">${esc(st.views[c.id].label)}</option>`).join('');
  sel.value = st.cid; menu.sync();
  ddb.dataset.tip = `Studying for ${full(st.view)}. ${st.view.coverage?.text || ''}`;
}
// Make collection `cid` current. push: add a history entry (user action); otherwise replace (load / Back / Forward).
export function select(cid, { push = false, initial = false } = {}) {
  if (!initial && cid === st.cid) return;
  if (!initial && !st.ptView) cs().y = scrollY;
  // A finished attempt from the collection being left is done with (it's in that collection's history).
  if (!initial && st.S._pt?.done && st.S._pt.c === st.cid) { st.S._pt = null; st.ptHist = null; }
  // Switching from the home page stays on the home page; otherwise each collection reopens its own exam (ex '' is home).
  const home = !initial && st.cur < 0;
  st.cid = cid; st.S._c = cid; st.view = st.views[cid];
  const C = cs();
  st.cur = home || C.ex === '' ? -1 : Math.max(0, st.view.exams.findIndex(ex => ex.id === C.ex));
  if (!C.open) C.open = st.cur < 0 ? {} : { [st.view.exams[st.cur].id]: 1 };
  $('#flt').value = C.f || 'all'; if (!$('#flt').value) $('#flt').value = 'all'; ddSync();
  st.save(); draw(); if (!initial) drawSort(); setURL(cid, push);
  if (!initial) { if (st.ptView) renderPT(); else render(); scrollTo(0, st.ptView ? 0 : C.y || 0); ptTick(); ev('study_select', { v: cid }); }
}
export function initSelector() {
  sel.onchange = () => select(sel.value, { push: true });
  addEventListener('popstate', () => { const cid = fromURL(); if (cid && cid !== st.cid) select(cid); });
}
