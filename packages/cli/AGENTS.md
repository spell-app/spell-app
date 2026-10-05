# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/cli`.

**Root conventions apply:  READ the repo root's `AGENTS.md` FIRST** -- its Documentation, Functions,
Types / Exports and Imports sections all apply here.  Only what DIFFERS is below.

## Overview

- This package is the `spell` command-line tool, and nothing else:  `bin/spell.mjs` runs `src/main.ts` through `tsx`
  (`src/devMain.ts` for `spell dev ...`:  see below).
  `README.md` has instructions, caveats and TODO.
- Spell itself is NOT here.  It's the spell-family packages beside this one -- `../lsp`, `../spell`, `../parser`,
  `../core`, `../util` -- as is `ui` (`../ui`, `@spell-app/ui`);  `package.json` depends on
  `spell` and `ui` as workspaces (`workspace:*`), and the aliases reach the rest.
  - Their SOURCE runs, with no build:  `$/lsp`, `$/spell`, `$/parser` ... are `../lsp/src/...`, `../spell/src/...`,
    `../parser/src/...`.
  - `$/cli` (`CLI`) is OUR `src/`;  so `src/foo.ts` is `$/cli/foo`.
  - That's set ONCE, in the repo root's `tsconfig.base.json` (one alias table for every package):  `tsc` and `tsx` read it through `tsconfig.json`, and
    `vitest` through `resolve.tsconfigPaths`.
  - `tsconfig.json` extends that table, since the other packages' files compile through it.  So `yarn ts` here
    reports their type errors too.
  - Something the command line needs OF spell or its tools is a change in THAT package, e.g.
    `SpellProject.compile(parentScope, { save })`.
- Projects load the language server's way (`SpellDiskWorkspace`), and questions about them go to its
  `SpellLanguageService` and `ScopeExplorer`, so the command line sees what an editor does.
- Ink (React for terminals) draws its screens, `src/ui/`.
  - `console.*` is SILENCED -- output goes to `process.stdout` / `stderr`.  See `src/consoleGuard.ts`.
  - An Ink screen MUST render with `patchConsole: false`, or Ink puts `console.*` back on screen.
  - Ink is pinned at 5:  6+ needs React 19.
- `src/runner/` holds CHILD processes:  `runProject.ts` for `spell run` / `spell test`, `speedTest.mts` for
  `spell speed`, `renderStatic.ts` for `spell static` (`ui`'s server render, through Vite).  They NEVER import
  `$/cli`'s values:  they need only spell (or `ui`).  `speedTest.mts` is copied into other checkouts (`--against`),
  so it imports nothing of ours at all.
- Each command is `src/commands/<name>Command.ts`:  `(session, args, options) => Promise<exitCode>`, wired up
  in `main.ts`.
- Two kinds of command:  the spell LANGUAGE's, bare (`spell compile`), and the repo's own tools, `spell dev <noun>
  <verb>` (`spell dev commands`):  each finds the nearest checkout with `CLI.findCheckout()`.
  - A new or renamed command:  first `packages/docs/content/dev/commands/commands.md` (root `AGENTS.md`, "Commands"):
    suggest where it belongs, then add it to the commands page's `commands.json` and run `spell dev commands check`.
  - `spell dev commands` reads the TEXT of `main.ts` and `devProgram.ts` for `program.command(...)` /
    `dev.command(...)`:  keep those receivers' names.
  - `spell dev` starts LEAN:  `bin/spell.mjs` runs `src/devMain.ts`, which loads commander and `devProgram.ts` (the
    `dev` tree), never the `$/cli` barrel, which loads spell (~0.5s).  A `dev` command that needs the barrel
    (`session`, `stock` ...) hands over to `main.ts`.
  - A pass-through (`plan-doc`, `goals`, `docs`, `details`, `server`, `window`, `vscode`) is `(args) =>
    Promise<exitCode>`, importing what it needs DIRECTLY (`$/cli/dev/passThrough`, `$/cli/cli.types`,
    `$/cli/findCheckout`):  importing `$/cli` there would load spell into every `spell dev` call.
    `TOOLS` in `src/dev/passThrough.ts` says how each tool runs:  a child `node`, under `tsx` when it needs aliases.

## Imports

- As the root's rules, with `CLI` ~== `$/cli` as our one namespace:  `import { CLI } from "$/cli"`.
- Import order puts the other packages' barrels (`$/spell`, `$/lsp`) before our own.
- `main.ts`, `devMain.ts` and `consoleGuard.ts` are NOT in the barrel:  importing any has side effects.  Nor is
  `devProgram.ts`:  both entries build on it, and it must load without the barrel.

## Tests

- `yarn test`.  Every module's tests sit beside it, `<module>.test.ts(x)`.
- They read spell's frozen projects, `../spell/projects/test/` (`@test/<Project>`) -- see "Overview" in
  `../spell/AGENTS.md`.  NEVER write into one:  compile with `--stdout`, or make a temp project, as
  `cli.test.ts` does.
- `cli.test.ts` runs the real `bin/spell.mjs`, as a separate process, with no terminal.
- Screens render through `ink-testing-library`, at a fixed `size`.
- `yarn review` ~== `yarn ts` + `yarn lint:fix` + `yarn format` + `yarn test`.
