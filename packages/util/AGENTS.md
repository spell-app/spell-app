# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/util`.

**READ the repo root's `AGENTS.md` and WWOD (`agents/wwod/WWOD.md`) FIRST:**  the repo's layout, and the
house style every package shares.  Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- `@spell-app/util` (`$/util`) holds the small GENERIC helpers more than one package uses:
  - `decorators.ts` -- `@proto`, the standard-decorator for class defaults
  - `class.ts` -- `hasOwnProp` ...
  - `string.ts` -- case conversion, `numberToWord`, `suggest`
  - `dom.ts` -- shadow-aware traversal, `isBrowser`, `nextFrame`
  - `util.types.ts` -- `Constructor`, `AbstractClass`, `Prettify`
- It sits UNDER every other package and imports NONE of them.  `@spell-app/ui` is published and bundles what it
  imports from here (its `.d.ts` files inline it), so nothing spell-specific may land here.
- What does NOT belong:
  - anything spell-specific
  - anything needing a dependency `ui` doesn't already have (`pluralize`, CommonJS `lodash` ...):  it goes in
    `src/spell/`, never beside the generic files
  - anything only ONE package uses:  `ui`'s `core.ts` re-exports its `$/ui/util` wholesale, which imports every GENERIC
    file here, so each lands in `ui`'s `core` bundle (`yarn measure`), used or not
  - when in doubt, leave it in the package
- Commands:  `yarn review`, `yarn ts`, `yarn lint`, `yarn format`, `yarn test` (a real browser, chromium, for the
  generic files;  node for `src/spell/`).
- Packages import `$/util` (the barrel) ONLY, never `$/util/<file>` -- with ONE exception:  `ui`'s `src/util/index.ts`
  imports the generic files one by one (`$/util/class` ...), so spell's utilities never reach `ui`'s bundles or published
  declarations.  `ui` keeps its own `util` barrel (`$/ui/util`) for package-specific helpers.

## Spell's utilities (`src/spell/`)

- Spell's own utilities, flattened into the `$/util` barrel LAST:  lodash and string helpers, `Observable` /
  `Derivative` / `Loadable`, `Task` / `TaskList`, `$fetch`, `Logger`, prefs, `assert` / `die`, DOM helpers.  The bottom
  of the spell chain:  every spell-family package may import it, and it imports nothing above it.
  - Formerly the package `spell-util`.  A sub-folder, not loose files:  `string.ts` / `DOM.ts` would clash with the generic
    `string.ts` / `dom.ts` (macOS is case-insensitive), and nothing in `ui` may import it.
  - Its dependencies (lodash, `chalk`, `pluralize`, `react` ...) are `util`'s `dependencies`.  `ui` bundles none of
    them:  `yarn measure` and `yarn smoke` (declarations) prove it.
- Files in `src/spell/` import the generic helpers by deep path (`$/util/class`), NEVER the `$/util` barrel (it re-exports
  this folder:  a cycle).
- NOTE: `ResponseErrors.ts` is deliberately NOT in `src/spell/index.ts` -- see its header.
- Reactivity here is spell CELLS (P11):  `cells.ts` (the page-wide context, tracking, `flushCells()`), `Cell`,
  `Derived`, `Reaction`, `Schema` (per-class prop types), `extend.ts` (records + `getProp` / `setProp` /
  `getState`...), `Observable`, `spellDecorators.ts` (`@prop` / `@derived` / `@thing`), `bridges.ts` (`bridgeSolid()`,
  which the HOST calls -- this package never imports Solid;  `observe()`), `view.ts` (the React bridge).  It's Solid
  work:  READ the root's Solid 2 pointer first.
- Tests: the generic ones run in a real browser (`util:browser`), `src/spell/**` in node (`util:spell`);
  `vitest.config.ts` exports `utilProjects()` for the root run.

## Decorators

As WWOD §12, plus:

- `vitest.config.ts` uses the `standardDecorators()` plugin, so `decorators.test.ts` runs lowered decorators.
- Every other package that compiles this source (`ui`'s build, its docs site, `spell`) already runs that plugin.

## Types / Exports

As WWOD §8.  The barrel has no self-namespace:  helpers are imported by name.

## Imports

As WWOD §4, with `$/util` as our alias (from `tsconfig.base.json`).  Files in THIS package import each other as
direct peers (`./class`).
