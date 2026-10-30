# Running a playground program in Pyodide (py-worker.js runs this file once at startup, after the practice prelude).
# The program runs as __main__ in its own namespace, without the prelude's Link and Tree, as it would on the student's
# computer. Python's stdlib only: the tests run this file with python3 too.
import builtins, io, json, linecache, sys, traceback


class _Sink(io.TextIOBase):
    """A text stream that hands each write to sink(stream, text), so output reaches the page as it's printed."""
    def __init__(self, stream, sink):
        self.stream, self.sink = stream, sink
    def writable(self):
        return True
    def write(self, text):
        self.sink(self.stream, text)
        return len(text)


def run_program(src, stdin, sink):
    """Run src with stdin as its input. Returns JSON: {"ok": bool, "err": traceback text}."""
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
        exec(compile(src, 'main.py', 'exec'), g)
    except SystemExit as e:
        if e.code not in (None, 0):
            return json.dumps({'ok': False, 'err': e.code if isinstance(e.code, str) else f'Exited with status {e.code}.'})
    except BaseException as e:
        # Only the program's own lines: not this file's, nor the inside of the library functions it called.
        te = traceback.TracebackException.from_exception(e)
        te.stack = traceback.StackSummary.from_list([f for f in te.stack if f.filename == 'main.py'])
        return json.dumps({'ok': False, 'err': ''.join(te.format()).rstrip()})
    finally:
        sys.stdout, sys.stderr, sys.stdin = saved
    return json.dumps({'ok': True, 'err': ''})
