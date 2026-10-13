"""Saving things BY ID, each in an entry of its own, and loading them back as the same objects (`people-and-orgs` P2).

```python
saved = Saver().save(owen)
# saved.root:  "Person#owen"
# saved.entries:  "Person#owen" => {"$type": "Person", "id": "owen", "name": "Owen",
#                                   "dates": [{"$type": "DatedEvent", "label": "birthday", ...}],
#                                   "friends": [{"$ref": "Person#matt"}]}
#                 "Person#matt" => {"$type": "Person", "id": "matt", ...}

loader = Loader(entry_for=saved.entries.get)
loader.load(saved.root)   # owen again;  his friend matt is loaded once, however many hold him
```

- Every thing is saved in an entry of its own, and what holds it saves a REFERENCE, `{"$ref": "Person#matt"}`:
  so a card in two piles is one card, read back.
  - EXCEPT a kind saved inline (`a dated-event is saved inline`, `saved_inline = True`):
    written whole, inside what holds it.
  - A plain list a property holds (`its "dates" is a list of dated-events`) is its items alone, a JSON array:
    it's part of its owner.  A list TYPE (`a club is a list of people`) is a thing, saved on its own.
- An entry is what `to_json()` writes:  `"$type"` first, then its `id`, then its other props, then a list's `"$items"`.
  - Its props by Python's names, as `to_json()` and a page's state (`state.py`) write them:  `is_set_up`.
  - Then its plain fields, what it was made with and doesn't declare, as a page's state writes them too.
  - A date (`datetime`) as its ISO text, as JavaScript's `toISOString()` writes it:  `1970-01-01T00:00:00.000Z`.
- What an entry's key and a reference say is `ref_of`'s, `"Person#matt"` by default:
  the people store (P9) names them by address instead, `"matt@spell"`.
- A thing kept in ANOTHER place (`place_of`) is a reference with that place, `"Person#matt@three-degrees"`,
  and gets no entry:  its own place saves it.  `parse_ref()` reads one, `ref_text()` writes one (P4, Q18).
  - So an id may never hold an `@`:  saving one raises.
- Where entries live is the caller's:  a dict here, one file each in the people store.
- The twin of the JavaScript core's `Saver` and `Loader` (`saving.ts`):
  both write `savedById.expected.json`, in the JavaScript core's package, and read it.
- Not the same as a page's state (`state.py`):  that numbers things per page, and holds them in one message.
"""

from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

from spell_core.lists import List
from spell_core.state import plain_fields, set_prop_of
from spell_core.things import ITEMS_KEY, TYPE_KEY, Prop, SpellObject, program_core, things

# The key a reference names its thing under:  `{"$ref": "Person#matt"}`.
REF_KEY = "$ref"

# An entry, as JSON:  `{"$type": "Person", "id": "owen", ...}`.
Entry = dict[str, Any]


@dataclass
class Saved:
    """What a save writes:  every entry it made, by its key, and the key of the thing it started from."""

    # The key of the thing `save()` was given, e.g. `"Person#owen"`.
    root: str
    # Each entry by its key, in the order they were reached:  the root's first.
    entries: dict[str, Entry]


