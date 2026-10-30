// One request at a time per worker: a timeout cannot strand other checks or mix compiler state.
// run(data, onProgress, {runMs}) resolves with the worker's result; messages the worker sends as {id, p} while the job
// runs go to onProgress, and runMs can give this request its own time limit. With latestWins (the playground's live runs), a new request drops older ones still waiting, and
// stops one that has been running for over staleMs, since only the newest code's result is wanted. Each dropped
// request resolves with {superseded: true}. A result with {restart: true} gets a fresh worker for the next request.
export function createRunner(makeWorker, name, { loadMs = 60000, runMs = 8000, latestWins = false, staleMs = 1000 } = {}) {
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
    const ms = active?.runMs || runMs;
    timer = setTimeout(() => finish({ ok: false, unavailable: !loaded, err: loaded
      ? `Timed out after ${ms / 1000} seconds (infinite loop or recursion?)`
      : `${name} took too long to load. Check your connection and try again.` }, true), loaded ? ms : loadMs);
  }
  function pump() {
    if (active || !queue.length) return;
    active = queue.shift();
    try {
      if (!worker) {
        worker = makeWorker();
        worker.onmessage = ({ data }) => {
          if (!active || data.id !== active.id) return;
          if (data.loaded) { warm = true; active.started = Date.now(); deadline(true); }
          else if ('p' in data) active.progress?.(data.p);
          else finish(data.r, !!(data.r?.unavailable || data.r?.restart));
        };
        worker.onerror = worker.onmessageerror = e => finish({ ok: false, unavailable: true,
          err: `${name} failed to load or stopped: ${e.message || 'Please try again.'}` }, true);
      }
      // A worker may still need an optional package (SQLite), even when Python is warm.
      deadline(false);
      worker.postMessage({ id: active.id, ...active.data });
    } catch (e) { finish({ ok: false, unavailable: true, err: `${name} could not start: ${e.message}` }, true); }
  }
  const run = (data, progress, { runMs } = {}) => new Promise(resolve => {
    if (latestWins) {
      queue.splice(0).forEach(j => j.resolve({ superseded: true }));
      if (active?.started && Date.now() - active.started > staleMs) { const job = active; active = null; stop(); job.resolve({ superseded: true }); }
    }
    queue.push({ id: ++seq, data, progress, runMs, resolve }); pump();
  });
  run.loaded = () => warm;
  run.dispose = () => { stop(); const pending = [active, ...queue]; active = null; queue.length = 0;
    pending.forEach(j => j?.resolve({ ok: false, unavailable: true, err: `${name} check cancelled. Try again.` })); };
  return run;
}
