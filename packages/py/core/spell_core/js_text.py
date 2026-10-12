"""How JavaScript writes values as text, so spell_core prints what the JavaScript core prints.

- `js_string()`:  what JavaScript's `String(value)` gives, e.g. inside a template string.
- `inspect()`:  what node's `console.log()` shows for a value that isn't text, e.g. `[ 1, 2, 3 ]`.
- `format_line()`:  a whole `console.log()` line, its values joined by single spaces.

Python values stand in for JavaScript's:
- `None` is `undefined`
- `True` / `False` are `true` / `false`
- a float with no fraction is a whole number:  `3.0` prints as `3`
- a list or a tuple is an array, a dict is an object

`inspect()` follows node's own `util.inspect()` with its defaults:
- two levels of nesting shown, deeper ones as `[Array]` / `[Object]`
- lines broken at 80 columns
- long lists of short items lined up in columns
- at most 100 items of a list, then `... 20 more items`
"""

import math
import re
import unicodedata
from collections.abc import Iterable
from decimal import Decimal

# How deep `inspect()` shows nested lists and dicts:  deeper ones are `[Array]` / `[Object]`.
INSPECT_DEPTH = 2
# How wide a line `inspect()` writes before it breaks a list or a dict over several lines.
BREAK_LENGTH = 80
# How many items of a list `inspect()` shows, before `... 20 more items`.
MAX_LIST_LENGTH = 100
# How many levels of nesting may share one line, node's `compact` option.
COMPACT = 3
# A string inside a list longer than this, and too long for its line, is split at its line breaks.
MIN_LINE_WIDTH = 16

# Largest number JavaScript writes out in full:  `1e21` and up are written with an exponent.
LARGEST_PLAIN_NUMBER = 1e21

# A dict key written without quotes, e.g. `{ rank: 1 }`, not `{ 'the rank': 1 }`.
PLAIN_KEY = re.compile(r"^[a-zA-Z_][a-zA-Z_0-9]*$")
# A dict key JavaScript treats as a list position, and so lists first, in number order.
POSITION_KEY = re.compile(r"^(0|[1-9][0-9]*)$")
# The largest key that's still a position:  JavaScript's largest array index.
LARGEST_POSITION = 2**32 - 2
# How a character is written inside quotes, when it can't be written as itself.
ESCAPES = {8: "\\b", 9: "\\t", 10: "\\n", 12: "\\f", 13: "\\r", 39: "\\'", 92: "\\\\"}

# Unicode categories with no width on screen:  controls, formats and marks that combine with the one before.
ZERO_WIDTH_CATEGORIES = {"Cc", "Cf", "Me", "Mn"}
SOFT_HYPHEN = "­"


def format_line(values: Iterable[object]) -> str:
    """One `console.log()` line:  each value as node writes it, joined by single spaces.

    - Text is written as it is:  `format_line(["queen", 3])` is `queen 3`.
    - Anything else goes through `inspect()`, so text INSIDE a list gets its quotes:  `[ 'queen', 3 ]`.
    - Unlike node, a `%` in the first text is never a format code:  `50%d` prints as `50%d`.
    """
    return " ".join(value if isinstance(value, str) else inspect(value) for value in values)


def js_string(value: object) -> str:
    """What JavaScript's `String(value)` gives, e.g. inside a template string.

    - `None` is `undefined`, `True` is `true`, `3.0` is `3`.
    - A list is its items joined by commas, `None` items left empty:  `[1, None, 2]` is `1,,2`.
    - A dict is `[object Object]`, as in JavaScript.
    - Anything else is Python's own `str()`.
    """
    if value is None:
        return "undefined"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int | float):
        return js_number_text(value, keep_minus_zero=False)
    if isinstance(value, str):
        return value
    if isinstance(value, list | tuple):
        return ",".join("" if item is None else js_string(item) for item in value)
    if isinstance(value, dict):
        return "[object Object]"
    return str(value)


def js_number_text(number: float, keep_minus_zero: bool = True) -> str:
    """A number written the way JavaScript writes it.

    - A float with no fraction is a whole number:  `3.0` is `3`.
    - Very large and very small numbers get an exponent, JavaScript's way:  `1e+21`, `5e-7`.
    - Not a number is `NaN`, infinity is `Infinity`.
    - Minus zero is `-0` where node's `console.log()` shows it, `0` in `String()` (`keep_minus_zero=False`).
    """
    if isinstance(number, int) and abs(number) < LARGEST_PLAIN_NUMBER:
        return str(number)
    number = float(number)
    if math.isnan(number):
        return "NaN"
    if math.isinf(number):
        return "Infinity" if number > 0 else "-Infinity"
    if number == 0:
        return "-0" if keep_minus_zero and math.copysign(1, number) < 0 else "0"
    sign = "-" if number < 0 else ""
    return sign + _positive_number_text(abs(number))


