// Running compiled Gleam, shared by the browser worker (gleam-worker.js) and the Node answer checker.
// A problem's tests are ordinary Gleam functions whose names end in `_test`, full of `assert` lines, as in the
// course's own homework tests (e.g. `pub fn pow_examples_test() { assert pow(2, 10) == 1024 }`).
// The playground also runs a module's `main`, collecting what it prints.
import { collector } from './output.js';

// Point the compiled `solution` module's relative imports ("./gleam/list.mjs", "./gleam.mjs") at the precompiled
// standard library served under `base` (an absolute URL ending in /build/).
export const linkImports = (js, base) => js.replace(/((?:\bfrom|\bimport)\s*\(?\s*)"\.\/([^"]+)"/g, (m, a, p) => `${a}"${base}${p}"`);

// `echo` recognises dicts through `$stdlib$dict`, which the browser compiler never imports (the standard library isn't
// a declared dependency there), so without this a dict is echoed as a raw object.
export const withEchoDict = js => /\$stdlib\$dict\./.test(js) && !/as \$stdlib\$dict\b/.test(js)
  ? 'import * as $stdlib$dict from "./gleam/dict.mjs";\n' + js : js;

// Run every exported *_test function. inspect formats Gleam values (gleam/string.inspect).
export function runTests(mod, inspect = String) {
  const names = Object.keys(mod).filter(k => /_test$/.test(k) && typeof mod[k] == 'function'), fails = [];
  for (const k of names) { try { mod[k](); } catch (e) { fails.push(describe(k, e, inspect)); } }
  return { ok: names.length > 0 && !fails.length, n: names.length, failed: fails.length, err: fails.join('\n\n') };
}
function describe(k, e, inspect) {
  const name = k.replace(/_test$/, ''), show = v => { try { return inspect(v); } catch (_) { return String(v); } };
  if (e?.gleam_error === 'assert') {
    let s = `${name}: ${e.message || 'Assertion failed.'}`;
    if (e.kind === 'binary_operator') s += `\n  left:  ${show(e.left?.value)}\n  right: ${show(e.right?.value)}`;
    return s;
  }
  if (e?.gleam_error) return `${name}: ${e.message}`;
  if (e instanceof RangeError) return `${name}: ${e.message} (infinite recursion?)`;
  return `${name}: ${e?.name || 'Error'}: ${e?.message || e}`;
}

// Run a compiled module's `main`. Returns {ok, out, err}; emit is as for capture.
export function runMain(mod, inspect = String, emit) {
  if (typeof mod.main != 'function') return { ok: false, out: [], err: 'There’s no `pub fn main()` to run. Add one, or run the tests.' };
  let err = '';
  const out = capture(() => { try { mod.main(); } catch (e) { err = describe('main', e, inspect) + where(e); } }, emit);
  return { ok: !err, out, err };
}
const where = e => e?.gleam_error && e.line ? ` (src/${e.module}.gleam, line ${e.line})` : '';

const ANSI = /\x1b\[[0-9;]*m/g;
// Run fn and collect what it prints (see output.js). The standard library's io.print and `echo` write through
// `process.stdout` / `process.stderr` when they exist, so a stand-in `process` gives a browser the same output as a
// terminal: no forced newlines, and echo / println_error on stderr.
export function capture(fn, emit) {
  const { out, write } = collector(emit), C = console, P = globalThis.process;
  const saved = { log: C.log, info: C.info, debug: C.debug, error: C.error, warn: C.warn }, writes = P && { out: P.stdout?.write, err: P.stderr?.write };
  const put = s => t => { write(s, String(t).replace(ANSI, '')); return true; };
  const line = s => (...a) => put(s)(a.map(String).join(' ') + '\n');
  C.log = C.info = C.debug = line('out'); C.error = C.warn = line('err');
  if (!P) globalThis.process = { stdout: { write: put('out') }, stderr: { write: put('err') } };
  else { if (P.stdout) P.stdout.write = put('out'); if (P.stderr) P.stderr.write = put('err'); }
  try { fn(); } finally {
    Object.assign(C, saved);
    if (!P) delete globalThis.process;
    else { if (P.stdout) P.stdout.write = writes.out; if (P.stderr) P.stderr.write = writes.err; }
  }
  return out;
}
