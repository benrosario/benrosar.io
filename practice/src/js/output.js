// What a running program prints, shared by the Gleam and Python workers: out is [{s: 'out' | 'err', t: text}], with
// consecutive writes to the same stream joined and the total cut off at 100,000 characters. emit(chunks) receives
// everything printed so far at most every 100 ms, so a program stopped for running too long still shows its output.
// size() is how many characters have been printed so far.
const LIMIT = 100000;
export function collector(emit) {
  const out = []; let size = 0, last = Date.now(), cut = false;
  function write(s, t) {
    if (cut) return;
    t = String(t);
    if (size + t.length > LIMIT) { t = t.slice(0, LIMIT - size) + '\n… output cut off at 100,000 characters.\n'; cut = true; }
    size += t.length;
    const end = out.at(-1); if (end?.s === s) end.t += t; else out.push({ s, t });
    if (emit && Date.now() - last > 100) { last = Date.now(); emit(out.map(c => ({ ...c }))); }
  }
  return { out, write, size: () => size };
}
