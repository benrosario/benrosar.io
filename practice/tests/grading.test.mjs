import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { loadBank } from '../scripts/build.mjs';
import { grade, sqlJob, gradeSolution, canCheckSolution, solutionQuestions } from '../src/js/grading.js';
import { matchesAnswer, restrictionError } from '../src/js/answers.js';
import { topicStats, wasMissed, missedQuestion } from '../src/js/study.js';
import { resolveCollection } from '../src/js/model.js';
import { createRunner } from '../src/js/runner.js';

const bank=await loadBank();
const find=id=>bank.exams.flatMap(e=>e.p).find(p=>p.id===id);
test('text comparison preserves strings, identifiers, case and token boundaries',()=>{
  assert.equal(matchesAnswer('[#("y ", 2)]','[#("y", 2)]','gleam'),false);
  assert.equal(matchesAnswer('NONE','None','py'),false);
  assert.equal(matchesAnswer('hello # extra','hello','py'),false);
  assert.equal(matchesAnswer("['hi']",'["hi"]','py'),true);
  assert.equal(matchesAnswer('x y','xy','py'),false);
  assert.equal(matchesAnswer('Error(Nil)','error(nil)','gleam'),false);
  assert.equal(matchesAnswer('#( first, second )','#(first,second)','gleam'),true);
  assert.equal(matchesAnswer("name = 'Ada'","NAME='ada'",'sql'),false);
  assert.equal(matchesAnswer('COUNT( * )','count(*)','sql'),true);
  assert.equal(matchesAnswer('if x:\nreturn 1','if x:\n    return 1','py',true),false);
});
test('explicit restrictions reject working shortcuts but allow identifiers in strings/comments',()=>{
  const p=find('61a-fa26-gleam-adapted/1'),q=p.b.find(q=>q.id===5);
  assert.match(restrictionError(q,p,'(t0) == (t1)'),/whole trees/);
  assert.equal(restrictionError(q,p,'t0.label == t1.label'),'');
  const p2=find('61a-fa26-gleam-adapted/2'),q2=p2.b.find(q=>q.id===16);
  assert.match(restrictionError(q2,p2,'case first { _ -> [] }'),/case/);
  assert.match(restrictionError(q2,p2,'[first, ..t]'),/list_concat/);
  assert.equal(restrictionError(q2,p2,'list_concat(t, [first]) // if case'),'');
});
test('exam restrictions follow the PDF wording, including patterns, allowed tokens and characters',()=>{
  const r=(id,qid,a)=>{const p=find(id);return restrictionError(p.b.find(q=>q.id===qid),p,a);};
  // "You may not use and, or, or not." (a passing doctest is not enough)
  assert.match(r('61a-su25-midterm/5',36,'label(b) >= label(t) or 1'),/and, or, or not/);
  assert.equal(r('61a-su25-midterm/5',36,'label(t) <= label(b)'),'');
  // "f may not be the operator of a call expression" / "must call compose"
  assert.match(r('61a-fa24-mt1/5',22,'compose(f, f(x))'),/operator/);
  assert.match(r('61a-fa24-mt1/5',22,'lambda x: x'),/compose/);
  // "Your answer must be a call to shift."
  assert.match(r('61a-fa24-mt1/5',26,'g'),/call to shift/);
  assert.equal(r('61a-fa24-mt1/5',26,'shift(-1, g)'),'');
  // "You may only write names, parentheses, and commas."
  assert.match(r('61a-fa25-mt2/6',28,'f(x[0])'),/only write names/);
  // "You may not write ... 3, 4, 5, 6, 7, 8, or 9" counts digits inside longer numbers
  assert.match(r('61a-fa26-mt1/3',7,'n // 30'),/3, 4, 5/);
  assert.match(r('61a-sp23-mt2/5',23,'yield from f(x)'),/yield from/);
  assert.match(r('61a-sp25-final/9',37,'s[u] if x == t else s[x]'),/Do not write if/);
});
test('whole-solution checking refuses missing answers instead of filling in the key',async()=>{
  const p=find('61a-fa26-gleam-adapted/1');
  assert.ok(canCheckSolution(p));
  assert.match((await gradeSolution(p,{})).out,/every code blank/);
  assert.equal(solutionQuestions(p).length,7);
});
test('workers recover from initialization failure and do not strand queued requests',async()=>{
  let n=0,terminated=0;
  const run=createRunner(()=>({
    postMessage(data){if(++n===1) queueMicrotask(()=>this.onerror({message:'download failed'})); else queueMicrotask(()=>{this.onmessage({data:{id:data.id,loaded:true}});this.onmessage({data:{id:data.id,r:{ok:true,n:1}}});});},
    terminate(){terminated++;}
  }),'Test',{loadMs:50,runMs:20});
  const [a,b]=await Promise.all([run({}),run({})]);
  assert.equal(a.unavailable,true); assert.equal(b.ok,true); assert.equal(terminated,1); run.dispose();
});
test('loading and execution deadlines restart workers and settle every job',async()=>{
  const run=createRunner(()=>({postMessage(){},terminate(){}}),'Test',{loadMs:5,runMs:5});
  const res=await Promise.all([run({}),run({})]);
  assert.ok(res.every(r=>r.unavailable)); run.dispose();
  const busy=createRunner(()=>({postMessage(d){queueMicrotask(()=>this.onmessage({data:{id:d.id,loaded:true}}));},terminate(){}}),'Test',{loadMs:50,runMs:5});
  assert.match((await busy({})).err,/Timed out/); busy.dispose();
});
test('topic accuracy excludes unanswered questions and review retains corrected mistakes',()=>{
  const view=resolveCollection(bank,'final'),id='61a-fa26-extra-practice|1';
  const stats=topicStats(view,{[id]:{ok:true,misses:1}}),t=stats.find(t=>t.topic==='INTERPRETERS');
  assert.ok(t.total>=6); assert.equal(t.answered,1); assert.equal(t.correct,1); assert.equal(t.missed,1);
  assert.equal(wasMissed({ok:true,misses:1}),true); assert.equal(wasMissed({ok:true}),false);
  assert.equal(missedQuestion({_missed:{[id]:true}},id),true,'timed mistakes can be reviewed without changing practice scores');
});
const sqlRun=jobs=>{
  const r=spawnSync('python3',['-B','-c',bank.sqlPrelude+'\nimport json,sys\nprint(json.dumps([run_sql(j) for j in json.load(sys.stdin)]))'],{input:JSON.stringify(jobs),encoding:'utf8',timeout:30000});
  assert.equal(r.status,0,r.stderr); return JSON.parse(r.stdout);
};
test('every executable SQL key and accepted alternative runs against every dataset',()=>{
  const jobs=[];
  for(const e of bank.exams)for(const p of e.p)for(const q of p.b)if(q.sql && q.k==='blank')for(const a of q.a)jobs.push({where:p.id+' q'+q.id,...sqlJob(p,q,a)});
  const results=sqlRun(jobs);
  const failures=results.flatMap((r,i)=>r.ok?[]:[jobs[i].where+': '+r.err]);
  assert.deepEqual(failures,[]); assert.ok(jobs.length>20); assert.ok(results.every(r=>r.n>=3));
});
test('SQL accepts equivalent queries, rejects wrong boundaries, hardcoded examples and writes',()=>{
  const p=find('61a-fa25-final/8'),q=p.b.find(q=>q.id===36);
  const answers=['ON id = discussion_id GROUP BY id HAVING 20 < COUNT(*)','ON id = discussion_id GROUP BY id HAVING COUNT(*) >= 20','ON discussion_id = id WHERE id = 8 GROUP BY id','; DROP TABLE students;'];
  const res=sqlRun(answers.map(a=>sqlJob(p,q,a)));
  assert.equal(res[0].ok,true); assert.equal(res[1].ok,false); assert.equal(res[2].ok,false); assert.equal(res[3].ok,false);
});
test('new practice is clearly authored, has worked explanations and progressive hints',()=>{
  const e=bank.exams.find(e=>e.id==='61a-fa26-extra-practice');
  assert.equal(e.src.site,true); assert.equal(e.p.length,6);
  for(const p of e.p)for(const q of p.b.filter(q=>q.k)){assert.ok(q.x.length>70);assert.equal(q.hints.length,2);assert.equal(q.explanationBy,'site');}
});
