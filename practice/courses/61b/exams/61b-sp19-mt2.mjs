// Spring 2019 Midterm 2, transcribed from the official solutions (beta, updated 4/4/19). (This exam’s points total 480.)
// Changed for this site, and said so on the page: drawn trees are written as value(left, right); drawn answers (1a,
// 8b, 9b) are multiple choice or fill-in; the free-form code (9a, 11) has blanks following the solution’s lines.
// Left out: Q0 (writing your name) and Q5 (0 points).
import { exam, problem, text, java, txt, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-sp19-mt2', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });
const RT = ['Θ(1)', 'Θ(log N)', 'Θ(N)', 'Θ(N log N)', 'Θ(N²)', 'Θ(N² log N)', 'Θ(N³)', 'Θ(2ᴺ)', 'Never terminates (infinite loop)'];
const rt = s => RT.indexOf(s);
const POSSIBLE = ['Possible', 'Not possible'];
const list = s => [s, s.replace(/,/g, '')];
const ops = (...o) => [o, o.map(x => x[0].toUpperCase() + x.slice(1))].flatMap(v => [v.join(', '), v.join('\n'), v.join(' ')]);

export default exam(E, 'Spring 2019 Midterm 2', {
  exam: 'https://drive.google.com/file/d/1yn4HBkf4f70LLS7Lu7J80DbcxXjn7bkJ/view',
  sol: 'https://drive.google.com/file/d/1mj6UodqxVgsR7YtU8bSi50FG_R9aYqzl/view',
}, 'sp19-mt2', [
  problem('1', 'Tree Removal (33 pts)', null, [
    text('Trees are written value(left, right), with - for a missing child. (a) Here is a BST:'),
    txt('8( 4( 1(-, 3(2, -)), 7(5(-, 6), -) ), 9 )'),
    mc(1, '(a) Which tree results from deleting 4 with Hibbard deletion, using the successor (not the predecessor)?', ['8( 5( 1(-, 3(2, -)), 7(6, -) ), 9 )', '8( 3( 1(-, 2), 7(5(-, 6), -) ), 9 )', '8( 5( 1(-, 3(2, -)), 7(-, 6) ), 9 )', '8( 6( 1(-, 3(2, -)), 7(5, -) ), 9 )'], 0, { ...S('1a'),
      ...note('4’s successor is 5 (the leftmost node of its right subtree). 5 moves up, and its right child 6 takes its place under 7.') }),
    text('(b) Fill in deleteMin, which deletes the smallest item in the BST rooted at TreeNode x and returns the root afterwards. x is never null; return null if the tree becomes empty. TreeNode has fields item, left and right.'),
    java(`
private TreeNode deleteMin(TreeNode x) {
    if (x.left == null) { return ⟪a⟫; }
    ⟪b⟫;
    return ⟪c⟫;
}`, { a: 'x.right', b: 'x.left = deleteMin(x.left)', c: 'x' }),
    blank(2, '(b) return ____ (no left child)', 'x.right', S('1b')),
    blank(3, '(b) The middle line', 'x.left = deleteMin(x.left)', S('1b')),
    blank(4, '(b) return ____', 'x', { ...S('1b'), ...note('The minimum has no left child; replace it with its right subtree. Otherwise, delete the minimum from the left subtree.') }),
  ]),
  problem('2', 'Hash Tables (49 pts)', null, [
    text('A correct hash table set as in lecture: buckets in an array, each a linked list; after an add, it resizes to 1.5× the buckets if the load factor is ≥ 1; hash codes are reduced with floorMod(hashCode(), M). For (a)–(c) there are N = 19 items and M = 41 buckets.'),
    blank(5, '(a) What is the current load factor? (A fraction is fine.)', ['19/41', '19 / 41', '0.463', '0.46'], S('2a')),
    blank(6, '(b) A user calls contains. What is the minimum number of times contains calls equals? (Assume nothing about the distribution.)', '0', S('2b')),
    blank(7, '(b) …and the maximum?', '19', { ...S('2b'), ...note('Empty bucket: 0. All 19 items in the searched bucket: 19.') }),
    blank(8, '(c) What is the minimum number of add calls that can cause the next resize?', '22', S('2c')),
    blank(9, '(c) …and the maximum?', '22', { ...S('2c'), ...note('The load factor reaches 1 at 41 items: 22 more adds, however they’re distributed.') }),
    text('(d) ExamOomage has four int fields r, g, b, a, each in [0, 255], a correct equals, and a hashCode that returns some integer (of unknown quality). A timing experiment adds N random ExamOomages to the hash set:'),
    java(`
public static void timingTest(int N) {
    Stopwatch sw = new Stopwatch();
    Problem2HashSet<ExamOomage> hsp = new Problem2HashSet<>();
    for (int i = 0; i < N; i += 1) {
        hsp.add(ExamOomage.randomPoint()); // returns ExamOomage with random r/g/b/a in [0, 255]
    }
    System.out.println(sw.elapsedTime());
}`),
    txt(`
N = 1000   : 0.026 seconds
N = 10000  : 1.00 seconds
N = 49123  : 26.96 seconds
N = 100000 : 118.43 seconds`),
    mc(10, '(d) Which best matches the average time per add?', ['Θ(1)', 'Θ(log N)', 'Θ(N)', 'Θ(N²)', 'Θ(2ᴺ)'], 2, { ...S('2d'),
      ...note('10× more items takes about 100× longer in total, so each add costs Θ(N).') }),
    blank(11, '(e) Give the body of a hashCode() that would produce timings like these.', ['return 1', 'return 0', 'return 2', 'return -1', 'return 42'], { ...S('2e'),
      ...note('Any constant puts every item in one bucket. (Any return of a single constant is right.)') }),
  ]),
  problem('3', 'KdTree (54 pts)', null, [
    text('The k-d tree below: A(4, 5) splits on x, with left child B(2, 11) and right child E(6, 3), which split on y. B’s down child is C(3, 3) and up child D(1, 12); E’s down child is F(7, 2) and up child G(7, 6). C, D, F and G split on x.'),
    mc(12, '(a) What is the result of nearest(new Point(2, 2))?', ['A (4, 5)', 'B (2, 11)', 'C (3, 3)', 'D (1, 12)', 'E (6, 3)', 'F (7, 2)', 'G (7, 6)'], 2, S('3a')),
    mc(13, '(b) For nearest(new Point(2, 2)), which child of A is the “good child” that should definitely be explored?', ['B', 'E'], 0, { ...S('3b'), ...note('A splits on x, and 2 < 4, so the left side is the good child.') }),
    blank(14, '(c) Without exploring A’s children, what is the closest possible point to (2, 2) that could exist in A.right, based only on how A partitions the space? Give it as x, y.', ['4, 2', '(4, 2)', '4 2'], { ...S('3c'), ...note('A.right holds x ≥ 4; the closest such point is straight across: (4, 2).') }),
    blank(15, '(d) In what order are the vertices visited to complete the call from (a)? Leave out nodes that are pruned. (The first is A.)', list('A, B, C'), { ...S('3d'),
      ...note('After C at distance √2, D’s side (y ≥ 11) and all of A.right (at least distance 2 away) are pruned.') }),
    mc(16, '(e) If we added the point (5, 1) to the tree above, where would it go?', ['C.left', 'C.right', 'D.left', 'D.right', 'F.left', 'F.right', 'G.left', 'G.right'], 4, { ...S('3e'),
      ...note('x 5 ≥ 4: go right to E; y 1 < 3: go down to F; x 5 < 7: F’s left.') }),
  ]),
  problem('4', 'LLRBs (46 pts)', null, [
    text('The LLRB below (links labeled red are red; the others are black):'),
    txt(`
           25
      red /  \\
        17    43
       /  \\   / red
     13   22 39`),
    blank(17, '(a) If we add 15, what single LLRB operation do we need? Write it like rotateLeft(X), rotateRight(X) or colorFlip(X).', ['rotateLeft(13)', 'RotateLeft(13)'], { ...S('4a'), ...note('15 becomes a red right child of 13.') }),
    blank(18, '(b) Starting from the original LLRB (without 15), what operations do we need if we add 40? List them in order.', ops('rotateLeft(39)', 'rotateRight(43)', 'colorFlip(40)', 'colorFlip(25)'), { ...S('4b'),
      ...note('40 is a red right child of red 39: rotateLeft(39) gives 43–40–39 leaning left twice, so rotateRight(43); 40 then has two red children, so colorFlip(40); that makes 40 red next to red 17, so colorFlip(25).') }),
    blank(19, '(c) In the 2-3 tree corresponding to the original LLRB, what keys are in the root? (Separate them with commas.)', list('17, 25'), S('4c')),
    blank(20, '(c) …and in the rightmost leaf?', list('39, 43'), { ...S('4c'), ...note('The 2-3 tree is [17 25] with children [13], [22] and [39 43].') }),
  ]),
  problem('6', 'WQUzaaaaaaaaaaaaaaaaaaaaapp (24 pts)', null, [
    text('For each figure, could a sequence of at most 4 Weighted Quick Union union calls (without path compression) produce it, starting with everything disconnected? If two trees have the same weight, the first argument’s root goes below the second’s. (The exam asked for the calls when possible.)'),
    txt(`
Figure 1:  0( 1(2), 3(4) )
Figure 2:  0( 1, 2, 3(4) )
Figure 3:  0( 1(2(3)), 4 )`),
    mc(21, 'Figure 1', POSSIBLE, 1, { ...S('6'), ...note('0 would have to end up as the root above two size-2 trees, but a lone 0 (size 1) always goes under the bigger tree it joins.') }),
    mc(22, 'Figure 2', POSSIBLE, 0, { ...S('6'), ...note('For example union(0, 1), union(0, 2), union(3, 4), union(3, 0).') }),
    mc(23, 'Figure 3', POSSIBLE, 1, { ...S('6'), ...note('A WQU of height 3 needs at least 8 items.') }),
  ]),
  problem('7', 'Shortest Paths (40 pts)', null, [
    text('We run Dijkstra’s algorithm from vertex 0 on this directed graph:'),
    txt(`
0 → 3   1      0 → 4   4      3 → 7   1
4 → 2   1      4 → 6   2      6 → 2   3
6 → 1   20     6 → 5   1      1 → 2   9
1 → 0   8      2 → 0   5      2 → 5   3
5 → 7   3`),
    text('Right after vertex 2’s edges have been relaxed: distTo is 0, ∞, 5, 1, 4, 8, 6, 2 and edgeTo is -, -, 4, 0, 0, 2, 4, 3 (for vertices 0 to 7).'),
    blank(24, '(a) In what order were the vertices visited? (2 was last.)', list('0, 3, 7, 4, 2'), S('7a')),
    blank(25, '(b) What vertex will be visited next?', '6', S('7b')),
    blank(26, '(c) Give the distTo array (vertices 0 to 7) after the next vertex is visited and its edges relaxed.', list('0, 26, 5, 1, 4, 7, 6, 2'), { ...S('7c'),
      ...note('Visiting 6 (distance 6) improves 1 to 6 + 20 = 26 and 5 to 6 + 1 = 7.') }),
    blank(27, '(d) If all the edges were undirected, how many edges would be in the minimum spanning tree?', '7', { ...S('7d'), ...note('8 vertices, so 7 edges.') }),
  ]),
  problem('8', 'Les Visiteurs (56 pts)', null, [
    text('The tree 10(9(1, -), 3(2, 5)) is made of TreeNodes. A visitor generalizes “visiting” a node during a traversal:'),
    java(`
public class TreeNode {
    public TreeNode left;
    public TreeNode right;
    public int item;
    ...
}

interface Visitor {
    void visit(TreeNode x);
}

static void preorder(TreeNode n, Visitor v) {
    if (n == null) { return; }
    v.visit(n);
    preorder(n.left, v);
    preorder(n.right, v);
}

static void inorder(TreeNode n, Visitor v) {
    if (n == null) { return; }
    inorder(n.left, v);
    v.visit(n);
    inorder(n.right, v);
}

class Printer implements Visitor {
    public void visit(TreeNode x) {
        System.out.print(x.item + " ");
    }
}

class Adder implements Visitor {
    public void visit(TreeNode x) {
        if (x.left != null) { x.item += x.left.item; }
        if (x.right != null) { x.item += x.right.item; }
    }
}

class GlorpGlorp implements Visitor {
    Printer printer = new Printer();
    public void visit(TreeNode x) {
        TreeNode.inorder(x, printer);
    }
}`),
    blank(28, '(a) What does a preorder traversal with a Printer print?', ['10 9 1 3 2 5', '10, 9, 1, 3, 2, 5'], S('8a')),
    blank(29, '(b) After an inorder traversal with an Adder, what are the tree’s values in preorder (the shape is unchanged)?', ['23 10 1 10 2 5', '23, 10, 1, 10, 2, 5'], { ...S('8b'),
      ...note('In order: 1 stays 1; 9 becomes 10; 10 becomes 10 + 10 + 3 = 23 (3 hasn’t been visited yet); 2 stays; 3 becomes 3 + 2 + 5 = 10; 5 stays.') }),
    blank(30, '(c) On the original tree, what does TreeNode.preorder(n, new GlorpGlorp()) print?', ['1 9 10 2 3 5 1 9 1 2 3 5 2 5', '1, 9, 10, 2, 3, 5, 1, 9, 1, 2, 3, 5, 2, 5'], { ...S('8c'),
      ...note('Each node visited in preorder prints its whole subtree in order: 10’s, then 9’s, then 1’s, 3’s, 2’s and 5’s.') }),
    text('(d) Treat the original tree as a graph. DFS from 5, visiting the smallest neighbor first.'),
    blank(31, '(d) DFS preorder', ['5 3 2 10 9 1', '5, 3, 2, 10, 9, 1'], S('8d')),
    blank(32, '(d) DFS postorder', ['2 1 9 10 3 5', '2, 1, 9, 10, 3, 5'], S('8d')),
  ]),
  problem('9', 'Heaping (35 pts)', null, [
    text('(a) Write sink for a heap stored as a tree of TreeNodes. TreeNode.min(a, b) returns the node with the smaller item (ties arbitrary), null if both are null, or the non-null one if only one is null.'),
    java(`
public static void sink(TreeNode n) {
    if (n == null) { return; }
    ⟪a⟫;
    if (minN == null) {
        return;
    }
    if (⟪b⟫) {
        ⟪c⟫
    }
}`, { a: 'TreeNode minN = min(n.left, n.right)', b: 'n.item > minN.item', c: 'int temp = n.item;\nn.item = minN.item;\nminN.item = temp;\nsink(minN);' }),
    blank(33, '(a) First blank', 'TreeNode minN = min(n.left, n.right)', S('9a')),
    blank(34, '(a) if (____)', ['n.item > minN.item', 'minN.item < n.item'], S('9a')),
    blank(35, '(a) Inside the if (swap the items, then keep sinking; several lines)', ['int temp = n.item;\nn.item = minN.item;\nminN.item = temp;\nsink(minN);', 'int temp = minN.item;\nminN.item = n.item;\nn.item = temp;\nsink(minN);'], { ...S('9a'),
      ...note('If the smaller child is smaller than n, swap their items and keep sinking from the child.') }),
    mc(36, '(b) A SinkVisitor’s visit calls sink(x). For which complete 4-node tree does TreeNode.preorder(n, new SinkVisitor()) not result in a heap?', ['1(2(0), 3)', '0(1(2), 3)', '3(2(1), 0)', '2(3(1), 0)'], 0, { ...S('9b'),
      ...note('Preorder sinks the root first, while 0 is still hidden below 2; 0 then only rises to the root’s child, under 1.') }),
  ]),
  problem('10', 'Asymptotics (84 pts)', null, [
    text('(a) Give the runtime of each function in Θ notation.'),
    java(`
public static void g1(int N) {
    for (int i = 0; i < N; i += 3) {
        for (int j = 0; j < i; j += 1) {
            System.out.print("ca3");
        }
    }
}

public static void g2(int N) { // ASSUME N IS A POWER OF 2.
    for (int i = 0; i < N; i = i * 2) {
        g2(i);
    }
    System.out.print("power egg");
}

public static void g3(int N) {
    int j = N / 2;
    for (int i = 0; i < j; i += 4) {
        for (j = 0; j < N; j += 1) {
            System.out.print("moo");
        }
    }
}

public static void g4(ArrayList<Integer> x) {
    int N = x.size(); // size takes constant time
    if (N == 1) { System.out.println(x.get(0)); return; }

    // subListCopy(P, Q) returns a copy of the list from [P, Q),
    // i.e. exclusive of Q, and takes Θ(Q - P) time.
    ArrayList<Integer> leftHalf = x.subListCopy(0, N / 2);
    ArrayList<Integer> rightHalf = x.subListCopy(N / 2, N);

    g4(leftHalf);
    g4(rightHalf);

    for (int i = 0; i < N; i += 1) {
        System.out.println(x.get(i)); // get takes constant time
    }
}`),
    mc(37, '(a) g1', RT, rt('Θ(N²)'), S('10a')),
    mc(38, '(a) g2', RT, rt('Θ(N)'), { ...S('10a'), also: [rt('Never terminates (infinite loop)')], ...note('The staff answer is Θ(N), reading the loop as starting at i = 1: g2(N) then calls g2(1), g2(2), …, g2(N/2), which adds up to Θ(N). As printed, i starts at 0 and 0 * 2 is still 0, so the loop never ends; this site accepts that answer too.') }),
    mc(39, '(a) g3', RT, rt('Θ(N²)'), { ...S('10a'), ...note('The inner loop reuses j and leaves it at N, so the outer loop keeps going while i < N: about N/4 passes of N steps each.') }),
    mc(40, '(a) g4', RT, rt('Θ(N log N)'), { ...S('10a'), ...note('Linear work per call plus two half-size calls, like mergesort.') }),
    text('(b) Using the number of values copied as the cost model: an AList starts with 1 slot and doubles whenever an added item doesn’t fit. For example, the 3rd add resizes from 2 to 4 and copies 2 values.'),
    blank(41, '(b) i) How many values are copied on each of the first 16 adds? (16 numbers, separated by commas; the first four are 0, 1, 2, 0.)', list('0, 1, 2, 0, 4, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0'), S('10bi')),
    mc(42, '(b) ii) Let C_d(N) be the total copies for N adds with doubling (e.g. C_d(4) = 3). C_d(N) is…', RT, rt('Θ(N)'), S('10bii')),
    blank(43, '(b) iii) Now the AList starts with 1 slot and grows by 3 whenever an added item doesn’t fit (e.g. the 5th add resizes from 4 to 7 and copies 4). How many values are copied on each of the first 16 adds? (The first five are 0, 1, 0, 0, 4.)', list('0, 1, 0, 0, 4, 0, 0, 7, 0, 0, 10, 0, 0, 13, 0, 0'), S('10biii')),
    mc(44, '(b) iv) Let C_a3(N) be the total copies for N adds when growing by 3 (e.g. C_a3(5) = 5). C_a3(N) is…', RT, rt('Θ(N²)'), { ...S('10biv'),
      ...note('This is the same pattern as g1 (that’s why it prints “ca3”): copies of 1, 4, 7, 10, … add up to Θ(N²).') }),
  ]),
  problem('11', 'Yggdrasil (60 pts)', null, [
    text('(Staff called this a very challenging problem.) Write heapToBBST(k, h), which removes the k smallest values from the min-heap h (made of TreeNodes) and returns them as a perfectly balanced BST, in place (reusing the heap’s TreeNodes), in O(N log N) time and O(log N) extra memory. For example, with a heap holding 4, 6, 7, 8, 9, 10, 11, 12, 13, heapToBBST(7, h) returns 8(6(4, 7), 10(9, 11)) and leaves 12 and 13 in the heap. MinHeap’s instance variables are private; it has removeMin(), which removes and returns the minimum node.'),
    java(`
public static TreeNode heapToBBST(int k, MinHeap h) {
    if (k == 0) {
        return null;
    }
    ⟪a⟫;
    ⟪b⟫;
    ⟪c⟫;
    ⟪d⟫;
    ⟪e⟫;
    return middle;
}`, { a: 'TreeNode left = heapToBBST(k / 2, h)', b: 'TreeNode middle = h.removeMin()', c: 'TreeNode right = heapToBBST(k - (k / 2) - 1, h)', d: 'middle.left = left', e: 'middle.right = right' }),
    blank(45, 'First line', ['TreeNode left = heapToBBST(k / 2, h)', 'TreeNode left = heapToBBST(k/2, h)'], S('11')),
    blank(46, 'Second line', 'TreeNode middle = h.removeMin()', S('11')),
    blank(47, 'Third line', ['TreeNode right = heapToBBST(k - (k / 2) - 1, h)', 'TreeNode right = heapToBBST(k - k / 2 - 1, h)'], S('11')),
    blank(48, 'Fourth line', 'middle.left = left', S('11')),
    blank(49, 'Fifth line', 'middle.right = right', { ...S('11'),
      ...note('Build the left subtree from the k/2 smallest values first, then the next value is the root, then the right subtree from the rest. Removing them in this order hands out values in sorted order.') }),
  ]),
]);
