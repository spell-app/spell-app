# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/lsp`.

**READ the repo root's `AGENTS.md` and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
- the root's:  the repo's layout
- WWOD:  the house style every package shares
- Only what's local is below.
  A section named like a WWOD rule extends it.

## Overview

- Spell's language server, `$/lsp` (`LSP`):
  - `SpellLanguageService`:  diagnostics, hover, completion, definition, references, rename, outline, folding, formatting
  - `SpellLanguageServer`:  wires it to an LSP connection
  - `ScopeExplorer`
  - `ScopesSource` / `ScopePack`:  the scope packs, `<Project>.scopes.js`
  - `SpellDiskWorkspace`:  loads from disk
  - See "Language server" in [PARSING.md](../spell/PARSING.md).
- The VS Code extension that runs it is `../vscode`, its own yarn project.
  - It runs THIS package's source.
- The commands:

  ```sh
  yarn start:lsp                              # runs the server over stdio
  yarn scopes [--compile] <projectId...>      # writes scope packs
  yarn scopes --compile @examples/Solitaire   # e.g.
  ```

- `$/lsp` MUST stay BROWSER-SAFE (WWOD §8 › "Barrels").
  - Why:  the app's Monaco editor ([the app's Monaco plumbing](../app/src/ui/monaco/))
    calls the SAME `LSP.SpellLanguageService`, in-process.
  - The node-only files the barrel leaves out (see the barrel's header):
    `SpellDiskWorkspace.ts`, `server.ts`, `stdioGuard.ts`.
- It depends on `$/spell` (and below).
  - NEVER import `$/app` or `$/cli`.

## Imports

- As WWOD §4.
- `barrel.test.ts` is the smoke test for circular imports through the barrel.

## Decorators

As WWOD §12, plus:

- `vitest.config.ts` uses `vite.decorators.ts` (repo root).
- The server runs under `tsx`, which is esbuild already.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `LSP` ~== `$/lsp`
