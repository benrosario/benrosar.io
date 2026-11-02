// Spring 2015 Final: scored questions transcribed from the exam and official solutions.
// Several drawn responses are represented as equivalent checkable descriptions or choices.
import { exam, problem, text, java, txt, blank, mc } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...tags) => site(...tags);
const note = x => ({ x });
export default exam('61b-sp15-final', 'Spring 2015 Final', {
  exam: 'https://drive.google.com/file/d/1KWp6A4QwPCTTnrSe6U9esjt_yqwpfmne/view',
  sol: 'https://drive.google.com/file/d/1EedyBzOq87mc3DzWlY5LydVkC2QO8ufq/view',
}, 'sp15-final', [
  problem('1', 'Basic Operations (6 pts)', null, [
    text('Graph edges (label: endpoints, weight): A: 0–1,1; B: 0–2,4; C: 0–3,1; D: 2–1,2; E: 1–4,3; F: 1–3,4; G: 2–3,1; H: 3–4,5. Give the edges selected in order.'),
    blank(1,'(a) Kruskal MST edge labels, comma-separated','A,C,G,D,E',T('SHORTEST_PATHS')),
    blank(2,'(b) Prim MST edge labels from vertex 3','C,G,A,E',T('SHORTEST_PATHS')),
    text('(c) Partition [4,1,6,2,3,7,3,4] around its leftmost item as pivot; any valid partitioning scheme is acceptable.'),
    blank(3,'One valid partitioned array','1,2,3,3,4,7,6,4',T('SORTING')),
    text('(d) Sinking-based heapify [1,2,4,9,3,7,5] into a max heap.'),
    blank(4,'Resulting array','9,3,7,2,1,4,5',T('HEAPS')),
  ]),
  problem('2','Basic Operations Turbo Edition (3 pts)',null,[
    text('(a) Give a binary tree with preorder and inorder A,B,C,D,E. Any valid tree accepted by describing its shape.'),
    mc(5,'Which tree is valid?', ['A with right child B, B with right child C, C with right child D, D with right child E','A with left child B, B with left child C, C with left child D, D with left child E','Root C, left subtree A(B), right subtree D(E)','Root E with left chain D,C,B,A'],0,T('TREE_TRAVERSALS')),
    text('(b) Give directed edges for a graph with DFS preorder A,B,C,D,E and postorder C,B,D,E,A; ties alphabetically.'),
    blank(6,'One valid edge set (semicolon-separated)','A->B;A->D;A->E;B->C',T('SHORTEST_PATHS')),
  ]),
  problem('3','Best and Worst (4.5 pts)',null,[
    blank(7,'(a) Worst-case insertion sort input of five integers','5,4,3,2,1',T('SORTING')),
    blank(8,'(b) A minimum-height BST insertion order for A through G','D,B,F,A,C,E,G',T('BSTS')),
    blank(9,'(c) Worst-case amortized operation cost for the described resize policy, in terms of maximum capacity N','Theta(N)',T('ASYMPTOTICS')),
  ]),
  problem('4','Comparative Data Structures and Algorithms (7.5 pts)',null,[
    blank(10,'(a) Largest size of a binary min heap that is also a BST','1',T('HEAPS','BSTS')),
    blank(11,'(b) Largest size of a binary max heap that is also a BST','2',T('HEAPS','BSTS')),
    blank(12,'(c) Largest min-heap where the fifth-largest item is a child of the root','13',T('HEAPS')),
    mc(13,'(d) A reason to choose Quicksort over Mergesort',['Need in-place sorting or lower extra memory, and stability is unnecessary','Need guaranteed stability','Need guaranteed O(n log n) worst case without extra storage','Need efficient prefix queries'],0,T('SORTING')),
    mc(14,'(e) When is a Trie map preferable to a HashMap?',['Autocomplete or prefix queries','When keys are arbitrary objects without string structure','When only exact-key lookup is needed and memory is tight','When keys must be stored in a heap'],0,T('TRIES','HASHING')),
    mc(15,'(f) A sound reason heaps are used for priority queues',['They use less memory and have a simpler invariant; they also handle duplicates naturally','They make every operation constant time','They asymptotically outperform balanced BSTs for all operations','They guarantee sorted iteration'],0,T('HEAPS','ADTS')),
  ]),
  problem('5','Syntax Mastery (2 pts)',null,[
    java(`class Sklarp implements Iterable<Character>, Iterator<Character> {
  char[] contents; char magicCharacter; int k;
  Sklarp(char[] s, Character c) { contents=s; magicCharacter=c; k=0; }
  public Iterator<Character> iterator() { return this; }
  public boolean hasNext() { return k < contents.length; }
  public Character next() {
    if (k % 3 == 0) contents[k] = magicCharacter;
    char result = contents[k]; k += 1; return result;
  }
  public void remove() { throw new UnsupportedOperationException(); }
  public static void main(String[] args) {
    Sklarp g = new Sklarp("Zeoidei".toCharArray(), 'r');
    for (Character c : g) System.out.print(c);
    System.out.println();
    for (Character c : g) System.out.print(c);
    System.out.println();
  }
}`),
    blank(16,'First output line','reoidei',T('JAVA','ITERATORS')),
    blank(17,'Second output line (the loop has already consumed the iterator)','empty line',T('JAVA','ITERATORS')),
  ]),
  problem('6','Runtime Analysis (2.5 pts)',null,[
    java(`void f1(int N) { for (int i=N; i>0; i-=1) for (int j=0; j<i; j+=1) {} }
void f2(int N) { for (int i=1; i<=N; i*=2) for (int j=0; j<i; j+=1) {} }
void f3(int[] a) {
  if (a.length==0) return;
  int[] b=new int[a.length-1];
  for (int i=0; i<b.length; i+=1) b[i]=a[i];
  f3(b);
}
void f4(int N) { int x=N; while(x>0) x=x>>>1; }
void f5(int N) { f1(N); f2(N); f3(new int[N]); f4(N); }`),
    ...[['f1','Theta(N^2)'],['f2','Theta(N)'],['f3','Theta(N^2)'],['f4','Theta(log N)'],['f5','Theta(N^2)']].map(([l,a],i)=>blank(18+i,l,a,T('ASYMPTOTICS'))),
  ]),
  problem('7','Sorting Mechanics (5 pts)',null,[
    text('Match intermediate-state clues to algorithms. Initial array: 4873,1874,8917,1626,4982,9132,9573,1876,6973,1897,9587,3492,9877,2212,6152,7121.'),
    ...[['Column 2: all values below pivot 4873 are greater, values above it smaller','Quicksort'],['Column 3: values grouped by leading digit, not sorted within groups','MSD radix sort'],['Column 4: each adjacent pair sorted, otherwise unordered','Mergesort'],['Column 5: max heap with sorted suffix','Heapsort'],['Column 6: sorted by low-order digits first','LSD radix sort']].map(([l,a],i)=>blank(23+i,l,a,T('SORTING'))),
  ]),
  problem('8','Choosing a Sort (4 pts)',null,[
    text('For almost-sorted Comparable objects, k is the inversion count. Give algorithm and tight runtime.'),
    ...[['(a) k=O(n): algorithm','Insertion sort'],['(a) k=O(n): runtime','O(n)'],['(a) k=O(n^2): algorithm','Mergesort'],['(a) k=O(n^2): runtime','O(n log n)'],['(a) k=log(n): algorithm','Insertion sort'],['(a) k=log(n): runtime','O(n)'],['(b) 32-bit int IDs, k=O(n^2): algorithm','Radix sort'],['(b) 32-bit int IDs, k=O(n^2): runtime','O(n)'],['(b) 32-bit int IDs, k<=5: algorithm','Insertion sort'],['(b) 32-bit int IDs, k<=5: runtime','O(n)']].map(([l,a],i)=>blank(28+i,l,a,T('SORTING'))),
  ]),
  problem('9','Shortest Paths Algorithms (4.5 pts)',null,[
    text('Directed weighted edges from the diagram: A→B(1), A→D(5), B→C(3), B→H(6), C→F(2), C→G(5), D→E(4), E→H(4), F→G(2), H→G(4).'),
    blank(38,'(a) Dijkstra visit order from A','A,B,C,D,F,H,G,E',T('SHORTEST_PATHS')),
    blank(39,'(b) Change E→H weight to what value or range to make Dijkstra incorrect?','-3 or less',T('SHORTEST_PATHS')),
    blank(40,'(c) A* returned path from A to G with given heuristic','A,B,H,G',T('SHORTEST_PATHS')),
  ]),
  problem('10','Hashing and Doubly Linked Lists (7 pts)',null,[
    text('Complete getNode, detachNode, and DLLHashMap.put. A bucket is a sentinel-based doubly linked list; getNode returns a matching node or null; detachNode unlinks it; put hashes String keys, promotes existing keys, updates values, or inserts new nodes at the front.'),
    java(`DNode getNode(String k) {
  DNode p = sentinel.next;
  while (p != null && !p.key.equals(k)) p = p.next;
  return p;
}
void detachNode(DNode p) {
  p.prev.next = p.next;
  if (p.next != null) p.next.prev = p.prev;
  size -= 1;
}
void put(String k, String v) {
  int index = (k.hashCode() << 1 >>> 1) % data.length;
  DLList bucket = data[index];
  DNode p = bucket.getNodeAndPromote(k);
  if (p != null) p.value = v;
  else bucket.addToFront(k, v);
}`),
    blank(41,'getNode: start cursor','sentinel.next',T('LINKED_LISTS')),
    blank(42,'getNode: match condition','p.key.equals(k)',T('LINKED_LISTS')),
    blank(43,'getNode: continue while cursor is non-null','p != null',T('LINKED_LISTS')),
    blank(44,'detachNode: reconnect successor','p.prev.next = p.next',T('LINKED_LISTS')),
    blank(45,'detachNode: guard and reconnect predecessor','if (p.next != null) p.next.prev = p.prev',T('LINKED_LISTS')),
    blank(46,'put: bucket index expression','(k.hashCode() << 1 >>> 1) % data.length',T('HASHING')),
    blank(47,'put: method on bucket to lookup/promote','getNodeAndPromote(k)',T('HASHING','LINKED_LISTS')),
    blank(48,'put: update existing node','p.value = v',T('HASHING','LINKED_LISTS')),
    blank(49,'put: add new pair','bucket.addToFront(k, v)',T('HASHING','LINKED_LISTS')),
  ]),
  problem('12','Radix Sorting and Bits (8 pts)',null,[
    text('LSD radix sort with N keys of width W digits:'),
    blank(50,'(a) Is insertion sort on each digit stable enough for LSD radix sort?','yes',T('SORTING')),
    blank(51,'(a) Worst-case runtime','O(WN^2)',T('SORTING','ASYMPTOTICS')),
    blank(52,'(b) Does heapsort on each digit preserve LSD correctness?','no',T('SORTING')),
    blank(53,'(b) Worst-case runtime','O(WN log N)',T('SORTING','ASYMPTOTICS')),
    text('(c) abs(x) is implemented as x<0 ? (~x+1) : x. Identify the exceptional int and explain.'),
    blank(54,'Exceptional value and behavior','Integer.MIN_VALUE; its positive magnitude overflows and it returns itself',T('BITS')),
    text('(d) KetchupFriend compares first by nonnegative ketchupLevel, then rednessQuotient; both are 32-bit ints. numDigits() returns 64. kthDigit(k), where 0 is least significant:'),
    java(`public int kthDigit(int k) {
  if (k < 32) return (rednessQuotient >>> k) & 1;
  return (ketchupLevel >>> (k - 32)) & 1;
}`),
    blank(55,'Which field supplies digits 0 through 31?','rednessQuotient',T('BITS','SORTING')),
    blank(56,'Which field supplies digits 32 through 63?','ketchupLevel',T('BITS','SORTING')),
    blank(57,'Digit expression for k<32','(rednessQuotient >>> k) & 1',T('BITS','SORTING')),
    blank(58,'Digit expression for k>=32','(ketchupLevel >>> (k - 32)) & 1',T('BITS','SORTING')),
  ]),
  problem('13','Shortest Paths Algorithm Design (5 pts)',null,[
    text('Directed graph with every edge weight an integer from 1 to 10. Find distances from source s in faster than standard Dijkstra. One accepted solution replaces each weight-w edge with a chain of w unit edges and runs BFS.'),
    mc(59,'(a) Which algorithm is a valid faster-than-Dijkstra design?', ['Replace each weight-w edge by a chain of w unit edges, then BFS','Run DFS and record first visit','Run Kruskal on the edges','Topologically sort the graph'],0,T('SHORTEST_PATHS')),
    blank(60,'(b) Runtime in terms of V and E','Theta(V + E)',T('SHORTEST_PATHS','ASYMPTOTICS')),
  ]),
]);
