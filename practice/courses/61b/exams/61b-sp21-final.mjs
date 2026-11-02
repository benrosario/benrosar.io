// Spring 2021 CS 61B Final: scored questions transcribed from the exam and solutions.
// The 0-point welcome/admin question and 0-point trivia are omitted.
import { exam, problem, text, java, blank, mc, sata } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...topics) => site(...topics);
const b = (id, label, value, ...topics) => blank(id, label, value, T(...topics));

export default exam('61b-sp21-final', 'Spring 2021 Final', {
  exam: 'https://drive.google.com/file/d/17OByvIiASNi_JSzl-20Gawtxvsjopi0y/view',
  sol: 'https://drive.google.com/file/d/16kmm6B3OvQsIvPsPnCrNgiWeFeOJd8tk/view',
}, 'sp21-final', [
  problem('2','Heaps (185 pts)',null,[
    mc(1,'(1a) Worst-case runtime to find the minimum item in a min-heap array?',['Θ(1)','Θ(log N)','Θ(N)','Θ(N log N)','Θ(N²)'],0,T('HEAPS')),
    mc(2,'(1b) Worst-case runtime to find the maximum item in a min-heap array?',['Θ(1)','Θ(log N)','Θ(N)','Θ(N log N)','Θ(N²)'],2,T('HEAPS')),
    mc(3,'(1c) Worst-case runtime to find the second-smallest item in a min-heap array?',['Θ(1)','Θ(log N)','Θ(N)','Θ(N log N)','Θ(N²)'],0,T('HEAPS')),
    text('The heap contains N strings of length N. Comparing two strings is character by character and may inspect Θ(N) characters. The backing array does not resize.'),
    mc(4,'(2a) Best-case time to insert another length-N string',['Θ(1)','Θ(log N)','Θ(N)','Θ(N log N)','Θ(N²)','Θ(2ᴺ)'],0,T('HEAPS','ASYMPTOTICS')),
    mc(5,'(2b) Worst-case time to insert another length-N string',['Θ(1)','Θ(log N)','Θ(N)','Θ(N log N)','Θ(N²)','Θ(2ᴺ)'],3,T('HEAPS','ASYMPTOTICS')),
    b(6,'(3) Maximum size of a tree that is both a BST and either a min-heap or max-heap; answer inf if unbounded','2','HEAPS','BSTS'),
  ]),
  problem('3','Trees (570 pts)',null,[
    mc(7,'(1) For a 1-based array representation of a complete trinary tree, what is the rightmost child index of node i?',['3i - 1','3i','3i + 1','2i + 1','i² - 1','i² + 1'],2,T('HEAPS')),
    text('The WeightedQuickUnion parent array is [1, 2, -3, -1]. Negative values at roots encode the negative tree size.'),
    mc(8,'(2a) Why is this not a valid WeightedQuickUnion array?',['It has a cycle.','The actual weight of the tree rooted at 2 does not match its listed weight.','The actual weight of the tree rooted at 3 does not match its listed weight.','Its height is impossibly large given the set weights.'],2,T('DISJOINT_SETS')),
    mc(9,'(2b) Interpreted as a 0-based complete binary tree [1,2,-3,-1], why is it not a BST?',['It contains negative numbers.','2 should not be the left child of 1.','2 should not be the left child of -3.','The root is not the median value.'],1,T('BSTS')),
    mc(10,'(2c) Interpreted as a 0-based complete binary tree [1,2,-3,-1], why is it not a max heap?',['It contains negative numbers.','-1 should not be below 2.','-3 should not be below 1.','The root is not the maximum value.'],3,T('HEAPS')),
    text('For (2d–e), the 0-based array is [1, -2, 3, -4, -1, x, 5].'),
    b(11,'(2d) Choose integer x making the array a valid BST','2','BSTS'),
    b(12,'(2e) Choose integer x making the array a valid WeightedQuickUnion parent array','3','DISJOINT_SETS'),
    text('For (2f–g), the 0-based array is [-1, -1, x, -1].'),
    b(13,'(2f) Choose integer x making the array a valid max heap','-1','HEAPS'),
    b(14,'(2g) Choose integer x making the array a valid WeightedQuickUnion parent array','-1','DISJOINT_SETS'),
    mc(15,'(3a) Can any binary tree of comparable items be transformed into a BST using only rotations?',['True','False'],1,T('BSTS')),
    b(16,'(3b) Number of unique BSTs of height 2 containing 1 through 7','1','BSTS'),
    b(17,'(3c) Nodes at level 3 in a heap after 8 insertions (root at level 0)','1','HEAPS'),
    b(18,'(3d) Nodes at level 3 in a heap after 12,329 insertions','8','HEAPS'),
    mc(19,'(3e) Do WeightedQuickUnion and HeightedQuickUnion always create the same tree for the same operations and tie-breaking?',['True','False'],1,T('DISJOINT_SETS')),
    b(20,'(3f) Maximum height of a fully connected WeightedQuickUnion with 8 elements','3','DISJOINT_SETS'),
  ]),
  problem('4','Finding the Shortest Path (125 pts)',null,[
    text('Directed weighted graph: S→A (10), S→B (1), B→C (3), C→A (2), C→D (8), B→F (15), D→F (2), F→E (8), E→S (3). Break ties alphabetically. Dijkstra’s PQ initially contains every vertex, with infinity priority except S.'),
    text('After visiting C and relaxing its outgoing edges, report each vertex’s priority (inf if infinite, none if already removed).'),
    ...[['S','none'],['A','6'],['B','none'],['C','none'],['D','12'],['E','inf'],['F','16']].map(([v,a],i)=>b(21+i,`(a) Priority of ${v}`,a,'SHORTEST_PATHS')),
    b(28,'(b) Dijkstra pop order from S, comma separated','S,B,C,A,D,F,E','SHORTEST_PATHS'),
  ]),
  problem('5','Subsequences (240 pts)',null,[
    text('Sort [652, 135, 101, 383, 495, 651] using insertion sort, selection sort, leftmost-pivot Hoare quicksort without shuffling, or bottom-up max-heapsort. A partial state may occur even midway through an operation. Choose every algorithm that can yield each listed prefix.'),
    sata(29,'(1a) State prefix [652, 495, 651, ...]',['Insertion sort','Selection sort','Quicksort','Heapsort','None'],[3],T('SORTING')),
    sata(30,'(1b) State prefix [101, 135, 652, ...]',['Insertion sort','Selection sort','Quicksort','Heapsort','None'],[0,1],T('SORTING')),
    sata(31,'(1c) State prefix [135, 101, 652, ...]',['Insertion sort','Selection sort','Quicksort','Heapsort','None'],[4],T('SORTING')),
    text('The full state [383, 135, 101, 495, 651, 652] occurs in both quicksort and heapsort on this input.'),
    mc(32,'(2a) Number of completed quicksort partition operations when this state occurs',[0,1,2,3,4,5,6,7],3,T('SORTING')),
    mc(33,'(2b) Number of completed heapsort deletion operations when this state occurs',[0,1,2,3,4,5,6,7],3,T('SORTING','HEAPS')),
  ]),
  problem('6','MapDeque (240 pts)',null,[
    text('Implement a Deque backed by Map<Integer,T>, using integer positions as keys. Do not use a List. Initialize first and last so the empty map has size zero, adding at either end updates its position, and removal deletes and returns the appropriate item.'),
    java(`public class MapDeque<T> implements Deque<T> {
  private Map<Integer, T> items;
  private int first; // ⟪a⟫
  private int last;  // ⟪b⟫
  public MapDeque() {
    items = new HashMap<>();
    first = ⟪c⟫;
    last = ⟪d⟫;
  }
  public int size() { return ⟪e⟫; }
  public void addLast(T item) { ⟪f⟫; ⟪g⟫; }
  public void addFirst(T item) { ⟪h⟫; ⟪i⟫; }
  public T removeFirst() {
    if (size() <= 0) throw new NoSuchElementException();
    ⟪j⟫; T toRet = items.remove(first); return ⟪k⟫;
  }
  public T removeLast() {
    if (size() <= 0) throw new NoSuchElementException();
    ⟪l⟫; T toRet = items.remove(last); return ⟪m⟫;
  }
}`,{a:'0',b:'1',c:'0',d:'1',e:'items.size()',f:'items.put(last, item)',g:'last += 1',h:'items.put(first, item)',i:'first -= 1',j:'first += 1',k:'toRet',l:'last -= 1',m:'toRet'}),
    ...[['(a) Initial first','0'],['(b) Initial last','1'],['(c) Constructor first','0'],['(d) Constructor last','1'],['(e) Size','items.size()'],['(f) Store at back','items.put(last, item)'],['(g) Advance back index','last += 1'],['(h) Store at front','items.put(first, item)'],['(i) Decrement front index','first -= 1'],['(j) Advance front before removal','first += 1'],['(k) Return removed front value','toRet'],['(l) Decrement back before removal','last -= 1'],['(m) Return removed back value','toRet']].map(([l,a],i)=>b(34+i,l,a,'DEQUES','HASHING','JAVA')),
  ]),
  problem('7','MSTs (180 pts)',null,[
    text('Undirected weighted graph. Spokes SA, SB, SC, SD have weight 1; outer cycle WX, XZ, YZ, WY also has weight 1. Inner edges AB, AC, BD, CD and connectors WA, XB, YC, ZD have weight 2. Ties can be broken arbitrarily.'),
    sata(47,'(a) Which edges could be the last edge Kruskal adds to an MST?',['SA','SB','SC','SD','AB','AC','BD','CD','WA','XB','YC','ZD','WX','XZ','WY','YZ'],[8,9,10,11],T('MSTS')),
    sata(48,'(b) Which edges could be the last edge Prim adds to an MST starting from S?',['SA','SB','SC','SD','AB','AC','BD','CD','WA','XB','YC','ZD','WX','XZ','WY','YZ'],[12,13,14,15],T('MSTS')),
    b(49,'(c) Number of valid MSTs','16','MSTS'),
  ]),
  problem('8','Left-Leaning Red-Black Trees (160 pts)',null,[
    mc(50,'(a) Starting with node A and inserting M as a red right child, which rotation restores left-leaning form?',['rotateLeft(A)','rotateRight(A)','rotateLeft(M)','rotateRight(M)'],0,T('RED_BLACK_TREES')),
    text('Then insert B into the resulting tree with M at the root and A as its red left child.'),
    mc(51,'(b) Which resulting LLRB shape/coloring is correct?',['Root B black with red children A and M (diagram a)','Root B black with black children A and M (diagram b)','M root, red A child with red B grandchild (diagram c)','M root, red B child with red A grandchild (diagram d)','M root, B black with A black (diagram e)','M root black with B red and A red (diagram f)'],0,T('RED_BLACK_TREES')),
    ...[['rotateLeft()','A'],['rotateRight()','M'],['colorFlip()','B']].flatMap(([op,node],i)=>[
      mc(52+i*2,`(c) Operation ${i+1}`,['rotateLeft()','rotateRight()','colorFlip()','None'],['rotateLeft()','rotateRight()','colorFlip()'].indexOf(op),T('RED_BLACK_TREES')),
      mc(53+i*2,`(c) Node for operation ${i+1}`,['A','B','M','None'],['A','B','M'].indexOf(node),T('RED_BLACK_TREES')),
    ]),
  ]),
  problem('9','Palindromic Tries (330 pts)',null,[
    text('For the collection [madam, ada, wow, dadad, huh, adamada], a centered subpalindrome is an odd-length palindromic substring that shares the middle character of the containing string.'),
    sata(58,'(a) Which strings have “ada” as a centered subpalindrome?',['madam','ada','wow','dadad','huh','adamada','None'],[0,1,3],T('TRIES')),
    text('A PalindromicTrie stores odd-length palindromes. insert(str) takes Θ(L). numCenteredSubPalindromes(subStr) should take Θ(K) for subStr length K and be independent of how many strings match.'),
    b(59,'(b) Add one TrieNode field that supports the query','private int numWordsBelow;','TRIES','JAVA'),
    java(`public int numCenteredSubPalindromes(String subStr) {
  if (!isOddLengthPalindrome(subStr)) throw new IllegalArgumentException();
  return numCenteredSubPalindromesHelper(root, subStr, ⟪a⟫);
}
private int numCenteredSubPalindromesHelper(TrieNode node, String subStr, int index) {
  if (⟪b⟫) return 0;
  if (⟪c⟫) return ⟪d⟫;
  TrieNode toCall = node.children.getOrDefault(⟪e⟫, null);
  return numCenteredSubPalindromesHelper(⟪f⟫, subStr, ⟪g⟫);
}`,{a:'subStr.length() / 2',b:'node == null',c:'index == subStr.length()',d:'node.numWordsBelow',e:'subStr.charAt(index)',f:'toCall',g:'index + 1'}),
    ...[['(c) Initial index','subStr.length() / 2'],['(c) Missing-node base case','node == null'],['(c) End-of-query condition','index == subStr.length()'],['(c) Return matching subtree count','node.numWordsBelow'],['(c) Trie edge character','subStr.charAt(index)'],['(c) Recurse on child','toCall'],['(c) Advance query index','index + 1']].map(([l,a],i)=>b(60+i,l,a,'TRIES','JAVA')),
  ]),
  problem('10','Graphs (350 pts)',null,[
    text('A recursive graph traversal scans every neighbor edge and uses a TreeSet (balanced red-black tree) for seen and a heap-based MinPQ. Assume comparing vertices is O(1). Express operation counts and operation costs using E, V, and logV.'),
    ...[['contains calls','E'],['time per contains','logV'],['pq insert calls','V'],['time per pq insert','logV'],['seen add calls','V'],['time per seen add','logV'],['overall runtime','ElogV']].map(([l,a],i)=>b(67+i,`(a,b) ${l}`,a,'GRAPH_TRAVERSALS','ASYMPTOTICS')),
    b(74,'(c) Overall runtime if membership tests use MinPQ.contains at O(N)','EV','GRAPH_TRAVERSALS','ASYMPTOTICS'),
  ]),
  problem('11','Asymptotics (190 pts)',null,[
    text('For f1, an array is allocated and filled in one loop from 3 through N. For z1, recursion calls z1(n/2) twice until n≤10. For z2, each call first loops n times and then makes those same two recursive calls. For z3, n≤10 returns; even n calls z3(n/2) twice; odd n calls z3(n+1).'),
    ...[['(a) Runtime of f1(N)','Θ(N)'],['(b) Worst-case runtime of z1(N)','Θ(N)'],['(c) Worst-case runtime of z2(N)','Θ(N log N)'],['(d) Best-case runtime of z3(N)','Θ(N)'],['(e) Worst-case runtime of z3(N)','Θ(N)']].map(([l,a],i)=>mc(75+i,l,['Θ(1)','Θ(log log N)','Θ((log N)²)','Θ(log N)','Θ(N)','Θ(N log N)','Θ(N²)','Θ(N² log N)','Θ(N³)','Θ(N³ log N)','Θ(N⁴)','Θ(N⁴ log N)','Worse','Never terminates'],['Θ(1)','Θ(log log N)','Θ((log N)²)','Θ(log N)','Θ(N)','Θ(N log N)','Θ(N²)','Θ(N² log N)','Θ(N³)','Θ(N³ log N)','Θ(N⁴)','Θ(N⁴ log N)','Worse','Never terminates'].indexOf(a),T('ASYMPTOTICS'))),
  ]),
  problem('12','Sorting Lists (620 pts)',null,[
    text('PosIntegerList contains positive integers and compares lexicographically from the left; if one list is a prefix of the other, the longer list is greater.'),
    java(`public int compare(PosIntegerList a, PosIntegerList b) {
  int lim = ⟪a⟫;
  for (⟪b⟫) {
    if (⟪c⟫) return ⟪d⟫;
  }
  return ⟪e⟫;
}`,{a:'Math.min(a.size(), b.size())',b:'int i = 0; i < lim; i += 1',c:'a.get(i) != b.get(i)',d:'a.get(i) - b.get(i)',e:'a.size() - b.size()'}),
    ...[['(a) Shared prefix length','Math.min(a.size(), b.size())'],['(a) Loop header','int i = 0; i < lim; i += 1'],['(a) Detect differing entries','a.get(i) != b.get(i)'],['(a) Compare differing entries','a.get(i) - b.get(i)'],['(a) Prefix tie-break','a.size() - b.size()']].map(([l,a],i)=>b(80+i,l,a,'COMPARATORS','SORTING','JAVA')),
    mc(85,'(b) Worst-case Mergesort time for N lists, each length M, with efficient comparison',['Θ(1)','Θ(N)','Θ(M)','Θ(N+M)','Θ(NM)','Θ(N log M)','Θ(M log N)','Θ(N log N)','Θ(NM log NM)','Θ(NM log N)','Θ(NM log M)','Θ(N log N + M log M)'],9,T('SORTING','COMPARATORS','ASYMPTOTICS')),
    text('For LSD radix sort with heapsort as each stable pass, PQNode stores a list, its current digit (use 0 when the list has no digit at index i), and original order as a tie-breaker. Heap sort each digit position from right to left.'),
    java(`private static class PQNode implements Comparable<PQNode> {
  PosIntegerList il;
  ⟪f⟫
  ⟪g⟫
  PQNode(PosIntegerList i, int v, int t) {
    il = i; ⟪h⟫; ⟪i⟫;
  }
  public int compareTo(PQNode o) {
    if (⟪j⟫) return ⟪k⟫;
    return ⟪l⟫;
  }
}
public static List<PosIntegerList> heapSortLists(List<PosIntegerList> ils, int i) {
  MinPQ<PQNode> pq = new MinPQ<>();
  int count = 0;
  for (PosIntegerList currentIl : ils) {
    PQNode p;
    if (⟪m⟫) p = ⟪n⟫;
    else p = ⟪o⟫;
    count += 1; pq.insert(p);
  }
  List<PosIntegerList> returnList = new ArrayList<>();
  while (pq.size() != 0) returnList.add(pq.delMin().il);
  return returnList;
}`,{f:'int val;',g:'int tiebreak;',h:'val = v',i:'tiebreak = t',j:'val != o.val',k:'val - o.val',l:'tiebreak - o.tiebreak',m:'i >= currentIl.size()',n:'new PQNode(currentIl, 0, count)',o:'new PQNode(currentIl, currentIl.get(i), count)'}),
    ...[['(c) Digit field','int val;'],['(c) Stable tie-break field','int tiebreak;'],['(c) Initialize digit','val = v'],['(c) Initialize tie-break','tiebreak = t'],['(c) Compare digits first','val != o.val'],['(c) Digit ordering','val - o.val'],['(c) Stable order for equal digits','tiebreak - o.tiebreak'],['(c) Detect absent digit','i >= currentIl.size()'],['(c) Missing digit node','new PQNode(currentIl, 0, count)'],['(c) Present digit node','new PQNode(currentIl, currentIl.get(i), count)']].map(([l,a],i)=>b(86+i,l,a,'SORTING','HEAPS','JAVA')),
    mc(96,'(d) Worst-case runtime to LSD-heapsort N lists of length M',['Θ(N)','Θ(M)','Θ(N+M)','Θ(NM)','Θ(N log M)','Θ(M log N)','Θ(N log N)','Θ(NM log NM)','Θ(NM log N)','Θ(NM log M)','Θ(N log N + M log M)'],8,T('SORTING','HEAPS','ASYMPTOTICS')),
  ]),
]);
