"""Positions, counted from where a project's lists start (plan doc python-target, P2).

- Spell counts from 1 inside:  "item 1 of the deck" is its first card.
- A project may count from 0 instead (`project.json`'s `"listsStartAt": 0`).
  Compiled code then passes `start_at=0` to each `core` method that takes or gives a position.
- Per call, not one switch for the whole core:
  a library counting from 1 and a program counting from 0 share one core.
- Negative positions count from the end either way:  `-1` is the last item.
- The twin of the JavaScript core's `positions.ts`.
"""

from typing import Literal

from spell_core.js_text import is_plain_number

# Where a project's lists start counting:  `1`, spell's own, or `0`.
StartAt = Literal[0, 1]


def from_start_at[Position](position: Position, start_at: StartAt = 1) -> Position:
    """`position`, counted from `start_at`, as spell's own position, from 1:  `from_start_at(0, 0)` is `1`.

    - Negative positions, keys (text) and `None` come back as they are.
    """
    if start_at == 0 and is_plain_number(position) and position >= 0:  # type: ignore[operator]
        return position + 1  # type: ignore[operator, return-value]
    return position


def to_start_at[Position](position: Position, start_at: StartAt = 1) -> Position:
    """Spell's own `position`, from 1, counted from `start_at` instead:  `to_start_at(1, 0)` is `0`.

    - `None` stays `None`:  a missing item is never `-1`.
    """
    if start_at == 0 and is_plain_number(position) and position > 0:  # type: ignore[operator]
        return position - 1  # type: ignore[operator, return-value]
    return position


def zero_index_of(position: float, count: int) -> int | None:
    """The Python index of spell's `position` (from 1) in a list of `count` items:  `None` for none.

    - Negative positions count from the end:  `-1` is the last item.
    - `0` is no item:  spell counts from 1.
    - Past the end is the index past the end:  a setter may grow the list there.
    - A whole number written as a float, `2.0`, is the same position as `2`;  `1.5` is no item.
    """
    if isinstance(position, float) and not position.is_integer():
        return None
    if position > 0:
        return int(position) - 1
    if position < 0 and -position <= count:
        return count + int(position)
    return None
