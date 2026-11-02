// Spring 2025 Final: scored questions transcribed from the exam and solutions.
import { exam, problem, text, java, blank, mc, sata } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...tags) => site(...tags);
const F = (id, label, answer, tags = ['JAVA']) => blank(id, label, answer, T(...tags));
const C = (id, label, options, answer, tags = ['JAVA']) => mc(id, label, options, answer, T(...tags));
const S = (id, label, options, answers, tags = ['JAVA']) => sata(id, label, options, answers, T(...tags));
const TF = ['True','False'];
export default exam('61b-sp25-final', 'Spring 2025 Final', {
  exam: 'https://drive.google.com/file/d/1EL58K7Sk7QRiQ2jnNdZ9I_qM9z6bfjA1/view',
  sol: 'https://drive.google.com/file/d/1C2ZX6Gy3OMkiVwxV9eUpWUzrSA1rxj0_/view',
}, 'sp25-final', [
  problem('1','Potpourri (14 pts)',null,[
    C(1,'Does a standard BST guarantee logarithmic height for every insertion order?',TF,1,['BSTS']),
    C(2,'If counting sort is unstable, does MSD radix sort still correctly sort?',TF,0,['RADIX_SORTS']),
    C(3,'If counting sort is unstable, does LSD radix sort still correctly sort?',TF,1,['RADIX_SORTS']),
    C(4,'Quicksort with shuffling has a Θ(N²) worst case on distinct values. Which explanation is correct?',['True: poor pivots can create extremely unbalanced partitions','False: shuffling prevents a Θ(N²) worst case','True: it sorts the array twice per call','True: it copies the array'],0,['SORTING']),
    C(5,'Array after one selection-sort pass on [3,5,2,4,1]',['[1,5,2,4,3]','[2,3,5,4,1]','[3,2,5,4,1]','[1,3,5,2,4]'],0,['SORTING']),
    C(6,'Array after one LSD radix pass on [17,23,45,12,34]',['[12,23,34,45,17]','[12,17,23,34,45]','[12,17,23,45,34]'],0,['RADIX_SORTS']),
    C(7,'Insertion-sort swaps for [4,3,2,1]',['3','4','5','6'],3,['SORTING']),
    C(8,'Worst-case removeMin runtime of a d-ary heap with N elements',['Θ(1)','Θ(N)','Θ(N log_d N)','Θ(log_d N)','Θ(dN)','Θ(dN²)','Θ(log_N d)','Θ(d log_d N)','Θ(N²)'],7,['HEAPS']),
    C(9,'Worst-case insert runtime of a d-ary heap with N elements',['Θ(1)','Θ(N)','Θ(N log_d N)','Θ(log_d N)','Θ(dN)','Θ(dN²)','Θ(log_N d)','Θ(d log_d N)','Θ(N²)'],3,['HEAPS']),
    C(10,'Inorder traversal of BST built by inserting [10,5,15,3,7,12,18]',['[3,5,7,10,12,15,18]','[3,7,5,12,18,15,10]','[3,5,7,15,12,18,10]','None'],0,['BSTS','TREE_TRAVERSALS']),
    C(11,'Postorder traversal of BST built by inserting [10,5,15,3,7,12,18]',['[3,5,7,10,12,15,18]','[3,7,5,12,18,15,10]','[3,5,7,15,12,18,10]','None'],1,['BSTS','TREE_TRAVERSALS']),
    C(12,'Does sorting a DAG’s vertices by ascending in-degree always produce a topological ordering?',['Yes, low degree means fewer dependencies','Yes, by definition','No, only for trees','No, a lower-indegree vertex can depend on one with higher in-degree'],3,['TOPOLOGICAL_SORT']),
  ]),
  problem('2','PoTwourri (8 pts)',null,[
    text('Insert CAT, CORN, CATS, CALF, CYAN in that order. CAT sorts before CATS. LLRB result: root CATS, with red links indicated. Trie result marks terminal key nodes.'),
    F(20,'LLRB root','CATS',['RED_BLACK_TREES']),
    F(21,'LLRB children of root and their link colors','CAT red, CYAN red',['RED_BLACK_TREES']),
    F(22,'Children of CAT in the LLRB','CALF and CORN',['RED_BLACK_TREES']),
    F(23,'Trie terminal words','CAT, CATS, CALF, CORN, CYAN',['TRIES']),
    text('WeightedQuickUnion has 5 elements, no path compression. Ties link the first tree under the second. Operations: connect(0,1), connect(2,3), connect(0,4), connect(2,0).'),
    ...[['Root','1'],['Parent of 0','1'],['Parent of 4','1'],['Parent of 3','1'],['Parent of 2','3']].map(([l,a],i)=>F(24+i,l,a,['DISJOINT_SETS'])),
  ]),
  problem('3','Lost From The Start (10 pts)',null,[
    text('Input nodes are exactly the distinct nodes of a noncircular singly linked list, in arbitrary order. Find its head in Θ(N) time by collecting all nodes that appear as another node’s successor, then finding the one input node absent from that collection.'),
    java(`public Node findHead(List<Node> nodes) {
  Set<Node> body = ⟪a⟫;
  for (Node n : nodes) {
    if (⟪b⟫) { ⟪c⟫; }
  }
  for (Node n : nodes) {
    if (⟪d⟫) return ⟪e⟫;
  }
  return null;
}`),
    ...[['Create a set','new HashSet<>()'],['Successor exists','n.next != null'],['Record successor','body.add(n.next)'],['Node is not a successor','!body.contains(n)'],['Return head','n']].map(([l,a],i)=>F(30+i,l,a,['LINKED_LISTS','HASHING'])),
  ]),
  problem('4','Fibonacci Fever (18 pts)',null,[
    text('Give time and auxiliary space in terms of N and p. Basic integer operations are Θ(1) unless part (e) says otherwise.'),
    ...[
      ['fibmod1: naive two-recursion Fibonacci','ϕ^N','N'],
      ['fibmod2: iterative array DP modulo p','N','N'],
      ['fibmod3: exponentiation of a fixed 2×2 matrix','log N','1'],
      ['fibmod4: build Pisano period, known ≤4p','p','p'],
    ].flatMap(([l,t,s],i)=>[F(40+i*2,`${l}: time`,t,['ASYMPTOTICS']),F(41+i*2,`${l}: space`,s,['ASYMPTOTICS'])]),
    text('For full fib2, each BigInt uses Θ(log A) space and addition costs Θ(log(A+B)); F_N is Θ(ϕ^N).'),
    F(48,'Full Fibonacci DP: total time','N²',['ASYMPTOTICS']),
    F(49,'Full Fibonacci DP: total space','N²',['ASYMPTOTICS']),
  ]),
  problem('5','Math DAGs (18 pts)',null,[
    text('A Math DAG has integer nodes and directed operator edges; evaluate a path left-to-right with no operator precedence. The original 5(a) claim was dropped from grading due to an omitted word in the exam definition.'),
    S(50,'When is the largest-valued path guaranteed unique?',['Every edge has the same operator','Every node has a unique number','Maximum outdegree is 1','Maximum indegree is 1','None of the above'],[4],['GRAPH_REPRESENTATIONS']),
    text('Math DAG edges: 4→1 (+), 4→3 (*), 1→9 (−), 9→4bottom (*), 3→4bottom (÷), 5→3 (+), 5→4bottom (−). The two nodes labeled 4 are distinct.'),
    F(51,'Largest Math Path value','36',['GRAPH_REPRESENTATIONS']),
    text('For the code-completion part, nodes have value and outgoing GraphEdges (to, operator). `best` maps each node to the greatest path value ending at it. Iterate vertices to initialize, then process a topological order and relax every outgoing edge. Finally compare each stored best value with a singleton-node path.'),
    java(`Map<Node,Integer> best = new HashMap<>();
for (⟪a⟫ : ⟪b⟫) { ⟪c⟫(⟪d⟫, ⟪e⟫); }
for (⟪f⟫ : ⟪g⟫) {
  for (⟪h⟫ : ⟪i⟫) {
    ⟪j⟫(⟪k⟫, Math.max(⟪l⟫, applyOp(⟪m⟫, ⟪n⟫, ⟪o⟫)));
  }
}
int globalLargest = ⟪p⟫;
for (⟪q⟫ : ⟪r⟫) {
  if (globalLargest < ⟪s⟫) {
    globalLargest = ⟪t⟫;
  }
}`),
    ...[
      ['Initialization loop variable','Node n'],['Initialization source','this.vertices'],['Map insertion call','best.put'],['Map key','n'],['Initial singleton value','n.value'],
      ['Topological loop variable','Node n'],['Topological order','this.toposort()'],['Outgoing edge variable','GraphEdge e'],['Outgoing edges','n.neighbors'],['Update map call','best.put'],['Map key for destination','e.to'],['Current best at destination','best.get(e.to)'],['Previous path value','best.get(n)'],['Value at destination','e.to.value'],['Operation on edge','e.operator'],
      ['Initial global max','Integer.MIN_VALUE'],['Final scan variable','Node n'],['Final scan source','this.vertices'],['Compare against best path ending at node','best.get(n)'],['Update global maximum','best.get(n)'],
    ].map(([l,a],i)=>F(52+i,l,a,['GRAPH_REPRESENTATIONS','TOPOLOGICAL_SORT','HASHING'])),
  ]),
  problem('6','2D Hashing (7 pts)',null,[
    text('A 2D hashmap uses row=KarenHash(x)%N and column=PeyrinHash(x)%M. Dog equality compares birth year and name. Dog fields birthYear, name, weight are statistically independent.'),
    S(80,'For dog1=(2018,"Maxine",65), dog2=(2018,"Max",70), dog3=(2020,"Buddy",60), with N=10,M=3 and hashes birthYear/name.length, which pairs collide in both row and column?',['dog1 and dog2','dog1 and dog3','dog2 and dog3','None'],[0],['HASHING']),
    ...[
      ['Both hashes return birthYear','Valid, but not independent'],
      ['Karen returns birthYear; Peyrin returns name.length','Valid and independent'],
      ['Both return birthYear + name.length','Valid, but not independent'],
      ['Karen returns birthYear; Peyrin returns weight','Invalid'],
    ].map(([l,a],i)=>C(81+i,l,['Invalid','Valid, but not independent','Valid and independent'],['Invalid','Valid, but not independent','Valid and independent'].indexOf(a),['HASHING'])),
    F(85,'Same valid, well-distributed hash for N=4 rows and M=6 columns: maximum nonempty bins','12',['HASHING']),
    C(86,'If name becomes mutable and KarenHash returns name.length, is it still consistent with equals?',['Yes; equal names have equal lengths, even if mutable','Yes, because equals is not overridden','No; changing name makes the hash invalid','No; it is not consistent with equals'],0,['HASHING']),
  ]),
  problem('7','Find Bee Leader (10 pts)',null,[
    text('Given a connected weighted undirected graph G and queen set Q, return a minimum-cost forest where every hive belongs to exactly one queen’s component and no two queens share a component.'),
    C(90,'Which construction yields the minimum-cost assignment?',['Add a dummy vertex with zero-weight edges to every queen, then compute an MST','Add weight-one edges between all queens, then compute an MST','Run Dijkstra independently from every queen and union the trees','Run BFS from each queen'],0,['MSTS']),
    F(91,'Alternative Kruskal approach','Initialize the disjoint set by connecting all queen vertices before processing edges',['MSTS','DISJOINT_SETS']),
    F(92,'Asymptotic runtime of Kruskal solution','O(E log E)',['MSTS','DISJOINT_SETS','ASYMPTOTICS']),
  ]),
  problem('8','Rebuild Your Own World (15 pts)',null,[
    text('For each game-design choice, identify its main inefficiency and a better design.'),
    C(100,'Separate copied Java file for every level: main issue?',['Duplicated code makes changes inflexible and source larger','Too many runtime branches','Poor pathfinding'],0,['ABSTRACTION']),
    F(101,'Better level design','Use one generation function or Level class parameterized by data/config files',['ABSTRACTION']),
    C(102,'Scan every tile after each move to check whether coins remain: issue?',['Repeated full-grid scan','Coins are mutable','A list is too small'],0,['ASYMPTOTICS']),
    F(103,'Better coin tracking','Maintain coinsRemaining and decrement it when collecting a coin',['ABSTRACTION']),
    C(104,'Enemy move() switches on name: issue?',['One bloated, brittle switch makes behavior changes risky and inflexible','Iterating over enemies is necessarily inefficient','Enemies should not move'],0,['ABSTRACTION']),
    F(105,'Better enemy behavior design','Use Enemy subclasses/polymorphism, with each type implementing its own move behavior',['INHERITANCE','ABSTRACTION']),
    C(106,'Save every keypress and replay all input on load: issue?',['Storage and load time grow with play history','Text files cannot store coordinates','Keypresses are not deterministic'],0,['ABSTRACTION']),
    F(107,'Better save/load design','Serialize the current game state and necessary parameters (including RNG state) instead of replaying history',['ABSTRACTION']),
    C(108,'Run A* separately to every board tile for visibility radius 10: issue?',['Repeats point-to-point searches when a bounded all-destinations search is needed','A* cannot use a heuristic','Tiles cannot be vertices'],0,['GRAPH_TRAVERSALS','SHORTEST_PATHS']),
    F(109,'Better visibility algorithm','Run BFS from the player and stop expanding beyond distance 10',['GRAPH_TRAVERSALS']),
  ]),
]);
