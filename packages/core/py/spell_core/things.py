"""Things:  what `a card is a thing` compiles to, a Python class whose properties are declared in its body.

```python
from spell_core import Thing, prop

class Card(Thing):
    RANKS = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"]
    rank = prop(one_of=RANKS)
    name = prop(type="text", default="")

card = Card(rank="queen")
card.rank       # "queen"
card.name       # "", its default
card.to_json()  # {"@type": "Card", "rank": "queen"}
```

- A property is a `prop()` in the class body:  reading it gives its value, or its default while it's unset.
- Setting one checks it against what `prop()` declared, and warns on `core.console` if it isn't:
  the value is set anyway, as in JavaScript.
- Its values are kept in a plain dict, in the order they were first set:  that's the order `to_json()` writes.
- Unlike the JavaScript core's things, nothing is reactive:
  Python's page (`core.page`) is drawn only when it's written, so it shows each thing as it is then.
- The classes are known by name as soon as they're defined, so `core.from_json()` can make them again.
- The twin of the JavaScript core's `Thing` (`classes/Thing.ts`) and `Observable` (`$/util`).
- Imports `core` only inside functions:  `core.py` imports this module, to build `core`.
"""

import builtins
import reprlib
import weakref
from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any, Protocol

from spell_core.events import Eventful
from spell_core.kinds import is_same

if TYPE_CHECKING:
    from spell_core.core import SpellCore

# The key a spell object's JSON names its class under:  `{"@type": "Card", ...}`.
TYPE_KEY = "@type"
# The key a spell list's JSON holds its items under:  `{"@type": "Deck", "@items": [...]}`.
ITEMS_KEY = "@items"
# Defaults that would be ONE object shared by every instance:  `init=list` makes one each.
SHARED_DEFAULTS = (list, dict, set)


class ChangeWatcher(Protocol):
    """What's told of each change to a thing or a spell list:  a `StateWriter`, to send only what changed."""

    def note_change(self, changed: "SpellObject") -> None:
        """`changed` has a property set or unset, or new items."""


# Each one told of every change, as long as it lives:  see `note_change()`.
CHANGE_WATCHERS: "weakref.WeakSet[ChangeWatcher]" = weakref.WeakSet()


def note_change(changed: "SpellObject") -> None:
    """SIDE EFFECT:  tell each of `CHANGE_WATCHERS` that `changed` changed:  a property, or a list's items."""
    if not CHANGE_WATCHERS:
        return
    for watcher in list(CHANGE_WATCHERS):
        watcher.note_change(changed)


def prop(
    type: str | builtins.type | None = None,
    one_of: Sequence[object] | Callable[[], Sequence[object]] | None = None,
    default: object = None,
    init: Callable[[], object] | None = None,
) -> "Prop":
    """Declare a property of a thing or a list, in its class body:  `rank = prop(one_of=RANKS)`.

    - `type`:  what its values must be, as spell names it:
      `"text"`, `"number"`, `"choice"` (yes / no), `"list"`, or a class, or its name (`"Card"`).
    - `one_of`:  the values it may have, e.g. `Card.RANKS`;
      or a function giving them, for a list on a class defined after this one:  `lambda: Deck.SUITS`.
    - `default`:  its value while it's unset.  NOT stored, so `to_json()` leaves it out.
    - `init`:  makes its value the first time it's read, once per thing, e.g. `init=Deck`.
      Stored, so `to_json()` writes it.
    - throws `TypeError` for a list, dict or set `default`:
      every thing would share that one object.  Pass `init=list` instead.
    """
    if isinstance(default, SHARED_DEFAULTS):
        kind = builtins.type(default).__name__
        raise TypeError(f"prop():  a {kind} default would be shared by every instance;  pass init={kind} instead")
    type_name = type.__name__ if isinstance(type, builtins.type) else type
    return Prop(type_name, one_of, default, init)


