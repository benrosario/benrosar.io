// The course's tree data abstraction, for checking answers to problems written against it (passed as `support`, so
// it runs with the answer but is never shown). No docstrings: every docstring in the program is run as doctests.
// print(t) shows a tree the way print_tree does, since some exams print trees directly.
export const TREE_ADT = `
class _TreeList(list):
    def __str__(self):
        out = []
        def walk(t, indent):
            out.append('    ' * indent + str(t[0]))
            for b in t[1:]:
                walk(b, indent + 1)
        walk(self, 0)
        return '\\n'.join(out)

def tree(label, branches=[]):
    for branch in branches:
        assert is_tree(branch), 'branches must be trees'
    return _TreeList([label] + list(branches))

def label(tree):
    return tree[0]

def branches(tree):
    return list(tree[1:])

def is_tree(tree):
    if type(tree) not in (list, _TreeList) or len(tree) < 1:
        return False
    for branch in branches(tree):
        if not is_tree(branch):
            return False
    return True

def is_leaf(tree):
    return not branches(tree)

def print_tree(t, indent=0):
    print('  ' * 2 * indent + str(label(t)))
    for b in branches(t):
        print_tree(b, indent + 1)`;
