# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/core`.

**Root conventions apply:  READ the repo root's `AGENTS.md` FIRST** -- its Documentation, Functions,
Types / Exports and Imports sections all apply here.  Only what DIFFERS is below.

## Overview

- The runtime compiled spell runs on, `$/core` (`SC`):  the core classes, collections, `Thing` registry,
  console, assertions, `spellCore.scopes.js`.  Compiled programs link against a bundled copy of it,
  `spell-runtime.js`, NOT this source directly.
- `src/spellCore.scopes.js` is GENERATED -- the built-in types' docs, for pages with no parser --
  from spell's `BUILT_IN_TYPE_TABLE` (`../spell/src/builtinTypes.ts`), by `yarn scopes --builtins` in `../lsp`.
  - NEVER edit it by hand:  edit the table, run that.
- Depends only on `$/util`.  NEVER import `$/spell` / `$/parser` or anything above.
- Rendering code here (`ui.ts`, `element()`, `draw`, `Thing` / `List` / `App` components) is Solid work:  READ the
  root's Solid 2 pointer first.

## Who may value-import it

- ONLY `../app/src/runner/spellRuntime.ts` may value-import `$/core`, in every bundle:  anything
  else -- the app, the parser, the language, the forms -- puts it in a shared chunk, or loads a second copy.
  - Programs run on `spell-runtime.js` (built from `spellRuntime.ts`), NEVER the page's own `core`.
    Each runner loads its own copy, so apps on a page don't share one.
  - Everyone else reads `$/core/spellCore.types` (runtime-light, `import type`), or the runtime's own
    API, e.g. `runtimeConsole()`.
  - Pinned by `../app/src/runner/element.build.test.ts` and `../app/src/build.test.ts`.
- It runs in a shadow root:  `spellCore.appRoot` is where an app mounts, and `spellCore.domRoot()` where to look
  elements up and add styles -- NEVER `document`.

## Membership and guards

- A `List` class with `exclusive = true` (compiled from `a card belongs to one pile` as `Pile.exclusive = true`)
  roots a FAMILY:  it and its sub-classes, e.g. `Pile`, `Tableau`.
- An item is in at most ONE list of a family (plan doc D7, D8 of precedence-and-types):
  - adding it takes it out of the list that held it, and adding one a list holds moves it
  - removing it leaves it with no owner
  - `Pile.ownerOf(card)` is who holds it, TRACKED with a spell cell per item
    - ONE `WeakMap` per family, by its root class (`ListFamily`, `List.tsx`)
    - compiled spell's `the pile of a card` is a getter calling it
  - only objects can be owned:  a number or text is just held
- EVERY change to a list's `items` MUST go through `List.writeItems()`:
  - `add`, `addAtPosition`, `setItem`, `removeItem`, `clear` and the `items` setter all do
  - a new mutator that writes `setState("items", ...)` itself bypasses the owners
- Collection helpers' results are SCRATCH and own nothing (`List.asScratch()`, `spellCore.newScratch()`),
  or filtering a pile would steal its cards:
  - `map()`, `filter()`, ranges, `a copy of`, `merge ... into a new pile`
  - build a new helper's result with `newThingLike()` / `newScratch()`, never `new constructor()`
- Guards (plan doc Q23 - Q25):  `canTake(item)` / `canGiveUp(item)`, yes by default --
  compiled spell overrides them, e.g. `a tableau can take a card if: ...` => `canTake(card) {...}` in `Tableau`.
  - ONLY a move asks:  `spellCore.move(item, list)` => `list.moveHere(item)`:  the list of its family holding it
    gives it up, then `list` takes it, else nothing changes.  Returns whether it moved.
  - `add`, `remove`, `clear` never ask:  dealing, gathering cards back.
  - `spellCore.canTake()` / `canGiveUp()` ask without moving;  a plain array has no guards.
- Tests:  `src/classes/List.test.ts`;  end to end, spell's `src/parserTests/membership.test.ts`.

## Imports

- As the root's, with `SC` ~== `$/core` as our one namespace.

## Decorators

As the root's, plus:

- `vitest.config.ts` uses `vite.decorators.ts` (repo root).

## Types / Exports

As the root's, plus our self-namespace:

- `SC` ~== `$/core`
