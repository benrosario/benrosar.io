// Rendering of prose/code segments with lightweight syntax highlighting (Python, Scheme, SQL).
// Code uses ⟪a⟫ for a lettered blank, ⟪⟫ for an unlabeled one, and ⟦text⟧ to mark filled-in answer text.
import { esc, confirmBtn } from './util.js';

const KW = { py: 'def class return if elif else for while in not and or is lambda yield from import None True False try except raise assert pass break continue with as global nonlocal del finally',
  scm: 'define lambda if cond let begin and or else quote define-macro cons-stream expect',
  sql: 'SELECT FROM WHERE AS GROUP BY ORDER LIMIT HAVING CREATE TABLE UNION AND OR NOT DESC ASC JOIN ON INSERT INTO VALUES DISTINCT' };
const BI = { py: 'print len range list map filter sum max min abs isinstance iter next str int float tuple sorted any all super type dict set zip enumerate reversed repr round pow self Link Tree',
  scm: 'car cdr cons list append null? nil #t #f length map filter reduce eq? equal? not display print cadr',
  sql: 'COUNT SUM AVG MIN MAX ABS ROUND' };
const HSETS = {}; for (const l in KW) HSETS[l] = [new Set(KW[l].split(' ')), new Set(BI[l].split(' '))];
const TQ = /^("""|''')/, PROMPT = { py: /^(>>>|\.\.\.)(?=\s|$)/, scm: /^(scm>|\.\.\.>)/, sql: /^(sql>|\.\.\.>)/ },
  COMMENT = { py: /^#.*/, scm: /^;.*/, sql: /^--.*/ }, WORD = { py: /^[A-Za-z_]\w*/, scm: /^[#A-Za-z_][\w\-?!*<>=]*/, sql: /^[A-Za-z_]\w*/ };
// Highlight one line. st.doc holds the open triple-quote while inside a docstring.
function hlLine(line, lang, st) {
  const [kw, bi] = HSETS[lang]; let o = '', i = 0, prev = ''; const put = (c, t) => o += c ? `<span class="${c}">${esc(t)}</span>` : esc(t);
  if (st.doc) {
    const e = line.indexOf(st.doc);
    if (e < 0) { if (/^\s*(>>>|\.\.\.)\s/.test(line)) { const d = st.doc; st.doc = null; const r = hlLine(line, lang, st); st.doc = d; return r; } put('hd', line); return o; }
    put('hd', line.slice(0, e + 3)); i = e + 3; st.doc = null;
  }
  while (i < line.length) {
    const r = line.slice(i); let m;
    if (r[0] == '⟦') { o += '<span class="fillv">'; i++; continue; } if (r[0] == '⟧') { o += '</span>'; i++; continue; }
    if (m = r.match(/^⟪([a-z]?)⟫/)) { o += `<span class="blank">${m[1] ? '(' + m[1] + ')' : '&nbsp;'}</span>`; i += m[0].length; continue; }
    if (lang == 'py' && (m = r.match(TQ))) { const e = r.indexOf(m[1], 3); if (e < 0) { put('hd', r); st.doc = m[1]; return o; } put('hd', r.slice(0, e + 3)); i += e + 3; continue; }
    if (!o.replace(/&nbsp;|\s/g, '') && (m = r.match(PROMPT[lang]))) { put('hp', m[0]); i += m[0].length; continue; }
    if (m = r.match(COMMENT[lang])) { put('hc', m[0]); break; }
    if (m = r.match(/^(f?'(?:\\.|[^'\\⟦⟧])*'?|f?"(?:\\.|[^"\\⟦⟧])*"?)/)) { put('hs', m[0]); i += m[0].length; continue; }
    if (m = r.match(/^\d+(\.\d+)?/)) { put('hn', m[0]); i += m[0].length; continue; }
    if (m = r.match(WORD[lang])) {
      const w = m[0], key = lang == 'sql' ? w.toUpperCase() : w;
      const fn = prev == 'def' || prev == 'class' || prev == 'define' || (lang == 'py' && /^\s*\(/.test(line.slice(i + w.length)) && !kw.has(w) && !bi.has(w));
      put(kw.has(key) ? 'hk' : bi.has(key) ? 'hb' : fn ? 'hf' : '', w); prev = w; i += w.length; continue;
    }
    put('', line[i]); if (line[i].trim()) prev = ''; i++;
  }
  return o;
}
export function hl(code, lang) { const st = { doc: null }; return code.split('\n').map(l => hlLine(l, lang, st)).join('\n'); }
// Code blocks whose blanks can be filled in with "Show all answers", by index into this list (reset per render).
export const FILLS = [];
function fillCode(code, f) {
  return code.split('\n').map(line => {
    const alone = line.trim().match(/^⟪([a-z])⟫$/);
    if (alone && f[alone[1]]) { const pre = line.slice(0, line.indexOf('⟪')); return f[alone[1]].split('\n').map(x => pre + '⟦' + x + '⟧').join('\n'); }
    return line.replace(/⟪([a-z])⟫/g, (t, x) => f[x] != null ? '⟦' + f[x].split('\n').join(' ') + '⟧' : t);
  }).join('\n');
}
const lnWrap = (g, h) => g.ln ? h.split('\n').map(l => `<span class="ln">${l}</span>`).join('\n') : h;
function codeHTML(g) {
  if (!g.f) return `<pre class="code${g.ln ? ' lnums' : ''}">${lnWrap(g, hl(g.c, g.lang))}</pre>`; const k = FILLS.push(g) - 1;
  return `<div class="cb"><pre class="code">${hl(g.c, g.lang)}</pre><div class="cbh"><button class="fa" data-k="${k}">Show all answers</button></div></div>`;
}
export function wireFills(root) {
  root.querySelectorAll('.fa').forEach(btn => {
    const g = FILLS[btn.dataset.k], pre = btn.closest('.cb').querySelector('pre');
    const show = () => { pre.innerHTML = hl(fillCode(g.c, g.f), g.lang); btn.textContent = 'Hide all answers'; btn.classList.add('shown'); };
    const hide = () => { pre.innerHTML = hl(g.c, g.lang); btn.textContent = 'Show all answers'; btn.classList.remove('shown'); return true; };
    confirmBtn(btn, show, () => btn.classList.contains('shown') && hide());
  });
}
export function segHTML(segs) {
  return segs.map(g => g.c != null ? codeHTML(g) : g.h ? `<h3>${esc(g.h)}</h3>`
    : `<p>${esc(g.p).replace(/_{3,}/g, '<span class="blank">&nbsp;</span>')}</p>`).join('');
}
// Plain-text versions for the copied AI prompt and stored attempt snapshots.
const FENCE = { py: 'python', scm: 'scheme', sql: 'sql' };
export function segText(segs) {
  return segs.map(g => g.c != null ? '```' + FENCE[g.lang] + '\n' + g.c.replace(/⟪([a-z]?)⟫/g, (t, x) => '____' + (x ? '(' + x + ')' : '') + '____') + '\n```'
    : g.h ? g.h : g.p.replace(/_{3,}/g, '______')).join('\n\n');
}
