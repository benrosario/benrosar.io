import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../scripts/build.mjs';
import { launch, serve } from './cdp.mjs';

test('all downloaded CS 61B Finals appear in interactive practice', async () => {
  const out = mkdtempSync(join(tmpdir(), 'practice-61b-final-ui-'));
  await build(out, { course: '61b' });
  const srv = await serve(out), browser = await launch(), page = await browser.newPage();
  try {
    await page.goto(srv.url + '/?exam=final');
    await page.waitFor('document.querySelectorAll("#nav details[data-x]").length >= 44');
    const ids = await page.eval('[...document.querySelectorAll("#nav details[data-x]")].map(x => x.dataset.x)');
    const finals = ids.filter(x => x.endsWith('-final'));
    assert.equal(finals.length, 15);
    for (const term of ['sp15', 'sp16', 'sp17', 'sp18', 'sp19', 'fa20', 'sp21', 'fa22', 'sp23', 'fa23', 'sp24', 'fa24', 'sp25', 'fa25', 'sp26']) {
      assert.ok(finals.includes(`61b-${term}-final`), `${term} Final missing`);
    }
    assert.deepEqual(page.logs, []);
  } finally {
    await page.close(); await browser.close(); srv.close();
  }
});
