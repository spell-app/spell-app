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
card.to_json()  # {"$type": "Card", "rank": "queen"}
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
import re
import reprlib
import secrets
import string
import weakref
from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any, ClassVar, Protocol

from spell_core.events import Eventful
from spell_core.kinds import is_same
from spell_core.prop_rules import PropRule

if TYPE_CHECKING:
    from spell_core.core import Core

# The key a spell object's JSON names its class under:  `{"$type": "Card", ...}`.
TYPE_KEY = "$type"
# The key a spell list's JSON holds its items under:  `{"$type": "Deck", "$items": [...]}`.
ITEMS_KEY = "$items"
# Defaults that would be ONE object shared by every instance:  `init=list` makes one each.
SHARED_DEFAULTS = (list, dict, set)
# Characters a made-up id's random part is written in:  base 36, lower case.
ID_ALPHABET = string.digits + string.ascii_lowercase
# How many random characters a made-up id ends with.
ID_LENGTH = 8
# The words of a class's name, as the JavaScript core's lodash finds them:  `DatedEvent` is `Dated`, `Event`.
CLASS_NAME_WORDS = re.compile(r"[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+")


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
    item_type: str | builtins.type | None = None,
    rules: Sequence[PropRule] | None = None,
) -> "Prop":
    """Declare a property of a thing or a list, in its class body:  `rank = prop(one_of=RANKS)`.

    - `type`:  what its values must be, as spell names it:
      `"text"`, `"number"`, `"choice"` (yes / no), `"list"`, or a class, or its name (`"Card"`).
    - `one_of`:  the values it may have, e.g. `Card.RANKS`;
      or a function giving them, for a list on a class defined after this one:  `lambda: Deck.SUITS`.
    - `default`:  its value while it's unset.
      - NOT stored, so `to_json()` leaves it out
    - `init`:  makes its value the first time it's read, once per thing, e.g. `init=Deck`.
      - stored, so `to_json()` writes it
    - `item_type`:  the class a LIST property holds, or its name, e.g. `"Task"` for `as a new list of tasks`.
      - for the saver (epic `people-and-orgs`), which needs each item's kind:  nothing checks it yet
    - `rules`:  what its value must be, beyond its type (epic `property-editor` P9)
      - e.g. `[{"type": "empty"}]` for `- its title must not be empty`
      - a value that breaks one warns, as a wrong type does (`prop_rules.py`)
    - throws `TypeError` for a list, dict or set `default`:
      every thing would share that one object.  Pass `init=list` instead.
    """
    if isinstance(default, SHARED_DEFAULTS):
        kind = builtins.type(default).__name__
        raise TypeError(f"prop():  a {kind} default would be shared by every instance;  pass init={kind} instead")
    return Prop(_type_name(type), one_of, default, init, _type_name(item_type), rules)


def _type_name(type: str | builtins.type | None) -> str | None:
    """`type` as spell names it:  a class's name, `"Card"`, or the name given."""
    return type.__name__ if isinstance(type, builtins.type) else type


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
        item_type: str | None = None,
        rules: Sequence[PropRule] | None = None,
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
        # the class name of what a list property holds, e.g. `Task`
        self.item_type = item_type
        # what its value must be, beyond its type:  see `prop_rules.py`
        self.rules: list[PropRule] = list(rules or ())

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
        value = self.first_value(instance)
        if value is None:
            return self.default
        props[self.name] = value
        note_change(instance)
        return value

    def first_value(self, instance: "SpellObject") -> object:
        """What it's set to the first time it's read on `instance`, unset:  `init()`'s value, or `None` for none.

        - `None`:  it reads as its default, NOT stored.
        - `ThingIdProp` makes an id instead, from `instance`.
        """
        return None if self.init is None else self.init()

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
        ("item_type", declared.item_type),
        ("rules", declared.rules or None),
    ]


class ThingIdProp(Prop):
    """`id`, built into every thing and spell list:  text, made the first time it's read, then kept.

    - Made by `new_thing_id()`, e.g. `dated-event-k3x9q2mf`.
    - A thing whose id nobody reads has none:  `to_json()` leaves it out.
    - Set it to choose one:  `Person(id="owen")`, `person.id = "owen"`.
    - A `Prop` of its own, not `prop(init=...)`:  `init` is called with nothing (`init=Deck`),
      and an id needs its thing, whose kind it starts with.
    """

    def __init__(self) -> None:
        """Text, with no default:  its value is made on first read."""
        super().__init__("text", None, None, None)

    def first_value(self, instance: "SpellObject") -> object:
        """A new id for `instance`:  see `new_thing_id()`."""
        return new_thing_id(instance)


