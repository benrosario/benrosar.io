// Spring 2024 CS 61B Final, transcribed from the official exam and solutions.
// Zero-point poetry and feedback questions omitted.
import { exam, problem, text, java, blank, mc } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...topics) => site(...topics);
const b = (id, label, ans, ...topics) => blank(id, label, ans, T(...topics));

export default exam('61b-sp24-final', 'Spring 2024 Final', {
  exam: 'https://drive.google.com/file/d/1wLGD_UJeK-AOQkbc4884KvFawdEpeGKj/view',
  sol: 'https://drive.google.com/file/d/1vo_hpCq8LsMSaWpw9PlxqfSIOlE4_4Q0/view',
}, 'sp24-final', [
  problem('1','Vroom (9 pts)',null,[
    text('For each line, answer CE for compile error, RE for runtime error, OK if it runs without printing, or give the printed result. If a line errors, later lines still run. Classes: TwoWheel has public int topSpeed=200, private boolean counterSteer=true, rideWith(TwoWheel) prints “I’m TwoWheel”, and printSteer() prints counterSteer. Motorcycle extends TwoWheel, sets topSpeed=400, and overrides rideWith to print “I’m moto”. Bicycle extends TwoWheel, sets topSpeed=100, and overrides rideWith to print “I’m bike”.'),
    java(`TwoWheel scooter = new TwoWheel();                 // (a)
Motorcycle kawi = new Motorcycle();                   // (b)
Bicycle trek = new Bicycle();                         // (c)
Motorcycle.rideWith(kawi);                            // (d)
kawi.rideWith(trek);                                  // (e)
((TwoWheel) trek).rideWith(scooter);                  // (f)`),
    ...[['OK'],['OK'],['OK'],['CE'],["I'm moto"],["I'm bike"]].map(([a],i)=>b(i+1,`(${String.fromCharCode(97+i)}) Result`,a,'JAVA','INHERITANCE')),
    mc(7,'(g) If printSteer() becomes static while counterSteer stays an instance field, will the class compile?',['Yes','No'],1,T('JAVA')),
    mc(8,'(h) If counterSteer becomes private static, will the class compile?',['Yes','No'],0,T('JAVA')),
    mc(9,'(i) If topSpeed becomes private, will the subclasses compile?',['Yes','No'],1,T('JAVA','INHERITANCE')),
  ]),
  problem('2','Polynomials (22 pts)',null,[
    text('A Polynomial stores nonzero terms in descending exponent order in a singly linked list, ending with sentinel Term(0,-1). The zero polynomial contains only the sentinel. Implement eval(input), then report runtimes in terms of degree n. For addTerm assume coef != 0, exp >= 0, and no existing nonzero term has exponent exp.'),
    java(`public double eval(double input) {
  double result = 0;
  ⟪a⟫
  while (⟪b⟫) {
    result += ⟪c⟫;
    ⟪d⟫
  }
  ⟪e⟫
}`,{a:'Term currTerm = terms;',b:'currTerm.exp != -1',c:'currTerm.coef * Math.pow(input, currTerm.exp)',d:'currTerm = currTerm.next;',e:'return result;'}),
    ...[['(a) Start at the first term','Term currTerm = terms;'],['(a) Stop at the sentinel','currTerm.exp != -1'],['(a) Accumulate a term','currTerm.coef * Math.pow(input, currTerm.exp)'],['(a) Advance','currTerm = currTerm.next;'],['(a) Return the sum','return result;']].map(([l,a],i)=>b(10+i,l,a,'LINKED_LISTS','JAVA')),
    b(15,'(b) Most informative general runtime bound for eval in degree n','O(n)','ASYMPTOTICS','LINKED_LISTS'),
    java(`public void addTerm(int coef, int exp) {
  Term newTerm = ⟪f⟫;
  if (⟪g⟫) {
    ⟪h⟫
    ⟪i⟫
    return;
  }
  Term curr = ⟪j⟫;
  while (⟪k⟫) {
    ⟪l⟫
  }
  ⟪m⟫
  ⟪n⟫
}`,{f:'new Term(coef, exp)',g:'newTerm.exp > terms.exp',h:'newTerm.next = terms;',i:'terms = newTerm;',j:'terms',k:'curr.next.exp > newTerm.exp',l:'curr = curr.next;',m:'newTerm.next = curr.next;',n:'curr.next = newTerm;'}),
    ...[['(c) Make the term','new Term(coef, exp)'],['(c) Detect insertion before head','newTerm.exp > terms.exp'],['(c) Link new head to old head','newTerm.next = terms;'],['(c) Update head','terms = newTerm;'],['(c) Start traversal','terms'],['(c) Continue while next exponent is larger','curr.next.exp > newTerm.exp'],['(c) Advance','curr = curr.next;'],['(c) Link new term to successor','newTerm.next = curr.next;'],['(c) Link predecessor to new term','curr.next = newTerm;']].map(([l,a],i)=>b(16+i,l,a,'LINKED_LISTS','JAVA')),
    b(25,'(d) Most informative general runtime bound for addTerm in terms of n and k','O(n)','ASYMPTOTICS','LINKED_LISTS'),
  ]),
  problem('3','Disjoint Sets (4 pts)',null,[
    mc(26,'(a) Is [1, 0, -1, -1, -1] a valid Weighted Quick Union representation?',['True','False'],1,T('DISJOINT_SETS')),
    mc(27,'(b) Is [-1, 2, 3, 4, -4] a valid Weighted Quick Union representation?',['True','False'],1,T('DISJOINT_SETS')),
    mc(28,'(c) Minimum union operations needed to distinguish Quick Union from Weighted Quick Union (both accepted answers)',['1','2','3','4'],1,{...T('DISJOINT_SETS'),also:[0]}),
    mc(29,'(d) Minimum union operations needed to distinguish Weighted Quick Union from Weighted Quick Union with Path Compression',['1','2','3','4'],3,T('DISJOINT_SETS')),
  ]),
  problem('4','Heaps (7 pts)',null,[
    mc(30,'(a) Insert 7 into min-heap [−,1,9,3,10,13,4,8]. Result?',['[−,1,9,3,7,13,4,8,10]','[−,1,3,7,9,13,4,8,10]','[−,1,3,7,13,9,4,8,10]','[−,1,7,3,9,13,4,8,10]'],3,T('HEAPS')),
    mc(31,'(b) Two remove operations from [−,1,9,3,10,13,4,8]. Result?',['[−,4,9,8,10,13]','[−,4,8,9,10,13]','[−,4,8,9,13,10]','[−,4,9,8,13,10]'],0,T('HEAPS')),
    b(32,'(c) Give a valid max-heap array with values 1–7 and 21 inversions','[−,7,6,5,4,3,2,1]','HEAPS'),
    b(33,'(d) Give a valid max-heap array with values 1–7 and 12 inversions','[−,7,3,6,1,2,4,5]','HEAPS'),
  ]),
  problem('5','In-Depth Analysis (5 pts)',null,[
    text('For (a), the pictured undirected graph has edges S–A, S–B, A–B, A–D, B–D, B–E, D–C, D–E, D–T, C–T. Run DFS preorder from S, visiting alphabetically earlier neighbors first.'),
    mc(34,'(a) DFS preorder',['S,A,B,D,C,T,E','S,A,B,C,D,E,T','S,A,C,T,D,B,E'],0,T('GRAPH_TRAVERSALS')),
    b(35,'(b) Maximum nodes in a rooted binary tree of height at most 10 with identical inorder and postorder traversal','11','TREE_TRAVERSALS'),
    b(36,'(c) Maximum nodes in a rooted binary tree of height at most 10 with identical preorder and postorder traversal','1','TREE_TRAVERSALS'),
  ]),
  problem('6','ddEei Sort (16 pts)',null,[
    text('Insertion sort starts on [28,97,44,25,11,84]. It has reached [25,28,44,97,11,84], so the first four items are sorted. Append [32,84,28,61], then resume insertion sort.'),
    b(37,'(a) State after four more elements have been inserted in sorted position','[11,25,28,32,44,84,84,97,28,61]','SORTING'),
    b(38,'(b) Additional runtime for P appended items after sorting N items: best case','Θ(P)','ASYMPTOTICS','SORTING'),
    b(39,'(b) Additional runtime for P appended items after sorting N items: worst case','Θ(P(N + P))','ASYMPTOTICS','SORTING'),
    ...[
      ['(c) Selection sort, with new data appended at any point: always correct?','Does not always produce a sorted list'],
      ['(d) Heapsort without in-place heapification, adding new items into the heap: always correct?','Does not always produce a sorted list'],
      ['(e) Mergesort, sorted new data merged into a sublist just before a merge: always correct?','Always produces a sorted list'],
      ['(f) MSD radix sort, insert new data in its matching subproblem before a counting pass: always correct?','Always produces a sorted list'],
      ['(g) Quicksort with 3-scan partitioning, append new data before a partition: always correct?','Does not always produce a sorted list'],
    ].map(([l,a],i)=>mc(40+i,l,['Always produces a sorted list','Does not always produce a sorted list'],a.startsWith('Always')?0:1,T('SORTING'))),
  ]),
  problem('7','Two Seemingly Unrelated Problems (22 pts)',null,[
    text('Problem I: a connected (weakly connected), unweighted DAG has N nodes.'),
    b(45,'(a) Best-case longest path length, Θ bound','Θ(1)','GRAPH_TRAVERSALS','ASYMPTOTICS'),
    b(46,'(a) Worst-case longest path length, Θ bound','Θ(N)','GRAPH_TRAVERSALS','ASYMPTOTICS'),
    b(47,'(b) Describe extendable best-case graph','One center vertex with a directed edge to every other vertex (an outward star); longest path has one edge.','GRAPH_TRAVERSALS'),
    b(48,'(b) Describe extendable worst-case graph','A directed chain through all N vertices; longest path has N−1 edges.','GRAPH_TRAVERSALS'),
    text('Problem II: Booksort repeatedly chooses an out-of-place book and shifts it to its correct slot in Θ(1) time. State is a permutation; an edge represents one legal operation. For N=3, states are 123, 213, 132, 231, 312, 321.'),
    b(49,'(c) Give the directed transitions for the N=3 state graph (any equivalent edge list)','213→123; 132→123; 231→123,213,321; 312→123,132,321; 321→132,213','GRAPH_TRAVERSALS'),
    b(50,'(d) Worst-case runtime if each step scans Θ(N) and chooses the smallest misplaced book','Θ(N²)','ASYMPTOTICS','SORTING'),
    b(51,'(e) Tightest demonstrated lower bound for worst-case runtime when choosing leftmost misplaced book','Ω(2^N)','ASYMPTOTICS','SORTING'),
    b(52,'(f) Why is worst-case runtime O(N!)? Give the state-graph argument.','There are N! permutation states. The transition graph is a DAG because the algorithm always terminates; a DAG with N! vertices has paths of length at most N!−1. Each transition costs Θ(1), so runtime is O(N!).','ASYMPTOTICS','SORTING'),
  ]),
  problem('8','Lost in the Ceryneian H.I.N.D. (15 pts)',null,[
    text('Given a connected weighted undirected graph with positive integer weights, vertices S≠T, and no bridge whose removal disconnects the graph, return an edge whose deletion maximizes the new shortest-path distance from S to T. You may call black-box Dijkstra in Θ(E log V). Design an algorithm running in O(VE log V).'),
    b(53,'Describe the algorithm','Run Dijkstra on the original graph to recover one shortest S-to-T path. For each edge on that path, temporarily remove it, run Dijkstra again, record the resulting S-to-T distance, and restore the edge. Return the path edge whose removal gives the largest distance.','SHORTEST_PATHS','GRAPH_TRAVERSALS'),
  ]),
]);
