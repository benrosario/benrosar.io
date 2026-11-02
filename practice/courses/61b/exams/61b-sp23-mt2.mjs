// Spring 2023 Midterm 2 (Thu 3/16/2023), transcribed from the official solutions. (This exam’s point values are
// written ×100, e.g. 1100 points for Q1.)
// Changed for this site, and said so on the page: Q6 Part 1 asks only for the classification (the reason or the
// colliding words are in the answer note). Left out: Q9, Q10 and the last page (0 points).
import { exam, problem, text, java, txt, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-sp23-mt2', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });
const EV = ['true', 'false', 'Compile error', 'Runtime error'];
const ASR = ['Always true', 'Sometimes true', 'Never true'];
const CLS = ['Incorrect', 'Ineffective', 'Correct'];
const POS = ['Possible', 'Impossible'];
const SYM = ['!', '@', '#', '$', '%', '?', '&'];
const IDX = ['1', '2', '3', '4', '5', '6', '7', '8'];
const TH = ['Θ(1)', 'Θ(log N)', 'Θ(N)', 'Θ(N log N)', 'Θ(N²)', 'Θ((N−1)!)', 'Θ(N!)', 'Θ(2ᴺ)', 'Θ(N^(N−1))', 'Θ(Nᴺ)'];
const BOTH = [...TH, ...TH.map(t => t.replace('Θ', 'O'))];
const th = s => TH.indexOf(s), o = s => TH.length + TH.indexOf(s.replace('O', 'Θ'));
const arr = s => [s, `[${s}]`, s.replace(/,/g, '')];

export default exam(E, 'Spring 2023 Midterm 2', {
  exam: 'https://drive.google.com/file/d/1zypNNO8rkaHFNd0zZm6X2WifXtY0yglk/view',
  sol: 'https://drive.google.com/file/d/1WrnceY7c5UnAPTDZbDdG8qaxR3iodiza/view',
}, 'sp23-mt2', [
  problem('1', 'Taiko Time! (1100 pts)', null, [
    java(`
public class Taiko {
    private String name;
    private int size;
    public Taiko(String name, int size) {
        this.name = name;
        this.size = size;
    }

    public String play() { return "BOOM"; }
    public String getName() { return name; }
}

public class Chu extends Taiko {
    public Chu(String name, int size) {
        super(name, size);
    }

    public String play() { return "don kon"; }
}

public class Shime extends Taiko {
    public Shime(String name, int size) {
        super(name, size);
    }

    public String play() { return super.play(); }
}`),
    mc(1, '(a) Crystal plans to take out the equipment items one by one, starting from the item she most recently put in. Which data structure should she use?', ['Set', 'LLRB', 'Heap', 'Map', 'Stack'], 4, S('1a')),
    text('(b) We use a Queue for the equipment in organize below. Crystal wants to put each item in its collection: mapping its name to the Chu in chus, or putting a Shime into shimes. All elements of equipment are Chus or Shimes, and you may destructively alter equipment.'),
    java(`
public class Cages {
    private Map<String, Chu> chus = new TreeMap<>();
    private Set<Shime> shimes = new HashSet<>();

    public void organize(Queue<⟪a⟫> equipment) {
        while (⟪b⟫) {
            ⟪c⟫;
            if (⟪d⟫) {
                ⟪e⟫;
            } else {
                ⟪f⟫;
            }
        }
    }
}`, { a: 'Taiko', b: 'equipment.size() != 0', c: 'Taiko t = equipment.remove()', d: 't instanceof Chu chu', e: 'chus.put(chu.getName(), chu)', f: 'shimes.add((Shime) t)' }),
    blank(2, '(b) Queue<____>', 'Taiko', S('1b')),
    blank(3, '(b) while (____)', ['equipment.size() != 0', '!equipment.isEmpty()', 'equipment.size() > 0'], S('1b')),
    blank(4, '(b) First line of the loop', 'Taiko t = equipment.remove()', S('1b')),
    blank(5, '(b) if (____)', 't instanceof Chu chu', S('1b')),
    blank(6, '(b) If it’s a Chu', ['chus.put(chu.getName(), chu)', 'chus.put(t.getName(), chu)', 'chus.put(t.getName(), (Chu) t)'], S('1b')),
    blank(7, '(b) Otherwise', 'shimes.add((Shime) t)', S('1b')),
    text('(c) Crystal decides that two Taiko are equal if they produce the same sound with play():'),
    java(`
@Override
public boolean equals(Object o) {
    // o typechecking not shown
    ...
    return ((Taiko) o).play().equals(this.play());
}`),
    java(`
Taiko m = new Taiko("miyake", 5);
Shime b = new Shime("beato", 2);
Chu h = new Chu("hachijo", 7);
Taiko y = new Chu("yatai", 9);
Taiko s = new Shime("suwari", 6);`),
    text('Evaluate each statement. If the code errors, say whether it’s a compile error or a runtime error.'),
    mc(8, '(c) m.equals(b)', EV, 0, { ...S('1c'), ...note('Shime’s play calls Taiko’s, so both say "BOOM".') }),
    mc(9, '(c) h.equals(y)', EV, 0, { ...S('1c'), ...note('Both are Chus at runtime: "don kon".') }),
    mc(10, '(c) s.equals((Chu) s)', EV, 3, { ...S('1c'), ...note('s’s static type Taiko can be cast to Chu, so it compiles, but it’s a Shime at runtime: ClassCastException.') }),
    mc(11, '(c) ((Taiko) b).equals((Taiko) h)', EV, 1, { ...S('1c'), ...note('Dynamic types decide play: "BOOM" vs "don kon".') }),
    mc(12, '(c) ((Chu) m).equals(y)', EV, 3, { ...S('1c'), ...note('m is a plain Taiko, so the cast fails at runtime.') }),
    mc(13, '(c) b.equals((Shime) h)', EV, 2, { ...S('1c'), ...note('h’s static type is Chu, and a Chu can never be a Shime, so the cast doesn’t compile.') }),
    mc(14, '(c) s.equals(h)', EV, 1, S('1c')),
  ]),
  problem('2', 'BSTIterator (700 pts)', null, [
    mc(15, '(a) Given a Binary Search Tree, which tree traversal yields the keys in sorted order?', ['Level-order', 'In-order', 'Pre-order', 'Post-order'], 1, S('2a')),
    text('(b) Complete BSTIterator so it yields the keys in sorted order. No elements are added or removed after the iterator is made. You may not instantiate any classes other than Iterators. Collections.emptyIterator() returns an empty Iterator (not null).'),
    java(`
public class BST<K extends Comparable<K>> {
    private Node root;
    private class Node {
        K key;
        Node left;
        Node right;
        Node(K key) {
            this.key = key;
        }
    }

    public Iterator<K> iterator() {
        return new BSTIterator(⟪a⟫);
    }

    private class BSTIterator implements Iterator<K> {
        Iterator<K> iterLeft;
        K current;
        Iterator<K> iterRight;
        BSTIterator(Node n) {
            if (n == null) {
                iterLeft = Collections.emptyIterator();
                current = null;
                iterRight = Collections.emptyIterator();
            } else {
                iterLeft = ⟪b⟫;
                current = ⟪c⟫;
                iterRight = ⟪d⟫;
            }
        }

        @Override
        public boolean hasNext() {
            return ⟪e⟫ || ⟪f⟫ || ⟪g⟫;
        }

        @Override
        public K next() {
            if (!hasNext()) {
                throw new NoSuchElementException();
            }
            if (iterLeft.hasNext()) {
                return ⟪h⟫;
            } else if (current != null) {
                K result = ⟪i⟫;
                current = ⟪j⟫;
                return ⟪k⟫;
            } else {
                return ⟪l⟫;
            }
        }
    }
}`, { a: 'root', b: 'new BSTIterator(n.left)', c: 'n.key', d: 'new BSTIterator(n.right)', e: 'iterLeft.hasNext()', f: 'current != null', g: 'iterRight.hasNext()', h: 'iterLeft.next()', i: 'current', j: 'null', k: 'result', l: 'iterRight.next()' }),
    blank(16, '(b) new BSTIterator(____)', 'root', S('2b')),
    blank(17, '(b) iterLeft = ____', 'new BSTIterator(n.left)', S('2b')),
    blank(18, '(b) current = ____', 'n.key', S('2b')),
    blank(19, '(b) iterRight = ____', 'new BSTIterator(n.right)', S('2b')),
    blank(20, '(b) hasNext: the first condition', 'iterLeft.hasNext()', S('2b')),
    blank(21, '(b) hasNext: the second condition', 'current != null', S('2b')),
    blank(22, '(b) hasNext: the third condition', 'iterRight.hasNext()', S('2b')),
    blank(23, '(b) next: return ____ (left side not done)', 'iterLeft.next()', S('2b')),
    blank(24, '(b) K result = ____', 'current', S('2b')),
    blank(25, '(b) current = ____', 'null', S('2b')),
    blank(26, '(b) return ____ (the current key)', 'result', S('2b')),
    blank(27, '(b) Otherwise, return ____', 'iterRight.next()', { ...S('2b'),
      ...note('Each iterator covers one subtree in order: everything from its left subtree’s iterator, then its own key (set to null once used), then everything from its right subtree’s iterator.') }),
  ]),
  problem('3', 'Disjoint Sets (900 pts)', null, [
    text('A Weighted Quick Union’s underlying array is currently (indices 0 to 9): [−4, −3, 0, −2, 0, −1, 1, 1, 3, 2].'),
    blank(28, '(a) How many disjoint sets are there currently?', '4', { ...S('3'), ...note('The roots (negative entries) are 0, 1, 3 and 5.') }),
    blank(29, '(b) We call connect(4, 9) without path compression. How many disjoint sets are there now?', '4', { ...S('3'), ...note('4 and 9 are both already in 0’s set.') }),
    blank(30, '(c) After connect(4, 9), we call connect(4, 1), both without path compression. What is the height of the resulting tree of this set? (Height is the greatest number of edges from the root to a leaf.)', '2', S('3')),
    blank(31, '(d) After connect(4, 9) and connect(4, 1), what is the underlying array? (Indices 0 to 9, separated by commas.)', arr('-7, 0, 0, -2, 0, -1, 1, 1, 3, 2'), { ...S('3'),
      ...note('connect(4, 1) joins root 1 (size 3) under root 0 (size 4): 0 becomes −7 and 1 becomes 0. The tree is 0 → 1 → 6, height 2.') }),
    text('Parts (e) and (f) are unrelated to (a)–(d). Before: [−9, −1, 0, 4, 2, 4, 2, 6, 2, 5].'),
    blank(32, '(e) What does the underlying array look like after calling isConnected(1, 9) with path compression?', arr('-9, -1, 0, 4, 0, 0, 2, 6, 2, 0'), { ...S('3'),
      ...note('Finding 9’s root walks 9 → 5 → 4 → 2 → 0, and path compression points 9, 5 and 4 straight at 0 (2 already is). 1 is its own root, so nothing on its side changes.') }),
    blank(33, '(f) What is the output of this call to isConnected(1, 9)?', 'false', { ...S('3'), ...note('1 is a separate root.') }),
  ]),
  problem('4', 'Two Tree, Three Tree, Red Tree, Black Tree (1100 pts)', null, [
    blank(34, '(a) What is the maximum number of leaf nodes for a 2-3 tree with height 5? (Height is the greatest number of edges from the root to a leaf.)', '243', { ...S('4'), ...note('All 3-nodes: 3⁵ = 243 leaves.') }),
    blank(35, '(b) What is the maximum number of elements for a 2-3 tree with height 4?', '242', { ...S('4'), ...note('(1 + 3 + 9 + 27 + 81) nodes × 2 elements = 121 × 2 = 242.') }),
    text('For (c) and (d), consider the valid 2-3 tree with root [5] and children [1] and [7 8].'),
    blank(36, '(c) What is the minimum number of elements to insert to trigger a change in height?', '3', { ...S('4'),
      ...note('One more into [7 8] splits it, filling the root to [5 8]; two more into one of the single-element children then split it and the full root.') }),
    blank(37, '(d) What is the maximum number of distinct elements that can be inserted without changing the height of the tree?', '4', S('4')),
    text('For (e)–(g), the operations are independent. A single add is performed on a Left-Leaning Red-Black Tree. Which are true?'),
    mc(38, '(e) If a rotateLeft happened, it is immediately followed by a rotateRight (no operations in between).', ASR, 1, S('4')),
    mc(39, '(f) If a rotateRight happened, it is immediately followed by a colorFlip.', ASR, 0, { ...S('4'), ...note('rotateRight fixes two left reds in a row, which always leaves a node with two red children.') }),
    mc(40, '(g) If a colorFlip happened, it is immediately followed by another colorFlip.', ASR, 1, S('4')),
    text('(h) Which of these are not well-formed 2-3 trees? Each is written node(children).'),
    txt(`
(i)   [8]([5]([4], [7]), [10]([9]))
(ii)  [8]([4 6]([3], [5], [7]), [10 12]([9], [11], [13]))
(iii) [5]([1 2 3], [9 10])
(iv)  [7 10]([3], [8], [13 15])
(v)   [4 8]([3], [15])`),
    sata(41, '(h) Select all that are not well-formed 2-3 trees.', ['(i)', '(ii)', '(iii)', '(iv)', '(v)'], [0, 2, 4], { ...S('4'),
      ...note('(i): [10] has one child. (iii): a node can’t hold 3 elements. (v): a 2-element node needs 3 children.') }),
  ]),
  problem('5', 'Tree Shirts (900 pts)', null, [
    text('Crystal stores available shirt sizes in a BST. Fill out findShirt(int reqSize), which returns the smallest Node greater than or equal to the requested size, or null if there is none. For example, with the BST below, findShirt(13) returns the Node with 15.'),
    txt(`
        20
      /    \\
    15      27
   /  \\       \\
  4    17      30`),
    java(`
public class TreeShirt {
    private Node root;
    private class Node {
        int shirtSize;
        Node left;
        Node right;
    }

    public Node findShirt(int reqSize) {
        Node prev = null;
        Node curr = root;
        while (⟪a⟫) {
            if (⟪b⟫) {
                return curr;
            } else if (⟪c⟫) {
                ⟪d⟫;
                ⟪e⟫;
            } else {
                ⟪f⟫;
            }
        }
        return ⟪g⟫;
    }
}`, { a: 'curr != null', b: 'curr.shirtSize == reqSize', c: 'curr.shirtSize > reqSize', d: 'prev = curr', e: 'curr = curr.left', f: 'curr = curr.right', g: 'prev' }),
    blank(42, 'while (____)', 'curr != null', S('5')),
    blank(43, 'if (____) return curr', 'curr.shirtSize == reqSize', S('5')),
    blank(44, 'else if (____)', ['curr.shirtSize > reqSize', 'reqSize < curr.shirtSize'], S('5')),
    blank(45, 'First line inside it', 'prev = curr', S('5')),
    blank(46, 'Second line inside it', 'curr = curr.left', S('5')),
    blank(47, 'Otherwise', 'curr = curr.right', S('5')),
    blank(48, 'return ____', 'prev', { ...S('5'),
      ...note('Every node larger than reqSize is a candidate: remember it and look left for a smaller one. Smaller nodes send you right. The last remembered candidate is the answer.') }),
  ]),
  problem('6', 'Hash-ish (900 pts)', null, [
    text('Part 1: Classify each String hash function. Incorrect: not a valid hash function, or buggy. Ineffective: valid, but collisions are easy to find. Correct: valid, and collisions aren’t easy to find (only one answer below is Correct). (The exam also asked for a reason or two colliding words.)'),
    java(`
(a) public int hashCode() {
        Random random = new Random();
        return this.length * random.nextInt();
    }

(b) public int hashCode() {
        Random random = new Random(this.hashCode());
        return random.nextInt();
    }

(c) public int hashCode() {
        return 0;
    }

(d) public int hashCode() {
        Random random = new Random(0);
        int val = 0;
        for (char c : this.toCharArray()) {
            val += c * random.nextInt();
        }
        return val;
    }

(e) public int hashcode() {
        int val = 0;
        for (char c : this.toCharArray()) {
            val += c;
        }
        return val;
    }`),
    mc(49, 'Part 1 (a)', CLS, 0, { ...S('6.1'), ...note('An unseeded Random is nondeterministic, so the same string gets different hashes.') }),
    mc(50, 'Part 1 (b)', CLS, 0, { ...S('6.1'), ...note('It calls hashCode inside hashCode: infinite recursion.') }),
    mc(51, 'Part 1 (c)', CLS, 1, { ...S('6.1'), ...note('Every string collides, e.g. "pot" and "tea".') }),
    mc(52, 'Part 1 (d)', CLS, 2, { ...S('6.1'), ...note('A fixed seed gives the same weights every time, and different positions get different weights.') }),
    mc(53, 'Part 1 (e)', CLS, 1, { ...S('6.1'), ...note('Anagrams collide, e.g. "tea" and "eat".') }),
    text('Part 2: You are an evil hacker with a HashMap of instructor names (Strings). You may only insert elements and time each insertion; you know how the HashMap and the String hash function work but not the data. It uses linked-list bins and resizes when elements / bins exceeds a threshold. It already holds a few values, not all with the same hash, and the hash function distributes values evenly.',
      'Possible: it is sometimes impossible with a correct hash function, but always possible with an ineffective one (as defined in Part 1). Impossible: even with an ineffective hash function, it is sometimes impossible.'),
    mc(54, 'Part 2 (a) Determine how many names were originally in the HashMap.', POS, 0, { ...S('6.2'),
      ...note('Keep adding names and time each one: resizes are much slower. After two or three resizes you can work out the original count.') }),
    mc(55, 'Part 2 (b) Determine whether "Justin" is in the HashMap, without inserting "Justin" yourself.', POS, 1, { ...S('6.2'),
      ...note('You can’t tell "Justin" apart from another value with the same hash.') }),
    mc(56, 'Part 2 (c) Make it arbitrarily slow for other people to access any name in the HashMap.', POS, 1, { ...S('6.2'),
      ...note('You’d need the hashes of every element already there, which you can’t find out.') }),
    mc(57, 'Part 2 (d) "Justin" and "Josh" were already inserted and have the same hash. Make it arbitrarily slow to access "Justin", but still fast to access "Josh".', POS, 1, { ...S('6.2'),
      ...note('They already sit a fixed distance apart in their bucket; new items can’t be put between them.') }),
  ]),
  problem('7', 'SHeap (900 pts)', null, [
    text('This array is a min-heap of 7 values, where each symbol is a distinct number (the symbols have no implied order). Index 0 is NULL and index 8 is unused.'),
    txt(`
Index:  0     1  2  3  4  5  6  7  8
Value:  NULL  !  @  #  $  %  ?  &`),
    text('Answer about the heap after removing the minimum value.'),
    sata(58, '(a) Which indices might contain & in the resulting min-heap?', IDX, [1, 2, 3, 4, 5], S('7')),
    sata(59, '(b) Which indices might contain % in the resulting min-heap?', IDX, [1, 4], S('7')),
    sata(60, '(c) Which symbols could be at index 4 in the resulting heap?', SYM, [3, 6], { ...S('7'),
      ...note('& moves to the root and sinks along some path. % is under @, so it either stays at 5 or moves up to 2.') }),
    text('Now return to the original heap and insert ✓.'),
    sata(61, '(d) At which indices might ✓ end up?', IDX, [0, 1, 3, 7], { ...S('7'), ...note('It starts at index 8 and can only swim up its ancestors: 4, 2, 1.') }),
    sata(62, '(e) Which symbols could be at index 2 in the resulting min-heap?', [...SYM, '✓'], [0, 1, 7], S('7')),
    sata(63, '(f) Which indices in the resulting array might contain the 3rd smallest value?', IDX, [1, 2, 3, 4, 5, 6], S('7')),
  ]),
  problem('8', 'Combinatorial Explosion (1500 pts)', null, [
    java(`
public static int multiply(int a, int b) {
    int val = 0;
    for (int i = 0; i < a; i += 1) {
        val = val + b;
    }
    return val;
}

public static int fact(int n) {
    if (n == 0) { return 1; }
    return multiply(n, fact(n - 1));
}

public static int multiplyAll(List<Integer> lst) {
    Stack<Integer> values = new Stack<>(lst);
    while (values.size() > 1) {
        int i = values.remove();
        int j = values.remove();
        values.insert(multiply(i, j));
    }
    return values.remove();
}

public static int grahamHelper(int base, int pow, int iter) {
    if (iter == 0) { return multiply(base, pow); }
    if (pow == 0) { return base; }
    return grahamHelper(base, grahamHelper(base, pow - 1, iter), iter - 1);
}

public static int grahamCracker(int n) {
    g = grahamHelper(3, 3, 4);
    for (int i = 1; i < 64; i += 1) {
        g = grahamHelper(3, 3, g);
    }
    return g;
}`),
    text('Assume all arithmetic operations (+, −, %, and the built-in *, but not multiply) run in constant time. A sum f(1) + … + f(n) is Θ(n·f(n)) if f is polynomial or logarithmic, and Θ(f(n)) if f is exponential or larger.'),
    mc(64, '(a) What is the runtime of fact in terms of N?', TH, th('Θ(N²)'), { ...S('8'), ...note('multiply runs in Θ(a); fact calls it with a = 1, 2, …, N.') }),
    text('(b) lst has N elements, all less than N.'),
    mc(65, '(b) multiplyAll best case', TH, th('Θ(N)'), S('8')),
    mc(66, '(b) multiplyAll worst case', TH, th('Θ(N^(N−1))'), { ...S('8'),
      ...note('Best: all 1s. Worst: all N, so the left argument grows N, N², …, N^(N−1), and the last term dominates.') }),
    mc(67, '(c) What is the runtime of grahamCracker in terms of N?', TH, th('Θ(1)'), { ...S('8'), ...note('It computes an enormous number, but never uses n.') }),
    text('Each change below is independent.'),
    mc(68, '(d) The runtime of fact if multiply were replaced with return a * b;', TH, th('Θ(N)'), S('8')),
    sata(69, '(e) Which correctly describe the runtime of fact if we swapped the arguments, so its last line is return multiply(fact(n-1), n);? Select all that apply.', BOTH, [th('Θ((N−1)!)'), o('O((N−1)!)'), o('O(N!)'), o('O(N^(N−1))'), o('O(Nᴺ)')], { ...S('8'),
      ...note('multiply now runs on 1, 2!, 3!, …, (N−1)!, which sums to Θ((N−1)!). That’s not Θ(N!) (they differ by a factor of N), and it grows faster than 2ᴺ.') }),
    text('(f) Replace the stack in multiplyAll with a queue. As before, lst has N elements, all less than N.'),
    sata(70, '(f) Best case: select all that apply.', BOTH, [th('Θ(N)'), ...['O(N)', 'O(N log N)', 'O(N²)', 'O((N−1)!)', 'O(N!)', 'O(2ᴺ)', 'O(N^(N−1))', 'O(Nᴺ)'].map(o)], S('8')),
    sata(71, '(f) Worst case: select all that apply.', BOTH, ['O((N−1)!)', 'O(N!)', 'O(N^(N−1))', 'O(Nᴺ)'].map(o), { ...S('8'),
      ...note('With all values N, the queue multiplies pairs like a binary tree: the last multiplication costs between N^(N/3) and N^(N/2) depending on N, so there is no single Θ bound, but it is O(N^(N/2)), which (N−1)!, N!, N^(N−1) and Nᴺ all bound.') }),
  ]),
]);
