// Fall 2025 Midterm 2 (Thu 11/6/2025), transcribed from the official solutions.
// Trees and graphs drawn on the exam are text diagrams; code blanks are checked against the staff's accepted answers.
// Left out: Q2.8 and the last page (0 points, just for fun).
import { exam, problem, text, java, txt, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-fa25-mt2', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const RT = ['Θ(1)', 'Θ(log(log N))', 'Θ(log N)', 'Θ((log N)²)', 'Θ(√N)', 'Θ(N)', 'Θ(N log N)', 'Θ(N²)', 'Θ(N² log N)', 'Θ(N³)', 'Θ(N³ log N)', 'Θ(2ᴺ)', 'Θ(N!)', 'Θ(Nᴺ)', 'Infinite loop'];
const rt = s => RT.indexOf(s);
const TREE = `
              A
          /       \\
        B           C
      /   \\       /   \\
     D     E     F     G
    / \\   /
   H   I J`;
const EDGES = ['A-B', 'A-C', 'A-D', 'A-E', 'B-C', 'B-D', 'C-E', 'D-E'];

export default exam(E, 'Fall 2025 Midterm 2', {
  exam: 'https://drive.google.com/file/d/1WNOhO4rwocWlMyz0bLerBfYCdgkTu7CH/view',
  sol: 'https://drive.google.com/file/d/1fzNkhodp76K2_Nhvh2jOFexdyty52_lv/view',
}, 'fa25-mt2', [
  problem('1', 'Treevia (15.0 pts)', null, [
    text('Consider the tree below. The letters represent unknown integer values, and all 10 values are unique.'),
    txt(TREE),
    sata(1, '1.1 Suppose the tree represents a max heap. Which could be the third-largest value?', LETTERS, [1, 2, 3, 4, 5, 6], { ...S('1.1'),
      ...note('A is the largest, so it can’t be third. Any of B–G can be: give it 8, its parent 9 and A 10 (e.g. A=10, B=8, C=9). H, I and J each have three ancestors, so at least three values are larger.') }),
    sata(2, '1.2 Suppose the tree represents a binary search tree. Which could be the third-largest value?', LETTERS, [5], { ...S('1.2'),
      ...note('The three largest items are C, F and G, the ones greater than A. F is the smallest of those.') }),
    sata(3, '1.3 Suppose the tree represents a binary search tree. We delete A using Hibbard deletion. Which nodes could become the new root?', LETTERS.slice(1), [3, 4], { ...S('1.3'),
      ...note('Hibbard deletion replaces A with its predecessor or its successor. The predecessor (largest item smaller than A) is E; the successor (smallest item larger than A) is F.') }),
    mc(4, '1.4 Suppose we perform an in-order tree traversal of the subtree rooted at B. Which will be the last node visited?', ['B', 'D', 'E', 'H', 'I', 'J'], 2, { ...S('1.4'),
      ...note('The in-order traversal is H, D, I, B, J, E.') }),
    sata(5, '1.5 The statement “F is strictly greater than J” is always true if the tree represents a ______. Select all options that could go in the blank.', ['Min heap', 'Max heap', 'BST', 'None'], [2], { ...S('1.5'),
      ...note('In a BST, F > A and A > J, so F > J. In either kind of heap, F and J are in different subtrees, so their order isn’t fixed: for example a min heap with F = 6 and J = 10, or a max heap with F = 1 and J = 5.') }),
    sata(6, '1.6 Suppose we treat the tree as an undirected graph and run a breadth-first search starting from G. Which could be the last node visited?', [...LETTERS, 'None'], [7, 8, 9], { ...S('1.6'),
      ...note('By distance from G: G; C; F, A; B; D, E; H, I, J. No tiebreaker is given, so any of H, I and J could be last.') }),
    sata(7, '1.7 Suppose the tree represents a binary search tree, and we want to turn it into an LLRB. Select a set of edges to turn red so that the LLRB is valid.', ['A–B', 'B–D', 'C–F', 'D–H', 'E–J', 'None, the tree is already a valid LLRB with all black links.'], [1, 4], { ...S('1.7'),
      ...note('Every path from the root to a null must have the same number of black links. The nulls below H, I and J are 4 black links from the root, the rest 3. Red links can only lower those counts, so make B–D and E–J red: every null is then 3 away. As a 2-3 tree: A at the root, then BD and C, then H, I, EJ, F, G.') }),
  ]),
  problem('2', 'Aditya’s Potpourri (16.0 pts)', null, [
    text('For 2.1 and 2.2, choose whether the following arrays represent a max heap, min heap, or neither.'),
    mc(8, '2.1 [-, 1, 7, 2, 8, 15, 5, 3, 17, 9]', ['Min heap', 'Max heap', 'Neither'], 0, S('2.1')),
    mc(9, '2.2 [-, 59, 38, 47, 26, 46, 45, 13]', ['Min heap', 'Max heap', 'Neither'], 2, { ...S('2.2'),
      ...note('46 (index 5) is a child of 38 (index 2), so this isn’t a max heap; 59 at the root rules out a min heap.') }),
    mc(10, '2.3 From a pool of n > 75 unique integers, Aditya wants to find the 75th-smallest element. Which data structure would be best for this task?', ['Hash table', 'Linked list', 'Max heap', 'Binary search tree'], 2, { also: [3], ...S('2.3'),
      ...note('A max heap that always holds the 75 smallest items so far finds it in Θ(n): add each item, and when the heap has 76 items, remove the largest. At the end, the largest item left is the 75th-smallest. Staff also accepted binary search tree, for the reading where the structure was already built.') }),
    mc(11, '2.4 True or false: if hashCode() is a valid hash function, then hashCode() + c is also a valid hash function, where c is a fixed integer in [−1000000, 1000000].', ['True', 'False'], 0, { ...S('2.4'),
      ...note('Valid means equal objects get equal hash codes, and an unchanged object always gets the same code. Adding the same constant keeps both true.') }),
    mc(12, '2.5 True or false: if hashCode() is a valid hash function, then hashCode() * c is also a valid hash function, where c is a fixed integer in [−1000000, 1000000].', ['True', 'False'], 0, { ...S('2.5'),
      ...note('Multiplying by the same constant keeps both conditions true, just as adding one does.') }),
    mc(13, '2.6 True or false: finding a value is asymptotically faster in a 2-3 tree than in an LLRB, because a 2-3 tree has a shorter height.', ['True', 'False'], 1, { ...S('2.6'),
      ...note('Both find items in O(log N), so there is no asymptotic difference.') }),
    sata(14, '2.7 Suppose we have a valid LLRB, and we add an element which creates a right-leaning red link. With no other information, select all possible operations that could be the first balancing operation after the insertion.', ['rotateLeft()', 'rotateRight()', 'colorFlip()'], [0, 2], { ...S('2.7'),
      ...note('Adding 4 to a lone 3 needs rotateLeft. Adding 4 to 3 with a red left child 2 needs colorFlip (two red children). rotateRight is only for two consecutive left-leaning red links, which a right-leaning insertion into a valid LLRB can’t create.') }),
    text('2.9: Josh built a valid Weighted Quick Union (without path compression) with 10 items, but lost one value in the parents array: [-1, 0, 0, 0, -1, 4, 4, 5, ?, 8]. (This array uses -1 instead of -size for roots.)'),
    txt(`
    0          4         ?
  / | \\       / \\        |
 1  2  3     5   6       8
             |           |
             7           9`),
    sata(15, '2.9 Assuming 8 is not a root, select all items that could be the parent of 8.', ['0', '1', '2', '3', '4', '5', '6', '7'], [0, 4], { ...S('2.9'),
      ...note('A WQU tree of height H has at least 2ᴴ items. Under 1, 2 or 3, the tree would have height 3 with only 6 items; under 5, 6 or 7, height 3 or 4 with 6 items. Under 0 or 4 it’s a valid union: union(8, 0) or union(8, 4) from the state where 8 was a root.') }),
    mc(16, '2.10 We are building a Weighted Quick Union (without path compression), and the object initially has zero connections. What is the minimum number of union operations needed to create a tree of height 3? (A tree’s height is the number of links from the root to the bottommost leaf; a fresh WQU has height 0.)', ['3', '5', '7', '15', '16', '31', '32'], 2, { ...S('2.10'),
      ...note('Height 1 takes 1 union; height 2 takes two height-1 trees plus one more union (3); height 3 takes two height-2 trees plus one more (3 + 3 + 1 = 7).') }),
  ]),
  problem('3', 'Graphery (15.0 pts)', null, [
    text('A directed graph with these weighted edges:'),
    txt(`
A → B   5
A → C   2
A → D   3
A → E   5
B → D   2
C → B   2
D → E   1
E → C   20`),
    text('Suppose we run Dijkstra’s on the graph above, starting at vertex A, tiebreaking by alphabetical order.'),
    mc(17, '3.1 In what order will the vertices be visited?', ['A, C, D, B, E', 'A, D, E, C, B', 'A, B, C, D, E', 'A, B, D, E, C'], 0, { ...S('3.1'),
      ...note('Dijkstra’s visits by distance from A: A (0), C (2), D (3), then B and E (both 4), B first alphabetically.') }),
    sata(18, '3.2 Which vertices have their distTo value updated the most number of times?', ['A', 'B', 'C', 'D', 'E'], [1, 4], { ...S('3.2'),
      ...note('B: ∞ → 5 (A→B) → 4 (C→B). E: ∞ → 5 (A→E) → 4 (D→E). C and D are updated once each.') }),
    mc(19, '3.3 Suppose we replace the edge weight for A → B from 5 with −1000. Will running Dijkstra’s from A still correctly return a shortest paths tree?', ['Yes', 'No'], 0, { ...S('3.3'),
      ...note('After relaxing A → B, no other path to B is shorter than −1000, so the tree it returns is still correct.') }),
    blank(20, '3.4 Suppose we instead replace the edge weight E → C. If this edge weight gets too small, there would no longer be a finite shortest path from A to every vertex. What is the smallest weight for edge E → C such that there is still a finite shortest path from A to every vertex?', '-5', { ...S('3.4'),
      ...note('C → B → D → E → C is a cycle with weight 2 + 2 + 1 + (E → C). If it were negative you could go around forever, so E → C must be at least −5.') }),
    mc(21, '3.5 Which edge, if reversed, causes the resulting graph to have a valid topological sort?', ['A → B', 'A → C', 'A → D', 'A → E', 'C → B', 'The graph already has a valid topological sort.'], 4, { ...S('3.5'),
      ...note('Only DAGs have topological sorts. The cycle is C → B → D → E → C, and C → B is the only one of its edges among the choices.') }),
    text('Consider the same graph, but with undirected edges. For 3.6 to 3.9, run Prim’s algorithm from vertex A, tiebreaking alphabetically.'),
    mc(22, '3.6 First edge added to the MST:', EDGES, 1, S('3.6')),
    mc(23, '3.7 Second edge added to the MST:', EDGES, 4, S('3.7')),
    mc(24, '3.8 Third edge added to the MST:', EDGES, 5, S('3.8')),
    mc(25, '3.9 Fourth edge added to the MST:', EDGES, 7, { ...S('3.9'),
      ...note('Each step adds the lightest edge leaving the tree so far: A–C (2), then B–C (2), then B–D (2), then D–E (1).') }),
    mc(26, '3.10 For the graph above, the MST output by Kruskal’s algorithm is ____ the same as the MST output by Prim’s algorithm (from 3.6 to 3.9).', ['Always', 'Sometimes (depends on tiebreaking)', 'Never'], 0, { ...S('3.10'),
      ...note('This graph’s MST is unique, so both algorithms must output it whatever the tiebreak.') }),
  ]),
  problem('4', 'Project 4E (15.0 pts)', null, [
    text('Project 4 ignored the definitions of words, but Aditya likes definitions. Implement the WordDefinitions class below, such that getDefinitions returns all definitions of a word.',
      'Reminder: synsetsFile contains definitions for each synset. Here are some example lines from the file:'),
    txt(`
25,chill iciness,coldness from environment
27,chill shivering,cold feeling`),
    text('Examples based on the lines above: getDefinitions("chill") should return ["coldness from environment", "cold feeling"], and getDefinitions("shivering") should return ["cold feeling"].',
      'Hint: split(String token) divides a string into an array of substrings on each appearance of token. (The exam had more blank lines than the solution uses; this site shows only the ones it uses.)'),
    java(`
public class WordDefinitions {
    public ⟪a⟫ definitions;

    public WordDefinitions(String synsetsFile) {
        definitions = ⟪b⟫;
        In synsetIn = new In(synsetsFile);
        while (synsetIn.hasNextLine()) {
            String line = synsetIn.readLine();
            ⟪c⟫ splitLine = ⟪d⟫.split(⟪e⟫);
            ⟪f⟫ splitWords = ⟪g⟫;
            for (⟪h⟫ : ⟪i⟫) {
                if (⟪j⟫ == null) {
                    ⟪k⟫;
                }
                ⟪l⟫;
            }
        }
    }

    /* Assume word exists in the synsets file. */
    public List<String> getDefinitions(String word) {
        ⟪m⟫;
    }
}`, { a: 'Map<String, List<String>>', b: 'new HashMap<>()', c: 'String[]', d: 'line', e: '","', f: 'String[]', g: 'splitLine[1].split(" ")', h: 'String word', i: 'splitWords', j: 'definitions.get(word)', k: 'definitions.put(word, new ArrayList<>())', l: 'definitions.get(word).add(splitLine[2])', m: 'return definitions.get(word)' }),
    blank(27, '(a) The type of definitions', ['Map<String, List<String>>', 'HashMap<String, List<String>>', 'TreeMap<String, List<String>>', 'Map<String, ArrayList<String>>', 'HashMap<String, ArrayList<String>>', 'TreeMap<String, ArrayList<String>>'], S('4')),
    blank(28, '(b) definitions = ____', ['new HashMap<>()', 'new TreeMap<>()', 'new HashMap<String, List<String>>()', 'new HashMap<String, ArrayList<String>>()', 'new TreeMap<String, List<String>>()', 'new TreeMap<String, ArrayList<String>>()'], S('4')),
    blank(29, '(c) The type of splitLine', 'String[]', { ...S('4'), ...note('split returns an array, so List<String> doesn’t work.') }),
    blank(30, '(d) ____.split(…)', 'line', S('4')),
    blank(31, '(e) The argument to split', '","', S('4')),
    blank(32, '(f) The type of splitWords', 'String[]', S('4')),
    blank(33, '(g) splitWords = ____', 'splitLine[1].split(" ")', { ...S('4'), ...note('The second field (index 1) holds the synset’s words, separated by spaces.') }),
    blank(34, '(h) The loop variable', 'String word', S('4')),
    blank(35, '(i) What the loop goes over', 'splitWords', S('4')),
    blank(36, '(j) if (____ == null)', ['definitions.get(word)', 'getDefinitions(word)'], S('4')),
    blank(37, '(k) Inside the if', 'definitions.put(word, new ArrayList<>())', S('4')),
    blank(38, '(l) After the if', 'definitions.get(word).add(splitLine[2])', { ...S('4'), ...note('The third field (index 2) is the definition. Staff also accepted a Set-based solution (Map<String, Set<String>>, returning new ArrayList<>(definitions.get(word))).') }),
    blank(39, '(m) The body of getDefinitions', 'return definitions.get(word)', S('4')),
  ]),
  problem('5', 'Hash Table (9.0 pts)', null, [
    text('Consider the class below:'),
    java(`
public class MutableString {
    public String str;

    public MutableString(String s) {
        this.str = s;
    }

    /* Changes the idx'th character of str to c. */
    public void changeChar(int idx, char c) { ... }

    /* Adds character c to the end of str. */
    public void addChar(char c) { ... }

    @Override
    public boolean equals(Object other) {
        if (other instanceof MutableString uddaMutableString) {
            return this.str.equals(uddaMutableString.str);
        }
        return false;
    }

    @Override
    public int hashCode() {
        return this.str.length();
    }
}`),
    text('Suppose we insert four items into a HashSet of MutableString objects.'),
    java(`
Set<MutableString> h = new HashSet<>();

MutableString s1 = new MutableString("cat");
h.add(s1);

h.add(new MutableString("fish"));
h.add(new MutableString("dog"));
h.add(new MutableString("horse"));`),
    text('5.1 Assuming the hash table has four buckets, write the results of the insertions above in each bucket. Do not worry about resizing. Refer to MutableString objects by their str values, as a list like ["cat", "fish"], or [] if the bucket is empty.'),
    blank(40, 'Bucket 0', ['["fish"]', 'fish', '[fish]'], S('5.1')),
    blank(41, 'Bucket 1', ['["horse"]', 'horse', '[horse]'], S('5.1')),
    blank(42, 'Bucket 2', ['[]', 'empty'], S('5.1')),
    blank(43, 'Bucket 3', ['["cat", "dog"]', 'cat, dog', '[cat, dog]'], { ...S('5.1'),
      ...note('All four strings differ, so all four are added. The hash code is the length: fish 4 → bucket 0, horse 5 → 1, cat 3 and dog 3 → 3.') }),
    sata(44, '5.2 After the four insertions, we run s1.changeChar(0, \'b\'), changing s1.str from "cat" to "bat". Which of the following are true?', ['h.contains(s1) returns true.', 'h.contains(new MutableString("bat")) returns true.', 'h.contains(new MutableString("cat")) returns true.', 'None of the above'], [0, 1], { ...S('5.2'),
      ...note('Bucket 3 now holds ["bat", "dog"]. Every query string has length 3, so contains looks in bucket 3 for an equal string: "bat" is there, "cat" isn’t.') }),
    sata(45, '5.3 Consider the hash table from 5.1, i.e. we have not changed "cat" to "bat". Suppose we run s1.addChar(\'s\'), changing s1.str from "cat" to "cats". Which of the following are true?', ['h.contains(s1) returns true.', 'h.contains(new MutableString("cat")) returns true.', 'h.contains(new MutableString("cats")) returns true.', 'h.add(new MutableString("cats")) adds a new element to our hash table.', 'None of the above'], [3], { ...S('5.3'),
      ...note('s1 stays in bucket 3, now as "cats". "cats" hashes to 4 → bucket 0, which only has "fish", so contains(s1) and contains("cats") are false and add("cats") adds a new element. "cat" hashes to bucket 3, which holds "cats" and "dog", so that is false too.') }),
  ]),
  problem('6', 'Asymptotics Analysis (16.0 pts)', null, [
    text('6.1 What is the runtime of mulch in terms of N?'),
    java(`
void mulch(int[] x) {
    int N = x.length;
    if (N <= 1) {
        return;
    }

    int[] left = new int[N/2];
    for (int i = 0; i < N/2; i += 1) {
        left[i] = x[i];
    }

    mulch(left);
    mulch(left);
}`),
    mc(46, '6.1 Best case', RT, rt('Θ(N log N)'), S('6.1')),
    mc(47, '6.1 Worst case', RT, rt('Θ(N log N)'), { ...S('6.1'),
      ...note('Each call copies half its array, then makes two calls on that half. Every level of the call tree does N/2 work in total, and there are about log N levels.') }),
    text('6.2 What is the runtime of alarmJunior in terms of N?'),
    java(`
void alarmJunior(int N) {
    alarmHelper(2, N);
}

void alarmHelper(int i, int N) {
    if (i > N) {
        return;
    }

    System.out.println("BEEP");
    alarmHelper(i*2, N/2);
}`),
    mc(48, '6.2 Runtime', RT, rt('Θ(log N)'), { ...S('6.2'),
      ...note('i doubles while N halves, so they meet after about (log N)/2 calls, each doing constant work.') }),
    text('6.3 Consider the BSTMap from Homework 9. Recall that get returns null if the item is not in the map. What is the runtime of boom in terms of N, where N = map.size()? The runtime of the compareTo method of the Laboohoo class is constant.'),
    java(`
void boom(BSTMap<Integer, Laboohoo> map) {
    for (int i = 0; i < map.size(); i += 1) {
        System.out.println(map.get(i));
    }
}`),
    mc(49, '6.3 Best case', RT, rt('Θ(N)'), S('6.3')),
    mc(50, '6.3 Worst case', RT, rt('Θ(N²)'), { ...S('6.3'),
      ...note('The keys aren’t necessarily 0 to N−1. Best case: the tree is N, N+1, …, 2N−1 in a spindly chain, so every get goes left from the root and falls off: Θ(1) each. Worst case: a chain N, N−1, …, 1, where get(i) walks about N − i links: N + (N−1) + … + 1 = Θ(N²).') }),
    blank(51, '6.4 When Edsger Dijkstra published his original algorithm, he did not use any special data structure to store the fringe. Instead, he simply scanned the distTo array, choosing the vertex with the smallest value that was not yet marked as visited. Give a tight O bound, in terms of V and/or E, for the runtime of this algorithm on a graph with V vertices and E edges, using an adjacency list. Simplify your answer.', ['O(V^2)', 'V^2', 'O(V²)', 'V²', 'O(V*V)', 'Θ(V^2)', 'Θ(V²)'], { ...S('6.4'),
      ...note('Each of the V iterations scans distTo in Θ(V) and relaxes at most V edges, so the total is O(V²). Without a priority queue there are no log factors.') }),
  ]),
  problem('7', 'Borders (14.0 pts)', null, [
    text('Bob loves walking between countries, which are represented by the class below:'),
    java(`
public class Country {
    public String name;           // Name of the country.
    public List<Country> borders; // A list of bordering countries. borders is never null.
}`),
    text('Borders go both ways, i.e. if countryA appears in countryB’s borders, then countryB appears in countryA’s borders.',
      'Implement the WalkManager class, which has two methods. public WalkManager(List<Country> countries): Constructor. Given the list of all N countries in the world, prepare any useful instance variables. Must run in O(N² log N) time. public boolean canWalk(Country a, Country b): Returns whether country a is reachable from country b, using one or more borders. Must run in O(log N) time.',
      'For example, in a world with N = 4 countries where USA borders [Canada, Mexico], Canada borders [USA], Mexico borders [USA] and Ethanland borders [] (empty list): after WalkManager wm = new WalkManager(List.of(USA, Canada, Mexico, Ethanland)), wm.canWalk(Canada, Mexico) is true (Canada to USA to Mexico) and wm.canWalk(Ethanland, USA) is false.',
      'Everything on the reference card has been imported, and all data structures behave according to their implementations in lecture.'),
    java(`
public class WalkManager {
    // Add any instance variables below (if necessary)
    ⟪a⟫;
    ⟪b⟫;

    public WalkManager(List<Country> countries) {
        int N = countries.size();
        ⟪c⟫;
        ⟪d⟫;
        for (int i = 0; i < ⟪e⟫; i += 1) {
            Country curr = ⟪f⟫;
            ⟪g⟫;
        }
        for (⟪h⟫) {
            for (Country c : ⟪i⟫) {
                ⟪j⟫;
            }
        }
    }

    public boolean canWalk(Country a, Country b) {
        return ⟪k⟫;
    }
}`, { a: 'Map<Country, Integer> wquIndex', b: 'WeightedQuickUnion wqu', c: 'wquIndex = new HashMap<>()', d: 'wqu = new WeightedQuickUnion(N)', e: 'N', f: 'countries.get(i)', g: 'wquIndex.put(curr, i)', h: 'Country curr : countries', i: 'curr.borders', j: 'wqu.union(wquIndex.get(curr), wquIndex.get(c))', k: 'wqu.isConnected(wquIndex.get(a), wquIndex.get(b))' }),
    blank(52, '(a) and (b) The two instance variables, one per line', ['Map<Country, Integer> wquIndex\nWeightedQuickUnion wqu', 'WeightedQuickUnion wqu\nMap<Country, Integer> wquIndex', 'HashMap<Country, Integer> wquIndex\nWeightedQuickUnion wqu', 'WeightedQuickUnion wqu\nHashMap<Country, Integer> wquIndex'], { ...S('7'),
      ...note('Give each country an index in a Weighted Quick Union, and union every pair of bordering countries. Then canWalk is one isConnected call, O(log N). A graph like Map<Country, List<Country>> can’t answer multi-border walks in O(log N).') }),
    blank(53, '(c) First line of the constructor after N', 'wquIndex = new HashMap<>()', S('7')),
    blank(54, '(d) Second line', 'wqu = new WeightedQuickUnion(N)', S('7')),
    blank(55, '(e) The loop bound', ['N', 'countries.size()'], S('7')),
    blank(56, '(f) Country curr = ____', 'countries.get(i)', S('7')),
    blank(57, '(g) In the first loop', 'wquIndex.put(curr, i)', S('7')),
    blank(58, '(h) The second loop’s header', 'Country curr : countries', S('7')),
    blank(59, '(i) The inner loop goes over', 'curr.borders', S('7')),
    blank(60, '(j) Inside the inner loop', ['wqu.union(wquIndex.get(curr), wquIndex.get(c))', 'wqu.union(wquIndex.get(c), wquIndex.get(curr))'], S('7')),
    blank(61, '(k) canWalk returns', ['wqu.isConnected(wquIndex.get(a), wquIndex.get(b))', 'wqu.isConnected(wquIndex.get(b), wquIndex.get(a))'], S('7')),
  ]),
]);
