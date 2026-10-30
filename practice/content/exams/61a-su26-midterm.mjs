// Summer 2026 Midterm (the summer term's only midterm), transcribed from the official exam and solutions.
// The staff topic index lists this exam as "su26-mt1". Not included: Q2.7 (a one-sentence free response, which can't be
// checked) and Q8 (Just for fun, 0 points). Pictures (the environment diagram's labeled blanks, the bracket and
// Diagrams 1-4 in Q6) are described in text. Q6's doctests are omitted on the exam; checking uses tests this site
// wrote from Diagrams 1-4, and the problem says so.
import { exam, problem, text, py, blank, mc, sata } from '../author.mjs';
import { TREE_ADT } from '../trees.mjs';

const LINES = ['1', '2', '3', '4', '5', '6', '7'];
const DIGIT_TESTS = name => `
    """
    >>> is_even = lambda x: x % 2 == 0
    >>> ${name}(is_even, 2111)
    1
    >>> ${name}(is_even, 9843)
    2
    >>> ${name}(lambda x: x > 3, 123456789)
    6
    """`;
const LEADERBOARD = `
def leaderboard(next_best):
    """
    Returns a function which outputs the first n outputs of next_best.
    >>> def minion_gen():
    ...   while True:
    ...     yield from ['Kevin', 'Stuart', 'Bob']
    >>>
    >>> top_minion = leaderboard(minion_gen())
    >>> top_minion(5)
    ['Kevin', 'Stuart', 'Bob', 'Kevin', 'Stuart']
    >>> top_minion(3)
    ['Kevin', 'Stuart', 'Bob']
    """
    ⟪a⟫`;
const REVEAL = `
def reveal_winner(t):
    """Doctests omitted for brevity, refer to problem description and diagrams."""
    def prune_lowest_losers(t):
        """
        Return (new_tree, changed), where:

        (1) new_tree is the pruned version of t,
            or None if t is removed
        (2) changed is True if t itself or a lowest losing subtree was pruned,
            and False otherwise
        """
        if is_leaf(t):
            if label(t) == ⟪a⟫:
                return ⟪b⟫, True
            return ⟪c⟫, False

        new_branches = []
        changed = False

        for b in branches(t):
            new_b, child_changed = ⟪d⟫
            if ⟪e⟫:
                new_branches.⟪f⟫
            changed = changed or child_changed

        if label(t) == ⟪g⟫ and ⟪h⟫:
            return ⟪i⟫, True

        return ⟪j⟫

    current = t
    changed = True
    while changed:
        current, changed = prune_lowest_losers(current)
        if changed:
            yield ⟪k⟫`;
const D = {
  1: `tree('W', [tree('W', [tree('W', [tree('W'), tree('L')]), tree('L', [tree('W'), tree('L')])]), tree('L', [tree('L', [tree('W'), tree('L')]), tree('W', [tree('L'), tree('W')])])])`,
  2: `tree('W', [tree('W', [tree('W', [tree('W')]), tree('L', [tree('W')])]), tree('L', [tree('L', [tree('W')]), tree('W', [tree('W')])])])`,
  3: `tree('W', [tree('W', [tree('W', [tree('W')])]), tree('L', [tree('W', [tree('W')])])])`,
  4: `tree('W', [tree('W', [tree('W', [tree('W')])])])`,
};
// This site's tests for reveal_winner, from Diagrams 1-4 (the exam omits its doctests).
const REVEAL_RUN = REVEAL.replace(/^\n/, '').replace('    """Doctests omitted for brevity, refer to problem description and diagrams."""', `    """
    >>> g = reveal_winner(${D[1]})
    >>> next(g) == ${D[2]}
    True
    >>> next(g) == ${D[3]}
    True
    >>> next(g) == ${D[4]}
    True
    >>> next(g)
    Traceback (most recent call last):
    ...
    StopIteration
    """`);
