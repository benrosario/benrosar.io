// Original practice written by this site. These are not past exam questions or staff predictions.
import { exam, problem, text, py, gl, glTests, blank, mc } from '../author.mjs';
const tags = (...t) => [{n:'',t,by:'site'}];
const help = (x, ...hints) => ({x,hints,explanationBy:'site'});
const e = exam('61a-fa26-extra-practice', 'Extra Gleam and interpreter practice', null, null, [
  problem('1', 'Evaluating an expression tree', tags('INTERPRETERS','TREE_RECURSION'), [
    text('Site-authored practice, not a course-staff problem. An expression is a tuple: ("num", value), ("add", left, right), or ("mul", left, right). The evaluator returns a number. Complete its recursive cases.'),
    py(`
def evaluate_expr(expr):
    """Evaluate this small expression language.
    >>> evaluate_expr(('num', 7))
    7
    >>> evaluate_expr(('add', ('num', 2), ('mul', ('num', 3), ('num', 4))))
    14
    >>> evaluate_expr(('mul', ('add', ('num', -1), ('num', 1)), ('num', 9)))
    0
    >>> evaluate_expr(('add', ('num', -3), ('num', 2)))
    -1
    """
    kind = expr[0]
    if kind == 'num':
        return expr[1]
    left, right = expr[1:]
    if kind == 'add':
        return ⟪a⟫
    if kind == 'mul':
        return ⟪b⟫
    raise ValueError('unknown expression')`, {a:'evaluate_expr(left) + evaluate_expr(right)',b:'evaluate_expr(left) * evaluate_expr(right)'}),
    blank(1,'(a) Evaluate addition.', 'evaluate_expr(left) + evaluate_expr(right)', {r:'a',...help('Evaluate both operand subtrees before adding their values. For add(num(2), mul(num(3), num(4))), the right subtree yields 12, then 2 + 12 yields 14. Adding the tuple representations would concatenate tuples instead of interpreting them.','What type is left: a number or an expression tuple?','Recursively evaluate each operand, then apply the addition operator.')}),
    blank(2,'(b) Evaluate multiplication.', 'evaluate_expr(left) * evaluate_expr(right)', {r:'b',...help('The structure is the same as addition, but combine operand values with multiplication. In mul(add(num(-1), num(1)), num(9)), the left subtree is 0, so the final value is 0.','Follow the same evaluation rule as the add case.','The recursive calls must happen before multiplying the two results.')}),
    mc(3,'(c) Which phase does evaluate_expr implement?', ['Tokenization: characters to tokens','Parsing: tokens to an expression tree','Evaluation: an expression tree to a value'],2,help('The input is already a structured expression tree. Tokenization and parsing happened earlier; this function interprets the tree to produce a number.','Look at the input and output types.','The function receives tuples, not source text.')),
  ],{run:true}),
  problem('2','Names and local bindings',tags('INTERPRETERS','RECURSION','DATA_ABSTRACTION'),[
    text('This tiny language adds ("name", name) and ("let", name, value_expr, body_expr). A let evaluates value_expr in the old environment and evaluates body_expr in a new environment where name is bound. Do not mutate the original environment.'),
    py(`
def eval_names(expr, env):
    """Evaluate numbers, names and local bindings.
    >>> env = {'x': 10}
    >>> eval_names(('name', 'x'), env)
    10
    >>> eval_names(('let', 'x', ('num', 3), ('name', 'x')), env)
    3
    >>> env
    {'x': 10}
    >>> eval_names(('let', 'x', ('name', 'x'), ('name', 'x')), env)
    10
    >>> eval_names(('let', 'y', ('num', 4), ('name', 'x')), env)
    10
    """
    kind = expr[0]
    if kind == 'num':
        return expr[1]
    if kind == 'name':
        return ⟪a⟫
    if kind == 'let':
        _, name, value_expr, body_expr = expr
        local = dict(env)
        local[name] = ⟪b⟫
        return ⟪c⟫
    raise ValueError('unknown expression')`,{a:'env[expr[1]]',b:'eval_names(value_expr, env)',c:'eval_names(body_expr, local)'}),
    blank(4,'(a) Look up a name.','env[expr[1]]',{r:'a',...help('expr[1] is the name string. Use it as the key into env. With ("name", "x") and {"x": 10}, lookup returns 10.','Which tuple element stores the identifier?','Use that identifier as a dictionary key.')}),
    blank(5,'(b) Compute the value to bind.','eval_names(value_expr, env)',{r:'b',...help('Evaluate the binding expression in env, before installing the new binding. This allows let x = x to refer to the old x. Using local after mutation could accidentally make the binding recursive.','Should the right side see the old binding or the new one?','Use the old environment when evaluating value_expr.')}),
    blank(6,'(c) Evaluate the body.','eval_names(body_expr, local)',{r:'c',...help('The body must see the new binding in local. For let x = 3 in x, evaluation of the body returns 3 while env["x"] remains 10.','The body must see the newly bound name.','Pass the copied and extended environment to the recursive evaluator.')}),
  ],{run:true}),
  problem('3','Exhaustive custom types',tags('GLEAM','ALGEBRAIC_DATA_TYPES','PATTERN_MATCHING'),[
    text('A Packet either contains an integer or has no payload. Complete the exhaustive pattern match. The empty case contributes zero.'),
    gl(`
pub type Packet { Empty Data(Int) }
pub fn payload(packet: Packet) -> Int {
  case packet {
    Empty -> ⟪a⟫
    Data(value) -> ⟪b⟫
  }
}`,{a:'0',b:'value'}),
    blank(7,'(a) Empty payload.','0',{r:'a',...help('Empty contains no integer. Its specified contribution is 0, so it acts as the additive identity.','Use the contribution specified for the empty constructor.','The result must have type Int.')}),
    blank(8,'(b) Extract the payload.','value',{r:'b',...help('Data(value) destructures the constructor and binds its integer to value. Return the bound integer; returning Data(value) would have type Packet, not Int.','The pattern has already extracted the integer.','Which local variable did Data(value) bind?')}),
    glTests(`pub fn payload_test() {
  assert payload(Empty) == 0
  assert payload(Data(8)) == 8
  assert payload(Data(-5)) == -5
}`),
    mc(9,'(c) Why must both constructors be handled?',['Gleam case expressions must cover every possible input constructor.','Empty is automatically converted to Data(0).','Custom types can only be used in case expressions.'],0,help('Packet has two variants. An exhaustive case handles both, so the function returns an Int for every Packet. The compiler does not invent a conversion between variants.','Enumerate the constructors in the type definition.','Can a Packet be Empty as well as Data?')),
  ],{run:'gleam'}),
  problem('4','Results without losing errors',tags('GLEAM','PATTERN_MATCHING','FUNCTIONAL_PROGRAMMING'),[
    text('transform adds one to a successful integer while preserving the original error string.'),
    gl(`
pub fn transform(result: Result(Int, String)) -> Result(Int, String) {
  case result {
    Ok(n) -> ⟪a⟫
    Error(message) -> ⟪b⟫
  }
}`,{a:'Ok(n + 1)',b:'Error(message)'}),
    blank(10,'(a) Transform success.','Ok(n + 1)',{r:'a',...help('Compute n + 1 and wrap it in Ok to preserve Result(Int, String). For Ok(4), the result is Ok(5); the bare integer 5 has the wrong type.','The function must return a Result, not a bare integer.','Keep the success constructor around the transformed number.')}),
    blank(11,'(b) Preserve failure.','Error(message)',{r:'b',...help('Return the original error payload inside Error. Error("missing") must remain Error("missing"), so replacing it with a default success value would hide a failure.','Should a failure become success?','Carry the bound message forward unchanged.')}),
    glTests(`pub fn transform_test() {
  assert transform(Ok(4)) == Ok(5)
  assert transform(Ok(-1)) == Ok(0)
  assert transform(Error("missing")) == Error("missing")
  assert transform(Error("")) == Error("")
}`),
    blank(12,[{p:'(c) What does transform(Error("oops")) evaluate to? Write a Gleam value.'}], 'Error("oops")',{ev:'transform(Error("oops"))',...help('The input selects the Error branch. No arithmetic runs; the original message is returned in Error.','Which case branch matches this constructor?','The error message is preserved.')}),
  ],{run:'gleam'}),
  problem('5','Immutable list processing',tags('GLEAM','IMMUTABLE_DATA','FUNCTIONAL_PROGRAMMING','HIGHER_ORDER_FUNCTIONS'),[
    text('positive_squares returns the squares of the strictly positive entries of a list, in their original order. Use list.filter and list.map.'),
    gl(`
import gleam/list
pub fn positive_squares(values: List(Int)) -> List(Int) {
  let positive = list.filter(values, fn(n) { ⟪a⟫ })
  list.map(positive, fn(n) { ⟪b⟫ })
}`,{a:'n > 0',b:'n * n'}),
    blank(13,'(a) Filter predicate.','n > 0',{r:'a',...help('A filter predicate returns Bool. Keep n only when it is greater than zero; zero is not strictly positive. For [-2, 0, 3], the intermediate list is [3].','Check the word strictly.','The boundary value 0 must be excluded.')}),
    blank(14,'(b) Map each positive integer.','n * n',{r:'b',...help('Mapping computes one new value per retained element. Multiply n by itself: [3, 2] becomes [9, 4]. Mapping preserves order and does not mutate the input list.','Map transforms each retained element independently.','Squaring means multiplying a value by itself.')}),
    glTests(`pub fn squares_test() {
  let values = [-2, 0, 3, 2]
  assert positive_squares(values) == [9, 4]
  assert values == [-2, 0, 3, 2]
  assert positive_squares([]) == []
  assert positive_squares([-1, 0]) == []
  assert positive_squares([1, 1]) == [1, 1]
}`),
  ],{run:'gleam'}),
  problem('6','A Gleam expression interpreter',tags('GLEAM','INTERPRETERS','ALGEBRAIC_DATA_TYPES','TREE_RECURSION'),[
    text('This expression language has integer literals and addition. eval_expr evaluates the syntax tree to an Int. Implement the addition case by interpreting both subexpressions.'),
    gl(`
pub type Expr { Number(Int) Add(Expr, Expr) }
pub fn eval_expr(expr: Expr) -> Int {
  case expr {
    Number(n) -> n
    Add(left, right) -> ⟪a⟫
  }
}`,{a:'eval_expr(left) + eval_expr(right)'}),
    blank(15,'(a) Interpret addition.','eval_expr(left) + eval_expr(right)',{r:'a',...help('left and right have type Expr, so recursively convert each to Int before adding. Add(Number(2), Add(Number(3), Number(4))) evaluates to 2 + (3 + 4) = 9. Constructing Add again would return syntax instead of a value.','Separate the representation of an expression from its value.','Each operand needs a recursive evaluation before integer addition.')}),
    glTests(`pub fn eval_test() {
  assert eval_expr(Number(-4)) == -4
  assert eval_expr(Add(Number(2), Number(3))) == 5
  assert eval_expr(Add(Number(2), Add(Number(3), Number(4)))) == 9
  assert eval_expr(Add(Add(Number(-1), Number(1)), Number(0))) == 0
}`),
    blank(16,'(b) Evaluate Add(Number(2), Add(Number(3), Number(4))).','9',{ev:'eval_expr(Add(Number(2), Add(Number(3), Number(4))))',...help('The inner addition yields 7. The outer addition then combines 2 and 7 to yield 9.','Evaluate the inner tree first.','The outer operation adds 2 to the result of 3 + 4.')}),
  ],{run:'gleam'}),
]);
e.src = {site:true};
for (const p of e.p) p.authored = true;
export default e;
