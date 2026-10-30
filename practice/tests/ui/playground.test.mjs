// Browser tests for the playground, importing problems, Back/Forward, the timed-exam lock and offline use
// (headless Chrome over the DevTools protocol; see cdp.mjs). Builds the site into a temporary directory and serves it.
// Run: node --test practice/tests/ui/playground.test.mjs   (PRACTICE_SKIP_PYODIDE=1 skips the tests that start Python)
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../scripts/build.mjs';
import { launch, serve, sleep } from './cdp.mjs';

const KEY = 'cs61a-practice-v2', PG = 'cs61a-playground-v1', NOPY = !!process.env.PRACTICE_SKIP_PYODIDE;
let srv, br, page, URL0, OUT, MAC, CMD;
before(async () => {
  OUT = mkdtempSync(join(tmpdir(), 'practice-build-'));
  await build(OUT);
  srv = await serve(OUT); br = await launch(); page = await br.newPage(); URL0 = srv.url + '/';
  MAC = await page.eval('/mac|iphone|ipad/i.test(navigator.userAgentData?.platform || navigator.platform)'); CMD = MAC ? 4 : 2; // ⌘ or Ctrl
});
after(async () => { page?.close(); await br?.close(); srv?.close(); });

const q = s => page.eval(s);
// Open a page with the given saved practice state (or none) and an empty playground.
async function fresh(query, state = null) {
  await page.goto(URL0 + 'blank.html');
  await q(`localStorage.clear(); ${state ? `localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(JSON.stringify(state))})` : ''}`);
  await page.goto(URL0 + query);
}
const param = k => q(`new URLSearchParams(location.search).get(${JSON.stringify(k)})`);
const inPlayground = () => page.waitFor('document.body.classList.contains("pgm") && document.querySelector(".pg .edta")');
const msg = () => q('document.querySelector(".pgmsg").textContent');
const out = () => q('document.querySelector(".pgo").textContent');
const code = () => q('document.querySelector(".edta").value');
const until = (expr, ms = 15000) => page.waitFor(expr, ms);
const msgIs = (re, ms) => until(`${re}.test(document.querySelector(".pgmsg").textContent)`, ms);
// Replace the editor's text as typing would (an input event, on the undo stack).
const type = text => q(`(()=>{const t=document.querySelector('.edta');t.focus();t.select();document.execCommand('insertText',false,${JSON.stringify(text)})})()`);
const click = sel => q(`document.querySelector(${JSON.stringify(sel)}).click()`);
const NAV = { back: MAC => MAC ? ['[', 'BracketLeft', 219, 4] : ['ArrowLeft', 'ArrowLeft', 37, 1], fwd: MAC => MAC ? [']', 'BracketRight', 221, 4] : ['ArrowRight', 'ArrowRight', 39, 1] };

