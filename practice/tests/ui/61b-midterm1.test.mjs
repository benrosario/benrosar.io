import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../scripts/build.mjs';
import { launch, serve } from './cdp.mjs';

test('the older CS 61B Midterm 1 exams open with their scored problems', async () => {
  const out = mkdtempSync(join(tmpdir(), 'practice-61b-ui-'));
  await build(out, { course: '61b' });
  const srv = await serve(out), browser = await launch(), page = await browser.newPage();
  try {
    await page.goto(srv.url + '/?exam=midterm1');
    await page.waitFor('document.querySelectorAll("#nav details[data-x]").length === 14');
    const exams = await page.eval('[...document.querySelectorAll("#nav details[data-x]")].map(x => [x.dataset.x, x.querySelector("summary .nm").textContent])');
    for (const term of ['sp15', 'sp16', 'sp17', 'sp18', 'sp19']) {
      const id = `61b-${term}-mt1`;
      assert.ok(exams.some(([x]) => x === id), `${id} missing from sidebar`);
    }
    assert.deepEqual(page.logs, []);
  } finally {
    await page.close(); await browser.close(); srv.close();
  }
});
