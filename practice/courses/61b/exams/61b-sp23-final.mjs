// Spring 2023 Final: scored questions transcribed from the exam and official solutions.
// The exam clarification explicitly removed Q2(b); administrative and zero-point items are omitted.
import { exam, problem, text, java, blank, mc } from '../../../content/author.mjs';
import { site } from '../staff.mjs';
const T = (...tags) => site(...tags);
export default exam('61b-sp23-final', 'Spring 2023 Final', {
  exam: 'https://drive.google.com/file/d/1HqkcadiXO8XcxT3Y1E_u6F2dQ2hX6dxY/view',
  sol: 'https://drive.google.com/file/d/1kj9i4hPPmTlJk9xCrnNU02bkF9Lr9xuj/view',
}, 'sp23-final', [
  problem('1','I Got A ...',null,[
    java(`class A {
  public void f() { B me = (B) this; g(this); }
  public void g(A x) { System.out.println("Mom"); x.h(); }
  public void h() { System.out.println("I got a +2"); }
}
class B extends A {
  public void g(B x) { System.out.println("Brother"); x.h(); }
  @Override public void h() { System.out.println("I got a PB!"); }
}
A kam = new A(); B park = new A(); A mitch = new B();
kam.f(); park.f(); mitch.f();`),
    blank(1,'Output/error for kam.f()','RE',T('JAVA','INHERITANCE')),
    blank(2,'Output/error for initializing park','CE',T('JAVA','INHERITANCE')),
    blank(3,'Output from mitch.f(), one line per output','Mom\nI got a PB!',T('JAVA','INHERITANCE')),
  ]),
  problem('2','Edgy Questions',null,[
    text('(a) In this weighted undirected graph, edges are AB=3, AC=5, AE=3, BC=2, BD=1, BE=1, CD=4, DE=3. True or false: Kruskal and Prim from B always produce the same MST, even with different tie-breaking.'),
    blank(4,'(a) True or false','false',T('MSTS')),
    text('(b) Removed from the exam by clarification; no question to answer.'),
    text('(c) A* graph edges: S–E 4, S–B 2, S–C 6, E–G 2, E–F 1, E–C 1, G–F 3, F–C 1, F–T 3, C–T 3, C–B 4, B–T 6. Heuristics: h(S)=3, h(B)=6, h(C)=2, h(E)=2, h(F)=5, h(G)=12, h(T)=0. Break ties alphabetically.'),
    blank(5,'(c) A* visit order from S to T','S E C B T',T('SHORTEST_PATHS')),
    java(`static Node mystery(Node root) {
  if (root.right == null) return root;
  return mystery(root.right);
}`),
    mc(6,'(d) What does mystery return for any binary tree root?',['The last node visited by an in-order traversal','The last node visited by a post-order traversal','The last node visited by a level-order traversal','None of the above'],0,T('TREE_TRAVERSALS')),
  ]),
  problem('3','Value Town',null,[
    java(`Food burrito = new Food("burrito", 8);
ratings.put(burrito, 5);
ratings.put(new Food("taco", 6), 3);
System.out.println(ratings.getOrDefault(burrito, -1)); // 13
burrito.price += 3;
System.out.println(ratings.getOrDefault(burrito, -1)); // 17
ratings.put(new Food("burger", 13), 1);
ratings.put(new Food("pizza", 7), 4);
System.out.println(ratings.getOrDefault(burrito, -1)); // 21
ratings.put(new Food("sandwich", 9), 2);
System.out.println(ratings.getOrDefault(burrito, -1)); // 24`),
    text('Food.hashCode() is price; Food does not override equals. MyHashMap begins with 4 buckets, external chaining, and doubles capacity when load factor exceeds 1.'),
    ...[['(a) Line 13 output','5'],['(b) Line 17 output','-1'],['(c) Line 21 output','-1'],['(d) Line 24 output','5'],['(e) Is bucket 0 empty after execution?','true'],['(f) Does any bucket hold at least two Food objects?','false'],['(g) Does inserting another new Food("sandwich",9) increase map size?','true']].map(([l,a],i)=>blank(7+i,l,a,T('HASHING'))),
  ]),
  problem('4','Asymptotics',null,[
    java(`void enigma1(int N) {
  for (int i=0; i<Math.pow(2,N); i+=5)
    for (int j=N; j>=0; j-=1) {}
}
void enigma2(int N) {
  for (int i=N*8; i>1; i/=4)
    for (int j=0; j<10000; j+=N) {}
}
void enigma3(int N) {
  for (int i=2; i<N; i*=2)
    for (int j=0; j<N*N; j+=i/2) {}
}
void enigma4(int N) { enigma4(N,N); }
void enigma4(int x,int n) {
  if (x==1) return;
  for (int i=0; i<n; i+=1) enigma4(x-1,n);
}`),
    ...[['enigma1','Theta(N * 2^N)'],['enigma2','Theta(log N)'],['enigma3','Theta(N^2)'],['enigma4','Theta(N^(N-1))']].map(([l,a],i)=>blank(14+i,l,a,T('ASYMPTOTICS'))),
    text('For ben(N), work is Θ(N), base case N<=625, and each of answer recursive calls gets input N/answer.'),
    ...[['answer = 0','Theta(N)'],['answer = 2','Theta(N log N)'],['answer = N/2','Theta(N)'],['answer = N log N','Theta(N log N)'],['answer = N^2','Theta(N^2)'],['answer = N^N','None of the above']].map(([l,a],i)=>blank(18+i,l,a,T('ASYMPTOTICS'))),
  ]),
  problem('5','Wordle',null,[
    text('Implement a trie dictionary with fields boolean valid, Wordle[] children (26 entries), and int size. Words are unique uppercase strings or empty. Fill in the checkable code fragments.'),
    java(`void insert(String word) {
  size += 1;
  if (word.length()==0) { this.valid=true; return; }
  int index = charToInt(word.charAt(0));
  if (this.children[index]==null) this.children[index]=new Wordle();
  this.children[index].insert(word.substring(1));
}
boolean contains(String word) {
  return (this.valid && word.length()==0)
      || (word.length()!=0 && children[charToInt(word.charAt(0))]!=null
          && children[charToInt(word.charAt(0))].contains(word.substring(1)));
}
List<String> wordList() {
  List<String> words=new ArrayList<>();
  if (this.valid) words.add("");
  for (int i=0;i<26;i+=1) if (children[i]!=null)
    for (String s : children[i].wordList()) words.add(intToChar(i)+s);
  return words;
}
String getRandomWord(Random random) {
  int randNum=random.nextInt(this.size);
  if (randNum==size-1 && valid) return "";
  int letter=-1;
  while (randNum>=0) {
    letter += 1;
    if (children[letter]!=null) randNum -= children[letter].size;
  }
  return intToChar(letter)+children[letter].getRandomWord(random);
}`),
    ...[
      ['(insert) Empty-string case','this.valid = true;'],['(insert) First-character index','charToInt(word.charAt(0))'],['(insert) Create missing child','this.children[index] = new Wordle();'],['(insert) Recurse on suffix','this.children[index].insert(word.substring(1));'],
      ['(contains) Blank 1: terminal word flag','this.valid'],['(contains) Blank 2: empty word test','word.length() == 0'],['(contains) Blank 3: nonempty word test','word.length() != 0'],['(contains) Blank 4: child exists','children[charToInt(word.charAt(0))] != null'],['(contains) Blank 5: recursive child result','children[charToInt(word.charAt(0))].contains(word.substring(1))'],
      ['(wordList) Include empty word','words.add("");'],['(wordList) Iterate over child words','String s : children[i].wordList()'],['(wordList) Prefix and append','words.add(intToChar(i) + s);'],
      ['(getRandomWord) Empty word condition','randNum == size - 1 && valid'],['(getRandomWord) Existing child test','children[letter]'],['(getRandomWord) Skip child subtree count','randNum -= children[letter].size;'],['(getRandomWord) Prefix selected child result','intToChar(letter) + children[letter].getRandomWord(random)'],
    ].map(([l,a],i)=>blank(24+i,l,a,T('TRIES','RECURSION'))),
  ]),
  problem('6','Sorta Sorting',null,[
    text('(A) foo returns sortedArr[9] from an array of at least 100 nonnegative integers.'),
    blank(40,'(A)(i) In at most 10 words, what does foo return?','The 10th smallest element',T('HEAPS','SORTING')),
    text('(A)(ii) Use a max-of-values heap represented by negated integers, keeping the smallest ten values.'),
    ...[['Initialize first loop','i = 0; i < 10; i += 1'],['Insert first ten values','h.insert(arr[i] * -1);'],['Second loop bounds','i = 10; i < arr.length; i += 1'],['Insert next negated value','h.insert(arr[i] * -1);'],['Discard largest among retained ten','h.deleteMin();'],['Return 10th smallest','h.deleteMin() * -1']].map(([l,a],i)=>blank(41+i,l,a,T('HEAPS','SORTING'))),
    text('(B) bar returns the smallest nonnegative integer not in the input list.'),
    mc(47,'(B)(i) What does bar return?',['The smallest nonnegative integer','The smallest duplicate nonnegative integer','The smallest nonnegative integer not in the list','The smallest nonnegative integer that is not duplicated'],2,T('ARRAYS','SORTING')),
    ...[['(B)(ii) Guard before indexing counts','arr[i] < arr.length'],['(B)(ii) Mark present value','counts[arr[i]] = true;'],['(B)(ii) Detect missing value','!counts[i]'],['(B)(ii) Return first missing value','return i;'],['(B)(ii) If all 0..N-1 are present','return arr.length;']].map(([l,a],i)=>blank(48+i,l,a,T('ARRAYS','SORTING'))),
  ]),
  problem('7','Actually Sorting',null,[
    text('(Part 1)(a) Hoare partition with first-index pivot on [4,6,2,5,1,7,3,8].'),
    blank(53,'(a) Array after partition','1,3,2,4,5,7,6,8',T('SORTING')),
    blank(54,'(b) Can any comparison sort sort all 2023-number lists in at most 2024 worst-case comparisons? T/F','false',T('COMPARISON_SORTS')),
    blank(55,'(c) Can any comparison sort be made stable by comparing original indices as a tie-break? T/F','true',T('COMPARISON_SORTS','SORTING')),
    blank(56,'(Part 2)(a)(i) Quicksort pivot always the 10th smallest','Theta(N^2)',T('SORTING')),
    blank(57,'(Part 2)(a)(ii) Quicksort pivot always the 10th percentile','Theta(N log N)',T('SORTING')),
    blank(58,'(Part 2)(b)(i) quickMergeSort chooses median pivot','Theta(N log N)',T('SORTING')),
    blank(59,'(Part 2)(b)(ii) quickMergeSort chooses minimum pivot','Theta(N log N)',T('SORTING')),
    ...[['(Part 3)(a) Identify algorithm','LSD radix sort'],['(Part 3)(b) Identify algorithm','Insertion sort'],['(Part 3)(c) Identify algorithm','Heapsort']].map(([l,a],i)=>blank(60+i,l,a,T('SORTING','RADIX_SORTS'))),
  ]),
  problem('8','The Javaugean Stables',null,[
    text('Directed graph with positive edge weights. Given a fully connected graph, find the minimum water depth to flood every vertex reachable from source 0. Runtime must be O(E log E) and independent of edge weights. The exam clarification replaces PriorityQueue with MinHeap.'),
    java(`int Stables(Graph g) {
  MinHeap<GraphEdge> h = new MinHeap<>();
  Queue<Integer> q = new Queue<>();
  boolean[] visited = new boolean[g.size()];
  int depth = 0;
  q.insert(0);
  while (h.size()>0 || q.size()>0) {
    if (q.size()>0) {
      int n=q.remove();
      visited[n]=true;
      for (GraphEdge i : g.neighbors(n)) h.insert(i);
    } else {
      GraphEdge smallestedge=h.deleteMin();
      if (!visited[smallestedge.to]) {
        q.add(smallestedge.to);
        depth=Math.max(depth,smallestedge.weight);
      }
    }
  }
  return depth;
}
int TwoRiverStables(Graph g) {
  Graph newGraph=new Graph(g);
  newGraph.addEdge(new GraphEdge(0,1,0));
  return Stables(newGraph);
}`),
    ...[
      ['(A) Frontier edge min-heap','MinHeap<GraphEdge> h = new MinHeap<>();'],['(A) Queue','Queue<Integer> q = new Queue<>();'],['(A) Visited array length','g.size()'],['(A) Start vertex','q.insert(0);'],['(A) Continue while either structure has work','h.size() > 0 || q.size() > 0'],['(A) Dequeue current vertex','q.remove()'],['(A) Mark visited','visited[n] = true;'],['(A) Add outgoing edges to min-heap','for (GraphEdge i : g.neighbors(n)) h.insert(i);'],['(A) Remove next lightest edge','h.deleteMin()'],['(A) Check destination not visited','!visited[smallestedge.to]'],['(A) Enqueue destination','q.add(smallestedge.to);'],['(A) Update required depth','Math.max(depth, smallestedge.weight)'],['(B) Add river-1 connection','newGraph.addEdge(new GraphEdge(0, 1, 0));'],['(B) Reuse one-river algorithm','return Stables(newGraph);'],
    ].map(([l,a],i)=>blank(63+i,l,a,T('SHORTEST_PATHS','HEAPS','GRAPH_REPRESENTATIONS'))),
  ]),
]);
