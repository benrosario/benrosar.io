import { addSQL } from './sql.mjs';

const explanations = [
  'Pair the two current heads using the tuple constructor #(first0, first1). For [1, 2] and [8, 9], the first pair is #(1, 8). The recursive call handles #(2, 9).',
  'Recurse on both tails. After pairing the first elements of [1, 2] and [8, 9], zip(rest0, rest1) must zip [2] with [9], rather than reusing either original head.',
  'When either list is empty there are no more pairs, so return []. This also stops zip when one list is shorter than the other.',
  'zip constructs a new list node after its recursive call returns. The recursive result must be placed after the current pair, so the call is not in tail position.',
  'Check root labels, branch counts, and corresponding branches. Equal root labels alone are insufficient: Tree(1, []) and Tree(1, [Tree(2, [])]) have different structure. The label and length checks may swap positions only if both remain present.',
  'Equal branch counts prevent zip from silently discarding extra branches. For branch lists of lengths 1 and 2, zip returns just one pair; checking only those pairs would miss the unmatched branch.',
  'p is a tuple of corresponding branches, so recursively compare p.0 with p.1. Comparing just their labels would miss differences deeper in the trees.',
  'zip the two branch lists before mapping the recursive comparison over pairs. The separate length check ensures there is no unmatched branch.',
  'When n is zero, return s unchanged. pad([1, 2, 3], 0, 9) must return [1, 2, 3], not [], because pad never shortens an existing list.',
  'If the list has ended while elements are still needed, the next head is el. For pad([], 2, 7), the first generated element is 7.',
  'Continue padding the empty list with n - 1 remaining positions. pad([], 2, 7) becomes [7, ..pad([], 1, 7)] and finally [7, 7].',
  'Keep the existing first element. Padding extends the list; it must not replace values already present.',
  'Recurse on rest while decreasing n. An existing element counts toward the target length, so pad([1, 2], 3, 9) keeps 1 and pads [2] to length 2.',
  'Stop when either s is empty or n is zero. The alternative patterns [], _ | _, 0 cover both cases without attempting to destructure an empty list.',
  't accumulates the retained prefix in its original order. Once enough elements have been collected, return t rather than the unprocessed suffix.',
  'Append [first] to t using list_concat. With t = [1] and first = 2, the next accumulator is [1, 2]. Prepending would reverse the retained prefix.',
  'The accumulator and returned prefix grow to n elements. Although the main helper is tail recursive, list_concat allocates copies of the prefix; peak live storage grows linearly with n.',
  'Each list_concat traverses a growing prefix: lengths 0, 1, …, n−1. The sum is n(n−1)/2, so the running time is quadratic in n.',
  'list.append joins the retained old pairs with the one-element list containing the new pair. Filtering happens first so replacing a key does not leave a duplicate.',
  'Keep pairs whose key differs from the key being added. For [("a", 1), ("b", 2)] with key "a", only the "b" pair survives the filter.',
  'Build #(key, value), in that order. The first tuple field is used for lookup, while the second is returned as the stored value.',
  'The successful match has one pair. Return its value field, pair.1, inside the Ok already supplied by the template.',
  'Filter for equality with the requested key. After filtering, exactly one match yields Ok(value); no match yields Error(Nil).',
  'Adding "y" first gives [("x", 1), ("y", 2)]. Updating "x" removes its old pair and appends the replacement, giving [#("y", 2), #("x", 3)].',
  'Only "x" is stored, so looking up "z" yields an empty filtered list and selects the Error(Nil) branch.',
  'With k equal to zero, return s unchanged. This is the stopping case that preserves the rotated order reached so far.',
  'list.append combines the tail and the one-element list containing the old head. This moves the first element to the end.',
  'The first argument of append is rest. Starting with [1, 2, 3], the next list begins with [2, 3].',
  'Wrap first in a list, [first], because list.append accepts two lists. Passing first alone has the wrong type.',
  'Decrease k by one after each rotation. Starting at k = 2, the recursive calls use 1 and then 0, where the base case stops.',
  'rotate immediately returns its recursive call’s result; no work remains after that call. It is tail recursive even though constructing the arguments takes work.',
  'Four left rotations of a three-element list have the same effect as one rotation: ["a", "b", "c"] becomes ["b", "c", "a"].'
];
export function enrich(exams) {
  addSQL(exams);
  for (const e of exams) for (const p of e.p) {
    // Link multiple-choice code blanks too, so whole-solution checks use students' selections.
    const labels = {}; let ci = 0;
    for (const b of p.b) {
      if (b.s) for (const g of b.s) if (g.c && p.run && g.lang === (p.run.lang === 'gleam' ? 'gleam' : 'py') && !g.test) {
        const shown = [...g.c.matchAll(/⟪([a-z])⟫/g)].map(m=>m[1]);
        const compiled = [...(p.run.c[ci++] || '').matchAll(/⟦(B[\d_]+)⟧/g)].map(m=>m[1]);
        if (shown.length === compiled.length) shown.forEach((label,i)=>labels[label]=compiled[i]);
      }
      if (b.k && !b.r) {
        const letter = b.l?.map(s=>s.p || '').join(' ').match(/blank\s*\(([a-z])\)/i)?.[1];
        if (letter && labels[letter]) b.code = [labels[letter]];
      }
    }
    if (e.id === '61a-fa26-gleam-adapted') for (const q of p.b.filter(q=>q.k)) {
      q.x = explanations[q.id-1]; q.explanationBy = 'site';
      q.hints = [p.n === '1' ? 'Track a pair of matching inputs and the smallest empty case.' : p.n === '2' ? 'Write the required result when n is zero and when the list is empty.' : p.n === '3' ? 'A dictionary is a list of key/value pairs; track which pairs survive.' : 'Trace a single left rotation before considering k rotations.',
        q.k === 'mc' ? 'Ask what work remains after recursion, or sum the work done across calls.' : q.ev ? 'Evaluate one function call at a time, keeping the list order.' : 'Read the surrounding template: determine whether this blank needs a value, a list, a function, or a condition.'];
    }
    if (p.id === '61a-fa26-gleam-adapted/1') p.rules = [{treeEquality:true,message:'Compare labels and branches recursively; do not compare whole trees with == or !=.'}];
    if (p.id === '61a-fa26-gleam-adapted/2') {
      p.rules = [{forbid:['case','if'],message:'Do not write case or if in these blanks.'}];
      p.b.find(q=>q.id===16).rules = [{require:['list_concat'],message:'Use list_concat to build the accumulator.'}];
    }
    if (p.id === '61a-fa25-final/3') p.b.find(q=>q.id===15).rules = [{forbid:['for','in','map','range'],message:'This blank may not use for, in, map, or range.'}];
    for (const q of p.b.filter(q=>q.sql)) {
      q.explanationBy = 'site';
      const clause = p.sql.chunks[q.sql.chunk].f[q.sql.key];
      if (!q.x) q.x = /HAVING/i.test(clause) ? 'Group rows before testing aggregate conditions. For group sizes 20 and 21, HAVING COUNT(*) > 20 keeps only the group of 21; WHERE cannot apply a group count before the groups exist.' : /ORDER BY|DESC/i.test(clause) ? 'Sort the result by the quantity the question asks to rank. DESC places larger values first; a LIMIT is applied after that ordering, so limiting an unsorted result can select the wrong rows.' : /SUM|AVG|COUNT|MAX|MIN/i.test(clause) ? 'Apply the aggregate to each group, rather than to an unrelated row. For values 2 and 4 in one group, SUM gives 6, AVG gives 3, COUNT gives 2, and MAX gives 4. Choose the aggregate matching the requested quantity.' : /AND|ON|WHERE|=/i.test(clause) ? 'Match the join keys before applying the row filters. Without that relationship, each row can combine with unrelated rows, inflating counts and sums. Conditions joined by AND must all hold for the same joined row.' : 'This blank selects the table, column, or grouping key used by the surrounding query. Follow the aliases declared in FROM; a selected field must come from a table available in that query.';
      q.hints = ['Identify which SQL clause contains this blank and what rows it should operate on.', /HAVING|COUNT|SUM|AVG/i.test(clause) ? 'Decide whether this condition concerns one row or an entire group.' : 'Check the join keys and any boundary conditions before ordering the results.'];
    }
  }
}
