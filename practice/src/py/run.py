# Running a playground program in Pyodide (py-worker.js runs this file once at startup, after the practice prelude).
# The program runs as __main__ in its own namespace, without the prelude's Link and Tree, as it would on the student's
# computer. Python's stdlib only: the tests run this file with python3 too.
import builtins, contextlib, io, json, linecache, reprlib, sys, traceback, types


class _Sink(io.TextIOBase):
    """A text stream that hands each write to sink(stream, text), so output reaches the page as it's printed."""
    def __init__(self, stream, sink):
        self.stream, self.sink = stream, sink
    def writable(self):
        return True
    def write(self, text):
        self.sink(self.stream, text)
        return len(text)


def _run(src, stdin, sink, tracer=None):
    """Run src with stdin as its input, traced by tracer if given. Returns {"ok": bool, "err": traceback text}."""
    out, err, inp = _Sink('out', sink), _Sink('err', sink), io.StringIO(stdin)

    def _input(prompt=''):
        # Like a terminal: the prompt, then the line typed (here, the next line of the stdin box).
        out.write(str(prompt))
        line = inp.readline()
        if not line:
            raise EOFError('input() ran out of lines. Add more to the stdin box.')
        out.write(line if line.endswith('\n') else line + '\n')
        return line.removesuffix('\n')

    linecache.cache['main.py'] = (len(src), None, src.splitlines(True), 'main.py')  # source lines in tracebacks
    g = {'__name__': '__main__', '__builtins__': builtins, 'input': _input}
    saved = sys.stdout, sys.stderr, sys.stdin
    sys.stdout, sys.stderr, sys.stdin = out, err, inp
    try:
        code = compile(src, 'main.py', 'exec')
        if tracer:
            tracer.g = g
            sys.settrace(tracer)
        exec(code, g)
    except SystemExit as e:
        if e.code not in (None, 0):
            return {'ok': False, 'err': e.code if isinstance(e.code, str) else f'Exited with status {e.code}.'}
    except _StepLimit:
        return {'ok': True, 'err': '', 'cut': True}
    except BaseException as e:
        # Only the program's own lines: not this file's, nor the inside of the library functions it called.
        te = traceback.TracebackException.from_exception(e)
        te.stack = traceback.StackSummary.from_list([f for f in te.stack if f.filename == 'main.py'])
        return {'ok': False, 'err': ''.join(te.format()).rstrip()}
    finally:
        sys.settrace(None)
        sys.stdout, sys.stderr, sys.stdin = saved
    return {'ok': True, 'err': ''}


def run_program(src, stdin, sink):
    """Run src with stdin as its input. Returns JSON: {"ok": bool, "err": traceback text}."""
    return json.dumps(_run(src, stdin, sink))


# ---- stepping: the playground's Step records every line the program runs, then the page replays them ----

class _StepLimit(BaseException):
    """Raised by the tracer once it has recorded its last step (a BaseException, so `except Exception` lets it by)."""


_short = reprlib.Repr()
_short.maxlevel, _short.maxstring, _short.maxother = 3, 80, 80
_short.maxlist = _short.maxtuple = _short.maxset = _short.maxfrozenset = _short.maxdict = _short.maxdeque = 12


def _show(v):
    """A value as the page shows it: short, and never an error."""
    if isinstance(v, (types.FunctionType, types.BuiltinFunctionType)):
        return f'<function {v.__qualname__}>'
    if isinstance(v, type):
        return f'<class {v.__qualname__}>'
    try:
        s = _short.repr(v)
    except BaseException as e:
        s = f'<repr failed: {type(e).__name__}>'
    return s if len(s) <= 200 else s[:199] + '…'


@contextlib.contextmanager
def _quiet():
    """Anything a __repr__ prints while a step is recorded isn't the program's output."""
    saved = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = io.StringIO()
    try:
        yield
    finally:
        sys.stdout, sys.stderr = saved


class _Tracer:
    """sys.settrace's function. Each step is the line about to run (or a call, a return, an exception) with the program's
    own frames, outermost first: {"l", "ev", "st": [{"fn", "id", "l", "vars": [[name, value]], "ret"?}], "o", "exc"?},
    where o is how many characters the program had printed. Tracing is off while a step is recorded, so the program's
    own __repr__ methods don't add steps."""
    def __init__(self, count, max_steps):
        self.count, self.max, self.g = count, max_steps, None
        self.steps, self.ids, self.raised, self.exc = [], {}, set(), None

    def __call__(self, frame, event, arg):
        if frame.f_code.co_filename != 'main.py':
            return None
        self.ids[id(frame)] = len(self.ids) + 1
        if frame.f_code.co_name != '<module>':
            self.record(frame, 'call')
        return self.local

    def local(self, frame, event, arg):
        if event == 'line':
            self.raised.discard(id(frame))
            self.record(frame, 'line')
        elif event == 'exception':
            self.raised.add(id(frame))
            if arg[1] is not self.exc:  # once per exception, where it's raised, not again in each frame it leaves
                self.exc = arg[1]
                self.record(frame, 'exc', exc=''.join(traceback.format_exception_only(arg[0], arg[1])).strip())
        elif event == 'return':
            # A frame left by an exception also gets a 'return' (of None): that's not a return value.
            if id(frame) not in self.raised and frame.f_code.co_name != '<module>':
                self.record(frame, 'return', ret=arg)
            self.raised.discard(id(frame))
        return self.local

    def frame(self, f):
        if f.f_code.co_name == '<module>':
            return self.globals(f.f_lineno)
        vs = [[k, _show(v)] for k, v in dict(f.f_locals).items() if not (k.startswith('__') and k.endswith('__'))]
        return {'fn': f.f_code.co_qualname, 'id': self.ids.get(id(f), 0), 'l': f.f_lineno, 'vars': vs[:50]}

    def globals(self, line):
        vs = [[k, _show(v)] for k, v in self.g.items()
              if not (k.startswith('__') and k.endswith('__')) and k != 'input' and not isinstance(v, types.ModuleType)]
        return {'fn': 'Global', 'id': 0, 'l': line, 'vars': vs[:50]}

    def record(self, frame, ev, **extra):
        if len(self.steps) >= self.max:
            raise _StepLimit
        stack, f = [], frame
        with _quiet():
            while f is not None:
                if f.f_code.co_filename == 'main.py':
                    stack.append(self.frame(f))
                f = f.f_back
        stack.reverse()
        if 'ret' in extra:
            stack[-1]['ret'] = _show(extra['ret'])
        step = {'l': frame.f_lineno, 'ev': ev, 'st': stack, 'o': self.count[0]}
        if 'exc' in extra:
            step['exc'] = extra['exc']
        self.steps.append(step)


def trace_program(src, stdin, sink, max_steps=2000):
    """Run src as run_program does, recording each step. Returns JSON: {"ok", "err", "steps", "cut"?}. Unless the
    recording was cut off, the last step ("end") shows the global frame once the program has finished."""
    count = [0]

    def counted(stream, text):
        count[0] += len(text)
        sink(stream, text)

    t = _Tracer(count, max_steps)
    r = _run(src, stdin, counted, t)
    if not r.get('cut') and t.g is not None:
        last = t.steps[-1]['l'] if t.steps else 1
        with _quiet():
            t.steps.append({'l': last, 'ev': 'end', 'st': [t.globals(last)], 'o': count[0]})
    return json.dumps({**r, 'steps': t.steps})
