// Summer 2024 Midterm (the summer term's only midterm), transcribed from the official exam and solutions.
// The staff topic index lists this exam as "su24-mt2" (problem 1 under "11"). Problem 8 (Just for Fun, a drawing) isn't
// included. Problem 4's blank letters repeat across parts, so part (b)'s are relettered; labels give the exam's own.
import { exam, problem, text, py, blank, mc, sata, h } from '../author.mjs';
import { TREE_ADT } from '../trees.mjs';

const TF = ['True', 'False'], TFE = ['True', 'False', 'Error'];
const ADD_CONSECUTIVE_TESTS = `
    """
    >>> add_consecutive(123456789)
    [45]
    >>> add_consecutive(567231) # [5 + 6 + 7, 2 + 3, 1]
    [18, 5, 1]
    >>> add_consecutive(111) # repeated digits are not consecutive
    [1, 1, 1]
    >>> add_consecutive(1235689)
    [6, 11, 17]
    >>> add_consecutive(3216598)
    [6, 11, 17]
    >>> add_consecutive(13579)
    [1, 3, 5, 7, 9]
    >>> add_consecutive(12321) # [1 + 2 + 3 + 2 + 1]
    [9]
    >>> add_consecutive(4)
    [4]
    >>> add_consecutive(105)
    [1, 5]
    >>> add_consecutive(135797531)
    [1, 3, 5, 7, 9, 7, 5, 3, 1]
    """`.replace(/^\n/, '');
const MULTI_COMPOSE = `
def safe_compose(f, g):
    """
    >>> composed = safe_compose(lambda x: x + 1, lambda x: x * 2)
    >>> composed(5)
    11
    >>> safe_compose(lambda x: x, None) is None and safe_compose(None, lambda x: x) is None
    True
    """
    if f is None or g is None:
        return None
    def composed(x):
        return f(g(x))
    return composed

def multi_compose(funcs, x, y):
    """
    >>> add_one, double = lambda x: x + 1, lambda x: x * 2
    >>> sub_three, square = lambda x: x - 3, lambda x: x ** 2
    >>> list_of_funcs = [add_one, double, sub_three, square]
    >>> double_then_square = multi_compose(list_of_funcs, 3, 36)
    >>> double_then_square
    Function
    >>> double_then_square(1) # (1 * 2) ** 2 --> 4
    4
    >>> square_then_double = multi_compose(list_of_funcs, 3, 18)
    >>> square_then_double # None
    >>> all_funcs = multi_compose(list_of_funcs, 3, 25)
    >>> all_funcs(1) # (((1 + 1) * 2) - 3) ** 2 --> 1
    1
    >>> double = multi_compose(list_of_funcs, 50, 100)
    >>> double(1) # 1 * 2 --> 2
    2
    >>> sub_two = multi_compose(list_of_funcs, 50, 48)
    >>> sub_two(2) # 2 - 2 --> 0
    0
    >>> double_then_sub = multi_compose(list_of_funcs, 50, 97)
    >>> double_then_sub(1) # (1 * 2) - 3 --> -1
    -1
    >>> negate = multi_compose(list_of_funcs, 100, -100)
    >>> negate # None
    """
    if x == y:
        return lambda x: ⟪a⟫
    if ⟪b⟫:
        return None
    return ⟪c⟫ or multi_compose(⟪d⟫)`;

