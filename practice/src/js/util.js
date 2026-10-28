// Small DOM helpers and animations shared across the app.
export const $ = s => document.querySelector(s);
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const SV = p => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
export const fmtT = ms => { const t = Math.ceil(ms / 1e3), h = Math.floor(t / 3600), mm = String(Math.floor(t / 60) % 60).padStart(2, '0'), ss = String(t % 60).padStart(2, '0'); return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`; };
// 50 -> "50 minutes", 110 -> "1 hour 50 minutes"; short form "50 min", "1 h 50 min"; clock form "50:00", "1:50:00".
export const fmtMin = (n, short) => { const h = Math.floor(n / 60), m = n % 60;
  if (short) return [h ? h + ' h' : '', m ? m + ' min' : ''].filter(Boolean).join(' ');
  return [h ? h + (h > 1 ? ' hours' : ' hour') : '', m ? m + ' minutes' : ''].filter(Boolean).join(' '); };
export const fmtClock = n => fmtT(n * 6e4);
export const AI_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="3" width="8" height="4" rx="1"/><path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/></svg>';

// Measure the current on-screen width first (mid-animation included), then apply the change, then animate.
// Sizes are read from computed style (CSS px), not getBoundingClientRect, so they stay right when the question area is zoomed.
export function swapLabel(btn, text, change) {
  const cssW = () => parseFloat(getComputedStyle(btn).width), w0 = cssW(); btn.getAnimations().forEach(a => a.cancel());
  change && change(); btn.innerHTML = `<span class="lbl">${esc(text)}</span>`;
  if (reduced() || !btn.animate) return;
  const w1 = cssW();
  if (Math.abs(w1 - w0) > .5) btn.animate([{ width: w0 + 'px' }, { width: w1 + 'px' }], { duration: 300, easing: 'cubic-bezier(.25,.8,.25,1)' });
  btn.firstChild.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
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
// skip() can handle a click without asking.
export function confirmBtn(btn, act, skip, armed) {
  const label = btn.textContent; let t;
  const disarm = () => { clearTimeout(t); if (!btn.classList.contains('arm')) return; swapLabel(btn, label, () => btn.classList.remove('arm')); };
  btn.onclick = () => {
    if (skip && skip()) return disarm(); if (btn.classList.contains('arm')) { disarm(); act(); return; }
    swapLabel(btn, armed ? armed() : label + ': are you sure?', () => btn.classList.add('arm')); t = setTimeout(disarm, 3000);
  };
  btn.onblur = () => setTimeout(() => { if (document.activeElement !== btn) disarm(); }, 150);
}
export function confetti(el) {
  if (reduced()) return;
  const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, C = ['#1f8a4c', '#2a5bd7', '#f2b705', '#e8505b', '#8e5cd9', '#14b8a6'];
  for (let i = 0; i < 26; i++) {
    const p = document.createElement('span'); p.className = 'cf'; p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.background = C[i % C.length]; document.body.append(p);
    const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 60, dx = Math.cos(a) * v, dy = Math.sin(a) * v - 30;
    p.animate([{ transform: 'translate(-50%,-50%) rotate(0)', opacity: 1 }, { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy + 70}px)) rotate(${Math.random() * 540 - 270}deg)`, opacity: 0 }], { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => p.remove();
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
  btn.onclick = async () => { const t = prompt(); if (!t) return; const ok = await copyText(t); const lb = btn.querySelector('span');
    lb.textContent = ok ? 'Copied! Paste into an AI chat' : 'Couldn’t copy'; btn.classList.toggle('copied', ok); setTimeout(() => { lb.textContent = 'Ask AI why'; btn.classList.remove('copied'); }, 2500); };
}
