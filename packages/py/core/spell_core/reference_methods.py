"""`core`'s side of thing references (epic python-target P27):  the things a program made, and one found by reference.

```python
core.thing_named(Tableau, "T1")         # spell's `tableau T1`
core.thing_at_place(Tableau, 1)         # spell's `the first tableau`
core.thing_for_reference("Pile#T1")     # the same tableau
core.reference_for(tableau)             # "Tableau#T1"
```

- The twin of the javascript core's `references.ts`:  the words themselves are `references.py`'s.
- Each core keeps the things its program made, in the order it made them (`things_made()`),
  as the javascript core's thing registry does:  places count them.
  - Each thing, and each list of a list type (`Deck`);  not a plain `List`.
  - Not what a test makes while it runs, nor a collection helper's scratch result (`quietly()`).
  - Held weakly:  a thing thrown away goes from the list.
- A thing with no name of its own goes by the name the program keeps it under at its top level, `Game#game`.
"""

import sys
import weakref
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

from spell_core import references
from spell_core.things import SpellObject


class ReferenceMethods:
    """Finding the program's things by name, place or reference:  see the module's docs."""

    # the program's things, in the order made, weakly;  and how many `quietly()`s are running
    _made: list["weakref.ref[SpellObject]"]
    _quiet: int = 0
    active_test: Any

    def note_made(self, thing: SpellObject) -> None:
        """SIDE EFFECT:  `thing` was just made:  one of the program's things, counted for places.

        - Not a plain `List`, nor one made while a test runs or `quietly()`.
        """
        from spell_core.lists import List

        if type(thing) is List or self.active_test or self._quiet:
            return
        if not hasattr(self, "_made"):
            self._made = []
        self._made.append(weakref.ref(thing))

    def things_made(self) -> list[SpellObject]:
        """The program's things still alive, in the order they were made."""
        alive = [thing for ref in getattr(self, "_made", []) if (thing := ref()) is not None]
        self._made = [weakref.ref(thing) for thing in alive]
        return alive

    @contextmanager
    def quietly(self) -> Iterator[None]:
        """While it runs, a thing made isn't one of the program's:  a collection helper's result."""
        self._quiet += 1
        try:
            yield
        finally:
            self._quiet -= 1

    def thing_for_reference(self, reference: str) -> SpellObject | None:
        """The program's thing `reference` names, `Tableau#T1`, `Tableau#1`:  `None` if none."""
        return references.thing_for_reference(reference, self.things_made(), _kept())

    def thing_called(self, cls: type, text: str) -> SpellObject | None:
        """The thing of class `cls` that `text` names, as the part of a reference after its `#`:  a place, or a name."""
        return references.thing_called(cls, text, self.things_made(), _kept())

    def thing_named(self, cls: type, name: str) -> SpellObject | None:
        """The program's thing of class `cls`, or a sub-class, named `name`:  spell's `tableau T1`."""
        return references.thing_named(cls, name, self.things_made(), _kept())

    def thing_at_place(self, cls: type, place: int) -> SpellObject | None:
        """The program's thing of class `cls` EXACTLY at `place`, counting from 1:  spell's `the first tableau`."""
        return references.thing_at_place(cls, place, self.things_made())

    def every_thing(self, cls: type) -> Any:
        """Every thing of class `cls`, or a sub-class, the program made, in order:  spell's `every pile`.

        - A scratch list:  it takes none of them from the lists that hold them.
        """
        from spell_core.lists import List  # imported here, not at the top:  lists imports this module's package

        things = [thing for thing in self.things_made() if isinstance(thing, cls)]
        return List(item_type=cls.__name__).as_scratch().append(*things)

    def reference_for(self, thing: object) -> str | None:
        """The reference that finds `thing` again:  `Tableau#T1`, else its place, `Tableau#3`."""
        return references.reference_for(thing, self.things_made(), _kept())


def _kept() -> dict[str, Any]:
    """The things the running program keeps at its top level, by name:  its module's, as it runs (`run_program()`)."""
    main = sys.modules.get("__main__")
    names = vars(main) if main is not None else {}
    return {name: value for name, value in names.items() if isinstance(value, SpellObject)}
