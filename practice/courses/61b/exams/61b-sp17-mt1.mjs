// Spring 2017 Midterm 1: scored questions from the official exam and solutions.
import { exam, problem, text, java, blank, mc, sata, txt } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...tags) => site(...tags);
const F = ['F1', 'F2', 'F3', 'F4', 'Impossible'];
export default exam('61b-sp17-mt1', 'Spring 2017 Midterm 1', {
  exam: 'https://drive.google.com/file/d/12KqULT9XIb3KHQqOdGQprsKELYTrAXN5/view',
  sol: 'https://drive.google.com/file/d/15Vnd9z34Wlp-D9boc4ZezgpyH_ul65qZ/view',
}, 'sp17-mt1', [
  problem('1', 'Pass By Value (4.5 pts)', null, [
    java(`static void swap(int x, int y) { int temp=y; y=x; x=temp; System.out.println(x); }
static void swap(int[] x, int[] y) { int[] temp=y; y=x; x=temp; System.out.println(x[0]); }
int x1=42, y1=12;
swap(x1,y1); // A
System.out.println(x1); // B
System.out.println(y1); // C
int[] x2={1,2,3}, y2={4,5,6};
swap(x2,y2); // D
System.out.println(x2[0]); // E
System.out.println(y2[0]); // F
x2=new int[]{1,2,3}; y2=new int[]{4,5,6};
swap(x2[0],y2[0]); // G
System.out.println(x2[0]); // H
System.out.println(y2[0]); // I`),
    ...[['A','12'],['B','42'],['C','12'],['D','4'],['E','1'],['F','4'],['G','4'],['H','1'],['I','4']].map(([l,a],i)=>blank(i+1,`Print ${l}`,a,T('JAVA','ARRAYS'))),
  ]),
  problem('2', 'The Return of Pass By Value (7 pts)', null, [
    text('IntList5000 has fields rest, primitive, reference, and static slogan. Its constructor assigns them from its arguments.'),
    java(`static void disenturbulate(IntList5000 p) {
    p.primitive=5000; p.reference=new Integer(1000);
    p=new IntList5000(null,5,10,"relax");
}
void indoctrinate(int b) { b=0; this.rest.primitive=b; }
void integrate(Integer v) { this.reference=v; v=new Integer(10); }
IntList5000 x=new IntList5000(null,100,new Integer(7),"live");
IntList5000 y=new IntList5000(x,9,x.reference,"eat");
System.out.println(y.primitive); // A
System.out.println(y.reference); // B
disenturbulate(y);
System.out.println(y.primitive); // C
System.out.println(y.reference); // D
y.indoctrinate(100);
System.out.println(x.primitive); // E
x.integrate(new Integer(200));
System.out.println(x.reference); // F
System.out.println(IntList5000.slogan); // G`),
    ...[['A','9'],['B','7'],['C','5000'],['D','1000'],['E','0'],['F','200'],['G','relax']].map(([l,a],i)=>blank(i+10,`Print ${l}`,a,T('JAVA','LINKED_LISTS'))),
  ]),
  problem('3', 'Potpourri (6 pts)', null, [
    text('Assume Cat and Dog are subclasses of Animal. All three classes have default constructors. Consider each assignment independently.'),
    ...[
      ['Cat c = new Animal();','Compilation error'], ['Animal a = new Cat();','Runs fine'],
      ['Dog d = new Cat();','Compilation error'], ['Animal a = (Cat) new Cat();','Runs fine'],
      ['Dog d = (Dog) new Animal();','Runtime error'],
    ].map(([code,answer],i)=>[java(code),mc(20+i,`Result for ${code}`,['Compilation error','Runtime error','Runs fine'],{'Compilation error':0,'Runtime error':1,'Runs fine':2}[answer],T('JAVA','INHERITANCE'))]),
    text('Select each item that makes javac abort compilation.'),
    sata(25,'Compile-time errors',['Missing semicolon at end of statement','Division by an int variable whose value may be zero','Attempting to instantiate a generic array as new T[10], where T is a type parameter','Accessing x[i] when x has length 3 and i is 10','Missing return type for a static method'],[0,2,4],T('JAVA')),
    text('Omid sets a breakpoint on the call to f, reaches it, then clicks “Step Over” exactly once. Write the output, including what printed before the breakpoint.'),
    java(`public static void f() {
  System.out.println(2);
  System.out.println(3);
}
public static void main(String[] args) {
  System.out.println(1);
  f(); // BREAKPOINT
  System.out.println(4);
}`),
    ...['1','2','3'].map((a,i)=>blank(26+i,`Output line ${i+1}`,a,T('JAVA'))),
    mc(29, 'Does the final println(4) run after that single Step Over?', ['Yes', 'No'], 1, T('JAVA')),
  ]),
  problem('4','Flirbocon (12 pts)',null,[
    text('Assume Falcon extends Bird, and the following declarations are in scope:'),
    java(`Bird bird = new Falcon();
Falcon falcon = (Falcon) bird;`),
    text('All methods are instance methods. F1: Bird::gulgate(Bird); F2: Bird::gulgate(Falcon); F3: Falcon::gulgate(Bird); F4: Falcon::gulgate(Falcon).'),
    ...[
      ['For bird.gulgate(bird), which individual features alone let the call compile?',['F1']],
      ['For bird.gulgate(bird), which set makes Bird::gulgate(Bird) execute?',['F1']],
      ['For bird.gulgate(bird), which set makes Falcon::gulgate(Bird) execute?',['F1','F3']],
      ['For falcon.gulgate(falcon), which individual features alone let the call compile?',['F1','F2','F3','F4']],
      ['For falcon.gulgate(falcon), which set makes Bird::gulgate(Bird) execute?',['F1']],
      ['For falcon.gulgate(falcon), which set makes Bird::gulgate(Falcon) execute?',['F2']],
      ['For falcon.gulgate(falcon), which set makes Falcon::gulgate(Bird) execute?',['F3']],
      ['For falcon.gulgate(falcon), which set makes Falcon::gulgate(Falcon) execute?',['F4']],
    ].map(([label,a],i)=>sata(30+i,label,F,a.map(x=>F.indexOf(x)),T('JAVA','INHERITANCE'))),
  ]),
  problem('5','Hoffery (8 pts)',null,[
    text('UnaryFunction<T> has T apply(T x). A Spy wraps a UnaryFunction, returns its result, remembers arguments in order, and prints the history without destroying it. Assume ArrayDeque supports addLast and printDeque.'),
    java(`public class Spy<T> ⟪a⟫ {
  ArrayDeque<T> history;
  UnaryFunction<T> function;
  public Spy(UnaryFunction<T> function) {
    this.history = ⟪b⟫;
    this.function = function;
  }
  @Override
  public T apply(T x) {
    ⟪c⟫
    ⟪d⟫
  }
  public void printArgumentHistory() {
    ⟪e⟫
  }
}`),
    ...[['Interface declaration','implements UnaryFunction<T>'],['Construct history','new ArrayDeque<>()'],['Record argument','history.addLast(x);'],['Return wrapped result','return function.apply(x);'],['Print argument history','history.printDeque();']].map(([l,a],i)=>blank(40+i,l,a,T('JAVA'))),
    text('After applying the spy to 5, 2, and 3, each printArgumentHistory call prints “5 2 3 ”.'),
  ]),
  problem('6','Skippify (12 pts)',null,[
    text('Complete IntList.skippify. Starting with n = 1, keep the current node, skip n nodes after it, then advance to the next kept node and increment n. Stop when there are no more nodes to skip.'),
    java(`public void skippify() {
  IntList p = this;
  int n = 1;
  while (p != null) {
    IntList next = ⟪a⟫;
    for (int i = 0; ⟪b⟫; i += 1) {
      if (⟪c⟫) { break; }
      next = ⟪d⟫;
    }
    ⟪e⟫
    ⟪f⟫
    ⟪g⟫
  }
}`),
    ...[['Initialize next','p.rest'],['Loop n times','i < n'],['Stop at end','next == null'],['Advance next','next.rest'],['Unlink skipped nodes','p.rest = next;'],['Advance p','p = p.rest;'],['Increment skip count','n++;']].map(([l,a],i)=>blank(50+i,l,a,T('JAVA','LINKED_LISTS'))),
    text('A = (1,2,3,4,5,6,7,8,9,10) should become (1,3,6,10). B = (9,8,7,6,5,4,3,2,1) should become (9,7,4). Complete this JUnit test.'),
    java(`@Test
public void testSkippify() {
  IntList A = IntList.list(1,2,3,4,5,6,7,8,9,10);
  IntList B = IntList.list(9,8,7,6,5,4,3,2,1);
  IntList expectedA = ⟪h⟫
  IntList expectedB = ⟪i⟫
  ⟪j⟫
  ⟪k⟫
  ⟪l⟫
  ⟪m⟫
}`),
    ...[['Expected A','IntList.list(1,3,6,10);'],['Expected B','IntList.list(9,7,4);'],['Skippify A','A.skippify();'],['Skippify B','B.skippify();'],['Assert A','assertEquals(expectedA, A);'],['Assert B','assertEquals(expectedB, B);']].map(([l,a],i)=>blank(57+i,l,a,T('JAVA','TESTING'))),
  ]),
  problem('8','Dedup (8 pts)',null,[
    text('Given a sorted linked list, destructively remove duplicates. For example, 1 → 2 → 2 → 2 → 3 becomes 1 → 2 → 3.'),
    java(`public static void removeDuplicates(IntList p) {
  if (⟪a⟫) { return; }
  IntList current = ⟪b⟫;
  IntList previous = ⟪c⟫;
  while (⟪d⟫) {
    if (current.first == ⟪e⟫) {
      previous.rest = ⟪f⟫;
    } else {
      ⟪g⟫
    }
    ⟪h⟫
  }
}`),
    ...[['Empty list','p == null'],['Initialize current','p.rest'],['Initialize previous','p'],['Loop condition','current != null'],['Compare values','previous.first'],['Skip duplicate','current.rest'],['Advance previous for new value','previous = current;'],['Advance current','current = current.rest;']].map(([l,a],i)=>blank(70+i,l,a,T('JAVA','LINKED_LISTS'))),
  ]),
  problem('9','Interfaces (8 pts)',null,[
    text('Add a default Deque method remove(Item x) that removes every item equal to x and returns true if anything was removed. Do not use new. Compare with equals, handling null. Only one statement per line.'),
    java(`default boolean remove(Item x) {
  int length = ⟪a⟫;
  for (int i = 0; i < ⟪b⟫; i++) {
    Item first = ⟪c⟫;
    if (⟪d⟫) {
      ⟪e⟫
    }
  }
  return ⟪f⟫;
}`),
    ...[['Original size','size()'],['Loop bound','length'],['Remove front','removeFirst()'],['Keep condition','!(first == x || (first != null && first.equals(x)))'],['Restore nonmatching item','addLast(first);'],['Return whether anything was removed','length != size()']].map(([l,a],i)=>blank(80+i,l,a,T('JAVA','DEQUES'))),
  ]),
  problem('10','Grid (14 pts)',null,[
    text('ArrayGrid uses int[][] nums plus logical rows and cols. Its constructor allocates twice the requested capacity. resize(r,c) changes backing dimensions while preserving entries. Complete addRow and rotateColumn.'),
    java(`public void addRow(int[] row) {
  if (⟪a⟫) {
    resize(⟪b⟫, ⟪c⟫);
  }
  System.arraycopy(row, 0, nums[rows], 0, cols);
  ⟪d⟫
}`),
    ...[['Capacity full?','rows >= nums.length'],['New row capacity','nums.length * 2'],['Preserve column capacity','nums[0].length'],['Increment logical rows','rows++;']].map(([l,a],i)=>blank(90+i,l,a,T('JAVA','ARRAYS'))),
    java(`public void rotateColumn(int c, int x) {
  int[] copy = ⟪e⟫;
  for (int i = 0; ⟪f⟫; i++) {
    ⟪g⟫
  }
}`),
    ...[['Copy original column','getColCopy(c)'],['Visit every logical row','i < rows'],['Write downward with wraparound','nums[(i + x) % rows][c] = copy[i];']].map(([l,a],i)=>blank(94+i,l,a,T('JAVA','ARRAYS'))),
    text('Start with a 3×3 zero grid, add column [1,2,3], then add row [4,5,6,7]. Rotate column 2 down 1, then column 3 down 3. Complete the final printed grid.'),
    txt(`Before rotations (line 4):
0 0 0 1
0 0 0 2
0 0 0 3
4 5 6 7

After rotations (line 7):
⟪h⟫
⟪i⟫
⟪j⟫
⟪k⟫`),
    ...[['Final row 1','0 0 6 2'],['Final row 2','0 0 0 3'],['Final row 3','0 0 0 7'],['Final row 4','4 5 0 1']].map(([l,a],i)=>blank(97+i,l,a,T('JAVA','ARRAYS'))),
  ]),
]);
