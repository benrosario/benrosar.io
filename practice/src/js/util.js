// Small DOM helpers and animations shared across the app.
export const $ = s => document.querySelector(s);
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// Chromium reports "macOS" through userAgentData; others "MacIntel" (iPads: "MacIntel" or "iPad").
export const isMac = /mac|iphone|ipad|ipod/i.test(navigator.userAgentData?.platform || navigator.platform || '');
// Scroll the page to `el` (honoring its scroll-margin) in at most ~450 ms however far it is; native smooth scrolling
// takes seconds across a long exam. Wheel, touch or key input stops it where it is.
let scrollRun = 0;
export function scrollToEl(el) {
  if (!el) return; const y0 = scrollY; el.scrollIntoView({ block: 'start', behavior: 'instant' }); const y1 = scrollY;
  if (reduced() || Math.abs(y1 - y0) < 2) return; scrollTo({ top: y0, behavior: 'instant' });
  const run = ++scrollRun, t0 = performance.now(), dur = Math.min(450, 200 + Math.abs(y1 - y0) / 20), ac = new AbortController();
  for (const t of ['wheel', 'touchstart', 'keydown']) addEventListener(t, () => { scrollRun++; ac.abort(); }, { passive: true, signal: ac.signal });
  const step = now => { if (run !== scrollRun) return ac.abort(); const k = Math.min(1, (now - t0) / dur);
    scrollTo({ top: y0 + (y1 - y0) * (1 - (1 - k) ** 3), behavior: 'instant' }); if (k < 1) requestAnimationFrame(step); else ac.abort(); };
  requestAnimationFrame(step);
}
export const SV = p => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
export const fmtT = ms => { const t = Math.ceil(ms / 1e3), h = Math.floor(t / 3600), mm = String(Math.floor(t / 60) % 60).padStart(2, '0'), ss = String(t % 60).padStart(2, '0'); return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`; };
// 50 -> "50 minutes", 110 -> "1 hour 50 minutes"; short form "50 min", "1 h 50 min"; clock form "50:00", "1:50:00".
export const fmtMin = (n, short) => { const h = Math.floor(n / 60), m = n % 60;
  if (short) return [h ? h + ' h' : '', m ? m + ' min' : ''].filter(Boolean).join(' ');
  return [h ? h + (h > 1 ? ' hours' : ' hour') : '', m ? m + ' minutes' : ''].filter(Boolean).join(' '); };
export const fmtClock = n => fmtT(n * 6e4);
export const AI_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="3" width="8" height="4" rx="1"/><path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/></svg>';
// Icons for a question's Check, Hint, Show answer and Reset buttons (swapLabel keeps them when the label changes).
const icon = d => `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
export const ICON = {
  check: icon('M20 6 9 17l-5-5'),
  hint: icon('M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4'),
  answer: icon('M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zM14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8'),
  reset: icon('M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2M10 11v6M14 11v6'),
};

// Measure the current on-screen width first (mid-animation included), then apply the change, then animate.
// Sizes are read from computed style (CSS px), not getBoundingClientRect, so they stay right when the question area is zoomed.
export function swapLabel(btn, text, change) {
  const cssW = () => parseFloat(getComputedStyle(btn).width), w0 = cssW(), ic = btn.querySelector(':scope>svg'); btn.getAnimations().forEach(a => a.cancel());
  change && change(); btn.innerHTML = `<span class="lbl">${esc(text)}</span>`; if (ic) btn.prepend(ic);
  if (reduced() || !btn.animate) return;
  const w1 = cssW();
  if (Math.abs(w1 - w0) > .5) btn.animate([{ width: w0 + 'px' }, { width: w1 + 'px' }], { duration: 300, easing: 'cubic-bezier(.25,.8,.25,1)' });
  btn.lastChild.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
}
// Open or close a block by animating its height (plus padding, margin and borders) so content below moves smoothly.
export function slide(el, open) {
  if (reduced() || !el.animate) { el.hidden = !open; return; }
  el.getAnimations().forEach(a => a.cancel()); if (open) el.hidden = false; if (el.hidden) return;
  const cs = getComputedStyle(el), full = { height: cs.height, paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, marginTop: cs.marginTop, borderTopWidth: cs.borderTopWidth, borderBottomWidth: cs.borderBottomWidth, opacity: 1 },
    zero = { height: '0px', paddingTop: '0px', paddingBottom: '0px', marginTop: '0px', borderTopWidth: '0px', borderBottomWidth: '0px', opacity: 0 };
  el.style.overflow = 'hidden'; const a = el.animate(open ? [zero, full] : [full, zero], { duration: open ? 240 : 180, easing: open ? 'cubic-bezier(.2,.8,.2,1)' : 'ease-in' });
  a.onfinish = () => { el.style.overflow = ''; if (!open) el.hidden = true; };
}
// Two-step button: first click asks "Are you sure?" (or `armed()`'s text), second click within 3s acts.
// skip() can handle a click without asking. Returns relabel(text), which sets the button's resting label (and disarms it).
export function confirmBtn(btn, act, skip, armed) {
  let label = btn.textContent, t;
  const disarm = () => { clearTimeout(t); if (!btn.classList.contains('arm')) return; swapLabel(btn, label, () => btn.classList.remove('arm')); };
  btn.onclick = () => {
    if (skip && skip()) return disarm(); if (btn.classList.contains('arm')) { disarm(); act(); return; }
    swapLabel(btn, armed ? armed() : label + ': are you sure?', () => btn.classList.add('arm')); t = setTimeout(disarm, 3000);
  };
  btn.onblur = () => setTimeout(() => { if (document.activeElement !== btn) disarm(); }, 150);
  return text => { clearTimeout(t); label = text; swapLabel(btn, text, () => btn.classList.remove('arm')); };
}
// Burst of confetti from the middle of el. small: fewer, smaller pieces that stay close (the sidebar's finished-problem burst).
export function confetti(el, small) {
  if (reduced()) return;
  const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, C = ['#1f8a4c', '#2a5bd7', '#f2b705', '#e8505b', '#8e5cd9', '#14b8a6'], k = small ? .45 : 1;
  for (let i = 0; i < (small ? 14 : 26); i++) {
    const p = document.createElement('span'); p.className = small ? 'cf sm' : 'cf'; p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.background = C[i % C.length]; document.body.append(p);
    const a = Math.random() * Math.PI * 2, v = (40 + Math.random() * 60) * k, dx = Math.cos(a) * v, dy = (Math.sin(a) * v - 30 * k);
    p.animate([{ transform: 'translate(-50%,-50%) rotate(0)', opacity: 1 }, { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy + 70 * k}px)) rotate(${Math.random() * 540 - 270}deg)`, opacity: 0 }], { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => p.remove();
  }
}
export async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) {
    const a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.append(a); a.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} a.remove(); return ok;
  }
}
// Wire an "Ask AI why" button: copy the prompt, then show "Copied" for a moment.
export function wireAI(btn, prompt) {
  let back; btn.onclick = async () => { const t = prompt(); if (!t) return; const ok = await copyText(t); clearTimeout(back);
    swapLabel(btn, ok ? 'Copied! Paste into an AI chat' : 'Couldn’t copy', () => btn.classList.toggle('copied', ok));
    back = setTimeout(() => swapLabel(btn, 'Ask AI why', () => btn.classList.remove('copied')), 2500); };
}

// Animate the content only when its destination changes; grading redraws stay still.
let viewKey = '', viewFrame = 0, viewAnimation;
export function animateView(key) {
  if (key === viewKey) return;
  viewKey = key; cancelAnimationFrame(viewFrame); viewAnimation?.cancel();
  if (reduced()) return;
  viewFrame = requestAnimationFrame(() => {
    const content = $('#m');
    viewAnimation = content?.animate([{ opacity: .3, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' });
  });
}

// Collection changes slide their content while the central choice stays visually anchored.
export function animatePracticeCollection(direction) {
  cancelAnimationFrame(viewFrame); viewAnimation?.cancel();
  if (reduced()) return;
  const content = $('#m .pthome') || $('#m .ptsession');
  content?.animate([{ opacity: .15, transform: `translateX(${direction * 28}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' });
}
