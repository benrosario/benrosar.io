// Summer 2026 Final, transcribed from the official exam and solutions. Q7 (Scheme) and Q8 (Scheme macros) aren't
// included: Scheme isn't on this semester's topic list (see `omitted`). Also left out: Q10 (Just for fun, 0 points) and
// the free-response half of Q3.10 (a 20-word description, which can't be checked). Pictures (Q2's environment diagram,
// Q5's airports and stations) are described in text, and Q1's two-column code is written out in order.
// Checking supplies what the exam assumes but doesn't show: the doctest setup Q3.5 and Q3.6-3.9 describe, and the
// setup function that builds Q5's diagram. Q3.6's official answer uses an attribute Showtime doesn't have; see that
// question. SQL answers run in SQLite on the exam's tables and site-made variants (content/sql.mjs).
import { exam, problem, text, py, sql, blank, mc, sata } from '../author.mjs';

const FRAMES = ['Global', 'f1', 'f2', 'f3'];
const ORDERS = ['Constant', 'Logarithmic', 'Linear', 'Quadratic', 'Exponential'];
const CLASSES = `
class Showtime:
  max_capacity = 3

  def __init__(self, movie_name: str, theatre: Theatre, time: str):
    self.movie_name = movie_name
    self.theatre = theatre
    self.time = time
    self.capacity = Showtime.max_capacity

  def __repr__(self):
    return f'{self.movie_name} at {self.time}'

class Theatre:
  def __init__(self):
    # dictionary with key: movie name (str), value: list of Showtime objects
    self.showtimes = {}
    def next_showtime():
      while True:
        yield from ['12 PM', '3 PM', '6 PM', '9 PM']
    self.showtime_generator = next_showtime()

class User:
  max_reservations = 4

  def __init__(self, name: str):
    self.name = name
    self.reservations = [] # list of Showtime objects

  def __repr__(self):
    return self.name`;
const RESERVE = `
def reserve_ticket(self, showtime: Showtime) -> bool:
  """
  Suppose we have already created a Theatre instance \`theatre\`
  and there are now the following showtimes:
  >>> theatre.showtimes
  {'The Odyssey': [The Odyssey at 12 PM, The Odyssey at 6 PM],
    'Spider-Man 4': [Spider-Man 4 at 3 PM, Spider-Man 4 at 9 PM,
                     Spider-Man 4 at 12 PM]
  }
  >>> lavanya = User("Lavanya")
  >>> spiderman_showtimes = theatre.showtimes['Spider-Man 4']
  >>> [lavanya.reserve_ticket(s) for s in spiderman_showtimes]
  [True, True, True]
  >>> odyssey_showtimes = theatre.showtimes['The Odyssey']
  >>> [lavanya.reserve_ticket(s) for s in odyssey_showtimes]
  [True, False]
  >>> lavanya.reservations
  [Spider-Man 4 at 3 PM, Spider-Man 4 at 9 PM, Spider-Man 4 at 12 PM,
    The Odyssey at 12 PM]
  >>> all([ showtime.capacity == 2 for showtime in lavanya.reservations ])
  True
  """
  ⟪e⟫`;
const GROUP = `
def reserve_group_tickets(self, group: list[User], theatre: Theatre, movie_name: str):
  """
  Suppose there is a Theatre instance \`theatre\` with a \`Showtime\` for Spider-Man 4 at
  12 PM, and now the showtime's capacity is 2 because a User reserved a ticket.

  >>> lavanya = User('Lavanya')
  >>> group = [User('Bill'), User('Alex')]
  >>> lavanya.reserve_group_tickets(group, theatre, 'Spider-Man 4')
  Success: Reserved tickets for Spider-Man 4 at 3 PM for 3 people
  >>> theatre.showtimes
  {'Spider-Man 4': [Spider-Man 4 at 12 PM, Spider-Man 4 at 3 PM]}
  >>> theatre.showtimes['Spider-Man 4'][1].capacity
  0
  >>> lavanya.reservations
  [Spider-Man 4 at 3 PM]
  >>> group[0].reservations
  [Spider-Man 4 at 3 PM]
  >>> group[1].reservations
  [Spider-Man 4 at 3 PM]
  """
  assert 0 < len(group) <= Showtime.max_capacity
  assert movie_name in theatre.showtimes
  assert len(theatre.showtimes[movie_name]) > 0

  showtimes = theatre.showtimes[movie_name]

  best_showtime = max(showtimes, key=⟪f⟫)
  if best_showtime.capacity < len(group) + 1:
    best_showtime = ⟪g⟫
  if ⟪h⟫:
    print(f'Error: {self.name} already has the max number of reservations')
  else:
    num_reserved = 1
    for user in group:
      if ⟪i⟫:
        num_reserved += 1
    print(f'Success: Reserved tickets for {best_showtime} for {num_reserved} people')`;
