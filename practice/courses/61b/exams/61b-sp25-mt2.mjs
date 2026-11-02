// Spring 2025 Midterm 2 (Wed 4/2/2025), transcribed from the official solutions.
// Changed for this site, and said so on the page: the LLRB fill-in table (2a) is asked as three questions; the
// hashing explanations (5) ask only for the verdict (the explanation is in the answer note); the asymptotics sets (4)
// are True/False without the exam's Decline option and scoring. Left out: the last page (0 points).
import { exam, problem, text, java, txt, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-sp25-mt2', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });
const TF = ['True', 'False'];
// Accepted ways to write a sequence of LLRB operations: one per line or comma-separated, either capitalization.
const ops = (...o) => [o, o.map(x => x[0].toUpperCase() + x.slice(1))].flatMap(v => [v.join(', '), v.join('\n'), v.join(' ')]);
const RUNTIMES = ['Θ(1)', 'Θ(log N)', 'Θ(N)', 'Θ(N log N)', 'Θ(N²)'];

export default exam(E, 'Spring 2025 Midterm 2', {
  exam: 'https://drive.google.com/file/d/1a-L-UCn4U9to9Y8kd97naxEWF37SOHmF/view',
  sol: 'https://drive.google.com/file/d/1ZbLHbJlE_6zsEq1ined1AeALRwey5r4D/view',
}, 'sp25-mt2', [
  problem('1', 'Potpourri (16.0 pts)', null, [
    mc(1, '(a) True/False: All valid Left-Leaning Red-Black Trees have the same number of black links along every root-to-leaf path.', TF, 0, { ...S('1a'),
      ...note('This follows from the one-to-one correspondence with 2-3 trees, whose leaves are all at the same depth.') }),
    mc(2, '(b) True/False: If a binary search tree has its edges colored red/black such that the number of black links along every root-to-leaf path is the same, then it is a valid Left-Leaning Red-Black Tree.', TF, 1, { ...S('1b'),
      ...note('Color every edge of a big tree red: every path has 0 black links, but it isn’t a valid LLRB.') }),
    mc(3, '(c) True/False: If all edges in an undirected, connected graph have the same weight, any spanning tree of the graph is a valid Minimum Spanning Tree.', TF, 0, { ...S('1c'),
      ...note('Every spanning tree has exactly N − 1 edges, so they all have the same total weight.') }),
    mc(4, '(d) True/False: While running Kruskal’s algorithm, we multiply all edge weights of an undirected, connected graph by −1 before inserting them into the heap. The resulting spanning tree will be a Maximum Spanning Tree of the original graph.', TF, 0, { ...S('1d'),
      ...note('Kruskal’s then takes the largest original edges first, which satisfies the maximum version of the cut property.') }),
    mc(5, '(e) True/False: Let G be an undirected, connected graph with a unique Minimum Spanning Tree, and let C be a cut of G with more than one crossing edge. The edge with the maximum weight across C is never included in the resulting Minimum Spanning Tree.', TF, 1, { ...S('1e'),
      ...note('If G is itself a tree, its MST uses every edge, including the heaviest edge across any cut.') }),
    mc(6, '(f) True/False: In Quick Find, the isConnected operation has a runtime of O(1).', TF, 0, { ...S('1f'),
      ...note('Quick Find stores each item’s set id, so isConnected just compares two values.') }),
    mc(7, '(g) What is the fewest number of edges in an undirected graph with N vertices and exactly 3 connected components?', ['1 edge', '2 edges', '3 edges', '4 edges', 'N − 1 edges', 'N − 2 edges', 'N − 3 edges', 'None of the above'], 6, { ...S('1g'),
      ...note('Each edge joins at most two components, so going from N components to 3 takes at least N − 3 edges.') }),
    text('For (h) and (i), consider a modified heap where, instead of a resizing array, elements are stored in a circular doubly-linked list with a sentinel.'),
    mc(8, '(h) What is the best-case runtime for removeMin in this heap, assuming the heap contains N elements?', ['Θ(1)', 'Θ(log(N))', 'Θ(N)', 'Θ(N log(N))', 'Θ(N²)', 'None of the above'], 0, { ...S('1h'),
      ...note('Move the last item (next to the sentinel) to the front; in the best case it’s already no larger than its children, so nothing sinks.') }),
    mc(9, '(i) What is the best-case runtime for insert in this heap, assuming the heap contains N elements?', ['Θ(1)', 'Θ(log(N))', 'Θ(N)', 'Θ(N log(N))', 'Θ(N²)', 'None of the above'], 2, { ...S('1i'),
      ...note('After adding at the end, the new item must be compared with its parent, which is about N/2 positions away in a linked list: Θ(N) even when no swap is needed.') }),
    sata(10, '(j) Which of the following is true about the array [-, 0, 0, 2, 5, 0, 7, 5]? Select all that apply.', ['The array is a valid backing array of a max-heap.', 'The array is a valid backing array of a min-heap.', 'If the - is replaced with −8, the array is a valid backing array of a Weighted Quick Union without path compression.', 'If the - is replaced with −8, the array is a valid backing array of a Weighted Quick Union with path compression.', 'None of the above'], [1, 2, 3], { ...S('1j'),
      ...note('Check each separately. Every parent is ≤ its children, so it’s a min-heap. Every valid path-compressed WQU is also a valid WQU without path compression (connect roots and never compress).') }),
    sata(11, '(k) Suppose a binary search tree contains the elements {1, 2, 3, 4, 5, 6, 7, 8}, with the root containing 7. After deleting the root node using Hibbard deletion, which nodes could possibly be the new root? Select all that apply.', ['1', '2', '3', '4', '5', '6', '8', 'None of the above'], [5, 6], { ...S('1k'),
      ...note('Hibbard deletion replaces the root with its predecessor (6) or successor (8), whatever the tree’s shape.') }),
    mc(12, '(l) Given the backing array parents of a Weighted Quick Union, which of these returns the size of the largest connected component?', ['min(parents)', 'max(parents)', 'max(parents) * -1', 'min(parents) * -1', 'None of the above'], 3, { ...S('1l'),
      ...note('Roots store −size, so the most negative entry belongs to the largest component; negate it.') }),
  ]),
  problem('2', 'LLRB (14.0 pts)', null, [
    text('(a) Convert the 2-3 tree below into its corresponding Left-Leaning Red-Black Tree. (The exam had a fill-in table for every node; this site asks about the result in three parts.)'),
    txt(`
          [10 50]
        /    |    \\
     [5]  [20 30]  [55 60]`),
    mc(13, '(a) Which value is at the root of the LLRB?', ['5', '10', '20', '30', '50', '55', '60'], 4, S('2a')),
    sata(14, '(a) Which values are in red nodes (the link to their parent is red)?', ['5', '10', '20', '30', '50', '55', '60'], [1, 2, 5], S('2a')),
    mc(15, '(a) Which value is the left child of 30?', ['None', '5', '10', '20', '55', '60'], 3, { ...S('2a'),
      ...note('Each 3-node splits into a black node with a red left child: [10 50] becomes 50 with red child 10; [20 30] becomes 30 with red child 20; [55 60] becomes 60 with red child 55. So the LLRB is 50 → (10 red → (5, 30 → (20 red))), 60 → (55 red).') }),
    text('The trees below are LLRBs immediately after a new element has been added, but before any invariant-fixing operations. For each, write the sequence of operations (e.g. rotateLeft(A), rotateRight(B), colorFlip(C)) needed to fix all invariants. If it is impossible to have created the LLRB by adding a single new element, write “Not possible”. The letters are placeholders. (Each red link is labeled red; the others are black.)'),
    txt(`
(b)       C
         / red
        A
         \\ red
          B`),
    blank(16, '(b) Operations', ops('rotateLeft(A)', 'rotateRight(C)', 'colorFlip(B)'), { ...S('2b'),
      ...note('A’s right-leaning red link needs rotateLeft(A), leaving two left-leaning reds (C, B, A), so rotateRight(C); B then has two red children, so colorFlip(B).') }),
    txt(`
(c)            D
        red  /   \\
            B     F
           / \\   / \\  (both red)
          A   C E   G`),
    blank(17, '(c) Operations', ops('colorFlip(F)', 'colorFlip(D)'), { ...S('2c'),
      ...note('F has two red children: colorFlip(F) makes F–D red, so D now has two red children: colorFlip(D).') }),
    txt(`
(d)            D
        red  /   \\
            B     F
       red / \\   / \\
          A   C E   G
               red`),
    text('(In (d), D–B, B–A and F–E are red; the other links are black.)'),
    blank(18, '(d) Operations', ['Not possible', 'not possible', 'Impossible', 'impossible'], { ...S('2d'),
      ...note('Its root-to-null paths have 1, 2 and 3 black links, which can’t happen right after a single insertion into a valid LLRB.') }),
  ]),
  problem('3', 'Anirudh’s Weighted Question (31.0 pts)', null, [
    text('Anirudh the Adventurer wants to find a treasure hidden on one of N islands. In the secret library of Stella the Sneaky Sorceress, many scrolls each represent a map of the N islands: an array of N numbers that is a Quick Union with a single root. For example, for N = 5, one possible array is [1, 2, 3, −5, 0].',
      'All of the Quick Union trees are valid, but only one is a valid Weighted Quick Union (without path compression): the real map. A valid WQU means the array can be created by a sequence of union operations (under some tie-breaking scheme). For example, [1, 2, 3, −5, 0] is a valid QU, but not a valid WQU.',
      'To find the real map, Anirudh converts each array into a TreasureMap, a linked structure whose nested Island class is a node that keeps track of its children, and then calls isValid on it.'),
    java(`
public class TreasureMap {
    private Island root;

    private class Island {
        public int label;
        public List<Island> children;

        public Island(int label) {
            this.label = label;
            this.children = new ArrayList<>();
        }
    }

    // Converts the array representation of a QuickUnion into a TreasureMap.
    public TreasureMap(int[] qu) {
        Island[] isles = new Island[qu.length];
        for (int i = 0; i < qu.length; i++) {
            isles[i] = new Island(i);
        }
        for (int i = 0; ⟪a⟫; ⟪b⟫) {
            int parent = qu[i];
            if (⟪c⟫) {
                ⟪d⟫;
            } else {
                ⟪e⟫;
            }
        }
    }
}`, { a: 'i < qu.length', b: 'i++', c: 'parent < 0', d: 'root = isles[i]', e: 'isles[parent].children.add(isles[i])' }),
    text('(a) Complete the constructor, which receives the backing array of a Quick Union with exactly one root.'),
    blank(19, '(a) The loop condition', 'i < qu.length', S('3a')),
    blank(20, '(a) The loop update', ['i++', 'i += 1', 'i = i + 1', '++i'], S('3a')),
    blank(21, '(a) if (____)', ['parent < 0', 'parent <= -1', '0 > parent'], S('3a')),
    blank(22, '(a) If it’s the root', 'root = isles[i]', S('3a')),
    blank(23, '(a) Otherwise', 'isles[parent].children.add(isles[i])', { ...S('3a'),
      ...note('A negative entry marks the root. Every other island is added to its parent’s children.') }),
    mc(24, '(b) What is the best-case runtime of the constructor, in terms of N, the number of islands?', RUNTIMES, 2, S('3b')),
    mc(25, '(b) What is its worst-case runtime?', RUNTIMES, 2, { ...S('3b'),
      ...note('Two passes over N islands, each step constant time, with no early exit.') }),
    text('(c) Two of the trees below are invalid WQUs, and one is valid. Which tree is valid?'),
    txt(`
Tree 1:        0
              / \\
             1   2
            / \\
           3   4

Tree 2:        0
           /   |   \\
          1    2    3
         / \\       / \\
        4   5     6   7

Tree 3:          0
          /   /     \\    \\
         1   2       8    3
        / \\              / \\
       4   5            6   7`),
    mc(26, '(c) Which tree is a valid WQU?', ['Tree 1', 'Tree 2', 'Tree 3'], 2, { ...S('3c'),
      ...note('Tree 3: union (1, 4), (1, 5), (3, 6), (3, 7), (0, 2), (0, 8), (0, 1), (0, 3). In Trees 1 and 2, 0 can never get big enough to become the parent of its larger subtrees.') }),
    mc(27, '(d) True/False: Consider a WQU where node A is a parent of node B, and node B is a parent of node C. Node C must have been connected to node B before node B was connected to node A.', TF, 0, { ...S('3d'),
      ...note('Once B is connected under A, B is no longer a root, and unions only ever attach roots, so C could never become B’s direct child afterwards.') }),
    text('(e) Complete isValid, which determines whether the TreasureMap corresponds to a valid Weighted Quick Union, and its size helper, which returns −1 if parent’s subtree is not a valid WQU and otherwise the number of nodes in it. Your solution must run in O(N log N) time. (Staff considered this significantly harder than the rest of the exam.)'),
    java(`
public boolean isValid() {
    ⟪f⟫;
}

private int size(Island parent) {
    int currSize = 1;
    ⟪g⟫ childSizes = new ⟪h⟫;
    for (⟪i⟫) {
        ⟪j⟫;
    }
    while (⟪k⟫) {
        ⟪l⟫;
        if (⟪m⟫) {
            return -1; // Not a valid WQU
        }
        ⟪n⟫;
    }
    return ⟪o⟫;
}`, { f: 'return size(root) != -1', g: 'PriorityQueue<Integer>', h: 'PriorityQueue<>()', i: 'Island child : parent.children', j: 'childSizes.add(size(child))', k: '!childSizes.isEmpty()', l: 'int smallest = childSizes.removeMin()', m: 'smallest == -1 || smallest > currSize', n: 'currSize += smallest', o: 'currSize' }),
    blank(28, '(e) The body of isValid', ['return size(root) != -1', 'return -1 != size(root)'], S('3e')),
    blank(29, '(e) The type of childSizes', ['PriorityQueue<Integer>', 'MinPQ<Integer>'], S('3e')),
    blank(30, '(e) childSizes = new ____', 'PriorityQueue<>()', S('3e')),
    blank(31, '(e) The for loop’s header', 'Island child : parent.children', S('3e')),
    blank(32, '(e) Inside the for loop', 'childSizes.add(size(child))', S('3e')),
    blank(33, '(e) while (____)', ['!childSizes.isEmpty()', 'childSizes.size() > 0', 'childSizes.size() != 0'], S('3e')),
    blank(34, '(e) First line of the while loop', 'int smallest = childSizes.removeMin()', S('3e')),
    blank(35, '(e) if (____) return -1', ['smallest == -1 || smallest > currSize', 'smallest > currSize || smallest == -1', 'smallest < 0 || smallest > currSize', 'smallest > currSize || smallest < 0'], S('3e')),
    blank(36, '(e) Last line of the while loop', ['currSize += smallest', 'currSize = currSize + smallest', 'currSize = smallest + currSize'], S('3e')),
    blank(37, '(e) size returns', 'currSize', { ...S('3e'),
      ...note('Build each subtree bottom-up: compute every child’s size, then union them into the parent smallest first. A child subtree can join only if it isn’t larger than the tree built so far (in a WQU the larger root wins). Any invalid subtree makes the whole tree invalid.') }),
  ]),
  problem('4', 'Asymptotics (16.0 pts)', null, [
    text('For each statement, decide whether it is always true, or sometimes false. (The exam also offered “Decline”, scoring +2 per correct answer and −3 per incorrect one.)',
      'Set I: Let f and g be real-valued, positive, strictly increasing functions.'),
    mc(38, '(a) If f(x) ∈ O(g(x)), then f(10¹⁰⁰) ≤ g(10¹⁰⁰).', TF, 1, { ...S('4 Set I (a-e)'),
      ...note('O bounds only hold for large enough x, and 10¹⁰⁰ may not be large enough: f(x) = 1000 and g(x) = log₁₀(x) have f > g for all x < 10¹⁰⁰⁰.') }),
    mc(39, '(b) If f(x) and g(x) are the best- and worst-case runtimes of a program, respectively, then f(x) ∈ O(g(x)).', TF, 0, { ...S('4 Set I (a-e)'),
      ...note('By definition f(x) ≤ g(x) for all x, so f(x) ≤ 1·g(x).') }),
    mc(40, '(c) For all functions f(x), there exists some function g(x) ≠ f(x) such that f(x) ∈ Θ(g(x)).', TF, 0, { ...S('4 Set I (a-e)'),
      ...note('Take g(x) = 2f(x). It equals f only where f(x) = 0, which a positive function never is.') }),
    mc(41, '(d) If f(x) ∈ Θ(g(x)), then f⁻¹(x) ∈ Θ(g⁻¹(x)), where f⁻¹ is the inverse function of f.', TF, 1, { ...S('4 Set I (a-e)'),
      ...note('f(x) = log₂(x) and g(x) = log₃(x) differ by a constant factor, but their inverses 2ˣ and 3ˣ have ratio 1.5ˣ, which grows without bound.') }),
    mc(42, '(e) If a program uses O(log(N)) memory in total (including inputs, local variables, and recursive function calls), then its worst-case runtime is O(Nᵏ) for some constant k.', TF, 1, { ...S('4 Set I (a-e)'),
      ...note('while (true) {} uses constant memory and never finishes. (It is true if the program must terminate.)') }),
    text('Set II'),
    mc(43, '(a) Σᵢ₌₁ᴺ i² ∈ Θ(Σᵢ₌₁^(N²) i)', TF, 1, { ...S('4 Set II (a-e)'), ...note('The first sum is Θ(N³), the second Θ(N⁴).') }),
    mc(44, '(b) Σᵢ₌₁ᴺ log₁₀(i) ∈ Ω(Σᵢ₌₁ᴺ log₂(i))', TF, 0, { ...S('4 Set II (a-e)'), ...note('log₂(x) = log₂(10) · log₁₀(x), so the sums differ by a constant factor.') }),
    mc(45, '(c) N³ ∈ Θ((N + 1)³)', TF, 0, { ...S('4 Set II (a-e)'), ...note('(N + 1)³ = N³ + 3N² + 3N + 1, which is Θ(N³).') }),
    mc(46, '(d) log(N) ∈ O(N^0.0001)', TF, 0, { ...S('4 Set II (a-e)'), ...note('Any positive power of N eventually grows faster than log N.') }),
    mc(47, '(e) N! ∈ Θ((N + 1)!)', TF, 1, { ...S('4 Set II (a-e)'), ...note('Their ratio is N + 1, which grows without bound.') }),
  ]),
  problem('5', 'Hashing (12.0 pts)', null, [
    text('Putting mutable objects in a hash table is dangerous, even if the hashCode doesn’t change when an object is mutated: no hashCode can guarantee both efficiency and correctness for mutable objects.',
      'For each proposed hashCode for a List<Integer>, decide whether its flaw is invalidity (the hash table may behave incorrectly) or inefficiency (it works correctly, but may be slow). Two Lists are equal if they have the same items in the same order. (The exam also asked for an example or explanation; compare yours with the answer note.)'),
    mc(48, '(a) Use the memory address of the List as its hashCode, which doesn’t change when the List is mutated.', ['Invalidity', 'Inefficiency'], 0, { ...S('5a'),
      ...note('Two equal Lists at different addresses get different hash codes, so they can land in different buckets and both be added.') }),
    mc(49, '(b) Have hashCode always return 0.', ['Invalidity', 'Inefficiency'], 1, { ...S('5b'),
      ...note('Every item lands in the same bucket, so operations take linear time.') }),
    mc(50, '(c) Add a cachedHash attribute to the List class. The first time hashCode is called, compute List<Integer>’s normal hashCode and save it in cachedHash; every later call returns cachedHash, even if the list has been mutated.', ['Invalidity', 'Inefficiency'], 0, { ...S('5c'),
      ...note('Insert a = [1, 2], then mutate it to [1, 2, 3], then insert b = [1, 2, 3]. a keeps its old hash, so b may go to a different bucket and the set can end up with two copies of [1, 2, 3].') }),
  ]),
  problem('6', 'Math Graphs (11.0 pts)', null, [
    text('Aditya has created Math Graphs to represent short arithmetic calculations. Each node contains a number, and each edge contains an arithmetic operation (addition, subtraction, multiplication, and floor division). A Math Path is a simple path in a Math Graph, and its value is the result of computing the expression along it, in path order with no precedence. For example, the path 8 →(+) 5 →(×) 3 →(−) 9 has value ((8 + 5) × 3) − 9 = 30.'),
    txt(`
(a)  7 →(−) 2      7 →(+) 6      7 →(×) 8
     2 →(÷) 1      2 →(+) 5
     1 →(×) 4
     8 →(−) 4      8 →(+) 5`),
    blank(51, '(a) For the Math Graph above, what is the value of the largest-valued Math Path starting from 7? Write your answer as an integer.', '61', { ...S('6a'),
      ...note('7 × 8 = 56, then + 5 = 61.') }),
    mc(52, '(b) True/False: If a Math Graph is a rooted tree, then its largest-valued Math Path will start at the root and end at a leaf.', TF, 1, { ...S('6b'),
      ...note('Add a node −10000000 after each leaf of the graph above: ending earlier is now better.') }),
    text('Aditya wants the least-valued Math Path from one node to every other node, so he modifies Dijkstra’s: when evaluating a new path to a node, the path’s operation is applied between the current distance and the node’s value instead of adding an edge weight. A path’s value starts from the source’s own value (the table still lists distTo of the source as 0). For example, from node 1 in 1 →(+) 5, 5 →(×) 2, 5 →(+) 8, 2 →(×) 3, 8 →(−) 3, it first finds a path of value 36 to node 3 (((1 + 5) × 2) × 3), then relaxes it to 11 (((1 + 5) + 8) − 3).',
      '(c) Fill out the distTo and edgeTo arrays after running this modified Dijkstra’s on the Math Graph below, starting from node A. Nodes are written name:value.'),
    txt(`
A:3  B:6  C:3  D:2  E:1  F:4  G:5

A →(+) D     A →(÷) E     A →(×) G
B →(+) A     B →(+) C
C →(−) F
D →(−) F
F →(×) B     F →(×) G
G →(÷) E     G →(+) C`),
    blank(53, '(c) distTo for B, C, D, E, F, G, in that order, separated by commas', ['6, 8, 5, 3, 1, 5', '6 8 5 3 1 5'], S('6c')),
    blank(54, '(c) edgeTo for B, C, D, E, F, G, in that order, separated by commas', ['F, G, A, A, D, F', 'F G A A D F'], { ...S('6c'),
      ...note('From A (value 3): D = 3 + 2 = 5, E = 3 ÷ 1 = 3, F = 5 − 4 = 1 via D, G = 1 × 5 = 5 via F (better than 3 × 5), B = 1 × 6 = 6 via F, C = 5 + 3 = 8 via G (better than 6 + 3 via B).') }),
    text('For each type of Math Graph below, would the algorithm above always find a shortest paths tree? Assume all nodes are positive integers.'),
    mc(55, '(d) A Math Graph with only addition (+) and multiplication (×) operators.', ['Always', 'Not always'], 0, { ...S('6d'),
      ...note('With positive integers, + and × never make a path’s value smaller, so a finished node can’t be improved later.') }),
    mc(56, '(e) A Math Graph with no division (÷) operators.', ['Always', 'Not always'], 1, { ...S('6e'),
      ...note('Subtraction alone can make a later path smaller, so Dijkstra’s can be wrong.') }),
    mc(57, '(f) A Math Graph that is a tree.', ['Always', 'Not always'], 0, { ...S('6f'),
      ...note('In a tree there is only one path to each node, so the shortest paths tree is the only tree there is.') }),
  ]),
]);
