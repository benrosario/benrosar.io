// Build the static practice site: src/ + content/ -> public/ (the directory wrangler deploys).
// Output: index.html (page shell), assets/app.<hash>.js (bundled modules), assets/styles.<hash>.css,
// assets/content.<hash>.json (question bank + study collections), assets/gleam-worker.<hash>.js and
// assets/gleam/<version>-stdlib-<version>/ (the Gleam compiler and standard library; see gleam-toolchain.mjs), assets/py-worker.<hash>.js
// and assets/pyodide/<version>/ (Python; see pyodide-toolchain.mjs), sw.js (offline use), _headers (caching), plus src/static/.
// The content is validated first; the build fails on any content error.
// Usage: node practice/scripts/build.mjs [--out <dir>] [--allow-invalid]   (the flag is for work in progress only)
import { TREE_ADT } from '../content/trees.mjs';
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validate } from './validate.mjs';
import { gleamAssets, GLEAM, STDLIB } from './gleam-toolchain.mjs';
import { pyodideAssets, PYODIDE } from './pyodide-toolchain.mjs';
import { enrich } from '../content/enrich.mjs';

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
  // A collection with picksFrom (the Final) also gets those collections' staff picks, each tip naming the exam it was
  // recommended for. Derived here so the Final never drifts from the midterms' lists.
  for (const C of collections) for (const sid of C.picksFrom || []) {
    const S = collections.find(c => c.id === sid);
    const forExam = t => t.includes(S.label) ? t : t.replace('Recommended by Prof. DeNero', `Recommended by Prof. DeNero for ${S.label}`).replace("CSM tutors' review pick", `CSM tutors' ${S.label} review pick`);
    for (const se of S.exams) {
      const ce = C.exams.find(x => x.exam === se.exam); if (!ce) continue;
      for (const k in se.picks || {}) (ce.picks ||= {})[k] = [...new Set([...ce.picks[k] || [], ...se.picks[k]])];
      for (const pid in se.tips || {}) {
        const tips = se.tips[pid].filter(t => t.k === 'dn' || t.k === 'csm').map(t => ({ ...t, t: forExam(t.t) }));
        if (tips.length) (ce.tips ||= {})[pid] = [...ce.tips[pid] || [], ...tips];
      }
    }
  }
  const timed = {};
  for (const f of readdirSync(join(ROOT, 'content/timed')).filter(f => f.endsWith('.json'))) timed[f.replace(/\.json$/, '')] = json('content/timed/' + f);
  enrich(exams);
  // Each past exam's instructors, from its semester ("61a-fa25-mt2" → fa25). Site-written sets have none.
  const by = json('content/instructors.json').semesters;
  for (const e of exams) if (!e.src?.site && !e.src?.adapted && by[e.id.split('-')[1]]) e.by = by[e.id.split('-')[1]];
  const bank = { exams, collections, timed, defaultCollection: index.defaultCollection, legacyOrder: json('content/order-legacy.json'),
    prelude: readFileSync(join(ROOT, 'content/python-prelude.py'), 'utf8'), sqlPrelude: readFileSync(join(ROOT, 'content/sql-prelude.py'), 'utf8'),
    // The course's tree functions (tree, label, branches, ...), added to playground code that calls them.
    treeAdt: TREE_ADT.trim() };
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
  // A classic worker: Pyodide's loader uses importScripts. run.py is bundled in as text.
  const pw = await esbuild({ entryPoints: [join(ROOT, 'src/js/py-worker.js')], bundle: true, format: 'iife', target: 'es2022', write: false, legalComments: 'none', loader: { '.py': 'text' } });
  const files = { css: readFileSync(join(ROOT, 'src/styles.css'), 'utf8'), content: JSON.stringify(bank), app: js.outputFiles[0].text, gleamWorker: gw.outputFiles[0].text, pyWorker: pw.outputFiles[0].text };
  const name = { css: `assets/styles.${hash(files.css)}.css`, content: `assets/content.${bank.version}.json`, app: `assets/app.${hash(files.app)}.js`, gleamWorker: `assets/gleam-worker.${hash(files.gleamWorker)}.js`, pyWorker: `assets/py-worker.${hash(files.pyWorker)}.js` };
  // Both versions are in the path, since _headers lets browsers keep these files for good.
  const gleamBase = `assets/gleam/${GLEAM}-stdlib-${STDLIB}/`, gleam = await gleamAssets(), pyBase = `assets/pyodide/${PYODIDE}/`, pyodide = await pyodideAssets();
  // The files the background download fetches (runtimes.js), with their sizes for its progress: not the licences.
  const list = (base, f) => ({ base: '/' + base, files: Object.keys(f).filter(k => !/^LICEN[CS]E/.test(k)).map(k => [k, Buffer.byteLength(f[k])]) });
  // shell: what the page needs besides the runtimes, which the service worker caches as it installs (src/sw.js).
  const shell = ['/', ...Object.values(name).map(n => '/' + n), ...readdirSync(join(ROOT, 'src/static')).map(f => '/' + f)];
  const runtimes = JSON.stringify({ py: list(pyBase, pyodide), gleam: list(gleamBase, gleam), shell });
  const swSrc = readFileSync(join(ROOT, 'src/sw.js'), 'utf8'), swManifest = { shell, runtimes: ['/' + pyBase, '/' + gleamBase] };
  const sw = swSrc.replace('/*MANIFEST*/ null', JSON.stringify({ version: hash(swSrc + JSON.stringify(swManifest)), ...swManifest }));
  const html = readFileSync(join(ROOT, 'src/index.html'), 'utf8')
    .replace('<!--STYLES-->', `<link rel="stylesheet" href="/${name.css}">\n<link rel="preload" href="/${name.content}" as="fetch" crossorigin>`)
    .replace('<!--SCRIPTS-->', `<script type="application/json" id="runtimes">${runtimes}</script>\n<script src="/${name.app}" data-content="/${name.content}" data-gleam-worker="/${name.gleamWorker}" data-gleam-base="/${gleamBase}" data-py-worker="/${name.pyWorker}" data-py-base="/${pyBase}" defer></script>`);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(join(out, 'assets'), { recursive: true });
  for (const k in files) writeFileSync(join(out, name[k]), files[k]);
  for (const [base, set] of [[gleamBase, gleam], [pyBase, pyodide]]) for (const f in set) { mkdirSync(dirname(join(out, base, f)), { recursive: true }); writeFileSync(join(out, base, f), set[f]); }
  writeFileSync(join(out, 'index.html'), html);
  writeFileSync(join(out, 'sw.js'), sw);
  // Hashed and versioned files never change, so browsers can keep them without asking again (Cloudflare reads
  // _headers). The service worker is checked on every visit, so a deploy reaches people who have it.
  writeFileSync(join(out, '_headers'), ['/assets/*', '  Cache-Control: public, max-age=31536000, immutable', '/sw.js', '  Cache-Control: no-cache', ''].join('\n'));
  for (const f of readdirSync(join(ROOT, 'src/static'))) copyFileSync(join(ROOT, 'src/static', f), join(out, f));
  return { out, assets: Object.values(name), version: bank.version };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--out');
  build(i > 0 ? process.argv[i + 1] : undefined, { allowInvalid: process.argv.includes('--allow-invalid') }).then(r => console.log('built', r.out, r.assets.join(' ')), e => { console.error(e.message); process.exit(1); });
}
