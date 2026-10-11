"""Types and equality:  what spell's `is a`, `is the same type as` and `is` (`equals`) compile to.

Spell's type names for Python's values:

| Value                      | Spell's type name                  |
| -------------------------- | ---------------------------------- |
| `None`, not-a-number       | `unknown`                          |
| `True`, `False`            | `choice`                           |
| `3`, `3.5`                 | `number`, and `integer` for `3`    |
| `"queen"`                  | `text`, and `character` for `"q"`  |
| a list or a tuple          | `list`                             |
| a dict                     | `object`                           |
| a function or a class      | `function`                         |
| anything else              | its class's name, lower case:  `card` |
"""

import inspect
import math
from collections.abc import Callable, Sequence

from spell_core.js_text import LARGEST_PLAIN_NUMBER, is_plain_number, js_length

# Python's names for a type, where spell's differ.
TYPE_NAME_CONVERSIONS = {"array": "list", "boolean": "choice", "string": "text"}


class TypeMethods:
    """`core`'s types and equality:  `type_of()`, `is_of_type()`, `equals()` ..."""

    def type_of(self, thing: object) -> str:
        """Spell's name for `thing`'s type, e.g. `text` for `"queen"`, `card` for a card.

        - `unknown` for `None` and not-a-number.
        - The table at the top of this file has the rest.
        """
        if thing is None or (isinstance(thing, float) and math.isnan(thing)):
            return "unknown"
        if isinstance(thing, bool):
            return "choice"
        if is_plain_number(thing):
            return "number"
        if isinstance(thing, str):
            return "text"
        if type(thing) in (list, tuple):
            return "list"
        if type(thing) is dict:
            return "object"
        if inspect.isroutine(thing) or isinstance(thing, type):
            return "function"
        name = type(thing).__name__.lower()
        return TYPE_NAME_CONVERSIONS.get(name, name)

    def types_of(self, thing: object) -> list[str]:
        """Every type `thing` is, most specific first:  `["joker", "card", "thing"]`, for `a joker is a card`.

        - Its own type (`type_of()`), then each class it inherits from, by name in lower case.
        - Never `object`, which every value is.
        """
        types = [self.type_of(thing)]
        if thing is None or isinstance(thing, str | int | float):
            return types
        for ancestor in type(thing).__mro__[1:]:
            if ancestor is object:
                break
            name = ancestor.__name__.lower()
            name = TYPE_NAME_CONVERSIONS.get(name, name)
            if name not in types:
                types.append(name)
        return types

    def is_of_type(self, thing: object, type_name: str) -> bool:
        """Is `thing` of the type named `type_name`, or of a type that inherits from it?  `is a` compiles to it.

        - Any case:  `"Card"` and `"card"` are the same.
        - Three names are checked, not looked up:
          - `integer`:  a whole number (`is_an_integer()`)
          - `character`, or `char`:  text one character long
        """
        type_name = type_name.lower()
        special = IS_OF_TYPE_SPECIALS.get(type_name)
        if special:
            return special(self, thing)
        return type_name in self.types_of(thing)

    def matches_type(self, thing: object, other_thing: object) -> bool:
        """Is `thing` of `other_thing`'s type, or a type inheriting from it?  `is the same type as` compiles to it.

        - Not both ways round:  a joker is the same type as a card, but a card isn't the same type as a joker.
        """
        return self.is_of_type(thing, self.type_of(other_thing))

    def is_a_number(self, thing: object) -> bool:
        """Is `thing` a number?  Not `True` or `False` (Python's are ints), and not not-a-number."""
        return is_a_number(thing)

    def is_an_integer(self, thing: object) -> bool:
        """Is `thing` a whole number?  `3` and `3.0` are, `3.5` isn't.

        - As JavaScript counts it:  from `1e21` up, a number is written with an exponent, and isn't one.
        """
        return is_an_integer(thing)

    def is_truthy(self, value: object) -> bool:
        """Is `value` anything but `False` or `None`?  Unlike JavaScript's own truthiness, `0` and `""` count."""
        return value is not False and value is not None

    def is_defined(self, value: object) -> bool:
        """Is `value` something, not `None`?  Spell's `thing is defined`, `thing exists`."""
        return value is not None

    def is_array_like(self, thing: object) -> bool:
        """Can `thing` be read item by item, by position:  a list, a tuple, a spell list, text?  Not a dict."""
        return isinstance(thing, Sequence)

    def equals(self, thing: object, other_thing: object) -> bool:
        """Are `thing` and `other_thing` the same, looking inside lists, dicts and things?  `is` compiles to it.

        - As the JavaScript core's `equals()` (lodash's `isEqual()`):
          - `3 == 3.0`, but `True` is never `1`
          - not-a-number equals not-a-number
          - a list and a tuple with the same items are equal
          - two things of the same class are equal when their fields are
        - A class with its own `==` (`__eq__`) decides for itself.
        """
        return deep_equals(thing, other_thing)


