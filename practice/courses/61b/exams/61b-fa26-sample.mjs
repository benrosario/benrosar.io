// Original practice written by this site so the CS 61B course builds before its past exams are transcribed.
// These are not past exam questions or staff predictions.
import { exam, problem, text, java, blank, mc } from '../../../content/author.mjs';
const tags = (...t) => [{n:'',t,by:'site'}];
const help = (x, ...hints) => ({x,hints,explanationBy:'site'});
const e = exam('61b-fa26-sample', 'Sample CS 61B practice', null, null, [
  problem('1', 'Two kinds of equal', tags('EQUALS'), [
    text('What does this code print? Write each printed line in its blank.'),
    java(`
String a = new String("cat");
String b = new String("cat");
System.out.println(a == b);       // ⟪a⟫
System.out.println(a.equals(b));  // ⟪b⟫`, {a:'false',b:'true'}),
    blank(1,'(a) What does the first line print?','false',help('new String always makes a new object, so a and b point to different objects and == compares those addresses.','== on objects compares references, not contents.','Did either line reuse an existing object?')),
    blank(2,'(b) What does the second line print?','true',help('String.equals compares the characters, and both strings are "cat".','equals compares what the objects contain.','What does String override equals to do?')),
  ]),
  problem('2', 'Doubling loop', tags('ASYMPTOTICS'), [
    text('Give the tightest bound on the runtime of f in terms of N.'),
    java(`
static int f(int N) {
    int count = 0;
    for (int i = 1; i < N; i *= 2) {
        for (int j = 0; j < i; j += 1) {
            count += 1;
        }
    }
    return count;
}`),
    mc(3,'What is the runtime of f(N)?',['Θ(log N)','Θ(N)','Θ(N log N)','Θ(N²)'],1,help('The inner loop runs 1 + 2 + 4 + … + (a power of 2 below N) times. That geometric sum is less than 2N, so the work is Θ(N).','Count the total inner-loop iterations instead of multiplying the two loop counts.','Add up i over every value i takes.')),
  ]),
  problem('3', 'Weighted quick union', tags('DISJOINT_SETS'), [
    text('A weighted quick union (union by size, no path compression) holds N items.'),
    mc(4,'What is the tightest bound on the height of its tallest tree in the worst case?',['Θ(1)','Θ(log N)','Θ(√N)','Θ(N)'],1,help('An item’s depth grows only when its tree is linked under a tree at least as large, which at least doubles the size of its tree. That can happen at most log₂ N times.','Think about what happens to the size of an item’s tree each time the item gets deeper.','How many times can a size double before it passes N?')),
  ]),
  problem('4', 'Min-heap insertion', tags('HEAPS'), [
    text('A min-heap is stored in an array starting at index 1 (index 0 is unused). Its items, from index 1 on, are 1, 3, 2, 7, 4.'),
    blank(5,'Insert 0. List the heap’s items from index 1 on, separated by commas.',['0, 3, 1, 7, 4, 2','[0, 3, 1, 7, 4, 2]'],help('0 goes in at index 6. Its parent (index 3) holds 2, so they swap; then its parent (index 1) holds 1, so they swap again. The heap is now 0, 3, 1, 7, 4, 2.','A new item goes at the end, then swims up while it’s smaller than its parent.','The parent of index k is index k / 2.')),
  ]),
]);
e.src = {site:true};
for (const p of e.p) p.authored = true;
export default e;
