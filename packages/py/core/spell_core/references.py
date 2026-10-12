"""Thing references:  one thing, named in text by its type and its name or place (epic python-target P27).

```python
thing_for_reference("Tableau#T1", things, kept)   # the tableau named T1
thing_for_reference("Pile#T1", things, kept)      # the same tableau:  a tableau is a pile
thing_for_reference("Tableau#1", things, kept)    # the first tableau
reference_for(tableau, things, kept)              # "Tableau#T1"
```

- The twin of the javascript core's `references.ts` (epic drawable-thing P18):  the same words, read the same way.
  - A reference reads like CSS's `tag#id`:  the type's name, `#`, then the thing's name or its place.
  - `Type#name`:  a thing of `Type`, or of a sub-type, with that `name`;  the first wins.
    - None has it:  a thing the program keeps at its top level under that name, `Game#game`.
  - `Type#1`:  the first thing of `Type` exactly, counting from 1;  `-1` would be the last.
    - Digits are always a place:  a thing named "3" can't be found by its name.
  - `Type` is a class's name, exactly as the program declares it:  `Tableau`, never `tableau`;
    found among the things' own classes (`class_named()`).
- Python's core keeps no list of the things a program made, so each call takes them:
  - `things`:  the things, in the order the places count them
  - `kept`:  the things the program keeps at its top level, by name
  - A page's session passes what that page was sent, in the order it was sent (`PageSession`):
    the order the page's own copies were made in, so a place means the same on both sides.
"""

import re
from collections.abc import Iterable, Mapping
from typing import Any

from spell_core.things import SpellObject

# A reference, its type and its name or place captured:  `Tableau#T1`, `Card#queen-of-spades`, `Tableau#1`.
REFERENCE = re.compile(r"^([A-Za-z_$][\w$]*)#(.+)$")

# A place in a reference:  digits, counting from 1.
PLACE = re.compile(r"^[1-9]\d*$")


def is_reference(value: object) -> bool:
    """Is `value` a reference's text, `Card#3`, rather than any other text?"""
    return isinstance(value, str) and REFERENCE.match(value.strip()) is not None


def thing_for_reference(
    reference: str, things: Iterable[SpellObject], kept: Mapping[str, Any] | None = None
) -> SpellObject | None:
    """The thing `reference` names, among `things` and `kept`:  see the module's docs.  `None` if none."""
    parts = REFERENCE.match(reference.strip())
    if not parts:
        return None
    listed = list(things)
    cls = class_named(parts.group(1), listed, kept)
    if cls is None:
        return None
    things = listed
    text = parts.group(2)
    if PLACE.match(text):
        return thing_at_place(cls, int(text), things)
    return thing_named(cls, text, things, kept)


def class_named(name: str, things: Iterable[SpellObject], kept: Mapping[str, Any] | None = None) -> type | None:
    """The class called `name` that one of `things` (or `kept`) is, or extends:  `Pile` for a tableau.

    - Found from the things themselves, not `core.things`:  a server runs the program once per visitor,
      each run its own classes, and the registry holds only the last run's.
    """
    for thing in [*things, *(kept or {}).values()]:
        for cls in type(thing).__mro__:
            if cls.__name__ == name and issubclass(cls, SpellObject):
                return cls
    return None


def thing_named(
    cls: type, name: str, things: Iterable[SpellObject], kept: Mapping[str, Any] | None = None
) -> SpellObject | None:
    """The first of `things` of class `cls`, or a sub-class, named `name`;  else one `kept` under that name."""
    for thing in things:
        if isinstance(thing, cls) and name_of(thing) == name:
            return thing
    keeper = (kept or {}).get(name)
    return keeper if isinstance(keeper, cls) else None


def thing_at_place(cls: type, place: int, things: Iterable[SpellObject]) -> SpellObject | None:
    """The thing of class `cls` EXACTLY at `place` among `things`, counting from 1;  negative from the end."""
    of_class = [thing for thing in things if type(thing) is cls]
    if place == 0 or abs(place) > len(of_class):
        return None
    return of_class[place - 1 if place > 0 else place]


def reference_for(thing: object, things: Iterable[SpellObject], kept: Mapping[str, Any] | None = None) -> str | None:
    """The reference that finds `thing` again:  `Tableau#T1`, by its name;  else its place, `Tableau#3`.

    - A thing with no name of its own goes by the name the program keeps it under:  `Game#game`.
    - A name an earlier thing has too, or digits:  its place instead.
    - `None` for anything not among `things`.
    """
    if not isinstance(thing, SpellObject):
        return None
    listed = list(things)
    cls = type(thing)
    name = name_of(thing) or next((key for key, value in (kept or {}).items() if value is thing), None)
    if name and not PLACE.match(name) and thing_named(cls, name, listed, kept) is thing:
        return f"{cls.__name__}#{name}"
    of_class = [each for each in listed if type(each) is cls]
    return f"{cls.__name__}#{of_class.index(thing) + 1}" if thing in of_class else None


def name_of(thing: SpellObject) -> str | None:
    """`thing`'s name, as text:  its `name`, a worked-out one too (a card's `queen-of-spades`).  Else `None`."""
    try:
        value = thing.name
    except Exception:  # a worked-out name that fails to work out is no name
        return None
    if value is None or value == "":
        return None
    return str(value)
