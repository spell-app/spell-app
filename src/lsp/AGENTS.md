# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this folder, `src/lsp/` of the `spell-app` package (`spell-app/lsp`).

**READ the repo root's `AGENTS.md` and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
- the root's:  the repo's layout
- WWOD:  the house style every package shares
- Only what's local is below.
  A section named like a WWOD rule extends it.

## Overview

- Spell's language server, `spell-app/lsp` (`LSP`):
  - `SpellLanguageService`:  diagnostics, hover, completion, definition, references, rename, outline, folding, formatting
  - `SpellLanguageServer`:  wires it to an LSP connection
  - `ScopeExplorer`
  - `ScopesSource` / `ScopePack`:  the scope packs, `<Project>.scopes.js`
  - `SpellDiskWorkspace`:  loads from disk, through spaces' disk reader (`installDiskFetch()`)
  - See "Language server" in [PARSING.md](../../../spell-lang/src/spell/PARSING.md).
- The VS Code extension that runs it is `../vscode`, its own yarn project.
  - It runs THIS folder's source.
- The commands, the repo root's scripts (each `cd lsp && ...`;  `start:lsp` and `scopes` before epic `repo-split` P11):

  ```sh
  yarn lsp:start                                     # runs the server over stdio
  yarn lsp:scopes [--compile] <projectId...>         # writes scope packs
  yarn lsp:scopes --compile @spell/examples/drawable-solitaire   # e.g.
  ```

- `spell-app/lsp` MUST stay BROWSER-SAFE (WWOD §8 › "Barrels").
  - Why:  the app's Monaco editor ([the app's Monaco plumbing](../app/ui/monaco/))
    calls the SAME `LSP.SpellLanguageService`, in-process.
  - The node-only files the barrel leaves out (see the barrel's header):
    `SpellDiskWorkspace.ts`, `server.ts`, `stdioGuard.ts`.
- It depends on `spell-lang/spell` (and below).
  - Its node-only files also import spaces' (`spell-app/spaces/server/node/...`):
    where projects are on disk, and spaces' disk reader, which registers spell's project groups.
  - NEVER import `spell-app/app` or `spell-app/cli`.

## Imports

- As WWOD §4.
- [barrel.test.ts](../../tests/lsp/barrel.test.ts) is the smoke test for circular imports through the barrel.
  - The tests live in the repo's `tests/lsp/`, at the same paths as the code.

## Decorators

As WWOD §12, plus:

- The root's `vitest.config.ts` uses the toolchain's decorator pre-pass (`spell-kit/toolchain/decorators`).
- The server runs under `tsx`, which is esbuild already.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `LSP` ~== `spell-app/lsp`
