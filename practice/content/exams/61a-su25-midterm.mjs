// Summer 2025 Midterm (the summer term's only midterm), transcribed from the official exam and solutions.
// The staff topic index lists this exam as "su25-mt2". Problem 6 (Just for Fun, 0 points) isn't included.
// Problems 1 and 5 were added later, so their question ids (28 on) come after problems 2-4's.
import { exam, problem, text, py, blank, mc, sata, h } from '../author.mjs';
import { TREE_ADT } from '../trees.mjs';

const IS_ANCESTOR = `
def is_ancestor(t, d):
    \"\"\"
    Return True if t is an ancestor with respect to a depth d, False otherwise.
    >>> t1 = tree(2, [tree(1)])
    >>> print_tree(t1)
    2
        1
    >>> is_ancestor(t1, 0)
    True
    >>> is_ancestor(t1, 1)         # 2 -> 1: strictly decreasing
    True
    >>> t2 = tree(4, [t1, tree(3, [tree(5), tree(3)])])
    >>> print_tree(t2)
    4
        2
            1
        3
            5
            3
    >>> is_ancestor(t2, 0)
    True     # 4
    >>> is_ancestor(t2, 1)    # 4 -> 2 and 4 -> 3 are both strictly decreasing
    True
    >>> is_ancestor(t2, 2)    # 4 -> 3 -> 5 and 4 -> 3 -> 3 are not strictly decreasing
    False
    \"\"\"
    if ⟪e⟫:
        return True
    for b in branches(t):
        if ⟪f⟫ ⟪g⟫ ⟪h⟫:
            return ⟪i⟫
    return ⟪j⟫`;

