// Fall 2020 Final: scored questions transcribed from the exam and solutions.
import { exam, problem, text, java, blank, mc, sata, txt } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...tags) => site(...tags);
const F = (id, label, answer, tags = ['JAVA']) => blank(id, label, answer, T(...tags));
const C = (id, label, options, answer, tags = ['JAVA']) => mc(id, label, options, answer, T(...tags));
const S = (id, label, options, answers, tags = ['JAVA']) => sata(id, label, options, answers, T(...tags));
const THETA = ['Θ(1)','Θ(log N)','Θ(N)','Θ(N log N)','Θ(N²)','Θ(N² log N)','Θ(N³)','Θ(N⁴)','Worse than Θ(N⁴)','Never terminates'];
export default exam('61b-fa20-final', 'Fall 2020 Final', {
  exam: 'https://drive.google.com/file/d/1A1YPTJAsiVOQtIUiQgPFL6rM2T9oXntW/view',
  sol: 'https://drive.google.com/file/d/1nRrI0buwfZ-c9eAzVzKP3_MSfM0Nh5Fw/view',
}, 'fa20-final', [
  problem('2','Basic Sorts (180 pts)',null,[
    text('Initial array is [4, 5, 1, 2, 3, 7]. Identify the first swap made by each algorithm, or select no swaps.'),
    ...[['Selection sort','4-1'],['Insertion sort','5-1'],['Quicksort-LTH with Hoare partition, no shuffle','5-3'],['Merge sort','No swaps'],['In-place heapsort','1-7'],['Counting sort','No swaps']].map(([l,a],i)=>C(1+i,l,['4-5','4-1','4-2','4-3','4-7','5-1','5-2','5-3','5-7','1-2','1-3','1-7','2-3','2-7','3-7','No swaps'].map(String),['4-5','4-1','4-2','4-3','4-7','5-1','5-2','5-3','5-7','1-2','1-3','1-7','2-3','2-7','3-7','No swaps'].indexOf(a),['SORTING'])),
  ]),
  problem('3','New Traversals (220 pts)',null,[
    text('Undirected graph edges: 1–2, 2–5, 2–4, 4–3. DFS visits smaller neighbors first.'),
    F(10,'DFS preorder from node 4','4, 2, 1, 5, 3',['GRAPH_TRAVERSALS']),
    F(11,'DFS postorder from node 2','1, 3, 4, 5, 2',['GRAPH_TRAVERSALS']),
    text('For a binary tree, pre/in traversal is: print node; recurse left; print node again; recurse right. Use this tree: root 1, left child 2; node 2 has left child 5 and right child 4; node 4 has left child 3.'),
    F(12,'Pre/in traversal from root 1','1, 2, 5, 5, 2, 4, 3, 3, 4, 1',['TREE_TRAVERSALS']),
    text('Given pre/in traversal 9,3,3,6,5,1,1,5,6,9, answer:'),
    ...[['Number of nodes','5'],['Height','4'],['Left child of 6','5'],['Parent of 1','5'],['Level order traversal','9, 3, 6, 5, 1']].map(([l,a],i)=>F(13+i,l,a,['TREE_TRAVERSALS'])),
    F(18,'Number of distinct binary trees with pre/in traversal 2,2,2,2,2,2,3,3','5',['TREE_TRAVERSALS']),
  ]),
  problem('4','Java Syntax and Data Structure Usage (220 pts)',null,[
    text('PrimeFactorIterator returns the prime factors of positive integer x in increasing order, with repeated factors included.'),
    java(`class PrimeFactorIterator implements ⟪a⟫, ⟪b⟫ {
  private int x;
  PrimeFactorIterator(int givenX) { ⟪c⟫ }
  public boolean hasNext() { return ⟪d⟫; }
  public int next() {
    int i=2;
    while (⟪e⟫) { ⟪f⟫ }
    x = ⟪g⟫;
    return i;
  }
  public Iterator<Integer> iterator() { return ⟪h⟫; }
}`),
    ...[['Iterator interface','Iterator<Integer>'],['Iterable interface','Iterable<Integer>'],['Store input','this.x = givenX'],['Has next factor','x >= 2'],['Find smallest divisor','x % i != 0'],['Try next divisor','i = i + 1'],['Remove factor from x','x / i'],['Iterable returns itself','this']].map(([l,a],i)=>F(20+i,l,a,['ITERATORS','JAVA'])),
    java(`private int uniquePrimeFactorCount(int x) {
  HashSet<Integer> set = ⟪i⟫;
  for (int factor : new PrimeFactorIterator(x)) { ⟪j⟫ }
  return ⟪k⟫;
}`),
    ...[['Create set','new HashSet<Integer>()'],['Remember factor','set.add(factor);'],['Return unique count','set.size()']].map(([l,a],i)=>F(28+i,l,a,['HASHING','ADTS'])),
    text('Keep the k values in [1,n] with the largest uniquePrimeFactorCount. Use O(k) memory and O(n log k) time. MinPQ uses the supplied comparator and removeSmallest().'),
    java(`Comparator<Integer> c = ⟪m⟫;
MinPQ<Integer> pq = new MinPQ<>(⟪n⟫);
for (int i=1; i<=n; i++) {
  ⟪o⟫
  ⟪p⟫
}
for (int i : pq) ⟪q⟫;`),
    ...[['Comparator construction','new UniqueFactorCountComparator()'],['Priority queue comparator argument','c'],['Add candidate','pq.add(i);'],['Trim to k values','if (pq.size() > k) pq.removeSmallest();'],['Print retained values','System.out.println(i)']].map(([l,a],i)=>F(31+i,l,a,['COMPARATORS','HEAPS'])),
  ]),
  problem('5','Sorting Variations (150 pts)',null,[
    text('All strings are unique and constant length. P1sort: partition around leftmost pivot; selection-sort the left partition; quicksort the right partition (P1sort itself is not recursive).'),
    C(40,'P1sort best-case runtime',THETA,THETA.indexOf('Θ(N log N)'),['SORTING','ASYMPTOTICS']),
    C(41,'P1sort worst-case runtime',THETA,THETA.indexOf('Θ(N²)'),['SORTING','ASYMPTOTICS']),
    text('P2sort splits in half, heapsorts the left half, randomly chooses Selection/Merge/Quick/LSD/P2sort for the right half, then merges.'),
    C(42,'P2sort best-case runtime',THETA,THETA.indexOf('Θ(N log N)'),['SORTING','ASYMPTOTICS']),
    C(43,'P2sort worst-case runtime',THETA,THETA.indexOf('Θ(N²)'),['SORTING','ASYMPTOTICS']),
    text('P3sort splits in half, independently chooses Selection/Merge/Quick/LSD/P3sort for each half, then merges.'),
    C(44,'P3sort best-case runtime',THETA,THETA.indexOf('Θ(N)'),['SORTING','ASYMPTOTICS']),
    C(45,'P3sort worst-case runtime',THETA,THETA.indexOf('Θ(N²)'),['SORTING','ASYMPTOTICS']),
    C(46,'P3sort runtime when it chooses itself at every recursive choice',THETA,THETA.indexOf('Θ(N log N)'),['SORTING','ASYMPTOTICS']),
  ]),
  problem('6','Minimum Spanning Trees (150 pts)',null,[
    text('Undirected weighted graph: DP=8, DA=4, DN=3, NA=5, AV=6, JV=7, AP=9, AI=1, IR=2. Run Prim from P; break ties alphabetically.'),
    F(50,'Prim node visitation order','P, D, N, A, I, R, V, J',['MSTS']),
    S(51,'Which edges are in the MST?',['AV','IR','AI','AN','JV','DN','DP','AD','AP'],[0,1,2,4,5,6],['MSTS']),
    text('For each edge independently, replace only its weight with a value that creates multiple MSTs. Give None if impossible.'),
    ...[['AD','5'],['AP','8'],['DN','5'],['AI','None'],['AV','None'],['IR','None'],['AN','4'],['DP','9'],['JV','None']].map(([l,a],i)=>F(52+i,`Replacement weight for ${l}`,a,['MSTS'])),
  ]),
  problem('7','Hashing Bears (80 pts)',null,[
    text('HashMap bucket array has length 4 and never resizes. Bear.equals compares names; hashCode is name.length(). Start with a="sohum", b="arjun". Operations: put(a,1); put(b,2); double a.name; put(a,3); put(b,4); double b.name; put(b,5). Buckets are indexed by hashCode mod 4.'),
    ...[['map.size()','4'],['get(new Bear("sohum"))','null'],['get(new Bear("sohumsohum"))','3'],['Bucket 1 list length','2'],['Bucket 1 values in order','1, 4'],['Bucket 2 list length','2'],['Bucket 2 values in order','3, 5']].map(([l,a],i)=>F(70+i,l,a,['HASHING'])),
  ]),
  problem('8','BST Rotations (160 pts)',null,[
    text('BST structure: root 5; 5.left=3, 5.right=11; 3.left=2, 3.right=4; 2.left=1; 11.left=9, 11.right=12; 9.left=7, 9.right=10; 7.left=6, 7.right=8. A left rotation at node p5 promotes its right child.'),
    ...[['Root after rotateLeft(5)','11'],['3 parent','5'],['5 parent','11'],['9 parent','5'],['11 parent','-1'],['12 parent','11']].map(([l,a],i)=>F(80+i,l,a,['BSTS'])),
    text('Rotate the same tree so that node 10 becomes the root, using three rotations.'),
    ...[['First rotation type','rotateLeft'],['First rotated node','9'],['Second rotation type','rotateRight'],['Second rotated node','11'],['Third rotation type','rotateLeft'],['Third rotated node','5']].map(([l,a],i)=>F(86+i,l,a,['BSTS'])),
    java(`public void rotateUp(int value) { ⟪a⟫ }
public void rotateUpHelper(int value, BSTNode curr) {
  if (⟪b⟫) { ⟪c⟫ }
  if (⟪d⟫) {
    ⟪e⟫
    ⟪f⟫
  } else {
    ⟪g⟫
    ⟪h⟫
  }
}`),
    ...[['Start helper at root','rotateUpHelper(value, root);'],['Target found','curr.value == value'],['Stop recursion','return;'],['Target in left subtree','value < curr.value'],['Recurse left','rotateUpHelper(value, curr.left);'],['Rotate right','rotateRight(curr);'],['Recurse right','rotateUpHelper(value, curr.right);'],['Rotate left','rotateLeft(curr);']].map(([l,a],i)=>F(92+i,l,a,['BSTS'])),
  ]),
  problem('9','Shortest Paths (220 pts)',null,[
    text('Undirected weighted graph edges: AB=5, AC=3, BC=4, BD=2, BE=4, BF=10, CD=1, DG=4, EF=1, FG=1. Break ties alphabetically.'),
    F(110,'BFS first four visits from G','G, D, F, B',['GRAPH_TRAVERSALS']),
    ...[['distTo(B)','5'],['distTo(C)','3'],['distTo(D)','4'],['distTo(E)','9'],['distTo(F)','9'],['distTo(G)','8']].map(([l,a],i)=>F(111+i,l,a,['SHORTEST_PATHS'])),
    F(117,'Dijkstra visitation order from A','A, C, D, B, G, E, F',['SHORTEST_PATHS']),
    S(118,'Edges in Dijkstra shortest-path tree from A',['AC','AB','BC','BD','BE','BF','CD','DG','EF','FG'],[0,1,4,6,7,9],['SHORTEST_PATHS']),
    C(119,'Minimum integer k to subtract from one edge so Dijkstra returns an incorrect A-to-G shortest path',['2','3','4','5'],2,['SHORTEST_PATHS']),
    C(120,'Which edge changed by that minimum k makes Dijkstra fail?',['AC','AB','BC','BD','BF','CD','DG','EF','FG'],3,['SHORTEST_PATHS']),
    text('Run A* from A to G with h(v) equal to shortest-path distance from v to E (h(E)=0, h(F)=1, h(G)=2, h(B)=4).'),
    F(121,'Priority assigned to C when added to fringe','10',['SHORTEST_PATHS']),
    F(122,'A* visit order','A, B, E, C, D, G',['SHORTEST_PATHS']),
    C(123,'Does A* compute the correct shortest A-to-G distance for this graph and heuristic?',['Yes','Depends on priority queue tie-breaking','No'],0,['SHORTEST_PATHS']),
  ]),
  problem('10','Optimal Peak (210 pts)',null,[
    text('Undirected positive-weight trail graph: AD=7, AB=2, AS=6, SB=5, SG=1, GB=2, BD=8, BC=7, GE=4, GF=7, EF=3, EC=5. A valid goal has two equally short paths from start to goal that enter and leave the goal on different edges; maximize total round-trip distance.'),
    text('For each start, give the optimal goal and the set of trails used in the round trip (list each trail once).'),
    S(130,'Trails traversed for start C',['AB','AD','AS','BC','BD','BG','BS','CE','EF','EG','FG','GS','None'],[3,5,7,9],['SHORTEST_PATHS']),
    C(131,'Optimal peak for start C',['A','B','C','D','E','F','G','S','None'],6,['SHORTEST_PATHS']),
    S(132,'Trails traversed for start A',['AB','AD','AS','BC','BD','BG','BS','CE','EF','EG','FG','GS','None'],[0,5,8,9,10],['SHORTEST_PATHS']),
    C(133,'Optimal peak for start A',['A','B','C','D','E','F','G','S','None'],5,['SHORTEST_PATHS']),
    text('Describe the steps of an O(E log V) algorithm for finding the optimalPeak. The trip must be equal-length in both directions, each direction must be shortest, and the first and last trails at the goal must differ.'),
    ...[['Run shortest paths from start','Dijkstra'],['For candidate v, inspect neighbors other than its chosen predecessor','all adjacent vertices w except edgeTo(v)'],['Check alternate route equality','distTo(w) + weight(w,v) == distTo(v)'],['Keep candidate with greatest distance','maximum distTo(v) among those with another shortest predecessor'],['Return','the farthest qualifying vertex, or null if none']].map(([l,a],i)=>F(134+i,l,a,['SHORTEST_PATHS','MSTS'])),
  ]),
]);