test('the playground opens from the header and runs Gleam as you type; each file is kept', async () => {
  await fresh('?exam=final'); await until('document.querySelector("#m .prob")');
  await click('#pgb'); await inPlayground();
  assert.equal(await param('view'), 'play'); assert.equal(await param('f'), 'scratch-py');
  assert.equal(await q('getComputedStyle(document.querySelector("#side")).display'), 'none', 'the sidebar is hidden');
  assert.equal(await q('document.querySelector("#pgb").getAttribute("aria-pressed")'), 'true');
  await click('.seg [data-l=gleam]'); await msgIs('/Finished/', 30000);
  assert.equal(await param('f'), 'scratch-gleam');
  assert.match(await out(), /2 to the 10 is 1024/);
  // As you type: print without newlines, warnings, compile errors, then the compiled code.
  await type('import gleam/io\npub fn main() {\n  let unused = 1\n  io.print("a")\n  io.println("b")\n}');
  await until('/^ab\\n[\\s\\S]*Unused variable/.test(document.querySelector(".pgo").textContent)');
  await type('pub fn main() { 1 + "a" }'); await msgIs('/compile/');
  assert.match(await out(), /Type mismatch/);
  await click('.pgtabs [data-t=js]'); assert.equal(await out(), 'Your code doesn’t compile yet.');
  await type('pub fn main() { 1 + 2 }'); await until('/return 1 \\+ 2/.test(document.querySelector(".pgo").textContent)');
  await click('.pgtabs [data-t=erl]'); await until('/^-module\\(main\\)/.test(document.querySelector(".pgo").textContent)');
  await click('.pgtabs [data-t=out]');
  // Tests, then live runs keep running them.
  await type('pub fn double(x) { x * 3 }\n\npub fn double_test() {\n  assert double(2) == 4\n}');
  await click('[data-act=tests]'); await msgIs('/1 of 1 tests failed/');
  assert.match(await out(), /double: Assertion failed\.\n {2}left: {2}6\n {2}right: 4/);
  const fixed = 'pub fn double(x) { x * 2 }\n\npub fn double_test() {\n  assert double(2) == 4\n}';
  await type(fixed); await msgIs('/Tests passed/');
  // Saved: a reload reopens the same file with the same code.
  await sleep(600); await page.reload(); await inPlayground();
  assert.equal(await param('f'), 'scratch-gleam'); assert.equal(await code(), fixed);
  // Reset asks first, then Undo brings the code back.
  await click('[data-act=reset]'); assert.match(await q('document.querySelector("[data-act=reset]").textContent'), /are you sure/);
  await click('[data-act=reset]'); assert.match(await code(), /^import gleam\/int/);
  await click('.pgundo'); assert.equal(await code(), fixed);
  // Each language is its own file and history entry.
  await click('.seg [data-l=py]'); assert.equal(await param('f'), 'scratch-py');
  await click('#nvb'); await until('new URLSearchParams(location.search).get("f") === "scratch-gleam"');
  assert.equal(await code(), fixed);
  assert.deepEqual(page.logs, []);
});

test('Python: stdin, tracebacks of the program\'s own lines, doctests, and Stop', { skip: NOPY, timeout: 120000 }, async () => {
  await fresh('?exam=final&view=play&f=scratch-py'); await inPlayground();
  await type('name = input("Name? ")\nprint(f"hi {name}")\nprint(1 / 0)');
  await q('(()=>{const d=document.querySelector(".pgin");d.open=true;const t=d.querySelector("textarea");t.value="Ben";t.dispatchEvent(new Event("input"))})()');
  await click('[data-act=run]'); await msgIs('/error/', 90000);
  const o = await out();
  assert.match(o, /^Name\? Ben\nhi Ben\nTraceback \(most recent call last\):\n {2}File "main\.py", line 3/);
  assert.match(o, /ZeroDivisionError: division by zero$/);
  await type('def sq(x):\n    """\n    >>> sq(3)\n    9\n    >>> sq(2)\n    5\n    """\n    return x * x\n');
  await click('[data-act=tests]'); await msgIs('/1 of 2 doctests failed/');
  assert.match(await out(), /Expected:\n {4}5\nGot:\n {4}4/);
  // ⌘↵ / Ctrl+Enter always runs the program, even after Run doctests.
  await type('print(6 * 7)'); await page.key('Enter', 'Enter', 13, CMD); await msgIs('/Finished in/');
  assert.equal(await out(), '42\n');
  await type('i = 0\nwhile True:\n    i += 1'); await click('[data-act=run]');
  await until('!document.querySelector("[data-act=stop]").hidden'); await click('[data-act=stop]');
  await msgIs('/Stopped\\./'); await until('/Python ready/.test(document.querySelector(".pgrt").textContent)', 60000);
  assert.deepEqual(page.logs, []);
});

