# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/core`.

**Root conventions apply:  READ the repo root's `AGENTS.md` FIRST** -- its Documentation, Functions,
Types / Exports and Imports sections all apply here.  Only what DIFFERS is below.

## Overview

- The runtime compiled spell runs on, `$/core` (`SC`):  the core classes, collections, `Thing` registry,
  console, assertions, `spellCore.scopes.js`.  Compiled programs link against a bundled copy of it,
  `spell-runtime.js`, NOT this source directly.
- `src/spellCore.scopes.js` is GENERATED -- the built-in types' docs, for pages with no parser -- from spell's
  `BUILT_IN_TYPE_TABLE` (`../spell/src/builtinTypes.ts`), by `yarn scopes --builtins` in `../lsp`.  NEVER edit it
  by hand:  edit the table, run that.
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

## Imports

- As the root's, with `SC` ~== `$/core` as our one namespace.

## Decorators

As the root's, plus:

- `vitest.config.ts` uses `vite.decorators.ts` (repo root).

## Types / Exports

As the root's, plus our self-namespace:

- `SC` ~== `$/core`
