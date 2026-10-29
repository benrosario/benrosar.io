import { questionTopics, topicName } from './model.js';
export function topicStats(view, saved) {
  const stats = {};
  for (const ex of view.exams) for (const P of ex.problems) for (const x of P.qs) {
    if (x.oos) continue;
    const s = saved[x.qid];
    for (const topic of questionTopics(P.p,x.q) || []) {
      if (topic === 'WWPD') continue;
      const t = stats[topic] ||= {topic,label:topicName(topic),total:0,answered:0,correct:0,missed:0};
      t.total++; if (s) t.answered++; if (s?.ok) t.correct++; if (missedQuestion(saved,x.qid)) t.missed++;
    }
  }
  return Object.values(stats).sort((a,b)=>a.label.localeCompare(b.label));
}
export const wasMissed = saved => !!saved && (!!saved.misses || !saved.ok);
export const missedQuestion = (saved,id) => !!saved._missed?.[id] || wasMissed(saved[id]);
export const matchesTopic = (topic,p,q) => !topic || (questionTopics(p,q) || []).includes(topic);
