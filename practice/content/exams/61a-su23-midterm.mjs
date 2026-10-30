// Summer 2023 Midterm (the summer term's only midterm), transcribed from the official exam and solutions.
// The staff topic index lists this exam as "su23-mt2". Problems 1, 2 and 6 were added later, so their question ids
// (30 on) come after problems 3-5's. Pictures (problem 2's environment diagram, problem 6's example trees) are
// described in text.
// Erratum: the official answer to 3(b)(iii) is "pow(10, i) * n % 10", which Python evaluates as (pow(10, i) * n) % 10
// and which fails the doctests; the explanation on that question says so, and both forms are accepted.
import { exam, problem, text, py, blank, mc, sata, h } from '../author.mjs';
import { TREE_ADT } from '../trees.mjs';

const RULE = 'You may not use str or repr or [ or ] or for.';
// The answer choices problem 1(a)(vii), (ix) and (x) share.
const O9 = ['True', 'False', '101', '102', '1', '0', 'Function', 'Error', 'Nothing'];
const e = exam('61a-su23-midterm', 'Summer 2023 Midterm', 'su23/mt1/61a-su23-midterm', 'su23-mt2', [
  problem('1', 'What Would Python Display (8.0 pts)', [{ n: '1', t: ['ITERATORS', 'LAMBDAS', 'LISTS', 'WWPD'] }], [
    text('For each expression below, choose the correct option or write the output displayed by the interactive Python interpreter when the expression is evaluated. The output may have multiple lines.', '• If an error occurs, write “Error”, but include all output displayed before the error.', '• If evaluation would run forever, write “Forever”.', '• To display a function value, write “Function”.', '• If the evaluated expression wouldn’t display anything, write “Nothing”. The interactive interpreter displays the value of a successfully evaluated expression, unless it is None.'),
    h('(a)'),
    py(`>>> (1 or 2) and (3 or 4)`),
    mc(30, 'i. What is displayed?', ['True', 'False', '0', '1', '2', '3', '4'], 5),
    py(`>>> ('Barbie' or 'Ken') * 2`),
    mc(31, 'ii. What is displayed?', ["'Barbie'", "'BarbieBarbie'", "'Ken'", "'KenKen'", "'BarbieKen'", "'KenBarbie'", "'BarbieBarbieKenKen'", '2', 'Error', 'Nothing'], 1),
    text('For the rest of this question, assume the following code has been executed.'),
    py(`>>> it = iter([2, ['a', 'b'], 'c', 3])`),
    py(`>>> next(it)`),
    blank(32, 'iii. What is displayed?', '2'),
    py(`>>> next(it)`),
    blank(33, 'iv. What is displayed?', "['a', 'b']"),
    py(`>>> list(it)`),
    blank(34, 'v. What is displayed?', "['c', 3]"),
    py(`>>> next(it)`),
    blank(35, 'vi. What is displayed?', 'Error'),
    text('For the rest of this question, assume the following code has been executed.'),
    py(`
dreamhouse = 101
beach = lambda pink: pink(dreamhouse)
dreamhouse = 102

def is_even(n):
    return n % 2 == 0`),
    py(`>>> beach(is_even)`),
    mc(36, 'vii. What is displayed?', O9, 0),
    py(`>>> beach(dreamhouse)`),
    mc(37, 'viii. What is displayed?', ['True', 'False', '101', '1', '0', 'Function', 'Error', 'Nothing'], 6),
    py(`>>> pink = beach(print)`),
    mc(38, 'ix. What is displayed?', O9, 3),
    py(`>>> pink`),
    mc(39, 'x. What is displayed?', O9, 8),
  ]),
  problem('2', 'The Fellowship of the List (10.0 pts)', [{ n: '2', t: ['ENVIRONMENT_DIAGRAMS', 'LISTS', 'MUTABILITY'] }], [
    text('Given the environment diagram and skeleton code, answer the questions below.', 'The environment diagram (a picture on the exam, described here):', '• Global frame: form_fellowship → func form_fellowship(group) [parent=Global]; gandalf → func ring(adventurer) [parent=f1]; sword: None; axe: None.', '• f1: form_fellowship [parent=Global]: group → the list ["Frodo", "Aragorn", None]; ring → func ring(adventurer) [parent=f1]; Return value → func ring(adventurer) [parent=f1].', '• f2: ring [parent=f1]: adventurer: "Aragorn"; Return value: None.', '• f3: ring [parent=f1]: adventurer: None; Return value: None.'),
    py(`
def form_fellowship(__1__):
    def ring(__2__):
        return ____3____
    return ____4____

gandalf = form_fellowship(____5____)
sword = _____6_____
_____7_____ = _____8_____`),
    h('(a)'),
    blank(40, 'i. Fill in blank (1).', 'group'),
    blank(41, 'ii. Fill in blank (2).', 'adventurer'),
    sata(42, 'iii. Which of these could go in 3? Select all that apply.', ['group + adventurer', 'adventurer + group', 'group.extend(adventurer)', 'group.extend([adventurer])', 'adventurer.extend(group)', 'adventurer.extend([group])', 'group.append(adventurer)', 'group.append([adventurer])', 'adventurer.append(group)', 'adventurer.append([group])', 'group + adventurer[:]', 'group[:] + adventurer'], [3, 6]),
    blank(43, 'iv. Fill in blank (4).', 'ring'),
    mc(44, 'v. Which of these could go in 5? Select one.', ["['Frodo']", "'Frodo'", "['Frodo', 'Aragorn']", "'Aragorn'", "['Frodo', 'Aragorn', None]", 'None'], 0),
    blank(45, 'vi. Fill in blank (6). You may only make one call expression and may not use or, and, if, or else.', ['gandalf("Aragorn")', "gandalf('Aragorn')"]),
    blank(46, 'vii. Fill in blank (7).', 'axe'),
    sata(47, 'viii. Which of these could go in 8? Select all that apply.', ['gandalf(sword)', 'gandalf(sword.append(None))', 'gandalf(group)', 'gandalf(adventurer)', 'gandalf(None)', "sword('Aragorn')", 'sword(None)'], [0, 4]),
  ]),
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
    mc(7, 'i. Fill in blank (g) (the exam’s (a) in this part).', ['n == d', 'n == 0', 'n % 10 == 0', 'n > 0', 'n >= 0', 'n < 0'], 3),
    mc(8, 'ii. Fill in blank (h) (the exam’s (b) in this part).', ['n % 10 == 0', 'n // 10 != 0', 'n % 10 == d', 'n % 10 != d', 'n % pow(10, d) == 0', 'n // 10 == pow(10, d)'], 3),
    blank(9, 'iii. Fill in blank (i) (the exam’s (c) in this part).', ['pow(10, i) * (n % 10)', 'pow(10, i) * n % 10'], { r: 'i', x: 'The official solutions give pow(10, i) * n % 10. Python evaluates that as (pow(10, i) * n) % 10, which fails the doctests, so this site shows the parenthesized form the solution intends and accepts both.' }),
    mc(10, 'iv. Fill in blank (j) (the exam’s (d) in this part).', ['n = n % pow(10, i)', 'i = pow(10, i)', 'i += 1', 'n = n % 10', 'n = n // 10', 'n -= 1'], 2),
    mc(11, 'v. Fill in blank (k) (the exam’s (e) in this part).', ['n = n % pow(10, i)', 'i = pow(10, i)', 'i += 1', 'n = n % 10', 'n = n // 10', 'n -= 1'], 4),
    blank(12, 'vi. Fill in blank (l) (the exam’s (f) in this part).', 'remove_digit', { r: 'l' }),
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
    blank(13, 'i. Fill in blank (m) (the exam’s (a) in this part).', ['digit_widget(4)(digit_widget(8)(n))', 'return digit_widget(4)(digit_widget(8)(n))'], { r: 'm', x: 'The official solution writes return digit_widget(4)(digit_widget(8)(n)), repeating the return already in the code.' }),
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
    mc(21, 'i. Fill in blank (d) (the exam’s (a) in this part).', ['b_item < 0 or c_item < 0', 'b_item', 'b_item == 0 or c_item == 0', 'b_item > 0 or c_item > 0', 'c_item', 'b_item < 0 and c_item < 0', 'c_item * 2 == k or b_item * 3 == k', 'b_item * 3 <= k'], 0),
    mc(22, 'ii. Fill in blank (e) (the exam’s (b) in this part).', ['helper(b_item - 3 * curr_layer, c_item, curr_layer + 1, is_cupcakes) - 1', '1 + helper(b_item - 3 * curr_layer, c_item - 2 * curr_layer, curr_layer - 1, not is_cupcakes)', '1 + helper(b_item, c_item - 2 * curr_layer, curr_layer + 1, not is_cupcakes)', 'helper(b_item - 3 * curr_layer, c_item - 2 * curr_layer, curr_layer - 1, is_cupcakes)', 'helper(b_item, b_item - 2 * curr_layer, curr_layer + 1, not is_cupcakes)', 'helper(b_item - 3 * curr_layer, c_item, curr_layer + 1, not is_cupcakes) + helper(b_item, c_item - 2 * curr_layer, curr_layer + 1, is_cupcakes)'], 2),
    mc(23, 'iii. Fill in blank (f) (the exam’s (c) in this part).', ['b_item', 'b_item - 3 * (curr_layer + 1)', 'b_item - 3 * curr_layer', '3 * b_item', 'b_item + c_item * 3 * curr_layer', 'b_item // 3 * (curr_layer + 1)', 'b_item // 3 * curr_layer', 'b_item - 3 // curr_layer'], 2),
    blank(24, 'iv. Fill in blank (g) (the exam’s (d) in this part).', 'b - 3 * k', { r: 'g' }),
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
    mc(25, 'i. Fill in blank (h) (the exam’s (a) in this part).', ['b >= 3 * k', 'b > 3 * k', 'b', 'b == 3 * k', 'b > c', 'b // 3 < k', 'b // 3 == k', 'b >= 0'], 0),
    mc(26, 'ii. Fill in blank (i) (the exam’s (b) in this part).', ['1 + sweetest_tower(b // 3 - k, c, k - 1)', 'sweetest_tower(b - 3 * k, c, k + 1)', '1 + sweetest_tower(b - 3 * k, c, k + 1)', 'sweetest_tower(b - 3 * k, c, k - 1)', '3 * sweetest_tower(b, c - 2 * k, k + 1)', '3 + sweetest_tower(b, c - 2 * k, k + 1)', 'sweetest_tower(b - 3 // k, c - 2 * k, k + 1)'], 2),
    blank(27, 'iii. Fill in blank (j) (the exam’s (c) in this part).', 'c >= 2 * k', { r: 'j' }),
    blank(28, 'iv. Fill in blank (k) (the exam’s (d) in this part).', '1 + sweetest_tower(b, c - 2*k, k + 1)', { r: 'k' }),
    blank(29, 'v. Fill in blank (l) (the exam’s (e) in this part).', 'max', { r: 'l' }),
  ], { run: true }),
  problem('6', 'All Treeils Lead to Rome (12.0 pts)', [{ n: '6a', t: ['TREES', 'TREE_RECURSION'] }, { n: '6b', t: ['TREES', 'TREE_RECURSION'] }, { n: '6c', t: ['DATA_ABSTRACTION', 'HIGHER_ORDER_FUNCTIONS', 'TREE_RECURSION'] }], [
    text('Definition: A Treeil is a tree where exactly one of the child node(s) of each non-leaf node has a label equal to the label of the node. Alternatively, a treeil is a tree where every node has a singular path from the node to a leaf consisting entirely of nodes with the same label. Here is an example of a valid treeil (a picture on the exam):'),
    py(`tree(1, [tree(1, [tree(1)]), tree(2), tree(4, [tree(4), tree(5)])])`, null, { norun: true }),
    h('(a) (7.0 points) Treeil Trial'),
    text('Implement is_treeil which takes in a tree t and determines whether t is a treeil.'),
    py(`
def is_treeil(t):
    \"\"\"
    Returns whether a tree is a treeil. A treeil is a tree where exactly one of
    the branches of each non-leaf node has a label equal to the label of the node.
    >>> t1 = tree(1)
    >>> is_treeil(t1)
    True
    >>> t2 = tree(1, [tree(2), tree(3)])
    >>> is_treeil(t2)
    False
    >>> t3 = tree(1, [tree(1, [tree(1), tree(3)]), tree(2)])
    >>> is_treeil(t3)
    True
    >>> t4 = tree(1, [tree(1, [tree(1), tree(1)]), tree(2)])
    >>> is_treeil(t4)
    False
    >>> t5 = tree(2, [tree(3, [tree(1)]), tree(2, [tree(2)])])
    >>> is_treeil(t5)
    False
    \"\"\"
    if ⟪a⟫:
        return True
    else:
        match_one = ⟪b⟫([b for b in branches(t) if ⟪c⟫]) == 1
        return ⟪d⟫ and ⟪e⟫([⟪f⟫ for b in branches(t)])`, { a: 'is_leaf(t)', b: 'len', c: 'label(t) == label(b)', d: 'match_one', e: 'all', f: 'is_treeil(b)' }),
    sata(48, 'i. Fill in blank (a). Select all that apply.', ['True', 'False', 'is_leaf(t)', 'branches(t)', 'not branches(t)', 'label(t)', 'not label(t)', 'branches(t) == []'], [2, 4, 7]),
    mc(49, 'ii. Fill in blank (b).', ['sum', 'max', 'min', 'len', 'any', 'all'], 3),
    blank(50, 'iii. Fill in blank (c).', 'label(t) == label(b)', { r: 'c' }),
    blank(51, 'iv. Fill in blank (d).', 'match_one', { r: 'd' }),
    mc(52, 'v. Fill in blank (e).', ['sum', 'max', 'min', 'len', 'any', 'all'], 5),
    blank(53, 'vi. Fill in blank (f).', 'is_treeil(b)', { r: 'f' }),
    h('(b) (5.0 points) Treeil Trail'),
    text('Implement max_treeil which takes in a tree t and determines the highest number of nodes in a treeil that is a subtree of t. You may assume is_treeil is implemented correctly from the previous question.', 'The exam shows this tree t, which is not a treeil, with its largest treeil subtree highlighted: the subtree rooted at the 4 under the root, with 4 nodes. Calling max_treeil on this tree t should give a result of 4.'),
    py(`tree(1, [tree(2, [tree(1)]), tree(4, [tree(4, [tree(4)]), tree(5)])])`, null, { norun: true }),
    py(`
def max_treeil(t):
    \"\"\"
    Given a tree (that is not necessarily a treeil), returns
    the highest number of nodes in a treeil in the tree.
    >>> t1 = tree(1)
    >>> max_treeil(t1)
    1
    >>> t2 = tree(1, [tree(2), tree(3)])
    >>> max_treeil(t2)
    1
    >>> t3 = tree(1, [tree(1, [tree(1), tree(3)]), tree(2)])
    >>> max_treeil(t3)
    5
    >>> t4 = tree(1, [tree(1, [tree(1), tree(1)]), tree(2)])
    >>> max_treeil(t4)
    1
    >>> t5 = tree(2, [tree(3, [tree(1)]), tree(2, [tree(2)])])
    >>> max_treeil(t5)
    2
    \"\"\"
    if ⟪g⟫:
        return 1
    elif ⟪h⟫:
        return 1 + ⟪i⟫
    else:
        return max([⟪j⟫ for b in branches(t)])`, { g: 'is_leaf(t)', h: 'is_treeil(t)', i: 'sum([max_treeil(b) for b in branches(t)])', j: 'max_treeil(b)' }),
    mc(54, 'i. Fill in blank (g) (the exam’s (a) in this part).', ['is_treeil(t)', 'not is_treeil(t)', 'is_leaf(t)', 'is_treeil(t) or is_leaf(t)', 'not is_treeil(t) and is_leaf(t)'], 2),
    blank(55, 'ii. Fill in blank (h) (the exam’s (b) in this part).', 'is_treeil(t)', { r: 'h' }),
    mc(56, 'iii. Fill in blank (i) (the exam’s (c) in this part).', ['max([max_treeil(b) for b in branches(t)])', 'len([max_treeil(b) for b in branches(t)])', 'sum([max_treeil(b) for b in branches(t)])', 'sum([b for b in branches(t) if is_treeil(b)])', 'len([b for b in branches(t) if is_treeil(b)])'], 2),
    blank(57, 'iv. Fill in blank (j) (the exam’s (d) in this part).', 'max_treeil(b)', { r: 'j' }),
    h('(c) (0.0 points) Treeil Treeatment (A+ Question)'),
    text('This A+ question is not worth any points. This can only affect your course grade if you have a high A and might receive an A+. Finish the rest of the exam first!', 'Implement make_treeil which takes in a non-negative integer n and returns a treeil of depth n. Each node of the treeil has exactly one more child than its parent node. The first branch of a node will have value equal to its parent. Subsequent branches will have a label of exactly one more than the previous branch. The root has a label of 0 and has exactly two children for a tree of depth 1. The doctest shows a treeil of depth 2.'),
    py(`
def make_treeil(n):
    \"\"\"
    Returns a treeil of depth n where each node has one more child than its parent.
    The first branch of a node will have label equal to its parent with subsequent
    branches having label of exactly one more than the previous branch.
    >>> t2 = make_treeil(2)
    >>> print_tree(t2)
    0
      0
        0
        1
        2
      1
        1
        2
        3
    \"\"\"
    def treeil_tracker(k, parent):
        if n == k:
            return tree(parent)
        return ⟪k⟫
    return treeil_tracker(0, 0)`, { k: 'tree(parent, [treeil_tracker(k+1, i) for i in range(parent, parent+k+2)])' }),
    blank(58, 'i. Fill in blank (k) (the exam’s (a) in this part).', 'tree(parent, [treeil_tracker(k+1, i) for i in range(parent, parent+k+2)])', { r: 'k' }),
  ], { run: true, support: [TREE_ADT] }),
]);

export default e;
