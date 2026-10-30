// A small code editor for the playground: a textarea over a highlighted copy of its text (highlight.js), with line
// numbers. The textarea does the typing, selection and scrolling; the copy behind it scrolls with it.
// Keys: Tab and Shift+Tab indent and outdent (after Escape, they move focus on or back instead), Enter keeps the line's indent
// (one more after `:` or an opening bracket), Backspace in leading spaces removes one indent, a closing bracket on an
// empty line outdents it, ⌘/ or Ctrl+/ comments lines in or out, ⌘↵ or Ctrl+Enter runs.
// Edits made by these keys go through insertText, so the browser's own undo and redo still work.
import { hl } from './highlight.js';

const UNIT = { py: '    ', gleam: '  ' }, MARK = { py: '#', gleam: '//' }, PAIRS = { '(': ')', '[': ']', '{': '}' };

export function createEditor(root, { lang, value = '', label, onChange, onRun }) {
  root.classList.add('ed');
  root.innerHTML = '<div class="edln" aria-hidden="true"><div></div></div><pre class="code edhl" aria-hidden="true"></pre>'
    + '<textarea class="edta" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off"></textarea>';
  const gut = root.querySelector('.edln > div'), pre = root.querySelector('pre'), ta = root.querySelector('textarea');
  ta.setAttribute('aria-label', label); ta.value = value;
  let lines = 0, escaped = false;

  function paint() {
    pre.innerHTML = hl(ta.value, lang) + '\n'; // the newline gives an empty last line its height
    const n = ta.value.split('\n').length;
    if (n !== lines) { lines = n; gut.textContent = Array.from({ length: n }, (_, i) => i + 1).join('\n'); root.style.setProperty('--gd', String(n).length); }
    sync();
  }
  function sync() { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; gut.style.transform = `translateY(${-ta.scrollTop}px)`; }
  ta.addEventListener('input', e => { paint(); onChange?.(ta.value); if (e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph') revealCaret(); });
  ta.addEventListener('scroll', sync, { passive: true });

  function revealCaret() {
    const style = getComputedStyle(ta), lineHeight = parseFloat(style.lineHeight);
    const row = ta.value.slice(0,ta.selectionEnd).split('\n').length-1;
    const top = parseFloat(style.paddingTop)+row*lineHeight;
    const bottom = top+lineHeight+parseFloat(style.paddingBottom);
    if (bottom > ta.scrollTop+ta.clientHeight) ta.scrollTop = bottom-ta.clientHeight;
    else if (top < ta.scrollTop) ta.scrollTop = top;
    sync();
  }

  // Replace [start, end) with text, keeping it on the undo stack, then select [a, b].
  function put(start, end, text, a = start + text.length, b = a) {
    ta.focus(); ta.setSelectionRange(start, end);
    const ok = text ? document.execCommand('insertText', false, text) : start === end || document.execCommand('delete');
    if (!ok) { ta.setRangeText(text, start, end, 'end'); paint(); onChange?.(ta.value); }
    ta.setSelectionRange(a, b);
  }
  // The whole lines the selection touches (a selection ending at the start of a line doesn't include that line).
  function block() {
    const v = ta.value, s = ta.selectionStart, e = Math.max(s, ta.selectionEnd - (ta.selectionEnd > s && v[ta.selectionEnd - 1] === '\n' ? 1 : 0));
    const from = v.lastIndexOf('\n', s - 1) + 1, to = v.indexOf('\n', e) < 0 ? v.length : v.indexOf('\n', e);
    return { from, to, lines: v.slice(from, to).split('\n') };
  }
  function edit(fn) { const b = block(), out = b.lines.map(fn).join('\n'); if (out !== b.lines.join('\n')) put(b.from, b.to, out, b.from, b.from + out.length); }
  const unit = () => UNIT[lang];
  const outdent = l => l.replace(new RegExp(`^ {1,${unit().length}}`), '');
  function comment() {
    const m = MARK[lang], { lines } = block(), code = lines.filter(l => l.trim());
    if (!code.length) return;
    if (code.every(l => l.trimStart().startsWith(m))) return edit(l => l.replace(new RegExp(`^(\\s*)${m} ?`), '$1'));
    const at = Math.min(...code.map(l => l.match(/^ */)[0].length));
    edit(l => l.trim() ? l.slice(0, at) + m + ' ' + l.slice(at) : l);
  }

  ta.addEventListener('keydown', e => {
    const v = ta.value, s = ta.selectionStart, end = ta.selectionEnd, mod = e.metaKey || e.ctrlKey;
    const lineStart = v.lastIndexOf('\n', s - 1) + 1, before = v.slice(lineStart, s);
    if (e.key === 'Escape') { escaped = true; return; }
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return; // pressing Shift for Shift+Tab keeps the Escape
    const wasEscaped = escaped; escaped = false;
    if (e.key === 'Enter' && mod) { e.preventDefault(); onRun?.(); return; }
    if (e.key === '/' && mod) { e.preventDefault(); comment(); return; }
    if (e.altKey || mod) return;
    if (e.key === 'Tab') {
      if (wasEscaped) return; // let focus move on
      e.preventDefault();
      if (e.shiftKey) edit(outdent);
      else if (s === end) put(s, s, ' '.repeat(unit().length - before.length % unit().length));
      else edit(l => unit() + l);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const indent = before.match(/^ */)[0], trimmed = before.trimEnd(), open = trimmed.at(-1);
      const deeper = (lang === 'py' && open === ':') || !!PAIRS[open], close = PAIRS[open] && v[end] === PAIRS[open];
      const inner = indent + (deeper ? unit() : '');
      if (close) put(s, end, '\n' + inner + '\n' + indent, s + 1 + inner.length); // between brackets: the closer gets its own line
      else put(s, end, '\n' + inner);
      revealCaret();
    } else if (e.key === 'Backspace' && s === end && before && !before.trim()) {
      e.preventDefault(); put(s - (before.length % unit().length || unit().length), s, '');
    } else if (')]}'.includes(e.key) && e.key.length === 1 && s === end && before.length >= unit().length && !before.trim()) {
      e.preventDefault(); put(s - unit().length, s, e.key);
    }
  });

  paint();
  return {
    textarea: ta,
    get value() { return ta.value; },
    // Load other text (another file): this starts a fresh undo history.
    load(text, l = lang) { lang = l; ta.value = text; lines = 0; paint(); },
    // Replace the text as an edit (Reset), so ⌘Z brings the old text back.
    replace(text) { put(0, ta.value.length, text, 0); ta.scrollTop = 0; },
    state: () => ({ sel: [ta.selectionStart, ta.selectionEnd], scroll: [ta.scrollTop, ta.scrollLeft] }),
    restore({ sel, scroll } = {}) { if (sel) ta.setSelectionRange(...sel); if (scroll) { ta.scrollTop = scroll[0]; ta.scrollLeft = scroll[1]; } sync(); },
    focus: () => ta.focus({ preventScroll: true }),
  };
}