class Prop:
    """A declared property, as `prop()` makes it:  a descriptor that reads and writes a thing's values.

    - Reading it gives its value, or its default while it's unset (see `prop()`).
    - Setting it stores the value and checks it (`SpellObject.set_prop()`).
    - Setting it to `None` unsets it:  it's left out of `to_json()`, and reads as its default again.
    """

    def __init__(
        self,
        type: str | None,
        one_of: Sequence[object] | Callable[[], Sequence[object]] | None,
        default: object,
        init: Callable[[], object] | None,
    ) -> None:
        """A property with what `prop()` was told:  its name comes when its class is made (`__set_name__()`)."""
        # its name in the class body, e.g. `rank`
        self.name = ""
        # spell's name for the type its values must be, e.g. `text` or `Card`
        self.type = type
        # its legal values, or a function giving them
        self._one_of = one_of
        # its value while unset
        self.default = default
        # makes its value on first read
        self.init = init

    def __set_name__(self, owner: type, name: str) -> None:
        """Python tells us our name as the class is made:  `rank = prop(...)` is `rank`."""
        self.name = name

    def __get__(self, instance: "SpellObject | None", owner: type | None = None) -> Any:
        """Its value on `instance`:  stored, else `init()`'s (then stored), else its default.

        - On the class itself, `Card.rank`:  this `Prop`.
        """
        if instance is None:
            return self
        props = instance._props
        if self.name in props:
            return props[self.name]
        if self.init is None:
            return self.default
        value = self.init()
        if value is None:
            return self.default
        props[self.name] = value
        note_change(instance)
        return value

    def __set__(self, instance: "SpellObject", value: object) -> None:
        """Set it on `instance`, checked:  see `SpellObject.set_prop()`."""
        instance.set_prop(self.name, value, self)

    @property
    def one_of(self) -> Sequence[object] | None:
        """Its legal values:  `one_of`, or what it gives when it's a function.  `None` for "anything"."""
        if callable(self._one_of):
            return self._one_of()
        return self._one_of

    def __repr__(self) -> str:
        """`prop(one_of=[...])`, as it was declared, for a reader in a debugger."""
        parts = [f"{key}={value!r}" for key, value in _declared_parts(self) if value is not None]
        return f"prop({', '.join(parts)})"


def _declared_parts(declared: Prop) -> list[tuple[str, object]]:
    """What `declared` was told, by `prop()`'s keyword names, for its `repr()`."""
    return [
        ("type", declared.type),
        ("one_of", declared._one_of),
        ("default", declared.default),
        ("init", declared.init),
    ]


class ThingRegistry:
    """`core.things`:  the program's classes, by name, so `core.from_json()` can make them again.

    - Each class of thing or list is added as it's defined (`SpellObject.__init_subclass__()`).
      A class defined again under the same name replaces the one before.
    - Unlike the JavaScript core's, it keeps no list of the things made:  there's no Thing Explorer to show them.
    """

    def __init__(self) -> None:
        """An empty registry:  `Thing` and `List` add themselves, then each class of the program as it's defined."""
        self._classes: dict[str, type[SpellObject]] = {}

    def add_class(self, cls: "type[SpellObject]") -> None:
        """SIDE EFFECT:  know `cls` by its name, `"Card"`."""
        self._classes[cls.__name__] = cls

    def class_named(self, name: str) -> "type[SpellObject] | None":
        """The class called `name`, exactly as written (`"Card"`), if one has been defined."""
        return self._classes.get(name)


# The one registry:  `core.things`.
things = ThingRegistry()


