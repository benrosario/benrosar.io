// Spring 2018 Final: scored questions from the official exam and solutions.
import { exam, problem, text, java, blank, mc, sata, txt } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...tags) => site(...tags);
const F = (id, label, answer, tags = ['JAVA']) => blank(id, label, answer, T(...tags));
const C = (id, label, options, answer, tags = ['JAVA']) => mc(id, label, options, answer, T(...tags));
const S = (id, label, options, answers, tags = ['JAVA']) => sata(id, label, options, answers, T(...tags));
const TF = ['True', 'False', 'Not enough information'];
export default exam('61b-sp18-final', 'Spring 2018 Final', {
  exam: 'https://drive.google.com/file/d/1_hrx4pAevtEVVxtNUoMZ3uZB32D1MOUC/view',
  sol: 'https://drive.google.com/file/d/1lmjGHJy3bAfxKOMtTt53Y4S_3RzjAmh9/view',
}, 'sp18-final', [
  problem('1','Graph Basics (44 pts)',null,[
    text('Directed graph edges: 61A→61B, 61A→61C; 61B→188, 61B→170, 61B→169; 61C→169; 70→188, 70→170. Starting at 61A, perform DFS/BFS with alphanumeric tie-breaking. Neither traversal restarts after exhausting reachable vertices.'),
    F(1,'DFS preorder, space-separated','61A 61B 169 170 188 61C',['GRAPH_REPRESENTATIONS']),
    F(2,'DFS postorder, space-separated','169 170 188 61B 61C 61A',['GRAPH_REPRESENTATIONS']),
    F(3,'BFS order, space-separated','61A 61B 61C 169 170 188',['GRAPH_REPRESENTATIONS']),
    C(4,'Is this a valid topological order: 70, 61A, 61C, 61B, 188, 170, 169?',['Yes','No'],0,['GRAPH_REPRESENTATIONS']),
    text('For the weighted undirected graph, label vertices by their symbols: O is the circled top node, I is infinity, Tri is the triangle, Plus is +, Dia is the four-diamond symbol, Hour is the hourglass symbol, Zig is the zigzag, and Clov is the clover. Edges: O–I(1), O–Tri(0), I–Plus(3), I–Dia(8), I–Hour(9), Tri–Hour(−1000), Tri–Clov(2), Plus–Zig(4), Dia–Zig(5), Dia–Hour(7), Zig–Hour(6), Zig–Clov(10), Hour–Clov(11). Prim starts at O. Report edge weights in order.'),
    F(5,'MST edge weights, Prim order','0 -1000 1 2 3 4 5',['GRAPH_REPRESENTATIONS']),
    F(6,'MST edge weights, Kruskal order','-1000 0 1 2 3 4 5',['GRAPH_REPRESENTATIONS']),
    C(7,'If 1000 is added to every edge weight, do the MST edges change?',['Yes','No'],1,['GRAPH_REPRESENTATIONS']),
    text('For the next graph, edges are AE=2, AB=1, EB=8, EC=1, CB=5, CD=5, BD=0, and DE=x. The bold candidate tree is AE, AB, EC, CD, BD.'),
    C(8,'Can the marked edges be an MST, and what x values work?',['Never','Yes when x ≥ 2','Yes when x ≤ 2','Yes for every x'],1,['GRAPH_REPRESENTATIONS']),
    C(9,'Can the marked edges be an SPT rooted at B, and what x values work?',['Never','Yes when x ≥ 3','Yes when x ≤ 3','Yes for every x'],1,['GRAPH_REPRESENTATIONS']),
  ]),
  problem('2','Sorting (33 pts)',null,[
    text('An insertion sort is partway through sorting [@, #, $, %, &, *], at state [&, #, $, @, %, *]. For each statement select true, false, or not enough information.'),
    ...[['& is the smallest element','Not enough information'],['* is the largest element','Not enough information'],['& < #','True'],['% < @','False']].map(([l,a],i)=>C(i+10,l,TF,TF.indexOf(a),['SORTING'])),
    java(`int[] a = {6,1,4,7,3,2,5,8}; // pivot is 6; Tony Hoare partition`),
    F(14,'Array immediately after first swap','6 1 4 5 3 2 7 8',['SORTING']),
    F(15,'Array after the entire partition','2 1 4 5 3 6 7 8',['SORTING']),
    S(16,'Given x < y and x is right of y, what can happen to inversion count when swapping them?',['Decrease','Increase','Stay the same'],[0],['SORTING']),
    S(17,'What can happen to inversion count during bottom-up min-heapification?',['Decrease','Increase','Stay the same'],[0,2],['SORTING','HEAPS']),
    C(18,'Is HashSort constant-time when lookup uses HashMap<int[],int[]> and the map has an entry for every possible input array?',['Yes','No'],1,['HASHING','SORTING']),
    F(19,'Why not?','Computing the input array hash code takes Θ(N) time',['HASHING','SORTING']),
  ]),
  problem('3','Back to the First Half of the Semester (46 pts)',null,[
    text('Implement append non-destructively: return a new list containing x followed by y.'),
    java(`static IntList append(IntList x, IntList y) {
  if (⟪a⟫) return ⟪b⟫;
  return ⟪c⟫;
}`),
    F(30,'Base case','x == null',['LINKED_LISTS']),F(31,'Return for empty x','y',['LINKED_LISTS']),F(32,'Copy first node and recurse','new IntList(x.first, append(x.rest, y))',['LINKED_LISTS']),
    text('Complete an iterator for IntList, where nodes have int first and IntList rest.'),
    java(`public Iterator<Integer> iterator() { return ⟪d⟫; }
public static class IntListIterator implements Iterator<Integer> {
  private IntList p;
  public IntListIterator(⟪e⟫) { ⟪f⟫ }
  public boolean hasNext() { return ⟪g⟫; }
  public Integer next() {
    int rval = ⟪h⟫;
    ⟪i⟫
    return ⟪j⟫;
  }
}`),
    ...[['Construct iterator','new IntListIterator(this)'],['Constructor argument type','IntList il'],['Initialize cursor','p = il'],['hasNext condition','p != null'],['Read current value','p.first'],['Advance cursor','p = p.rest'],['Return saved value','rval']].map(([l,a],i)=>F(33+i,l,a,['LINKED_LISTS','ITERATORS'])),
    text('If IntListIterator is made private: determine compile/runtime outcome for each context.'),
    ...[['IntList.java',['Fails to compile','Compiles'],'Compiles'],['One.java enhanced for loop',['Fails to compile','Compiles but works incorrectly','Compiles and works correctly'],'Compiles and works correctly'],['Two.java Iterator<Integer> it = L.iterator()',['Fails to compile','Compiles but works incorrectly','Compiles and works correctly'],'Compiles and works correctly'],['Three.java explicitly names IntListIterator',['Fails to compile','Compiles but works incorrectly','Compiles and works correctly'],'Fails to compile']].map(([l,o,a],i)=>C(45+i,l,o,o.indexOf(a),['ITERATORS','JAVA'])),
    C(49,'Expected practical runtime of an int[]-backed IntArrayList versus ArrayList<Integer>?',['Better','No measurable difference','Worse'],0,['ARRAYS','JAVA']),
    F(50,'Runtime reason','Avoids autoboxing and unboxing',['ARRAYS','JAVA']),
    C(51,'Expected space usage of int[]-backed IntArrayList?',['Better','No measurable difference','Worse'],0,['ARRAYS','JAVA']),
    F(52,'Space reason','Integer objects use more space than primitive ints',['ARRAYS','JAVA']),
  ]),
  problem('5','Hash Codes (13 pts)',null,[
    text('SneakySnake.equals compares UUIDString and seed. Class fields: constant String UUIDString, int seed, and Random random initialized from seed in the constructor. Classify each hashCode body as valid, valid but slow, or invalid.'),
    java(`return UUIDString;
return UUIDString.hashCode();
return seed;
return random.nextInt();
Random hashcodeRand = new Random(10);
return hashcodeRand.nextInt();`),
    ...[['return UUIDString;','Invalid'],['return UUIDString.hashCode();','Valid but slow'],['return seed;','Valid'],['return random.nextInt();','Invalid'],['new Random(10); return hashcodeRand.nextInt();','Valid but slow']].map(([l,a],i)=>C(60+i,l,['Valid','Valid but slow','Invalid'],['Valid','Valid but slow','Invalid'].indexOf(a),['HASHING','JAVA'])),
  ]),
  problem('6','More Graphs! (37 pts)',null,[
    text('Classify each proposition as Always True, Sometimes True, or Always False.'),
    ...[
      ['A* finds a correct shortest path, if one exists.','Sometimes True'],
      ['BFS finds a correct shortest path in an unweighted graph.','Always True'],
      ['An MST contains the largest edge in the graph.','Sometimes True'],
      ['The last vertex in a valid topological order has no outgoing edges.','Always True'],
      ['The middle vertex in a topological order of ≥3 vertices has no incoming edge.','Sometimes True'],
      ['With all positive edges except negative edges leaving the start, Dijkstra finds the correct SPT.','Always True'],
      ['Dijkstra variant DAV1 stops when target is enqueued; on nonnegative graphs this gives a correct shortest path.','Sometimes True'],
      ['Dijkstra variant DAV2 stops when target is dequeued; on nonnegative graphs this gives a correct shortest path.','Always True'],
    ].map(([l,a],i)=>C(70+i,l,['Always True','Sometimes True','Always False'],['Always True','Sometimes True','Always False'].indexOf(a),['GRAPH_REPRESENTATIONS'])),
    text('For nonnegative weighted graphs, use this triangle: vertices A, B, C; all three undirected edges have weight 1.'),
    F(78,'Second-shortest path from A to B','A-C-B',['GRAPH_REPRESENTATIONS']),
    F(79,'Second-shortest path from A to C','A-B-C',['GRAPH_REPRESENTATIONS']),
    C(80,'Do second-shortest paths necessarily form a tree?',['Yes','No'],1,['GRAPH_REPRESENTATIONS']),
  ]),
  problem('7','Can You Do That? (32 pts)',null,[
    C(90,'Does calling insertion-sort travel(i) in reverse order still sort?',['Yes','No'],1,['SORTING']),
    F(91,'Counterexample input','3 0 1 2',['SORTING']),
    text('Pruskal: for each vertex choose its cheapest incident edge; return the set of chosen edges. Connected undirected graph, unique weights.'),
    C(92,'Does Pruskal always return the MST?',['Yes','No'],1,['GRAPH_REPRESENTATIONS']),
    text('Use this connected graph: A–B has weight 1, B–C has weight 4, and C–D has weight 2.'),
    C(93,'Can a heap priority queue report the true minimum after arbitrary stored keys mutate, if it reheapifies before min and removeMin?',['Yes','No'],0,['HEAPS']),
    F(94,'How can MutationSafeHeapMinPQ ensure correctness?','Reheapify the items at the start of every min() and removeMin() call',['HEAPS']),
  ]),
  problem('8','Weird Sorts (24 pts)',null,[
    text('PartitionHybridSort partitions around the leftmost item, then runs the selected subsort independently on each subarray. Give worst-case Θ runtime.'),
    ...[['InsertionSort','N^2'],['Mergesort','N log N'],['LSDSort','N'],['PartitionHybridSort recursively','N^2']].map(([l,a],i)=>F(100+i,`PartitionHybridSort with ${l}`,a,['SORTING'])),
    text('LSDMergesort uses stable mergesort to sort on each of W digits. LSDQuicksort instead uses shuffled Hoare quicksort on each digit.'),
    F(104,'LSDMergesort worst-case runtime','W N log N',['SORTING']),
    C(105,'Does LSDMergesort always sort correctly?',['Yes','No'],0,['SORTING']),
    F(106,'Why does LSDMergesort work?','Mergesort is stable',['SORTING']),
    F(107,'LSDQuicksort worst-case runtime','W N^2',['SORTING']),
    C(108,'Does LSDQuicksort always sort correctly?',['Yes','No'],1,['SORTING']),
    F(109,'Why can LSDQuicksort fail?','Quicksort is unstable',['SORTING']),
  ]),
  problem('9','Dijkstra Runtime (24 pts)',null,[
    text('Give operation runtimes and total Dijkstra runtime. Counts are V add calls, O(E) changePriority calls, O(V) removeMin calls. Keep the total expression in terms of E and V without simplifying.'),
    ...[
      ['Trinary heap add','log V'],['Trinary heap changePriority','log V'],['Trinary heap removeMin','log V'],['Trinary heap total','E log V + V log V'],
      ['Unordered array add','V'],['Unordered array changePriority','1'],['Unordered array removeMin','V'],['Unordered array total','V^2 + E'],
      ['Ordered linked list add','V'],['Ordered linked list changePriority','V'],['Ordered linked list removeMin','1'],['Ordered linked list total','V^2 + EV'],
    ].map(([l,a],i)=>F(120+i,l,a,['GRAPH_REPRESENTATIONS','HEAPS'])),
  ]),
  problem('10','By the Numbers (40 pts)',null,[
    text('Give exact best and worst numbers of compareTo calls.'),
    ...[['Solving puppy, cat, dog for N=3','2','3'],['Insertion sorting 5 numbers','4','10'],['Inserting 5 numbers into initially empty BST','6','10'],['Finding successor of BST root with 7 items','0','0'],['Merging sorted arrays sizes 20 and 30','20','49'],['Bottom-up heapify 7 items','6','8'],['Binary search ordered array of 7 for a key','1','3'],['Counting sort 52 cards by suit','0','0']].flatMap(([l,b,w],i)=>[F(140+i*2,`${l}: best`,b,['ASYMPTOTICS']),F(141+i*2,`${l}: worst`,w,['ASYMPTOTICS'])]),
  ]),
  problem('11','Sheep Herding (55 pts)',null,[
    text('Must take sheep at position 0, then repeatedly advance between A and B positions inclusive. Maximize total value. Assume B≥A>0.'),
    F(160,'For values {5,2,−3,2,2,10}, A=2, B=3, maximum total','17',['RECURSION']),
    java(`static int maxSheepNaiveHelper(int[] values, int A, int B, int c) {
  if (⟪a⟫) return ⟪b⟫;
  int best = ⟪c⟫;
  for (int s=⟪d⟫; ⟪e⟫; s++) {
    int val = values[c] + maxSheepNaiveHelper(values,A,B,⟪f⟫);
    best = Math.max(⟪g⟫, ⟪h⟫);
  }
  return best;
}`),
    ...[['Past end','c >= values.length'],['Empty suffix','0'],['Initialize best','Integer.MIN_VALUE'],['Start step','A'],['Loop through B','s <= B'],['Next index','c + s'],['First max argument','best'],['Second max argument','val']].map(([l,a],i)=>F(161+i,l,a,['RECURSION','RECURSION'])),
    text('For values [2,1,−3,6,8,−2,−1,4], define Q(i) as the best achievable total starting at position i. Fill Q from left to right.'),
    F(169,'Q values in index order','11 13 9 8 12 2 -1 4',['RECURSION']),
    F(170,'Dynamic programming runtime in N,A,B','N(B - A)',['RECURSION','ASYMPTOTICS']),
  ]),
  problem('12','IntSibTree (51 pts)',null,[
    text('Each sibling-tree node contains item, sibling (next sibling), and child (first child). Items are nonnegative.'),
    java(`static int largestSibling(IntSibTree t) {
  if (t == null) return 0;
  return ⟪a⟫;
}
static void postOrder(IntSibTree t, Visitor v) {
  if (t == null) { ⟪b⟫ }
  ⟪c⟫
  ⟪d⟫
  ⟪e⟫
}`),
    ...[['Largest sibling recursion','Math.max(t.item, largestSibling(t.sibling))'],['Null case return','return;'],['Visit child subtree','postOrder(t.child, v);'],['Visit current node','v.visit(t);'],['Visit sibling subtree','postOrder(t.sibling, v);']].map(([l,a],i)=>F(180+i,l,a,['TREE_TRAVERSALS'])),
    text('Implement MaxPathFinder as a postorder Visitor. Assume largestSibling(list) and secondLargestSibling(list) return the largest and second-largest item among sibling-chain nodes (0 if absent). For a node, the best downward contribution is item plus the largest child contribution; a path through it can combine the top two child contributions. Values are nonnegative.'),
    java(`class MaxPathFinder implements Visitor {
  int bestPathSum;
  MaxPathFinder() { ⟪f⟫ }
  public void visit(IntSibTree t) {
    int largest = largestSibling(t.child);
    int secondLargest = secondLargestSibling(t.child);
    int subTreeTotal = ⟪g⟫;
    int thisBestPathSum = ⟪h⟫;
    t.item = subTreeTotal;
    bestPathSum = Math.max(⟪i⟫, ⟪j⟫);
  }
  int result() { return ⟪k⟫; }
}`),
    ...[['Initialize best result','bestPathSum = 0'],['Downward contribution','largest + t.item'],['Path through node','largest + secondLargest + t.item'],['Update best result','bestPathSum'],['Candidate path value','thisBestPathSum'],['Return best path','bestPathSum']].map(([l,a],i)=>F(185+i,l,a,['TREE_TRAVERSALS','RECURSION'])),
  ]),
  problem('13','Flight Planning (30 pts; scored with Midterm 2)',null,[
    text('Use the unmodified SNRPLTE(G,s,t,W), which tests whether a no-repeated-vertex path from s to t has total weight ≤W. To detect a Hamiltonian path (world tour) in an undirected, unweighted graph G, construct a graph γ.'),
    F(191,'New vertices added to γ','s and t',['GRAPH_REPRESENTATIONS']),
    F(192,'Added directed edges','s to every copied vertex, and every copied vertex to t',['GRAPH_REPRESENTATIONS']),
    F(193,'Weight assigned to each edge','-1',['GRAPH_REPRESENTATIONS']),
    F(194,'SNRPLTE threshold W, for V original vertices','-(V + 1)',['GRAPH_REPRESENTATIONS']),
    F(195,'Return value','SNRPLTE(γ, s, t, -(V + 1))',['GRAPH_REPRESENTATIONS']),
  ]),
]);
