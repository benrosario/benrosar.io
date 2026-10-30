// Spring 2025 Final, transcribed from the official exam and solutions. Pictures (the SQL tables in problem 8, the code in
// problem 2) are reproduced as text. Problem 7 is Scheme, which isn't on this semester's topic list (see `omitted`).
// Problems 1, 2, 4, 5, 6 and 9 were added later, so their question ids (7 on) come after problems 3 and 8's.
import { exam, problem, text, py, sql, blank, mc, sata, h } from '../author.mjs';

const ORDERS = ['logarithmic', 'linear', 'quadratic', 'exponential'];
// Problem 9(b) calls can_equal from problem 6(a); checking supplies the official version (no docstring, so its
// doctests don't run twice).
const CAN_EQUAL = `
def can_equal(digits, n):
    if digits == '' and n == 0:
        return True
    for k in range(1, len(digits) + 1):
        if any([can_equal(digits[k:], n - sign * int(digits[:k])) for sign in [1, -1]]):
            return True
    return False`;

const e = exam('61a-sp25-final', 'Spring 2025 Final', 'sp25/final/61a-sp25-final', 'sp25-final', [
  problem('1', 'What Would Python Display? (5.0 pts)', [{ n: '1', t: ['GENERATORS', 'LAMBDAS', 'LISTS', 'RECURSION', 'WWPD'] }], [
    text('Assume the following code has been executed.'),
    py(`
nest = [[[x, y] for x in range(y, 3)] for y in range(1, 3)]

def dip(s):
    if s:
        for x in dip(s[1:]):
            yield x + 1
        yield s[0]`),
    text('Write the output that would be displayed by printing the result of each expression. If an error occurs, write ERROR.'),
    blank(7, '(a) next(map(lambda x: 6 // (x - 2), range(5)))', '-3'),
    blank(8, '(b) nest[1]', '[[2, 2]]'),
    blank(9, '(c) list(dip([3, 4, 5]))', '[7, 5, 3]'),
  ]),
  problem('2', 'Square Bears on Stairs (7.0 pts)', [{ n: '2a', t: ['ENVIRONMENT_DIAGRAMS', 'LAMBDAS', 'LISTS', 'MUTABILITY'] }, { n: '2b', t: ['ENVIRONMENT_DIAGRAMS', 'LAMBDAS', 'LISTS', 'MUTABILITY'] }, { n: '2c', t: ['EFFICIENCY', 'LISTS', 'RECURSION'] }, { n: '2d', t: ['EFFICIENCY', 'LISTS', 'RECURSION'] }], [
    text('Complete the environment diagram to answer the following questions. Only the questions will be scored. (The exam gives a blank diagram with a Global frame and frames f1 and f2.)'),
    py(`
stairs = [2, [3, [4, 5]]]
squares = [[9], [16], [25]]
where = lambda i: squares[i]

def bears(squares):
    stairs[1].append(squares[1].pop())
    squares[2] = 36
    print(where(1))
    print(stairs[1])

bears(stairs[1] + squares[1])`, null, { ln: true }),
    blank(10, '(a) What is displayed by print(where(1)) on line 8?', '[16]'),
    blank(11, '(b) What is displayed by print(stairs[1]) on line 9?', '[3, [4], 5]'),
    text('(c) What is the order of growth of the time it takes to evaluate skipsum(s) in terms of the length of list s?'),
    py(`
def skipsum(s):
    if len(s) <= 2:
        return max(s + [0])
    return max(s[0] + skipsum(s[2:]), s[1] + skipsum(s[3:]))`),
    mc(12, '(c) Order of growth of skipsum(s).', ORDERS, 3),
    mc(13, '(d) What would be the order of growth of the time to evaluate skipsum(s) if skipsum were memoized?', ORDERS, 1),
  ]),
  problem('3', 'Swap Meet (6.0 pts)', [{ n: '3', t: ['LISTS'] }], [
    text('Implement swap, which takes a list s and non-negative numbers t and u. It returns a list with the same elements as s, but with the elements at indices t and u swapped. Hint: (a + b) - a == b for any integers a and b.'),
    py(`
def swap(s, t, u):
    """Return a new list like s but with the elements at positions t and u swapped.

    >>> letters = ['p', 'q', 'r', 's']
    >>> swap(letters, 0, 2)
    ['r', 'q', 'p', 's']
    >>> letters
    ['p', 'q', 'r', 's']
    """
    assert min(t, u) >= 0 and max(t, u) < len(s)
    def select(i):
        if ⟪a⟫:
            return ⟪b⟫
        else:
            return ⟪c⟫
    return [select(x) for x in ⟪d⟫]`, { a: 'i in [t, u]', b: 's[t + u - i]', c: 's[i]', d: 'range(len(s))' }),
    sata(1, '(a) Fill in blank (a). Select all that apply.', ['i == t or u', 'i == t and u', 'i == t or i == u', 'i == t and i == u', 'i in [t, u]'], [2, 4]),
    blank(2, '(b) Fill in blank (b).', 's[t + u - i]', { r: 'b' }),
    mc(3, '(c) Fill in blank (c).', ['i', 'x', 's[i]', 's[x]'], 2),
    mc(4, '(d) Fill in blank (d).', ['s', 's[t:u]', 'range(s)', 'range(len(s))'], 3),
  ], { run: true }),
  problem('4', 'Tree Spree (11.0 pts)', [{ n: '4a', t: ['LISTS', 'TREES', 'TREE_RECURSION'] }, { n: '4b', t: ['LISTS', 'TREES', 'TREE_RECURSION'] }], [
    h('(a) (5.0 points)'),
    text('Implement offspring, which takes a Tree instance t and a value x. It returns a list of the labels of the nodes in t that are children of nodes labeled x. The returned list can have any order.', 'The Tree class appears on the left side of Page 2 of the Midterm 2 study guide.'),
    py(`
def offspring(t, x):
    \"\"\"List the labels of all nodes whose parents are labeled x.

    >>> a = Tree(5, [Tree(6, [Tree(7), Tree(8)]), Tree(9, [Tree(10)])])
    >>> sorted(offspring(a, 6))
    [7, 8]
    >>> b = Tree(3, [Tree(5, [Tree(3, [Tree(3), Tree(5)])]), Tree(7, [Tree(3)])])
    >>> sorted(offspring(b, 3))
    [3, 5, 5, 7]
    \"\"\"
    result = []
    for b in t.branches:
        if ⟪a⟫:
            result.append(⟪b⟫)
        result.⟪c⟫
    return result`, { a: 't.label == x', b: 'b.label', c: 'extend(offspring(b, x))' }),
    mc(14, 'i. Fill in blank (a).', ['t.label == x', 'b.label == x', 't.label == x.label', 'b.label == x.label'], 0),
    mc(15, 'ii. Fill in blank (b).', ['t', 't.label', 'b', 'b.label'], 3),
    blank(16, 'iii. Fill in blank (c).', 'extend(offspring(b, x))', { r: 'c' }),
    h('(b) (6.0 points)'),
    text('Implement graft, which takes two Tree instances t and u and a value x. All labels in t and u are unique, and x is a label in t. It mutates t, replacing the node labeled x with u, so that u is now a node in t, and the node labeled x along with all of its descendants are removed from t.', 'Hint: The index method of a list takes a value x and returns the index of the first occurence of x in the list. [\'a\', \'b\', \'c\'].index(\'b\') evaluates to 1.'),
    py(`
def graft(t, u, x):
    \"\"\"Mutate Tree t so that the node rooted at label x is replaced by Tree u.

    >>> lemon = Tree(13, [Tree(14), Tree(15)])
    >>> lime = Tree(1, [Tree(2, [Tree(3), Tree(4, [Tree(5)])]), Tree(6, [Tree(7)])])
    >>> graft(lime, lemon, 4)
    >>> lime
    Tree(1, [Tree(2, [Tree(3), Tree(13, [Tree(14), Tree(15)])]), Tree(6, [Tree(7)])])
    >>> lime.branches[0].branches[1] is lemon
    True
    \"\"\"
    s = ⟪d⟫
    if x in s:
        ⟪e⟫
    else:
        for b in t.branches:
            ⟪f⟫`, { d: '[b.label for b in t.branches]', e: 't.branches[s.index(x)] = u', f: 'graft(b, u, x)' }),
    mc(17, 'i. Fill in blank (d).', ['[t.label]', 't.branches', '[b.label for b in t.branches]', '[graft(b, u, x) for b in t.branches]'], 2),
    blank(18, 'ii. Fill in blank (e).', 't.branches[s.index(x)] = u', { r: 'e' }),
    mc(19, 'iii. Fill in blank (f).', ['graft(b, u, x)', 'return graft(b, u, x)', 'b = u', 'b.label = u.label'], 0),
  ], { run: true }),
  problem('5', 'Row, Row, Row Your Boat (12.0 pts)', [{ n: '5', t: ['INHERITANCE', 'OBJECTS', 'SEQUENCES'] }], [
    text('Each Boat has a number. Each Rower has a name. The add method of a Boat takes a list of Rower instances called folks. Then, for each Rower in folks, if they can sit in the Boat, they are assigned the lowest non-negative seat number that hasn’t yet been assigned for that boat (starting at 0). The seat number for each Rower is stored in the where attribute of their boat: a dictionary whose keys are Rower instances and whose values are non-negative integers. The sit method of a Rower returns True if that Rower doesn’t already have a seat, and prints a message otherwise.', 'A Captain is a Rower that won’t sit in a boat with another Captain. The sit method of the Captain class first checks for another captain in the boat and prints a message and returns None if there is one, then checks that the Captain doesn’t already have a seat in a boat (and prints a message and returns None if they do), and finally claims the boat so that no other captain will sit there (and returns True).'),
    py(`
class Boat:
    \"\"\"A boat full of rowers.

    >>> bella, finn, hank = Rower('Bella'), Captain('Finn'), Captain('Hank')
    >>> Boat(5).add([Rower('Ace'), bella, Rower('Charlie'), finn, Rower('Ginger')])
    >>> Boat(7).add([Rower('Daisy'), finn, hank, bella, Captain('Ellie')])
    Finn in Boat 5 Seat 3 already has a seat!
    Bella in Boat 5 Seat 1 already has a seat!
    Ellie won't sit. Hank is captain of Boat 7!
    >>> print(hank)
    Hank in Boat 7 Seat 1
    \"\"\"
    def __init__(self, number):
        self.number = number  # The number of the boat
        self.where = {}       # A dict from Rowers to seat numbers

    def add(self, folks):
        for p in folks:
            if p.sit(⟪a⟫):
                ⟪b⟫       # Assign them the lowest available seat number

class Rower:
    \"\"\"A Rower in a Boat.\"\"\"
    def __init__(self, name):
        self.name = name
        self.boat = None

    def sit(self, boat):
        if self.boat is None:
            self.boat = boat
            return True
        print(self, 'already has a seat!')

    def __str__(self):
        return f'{self.name} in Boat {self.boat.number} Seat {⟪c⟫}'

class Captain(Rower):
    \"\"\"A captain will not sit in a boat that already has a captain.\"\"\"
    claimed = {}

    def sit(self, boat):
        if boat not in Captain.claimed:
            if ⟪d⟫:
                ⟪e⟫ # Claim the boat
                return True
        else:
            print(f"{self.name} won't sit. {⟪f⟫} is captain of Boat {boat.number}!")`, { a: 'self', b: 'self.where[p] = len(self.where)', c: 'self.boat.where[self]', d: 'super().sit(boat)', e: 'self.claimed[boat] = self', f: 'self.claimed[boat].name' }),
    mc(20, '(a) Fill in blank (a).', ['self', 'self.number', 'Boat', 'Boat.number'], 0),
    blank(21, '(b) Fill in blank (b).', 'self.where[p] = len(self.where)', { r: 'b' }),
    blank(22, '(c) Fill in blank (c), which evaluates to the seat number assigned to the Rower when they sat.', 'self.boat.where[self]', { r: 'c' }),
    sata(23, '(d) Fill in blank (d). Select all that apply.', ['self.boat is not None', 'super().sit(boat)', 'super(self).sit(boat)', 'super().sit(self, boat)', 'Rower.sit(boat)', 'self.Rower.sit(boat)', 'Rower.sit(self, boat)'], [1, 6]),
    mc(24, '(e) Fill in blank (e).', ['claimed = True', 'self.claimed = True', 'claimed[boat] = self', 'self.claimed[boat] = self', 'boat.captain = self', 'boat.captain = True'], 3),
    blank(25, '(f) Fill in blank (f), which evaluates to the name of the captain that claimed this boat.', 'self.claimed[boat].name', { r: 'f' }),
  ], { run: true }),
  problem('6', 'Arithmetic (18.0 pts)', [{ n: '6a', t: ['CONTROL', 'LISTS'] }, { n: '6b.i', t: ['LINKED_LISTS', 'RECURSION'] }, { n: '6b.ii', t: ['ITERATORS', 'LINKED_LISTS', 'RECURSION'] }, { n: '6c', t: ['CONTROL', 'GENERATORS', 'LINKED_LISTS', 'RECURSION'] }], [
    h('(a) (8.0 points)'),
    text('Implement can_equal, which takes a string digits containing a sequence of digits from 1 to 9 (no zeros) and an integer n. It returns True if there is a way to add zero or more + and - symbols to digits to form an expression that evaluates to n.', 'Hint: The built-in int can be called on a string to convert it to an integer. For example, int(\'-42\') returns -42.'),
    py(`
def can_equal(digits, n):
    \"\"\"Whether adding + and - symbols to digits can form an expression that evaluates to n.

    >>> can_equal('45332', 14) # 45-33+2 = 14
    True
    >>> can_equal('45332', 527) # -4+533-2 = 527
    True
    >>> can_equal('45332', 38) # 4+5-3+32 = 38
    True
    >>> can_equal('45332', 287) # -45+332 = 287
    True
    >>> can_equal('45332', -287) # 45-332 = -287
    True
    >>> can_equal('45332', 45) # Impossible
    False
    >>> can_equal('45332', 39) # Impossible
    False
    \"\"\"
    if ⟪a⟫:
        return True
    for k in range(1, ⟪b⟫):
        if ⟪c⟫([can_equal(⟪d⟫, n - sign * ⟪e⟫) for sign in [1, -1]]):
            return True
    return ⟪f⟫`, { a: "digits == '' and n == 0", b: 'len(digits) + 1', c: 'any', d: 'digits[k:]', e: 'int(digits[:k])', f: 'False' }),
    mc(26, 'i. Fill in blank (a).', ["digits == ''", 'n == 0', "digits == '' and n == 0", "digits == '' or n == 0"], 2),
    mc(27, 'ii. Fill in blank (b).', ['10', 'int(digits)', 'int(digits) + 1', 'len(digits)', 'len(digits) + 1'], 4),
    mc(28, 'iii. Fill in blank (c).', ['any', 'all', 'list', 'min', 'iter'], 0),
    blank(29, 'iv. Fill in blank (d).', 'digits[k:]', { r: 'd' }),
    blank(30, 'v. Fill in blank (e).', 'int(digits[:k])', { r: 'e' }),
    mc(31, 'vi. Fill in blank (f).', ['True', 'False', 'n == 0', 'n in digits', 'str(n) in digits'], 1),
    h('(b) (4.0 points)'),
    text('The Link class appears on the left side of Page 2 of the Midterm 2 study guide.', 'i. Fill in blank (g) to implement join_link, a function that takes a linked list of strings s. It returns a string that contains all of the characters in all of the strings in s in order.'),
    py(`
def join_link(s):
    \"\"\"Return a string that concatenates all of the strings in linked list s.

    >>> join_link(Link('cs', Link('6', Link('1a'))))
    'cs61a'
    \"\"\"
    if s is Link.empty:
        return ''
    return ⟪g⟫`, { g: 's.first + join_link(s.rest)' }),
    mc(32, 'i. Fill in blank (g).', ['s + str(s.rest)', 's + join_link(s.rest)', 's + join_link(s.rest.first)', 's.first + str(s.rest)', 's.first + join_link(s.rest)', 's.first + join_link(s.rest.first)'], 4),
    text('ii. Fill in blank (h) to implement to_link, a function that takes a finite iterator t. It returns a linked list containing all of the values that t iterates over.'),
    py(`
def to_link(t):
    \"\"\"Return a linked list containing the values in iterator t.

    >>> to_link(iter([3, 5, 7, 9]))
    Link(3, Link(5, Link(7, Link(9))))
    \"\"\"
    try:
        return ⟪h⟫
    except StopIteration:
        return Link.empty`, { h: 'Link(next(t), to_link(t))' }),
    mc(33, 'ii. Fill in blank (h).', ['Link(t, to_link(t))', 'Link(t, to_link(t.rest))', 'Link(t, to_link(t).rest)', 'Link(t, to_link(next(t)))', 'Link(next(t), to_link(t))', 'Link(next(t), to_link(t.rest))', 'Link(next(t), to_link(t).rest)', 'Link(next(t), to_link(next(t)))'], 4),
    h('(c) (6.0 points)'),
    text('Implement terms, a generator function that takes a string digits containing digits from 1 to 9 and an integer n for which can_equal(digits, n) returns True. It yields integers whose digits are the contents of digits and that sum to n. If there is more than one such sequence of numbers, yield any one of them. You may call can_equal, join_link, and to_link.'),
    py(`
def terms(digits, n):
    \"\"\"Yield the numbers in an expression that demonstrates can_equal(digits, n) is True.

    >>> list(terms('45332', 38))   # 4+5-3+32 = 38
    [4, 5, -3, 32]
    >>> list(terms('45332', 527)) # -4+533-2 = 527
    [-4, 533, -2]
    \"\"\"
    assert can_equal(digits, n)
    digits = to_link(iter(digits)) # Create a linked list over one-digit strings
    first = 0
    while digits:
        first = ⟪i⟫
        rest = ⟪j⟫
        if can_equal(rest, n - first):
            yield first
            first, n = 0, n - first
        elif can_equal(rest, n + first):
            ⟪k⟫
            first, n = 0, n + first
        digits = digits.rest`, { i: 'first * 10 + int(digits.first)', j: 'join_link(digits.rest)', k: 'yield -first' }),
    blank(34, 'i. Fill in blank (i).', 'first * 10 + int(digits.first)', { r: 'i' }),
    blank(35, 'ii. Fill in blank (j).', 'join_link(digits.rest)', { r: 'j' }),
    mc(36, 'iii. Fill in blank (k).', ['n = -n', 'yield first', 'yield -first', 'yield n-first', 'yield from terms(digits, -n)'], 2),
  ], { run: true }),
  problem('8', 'WHERE Brainrot=’Italian’ (6.0 pts)', [{ n: '8', t: ['SQL'] }], [
    text('The who table has one row per character with its name (a unique string), size (a number), and kind (a string). The kinds table has one row per kind that shows whether it’s living (\'yes\' or \'no\') and what kind it is (a unique string).'),
    sql(`
who:
name                 | size   | kind
---------------------+--------+--------
tralalero tralala    | 800.0  | reptile
bombardiro crocodilo | 600.0  | reptile
lirili larila        | 1500.0 | mammal
capuchino assassino  | 60.0   | object
brr brr patapim      | 80.0   | mammal
chimpanzini bananini | 90.0   | mammal
tung tung tung sahur | 200.0  | object

kinds:                Result Part (a):
living | what         total
-------+--------      ------
yes    | mammal       3070.0
yes    | reptile
no     | object

Result Part (b):
name                 | number
---------------------+-------
bombardiro crocodilo | 1
brr brr patapim      | 2
capuchino assassino  | 2
chimpanzini bananini | 2
lirili larila        | 1
tralalero tralala    | 2`),
    text('(a) Fill in blank (a) to create a one-row, one-column table containing the total size of all characters that have a living kind.'),
    sql(`SELECT SUM(size) AS total FROM ⟪a⟫;`, { a: "who JOIN kinds ON kind=what WHERE living='yes'" }),
    mc(5, '(a) Fill in blank (a).', ['who JOIN kinds ON kind=what WHERE kind=living', "who JOIN kinds ON kind=what WHERE kind='living'", 'who JOIN kinds ON kind=what WHERE living=yes', "who JOIN kinds ON kind=what WHERE living='yes'", 'who JOIN kinds ON kind=kinds WHERE kind=living', "who JOIN kinds ON kind=kinds WHERE kind='living'", 'who JOIN kinds ON kind=kinds WHERE living=yes', "who JOIN kinds ON kind=kinds WHERE living='yes'"], 3),
    text('(b) Two characters can battle if the smaller one is at least half the size of the larger one (or they are the same size). Fill in blank (b) to create a table with one row per character that has two columns: the character’s name and the number of other characters it can battle. For example, lirili larila can only battle tralalero tralala because all other characters are too small. Do not include rows for characters that cannot battle any other characters.'),
    sql(`SELECT a.name, COUNT(*) FROM who AS a, who AS b WHERE a.name != b.name AND ⟪b⟫ GROUP BY a.name;`, { b: 'MIN(a.size, b.size) >= MAX(a.size, b.size) * 0.5' }),
    sata(6, '(b) Fill in blank (b). Select all that apply.', ['a.size >= b.size * 0.5', 'b.size >= a.size * 0.5', 'a.size >= b.size * 0.5 OR b.size >= a.size * 0.5', 'a.size >= b.size * 0.5 AND b.size >= a.size * 0.5', 'MIN(a.size, b.size) >= b.size * 0.5', 'a.size >= MAX(a.size, b.size) * 0.5', 'MIN(a.size, b.size) >= MAX(a.size, b.size) * 0.5', 'MIN(a.size / b.size, b.size / a.size) >= 0.5', 'MAX(a.size / b.size, b.size / a.size) >= 0.5'], [3, 6, 7]),
  ]),
  problem('9', 'A+ (0.0 pts)', [{ n: '9a', t: ['LISTS', 'SEQUENCES'] }, { n: '9b', t: ['GENERATORS', 'LAMBDAS', 'TREE_RECURSION'] }], [
    text('These two A+ questions are not worth any points. They can only affect your course grade if you have a high A and might receive an A+. Finish the rest of the exam first!'),
    h('(a) (0.0 points)'),
    text('Fill in the blank to implement swap, which takes a list s and non-negative numbers t and u. It returns a list with the same elements as s, but with the elements at indices t and u swapped. Do not write if, and, or, or lambda. You may not call functions from elsewhere on the exam. Hint: Try using a dictionary.'),
    py(`
def swap(s, t, u):
    \"\"\"Return a new list like s but with the elements at positions t and u swapped.

    >>> letters = ['p', 'q', 'r', 's']
    >>> swap(letters, 0, 2)
    ['r', 'q', 'p', 's']
    >>> letters
    ['p', 'q', 'r', 's']
    \"\"\"
    return [⟪a⟫ for x in range(len(s))]`, { a: 's[{t: u, u: t}.get(x, x)]' }),
    blank(37, 'Fill in the blank. Do not write if, and, or, or lambda.', 's[{t: u, u: t}.get(x, x)]', { r: 'a' }),
    h('(b) (0.0 points)'),
    text('Fill in the blank to implement equal, which takes a string digits containing digits from 1 to 9 and an integer n for which can_equal(digits, n) returns True. It returns a string s containing all of digits and zero or more + or - symbols such that eval(s) == n. You may call eval and can_equal. If there is more than one possible return value, return any of them. Important: For credit, your implementation must ensure that the generator returned by f only yields as many values as necessary for correctness (and no more).'),
    py(`
def equal(digits, n):
    \"\"\"Return a string containing digits and + and - that evaluates to n.

    >>> equal('45332', 527)
    '-4+533-2'
    >>> equal('45332', 38)
    '4+5-3+32'
    \"\"\"
    assert can_equal(digits, n)
    def f(digits):
        yield digits
        yield '-' + digits
        for k in range(1, len(digits)):
            for rest in f(digits[k:]):
                yield digits[:k] + '+' + rest
                yield digits[:k] + '-' + rest
                yield '-' + digits[:k] + '+' + rest
                yield '-' + digits[:k] + '-' + rest
    return ⟪b⟫`, { b: 'next(filter(lambda x: eval(x) == n, f(digits)))' }, {
      // The exam requires f to yield only as many values as necessary. Checking counts every value f yields and
      // compares with the official answer's count (1298 and 63); taking every value instead yields 1656.
      runCode: `
_yields = [0]

def equal(digits, n):
    \"\"\"
    >>> equal('45332', 527)
    '-4+533-2'
    >>> _yields[0]  # values yielded by f: only as many as necessary
    1298
    >>> equal('45332', 38)
    '4+5-3+32'
    >>> _yields[0]  # values yielded by f: only as many as necessary
    63
    \"\"\"
    assert can_equal(digits, n)
    _yields[0] = 0
    def f(digits):
        _yields[0] += 1; yield digits
        _yields[0] += 1; yield '-' + digits
        for k in range(1, len(digits)):
            for rest in f(digits[k:]):
                _yields[0] += 1; yield digits[:k] + '+' + rest
                _yields[0] += 1; yield digits[:k] + '-' + rest
                _yields[0] += 1; yield '-' + digits[:k] + '+' + rest
                _yields[0] += 1; yield '-' + digits[:k] + '-' + rest
    return ⟪b⟫`.replace(/^\n/, '') }),
    blank(38, 'Fill in the blank. Only as many values as necessary may be taken from the generator f.', 'next(filter(lambda x: eval(x) == n, f(digits)))', { r: 'b' }),
  ], { run: true, support: [CAN_EQUAL] }),
]);
e.omitted = [{ n: '7', why: 'a Scheme problem; Scheme isn’t on this semester’s topic list' }];
export default e;
