// Spring 2019 Final: scored questions transcribed from the exam and official solutions.
import { exam, problem, text, java, txt, blank, mc } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...tags) => site(...tags);
export default exam('61b-sp19-final', 'Spring 2019 Final', {
  exam: 'https://drive.google.com/file/d/1ADV5iN2OSxP8fHfaGvqlyT39QqncEdij/view',
  sol: 'https://drive.google.com/file/d/1Wu9X7czbBIAywTLoCcqx07-JF92iCeTi/view',
}, 'sp19-final', [
  problem('1','Sorting Cornucopia (98 pts)',null,[
    text('Sort [9,1,1,3,5,5,6,8].'),
    blank(1,'(a)(i) Bottom-up max-heap array','9,8,6,3,5,5,1,1',T('HEAPS')),
    blank(2,'(a)(ii) Array after one in-place remove-largest (including sorted suffix)','8,5,6,3,1,5,1,9',T('HEAPS','SORTING')),
    blank(3,'(b) Two sorted arrays merged in final mergesort step','1,1,3,9 | 5,5,6,8',T('SORTING')),
    mc(4,'(c) Does inserting into TreeSet and iterating preserve the full sorted array?',['No, duplicate values disappear from a set','Yes, TreeSet preserves duplicates','No, iteration is preorder','Yes, insertion sort is required'],0,T('BSTS','SORTING')),
    blank(5,'(d) Fastest sort for this specific array','Insertion sort',T('SORTING')),
    text('Why?'), blank(6,'(d) Reason','Small array and linear number of inversions',T('SORTING')),
    text('(e) For each possible partition result, classify as: Hoare; another partition scheme only; or impossible.'),
    ...[
      ['[4,5,1,3,7,2,6]','impossible'],['[1,2,3,4,5,6,7]','other'],['[1,7,5,3,4,2,6]','impossible'],
      ['[1,3,4,2,5,7,6]','impossible'],['[1,3,4,2,5,6,7]','impossible'],['[2,1,3,4,5,7,6]','other'],['[3,2,1,4,7,5,6]','Hoare'],
    ].map(([l,a],i)=>mc(7+i,l,['Hoare partition','Other partition only','Impossible'],({Hoare: 0, other: 1, impossible: 2})[a],T('SORTING'))),
    text('(f) Merge [1,7,8,9] and [2,3,4,5]. Mark each statement true or false.'),
    ...[['Result is sorted','true'],['1 is compared to another item exactly once','true'],['2 is compared to 3','false'],['Exactly 7 comparisons','false']].map(([l,a],i)=>blank(14+i,l,a,T('SORTING'))),
    text('(g) Merge sorted [1,7,8,9] with [A,B,C,D], where A–D are arbitrary integers. Use true, false, or cannot be determined (CBD).'),
    ...[['1 compared exactly once','CBD'],['A compared to B','false'],['Exactly 7 comparisons','CBD'],['1 is in correct order relative to A','true'],['C is in correct order relative to 1','CBD'],['8 is in correct order relative to A','false']].map(([l,a],i)=>blank(18+i,l,a,T('SORTING'))),
  ]),
  problem('2','Radix Sorting (43 pts)',null,[
    text('Input: [123,723,175,394,763].'),
    blank(24,'(a) Counting sort by rightmost digit','123,723,763,394,175',T('SORTING')),
    blank(25,'(b) After two LSD counting-sort passes (ones, then tens)','123,723,763,175,394',T('SORTING')),
    blank(26,'(c) Stable insertion sort using only leftmost digit','123,175,394,723,763',T('SORTING')),
    blank(27,'(d) LSD radix with heapsort subroutine: why can it fail?','Heapsort is not stable',T('SORTING')),
    blank(28,'(d) MSD radix with heapsort subroutine: does it always work?','yes',T('SORTING')),
  ]),
  problem('3','MSTs, SPTs (62 pts)',null,[
    text('Undirected graph edge weights from the diagram: center O–upper-left 40, O–upper-right 20, O–lower-left 30, O–lower-right 55; upper-left–upper-right 65; upper-left–left 10; left–lower-left 85; lower-left–lower-right 70; upper-right–right 100; lower-right–right 90.'),
    blank(29,'(a) Prim MST edge weights in order from O','20,30,40,10,55,90',T('SHORTEST_PATHS')),
    blank(30,'(b) Is this SPT also the MST? If no, give an SPT edge not in MST','no; 100',T('SHORTEST_PATHS')),
    blank(31,'(c) Do G and G−1000 have the same MST edge set?','yes',T('SHORTEST_PATHS')),
    blank(32,'(d) Smallest edge touching a vertex in a nonnegative weighted undirected graph is always in MST: T/F','true',T('SHORTEST_PATHS')),
    blank(33,'(e) Smallest edge leaving a vertex in a nonnegative weighted directed graph is always in its SPT: T/F','true',T('SHORTEST_PATHS')),
  ]),
  problem('4','Binary Search Tree Removal Redux (51 pts)',null,[
    java(`TreeNode min(TreeNode x) {
  if (x == null) return null;
  if (x.left == null) return x;
  return min(x.left);
}
void hibbardDelete(TreeNode x) {
  TreeNode successor = min(x.right);
  x.right = deleteMin(x.right);
  x.item = successor.item;
}`),
    blank(34,'(a) Condition for minimum node','x.left == null',T('BSTS')),
    blank(35,'(a) Return minimum node','return x',T('BSTS')),
    blank(36,'(a) Recursive call','return min(x.left)',T('BSTS')),
    blank(37,'(b) Successor expression','min(x.right)',T('BSTS')),
    blank(38,'(b) Remove successor from right subtree','x.right = deleteMin(x.right)',T('BSTS')),
    blank(39,'(b) Replace deleted item','x.item = successor.item',T('BSTS')),
  ]),
  problem('5','Implementation Details (50 pts)',null,[
    text('For each choice, identify the primary reason the first choice is preferred.'),
    ...[
      ['Heap array starts at index 1 rather than 0','Simplifies code'],
      ['Dijkstra visits increasing rather than decreasing distance','Guarantees correctness'],
      ['KdTree visits left child first when query lies left (with pruning)','Guarantees correctness'],
      ['Shuffle before Quicksort','Improves runtime'],
      ['Rotate after BST insertion','Improves runtime'],
      ['Resize hash table after removal','Reduce memory use'],
      ['A* rather than Dijkstra for s-to-t shortest path','Improves runtime'],
      ['Heap rather than ordered array for priority queue','Improves runtime'],
      ['Doubly linked rather than singly linked deque nodes','Improves runtime'],
      ['Sentinels rather than direct first/last pointers','Simplifies code'],
    ].map(([l,a],i)=>blank(40+i,l,a==='Guarantees correctness'?['Guarantees correctness','Improves runtime']:a,T('ADTS'))),
  ]),
  problem('7','DisjointSets (84 pts)',null,[
    text('Implement arbitrary integer QuickUnion using one instance field, plus an iterator over the connected component. Code fragments are individual checkable pieces.'),
    java(`HashMap<Integer, Integer> itemToParent;
QuickUnionSp19F() { itemToParent = new HashMap<>(); }
void add(int p) {
  if (vertexExists(p)) throw new IllegalArgumentException();
  itemToParent.put(p, p);
}
boolean vertexExists(int p) { return itemToParent.containsKey(p); }
Set<Integer> vertices() { return itemToParent.keySet(); }
void connect(int p, int q) {
  if (!vertexExists(p) || !vertexExists(q)) throw new IllegalArgumentException();
  int pRoot = root(p), qRoot = root(q);
  itemToParent.put(qRoot, pRoot);
}
int root(int p) {
  if (!vertexExists(p)) throw new IllegalArgumentException();
  int parent = itemToParent.get(p);
  if (parent == p) return p;
  return root(parent);
}`),
    ...[
      ['(a) The one instance variable','HashMap<Integer, Integer> itemToParent'],
      ['(a) Constructor initialization','itemToParent = new HashMap<>()'],
      ['(a) Add a new root entry','itemToParent.put(p, p)'],
      ['(a) Check whether item exists','itemToParent.containsKey(p)'],
      ['(a) Return vertices','itemToParent.keySet()'],
      ['(a) Link roots in connect','itemToParent.put(qRoot, pRoot)'],
      ['(a) Read parent in root','int parent = itemToParent.get(p)'],
      ['(a) Root base case','if (parent == p) return p'],
      ['(a) Recursive root step','return root(parent)'],
      ['(b) Iterator class implements','Iterable<Integer>'],
      ['(b) Store component items in','List<Integer> items'],
      ['(b) Allocate component list','items = new ArrayList<Integer>()'],
      ['(b) Scan all vertices','for (int q : ds.vertices())'],
      ['(b) Select component members','if (ds.isConnected(p, q)) items.add(q)'],
      ['(b) Iterator method returns','items.iterator()'],
    ].map(([l,a],i)=>blank(50+i,l,a,T('DISJOINT_SETS'))),
  ]),
  problem('8','Asymptotics (68 pts)',null,[
    java(`int f1(int N) {
  if (N <= 1) return N;
  int sum = f1(N/2);
  for (int i=0; i<N/2; i+=1) {}
  sum += f1(N/3);
  for (int i=0; i<N/2; i+=1) {}
  sum += f1(N/6); return sum;
}
void f2(ArrayList<String> A, String s) {
  int N=A.length(); int sLocation=A.indexOf(s);
  if (sLocation > -1) { String temp=A.get(0); A.set(0,A.get(sLocation)); A.set(sLocation,temp); }
}
int f3(TreeSet<Bloop> A, HashSet<Bloop> B) {
  int N=A.size()+B.size(), inBoth=0;
  for (Bloop a : A.keySet()) if (B.containsKey(a)) inBoth++;
  return inBoth;
}
void f4(int N) {
  int M=0; for (int i=1; i<N; i*=2) M++;
  f4helper(M);
}
void f4helper(int Q) { if (Q<=0) return; for (int i=0;i<Q;i++) {} f4helper(Q-1); }`),
    ...[['f1','Theta(N log N)'],['f2','Theta(N)'],['f3','Theta(N^2)'],['f4','Theta((log N)^2)']].map(([l,a],i)=>blank(65+i,l,a,T('ASYMPTOTICS'))),
  ]),
  problem('9','Reductions and Sorting (58 pts)',null,[
    text('Graph Path Sort creates an edge of weight 1 from each smaller integer to each larger integer, then runs DAG shortest paths from the minimum and returns the path to the maximum.'),
    blank(69,'(i) Overall runtime','Theta(N^2)',T('SHORTEST_PATHS','ASYMPTOTICS')),
    blank(70,'(ii) Output on [5,1,7,9,3]','[1,9]',T('SHORTEST_PATHS')),
    blank(71,'(iii) Simple fix to make it sort all unique integer arrays','Set every edge weight to -1 so DAGSPT chooses a longest path; the transitive graph’s longest path visits all values in sorted order',T('SHORTEST_PATHS','SORTING')),
  ]),
  problem('10','A New Way (73 pts)',null,[
    text('Linear probing, table size M=8. Hash code of an integer is its last digit.'),
    blank(72,'(a) Table indices 0 through 7 after adding 93,21,5,3,13,25,83','83,21,null,93,3,5,13,25',T('HASHING')),
    blank(73,'(b) Four ordered adds so contains(0) uses 2 equals calls and contains(1) uses 3','10,0,21,1',T('HASHING')),
    blank(74,'(c) Table after deleting 5 from the table in (a), indices 0 through 7','null,21,null,93,3,13,25,83',T('HASHING')),
    blank(75,'(d) Best-case deletion runtime','Theta(1)',T('HASHING','ASYMPTOTICS')),
    blank(76,'(d) Worst-case deletion runtime','Theta(N)',T('HASHING','ASYMPTOTICS')),
  ]),
  problem('11','Ψcle (83 pts)',null,[
    text('Directed weighted graph arcs from the figure: B→X(1), C→X(2), X→A(1), B→C(5), C→B(20), C→A(20), Z→B(20), B→Y(3), Z→Y(4), Y→Z(5), Y→A(4), A→B(10). A psi-compliant cycle contains at most one vertex from Ψ.'),
    blank(77,'(a) Shortest simple psi-compliant cycle weight for Ψ={A,B,X}','9',T('SHORTEST_PATHS')),
    blank(78,'(b) Shortest simple psi-compliant cycle weight for Ψ={X,Y,Z}','12',T('SHORTEST_PATHS')),
    text('(c) Select an algorithm meeting O(P V E log V): remove vertices of Ψ to create P+1 graphs (one excludes all Ψ, each other excludes all but one Ψ vertex); in each graph compute the minimum simple-cycle weight by running Dijkstra from every vertex and checking each return edge.'),
    mc(79,'Which construction meets the required bound?', ['Build P+1 subgraphs, each omitting a subset of Ψ as described, then run all-sources Dijkstra and close each path with an edge back to its source','Run one Dijkstra from every vertex on the original graph and ignore Ψ','Enumerate all simple cycles and filter by Ψ','Run Kruskal on each connected component'],0,T('SHORTEST_PATHS')),
  ]),
  problem('12','Tree Representation 4 (130 pts)',null,[
    text('Representation 4 is breadth-first order, with each node preceded by a boolean that is true exactly for leaves; each node has either zero or two children.'),
    blank(80,'(a) Representation for the pictured tree (root 2; children 1 and 6; 6 has children 4 and 7; 4 has children 3 and 5)','F,2,T,1,F,6,F,4,T,7,T,3,T,5',T('TREE_TRAVERSALS')),
    blank(81,'(b) Tree for sequence F,6,T,3,F,4,T,7,T,8 (describe links)','6 has left child 3 and right child 4; 4 has children 7 and 8',T('TREE_TRAVERSALS')),
    blank(82,'(c) With 9 numbers and 9 flags, minimum and maximum true flags','5,5',T('TREE_TRAVERSALS')),
    java(`void writeTree(Out out) {
  Queue<Node> q = new Queue<>();
  q.enqueue(this);
  while (!q.isEmpty()) {
    Node p = q.dequeue();
    boolean leaf = p.left == null && p.right == null;
    out.println(leaf);
    out.println(p.item);
    if (!leaf) { q.enqueue(p.left); q.enqueue(p.right); }
  }
}`),
    blank(83,'(d) Queue initialization','Queue<Node> q = new Queue<>();',T('TREE_TRAVERSALS')),
    blank(84,'(d) Seed queue with this root','q.enqueue(this);',T('TREE_TRAVERSALS')),
    blank(85,'(d) Leaf predicate','p.left == null && p.right == null',T('TREE_TRAVERSALS')),
    blank(86,'(d) Output leaf flag','out.println(leaf);',T('TREE_TRAVERSALS')),
    blank(87,'(d) Output node item','out.println(p.item);',T('TREE_TRAVERSALS')),
    blank(88,'(d) Enqueue children when internal','q.enqueue(p.left); q.enqueue(p.right);',T('TREE_TRAVERSALS')),
    text('(e) Give an 11-node tree whose breadth-first representation is also parsed correctly by the buggy preorder reader. A right spine of internal nodes, each with a left leaf, ending in an internal node with two leaves works; assign equal item values.'),
    blank(89,'(e) Describe one valid tree shape','A right spine of 5 internal nodes; each of the first 4 has a left leaf and a right internal child; the final internal node has two leaves',T('TREE_TRAVERSALS')),
  ]),
]);
