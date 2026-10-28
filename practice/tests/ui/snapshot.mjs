// Record observable behavior of the practice app (served from a directory) as JSON, so two builds can be compared.
// Usage: node practice/tests/ui/snapshot.mjs <dir-with-index.html> <out.json> [--legacy]
// --legacy drives the original single-file app (no study-collection selector, exam picked by sidebar click only).
import { writeFileSync } from 'node:fs';
import { launch, serve, sleep } from './cdp.mjs';

const [dir, out] = process.argv.slice(2);
const srv = await serve(dir), br = await launch(), page = await br.newPage();
const snap = {};
const text = sel => `[...document.querySelectorAll(${JSON.stringify(sel)})].map(e=>e.textContent.replace(/\\s+/g,' ').trim())`;
const ready = 'document.querySelector("#m .prob")||document.querySelector("#m .pthome")';
try {
  await page.goto(srv.url + '/');
  await page.eval('localStorage.clear()');
  await page.goto(srv.url + '/?exam=midterm3');
  await page.waitFor(ready);
  snap.title = await page.eval('document.title');
  snap.stat = await page.eval('document.querySelector("#stat").textContent');
  snap.sidebarExams = await page.eval(text('#nav details summary'));
  snap.sidebarLinks = await page.eval(text('#nav details.cur a'));
  snap.note = await page.eval('document.querySelector("#m .note").textContent');
  snap.h2 = await page.eval(text('#m .prob h2'));
  snap.cards = await page.eval('document.querySelectorAll("#m .q").length');
  snap.oosCards = await page.eval('document.querySelectorAll("#m .q.oosq").length');
  snap.badges = await page.eval(text('#m .badge'));
  // Every source exam: its note, stat line and problem count.
  snap.exams = [];
  const n = await page.eval('document.querySelectorAll("#nav details").length');
  for (let i = 0; i < n; i++) {
    await page.eval(`document.querySelectorAll("#nav details")[${i}].querySelector("summary .nm").click()`);
    await sleep(30);
    snap.exams.push(await page.eval(`({note:document.querySelector("#m .note").textContent,stat:document.querySelector("#stat").textContent,
      probs:document.querySelectorAll("#m .prob").length,cards:document.querySelectorAll("#m .q").length,oos:document.querySelectorAll("#m .q.oosq").length,
      links:${text('#nav details.cur a')}})`));
  }
  await page.eval('document.querySelectorAll("#nav details")[0].querySelector("summary .nm").click()');
  // Filters narrow the sidebar.
  snap.filters = {};
  for (const f of ['todo', 'no', 'rec', 'scope', 'all']) {
    await page.eval(`(()=>{const s=document.querySelector("#flt");s.value=${JSON.stringify(f)};s.onchange()})()`);
    snap.filters[f] = await page.eval(text('#nav details summary, #nav .fhint'));
  }
  // Answer the first multiple-choice question correctly and the first text question wrongly.
  snap.check = await page.eval(`(async()=>{
    const qs=[...document.querySelectorAll('#m .q')];
    const mc=qs.find(q=>q.querySelector('input[type=radio]')&&!q.classList.contains('oosq'));
    const r=[];
    for(const inp of mc.querySelectorAll('input')){inp.checked=true;mc.querySelector('.ck').click();await new Promise(r=>setTimeout(r,20));
      r.push(mc.querySelector('.fb').textContent.trim());if(mc.classList.contains('ok'))break}
    const bl=qs.find(q=>q.querySelector('textarea')&&!q.classList.contains('oosq'));
    bl.querySelector('textarea').value='definitely wrong';
    return {mcTries:r,stat:document.querySelector('#stat').textContent};
  })()`);
  snap.storageKeys = await page.eval('Object.keys(JSON.parse(localStorage.getItem("cs61a-practice-v2"))).filter(k=>!k.startsWith("_")).sort()');
  // Timed practice home.
  await page.eval('document.querySelector("#ptb").click()');
  await page.waitFor('document.querySelector(".pthome")');
  snap.ptHome = await page.eval('document.querySelector(".pthome").textContent.replace(/\\s+/g," ")');
  snap.ptButton = await page.eval('document.querySelector("#ptb").textContent');
  await page.eval('document.querySelector("#ptb").click()');
  // Theme cycles auto -> light -> dark -> auto.
  snap.themes = [];
  for (let i = 0; i < 3; i++) { await page.eval('document.querySelector("#th").click()'); await sleep(400); snap.themes.push(await page.eval('document.documentElement.dataset.theme||"auto"')); }
  snap.errors = page.logs;
} finally {
  page.close(); await br.close(); srv.close();
}
writeFileSync(out, JSON.stringify(snap, null, 1));
console.log('wrote', out, 'errors:', snap.errors?.length ?? '?');