class SpellObject:
    """What a thing and a spell list share:  declared properties, set-up, their type, their JSON.

    - Made with keyword properties:  `Card(rank="queen", suit="spades")`.
      - each is set as `card.rank = "queen"` would be, checked
      - a name the class doesn't declare becomes a plain attribute, NOT a property:  `to_json()` leaves it out
    - A name it doesn't declare, and nobody set, reads as nothing, `None`:  `pile.name` with no `name` declared.
      - as in spell, and JavaScript's `undefined`
      - a dunder or `_private` name still throws `AttributeError`, as Python's own
    - Then `create()` runs, once:  spell's `to set up a card`.
    - A class is known by name as soon as it's defined:  `core.things.class_named("Card")`.
    - Equality is identity:  two cards are two cards, however alike.  `core.equals()` looks inside.
    """

    def __init__(self, **props: object) -> None:
        """Set `props`, each as `thing.name = value` would, then run `create()`."""
        self._props: dict[str, object] = {}
        for name, value in props.items():
            setattr(self, name, value)
        self.create()

    def __init_subclass__(cls, **kwargs: Any) -> None:
        """SIDE EFFECT:  every class of thing is known by name, for `core.from_json()`."""
        super().__init_subclass__(**kwargs)
        things.add_class(cls)

    def create(self) -> None:
        """Spell's set-up for a new one:  runs once, after the keyword properties are set.  Does nothing here.

        - A class compiled from spell overrides it:  `to set up a deck` compiles to `def create(self)`.
        """

    def set_prop(self, name: str, value: object, check: "Prop | None" = None) -> None:
        """Set property `name` to `value`:  what setting a declared property does.

        - `None` unsets it instead:  it's left out of `to_json()`, and reads as its default.
        - The same value it has already (`is_same()`) does nothing, and isn't checked again.
        - A new value is checked against `check`, its declaration:
          one that fails warns on `core.console` (`core.check_prop()`), and is set anyway.
        """
        props = self._props
        if value is None:
            if props.pop(name, None) is not None:
                note_change(self)
            return
        if name in props and is_same(props[name], value):
            return
        props[name] = value
        note_change(self)
        if check is not None:
            program_core().check_prop(name, value, check)

    def __getattr__(self, name: str) -> object:
        """A name we don't declare:  spell reads a property nobody set or declared as nothing, `None`.

        - A property set but not declared, e.g. one `core.from_json()` read, gives its value.
        - Python asks only for a name it found nowhere else:  a declared property never comes here.
        - throws `AttributeError` for a dunder (`__deepcopy__`) or a `_private` name, as Python does:
          so `copy`, `pickle` and `hasattr()` checks for them behave.
        """
        if name.startswith("_"):
            raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")
        return self.__dict__.get("_props", {}).get(name)

    def is_of_type(self, type_name: str) -> bool:
        """Are we of the type named `type_name`, or of a type that inherits from it?  A joker is a `card`.

        - Any case:  `"Card"` and `"card"` are the same.  See `core.is_of_type()`.
        """
        return program_core().is_of_type(self, type_name)

    def to_json(self) -> dict[str, object]:
        """Our JSON:  our class's name as `"@type"`, then our properties in the order they were first set.

        ```python
        Card(rank="ace", suit="spades").to_json()  # {"@type": "Card", "rank": "ace", "suit": "spades"}
        ```

        - Each value as its own JSON, all the way down:  `json.dumps()` takes what this returns.
        - Python's names, as declared:  `is_set_up`, not JavaScript's `isSetUp`.
        - `"@type"` is our CLASS's name, even if this one says otherwise (`type`):  the class is what's rebuilt.
        - Reads back as what it was:  `core.from_json()`.
        """
        return {TYPE_KEY: type(self).__name__, **{name: to_json_value(value) for name, value in self._props.items()}}

    # LAST in the class body:  below it, `type` in this body is the property, not Python's `type()`.
    @property
    def type(self) -> str:
        """Our type's name:  our class's, `"Card"`, unless set on this one."""
        return self.__dict__.get("_type_name", builtins.type(self).__name__)

    @type.setter
    def type(self, type_name: str) -> None:
        """Call this one a `type_name`, whatever its class:  only `type` changes, not what it is."""
        self.__dict__["_type_name"] = type_name


class Thing(SpellObject, Eventful):
    """Every thing spell makes:  what `a card is a thing` compiles to, `class Card(Thing)`.

    ```python
    class Card(Thing):
        rank = prop(one_of=["ace", 2, 3, ..., "king"])

        @property
        def pile(self):
            return Pile.owner_of(self)

    card = Card(rank="queen")
    repr(card)  # "Card(rank='queen')"
    ```

    - Properties, set-up, type and JSON:  see `SpellObject`.
    - A name it doesn't declare reads as `None`, as spell reads a missing property:  see `SpellObject`.
    - Printed (`repr()`), it's its class and its properties, as Python writes a call to make it.
    - It has events of its own:  `card.on("click", ...)`, `card.trigger("click")` -- see `Eventful`.
    - It draws when its class has a `draw()`, compiled from `to draw (a card)`:  see `core.draw_thing()`.
    """

    @reprlib.recursive_repr("...")
    def __repr__(self) -> str:
        """Its class and its properties:  `Card(rank='queen', suit='spades', direction='up')`."""
        props = ", ".join(f"{name}={value!r}" for name, value in self._props.items())
        return f"{type(self).__name__}({props})"


def to_json_value(value: object) -> object:
    """`value` as JSON can hold it:  a thing or a spell list as its `to_json()`, lists and dicts all the way down."""
    if isinstance(value, SpellObject):
        return value.to_json()
    if isinstance(value, list | tuple):
        return [to_json_value(item) for item in value]
    if isinstance(value, dict):
        return {key: to_json_value(item) for key, item in value.items()}
    return value


def program_core() -> "SpellCore":
    """The program's `core`, where a thing's warnings go:  imported when first asked for, as `core.py` imports us."""
    from spell_core.core import core

    return core


things.add_class(Thing)
