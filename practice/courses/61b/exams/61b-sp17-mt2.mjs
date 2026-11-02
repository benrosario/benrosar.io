// Spring 2017 Midterm 2, transcribed from the official solutions (beta). (This exam’s points total 120.)
// The course’s topic index has no entries for this exam, so its topic tags are this site’s.
// Changed for this site, and said so on the page: pictures are text; drawn answers (1c, 2b, 3a, 8b–c) and the
// free-response algorithm (8d) are multiple choice or fill-in. Left out: Q0, 4(c) (0 points) and 7(e), where staff
// accepted every choice and graded only the explanation.
import { exam, problem, text, java, txt, blank, mc, sata } from '../../../content/author.mjs';
import { site } from '../staff.mjs';

const E = '61b-sp17-mt2';
const note = (x, o = {}) => ({ x, ...o });
const NSA = ['Never', 'Sometimes', 'Always'];
const G = ['α', 'β', 'π', 'δ', 'ε', 'θ', 'ω'];
const STR = ['ulg', 'ulgometh', 'grigometh', 'ulgo', 'grigo', 'meth', 'ometh'];
const T = ['Θ(1)', 'Θ(log N)', 'Θ(N)', 'Θ(N log N)'];
const list = s => [s, s.replace(/,/g, '')];
const RX = site('REGEX'), HP = site('HEAPS', 'TREE_TRAVERSALS'), HL = site('HASHING', 'RED_BLACK_TREES');

