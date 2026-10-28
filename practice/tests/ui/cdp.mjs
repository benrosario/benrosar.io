// Minimal Chrome DevTools Protocol driver for the practice site's UI tests: no Playwright or Puppeteer needed,
// just an installed Chrome (or Edge/Brave/Chromium) and Node's built-in WebSocket.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, readFileSync, existsSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, normalize } from 'node:path';

const CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].filter(Boolean);
export const chromePath = () => CANDIDATES.find(p => existsSync(p));

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.css': 'text/css', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };

// Serve a directory on 127.0.0.1 (random port). POST /e is accepted and ignored, like the analytics Worker.
export function serve(dir) {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path === '/e') { res.writeHead(204); return res.end(); }
    let file = normalize(join(dir, path));
    if (!file.startsWith(normalize(dir))) { res.writeHead(403); return res.end(); }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(file));
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r({ url: `http://127.0.0.1:${server.address().port}`, close: () => server.close() })));
}

export async function launch({ headless = true } = {}) {
  const bin = chromePath();
  if (!bin) throw new Error('No Chrome found. Set CHROME_PATH to a Chrome or Chromium binary.');
  const profile = mkdtempSync(join(tmpdir(), 'practice-ui-'));
  const proc = spawn(bin, [
    ...(headless ? ['--headless=new'] : []), '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking',
    '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--window-size=1280,900', 'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  const port = await new Promise((res, rej) => {
    let buf = '';
    const t = setTimeout(() => rej(new Error('Chrome did not start')), 20000);
    proc.stderr.on('data', d => { buf += d; const m = buf.match(/DevTools listening on ws:\/\/[^:]+:(\d+)\//); if (m) { clearTimeout(t); res(+m[1]); } });
  });
  const base = `http://127.0.0.1:${port}`;
  return {
    async newPage() {
      const info = await (await fetch(`${base}/json/new?about:blank`, { method: 'PUT' })).json();
      return Page.connect(info.webSocketDebuggerUrl);
    },
    async close() { proc.kill(); await new Promise(r => setTimeout(r, 300)); try { rmSync(profile, { recursive: true, force: true }); } catch {} },
  };
}

class Page {
  static async connect(wsUrl) {
    const p = new Page(); p.ws = new WebSocket(wsUrl); p.seq = 0; p.pending = new Map(); p.handlers = new Map(); p.logs = [];
    await new Promise((r, j) => { p.ws.onopen = r; p.ws.onerror = j; });
    p.ws.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.id && p.pending.has(m.id)) { const { res, rej } = p.pending.get(m.id); p.pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
      else if (m.method) (p.handlers.get(m.method) || []).forEach(h => h(m.params));
    };
    await p.send('Page.enable'); await p.send('Runtime.enable');
    p.on('Runtime.exceptionThrown', e => p.logs.push('exception: ' + (e.exceptionDetails.exception?.description || e.exceptionDetails.text)));
    p.on('Runtime.consoleAPICalled', e => { if (e.type === 'error') p.logs.push('console.error: ' + e.args.map(a => a.value ?? a.description).join(' ')); });
    return p;
  }
  send(method, params = {}) { const id = ++this.seq; this.ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => this.pending.set(id, { res, rej })); }
  on(ev, h) { if (!this.handlers.has(ev)) this.handlers.set(ev, []); this.handlers.get(ev).push(h); }
  once(ev) { return new Promise(r => { const h = p => { this.handlers.set(ev, this.handlers.get(ev).filter(x => x !== h)); r(p); }; this.on(ev, h); }); }
  async goto(url) { const loaded = this.once('Page.loadEventFired'); await this.send('Page.navigate', { url }); await loaded; }
  async reload() { const loaded = this.once('Page.loadEventFired'); await this.send('Page.reload'); await loaded; }
  // Evaluate an expression (or async function body via `(async()=>{...})()`) and return its JSON value.
  async eval(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, userGesture: true });
    if (r.exceptionDetails) throw new Error('eval failed: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + '\n  in: ' + expr.slice(0, 300));
    return r.result.value;
  }
  async waitFor(expr, ms = 10000) {
    const t0 = Date.now();
    for (;;) { const v = await this.eval(expr).catch(() => false); if (v) return v; if (Date.now() - t0 > ms) throw new Error('timed out waiting for: ' + expr); await sleep(50); }
  }
  async viewport(width, height, mobile = false) { await this.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile }); }
  async colorScheme(value) { await this.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value }] }); }
  async key(key, code = key, keyCode = 0, modifiers = 0) {
    // Enter and Space carry their text so they activate buttons like a real keyboard.
    const text = { Enter: '\r', ' ': ' ' }[key];
    for (const type of ['keyDown', 'keyUp']) await this.send('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode: keyCode, modifiers, ...(type == 'keyDown' && text ? { text } : {}) });
  }
  async screenshot(path) { const { data } = await this.send('Page.captureScreenshot', { format: 'png' }); (await import('node:fs')).writeFileSync(path, Buffer.from(data, 'base64')); }
  close() { this.ws.close(); }
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
