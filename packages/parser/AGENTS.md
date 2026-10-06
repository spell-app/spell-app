# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/parser`.

**READ the repo root's `AGENTS.md` and WWOD (`agents/wwod/WWOD.md`) FIRST:**  the repo's layout, and the
house style every package shares.  Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- The generic rule-based parser, `$/parser` (`P`):  tokenizer, rules and `Parser`, `Match`, scopes, ASTs,
  incremental parsing.  It knows NO language;  the spell language on it is `../spell` (`$/spell`).
- `PARSING.md` -- the map of the parse pipeline -- is still in `../spell`:  `../spell/PARSING.md`.  Read it BEFORE
  digging into parser internals;  a change to the parsing mechanism HERE updates it too (`../spell/AGENTS.md`, "How
  parsing works").
- Rulex (the rule-syntax language) is `$/parser/rulex`:  an OPT-IN side-effect import that registers itself on
  `Parser.rulexParser`.  The barrel NEVER pulls it in.
- `$/parser/test` (`src/test/`) holds the helpers language packages use to test their rules, e.g.
  `unitTestModuleRules()`.  Tests that need the SPELL grammar are not here:  they're `../spell/src/parserTests/`.
- Depends only on `$/util` (and what that re-exports).  NEVER import `$/spell` or anything above it.
- `src/writers/` writes ASTs out as a target's code:  `P.Writer` (one method per AST class, found by class
  name -- so `keepNames`, below), `P.JSWriter` (javascript;  what `ASTNode.compile()` calls), `P.jsText` (its
  punctuation).  The AST classes never write output themselves.
- No UI framework, no JSX, no DOM:  node tools run the parser's SOURCE through `tsx` / esbuild / Vite's oxc, none
  of which compile Solid's JSX.  ASTs only write text (`compile()`);  the app shows compiled JavaScript in Monaco.
- "Parser rules" (how to write a rule class + its `syntax` + `tests`) is in `../spell/AGENTS.md`:  the rules
  there are spell's, on this package's `Rule` -- see also the top docstring in `src/rules/Rule.ts`.
- `keepNames`:  every prod build MUST keep `output.keepNames` (`../app/vite.config.ts`,
  `../app/vite.editor.config.ts`), because a rule's class name IS its rule name.  Pinned by
  `../app/src/build.test.ts`.

## Imports

- As WWOD §4 (examples there are ours).  `import { P } from "$/parser"`.
- `barrel.test.ts` is the smoke test for circular imports through the barrel -- run it after moving files.

## Decorators

As WWOD §12, plus:

- `vitest.config.ts` uses `vite.decorators.ts` (repo root).

## Types / Exports

As WWOD §8, plus our self-namespace:

- `P` ~== `$/parser`
