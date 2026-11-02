// Fall 2023 Midterm 2 (Thu 10/19/2023), transcribed from the official solutions.
// Changed for this site, and said so on the page: the LLRB operation tables (2b) are one question per operation, and
// the "list the fixed numbers" tables in 4 are two blanks each (the numbers, then their indices).
// Left out: the bonus question and the last page (0 points).
import { exam, problem, text, java, txt, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-fa23-mt2', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });
const TF = ['True', 'False'];
const DS = ['ArrayList', 'LLRB Tree', 'Heap', 'HashMap', 'Stack'];
const RT = ['Θ(1)', 'Θ(log(log N))', 'Θ(log N)', 'Θ((log N)²)', 'Θ(N)', 'Θ(N log N)', 'Θ(N²)', 'Θ(N² log N)', 'Θ(N³)', 'Θ(N³ log N)', 'Θ(N⁴)', 'Θ(N⁴ log N)', 'Worse than Θ(N⁴ log N)', 'Never terminates (infinite loop)', 'None of the above'];
const rt = s => RT.indexOf(s);
const OPS = ['rotateLeft(5)', 'rotateLeft(10)', 'rotateLeft(15)', 'rotateLeft(20)', 'rotateRight(10)', 'rotateRight(20)', 'colorFlip(10)', 'colorFlip(20)', 'colorFlip(25)', 'None (no more operations)'];
const list = (...a) => [a.join(', '), a.join(' ')];

export default exam(E, 'Fall 2023 Midterm 2', {
  exam: 'https://drive.google.com/file/d/1rT67b4j7ek12SHC1d5LwLVV085QZpRCW/view',
  sol: 'https://drive.google.com/file/d/1VgzKzWCXydHqPp7oieUdwBDfxnr_F1EI/view',
}, 'fa23-mt2', [
  problem('1', 'Ghost Curry (16.0 pts)', null, [
    sata(1, '(a) Say f(n) ∈ Θ(g(n)), and g(n) is strictly positive and increasing. Mark all that are always true.', ['f(n) ∈ O(g(n))', 'f(n) ∈ Ω(g(n))', 'f(n) ∈ O(log(g(n)))', 'f(n) ∈ Ω(log(g(n)))', 'f(n) ∈ O(n · g(n))', 'f(n) ∈ Ω(n · g(n))', 'None of the above'], [0, 1, 3, 4], { ...S('1a'),
      ...note('Θ gives both O and Ω of g. g grows at least as fast as log g, so f ∈ Ω(log g), and f ∈ O(n·g) because n·g grows at least as fast as g. The other two bounds are too tight.') }),
    mc(2, '(b) A data structure with a time complexity of Θ(1) for all its operations always runs faster on all inputs than a data structure with a time complexity of Θ(log n) for the same operations.', TF, 1, { ...S('1b'),
      ...note('Asymptotic bounds hide constants: for small inputs the Θ(log n) structure can be faster.') }),
    mc(3, '(c) A fully connected disjoint set without path compression has find() run in Θ(1).', TF, 1, { ...S('1c'),
      ...note('Without path compression, nodes can be several links below the root, so find walks up a tree.') }),
    mc(4, '(d) Inserting into a Binary Search Tree is O(log N), where N is the number of elements.', TF, 1, { ...S('1d'), ...note('A spindly BST makes insertion Θ(N).') }),
    mc(5, '(e) A 2-3 tree can contain a node with 2 elements as the root.', TF, 0, S('1e')),
    mc(6, '(f) Our HashMap runtime analyses assume hashCode runs in constant time.', TF, 0, S('1f')),
    mc(7, '(g) In Hibbard deletion, you can replace the deleted node with either the right-most node in the left subtree or the left-most node in the right subtree, if they exist.', TF, 0, { ...S('1g'),
      ...note('Those are the predecessor and successor.') }),
    mc(8, '(h) Two objects are always equal if they have the same hash, assuming the hashCode() function is valid.', TF, 1, { ...S('1h'), ...note('Different objects can collide.') }),
    mc(9, '(i) Two objects are always unequal if they have different hashes, assuming the hashCode() function is valid.', TF, 0, { ...S('1i'), ...note('Equal objects must have equal hashes, so different hashes mean unequal objects.') }),
    mc(10, '(j) The asymptotic runtime for all methods of a 2-3-4 tree is the same as for a 2-3 tree.', TF, 0, S('1j')),
    text('(k) Consider this class:'),
    java(`
public class Ben {
    public int x;
    public int y;
    public int z;

    @Override
    public boolean equals(Object o) {
        if (o instanceof Ben b) {
            return this.x == b.x && this.y == b.y;
        }
        return false;
    }

    @Override
    public int hashCode() { return /* answer choices here */ }
}`),
    sata(11, '(k) Select all of the valid hashCode implementations for the class Ben.', ['0;', 'x + y + z;', 'x * 625 - y;', 'z;', 'None of the above'], [0, 2], { ...S('1k'),
      ...note('equals ignores z, so two equal Bens can have different z. A valid hashCode may only use x and y (or nothing).') }),
    mc(12, '(l) You are implementing an undo feature in a graphic design program: users should be able to undo the most recent action they performed. Which data structure is ideal for managing the history of actions?', DS, 4, S('1l')),
    mc(13, '(m) You are developing a chat application that shows messages in chronological order. Messages can be inserted after the newest message, and older messages may be deleted or modified regardless of timestamp. Which data structure is best suited for maintaining messages?', DS, 1, { ...S('1m'), also: [0],
      ...note('LLRB Tree was the intended answer; staff also gave full credit for ArrayList.') }),
    mc(14, '(n) You are building a weather application that stores information about cities, including their names and weather conditions. Users should be able to quickly look up weather data for a city by its name. Which data structure is the most appropriate?', DS, 3, S('1n')),
  ]),
  problem('2', 'Tree Questions (16.0 pts)', null, [
    text('(a) Given the following 2-3 tree:'),
    txt(`
             [36]
           /      \\
        [8]        [74]
       /   \\      /    \\
    [3]  [21 29] [52 61] [77 100]`),
    mc(15, '(a) 1. There is an order of insertions that creates this 2-3 tree such that 36 was inserted after 3.', TF, 0, S('2a')),
    text('(a) 2. We insert 53, 23, 44, 47 into the tree above, in that order.'),
    blank(16, '(a) 2(a) What element(s) are in the root node? (Separate them with commas.)', list('36', '53'), S('2a')),
    blank(17, '(a) 2(b) How many nodes are there with 2 elements?', '3', { ...S('2a'),
      ...note('53 makes [52 53 61], which splits and pushes 53 up: [53 74]. 23 joins [21 23 29], pushing 23 up to [8 23]. 44 and 47 make [44 47 52], pushing 47 up to [47 53 74], which splits and pushes 53 to the root: [36 53]. The 2-element nodes are then [8 23], [36 53] and [77 100].') }),
    text('(b) Inserting 25 into the LLRB below (red links labeled red) gives the tree on the right. Which operations return it to a valid LLRB?'),
    txt(`
     10                          10
    /  \\                        /  \\
   5    20         →           5    20
       / red                       /  \\
     15                   red    15    25   red`),
    mc(18, '(b) Operation 1', OPS, 7, S('2b')),
    mc(19, '(b) Operation 2', OPS, 1, S('2b')),
    mc(20, '(b) Operation 3', OPS, 9, { ...S('2b'),
      ...note('20 has two red children, so colorFlip(20). That makes 10–20 a right-leaning red link, so rotateLeft(10). Nothing else is needed.') }),
    text('(c) Each tree is written node(left, right); a * marks a node whose link to its parent is red. Which are not well-formed LLRBs?'),
    txt(`
(i)   64(47(4(*1, -), 63), 140(121, 160))
(ii)  133(*87(63(*16, -), 90), 169(*156, -))
(iii) 88(*11(10, 49(*17, 77)), 183)
(iv)  10(7, 72(*108(52, -), 152))
(v)   12(*11(10, -), 15)`),
    sata(21, '(c) Select all that are not well-formed LLRBs.', ['(i)', '(ii)', '(iii)', '(iv)', '(v)'], [2, 3, 4], { ...S('2c'),
      ...note('(iii): root-to-null paths have different numbers of black links (via 49–77 there are two). (iv): 108 is the left child of 72, which breaks the BST order. (v): the path through 11 to 10 has two black links, the path to 15 only one.') }),
    text('(d) Now a 2-3-4 tree. Its root holds three values (X X X) and has four children A, B, C, D (values not shown).'),
    blank(22, '(d) 1. What is the maximum number of values that can be added without causing the node with 3 Xs to split?', '8', { ...S('2d'),
      ...note('Each of the four children can take two more values before it splits and pushes a value up: 4 × 2 = 8.') }),
    blank(23, '(d) 2. What is the minimum number of values that can be added to cause the node with 3 Xs to split?', '3', { ...S('2d'),
      ...note('Three values into one child fill it to four and split it, pushing a value into the full root, which splits.') }),
  ]),
  problem('3', 'A Hole-y Cheese (18.0 pts)', null, [
    text('Sam has a cheese that is infinitely wide but of limited height, with many circular holes. Can you go from the bottom surface to the top? Two intersecting holes connect, and a hole that touches the bottom or top surface connects to that surface.'),
    java(`
public class Hole {
    // ...implementation not shown...

    // Checks whether this hole intersects with the passed in hole.
    public boolean intersectsWithHole(Hole other) { ... }

    // Checks whether this hole intersects with the bottom.
    public boolean intersectsWithBottom() { ... }

    // Checks whether this hole intersects with the top.
    public boolean intersectsWithTop() { ... }
}`),
    text('Complete topBottomConnected, which returns whether it is possible to go from the top to the bottom, given a List of Hole objects.'),
    java(`
public boolean topBottomConnected(List<Hole> holes) {
    WeightedQuickUnion q = new WeightedQuickUnion(holes.size() + 2);
    int bottom = holes.size();
    int top = holes.size() + 1;

    for (⟪a⟫) {
        if (⟪b⟫) {
            ⟪c⟫;
        }
        if (⟪d⟫) {
            ⟪e⟫;
        }
    }
    for (int i = 0; i < holes.size(); i++) {
        for (⟪f⟫) {
            if (⟪g⟫) {
                ⟪h⟫;
            }
        }
    }
    return ⟪i⟫;
}`, { a: 'int i = 0; i < holes.size(); i++', b: 'holes.get(i).intersectsWithBottom()', c: 'q.union(i, bottom)', d: 'holes.get(i).intersectsWithTop()', e: 'q.union(i, top)', f: 'int j = i + 1; j < holes.size(); j++', g: 'holes.get(i).intersectsWithHole(holes.get(j))', h: 'q.union(i, j)', i: 'q.isConnected(bottom, top)' }),
    blank(24, '(a) The first loop’s header', ['int i = 0; i < holes.size(); i++', 'int i = 0; i < holes.size(); i += 1'], S('3')),
    blank(25, '(b) The first if', 'holes.get(i).intersectsWithBottom()', S('3')),
    blank(26, '(c) Inside it', ['q.union(i, bottom)', 'q.union(bottom, i)'], S('3')),
    blank(27, '(d) The second if', 'holes.get(i).intersectsWithTop()', S('3')),
    blank(28, '(e) Inside it', ['q.union(i, top)', 'q.union(top, i)'], S('3')),
    blank(29, '(f) The inner loop’s header', ['int j = i + 1; j < holes.size(); j++', 'int j = i + 1; j < holes.size(); j += 1', 'int j = 0; j < holes.size(); j++', 'int j = 0; j < holes.size(); j += 1'], S('3')),
    blank(30, '(g) The inner if', ['holes.get(i).intersectsWithHole(holes.get(j))', 'holes.get(j).intersectsWithHole(holes.get(i))'], S('3')),
    blank(31, '(h) Inside it', ['q.union(i, j)', 'q.union(j, i)'], S('3')),
    blank(32, '(i) return ____', ['q.isConnected(bottom, top)', 'q.isConnected(top, bottom)'], { ...S('3'),
      ...note('Give each hole an index and add two extra items for the bottom and top surfaces. Union holes with the surfaces they touch and with each other; the cheese is passable exactly when bottom and top end up connected.') }),
  ]),
  problem('4', 'Heaps of Fun (16.0 pts)', null, [
    text('1. A binary MinHeap contains A, B, C and D, with A < B < C < D.'),
    sata(33, '1(a) Which element(s) could possibly be the root?', ['A', 'B', 'C', 'D', 'None of the above'], [0], S('4.1')),
    sata(34, '1(b) Which element(s) could possibly be one edge away from the root?', ['A', 'B', 'C', 'D', 'None of the above'], [1, 2, 3], S('4.1')),
    sata(35, '1(c) Which element(s) could possibly be two edges away from the root?', ['A', 'B', 'C', 'D', 'None of the above'], [2, 3], { ...S('4.1'),
      ...note('With 4 items there is one node two edges down, and it needs two smaller ancestors, so only C or D.') }),
    text('2. A MinHeap holds the numbers 1, 2, …, 1023, stored in an array with index 0 empty.'),
    blank(36, '2(a) What is the minimum index that could contain 8?', '2', S('4.2')),
    blank(37, '2(a) And the maximum index?', '255', { ...S('4.2'),
      ...note('8 needs at least its ancestors to be smaller: at most 7 of them, so depth at most 7 (indices up to 255). At the top, it can sit right under 1 at index 2.') }),
    blank(38, '2(b) If 8 is at its minimum possible index, which other numbers can only be at exactly one index? (List the numbers, separated by commas.)', list('1', '2'), S('4.2')),
    blank(39, '2(b) Their indices, in the same order', list('1', '3'), S('4.2')),
    blank(40, '2(c) If 8 is at its maximum possible index, which other numbers can only be at exactly one index?', list('1', '2', '3', '4', '5', '6', '7'), S('4.2')),
    blank(41, '2(c) Their indices, in the same order', list('1', '3', '7', '15', '31', '63', '127'), { ...S('4.2'),
      ...note('At index 255, 8’s ancestors are at 127, 63, 31, 15, 7, 3, 1 and must be exactly 7, 6, 5, 4, 3, 2, 1 from the bottom up.') }),
    text('3. A MaxHeap holds the numbers 1, 2, …, 1023, stored in an array with index 0 empty.'),
    blank(42, '3(a) What is the minimum index that could contain 8?', '128', S('4.3')),
    blank(43, '3(a) And the maximum index?', '1023', { ...S('4.3'),
      ...note('In a max heap 8 can only have descendants smaller than it (at most 7), so it must be in the bottom levels: index 128 or later; any leaf, up to 1023, works.') }),
    blank(44, '3(b) If 8 is at its minimum possible index, which other numbers can only be at exactly one index?', '1023', S('4.3')),
    blank(45, '3(b) Their indices, in the same order', '1', S('4.3')),
    blank(46, '3(c) If 8 is at its maximum possible index, which other numbers can only be at exactly one index?', '1023', S('4.3')),
    blank(47, '3(c) Their indices, in the same order', '1', { ...S('4.3'), ...note('Only the maximum, 1023, is forced: it’s always at the root.') }),
  ]),
  problem('5', 'BST To MinHeap (16.0 pts)', null, [
    text('Eric and Justin convert a Binary Search Tree into a MinHeap with the same elements (the PriorityQueue is implemented like the MinHeap from lecture). Eric says N insertions at O(log N) each take O(N log N); Justin claims it can be done in O(N).'),
    sata(48, '(a) Select all the conditions where MinHeap insertion is a constant-time operation.', ['You are inserting the largest element into the heap', 'You are inserting the smallest element into the heap', 'When the heap is balanced and has an equal number of left and right children for all nodes', 'None of the above'], [0], { ...S('5'),
      ...note('The largest element never swims up. The smallest swims all the way to the root.') }),
    text('(b) Implement toPQ, which must be O(N). You may only use publicly accessible methods of the PriorityQueue.'),
    java(`
public class BSTSet<E extends Comparable<E>> {
    class Node {
        E elem;
        Node left;  // A subtree containing all elements less than elem
        Node right; // A subtree containing all elements greater than elem
        public Node(E elem) { this.elem = elem; }
    }
    public Node root; // ... binary search tree implementation not shown ...

    public PriorityQueue<E> toPQ() {
        PriorityQueue<E> result = new PriorityQueue<E>();
        helper(this.root, result);
        return result;
    }

    private void helper(Node node, PriorityQueue<E> pq) {
        if (⟪a⟫) {
            ⟪b⟫;
            ⟪c⟫;
            ⟪d⟫;
        }
    }
}`, { a: 'node != null', b: 'helper(node.left, pq)', c: 'pq.add(node.elem)', d: 'helper(node.right, pq)' }),
    blank(49, '(b) if (____)', ['node != null', 'null != node'], S('5')),
    blank(50, '(b) First line', 'helper(node.left, pq)', S('5')),
    blank(51, '(b) Second line', 'pq.add(node.elem)', S('5')),
    blank(52, '(b) Third line', 'helper(node.right, pq)', { ...S('5'),
      ...note('An in-order traversal adds the elements in increasing order, so each one is the largest so far and inserts in constant time: O(N) in total.') }),
  ]),
  problem('6', 'Asymptotics (18.0 pts)', null, [
    text('Give the best- and worst-case runtimes of the functions below.'),
    java(`
public static void a(int N) {
    for (int i = 1; i < N; i += 1) {
        for (int j = 1; j < i * i; j += 1) {
            System.out.println("a");
        }
    }
}`),
    mc(53, '(a) Best case', RT, rt('Θ(N³)'), S('6a')),
    mc(54, '(a) Worst case', RT, rt('Θ(N³)'), { ...S('6a'), ...note('1² + 2² + … + N² = Θ(N³).') }),
    java(`
public static void b(int N) {
    if (N <= 1) {
        return;
    }
    for (int i = 0; i < N; i += 2) {
        System.out.println("b");
    }
    b(N / 3);
    b(N / 3);
    b(N / 3);
}`),
    mc(55, '(b) Best case', RT, rt('Θ(N log N)'), S('6b')),
    mc(56, '(b) Worst case', RT, rt('Θ(N log N)'), { ...S('6b'), ...note('Each level of calls does about N/2 work in total, and there are log₃ N levels.') }),
    java(`
public static void c(int N) {
    Random rand = new Random();
    for (int i = 1; i < N; i *= 2) {
        for (int j = 0; j != rand.nextInt(0, i); j += 1) {
            System.out.println("c");
        }
    }
}`),
    mc(57, '(c) Best case', RT, rt('Θ(log N)'), S('6c')),
    mc(58, '(c) Worst case', RT, rt('Never terminates (infinite loop)'), { ...S('6c'),
      ...note('The inner loop stops only when j happens to equal a fresh random number; if j passes it, the loop can run forever.') }),
    java(`
public static void d(int[] arr) {
    int N = arr.length;
    BSTSet<Integer> tree = new BSTSet<>();
    /* Assume that BST implements a binary search tree
     * with no self-balancing optimizations, as seen in lecture */
    for (int i = 0; i < N; i += 1) {
        tree.insert(arr[i]);
    }
}`),
    mc(59, '(d) Best case', RT, rt('Θ(N)'), S('6d')),
    mc(60, '(d) Worst case', RT, rt('Θ(N²)'), { ...S('6d'),
      ...note('Best: all values equal, so each insert stops at the root. Worst: sorted input builds a spindly tree.') }),
    java(`
public static void e(int N) {
    if (N <= 0) { return; }
    if (N % 2 == 0) { return; }
    e(N - 1);
    e(N - 2);
}`),
    mc(61, '(e) Best case', RT, rt('Θ(1)'), S('6e')),
    mc(62, '(e) Worst case', RT, rt('Θ(N)'), { ...S('6e'),
      ...note('Even N returns at once. For odd N, e(N − 1) is even and returns, so only the e(N − 2) chain continues: about N/2 calls.') }),
    java(`
public static void f(int N) {
    if (N == 1) { return; }
    if (isPowerOfTwo(N)) {
        f(N / 2);
    } else {
        f(N - 1);
    }
}
public static boolean isPowerOfTwo(int N) {
    if (N == 1) {
        return true;
    } else if (N % 2 != 0 || N == 0) {
        return false;
    } else {
        return isPowerOfTwo(N / 2);
    }
}`),
    mc(63, '(f) Best case', RT, rt('Θ((log N)²)'), S('6f')),
    mc(64, '(f) Worst case', RT, rt('Θ(N)'), { ...S('6f'),
      ...note('Best: N is a power of two, so log N calls each spend Θ(log N) checking. Worst: N just above a power of two steps down by 1 about N/2 times, and odd numbers fail the check at once.') }),
  ]),
]);
