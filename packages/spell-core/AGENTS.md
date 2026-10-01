# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell/spell-core`.

**Root conventions apply:  READ the repo root's `AGENTS.md` FIRST** -- its Documentation, Functions,
Types / Exports and Imports sections all apply here.  Only what DIFFERS is below.

## Overview

- The runtime compiled spell runs on, `#spell-core` (`SC`):  the core classes, collections, `Thing` registry,
  console, assertions, `spellCore.scopes.js`.  Compiled programs link against a bundled copy of it,
  `spell-runtime.js`, NOT this source directly.
- Depends only on `#spell-util`.  NEVER import `#spell` / `#parser` or anything above.
- Rendering code here (`ui.ts`, `element()`, `draw`, `Thing` / `List` / `App` components) is Solid work:  READ the
  root's Solid 2 pointer first.

## Who may value-import it

- ONLY `../spell-app/src/runner/spellRuntime.ts` may value-import `#spell-core`, in every bundle:  anything
  else -- the app, the parser, the language, the forms -- puts it in a shared chunk, or loads a second copy.
  - Programs run on `spell-runtime.js` (built from `spellRuntime.ts`), NEVER the page's own `spell-core`.
    Each runner loads its own copy, so apps on a page don't share one.
  - Everyone else reads `#spell-core/spellCore.types` (runtime-light, `import type`), or the runtime's own
    API, e.g. `runtimeConsole()`.
  - Pinned by `../spell-app/src/runner/element.build.test.ts` and `../spell-app/src/build.test.ts`.
- It runs in a shadow root:  `spellCore.appRoot` is where an app mounts, and `spellCore.domRoot()` where to look
  elements up and add styles -- NEVER `document`.

## Imports

- As the root's, with `SC` ~== `#spell-core` as our one namespace.

## Decorators

As the root's, plus:

- `vitest.config.ts` uses `vite.decorators.ts` (repo root).

## Types / Exports

As the root's, plus our self-namespace:

- `SC` ~== `#spell-core`
