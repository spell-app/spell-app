"""`core`:  the one object compiled Python calls for what Python has no word of its own for.

```python
from spell_core import core

core.seed_random(42)
core.expect(len(deck), "the number of cards in the deck", 52, "52")
```

- The Python twin of the JavaScript core's `spellCore`, with the same methods in snake_case:
  `spellCore.randomItemOf()` is `core.random_item_of()`.
- Compiled Python calls it only where Python has no word for what spell says (plan doc python-target, Q8):
  spell's test lines, a seeded shuffle, spell's types.
  Loops, `len()`, `in`, `==` on plain values are Python's own.
"""

from spell_core.collection_methods import CollectionMethods
from spell_core.console import SpellConsole
from spell_core.kinds import TypeMethods
from spell_core.numbers import NumberMethods
from spell_core.runtime_methods import RuntimeMethods
from spell_core.seeded_random import DEFAULT_SEED, ParkMiller, RandomMethods
from spell_core.spell_tests import SpellTestMethods
from spell_core.text_methods import TextMethods
from spell_core.thing_methods import ThingMethods


class SpellCore(
    TypeMethods,
    NumberMethods,
    RandomMethods,
    SpellTestMethods,
    CollectionMethods,
    ThingMethods,
    TextMethods,
    RuntimeMethods,
):
    """Everything compiled Python calls on `core`, each part in a module of its own:

    - types and equality:  `kinds.py`
    - counting:  `numbers.py`
    - random numbers:  `seeded_random.py`
    - spell's tests:  `spell_tests.py`
    - list words for plain lists, dicts and unknown values:  `collection_methods.py`
    - checking a thing's properties, the program's classes, spell's JSON:  `thing_methods.py`
    - text:  `text_methods.py`
    - the running program's events and processes, and pauses:  `runtime_methods.py`, `events.py`
    - the console, `core.console`:  `console.py`
    - the classes compiled Python extends, `Thing` and `List`:  `things.py`, `lists.py`

    A program uses the one `core`;  a test makes its own, so nothing it does leaks into the next test.
    """

    def __init__(self, console: SpellConsole | None = None) -> None:
        """A core printing to `console`, a new one when left out, with its random numbers seeded with 1."""
        self.console = console or SpellConsole()
        self.generator = ParkMiller(DEFAULT_SEED)
        self.active_test = None
        self.reset_runtime()

    def heading(self, text: str) -> None:
        """The program is running the code under heading `text` now:  compiled spell calls it at each heading.

        - Does nothing yet.
          The JavaScript core remembers each thing's heading for the Thing Explorer,
          which Python doesn't have.
        """


# The one core every compiled program shares.
core = SpellCore()
