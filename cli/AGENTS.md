# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this folder, `cli/` of the `spell-app` package (`spell-app/cli`).

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- This folder is the `spell` command-line tool, and nothing else.
  - [spell.mjs](bin/spell.mjs), in `bin/`, runs [main.ts](src/main.ts) through `tsx`.
  - For `spell dev ...` (and `spell epic ...`) it runs [devMain.ts](src/devMain.ts) instead (see below).
  - `yarn cli:install` links it onto your PATH:  the `spell` bin of spell-app's root `package.json`, where the
    script is too (epic `repo-split` P11).
  - The `epic` command is spell-epic's (its `bin/epic`), since epic `epic-eject` I5.
  - [The kit's README-cli.md](../../README-cli.md) has every command, its options and caveats, and what's coming.
- Spell itself is NOT here.
  - It's the folders beside this one (lsp, spaces) and the packages below (`spell-lang`'s spell, parser and core;
    the kit's util).
  - As is ui, `spell-ui`.
  - spell-app's root `package.json` depends on `spell-lang`, `spell-ui` and `spell-kit` as workspaces
    (`workspace:*`), and the aliases reach the rest.
  - Their SOURCE runs, with no build:
    each alias (`$/lsp`, `$/spell`, `$/parser` ...) is its package's src folder, e.g. spell's.
  - `$/cli` is OUR src folder (namespace `CLI`).
    So a file `foo.ts` in it is `$/cli/foo`.
  - That's set ONCE, in the repo root's [tsconfig.base.json](../tsconfig.base.json):
    one alias table for every package.
    - The TypeScript compiler and `tsx` read it through `tsconfig.json`.
    - `vitest` reads it through `resolve.tsconfigPaths`.
  - `tsconfig.json` extends that table, since the other packages' files compile through it.
    So `yarn ts` here reports their type errors too.
  - Something the command line needs OF spell or its tools is a change in THAT package,
    e.g. `SpellProject.compile(parentScope, { save })`.
- Projects load the language server's way (`SpellDiskWorkspace`), from spaces' folders on disk.
  - Where they are, and the build folder:  spaces' `environment` and `project-utils`.
    - in `$/spaces/server/node/...`
    - they also register spell's project groups
  - Questions about them go to its `SpellLanguageService` and `ScopeExplorer`,
    so the command line sees what an editor does.
- Ink (React for terminals) draws its screens, in `src/ui/`.
  - `console.*` is SILENCED:  output goes to `process.stdout` / stderr.
    See [consoleGuard.ts](src/consoleGuard.ts).
  - An Ink screen MUST render with `patchConsole: false`, or Ink puts `console.*` back on screen.
  - Ink is pinned at 5:  6+ needs React 19.
- `src/runner/` holds CHILD processes:
  - [runProject.ts](src/runner/runProject.ts):  `spell run` / `spell test`
  - [speedTest.mts](src/runner/speedTest.mts):  `spell speed`
  - [renderStatic.ts](src/runner/renderStatic.ts):  `spell static` (ui's server render, through Vite)
  - They NEVER import `$/cli`'s values:  they need only spell (or `ui`).
  - `speedTest.mts` is copied into other checkouts (`--against`), so it imports nothing of ours at all.
- Each command is a file in [commands/](src/commands/), `<name>Command.ts`, wired up in [main.ts](src/main.ts).
  - Its shape:  `(session, args, options) => Promise<exitCode>`.
- Three kinds of command:
  - the spell LANGUAGE's, bare:  `spell compile`
  - the repo's own tools, `spell dev <noun> <verb>`:  `spell dev commands`.
    Each finds the nearest checkout with `CLI.findCheckout()`.
  - `epic <verb> <epic>#<id> ...`:  the epic tools, a command of their own (epic `epic-workflow` P9).
    - NOT this folder's:  spell-epic's, its own repo, with its own tests (epic `epic-eject` P5, I5;
      the root `AGENTS.md`, "spell-epic").  `epic --help` lists its verbs.
    - Its old spellings here hand their arguments on to it, verbatim, until no caller is left
      (`runEpic()`, in [passThrough.ts](src/dev/passThrough.ts)):
      - `spell dev plan-doc <verb> <name> <id> ...`:  the tool's own order, no `#` (`epic plan-doc`, hidden);
        older checkouts and scripts call it
      - `spell dev details` (`epic ask`), `choices`, `comments`, `notes`, `agents`, `airplane`
      - `spell dev window`, `worktree`, `park`, `session`, `stock`, `shared` (since P5)
      - `spell dev docs <verb>` (`epic pages <verb>`), still listed in `spell dev --help`:  the skills call it
      - the rest hidden from `spell dev --help`, in [devProgram.ts](src/devProgram.ts)
      - `spell epic <verb>`:  [spell.mjs](bin/spell.mjs) sends it to [devMain.ts](src/devMain.ts), so it starts lean
    - Which `epic`:  the nearest checkout's `spell-epic` link's `bin/epic` (`epicBin()`), else the one on the `PATH`.
    - NEVER import the engine (`$/epics/...`):  a checkout without spell-epic (CI) must still compile,
      and one copy of `$/server` must run.
      [devMain.test.ts](../tests/cli/src/devMain.test.ts) checks it, import by import.
  - A new or renamed command:
    FIRST [the commands guide](../../spell.epics/guides/dev/commands/commands.md) (root `AGENTS.md`, "Commands").
    - Suggest where it belongs.
    - Then add it to the commands page's `commands.json5`, and run `spell dev commands check`.
  - `spell dev commands` reads the TEXT of the command trees, for each `<receiver>.command(...)` call.
    - The files:  [main.ts](src/main.ts), [devProgram.ts](src/devProgram.ts), and spell-epic's
      [EpicProgram.ts](../../spell-epic/src/command/EpicProgram.ts), through the checkout's `spell-epic` link.
    - The skills:  this repo's `.claude/skills/`, and the plugin's, `spell-epic/skills/`.
    - The calls:

      ```ts
      program.command(...)    dev.command(...)    epic.command(...)
      ```

    - So keep those receivers' names, and each verb's name a literal at its call.
  - `spell dev` starts LEAN:  the bin script runs [devMain.ts](src/devMain.ts).
    - That loads commander and [devProgram.ts](src/devProgram.ts) (the `dev` tree),
      never the `$/cli` barrel, which loads spell (~0.5s).
    - A dev command that needs the barrel (`commands`, `wwod`) hands over to [main.ts](src/main.ts).
  - A pass-through is `(args) => Promise<exitCode>`.
    - The pass-throughs:

      ```
      design  server  vscode
      ```

    - It imports what it needs DIRECTLY, never the barrel:

      ```ts
      $/cli/dev/passThrough    $/cli/cli.types    $/cli/findCheckout
      ```

    - Importing `$/cli` there would load spell into every `spell dev` call.
    - `TOOLS`, in [passThrough.ts](src/dev/passThrough.ts), says how each tool runs:
      a child node process, under `tsx` when it needs aliases.
      - `design bundle` and `check`:  spell-brand's `design:bundle` / `design:check` (epic `repo-split` P10).
      - `design`'s sync verbs:  the engine's `src/tools/design.js`, through the `spell-epic` link.
  - `pack` is lean too, though it's ours, not a pass-through:  `(args, options) => Promise<exitCode>`.
    - That's [packCommand.ts](src/commands/packCommand.ts),
      on [packNew.ts](src/dev/packNew.ts) / [packBuild.ts](src/dev/packBuild.ts), which import no barrel.
    - `build` and `check` are the kit's pack tooling (`spell-kit/element/tools/ComponentPack`;  Spell UI's from epic
      `repo-split` P5 to P10), which spell-epic and the brand run without this CLI (`spell-pack`).
      [packBuild.ts](src/dev/packBuild.ts) only finds the pack by name in the checkout, and turns its errors into ours.
- [templates/](templates/):  files commands write from, `*.template` with `__token__`s.
  - [pack/](templates/pack/):  for `spell dev pack new` / `element`.
  - Change a template, and every pack made after gets it;  existing packs keep their files.
  - How they're filled, and how to add one:  [the templates README](templates/README.md).

## Imports

- As WWOD §4, with `CLI` ~== `$/cli` as our one namespace:

  ```ts
  import { CLI } from "$/cli"
  ```

- NOT in the barrel (WWOD §8 › "Barrels"):
  - The two entry points and the console guard:  importing any has side effects.
    - [main.ts](src/main.ts), [devMain.ts](src/devMain.ts), [consoleGuard.ts](src/consoleGuard.ts)
  - Nor `devProgram.ts`:  the lean entry builds on it, and it must load without the barrel.

## Tests

As WWOD §20, plus:

- They live in the repo's [tests/cli/](../tests/cli/), at the same paths as the code.
  - E.g. the core contract's test is [contract.test.ts](../tests/cli/src/contract.test.ts), in its `src/`.
  - The core contract's pinned outputs too:  one `<Project>.out.txt` each, in that folder's `__snapshots__/contract/`.
- They read spell's frozen test projects, [tests/spaces/@spell/test/](../tests/spaces/@spell/test/)
  (`@test/<Project>`).
  See "Projects live in spaces" in [spell's AGENTS.md](../../spell-lang/spell/AGENTS.md).
  - NEVER write into one, nor into its build folder (`build/spaces/@spell/test/...`).
    Compile with `--stdout`, or make a temp project, as `cli.test.ts` does.
- [cli.test.ts](../tests/cli/src/cli.test.ts) runs the real bin script (`spell.mjs`),
  as separate processes, with no terminal.
  - What it hands on to `epic`:  a fake `spell-epic/bin/epic` in a temp checkout, reporting what it got.
  - The tests that need the real engine (`spell dev plan-doc summary ...`) skip themselves without it (CI).
- [devMain.test.ts](../tests/cli/src/devMain.test.ts) proves `spell dev` starts lean:
  nothing [devMain.ts](src/devMain.ts) imports up front reaches the barrel, spell or the epic engine.
- The epic command's own tests are spell-epic's (`tests/command/`, `EpicProgram.test.ts`).
- Screens render through `ink-testing-library`, at a fixed `size`.
