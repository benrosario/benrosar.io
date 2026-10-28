const K='cs61a-practice-v2';let S={};try{S=JSON.parse(localStorage.getItem(K))||{}}catch(e){}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
// ---- usage events: queued in memory and sent in one beacon when the tab is hidden; only on the live site ----
const EVON=location.hostname=='practice.benrosar.io',SID=Math.random().toString(36).slice(2,10);let EQ=[];
if(EVON&&!S._uid){S._uid=crypto.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now().toString(36);save()}
function ev(n,d){if(!EVON)return;EQ.push({n,...d});if(EQ.length>=25)flushEv()}
function flushEv(){if(!EQ.length)return;const b=JSON.stringify({u:S._uid,s:SID,e:EQ});EQ=[];try{navigator.sendBeacon('/e',b)}catch(e){}}
addEventListener('visibilitychange',()=>{if(document.visibilityState=='hidden')flushEv()});addEventListener('pagehide',flushEv);
if(EVON){const s=document.createElement('script');s.defer=true;s.src='https://static.cloudflareinsights.com/beacon.min.js';
 s.dataset.cfBeacon=JSON.stringify({token:'99d6c5ac1ddb482bbb2706d1bd61bea6'});document.head.append(s)}
const $=s=>document.querySelector(s),m=$('#m'),nav=$('#nav'),side=$('#side'),flt=$('#flt'),th=$('#th');
const THEMES=['auto','light','dark'];
const SV=p=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICONS={light:SV('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
 dark:SV('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
 auto:SV('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>')};
const hlb=$('#hlb');
function applyHL(){const on=S._hl!==false;document.body.classList.toggle('nohl',!on);hlb.setAttribute('aria-pressed',on);
 hlb.dataset.tip=on?'Code colors on. Click to turn off.':'Code colors off. Click to turn on.';hlb.setAttribute('aria-label','Code colors');
 hlb.innerHTML=SV('<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.5-1.2-.3-.3-.5-.7-.5-1.1 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4.1-4-7.5-9-7.5z"/><g class="on-only" fill="currentColor" stroke="none"><circle cx="7.5" cy="11" r="1.3"/><circle cx="10" cy="7" r="1.3"/><circle cx="14.5" cy="7" r="1.3"/><circle cx="17" cy="11" r="1.3"/></g>'+(on?'':'<path d="M4 4l16 16"/>'))}
hlb.onclick=()=>{S._hl=S._hl===false;save();applyHL()};
function applyTheme(){const t=S._theme||'auto';if(t=='auto')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=t;const name={auto:'Auto (follows system)',light:'Light',dark:'Dark'}[t];th.innerHTML=ICONS[t];th.dataset.tip='Theme: '+name+'. Click to change.';th.setAttribute('aria-label','Theme: '+name)}
th.onclick=()=>{S._theme=THEMES[(THEMES.indexOf(S._theme||'auto')+1)%3];save();ev('theme',{v:S._theme});
 if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const t=document.startViewTransition(applyTheme);t.ready.catch(()=>{});t.finished.catch(()=>{});t.updateCallbackDone.catch(()=>{})}else applyTheme()};applyTheme();
let cur=+(S._ex??0);if(!D[cur])cur=0;flt.value=S._f||'all';S._open=S._open||{[D[cur].id]:1};

// ---- Python runner: Pyodide in a worker, restarted on timeout ----
const WSRC=`importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
const ready=(async()=>{self.py=await loadPyodide();py.runPython(${JSON.stringify(PRELUDE)});postMessage({ready:1})})();
onmessage=async e=>{await ready;let r;try{py.globals.set('SRC',e.data.full);py.globals.set('TST',e.data.test);r=JSON.parse(py.runPython('import json\\njson.dumps(run_tests(SRC, TST))'))}catch(err){r={ok:false,err:String(err)}}postMessage({id:e.data.id,r})}`;
let W=null,wReady=null,jobs={},seq=0;
function worker(){if(W)return;W=new Worker(URL.createObjectURL(new Blob([WSRC],{type:'text/javascript'})));
 wReady=new Promise(res=>{W.onmessage=e=>{if(e.data.ready)return res();const j=jobs[e.data.id];if(j){clearTimeout(j.t);delete jobs[e.data.id];j.res(e.data.r)}}});
 W.onerror=e=>{Object.values(jobs).forEach(j=>j.res({ok:false,err:'Python failed to load: '+(e.message||'network error')}));jobs={};W=null}}
async function runPy(full,test){worker();const id=++seq;const p=new Promise(res=>jobs[id]={res});await wReady;
 jobs[id]&&(jobs[id].t=setTimeout(()=>{const j=jobs[id];delete jobs[id];W.terminate();W=null;j.res({ok:false,err:'Timed out after 8 seconds (infinite loop or recursion?)'})},8000));
 W.postMessage({id,full,test});return p}
function fill(text,alone,vals){return text.split('\n').map(line=>{for(const [,bid] of [...line.matchAll(/⟦(B[0-9_]+)⟧/g)]){const tok='⟦'+bid+'⟧';let v=vals[bid];
  if(v!=null&&line.endsWith(tok+':'))v=v.trimEnd().replace(/:$/,'');
  if(alone[bid]){const pre=line.slice(0,line.indexOf(tok));line=(v??'pass').split('\n').map(x=>pre+x).join('\n')}
  else line=line.replace(tok,()=>(v??'__unfilled__').split('\n').join(' '))}return line}).join('\n')}

// ---- grading ----
const GV=4; // bump when grading changes so old wrong answers can be re-checked
// Remove indentation shared by every line (and blank edges), so pasted or indented answers line up with the blank.
function dedent(t){const L=t.replace(/\t/g,'    ').split('\n');while(L.length&&!L[0].trim())L.shift();while(L.length&&!L.at(-1).trim())L.pop();
 const n=Math.min(...L.filter(l=>l.trim()).map(l=>l.match(/^ */)[0].length));return L.map(l=>l.slice(n).trimEnd()).join('\n')}
const norm=s=>s.toLowerCase().replace(/"/g,"'").replace(/\s+/g,'').replace(/;$/,'');
async function grade(q,v,p){
 if(q.k=='mc')return{ok:v===q.a};
 if(q.k=='sata')return{ok:[...q.a].sort()+''==[...v].sort()+''};
 if(q.a.some(x=>norm(x)==norm(v)))return{ok:true,how:'Matches the official answer'};
 if(!q.r)return{ok:false};
 const R=p.run,vals={...R.v},parts=q.r.length>1?v.split('\n').filter(x=>x.trim()).map(x=>x.trim()):[dedent(v)];
 if(parts.length!=q.r.length)return{ok:false,out:`This question has ${q.r.length} blanks. Put each on its own line.`};
 q.r.forEach((b,i)=>vals[b]=parts[i]);
 const full=R.c.map(c=>fill(c,R.b,vals)).join('\n\n'),r=await runPy(full,fill(R.c[R.ch[q.r[0]]],R.b,vals));
 return r.ok?{ok:true,how:`Ran your code: all ${r.n} doctests passed`}:{ok:false,out:'Ran your code: '+(r.failed?`${r.failed} of ${r.n} doctests failed:\n`:'')+(r.err||'').trim()}}
function keyText(q){if(q.k=='mc')return q.o[q.a];if(q.k=='sata')return q.a.map(i=>q.o[i]).join('\n');return q.a.join('\n\nor\n\n')}
// ---- rendering of prose/code segments with lightweight syntax highlighting ----
const KW={py:'def class return if elif else for while in not and or is lambda yield from import None True False try except raise assert pass break continue with as global nonlocal del finally',
 scm:'define lambda if cond let begin and or else quote define-macro cons-stream expect',
 sql:'SELECT FROM WHERE AS GROUP BY ORDER LIMIT HAVING CREATE TABLE UNION AND OR NOT DESC ASC JOIN ON INSERT INTO VALUES DISTINCT'};
const BI={py:'print len range list map filter sum max min abs isinstance iter next str int float tuple sorted any all super type dict set zip enumerate reversed repr round pow self Link Tree',
 scm:'car cdr cons list append null? nil #t #f length map filter reduce eq? equal? not display print cadr',
 sql:'COUNT SUM AVG MIN MAX ABS ROUND'};
const HSETS={};for(const l in KW)HSETS[l]=[new Set(KW[l].split(' ')),new Set(BI[l].split(' '))];
const TQ=/^("""|''')/, PROMPT={py:/^(>>>|\.\.\.)(?=\s|$)/,scm:/^(scm>|\.\.\.>)/,sql:/^(sql>|\.\.\.>)/},
 COMMENT={py:/^#.*/,scm:/^;.*/,sql:/^--.*/}, WORD={py:/^[A-Za-z_]\w*/,scm:/^[#A-Za-z_][\w\-?!*<>=]*/,sql:/^[A-Za-z_]\w*/};
// Highlight one line. st.doc holds the open triple-quote while inside a docstring.
function hlLine(line,lang,st){const [kw,bi]=HSETS[lang];let o='',i=0,prev='';const put=(c,t)=>o+=c?`<span class="${c}">${esc(t)}</span>`:esc(t);
 if(st.doc){const e=line.indexOf(st.doc);
  if(e<0){if(/^\s*(>>>|\.\.\.)\s/.test(line)){const d=st.doc;st.doc=null;const r=hlLine(line,lang,st);st.doc=d;return r}put('hd',line);return o}
  put('hd',line.slice(0,e+3));i=e+3;st.doc=null}
 while(i<line.length){const r=line.slice(i);let m;
  if(r[0]=='⟦'){o+='<span class="fillv">';i++;continue}if(r[0]=='⟧'){o+='</span>';i++;continue}
  if(m=r.match(/^⟪([a-z]?)⟫/)){o+=`<span class="blank">${m[1]?'('+m[1]+')':'&nbsp;'}</span>`;i+=m[0].length;continue}
  if(lang=='py'&&(m=r.match(TQ))){const e=r.indexOf(m[1],3);if(e<0){put('hd',r);st.doc=m[1];return o}put('hd',r.slice(0,e+3));i+=e+3;continue}
  if(!o.replace(/&nbsp;|\s/g,'')&&(m=r.match(PROMPT[lang]))){put('hp',m[0]);i+=m[0].length;continue}
  if(m=r.match(COMMENT[lang])){put('hc',m[0]);break}
  if(m=r.match(/^(f?'(?:\\.|[^'\\⟦⟧])*'?|f?"(?:\\.|[^"\\⟦⟧])*"?)/)){put('hs',m[0]);i+=m[0].length;continue}
  if(m=r.match(/^\d+(\.\d+)?/)){put('hn',m[0]);i+=m[0].length;continue}
  if(m=r.match(WORD[lang])){const w=m[0],key=lang=='sql'?w.toUpperCase():w;
   const fn=prev=='def'||prev=='class'||prev=='define'||(lang=='py'&&/^\s*\(/.test(line.slice(i+w.length))&&!kw.has(w)&&!bi.has(w));
   put(kw.has(key)?'hk':bi.has(key)?'hb':fn?'hf':'',w);prev=w;i+=w.length;continue}
  put('',line[i]);if(line[i].trim())prev='';i++}
 return o}
function hl(code,lang){const st={doc:null};return code.split('\n').map(l=>hlLine(l,lang,st)).join('\n')}
const FILLS=[];
function fillCode(code,f){return code.split('\n').map(line=>{const alone=line.trim().match(/^⟪([a-z])⟫$/);
  if(alone&&f[alone[1]]){const pre=line.slice(0,line.indexOf('⟪'));return f[alone[1]].split('\n').map(x=>pre+'⟦'+x+'⟧').join('\n')}
  return line.replace(/⟪([a-z])⟫/g,(t,x)=>f[x]!=null?'⟦'+f[x].split('\n').join(' ')+'⟧':t)}).join('\n')}
function lnWrap(g,h){return g.ln?h.split('\n').map(l=>`<span class="ln">${l}</span>`).join('\n'):h}
function codeHTML(g){if(!g.f)return `<pre class="code${g.ln?' lnums':''}">${lnWrap(g,hl(g.c,g.lang))}</pre>`;const k=FILLS.push(g)-1;
 return `<div class="cb"><pre class="code">${hl(g.c,g.lang)}</pre><div class="cbh"><button class="fa" data-k="${k}">Show all answers</button></div></div>`}
function wireFills(root){root.querySelectorAll('.fa').forEach(btn=>{const g=FILLS[btn.dataset.k],pre=btn.closest('.cb').querySelector('pre');
 const show=()=>{pre.innerHTML=hl(fillCode(g.c,g.f),g.lang);btn.textContent='Hide all answers';btn.classList.add('shown')};
 const hide=()=>{pre.innerHTML=hl(g.c,g.lang);btn.textContent='Show all answers';btn.classList.remove('shown');return true};
 confirmBtn(btn,show,()=>btn.classList.contains('shown')&&hide())})}
function segHTML(segs){return segs.map(g=>g.c!=null?codeHTML(g):g.h?`<h3>${esc(g.h)}</h3>`
 :`<p>${esc(g.p).replace(/_{3,}/g,'<span class="blank">&nbsp;</span>')}</p>`).join('')}

// ---- "Copy AI prompt": a self-contained tutoring prompt for a missed question ----
const FENCE={py:'python',scm:'scheme',sql:'sql'};
function segText(segs){return segs.map(g=>g.c!=null?'```'+FENCE[g.lang]+'\n'+g.c.replace(/⟪([a-z]?)⟫/g,(t,x)=>'____'+(x?'('+x+')':'')+'____')+'\n```'
 :g.h?g.h:g.p.replace(/_{3,}/g,'______')).join('\n\n')}
function answerText(q,v){if(q.k=='mc')return v==null?'(none)':q.o[v];if(q.k=='sata')return v.length?v.map(i=>'- '+q.o[i]).join('\n'):'(none selected)';return v}
function aiPrompt(e,p,q,v,out){
 const ask=segText(q.l),kind={mc:'multiple choice (one answer)',sata:'select all that apply',blank:'fill in the blank'}[q.k];
 const opts=q.o?'\n\nOptions:\n'+q.o.map(o=>'- '+o).join('\n'):'';
 const block=(t,lang)=>'```'+(lang||'')+'\n'+t+'\n```';
 const lang=q.k=='blank'&&/[()=\[\].]/.test(q.a[0])?'python':'';
 return `I'm studying for a CS 61A (UC Berkeley, Python/Scheme/SQL) exam and got a past exam question wrong. Please help me understand my mistake.

## Problem: ${e.t}, ${p.t}
${p.b.filter(b=>b.s).map(b=>segText(b.s)).join('\n\n')}

## The question I answered (${kind})
${ask}${opts}

## My answer
${block(answerText(q,v),lang)}

## Official answer
${block(answerText(q,q.k=='blank'?q.a[0]:q.a),lang)}${q.k=='blank'&&q.a.length>1?'\nOther accepted forms:\n'+q.a.slice(1).map(x=>block(x,lang)).join('\n'):''}${q.x?'\n\nStaff explanation: '+q.x:''}${out?'\n\n## What happened when my answer was run against the doctests\n'+block(out):''}

## What I'd like from you
1. Pinpoint exactly where my reasoning goes wrong. Name the specific concept or misconception (for example: mutation vs. creating a new object, which frame a name is looked up in, off-by-one, base case, iterator exhaustion).
2. Walk through a small concrete example step by step, comparing what my answer does with what the official answer does.
3. Say whether my answer could be correct under some reasonable reading of the problem, or if it's only a small fix away. If so, what would change?
4. Give me one short rule of thumb to avoid this mistake, plus a quick practice question (without the answer) that tests the same idea.

Keep it concise, and don't just restate the official answer. Explain the why.`}
async function copyText(t){try{await navigator.clipboard.writeText(t);return true}catch(e){
 const a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.append(a);a.select();
 let ok=false;try{ok=document.execCommand('copy')}catch(_){}a.remove();return ok}}

const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

const OOS=b=>(b.g||[]).includes('oos');
const TIPICON={dn:'★',csm:'◆',oos:'⊘'},BADGE={dn:'DeNero pick',csm:'CSM pick',oos:'Out of scope'};
function counts(e,p){let n=0,ok=0;(p?[p]:e.p).forEach(p=>p.b.forEach(b=>{if(b.s||OOS(b))return;n++;const s=S[e.id+'|'+b.id];if(s&&s.ok)ok++}));return{n,ok}}
function sidebar(){if(ptView)return;nav.innerHTML='';const f=flt.value,fl=f!='all';let any=0;
 if(fl){const h=document.createElement('div');h.className='fhint';h.textContent=`Showing ${FNAME[f]} questions from all exams`;nav.append(h)}
 D.forEach((e,i)=>{const d=document.createElement('details'),c=counts(e);
  const match=p=>fl?p.b.filter(b=>b.k&&keep(f,b,S[e.id+'|'+b.id])):null,em=fl?e.p.reduce((k,p)=>k+match(p).length,0):0;
  if(fl&&!em)return;any++;
  d.open=fl?((S._fo||{})[e.id]!==0):!!S._open[e.id];if(i==cur)d.className='cur';
  d.innerHTML=`<summary><button class="tg" type="button" aria-label="Show or hide ${esc(e.t)} problems" data-tip="Show or hide problems without switching exams" aria-expanded="${d.open}"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="nm">${esc(e.t)}</span>${fl?`<span class="ct" title="${em} matching">${em}</span>`:c.ok==c.n?'<span class="done" title="Complete" aria-label="Complete">✓</span>':`<span class="ct">${c.ok}/${c.n}</span>`}</summary>`;
  const lst=document.createElement('div');lst.className='lst';
  e.p.forEach((p,j)=>{const mq=match(p);if(fl&&!mq.length)return;const a=document.createElement('a'),pc=counts(e,p);a.href='#p-'+i+'-'+j;
   a.innerHTML=`<span class="nm">${esc(p.t.replace(/\s*\([\d.?]+ pts\)$/,''))}</span>${!pc.n?'<span class="skp" title="Out of scope for Midterm 3">skip</span>':pc.ok==pc.n?'<span class="done sm" aria-label="Complete">✓</span>':''}${(()=>{const g=p.b.flatMap(b=>b.g||[]);return g.includes('dn')?'<span class="star" data-tip="Has a Prof. DeNero pick">★</span>':g.includes('csm')?'<span class="dia" data-tip="Has a CSM tutors\' pick">◆</span>':''})()}${fl?`<span class="ct">${mq.length}</span>`:''}`;
   a.onclick=ev=>{ev.preventDefault();goTo(i,j,fl?mq[0].id:null)};lst.append(a)});d.append(lst);
  d.querySelector('summary').addEventListener('click',ev=>{ev.preventDefault();if(ev.target.closest('.tg')){toggleExam(d,e.id,!d.open);return}if(cur!=i){cur=i;if(!fl){S._open[e.id]=1;pendingOpen=e.id}render();scrollTo(0,0)}else toggleExam(d,e.id,!d.open)});
  nav.append(d);if(pendingOpen==e.id){pendingOpen=null;d.open=false;toggleExam(d,e.id,true)}});
 if(fl&&!any){const h=document.createElement('div');h.className='fhint';h.textContent=`No ${FNAME[f]} questions right now.`;nav.append(h)}ptHistNav()}
let pendingOpen=null;
function toggleExam(d,id,open){if(flt.value!='all'){S._fo=S._fo||{};S._fo[id]=open?1:0}else S._open[id]=open?1:0;save();d.querySelector('.tg').setAttribute('aria-expanded',open);const l=d.querySelector('.lst');
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!l.animate){d.open=open;return}
 l.getAnimations().forEach(a=>a.cancel());
 if(open){d.open=true;const h=l.scrollHeight;l.animate([{height:'0px',opacity:0},{height:h+'px',opacity:1}],{duration:220,easing:'cubic-bezier(.2,.8,.2,1)'})}
 else{const h=l.scrollHeight;l.animate([{height:h+'px',opacity:1},{height:'0px',opacity:0}],{duration:180,easing:'ease-in'}).onfinish=()=>{d.open=false}}}
const FNAME={todo:'unanswered',no:'incorrect',rec:'recommended',scope:'in-scope'};
const keep=(f,b,st)=>!(f=='todo'&&st||f=='no'&&(!st||st.ok)||f=='rec'&&!(b.g||[]).some(k=>k!='oos')||f=='scope'&&OOS(b));
// The main area always shows the selected exam in full; the filter only narrows the sidebar.
let evEx=null;
function render(){if(ptView)return renderPT();const e=D[cur];S._ex=cur;save();m.innerHTML='';FILLS.length=0;if(e.id!==evEx){evEx=e.id;ev('exam_open',{x:e.id})}
 const nt=document.createElement('div');nt.className='note';
 nt.innerHTML=`<b>${esc(e.t)}.</b> ${esc(e.note)} ${e.skip.length?'Staff say to skip: '+e.skip.map(x=>'<span class="ref">'+esc(x)+'</span>').join(', ')+'.':'Nothing is flagged to skip.'} <span class="mut">Out-of-scope questions don’t count toward your progress.</span>`;
 m.append(nt);
 e.p.forEach((p,j)=>{const d=document.createElement('section');d.className='prob';d.id=`p-${cur}-${j}`;d.style.scrollMarginTop='64px';
  d.innerHTML=`<h2>${esc(p.t)}</h2>`+(p.tips?`<div class="tips">${p.tips.map(t=>`<span class="tip ${t.k}">${TIPICON[t.k]} ${esc(t.t)}</span>`).join('')}</div>`:'');
  p.b.forEach(b=>{if(b.s){const t=document.createElement('div');t.className='txt';t.innerHTML=segHTML(b.s);wireFills(t);d.append(t);return}
   const w=card(b,e.id+'|'+b.id,p);w.id=`q-${cur}-${b.id}`;w.style.scrollMarginTop='72px';d.append(w)});
  m.append(d)});
 stats()}
// Jump to exam i, problem j (and optionally a question) without disturbing anything else.
function goTo(i,j,qid){if(cur!=i){cur=i;render()}else sidebar();ev('problem_open',{x:D[i].id,q:D[i].p[j].t.replace(/\s*\([\d.?]+ pts\)$/,'')});
 const el=document.getElementById(qid!=null?`q-${i}-${qid}`:`p-${i}-${j}`)||document.getElementById(`p-${i}-${j}`);
 el?.scrollIntoView({behavior:'smooth',block:'start'})}
function card(q,id,p){const wrap=document.createElement('div');wrap.className='qw';const c=document.createElement('div'),st=S[id];c.className='q'+(st?st.ok?' ok':' no':'')+(OOS(q)?' oosq':'');
 const tag={mc:'Multiple choice',sata:'Select all that apply',blank:'Fill in the blank'}[q.k];
 let h=`<div class="qh"><div class="tag">${tag}${(q.g||[]).map(k=>`<span class="badge ${k}">${TIPICON[k]} ${BADGE[k]}</span>`).join('')}</div><span class="fb" role="status" aria-live="polite"></span></div><div class="ql">${segHTML(q.l)}</div>`;
 if(q.k=='blank')h+=`<textarea rows="${q.r?q.r.length:1}" spellcheck="false" placeholder="Your answer…"></textarea>`;
 else q.o.forEach((o,i)=>h+=`<label class="o"><input type="${q.k=='mc'?'radio':'checkbox'}" name="${id}" value="${i}"><span>${esc(o)}</span></label>`);
 h+=`<div class="row"><button class="p ck">Check</button><button class="sh">Show answer</button><button class="ai" hidden data-tip="Copies a prompt about your mistake. Paste it into ChatGPT, Claude, or any AI chat."><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="3" width="8" height="4" rx="1"/><path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/></svg><span>Ask AI why</span></button><button class="rst" data-tip="Clear your answer to this question">Reset</button></div><div class="out" hidden></div><div class="ans" hidden></div>`;
 c.innerHTML=h;wireFills(c);const ta=c.querySelector('textarea'),grow=()=>{if(!ta)return;ta.style.height='auto';ta.style.height=ta.scrollHeight+2+'px'},ins=[...c.querySelectorAll('input')],fb=c.querySelector('.fb'),an=c.querySelector('.ans'),out=c.querySelector('.out');
 const showKey=()=>{an.innerHTML=`<h4>Official answer</h4><div class="k">${esc(keyText(q))}</div>`+(q.x?`<div class="x">${esc(q.x)}</div>`:'');slide(an,true)};
 const ai=c.querySelector('.ai');ai.onclick=async()=>{const s=S[id];if(!s)return;const ok=await copyText(aiPrompt(D.find(x=>id.startsWith(x.id+'|')),p,q,s.v,s.o));const lb=ai.querySelector('span');lb.textContent=ok?'Copied! Paste into an AI chat':'Couldn’t copy';ai.classList.toggle('copied',ok);setTimeout(()=>{lb.textContent='Ask AI why';ai.classList.remove('copied')},2500)};
 function show(ok,msg,o){c.className='q '+(ok?'ok':'no');ai.hidden=!!ok;fb.className='fb '+(ok?'ok':'no');
  fb.innerHTML=ok?'✓ '+esc(msg||'Correct'):'✗ Not quite'+(q.k=='blank'?' <button class="mk" data-tip="Count this as correct, e.g. if your answer works but is written differently">I was right</button>':'');
  const mk=fb.querySelector('.mk');if(mk)mk.onclick=()=>{const ex=D.find(x=>id.startsWith(x.id+'|')),c0=counts(ex);S[id].ok=true;S[id].m='Marked correct by you';save();show(true,S[id].m);out.hidden=true;stats();
    const c1=counts(ex);if(c1.ok==c1.n&&c0.ok<c0.n)ev('exam_complete',{x:ex.id})};
  out.hidden=!o;out.textContent=o||'';if(ok&&!an.hidden)slide(an,false)}
 if(st){if(ta)ta.value=st.v;else ins.forEach(x=>x.checked=q.k=='mc'?st.v===+x.value:st.v.includes(+x.value));show(st.ok,st.m,st.o);
  // A wrong answer saved by an older checker: re-check text answers now; ask before running code.
  if(!st.ok&&st.gv!==GV&&q.k=='blank'){if(!q.r)grade(q,st.v,p).then(g=>{if(g.ok){S[id]={v:st.v,ok:true,m:g.how,gv:GV};save();show(true,g.how);stats()}});
   else{fb.insertAdjacentHTML('beforeend','<span class="stale">Checker updated since you answered. Press Check again.</span>')}}}
 function get(){if(ta)return ta.value;if(q.k=='mc'){const x=ins.find(x=>x.checked);return x?+x.value:null}return ins.filter(x=>x.checked).map(x=>+x.value)}
 const ck=c.querySelector('.ck');ck.onclick=async()=>{const v=get();if(v===null||(typeof v=='string'&&!v.trim())||(Array.isArray(v)&&!v.length)){fb.className='fb no';fb.textContent='Enter an answer first';return}
  ck.disabled=true;fb.className='fb';fb.textContent=q.r&&!W?'Loading Python (first run takes a few seconds)…':q.r?'Running…':'';
  const ex=D.find(x=>id.startsWith(x.id+'|')),c0=counts(ex);
  const g=await grade(q,v,p);ck.disabled=false;S[id]={v,ok:g.ok,m:g.how,o:g.out,gv:GV};save();show(g.ok,g.how,g.out);stats();if(g.ok)confetti(ck);
  ev('check',{x:ex.id,q:id,k:q.k,ok:g.ok,run:/^Ran your code/.test(g.how||g.out||'')});const c1=counts(ex);if(c1.ok==c1.n&&c0.ok<c0.n)ev('exam_complete',{x:ex.id});
  if(!g.ok){c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake')}};
 c.addEventListener('animationend',()=>c.classList.remove('shake'));
 const sh=c.querySelector('.sh');confirmBtn(sh,()=>{showKey();ev('reveal',{x:id.split('|')[0],q:id,k:q.k})},()=>!an.hidden&&(slide(an,false),true));
 confirmBtn(c.querySelector('.rst'),()=>{delete S[id];save();(()=>{const nw=card(q,id,p);nw.id=wrap.id;nw.style.scrollMarginTop=wrap.style.scrollMarginTop;wrap.replaceWith(nw)})();stats()});
 if(ta){ta.addEventListener('input',grow);requestAnimationFrame(grow)}
 if(ta)ta.onkeydown=ev=>{if(ev.key=='Enter'&&(ev.metaKey||ev.ctrlKey))ck.click()};wrap.append(c,an);return wrap}
// Two-step button: first click asks "Are you sure?", second click within 3s acts. skip() can handle a click without asking.
// Sizes are read from computed style (CSS px), not getBoundingClientRect, so they stay right when the question area is zoomed.
// Swap a button's text (and optional style change) with a smooth width + fade animation.
// Measure the current on-screen width first (mid-animation included), then apply the change, then animate.
function swapLabel(btn,text,change){const cssW=()=>parseFloat(getComputedStyle(btn).width),w0=cssW();btn.getAnimations().forEach(a=>a.cancel());
 change&&change();btn.innerHTML=`<span class="lbl">${esc(text)}</span>`;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!btn.animate)return;
 const w1=cssW();
 if(Math.abs(w1-w0)>.5)btn.animate([{width:w0+'px'},{width:w1+'px'}],{duration:300,easing:'cubic-bezier(.25,.8,.25,1)'});
 btn.firstChild.animate([{opacity:.35},{opacity:1}],{duration:220,easing:'ease-out'})}
// Open or close a block by animating its height (plus padding, margin and borders) so content below moves smoothly.
function slide(el,open){if(matchMedia('(prefers-reduced-motion: reduce)').matches||!el.animate){el.hidden=!open;return}
 const was=el.getAnimations();was.forEach(a=>a.cancel());if(open)el.hidden=false;if(el.hidden)return;
 const cs=getComputedStyle(el),full={height:cs.height,paddingTop:cs.paddingTop,paddingBottom:cs.paddingBottom,marginTop:cs.marginTop,borderTopWidth:cs.borderTopWidth,borderBottomWidth:cs.borderBottomWidth,opacity:1},
  zero={height:'0px',paddingTop:'0px',paddingBottom:'0px',marginTop:'0px',borderTopWidth:'0px',borderBottomWidth:'0px',opacity:0};
 el.style.overflow='hidden';const a=el.animate(open?[zero,full]:[full,zero],{duration:open?240:180,easing:open?'cubic-bezier(.2,.8,.2,1)':'ease-in'});
 a.onfinish=()=>{el.style.overflow='';if(!open)el.hidden=true}}
function confirmBtn(btn,act,skip){const label=btn.textContent;let t;const disarm=()=>{clearTimeout(t);if(!btn.classList.contains('arm'))return;swapLabel(btn,label,()=>btn.classList.remove('arm'))};
 btn.onclick=()=>{if(skip&&skip())return disarm();if(btn.classList.contains('arm')){disarm();act();return}
  swapLabel(btn,label+': are you sure?',()=>btn.classList.add('arm'));t=setTimeout(disarm,3000)};btn.onblur=()=>setTimeout(()=>{if(document.activeElement!==btn)disarm()},150)}
function confetti(el){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,C=['#1f8a4c','#2a5bd7','#f2b705','#e8505b','#8e5cd9','#14b8a6'];
 for(let i=0;i<26;i++){const p=document.createElement('span');p.className='cf';p.style.left=x+'px';p.style.top=y+'px';p.style.background=C[i%C.length];document.body.append(p);
  const a=Math.random()*Math.PI*2,v=40+Math.random()*60,dx=Math.cos(a)*v,dy=Math.sin(a)*v-30;
  p.animate([{transform:'translate(-50%,-50%) rotate(0)',opacity:1},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy+70}px)) rotate(${Math.random()*540-270}deg)`,opacity:0}],{duration:700+Math.random()*300,easing:'cubic-bezier(.2,.7,.4,1)'}).onfinish=()=>p.remove()}}
function stats(){if(ptView)return;sidebar();let n=0,a=0,ok=0;[D[cur]].forEach(e=>e.p.forEach(p=>p.b.forEach(b=>{if(b.s||OOS(b))return;n++;const s=S[e.id+'|'+b.id];if(s){a++;if(s.ok)ok++}})));
 $('#pb').style.width=(100*ok/n)+'%';$('#stat').textContent=`${ok}/${n} correct · ${a} answered`}
flt.onchange=()=>{S._f=flt.value;save();const t0=m.getBoundingClientRect().top;sidebar();ddSync();const dy=m.getBoundingClientRect().top-t0;if(dy)scrollBy({top:dy,behavior:'instant'})};
// ---- custom filter dropdown (desktop / fine pointer only; touch devices keep the native picker) ----
const dd=$('#dd'),ddb=dd.querySelector('.ddb'),ddm=dd.querySelector('.ddm');let ddi=0;
const ddOpts=()=>[...flt.options];
function ddSync(){ddb.querySelector('span').textContent=flt.selectedOptions[0].text;
 ddm.innerHTML=ddOpts().map((o,i)=>`<li role="option" id="ddo${i}" data-v="${o.value}" aria-selected="${o.value==flt.value}"><span class="ck">✓</span>${esc(o.text)}</li>`).join('')}
function ddOpen(){ddSync();ddi=Math.max(0,flt.selectedIndex);ddm.hidden=false;ddb.setAttribute('aria-expanded','true');ddHi();
 requestAnimationFrame(()=>ddm.classList.add('in'))}
function ddClose(focus){ddm.classList.remove('in');ddm.hidden=true;ddb.setAttribute('aria-expanded','false');if(focus)ddb.focus()}
function ddHi(){ddm.querySelectorAll('li').forEach((li,i)=>li.classList.toggle('hi',i==ddi));ddb.setAttribute('aria-activedescendant','ddo'+ddi)}
function ddPick(v){ddClose(true);if(flt.value!==v){flt.value=v;flt.onchange()}else ddSync()}
ddb.onclick=()=>ddm.hidden?ddOpen():ddClose();
ddm.onmousedown=e=>e.preventDefault();
ddm.onclick=e=>{const li=e.target.closest('li');if(li)ddPick(li.dataset.v)};
ddm.onmousemove=e=>{const li=e.target.closest('li');if(li){ddi=[...ddm.children].indexOf(li);ddHi()}};
ddb.onkeydown=e=>{const n=ddOpts().length;
 if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();if(ddm.hidden)return ddOpen();ddi=(ddi+(e.key=='ArrowDown'?1:n-1))%n;ddHi()}
 else if((e.key=='Enter'||e.key==' ')&&!ddm.hidden){e.preventDefault();ddPick(ddOpts()[ddi].value)}
 else if(e.key=='Escape'&&!ddm.hidden){e.preventDefault();ddClose(true)}};
ddb.onblur=()=>setTimeout(()=>{if(!dd.contains(document.activeElement))ddClose()},100);
document.addEventListener('mousedown',e=>{if(!ddm.hidden&&!dd.contains(e.target))ddClose()});
ddSync();
confirmBtn($('#rs'),()=>{const e=D[cur];Object.keys(S).forEach(k=>k.startsWith(e.id+'|')&&delete S[k]);save();render()});
// Sidebar and grip stick just below the header, which grows when it wraps.
const hdr=$('header'),setHH=()=>document.documentElement.style.setProperty('--hh',hdr.offsetHeight+'px');setHH();new ResizeObserver(setHH).observe(hdr);
const grip=$('#grip'),setW=w=>{w=Math.max(200,Math.min(620,Math.round(w)));document.documentElement.style.setProperty('--sw',w+'px');S._sw=w;return w};
if(S._sw)setW(S._sw);
grip.onpointerdown=e=>{e.preventDefault();grip.setPointerCapture(e.pointerId);grip.classList.add('on');document.body.classList.add('drag');
 grip.onpointermove=ev=>{setW(ev.clientX-side.getBoundingClientRect().left);if(S._zoom=='fit')applyZoom(true)};
 grip.onpointerup=()=>{grip.onpointermove=null;grip.classList.remove('on');document.body.classList.remove('drag');save()}};
grip.ondblclick=()=>{setW(324);save();if(S._zoom=='fit')applyZoom()};
grip.onkeydown=e=>{const w=side.offsetWidth;if(e.key=='ArrowLeft'){setW(w-20);save()}if(e.key=='ArrowRight'){setW(w+20);save()}if(S._zoom=='fit')applyZoom()};
// ---- zoom for the question area: a number (0.5-2) or 'fit' ----
// Keep the content at the top of the viewport (just under the header) in the same spot across a layout change.
// placeMark() notes what is there and returns a function that scrolls it back; it can be called again after each step of an animation.
function placeMark(){const y=document.querySelector('header').getBoundingClientRect().bottom+12,r=m.getBoundingClientRect();
 const el=document.elementFromPoint(Math.max(r.left+8,Math.min(r.left+r.width/2,innerWidth-8)),y);
 const a=el&&m.contains(el)?el.closest('pre,p,h2,h3,.qw,.note,.tips,label,.row')||el:null;
 if(!a||scrollY<1)return null;
 const b=a.getBoundingClientRect(),frac=b.height?(y-b.top)/b.height:0;
 return()=>{const b2=a.getBoundingClientRect();scrollBy({top:b2.top+frac*b2.height-y,behavior:'instant'})}}
function keepPlace(change){const back=placeMark();change();if(back)back()}
// Changing the zoom re-lays out the page, which is too slow to do every frame. So the new zoom is applied once, and the
// page is then shown scaled back to how it looked and eased to its real size with a transform (about a quarter second),
// pinned at the reading point under the header. A change mid-animation starts from whatever scale is showing then,
// so quick repeated clicks stay smooth and add up.
let zShown=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zm'))||1,zAnim=null;
const setZm=z=>{zShown=z;document.documentElement.style.setProperty('--zm',z)};
function animZoom(z,instant){
 if(instant||matchMedia('(prefers-reduced-motion:reduce)').matches||!m.animate){if(zAnim){zAnim.cancel();zAnim=null}keepPlace(()=>setZm(z));return}
 let vis=zShown;if(zAnim){vis=zShown*new DOMMatrix(getComputedStyle(m).transform).a;zAnim.cancel();zAnim=null}
 const back=placeMark();setZm(z);if(back)back();
 const r=m.getBoundingClientRect(),y=back?document.querySelector('header').getBoundingClientRect().bottom+12:r.top;
 m.style.transformOrigin=`50% ${Math.max(0,(y-r.top)/r.height*100)}%`;
 zAnim=m.animate([{transform:`scale(${vis/z})`},{transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'});
 zAnim.onfinish=()=>{zAnim=null}}
function applyZoom(instant){let z=S._zoom??1;const fit=z=='fit';
 if(fit){const sw=matchMedia('(max-width:760px)').matches?0:side.offsetWidth+grip.offsetWidth;z=Math.max(.7,Math.min(2,(innerWidth-sw)/900))}
 z=Math.round(z*100)/100;if(z!==zShown)animZoom(z,instant);else setZm(z);
 if(document.activeElement!==$('#zv'))$('#zv').value=Math.round(z*100)+'%';$('#zf').classList.toggle('on',fit);$('#zf').setAttribute('aria-pressed',fit);return z}
const zoomBy=d=>{const z=applyZoom();S._zoom=Math.max(.5,Math.min(2,Math.round((z+d)*10)/10));save();applyZoom()};
$('#zo').onclick=()=>zoomBy(-.1);$('#zi').onclick=()=>zoomBy(.1);
const zv=$('#zv');
const zoomTo=()=>{const n=parseFloat(zv.value);if(isFinite(n)){S._zoom=Math.max(50,Math.min(200,Math.round(n)))/100;save()}zv.blur();applyZoom()};
zv.onfocus=()=>{zv.value=zv.value.replace('%','');zv.select()};
zv.onkeydown=e=>{if(e.key=='Enter')zoomTo();if(e.key=='Escape'){zv.blur();applyZoom()}};
zv.onblur=()=>{const typed=zv.value.replace('%','').trim(),shown=String(Math.round(zShown*100));if(typed!==shown)zoomTo();else zv.value=shown+'%'};
$('#zf').onclick=()=>{S._zoom=S._zoom=='fit'?1:'fit';save();applyZoom()};
addEventListener('resize',()=>{if(S._zoom=='fit')applyZoom(true)});
render();applyZoom(true);applyHL();
// ---- tooltips: any element with data-tip gets a small bubble after a short hover (mouse) or on keyboard focus ----
const tipEl=document.createElement('div');tipEl.className='tipbox';tipEl.setAttribute('role','tooltip');tipEl.hidden=true;document.body.append(tipEl);
let tipT=null,tipFor=null;
function tipShow(el){const t=el.dataset.tip;if(!t)return;tipFor=el;tipEl.textContent=t;tipEl.hidden=false;tipEl.classList.remove('in');
 const r=el.getBoundingClientRect(),w=tipEl.offsetWidth,h=tipEl.offsetHeight;let x=r.left+r.width/2-w/2,y=r.bottom+8;
 if(y+h>innerHeight-6)y=r.top-h-8;x=Math.max(6,Math.min(innerWidth-w-6,x));tipEl.style.left=x+'px';tipEl.style.top=y+'px';
 requestAnimationFrame(()=>tipEl.classList.add('in'))}
function tipHide(){clearTimeout(tipT);tipT=null;tipFor=null;tipEl.hidden=true;tipEl.classList.remove('in')}
document.addEventListener('pointerover',e=>{if(e.pointerType=='touch')return;const el=e.target.closest('[data-tip]');if(el===tipFor)return;tipHide();if(el)tipT=setTimeout(()=>tipShow(el),400)});
document.addEventListener('pointerout',e=>{const el=e.target.closest('[data-tip]');if(el&&!el.contains(e.relatedTarget))tipHide()});
document.addEventListener('pointerdown',tipHide,true);document.addEventListener('scroll',tipHide,true);
document.addEventListener('focusin',e=>{const el=e.target.closest('[data-tip]');if(el&&el.matches(':focus-visible'))tipShow(el)});document.addEventListener('focusout',tipHide);


// ---- countdown timer: preset or custom duration, survives reloads (the end time is stored, not the ticks) ----
{const tmb=$('#tmb'),tmp=$('#tmp'),tmv=$('#tmv'),tmr=$('#tmr'),tmi=$('#tmi'),tmh=$('#tmh'),go=$('#tmgo'),snd=$('#tmsnd'),HINT=tmh.textContent;
 const T=S._tm=Object.assign({dur:0,left:0,end:0,up:false,snd:true},S._tm),PRE=[5,10,15,25,30,50,80,120],title=document.title;let iv=null,ht=null;
 $('#tmps').innerHTML=PRE.map(n=>`<button type="button" data-m="${n}">${n<60?n+'m':n%60?Math.floor(n/60)+'h '+n%60+'m':n/60+'h'}</button>`).join('');
 const left=()=>T.end?Math.max(0,T.end-Date.now()):T.left;
 const fmt=ms=>{const t=Math.ceil(ms/1e3),h=Math.floor(t/3600),mm=String(Math.floor(t/60)%60).padStart(2,'0'),ss=String(t%60).padStart(2,'0');return h?`${h}:${mm}:${ss}`:`${mm}:${ss}`};
 // "45" = minutes, "5:30" = mm:ss, "1:30:00" = h:mm:ss, or units like "1h 20m", "90s"
 function parse(s){s=s.trim().toLowerCase();if(!s)return NaN;
  if(/^\d+(\.\d+)?$/.test(s))return parseFloat(s)*6e4;
  if(/^\d+(:\d{1,2}){1,2}$/.test(s)){const p=s.split(':').map(Number);if(p.slice(1).some(x=>x>59))return NaN;return(p.length==3?p[0]*3600+p[1]*60+p[2]:p[0]*60+p[1])*1e3}
  const r=/^(?:(\d+(?:\.\d+)?)\s*h(?:ours?|rs?)?)?\s*(?:(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?)?\s*(?:(\d+)\s*s(?:ec(?:ond)?s?)?)?$/.exec(s);
  return r&&(r[1]||r[2]||r[3])?((+r[1]||0)*3600+(+r[2]||0)*60+(+r[3]||0))*1e3:NaN}
 function chime(){if(!T.snd)return;try{const a=new(window.AudioContext||window.webkitAudioContext)();[0,.35,.7].forEach(t=>{const o=a.createOscillator(),g=a.createGain();o.frequency.value=880;o.connect(g);g.connect(a.destination);
  g.gain.setValueAtTime(0,a.currentTime+t);g.gain.linearRampToValueAtTime(.25,a.currentTime+t+.02);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+t+.3);o.start(a.currentTime+t);o.stop(a.currentTime+t+.32)});setTimeout(()=>a.close(),1500)}catch(e){}}
 function draw(){const l=left(),run=!!T.end,low=(run||l<T.dur)&&l>0&&l<=6e4;
  tmr.textContent=T.up?"Time's up":fmt(l);tmr.className='tmr'+(T.up?' up':low?' low':'');
  tmv.textContent=T.up?"Time's up":run||(l>0&&l<T.dur)?fmt(l):'';tmb.className=T.up?'up':low?'low':run?'run':'';
  go.textContent=run?'Pause':T.up||l==T.dur?'Start':'Resume';go.disabled=!T.dur;$('#tmrs').disabled=!T.dur||(!run&&!T.up&&l==T.dur);$('#tmadd').disabled=!T.dur;
  tmb.setAttribute('aria-label','Countdown timer'+(T.dur?', '+(T.up?'time is up':fmt(l)+(run?' left':' paused')):''));
  document.querySelectorAll('#tmps button').forEach(b=>b.classList.toggle('on',b.dataset.m*6e4==T.dur));
  document.title=run||T.up?`${T.up?"Time's up":fmt(l)} · ${title}`:title}
 function tick(){if(T.end&&left()<=0){T.end=0;T.left=0;T.up=true;save();stop();chime()}draw()}
 const stop=()=>{clearInterval(iv);iv=null},loop=()=>{stop();iv=setInterval(tick,250)};
 function set(ms){stop();Object.assign(T,{dur:ms,left:ms,end:0,up:false});save();draw()}
 function start(){if(!T.dur)return;if(T.up||!T.left)T.left=T.dur;T.up=false;T.end=Date.now()+T.left;save();loop();draw()}
 function pause(){T.left=left();T.end=0;save();stop();draw()}
 // open: unhide, then add .in next frame so the fade/scale transition runs; close: drop .in, hide once it has faded out
 function open(){clearTimeout(ht);if(T.up){T.up=false;T.left=T.dur;save();draw()}tmp.hidden=false;tmp.offsetWidth;tmp.classList.add('in');tmb.setAttribute('aria-expanded',true);
  // Focusing the text field on a touch screen pops up the keyboard over the presets, so only do it with a mouse.
  if(T.dur)go.focus();else if(matchMedia('(hover:hover) and (pointer:fine)').matches)tmi.focus()}
 function close(f){if(tmp.hidden)return;tmp.classList.remove('in');tmb.setAttribute('aria-expanded',false);clearTimeout(ht);ht=setTimeout(()=>tmp.hidden=true,170);if(f)tmb.focus()}
 tmb.onclick=()=>tmp.classList.contains('in')?close():open();
 document.addEventListener('mousedown',e=>{if(!tmp.hidden&&!$('#tm').contains(e.target))close()});
 tmp.onkeydown=e=>{if(e.key=='Escape'){e.preventDefault();close(true)}};
 $('#tmps').onclick=e=>{const b=e.target.closest('button');if(b){set(b.dataset.m*6e4);tmi.value='';go.focus()}};
 const custom=()=>{const ms=parse(tmi.value),ok=ms>=1e3&&ms<=864e5;tmi.classList.toggle('bad',!ok);tmh.classList.toggle('bad',!ok);
  tmh.textContent=ok?HINT:!tmi.value.trim()?'Type a time first':ms>864e5?'Up to 24 hours':"Didn't understand that. Try 45, 5:30 or 1h 20m";if(ok){set(Math.round(ms/1e3)*1e3);go.focus()}};
 $('#tmset').onclick=custom;tmi.onkeydown=e=>{if(e.key=='Enter'){e.preventDefault();custom()}};
 tmi.oninput=()=>{if(tmi.classList.contains('bad')){tmi.classList.remove('bad');tmh.classList.remove('bad');tmh.textContent=HINT}};
 go.onclick=()=>T.end?pause():start();
 $('#tmrs').onclick=()=>set(T.dur);
 $('#tmadd').onclick=()=>{if(T.up){T.dur=Math.max(T.dur,6e4);T.left=6e4;T.up=false;T.end=Date.now()+6e4;loop()}else if(T.end)T.end+=6e4;else T.left+=6e4;if(left()>T.dur)T.dur=left();save();draw()};
 snd.checked=T.snd;snd.onchange=()=>{T.snd=snd.checked;save()};
 if(T.end){if(left()>0)loop();else{T.end=0;T.left=0;T.up=true;save()}}draw()}

// ---- timed practice exam: modified versions of the recommended problems (PT), drawn at random, graded only on submit ----
const PTM=Object.fromEntries(PT.map(p=>[p.id,p])),PTLEN={50:4,110:8},PTNAME={50:'50 minutes',110:'1 hour 50 minutes'},PTCLOCK={50:'50:00',110:'1:50:00'};
var ptView=false;let ptBusy=false;
var ptHist=null; // d (submit time) of a past attempt being reviewed, or null for the current exam
function ptX(){return ptHist!=null?(S._pth||[]).find(h=>h.d===ptHist&&h.ids):S._pt}
const ptb=$('#ptb'),PTICON=SV('<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>'),BACKICON=SV('<path d="M19 12H5M12 19l-7-7 7-7"/>');
const fmtT=ms=>{const t=Math.ceil(ms/1e3),h=Math.floor(t/3600),mm=String(Math.floor(t/60)%60).padStart(2,'0'),ss=String(t%60).padStart(2,'0');return h?`${h}:${mm}:${ss}`:`${mm}:${ss}`};
const ptQs=X=>X.ids.flatMap((id,pi)=>PTM[id].b.filter(b=>b.k).map(q=>({p:PTM[id],pi,q,key:pi+'|'+q.id})));
const blankAns=v=>v==null||(typeof v=='string'&&!v.trim())||(Array.isArray(v)&&!v.length);
const QPER=PT.reduce((n,p)=>n+p.b.filter(b=>b.k).length,0)/PT.length;
// Least-used problems first (ties broken at random), so retakes rotate through the whole pool.
function ptPick(n){const seen=S._ptseen||{},ids=PT.map(p=>p.id);
 for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}
 return ids.sort((a,b)=>(seen[a]||0)-(seen[b]||0)).slice(0,n).sort(()=>Math.random()-.5)}
function ptStart(min){const ids=ptPick(PTLEN[min]),now=Date.now();S._ptseen=S._ptseen||{};ids.forEach(id=>S._ptseen[id]=(S._ptseen[id]||0)+1);
 S._pt={min,ids,start:now,end:now+min*6e4,ans:{}};save();ev('pt_start',{x:'pt'+min,q:ids.join(',')});renderPT();scrollTo(0,0);ptTick()}
function showPT(on){ptView=on;if(!on)ptHist=null;S._view=on?'pt':'';save();document.body.classList.toggle('ptm',on);if(on)renderPT();else render();scrollTo(0,0);ptTick()}
ptb.onclick=()=>showPT(!ptView);

function renderPT(){if(ptHist!=null&&!ptX())ptHist=null;const X=ptX();m.innerHTML='';nav.innerHTML='';FILLS.length=0;if(!X)return ptHome();
 const rev=!!X.done,all=ptQs(X),nt=document.createElement('div');nt.className='note';
 if(rev){const ok=all.filter(k=>X.res[k.key].ok).length,used=X.sub-X.start;
  nt.innerHTML=(ptHist!=null?`<b>Attempt from ${esc(ptDate(X.d))}.</b> `:'')+(X.lost?'Your answers to this attempt weren’t saved, so only the questions and official answers are shown. ':'')+`<b>Score: ${ok}/${all.length} questions (${Math.round(100*ok/all.length)}%).</b> ${X.sub>=X.end-500?'Time ran out, so the exam submitted itself.':`Submitted after ${fmtT(used)} of ${PTCLOCK[X.min]}.`} <span class="mut">Each problem is a modified version of a recommended past exam problem; its source is shown under the title.</span>`}
 else nt.innerHTML=`<b>Practice exam · ${PTNAME[X.min]}.</b> ${X.ids.length} problems, ${all.length} questions. Your answers save as you type. Nothing is checked until you submit, and the exam submits itself when time runs out.`;
 m.append(nt);
 X.ids.forEach((id,pi)=>{const p=PTM[id],d=document.createElement('section');d.className='prob';d.id='pt-'+pi;d.style.scrollMarginTop='64px';
  d.innerHTML=`<h2>${pi+1}. ${esc(p.t)}</h2>`+(rev?`<div class="tips"><span class="tip oos">Based on ${esc(p.src)}</span></div>`:'');
  p.b.forEach(b=>{if(b.s){const t=document.createElement('div');t.className='txt';
    // Hide the "Show all answers" fills until the exam is over.
    t.innerHTML=segHTML(rev?b.s:b.s.map(g=>g.f?{...g,f:null}:g));if(rev)wireFills(t);d.append(t);return}
   d.append(ptCard(b,pi+'|'+b.id,p,rev,X))});
  m.append(d)});
 const end=document.createElement('div');end.className='ptend';
 end.innerHTML=ptHist!=null?'<button class="p" data-act="home">'+(S._pt&&!S._pt.done?'Back to your exam':'Practice exam home')+'</button><button data-act="back">Back to practice questions</button>':rev?'<button class="p" data-act="new">Take another exam</button><button data-act="back">Back to practice questions</button>':'<button class="p" data-act="submit">Submit exam</button>';
 m.append(end);ptSide();ptWire(document);ptTick()}

function ptCard(q,key,p,rev,X){const w=document.createElement('div'),c=document.createElement('div'),v=X.ans[key],r=rev?X.res[key]:null,busy=!!X.grading;
 w.className='qw';w.id='ptq-'+key.replace('|','-');c.className='q'+(r&&!X.lost?r.ok?' ok':' no':'');
 const tag={mc:'Multiple choice',sata:'Select all that apply',blank:'Fill in the blank'}[q.k],dis=rev||busy?' disabled':'';
 let h=`<div class="qh"><div class="tag">${tag}</div><span class="fb" role="status"></span></div><div class="ql">${segHTML(q.l)}</div>`;
 if(q.k=='blank')h+=`<textarea rows="1" spellcheck="false" placeholder="${rev?X.lost?'(not saved)':'(no answer)':'Your answer…'}"${dis}></textarea>`;
 else q.o.forEach((o,i)=>{const right=rev&&(q.k=='mc'?q.a===i:q.a.includes(i)),picked=v!=null&&(q.k=='mc'?v===i:v.includes(i));
  h+=`<label class="o${right?' right':rev&&picked?' wrong':''}"><input type="${q.k=='mc'?'radio':'checkbox'}" name="pt-${key}" value="${i}"${dis}><span>${esc(o)}</span></label>`});
 if(r&&!r.ok&&!r.none)h+=`<div class="row"><button class="ai" data-tip="Copies a prompt about your mistake. Paste it into ChatGPT, Claude, or any AI chat."><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="3" width="8" height="4" rx="1"/><path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/></svg><span>Ask AI why</span></button></div><div class="out"></div>`;
 c.innerHTML=h;
 const ta=c.querySelector('textarea'),ins=[...c.querySelectorAll('input')],grow=()=>{if(!ta)return;ta.style.height='auto';ta.style.height=ta.scrollHeight+2+'px'};
 if(ta){ta.value=v||'';ta.addEventListener('input',grow);requestAnimationFrame(grow)}else if(v!=null)ins.forEach(x=>x.checked=q.k=='mc'?v===+x.value:v.includes(+x.value));
 if(!rev){if(ta)ta.oninput=()=>{X.ans[key]=ta.value;save();ptCounts()};
  ins.forEach(x=>x.onchange=()=>{X.ans[key]=q.k=='mc'?+x.value:ins.filter(y=>y.checked).map(y=>+y.value);save();ptCounts()})}
 w.append(c);
 if(r){const fb=c.querySelector('.fb');fb.className='fb '+(X.lost?'':r.ok?'ok':'no');
  fb.innerHTML=r.ok?'✓ '+esc(r.m||'Correct'):X.lost?'Your answer wasn’t saved':r.none?'✗ Not answered':'✗ Not quite'+(q.k=='blank'?' <button class="mk" data-tip="Count this as correct, e.g. if your answer works but is written differently">I was right</button>':'');
  const mk=fb.querySelector('.mk');if(mk)mk.onclick=()=>{r.ok=true;r.m='Marked correct by you';const hs=(S._pth||[]).find(x=>x.d==X.sub);if(hs){hs.ok++;if(hs!==X&&hs.res&&hs.res[key])Object.assign(hs.res[key],{ok:true,m:r.m})}save();const y=scrollY;renderPT();scrollTo(0,y)};
  const out=c.querySelector('.out');if(out){out.hidden=!r.o;out.textContent=r.o||''}
  const ai=c.querySelector('.ai');if(ai)ai.onclick=async()=>{const ok=await copyText(aiPrompt({t:'Timed practice exam'},p,q,v,r.o));const lb=ai.querySelector('span');lb.textContent=ok?'Copied! Paste into an AI chat':'Couldn’t copy';ai.classList.toggle('copied',ok);setTimeout(()=>{lb.textContent='Ask AI why';ai.classList.remove('copied')},2500)};
  const an=document.createElement('div');an.className='ans';an.innerHTML=`<h4>Official answer</h4><div class="k">${esc(keyText(q))}</div>`+(q.x?`<div class="x">${esc(q.x)}</div>`:'');w.append(an)}
 return w}

function ptSide(){const X=ptX(),rev=!!X.done,all=ptQs(X),s=document.createElement('div');s.className='ptside';
 let h=rev?`<div class="ptscore">${all.filter(k=>X.res[k.key].ok).length}/${all.length}</div><div class="ptsub mut">questions correct</div>`
  :`<div class="ptclock" id="ptclock">${fmtT(Math.max(0,X.end-Date.now()))}</div><div class="ptsub mut" id="ptleft">left of ${PTCLOCK[X.min]}</div>`;
 X.ids.forEach((id,pi)=>{const n=all.filter(k=>k.pi==pi).length;h+=`<a href="#pt-${pi}" data-pi="${pi}"><span class="nm">${pi+1}. ${esc(PTM[id].t.replace(/\s*\(\d+ pts\)$/,''))}</span><span class="ct" id="ptc-${pi}"></span></a>`});
 h+=`<div class="ptbtns">${ptHist!=null?'<button class="p" data-act="home">'+(S._pt&&!S._pt.done?'Back to your exam':'Practice exam home')+'</button><button data-act="back">Back to practice questions</button>':rev?'<button class="p" data-act="new">Take another exam</button><button data-act="back">Back to practice questions</button>':'<button class="p" data-act="submit">Submit exam</button><button data-act="quit" data-tip="Throw away this attempt">Quit exam</button>'}</div>`;
 s.innerHTML=h;nav.append(s);
 s.querySelectorAll('a').forEach(a=>a.onclick=e=>{e.preventDefault();document.getElementById('pt-'+a.dataset.pi)?.scrollIntoView({behavior:'smooth',block:'start'})});
 ptCounts()}
// Sidebar counts: answered/total while taking the exam, correct/total in review.
function ptCounts(){const X=ptX();if(!X)return;const all=ptQs(X);X.ids.forEach((_,pi)=>{const el=$('#ptc-'+pi);if(!el)return;const qs=all.filter(k=>k.pi==pi);
 const n=X.done?qs.filter(k=>X.res[k.key].ok).length:qs.filter(k=>!blankAns(X.ans[k.key])).length;
 el.innerHTML=X.done&&n==qs.length?'<span class="done sm" aria-label="All correct">✓</span>':`${n}/${qs.length}`;el.title=X.done?'correct':'answered'})}
function ptWire(root){root.querySelectorAll('[data-act]').forEach(b=>{if(b._w)return;b._w=1;const a=b.dataset.act;
 if(a=='submit')confirmBtn(b,()=>ptSubmit());
 else if(a=='quit')confirmBtn(b,()=>{S._pt=null;save();renderPT();scrollTo(0,0);ptTick()});
 else if(a=='new')b.onclick=()=>{S._pt=null;save();renderPT();scrollTo(0,0);ptTick()};
 else if(a=='back')b.onclick=()=>showPT(false);
 else if(a=='home')b.onclick=()=>{ptHist=null;if(S._pt&&S._pt.done){S._pt=null;save()}renderPT();scrollTo(0,0);ptTick()}})}

function ptHome(){const sel=S._ptlen||50,H=S._pth||[],q=n=>Math.round(QPER*n/5)*5;
 m.innerHTML=`<section class="prob pthome"><h2>Timed practice exam</h2>
<p>Each exam draws problems at random from modified versions of every problem the course staff recommend for Midterm 3 practice. Names, numbers, and requirements are changed, so you have to work out each answer rather than remember it.</p>
<div class="ptopts" role="radiogroup" aria-label="Exam length">${[50,110].map(n=>`<button type="button" class="ptopt" role="radio" aria-checked="${n==sel}" data-min="${n}"><b>${PTNAME[n]}</b><span>${PTLEN[n]} problems · about ${q(PTLEN[n])} questions</span></button>`).join('')}</div>
<ul class="ptrules"><li>The clock starts when you press Start exam.</li><li>Nothing is checked until you submit. Then you get your score and every official answer with explanations.</li><li>When time runs out, the exam submits itself.</li><li>Answers are saved in this browser, so reloading the page won't lose them.</li></ul>
<button class="p" id="ptgo">Start exam</button>
${H.length?`<h3>Past attempts</h3><table class="pth"><thead><tr><th>Date</th><th>Length</th><th>Score</th><th>Time used</th></tr></thead><tbody>${H.map(x=>`<tr><td>${x.ids?`<a href="#" class="pthl" data-d="${x.d}">${esc(ptDate(x.d))}</a>`:esc(ptDate(x.d))}</td><td>${PTCLOCK[x.min]}</td><td>${x.ok}/${x.n} (${Math.round(100*x.ok/x.n)}%)</td><td>${fmtT(x.used)}</td></tr>`).join('')}</tbody></table>`:''}
</section>`;
 nav.innerHTML='<div class="ptside"><div class="fhint">Pick a length, then press Start exam. Use the button in the top left to go back to the practice questions.</div></div>';
 const opts=[...m.querySelectorAll('.ptopt')];
 opts.forEach(o=>o.onclick=()=>{S._ptlen=+o.dataset.min;save();opts.forEach(x=>x.setAttribute('aria-checked',x===o))});
 $('#ptgo').onclick=()=>ptStart(S._ptlen||50);
 m.querySelectorAll('.pthl').forEach(a=>a.onclick=e=>{e.preventDefault();ptOpen(+a.dataset.d)})}
// Function declarations only below: ptHistNav runs from sidebar() during the first render, before the consts above exist.
function ptDate(d){return new Date(d).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}
function ptOpen(d){ptHist=d;ptView=true;S._view='pt';save();document.body.classList.add('ptm');renderPT();scrollTo(0,0);ptTick()}
function ptHistNav(){const H=S._pth||[];if(!H.length)return;const box=document.createElement('div');box.className='hist';
 box.innerHTML='<div class="histh">Practice exam history</div>'+H.map(x=>{const lab=`<span class="nm">${esc(ptDate(x.d))} · ${x.min==50?'50 min':'1 h 50 min'}</span><span class="ct">${x.ok}/${x.n}</span>`;
  return x.ids?`<a href="#" data-d="${x.d}" data-tip="Review this attempt">${lab}</a>`:`<div class="old" data-tip="Only the score was saved for this attempt">${lab}</div>`}).join('');
 box.querySelectorAll('a').forEach(a=>a.onclick=e=>{e.preventDefault();ptOpen(+a.dataset.d)});nav.append(box)}

async function ptSubmit(){const X=S._pt;if(!X||X.done||ptBusy)return;ptBusy=true;X.grading=1;X.sub=X.sub||Math.min(Date.now(),X.end);save();
 if(ptView){const y=scrollY;renderPT();scrollTo(0,y)}ptTick();
 const all=ptQs(X),res={};let i=0;
 for(const {p,q,key} of all){const v=X.ans[key],c=$('#ptclock');i++;
  if(c){c.classList.add('busy');c.textContent=q.r&&!W&&!blankAns(v)?'Loading Python…':`Grading ${i}/${all.length}`}
  if(blankAns(v)){res[key]={ok:false,none:1};continue}
  try{const g=await grade(q,v,p);res[key]={ok:g.ok,m:g.how,o:g.out}}catch(e){res[key]={ok:false,o:String(e)}}}
 const ok=all.filter(k=>res[k.key].ok).length;
 X.res=res;X.done=1;delete X.grading;ptBusy=false;
 ev('pt_submit',{x:'pt'+X.min,q:X.ids.join(','),v:X.sub>=X.end-500?'timeout':'manual',ok:ok,tot:all.length,sec:Math.round((X.sub-X.start)/1e3)});
 const kept=Object.fromEntries(Object.entries(res).map(([k,v])=>[k,v.o?{...v,o:v.o.slice(0,600)}:v]));
 S._pth=[{d:X.sub,min:X.min,ok,n:all.length,used:X.sub-X.start,ids:X.ids,ans:X.ans,res:kept,start:X.start,end:X.end,sub:X.sub,done:1},...(S._pth||[])].slice(0,20);save();
 if(ptView){renderPT();scrollTo(0,0)}ptTick()}

// Runs twice a second: exam clock, the header button's label, and the automatic submit when time is up.
function ptTick(){const X=S._pt,live=!!X&&!X.done&&!X.grading,left=live?Math.max(0,X.end-Date.now()):0;
 if(live&&left<=0){ptSubmit();return}
 const c=$('#ptclock');if(c&&live){c.textContent=fmtT(left);c.classList.toggle('low',left<=5*6e4)}
 const label=ptView?'Practice questions':live?'Exam · '+fmtT(left):X&&X.grading?'Grading exam…':'Practice exam',cls=!ptView&&(live||X&&X.grading)?'run':'';
 if(ptb.dataset.l!==label){ptb.dataset.l=label;ptb.innerHTML=(ptView?BACKICON:PTICON)+`<span>${esc(label)}</span>`;
  ptb.dataset.tip=ptView?'Back to the past-exam practice questions':live?'Return to your practice exam':'Take a timed practice exam made from modified recommended problems';ptb.setAttribute('aria-label',label)}
 ptb.className=cls}
if(S._view=='pt')showPT(true);
setInterval(ptTick,500);ptTick();
if(S._pt&&S._pt.grading&&!S._pt.done){delete S._pt.grading;ptSubmit()}
