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
- Its Python twin, `spell_core`, is in [packages/py/core](../py/AGENTS.md):  what spell compiled to Python imports
  ("The Python core", below).
- [spellCore.scopes.js](src/spellCore.scopes.js) is GENERATED:  the built-in types' docs, for pages with no parser.
  - Built from spell's table of built-in types, `BUILT_IN_TYPE_TABLE` ([builtinTypes.ts](../spell/src/builtinTypes.ts)).
  - By `yarn scopes --builtins`, in `../lsp`.
  - NEVER edit it by hand:  edit the table, run that.
- [spellCore.declarations.json](spellCore.declarations.json) is GENERATED too:
  the core's method list, what another target's core must have (Python's, in `packages/py/core`).
  - Read from the running core by [`coreDeclarations()`](src/coreDeclarations.ts).
  - Each name's `section` and `description` come from its docstring's lead, in the module's source:
    what the core reference page shows (`guides/targets/core-reference.html`, epic `python-target` P29).
    A name with no docstring fails `coreDeclarations.test.ts`.
  - Written by `yarn gen:declarations` ([writeCoreDeclarations.ts](src/writeCoreDeclarations.ts)).
  - [coreDeclarations.test.ts](src/coreDeclarations.test.ts) fails until you run it,
    after adding, renaming or removing anything on `spellCore`.
  - Python's [test_core_declarations.py](../py/core/tests/test_core_declarations.py) checks `spell_core` against it:
    a new name fails there too, until it's ported or listed in py's `core/not_ported_yet.json`.
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
- A PAGE drawing a program that runs elsewhere, e.g. in Python ([page.ts](src/page.ts), P19):
  - `startPage()` mirrors the program's state, binds its things in its drawing half (`<Project>.elements.js`'s
    `adopt()`), and starts its app;  `receive()` reads each patch after.
  - `sendCall()` / `sendTrigger()`:  what the drawing half sends back, each thing by its id.
  - The state names properties as Python does:  read as javascript names them (`javascriptName()`).
  - Python's side is `spell_core.page`'s `PageSession`.

## The Python core

- Its Python twin, `spell_core`, is `@spell-app/py`'s, in [packages/py/core](../py/AGENTS.md) (epic `python-target` P21).
  - The three files both cores read stay here:  `spellCore.declarations.json`, `seededRandom.expected.json`,
    `stateById.expected.json`.

## Decorators

As WWOD §12, plus:

- `vitest.config.ts` uses `vite.decorators.ts` (repo root).

## Types / Exports

As WWOD §8, plus our self-namespace:

- `SC` ~== `$/core`
