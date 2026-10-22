# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this folder, `src/cli/` of the `spell-app` package (`spell-app/cli`).

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- This folder is spell-app's part of `spell`, the kit's command line (the kit's `src/cli/`).
  Two things:
  - spell-app's OWN commands:  `spell app create | serve | vscode [build|install]`, and `spell projects`
  - the WORK behind spell-lang's commands (`spell compile`, `lint`, `run`, `test` ...),
    through spell-app's `"language"` hook:
    they find projects the app's way, so their work is here until spell-lang can (epic `repo-split` P13)
  - [The kit's README-cli.md](../../../README-cli.md) has every command, its options and caveats, and what's coming.
- The program itself is NOT here any more:  arguments, help, finding commands, `spell dev` and its pass-throughs
  are the kit's, or gone (epic `repo-split` P13).
  - Spell UI's commands (`spell icon`, `ssr`, `pack`, `design`) are spell-ui's `src/cli/`.
  - The `epic` command is spell-epic's (its `bin/epic`), since epic `epic-eject` I5.
- How the kit finds this folder:  the root `package.json` names its two files.

  ```json
  "spell": { "commands": "./src/cli/commands.ts", "hooks": "./src/cli/hooks.ts" }
  ```

  - `commands.ts` beside `commands/`, the commands' work:  so the folder's barrel, `index.ts`, names that folder's
    barrel in full, `spell-app/cli/commands/index` (`./commands` would be the file).
  - [commands.ts](commands.ts):  spell-app's commands, their names, arguments, flags and help.
    - Under `app` ON PURPOSE (Owen's names, 2026-10-21), not only on a clash.
    - The kit's `spell commands` check reads its TEXT:  keep each name a literal at its `.command("...")` call,
      and each group (`app`, `vscode`) a `const`.
  - [hooks.ts](hooks.ts):  the `"language"` hook, and `loadApp()`, which both files load the work through.
  - Both MUST load fast:  `spell help` loads every repo's list.
    So they import nothing of spell up front:  `loadApp()` imports it when a command runs.
- `loadApp()` loads [consoleGuard.ts](consoleGuard.ts) FIRST, then the parser's version
  (`__PACKAGE_VERSION__`), then [languageCommands.ts](languageCommands.ts):  spell logs as its modules load.
  - `languageCommands`:  spell-lang's `LanguageCommands` (its `spell-lang/cli` types), each on a new `CliSession`.
  - `appCommands`:  `create`, `serve`, `projects`, the same way.
  - `spell app vscode` loads no spell:  [vscodeCommand.ts](commands/vscodeCommand.ts), imported directly.
- Spell itself is NOT here.
  - It's the folders beside this one (lsp, spaces) and the packages below (`spell-lang`'s spell, parser and core;
    the kit's util).
  - spell-app's root `package.json` depends on `spell-lang`, `spell-ui` and `spell-kit` as workspaces
    (`workspace:*`).
  - Their SOURCE runs, with no build:
    `spell` runs every repo's source through `tsx`, each import by its package name.
  - `spell-app/cli` is THIS folder (namespace `CLI`):  a file `foo.ts` in it is `spell-app/cli/foo`
    (the package's `exports`, the root's `AGENTS.md`).
  - Something the command line needs OF spell or its tools is a change in THAT package,
    e.g. `SpellProject.compile(parentScope, { save })`.
- Projects load the language server's way (`SpellDiskWorkspace`), from spaces' folders on disk.
  - Where they are, and the build folder:
    spaces' `environment` and `project-utils`, in `spell-app/spaces/server/node/...`.
  - Those also register spell's project groups.
  - Questions about them go to its `SpellLanguageService` and `ScopeExplorer`,
    so the command line sees what an editor does.
- Ink (React for terminals) draws its screens, in [ui/](ui/).
  - `console.*` is SILENCED:  output goes to `process.stdout` / stderr ([consoleGuard.ts](consoleGuard.ts)).
  - An Ink screen MUST render with `patchConsole: false`, or Ink puts `console.*` back on screen.
  - Ink is pinned at 5:  6+ needs React 19.
  - `tsx` runs every repo's commands under the KIT's `tsconfig.node.json`, which has `jsx: react-jsx` for them;
    this repo's [tsconfig.node.json](../../tsconfig.node.json) checks them the same way.
- [runner/](runner/) holds CHILD processes:
  - [runProject.ts](runner/runProject.ts):  `spell run` / `spell test`
  - [speedTest.mts](runner/speedTest.mts):  `spell speedtest`
  - They NEVER import `spell-app/cli`'s values:  they need only spell.
  - `speedTest.mts` is copied into other checkouts (`--against`), so it imports nothing of ours at all.
- Each command's work is a file in [commands/](commands/), `<name>Command.ts`:
  `(session, args, options) => Promise<exitCode>`.
  - `lintCommand` was `checkCommand`, `speedtestCommand` `speedCommand`, until P13.
  - A mistake throws `CLI.CliError`:  the kit's class, re-exported by [cli.types.ts](cli.types.ts),
    so the kit's `runCommand()` prints just its message.
- A new or renamed command:
  FIRST [the commands guide](../../../spell.epics/guides/dev/commands/commands.md) (root `AGENTS.md`, "Commands").
  - Suggest where it belongs:
    - a language command is in spell-lang's list ([its commands.ts](../../../spell-lang/src/cli/commands.ts)),
      with its work here behind the hook while it needs the app
    - an app command is in [commands.ts](commands.ts)
  - Then add it to the commands page's `commands.json5`, and run `spell commands check`.

## Imports

- As WWOD §4, with `CLI` ~== `spell-app/cli` as our one namespace:

  ```ts
  import { CLI } from "spell-app/cli"
  ```

- The kit's base by its npm name, `spell-kit/cli` (its namespace is `CLI` too).
- The language commands' types:  `spell-lang/cli`.
- Our [cli.types.ts](cli.types.ts) re-exports what we use of both,
  so the rest of the folder says `CLI.CliError`, `CLI.CompileOptions`.
- NOT in the barrel (WWOD §8 › "Barrels"):
  - [consoleGuard.ts](consoleGuard.ts):  importing it silences `console.*`
  - [languageCommands.ts](languageCommands.ts):  `loadApp()` loads it after `consoleGuard`
  - [commands.ts](commands.ts) and [hooks.ts](hooks.ts):  the kit loads them by path

## Tests

As WWOD §20, plus:

- They live in the repo's [tests/cli/](../../tests/cli/), at the same paths as the code.
  - E.g. the core contract's test is [contract.test.ts](../../tests/cli/contract.test.ts).
  - The core contract's pinned outputs too:  one `<Project>.out.txt` each, in that folder's `__snapshots__/contract/`.
- They read spell's frozen test projects, spell-lang's `tests/spaces/@spell/test/` (`@test/<Project>`).
  See "Projects live in spaces" in [spell's AGENTS.md](../../../spell-lang/src/spell/AGENTS.md).
  - NEVER write into one, nor into its build folder (`build/spaces/@spell/test/...`).
    Compile with `--stdout`, or make a temp project, as `cli.test.ts` does.
- [cli.test.ts](../../tests/cli/cli.test.ts) runs the real `spell`:
  the KIT's [spell.mjs](../../../bin/spell.mjs), found by package (`spell-kit`),
  as separate processes, with no terminal.
  - Every installed repo's command list loads, so it runs spell-lang's commands through our hook, end to end.
  - It checks the old spellings are gone:  `spell dev`, `spell epic`, `check`, `new`, `serve`, `explore` ...
- The kit's own commands' tests are the kit's (its `tests/cli/`);  Spell UI's are spell-ui's.
- The epic command's own tests are spell-epic's:
  - [EpicProgram.test.ts](../../../spell-epic/tests/cli/EpicProgram.test.ts)
  - [tests/command/](../../../spell-epic/tests/command/)
- Screens render through `ink-testing-library`, at a fixed `size`.
