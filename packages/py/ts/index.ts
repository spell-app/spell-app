/**
 * `@spell-app/py` (`$/py`, `PY`):  everything spell has for Python (epic `python-target` P21).
 * - Here, in `ts/`:  the TypeScript that writes Python, and Python's page and app.
 *   - `PY.PyWriter`:  the `py` target's writer, `<Project>.compiled.py`
 *   - `PY.PyAsyncWriter`:  the `py/asyncio` target's, on `asyncio`
 *   - `PY.ElementsWriter`:  a Python program's drawing half in javascript, `<Project>.elements.js`
 *   - `PY.pyText`:  Python's punctuation
 *   - `PY.quartApp()`:  a program's web app, `<Project>.app.py`
 * - Beside it, uv projects of their own:  `core/` (`spell_core`, what compiled Python imports) and
 *   `quart/` (`spell_quart`, a program served on Quart).
 * - Imports `$/parser` (`P`) only:  `spell` imports this, for its targets.
 */
export * as PY from "./"

export * from "./PyWriter"
export * from "./PyAsyncWriter"
export * from "./ElementsWriter"
export * as pyText from "./pyText"
export * from "./quartApp"