const e = exam('61a-su25-midterm', 'Summer 2025 Midterm', 'su25/mt1/61a-su25-midterm', 'su25-mt2', [
  problem('1', 'What Would Python Display? (5.0 pts)', [{ n: '1', t: ['LISTS', 'MUTABILITY', 'WWPD'] }], [
    py(`
a = [[13], 8]
b = a + [[2]]
b[1] -= 2
a[1] -= b[1]

print(a)

a[0] += [7]
b[b[2][0]] += [a.pop(1)]

print(b)

c = b[-1]
c.append(a[0])
c.append(b[0].extend([c[0]]))

print(c)`, null, { ln: true }),
    text('Assume the expressions are evaluated in order in the same interactive session, and so evaluating an earlier expression may affect the result of a later one. Hint: Draw it out!'),
    blank(28, '(a) What is displayed by the call to print in line 6?', '[[13], 2]'),
    mc(29, '(b) What is displayed by the call to print in line 11?', ['[[13], 2, [2]]', '[[13, 7], 6, [2, 2]]', '[[13], 6, [2]]', '[[13, 7], 2, [2]]', '[[13, 7], 6, [4]]', '[[13, 7], 6, [2, [2]]]', '[[13], 6, [2, 2]]'], 1),
    mc(30, '(c) What is displayed by the call to print in line 17?', ['[2, 2, [13, 7], None]', '[2, 2, [13], [2, 2]]', '[2, 2, [13, 2], [13]]', '[2, 2, [13], 2]', '[2, 2, [13, 7, 2], None]', '[2, 2, [13, 7, 2], [None]]'], 4),
  ]),
  problem('2', 'Surf’s Up! (10.0 pts)', [{ n: '2', t: ['ENVIRONMENT_DIAGRAMS', 'HIGHER_ORDER_FUNCTIONS', 'LAMBDAS'] }], [
    text('Answer the questions about the code below. Use scratch paper to draw the diagram to help you answer the questions; drawn diagrams are not graded.'),
    py(`
def wave(twin):
    n = 3
    def twin():
        print(wave, n)
        return print('Shred') or n
        print('Wipeout')
    return twin()

def twin():
    def twin(wave):
        while wave(twin):
            return print('Riptide')
        print('Tide')
    return twin

twin = twin()(lambda twin: print('Twin Wave') or wave(twin))`, null, { ln: true }),
    text('If an error occurs, write "Error". If a function is printed, write "Function".'),
    blank(1, '(a) What is printed after evaluating the above code? Put each line on its own line.', 'Twin Wave\nFunction 3\nShred\nRiptide'),
    mc(2, '(b) How many frames are opened (not including the Global Frame)?', ['3', '4', '5', '6'], 2),
    mc(3, '(c) What is the parent frame of lambda twin: in line 16?', ['Global', 'f1', 'f2', 'None'], 0),
    mc(4, '(d) How many calls are made to the function wave defined in line 1?', ['0', '1', '2', '3', 'None'], 1),
    blank(5, '(e) What is twin assigned to in the Global Frame?', 'None'),
  ]),
  problem('3', 'Python in python? (17.0 pts)', [{ n: '3a', t: ['CONTROL'] }, { n: '3b', t: ['SEQUENCES'] }], [
    text('Definition. A python is a sequence of digits where the following are true:', '• All digits are equal to some digit d', '• All digits are two places apart (difference between indices equals 2)',
      'In other words, a python is a sequence of digits where a digit d occurs in every other digit place, and the length of the python is the number of times d appears consecutively.'),
    h('(a) (9.0 points)'),
    text('Implement python, which takes in a number n and a digit d, and returns the length of the longest python in n where all digits equal d. Assume n > 0.'),
    py(`
def python(n, d):
    """
    Return the length of the longest python of digit d in integer n.

    >>> python(2125262, 2)     # positions of 2s: [0,2,4,6] -> all 2 apart -> length 4
    4
    >>> python(2020211202, 2)  # positions of 2s: [0,2,4,7,9] -> longest python is 3 (at 0,2,4)
    3
    >>> python(20211120202, 2) # positions of 2s: [0,2,6,8,10] -> longest python is 3 (at 6,8,10)
    3
    >>> python(1010, 0)
    2
    >>> python(123456, 7)      # no 7 exists within n
    0
    """
    lengths = []
    ⟪a⟫:
        copied_n = ⟪b⟫
        length = 0
        ⟪c⟫ and copied_n > 0:
            length += 1
            ⟪d⟫
        lengths.⟪e⟫
        ⟪f⟫
    return max(lengths)`, { a: 'while n > 0', b: 'n', c: 'while copied_n % 10 == d', d: 'copied_n = copied_n // 100', e: 'insert(0,length)', f: 'n = n // 10' }),
    sata(6, 'i. Fill in blank (a). Select all that apply.', ['while n // 10 < 0:', 'while n > 0:', 'while n >= 10:', 'while d == n:'], [1]),
    blank(7, 'ii. Fill in blank (b).', 'n', { r: 'b' }),
    blank(8, 'iii. Fill in blank (c).', 'while copied_n % 10 == d', { r: 'c' }),
    mc(9, 'iv. Fill in blank (d).', ['n = n // 100', 'n = copied_n // 100', 'copied_n = copied_n // 100', 'copied_n = n // 100'], 2),
    sata(10, 'v. Fill in blank (e). Select all that apply.', ['insert(0,length)', 'append([length])', 'extend(list(length))', 'extend([length])'], [0, 3]),
    blank(11, 'vi. Fill in blank (f).', 'n = n // 10', { r: 'f' }),
    h('(b) (8.0 points)'),
    text('Implement longest_python, which takes in a number n and returns the digit and length for the digit with the longest python in n. This function explicitly returns the digit, followed by its corresponding length. If there is a tie for longest python, return the numerically greater digit. Assume python from part (a) is implemented correctly.'),
    py(`
def longest_python(n):
    """
    Return the digit and length of the longest python for any digit d
    If there is a tie, return the larger digit.

    >>> longest_python(2324252)  # 2 has len 4, others have len 1
    (2, 4)
    >>> longest_python(1212121)  # 1 has len 4, 2 has len 3,
    (1, 4)
    >>> longest_python(56565656) # 5 has len 4, 6 has len 4, 6 > 5
    (6, 4)
    >>> longest_python(67676565) # 6 has len 4, 7 has len 2, 5 has len 2
    (6, 4)
    >>> longest_python(12345)    # all have len 1, return largest digit
    (5, 1)
    """
    d = {}
    for x in ⟪g⟫:
        ⟪h⟫
    key = ⟪i⟫
    return d[key], ⟪j⟫`, { g: 'range(10)', h: 'd[python(n,x)] = x', i: 'max(d)', j: 'key' }),
    mc(12, 'i. Fill in blank (g).', ['n', 'range(n)', 'range(len(n))', 'range(10)'], 3),
    blank(13, 'ii. Fill in blank (h). You may not use for, in, if, or lambda in your solution.', 'd[python(n,x)] = x', { r: 'h' }),
    blank(14, 'iii. Fill in blank (i). You may not use for, in, if, or lambda in your solution.', ['max(d)', 'max(d.keys())'], { r: 'i' }),
    blank(15, 'iv. Fill in blank (j).', ['key', 'max(d)'], { r: 'j' }),
  ], { run: true }),
  problem('4', 'Valid Number (17.0 pts)', [{ n: '4a', t: ['CONTROL', 'RECURSION'] }, { n: '4b', t: ['CONTROL', 'TREE_RECURSION'] }], [
    text('Definition. A number is valid if it satisfies either of the following criteria:', '• It has 2 or fewer digits, or',
      '• Excluding the last two digits, for every digit, there is another digit 1 or 2 places to the right with the same parity (even or odd)',
      'For example, 3412 is valid as 3 and 1 have the same parity, and 4 and 2 have the same parity.'),
    h('(a) (7.0 points)'),
    text('Implement is_valid, which takes in a number n and returns True if n is valid, False otherwise. Assume n > 0.'),
    py(`
def is_valid(n):
    """
    >>> is_valid(3412) # 1 is two digits to the right of 3, 2 is two digits to the right of 4.
    True
    >>> is_valid(43)   # 2 or fewer digits
    True
    >>> is_valid(3443) # No odd number within two digits of leftmost 3.
    False
    >>> is_valid(213)  # No even number to the right of 2.
    False
    """
    def helper(last, second, n):
        if ⟪a⟫:
            return True
        curr = n % 10
        if ⟪b⟫ and ⟪c⟫:
            return False
        return helper(⟪d⟫)
    return helper(n % 10, n // 10 % 10, n // 100)`, { a: 'n == 0', b: 'curr % 2 != last % 2', c: 'curr % 2 != second % 2', d: 'second, curr, n // 10' }),
    mc(16, 'i. Fill in blank (a).', ['n == 0', 'n >= 0', 'n < 0', 'n == 1'], 0),
    mc(17, 'ii. Fill in blank (b).', ['curr % 2 == 0', 'last % 2 == 0', 'curr % 2 != last % 2', '(curr + last) % 2 == 0'], 2),
    blank(18, 'iii. Fill in blank (c).', ['curr % 2 != second % 2', '(curr + second) % 2 == 1'], { r: 'c' }),
    blank(19, 'iv. Fill in blank (d).', ['second, curr, n // 10', 'second, n % 10, n // 10'], { r: 'd' }),
    h('(b) (10.0 points)'),
    text('Implement valid_subseq, which takes in some number n, and returns the number of subsequences of n that are valid numbers.',
      'A subsequence of a number is a combination of digits whose relative order remains the same as in the original number. In other words, a subsequence of a number is the number with some (or no) digits removed. For example, 213 has the following subsequences: 2, 1, 3, 21, 23, 13, 213',
      'Assume is_valid from part (a) is implemented correctly. Additionally, we have provided you with a function reverse, which takes a number and reverses its digits. Hint: True + True == 2'),
    py(`
def valid_subseq(n):
    """
    Return the number of valid subsequences of n.

    >>> valid_subseq(12)   # possible subseqs: 1, 2, 12 - all are valid
    3
    >>> valid_subseq(123)
    7
    >>> valid_subseq(213)  # possible subseqs: 2, 1, 3, 21, 23, 13, 213 - 6 of which are valid.
    6
    >>> valid_subseq(3412)
    14
    """
    def reverse(x):
        """
        This function gives the reverse of a number

        >>> reverse(3412)
        2143
        """
        # IMPLEMENTATION NOT SHOWN
    def helper(num, rest):
        if ⟪e⟫ and rest == 0:
            return ⟪f⟫
        elif ⟪g⟫:
            return ⟪h⟫
        return helper(⟪i⟫, ⟪j⟫) + helper(⟪k⟫, ⟪l⟫)
    return helper(0, reverse(n))`, { e: 'num == 0', f: '0', g: 'rest == 0', h: 'is_valid(num)', i: 'num * 10 + rest % 10', j: 'rest // 10', k: 'num', l: 'rest // 10' }, {
      // Checking needs a working reverse (not shown on the exam) and no nested docstring doctest.
      runCode: `
def valid_subseq(n):
    """
    >>> valid_subseq(12)
    3
    >>> valid_subseq(123)
    7
    >>> valid_subseq(213)
    6
    >>> valid_subseq(3412)
    14
    """
    def reverse(x):
        return int(str(x)[::-1])
    def helper(num, rest):
        if ⟪e⟫ and rest == 0:
            return ⟪f⟫
        elif ⟪g⟫:
            return ⟪h⟫
        return helper(⟪i⟫, ⟪j⟫) + helper(⟪k⟫, ⟪l⟫)
    return helper(0, reverse(n))`.replace(/^\n/, '') }),
    mc(20, 'i. Fill in blank (e).', ['n >= 0', 'num > 0', 'num == 0', 'n < 0'], 2),
    mc(21, 'ii. Fill in blank (f).', ['0', '1', 'num', 'rest'], 0, { also: [2, 3], x: 'The intended solution was 0. However, since the if statement ensures that both num and rest are 0, they are also valid options.' }),
    blank(22, 'iii. Fill in blank (g).', 'rest == 0', { r: 'g' }),
    mc(23, 'iv. Fill in blank (h).', ['0', '1', 'is_valid(rest)', 'is_valid(num)'], 3),
    blank(24, 'v. Fill in blank (i).', 'num * 10 + rest % 10', { r: 'i' }),
    blank(25, 'vi. Fill in blank (j).', 'rest // 10', { r: 'j' }),
    mc(26, 'vii. Fill in blank (k).', ['n', 'num', 'rest', 'num // 10'], 1),
    blank(27, 'viii. Fill in blank (l).', 'rest // 10', { r: 'l' }),
  ], { run: true }),
  problem('5', 'Family Trees (15.0 pts)', [{ n: '5a', t: ['TREES'] }, { n: '5b', t: ['TREES'] }], [
    h('(a) (7.0 points)'),
    text('Implement descendants, which takes in a tree t and depth d, and returns a list of labels for all children at least depth d away from the root.'),
    py(`
def descendants(t, d):
    \"\"\"Return a list of all labels of descendants at least d levels away from the root node.
    >>> t1 = tree(1, [tree(2, [tree(3), tree(4)]), tree(5, [tree(6), tree(7)])])
    >>> print(t1)
    1
        2
            3
            4
        5
            6
            7
    >>> descendants(t1, 1)
    [2, 3, 4, 5, 6, 7]
    >>> descendants(t1, 2)
    [3, 4, 6, 7]
    >>> descendants(t1, 3)
    []
    \"\"\"
    lst = []
    if ⟪a⟫:
        ⟪b⟫
    for b in branches(t):
        lst = ⟪c⟫
    return ⟪d⟫`, { a: 'd <= 0', b: 'lst.extend([label(t)])', c: 'lst + descendants(b, d-1)', d: 'lst' }),
    mc(31, 'i. Fill in blank (a).', ['d == 0', 'd >= 0', 'd < 0', 'd <= 0'], 3),
    sata(32, 'ii. Fill in blank (b). Select all that apply.', ['lst + label(t)', 'lst.append(t)', 'lst += [t]', 'lst.extend([label(t)])'], [3]),
    blank(33, 'iii. Fill in blank (c).', 'lst + descendants(b, d-1)', { r: 'c' }),
    blank(34, 'iv. Fill in blank (d).', 'lst', { r: 'd' }),
    h('(b) (8.0 points)'),
    text('Definition. A tree is an ancestor if all paths from the root node to a depth d have strictly decreasing labels.', 'Implement is_ancestor, which takes in a tree t and a depth d and returns True if the tree is an ancestor, False otherwise.'),
    py(IS_ANCESTOR, { e: 'd == 0', f: 'label(b) >= label(t)', g: 'or', h: 'not is_ancestor(b, d-1)', i: 'False', j: 'True' }, {
      // The exam's "True     # 4" isn't valid doctest output; checking uses plain "True".
      runCode: IS_ANCESTOR.replace(/^\n/, '').replace('True     # 4', 'True') }),
    mc(35, 'i. Fill in blank (e).', ['d == 0', 'd < 0', 'd == 1', 'd >= 0'], 0),
    blank(36, 'ii. Fill in blank (f). You may not use and, or, or not.', 'label(b) >= label(t)', { r: 'f' }),
    mc(37, 'iii. Fill in blank (g).', ['and', 'or', 'not', '=='], 1),
    blank(38, 'iv. Fill in blank (h).', 'not is_ancestor(b, d-1)', { r: 'h' }),
    mc(39, 'v. Fill in blank (i).', ['not b', 'True', 'is_ancestor(b, d-1)', 'False'], 3),
    blank(40, 'vi. Fill in blank (j).', 'True', { r: 'j' }),
  ], { run: true, support: [TREE_ADT] }),
]);

export default e;