const RESERVE_BODY = 'if len(self.reservations) < User.max_reservations and showtime.capacity > 0:\n  showtime.capacity -= 1\n  self.reservations.append(showtime)\n  return True\nreturn False';
const DUPLICATE_BODY = 'counts = {}\nfor score in scores:\n  if score % 2 == 0:\n    if score not in counts:\n      counts[score] = 1\n    else:\n      counts[score] += 1\nnum_duplicates = 0\nfor score in counts:\n  if counts[score] > 1:\n    num_duplicates += 1\nreturn num_duplicates';

const e = exam('61a-su26-final', 'Summer 2026 Final', 'su26/final/61a-su26-final', 'su26-final', [
  problem('1', 'Haunted Tales (6.0 pts)', [{ n: '1', t: ['INHERITANCE', 'MUTABLE_TREES', 'OBJECTS', 'REPRESENTATION'] }], [
    text('For subparts with answer boxes, write exactly what Python would display as output in the interpreter, except in these cases:', '1. If a function would be displayed, write Function.', '2. If an error would be raised, write Error.', '3. If nothing would be displayed, write Nothing.', 'Clearly indicate whether the output contains single or double quotes (if applicable).', 'For Q1.1 - Q1.4, consider the following code, which has already been executed with no errors in the same interpreter session. (The exam prints it in two columns; it is written out here in the order it runs.)'),
    py(`
class Spirit:
  boo = 1
  goo = 2

  def __init__(self, boo, bat):
    self.goo = boo
    self.bat = bat

  def __repr__(self):
    return f'Spirit({self.goo}, {self.bat})'

class Ghost(Spirit):
  def __init__(self, goo, bag):
    super().__init__(goo, bag)

  def __repr__(self):
    return f'Ghost({self.boo}, {self.bat})'

  def __str__(self):
    return 'spooky'

a = Spirit(3, 4)
b = Ghost(5, 6)`),
    py(`>>> (a.goo, b.goo)`),
    blank(1, '1.1 What would be displayed?', '(3, 5)'),
    py(`>>> b.bag`),
    blank(2, '1.2 What would be displayed?', 'Error'),
    py(`>>> b`),
    blank(3, '1.3 What would be displayed?', 'Ghost(1, 6)'),
    py(`
>>> Spirit.goo = 7
>>> print(f'{a}, {eval(repr(b))}')`),
    blank(4, '1.4 What would be displayed?', 'Spirit(3, 4), spooky'),
    text('For Q1.5 - Q1.6, consider the following code which has already been executed with no errors in the same interpreter session. If there are multiple lines of output, write all of them and clearly indicate when a new line begins.'),
    py(`
class Odyssey(Exception):
  def __init__(self, message, penelope, telemachus):
    super().__init__(message)
    self.penelope = penelope
    self.telemachus = telemachus

def voyage(n):
  if (n // 10) or (n and (5 / 0)):
    raise Odyssey("Ithaca", "Sparta", "Troy")
  else:
    roman_numerals = {'I': 1}
    print(not print(horse(2)) and roman_numerals['V'])

def horse(n):
  try:
    voyage(n)
  except ZeroDivisionError:
    return 'Helen'
  except KeyError:
    print('Circe')
  except Odyssey as ex:
    print(ex.penelope)
    return ex.telemachus`, null, { ln: true }),
    py(`>>> horse(17)`),
    blank(5, '1.5 What would be displayed?', "Sparta\n'Troy'"),
    py(`>>> horse(0)`),
    blank(6, '1.6 What would be displayed?', 'Helen\nCirce'),
    text('1.7 Consider a function find_path, which takes a Tree t with unique labels and a value x. It returns a list containing the labels of the nodes along a path from the root of t to a node labeled x. If x is not a label in t, return None. Below is a buggy implementation of find_path.'),
    py(`
def find_path(t: Tree, x) -> list:
  """
  >>> t1 = Tree(3, [Tree(4), Tree(5, [Tree(6)])])
  >>> find_path(t1, 5)
  [3, 5]
  >>> find_path(t1, 4)
  [3, 4]
  >>> find_path(t1, 6)
  [3, 5, 6]
  >>> print(find_path(t1, 2))
  None
  """
  if t.label == x:
      return t.label
  for b in t.branches:
      path = find_path(b, x)
      if path:
          return [t.label] + path
  return None`, null, { ln: true }),
    text('When running the doctests, you see the following error message: TypeError: can only concatenate list (not "int") to list'),
    mc(7, '1.7 What should be changed in order to fix the implementation (ignore indentation)?', ['Change Line 13 to if t.is_leaf():', 'Change Line 14 to return [t.label]', 'Change Line 16 to path = find_path(t, x)', 'Change Line 17 to if path is not None:', 'Change Line 18 to return [t.label] + [path]'], 1),
  ]),
  problem('2', 'Spider-Man: Brand New Environment Diagram (7.0 pts)', [{ n: '2', t: ['ENVIRONMENT_DIAGRAMS', 'LAMBDAS', 'LISTS', 'MUTABILITY'] }], [
    text('The following code is run and produces the shown environment diagram. Assume there are no errors when running this code. Blank boxes in the diagram and your scratch work on the diagram will not be graded.'),
    py(`
peter = [1, 2, 3]
parker = [peter, 2]
ned = 4

def web(shooter):
    ned = 10
    mj = lambda peter: shooter
    morales = mj(parker)(parker[0])
    return peter.pop()

web(lambda x: (x.pop(0) + peter.pop() + ned))`, null, { ln: true }),
    text('The environment diagram (a picture on the exam, described here):', '• Global frame: peter: (a); parker: (b); ned: 4; web → func web(shooter) [parent=Global].', '• f1: web [parent=Global]: shooter; ned: 10; mj; morales: (c); Return value: (d).', '• f2: λ <line 7> [parent=(e)]: peter; Return value.', '• f3: λ <line 11> [parent=(f)]: x; Return value: (c).', 'For all subparts below, choose or write what goes in each blank after executing all of the code.'),
    mc(8, '2.1 Fill in blank (a).', ['[]', '[2]', '[[], 2]', '[2, 3]', '[4, 2]'], 0),
    mc(9, '2.2 Fill in blank (b).', ['[]', '[4, 2]', '[[], 2]', '[[3], 2]', '[[2], 2]'], 2),
    mc(10, '2.3 Fill in blank (c).', ['1', '2', '3', '4', '5', '8', '10', '14'], 5),
    blank(11, '2.4 Fill in blank (d).', '2'),
    mc(12, '2.5 Fill in blank (e).', FRAMES, 1),
    mc(13, '2.6 Fill in blank (f).', FRAMES, 0),
  ]),
  problem('3', '61A Staff Goes to the Movies! (15.0 pts)', [{ n: '3', t: ['OBJECTS'] }], [
    text('Brian just opened a new movie theatre known as Brian Multi-Cinema (BMC) and needs your help to implement this system! A Theatre can show multiple movies at any given time. Each movie can be shown at one or more Showtimes (for example, The Odyssey could be shown at 12 pm and 3 pm, and Spider-Man 4 could be shown at 12 pm and 6 pm). A User can reserve movie tickets.'),
    // The annotations name Theatre before it's defined, so checking postpones their evaluation.
    py(CLASSES, null, { ln: true, runCode: 'from __future__ import annotations\n' + CLASSES.replace(/^\n/, '') }),
    text('Q3.1 - Q3.4: Implement the add_showtime method of the Theatre class, which does the following:', '• Creates a new Showtime instance with the given movie_name, associated with the current Theatre instance, and at the next time given by the showtime_generator instance attribute', '• Updates all relevant instance attributes for the Theatre and Showtime instances (see doctests)', '• Returns the created Showtime instance'),
    py(`
def add_showtime(self, movie_name: str) -> Showtime:
  """
  >>> theatre = Theatre()
  >>> theatre.add_showtime('Minions')
  Minions at 12 PM
  >>> theatre.showtimes
  {'Minions': [Minions at 12 PM]}
  >>> theatre.add_showtime('The Odyssey')
  The Odyssey at 3 PM
  >>> theatre.showtimes
  {'Minions': [Minions at 12 PM], 'The Odyssey': [The Odyssey at 3 PM]}
  >>> theatre.add_showtime('Minions')
  Minions at 6 PM
  >>> theatre.showtimes
  {'Minions': [Minions at 12 PM, Minions at 6 PM],
   'The Odyssey': [The Odyssey at 3 PM]}
  """
  time = ⟪a⟫
  new_showtime = ⟪b⟫
  if movie_name in self.showtimes:
    ⟪c⟫
  else:
    ⟪d⟫
  return new_showtime`, { a: 'next(self.showtime_generator)', b: 'Showtime(movie_name, self, time)', c: 'self.showtimes[movie_name].append(new_showtime)', d: 'self.showtimes[movie_name] = [new_showtime]' }),
    blank(14, '3.1 Fill in blank (a).', 'next(self.showtime_generator)', { r: 'a' }),
    blank(15, '3.2 Fill in blank (b).', 'Showtime(movie_name, self, time)', { r: 'b' }),
    blank(16, '3.3 Fill in blank (c).', 'self.showtimes[movie_name].append(new_showtime)', { r: 'c' }),
    blank(17, '3.4 Fill in blank (d).', 'self.showtimes[movie_name] = [new_showtime]', { r: 'd' }),
    text('Q3.5: Implement the reserve_ticket method of the User class. It takes in a Showtime and returns True or False depending on whether or not the reservation was successful. A reservation succeeds if the User has fewer than the maximum number of reservations (not counting the one they are attempting to make right now) and there is capacity in the showtime. You only need to consider the case where a User is reserving a ticket for a Showtime for the first time.', 'You may not need all lines and you may not use more than the 7 lines provided and each line must contain up to one Python statement. Make sure you clearly indent when necessary.'),
    py(RESERVE, { e: RESERVE_BODY }, {
      // Checking creates the theatre the docstring supposes, and prints the expected dictionary on one line.
      runCode: RESERVE.replace(/^\n/, '').replace(`  >>> theatre.showtimes
  {'The Odyssey': [The Odyssey at 12 PM, The Odyssey at 6 PM],
    'Spider-Man 4': [Spider-Man 4 at 3 PM, Spider-Man 4 at 9 PM,
                     Spider-Man 4 at 12 PM]
  }`, `  >>> theatre = Theatre()
  >>> _ = [theatre.add_showtime(m) for m in ['The Odyssey', 'Spider-Man 4', 'The Odyssey', 'Spider-Man 4', 'Spider-Man 4']]
  >>> theatre.showtimes
  {'The Odyssey': [The Odyssey at 12 PM, The Odyssey at 6 PM], 'Spider-Man 4': [Spider-Man 4 at 3 PM, Spider-Man 4 at 9 PM, Spider-Man 4 at 12 PM]}`) }),
    blank(18, '3.5 Write the body of reserve_ticket (up to 7 lines).', [RESERVE_BODY, RESERVE_BODY.replace('User.max_reservations', 'self.max_reservations')], { r: 'e' }),
    text('Q3.6 - Q3.9: Implement the reserve_group_tickets method of the User class. Tickets are reserved for the current User and everyone in their group for the Showtime with the largest capacity. Assume there are never ties for showtimes with the largest capacity. If none of the current showtimes have enough capacity, add a new showtime and reserve tickets for it. If the User reserving for the group cannot reserve a ticket, no tickets will be reserved. Otherwise, the User should reserve a ticket for themselves and try to do the same for each person in their group. Assume that add_showtime and reserve_ticket were implemented correctly.'),
    py(GROUP, { f: 'lambda showtime: showtime.capacity', g: 'theatre.add_showtime(movie_name)', h: 'not self.reserve_ticket(best_showtime)', i: 'user.reserve_ticket(best_showtime)' }, {
      // Checking creates the theatre the docstring supposes.
      runCode: GROUP.replace(/^\n/, '').replace("\n\n  >>> lavanya = User('Lavanya')", "\n\n  >>> theatre = Theatre()\n  >>> User('Someone').reserve_ticket(theatre.add_showtime('Spider-Man 4'))\n  True\n  >>> lavanya = User('Lavanya')") }),
    blank(19, '3.6 Fill in blank (f), the key function.', ['lambda showtime: showtime.capacity', 'lambda showtime: showtime.remaining_capacity'], { r: 'f', x: 'The official solution is lambda showtime: showtime.remaining_capacity, but Showtime has no remaining_capacity attribute (only capacity), so that line would raise an AttributeError. The site checks answers with showtime.capacity and accepts the official text as written.' }),
    blank(20, '3.7 Fill in blank (g).', 'theatre.add_showtime(movie_name)', { r: 'g' }),
    blank(21, '3.8 Fill in blank (h).', 'not self.reserve_ticket(best_showtime)', { r: 'h' }),
    blank(22, '3.9 Fill in blank (i).', 'user.reserve_ticket(best_showtime)', { r: 'i' }),
    text('Q3.10: Suppose Brian wants to be able to cancel a showtime through the system. He plans to do this by adding a cancel instance method to the Theatre class, which removes the cancelled showtime from the theatre’s showtimes dictionary. However, there is currently no way to remove that showtime from every user’s reservations list, if they had already reserved a ticket. (The exam also asks you to describe the new attribute in 20 words or less: the official answer is “The Users who have reserved a ticket to the Showtime”. That part isn’t checked here.)'),
    mc(23, '3.10 What is the best way to solve this problem so that Brian only needs to call cancel to cancel a showtime?', ['Add an instance attribute to Showtime', 'Add an instance attribute to User'], 0),
  ], { run: true, support: ['Theatre.add_showtime = add_showtime\nUser.reserve_ticket = reserve_ticket\nUser.reserve_group_tickets = reserve_group_tickets'] }),
  problem('4', 'Family Trees (12.0 pts)', [{ n: '4', t: ['MUTABLE_TREES', 'TREE_RECURSION'] }], [
    text('Implement exists_path, a function that takes in a Tree instance t and a positive integer k greater than 1. It returns whether there exists a root-to-leaf path in t whose labels are all multiples of k. The input t should not be modified. The Tree class appears on the final study guide.'),
    py(`
def exists_path(t: Tree, k: int) -> bool:
  """
  >>> exists_path(Tree(1), 2)
  False
  >>> exists_path(Tree(3), 3)
  True
  >>> t1 = Tree(2, [Tree(4, [Tree(5, [Tree(4)]), Tree(6)])])
  >>> exists_path(t1, 2)
  True
  >>> t2 = Tree(6, [Tree(4, [Tree(7)]), Tree(2)])
  >>> exists_path(t2, 2)
  True
  >>> t2.branches.remove(t2.branches[1])
  >>> exists_path(t2, 2)
  False
  """
  if ⟪a⟫:
    if ⟪b⟫:
      return True
    return ⟪c⟫([⟪d⟫ for b in t.branches])
  return ⟪e⟫`, { a: 't.label % k == 0', b: 't.is_leaf()', c: 'any', d: 'exists_path(b, k)', e: 'False' }),
    blank(24, '4.1 Fill in blank (a).', 't.label % k == 0', { r: 'a' }),
    blank(25, '4.2 Fill in blank (b).', 't.is_leaf()', { r: 'b' }),
    mc(26, '4.3 Fill in blank (c).', ['sum', 'len', 'min', 'max', 'any', 'all'], 4),
    blank(27, '4.4 Fill in blank (d).', 'exists_path(b, k)', { r: 'd' }),
    blank(28, '4.5 Fill in blank (e).', 'False', { r: 'e' }),
    text('Definition: In a tree, nodes are siblings if they share the same parent node (branches of the same Tree instance). Given a positive integer k, a node is lonely if it is the only sibling that has a label that isn’t a multiple of k (all other siblings (if any) have labels that are multiples of k).', 'Implement remove_lonely, a function that takes in a Tree instance t and a positive integer k greater than 1. It removes all non-root lonely nodes (t should be mutated in place).', 'A lonely node should be removed even if it has no other siblings. The parent of each remaining node should become its nearest ancestor that was not removed.', 'Hint: The index method of a list takes a value x and returns the index of the first occurrence of x in the list. [\'a\', \'b\', \'c\'].index(\'b\') evaluates to 1. If x does not occur in the list, it will error.'),
    py(`
def remove_lonely(t: Tree, k: int) -> None:
  """
  >>> t1 = Tree(3)
  >>> remove_lonely(t1, 3)
  >>> t1  # Nothing happens to root
  Tree(3)
  >>> t2 = Tree(1, [Tree(3, [Tree(4)]), Tree(5), Tree(6)])
  >>> remove_lonely(t2, 2)
  >>> t2  # There are no lonely siblings
  Tree(1, [Tree(3, [Tree(4)]), Tree(5), Tree(6)])
  >>> t3 = Tree(1, [Tree(3, [Tree(8)]),
  ...               Tree(5, [Tree(6), Tree(4), Tree(12)]),
  ...               Tree(9)])
  >>> remove_lonely(t3, 3)
  >>> print(t3)  # There were lonely siblings
  1
    3
    6
    12
    9
  """
  for b in t.branches:
    ⟪f⟫

  non_multiples = list(filter(lambda b: ⟪g⟫, t.branches))

  if ⟪h⟫:    # Is there a lonely sibling?
    to_remove = ⟪i⟫
    i = t.branches.index(to_remove)
    ⟪j⟫ = t.branches[:i] + ⟪k⟫ + t.branches[i+1:]`, { f: 'remove_lonely(b, k)', g: 'b.label % k != 0', h: 'len(non_multiples) == 1', i: 'non_multiples[0]', j: 't.branches', k: 'to_remove.branches' }),
    blank(29, '4.6 Fill in blank (f).', 'remove_lonely(b, k)', { r: 'f' }),
    blank(30, '4.7 Fill in blank (g).', 'b.label % k != 0', { r: 'g' }),
    mc(31, '4.8 Fill in blank (h).', ['non_multiples', 't.branches', 'len(non_multiples) == 1', 'len(t.branches) == 1'], 2),
    blank(32, '4.9 Fill in blank (i).', 'non_multiples[0]', { r: 'i' }),
    blank(33, '4.10 Fill in blank (j).', 't.branches', { r: 'j' }),
    blank(34, '4.11 Fill in blank (k).', 'to_remove.branches', { r: 'k' }),
  ], { run: true }),
  problem('5', 'Commuting to Linked List Land (10.0 pts)', [{ n: '5', t: ['LINKED_LISTS'] }], [
    text('An airport is a Link whose first attribute is a station and rest attribute is another airport. A station is a Link whose first attribute is the city name where the station is located (str) and rest attribute is another station. Implement best_route, which returns the length of the shortest valid travel route from the first airport in airports to the destination city named dest. You may assume that dest exists, city names are unique, and neither airports nor stations contain any cycles.',
      'A valid travel route starts at the first airport in the airports linked list and ends at the destination’s train station. At each airport, you can either transfer to the city’s train station or take a flight to the next airport. Once you transfer to a station, you cannot return to an airport. Transfers take 1 unit of length, except transferring from a city’s airport to its train station, which takes 0 units.',
      'The exam’s diagram of the doctests’ airports and stations (a picture, described here): the stations are one linked list A → B → C → D → E → F → G. The airports are a linked list of four airports, in order A, D, G, B; each airport’s first is the station of that city in the stations list.',
      'In the doctests below, calling the setup function constructs that diagram. You do not need to know how it works. Also, for all subparts, do NOT violate the abstraction barrier of Link.',
      'Hints: float("inf") represents a positive infinite value. For all integers n, n < float("inf") and n + float("inf") == float("inf"). Also, the Link class appears on the final study guide.'),
    py(`
def best_route(airports: Link, dest: str) -> int:
    """
    >>> airports = setup(["A", "B", "C", "D", "E", "F", "G"], ["A", "D", "G", "B"])
    >>> best_route(airports, "A")
    0
    >>> best_route(airports, "C") # A -> B -> C
    2
    >>> best_route(airports, "F") # A -> D -> E -> F
    3
    """
    def take_train(stations):
        if ⟪a⟫:
            return float('inf')
        if ⟪b⟫:
            return ⟪c⟫
        return ⟪d⟫

    if ⟪e⟫:
        return float('inf')
    return min(⟪f⟫, ⟪g⟫)`, { a: 'stations is Link.empty', b: 'stations.first == dest', c: '0', d: '1 + take_train(stations.rest)', e: 'airports is Link.empty', f: '1 + best_route(airports.rest, dest)', g: 'take_train(airports.first)' }),
    mc(35, '5.1 Fill in blank (a).', ['stations == Link.empty', 'stations == ()', 'not stations', 'stations is Link.empty', 'stations is ()'], 3),
    blank(36, '5.2 Fill in blank (b).', 'stations.first == dest', { r: 'b', x: 'Alternatively, stations.first != dest, with (c) and (d) swapped: (c) is 1 + take_train(stations.rest) and (d) is 0. Each blank is checked with the official answers in the others, so use Check whole solution for that version.' }),
    blank(37, '5.3 Fill in blank (c).', '0', { r: 'c', x: 'If 5.2 is stations.first != dest, this blank should be 1 + take_train(stations.rest); use Check whole solution for that version.' }),
    blank(38, '5.4 Fill in blank (d).', '1 + take_train(stations.rest)', { r: 'd', x: 'If 5.2 is stations.first != dest, this blank should be 0; use Check whole solution for that version.' }),
    blank(39, '5.5 Fill in blank (e).', 'airports is Link.empty', { r: 'e' }),
    blank(40, '5.6 Fill in blank (f).', '1 + best_route(airports.rest, dest)', { r: 'f' }),
    mc(41, '5.7 Fill in blank (g).', ['take_train(airports)', 'take_train(airports.first)', 'take_train(airports.rest)', '1 + take_train(airports)', '1 + take_train(airports.first)', '1 + take_train(airports.rest)'], 1),
  ], { run: true, support: [`
def setup(cities, airport_cities):
    stations, station_of = Link.empty, {}
    for city in reversed(cities):
        stations = Link(city, stations)
        station_of[city] = stations
    airports = Link.empty
    for city in reversed(airport_cities):
        airports = Link(station_of[city], airports)
    return airports`] }),
  problem('6', 'World Cup Efficiency (5.0 pts)', [{ n: '6', t: ['EFFICIENCY', 'LISTS'] }], [
    py(`
def scoring_ways(n):
  if n == 0:
    return 1
  elif n < 0:
    return 0
  else:
    return scoring_ways(n - 1) + scoring_ways(n - 2)`, null, { ln: true, norun: true }),
    mc(42, '6.1 What is the code’s order of growth with respect to n, an integer?', ORDERS, 4, { x: 'Most non-base-case calls create two additional recursive calls. The resulting recursion tree grows exponentially with n.' }),
    py(`
def tournament_data(teams):
  result = []
  for team in teams:
    result.append(team)
  for match_number in range(104):
    result.append(match_number)
  return result`, null, { ln: true, norun: true }),
    mc(43, '6.2 What is the code’s order of growth with respect to the number of elements in teams, an iterable? Assume that append takes constant time.', ORDERS, 2, { x: 'If teams contains n elements, the first loop executes n times. The second loop always executes exactly 104 times. The total work is n + 104, which grows linearly with n.' }),
    py(`
def possible_matchups(teams):
  for team1 in teams:
    for team2 in teams:
      if team1 != team2:
        print(team1, team2)`, null, { ln: true, norun: true }),
    mc(44, '6.3 What is the code’s order of growth with respect to the number of elements in teams, an iterable?', ORDERS, 3, { x: 'The function processes every distinct pair of teams once. If there are n teams, the number of pairs is proportional to n * n, so the runtime grows quadratically.' }),
    text('6.4 (Extra credit, up to 2 points; you must get the entire problem correct.) Write count_duplicate_evens, a function that takes linear time (O(n)) and returns the number of even integers that appear more than once in scores (a list of integers).', 'You may not need all lines and you may not use more than the 12 lines provided. Each line must contain up to one Python statement. Make sure you clearly indent when necessary. (Checking runs the doctests; it can’t confirm your solution takes linear time.)'),
    py(`
def count_duplicate_evens(scores: list[int]) -> int:
  """
  >>> count_duplicate_evens([1, 5, 8, 8, 12])
  1
  >>> count_duplicate_evens([4, 3])
  0
  >>> count_duplicate_evens([1, 1, 4])
  0
  >>> count_duplicate_evens([2, 2, 2, 1, 4, 4])
  2
  """
  ⟪a⟫`, { a: DUPLICATE_BODY }),
    blank(45, '6.4 Write the body of count_duplicate_evens (up to 12 lines).', DUPLICATE_BODY, { r: 'a' }),
  ], { run: true }),
  problem('9', '2026 Formula 1 Season meets SQL (10.0 pts)', [{ n: '9', t: ['SQL'] }], [
    text('You are given some data about the 2026 Formula 1 season so far.', 'The drivers table has one row per driver and the columns: id (a unique 3-letter abbreviation), their nationality (string, a 3-letter abbreviation), their team (string), and their points (int). Each F1 team has two drivers. There are twenty two total drivers.', 'The races table has one row per race and columns for the date (string), winner (string, corresponds to drivers.id), and laps completed (int).', 'In the tables below, values in string columns are displayed without quotation marks for brevity. NOTE: For all subparts, remember that a single line of SQL code can contain multiple clauses.'),
    sql(`
drivers:
id  | nationality | team            | points
----+-------------+-----------------+-------
ANT | ITA         | Mercedes        | 204
RUS | GBR         | Mercedes        | 154
HAM | GBR         | Ferrari         | 159
LEC | MON         | Ferrari         | 126
NOR | GBR         | McLaren         | 103
PIA | AUS         | McLaren         | 92
VER | NED         | Red Bull Racing | 91
HAD | FRA         | Red Bull Racing | 60
LAW | NZL         | Racing Bulls    | 39
LIN | GBR         | Racing Bulls    | 22
GAS | FRA         | Alpine          | 42
COL | ARG         | Alpine          | 19
BEA | GBR         | Haas F1 Team    | 18
OCO | FRA         | Haas F1 Team    | 3
BOR | BRA         | Audi            | 10
HUL | GER         | Audi            | 0
SAI | ESP         | Williams        | 6
ALB | THA         | Williams        | 5
BOT | FIN         | Cadillac        | 0
PER | MEX         | Cadillac        | 0
ALO | ESP         | Aston Martin    | 1
STR | CAN         | Aston Martin    | 0

races:
date     | winner | laps
---------+--------+-----
08 March | RUS    | 58
15 March | ANT    | 56
29 March | ANT    | 53
03 May   | ANT    | 57
24 May   | ANT    | 68
07 June  | ANT    | 78
14 June  | HAM    | 66
28 June  | RUS    | 71
05 July  | LEC    | 52
19 July  | ANT    | 44`),
    text('9.1 You run the following query.'),
    sql(`
SELECT team, COUNT(*) AS count
  FROM drivers AS d, races AS r
  WHERE d.id = r.winner
  GROUP BY team
  ORDER BY COUNT(*) DESC;`),
    blank(46, '9.1 Complete the table this query returns (columns team and count). Write one row per line, the team then the count, e.g. "Team 3". You do not need to enclose strings in quotes.', ['Mercedes 8\nFerrari 2', 'Mercedes, 8\nFerrari, 2', 'Mercedes | 8\nFerrari | 2']),
    text('Create a table with every driver’s ID and their absolute point difference to their teammate. Only include drivers who have more points than their teammate, except in case of a tie (no point difference). In case of a tie, only include the driver whose three-letter abbreviation comes first in the alphabet. Your final table should be ordered by the point difference in descending order, and then by the driver’s ID in ascending order.'),
    sql(`
SELECT ⟪a⟫ as id, ⟪b⟫ AS differences
FROM ⟪c⟫ AS a JOIN ⟪d⟫ AS b
ON ⟪e⟫ AND ( a.points > b.points OR ( ⟪f⟫ ) )
ORDER BY ⟪g⟫;`, { a: 'a.id', b: 'a.points - b.points', c: 'drivers', d: 'drivers', e: 'a.team = b.team', f: 'a.points = b.points AND a.id < b.id', g: 'differences DESC, a.id' }),
    mc(47, '9.2 Fill in blank (a).', ['a.id', 'a.team', 'a.winner', 'a.nationality', 'a.date', 'a.laps'], 0),
    blank(48, '9.3 Fill in blank (b).', ['a.points - b.points', 'ABS(a.points - b.points)'], { x: 'It is not necessary to use ABS if the join condition checks that a.points >= b.points.' }),
    mc(49, '9.4 Fill in blank (c).', ['drivers', 'races'], 0),
    mc(50, '9.5 Fill in blank (d).', ['drivers', 'races'], 0),
    blank(51, '9.6 Fill in blank (e).', 'a.team = b.team'),
    blank(52, '9.7 Fill in blank (f).', 'a.points = b.points AND a.id < b.id'),
    blank(53, '9.8 Fill in blank (g).', ['differences DESC, a.id', 'differences DESC, a.id ASC', 'a.points - b.points DESC, a.id', 'ABS(a.points - b.points) DESC, a.id', 'differences DESC, id'], { x: 'You may add ASC explicitly, replace differences with a.points - b.points or ABS(a.points - b.points), and replace a.id with id.' }),
    text('Complete the query so that it returns each team and its total points, but only includes teams with more than 100 total points.'),
    sql(`
SELECT team, ⟪a⟫ AS total_points
FROM drivers
⟪b⟫
ORDER BY total_points DESC;`, { a: 'SUM(points)', b: 'GROUP BY team HAVING SUM(points) > 100' }),
    mc(54, '9.9 Fill in blank (a).', ['COUNT(DISTINCT points)', 'COUNT(*)', 'MAX(points)', 'MIN(points)', 'SUM(points)', 'points'], 4),
    blank(55, '9.10 Fill in blank (b).', ['GROUP BY team HAVING SUM(points) > 100', 'GROUP BY team HAVING total_points > 100'], { x: 'In SQLite, it is acceptable to replace SUM(points) > 100 with total_points > 100. (Not in most other SQL variants, because SELECT is evaluated after HAVING.)' }),
  ]),
]);
e.omitted = [{ n: '7', why: 'a Scheme problem; Scheme isn’t on this semester’s topic list' }, { n: '8', why: 'a Scheme macros problem; Scheme isn’t on this semester’s topic list' }];
export default e;