def deep_equals(thing: object, other: object) -> bool:
    """`TypeMethods.equals()`, for code with no `core` to hand."""
    if thing is other:
        return True
    if is_plain_number(thing) and is_plain_number(other):
        both_nan = math.isnan(thing) and math.isnan(other)  # type: ignore[arg-type]
        return thing == other or both_nan
    if isinstance(thing, bool | str) or isinstance(other, bool | str) or thing is None or other is None:
        return type(thing) is type(other) and thing == other
    if isinstance(thing, list | tuple) and isinstance(other, list | tuple):
        return len(thing) == len(other) and all(deep_equals(a, b) for a, b in zip(thing, other, strict=True))
    if isinstance(thing, dict) and isinstance(other, dict):
        return thing.keys() == other.keys() and all(deep_equals(value, other[key]) for key, value in thing.items())
    if type(thing) is not type(other):
        return False
    if type(thing).__eq__ is not object.__eq__:
        return bool(thing == other)
    if hasattr(thing, "__dict__"):
        return deep_equals(vars(thing), vars(other))
    return False


def is_same(thing: object, other: object) -> bool:
    """Are `thing` and `other` the SAME, as JavaScript's `===` says?  What a list looks for, e.g. `card in pile`.

    - Text and numbers by value:  `3 == 3.0`.
    - `True` and `False` only as themselves:  never `1` or `0`, as Python's `==` would have it.
    - Anything else only as itself (`is`):  two cards are two cards, however alike.
      Unlike `equals()`, which looks inside.
    """
    if thing is other:
        return True
    if isinstance(thing, bool) or isinstance(other, bool):
        return False
    if is_plain_number(thing) and is_plain_number(other):
        return thing == other
    if isinstance(thing, str) and isinstance(other, str):
        return thing == other
    return False


def is_js_truthy(value: object) -> bool:
    """Is `value` yes, as JavaScript's `!!value` counts it?  What a list's `filter()` or `all()` reads a condition as.

    - No:  `None`, `False`, `0`, `""` and not-a-number.
    - Yes:  everything else, an empty list or dict too, where Python's `bool()` says no.
    """
    if value is None or value is False or (isinstance(value, str) and not value):
        return False
    if is_plain_number(value):
        return value != 0 and not math.isnan(value)  # type: ignore[arg-type]
    return True


def is_a_number(thing: object) -> bool:
    """`TypeMethods.is_a_number()`, for code with no `core` to hand."""
    return is_plain_number(thing) and not (isinstance(thing, float) and math.isnan(thing))


def is_an_integer(thing: object) -> bool:
    """`TypeMethods.is_an_integer()`, for code with no `core` to hand."""
    if not is_a_number(thing):
        return False
    number = float(thing)  # type: ignore[arg-type]
    return math.isfinite(number) and number.is_integer() and abs(number) < LARGEST_PLAIN_NUMBER


def _is_an_integer(core: TypeMethods, thing: object) -> bool:
    """Is `thing` a whole number?  For `is_of_type(thing, "integer")`."""
    return is_an_integer(thing)


def _is_character(core: TypeMethods, thing: object) -> bool:
    """Is `thing` text one character long, as JavaScript counts it?  An emoji like 🂡 counts 2."""
    return isinstance(thing, str) and js_length(thing) == 1


# Type names `is_of_type()` checks with a test of their own, rather than looking for in `types_of()`.
IS_OF_TYPE_SPECIALS: dict[str, Callable[[TypeMethods, object], bool]] = {
    "integer": _is_an_integer,
    "character": _is_character,
    "char": _is_character,
}
