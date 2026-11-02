// Fall 2025 Midterm 1 (Thu 9/25/2025), transcribed from the official solutions (updated 9/26/25).
// The exam’s free-form code blanks become one blank per line of the staff solution; alternate solutions the staff
// gave are accepted where they fit those lines, and described in the answer notes. Left out: the last page (0 points).
import { exam, problem, text, java, blank } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-fa25-mt1', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });

export default exam(E, 'Fall 2025 Midterm 1', {
  exam: 'https://drive.google.com/file/d/1JgeEzo5QL3UxhZnQufMjTuL3LvuS7M3u/view',
  sol: 'https://drive.google.com/file/d/1UMUQrPH8VGi7Rg4Y41txtG-D2ebfFUSz/view',
}, 'fa25-mt1', [
  problem('1', 'Map (12.0 pts)', null, [
    text('Fill in rankedAbove, which takes a list of Players and returns a map from each Player to their rank: the highest score has rank 1, the next-highest rank 2, and so on. For example, players with scores 500, 800, 1200 and 100 get ranks 3, 2, 1 and 4. No two players have the same score. Don’t worry about efficiency.'),
    java(`
public class Player {
    public double score;

    public static Map<Player, Integer> rankedAbove(List<Player> players) {
        ⟪a⟫ results = ⟪b⟫;
        for (Player ⟪c⟫) {
            ⟪d⟫;
            for (Player p2 : players) {
                if (⟪e⟫) {
                    ⟪f⟫;
                }
            }
        }
        return results;
    }
}`, { a: 'Map<Player, Integer>', b: 'new HashMap<>()', c: 'p1 : players', d: 'results.put(p1, 1)', e: 'p2.score > p1.score', f: 'results.put(p1, results.get(p1) + 1)' }),
    blank(1, '(a) The type of results', ['Map<Player, Integer>', 'HashMap<Player, Integer>', 'TreeMap<Player, Integer>'], S('1')),
    blank(2, '(b) results = ____', ['new HashMap<>()', 'new TreeMap<>()', 'new HashMap<Player, Integer>()'], S('1')),
    blank(3, '(c) for (Player ____)', 'p1 : players', S('1')),
    blank(4, '(d) First line of the loop', 'results.put(p1, 1)', S('1')),
    blank(5, '(e) if (____)', ['p2.score > p1.score', 'p1.score < p2.score'], S('1')),
    blank(6, '(f) Inside the if', 'results.put(p1, results.get(p1) + 1)', { ...S('1'),
      ...note('Each player’s rank is 1 plus the number of players with a higher score. (Alternatively, count into a local int rank and put it once after the inner loop.)') }),
  ]),
  problem('2', 'Equals (6.0 pts)', null, [
    text('Fill in equals: two GoatMeasurements are equal if and only if they have the same name and their sizes differ by at most 0.1. name is never null. Hint: Math.abs. Syntax hint: if (o instanceof Dog uddaDog).'),
    java(`
public class GoatMeasurement {
    public String name;
    public double size;

    @Override
    public boolean equals(Object o) {
        if (⟪a⟫) {
            return (⟪b⟫ &&
                    ⟪c⟫);
        }
        return ⟪d⟫;
    }
}`, { a: 'o instanceof GoatMeasurement other', b: 'name.equals(other.name)', c: 'Math.abs(size - other.size) <= 0.1', d: 'false' }),
    blank(7, '(a) if (____)', 'o instanceof GoatMeasurement other', S('2')),
    blank(8, '(b) The first condition', ['name.equals(other.name)', 'this.name.equals(other.name)', 'other.name.equals(name)'], S('2')),
    blank(9, '(c) The second condition', ['Math.abs(size - other.size) <= 0.1', 'Math.abs(this.size - other.size) <= 0.1', 'Math.abs(other.size - size) <= 0.1'], S('2')),
    blank(10, '(d) return ____', 'false', { ...S('2'), ...note('Compare strings with equals, not ==.') }),
  ]),
  problem('3', 'LinkedListDeque61B Addition (10.0 pts)', null, [
    text('Implement add for the Project 1 LinkedListDeque61B, which adds x at position idx: add(1, "zoo") changes [ant, bee, cat] to [ant, zoo, bee, cat]. idx is always within [0, size). You may not use any if statements.'),
    java(`
public class LinkedListDeque61B<T> implements Deque61B<T> {
    private Node sentinel; // Circular linked list topology
    private int size;

    private class Node {
        public T value;
        public Node prev, next;
        public Node(T value, Node prev, Node next) {
            this.value = value;
            this.prev = prev;
            this.next = next;
        }
    }
    ...
    public void add(int idx, T x) {
        ⟪a⟫;
        for (⟪b⟫) {
            ⟪c⟫;
        }
        ⟪d⟫;
        ⟪e⟫;
        ⟪f⟫;
        ⟪g⟫;
    }
}`, { a: 'Node curr = sentinel', b: 'int i = 0; i < idx; i++', c: 'curr = curr.next', d: 'Node newNode = new Node(x, curr, curr.next)', e: 'curr.next.prev = newNode', f: 'curr.next = newNode', g: 'size++' }),
    blank(11, '(a) First line', 'Node curr = sentinel', S('3')),
    blank(12, '(b) The loop header', ['int i = 0; i < idx; i++', 'int i = 0; i < idx; i += 1'], S('3')),
    blank(13, '(c) The loop body', 'curr = curr.next', S('3')),
    blank(14, '(d) Make the new node', 'Node newNode = new Node(x, curr, curr.next)', S('3')),
    blank(15, '(e) Next line', 'curr.next.prev = newNode', S('3')),
    blank(16, '(f) Next line', 'curr.next = newNode', S('3')),
    blank(17, '(g) Last line', ['size++', 'size += 1', 'size = size + 1'], { ...S('3'),
      ...note('Walk idx steps from the sentinel to the node before the new one, then link the new node between it and its next. The order of (e) and (f) matters: set curr.next last.') }),
  ]),
  problem('4', 'A Default Method (12.0 pts)', null, [
    text('Implement rotateToFront, which rotates a deque left until the first element equal to x is at the front; if x isn’t there, the order must not change. Return true if x was found. For example, rotateToFront(9) changes [1, 2, 9, 3, 4, 9] to [9, 3, 4, 9, 1, 2]. x isn’t null and the deque has no nulls. You may use any Deque61B method (getFirst, removeFirst, addLast, get, size, …). You may not use new.'),
    java(`
public interface Deque61B<T> {
    ...
    default boolean rotateToFront(T x) {
        ⟪a⟫;
        while (⟪b⟫) {
            if (⟪c⟫) {
                ⟪d⟫;
            }
            ⟪e⟫;
            ⟪f⟫;
        }
        ⟪g⟫;
    }
}`, { a: 'int rotations = 0', b: 'rotations < size()', c: 'getFirst().equals(x)', d: 'return true', e: 'addLast(removeFirst())', f: 'rotations += 1', g: 'return false' }),
    blank(18, '(a) First line', 'int rotations = 0', S('4')),
    blank(19, '(b) while (____)', 'rotations < size()', S('4')),
    blank(20, '(c) if (____)', ['getFirst().equals(x)', 'x.equals(getFirst())', 'get(0).equals(x)'], S('4')),
    blank(21, '(d) Inside the if', 'return true', S('4')),
    blank(22, '(e) Rotate by one', 'addLast(removeFirst())', S('4')),
    blank(23, '(f) Count it', ['rotations += 1', 'rotations++', 'rotations = rotations + 1'], S('4')),
    blank(24, '(g) After the loop', 'return false', { ...S('4'),
      ...note('After size() rotations without finding x, the deque is back in its original order.') }),
  ]),
  problem('5', 'Resize (10.0 pts)', null, [
    text('Implement resize for the Project 2 ArrayDeque61B: resize the backing array to length capacity with the items in order starting at index 0, and update nextFirst and nextLast. You may use Deque61B methods; capacity is at least the number of items. Syntax hint: Glorp[] arrayOfGenerics = (Glorp[]) new Object[61];'),
    java(`
public class ArrayDeque61B<T> implements Deque61B<T> {
    private T[] items;
    private int size;      // Total number of items in the deque
    private int nextFirst; // Index where addFirst will add an item if called next
    private int nextLast;  // Index where addLast will add an item if called next
    ...
    private void resize(int capacity) {
        ⟪a⟫;
        for (⟪b⟫) {
            ⟪c⟫;
        }
        ⟪d⟫;
        ⟪e⟫;
        ⟪f⟫;
    }
}`, { a: 'T[] a = (T[]) new Object[capacity]', b: 'int i = 0; i < size; i += 1', c: 'a[i] = get(i)', d: 'items = a', e: 'nextFirst = items.length - 1', f: 'nextLast = size' }),
    blank(25, '(a) First line', 'T[] a = (T[]) new Object[capacity]', S('5')),
    blank(26, '(b) The loop header', ['int i = 0; i < size; i += 1', 'int i = 0; i < size; i++', 'int i = 0; i < size(); i++'], S('5')),
    blank(27, '(c) The loop body', 'a[i] = get(i)', S('5')),
    blank(28, '(d) Next line', 'items = a', S('5')),
    blank(29, '(e) nextFirst', ['nextFirst = items.length - 1', 'nextFirst = capacity - 1', 'nextFirst = a.length - 1'], S('5')),
    blank(30, '(f) nextLast', 'nextLast = size', { ...S('5'), ...note('With the items at 0 … size − 1, the next addLast goes at size and the next addFirst wraps to the last index.') }),
  ]),
  problem('6', 'Prime Factorization (16.0 pts)', null, [
    text('primeFactors takes an int x > 1 and returns its prime factors in increasing order; e.g. primeFactors(60) returns [2, 2, 3, 5].',
      '6.1 smallestPrimeFactor returns x’s smallest prime factor, e.g. 2 for 60 and 3 for 63.'),
    java(`
public static int smallestPrimeFactor(int x) {
    ⟪a⟫;
    while (true) {
        if (⟪b⟫) {
            ⟪c⟫;
        }
        ⟪d⟫;
    }
}`, { a: 'int i = 2', b: 'x % i == 0', c: 'return i', d: 'i += 1' }),
    blank(31, '6.1 (a)', 'int i = 2', S('6.1')),
    blank(32, '6.1 (b) if (____)', 'x % i == 0', S('6.1')),
    blank(33, '6.1 (c)', 'return i', S('6.1')),
    blank(34, '6.1 (d)', ['i += 1', 'i++', 'i = i + 1'], { ...S('6.1'), ...note('The first divisor found counting up from 2 is always prime.') }),
    text('6.2 addAllPrimeFactors adds all prime factors of x to factors, using recursion. You may use smallestPrimeFactor.'),
    java(`
public static void addAllPrimeFactors(int x, List<Integer> factors) {
    if (⟪e⟫) {
        ⟪f⟫;
    }
    ⟪g⟫;
    ⟪h⟫;
    ⟪i⟫;
}`, { e: 'x == 1', f: 'return', g: 'int spf = smallestPrimeFactor(x)', h: 'factors.add(spf)', i: 'addAllPrimeFactors(x / spf, factors)' }),
    blank(35, '6.2 if (____)', ['x == 1', 'x <= 1', 'x < 2'], S('6.2')),
    blank(36, '6.2 Inside the if', 'return', S('6.2')),
    blank(37, '6.2 Next line', 'int spf = smallestPrimeFactor(x)', S('6.2')),
    blank(38, '6.2 Next line', 'factors.add(spf)', S('6.2')),
    blank(39, '6.2 The recursive call', 'addAllPrimeFactors(x / spf, factors)', S('6.2')),
    text('6.3 primeFactors returns all prime factors of x in increasing order, using the helpers.'),
    java(`
public static List<Integer> primeFactors(int x) {
    ⟪j⟫;
    ⟪k⟫;
    return ⟪l⟫;
}`, { j: 'List<Integer> factors = new ArrayList<>()', k: 'addAllPrimeFactors(x, factors)', l: 'factors' }),
    blank(40, '6.3 First line', ['List<Integer> factors = new ArrayList<>()', 'List<Integer> factors = new LinkedList<>()'], S('6.3')),
    blank(41, '6.3 Second line', 'addAllPrimeFactors(x, factors)', S('6.3')),
    blank(42, '6.3 return ____', 'factors', S('6.3')),
  ]),
  problem('7', 'Ejection (20.0 pts)', null, [
    text('The eject methods remove all appearances of int y from an IntList.',
      '7.1 Fill in ejectND, which is non-destructive.'),
    java(`
public static IntList ejectND(IntList x, int y) {
    if (⟪a⟫) {
        ⟪b⟫;
    }
    if (⟪c⟫) {
        return ⟪d⟫;
    }
    return new ⟪e⟫;
}`, { a: 'x == null', b: 'return null', c: 'x.first == y', d: 'ejectND(x.rest, y)', e: 'IntList(x.first, ejectND(x.rest, y))' }),
    blank(43, '7.1 if (____)', 'x == null', S('7.1')),
    blank(44, '7.1 Inside it', 'return null', S('7.1')),
    blank(45, '7.1 if (____)', 'x.first == y', S('7.1')),
    blank(46, '7.1 return ____', 'ejectND(x.rest, y)', S('7.1')),
    blank(47, '7.1 return new ____', 'IntList(x.first, ejectND(x.rest, y))', S('7.1')),
    text('7.2 Fill in ejectD, which is destructive. You may not use new. (Staff called this one of the most difficult questions on the exam.)'),
    java(`
public static IntList ejectD(IntList x, int y) {
    if (⟪f⟫) {
        ⟪g⟫;
    }
    ⟪h⟫;
    if (x.first == y) {
        return ⟪i⟫;
    }
    return ⟪j⟫;
}`, { f: 'x == null', g: 'return null', h: 'x.rest = ejectD(x.rest, y)', i: 'x.rest', j: 'x' }),
    blank(48, '7.2 if (____)', 'x == null', S('7.2')),
    blank(49, '7.2 Inside it', 'return null', S('7.2')),
    blank(50, '7.2 The line before the second if', 'x.rest = ejectD(x.rest, y)', S('7.2')),
    blank(51, '7.2 return ____ (x.first is y)', 'x.rest', S('7.2')),
    blank(52, '7.2 return ____', 'x', { ...S('7.2'), ...note('Fix the rest of the list first, then drop this node by returning what follows it, or keep it.') }),
  ]),
  problem('8', 'LEQIterator (14.0 pts)', null, [
    text('LEQIterator iterates over all numbers in an IntList that are less than or equal to the integer at the front of the list. For example, for IntList.of(25, 30, 10, 5, 90, 25, 80) it yields 25, 10, 5, 25. L is not null, and you don’t need to throw exceptions.'),
    java(`
public class LEQIterator implements Iterator<Integer> {
    private ⟪a⟫ current;
    private ⟪b⟫ frontNumber;

    public LEQIterator(IntList L) {
        ⟪c⟫;
        ⟪d⟫;
    }

    public boolean hasNext() {
        return ⟪e⟫;
    }

    public Integer next() {
        ⟪f⟫;
        ⟪g⟫;
        while (⟪h⟫ &&
               ⟪i⟫) {
            ⟪j⟫;
        }
        return ⟪k⟫;
    }
}`, { a: 'IntList', b: 'int', c: 'current = L', d: 'frontNumber = L.first', e: 'current != null', f: 'int numToReturn = current.first', g: 'current = current.rest', h: 'current != null', i: 'current.first > frontNumber', j: 'current = current.rest', k: 'numToReturn' }),
    blank(53, '(a) The type of current', 'IntList', S('8')),
    blank(54, '(b) The type of frontNumber', ['int', 'Integer'], S('8')),
    blank(55, '(c) First line of the constructor', 'current = L', S('8')),
    blank(56, '(d) Second line', 'frontNumber = L.first', S('8')),
    blank(57, '(e) hasNext returns', 'current != null', S('8')),
    blank(58, '(f) First line of next', 'int numToReturn = current.first', S('8')),
    blank(59, '(g) Second line', 'current = current.rest', S('8')),
    blank(60, '(h) First loop condition', 'current != null', S('8')),
    blank(61, '(i) Second loop condition', ['current.first > frontNumber', 'frontNumber < current.first'], S('8')),
    blank(62, '(j) The loop body', 'current = current.rest', S('8')),
    blank(63, '(k) return ____', 'numToReturn', { ...S('8'),
      ...note('next always leaves current on the next number to return (or null), skipping anything larger than the front number, so hasNext only needs a null check.') }),
  ]),
]);
