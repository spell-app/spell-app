"""Spell's console:  what `print` compiles to, writing the lines node's `console` writes."""

import sys
from typing import TextIO

from spell_core.js_text import format_line

# Columns each open group indents the lines inside it, as node's `console.group()` does.
GROUP_INDENT = "  "
# Values printed as data, on stdout.  Anything else is a dump, e.g. of a thing:  stderr.
PLAIN_VALUES = (str, int, float, bool, list, tuple, dict, type(None))


class SpellConsole:
    """Spell's console:  `print`, `print warning`, `print group` ... write their lines here.

    - Each line is what node's `console.log()` would write for the same values:
      - `3.0` prints as `3`, `True` as `true`, `None` as `undefined`
      - values are joined by single spaces
      - a list prints as `[ 1, 2, 3 ]`, text inside it quoted
    - Groups indent the lines inside them 2 spaces a level, and nothing marks where they end.
    - Where each line goes:
      - text, numbers, yes / no and plain lists go to stdout:  the program's output, as data
      - a dump of a thing or a list (any value that's not plain data) goes to stderr,
        so stdout reads the same whatever a thing looks like printed (plan doc python-target, Q17)
      - warnings and errors go to stderr, as in node
    - Unlike the JavaScript core's console, it keeps no record of its lines:  there's no page to show them.

    ```python
    console = SpellConsole()
    console.group("hand")
    console.log("cards:", 3.0, True)  # "  cards: 3 true", on stdout
    console.group_end()
    ```
    """

    def __init__(self, stdout: TextIO | None = None, stderr: TextIO | None = None) -> None:
        """A console writing to `stdout` and `stderr`.

        - Either left out:  the process's own, looked up as each line is written.
        """
        self._stdout = stdout
        self._stderr = stderr
        self._indent = ""

    @property
    def stdout(self) -> TextIO:
        """Where plain lines go:  the one passed in, else `sys.stdout` as it is now (so a test can capture it)."""
        return self._stdout or sys.stdout

    @property
    def stderr(self) -> TextIO:
        """Where warnings, errors and dumps go:  the one passed in, else `sys.stderr` as it is now."""
        return self._stderr or sys.stderr

    def log(self, *values: object) -> None:
        """Print `values` on one line:  compiled from `print`."""
        self._write(self._stream_for(values), values)

    def info(self, *values: object) -> None:
        """Print `values` on one line, as `log()`:  what spell's `echo` uses outside a test."""
        self._write(self._stream_for(values), values)

    def warn(self, *values: object) -> None:
        """Print `values` to stderr:  compiled from `print warning`."""
        self._write(self.stderr, values)

    def error(self, *values: object) -> None:
        """Print `values` to stderr:  compiled from `print error`."""
        self._write(self.stderr, values)

    def group(self, *values: object) -> None:
        """Print `values` as a group's heading, if any, then indent every line after it until `group_end()`.

        - Compiled from `print group`.
        """
        if values:
            self.log(*values)
        self._indent += GROUP_INDENT

    def group_collapsed(self, *values: object) -> None:
        """The same as `group()`:  a terminal can't fold a group.

        - Compiled from `print collapsed group`.
        """
        self.group(*values)

    def group_end(self) -> None:
        """End the innermost group:  lines after it go back out 2 spaces.

        - Compiled from `end print group`.
        """
        self._indent = self._indent[: -len(GROUP_INDENT)]

    def _stream_for(self, values: tuple[object, ...]) -> TextIO:
        """stdout for plain values;  stderr when any of them is a dump, e.g. of a thing."""
        if all(isinstance(value, PLAIN_VALUES) for value in values):
            return self.stdout
        return self.stderr

    def _write(self, stream: TextIO, values: tuple[object, ...]) -> None:
        """Write `values` as one line, every line of it indented for the groups open now."""
        text = format_line(values)
        if self._indent:
            text = self._indent + text.replace("\n", "\n" + self._indent)
        stream.write(text + "\n")
