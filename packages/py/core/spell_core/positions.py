"""Positions:  the core counts from 0, as Python does, and knows nothing of where a spell project counts from.

- An index counts from 0;  a negative one from the end, `-1` the last item.
- Spell code counting from 1 (the default) is turned into indexes as it COMPILES:
  - a number written out is folded:  "item 4 of the deck" is `deck[3]`
  - one known only when it runs goes through `position()`:  `deck[position(column)]`
  - the end of a range, through `end_position()`:  "items 2 to n of the deck" is `deck[1:end_position(n)]`
  - a position coming out, e.g. "the position of the ace in the deck", through `spell_position()`
  - a loop handing its function the position, through `with_spell_positions()`
- Compiled code imports these by name:  `from spell_core import position`.
- The twin of the JavaScript core's `positions.ts`.
- Epic page python-target, P23 (Owen:  "listsStartAt is a *spell language* thing,
  emitted code is canonical for platform").
"""

import functools
from collections.abc import Callable
from typing import Any

from spell_core.js_text import is_plain_number


def position(n: Any) -> Any:
    """Spell's position `n`, counted from 1, as an index, counted from 0:  `position(2)` is `1`.

    - Negative counts from the end either way, as it is:  `position(-1)` is `-1`.
    - `0` is no position at all:  `None`, which reads nothing, as "item 0" reads nothing counting from 1.
      - NOT `-1`, which would be the last item.
      - (The JavaScript core's is `NaN`:  a list there reads nothing for it.)
    - Anything but a number, as it is:  a key, `None`.
    """
    if not is_plain_number(n):
        return n
    if n > 0:
        return n - 1
    return None if n == 0 else n


def end_position(n: Any) -> Any:
    """Spell's INCLUSIVE end position `n`, from 1, as the EXCLUSIVE end of a slice.

    - "items 2 to 4 of the deck" is `deck[1:4]`:  `end_position(4)` is `4`.
    - `-1`, the last, is `None`:  to the end, "items 2 to the last" is `deck[1:None]`.
    - Further from the end:  one on, `end_position(-2)` is `-1`, so the slice stops after the second-to-last.
    - `0` is `0`:  a slice ending before the first holds nothing.
    - Anything but a number:  `None`, to the end.
    """
    if not is_plain_number(n):
        return None
    if n == -1:
        return None
    return n + 1 if n < -1 else n


def spell_position(index: Any) -> Any:
    """`index`, counted from 0, as spell's position, counted from 1:  `spell_position(0)` is `1`.

    - `None` stays `None`:  a missing item's position is never `0`.
    - Negative counts from the end either way, as it is.
    """
    if is_plain_number(index) and index >= 0:
        return index + 1
    return index


def with_spell_positions[Result](callback: Callable[..., Result]) -> Callable[..., Result]:
    """`callback`, handed spell's positions, from 1, where a loop hands it indexes.

    - `deck.for_each(with_spell_positions(lambda card, position: ...))`:
      for a loop in code counting from 1 whose function takes the position.
    - It takes what `callback` takes:  `core` reads its parameters through it (`functools.wraps()`),
      and passes it only as many of `(value, position, collection)` as `callback` takes.
    """

    @functools.wraps(callback)
    def with_positions(*entry: Any) -> Result:
        if len(entry) > 1:
            entry = (entry[0], spell_position(entry[1]), *entry[2:])
        return callback(*entry)

    return with_positions


def zero_index_of(index: float, count: int) -> int | None:
    """The index `index` reaches in a list of `count` items, counted from 0:  `None` if it reaches none.

    - From 0 on:  as it is, even past the end, where setting one grows the list (`map()` builds its result so).
    - Negative counts from the end:  `-1` is the last;  further back than the first, none.
    - Not a whole number (`1.5`, not-a-number):  none.  A whole one written as a float, `2.0`, is `2`.
    """
    if isinstance(index, float) and not index.is_integer():
        return None
    if index >= 0:
        return int(index)
    return count + int(index) if -index <= count else None
