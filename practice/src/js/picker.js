// "Import a problem" (⌘K or Ctrl+K, or the playground's Import button): a tree of exams and the problems in them the
// playground can run (the "Studying for" option's exams, or every exam), filtered by language. Typing searches every
// exam instead (titles, problem text, code and topics), as a flat list with the best matches first. The arrow keys
// move through it (→ opens an exam or moves into it, ← closes it or goes up to it), Enter imports, Escape closes.
// The footer chooses what fills the blanks; a problem already in the playground opens as it was left.
import { st } from './state.js';
import { esc, SV } from './util.js';
import { problems, canSolve } from './problems.js';

let dlg, input, list, note, prefs, cb, rows = [], active = 0;
const opened = new Set(); // exams opened in the tree, for this page

// prefs: {lang: '' | 'py' | 'gleam', all, fill: 'blanks' | 'mine' | 'solution'}, kept by the caller (save() persists it).
// has(id): the problem is already in the playground. pick(x, fill): import it.
export function openPicker({ prefs: p, save, has, pick }) {
  prefs = p; cb = { save, has, pick };
  if (!dlg) create();
  input.value = ''; note.textContent = ''; sync();
  // Open the exam being studied, so its problems are there to pick.
  const ex = st.view.exams[st.cur]; if (ex && !opened.size) opened.add(ex.id);
  build(); active = Math.max(0, rows.findIndex(r => r.k === 'x' && r.id === ex?.id)); paint();
  dlg.showModal(); input.focus();
}

function create() {
  dlg = document.createElement('dialog'); dlg.className = 'pick'; dlg.setAttribute('aria-labelledby', 'pkh');
  dlg.innerHTML = `<div class="pkt"><h2 id="pkh">Import a problem</h2><button type="button" class="pkc" aria-label="Close">${SV('<path d="M6 6l12 12M18 6L6 18"/>')}</button></div>
<input class="pks" type="search" role="combobox" aria-expanded="true" aria-controls="pkl" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="Search every exam: a title, topic, function name…" aria-label="Search problems">
<div class="pkfl"><div class="seg" role="radiogroup" aria-label="Language"><button type="button" role="radio" data-l="">All</button><button type="button" role="radio" data-l="py">Python</button><button type="button" role="radio" data-l="gleam">Gleam</button></div>
<label class="pka"><input type="checkbox"> <span></span></label></div>
<ul class="pkl" id="pkl" role="tree" aria-label="Problems"></ul>
<p class="pkn" role="status"></p>
<div class="pkfoot"><span id="pkfh">Fill the blanks with</span><div class="seg" role="radiogroup" aria-labelledby="pkfh"><button type="button" role="radio" data-f="blanks">Blanks</button><button type="button" role="radio" data-f="mine">My answers</button><button type="button" role="radio" data-f="solution">Solution</button></div>
<span class="pkk mut">↑↓ move · → open · Enter imports</span></div>`;
  document.body.append(dlg);
  input = dlg.querySelector('.pks'); list = dlg.querySelector('.pkl'); note = dlg.querySelector('.pkn');
  dlg.querySelector('.pkc').onclick = () => dlg.close();
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); // the backdrop
  input.oninput = () => { note.textContent = ''; build(); active = 0; paint(); };
  input.onkeydown = key;
  dlg.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { prefs.lang = b.dataset.l; cb.save(); sync(); build(); active = 0; paint(); input.focus(); });
  dlg.querySelector('.pka input').onchange = e => { prefs.all = e.target.checked; cb.save(); build(); active = 0; paint(); input.focus(); };
  dlg.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { prefs.fill = b.dataset.f; cb.save(); sync(); paint(); input.focus(); });
  list.onmousemove = e => { const li = e.target.closest('li[data-i]'); if (li && +li.dataset.i !== active) { active = +li.dataset.i; mark(); } };
  list.onclick = e => { const li = e.target.closest('li[data-i]'); if (li) { active = +li.dataset.i; act(); } };
}
function sync() {
  dlg.querySelectorAll('[data-l]').forEach(b => b.setAttribute('aria-checked', b.dataset.l === prefs.lang));
  dlg.querySelectorAll('[data-f]').forEach(b => b.setAttribute('aria-checked', b.dataset.f === prefs.fill));
  dlg.querySelector('.pka input').checked = !!prefs.all;
  dlg.querySelector('.pka span').textContent = `Every exam, not only ${st.view.label}’s`;
  dlg.querySelector('.pka').hidden = !!input.value.trim();
}

