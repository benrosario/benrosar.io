// Module worker that checks Gleam answers: compiles a `solution` module with the official Gleam compiler
// (WebAssembly) and runs its *_test functions against the precompiled standard library. The page restarts the worker
// if a check takes too long (an infinite loop).
import { linkImports, runTests } from './gleam-core.js';

let G, inspect, base, ready;
async function init(b) {
  base = new URL(b, self.location.href).href;
  G = await import(base + 'gleam_wasm.js');
  await G.default({ module_or_path: base + 'gleam_wasm_bg.wasm' });
  const src = await (await fetch(base + 'stdlib.json')).json();
  for (const [name, code] of Object.entries(src)) G.write_module(0, name, code);
  // Compile the standard library once up front so each check only recompiles the student's module.
  G.write_module(0, 'solution', 'pub fn main() { Nil }'); G.compile_package(0, 'javascript');
  inspect = (await import(base + 'build/gleam/string.mjs')).inspect;
}
onmessage = async e => {
  const { id, base: b, source } = e.data;
  try { await (ready ||= init(b)); } catch (err) { ready = null; postMessage({ id, r: { ok: false, unavailable: true, err: 'Gleam failed to load: ' + (err.message || err) } }); return; }
  postMessage({ id, loaded: true }); // the page's time limit for running the code starts now
  if (!source) return postMessage({ id, r: { ok: true, n: 0 } }); // warm-up
  G.write_module(0, 'solution', source);
  try { G.compile_package(0, 'javascript'); } catch (err) { postMessage({ id, r: { ok: false, compile: true, err: String(err).trim().slice(0, 2000) } }); return; }
  const url = URL.createObjectURL(new Blob([linkImports(G.read_compiled_javascript(0, 'solution'), base + 'build/')], { type: 'text/javascript' }));
  let r;
  try { r = runTests(await import(url), inspect); } catch (err) { r = { ok: false, err: String(err.message || err) }; } finally { URL.revokeObjectURL(url); }
  postMessage({ id, r });
};
