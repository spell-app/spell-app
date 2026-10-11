"""`core`'s side of things:  checking a property as it's set, the program's classes, and spell's JSON read back.

```python
card = core.from_json('{"@type": "Card", "rank": "queen"}')   # a Card again
```

- The twins of the JavaScript core's `checkProp()` (`core.ts`), `things` (`things.ts`) and `fromJSON()` (`json.ts`).
"""

import json
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any

from spell_core.js_text import js_string
from spell_core.kinds import is_same
from spell_core.lists import List
from spell_core.things import ITEMS_KEY, TYPE_KEY, Prop, SpellObject, ThingRegistry, things

if TYPE_CHECKING:
    from spell_core.console import SpellConsole

# The types every spell project starts with, as the parser names them:  spell's classes, and `Object`.
BASE_TYPES = ["Object", "Thing", "List", "App", "Drawable", "DrawableList"]


class ThingMethods:
    """`core`'s side of things:  `check_prop()`, `things`, `from_json()`."""

    # where a failed check warns:  `SpellCore` sets it
    console: "SpellConsole"
    # the types every spell project starts with
    base_types = BASE_TYPES
    # the program's classes, by name:  ONE registry, whichever core asks
    things: ThingRegistry = things

    def check_prop(self, property_name: str, value: object, check: Prop | Mapping[str, Any] | None = None) -> bool:
        """Is `value` what `check` declares for property `property_name`?  Else warn on `core.console`.

        - `check`:  a `prop()`'s declaration, or a dict with its `type` and `one_of`.
        - Returns whether it passed:  a thing sets the value either way, as in JavaScript.
        - The warnings are the JavaScript core's, word for word:
          `Expected rank to be one of 'ace,2,3', got: 7`.
        """
        type_name, one_of = _check_of(check)
        if type_name and not self.is_of_type(value, type_name):
            self.console.warn(f"Expected {property_name} to be type '{type_name}', got:", value)
            return False
        if callable(one_of):
            one_of = one_of()
        if one_of is not None and not any(is_same(value, legal) for legal in one_of):
            self.console.warn(f"Expected {property_name} to be one of '{js_string(list(one_of))}', got:", value)
            return False
        return True

    def from_json(self, data: object) -> Any:
        """Spell's JSON read back as what it was:  each object with an `"@type"` made again as its class.

        - `data`:  JSON text, or what `json.loads()` gave already.  Text is always read as JSON.
        - The class:  one the program defined by that name (`things.class_named()`), or spell's own, `List`.
        - Made as the program makes one, `Card(rank="queen")`:  through its properties, then its `create()`.
          A property with nothing declared for it is set after, as a plain property.
        - A spell list:  its own properties as above, then its items from `"@items"`, each made again.
          So an exclusive list, e.g. a `Pile`, owns its cards;  what its `create()` added is replaced.
        - An `"@type"` no class has:  a plain dict, its `"@type"` kept.  NEVER throws for one.
        - NOTE:  JSON keeps no identity:  a card in two places comes back as two cards.
        - throws `json.JSONDecodeError` for text that isn't JSON.
        """
        return _rebuild(json.loads(data) if isinstance(data, str) else data)

    # from `TypeMethods`, which `SpellCore` mixes in beside us
    if TYPE_CHECKING:

        def is_of_type(self, thing: object, type_name: str) -> bool: ...


def _check_of(check: Prop | Mapping[str, Any] | None) -> tuple[str | None, Any]:
    """`check`'s type name and its legal values:  from a `prop()`, or a dict (`one_of`, or JavaScript's `oneOf`)."""
    if check is None:
        return None, None
    if isinstance(check, Prop):
        return check.type, check.one_of
    return check.get("type"), check.get("one_of", check.get("oneOf"))


def _rebuild(value: object) -> Any:
    """`value`, read from JSON, made again:  see `from_json()`."""
    if isinstance(value, list):
        return [_rebuild(item) for item in value]
    if not isinstance(value, dict):
        return value
    type_name = value.get(TYPE_KEY)
    cls = things.class_named(type_name) if isinstance(type_name, str) else None
    if cls is None:
        return {key: _rebuild(field) for key, field in value.items()}
    fields = {key: field for key, field in value.items() if key != TYPE_KEY}
    if not issubclass(cls, List):
        return _make(cls, fields)
    items = fields.pop(ITEMS_KEY, None)
    made = _make(cls, fields)
    made.items = [_rebuild(item) for item in items] if isinstance(items, list) else []
    return made


def _make[Made: SpellObject](cls: type[Made], fields: dict[str, object]) -> Made:
    """A new `cls`, its properties `fields`, each made again:  through what it declares, the rest after."""
    declared = {key: _rebuild(field) for key, field in fields.items() if _has_setter(cls, key)}
    made = cls(**declared)
    for key, field in fields.items():
        if key not in declared:
            made._props[key] = _rebuild(field)
    return made


def _has_setter(cls: type, key: str) -> bool:
    """Does `cls` say how to set `key`:  a `prop()`, or a `@property` with a setter?  The nearest class decides."""
    for ancestor in cls.__mro__:
        if key in vars(ancestor):
            found = vars(ancestor)[key]
            return isinstance(found, Prop) or (isinstance(found, property) and found.fset is not None)
    return False
