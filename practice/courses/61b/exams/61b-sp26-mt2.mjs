// Spring 2026 Midterm 2 (Wed 4/8/2026), transcribed from the official solutions (last updated 4/12/26).
// Changed for this site, and said so on the page: 5.3–5.5 ask only True/False (the counterexample is in the answer
// note). Left out: the last page (0 points).
import { exam, problem, text, java, txt, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-sp26-mt2', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });
const NSA = ['Never', 'Sometimes', 'Always'];
const RT = ['Θ(1)', 'Θ(log(log N))', 'Θ(log N)', 'Θ((log N)²)', 'Θ(N)', 'Θ(N log N)', 'Θ(N²)', 'Θ(N² log N)', 'Θ(N³)', 'Θ(N³ log N)', 'Θ(2ᴺ)', 'Θ(3ᴺ)', 'Θ(N!)', 'Θ(Nᴺ)', 'Infinite loop'];
const RT2 = ['Θ(1)', 'Θ(√(log N))', 'Θ(log N)', 'Θ(N^(1/4))', 'Θ(√N)', 'Θ(√N log N)', 'Θ(N)', 'Θ(N√N)', 'Θ(N²)', 'Infinite loop'];
const SEARCH = ['Iterative BFS', 'Recursive BFS', 'Iterative DFS', 'Recursive DFS'];
const KRUSKAL = ['A-B', 'A-D', 'A-E', 'B-C', 'B-E', 'C-D', 'C-E', 'D-E'];
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];

