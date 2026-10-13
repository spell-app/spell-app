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
  - NOT here:  `spell_quart`, Python's web server, which serves a program as a web app on Quart.
    It's the spaces package's, in its `src/server/py/` ([spaces' AGENTS.md](../spaces/AGENTS.md);
    epic `people-and-orgs` P14).
- ONE yarn workspace, `@spell-app/py`.
  - Its TypeScript is in `ts/`, not the usual `src/`:
    [the alias table](../../tsconfig.base.json) points `$/py` there.
  - `core/` is a uv project of its own, beside it:  yarn doesn't look in it.
- It imports only `$/parser` (`P`) and `$/util`.
  - The parser's helpers the writers share come through its barrel:
    - `P.ProgramWriter`
    - `P.JSWriter`
    - `P.Naming`
    - `P.forEachNode()`
    - `P.jsShapes` (`unwrapped()`, `isCoreCall()` ...)
- `spell` imports it, for its targets (`SP.TARGETS`).
- `yarn review` here covers both:
  - `ts/`:  tsc, oxlint / oxfmt and vitest
  - then `core/`:  ruff and pytest
- Tests live in the repo's `tests/py/`, at the same paths as the code they test:
  - `ts/PyWriter.ts` => `tests/py/ts/PyWriter.test.ts`, found by vitest (`vitest.config.ts` points there)
  - `core/tests/` => `tests/py/core/tests/`
    - Its pytest finds them by its `testpaths`;  the yarn scripts hand ruff their folder too.

## The writers (`ts/`)

- `PY.PyWriter`:  the `py` target's writer, Python on asyncio
  - It writes `<Project>.spell.py`, into the project's build folder (`build/`, "Projects" in spell's PARSING.md).
  - It builds on `PY.PyBaseWriter` (on `P.ProgramWriter`), which writes all but waiting.
  - It writes Python as a person would:
    - PEP 8's names, e.g. `Card.RANKS`, and `class_` for a keyword
    - Python's own words:  `for number in range(1, 101):`, `x is None`, f-strings
    - type hints where spell knows the kind
  - It calls `spell_core`'s one object, `core`, only where Python has no word for what spell says.
  - A function that waits is `async def`, and every call of it awaits it.
    A program that never waits is plain Python (one target since P22).
- `PY.ElementsWriter`:  a Python program's DRAWING half, in javascript, `<Project>.elements.spell.js` (P19)
  - For a page that draws the program running in Python, from the state Python sends.
  - It extends `P.JSWriter`:
    - the classes as they are
    - the program's top-level steps left out
    - each thing it keeps:  an `export let`, bound from the state (`adopt()`)
  - A top-level function, a call in a drawing's handler, and an event:
    each is a message to Python, by Python's names.
- `PY.pyText`:  Python's punctuation
  - blocks by their indent, text in quotes, docstrings
  - a long call broken one item a line, as Black (Python's usual formatter) does
- `PY.quartApp()`:  a program's web app, `<Project>.app.py` (P20)
  - Each compile rewrites it only while nobody has edited it (`PY.isUneditedApp()`).
  - It's committed beside the project's source;  its program and page file are built into the project's build
    folder.  It finds them from its own folder:  `OUTPUTS`, from `QuartAppSpec.outputs`
    (the project index's `buildFolder`;  `.` for `spell run`'s temp folder).

## `spell_core` (`core/`)

- What spell compiled to Python imports, for what Python has no word of its own for.
  - Compiled code imports `core`, and the classes it extends:  `from spell_core import core, Thing, List, App, prop, h`.
  - That `core` has the JavaScript core's methods, snake_cased, e.g. `random_item_of()`.
  - Each module is the twin of one in `@spell-app/core`,
    e.g. `positions.py` of [positions.ts](../core/src/positions.ts).
  - `core` stands in for the running program's own core (`using_core()`):  one per web visitor.
  - Standard library only (decision Q33):  any standard module is fine;  a package from outside it, ask Owen first.
- A uv project, [pyproject.toml](core/pyproject.toml) with its `uv.lock`:  Python 3.12 or later.
  - Tests are pytest's, in the repo's `tests/py/core/tests/`;  lint and format, ruff.
  - The yarn scripts here run them:

    ```sh
    uv run --directory core pytest -q                                     # yarn test
    uv run --directory core ruff check . ../../../tests/py/core/tests    # yarn lint, and --fix in yarn lint:fix
    uv run --directory core ruff format . ../../../tests/py/core/tests   # yarn format
    ```

- It runs a compiled program with `python -m spell_core.run <program> --seed n`.
  - cli's [`runPython()`](../cli/src/commands/runCommand.ts) runs it through uv in this project.
  - Its flags:
    - `--no-pauses`:  a pause doesn't wait
    - `--page`:  print what it drew, as HTML
    - `--state`:  print its state as JSON by id
- `PageSession` (`spell_core.page`):  a program's side of a page that draws it.
  - `python -m spell_core.page <program> --seed n` talks to a page over stdin and stdout, a JSON line each.
- References (`spell_core.references`, P27):  a thing named in text, `Card#queen-of-spades`, `Tableau#1`.
  - The javascript core's words (drawable-thing's `references.ts`), read the same way.
  - A page's message may name things so:  an event's `"target"`, a call's `"on"`;  the handler gets the thing as
    `event.target`, and as `event.card`.  `{"$id": ...}` still works.
  - A place counts the things a page was sent, in the order it was sent them:  the order its copies were made in.
  - The program's own core reads them too (`core.thing_for_reference()`, `thing_named()`, `thing_at_place()`,
    `reference_for()`, in `spell_core.reference_methods`):  its places count the things that core made, in order.
    - Not counted:  a plain `List`, a thing made inside a test, a helper's scratch result (made `core.quietly()`).
    - A name falls back to a thing the program keeps at its top level, as javascript's does.
- A drawable program (P28) draws its own elements (`<solitaire-card>`) on the page:  the page's javascript defines them,
  so the Python leaves out the `elementTag` line.
- `play_page()` (`spell_core.playing`, P30):  a test plays a program the way its page does, by the page's messages.
  - `game.trigger("card-click", card=game.ref(card))`, `game.call("deal_the_cards")`:  each answered by its patch.
  - `game.thing(id)`, `game.named("stock")`:  what the page holds now, by id.
  - After each, the patches so far must add up to the whole state, else `PatchMismatchError`.
  - The contract's 300 clicks per game play through it ([patches_in_a_game.py](../../tests/py/core/tests/patches_in_a_game.py)).
- Five checks keep it in step with the javascript core ([core's AGENTS.md](../core/AGENTS.md)):
  - the core's method list ([spellCore.declarations.json](../core/spellCore.declarations.json)):
    `spell_core` has each name, or lists it, with why, in [not_ported_yet.json](core/not_ported_yet.json)
  - seeded random:  both read [seededRandom.expected.json](../../tests/core/seededRandom.expected.json)
  - state by id:  both write and read [stateById.expected.json](../../tests/core/stateById.expected.json)
  - saved by id:  both write and read [savedById.expected.json](../../tests/core/savedById.expected.json)
  - Those three are with the JavaScript core's tests (`tests/core/`).
  - the core contract (cli's [contract.test.ts](../../tests/cli/src/contract.test.ts)):
    a compiled program prints exactly what javascript prints
- The terminal-drawing study (P15) is in `core/experiments/terminal`.
  - Its tests need their own uv group, `study`, so the runs above leave them out.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `PY` ~== `$/py`
