"""spell_core:  what Python compiled from spell imports, to do what Python has no word of its own for.

- The Python twin of the JavaScript core, `@spell-app/core`, beside it in `packages/core/py/`.
- Compiled code imports the one `core`, and the classes it extends:
  `from spell_core import core, Thing, List, prop, h`.
- Standard library only:  nothing to install besides it.
"""

from spell_core.console import SpellConsole
from spell_core.core import SpellCore, core
from spell_core.drawing import h
from spell_core.lists import List
from spell_core.things import Thing, prop

__all__ = ["List", "SpellConsole", "SpellCore", "Thing", "core", "h", "prop"]
