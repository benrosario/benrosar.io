// Spring 2025 Midterm 1, transcribed from the official exam and solutions (the Which One code is an image in the PDF).
// One correction: the all_digits docstring's first line reads ">> odd = ..." in the original; it is ">>>" here so the
// doctest defines odd.
import { exam, problem, text, py, blank, mc, sata, h } from '../author.mjs';

export default exam('61a-sp25-mt1', 'Spring 2025 Midterm 1', 'sp25/mt1/61a-sp25-mt1', 'sp25-mt1', [
  problem('1', 'What Would Python Print? (6.0 pts)', [{ n: '1', t: ['HIGHER_ORDER_FUNCTIONS', 'LAMBDAS', 'WWPD'] }], [
    text('Answer the questions about this code. No errors occur while it is executed.'),
    py(`
def double(x):
    return 2 * x

def square(f):
    return lambda x: f(x) * f(x)

def inc(f):
    return lambda x: f(x + 1)

def triple(f):
    return lambda x: f(f(f(x)))

def put(x):
    return lambda f: f(x)

one = put(1)
triple(print)(5)`),
    blank(1, '(a) What is displayed by the last line? Put each line on its own line.', '5\nNone\nNone'),
    blank(2, [{ p: '(b) What would be displayed by evaluating' }, { c: 'print(one(square(double)))', lang: 'py' }], '4'),
    blank(3, [{ p: '(c) What would be displayed by evaluating' }, { c: 'print(inc(put)(1)(triple(double)))', lang: 'py' }], '16'),
    blank(4, [{ p: '(d) A+ question (0 points). This A+ question is not worth any points. It can only affect your course grade if you have a high A and might receive an A+. Finish the rest of the exam first!' },
      { p: 'Write one line of code just after triple(print)(5) that would double and add one to all numbers in the answers to parts (b) and (c) above. For example, for an answer containing 100, it would now contain 201 instead.' },
      { p: 'You may not use any numbers or arithmetic symbols (such as + or *) or arithmetic functions (such as add or mul). You may not reassign triple or square. You may use multiple assignment: x, y = ___, ___' }],
    ['print = (lambda f: lambda x: f(double(x)))(inc(print))', 'print = (lambda f: lambda x: inc(f)(double(x)))(print)', 'f, print = inc(print), lambda x: f(double(x))', 'f, print = print, lambda x: inc(f)(double(x))']),
  ]),
  problem('2', 'Which One (8.0 pts)', [{ n: '2', t: ['ENVIRONMENT_DIAGRAMS', 'HIGHER_ORDER_FUNCTIONS', 'LAMBDAS'] }], [
    text('Complete the environment diagram for this code to answer the questions about the calls to print. Only the questions will be scored, not the diagram. Each call to print is evaluated once, and there are no errors caused by running this code.'),
    py(`
x, y = 1, 2

def this(x):
    x = 3
    print(y)
    return 4

def which(x, f):
    def this(x):
        x = 5
        return y
    y = 6
    y = f(x)
    print(this(y))
    return lambda: (print(x) or y)

print(which(7, this)())`, null, { ln: true }),
    blank(5, '(a) What is displayed by the call to print on line 5?', '2'),
    blank(6, '(b) What is displayed by the call to print on line 14?', '4'),
    blank(7, '(c) What is displayed by the call to print on line 15?', '7'),
    blank(8, '(d) What is displayed by the call to print on line 17?', '4'),
  ]),
  problem('3', 'Legit Digit (13.0 pts)', [{ n: '3a', t: ['CONTROL', 'HIGHER_ORDER_FUNCTIONS'] }, { n: '3b', t: ['HIGHER_ORDER_FUNCTIONS', 'LAMBDAS'] }, { n: '3c', t: ['CONTROL'] }], [
    h('(a) (4.0 points)'),
    text('Implement all_digits, which takes a positive integer n and one-argument function cond that always returns True or False. It returns True if cond(d) returns True when called on every digit d in n, and False otherwise.'),
    py(`
def all_digits(n, cond):
    """Return whether cond returns true for every digit of positive n.

    >>> odd = lambda d: d % 2 == 1
    >>> all_digits(123, odd) # not all digits are odd
    False
    >>> all_digits(357, odd) # all digits are odd
    True
    """
    while n:
        if ⟪a⟫:
            ⟪b⟫
        n = n // 10
    return ⟪c⟫`, { a: 'not cond(n % 10)', b: 'return False', c: 'True' }),
    blank(9, 'i. Fill in blank (a).', 'not cond(n % 10)', { r: 'a' }),
    mc(10, 'ii. Fill in blank (b).', ['n = n % 10', 'n = n * 10', 'return True', 'return False', 'return odd', 'return cond'], 3),
    mc(11, 'iii. Fill in blank (c).', ['n', 'True', 'False', 'odd(n)', 'cond(n)'], 1),
    h('(b) (3.0 points)'),
    text('Definition. A prefix of a positive integer n is the value of n//pow(10, p) for some non-negative integer p. For example, 3456 has prefixes 3456, 345, 34, 3, and 0.',
      'Implement prefix_digits, which takes a positive integer n and a one-argument function cond that always returns True or False. It returns the largest prefix of n for which cond returns True when called on every digit of the prefix. You may call all_digits and process.'),
    py(`
def process(n, check):
    """A function to help implement prefix_digits."""
    while n:
        if check(n):
            return n
        n = n // 10
    return 0

def prefix_digits(n, cond):
    """Return the largest prefix of positive n for which cond returns true for every digit.

    >>> odd = lambda d: d % 2 == 1
    >>> prefix_digits(94720, odd)
    9
    >>> prefix_digits(919321, odd)
    9193
    >>> prefix_digits(2025, odd)
    0
    >>> prefix_digits(20252025, lambda d: d < 4)
    202
    >>> prefix_digits(20252025, lambda d: True)
    20252025
    """
    return process(n, lambda k: ⟪d⟫)`, { d: 'all_digits(k, cond)' }),
    mc(12, 'i. Fill in blank (d).', ['all_digits(n, cond)', 'all_digits(k, cond)', 'all_digits(n, cond(n))', 'all_digits(k, cond(k))', 'lambda cond: all_digits(n, cond)', 'lambda cond: all_digits(k, cond)', 'lambda cond: all_digits(n, cond(n))', 'lambda cond: all_digits(k, cond(k))', 'all_digits(n, lambda n: cond)', 'all_digits(k, lambda n: cond)', 'all_digits(n, cond(lambda n: n))', 'all_digits(k, cond(lambda n: k))'], 1),
    h('(c) (6.0 points)'),
    text('Re-implement prefix_digits, which takes a positive integer n and a one-argument function cond that always returns True or False. It returns the largest prefix of n for which cond returns True when called on every digit of the prefix. You may not call all_digits or process.'),
    py(`
def prefix_digits(n, cond):
    """Return the largest prefix of positive n for which cond returns true for every digit.

    >>> odd = lambda d: d % 2 == 1
    >>> prefix_digits(94720, odd)
    9
    >>> prefix_digits(919321, odd)
    9193
    >>> prefix_digits(2025, odd)
    0
    >>> prefix_digits(20252025, lambda d: d < 4)
    202
    """
    k = 0
    while n >= ⟪e⟫:
        if cond(⟪f⟫):
            k += 1
        else:
            n = n // 10
            ⟪g⟫
    return n`, { e: 'pow(10, k)', f: 'n // pow(10, k) % 10', g: 'k = 0' }),
    mc(13, 'i. Fill in blank (e).', ['0', 'k', 'k // 10', 'pow(10, k)'], 3),
    mc(14, 'ii. Fill in blank (f).', ['n % 10', 'n // 10 % 10', 'n % pow(10, k)', 'n // pow(10, k)', 'n // 10 % pow(10, k)', 'n // pow(10, k) % 10'], 5),
    blank(15, 'iii. Fill in blank (g). You may not call all_digits or process.', 'k = 0', { r: 'g' }),
  ], { run: true }),
  problem('4', 'Hailstone Returns (4.0 pts)', [{ n: '4', t: ['CONTROL'] }], [
    text('Definition. A hailstone sequence is formed by picking a positive integer n as the start then repeatedly updating n until it is 1 using this rule: if n is even, divide it by 2; if n is odd, multiply it by 3 and add 1.',
      'Implement hailstone, which prints each update in a hailstone sequence by displaying: the update number (counting up from 1), the current n, an -> arrow symbol, and the updated n.',
      'This implementation may not be possible using the template. If that’s the case, respond Impossible to the following questions.'),
    py(`
def hailstone(n):
    """Print numbered updates in the hailstone sequence.

    >>> hailstone(10)
    1 10 -> 5
    2 5 -> 16
    3 16 -> 8
    4 8 -> 4
    5 4 -> 2
    6 2 -> 1
    """
    def f():
        if n % 2 == 1:
            m = 3 * n + 1
        else:
            m = n // 2
        ⟪a⟫
        ⟪b⟫
    k = 1
    while n > 1:
        k, n = k + 1, f()`, { a: "print(k, n, '->', m)", b: 'return m' }),
    mc(16, '(a) Fill in blank (a).', ['print(k, n, ->, m)', "print(k, n, '->', m)", 'print(k - 1, n, ->, m)', "print(k - 1, n, '->', m)", 'Impossible'], 1),
    blank(17, '(b) Fill in blank (b). If the problem is not possible using the template, write Impossible.', 'return m', { r: 'b' }),
  ], { run: true }),
  problem('5', 'It Takes Two (4.0 pts)', [{ n: '5', t: ['CONTROL'] }], [
    text('Implement at_least_two, which takes three arguments. It returns True if at least two of them are true values and False otherwise. The built-in bool function takes one argument and returns True if it is a true value and False if it is a false value.'),
    py(`
def at_least_two(x, y, z):
    """Returns whether at least two of the arguments are true values.

    >>> at_least_two(1 + 1, 3 + 3, 5 + 5)
    True
    >>> at_least_two(1 + 1, 3 - 3, 5 + 5)
    True
    >>> at_least_two(1 - 1, 3 + 3, 5 + 5)
    True
    >>> at_least_two(1 - 1, 3 + 3, 0)
    False
    >>> at_least_two(1 - 1, 0, 0)
    False
    """
    if ⟪a⟫:
        return ⟪b⟫
    else:
        return ⟪c⟫`, { a: 'x', b: 'bool(y or z)', c: 'bool(y and z)' }),
    mc(18, '(a) Fill in blank (a).', ['x', 'x == True', 'x and y', 'x == True and y == True'], 0),
    sata(19, '(b) Fill in blank (b). Select all correct answers.', ['y or z', 'y and z', 'bool(y or z)', 'bool(y and z)', 'not(y or z)', 'not(y and z)'], [2]),
    sata(20, '(c) Fill in blank (c). Select all correct answers.', ['y or z', 'y and z', 'bool(y or z)', 'bool(y and z)', 'not(y or z)', 'not(y and z)'], [3]),
  ], { run: true }),
]);
