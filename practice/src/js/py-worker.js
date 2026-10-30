// Classic worker (Pyodide's loader uses importScripts) that runs Python with the Pyodide this site serves.
// Practice checks send {full, test} (doctests, through the prelude's run_tests) or {sql} (run_sql, after loading
// sqlite3). The playground sends {source, stdin, mode: 'main' | 'tests'}; what a program prints arrives as {p: {out}}
// while it runs. Every request carries base (the Pyodide directory) and the prelude, used when the worker starts.
// The page restarts the worker if a run takes too long, or when a result says {restart: true}.
import RUN from '../py/run.py';
import { collector } from './output.js';

let py, ready, sqlReady, runProgram;
async function init(base, prelude) {
  importScripts(base + 'pyodide.js');
  py = await loadPyodide({ indexURL: base });
  py.setStdin({ stdin: () => null }); // input() outside a playground run: EOFError (the default calls prompt(), which workers lack)
  py.runPython(prelude); py.runPython(RUN);
  runProgram = py.globals.get('run_program');
}
const json = (code, vars) => { for (const k in vars) py.globals.set(k, vars[k]); return JSON.parse(py.runPython(`__import__("json").dumps(${code})`)); };

function play(id, { source, stdin = '', mode }) {
  if (mode === 'tests') return { ...json('run_tests(SRC)', { SRC: source }), out: [] };
  const { out, write } = collector(o => postMessage({ id, p: { out: o } }));
  return { ...JSON.parse(runProgram(source, stdin, write)), out };
}

onmessage = async ({ data }) => {
  const { id, base, prelude, full, test, sql, source } = data;
  try { await (ready ||= init(new URL(base, location.href).href, prelude)); if (sql) await (sqlReady ||= py.loadPackage('sqlite3')); }
  catch (e) { postMessage({ id, r: { ok: false, unavailable: true, err: 'Python or SQLite failed to load: ' + String(e.message || e) } }); return; }
  postMessage({ id, loaded: true }); // the page's time limit for running the code starts now
  let r;
  try {
    if (sql) r = json('run_sql(__import__("json").loads(SQL_JOB))', { SQL_JOB: JSON.stringify(sql) });
    else if (source != null) r = play(id, data);
    else if (full != null) r = json('run_tests(SRC, TST)', { SRC: full, TST: test });
    else r = { ok: true, n: 0 }; // warm-up
  } catch (e) { r = { ok: false, restart: true, err: String(e.message || e) }; } // Python itself failed: start afresh
  postMessage({ id, r });
};
