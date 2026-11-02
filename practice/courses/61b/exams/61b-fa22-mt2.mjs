// Fall 2022 Midterm 2, transcribed from the official solutions. (This exam’s point values total 4000.)
// Changed for this site, and said so on the page: the hash-table drawings (3) and the 2-3 tree drawing (4a) are
// fill-in questions; the design question (8) asks which instance variable to use, with the method descriptions in
// the answer note. Left out: Q0 (writing your name) and 7(f) (0 points).
import { exam, problem, text, java, txt, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-fa22-mt2', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });
const TF = ['True', 'False'];
const TH = ['Θ(1)', 'Θ(log N)', 'Θ(N)', 'Θ(N log N)', 'Θ(N²)', 'Θ(N³)'];
const BOUNDS = f => ['O(1)', 'O(N)', 'O(N²)', 'O(N³)', 'Θ(1)', 'Θ(N)', 'Θ(N²)', 'Θ(N³)'].map(b => `${f} ∈ ${b}`);
const ERR = ['Runtime error', 'Compile-time error', 'Infinite loop'];
const list = s => [s, s.replace(/,/g, ''), `[${s}]`];
const HEAP_POS = ['X might not be in the heap at all after deleteMin.', 'In the root position previously occupied by the 2.', 'In the position previously occupied by the 4.', 'In the position previously occupied by the 5.', 'In the position previously occupied by the 12.', 'In the position previously occupied by the 6.', 'In the position previously occupied by the 7.', 'In the position previously occupied by the 8.', 'In the position previously occupied by the 11.', 'In the same position, i.e. X might not move.'];

export default exam(E, 'Fall 2022 Midterm 2', {
  exam: 'https://drive.google.com/file/d/1-pPuHGuw0anqwnLh3nc_8z2Alqqcnpi5/view',
  sol: 'https://drive.google.com/file/d/1EorWXul3vuZLpgpCkWUxFuOqn_Z5RaYP/view',
}, 'fa22-mt2', [
  problem('1', 'DisjointSets (250 pts)', null, [
    text('A correct implementation of the WeightedQuickUnion idea from lecture uses one array arr: a root’s value is its set’s weight, negated; any other element’s value is its parent.'),
    java(`
1: public void connect(int v1, int v2) {
2:     int rootV1 = find(v1);
3:     int rootV2 = find(v2);
4:     if (rootV1 != rootV2) {
5:         if (arr[rootV1] <= arr[rootV2]) {
6:             arr[rootV1] += arr[rootV2]; // adds rootV2 tree size to rootV1
7:             arr[rootV2] = rootV1;
8:         } else {
9:             arr[rootV2] += arr[rootV1]; // adds rootV1 tree size to rootV2
10:            arr[rootV1] = rootV2;
11:        }
12:    }
13: }`),
    sata(1, '(a) Suppose we replace line 7 with arr[rootV2] = v1;. What are the potential negative consequences of this change?', ['If connect is called when v1 is not a root, later isConnected operations may be incorrect', 'If connect is called when v2 is not a root, later isConnected operations may be incorrect', 'Runtime for connect operations may be asymptotically worse than with the original line 7', 'Runtime for isConnected operations may be asymptotically worse than with the original line 7', 'None of the above'], [2, 3], { ...S('1'),
      ...note('Hanging rootV2’s tree under v1 (possibly deep in rootV1’s tree) keeps the sets right but can make trees taller, so finds get slower.') }),
    mc(2, '(b) With the same modified code and 6 items (valid arguments 0 to 5), what is the worst-case height of the WeightedQuickUnion tree (height is zero-indexed)?', ['0', '1', '2', '3', '4', '5', '10', '11'], 5, { ...S('1'),
      ...note('Attaching each new tree under the deepest node of the other can make a chain of all 6 items: height 5.') }),
  ]),
  problem('2', 'EvenIterable (400 pts)', null, [
    text('We want an EvenIterable class whose constructor takes an Iterable and creates a new Iterable that only iterates over items in even-numbered positions. For example, this prints 0, then 10, then 20:'),
    java(`
public static void main(String[] args) {
    List<Integer> L = List.of(0, 1, 10, 2, 20, 3);
    EvenIterable<Integer> evenIt = new EvenIterable<>(L);
    for (int i : evenIt) {
        System.out.println(i);
    } // prints 0 then 10 then 20
}`),
    text('Fill in EvenIterable. The constructor may use linear space and time, and the code must not throw exceptions for the main method above.'),
    java(`
public class EvenIterable<T> implements Iterable<T> {
    private ⟪a⟫;

    public EvenIterable(Iterable<T> iterable) {
        ⟪b⟫;
        Iterator<T> it = iterable.⟪c⟫;
        while (⟪d⟫) {
            ⟪e⟫
        }
    }

    public Iterator<T> iterator() {
        return ⟪f⟫;
    }
}`, { a: 'List<T> evens', b: 'evens = new ArrayList<>()', c: 'iterator()', d: 'it.hasNext()', e: 'evens.add(it.next());\nif (it.hasNext()) {\n    it.next();\n}', f: 'evens.iterator()' }),
    blank(3, '(a) private ____', ['List<T> evens', 'ArrayList<T> evens', 'LinkedList<T> evens'], S('2')),
    blank(4, '(b) First line of the constructor', ['evens = new ArrayList<>()', 'evens = new LinkedList<>()', 'evens = new ArrayList<T>()'], S('2')),
    blank(5, '(c) Iterator<T> it = iterable.____', 'iterator()', S('2')),
    blank(6, '(d) while (____)', 'it.hasNext()', S('2')),
    blank(7, '(e) The loop body (several lines)', ['evens.add(it.next());\nif (it.hasNext()) {\n    it.next();\n}', 'evens.add(it.next());\nif (it.hasNext()) it.next();', 'evens.add(it.next())\nif (it.hasNext()) {\nit.next()\n}'], S('2')),
    blank(8, '(f) iterator() returns', 'evens.iterator()', { ...S('2'),
      ...note('Copy every other item into a list, checking hasNext before skipping so an odd-length input doesn’t throw. (A boolean flag or counter also works.)') }),
  ]),
  problem('3', 'HashSets (299 pts)', null, [
    text('HashableArrayList’s hash code is the sum of its items’ hash codes (an Integer’s hash code is itself). For example, [1, 2, 10] hashes to 13. The hash code is reduced to a bucket by modding by the number of buckets (4 here), the table never resizes, collisions are chained in a linked list, and ArrayList.equals compares contents.'),
    java(`
public class HashableArrayList<T> extends ArrayList<T> {
    @Override
    public int hashCode() {
        int hc = 0;
        for (int i = 0; i < size(); i += 1) {
            hc += get(i).hashCode();
        }
        return hc;
    }
}

1: HashSet<HashableArrayList<Integer>> set = new HashSet<>();
2: set.add(new HashableArrayList<>(1, 2, 10));
3: HashableArrayList<Integer> zeroOneTwo = new HashableArrayList<>(0, 1, 2);
4: set.add(zeroOneTwo);
5: set.add(new HashableArrayList<>(13));`),
    text('(a) After lines 1–5, what does each bucket hold? Write the lists in chain order, separated by commas, e.g. [1, 2, 10], [13]; write [] for an empty bucket.'),
    blank(9, '(a) Bucket 0', ['[]', 'empty'], S('3a')),
    blank(10, '(a) Bucket 1', ['[1, 2, 10], [13]', '[[1, 2, 10], [13]]'], S('3a')),
    blank(11, '(a) Bucket 2', ['[]', 'empty'], S('3a')),
    blank(12, '(a) Bucket 3', ['[0, 1, 2]', '[[0, 1, 2]]'], { ...S('3a'),
      ...note('[1, 2, 10] and [13] both hash to 13 → bucket 1; [0, 1, 2] hashes to 3 → bucket 3.') }),
    text('(b) Now we also run:'),
    java(`
6: set.add(zeroOneTwo);
7: zeroOneTwo.add(3);
8: set.add(zeroOneTwo);`),
    sata(13, '(b) After all 8 lines, which buckets hold a reference to the zeroOneTwo list?', ['Bucket 0', 'Bucket 1', 'Bucket 2', 'Bucket 3'], [2, 3], { ...S('3b'),
      ...note('Line 6 finds it already in bucket 3. Line 7 mutates it to [0, 1, 2, 3], which hashes to 6 → bucket 2, where line 8 finds nothing equal and adds it again. The same list is now in buckets 2 and 3.') }),
  ]),
  problem('4', 'LLRBs (575 pts)', null, [
    text('Suppose we have the LLRB of integers below (links labeled red are red; the others are black):'),
    txt(`
            40
       red /  \\
         20    60
        /  \\   / red
      10   30 50`),
    blank(14, '(a) In the corresponding 2-3 tree, what keys are in the root? (Separate them with commas.)', list('20, 40'), S('4a')),
    blank(15, '(a) And in its rightmost leaf?', list('50, 60'), { ...S('4a'), ...note('The 2-3 tree is [20 40] with children [10], [30] and [50 60].') }),
    blank(16, '(b) Give all integers which, when inserted into the LLRB, result in a single rotateLeft and no further operations. Use inclusive brackets, e.g. [62, 64], [66, 68]; or write impossible.', ['[11, 19], [31, 39]', '[11,19],[31,39]', '[11, 19] and [31, 39]'], { ...S('4b'),
      ...note('A value that becomes the right child of a lone black node (10 or 30) leans right and needs exactly one rotateLeft: 11–19 or 31–39.') }),
    blank(17, '(c) Give all integers which, when inserted, result in a single rotateRight and no further operations (or write impossible).', ['impossible', 'Impossible'], { ...S('4c'),
      ...note('rotateRight is only needed for two left-leaning reds in a row, which always leaves a node with two red children, so a colorFlip follows.') }),
    blank(18, '(d) At most, how many additional inserts can be performed without triggering any color flip? Don’t count the insert that causes the first color flip.', '2', { ...S('4d'),
      ...note('Only 10 and 30 can take one more key each without a 3-key 2-3 node forming.') }),
    mc(19, '(e) True or false: if we insert enough values into the LLRB above, we will eventually get a colorFlip(40) operation.', TF, 1, { ...S('4e'),
      ...note('40 is a red child, and a node with a red link to its parent never gets two red children (that would be three keys in one 2-3 node), so 40 is never color-flipped.') }),
  ]),
  problem('5', 'Tree Life (750 pts)', null, [
    text('Generalize the array representation of a complete binary tree to a complete trinary tree (three children per node). A trinary heap is represented by the array [-, 2, 4, 5, 12, 6, 7, 8, 11, 20], where the first position is unused.'),
    blank(20, '(a) What value is 8’s parent?', '4', S('5a')),
    blank(21, '(b) In a pre-order traversal of this tree, what are the last 3 values traversed, in order?', list('11, 20, 12'), S('5b')),
    blank(22, '(c) In a post-order traversal, what are the first 3 values traversed, in order?', list('6, 7, 8'), S('5c')),
    blank(23, '(d) A DFS graph traversal starting from node 12, breaking ties by going to the smallest node first: give the whole DFS pre-order.', list('12, 2, 4, 6, 7, 8, 5, 11, 20'), { ...S('5d'),
      ...note('The tree is 2 → (4, 5, 12); 4 → (6, 7, 8); 5 → (11, 20). From 12 the only neighbor is 2; then 4 and its children, then 5 and its children.') }),
    sata(24, '(e) Replace 20 with some arbitrary value X so the trinary heap is still valid (heaps may contain duplicates). Using the standard heap deletion algorithm, where can X end up after one deleteMin? Select all that apply.', HEAP_POS, [2, 5], { ...S('5e'),
      ...note('X (≥ 5) moves to the root and sinks below the smallest child each time: first to 4’s old spot, then possibly to 6’s.') }),
  ]),
  problem('6', 'Asymptotics and ArrayDeques (400 pts)', null, [
    sata(25, '(a) Suppose R(N) = 11 + 22 + 33 + 44 + … + N; e.g. if N = 55, then R(N) = 165. Which of the following are true?', BOUNDS('R(N)'), [2, 3, 6], { ...S('6'),
      ...note('About N/11 terms averaging N/2: Θ(N²).') }),
    text('(b) An ArrayDeque resizes, when too full, by adding 11 new entries. What is the order of growth of this code’s runtime?'),
    java(`
ArrayDeque<Integer> ad = new ArrayDeque<>();
for (int i = 0; i < N; i += 1) {
    ad.add(i);
}`),
    mc(26, '(b) Runtime', TH, 4, { ...S('6'), ...note('A resize every 11 adds copies the whole array: 11 + 22 + … + N = Θ(N²).') }),
    sata(27, '(c) Let f(x) = x if x is a power of 2, and 1 otherwise, and Z(N) = f(1) + f(2) + … + f(N). For example, Z(8) = 19. Which are true about Z(N)?', BOUNDS('Z(N)'), [1, 2, 3, 5], { ...S('6'),
      ...note('The powers of two sum to less than 2N, and the rest add at most N: Θ(N).') }),
    mc(28, '(d) The same code, but the ArrayDeque doubles the size of the array when too full. Runtime?', TH, 2, { ...S('6'), ...note('Total copying is 1 + 2 + 4 + … + N < 2N.') }),
  ]),
  problem('7', 'Asymptotics and Dynamic Method Selection (575 pts)', null, [
    java(`
public class Cheese {
    public String cheese;
    public Cheese(String cheese) {
        this.cheese = cheese;
    }

    // String's substring runs in Θ(length of the substring)
    public Cheese slice(int from, int to) {
        return new Cheese(cheese.substring(from, to));
    }

    // String's length runs in Θ(1)
    public int weight() {
        return cheese.length();
    }
}

public class Parmesan extends Cheese {
    public Parmesan(String cheese) {
        super(cheese);
    }
    @Override
    public int weight() {
        int w = super.weight();
        if (w <= 1) {
            return w;
        }
        Cheese mine = slice(0, w / 2);
        Cheese yours = slice(w / 2, w);
        return mine.weight() + yours.weight();
    }
}`),
    text('The static type of slice(int from, int to) is Cheese, its return type. The dynamic type of the returned object is whatever was actually instantiated.'),
    mc(29, '(a) What is the tightest runtime of Parmesan’s weight in terms of N, the length of the underlying String?', TH, 2, { ...S('7a'),
      ...note('slice returns plain Cheeses, whose weight is Θ(1); the two substrings cost Θ(N) in total.') }),
    java(`
// (b): added to Parmesan
@Override
public Cheese slice(int from, int to) {
    Cheese b = super.slice(from, to);
    return b;
}`),
    mc(30, '(b) With this override, what is the runtime of weight?', TH, 2, { ...S('7b'), ...note('super.slice still makes a plain Cheese.') }),
    java(`
// (c): instead of (b)
@Override
public Cheese slice(int from, int to) {
    String sayCheese = cheese.substring(from, to);
    Parmesan c = new Cheese(sayCheese);
    return c;
}`),
    mc(31, '(c) This method results in an error. What kind?', ERR, 1, { ...S('7c'), ...note('A Cheese can’t be assigned to a Parmesan variable without a cast.') }),
    java(`
// (d): instead of (b) and (c)
@Override
public Cheese slice(int from, int to) {
    String sayCheese = cheese.substring(from, to);
    Parmesan d = (Parmesan) new Cheese(sayCheese);
    return d;
}`),
    mc(32, '(d) This method results in an error. What kind?', ERR, 0, { ...S('7d'), ...note('The cast compiles, but the object is really a Cheese: ClassCastException.') }),
    java(`
// (e): instead of (b), (c) and (d)
@Override
public Cheese slice(int from, int to) {
    String sayCheese = cheese.substring(from, to);
    Parmesan e = new Parmesan(sayCheese);
    return e;
}`),
    mc(33, '(e) This doesn’t error. What is the runtime of weight now?', TH, 3, { ...S('7e'),
      ...note('Now the halves are Parmesans, so weight recurses on both: Θ(N) substring work per level, log N levels.') }),
  ]),
  problem('8', 'Data Structures Design (750 pts)', null, [
    text('Add a removeEvery(int x) operation to the Proj 1A LinkedListDeque (hard-coded to integers), which removes all instances of x. Methods must run in O(k + log N) time on average, where k is the number of x’s in the deque and N its size. Naive Θ(N) solutions get no credit.'),
    java(`
public class LinkedListDeque {
    private Node sentinel;
    private int size;
    public void addFirst(int item) { … }
    public int removeFirst() { … }
    public int get(int index) { … }
    …
}`),
    mc(34, '(a) Which single additional instance variable makes this possible? (The exam asked you to write one, then describe addFirst and removeEvery.)', ['TreeMap<Integer, ArrayList<Node>> tmap', 'TreeMap<Integer, Integer> counts', 'ArrayList<Integer> items', 'int[] positions'], 0, { ...S('8a', '8b', '8c'),
      ...note('addFirst: after creating node n, add it to tmap’s list for x (making a new list if x isn’t there yet). removeEvery(x): remove x from tmap and unlink every Node in the returned list from the deque. Each node is found directly, so that’s O(k) plus the O(log N) TreeMap lookup.') }),
  ]),
]);
