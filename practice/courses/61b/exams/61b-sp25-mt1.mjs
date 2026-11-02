// Spring 2025 Midterm 1 (Thu 2/20/2025), transcribed from the official solutions (updated 2/24).
// Code questions are one blank per line of the staff solution. In 2(a) the printed staff key loops j from 0 but reads
// index j − 1, which would go out of bounds; this site accepts the corrected loop (j from 1) and the equivalent j + 1
// form. Left out: the last page (0 points).
import { exam, problem, text, java, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-sp25-mt1', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });

export default exam(E, 'Spring 2025 Midterm 1', {
  exam: 'https://drive.google.com/file/d/14XrrtR40_1CgEe_YySzUg7zsrS_EgqsW/view',
  sol: 'https://drive.google.com/file/d/1qdjKy3cjzyS7QKKxq5_OAV68jZAvQDWP/view',
}, 'sp25-mt1', [
  problem('1', 'CS61Bot (12.0 pts)', null, [
    java(`
public interface ChatBot {
    public void answerQuery(String q);
    default public String myInfo() {
        return "I am a ChatBot!";
    }
}`),
    sata(1, '(a) We create a class CS61Bot that implements ChatBot. Which are true?', ['The CS61Bot class can compile even if it does not define an answerQuery method.', 'The CS61Bot class can compile even if it does not define a myInfo method.', 'If we override myInfo, we must add an @Override tag in order for the CS61Bot class to compile.', 'If we do not override answerQuery, our program may crash at runtime.', 'We can define a constructor for CS61Bot even though the interface doesn’t list any constructors.'], [1, 4], { ...S('1a'),
      ...note('Every non-default interface method must be implemented, or it won’t compile (so it can’t crash at runtime). myInfo has a default. @Override is optional.') }),
    java(`
public class CS61Bot implements ChatBot {
    public static String versionInfo = "CS61Bot version 5";
    @Override
    public void answerQuery(String q) {
        // implementation not shown
    }
    @Override
    public String myInfo() {
        return versionInfo;
    }
    public static void main(String[] args) {
        CS61Bot bot = new CS61Bot();
        System.out.println(bot.myInfo());
    }
}`),
    mc(2, '(b) What happens when main runs?', ['The program prints "I am a ChatBot!".', 'The program prints "CS61Bot version 5".', 'The program errors at compile-time.', 'The program errors at run-time.', 'None of the above.'], 1, { ...S('1b'), ...note('Instance methods can read static variables.') }),
    text('Aditya wants to add a new method public void answerQuery(String q, String student) to CS61Bot.'),
    mc(3, '(c) What happens if Aditya adds the method (keeping the existing answerQuery)?', ['The CS61Bot class will not compile because it defines two methods with the same name.', 'The CS61Bot class will not compile for some other reason.', 'The CS61Bot class will compile.'], 2, { ...S('1c'), ...note('Overloading with different parameters is allowed.') }),
    mc(4, '(d) What happens if Aditya replaces the existing answerQuery with it?', ['The CS61Bot class will not compile as it does not implement all methods of the ChatBot interface.', 'The CS61Bot class will compile, and calling answerQuery(q) will call answerQuery(q, null) instead.', 'The CS61Bot class will compile, but calling answerQuery(q) will cause a runtime error.', 'None of the above.'], 0, { ...S('1d'), ...note('An overload isn’t an override, so answerQuery(String) is no longer implemented.') }),
  ]),
  problem('2', '2048 Comparator (24.0 pts)', null, [
    text('A row’s rowwiseDropCount is the number of elements strictly less than the value immediately before them (left to right): [128, 64, 32, 16] has 3, [128, 4, 32, 0] has 2, [8, 0, 0, 2] has 1. columnwiseDropCount is the same down a column. totalDropCount sums both over all rows and columns. Boards are square.'),
    java(`
private static int totalDropCount(int[][] board) {
    int count = 0;
    for (int i = 0; ⟪a⟫; i += 1) {
        for (int j = ⟪b⟫; ⟪c⟫; j += 1) {
            if (⟪d⟫) {
                count += 1;
            }
            if (⟪e⟫) {
                count += 1;
            }
        }
    }
    return count;
}`, { a: 'i < board.length', b: '1', c: 'j < board.length', d: 'board[i][j-1] > board[i][j]', e: 'board[j-1][i] > board[j][i]' }),
    blank(5, '(a) The outer loop condition', ['i < board.length', 'i < board[0].length'], S('2a')),
    blank(6, '(a) The inner loop’s start', ['1', '0'], S('2a')),
    blank(7, '(a) The inner loop condition', ['j < board.length', 'j < board.length - 1', 'j < board[0].length', 'j < board[0].length - 1'], S('2a')),
    blank(8, '(a) The row check', ['board[i][j-1] > board[i][j]', 'board[i][j] > board[i][j+1]', 'board[i][j] < board[i][j-1]'], S('2a')),
    blank(9, '(a) The column check', ['board[j-1][i] > board[j][i]', 'board[j][i] > board[j+1][i]', 'board[j][i] < board[j-1][i]'], { ...S('2a'),
      ...note('Use j from 1 to the length with j − 1 and j, or from 0 to length − 1 with j and j + 1, consistently. i walks over rows for the row check and over columns for the column check.') }),
    text('(b) findMax finds the largest tile value on the board.'),
    java(`
private static int findMax(int[][] board) {
    int maxTile = 0;
    for (⟪f⟫ row : board) {
        for (⟪g⟫ tile : row) {
            if (⟪h⟫) {
                maxTile = tile;
            }
        }
    }
    return maxTile;
}`, { f: 'int[]', g: 'int', h: 'maxTile < tile' }),
    blank(10, '(b) for (____ row : board)', 'int[]', S('2b')),
    blank(11, '(b) for (____ tile : row)', ['int', 'Integer'], S('2b')),
    blank(12, '(b) if (____)', ['maxTile < tile', 'tile > maxTile'], S('2b')),
    text('(c) BoardComparator compares boards by their largest tile; ties are broken by totalDropCount.'),
    java(`
public static class BoardComparator implements ⟪i⟫ {
    ...
    @Override
    public int compare(int[][] boardA, int[][] boardB) {
        int tileA = ⟪j⟫;
        int tileB = ⟪k⟫;
        if (⟪l⟫) {
            int scoreA = ⟪m⟫;
            int scoreB = ⟪n⟫;
            return ⟪o⟫;
        }
        return ⟪p⟫;
    }
}`, { i: 'Comparator<int[][]>', j: 'findMax(boardA)', k: 'findMax(boardB)', l: 'tileA == tileB', m: 'totalDropCount(boardA)', n: 'totalDropCount(boardB)', o: 'scoreA - scoreB', p: 'tileA - tileB' }),
    blank(13, '(c) implements ____', 'Comparator<int[][]>', S('2c')),
    blank(14, '(c) tileA', 'findMax(boardA)', S('2c')),
    blank(15, '(c) tileB', 'findMax(boardB)', S('2c')),
    blank(16, '(c) if (____)', 'tileA == tileB', S('2c')),
    blank(17, '(c) scoreA', 'totalDropCount(boardA)', S('2c')),
    blank(18, '(c) scoreB', 'totalDropCount(boardB)', S('2c')),
    blank(19, '(c) return ____ (tie)', ['scoreA - scoreB', 'Integer.compare(scoreA, scoreB)'], S('2c')),
    blank(20, '(c) return ____', ['tileA - tileB', 'Integer.compare(tileA, tileB)'], S('2c')),
  ]),
  problem('3', 'Compressed Doubly-Linked List (29.0 pts)', null, [
    text('In a Compressed Doubly-Linked List (CDLL), each node has next, prev, value and freq, and stands for freq consecutive elements equal to value. For example, [5, -3, -3, 5, 5, 5] is sentinel ⇄ (5, freq 1) ⇄ (-3, freq 2) ⇄ (5, freq 3), circularly. No two consecutive non-sentinel nodes have the same value, and every freq is at least 1.'),
    java(`
public class CDLL implements Iterable<Integer> {
    private Node sentinel;
    private class Node {
        Node prev;
        Node next;
        int value;
        int freq;
        public Node(Node prev, Node next, int value, int freq) { ... }
    }
    public CDLL(List<Integer> original) {
        sentinel = new Node(null, null, -1, -1);
        Node curr = sentinel;
        for (int i : ⟪a⟫) {
            if (i == curr.value && ⟪b⟫) {
                ⟪c⟫;
            } else {
                ⟪d⟫;
                ⟪e⟫;
                ⟪f⟫;
            }
        }
        ⟪g⟫;
        ⟪h⟫;
    }
    ...
}`, { a: 'original', b: 'curr != sentinel', c: 'curr.freq += 1', d: 'Node n = new Node(curr, sentinel, i, 1)', e: 'curr.next = n', f: 'curr = curr.next', g: 'sentinel.prev = curr', h: 'curr.next = sentinel' }),
    blank(21, '(a) for (int i : ____)', 'original', S('3a')),
    blank(22, '(a) The second condition', ['curr != sentinel', 'sentinel != curr'], { ...S('3a'), ...note('Without it, a first item of −1 would match the sentinel’s value.') }),
    blank(23, '(a) Same value as the current node', ['curr.freq += 1', 'curr.freq++', 'curr.freq = curr.freq + 1'], S('3a')),
    blank(24, '(a) Otherwise, first line', ['Node n = new Node(curr, sentinel, i, 1)', 'Node n = new Node(curr, null, i, 1)'], S('3a')),
    blank(25, '(a) Second line', 'curr.next = n', S('3a')),
    blank(26, '(a) Third line', ['curr = curr.next', 'curr = n'], S('3a')),
    blank(27, '(a) After the loop, first line', ['sentinel.prev = curr', 'curr.next = sentinel'], S('3a')),
    blank(28, '(a) Second line', ['curr.next = sentinel', 'sentinel.prev = curr'], { ...S('3a'), ...note('Close the circle at the end; the two lines can go in either order.') }),
    text('(b) Complete CDLLIterator, which yields the CDLL’s values as they would appear in a regular List. It may not modify the CDLL.'),
    java(`
public class CDLLIterator implements Iterator<Integer> {
    Node curr = ⟪i⟫;
    int count = 0;

    @Override
    public boolean hasNext() {
        return ⟪j⟫;
    }

    @Override
    public Integer next() {
        ⟪k⟫;
        ⟪l⟫;
        if (⟪m⟫) {
            ⟪n⟫;
            ⟪o⟫;
        }
        return ⟪p⟫;
    }
}`, { i: 'sentinel.next', j: 'curr != sentinel', k: 'int i = curr.value', l: 'count += 1', m: 'count == curr.freq', n: 'curr = curr.next', o: 'count = 0', p: 'i' }),
    blank(29, '(b) curr starts at', 'sentinel.next', S('3b')),
    blank(30, '(b) hasNext returns', 'curr != sentinel', S('3b')),
    blank(31, '(b) First line of next', 'int i = curr.value', S('3b')),
    blank(32, '(b) Second line', ['count += 1', 'count++'], S('3b')),
    blank(33, '(b) if (____)', 'count == curr.freq', S('3b')),
    blank(34, '(b) Inside the if, first line', 'curr = curr.next', S('3b')),
    blank(35, '(b) Inside the if, second line', 'count = 0', S('3b')),
    blank(36, '(b) return ____', 'i', { ...S('3b'), ...note('Return the current node’s value freq times before moving on. (Starting curr at the sentinel and using curr.next throughout also works.)') }),
  ]),
  problem('4', 'LargeFriend (20.0 pts)', null, [
    text('LargeFriend wraps a Comparator<T> and is itself a Comparator; iterating over it yields every item it has ever judged “larger”, in order. For example, after compare("apple", "zebra"), compare("apple", "apple"), compare("apple", "banana") and compare("banana", "zebra"), it iterates zebra, banana, zebra. You may call wrappedComparator’s compare only once per call.'),
    java(`
public class LargeFriend<T> implements ⟪a⟫, ⟪b⟫ {
    private Comparator<T> wrappedComparator;
    private ⟪c⟫ largevals;

    public LargeFriend(Comparator<T> wrappedComparator) {
        ⟪d⟫;
        ⟪e⟫;
    }

    @Override
    public ⟪f⟫ iterator() {
        return ⟪g⟫;
    }

    @Override
    public int compare(T a, T b) {
        ⟪h⟫;
        if (result > 0) {
            ⟪i⟫;
        } else if (result < 0) {
            ⟪j⟫;
        }
        return result;
    }
}`, { a: 'Comparator<T>', b: 'Iterable<T>', c: 'List<T>', d: 'this.wrappedComparator = wrappedComparator', e: 'largevals = new ArrayList<T>()', f: 'Iterator<T>', g: 'largevals.iterator()', h: 'int result = wrappedComparator.compare(a, b)', i: 'largevals.add(a)', j: 'largevals.add(b)' }),
    blank(37, 'The first interface', ['Comparator<T>', 'Iterable<T>'], S('4')),
    blank(38, 'The second interface', ['Iterable<T>', 'Comparator<T>'], { ...S('4'), ...note('Either order; both must be parameterized by T.') }),
    blank(39, 'The type of largevals', ['List<T>', 'ArrayList<T>', 'LinkedList<T>', 'Deque<T>'], { ...S('4'), ...note('It must keep duplicates, so not a Set; and a Map isn’t Iterable.') }),
    blank(40, 'Constructor, first line', 'this.wrappedComparator = wrappedComparator', S('4')),
    blank(41, 'Constructor, second line', ['largevals = new ArrayList<T>()', 'largevals = new ArrayList<>()', 'largevals = new LinkedList<>()'], S('4')),
    blank(42, 'iterator’s return type', 'Iterator<T>', S('4')),
    blank(43, 'iterator returns', 'largevals.iterator()', S('4')),
    blank(44, 'First line of compare', 'int result = wrappedComparator.compare(a, b)', S('4')),
    blank(45, 'result > 0', 'largevals.add(a)', S('4')),
    blank(46, 'result < 0', 'largevals.add(b)', S('4')),
  ]),
  problem('5', 'Consume and Interleave (15.0 pts)', null, [
    text('ExamDeque (addFirst, addLast, toList, isEmpty, size, removeFirst, removeLast) has a default method consumeAndInterleave(ExamDeque<T> other), which interleaves other (same length, not ==) into this deque without creating a new ExamDeque, leaving other empty. For x = [2, 3, 4, 5, 6] and y = [20, 30, 40, 50, 60], x.consumeAndInterleave(y) makes x [2, 20, 3, 30, 4, 40, 5, 50, 6, 60]. ExamArrayDeque implements it, with a List constructor and an equals that compares items in order.',
      '(a) Write a unit test using Truth’s assertThat(…).containsExactly(…).inOrder() and isEqualTo.'),
    java(`
@Test
public boolean consumeAndInterleaveTest() {
    ExamDeque<Integer> x = new ExamArrayDeque<>(List.of(2, 3, 4));
    ⟪a⟫;
    ⟪b⟫;
    ⟪c⟫;
    ⟪d⟫;
}`, { a: 'ExamDeque<Integer> y = new ExamArrayDeque<>(List.of(10, 20, 30))', b: 'x.consumeAndInterleave(y)', c: 'assertThat(x.toList()).containsExactly(2, 10, 3, 20, 4, 30).inOrder()', d: 'assertThat(y.toList()).containsExactly()' }),
    blank(47, '(a) Make y', ['ExamDeque<Integer> y = new ExamArrayDeque<>(List.of(10, 20, 30))', 'ExamArrayDeque<Integer> y = new ExamArrayDeque<>(List.of(10, 20, 30))'], S('5a')),
    blank(48, '(a) Call the method', 'x.consumeAndInterleave(y)', S('5a')),
    blank(49, '(a) Check x', ['assertThat(x.toList()).containsExactly(2, 10, 3, 20, 4, 30).inOrder()', 'assertThat(x).isEqualTo(new ExamArrayDeque<>(List.of(2, 10, 3, 20, 4, 30)))'], S('5a')),
    blank(50, '(a) Check y', ['assertThat(y.toList()).containsExactly()', 'assertThat(y.isEmpty()).isTrue()', 'assertThat(y.size()).isEqualTo(0)'], { ...S('5a'), ...note('Full credit needed both x and y checked. (The numbers in y are up to you; these match the staff test.)') }),
    text('(b) Fill in consumeAndInterleave.'),
    java(`
default void consumeAndInterleave(ExamDeque<T> other) {
    if (other.size() != this.size() || this == other) {
        throw new IllegalArgumentException();
    }
    while (⟪e⟫) {
        ⟪f⟫;
        ⟪g⟫;
    }
}`, { e: '!other.isEmpty()', f: 'this.addLast(this.removeFirst())', g: 'this.addLast(other.removeFirst())' }),
    blank(51, '(b) while (____)', ['!other.isEmpty()', 'other.size() > 0'], S('5b')),
    blank(52, '(b) First line', ['this.addLast(this.removeFirst())', 'addLast(removeFirst())'], S('5b')),
    blank(53, '(b) Second line', ['this.addLast(other.removeFirst())', 'addLast(other.removeFirst())'], { ...S('5b'),
      ...note('Cycle this deque’s own items to the back one at a time, each followed by the next item from other.') }),
  ]),
]);
