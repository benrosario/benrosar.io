import doctest, re, io, contextlib, textwrap
from operator import add, sub, mul, truediv, floordiv, mod, neg
class Link:
    empty = ()
    def __init__(self, first, rest=empty):
        assert rest is Link.empty or isinstance(rest, Link)
        self.first = first
        self.rest = rest
    def __repr__(self):
        if self.rest is not Link.empty:
            rest_repr = ', ' + repr(self.rest)
        else:
            rest_repr = ''
        return 'Link(' + repr(self.first) + rest_repr + ')'
    def __str__(self):
        string = '<'
        while self.rest is not Link.empty:
            string += str(self.first) + ' '
            self = self.rest
        return string + str(self.first) + '>'
class Tree:
    def __init__(self, label, branches=[]):
        for b in branches:
            assert isinstance(b, Tree)
        self.label = label
        self.branches = list(branches)
    def is_leaf(self):
        return not self.branches
    def __repr__(self):
        if self.branches:
            branch_str = ', ' + repr(self.branches)
        else:
            branch_str = ''
        return 'Tree({0}{1})'.format(repr(self.label), branch_str)
    def __str__(self):
        def indented(t):
            lines = [str(t.label)]
            for b in t.branches:
                lines += ['  ' + l for l in indented(b)]
            return lines
        return '\n'.join(indented(self))
def link_from_program(program):
    s = Link.empty
    for c in reversed(program):
        s = Link(c, s)
    return s
def is_tree(t):
    return type(t) == list and len(t) > 0 and all(is_tree(b) for b in t[1:])
def run_tests(src, test_src=None):
    g = {'__name__': '__exam__'}
    for k in ('Link', 'Tree', 'is_tree', 'link_from_program', 're', 'add', 'sub', 'mul', 'truediv', 'floordiv', 'mod', 'neg'):
        g[k] = globals()[k]
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(src, '<answer>', 'exec'), g)
    except Exception as e:
        return {'ok': False, 'err': type(e).__name__ + ': ' + str(e)}
    docs = re.findall(r'"""(.*?)"""', test_src or src, re.S)
    try:
        test = doctest.DocTestParser().get_doctest('\n\n'.join(textwrap.dedent('\n' + x) for x in docs), g, 'exam', None, 0)
    except ValueError as e:
        return {'ok': False, 'err': 'doctest: ' + str(e)}
    flags = doctest.NORMALIZE_WHITESPACE | doctest.ELLIPSIS
    out = io.StringIO()
    runner = doctest.DocTestRunner(optionflags=flags)
    runner.run(test, out=out.write)
    r = runner.summarize(verbose=False)
    return {'ok': r.failed == 0, 'n': r.attempted, 'failed': r.failed, 'err': out.getvalue()[-1500:]}
