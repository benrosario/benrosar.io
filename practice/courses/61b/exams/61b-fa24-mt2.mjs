// Fall 2024 Midterm 2 (Thu 10/24/2024), transcribed from the official solutions.
// Changed for this site, and said so on the page: drawn answers (the pairs in 3b, the LLRB in 4a) are asked as
// multiple choice; 3e asks which listed hash lists loop forever instead of asking for one. Left out: the bonus
// question and the last page (0 points).
import { exam, problem, text, java, txt, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-fa24-mt2', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });
const TF = ['True', 'False'];
const RT = ['Θ(1)', 'Θ(α(N))', 'Θ(log N)', 'Θ(N)', 'Θ(N α(N))', 'Θ(N log N)', 'Θ(N²)'];
const rt = s => RT.indexOf(s);
const PLACES = ['1', '2', '3', '4', '5', '6', '7'];
const bucket = (...a) => [`[${a.join(', ')}]`, a.length ? a.join(', ') : 'empty'];
const TREE = `
               Anniyat
             /         \\
        Circle           Erik
        /    \\          /    \\
  Anirudh  Vanessa  Natalia  Aditya`;

export default exam(E, 'Fall 2024 Midterm 2', {
  exam: 'https://drive.google.com/file/d/1AUw_VlBuBA6LMK8R1vrAboXtPToF2EtE/view',
  sol: 'https://drive.google.com/file/d/1mfUTBjPFYjwCq5dThr3j2iDGR_Xdx_f4/view',
}, 'fa24-mt2', [
  problem('1', '61Buff (15.0 pts)', null, [
    text('Aditya has organized a one-on-one arm wrestling competition among all of 61B’s TAs and represents the leaderboard as a binary tree: all nodes to the left of a node represent TAs who performed worse, and all nodes to the right represent TAs who performed better.',
      'The current leaderboard, from first place to last, is [Aditya, Erik, Natalia, Anniyat, Vanessa, Circle, Anirudh], and this is the tree Aditya draws:'),
    txt(TREE),
    mc(1, '(a) Which tree traversal gives the leaderboard in order from best arm wrestler to worst?', ['Pre-order', 'In-order', 'Post-order', 'Level order', 'None of the above'], 4, { ...S('1a'),
      ...note('Pre-order: Anniyat, Circle, Anirudh, Vanessa, Erik, Natalia, Aditya. In-order: Anirudh, Circle, Vanessa, Anniyat, Erik, Natalia, Aditya. Post-order: Anirudh, Vanessa, Circle, Natalia, Aditya, Erik, Anniyat. None is best to worst.') }),
    mc(2, '(b) Which tree traversal gives the reverse ordering of the leaderboard (worst to best)?', ['Pre-order', 'In-order', 'Post-order', 'Level order', 'None of the above'], 1, { ...S('1b'),
      ...note('In-order visits worse (left) before better (right): Anirudh, Circle, Vanessa, Anniyat, Erik, Natalia, Aditya.') }),
    text('(c) Consider a function that finds the leader of a (potentially unbalanced) leaderboard tree. Answer in terms of N, the total number of TAs in the tree.'),
    mc(3, '(c) Best case', RT, rt('Θ(1)'), S('1c')),
    mc(4, '(c) Worst case', RT, rt('Θ(N)'), { ...S('1c'),
      ...note('The leader is the rightmost node. If every node has only a left child, the root is the leader: Θ(1). If every node has only a right child, you walk all N nodes to the bottom: Θ(N).') }),
    text('Aditya now claims the same diagram is a min-heap (first place is towards the root). (d) Each TA assumes their placement was the best possible one that could have yielded this heap. What is the best possible placement for each TA below?'),
    mc(5, '(d) Circle', PLACES, 1, { ...S('1d'), ...note('Anniyat is above Circle, so Circle can’t be 1st, but can be 2nd.') }),
    mc(6, '(d) Anniyat', PLACES, 0, { ...S('1d'), ...note('Anniyat is at the top of the heap, so 1st is the only possible placement.') }),
    mc(7, '(d) Aditya', PLACES, 2, { ...S('1d'), ...note('Erik and Anniyat are above Aditya, so the best is 3rd (with Erik 2nd).') }),
    text('To avoid ambiguity, Aditya now shows the match results as a directed graph: each vertex is a TA, each edge is a match pointing from the winner to the loser, and two TAs can’t face each other twice.'),
    mc(8, '(e) If there are no cycles in this graph, then there is always an unambiguous first-place TA.', TF, 1, { ...S('1e'),
      ...note('A → C and B → C has no cycle, but nothing says whether A or B is first. Two separate components have the same problem.') }),
    mc(9, '(f) If there are as many edges as there are vertices in the graph, then each TA must have faced every other TA in a match exactly once.', TF, 1, { ...S('1f'),
      ...note('A → B → C → D → E → A has 5 vertices and 5 edges, but B and D never faced each other.') }),
  ]),
  problem('2', 'Disjoint Runtimes (18.0 pts)', null, [
    text('In each part, give the best- and worst-case runtime in Θ notation, with respect to N. For all Weighted Quick Union variants, connect tiebreaks by connecting the lower-indexed root underneath the higher-indexed root.'),
    java(`
public static void f1(int N, QuickUnion qu) {
    Random rand = new Random();
    for (int i = 0; i < N; i += 1) {
        qu.connect(rand.nextInt(N), rand.nextInt(N));
    }
    for (int i = 0; i < N; i += 1) {
        if (!qu.isConnected(rand.nextInt(N), rand.nextInt(N))) {
            System.out.println("Dylan");
        }
    }
}`),
    mc(10, '(a) f1 best case', RT, rt('Θ(N)'), S('2a')),
    mc(11, '(a) f1 worst case', RT, rt('Θ(N²)'), { ...S('2a'),
      ...note('Best: rand always returns 0, so every connect and isConnected is constant time. Worst: the connects build a spindly tree (4 under 3 under 2 under 1 under 0…), then every isConnected(4, 4) climbs Θ(N) links, N times.') }),
    text('(b) The same code, but with a WeightedQuickUnion (and printing "Gaston").'),
    mc(12, '(b) f2 best case', RT, rt('Θ(N)'), S('2b')),
    mc(13, '(b) f2 worst case', RT, rt('Θ(N log N)'), { ...S('2b'),
      ...note('A WQU’s height is at most Θ(log N), so each of the N isConnected calls takes Θ(log N).') }),
    text('(c) The same code, but with a WeightedQuickUnionPathCompression (and printing "Hamuy"). Its isConnected and connect each run in Θ(α(N)) amortized time.'),
    mc(14, '(c) f3 best case', RT, rt('Θ(N)'), S('2c')),
    mc(15, '(c) f3 worst case', RT, rt('Θ(N α(N))'), { ...S('2c'),
      ...note('Each of the N calls costs Θ(α(N)) amortized.') }),
  ]),
  problem('3', 'Unstable Matching Algorithm (32.0 pts)', null, [
    text('In preparation for Project 3, Anniyat devises a new partner-matching scheme using a StrangeHashSet<E>, which behaves as a HashSet except that: it starts with one bucket; it resizes when any bucket contains 3 or more elements (which can trigger several resizes in a single add); each resize doubles the number of buckets; and its method List<E>[] getBuckets() returns an array whose ith List holds the values in the ith bucket (in any order).',
      '(a) We create a new StrangeHashSet<Integer> and insert, in order, [5, 6, 1, 10, 13, 4]. The hashCode of an Integer is itself. What does getBuckets() return? Write each bucket as a list like [5, 4], or [] if it is empty.'),
    blank(16, 'Bucket 0', bucket(), S('3a')),
    blank(17, 'Bucket 1', bucket(1), S('3a')),
    blank(18, 'Bucket 2', bucket(10), S('3a')),
    blank(19, 'Bucket 3', bucket(), S('3a')),
    blank(20, 'Bucket 4', bucket(4), S('3a')),
    blank(21, 'Bucket 5', [...bucket(5, 13), ...bucket(13, 5)], S('3a')),
    blank(22, 'Bucket 6', bucket(6), S('3a')),
    blank(23, 'Bucket 7', bucket(), { ...S('3a'),
      ...note('5, 6, 1 fill the one bucket, so it doubles to [6] [5, 1]. 10 goes to bucket 0, then 13 makes [5, 1, 13], doubling to 4 buckets: [] [5, 1, 13] [6, 10] [], still 3 in bucket 1, so 8 buckets: [] [1] [10] [] [] [5, 13] [6] []. Finally 4 goes to bucket 4.') }),
    text('Each student submits a unique password, stored in a (regular) Set<String> passwords. Then this matchmaking algorithm runs:'),
    java(`
public class Matching {
    /** Pairs the students with passwords a and b. */
    private static void pair(String a, String b) { ... } // Implementation omitted.

    /** Pairs all students according to their passwords. With an odd number of students, pairs all but one
     *  and returns the unpaired student's password; otherwise pairs everyone and returns null. */
    public static String pairAllStudents(Set<String> passwords) {
        while (passwords.size() > 1) {
            // 1: Create a new StrangeHashSet.
            StrangeHashSet<String> matcher = new StrangeHashSet<>();

            // 2: Insert all passwords into the StrangeHashSet.
            for (String s : passwords) {
                matcher.add(s);
            }

            // 3: If any bucket contains exactly two passwords, pair the corresponding students.
            //    Then remove both passwords from passwords.
            for (List<String> bkt : matcher.getBuckets()) {
                if (bkt.size() == 2) {
                    pair(bkt.get(0), bkt.get(1));
                    passwords.remove(bkt.get(0));
                    passwords.remove(bkt.get(1));
                }
            }
        } // 4: Repeat Steps 1-3 until there are fewer than two students unpaired.

        // 5: If there's one student unpaired, return the password of that student.
        if (passwords.size() == 1) {
            return passwords.toArray()[0];
        }
        // 6: Otherwise return null.
        return null;
    }
}`),
    text('(b) We run pairAllStudents on these students: Alice’s password hashes to 5, Bob’s to 6, Cyrus’s to 1, Diana’s to 10, Eve’s to 13, and Fred’s to 4. What are the resulting pairs?'),
    mc(24, '(b) Alice is paired with', ['Bob', 'Cyrus', 'Diana', 'Eve', 'Fred'], 3, S('3b')),
    mc(25, '(b) Bob is paired with', ['Alice', 'Cyrus', 'Diana', 'Eve', 'Fred'], 2, S('3b')),
    mc(26, '(b) Cyrus is paired with', ['Alice', 'Bob', 'Diana', 'Eve', 'Fred'], 4, { ...S('3b'),
      ...note('Round 1 builds the table from (a): only bucket 5 has exactly two, so Alice (5) and Eve (13) pair. Round 2 with 6, 1, 10, 4 ends with buckets [4] [1] [6, 10] [], so Bob and Diana pair. Round 3 puts 1 and 4 in one bucket: Cyrus and Fred.') }),
    text('For the rest of the question, assume that all passwords have distinct hash codes, unless otherwise stated.'),
    sata(27, '(c) Which of the following statements are true? Select all that apply.', [
      'Assume that hash codes range from 0 to 2ᵇ − 1 for some integer b. When inserting all students into a single StrangeHashSet, at most b resizes occur.',
      'If a bucket contains three items immediately before a resize, it is possible for the items to end up in three different buckets after the resize.',
      'In each iteration of the while loop, at least one pair of students will be created.',
      'In each iteration of the while loop, at least half of the remaining students will be paired.',
      'If an iteration of the while loop requires k resizes when adding all students to the StrangeHashSet, then the next iteration of the while loop will require strictly fewer than k resizes.',
      'pairAllStudents is guaranteed to terminate.',
      'None of the above'], [0, 2, 4, 5], { ...S('3c'),
      ...note('After b resizes there are 2ᵇ buckets, one per possible hash code, so no bucket can hold 3. Doubling splits bucket k into buckets k and n + k only, so three items can’t reach three buckets. The last resize of a round always leaves a bucket of exactly two, so every round pairs someone, and removing that pair means the next round needs fewer resizes; together these guarantee termination. Part (b)’s first round paired only 2 of 6 students.') }),
    blank(28, '(d) Mia and Sebastian coordinate their passwords. Mia’s password hashes to 0. What should Sebastian’s hash be to maximize the chance he is paired with Mia? Hash codes range from 0 to 2³² − 1, and two students may not share a hash code.', ['2^31', '2**31', '2³¹', '2147483648', '1 << 31'], { ...S('3d'),
      ...note('To stay in bucket 0 with Mia however many buckets there are (2, 4, 8, …), Sebastian’s hash must be a multiple of every power of two that can occur. The largest power of two in range is 2³¹.') }),
    text('(e) For each modification of pairAllStudents below, which lists of password hashes make it loop forever? Each modification is independent. (The exam asked for one list of at most five hashes, or “Impossible”.)'),
    sata(29, '(e) 1. Instead of doubling the number of buckets on a resize, we triple it.', ['[0, 1, 2]', '[0, 3, 6]', '[1, 2, 3, 4, 5]', '[0, 1]', '[4, 8, 9]', 'None: it’s impossible'], [0, 1, 4], { ...S('3e'),
      ...note('A loop happens when each bucket ends up with one item, so nobody pairs. [0, 1, 2] and [4, 8, 9] split one per bucket after tripling; [0, 3, 6] does after two triplings. [1, 2, 3, 4, 5] leaves [1, 4] and [2, 5] to pair; any two items pair at once.') }),
    mc(30, '(e) 2. Two passwords may share a hash code, but no three passwords share the same hash code.', ['Some list loops forever', 'Impossible'], 1, { ...S('3e'),
      ...note('Two equal hashes always land together, so after enough resizes they sit in a bucket of exactly two and pair. Trying [0, 0] or [0, 0, 2] shows it terminates.') }),
    sata(31, '(e) 3. Exactly one hash code is shared by three passwords, and all other passwords have unique hash codes.', ['[0, 0, 0]', '[0, 0, 2]', '[12, 12, 12]', '[0, 1, 2]', 'None: it’s impossible'], [0, 2], { ...S('3e'),
      ...note('Three equal hashes stay in the same bucket however many times it doubles, so the first StrangeHashSet resizes forever. [0, 0, 2] has only two equal hashes, and [0, 1, 2] none.') }),
    sata(32, '(e) 4. The StrangeHashSet begins with two buckets instead of one.', ['[0, 1]', '[0, 2, 4, 1]', '[0]', '[0, 2]', 'None: it’s impossible'], [0, 1], { ...S('3e'),
      ...note('One even and one odd hash sit alone in buckets 0 and 1, so nobody pairs, ever. [0, 2, 4, 1] pairs 0 and 4, leaving [1, 2], the same situation. A single item skips the loop; [0, 2] pairs immediately.') }),
  ]),
  problem('4', 'Fix LLRB (23.0 pts)', null, [
    text('(a) Convert the 2-3 tree below into its corresponding Left-Leaning Red-Black Tree. (The exam had a fill-in table; this site asks about the result in three parts.)'),
    txt(`
          [10 20]
        /    |    \\
     [5]   [15]   [25 30]`),
    mc(33, '(a) Which value is at the root of the LLRB?', ['5', '10', '15', '20', '25', '30'], 3, S('4a')),
    sata(34, '(a) Which values are in red nodes (the link to their parent is red)?', ['5', '10', '15', '20', '25', '30'], [1, 4], S('4a')),
    mc(35, '(a) Which value is the root’s right child?', ['5', '10', '15', '25', '30', 'None'], 4, { ...S('4a'),
      ...note('[10 20] becomes 20 with red left child 10 (children 5 and 15); [25 30] becomes 30 with red left child 25.') }),
    text('(b) Write convert, a function that takes a 2-3 tree and converts it to its corresponding LLRB. In a 2-node, keys[1] and children[2] are null. In a 3-node, keys[0] and keys[1] are not null, and keys[0] < keys[1].'),
    java(`
public class TwoThreeTreeNode {
    public Integer[] keys;
    public TwoThreeTreeNode[] children;

    // Creates a 2-node
    public TwoThreeTreeNode(Integer key) {
        this.keys = new Integer[]{key, null};
        this.children = new TwoThreeTreeNode[]{null, null, null}; // Ordered from left to right
    }
}

public class LLRB {
    public LLRBNode root;

    public class LLRBNode {
        public int key;
        public LLRBNode left, right;
        public boolean isRed;

        public LLRBNode(int key, boolean isRed) {
            this.key = key;
            this.isRed = isRed;
        }
    }

    public LLRB(TwoThreeTreeNode node) {
        root = convert(node);
    }

    private LLRBNode convert(TwoThreeTreeNode root) {
        if (root == null) {
            return null;
        }
        if (⟪a⟫) {
            LLRBNode node = ⟪b⟫;
            ⟪c⟫;
            ⟪d⟫;
            return node;
        }
        LLRBNode leftChild = ⟪e⟫;
        LLRBNode parent = ⟪f⟫;
        parent.left = leftChild;
        ⟪g⟫;
        ⟪h⟫;
        ⟪i⟫;
        return parent;
    }
}`, { a: 'root.keys[1] == null', b: 'new LLRBNode(root.keys[0], false)', c: 'node.left = convert(root.children[0])', d: 'node.right = convert(root.children[1])', e: 'new LLRBNode(root.keys[0], true)', f: 'new LLRBNode(root.keys[1], false)', g: 'leftChild.left = convert(root.children[0])', h: 'leftChild.right = convert(root.children[1])', i: 'parent.right = convert(root.children[2])' }),
    blank(36, '(b) if (____) — a 2-node', ['root.keys[1] == null', 'root.children[2] == null', 'root.keys[1] == null && root.children[2] == null', 'root.keys[1] == null || root.children[2] == null', 'root.keys[0] != null && root.keys[1] == null'], S('4b')),
    blank(37, '(b) LLRBNode node = ____', 'new LLRBNode(root.keys[0], false)', S('4b')),
    blank(38, '(b) First line after it (either child; the two lines can go in either order)', ['node.left = convert(root.children[0])', 'node.right = convert(root.children[1])'], S('4b')),
    blank(39, '(b) Second line', ['node.right = convert(root.children[1])', 'node.left = convert(root.children[0])'], S('4b')),
    blank(40, '(b) LLRBNode leftChild = ____', 'new LLRBNode(root.keys[0], true)', S('4b')),
    blank(41, '(b) LLRBNode parent = ____', 'new LLRBNode(root.keys[1], false)', S('4b')),
    ...[42, 43, 44].map((id, k) => blank(id, `(b) ${['First', 'Second', 'Third'][k]} of the last three lines (in any order)`, ['leftChild.left = convert(root.children[0])', 'leftChild.right = convert(root.children[1])', 'parent.right = convert(root.children[2])', 'parent.left.left = convert(root.children[0])', 'parent.left.right = convert(root.children[1])'], { ...S('4b'),
      ...(k == 2 ? note('A 2-node becomes one black node. A 3-node becomes a black parent (the larger key) with a red left child (the smaller key): the three subtrees go, in order, to the red child’s left and right and the parent’s right. leftChild.left and parent.left.left are the same.') : {}) })),
  ]),
  problem('5', 'Yokeyrin’s Cave (12.0 pts)', null, [
    text('Anirudh the Adventurer is in a cave with 100 rooms, numbered 1 to 100. He starts in Room 1 and must reach Room 100 as fast as possible. From each room he can move to any adjacent room in one minute.',
      'Fill out shortestTime. Input: Map<Integer, Set<Integer>> adj, which maps each room (1–100) to the set of all adjacent rooms. Output: the minimum number of minutes needed to go from Room 1 to Room 100, or −1 if it is impossible.'),
    java(`
public class Queue<T> {
    /** Creates a new queue */
    public Queue() { ... }
    /** Adds item to the back of the queue */
    public void add(T item) { ... }
    /** Removes and returns the front item of the queue */
    public T remove() { ... }
    /** Returns true if the queue has no elements */
    public boolean isEmpty() { ... }
}

public class CaveStory {
    private static class State {
        public int room;
        public int mins;

        public State(int room, int mins) {
            this.room = room;
            this.mins = mins;
        }
    }

    public static int shortestTime(Map<Integer, Set<Integer>> adj) {
        Set<Integer> traversed = new HashSet<>();
        Queue<State> options = new Queue<>();
        options.add(new State(1, 0));

        while (!options.isEmpty()) {
            State curr = options.remove();
            if (⟪a⟫) {
                ⟪b⟫;
            }
            if (⟪c⟫) {
                ⟪d⟫;
                for (⟪e⟫) {
                    ⟪f⟫;
                }
            }
        }
        return -1; // No path exists
    }
}`, { a: 'curr.room == 100', b: 'return curr.mins', c: '!traversed.contains(curr.room)', d: 'traversed.add(curr.room)', e: 'int neighbor : adj.get(curr.room)', f: 'options.add(new State(neighbor, curr.mins + 1))' }),
    blank(45, '(a) if (____)', ['curr.room == 100', '100 == curr.room', 'adj.get(curr.room).contains(100)'], S('5')),
    blank(46, '(b) Inside it', ['return curr.mins', 'return curr.mins + 1'], { ...S('5'),
      ...note('return curr.mins + 1 goes with the alternative check adj.get(curr.room).contains(100).') }),
    blank(47, '(c) if (____)', ['!traversed.contains(curr.room)', '!traversed.contains(curr.room) && !adj.get(curr.room).isEmpty()', '!traversed.contains(curr.room) && adj.containsKey(curr.room)'], S('5')),
    blank(48, '(d) First line inside it', 'traversed.add(curr.room)', S('5')),
    blank(49, '(e) The for loop’s header', ['int neighbor : adj.get(curr.room)', 'Integer neighbor : adj.get(curr.room)'], S('5')),
    blank(50, '(f) Inside the for loop', 'options.add(new State(neighbor, curr.mins + 1))', { ...S('5'),
      ...note('This is breadth-first search: the queue hands out rooms in order of distance, so the first time Room 100 comes out, curr.mins is the shortest time. Skip rooms already traversed. (You may name the loop variable anything, as long as (f) matches.)') }),
  ]),
]);
