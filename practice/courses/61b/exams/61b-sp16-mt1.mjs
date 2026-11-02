// Spring 2016 Midterm 1: scored questions from the official exam and solutions.
import { exam, problem, text, java, blank, mc } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...tags) => site(...tags);
const dispatch = ['Compile-error', 'Runtime-error', 'A', 'B', 'C', 'D', 'E'];
export default exam('61b-sp16-mt1', 'Spring 2016 Midterm 1', {
  exam: 'https://drive.google.com/file/d/1ooKS9xu6ojQ926axtwdsHM5vbBUh3ylh/view',
  sol: 'https://drive.google.com/file/d/1JSJDTtwwj5VaV6u35XQ55ZjPMlKsZdXi/view',
}, 'sp16-mt1', [
  problem('1', 'IntList Essentials (3.5 pts)', null, [
    java(`class IntList { int val; IntList tail; IntList(int v, IntList t) { val=v; tail=t; } }
static void next1(IntList list) { list=list.tail; }
static IntList next2(IntList list) { list=list.tail; return list; }
static void next3(IntList list) { IntList temp=list; temp=temp.tail; }
IntList L=new IntList(3,new IntList(2,new IntList(1,null)));
next1(L); System.out.println(L.val); // A
next2(L); System.out.println(L.val); // B
next3(L); System.out.println(L.val); // C`),
    blank(1, '(a) Print A', '3', T('LINKED_LISTS', 'JAVA')),
    blank(2, '(a) Print B', '3', T('LINKED_LISTS', 'JAVA')),
    blank(3, '(a) Print C', '3', T('LINKED_LISTS', 'JAVA')),
    text('The method must insert x before the current first value while keeping the original IntList object, so an alias to it sees the new head too.'),
    java(`public IntList strangeInsertFront(int x) {
    ⟪a⟫;
    ⟪b⟫;
    return this;
}`, { a: 'this.tail = new IntList(this.val, this.tail)', b: 'this.val = x' }),
    blank(4, '(b) Preserve the old first value', ['this.tail = new IntList(this.val, this.tail)', 'tail = new IntList(val, tail)'], T('LINKED_LISTS')),
    blank(5, '(b) Set the new first value', ['this.val = x', 'val = x'], T('LINKED_LISTS')),
  ]),
  problem('2', 'SList Debugging and Testing (2.5 pts)', null, [
    text('The implementation shares its sentinel across every SList because the field is static. Write a JUnit test that fails on this implementation but passes when each list has its own sentinel.'),
    java(`@Test
public void test() {
    ⟪a⟫
    ⟪b⟫
    ⟪c⟫
    ⟪d⟫
    ⟪e⟫
}` , {a:'SList s1 = new SList();',b:'SList s2 = new SList();',c:'s1.insertFront(1);',d:'s2.insertFront(2);',e:'assertEquals(1, s1.getFront());'}),
    blank(6, '(a) Make the first list', ['SList s1 = new SList();', 'SList s1=new SList();'], T('TESTING', 'JAVA')),
    blank(7, '(a) Make the second list', ['SList s2 = new SList();', 'SList s2=new SList();'], T('TESTING', 'JAVA')),
    blank(8, '(a) Insert into the first list', ['s1.insertFront(1)', 's1.insertFront(1);'], T('TESTING', 'JAVA')),
    blank(9, '(a) Insert into the second list', ['s2.insertFront(2)', 's2.insertFront(2);'], T('TESTING', 'JAVA')),
    blank(10, '(a) Assert the first list retained its value', ['assertEquals(1, s1.getFront())', 'assertEquals(1, s1.getFront());'], T('TESTING', 'JAVA')),
  ]),
  problem('3', 'ArrayHorse.com (5.5 pts)', null, [
    text('For the odd positive N, genCoolGrid fills a symmetric diamond with 8s. Other cells remain the int-array default, 0.'),
    java(`// Show genCoolGrid(5), with rows from top to bottom.
⟪a⟫
⟪b⟫
⟪c⟫
⟪d⟫
⟪e⟫`, {a:'0 0 8 0 0',b:'0 8 8 8 0',c:'8 8 8 8 8',d:'0 8 8 8 0',e:'0 0 8 0 0'}),
    ...['0 0 8 0 0','0 8 8 8 0','8 8 8 8 8','0 8 8 8 0','0 0 8 0 0'].map((ans,i)=>blank(i+11, `(a) Row ${i}`, ans, T('ARRAYS','JAVA'))),
    text('Map f over one column in place. The method returns the same matrix reference.'),
    java(`public static int[][] mapColumn(IUF f, int[][] m, int c) {
    ⟪a⟫
    ⟪b⟫
    ⟪c⟫
    return m;
}`, {a:'for (int i = 0; i < m.length; i += 1) {',b:'    m[i][c] = f.apply(m[i][c]);',c:'}'}),
    blank(16, '(b) Iterate through the rows', ['for (int i = 0; i < m.length; i += 1) {', 'for(int i=0;i<m.length;i+=1){'], T('ARRAYS','JAVA')),
    blank(17, '(b) Transform this row’s selected column', 'm[i][c] = f.apply(m[i][c]);', T('ARRAYS','JAVA')),
    blank(18, '(b) Close the loop', '}', T('ARRAYS','JAVA')),
    blank(19, '(c) Make a 5×5 cool grid and square its middle column', 'mapColumn(new Squarer(), genCoolGrid(5), 2)', T('ARRAYS','JAVA')),
  ]),
  problem('4', 'All Natural (2.5 pts)', null, [
    text('Remove negative items from the SList without allocating nodes, preserving the order of the remaining items. The sentinel is not part of the list. Fill the right-hand solution.'),
    java(`public void allNatural() {
    IntNode p = ⟪a⟫;
    while (⟪b⟫) {
        if (⟪c⟫) {
            ⟪d⟫
        } else {
            ⟪e⟫
        }
    }
}`, {a:'sentinel',b:'p != null && p.next != null',c:'p.next.item < 0',d:'p.next = p.next.next;',e:'p = p.next;'}),
    blank(20, '(a) Start at the sentinel', 'sentinel', T('LINKED_LISTS','JAVA')),
    blank(21, '(a) Continue while a next node exists', ['p != null && p.next != null','p.next != null && p != null'], T('LINKED_LISTS','JAVA')),
    blank(22, '(a) Identify a negative next item', 'p.next.item < 0', T('LINKED_LISTS','JAVA')),
    blank(23, '(a) Unlink that item', 'p.next = p.next.next;', T('LINKED_LISTS','JAVA')),
    blank(24, '(a) Advance to the next node', 'p = p.next;', T('LINKED_LISTS','JAVA')),
  ]),
  problem('5', 'EggEgg (5.5 pts)', null, [
    text('Initial list: egg points to 1 → 9 → 2 → 6 → 6 → 4. Apply statements A through E in the given order: A removes two nodes after egg; B inserts a node with head one less than egg.tail.head before the tail; C sets backup = egg; D advances egg two links; E sets backup.tail = egg. Report the reachable lists after all five operations.'),
    java(`After A–E:
egg → ⟪a⟫ → ⟪b⟫ → 4
backup → ⟪c⟫ → ⟪d⟫ → ⟪e⟫ → 4`, {a:'6',b:'6',c:'1',d:'6',e:'6'}),
    blank(25, '(a) egg’s first value', '6', T('LINKED_LISTS','JAVA')),
    blank(26, '(a) egg’s next value', '6', T('LINKED_LISTS','JAVA')),
    blank(27, '(a) backup’s first value', '1', T('LINKED_LISTS','JAVA')),
    blank(28, '(a) backup’s second value', '6', T('LINKED_LISTS','JAVA')),
    blank(29, '(a) backup’s third value', '6', T('LINKED_LISTS','JAVA')),
    text('Reorder all five operations so some reachable IntList has exactly 1 → 2 → 3 → 4.'),
    mc(30, '(b) Choose a valid operation order', ['CDEAB', 'CDAEB', 'ABCDE', 'BACDE'], 0, { also: [1], ...T('LINKED_LISTS','JAVA') }),
  ]),
  problem('6', 'Array Processing (8 pts)', null, [
    text('Treat message as circular. The banned word is shorter than the nonempty message, and k is a valid start index.'),
    java(`private static boolean matches(char[] message, char[] banned, int k) {
    for (int i = ⟪a⟫; i < ⟪b⟫; i += 1) {
        int messageIndex = ⟪c⟫;
        if (⟪d⟫) {
            ⟪e⟫
        }
    }
    ⟪f⟫
}`, {a:'0',b:'banned.length',c:'(k + i) % message.length',d:'message[messageIndex] != banned[i]',e:'return false;',f:'return true;'}),
    blank(31, '(a) Initialize the loop', '0', T('ARRAYS','JAVA')),
    blank(32, '(a) Loop over the banned word', 'banned.length', T('ARRAYS','JAVA')),
    blank(33, '(a) Wrap the message index around', '(k + i) % message.length', T('ARRAYS','JAVA')),
    blank(34, '(a) Detect a character mismatch', 'message[messageIndex] != banned[i]', T('ARRAYS','JAVA')),
    blank(35, '(a) Return on mismatch', 'return false;', T('ARRAYS','JAVA')),
    blank(36, '(a) Return after every character matched', 'return true;', T('ARRAYS','JAVA')),
    text('Search every possible circular starting index; return -1 when no start matches.'),
    java(`public static int matchStart(char[] message, char[] banned) {
    for (int k = 0; k < message.length; k += 1) {
        if (matches(message, banned, k)) {
            ⟪a⟫
        }
    }
    ⟪b⟫
}`, {a:'return k;',b:'return -1;'}),
    blank(37, '(b) Return the matching start index', 'return k;', T('ARRAYS','JAVA')),
    blank(38, '(b) Return when no match exists', 'return -1;', T('ARRAYS','JAVA')),
    text('Remove the one circular occurrence while restoring the original message order. The official solution rotates the copy into the correct position using an offset d.'),
    java(`public static char[] filter(char[] message, char[] banned) {
    int match = ⟪a⟫;
    if (match < 0) return ⟪b⟫;
    int numToCopy = ⟪c⟫;
    char[] result = new char[⟪d⟫];
    int messageIndex = ⟪e⟫;
    for (int i = 0; i < ⟪f⟫; i += 1) {
        int d = ⟪g⟫;
        result[(d + i) % numToCopy] = message[(messageIndex + i) % message.length];
    }
    return ⟪h⟫;
}`, {a:'matchStart(message, banned)',b:'message',c:'message.length - banned.length',d:'numToCopy',e:'(match + banned.length) % message.length',f:'numToCopy',g:'Math.max(messageIndex - banned.length, 0)',h:'result'}),
    ...[
      ['(c) Find the match','matchStart(message, banned)'],['(c) Preserve the original if absent','message'],['(c) Find the number of remaining chars','message.length - banned.length'],['(c) Allocate the result','numToCopy'],['(c) Start copying after the match','(match + banned.length) % message.length'],['(c) Copy each remaining character','numToCopy'],['(c) Compute the placement offset','Math.max(messageIndex - banned.length, 0)'],['(c) Return the filtered array','result'],
    ].map(([label, ans],i)=>blank(i+39,label,ans,T('ARRAYS','JAVA'))),
  ]),
  problem('8', 'Interfaces (6 pts)', null, [
    text('(a) Add a default method to Deque that reverses its items. This recursive version uses only the existing Deque methods and leaves the same items in reverse order.'),
    java(`default void reverse() {
    if (⟪a⟫) {
        Item first = ⟪b⟫;
        ⟪c⟫;
        ⟪d⟫;
    }
}`, { a: 'size() > 1', b: 'removeFirst()', c: 'reverse()', d: 'addLast(first)' }),
    blank(58, '(a) Stop when at most one item remains', 'size() > 1', T('DEQUES', 'RECURSION')),
    blank(59, '(a) Remove the front item', 'removeFirst()', T('DEQUES', 'RECURSION')),
    blank(60, '(a) Reverse the rest', 'reverse()', T('DEQUES', 'RECURSION')),
    blank(61, '(a) Restore the item at the back', 'addLast(first)', T('DEQUES', 'RECURSION')),
    text('Assume ArrayDeque and LinkedListDeque correctly implement Deque. A is the Deque default append(Deque); B and C are ArrayDeque.append(ArrayDeque) and the override append(Deque); D and E are ArrayDeque.prepend(Deque) and prepend(ArrayDeque). Choose which method runs or whether the expression fails for each receiver and argument type.'),
    java(`Deque<Integer> d = new ArrayDeque<>();
ArrayDeque<Integer> ad = new ArrayDeque<>();
// A: Deque.append(Deque)
// B: ArrayDeque.append(ArrayDeque)
// C: ArrayDeque.append(Deque)
// D: ArrayDeque.prepend(Deque)
// E: ArrayDeque.prepend(ArrayDeque)`),
    ...[
      ['d.prepend(d)', 'Compile-error'], ['d.prepend(ad)', 'Compile-error'], ['ad.prepend(d)', 'D'], ['ad.prepend(ad)', 'E'],
      ['ad.append(d)', 'C'], ['ad.append(ad)', 'B'], ['d.append(d)', 'A'], ['d.append(ad)', 'A'],
    ].map(([call, answer],i)=>mc(i+47, call, dispatch, dispatch.indexOf(answer), T('INHERITANCE','JAVA'))),
  ]),
  problem('9', 'Dynamic Method Selection and Inheritance (6 pts)', null, [
    text('Complete the blanks so DMSList.max() works. Every inserted number is positive; the base case node returns zero.'),
    java(`public DMSList() {
    sentinel = new IntNode(-1000, ⟪a⟫);
}
public class ⟪b⟫ extends IntNode {
    ⟪c⟫
        super(0, null);
    }
    @Override
    public int max() { return 0; }
}`, {a:'new LastIntNode()',b:'LastIntNode',c:'public LastIntNode() {'}),
    blank(55, '(a) Install the terminal node', 'new LastIntNode()', T('INHERITANCE','JAVA')),
    blank(56, '(a) Name the terminal node subtype', 'LastIntNode', T('INHERITANCE','JAVA')),
    blank(57, '(a) Declare its constructor', 'public LastIntNode() {', T('INHERITANCE','JAVA')),
  ]),
]);
