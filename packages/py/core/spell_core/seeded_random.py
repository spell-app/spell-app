"""Spell's random numbers:  the same ones as the JavaScript core's, so one seed deals the same cards in both.

- Every random number, random item and shuffle comes from ONE generator, the core's own.
- Seed it (`seed_random(42)`) and everything random after it repeats, run after run.
- It starts seeded with 1, so a program that never seeds still repeats.
- Both cores copy the same arithmetic, step for step (epic page python-target, Q13):
  - the generator is Park and Miller's "minimal standard" one:
    multiply by 16,807, keep the remainder after dividing by 2,147,483,647
  - a shuffle is lodash's:  walk the list from the front, swapping each item with a random one at or after it
"""

import math
from collections.abc import Mapping, MutableSequence, Sequence
from typing import TYPE_CHECKING, TypeVar

from spell_core.kinds import is_a_number

if TYPE_CHECKING:
    from spell_core.console import SpellConsole

Item = TypeVar("Item")

# The generator's numbers:  2,147,483,647 is 2 ** 31 - 1, a prime.
MODULUS = 2147483647
MULTIPLIER = 16807
# What the generator starts from when nothing seeds it.
DEFAULT_SEED = 1


class ParkMiller:
    """A repeatable stream of random numbers from 0 up to 1:  Park and Miller's "minimal standard" generator.

    - Each number comes from the one before, so the same seed gives the same numbers in the same order.
    - Its arithmetic is JavaScript's, floats and all, so the JavaScript core gets the very same numbers.

    ```python
    generator = ParkMiller(1)
    generator.random()  # 7.825903601782307e-06, then 0.13153778773875702 ...
    ```
    """

    def __init__(self, seed: float = DEFAULT_SEED) -> None:
        """A generator starting from `seed`:  a whole number from 1 to 2,147,483,646 (0 would give only 0s)."""
        self.state = float(seed)

    def random(self) -> float:
        """The next number:  at least 0 and less than 1.

        - `math.fmod()` is JavaScript's `%`:  for a negative seed, its remainder keeps the minus sign,
          where Python's own `%` wouldn't.
        """
        self.state = math.fmod(self.state * MULTIPLIER, MODULUS)
        return (self.state - 1) / (MODULUS - 1)


class RandomMethods:
    """`core`'s random numbers:  `seed_random()`, `random_number()`, `shuffled()` ..."""

    # where a bad call warns:  `Core` sets it
    console: "SpellConsole"
    # every random number comes from it:  `Core` makes it, `seed_random()` replaces it
    generator: ParkMiller

    def seed_random(self, seed: float) -> None:
        """Start the random numbers again from `seed`:  everything random after it repeats, run after run.

        - `seed` is a whole number from 1 to 2,147,483,646.
        """
        self.generator = ParkMiller(seed)

    def random(self) -> float:
        """The next random number:  at least 0 and less than 1."""
        return self.generator.random()

    def random_number(self, minimum: float, maximum: float | None = None) -> float | None:
        """A random whole number from `minimum` to `maximum`, BOTH included.

        - One number only:  from 1 to it, so `random_number(6)` rolls a die.
        - Not numbers:  a warning, and `None`.
        """
        if maximum is None:
            minimum, maximum = 1, minimum
        if not (is_a_number(minimum) and is_a_number(maximum)):
            self.console.warn("random_number(): you must pass two numbers, got", minimum, maximum)
            return None
        return math.floor(self.random() * (maximum - minimum + 1)) + minimum

    def shuffle(self, items: MutableSequence[Item]) -> None:
        """Put `items` in a random order, in place:  spell's `shuffle the deck`.

        - Takes one random number for every item, even the last.
        """
        count = len(items)
        for index in range(count):
            swap = index + math.floor(self.random() * (count - index))
            items[index], items[swap] = items[swap], items[index]

    def shuffled(self, items: Sequence[Item]) -> list[Item]:
        """A new list of `items`, in a random order:  `items` itself doesn't change."""
        copy = list(items)
        self.shuffle(copy)
        return copy

    def random_item_of(self, items: Sequence[Item] | Mapping[object, Item]) -> Item | None:
        """One of `items`, picked at random:  spell's `a random card of the deck`.

        - From a dict:  one of its values.
        - `None` when there are none.
        """
        if not items:
            return None
        # from 1, then an index:  the same items as ever from the same seed
        position = self.random_number(1, len(items))
        index = int(position) - 1  # type: ignore[arg-type]
        if isinstance(items, Mapping):
            return items[list(items.keys())[index]]
        return items[index]