test('the editor indents, outdents, comments and keeps Tab for leaving it', async () => {
  await fresh('?exam=final&view=play&f=scratch-gleam'); await inPlayground();
  const keys = async (...ks) => { for (const k of ks) await page.key(...k); };
  await type('pub fn f() {}'); await q('document.querySelector(".edta").setSelectionRange(12, 12)');
  await keys(['Enter', 'Enter', 13]); assert.equal(await code(), 'pub fn f() {\n  \n}', 'Enter between braces gives the closer its own line');
  await type('pub fn f() {'); await keys(['Enter', 'Enter', 13]); assert.equal(await code(), 'pub fn f() {\n  ', 'Enter indents after {');
  await q('document.execCommand("insertText", false, "x")'); await keys(['Enter', 'Enter', 13], ['}', 'BracketRight', 221, 8]);
  assert.equal(await code(), 'pub fn f() {\n  x\n}', 'a closing brace on an empty line outdents');
  await q('document.querySelector(".edta").select()'); await keys(['Tab', 'Tab', 9]);
  assert.equal(await code(), '  pub fn f() {\n    x\n  }');
  await keys(['Tab', 'Tab', 9, 8]); assert.equal(await code(), 'pub fn f() {\n  x\n}');
  await keys(['/', 'Slash', 191, CMD]); assert.equal(await code(), '// pub fn f() {\n//   x\n// }');
  await keys(['/', 'Slash', 191, CMD]); assert.equal(await code(), 'pub fn f() {\n  x\n}');
  await q('document.execCommand("undo")'); assert.equal(await code(), '// pub fn f() {\n//   x\n// }', 'key edits are on the undo stack');
  await keys(['Escape', 'Escape', 27], ['Tab', 'Tab', 9]);
  assert.equal(await q('document.activeElement.classList.contains("edta")'), false, 'Escape, then Tab, moves on');
});

test('Return keeps the caret visible and the highlight synchronized in both editor languages', async () => {
  for (const lang of ['py','gleam']) {
    await fresh(`?view=play&f=scratch-${lang}`); await inPlayground();
    await type(Array.from({length:140},(_,i)=>(lang==='py'?'# ':'// ')+'line '+i).join('\n'));
    await q(String.raw`(()=>{const t=document.querySelector('.edta'),s=getComputedStyle(t),row=Math.max(1,Math.floor((t.clientHeight-parseFloat(s.paddingTop)-parseFloat(s.paddingBottom))/parseFloat(s.lineHeight))-1),at=t.value.split('\n').slice(0,row).join('\n').length;t.focus({preventScroll:true});t.setSelectionRange(at,at);t.scrollTop=0})()`);
    const pageY = await q('scrollY');
    for(let i=0;i<10;i++) {
      await page.key('Enter','Enter',13);
      assert.ok(await q(`(()=>{const t=document.querySelector('.edta'),s=getComputedStyle(t),y=parseFloat(s.paddingTop)+(t.value.slice(0,t.selectionEnd).split('\\n').length-1)*parseFloat(s.lineHeight);return y>=t.scrollTop-1&&y+parseFloat(s.lineHeight)<=t.scrollTop+t.clientHeight+1})()`));
    }
    assert.ok(await q('document.querySelector(".edta").scrollTop')>0);
    assert.ok(await q('Math.abs(document.querySelector(".edta").scrollTop-document.querySelector(".edhl").scrollTop)<1'));
    assert.equal(await q('scrollY'),pageY);
  }
});

