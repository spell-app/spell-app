# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/cli`.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- This package is the `spell` command-line tool, and nothing else.
  - [spell.mjs](bin/spell.mjs), in `bin/`, runs [main.ts](src/main.ts) through `tsx`.
  - For `spell dev ...` it runs [devMain.ts](src/devMain.ts) instead (see below).
  - [The README](README.md) has instructions, caveats and TODO.
- Spell itself is NOT here.
  - It's the spell-family packages beside this one:  `../lsp`, `../spell`, `../parser`, `../core`, `../util`.
  - As is `ui` (`../ui`, `@spell-app/ui`).
  - `package.json` depends on `spell` and `ui` as workspaces (`workspace:*`), and the aliases reach the rest.
  - Their SOURCE runs, with no build:
    `$/lsp`, `$/spell`, `$/parser` ... are their `src/` folders (`../lsp/src/...`, `../spell/src/...`, `../parser/src/...`).
  - `$/cli` (`CLI`) is OUR `src/`;  so `src/foo.ts` is `$/cli/foo`.
  - That's set ONCE, in the repo root's [tsconfig.base.json](../../tsconfig.base.json):
    one alias table for every package.
    - `tsc` and `tsx` read it through `tsconfig.json`.
    - `vitest` reads it through `resolve.tsconfigPaths`.
  - `tsconfig.json` extends that table, since the other packages' files compile through it.
    So `yarn ts` here reports their type errors too.
  - Something the command line needs OF spell or its tools is a change in THAT package,
    e.g. `SpellProject.compile(parentScope, { save })`.
- Projects load the language server's way (`SpellDiskWorkspace`).
  - Questions about them go to its `SpellLanguageService` and `ScopeExplorer`,
    so the command line sees what an editor does.
- Ink (React for terminals) draws its screens, in `src/ui/`.
  - `console.*` is SILENCED:  output goes to `process.stdout` / `stderr`.
    See [consoleGuard.ts](src/consoleGuard.ts).
  - An Ink screen MUST render with `patchConsole: false`, or Ink puts `console.*` back on screen.
  - Ink is pinned at 5:  6+ needs React 19.
- `src/runner/` holds CHILD processes:
  - `runProject.ts`:  `spell run` / `spell test`
  - `speedTest.mts`:  `spell speed`
  - `renderStatic.ts`:  `spell static` (`ui`'s server render, through Vite)
  - They NEVER import `$/cli`'s values:  they need only spell (or `ui`).
  - `speedTest.mts` is copied into other checkouts (`--against`), so it imports nothing of ours at all.
- Each command is `src/commands/<name>Command.ts`, wired up in `main.ts`:
  `(session, args, options) => Promise<exitCode>`.
- Two kinds of command:
  - the spell LANGUAGE's, bare:  `spell compile`
  - the repo's own tools, `spell dev <noun> <verb>`:  `spell dev commands`.
    Each finds the nearest checkout with `CLI.findCheckout()`.
  - A new or renamed command:
    FIRST [the commands guide](../../guides/dev/commands/commands.md) (root `AGENTS.md`, "Commands").
    - Suggest where it belongs.
    - Then add it to the commands page's `commands.json`, and run `spell dev commands check`.
  - `spell dev commands` reads the TEXT of `main.ts` and `devProgram.ts`,
    for `program.command(...)` / `dev.command(...)`:  keep those receivers' names.
  - `spell dev` starts LEAN:  the bin script runs `devMain.ts`.
    - That loads commander and `devProgram.ts` (the `dev` tree), never the `$/cli` barrel,
      which loads spell (~0.5s).
    - A `dev` command that needs the barrel (`session`, `stock` ...) hands over to `main.ts`.
  - A pass-through is `(args) => Promise<exitCode>`:  `goals`, `docs`, `details`, `server`, `window`, `vscode`.
    - It imports what it needs DIRECTLY:  `$/cli/dev/passThrough`, `$/cli/cli.types`, `$/cli/findCheckout`.
    - Importing `$/cli` there would load spell into every `spell dev` call.
    - `TOOLS`, in [passThrough.ts](src/dev/passThrough.ts), says how each tool runs:
      a child `node`, under `tsx` when it needs aliases.
  - `plan-doc` is lean, but no pass-through:
    it runs the plan-doc tool IN this process (epic `epic-components`).
    - That's [planDocCommand.ts](src/commands/planDocCommand.ts),
      loading `$/epics/tool/PlanDocCommands` on first use.
  - `pack` is lean too, though it's ours, not a pass-through:  `(args, options) => Promise<exitCode>`.
    - That's [packCommand.ts](src/commands/packCommand.ts),
      on [packNew.ts](src/dev/packNew.ts) / [packBuild.ts](src/dev/packBuild.ts), which import no barrel.
- `templates/`:  files commands write from, `*.template` with `__token__`s.
  - `templates/pack/`:  for `spell dev pack new` / `element`.
  - Change a template, and every pack made after gets it;  existing packs keep their files.
  - How they're filled, and how to add one:  [the templates README](templates/README.md).

## Imports

- As WWOD §4, with `CLI` ~== `$/cli` as our one namespace:  `import { CLI } from "$/cli"`.
- NOT in the barrel (WWOD §8 › "Barrels"):
  - `main.ts`, `devMain.ts` and `consoleGuard.ts`:  importing any has side effects.
  - Nor `devProgram.ts`:  both entries build on it, and it must load without the barrel.

## Tests

As WWOD §20, plus:

- They read spell's frozen projects, `../spell/projects/test/` (`@test/<Project>`).
  See "Overview" in [spell's AGENTS.md](../spell/AGENTS.md).
  - NEVER write into one:  compile with `--stdout`, or make a temp project, as `cli.test.ts` does.
- `cli.test.ts` runs the real bin script (`spell.mjs`), as a separate process, with no terminal.
- Screens render through `ink-testing-library`, at a fixed `size`.
