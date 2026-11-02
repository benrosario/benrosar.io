// Spring 2024 Midterm 2, transcribed from the official solutions.
// Changed for this site, and said so on the page: the Θ answer boxes in 2(a)–(d) are multiple choice.
// Left out: 1(k), which staff removed from the exam after grading (ambiguous), and the last page (0 points).
import { exam, problem, text, java, txt, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-sp24-mt2', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });
const TF = ['True', 'False'];
const BOX = ['Θ(1)', 'Θ(log N)', 'Θ(√N)', 'Θ(N)', 'Θ(N log N)', 'Θ(N√N)', 'Θ(N²)', 'Θ(N² log N)', 'Θ(N³)'];
const RT = ['Θ(1)', 'Θ(log(log N))', 'Θ(log N)', 'Θ((log N)²)', 'Θ(N)', 'Θ(N log N)', 'Θ(N²)', 'Θ(N² log N)', 'Θ(N³)', 'Θ(N³ log N)', 'Θ(N⁴)', 'Θ(N⁴ log N)', 'Worse than Θ(N⁴ log N)', 'Never terminates (infinite loop)', 'None of the above'];
const box = s => BOX.indexOf(s), rt = s => RT.indexOf(s);
const inf = s => ['∞', 'inf', 'infinity', 'Infinity'].map(i => s.replace('∞', i));

export default exam(E, 'Spring 2024 Midterm 2', {
  exam: 'https://drive.google.com/file/d/1TzUHigkQEWfNvE3zqYGWf7df_tlSAWze/view',
  sol: 'https://drive.google.com/file/d/1nDEB63ldnM5qCExsbhz5xmEBXW0Bgm7T/view',
}, 'sp24-mt2', [
  problem('1', 'Potpourri (22.0 pts)', null, [
    text('For the first two parts, consider the following BST of unique integer elements:'),
    txt(`
            P
          /   \\
         E     Y
        / \\     \\
       R   I     N
          / \\
         K   A
        /
       O`),
    blank(1, '(a) How many elements must be greater than the element at node K?', '5', { ...S('1a'),
      ...note('I, A, P, Y and N must all be greater than K, by the BST search property.') }),
    mc(2, '(b) In what order will a post-order traversal, starting at node P, visit the nodes?', ['P, E, Y, R, I, N, K, A, O', 'R, O, K, A, I, E, N, Y, P', 'O, K, A, R, I, E, N, Y, P'], 1, S('1b')),
    mc(3, '(c) True or false: it is possible for a rooted tree with more than 1 node to be simultaneously a valid max-heap and a valid BST.', TF, 0, { ...S('1c'),
      ...note('For example, 2 with a single left child 1.') }),
    mc(4, '(d) How many positions within a min-heap with 2ᴺ − 1 elements (where the height of the heap is N − 1) could the maximum element potentially occupy? Assume there are no duplicate elements and the heap is not empty.', ['log(N)', 'N', '2^(N−1)', '2^N'], 2, { ...S('1d'),
      ...note('The maximum is unique, so it must be a leaf. With 2ᴺ − 1 elements the bottom level (depth N − 1) is full and holds all the leaves: 2ᴺ⁻¹ positions.') }),
    mc(5, '(e) True or false: Dijkstra’s algorithm always works on both directed and undirected graphs with positive edge weights.', TF, 0, { ...S('1e'),
      ...note('Treat each undirected edge as two directed edges.') }),
    mc(6, '(f) True or false: A* always runs asymptotically faster than Dijkstra’s algorithm.', TF, 1, { ...S('1f'),
      ...note('In the worst case A* still visits every node and relaxes every edge before reaching the goal.') }),
    mc(7, '(g) True or false: A* may not need to visit all nodes before completing.', TF, 0, { ...S('1g'),
      ...note('A* stops once it reaches the goal.') }),
    mc(8, '(h) True or false: Kruskal’s algorithm always works on graphs with negative edge weights.', TF, 0, { ...S('1h'),
      ...note('Kruskal’s only uses the edges’ relative order.') }),
    mc(9, '(i) True or false: Prim’s algorithm always works on graphs with negative edge weights.', TF, 0, { ...S('1i'),
      ...note('Prim’s picks the lightest edge across each cut, so it too only uses the edges’ relative order.') }),
    mc(10, '(j) True or false: in a directed acyclic graph, any post-order traversal that visits all nodes is a valid topological sort.', TF, 1, { ...S('1j'),
      ...note('It’s the reverse of a post-order that gives a topological sort.') }),
  ]),
  problem('2', 'Awesometotics (22.0 pts)', null, [
    text('For (a) through (d), give the asymptotic behavior, with respect to N, of each scenario, in Θ notation. (On the exam these were write-in boxes.)'),
    mc(11, '(a) An ArrayList is implemented with additive resizing, then N elements are added to it. What is the maximum number of unused indices in the underlying array?', BOX, box('Θ(1)'), { ...S('2a'),
      ...note('Each resize adds a constant amount of space, so at most that constant is unused, whatever the details.') }),
    mc(12, '(b) An ArrayList is implemented with multiplicative resizing, then N elements are added to it. What is the maximum number of unused indices in the underlying array?', BOX, box('Θ(N)'), { ...S('2b'),
      ...note('If the last add triggers a doubling, the array has 2N slots and N are unused.') }),
    text('(c) You create a weighted quick union without path compression, containing N elements, then perform ⌊√N⌋ calls to union. You look at the underlying array and take the sum of the absolute values of all elements. For example, for [−4, 2, 0, 0] the sum is |−4| + |2| + |0| + |0| = 6.'),
    mc(13, '(c) Smallest possible sum', BOX, box('Θ(N)'), S('2c')),
    mc(14, '(c) Largest possible sum', BOX, box('Θ(N√N)'), { ...S('2c'),
      ...note('The negative entries (−size of each root) always sum to −N, so the sum is at least N; connecting small indices (1 to √N under 0) adds only O(√N). After √N unions at most √N entries are positive, each at most about N: connect N − 2 … N − √N − 2 under N − 1 for Θ(N√N).') }),
    text('(d) A list of positive integers (not necessarily of length N) sums to N². All elements are inserted, one at a time, into a min-heap. What are the best- and worst-case runtimes for all the insertions?'),
    mc(15, '(d) Best case', BOX, box('Θ(1)'), S('2d')),
    mc(16, '(d) Worst case', BOX, box('Θ(N²)'), { ...S('2d'), also: [box('Θ(N² log N)')],
      ...note('Best: a constant number of items, e.g. [N²]. Worst: N² ones gives at least Θ(N²), and N² inserts of O(log N) each is at most O(N² log N). Staff accepted any bound in that range; they believe Θ(N²) is tight.') }),
    text('For (e) and (f), give the best- and worst-case runtimes for the functions below.'),
    java(`
public static void f1(int N) {
    for (int i = 0; i < N; i += 1) {
        for (int j = i; j < N; j += 1) {
            if (j % 2 == 0) {
                i += 1;
            }
            System.out.println("naming things is hard - Dylan");
        }
    }
}`),
    mc(17, '(e) f1 best case', RT, rt('Θ(N)'), S('2e')),
    mc(18, '(e) f1 worst case', RT, rt('Θ(N)'), { ...S('2e'),
      ...note('The inner loop also advances i by half its length, so the outer iterations do N, N/2, N/4, … work: Θ(N) in total.') }),
    java(`
public static void f2(int N) {
    if (N < 2) {
        return;
    }
    f2(N/2);
    for (int i = 0; i < Math.sqrt(N); i += 1) {
        System.out.println("Aniruth Narayanan aka the Baller");
    }
    f2(N/2);
}`),
    mc(19, '(f) f2 best case', RT, rt('Θ(N)'), S('2f')),
    mc(20, '(f) f2 worst case', RT, rt('Θ(N)'), { ...S('2f'),
      ...note('Level k of the call tree has 2ᵏ calls doing √(N/2ᵏ) work each, so √N · (1 + √2 + √4 + … + √N). That geometric series is dominated by its last term √N, giving Θ(N).') }),
  ]),
  problem('3', 'It’s All a Blur (18.0 pts)', null, [
    text('Noah creates a unified Node class that can act as the node of either a DLList or a BST:'),
    java(`
class Node {
    int item;
    Node prev;    // The previous node in a DLList, or the left child in a BST
    Node next;    // The next node in a DLList, or the right child in a BST
}`),
    text('Using these Nodes directly, Noah can connect them as a circular doubly-linked list with one sentinel, or as a binary search tree. For example, the list sentinel ⇄ A ⇄ B ⇄ C ⇄ D ⇄ E ⇄ F ⇄ G (circular) can become the BST with D at the root, B and F as its children, and A, C, E, G as leaves.',
      'Complete treeify. Input: the sentinel Node of a doubly-linked list. Behavior: modifies the next and prev pointers of each Node so the Nodes form a complete binary search tree. Output: the root Node of the resulting tree. In the example, treeify(sentinel) changes D.prev from C to B, D.next from E to F, C.next from D to null, and so on, then returns D.',
      'You may assume the list is not empty, the number of non-sentinel items is one less than a power of two, and the items are sorted in strictly increasing order. You may not create new Nodes or use any DLList or BST methods.'),
    java(`
public static Node treeify(Node sentinel) {
    return helper(sentinel.next, sentinel.prev);
}

private static Node helper(Node begin, Node end) {
    if (begin == end) {
        begin.prev = null;
        begin.next = null;
        return begin;
    }
    Node forward = ⟪a⟫;
    Node backward = ⟪b⟫;
    while (forward != backward) {
        ⟪c⟫;
        ⟪d⟫;
    }
    ⟪e⟫;
    ⟪f⟫;
    return ⟪g⟫;
}`, { a: 'begin', b: 'end', c: 'forward = forward.next', d: 'backward = backward.prev', e: 'forward.prev = helper(begin, forward.prev)', f: 'forward.next = helper(forward.next, end)', g: 'forward' }),
    blank(21, '(a) Node forward = ____', ['begin', 'begin.next'], S('3a')),
    blank(22, '(a) Node backward = ____', ['end', 'end.prev'], S('3a')),
    blank(23, '(a) First line of the while loop (the two lines can go in either order)', ['forward = forward.next', 'backward = backward.prev'], S('3a')),
    blank(24, '(a) Second line of the while loop', ['backward = backward.prev', 'forward = forward.next'], S('3a')),
    blank(25, '(a) First line after the loop', ['forward.prev = helper(begin, forward.prev)', 'backward.prev = helper(begin, backward.prev)', 'forward.prev = helper(begin, backward.prev)', 'backward.prev = helper(begin, forward.prev)'], S('3a')),
    blank(26, '(a) Second line after the loop', ['forward.next = helper(forward.next, end)', 'backward.next = helper(backward.next, end)', 'forward.next = helper(backward.next, end)', 'backward.next = helper(forward.next, end)'], S('3a')),
    blank(27, '(a) return ____', ['forward', 'backward'], { ...S('3a'),
      ...note('Walk one pointer forward from begin and one backward from end until they meet at the middle item: that is the root. Then treeify the left half (begin to the root’s prev) and the right half (the root’s next to end). After the loop forward == backward, so either name works.') }),
    mc(28, '(b) What is the runtime of treeify on a list of N nodes, where N is one less than a power of 2?', BOX, box('Θ(N log N)'), { ...S('3b'),
      ...note('Each call does linear work to find the middle, then recurses on two halves, like mergesort: N work per level, log N levels.') }),
  ]),
  problem('4', 'Lost in LLRBs (18.0 pts)', null, [
    text('A hacker paints all the links of your (previously valid) LLRB black. An LLRB node is red if the link to its parent is red, and black if it is the root or the link to its parent is black.'),
    txt(`
          D
        /   \\
       B     F
      / \\   /
     A   C E`),
    sata(29, '(a) Select all nodes that must be red for this LLRB to be valid.', ['A', 'B', 'C', 'E', 'F', 'None of the above'], [1, 3], S('4a')),
    text('(b) Write fixLLRB, which restores the correct colors to all nodes without otherwise modifying the tree. Your code must be asymptotically optimal, and may not use any LLRB methods or attributes not listed.'),
    java(`
public class LLRB {
    private class Node {
        int value;
        Node left;
        Node right;
        boolean isRed;
    }

    private Node root;

    public void fixLLRB() {
        helper(root);
    }

    private ⟪a⟫ helper(Node n) {
        if (⟪b⟫) {
            return ⟪c⟫;
        }
        int leftHeight = ⟪d⟫;
        int rightHeight = ⟪e⟫;
        if (⟪f⟫) {
            n.left.isRed = true;
        }
        return ⟪g⟫;
    }
}`, { a: 'int', b: 'n == null', c: '0', d: 'helper(n.left)', e: 'helper(n.right)', f: 'leftHeight != rightHeight', g: 'rightHeight + 1' }),
    blank(30, '(b) helper’s return type', 'int', S('4b')),
    blank(31, '(b) if (____)', 'n == null', S('4b')),
    blank(32, '(b) return ____ (the base case)', ['0', '1', '-1'], { ...S('4b'), ...note('Any constant works: every height shifts by the same amount.') }),
    blank(33, '(b) int leftHeight = ____', ['helper(n.left)', 'helper(n.left) + 1'], S('4b')),
    blank(34, '(b) int rightHeight = ____', ['helper(n.right)', 'helper(n.right) + 1'], S('4b')),
    blank(35, '(b) if (____) n.left.isRed = true', ['leftHeight != rightHeight', 'leftHeight > rightHeight', 'leftHeight == rightHeight + 1', 'rightHeight < leftHeight', 'leftHeight - 1 == rightHeight'], S('4b')),
    blank(36, '(b) return ____', ['rightHeight + 1', 'Math.min(leftHeight, rightHeight) + 1'], { ...S('4b'),
      ...note('helper returns a node’s height in the corresponding 2-3 tree. Right links are always black, so the right subtree is exactly one level down. If the left subtree is taller than the right, the left link must be red (red links don’t add height). (If you added 1 to both heights in (d) and (e), adjust the return accordingly; the exam’s rubric accepted consistent variants.)') }),
  ]),
  problem('5', 'I Love Hashbrowns (12.0 pts)', null, [
    text('Consider two hashCodes: the default hashCode (from Object, the memory address) and the trivial hashCode (always returns 0). Also consider two equals methods: the default equals (from Object, which uses ==) and the trivial equals (always returns true). In (c) and (d), “all equals methods” means any possible equals method, not just these two.'),
    mc(37, '(a) The default hashCode is a valid hashCode for the trivial equals method.', TF, 1, { ...S('5a'),
      ...note('Trivial equals makes every pair of objects equal, so a valid hashCode must give them all the same code. Memory addresses differ.') }),
    mc(38, '(b) The trivial hashCode is a valid hashCode for the trivial equals method.', TF, 0, { ...S('5b'), ...note('Every object gets 0, so equal objects (all of them) share a hash code.') }),
    mc(39, '(c) The trivial hashCode is a valid hashCode for all equals methods.', TF, 0, { ...S('5c'), ...note('It’s always the same integer, so any two equal objects always have equal hash codes.') }),
    mc(40, '(d) The default hashCode is a valid hashCode for all equals methods.', TF, 1, { ...S('5d'), ...note('(a) is a counterexample: it fails for the trivial equals.') }),
    mc(41, '(e) The only valid hashCode (over all possible hashCodes) for the default equals method is the default hashCode.', TF, 1, { ...S('5e'), ...note('The trivial hashCode is valid for every equals, including the default.') }),
    mc(42, '(f) The only valid hashCode (over all possible hashCodes) for the trivial equals method is the trivial hashCode.', TF, 1, { ...S('5f'), ...note('Any constant hashCode (always 1, always 5, …) is also valid.') }),
  ]),
  problem('6', 'Where’s Prim? (8.0 pts)', null, [
    text('An undirected graph with these weighted edges:'),
    txt(`
A — B   1
A — D   3
B — C   3
B — E   8
C — E   5
C — F   13
D — E   3
D — G   5
E — G   4`),
    text('(a) We run Dijkstra’s on this graph from A. After visiting A and B, distTo is A 0, B 1, C 4, D 3, E 9, F ∞, G ∞. Fill in distTo after visiting one more node and relaxing all of its outgoing edges.'),
    blank(43, '(a) distTo for A, B, C, D, E, F, G, in that order, separated by commas (write ∞ or inf for infinity)', [...inf('0, 1, 4, 3, 6, ∞, 8'), ...inf('0 1 4 3 6 ∞ 8')], { ...S('6a'),
      ...note('The next node is D (lowest unvisited distTo). Relaxing its edges improves E from 9 to 6 (A → D → E) and G from ∞ to 8 (A → D → G).') }),
    blank(44, '(b) What is the sum of the edge weights in the minimum spanning tree of the graph?', '27', { ...S('6b'),
      ...note('AB 1 + AD 3 + BC 3 + DE 3 + EG 4 + CF 13 = 27.') }),
    sata(45, '(c) Which edges are guaranteed to be in all (not necessarily minimum) spanning trees? Select all that apply.', ['AB', 'AD', 'BC', 'BE', 'CE', 'CF', 'DE', 'DG', 'EG', 'None of the above'], [5], { ...S('6c'),
      ...note('CF is the only edge that reaches F. Every other node can be reached by more than one edge, so each other edge can be left out of some spanning tree.') }),
    blank(46, '(d) You add a new edge between F and G with weight x, and the MST of the modified graph has a lower total weight than the original MST. What is the maximum integer value that x could be?', '12', { ...S('6d'),
      ...note('With FG in place of CF, the MST weighs 1 + 3 + 3 + 3 + 4 + x = 14 + x. That must be less than 27, so x < 13: at most 12.') }),
  ]),
]);