class Saver:
    """Writes a thing, and every thing it reaches, as entries by id:  see the module's docs."""

    def __init__(
        self,
        ref_of: Callable[[SpellObject], str] | None = None,
        place_of: Callable[[SpellObject], str | None] | None = None,
    ) -> None:
        """A saver naming entries and references by `ref_of`:  `"<Class>#<id>"` by default, `"Person#owen"`.

        - `place_of`:  where a thing is kept when it's NOT with what's being saved, e.g. `"three-degrees"`;
          `None` when it's saved here.  A thing kept elsewhere is a reference with its place,
          `{"$ref": "Person#matt@three-degrees"}`, and gets no entry here.
        """
        self.ref_of = ref_of or default_ref_of
        self.place_of = place_of or (lambda _thing: None)

    def save(self, root: SpellObject) -> Saved:
        """`root`, and every thing it reaches that isn't saved inline, each as an entry of its own.

        - SIDE EFFECT:  reads each saved thing's `id`, so one with none is given one now -- and keeps it.
        """
        entries: dict[str, Entry] = {}
        waiting: list[SpellObject] = [root]
        # by Python's `id()`:  things compare by identity, but a list's `==` isn't one we want here
        queued = {id(root)}

        def reference(thing: SpellObject) -> dict[str, str]:
            """A reference to `thing`, saved in its turn -- unless it's kept elsewhere."""
            place = self.place_of(thing)
            if place:
                return {REF_KEY: ref_text(SavedRef(type(thing).__name__, thing.id, place))}
            if id(thing) not in queued:
                queued.add(id(thing))
                waiting.append(thing)
            return {REF_KEY: self.ref_of(thing)}

        while waiting:
            thing = waiting.pop(0)
            # the key first:  it reads the thing's id, so one with none has it before its entry is written
            key = self.ref_of(thing)
            entries[key] = self._entry_of(thing, reference)
        return Saved(self.ref_of(root), entries)

    def _entry_of(self, thing: SpellObject, reference: Callable[[SpellObject], object]) -> Entry:
        """`thing`'s own entry:  `"$type"`, `id`, its other props, a list's `"$items"`."""
        entry: Entry = {TYPE_KEY: type(thing).__name__, "id": thing.id}
        return self._write_props(thing, entry, reference)

    def _write_props(self, thing: SpellObject, json: Entry, reference: Callable[[SpellObject], object]) -> Entry:
        """`thing`'s props, its plain fields and its items, written into `json`."""
        for key, value in [*thing._props.items(), *plain_fields(thing).items()]:
            if key not in json:
                json[key] = self._write(value, reference)
        if isinstance(thing, List):
            json[ITEMS_KEY] = [self._write(item, reference) for item in thing.items]
        return json

    def _write(self, value: object, reference: Callable[[SpellObject], object]) -> object:
        """`value` as an entry holds it.

        - a thing saved inline:  whole, here
        - a plain list (exactly `List`, a property's list):  its items, as an array
        - any other thing or list:  a reference
        - lists, tuples and dicts:  each value written so;  a date as its ISO text;  anything else as it is
        """
        if type(value) is List:
            return [self._write(item, reference) for item in value.items]
        if isinstance(value, SpellObject):
            if not type(value).saved_inline:
                return reference(value)
            return self._write_props(value, {TYPE_KEY: type(value).__name__}, reference)
        if isinstance(value, list | tuple):
            return [self._write(item, reference) for item in value]
        if isinstance(value, datetime):
            return iso_text(value)
        if isinstance(value, dict):
            return {key: self._write(item, reference) for key, item in value.items()}
        return value


class Loader:
    """Reads entries a `Saver` wrote back as things:  each entry ONCE, however many references name it."""

    def __init__(
        self,
        entry_for: Callable[[str], Entry | None],
        class_named: Callable[[str], type[SpellObject] | None] | None = None,
    ) -> None:
        """A loader reading entries from `entry_for`, each made as the class `class_named` gives.

        - `entry_for`:  the entry saved under a key, if there is one:  JSON as `Saver` wrote it.
        - `class_named`:  the class an entry's `"$type"` names -- the program's, `things.class_named()`, by default.
        """
        self.entry_for = entry_for
        self.class_named = class_named or things.class_named
        # what it loaded, by key:  a second reference to one gets the same thing
        self._loaded: dict[str, SpellObject] = {}

    def load(self, ref: str) -> Any:
        """The thing saved under `ref`, made from its entry the first time, then the same thing every time.

        - Nothing saved under `ref`:  `None`, with a warning on the program's console.
        - Typed `Any`, as `core.from_json()`:  the caller knows what it saved, `Person`.
        """
        known = self._loaded.get(ref)
        if known is not None:
            return known
        entry = self.entry_for(ref)
        if entry is None:
            program_core().console.warn(f'Loader.load():  nothing is saved as "{ref}"')
            return None
        made = self._make(entry, ref)
        return made if isinstance(made, SpellObject) else None

    def read(self, json: object) -> Any:
        """`json` read back:  a reference loaded (`load()`), a thing saved inline made, lists and dicts read through.

        - A reference to nothing saved is left out of a list:  the list holds what loaded.
        """
        if isinstance(json, list):
            values = [(item, self.read(item)) for item in json]
            return [value for item, value in values if not (value is None and _is_reference(item))]
        if not isinstance(json, dict):
            return json
        if _is_reference(json):
            return self.load(json[REF_KEY])
        if isinstance(json.get(TYPE_KEY), str):
            return self._make(json)
        return {key: self.read(value) for key, value in json.items()}

    def _make(self, json: Entry, ref: str | None = None) -> object:
        """A thing made from `json`, an entry or a thing saved inline -- kept as `ref`'s, if it's an entry.

        - Made with its plain values (text, numbers ...) through its class, so its `create()` sees them;
          then its things and lists set, once it's kept:  one of them may hold it back, a person's friend's friend.
        - Its class unknown:  the entry read as a plain dict, its `"$type"` kept.
        """
        cls = self.class_named(str(json[TYPE_KEY]))
        if cls is None:
            return {key: self.read(value) for key, value in json.items()}
        props = {key: value for key, value in json.items() if key not in (TYPE_KEY, ITEMS_KEY)}
        plain = {key: _date_if_declared(cls, key, value) for key, value in props.items() if _is_plain_value(value)}
        made = cls(**plain)
        if ref is not None:
            self._loaded[ref] = made
        for key, value in props.items():
            if not _is_plain_value(value):
                self._set_read(made, key, value)
        items = json.get(ITEMS_KEY)
        if isinstance(made, List) and isinstance(items, list):
            made.items = self.read(items)
        return made

    def _set_read(self, made: SpellObject, key: str, json: object) -> None:
        """Set `made`'s `key` to `json` read back:  a property's list gets its items, else the value is set."""
        value = self.read(json)
        current = getattr(made, key) if isinstance(value, list) else None
        if isinstance(current, List):
            current.items = value
        else:
            set_prop_of(made, key, value)


