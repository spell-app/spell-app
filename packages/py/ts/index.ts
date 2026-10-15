/**
 * `@spell-app/py` (`$/py`, `PY`):  everything spell has for Python (epic `python-target` P21).
 * - Here, in `ts/`:  the TypeScript that writes Python, and Python's page and app.
 *   - `PY.PyWriter`:  the `py` target's writer, `<Project>.spell.py`, on asyncio
 *   - `PY.PyBaseWriter`:  what it builds on, all but waiting
 *   - `PY.ElementsWriter`:  a Python program's drawing half in javascript, `<Project>.elements.spell.js`
 *   - `PY.pyText`:  Python's punctuation
 *   - `PY.quartApp()`:  a program's web app, `<Project>.app.py`
 * - Beside it, a uv project of its own, `core/`:  `spell_core`, what compiled Python imports.
 *   - `spell_quart`, which serves a program on Quart, is the spaces package's (`packages/spaces/src/server/py/`).
 * - Imports `$/parser` (`P`) only:  `spell` imports this, for its targets.
 */
export * as PY from "./"

export * from "./PyBaseWriter"
export * from "./PyWriter"
export * from "./ElementsWriter"
export * as pyText from "./pyText"
export * from "./quartApp"
