// Fall 2026 Midterm 1 (Mon 9/14/2026), transcribed from the official exam and solutions.
// Multiple-choice keys were read from the filled bubbles in the solutions PDF; code answers are checked by doctests.
import { exam, problem, text, py, blank, mc, h } from '../author.mjs';

const WWPD = 'Complete this What Would Python Display example by writing what the interactive interpreter would display on each blank line. For a function value, write FUNCTION. If an error occurs, write ERROR. There are no score penalties in this question for extra/missing quotation marks or apostrophes.';

export default exam('61a-fa26-mt1', 'Fall 2026 Midterm 1', 'fa26/mt1/61a-fa26-mt1', 'fa26-mt1', [
  problem('1', 'What Would Python Display? (6.0 pts)', [{ n: '1', t: ['LAMBDAS', 'WWPD', 'CONTROL'] }], [
    text(WWPD),
    py(`
>>> z = 'but'
>>> f = lambda g: g(z)
>>> z = 'so'
>>> x, y = print(1 or 2), (3 and 0)
⟪a⟫
>>> print(print(x, '=', y), '+', f(print), '= zero?')
⟪b⟫
⟪c⟫
⟪d⟫`, { a: '1', b: 'None = 0', c: 'so', d: 'None + None = zero?' }),
    blank(1, '(a) Fill in blank (a).', '1'),
    blank(2, '(b) Fill in blank (b).', 'None = 0'),
    blank(3, '(c) Fill in blank (c).', 'so'),
    blank(4, '(d) Fill in blank (d).', 'None + None = zero?'),
  ]),
  problem('2', 'New Print (4.0 pts)', [{ n: '2', t: ['ENVIRONMENT_DIAGRAMS', 'HIGHER_ORDER_FUNCTIONS'] }], [
    text('Your friend hates that print returns None! They’ve tried to fix it…',
      'Write what is displayed by this code. It’s recommended, but not required, that you draw an environment diagram. The answer is the same whether it is run in a file or in an interactive interpreter. This code does not run forever or error.'),
    py(`
def new_print(print):
    """Return a better print that returns its argument"""
    def f(x):
        value = print(x)
        if value != None:
            return print('What?')
        return x
    return f

og = print
print = new_print(print)
print = new_print(print)
og('print returned', print(2))`),
    blank(5, 'What is displayed? Put each printed line on its own line.', '2\nWhat?\nprint returned What?'),
  ]),
  problem('3', 'Long Odds (4.0 pts)', [{ n: '3', t: ['CONTROL'] }], [
    text('Definition. A group is a consecutive sequence of digits that are either all odd or all even.',
      'Implement num_long_groups, which takes positive integers n and k. It returns the number of groups in n that have at least k digits. A group that is fully within another group is not counted. For example, 15732429999 has three groups: 1573, 242, and 9999. There are 3 groups with at least 3 digits, but only 2 groups with at least 4 digits, and 0 groups with at least 5 digits.',
      'You may not write str, len, if, else, [, ], 3, 4, 5, 6, 7, 8, or 9 in your answers.'),
    py(`
def num_long_groups(n, k):
    """Return the number of groups of consecutive digits of n that are either all odd or all even
    and have at least k digits.

    >>> num_long_groups(15732429999, 3) # 1573 and 242 and 9999
    3
    >>> num_long_groups(15732429999, 4) # 1573 and 9999
    2
    >>> num_long_groups(15732429999, 5) # No group has 5 digits
    0
    >>> num_long_groups(15732429999, 1) # All 3 groups have at least 1 digit
    3
    """
    assert n > 0 and k > 0, 'n and k must be positive.'
    group_size, count = 0, 0
    while n:
        group_size += 1
        if ⟪a⟫:
            count += 1
        if ⟪b⟫:
            group_size = 0
        n = n // 10
    return count`, { a: 'group_size == k', b: 'n % 2 != n // 10 % 2' }),
    mc(6, '(a) Fill in blank (a).', ['group_size < k', 'group_size <= k', 'group_size > k', 'group_size >= k', 'group_size == k', 'group_size != k', 'group_size % k == 0', 'group_size % k != 0'], 4),
    blank(7, '(b) Fill in blank (b).', 'n % 2 != n // 10 % 2', { r: 'b' }),
  ], { run: true }),
  problem('4', 'Space Between (6.0 pts)', [{ n: '4', t: ['HIGHER_ORDER_FUNCTIONS', 'LAMBDAS'] }], [
    text('You may not write if, else, [, ], for, or range in your answers. You may use built-in functions: min, max, pow, abs, etc.'),
    h('(a) Q4.1'),
    text('Implement gap, which takes an integer n larger than 1 and a one-argument function term. It returns the largest absolute difference between any two consecutive terms in the sequence created by passing the numbers from 1 up to n (including n) to term.'),
    py(`
def gap(n, term):
    """Return the largest absolute difference between consecutive terms of term(1), term(2), ..., term(n).

    >>> gap(5, lambda x: x * x) # 1, 4, 9, 16, 25: 25 - 16
    9
    >>> gap(6, lambda x: x % 4) # 1, 2, 3, 0, 1, 2: 3 - 0
    3
    >>> gap(4, lambda x: -x) # -1, -2, -3, -4: every gap is 1
    1
    """
    k, largest = 1, 0
    while ⟪a⟫:
        largest = ⟪b⟫
        k = k + 1
    return largest`, { a: 'k < n', b: 'max(largest, abs(term(k + 1) - term(k)))' }),
    mc(8, 'i. Fill in blank (a).', ['k < n - 1', 'k < n', 'k < n + 1', 'k < n + 2'], 1),
    blank(9, 'ii. Fill in blank (b).', 'max(largest, abs(term(k + 1) - term(k)))', { r: 'b' }),
    h('(b) Q4.2'),
    text('Implement odd_gap, which takes an integer n larger than 2 and a one-argument function term. It returns the largest absolute difference between any two consecutive terms in the sequence created by passing only the odd numbers from 1 up to n (including n if n is odd) to term. The odd_gap function calls the gap function.'),
    py(`
def odd_gap(n, term):
    """Return the largest absolute difference between consecutive terms of term(1), term(3), term(5), ...

    >>> odd_gap(5, lambda x: x * x) # term(1) = 1, term(3) = 9, term(5) = 25: 25 - 9
    16
    >>> odd_gap(8, lambda x: x % 5) # term(1) = 1, term(3) = 3, term(5) = 0, term(7) = 2: 3 - 0
    3
    """
    return gap((n + 1) // 2, ⟪c⟫)`, { c: 'lambda k: term(2 * k - 1)' }),
    blank(10, 'i. Fill in blank (c).', 'lambda k: term(2 * k - 1)', { r: 'c' }),
    h('(c) Q4.3 A+ question (0 points)'),
    text('This A+ question is not worth any points. It can only affect your course grade if you have a high A and might receive an A+. Finish the rest of the exam first!',
      'Implement make_gap, which uses gap and the helper function f that is implemented below. make_gap takes a one-argument function use and returns a two-argument function. The returned function takes an integer n and a one-argument function term, and it returns the largest absolute difference between any two consecutive terms in the sequence created by passing to the term function only the numbers 1 up to n for which use returns a true value. Assume that use returns a true value for at least two of those numbers.',
      'You may not write for, :=, [, ], if, else, and, or, map, filter, or range in your solution. Hint: Call f twice with different go and then arguments.'),
    py(`
def f(use, go, then):
    """Helper for make_gap."""
    y, i = 0, 0
    while go(y, i):
        i += 1
        if use(i):
            y += 1
    return then(y, i)

def make_gap(use):
    """Return a gap function that only includes term(i) in the sequence when use(i) is a true value.

    >>> odd = lambda i: i % 2 == 1
    >>> odd_gap = make_gap(odd)  # this odd_gap has the same behavior as the one you defined before
    >>> odd_gap(8, lambda x: x % 5)  # 1, 3, 0, 2: 3 - 0
    3
    """
    return lambda n, term: gap(⟪d⟫)`, { d: 'f(use, lambda y, i: i < n, lambda y, i: y), lambda k: term(f(use, lambda y, i: y < k, lambda y, i: i))' }),
    blank(11, 'i. Fill in the blank in make_gap (the arguments to gap).', 'f(use, lambda y, i: i < n, lambda y, i: y), lambda k: term(f(use, lambda y, i: y < k, lambda y, i: i))', { r: 'd' }),
  ], { run: true }),
]);