def new_thing_id(thing: object) -> str:
    """A new id for `thing`:  its kind, then 8 random base-36 characters, e.g. `dated-event-k3x9q2mf`.

    - Its kind is its class's name in lower kebab case:  `DatedEvent` is `dated-event`.
    - Random from `secrets`, NEVER the core's seeded random (`ParkMiller`):
      ids get saved, so they must differ from run to run, even when a seeded run repeats everything else.
    - The twin of the JavaScript core's `newThingId()`.
    """
    kind = "-".join(CLASS_NAME_WORDS.findall(builtins.type(thing).__name__)).lower() or "thing"
    return f"{kind}-{''.join(secrets.choice(ID_ALPHABET) for _ in range(ID_LENGTH))}"


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
    - Every one has an `id`, built in:  made the first time it's read, or set (`ThingIdProp`).
    """

    # Is a thing of this class saved in a FILE OF ITS OWN, rather than inside what holds it (decision Q42)?
    # - Compiled from `a person is saved in its own file.`, as `Person.saved_in_file = True`:  sub-classes inherit it.
    # - The saver gives such a thing an entry of its own, and what holds it a reference to that.
    # - Every other thing is written whole inside what holds it, and a reference after (`saving.py`).
    saved_in_file: ClassVar[bool] = False
    # `a dated-event is saved inline.`, compiled as `DatedEvent.saved_inline = True`:  saying the default (Q42).
    saved_inline: ClassVar[bool] = False
    # Our id:  what we're saved and referred to by, e.g. `dated-event-k3x9q2mf`.
    id = ThingIdProp()

    def __init__(self, **props: object) -> None:
        """Set `props`, each as `thing.name = value` would, then run `create()`.

        - Counted among the program's things, in the order made:  `core.things_made()`.
        """
        program_core().note_made(self)
        self._props: dict[str, object] = {}
        for name, value in props.items():
            setattr(self, name, value)
        self.create()

    def __init_subclass__(cls, **kwargs: Any) -> None:
        """SIDE EFFECT:  every class of thing is known by name, for `core.from_json()`."""
        super().__init_subclass__(**kwargs)
        things.add_class(cls)

    @classmethod
    def declare_rules(cls, name: str, rules: Sequence[PropRule]) -> None:
        """Add `rules` to property `name`:  what its value must be, beyond its type (epic `property-editor` P9).

        - What compiled spell writes for a rule on a line of its own, after the class:
          `Card.declare_rules("title", [{"type": "empty"}])` for `- its title must not be empty`.
        - A name we don't declare with `prop()`:  nothing to add them to, so nothing happens.
        """
        declared = getattr(cls, name, None)
        if isinstance(declared, Prop):
            declared.rules = [*declared.rules, *rules]

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

    def __getattr__(self, name: str) -> Any:
        """A name we don't declare:  spell reads a property nobody set or declared as nothing, `None`.

        - A property set but not declared, e.g. one `core.from_json()` read, gives its value.
        - Python asks only for a name it found nowhere else:  a declared property never comes here.
        - Typed `Any`:  spell knows nothing of it, so neither does pyright (epic python-target P25, Q30).
        - throws `AttributeError` for a dunder (`__deepcopy__`) or a `_private` name, as Python does:
          so `copy`, `pickle` and `hasattr()` checks for them behave.
        """
        if name.startswith("_"):
            raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")
        return self.__dict__.get("_props", {}).get(name)

    @classmethod
    def add_method[F: Callable[..., Any]](cls, name: str) -> Callable[[F], F]:
        """A decorator:  the function below is our method `name` too, said from outside our class.

        ```python
        @Card.add_method("play")
        def _card_play(self) -> bool | None: ...
        ```

        - What a project writes for a class of ANOTHER project's, Klondike's `to play a card` for Cards' `Card`
          (epic python-target P25):  its own classes have it in their bodies.
        - Not `Card.play = _card_play`, which pyright refuses:  a class gains no attribute by assignment.
        """

        def add(function: F) -> F:
            setattr(cls, name, function)
            return function

        return add

    @classmethod
    def add_property[F: Callable[..., Any]](cls, name: str) -> Callable[[F], F]:
        """A decorator:  the function below is our getter `name` too, `@property`, said from outside our class.

        - As `add_method()`:  `@Card.add_property("pile")`.
        """

        def add(function: F) -> F:
            setattr(cls, name, property(function))
            return function

        return add

    def is_of_type(self, type_name: str) -> bool:
        """Are we of the type named `type_name`, or of a type that inherits from it?  A joker is a `card`.

        - Any case:  `"Card"` and `"card"` are the same.  See `core.is_of_type()`.
        """
        return program_core().is_of_type(self, type_name)

    def to_json(self) -> dict[str, object]:
        """Our JSON:  our class's name as `"$type"`, then our properties in the order they were first set.

        ```python
        Card(rank="ace", suit="spades").to_json()  # {"$type": "Card", "rank": "ace", "suit": "spades"}
        ```

        - Each value as its own JSON, all the way down:  `json.dumps()` takes what this returns.
        - Python's names, as declared:  `is_set_up`, not JavaScript's `isSetUp`.
        - `"$type"` is our CLASS's name, even if this one says otherwise (`type`):  the class is what's rebuilt.
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


def program_core() -> "Core":
    """The program's `core`, where a thing's warnings go:  imported when first asked for, as `core.py` imports us."""
    from spell_core.core import core

    return core


things.add_class(Thing)
