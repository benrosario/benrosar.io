// Python in the browser: Pyodide 0.26.4 (CPython 3.12.1 compiled to WebAssembly), served from this site so Python
// checks and the playground work offline once downloaded, instead of loading from a CDN on every visit.
//
// Downloads are verified against pinned SHA-256 hashes and cached in practice/.cache (git-ignored). The build then
// serves, under assets/pyodide/<version>/:
//   pyodide.js, pyodide.asm.js, pyodide.asm.wasm   the runtime (loaded by py-worker.js)
//   python_stdlib.zip, pyodide-lock.json           the standard library and the package index
//   sqlite3-1.0.0.zip                              the sqlite3 module, which SQL questions load on first use
//   LICENSE-pyodide, LICENSE-cpython               MPL-2.0 and the PSF licence
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PYODIDE = '0.26.4';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, '.cache', `pyodide-${PYODIDE}`);
const FILES = {
  'core.tar.bz2': { url: `https://github.com/pyodide/pyodide/releases/download/${PYODIDE}/pyodide-core-${PYODIDE}.tar.bz2`, sha256: '70dba93432f3653155998cc9001f9c200182343c2f95165a2f9e9e4673fa35e8' },
  // Not in the core release; its hash is also the one pyodide-lock.json lists, which loadPackage checks.
  'sqlite3-1.0.0.zip': { url: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE}/full/sqlite3-1.0.0.zip`, sha256: 'e05c4defc15eac256607c87c3533af267fc072f3a1749a4f6b8bfe074e1be7f6' },
  'LICENSE-pyodide': { url: `https://raw.githubusercontent.com/pyodide/pyodide/${PYODIDE}/LICENSE`, sha256: '1f256ecad192880510e84ad60474eab7589218784b9a50bc7ceee34c2b91f1d5' },
  'LICENSE-cpython': { url: 'https://raw.githubusercontent.com/python/cpython/v3.12.1/LICENSE', sha256: '3b2f81fe21d181c499c59a256c8e1968455d6689d269aa85373bfb6af41da3bf' },
};
const CORE = ['pyodide.js', 'pyodide.asm.js', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];
const sha = b => createHash('sha256').update(b).digest('hex');

// Download (once) and verify everything; returns the cache directory.
export async function ensurePyodide() {
  if (existsSync(join(CACHE, 'ok'))) return CACHE;
  mkdirSync(join(CACHE, 'core'), { recursive: true });
  for (const [name, f] of Object.entries(FILES)) {
    const res = await fetch(f.url).catch(e => { throw new Error(`Couldn't download ${f.url} (${e.message}). Pyodide is needed once; it's cached afterwards.`); });
    if (!res.ok) throw new Error(`Couldn't download ${f.url}: HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (sha(buf) !== f.sha256) throw new Error(`${f.url} doesn't match its pinned SHA-256; refusing to use it.`);
    writeFileSync(join(CACHE, name), buf);
  }
  execFileSync('tar', ['xjf', join(CACHE, 'core.tar.bz2'), '-C', join(CACHE, 'core')]);
  writeFileSync(join(CACHE, 'ok'), new Date().toISOString());
  return CACHE;
}

// Everything served under assets/pyodide/<version>/, as {relative path: Buffer}.
export async function pyodideAssets() {
  const dir = await ensurePyodide(), files = {};
  for (const f of CORE) files[f] = readFileSync(join(dir, 'core', 'pyodide', f));
  for (const f of ['sqlite3-1.0.0.zip', 'LICENSE-pyodide', 'LICENSE-cpython']) files[f] = readFileSync(join(dir, f));
  return files;
}