test('a share link opens the code as a new file, leaving the scratch file alone', async () => {
  await fresh('?exam=final&view=play&f=scratch-gleam'); await inPlayground();
  const shared = 'pub fn main() { "shared" }';
  await type(shared); await sleep(500);
  await q('navigator.clipboard.writeText = async t => { window.copied = t }'); await click('[data-act=share]');
  const link = await until('window.copied');
  assert.match(link, /\?exam=final&view=play#gleam=z[\w-]+$/);
  assert.equal(await q('document.querySelector("[data-act=share] span").textContent'), 'Link copied');
  await type('pub fn main() { "changed after sharing" }'); await sleep(500);
  await page.goto(link); await inPlayground();
  assert.match(await param('f'), /^shared-/); assert.equal(await q('location.hash'), '');
  assert.equal(await q('document.querySelector(".pgt").textContent'), 'Shared code'); assert.equal(await code(), shared);
  assert.equal(await q(`JSON.parse(localStorage.getItem("${PG}")).files["scratch-gleam"].code`), 'pub fn main() { "changed after sharing" }');
  assert.deepEqual(page.logs, []);
});

test('importing a problem: ⌘K, the tree and its keys, search, what fills the blanks, and the way back to practice', async () => {
  await fresh('?exam=final&x=61a-fa26-extra-practice'); await until('document.querySelector("#m .prob")');
  assert.equal(await q('document.querySelectorAll(".pgopen").length'), 6, 'every problem has Add to playground');
  await page.key('k', 'KeyK', 75, CMD); await until('document.querySelector("dialog.pick[open]") && document.body.classList.contains("pgm")');
  const active = () => q('document.querySelector(".pkl li.on").innerText.split("\\n")[0]');
  assert.equal(await active(), 'Extra Gleam and interpreter practice', 'the exam being studied is open and selected');
  await page.key('ArrowRight', 'ArrowRight', 39); assert.match(await active(), /^1\. /);
  await page.key('ArrowDown', 'ArrowDown', 40); await page.key('ArrowDown', 'ArrowDown', 40); assert.equal(await active(), '3. Exhaustive custom types');
  await page.key('ArrowLeft', 'ArrowLeft', 37); assert.equal(await active(), 'Extra Gleam and interpreter practice');
  await page.key('ArrowRight', 'ArrowRight', 39); await page.key('ArrowDown', 'ArrowDown', 40); await page.key('ArrowDown', 'ArrowDown', 40);
  await page.key('Enter', 'Enter', 13); await until('!document.querySelector(".pkdestination").hidden');
  assert.equal(await q('document.querySelector("[data-destination=current]").disabled'),true);
  await click('[data-destination=new]'); await until('!document.querySelector("dialog.pick[open]")');
  const importedId = await param('f'); assert.match(importedId,/^mine-/);
  assert.match(await code(), /Empty -> todo\n\s+Data\(value\) -> todo/, 'no answers yet: blanks');
  await msgIs('/1 of 1 tests failed/');
  assert.match(await q('document.querySelector(".pgprob").innerText'), /A Packet either contains an integer/);
  assert.equal(await q('document.querySelector(".pgpa [data-f=solution]").disabled'), false);
  // Search every exam and import its solution without checking any questions first.
  await click('[data-act=import]'); await until('document.querySelector("dialog.pick[open]")');
  await q('(()=>{const i=document.querySelector(".pks");i.value="only_long_paths";i.dispatchEvent(new Event("input"))})()');
  assert.match(await active(), /Only Paths/);
  await click('.pkfoot [data-f=solution]'); await page.key('Enter', 'Enter', 13);
  await until('!document.querySelector(".pkdestination").hidden'); await click('[data-destination=new]');
  await until('!document.querySelector("dialog.pick[open]")');
  assert.match(await param('f'), /^mine-/); assert.notEqual(await param('f'),importedId);
  await q('history.back()'); await until(`new URLSearchParams(location.search).get("f")===${JSON.stringify(importedId)}`);
  // To practice and back: checked answers fill My answers without changing the saved playground code.
  await click('.pgpo'); await until('!document.body.classList.contains("pgm") && document.querySelector("#m .prob")');
  assert.equal(await param('p'), '3');
  await q(`(async()=>{const s=[...document.querySelectorAll("#m .prob")].find(s=>/^3\\./.test(s.querySelector("h2").textContent));
    const qs=[...s.querySelectorAll(".q")].filter(c=>c.querySelector("textarea"));const a=["0","value"];
    for(const [k,c] of qs.entries()){c.querySelector("textarea").value=a[k];c.querySelector(".ck").click();}})()`);
  await until('[...document.querySelectorAll("#m .prob")].find(s=>/^3\\./.test(s.querySelector("h2").textContent)).querySelectorAll(".q.ok").length === 2');
  await click('#pgb');
  await inPlayground(); assert.match(await code(), /todo/, 'the playground copy opens as it was left');
  assert.equal(await q('document.querySelector(".pgpa [data-f=solution]").disabled'), false);
  await click('.pgpa [data-f=mine]'); await until('document.querySelector(".pgreplace[open]")'); await click('.pgreplace [value=replace]'); await msgIs('/Tests passed/');
  assert.match(await code(), /Empty -> 0\n\s+Data\(value\) -> value/);
  await click('.pgundo'); assert.match(await code(), /Empty -> todo/);
  assert.deepEqual(page.logs, []);
});

test('import asks for current or new playground without changing code before the choice', async () => {
  await fresh('?view=play&f=scratch-py'); await inPlayground();
  const draft = '# keep my draft\nkeep_me = 42\n'; await type(draft); const originalId = await param('f');
  const choose = async () => {
    await click('[data-act=import]'); await until('document.querySelector("dialog.pick[open]")');
    await q(`(()=>{const i=document.querySelector('.pks');i.value='evaluate_expr';i.dispatchEvent(new Event('input'))})()`);
    await click('.pkfoot [data-f=solution]'); await page.key('Enter','Enter',13); await until('!document.querySelector(".pkdestination").hidden');
  };
  await choose(); assert.equal(await code(),draft);
  assert.equal(await q('document.querySelectorAll(".pkdestination [data-destination] svg").length'),2);
  await click('.pkback'); assert.equal(await code(),draft); await page.key('Enter','Enter',13);
  await page.key('Escape','Escape',27); assert.equal(await code(),draft);
  await choose(); await click('[data-destination=current]'); await until('!document.querySelector("dialog.pick[open]")');
  assert.equal(await param('f'),originalId); assert.match(await code(),/^# keep my draft/); assert.match(await code(),/def evaluate_expr/);
  const combined = await code();
  await choose(); await click('[data-destination=new]'); await until('!document.querySelector("dialog.pick[open]")');
  assert.notEqual(await param('f'),originalId); assert.match(await code(),/def evaluate_expr/); assert.doesNotMatch(await code(),/keep_me/);
  assert.equal(await q(`JSON.parse(localStorage.getItem('${PG}')).files[${JSON.stringify(originalId)}].code`),combined);
  assert.deepEqual(page.logs,[]);
});

test('Add to playground creates independent solutions and appends to an existing playground without erasing code', async () => {
  await fresh('?exam=final&x=61a-fa26-extra-practice'); await until('document.querySelector(".pgopen")');
  const button = '[...document.querySelectorAll("#m .prob")].find(s=>/^3\\./.test(s.querySelector("h2").textContent))';
  await q(`${button}.querySelector('.pgopen').click()`);
  await q(`(()=>{const menu=${button}.querySelector('.pgaddmenu');menu.querySelector('.pgaddfill [value=solution]').click();menu.querySelector('[data-add=new]').click()})()`);
  await inPlayground(); const id = await param('f'); assert.match(id,/^mine-/);
  assert.match(await code(), /Empty -> 0\n\s+Data\(value\) -> value/);
  await msgIs('/Tests passed/');
  await type('// keep this draft\npub fn main() { 42 }'); await sleep(500);
  await click('#home'); await until('document.querySelector(".homepaths")'); await click('#exb');
  await until('document.querySelector(".pgopen")');
  await q(`${button}.querySelector('.pgopen').click()`);
  await q(`(()=>{const menu=${button}.querySelector('.pgaddmenu');menu.querySelector('.pgaddfill [value=solution]').click();menu.querySelector('[data-add=existing]').click();[...menu.querySelectorAll('.pgaddtargets input')].find(r=>r.value===${JSON.stringify(id)}).click();menu.querySelector('[data-add=confirm]').click()})()`);
  await inPlayground(); assert.equal(await param('f'),id);
  assert.match(await code(),/keep this draft/); assert.match(await code(),/Empty -> 0/);
  await page.reload(); await inPlayground(); assert.match(await code(),/keep this draft/); assert.match(await code(),/Empty -> 0/);
  assert.deepEqual(page.logs,[]);
});

test('replacing playground code requires confirmation for every fill option', async () => {
  await fresh('?exam=final&x=61a-fa26-extra-practice'); await until('document.querySelector(".pgopen")');
  await click('.pgopen'); await click('[data-add=new]'); await inPlayground();
  const draft = '# keep my current edits\nprint(42)\n'; await type(draft);
  for (const fill of ['solution','blanks','mine']) {
    await click(`.pgpa [data-f=${fill}]`); await until('document.querySelector(".pgreplace[open]")');
    assert.equal(await code(),draft, 'opening confirmation leaves code untouched');
    assert.match(await q('document.querySelector("#pgreplace-description").textContent'), /Are you sure.*replace all code/);
    assert.equal(await q('document.activeElement.value'),'cancel');
    await click('.pgreplace [value=cancel]'); assert.equal(await code(),draft);
    await click(`.pgpa [data-f=${fill}]`); await page.key('Escape','Escape',27); assert.equal(await code(),draft);
    await click(`.pgpa [data-f=${fill}]`); await click('.pgreplace [value=replace]');
    await until('!document.querySelector(".pgreplace[open]")'); assert.notEqual(await code(),draft);
    await click('.pgundo'); assert.equal(await code(),draft);
  }
  assert.deepEqual(page.logs,[]);
});

test('problems without grading templates import executable code and commented prompts', async () => {
  await fresh('?exam=final&x=61a-fa25-final'); await until('document.querySelector(".pgopen")');
  assert.equal(await q('document.querySelectorAll(".pgopen").length'),await q('document.querySelectorAll("#m section.prob").length'));
  await click('.pgopen');
  await q(`(()=>{const menu=document.querySelector('.pgaddmenu');menu.querySelector('.pgaddfill [value=solution]').click();menu.querySelector('[data-add=new]').click()})()`);
  await inPlayground(); assert.match(await code(), /^# /); assert.match(await code(), /^def times\(/m); assert.match(await code(), /^times\(2, 3, 10\)/m); assert.match(await code(), /Answer:/);
  await page.reload(); await inPlayground(); assert.match(await code(), /Answer:/);
  assert.deepEqual(page.logs,[]);
});

test('Back and Forward move between exams, problems, home, timed practice and the playground', async () => {
  await fresh('?exam=final'); await until('document.querySelector("#m .prob")');
  const view = () => q('(()=>{const s=new URLSearchParams(location.search);return s.get("view")||("x:"+s.get("x")+(s.get("p")?"/p"+s.get("p"):""))})()');
  const disabled = () => q('[document.querySelector("#nvb").disabled, document.querySelector("#nvf").disabled]');
  assert.deepEqual(await disabled(), [true, true]);
  const seen = [await view()];
  await q('document.querySelectorAll("#nav details:not(.cur) summary .nm")[0].click()'); await sleep(100); seen.push(await view());
  await q('[...document.querySelectorAll("#nav details.cur .lst a")].at(-1).click()'); await sleep(100); seen.push(await view());
  await click('#home'); await sleep(100); seen.push(await view());
  await click('#ptb'); await until('document.querySelector(".pthome")'); seen.push(await view());
  await click('#pgb'); await inPlayground(); seen.push(await view());
  assert.deepEqual(seen.slice(3), ['home', 'timed', 'play']); assert.match(seen[2], /\/p\d+$/);
  for (let i = seen.length - 2; i >= 0; i--) { await click('#nvb'); await sleep(250); assert.equal(await view(), seen[i], 'Back to ' + seen[i]); }
  assert.deepEqual(await disabled(), [true, false]);
  const [k, c, kc, m] = NAV.fwd(MAC); await page.key(k, c, kc, m); await sleep(200); assert.equal(await view(), seen[1], 'the Forward shortcut');
  const [bk, bc, bkc, bm] = NAV.back(MAC); await page.key(bk, bc, bkc, bm); await sleep(200); assert.equal(await view(), seen[0], 'the Back shortcut');
  // A reload reopens the view the URL names.
  await click('#pgb'); await inPlayground(); await page.reload(); await inPlayground(); assert.equal(await view(), 'play');
  assert.deepEqual(page.logs, []);
});

test('during a timed practice exam the playground is locked: no buttons, no ⌘K, links open the attempt', async () => {
  const now = Date.now(), attempt = { c: 'final', pool: 'source', min: 50, ids: ['61a-fa26-gleam-adapted/4'], keys: ['0|30'], start: now, end: now + 3e6, ans: {} };
  await fresh('?exam=final&x=61a-fa26-extra-practice', { _sv: 3, _c: 'final', _cs: {}, _pt: attempt });
  await until('document.querySelector("#m .prob")');
  assert.equal(await q('document.querySelector("#pgb").hidden'), true);
  assert.equal(await q('getComputedStyle(document.querySelector(".pgopen")).display'), 'none');
  await page.key('k', 'KeyK', 75, CMD); await sleep(200);
  assert.equal(await q('!!document.querySelector("dialog.pick[open]") || document.body.classList.contains("pgm")'), false);
  await page.goto(URL0 + '?exam=final&view=play&f=scratch-py'); await until('document.querySelector("#ptclock")');
  assert.equal(await param('view'), 'timed');
  // Once the attempt is over, the playground is back.
  await q(`(()=>{const S=JSON.parse(localStorage.getItem("${KEY}"));S._pt.done=1;localStorage.setItem("${KEY}",JSON.stringify(S))})()`);
  await page.goto(URL0 + '?exam=final&view=play'); await inPlayground();
  assert.equal(await q('document.querySelector("#pgb").hidden'), false);
  assert.deepEqual(page.logs, []);
});

test('after one visit with the service worker, the site works with the server gone', { skip: NOPY, timeout: 180000 }, async () => {
  const s2 = await serve(OUT); // its own origin, so its service worker and caches don't touch the other tests
  try {
    await page.goto(s2.url + '/?exam=final&view=play&f=scratch-gleam&sw=1&prefetch=1'); await inPlayground();
    await until('/Works offline/.test(document.querySelector(".pg .offl").innerText)', 120000);
    assert.ok(await q('!!navigator.serviceWorker.controller'));
  } finally { s2.close(); }
  assert.equal(await q(`fetch("/sw.js", {cache: "no-store"}).then(() => "up", () => "down")`), 'down');
  await page.reload(); await inPlayground(); await msgIs('/Finished/', 30000);
  assert.match(await out(), /2 to the 10 is 1024/);
  await click('.seg [data-l=py]'); await type('print("offline", 6 * 7)'); await click('[data-act=run]'); await msgIs('/Finished/', 90000);
  assert.equal(await out(), 'offline 42\n');
  await page.goto(s2.url + '/?exam=midterm1&sw=1'); await until('document.querySelector("#q-0-7")', 20000);
  await q(`(()=>{const c=document.querySelector("#q-0-7");c.querySelector("textarea").value="(n // 10) % 2 != n % 2";c.querySelector(".ck").click()})()`);
  await until('/doctests passed/.test(document.querySelector("#q-0-7 .fb").textContent)', 90000);
});
