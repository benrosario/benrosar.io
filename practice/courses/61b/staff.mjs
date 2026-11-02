// The course staff's topic tags for one sub-question, from the exam archive (staff-topics.json, written by
// scripts/staff-topics-61b.mjs): staff('61b-fa25-mt2', '1.1') -> {topics: ['HEAPS']}. Several labels combine their tags.
// Throws for a label the archive doesn't tag, so a typo can't silently drop a question's topics.
import S from './staff-topics.json' with { type: 'json' };

export function staff(exam, ...labels) {
  exam = exam.replace(/^61b-/, ''); // the archive's label: fa25-mt2
  const t = labels.flatMap(l => { const x = S.exams[exam]?.['q' + l]; if (!x) throw new Error(`${exam}: no staff tags for q${l}`); return x; });
  return { topics: [...new Set(t)] };
}
// This site's own tags, where the archive has none for a question.
export const site = (...t) => ({ topics: t, topicsBy: 'site' });