def _positive_number_text(number: float) -> str:
    """`number`, above zero, as JavaScript's `Number.prototype.toString()` writes it.

    - Python's `repr()` and JavaScript both find the SHORTEST digits that read back as the same float,
      so only where the decimal point goes, and when to use an exponent, differs.
    - The rules are the ECMAScript spec's "Number::toString", with `digits` its k digits
      and `point` its n, where the decimal point goes.
    """
    _, digit_tuple, exponent = Decimal(repr(number)).normalize().as_tuple()
    digits = "".join(str(digit) for digit in digit_tuple)
    point = len(digits) + int(exponent)
    count = len(digits)

    if count <= point <= 21:
        return digits + "0" * (point - count)
    if 0 < point <= 21:
        return digits[:point] + "." + digits[point:]
    if -6 < point <= 0:
        return "0." + "0" * -point + digits
    power = point - 1
    power_text = f"+{power}" if power >= 0 else str(power)
    if count == 1:
        return f"{digits}e{power_text}"
    return f"{digits[0]}.{digits[1:]}e{power_text}"


def inspect(value: object) -> str:
    """`value` as node's `console.log()` shows it, when it isn't text:  `[ 1, 'two', true ]`.

    - Text inside a list or a dict is quoted, single quotes unless the text has one.
    - A list of more than six short items is lined up in columns.
    - A value that's not plain data (not text, a number, yes / no, `None`, a list or a dict) is Python's `repr()`.
    """
    return _Inspector().value(value, 0)


def js_length(text: str) -> int:
    """`text.length` in JavaScript:  UTF-16 code units, so an emoji beyond the first 65,536 characters counts 2."""
    return len(text.encode("utf-16-le")) // 2


def string_width(text: str) -> int:
    """How many columns `text` takes in a terminal, as node counts them to line up columns.

    - A wide character (Chinese, most emoji) takes 2.
    - A character that only changes the one before it takes 0:  the `️` that makes ♠ a coloured ♠️, an accent.
    - Everything else takes 1.
    """
    width = 0
    for character in unicodedata.normalize("NFC", text):
        if unicodedata.east_asian_width(character) in ("W", "F"):
            width += 2
        elif character != SOFT_HYPHEN and unicodedata.category(character) in ZERO_WIDTH_CATEGORIES:
            continue
        else:
            width += 1
    return width


def quote(text: str) -> str:
    """`text` in quotes, as node shows text inside a list:  `'queen'`.

    - Single quotes, unless the text has one:  then double quotes, then back-ticks, whichever it doesn't have.
    - Line breaks, tabs, back-slashes and other control characters are written as escapes:  `\\n`.
    """
    quote_mark = "'"
    if "'" in text:
        if '"' not in text:
            quote_mark = '"'
        elif "`" not in text and "${" not in text:
            quote_mark = "`"
    escaped = []
    for character in text:
        code = ord(character)
        if code < 32 or 127 <= code < 160 or code == 92 or (code == 39 and quote_mark == "'"):
            escaped.append(ESCAPES.get(code, f"\\x{code:02X}"))
        else:
            escaped.append(character)
    return quote_mark + "".join(escaped) + quote_mark


def is_plain_number(value: object) -> bool:
    """Is `value` a number, and not a yes / no?  Python's `True` is also an int."""
    return isinstance(value, int | float) and not isinstance(value, bool)


