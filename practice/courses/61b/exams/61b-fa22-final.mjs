// Fall 2022 Final. The solution PDF is image-only; its marked answers and explanations were read page by page.
import { exam, problem, text, java, blank, mc, sata } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...topics) => site(...topics);
let id = 0;
const B = (label, answer, topic, note) => blank(++id, label, answer, { ...T(topic), ...(note ? { x: note } : {}) });
const M = (label, options, answer, topic, note) => mc(++id, label, options, answer, { ...T(topic), ...(note ? { x: note } : {}) });
const A = (label, options, answer, topic, note) => sata(++id, label, options, answer, { ...T(topic), ...(note ? { x: note } : {}) });

export default exam('61b-fa22-final', 'Fall 2022 Final', {
  exam: 'https://drive.google.com/file/d/1LQ1Z6cki1dtPg5KGBYaKT53B9ZiPgvXt/view',
  sol: 'https://drive.google.com/file/d/18OqXS1qtv97nV1gUChcdb58HsMWphQYg/view',
}, 'fa22-final', [
  problem('1', 'Are You Better Informed than ChatGPT?', null, [
    text('For each response, select every statement that is completely true. Hash-table buckets use linked lists.'),
    A('1.1 Advantages of a balanced BST over a hash table', [
      'Faster average search, insert, and delete because keys are ordered',
      'Efficient minimum, maximum, and range queries',
      'A better worst-case bound for these operations than a chained hash table',
      'None of the above',
    ], [1, 2], 'BSTS', 'A balanced BST has logarithmic worst-case operations; a chained table may have linear worst-case operations.'),
    A('1.2 Advantages of insertion sort over randomized quicksort', [
      'Insertion sort is faster on small inputs because its time complexity is O(n)',
      'Insertion sort is stable; randomized quicksort with Hoare partitioning is not',
      'Insertion sort is in-place but randomized quicksort always needs an auxiliary array',
      'Insertion sort can exploit an already partially sorted array',
      'None of the above',
    ], [1, 3], 'SORTING', 'Insertion sort still has quadratic worst-case time. Hoare partitioning is in-place.'),
    A('1.3 Advantages of Quick Find over Weighted Quick Union', [
      'Quick Find is generally faster on average because all operations are constant time',
      'Quick Find uses less space because WQU cannot use a flat array',
      'Quick Find is better for frequently changing connectivity',
      'None of the above',
    ], [3], 'DISJOINT_SETS', 'Quick Find has fast connectivity queries but slow union operations; both implementations can use arrays.'),
    A('1.4 Selection sort versus merge sort: statements credited by the official key', [
      'Selection sort is O(n²), whereas merge sort is O(n log n)',
      'Choose selection sort for small inputs or whenever a stable sort is needed',
      'None of the above',
    ], [0], 'SORTING', 'The first statement is true and the staff accepted it, though it is not a reason to prefer selection sort. Merge sort is stable.'),
  ]),
  problem('2', 'Sort Mechanisms', null, [
    text('Start with [5, 3, 1, 6, 4, 9, 7]. Give the array after the first swap under each algorithm.'),
    B('2.1 Selection sort', '1, 3, 5, 6, 4, 9, 7', 'SORTING', 'Selection sort first swaps the minimum, 1, with 5.'),
    B('2.2 Insertion sort', '3, 5, 1, 6, 4, 9, 7', 'SORTING', 'The adjacent 5 and 3 swap first.'),
    B('2.3 Quicksort, leftmost pivot 5 and Hoare partitioning', '5, 3, 1, 4, 6, 9, 7', 'SORTING', 'The first misplaced pair is 6 and 4.'),
    B('2.4 Heapsort, including heapification', '5, 3, 9, 6, 4, 1, 7', 'SORTING', 'Bottom-up max-heapification swaps 1 with its larger child, 9.'),
    M('2.5 Why ask no first-swap question for lecture merge sort?', [
      'Merge sort is nondeterministic', 'The merge strategy changes the first swap',
      'The given input array is not sorted by swaps', 'Merge sort never swaps values in any array',
    ], 2, 'SORTING', 'The lecture algorithm merges into auxiliary space rather than swapping items in the given array.'),
  ]),
  problem('3', 'Asymptotic Runtime Analysis', null, [
    java(`void f1(int N) {
  for (int i = 1; i < N; i += 2)
    for (int j = 1; j < N; j *= 3) print("*");
}
void f2(int N) {
  print("x");
  if (N > 1) for (int i = 0; i < 4; i++) f2(N / 2);
}
void f3(int N) {
  for (int i = 0; i < N; i++) print("*");
  if (N > 1) for (int i = 0; i < 4; i++) f3(N / 2);
}`),
    B('3.1 Tight runtime of f1', 'Theta(N log N)', 'ASYMPTOTICS'),
    B('3.2 Number of prints in f2, as a sum for power-of-two N', '1 + 4 + 16 + ... + N^2', 'ASYMPTOTICS', 'There are 4^k calls at level k and log₂N levels below the root.'),
    B('3.3 Tight runtime of f3', 'Theta(N^2)', 'ASYMPTOTICS', 'Level costs are N, 2N, 4N, and so on, dominated by the final level.'),
    text('f4 fills an array with 0,1,…,N−1, swaps every adjacent pair from left to right once, then insertion-sorts the result.'),
    B('3.4 Tight runtime of f4', 'Theta(N)', 'ASYMPTOTICS', 'The array becomes [1,2,…,N−1,0], with only N−1 inversions.'),
    text('f5 loops x from 2 to N−1. For each x, it tests divisors f from 2 up to √x and breaks on a divisor.'),
    A('3.5 Valid big-O upper bounds for f5', ['O(1)', 'O(√N)', 'O(N√N)', 'O(N²)', 'O(N!)'], [2, 3, 4], 'ASYMPTOTICS', 'The outer loop takes Θ(N) iterations, and each inner loop is at most O(√N).'),
  ]),
  problem('4', 'BSTs', null, [
    text('The original BST has root 48. Its right branch goes through 95, 57, 75, 66, 59; its in-order predecessor and successor of 48 are 36 and 50.'),
    B('4.1 Where does add(58) place the new node?', 'left child of 59', 'BSTS', 'Follow 48→95→57→75→66→59.'),
    B('4.2 Which listed value can replace root 48 under Hibbard deletion?', '36', 'BSTS', 'The predecessor is 36; the successor is 50, which was not a choice.'),
    M('4.3 Effect on tree height of rotateLeft(57)', ['Decreases by 1', 'Unchanged', 'Increases by 1'], 1, 'BSTS', '75 moves above 57, and a longest root-to-leaf path remains the same length.'),
    A('4.4 Possible depths of the median in some 13-node BST', ['0', '1', '3', '5', '12'], [0, 1, 2, 3, 4], 'BSTS', 'The median can be the root, an interior node, or even a leaf at depth 12 in a zig-zag tree.'),
  ]),
  problem('5', 'Shortest Paths', null, [
    A('5.1 Inputs required to run A*', ['Graph', 'Source vertex', 'Target vertex', 'Disallowed vertices', 'Precomputed shortest-path tree', 'Heuristic'], [0, 1, 2, 5], 'SHORTEST_PATHS'),
    text('5.2 was struck from grading by course staff because the real-world wording was ambiguous.'),
    text('For 5.3–5.5, use this directed graph. Edges and weights: 0→1 (4), 1→2 (2), 2→0 (5), 0→3 (6), 0→4 (3), 2→3 (8), 2→5 (2), 3→4 (9), 5→4 (2).'),
    B('5.3 Dijkstra removal order starting from 2', '2, 5, 4, 0, 3, 1', 'SHORTEST_PATHS', 'The shortest distances from 2 are 0, 2, 4, 5, 8, and 9 in that vertex order.'),
    A('5.4 Which vertices can be visited last by BFS from 2 with arbitrary adjacency order?', ['0', '1', '2', '3', '4', '5'], [1, 4], 'GRAPH_TRAVERSALS', 'The last BFS layer consists of 1 and 4.'),
    A('5.5 Which vertices can be visited last if the BFS fringe is a stack?', ['0', '1', '2', '3', '4', '5'], [1, 3, 5], 'GRAPH_TRAVERSALS', 'The start 2 is first, 0 must precede 1, and 4 is reached before another unfinished neighbor of 2.'),
    M('5.6 Relax E/2 randomly chosen edges before ordinary Dijkstra. Does this preserve correctness?', ['Always computes the correct SPT', 'Only if no relaxed edge is in the SPT', 'Only if every relaxed edge is in the SPT', 'Never computes the correct SPT'], 0, 'SHORTEST_PATHS', 'Early relaxations only improve tentative distances; Dijkstra still removes vertices by priority.'),
    M('5.7 Negate every edge weight, then run Dijkstra. What is always true?', ['It returns longest simple paths', 'It returns the original shortest-path tree', 'Neither'], 2, 'SHORTEST_PATHS', 'Dijkstra does not generally work on negative edges.'),
    M('5.8 Double every edge weight. What happens to the shortest-path tree?', ['The same tree remains a shortest-path tree', 'It is only sometimes the same', 'It is never the same'], 0, 'SHORTEST_PATHS', 'Multiplying all path weights by the same positive constant preserves their order.'),
    M('5.9 Every edge weighs 1. Can Dijkstra and BFS produce the same SPT?', ['Always identical even without matching tie-breaks', 'Sometimes identical; tie-breaks can differ', 'Never identical'], 1, 'SHORTEST_PATHS', 'With matching source and tie-breaking, they agree; without specified tie-breaking, only “sometimes” is guaranteed.'),
  ]),
  problem('6', 'Tries', null, [
    text('The original diagram shows the keys ma, map, maple, man, mane, plus other branches. Refer to the original PDF for its exact drawn shape.'),
    A('6.1 Which keys does keysWithPrefix("ma") return?', ['ma', 'map', 'mapl', 'maple', 'man', 'mane'], [1, 3, 4, 5], 'TRIES', 'The path “mapl” is a prefix but not a complete key; “ma” is likewise not marked as a key.'),
    A('6.2 Which additions create the fewest new nodes?', ['arck', 'at', 'of', 'maples', 'marg', 'marge'], [0, 1, 3], 'TRIES', 'Each adds one node to the shown trie.'),
    A('6.3 Inputs requiring the most traversal for shortestPrefixOf', ['arcs', 'dude', 'duel', 'duels', 'duelsport', 'mane', 'mapl', 'maple', 'maplesyrup'], [3, 4], 'TRIES', 'Both traverse through the five-letter key “duels” before stopping.'),
  ]),
  problem('7', 'Mash Ups', null, [
    B('7.1 Worst-case contains in a hash set whose buckets are heaps', 'O(N)', 'HASHING', 'Searching an arbitrary value in a heap can require scanning the entire heap.'),
    B('7.2 Worst-case contains when each bucket is a 2–3 tree', 'O(log N)', 'HASHING', 'Even if all N keys collide, the balanced tree has logarithmic height.'),
    text('7.3–7.4: An outer table has M buckets; each contains a P-bucket inner table. Both levels use the same hashCode; N items are evenly distributed by hashCode. Assume M=P.'),
    B('7.3 Average list length under the two accepted interpretations', ['N/M', 'N/M^2'], 'HASHING', 'Staff accepted N/M among occupied inner lists or N/M² averaged over all allocated inner lists.'),
    B('7.4 Approximate number of occupied buckets', 'M', 'HASHING', 'Each outer bucket uses just one of its inner buckets because the hash is reused.'),
    B('7.5 After inserting 5 then 3 into a right-leaning red-black BST, what repairs the red-link direction?', 'rotateRight(5)', 'RED_BLACK_TREES'),
  ]),
  problem('8', 'Heap Verification', null, [
    text('A max-heap is represented as a 2D array, one row per level: [[15], [11, 8], [4, 10, 5, 6]]. The helper is isValidHeap(heap, r, c), where r is row and c is the index within that row.'),
    B('8.1 Initial helper call arguments', 'heap, 0, 0', 'HEAPS', 'Start at the root in row 0, column 0.'),
    B('8.2 Base case for helper recursion', 'r >= heap.length - 1', 'HEAPS', 'The last row consists of leaves.'),
    B('8.3 Left-child column in the next row', '2 * c', 'HEAPS'),
    B('8.4 Comparison that detects a max-heap violation at the left child', 'heap[r][c] < heap[r + 1][left]', 'HEAPS'),
    B('8.5 Return expression after checking both children', 'isValidHeap(heap, r + 1, left) && isValidHeap(heap, r + 1, right)', 'HEAPS'),
  ]),
  problem('9', 'IterableComparator', null, [
    text('Implement Comparator<Iterable> by comparing the number of elements available in two iterables a and b.'),
    B('9.1 Return type of compare', 'int', 'COMPARATORS'),
    B('9.2 Method name', 'compare', 'COMPARATORS'),
    B('9.3 Parameter type for both a and b', 'Iterable', 'COMPARATORS'),
    B('9.4 Enhanced-for loop header over a', 'Object x : a', 'ITERATION', 'Iterable does not promise int elements or a size() method.'),
    B('9.5 Loop body to count one element', 'ac = ac + 1;', 'ITERATION'),
    A('9.6 Valid compare return expressions', ['ac', 'bc', 'ac > bc', 'ac - bc', '(ac - bc) * 2', 'None of the above'], [3, 4], 'COMPARATORS'),
  ]),
  problem('10', 'MSTs', null, [
    text('For the original weighted graph, Kruskal checks edges in this order: 0–4, 3–4, 2–3, 0–3, 0–2, 0–1, then possibly 1–2. See the PDF for the graph.'),
    A('10.1 Which isConnected checks return true?', ['0–4', '3–4', '2–3', '0–3', '0–2', '0–1', '1–2'], [3, 4], 'MSTS', 'The staff also accepted 1–2 if the algorithm continues to test after reaching V−1 edges; the practice version stops there.'),
    B('10.2 Prim visit order from vertex 2', '2, 3, 4, 0, 1', 'MSTS'),
  ]),
]);
