// Scheme problems adapted to Gleam BY THIS SITE (not course staff). CS 61A Fall 2026 teaches Gleam instead of Scheme,
// so these rewrite past Scheme exam problems in Gleam, keeping each original's structure, blanks and examples where
// Gleam allows. Answers follow the official Scheme solutions and are checked by compiling and running them
// (npm run practice:test). The page labels every problem as adapted, with the problem it came from (field `adapted`).
import { exam, problem, text, gl, glTests, blank, mc, h } from '../author.mjs';

const site = t => [{ n: '', t: ['GLEAM', ...t], by: 'site' }];
const TR = ['Yes, it is tail recursive.', 'No, it is not tail recursive.'];

export default exam('61a-fa26-gleam-adapted', 'Scheme problems adapted to Gleam', null, null, [
  problem('1', 'Treequality (16.0 pts)', site(['ALGEBRAIC_DATA_TYPES', 'PATTERN_MATCHING', 'RECURSION', 'TREES', 'HIGHER_ORDER_FUNCTIONS']), [
    text('Help Gleam trees check for treequality! In this version a tree is a custom type, and all, zip and treequals take Gleam lists instead of Scheme lists. The original’s question about whether all is tail recursive is left out.'),
    gl(`
import gleam/list

/// A tree has an integer label and a list of branches, each of which is a Tree.
pub type Tree {
  Tree(label: Int, branches: List(Tree))
}`),
    h('(a) all'),
    text('all takes in a list of booleans, s, and returns True if all of its elements are True or if s has no elements. Otherwise, it returns False.'),
    gl(`
pub fn all(s: List(Bool)) -> Bool {
  case s {
    [] -> True
    [first, ..rest] -> first && all(rest)
  }
}`),
    h('(b) zip'),
    text('Implement zip, which takes in two lists, s0 and s1, and returns a list of pairs (tuples) where the pair at index i contains the element at index i in s0 and the element at index i in s1. If s0 and s1 have different lengths, only zip together the first k elements where k is the length of the shorter list.'),
    gl(`
pub fn zip(s0: List(a), s1: List(b)) -> List(#(a, b)) {
  case s0, s1 {
    [first0, ..rest0], [first1, ..rest1] -> [⟪c⟫, ..zip(⟪d⟫)]
    _, _ -> ⟪e⟫
  }
}`, { c: '#(first0, first1)', d: 'rest0, rest1', e: '[]' }),
    blank(1, 'i. Fill in blank (c).', '#(first0, first1)', { r: 'c' }),
    blank(2, 'ii. Fill in blank (d).', 'rest0, rest1', { r: 'd' }),
    blank(3, 'iii. Fill in blank (e).', '[]', { r: 'e' }),
    mc(4, 'iv. Is zip tail recursive?', TR, 1),
    h('(c) treequals'),
    text('Implement treequals, which takes in two trees, t0 and t1, and returns True if they have the exact same tree structure and the same label values and False otherwise. Don’t compare whole trees with ==. Reminder: all returns True when called on a list with no elements.'),
    gl(`
pub fn treequals(t0: Tree, t1: Tree) -> Bool {
  ⟪f⟫
  && ⟪g⟫
  && all(list.map(⟪i⟫, fn(p) { ⟪h⟫ }))
}`, { f: 't0.label == t1.label', g: 'list.length(t0.branches) == list.length(t1.branches)', i: 'zip(t0.branches, t1.branches)', h: 'treequals(p.0, p.1)' }),
    blank(5, 'i. Fill in blank (f).', ['t0.label == t1.label', 'list.length(t0.branches) == list.length(t1.branches)'], { r: 'f' }),
    blank(6, 'ii. Fill in blank (g). Hint: use list.length.', ['list.length(t0.branches) == list.length(t1.branches)', 't0.label == t1.label'], { r: 'g' }),
    blank(7, 'iii. Fill in blank (h).', 'treequals(p.0, p.1)', { r: 'h' }),
    blank(8, 'iv. Fill in blank (i). Hint: use zip.', 'zip(t0.branches, t1.branches)', { r: 'i' }),
    text('Tests (run when you check a code answer):'),
    glTests(`
pub fn all_test() {
  assert all([True, True, True])
  assert !all([True, False, True])
  assert all([])
}

pub fn zip_test() {
  assert zip([1, 2, 3], [-1, -2, -3]) == [#(1, -1), #(2, -2), #(3, -3)]
  assert zip([1, 2, 3], [-1, -2, -3, -4, -5]) == [#(1, -1), #(2, -2), #(3, -3)]
  assert zip([], [1, 2]) == []
}

pub fn treequals_test() {
  let t = Tree(1, [Tree(2, []), Tree(3, [])])
  assert treequals(t, Tree(1, [Tree(2, []), Tree(3, [])]))
  assert !treequals(t, Tree(1, [Tree(3, []), Tree(2, [])]))
  assert !treequals(t, Tree(1, [Tree(3, []), Tree(3, [])]))
  assert !treequals(t, Tree(1, [Tree(2, []), Tree(4, [])]))
  assert !treequals(t, Tree(1, [Tree(2, []), Tree(3, [Tree(4, [])])]))
  assert !treequals(t, Tree(1, [Tree(2, [])]))
}`),
  ], { run: 'gleam', adapted: { from: 'Summer 2024 Final Q6 (Treequality)', problem: '61a-su24-final/6' } }),

  problem('2', 'Pad and Shorten (10.0 pts)', site(['PATTERN_MATCHING', 'RECURSION', 'LISTS', 'EFFICIENCY']), [
    text('In this version the lists are Gleam lists and case patterns replace the original’s cond and if. You may not write case or if in the blanks.'),
    h('(a) pad'),
    text('Implement pad, which takes in a list s of length m and adds el to the end of the list until there are exactly n elements. If m is greater than n, return the same list. For example, pad([1, 2, 3], 6, 4) returns [1, 2, 3, 4, 4, 4], and pad([1, 2, 3], 0, 5) returns [1, 2, 3].'),
    gl(`
pub fn pad(s: List(a), n: Int, el: a) -> List(a) {
  case n, s {
    0, _ -> ⟪a⟫
    _, [] -> [⟪b⟫, ..⟪c⟫]
    _, [first, ..rest] -> [⟪d⟫, ..⟪e⟫]
  }
}`, { a: 's', b: 'el', c: 'pad([], n - 1, el)', d: 'first', e: 'pad(rest, n - 1, el)' }),
    blank(9, 'i. Fill in blank (a).', 's', { r: 'a' }),
    blank(10, 'ii. Fill in blank (b).', 'el', { r: 'b' }),
    blank(11, 'iii. Fill in blank (c).', 'pad([], n - 1, el)', { r: 'c' }),
    blank(12, 'iv. Fill in blank (d).', 'first', { r: 'd' }),
    blank(13, 'v. Fill in blank (e).', 'pad(rest, n - 1, el)', { r: 'e' }),
    h('(b) shorten'),
    text('The list_concat function takes in a list a and a list b, and returns a list of the elements of a followed by the elements of b. Its implementation is below for reference.',
      'Implement shorten, which takes in a list s of length m and removes elements from the end of the list until there are exactly n elements. If m is less than n, return the same list. For example, shorten([1, 2, 3, 4, 5], 3) returns [1, 2, 3]. You must use list_concat.'),
    gl(`
pub fn list_concat(a: List(x), b: List(x)) -> List(x) {
  case a {
    [] -> b
    [first, ..rest] -> [first, ..list_concat(rest, b)]
  }
}

pub fn shorten(s: List(a), n: Int) -> List(a) {
  shorten_tail(s, n, [])
}

fn shorten_tail(s: List(a), n: Int, t: List(a)) -> List(a) {
  case s, n {
    ⟪f⟫ -> ⟪g⟫
    [first, ..rest], _ -> shorten_tail(rest, n - 1, ⟪h⟫)
  }
}`, { f: '[], _ | _, 0', g: 't', h: 'list_concat(t, [first])' }),
    blank(14, 'i. Fill in blank (f), a pattern.', '[], _ | _, 0', { r: 'f' }),
    blank(15, 'ii. Fill in blank (g).', 't', { r: 'g' }),
    blank(16, 'iii. Fill in blank (h).', 'list_concat(t, [first])', { r: 'h' }),
    mc(17, 'iv. What is the space complexity of shorten with respect to n? Assume n < m.', ['θ(log(n))', 'θ(1)', 'θ(n)', 'θ(n²)', 'θ(2ⁿ)'], 2),
    mc(18, 'v. What is the time complexity of shorten with respect to n? Assume n < m.', ['θ(log(n))', 'θ(1)', 'θ(n)', 'θ(n²)', 'θ(2ⁿ)'], 3),
    text('Tests (run when you check a code answer):'),
    glTests(`
pub fn pad_test() {
  assert pad([1, 2, 3], 6, 4) == [1, 2, 3, 4, 4, 4]
  assert pad([1, 2, 3], 0, 5) == [1, 2, 3]
  assert pad([1, 2, 3, 4, 5], 3, 0) == [1, 2, 3, 4, 5]
  assert pad([], 2, 7) == [7, 7]
}

pub fn shorten_test() {
  assert shorten([1, 2, 3, 4, 5], 3) == [1, 2, 3]
  assert shorten([1, 2], 5) == [1, 2]
  assert shorten([1, 2, 3], 0) == []
}`),
  ], { run: 'gleam', adapted: { from: 'Summer 2023 Final Q8 (List Methods)', problem: '61a-su23-final/8' } }),

  problem('3', 'Dictionary Abstraction (8.0 pts)', site(['IMMUTABLE_DATA', 'HIGHER_ORDER_FUNCTIONS', 'LISTS', 'DATA_ABSTRACTION']), [
    text('Implement a dictionary abstraction in Gleam. A dictionary is represented as a list of #(key, value) pairs, oldest first. make_dict returns an empty dictionary and is implemented for you.',
      'add_item takes in a dictionary dict, a key and a value, and returns a new dictionary with a pair from key to value at the end of the list. If key already exists in dict, the old pair is removed. Gleam data is immutable, so add_item returns a new list instead of changing dict.',
      'get_item takes in a dictionary dict and a key and returns Ok(value) for that key. The Scheme original raised an error for a missing key; this version returns Error(Nil). There is no blank for the original’s (e) (car), which Gleam doesn’t need.'),
    gl(`
import gleam/list

pub fn make_dict() -> List(#(k, v)) {
  []
}

pub fn add_item(dict: List(#(k, v)), key: k, value: v) -> List(#(k, v)) {
  ⟪a⟫(list.filter(dict, fn(pair) { ⟪b⟫ }), [⟪c⟫])
}

pub fn get_item(dict: List(#(k, v)), key: k) -> Result(v, Nil) {
  case list.filter(dict, fn(pair) { ⟪f⟫ }) {
    [pair] -> Ok(⟪d⟫)
    _ -> Error(Nil)
  }
}`, { a: 'list.append', b: 'pair.0 != key', c: '#(key, value)', f: 'pair.0 == key', d: 'pair.1' }),
    blank(19, '(a) Fill in blank (a).', 'list.append', { r: 'a' }),
    blank(20, '(b) Fill in blank (b).', 'pair.0 != key', { r: 'b' }),
    blank(21, '(c) Fill in blank (c).', '#(key, value)', { r: 'c' }),
    blank(22, '(d) Fill in blank (d).', 'pair.1', { r: 'd' }),
    blank(23, '(f) Fill in blank (f).', 'pair.0 == key', { r: 'f' }),
    blank(24, [{ p: '(g) What does this expression evaluate to? Write a Gleam value.' }, { c: 'add_item(add_item([#("x", 1)], "y", 2), "x", 3)', lang: 'gleam' }], '[#("y", 2), #("x", 3)]', { ev: 'add_item(add_item([#("x", 1)], "y", 2), "x", 3)' }),
    blank(25, [{ p: '(h) What does this expression evaluate to? Write a Gleam value.' }, { c: 'get_item(add_item(make_dict(), "x", 1), "z")', lang: 'gleam' }], 'Error(Nil)', { ev: 'get_item(add_item(make_dict(), "x", 1), "z")' }),
    text('Tests (run when you check a code answer):'),
    glTests(`
pub fn dict_test() {
  let d = add_item(make_dict(), "a", "b")
  assert d == [#("a", "b")]
  assert get_item(d, "a") == Ok("b")
  let d = add_item(d, "b", "c")
  assert d == [#("a", "b"), #("b", "c")]
  let d = add_item(d, "a", "c")
  assert d == [#("b", "c"), #("a", "c")]
  assert get_item(d, "a") == Ok("c")
  assert get_item(d, "b") == Ok("c")
  assert get_item(d, "c") == Error(Nil)
}`),
  ], { run: 'gleam', adapted: { from: 'Summer 2024 Final Q7 (Scheme Dictionary Abstraction)', problem: '61a-su24-final/7' } }),

  problem('4', 'Rotation Situation (8.0 pts)', site(['PATTERN_MATCHING', 'RECURSION', 'LISTS']), [
    text('Implement rotate, which takes in a list s and shifts all elements to the left by k indices. For example, rotate([1, 2, 3, 4, 5], 2) returns [3, 4, 5, 1, 2], as we shift 1 and 2 by two indices to the left, pushing them to the back of the list. It should still work when k is larger than the length of the list. (The Scheme original errored on an empty list; this version returns [].) The original’s question about scheme_eval is left out.'),
    gl(`
import gleam/list

pub fn rotate(s: List(a), k: Int) -> List(a) {
  case k, s {
    0, _ -> ⟪a⟫
    _, [] -> []
    _, [first, ..rest] -> rotate(⟪b⟫(⟪c⟫, ⟪d⟫), ⟪e⟫)
  }
}`, { a: 's', b: 'list.append', c: 'rest', d: '[first]', e: 'k - 1' }),
    blank(26, '(a) Fill in blank (a).', 's', { r: 'a' }),
    blank(27, '(b) Fill in blank (b).', 'list.append', { r: 'b' }),
    blank(28, '(c) Fill in blank (c).', 'rest', { r: 'c' }),
    blank(29, '(d) Fill in blank (d).', '[first]', { r: 'd' }),
    blank(30, '(e) Fill in blank (e).', 'k - 1', { r: 'e' }),
    mc(31, '(f) Is rotate tail recursive?', TR, 0),
    blank(32, [{ p: '(g) What does this expression evaluate to? Write a Gleam value.' }, { c: 'rotate(["a", "b", "c"], 4)', lang: 'gleam' }], '["b", "c", "a"]', { ev: 'rotate(["a", "b", "c"], 4)' }),
    text('Tests (run when you check a code answer):'),
    glTests(`
pub fn rotate_test() {
  assert rotate([1, 2, 3, 4, 5], 0) == [1, 2, 3, 4, 5]
  assert rotate([1, 2, 3, 4, 5], 1) == [2, 3, 4, 5, 1]
  assert rotate([1, 2, 3, 4, 5], 2) == [3, 4, 5, 1, 2]
  assert rotate([1, 2, 3, 4, 5], 7) == [3, 4, 5, 1, 2]
  assert rotate([], 3) == []
}`),
  ], { run: 'gleam', adapted: { from: 'Summer 2025 Final Q7 (Rotation Situation)', problem: '61a-su25-final/7' } }),
]);
