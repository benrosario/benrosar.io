// The events a visit sends, seen at the test server's /e: contact links, the playground's runs and debugging, and that
// nothing a student wrote goes with them. Events are on because of ?ev=1.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../scripts/build.mjs';
import { serve, launch } from './cdp.mjs';

const NOPY = !!process.env.PRACTICE_SKIP_PYODIDE;
let srv, br, page;
before(async () => {
  const out = mkdtempSync(join(tmpdir(), 'practice-analytics-')); await build(out);
  srv = await serve(out); br = await launch(); page = await br.newPage();
  await page.goto(srv.url + '/?ev=1'); await page.waitFor('document.querySelector("#fbb") && document.querySelector("#pgb span")');
  await page.eval(`addEventListener('click', e => e.preventDefault())`); // links stay on this page
});
after(async () => { page?.close(); await br?.close(); srv?.close(); });

// Send what's queued, then wait for an event matching the test to arrive.
async function arrives(n, match = () => true) {
  for (let i = 0; i < 150; i++) {
    await page.eval(`dispatchEvent(new Event('pagehide'))`);
    const hit = srv.events.find(e => e.n === n && match(e)); if (hit) return hit;
    await new Promise(r => setTimeout(r, 200));
  }
  assert.fail(`no ${n} event; got ${srv.events.map(e => e.n).join(', ')}`);
}
const click = s => page.eval(`document.querySelector(${JSON.stringify(s)}).click()`);

test('a visit reports its session, and contact clicks are counted', async () => {
  const s = await arrives('session_start'); assert.equal(s.v, 'desktop'); assert.equal(s.cnt, 0);
  await click('#fbb'); await arrives('fb_open'); await click('#fbx');
  await click('.sitesocials a.ig'); await arrives('social_click', e => e.v === 'instagram');
  await click('.sitesocials a:not(.ig)'); await arrives('social_click', e => e.v === 'linkedin');
});

test('playground runs report outcomes without the code', { skip: NOPY }, async () => {
  await click('#pgb'); await page.waitFor('document.querySelector(".pg .edta")'); await arrives('pg_open');
  const secret = 'student_secret_name';
  const type = code => page.eval(`(()=>{const t=document.querySelector('.edta');t.focus();t.select();document.execCommand('insertText',false,${JSON.stringify(code)})})()`);
  await type(`${secret} = 1\nprint(1/0)`); await click('[data-act=run]');
  const run = await arrives('pg_run', e => e.v === 'py'); assert.equal(run.res, 'ZeroDivisionError'); assert.ok(run.ms > 0);
  await type(`def f():\n    """\n    >>> f()\n    2\n    """\n    return 1`); await click('[data-act=tests]');
  const tests = await arrives('pg_run', e => e.v === 'py-tests'); assert.equal(tests.res, 'failed'); assert.equal(tests.cnt, 1); assert.equal(tests.bad, 1);
  await type(`${secret} = 1\nprint(${secret})`); await click('[data-act=debug]'); await page.waitFor('document.querySelector(".stepping")', 30000);
  assert.ok((await arrives('pg_step')).cnt > 0);
  await click('[data-act=debug]');
  const end = await arrives('pg_debug_end'); assert.equal(end.res, 'ok'); assert.ok(end.tot > 0 && end.cnt >= 1);
  await arrives('runtime_load', e => e.v === 'py' && e.res === 'ok');
  assert.ok(!JSON.stringify(srv.events).includes(secret), 'code never leaves the page');
});
