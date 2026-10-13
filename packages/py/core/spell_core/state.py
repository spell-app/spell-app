"""A program's state as JSON, each thing by its id:  what a page mirrors, so a click names the thing Python holds.

```python
writer = StateWriter()
writer.state_of(game)
# {"$type": "Game", "$id": "1", "piles": [{"$type": "Pile", "$id": "2", "name": "stock", "$items": [
#     {"$type": "Card", "$id": "3", "rank": "ace"}]}], "top": {"$id": "3"}}

mirror = StateMirror()
game = mirror.read(writer.state_of(game))   # the first time:  made, as `core.from_json()` makes them
mirror.read(writer.state_of(game))          # after that:  the SAME things, changed in place
mirror.read(writer.patch())                 # or only what changed since:  the same, sent smaller
```

- The same JSON as `to_json()`, plus:
  - an `"$id"` on each thing and spell list, after its `"$type"`, as JSON-LD spells it
  - its plain fields, after its properties:  what it was made with and doesn't declare, e.g. a foundation's `symbol`
- The first mention of a thing is whole;  each later one is `{"$id": "3"}` alone:
  so a card in two places is one card, read back.
- Each `StateWriter` gives a thing its id the first time it writes it, and keeps it:
  every state it writes after names that thing the same.
  - One writer per page:  ids are its own, counted from 1.
- A writer is told of every change to a thing or a spell list (`things.note_change()`):
  `patch()` writes only the ones that changed since it last wrote, each whole, as a list.
  - A thing a changed one holds is mentioned by its id alone, or written whole if it's new:
    so a card moved to another pile is the two piles, each naming its cards by id.
- A `StateMirror` keeps what it read by id, and reads each new state INTO it:
  a thing it has already gets the new properties, a list its new items.
  - A patch is a list of things with ids:  read as any state is.
- The twin of the JavaScript core's `StateWriter` and `StateMirror` (`state.ts`).
  - Both write the same JSON for the same things:
    `stateById.expected.json`, with the JavaScript core's tests (`tests/core/`), holds one, read by both.
"""

from typing import Any

from spell_core.kinds import is_same
from spell_core.lists import List
from spell_core.things import CHANGE_WATCHERS, ITEMS_KEY, TYPE_KEY, Prop, SpellObject, note_change, things

# The key a thing's id goes under:  `{"$type": "Card", "$id": "3", ...}`, or `{"$id": "3"}` alone, to mention it.
ID_KEY = "$id"


class StateWriter:
    """Writes the state of things as JSON, each with its id:  see the module's docs."""

    def __init__(self) -> None:
        """A writer with no ids given yet:  the first thing it writes is `"1"`.

        - SIDE EFFECT:  told of every change from now on, as long as it lives (`CHANGE_WATCHERS`).
        """
        # by Python's `id()`, holding the thing too, so its `id()` is never another's
        self._ids: dict[int, tuple[SpellObject, str]] = {}
        # each thing by the id it was given
        self._things: dict[str, SpellObject] = {}
        # what changed since it last wrote, of the things it has given ids, by `id()`, in the order they changed
        self._changed: dict[int, SpellObject] = {}
        CHANGE_WATCHERS.add(self)

    def thing_with_id(self, the_id: str) -> SpellObject | None:
        """The thing this writer gave `the_id`, if any:  what a page's message names, `{"$id": "3"}`."""
        return self._things.get(the_id)

    def things_given_ids(self) -> list[SpellObject]:
        """Every thing this writer gave an id, in the order it gave them:  the order a page made its copies in."""
        return list(self._things.values())

    def note_change(self, changed: SpellObject) -> None:
        """SIDE EFFECT:  `changed` goes in the next `patch()`, if it has an id:  one never written is new to a page."""
        if id(changed) in self._ids:
            self._changed[id(changed)] = changed

    def id_of(self, thing: SpellObject) -> str:
        """`thing`'s id, given now if it has none:  `"1"`, `"2"` ... in the order they're first asked for."""
        known = self._ids.get(id(thing))
        if known is None:
            known = (thing, str(len(self._ids) + 1))
            self._ids[id(thing)] = known
            self._things[known[1]] = thing
        return known[1]

    def state_of(self, value: object) -> Any:
        """`value` as JSON can hold it, each thing with its id:  whole the first time, then `{"$id": ...}` alone.

        - Lists, tuples and dicts all the way down, as `to_json()` writes them.
        - Covers every change so far:  the next `patch()` has only what changes after.
        """
        self._changed.clear()
        return self._write(value, set())

    def patch(self) -> list[dict[str, object]]:
        """The things that changed since this writer last wrote, each whole, those they hold by id -- see the docs.

        - In the order they first changed;  `[]` when nothing did.
        - A thing new since, held by one that changed, is written whole inside it, with a new id.
        """
        changed = list(self._changed.values())
        self._changed.clear()
        written = set(self._ids)
        return [self._whole(thing, written) for thing in changed]

    def _write(self, value: object, written: set[int]) -> object:
        """`value`'s JSON, the things in `written` (by `id()`) as their ids alone -- see `state_of()`."""
        if isinstance(value, SpellObject):
            if id(value) in written:
                return {ID_KEY: self.id_of(value)}
            written.add(id(value))
            return self._whole(value, written)
        if isinstance(value, list | tuple):
            return [self._write(item, written) for item in value]
        if isinstance(value, dict):
            return {key: self._write(item, written) for key, item in value.items()}
        return value

    def _whole(self, thing: SpellObject, written: set[int]) -> dict[str, object]:
        """`thing`'s JSON, whole:  its type, its id, its properties, a list's items -- what it holds by `_write()`."""
        json: dict[str, object] = {TYPE_KEY: type(thing).__name__, ID_KEY: self.id_of(thing)}
        for name, prop in thing._props.items():
            json[name] = self._write(prop, written)
        for name, field in plain_fields(thing).items():
            json.setdefault(name, self._write(field, written))
        if isinstance(thing, List):
            json[ITEMS_KEY] = [self._write(item, written) for item in thing._items]
        return json


