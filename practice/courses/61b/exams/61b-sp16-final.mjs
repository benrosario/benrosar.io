// Spring 2016 CS 61B Final: scored questions only. Zero-point admin/trivia omitted.
import { exam, problem, text, java, blank, mc } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...topics) => site(...topics);
const answer = (id, label, value, ...topics) => blank(id, label, value, T(...topics));

export default exam('61b-sp16-final', 'Spring 2016 Final', {
  exam: 'https://drive.google.com/file/d/1Ta5ubPr7LThYI21nI-wxcFKtH3FDZa5S/view',
  sol: 'https://drive.google.com/file/d/1yVkqsnEyEJlN34IwahG1QsuUomCyifFJ/view',
}, 'sp16-final', [
  problem('1', 'Giraphage (8 pts)', null, [
    text('Directed weighted graph: A→B (3), B→D (1), D→E (1), E→G (3), G→E (1), F→G (2), C→F (8), A→C (2), B→A (2), D→A (2).'),
    text('For DFS from A and BFS from D, visit alphabetically earlier neighbors first.'),
    answer(1,'(a) DFS visit order','ABDEGCF','GRAPH_TRAVERSALS'),
    answer(2,'(b) BFS visit order','DAEBCGF','GRAPH_TRAVERSALS'),
    text('For Dijkstra from A, “visit” means relax all outgoing edges. Break distance ties alphabetically.'),
    answer(3,'(c) Dijkstra visit order','ACBDEGF','GRAPH_TRAVERSALS'),
    text('A* seeks a shortest path from A to G. The fixed heuristic values are h(A)=0, h(B)=3, h(C)=2, h(D)=2, h(F)=1, h(G)=0.'),
    mc(4,'(d) Which value of h(E) can make A* return the wrong shortest paths tree?',['-4','1','2','5','88','14'],4,T('GRAPH_TRAVERSALS')),
  ]),
  problem('2','Sorting (8 pts)', null, [
    text('The exam shows an unsorted array in column 1, five intermediate arrays in columns 2–6, and the sorted array in column 7. Match columns 2–6 to insertion sort, quicksort, heapsort, LSD radix sort, and MSD radix sort. Useful clues from the printed arrays: column 2 is grouped by the thousands digit; column 3 has a sorted prefix while its suffix is untouched; column 4 is a heap with two maximum items at the end; column 5 is ordered when the thousands digit is ignored; column 6 has its first item in final position after partitioning.'),
    ...[['2','MSD radix sort'],['3','Insertion sort'],['4','Heapsort'],['5','LSD radix sort'],['6','Quicksort']].map(([n,a],i)=>answer(5+i,`(a) Algorithm in column ${n}`,a,'SORTING')),
    answer(10,'(a) Column containing the sorted array','7','SORTING'),
    mc(11,'(b) Which traversal of a BST prints keys in sorted order?',['Preorder','Inorder','Postorder','Reverse-preorder','Reverse-postorder'],1,T('BSTS','SORTING')),
    answer(12,'(c) Worst-case runtime of random insertion into an LLRB, then inorder traversal, in Θ notation','Θ(N log N)','BSTS','SORTING'),
  ]),
  problem('3','Reverse Engineering (6 pts)', null, [
    text('Selection sort question uses distinct symbols. The unsorted order is [astrology, dotted triangle, plus, diamond, arc, circle, divided circle, infinity]. After an unknown number of minimum-selection iterations it is [circle, infinity, plus, diamond, astrology, arc, divided circle, dotted triangle]. For each pair, give <, >, or ? (insufficient information): (i) divided circle compared with circle; (ii) divided circle compared with astrology; (iii) divided circle compared with dotted triangle; (iv) infinity compared with dotted triangle.'),
    ...[['>'],['?'],['?'],['<']].map(([a],i)=>answer(13+i,`(a) Relation ${i+1}`,a,'SORTING')),
    text('All topological sorts of a directed graph are listed: 1234567, 1234657, 1324567, 1324657. Give a valid adjacency list. The minimal graph has edges 1→2, 1→3, 4→5, 4→6, and 6→5; vertices 1 and 4 precede 7 through the listed orders, but 7 has no required outgoing edge.'),
    answer(17,'(b) Give a valid adjacency list','1: 2,3; 2: 7; 3: 7; 4: 5,6; 5: 7; 6: 7; 7: []','GRAPH_TRAVERSALS'),
  ]),
  problem('4','Facts (12 pts)', null, [
    text('Sorting facts: from the bank {A quicksort (nonrandom, in-place Hoare, leftmost pivot), B mergesort, C selection sort, D insertion sort, E LSD radix, F MSD radix, G heapsort, N none}, list all applicable letters.'),
    answer(18,'(a) Bounded by Ω(N log N) lower bound','A, B, C','SORTING'),
    answer(19,'(a) Comparison sort with worst case asymptotically better than quicksort’s worst case','B, G','SORTING'),
    answer(20,'(a) Worst case performs Θ(N) pairwise swaps','C','SORTING'),
    answer(21,'(a) Comparison sort that never compares the same pair twice','A, B, D','SORTING'),
    answer(22,'(a) Best case Θ(log N) for some inputs','N','SORTING'),
    text('Answer True or False.'),
    ...[
      ['Inserting one item into a “bushy” balanced BST with N items takes Θ(log N) in all cases.','Either'],
      ['Inserting one item into a heap with N items takes Θ(log N) in all cases.','False'],
      ['The height of an N-item BST is O(N).','True'],
      ['Squaring all integer keys in a valid BST always leaves a BST.','False'],
      ['Every valid left-leaning red-black tree is a valid BST.','True'],
      ['Every valid weighted quick-union tree is a valid BST.','False'],
      ['In a max heap, the parent of the second-largest item is always the root.','Either'],
      ['The parent of the parent of the third-largest item in a max heap is always the root.','False'],
      ['A perfectly balanced quadtree with N items has asymptotically the same height as a 2–3 tree with N items.','True'],
      ['Finding all matching tiles in getMapRaster using a quadtree takes Θ(log N) in all cases.','False'],
    ].map(([s,a],i)=>mc(23+i,`(b) ${s}`,['True','False','Either accepted'],a==='True'?0:a==='False'?1:2,T('BSTS','HEAPS','DISJOINT_SETS','K_D_TREES'))),
  ]),
  problem('5','Graph Algorithms (7.5 pts)', null, [
    text('For each statement, answer True or False. If false, give a counterexample with at most five vertices; weighted graph edges must have distinct weights. The exam supplies the accepted starting vertex(es).'),
    ...[
      ['Prim’s last edge added to an MST is always the MST’s highest-weight edge.','False (counterexample; start A)'],
      ['The largest edge in a graph is never part of a shortest paths tree.','False (counterexample; either start)'],
      ['With at least four vertices, DFS and BFS from the same start never visit vertices in the same order.','False (counterexample; start A or D)'],
      ['Dijkstra always finds shortest paths in a directed acyclic graph, even if it has negative edges.','False (counterexample; start A)'],
      ['In every undirected graph, an SPT from any vertex has total weight at most the MST weight.','False (counterexample; start A)'],
    ].map(([s,a],i)=>answer(33+i,`(statement ${i+1}) ${s}`,a,'GRAPH_TRAVERSALS')),
  ]),
  problem('6','Advanced Hash Party (4 pts)', null, [
    text('Give amortized best-case and worst-case runtimes for one insertion in Θ notation, in N items. Hashing costs O(1); resizing costs linear time; L is bounded by a constant. Give each as “best, worst”.'),
    ...[
      ['Quadruple bucket count when L > 1.','Θ(1), Θ(N)'],
      ['Double bucket count when L > 1/100.','Θ(1), Θ(N)'],
      ['Increase bucket count by 10 when L > 1.','Θ(N), Θ(N)'],
      ['Double bucket count until no bucket has more than 5 items (may cause multiple doublings).','Θ(1), Θ(∞)'],
    ].map(([s,a],i)=>answer(38+i,s,a,'HASHING')),
  ]),
  problem('7','Asymptotics (5 pts)', null, [
    text('Assume f takes Θ(N), g takes Θ(N²), and h takes O(N²), in all cases. Each returns an array the same length as its input.'),
    java(`int[] doStuff1(int[] x) {
  int N = x.length;
  int[] effedX = f(x);
  int[] newArray = new int[N];
  for (int i = 0; i < N; i += 1) newArray[i] = effedX[i] * 2;
  return g(newArray);
}`),
    answer(42,'(a) Runtime of doStuff1','Θ(N²)','ASYMPTOTICS'),
    java(`int[] fx = f(x);                 // ⟪a⟫
int[] gfx = g(f(x));            // ⟪b⟫
int[] hgfx = h(g(f(x)));        // ⟪c⟫
int[] hfx = h(f(x));            // ⟪d⟫
int[] ddx = f(f(x));            // ⟪e⟫`,{a:'Θ(N)',b:'Θ(N²)',c:'Θ(N²)',d:'O(N²)',e:'Θ(N)'}),
    ...[['Θ(N)'],['Θ(N²)'],['Θ(N²)'],['O(N²)'],['Θ(N)']].map(([a],i)=>answer(43+i,`(b) Runtime of line ${i+1}`,a,'ASYMPTOTICS')),
    answer(48,'(c) Does f(x) always run faster than g(x) on a given computer? Explain briefly.','No; asymptotic bounds do not determine actual time for a particular finite input, and constants can make g faster.','ASYMPTOTICS'),
  ]),
  problem('9','Heaps and JUnit (10 pts)', null, [
    text('Write a JUnit test for minheapify(int[] arr), which performs bottom-up min-heapification. Verify both that the result is a min heap and that it contains exactly the original items. Index 0 is used; children of k are 2k+1 and 2k+2. No duplicates. Complete this test and helpers.'),
    java(`@Test public void testHeapify() {
  int[] arr = {⟪a⟫};
  int[] original = arr.clone();
  minheapify(arr);
  ⟪b⟫
  ⟪c⟫
}
private static void testIsAHeap(int[] arr) {
  for (int i = 0; i < arr.length; i++) {
    if (⟪d⟫) assertTrue(arr[i] <= arr[2*i+1]);
    if (⟪e⟫) assertTrue(arr[i] <= arr[2*i+2]);
  }
}
private static void testHaveSameItems(int[] original, int[] arr) {
  Arrays.sort(original); Arrays.sort(arr);
  ⟪f⟫
}`,{a:'7, 2, 5, 1, 9, 3',b:'testIsAHeap(arr);',c:'testHaveSameItems(original, arr);',d:'2*i+1 < arr.length',e:'2*i+2 < arr.length',f:'assertArrayEquals(original, arr);'}),
    ...[['(a) Provide test values','7, 2, 5, 1, 9, 3'],['(b) Check heap property','testIsAHeap(arr);'],['(c) Check item preservation','testHaveSameItems(original, arr);'],['(d) Guard left child','2*i+1 < arr.length'],['(e) Guard right child','2*i+2 < arr.length'],['(f) Assert same sorted contents','assertArrayEquals(original, arr);']].map(([l,a],i)=>answer(49+i,l,a,'HEAPS','TESTING','JAVA')),
  ]),
  problem('10','Fancy Asymptotics (6 pts)', null, [
    text('BitdiddleSort splits an array into equal halves, sorts half1 with algorithm A, half2 with B, and merges in O(N). Base case length 1. Values lie between 1 and 9.'),
    answer(55,'(a) A is a comparison sort and B is counting sort: tightest possible lower bound (Ω notation)','Ω(N log N) (Ω(N) also accepted)','ASYMPTOTICS'),
    answer(56,'(b) A is counting sort and B is quicksort: tightest upper bound (O notation)','O(N²)','ASYMPTOTICS'),
    answer(57,'(c) A is quicksort and B is BitdiddleSort: tightest upper bound (O notation)','O(N²)','ASYMPTOTICS'),
    answer(58,'(d) A and B are both BitdiddleSort: runtime (Θ notation)','Θ(N log N)','ASYMPTOTICS'),
  ]),
  problem('11','Dynamic Programming (10 pts)', null, [
    text('Neighborly letters differ by exactly one alphabet position; same letters are not neighborly, and a and z are not neighbors. Find the longest alphabetically neighborly subsequence of a nonempty lowercase char array. A subsequence need not be contiguous, and it may increase or decrease. Required expected runtime O(N), assuming constant-time HashMap operations. Use cache values for best subsequence length ending in each letter.'),
    java(`public static int llans(char[] input) {
  HashMap<Character, Integer> cache = new HashMap<>();
  cache.put(input[0], 1);
  for (int i = 1; i < input.length; i += 1) {
    int prev = get(cache, ⟪a⟫, 0);
    int next = get(cache, ⟪b⟫, 0);
    cache.put(input[i], ⟪c⟫);
  }
  return ⟪d⟫;
}`,{a:'input[i] - 1',b:'input[i] + 1',c:'Math.max(prev, next) + 1',d:'maxValue(cache)'}),
    ...[['(a) Look up previous neighboring letter','input[i] - 1'],['(b) Look up next neighboring letter','input[i] + 1'],['(c) Update this letter’s best length','Math.max(prev, next) + 1'],['(d) Return the maximum cached length','maxValue(cache)']].map(([l,a],i)=>answer(59+i,l,a,'RECURSION','HASHING','JAVA')),
  ]),
  problem('12','Calling Collect: Tries and Recursive Tree Programming (13 pts)', null, [
    text('A base-10 R-way trie stores positive integers digit by digit, most-significant digit first. Insert keys 1, 100, 10110, 1123, 1134, 2101, 355, 21. The root has dummy digit 0; mark key-ending nodes. Describe the trie by its keys and answer:'),
    answer(63,'(a) List the stored keys represented by the trie','1, 100, 10110, 1123, 1134, 2101, 355, 21','TRIES'),
    text('collect(z, matches, topDigits) appends topDigits to each key in subtrie z. z10 is the 0 child of the 1 child of root.'),
    answer(64,'(b) Results of collect(z10, matches, 1)','100, 10110','TRIES'),
    text('Complete collect. The call is never made on the root. Don’t prepend a leading zero when topDigits is zero.'),
    java(`private void collect(Node x, List<Integer> matches, int topDigits) {
  if (⟪a⟫) return;
  if (⟪b⟫) matches.add(⟪c⟫);
  for (Node child : x.children) {
    collect(child, matches, ⟪d⟫);
  }
}`,{a:'x == null',b:'x.exists',c:'topDigits * 10 + x.dig',d:'topDigits * 10 + x.dig'}),
    ...[['(c) Null base case','x == null'],['(c) Detect a stored key','x.exists'],['(c) Append this key','topDigits * 10 + x.dig'],['(c) Prefix digits for recursive child','topDigits * 10 + x.dig']].map(([l,a],i)=>answer(65+i,l,a,'TRIES','RECURSION','JAVA')),
    text('Complete findRepeaters: return every stored integer containing two identical consecutive digits. You may use collect.'),
    java(`private void findRepeaters(Node x, List<Integer> matches, int topDigits) {
  if (x == null) return;
  for (Node child : x.children) {
    if (⟪e⟫) {
      collect(child, matches, ⟪f⟫);
    } else {
      findRepeaters(child, matches, ⟪g⟫);
    }
  }
}`,{e:'x.dig == child.dig',f:'topDigits * 10 + x.dig',g:'topDigits * 10 + x.dig'}),
    ...[['(d) Detect repeated adjacent digits','x.dig == child.dig'],['(d) Collect from repeated digit’s child','topDigits * 10 + x.dig'],['(d) Recurse with prefix','topDigits * 10 + x.dig']].map(([l,a],i)=>answer(69+i,l,a,'TRIES','RECURSION','JAVA')),
  ]),
  problem('13','(Fond?) Farewell to 61B (10 pts)', null, [
    text('Build a FIFO MagicStringQueue using one MagicBag and constant additional memory. MagicBag.add(key) stores/replaces an equal key; remove(key) removes and returns an equal stored item, or null. enqueue is called at most one million times. Do not use a linked list or array as the queue. Describe the required fields, helper class, and operations.'),
    answer(72,'(a) Queue instance variables','MagicBag<Helper> bag; int addNumber, removeNumber','DEQUES','HASHING'),
    answer(73,'(b) Helper instance variables','String value; int position','DEQUES','HASHING'),
    answer(74,'(b) What should Helper.equals compare?','position only','DEQUES','HASHING'),
    answer(75,'(b) What must Helper.hashCode satisfy?','Equal helpers (same position) must have equal hash codes.','DEQUES','HASHING'),
    answer(76,'(c) enqueue operation','Add new Helper(value, addNumber) to bag, then increment addNumber.','DEQUES','HASHING'),
    answer(77,'(c) dequeue operation','Remove helper at removeNumber using a dummy Helper, increment removeNumber, and return its value.','DEQUES','HASHING'),
  ]),
]);
