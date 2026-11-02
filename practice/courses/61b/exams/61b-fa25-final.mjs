// Fall 2025 Final: scored questions from the official exam and solutions.
import { exam, problem, text, java, blank, mc, sata } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...tags) => site(...tags);
const F = (id, label, answer, tags = ['JAVA']) => blank(id, label, answer, T(...tags));
const C = (id, label, options, answer, tags = ['JAVA']) => mc(id, label, options, answer, T(...tags));
const S = (id, label, options, answers, tags = ['JAVA']) => sata(id, label, options, answers, T(...tags));
export default exam('61b-fa25-final', 'Fall 2025 Final', {
  exam: 'https://drive.google.com/file/d/1f2Vp4dEXxLWpKct8qxU5emecELb3-7G3/view',
  sol: 'https://drive.google.com/file/d/1re5hHbeSyoKX0zQBjMLxi74P7cXduNA1/view',
}, 'fa25-final', [
  problem('1','Welcome to 61B (6 pts)',null,[
    C(1,'Does `List<Integer> L = new List<>();` compile and run?',['True','False'],1,['JAVA','ADTS']),
    C(2,'After gruArmy.put(1,"kevin"), put(2,"stuart"), put(1,"bob"), what is gruArmy.size()?',['1','2','3'],1,['HASHING']),
    C(3,'After those puts, what does gruArmy.get(1) return?',['"kevin"','"stuart"','"bob"','List.of("kevin", "bob")'],2,['HASHING']),
    S(4,'What must be true for the foreach and compareTo code to compile?',['JeopardyBoard implements Iterable','JeopardyBoard implements Iterator','Tile implements Iterable','Tile implements Iterator','Tile has a compareTo method','Tile implements Comparable','Tile implements Comparator','None'],[0,4],['ITERATORS','COMPARATORS']),
  ]),
  problem('2','Implementation Inheritance (7 pts)',null,[
    text('MaxStringList extends ArrayList<String> and maxString returns the alphabetically last item. No edge cases required.'),
    java(`@Test public void testMaxString() {
  MaxStringList msl = new MaxStringList();
  ⟪a⟫
  ⟪b⟫
  ⟪c⟫
}`),
    ...[['Add a first test string','msl.add("cat");'],['Add a larger test string','msl.add("zebra");'],['Assert expected maximum','assertThat(msl.maxString()).isEqualTo("zebra");']].map(([l,a],i)=>F(10+i,l,a,['TESTING','INHERITANCE'])),
    java(`public String maxString() {
  String biggest = ⟪d⟫;
  for (String s : this) {
    if (⟪e⟫) { ⟪f⟫ }
  }
  return ⟪g⟫;
}`),
    ...[['Initialize maximum','this.get(0)'],['Compare strings','biggest.compareTo(s) <= 0'],['Update maximum','biggest = s;'],['Return maximum','biggest']].map(([l,a],i)=>F(13+i,l,a,['INHERITANCE','SORTING'])),
  ]),
  problem('3','Clubs and Countries (11 pts)',null,[
    text('Each Club has Map<Student, Country> countryMap. Count unique students by country across clubs; each student maps to the same country in every club.'),
    java(`Map<Country,Integer> counts = ⟪a⟫;
Set<Student> uniqueStudents = ⟪b⟫;
for (Club club : ⟪c⟫) {
  for (Student s : ⟪d⟫.countryMap.keySet()) {
    Country c = ⟪e⟫.countryMap.get(s);
    if (!⟪f⟫.contains(s)) {
      if (!counts.containsKey(c)) {
        ⟪g⟫
      } else {
        ⟪h⟫
      }
      ⟪i⟫
    }
  }
}
return counts;`),
    ...[['Create result map','new HashMap<>()'],['Create duplicate-detection set','new HashSet<>()'],['Iterate clubs','allClubs'],['Current club','club'],['Country lookup map','club'],['Unique students set','uniqueStudents'],['Initialize country count','counts.put(c, 1);'],['Increment count','counts.put(c, counts.get(c) + 1);'],['Mark student counted','uniqueStudents.add(s);']].map(([l,a],i)=>F(20+i,l,a,['HASHING','ADTS'])),
  ]),
  problem('4','Taste the Rainbow (12 pts)',null,[
    text('Rainbow order alternates taking an item from the back then the front. For example [1,2,3,4,5] becomes [5,1,4,2,3].'),
    F(40,'Next-pointer order for deque [1,2,3,4,5] after rainbowfy','sentinel → 5 → 1 → 4 → 2 → 3 → sentinel',['LINKED_LISTS']),
    text('For next pointers, use Node left=sentinel and Node right=sentinel.prev. During even loop iterations, link left.next to right and advance left to the old left.next. During odd iterations, link right.next to left and advance right to right.prev. Close the circle at the middle node.'),
    java(`for (int i=0; i<this.size(); i++) {
  if (i % 2 == 0) {
    Node temp = left.next;
    ⟪a⟫
    ⟪b⟫
  } else {
    ⟪c⟫
    ⟪d⟫
  }
}
⟪e⟫`),
    ...[['Link left to right','left.next = right;'],['Advance left cursor','left = temp;'],['Link right to left','right.next = left;'],['Advance right cursor','right = right.prev;'],['Close circular list','left.next = sentinel;']].map(([l,a],i)=>F(41+i,l,a,['LINKED_LISTS'])),
    text('Assume rainbowfyNexts has just been called. Rebuild all prev pointers by walking forward from sentinel through the new next chain.'),
    java(`Node curr = ⟪f⟫;
for (int i=0; i ⟪g⟫; i++) {
  ⟪h⟫
  ⟪i⟫
}`),
    ...[['Start at sentinel','sentinel'],['Visit through sentinel at end','<= this.size()'],['Set next node’s prev pointer','curr.next.prev = curr;'],['Advance','curr = curr.next;']].map(([l,a],i)=>F(46+i,l,a,['LINKED_LISTS'])),
  ]),
  problem('5','Potpourri (21 pts)',null,[
    C(60,'Insert N unique integers into a BST: which statement is true?',['Any order is O(N log N)','A good order exists and can always be found in O(N log N)','A good order exists but cannot always be found in O(N log N)','No order can achieve O(N log N)'],1,['BSTS','ASYMPTOTICS']),
    S(61,'Which traversals may change after rotateLeft on a BST?',['Preorder','Inorder','Postorder'],[0,2],['BSTS','TREE_TRAVERSALS']),
    C(62,'For a perfectly balanced BST with hundreds of nodes, which traversal can match BFS from the root?',['Preorder','Inorder','Postorder','None'],3,['BSTS','TREE_TRAVERSALS']),
    text('Min-heap shape: root P; children E,Y. E has children 40,R; Y has children 20,I. Node 40 has children N,K; R has children A,O. All values are unique integers.'),
    S(63,'Which nodes could hold 19?',['P','E','Y','R','I','N','K','A','O'],[1,2,3,4,7,8],['HEAPS']),
    S(64,'True runtime bounds for Weighted Quick Union without path compression?',['union is O(log N)','union is O(N)','isConnected is O(1)','isConnected is O(log N)','None'],[0,1,3],['DISJOINT_SETS','ASYMPTOTICS']),
    text('Weighted Quick Union with path compression has parent links: 0 is root with children 1 and 2; node 2 has children 3 and 4. 5 is root with child 6. Call isConnected(3,5).'),
    F(65,'Parent array afterward','[-5, 0, 0, 0, 2, -2, 5]',['DISJOINT_SETS']),
    C(66,'Worst-case time to add N strings to a hash set with linked-list buckets',['Θ(1)','Θ(N)','Θ(N log N)','Θ(N²)','None'],3,['HASHING','ASYMPTOTICS']),
    text('Trie stores ["a", "apes", "in", "inch", "into"].'),
    S(67,'Which contains(key) calls return true?',['""','"a"','"apes"','"inc"','"inches"'],[1,2],['TRIES']),
    C(68,'How many nodes are created by add("ape")?',['0','1','2','3','4 or more'],0,['TRIES']),
    C(69,'How many nodes are created by add("bee")?',['0','1','2','3','4 or more'],3,['TRIES']),
    text('Starting array [6,3,2,7,5,1,4,8,0,9]. Intermediate arrays: A=[5,3,4,2,0,1,6,7,8,9], B=[2,1,0,3,5,4,6,7,8,9], C=[3,6,2,5,7,1,4,0,8,9], D=[1,2,3,5,6,7,4,8,0,9].'),
    C(70,'Which array can be an intermediate 3-scan Quicksort state with leftmost pivot and no shuffle?',['A','B','C','D'],1,['SORTING']),
    C(71,'Which array can be an intermediate state of bottom-up max-heapsort?',['A','B','C','D'],0,['HEAPS','SORTING']),
  ]),
  problem('6','Midterm 2 Nostalgia (25 pts)',null,[
    C(80,'Runtime of rushil: three calls on N/3 and two Θ(N) operations',['Θ(N)','Θ(N log N)','Θ(N²)','Θ(3^N)','Infinite loop'],1,['RECURSION','ASYMPTOTICS']),
    C(81,'Runtime of lucky: outer i descends from N−1; inner loop runs 2^i times',['Θ(N)','Θ(2^N)','Θ(N²)','Θ(N log N)','Infinite loop'],1,['ASYMPTOTICS']),
    C(82,'Runtime of unlucky: Θ(N) work plus two reducer(N), each Θ(N) work then calls unlucky(N/2)',['Θ(N)','Θ(N log N)','Θ(N²)','Θ(2^N)','Infinite loop'],1,['RECURSION','ASYMPTOTICS']),
    S(83,'Dijkstra from s, with negative edges only leaving s and all later edges nonnegative: select classifications that were accepted.',['Always correct','Sometimes correct','Never correct'],[0,1],['SHORTEST_PATHS']),
    C(84,'With unique edge weights, does Kruskal give the same MST as Prim from any start?',['Always','Sometimes','Never'],0,['MSTS']),
    C(85,'Connected graph with even E; E/2 edges weight 6, E/2 weight −7. Does an MST have total weight ≤0?',['Always','Sometimes','Never'],1,['MSTS']),
    ...[['BST with 15 nodes: minimum height','3'],['BST with 15 nodes: maximum height','14'],['Heap with 15 nodes: minimum height','3'],['Heap with 15 nodes: maximum height','3'],['LLRB with 15 nodes: minimum height','3'],['LLRB with 15 nodes: maximum height','5'],['Connected Weighted Quick Union of 15 items: minimum height','1'],['Connected Weighted Quick Union of 15 items: maximum height','3']].map(([l,a],i)=>F(86+i,l,a,['BSTS','HEAPS','RED_BLACK_TREES','DISJOINT_SETS'])),
  ]),
  problem('7','Hashing (3 pts)',null,[
    java(`int n=1;
for (int i=0; i<this.length(); i++) {
  n *= ((i+1) * charToInt(this.charAt(i)));
}
return n;`),
    F(100,'Different lowercase string with same hash as "ab", without overflow','ba',['HASHING']),
    C(101,'Is this hashCode valid with respect to equals?',['True','False'],0,['HASHING']),
  ]),
  problem('8','Sort City (15 pts)',null,[
    C(110,'Long employee array already alphabetized by name; sort by birthday while keeping equal birthdays alphabetized',['Insertion sort','Heapsort','Merge sort','Selection sort'],2,['SORTING']),
    C(111,'Sort a long array of integers in [0, 2147483647]',['Insertion sort','Heapsort','Merge sort','Radix sort'],3,['SORTING','RADIX_SORTS']),
    C(112,'Sort a long array by size property in {small, medium, large}',['Insertion sort','Heapsort','Counting sort','Quicksort','Merge sort'],2,['SORTING']),
    C(113,'Fastest on real-world hardware for a long array of Comparable Dogs',['Insertion sort','Heapsort','Counting sort','Quicksort','Merge sort','Radix sort'],3,['SORTING']),
    C(114,'Sort a long Dog array already sorted except for its last five elements',['Insertion sort','Heapsort','Counting sort','Quicksort','Merge sort','Radix sort'],0,['SORTING']),
    C(115,'Which sort has asymptotically fewest swaps in its worst case?',['Insertion sort','Heapsort','Quicksort','Selection sort'],3,['SORTING']),
    S(116,'Advantages of Hoare partition over 3-scan partition',['Runs in fewer seconds','Uses less memory','Better asymptotic worst case','Stable'],[0,1],['SORTING']),
    java(`plantSort([4,3,7,2,8])`),
    C(117,'Number of swaps plantSort performs on [4,3,7,2,8]',['2','3','4','6','7','8'],2,['SORTING']),
    C(118,'plantSort best-case runtime',['Θ(N)','Θ(N log N)','Θ(N²)','Θ(2^N)','Other'],0,['SORTING','ASYMPTOTICS']),
    C(119,'plantSort worst-case runtime',['Θ(N)','Θ(N log N)','Θ(N²)','Θ(2^N)','Other'],2,['SORTING','ASYMPTOTICS']),
    C(120,'Is plantSort stable?',['Yes','No'],0,['SORTING']),
  ]),
]);
