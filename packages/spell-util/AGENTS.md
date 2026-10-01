# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell/spell-util`.

**Root conventions apply:  READ the repo root's `AGENTS.md` FIRST** -- its Documentation, Functions,
Types / Exports and Imports sections all apply here.  Only what DIFFERS is below.

## Overview

- Spell's own utilities, `#spell-util`:  lodash and string helpers, `Observable` / `Derivative` / `Loadable`,
  `Task` / `TaskList`, `$fetch`, `Logger`, prefs, `assert` / `die`, DOM helpers.  The bottom of the chain:
  every spell-family package may import it, and it imports nothing above it.
- NOT `packages/util` (`#util`, `@spell/util`).  That one is the small generic set `ui` shares;  this barrel
  re-exports it (`export * from "#util"`), so `@proto` etc. also come from `#spell-util`.
  - Put a helper in `#util` only if `ui` needs it:  anything there lands in `ui`'s `core` bundle.
- Reactivity here (`Observable`, `getProp` / `setProp`, stores) is Solid work:  READ the root's Solid 2 pointer
  first.

## Imports

- As the root's.  The alias is `#spell-util` (barrel) / `#spell-util/*` (any file in `src/`, inside this package only).
- NOTE: `ResponseErrors.ts` is deliberately NOT in the barrel -- see the barrel's header.

## Decorators

As the root's, plus:

- `vitest.config.ts` uses `vite.decorators.ts` (repo root), so tests run lowered decorators.

## Types / Exports

As the root's.  No self-namespace:  import names straight from `#spell-util`.
