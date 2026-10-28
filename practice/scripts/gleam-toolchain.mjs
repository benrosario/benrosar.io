// The Gleam toolchain used to check Gleam answers: the official browser build of the Gleam compiler (WebAssembly,
// the same build Gleam's language tour uses) and the Gleam standard library, pinned to the versions CS 61A Fall 2026
// uses (Homework 7: Gleam v1.18.1, JavaScript target; gleam_stdlib 1.x).
//
// Downloads are verified against pinned SHA-256 hashes and cached in practice/.cache (git-ignored). The build then
// serves, under assets/gleam/<version>/:
//   gleam_wasm.js, gleam_wasm_bg.wasm   the compiler (type-checks and compiles a student's module in the browser)
//   stdlib.json                          the standard library's Gleam source (the compiler needs it to type-check)
//   build/**.mjs                         the standard library compiled to JavaScript, plus the prelude and FFI files,
//                                        which the compiled student module imports at run time
//   LICENCE-gleam, LICENCE-gleam_stdlib  both Apache-2.0
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const GLEAM = '1.18.1', STDLIB = '1.0.5';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, '.cache', `gleam-${GLEAM}-stdlib-${STDLIB}`);
const FILES = {
  compiler: { url: `https://github.com/gleam-lang/gleam/releases/download/v${GLEAM}/gleam-v${GLEAM}-browser.tar.gz`, sha256: '0819e0b9aaa835e321e13815ad13eab88ca0fb5e2f7d2959535826fd09e384d2' },
  stdlib: { url: `https://repo.hex.pm/tarballs/gleam_stdlib-${STDLIB}.tar`, sha256: 'cee5b6c076a85b45f60c585f4316c63ec8b7127c119d5738c3958a9c4d50404e' },
  // The JavaScript prelude the compiler's output imports (as gleam_prelude.mjs); it isn't part of the browser build.
  prelude: { url: `https://raw.githubusercontent.com/gleam-lang/gleam/v${GLEAM}/compiler-core/templates/prelude.mjs`, sha256: '90bdfff5f22caa4e0df1f831e0f754eb31d1425230a4f3725e5a5be846aef9ee' },
  licence: { url: `https://raw.githubusercontent.com/gleam-lang/gleam/v${GLEAM}/LICENCE`, sha256: 'c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4' },
};
const sha = b => createHash('sha256').update(b).digest('hex');
const walk = (d, out = []) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p, out) : out.push(p); } return out; };

// Download (once) and verify everything; returns the cache directory.
export async function ensureGleam() {
  if (existsSync(join(CACHE, 'ok'))) return CACHE;
  mkdirSync(join(CACHE, 'compiler'), { recursive: true }); mkdirSync(join(CACHE, 'stdlib'), { recursive: true });
  for (const [k, f] of Object.entries(FILES)) {
    const res = await fetch(f.url).catch(e => { throw new Error(`Couldn't download ${f.url} (${e.message}). The Gleam toolchain is needed once; it's cached afterwards.`); });
    if (!res.ok) throw new Error(`Couldn't download ${f.url}: HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (sha(buf) !== f.sha256) throw new Error(`${f.url} doesn't match its pinned SHA-256; refusing to use it.`);
    writeFileSync(join(CACHE, k + '.download'), buf);
  }
  execFileSync('tar', ['xzf', join(CACHE, 'compiler.download'), '-C', join(CACHE, 'compiler')]);
  // A hex package is a plain tar holding contents.tar.gz.
  execFileSync('tar', ['xf', join(CACHE, 'stdlib.download'), '-C', join(CACHE, 'stdlib')]);
  execFileSync('tar', ['xzf', join(CACHE, 'stdlib', 'contents.tar.gz'), '-C', join(CACHE, 'stdlib')]);
  writeFileSync(join(CACHE, 'ok'), new Date().toISOString());
  return CACHE;
}

// The standard library's Gleam modules: {"gleam/list": source, ...}.
export function stdlibSources(dir) {
  const src = join(dir, 'stdlib', 'src');
  return Object.fromEntries(walk(src).filter(f => f.endsWith('.gleam')).sort().map(f => [f.slice(src.length + 1, -6), readFileSync(f, 'utf8')]));
}

// A compiler instance in Node (the same WebAssembly the browser uses) with the standard library loaded.
export async function nodeCompiler(dir) {
  const G = await import(pathToFileURL(join(dir, 'compiler', 'gleam_wasm.js')).href);
  G.initSync({ module: readFileSync(join(dir, 'compiler', 'gleam_wasm_bg.wasm')) });
  const mods = stdlibSources(dir);
  for (const [name, code] of Object.entries(mods)) G.write_module(0, name, code);
  return {
    G, mods,
    // Compile a module named `solution`; returns {js} or {error} (the compiler's message).
    compile(source) {
      G.write_module(0, 'solution', source);
      try { G.compile_package(0, 'javascript'); } catch (e) { return { error: String(e).trim() }; }
      return { js: G.read_compiled_javascript(0, 'solution') };
    },
  };
}

// Everything served under assets/gleam/<version>/, as {relative path: Buffer | string}.
export async function gleamAssets() {
  const dir = await ensureGleam(), C = await nodeCompiler(dir), files = {};
  C.compile('pub fn main() { Nil }');
  for (const name of Object.keys(C.mods)) files[`build/${name}.mjs`] = C.G.read_compiled_javascript(0, name);
  files['build/gleam.mjs'] = new TextDecoder().decode(C.G.read_file_bytes(0, '/build/gleam.mjs'));
  files['build/gleam_prelude.mjs'] = readFileSync(join(dir, 'prelude.download'), 'utf8');
  for (const f of readdirSync(join(dir, 'stdlib', 'src')).filter(f => f.endsWith('.mjs'))) files[`build/${f}`] = readFileSync(join(dir, 'stdlib', 'src', f), 'utf8');
  files['stdlib.json'] = JSON.stringify(C.mods);
  files['gleam_wasm.js'] = readFileSync(join(dir, 'compiler', 'gleam_wasm.js'), 'utf8');
  files['gleam_wasm_bg.wasm'] = readFileSync(join(dir, 'compiler', 'gleam_wasm_bg.wasm'));
  files['LICENCE-gleam'] = readFileSync(join(dir, 'licence.download'), 'utf8');
  files['LICENCE-gleam_stdlib'] = readFileSync(join(dir, 'stdlib', 'LICENCE'), 'utf8');
  return files;
}
