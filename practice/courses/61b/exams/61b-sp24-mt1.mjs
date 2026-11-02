// Spring 2024 Midterm 1 (Thu 2/15/2024), transcribed from the official solutions.
// Code questions are one blank per line of the staff solution; 1(b) asked for a short explanation and is multiple
// choice here. Left out: the last page (0 points).
import { exam, problem, text, java, txt, blank, mc } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-sp24-mt1', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });
const CI = ['class', 'interface'], EI = ['extends', 'implements'], AE = ['A', 'B', 'C', 'D', 'E'];

export default exam(E, 'Spring 2024 Midterm 1', {
  exam: 'https://drive.google.com/file/d/1K8oZCuc37EqWlVmrBsES52Vkh-eWmYU-/view',
  sol: 'https://drive.google.com/file/d/1v7odiqpkBhEIVFoHnpfO5uzTKDROO6IP/view',
}, 'sp24-mt1', [
  problem('1', 'WWJD (15.0 pts)', null, [
    java(`
public interface Sphere {
    default void getRadius() { System.out.println(0); }
}

class Planet implements Sphere {
    private int radius = 5;

    @Override
    public void getRadius() { System.out.println(this.radius); }

    public void orbit(Planet p) { System.out.println("orbit planet"); }
}

class Exoplanet extends Planet {
    static int distance = 10;

    public void getDistance() { System.out.println(distance); }

    @Override
    public void orbit(Planet p) { System.out.println("orbit exoplanet"); }
}`),
    text('(a) For each line of main, write CE for a compile error, RE for a runtime error, OK if it runs but prints nothing, or what it prints. If a line errors, assume the program continues as if it weren’t there.'),
    java(`
Planet kepler = new Exoplanet();               // 1
Sphere jupiter = new Sphere();                 // 2
Sphere arion = new Exoplanet();                // 3
Planet earth = new Planet();                   // 4

kepler.orbit((Exoplanet) arion);               // 5
((Exoplanet) earth).orbit(kepler);             // 6
((Exoplanet) kepler).getDistance();            // 7
earth.getRadius();                             // 8
arion.getDistance();                           // 9
earth.radius;                                  // 10
Exoplanet.getDistance();                       // 11`),
    ...[['OK'], ['CE', 'An interface has no constructor.'], ['OK'], ['OK'], [['orbit exoplanet', 'Orbit Exoplanet'], 'The signature orbit(Planet) is chosen at compile time; at runtime kepler is an Exoplanet, so its override runs.'], ['RE', 'The cast compiles (Planet and Exoplanet are related), but earth is only a Planet: ClassCastException.'], ['10'], ['5'], ['CE', 'Sphere has no getDistance.'], ['CE', 'radius is private.'], ['CE', 'getDistance isn’t static.']]
      .map(([a, x], k) => blank(k + 1, `(a) Line ${k + 1}`, a, { ...S('1a'), ...(x ? note(x) : {}) })),
    mc(12, '(b) Why would changing line 2 to private default void getRadius() be a compile error?', ['Methods in an interface must be public.', 'Default methods cannot print.', 'Planet already overrides getRadius.', 'Interfaces cannot have default methods.'], 0, S('1b')),
    text('(c) Within Exoplanet, we define public void fixRadius() { super.radius = 6; }.'),
    mc(13, '(c) Which change makes Exoplanet compile?', ['Change the private keyword to public on Planet’s radius.', 'Modify fixRadius() to be private.', 'Modify fixRadius() to be static.'], 0, { ...S('1c'), ...note('Subclasses can’t see private fields.') }),
    mc(14, '(d) True or false: we can create another interface that extends Sphere.', ['True', 'False'], 0, S('1d')),
    mc(15, '(e) It is ____ possible to implement two interfaces in the same class.', ['Always', 'Sometimes', 'Never'], 1, { ...S('1e'), ...note('Not if they declare the same method signature with different return types.') }),
  ]),
  problem('2', 'Comparable Computers (20.0 pts)', null, [
    text('Computer versions are strings of non-negative integers separated by periods, like "123.4.5". Implement compareTo: the version with the larger most significant term is greater, and missing terms count as 0, so "1.2.3" < "1.2.4", "1.0.0" equals "1", and "2.0" > "1.999". Hint: Character.getNumericValue(char c) returns the char’s integer value.'),
    java(`
public class Computer implements Comparable<Computer> {
    String version;
    ...
    @Override
    public int compareTo(Computer other) {
        int i = 0, j = 0;
        while (⟪a⟫ || ⟪b⟫) {
            int num1 = 0, num2 = 0;
            while (i < this.version.length() && ⟪c⟫) {
                char c = this.version.charAt(i);
                num1 = num1 * 10 + ⟪d⟫;
                i += 1;
            }
            while (j < other.version.length() && ⟪e⟫) {
                char c = other.version.charAt(j);
                num2 = num2 * 10 + ⟪f⟫;
                j += 1;
            }
            if (⟪g⟫) {
                return ⟪h⟫;
            }
            i += 1;
            j += 1;
        }
        return ⟪i⟫;
    }
}`, { a: 'i < this.version.length()', b: 'j < other.version.length()', c: "this.version.charAt(i) != '.'", d: 'Character.getNumericValue(c)', e: "other.version.charAt(j) != '.'", f: 'Character.getNumericValue(c)', g: 'num1 != num2', h: 'num1 - num2', i: '0' }),
    blank(16, '(a) The first condition', ['i < this.version.length()', 'i < version.length()'], S('2')),
    blank(17, '(b) The second condition', 'j < other.version.length()', S('2')),
    blank(18, '(c) Stop the first inner loop at a period', ["this.version.charAt(i) != '.'", "version.charAt(i) != '.'"], S('2')),
    blank(19, '(d) num1 = num1 * 10 + ____', 'Character.getNumericValue(c)', S('2')),
    blank(20, '(e) Stop the second inner loop at a period', ["other.version.charAt(j) != '.'"], S('2')),
    blank(21, '(f) num2 = num2 * 10 + ____', 'Character.getNumericValue(c)', S('2')),
    blank(22, '(g) if (____)', 'num1 != num2', S('2')),
    blank(23, '(h) return ____', ['num1 - num2', 'Integer.compare(num1, num2)'], S('2')),
    blank(24, '(i) return ____ at the end', '0', { ...S('2'), ...note('Read one term from each version at a time (0 once a version runs out) and compare; the i += 1 and j += 1 skip the period.') }),
  ]),
  problem('3', 'Connect The Dots (20.0 pts)', null, [
    text('paper is a rectangular 2-D array containing exactly one copy of each of 1, 2, …, n and 0s elsewhere. Lines are drawn from cell 1 to cell 2, 2 to 3, … up to n. lineLength returns the total length (adjacent cells are distance 1 apart). For example, for this paper with n = 6 the lines measure √5, √13, √2, 3 and 2, about 12.256.'),
    txt(`
0 0 0 2
0 1 0 0
0 0 0 0
0 3 0 0
4 6 0 5`),
    java(`
public class Point {
    public int x;
    public int y;
    public Point(int x, int y) { this.x = x; this.y = y; }
}

public static double distance(Point a, Point b) {
    ⟪a⟫;
}`, { a: 'return Math.sqrt(Math.pow((b.x - a.x), 2) + Math.pow((b.y - a.y), 2))' }),
    blank(25, '(a) distance (one line)', ['return Math.sqrt(Math.pow((b.x - a.x), 2) + Math.pow((b.y - a.y), 2))', 'return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))', 'return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y))', 'return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y))'], S('3a')),
    java(`
public static double lineLength(int[][] paper, int n) {
    Point[] points = ⟪b⟫;
    for (int i = 0; ⟪c⟫; i += 1) {
        for (int j = 0; ⟪d⟫; j += 1) {
            int z = paper[i][j];
            ⟪e⟫;
        }
    }
    double total = 0.0;
    for (int k = ⟪f⟫; ⟪g⟫; k += 1) {
        ⟪h⟫;
    }
    return total;
}`, { b: 'new Point[n + 1]', c: 'i < paper.length', d: 'j < paper[0].length', e: 'points[z] = new Point(i, j)', f: '2', g: 'k < points.length', h: 'total += distance(points[k - 1], points[k])' }),
    blank(26, '(b) Point[] points = ____', 'new Point[n + 1]', S('3b')),
    blank(27, '(b) Outer loop condition', 'i < paper.length', S('3b')),
    blank(28, '(b) Inner loop condition', ['j < paper[0].length', 'j < paper[i].length'], S('3b')),
    blank(29, '(b) Inner loop body (after int z = paper[i][j])', 'points[z] = new Point(i, j)', { ...S('3b'), ...note('Every 0 overwrites points[0], which is never used.') }),
    blank(30, '(b) k starts at', '2', S('3b')),
    blank(31, '(b) k’s loop condition', ['k < points.length', 'k <= n'], S('3b')),
    blank(32, '(b) The loop body', ['total += distance(points[k - 1], points[k])', 'total += distance(points[k], points[k - 1])'], S('3b')),
  ]),
  problem('4', 'Class Signatures (13.0 pts)', null, [
    text('Fill in the class signatures so that this code compiles and runs without errors.'),
    java(`
B bb = new B();
A aa = new A();
A ab = new B();
D db = new B();
A ac = new C();
B bc = new C();
A ad = new D();
E ed = new D();

public __(a)__ A { ... }
public __(b)__ B __(f)__ __(g)__ { ... }
public __(c)__ C __(h)__ __(i)__ { ... }
public __(d)__ D extends __(j)__ implements __(k)__ { ... }
public __(e)__ E {
    public default void e() {
        System.out.println("E!");
    }
}`),
    mc(33, '(a)', CI, 0, S('4')), mc(34, '(b)', CI, 0, S('4')), mc(35, '(c)', CI, 0, S('4')), mc(36, '(d)', CI, 0, S('4')),
    mc(37, '(e)', CI, 1, { ...S('4'), ...note('Only an interface has default methods; A–D are instantiated, so they’re classes.') }),
    mc(38, '(f)', EI, 0, S('4')), mc(39, '(g)', AE, 3, S('4')), mc(40, '(h)', EI, 0, S('4')), mc(41, '(i)', AE, 1, S('4')), mc(42, '(j)', AE, 0, S('4')),
    mc(43, '(k)', AE, 4, { ...S('4'), ...note('From the assignments: B is a D and an A, C is a B, D is an A and an E. So A ← D ← B ← C, and D implements E.') }),
  ]),
  problem('5', 'HOF (16.0 pts)', null, [
    text('Func<A, B> represents a function: B apply(A x). Complete compose, which takes f and g and returns a function that computes g(f(x)), along with the Helper class.'),
    java(`
interface Func<A, B> {
    B apply(A x);
}

class Composer<X, Y, Z> {
    Func<X, ⟪a⟫> compose(Func<X, Y> f, Func<Y, Z> g) {
        return ⟪b⟫;
    }

    private class Helper implements Func<⟪c⟫, ⟪d⟫> {
        Func<X, Y> f;
        Func<Y, Z> g;

        Helper(Func<X, Y> f, Func<Y, Z> g) {
            ⟪e⟫;
            ⟪f⟫;
        }

        @Override
        public ⟪g⟫ apply(⟪h⟫ x) {
            return ⟪i⟫;
        }
    }
}`, { a: 'Z', b: 'new Helper(f, g)', c: 'X', d: 'Z', e: 'this.f = f', f: 'this.g = g', g: 'Z', h: 'X', i: 'g.apply(f.apply(x))' }),
    blank(44, '(a) compose returns Func<X, ____>', 'Z', S('5')),
    blank(45, '(b) compose returns', 'new Helper(f, g)', S('5')),
    blank(46, '(c) Helper implements Func<____, …>', 'X', S('5')),
    blank(47, '(d) …and the second type', 'Z', S('5')),
    blank(48, '(e) Constructor, first line', 'this.f = f', S('5')),
    blank(49, '(f) Constructor, second line', 'this.g = g', S('5')),
    blank(50, '(g) apply’s return type', 'Z', S('5')),
    blank(51, '(h) apply’s parameter type', 'X', S('5')),
    blank(52, '(i) apply returns', 'g.apply(f.apply(x))', { ...S('5'), ...note('Apply f first, then g. f.apply(g.apply(x)) computes f(g(x)) and wouldn’t compile when X, Y and Z differ.') }),
  ]),
  problem('6', 'Lost in Pointers (16.0 pts)', null, [
    text('A circular DLList with a sentinel had exactly one next or prev pointer changed to point to another node (or the sentinel). Write fixDLList, defined inside DLList, to restore it.'),
    java(`
public void fixDLList() {
    int count = 0;
    for (Node n = ⟪a⟫; count <= size && n != sentinel; ⟪b⟫) {
        ⟪c⟫;
    }
    if (count == size) { // The wrong pointer is a .prev pointer
        sentinel.next.prev = ⟪d⟫;
        for (⟪e⟫; n != sentinel; n = n.next) {
            ⟪f⟫;
        }
    } else { // The wrong pointer is a .next pointer
        sentinel.prev.next = ⟪g⟫;
        for (⟪h⟫; n != sentinel; n = n.prev) {
            ⟪i⟫;
        }
    }
}`, { a: 'sentinel.next', b: 'n = n.next', c: 'count += 1', d: 'sentinel', e: 'Node n = sentinel.next', f: 'n.next.prev = n', g: 'sentinel', h: 'Node n = sentinel.prev', i: 'n.prev.next = n' }),
    blank(53, '(a) n starts at', 'sentinel.next', S('6')),
    blank(54, '(b) The update', 'n = n.next', S('6')),
    blank(55, '(c) The loop body', ['count += 1', 'count++'], S('6')),
    blank(56, '(d) sentinel.next.prev = ____', 'sentinel', S('6')),
    blank(57, '(e) Start of the loop', 'Node n = sentinel.next', S('6')),
    blank(58, '(f) Its body', 'n.next.prev = n', S('6')),
    blank(59, '(g) sentinel.prev.next = ____', 'sentinel', S('6')),
    blank(60, '(h) Start of the loop', 'Node n = sentinel.prev', S('6')),
    blank(61, '(i) Its body', 'n.prev.next = n', { ...S('6'),
      ...note('Walking the next pointers reaches the sentinel after exactly size steps only if every next pointer is right (a bad one skips ahead or loops back, hence count <= size). Then rebuild the other direction from the correct one.') }),
  ]),
]);
