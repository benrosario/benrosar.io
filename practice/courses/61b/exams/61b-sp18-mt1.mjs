// Spring 2018 Midterm 1: selected questions from the official solutions.
import { exam, problem, text, java, blank, mc, sata } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...tags) => site(...tags);
export default exam('61b-sp18-mt1', 'Spring 2018 Midterm 1', {
  exam: 'https://drive.google.com/file/d/14yQDPQVcsWAG-QBPxlrX3N-YDRyR2c_C/view',
  sol: 'https://drive.google.com/file/d/1hnRfUh2ImLGqwOSS28hFUxnpZ_cjMaQT/view',
}, 'sp18-mt1', [
  problem('1', 'Static Dada (19 pts)', null, [
    java(`class Dada {
    Dada[] r; static Dada[] rs; String name;
    Dada(String n) { name=n; }
    static void printDadaArray(Dada[] d) {
        for (Dada x:d) System.out.print(x.name+" ");
        System.out.println();
    }
}
Dada a=new Dada("alice"), b=new Dada("bob");
Dada c=new Dada("carol"), d=new Dada("dan");
Dada[][] twod={{a,b},{c,d}};
a.r=twod[1]; printDadaArray(a.r); // A
Dada.rs=a.r; b.r=Dada.rs; b.r=new Dada[]{d,c};
Dada.rs[1]=new Dada("eve");
printDadaArray(Dada.rs); // B
printDadaArray(b.r); // C
printDadaArray(twod[0]); // D
printDadaArray(twod[1]); // E`),
    ...[['A','carol dan'],['B','carol eve'],['C','dan carol'],['D','alice bob'],['E','carol eve']].map(([l,a],i)=>blank(i+1,`(a) Print ${l}`,a,T('JAVA','ARRAYS'))),
    text('For part (b), Dada.rs starts as [fritz, gritz]. fillOne(d) only reassigns its parameter; fillMany(d) calls System.arraycopy(rs, 0, d, 0, d.length). c.r initially refers to [alice, bob].'),
    java(`static void fillMany(Dada[] d) { System.arraycopy(Dada.rs,0,d,0,d.length); }
static void fillOne(Dada d) { d=Dada.rs[0]; }
Dada.rs=new Dada[]{new Dada("fritz"),new Dada("gritz")};
c.r=twod[0];
printDadaArray(c.r); // F
fillOne(c.r[0]); printDadaArray(c.r); // G
fillMany(c.r); printDadaArray(c.r); // H`),
    ...[['F','alice bob'],['G','alice bob'],['H','fritz gritz']].map(([l,a],i)=>blank(i+6,`(b) Print ${l}`,a,T('JAVA','ARRAYS'))),
  ]),
  problem('2', 'What It Do (12 pts)', null, [
    java(`static int f(int x) {
    if (x == 1) return 1;
    return 2 * f(x / 2);
}`),
    mc(9, '(a) What does f do for x ≥ 1?', ['Returns x', 'Returns the largest power of 2 no greater than x', 'Returns the smallest power of 2 no less than x', 'Returns the number of bits in x'], 1, T('RECURSION', 'JAVA')),
    mc(10, '(a) What happens for x < 1?', ['It returns 0', 'It returns 1', 'It recurses without reaching its base case', 'It throws a compile error'], 2, T('RECURSION', 'JAVA')),
    java(`static void g(IntList x) {
    if (x == null) return;
    g(x.rest);
    x.rest = x;
}
IntList L = IntList.of(3, 4, 5);
g(L);`),
    mc(11, '(b) What does the list reachable from L become?', ['3 → 4 → 5 → null', '3 → 3 → …', '3 → 4 → 3 → …', 'The call never returns'], 1, T('LINKED_LISTS', 'RECURSION'), 'Each recursive call makes its own node point to itself on the way back. L still points to the first node.'),
  ]),
  problem('3', 'KeyGate (16.25 pts)', null, [
    java(`class Key {} class SkeletonKey extends Key {} class Fingerprint {}
class StandardBox { void unlock(Key k) { /* UK */ } }
class BioBox extends StandardBox {
    void unlock(SkeletonKey sk) { /* USK */ }
    void unlock(Fingerprint f) { /* UF */ }
}
Key k = new Key(); SkeletonKey sk = new SkeletonKey(); Fingerprint f = new Fingerprint();
StandardBox sb = new StandardBox(), sbbb = new BioBox();
BioBox bb = new BioBox();`),
    text('For each call, choose the method body that runs, or the error. Earlier erroneous lines are treated as commented out.'),
    ...[
      ['sb.unlock(k)', 'UK'], ['sbbb.unlock(k)', 'UK'], ['bb.unlock(k)', 'UK'],
      ['sb.unlock(sk)', 'UK'], ['sbbb.unlock(sk)', 'UK'], ['bb.unlock(sk)', 'USK'],
      ['sb.unlock(f)', 'Compile error'], ['sbbb.unlock(f)', 'Compile error'], ['bb.unlock(f)', 'UF'],
      ['((StandardBox) bb).unlock(sk)', 'UK'], ['((StandardBox) sbbb).unlock(sk)', 'UK'],
      ['((BioBox) sb).unlock(sk)', 'Runtime error'],
    ].map(([call, answer], i) => mc(i + 12, call, ['Compile error', 'Runtime error', 'UK', 'USK', 'UF'], ['Compile error', 'Runtime error', 'UK', 'USK', 'UF'].indexOf(answer), T('DMS', 'INHERITANCE', 'JAVA'))),
    mc(24, 'Does bb = (BioBox) sbbb succeed?', ['Yes', 'Compile error', 'Runtime error'], 0, T('DMS', 'INHERITANCE', 'JAVA')),
  ]),
  problem('4', 'Sans (39 pts)', null, [
    text('sans copies an int array without y. ilsans does the same non-destructively for IntList. dilsans removes y from an IntList destructively without new.'),
    java(`static int[] sans(int[] x, int y) {
    int[] first = new int[x.length]; int count = 0;
    for (int i = 0; i < x.length; i++) {
        if (⟪a⟫) { first[count] = x[i]; count++; }
    }
    int[] result = new int[count];
    System.arraycopy(first, 0, result, 0, count);
    return result;
}`, { a: 'x[i] != y' }),
    blank(25, '(a) Copy condition', 'x[i] != y', T('ARRAYS', 'JAVA')),
    java(`static IntList ilsans(IntList x, int y) {
    if (x == null) return null;
    if (⟪a⟫) return ilsans(x.rest, y);
    return ⟪b⟫;
}`, { a: 'x.first == y', b: 'new IntList(x.first, ilsans(x.rest, y))' }),
    blank(26, '(b) Skip condition', 'x.first == y', T('LINKED_LISTS', 'RECURSION')),
    blank(27, '(b) Keep node without changing x', 'new IntList(x.first, ilsans(x.rest, y))', T('LINKED_LISTS', 'RECURSION')),
    java(`static IntList dilsans(IntList x, int y) {
    if (x == null) return null;
    ⟪a⟫;
    if (x.first == y) return ⟪b⟫;
    return x;
}`, { a: 'x.rest = dilsans(x.rest, y)', b: 'x.rest' }),
    blank(28, '(c) Filter the rest', 'x.rest = dilsans(x.rest, y)', T('LINKED_LISTS', 'RECURSION')),
    blank(29, '(c) Return when x is removed', 'x.rest', T('LINKED_LISTS', 'RECURSION')),
    mc(30, '(d) Which JUnit assertion checks sans(new int[]{1,2,2,3}, 2)?', ['assertEquals(new int[]{1,3}, actual)', 'assertArrayEquals(new int[]{1,3}, actual)', 'assertTrue(actual == new int[]{1,3})', 'assertEquals(2, actual)'], 1, T('TESTING', 'ARRAYS')),
    mc(31, '(d) Which pair of assertions checks ilsans(IntList.of(1,2,3), 2) and non-destruction?', ['assertEquals(IntList.of(1,3), actual); assertEquals(IntList.of(1,2,3), x)', 'assertSame(x, actual)', 'assertEquals(IntList.of(1,3), x)', 'assertNull(actual)'], 0, T('TESTING', 'LINKED_LISTS')),
  ]),
  problem('5', 'A Needle in ArrayStack (32 pts)', null, [
    text('ArrayStack doubles its array when full and halves it when less than one-quarter full, never below length 8.'),
    java(`void push(Item x) {
    if (usage_ratio() == 1) resize(size * 2);
    ⟪a⟫;
    ⟪b⟫;
}
Item pop() {
    if (size == 0) return null;
    if (usage_ratio() < 0.25 && items.length > 8) resize(items.length / 2);
    ⟪c⟫;
    Item result = items[size];
    ⟪d⟫;
    return result;
}`, { a: 'items[size] = x', b: 'size += 1', c: 'size -= 1', d: 'items[size] = null' }),
    blank(32, '(a) Store pushed item', 'items[size] = x', T('ARRAYS', 'JAVA')),
    blank(33, '(a) Increase size', ['size += 1', 'size++'], T('ARRAYS', 'JAVA')),
    blank(34, '(a) Decrease size before reading the popped item', ['size -= 1', 'size--'], T('ARRAYS', 'JAVA')),
    blank(35, '(a) Clear unnecessary reference', 'items[size] = null', T('ARRAYS', 'JAVA')),
    text('purge(x) removes all items equal to x, preserving the order of all others. A recursive solution uses only stack operations.'),
    java(`default void purge(Item x) {
    if (size() == 0) return;
    Item top = pop();
    ⟪a⟫;
    if (⟪b⟫) push(top);
}`, { a: 'purge(x)', b: '!x.equals(top)' }),
    blank(36, '(b) Process the rest', 'purge(x)', T('RECURSION', 'ADTS')),
    blank(37, '(b) Keep condition', '!x.equals(top)', T('RECURSION', 'ADTS')),
  ]),
  problem('6', 'Combine (20 pts)', null, [
    text('ComFunc.apply(a,b) combines two ints and is commutative. combine must use every array item. Empty arrays produce 0.'),
    java(`static int combine(ComFunc f, int[] x) {
    if (x.length == 0) return 0;
    if (x.length == 1) return x[0];
    int t = ⟪a⟫;
    return combine(f, x, t, 2);
}
static int combine(ComFunc f, int[] x, int t, int k) {
    if (⟪b⟫) return t;
    t = ⟪c⟫;
    return ⟪d⟫;
}`, { a: 'f.apply(x[0], x[1])', b: 'k == x.length', c: 'f.apply(x[k], t)', d: 'combine(f, x, t, k + 1)' }),
    blank(38, '(a) Combine the first two', 'f.apply(x[0], x[1])', T('ARRAYS', 'RECURSION')),
    blank(39, '(a) Base case', 'k == x.length', T('ARRAYS', 'RECURSION')),
    blank(40, '(a) Add next item to accumulator', ['f.apply(x[k], t)', 'f.apply(t, x[k])'], T('ARRAYS', 'RECURSION')),
    blank(41, '(a) Recursive step', 'combine(f, x, t, k + 1)', T('ARRAYS', 'RECURSION')),
    blank(42, '(b) Implement sumAll using Combine and Add', 'return Combine.combine(new Add(), x)', T('ABSTRACTION', 'JAVA')),
  ]),
  problem('7', 'The Downside of Default (23 pts)', null, [
    text('ListOfInts has size, get, set, and addLast. plusEquals adds corresponding entries if the lists have the same size.'),
    java(`default void plusEquals(ListOfInts x) {
    if (⟪a⟫) return;
    for (int i = 0; i < size(); i++) {
        ⟪b⟫;
    }
}`, { a: 'size() != x.size()', b: 'set(i, get(i) + x.get(i))' }),
    blank(43, '(a) Length check', 'size() != x.size()', T('LISTS', 'JAVA')),
    blank(44, '(a) Update element', ['set(i, get(i) + x.get(i))', 'this.set(i, this.get(i) + x.get(i))'], T('LISTS', 'JAVA')),
    text('DLListOfInts stores a circular sentinel and an IntNode(item,next,prev). Implement plusEquals by walking both lists.'),
    java(`void plusEquals(DLListOfInts x) {
    if (x == null || size() != x.size()) return;
    IntNode xPtr = x.sentinel.next;
    for (IntNode p = sentinel.next; p != sentinel; p = p.next) {
        ⟪a⟫;
        ⟪b⟫;
    }
}`, { a: 'p.item += xPtr.item', b: 'xPtr = xPtr.next' }),
    blank(45, '(b) Add corresponding item', 'p.item += xPtr.item', T('LINKED_LISTS', 'ITERATION')),
    blank(46, '(b) Advance other pointer', 'xPtr = xPtr.next', T('LINKED_LISTS', 'ITERATION')),
    sata(47, '(c) What is wrong with sumOfLists if result is declared ListOfInts result = lists[0], then result.plusEquals(lists[i]) and the method returns DLListOfInts?',
      ['The return type does not match the declared type of result', 'An empty input array causes an index error', 'The method changes lists[0]', 'It always computes the wrong sums for nonempty input'], [0,1,2], T('LISTS', 'ABSTRACTION')),
  ]),
]);
