// Page chrome: theme and code-color toggles, sidebar resizing, zoom, tooltips, the filter dropdown and the countdown timer.
import { st, cs } from './state.js';
import { $, esc, SV } from './util.js';
import { sidebar, render, firstMatch } from './practice.js';
import { ev } from './events.js';

const m = $('#m'), side = $('#side'), th = $('#th'), hlb = $('#hlb'), flt = $('#flt');
const THEMES = ['auto', 'light', 'dark'];
const ICONS = { light: SV('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  dark: SV('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
  auto: SV('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>') };

function applyHL() {
  const on = st.S._hl !== false; document.body.classList.toggle('nohl', !on); hlb.setAttribute('aria-pressed', on);
  hlb.dataset.tip = on ? 'Code colors on. Click to turn off.' : 'Code colors off. Click to turn on.'; hlb.setAttribute('aria-label', 'Code colors');
  hlb.innerHTML = SV('<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.5-1.2-.3-.3-.5-.7-.5-1.1 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4.1-4-7.5-9-7.5z"/><g class="on-only" fill="currentColor" stroke="none"><circle cx="7.5" cy="11" r="1.3"/><circle cx="10" cy="7" r="1.3"/><circle cx="14.5" cy="7" r="1.3"/><circle cx="17" cy="11" r="1.3"/></g>' + (on ? '' : '<path d="M4 4l16 16"/>'));
}
function applyTheme() {
  const t = st.S._theme || 'auto'; if (t == 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
  const name = { auto: 'Auto (follows system)', light: 'Light', dark: 'Dark' }[t]; th.innerHTML = ICONS[t]; th.dataset.tip = 'Theme: ' + name + '. Click to change.'; th.setAttribute('aria-label', 'Theme: ' + name);
}
// The theme is applied before content loads (no flash); the rest waits for the first render.
export function initTheme() {
  hlb.onclick = () => { st.S._hl = st.S._hl === false; st.save(); applyHL(); };
  th.onclick = () => {
    st.S._theme = THEMES[(THEMES.indexOf(st.S._theme || 'auto') + 1) % 3]; st.save(); ev('theme', { v: st.S._theme });
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) { const t = document.startViewTransition(applyTheme); t.ready.catch(() => {}); t.finished.catch(() => {}); t.updateCallbackDone.catch(() => {}); } else applyTheme();
  };
  applyTheme(); applyHL();
}

// ---- dropdown menus over a native <select> (custom menu with a fine pointer; touch devices keep the native picker) ----
// Used by the filter and "Studying for". The select's onchange does the work; opt(o) is an option's menu HTML,
// label(o) the button text, head an optional menu heading.
export function dropdown(dd, { opt = o => esc(o.text), label = o => o.text, head = '' } = {}) {
  const sel = dd.querySelector('select'), ddb = dd.querySelector('.ddb'), ddm = dd.querySelector('.ddm'); let ddi = 0;
  const opts = () => [...sel.options], items = () => [...ddm.querySelectorAll('li[role=option]')];
  function sync() {
    const o = sel.selectedOptions[0]; ddb.querySelector('span').textContent = o ? label(o) : '';
    ddm.innerHTML = (head ? `<li class="ddh" role="presentation">${esc(head)}</li>` : '') + opts().map((o, i) => `<li role="option" id="${ddm.id}-${i}" data-v="${esc(o.value)}" aria-selected="${o.value == sel.value}"><span class="ck">✓</span>${opt(o)}</li>`).join('');
  }
  function open() { sync(); ddi = Math.max(0, sel.selectedIndex); ddm.hidden = false; ddb.setAttribute('aria-expanded', 'true'); hi(); requestAnimationFrame(() => ddm.classList.add('in')); }
  function close(focus) { ddm.classList.remove('in'); ddm.hidden = true; ddb.setAttribute('aria-expanded', 'false'); if (focus) ddb.focus(); }
  function hi() { items().forEach((li, i) => li.classList.toggle('hi', i == ddi)); ddb.setAttribute('aria-activedescendant', `${ddm.id}-${ddi}`); }
  function pick(v) { close(true); if (sel.value !== v) { sel.value = v; sel.onchange(); } else sync(); }
  ddb.onclick = () => ddm.hidden ? open() : close();
  ddm.onmousedown = e => e.preventDefault();
  ddm.onclick = e => { const li = e.target.closest('li[role=option]'); if (li) pick(li.dataset.v); };
  ddm.onmousemove = e => { const li = e.target.closest('li[role=option]'); if (li) { ddi = items().indexOf(li); hi(); } };
  ddb.onkeydown = e => {
    const n = opts().length;
    if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); if (ddm.hidden) return open(); ddi = (ddi + (e.key == 'ArrowDown' ? 1 : n - 1)) % n; hi(); }
    else if ((e.key == 'Enter' || e.key == ' ') && !ddm.hidden) { e.preventDefault(); pick(opts()[ddi].value); }
    else if (e.key == 'Escape' && !ddm.hidden) { e.preventDefault(); close(true); }
  };
  ddb.onblur = () => setTimeout(() => { if (!dd.contains(document.activeElement)) close(); }, 100);
  document.addEventListener('mousedown', e => { if (!ddm.hidden && !dd.contains(e.target)) close(); });
  return { sync };
}
const filterMenu = dropdown($('#dd'));
export const ddSync = () => filterMenu.sync();
function initFilter() {
  flt.onchange = () => { const wasReview = cs().f === 'missed'; cs().f = flt.value; if (flt.value === 'missed') { const i = firstMatch(); if (i >= 0) st.cur = i; } st.save(); const t0 = m.getBoundingClientRect().top; if (wasReview || flt.value === 'missed') render(); else sidebar(); ddSync(); const dy = m.getBoundingClientRect().top - t0; if (dy) scrollBy({ top: dy, behavior: 'instant' }); };
  ddSync();
}

