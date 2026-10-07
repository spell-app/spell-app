# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/assembler`.

**READ the repo root's `AGENTS.md` and WWOD (`agents/wwod/WWOD.md`) FIRST:**  the repo's layout, and the
house style every package shares.  Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- ASSEMBLING pages:  the steps between a page's content and its file on disk, for every tool that writes pages:
  `$/assembler` (`AS`).  Born in epic `epic-components` P7 (Owen, Q15 / I1):  the plan-doc tool moves into
  `packages/epics`, which may not import `docs`, so what both need to write a page lives here.
  - `Linker` -- a page's links:  `<code>path</code>` references become links, every link gets a named target (one
    per destination), and `check()` verifies them.  Was `packages/docs/tools/doc-links.js`, now its command line.
  - `format.ts` -- `formatHTML()`:  oxfmt on a page's text in memory, as `vp fmt` would format its file.  Was
    `packages/docs/tools/plan-parts.js`'s.
  - Next (Owen, 2026-10-07):  most of the page server's assembly code, so other assembly tools can be built on it
    (e.g. a redone goals package).  Grow it by capability:  one class per file, its types in `assembler.types.ts`.
- Node only (`node:fs`, `git`, oxfmt, linkedom), and it imports NO other package:  `docs`, `epics` and any other
  node-side package or tool may import it.  NEVER make it import `docs` or `epics`:  they import it.
- It knows the checkout's LAYOUT as folder names (`packages/*/src`, the shared areas `pages/`, `guides/`, `epics/`,
  `templates/`, `packages/docs/tools`), never as imports:  `Linker` takes the checkout's root.
- Commands:  `yarn review`, `yarn ts`, `yarn lint`, `yarn format`, `yarn test` (node).

## Imports

- As WWOD §4, plus ONE climb:  `format.ts` imports the repo root's `vite.lint.ts` (`fmtConfig`) as
  `../../../vite.lint.ts`, since no alias reaches the root (every `vite.config.ts` does the same).
- `docs`' tools are JavaScript:  `packages/docs/tools/doc-links.js` imports `$/assembler` statically, so it runs
  under `tsx` (`packages/docs/tools/pages.js` `docLinksRun()`), never plain `node`.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `AS` ~== `$/assembler`
