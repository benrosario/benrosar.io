// Spring 2026 Final, transcribed from official solutions. Zero-point Q3 and Q11 omitted.
import { exam, problem, text, java, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';
const E='61b-sp26-final', S=(...l)=>staff(E,...l);
let n=0;
const B=(label,answer,tag,note)=>blank(++n,label,answer,{...S(tag),...(note?{x:note}:{})});
const M=(label,options,answer,tag,note)=>mc(++n,label,options,answer,{...S(tag),...(note?{x:note}:{})});
const A=(label,options,answers,tag,note)=>sata(++n,label,options,answers,{...S(tag),...(note?{x:note}:{})});
export default exam(E,'Spring 2026 Final',{
  exam:'https://drive.google.com/file/d/1_hEpsaaXXBzYc7Q_-f6vNZ1Wp2wjSAIx/view',
  sol:'https://drive.google.com/file/d/1MQJcbLOn8YJD0sOyVpUsWvONps5nEWTl/view',
},'sp26-final',[
  problem('1','Blocking and Tackling (13.25 pts)',null,[
    text('Weighted Quick Union without path compression has parent array [-1, 3, -1, 6, 3, 6, -6, 6] for items 0 through 7.'),
    B('(1.1) Root of item 1','6','1.1','Follow 1 → 3 → 6; a negative parent entry marks the root.'),
    B('(1.2) Parent array after connect(1, 0)','6,3,-1,6,3,6,-7,6','1.2','Root 6 has weight 6 and root 0 has weight 1, so 0 joins 6.'),
    text('A trie holds car, cast, cab, do, and dog. Each node stores one character; isKey marks the end of a key.'),
    B('(1.3) New nodes when inserting cart','1','1.3'),
    A('(1.4) Keys returned by keysWithPrefix("ca")',['c','ca','car','cast','cab','None'],[2,3,4],'1.4'),
    B('(1.5) Insertion-sort swaps for [6, 1, 2, 4, 3, 5]','6','1.5','The number of swaps equals the number of inversions.'),
    M('(1.6) Why must LSD radix sort use a stable digit sort?',['To preserve order from earlier digit passes','To prevent quadratic space use','To handle unequal-length keys','To avoid recursion'],0,'1.6'),
    B('(1.7) [123, 456, 132, 465, 100] after the ones-digit pass','100,132,123,465,456','1.7'),
    text('For the next questions, use this directed graph: B→A, B→D, D→A, D→C, D→E, A→E. Weights: B→A 5, B→D 1, D→A 2, D→C 1, D→E 1, A→E 5. Consider neighbors alphabetically.'),
    B('(1.8) DFS preorder from B','B,A,E,D,C','1.8'),
    B('(1.9) BFS order from B','B,A,D,E,C','1.9'),
    B('(1.10) Dijkstra removal order from B',['B,D,C,E,A','B,D,E,A,C'],'1.10','The printed answer conflicts with its own trace. With alphabetical tie-breaking and the stated edges, C precedes E, and A comes last; the printed order is also accepted.'),
    B('(1.11) Number of valid topological sorts','3','1.11'),
    text('For Kruskal, use undirected edges with distinct weights: 1 A–B; 2 C–D; 3 B–C; 4 A–C; 5 D–E; 6 B–E; 7 E–F; 8 A–F.'),
    B('(1.12) MST edge weights in the order added','1,2,3,5,7','1.12'),
  ]),
  problem('2','Sorta Familiar (12 pts)',null,[
    text('The max-heap arrays below use index 0 as the root. Start with [5,7,6,4,3,8,2,1].'),
    B('(2.1) Result of inserting elements one at a time','8,5,7,4,3,6,2,1','2.1'),
    B('(2.2) Result of bottom-up heapifying the same array','8,7,6,4,3,5,2,1','2.2'),
    B('(2.3) [8,6,7,5,2,3,4,1] after one in-place heap-sort delete-max','7,6,4,5,2,3,1,8','2.3'),
    M('(2.4) Which insertion order gives the maximum possible swaps for numbers 1–8?',['1,2,3,4,5,6,7,8','8,7,6,5,4,3,2,1','5,7,6,4,3,8,2,1','1,3,5,7,2,4,6,8'],0,'2.4','In increasing order each new item swims to the root.'),
    B('(2.5) A bottom-up-heapify input with maximum swaps, with index 2 fixed at 1, index 5 at 2, and index 6 at 3', ['4,5,1,7,6,2,3,8','4,6,1,7,5,2,3,8','5,6,1,7,4,2,3,8'],'2.5'),
    B('(2.6) Maximum comparisons for selection sort, N=8','28','2.6'),
    B('(2.6) Maximum comparisons for insertion sort, N=8','28','2.6'),
    B('(2.6) Maximum comparisons for mergesort, N=8','17','2.6'),
    B('(2.7) [6,3,9,2,8,1,7,4] after one Tony Hoare partition around 6','1,3,4,2,6,8,7,9','2.7'),
  ]),
  problem('4','DS Time (13.5 pts)',null,[
    text('Worst-case Θ runtimes in N items. Ordinary BSTs need not be balanced; LLRBs are balanced. Hash tables use linked-list or LLRB buckets, spread evenly. The min-heap is array-backed.'),
    ...[
      ['BST find min','Θ(N)'],['BST delete min','Θ(N)'],['LLRB delete min','Θ(log N)'],
      ['Hash table (linked-list buckets) find min','Θ(N)'],['Hash table (LLRB buckets) find min','Θ(N)'],
      ['Min-heap find min','Θ(1)'],['Min-heap find max','Θ(N)'],
    ].map(([operation,answer])=>M(`(4.1) ${operation}`,['Θ(1)','Θ(log N)','Θ(N)','Θ(N log N)','Θ(N²)'],['Θ(1)','Θ(log N)','Θ(N)','Θ(N log N)','Θ(N²)'].indexOf(answer),'4.1')),
    A('(4.2) Best-case insertion into an unbalanced BST: select every valid bound',
      ['Ω(1)','Ω(log N)','Ω(N)','Θ(1)','Θ(log N)','Θ(N)','O(1)','O(log N)','O(N)'],[0,3,6,7,8],'4.2','A new item can attach directly to the root.'),
    A('(4.3) Worst-case insertion into an unbalanced BST: select every valid bound',
      ['Ω(1)','Ω(log N)','Ω(N)','Θ(1)','Θ(log N)','Θ(N)','O(1)','O(log N)','O(N)'],[0,1,2,5,8],'4.3','A spindly tree can require a full descent.'),
  ]),
  problem('5','Hasheteria (8 pts)',null,[
    text('HashMap<Integer,String> starts with four buckets. Each bucket is an LLRB. Integer keys hash to themselves. Insert (5,cat), (0,dog), (1,egg), (4,pie), (9,fox), without resizing.'),
    M('(5.1) Bucket 0 after insertion',['Black 4/pie root with red 0/dog left child','Black 0/dog root with red 4/pie right child','Black 4/pie root with black 0/dog left child','Empty'],0,'5.1'),
    M('(5.1) Bucket 1 after insertion',['Black 5/cat root, black 1/egg left and 9/fox right','Black 9/fox root with red 5/cat left','Black 1/egg root with red 5/cat right','Empty'],0,'5.1'),
    M('(5.1) Buckets 2 and 3',['Both empty','2 holds dog and 3 holds fox','2 empty, 3 holds egg','Both hold red nodes'],0,'5.1'),
    M('(5.2) Tightest worst-case O bound for contains in a table with N items',['O(1)','O(log N)','O(N)','O(N log N)'],1,'5.2','All items can land in one balanced LLRB bucket.'),
    M('(5.3) Tightest worst-case O bound for a put that may resize',['O(1)','O(log N)','O(N)','O(N log N)','O(N²)'],3,'5.3','Rehashing N entries into one balanced bucket can take O(N log N).'),
  ]),
  problem('6','Hashing with Fire (5.5 pts)',null,[
    text('A HashSet<List<Integer>> has 10 buckets and no resizing. A list hash is its element sum plus its length. Start with L=[2,4,7], add L to the set, then mutate the same L. Its stored reference stays in its original bucket.'),
    M('(6.1) Which pair of appended values makes contains(L) print true, then false after removing that value?',['9, then 0','0, then 9','9, then 19','0, then 10'],0,'6.1','The original hash is 16, hence bucket 6. After appending x, the hash is 17+x.'),
    text('Point2D.equals compares x and y, but ignores name. For each candidate hashCode body, decide if a HashSet always behaves correctly.'),
    ...[
      ['return 0;',0],['return x;',0],['return 31 * x + y;',0],
      ['return name.hashCode();',1],['return 31 * x + y + name.hashCode();',1],
    ].map(([body,answer])=>M(`(6.2) ${body}`,['Always correct','Sometimes incorrect'],answer,'6.2')),
  ]),
  problem('7','Asymptotics (13.75 pts)',null,[
    java(`void zoom(int[] arr, int idx) {
    if (idx <= 1) return;
    for (int i = 0; i < idx; i++) IO.println("hi");
    if (arr[idx-1] > 0) zoom(arr, idx/2);
    else zoom(arr, idx-1);
}`),
    M('(7.1) Best-case runtime of zoom(arr,N)',['Θ(log N)','Θ(N)','Θ(N log N)','Θ(N²)'],1,'7.1'),
    M('(7.1) Worst-case runtime of zoom(arr,N)',['Θ(log N)','Θ(N)','Θ(N log N)','Θ(N²)'],3,'7.1'),
    text('For each quicksort variant on distinct items, classify whether its runtime is never, sometimes, or always Θ(N²). Assume partition and shuffle cost Θ(N).'),
    ...[
      ['Shuffle once, then use the leftmost pivot',1],['No shuffle; use the leftmost pivot',1],
      ['No shuffle; find and use the median pivot in Θ(N)',0],['Shuffle once; use the minimum pivot',2],
      ['Leftmost pivot; switch to mergesort at recursion depth 64',0],
    ].map(([variant,answer])=>M(`(7.2) ${variant}`,['Never Θ(N²)','Sometimes Θ(N²)','Always Θ(N²)'],answer,'7.2')),
    java(`ArrayList<Integer> dedup(int[] arr) {
    ArrayList<Integer> seen = new ArrayList<>();
    for (int x : arr) if (!seen.contains(x)) seen.add(x);
    return seen;
}`),
    M('(7.3) Best-case runtime of dedup',['Θ(1)','Θ(N)','Θ(N log N)','Θ(N²)'],1,'7.3'),
    M('(7.3) Worst-case runtime of dedup',['Θ(1)','Θ(N)','Θ(N log N)','Θ(N²)'],3,'7.3'),
    java(`TreeSet<Integer> firstHundred(int[] arr) {
    TreeSet<Integer> seen = new TreeSet<>();
    for (int x : arr) {
        seen.add(x);
        if (seen.size() == 100) return seen;
    }
    return seen;
}`),
    M('(7.4) Best-case runtime of firstHundred',['Θ(1)','Θ(log N)','Θ(N)','Θ(N log N)'],0,'7.4','The first 100 items can be distinct, so the method stops after a constant number of iterations.'),
    M('(7.4) Worst-case runtime of firstHundred',['Θ(1)','Θ(log N)','Θ(N)','Θ(N log N)'],2,'7.4','With fewer than 100 unique items it processes all N entries in a constant-size tree.'),
  ]),
  problem('8','BasicUndirectedGraph (16 pts)',null,[
    text('Represent an undirected graph as Map<Integer, Set<Integer>> adj. connect(p,q) adds an edge; disconnect removes one; neighbors returns the adjacent vertices or an empty set.'),
    java(`BasicUndirectedGraph() { adj = ⟪a⟫; }
void connect(int p, int q) {
    if (!adj.containsKey(p)) ⟪b⟫;
    if (!adj.containsKey(q)) ⟪c⟫;
    ⟪d⟫;
    ⟪e⟫;
}`, {a:'new HashMap<>()',b:'adj.put(p, new HashSet<>())',c:'adj.put(q, new HashSet<>())',d:'adj.get(p).add(q)',e:'adj.get(q).add(p)'}),
    B('(8.1) Initialize map','new HashMap<>()','8.1'),
    B('(8.1) Initialize p neighborhood','adj.put(p, new HashSet<>())','8.1'),
    B('(8.1) Initialize q neighborhood','adj.put(q, new HashSet<>())','8.1'),
    B('(8.1) Add q to p neighborhood','adj.get(p).add(q)','8.1'),
    B('(8.1) Add p to q neighborhood','adj.get(q).add(p)','8.1'),
    java(`void disconnect(int p, int q) {
    if (adj.containsKey(p)) ⟪a⟫;
    if (adj.containsKey(q)) ⟪b⟫;
}`, {a:'adj.get(p).remove(q)',b:'adj.get(q).remove(p)'}),
    B('(8.2) Remove q from p neighborhood','adj.get(p).remove(q)','8.2'),
    B('(8.2) Remove p from q neighborhood','adj.get(q).remove(p)','8.2'),
    java(`Set<Integer> neighbors(int p) {
    if (!adj.containsKey(p)) return ⟪a⟫;
    return ⟪b⟫;
}`, {a:'new HashSet<>()',b:'adj.get(p)'}),
    B('(8.3) Empty result for absent vertex','new HashSet<>()','8.3'),
    B('(8.3) Existing neighborhood','adj.get(p)','8.3'),
  ]),
  problem('9','Concat (8 pts)',null,[
    text('Return true if any string in strs equals the concatenation of two strings in strs. The same element may be used twice. Assume no null strings.'),
    java(`boolean concat(String[] strs) {
    Set<String> seen = ⟪a⟫;
    for (String s : strs) ⟪b⟫;
    for (String a : strs) for (String b : strs) {
        if (⟪c⟫) return true;
    }
    return false;
}`, {a:'new HashSet<>()',b:'seen.add(s)',c:'seen.contains(a + b)'}),
    B('(9.1) Efficient lookup structure','new HashSet<>()','9.1'),
    B('(9.1) Add a source string','seen.add(s)','9.1'),
    B('(9.1) Check a concatenation','seen.contains(a + b)','9.1'),
  ]),
  problem('10','Recursive Programming (10 pts)',null,[
    text('TreeNode has left, right, and int item. The methods operate on a BST.'),
    java(`TreeNode max(TreeNode x) {
    if (x == null) return null;
    if (⟪a⟫) return x;
    return ⟪b⟫;
}`, {a:'x.right == null',b:'max(x.right)'}),
    B('(10.1) Max base case','x.right == null','10.1'),
    B('(10.1) Recurse right','max(x.right)','10.1'),
    java(`TreeNode deleteMin(TreeNode x) {
    if (x.left == null) return ⟪a⟫;
    ⟪b⟫;
    return x;
}`, {a:'x.right',b:'x.left = deleteMin(x.left)'}),
    B('(10.2) Root after deleting a minimum with no left child','x.right','10.2'),
    B('(10.2) Reconnect the left subtree','x.left = deleteMin(x.left)','10.2'),
    java(`void hibbardDelete(TreeNode x) {
    TreeNode successor = ⟪a⟫;
    ⟪b⟫;
    ⟪c⟫;
}`, {a:'min(x.right)',b:'x.item = successor.item',c:'x.right = deleteMin(x.right)'}),
    B('(10.3) Choose successor','min(x.right)','10.3'),
    B('(10.3) Replace item','x.item = successor.item','10.3'),
    B('(10.3) Remove successor from right subtree','x.right = deleteMin(x.right)','10.3'),
  ]),
]);
