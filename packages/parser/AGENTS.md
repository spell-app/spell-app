# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/parser`.

**Root conventions apply:  READ the repo root's `AGENTS.md` FIRST** -- its Documentation, Functions,
Types / Exports and Imports sections all apply here.  Only what DIFFERS is below.

## Overview

- The generic rule-based parser, `$/parser` (`P`):  tokenizer, rules and `Parser`, `Match`, scopes, ASTs,
  incremental parsing.  It knows NO language;  the spell language on it is `../spell` (`$/spell`).
- `PARSING.md` -- the map of the parse pipeline -- is still in `../spell`:  `../spell/PARSING.md`.  Read it BEFORE
  digging into parser internals, and MUST keep it up to date in the same change whenever the parsing mechanism
  changes -- generic `Parser`, scopes, or the `Block` / `BlockLine` machinery here.
- Rulex (the rule-syntax language) is `$/parser/rulex`:  an OPT-IN side-effect import that registers itself on
  `Parser.rulexParser`.  The barrel NEVER pulls it in.
- `$/parser/test` (`src/test/`) holds the helpers language packages use to test their rules, e.g.
  `unitTestModuleRules()`.  Tests that need the SPELL grammar are not here:  they're `../spell/src/parserTests/`.
- Depends only on `$/util` (and what that re-exports).  NEVER import `$/spell` or anything above it.
- No UI framework, no JSX:  ASTs draw themselves as `P.Markup`, plain data (`src/ast/renderAST.ts`), which the
  app's `ASTViewer` turns into DOM with `P.render.toDOM()`.  Why:  node tools run the parser's SOURCE through
  `tsx` / esbuild / Vite's oxc, none of which compile Solid's JSX.
- "Parser rules" (how to write a rule class + its `syntax` + `tests`) is in `../spell/AGENTS.md`:  the rules
  there are spell's, on this package's `Rule` -- see also the top docstring in `src/rules/Rule.ts`.
- Prod build MUST keep `output.keepNames` (`../app/vite.config.ts`), because a rule's class name IS its rule
  name.  Pinned by `../app/src/build.test.ts`.

## Imports

- As the root's, with `P` ~== `$/parser` as our one namespace:  `import { P } from "$/parser"`.
- `barrel.test.ts` is the smoke test for circular imports through the barrel -- run it after moving files.

## Decorators

As the root's, plus:

- `vitest.config.ts` uses `vite.decorators.ts` (repo root).

## Types / Exports

As the root's, plus our self-namespace:

- `P` ~== `$/parser`
