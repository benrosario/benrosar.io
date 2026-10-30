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

test('switching to Final from the exam sidebar opens questions even when Final was last on Home', async () => {
  await open(null, '?exam=final&view=home');
  await pick('midterm2');
  await q('document.querySelector(".homeexam").click()'); await page.waitFor('document.querySelector("#m .note b")');
  assert.equal((await saved())._cs.final.ex, '');
  await pick('final');
  assert.equal(await selected(), 'final');
  assert.ok(await q('document.querySelectorAll("#m .qw").length') > 0);
  assert.equal(await q('document.body.classList.contains("athome")'), false);
  await clickExam(1); const last = await examTitle();
  await q('document.querySelector("#home").click()'); await page.waitFor('document.querySelector(".homepaths")');
  await pick('midterm2'); await q('document.querySelector(".homeexam").click()');
  await page.waitFor('document.querySelector("#m .note b")'); await pick('final');
  assert.equal(await examTitle(), last, 'Final reopens its most recent source exam');
  await page.viewport(1440,900);
  assert.ok(await q('Math.abs(document.querySelector("#rs").getBoundingClientRect().top-document.querySelector("#exb").getBoundingClientRect().top)<2'), 'Reset exam sits on the primary navbar row');
  assert.ok(await q('document.querySelector("header .bar").getBoundingClientRect().width>0'));
  await page.viewport(360,800,true);
  assert.equal(await q('document.documentElement.scrollWidth>innerWidth'), false);
  assert.ok(await q('document.querySelector("#rs").getBoundingClientRect().width>0'));
  await page.viewport(1280,900);
  assert.deepEqual(page.logs, []);
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
  assert.match(await q('document.querySelector("#stat").textContent'), /^0\/24 correct$/);
  assert.match(await q('document.querySelector("#ptb").textContent'), /^Practice exam · \d+:\d\d/, 'the active attempt keeps running');
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

test('the header title goes home, closing the exam without ending a running practice exam', async () => {
  await open(null, '?exam=midterm1');
  const exam = await examTitle();
  await q('document.querySelector("#ptb").click()'); await page.waitFor('document.querySelector(".pthome")');
  await q('document.querySelector("#ptgo").click()'); await page.waitFor('document.querySelector("#ptclock")');
  await q('document.querySelector("#home").click()'); await page.waitFor('document.querySelector("#m .home")');
  assert.equal(await q('document.querySelectorAll("#nav details.cur").length'), 0, 'no exam is selected');
  assert.equal(await q('getComputedStyle(document.querySelector("#rs")).display'), 'none');
  assert.match(await q('document.querySelector("#ptb").textContent'), /^Practice exam · /);
  assert.equal((await saved())._cs.midterm1.ex, '');
  // Home survives a reload and switching collections; it offers the exam that was open and the running attempt.
  await page.reload(); await ready(); await pick('final'); await pick('midterm1');
  assert.ok(await q('!!document.querySelector("#m .home")'));
  assert.deepEqual(await q('[...document.querySelectorAll(".homebtns button")].map(b=>b.textContent)'), ['Continue ' + exam.replace(/\.$/, ''), 'Resume Midterm 1 practice exam']);
  await q('document.querySelector(".homebtns [data-act=resume]").click()'); await page.waitFor('document.querySelector("#ptclock")');
  await q('document.querySelector("#home").click()'); await page.waitFor('document.querySelector("#m .home")');
  await q('document.querySelector(".homebtns [data-act=last]").click()'); await sleep(50);
  assert.equal(await examTitle(), exam);
  assert.equal(await q('document.querySelectorAll("#nav details.cur").length'), 1);
  // Home hides question tools; the exam workspace retains its progress bar.
  const barW = () => q('document.querySelector("header .bar").getBoundingClientRect().width');
  const examBar = await barW();
  await q('document.querySelector("#home").click()'); await page.waitFor('document.querySelector("#m .home")');
  assert.equal(await q('getComputedStyle(document.querySelector("header .bar")).flexGrow'), '1');
  assert.equal(await barW(), 0, 'home hides question progress');
  assert.ok(examBar > 0);
  assert.equal(await q('getComputedStyle(document.querySelector("#side")).display'), 'none');
  assert.equal(await q('document.querySelectorAll(".homepaths > button").length'), 3);
  assert.ok(await q('document.querySelectorAll(".homeexam").length') > 0);
  // Jumping from home to a late problem scrolls there quickly, not over several seconds.
  await q('[...document.querySelectorAll("#nav details[open] .lst a")].at(-1).click()'); await sleep(600);
  const y = await q('scrollY');
  assert.ok(y > 0);
  assert.ok(await q(`(()=>{const el=[...document.querySelectorAll("#m .prob")].at(-1);el.scrollIntoView({block:"start",behavior:"instant"});return Math.abs(scrollY-${y})<2})()`), 'scroll finished within 600 ms');
  // The title toggles: a second click goes back to the same exam at the same scroll position…
  const at = await q('scrollY');
  await q('document.querySelector("#home").click()'); await page.waitFor('document.querySelector("#m .home")');
  assert.ok(await q('document.body.classList.contains("athome")'));
  assert.equal(await q('document.querySelector("#home").dataset.tip'), 'Back to where you were');
  await q('document.querySelector("#home").click()'); await sleep(50);
  assert.equal(await examTitle(), exam);
  assert.ok(Math.abs(await q('scrollY') - at) < 2, 'scroll position restored');
  assert.equal(await q('document.body.classList.contains("athome")'), false);
  // …and from the timed exam view, back to the running attempt.
  await q('document.querySelector("#ptb").click()'); await page.waitFor('document.querySelector("#ptclock")');
  await q('document.querySelector("#home").click()'); await page.waitFor('document.querySelector("#m .home")');
  await q('document.querySelector("#home").click()'); await page.waitFor('document.querySelector("#ptclock")');
  await q('document.querySelector("#ptb").click()'); await sleep(50);
  assert.equal(await examTitle(), exam, 'leaving the timed view still shows the exam that was open');
  assert.equal(await q('document.querySelectorAll("#side footer").length'),0);
  assert.ok(await q('document.querySelector(".sitefooter").parentElement===document.body'));
  assert.deepEqual(page.logs, []);
});

test('one shared contact footer remains available in every view', async () => {
  await open(null, '?exam=final&view=home');
  await q('window.sharedFooter=document.querySelector(".sitefooter")');
  for (const view of ['home','exb','pgb','ptb']) {
    if (view!=='home') await q(`document.querySelector('#${view}').click()`);
    assert.ok(await q('document.querySelector(".sitefooter")===window.sharedFooter'));
    assert.equal(await q('document.querySelectorAll("#fbb").length'),1);
    for (const y of [0,500,100000]) {
      await q(`scrollTo({top:${y},behavior:'instant'})`);
      assert.ok(await q('(()=>{const r=document.querySelector(".sitefooter").getBoundingClientRect();return Math.abs(r.bottom-innerHeight)<2&&r.top>=0})()'));
    }
    assert.equal(await q('document.querySelectorAll("#side .socials,#side footer").length'),0);
    assert.deepEqual(await q('[...document.querySelectorAll(".sitesocials span")].map(s=>s.textContent)'),['Send feedback','@benrosar.io','ben-rosario']);
    await q('document.querySelector("#fbb").click()'); assert.ok(await q('document.querySelector("#fbd").open'));
    await q('document.querySelector("#fbx").click()');
  }
  await page.viewport(360,800,true);
  await q('Promise.all(document.querySelector("#m").getAnimations().map(a=>a.finished.catch(()=>{})))');
  await q('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  await q('scrollTo({top:100000,behavior:"instant"})');
  assert.ok(await q('document.querySelector("#m").getBoundingClientRect().bottom<=document.querySelector(".sitefooter").getBoundingClientRect().top+1'));
  assert.equal(await q('document.documentElement.scrollWidth>innerWidth'),false);
  await page.viewport(1280,900);
  assert.deepEqual(page.logs,[]);
});

test('Browse exams changes collections in place and preserves the surrounding page', async () => {
  await open(null, '?exam=midterm2&view=home');
  await q('Promise.all(document.querySelector("#m").getAnimations().map(a=>a.finished.catch(()=>{})))');
  await q(`window.homeBefore = {page:document.querySelector('.home'),paths:document.querySelector('.homepaths'),browser:document.querySelector('#home-exams'),study:document.querySelector('#study'),footer:document.querySelector('.sitefooter')};document.querySelector('.homeprogress').open=true;document.querySelector('#home-exams').scrollIntoView({block:'start',behavior:'instant'})`);
  const top = await q('document.querySelector("#home-exams").getBoundingClientRect().top');
  await pick('final');
  assert.ok(await q(`Object.entries(homeBefore).every(([k,n])=>n===document.querySelector({page:'.home',paths:'.homepaths',browser:'#home-exams',study:'#study',footer:'.sitefooter'}[k]))`));
  assert.equal(await q('document.querySelector(".homeprogress").open'), true);
  assert.ok(Math.abs((await q('document.querySelector("#home-exams").getBoundingClientRect().top'))-top)<2);
  assert.match(await q('document.querySelector(".homecounts").textContent'), /across Final/);
  assert.match(await q('document.querySelector(".homecoverage").textContent'), /Final/);
  assert.ok(await q('document.querySelectorAll(".homeexam").length')>0);
  assert.equal(await param(), 'final');
  await q('history.back()'); await page.waitFor('document.querySelector("#study").value==="midterm2"');
  await page.reload(); await ready(); assert.equal(await selected(), 'midterm2');
  assert.deepEqual(page.logs, []);
});

test('the Home Exams action opens the newest final by default and resumes the last exam thereafter', async () => {
  await open(null, '?exam=midterm2&view=home');
  await q('document.querySelector(".homepaths [data-act=exams]").click()');
  await page.waitFor('document.querySelector("#m .note b")');
  assert.equal(await selected(), 'final'); assert.match(await examTitle(), /^Fall 2025 Final/);
  await pick('midterm1'); const last = await examTitle();
  await q('document.querySelector("#home").click()'); await page.waitFor('document.querySelector(".homepaths")');
  await pick('midterm2');
  await q('document.querySelector(".homepaths [data-act=exams]").click()');
  await page.waitFor('document.querySelector("#m .note b")');
  assert.equal(await selected(), 'midterm1'); assert.equal(await examTitle(), last);
  assert.deepEqual(page.logs, []);
});

test('navbar progress expands with the available desktop width', async () => {
  await open(null, '?exam=final');
  await page.viewport(1440,900);
  const width = await q('document.querySelector("header .bar").getBoundingClientRect().width');
  assert.ok(await q('document.querySelector("header .bar").getBoundingClientRect().height>=14'));
  assert.ok(await q('parseFloat(getComputedStyle(document.querySelector("#stat")).fontSize)>=14'));
  assert.match(await q('document.querySelector("#stat").textContent'), /^\d+\/\d+ correct$/);
  assert.ok(await q('document.querySelector("#stat").getBoundingClientRect().right<document.querySelector("header .bar").getBoundingClientRect().left'));
  assert.ok(await q('parseFloat(getComputedStyle(document.querySelector("#rs")).fontWeight)>=700'));
  await page.viewport(1920,900);
  const expanded = await q('document.querySelector("header .bar").getBoundingClientRect().width');
  assert.ok(expanded-width>400, 'progress uses the extra navbar width');
  assert.ok(await q('Math.abs(document.querySelector("#rs").getBoundingClientRect().top-document.querySelector("#exb").getBoundingClientRect().top)<2'));
  await page.viewport(1280,900);
});

test('the home page lists progress in stable collection order', async () => {
  // Every question of this semester's Midterm 1 answered correctly: Midterm 1 leads, the final (whole course) gains a little.
  await open(null, '?exam=midterm2');
  await q(`(async()=>{const b=await fetch(document.querySelector("script[data-content]").dataset.content).then(r=>r.json());
    const e=b.exams.find(e=>e.id=="61a-fa26-mt1"),S=JSON.parse(localStorage.getItem("${KEY}"));
    for(const p of e.p)for(const x of p.b)if(x.k)S[e.id+"|"+x.id]={v:"",ok:true};S._cs.midterm2.ex="";localStorage.setItem("${KEY}",JSON.stringify(S))})()`);
  // A link without an exam opens the saved view (a reload would reopen the exam the URL names).
  await page.goto(URL0 + '?exam=midterm2'); await page.waitFor('document.querySelector("#m .home .cprogs")');
  const rows = await q('[...document.querySelectorAll(".cprogs button")].map(b=>({c:b.dataset.c,correct:+b.querySelector(".num").textContent.split("/")[0],cur:b.getAttribute("aria-current")}))');
  assert.deepEqual(rows.map(r => r.c).sort(), ['final', 'midterm1', 'midterm2', 'midterm3']);
  assert.equal(rows[0].c, 'midterm1'); assert.ok(rows[0].correct > 0);
  assert.deepEqual(rows.map(r => r.c), ['midterm1', 'midterm2', 'midterm3', 'final']);
  assert.equal(rows.find(r => r.cur)?.c, 'midterm2');
  // Choosing a row switches what you're studying for and stays on the home page.
  await q('document.querySelector(".cprogs [data-c=final]").click()'); await sleep(50);
  assert.equal(await selected(), 'final');
  assert.ok(await q('!!document.querySelector("#m .home .cprogs [data-c=final][aria-current]")'));
  assert.deepEqual(page.logs, []);
});

test('activity navigation resumes the last exam and provides compact tools in every activity', async () => {
  await open(null, '?exam=midterm2&view=home');
  await q('document.querySelector(".homeexam").click()'); await page.waitFor('document.querySelector("#m .note b")');
  const first = await examTitle();
  assert.equal(await q('!!document.querySelector("#exb svg")'), true);
  await clickExam(2); const recent = await examTitle();
  await q('document.querySelector("#home").click()'); await page.waitFor('document.querySelector(".homepaths")');
  await pick('final');
  await q('document.querySelector("#exb").click()'); await page.waitFor('document.querySelector("#m .note b")');
  assert.equal(await selected(), 'midterm2'); assert.equal(await examTitle(), recent);
  await page.reload(); await ready(); assert.equal(await examTitle(), recent);
  for (const activity of ['exb','pgb','ptb']) {
    if (activity !== 'exb') await q(`document.querySelector('#${activity}').click()`);
    if (activity === 'pgb') await page.waitFor('document.body.classList.contains("pgm")');
    if (activity === 'ptb') await page.waitFor('document.querySelector(".ptchooser")');
    assert.ok(await q('["zmb","tmb","hlb"].every(id=>document.getElementById(id).getBoundingClientRect().width>0)'));
    await q('document.querySelector("#zmb").click()');
    assert.equal(await q('document.querySelector("#zmp").hidden'), false);
    await page.key('Escape','Escape',27);
    assert.equal(await q('document.querySelector("#zmp").hidden'), true);
    assert.equal(await q('document.activeElement.id'), 'zmb');
  }
  assert.equal(await q('getComputedStyle(document.querySelector("#side")).display'), 'none');
  for (const cid of ['midterm1','midterm2','midterm3','final']) {
    await q(`document.querySelector('[data-collection="${cid}"]').click()`);
    assert.equal(await selected(), cid);
    assert.ok(await q(`!!document.querySelector('[data-collection="${cid}"][aria-pressed=true]')`));
    assert.match(await q('document.querySelector(".pthome h2").textContent'), new RegExp(cid === 'final' ? 'Final' : 'Midterm ' + cid.at(-1)));
  }
  await page.viewport(360,800,true);
  assert.equal(await q('document.documentElement.scrollWidth > innerWidth'), false);
  assert.ok(await q('[...document.querySelectorAll(".ptcollections button")].every(b=>b.getBoundingClientRect().height>=44)'));
  await page.viewport(1280,900);
  assert.deepEqual(page.logs, []);
});

test('sidebar menus remain readable across sidebar widths and long filter labels', async () => {
  await open(null, '?exam=final'); await page.viewport(1280,900);
  for (const width of [200,240,280,324,400,620]) {
    await q(`document.documentElement.style.setProperty('--sw','${width}px')`);
    for (const value of ['all','missed','todo']) {
      await q(`(()=>{const s=document.querySelector('#flt');s.value='${value}';s.onchange()})()`);
      for (const id of ['sdd','dd']) {
        assert.ok(await q(`(()=>{const b=document.querySelector('#${id} .ddb'),s=b.querySelector('span'),r=b.getBoundingClientRect();return s.scrollWidth<=s.clientWidth+1&&r.width>0})()`), `label fits at ${width}px`);
        await q(`document.querySelector('#${id} .ddb').click()`);
        assert.ok(await q(`(()=>{const menu=document.querySelector('#${id} .ddm'),r=menu.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&menu.scrollWidth<=menu.clientWidth+1})()`), `menu fits at ${width}px`);
        assert.ok(await q(`(()=>{const menu=document.querySelector('#${id} .ddm'),r=menu.getBoundingClientRect(),el=document.elementFromPoint(r.right-10,r.top+24);return menu.contains(el)})()`), `menu is not clipped at ${width}px`);
        await q(`document.querySelector('#${id} .ddb').click()`);
      }
    }
  }
  await q('document.documentElement.style.removeProperty("--sw")');
  assert.deepEqual(page.logs, []);
});

test('practice collection switches animate their content and honor reduced motion', async () => {
  await open(null, '?exam=midterm1&view=timed'); await page.waitFor('document.querySelector(".ptcollections")');
  await q(`document.querySelector('[data-collection="midterm2"]').click()`);
  assert.ok(await q('document.querySelector(".pthome").getAnimations().some(a=>a.playState==="running")'));
  await page.send('Emulation.setEmulatedMedia', { features: [{ name:'prefers-reduced-motion',value:'reduce' }] });
  try {
    await q(`document.querySelector('[data-collection="final"]').click()`);
    assert.equal(await q('document.querySelector(".pthome").getAnimations().length'),0);
  } finally { await page.send('Emulation.setEmulatedMedia', {features:[]}); }
});

test('view transitions respect reduced motion', async () => {
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  try {
    await open(null, '?exam=midterm1&view=home');
    await q('document.querySelector("#exb").click()'); await page.waitFor('document.querySelector("#m .note b")');
    await q('new Promise(r=>requestAnimationFrame(r))');
    assert.equal(await q('document.querySelector("#m").getAnimations().length'), 0);
    await q('document.querySelector("#home").click()'); await page.waitFor('document.querySelector(".homepaths")');
    await q('document.querySelector("#ptb").click()'); await page.waitFor('document.querySelector(".ptcollections")');
    await q(`document.querySelector('[data-collection="final"]').click()`);
    await q('new Promise(r=>requestAnimationFrame(r))');
    assert.equal(await q('document.querySelector("#m").getAnimations().length'), 0);
  } finally {
    await page.send('Emulation.setEmulatedMedia', { features: [] });
  }
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
  assert.match(await q('document.querySelector("#ptb").textContent'), /^Practice exam · /);
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
  assert.match(await q(`document.querySelector('#q-${i}-1 .ck').dataset.tip`), /not executed/);
  await q(`(()=>{const c=document.querySelector('#q-${i}-1');c.querySelector('textarea').value='incorrect output';c.querySelector('.ck').click()})()`);
  await page.waitFor(`document.querySelector('#q-${i}-1 .q.no')`);
  assert.match(await q(`document.querySelector('#q-${i}-1 .out').textContent`), /wasn’t run/);
  assert.ok(await q(`!document.querySelector('#q-${i}-1 .ai').hidden`), 'Ask AI button shows after a miss');
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
  // The selected exam always comes first; the sort orders the rest.
  const rest = async () => { const n = await names(); assert.equal(n[0], await q('document.querySelector("#nav details.cur summary .nm").textContent')); return n.slice(1); };
  // Its own row under the two menus, styled as pills.
  const r = await q('(()=>{const s=document.querySelector("#srtb").getBoundingClientRect(),d=document.querySelector("#dd").getBoundingClientRect();return {st:s.top,db:d.bottom}})()');
  assert.ok(r.st >= r.db, JSON.stringify(r));
  assert.equal(await q('getComputedStyle(document.querySelector("#srtb")).borderRadius'), '999px 0px 0px 999px', 'one split pill with the arrow');
  assert.equal(await q('document.querySelector("#srtb").textContent'), 'Sort: Suggested');
  assert.equal(await q('document.querySelector("#srtd").getAttribute("aria-label")'), 'Order: Suggested order. Press to reverse.');
  const suggested = await names();
  await q('document.querySelector("#srtb").click()'); await sleep(200);
  assert.equal(await q('document.querySelector("#srtb").getAttribute("aria-expanded")'), 'true');
  assert.deepEqual(await q('[...document.querySelectorAll("#srto button")].map(b=>b.textContent)'), ['Suggested', 'Exam date', 'Answered', 'Progress', 'Length']);
  await q('document.querySelector("#srto [data-k=date]").click()'); await sleep(200);
  assert.equal(await q('document.querySelector("#srtp").hidden'), true);
  assert.equal(await q('document.querySelector("#srtd").getAttribute("aria-label")'), 'Order: Newest first. Press to reverse.');
  assert.equal((await names())[0], 'Fall 2025 Final');
  assert.deepEqual((await rest()).slice(0, 2), ['Fall 2026 Midterm 1', 'Spring 2026 Midterm 2']);
  await q('document.querySelector("#srtd").click()');
  assert.equal(await q('document.querySelector("#srtd").getAttribute("aria-label")'), 'Order: Oldest first. Press to reverse.');
  assert.equal((await rest())[0], 'Spring 2023 Midterm 2');
  // Length, by keyboard: arrows move between options, Enter picks, Escape closes.
  await q('document.querySelector("#srtb").click()'); await sleep(200);
  assert.equal(await q('document.activeElement.dataset.k'), 'date');
  for (let i = 0; i < 3; i++) await page.key('ArrowRight', 'ArrowRight', 39);
  assert.equal(await q('document.activeElement.dataset.k'), 'length');
  await page.key('Enter', 'Enter', 13); await sleep(200);
  assert.equal(await q('document.querySelector("#srtb").textContent'), 'Sort: Length');
  assert.equal(await q('document.querySelector("#srtd").getAttribute("aria-label")'), 'Order: Shortest first. Press to reverse.');
  assert.equal(await q('document.activeElement.id'), 'srtb');
  assert.equal((await rest())[0], 'Spring 2025 Final');
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

test('Gleam questions compile and run in the browser, and adapted problems are labeled', { timeout: 120000 }, async () => {
  await open(null, '?exam=final');
  const i = await q('[...document.querySelectorAll("#nav details summary .nm")].map(e=>e.textContent).indexOf("Scheme problems adapted to Gleam")');
  assert.ok(i >= 0); await clickExam(i);
  assert.match(await q('document.querySelector("#m .note").textContent'), /Written by this site, not the course staff/);
  assert.match(await q(`document.querySelector('#p-${i}-3 .tip.adapted').textContent`), /Adapted to Gleam by this site from Summer 2025 Final Q7.*not written by course staff/);
  assert.equal(await q(`document.querySelectorAll('#m .prob .tip.adapted').length`), 4);
  assert.ok(await q(`[...document.querySelectorAll('#p-${i}-3 pre .hk')].some(e => e.textContent == 'fn')`), 'Gleam is highlighted');
  const check = async (qid, answer) => {
    await q(`(()=>{const c=document.querySelector('#q-${i}-${qid}');c.querySelector('.q').classList.remove('ok','no');c.querySelector('textarea').value=${JSON.stringify(answer)};c.querySelector('.ck').click()})()`);
    await page.waitFor(`(()=>{const c=document.querySelector('#q-${i}-${qid} .q');return c.classList.contains('ok')||c.classList.contains('no')})()`, 60000);
    return q(`(()=>{const c=document.querySelector('#q-${i}-${qid}');return {ok:c.querySelector('.q').classList.contains('ok'),fb:c.querySelector('.fb').textContent,out:c.querySelector('.out').hidden?'':c.querySelector('.out').textContent}})()`);
  };
  assert.match(await q(`document.querySelector('#q-${i}-30 .ck').dataset.tip`), /compiling your code and running the problem’s tests in Gleam/);
  // A working answer that isn't the official text runs (the first check loads the compiler).
  let r = await check(30, '-1 + k');
  assert.ok(r.ok, JSON.stringify(r)); assert.match(r.fb, /Compiled and ran your Gleam code: the test passed/);
  // A type error shows the compiler's message; a wrong answer shows the failed assert.
  r = await check(29, 'first');
  assert.equal(r.ok, false); assert.match(r.out, /Your Gleam code didn’t compile:[\s\S]*Type mismatch/);
  r = await check(28, 's');
  assert.equal(r.ok, false); assert.match(r.out, /tests failed:[\s\S]*rotate: Assertion failed\.[\s\S]*left:/);
  // An infinite loop is stopped.
  r = await check(30, 'k + 1');
  assert.equal(r.ok, false); assert.match(r.out, /Timed out after 8 seconds/);
  // "Evaluates to": text match, then compiled comparison (value and type), case-sensitive.
  assert.ok((await check(32, '[ "b","c","a" ]')).ok);
  r = await check(32, '["c", "a", "b"]'); assert.equal(r.ok, false); assert.match(r.out, /doesn’t equal the value/);
  r = await check(32, '3'); assert.equal(r.ok, false); assert.match(r.out, /didn’t compile as a Gleam value of the right type/);
  r = await check(32, '["B", "C", "A"]'); assert.equal(r.ok, false);
});

test('topic practice, progressive hints, missed review and a combined Gleam solution', {timeout:120000}, async()=>{
  await open(null,'?exam=final');
  await q(`(()=>{const s=document.querySelector('#topic');s.value='GLEAM';s.onchange({target:s})})()`);
  assert.equal(await q('document.querySelector("#topic").value'),'GLEAM');
  assert.equal(await q('document.querySelectorAll("#m .qw").length'),32);
  const i=await q('document.querySelector("#m .qw").id.split("-")[1]');
  const root=`#q-${i}-5`;
  // Each hint asks first; once both are shown the button hides and shows them.
  const hintBtn = `document.querySelector('${root} .hint')`;
  await q(`${hintBtn}.click()`);
  assert.equal(await q(`document.querySelectorAll('${root} .hints p').length`),0,'the first click only asks');
  await q(`${hintBtn}.click()`);
  assert.equal(await q(`document.querySelectorAll('${root} .hints p').length`),1);
  assert.equal(await q(`document.querySelector('${root} .ans').hidden`),true);
  await q(`${hintBtn}.click()`); await q(`${hintBtn}.click()`);
  assert.equal(await q(`document.querySelectorAll('${root} .hints p').length`),2);
  await sleep(350); assert.equal(await q(`${hintBtn}.textContent`),'Hide hints');
  await q(`${hintBtn}.click()`); await sleep(350);
  assert.equal(await q(`${hintBtn}.textContent`),'Show hints'); assert.equal(await q(`document.querySelector('${root} .hints').hidden`),true);
  await q(`(()=>{const c=document.querySelector('${root}');c.querySelector('textarea').value='t0 == t1';c.querySelector('.ck').click()})()`);
  await page.waitFor(`document.querySelector('${root} .out').textContent.includes('Problem restriction')`);
  assert.ok((await saved())['61a-fa26-gleam-adapted|5'].misses);
  await q(`(()=>{const c=document.querySelector('${root}');c.querySelector('textarea').value='t0.label == t1.label';c.querySelector('.ck').click()})()`);
  await page.waitFor(`document.querySelector('${root} .q').classList.contains('ok')`);
  assert.match(await q('document.querySelector("#flt option[value=missed]").textContent'),/^Previously missed \(1\)$/);
  await q(`(()=>{const s=document.querySelector('#flt');s.value='missed';s.onchange()})()`);
  assert.equal(await q('document.querySelector("#flt").value'),'missed');
  assert.equal(await q('document.querySelectorAll("#m .qw").length'),1,'corrected mistakes stay in review');
  await q(`(()=>{const s=document.querySelector('#flt');s.value='all';s.onchange()})()`);
  const answers={1:'#(first0, first1)',2:'rest0, rest1',3:'[]',5:'t0.label == t1.label',6:'t0.label == t1.label',7:'treequals(p.0, p.1)',8:'zip(t0.branches, t1.branches)'};
  await q(`(()=>{for(const [id,value] of Object.entries(${JSON.stringify(answers)})){const t=document.querySelector('#q-${i}-'+id+' textarea');t.value=value;t.dispatchEvent(new Event('input'));}document.querySelector('#p-${i}-0 .whole button').click()})()`);
  await page.waitFor(`document.querySelector('#p-${i}-0 .whole-result').textContent.includes('tests failed')`,60000);
  await q(`(()=>{const t=document.querySelector('#q-${i}-6 textarea');t.value='list.length(t0.branches) == list.length(t1.branches)';t.dispatchEvent(new Event('input'));document.querySelector('#p-${i}-0 .whole button').click()})()`);
  await page.waitFor(`document.querySelector('#p-${i}-0 .whole-result').textContent.includes('all 3 tests passed')`,60000);
});

test('runtime startup errors preserve drafts and allow retry without recording a wrong answer',async()=>{
  await open(null,'?exam=final');
  const i=await q('[...document.querySelectorAll("#nav details summary .nm")].map(e=>e.textContent).indexOf("Scheme problems adapted to Gleam")');
  await clickExam(i);
  await q(`(()=>{window.RealWorker=window.Worker;window.Worker=class {constructor(){throw new Error('test startup failure')}};const c=document.querySelector('#q-${i}-30');c.querySelector('textarea').value='-1 + k';c.querySelector('textarea').dispatchEvent(new Event('input'));c.querySelector('.ck').click()})()`);
  await page.waitFor(`document.querySelector('#q-${i}-30 .fb').textContent.includes('Could not check')`);
  assert.equal((await saved())['61a-fa26-gleam-adapted|30'],undefined);
  assert.equal(await q(`document.querySelector('#q-${i}-30 .ck').disabled`),false);
  await q('window.Worker=window.RealWorker');
});

test('SQL executes equivalent answers and catches a boundary error in the browser', {skip:!!process.env.PRACTICE_SKIP_PYODIDE,timeout:120000},async()=>{
  await open(null,'?exam=final');
  const check=async answer=>{
    await q(`(()=>{const c=document.querySelector('#q-0-36');c.querySelector('.q').classList.remove('ok','no');c.querySelector('textarea').value=${JSON.stringify(answer)};c.querySelector('.ck').click()})()`);
    await page.waitFor('!document.querySelector("#q-0-36 .ck").disabled',90000);
    return q('({fb:document.querySelector("#q-0-36 .fb").textContent,out:document.querySelector("#q-0-36 .out").textContent})');
  };
  let r=await check('ON id = discussion_id GROUP BY id HAVING 20 < COUNT(*)');
  assert.match(r.fb,/SQL results match on all 3 datasets/);
  r=await check('ON id = discussion_id GROUP BY id HAVING COUNT(*) >= 20');
  assert.match(r.out,/Dataset/);
});

test('unavailable timed checks stay ungraded and can be retried', {timeout:120000},async()=>{
  const now=Date.now();
  await open({_sv:3,_c:'final',_cs:{},_view:'pt',_pt:{c:'final',pool:'source',min:50,ids:['61a-fa26-gleam-adapted/4'],keys:['0|30'],start:now,end:now+3000000,ans:{'0|30':'-1 + k'}}},'?exam=final');
  await q('window.RealWorker=window.Worker;window.Worker=class {constructor(){throw new Error("test offline")}}');
  await q('document.querySelector("[data-act=submit]").click();document.querySelector("[data-act=submit]").click()');
  await page.waitFor('document.querySelector("[data-act=retry]")');
  assert.equal((await saved())._pt.res['0|30'].pending,true);
  assert.match(await q('document.querySelector("#m .note").textContent'),/Provisional score: 0\/0/);
  await q('window.Worker=window.RealWorker;document.querySelector("[data-act=retry]").click()');
  await page.waitFor('document.querySelector(".ptscore")?.textContent==="1/1"',60000);
  assert.equal((await saved())._pt.res['0|30'].ok,true);
  assert.equal((await saved())._pth.length,1,'retry updates the original attempt');
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
  assert.equal(await q('document.querySelector("#m .sh").textContent'), 'Hide answer');
  await q('document.querySelector("#m .sh").click()'); await sleep(300);
  assert.equal(await q('document.querySelector("#m .ans").hidden'), true, 'Hide answer hides it without asking');
  assert.equal(await q('document.querySelector("#m .sh").textContent'), 'Show answer');
  // Theme survives a reload (applied before the content loads).
  await page.reload(); await ready();
  assert.equal(await q('document.documentElement.dataset.theme'), 'dark');
  assert.deepEqual(page.logs.filter(l => !/favicon/.test(l)), []);
});

test('saving reports the actual browser reason, preserves work, retries and also works offline',async()=>{
  await open(null,'?exam=final');
  await q(`window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===${JSON.stringify(KEY)})throw new DOMException('test quota','QuotaExceededError');return window.originalSetItem.call(this,k,v);}`);
  try {
    await q(`(()=>{const t=document.querySelector('#q-0-1 textarea');t.value='unsaved draft';t.dispatchEvent(new Event('input'))})()`);
    await page.waitFor('document.querySelector("#save-notice").dataset.state==="full"');
    assert.match(await q('document.querySelector("#save-notice").textContent'),/Browser storage limit reached/);
    assert.equal(await q('document.querySelector("#q-0-1 textarea").value'),'unsaved draft');
    assert.equal((await saved())._dr?.['61a-fa25-final|1'],undefined,'failed write preserves earlier storage');
    await page.viewport(390,844,true);
    assert.ok(await q('document.documentElement.scrollWidth<=innerWidth+1'));
    await page.screenshot('/private/tmp/practice-save-warning-mobile.png');
    await page.viewport(1280,900);
    await q('Storage.prototype.setItem=window.originalSetItem;document.querySelector(".save-retry").click()');
    await page.waitFor('document.querySelector("#save-notice").dataset.state==="saved"');
    assert.equal((await saved())._dr['61a-fa25-final|1'],'unsaved draft');
    await q('document.querySelector(".save-dismiss").click()');
    assert.equal(await q('document.querySelector("#save-notice").hidden'),true);
    // Network state has no role in storing a draft once the page is loaded.
    await page.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
    await q(`(()=>{const t=document.querySelector('#q-0-1 textarea');t.value='saved while offline';t.dispatchEvent(new Event('input'))})()`);
    await page.waitFor(`JSON.parse(localStorage.getItem(${JSON.stringify(KEY)}))._dr['61a-fa25-final|1']==='saved while offline'`);
    assert.equal(await q('document.querySelector("#save-notice").hidden'),true);
    await q(`Storage.prototype.setItem=function(k,v){if(k===${JSON.stringify(KEY)})throw new DOMException('test blocked','SecurityError');return window.originalSetItem.call(this,k,v);};document.querySelector('#q-0-1 textarea').value='blocked draft';document.querySelector('#q-0-1 textarea').dispatchEvent(new Event('input'));`);
    await page.waitFor('document.querySelector("#save-notice").dataset.state==="blocked"');
    assert.match(await q('document.querySelector("#save-notice").textContent'),/Browser storage is blocked/);
    assert.doesNotMatch(await q('document.querySelector("#save-notice").textContent'),/internet|connection/i);
  }finally{
    await q('Storage.prototype.setItem=window.originalSetItem');
    await page.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
    await page.viewport(1280,900);
  }
});
