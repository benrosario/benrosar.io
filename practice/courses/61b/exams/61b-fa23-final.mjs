// Fall 2023 Final: scored questions transcribed from the exam and official solutions.
// Q1(i) was removed as out-of-scope by the solutions; zero-point material is omitted.
import { exam, problem, text, java, blank, mc, sata } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...tags) => site(...tags);
const note = x => ({ x });
export default exam('61b-fa23-final', 'Fall 2023 Final', {
  exam: 'https://drive.google.com/file/d/1VcTEqbaK-BpuYej3w4so27tFLaSm2Rin/view',
  sol: 'https://drive.google.com/file/d/1DkfpFEoKFBGTkkzDcCnD9vuHRVRws7R7/view',
}, 'fa23-final', [
  problem('1','Final Curry',null,[
    text('For each statement, answer true or false.'),
    ...[
      ['(a) With more than |V|-1 edges and a unique heaviest edge, that edge cannot be in any MST.','false'],
      ['(b) If a graph has more than |V|-1 edges and two edges have equal weight, it must have multiple MSTs.','false'],
      ['(c) Negate all weights and run an MST algorithm to obtain a maximum spanning tree.','true'],
      ['(d) An MST gives the shortest path between any pair of vertices.','false'],
      ['(e) MSD radix sort remains correct with heapsort on each digit.','true'],
      ['(f) LSD radix sort remains correct with heapsort on each digit.','false'],
      ['(g) Reversing a min-heap array always gives a max-heap representation.','false'],
      ['(h) With an admissible consistent heuristic, A* can visit more vertices than Dijkstra to reach a destination.','false'],
    ].map(([l,a],i)=>blank(1+i,l,a,{...T('MSTS','RADIX_SORTS','HEAPS','SHORTEST_PATHS')})),
  ]),
  problem('2','Next Episode',null,[
    text('(a) Destructively reorder a linked list so even-indexed nodes come first in their original order, then odd-indexed nodes in their original order.'),
    java(`Episode reverseFaroShuffle(Episode head) {
  if (head == null) return null;
  Episode even = head;
  Episode odd = head.next;
  Episode oddHead = odd;
  while (odd != null && odd.next != null) {
    even.next = odd.next;
    even = even.next;
    odd.next = even.next;
    odd = odd.next;
  }
  even.next = oddHead;
  return head;
}`),
    ...[['Loop condition','odd != null'],['Loop condition continuation','odd.next != null'],['Link even node to next even','odd.next'],['Advance even cursor','even.next'],['Link odd node to next odd','even.next'],['Advance odd cursor','odd.next'],['Attach odd list after even list','oddHead']].map(([l,a],i)=>blank(9+i,l,a,T('LINKED_LISTS'))),
    text('(b) For each statement, give CE, RE, OK, or its printed output. The classes use the overloads shown in the code.'),
    java(`Rating rating = new Rating();
AudienceRating audRating = new AudienceRating();
ProfessionalRating profRating = new ProfessionalRating();
Rating ratingProf = new ProfessionalRating();
Rating[] ratings = new Rating[10];
ratings[1].judgeRating(ratingProf);
rating.judgeRating(audRating);
((ProfessionalRating) rating).judgeRating(rating);
rating.judgeRating((ProfessionalRating) ratingProf);`),
    ...[['Line 1: create Rating','OK'],['Line 2: create AudienceRating','OK'],['Line 3: create ProfessionalRating','OK'],['Line 4: assign ProfessionalRating to Rating','OK'],['Line 5: create Rating array','OK'],['Line 6: ratings[1].judgeRating(ratingProf)','RE'],['Line 7: rating.judgeRating(audRating)','True'],['Line 8: cast rating to ProfessionalRating and call','RE'],['Line 9: call overload with cast argument','Very True']].map(([l,a],i)=>blank(16+i,l,a,T('JAVA','INHERITANCE'))),
  ]),
  problem('3','Asymptotics',null,[
    java(`void q1(int N) {
  for (int i=1; i<N; i+=1)
    for (int j=1; j<N; j*=2) {}
}
void q2(int N) {
  if (N<=1) return;
  if (randomBitIsEven()) { for (int i=0;i<N/2;i++) {} q2(N-1); }
  else q2(N-4);
}
double q3(double N) {
  if (N<=10) return 1;
  double C=N; while (C>1) C/=2;
  return q3(Math.sqrt(N));
}
double q4(double N) {
  if (N<=10) return 1;
  double C=N; while (C>1) C/=2;
  return q4(Math.sqrt(N)) + q4(Math.sqrt(N));
}`),
    blank(25,'(a) q1 runtime','Theta(N log N)',T('ASYMPTOTICS')),
    blank(26,'(b) q2 best case','Theta(N)',T('ASYMPTOTICS')),
    blank(27,'(b) q2 worst case','Theta(N^2)',T('ASYMPTOTICS')),
    blank(28,'(c) q3 runtime','Theta(log N)',T('ASYMPTOTICS')),
    blank(29,'(d)(1) q4 recursion tree height h','Theta(log log N)',T('ASYMPTOTICS','RECURSION')),
    blank(30,'(d)(2) q4 runtime in terms of N and h','Theta(h log N)',T('ASYMPTOTICS','RECURSION')),
  ]),
  problem('4','Evil Sets',null,[
    text('(a) For each array, entries are parent pointers or negative root sizes. Select all valid weighted quick-union states without path compression.'),
    sata(31,'Which states are valid?',['(i) [-1,-1,-1,-1,-1,-1]','(ii) [-5,0,3,0,0,0]','(iii) [-6,5,0,0,0,1]','(iv) [0,-6,1,0,0,0]','None of the above'],[0],T('DISJOINT_SETS')),
    text('(b) Initial parent array by index 0..11: [-3,-2,0,7,9,1,2,-5,3,-2,8,3].'),
    blank(32,'(b)(1) Are indices 0 and 9 connected?','false',T('DISJOINT_SETS')),
    blank(33,'(b)(2) Are indices 10 and 11 connected?','true',T('DISJOINT_SETS')),
    blank(34,'(b)(3) Are the sets containing 6 and 5 the same size?','false',T('DISJOINT_SETS')),
    text('Using WQUPC, with ties choosing the smaller root:'),
    blank(35,'(b)(4) Parent/size array after union(10,5), starting from the given array','-3,7,0,7,9,1,2,-7,7,-2,7,3',T('DISJOINT_SETS')),
    blank(36,'(b)(5) Minimum number of union operations to fully connect and reduce height to 1','4',T('DISJOINT_SETS')),
  ]),
  problem('5','Bushy Trees',null,[
    text('(a) LLRB diagram: root 313 has red left link to 100 and black right link to unknown ?. Node 100 has black children 10 and 188; 10 has black children 8 and 61, and 61 has red child 47. Node 188 has red left child 164 and black right child 189; 164 has black children 162 and 184; 162 has red child 161. The unknown node has dotted (unknown-color) children 625 and 928; 625 has dotted children 448 and 644; 448 has black child 347; 928 has dotted child 646.'),
    blank(37,'(a)(1) Value of the unknown node','645',T('RED_BLACK_TREES')),
    sata(38,'(a)(2) Which nodes must have a red edge to their parent?',['347','448','625','644','646','None of the above'],[0,2,4],T('RED_BLACK_TREES')),
    blank(39,'(a)(3) Insert 88: rotateLeft count','1',T('RED_BLACK_TREES')),
    blank(40,'(a)(3) Insert 88: rotateRight count','0',T('RED_BLACK_TREES')),
    blank(41,'(a)(3) Insert 88: colorFlip count','1',T('RED_BLACK_TREES')),
    blank(42,'(a)(4) Insert 170: rotateLeft count','0',T('RED_BLACK_TREES')),
    blank(43,'(a)(4) Insert 170: rotateRight count','0',T('RED_BLACK_TREES')),
    blank(44,'(a)(4) Insert 170: colorFlip count','0',T('RED_BLACK_TREES')),
    text('(b) Cookie-house tree: root 1; children 4 and 3; 4 has children 0 and 6; 3 has children 2 and 5; 6 has children 7 and 10; 5 has right child 9; 7 has left child 8.'),
    blank(45,'(b)(1) Total cookies sold by preorder fish on six houses','26',T('TREE_TRAVERSALS')),
    blank(46,'(b)(2) Total cookies sold by right-left-root chips on six houses','37',T('TREE_TRAVERSALS')),
    mc(47,'(c) Which four lines produce the specified first 12 sales?',['sellCookies(house); fishDoubleDip(house.left); fishDoubleDip(house.right); sellCookies(house);','sellCookies(house); fishDoubleDip(house.right); fishDoubleDip(house.left); sellCookies(house);','fishDoubleDip(house.left); sellCookies(house); fishDoubleDip(house.right); sellCookies(house);','sellCookies(house); fishDoubleDip(house.left); sellCookies(house); fishDoubleDip(house.right);'],0,T('TREE_TRAVERSALS')),
  ]),
  problem('6','Snack Scores',null,[
    text('HashSet buckets use Math.floorMod(hashCode, bucketCount). Current four buckets: 0→Cookies; 1→Chocolates→Fudge; 2→Eggnog; 3→Candy Canes→Chestnuts.'),
    blank(48,'(a) Bucket for new snack with hashCode -1, without resize','3',T('HASHING')),
    sata(49,'(b) Which changed Candy Canes ratings make lookup fail?',['-19','-13','0','10','15','19','None of the above'],[0,2,3],T('HASHING')),
    sata(50,'(c) Which hashCodes change bucket index when capacity doubles from 4 to 8?',['-9','-8','-3','0','5','11','None of the above'],[0,2,4],T('HASHING')),
  ]),
  problem('7','Priority Queue',null,[
    sata(51,'(a) Which arrays can be max-heaps? (index 0 is unused.)',['[-,7,6,1,4,5,2,3]','[-,1,7,6,5,4,3,2]','[-,7,3,6,2,1,5,4]','[-,7,4,6,5,3,2,1]','[-,7,6,3,1,2,4,5]','[-,7,6,5,4,3,2,1]'],[2,5],T('HEAPS')),
    text('(b) MiddleHeap keeps left as a max-heap and right as a min-heap. left holds the lower half and is equal in size to right or has one extra item.'),
    java(`int deleteMiddle() {
  int k = left.deleteMax();
  if (left.size() < right.size()) left.insert(right.deleteMin());
  return k;
}
void insert(int k) {
  if (left.isEmpty()) { left.insert(k); return; }
  if (k < left.findMax()) left.insert(k);
  else right.insert(k);
  if (left.size() > right.size()+1) right.insert(left.deleteMax());
  if (left.size() < right.size()) left.insert(right.deleteMin());
}`),
    blank(52,'(b) deleteMiddle: restore balance','left.insert(right.deleteMin())',T('HEAPS')),
    blank(53,'(b) insert: initialize first item','left.insert(k);',T('HEAPS')),
    blank(54,'(b) insert: put lower-half item in left','left.insert(k);',T('HEAPS')),
    blank(55,'(b) insert: put upper-half item in right','right.insert(k);',T('HEAPS')),
    blank(56,'(b) If left too large, move its maximum','right.size() + 1',T('HEAPS')),
    blank(57,'(b) Move left maximum into right','right.insert(left.deleteMax());',T('HEAPS')),
    blank(58,'(b) If left too small, compare sizes','left.size() < right.size()',T('HEAPS')),
    blank(59,'(b) Move right minimum into left','left.insert(right.deleteMin());',T('HEAPS')),
  ]),
  problem('8','Lots of Graphite',null,[
    text('Directed weighted edges: S→A(1), S→C(6), S→B(7), A→D(1), A→C(4), D→C(2), D→E(1), C→B(2), C→E(2), B→E(2). Alphabetical tie-breaking. A* heuristics: S=7,A=6,B=2,C=4,D=6,E=0.'),
    mc(60,'(a) Dijkstra visit order from S?',['S,A,D,C,E,B','S,A,C,B,D,E','S,A,D,E,C,B','S,A,B,C,D,E','S,A,D,C,B,E','None'],2,T('SHORTEST_PATHS')),
    sata(61,'(b) Which are valid topological orders?',['S,A,D,C,E,B','S,A,C,B,D,E','S,A,D,E,C,B','S,A,B,C,D,E','S,A,D,C,B,E','None'],[4],T('TOPOLOGICAL_SORT')),
    mc(62,'(c) A* visit order from S to E?',['S,A,D,E,B','S,A,B,E','S,A,D,E,C,B','S,A,D,C,B,E','S,A,D,E','None'],4,T('SHORTEST_PATHS')),
  ]),
  problem('9','World Wide Web',null,[
    text('Undirected graph edge weights: AB=1, AD=3, BC=4, CD=7, DF=12, BE=4, EG=3, BG=1, BH=4, GH=5, CI=4, HI=4, IJ=10.'),
    blank(63,'(a) Prim from C, edges in order (include given BC)','BC,AB,BG,AD,EG,BH,CI,IJ,DF',T('MSTS')),
    sata(64,'(b) Which edges could be 5th in Kruskal with unknown tie-break?',['AB','AD','BC','BE','BG','BH','CD','CI','DF','GH','HI','IJ'],[2,5,7,10],T('MSTS')),
    blank(65,'(c) If all weights are halved, every original MST remains an MST: T/F','true',T('MSTS')),
  ]),
  problem('10','Sorting Out the Situation',null,[
    java(`void beben(int[] arr) {
  for (int i=arr.length-1; i>=0; i--) {
    for (int j=0; j<i; j++) {
      if (arr[j] >= arr[j+1]) swap(arr,j,j+1);
    }
  }
}`),
    blank(66,'(a)(1) Beben sorts in place: T/F','true',T('SORTING')),
    blank(67,'(a)(2) Beben is stable: T/F','false',T('SORTING')),
    blank(68,'(a)(3) Insertion sort makes strictly fewer swaps than Beben: Always/Sometimes/Never','Sometimes',T('SORTING')),
    blank(69,'(a)(4) Selection sort makes strictly fewer swaps than Beben: Always/Sometimes/Never','Sometimes',T('SORTING')),
    mc(70,'(b)(1) Sort a million random distinct numbers without extra memory. Best choice?',['Quicksort with Hoare partition','Mergesort','Insertion sort','Selection sort','Counting sort'],0,T('SORTING','COMPARISON_SORTS')),
    mc(71,'(b)(2) One random swap in an otherwise sorted array. Best choice?',['Quicksort with Hoare partition','Mergesort','Insertion sort','Selection sort','Counting sort'],2,T('SORTING')),
    mc(72,'(b)(3) Stable sort of integer ratings 1–5. Best choice?',['Quicksort with Hoare partition','Mergesort','Insertion sort','Selection sort','Counting sort'],4,T('SORTING','RADIX_SORTS')),
    mc(73,'(b)(4) Sort an already sorted list. Best choice?',['Quicksort with Hoare partition','Mergesort','Insertion sort','Selection sort','Counting sort'],2,T('SORTING')),
  ]),
  problem('11','Belt of Heapolyta',null,[
    text('Belts have distinct weights and one magic belt whose comparison is inverted against all other belts. The two lightest and two heaviest belts are nonmagic.'),
    text('(a) Input belts: [3*,6,2,5,1,0,4,7]. Match each algorithm to its output label: a) [3*,0,1,2,4,5,6,7]; b) [0,1,2,4,5,6,7,3*]; c) [6,3*,0,1,2,4,5,7]; d) [0,3*,1,2,4,5,6,7]; e) [4,5,6,7,3*,0,1,2]; f) [0,1,6,3*,2,4,5,7]; g) [0,1,2,3*,4,5,6,7]; h) does not terminate; i) none.'),
    blank(74,'(a)(1) Insertion Sort output label','c',T('SORTING')),
    blank(75,'(a)(2) 3-way Quicksort, first item pivot, output label','e',T('SORTING')),
    blank(76,'(a)(3) Hoare Quicksort, first item pivot, output label','e',T('SORTING')),
    blank(77,'(a)(4) Beben sort output label','c',T('SORTING')),
    blank(78,'(b) One valid nine-belt input giving at least 16 inversions among nonmagic belts after 3-way quicksort','5*,1,2,3,4,6,7,8,9',T('SORTING')),
    text('(c) Find the magic belt once, remove it, heap-sort the nonmagic belts, then scan the sorted list and insert the magic belt at the position determined by comparing it to existing belts.'),
    blank(79,'(c) First step','Call findMagicBelt once and remove that belt',T('SORTING')),
    blank(80,'(c) Sort remaining belts','Run heapSort on the nonmagic belts',T('SORTING','HEAPS')),
    blank(81,'(c) Reinsert magic belt','Scan and insert before the first belt lighter than the magic belt',T('SORTING')),
  ]),
]);