const e = exam('61a-su24-midterm', 'Summer 2024 Midterm', 'su24/mt1/61a-su24-midterm', 'su24-mt2', [
  problem('1', 'Generiterator (12.0 pts)', [{ n: '1a', t: ['GENERATORS', 'HIGHER_ORDER_FUNCTIONS', 'LAMBDAS', 'WWPD'] }, { n: '1b', t: ['GENERATORS', 'HIGHER_ORDER_FUNCTIONS', 'ITERATORS', 'LAMBDAS', 'LISTS', 'WWPD'] }], [
    text('Assume the following code has been executed. No error occurs when executing this code block.'),
    py(`
def f(x):
    yield from map(lambda x: x[::-1], x)

def next_next(i):
    print(next(i))
    return next(i)

def generiterator1(s):
    yield f(s)
    yield from f(s)
    print('warmed up!')

def generiterator2(s):
    while s:
        yield f(s)
        yield iter(s[0])
        s = s[1:]
    print('generiterating complete!')

g_str = generiterator1(['i', '<3', '61a', '!'])
g_num = generiterator2([[1], [1, 2], [1, 2, 3]])`),
    text('What Would Python Display? Write the output displayed by evaluating each expression below. If an error occurs, write "Error", but include all output displayed before the error. If evaluation would run forever, write "Forever". To display an iterator object, write "Iterator". To display a generator object, write "Generator".', 'Assume the expressions are evaluated in order in the same interactive session, and so evaluating an earlier expression may affect the result of a later one.', 'Hint 1: Draw it out!', 'Hint 2: When a string is passed into print, no quotation marks are displayed. When a string is the value of an expression evaluated by the interpreter, quotation marks are displayed. A list of strings always displays quotation marks.'),
    h('(a) (5.0 points) Jester'),
    blank(1, 'i. next(g_str)', 'Generator'),
    blank(2, 'ii. next(g_str)', "'i'"),
    blank(3, 'iii. next_next(g_str)', "3<\n'a16'"),
    blank(4, 'iv. next_next(g_str)', '!\nwarmed up!\nError'),
    h('(b) (7.0 points) Genome'),
    blank(5, 'i. list(next(g_num))', '[[1], [2, 1], [3, 2, 1]]'),
    blank(6, 'ii. next_next(next(g_num))', '1\nError'),
    blank(7, 'iii. next_next(next(g_num))', '[2, 1]\n[3, 2, 1]'),
    blank(8, 'iv. len(list(g_num))', 'generiterating complete!\n3'),
  ]),
  problem('2', 'Conveyor Belt (8.0 pts)', [{ n: '2', t: ['ENVIRONMENT_DIAGRAMS', 'HIGHER_ORDER_FUNCTIONS', 'LISTS', 'MUTABILITY'] }], [
    text('Draw the environment diagram for the code below using box and pointer notation and then answer the questions that follow. Your diagram will not be graded.', 'Hint: If you pass an argument into pop, it uses the argument as the index of the element to remove. If you do not pass an argument into pop, it defaults to popping the last element.'),
    py(`
def conveyor_belt(s):
    k = -1
    while s[k]:
        k = s[0].pop(chain_pop(s[0]))
        s = s[k:]
        if s[0] == box:
            s.append(box or s.append(box))
        else:
            s.append(s.extend(s[:1]))
    return s

def chain_pop(s):
    return s.pop(s.pop(s.pop()))

box = [1, 1, 0, 0]
result = conveyor_belt([box, box[:]])`),
    blank(9, '(a) What would be displayed by evaluating print(result) in the Global frame?', '[[], None, [], None]'),
    mc(10, '(b) What is the result of evaluating box in result in the Global frame?', TF, 0),
    mc(11, '(c) What is the result of evaluating [] in result in the Global frame?', TF, 0),
    mc(12, '(d) What is the result of evaluating None in result in the Global frame?', TF, 0),
    mc(13, '(e) What is the result of evaluating result[0] == result[1] in the Global frame?', TFE, 1),
    mc(14, '(f) What is the result of evaluating result[0] is result[1] in the Global frame?', TFE, 1),
    mc(15, '(g) What is the result of evaluating result[0] == result[2] in the Global frame?', TFE, 0),
    mc(16, '(h) What is the result of evaluating result[0] is result[2] in the Global frame?', TFE, 1),
    mc(17, '(i) What is the result of evaluating not result[0] in the Global frame?', TFE, 0),
  ]),
  problem('3', 'Tree Sum (4.0 pts)', [{ n: '3', t: ['TREES', 'TREE_RECURSION'] }], [
    text('Laryn, Charlotte, and Raymond are working together on a CS 61A problem, but they can’t agree on a solution. Help them determine which implementation(s) are correct, if any.', 'tree_sum is a function that takes in a tree t and a one-argument function cond and returns the sum of all the labels, x, in t for which cond(x) returns True.'),
    py(`
>>> t2 = tree(5, [tree(6), tree(7)])
>>> t1 = tree(3, [tree(4), t2])
>>> tree_sum(t1, lambda x: x >= 4)
22
>>> tree_sum(t1, lambda x: x >= 6)
13
>>> tree_sum(t2, lambda x: x >= 6)
13`),
    py(`
# Attempt 1
def tree_sum1(t, cond):
    if cond(label(t)):
        total = label(t)
    else:
        total = 0
    for b in branches(t):
        if cond(label(b)):
            total += tree_sum1(b, cond)
    return total

# Attempt 2
def tree_sum2(t, cond):
    if cond(label(t)):
        total = label(t)
    else:
        total = 0
    for b in branches(t):
        total += tree_sum2(b, cond)
    return total

# Attempt 3
def tree_sum3(t, cond):
    total = label(t)
    for b in branches(t):
        if cond(label(b)):
            total += tree_sum3(b, cond)
    return total`),
    sata(18, '(a) Which implementation(s) are correct, if any? Select all that apply.', ['tree_sum1 is correct', 'tree_sum2 is correct', 'tree_sum3 is correct', 'tree_sum1, tree_sum2, and tree_sum3 are all incorrect'], [1]),
  ]),
  problem('4', 'Add Consecutive (17.0 pts)', [{ n: '4a', t: ['CONTROL', 'LISTS'] }, { n: '4b', t: ['CONTROL', 'LISTS', 'RECURSION'] }], [
    text('Implement add_consecutive, a function that takes in a positive integer n and returns a list of integers. Each element of the returned list is the sum of adjacent consecutive digits in n. Two digits are adjacent if they are directly beside each other. Two digits are consecutive if the absolute difference between them is exactly 1. Two of the same digit are not considered consecutive.', 'You may not use str or repr or [ or ] or for.'),
    h('(a) (9.0 points) Iterative Add Consecutive'),
    text('Implement add_consecutive iteratively.'),
    py(`
def add_consecutive(n):
${ADD_CONSECUTIVE_TESTS}
    result = []
    subtotal = 0
    while ⟪a⟫:
        rest, last = n // 10, n % 10
        subtotal = ⟪b⟫
        if ⟪c⟫:
            result = ⟪d⟫
            subtotal = ⟪e⟫
        n = rest
    result = ⟪f⟫
    return result`, { a: 'n >= 10', b: 'subtotal + last', c: 'abs((rest % 10) - last) != 1', d: '[subtotal] + result', e: '0', f: '[subtotal + n] + result' }),
    sata(19, 'i. Select all of the expressions below that could fill in blank (a).', ['n', 'n > 0', 'n >= 0', 'n != 0', 'n > 10', 'n >= 10', 'n > 9', 'n >= 9', 'n // 10', 'n % 10'], [5, 6, 8]),
    blank(20, 'ii. Fill in blank (b).', 'subtotal + last', { r: 'b' }),
    blank(21, 'iii. Fill in blank (c).', 'abs((rest % 10) - last) != 1', { r: 'c' }),
    blank(22, 'iv. Fill in blank (d).', '[subtotal] + result', { r: 'd' }),
    sata(23, 'v. Select all of the expressions below that could fill in blank (e).', ['0', 'rest', 'last', 'n', 'subtotal', 'subtotal + rest', 'subtotal + last', 'subtotal + n'], [0]),
    blank(24, 'vi. Fill in blank (f).', '[subtotal + n] + result', { r: 'f' }),
    h('(b) (8.0 points) Recursive Add Consecutive'),
    text('Implement add_consecutive recursively.'),
    py(`
def add_consecutive(n):
${ADD_CONSECUTIVE_TESTS}
    def helper(n, subtotal):
        rest, last = n // 10, n % 10
        subtotal = ⟪g⟫
        if ⟪h⟫:
            return ⟪i⟫
        if ⟪j⟫:
            return helper(⟪k⟫)
        else:
            return ⟪l⟫
    return helper(n, ⟪m⟫)`, { g: 'subtotal + last', h: 'n < 10', i: '[subtotal]', j: 'abs((rest % 10) - last) == 1', k: 'rest, subtotal', l: 'helper(rest, 0) + [subtotal]', m: '0' }),
    sata(25, 'i. Select all of the expressions below that could fill in blank (g) (the exam’s (b)(a)).', ['0', 'rest', 'last', 'n', 'subtotal', 'subtotal + rest', 'subtotal + last', 'subtotal + n'], [6]),
    blank(26, 'ii. Fill in blank (h) (the exam’s (b)(b)).', 'n < 10', { r: 'h' }),
    blank(27, 'iii. Fill in blank (i) (the exam’s (b)(c)).', '[subtotal]', { r: 'i' }),
    blank(28, 'iv. Fill in blank (j) (the exam’s (b)(d)).', 'abs((rest % 10) - last) == 1', { r: 'j' }),
    blank(29, 'v. Fill in blank (k) (the exam’s (b)(e)).', 'rest, subtotal', { r: 'k' }),
    blank(30, 'vi. Fill in blank (l) (the exam’s (b)(f)).', 'helper(rest, 0) + [subtotal]', { r: 'l' }),
    blank(31, 'vii. Fill in blank (m) (the exam’s (b)(g)).', '0', { r: 'm' }),
  ], { run: true }),
  problem('5', 'Combine Tree (7.0 pts)', [{ n: '5', t: ['HIGHER_ORDER_FUNCTIONS', 'TREES', 'TREE_RECURSION'] }], [
    text('Implement combine_tree, a function that takes in a tree t and a two-argument function f and returns a new tree where the label of any node b is the result of calling f on the labels of all the nodes in the subtree rooted at b (including the label of b itself).', 'You may assume that f is an associative function. That is, f(x, y) == f(y, x) for all x and y.'),
    py(`
def combine_tree(t, f):
    """
    >>> from operator import add, mul
    >>> t = tree(1, [tree(2), tree(3, [tree(4), tree(5), tree(6)])])
    >>> sum_tree = combine_tree(t, add)
    >>> print_tree(sum_tree)
    21
        2
        18
            4
            5
            6
    >>> product_tree = combine_tree(t, mul)
    >>> print_tree(product_tree)
    720
        2
        360
            4
            5
            6
    >>> max_tree = combine_tree(t, max)
    >>> print_tree(max_tree)
    6
        2
        6
            4
            5
            6
    """
    if is_leaf(t):
        return ⟪a⟫
    total = ⟪b⟫
    new_branches = []
    for b in branches(t):
        new_b = ⟪c⟫
        new_branches.append(new_b)
        total = ⟪d⟫
    return tree(total, new_branches)`, { a: 't', b: 'label(t)', c: 'combine_tree(b, f)', d: 'f(total, label(new_b))' }),
    mc(32, '(a) Fill in blank (a).', ['t', 'label(t)', '0', '1'], 0),
    sata(33, '(b) Select all of the expressions below that could fill in blank (b).', ['t', 'label(t)', '0', '1', 'f(label(t))', 'f(label(t), label(t))', 'f(0, label(t))', 'f(1, label(t))', 'combine_tree(t, f)', 'f(sum([combine_tree(b, f) for b in branches(t)]), label(t))', 'sum(map(f, [combine_tree(b, f) for b in branches(t)]))'], [1]),
    mc(34, '(c) Fill in blank (c).', ['t', 'b', 'f(t)', 'f(b)', 'f(label(t))', 'f(label(b))', 'f(label(t), label(b))', 'f(label(b), label(t))', 'combine_tree(t, f)', 'combine_tree(b, f)'], 9),
    blank(35, '(d) Fill in blank (d).', 'f(total, label(new_b))', { r: 'd' }),
  ], { run: true, support: [TREE_ADT] }),
  problem('6', 'Multi Compose (11.0 pts)', [{ n: '6', t: ['HIGHER_ORDER_FUNCTIONS', 'LAMBDAS', 'LISTS', 'TREE_RECURSION'] }], [
    text('Implement multi_compose, a function that takes in a list of functions and two integers x and y. It returns a composite function that on input x outputs y by applying a subsequence of functions in the input list. Functions can only be applied in the order in which they appear in the list. That is, the ith-indexed function must be applied before the i+1th-indexed function. Each function can be used 0 or 1 times.', 'If no such composite function exists, return None. If more than one such composite function exists, return any one of them.', 'You may assume x != y. Your solution must use safe_compose, which composes two functions together when called with two functions as arguments and returns None when called with None as an argument.'),
    py(MULTI_COMPOSE, { a: 'x', b: 'not funcs', c: 'safe_compose(multi_compose(funcs[1:], funcs[0](x), y), funcs[0])', d: 'funcs[1:], x, y' }, {
      // The exam's doctest output "Function" isn't valid doctest output; checking accepts any function.
      runCode: MULTI_COMPOSE.replace(/^\n/, '').replace('    Function\n', '    <function ...>\n') }),
    blank(36, '(a) Fill in blank (a).', 'x', { r: 'a' }),
    blank(37, '(b) Fill in blank (b).', 'not funcs', { r: 'b' }),
    blank(38, '(c) Fill in blank (c).', 'safe_compose(multi_compose(funcs[1:], funcs[0](x), y), funcs[0])', { r: 'c' }),
    blank(39, '(d) Fill in blank (d).', 'funcs[1:], x, y', { r: 'd' }),
  ], { run: true }),
  problem('7', 'Memoized Fibonacci Tree (5.0 pts)', [{ n: '7a', t: ['TREES'] }, { n: '7b', t: ['TREES'] }, { n: '7c', t: ['TREES'] }, { n: '7d', t: ['TREES'] }, { n: '7e', t: ['EFFICIENCY'] }], [
    text('Recall the Fibonacci sequence from lecture: fib(n) is 0 if n == 0, 1 if n == 1, and fib(n - 1) + fib(n - 2) otherwise.', 'A Fibonacci Tree is a tree where each label is a Fibonacci number and each non-leaf node has exactly two children: the two Fibonacci numbers that appear directly before it in the Fibonacci sequence.', 'The fib_tree function below takes in a nonnegative integer n and returns a Fibonacci Tree that has root label fib(n). Implement fib_tree_memo, a memoized version of fib_tree.'),
    py(`
def fib_tree(n):
    """
    >>> print_tree(fib_tree(5))
    5
        2
            1
            1
                0
                1
        3
            1
                0
                1
            2
                1
                1
                    0
                    1
    """
    # IMPLEMENTATION OMITTED`, null, { norun: true }),
    text('The exam shows a picture of how the call diagram of fib_tree changes once it is memoized in fib_tree_memo: each repeated subtree is computed once and then looked up, as the doctest below shows.'),
    py(`
def fib_tree_memo(n):
    """
    >>> print_tree(fib_tree_memo(5))
    5
        2
            1
            1
                0
                1
        3
            1
            2
    """
    def helper(n, cache):
        if ⟪a⟫:
            return tree(⟪b⟫)
        if n <= 1:
            return tree(n)
        b0, b1 = helper(n - 2, cache), helper(n - 1, cache)
        fib_num = ⟪d⟫
        ⟪e⟫ = fib_num
        return tree(fib_num, [b0, b1])
    return helper(n, {})`, { a: 'n in cache', b: 'cache[n]', d: 'label(b0) + label(b1)', e: 'cache[n]' }),
    blank(40, '(a) Fill in blank (a).', 'n in cache', { r: 'a' }),
    blank(41, '(b) Fill in blank (b).', 'cache[n]', { r: 'b' }),
    blank(42, '(c) Fill in blank (d).', 'label(b0) + label(b1)', { r: 'd' }),
    blank(43, '(d) Fill in blank (e).', 'cache[n]', { r: 'e' }),
    mc(44, '(e) What is the order of growth of the run time of fib_tree_memo with respect to n?', ['Constant, Θ(1), O(1)', 'Logarithmic, Θ(log n), O(log n)', 'Linear, Θ(n), O(n)', 'Quadratic, Θ(n²), O(n²)', 'Exponential, Θ(bⁿ), O(bⁿ)'], 2),
  ], { run: true, support: [TREE_ADT] }),
]);
export default e;
