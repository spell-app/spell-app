"""spell_core:  what Python compiled from spell imports, to do what Python has no word of its own for.

- The Python twin of the JavaScript core, `@spell-app/core`, beside it in `packages/core/py/`.
- Compiled code imports the one `core`, and calls it:  `from spell_core import core`.
- Standard library only:  nothing to install besides it.
"""

from spell_core.console import SpellConsole
from spell_core.core import SpellCore, core

__all__ = ["SpellConsole", "SpellCore", "core"]
