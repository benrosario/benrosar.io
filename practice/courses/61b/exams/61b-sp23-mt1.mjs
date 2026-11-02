// Spring 2023 Midterm 1 (Thu 2/9/2023), transcribed from the official solutions. (This exam’s points total 4800.)
// Code questions are one blank per line of the staff solution; 5(c) asked for a sentence and is multiple choice here.
// Left out: the last page (0 points).
import { exam, problem, text, java, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-sp23-mt1', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });
const YN = ['Yes', 'No'];

export default exam(E, 'Spring 2023 Midterm 1', {
  exam: 'https://drive.google.com/file/d/14-IEeTJsYHvK6Ogyro4xcDT8KH_KbB9A/view',
  sol: 'https://drive.google.com/file/d/1IB3II-zbgUAlYMikmeSg0c-0uNi7rSnQ/view',
}, 'sp23-mt1', [
  problem('1', 'F1Car (300 pts)', null, [
    java(`
public class F1Car {
    private String driver;
    private static String[] tracks;
    private static int trackIndex;

    public F1Car(String driver, String[] tracks, int trackIndex) {
        this.driver = driver;
        F1Car.tracks = tracks;
        this.trackIndex = trackIndex;
    }

    public static String nextTrack() {
        return tracks[trackIndex];
    }

    public String getDriver() {
        return driver;
    }

    public static void main(String args[]) {
        F1Car ferrari = new F1Car("Dylan", new String[]{"Silverstone", "Spa"}, 0);
    }
}`),
    mc(1, '(a) Will calling F1Car.getDriver() error?', YN, 0, { ...S('1'), ...note('A non-static method can’t be called on the class.') }),
    mc(2, '(b) Will calling F1Car.nextTrack() error?', YN, 1, S('1')),
    mc(3, '(c) Will calling ferrari.nextTrack() error?', YN, 1, { ...S('1'), ...note('Static methods can be called on an instance.') }),
    mc(4, '(d) If getDriver becomes public static String getDriver(), will calling ferrari.getDriver() error?', YN, 0, { ...S('1'), ...note('The static method would read the instance variable driver: a compile error.') }),
  ]),
  problem('2', 'StudentID (500 pts)', null, [
    text('A StudentID has a name, an idNumber, buildingAccess (the unique buildings this student can access, initially empty) and studentDir (a directory from idNumber to name shared by all students and updated whenever a student is created). getStudentName returns the name for an idNumber, or "" if there is none. For example, after new StudentID("Eric", 1) and new StudentID("Eddie", 2), StudentID.getStudentName(1) is "Eric"; adding "Soda Hall" to s1.buildingAccess twice leaves one copy.'),
    java(`
public class StudentID {
    public String name;
    public int idNumber;

    public ⟪a⟫ buildingAccess;
    public ⟪b⟫ studentDir = ⟪c⟫;

    public StudentID(String name, int idNumber) {
        ⟪d⟫;
        ⟪e⟫;
        ⟪f⟫;
        ⟪g⟫;
    }

    public ⟪h⟫ getStudentName(int idNumber) {
        if (⟪i⟫) {
            ⟪j⟫;
        }
        return "";
    }
}`, { a: 'Set<String>', b: 'static Map<Integer, String>', c: 'new HashMap<>()', d: 'this.name = name', e: 'this.idNumber = idNumber', f: 'studentDir.put(idNumber, name)', g: 'buildingAccess = new HashSet<>()', h: 'static String', i: 'studentDir.containsKey(idNumber)', j: 'return studentDir.get(idNumber)' }),
    blank(5, '(a) The type of buildingAccess', ['Set<String>', 'HashSet<String>', 'TreeSet<String>'], S('2')),
    blank(6, '(b) public ____ studentDir', ['static Map<Integer, String>', 'static HashMap<Integer, String>', 'static TreeMap<Integer, String>'], { ...S('2'), ...note('static, so all students share one directory.') }),
    blank(7, '(c) studentDir = ____', ['new HashMap<>()', 'new TreeMap<>()'], S('2')),
    blank(8, '(d) Constructor, line 1', 'this.name = name', S('2')),
    blank(9, '(e) Constructor, line 2', 'this.idNumber = idNumber', S('2')),
    blank(10, '(f) Constructor, line 3', 'studentDir.put(idNumber, name)', S('2')),
    blank(11, '(g) Constructor, line 4', ['buildingAccess = new HashSet<>()', 'this.buildingAccess = new HashSet<>()', 'buildingAccess = new TreeSet<>()'], S('2')),
    blank(12, '(h) public ____ getStudentName', 'static String', S('2')),
    blank(13, '(i) if (____)', 'studentDir.containsKey(idNumber)', S('2')),
    blank(14, '(j) Inside the if', 'return studentDir.get(idNumber)', S('2')),
  ]),
  problem('3', 'Stars (500 pts)', null, [
    java(`
public class Star {
    public static String glow;
    public static int luminosity = 100;
    public String light;

    public Star(String color) {
        light = color;
        glow = color;
        luminosity += 100;
    }

    public void shineBright(String st, Star s) {
        Star stella = new Star(this.light);
        this.light = st;
        System.out.println(s.glow);
    }

    public static void main(String[] args) {
        Star sun = new Star("pink");
        System.out.println(sun.light);       // blank (a)
        System.out.println(Star.luminosity); // blank (b)
        Star polaris = new Star("yellow");
        System.out.println(polaris.glow);    // blank (c)
        System.out.println(Star.glow);       // blank (d)
        sun.shineBright("blue", polaris);    // blank (e)
        System.out.println(sun.light);       // blank (f)
        System.out.println(Star.luminosity); // blank (g)
    }
}`),
    ...['pink', '200', 'yellow', 'yellow', 'pink', 'blue', '400'].map((a, k) => blank(15 + k, `(${'abcdefg'[k]})`, a, { ...S('3'),
      ...(k == 4 ? note('glow is static: making stella with sun’s light ("pink") sets glow for every Star, including polaris.') : k == 6 ? note('Three Stars were made (sun, polaris, stella), each adding 100.') : {}) })),
  ]),
  problem('4', '61Bomberman (700 pts)', null, [
    text('Bombs are −1s in int[][] world. All explode at once, setting every number in a bomb’s row and column (the bomb included) to 0. resultingWorld modifies world accordingly. All rows have the same length, and there is at least one row and column. For example, [[-1, 1, -1, 8, 7], [3, 6, 1, 2, 4], [2, 3, 3, 5, 9]] becomes [[0, 0, 0, 0, 0], [0, 6, 0, 2, 4], [0, 3, 0, 5, 9]].'),
    java(`
public void resultingWorld(int[][] world) {
    Set<Integer> rows = new HashSet<>();
    Set<Integer> cols = new HashSet<>();

    // Find the bombs
    for (int x = 0; ⟪a⟫; x += 1) {
        for (int y = 0; ⟪b⟫; y += 1) {
            if (⟪c⟫) {
                ⟪d⟫;
                ⟪e⟫;
            }
        }
    }

    // Trigger the bombs
    for (int x = 0; ⟪f⟫; x += 1) {
        for (int y = 0; ⟪g⟫; y += 1) {
            if (⟪h⟫) {
                world[x][y] = 0;
            }
        }
    }
}`, { a: 'x < world.length', b: 'y < world[x].length', c: 'world[x][y] == -1', d: 'rows.add(x)', e: 'cols.add(y)', f: 'x < world.length', g: 'y < world[x].length', h: 'rows.contains(x) || cols.contains(y)' }),
    blank(22, '(a) First loop, x condition', 'x < world.length', S('4')),
    blank(23, '(b) First loop, y condition', ['y < world[x].length', 'y < world[0].length'], S('4')),
    blank(24, '(c) if (____)', 'world[x][y] == -1', S('4')),
    blank(25, '(d) First line', 'rows.add(x)', S('4')),
    blank(26, '(e) Second line', 'cols.add(y)', S('4')),
    blank(27, '(f) Second loop, x condition', 'x < world.length', S('4')),
    blank(28, '(g) Second loop, y condition', ['y < world[x].length', 'y < world[0].length'], S('4')),
    blank(29, '(h) if (____)', ['rows.contains(x) || cols.contains(y)', 'cols.contains(y) || rows.contains(x)'], { ...S('4'), ...note('Find every bomb first, then clear: clearing during the search would erase bombs before they’re found.') }),
  ]),
  problem('5', 'getEveryNth (700 pts)', null, [
    text('getEveryNth(int n) returns a new ArrayList of the 0th, nth, 2nth, … elements, like Python’s arr[::n] (n > 0; the size needn’t be a multiple of n). It may not modify the input, and may not use any List’s get method.',
      'Part A: in ArrayList, backed by T[] array and int size.'),
    java(`
public List<T> getEveryNth(int n) {
    List<T> result = new ArrayList<>();
    for (int i = 0; ⟪a⟫; ⟪b⟫) {
        ⟪c⟫;
    }
    return result;
}`, { a: 'i < this.size', b: 'i += n', c: 'result.add(array[i])' }),
    blank(30, 'A: loop condition', ['i < this.size', 'i < size', 'i < size()', 'i < this.size()'], S('5')),
    blank(31, 'A: loop update', ['i += n', 'i = i + n'], S('5')),
    blank(32, 'A: loop body', 'result.add(array[i])', S('5')),
    text('Part B: in LinkedList, a circular doubly-linked list with a sentinel.'),
    java(`
public List<T> getEveryNth(int n) {
    List<T> result = new ArrayList<>();
    Node node = ⟪d⟫;
    int counter = 0;
    while (node != sentinel) {
        if (counter == 0) {
            ⟪e⟫;
        }
        counter = ⟪f⟫;
        ⟪g⟫;
    }
    return result;
}`, { d: 'sentinel.next', e: 'result.add(node.value)', f: '(counter + 1) % n', g: 'node = node.next' }),
    blank(33, 'B: Node node = ____', 'sentinel.next', S('5')),
    blank(34, 'B: Inside the if', 'result.add(node.value)', S('5')),
    blank(35, 'B: counter = ____', ['(counter + 1) % n', '(counter - 1) % n', '(counter + 1 + n) % n'], { ...S('5'), ...note('Anything that steps the counter by ±1 mod n works.') }),
    blank(36, 'B: Last line of the loop', 'node = node.next', S('5')),
    mc(37, 'Part C: For a list of 9999991 items, taking every 99991st, which implementation is faster?', ['ArrayList: it can index straight to each wanted element, skipping the rest', 'LinkedList: it doesn’t need to resize', 'They’re about the same: both visit every element', 'LinkedList: following pointers is faster than indexing'], 0, { ...S('5'), ...note('A linked list has to walk through every node to reach the next wanted one.') }),
  ]),
  problem('6', 'Testception (800 pts)', null, [
    text('numWords(String str) counts words: runs of 1 or more consecutive English letters. "Apple" is 1 word, "A-tree" and "cat4dog" are 2, "1234" and "-" are 0. isAlpha(char c) says whether c is a letter.'),
    java(`
public static int numWords(String str) {
    int words = 0;
    for (int i = 1; i < str.length(); i++) {
        if (isAlpha(str.charAt(i-1)) && !isAlpha(str.charAt(i))) {
            words += 1;
        }
    }
    return words;
}`),
    sata(38, '(a) This implementation is buggy. Which tests fail with it? (The assertions themselves are correct.)', ['assertThat(numWords("Count the words")).isEqualTo(3);', 'assertThat(numWords("Count the words!")).isEqualTo(3);', 'assertThat(numWords("ThisIsOneLongWord")).isEqualTo(1);', 'assertThat(numWords("The value of pi is 3.14")).isEqualTo(5);', 'assertThat(numWords("6.25")).isEqualTo(0);', 'assertThat(numWords("A")).isEqualTo(1);', 'assertThat(numWords("")).isEqualTo(0);'], [0, 2, 5], { ...S('6'),
      ...note('It counts a word when a letter is followed by a non-letter, so a word at the very end of the string is never counted.') }),
    text('(b) A correct implementation:'),
    java(`
public static int numWords(String str) {
    int words = 0;
    boolean inWord = __(1)__;
    for (char c : str.toCharArray()) {
        if (__(2)__) {
            __(3)__;
            words += 1;
        } else if (__(4)__) {
            __(5)__;
        }
    }
    return words;
}`),
    mc(39, '(b) (1)', ['true', 'false'], 1, S('6')),
    mc(40, '(b) (2)', ['!inWord && !isAlpha(c)', 'inWord && !isAlpha(c)', '!inWord && isAlpha(c)', 'inWord && isAlpha(c)'], 2, S('6')),
    mc(41, '(b) (3)', ['inWord = true', 'inWord = false'], 0, S('6')),
    mc(42, '(b) (4)', ['!inWord && !isAlpha(c)', 'inWord && !isAlpha(c)', '!inWord && isAlpha(c)', 'inWord && isAlpha(c)'], 1, S('6')),
    mc(43, '(b) (5)', ['inWord = true', 'inWord = false'], 1, { ...S('6'), ...note('Count a word when a letter starts one. (Flipping the meaning of inWord throughout also works.)') }),
  ]),
  problem('7', 'TwoWayStreet (600 pts)', null, [
    text('TelegraphAve is a singly-linked list of CrossStreets (name, nextStreet) with a circular sentinel. We add a prevStreet field, initially null everywhere; addPrevStreets should set every prevStreet so it becomes a circular doubly-linked list.'),
    java(`
public void addPrevStreets() {
    ⟪a⟫;
}

private void addPrevStreetsHelper(CrossStreet curr) {
    if (⟪b⟫) {
        return;
    }
    ⟪c⟫;
    ⟪d⟫;
}`, { a: 'addPrevStreetsHelper(sentinel)', b: 'curr.nextStreet.prevStreet != null', c: 'curr.nextStreet.prevStreet = curr', d: 'addPrevStreetsHelper(curr.nextStreet)' }),
    blank(44, 'addPrevStreets', 'addPrevStreetsHelper(sentinel)', S('7')),
    blank(45, 'Helper: if (____) return', 'curr.nextStreet.prevStreet != null', S('7')),
    blank(46, 'Helper: next line', 'curr.nextStreet.prevStreet = curr', S('7')),
    blank(47, 'Helper: last line', 'addPrevStreetsHelper(curr.nextStreet)', { ...S('7'), ...note('Point the next street back at this one and move on, stopping once you reach a street already done (back at the start). Many other solutions work.') }),
  ]),
  problem('8', 'Family Trees (700 pts)', null, [
    java(`
public interface TreeLike {
    default boolean isFriendly() {
        return true;
    }
}

public interface Needly {
    int numNeedles();
}

public class Pine implements TreeLike, Needly {
    public int numNeedles;
    public Pine(int numNeedles) { this.numNeedles = numNeedles; }
    @Override
    public int numNeedles() { return numNeedles; }
}

public class SyntaxTree implements TreeLike {
    public int branches;
    public SyntaxTree(int branches) { this.branches = branches; }
    @Override
    public boolean isFriendly() { return branches < 5; }
    public static int numNeedles() { return -1; }
}`),
    sata(48, '(a) Which lines compile?', ['Needly n1 = new Needly();', 'SyntaxTree s1 = new SyntaxTree(85);', 'Pine p1 = new Needly();', 'Needly n2 = new Pine(4);', 'Pine p2 = new SyntaxTree(1);', 'Needly n3 = new SyntaxTree(37);'], [1, 3], S('8')),
    java(`
Pine ponderosa = new Pine(3);
TreeLike coulter = new Pine(5);
SyntaxTree chomsky = new SyntaxTree(-1);
TreeLike pinker = new SyntaxTree(8);
Needly weird = new Pine(-1);`),
    sata(49, '(b) Which would print -1?', ['System.out.println(weird.numNeedles());', 'System.out.println(Needly.numNeedles());', 'System.out.println(chomsky.numNeedles());', 'System.out.println(SyntaxTree.numNeedles());'], [0, 2, 3], S('8')),
    text('(c) Random r = new Random(); TreeLike t = ?; boolean tIsFriendly = t.isFriendly();'),
    sata(50, '(c) Which expressions in place of ? guarantee tIsFriendly is true?', ['new Pine(r.nextInt(94))', 'new SyntaxTree(100)', 'new SyntaxTree(r.nextInt(6))', 'new SyntaxTree(r.nextInt(5))'], [0, 3], { ...S('8'), ...note('r.nextInt(6) can return 5, which isn’t < 5.') }),
  ]),
]);
