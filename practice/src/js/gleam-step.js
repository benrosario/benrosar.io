// Stepping through Gleam (the playground's Step), shared by the browser worker (gleam-worker.js) and the Node tests.
// The compiler has no source maps, so the student's source gets probes before it's compiled:
//   instrument(source)  puts `playground_step(L) ` before each statement in a block and wraps each case arm's body as
//                       `{ playground_step(L) … }`, never adding or removing a line, so compile errors and panics keep
//                       their line numbers. The probe is an external function declared at the end of the module.
//   rewrite(js, lines)  then edits the compiled JavaScript (parsed with acorn): each probe also gets the names in
//                       scope, and each function of the student's records its call, its return value and its end.
//   recorder(...)       collects the steps while the module runs, in the trace format run.py's trace_program uses
//                       ({l, ev, st: [{fn, id, l, vars, ret?, loop?}], o, exc?}), except there is no global frame.
import { parse } from 'acorn';

export const PROBE = 'playground_step';
const HOOK = '__gleamStep';

// ---- the source: tokens ----
const OPS = ['<<', '>>', '->', '<-', '|>', '<>', '..', '==', '!=', '<=.', '>=.', '<=', '>=', '<.', '>.', '+.', '-.', '*.', '/.', '&&', '||', '#('];
function tokens(src) {
  const out = []; let i = 0, line = 1;
  while (i < src.length) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (/\s/.test(c)) { i++; continue; }
    const start = i, l0 = line;
    if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; } // comments don't count
    if (c === '"') {
      for (i++; i < src.length && src[i] !== '"'; i++) { if (src[i] === '\\') i++; if (src[i] === '\n') line++; }
      i++; out.push({ t: '"', start, end: i, line: l0, last: line }); continue;
    }
    if (/[A-Za-z_]/.test(c)) { while (i < src.length && /\w/.test(src[i])) i++; }
    else if (/\d/.test(c)) { while (i < src.length && /[\w.]/.test(src[i])) i++; }
    else i += (OPS.find(o => src.startsWith(o, i)) || c).length;
    out.push({ t: src.slice(start, i), start, end: i, line: l0, last: line });
  }
  return out;
}
// A token ending a line that the next line continues, and a token starting a line that continues the one before.
const ENDS = new Set(['=', '->', '<-', ',', '(', '[', '{', '#(', '<<', ':', '.', '|', '|>', '<>', '+', '-', '*', '/', '%', '+.', '-.', '*.', '/.',
  '==', '!=', '<', '>', '<=', '>=', '<.', '>.', '<=.', '>=.', '&&', '||', '..', 'let', 'assert', 'use', 'case', 'as', 'if', 'fn', 'pub', 'const', '@']);
const STARTS = new Set(['|>', '<>', '+', '-', '*', '/', '%', '+.', '-.', '*.', '/.', '==', '!=', '<', '>', '<=', '>=', '<.', '>.', '<=.', '>=.',
  '&&', '||', '..', '.', '|', ')', ']', '}', '>>', '->', 'as', '=', '<-', ':', ',']);
const OPEN = { '(': ')', '[': ']', '#(': ')', '<<': '>>', '{': '}' };

// The source with probes, or null when it can't be read (the compiler then says what's wrong). lines: each top-level
// function's name → the line it starts on.
export function instrument(src) {
  const ts = tokens(src), ins = [], lines = {};
  const stack = []; // {close, kind: 'block' | 'case' | 'other' | 'list', first, state, wrapped}
  let item = '', pendingCase = -1, prev = null;
  const probe = (at, l, text = '') => ins.push([at, `${text}${PROBE}(${l}) `]);
  for (let k = 0; k < ts.length; k++) {
    const t = ts[k], top = stack.at(-1), fresh = prev && t.line > prev.last && !ENDS.has(prev.t) && !STARTS.has(t.t);
    if (!stack.length) {
      if (['fn', 'type', 'import', 'const'].includes(t.t) && prev?.t !== '.') { item = t.t; if (t.t === 'fn' && /^[a-z]/.test(ts[k + 1]?.t || '')) lines[ts[k + 1].t] = t.line; }
    } else if (top.kind === 'block' && t.t !== '}' && (top.first || fresh)) { top.first = false; probe(t.start, t.line); }
    else if (top.kind === 'case') {
      if (top.state === 'body' && fresh && t.t !== '}') { if (top.wrapped) ins.push([prev.end, ' }']); top.wrapped = false; top.state = 'pattern'; }
      else if (top.state === 'arrow') { top.state = 'body'; if (t.t !== '{') { probe(t.start, t.line, '{ '); top.wrapped = true; } }
      if (top.state === 'pattern' && t.t === '->') top.state = 'arrow';
    }
    if (t.t === 'case') pendingCase = stack.length;
    if (OPEN[t.t]) {
      let kind = 'list';
      if (t.t === '{') kind = pendingCase === stack.length ? 'case' : !stack.length && item !== 'fn' || prev?.t === '.' ? 'other' : 'block';
      if (kind === 'case') pendingCase = -1;
      stack.push({ close: OPEN[t.t], kind, first: true, state: 'pattern' });
    } else if (top && t.t === top.close) {
      if (top.kind === 'case' && top.wrapped) ins.push([prev.end, ' }']);
      stack.pop();
    } else if (top && [')', ']', '}', '>>'].includes(t.t)) return null; // brackets that don't match
    prev = t;
  }
  if (stack.length) return null;
  let out = src;
  for (const [at, text] of ins.sort((a, b) => b[0] - a[0])) out = out.slice(0, at) + text + out.slice(at);
  return { source: out + `\n@external(javascript, "./__step.mjs", "probe")\nfn ${PROBE}(line: Int) -> Nil\n`, lines };
}

