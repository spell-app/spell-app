# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/parser`.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- The generic rule-based parser, `$/parser` (`P`):
  - tokenizer, rules and `Parser`, `Match`
  - scopes, ASTs, incremental parsing
  - It knows NO language:  the spell language on it is `../spell` (`$/spell`).
- `PARSING.md`, the map of the parse pipeline, is still in `../spell`:  [PARSING.md](../spell/PARSING.md).
  - Read it BEFORE digging into parser internals.
  - A change to the parsing mechanism HERE updates it too
    ([spell's AGENTS.md](../spell/AGENTS.md), "How parsing works").
- Rulex (the rule-syntax language) is `$/parser/rulex`:
  an OPT-IN side-effect import, that registers itself on `Parser.rulexParser`.
  - The barrel NEVER pulls it in.
- `$/parser/test` ([src/test/](src/test/)) holds the helpers language packages use to test their rules:
  `unitTestModuleRules()` and others.
  - Each rule test checks the javascript and TypeScript writers, `{ input, js, ts }` (`P.RuleTest`).
  - Blessing writes each test's `js` and `ts` into its source.
    - It runs when `BLESS_RULE_TESTS=1` is set.
    - [`RuleTestSource`](src/test/RuleTestSource.ts) does it:  node-only, loaded only then.
  - Tests that need the SPELL grammar are not here:  they're in spell's `src/parserTests/`.
- Depends only on `$/util` (and what that re-exports).
  NEVER import `$/spell`, or anything above it.
- `src/writers/` writes ASTs out as a target's code.
  The AST classes never write output themselves.
  - `P.Writer`:  one method per AST class, found by class name (so `keepNames`, below)
  - `P.ProgramWriter`:  what every PROGRAM's writer shares, whatever its language (epic `python-target` P4)
    - what the whole project says:  `forProject()`, a `P.WriterProject`
    - so, what each value is:  `kindOf()`
    - what may be nothing:  `mayBeNothing()`
    - where lists start counting:  `listsStartAt`
    - how it writes spell's names:  `naming`, a `P.Naming`
    - each language says its own file separator and import lines (`fileSeparator`, `importsHeader()`)
  - `P.JSWriter`:  javascript, on `P.ProgramWriter`
    - It's what `ASTNode.compile()` calls.
    - It writes javascript as a person would, with no build step (epic `output-targets`, P19, P22):
      - every name camelCase, stored properties too (`nameOf()`)
      - a `List`'s own methods
      - `===`, `for...of`, template text
      - tidy, as the TypeScript writer:  `const`, double quotes, no extra parentheses or braces
    - It reads the whole project first, to know what each value is:
      `P.WriterProject`, through `forProject()`.
  - `P.TSWriter`:  TypeScript on Solid, for `<Project>.compiled.tsx`
    - It extends `P.JSWriter`, adding only what's TypeScript's own:
      - real JSX, decorators, the types spell knows
      - `!` where `?.` can't go
      - each drawable type's element class (epic `drawable-thing` P10).
        - e.g. `class CardElement extends SpellElement<Card>`, its base imported from `@spell/elements`
        - Written by `elementClassFor()`.
  - `P.LibraryWriter`:  a project's classes alone, as a TypeScript LIBRARY other code imports (epic `people-and-orgs`)
    - The `ts/lib` target:  `P.TSWriter`, minus the program's top-level steps, its core `@spell-app/core/model`.
    - One file, `<Project>.lib.ts`, its own types:  no `.d.ts` beside it.
    - `P.isDeclaration()` says what's kept:  classes, what's added to them, comments.
      Python's page writer keeps the same.
  - Python's writers are `$/py`'s ([py's AGENTS.md](../py/AGENTS.md)), built on these:
    - `PY.PyWriter`, on `P.ProgramWriter`
    - `PY.ElementsWriter`, on `P.JSWriter`
  - [jsShapes.ts](src/writers/jsShapes.ts):  the pure helpers every program writer shares, `P.jsShapes`
  - `P.jsText`:  javascript's and TypeScript's punctuation
- No UI framework, no JSX, no DOM.
  - Node tools run the parser's SOURCE through `tsx` / esbuild / Vite's oxc,
    none of which compile Solid's JSX.
  - ASTs only write TEXT (`compile()`), JSX included.
    - The app shows compiled JavaScript in Monaco.
    - Solid's compiler builds the TypeScript target's JSX later (`$/spell/node/buildTsx`).
- "Parser rules" (how to write a rule class + its `syntax` + `tests`) is in [spell's AGENTS.md](../spell/AGENTS.md).
  - The rules there are spell's, on this package's `Rule`.
  - See also the top docstring in [Rule.ts](src/rules/Rule.ts).
- `keepNames`:  every prod build MUST keep its class names (`output.keepNames`),
  because a rule's name is worked out from its class name.
  - e.g. `ListAddRelative` => `list_add_relative`
  - `P.Rule.ruleNameFor()` works it out.
  - The builds:
    app's [vite.config.ts](../app/vite.config.ts) and [vite.editor.config.ts](../app/vite.editor.config.ts).
  - Pinned by app's [build.test.ts](../app/src/build.test.ts).

## Imports

- As WWOD §4 (examples there are ours).  `import { P } from "$/parser"`.
- [barrel.test.ts](../../tests/parser/src/barrel.test.ts) is the smoke test for circular imports through the barrel:
  run it after moving files.
  - The tests live in the repo's `tests/parser/`, at the same paths as the code.

## Decorators

As WWOD §12, plus:

- `vitest.config.ts` uses `vite.decorators.ts` (repo root).

## Types / Exports

As WWOD §8, plus our self-namespace:

- `P` ~== `$/parser`
