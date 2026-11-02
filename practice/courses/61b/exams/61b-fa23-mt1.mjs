// Fall 2023 Midterm 1 (Thu 9/21/2023), transcribed from the official solutions (updated Sep 2024).
// Code questions are one blank per line of the staff solution. Staff note that Q2 mixes overloading and overriding,
// which more recent semesters treat as out of scope. Left out: the last page (0 points).
import { exam, problem, text, java, blank, mc, sata } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-fa23-mt1', S = (...l) => staff(E, ...l);
const note = (x, o = {}) => ({ x, ...o });
const TF = ['True', 'False'];
const OUT = ['The PrintJob finishes as if the job hadn’t been updated', 'The PrintJob finishes as if the job had been updated from the start', 'The PrintJob finishes, but some copies look like the old version, and some copies look like the new version', 'The PrintJob never finishes', 'The Printer crashes'];
const OUT2 = [OUT[0], OUT[1], OUT[3], OUT[4]];

export default exam(E, 'Fall 2023 Midterm 1', {
  exam: 'https://drive.google.com/file/d/1t65JX1RtaEoSyU05hi0b9i7aPMmqLrDV/view',
  sol: 'https://drive.google.com/file/d/1XJOuVk9IXIbzNlNUuVBodUEHQQYrMSDy/view',
}, 'fa23-mt1', [
  problem('1', 'Hot Curry (10.0 pts)', null, [
    ...[
      ['(a) In Java, every if condition must also have an else clause.', 1],
      ['(b) System.out.println returns a String.', 1],
      ['(c) An instance method with no arguments can call static methods.', 0],
      ['(d) An int[] of length 1 behaves exactly the same as an int when passed into a method.', 1, 'The method gets a reference to the same array, so changes to it are visible to the caller.'],
      ['(e) You can call a private method from a public method in the same class.', 0],
      ['(f) You can call a public method from a private method in the same class.', 0],
      ['(g) Passing all tests always means your code is failproof.', 1],
      ['(h) An interface can extend a class.', 1],
      ['(i) You can always cast a class to its parent class and/or parent interface(s).', 0],
      ['(j) A class can be both Comparable and Iterable.', 0],
    ].map(([l, a, x], k) => mc(k + 1, l, TF, a, { ...S('1'), ...(x ? note(x) : {}) })),
    mc(11, '(k) What is the result of new Dog() == new Dog(), assuming there are no errors?', ['true', 'false'], 1, { ...S('1'), ...note('Two separate objects.') }),
    java(`
class Ch<E> {
    static E se() {
        return null;
    }
}`),
    mc(12, '(l) The code above compiles.', TF, 1, { ...S('1'), ...note('A static method belongs to no instance, so the class’s type parameter E means nothing there.') }),
  ]),
  problem('2', 'Java Cat-astrophe (15.0 pts)', null, [
    java(`
public class Cat {
    public void scratch(Cat c) { System.out.println("scratchy scratch"); }
    public void meow(Cat c) { System.out.println("meow"); }
}

public class Siamese extends Cat {
    public void scratch(Cat c) { System.out.println("big scratch"); }
    public void scratch(Siamese s) { System.out.println("fat scratch"); }
    public void scratch(Calico c) { System.out.println("fighting scratch"); }
    public void meow(Cat c) { System.out.println("purr"); }
}

public class Calico extends Cat {
    public void scratch(Cat c) { System.out.println("regular scratch"); }
    public void scratch(Calico c) { System.out.println("light scratch"); }
    public void meow(Siamese s) { System.out.println("meep"); }
}`),
    text('For each line, write CE for a compile error, RE for a runtime error, OK if it runs but prints nothing, or what it prints. If a line errors, assume the program continues as if it weren’t there.'),
    java(`
Cat midori = new Cat();                  // a
Cat tofu = new Siamese();                // b
Calico fish = new Cat();                 // c
Calico cliff = new Calico();             // d
Calico minou = new Siamese();            // e
Siamese luna = new Siamese();            // f
cliff.meow(luna);                        // g
((Cat) cliff).meow(luna);                // h
midori.meow(luna);                       // i
((Cat) cliff).scratch(tofu);             // j
Cat.scratch(tofu);                       // k
midori.scratch(cliff);                   // l
midori.scratch((Calico) tofu);           // m
cliff.meow(midori);                      // n
tofu.scratch(midori);                    // o`),
    ...[['OK'], ['OK'], ['CE'], ['OK'], ['CE', 'A Siamese isn’t a Calico.'], ['OK'],
      ['meep', 'Calico’s meow(Siamese) is the best match for a Siamese argument.'],
      ['meow', 'Through a Cat reference only meow(Cat) is visible, and Calico doesn’t override that one.'],
      ['meow'], ['regular scratch', 'scratch(Cat) is chosen at compile time; cliff is a Calico at runtime.'],
      ['CE', 'scratch isn’t static.'], ['scratchy scratch'],
      ['RE', 'tofu is a Siamese, so the cast to Calico fails at runtime.'], ['meow'],
      ['big scratch', 'tofu’s static type is Cat, so scratch(Cat) is chosen; Siamese overrides it.']]
      .map(([a, x], k) => blank(13 + k, `(${'abcdefghijklmno'[k]})`, a, { ...S('2'), ...(x ? note(x) : {}) })),
  ]),
  problem('3', 'Printer Problems (25.0 pts)', null, [
    text('A PrintJob has List<String> pages and int numCopies (both positive). A Printer is an iterator: sendJob adds a job to the back of its jobs deque; next returns the next page, printing numCopies collated copies of the first job (pages "1", "2", "3" with 4 copies print 123123123123) and removing the job when done; hasNext says whether a page is left. You may use getFirst and getLast on the Deque.'),
    java(`
public class Printer implements Iterator<String> {
    public Deque<PrintJob> jobs;
    public int currPage;
    public int currCopy;

    public Printer() {
        this.jobs = new ArrayDeque<PrintJob>();
        ⟪a⟫;
        ⟪b⟫;
    }

    public void sendJob(PrintJob job) {
        ⟪c⟫;
    }

    @Override
    public boolean hasNext() {
        return !this.jobs.isEmpty();
    }

    @Override
    public String next() {
        if (⟪d⟫) {
            throw new NoSuchElementException("No more pages to print.");
        }
        PrintJob currJob = ⟪e⟫;
        String nextPage = ⟪f⟫;
        this.currPage = ⟪g⟫;
        if (currPage == currJob.pages.size()) {
            ⟪h⟫;
            ⟪i⟫;
        }
        if (currCopy == currJob.numCopies) {
            ⟪j⟫;
            ⟪k⟫;
            ⟪l⟫;
        }
        return nextPage;
    }
}`, { a: 'this.currPage = 0', b: 'this.currCopy = 0', c: 'this.jobs.addLast(job)', d: '!this.hasNext()', e: 'this.jobs.getFirst()', f: 'currJob.pages.get(currPage)', g: 'this.currPage + 1', h: 'this.currCopy += 1', i: 'this.currPage = 0', j: 'this.jobs.removeFirst()', k: 'this.currCopy = 0', l: 'this.currPage = 0' }),
    blank(28, '(a) Constructor, first blank', ['this.currPage = 0', 'currPage = 0', 'this.currCopy = 0', 'currCopy = 0'], S('3a')),
    blank(29, '(a) Constructor, second blank', ['this.currCopy = 0', 'currCopy = 0', 'this.currPage = 0', 'currPage = 0'], S('3a')),
    blank(30, '(a) sendJob', ['this.jobs.addLast(job)', 'jobs.addLast(job)'], S('3a')),
    blank(31, '(a) next: if (____) throw', ['!this.hasNext()', '!hasNext()', 'this.jobs.isEmpty()', 'jobs.isEmpty()'], S('3a')),
    blank(32, '(a) PrintJob currJob = ____', ['this.jobs.getFirst()', 'jobs.getFirst()'], S('3a')),
    blank(33, '(a) String nextPage = ____', 'currJob.pages.get(currPage)', S('3a')),
    blank(34, '(a) this.currPage = ____', ['this.currPage + 1', 'currPage + 1'], S('3a')),
    blank(35, '(a) Finished a copy, first line', ['this.currCopy += 1', 'currCopy += 1', 'currCopy++'], S('3a')),
    blank(36, '(a) Finished a copy, second line', ['this.currPage = 0', 'currPage = 0'], S('3a')),
    blank(37, '(a) Finished the job, first line', ['this.jobs.removeFirst()', 'jobs.removeFirst()'], S('3a')),
    blank(38, '(a) Finished the job, second line', ['this.currCopy = 0', 'currCopy = 0'], S('3a')),
    blank(39, '(a) Finished the job, third line', ['this.currPage = 0', 'currPage = 0'], { ...S('3a'), ...note('this. is optional throughout; resetting currPage here is redundant after the copy block already did it.') }),
    text('(b) Partway through printing (at least one page printed, at least one left), you update a PrintJob pj you kept a reference to, between calls to next and hasNext. Then you call next until hasNext returns false. Select all that could happen.'),
    sata(40, '(b) i. You add finitely many pages to the end (pj.pages.addLast(...))', OUT, [1, 2], S('3b')),
    sata(41, '(b) ii. You remove some (but not all) pages from the end (pj.pages.removeLast())', OUT, [1, 2, 4], { ...S('3b'), ...note('If currPage is already past the new last page, get(currPage) throws.') }),
    sata(42, '(b) iii. You increase the number of copies (pj.numCopies += 100)', OUT2, [1], S('3b')),
    sata(43, '(b) iv. You decrease the number of copies (pj.numCopies -= 100), still positive', OUT2, [1, 2], { ...S('3b'), ...note('If currCopy has already passed the new numCopies, currCopy == numCopies is never true again.') }),
  ]),
  problem('4', 'Card Deck (30.0 pts)', null, [
    java(`
public class CardDeck {
    public class Card {
        public static final String[] SUITS = new String[]{"Hearts", "Clubs", "Diamonds", "Spades"};
        public static final String[] RANKS = new String[]{"Ace", "2", "3", "4", "5",
            "6", "7", "8", "9", "10", "Jack", "Queen", "King"};
        public int suitIndex;
        public int rankIndex;

        public Card(int suitIndex, int rankIndex) { ... }

        @Override
        public boolean equals(Object obj) {
            if (obj instanceof Card card) {
                return this.suitIndex == card.suitIndex && this.rankIndex == card.rankIndex;
            }
            return false;
        }
    }

    public List<Card> cards;

    public CardDeck() {
        cards = new ArrayList<>();
        createDeck();
    }

    private void createDeck() { /* part a */ }
    public void faroShuffle() { /* part b */ }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof CardDeck cardDeck) {
            return this.cards.equals(cardDeck.cards);
        }
        return false;
    }
}`),
    text('(a) createDeck adds 52 unique cards, one per rank and suit, in any order.'),
    java(`
private void createDeck() {
    ⟪a⟫
        ⟪b⟫
            ⟪c⟫;
        }
    }
}`, { a: 'for (int i = 0; i < Card.SUITS.length; i++) {', b: 'for (int j = 0; j < Card.RANKS.length; j++) {', c: 'cards.add(new Card(i, j))' }),
    blank(44, '(a) Outer loop', ['for (int i = 0; i < Card.SUITS.length; i++) {', 'for (int i = 0; i < 4; i++) {', 'for (int i = 0; i < Card.SUITS.length; i += 1) {'], S('4a')),
    blank(45, '(a) Inner loop', ['for (int j = 0; j < Card.RANKS.length; j++) {', 'for (int j = 0; j < 13; j++) {', 'for (int j = 0; j < Card.RANKS.length; j += 1) {'], S('4a')),
    blank(46, '(a) Body', ['cards.add(new Card(i, j))', 'this.cards.add(new Card(i, j))'], S('4a')),
    text('(b) A faro shuffle splits the deck into two equal halves and interweaves them perfectly: [1, 2, 3, 4, 5, 6] becomes [1, 4, 2, 5, 3, 6]. There are always 52 cards.'),
    java(`
public void faroShuffle() {
    List<Card> cardCopy = new ArrayList<>(cards);
    for (int i = 0; i < cards.size() / 2; i += 1) {
        this.cards.set(⟪d⟫);
        this.cards.set(⟪e⟫);
    }
}`, { d: '2 * i, cardCopy.get(i)', e: '2 * i + 1, cardCopy.get(i + this.cards.size() / 2)' }),
    blank(47, '(b) First set(____)', '2 * i, cardCopy.get(i)', S('4b')),
    blank(48, '(b) Second set(____)', ['2 * i + 1, cardCopy.get(i + this.cards.size() / 2)', '2 * i + 1, cardCopy.get(i + cards.size() / 2)', '2 * i + 1, cardCopy.get(i + 26)'], S('4b')),
    text('(c) How many iterations does each while loop run? (8 faro shuffles return a 52-card deck to its original order.) Write inf if it never ends.'),
    java(`
// (i)
CardDeck deck = new CardDeck();
CardDeck deck2 = deck;
deck2.faroShuffle();
while (deck2 != deck) {
    deck2.faroShuffle();
}

// (ii)
CardDeck deck = new CardDeck();
CardDeck deck2 = deck;
deck2.faroShuffle();
while (!deck2.equals(deck)) {
    deck2.faroShuffle();
}

// (iii)
CardDeck deck = new CardDeck();
CardDeck deck2 = new CardDeck();
deck2.faroShuffle();
while (deck2 != deck) {
    deck2.faroShuffle();
}

// (iv)
CardDeck deck = new CardDeck();
CardDeck deck2 = new CardDeck();
deck2.faroShuffle();
while (!deck2.equals(deck)) {
    deck2.faroShuffle();
}`),
    blank(49, '(c) (i)', '0', { ...S('4c'), ...note('deck2 and deck are the same object.') }),
    blank(50, '(c) (ii)', '0', S('4c')),
    blank(51, '(c) (iii)', ['inf', 'infinite', '∞'], { ...S('4c'), ...note('Two separate objects are never ==.') }),
    blank(52, '(c) (iv)', '7', { ...S('4c'), ...note('After 1 shuffle before the loop, 7 more make 8.') }),
    text('(d) A comparator for “higher card wins”: Ace = 1, Jack = 11, Queen = 12, King = 13, numbers as themselves; equal ranks are compared by suit, Hearts < Clubs < Diamonds < Spades.'),
    java(`
class SimpleGameComparator implements Comparator<Card> {
    @Override
    public int compare(Card c1, Card c2) {
        if ([1]) {
            return [2];
        }
        return [3];
    }
}`),
    mc(53, '(d) [1]', ['c1.rankIndex == c2.rankIndex', 'c1.suitIndex == c2.suitIndex'], 0, S('4d')),
    mc(54, '(d) [2]', ['c1.rankIndex - c2.rankIndex', 'c1.suitIndex - c2.suitIndex', 'c2.rankIndex - c1.rankIndex', 'c2.suitIndex - c1.suitIndex'], 1, S('4d')),
    mc(55, '(d) [3]', ['c1.rankIndex - c2.rankIndex', 'c1.suitIndex - c2.suitIndex', 'c2.rankIndex - c1.rankIndex', 'c2.suitIndex - c1.suitIndex'], 0, S('4d')),
  ]),
  problem('5', 'I Signed an NDA (20.0 pts)', null, [
    text('(a) NDArray stores D-dimensional data of width W (a W × W × … × W array). D ≥ 1 and W ≥ 1.'),
    java(`
public class NDArray {
    public int value;
    public int dimension;
    public NDArray[] arr;

    public NDArray(int D, int W) {
        dimension = D;
        if (⟪a⟫) { return; }
        arr = ⟪b⟫;
        for (⟪c⟫) {
            ⟪d⟫;
        }
    }
}`, { a: 'dimension == 0', b: 'new NDArray[W]', c: 'int i = 0; i < W; i++', d: 'arr[i] = new NDArray(D - 1, W)' }),
    blank(56, '(a) if (____) return', ['dimension == 0', 'D == 0'], S('5a')),
    blank(57, '(a) arr = ____', 'new NDArray[W]', S('5a')),
    blank(58, '(a) The loop header', ['int i = 0; i < W; i++', 'int i = 0; i < W; i += 1', 'int i = 0; i < arr.length; i++'], S('5a')),
    blank(59, '(a) The loop body', 'arr[i] = new NDArray(D - 1, W)', S('5a')),
    text('(b) get returns the item at List<Integer> coords; e.g. for a 2-D NDArray representing [[5, 4], [1, 9]], get(List.of(0, 1)) returns 4. Hint: List’s subList.'),
    java(`
public int get(List<Integer> coords) {
    if (coords.size() != dimension) {
        throw new IllegalArgumentException();
    }
    if (⟪e⟫) {
        ⟪f⟫;
    }
    int index = coords.get(0);
    return ⟪g⟫;
}`, { e: 'coords.isEmpty()', f: 'return this.value', g: 'this.arr[index].get(coords.subList(1, coords.size()))' }),
    blank(60, '(b) The base case: if (____)', ['coords.isEmpty()', 'coords.size() == 0', 'dimension == 0', 'coords.size() == 1'], S('5b')),
    blank(61, '(b) Its body', ['return this.value', 'return value', 'return arr[coords.get(0)].value'], { ...S('5b'), ...note('With coords.size() == 1, return arr[coords.get(0)].value instead.') }),
    blank(62, '(b) return ____', ['this.arr[index].get(coords.subList(1, coords.size()))', 'arr[index].get(coords.subList(1, coords.size()))'], S('5b')),
  ]),
]);
