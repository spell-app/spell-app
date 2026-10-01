# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/lsp`.

**Root conventions apply:  READ the repo root's `AGENTS.md` FIRST** -- its Documentation, Functions,
Types / Exports and Imports sections all apply here.  Only what DIFFERS is below.

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

- As the root's, with `LSP` ~== `$/lsp` as our one namespace.
- `barrel.test.ts` is the smoke test for circular imports through the barrel.

## Decorators

As the root's, plus:

- `vitest.config.ts` uses `vite.decorators.ts` (repo root);  the server runs under `tsx`, which is esbuild already.

## Types / Exports

As the root's, plus our self-namespace:

- `LSP` ~== `$/lsp`
