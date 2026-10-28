// Browser tests for the practice site (headless Chrome over the DevTools protocol; see cdp.mjs).
// Builds the site into a temporary directory, serves it locally and drives the real page.
// Run: node --test practice/tests/ui/ui.test.mjs   (set PRACTICE_SKIP_PYODIDE=1 to skip the test that downloads Python)
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../scripts/build.mjs';
import { launch, serve, sleep } from './cdp.mjs';

const KEY = 'cs61a-practice-v2';
let srv, br, page, URL0;
before(async () => {
  const out = mkdtempSync(join(tmpdir(), 'practice-build-'));
  await build(out);
  srv = await serve(out); br = await launch(); page = await br.newPage(); URL0 = srv.url + '/';
});
after(async () => { page?.close(); await br?.close(); srv?.close(); });

// Open the page with the given saved state (object, or null for a first visit) and optional query string.
async function open(state, query = '') {
  await page.goto(URL0 + 'blank.html');
  await page.eval(`localStorage.clear(); ${state ? `localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(JSON.stringify(state))})` : ''}`);
  await page.goto(URL0 + query);
  await ready();
}
const ready = () => page.waitFor('document.querySelector("#m .prob, #m .pthome") && document.querySelector("#study option")');
const saved = () => page.eval(`JSON.parse(localStorage.getItem(${JSON.stringify(KEY)}))`);
const q = s => page.eval(s);
const selected = () => q('document.querySelector("#study").value');
const param = () => q('new URLSearchParams(location.search).get("exam")');
const examTitle = () => q('document.querySelector("#m .note b").textContent');
const pick = async cid => { await q(`(()=>{const s=document.querySelector('#study');s.value='${cid}';s.onchange()})()`); await sleep(50); };
const clickExam = async i => { await q(`document.querySelectorAll("#nav details")[${i}].querySelector("summary .nm").click()`); await sleep(50); };

test('first visit starts on the default study option and puts it in the URL', async () => {
  await open(null);
  assert.equal(await selected(), 'final');
  assert.equal(await param(), 'final');
  const labels = await q('[...document.querySelectorAll("#study option")].map(o=>o.textContent)');
  assert.deepEqual(labels, ['Midterm 1', 'Midterm 2', 'Midterm 3', 'Final']);
  // Same dropdown style as the filter, side by side in the sidebar's top bar.
  assert.ok(await q('document.querySelector("#sdd").parentElement === document.querySelector("#dd").parentElement'));
  assert.equal(await q('document.querySelector("#sdd .ddb").textContent'), 'Final');
  assert.match(await q('document.querySelector("#sdd .ddb").dataset.tip'), /^Studying for Final \(comprehensive\)/);
  assert.match(await q('document.querySelector("#sddm").textContent'), /Studying for.*Midterm 1Lectures 1–6.*FinalComprehensive/);
  assert.deepEqual(page.logs, []);
});

test('deep links, reloads and Back/Forward follow the selected study option', async () => {
  await open(null, '?exam=midterm2');
  assert.equal(await selected(), 'midterm2');
  assert.match(await q('document.querySelector("#cprog").textContent'), /across Midterm 2/);
  await page.reload(); await ready();
  assert.equal(await selected(), 'midterm2');
  await pick('midterm1');
  assert.equal(await param(), 'midterm1');
  await pick('final');
  await q('history.back()'); await page.waitFor('new URLSearchParams(location.search).get("exam")=="midterm1"');
  await page.waitFor('document.querySelector("#study").value=="midterm1"');
  assert.match(await examTitle(), /Fall 2026 Midterm 1/);
  await q('history.back()'); await page.waitFor('document.querySelector("#study").value=="midterm2"');
  await q('history.forward()'); await page.waitFor('document.querySelector("#study").value=="midterm1"');
  // Aliases and unknown values.
  await open(null, '?exam=mt3'); assert.equal(await selected(), 'midterm3'); assert.equal(await param(), 'midterm3');
  await open(null, '?exam=nonsense'); assert.equal(await selected(), 'final');
});

