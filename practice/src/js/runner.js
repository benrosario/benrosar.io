// One request at a time per worker: a timeout cannot strand other checks or mix compiler state.
export function createRunner(makeWorker, name, { loadMs = 60000, runMs = 8000 } = {}) {
  let worker, active, timer, warm = false, seq = 0;
  const queue = [];
  const stop = () => { clearTimeout(timer); worker?.terminate(); worker = null; warm = false; };
  function finish(result, restart = false) {
    clearTimeout(timer);
    if (restart) stop();
    const job = active; active = null;
    job?.resolve(result);
    pump();
  }
  function deadline(loaded) {
    clearTimeout(timer);
    timer = setTimeout(() => finish({ ok: false, unavailable: !loaded, err: loaded
      ? 'Timed out after 8 seconds (infinite loop or recursion?)'
      : `${name} took too long to load. Check your connection and try again.` }, true), loaded ? runMs : loadMs);
  }
  function pump() {
    if (active || !queue.length) return;
    active = queue.shift();
    try {
      if (!worker) {
        worker = makeWorker();
        worker.onmessage = ({ data }) => {
          if (!active || data.id !== active.id) return;
          if (data.loaded) { warm = true; deadline(true); }
          else finish(data.r, !!data.r?.unavailable);
        };
        worker.onerror = worker.onmessageerror = e => finish({ ok: false, unavailable: true,
          err: `${name} failed to load or stopped: ${e.message || 'Please try again.'}` }, true);
      }
      // A worker may still need an optional package (SQLite), even when Python is warm.
      deadline(false);
      worker.postMessage({ id: active.id, ...active.data });
    } catch (e) { finish({ ok: false, unavailable: true, err: `${name} could not start: ${e.message}` }, true); }
  }
  const run = data => new Promise(resolve => { queue.push({ id: ++seq, data, resolve }); pump(); });
  run.loaded = () => warm;
  run.dispose = () => { stop(); const pending = [active, ...queue]; active = null; queue.length = 0;
    pending.forEach(j => j?.resolve({ ok: false, unavailable: true, err: `${name} check cancelled. Try again.` })); };
  return run;
}
