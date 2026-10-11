"""spell_core:  what Python compiled from spell imports, to do what Python has no word of its own for.

- The Python twin of the JavaScript core, `@spell-app/core`, in `packages/py/core/`:  `$/py`'s Python.
- Compiled code imports the one `core`, and the classes it extends:
  `from spell_core import core, Thing, List, App, prop, h`.
- And, for spell code counting from 1, what turns its positions into indexes as it runs (`positions.py`):
  `from spell_core import position`.
- Standard library only:  nothing to install besides it.
"""

from spell_core.apps import App, Drawable, DrawableList
from spell_core.console import SpellConsole
from spell_core.core import SpellCore, core
from spell_core.drawing import h
from spell_core.lists import List
from spell_core.positions import end_position, position, spell_position, with_spell_positions
from spell_core.state import StateMirror, StateWriter
from spell_core.things import Thing, prop

__all__ = [
    "App",
    "Drawable",
    "DrawableList",
    "List",
    "SpellConsole",
    "SpellCore",
    "StateMirror",
    "StateWriter",
    "Thing",
    "core",
    "end_position",
    "h",
    "position",
    "prop",
    "spell_position",
    "with_spell_positions",
]
