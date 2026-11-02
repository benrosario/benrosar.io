// Spring 2021 Midterm 2, transcribed from the official solutions. (This exam’s points total 1920.)
// Changed for this site, and said so on the page: graph and tree pictures are text; the free-form setIterator (6) has
// blanks following the solution’s structure; 8(a)’s picture choices are written as nested text.
import { exam, problem, text, java, txt, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-sp21-mt2', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });
const TF = ['True', 'False'];
const V = ['1', '2', '3', '4', '5', '6', '7', '8'];
const RT = ['Θ(1)', 'Θ(log(log N))', 'Θ((log N)²)', 'Θ(log N)', 'Θ(N)', 'Θ(N log N)', 'Θ(N²)', 'Θ(N² log N)', 'Θ(N³)', 'Θ(N³ log N)', 'Θ(N⁴)', 'Θ(N⁴ log N)', 'Worse than Θ(N⁴ log N)', 'Never terminates (infinite loop)'];
const rt = s => RT.indexOf(s);

export default exam(E, 'Spring 2021 Midterm 2', {
  exam: 'https://drive.google.com/file/d/1VlxEIjd19mW8ftxozoPLWYhjBO_yDfia/view',
  sol: 'https://drive.google.com/file/d/1jqFbU5OyV6_7ttEwTxHeKvIi7cjmC13-/view',
}, 'sp21-mt2', [
  problem('1', 'Graph Traversals (205 pts)', null, [
    text('Consider the undirected graph with these edges:'),
    txt(`
3 — 7    7 — 1    7 — 5    1 — 5
6 — 2    2 — 4    5 — 4    4 — 8`),
    mc(1, '(a) If we perform a BFS traversal starting from vertex 7, what will be the final vertex visited?', V, 5, { ...S('1'),
      ...note('By distance from 7: 7; 1, 3, 5; 4; 2, 8; 6.') }),
    sata(2, '(b) What start vertex (or vertices) will result in a DFS pre-order of 84265173? Ties are broken numerically. If none, select Impossible.', [...V, 'Impossible'], [7], S('1')),
    sata(3, '(c) What start vertex (or vertices) will result in a DFS post-order of 84265173? Ties are broken numerically.', [...V, 'Impossible'], [8], { ...S('1'),
      ...note('A post-order ends with the start vertex, so it would have to start at 3. From 3, DFS goes 3 → 7 → 1 → 5 → 4 → 2 → 6 (smallest neighbor first), so 6 would finish first, not 8.') }),
    mc(4, '(d) We want a DFS pre-order of 12345678. No vertex gives that now. What is the minimum number of edges to add so that a pre-order traversal could yield this order from some start vertex?', [...V, 'Impossible'], 3, S('1')),
  ]),
  problem('2', 'Heaps and Tree Traversals (120 pts)', null, [
    text('An ArrayHeap<Integer> uses the array representation from class (the leftmost item is unused). Its array is [-, −5, 4, −1, 5, 6, 0, 0, 10].'),
    mc(5, '(a) In a pre-order traversal of the heap represented by this array, what is the last value?', ['-5', '-1', '3', '0', '4', '5', '6', '10'], 3, S('2')),
    mc(6, '(b) In an in-order traversal, what is the last value?', ['-5', '-1', '3', '0', '4', '5', '6', '10'], 3, { ...S('2'),
      ...note('The tree is −5 → (4 → (5 → (10), 6), −1 → (0, 0)). Both traversals end at the rightmost leaf, the second 0.') }),
    mc(7, '(c) If we call removeMin on the heap above (as described in lecture), where will the 10 end up?', ['10 will not move.', '10 will not be present in the heap.', 'In the root position previously occupied by a -5.', 'In a position previously occupied by a 4.', 'In a position previously occupied by a 5.', 'In a position previously occupied by a 6.', 'In a position previously occupied by a -1.', 'In a position previously occupied by a 0.'], 7, { ...S('2'),
      ...note('10 moves to the root and sinks below −1, then below a 0.') }),
  ]),
  problem('3', 'Space Git (75 pts)', null, [
    mc(8, '(a) Sklurp the space horse deleted the proj1 directory in their sp21-s*** repo while starting over from the skeleton code. Which command could they enter next to restore the skeleton code for proj1? (The CWD is the repo.)', ['git pull skeleton master', 'git add * then git commit -m "starting over"', 'git pull skeleton origin', 'git push', 'git push origin master', 'git checkout skeleton/master -- proj1'], 5, S('3')),
    mc(9, '(b) Later, git status says the repo is in a “detached HEAD” state. What does this mean?', ['Their repo isn’t in a clean state. Some changes need to be committed.', 'They are no longer synced with the skeleton repo.', 'Some files were deleted after they were added, but before they were committed.', 'They tried to git push origin master and something went wrong, so HEAD changed its value.', 'HEAD is pointing to a commit that is not pointed to by a branch.', 'HEAD is pointing to corrupt files in the staging area.'], 4, S('3')),
    mc(10, '(c) What command might possibly get Sklurp out of the “detached HEAD” state? ([some hash] means an actual commit id.)', ['git checkout master', 'git add * then git commit -m "starting over"', 'git pull skeleton master', 'git checkout [some hash] .', 'git pull origin master'], 0, S('3')),
  ]),
  problem('4', 'Hashing (195 pts)', null, [
    text('(a) A hash table represents a set, each bucket is a left-leaning red-black tree, and the items implement Comparable. Which statements are true?'),
    mc(11, '(a) 1) The runtime of contains is O(N).', TF, 0, S('4a')),
    mc(12, '(a) 2) The runtime of contains is O(log N).', TF, 0, { ...S('4a'), ...note('Even if every item is in one bucket, that LLRB has height O(log N).') }),
    mc(13, '(a) 3) The runtime of contains is O(1).', TF, 1, S('4a')),
    mc(14, '(a) 4) One advantage of using an LLRB for the buckets is that it makes it possible to efficiently iterate over all of the keys in the set in ascending order.', TF, 1, { ...S('4a'), ...note('Each bucket is sorted, but the buckets aren’t in order relative to each other.') }),
    mc(15, '(a) 5) Assuming items are nicely spread out in the hash table, we expect an LLRB bucket would yield significantly better performance for contains and add than an ArrayList for each bucket.', TF, 1, { ...S('4a'), ...note('Nicely spread buckets are tiny, so the structure inside them barely matters.') }),
    text('(b) A Set<Picture> uses a hash table with 5 buckets, each a linked list. It holds pictures with these hash codes: bucket 0 holds 5; bucket 1 holds 1; bucket 3 holds 3, 103, 28; bucket 4 holds 9. Bucket numbers use Math.floorMod(hashCode, buckets).'),
    mc(16, '(b) 1) We add a new picture with hash code −6. In which bucket will it end up (no resizing)?', ['0', '1', '2', '3', '4'], 4, { ...S('4'), ...note('floorMod(−6, 5) = 4.') }),
    sata(17, '(b) 2) If we resize the original table by doubling it to 10 buckets, items with which hash codes end up in a different bucket number than before?', ['5', '1', '3', '103', '28', '9'], [0, 4, 5], { ...S('4'),
      ...note('5 → 5 (was 0), 28 → 8 (was 3), 9 → 9 (was 4). 1, 3 and 103 keep their bucket numbers.') }),
    text('(b) 3) On the original 5-bucket table: Picture x is the one with hash code 9; we run hashTable.add(x); then x.turnPink(), which changes x’s pixels and may change its hash code; then System.out.println(hashTable.contains(x)). A Picture’s equals is true only for identical pixels.'),
    sata(18, '(b) 3) For which new hash codes will the last line print true?', ['x.hashCode() is -1', 'x.hashCode() is 0', 'x.hashCode() is 4', 'x.hashCode() is 14', 'None of these'], [0, 2, 3], { ...S('4'),
      ...note('x is still stored in bucket 4 (and is equal to itself), so contains finds it whenever its new hash code maps to bucket 4: −1, 4 and 14 do; 0 doesn’t.') }),
  ]),
  problem('5', 'By the Numbers (370 pts)', null, [
    text('(a) A hash table starts empty for each part, has 32 buckets, and never resizes. Don’t assume anything about how the items are spread out.'),
    blank(19, '(a) 1) If we insert 16 items, what is the minimum number of items in bucket 0?', '0', S('5a')),
    blank(20, '(a) 2) If we insert 16 items, what is the maximum number of items in bucket 0?', '16', S('5a')),
    blank(21, '(a) 3) If we insert 4 strings, and each bucket is a binary search tree (no balancing), how many string comparisons occur in the worst case?', '6', { ...S('5a'),
      ...note('All four in one bucket as a spindly BST: 0 + 1 + 2 + 3 = 6 comparisons.') }),
    text('(b) The height of a tree is the number of edges from the root to the farthest leaf.'),
    blank(22, '(b) 1) A 2-3 tree has height 6. What is the minimum height of the corresponding LLRB?', '6', S('5b')),
    blank(23, '(b) 2) A 2-3 tree has height 6. What is the maximum height of the corresponding LLRB?', '13', { ...S('5b'),
      ...note('Each 2-3 level can add one red link to a path, and the bottom leaf too: 6 + 7 = 13.') }),
    blank(24, '(b) 3) What is the minimum possible height of a 2-3 tree with 8 values?', '1', S('5b')),
    blank(25, '(b) 4) What is the maximum possible height of a 2-3 tree with 8 values?', '2', S('5b')),
    blank(26, '(b) 5) What is the maximum number of values we can insert into the 2-3 tree from (4) without increasing its height?', '18', { ...S('5b'),
      ...note('The fullest tree of height 2 has 13 nodes of 2 values each: 26 values, and 26 − 8 = 18.') }),
  ]),
  problem('6', 'Disjoint Sets Iterator (200 pts)', null, [
    text('Implement setIterator for WeightedQuickUnionDS, which iterates over all items in p’s set in increasing order, in O(N log N) time. Items are numbered 0 to N − 1. You may not create helper functions or new classes, or access the instance variables. For example:'),
    java(`
WeightedQuickUnionDS df = new WeightedQuickUnionDS(6); // creates WQUDS of size 6
df.connect(3, 2);
df.connect(1, 5);
df.connect(2, 5);
Iterator<Integer> connectedToThree = df.setIterator(3);
while (connectedToThree.hasNext()) {
    System.out.print(connectedToThree.next() + " ");
} // prints 1 2 3 5`),
    java(`
public class WeightedQuickUnionDS implements DisjointSets {
    ... // Instance variables not listed because you are not allowed to access them
    private int find(int p) { ... }
    public boolean isConnected(int p, int q) { ... }
    public void connect(int p, int q) { ... }
    public int size() { ... } // returns the number of items in the disjoint set

    /** returns an Iterator over the set containing p. */
    public Iterator<Integer> setIterator(int p) {
        ⟪a⟫;
        for (⟪b⟫) {
            if (⟪c⟫) {
                ⟪d⟫;
            }
        }
        ⟪e⟫;
    }
}`, { a: 'List<Integer> res = new ArrayList<>()', b: 'int i = 0; i < size(); i++', c: 'isConnected(i, p)', d: 'res.add(i)', e: 'return res.iterator()' }),
    blank(27, '(a) First line', ['List<Integer> res = new ArrayList<>()', 'ArrayList<Integer> res = new ArrayList<>()'], S('6')),
    blank(28, '(b) The loop header', ['int i = 0; i < size(); i++', 'int i = 0; i < size(); i += 1'], S('6')),
    blank(29, '(c) if (____)', ['isConnected(i, p)', 'isConnected(p, i)'], S('6')),
    blank(30, '(d) Inside the if', 'res.add(i)', S('6')),
    blank(31, '(e) Last line', 'return res.iterator()', { ...S('6'),
      ...note('Check every item in increasing order and keep those connected to p: N isConnected calls at O(log N) each.') }),
  ]),
  problem('7', 'Asymptotic Analysis (350 pts)', null, [
    text('Assume h(N) runs in Θ(N) time and returns a boolean.'),
    java(`
static void alpha(int N) {
    if (N % 2 == 0) { // this check is done in constant time
        return;
    }
    for (int i = 1; i < N; i *= 2) {
        if (h(i)) {
            h(i);
        }
    }
}`),
    mc(32, '(a) alpha best case', RT, rt('Θ(1)'), S('7')),
    mc(33, '(b) alpha worst case', RT, rt('Θ(N)'), { ...S('7'), ...note('h(1) + h(2) + h(4) + … < 2N, doubled at most.') }),
    java(`
static void beta(int N) {
    if (h(N)) {
        return;
    }
    for (int i = 1; i < N; i *= 2) {
        for (int j = N - i; j < N; j++) {
            int a = 1 + 1;
        }
    }
    if (N % 2 != 0) {
        return;
    }
}`),
    mc(34, '(c) beta best case', RT, rt('Θ(N)'), S('7')),
    mc(35, '(d) beta worst case', RT, rt('Θ(N)'), { ...S('7'), ...note('h(N) alone is Θ(N); the loops do 1 + 2 + 4 + … < 2N.') }),
    text('Assume f(N) returns a random number between 1 and N/2, inclusive, in constant time.'),
    java(`
static void gamma(int N) {
    if (N <= 10) {
        return;
    }
    for (int i = f(N); i < N; i += f(N)) {
        gamma(i);
    }
}`),
    mc(36, '(e) gamma best case', RT, rt('Θ(log N)'), S('7')),
    mc(37, '(f) gamma worst case', RT, rt('Worse than Θ(N⁴ log N)'), { ...S('7'),
      ...note('Best: f returns N/2 each time, so one recursive call on N/2. Worst: f returns 1, so gamma(N) calls gamma(1), …, gamma(N−1): exponential.') }),
  ]),
  problem('8', 'Recursive Trees (405 pts)', null, [
    text('The split operation recursively splits every node X into two nodes of half the value, XL and XR (Java integer division, e.g. 11 / 2 = 5). XL keeps the left child of X and XR keeps the right child. In place of the node actually split, a new node containing 0 is created, with XL and XR as its children.',
      '(a) Trees are written value(left, right), with - for a missing child. Here is a tree; p is the node 20 that is the root’s left child:'),
    txt(`
3( p=20(4, 4(11, 11)), 20(6, 6) )`),
    mc(38, '(a) What is the resulting tree after calling split on p?', [
      '3( 0( 10(2, 2), 10(2(5, 5), 2(5, 5)) ), 20(6, 6) )',
      '3( 0( 10(2, -), 10(-, 2(5, 5)) ), 20(6, 6) )',
      '3( 0( 10(2, -), 10(2(5, 5), 2(5, 5)) ), 20(6, 6) )',
      '3( 0( 10(4, -), 10(-, 4(11, 11)) ), 20(6, 6) )'], 0, { ...S('8a'),
      ...note('p becomes 0 with children 10 (from p’s left side) and 10 (from its right side), and every node below is split the same way: each 4 becomes 2 and 2, each 11 becomes 5 and 5.') }),
    text('(b) Write splitLeft(Node p) and splitRight(Node p), which return the roots of the left split (rooted at XL) and right split (rooted at XR). They must not modify the tree, and may not use split. For example, for p = 40(8(-, 22), 12), splitLeft(p) is 20(4, 4(11, 11)) and splitRight(p) is 20(6, 6).'),
    java(`
public static class Node {
    public int value;
    public Node left;
    public Node right;
    public Node(int v, Node l, Node r) {
        value = v;
        left = l;
        right = r;
    }
}

public static Node splitLeft(Node p) {
    if (p == null) {
        return null;
    }
    Node newNode = ⟪a⟫;
    ⟪b⟫;
    ⟪c⟫;
    return newNode;
}

public static Node splitRight(Node p) {
    if (p == null) {
        return null;
    }
    Node newNode = ⟪d⟫;
    ⟪e⟫;
    ⟪f⟫;
    return newNode;
}`, { a: 'new Node(p.value / 2, null, null)', b: 'newNode.left = splitLeft(p.left)', c: 'newNode.right = splitRight(p.left)', d: 'new Node(p.value / 2, null, null)', e: 'newNode.left = splitLeft(p.right)', f: 'newNode.right = splitRight(p.right)' }),
    blank(39, '(b) splitLeft: Node newNode = ____', ['new Node(p.value / 2, null, null)', 'new Node(p.value / 2, splitLeft(p.left), splitRight(p.left))'], S('8b')),
    blank(40, '(b) splitLeft: next line', 'newNode.left = splitLeft(p.left)', S('8b')),
    blank(41, '(b) splitLeft: the line after', 'newNode.right = splitRight(p.left)', S('8b')),
    blank(42, '(b) splitRight: Node newNode = ____', ['new Node(p.value / 2, null, null)', 'new Node(p.value / 2, splitLeft(p.right), splitRight(p.right))'], S('8b')),
    blank(43, '(b) splitRight: next line', 'newNode.left = splitLeft(p.right)', S('8b')),
    blank(44, '(b) splitRight: the line after', 'newNode.right = splitRight(p.right)', { ...S('8b'),
      ...note('XL takes X’s left child, and that child is split in turn: its left split and right split become XL’s children. XR does the same with X’s right child.') }),
    text('(c) Now write void split(Node p), which modifies the tree it’s given: afterwards p.value is 0, and p.left and p.right are the left and right splits.'),
    java(`
public static void split(Node p) {
    ⟪g⟫;
    ⟪h⟫;
    ⟪i⟫;
}`, { g: 'p.left = splitLeft(p)', h: 'p.right = splitRight(p)', i: 'p.value = 0' }),
    blank(45, '(c) First line', 'p.left = splitLeft(p)', S('8c')),
    blank(46, '(c) Second line', 'p.right = splitRight(p)', S('8c')),
    blank(47, '(c) Third line', 'p.value = 0', { ...S('8c'),
      ...note('Compute both splits from the original p before changing anything; set the value to 0 last, since the splits read p.value.') }),
  ]),
]);
