// Fall 2022 Midterm 1, transcribed from the official solutions. (This exam’s points total 2400.)
// Changed for this site, and said so on the page: the box-and-pointer diagram (1a) is asked as questions about the
// final state; free-form code has one blank per line of the staff solution. Left out: Q0 and 2(b) (0 points).
import { exam, problem, text, java, txt, blank, mc } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-fa22-mt1', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });
const PEOPLE = ['Ethan', 'Vidya', 'Nandini', 'Jedi', 'Allen', 'Kyle'];

export default exam(E, 'Fall 2022 Midterm 1', {
  exam: 'https://drive.google.com/file/d/1Y7iOyo4pFS2x-2BLNtLShtZSgrk13aKl/view',
  sol: 'https://drive.google.com/file/d/1nxtpZZLtNfS3kYlUn2e8FukQipq140CU/view',
}, 'fa22-mt1', [
  problem('1', 'Residents & Friends (359 pts)', null, [
    java(`
public class Resident {
    public String name;
    private Resident[] friends;
    public static int changes = 0;

    public Resident(String n) {
        this.name = n;
        this.friends = null;
    }
    public Resident(String n, Resident[] friends) {
        this.name = n;
        this.friends = friends;
    }

    public void takeFriendsAndRenameOne(Resident a, String s) {
        this.friends = a.friends;
        this.friends[0].name = s;
        Resident.changes = Resident.changes + 1;
    }
    public static void main(String[] args) {
        Resident claire;
        Resident ethan = new Resident("Ethan");
        Resident vidya = new Resident("Vidya");
        Resident nandini = new Resident("Nandini");
        Resident[] friends = {vidya, ethan, nandini};
        vidya.takeFriendsAndRenameOne(new Resident("Jedi", friends), "Allen");
        Resident.takeFriendsAndRenameOne(nandini, "Kyle");
        vidya.friends[0] = nandini;
    }
}`),
    text('(a) If a line errors, the program continues as if it hadn’t run. (On the exam you drew the final box-and-pointer diagram.)'),
    mc(1, '(a) Which line of main errors?', ['Resident claire;', 'Resident[] friends = {vidya, ethan, nandini};', 'vidya.takeFriendsAndRenameOne(new Resident("Jedi", friends), "Allen");', 'Resident.takeFriendsAndRenameOne(nandini, "Kyle");', 'vidya.friends[0] = nandini;', 'None'], 3, { ...S('1a'), ...note('takeFriendsAndRenameOne isn’t static, so it can’t be called on the class.') }),
    mc(2, '(a) At the end, what is vidya.name?', PEOPLE, 4, { ...S('1a'), ...note('vidya takes Jedi’s friends array, whose element 0 is vidya herself, and renames it "Allen".') }),
    blank(3, '(a) At the end, what is Resident.changes?', '1', S('1a')),
    mc(4, '(a) At the end, vidya.friends is the same array as the local variable friends. What does it hold, in order?', ['nandini, ethan, nandini', 'vidya, ethan, nandini', 'Allen (vidya), ethan, Kyle', 'nandini, Jedi, nandini'], 0, { ...S('1a'), ...note('The last line sets element 0 of that shared array to nandini.') }),
    mc(5, '(b) Instead of in Resident.java, main is run from a new file CS61B.java. Which line that ran successfully before will now error?', ['Resident claire;', 'Resident[] friends = new Resident[]{vidya, ethan, nandini};', 'vidya.takeFriendsAndRenameOne(new Resident("Jedi", friends), "Allen");', 'vidya.friends[0] = nandini;', 'None of the above'], 3, { ...S('1b'), ...note('friends is private, so another class can’t access it.') }),
  ]),
  problem('2', 'IntList Of (300 pts)', null, [
    text('A vararg (int... items) lets a method take any number of values, or an array. Write IntList.of, which returns an IntList of the given values: IntList.of(1, 2, 3, 4) is 1, then 2, then 3, then 4. IntList has int first, IntList rest and a constructor IntList(int f, IntList r).'),
    java(`
public static IntList of(int... x) {
    IntList L = ⟪a⟫;
    for (int i = ⟪b⟫; ⟪c⟫; ⟪d⟫) {
        ⟪e⟫;
    }
    return ⟪f⟫;
}`, { a: 'null', b: 'x.length - 1', c: 'i >= 0', d: 'i--', e: 'L = new IntList(x[i], L)', f: 'L' }),
    blank(6, '(a) IntList L = ____', 'null', S('2a')),
    blank(7, '(a) i starts at', 'x.length - 1', S('2a')),
    blank(8, '(a) Loop condition', ['i >= 0', 'i > -1'], S('2a')),
    blank(9, '(a) Loop update', ['i--', 'i -= 1', 'i = i - 1'], S('2a')),
    blank(10, '(a) Loop body', 'L = new IntList(x[i], L)', S('2a')),
    blank(11, '(a) return ____', 'L', { ...S('2a'), ...note('Build from the back, putting each value in front of the list so far.') }),
  ]),
  problem('3', 'IntList replaceValue (300 pts)', null, [
    text('replaceValue returns a copy of L with the value at position pos replaced by x: for 10, 11, 12, 13, 14, replaceValue(L, 100, 2) returns 10, 11, 100, 13, 14. It must not modify L, and the new list may not share any nodes with it. For an invalid pos (e.g. −1 or past the end) it returns an unchanged copy.'),
    java(`
public static IntList replaceValue(IntList L, int x, int pos) {
    if (⟪a⟫) {
        return ⟪b⟫;
    }
    if (⟪c⟫) {
        return ⟪d⟫;
    }
    return ⟪e⟫;
}`, { a: 'L == null', b: 'null', c: 'pos == 0', d: 'new IntList(x, replaceValue(L.rest, x, pos - 1))', e: 'new IntList(L.first, replaceValue(L.rest, x, pos - 1))' }),
    blank(12, 'if (____)', 'L == null', S('3')),
    blank(13, 'return ____', 'null', S('3')),
    blank(14, 'if (____)', 'pos == 0', S('3')),
    blank(15, 'return ____ (replace here)', 'new IntList(x, replaceValue(L.rest, x, pos - 1))', S('3')),
    blank(16, 'return ____ (copy this node)', 'new IntList(L.first, replaceValue(L.rest, x, pos - 1))', { ...S('3'), ...note('Keep copying past the replaced position too, so no node is shared. A negative pos simply never hits 0.') }),
  ]),
  problem('4', 'JUnit (300 pts)', null, [
    text('Write tests showing evidence that replaceValue works: Test One checks the input isn’t modified and only the chosen value changes; Test Two checks the returned list shares no nodes with the original. assertEquals and assertNotEquals compare IntList contents; you may use IntList.of.'),
    java(`
@Test
public void testOne() {
    IntList L = IntList.of(1, 2);
    ⟪a⟫;
    ⟪b⟫;
    ⟪c⟫;
}

@Test
public void testTwo() {
    IntList L = IntList.of(1, 2);
    ⟪d⟫;
    ⟪e⟫;
    ⟪f⟫;
}`, { a: 'IntList w = IntList.replaceValue(L, 100, 1)', b: 'assertEquals(IntList.of(1, 2), L)', c: 'assertEquals(IntList.of(1, 100), w)', d: 'IntList W = IntList.replaceValue(L, 100, -1)', e: 'assertTrue(L != W)', f: 'assertTrue(L.rest != W.rest)' }),
    blank(17, 'testOne, line 1', 'IntList w = IntList.replaceValue(L, 100, 1)', S('4')),
    blank(18, 'testOne, line 2', 'assertEquals(IntList.of(1, 2), L)', S('4')),
    blank(19, 'testOne, line 3', 'assertEquals(IntList.of(1, 100), w)', S('4')),
    blank(20, 'testTwo, line 1', 'IntList W = IntList.replaceValue(L, 100, -1)', S('4')),
    blank(21, 'testTwo, line 2', ['assertTrue(L != W)', 'assertFalse(L == W)'], S('4')),
    blank(22, 'testTwo, line 3', ['assertTrue(L.rest != W.rest)', 'assertFalse(L.rest == W.rest)'], { ...S('4'), ...note('Both node comparisons were needed for full credit; assertEquals compares contents, so it can’t show the nodes are new.') }),
  ]),
  problem('5', 'Norinori (720 pts)', null, [
    text('Norinori is played on a grid divided into regions: shade dominoes (two adjacent cells) so that no two dominoes touch except at corners and every region has exactly two shaded cells. int[][] areas gives each cell’s region, and boolean[][] shaded a proposed solution. Both are rectangular with the same dimensions.',
      '(a) countAdjacentShaded returns how many cells orthogonally adjacent (up, left, down, right) to cell [i][j] are shaded; i and j are valid.'),
    java(`
int countAdjacentShaded(boolean[][] shaded, int i, int j) {
    int result = 0;
    if (⟪a⟫) {
        result++;
    }
    if (⟪b⟫) {
        result++;
    }
    if (⟪c⟫) {
        result++;
    }
    if (⟪d⟫) {
        result++;
    }
    return result;
}`, { a: 'i != 0 && shaded[i - 1][j]', b: 'j != 0 && shaded[i][j - 1]', c: 'i != shaded.length - 1 && shaded[i + 1][j]', d: 'j != shaded[0].length - 1 && shaded[i][j + 1]' }),
    blank(23, '(a) Up', ['i != 0 && shaded[i - 1][j]', 'i > 0 && shaded[i - 1][j]'], S('5a')),
    blank(24, '(a) Left', ['j != 0 && shaded[i][j - 1]', 'j > 0 && shaded[i][j - 1]'], S('5a')),
    blank(25, '(a) Down', ['i != shaded.length - 1 && shaded[i + 1][j]', 'i < shaded.length - 1 && shaded[i + 1][j]', 'i + 1 < shaded.length && shaded[i + 1][j]'], S('5a')),
    blank(26, '(a) Right', ['j != shaded[0].length - 1 && shaded[i][j + 1]', 'j < shaded[0].length - 1 && shaded[i][j + 1]', 'j + 1 < shaded[i].length && shaded[i][j + 1]'], { ...S('5a'), ...note('Check bounds first; && stops before an out-of-range index.') }),
    text('(b) validNorinoriSolution returns whether shaded solves the puzzle with numAreas regions. Hint: shaded cells all form dominoes that touch only at corners exactly when every shaded cell has exactly one shaded orthogonal neighbor.'),
    java(`
boolean validNorinoriSolution(int[][] areas, boolean[][] shaded, int numAreas) {
    int[] areaCounts = ⟪e⟫;
    for (int i = 0; i < areas.length; i++) {
        for (int j = 0; j < areas[i].length; j++) {
            if (shaded[i][j]) {
                if (⟪f⟫) {
                    return false;
                }
                ⟪g⟫;
            }
        }
    }
    for (int c : areaCounts) {
        if (⟪h⟫) {
            return false;
        }
    }
    return true;
}`, { e: 'new int[numAreas]', f: 'countAdjacentShaded(shaded, i, j) != 1', g: 'areaCounts[areas[i][j]] += 1', h: 'c != 2' }),
    blank(27, '(b) int[] areaCounts = ____', 'new int[numAreas]', S('5b')),
    blank(28, '(b) if (____) return false', 'countAdjacentShaded(shaded, i, j) != 1', S('5b')),
    blank(29, '(b) Then count it', ['areaCounts[areas[i][j]] += 1', 'areaCounts[areas[i][j]]++'], S('5b')),
    blank(30, '(b) if (____) return false', 'c != 2', S('5b')),
  ]),
  problem('6', 'Ooh baby a triple!! (420 pts)', null, [
    text('A “triply” linked list (TLList) is a circular doubly linked list (left and right pointers) with one sentinel, where each TripleNode also has a next pointer to some other node. Let “alpha” be the node right of the sentinel. promoteNewAlphaDestroyOldAlpha removes alpha and moves alpha’s next node to the leftmost position (just right of the sentinel). No next pointers change.'),
    txt(`
Before:  sentinel ⇄ 5 ⇄ 8 ⇄ 9 ⇄ 3 ⇄ 4 ⇄ (sentinel)      5.next is 3
After:   sentinel ⇄ 3 ⇄ 8 ⇄ 9 ⇄ 4 ⇄ (sentinel)`),
    java(`
public void promoteNewAlphaDestroyOldAlpha() {
    TripleNode oldAlpha = sentinel.right;
    TripleNode newAlpha = oldAlpha.next;

    newAlpha.left.right = ⟪a⟫;
    newAlpha.⟪b⟫ = ⟪c⟫;

    newAlpha.⟪d⟫ = oldAlpha.right;
    oldAlpha.⟪e⟫ = ⟪f⟫;

    ⟪g⟫;
    ⟪h⟫;
}`, { a: 'newAlpha.right', b: 'right.left', c: 'newAlpha.left', d: 'right', e: 'right.left', f: 'newAlpha', g: 'newAlpha.left = sentinel', h: 'sentinel.right = newAlpha' }),
    blank(31, '(a) newAlpha.left.right = ____', 'newAlpha.right', S('6')),
    blank(32, '(b) newAlpha.____ (left side)', 'right.left', S('6')),
    blank(33, '(c) = ____', 'newAlpha.left', { ...S('6'), ...note('These two lines unlink newAlpha from where it was.') }),
    blank(34, '(d) newAlpha.____ = oldAlpha.right', 'right', S('6')),
    blank(35, '(e) oldAlpha.____ (left side)', 'right.left', S('6')),
    blank(36, '(f) = ____', 'newAlpha', S('6')),
    blank(37, '(g) Next line', 'newAlpha.left = sentinel', S('6')),
    blank(38, '(h) Last line', 'sentinel.right = newAlpha', { ...S('6'), ...note('Then newAlpha takes oldAlpha’s place between the sentinel and oldAlpha’s right neighbor.') }),
  ]),
]);
