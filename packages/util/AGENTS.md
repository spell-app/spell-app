# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell/util`.

Conventions every package shares -- Solid 2, Long-term debt, Documentation, Functions, Decorators,
Types / Exports, Imports -- are in the repo root's `AGENTS.md`:  READ it FIRST.  Only what's local is below.

## Overview

- `@spell/util` (`#util`) holds the small GENERIC helpers more than one package uses:
  - `decorators.ts` -- `@proto`, the standard-decorator for class defaults
  - `class.ts` -- `hasOwnProp` ...
  - `string.ts` -- case conversion, `numberToWord`, `suggest`
  - `dom.ts` -- shadow-aware traversal, `isBrowser`, `nextFrame`
  - `util.types.ts` -- `Constructor`, `AbstractClass`, `Prettify`
- It sits UNDER every other package and imports NONE of them.  `@spell/ui` is published and bundles what it
  imports from here (its `.d.ts` files inline it), so nothing spell-specific may land here.
- What does NOT belong:
  - anything spell-specific
  - anything needing a dependency `ui` doesn't already have (`pluralize`, CommonJS `lodash` ...):  it stays in its
    package, e.g. `spell-util`'s `src/string.ts`
  - anything only ONE package uses:  `ui`'s `core.ts` re-exports `$/util` wholesale, so every helper here lands in
    `ui`'s `core` bundle (`yarn measure`), used or not
  - when in doubt, leave it in the package
- Commands:  `yarn review`, `yarn ts`, `yarn lint`, `yarn format`, `yarn test` (a real browser, chromium).
- Packages import `#util` (the barrel) ONLY, never `#util/<file>`.  Each keeps its own `util` barrel
  (`#spell-util`, `$/util`) for package-specific helpers, and that barrel re-exports `#util`.

## Decorators

As the root's, plus:

- `vitest.config.ts` uses the `standardDecorators()` plugin, so `decorators.test.ts` runs lowered decorators.
- Every other package that compiles this source (`ui`'s build, its docs site, `spell`) already runs that plugin.

## Types / Exports

As the root's.  The barrel has no self-namespace:  helpers are imported by name.

## Imports

As the root's, with `#util` as our alias (from `tsconfig.base.json`).  Files in THIS package import each other as
direct peers (`./class`).
