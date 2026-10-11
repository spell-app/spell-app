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

from collections.abc import Iterator
from contextlib import contextmanager
from contextvars import ContextVar
from typing import Any, cast

from spell_core.collection_methods import CollectionMethods
from spell_core.console import SpellConsole
from spell_core.drawing_methods import DrawingMethods
from spell_core.kinds import TypeMethods
from spell_core.numbers import NumberMethods
from spell_core.runtime_methods import RuntimeMethods
from spell_core.seeded_random import DEFAULT_SEED, ParkMiller, RandomMethods
from spell_core.spell_tests import SpellTestMethods
from spell_core.text_methods import TextMethods
from spell_core.thing_methods import ThingMethods
from spell_core.word_methods import WordMethods


class SpellCore(
    TypeMethods,
    NumberMethods,
    RandomMethods,
    SpellTestMethods,
    CollectionMethods,
    ThingMethods,
    TextMethods,
    RuntimeMethods,
    WordMethods,
    DrawingMethods,
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
    - drawing things, mounting an app, and the page it's drawn on:  `drawing_methods.py`, `drawing.py`
    - spell's wording of a program's members, for reflection:  `word_methods.py`
    - the console, `core.console`:  `console.py`
    - the classes compiled Python extends, `Thing`, `List` and `App`:  `things.py`, `lists.py`, `apps.py`

    A program uses `core`, the one of the program running now:  `default_core`, or its host's (`using_core()`).
    A test makes its own, so nothing it does leaks into the next test.
    """

    def __init__(self, console: SpellConsole | None = None) -> None:
        """A core printing to `console`, a new one when left out, with its random numbers seeded with 1.

        - It draws on a page of its own, empty (`core.page`).
        """
        self.console = console or SpellConsole()
        self.generator = ParkMiller(DEFAULT_SEED)
        self.active_test = None
        self.reset_runtime()
        self.reset_page()

    def heading(self, text: str) -> None:
        """The program is running the code under heading `text` now:  compiled spell calls it at each heading.

        - Does nothing yet.
          The JavaScript core remembers each thing's heading for the Thing Explorer,
          which Python doesn't have.
        """


# The core a program uses when nothing says otherwise:  a program run on its own, and the tests.
default_core = SpellCore()

# The core of the program running now, where a host gives each its own:  see `using_core()`.
_current: ContextVar[SpellCore] = ContextVar("spell_core.current_core")


def current_core() -> SpellCore:
    """The core of the program running now:  the one `using_core()` gave, else `default_core`."""
    return _current.get(default_core)


@contextmanager
def using_core(a_core: SpellCore) -> Iterator[SpellCore]:
    """While in this block, `core` is `a_core`:  the program running here, and what it starts, use it.

    ```python
    with using_core(session.core):
        run_program("Solitaire.compiled.asyncio.py")   # its handlers, pauses and things are the session's
    ```

    - By context (`contextvars`):  an asyncio task started in the block keeps it, e.g. a pause's timer.
    - For a web app, a core per visitor (epic python-target P20, Q24 B).
    """
    token = _current.set(a_core)
    try:
        yield a_core
    finally:
        _current.reset(token)


class CoreStandIn:
    """`core`, as compiled Python imports it:  stands in for the core of the program running now (`current_core()`).

    - Every name is the current core's:  `core.on(...)`, `core.pauses = False`.
    - So one compiled program can run once per visitor, each with its own events, processes, random numbers and page.
    """

    def __getattr__(self, name: str) -> Any:
        """The current core's `name`."""
        return getattr(current_core(), name)

    def __setattr__(self, name: str, value: object) -> None:
        """Set the current core's `name`."""
        setattr(current_core(), name, value)

    def __repr__(self) -> str:
        """`core`, and whose it is now."""
        return f"core (now {current_core()!r})"


# What compiled Python imports, `from spell_core import core`:  the core of the program running now.
core: SpellCore = cast(SpellCore, CoreStandIn())