const LINEUP = `
def starting_lineup(players, k):
    """
    >>> players = iter([7, 10, 3, 20, 5, 30])
    >>> lineup = starting_lineup(players, 2)
    >>> next(lineup)
    10
    >>> next(lineup)
    20
    >>> next(lineup)
    StopIteration

    >>> players = iter([99, 1, 2, 10, 4])
    >>> list(starting_lineup(players, 3))
    [10, 1, 2]
    """
    tens = []
    others = []
    ⟪a⟫
    for p in players:
        if ⟪b⟫:
            ⟪c⟫
        else:
            ⟪d⟫
    lineup = ⟪e⟫
    return ⟪f⟫`;

const e = exam('61a-su26-midterm', 'Summer 2026 Midterm', 'su26/mt1/61a-su26-midterm', 'su26-mt1', [
  problem('1', 'Do you speak for the Trees? (WWPD) (9.0 pts)', [{ n: '1', t: ['HIGHER_ORDER_FUNCTIONS', 'LAMBDAS', 'RECURSION', 'TREES', 'TREE_RECURSION', 'WWPD'] }], [
    text('Consider the following code that was executed in a Python interpreter. For each of the lines below, write exactly what Python would display as output in the interpreter, except in these cases:', '1. If a function would be displayed, write Function.', '2. If an error would be raised, write Error.', '3. If nothing would be displayed, write Nothing.', 'For all subparts, if there are multiple lines of output, write all of them and clearly indicate when a new line begins.'),
    py(`
>>> sixty_seven = lambda x: lambda y: (print(x + y) and 67)
>>> seventy_six = lambda x: lambda y: (76 and print (x + 2*y))
>>> print(sixty_seven(7)(6) or seventy_six(6)(7))`),
    blank(1, '1.1 What would be displayed by evaluating the code above?', '13\n20\nNone'),
    py(`
t = tree(1, [
        tree(3, [tree(4)]),
        tree(5, [tree(6)])
    ])

def count_paths(t, f):
    """
    Takes in a tree \`t\` and a function \`f\`.
    It returns the number of paths from the root to any node in the tree
    for which calling \`f\` on the sum of the labels on the path
    returns a truthy value. You may assume it is implemented correctly.
    >>> count_paths(t, lambda x: x == 4) # 1 + 3 == 4 for the path 1 -> 3
    1
    """
    def helper(t, running_sum):
        total_sum = running_sum + label(t)
        if f(total_sum):
            count = 1
        else:
            count = 0
        for b in branches(t):
            count += helper(b, total_sum)
        return count
    return helper(t, 0)

six = lambda x: (x == 6 and print(x))`, null, { ln: true }),
    py(`>>> count_paths(t, lambda x: (x * x) % 10 == 6)`),
    blank(2, '1.2 What would be displayed by evaluating this code, assuming the tree ADT was already previously defined?', '2'),
    py(`>>> (count_paths(t, six) - 1) and count_paths(t, lambda x: x % 2 == 0)`),
    blank(3, '1.3 What would be displayed by evaluating this code?', '6\n4'),
  ]),
  problem('2', 'Too Sweet! (10.0 pts)', [{ n: '2', t: ['ENVIRONMENT_DIAGRAMS', 'LAMBDAS', 'LISTS', 'MUTABILITY', 'SEQUENCES'] }], [
    text('Complete the environment diagram below and then answer the questions that follow. There is one question for each labeled blank in the diagram. The blanks with no labels have no questions associated with them and are not scored. If a blank contains an arrow to a function, write the function as it would appear in the diagram.'),
    py(`
def sweet(treat):
    i = 0
    while i < len(donuts):
        if donuts[i] % 3 == 0:
            treat.append(donuts.pop(i))
        i += 1
    return treat[:]

def ice_cream(ice, cream):
    ice.insert(2, (lambda cream: [1, donuts[:3]])(ice))
    return cream

donuts = list(range(1, 10))
candies = []

sweet_treat = sweet(candies)
ice_cream = ice_cream(sweet_treat, sweet_treat[:])`, null, { ln: true }),
    text('The diagram to complete (a picture on the exam, described here):', '• Global frame: sweet → func sweet(treat) [parent=Global]; ice_cream: (a); donuts: (b); candies: (c); sweet_treat: (d).', '• f1: sweet [parent=Global]: treat; i: (e); Return value.', '• f2: (name) [parent=Global]: ice; cream; Return value.', '• f3: (name) [parent=(f)]: cream; Return value.', '(Q2.7, a one-sentence description of what sweet does, isn’t included because it can’t be checked automatically.)'),
    blank(4, '2.1 Fill in blank (a).', '[3, 6, 9]'),
    blank(5, '2.2 Fill in blank (b).', '[1, 2, 4, 5, 7, 8]'),
    blank(6, '2.3 Fill in blank (c).', '[3, 6, 9]'),
    blank(7, '2.4 Fill in blank (d).', '[3, 6, [1, [1, 2, 4]], 9]'),
    blank(8, '2.5 Fill in blank (e).', '7'),
    mc(9, '2.6 Fill in blank (f).', ['Global', 'f1', 'f2'], 2),
  ]),
  problem('3', 'Bugs Begone (6.0 pts)', [{ n: '3', t: ['CONTROL', 'LAMBDAS', 'RECURSION'] }], [
    text('CS 61A course staff are trying to complete a coding assignment but are struggling. The assignment is to write a function digit_filter, which takes in predicate, a one-argument function, and n, a positive integer (e.g. n > 10), and returns the number of digits in n for which predicate(digit) returns True. Here’s some doctests showing the intended behavior:'),
    py(`
>>> is_even = lambda x: x % 2 == 0
>>> digit_filter(is_even, 2111)
1
>>> digit_filter(is_even, 9843)
2
>>> digit_filter(lambda x: x > 3, 123456789)
6`, null, { norun: true }),
    text('In all subparts below, you don’t need to indent your answer when writing code. Each buggy implementation must be made correct by changing exactly one line.', '3.1 Sriya has decided to use a while loop to complete the assignment, but it’s not working!'),
    py(`
def digit_filter(predicate, n):
    total = 0
    while n >= 0:
        if predicate(n % 10):
            total += 1
        n //= 10
    return total`, null, { ln: true, runFills: { a: 'while n > 0:' }, runCode: `
def digit_filter1(predicate, n):${DIGIT_TESTS('digit_filter1')}
    total = 0
    ⟪a⟫
        if predicate(n % 10):
            total += 1
        n //= 10
    return total`.replace(/^\n/, '') }),
    mc(10, '3.1 Which line number is Sriya’s mistake on?', LINES, 2),
    blank(11, '3.1 What should that line be replaced with?', ['while n > 0:', 'n > 0'], { r: 'a' }),
    text('3.2 Emma has decided to use recursion instead, but it’s also not working!'),
    py(`
def digit_filter(predicate, n):
    if n < 10:
        return 0
    if predicate(n % 10):
        return 1 + digit_filter(predicate, n // 10)
    return digit_filter(predicate, n // 10)`, null, { ln: true, norun: true }),
    text('Hint: True and False are internally stored as 1 and 0, respectively, in Python. This means you can perform arithmetic on them, e.g. True == 1 and True + 3 == 4.'),
    sata(12, '3.2 Which of the following changes, when made only to the specified line number independently of the other answer options, would fix Emma’s mistake? Select all that apply.', ['Line 2, if n < 10 and predicate(n % 10):', 'Line 2, if n == 0:', 'Line 3, return predicate(n)', 'Line 3, return predicate(n % 10)', 'Line 4, elif predicate(n % 10):', 'Line 4, if predicate(n // 10):', 'Line 5, return digit_filter(predicate, n // 10)', 'Line 6, return 1 + digit_filter(predicate, n // 10)'], [1, 2, 3]),
    text('3.3 Amy has taken an unconventional approach and has decided to use a helper function - and it’s still wrong!'),
    py(`
def digit_filter(predicate, n):
    def helper(x, total):
        if x > n:
            return total
        last = (n // x) % 10
        return helper(10 ** x, total + predicate(last))
    return helper(1, 0)`, null, { ln: true, runFills: { b: 'return helper(x * 10, total + predicate(last))' }, runCode: `
def digit_filter3(predicate, n):${DIGIT_TESTS('digit_filter3')}
    def helper(x, total):
        if x > n:
            return total
        last = (n // x) % 10
        ⟪b⟫
    return helper(1, 0)`.replace(/^\n/, '') }),
    mc(13, '3.3 Which line number is Amy’s mistake on?', LINES, 5),
    blank(14, '3.3 What should that line be replaced with?', 'return helper(x * 10, total + predicate(last))', { r: 'b' }),
  ], { run: true }),
  problem('4', 'Skipper (6.0 pts)', [{ n: '4', t: ['CONTROL', 'RECURSION', 'TREE_RECURSION'] }], [
    text('Definitions. Given a positive integer n and a positive step size k, a skipper is a subsequence of digits in n that are each k indices apart and all digits in the subsequence are equal to some skipper digit d. Digits in n outside of the skipper (e.g. the numbers between the skipper digits) do not need to be equal to d. A skipper’s length is the number of skipper digits in the subsequence.', 'Implement a function skipper, which returns the length of the longest skipper in n with step size k, or 0 if there is no skipper in n.'),
    py(`
def skipper(n: int, k: int) -> int:
    """
    >>> skipper(111, 1)
    3
    >>> skipper(10101, 2) # two skippers with three 1s and two 0s
    3
    >>> skipper(1, 3) # no skipper
    0
    >>> skipper(7667, 2) # no skipper
    0
    >>> skipper(414243, 2) # skipper with three 4s
    3
    >>> skipper(13232, 2) # two skippers with two 3s and two 2s
    2
    >>> skipper(88008, 4) # digits in between may be equal to skipper digit d = 8
    2
    """
    longest = 0
    while n:
        curr = n
        d = ⟪a⟫
        length = 0
        while ⟪b⟫ and curr > 0:
            length += 1
            ⟪c⟫
        if ⟪d⟫:
            ⟪e⟫
        n = n // 10
    return longest`, { a: 'n % 10', b: 'curr % 10 == d', c: 'curr = curr // (10 ** k)', d: 'length > 1 and length > longest', e: 'longest = length' }),
    blank(15, '4.1 Fill in blank (a).', ['n % 10', 'curr % 10'], { r: 'a' }),
    blank(16, '4.2 Fill in blank (b).', 'curr % 10 == d', { r: 'b' }),
    blank(17, '4.3 Fill in blank (c).', 'curr = curr // (10 ** k)', { r: 'c' }),
    mc(18, '4.4 Fill in blank (d).', ['length > 0', 'length > 1', 'longest > length', 'length > longest', 'length > 0 and longest > length', 'length > 0 and length > longest', 'length > 1 and longest > length', 'length > 1 and length > longest'], 7),
    blank(19, '4.5 Fill in blank (e).', 'longest = length', { r: 'e' }),
  ], { run: true }),
  problem('5', 'Higher Order Minions (12.0 pts)', [{ n: '5', t: ['CONTROL', 'GENERATORS', 'HIGHER_ORDER_FUNCTIONS', 'ITERATORS', 'LISTS', 'MUTABILITY', 'RECURSION'] }], [
    text('5.1 Gru is the boss of creatures called minions. He wants a way to know who the top performing minions are using a function which will help him display the exact number of minions he asks for.', 'Write the function leaderboard which takes in a possibly infinite generator object (not a generator function) next_best and returns a function top_minion. top_minion takes in an integer n and outputs a list of the first n minions given by next_best. Previous calls to top_minion should not impact the current output.', 'IMPORTANT: A fully correct solution MUST use list mutation.', 'You may not need all lines, but you may not use more than the 9 lines provided and each line must contain up to one Python statement. Make sure you clearly indent when necessary.'),
    py(LEADERBOARD, { a: 'values = []\ndef top_minion(n):\n    for i in range(n):\n        values.append(next(next_best))\n    return values[:n]\nreturn top_minion' }, {
      // A bare ">>>" line isn't a valid doctest example; checking leaves it out.
      runCode: LEADERBOARD.replace(/^\n/, '').replace('    >>>\n', '') }),
    blank(20, '5.1 Write the body of leaderboard (up to 9 lines).', 'values = []\ndef top_minion(n):\n    for i in range(n):\n        values.append(next(next_best))\n    return values[:n]\nreturn top_minion', { r: 'a', x: 'Note that the staff solution does not call next the minimum number of times. A more efficient solution would loop n - len(values) times instead. Common mistakes: creating the list inside top_minion, so earlier values are lost; calling iter(next_best) to copy the generator (it returns the same iterator); calling list(next_best), which never finishes for an infinite generator.' }),
    text('5.2 Kevin, Stuart, and Bob are minions trying to guess the code to the banana vault.', 'Write a function, banana_vault, which takes in a number representing the correct vault code. banana_vault should return a one-argument function. This returned function takes in a guessed code. If the guessed code is correct, it returns the number of incorrect guesses made before the correct guess. If the guessed code is incorrect, it returns another guessing function that remembers one additional incorrect guess has been made.', 'IMPORTANT: Your solution MUST NOT use lists, dictionaries, or object mutation.', 'Hint: Pay close attention to the inputs and outputs of the 3 functions in the skeleton below.'),
    py(`
def banana_vault(n):
    """Makes a banana_vault with code n.
    >>> guess0 = banana_vault(10)
    >>> guess1 = guess0(4)
    >>> guess2 = guess1(2)
    >>> guess3 = guess2(8)
    >>> guess3(10)
    3
    >>> guess2(10)
    2
    >>> banana_vault(7)(7)
    0
    >>> b = banana_vault(5)(1)(2)(3)(4)(5)
    >>> b
    4
    """
    def update(num_incorrect):
        def guess(code):
            if ⟪b⟫:
                return ⟪c⟫
            else:
                return ⟪d⟫
        return ⟪e⟫
    return ⟪f⟫`, { b: 'code == n', c: 'num_incorrect', d: 'update(num_incorrect + 1)', e: 'guess', f: 'update(0)' }),
    blank(21, '5.2 Fill in the condition of the if statement.', 'code == n', { r: 'b' }),
    blank(22, '5.2 Fill in the first return value inside guess.', 'num_incorrect', { r: 'c' }),
    blank(23, '5.2 Fill in the return value in the else clause.', 'update(num_incorrect + 1)', { r: 'd' }),
    blank(24, '5.2 Fill in the return value of update.', 'guess', { r: 'e' }),
    blank(25, '5.2 Fill in the return value of banana_vault.', 'update(0)', { r: 'f' }),
  ], { run: true }),
  problem('6', 'Bracket Breaker (11.0 pts)', [{ n: '6', t: ['CONTROL', 'GENERATORS', 'HIGHER_ORDER_FUNCTIONS', 'ITERATORS', 'LISTS', 'RECURSION', 'SEQUENCES', 'TREES', 'TREE_RECURSION'] }], [
    text('It’s the World Cup and soccer/football teams from around the world are competing in a tournament! The results of a tournament can be represented in a bracket: the exam pictures one where Team 1 beats Team 2, Team 3 beats Team 4, Team 5 beats Team 6 and Team 8 beats Team 7; then Team 1 beats Team 3 and Team 8 beats Team 5; and Team 1 wins the final. If you rotate the bracket counterclockwise 90 degrees, notice that it is a tree!',
      'For this problem, we will represent a bracket as a tree (the tree ADT). Diagram 1 below is equivalent to that bracket, except instead of the team names, we have marked which team won ("W") or lost ("L") (ties are not allowed). The goal is to isolate the winning path.',
      'Implement reveal_winner, a generator function which should progressively yield simplified versions of the entire bracket. Each time next is called, this generator function should yield a new tree where every losing subtree at the greatest depth is pruned. (The depth of a node is its distance from the root; the root has depth 0.)',
      'Diagram 1 is the original tree passed into reveal_winner, while Diagrams 2-4 are the trees that are yielded in that order by reveal_winner. Calling next after yielding the tree in Diagram 4 should cause a StopIteration exception. The diagrams are pictures on the exam, written here in tree notation:'),
    py(`
# Diagram 1
${D[1]}
# Diagram 2
${D[2]}
# Diagram 3
${D[3]}
# Diagram 4
${D[4]}`, null, { norun: true }),
    text('The exam omits reveal_winner’s doctests. This site checks answers with its own tests built from Diagrams 1-4: each next must yield exactly the next diagram, then raise StopIteration.'),
    py(REVEAL, { a: '"L"', b: 'None', c: 'tree(label(t))', d: 'prune_lowest_losers(b)', e: 'new_b is not None', f: 'append(new_b)', g: '"L"', h: 'not changed', i: 'None', j: 'tree(label(t), new_branches), changed', k: 'current' }, { runCode: REVEAL_RUN }),
    blank(26, '6.1 Fill in blank (a).', ['"L"', "'L'"], { r: 'a' }),
    mc(27, '6.2 Fill in blank (b).', ['None', 'tree(t)', 'branches(t)', 'tree(branches(t))'], 0),
    blank(28, '6.3 Fill in blank (c).', 'tree(label(t))', { r: 'c' }),
    blank(29, '6.4 Fill in blank (d).', 'prune_lowest_losers(b)', { r: 'd' }),
    blank(30, '6.5 Fill in blank (e).', 'new_b is not None', { r: 'e' }),
    sata(31, '6.6 Select all option(s) that could fill blank (f).', ['append(new_b)', 'extend(new_b)', 'append([new_b])', 'extend([new_b])'], [0, 3]),
    blank(32, '6.7 Fill in blank (g).', ['"L"', "'L'"], { r: 'g' }),
    blank(33, '6.8 Fill in blank (h).', 'not changed', { r: 'h' }),
    blank(34, '6.9 Fill in blank (i).', 'None', { r: 'i' }),
    blank(35, '6.10 Fill in blank (j).', ['tree(label(t), new_branches), changed', 'return tree(label(t), new_branches), changed'], { r: 'j', x: 'The official solution writes return tree(label(t), new_branches), changed, repeating the template’s return; both forms are accepted.' }),
    mc(36, '6.11 Fill in blank (k).', ['from current', 'all from current', 'current', 'list(current)'], 2),
  ], { run: true, support: [TREE_ADT] }),
  problem('7', 'Messi Iterators (6.0 pts)', [{ n: '7', t: ['CONTROL', 'ITERATORS', 'LISTS', 'MUTABILITY'] }], [
    text('In the game of soccer/football, a team is comprised of players who each have a unique jersey number. The starting lineup of a team is the subset of players who play at the very beginning of the game. Implement starting_lineup, which takes in:', '1. A finite iterator players which returns unique positive integers (representing jersey numbers)', '2. A non-negative integer k, the number of players in the lineup', 'It returns an iterator over the lineup which must follow these rules:', '• Never include the first player in players.', '• Maximize the number of jersey numbers that are multiples of 10 (excluding the first player).', '• If there are not enough multiples of 10 to reach k players, fill the remaining spots with the other players, in the order they are returned by the iterator.', '• Return an iterator representing the lineup.', 'You may assume players contains enough elements such that calling starting_lineup will produce an iterator that contains at least k elements.'),
    py(LINEUP, { a: 'next(players)', b: 'p % 10 == 0', c: 'tens.append(p)', d: 'others.append(p)', e: 'tens + others', f: 'iter(lineup[:k])' }, {
      // The exam's "StopIteration" isn't valid doctest output for an exception; checking uses a traceback.
      runCode: LINEUP.replace(/^\n/, '').replace('    >>> next(lineup)\n    StopIteration\n', '    >>> next(lineup)\n    Traceback (most recent call last):\n    ...\n    StopIteration\n') }),
    blank(37, '7.1 Fill in blank (a).', 'next(players)', { r: 'a' }),
    blank(38, '7.2 Fill in blank (b).', ['p % 10 == 0', 'p % 10 == 0 and len(tens) < k'], { r: 'b' }),
    blank(39, '7.3 Fill in blank (c).', 'tens.append(p)', { r: 'c' }),
    blank(40, '7.4 Fill in blank (d).', 'others.append(p)', { r: 'd' }),
    blank(41, '7.5 Fill in blank (e).', ['tens + others', '(tens + others)[:k]'], { r: 'e', x: 'If blank (f) is filled with iter(lineup), this blank can be (tens + others)[:k].' }),
    blank(42, '7.6 Fill in blank (f).', 'iter(lineup[:k])', { r: 'f', x: 'See the alternate solution in blank (e).' }),
  ], { run: true }),
]);
export default e;
