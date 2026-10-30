// Module worker that compiles Gleam with the official Gleam compiler (WebAssembly) and runs it against the
// precompiled standard library. Practice checks send {source}: a `solution` module whose *_test functions are run.
// The playground sends {source, mode: 'main' | 'tests', erlang}: a `main` module whose main (or tests) is run; it gets
// the compiled code and warnings first ({p: {compiled}}), then what the program prints as it runs ({p: {out}}).
// The page restarts the worker if a run takes too long (an infinite loop).
import { linkImports, withEchoDict, runTests, runMain, capture } from './gleam-core.js';

let G, inspect, base, ready, last = 'solution';
async function init(b) {
  base = new URL(b, self.location.href).href;
  G = await import(base + 'gleam_wasm.js');
  await G.default({ module_or_path: base + 'gleam_wasm_bg.wasm' });
  const src = await (await fetch(base + 'stdlib.json')).json();
  for (const [name, code] of Object.entries(src)) G.write_module(0, name, code);
  // Compile the standard library once up front so each check only recompiles the student's module.
  G.write_module(0, 'solution', IDLE); G.compile_package(0, 'javascript');
  inspect = (await import(base + 'build/gleam/string.mjs')).inspect;
}
// compile_package compiles every module, so only the latest of `solution` and `main` is kept: an old module's errors
// would otherwise fail the other one. (An empty module would add an "Empty module" warning to every run.)
const IDLE = 'pub fn main() { Nil }';
function compile(name, source) {
  if (last !== name) { G.write_module(0, last, IDLE); last = name; }
  G.reset_warnings(0); G.write_module(0, name, source); G.compile_package(0, 'javascript');
}
const warnings = () => { const w = []; for (let x; (x = G.pop_warning(0)) !== undefined;) w.push(x.trim()); return w; };
async function load(name) {
  const js = linkImports(withEchoDict(G.read_compiled_javascript(0, name)), base + 'build/');
  const url = URL.createObjectURL(new Blob([js], { type: 'text/javascript' }));
  try { return await import(url); } finally { URL.revokeObjectURL(url); }
}

async function check(source) {
  try { compile('solution', source); } catch (err) { return { ok: false, compile: true, err: String(err).trim().slice(0, 2000) }; }
  try { return runTests(await load('solution'), inspect); } catch (err) { return { ok: false, err: String(err.message || err) }; }
}
async function play(id, { source, mode, erlang }) {
  try { compile('main', source); } catch (err) { return { ok: false, compile: true, err: String(err).trim(), warnings: warnings(), out: [] }; }
  const r = { warnings: warnings(), js: G.read_compiled_javascript(0, 'main') };
  if (erlang) try { G.compile_package(0, 'erlang'); r.erlang = G.read_compiled_erlang(0, 'main'); } catch (err) { r.erlangErr = String(err).trim(); }
  postMessage({ id, p: { compiled: r } });
  const emit = out => postMessage({ id, p: { out } });
  let mod;
  try { mod = await load('main'); } catch (err) { return { ...r, ok: false, out: [], err: String(err.message || err) }; }
  if (mode !== 'tests') return { ...r, ...runMain(mod, inspect, emit) };
  let t; const out = capture(() => { t = runTests(mod, inspect); }, emit);
  return { ...r, ...t, out };
}

onmessage = async e => {
  const { id, base: b, source, mode } = e.data;
  try { await (ready ||= init(b)); } catch (err) { ready = null; postMessage({ id, r: { ok: false, unavailable: true, err: 'Gleam failed to load: ' + (err.message || err) } }); return; }
  postMessage({ id, loaded: true }); // the page's time limit for running the code starts now
  if (!source) return postMessage({ id, r: { ok: true, n: 0 } }); // warm-up
  postMessage({ id, r: mode ? await play(id, e.data) : await check(source) });
};
