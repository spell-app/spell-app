"""`core`'s side of things:  checking a property as it's set, the program's classes, and spell's JSON read back.

```python
card = core.from_json('{"$type": "Card", "rank": "queen"}')   # a Card again
```

- The twins of the JavaScript core's:
  - `checkProp()`, in `core.ts`
  - `things`, in `things.ts`
  - `fromJSON()`, in `json.ts`
"""

import json
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any

from spell_core.js_text import js_string
from spell_core.kinds import is_same
from spell_core.prop_rules import broken_rule, rule_warning
from spell_core.state import StateMirror
from spell_core.things import Prop, ThingRegistry, things

if TYPE_CHECKING:
    from spell_core.console import SpellConsole

# The types every spell project starts with, as the parser names them:  spell's classes, and `Object`.
BASE_TYPES = ["Object", "Thing", "List", "App", "Drawable", "DrawableList"]


class ThingMethods:
    """`core`'s side of things:  `check_prop()`, `things`, `from_json()`."""

    # where a failed check warns:  `Core` sets it
    console: "SpellConsole"
    # the types every spell project starts with
    base_types = BASE_TYPES
    # the program's classes, by name:  ONE registry, whichever core asks
    things: ThingRegistry = things

    def check_prop(self, property_name: str, value: object, check: Prop | Mapping[str, Any] | None = None) -> bool:
        """Is `value` what `check` declares for property `property_name`?  Else warn on `core.console`.

        - `check`:  a `prop()`'s declaration, or a dict with its `type`, `one_of` and `rules`.
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
        broken = broken_rule(value, _rules_of(check))
        if broken is not None:
            self.console.warn(f"{rule_warning(property_name, broken)}, got:", value)
            return False
        return True

    def from_json(self, data: object) -> Any:
        """Spell's JSON read back as what it was:  each object with an `"$type"` made again as its class.

        - `data`:  JSON text, or what `json.loads()` gave already.  Text is always read as JSON.
        - The class:  one the program defined by that name (`things.class_named()`), or spell's own, `List`.
        - Made as the program makes one, `Card(rank="queen")`:  through its properties, then its `create()`.
          A property with nothing declared for it is set after, as a plain property.
        - A spell list:  its own properties as above, then its items from `"$items"`, each made again.
          So an exclusive list, e.g. a `Pile`, owns its cards;  what its `create()` added is replaced.
        - An `"$type"` no class has:  a plain dict, its `"$type"` kept.  NEVER throws for one.
        - JSON with ids, a `StateWriter`'s (`state.py`):  a thing mentioned twice comes back as one.
          Without them, JSON keeps no identity:  a card in two places comes back as two cards.
        - throws `json.JSONDecodeError` for text that isn't JSON.
        """
        return StateMirror().read(json.loads(data) if isinstance(data, str) else data)

    # from `TypeMethods`, which `Core` mixes in beside us
    if TYPE_CHECKING:

        def is_of_type(self, thing: object, type_name: str) -> bool: ...


def _check_of(check: Prop | Mapping[str, Any] | None) -> tuple[str | None, Any]:
    """`check`'s type name and its legal values:  from a `prop()`, or a dict (`one_of`, or JavaScript's `oneOf`)."""
    if check is None:
        return None, None
    if isinstance(check, Prop):
        return check.type, check.one_of
    return check.get("type"), check.get("one_of", check.get("oneOf"))


def _rules_of(check: Prop | Mapping[str, Any] | None) -> Any:
    """`check`'s rules, what its value must be beyond its type (epic `property-editor` P9):  see `prop_rules.py`."""
    if check is None:
        return None
    if isinstance(check, Prop):
        return check.rules
    return check.get("rules")
