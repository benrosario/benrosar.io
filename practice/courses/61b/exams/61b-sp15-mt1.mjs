// Spring 2015 Midterm 1: scored questions transcribed from the official solutions.
import { exam, problem, text, java, blank, mc } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...tags) => site(...tags);
export default exam('61b-sp15-mt1', 'Spring 2015 Midterm 1', {
  exam: 'https://drive.google.com/file/d/1nMt8j8oWn0JWOzud6UCNrlg8ozexG-XQ/view',
  sol: 'https://drive.google.com/file/d/1e8Mk1PBRWiKYGdBoauemZ4LTvv0F_MEE/view',
}, 'sp15-mt1', [
  problem('1', 'IntLists (1.5 pts)', null, [
    java(`IntList a = new IntList(5, null);
IntList b = new IntList(9, null);
IntList c = new IntList(1, new IntList(7, b));
a.tail = c.tail;
a.tail.tail = b;
b.tail = c.tail;
IntList d = new IntList(9001, b.tail.tail);
// Print A: d.tail.tail.tail.head
// Print B: a.tail.head
c.tail.tail = c.tail;
// Print C: a.tail.tail.tail.tail.head`),
    blank(1, 'Print A', '9', T('LINKED_LISTS')),
    blank(2, 'Print B', '7', T('LINKED_LISTS')),
    blank(3, 'Print C', '7', T('LINKED_LISTS')),
  ]),
  problem('2', 'The Ole Flitcharoo (3 pts)', null, [
    java(`class Foo { int x, y; Foo(int x, int y) { this.x=x; this.y=y; } }
static void switcheroo(Foo a, Foo b) { Foo temp=a; a=b; b=temp; }
static void fliperoo(Foo a, Foo b) {
    Foo temp=new Foo(a.x,a.y); a.x=b.x; a.y=b.y; b.x=temp.x; b.y=temp.y;
}
static void swaperoo(Foo a, Foo b) {
    Foo temp=a; a.x=b.x; a.y=b.y; b.x=temp.x; b.y=temp.y;
}
Foo foobar=new Foo(10,20), baz=new Foo(30,40);`),
    text('Give foobar and baz as x,y pairs after each call.'),
    blank(4, 'After switcheroo(foobar, baz): foobar', '10,20', T('JAVA')),
    blank(5, 'After switcheroo(foobar, baz): baz', '30,40', T('JAVA')),
    blank(6, 'After fliperoo(foobar, baz): foobar', '30,40', T('JAVA')),
    blank(7, 'After fliperoo(foobar, baz): baz', '10,20', T('JAVA')),
    blank(8, 'After swaperoo(foobar, baz): foobar', '10,20', T('JAVA')),
    blank(9, 'After swaperoo(foobar, baz): baz', '10,20', T('JAVA')),
  ]),
  problem('3', 'IntList Manipulation (5 pts)', null, [
    text('Complete skipBy to return a new list with the first item and then every skip-th item. Assume skip > 0 and no cycles.'),
    java(`if (⟪a⟫) { return ⟪b⟫; }
IntList p = s;
int count = skip;
while (⟪c⟫) { ⟪d⟫ count--; }
return new IntList(⟪e⟫);`),
    ...[['s == null','s == null'],['return null','null'],['loop condition','p != null && count > 0'],['advance p','p = p.tail;'],['new node arguments','s.head, skipBy(skip, p)']].map(([l,a],i)=>blank(13+i,l,a,T('LINKED_LISTS'))),
  ]),
  problem('4', 'Debugging (7 pts)', null, [
    text('(a) Explain in 10 words or fewer why flavor prints Chocolate. After uncommenting chocolate.melt() and the second print, will it compile and what prints?'),
    java(`static String flavor;
IceCream vanilla = new IceCream("Vanilla");
IceCream chocolate = new IceCream("Chocolate");
System.out.println(vanilla.flavor);
chocolate.melt();
System.out.println(vanilla.flavor);`),
    mc(18,'(a) Why does vanilla.flavor print Chocolate?', ['flavor is static, so both instances share its latest value', 'vanilla was constructed after chocolate', 'melt changes every string', 'the compiler swaps the two references'], 0, T('JAVA')),
    blank(19,'(a) Compiles?','yes',T('JAVA')),
    blank(20,'(a) Second output','melted Chocolate',T('JAVA')),
    text('(b) In each case, x and y begin as two distinct int[] objects, each containing 0, 1, 2, 3, 4. Answer true, false, or not enough information.'),
    java(`y = someUnknownFunction(x, y); System.out.println(x == y);`),
    blank(21,'(b) After assignment from unknown function','not enough information',T('JAVA','ARRAYS')),
    java(`anotherUnknownFunction(x, y); System.out.println(x == y);`),
    blank(22,'(b) After passing arrays to unknown function','false',T('JAVA','ARRAYS')),
    java(`System.arraycopy(x, 0, y, 0, 5); System.out.println(x == y);`),
    blank(23,'(b) After System.arraycopy','false',T('JAVA','ARRAYS')),
    text('(c) Give a test scenario that exposes the bug in this SentinelSSList implementation, then identify the bug.'),
    java(`SentinelSSList() { sent = new StringNode(null, null); }
SentinelSSList(String x) { sent = new StringNode(x, null); }
String getFront() { if (sent.next == null) return null; return sent.next.item; }`),
    mc(24,'(c) Which test exposes the constructor bug?', ['Construct with one string and check that getFront returns it', 'Construct an empty list and check its size', 'Call getFront twice on an empty list', 'Compare two unrelated lists'], 0, T('LINKED_LISTS')),
    mc(25,'(c) What is the bug?', ['The constructor stores x in the sentinel instead of its next node', 'getFront must return the sentinel itself', 'The list needs two sentinels', 'The constructor should set x to null'], 0, T('LINKED_LISTS')),
  ]),
  problem('5', 'Bits (3 pts)', null, [
    java(`int mystery(int a) {
    int b=0;
    for (int i=0; i<32; i++) {
        b=b<<1; b=b|(a&1); a=a>>>1;
    }
    return b;
}`),
    mc(10, 'What does mystery return?', ['The number of 1 bits', 'The bits of a in reverse order', 'The two’s complement of a', 'a shifted left 32 places'], 1, T('BITS')),
  ]),
  problem('7', 'Higher Order Functions and Arrays (8 pts)', null, [
    text('Replace each interior cell with the longest string among its eight neighbors and itself. Edges are null and must remain null. Assume at least 3 rows and columns, equal row lengths, but not necessarily a square array. The comparator treats null as less than any String.'),
    text('(a) Complete a null-safe length comparator.'),
    java(`class LengthComparator implements NullSafeStringComparator {
  public int compare(String s1, String s2) {
    if (s1 == null && s2 == null) return ⟪a⟫;
    if (s1 == null) return ⟪b⟫;
    if (s2 == null) return ⟪c⟫;
    return ⟪d⟫;
  }
}`),
    ...[['both null','0'],['s1 null','-1'],['s2 null','1'],['compare lengths','s1.length() - s2.length()']].map(([l,a],i)=>blank(26+i,`(a) ${l}`,a,T('JAVA'))),
    text('(b) Complete max, which returns the maximum element according to sc.'),
    java(`String maxStr = a[0];
for (⟪a⟫; ⟪b⟫; i += 1) {
  if (⟪c⟫) { ⟪d⟫ }
}
return maxStr;`),
    ...[['loop initialization','int i = 0'],['loop condition','i < a.length'],['comparison','sc.compare(a[i], maxStr) > 0'],['update','maxStr = a[i];']].map(([l,a],i)=>blank(30+i,`(b) ${l}`,a,T('JAVA'))),
    text('(c) Complete step. The 3-by-3 neighborhood includes the cell itself, for nine values total. Do not use ++ or --.'),
    java(`String[][] stepped = new String[⟪a⟫][⟪b⟫];
for (int i = ⟪c⟫; ⟪d⟫; i += 1) {
  for (int j = ⟪e⟫; j < ⟪f⟫; j += 1) {
    String[] neighbors = ⟪g⟫;
    int count = ⟪h⟫;
    for (int k = -1; k <= 1; k += 1) {
      for (int m = -1; m <= 1; m += 1) {
        ⟪i⟫
        ⟪j⟫
      }
    }
    ⟪k⟫
  }
}`),
    ...[['rows','arr.length'],['columns','arr[0].length'],['first i','1'],['i bound','i < arr.length - 1'],['first j','1'],['j bound','arr[0].length - 1'],['allocate neighbors','new String[9]'],['initialize count','0'],['store neighbor','neighbors[count] = arr[i + k][j + m];'],['increment count','count += 1;'],['select maximum','stepped[i][j] = max(neighbors, new LengthComparator());']].map(([l,a],i)=>blank(34+i,`(c) ${l}`,a,T('JAVA','ARRAYS'))),
  ]),
  problem('8', 'A Robot Renegade Cop (5 pts)', null, [
    text('For each print line give its output or INVALID if it does not compile. For lines 6 and 9 answer “no cast” if none is needed; otherwise give the cast.'),
    java(`class Robot { int energy=0; String className="Robot";
  void enervate(Robot r) { r.energy -= 5; }
  void reportEnergy() { System.out.println(energy); }
  void reportName() { System.out.println(className); }
}
interface Police { void detain(); }
class Robocop extends Robot implements Police {
  String className="Robocop";
  public void detain() { System.out.println("halt. citizen."); }
  @Override void enervate(Robot r) { r.energy -= 20; }
  @Override void reportEnergy() { System.out.println(energy); }
  @Override void reportName() { System.out.println(className); }
}
Robocop rCop = new Robocop();
rCop.reportEnergy(); //4   rCop.detain(); //5
Robot r = (cast) rCop; //6
r.reportEnergy(); //7  r.detain(); //8
Police p = (cast) rCop; //9
p.reportEnergy(); //10  p.detain(); //11
r.enervate(r); rCop.enervate(r); rCop.reportEnergy(); //12
r.energy = 100;
r.enervate(rCop); rCop.enervate(rCop); r.reportEnergy(); //14
r.reportName(); //15  rCop.reportName(); //16
rCop.className = "ketchup friend";
r.reportName(); //18`),
    ...[['4 output','0'],['5 output','halt. citizen.'],['6 cast','no cast'],['7 output','0'],['8 result','INVALID'],['9 cast','no cast'],['10 result','INVALID'],['11 output','halt. citizen.'],['12 output','-40'],['14 output','60'],['15 output','Robocop'],['16 output','Robocop'],['18 output','ketchup friend']].map(([l,a],i)=>blank(45+i,l,a,T('JAVA','INHERITANCE'))),
  ]),
  problem('9', 'Static Shock (2 pts)', null, [
    java(`class Shock {
    static int bang; static Shock baby;
    Shock() { this.bang=100; }
    Shock(int num) { this.bang=num; baby=starter(); this.bang+=num; }
    static Shock starter() { return new Shock(); }
    static void shrink(Shock s) { s.bang-=1; }
    public static void main(String[] args) {
        Shock gear=new Shock(200);
        System.out.println(gear.bang); // A
        shrink(gear); shrink(starter());
        System.out.println(gear.bang); // B
    }
}`),
    blank(11, 'Print A', '300', T('JAVA')),
    blank(12, 'Print B', '99', T('JAVA')),
  ]),
]);