test('the sidebar, notes, progress and scope labels follow the selected collection', async () => {
  await open(null, '?exam=midterm2');
  const exams = await q('[...document.querySelectorAll("#nav details summary .nm")].map(e=>e.textContent)');
  assert.equal(exams[0], 'Summer 2025 Midterm');
  assert.ok(!exams.includes('Fall 2026 Midterm 1'));
  // A partially included exam: says how much is shown, and out-of-scope parts are labeled for Midterm 2.
  const i = exams.indexOf('Spring 2024 Midterm 2'); await clickExam(i);
  assert.match(await q('document.querySelector("#m .note").textContent'), /Showing the 2 of 4 problems that cover Midterm 2 material/);
  const tip = await q('document.querySelector("#q-' + i + '-19 .badge.oos").dataset.tip');
  assert.match(tip, /^Out of scope for Midterm 2: Uses list mutation/);
  // The same question counts on the final.
  await pick('final');
  const fi = await q('[...document.querySelectorAll("#nav details summary .nm")].map(e=>e.textContent).indexOf("Spring 2024 Midterm 2")');
  await clickExam(fi);
  assert.equal(await q('document.querySelector("#q-' + fi + '-19 .badge.oos")'), null);
  // Recommended filter: Midterm 3 has staff picks; others explain there are none.
  await q('(()=>{const s=document.querySelector("#flt");s.value="rec";s.onchange()})()');
  assert.match(await q('[...document.querySelectorAll("#nav .fhint")].at(-1).textContent'), /haven’t published final exam question picks/);
  await pick('midterm3');
  assert.equal(await q('document.querySelector("#flt").value'), 'all', 'filters are per collection');
  await q('(()=>{const s=document.querySelector("#flt");s.value="rec";s.onchange()})()');
  assert.ok(await q('document.querySelectorAll("#nav details").length') > 5);
  // Midterm 3 notes are the original curation.
  await q('(()=>{const s=document.querySelector("#flt");s.value="all";s.onchange()})()');
  await clickExam(0);
  assert.match(await q('document.querySelector("#m .note").textContent'), /Course staff recommend this full exam as Midterm 3 practice\. Staff say to skip: 2, 3\(a\)\(iii\), 4\(b\)/);
});

test('navigation is remembered per collection and unfinished answers survive switching and reloads', async () => {
  await open(null, '?exam=midterm1');
  await clickExam(2); assert.match(await examTitle(), /Spring 2025 Midterm 1/);
  // Type an answer without checking it.
  await q(`(()=>{const t=document.querySelector('#q-2-1 textarea');t.value='5\\nNone';t.dispatchEvent(new Event('input'))})()`);
  await sleep(350);
  await pick('final'); await pick('midterm1');
  assert.match(await examTitle(), /Spring 2025 Midterm 1/, 'selected exam remembered');
  assert.equal(await q(`document.querySelector('#q-2-1 textarea').value`), '5\nNone');
  // The same question is shown in the final with the same unfinished answer.
  await pick('final');
  const fi = await q('[...document.querySelectorAll("#nav details summary .nm")].map(e=>e.textContent).indexOf("Spring 2025 Midterm 1")');
  await clickExam(fi);
  assert.equal(await q(`document.querySelector('#q-${fi}-1 textarea').value`), '5\nNone');
  await page.reload(); await ready();
  assert.equal(await q(`document.querySelector('#q-${fi}-1 textarea').value`), '5\nNone');
  assert.equal((await saved())._cs.midterm1.ex, '61a-sp25-mt1');
});

