// Fall 2024 CS 61B Final, transcribed from the official exam and solutions.
// Bonus and feedback items are not scored and are omitted.
import { exam, problem, text, java, blank, mc, sata } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...topics) => site(...topics);
const b = (id, label, ans, ...topics) => blank(id, label, ans, T(...topics));

export default exam('61b-fa24-final','Fall 2024 Final',{
  exam:'https://drive.google.com/file/d/1QSg0vDkz3x1SdErX0Y_-3rwFhtj-rYdc/view',
  sol:'https://drive.google.com/file/d/1U5HqcxO89Epuj7YQbDIkzy_128dFB3ui/view',
},'fa24-final',[
  problem('1','Potpourri (8 pts)',null,[
    mc(1,'(a) Java iterators use the yield keyword instead of return.',['True','False'],1,T('ITERATORS','JAVA')),
    mc(2,'(b) A function receiving a list of length N must take at least Ω(N) time.',['True','False'],1,T('ASYMPTOTICS')),
    sata(3,'(c) Select every true statement about checking if an unsorted N-item array contains 1.',['Best-case O(1)','Best-case Ω(N)','Worst-case Ω(log N)','Worst-case Θ(N)','None of the above'],[0,2,3],T('ASYMPTOTICS','ARRAYS')),
    mc(4,'(d) An LLRB is always exactly twice as tall as its corresponding B-tree.',['True','False'],1,T('RED_BLACK_TREES','B_TREES')),
    mc(5,'(e) Calling null.hashCode() in Java results in an error.',['True','False'],0,T('JAVA')),
  ]),
  problem('2','Do It Aditya’s Way! (15 pts)',null,[
    text('Define superclass > subclass. Unrelated classes are incomparable. A full ordering lists each subclass before its superclass whenever they are related.'),
    mc(6,'(a) If A > B and B > C, then A > C.',['True','False'],0,T('INHERITANCE')),
    mc(7,'(b) If A appears after B in a full ordering, then necessarily A > B.',['True','False'],1,T('INHERITANCE')),
    b(8,'(c) Describe an O(N+M) full-ordering algorithm in at most three sentences.','Build a DAG with one vertex per class and an edge from each subclass to its superclass. Return a topological ordering of the DAG.','INHERITANCE','GRAPH_TRAVERSALS'),
    b(9,'(d) Final element in a full ordering of every non-primitive Java class','Object','INHERITANCE','JAVA'),
    text('The pictured max-heap of classes has Glorp at root; children Foo and Snapp; grandchildren Jurp, Bram, Wert, Laip in that order. Every parent is a superclass of its children; additional superclass relations may exist. Each class has a no-arg constructor and its own toString.'),
    mc(10,'(e) Glorp g = new Bram();',['Never Error','Always Error','Sometimes Error'],0,T('INHERITANCE','JAVA')),
    mc(11,'(f) Foo f = new Wert();',['Never Error','Always Error','Sometimes Error'],2,T('INHERITANCE','JAVA')),
    mc(12,'(g) Glorp g = new Snapp(); ((Wert) g).toString();',['Glorp.toString always called','Always Error','Wert.toString always called','Not Enough Information'],1,T('INHERITANCE','JAVA')),
    mc(13,'(h) Laip l = new Wert(); ((Snapp) l).toString();',['Laip.toString always called','Always Error','Wert.toString always called','Not Enough Information'],3,T('INHERITANCE','JAVA')),
  ]),
  problem('3','The Golden Apples of Yokeyrin (21 pts)',null,[
    text('Rooms are vertices 1–100 in a weighted directed graph. Anirudh starts at room 100 and Heracles at room 1; they move simultaneously, may wait, and may meet only in a room. A meeting is guaranteed. For the implementation below, adj maps each room to a list of outgoing edges; State has int room,time and Edge has int dest,weight.'),
    java(`private class StateComparator ⟪a⟫ {
  @Override
  public int compare(State o1, State o2) {
    ⟪b⟫
  }
}
private Map<Integer, Integer> dijkstras(int source, Map<Integer, List<Edge>> adj) {
  Map<Integer, Integer> distTo = new HashMap<>();
  PriorityQueue<State> states = ⟪c⟫;
  states.add(new State(source, 0));
  while (!states.isEmpty()) {
    State curr = states.poll();
    if (!distTo.containsKey(curr.room)) {
      ⟪d⟫
      for (Edge e : adj.get(curr.room)) {
        State nextRoom = ⟪e⟫;
        ⟪f⟫
      }
    }
  }
  return distTo;
}`,{a:'implements Comparator<State>',b:'return o1.time - o2.time;',c:'new PriorityQueue<>(new StateComparator())',d:'distTo.put(curr.room, curr.time);',e:'new State(e.dest, curr.time + e.weight)',f:'states.add(nextRoom);'}),
    ...[['(a) Implement the comparator','implements Comparator<State>'],['(a) Compare by time','return o1.time - o2.time;'],['(a) Initialize the priority queue','new PriorityQueue<>(new StateComparator())'],['(a) Record settled distance','distTo.put(curr.room, curr.time);'],['(a) Make next state','new State(e.dest, curr.time + e.weight)'],['(a) Add state to fringe','states.add(nextRoom);']].map(([l,a],i)=>b(14+i,l,a,'SHORTEST_PATHS','JAVA')),
    java(`public int leastTime(Map<Integer, List<Edge>> adj) {
  Map<Integer, Integer> herc = ⟪g⟫;
  Map<Integer, Integer> ani = ⟪h⟫;
  int lowestTime = Integer.MAX_VALUE;
  for (int i = 1; i <= 100; i++) {
    if (⟪i⟫ && ⟪j⟫) {
      int currTime = ⟪k⟫;
      lowestTime = ⟪l⟫;
    }
  }
  return lowestTime;
}`,{g:'dijkstras(1, adj)',h:'dijkstras(100, adj)',i:'herc.containsKey(i)',j:'ani.containsKey(i)',k:'Math.max(herc.get(i), ani.get(i))',l:'Math.min(lowestTime, currTime)'}),
    ...[['(b) Heracles distances','dijkstras(1, adj)'],['(b) Anirudh distances','dijkstras(100, adj)'],['(b) Heracles can reach room','herc.containsKey(i)'],['(b) Anirudh can reach room','ani.containsKey(i)'],['(b) Time until both are there','Math.max(herc.get(i), ani.get(i))'],['(b) Update best meeting time','Math.min(lowestTime, currTime)']].map(([l,a],i)=>b(20+i,l,a,'SHORTEST_PATHS','JAVA')),
  ]),
  problem('4','Sorting (18 pts)',null,[
    mc(26,'(a) Bottom-up heapify [7,2,2,4,5,8,9] into a max heap.',['[9,8,5,4,7,2,2]','[9,5,8,4,2,7,2]','[2,4,2,7,5,8,9]','[9,5,8,2,4,2,7]'],1,T('HEAPS','SORTING')),
    mc(27,'(b) One in-place heapsort iteration after bottom-up heapification.',['[5,4,8,2,2,7,9]','[2,5,8,4,2,7,9]','[8,7,4,5,2,2,9]','[8,5,7,4,2,2,9]'],3,T('HEAPS','SORTING')),
    mc(28,'(c) MSD radix sort [123,312,279,189,423,275] after the first two digits.',['[123,189,275,279,312,423]','[123,189,279,275,312,423]','[312,123,423,275,279,189]','[312,123,423,279,275,189]'],1,T('RADIX_SORTS','SORTING')),
    mc(29,'(d) LSD radix sort [123,312,279,189,423,275] after processing the last two digits.',['[123,189,275,279,312,423]','[123,189,279,275,312,423]','[312,123,423,275,279,189]','[312,123,423,279,275,189]'],2,T('RADIX_SORTS','SORTING')),
    text('For (e–h), give best- and worst-case runtimes for N distinct items.'),
    b(30,'(e) Mergesort generalized to k=3 equal subarrays: best case','Θ(N log N)','SORTING','ASYMPTOTICS'),
    b(31,'(e) k=3: worst case','Θ(N log N)','SORTING','ASYMPTOTICS'),
    b(32,'(f) k=N: best case','Θ(N²)','SORTING','ASYMPTOTICS'),
    b(33,'(f) k=N: worst case','Θ(N²)','SORTING','ASYMPTOTICS'),
    b(34,'(g) Quicksort puts the pivot at the left-most position in the right subarray: best case','Θ(N²)','SORTING','ASYMPTOTICS'),
    b(35,'(g) Same variant: worst case','Θ(∞)','SORTING','ASYMPTOTICS'),
    b(36,'(h) Quicksort puts the pivot at the right-most position in the right subarray: best case','Θ(N log N)','SORTING','ASYMPTOTICS'),
    b(37,'(h) Same variant: worst case','Θ(N²)','SORTING','ASYMPTOTICS'),
  ]),
  problem('5','Binary Tries (16 pts)',null,[
    text('A binary trie maps strings over {0,1}; the empty key is allowed. Insert, in order, keys/values: 101→5, 011→6, 100→1, 010→2, 111→7, 001→4, 11→3, 0→8.'),
    ...[['101','5'],['011','6'],['100','1'],['010','2'],['111','7'],['001','4'],['11','3'],['0','8']].map(([key,val],i)=>b(38+i,`(a) Value stored at key "${key}"`,val,'TRIES')),
    b(46,'(b) Worst-case nodes for N distinct keys, each B characters long','Θ(NB)','TRIES','ASYMPTOTICS'),
    java(`public V put(String key, V value) {
  Node n = root;
  for (char c : key.toCharArray()) {
    if (⟪a⟫) {
      if (⟪b⟫) ⟪c⟫
      ⟪d⟫
    } else if (⟪e⟫) {
      if (⟪f⟫) ⟪g⟫
      ⟪h⟫
    } else {
      throw new IllegalArgumentException("Key must contain only 0s and 1s");
    }
  }
  ⟪i⟫
  return value;
}`,{a:"c == '0'",b:'n.zero == null',c:'n.zero = new Node();',d:'n = n.zero;',e:"c == '1'",f:'n.one == null',g:'n.one = new Node();',h:'n = n.one;',i:'n.value = value;'}),
    ...[['(c) Check for zero','c == \'0\''],['(c) Missing zero-child check','n.zero == null'],['(c) Create zero child','n.zero = new Node();'],['(c) Follow zero child','n = n.zero;'],['(c) Check for one','c == \'1\''],['(c) Missing one-child check','n.one == null'],['(c) Create one child','n.one = new Node();'],['(c) Follow one child','n = n.one;'],['(c) Store value at key node','n.value = value;']].map(([l,a],i)=>b(47+i,l,a,'TRIES','JAVA')),
  ]),
  problem('6','Natalia MST (22 pts)',null,[
    text('A Natalia MST is a minimum-weight spanning tree containing exactly one edge across a specified cut. In the pictured six-vertex graph, cut sides are {P,Q,R} and {X,Y,Z}. Edges and weights: P-Q 5, P-R 3, Q-X 4, Q-Y 2, R-Y 1, X-Y 7, X-Z 5.'),
    sata(56,'(a) Select all edges in the Natalia MST.',['P-Q','Q-X','R-Y','X-Z','P-R','Q-Y','X-Y'],[0,2,3,4,6],T('MSTS')),
    mc(57,'(b) Does every connected graph and cut admit a Natalia MST?',['True','False'],1,T('MSTS')),
    b(58,'(b) Give a counterexample with at most four vertices','A three-vertex path A—B—C with cut {A,C} | {B}. Both path edges cross the cut, so every spanning tree uses two crossing edges and none has exactly one.','MSTS'),
    mc(59,'(c) If a Natalia MST exists, must its weight equal the unrestricted MST weight?',['True','False'],1,T('MSTS')),
    sata(60,'(d) Which modified algorithms always produce a Natalia MST?',['Build separate MSTs on both cut sides, then add the minimum crossing edge.','Add the minimum crossing edge, delete all other crossing edges, then run Prim from the joined endpoints.','Run Prim on the full graph, then delete all but the minimum crossing edge.','Add the maximum edge weight to every crossing edge, then run Kruskal.','None of the above'],[0,1,3],T('MSTS')),
    b(61,'(e) Give an O(E) repair algorithm after deleting edge e from given Natalia MST N','If e is not in N, return N. If e is its crossing-cut edge, replace it with the lightest remaining edge across the original cut. Otherwise e split N into two components: find those components by DFS, then add the lightest edge of G′ crossing between them.','MSTS','GRAPH_TRAVERSALS'),
  ]),
]);
