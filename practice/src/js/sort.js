// Sorting the sidebar's source exams: one split chip. Its label opens a small panel of options and the arrow at its
// end reverses the order. The arrow turns to point down for descending and is tinted blue when the order is the
// reverse of that option's usual one. The choice is remembered per collection (S._cs[c].sort = {by, desc}).
import { st, cs } from './state.js';
import { $, esc, SV, reduced } from './util.js';
import { SORTS, sortOptions } from './model.js';
import { sidebar, sortState } from './practice.js';

const btn = $('#srtb'), panel = $('#srtp'), opts = $('#srto'), dirb = $('#srtd'), m = $('#m'), nav = $('#nav');
const ICON = SV('<path d="M4 6h16M7 12h10M10 18h4"/>');
const ARROW = SV('<path d="M12 19V5M6 11l6-6 6 6"/>');

export function drawSort() {
  const { by, desc } = sortState(), s = SORTS[by], dir = desc ? s.desc : s.asc;
  btn.innerHTML = ICON + `<span>Sort: ${esc(s.label)}</span>`; btn.setAttribute('aria-label', `Sort exams by ${s.label}`);
  btn.dataset.tip = 'Choose how the exams in the sidebar are ordered';
  const rev = desc !== (s.dir == 'desc'); if (!dirb.firstChild) dirb.innerHTML = ARROW;
  dirb.classList.toggle('desc', desc); dirb.classList.toggle('rev', rev);
  dirb.setAttribute('aria-label', `Order: ${dir}. Press to reverse.`); dirb.dataset.tip = `${dir} · press to reverse`;
  opts.innerHTML = sortOptions(st.view).map(k => `<button type="button" role="radio" aria-checked="${k == by}" tabindex="${k == by ? 0 : -1}" data-k="${k}">${esc(SORTS[k].label)}</button>`).join('');
}
// Apply a sort, keeping the sidebar list in place on screen, and fade the list in so the new order reads as a change.
function set(by, desc) {
  cs().sort = { by, desc }; st.save(); drawSort();
  const t0 = m.getBoundingClientRect().top; sidebar(); const dy = m.getBoundingClientRect().top - t0; if (dy) scrollBy({ top: dy, behavior: 'instant' });
  if (!reduced() && nav.animate) nav.animate([{ opacity: .15, transform: 'translateY(3px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
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
