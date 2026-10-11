# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/core`.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- The runtime compiled spell runs on, `$/core` (`SC`):
  - the core classes, collections, `Thing` registry
  - console, assertions
  - `spellCore.scopes.js`
  - Compiled programs link against a bundled copy of it, `spell-runtime.js`, NOT this source directly.
- Its Python twin, `spell_core`, is in [py/](py/pyproject.toml):  what spell compiled to Python imports
  ("The Python core", below).
- [spellCore.scopes.js](src/spellCore.scopes.js) is GENERATED:  the built-in types' docs, for pages with no parser.
  - Built from spell's table of built-in types, `BUILT_IN_TYPE_TABLE` ([builtinTypes.ts](../spell/src/builtinTypes.ts)).
  - By `yarn scopes --builtins`, in `../lsp`.
  - NEVER edit it by hand:  edit the table, run that.
- [spellCore.declarations.json](spellCore.declarations.json) is GENERATED too:
  the core's method list, what another target's core must have (Python's, in `py/`).
  - Read from the running core by [`coreDeclarations()`](src/coreDeclarations.ts).
  - Written by `yarn gen:declarations` ([writeCoreDeclarations.ts](src/writeCoreDeclarations.ts)).
  - [coreDeclarations.test.ts](src/coreDeclarations.test.ts) fails until you run it,
    after adding, renaming or removing anything on `spellCore`.
  - Python's [test_core_declarations.py](py/tests/test_core_declarations.py) checks `spell_core` against it:
    a new name fails there too, until it's ported or listed as not ported yet.
- Random numbers come from the core's own generator, [`ParkMiller`](src/ParkMiller.ts), NEVER `Math.random()`:
  - `spellCore.seedRandom(n)` makes everything random after it repeat;  unseeded, each run differs.
  - `spellCore.shuffled()` is lodash's shuffle, step for step.
  - Python's core deals the same from the same seed:
    both read [seededRandom.expected.json](seededRandom.expected.json) in their tests.
- Positions count from where a project's lists start:  1, spell's own, or 0 (`project.json`'s `"listsStartAt": 0`).
  - The helpers that convert:  [positions.ts](src/positions.ts), used by `List` and the collection helpers.
  - Negative positions count from the end either way:  `-1` is the last item.
- The console sends a DUMP (a thing, a spell list ...) through `spellCore.console.printDump()`:
  the page's console by default, stderr under `spell run`.
- Depends only on `$/util`.
  NEVER import `$/spell` / `$/parser`, or anything above.
- Drawing code here is Solid work:  READ the root's Solid 2 pointer first.
  - That's [drawing.ts](src/drawing.ts):
    - drawing a thing or a list's items:  `drawThing()`, `drawItems()`
    - the `@drawn` decorator, and the error boundary it shares with `drawThing()`
    - mounting an app, `mountApp()`
    - the `h` it exports
  - Compiled javascript draws with Solid's own `h()`, imported from `@spell/core`.
    - Since epic `output-targets` P20.
    - `h()` returns a thunk:  the error boundary makes it, once, and a throw while it's made shows the stand-in.
    - `spellCore.element()`, what it called before, is gone (epic `output-targets` P22):
      every committed example is recompiled, and a program compiled before P20 no longer draws.
- A drawable thing's own element, e.g. `<solitaire-card>`:
  - [elements.ts](src/elements.ts) names its tag
  - the page makes the element, through `spellCore.elementDefiner`, which app's `SpellElement.tsx` sets
  - Core never imports Spell UI.

## Who may value-import it

- ONLY the app's runner entry, [spellRuntime.ts](../app/src/runner/spellRuntime.ts), may value-import `$/core`,
  in every bundle.
  - Anything else -- the app, the parser, the language --
    puts it in a shared chunk, or loads a second copy.
  - Programs run on the runtime bundle built from it, `spell-runtime.js`, NEVER the page's own `core`.
    Each runner loads its own copy, so apps on a page don't share one.
  - Everyone else reads only:
    - its types:  `import type` from `$/core/spellCore.types`
    - or the runtime's own API, e.g. `runtimeConsole()`
  - Pinned by two of app's tests:
    [element.build.test.ts](../app/src/runner/element.build.test.ts) and [build.test.ts](../app/src/build.test.ts).
- It runs in a shadow root, so NEVER `document`:
  - `spellCore.appRoot` is where an app mounts
  - `spellCore.domRoot()` is where to look elements up, and add styles

## Membership and guards

- An EXCLUSIVE list class roots a FAMILY:  it and its sub-classes, e.g. `Pile` and its `Tableau`.
  - Compiled from `a card belongs to one pile`, as `Pile.exclusive = true`.
- An item is in at most ONE list of a family (plan doc D7, D8 of precedence-and-types):
  - adding it takes it out of the list that held it, and adding one a list holds moves it
  - removing it leaves it with no owner
  - `Pile.ownerOf(card)` is who holds it, TRACKED with a spell cell per item
    - ONE `WeakMap` per family, by its root class (`ListFamily`, [List.ts](src/classes/List.ts))
    - compiled spell's `the pile of a card` is a getter calling it
  - only objects can be owned:  a number or text is just held
- EVERY change to a list's `items` MUST go through `List.writeItems()`:
  - the list's own mutators all do:
    - `add`, `addAtPosition`
    - `setItem`, `removeItem`
    - `clear`, and the `items` setter
  - a new mutator that writes `setState("items", ...)` itself bypasses the owners
- Collection helpers' results are SCRATCH, and own nothing:  or filtering a pile would steal its cards.
  - Made by `List.asScratch()`, `spellCore.newScratch()`.
  - The helpers:
    - `map()`, `filter()`
    - ranges
    - `a copy of`, `merge ... into a new pile`
  - Build a new helper's result with `newThingLike()` / `newScratch()`.
    - Never with `new constructor()`.
- Guards (plan doc Q23 - Q25):  `canTake(item)` / `canGiveUp(item)`, yes by default.
  - Compiled spell overrides them, e.g. in `Tableau`:
    - `a tableau can take a card if: ...`
    - compiles to `canTake(card) {...}`
  - ONLY a move asks:  `spellCore.move(item, list)` => `list.moveHere(item)`.
    - The list of its family holding it gives it up, then `list` takes it;  else nothing changes.
    - Returns whether it moved.
  - Dealing and gathering cards back never ask:
    - `add`, `remove`
    - `clear`
  - `spellCore.canTake()` / `canGiveUp()` ask without moving.
  - A plain array has no guards.
- Tests:
  - [List.test.ts](src/classes/List.test.ts)
  - end to end, spell's [membership.test.ts](../spell/src/parserTests/membership.test.ts)

## JSON

- Every spell object's JSON says its class first, `"@type"`, then its props.
  - `{ "@type": "Card", "rank": "ace" }`
  - a list's adds its items, under `"@items"`, its `ITEMS_KEY`:
    - `{ "@type": "Pile", "name": "stock", "@items": [...] }`
  - written by `$/util`'s `typedJSON()`
  - Neither key is ever a prop:  what the Thing Explorer lists (`keys()`) doesn't have them.
- `spellCore.fromJSON()` ([json.ts](src/json.ts)) reads it back, each object as its class.
  - It finds a class by name, `spellCore.things.classNamed()`.
  - That knows a class once one of its things is made,
    or once a runner hands it the program's modules (`addClasses()`).
  - A list's items are SET (`writeItems()`), so a pile owns its cards.
  - An unknown `"@type"`:  a plain object.
- A program's STATE, for a page that mirrors it ([state.ts](src/state.ts), epic `python-target` P17):
  the same JSON, each thing and list with an `"@id"` after its `"@type"`.
  - `StateWriter.stateOf()` writes a thing whole the first time, then `{ "@id": "3" }` alone:
    a card in two places is one card.
  - Each writer keeps the ids it gave:  one writer per page.
  - `StateMirror.read()` reads each state INTO the things it read before, by id:  the same objects, changed.
  - `fromJSON()` reads through a new mirror, so JSON with ids keeps each thing as one.
  - Python's twin is `spell_core.state`:  both write [stateById.expected.json](stateById.expected.json), and read it.

## The Python core

- This package's Python twin is `spell_core`, in `py/`.
  It's what spell compiled to Python imports (epic `python-target`), for what Python has no word of its own for.
  - Compiled code imports the one `core`, and the classes it extends:
    `from spell_core import core, Thing, List, App, prop, h`.
  - That `core` has the JavaScript core's methods, snake_cased, e.g. `random_item_of()`.
  - Each module is the twin of one here, e.g. `positions.py` of [positions.ts](src/positions.ts).
  - Standard library only:  nothing to install besides it.
- It's a uv project of its own, [pyproject.toml](py/pyproject.toml) with its `uv.lock`:  Python 3.12 or later.
  - Its tests are pytest's, in `py/tests/`.
  - Lint and format:  ruff, with the settings in `pyproject.toml`.
  - Core's own yarn scripts run both, after vitest and oxlint / oxfmt, so `yarn review` covers Python too:

    ```sh
    uv run --directory py pytest -q     # yarn test
    uv run --directory py ruff check    # yarn lint, and --fix in yarn lint:fix
    uv run --directory py ruff format   # yarn format
    ```

- It runs a compiled program with `python -m spell_core.run <program> --seed n`.
  - `spell run` does that for a Python target, through uv in this project:
    cli's [`runPython()`](../cli/src/commands/runCommand.ts).
  - `--no-pauses`:  a pause doesn't wait;  `--page`:  print what it drew, as HTML, when it ends.
  - `--state`:  print its state when it ends, as JSON by id:  each thing at its top level, by its name there.
- Four checks keep it in step with this package:
  - the core's method list:  every name in `spellCore.declarations.json`, or listed as not ported yet
  - seeded random:  both read `seededRandom.expected.json`, so one seed deals the same cards
  - state by id:  both write and read `stateById.expected.json`
  - the core contract (cli's [contract.test.ts](../cli/src/contract.test.ts)):
    a compiled program prints exactly what javascript prints, on both Python targets, `py` and `py/asyncio`
- The terminal-drawing study (P15 of epic `python-target`) is in `py/experiments/terminal`.
  - Its tests need their own uv group, `study`, so the runs above leave them out.

## Decorators

As WWOD §12, plus:

- `vitest.config.ts` uses `vite.decorators.ts` (repo root).

## Types / Exports

As WWOD §8, plus our self-namespace:

- `SC` ~== `$/core`