// ---- layout: the sidebar and grip stick just below the header, which grows when it wraps ----
const grip = $('#grip'), setW = w => { w = Math.max(200, Math.min(620, Math.round(w))); document.documentElement.style.setProperty('--sw', w + 'px'); st.S._sw = w; return w; };
function initLayout() {
  const hdr = $('header'), setHH = () => document.documentElement.style.setProperty('--hh', hdr.offsetHeight + 'px'); setHH(); new ResizeObserver(setHH).observe(hdr);
  if (st.S._sw) setW(st.S._sw);
  // Once the exam list scrolls under the sidebar's pinned top controls, a hairline marks where they end.
  const top = side.querySelector('.sidetop'); side.addEventListener('scroll', () => top.classList.toggle('stuck', side.scrollTop > 0), { passive: true });
  grip.onpointerdown = e => {
    e.preventDefault(); grip.setPointerCapture(e.pointerId); grip.classList.add('on'); document.body.classList.add('drag');
    grip.onpointermove = ev => { setW(ev.clientX - side.getBoundingClientRect().left); if (st.S._zoom == 'fit') applyZoom(true); };
    grip.onpointerup = () => { grip.onpointermove = null; grip.classList.remove('on'); document.body.classList.remove('drag'); st.save(); };
  };
  grip.ondblclick = () => { setW(324); st.save(); if (st.S._zoom == 'fit') applyZoom(); };
  grip.onkeydown = e => { const w = side.offsetWidth; if (e.key == 'ArrowLeft') { setW(w - 20); st.save(); } if (e.key == 'ArrowRight') { setW(w + 20); st.save(); } if (st.S._zoom == 'fit') applyZoom(); };
}