// ---- the compiled JavaScript ----
// The name a JavaScript binding has in Gleam: x for x and x$1 (shadowed) and class$ (a reserved word), n for loop$n
// (a self-recursive function's argument), none for the compiler's own (_pipe, $, _block, …).
const gleamName = n => /^[a-z][A-Za-z0-9_]*\$[a-z]/.test(n) ? n.split('$').pop() : /^[a-z][A-Za-z0-9_]*(\$\d*)?$/.test(n) ? n.replace(/\$\d*$/, '') : null;

export function rewrite(js, lines = {}) {
  const ast = parse(js, { ecmaVersion: 'latest', sourceType: 'module', preserveParens: true });
  const ins = []; let seq = 0;
  // An insertion of text at pos; one made for frame f is dropped if f turns out not to be a frame.
  const put = (pos, text, f) => { const x = { pos, seq: seq++, text, f }; ins.push(x); return x; };
  const H = `globalThis.${HOOK}`;
  // The names in scope at a probe, from its frame's own scopes (an anonymous function's frame shows its own names,
  // not those of the function it's in): the Gleam name and the JavaScript expression.
  function visible(scopes) {
    let i = scopes.length - 1; while (i > 0 && !scopes[i].frame) i--;
    const seen = new Map();
    for (const s of scopes.slice(i)) for (const n of s.names) { const g = gleamName(n); if (g) { seen.delete(g); seen.set(g, n); } }
    return [...seen].map(([g, n]) => `[${JSON.stringify(g)}, ${n}]`).join(', ');
  }
  // scopes: [{names, frame?, fn}], outermost first. fn is the function the scope is in ({frame} or {frame: null}).
  function walk(node, scopes, parent) {
    if (!node || typeof node.type != 'string') return;
    if (/Function/.test(node.type)) return func(node, scopes, parent);
    if (node.type === 'ImportDeclaration' && node.source.value === './__step.mjs') { put(node.start, '/* '); put(node.end, ` */ const ${PROBE} = (l, vs) => ${H}.probe(l, vs);`); return; }
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === PROBE && node.arguments.length === 1) {
      const f = scopes.findLast(s => s.frame)?.frame; if (f) f.line ??= node.arguments[0].value;
      put(node.arguments[0].end, `, [${visible(scopes)}]`); return;
    }
    if (node.type === 'CallExpression' && node.callee.type === 'ParenthesizedExpression') node.callee.iife = true;
    const f = scopes.at(-1)?.fn.frame;
    if (node.type === 'ReturnStatement' && f) {
      const a = node.argument;
      put(a ? a.start : node.start + 6, ` ${H}.ret($sf, `, f); walk(a, scopes, node); put(a ? a.end : node.start + 6, a ? ')' : ' undefined)', f); return;
    }
    const inner = node.type === 'BlockStatement' || node.type === 'Program' ? [...scopes, { names: [], fn: scopes.at(-1)?.fn || { frame: null } }] : scopes;
    for (const key in node) {
      if (key === 'type' || key === 'start' || key === 'end') continue;
      const v = node[key];
      if (Array.isArray(v)) for (const c of v) { walk(c, inner, node); if (c?.type === 'VariableDeclaration') inner.at(-1).names.push(...c.declarations.flatMap(d => d.id.type === 'Identifier' ? [d.id.name] : [])); }
      else if (v && typeof v == 'object') walk(v, inner, node);
    }
  }
  function func(node, scopes, parent) {
    // Blocks used as expressions compile to (() => { … })(): they belong to the frame they're in.
    const iife = parent?.type === 'CallExpression' && parent.callee === node || parent?.iife;
    const name = node.id?.name?.replace(/\$$/, ''), mine = name != null && name in lines;
    // A frame: one of the student's top-level functions, or an anonymous function with a probe of its own (the
    // compiler's helpers have none). Its line is where the function starts, or else its first probe's.
    const frame = iife || name != null && !mine ? null : { name: name ?? 'fn', line: mine ? lines[name] : null };
    const params = node.params.filter(p => p.type === 'Identifier').map(p => p.name);
    const inner = [...scopes, { names: params, frame, fn: { frame } }];
    const body = node.body, expr = body.type !== 'BlockStatement';
    const enter = frame && put(expr ? body.start : body.start + 1, '', frame);
    if (frame && expr) { put(body.start, ` ${H}.ret($sf, `, frame); walk(body, inner, node); put(body.end, ')', frame); }
    else walk(body, inner, node);
    if (!frame) return;
    if (frame.line == null && !mine) return void (frame.dead = true);
    const loop = mine && params.length > 0 && params.every(p => p.startsWith('loop$')); // calls itself last: compiled to a loop
    const args = params.map(p => [gleamName(p), p]).filter(([g]) => g).map(([g, p]) => `[${JSON.stringify(g)}, ${p}]`).join(', ');
    enter.text = `${expr ? '{' : ''} const $sf = ${H}.enter(${JSON.stringify(frame.name)}, ${frame.line}, [${args}]${loop ? ', true' : ''}); try {${expr ? ' return' : ''}`;
    put(expr ? body.end : body.end - 1, `${expr ? ';' : ''} } catch ($e) { ${H}.exc($e); throw $e; } finally { ${H}.leave($sf); }${expr ? ' }' : ''}`, frame);
  }
  walk(ast, [], null);
  // Insertions at one place keep the order they were made in: an outer start before an inner one, an inner end first.
  let out = '', from = 0;
  for (const x of ins.filter(x => !x.f?.dead).sort((a, b) => a.pos - b.pos || a.seq - b.seq)) { out += js.slice(from, x.pos) + x.text; from = x.pos; }
  return out + js.slice(from);
}

