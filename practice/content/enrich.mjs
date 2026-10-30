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
// The exams' stated restrictions on what an answer may contain, enforced before an answer is matched or run. Messages
// quote the exam. `problem` rules apply to every blank in the problem; `q` rules to the listed questions only.
// See answers.js restrictionError for the rule types. Validation checks that every official answer passes its rules.
const no = (words, message) => ({ forbid: words, message });
const each = (ids, rules) => Object.fromEntries(ids.map(id => [id, rules]));
const SU23_DIGITS = [no(['str', 'repr', '[', ']', 'for'], 'You may not use str or repr or [ or ] or for.')];
const FA26_GAP = [no(['if', 'else', '[', ']', 'for', 'range'], 'You may not write if, else, [, ], for, or range in your answers.')];
const NO_ACCEPTABLE = [no(['acceptable'], 'You may not call acceptable.')];
const RULES = {
  '61a-fa26-gleam-adapted/1': { problem: [{ treeEquality: true, message: 'Compare labels and branches recursively; do not compare whole trees with == or !=.' }] },
  '61a-fa26-gleam-adapted/2': { problem: [no(['case', 'if'], 'Do not write case or if in these blanks.')], q: { 16: [{ require: ['list_concat'], message: 'Use list_concat to build the accumulator.' }] } },
  '61a-fa25-final/3': { q: { 15: [no(['for', 'in', 'map', 'range'], 'This blank may not use for, in, map, or range.')] } },
  '61a-fa23-mt2/6': { q: { 25: [no(['or', 'and', 'if', '[', ']'], 'You may not use or, and, if, [, or ].')] } },
  '61a-fa24-mt1/5': { q: {
    22: [{ require: ['compose'], message: 'Your solution must call compose.' }, { forbidPattern: '(^| )f \\(', message: 'f may not be the operator of a call expression.' }],
    26: [{ requirePattern: '^shift(er)? \\(.*\\)$', message: 'Your answer must be a call to shift (or its curried form, shifter).' }] } },
  '61a-fa25-mt1/4': { q: { 18: [no(['cap', 'max_term', 'reverse'], 'You may not use cap or max_term or reverse.'), no(['if', 'else', '[', ']'], 'You may not use if or else or [ or ].')] } },
  '61a-fa25-mt2/5': { q: { 12: [no(['type', 'isinstance'], 'You may not call type or isinstance.')], 14: [no(['='], 'You may not write =.')] } },
  '61a-fa25-mt2/6': { q: { ...each([19, 20, 23, 24, 27], NO_ACCEPTABLE),
    25: [...NO_ACCEPTABLE, no(['pizzas'], 'You may not call pizzas in this blank.')],
    28: [...NO_ACCEPTABLE, { allow: ['NAME', '(', ')', ','], message: 'You may only write names, parentheses, and commas.' }] } },
  '61a-fa26-mt1/3': { q: { 7: [no(['str', 'len', 'if', 'else', '[', ']'], 'You may not write str, len, if, else, [, ], 3, 4, 5, 6, 7, 8, or 9 in your answers.'), { forbidChars: '3456789', message: 'You may not write str, len, if, else, [, ], 3, 4, 5, 6, 7, 8, or 9 in your answers.' }] } },
  '61a-fa26-mt1/4': { q: { ...each([9, 10], FA26_GAP), 11: [...FA26_GAP, no(['for', ':=', '[', ']', 'if', 'else', 'and', 'or', 'map', 'filter', 'range'], 'You may not write for, :=, [, ], if, else, and, or, map, filter, or range in your solution.')] } },
  '61a-sp23-mt2/5': { q: { 23: [{ forbidPattern: '(^| )yield from( |$)', message: 'You may not use yield from.' }] } },
  '61a-sp25-final/9': { q: { 37: [no(['if', 'and', 'or', 'lambda'], 'Do not write if, and, or, or lambda.'), no(['dip', 'where', 'bears', 'skipsum', 'offspring', 'graft', 'Boat', 'Rower', 'Captain', 'can_equal', 'join_link', 'to_link', 'terms', 'equal'], 'You may not call functions from elsewhere on the exam.')] } },
  '61a-sp25-mt1/3': { q: { 15: [no(['all_digits', 'process'], 'You may not call all_digits or process.')] } },
  '61a-sp25-mt2/4': { q: { 15: [{ require: ['for', 'in', 'if'], message: 'Include for and in and if in your answer.' }], ...each([18, 21], [no(['deepest'], 'You may not call deepest in your implementation.')]) } },
  '61a-su23-final/4': { q: { 50: [no(['and', 'or', 'if', 'else'], 'You cannot use and, or, if, or else.')] } },
  '61a-su23-final/11': { q: each([92, 93, 94, 95, 96], [no(['and', 'or', 'begin', 'cond', 'if'], 'You cannot use and, or, begin, cond, or if in the blanks.')]) },
  '61a-su23-midterm/3': { q: each([5, 6, 9, 12, 13], SU23_DIGITS) },
  '61a-su25-final/3': { q: { 11: [no(['if', 'not'], 'You may not use if or not.')] } },
  '61a-su25-final/4': { q: { 16: [no(['and', 'or'], 'You may not use and or or.')] } },
  '61a-su25-midterm/3': { q: each([13, 14], [no(['for', 'in', 'if', 'lambda'], 'You may not use for, in, if, or lambda in your solution.')]) },
  '61a-su25-midterm/5': { q: { 36: [no(['and', 'or', 'not'], 'You may not use and, or, or not.')] } },
  // "[ or ]" can't mean list literals here: the official answers build lists. It rules out indexing and slicing.
  '61a-su24-midterm/4': { q: each([20, 21, 22, 24, 26, 27, 28, 29, 30, 31], [no(['str', 'repr', 'for'], 'You may not use str or repr or [ or ] or for.'), { forbidPattern: '(^| )([A-Za-z_]\\w*|\\)|\\]) \\[', message: 'You may not use str or repr or [ or ] or for (no indexing or slicing).' }]) },
  '61a-su24-midterm/6': { q: { 38: [{ require: ['safe_compose'], message: 'Your solution must use safe_compose.' }] } },
  '61a-su26-midterm/5': { q: { 20: [{ requirePattern: '\\. (append|extend|insert|pop|remove) \\(|\\] =|\\+ =', message: 'A fully correct solution MUST use list mutation.' }], ...each([21, 22, 23, 24, 25], [no(['[', ']', '{', '}'], 'Your solution MUST NOT use lists, dictionaries, or object mutation.')]) } },
  '61a-su26-final/5': { q: each([36, 37, 38, 39, 40], [{ forbidPattern: '(==|!=|is) \\( \\)', message: 'Do NOT violate the abstraction barrier of Link (compare with Link.empty, not ()).' }]) },
};

