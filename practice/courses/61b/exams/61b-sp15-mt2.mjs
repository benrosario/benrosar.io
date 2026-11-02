// Spring 2015 Midterm 2, transcribed from the official solutions.
// The course’s topic index has no entries for this exam, so its topic tags are this site’s.
// Changed for this site, and said so on the page: drawn answers are fill-in or multiple choice; the short-answer and
// design questions (2c, 4a, 6, 7, 10) are multiple choice, with the staff’s reasoning in the answer notes.
// Left out: Q9 (0 points).
import { exam, problem, text, java, txt, blank, mc, sata } from '../../../content/author.mjs';
import { site } from '../staff.mjs';

const E = '61b-sp15-mt2';
const note = (x, o = {}) => ({ x, ...o });
const RT = ['Θ(1)', 'Θ(log n)', 'Θ(n)', 'Θ(n log n)', 'Θ(n²)', 'Θ(2ⁿ)', 'Θ(nᵐ)', 'Θ(mⁿ)'];
const rt = s => RT.indexOf(s);
const list = s => [s, s.replace(/,/g, '')];

export default exam(E, 'Spring 2015 Midterm 2', {
  exam: 'https://drive.google.com/file/d/1uE1QlF4YguWVp8m8UJ97R2xPC4b1NnQ5/view',
  sol: 'https://drive.google.com/file/d/1IYt4VbzdX4dTekh6cYAC8tigpJ_LgljV/view',
}, 'sp15-mt2', [
  problem('1', 'Basic Operations (6 pts)', null, [
    text('(a) Delete 20 from this BST using the deletion procedure from class (no more than 4 references change). Trees are written value(left, right).'),
    txt('20( 15(-, 17(16, 19(18, -))), 29( 25(23(-, 24), 28), 35(33, -) ) )'),
    mc(1, '(a) Which tree can result?', ['19( 15(-, 17(16, 18)), 29( 25(23(-, 24), 28), 35(33, -) ) )', '23( 15(-, 17(16, 19(18, -))), 29( 25(24, 28), 35(33, -) ) )', '15( -, 17(16, 19(18, 29(25(23(-, 24), 28), 35(33, -)))) )', '29( 15(-, 17(16, 19(18, -))), 35( 25(23(-, 24), 28), 33 ) )'], 0, { ...site('BSTS'), also: [1],
      ...note('The predecessor 19 or the successor 23 replaces 20; both trees are correct.') }),
    text('(b) Delete the smallest item from the min-heap [0, 1, 4, 8, 2, 6, 8, 9] (written as its array, without an unused first spot).'),
    blank(2, '(b) The resulting array, separated by commas', list('1, 2, 4, 8, 9, 6, 8'), { ...site('HEAPS'), ...note('9 moves to the root and sinks below 1, then below 2.') }),
    text('(c) An external-chaining hash set of Integers (hashCode is the integer itself) has 4 buckets: 0 → 8, 1 → 25, 2 → 10, 18, 3 → 15. We insert 5, which also resizes it from 4 buckets to 8.'),
    blank(3, '(c) Which bucket holds 25 afterwards?', '1', site('HASHING')),
    blank(4, '(c) Which bucket holds 15?', '7', site('HASHING')),
    blank(5, '(c) Which bucket holds 5?', '5', site('HASHING')),
    blank(6, '(c) Which bucket holds 10 and 18?', '2', { ...site('HASHING'), ...note('Each item goes to its value mod 8: 8 → 0, 25 → 1, 10 and 18 → 2, 5 → 5, 15 → 7.') }),
    mc(7, '(d) Which is a valid Weighted Quick Union after connect(1, 4), connect(2, 3), connect(1, 3), connect(5, 1)? (Any reasonable argument-order convention was accepted; trees are written root(children).)', ['3( 2, 4(1), 5 )', '3( 2, 4(1(5)) )', '1( 4, 3(2), 5 )', '5( 1(4, 3(2)) )'], 0, { ...site('DISJOINT_SETS'), also: [2],
      ...note('Only roots are ever connected, and connecting 5 to the size-4 tree puts 5 directly under that tree’s root.') }),
  ]),
  problem('2', 'Asymptotics (5 pts)', null, [
    text('(a) Timing experiments on PotatoSack.add, with N inserts:'),
    txt(`
N     Time (s)
1     0.00
2     0.01
3     0.01
6     0.03
13    0.16
25    0.63
50    2.50
100   9.97`),
    text('Approximate the runtime as aNᵇ using the data points that best show its asymptotic behavior.'),
    blank(8, '(a) b', '2', site('ASYMPTOTICS')),
    blank(9, '(a) a', ['0.001', '.001', '1/1000'], { ...site('ASYMPTOTICS'), ...note('log₂(9.97 / 2.5) ≈ 2, and 9.97 = a · 100² gives a ≈ 0.001.') }),
    sata(10, '(b) Inserting N items into some collection takes Θ(N²). For which collections is that possible on a worst-case input (each correctly implemented)?', ['LinkedList', '2-3 Tree Set', 'HeapMinPQ', 'LLRBST Set', 'Your BSTMap (from HW6)', 'External Chaining Hash Map', 'ArrayList'], [0, 4, 5, 6], { ...site('ASYMPTOTICS', 'ADTS'),
      ...note('Balanced trees and heaps insert in O(log N). A list, an unbalanced BST and a hash map with all items colliding can each take linear time per insert.') }),
    mc(11, '(c) Two correct algorithms for the same problem use the same memory, with worst-case runtimes Θ(N) and Θ(N²). Is the Θ(N) one always better?', ['No: for small N the Θ(N²) one can be faster, and the worst case may only occur on inputs we don’t care about', 'Yes: it is faster on every input', 'Yes: worst-case runtime is all that matters', 'No: Θ(N²) is always faster for large N'], 0, site('ASYMPTOTICS')),
  ]),
  problem('3', 'Exceptions (2 pts)', null, [
    text('writeToLog writes its argument to a log file. What does the log contain after this code runs?'),
    java(`
public class QuestionThree {
    public static void printTenth(int[] a) {
        try {
            writeToLog(a[10]);
        } catch(IndexOutOfBoundsException e) {
            writeToLog("No tenth item available!");
            throw(e);
        }
    }

    public static void main(String[] args) {
        printTenth(new int[]{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10});
        printTenth(new int[]{0, 1, 2, 3});
        printTenth(new int[]{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10});
    }
}`),
    blank(12, 'The log’s contents, one entry per line', '10\nNo tenth item available!', { ...site('JAVA'),
      ...note('The second call logs the message and rethrows; nothing catches it, so the program stops before the third call.') }),
  ]),
  problem('4', 'TreeTime (5 pts)', null, [
    mc(13, '(a) True or false: if A and B are 2-3-4 trees with exactly the same elements, they must be identical.', ['True', 'False'], 1, { ...site('B_TREES'),
      ...note('Inserting 1, 2, 3, 4, 5 pushes up 2; inserting 2, 3, 4, 5, 1 pushes up 3. Different trees.') }),
    text('(b) Insert 25 into this red-black tree (a * marks a node whose link to its parent is red):'),
    txt('20( *10(5, 17(*12, -)), 40(*30, -) )'),
    mc(14, '(b) Which tree results?', ['20( 10(5, 17(*12, -)), 30(25, 40) )', '20( *10(5, 17(*12, -)), 30(25, *40) )', '25( *10(5, 17(*12, 20)), 40(*30, -) )', '20( *10(5, 17(*12, -)), 40(30(*25, -), -) )'], 0, { ...site('RED_BLACK_TREES'),
      ...note('As a 2-3 tree it is [10 20] with children [5], [12 17], [30 40]. Inserting 25 splits [25 30 40] and pushes 30 up, which splits [10 20 30] and pushes 20 up: a new root.') }),
    text('(c) sumDescendants replaces each node’s value with the sum of all its descendants’ values (not including itself), and returns its original value plus all its descendants’ values. For the tree 6(4(3, 5), 8(7, 9)), calling it on 6 returns 42 and changes the tree to 36(8(0, 0), 16(0, 0)).'),
    java(`
public class TreeNode {
    public TreeNode left, right;
    public int value;

    public TreeNode(int n) {
        value = n;
    }

    /* Replaces value with sum of all of its descendants' values. */
    public int sumDescendants() {
        if (⟪a⟫) {
            int oldVal = value;
            ⟪b⟫;
            return oldVal;
        } else {
            int leftSum = 0; int rightSum = 0;
            if (left != null) {
                ⟪c⟫;
            }
            if (right != null) {
                ⟪d⟫;
            }
            int oldVal = value;
            ⟪e⟫;
            return ⟪f⟫;
        }
    }
}`, { a: 'left == null && right == null', b: 'value = 0', c: 'leftSum = left.sumDescendants()', d: 'rightSum = right.sumDescendants()', e: 'value = leftSum + rightSum', f: 'oldVal + value' }),
    blank(15, '(c) if (____) — a leaf', ['left == null && right == null', 'right == null && left == null'], site('RECURSION')),
    blank(16, '(c) In the leaf case', 'value = 0', site('RECURSION')),
    blank(17, '(c) If there is a left child', 'leftSum = left.sumDescendants()', site('RECURSION')),
    blank(18, '(c) If there is a right child', 'rightSum = right.sumDescendants()', site('RECURSION')),
    blank(19, '(c) After saving oldVal', ['value = leftSum + rightSum', 'value = rightSum + leftSum'], site('RECURSION')),
    blank(20, '(c) return ____', ['oldVal + value', 'value + oldVal', 'oldVal + leftSum + rightSum'], { ...site('RECURSION'),
      ...note('Each child returns the full sum of its subtree; the node’s new value is the two children’s sums, and it returns that plus its old value.') }),
  ]),
  problem('5', 'Code Analysis (2.5 pts)', null, [
    text('Give the runtime of each function in Θ notation as a function of its parameters.'),
    java(`
public static void f1(int n) {
    for (int i = 0; i < 2*n; i += 1) {
        System.out.println("hello");
    }
}

public static void f2(int n) {
    if (n == 0) { return; }
    f2(n/2);
    f1(n);
    f2(n/2);
}

public static void f3(int n) {
    if (n == 0) { return; }
    f3(n/3);
    f1(n);
    f3(n/3);
    f1(n);
    f3(n/3);
}

public static void f4(int n) {
    if (n == 0) { return; }
    f4(n-1);
    f1(17);
    f4(n-1);
}

public static void f5(int n, int m) {
    if (m <= 0) {
        return;
    } else {
        for (int i = 0; i < n; i += 1) {
            f5(n, m-1);
        }
    }
}`),
    mc(21, 'f1', RT, rt('Θ(n)'), site('ASYMPTOTICS')),
    mc(22, 'f2', RT, rt('Θ(n log n)'), { ...site('ASYMPTOTICS', 'RECURSION'), ...note('The same pattern as mergesort.') }),
    mc(23, 'f3', RT, rt('Θ(n log n)'), { ...site('ASYMPTOTICS', 'RECURSION'), ...note('Like mergesort with 3 subproblems of size n/3.') }),
    mc(24, 'f4', RT, rt('Θ(2ⁿ)'), site('ASYMPTOTICS', 'RECURSION')),
    mc(25, 'f5', RT, rt('Θ(nᵐ)'), site('ASYMPTOTICS', 'RECURSION')),
  ]),
  problem('6', 'The Right Tool for the Job (6 pts)', null, [
    text('For each task, pick the data structure best suited to it (TreeMap and TreeSet use red-black trees; HashMap and HashSet use external chaining). (The exam asked for one or two structures, a short description and an O bound.)'),
    mc(26, 'Task 1) Read a text file and print all the unique words in alphabetical order. (N words.)', ['A TreeSet: add every word, then iterate in order. O(N log N).', 'A HashMap from hashCode to word. O(N).', 'An ArrayList, checking each word against the rest. O(N²).', 'A HeapMinPQ of words. O(N).'], 0, { ...site('BSTS', 'ADTS'),
      ...note('A HashSet plus sorting also works but is clumsier; a map from hash code to word wouldn’t detect duplicates.') }),
    mc(27, 'Task 2) Given ArrayList<String> observed (size N_O) of very long Strings (tens of thousands of characters), check each against an already-built collection known (size N_K) of highly dissimilar Strings. Which structure for known performs best in practice?', ['TreeSet: O(N_O log N_K), and comparisons stop after a few characters', 'HashSet: O(N_O), the fastest in practice', 'ArrayList: O(N_O · N_K)', 'HeapMinPQ: O(N_O log N_K)'], 0, { ...site('HASHING', 'BSTS'),
      ...note('A HashSet is O(N_O) asymptotically, but hashing a string reads all of its tens of thousands of characters; dissimilar strings compare after a few characters.') }),
    mc(28, 'Task 3) Read many 512 × 512 grayscale images (Picture objects holding an int[][]) and display the unique ones, in any order. (N images.)', ['A HashSet of Pictures: O(N)', 'A TreeMap from hashCode to Picture: O(N log N)', 'An ArrayList, comparing each new image to all earlier ones: O(N)', 'A HeapMaxPQ of Pictures: O(N log N)'], 0, { ...site('HASHING'),
      ...note('A TreeSet also works (O(N log N)) but needs Picture to be Comparable. Keying by hash code alone treats colliding images as duplicates.') }),
    mc(29, 'Task 4) Store the email address for each username on a website anyone can register on, many times over. Usernames and emails are Strings with the default hashCode and compareTo. (N users.)', ['A TreeMap: O(log N) per user, and attackers can’t force collisions', 'A HashMap: O(1) per user even under attack', 'An ArrayList of pairs: O(1) per user', 'A HeapMinPQ: O(log N) per user'], 0, { ...site('HASHING', 'BSTS'),
      ...note('String’s hashCode is well known, so attackers could register many usernames with the same hash and make a HashMap O(N) per operation.') }),
    mc(30, 'Task 5) A social network capped at K users supports Neu (create a user), Befreunden (make two users friends) and Erweiterten Netzwerk (are two users connected by a chain of friendships?), each in O(log N) worst case. Which structures?', ['A WeightedQuickUnion plus a HashMap from username to id', 'A HashMap from username to a list of friends, searched with DFS', 'A TreeSet of usernames', 'A HeapMinPQ of friendships'], 0, { ...site('DISJOINT_SETS', 'HASHING'),
      ...note('Neu: O(1) to add to the map. Befreunden and Erweiterten Netzwerk: O(1) lookups plus an O(log N) connect or isConnected.') }),
  ]),
  problem('7', 'GorpyCorp (2 pts)', null, [
    java(`
public class Circle {
    HashSet<Member> members;
    String teamName;

    public int hashCode() {
        int hashCode = 0;
        for (Member m : members) {
            hashCode = hashCode * 31 + m.hashCode();
        }
        hashCode = hashCode + teamName.hashCode();
        return hashCode;
    }

    public int compareTo(Circle other) {
        if (this.members.size() == other.members.size())
            return this.teamName.compareTo(other.teamName);
        return this.members.size() - other.members.size();
    }

    public void addMember(Member newMember) {
        members.add(newMember);
    }
    ...
}`),
    text('Gorpy stores each Circle’s leader in a separate HashMap<Circle, Member> leadLinks.'),
    mc(31, 'What is the most significant problem, and does using a TreeMap fix it?', ['Circles are mutable: after addMember, a Circle’s hash code changes and leadLinks.get can’t find it. A TreeMap doesn’t fix it: Circle isn’t Comparable, and even if it were, a Circle that changed size would be in the wrong place in the tree.', 'Circle doesn’t override equals, so equal Circles can coexist; a TreeMap fixes it by using compareTo.', 'The hashCode causes too many collisions; a TreeMap fixes it because it stays balanced.', 'There is no problem with this design.'], 0, { ...site('HASHING', 'EQUALS'),
      ...note('The other two choices got some partial credit on the exam, but mutability is the most significant problem.') }),
  ]),
  problem('8', 'By the Numbers (3.5 pts)', null, [
    text('Give the minimum and maximum for each. Height is the number of links from the root to the farthest leaf (a lone root has height 0).'),
    blank(32, 'The minimum height of a BST with 15 nodes', '3', site('BSTS')),
    blank(33, '…the maximum', '14', site('BSTS')),
    blank(34, 'The minimum height of a Quick Union object with 15 elements, all connected', '1', site('DISJOINT_SETS')),
    blank(35, '…the maximum', '14', site('DISJOINT_SETS')),
    blank(36, 'The minimum height of a Weighted Quick Union object with 15 elements, all connected', '1', site('DISJOINT_SETS')),
    blank(37, '…the maximum', '3', site('DISJOINT_SETS')),
    blank(38, 'The minimum height of a 2-3-4 tree with 15 items', '1', site('B_TREES')),
    blank(39, '…the maximum', '3', site('B_TREES')),
    blank(40, 'The minimum height of an LLRB set with 15 items', '3', site('RED_BLACK_TREES')),
    blank(41, '…the maximum', '5', { ...site('RED_BLACK_TREES'), ...note('Pack as many 3-nodes as possible down the left of the corresponding 2-3 tree; each adds a level.') }),
    blank(42, 'The minimum height of a binary heap with 15 items', '3', site('HEAPS')),
    blank(43, '…the maximum', '3', site('HEAPS')),
    blank(44, 'The minimum number of items in a single bucket of a chaining hash table with 30 items and 15 buckets', '0', site('HASHING')),
    blank(45, '…the maximum', '30', site('HASHING')),
  ]),
  problem('10', 'Quartiler (2.5 pts)', null, [
    text('(Staff called this problem particularly challenging.) Design a Quartiler with add(x), getTopQuartile() (the item closest to the 75th percentile; e.g. after adding 1 to 100 it returns 75, after adding 1 to 4 it returns 3) and deleteTopQuartile(), each in amortized O(log N) time and O(N) space.'),
    mc(46, '(a) Which design works?', [
      'A max-heap of the values below the top quartile, a min-heap of the values above it, and a variable holding the top quartile itself; rebalance so the lower heap stays about 3 times the size of the upper one.',
      'A red-black tree, searching it for the top quartile on each call.',
      'A sorted ArrayList, reading index 3N/4.',
      'A single min-heap, removing items until 3N/4 have been removed.'], 0, { ...site('HEAPS'),
      ...note('A balanced BST that tracks subtree sizes and selects rank 3N/4 also works. A plain red-black tree search is Θ(N); a sorted list makes add linear.') }),
    blank(47, '(b) With the two-heap design, after adding 5, 1, 3, 2, 4, 6, 7, 8 in that order, what is the top quartile value?', ['6', '7'], { ...site('HEAPS'),
      ...note('The lower heap holds 1–5 and the upper heap 7, 8. Under a more standard definition of quartile, 7 is also acceptable.') }),
  ]),
]);
