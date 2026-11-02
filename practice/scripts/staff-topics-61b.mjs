// Fetch CS 61B's per-question topic tags from the "Exams Sorted By Topic" tables on the course's exam archive and
// write courses/61b/staff-topics.json: {"fa25-mt2": {"q1.2": ["BSTS"], ...}, ...} (maintenance tool).
// Question labels are the archive's ("q1.2", "q4", "q3a", "q4 Set I (a-e)"); a row naming several ("q2.4, q2.5")
// tags each. Exams cite these when they write their problems' topics (courses/61b/exams/*.mjs).
// Usage: node practice/scripts/staff-topics-61b.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './build.mjs';

const URL = 'https://fa26.datastructur.es/resources/exam-archive/';
// The archive's topic headings, as this site's tags (courses/61b/course.json).
const TAG = { 'Java': 'JAVA', 'Git': 'GIT', 'Testing': 'TESTING', 'Lists': 'LISTS', 'Linked Lists': 'LINKED_LISTS', 'Arrays': 'ARRAYS',
  'Deques': 'DEQUES', 'Abstraction': 'ABSTRACTION', 'Inheritance': 'INHERITANCE', 'DMS': 'DMS', 'Iterators': 'ITERATORS',
  'Comparators': 'COMPARATORS', 'Equals': 'EQUALS', 'Asymptotics': 'ASYMPTOTICS', 'Disjoint Sets': 'DISJOINT_SETS', 'ADTs': 'ADTS',
  'BSTs': 'BSTS', 'B-Trees': 'B_TREES', 'Red-Black Trees': 'RED_BLACK_TREES', 'Hashing': 'HASHING', 'Heaps / PQs': 'HEAPS',
  'Tree Traversals': 'TREE_TRAVERSALS', 'Graph Traversals': 'GRAPH_TRAVERSALS', 'SPTs': 'SHORTEST_PATHS', 'MSTs': 'MSTS',
  'Tries': 'TRIES', 'Sorting': 'SORTING', '2048': 'PROJECT_2048', 'Percolation': 'PERCOLATION', 'K-D Trees': 'K_D_TREES',
  'Reductions': 'REDUCTIONS', 'Graph Representations': 'GRAPH_REPRESENTATIONS', 'Comparison Sorts': 'COMPARISON_SORTS',
  'Topological Sort': 'TOPOLOGICAL_SORT', 'Radix Sorts': 'RADIX_SORTS', 'Regex': 'REGEX', 'Bits': 'BITS', 'Game Trees': 'GAME_TREES',
  'Iteration': 'ITERATION', 'Recursion': 'RECURSION' };

const html = await (await fetch(URL)).text(), out = {};
const text = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
for (const [, sum, body] of html.matchAll(/<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)) {
  const topic = text(sum).replace(/ questions.*$/, ''), tag = TAG[topic];
  if (!tag) throw new Error(`unknown archive topic ${topic}`);
  for (const [, row] of body.matchAll(/<tr>\s*<td>([\s\S]*?)<\/td>/g)) {
    const m = text(row).match(/^(\S+) Question (.+)$/); if (!m) continue;
    for (const q of m[2].split(/,\s*/)) { const t = (out[m[1]] ||= {})[q] ||= []; if (!t.includes(tag)) t.push(tag); }
  }
}
writeFileSync(join(ROOT, 'courses/61b/staff-topics.json'), JSON.stringify({ source: URL, exams: out }, null, 1) + '\n');
console.log(`${Object.keys(out).length} exams, ${Object.values(out).reduce((n, e) => n + Object.keys(e).length, 0)} questions`);