class _Inspector:
    """One `inspect()` call:  how far in the line it's indented, and how deep it last looked.

    - A port of node's `util.inspect()` (`lib/internal/util/inspect.js`), for plain data only.
    - Its names follow node's, so the two can be read side by side.
    """

    def __init__(self) -> None:
        # columns of indentation the value being written starts at:  2 more for each level of nesting
        self.indentation = 0
        # the depth last looked at:  decides whether nested lists may share a line (`COMPACT`)
        self.current_depth = 0

    def value(self, value: object, depth: int) -> str:
        """`value` at nesting `depth`:  0 at the top."""
        if value is None:
            return "undefined"
        if isinstance(value, bool):
            return "true" if value else "false"
        if is_plain_number(value):
            return js_number_text(value)  # type: ignore[arg-type]
        if isinstance(value, str):
            return self.text(value)
        if isinstance(value, list | tuple):
            return self.items(list(value), depth)
        if isinstance(value, dict):
            return self.entries(value, depth)
        return repr(value)

    def text(self, text: str) -> str:
        """Text inside a list or dict:  quoted, and split at its line breaks if it's too long for one line."""
        if js_length(text) > MIN_LINE_WIDTH and js_length(text) > BREAK_LENGTH - self.indentation - 4:
            lines = [line for line in re.split(r"(?<=\n)", text) if line]
            return f" +\n{' ' * (self.indentation + 2)}".join(quote(line) for line in lines)
        return quote(text)

    def items(self, items: list[object], depth: int) -> str:
        """A list:  `[ 1, 2, 3 ]`, or its items on lines of their own when they don't fit on one."""
        if not items:
            return "[]"
        if depth > INSPECT_DEPTH:
            return "[Array]"
        depth += 1
        self.current_depth = depth
        shown = items[:MAX_LIST_LENGTH]
        output = [self.nested(item, depth) for item in shown]
        if len(items) > len(shown):
            more = len(items) - len(shown)
            output.append(f"... {more} more item{'s' if more > 1 else ''}")
        return self.reduce_to_single_string(output, "[", "]", depth, items)

    def entries(self, entries: dict[object, object], depth: int) -> str:
        """A dict:  `{ rank: 'queen', 'the suit': 'spades' }`, keys in JavaScript's order."""
        if not entries:
            return "{}"
        if depth > INSPECT_DEPTH:
            return "[Object]"
        depth += 1
        self.current_depth = depth
        output = []
        for key, value in self.ordered(entries):
            name = key if PLAIN_KEY.match(key) else quote(key)
            output.append(f"{name}: {self.nested(value, depth)}")
        return self.reduce_to_single_string(output, "{", "}", depth, None)

    @staticmethod
    def ordered(entries: dict[object, object]) -> list[tuple[str, object]]:
        """A dict's entries in the order a JavaScript object keeps them:  keys that are positions first, by number."""
        keyed = [(js_string(key), value) for key, value in entries.items()]

        def is_position(key: str) -> bool:
            return bool(POSITION_KEY.match(key)) and int(key) <= LARGEST_POSITION

        positions = sorted((pair for pair in keyed if is_position(pair[0])), key=lambda pair: int(pair[0]))
        return positions + [pair for pair in keyed if not is_position(pair[0])]

    def nested(self, value: object, depth: int) -> str:
        """An item of a list, or a value of a dict:  written 2 columns further in."""
        self.indentation += 2
        try:
            return self.value(value, depth)
        finally:
            self.indentation -= 2

    def reduce_to_single_string(
        self, output: list[str], opening: str, closing: str, depth: int, items: list[object] | None
    ) -> str:
        """Join a list's or dict's parts:  on one line if they fit, else in columns or one to a line."""
        entries = len(output)
        if items is not None and entries > 6:
            output = self.group_array_elements(output, items)
        if self.current_depth - depth < COMPACT and entries == len(output):
            start = len(output) + self.indentation + len(opening) + 10
            if self.is_below_break_length(output, start):
                joined = ", ".join(output)
                if "\n" not in joined:
                    return f"{opening} {joined} {closing}"
        indentation = "\n" + " " * self.indentation
        return f"{opening}{indentation}  {f',{indentation}  '.join(output)}{indentation}{closing}"

    @staticmethod
    def is_below_break_length(output: list[str], start: int) -> bool:
        """Do these parts fit on one line, starting `start` columns in?"""
        total = len(output) + start
        if total + len(output) > BREAK_LENGTH:
            return False
        for part in output:
            total += js_length(part)
            if total > BREAK_LENGTH:
                return False
        return True

    def group_array_elements(self, output: list[str], items: list[object]) -> list[str]:
        """Line a long list of short items up in columns, as node does:  numbers to the right, the rest to the left.

        - Only when at least three fit side by side, and no item is much longer than the rest.
        - Node aims for a roughly square block, counting a character as 2.5 times as tall as it's wide.
        """
        total_length = 0
        max_length = 0
        output_length = len(output) - 1 if len(items) > MAX_LIST_LENGTH else len(output)
        separator_space = 2  # a comma and a space between two items
        widths = [string_width(part) for part in output[:output_length]]
        for width in widths:
            total_length += width + separator_space
            max_length = max(max_length, width)
        actual_max = max_length + separator_space
        if not (
            actual_max * 3 + self.indentation < BREAK_LENGTH and (total_length / actual_max > 5 or max_length <= 6)
        ):
            return output

        approx_char_heights = 2.5
        average_bias = math.sqrt(actual_max - total_length / len(output))
        biased_max = max(actual_max - 3 - average_bias, 1)
        columns = min(
            _js_round(math.sqrt(approx_char_heights * biased_max * output_length) / biased_max),
            (BREAK_LENGTH - self.indentation) // actual_max,
            COMPACT * 4,
            15,
        )
        if columns <= 1:
            return output

        max_line_length = []
        for column in range(columns):
            line_length = max((widths[row] for row in range(column, output_length, columns)), default=0)
            max_line_length.append(line_length + separator_space)

        pad_start = all(is_plain_number(item) for item in items[: len(output)])
        grouped = []
        for row_start in range(0, output_length, columns):
            row_end = min(row_start + columns, output_length)
            line = ""
            for index in range(row_start, row_end - 1):
                padding = max_line_length[index - row_start] + js_length(output[index]) - widths[index]
                line += _pad(f"{output[index]}, ", padding, pad_start)
            last = row_end - 1
            if pad_start:
                padding = max_line_length[last - row_start] + js_length(output[last]) - widths[last] - separator_space
                line += _pad(output[last], padding, pad_start)
            else:
                line += output[last]
            grouped.append(line)
        if len(items) > MAX_LIST_LENGTH:
            grouped.append(output[output_length])
        return grouped


def _pad(text: str, length: int, at_start: bool) -> str:
    """JavaScript's `padStart()` / `padEnd()` with spaces, `length` counted in UTF-16 code units."""
    spaces = " " * max(length - js_length(text), 0)
    return spaces + text if at_start else text + spaces


def _js_round(number: float) -> int:
    """JavaScript's `Math.round()`:  a half rounds UP, where Python's `round()` rounds it to even."""
    return math.floor(number + 0.5)
