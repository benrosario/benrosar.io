// Spring 2021 Midterm 1, transcribed from the official solutions. (This exam’s points total 1280.)
// Code questions are one blank per line of the staff solution; written explanations (1d, 6b) are multiple choice
// here. Left out: 6(d) (0 points).
import { exam, problem, text, java, blank, mc } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-sp21-mt1', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });

export default exam(E, 'Spring 2021 Midterm 1', {
  exam: 'https://drive.google.com/file/d/1S_Fyvyz50DFikHwMcOBcRuFGIZoQMmGK/view',
  sol: 'https://drive.google.com/file/d/1Kal-nMvoEGD-ijt26bjtnDbwrUTfIl_K/view',
}, 'sp21-mt1', [
  problem('1', 'Cal Central (240 pts)', null, [
    text('(a) contains returns true if and only if the array a contains x (a is never null).'),
    java(`
public static boolean contains(int[] a, int x) {
    for (⟪a⟫) {
        if (⟪b⟫) {
            ⟪c⟫;
        }
    }
    ⟪d⟫;
}`, { a: 'int i = 0; i < a.length; i += 1', b: 'x == a[i]', c: 'return true', d: 'return false' }),
    blank(1, '(a) Loop header', ['int i = 0; i < a.length; i += 1', 'int i = 0; i < a.length; i++'], S('1a')),
    blank(2, '(a) if (____)', ['x == a[i]', 'a[i] == x'], S('1a')),
    blank(3, '(a) Inside the if', 'return true', S('1a')),
    blank(4, '(a) After the loop', 'return false', S('1a')),
    text('A CourseCatalog has public int[] courses (initially new int[0]). cc.offerNewCourse(courseid) adds the course if it isn’t already in the catalog. A CalStudent has public int[] courses (length 4) and int numOfCourses. x.addCourse(courseid, cc) adds the course to the first free spot only if it’s in the catalog, the student has fewer than 4 courses, and they don’t already have it.',
      '(b) offerNewCourse (you may use Utils.contains):'),
    java(`
public void offerNewCourse(int courseid) {
    if (⟪e⟫) {
        int[] newArr = new int[⟪f⟫];
        for (⟪g⟫) {
            ⟪h⟫;
        }
        ⟪i⟫;
        ⟪j⟫;
    }
}`, { e: '!Utils.contains(courses, courseid)', f: 'courses.length + 1', g: 'int i = 0; i < courses.length; i++', h: 'newArr[i] = courses[i]', i: 'newArr[courses.length] = courseid', j: 'courses = newArr' }),
    blank(5, '(b) if (____)', '!Utils.contains(courses, courseid)', S('1b')),
    blank(6, '(b) new int[____]', 'courses.length + 1', S('1b')),
    blank(7, '(b) Loop header', ['int i = 0; i < courses.length; i++', 'int i = 0; i < courses.length; i += 1'], S('1b')),
    blank(8, '(b) Loop body', 'newArr[i] = courses[i]', S('1b')),
    blank(9, '(b) After the loop', 'newArr[courses.length] = courseid', S('1b')),
    blank(10, '(b) Last line', ['courses = newArr', 'this.courses = newArr'], S('1b')),
    java(`
public void addCourse(int courseid, CourseCatalog cc) {
    if (⟪k⟫) {
        ⟪l⟫;
        ⟪m⟫;
    }
}`, { k: 'numOfCourses < 4 && !Utils.contains(courses, courseid) && Utils.contains(cc.courses, courseid)', l: 'this.courses[numOfCourses] = courseid', m: 'numOfCourses += 1' }),
    blank(11, '(c) if (____)', ['numOfCourses < 4 && !Utils.contains(courses, courseid) && Utils.contains(cc.courses, courseid)', 'numOfCourses < 4 && Utils.contains(cc.courses, courseid) && !Utils.contains(courses, courseid)', 'Utils.contains(cc.courses, courseid) && !Utils.contains(courses, courseid) && numOfCourses < 4'], S('1c')),
    blank(12, '(c) First line', ['this.courses[numOfCourses] = courseid', 'courses[numOfCourses] = courseid'], S('1c')),
    blank(13, '(c) Second line', ['numOfCourses += 1', 'numOfCourses++'], S('1c')),
    mc(14, '(d) One better data structure than int[] for both classes would be a List. Why?', ['A List grows as needed, so offerNewCourse wouldn’t have to build a new array, and it tracks its own size, so numOfCourses wouldn’t be needed.', 'A List can only hold unique items.', 'A List is always sorted.', 'A List uses less memory than an array.'], 0, { ...S('1d'), ...note('A Set, coming later in the course, would be even better.') }),
  ]),
  problem('2', 'WWJD (120 pts)', null, [
    java(`
public class Egg {
    public String owner;
    public static String staticOwner;

    public Egg(String name) {
        this.owner = name;
        staticOwner = name;
    }

    public void weirdExchange(String borrower, Egg g2) {
        String lender = this.owner;
        this.owner = borrower;
        g2.owner = lender;
        g2 = new Egg("Omar");
        System.out.println("g2 owner: " + g2.owner);
    }

    public static void main(String[] args) {
        Egg g1 = new Egg("Itai");
        Egg g2 = new Egg("Connor");

        String p1 = "Linda";
        g1.weirdExchange(p1, g2);                              // line 23
        System.out.println("g1 owner: " + g1.owner);           // line 24
        System.out.println("g2 owner: " + g2.owner);           // line 25
        System.out.println("Egg owner: " + Egg.staticOwner);   // line 26
    }
}`),
    ...[[23, 'g2', 3], [24, 'g1', 2], [25, 'g2', 0], [26, 'Egg', 3]].map(([ln, who, a], k) =>
      mc(15 + k, `What does line ${ln} print?`, ['Itai', 'Connor', 'Linda', 'Omar', 'Error'].map((n, j) => j == 4 ? n : `${who} owner: ${n}`), a, { ...S('2'),
        ...(k == 2 ? note('weirdExchange set the caller’s g2 object’s owner to "Itai" before reassigning its own parameter, which doesn’t affect main’s g2.') : k == 3 ? note('Every constructor sets the static staticOwner; "Omar" was the last.') : {}) })),
  ]),
  problem('3', 'WWJDMS (120 pts)', null, [
    java(`
public interface Instrument {
    default public String getName() {
        return "instrument";
    }
}

public class Guitar implements Instrument {
    public String getName() {
        return "guitar";
    }
}

public interface Music {
    default public void play(Instrument i) {
        System.out.println("music on a " + i.getName());
    }
}

public class Rock implements Music {
    public void play(Instrument i) {
        System.out.println("rock on a " + i.getName());
    }
    public void play(Guitar g) {
        System.out.println("RPG");
    }
}

public class Jota implements Music {
    public void play(Guitar g) {
        System.out.println("JPG");
    }
}

Instrument i = new Guitar();
Guitar g = new Guitar();`),
    text('What does each call print? If the first line errors, ignore it and consider the second.'),
    ...[['Rock r = new Rock(); r.play(i);', 2], ['… r.play(g);', 4], ['Music mr = new Rock(); mr.play(i);', 2], ['… mr.play(g);', 2], ['Jota j = new Jota(); j.play(i);', 3], ['… j.play(g);', 4], ['Music mj = new Jota(); mj.play(i);', 3], ['… mj.play(g);', 3]].map(([l, a], k) =>
      mc(19 + k, `(${'abcd'[k >> 1]}) ${l}`, ['music on a instrument', 'rock on a instrument', 'rock on a guitar', 'music on a guitar', k < 4 ? 'RPG' : 'JPG', 'Error'], a, { ...S('3'),
        ...(k == 3 ? note('mr’s static type is Music, which only has play(Instrument); Rock overrides that one.') : k == 7 ? note('Through a Music reference only play(Instrument) exists, and Jota doesn’t override it, so the default runs.') : {}) })),
  ]),
  problem('4', 'BLList (310 pts)', null, [
    text('BLList<T> has addLast, get, remove(int i) and size, behaving like any list. (a) Write a JUnit test that addLast and get work, with at least 3 elements.'),
    java(`
@Test
public void testAddLastAndGet() {
    BLList<Integer> b = new BLList<>();
    ⟪a⟫;
    ⟪b⟫;
    ⟪c⟫;
    ⟪d⟫;
    ⟪e⟫;
    ⟪f⟫;
}`, { a: 'b.addLast(1)', b: 'b.addLast(2)', c: 'b.addLast(3)', d: 'assertEquals(1, b.get(0))', e: 'assertEquals(2, b.get(1))', f: 'assertEquals(3, b.get(2))' }),
    ...['b.addLast(1)', 'b.addLast(2)', 'b.addLast(3)', 'assertEquals(1, b.get(0))', 'assertEquals(2, b.get(1))', 'assertEquals(3, b.get(2))'].map((a, k) =>
      blank(27 + k, `(a) Line ${k + 1}`, a, { ...S('4a'), ...(k == 5 ? note('Any three values work, as long as the asserts match them.') : {}) })),
    text('A BLList (“backward linked list”) is a sentinel node pointing backwards at the last item; each Node has an item and a prev. After addLast(0), addLast(5), addLast(10): sentinel → 10 → 5 → 0 (following prev).'),
    java(`
private class Node {
    private T item;
    private Node prev;
    public Node(T i, Node p) { item = i; prev = p; }
}
private Node sentinel;  // initially new Node(null, null)
private int size;

public void addLast(T item) {
    ⟪g⟫;
    ⟪h⟫;
}`, { g: 'sentinel.prev = new Node(item, sentinel.prev)', h: 'size += 1' }),
    blank(33, '(b) addLast, line 1', 'sentinel.prev = new Node(item, sentinel.prev)', S('4')),
    blank(34, '(b) addLast, line 2', ['size += 1', 'size++'], S('4')),
    text('(c) getNode(int i) finds the ith node recursively (getNode(size) is the sentinel). No loops.'),
    java(`
private Node getNode(int i) {
    return ⟪i⟫;
}

private Node getNode(int i, Node p) {
    if (⟪j⟫) {
        return p;
    }
    return ⟪k⟫;
}`, { i: 'getNode(size() - i, sentinel)', j: 'i == 0', k: 'getNode(i - 1, p.prev)' }),
    blank(35, '(c) getNode(int i) returns', ['getNode(size() - i, sentinel)', 'getNode(size - i, sentinel)'], S('4')),
    blank(36, '(c) if (____) return p', 'i == 0', S('4')),
    blank(37, '(c) return ____', 'getNode(i - 1, p.prev)', { ...S('4'), ...note('The ith item is size − i hops back from the sentinel.') }),
    text('(d) The same, iteratively.'),
    java(`
private Node getNode(int i) {
    int numNodesToHop = ⟪l⟫;
    Node p = sentinel;
    while (⟪m⟫) {
        ⟪n⟫;
        ⟪o⟫;
    }
    return p;
}`, { l: 'size() - i', m: 'numNodesToHop > 0', n: 'p = p.prev', o: 'numNodesToHop -= 1' }),
    blank(38, '(d) numNodesToHop = ____', ['size() - i', 'size - i'], S('4')),
    blank(39, '(d) while (____)', ['numNodesToHop > 0', 'numNodesToHop != 0'], S('4')),
    blank(40, '(d) First line of the loop', 'p = p.prev', S('4')),
    blank(41, '(d) Second line', ['numNodesToHop -= 1', 'numNodesToHop--'], S('4')),
    text('(e) remove(int i) removes the ith item, doing nothing for an out-of-bounds index. You may use getNode.'),
    java(`
public void remove(int i) {
    if (⟪p⟫) {
        return;
    }
    ⟪q⟫;
    ⟪r⟫;
    ⟪s⟫;
}`, { p: 'i < 0 || i >= size()', q: 'Node parentOfNodeToRemove = getNode(i + 1)', r: 'parentOfNodeToRemove.prev = parentOfNodeToRemove.prev.prev', s: 'size -= 1' }),
    blank(42, '(e) if (____) return', ['i < 0 || i >= size()', 'i < 0 || i >= size'], S('4')),
    blank(43, '(e) Next line', 'Node parentOfNodeToRemove = getNode(i + 1)', S('4')),
    blank(44, '(e) Next line', 'parentOfNodeToRemove.prev = parentOfNodeToRemove.prev.prev', S('4')),
    blank(45, '(e) Last line', ['size -= 1', 'size--'], { ...S('4'), ...note('Find the node that points back at the one to remove (item i + 1, or the sentinel) and skip over it.') }),
  ]),
  problem('5', 'MT1List (220 pts)', null, [
    text('MT1List<T> has addLast, get, remove(int i), size and createList() (a new empty MT1List<T>).',
      '(a) getEvens returns a new list of the even-indexed items without changing the original: ["ape", "banana", "cow", "dog"] gives ["ape", "cow"].'),
    java(`
default public MT1List<T> getEvens() {
    ⟪a⟫;
    for (⟪b⟫) {
        ⟪c⟫;
    }
    return returnList;
}`, { a: 'MT1List<T> returnList = createList()', b: 'int i = 0; i < size(); i += 2', c: 'returnList.addLast(get(i))' }),
    blank(46, '(a) First line', 'MT1List<T> returnList = createList()', S('5')),
    blank(47, '(a) Loop header', ['int i = 0; i < size(); i += 2', 'int i = 0; i < size(); i = i + 2'], S('5')),
    blank(48, '(a) Loop body', 'returnList.addLast(get(i))', { ...S('5'), ...note('Or step by 1 and add only when i % 2 == 0.') }),
    text('(b) remove(int start, int end) removes the items from start to end inclusive and returns them as a list: ["ape", "banana", "cow", "dog", "elephant"].remove(1, 3) leaves ["ape", "elephant"] and returns ["banana", "cow", "dog"].'),
    java(`
default public MT1List<T> remove(int start, int end) {
    MT1List<T> returnList = createList();
    int numToRemove = ⟪d⟫;
    for (int i = 0; i < numToRemove; i += 1) {
        ⟪e⟫;
        ⟪f⟫;
    }
    return returnList;
}`, { d: 'end - start + 1', e: 'returnList.addLast(get(start))', f: 'remove(start)' }),
    blank(49, '(b) numToRemove = ____', 'end - start + 1', S('5')),
    blank(50, '(b) First line of the loop', 'returnList.addLast(get(start))', S('5')),
    blank(51, '(b) Second line', 'remove(start)', { ...S('5'), ...note('Each removal shifts the next item into position start.') }),
    text('(c) reverse reverses the list in place, without new or createList: ["ape", "banana", "cow", "dog", "elephant"] becomes ["elephant", "dog", "cow", "banana", "ape"].'),
    java(`
default public void reverse() {
    int N = size();
    for (⟪g⟫) {
        ⟪h⟫;
        ⟪i⟫;
        ⟪j⟫;
    }
}`, { g: 'int i = N - 2; i >= 0; i -= 1', h: 'T x = get(i)', i: 'remove(i)', j: 'addLast(x)' }),
    blank(52, '(c) Loop header', ['int i = N - 2; i >= 0; i -= 1', 'int i = N - 2; i >= 0; i--'], S('5')),
    blank(53, '(c) Line 1', 'T x = get(i)', S('5')),
    blank(54, '(c) Line 2', 'remove(i)', S('5')),
    blank(55, '(c) Line 3', 'addLast(x)', { ...S('5'), ...note('Move items to the end from the second-to-last back to the first.') }),
  ]),
  problem('6', 'AListBug (110 pts)', null, [
    java(`
1: public class AListMax100<Item> {
2:     private Item[] items;
3:     private static int size;
4:
5:     /** Creates an empty list. */
6:     public AListMax100() {
7:         items = (Item[]) new Object[100];
8:         size = 0;
9:     }
10:
11:    /** Inserts X into the back of the list if there is room. */
12:    public void addLast(Item x) {
13:        if (size >= 100) {
14:            return;
15:        }
16:        items[size] = x;
17:        size = size + 1;
18:    }
19:
20:    /** Returns the item from the back of the list or null if empty. */
21:    public Item getLast() {
22:        if (size == 0) {
23:            return null;
24:        }
25:        return items[size - 1];
26:    }
27:
28:    /** Returns the number of items in the list. */
29:    public int size() {
30:        return size;
31:    }
32: }`),
    text('This list has a serious bug even when it has plenty of room. It isn’t running out of space, and it isn’t an off-by-one error.'),
    blank(56, '(a) Which single line number could we change to fix it?', '3', S('6')),
    mc(57, '(b) How would we change it?', ['Remove the static keyword in front of size', 'Make items static', 'Change Item[] to Object[]', 'Initialize size to 1'], 0, { ...S('6'), ...note('A static size is shared by every list, so creating a second list resets the first one’s size.') }),
    text('(c) Write a JUnit test that fails because of the bug.'),
    java(`
@Test
public void test() {
    AListMax100<Integer> L = new AListMax100<>();
    L.addLast(5);
    L.addLast(10);
    ⟪a⟫;
    ⟪b⟫;
    ⟪c⟫;
}`, { a: 'AListMax100<Integer> L2 = new AListMax100<>()', b: 'L2.addLast(5)', c: 'assertEquals(2, L.size())' }),
    blank(58, '(c) Line 1', 'AListMax100<Integer> L2 = new AListMax100<>()', S('6')),
    blank(59, '(c) Line 2', 'L2.addLast(5)', S('6')),
    blank(60, '(c) Line 3', 'assertEquals(2, L.size())', { ...S('6'), ...note('Creating L2 resets the shared size to 0, so L.size() is 1, not 2.') }),
  ]),
  problem('7', 'Tilt (160 pts)', null, [
    text('Re-implement 2048’s tilt for one row, as an IntList: tiltRowLeft transforms it into the result of tilting left. There are no empty tiles, and merges don’t need empty tiles added at the end. Two equal tiles merge into one double tile; a merged tile doesn’t merge again that tilt; with three equal tiles in a row, the leading two merge. For example, 2, 2, 8, 4 becomes 4, 8, 4; 2, 2, 4, 4 becomes 4, 8; and 2, 2, 4, 8 becomes 4, 4, 8.'),
    java(`
public static void tiltRowLeft(IntList tiles) {
    IntList p = ⟪a⟫;
    while (⟪b⟫) {
        if (⟪c⟫) {
            ⟪d⟫;
            ⟪e⟫;
            if (p.rest == null) { // Using this is optional.
                break;
            }
        }
        ⟪f⟫;
    }
}`, { a: 'tiles', b: 'p.rest != null', c: 'p.first == p.rest.first', d: 'p.first += p.first', e: 'p.rest = p.rest.rest', f: 'p = p.rest' }),
    blank(61, 'IntList p = ____', 'tiles', S('7')),
    blank(62, 'while (____)', ['p.rest != null', 'p != null && p.rest != null'], { ...S('7'), ...note('With p != null && p.rest != null, the optional break isn’t needed.') }),
    blank(63, 'if (____)', ['p.first == p.rest.first', 'p.rest.first == p.first'], S('7')),
    blank(64, 'Merge, line 1', ['p.first += p.first', 'p.first *= 2', 'p.first = p.first * 2', 'p.first = 2 * p.first'], S('7')),
    blank(65, 'Merge, line 2', 'p.rest = p.rest.rest', S('7')),
    blank(66, 'Last line of the loop', 'p = p.rest', { ...S('7'), ...note('Always move past the current tile, so a merged tile never merges again.') }),
  ]),
]);