class StateMirror:
    """Reads states a `StateWriter` wrote, into the things it read before:  see the module's docs."""

    def __init__(self) -> None:
        """A mirror holding nothing yet."""
        self._by_id: dict[str, SpellObject] = {}

    def thing_with_id(self, the_id: str) -> SpellObject | None:
        """The thing read with `the_id`, if any:  what a click on the page names."""
        return self._by_id.get(the_id)

    def read(self, state: object) -> Any:
        """`state` read back:  each thing with an id we hold changed in place, each new one made and kept.

        - A thing we hold:  its properties set to the state's, and any it no longer has unset;
          a list's items set to the state's.
        - A new one:  made as `core.from_json()` makes one, through its properties, then its `create()`.
        - `{"$id": ...}` alone:  the thing with that id.
        - JSON with no ids (`to_json()`'s) reads as `core.from_json()` reads it:  a new thing each time.
        """
        return self._read(state)

    def _read(self, value: object) -> Any:
        """`value`, read -- see `read()`."""
        if isinstance(value, list):
            return [self._read(item) for item in value]
        if not isinstance(value, dict):
            return value
        the_id = value.get(ID_KEY)
        if isinstance(the_id, str) and set(value) == {ID_KEY}:
            return self._by_id.get(the_id)
        type_name = value.get(TYPE_KEY)
        cls = things.class_named(type_name) if isinstance(type_name, str) else None
        if cls is None:
            return {key: self._read(field) for key, field in value.items()}
        fields = {key: field for key, field in value.items() if key not in (TYPE_KEY, ID_KEY, ITEMS_KEY)}
        known = self._by_id.get(the_id) if isinstance(the_id, str) else None
        made = known if isinstance(known, cls) else None
        if made is None:
            # the props it declares, through the class, so its `create()` sees them;  the rest after
            made = cls(**{key: self._read(field) for key, field in fields.items() if _has_setter(cls, key)})
            fields = {key: field for key, field in fields.items() if not _has_setter(cls, key)}
        if isinstance(the_id, str):
            # kept BEFORE its fields are read:  a field may mention it, `{"$id": ...}`
            self._by_id[the_id] = made
        for key in [key for key in made._props if isinstance(the_id, str) and key not in value]:
            made.set_prop(key, None)
        for key, field in fields.items():
            set_prop_of(made, key, self._read(field))
        if isinstance(made, List):
            items = value.get(ITEMS_KEY)
            made.items = [self._read(item) for item in items] if isinstance(items, list) else []
        return made


def plain_fields(thing: SpellObject) -> dict[str, object]:
    """`thing`'s plain fields, not its properties:  what its constructor was given and doesn't declare.

    - `Foundation(symbol="♣️")`, with no `symbol` declared:  `{"symbol": "♣️"}`, as javascript keeps it too.
    - Never a `_private` one, or a function.
    - A saved entry writes them too (`saving.py`).
    """
    return {name: value for name, value in vars(thing).items() if not name.startswith("_") and not callable(value)}


def set_prop_of(thing: SpellObject, key: str, value: object) -> None:
    """Set `thing`'s `key` to `value`:  through what its class declares for it, else as a plain property.

    - What a saved entry read back sets too (`saving.py`), once its plain values have made the thing.
    """
    if _has_setter(type(thing), key):
        setattr(thing, key, value)
    elif not (key in thing._props and is_same(thing._props[key], value)):
        thing._props[key] = value
        note_change(thing)


def _has_setter(cls: type, key: str) -> bool:
    """Does `cls` say how to set `key`:  a `prop()`, or a `@property` with a setter?  The nearest class decides."""
    for ancestor in cls.__mro__:
        if key in vars(ancestor):
            found = vars(ancestor)[key]
            return isinstance(found, Prop) or (isinstance(found, property) and found.fset is not None)
    return False