test('checking a shared question counts toward every collection that includes it', async () => {
  await open(null, '?exam=midterm1');
  const before = await q('document.querySelector("#cprog").textContent');
  await q(`(async()=>{const c=document.querySelector('#q-0-6');c.querySelectorAll('input')[4].click();c.querySelector('.ck').click()})()`);
  await page.waitFor(`document.querySelector('#q-0-6 .q').classList.contains('ok')`);
  assert.match(await q('document.querySelector("#stat").textContent'), /^1\/11 correct/);
  assert.notEqual(await q('document.querySelector("#cprog").textContent'), before);
  await pick('final');
  assert.match(await q('document.querySelector("#cprog").textContent'), /^1\/\d+ correct across Final/);
  await pick('midterm3');
  assert.match(await q('document.querySelector("#cprog").textContent'), /^0\//);
  assert.deepEqual((await saved())['61a-fa26-mt1|6'].v, 4);
});

test('reset controls say what they clear, including shared questions', async () => {
  await open(null, '?exam=midterm1');
  const tip = await q('document.querySelector("#rs").dataset.tip');
  assert.match(tip, /Clear your saved answers to the 11 questions from Fall 2026 Midterm 1 shown here\. Some also count toward Final/);
  assert.match(await q(`document.querySelector('#q-0-6 .rst').dataset.tip`), /also counts toward Final/);
  await q(`(async()=>{const c=document.querySelector('#q-0-6');c.querySelectorAll('input')[4].click();c.querySelector('.ck').click()})()`);
  await page.waitFor(`document.querySelector('#q-0-6 .q').classList.contains('ok')`);
  await q('document.querySelector("#rs").click()');
  assert.equal(await q('document.querySelector("#rs").textContent'), 'Clear 1 saved answer?');
  await q('document.querySelector("#rs").click()'); await sleep(50);
  assert.equal((await saved())['61a-fa26-mt1|6'], undefined);
});

test('saved data from before study collections migrates and keeps Midterm 3', async () => {
  const now = Date.now();
  const legacy = {
    _uid: 'u1', _theme: 'dark', _ex: 2, _f: 'no', _open: { '61a-fa23-mt2': 1 }, _zoom: 1.1,
    '61a-fa23-mt2|1': { v: 'wrong', ok: false, gv: 4 }, '61a-sp23-mt2|1': { v: '[1, [3]]', ok: true, m: 'Matches the official answer', gv: 4 },
    _pt: { min: 50, ids: ['suffix', 'rises', 'in-order', 'calzone'], start: now - 6e4, end: now + 49 * 6e4, ans: { '0|1': 'sum(s[k:])' } },
    _pth: [{ d: now - 864e5, min: 110, ok: 30, n: 45, used: 5e6, ids: ['suffix', 'full-lot'], ans: {}, res: {}, start: 1, end: 2, sub: now - 864e5, done: 1 }],
  };
  await open(legacy);
  assert.equal(await selected(), 'midterm3');
  assert.equal(await param(), 'midterm3');
  assert.match(await examTitle(), /Fall 2023 Midterm 2/, 'the exam selected before is still selected');
  assert.equal(await q('document.querySelector("#flt").value'), 'no');
  assert.equal(await q('document.documentElement.dataset.theme'), 'dark');
  assert.match(await q('document.querySelector("#stat").textContent'), /0\/24 correct · 1 answered/);
  assert.match(await q('document.querySelector("#ptb").textContent'), /^Exam · \d+:\d\d/, 'the active attempt keeps running');
  const S = await saved();
  assert.equal(S._sv, 3); assert.equal(S._pt.c, 'midterm3'); assert.equal(S._pt.ans['0|1'], 'sum(s[k:])');
  assert.equal(S['61a-sp23-mt2|1'].ok, true);
  assert.ok(await q(`localStorage.getItem("${KEY}:before-sv3")`));
  // History from before still opens for review.
  await q('(()=>{const s=document.querySelector("#flt");s.value="all";s.onchange()})()');
  assert.equal(await q('document.querySelectorAll("#nav .hist a").length'), 1);
  // A URL that names another collection wins, and Midterm 3's state is kept for later.
  await open(legacy, '?exam=final');
  assert.equal(await selected(), 'final');
  await pick('midterm3'); assert.match(await examTitle(), /Fall 2023 Midterm 2/);
});

test('timed practice is per collection, survives switching, submits itself and stays reviewable', async () => {
  await open(null, '?exam=midterm1');
  await q('document.querySelector("#ptb").click()'); await page.waitFor('document.querySelector(".pthome")');
  assert.match(await q('document.querySelector(".pthome h2").textContent'), /Midterm 1/);
  assert.match(await q('document.querySelector(".pthome").textContent'), /original past Midterm 1 problems/);
  assert.deepEqual(await q('[...document.querySelectorAll(".ptopt b")].map(b=>b.textContent)'), ['50 minutes']);
  await q('document.querySelector("#ptgo").click()'); await page.waitFor('document.querySelector("#ptclock")');
  let S = await saved();
  assert.equal(S._pt.c, 'midterm1'); assert.equal(S._pt.pool, 'source'); assert.equal(S._pt.ids.length, 4); assert.ok(S._pt.cv); assert.ok(S._pt.snap.q);
  const first = S._pt.keys[0];
  await q(`(()=>{const w=document.querySelector('#ptq-${first.replace('|', '-')}');const t=w.querySelector('textarea');if(t){t.value='my answer';t.dispatchEvent(new Event('input'))}else{const i=w.querySelector('input');i.click();i.dispatchEvent(new Event('change'))}})()`);
  // Switch collection mid-exam: the attempt keeps its deadline and answers.
  await pick('final');
  assert.match(await q('document.querySelector("#m .note").textContent'), /This is your Midterm 1 practice exam/);
  await q('document.querySelector("#ptb").click()'); await sleep(50);
  assert.match(await q('document.querySelector("#ptb").textContent'), /^Exam · /);
  S = await saved(); assert.equal(S._pt.c, 'midterm1'); assert.ok(S._pt.ans[first] != null);
  // Time runs out while studying for the final: the exam submits itself.
  await q(`(()=>{const S=JSON.parse(localStorage.getItem("${KEY}"));S._pt.end=Date.now()-1000;localStorage.setItem("${KEY}",JSON.stringify(S))})()`);
  await page.reload(); await ready();
  await page.waitFor(`(JSON.parse(localStorage.getItem("${KEY}"))._pth||[]).length==1`, 30000);
  S = await saved();
  assert.equal(S._pth[0].c, 'midterm1'); assert.ok(S._pth[0].cv); assert.ok(S._pth[0].snap);
  assert.equal(S._pth[0].sub, S._pt.end, 'submitted at the deadline');
  // Opening the practice exam shows the result, even though the final is selected.
  assert.equal(await q('document.querySelector("#ptb").textContent'), 'Practice exam');
  await q('document.querySelector("#ptb").click()'); await page.waitFor('document.querySelector(".ptscore")');
  assert.match(await q('document.querySelector("#m .note").textContent'), /Time ran out, so the exam submitted itself/);
  // History is listed under Midterm 1, not the final; it opens for review.
  await pick('midterm1'); await pick('final');
  await page.waitFor('document.querySelector(".pthome")');
  assert.equal(await q('document.querySelectorAll(".pthl").length'), 0);
  assert.match(await q('document.querySelector(".pthome").textContent'), /1 past attempt for other exams/);
  await pick('midterm1');
  await q('document.querySelector(".pthl").click()'); await page.waitFor('document.querySelector(".ptscore")');
  // After a question-bank change, a missing problem is reviewed from the stored snapshot.
  await q(`(()=>{const S=JSON.parse(localStorage.getItem("${KEY}"));S._pth[0].ids[0]='61a-gone/1';S._pth[0].cv='old';localStorage.setItem("${KEY}",JSON.stringify(S))})()`);
  await page.reload(); await ready();
  await q('document.querySelector("#ptb").click()'); await page.waitFor('document.querySelector("#nav .hist a")');
  await q('document.querySelector("#nav .hist a").click()'); await page.waitFor('document.querySelector(".ptscore")');
  assert.match(await q('document.querySelector("#m .note").textContent'), /Some questions have changed since this attempt/);
  assert.ok(await q('document.querySelectorAll("#pt-0 .qw").length') > 0);
});

test('Midterm 3 timed practice still uses the modified-problem pool', async () => {
  await open(null, '?exam=midterm3');
  await q('document.querySelector("#ptb").click()'); await page.waitFor('document.querySelector(".pthome")');
  assert.deepEqual(await q('[...document.querySelectorAll(".ptopt b")].map(b=>b.textContent)'), ['50 minutes', '1 hour 50 minutes']);
  assert.match(await q('document.querySelector(".pthome p").textContent'), /modified versions of every problem the course staff recommend for Midterm 3/);
  await pick('final');
  assert.deepEqual(await q('[...document.querySelectorAll(".ptopt b")].map(b=>b.textContent)'), ['50 minutes', '1 hour 50 minutes', '3 hours']);
  // In practice-exam mode the study menu stays; the filter hides.
  assert.equal(await q('getComputedStyle(document.querySelector("#sdd")).display'), 'block');
  assert.equal(await q('getComputedStyle(document.querySelector("#dd")).display'), 'none');
});

test('text-only answers say they were compared, not run', async () => {
  await open(null, '?exam=final');
  const i = await q('[...document.querySelectorAll("#nav details summary .nm")].map(e=>e.textContent).indexOf("Fall 2025 Final")');
  await clickExam(i);
  assert.match(await q(`document.querySelector('#q-${i}-36 .ck').dataset.tip`), /not run/);
  await q(`(()=>{const c=document.querySelector('#q-${i}-36');c.querySelector('textarea').value='ON id GROUP BY ta';c.querySelector('.ck').click()})()`);
  await page.waitFor(`document.querySelector('#q-${i}-36 .q.no')`);
  assert.match(await q(`document.querySelector('#q-${i}-36 .out').textContent`), /wasn’t run/);
  assert.ok(await q(`!document.querySelector('#q-${i}-36 .ai').hidden`), 'Ask AI button shows after a miss');
});

test('Python blanks run doctests', { skip: !!process.env.PRACTICE_SKIP_PYODIDE, timeout: 120000 }, async () => {
  await open(null, '?exam=midterm1');
  // An answer that isn't the official text but works: (n // 10) % 2 instead of n // 10 % 2.
  await q(`(()=>{const c=document.querySelector('#q-0-7');c.querySelector('textarea').value='(n // 10) % 2 != n % 2';c.querySelector('.ck').click()})()`);
  await page.waitFor(`/doctests passed/.test(document.querySelector('#q-0-7 .fb').textContent)`, 110000);
});

test('sort chips order the sidebar, reverse it, and are remembered per study option', async () => {
  await open(null, '?exam=final');
  const names = () => q('[...document.querySelectorAll("#nav details summary .nm")].map(e=>e.textContent)');
  // Its own row under the two menus, styled as pills.
  const r = await q('(()=>{const s=document.querySelector("#srtb").getBoundingClientRect(),d=document.querySelector("#dd").getBoundingClientRect();return {st:s.top,db:d.bottom}})()');
  assert.ok(r.st >= r.db, JSON.stringify(r));
  assert.equal(await q('getComputedStyle(document.querySelector("#srtb")).borderRadius'), '999px');
  assert.equal(await q('document.querySelector("#srtb").textContent'), 'Sort: Suggested');
  assert.equal(await q('document.querySelector("#srtd").textContent'), 'Suggested order');
  const suggested = await names();
  await q('document.querySelector("#srtb").click()'); await sleep(200);
  assert.equal(await q('document.querySelector("#srtb").getAttribute("aria-expanded")'), 'true');
  assert.deepEqual(await q('[...document.querySelectorAll("#srto button")].map(b=>b.textContent)'), ['Suggested', 'Exam date', 'Answered', 'Progress', 'Length']);
  await q('document.querySelector("#srto [data-k=date]").click()'); await sleep(200);
  assert.equal(await q('document.querySelector("#srtp").hidden'), true);
  assert.equal(await q('document.querySelector("#srtd").textContent'), 'Newest first');
  assert.deepEqual((await names()).slice(0, 3), ['Fall 2026 Midterm 1', 'Spring 2026 Midterm 2', 'Fall 2025 Final']);
  await q('document.querySelector("#srtd").click()');
  assert.equal(await q('document.querySelector("#srtd").textContent'), 'Oldest first');
  assert.equal((await names())[0], 'Spring 2023 Midterm 2');
  // Length, by keyboard: arrows move between options, Enter picks, Escape closes.
  await q('document.querySelector("#srtb").click()'); await sleep(200);
  assert.equal(await q('document.activeElement.dataset.k'), 'date');
  for (let i = 0; i < 3; i++) await page.key('ArrowRight', 'ArrowRight', 39);
  assert.equal(await q('document.activeElement.dataset.k'), 'length');
  await page.key('Enter', 'Enter', 13); await sleep(200);
  assert.equal(await q('document.querySelector("#srtb").textContent'), 'Sort: Length');
  assert.equal(await q('document.querySelector("#srtd").textContent'), 'Shortest first');
  assert.equal(await q('document.activeElement.id'), 'srtb');
  assert.equal((await names())[0], 'Spring 2025 Final');
  await q('document.querySelector("#srtb").click()'); await sleep(200); await page.key('Escape', 'Escape', 27); await sleep(200);
  assert.equal(await q('document.querySelector("#srtp").hidden'), true);
  // Each study option keeps its own sort; the choice survives a reload.
  await pick('midterm3');
  assert.equal(await q('document.querySelector("#srtb").textContent'), 'Sort: Suggested');
  assert.ok(await q('[...document.querySelectorAll("#srto button")].some(b=>b.dataset.k=="picks")'), 'Midterm 3 can sort by staff picks');
  await pick('final');
  assert.equal(await q('document.querySelector("#srtb").textContent'), 'Sort: Length');
  await page.reload(); await ready();
  assert.equal(await q('document.querySelector("#srtb").textContent'), 'Sort: Length');
  assert.deepEqual((await saved())._cs.final.sort, { by: 'length', desc: false });
  // Back to the suggested order, and hidden during a practice exam.
  await q('document.querySelector("#srtb").click()'); await sleep(200);
  await q('document.querySelector("#srto [data-k=suggested]").click()'); await sleep(100);
  assert.deepEqual(await names(), suggested);
  await q('document.querySelector("#ptb").click()'); await sleep(100);
  assert.equal(await q('getComputedStyle(document.querySelector("#sortbar")).display'), 'none');
});

test('keyboard: the study menu works like the filter menu', async () => {
  await open(null, '?exam=midterm2');
  const b = '#sdd .ddb';
  assert.equal(await q(`document.querySelector('${b}').getAttribute('aria-haspopup')`), 'listbox');
  await q(`document.querySelector('${b}').focus()`);
  await page.key('ArrowDown', 'ArrowDown', 40); await sleep(50);
  assert.equal(await q(`document.querySelector('${b}').getAttribute('aria-expanded')`), 'true');
  await page.key('ArrowDown', 'ArrowDown', 40); await page.key('Enter', 'Enter', 13); await sleep(80);
  assert.equal(await selected(), 'midterm3');
  assert.equal(await param(), 'midterm3');
  assert.equal(await q('document.activeElement === document.querySelector("#sdd .ddb")'), true, 'focus returns to the button');
  assert.equal(await q('document.querySelector("#sddm").hidden'), true);
  await page.key('ArrowUp', 'ArrowUp', 38); await page.key('Escape', 'Escape', 27); await sleep(50);
  assert.equal(await selected(), 'midterm3', 'Escape closes without changing');
});

test('mobile layout: selector near the top, no sideways scrolling', async () => {
  await page.viewport(390, 844, true);
  try {
    await open(null, '?exam=final');
    // Directly under the header, beside the filter, and fully on screen.
    const r = await q('(()=>{const b=document.querySelector("#study").getBoundingClientRect(),f=document.querySelector("#flt").getBoundingClientRect(),h=document.querySelector("header").getBoundingClientRect();return {top:b.top,right:b.right,bottom:b.bottom,hb:h.bottom,ft:f.top,fl:f.left,fr:f.right}})()');
    assert.ok(r.top - r.hb < 30 && Math.abs(r.top - r.ft) < 2 && r.right <= r.fl && r.fr <= 375 && r.bottom < 844, JSON.stringify(r));
    assert.ok(await q('document.scrollingElement.scrollWidth <= innerWidth + 1'));
    // Same size as the filter's picker beside it.
    assert.ok(await q('Math.abs(document.querySelector("#study").getBoundingClientRect().height - document.querySelector("#flt").getBoundingClientRect().height) < 1'));
    assert.equal(await q('document.querySelector("#study").selectedOptions[0].textContent'), 'Final');
  } finally { await page.send('Emulation.clearDeviceMetricsOverride'); }
});

test('themes and the existing study tools still work', async () => {
  await open(null, '?exam=midterm3');
  const bg = () => q('getComputedStyle(document.body).backgroundColor');
  await q('document.querySelector("#th").click()'); await sleep(400);
  assert.equal(await q('document.documentElement.dataset.theme'), 'light');
  await q('document.querySelector("#th").click()'); await sleep(400);
  assert.equal(await q('document.documentElement.dataset.theme'), 'dark');
  assert.notEqual(await bg(), 'rgb(247, 247, 245)');
  await q('document.querySelector("#zi").click()'); await sleep(350);
  assert.equal(await q('document.querySelector("#zv").value'), '110%');
  await q('document.querySelector("#hlb").click()');
  assert.ok(await q('document.body.classList.contains("nohl")'));
  await q('document.querySelector("#tmb").click()'); await sleep(50);
  assert.equal(await q('document.querySelector("#tmp").hidden'), false);
  // Show answer asks first, then reveals.
  await q('document.querySelector("#m .sh").click()'); await q('document.querySelector("#m .sh").click()'); await sleep(300);
  assert.match(await q('document.querySelector("#m .ans").textContent'), /Official answer/);
  // Theme survives a reload (applied before the content loads).
  await page.reload(); await ready();
  assert.equal(await q('document.documentElement.dataset.theme'), 'dark');
  assert.deepEqual(page.logs.filter(l => !/favicon/.test(l)), []);
});
