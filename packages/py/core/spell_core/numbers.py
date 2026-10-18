"""Counting:  spell's ranges, which include their end, and `repeat ... times`."""

from typing import TYPE_CHECKING

from spell_core.kinds import is_a_number

if TYPE_CHECKING:
    from spell_core.console import SpellConsole


class NumberMethods:
    """`core`'s counting:  `get_range()`, `count_to()`."""

    # where a bad call warns:  `Core` sets it
    console: "SpellConsole"

    def get_range(self, start: float, end: float) -> list[float]:
        """The numbers from `start` to `end`, BOTH included:  spell's `1 to 5` is `[1, 2, 3, 4, 5]`.

        - Counts down when `start` is the larger:  `get_range(3, 1)` is `[3, 2, 1]`.
        - Steps by 1 from `start`, so `get_range(0.5, 2)` is `[0.5, 1.5]`.
        - Not two numbers:  a warning, and an empty list.
        """
        if not (is_a_number(start) and is_a_number(end)):
            self.console.warn("get_range(): you must pass two numbers, got", start, end)
            return []
        numbers = []
        step = 1 if start < end else -1
        number = start
        while (number <= end) if step > 0 else (number >= end):
            numbers.append(number)
            number += step
        return numbers

    def count_to(self, count: float) -> list[int]:
        """`[1, 2, ... count]`:  one number for each time round `repeat {count} times`.

        - An empty list when `count` is under 1, where `get_range(1, count)` would count down.
        """
        numbers = []
        number = 1
        while number <= count:
            numbers.append(number)
            number += 1
        return numbers
