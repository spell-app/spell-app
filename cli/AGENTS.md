# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this folder, `cli/` of the `spell-app` package (`spell-app/cli`).

**READ the repo root's [AGENTS.md](../AGENTS.md) and [WWOD](../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- This folder is spell-app's part of `spell`, the kit's command line (the kit's `cli/`).
  Two things:
  - spell-app's OWN commands:  `spell app create | serve | vscode [build|install]`, and `spell projects`
  - the WORK behind spell-lang's commands (`spell compile`, `lint`, `run`, `test` ...), through spell-app's
    `"language"` hook:  they find projects the app's way, so their work is here until spell-lang can
    (epic `repo-split` P13)
  - [The kit's README-cli.md](../../README-cli.md) has every command, its options and caveats, and what's coming.
- The program itself is NOT here any more:  arguments, help, finding commands, `spell dev` and its pass-throughs
  are the kit's, or gone (epic `repo-split` P13).
  - Spell UI's commands (`spell icon`, `ssr`, `pack`, `design`) are spell-ui's `cli/`.
  - The `epic` command is spell-epic's (its `bin/epic`), since epic `epic-eject` I5.
- How the kit finds this folder:  `package.json`'s
  `"spell": { "commands": "./cli/commands.ts", "hooks": "./cli/hooks.ts" }`.
  - [commands.ts](commands.ts):  spell-app's commands, their names, arguments, flags and help.
    - Under `app` ON PURPOSE (Owen's names, 2026-10-21), not only on a clash.
    - The kit's `spell commands` check reads its TEXT:  keep each name a literal at its `.command("...")` call,
      and each group (`app`, `vscode`) a `const`.
  - [hooks.ts](hooks.ts):  the `"language"` hook, and `loadApp()`, which both files load the work through.
  - Both MUST load fast:  `spell help` loads every repo's list.
    So they import nothing of spell up front:  `loadApp()` imports it when a command runs.
- `loadApp()` loads [consoleGuard.ts](src/consoleGuard.ts) FIRST, then the parser's version
  (`__PACKAGE_VERSION__`), then [languageCommands.ts](src/languageCommands.ts):  spell logs as its modules load.
  - `languageCommands`:  spell-lang's `LanguageCommands` (its `spell-lang/cli` types), each on a new `CliSession`.
  - `appCommands`:  `create`, `serve`, `projects`, the same way.
  - `spell app vscode` loads no spell:  [vscodeCommand.ts](src/commands/vscodeCommand.ts), imported directly.
- Spell itself is NOT here.
  - It's the folders beside this one (lsp, spaces) and the packages below (`spell-lang`'s spell, parser and core;
    the kit's util).
  - spell-app's root `package.json` depends on `spell-lang`, `spell-ui` and `spell-kit` as workspaces
    (`workspace:*`).
  - Their SOURCE runs, with no build:  `spell` runs every repo's source through `tsx`, each file's `$/` imports by
    its own repo's alias table (the kit's run-time alias hook).
  - `$/cli` is OUR src folder (namespace `CLI`), from this repo's [tsconfig.base.json](../tsconfig.base.json).
    So a file `foo.ts` in it is `$/cli/foo`.
  - Something the command line needs OF spell or its tools is a change in THAT package,
    e.g. `SpellProject.compile(parentScope, { save })`.
- Projects load the language server's way (`SpellDiskWorkspace`), from spaces' folders on disk.
  - Where they are, and the build folder:  spaces' `environment` and `project-utils`,
    in `$/spaces/server/node/...`;  they also register spell's project groups.
  - Questions about them go to its `SpellLanguageService` and `ScopeExplorer`,
    so the command line sees what an editor does.
- Ink (React for terminals) draws its screens, in `src/ui/`.
  - `console.*` is SILENCED:  output goes to `process.stdout` / stderr ([consoleGuard.ts](src/consoleGuard.ts)).
  - An Ink screen MUST render with `patchConsole: false`, or Ink puts `console.*` back on screen.
  - Ink is pinned at 5:  6+ needs React 19.
  - `tsx` runs every repo's commands under the KIT's `cli/tsconfig.json`, which has `jsx: react-jsx` for them.
- `src/runner/` holds CHILD processes:
  - [runProject.ts](src/runner/runProject.ts):  `spell run` / `spell test`
  - [speedTest.mts](src/runner/speedTest.mts):  `spell speedtest`
  - They NEVER import `$/cli`'s values:  they need only spell.
  - `speedTest.mts` is copied into other checkouts (`--against`), so it imports nothing of ours at all.
- Each command's work is a file in [commands/](src/commands/), `<name>Command.ts`:
  `(session, args, options) => Promise<exitCode>`.
  - `lintCommand` was `checkCommand`, `speedtestCommand` `speedCommand`, until P13.
  - A mistake throws `CLI.CliError`:  the kit's class, re-exported by [cli.types.ts](src/cli.types.ts),
    so the kit's `runCommand()` prints just its message.
- A new or renamed command:
  FIRST [the commands guide](../../spell.epics/guides/dev/commands/commands.md) (root `AGENTS.md`, "Commands").
  - Suggest where it belongs:  a language command is spell-lang's list (its `cli/commands.ts`), with its work here
    behind the hook while it needs the app;  an app command is [commands.ts](commands.ts)'s.
  - Then add it to the commands page's `commands.json5`, and run `spell commands check`.

## Imports

- As WWOD §4, with `CLI` ~== `$/cli` as our one namespace:

  ```ts
  import { CLI } from "$/cli"
  ```

- The kit's base by its npm name, `spell-kit/cli` (its namespace is `CLI` too);  the language commands' types,
  `spell-lang/cli`.  Our [cli.types.ts](src/cli.types.ts) re-exports what we use of both, so the rest of the
  folder says `CLI.CliError`, `CLI.CompileOptions`.
- NOT in the barrel (WWOD §8 › "Barrels"):
  - [consoleGuard.ts](src/consoleGuard.ts):  importing it silences `console.*`
  - [languageCommands.ts](src/languageCommands.ts):  `loadApp()` loads it after `consoleGuard`
  - [commands.ts](commands.ts) and [hooks.ts](hooks.ts), outside `src/`:  the kit loads them by path

## Tests

As WWOD §20, plus:

- They live in the repo's [tests/cli/](../tests/cli/), at the same paths as the code.
  - E.g. the core contract's test is [contract.test.ts](../tests/cli/src/contract.test.ts), in its `src/`.
  - The core contract's pinned outputs too:  one `<Project>.out.txt` each, in that folder's `__snapshots__/contract/`.
- They read spell's frozen test projects, spell-lang's `tests/spaces/@spell/test/` (`@test/<Project>`).
  See "Projects live in spaces" in [spell's AGENTS.md](../../spell-lang/spell/AGENTS.md).
  - NEVER write into one, nor into its build folder (`build/spaces/@spell/test/...`).
    Compile with `--stdout`, or make a temp project, as `cli.test.ts` does.
- [cli.test.ts](../tests/cli/src/cli.test.ts) runs the real `spell`:  the KIT's `cli/bin/spell.mjs`, found by
  package (`spell-kit`), as separate processes, with no terminal.
  - Every installed repo's command list loads, so it runs spell-lang's commands through our hook, end to end.
  - It checks the old spellings are gone:  `spell dev`, `spell epic`, `check`, `new`, `serve`, `explore` ...
- The kit's own commands' tests are the kit's (its `tests/cli/`);  Spell UI's are spell-ui's.
- The epic command's own tests are spell-epic's (`tests/command/`, `EpicProgram.test.ts`).
- Screens render through `ink-testing-library`, at a fixed `size`.
