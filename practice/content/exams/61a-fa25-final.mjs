// Fall 2025 Final (same instructors as Fall 2026), transcribed from the official exam and solutions.
// Problem 6 (Scheme) isn't imported; Scheme isn't on the Fall 2026 in-scope topic list. Problem 5 (async coroutines)
// has no staff topic tags; the Final collection keeps it with a note (see content/collections/final.json).
// The SQL example tables are an image in the PDF and are reproduced as text.
import { exam, problem, text, py, sql, blank, mc, sata, h } from '../author.mjs';

const TREE = 'The Tree class has a label and a list of branches; its repr looks like Tree(2, [Tree(4), Tree(3)]).';
const e = exam('61a-fa25-final', 'Fall 2025 Final', 'fa25/final/61a-fa25-final', 'fa25-final', [
  problem('1', 'What Would Python Display? (5.0 pts)', [{ n: '1', t: ['CONTROL', 'LAMBDAS', 'WWPD'] }], [
    text('Assume the following code has been executed.'),
    py(`
square = lambda x: x * x

def times(a, b, c):
    x = a
    f = lambda y: x * y
    x = b
    g = (lambda q: lambda r: q * r)(x)
    x = c
    print(f(g(x)))

def delay(s):
    last = None
    for x in s:
        if last:
            print(x)
            return last
        last = x

w = [print, abs, square, print]`),
    text('Write the output that would be displayed by evaluating each expression below. If an error occurs, write ERROR, but also write any output that is displayed before the error occurs. Example: For print(square(5)) you should answer 25.'),
    blank(1, [{ p: '(a)' }, { c: 'times(2, 3, 10)', lang: 'py' }], '300'),
    blank(2, [{ p: '(b) Put each line on its own line.' }, { c: 'print(delay(map(lambda f: f(-2), w)))', lang: 'py' }], '-2\n4\n2'),
  ]),
  problem('2', 'Do You Copy? (5.0 pts)', [{ n: '2', t: ['ENVIRONMENT_DIAGRAMS', 'LISTS'] }], [
    text('Draw an environment diagram to answer the following questions. Only the questions will be scored.'),
    py(`
def copy(s):
    return s[:1] + s[1:]
inner = [5, [6]]
first = copy(inner)
second = inner[1]
inner[0] = 7
inner.append(7)
inner[1].append(7)
inner[1] = 8
print(first)
print(second)`, null, { ln: true }),
    mc(3, '(a) What is displayed by print(first) on line 10?', ['[5, [6]]', '[5, [6], 7]', '[5, [6], 7, 7]', '[5, [6, 7]]', '[5, [6, 7], 7]', '[7, [6], 7]', '[7, [6, 7]]', '[7, [6, 7], 7]', '[7, 8]', '[7, 8, 7]', '[[6]]', '[[6, 7]]', '[[6], 7]', '[[6, 7], 7]', '[8]', '[8, 7]'], 3),
    mc(4, '(b) What is displayed by print(second) on line 11?', ['8', '[6]', '[[6]]', '[6, 7]', '[[6, 7]]', '[[6], 7]', '[8]', '[8, 7]'], 3),
    mc(5, '(c) What is the order of growth of the time it takes to evaluate [sum(s[:i]) for i in range(len(s))] in terms of the length of s for a list of numbers s. The sum function takes linear time in the length of its input. Slicing a list takes linear time in the length of the slice. Creating a range and calling len on a list both take constant time (one step each).', ['logarithmic', 'linear', 'quadratic', 'exponential'], 2),
  ]),
  problem('3', 'Math Placement Exam (21.0 pts)', [{ n: '3', t: ['CONTROL', 'ITERATORS', 'TREE_RECURSION'] }], [
    text('Definition. An equation is a list of numbers and operators. A number is either an integer or a ?. An operator is either +, -, or =. Equations start and end with a number, alternate between numbers and operators, and contain exactly one =.'),
    h('(a) (5.0 points)'),
    text('Implement is_equation, which takes a list s. It returns whether s is an equation.'),
    py(`
def is_equation(s):
    """Return whether the list s contains a well-formed equation.

    >>> is_equation([7, '+', 2, '=', '?', '+', 6])
    True
    >>> is_equation([-7, '+', '?', '=', '?', '-', 6])
    True
    >>> is_equation([-7, '+', 2, '=', '?', '-'])         # No number at the end
    False
    >>> is_equation(['-', 7, '+', 2, '=', '?', '-', 6])  # No number at the start
    False
    >>> is_equation([-7, '+', 2, '?', '+', 6, '=', 9])   # Two adjacent numbers (2 and ?)
    False
    >>> is_equation([-7, '+', 2, '+', '-', 6, '=', 9])   # Two adjacent operators (+ and -)
    False
    >>> is_equation([-7, '+', 2, '=', '?', '=', 6])      # More than one =
    False
    """
    number, equals = True, 0
    for x in s:
        ok = (number and (⟪a⟫)) or (⟪b⟫ ['+', '-', '='])
        if not ok:
            return False
        if x == '=':
            equals += 1
        number = not number
    return ⟪c⟫`, { a: "isinstance(x, int) or x == '?'", b: 'not number and x in', c: 'not number and equals == 1' }),
    mc(6, 'i. Fill in blank (a).', ['isinstance(x, int) or x == ?', 'isinstance(x, int) and x == ?', "isinstance(x, int) or x == '?'", "isinstance(x, int) and x == '?'"], 2),
    blank(7, 'ii. Fill in blank (b).', 'not number and x in', { r: 'b' }),
    blank(8, 'iii. Fill in blank (c).', 'not number and equals == 1', { r: 'c' }),
    h('(b) (5.0 points)'),
    text('Definition. A list of integers answers satisfies an equation if there is one integer per placeholder ? in the equation, and after replacing each ? with the corresponding integer from answers, the expression on the left of = has an equal value to the expression on the right of =.',
      'Implement tally to complete the implementation of evaluate. The evaluate function takes an equation and a list of integers called answers that contains one value for each ? in the equation. It returns True if answers satisfies the equation and False otherwise.',
      'The count method of a list takes a value and returns the number of items in the list that are equal to the value.'),
    py(`
def evaluate(equation, answers):
    """Return whether the equation is true once each ? is filled by the corresponding answer.

    >>> evaluate([7, '-', 2, '=', '?', '+', 4], [1])      # 7 - 2 == 1 + 4
    True
    >>> evaluate([7, '-', 2, '=', '?', '-', 4], [3])      # 7 - 2 != 3 - 4
    False
    >>> evaluate([7, '-', 2, '=', 1, '+', 4], [])         # 7 - 2 == 1 + 4
    True
    >>> evaluate([7, '-', '?', '=', '?', '-', 4], [2, 9]) # 7 - 2 == 9 - 4
    True
    """
    assert is_equation(equation) and len(answers) == equation.count('?')
    eq_iter, ans_iter = iter(equation), iter(answers)
    return tally(eq_iter, ans_iter) == tally(eq_iter, ans_iter)

def tally(eq, ans):
    """A helper function for evaluate that computes the value of one side of an equation,
    stopping either at an = sign or the end of the equation."""
    number, total = True, 0
    multiplier = 1 # should always be either 1 or -1
    for x in eq:
        if ⟪d⟫:
            if x == '?':
                ⟪e⟫
            total += multiplier * x
        else:
            if x == '=':
                ⟪f⟫
            else:
                multiplier = ⟪g⟫[x]  # Hint: use a dictionary
        number = not number
    return total`, { d: 'number', e: 'x = next(ans)', f: 'return total', g: "{'+': 1, '-': -1}" }),
    mc(9, 'i. Fill in blank (d).', ['number', 'not number', 'isinstance(x, int)', 'not isinstance(x, int)'], 0),
    blank(10, 'ii. Fill in blank (e).', 'x = next(ans)', { r: 'e' }),
    mc(11, 'iii. Fill in blank (f).', ['return total', 'return sum(ans)', 'return sum(eq)', 'total += sum(ans)', 'total += sum(eq)', 'total += tally(eq, ans)', 'total -= tally(eq, ans)'], 0),
    blank(12, 'iv. Fill in blank (g). Hint: Use a dictionary.', "{'+': 1, '-': -1}", { r: 'g' }),
    h('(c) (6.0 points)'),
    text('Implement feasible, which takes an equation and a range of integers called allowed. It returns True if it’s possible to satisfy the equation using numbers from allowed and False otherwise. In other words, it returns whether it is possible to replace each ? in the equation with some number from allowed such that the expressions to the left and right of = are indeed equal. The same number can replace more than one ?. Assume evaluate is implemented correctly. You may call evaluate.'),
    py(`
def feasible(eq, allowed=range(0, 10)):
    """Return whether it's possible to satisfy the equation eq using numbers from allowed.

    >>> feasible([7, '+', 2, '=', '?', '+', 6])   # the ? could be 3
    True
    >>> feasible(['?', '+', 2, '=', '?', '+', 6]) # the first ? could be 7 and the second 3
    True
    >>> feasible([-7, '+', 2, '=', '?', '+', 6])
    False
    >>> feasible(['?', '+', 5, '=', '?', '-', 6])
    False
    >>> feasible(['?', '+', 5, '=', '?', '-', 6], range(-10, 10)) # -5 and 6, for example
    True
    """
    if '?' not in eq:
        return ⟪h⟫
    n = min([i for i in range(len(eq)) if ⟪i⟫]) # index of the first ?
    return any([⟪j⟫ for x in allowed])`, { h: 'evaluate(eq, [])', i: "eq[i] == '?'", j: 'feasible(eq[:n] + [x] + eq[n+1:], allowed)' }),
    blank(13, 'i. Fill in blank (h).', 'evaluate(eq, [])', { r: 'h' }),
    mc(14, 'ii. Fill in blank (i).', ["i == '?'", "i != '?'", "eq[i] == '?'", "eq[i] != '?'"], 2),
    blank(15, 'iii. Fill in blank (j). You may not write for or in or map or range.', 'feasible(eq[:n] + [x] + eq[n+1:], allowed)', { r: 'j' }),
    h('(d) (5.0 points)'),
    text('Implement solve, which takes an equation and a range of integers called allowed. It returns an iterator over lists of integers, and each of these lists satisfies the equation. You may call evaluate and feasible.'),
    py(`
def print_all(t):
    for x in t:
        print(x)

def solve(equation, allowed=range(0, 10)):
    """Return an iterator over all answer lists that satisfy an equation.

    >>> print_all(solve([7, '+', 2, '=', '?', '+', 6]))
    [3]
    >>> print_all(solve(['?', '-', 2, '=', '?', '+', 6]))
    [8, 0]
    [9, 1]
    >>> print_all(solve(['?', '=', '?', '+', '?'], range(1, 4)))
    [2, 1, 1]
    [3, 1, 2]
    [3, 2, 1]
    """
    def candidates(n):
        """Yield all possible answer lists with n values."""
        if n == 0:
            yield []
        else:
            for first in allowed:
                for rest in ⟪k⟫:
                    yield ⟪l⟫
    blanks = equation.count('?') # the number of ? in equation
    return ⟪m⟫(⟪n⟫, candidates(blanks))`, { k: 'candidates(n-1)', l: '[first] + rest', m: 'filter', n: 'lambda a: evaluate(equation, a)' }),
    mc(16, 'i. Fill in blank (k).', ['allowed', 'equation', 'solve(equation[1:], allowed)', 'solve(equation[2:], allowed)', 'candidates(n-1)', 'candidates(n-first)'], 4),
    mc(17, 'ii. Fill in blank (l).', ['first + rest', '[first] + rest', 'first + [rest]', '[first, rest]', '[[first], rest]', '[first, [rest]]'], 1),
    mc(18, 'iii. Fill in blank (m).', ['map', 'filter', 'any', 'all', 'zip'], 1),
    blank(19, 'iv. Fill in blank (n).', 'lambda a: evaluate(equation, a)', { r: 'n' }),
  ], { run: true }),
  problem('4', 'Trim the Tree (10.0 pts)', [{ n: '4', t: ['SEQUENCES', 'TREES', 'TREE_RECURSION'] }], [
    h('(a) (5.0 points)'),
    text('Implement sums, which takes a Tree of integers t. It returns a dictionary in which each node of t is a key and the corresponding value is the sum of the labels of the tree rooted at that node. ' + TREE),
    py(`
def sums(t):
    """Return a dictionary from nodes to their label sums.

    >>> t = Tree(2, [Tree(4, [Tree(5)]), Tree(3), Tree(5, [Tree(6), Tree(7)])])
    >>> d = sums(t)
    >>> nodes = [t, t.branches[0], t.branches[0].branches[0], t.branches[2]]
    >>> [d[n] for n in nodes]
    [32, 9, 5, 18]
    """
    result = {}
    def insert(t):
        for b in t.branches:
            ⟪a⟫
        result[t] = ⟪b⟫
    insert(t)
    return result`, { a: 'insert(b)', b: 't.label + sum([result[b] for b in t.branches])' }),
    mc(20, 'i. Fill in blank (a).', ['insert(b)', 'sums(b)', 'result += sums(b)', 'result[b] = insert(b)', 'result[b] += insert(b)', 'result[t] += insert(b)', 'result[t] += result[b]', 'result[b] = sums(t)', 'result[b] += sums(t)'], 0),
    blank(21, 'ii. Fill in blank (b).', 't.label + sum([result[b] for b in t.branches])', { r: 'b' }),
    h('(b) (5.0 points)'),
    text('Implement one_cut, which takes a Tree of integers t and a number n. It returns a new tree that has the same labels and structure as t but with one sub-tree excluded. In other words, the returned tree looks like t with a non-root node and its descendents removed. Exclude the non-root node that makes the sum of the remaining labels of the tree as close to n as possible (in absolute value). Do not mutate t. Assume t has at least 2 nodes.'),
    py(`
def one_cut(t, n):
    """Return a tree like t but omit a node so that the sum of remaining labels is close to n.

    >>> t = Tree(2, [Tree(4, [Tree(5)]), Tree(3), Tree(5, [Tree(6), Tree(7)])]) # sums to 32
    >>> one_cut(t, 30) # cuts just the 3 to get 29
    Tree(2, [Tree(4, [Tree(5)]), Tree(5, [Tree(6), Tree(7)])])
    >>> one_cut(t, 26) # cuts just the 6 to get 26
    Tree(2, [Tree(4, [Tree(5)]), Tree(3), Tree(5, [Tree(7)])])
    >>> one_cut(t, 15) # cuts the 5 node with 6 and 7 below it to get 14
    Tree(2, [Tree(4, [Tree(5)]), Tree(3)])
    >>> one_cut(t, 1)  # 14 is the smallest possible sum after one cut
    Tree(2, [Tree(4, [Tree(5)]), Tree(3)])
    """
    d = sums(t)
    total = d.pop(t) # remove the root node from the dictionary; total is the sum of its labels
    target = min(d.keys(), key=lambda node: ⟪c⟫)
    def cut(t):
        ⟪d⟫
    ⟪e⟫`, { c: 'abs(n - (total - d[node]))', d: 'return Tree(t.label, [cut(b) for b in t.branches if b is not target])', e: 'return cut(t)' }),
    blank(22, 'i. Fill in blank (c).', 'abs(n - (total - d[node]))', { r: 'c' }),
    mc(23, 'ii. Fill in blank (d).', ['t.branches.remove(target)', 't.branches = [b for b in t.branches if b is not target]', 't.branches = [cut(b) for b in t.branches if b is not target]', 't = Tree(t.label, [b for b in t.branches if b is not target])', 't = Tree(t.label, [cut(b) for b in t.branches if b is not target])', 'return Tree(t.label, [b for b in t.branches if b is not target])', 'return Tree(t.label, [cut(b) for b in t.branches if b is not target])'], 6),
    mc(24, 'iii. Fill in blank (e).', ['return t', 'return cut(t)', 'return Tree(t.label, list(map(cut, t.branches)))', 'return [cut(t), t][1]'], 1),
  ], { run: true }),
  problem('5', 'Downloads (4.0 pts)', [], [
    text('The coroutine function download fetches a file with the given name. Its implementation is not shown.'),
    py(`
async def download(filename: str):
    ...

class Downloader():
    def __init__(self, filenames):
        self.filenames = filenames
        self.current_index = 0

    async def download_files(self):
        while self.current_index < len(self.filenames):
            filename = self.filenames[self.current_index]
            self.current_index += 1
            await download(filename)

    async def download_all(self):
        await asyncio.gather(self.download_files(), self.download_files())

d = Downloader(["a", "b", "c", "d"])
asyncio.run(d.download_all())`),
    sata(25, '(a) The code above initializes a Downloader with a list of 4 files ["a", "b", "c", "d"]. Which of the following statements are true? Select all that apply.', ['The function download will be called exactly 4 times.', 'The function download may be called more than 4 times.', 'The function download may be called fewer than 4 times.', 'The function download will be called on each file exactly once.', 'The function download may not be called on all of the files.', 'The function download may be called more than once on the same file.', 'The code above may error because the index self.current_index is out of range.'], [0, 3]),
    blank(26, '(b) Assume that the function download takes one second to run, and spends all of that time waiting for the file to be downloaded. During that wait time, it gives up control so that other coroutines can run. How many seconds does the code above take to run?', '2 seconds'),
  ]),
  problem('7', 'Students (9.0 pts)', [{ n: '7', t: ['OBJECTS', 'REPRESENTATION'] }], [
    text('A student has a name (a str) and a discussion group (a DiscGroup instance). Each student is placed into a discussion group based on a keyword (a str) supplied by the student. When a Student instance is created, that student is placed into an existing discussion group that has fewer than 6 students and that has the same keyword that the student supplied. If the student cannot be placed into any existing group, the student will be placed into a new discussion group. Each discussion group (a DiscGroup instance) has a unique integer id, starting at 0 for the first discussion group created and counting up, as well as a list of Student instances called students and a keyword (a str).'),
    py(`
class Student():
    """A student has a name and a keyword that is used to place them in a discussion group.

    >>> chris = Student("Chris", "kickstart")
    >>> pranav = Student("Pranav", "tortilla")
    >>> sebastian = Student("Sebastian", "tortilla")
    >>> print(chris)
    Student Chris is in Disc 0: kickstart (['Chris'])
    >>> print(pranav)
    Student Pranav is in Disc 1: tortilla (['Pranav', 'Sebastian'])
    >>> print(sebastian)
    Student Sebastian is in Disc 1: tortilla (['Pranav', 'Sebastian'])
    """
    def __init__(self, name, keyword):
        """Initialize the student and place them in a discussion group."""
        self.name = name
        self.group = ⟪a⟫
        for group in ⟪b⟫:
            if group.keyword == keyword and len(group.students) < 6:
                self.group = ⟪c⟫
        if not self.group:
            self.group = ⟪d⟫
        ⟪e⟫

    def __str__(self):
        return f"Student {self.name} is in {self.group}"

class DiscGroup():
    groups = [] # All of the DiscGroup instances

    def __init__(self, keyword):
        self.students = [] # All of the students in this DiscGroup
        self.keyword = keyword
        self.id = ⟪f⟫
        ⟪g⟫

    def __str__(self):
        return f"Disc {self.id}: {self.keyword} ({[s.name for s in self.students]})"`, { a: 'None', b: 'DiscGroup.groups', c: 'group', d: 'DiscGroup(keyword)', e: 'self.group.students.append(self)', f: 'len(DiscGroup.groups)', g: 'DiscGroup.groups.append(self)' }),
    mc(27, '(a) Fill in blank (a).', ['None', 'group', 'DiscGroup(keyword)', 'DiscGroup(self.keyword)', 'DiscGroup(self, keyword)'], 0),
    blank(28, '(b) Fill in blank (b).', 'DiscGroup.groups', { r: 'b' }),
    mc(29, '(c) Fill in blank (c).', ['None', 'group', 'DiscGroup(keyword)', 'DiscGroup(self.keyword)', 'DiscGroup(self, keyword)'], 1),
    mc(30, '(d) Fill in blank (d).', ['None', 'group', 'DiscGroup(keyword)', 'DiscGroup(self.keyword)', 'DiscGroup(self, keyword)'], 2),
    blank(31, '(e) Fill in blank (e).', 'self.group.students.append(self)', { r: 'e' }),
    blank(32, '(f) Fill in blank (f).', ['len(DiscGroup.groups)', 'len(self.groups)'], { r: 'f' }),
    blank(33, '(g) Fill in blank (g).', ['DiscGroup.groups.append(self)', 'self.groups.append(self)'], { r: 'g' }),
  ], { run: true }),
  problem('8', 'Students in SQL (6.0 pts)', [{ n: '8', t: ['SQL'] }], [
    text('The students table has one row per student and columns for their name (string), the discussion_id (int) of their discussion, and a keyword (string) chosen by the student. The keyword was used to place the student in a discussion with other students who selected the same keyword.',
      'The discussions table has one row per discussion and columns for the discussion’s unique id (int), the ta (string) who leads the discussion, and the room (string) where the discussion is located.',
      'The first few rows in each table are shown below. Not all rows are shown.'),
    sql(`
students:                                discussions:
name       | discussion_id | keyword     id | ta    | room
-----------+---------------+-----------  ---+-------+--------
Chris      | 2             | kickstart   1  | Rhys  | VLSB203
Pranav     | 0             | tortilla    2  | Amr   | Evans2
Sebastian  | 0             | tortilla    0  | Janet | Soda310
Lavanya    | 2             | kickstart   ...
Mia        | 1             | unit2
Mahanth    | 0             | tortilla
...

Example result, part (a):    Example result, part (b):
keyword  | total             ta    | id
---------+------             ------+---
tortilla | 3                 Rhys  | 1
                             Caleb | 12`),
    h('(a) (3.0 points)'),
    text('Select the most frequently used keyword, and the total number of students with that keyword. Assume there is one keyword used more than any other (no ties).'),
    sql(`SELECT keyword, ⟪a⟫ AS total FROM students ⟪b⟫;`, { a: 'COUNT(*)', b: 'GROUP BY keyword ORDER BY COUNT(*) DESC LIMIT 1' }),
    mc(34, 'i. Fill in blank (a).', ['1', 'name', 'COUNT(*)', 'MAX(keyword)', 'MAX(name)', 'MAX(COUNT(*))'], 2),
    mc(35, 'ii. Fill in blank (b).', ['GROUP BY keyword;', 'GROUP BY keyword HAVING MAX(COUNT(*));', 'GROUP BY keyword HAVING COUNT(*) = MAX(COUNT(*));', 'GROUP BY keyword LIMIT MAX(COUNT(*));', 'GROUP BY keyword ORDER BY keyword DESC LIMIT 1;', 'GROUP BY keyword ORDER BY COUNT(*) DESC LIMIT 1;', 'AS s1 JOIN students AS s2 ON s1.keyword = s2.keyword LIMIT 1;', 'ORDER BY COUNT(*) DESC;', 'ORDER BY keyword DESC;', 'ORDER BY keyword DESC LIMIT MAX(COUNT(*));', 'ORDER BY keyword DESC LIMIT 1;'], 5),
    h('(b) (3.0 points)'),
    text('Create a new table big with one row for each discussion that has more than 20 students. The columns give the ta name and discussion id for each of these discussions. The first row of the example result above indicates that the discussion with ID 1 taught by Rhys has more than 20 students in it (even though only 1 of these students is shown in the example rows of the students table).'),
    sql(`
CREATE TABLE big AS
    SELECT ta, id FROM students JOIN discussions ⟪c⟫;`, { c: 'ON discussion_id = id GROUP BY id HAVING COUNT(*) > 20' }),
    blank(36, 'i. Fill in blank (c).', 'ON discussion_id = id GROUP BY id HAVING COUNT(*) > 20'),
  ]),
  problem('9', 'Final Boss (0.0 pts)', [{ n: '9a', t: ['SCHEME', 'SCHEME_LISTS'] }, { n: '9b', t: ['LAMBDAS', 'TREE_RECURSION'] }], [
    text('These two A+ questions are not worth any points. They can only affect your course grade if you have a high A and might receive an A+. Finish the rest of the exam first! If your answers are long, write on multiple lines.'),
    h('(a) (0.0 pt)'),
    text('Definition. An infix expression is a list that begins and ends with an integer and alternates between integers and operators, where each operator is either + or -. For example, (7 + 2 - 1 + 3 - 6 + 8 - 1 + 4).',
      'Fill in the blank to implement preorder, which takes an infix expression expr and returns a call to + on all of the integers from expr. Each subtracted number in expr should appear within a one-argument call to -.'),
    { c: `;;; Convert an infix expression to a valid Scheme expression with the same value.
;;; scm> (preorder '(7 + 2 - 1 + 3 - 6 + 8 - 1 + 4))
;;; (+ 7 2 (- 1) 3 (- 6) 8 (- 1) 4)
;;; scm> (preorder '(-7 - -1 - 2 - -3))
;;; (+ -7 (- -1) (- 2) (- -3))
(define (preorder expr)
  (define (rest expr f)
    (define (helper s)
      (cond ((null? s) nil)
            ((eq? (car s) '+) (helper (cdr s)))
            ((eq? (car s) '-) (f helper s))
            (else             (cons (car s) (helper (cdr s))))))
    (helper expr))
  ⟪a⟫)`, lang: 'scm', f: { a: "(cons '+ (rest expr (lambda (h s) (cons (list '- (car (cdr s))) (h (cdr (cdr s)))))))" } },
    blank(37, 'i. Fill in the blank.', "(cons '+ (rest expr (lambda (h s) (cons (list '- (car (cdr s))) (h (cdr (cdr s)))))))"),
    h('(b) (0.0 pt)'),
    text('Implement two_cut, which takes a Tree of positive integers t with at least 3 nodes and an integer n. It returns a new tree like t but with 2 non-root nodes (and their descendents) removed. It’s ok if one of the removed nodes is a descendent of the other. Remove the two non-root nodes that change the label sum of the tree to be as close to n as possible (in absolute value). Do not mutate t. You may call one_cut from 4(b) but not sums.'),
    py(`
def g(t):
    return t.label + sum([g(b) for b in t.branches])

def two_cut(t, n):
    """Return a tree like t but omit 2 nodes so that the sum of remaining labels is close to n.

    >>> t = Tree(2, [Tree(4, [Tree(5)]), Tree(3, [Tree(1)]), Tree(5, [Tree(6), Tree(7)])])
    >>> two_cut(t, 30) # cut 1 and then 3; result sums to 29
    Tree(2, [Tree(4, [Tree(5)]), Tree(5, [Tree(6), Tree(7)])])
    >>> two_cut(t, 12) # cut 3 and then 5; result sums to 11
    Tree(2, [Tree(4, [Tree(5)])])
    >>> two_cut(t, 6)  # cut 4 and then 5; result sums to 6
    Tree(2, [Tree(3, [Tree(1)])])
    """
    return ⟪b⟫`, { b: 'min([one_cut(one_cut(t, k), n) for k in range(g(t))], key=lambda t: abs(n - g(t)))' }),
    blank(38, 'i. Fill in the blank.', 'min([one_cut(one_cut(t, k), n) for k in range(g(t))], key=lambda t: abs(n - g(t)))', { r: 'b' }),
  ], {
    run: true, support: [`
# Support code for checking answers only: sums and one_cut from problem 4 (official solutions).
def sums(t):
    result = {}
    def insert(t):
        for b in t.branches:
            insert(b)
        result[t] = t.label + sum([result[b] for b in t.branches])
    insert(t)
    return result

def one_cut(t, n):
    d = sums(t)
    total = d.pop(t)
    target = min(d.keys(), key=lambda node: abs(n - (total - d[node])))
    def cut(t):
        return Tree(t.label, [cut(b) for b in t.branches if b is not target])
    return cut(t)`],
  }),
]);
e.omitted = [{ n: '6', why: 'a Scheme problem; Scheme isn’t on this semester’s topic list' }];
export default e;
