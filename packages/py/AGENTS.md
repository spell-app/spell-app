# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/py`.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- Everything spell has for Python, in one place (epic `python-target` P21):
  - [ts/](ts/index.ts):  the TypeScript that writes Python, `$/py` (`PY`)
  - [core/](core/pyproject.toml):  `spell_core`, what compiled Python imports
  - [quart/](quart/pyproject.toml):  `spell_quart`, a Python spell program served as a web app on Quart
- ONE yarn workspace, `@spell-app/py`:  its TypeScript is in `ts/`, not the usual `src/`.
  - The alias table (`tsconfig.base.json`) points `$/py` at `ts/`.
  - `core/` and `quart/` are uv projects of their own, beside it:  yarn doesn't look in them.
- Imports `$/parser` (`P`) and `$/util` only.  `spell` imports this, for its targets (`SP.TARGETS`).
  - Parser's helpers the writers share come through its barrel:  `P.ProgramWriter`, `P.JSWriter`, `P.Naming`,
    `P.forEachNode()`, and `P.jsShapes` (`unwrapped()`, `isCoreCall()` ...).
- `yarn review` here covers all three:  tsc, oxlint / oxfmt and vitest on `ts/`, then ruff and pytest in each uv
  project.

## The writers (`ts/`)

- `PY.PyWriter`:  Python, on asyncio:  the `py` target's writer, `<Project>.compiled.py`
  - It builds on `PY.PyBaseWriter` (on `P.ProgramWriter`), which writes all but waiting.
  - It writes Python as a person would:
    - PEP 8's names, e.g. `Card.RANKS`, and `class_` for a keyword
    - Python's own words:  `for number in range(1, 101):`, `x is None`, f-strings
    - type hints where spell knows the kind
  - `spell_core`'s one object, `core`, only where Python has no word for what spell says.
  - A function that waits is `async def`, and every call of it awaits it;  a program that never waits is plain
    Python (one target since P22).
- `PY.ElementsWriter`:  a Python program's DRAWING half, in javascript, `<Project>.elements.js` (P19)
  - For a page that draws the program running in Python, from the state Python sends.
  - It extends `P.JSWriter`:  the classes as they are, the program's top-level steps left out,
    each thing it keeps an `export let` bound from the state (`adopt()`).
  - A top-level function, a call in a drawing's handler and an event:  a message to Python, by Python's names.
- `PY.pyText`:  Python's punctuation
  - blocks by their indent, text in quotes, docstrings
  - a long call broken one item a line, as Black (Python's usual formatter) does
- `PY.quartApp()`:  a program's web app, `<Project>.app.py` (P20), and `PY.isUneditedApp()`:
  each compile rewrites it only while nobody has edited it.

## `spell_core` (`core/`)

- What spell compiled to Python imports, for what Python has no word of its own for.
  - Compiled code imports `core`, and the classes it extends:  `from spell_core import core, Thing, List, App, prop, h`.
  - That `core` has the JavaScript core's methods, snake_cased, e.g. `random_item_of()`.
  - Each module is the twin of one in `@spell-app/core`, e.g. `positions.py` of
    [positions.ts](../core/src/positions.ts).
  - `core` stands in for the running program's own core (`using_core()`):  one per web visitor.
  - Standard library only (decision Q33):  any standard module is fine;  a package from outside it, ask Owen first.
- A uv project, [pyproject.toml](core/pyproject.toml) with its `uv.lock`:  Python 3.12 or later.
  - Tests are pytest's, in `core/tests/`;  lint and format, ruff.
  - The yarn scripts here run them:

    ```sh
    uv run --directory core pytest -q     # yarn test
    uv run --directory core ruff check    # yarn lint, and --fix in yarn lint:fix
    uv run --directory core ruff format   # yarn format
    ```

- It runs a compiled program with `python -m spell_core.run <program> --seed n`.
  - cli's [`runPython()`](../cli/src/commands/runCommand.ts) runs it through uv in this project.
  - `--no-pauses`:  a pause doesn't wait;  `--page`:  print what it drew, as HTML;
    `--state`:  print its state as JSON by id.
- `PageSession` (`spell_core.page`):  a program's side of a page that draws it.
  - `python -m spell_core.page <program> --seed n` talks to a page over stdin and stdout, a JSON line each.
- Four checks keep it in step with the javascript core (`packages/core`):
  - the core's method list:  every name in [spellCore.declarations.json](../core/spellCore.declarations.json),
    or listed as not ported yet
  - seeded random:  both read [seededRandom.expected.json](../core/seededRandom.expected.json)
  - state by id:  both write and read [stateById.expected.json](../core/stateById.expected.json)
  - the core contract (cli's [contract.test.ts](../cli/src/contract.test.ts)):
    a compiled program prints exactly what javascript prints
- The terminal-drawing study (P15) is in `core/experiments/terminal`.
  - Its tests need their own uv group, `study`, so the runs above leave them out.

## `spell_quart` (`quart/`)

- A Python spell program served as a web app on Quart (P20):  a uv project depending on `spell_core` and Quart.
- `SpellSessions`:  a game per visitor (a cookie), the program run once for each on a core of its own;
  a page per WebSocket:  the state down when it opens, a patch after each message and at each pause
  (`core.before_pause`).
- `page_html()`:  the page, loading the page side (app's `yarn build:page`, `dist-page/`) and the drawing half.
- cli's [quartApp.test.ts](../cli/src/quartApp.test.ts) plays Solitaire through a compiled app, in headless Chromium.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `PY` ~== `$/py`