// ---- recording ----
class StepLimit extends Error {}
const MAX_VARS = 50, MAX_LEN = 200;
// hooks go on globalThis.__gleamStep while the module runs. show formats a value (string.inspect); size() is how many
// characters have been printed; describe(frame name, error) is an error's message.
export function recorder({ show, size, describe, max = 2000 }) {
  const steps = [], stack = []; let id = 0, last = null, cut = false;
  const fmt = v => { let s; try { s = show(v); } catch { s = String(v); } return s.length <= MAX_LEN ? s : s.slice(0, MAX_LEN - 1) + '…'; };
  const vars = ps => ps.slice(0, MAX_VARS).map(([k, v]) => [k, fmt(v)]);
  function push(ev, l, extra) {
    if (steps.length >= max) { cut = true; throw new StepLimit('Step limit'); }
    steps.push({ l, ev, st: stack.map(f => ({ ...f })), o: size(), ...extra });
  }
  const hooks = {
    probe(l, ps) { const f = stack.at(-1); if (!f) return; f.l = l; f.vars = vars(ps); push('line', l); },
    enter(fn, l, ps, loop) { const f = { fn, id: ++id, l: l || stack.at(-1)?.l || 1, vars: vars(ps), ...(loop && { loop }) }; stack.push(f); push('call', f.l); return f; },
    ret(f, v) { f.ret = fmt(v); try { push('return', f.l); } finally { delete f.ret; } return v; },
    exc(e) { if (e === last || e instanceof StepLimit) return; last = e; const f = stack.at(-1); push('exc', f?.l || 1, { exc: describe(f?.fn || 'main', e) }); },
    leave(f) { const i = stack.lastIndexOf(f); if (i >= 0) stack.length = i; },
  };
  return {
    hooks, steps, get cut() { return cut; },
    // After the run: the last step shows the program finished (unless the recording was cut off).
    end() { if (!cut) steps.push({ l: steps.at(-1)?.l || 1, ev: 'end', st: [], o: size() }); },
  };
}
