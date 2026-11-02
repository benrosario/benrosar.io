// Spring 2016 Midterm 2, transcribed from the official solutions. (This exam’s points total 60.)
// The course’s topic index has no entries for this exam, so its topic tags are this site’s.
// Changed for this site, and said so on the page: drawn answers are fill-in or multiple choice. Left out: Q0, Q4
// (0 points) and Q7, whose BST is drawn with pictorial symbols that don’t survive as text.
import { exam, problem, text, java, txt, blank, mc } from '../../../content/author.mjs';
import { site } from '../staff.mjs';

const E = '61b-sp16-mt2';
const note = (x, o = {}) => ({ x, ...o });
const RT = ['Θ(1)', 'Θ(log N)', 'Θ(N)', 'Θ(N log N)', 'Θ(N²)', 'Θ(N² log N)', 'Θ(N³)'];
const rt = s => RT.indexOf(s);
const list = s => [s, s.replace(/,/g, '')];

export default exam(E, 'Spring 2016 Midterm 2', {
  exam: 'https://drive.google.com/file/d/1GuTG5O-2SSudWgm47rIi4orkmmpU4Apa/view',
  sol: 'https://drive.google.com/file/d/1KXLkjx1e8QPiu-waBJFwmcT5IToMHQK5/view',
}, 'sp16-mt2', [
  problem('1', 'BST and Hash Table Essentials (9 pts)', null, [
    text('(a) A map stores rental cost per square foot. Starting from an empty BSTMap (not self-balancing, ordered alphabetically with the alphabet _ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789), we call put("SAN JOSE", 2.9), then:'),
    java(`
put("LA", 2.0)
put("NYC", 2.1)
put("SD", 6.3)
put("BOSTON", 2.3)
put("UNIT 3", 18.0)
put("SF", 2.7)
put("SD", 1.9)`),
    blank(1, '(a) List the keys of the resulting BSTMap in preorder, separated by commas.', ['SAN JOSE, LA, BOSTON, NYC, SD, UNIT 3, SF'], site('BSTS')),
    blank(2, '(a) What value is stored with SD at the end?', '1.9', { ...site('BSTS'), ...note('The tree is SAN JOSE(LA(BOSTON, NYC), SD(-, UNIT 3(SF, -))); the second put on SD replaces its value.') }),
    text('(b) Repeat with a hash map: a string’s hashCode is the number of its first letter (B → 2, L → 12, N → 14, S → 19, U → 21), there are 5 buckets, no resizing, and chaining as in class. Write each bucket’s keys in chain order, separated by commas; write [] if empty.'),
    blank(3, '(b) Bucket 0', ['[]', 'empty'], site('HASHING')),
    blank(4, '(b) Bucket 1', ['UNIT 3'], site('HASHING')),
    blank(5, '(b) Bucket 2', ['LA, BOSTON'], site('HASHING')),
    blank(6, '(b) Bucket 3', ['[]', 'empty'], site('HASHING')),
    blank(7, '(b) Bucket 4', ['SAN JOSE, NYC, SD, SF'], { ...site('HASHING'), ...note('19, 14 and 19 mod 5 are 4; 12 and 2 are 2; 21 is 1. The second SD put just updates the value.') }),
    text('(c) A TreeSet uses this BST, written value(left, right). We call remove(29), using Hibbard deletion (at most two references should change).'),
    txt('20( 15(8, -), 29( 25(23(22, 24), -), 33(-, 35(34, 36)) ) )'),
    mc(8, '(c) Which tree can result?', ['20( 15(8, -), 33( 25(23(22, 24), -), 35(34, 36) ) )', '20( 15(8, -), 25( 23(22, 24), 33(-, 35(34, 36)) ) )', '20( 15(8, -), 34( 25(23(22, 24), -), 33(-, 35(-, 36)) ) )', '20( 15(8, -), 25(23(22, 24), 35(34, 36)) )'], 0, { ...site('BSTS'), also: [1],
      ...note('29 is replaced by its successor 33 (whose right subtree moves up) or its predecessor 25 (whose left subtree moves up). Both are correct.') }),
    mc(9, '(d) A HashMap’s key type has a hashCode that always returns 2000000000, and the value’s hashCode always returns −5. equals is properly implemented. Will containsKey and get always return the expected result (ignoring runtime)?', ['Yes', 'No'], 0, { ...site('HASHING', 'EQUALS'),
      ...note('Every key lands in one bucket, but the map still finds keys by checking equals within that bucket. Values’ hash codes are never used.') }),
    java(`
public class Glelk {
    private int x;
    private int y;

    /** Normally an equals method should check that o is actually a Glelk.
        We omit that check here for brevity. */
    public boolean equals(Object o) {
        Glelk other = (Glelk) o;
        return (this.x == other.x) && (this.y == other.y);
    }
    public int hashCode() {
        return super.hashCode() / 2;
    }
}`),
    mc(10, '(e) Will all operations on a HashSet<Glelk> behave as we expect?', ['Yes', 'No'], 1, { ...site('HASHING', 'EQUALS'),
      ...note('super.hashCode() is Object’s, based on the memory address, so two equal Glelks can hash to different buckets and seem to “disappear”.') }),
  ]),
  problem('2', 'WeightedQuickUnionUF (4 pts)', null, [
    text('(a) On the exam you drew WeightedQuickUnionUF trees of worst-case height for N = 4, 6 and 8 (one way: union two worst-case trees of size N/2).'),
    blank(11, '(a) What is the worst-case height for N = 8?', '3', site('DISJOINT_SETS')),
    mc(12, '(b) Best-case height of a WeightedQuickUnionUF tree with N items', RT, rt('Θ(1)'), site('DISJOINT_SETS')),
    mc(13, '(b) Worst-case height', RT, rt('Θ(log N)'), { ...site('DISJOINT_SETS'), ...note('Height grows by one only when two trees of equal size join, which doubles the size.') }),
  ]),
  problem('3', 'Exceptions (4 pts)', null, [
    text('Consider the code below. x / 2 rounds down to the nearest integer.'),
    java(`
public static void checkIfZero(int x) throws Exception {
    if (x == 0) {
        throw new Exception("x was zero!");
    }
    System.out.println(x);
}

public static int mystery(int x) {
    int counter = 0;
    try {
        while (true) {
            x = x / 2;
            checkIfZero(x);
            counter += 1;
            System.out.println("counter is " + counter);
        }
    } catch (Exception e) {
        return counter;
    }
}

public static void main(String[] args) {
    System.out.println("mystery of 1 is " + mystery(1));
    System.out.println("mystery of 6 is " + mystery(6));
}`),
    blank(14, 'What is the output when main is run? Put each printed line on its own line.', 'mystery of 1 is 0\n3\ncounter is 1\n1\ncounter is 2\nmystery of 6 is 2', { ...site('JAVA'),
      ...note('“x was zero!” never prints: Java only prints an exception that isn’t caught.') }),
  ]),
  problem('5', 'Runtime in Context (6 pts)', null, [
    text('readData reads N cities and their costs of living. isEmpty, readString and readDouble are constant time, Strings have constant length, and city names are unique.'),
    java(`
public static Map<String, Double> readData(In in) {
    Map<String, Double> m = new BSTMap<String, Double>();
    while (!in.isEmpty()) {
        m.put(in.readString(), in.readDouble());
    }
    return m;
}`),
    mc(15, '(a) BSTMap (no balancing): best case', RT, rt('Θ(N log N)'), site('ASYMPTOTICS', 'BSTS')),
    mc(16, '(a) BSTMap: worst case', RT, rt('Θ(N²)'), { ...site('ASYMPTOTICS', 'BSTS'), ...note('Best: the tree happens to be balanced. Worst: it’s a chain.') }),
    mc(17, '(b) HashMap (String hashCode is Θ(1)): best case', RT, rt('Θ(N)'), site('ASYMPTOTICS', 'HASHING')),
    mc(18, '(b) HashMap: worst case', RT, rt('Θ(N²)'), { ...site('ASYMPTOTICS', 'HASHING'), ...note('If every key collides, each put scans one long chain.') }),
    mc(19, '(c) 2-3 TreeMap: best case', RT, rt('Θ(N log N)'), site('ASYMPTOTICS', 'B_TREES')),
    mc(20, '(c) 2-3 TreeMap: worst case', RT, rt('Θ(N log N)'), { ...site('ASYMPTOTICS', 'B_TREES'), ...note('A 2-3 tree stays balanced.') }),
  ]),
  problem('6', 'Empirical Analysis (3.5 pts)', null, [
    text('A program’s running time R(N) was measured as below. Approximate it as ~aNᵇ using only the largest data points (round the exponent).'),
    txt(`
N      R(N)
62     17000
125    39000
250    75000
500    500000
1000   4000000`),
    blank(21, 'b (the exponent)', '3', site('ASYMPTOTICS')),
    blank(22, 'a (the constant)', ['0.004', '4/1000', '1/250', '.004'], { ...site('ASYMPTOTICS'),
      ...note('4000000 / 500000 = 8 = 2ᵇ, so b = 3; then a = 4000000 / 1000³ = 0.004.') }),
  ]),
  problem('8', 'Balanced Trees (8 pts)', null, [
    text('(a) A max heap has the array representation [-, 8, 6, 5, 2, 3, 5, 1, 1, 0].'),
    blank(23, '(a) Give the array after the maximum is deleted (as in class), without the unused first spot, separated by commas.', list('6, 3, 5, 2, 0, 5, 1, 1'), { ...site('HEAPS'),
      ...note('The last item 0 replaces 8 at the root and sinks: swap with 6, then with 3.') }),
    text('(b) Consider this 2-3 tree:'),
    txt(`
           [4]
         /     \\
      [2]       [6 8]
     /   \\     /  |  \\
   [1]   [3] [5] [7] [9]`),
    mc(24, '(b) Which insertion order produces this tree? (Several orders work.)', ['1, 2, 3, 4, 5, 6, 7, 8, 9', '9, 8, 7, 6, 5, 4, 3, 2, 1', '4, 2, 6, 8, 1, 3, 5, 7, 9', '5, 4, 3, 2, 1, 6, 7, 8, 9'], 0, site('B_TREES')),
    mc(25, '(c) Tumelo suggests a heap where each item has 4 children. Compared with a normal binary heap, its Θ performance is…', ['Better', 'Worse', 'The same'], 2, { ...site('HEAPS'),
      ...note('Its height is log₄ N = ½ log₂ N, still Θ(log N).') }),
  ]),
  problem('9', 'That Asymptotics Problem You Knew Was Coming (9 pts)', null, [
    text('Give the runtime of each function in Θ notation.'),
    java(`
public static void p1(int N) {
    for (int i = 0; i < N; i += 1) {
        for (int j = 1; j < N; j = j + 2) {
            System.out.println("hi!");
        }
    }
}

public static void p2(int N) {
    for (int i = 0; i < N; i += 1) {
        for (int j = 1; j < N; j = j * 2) {
            System.out.println("hi!");
        }
    }
}

public static void p3(int N) {
    if (N <= 1) return;
    p3(N / 2);
    p3(N / 2);
}

public static void p4(int N) {
    int m = (int) ((15 + Math.round(3.2 / 2)) *
        (Math.floor(10 / 5.5) / 2.5) * Math.pow(2, 5));
    for (int i = 0; i < m; i++) {
        System.out.println("hi");
    }
}

public static void p5(int N) {
    for (int i = 1; i <= N * N; i *= 2) {
        for (int j = 0; j < i; j++) {
            System.out.println("moo");
        }
    }
}`),
    mc(26, 'p1', RT, rt('Θ(N²)'), site('ASYMPTOTICS')),
    mc(27, 'p2', RT, rt('Θ(N log N)'), site('ASYMPTOTICS')),
    mc(28, 'p3', RT, rt('Θ(N)'), { ...site('ASYMPTOTICS', 'RECURSION'), ...note('1 + 2 + 4 + … + N calls, each constant work.') }),
    mc(29, 'p4', RT, rt('Θ(1)'), { ...site('ASYMPTOTICS'), ...note('Nothing depends on N.') }),
    mc(30, 'p5', RT, rt('Θ(N²)'), { ...site('ASYMPTOTICS'), ...note('1 + 2 + 4 + … + N² = Θ(N²).') }),
  ]),
  problem('10', 'Yum Yum Agar (10 pts)', null, [
    java(`
public class Agar {
    public int size; /* assume this is always even and positive */
    public Agar(int s) { size = s; }
    public boolean equals(Object o) {
        Agar other = (Agar) o;
        return this.size == other.size;
    }
    public int hashCode() { /* Not shown, but assume it's consistent with
        equals, always positive, and does not change unless size changes. */
    }
}`),
    text('Agars are stored in a HashSet with M buckets using insertAgar: if an Agar is inserted into a bucket that already holds an Agar exactly half its size, the new Agar eats it, absorbs its size (adding it to its own), and then tries to insert itself again. It may eat several Agars before it is finally inserted. Agars don’t eat Agars in other buckets. HashSet’s instance variables are private; its public methods include add, contains and remove. If x is already in the set, insertAgar does nothing.',
      '(a) Write shouldEatSomething, which returns true if x is going to eat a smaller Agar. HashSet converts hash codes to buckets as in class (hash codes are always positive). Make it as fast as possible.'),
    java(`
static boolean shouldEatSomething(Agar x, HashSet<Agar> set, int M) {
    ⟪a⟫;
    int xBin = ⟪b⟫;
    int miniBin = ⟪c⟫;
    return ⟪d⟫;
}`, { a: 'Agar mini = new Agar(x.size / 2)', b: 'x.hashCode() % M', c: 'mini.hashCode() % M', d: 'set.contains(mini) && miniBin == xBin' }),
    blank(31, '(a) First line', 'Agar mini = new Agar(x.size / 2)', site('HASHING', 'EQUALS')),
    blank(32, '(a) int xBin = ____', ['x.hashCode() % M', 'Math.floorMod(x.hashCode(), M)'], site('HASHING', 'EQUALS')),
    blank(33, '(a) int miniBin = ____', ['mini.hashCode() % M', 'Math.floorMod(mini.hashCode(), M)'], site('HASHING', 'EQUALS')),
    blank(34, '(a) return ____', ['set.contains(mini) && miniBin == xBin', 'miniBin == xBin && set.contains(mini)', 'set.contains(mini) && xBin == miniBin'], { ...site('HASHING', 'EQUALS'),
      ...note('A stand-in Agar of half the size is equal to the one we’re looking for, so contains finds it; it must also be in x’s bucket.') }),
    text('(b) Now write insertAgar.'),
    java(`
static void insertAgar(Agar x, HashSet<Agar> set, int M) {
    if (set.contains(x)) { return; }
    if (⟪e⟫) {
        ⟪f⟫;
        ⟪g⟫;
        ⟪h⟫;
        ⟪i⟫;
    } else {
        ⟪j⟫;
    }
}`, { e: 'shouldEatSomething(x, set, M)', f: 'Agar mini = new Agar(x.size / 2)', g: 'set.remove(mini)', h: 'x.size += mini.size', i: 'insertAgar(x, set, M)', j: 'set.add(x)' }),
    blank(35, '(b) if (____)', 'shouldEatSomething(x, set, M)', site('HASHING', 'RECURSION')),
    blank(36, '(b) First line inside', 'Agar mini = new Agar(x.size / 2)', site('HASHING', 'RECURSION')),
    blank(37, '(b) Second line', 'set.remove(mini)', site('HASHING', 'RECURSION')),
    blank(38, '(b) Third line', ['x.size += mini.size', 'x.size = x.size + mini.size', 'x.size += x.size / 2'], site('HASHING', 'RECURSION')),
    blank(39, '(b) Fourth line', 'insertAgar(x, set, M)', site('HASHING', 'RECURSION')),
    blank(40, '(b) Otherwise', 'set.add(x)', { ...site('HASHING', 'RECURSION'),
      ...note('Remove the half-size Agar (an equal stand-in works because equals compares sizes), grow, and try again. Searching the whole set instead is slower and got partial credit.') }),
  ]),
]);
