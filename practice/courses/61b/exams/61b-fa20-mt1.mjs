// Fall 2020 Midterm 1, from the official exam and solutions. Q1 was administrative.
// Free-form implementations use answer blanks following the staff solution's structure.
import { exam, problem, text, java, blank, mc } from '../../../content/author.mjs';
import { staff } from '../staff.mjs';

const E = '61b-fa20-mt1', S = (...labels) => staff(E, ...labels);
let q = 0;
const b = (label, answer, tags) => blank(++q, label, answer, S(tags));
const m = (label, choices, answer, tags, note) => mc(++q, label, choices, answer, { ...S(tags), ...(note ? { x: note } : {}) });

export default exam(E, 'Fall 2020 Midterm 1', {
  exam: 'https://drive.google.com/file/d/1uZBrjtJMZd1M5dFbyztC1KsACZSrAGBg/view',
  sol: 'https://drive.google.com/file/d/1sQFkLAorx7RRLnrVL9lYOcPSXh45QOyQ/view',
}, 'fa20-mt1', [
  problem('2', 'Character counting and comparators (92 pts)', null, [
    text('Implement countChar, which counts occurrences of c in a non-null string.'),
    java(`public static int countChar(String a, char c) {
    int count = 0;
    for (⟪a⟫) {
        if (⟪b⟫) {
            ⟪c⟫;
        }
    }
    return ⟪d⟫;
}`, { a: 'int i = 0; i < a.length(); i += 1', b: 'a.charAt(i) == c', c: 'count += 1', d: 'count' }),
    b('(a) Loop header', ['int i = 0; i < a.length(); i += 1', 'int i = 0; i < a.length(); i++'], '2a'),
    b('(a) Condition', ['a.charAt(i) == c', 'c == a.charAt(i)'], '2a'),
    b('(a) On a match', ['count += 1', 'count++'], '2a'),
    b('(a) Return value', 'count', '2a'),
    text('XComparator compares strings by the count of lowercase x. countChar is available.'),
    java(`public int compare(String a, String b) {
    return ⟪e⟫;
}`, { e: "countChar(a, 'x') - countChar(b, 'x')" }),
    b('(b) Return expression', ["countChar(a, 'x') - countChar(b, 'x')", "Integer.compare(countChar(a, 'x'), countChar(b, 'x'))"], '2b'),
    text('CharCountComparator instead uses a character supplied to its constructor.'),
    java(`private char c;
public CharCountComparator(char givenC) {
    ⟪f⟫;
}
public int compare(String a, String b) {
    return ⟪g⟫;
}`, { f: 'c = givenC', g: 'countChar(a, c) - countChar(b, c)' }),
    b('(c) Constructor body', ['c = givenC', 'this.c = givenC'], '2c'),
    b('(c) compare return expression', ['countChar(a, c) - countChar(b, c)', 'Integer.compare(countChar(a, c), countChar(b, c))'], '2c'),
    text('findMax returns a maximum string according to any Comparator<String> c. The array is nonempty.'),
    java(`private static String findMax(String[] strings, Comparator<String> c) {
    String best = ⟪h⟫;
    for (int i = 0; i < strings.length; i += 1) {
        if (⟪i⟫) {
            ⟪j⟫;
        }
    }
    return ⟪k⟫;
}`, { h: 'strings[0]', i: 'c.compare(strings[i], best) > 0', j: 'best = strings[i]', k: 'best' }),
    b('(d) Initial best', 'strings[0]', '2d'),
    b('(d) Update condition', ['c.compare(strings[i], best) > 0', 'c.compare(best, strings[i]) < 0'], '2d'),
    b('(d) Update', 'best = strings[i]', '2d'),
    b('(d) Return', 'best', '2d'),
  ]),
  problem('3', 'Student equals (66 pts)', null, [
    java(`class Student {
    String name; int SID;
    public boolean equals(Student other) {
        return name.equals(other.name) && SID == other.SID;
    }
}
Student sB = new Student("Borf", 123);
Student sG = new Student("Gorf", 123);
Student sB2 = new Student("Borf", 123);
Object oG = sG;
Object oB2 = sB2;`),
    text('The method equals(Student) overloads, rather than overrides, Object.equals(Object). Choose the result of each expression.'),
    ...[
      ['sB.equals(sG)', 1], ['sB.equals(sB2)', 0], ['sB == sB2', 1],
      ['sG.equals(oG)', 0], ['sG == oG', 0], ['sG.equals((Student) oG)', 0],
      ['sB.equals(oB2)', 1], ['sB == oB2', 1], ['sB.equals((Student) oB2)', 0],
      ['((Object) sB2).equals((Student) oB2)', 0],
    ].map(([expression, answer]) => m(`(a) ${expression}`, ['true', 'false', 'compile error', 'runtime error'], answer, '3a')),
    m('(b) After changing the parameter to Object and casting it to Student, which previously false expression becomes true?',
      ['sB.equals(sG)', 'sB == sB2', 'sB.equals(oB2)', 'sB == oB2'], 2, '3b'),
    m('(c) Which check is needed before casting the Object argument to Student?',
      ['Only an SID comparison', 'That it is non-null and a Student', 'That both names are interned', 'That the argument is a String'], 1, '3c'),
  ]),
  problem('4', 'Dynamic method selection with dogs (28 pts)', null, [
    java(`class Dog { void bark() { System.out.println("bark"); } }
class Puppy extends Dog { void bark() { System.out.println("lil bark"); } }
class DogLover {
    void pet(Dog d) { System.out.print("pet dog"); d.bark(); }
    void pet(Puppy p) { System.out.print("pet puppy"); p.bark(); }
}
class PuppyLover extends DogLover {
    void pet(Puppy p) { System.out.print("pup love"); p.bark(); }
}
PuppyLover pl = new PuppyLover();
Puppy p = new Puppy();`),
    ...['pl.pet(p)', '((DogLover) pl).pet(p)', 'pl.pet((Dog) p)', '((DogLover) pl).pet((Dog) p)']
      .map((call, i) => m(`What does ${call} print?`, ['pup lovelil bark', 'pet puppylil bark', 'pet doglil bark', 'pet dogbark'], i < 2 ? 0 : 2, '4')),
  ]),
  problem('5', 'AddOnlyList (118 pts)', null, [
    text('An AddOnlyList stores item 0 at array index 0, item 1 at M−1, item 2 at 1, item 3 at M−2, and so on. M is a power of two at least 8.'),
    java(`private int indexOfI(int i, int M) {
    if (i % 2 == 0) return ⟪a⟫;
    else return ⟪b⟫;
}
public T get(int i) { return ⟪c⟫; }`, { a: 'i / 2', b: 'M - i / 2 - 1', c: 'items[indexOfI(i, items.length)]' }),
    b('(a) Even item index', 'i / 2', '5'),
    b('(a) Odd item index', 'M - i / 2 - 1', '5'),
    b('(b) get return value', 'items[indexOfI(i, items.length)]', '5'),
    java(`public void addLast(T x) {
    if (size == items.length) resize(size * 2);
    int index = ⟪d⟫;
    ⟪e⟫;
    ⟪f⟫;
}`, { d: 'indexOfI(size, items.length)', e: 'items[index] = x', f: 'size += 1' }),
    b('(c) New item index', 'indexOfI(size, items.length)', '5'),
    b('(c) Store item', 'items[index] = x', '5'),
    b('(c) Update size', ['size += 1', 'size++'], '5'),
    java(`public void resize(int newlen) {
    T[] newItems = (T[]) new Object[newlen];
    for (int i = 0; i < size; i += 1) {
        int targetIndex = ⟪g⟫;
        ⟪h⟫;
    }
    ⟪i⟫;
}`, { g: 'indexOfI(i, newlen)', h: 'newItems[targetIndex] = get(i)', i: 'items = newItems' }),
    b('(d) Destination index', 'indexOfI(i, newlen)', '5'),
    b('(d) Copy item', 'newItems[targetIndex] = get(i)', '5'),
    b('(d) Replace array', 'items = newItems', '5'),
  ]),
  problem('6', 'List testing and implementation (120 pts)', null, [
    text('List61B<T> has get(i), size(), addLast(x), and a default contains method. The list is non-destructive.'),
    java(`default boolean contains(T x) {
    for (int i = 0; i < size(); i += 1) {
        if (⟪a⟫) return true;
    }
    return false;
}`, { a: 'get(i).equals(x)' }),
    b('(b) Match condition', 'get(i).equals(x)', '6b'),
    text('itemsNotIn(other) returns the items in this list but not in other, in original order.'),
    java(`default List61B<T> itemsNotIn(List61B<T> other) {
    AList<T> meOnly = new AList<>();
    for (int i = 0; i < size(); i += 1) {
        T current = get(i);
        if (⟪b⟫) ⟪c⟫;
    }
    return meOnly;
}`, { b: '!other.contains(current)', c: 'meOnly.addLast(current)' }),
    b('(d) Keep condition', '!other.contains(current)', '6d'),
    b('(d) Append kept item', 'meOnly.addLast(current)', '6d'),
    m('(a) A three-item contains test should assert which results?', ['Only one present item', 'All three present items and one absent item', 'Only an absent item', 'Only the list size'], 1, '6a'),
    m('(c) For [0,1,2].itemsNotIn([1,4,5]), what is returned?', ['[0,2]', '[1]', '[0,1,2]', '[4,5]'], 0, '6c'),
  ]),
  problem('7', 'Removing nodes (155 pts)', null, [
    text('IntLinkedListDeque uses a circular sentinel and doubly linked Node objects.'),
    java(`private void removeNode(Node t) {
    ⟪a⟫;
    ⟪b⟫;
}`, { a: 't.prev.next = t.next', b: 't.next.prev = t.prev' }),
    b('(a) Fix previous node', 't.prev.next = t.next', '7a'),
    b('(a) Fix next node', 't.next.prev = t.prev', '7a'),
    java(`public boolean removeOneIterative(int x) {
    Node p = sentinel.next;
    while (p != sentinel) {
        if (⟪c⟫) {
            removeNode(p);
            return true;
        }
        ⟪d⟫;
    }
    return false;
}`, { c: 'p.value == x', d: 'p = p.next' }),
    b('(b) Match condition', 'p.value == x', '7b'),
    b('(b) Advance', 'p = p.next', '7b'),
    java(`private boolean removeOneRecursive(Node p, int x) {
    if (p == sentinel) return false;
    if (p.value == x) { removeNode(p); return true; }
    return ⟪e⟫;
}
public boolean removeOneRecursive(int x) {
    return ⟪f⟫;
}`, { e: 'removeOneRecursive(p.next, x)', f: 'removeOneRecursive(sentinel.next, x)' }),
    b('(c) Recursive step', 'removeOneRecursive(p.next, x)', '7c'),
    b('(c) Public entry point', 'removeOneRecursive(sentinel.next, x)', '7c'),
    text('moveToFront(x) moves all occurrences of x to the front, preserving the order of other items.'),
    java(`default void moveToFront(int x) {
    int n = 0;
    while (⟪g⟫) n += 1;
    for (int i = 0; i < n; i += 1) ⟪h⟫;
}`, { g: 'removeOne(x)', h: 'addFirst(x)' }),
    b('(d) Remove and count each match', 'removeOne(x)', '7d'),
    b('(d) Reinsert at front', 'addFirst(x)', '7d'),
  ]),
]);
