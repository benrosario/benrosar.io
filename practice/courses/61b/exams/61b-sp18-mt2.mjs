// Spring 2018 Midterm 2, transcribed from the official solutions (alpha v1). (This exam’s points total 240.)
// The course’s topic index has no entries for this exam, so its topic tags are this site’s.
// Changed for this site, and said so on the page: drawn trees are written as value(left, right) and drawn answers are
// multiple choice or fill-in; the free-response algorithm (9) is multiple choice. Left out: Q0 and Q4 (0 points).
import { exam, problem, text, java, txt, blank, mc, sata } from '../../../content/author.mjs';
import { site } from '../staff.mjs';

const E = '61b-sp18-mt2';
const note = (x, o = {}) => ({ x, ...o });
const TFN = ['True', 'False', 'Not enough information'];
const RT = ['Θ(1)', 'Θ(log N)', 'Θ(N)', 'Θ(N log N)', 'Θ(N²)', 'Θ(N³)', 'Θ(N⁶)', 'Θ(2ᴺ)'];
const rt = s => RT.indexOf(s);
const L = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'M'];
const FILES = ['IterableUtils', 'TestRODI', 'ReverseOddDigitIterator', 'None'];
const bucket = (...a) => [a.length ? a.join(', ') : '[]', a.length ? `[${a.join(', ')}]` : 'empty'];

