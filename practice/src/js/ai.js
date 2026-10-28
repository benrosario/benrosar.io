// "Ask AI why": a self-contained tutoring prompt for a missed question, copied to the clipboard.
import { segText } from './highlight.js';

function answerText(q, v) { if (q.k == 'mc') return v == null ? '(none)' : q.o[v]; if (q.k == 'sata') return v.length ? v.map(i => '- ' + q.o[i]).join('\n') : '(none selected)'; return v; }
// title: where the question is from, e.g. "Fall 2025 Midterm 2" or "Timed practice exam"; studying: collection label.
export function aiPrompt(title, p, q, v, out, studying) {
  const ask = segText(q.l), kind = { mc: 'multiple choice (one answer)', sata: 'select all that apply', blank: 'fill in the blank' }[q.k];
  const opts = q.o ? '\n\nOptions:\n' + q.o.map(o => '- ' + o).join('\n') : '';
  const block = (t, lang) => '```' + (lang || '') + '\n' + t + '\n```';
  const gleam = p.run?.lang == 'gleam' || p.b.some(b => b.s?.some(g => g.lang == 'gleam'));
  const lang = q.k == 'blank' && /[()=\[\].]/.test(q.a[0]) ? (gleam ? 'gleam' : 'python') : '';
  return `I'm studying for a CS 61A (UC Berkeley, Fall 2026: Python, Gleam and SQL) exam${studying ? ` (${studying})` : ''} and got a past exam question wrong. Please help me understand my mistake.

## Problem: ${title}, ${p.t}${p.adapted ? `\n(Not official course material: a practice site adapted this to Gleam from ${p.adapted.from}, a Scheme exam problem.)` : ''}
${p.b.filter(b => b.s).map(b => segText(b.s)).join('\n\n')}

## The question I answered (${kind})
${ask}${opts}

## My answer
${block(answerText(q, v), lang)}

## Official answer
${block(answerText(q, q.k == 'blank' ? q.a[0] : q.a), lang)}${q.k == 'blank' && q.a.length > 1 ? '\nOther accepted forms:\n' + q.a.slice(1).map(x => block(x, lang)).join('\n') : ''}${q.x ? '\n\nStaff explanation: ' + q.x : ''}${out ? '\n\n## What happened when my answer was checked\n' + block(out) : ''}

## What I'd like from you
1. Pinpoint exactly where my reasoning goes wrong. Name the specific concept or misconception (for example: mutation vs. creating a new object, which frame a name is looked up in, off-by-one, base case, iterator exhaustion).
2. Walk through a small concrete example step by step, comparing what my answer does with what the official answer does.
3. Say whether my answer could be correct under some reasonable reading of the problem, or if it's only a small fix away. If so, what would change?
4. Give me one short rule of thumb to avoid this mistake, plus a quick practice question (without the answer) that tests the same idea.

Keep it concise, and don't just restate the official answer. Explain the why.`;
}
