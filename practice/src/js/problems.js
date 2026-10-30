// Practice problems the playground can import: those with code the site runs (p.run), in Python or Gleam.
// fileFor builds the playground file: the problem's code with its blanks filled in, then its tests (Python's doctests
// are already in the code). Blanks can be left as blanks (____ in Python, todo in Gleam), filled with the student's
// answers (unchecked drafts first, as practice shows them), or with the solution once every code question in the
// problem has been checked. Template blanks no question asks about always get the official code, as in practice.
import { st } from './state.js';
import { fill, gleamSource, answerParts, solutionQuestions } from './grading.js';
import { topicName, examDate, examKind, KINDS } from './model.js';
import { segText } from './highlight.js';

export const langOf = p => p.run.lang === 'gleam' ? 'gleam' : 'py';
const HOLE = { py: '____', gleam: 'todo' };
let INDEX = null;
// Every importable problem, newest exam first: {p, e (the source exam), lang, topics (names), hay (lowercase text to search)}.
export function problems() {
  if (INDEX) return INDEX;
  const when = e => e.src?.adapted || e.src?.site ? 0 : examDate(e.id) + KINDS[examKind(e.id)].rank / 10;
  INDEX = [];
  for (const e of [...st.bank.exams].sort((a, b) => when(b) - when(a))) for (const p of e.p) {
    if (!p.run) continue;
    const topics = [...new Set((p.topics || []).flatMap(t => t.t))].map(topicName);
    const text = p.b.map(b => segText(b.s || b.l || [])).join(' ');
    INDEX.push({ p, e, lang: langOf(p), topics, hay: [e.t, p.t, topics.join(' '), text, p.run.c.join(' ')].join(' ').toLowerCase() });
  }
  return INDEX;
}
export const findProblem = id => problems().find(x => x.p.id === id);

const asked = p => new Set(solutionQuestions(p).flatMap(q => q.r || q.code || []));
const answerOf = (e, q) => { const id = e.id + '|' + q.id, v = st.S._dr?.[id] ?? st.S[id]?.v; return v == null || v === '' || Array.isArray(v) && !v.length ? null : v; };
// The solution is offered once every code question has been checked (right or wrong) in practice.
export const canSolve = ({ p, e }) => { const qs = solutionQuestions(p); return qs.length > 0 && qs.every(q => st.S[e.id + '|' + q.id]); };
export const hasAnswers = ({ p, e }) => solutionQuestions(p).some(q => answerOf(e, q) != null);

// The file's code for fill 'blanks' | 'mine' | 'solution'.
export function codeFor(x, how) {
  const { p, e, lang } = x, R = p.run, ask = asked(p), vals = {};
  for (const b of Object.keys(R.b)) vals[b] = ask.has(b) && how !== 'solution' ? HOLE[lang] : R.v[b];
  if (how === 'mine') for (const q of solutionQuestions(p)) {
    const v = answerOf(e, q); if (v == null) continue;
    const parts = answerParts(q, q.k === 'mc' ? q.o[v] : q.k === 'sata' ? q.o[v[0]] : v); if (parts) Object.assign(vals, parts);
  }
  if (lang === 'gleam') return gleamSource(R, {}, vals);
  return standalone(R.c.map(c => fill(c, R.b, vals)).join('\n\n')) + '\n';
}

// Practice runs Python answers with the course's Link and Tree classes, the operator functions and re already
// defined. Code that uses them gets them at the top, so it runs the same with Run as with Run doctests.
function standalone(code) {
  const uses = name => new RegExp(`\\b${name}\\b`).test(code), defines = name => new RegExp(`^(class|def) ${name}\\b`, 'm').test(code);
  const blocks = st.bank.prelude.split(/\n(?=class |def )/).filter(b => /^(class|def) /.test(b));
  const named = Object.fromEntries(blocks.map(b => [b.match(/^(?:class|def) (\w+)/)[1], b.trimEnd()]));
  const need = ['Link', 'Tree', 'link_from_program', 'is_tree'].filter(n => uses(n) && !defines(n) && named[n]);
  const ops = ['add', 'sub', 'mul', 'truediv', 'floordiv', 'mod', 'neg'].filter(n => new RegExp(`\\b${n}\\(`).test(code) && !defines(n) && !/from operator import/.test(code));
  const head = [];
  if (ops.length) head.push(`from operator import ${ops.join(', ')}`);
  if (/\bre\.\w/.test(code) && !/^import re\b/m.test(code)) head.push('import re');
  if (need.length) head.push(`# ${need.length > 1 ? 'Definitions' : 'The definition'} CS 61A uses for ${need.join(' and ')}.`, ...need.map(n => named[n] + '\n'));
  return head.length ? head.join('\n') + '\n\n' + code : code;
}