export default exam(E, 'Spring 2018 Midterm 2', {
  exam: 'https://drive.google.com/file/d/1Vo8p4vbOGt7eY5TtalvAEnk4ignpTVvm/view',
  sol: 'https://drive.google.com/file/d/1LIyFXwHYCWXNqIgKTsTyKiOYnB79_ykk/view',
}, 'sp18-mt2', [
  problem('1', 'Tree time (24 pts)', null, [
    text('Trees are written value(left, right), with - for a missing child. The BST:'),
    txt('7( 5( 1(-, 3(2, -)), - ), 8( -, 12(10(-, 11), -) ) )'),
    mc(1, '(a) Which tree can result from deleting 7 with Hibbard deletion?', ['5( 1(-, 3(2, -)), 8(-, 12(10(-, 11), -)) )', '8( 5( 1(-, 3(2, -)), - ), 12(10(-, 11), -) )', '1( -, 5(3(2, -), 8(-, 12(10(-, 11), -))) )', '10( 5( 1(-, 3(2, -)), - ), 8(-, 12(11, -)) )'], 0, { ...site('BSTS'), also: [1],
      ...note('Either the predecessor (5) or the successor (8) replaces 7; both trees are correct.') }),
    blank(2, '(b) Give a rotation on the original tree that would increase its height, written like rotateRight(11).', ['rotateLeft(7)', 'rotateRight(7)'], { ...site('BSTS'),
      ...note('Rotating at the root lifts one side and pushes the other down a level.') }),
    blank(3, '(c) In the 2-3 tree that results from inserting 1, 2, 3, 7, 8, 9, 5 in that order, what keys are in the root?', ['2, 7', '2 7', '[2 7]'], site('B_TREES')),
    blank(4, '(c) …and how many leaves does it have?', '3', { ...site('B_TREES'), ...note('The tree is [2 7] with leaves [1], [3 5] and [8 9].') }),
    mc(5, '(d) Which is the LLRB that results from inserting 1, 2, 3, 7, 8, 9, 5 in that order? (A * marks a node whose link to its parent is red.)', ['7( *2(1, 5(*3, -)), 9(*8, -) )', '5( *2(1, 3), 8(*7, 9) )', '7( 2(1, *5(3, -)), *9(8, -) )', '2( 1, *7(5(*3, -), 9(*8, -)) )'], 0, { ...site('RED_BLACK_TREES'),
      ...note('It mirrors the 2-3 tree from (c): [2 7] becomes 7 with red left child 2, [3 5] becomes 5 with red left child 3, [8 9] becomes 9 with red left child 8.') }),
    blank(6, '(e) What is the minimum height of a valid BST containing the keys 1, 2, 3, 7, 8, 9, 5? (Height = links from the root to the deepest leaf.)', '2', { ...site('BSTS'), ...note('For example 5(2(1, 3), 8(7, 9)).') }),
    mc(7, '(f) Under what conditions is a complete BST containing N items unique (the only complete BST with exactly those items)? BSTs never contain duplicates.', ['Always, for any N', 'Only when N is one less than a power of 2', 'Only when N is a power of 2', 'Never, for N > 2'], 0, { ...site('BSTS'),
      ...note('A complete tree’s shape is fixed by N, and a BST’s in-order traversal must be sorted, so the values have only one possible placement.') }),
  ]),
  problem('2', 'Hash Tables (28 pts)', null, [
    text('XList is a list of integers whose hash code is the sum of its digits; two XLists are equal only with the same length and values in the same order. FourBucketHashMap uses external chaining, adds new items to the end of each bucket, always has four buckets and never resizes.'),
    java(`
FourBucketHashMap<XList, String> fbhm = new FourBucketHashMap<>();
fbhm.put(XList.of(1, 2, 3), "cat");
fbhm.put(XList.of(1, 4), "riding");
fbhm.put(XList.of(5), "a");
fbhm.put(XList.of(3, 4), "bull");
fbhm.put(XList.of(1, 4), "below");`),
    text('(a) What does each bucket hold? Write each entry as list = value, in chain order, separated by commas, e.g. [1, 4] = below, [5] = a; write [] for an empty bucket.'),
    blank(8, '(a) Bucket 0', bucket(), site('HASHING')),
    blank(9, '(a) Bucket 1', ['[1, 4] = below, [5] = a', '[1, 4] = "below", [5] = "a"', '[1,4]=below, [5]=a'], site('HASHING')),
    blank(10, '(a) Bucket 2', ['[1, 2, 3] = cat', '[1, 2, 3] = "cat"', '[1,2,3]=cat'], site('HASHING')),
    blank(11, '(a) Bucket 3', ['[3, 4] = bull', '[3, 4] = "bull"', '[3,4]=bull'], { ...site('HASHING'),
      ...note('Sums: 6 → bucket 2, 5 → 1, 5 → 1, 7 → 3. The last put finds [1, 4] and replaces its value.') }),
    java(`
// (b)
FourBucketHashMap<XList, String> fbhm = new FourBucketHashMap<>();
XList firstList = XList.of(1, 2, 3);
fbhm.put(firstList, "cat");
fbhm.get(XList.of(1, 2, 3));     // (i)
firstList.addLast(0);            // list is now [1, 2, 3, 0]
fbhm.get(firstList);             // (ii)
fbhm.get(XList.of(1, 2, 3));     // (iii)`),
    blank(12, '(b) (i) returns', ['cat', '"cat"'], site('HASHING', 'EQUALS')),
    blank(13, '(b) (ii) returns', ['cat', '"cat"'], { ...site('HASHING', 'EQUALS'), ...note('Adding 0 doesn’t change the sum, so the key is still found in bucket 2.') }),
    blank(14, '(b) (iii) returns', 'null', { ...site('HASHING', 'EQUALS'), ...note('[1, 2, 3] lands in bucket 2, but the stored key is now [1, 2, 3, 0], which isn’t equal.') }),
    java(`
// (c)
FourBucketHashMap<XList, String> fbhm = new FourBucketHashMap<>();
XList firstList = XList.of(1, 2, 3);
fbhm.put(firstList, "cat");
firstList.addLast(1);               // list is now [1, 2, 3, 1]
fbhm.get(firstList);                // (i)
fbhm.get(XList.of(1, 2, 3));        // (ii)
fbhm.get(XList.of(1, 2, 3, 1));     // (iii)
fbhm.get(XList.of(3, 4));           // (iv)
fbhm.put(firstList, "dog");
fbhm.get(firstList);                // (v)
fbhm.get(XList.of(1, 2, 3));        // (vi)
fbhm.get(XList.of(1, 2, 3, 1));     // (vii)`),
    text('Write what each get returns (null if not found), separated by commas.'),
    blank(15, '(c) (i) through (iv)', ['null, null, null, null', 'null null null null'], site('HASHING', 'EQUALS')),
    blank(16, '(c) (v) through (vii)', ['dog, null, dog', 'dog null dog', '"dog", null, "dog"'], { ...site('HASHING', 'EQUALS'),
      ...note('The mutated key now sums to 7 (bucket 3) but is stored in bucket 2, so it can’t be found; [1, 2, 3] reaches bucket 2 but isn’t equal. put then adds a second entry in bucket 3, which (v) and (vii) find.') }),
    text('(d) FourBucketHashMap’s best- and worst-case get and put runtimes, as a function of N items (assume nothing about the keys).'),
    mc(17, '(d) get: best / worst', ['Θ(1) / Θ(1)', 'Θ(1) / Θ(log N)', 'Θ(1) / Θ(N)', 'Θ(N) / Θ(N)'], 2, site('HASHING')),
    mc(18, '(d) put: best / worst', ['Θ(1) / Θ(1)', 'Θ(1) / Θ(log N)', 'Θ(1) / Θ(N)', 'Θ(N) / Θ(N)'], 2, { ...site('HASHING'), ...note('Four buckets never grow, so a bucket can hold Θ(N) items; but the key might be first in its bucket.') }),
    mc(19, '(e) If it instead triples its buckets when the load factor exceeds 0.7 (a resize takes linear time), what are get’s and put’s best / worst runtimes?', ['Θ(1) / Θ(1) for both', 'Θ(1) / Θ(N) for both', 'get Θ(1) / Θ(1), put Θ(1) / Θ(N)', 'Θ(1) / Θ(log N) for both'], 1, { ...site('HASHING'),
      ...note('With nothing assumed about the keys, all of them can still collide; and a put that triggers a resize costs Θ(N).') }),
  ]),
  problem('3', 'Weighted Quick Union (32 pts)', null, [
    text('A “fully connected” DisjointSets object is one where connected returns true for any arguments. A tree’s height is the number of links from the root to the deepest leaf. Heighted Quick Union is like Weighted Quick Union but uses height instead of weight to choose the new root.'),
    blank(20, '(a) Fully connected with 6 items: Weighted Quick Union’s best-case height', '1', site('DISJOINT_SETS')),
    blank(21, '(a) …Weighted Quick Union’s worst-case height', '2', site('DISJOINT_SETS')),
    blank(22, '(a) …Heighted Quick Union’s best-case height', '1', site('DISJOINT_SETS')),
    blank(23, '(a) …Heighted Quick Union’s worst-case height', '2', site('DISJOINT_SETS')),
    blank(24, '(b) Give an exact formula for the minimum number of objects in a Weighted Quick Union tree of height H.', ['2^H', '2**H', '2ᴴ', 'pow(2, H)'], site('DISJOINT_SETS')),
    mc(25, '(c) Which Quick Union tree is possible for Heighted Quick Union but impossible for Weighted Quick Union? (Written value(children).)', ['1( 2, 3(4, 5, 6) )', '1( 2, 3, 4, 5, 6 )', '1( 2(3, 4), 5(6) )', 'None exists'], 0, { ...site('DISJOINT_SETS'),
      ...note('3’s tree (4 items, height 1) went under 1’s tree (2 items, height 1): fine when heights tie, but WQU always puts the lighter tree below.') }),
    text('(d) Create a set for SimpleOomage objects using a WeightedQuickUnionUF. Its hashCode() is perfect: unique and always between 0 and 140,607 inclusive. WeightedQuickUnionUF’s methods are union() and connected().'),
    java(`
public class SimpleOomageSet {
    private WeightedQuickUnionUF wq = new WeightedQuickUnionUF(⟪a⟫);
    public void add(T item) {
        ⟪b⟫;
    }
    public boolean contains(T item) {
        ⟪c⟫;
    }
}`, { a: '140609', b: 'wq.union(item.hashCode(), 140608)', c: 'return wq.connected(item.hashCode(), 140608)' }),
    blank(26, '(d) The WeightedQuickUnionUF’s size', '140609', site('DISJOINT_SETS', 'HASHING')),
    blank(27, '(d) The body of add', ['wq.union(item.hashCode(), 140608)', 'union(item.hashCode(), 140608)', 'wq.union(140608, item.hashCode())'], site('DISJOINT_SETS', 'HASHING')),
    blank(28, '(d) The body of contains', ['return wq.connected(item.hashCode(), 140608)', 'return connected(item.hashCode(), 140608)', 'return wq.connected(140608, item.hashCode())'], { ...site('DISJOINT_SETS', 'HASHING'),
      ...note('Use one extra item (140,608) as a marker: adding an Oomage connects its hash code to the marker, and contains checks that connection.') }),
  ]),
  problem('5', 'Multiset (20 pts)', null, [
    text('A Multiset is a set where items can occur multiple times; e.g. after add(5), add(5), add(10), add(15), add(5), multiplicity(5) returns 3. (a) A “Trinary Search Tree” implements Multiset: the left branch holds smaller items, the middle branch equal items, and the right branch larger items. Implement add.'),
    java(`
public interface Multiset<T> {
    public void add(T item);            // adds item.
    public boolean contains(T item);    // true if item occurs at least once.
    public int multiplicity(T item);    // number of times item occurs.
}

public class TriSTMultiset<T extends Comparable<T>> implements Multiset<T> {
    private class Node {
        private T item;
        private Node left, middle, right;
        public Node(T i) { item = i; }
    }
    Node root = null;
    public void add(T item) {
        ⟪a⟫;
    }
    private Node add(T item, Node p) {
        if (p == null) { ⟪b⟫; }
        int cmp = item.compareTo(p.item);
        if (cmp < 0) {
            ⟪c⟫;
        } else if (cmp > 0) {
            ⟪d⟫;
        } else {
            ⟪e⟫;
        }
        return p;
    } ...
}`, { a: 'root = add(item, root)', b: 'return new Node(item)', c: 'p.left = add(item, p.left)', d: 'p.right = add(item, p.right)', e: 'p.middle = add(item, p.middle)' }),
    blank(29, '(a) The body of the public add', 'root = add(item, root)', site('BSTS', 'ADTS')),
    blank(30, '(a) if (p == null) { ____ }', 'return new Node(item)', site('BSTS', 'ADTS')),
    blank(31, '(a) cmp < 0', 'p.left = add(item, p.left)', site('BSTS', 'ADTS')),
    blank(32, '(a) cmp > 0', 'p.right = add(item, p.right)', site('BSTS', 'ADTS')),
    blank(33, '(a) Otherwise', 'p.middle = add(item, p.middle)', site('BSTS', 'ADTS')),
    mc(34, '(b) Let X have multiplicity M, and N be the number of nodes. Give the best Ω bound on the best-case runtime of any possible implementation of multiplicity(X) for a TriSTMultiset.', ['Ω(1)', 'Ω(log N)', 'Ω(M)', 'Ω(N)'], 2, { ...site('BSTS', 'ADTS', 'ASYMPTOTICS'),
      ...note('Each copy of X is its own node in the middle chain, and all M must be counted.') }),
    mc(35, '(c) Rather than building Multiset from scratch, which is better?', ['Delegation to a java.util.TreeMap<T, Integer> (item → count)', 'Extending java.util.TreeSet<T>', 'Extending java.util.ArrayList<T>', 'Delegation to a java.util.HashSet<T>'], 0, { ...site('ADTS'),
      ...note('A map from each item to its count gives add, contains and multiplicity directly. Other reasonable answers were accepted on the exam.') }),
  ]),
  problem('6', 'Min Heaps (14 pts)', null, [
    text('In the min heap below, each letter represents a unique value.'),
    txt(`
              H
           /     \\
          D       L
        /   \\    / \\
       B     F  K   M
      / \\   / \\
     A   C E   G`),
    text('(a) (The staff key for this part reads the letters as if the values were inserted in increasing order.)'),
    sata(36, '(a) Smallest value', L, [7], site('HEAPS')),
    sata(37, '(a) Median value', L, [8], site('HEAPS')),
    sata(38, '(a) Largest value', L, [6], { ...site('HEAPS'), ...note('Inserting in increasing order fills the heap in level order: H < D < L < B < F < K < M < A < C < E < G.') }),
    sata(39, '(b) If values were inserted in decreasing order, which letters could be the smallest value?', L, [7], { ...site('HEAPS'), ...note('In any min heap the root is the smallest.') }),
    text('(c) If values were inserted in an unknown order:'),
    sata(40, '(c) Which letters could be the median value?', L, [0, 1, 2, 4, 5, 6, 8, 9, 10], site('HEAPS')),
    sata(41, '(c) Which letters could be the largest value?', L, [0, 2, 4, 6, 8, 10], { ...site('HEAPS'), ...note('The largest value must be a leaf.') }),
  ]),
  problem('7', 'Iteration (46 pts)', null, [
    text('(a) Fill in toList, which takes an Iterable<T> and returns a List<T>, throwing an IllegalArgumentException if any item is null. Use for-each notation; don’t call next or hasNext explicitly.'),
    java(`
public class IterableUtils {
    public static <T> List<T> toList(Iterable<T> iterable) {
        ⟪a⟫;
        for (⟪b⟫) {
            if (⟪c⟫) {
                ⟪d⟫;
            }
            ⟪e⟫;
        }
        ⟪f⟫;
    }
}`, { a: 'List<T> r = new ArrayList<T>()', b: 'T t : iterable', c: 't == null', d: 'throw new IllegalArgumentException()', e: 'r.add(t)', f: 'return r' }),
    blank(42, '(a) First line', ['List<T> r = new ArrayList<T>()', 'List<T> r = new ArrayList<>()'], site('ITERATORS')),
    blank(43, '(a) The loop header', 'T t : iterable', site('ITERATORS')),
    blank(44, '(a) if (____)', 't == null', site('ITERATORS')),
    blank(45, '(a) Inside the if', 'throw new IllegalArgumentException()', site('ITERATORS')),
    blank(46, '(a) After the if', 'r.add(t)', site('ITERATORS')),
    blank(47, '(a) After the loop', 'return r', site('ITERATORS')),
    text('(b) ReverseOddDigitIterator implements Iterable<Integer> and iterates through an integer’s odd digits in reverse order: new ReverseOddDigitIterator(12345770) yields 7, 7, 5, 3, 1. Write a JUnit test using toList (List.of(3, 4, 5) makes a list of 3, 4 and 5).'),
    java(`
@Test
public void testRODI() {
    ReverseOddDigitIterator odi = new ReverseOddDigitIterator(12345770);
    ⟪g⟫;
    ⟪h⟫;
    ⟪i⟫;
}`, { g: 'List<Integer> expected = List.of(7, 7, 5, 3, 1)', h: 'List<Integer> actual = IterableUtils.toList(odi)', i: 'assertEquals(expected, actual)' }),
    blank(48, '(b) First line', 'List<Integer> expected = List.of(7, 7, 5, 3, 1)', site('TESTING', 'ITERATORS')),
    blank(49, '(b) Second line', 'List<Integer> actual = IterableUtils.toList(odi)', site('TESTING', 'ITERATORS')),
    blank(50, '(b) Third line', 'assertEquals(expected, actual)', site('TESTING', 'ITERATORS')),
    text('(c) Implement ReverseOddDigitIterator.'),
    java(`
public class ReverseOddDigitIterator implements Iterable<Integer>, Iterator<Integer> {
    private int value;
    public ReverseOddDigitIterator(int v) {
        value = v;
    }
    public boolean hasNext() {
        if (value == 0) {
            return ⟪j⟫;
        }
        if (⟪k⟫) {
            return ⟪l⟫;
        } else {
            value = ⟪m⟫;
            return ⟪n⟫;
        }
    }
    public Integer next() {
        int d = ⟪o⟫;
        value = ⟪p⟫;
        return d;
    }
    public Iterator<Integer> iterator() {
        return ⟪q⟫;
    }
}`, { j: 'false', k: 'value % 2 == 1', l: 'true', m: 'value / 10', n: 'hasNext()', o: 'value % 10', p: 'value / 10', q: 'this' }),
    blank(51, '(c) return ____ (value is 0)', 'false', site('ITERATORS')),
    blank(52, '(c) if (____)', ['value % 2 == 1', 'value % 2 != 0'], site('ITERATORS')),
    blank(53, '(c) return ____ (odd last digit)', 'true', site('ITERATORS')),
    blank(54, '(c) value = ____ (even last digit)', 'value / 10', site('ITERATORS')),
    blank(55, '(c) return ____', 'hasNext()', site('ITERATORS')),
    blank(56, '(c) int d = ____', 'value % 10', site('ITERATORS')),
    blank(57, '(c) value = ____ (in next)', 'value / 10', site('ITERATORS')),
    blank(58, '(c) iterator() returns', 'this', { ...site('ITERATORS'), ...note('hasNext drops even last digits until an odd one (or 0) is left; next returns the last digit and drops it.') }),
    text('(d) For each removal, which file (if any) fails to compile as a direct result (not because one of its dependencies failed)?'),
    mc(59, '(d) Remove “implements Iterable<Integer>”', FILES, 1, { ...site('ITERATORS', 'INHERITANCE'), ...note('TestRODI passes odi to toList, which takes an Iterable.') }),
    mc(60, '(d) Remove “implements Iterator<Integer>”', FILES, 2, { ...site('ITERATORS', 'INHERITANCE'), ...note('iterator() returns this, which is then no longer an Iterator.') }),
    mc(61, '(d) Remove the hasNext method', FILES, 2, { ...site('ITERATORS', 'INHERITANCE'), ...note('The class no longer implements every Iterator method.') }),
    mc(62, '(d) Remove the iterator method', FILES, 2, { ...site('ITERATORS', 'INHERITANCE'), ...note('The class no longer implements Iterable’s method.') }),
  ]),
  problem('8', 'Asymptotics (45 pts)', null, [
    text('(a) Give the runtime of each function in Θ notation.'),
    java(`
public static void g1(int N) {
    for (int i = 0; i < N*N*N; i += 1) {
        for (int j = 0; j < N*N*N; j += 1) {
            System.out.print("fyhe");
        }
    }
}

public static void g2(int N) {
    for (int i = 0; i < N; i += 1) {
        int numJ = Math.pow(2, i + 1) - 1; // <-- constant time!
        for (int j = 0; j < numJ; j += 1) {
            System.out.print("fhet");
        }
    }
}

public static void g3(int N) {
    for (int i = 2; i < N; i *= i) {}
    for (int i = 2; i < N; i++) {}
}`),
    mc(63, '(a) g1', RT, rt('Θ(N⁶)'), site('ASYMPTOTICS')),
    mc(64, '(a) g2', RT, rt('Θ(2ᴺ)'), { ...site('ASYMPTOTICS'), ...note('1 + 3 + 7 + … + (2ᴺ − 1) = Θ(2ᴺ).') }),
    mc(65, '(a) g3', RT, rt('Θ(N)'), site('ASYMPTOTICS')),
    text('(b) An algorithm’s runtime is Θ(N² log N) in all cases. Is each statement definitely true, definitely false, or is there not enough information?'),
    mc(66, '(b) O(N² log N)', TFN, 0, site('ASYMPTOTICS')),
    mc(67, '(b) Ω(N² log N)', TFN, 0, site('ASYMPTOTICS')),
    mc(68, '(b) O(N³)', TFN, 0, site('ASYMPTOTICS')),
    mc(69, '(b) Θ(N² log₄ N)', TFN, 0, { ...site('ASYMPTOTICS'), ...note('Logs of different bases differ by a constant factor.') }),
    text('(c) An algorithm’s runtime is O(N³) in all cases.'),
    mc(70, '(c) There exist some inputs for which the runtime is Θ(N²).', TFN, 2, site('ASYMPTOTICS')),
    mc(71, '(c) There exist some inputs for which the runtime is Θ(N³).', TFN, 2, site('ASYMPTOTICS')),
    mc(72, '(c) There exist some inputs for which the runtime is Θ(N⁴).', TFN, 1, site('ASYMPTOTICS')),
    mc(73, '(c) The worst-case runtime is O(N³).', TFN, 0, site('ASYMPTOTICS')),
    mc(74, '(c) The worst-case runtime has order of growth N³.', TFN, 2, { ...site('ASYMPTOTICS'), ...note('O is only an upper bound; the true order of growth could be smaller.') }),
    text('(d) Give the best- and worst-case runtimes. k(N) runs in constant time and returns a boolean.'),
    java(`
public static void g4(int N) {
    if (N == 0) { return; }
    g4(N - 1);
    if (k(N)) { g4(N - 1); }
}

public static void g5(int N) {
    if (N == 0) { return; }
    g5(N / 2);
    if (k(N)) { g5(N / 2); }
}`),
    mc(75, '(d) g4 best case', RT, rt('Θ(N)'), site('ASYMPTOTICS', 'RECURSION')),
    mc(76, '(d) g4 worst case', RT, rt('Θ(2ᴺ)'), site('ASYMPTOTICS', 'RECURSION')),
    mc(77, '(d) g5 best case', RT, rt('Θ(log N)'), site('ASYMPTOTICS', 'RECURSION')),
    mc(78, '(d) g5 worst case', RT, rt('Θ(N)'), { ...site('ASYMPTOTICS', 'RECURSION'), ...note('Two calls on N/2 at every level: 1 + 2 + 4 + … + N calls.') }),
    text('(e) Give the runtime of uniques in terms of N, the length of x. HashSet61B is a hash table from class (external chaining, resizes when the load factor gets too large), and resize() doesn’t traverse the chains.'),
    java(`
public Set<Planet> uniques(ArrayList<Planet> x) {
    HashSet61B<Planet> items = new HashSet61B<>();
    for (int i = 0; i < x.size(); i += 1) {
        items.add(x.get(i));
    }
    return items;
}`),
    mc(79, '(e) Best case', RT, rt('Θ(N)'), site('ASYMPTOTICS', 'HASHING')),
    mc(80, '(e) Worst case', RT, rt('Θ(N²)'), { ...site('ASYMPTOTICS', 'HASHING'), ...note('If every Planet collides, each add scans one long chain.') }),
    text('(f) The same code, but x is a list of N Strings, each of length N.'),
    mc(81, '(f) Best case', RT, rt('Θ(N)'), { ...site('ASYMPTOTICS', 'HASHING'), ...note('This is the staff answer.') }),
    mc(82, '(f) Worst case', RT, rt('Θ(N³)'), { ...site('ASYMPTOTICS', 'HASHING'), ...note('Θ(N²) comparisons, each of up to N characters.') }),
  ]),
  problem('9', 'Flights (30 pts)', null, [
    text('An ArrayList<Flight> holds every commercial flight ever taken. Each Flight stores a start time, an end time and a number of passengers, all as ints (minutes since January 1, 1914). Give an algorithm that finds the largest number of people ever in flight at once, in N log N time for N flights, not depending on the number of minutes since 1914. (The exam asked you to list the data structures and describe the algorithm.)'),
    mc(83, 'Which approach works?', [
      'Put the flights in one min-PQ by start time and one by end time. Repeatedly remove the smaller top: a start adds its passengers to a running tally (record the best tally seen), an end subtracts them.',
      'Count the passengers in the air at every minute since 1914 and return the largest count.',
      'Sort the flights by number of passengers and return the largest single flight’s passengers.',
      'Put every flight in a HashMap from start time to passengers and add up the values at the busiest start time.'], 0, { ...site('HEAPS', 'SORTING'),
      ...note('Processing the 2N start and end events in time order needs only N log N. Sorting the list by start time and keeping an end-time PQ also works.') }),
  ]),
]);