// ---- zoom for the question area: a number (0.5-2) or 'fit' ----
// Keep the content at the top of the viewport (just under the header) in the same spot across a layout change.
// placeMark() notes what is there and returns a function that scrolls it back; it can be called again after each step of an animation.
function placeMark() {
  const y = $('header').getBoundingClientRect().bottom + 12, r = m.getBoundingClientRect();
  const el = document.elementFromPoint(Math.max(r.left + 8, Math.min(r.left + r.width / 2, innerWidth - 8)), y);
  const a = el && m.contains(el) ? el.closest('pre,p,h2,h3,.qw,.note,.tips,label,.row') || el : null;
  if (!a || scrollY < 1) return null;
  const b = a.getBoundingClientRect(), frac = b.height ? (y - b.top) / b.height : 0;
  return () => { const b2 = a.getBoundingClientRect(); scrollBy({ top: b2.top + frac * b2.height - y, behavior: 'instant' }); };
}
function keepPlace(change) { const back = placeMark(); change(); if (back) back(); }
// Changing the zoom re-lays out the page, which is too slow to do every frame. So the new zoom is applied once, and the
// page is then shown scaled back to how it looked and eased to its real size with a transform (about a quarter second),
// pinned at the reading point under the header. A change mid-animation starts from whatever scale is showing then,
// so quick repeated clicks stay smooth and add up.
let zShown = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zm')) || 1, zAnim = null;
const setZm = z => { zShown = z; document.documentElement.style.setProperty('--zm', z); };
function animZoom(z, instant) {
  if (instant || matchMedia('(prefers-reduced-motion:reduce)').matches || !m.animate) { if (zAnim) { zAnim.cancel(); zAnim = null; } keepPlace(() => setZm(z)); return; }
  let vis = zShown; if (zAnim) { vis = zShown * new DOMMatrix(getComputedStyle(m).transform).a; zAnim.cancel(); zAnim = null; }
  const back = placeMark(); setZm(z); if (back) back();
  const r = m.getBoundingClientRect(), y = back ? $('header').getBoundingClientRect().bottom + 12 : r.top;
  m.style.transformOrigin = `50% ${Math.max(0, (y - r.top) / r.height * 100)}%`;
  zAnim = m.animate([{ transform: `scale(${vis / z})` }, { transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
  zAnim.onfinish = () => { zAnim = null; };
}
export function applyZoom(instant) {
  let z = st.S._zoom ?? 1; const fit = z == 'fit';
  if (fit) { const sw = matchMedia('(max-width:760px)').matches ? 0 : side.offsetWidth + grip.offsetWidth; z = Math.max(.7, Math.min(2, (innerWidth - sw) / 900)); }
  z = Math.round(z * 100) / 100; if (z !== zShown) animZoom(z, instant); else setZm(z);
  if (document.activeElement !== $('#zv')) $('#zv').value = Math.round(z * 100) + '%'; $('#zf').classList.toggle('on', fit); $('#zf').setAttribute('aria-pressed', fit); return z;
}
function initZoom() {
  const zoomBy = d => { const z = applyZoom(); st.S._zoom = Math.max(.5, Math.min(2, Math.round((z + d) * 10) / 10)); st.save(); applyZoom(); };
  $('#zo').onclick = () => zoomBy(-.1); $('#zi').onclick = () => zoomBy(.1);
  const zv = $('#zv');
  const zoomTo = () => { const n = parseFloat(zv.value); if (isFinite(n)) { st.S._zoom = Math.max(50, Math.min(200, Math.round(n))) / 100; st.save(); } zv.blur(); applyZoom(); };
  zv.onfocus = () => { zv.value = zv.value.replace('%', ''); zv.select(); };
  zv.onkeydown = e => { if (e.key == 'Enter') zoomTo(); if (e.key == 'Escape') { zv.blur(); applyZoom(); } };
  zv.onblur = () => { const typed = zv.value.replace('%', '').trim(), shown = String(Math.round(zShown * 100)); if (typed !== shown) zoomTo(); else zv.value = shown + '%'; };
  // Turning fit off goes back to the zoom set before fit was turned on.
  $('#zf').onclick = () => { if (st.S._zoom == 'fit') st.S._zoom = st.S._zprev ?? 1; else { st.S._zprev = st.S._zoom ?? 1; st.S._zoom = 'fit'; } st.save(); applyZoom(); };
  addEventListener('resize', () => { if (st.S._zoom == 'fit') applyZoom(true); });
}

// ---- tooltips: any element with data-tip gets a small bubble after a short hover (mouse) or on keyboard focus ----
function initTips() {
  const tipEl = document.createElement('div'); tipEl.className = 'tipbox'; tipEl.setAttribute('role', 'tooltip'); tipEl.hidden = true; document.body.append(tipEl);
  let tipT = null, tipFor = null;
  function tipShow(el) {
    const t = el.dataset.tip; if (!t) return; tipFor = el; tipEl.textContent = t; tipEl.hidden = false; tipEl.classList.remove('in');
    const r = el.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight; let x = r.left + r.width / 2 - w / 2, y = r.bottom + 8;
    if (y + h > innerHeight - 6) y = r.top - h - 8; x = Math.max(6, Math.min(innerWidth - w - 6, x)); tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px';
    requestAnimationFrame(() => tipEl.classList.add('in'));
  }
  function tipHide() { clearTimeout(tipT); tipT = null; tipFor = null; tipEl.hidden = true; tipEl.classList.remove('in'); }
  document.addEventListener('pointerover', e => { if (e.pointerType == 'touch') return; const el = e.target.closest('[data-tip]'); if (el === tipFor) return; tipHide(); if (el) tipT = setTimeout(() => tipShow(el), 400); });
  document.addEventListener('pointerout', e => { const el = e.target.closest('[data-tip]'); if (el && !el.contains(e.relatedTarget)) tipHide(); });
  document.addEventListener('pointerdown', tipHide, true); document.addEventListener('scroll', tipHide, true);
  document.addEventListener('focusin', e => { const el = e.target.closest('[data-tip]'); if (el && el.matches(':focus-visible')) tipShow(el); }); document.addEventListener('focusout', tipHide);
}

// ---- countdown timer: preset or custom duration, survives reloads (the end time is stored, not the ticks) ----
function initTimer() {
  const tmb = $('#tmb'), tmp = $('#tmp'), tmv = $('#tmv'), tmr = $('#tmr'), tmi = $('#tmi'), tmh = $('#tmh'), go = $('#tmgo'), snd = $('#tmsnd'), HINT = tmh.textContent;
  const T = st.S._tm = Object.assign({ dur: 0, left: 0, end: 0, up: false, snd: true }, st.S._tm), PRE = [5, 10, 15, 25, 30, 50, 80, 120], title = document.title; let iv = null, ht = null;
  $('#tmps').innerHTML = PRE.map(n => `<button type="button" data-m="${n}">${n < 60 ? n + 'm' : n % 60 ? Math.floor(n / 60) + 'h ' + n % 60 + 'm' : n / 60 + 'h'}</button>`).join('');
  const left = () => T.end ? Math.max(0, T.end - Date.now()) : T.left;
  const fmt = ms => { const t = Math.ceil(ms / 1e3), h = Math.floor(t / 3600), mm = String(Math.floor(t / 60) % 60).padStart(2, '0'), ss = String(t % 60).padStart(2, '0'); return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`; };
  // "45" = minutes, "5:30" = mm:ss, "1:30:00" = h:mm:ss, or units like "1h 20m", "90s"
  function parse(s) {
    s = s.trim().toLowerCase(); if (!s) return NaN;
    if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s) * 6e4;
    if (/^\d+(:\d{1,2}){1,2}$/.test(s)) { const p = s.split(':').map(Number); if (p.slice(1).some(x => x > 59)) return NaN; return (p.length == 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]) * 1e3; }
    const r = /^(?:(\d+(?:\.\d+)?)\s*h(?:ours?|rs?)?)?\s*(?:(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?)?\s*(?:(\d+)\s*s(?:ec(?:ond)?s?)?)?$/.exec(s);
    return r && (r[1] || r[2] || r[3]) ? ((+r[1] || 0) * 3600 + (+r[2] || 0) * 60 + (+r[3] || 0)) * 1e3 : NaN;
  }
  function chime() {
    if (!T.snd) return; try {
      const a = new (window.AudioContext || window.webkitAudioContext)(); [0, .35, .7].forEach(t => {
        const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; o.connect(g); g.connect(a.destination);
        g.gain.setValueAtTime(0, a.currentTime + t); g.gain.linearRampToValueAtTime(.25, a.currentTime + t + .02); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + t + .3); o.start(a.currentTime + t); o.stop(a.currentTime + t + .32);
      }); setTimeout(() => a.close(), 1500);
    } catch (e) {}
  }
  function draw() {
    const l = left(), run = !!T.end, low = (run || l < T.dur) && l > 0 && l <= 6e4;
    tmr.textContent = T.up ? "Time's up" : fmt(l); tmr.className = 'tmr' + (T.up ? ' up' : low ? ' low' : '');
    tmv.textContent = T.up ? "Time's up" : run || (l > 0 && l < T.dur) ? fmt(l) : ''; tmb.className = T.up ? 'up' : low ? 'low' : run ? 'run' : '';
    go.textContent = run ? 'Pause' : T.up || l == T.dur ? 'Start' : 'Resume'; go.disabled = !T.dur; $('#tmrs').disabled = !T.dur || (!run && !T.up && l == T.dur); $('#tmadd').disabled = !T.dur;
    tmb.setAttribute('aria-label', 'Countdown timer' + (T.dur ? ', ' + (T.up ? 'time is up' : fmt(l) + (run ? ' left' : ' paused')) : ''));
    document.querySelectorAll('#tmps button').forEach(b => b.classList.toggle('on', b.dataset.m * 6e4 == T.dur));
    document.title = run || T.up ? `${T.up ? "Time's up" : fmt(l)} · ${title}` : title;
  }
  function tick() { if (T.end && left() <= 0) { T.end = 0; T.left = 0; T.up = true; st.save(); stop(); chime(); } draw(); }
  const stop = () => { clearInterval(iv); iv = null; }, loop = () => { stop(); iv = setInterval(tick, 250); };
  function set(ms) { stop(); Object.assign(T, { dur: ms, left: ms, end: 0, up: false }); st.save(); draw(); }
  function start() { if (!T.dur) return; if (T.up || !T.left) T.left = T.dur; T.up = false; T.end = Date.now() + T.left; st.save(); loop(); draw(); }
  function pause() { T.left = left(); T.end = 0; st.save(); stop(); draw(); }
  // open: unhide, then add .in next frame so the fade/scale transition runs; close: drop .in, hide once it has faded out
  function open() {
    clearTimeout(ht); if (T.up) { T.up = false; T.left = T.dur; st.save(); draw(); } tmp.hidden = false; tmp.offsetWidth; tmp.classList.add('in'); tmb.setAttribute('aria-expanded', true);
    // Focusing the text field on a touch screen pops up the keyboard over the presets, so only do it with a mouse.
    if (T.dur) go.focus(); else if (matchMedia('(hover:hover) and (pointer:fine)').matches) tmi.focus();
  }
  function close(f) { if (tmp.hidden) return; tmp.classList.remove('in'); tmb.setAttribute('aria-expanded', false); clearTimeout(ht); ht = setTimeout(() => tmp.hidden = true, 170); if (f) tmb.focus(); }
  tmb.onclick = () => tmp.classList.contains('in') ? close() : open();
  document.addEventListener('mousedown', e => { if (!tmp.hidden && !$('#tm').contains(e.target)) close(); });
  tmp.onkeydown = e => { if (e.key == 'Escape') { e.preventDefault(); close(true); } };
  $('#tmps').onclick = e => { const b = e.target.closest('button'); if (b) { set(b.dataset.m * 6e4); tmi.value = ''; go.focus(); } };
  const custom = () => {
    const ms = parse(tmi.value), ok = ms >= 1e3 && ms <= 864e5; tmi.classList.toggle('bad', !ok); tmh.classList.toggle('bad', !ok);
    tmh.textContent = ok ? HINT : !tmi.value.trim() ? 'Type a time first' : ms > 864e5 ? 'Up to 24 hours' : "Didn't understand that. Try 45, 5:30 or 1h 20m"; if (ok) { set(Math.round(ms / 1e3) * 1e3); go.focus(); }
  };
  $('#tmset').onclick = custom; tmi.onkeydown = e => { if (e.key == 'Enter') { e.preventDefault(); custom(); } };
  tmi.oninput = () => { if (tmi.classList.contains('bad')) { tmi.classList.remove('bad'); tmh.classList.remove('bad'); tmh.textContent = HINT; } };
  go.onclick = () => T.end ? pause() : start();
  $('#tmrs').onclick = () => set(T.dur);
  $('#tmadd').onclick = () => { if (T.up) { T.dur = Math.max(T.dur, 6e4); T.left = 6e4; T.up = false; T.end = Date.now() + 6e4; loop(); } else if (T.end) T.end += 6e4; else T.left += 6e4; if (left() > T.dur) T.dur = left(); st.save(); draw(); };
  snd.checked = T.snd; snd.onchange = () => { T.snd = snd.checked; st.save(); };
  if (T.end) { if (left() > 0) loop(); else { T.end = 0; T.left = 0; T.up = true; st.save(); } } draw();
}

export function initChrome() { initFilter(); initLayout(); initZoom(); initTips(); initTimer(); }
