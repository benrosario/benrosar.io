// Fall 2024 Midterm 1 (Fri 9/27/2024), transcribed from the official solutions (updated 9/30).
// Code questions are one blank per line of the staff solution. In 1(a) the staff key reads "spawn FootballPlayer",
// but the code prints "spawn Footballer"; this site accepts both. Left out: the last page (0 points).
import { exam, problem, text, java, txt, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-fa24-mt1', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });
const TF = ['True', 'False'];

export default exam(E, 'Fall 2024 Midterm 1', {
  exam: 'https://drive.google.com/file/d/10NunD17-SlYqwasw0WTaeGo2NkFr8EJO/view',
  sol: 'https://drive.google.com/file/d/1aPFbJ_6iF_DIxW3gjJHPBAUUh-u2QG1i/view',
}, 'fa24-mt1', [
  problem('1', 'Football? (8.0 pts)', null, [
    java(`
public class Athlete {
    public void g() {
        Athlete curr = (FootballPlayer) this;
        p(curr);
    }
    public void p(Athlete curr) {
        curr.celebration();
    }
    public void celebration() {
        System.out.println("Let's go");
    }
    public Athlete spawn() {
        System.out.println("spawn Athlete");
        return new Athlete();
    }
}

public class FootballPlayer extends Athlete {
    @Override
    public void celebration() {
        System.out.println("Let's goooal");
    }
    @Override
    public Athlete spawn() {
        System.out.println("spawn Footballer");
        return new FootballPlayer();
    }
}`),
    text('(a) For each line of main, write CE for a compile error, RE for a runtime error, OK if it runs but prints nothing, or what it prints. If a line errors, assume the program continues as if it weren’t there.'),
    java(`
Athlete messi = new FootballPlayer();               // (1)
FootballPlayer brady = new Athlete();               // (2)
Athlete thiago = messi.spawn();                     // (3)
FootballPlayer lionel = (FootballPlayer) messi;     // (4)
messi.g();                                          // (5)
thiago.g();                                         // (6)`),
    blank(1, '(a) Line 1', 'OK', S('1a')),
    blank(2, '(a) Line 2', 'CE', { ...S('1a'), ...note('An Athlete isn’t necessarily a FootballPlayer.') }),
    blank(3, '(a) Line 3', ['spawn Footballer', 'spawn FootballPlayer'], { ...S('1a'), ...note('Dynamic method selection: messi is a FootballPlayer.') }),
    blank(4, '(a) Line 4', 'OK', S('1a')),
    blank(5, '(a) Line 5', "Let's goooal", S('1a')),
    blank(6, '(a) Line 6', "Let's goooal", { ...S('1a'), ...note('thiago is a FootballPlayer at runtime, so the cast in g succeeds.') }),
    sata(7, '(b) Which method signatures would, added by itself, allow messi.f(messi) to compile?', ['public void f(FootballPlayer x), added to class Athlete.', 'public void f(FootballPlayer x), added to class FootballPlayer.', 'public void f(Athlete x), added to class Athlete.', 'public void f(Athlete x), added to class FootballPlayer.'], [2], { ...S('1b'),
      ...note('The compiler only knows messi is an Athlete, so f must be in Athlete and accept an Athlete.') }),
  ]),
  problem('2', 'Potpourri (9.0 pts)', null, [
    sata(8, '(a) Which are valid features of a Java interface?', ['Private methods', 'Public methods', 'Constructors'], [1], S('2a')),
    mc(9, '(b) A class can implement multiple interfaces.', TF, 0, S('2b')),
    mc(10, '(c) Which statement best describes the test-driven development cycle?', ['Write tests → Refactor code → Write code', 'Write tests → Write code → Refactor code', 'Write code → Refactor code → Write tests'], 1, S('2c')),
    mc(11, '(d) What is the primary purpose of the “Refactor” phase in test-driven development?', ['To reduce code complexity and improve design while keeping the tests passing.', 'To rewrite test cases that are failing.', 'To add additional features to the code.'], 0, S('2d')),
    sata(12, '(e) Which statements about access modifiers are true?', ['If a public method relies on a helper function to work, the helper function must be public.', 'If a private method relies on a helper function to work, the helper function must be private.', 'Private methods and variables can be accessed by subclasses.', 'Protected methods and variables can be accessed by subclasses.', 'The value of a private variable can be accessed via a public method.'], [3, 4], S('2e')),
    java(`
// (f)
public static <T> void swap(T[] array) {
    T temp = array[0];
    array[0] = array[1];
    array[1] = temp;
}
public static void main(String[] args) {
    Integer[] values = new Integer[]{10, 20};
    swap(values);
    System.out.println(values[0]);
}`),
    mc(13, '(f) What does main print?', ['10', '20'], 1, { ...S('2f'), ...note('The method changes the array’s contents, which the caller shares.') }),
    java(`
// (g)
public static <T> void swap(T x, T y) {
    T temp = y;
    y = x;
    x = temp;
}
public static void main(String[] args) {
    Integer x = 10;
    Integer y = 20;
    swap(x, y);
    System.out.println(x);
}`),
    mc(14, '(g) What does main print?', ['10', '20'], 0, { ...S('2g'), ...note('Java passes copies of references; reassigning the parameters doesn’t affect the caller’s variables.') }),
  ]),
  problem('3', 'What Even Is Static? (6.0 pts)', null, [
    java(`
public class Q3 {
    private int instanceVar = 0;
    private static int staticVar = 1;

    public void instanceMethod() {
        // Code here for part a
    }
    public static void staticMethod() {
        // Code here for part b
    }
    public static void main(String[] args) {
        Q3 obj = new Q3();
        // Code here for part c
    }
}`),
    sata(15, '(a) Which lines, added to instanceMethod by themselves, compile?', ['System.out.println(instanceVar);', 'System.out.println(staticVar);', 'staticMethod();'], [0, 1, 2], S('3a')),
    sata(16, '(b) Which lines, added to staticMethod by themselves, compile?', ['System.out.println(instanceVar);', 'System.out.println(staticVar);', 'instanceMethod();'], [1], { ...S('3b'), ...note('A static method has no this, so it can’t use instance members.') }),
    sata(17, '(c) Which lines, added to the end of main by themselves, compile?', ['Q3.instanceMethod();', 'Q3.staticMethod();', 'obj.instanceMethod();'], [1, 2], S('3c')),
  ]),
  problem('4', 'Crossword (18.0 pts)', null, [
    text('A crossword is an N by N char array with black squares as #. For example, the first row of an 11-by-11 puzzle might read # M A D A M # P E A #, containing the horizontal words MADAM and PEA.',
      '(a) transpose returns a new matrix that flips the input over its diagonal, so the element at (i, j) moves to (j, i).'),
    java(`
private static char[][] transpose(char[][] matrix) {
    int n = matrix.length;
    char[][] result = ⟪a⟫;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            ⟪b⟫;
        }
    }
    return result;
}`, { a: 'new char[n][n]', b: 'result[i][j] = matrix[j][i]' }),
    blank(18, '(a) result = ____', 'new char[n][n]', S('4a')),
    blank(19, '(a) The loop body', ['result[i][j] = matrix[j][i]', 'result[j][i] = matrix[i][j]'], S('4a')),
    text('(b) validCrossword checks that all horizontal and vertical words are valid according to validWord(String), which returns false on an empty string. The border is all #. You may use transpose and a StringBuilder (append(char), toString()).'),
    java(`
public static boolean validCrossword(char[][] crossword) {
    return ⟪c⟫;
}

private static boolean verifyRows(char[][] crossword) {
    int n = crossword.length;
    for (int i = 0; i < n; i++) {
        StringBuilder word = new StringBuilder(); // Resets word to empty string
        for (⟪d⟫) {
            if (⟪e⟫) {
                ⟪f⟫;
            } else {
                String s = ⟪g⟫;
                if (⟪h⟫) {
                    return false;
                }
                ⟪i⟫;
            }
        }
    }
    return ⟪j⟫;
}`, { c: 'verifyRows(crossword) && verifyRows(transpose(crossword))', d: 'char c : crossword[i]', e: "c != '#'", f: 'word.append(c)', g: 'word.toString()', h: 's.length() > 0 && !validWord(s)', i: 'word = new StringBuilder()', j: 'true' }),
    blank(20, '(b) validCrossword returns', ['verifyRows(crossword) && verifyRows(transpose(crossword))', 'verifyRows(transpose(crossword)) && verifyRows(crossword)'], S('4b')),
    blank(21, '(b) The inner loop header', 'char c : crossword[i]', S('4b')),
    blank(22, '(b) if (____)', ["c != '#'"], S('4b')),
    blank(23, '(b) Inside the if', 'word.append(c)', S('4b')),
    blank(24, '(b) String s = ____', 'word.toString()', S('4b')),
    blank(25, '(b) if (____) return false', ['s.length() > 0 && !validWord(s)', '!s.isEmpty() && !validWord(s)', '!s.equals("") && !validWord(s)'], { ...S('4b'), ...note('Two #s in a row give an empty word, which isn’t a word at all, so skip it.') }),
    blank(26, '(b) Then reset the word', 'word = new StringBuilder()', S('4b')),
    blank(27, '(b) verifyRows returns ____ at the end', 'true', { ...S('4b'), ...note('Each word ends at a #, and the border guarantees every row ends with one.') }),
  ]),
  problem('5', 'Tiebreakers (15.0 pts)', null, [
    text('TiebreakingComparator<T> takes a List of Comparators: it compares with the first; if that says equal, with the second; and so on, returning the first non-equal result, or equality if all are used. Don’t call any Comparator more times than necessary.'),
    java(`
public class TiebreakingComparator<T> implements Comparator<T> {
    ⟪a⟫;

    public TiebreakingComparator(⟪b⟫ lst) {
        ⟪c⟫;
    }

    @Override
    public int compare(T a, T b) {
        for (⟪d⟫) {
            ⟪e⟫;
            if (⟪f⟫) {
                ⟪g⟫;
            }
        }
        ⟪h⟫;
    }
}`, { a: 'List<Comparator<T>> lst', b: 'List<Comparator<T>>', c: 'this.lst = lst', d: 'Comparator<T> c : lst', e: 'int result = c.compare(a, b)', f: 'result != 0', g: 'return result', h: 'return 0' }),
    blank(28, 'The instance variable', ['List<Comparator<T>> lst', 'private List<Comparator<T>> lst'], S('5')),
    blank(29, 'The constructor’s parameter type', 'List<Comparator<T>>', S('5')),
    blank(30, 'The constructor body', 'this.lst = lst', S('5')),
    blank(31, 'The loop header', 'Comparator<T> c : lst', S('5')),
    blank(32, 'First line of the loop', 'int result = c.compare(a, b)', S('5')),
    blank(33, 'if (____)', 'result != 0', S('5')),
    blank(34, 'Inside the if', 'return result', S('5')),
    blank(35, 'After the loop', 'return 0', S('5')),
  ]),
  problem('6', 'Linked Links (34.0 pts)', null, [
    text('Each node of an Ordinal contains only a pointer to another Ordinal. 0 is null, 1 is Ordinal(null), 2 is Ordinal(Ordinal(null)), and in general n is Ordinal(n − 1). All inputs represent nonnegative integers.'),
    java(`
public class Ordinal {
    public Ordinal rest;

    public Ordinal(Ordinal rest) {
        this.rest = rest;
    }
}

Ordinal succ(Ordinal curr) {      // (a) returns n + 1
    return ⟪a⟫;
}

Ordinal pred(Ordinal curr) {      // (b) returns n - 1
    if (curr == null) {
        throw new java.lang.IllegalArgumentException();
    }
    return ⟪b⟫;
}`, { a: 'new Ordinal(curr)', b: 'curr.rest' }),
    blank(36, '(a) succ returns', 'new Ordinal(curr)', S('6a')),
    blank(37, '(b) pred returns', 'curr.rest', S('6b')),
    text('From here on you may use pred and succ.'),
    java(`
Ordinal add(Ordinal a, Ordinal b) {       // (c) returns a + b
    while (⟪c⟫) {
        ⟪d⟫;
        ⟪e⟫;
    }
    return ⟪f⟫;
}

Ordinal floordiv(Ordinal a, Ordinal b) {  // (d) returns a / b, rounded down
    Ordinal result = ⟪g⟫;
    final Ordinal bcopy = b;
    while (⟪h⟫) {
        ⟪i⟫;
        ⟪j⟫;
        if (⟪k⟫) {
            ⟪l⟫;
            ⟪m⟫;
        }
    }
    return ⟪n⟫;
}`, { c: 'a != null', d: 'a = pred(a)', e: 'b = succ(b)', f: 'b', g: 'null', h: 'a != null', i: 'a = pred(a)', j: 'b = pred(b)', k: 'b == null', l: 'result = succ(result)', m: 'b = bcopy', n: 'result' }),
    blank(38, '(c) while (____)', 'a != null', S('6c')),
    blank(39, '(c) First line', 'a = pred(a)', S('6c')),
    blank(40, '(c) Second line', 'b = succ(b)', S('6c')),
    blank(41, '(c) return ____', 'b', { ...S('6c'), ...note('Move one unit from a to b at a time.') }),
    blank(42, '(d) result starts as', 'null', S('6d')),
    blank(43, '(d) while (____)', 'a != null', S('6d')),
    blank(44, '(d) First line of the loop', 'a = pred(a)', S('6d')),
    blank(45, '(d) Second line', 'b = pred(b)', S('6d')),
    blank(46, '(d) if (____)', 'b == null', S('6d')),
    blank(47, '(d) Inside the if, first line', 'result = succ(result)', S('6d')),
    blank(48, '(d) Inside the if, second line', 'b = bcopy', S('6d')),
    blank(49, '(d) return ____', 'result', { ...S('6d'), ...note('Count down a and b together; every time b reaches 0, one whole b fit, so add 1 and start b over.') }),
    text('(e) Make Ordinal Iterable: the iterator over n returns n − 1, n − 2, …, 1, 0 (not n itself). Assume n > 0.'),
    java(`
public class Ordinal implements Iterable<Ordinal> {
    Ordinal rest;
    public Ordinal(Ordinal rest) {
        this.rest = rest;
    }

    public Iterator<Ordinal> iterator() {
        return ⟪o⟫;
    }

    private class OrdinalIterator ⟪p⟫ {
        Ordinal curr;
        public OrdinalIterator(Ordinal curr) {
            ⟪q⟫;
        }

        @Override
        public boolean hasNext() {
            return ⟪r⟫;
        }

        @Override
        public Ordinal next() {
            if (curr == null) {
                throw new java.util.NoSuchElementException();
            }
            ⟪s⟫;
            return ⟪t⟫;
        }
    }
}`, { o: 'new OrdinalIterator(this)', p: 'implements Iterator<Ordinal>', q: 'this.curr = curr', r: 'curr != null', s: 'curr = curr.rest', t: 'curr' }),
    blank(50, '(e) iterator() returns', 'new OrdinalIterator(this)', S('6e')),
    blank(51, '(e) OrdinalIterator ____', 'implements Iterator<Ordinal>', S('6e')),
    blank(52, '(e) The constructor body', 'this.curr = curr', S('6e')),
    blank(53, '(e) hasNext returns', 'curr != null', S('6e')),
    blank(54, '(e) First line of next', 'curr = curr.rest', S('6e')),
    blank(55, '(e) next returns', 'curr', { ...S('6e'), ...note('Step first, then return, so n itself is never returned and the last value returned is 0 (null).') }),
  ]),
  problem('7', 'Infinite Linked Links (10.0 pts)', null, [
    text('Continuing Linked Links (all parts correctly implemented): ω, the smallest infinite ordinal, is built like this. Beyond it, 1 + ω is Ordinal(ω), 2 + ω is Ordinal(1 + ω), and so on. These are infinite ordinals; those for nonnegative integers are finite ordinals.'),
    java(`
public static Ordinal inf() {
    Ordinal omega = new Ordinal(null);
    omega.rest = omega;
    return omega;
}`),
    mc(56, '(a) It is still possible to construct ω (possibly by changing inf) if rest is final, with no other changes to Ordinal.', TF, 1, { ...S('7a'), ...note('A final rest is set once, in the constructor, and the object can’t point to itself before it exists.') }),
    mc(57, '(b) succ(ω) == ω', TF, 1, { ...S('7b'), ...note('succ makes a new object.') }),
    mc(58, '(c) pred(ω) == ω', TF, 0, { ...S('7c'), ...note('ω points to itself.') }),
    sata(59, '(d) Which can occur if add is called with at least one infinite ordinal?', ['add returns an infinite ordinal.', 'add returns a finite ordinal.', 'add infinite-loops or crashes.'], [0, 2], { ...S('7d'), ...note('Depending on which argument the loop walks down, it either returns an infinite ordinal or never ends.') }),
    mc(60, '(e) add(a, b) always behaves the same as add(b, a) (both loop or crash, or both return the same value).', TF, 1, { ...S('7e'), ...note('Walking down a finite input ends; walking down ω never does.') }),
    mc(61, '(f) floordiv(ω, b) returns ω if b is a finite ordinal.', TF, 1, { ...S('7f'), ...note('It loops forever.') }),
    mc(62, '(g) floordiv(a, ω) returns 0 if a is a finite ordinal.', TF, 0, { ...S('7g'), ...note('a reaches null long before b would, so result stays 0.') }),
    mc(63, '(h) What is the result of inf() == inf()?', ['true', 'false'], 1, { ...S('7h'), ...note('Each call builds a separate object.') }),
  ]),
]);
