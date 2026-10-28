// Running checks on compiled Gleam, shared by the browser worker (gleam-worker.js) and the Node answer checker.
// A problem's tests are ordinary Gleam functions whose names end in `_test`, full of `assert` lines, as in the
// course's own homework tests (e.g. `pub fn pow_examples_test() { assert pow(2, 10) == 1024 }`).

// Point the compiled `solution` module's relative imports ("./gleam/list.mjs", "./gleam.mjs") at the precompiled
// standard library served under `base` (an absolute URL ending in /build/).
export const linkImports = (js, base) => js.replace(/((?:\bfrom|\bimport)\s*\(?\s*)"\.\/([^"]+)"/g, (m, a, p) => `${a}"${base}${p}"`);

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
