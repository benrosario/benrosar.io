// What a running program prints, shared by the Gleam and Python workers: out is [{s: 'out' | 'err', t: text}], with
// consecutive writes to the same stream joined and the total cut off at 100,000 characters. emit(chunks) receives
// everything printed so far at most every 100 ms, so a program stopped for running too long still shows its output.
// size() is how many characters have been printed so far.
const LIMIT = 100000;
// The class of a Python error from its traceback, for analytics: built-in names only, so nothing a student wrote
// (a message, their own exception's name) is ever sent. Empty if there's none.
const PY_ERRORS = new Set(['ArithmeticError', 'AssertionError', 'AttributeError', 'EOFError', 'Exception', 'ImportError', 'IndentationError', 'IndexError', 'KeyError', 'KeyboardInterrupt', 'LookupError', 'MemoryError', 'ModuleNotFoundError', 'NameError', 'NotImplementedError', 'OSError', 'OverflowError', 'RecursionError', 'RuntimeError', 'StopIteration', 'SyntaxError', 'SystemExit', 'TabError', 'TypeError', 'UnboundLocalError', 'UnicodeError', 'ValueError', 'ZeroDivisionError']);
export function errorClass(text) {
  const last = String(text || '').trim().split('\n').at(-1).match(/^([A-Za-z]+)(?::|$)/)?.[1];
  return PY_ERRORS.has(last) ? last : '';
}

export function collector(emit) {
  const out = []; let size = 0, last = Date.now(), cut = false;
  function write(s, t) {
    if (cut) return;
    t = String(t);
    if (size + t.length > LIMIT) { t = t.slice(0, LIMIT - size) + '\n… output cut off at 100,000 characters.\n'; cut = true; }
    size += t.length;
    const end = out.at(-1); if (end?.s === s) end.t += t; else out.push({ s, t });
    if (emit && Date.now() - last > 100) { last = Date.now(); emit(out.map(c => ({ ...c }))); }
  }
  return { out, write, size: () => size };
}
