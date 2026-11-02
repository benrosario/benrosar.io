// Fall 2020 Midterm 2, transcribed from the official solutions (last updated 1/10/20). (This exam’s points total 960.)
// The course’s topic index has no entries for this exam, so its topic tags are this site’s.
// Changed for this site, and said so on the page: pictures (heaps, the trie, the LLRB, the k-d tree) are text; the
// free-form compress (5) and window (8c) have blanks following the solution’s structure.
import { exam, problem, text, java, txt, blank, mc, sata } from '../../../content/author.mjs';
import { site } from '../staff.mjs';

const E = '61b-fa20-mt2';
const note = (x, o = {}) => ({ x, ...o });
const D = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];
const RT = ['Θ(1)', 'Θ(log log N)', 'Θ((log N)²)', 'Θ(log N)', 'Θ(N)', 'Θ(N log N)', 'Θ(N²)', 'Θ(N² log N)', 'Θ(N³)', 'Θ(N³ log N)', 'Θ(N⁴)', 'Θ(N⁴ log N)', 'Worse than Θ(N⁴ log N)', 'Never terminates (infinite loop)'];
const rt = s => RT.indexOf(s);
const H = site('HEAPS'), A = site('ASYMPTOTICS');

export default exam(E, 'Fall 2020 Midterm 2', {
  exam: 'https://drive.google.com/file/d/1XiwxEwQs0tYdPOQUYZE8-MEzMH22OHrc/view',
  sol: 'https://drive.google.com/file/d/1HSuZJyBdn7UpKYvvMdbXG1WvZ3fYKvOt/view',
}, 'fa20-mt2', [
  problem('1', 'Heap Operations (55 pts)', null, [
    text('Consider this min-heap (written as its array, without the unused first spot): [1, 2, 3, 4, 5, 7, 8, 6].'),
    txt(`
          1
       /     \\
      2       3
     / \\     / \\
    4   5   7   8
   /
  6`),
    text('(a) We call insert(0). The resulting min-heap has 9 elements. (a) is the root, (b) the root’s right child, (c) the root’s left child’s left child, and (d) that node’s right child (the new 9th spot).'),
    mc(1, '(a) What number is at (a)?', D, 0, H),
    mc(2, '(a) What number is at (b)?', D, 3, H),
    mc(3, '(a) What number is at (c)?', D, 2, H),
    mc(4, '(a) What number is at (d)?', D, 4, { ...H, ...note('0 goes in under 4 and swims up past 4, 2 and 1: the array becomes [0, 1, 3, 2, 5, 7, 8, 6, 4].') }),
    text('(b) Starting from the same heap, we call removeMin three times. The result has five elements: (a) the root, (b) its left child, (c) its right child, and (d), (e) the left child’s children.'),
    mc(5, '(b) What number is at (a)?', D, 4, H),
    mc(6, '(b) What number is at (b)?', D, 5, H),
    mc(7, '(b) What number is at (c)?', D, 7, H),
    mc(8, '(b) What number is at (d)?', D, 6, H),
    mc(9, '(b) What number is at (e)?', D, 8, { ...H, ...note('The heap ends as [4, 5, 7, 6, 8].') }),
  ]),
  problem('2', 'Trie Operations (60 pts)', null, [
    text('The trie below stores the keys goal, chin, chair, sun, sunny, sue and sued. Its paths: g–o–a–l; c–h–i–n and c–h–a–i–r; s–u–n–n–y and s–u–e–d. The nodes ending a key (isKey true) are l, the n of chin, r, the first n of sun, y, e and d.'),
    sata(10, '(a) If we call keysWithPrefix("su"), what keys are returned?', ['sun', 'chin', 'sued', 'goal', 'sue', 'sunn', 'chair', 'sunny', 'n', 'y', 'e', 'd'], [0, 2, 4, 7], site('TRIES')),
    sata(11, '(b) What key, when added, creates the fewest nodes? If several tie, select all of them.', ['goals', 'in', 'goat', 'soccer', 'chain', 'cheese', 'at', 'camel'], [0, 2, 4], { ...site('TRIES'),
      ...note('goals, goat and chain each need just one new node.') }),
    text('(c) shortestPrefixOf(String s) returns the shortest key in the trie that is a prefix of s; e.g. shortestPrefixOf("goalie") returns "goal", and a string is a prefix of itself. It traverses no more nodes than necessary.'),
    sata(12, '(c) Which s maximizes the number of nodes traversed? If several tie, select all of them.', ['sun', 'sunnyday', 'sunny', 'chin', 'sue', 'goal', 'sued', 'sunn', 'chair', 'chairlift'], [8, 9], { ...site('TRIES'),
      ...note('The search stops at the first key it reaches. chair (and chairlift) walk c–h–a–i–r, 5 nodes, before reaching a key; the s words stop at sun or sue after 3.') }),
  ]),
  problem('3', 'Heap Iterator (50 pts)', null, [
    text('XMinPQ implements the MinPQ interface for Integers, where an Integer’s priority is itself. Don’t assume XMinPQ uses a heap.'),
    java(`
public class XMinPQ implements MinPQ<Integer>, Iterable<Integer> {
    public void add(Integer x) {...}
    public Integer getSmallest() {...}
    public Integer removeSmallest() {...}
    public int size() {...}
    public Iterator<Integer> iterator() {
        return new XIterator();
    }
    private class XIterator implements Iterator<Integer> {
        public int x;
        public XIterator() {
            x = removeSmallest();
        }
        public boolean hasNext() {
            return x > 0;
        }
        public Integer next() {
            x = x - 1;
            return removeSmallest();
        }
    }
}

public static void main(String[] args) {
    XMinPQ mpq = new XMinPQ();
    mpq.add(4);
    mpq.add(1);
    mpq.add(5);
    mpq.add(2);
    mpq.add(6);
    mpq.add(3);
    mpq.add(8);
    mpq.add(7);
    for (int i: mpq) {
        System.out.print(i + " "); // line 1
    }
    System.out.println();
    for (int i: mpq) {
        System.out.print(i + " "); // line 2
    }
}`),
    blank(13, 'What does line 1 print? (Numbers separated by spaces.)', '2', site('HEAPS', 'ITERATORS')),
    blank(14, 'What does line 2 print?', ['4 5 6', '4, 5, 6'], { ...site('HEAPS', 'ITERATORS'),
      ...note('Making an iterator removes the smallest item as the count: the first removes 1, so it returns one item, 2. The second removes 3, so it returns 4, 5, 6.') }),
  ]),
  problem('4', 'Asymptotics (230 pts)', null, [
    text('For each, give the worst-case runtime in Θ notation as a function of N.'),
    java(`
public static void loops(int N) {
    for (int i = 1; i < 2; i += 1) {
        for (int j = 2; j < 4; j = j * j) {
            for (int k = 3; k < N; k = k * 2) {
                for (int m = 4; m < 8; m = m * m * m) {
                    System.out.println("hello");
                }
            }
        }
    }
}`),
    mc(15, '(a) loops', RT, rt('Θ(log N)'), { ...A, ...note('Every loop but k’s runs once; k doubles up to N.') }),
    java(`
public static void addToSet(int N) {
    HashSet<RandomThing> m = new HashSet<>();
    for (int i = 0; i < N; i += 1) {
        // getNextRandomThing takes constant time
        RandomThing rt = getNextRandomThing();
        m.add(rt);
    }
}`),
    mc(16, '(b) addToSet', RT, rt('Θ(N²)'), { ...site('ASYMPTOTICS', 'HASHING'), ...note('In the worst case every RandomThing hashes to the same bucket.') }),
    java(`
public static List<Integer> nestedSum(List<Integer> x) {
    List<Integer> newInts = new ArrayList<>();
    for (int i : x) {
        for (int j : x) {
            newInts.add(i + j);
        }
    }
    return newInts;
}

List<Integer> x = getIntegers(); // getIntegers returns a List of Integers
int N = x.size();
List<Integer> x2 = nestedSum(nestedSum(x));`),
    mc(17, '(c) nestedSum(nestedSum(x))', RT, rt('Θ(N⁴)'), { ...A, ...note('The inner call returns N² items, so the outer call does (N²)² work.') }),
    java(`
private static void g(int N, int ss) {
    if (ss > N) {
        return;
    }
    for (int i = 0; i < N; i += ss) {
        System.out.print(i + " ");
    }
    System.out.println();
    g(N, ss * 2);
}
// Give the runtime for g(N, 1);`),
    mc(18, '(d) g(N, 1)', RT, rt('Θ(N)'), { ...A, ...note('N + N/2 + N/4 + … < 2N.') }),
    java(`
private static void g2(int N, int ss) {
    if (ss > N) {
        return;
    }
    for (int i = 0; i < N; i += ss) {
        System.out.print(i + " ");
    }
    System.out.println();
    g2(N, ss * 2);
    g2(N, ss * 2);
}
// Give the runtime for g2(N, 1);`),
    mc(19, '(e) g2(N, 1)', RT, rt('Θ(N log N)'), { ...A, ...note('Each level of calls does N work in total (twice as many calls, each half as much), for log N levels.') }),
    java(`
public void func(int N) {
    int Q = 0;
    for (int i = 1; i < N; i *= 3) {
        Q += 1;
    }
    disco(Q);
}
public void disco(int Q) {
    if (Q == 0) {
        return;
    }
    for (int i = 0; i < Q; i += 1) {
        System.out.println("hi");
    }
    disco(Q - 1);
}`),
    mc(20, '(f) func', RT, rt('Θ((log N)²)'), { ...A, ...note('Q is about log₃ N, and disco does Q + (Q − 1) + … + 1 = Θ(Q²).') }),
  ]),
  problem('5', 'Compress (60 pts)', null, [
    text('Consider the UnionFind class from lab (no path compression). We add compress, which compresses the height of each tree to 1 by connecting every vertex to its root. For example, compress turns the parent array {−4, 0, 0, 2, −4, 4, 4, 6} into {−4, 0, 0, 0, −4, 4, 4, 4}: vertices 3 and 7 connect to their roots, and the roots (0, 4) and the vertices already under them (1, 2, 5, 6) don’t change. Use the given skeleton.'),
    java(`
public class UnionFind {
    private int[] parent;
    public int sizeOf(int v1) {
        int root = find(v1);
        return -1 * parent[root];
    }
    public boolean isConnected(int v1, int v2) {
        return find(v1) == find(v2);
    }
    public void connect(int v1, int v2) { ... }
    // Path compression is NOT implemented
    public int find(int v1) { ... }

    public void compress() {
        for (⟪a⟫) {
            if (⟪b⟫) {
                ⟪c⟫;
            }
        }
    }
}`, { a: 'int i = 0; i < parent.length; i++', b: 'parent[i] >= 0', c: 'parent[i] = find(i)' }),
    blank(21, '(a) The loop header', ['int i = 0; i < parent.length; i++', 'int i = 0; i < parent.length; i += 1'], site('DISJOINT_SETS')),
    blank(22, '(b) if (____)', ['parent[i] >= 0', 'i != find(i)', 'parent[i] > -1'], site('DISJOINT_SETS')),
    blank(23, '(c) Inside the if', 'parent[i] = find(i)', { ...site('DISJOINT_SETS'),
      ...note('Point every non-root straight at its root; roots keep their negative sizes.') }),
  ]),
  problem('6', 'LLRB Insertions (150 pts)', null, [
    text('We use this LLRB (links labeled red are red; the others are black):'),
    txt(`
                18
          red /     \\
            6         24
          /   \\      /   \\
         4     8    22    40
        / \\   / \\   / red
       3   5 7  17 21`),
    text('For each prompt, give a single int which, inserted into the LLRB above, causes exactly the requested balance operation and no other. If several work, give the smallest positive one; if none does, write None. Each part starts from the tree above.'),
    blank(24, '(a) A single rotateLeft', '41', { ...site('RED_BLACK_TREES'), ...note('41 becomes a red right child of 40, which has no left child: one rotateLeft. No integer fits as a right child further left.') }),
    blank(25, '(b) A single rotateRight', ['None', 'none'], { ...site('RED_BLACK_TREES'), ...note('A rotateRight always leaves a node with two red children, so a colorFlip follows.') }),
    blank(26, '(c) A single colorFlip', '23', { ...site('RED_BLACK_TREES'), ...note('23 becomes 22’s red right child next to red 21: colorFlip(22), and 22 is a left child, so nothing else.') }),
    text('Now consider the corresponding 2-3 tree. Values may be any real number (e.g. 3.6).'),
    blank(27, '(d) What is the minimum number of values we must add to increase its height?', '3', site('B_TREES', 'RED_BLACK_TREES')),
    blank(28, '(e) What is the maximum number of values we can add without increasing its height?', '14', { ...site('B_TREES', 'RED_BLACK_TREES'),
      ...note('The 2-3 tree is [6 18] with children [4], [8] and [24], and leaves [3], [5], [7], [17], [21 22] and [40]. Filled to height 2 it can hold 26 values (13 nodes × 2); it holds 12 now.') }),
  ]),
  problem('7', 'By The Numbers (175 pts)', null, [
    text('For each scenario, give the minimum and maximum. If there is no min or max, write None. Height is the number of links from the root to the farthest leaf (a tree with 2 nodes has height 1); a node’s depth is the number of links from the root to it (the root has depth 0). BSTs have no duplicates.'),
    blank(29, '(a) The number of nodes in a non-empty tree which is both a BST and a max-heap: minimum', '1', site('BSTS', 'HEAPS')),
    blank(30, '(a) …maximum', '2', { ...site('BSTS', 'HEAPS'), ...note('A max-heap needs children smaller than the parent, so only a left child, but a heap must be complete: at most one child.') }),
    blank(31, '(b) The height of a BST with 7 nodes where the median is the root: minimum', '2', site('BSTS')),
    blank(32, '(b) …maximum', '3', { ...site('BSTS'), ...note('Each side has 3 nodes, which can be a chain of height 2 below the root.') }),
    blank(33, '(c) The height of a WeightedQuickUnion with 10 items, all connected: minimum', '1', site('DISJOINT_SETS')),
    blank(34, '(c) …maximum', '3', { ...site('DISJOINT_SETS'), ...note('A WQU of height H needs at least 2ᴴ items, and 2⁴ = 16 > 10.') }),
    blank(35, '(d) The depth of the median value in a heap of 15 objects, none duplicates: minimum', '1', site('HEAPS')),
    blank(36, '(d) …maximum', '3', site('HEAPS')),
    blank(37, '(e) The depth of the median value in a BST of 15 objects: minimum', '0', site('BSTS')),
    blank(38, '(e) …maximum', '14', site('BSTS')),
    blank(39, '(f) The length of the longest list in a hash table with 10 buckets and 20 items, each bucket a list: minimum', '2', site('HASHING')),
    blank(40, '(f) …maximum', '20', site('HASHING')),
    blank(41, '(g) The height of the tallest tree in a hash table with 10 buckets and 7 items, each bucket an LLRB: minimum', '0', site('HASHING', 'RED_BLACK_TREES')),
    blank(42, '(g) …maximum', '3', { ...site('HASHING', 'RED_BLACK_TREES'), ...note('All 7 in one LLRB: its height can reach 3 with red links.') }),
  ]),
  problem('8', 'Window (180 pts)', null, [
    text('(a) Point represents a point in 2D space. Fill in isInside so it returns true if the point is inside the window bounded by the given x and y coordinates (points on the boundary count). Assume x1 ≤ x2 and y1 ≤ y2.'),
    java(`
public class Point {
    public double x;
    public double y;
    public Point(double x, double y) {
        this.x = x;
        this.y = y;
    }
    public boolean isInside(double x1, double x2, double y1, double y2) {
        return ⟪a⟫;
    }
}`, { a: 'x1 <= x && x <= x2 && y1 <= y && y <= y2' }),
    blank(43, '(a) return ____', ['x1 <= x && x <= x2 && y1 <= y && y <= y2', 'x >= x1 && x <= x2 && y >= y1 && y <= y2', 'y1 <= y && y <= y2 && x1 <= x && x <= x2'], site('K_D_TREES')),
    text('Now use a k-d tree to find all points inside a window. For example, window(4, 7, 4, 7) on the tree below returns (5, 5) and (5, 6). The method should be efficient and prune branches that definitely contain no points in the window.',
      'The tree, with its branch labels: ψ(2, 3) splits on x, with left branch (a) to γ(1, 5) and right branch (b) to κ(5, 2). γ splits on y, with branches (c) down and (d) up (both empty). κ splits on y, with (e) down (empty) and (f) up to δ(5, 6). δ splits on x, with (g) left to λ(3, 3) and (h) right to π(5, 5). λ splits on y, with (i) down and (j) up; π splits on y, with (k) down and (l) up (all empty).'),
    sata(44, '(b) Which branches can be pruned in the call window(4, 7, 4, 7)? If a branch higher up is pruned, branches below it are not counted (they’re never considered). Branches that don’t point to a node, e.g. (d), can still be pruned.', ['(a)', '(b)', '(c)', '(d)', '(e)', '(f)', '(g)', '(h)', '(i)', '(j)', '(k)', '(l)', 'No branches can be pruned'], [0, 3, 4, 8], { ...site('K_D_TREES'),
      ...note('Following the staff key: (a) holds only x < 2, (e) only y < 2 and (i) only y < 3, all outside the window; (d) is marked pruned as well.') }),
    text('(c) Fill in window (at most 3 lines in its body) and windowHelper.'),
    java(`
private static final boolean HORIZONTAL = false; // we compare x coordinates
private static final boolean VERTICAL = true; // we compare y coordinates
private Node root;

private class Node {
    private Point p;
    private boolean orientation; // true == VERTICAL, false == HORIZONTAL
    private Node leftChild;  // also refers to the "down" child
    private Node rightChild; // also refers to the "up" child
    ...
}

public List<Point> window(double x1, double x2, double y1, double y2) {
    List<Point> points = new LinkedList<>();
    ⟪b⟫;
    return points;
}

private void windowHelper(Node n, List<Point> points, double x1, double x2, double y1, double y2) {
    if (⟪c⟫) {
        return;
    }
    if (n.p.isInside(x1, x2, y1, y2)) {
        points.add(n.p);
    }
    if (n.orientation == HORIZONTAL) {
        if (⟪d⟫) {
            windowHelper(n.leftChild, points, x1, x2, y1, y2);
        }
        if (⟪e⟫) {
            windowHelper(n.rightChild, points, x1, x2, y1, y2);
        }
    } else {
        if (⟪f⟫) {
            windowHelper(n.leftChild, points, x1, x2, y1, y2);
        }
        if (⟪g⟫) {
            windowHelper(n.rightChild, points, x1, x2, y1, y2);
        }
    }
}`, { b: 'windowHelper(root, points, x1, x2, y1, y2)', c: 'n == null', d: 'n.p.x > x1', e: 'n.p.x <= x2', f: 'n.p.y > y1', g: 'n.p.y <= y2' }),
    blank(45, '(c) The middle line of window', 'windowHelper(root, points, x1, x2, y1, y2)', site('K_D_TREES')),
    blank(46, '(c) The base case: if (____) return', 'n == null', site('K_D_TREES')),
    blank(47, '(c) Horizontal node: when to search the left child', ['n.p.x > x1', 'n.p.x >= x1', 'x1 < n.p.x', 'x1 <= n.p.x'], site('K_D_TREES')),
    blank(48, '(c) Horizontal node: when to search the right child', ['n.p.x <= x2', 'x2 >= n.p.x'], site('K_D_TREES')),
    blank(49, '(c) Vertical node: when to search the down child', ['n.p.y > y1', 'n.p.y >= y1', 'y1 < n.p.y', 'y1 <= n.p.y'], site('K_D_TREES')),
    blank(50, '(c) Vertical node: when to search the up child', ['n.p.y <= y2', 'y2 >= n.p.y'], { ...site('K_D_TREES'),
      ...note('Only search a side that could hold points in the window. Ties go right, so the staff used > for the left side, but they accepted >= too.') }),
  ]),
]);
