// Summer 2023 Midterm (the summer term's only midterm), problems 3-5, transcribed from the official exam and solutions.
// The staff topic index lists this exam as "su23-mt2". Problems 1, 2 and 6 aren't imported (see `omitted`).
// Erratum: the official answer to 3(b)(iii) is "pow(10, i) * n % 10", which Python evaluates as (pow(10, i) * n) % 10
// and which fails the doctests; the explanation on that question says so, and both forms are accepted.
import { exam, problem, text, py, blank, mc, h } from '../author.mjs';

const RULE = 'You may not use str or repr or [ or ] or for.';
const e = exam('61a-su23-midterm', 'Summer 2023 Midterm', 'su23/mt1/61a-su23-midterm', 'su23-mt2', [
  problem('3', 'Digit Widgets (13.0 pts)', [{ n: '3a', t: ['CONTROL', 'HIGHER_ORDER_FUNCTIONS', 'RECURSION'] }, { n: '3b', t: ['CONTROL', 'HIGHER_ORDER_FUNCTIONS'] }, { n: '3c', t: ['CONTROL', 'HIGHER_ORDER_FUNCTIONS'] }], [
    text('In this question, we will be testing your understanding of both iterative and recursive solutions. Hint: pow(b, n) raises b to the power of n. For example, pow(10, 3) is 1000.'),
    h('(a) (5.0 points)'),
    text('Implement the recursive version of digit_widget which takes digit d. It returns a function with positive integer parameter n that removes all instances of d from n. ' + RULE),
    py(`
def digit_widget(d):
    """
    Given a digit D, returns a function which accepts positive integer N that removes
    all instances of D from N. If there are no digits remaining in N, return 0.

    >>> remove_5s = digit_widget(5)
    >>> remove_5s(1234512345)
    12341234
    >>> remove_5s(55555)
    0
    >>> remove_0s = digit_widget(0)
    >>> remove_0s(102001)
    121
    >>> remove_0s(900)
    9
    >>> remove_0s(0)
    0
    """
    def remove_digit(n):
        if ⟪a⟫:
            return ⟪b⟫
        if n % 10 == ⟪c⟫:
            return ⟪d⟫
        return ⟪e⟫
    return ⟪f⟫`, { a: 'n == 0', b: '0', c: 'd', d: 'remove_digit(n // 10)', e: 'remove_digit(n//10) * 10 + n % 10', f: 'remove_digit' }),
    mc(1, 'i. Fill in blank (a).', ['n == d', 'n == 0', 'n % 10 == 0', 'n > 0', 'n >= 0', 'n < 0'], 1),
    mc(2, 'ii. Fill in blank (b).', ['0', '1', 'd', 'n - 1', 'pow(10, d)', 'pow(10, n)'], 0),
    mc(3, 'iii. Fill in blank (c).', ['0', '1', 'd', 'n - 1', 'pow(10, d)', 'pow(10, n)'], 2),
    mc(4, 'iv. Fill in blank (d).', ['remove_digit(n % d)', 'remove_digit(n // 10)', 'remove_digit(n % 10)', 'remove_digit(n - 1)', 'remove_digit(n % pow(10, d))', 'remove_digit(n // pow(10, d))'], 1),
    blank(5, 'v. Fill in blank (e).', 'remove_digit(n//10) * 10 + n % 10', { r: 'e' }),
    blank(6, 'vi. Fill in blank (f).', 'remove_digit', { r: 'f' }),
    h('(b) (5.0 points)'),
    text('Implement the iterative version of digit_widget, digit_widget_iter, which takes digit d. It returns a function with positive integer parameter n that removes all instances of d from n. ' + RULE),
    py(`
def digit_widget_iter(d):
    """
    Given a digit D, returns a function which accepts positive integer N that removes
    all instances of D from N. If there are no digits remaining in N, return 0.

    >>> remove_5s = digit_widget_iter(5)
    >>> remove_5s(1234512345)
    12341234
    >>> remove_5s(55555)
    0
    >>> remove_0s = digit_widget_iter(0)
    >>> remove_0s(102001)
    121
    >>> remove_0s(900)
    9
    >>> remove_0s(0)
    0
    """
    def remove_digit(n):
        result, i = 0, 0
        while ⟪g⟫:
            if ⟪h⟫:
                result += ⟪i⟫
                ⟪j⟫
            ⟪k⟫
        return result
    return ⟪l⟫`, { g: 'n > 0', h: 'n % 10 != d', i: 'pow(10, i) * (n % 10)', j: 'i += 1', k: 'n = n // 10', l: 'remove_digit' }),
    mc(7, 'i. Fill in blank (a) (lettered (g) in the code).', ['n == d', 'n == 0', 'n % 10 == 0', 'n > 0', 'n >= 0', 'n < 0'], 3),
    mc(8, 'ii. Fill in blank (b) (lettered (h) in the code).', ['n % 10 == 0', 'n // 10 != 0', 'n % 10 == d', 'n % 10 != d', 'n % pow(10, d) == 0', 'n // 10 == pow(10, d)'], 3),
    blank(9, 'iii. Fill in blank (c) (lettered (i) in the code).', ['pow(10, i) * (n % 10)', 'pow(10, i) * n % 10'], { r: 'i', x: 'The official solutions give pow(10, i) * n % 10. Python evaluates that as (pow(10, i) * n) % 10, which fails the doctests, so this site shows the parenthesized form the solution intends and accepts both.' }),
    mc(10, 'iv. Fill in blank (d) (lettered (j) in the code).', ['n = n % pow(10, i)', 'i = pow(10, i)', 'i += 1', 'n = n % 10', 'n = n // 10', 'n -= 1'], 2),
    mc(11, 'v. Fill in blank (e) (lettered (k) in the code).', ['n = n % pow(10, i)', 'i = pow(10, i)', 'i += 1', 'n = n % 10', 'n = n // 10', 'n -= 1'], 4),
    blank(12, 'vi. Fill in blank (f) (lettered (l) in the code).', 'remove_digit', { r: 'l' }),
    h('(c) (3.0 points)'),
    text('Implement digit_machine, which takes a positive integer n. It returns n where all instances of 4 and 8 have been removed. ' + RULE + ' Assume digit_widget is implemented correctly (and you may use it).'),
    py(`
def digit_machine(n):
    """
    Given an integer N, return a modified N such that all instances of 4 and 8 have been removed.

    >>> digit_machine(484848)
    0
    >>> digit_machine(123456789)
    1235679
    >>> digit_machine(208)
    20
    """
    return ⟪m⟫`, { m: 'digit_widget(4)(digit_widget(8)(n))' }),
    blank(13, 'i. Fill in blank (a) (lettered (m) in the code).', ['digit_widget(4)(digit_widget(8)(n))', 'return digit_widget(4)(digit_widget(8)(n))'], { r: 'm', x: 'The official solution writes return digit_widget(4)(digit_widget(8)(n)), repeating the return already in the code.' }),
  ], { run: true }),
  problem('4', 'Goatda (8.0 pts)', [{ n: '4', t: ['HIGHER_ORDER_FUNCTIONS', 'LAMBDAS', 'RECURSION'] }], [
    text('This question will test the debugging skills you’ve learned in the class so far. We have included an implementation of the goatda function which accepts a single argument function lamb and a non-negative integer n. It returns a single argument function that applies lamb to the argument n times. However, the included implementation is buggy!'),
    py(`
def goatda(lamb, n):
    """
    Implement goatda which accepts LAMB, a single argument function, and N the number of times
    to apply LAMB. Return a single argument function that applies LAMB to the argument N times.

    >>> add3 = goatda(lambda x: x+1, 3)
    >>> add3(10) # (((10 + 1) + 1) + 1)
    13
    >>> add3(2) # (((2 + 1) + 1) + 1)
    5
    >>> print2 = goatda(print, 2)
    >>> print2("hi") # print(print("hi"))
    hi
    None
    >>> identity = goatda(lambda x: x+3, 0) # The function is applied 0 times
    >>> identity(0)
    0
    """
    if n == 0:                                # line 1
        return lambda x: x                    # line 2
    return lambda x: lamb(goatda(lamb, n-1))  # line 3`),
    text('(a) After implementing goatda, we execute the following lines of code in the terminal.'),
    py(`
>>> add3 = goatda(lambda x: x+1, 3)
>>> add3(10)`),
    text('The call to add3(10) results in an error!'),
    mc(14, 'i. What kind of error does this result in?', ['RecursionError: too much recursion', 'TypeError: unsupported operand type(s)', "TypeError: 'NoneType' object is not callable", 'IndentationError', 'IndexError', 'NameError'], 1, { part: 'a' }),
    mc(15, 'ii. Let’s modify the code, so that it no longer errors. Select how to replace the 3 lines, so that the function passes the doctests and no longer errors. Select No change if you do not want to modify the line. Indentation will remain the same. How would you modify line 1?', ['if n > 0:', 'if n < 0:', 'if n >= 0:', 'if n % 10 > 0:', 'if n % 10 >= 0:', 'if lamb(n) == 0:', 'if lamb(n):', 'No change'], 7, { part: 'a' }),
    mc(16, 'iii. How would you modify line 2?', ['return lamb(n)', 'return n', 'return lambda x: n', 'return lambda x: 0', 'return lambda x: lamb(x)', 'return lambda x: lambda y: lamb(y)', 'No change'], 6, { part: 'a' }),
    mc(17, 'iv. How would you modify line 3?', ['return goatda(lamb, lamb(n-1))', 'return lamb(goatda(lamb, n-1))', 'return lambda x: lamb(x) + goatda(lamb, n-1)', 'return lambda x: goatda(lamb(x), n-1)', 'return lambda x: lamb(goatda(lamb, n-1)(x))', 'return lambda x: goatda(lamb, n-1)(n)', 'No change'], 4, { part: 'a' }),
  ]),
  problem('5', 'Sweetness Overload (13.0 pts)', [{ n: '5a', t: ['RECURSION'] }, { n: '5b', t: ['HIGHER_ORDER_FUNCTIONS', 'TREE_RECURSION'] }, { n: '5c', t: ['TREE_RECURSION'] }], [
    h('(a) (3.0 points)'),
    text('Implement donut_tower which takes in the number of donuts n and positive integer k. It returns the number of layers one can fill using n donuts, given the smallest layer consists of k donuts and each subsequent layers consists of one more donut than the previous one. For instance, if n is 16 and k is 2, then you can create 4 layers using 14 donuts.'),
    py(`
def donut_tower(n, k):
    """
    Given non-zero numbers N and K, returns the number of donut layers
    that can be formed using N donuts and K-donut smallest layer

    >>> donut_tower(0, 3)
    0
    >>> donut_tower(1, 1)
    1
    >>> donut_tower(10, 2) # 2 + 3 + 4 = 9 donuts
    3
    >>> donut_tower(20, 3) # 3 + 4 + 5 + 6 = 18 donuts
    4
    """
    if ⟪a⟫:
        return ⟪b⟫
    else:
        return 1 + ⟪c⟫`, { a: 'n < k', b: '0', c: 'donut_tower(n - k, k + 1)' }),
    mc(18, 'i. Fill in blank (a).', ['n < k', 'n >= k', 'n > k', 'n == 1', 'n == 0', 'n < 1'], 0),
    blank(19, 'ii. Fill in blank (b).', '0', { r: 'b' }),
    mc(20, 'iii. Fill in blank (c).', ['max(donut_tower(n, k + 1), donut_tower(n - k, k))', 'donut_tower(n, k + 1)', 'donut_tower(n - k, k + 1)', 'donut_tower(n - k, k)', 'donut_tower(n - k + 1, k)', 'donut_tower(n - 1, k)'], 2),
    h('(b) (4.0 points)'),
    text('Implement alternating_tower, which takes a positive integer c, the number of cupcakes, positive integer b, the number of brownies, and k, the size of the smallest layer that can hold k donuts. It returns the maximum numbers of dessert layers that can be formed using brownies and cupcakes. Since those items are smaller than donuts, each k-sized donut layer can hold twice as many cupcakes and thrice as many brownies. Also, a dessert tower has alternating layers of brownies and cupcakes, but the first layer must always consist of brownies. For instance, if b is 20, c is 20 and k is 2, then you can create a maximum of 4 layers using 18 brownies and 16 cupcakes.'),
    py(`
def alternating_tower(b, c, k):
    """
    >>> alternating_tower(5, 4, 1) # 1st layer has 3 brownies, 2nd layer has 4 cupcakes
    2
    >>> alternating_tower(10, 15, 3) # 1st layer has 9 brownies, 2nd layer has 8 cupcakes
    2
    >>> alternating_tower(16, 6, 5) # 1st layer has 15 brownies
    1
    """
    def helper(b_item, c_item, curr_layer, is_cupcakes):
        if ⟪d⟫:
            return 0
        elif is_cupcakes:
            return ⟪e⟫
        else:
            return 1 + helper(⟪f⟫, c_item, curr_layer + 1, not is_cupcakes)
    return helper(⟪g⟫, c, k + 1, True)`, { d: 'b_item < 0 or c_item < 0', e: '1 + helper(b_item, c_item - 2 * curr_layer, curr_layer + 1, not is_cupcakes)', f: 'b_item - 3 * curr_layer', g: 'b - 3 * k' }),
    mc(21, 'i. Fill in blank (a) (lettered (d) in the code).', ['b_item < 0 or c_item < 0', 'b_item', 'b_item == 0 or c_item == 0', 'b_item > 0 or c_item > 0', 'c_item', 'b_item < 0 and c_item < 0', 'c_item * 2 == k or b_item * 3 == k', 'b_item * 3 <= k'], 0),
    mc(22, 'ii. Fill in blank (b) (lettered (e) in the code).', ['helper(b_item - 3 * curr_layer, c_item, curr_layer + 1, is_cupcakes) - 1', '1 + helper(b_item - 3 * curr_layer, c_item - 2 * curr_layer, curr_layer - 1, not is_cupcakes)', '1 + helper(b_item, c_item - 2 * curr_layer, curr_layer + 1, not is_cupcakes)', 'helper(b_item - 3 * curr_layer, c_item - 2 * curr_layer, curr_layer - 1, is_cupcakes)', 'helper(b_item, b_item - 2 * curr_layer, curr_layer + 1, not is_cupcakes)', 'helper(b_item - 3 * curr_layer, c_item, curr_layer + 1, not is_cupcakes) + helper(b_item, c_item - 2 * curr_layer, curr_layer + 1, is_cupcakes)'], 2),
    mc(23, 'iii. Fill in blank (c) (lettered (f) in the code).', ['b_item', 'b_item - 3 * (curr_layer + 1)', 'b_item - 3 * curr_layer', '3 * b_item', 'b_item + c_item * 3 * curr_layer', 'b_item // 3 * (curr_layer + 1)', 'b_item // 3 * curr_layer', 'b_item - 3 // curr_layer'], 2),
    blank(24, 'iv. Fill in blank (d) (lettered (g) in the code).', 'b - 3 * k', { r: 'g' }),
    h('(c) (6.0 points)'),
    text('Implement sweetest_tower, which takes a positive integer c, the number of cupcakes, positive integer b, the number of brownies, and k, the size of the smallest layer that can hold k donuts. It returns the maximum number of dessert layers that can be formed using brownies and cupcakes. As previously stated, since those items are smaller than donuts, each k-sized donut layer can hold twice as many cupcakes and thrice as many brownies. Unlike alternating_tower, layers can be in any order.'),
    py(`
def sweetest_tower(b, c, k):
    """
    >>> sweetest_tower(0, 2, 1) # 1st layer with 2 cupcakes
    1
    >>> sweetest_tower(5, 4, 4)
    0
    >>> sweetest_tower(17, 19, 3) # layer 1 has 6 cupcakes, 2nd has 8 cupcakes, 3rd has 15 brownie
    3
    >>> sweetest_tower(30, 8, 4) # 1st layer has 12 brownies, 2nd has 15 brownies
    2
    """
    with_brownies, with_cupcakes = 0,0
    if ⟪h⟫:
        with_brownies = ⟪i⟫
    if ⟪j⟫:
        with_cupcakes = ⟪k⟫
    return ⟪l⟫(with_brownies, with_cupcakes)`, { h: 'b >= 3 * k', i: '1 + sweetest_tower(b - 3 * k, c, k + 1)', j: 'c >= 2 * k', k: '1 + sweetest_tower(b, c - 2*k, k + 1)', l: 'max' }),
    mc(25, 'i. Fill in blank (a) (lettered (h) in the code).', ['b >= 3 * k', 'b > 3 * k', 'b', 'b == 3 * k', 'b > c', 'b // 3 < k', 'b // 3 == k', 'b >= 0'], 0),
    mc(26, 'ii. Fill in blank (b) (lettered (i) in the code).', ['1 + sweetest_tower(b // 3 - k, c, k - 1)', 'sweetest_tower(b - 3 * k, c, k + 1)', '1 + sweetest_tower(b - 3 * k, c, k + 1)', 'sweetest_tower(b - 3 * k, c, k - 1)', '3 * sweetest_tower(b, c - 2 * k, k + 1)', '3 + sweetest_tower(b, c - 2 * k, k + 1)', 'sweetest_tower(b - 3 // k, c - 2 * k, k + 1)'], 2),
    blank(27, 'iii. Fill in blank (c) (lettered (j) in the code).', 'c >= 2 * k', { r: 'j' }),
    blank(28, 'iv. Fill in blank (d) (lettered (k) in the code).', '1 + sweetest_tower(b, c - 2*k, k + 1)', { r: 'k' }),
    blank(29, 'v. Fill in blank (e) (lettered (l) in the code).', 'max', { r: 'l' }),
  ], { run: true }),
]);
e.omitted = [{ n: '1', why: 'a what-would-Python-display question about iterators' }, { n: '2', why: 'an environment diagram with list mutation' }, { n: '6', why: 'a trees problem' }];
export default e;
