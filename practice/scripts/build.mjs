// Build one course's static practice site: src/ + courses/<course>/ -> public/<course>/ (the directory wrangler deploys).
// Output: index.html (page shell), assets/app.<hash>.js (bundled modules), assets/styles.<hash>.css,
// assets/content.<hash>.json (question bank + study collections), sw.js (offline use), _headers (caching), plus src/static/.
// For each language in the course's `langs`: assets/gleam-worker.<hash>.js and assets/gleam/<version>-stdlib-<version>/
// (the Gleam compiler and standard library; see gleam-toolchain.mjs), assets/py-worker.<hash>.js and
// assets/pyodide/<version>/ (Python; see pyodide-toolchain.mjs).
// The content is validated first; the build fails on any content error.
// Usage: node practice/scripts/build.mjs [--course <id>] [--out <dir>] [--allow-invalid]   (the flag is for work in progress only)
import { TREE_ADT } from '../content/trees.mjs';
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validate } from './validate.mjs';
import { gleamAssets, GLEAM, STDLIB } from './gleam-toolchain.mjs';
import { pyodideAssets, PYODIDE } from './pyodide-toolchain.mjs';
import { enrich } from '../content/enrich.mjs';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_COURSE = '61a';
const hash = s => createHash('sha256').update(s).digest('hex').slice(0, 10);
const json = f => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));
// Every course: the folders under courses/.
export const COURSES = readdirSync(join(ROOT, 'courses')).filter(f => existsSync(join(ROOT, 'courses', f, 'course.json'))).sort();
// courses/<id>/course.json: {id, name, title, heading, ai, blurb, url, dev (its local server), langs: ['py' | 'gleam'],
// preview, collections (their order), topics: {TAG: name}}.
export const loadCourse = (id = DEFAULT_COURSE) => {
  if (!COURSES.includes(id)) throw new Error(`no course ${id} (courses: ${COURSES.join(', ')})`);
  return json(`courses/${id}/course.json`);
};

// Exams are JSON files, or .mjs files that build one (content/author.mjs helpers) for newly imported exams.
export async function loadBank(id = DEFAULT_COURSE) {
  const course = loadCourse(id), C = `courses/${id}/`, dir = join(ROOT, C + 'exams'), exams = [];
  for (const f of readdirSync(dir).sort()) {
    if (f.endsWith('.json')) exams.push(JSON.parse(readFileSync(join(dir, f), 'utf8')));
    else if (f.endsWith('.mjs')) exams.push((await import(pathToFileURL(join(dir, f)).href)).default);
  }
  const index = json(C + 'collections/index.json');
  const collections = index.order.map(id => json(`${C}collections/${id}.json`));
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
  if (existsSync(join(ROOT, C + 'timed'))) for (const f of readdirSync(join(ROOT, C + 'timed')).filter(f => f.endsWith('.json'))) timed[f.replace(/\.json$/, '')] = json(C + 'timed/' + f);
  enrich(exams);
  // Each past exam's instructors, from its semester ("61a-fa25-mt2" → fa25). Site-written sets have none.
  const by = json(C + 'instructors.json').semesters;
  for (const e of exams) if (!e.src?.site && !e.src?.adapted && by[e.id.split('-')[1]]) e.by = by[e.id.split('-')[1]];
  // Saved data from before collections existed lists exams in this order (store.js); a newer course has none.
  const legacyOrder = existsSync(join(ROOT, C + 'order-legacy.json')) ? json(C + 'order-legacy.json') : [];
  const bank = { exams, collections, timed, defaultCollection: index.defaultCollection, legacyOrder };
  if (course.langs.includes('py')) Object.assign(bank, {
    prelude: readFileSync(join(ROOT, 'content/python-prelude.py'), 'utf8'), sqlPrelude: readFileSync(join(ROOT, 'content/sql-prelude.py'), 'utf8'),
    // The course's tree functions (tree, label, branches, ...), added to playground code that calls them.
    treeAdt: TREE_ADT.trim() });
  bank.version = hash(JSON.stringify(bank));
  return bank;
}

