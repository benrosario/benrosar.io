// Sorting the sidebar's source exams: the "Sort" chip opens a small panel of options and the arrow chip reverses
// the order. The choice is remembered per collection (S._cs[c].sort = {by, desc}).
import { st, cs } from './state.js';
import { $, esc, SV, reduced } from './util.js';
import { SORTS, sortOptions } from './model.js';
import { sidebar, sortState } from './practice.js';

const btn = $('#srtb'), panel = $('#srtp'), opts = $('#srto'), dirb = $('#srtd'), m = $('#m');
const ICON = SV('<path d="M4 6h16M7 12h10M10 18h4"/>');
const ARROW = desc => SV(desc ? '<path d="M12 5v14M6 13l6 6 6-6"/>' : '<path d="M12 19V5M6 11l6-6 6 6"/>');

export function drawSort() {
  const { by, desc } = sortState(), s = SORTS[by], dir = desc ? s.desc : s.asc;
  btn.innerHTML = ICON + `<span>Sort: ${esc(s.label)}</span>`; btn.setAttribute('aria-label', `Sort exams by ${s.label}`);
  btn.dataset.tip = 'Choose how the exams in the sidebar are ordered';
  dirb.innerHTML = ARROW(desc) + `<span>${esc(dir)}</span>`;
  dirb.setAttribute('aria-label', `Order: ${dir}. Press to reverse.`); dirb.dataset.tip = 'Reverse the order';
  opts.innerHTML = sortOptions(st.view).map(k => `<button type="button" role="radio" aria-checked="${k == by}" tabindex="${k == by ? 0 : -1}" data-k="${k}">${esc(SORTS[k].label)}</button>`).join('');
}
// Apply a sort, keeping the sidebar list in place on screen.
function set(by, desc) {
  cs().sort = { by, desc }; st.save(); drawSort();
  const t0 = m.getBoundingClientRect().top; sidebar(); const dy = m.getBoundingClientRect().top - t0; if (dy) scrollBy({ top: dy, behavior: 'instant' });
}
function open() {
  panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); requestAnimationFrame(() => panel.classList.add('in'));
  opts.querySelector('[aria-checked=true]')?.focus();
}
function close(focus) {
  if (panel.hidden) return; panel.classList.remove('in'); btn.setAttribute('aria-expanded', 'false');
  if (reduced()) panel.hidden = true; else setTimeout(() => { if (!panel.classList.contains('in')) panel.hidden = true; }, 150);
  if (focus) btn.focus();
}
export function initSort() {
  drawSort();
  btn.onclick = () => panel.hidden || !panel.classList.contains('in') ? open() : close();
  dirb.onclick = () => { const s = sortState(); set(s.by, !s.desc); };
  // Picking an option uses that option's natural direction (e.g. newest first for dates), then closes the panel.
  opts.onclick = e => { const b = e.target.closest('button[data-k]'); if (!b) return; const k = b.dataset.k, s = sortState();
    set(k, k == s.by ? s.desc : SORTS[k].dir == 'desc'); close(true); };
  // Radio-group keys: arrows move between options (choosing with Enter or Space), Escape closes.
  panel.onkeydown = e => {
    if (e.key == 'Escape') { e.preventDefault(); return close(true); }
    const bs = [...opts.querySelectorAll('button')], i = bs.indexOf(document.activeElement);
    const j = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: bs.length - 1 }[e.key];
    if (j == null || i < 0) return; e.preventDefault(); bs[(j + bs.length) % bs.length].focus();
  };
  document.addEventListener('mousedown', e => { if (!panel.hidden && !e.target.closest('.srt')) close(); });
  panel.addEventListener('focusout', () => setTimeout(() => { if (!panel.hidden && !panel.contains(document.activeElement) && document.activeElement !== btn) close(); }, 100));
}
