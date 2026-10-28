// Spring 2025 Final, problems 3 and 8, transcribed from the official exam and solutions (the SQL tables are an
// image in the PDF and are reproduced as text). The other problems aren't imported yet (see `omitted`).
import { exam, problem, text, py, sql, blank, mc, sata } from '../author.mjs';

const e = exam('61a-sp25-final', 'Spring 2025 Final', 'sp25/final/61a-sp25-final', 'sp25-final', [
  problem('3', 'Swap Meet (6.0 pts)', [{ n: '3', t: ['LISTS'] }], [
    text('Implement swap, which takes a list s and non-negative numbers t and u. It returns a list with the same elements as s, but with the elements at indices t and u swapped. Hint: (a + b) - a == b for any integers a and b.'),
    py(`
def swap(s, t, u):
    """Return a new list like s but with the elements at positions t and u swapped.

    >>> letters = ['p', 'q', 'r', 's']
    >>> swap(letters, 0, 2)
    ['r', 'q', 'p', 's']
    >>> letters
    ['p', 'q', 'r', 's']
    """
    assert min(t, u) >= 0 and max(t, u) < len(s)
    def select(i):
        if ⟪a⟫:
            return ⟪b⟫
        else:
            return ⟪c⟫
    return [select(x) for x in ⟪d⟫]`, { a: 'i in [t, u]', b: 's[t + u - i]', c: 's[i]', d: 'range(len(s))' }),
    sata(1, '(a) Fill in blank (a). Select all that apply.', ['i == t or u', 'i == t and u', 'i == t or i == u', 'i == t and i == u', 'i in [t, u]'], [2, 4]),
    blank(2, '(b) Fill in blank (b).', 's[t + u - i]', { r: 'b' }),
    mc(3, '(c) Fill in blank (c).', ['i', 'x', 's[i]', 's[x]'], 2),
    mc(4, '(d) Fill in blank (d).', ['s', 's[t:u]', 'range(s)', 'range(len(s))'], 3),
  ], { run: true }),
  problem('8', 'WHERE Brainrot=’Italian’ (6.0 pts)', [{ n: '8', t: ['SQL'] }], [
    text('The who table has one row per character with its name (a unique string), size (a number), and kind (a string). The kinds table has one row per kind that shows whether it’s living (\'yes\' or \'no\') and what kind it is (a unique string).'),
    sql(`
who:
name                 | size   | kind
---------------------+--------+--------
tralalero tralala    | 800.0  | reptile
bombardiro crocodilo | 600.0  | reptile
lirili larila        | 1500.0 | mammal
capuchino assassino  | 60.0   | object
brr brr patapim      | 80.0   | mammal
chimpanzini bananini | 90.0   | mammal
tung tung tung sahur | 200.0  | object

kinds:                Result Part (a):
living | what         total
-------+--------      ------
yes    | mammal       3070.0
yes    | reptile
no     | object

Result Part (b):
name                 | number
---------------------+-------
bombardiro crocodilo | 1
brr brr patapim      | 2
capuchino assassino  | 2
chimpanzini bananini | 2
lirili larila        | 1
tralalero tralala    | 2`),
    text('(a) Fill in blank (a) to create a one-row, one-column table containing the total size of all characters that have a living kind.'),
    sql(`SELECT SUM(size) AS total FROM ⟪a⟫;`, { a: "who JOIN kinds ON kind=what WHERE living='yes'" }),
    mc(5, '(a) Fill in blank (a).', ['who JOIN kinds ON kind=what WHERE kind=living', "who JOIN kinds ON kind=what WHERE kind='living'", 'who JOIN kinds ON kind=what WHERE living=yes', "who JOIN kinds ON kind=what WHERE living='yes'", 'who JOIN kinds ON kind=kinds WHERE kind=living', "who JOIN kinds ON kind=kinds WHERE kind='living'", 'who JOIN kinds ON kind=kinds WHERE living=yes', "who JOIN kinds ON kind=kinds WHERE living='yes'"], 3),
    text('(b) Two characters can battle if the smaller one is at least half the size of the larger one (or they are the same size). Fill in blank (b) to create a table with one row per character that has two columns: the character’s name and the number of other characters it can battle. For example, lirili larila can only battle tralalero tralala because all other characters are too small. Do not include rows for characters that cannot battle any other characters.'),
    sql(`SELECT a.name, COUNT(*) FROM who AS a, who AS b WHERE a.name != b.name AND ⟪b⟫ GROUP BY a.name;`, { b: 'MIN(a.size, b.size) >= MAX(a.size, b.size) * 0.5' }),
    sata(6, '(b) Fill in blank (b). Select all that apply.', ['a.size >= b.size * 0.5', 'b.size >= a.size * 0.5', 'a.size >= b.size * 0.5 OR b.size >= a.size * 0.5', 'a.size >= b.size * 0.5 AND b.size >= a.size * 0.5', 'MIN(a.size, b.size) >= b.size * 0.5', 'a.size >= MAX(a.size, b.size) * 0.5', 'MIN(a.size, b.size) >= MAX(a.size, b.size) * 0.5', 'MIN(a.size / b.size, b.size / a.size) >= 0.5', 'MAX(a.size / b.size, b.size / a.size) >= 0.5'], [3, 6, 7]),
  ]),
]);
e.omitted = ['1', '2', '4', '5', '6', '9'].map(n => ({ n, why: 'not imported yet' })).concat({ n: '7', why: 'a Scheme problem; Scheme isn’t on this semester’s topic list' });
export default e;
