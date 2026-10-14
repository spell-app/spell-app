"""spell_core against the core's method list, `spellCore.declarations.json5`:  nothing the JavaScript core has
is missed.

- The list is written from the JavaScript core by `yarn gen:declarations` (in `packages/core`), beside `py/`.
- Each name, snake_cased, must be on `core` (`getItemAt` is `core.get_item_at()`),
  or in `not_ported_yet.json5` (`NOT_PORTED_YET`), with why.
- A class compiled code imports keeps its name, on the package:  `spell_core.Thing`.
- A name the JavaScript core gains fails here until it's ported, or listed below.
"""

import json
import re
from pathlib import Path
from typing import Any

import spell_core
from spell_core import core

# The repo's root:  these tests are in `tests/py/core/tests/`.
REPO = Path(__file__).parents[4]

# The JavaScript core's method list:  see `coreDeclarations.ts`.
DECLARATIONS: dict[str, Any] = json.loads(
    (REPO / "packages" / "core" / "spellCore.declarations.json5").read_text(encoding="utf-8")
)

# What spell_core doesn't have yet, by the JavaScript name, grouped by why:
# `not_ported_yet.json5`, in spell_core's folder (`packages/py/core/`).
# The core reference page reads it too.  Take a name out as it's ported.
NOT_PORTED_YET_FILE = REPO / "packages" / "py" / "core" / "not_ported_yet.json5"
NOT_PORTED_YET: set[str] = {
    name for group in json.loads(NOT_PORTED_YET_FILE.read_text(encoding="utf-8"))["groups"] for name in group["names"]
}


def snake_case(name: str) -> str:
    """`name` as Python writes it:  `getItemAt` is `get_item_at`.

    - Capitals together stay one word:  `isANumber` is `is_a_number`, `fromJSON` `from_json`.
    - A name all in capitals is lowercased:  `ACTIVE_TEST` is `active_test`, as `core` keeps it.
    """
    if re.fullmatch(r"[A-Z0-9_]+", name):
        return name.lower()
    name = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1_\2", name)
    return re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", name).lower()


def js_name(statement: dict[str, Any]) -> str:
    """The JavaScript name a statement declares:  a member's, a class's or a function's."""
    return statement.get("name") or statement.get("property") or statement["type"]


def is_ported(statement: dict[str, Any]) -> bool:
    """Does spell_core have what `statement` declares?

    - a member of `spellCore`:  on `core`, snake_cased;  a constant may keep its capitals (`core.REACT_APP_ROOT_ID`)
    - a class:  on the package, by its own name
    - a function compiled code imports:  on `core` or the package, snake_cased
    """
    if statement.get("of") == "spellCore":
        name = js_name(statement)
        return hasattr(core, snake_case(name)) or (name.isupper() and hasattr(core, name))
    if "type" in statement:
        return hasattr(spell_core, statement["type"])
    name = snake_case(statement["name"])
    return hasattr(core, name) or hasattr(spell_core, name)


def test_snake_case() -> None:
    assert snake_case("getItemAt") == "get_item_at"
    assert snake_case("isANumber") == "is_a_number"
    assert snake_case("fromJSON") == "from_json"
    assert snake_case("ACTIVE_TEST") == "active_test"
    assert snake_case("on") == "on"


def test_spell_core_has_every_name_not_listed_as_not_ported_yet() -> None:
    missing = [
        js_name(it) for it in DECLARATIONS["statements"] if not is_ported(it) and js_name(it) not in NOT_PORTED_YET
    ]
    assert missing == [], "spell_core lacks these:  port them, or add them to not_ported_yet.json5"


def test_not_ported_yet_holds_only_what_is_missing() -> None:
    listed = {js_name(it) for it in DECLARATIONS["statements"]}
    unknown = sorted(NOT_PORTED_YET - listed)
    assert unknown == [], "not_ported_yet.json5 names what the core's method list doesn't have:  take them out"
    ported = sorted(js_name(it) for it in DECLARATIONS["statements"] if is_ported(it) and js_name(it) in NOT_PORTED_YET)
    assert ported == [], "spell_core has these now:  take them out of not_ported_yet.json5"


def test_the_list_names_spellcore_first() -> None:
    assert DECLARATIONS["provides"][0] == "spellCore"
    assert spell_core.core is core
