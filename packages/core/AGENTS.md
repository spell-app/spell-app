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
- [spellCore.scopes.js](src/spellCore.scopes.js) is GENERATED:  the built-in types' docs, for pages with no parser.
  - Built from spell's table of built-in types, `BUILT_IN_TYPE_TABLE` ([builtinTypes.ts](../spell/src/builtinTypes.ts)).
  - By `yarn scopes --builtins`, in `../lsp`.
  - NEVER edit it by hand:  edit the table, run that.
- Depends only on `$/util`.
  NEVER import `$/spell` / `$/parser`, or anything above.
- Drawing code here is Solid work:  READ the root's Solid 2 pointer first.
  - That's [drawing.ts](src/drawing.ts):
    - drawing a thing or a list's items:  `drawThing()`, `drawItems()`
    - the `@drawn` decorator, and the error net it shares with `drawThing()`
    - mounting an app, `mountApp()`
    - the `h` it exports
  - Compiled javascript draws with Solid's own `h()`, imported from `@spell/core`.
    - Since epic `output-targets` P20.
    - `h()` returns a thunk:  the error net makes it, once, and a throw while it's made shows the stand-in.
    - `spellCore.element()`, what it called before, is in [deprecated.ts](src/deprecated.ts):
      programs compiled before still run.

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

## Decorators

As WWOD §12, plus:

- `vitest.config.ts` uses `vite.decorators.ts` (repo root).

## Types / Exports

As WWOD §8, plus our self-namespace:

- `SC` ~== `$/core`