// rows: {k: 'x', id, t, n} for an exam, {k: 'p', x, lvl} for a problem (lvl 1 in search results, 2 under an exam).
function build() {
  const q = input.value.trim().toLowerCase(), pool = problems().filter(x => !prefs.lang || x.lang === prefs.lang);
  dlg.querySelector('.pka').hidden = !!q;
  if (q) {
    const words = q.split(/\s+/), here = new Set(st.view.exams.map(ex => ex.id)), has = (s, w) => s.toLowerCase().includes(w);
    rows = pool.filter(x => words.every(w => x.hay.includes(w)))
      .map(x => ({ x, s: words.reduce((s, w) => s + 4 * has(x.p.t, w) + 2 * has(x.e.t, w) + 2 * has(x.topics.join(' '), w), 0) + here.has(x.e.id) }))
      .sort((a, b) => b.s - a.s).map(r => ({ k: 'p', x: r.x, lvl: 1 }));
    return;
  }
  const byId = new Map(pool.map(x => [x.p.id, x])), groups = [];
  if (prefs.all) { for (const x of pool) { const g = groups.at(-1); if (g?.id === x.e.id) g.xs.push(x); else groups.push({ id: x.e.id, t: x.e.t, xs: [x] }); } }
  else for (const ex of st.view.exams) groups.push({ id: ex.id, t: ex.t, xs: ex.problems.map(P => byId.get(P.p.id)).filter(Boolean) });
  rows = groups.filter(g => g.xs.length).flatMap(g => [{ k: 'x', id: g.id, t: g.t, n: g.xs.length }, ...(opened.has(g.id) ? g.xs.map(x => ({ k: 'p', x, lvl: 2, ex: g.id })) : [])]);
}

const NAME = { py: 'Python', gleam: 'Gleam' }, CHEV = SV('<path d="M9 6l6 6-6 6"/>');
function paint() {
  const words = input.value.trim().split(/\s+/).filter(Boolean).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const hi = s => words.length ? esc(s).replace(new RegExp(`(${words.map(w => esc(w)).join('|')})`, 'gi'), '<mark>$1</mark>') : esc(s);
  list.innerHTML = rows.map((r, i) => {
    if (r.k === 'x') return `<li role="treeitem" id="pk${i}" data-i="${i}" aria-level="1" aria-expanded="${opened.has(r.id)}" class="pkx">${CHEV}<span class="nm">${esc(r.t)}</span><span class="ct">${r.n}</span></li>`;
    const { p, e, lang, topics } = r.x, mine = cb.has(p.id), locked = prefs.fill === 'solution' && !mine && !canSolve(r.x);
    const tags = [`<span class="lt ${lang}">${NAME[lang]}</span>`, p.adapted ? '<span class="tg2">Adapted</span>' : p.authored ? '<span class="tg2">Site-written</span>' : '',
      mine ? '<span class="tg2 have" data-tip="Opens as you left it in the playground">In playground</span>' : '', locked ? '<span class="tg2 lk" data-tip="Check an answer to each of its questions in practice first">Solution locked</span>' : ''].join('');
    return `<li role="treeitem" id="pk${i}" data-i="${i}" aria-level="${r.lvl}" class="pkp${r.lvl === 1 ? ' flat' : ''}"><span class="nm">${hi(p.t)}</span>${r.lvl === 1 ? `<span class="ex">${hi(e.t)}</span>` : ''}<span class="tags">${tags}<span class="tp">${esc(topics.slice(0, 2).join(' · '))}</span></span></li>`;
  }).join('') || `<li class="pke" role="none">${input.value.trim() ? 'No problems match. Try fewer words, or another language.' : 'This study option has no problems in that language. Try every exam.'}</li>`;
  mark();
}
function mark() {
  list.querySelectorAll('li.on').forEach(li => { li.classList.remove('on'); li.setAttribute('aria-selected', 'false'); });
  const li = list.querySelector(`#pk${active}`);
  if (!li) return input.removeAttribute('aria-activedescendant');
  li.classList.add('on'); li.setAttribute('aria-selected', 'true'); input.setAttribute('aria-activedescendant', li.id); li.scrollIntoView({ block: 'nearest' });
}

function toggle(r, open) { if (open) opened.add(r.id); else opened.delete(r.id); build(); active = rows.findIndex(x => x.k === 'x' && x.id === r.id); paint(); }
function act() {
  const r = rows[active]; if (!r) return;
  if (r.k === 'x') return toggle(r, !opened.has(r.id));
  if (prefs.fill === 'solution' && !cb.has(r.x.p.id) && !canSolve(r.x)) { note.textContent = 'The solution unlocks once you’ve checked an answer to each of this problem’s questions in practice. Import it with Blanks or My answers instead.'; return; }
  dlg.close(); cb.pick(r.x, prefs.fill);
}
function key(e) {
  const r = rows[active], tree = !input.value.trim();
  if (e.key === 'Escape') { e.preventDefault(); dlg.close(); } // (a search field would only clear its text)
  else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); active = Math.min(rows.length - 1, Math.max(0, active + (e.key === 'ArrowDown' ? 1 : -1))); mark(); }
  else if (e.key === 'Enter') { e.preventDefault(); act(); }
  else if (tree && r && e.key === 'ArrowRight') { e.preventDefault(); if (r.k === 'x' && !opened.has(r.id)) toggle(r, true); else if (r.k === 'x') { active++; mark(); } }
  else if (tree && r && e.key === 'ArrowLeft') { e.preventDefault(); if (r.k === 'p') { active = rows.findIndex(x => x.k === 'x' && x.id === r.ex); mark(); } else if (opened.has(r.id)) toggle(r, false); }
}