export function enrich(exams) {
  addSQL(exams);
  for (const e of exams) for (const p of e.p) {
    // Link multiple-choice code blanks too, so whole-solution checks use students' selections.
    // Pair the displayed blocks that have blanks with the program chunks that have blanks, in order (blocks with none,
    // such as a picture written as code, aren't in the program).
    const labels = {}, chunks = (p.run?.c || []).filter(c => /⟦B/.test(c)); let ci = 0;
    for (const b of p.b) {
      if (b.s) for (const g of b.s) if (g.c && p.run && g.lang === (p.run.lang === 'gleam' ? 'gleam' : 'py') && !g.test && /⟪[a-z]⟫/.test(g.c)) {
        const shown = [...g.c.matchAll(/⟪([a-z])⟫/g)].map(m=>m[1]);
        const compiled = [...(chunks[ci++] || '').matchAll(/⟦(B[\d_]+)⟧/g)].map(m=>m[1]);
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
    if (RULES[p.id]) {
      const R = RULES[p.id];
      if (R.problem) p.rules = R.problem;
      for (const id in R.q || {}) { const q = p.b.find(q => q.id === +id); if (!q) throw new Error(`rules for unknown question ${p.id} q${id}`); q.rules = R.q[id]; }
    }
    for (const q of p.b.filter(q=>q.sql)) {
      q.explanationBy = 'site';
      const clause = p.sql.chunks[q.sql.chunk].f[q.sql.key];
      if (!q.x) q.x = /HAVING/i.test(clause) ? 'Group rows before testing aggregate conditions. For group sizes 20 and 21, HAVING COUNT(*) > 20 keeps only the group of 21; WHERE cannot apply a group count before the groups exist.' : /ORDER BY|DESC/i.test(clause) ? 'Sort the result by the quantity the question asks to rank. DESC places larger values first; a LIMIT is applied after that ordering, so limiting an unsorted result can select the wrong rows.' : /SUM|AVG|COUNT|MAX|MIN/i.test(clause) ? 'Apply the aggregate to each group, rather than to an unrelated row. For values 2 and 4 in one group, SUM gives 6, AVG gives 3, COUNT gives 2, and MAX gives 4. Choose the aggregate matching the requested quantity.' : /AND|ON|WHERE|=/i.test(clause) ? 'Match the join keys before applying the row filters. Without that relationship, each row can combine with unrelated rows, inflating counts and sums. Conditions joined by AND must all hold for the same joined row.' : 'This blank selects the table, column, or grouping key used by the surrounding query. Follow the aliases declared in FROM; a selected field must come from a table available in that query.';
      q.hints = ['Identify which SQL clause contains this blank and what rows it should operate on.', /HAVING|COUNT|SUM|AVG/i.test(clause) ? 'Decide whether this condition concerns one row or an entire group.' : 'Check the join keys and any boundary conditions before ordering the results.'];
    }
  }
}