export default exam(E, 'Spring 2017 Midterm 2', {
  exam: 'https://drive.google.com/file/d/1yWyRp7QTizspTp9dsKz5yxE6bSf9YUIi/view',
  sol: 'https://drive.google.com/file/d/1b99XARlZxg3NMfeSAVt2yzDzwSEcASq3/view',
}, 'sp17-mt2', [
  problem('1', 'Traversin (11.5 pts)', null, [
    text('(a) For the undirected graph below, give traversals starting from vertex 9, breaking ties in numerical order. The BFS order is the order in which vertices are enqueued.'),
    txt(`
9 — 0    9 — 1    9 — 2    9 — 6    9 — 7
1 — 6    6 — 5    2 — 5    5 — 7`),
    blank(1, '(a) DFS preorder', list('9, 0, 1, 6, 5, 2, 7'), site('GRAPH_TRAVERSALS')),
    blank(2, '(a) DFS postorder', list('0, 2, 7, 5, 6, 1, 9'), site('GRAPH_TRAVERSALS')),
    blank(3, '(a) BFS order', list('9, 0, 1, 2, 6, 7, 5'), site('GRAPH_TRAVERSALS')),
    text('(b) A min heap holds 7 unique items. For each traversal, if we print each node when we visit it, do we get the values in increasing order?'),
    mc(4, '(b) Preorder', NSA, 1, HP),
    mc(5, '(b) Inorder', NSA, 0, { ...HP, ...note('The root (the minimum) is printed after its left subtree, which isn’t empty with 7 items.') }),
    mc(6, '(b) Postorder', NSA, 0, { ...HP, ...note('The root comes last.') }),
    mc(7, '(b) Level order', NSA, 1, HP),
    mc(8, '(c) Is there a tree with 5 unique values whose preorder traversal is the reverse of its inorder traversal?', ['Yes: any tree where every node has only a left child', 'Yes: any tree where every node has only a right child', 'Yes: a complete tree', 'Impossible'], 0, { ...site('TREE_TRAVERSALS'),
      ...note('With only left children, preorder goes top to bottom and inorder bottom to top.') }),
  ]),
  problem('2', 'An Operational Understanding (15.2 pts)', null, [
    text('(a) In the tree below, Greek letters are unique numerical values. Select all values that might match each description. For BSTs, left items are smaller. When treating the tree as a graph, assume nothing about the order of adjacency lists.'),
    txt(`
         α
       /   \\
      β     π
     / \\   / \\
    δ   ε θ   ω`),
    sata(9, 'MinHeap, largest item', G, [3, 4, 5, 6], site('HEAPS')),
    sata(10, 'MinHeap, smallest item', G, [0], site('HEAPS')),
    sata(11, 'BST, largest item', G, [6], site('BSTS')),
    sata(12, 'BST, smallest item', G, [3], site('BSTS')),
    sata(13, 'MinHeap, median item', G, [1, 2, 3, 4, 5, 6], { ...site('HEAPS'), ...note('Only the root is ruled out; the median has 3 smaller items, which β’s or π’s side can hold.') }),
    sata(14, 'BST, median item', G, [0], site('BSTS')),
    sata(15, 'MinHeap, new root after deleteMin', G, [1, 2], { ...site('HEAPS'), ...note('The smaller of the root’s children rises to the top.') }),
    sata(16, 'BST, new root after Hibbard deletion of α', G, [4, 5], { ...site('BSTS'), ...note('Its predecessor ε or its successor θ.') }),
    sata(17, 'MinHeap, root after inserting a new item φ', [...G, 'φ'], [0, 7], site('HEAPS')),
    sata(18, 'BST, root after inserting a new item φ', [...G, 'φ'], [0], site('BSTS')),
    sata(19, 'Last item dequeued running BFS from ω', G, [3, 4], { ...site('GRAPH_TRAVERSALS'), ...note('δ and ε are the farthest from ω (4 edges), in either order.') }),
    text('(b) A hash map (as in lecture) maps a year to a famous person born that year. A year’s hash code is the sum of its first and last digits, e.g. hashCode(1569) = 10. There are 4 buckets, each a list, new items go at the end, and there is no resizing. We put, in order: 1569 / Jahangir, 155 / Cao, 1107 / Dandolo, 1737 / Paine, 713 / Stephen, 1048 / Khayyam, 1737 / Hancock.',
      'Write each bucket’s entries in order as year name, separated by commas, e.g. 1569 Jahangir, 155 Cao; write [] if empty.'),
    blank(20, '(b) Bucket 0', ['1107 Dandolo, 1737 Hancock', '1107, Dandolo, 1737, Hancock'], site('HASHING')),
    blank(21, '(b) Bucket 1', ['1048 Khayyam', '1048, Khayyam'], site('HASHING')),
    blank(22, '(b) Bucket 2', ['1569 Jahangir, 155 Cao, 713 Stephen', '1569, Jahangir, 155, Cao, 713, Stephen'], site('HASHING')),
    blank(23, '(b) Bucket 3', ['[]', 'empty'], { ...site('HASHING'), ...note('Hash codes 10, 6, 8, 8, 10, 9 → buckets 2, 2, 0, 0, 2, 1. The second 1737 replaces Paine with Hancock.') }),
  ]),
  problem('3', 'Weighted Quick Union (12 pts)', null, [
    text('(a) Could connect(a, b) calls on a weighted quick union (all items starting disconnected) produce each forest? In a tie, the left argument’s root goes below the right argument’s root. Trees are written root(children).'),
    txt(`
Forest 1:  0   4   5(3(2))   1   6
Forest 2:  1   0(4, 2, 6, 3(5))`),
    mc(24, '(a) Forest 1', ['Possible', 'Impossible'], 1, { ...site('DISJOINT_SETS'), ...note('A WQU tree of height 2 needs at least 4 items; 5’s tree has 3.') }),
    mc(25, '(a) Forest 2', ['Possible', 'Impossible'], 0, { ...site('DISJOINT_SETS'), ...note('connect(2, 0), connect(4, 0), connect(5, 3), connect(3, 0), connect(6, 0).') }),
    sata(26, '(b) We add undo(a, b), which undoes an earlier connect(a, b) (and does nothing if there was none). For which implementations is undo impossible without adding instance variables?', ['Quick Union', 'Quick Find', 'Weighted Quick Union', 'WQU with Path Compression'], [0, 1, 2, 3], { ...site('DISJOINT_SETS'),
      ...note('None of them remembers which connect calls made the current structure.') }),
    text('(c) Suppose we solve disjoint sets with a graph: an adjacency list with no duplicates, connect uses addEdge, and isConnected uses DFS with a marked array that stops early once a connection is found. N is the number of nodes and M the total number of connect and isConnected calls so far.'),
    mc(27, '(c) Worst-case runtime of a single connect(a, b)', ['Θ(1)', 'Θ(log N)', 'Θ(log M)', 'Θ(N)', 'Θ(M)', 'Θ(N + M)', 'Θ(NM)'], 3, { ...site('DISJOINT_SETS', 'GRAPH_REPRESENTATIONS'), also: [4, 5],
      ...note('Checking for a duplicate edge scans an adjacency list. Staff accepted Θ(N), Θ(M) and Θ(N + M), since “worst case” was ambiguous.') }),
    mc(28, '(c) Worst-case runtime of a single isConnected(a, b)', ['Θ(1)', 'Θ(log N)', 'Θ(log M)', 'Θ(N)', 'Θ(M)', 'Θ(N + M)', 'Θ(NM)'], 5, { ...site('DISJOINT_SETS', 'GRAPH_TRAVERSALS'), also: [3, 4],
      ...note('DFS is Θ(V + E); staff accepted Θ(N), Θ(M) and Θ(N + M).') }),
  ]),
  problem('4', 'Asymptotics (20 pts)', null, [
    text('(a) Fill in each loop’s update so the function has the desired runtime (no commas; write impossible if it can’t be done).'),
    java(`
public static void f1(int N) { // desired runtime: Θ(N)
    for (int i = 1; i < N; ⟪a⟫) { System.out.println("hi"); }
}

public static void f2(int N) { // desired runtime Θ(log N)
    for (int i = 1; i < N; ⟪b⟫) { System.out.println("hi"); }
}

public static void f3(int N) { // desired runtime Θ(1)
    for (int i = 1; i < N; ⟪c⟫) { System.out.println("hi"); }
}`, { a: 'i += 1', b: 'i *= 2', c: 'i += N' }),
    blank(29, '(a) f1', ['i += 1', 'i++', 'i = i + 1', 'i += 2'], site('ASYMPTOTICS')),
    blank(30, '(a) f2', ['i *= 2', 'i = i * 2', 'i *= 3'], site('ASYMPTOTICS')),
    blank(31, '(a) f3', ['i += N', 'i = N', 'i *= N', 'i = i + N'], site('ASYMPTOTICS')),
    text('(b) Give the runtime of each function, in Θ or O notation as requested.'),
    java(`
public static void f4(int N) {
    if (N == 0) { return; }
    f4(N / 2);
    f4(N / 2);
    f4(N / 2);
    f4(N / 2);
    g(N); // runs in Θ(N²) time
}

public static void f5(int N, int M) {
    if (N < 10) { return; }
    for (int i = 0; i <= N % 10; i++) {
        f5(N / 10, M / 10);
        System.out.println(M);
    }
}`),
    mc(32, '(b) f4, in Θ notation', ['Θ(N²)', 'Θ(N² log N)', 'Θ(N³)', 'Θ(N⁴)'], 1, { ...site('ASYMPTOTICS', 'RECURSION'), ...note('Each level does N² total work (4× the calls, each a quarter as much), for log N levels.') }),
    mc(33, '(b) f5, as tight an O bound as possible', ['O(log N)', 'O(N)', 'O(N log N)', 'O(N^NM!)'], 1, { ...site('ASYMPTOTICS', 'RECURSION'),
      ...note('Each call makes at most 10 calls on N/10, so the call tree has at most about N nodes.') }),
    text('(d) Timing experiments for assignPupJobs(List<Puppy> puppies, List<Job> jobs), where N is the number of puppies and M the number of jobs:'),
    txt(`
N      M     R(N, M)
100    10    0.05 sec
500    10    0.08 sec
1000   10    0.13 sec
100    50    3.1 sec
500    50    15.5 sec
1000   50    30.5 sec
100    100   24.9 sec
500    100   125.1 sec
1000   100   251.9 sec`),
    text('Assume the runtime has the form ~a·N^b1·M^b2, with a ≈ 251.9 / (1000^b1 × 100^b2). Round to integer exponents.'),
    blank(34, '(d) b1', '1', site('ASYMPTOTICS')),
    blank(35, '(d) b2', '3', { ...site('ASYMPTOTICS'), ...note('Doubling N (500 → 1000) doubles the time; doubling M (50 → 100) multiplies it by about 8.') }),
  ]),
  problem('5', 'Regex (5.25 pts)', null, [
    text('For each regular expression, select every string it matches (the whole string must match).'),
    sata(36, 'ulg', STR, [0], RX),
    sata(37, '(ulgo|grigo)meth', STR, [1, 2], RX),
    sata(38, 'ulgo|grigometh', STR, [2, 3], { ...RX, ...note('| has the lowest precedence: it’s ulgo, or grigometh.') }),
    sata(39, '((ulgo)|(grigo))meth', STR, [1, 2], RX),
    sata(40, '(ulgo|grigo)*meth', STR, [1, 2, 5], { ...RX, ...note('* allows zero repetitions, so meth alone matches.') }),
    sata(41, '(u|l|g)*ometh', STR, [1, 6], RX),
    sata(42, '(ulg)*ometh', STR, [1, 6], RX),
  ]),
  problem('6', 'Bipartite Graphs (12.5 pts)', null, [
    text('(a) A graph is bipartite if every vertex can be colored blue or green so that no edge joins two vertices of the same color.'),
    txt(`
Graph 1:  0—1  1—2  0—3  1—4  2—5  3—4  4—5  3—6  5—6
Graph 2:  0—1  1—2  0—3  1—4  3—4  2—5  2—6  4—5  5—6`),
    mc(43, '(a) Graph 1', ['Bipartite', 'Not bipartite'], 0, site('GRAPH_TRAVERSALS')),
    mc(44, '(a) Graph 2', ['Bipartite', 'Not bipartite'], 1, { ...site('GRAPH_TRAVERSALS'), ...note('2, 5 and 6 form a triangle, an odd cycle.') }),
    text('(b) Using the undirected Graph API (Graph(int V), addEdge(int v, int w), Iterable<Integer> adj(int v), V(), E()), fill in twocolor so that it puts the blue vertices in blue, or throws an exception if no coloring exists.'),
    java(`
HashSet<Integer> blue = new HashSet<Integer>();
HashSet<Integer> green = new HashSet<Integer>();
twocolor(G, 0, blue, green);
System.out.println("Blue vertices are: " + blue.toString());

public static void twocolor(Graph G, int v, Set<Integer> a, Set<Integer> b) {
    ⟪a⟫;
    for (⟪b⟫) {
        if (⟪c⟫) {
            throw new IllegalArgumentException("graph is not bipartite"); }
        if (⟪d⟫) {
            ⟪e⟫;
        }
    }
}`, { a: 'a.add(v)', b: 'int u : G.adj(v)', c: 'a.contains(u)', d: '!b.contains(u)', e: 'twocolor(G, u, b, a)' }),
    blank(45, '(b) First line', 'a.add(v)', site('GRAPH_TRAVERSALS', 'RECURSION')),
    blank(46, '(b) The loop header', ['int u : G.adj(v)', 'Integer u : G.adj(v)'], site('GRAPH_TRAVERSALS', 'RECURSION')),
    blank(47, '(b) Throw if (____)', 'a.contains(u)', site('GRAPH_TRAVERSALS', 'RECURSION')),
    blank(48, '(b) Recurse if (____)', '!b.contains(u)', site('GRAPH_TRAVERSALS', 'RECURSION')),
    blank(49, '(b) The recursive call', 'twocolor(G, u, b, a)', { ...site('GRAPH_TRAVERSALS', 'RECURSION'),
      ...note('Color v with a’s color; a neighbor already in a means two adjacent vertices share a color. Uncolored neighbors get the other color: swap a and b when recursing.') }),
  ]),
  problem('7', 'Trees and Hashing (18 pts)', null, [
    text('(a) An LLRBBucketHashSet stores each hash table bucket as a left-leaning red-black tree. It doubles its buckets when the load factor exceeds 2 and never shrinks; hashCode is constant time. Don’t assume the hash codes spread items out. With N items and M buckets, give each single operation’s runtime.'),
    mc(50, '(a) put: worst case', ['Θ(1)', 'Θ(log N)', 'Θ(N)', 'Θ(N log N)'], 3, { ...HL, ...note('A put can trigger a resize, which reinserts N items into LLRBs that may all be the same bucket.') }),
    mc(51, '(a) containsKey: worst case', T, 1, HL),
    mc(52, '(a) remove: worst case', T, 1, { ...HL, ...note('All three operations are Θ(1) in the best case.') }),
    mc(53, '(b) An LLRBBucketNoResizeHashSet is the same but never adds buckets. What is the worst case of put, containsKey and remove?', T, 1, HL),
    mc(54, '(c) Starting from an empty LLRBBucketHashSet, after Q insertions with nicely spread hash codes, what is the amortized time per put?', ['O(1)', 'O(log Q)', 'O(log (Q / M))', 'O(Q)'], 0, HL),
    mc(55, '(d) Same question for an LLRBBucketNoResizeHashSet.', ['O(1)', 'O(log Q)', 'O(log (Q / M))', 'O(Q)'], 2, { ...HL, ...note('Each of the M buckets holds about Q / M items.') }),
    mc(56, '(f) To implement LLRBBucketHashSet using the textbook’s RedBlackBST.java, which approach is better?', ['Extension (extending RedBlackBST)', 'Delegation (instance variables that include a RedBlackBST)', 'Either is appropriate'], 1, { ...site('HASHING', 'INHERITANCE'),
      ...note('A hash set has many trees (one per bucket); it isn’t itself a tree.') }),
  ]),
  problem('8', 'Xelha (25 pts)', null, [
    text('A XelhaTree for a list of numbers X has the min-heap property (every value ≤ its children), and its in-order traversal visits the values in the list’s order. It need not be complete, and may contain duplicates. For example, for [9, 3, 7, 15, 1, 8, 12] one XelhaTree is 1(3(9, 7(-, 15)), 8(-, 12)). Trees are written value(left, right).'),
    sata(57, '(a) Which are valid XelhaTrees for their sequences?', ['[9, 3, 7, 15, 1, 8, 12]: 1(3(9, 7(-, 15)), 8(-, 12))', '[4, 3, 6, 5, 8, 7, 9]: 3(4, 5(6, 7(8, 9)))', '[1, 2, 2, 2]: 1(-, 2(-, 2(-, 2)))'], [0, 1, 2], site('HEAPS', 'TREE_TRAVERSALS')),
    mc(58, '(b) Which is a valid XelhaTree for [8, 3, 9, 1]?', ['1(3(8, 9), -)', '1(-, 3(8, 9))', '3(8, 1(9, -))', '1(8, 3(-, 9))'], 0, site('HEAPS', 'TREE_TRAVERSALS')),
    mc(59, '(c) Which is a valid XelhaTree for [13, 7, 2, 1, 5, 16, 8, 9]?', ['1(2(7(13, -), -), 5(-, 8(16, 9)))', '1(2(7, 13), 5(8(16, -), 9))', '1(7(13, 2), 5(-, 8(16, 9)))', '2(7(13, -), 1(-, 5(-, 8(16, 9))))'], 0, { ...site('HEAPS', 'TREE_TRAVERSALS'),
      ...note('The minimum (1) must be the root, with everything before it on the left and after it on the right; repeat within each side.') }),
    mc(60, '(d) For full credit, an algorithm for building a XelhaTree had to run faster than Θ(N²) in the worst case. Which works in Θ(N)?', [
      'Scan the list once, keeping the path of nodes down the tree’s right side on a stack: pop while the new value is smaller than the top, make the last popped node the new node’s left child, and attach the new node as the right child of what remains on top (or as the root).',
      'Find the minimum, make it the root, and recurse on the parts of the list to its left and right.',
      'Sort the list, then insert each value into a BST in sorted order.',
      'Insert every value into a min-heap, then read the heap’s array in order.'], 0, { ...site('HEAPS', 'TREE_TRAVERSALS'),
      ...note('Each node is pushed and popped at most once, so it’s linear. The recursive-minimum approach is correct but Θ(N²) in the worst case (it got partial credit).') }),
  ]),
]);