####################
# ## Helpers
####################


@dataclass
class SavedRef:
    """A saved reference's parts:  `Person#matt@three-degrees` -- see `parse_ref()` and `ref_text()`."""

    # The thing's kind, e.g. `Person`.
    type: str
    # Its id, e.g. `matt`:  never holds an `@`.
    id: str
    # Where it's kept, when that's not here:  an address, which may hold an `@` of its own.
    place: str | None = None


def parse_ref(text: str) -> SavedRef:
    """A saved reference read:  `Person#matt@three-degrees` => `SavedRef("Person", "matt", "three-degrees")`.

    - The type runs up to the `#`;  the id from there to the FIRST `@`;  everything after that `@` is the place,
      which may hold an `@` of its own (`Card#26@matt@three-degrees:bubble-trouble`).
    - No `@`:  no place, the thing is kept here, `Person#matt`.
    - raises `ValueError` with no `#`, or nothing before or after it
    """
    hash_at = text.find("#")
    at = text.find("@", hash_at + 1)
    kind = text[:hash_at]
    the_id = text[hash_at + 1 :] if at < 0 else text[hash_at + 1 : at]
    if hash_at < 0 or not kind or not the_id:
        raise ValueError(f'parse_ref():  "{text}" isn\'t a reference;  write it as Type#id, or Type#id@place')
    return SavedRef(kind, the_id) if at < 0 else SavedRef(kind, the_id, text[at + 1 :])


def ref_text(ref: SavedRef) -> str:
    """`ref` written as a saved reference:  `Person#matt`, or with its place, `Person#matt@three-degrees`.

    - raises `ValueError` if the id holds an `@`:  a reader couldn't tell where the id ends and the place begins
    """
    if "@" in ref.id:
        raise ValueError(
            f"ref_text():  {ref.type}'s id \"{ref.id}\" holds an @, which a saved reference can't;  give it another id"
        )
    return f"{ref.type}#{ref.id}@{ref.place}" if ref.place else f"{ref.type}#{ref.id}"


def default_ref_of(thing: SpellObject) -> str:
    """`"<Class>#<id>"`, e.g. `"Person#owen"`:  a thing's key, until the people store names things by address.

    - raises if its id holds an `@` -- see `ref_text()`
    """
    return ref_text(SavedRef(type(thing).__name__, thing.id))


def iso_text(date: datetime) -> str:
    """`date` as JavaScript's `toISOString()` writes it:  in UTC, to the millisecond, `1970-01-01T00:00:00.000Z`.

    - A date with no time zone is read as UTC, as JavaScript reads ISO text with none.
    """
    in_utc = date.replace(tzinfo=UTC) if date.tzinfo is None else date.astimezone(UTC)
    return in_utc.isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _is_plain_value(value: object) -> bool:
    """Is `value` text, a number, yes or no, or nothing:  a value to make a thing with, before its references?"""
    return not isinstance(value, dict | list)


def _is_reference(json: object) -> bool:
    """Is `json` a reference alone, `{"$ref": ...}`?"""
    return isinstance(json, dict) and isinstance(json.get(REF_KEY), str) and len(json) == 1


def _date_if_declared(cls: type, key: str, value: object) -> object:
    """`value` as a `datetime`, if `cls` declares `key` a date and `value` is its ISO text;  else `value`.

    - Text with no time zone is read as UTC, as JavaScript reads ISO text with none.
    """
    declared = getattr(cls, key, None)
    if not isinstance(value, str) or not isinstance(declared, Prop) or declared.type != "date":
        return value
    try:
        date = datetime.fromisoformat(value)
    except ValueError:
        return value
    return date.replace(tzinfo=UTC) if date.tzinfo is None else date