export default exam(E, 'Spring 2026 Midterm 2', {
  exam: 'https://drive.google.com/file/d/19VDARqJvnlj-r2B6D0LCI8C2UarRPEA0/view',
  sol: 'https://drive.google.com/file/d/1H89HDdt1d-mjn_jA3Q_P6YHyHCbULG2D/view',
}, 'sp26-mt2', [
  problem('1', 'Point Farming Be Like: (25.0 pts)', null, [
    sata(1, '1.1 Select all of the statements that are true.', ['Generics allow classes and interfaces to operate with multiple object types', 'A default method of an interface cannot be overridden', 'The @Test tag is just a reminder for the programmer and otherwise doesn’t do anything', 'The @Override tag is necessary for an overridden method to compile and run', 'None of the above'], [0], S('1.1')),
    sata(2, '1.2 Select all options that internally use an Iterator. Assume that lst implements Iterable.', ['for (int i = 0; i < n; i += 1)', 'for (int k : lst)', 'while (lst.size() > 0)', 'while (lst.next != null)', 'None of the above'], [1], { ...S('1.2'),
      ...note('Only the enhanced for loop uses an Iterator. lst.next just reads an instance variable.') }),
    text('1.3 Given the code below, fill in the method header for compareTo.'),
    java(`
public class Mystery implements Comparable<String> {
    ...
    @Override
    public _____ compareTo(_____ other) { ... }
}`),
    mc(3, '1.3 What goes in the first blank?', ['boolean', 'int', 'String', 'Mystery'], 1, { ...S('1.3'), ...note('compareTo always returns an int.') }),
    mc(4, '1.3 What goes in the second blank?', ['Mystery', 'Mystery<String>', 'String', 'Object'], 2, { ...S('1.3'), ...note('The argument type is what’s in Comparable<…>.') }),
    sata(5, '1.4 Select all of the data structures that have a height guaranteed to be O(log N).', ['BSTs', 'B-trees', 'LLRBs', 'Heaps', 'Weighted Quick Union with path compression', 'Weighted Quick Union without path compression', 'None of the above'], [1, 2, 3, 4, 5], { ...S('1.4'),
      ...note('BSTs can be spindly, with height O(N).') }),
    mc(6, '1.5 Suppose we take a valid LLRB and change all red links to black, without performing any balancing operations. The resulting tree is:', ['Always a valid BST, and always a valid LLRB', 'Always a valid BST, but not always a valid LLRB', 'Not always a valid BST, but always a valid LLRB', 'Not always a valid BST, and not always a valid LLRB'], 1, { ...S('1.5'),
      ...note('No node moves, so it’s still a BST. But 8 with a red left child 4 is a valid LLRB, and with that link black it isn’t.') }),
    text('1.6 In the LLRB below, the links labeled red are red; the others are black.'),
    txt(`
            8
      red /   \\
         4     11
        / \\    / red
       2   5  10`),
    mc(7, '1.6 After inserting 9, which balancing operations are required? The first operation:', ['rotateLeft(10)', 'rotateRight(10)', 'rotateRight(11)', 'colorFlip(11)'], 2, S('1.6')),
    mc(8, '1.6 The second operation:', ['rotateLeft(9)', 'rotateRight(11)', 'colorFlip(10)', 'colorFlip(11)'], 2, S('1.6')),
    mc(9, '1.6 The third operation:', ['rotateLeft(8)', 'colorFlip(8)', 'colorFlip(10)', 'Unused'], 1, { ...S('1.6'),
      ...note('9 becomes 10’s red left child, so 11 has two left-leaning reds in a row: rotateRight(11) makes 10 the subtree root with red children 9 and 11. colorFlip(10) then makes 10 red, and 8 now has two red children, so colorFlip(8).') }),
    mc(10, '1.7 What is the resulting array after inserting 4 into the min heap [-, 1, 7, 2, 8, 15, 5, 3, 9]?', ['[-, 1, 7, 2, 8, 15, 5, 3, 9, 4]', '[-, 1, 4, 2, 7, 15, 5, 3, 9, 8]', '[-, 1, 2, 3, 7, 15, 5, 4, 9, 8]', '[-, 1, 2, 3, 4, 5, 7, 8, 9, 15]'], 1, { ...S('1.7'),
      ...note('4 goes in at index 9 under 8 (index 4): swap; then under 7 (index 2): swap; then 1 at the root is smaller, so it stops.') }),
    text('1.8 Consider the Weighted Quick Union without path compression: [4, 2, -5, 6, -4, 2, 4, 2, 2].'),
    sata(11, '1.8 What are the roots of the sets with the maximum height?', DIGITS, [4], S('1.8')),
    sata(12, '1.8 After calling union(6, 7), what are the new roots of the sets with the maximum height?', DIGITS, [2], { ...S('1.8'),
      ...note('Root 2 has children 1, 5, 7, 8: height 1. Root 4 has 0 and 6 under it, and 3 under 6: height 2. union(6, 7) joins 4’s set (size 4) under 2 (size 5), giving 2 a tree of height 3.') }),
    sata(13, '1.9 Select all of the Weighted Quick Unions that are valid without path compression.', ['[-3, 0, 1, -2, 3]', '[-5, 0, 0, 1, 2]', '[-4, 0, 0, 1, -1]', '[2, 0, -5, 2, 2]'], [2, 3], S('1.9')),
    text('1.10 In the two heaps below, the letters represent unknown integer values. Find the range of possible values for each letter (heaps can contain duplicates).'),
    txt(`
Min heap:        4              Max heap:       185
               /   \\                          /     \\
              6     8                        M       10
             / \\   / \\                      / \\     /  \\
            6   K M   11                   5   99  K   -3`),
    blank(14, '1.10 The smallest possible K', '6', S('1.10')),
    blank(15, '1.10 The largest possible K', '10', S('1.10')),
    blank(16, '1.10 The smallest possible M', '99', S('1.10')),
    blank(17, '1.10 The largest possible M', '185', { ...S('1.10'),
      ...note('Min heap: K ≥ 6 (its parent) and M ≥ 8. Max heap: K ≤ 10 and 99 ≤ M ≤ 185. Together: 6 ≤ K ≤ 10 and 99 ≤ M ≤ 185.') }),
    blank(18, '1.11 What is the minimum height of a 2-3 tree with exactly 6 numbers? (Height is the number of edges from the root to a leaf.)', '1', S('1.11')),
    blank(19, '1.11 And the maximum height?', '1', { ...S('1.11'),
      ...note('Height 0 holds at most 2 numbers; height 2 needs at least 7 (a 2-node root with two 2-node children and four leaves). So 6 numbers always give height 1.') }),
    mc(20, '1.12 After inserting N distinct items into a hash set with resizing, the runtime of a contains operation is ____ Θ(N).', NSA, 1, { ...S('1.12'),
      ...note('With well-spread hash codes it’s constant; if they all collide, one bucket holds all N items.') }),
    mc(21, '1.13 Suppose you implement a hash set without resizing. The hash set will ____ return the correct answer for any call to contains.', NSA, 2, { ...S('1.13'), ...note('Resizing affects speed, not correctness.') }),
    mc(22, '1.14 Suppose you implement a hash set without resizing. After inserting N distinct items, the runtime for any call to contains will ____ be Θ(N).', NSA, 1, { ...S('1.14'),
      ...note('With 4 buckets holding 1, 1, 1 and N − 3 items, contains is constant or linear depending on the bucket.') }),
  ]),
  problem('2', 'Pregame (6.0 pts)', null, [
    text('Given the tree below, select the correct output for each traversal. Break ties alphabetically.'),
    txt(`
           A
         /   \\
        B     C
       / \\
      D   E
       \\  / \\
       F G   H`),
    mc(23, '2.1 Level-order (BFS)', ['ABCDEFGH', 'ABDEFGHC', 'FGHDEBCA', 'FDGHEBCA'], 0, S('2.1')),
    mc(24, '2.2 DFS pre-order', ['ABCDEFGH', 'ABDEFGHC', 'ABDFEGHC', 'ABDFGEHC'], 2, S('2.2')),
    mc(25, '2.3 DFS post-order', ['FDBGHECA', 'FDGHEBCA', 'FGHCDEBA', 'FGHDEBCA'], 1, S('2.3')),
    mc(26, '2.4 DFS in-order', ['ABCDEFGH', 'DFBGEHAC', 'DFGEHBAC', 'FGHDEBCA'], 1, S('2.4')),
    sata(27, '2.5 Select all statements that are true.', ['When run from the same starting node, DFS and BFS will always visit the same set of nodes', 'DFS is typically implemented with a queue, and BFS is typically implemented with a stack', 'DFS and BFS have the same time complexity when run on a spindly tree', 'For an unweighted, connected graph, BFS will always find the shortest path tree from the starting node', 'None of the above'], [0, 2, 3], { ...S('2.5'),
      ...note('DFS uses a stack (or recursion) and BFS a queue. Both are O(V + E) whatever the shape. BFS on an unweighted graph is like Dijkstra’s with equal weights, so it finds the shortest paths tree.') }),
  ]),
  problem('3', 'Can I Speak to Your Supervisor? (25.0 pts)', null, [
    text('In Aditya’s family, a child’s last name is their father’s first name: if Aditya’s father is Lebron James, Aditya’s full name is Aditya Lebron. An AdityaLink is a parent-child relationship (an edge) where the parent node’s firstName equals the child node’s lastName. Not all links in a tree are necessarily AdityaLinks.'),
    mc(28, '3.1 In a tree with V vertices, at most how many AdityaLinks can there be?', ['1', 'V/2', 'V − 1', 'V', 'Cannot be determined with just V'], 2, { ...S('3.1'), ...note('A tree with V vertices has V − 1 edges.') }),
    text('3.2 Implement countAdityaLinks, which takes the root node of a tree and returns the total number of AdityaLinks in it.'),
    java(`
public class Node {
    public String firstName;
    public String lastName;
    public List<Node> children;
    ...
}

public int countAdityaLinks(Node root) {
    int num = 0;
    Queue<Node> queue = new LinkedList<>();
    ⟪a⟫;
    while (⟪b⟫) {
        Node n = ⟪c⟫;
        for (Node child : ⟪d⟫) {
            if (⟪e⟫) {
                ⟪f⟫;
            }
            ⟪g⟫;
        }
    }
    return num;
}`, { a: 'queue.add(root)', b: 'queue.size() != 0', c: 'queue.remove()', d: 'n.children', e: 'n.firstName.equals(child.lastName)', f: 'num++', g: 'queue.add(child)' }),
    blank(29, '3.2 Before the loop', 'queue.add(root)', S('3.2')),
    blank(30, '3.2 while (____)', ['queue.size() != 0', '!queue.isEmpty()', 'queue.size() > 0'], S('3.2')),
    blank(31, '3.2 Node n = ____', 'queue.remove()', S('3.2')),
    blank(32, '3.2 for (Node child : ____)', 'n.children', S('3.2')),
    blank(33, '3.2 if (____)', ['n.firstName.equals(child.lastName)', 'child.lastName.equals(n.firstName)'], S('3.2')),
    blank(34, '3.2 Inside the if', ['num++', 'num += 1', 'num = num + 1', '++num'], S('3.2')),
    blank(35, '3.2 After the if', 'queue.add(child)', S('3.2')),
    mc(36, '3.3 Which algorithm best describes countAdityaLinks?', SEARCH, 0, { ...S('3.3'),
      ...note('It takes nodes from a queue in a loop. (Some students wrote a recursive DFS instead, which also works.)') }),
    text('Note: 3.4–3.6 are independent of 3.1–3.3.',
      'A KarenTree is a tree where, for every node, the node’s supervisor equals the name of any one of its ancestors. The ancestors of a non-root node n are all the nodes on the path from the root to n, excluding n. The root’s ancestor is itself.'),
    java(`
public class Node {
    public String name;
    public String supervisor;
    public List<Node> children;
    ...
}`),
    text('3.4 Which of the following trees is a valid KarenTree? Exactly one is valid. Each node is written name (supervisor), with children indented under their parent.'),
    txt(`
Tree 1:
Aditya (Aditya)
  Natalia (Aditya)
    Rushil (Natalia)
      Avik (Aditya)
      Ishanth (Brian)
      Amanda (Natalia)

Tree 2:
Peyrin (Peyrin)
  Alvin (Peyrin)
  Joey (Peyrin)
    Narges (Joey)
    Kubi (Alvin)

Tree 3:
Justin (Justin)
  Gireeja (Justin)
    Sergey (Gireeja)
  Alyosha (Justin)
  Miki (Justin)
    John (Miki)
    Dan (Justin)`),
    mc(37, '3.4 Which tree is a valid KarenTree?', ['Tree 1', 'Tree 2', 'Tree 3'], 2, { ...S('3.4'),
      ...note('In Tree 1, Brian isn’t an ancestor of Ishanth. In Tree 2, Alvin is higher up but on a different branch, so not an ancestor of Kubi.') }),
    text('3.5 Implement isKarenTree, which takes the root node of a tree and returns whether it is a KarenTree. All names are unique, the input isn’t null, no Nodes in children are null, supervisor is never null, and the root’s supervisor equals its name.'),
    java(`
public boolean isKarenTree(Node root) {
    ⟪a⟫ ancestors = ⟪b⟫;
    ⟪c⟫;
    ⟪d⟫;
}

private boolean karenHelper(Node n, Set<String> ancestors) {
    if (⟪e⟫) {
        return false;
    }
    ⟪f⟫;
    for (Node child : ⟪g⟫) {
        if (⟪h⟫) {
            ⟪i⟫;
        }
    }
    ⟪j⟫;
    ⟪k⟫;
}`, { a: 'Set<String>', b: 'new HashSet<>()', c: 'ancestors.add(root.supervisor)', d: 'return karenHelper(root, ancestors)', e: '!ancestors.contains(n.supervisor)', f: 'ancestors.add(n.name)', g: 'n.children', h: '!karenHelper(child, ancestors)', i: 'return false', j: 'ancestors.remove(n.name)', k: 'return true' }),
    blank(38, '3.5 The type of ancestors', ['Set<String>', 'HashSet<String>'], S('3.5')),
    blank(39, '3.5 ancestors = ____', ['new HashSet<>()', 'new HashSet<String>()', 'new TreeSet<>()'], S('3.5')),
    blank(40, '3.5 Next line of isKarenTree', ['ancestors.add(root.supervisor)', 'ancestors.add(root.name)'], S('3.5')),
    blank(41, '3.5 Last line of isKarenTree', 'return karenHelper(root, ancestors)', S('3.5')),
    blank(42, '3.5 if (____) return false', '!ancestors.contains(n.supervisor)', S('3.5')),
    blank(43, '3.5 After that check', 'ancestors.add(n.name)', S('3.5')),
    blank(44, '3.5 for (Node child : ____)', 'n.children', S('3.5')),
    blank(45, '3.5 if (____) inside the loop', '!karenHelper(child, ancestors)', S('3.5')),
    blank(46, '3.5 Inside that if', 'return false', S('3.5')),
    blank(47, '3.5 After the loop', 'ancestors.remove(n.name)', S('3.5')),
    blank(48, '3.5 Last line of karenHelper', 'return true', { ...S('3.5'),
      ...note('Keep the set of names on the path from the root. Each node’s supervisor must be in it; add the node’s name before visiting its children, and remove it afterwards so siblings’ subtrees don’t see it.') }),
    mc(49, '3.6 Which algorithm best describes isKarenTree?', SEARCH, 3, S('3.6')),
  ]),
  problem('4', 'FAHHHHHH-symptotics (12.0 pts)', null, [
    text('4.1 What is the runtime of factor in terms of N?'),
    java(`
public void factor(int N) {
    if (N <= 1) {
        return;
    }
    for (int i = 2; i <= N; i += 1) {
        if (N % i == 0) {
            factor(N/i);
            return;
        }
    }
}`),
    mc(50, '4.1 Best case', RT, 2, S('4.1')),
    mc(51, '4.1 Worst case', RT, 4, { ...S('4.1'),
      ...note('Best: N is a power of 2, so each call divides by 2 right away: Θ(log N). Worst: N is prime, so the loop runs to N once. Note the return right after the recursive call.') }),
    text('4.2 What is the runtime of ethan in terms of N?'),
    java(`
public void ethan(int N) {
    int remaining = N;
    while (remaining > 1) {
        if (Math.random() > 0.5) {
            return;
        }
        remaining -= tam(N);
    }
}

public int tam(int k) {
    int m = 0;
    for (int i = 1; i < Math.sqrt(k); i += 1) {
        m += 1;
    }
    return m;
}`),
    mc(52, '4.2 Best case', RT2, 0, S('4.2')),
    mc(53, '4.2 Worst case', RT2, 6, { ...S('4.2'),
      ...note('Best: Math.random() > 0.5 at once. Worst: each iteration does √N work and subtracts about √N, so √N iterations: Θ(N).') }),
    text('4.3 What is the runtime of removeDupesAndSort in terms of N, where N = arr.length? Assume all HashSet operations run in Θ(1).'),
    java(`
public int[] removeDupesAndSort(int[] arr) {
    Set<Integer> seen = new HashSet<>();
    MinPQ<Integer> pq = new MinPQ<>(); // heap based MinPQ

    for (int x : arr) {
        if (!seen.contains(x)) {
            pq.insert(x);
            seen.add(x);
        }
    }

    int[] result = new int[pq.size()];
    for (int i = 0; i < result.length; i += 1) {
        result[i] = pq.removeSmallest();
    }
    return result;
}`),
    mc(54, '4.3 Best case', RT, 4, S('4.3')),
    mc(55, '4.3 Worst case', RT, 5, { ...S('4.3'),
      ...note('Best: all duplicates, so one insert and one removal after a Θ(N) scan. Worst: no duplicates, N inserts and N removals at Θ(log N) each.') }),
  ]),
  problem('5', 'Tell Your Cat I Said pspspSPTs (and msmsMSTs i guess) (23.0 pts)', null, [
    text('5.1 Suppose we run Dijkstra’s algorithm on this directed graph, starting from A and breaking ties alphabetically:'),
    txt(`
A → B   4        B → D   6        F → A   7
A → C   2        B → F   1        F → C   3
C → E   5        D → E   2        F → D   2
                                  F → E   3`),
    blank(56, '5.1 distTo for B, C, D, E, F (in that order, separated by commas) immediately after removing B from the fringe and relaxing all of B’s outgoing edges', ['4, 2, 10, 7, 5', '4 2 10 7 5'], S('5.1')),
    blank(57, '5.1 edgeTo for B, C, D, E, F at that point', ['A, A, B, C, B', 'A A B C B'], { ...S('5.1'),
      ...note('A is removed first (C = 2, B = 4), then C (E = 7 via C), then B (D = 10 and F = 5 via B).') }),
    text('5.2 Suppose we run Kruskal’s algorithm on this undirected graph. For each iteration, select the edge(s) that could be added to the MST.'),
    txt(`
A — B   6        A — E   5        B — E   3
A — D   7        B — C   3        C — E   2
C — D   8        D — E   5`),
    sata(58, '5.2 First iteration', KRUSKAL, [6], { ...S('5.2'), ...note('The lightest edge is C–E (2).') }),
    sata(59, '5.2 Second iteration', KRUSKAL, [3, 4], { ...S('5.2'), ...note('B–C and B–E both weigh 3 and no tiebreak is given.') }),
    sata(60, '5.2 Third iteration', KRUSKAL, [2, 7], { ...S('5.2'), ...note('Once either B edge is in, the other makes a cycle, so the next lightest is 5: A–E or D–E.') }),
    mc(61, '5.3 True or false: for every vertex in a directed acyclic graph with positive edge weights, Josh wants the length of the longest path from a source s. A valid solution is to negate the edge weights, run Dijkstra’s from s, and use the final distTo values as the lengths.', ['True', 'False'], 1, { ...S('5.3'),
      ...note('Counterexample: s → A (1), s → B (2), A → B (1000), B → C (2). Negated, Dijkstra’s takes s → B (−2) first and finishes B before finding s → A → B, so it never finds the longest path s → A → B → C.') }),
    mc(62, '5.4 True or false: given a graph G with V ≥ 3 vertices and only non-negative edge weights, Karen can change exactly one edge’s weight to 0 to minimize the shortest path from A to B. A valid solution is to run Dijkstra’s from A to find the shortest path to B, then set the heaviest edge on that path to 0.', ['True', 'False'], 1, { ...S('5.4'),
      ...note('Counterexample: A–B 8, A–C 2, C–B 3. The shortest path is A–C–B; zeroing its heaviest edge gives 2, but zeroing A–B gives 0.') }),
    mc(63, '5.5 For a connected graph G with N ≥ 3 vertices and N edges with unique edge weights, the MST of G will ____ consist of all edges except the one with maximum weight.', ['Always', 'Not always'], 1, { ...S('5.5'),
      ...note('Counterexample: A–B 4, B–C 2, B–D 3, C–D 1. The heaviest edge A–B is the only way to reach A, so the MST drops B–D instead.') }),
    text('5.6 No valid topological ordering exists for this directed graph:'),
    txt(`
R → H    R → I    U → I    I → U    U → L
S → L    L → I    I → H`),
    mc(64, '5.6 Which single edge needs to be removed so that a valid topological ordering exists?', ['I → H', 'I → U', 'L → I', 'R → H', 'R → I', 'S → L', 'U → I', 'U → L'], 1, { ...S('5.6'),
      ...note('I → U is in both cycles: U → L → I → U and U → I → U.') }),
    text('5.7 Consider the DAG with edges A → V, V → K and I → K. Select all vertices that could be at each index of any valid topological ordering.'),
    sata(65, '5.7 Index 0', ['A', 'V', 'I', 'K'], [0, 2], S('5.7')),
    sata(66, '5.7 Index 1', ['A', 'V', 'I', 'K'], [0, 1, 2], S('5.7')),
    sata(67, '5.7 Index 2', ['A', 'V', 'I', 'K'], [1, 2], S('5.7')),
    sata(68, '5.7 Index 3', ['A', 'V', 'I', 'K'], [3], { ...S('5.7'),
      ...note('The orderings are AVIK, AIVK and IAVK, so index 0 can be A or I, index 1 A, V or I, index 2 V or I, and K is always last.') }),
  ]),
  problem('6', 'Dear Chat, (9.0 pts)', null, [
    sata(69, '6.1 Select all of the statements that are true about Project 3: Percolation.', ['For an N × N grid, if percolates returns true, then at most N sites must be open', 'The percolates method does not require any arguments', 'The backwash problem was solved by making all methods run in O(log N) time', 'isOpen runs in Θ(log N) in the worst case', 'None of the above'], [1], { ...S('6.1'),
      ...note('With every site open it percolates. percolates just checks whether the virtual top connects to the virtual bottom. Backwash has nothing to do with runtime, and isOpen uses a separate (non-WQU) structure.') }),
    sata(70, '6.2 Select all of the statements that are true about Project 4: WordNet.', ['The k == 0 case did not use NGramMap, and the k != 0 case did use NGramMap', 'A word can appear in multiple synsets, and a synset can contain multiple words', 'If our input was ["dog", "cow"], then HyponymsHandler returns all the hyponyms of "dog" plus all the hyponyms of "cow"', 'A recursive graph traversal is more efficient than an iterative traversal due to the WordNet graph’s cyclical nature', 'None of the above'], [0, 1], { ...S('6.2'),
      ...note('k != 0 needs word counts from NGramMap. Multiple words return the intersection of their hyponyms, not the union. The WordNet graph isn’t cyclic, and cycles wouldn’t make recursion faster anyway.') }),
    text('6.3 Suppose we execute the following lines using the BSTMap from Homework 6.'),
    java(`
BSTMap<Integer, String> map = new BSTMap<>();
map.put(3, "Kevin");
map.put(3, "Gru");
map.put(50, "Stuart");
map.put(34, "Agnes");`),
    mc(71, '6.3 What does map.size() return?', ['1', '2', '3', '4'], 2, S('6.3')),
    sata(72, '6.3 Calling map.put(66, "Victor") requires comparisons to which of the following?', ['3', '34', '50', '"Agnes"', '"Gru"', '"Kevin"', '"Stuart"'], [0, 2], { ...S('6.3'),
      ...note('The second put replaces 3’s value, so the map is 3 → 50 → 34 (left of 50). Only keys are compared: 66 goes right of 3, then right of 50.') }),
    text('6.4 Given the stack trace below, which method of ArrayDeque61B.java contains the line that triggers the exception?'),
    txt(`
java.lang.IndexOutOfBoundsException: Index 8 out of bounds for length 8
  at ArrayDeque61B.get(ArrayDeque61B.java:34)
  at ArrayDeque61B.toList(ArrayDeque61B.java:67)
  at ArrayDeque61B.printDeque(ArrayDeque61B.java:99)
  at TestDeque.test1(TestDeque.java:64)`),
    mc(73, '6.4 Which method?', ['get', 'toList', 'printDeque', 'test1'], 0, { ...S('6.4'),
      ...note('The top of a stack trace is the most recent call, where the exception was thrown.') }),
  ]),
]);
