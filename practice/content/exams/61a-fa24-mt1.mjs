// Fall 2024 Midterm 1, transcribed from the official exam and solutions.
// Problem 2's code and diagram are an image in the PDF; the diagram's labeled blanks are described in words here.
// Problem 5 reuses the blank letters (a)-(c) in each part; here they are lettered (a)-(e) across the problem.
import { exam, problem, text, py, blank, mc, sata, h } from '../author.mjs';

export default exam('61a-fa24-mt1', 'Fall 2024 Midterm 1', 'fa24/mt1/61a-fa24-mt1', 'fa24-mt1', [
  problem('1', 'What Would Python Display? (8.0 pts)', [{ n: '1', t: ['HIGHER_ORDER_FUNCTIONS', 'LAMBDAS', 'WWPD'] }], [
    text('Answer the following questions about the output printed by this code.'),
    py(`
def mad(max):
    g = lambda: (print(1) or 2) or (print(3) or 4)
    print(max(5, 6))
    return g
print(mad(print)(), 7, print(8))`),
    mc(1, '(a) What is the last line printed?', ['1 7 8', '2 7 8', '2 7 None', '4 7 8', '4 7 None', 'None 7 8', 'None 7 None'], 2),
    sata(2, '(b) Which of these whole lines appear somewhere in the printed output? Select all that apply.', ['1', '1 2', '1 2 3', '1 2 3 4', '3', '5', '5 6', '6', '7', '8', 'None', 'None None', 'True'], [0, 6, 9, 10]),
    mc(3, '(c) What order do 1, 6, and 8 appear in the printed output? These numbers may appear as part of longer lines. If a number appears twice, consider just the first occurrence.', ['1 6 8', '1 8 6', '6 1 8', '6 8 1', '8 1 6', '8 6 1'], 2),
  ]),
  problem('2', 'Which One (8.0 pts)', [{ n: '2', t: ['ENVIRONMENT_DIAGRAMS', 'HIGHER_ORDER_FUNCTIONS'] }], [
    text('Complete the environment diagram for this code and then answer the questions that follow. In the diagram, f1 is the call to switch (parent Global), and f2, f3 and f4 are the three calls to a function named which, in the order they happen. Each question asks about the finished diagram.'),
    py(`
x, y, z = 1, 2, 3

def switch(x):
    z = 4
    if x == y:
        def which(one):
            return x + one
    else:
        def which(one):
            return x - one
    x = which(x)
    which(x)

def which(one):
    return x * one

switch(x+1)
x = 5
which(z)`, null, { ln: true }),
    mc(4, '(a) In frame f1 (switch), the value bound to x.', ['0', '1', '2', '3', '4'], 4),
    mc(5, '(b) In frame f1 (switch), the value bound to which.', ['func which(one) [parent=f1]', 'func which(one) [parent=Global]', 'func which(one) [parent=switch]'], 0),
    blank(6, '(c) The return value of f1 (switch).', 'None'),
    mc(7, '(d) The return value of f2 (which).', ['0', '1', '2', '3', '4'], 4),
    blank(8, '(e) The return value of f3 (which).', '8'),
    mc(9, '(f) The parent of f4 (which).', ['Global', 'f1', 'f2', 'f3', 'f4'], 0),
    mc(10, '(g) In frame f4 (which), the value bound to one.', ['1', '2', '3', '4', '5'], 2),
    blank(11, '(h) The return value of f4 (which).', '15'),
  ]),
  problem('3', 'Final Digit (6.0 pts)', [{ n: '3', t: ['CONTROL'] }], [
    text('Implement final_digit, which takes a non-negative integer n. As long as n has more than one digit, replace n with the sum of the digits of n. This process repeats until n becomes a single-digit number, which is returned.'),
    py(`
def final_digit(n):
    """Sum the digits of n repeatedly to reach one digit.

    >>> final_digit(321)       # 3 + 2 + 1 = 6
    6
    >>> final_digit(987)       # 9 + 8 + 7 = 24, and 2 + 4 = 6
    6
    >>> final_digit(989898989) # The digit sum is 77, 7 + 7 = 14, and 1 + 4 = 5
    5
    """
    while n >= 10:
        s = ⟪a⟫
        ⟪b⟫:
            n, s = n // 10, ⟪c⟫
        ⟪d⟫
    return n`, { a: '0', b: 'while n', c: 's + n % 10', d: 'n = s' }),
    mc(12, '(a) Fill in blank (a).', ['0', 'n', 'n % 10'], 0),
    mc(13, '(b) Fill in blank (b).', ['if s', 'if n', 'while s', 'while n'], 3),
    mc(14, '(c) Fill in blank (c).', ['n', 's // 10', 'n % 10', 's + n % 10', '10 * s + n % 10'], 3),
    blank(15, '(d) Fill in blank (d).', 'n = s', { r: 'd' }),
  ], { run: true }),
  problem('4', 'Close Enough (8.0 pts)', [{ n: '4', t: ['CONTROL'] }], [
    text('Implement close, which takes two non-negative integers m and n. It returns whether m can be changed into n by either inserting one digit, removing one digit, or changing one digit. If m and n are the same number, they are not close.'),
    py(`
def close(m, n):
    """Return whether m can result from starting with n and adding, removing,
    or changing one digit.

    >>> close(3756, 3456) and close(3456, 346) and close(346, 3456) and close(456, 56)
    True
    >>> close(5, 5) or close(3456, 3546) or close(3456, 36) or close(34, 3456) or close(345, 456)
    False
    """
    if m < n:
        m, n = n, m
    while m or n:
        if ⟪a⟫:
            m, n = ⟪b⟫
        else:
            return ⟪c⟫ or ⟪d⟫  # Hint: check here that just one change is enough
    return ⟪e⟫`, { a: 'm % 10 == n % 10', b: 'm // 10, n // 10', c: 'm // 10 == n // 10', d: 'm // 10 == n', e: 'False' }),
    mc(16, '(a) Fill in blank (a).', ['m == n', 'm // 10 == n // 10', 'm // 10 == n', 'm == n // 10', 'm % 10 == n % 10'], 4),
    mc(17, '(b) Fill in blank (b).', ['n, m', 'm // 10, n // 10', 'm // 10, n', 'm, n // 10', 'm % 10, n % 10'], 1),
    mc(18, '(c) Fill in blank (c).', ['m == n', 'm - n < 10', 'n == 0', 'm // 10 == n // 10', 'm % 10 == n % 10', 'm % 100 == n % 100'], 3),
    mc(19, '(d) Fill in blank (d).', ['m // 10 == n', 'm // 10 - n < 10', 'n == 0', 'm // 10 == 0', 'm // 100 == n // 10', '(m // 10) % 10 == n % 10'], 0),
    mc(20, '(e) Fill in blank (e).', ['m == n', 'm == 0', 'n == 0', 'True', 'False'], 4),
  ], { run: true }),
  problem('5', 'Shifty (10.0 pts)', [{ n: '5a', t: ['HIGHER_ORDER_FUNCTIONS', 'LAMBDAS'] }, { n: '5b', t: ['HIGHER_ORDER_FUNCTIONS', 'LAMBDAS'] }, { n: '5c', t: ['HIGHER_ORDER_FUNCTIONS', 'LAMBDAS'] }], [
    h('(a) (4.0 points)'),
    text('Implement shift, which takes a number k and a one-argument function f. It returns a one-argument function g that takes a number x. For all numbers x, g(x) is equal to f(x + k).'),
    py(`
def shift(k, f):
    """Return a function of x that returns f(x+k).

    >>> square = lambda x: x * x
    >>> g = shift(2, square)
    >>> g(3)  # square(3 + 2)
    25
    """
    return ⟪a⟫`, { a: 'lambda x: f(x + k)' }),
    mc(21, 'i. Fill in blank (a).', ['f(x) + k', 'f(x + k)', 'f(lambda x: x + k)', 'f(lambda x: x) + k', 'lambda x: f(x) + k', 'lambda x: f(x + k)', '(lambda x: f(x))(x + k)', 'g(x) + k', 'g(x + k)', 'g(lambda x: x + k)', 'g(lambda x: x) + k', 'lambda x: g(x) + k', 'lambda x: g(x + k)', '(lambda x: g(x))(x + k)'], 5),
    text('ii. Provide an alternate solution for blank (a). This time, your solution must call compose (defined below), and f may not be the operator of a call expression. In other words, you can’t write f( in your answer. You may not write [ or if.'),
    py(`
def compose(f, g):
    """Return a function that takes x and calls f on g of x."""
    return lambda x: f(g(x))`),
    blank(22, 'ii. Your alternate solution for blank (a), which calls compose.', 'compose(f, lambda x: x + k)', { r: 'a' }),
    h('(b) (6.0 points)'),
    text('Implement sum_range, which takes positive integers p and q with p <= q, as well as a one-argument function term. It returns the sum of the return values of term called on each consecutive integer starting with p and ending with q (including both p and q). You may call shift, summation, and compose. Assume shift is implemented correctly.'),
    py(`
def summation(n, term):
    """Sum the first n terms of a sequence: term(1) + term(2) + ... + term(n).

    >>> summation(5, lambda x: x*x) # 1*1 + 2*2 + 3*3 + 4*4 + 5*5
    55
    """
    total, k = 0, 1
    while k <= n:
        total, k = total + term(k), k + 1
    return total

def sum_range(p, q, term):
    """Sum terms p through q of a sequence: term(p) + term(p+1) + ... + term(q).

    >>> sum_range(1, 5, lambda x: x*x) # 1*1 + 2*2 + 3*3 + 4*4 + 5*5
    55
    >>> sum_range(4, 5, lambda x: x*x) # 4*4 + 5*5
    41
    >>> sum_range(5, 5, lambda x: x*x) # 5*5
    25
    """
    assert p <= q
    return ⟪b⟫(⟪c⟫, ⟪d⟫)`, { b: 'summation', c: 'q - p + 1', d: 'shift(p - 1, term)' }),
    mc(23, 'i. Fill in blank (b) (the exam’s (b)(a)).', ['summation', 'shift', 'compose', 'term'], 0),
    mc(24, 'ii. Fill in blank (c) (the exam’s (b)(b)).', ['p - q - 1', 'p - q', 'p - q + 1', 'q - p - 1', 'q - p', 'q - p + 1'], 5),
    blank(25, 'iii. Fill in blank (d) (the exam’s (b)(c)).', 'shift(p - 1, term)', { r: 'd' }),
    h('(c) A+ question (0.0 points)'),
    text('This A+ question is not worth any points. It can only affect your course grade if you have a high A and might receive an A+. Finish the rest of the exam first!',
      'The shifter function below is a curried version of shift. Implement unshift, which takes the result of shifter(k) for some number k. It returns a function that takes the result of shifter(k)(f) for some function f and returns a function equivalent to f. That is: f(x) == unshift(shifter(k))(shifter(k)(f))(x)',
      'Your answer must be a call to shift. You may also call any of compose, summation, or sum_range. Hint: If you can compute k, then you can shift backward by k to undo the original shift.'),
    py(`
def shifter(k):
    def shifted(f):
        return shift(k, f)
    return shifted

def unshift(shifted):
    """Assume shifted is the return value of shifter(k) for some k.

    >>> cubic = lambda x: x*x*x - 5*x*x + 1  # Some complicated function
    >>> cubic(2.0)
    -11.0
    >>> cubic(9.0)
    325.0
    >>> do = shifter(4)
    >>> do(cubic)(2.0)        # same as cubic(6.0)
    37.0
    >>> do(cubic)(9.0)        # same as cubic(13.0)
    1353.0
    >>> undo = unshift(do)
    >>> undo(do(cubic))(2.0)  # same as cubic(2.0)
    -11.0
    >>> undo(do(cubic))(9.0)  # same as cubic(9.0)
    325.0
    """
    return lambda g: ⟪e⟫`, { e: 'shift(-shifted(lambda x: x)(0), g)' }),
    blank(26, 'i. Fill in blank (e) with a single call to shift.', ['shift(-shifted(lambda x: x)(0), g)', 'shifter(-shifted(lambda x: x)(0))(g)'], { r: 'e' }),
  ], { run: true }),
]);
