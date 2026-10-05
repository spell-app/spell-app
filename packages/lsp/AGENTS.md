# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/lsp`.

**READ the repo root's `AGENTS.md` and WWOD (`agents/wwod/WWOD.md`) FIRST:**  the repo's layout, and the
house style every package shares.  Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- Spell's language server, `$/lsp` (`LSP`):  `SpellLanguageService` (diagnostics, hover, completion, definition,
  references, rename, outline, folding, formatting), `SpellLanguageServer` (wires it to an LSP connection), `ScopeExplorer`, and
  `ScopesSource` / `ScopePack` (the scope packs, `<Project>.scopes.js`).  `SpellDiskWorkspace` loads from disk.
  See "Language server" in `../spell/PARSING.md`.
- The VS Code extension that runs it is `../vscode` (its own yarn project).  It runs THIS package's source.
- `yarn start:lsp` runs the server over stdio.  `yarn scopes [--compile] <projectId...>` writes scope packs, e.g.
  `yarn scopes --compile @examples/Solitaire`.
- `$/lsp` MUST stay BROWSER-SAFE:  the app's Monaco editor (`../app/src/ui/monaco/`) calls the SAME
  `LSP.SpellLanguageService` in-process.  Node-only things (disk, `fs`, stdio) go in a file the barrel does NOT
  export:  `SpellDiskWorkspace.ts`, `server.ts`, `stdioGuard.ts` (see the barrel's header).
- Depends on `$/spell` (and below).  NEVER import `$/app` or `$/cli`.

## Imports

- As WWOD §4, with `LSP` ~== `$/lsp` as our one namespace.
- `barrel.test.ts` is the smoke test for circular imports through the barrel.

## Decorators

As WWOD §12, plus:

- `vitest.config.ts` uses `vite.decorators.ts` (repo root);  the server runs under `tsx`, which is esbuild already.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `LSP` ~== `$/lsp`
