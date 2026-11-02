// Spring 2019 Midterm 1: selected questions from the official solutions.
import { exam, problem, text, java, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';
const E = '61b-sp19-mt1', S = (...labels) => staff(E, ...labels);
export default exam(E, 'Spring 2019 Midterm 1', {
  exam: 'https://drive.google.com/file/d/1kTHkeOf-TnvIsllJU5GRF-GjdMhuq_2L/view',
  sol: 'https://drive.google.com/file/d/14EBdd8SO_vt7oEBNJnK5EHB2DGtoBfbt/view',
}, 'sp19-mt1', [
  problem('1', 'Static Swap (24 pts)', null, [
    java(`class StaticSwap {
    static int staticX=5, staticY=10;
    static void swap(int x,int y) { int temp=x; x=y; y=temp; }
    static void staticSwap(int x,int y) {
        int temp=staticX; staticX=staticY; staticY=temp;
    }
    public static void main(String[] args) {
        int a=5,b=10;
        swap(a,b); // A
        swap(staticX,staticY); // B
        staticSwap(a,b); // C
        staticSwap(staticX,staticY); // D
    }
}`),
    text('For each call, select every variable whose value changes.'),
    ...[['A',[4]],['B',[4]],['C',[2,3]],['D',[2,3]]].map(([l,a],i)=>sata(i+1,`(a) Call ${l}`,['a','b','staticX','staticY','none'],a,S('1a'))),
    text('Part (b) changes every int field and parameter to String. The swap and staticSwap bodies otherwise stay the same. Which variables change?'),
    ...[['A',[4]],['B',[4]],['C',[2,3]],['D',[2,3]]].map(([l,a],i)=>sata(i+5,`(b) Call ${l}`,['a','b','staticX','staticY','none'],a,S('1b'))),
  ]),
  problem('2', 'JUnit and equals (24 pts)', null, [
    java(`class Dog {
    int size; List<String> favoriteFoods;
    Dog(int s,List<String> f) { size=s; favoriteFoods=f; }
    public boolean equals(Dog o) {
        if (this.size != o.size) return false;
        if (this.favoriteFoods != o.favoriteFoods) return false;
        return true;
    }
}`),
    text('assertEquals(D1,D2) takes Object arguments and calls expected.equals(actual). Both Dogs have size 5 and separately created ["banana", "tofu"] lists.'),
    mc(9, 'Why does the test fail even though the Dogs print alike?', ['equals(Dog) overloads rather than overrides equals(Object)', 'The compiler cannot create two Dogs', 'JUnit cannot compare lists', 'size must be static'], 0, S('2')),
    mc(10, 'What should the implementation do before casting the Object argument to Dog?', ['Check it is non-null and a Dog', 'Call hashCode', 'Compare the class names as strings', 'Nothing'], 0, S('2')),
    mc(11, 'How should the favoriteFoods lists be compared?', ['With ==', 'With equals', 'By comparing only their sizes', 'By toString identity'], 1, S('2')),
  ]),
  problem('4', 'More JUnit (35 pts)', null, [
    text('equalLists checks whether an AList and any List61B contain equal items in the same order. Part (a) asks for a JUnit test using an SLList of length three.'),
    java(`SLList<Integer> sll = new SLList<>();
sll.addLast(1); sll.addLast(2); sll.addLast(3);
AList<Integer> all = new AList<>();
all.addLast(1); all.addLast(2); all.addLast(3);
⟪a⟫;`, { a: 'assertTrue(all.equalLists(sll))' }),
    blank(12, '(a) Assert the two lists compare equal', 'assertTrue(all.equalLists(sll))', S('4a')),
    java(`public boolean equalLists(List61B<T> otherList) {
    if (⟪a⟫) return false;
    if (⟪b⟫) return false;
    for (int i = 0; i < this.size; i++) {
        if (⟪c⟫) return false;
    }
    return true;
}`, { a: 'otherList == null', b: 'this.size != otherList.size()', c: '!this.get(i).equals(otherList.get(i))' }),
    blank(13, '(b) Null check', 'otherList == null', S('4b')),
    blank(14, '(b) Size check', ['this.size != otherList.size()', 'size != otherList.size()'], S('4b')),
    blank(15, '(b) Item mismatch', ['!this.get(i).equals(otherList.get(i))', '!get(i).equals(otherList.get(i))'], S('4b')),
  ]),
  problem('5', 'Recursive SLList insertion (40 pts)', null, [
    text('The list has a sentinel. Insert item at index without any loop.'),
    java(`public void insert(T item, int index) {
    if (⟪a⟫) throw new IllegalArgumentException();
    insert(item, index, sentinel);
    ⟪b⟫;
}
private void insert(T item, int index, Node n) {
    if (index == 0) {
        ⟪c⟫;
    } else {
        ⟪d⟫;
    }
}`, { a: 'index < 0 || index > size()', b: 'size += 1', c: 'n.next = new Node(item, n.next)', d: 'insert(item, index - 1, n.next)' }),
    blank(16, 'Invalid index condition', 'index < 0 || index > size()', S('5')),
    blank(17, 'Update size', ['size += 1', 'size++'], S('5')),
    blank(18, 'Base case insertion', 'n.next = new Node(item, n.next)', S('5')),
    blank(19, 'Recursive step', 'insert(item, index - 1, n.next)', S('5')),
  ]),
  problem('6', 'IntXList (55 pts)', null, [
    text('IntXList stores an array of IntSLLists, each holding at most four integers. addLast uses the first list with room.'),
    java(`public void addLast(int x) {
    if (⟪a⟫) resize(items.length * 2);
    ⟪b⟫;
    ⟪c⟫;
}`, { a: 'size == items.length * 4', b: 'items[size / 4].addLast(x)', c: 'size += 1' }),
    blank(20, '(a) Full capacity condition', 'size == items.length * 4', S('6a')),
    blank(21, '(a) Choose the inner list', 'items[size / 4].addLast(x)', S('6a')),
    blank(22, '(a) Update size', ['size += 1', 'size++'], S('6a')),
    java(`private void resize(int numSLLists) {
    IntSLList[] temp = new IntSLList[numSLLists];
    for (int i = 0; i < items.length; i++) ⟪a⟫;
    for (int i = items.length; i < numSLLists; i++) ⟪b⟫;
    ⟪c⟫;
}`, { a: 'temp[i] = items[i]', b: 'temp[i] = new IntSLList()', c: 'items = temp' }),
    blank(23, '(b) Preserve existing inner list', 'temp[i] = items[i]', S('6b')),
    blank(24, '(b) Create new inner list', 'temp[i] = new IntSLList()', S('6b')),
    blank(25, '(b) Replace outer array', 'items = temp', S('6b')),
  ]),
  problem('7', 'Yeah One of These Problems (28 pts)', null, [
    java(`class Deity {
    void smite(Object o) { System.out.println("DO"); }
    void smite(Deity o) { System.out.println("DD"); }
    void smite(Titan o) { System.out.println("DT"); }
}
class Titan extends Deity {
    void smite(Object o) { System.out.println("TO"); }
    void smite(Deity o) { System.out.println("TD"); }
    void smite(Titan o) { System.out.println("TT"); }
}
Titan T = new Titan(); Deity D = new Deity(); Deity Colette = new Titan();`),
    ...[
      ['T.smite(Colette)', 'TD'], ['T.smite((Deity) Colette)', 'TD'], ['T.smite(D)', 'TD'],
      ['T.smite((Object) D)', 'TO'], ['((Deity) T).smite(D)', 'TD'],
      ['T.smite((Titan) D)', 'Runtime error'], ['((Object) T).smite(D)', 'Compile error'],
    ].map(([call, result], i) => mc(26 + i, call, ['DO','DD','DT','TO','TD','TT','Runtime error','Compile error'], ['DO','DD','DT','TO','TD','TT','Runtime error','Compile error'].indexOf(result), S('7'))),
  ]),
  problem('8', 'MetaComparison (55 pts)', null, [
    text('Compare corresponding IntList items with givenC, ignoring extra items in the longer list. Return a negative value if more x items compare less than y, a positive value if more compare greater, or zero on a tie.'),
    java(`public int compare(IntList x, IntList y) {
    if (⟪a⟫) return 0;
    int v = givenC.compare(x.first, y.first);
    if (v > 0) return ⟪b⟫;
    else if (v < 0) return ⟪c⟫;
    else return ⟪d⟫;
}`, { a: 'x == null || y == null', b: 'compare(x.rest, y.rest) + 1', c: 'compare(x.rest, y.rest) - 1', d: 'compare(x.rest, y.rest)' }),
    blank(33, 'Stop at the end of either list', ['x == null || y == null', 'y == null || x == null'], S('8')),
    blank(34, 'Positive comparison branch', 'compare(x.rest, y.rest) + 1', S('8')),
    blank(35, 'Negative comparison branch', 'compare(x.rest, y.rest) - 1', S('8')),
    blank(36, 'Equal comparison branch', 'compare(x.rest, y.rest)', S('8')),
  ]),
  problem('9', 'Cool Iterators (58 pts)', null, [
    java(`class CoolIterator implements Iterator<Integer> {
    IntList L;
    CoolIterator(IntList input) { L = input; }
    boolean hasNext() { return L != null; }
    IntList getNext(int x, IntList p) {
        if (p == null) return null;
        if (x == 0) return p;
        return getNext(x - 1, p.rest);
    }
    Integer next() {
        int first = L.first;
        L = getNext(L.first, L);
        return first;
    }
}
IntList L = IntList.of(1,2,3,4,5,6,7,8,9);
CoolIterator ci = new CoolIterator(L);
while (ci.hasNext()) System.out.print(ci.next());`),
    blank(37, '(a) Printed output', '1248', S('9a')),
    text('BookendIterator wraps another iterator with at least two values. It yields only its first and last values.'),
    java(`class BookendIterator<T> implements Iterator<T> {
    T[] arr = (T[]) new Object[2]; int index = 0;
    BookendIterator(Iterator<T> input) {
        arr[0] = ⟪a⟫;
        while (input.hasNext()) ⟪b⟫;
    }
    public boolean hasNext() { return ⟪c⟫; }
    public T next() {
        if (!hasNext()) throw new NoSuchElementException();
        T val = ⟪d⟫;
        ⟪e⟫;
        return val;
    }
}`, { a: 'input.next()', b: 'arr[1] = input.next()', c: 'index < 2', d: 'arr[index]', e: 'index++' }),
    blank(38, '(b) Store first value', 'input.next()', S('9b')),
    blank(39, '(b) Keep replacing last value', 'arr[1] = input.next()', S('9b')),
    blank(40, '(b) hasNext', 'index < 2', S('9b')),
    blank(41, '(b) Yield value', 'arr[index]', S('9b')),
    blank(42, '(b) Advance', ['index++', 'index += 1'], S('9b')),
  ]),
]);
