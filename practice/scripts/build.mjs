// Build the static practice site: src/ + content/ -> public/ (the directory wrangler deploys).
// Output: index.html (page shell), assets/app.<hash>.js (bundled modules), assets/styles.<hash>.css,
// assets/content.<hash>.json (question bank + study collections), assets/gleam-worker.<hash>.js and
// assets/gleam/<version>/ (the Gleam compiler and standard library; see gleam-toolchain.mjs), plus src/static/.
// The content is validated first; the build fails on any content error.
// Usage: node practice/scripts/build.mjs [--out <dir>] [--allow-invalid]   (the flag is for work in progress only)
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validate } from './validate.mjs';
import { gleamAssets, GLEAM } from './gleam-toolchain.mjs';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const hash = s => createHash('sha256').update(s).digest('hex').slice(0, 10);
const json = f => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));

// Exams are JSON files, or .mjs files that build one (content/author.mjs helpers) for newly imported exams.
export async function loadBank() {
  const dir = join(ROOT, 'content/exams'), exams = [];
  for (const f of readdirSync(dir).sort()) {
    if (f.endsWith('.json')) exams.push(JSON.parse(readFileSync(join(dir, f), 'utf8')));
    else if (f.endsWith('.mjs')) exams.push((await import(pathToFileURL(join(dir, f)).href)).default);
  }
  const index = json('content/collections/index.json');
  const collections = index.order.map(id => json(`content/collections/${id}.json`));
  const timed = {};
  for (const f of readdirSync(join(ROOT, 'content/timed')).filter(f => f.endsWith('.json'))) timed[f.replace(/\.json$/, '')] = json('content/timed/' + f);
  const bank = { exams, collections, timed, defaultCollection: index.defaultCollection, legacyOrder: json('content/order-legacy.json'),
    prelude: readFileSync(join(ROOT, 'content/python-prelude.py'), 'utf8') };
  bank.version = hash(JSON.stringify(bank));
  return bank;
}

export async function build(out = join(ROOT, 'public'), { allowInvalid = false } = {}) {
  const bank = await loadBank(), errors = validate(bank);
  if (errors.length && !allowInvalid) throw new Error('content errors:\n  ' + errors.join('\n  '));
  if (errors.length) console.warn('content errors (ignored with --allow-invalid):\n  ' + errors.join('\n  '));
  delete bank._ex;
  const { build: esbuild } = await import('esbuild');
  const js = await esbuild({ entryPoints: [join(ROOT, 'src/js/main.js')], bundle: true, format: 'iife', target: 'es2022', write: false, legalComments: 'none' });
  const gw = await esbuild({ entryPoints: [join(ROOT, 'src/js/gleam-worker.js')], bundle: true, format: 'esm', target: 'es2022', write: false, legalComments: 'none' });
  const files = { css: readFileSync(join(ROOT, 'src/styles.css'), 'utf8'), content: JSON.stringify(bank), app: js.outputFiles[0].text, gleamWorker: gw.outputFiles[0].text };
  const name = { css: `assets/styles.${hash(files.css)}.css`, content: `assets/content.${bank.version}.json`, app: `assets/app.${hash(files.app)}.js`, gleamWorker: `assets/gleam-worker.${hash(files.gleamWorker)}.js` };
  const gleamBase = `assets/gleam/${GLEAM}/`, gleam = await gleamAssets();
  const html = readFileSync(join(ROOT, 'src/index.html'), 'utf8')
    .replace('<!--STYLES-->', `<link rel="stylesheet" href="/${name.css}">\n<link rel="preload" href="/${name.content}" as="fetch" crossorigin>`)
    .replace('<!--SCRIPTS-->', `<script src="/${name.app}" data-content="/${name.content}" data-gleam-worker="/${name.gleamWorker}" data-gleam-base="/${gleamBase}" defer></script>`);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(join(out, 'assets'), { recursive: true });
  for (const k in files) writeFileSync(join(out, name[k]), files[k]);
  for (const f in gleam) { mkdirSync(dirname(join(out, gleamBase, f)), { recursive: true }); writeFileSync(join(out, gleamBase, f), gleam[f]); }
  writeFileSync(join(out, 'index.html'), html);
  for (const f of readdirSync(join(ROOT, 'src/static'))) copyFileSync(join(ROOT, 'src/static', f), join(out, f));
  return { out, assets: Object.values(name), version: bank.version };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--out');
  build(i > 0 ? process.argv[i + 1] : undefined, { allowInvalid: process.argv.includes('--allow-invalid') }).then(r => console.log('built', r.out, r.assets.join(' ')), e => { console.error(e.message); process.exit(1); });
}
