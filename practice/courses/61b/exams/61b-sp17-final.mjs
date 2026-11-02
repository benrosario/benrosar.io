// Spring 2017 Final: scored questions transcribed from the exam and solutions.
import { exam, problem, text, java, blank, mc, sata, txt } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...tags) => site(...tags);
const F = (id, label, answer, tags = ['JAVA']) => blank(id, label, answer, T(...tags));
const C = (id, label, options, answer, tags = ['JAVA']) => mc(id, label, options, answer, T(...tags));
const S = (id, label, options, answers, tags = ['JAVA']) => sata(id, label, options, answers, T(...tags));
const TF = ['True', 'False'];
export default exam('61b-sp17-final', 'Spring 2017 Final', {
  exam: 'https://drive.google.com/file/d/1bQwnCZ16mv8dhFqfKT6Q95k19zzMS9GN/view',
  sol: 'https://drive.google.com/file/d/1p2pI8h8f9hqFDHDmJvCU_m-EClb2gF8j/view',
}, 'sp17-final', [
  problem('1', 'Mystery Spanning Tree 3000 (12 pts)', null, [
    text('Graph edges (weight): AB 6, AC 12, BC 3, BE 4, BF 7, BG 4, CD 9, CE 5, EF 2. List the edges in order; Prim starts at A and ties are alphabetical.'),
    F(1,'Prim edge order (space-separated)','AB BC BE EF BG CD',['GRAPH_REPRESENTATIONS']),
    F(2,'Kruskal edge order (space-separated)','EF BC BE BG AB CD',['GRAPH_REPRESENTATIONS']),
    C(3,'Is there a vertex whose SPT equals this Prim MST?', ['Yes: B','Yes: any vertex','No'],0,['GRAPH_REPRESENTATIONS']),
    C(4,'Does increasing by 1 the minimum-weight edge crossing any cut necessarily increase the MST total weight?',['True','False'],0,['GRAPH_REPRESENTATIONS']),
    C(5,'Is the shortest A-to-B path always the same when restricted to the MST?',['True','False'],1,['GRAPH_REPRESENTATIONS']),
    C(6,'Is the maximum-weight edge crossing any cut in the maximum spanning tree?',['True','False'],0,['GRAPH_REPRESENTATIONS']),
  ]),
  problem('2','Sorting (28 pts)',null,[
    F(10,'Inversions in [A, D, B, W, K] sorted alphabetically','2',['SORTING']),
    F(11,'Array after heapify and one in-place heapsort remove-max','[14, 10, 13, 6, 5, 12, 17]',['SORTING','HEAPS']),
    text('For each scenario choose the best sort: 1 insertion, 2 merge, 3 Hoare quicksort, 4 LSD radix. Give worst-case time.'),
    ...[['N integers with constant maximum k','4','N'],['N BigIntegers with max N^3 and comparison cost log N','4','N log N'],['N comparable objects in an array, constant comparison','2','N log N'],['Doubly linked list of N comparable objects, constant comparison','2','N log N'],['10 Java Strings of length W','1','W'],['N comparable objects with Θ(√N) inversions','1','N'],['N comparable objects with Θ(N²) inversions','2','N log N']].flatMap(([l,s,t],i)=>[F(12+i*2,`${l}: best sort number`,s,['SORTING']),F(13+i*2,`${l}: worst-case time, omit O(...)`,t,['SORTING'])]),
    S(30,'Which array sorting algorithms are monotonically improving in inversion count?',['Insertion sort','Selection sort','Heapsort','Quicksort (left pivot, Hoare)','LSD sort','MSD sort'],[0,1,3,5],['SORTING']),
  ]),
  problem('3','Traversals (14 pts)',null,[
    text('NAryIntTree nodes have int val and Node[] children (null for leaves). Complete recursive postorder and iterative level order.'),
    java(`void printTreePostOrder() { ⟪a⟫; }
void printTreePostOrderHelper(Node x) {
  if (⟪b⟫) {
    for (int i=0; i < ⟪c⟫; i++) ⟪d⟫;
  }
  System.out.println(⟪e⟫);
}`),
    ...[['Call helper on root','printTreePostOrderHelper(root)'],['Children exist','x.children != null'],['Iterate child count','x.children.length'],['Recurse on child','printTreePostOrderHelper(x.children[i])'],['Print node value','x.val']].map(([l,a],i)=>F(40+i,l,a,['TREE_TRAVERSALS'])),
    java(`void printTreeLevelOrder() {
  Queue<Node> fringe = new Queue<>();
  fringe.⟪f⟫;
  while (⟪g⟫) {
    Node x = ⟪h⟫;
    System.out.println(x.val);
    if (x.children != null) {
      for (int i=0; i < x.children.length; i++) ⟪i⟫;
    }
  }
}`),
    ...[['Enqueue root','enqueue(root)'],['Queue nonempty','fringe.size() > 0'],['Dequeue next node','fringe.dequeue()'],['Enqueue each child','fringe.enqueue(x.children[i])']].map(([l,a],i)=>F(45+i,l,a,['TREE_TRAVERSALS','ADTS'])),
  ]),
  problem('4','Algorithms and Data Structures (12 pts)',null,[
    C(60,'Does an adjacency heap improve worst-case asymptotic Dijkstra runtime over an adjacency list?',['Better','Equivalent','Worse'],1,['GRAPH_REPRESENTATIONS']),
    text('Gulgate PQ insertion and deletion each cost Θ(N), change-priority Θ(1); Dijkstra initially inserts all V vertices and may process E edges.'),
    F(61,'Dijkstra worst-case runtime in V,E','O(E + V^2)',['GRAPH_REPRESENTATIONS','HEAPS']),
    text('Xelha Quick Union: constructor Θ(N), union Θ(N log N), connected Θ(log N). Kruskal uses a heap priority queue and E≫V.'),
    F(62,'Kruskal worst-case runtime in V,E','O(V^2 log V)',['GRAPH_REPRESENTATIONS','DISJOINT_SETS']),
  ]),
  problem('5','Potpourri (16 pts)',null,[
    text('A ternary heap can use a compact array. Give formulas for root index zero.'),
    ...[['parent(k)','(k - 1) / 3'],['left(k)','3*k + 1'],['middle(k)','3*k + 2'],['right(k)','3*k + 3']].map(([l,a],i)=>F(70+i,l,a,['HEAPS'])),
    C(74,'If equals is overridden without hashCode, can HashSet.contains return an incorrect result?',['True','False'],0,['HASHING']),
    C(75,'Does omitting hashCode make HashSet.contains much more likely to take linear time?',['True','False'],1,['HASHING']),
    text('Give a suitable interface enabling generic trie keys, with one method that exposes the indexed digit/character at position i.'),
    F(76,'Interface name and method signature','interface HasDigits { int digit(int i); }',['TRIES']),
    F(77,'Main consideration for DogPicture implementing that interface','Whether anyone will want prefix operations with DogPictures',['TRIES']),
  ]),
  problem('6','Stocks (12 pts)',null,[
    text('A stock’s price is mutated after the stock is inserted in a heap-based MaxPQ. Select all direct issues.'),
    S(80,'Issues present',['Returns k cheapest stocks','May return duplicate stock entries','Mutating a heap item can break heap order and yield wrong results','List return type with ArrayList value is a compile error','Map cannot refer to objects stored in the heap'],[2],['HEAPS','HASHING']),
    F(81,'Worst-case runtime with nice hash spread, in S,T,k','S + T + k log S',['HEAPS','HASHING']),
    F(82,'Space complexity in S','S',['HEAPS','HASHING']),
  ]),
  problem('7','Arithmetic Tree (23 pts)',null,[
    text('Complete postorder evaluation of arithmetic expression nodes. Nodes expose children and processNode(Stack<Integer>).'),
    java(`static int evaluateTree(Node tree) {
  Stack<Integer> stk = new Stack<>();
  ⟪a⟫
  ⟪b⟫
}
static void evaluateTreeHelper(Node tree, Stack<Integer> stk) {
  for (⟪c⟫) ⟪d⟫
  ⟪e⟫
}
void processNode(Stack<Integer> stk) {
  int res = stk.pop();
  for (int i=1; i < numArgs(); i++) res = apply(res, ⟪f⟫);
  stk.push(res);
}
void processNumber(Stack<Integer> stk) { stk.push(⟪g⟫); }`),
    ...[['Evaluate tree helper','evaluateTreeHelper(tree, stk);'],['Return result','return stk.pop();'],['Loop over children','Node c : tree.children'],['Recurse','evaluateTreeHelper(c, stk);'],['Process after children','tree.processNode(stk);'],['Pop next argument','stk.pop()'],['Push number value','value']].map(([l,a],i)=>F(90+i,l,a,['TREE_TRAVERSALS','ADTS'])),
    F(97,'Multiplication apply body','return arg1 * arg2;',['TREE_TRAVERSALS']), F(98,'Addition apply body','return arg1 + arg2;',['TREE_TRAVERSALS']),
  ]),
  problem('9','Asymptotics (16 pts)',null,[
    ...[['f1 best runtime (two recursive calls on N/2 plus Θ(N²) work)','N^2'],['f1 worst runtime','N^2'],['f2 best runtime','1'],['f2 worst runtime','N'],['f3 best runtime','N'],['f3 worst runtime','N'],['f4 best runtime','1'],['f4 worst runtime','2^N']].map(([l,a],i)=>F(110+i,l,a,['ASYMPTOTICS'])),
    text('f2 loops across the array; a null string causes one replacement and recursive continuation. f3 visits each node once. f4 recursively processes the left subtree twice after aliasing right=left.'),
  ]),
  problem('10','Return of the XelhaTree (16 pts)',null,[
    java(`boolean isAHeap(IntTree xt) {
  if (xt == null) return true;
  if (xt.item > getItem(xt.left) || xt.item > getItem(xt.right)) return false;
  return ⟪a⟫;
}
void getTreeValues(IntTree xt, List<Integer> out) {
  if (xt == null) return;
  ⟪b⟫
  ⟪c⟫
  ⟪d⟫
}
boolean validXelhaTree(IntTree xt, List<Integer> vals) {
  List<Integer> treeValues = new ArrayList<>();
  getTreeValues(xt, treeValues);
  return ⟪e⟫;
}`),
    ...[['Recursive heap checks','isAHeap(xt.left) && isAHeap(xt.right)'],['Inorder visit left','getTreeValues(xt.left, out);'],['Append item','out.add(xt.item);'],['Inorder visit right','getTreeValues(xt.right, out);'],['Check heap and inorder sequence','isAHeap(xt) && treeValues.equals(vals)']].map(([l,a],i)=>F(130+i,l,a,['TREE_TRAVERSALS','BSTS'])),
  ]),
  problem('11','MaxPQ (12 pts)',null,[
    text('Implement a max priority queue by wrapping MinPQ with a reverse comparator. Reference-sheet MinPQ offers insert, delMin and a comparator constructor.'),
    java(`class MaxPQ<Item extends Comparable<Item>> {
  ⟪a⟫
  MaxPQ() { pq = new MinPQ<Item>(new ReverseComparator()); }
  class ReverseComparator implements Comparator<Item> {
    public int compare(Item i1, Item i2) { return ⟪c⟫; }
  }
  Item delMax() { return ⟪d⟫; }
  void insert(Item x) { ⟪e⟫; }
}`),
    ...[['Field declaration','private MinPQ<Item> pq;'],['Reverse order comparator','i2.compareTo(i1)'],['Delete max','pq.delMin()'],['Insert item','pq.insert(x)']].map(([l,a],i)=>F(140+i,l,a,['HEAPS'])),
  ]),
  problem('12','Danger and Optimization (12 pts)',null,[
    S(150,'Appropriate integer sorting choices for hostile inputs',['Merge sort','Insertion sort','Shuffled Hoare quicksort','LSD radix sort','Recursive MSD sort'],[0,2,3],['SORTING']),
    S(151,'Appropriate set choices for hostile Java String inputs',['2-3 tree set','LLRB set','Hash set','Trie set (array links)','TST set'],[0,1],['BSTS','HASHING','TRIES']),
    C(152,'Appropriate traversal for user-submitted graphs: recursive DFS',['Appropriate','Inappropriate'],1,['GRAPH_REPRESENTATIONS']),
    C(153,'Appropriate traversal for user-submitted graphs: BFS',['Appropriate','Inappropriate'],0,['GRAPH_REPRESENTATIONS']),
  ]),
  problem('13','Reductions (26.5 pts)',null,[
    F(160,'Maximum spanning tree using unmodified Kruskal black box','Negate every edge weight, then run Kruskal',['GRAPH_REPRESENTATIONS']),
    F(161,'Shortest path where path cost is sum of weights plus edge count, using Dijkstra black box','Add 1 to every edge weight, then run Dijkstra',['GRAPH_REPRESENTATIONS']),
    C(162,'Does adding Q to every edge preserve shortest paths when exactly one edge has weight −Q?',['Yes','No'],1,['GRAPH_REPRESENTATIONS']),
    ...[['A zelch-based sort needs Ω(N log log N) zelch operations','True'],['Sorting in Zulg has Θ(N log log N) worst-case time','False'],['Optimal Zulg sorting is O(N log log N)','False'],['Every Zulg sorting algorithm is O(N log log N)','False']].map(([l,a],i)=>C(163+i,l,TF,TF.indexOf(a),['SORTING','ASYMPTOTICS'])),
    ...[['Some MinimumPQ implementation has add Θ(log log N)','True'],['Some implementation has removeMin Θ(log log N)','True'],['One implementation has both add and removeMin Θ(log log N)','False'],['Some implementation has add Θ(1)','True'],['Some implementation has removeMin Θ(1)','True'],['One implementation has both add and removeMin Θ(1)','False']].map(([l,a],i)=>C(167+i,l,TF,TF.indexOf(a),['HEAPS','ASYMPTOTICS'])),
    ...[['A LongestPath solver exists in O(N^k) time','Depends on P=NP'],['A proposed LongestPath solution can be checked in O(N^k) time','True'],['The byte length of the shortest Java program solving LongestPath can be calculated','False']].map(([l,a],i)=>C(173+i,l,['True','False','Depends on P=NP'],['True','False','Depends on P=NP'].indexOf(a),['ASYMPTOTICS'])),
  ]),
]);