export async function build(out, { course: id = DEFAULT_COURSE, allowInvalid = false } = {}) {
  const course = loadCourse(id), langs = course.langs;
  out ??= join(ROOT, 'public', id);
  const bank = await loadBank(id), errors = validate(bank, course);
  if (errors.length && !allowInvalid) throw new Error('content errors:\n  ' + errors.join('\n  '));
  if (errors.length) console.warn('content errors (ignored with --allow-invalid):\n  ' + errors.join('\n  '));
  delete bank._ex;
  const { build: esbuild } = await import('esbuild');
  const bundle = async (entry, o) => (await esbuild({ entryPoints: [join(ROOT, entry)], bundle: true, target: 'es2022', write: false, legalComments: 'none', ...o })).outputFiles[0].text;
  const files = { css: readFileSync(join(ROOT, 'src/styles.css'), 'utf8'), content: JSON.stringify(bank), app: await bundle('src/js/main.js', { format: 'iife' }) };
  const name = { css: `assets/styles.${hash(files.css)}.css`, content: `assets/content.${bank.version}.json`, app: `assets/app.${hash(files.app)}.js` };
  // Each language's worker, its runtime's files (both versions are in the path, since _headers lets browsers keep
  // these files for good) and the page's data-* attributes that point to them (main.js).
  const rt = {};
  if (langs.includes('gleam')) rt.gleam = { key: 'gleamWorker', base: `assets/gleam/${GLEAM}-stdlib-${STDLIB}/`, files: await gleamAssets(), worker: await bundle('src/js/gleam-worker.js', { format: 'esm' }) };
  // A classic worker: Pyodide's loader uses importScripts. run.py is bundled in as text.
  if (langs.includes('py')) rt.py = { key: 'pyWorker', base: `assets/pyodide/${PYODIDE}/`, files: await pyodideAssets(), worker: await bundle('src/js/py-worker.js', { format: 'iife', loader: { '.py': 'text' } }) };
  for (const l in rt) { files[rt[l].key] = rt[l].worker; name[rt[l].key] = `assets/${l === 'py' ? 'py' : 'gleam'}-worker.${hash(rt[l].worker)}.js`; }
  // The files the background download fetches (runtimes.js), with their sizes for its progress: not the licences.
  const list = (base, f) => ({ base: '/' + base, files: Object.keys(f).filter(k => !/^LICEN[CS]E/.test(k)).map(k => [k, Buffer.byteLength(f[k])]) });
  // shell: what the page needs besides the runtimes, which the service worker caches as it installs (src/sw.js).
  const shell = ['/', ...Object.values(name).map(n => '/' + n), ...readdirSync(join(ROOT, 'src/static')).map(f => '/' + f)];
  const order = ['py', 'gleam'].filter(l => rt[l]);
  const runtimes = JSON.stringify({ ...Object.fromEntries(order.map(l => [l, list(rt[l].base, rt[l].files)])), shell });
  const swSrc = readFileSync(join(ROOT, 'src/sw.js'), 'utf8'), swManifest = { shell, runtimes: order.map(l => '/' + rt[l].base) };
  const sw = swSrc.replace('/*MANIFEST*/ null', JSON.stringify({ version: hash(swSrc + JSON.stringify(swManifest)), ...swManifest }));
  const attrs = ['gleam', 'py'].filter(l => rt[l]).map(l => ` data-${l}-worker="/${name[rt[l].key]}" data-${l}-base="/${rt[l].base}"`).join('');
  // The page's course details (course.js), and the course's names and storage key in the page shell.
  // sites: every course's site, for the header's course switcher (chrome.js).
  const sites = COURSES.map(c => loadCourse(c)).map(({ id, name, blurb, url, dev }) => ({ id, name, blurb, url, dev }));
  const pageCourse = { id: course.id, name: course.name, ai: course.ai, url: course.url, langs, topics: course.topics, sites };
  const fill = { TITLE: course.title, HEADING: course.heading, KEY: `cs${course.id}-practice-v2` };
  const html = readFileSync(join(ROOT, 'src/index.html'), 'utf8').replace(/\{\{(\w+)\}\}/g, (_, k) => fill[k])
    .replace('<!--STYLES-->', `<link rel="stylesheet" href="/${name.css}">\n<link rel="preload" href="/${name.content}" as="fetch" crossorigin>`)
    .replace('<!--SCRIPTS-->', `<script type="application/json" id="course">${JSON.stringify(pageCourse)}</script>\n<script type="application/json" id="runtimes">${runtimes}</script>\n<script src="/${name.app}" data-content="/${name.content}"${attrs} defer></script>`);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(join(out, 'assets'), { recursive: true });
  for (const k in files) writeFileSync(join(out, name[k]), files[k]);
  for (const l in rt) for (const f in rt[l].files) { const p = join(out, rt[l].base, f); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, rt[l].files[f]); }
  writeFileSync(join(out, 'index.html'), html);
  writeFileSync(join(out, 'sw.js'), sw);
  // Hashed and versioned files never change, so browsers can keep them without asking again (Cloudflare reads
  // _headers). The service worker is checked on every visit, so a deploy reaches people who have it.
  writeFileSync(join(out, '_headers'), ['/assets/*', '  Cache-Control: public, max-age=31536000, immutable', '/sw.js', '  Cache-Control: no-cache', ''].join('\n'));
  for (const f of readdirSync(join(ROOT, 'src/static'))) copyFileSync(join(ROOT, 'src/static', f), join(out, f));
  return { out, assets: Object.values(name), version: bank.version };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = f => { const i = process.argv.indexOf(f); return i > 0 ? process.argv[i + 1] : undefined; };
  build(arg('--out'), { course: arg('--course'), allowInvalid: process.argv.includes('--allow-invalid') }).then(r => console.log('built', r.out, r.assets.join(' ')), e => { console.error(e.message); process.exit(1); });
}
