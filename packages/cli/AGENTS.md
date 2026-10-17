# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/cli`.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- This package is the `spell` command-line tool, and its second command, `epic`, and nothing else.
  - [spell.mjs](bin/spell.mjs), in `bin/`, runs [main.ts](src/main.ts) through `tsx`.
  - For `spell dev ...` it runs [devMain.ts](src/devMain.ts) instead (see below).
  - [epic.mjs](bin/epic.mjs) runs [epicMain.ts](src/epicMain.ts):  the epic tools (see below).
  - `yarn cli:install` links both onto your PATH:  the package's `bin`.
  - [The README](README.md) has instructions, caveats and TODO.
- Spell itself is NOT here.
  - It's the spell-family packages beside this one:  lsp, spaces, spell, parser, core, util.
  - As is ui, `@spell-app/ui`.
  - `package.json` depends on spell, spaces and ui as workspaces (`workspace:*`), and the aliases reach the rest.
  - Their SOURCE runs, with no build:
    each alias (`$/lsp`, `$/spell`, `$/parser` ...) is its package's src folder, e.g. spell's.
  - `$/cli` is OUR src folder (namespace `CLI`).
    So a file `foo.ts` in it is `$/cli/foo`.
  - That's set ONCE, in the repo root's [tsconfig.base.json](../../tsconfig.base.json):
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
    E.g.:

    ```sh
    epic close seo#J3
    epic update seo#P3 --goal ...
    epic ask new pick-layout
    ```

    - The command itself is the epic code's, not this package's (epic `epic-eject` P5):
      `EpicProgram`, in [the epics package's command folder](../epics/src/command/), with a class per verb group.
      - This package keeps only its entry, [epicMain.ts](src/epicMain.ts), run by [epic.mjs](bin/epic.mjs).
      - `epic --help` lists it, under headings;  `epic --version` says which checkout's code runs.
      - Why there:  P6 lifts the epic code into a repo of its own, the command with it.
    - It starts LEAN:
      - no verb loads the `$/cli` barrel or spell
      - the `epic` tool loads only when a page verb runs
      - [epicProgram.test.ts](../../tests/cli/src/epicProgram.test.ts) checks it, import by import
    - ONE copy of the code:  every verb runs the code of the `epic` that was called,
      on the caller's checkout's data.
      - The `epic` on the `PATH` is the main checkout's.
    - The verb groups:

      ```
      send requests file home merge          Requests
      worktree session park stock shared     Worktrees  Sessions  Parking  Stock  Shared
      window server                          scripts passed through (EpicTools)
      ask choices comments notes agents airplane   the docs tools passed through (EpicTools)
      ```

    - An epic page's verbs run the `epic` tool in this process (`EpicTools.runPlanDoc()`).
      - First `planDocArgs()` turns the address into the tool's own arguments:
        `seo#J3` becomes `close seo J3`.
      - The tool's own order, typed to `epic` (`epic close seo J3`), is REFUSED:
        - the message spells it the right way
        - run silently, it taught agents the old shape (epic `epic-workflow` P19)
    - Every verb's help:  its usage, what it does, an example (`epic close --help`).
      - A group's verbs (`epic ask new --help`) take theirs from their lines in `GROUP_VERBS`:
        a verb not listed there is refused before the tool runs.
      - Exit codes:  0;  1 a failure, or an unknown verb (listing the verbs);  2 a usage error.
    - The old spellings still run the same code, until no caller is left:
      - `spell dev plan-doc <verb> <name> <id> ...`:  the tool's own order, no `#`;  older checkouts and scripts call it
      - `spell dev details`, `choices`, `comments`, `notes`, `agents`, `airplane`
      - `spell dev window`, `worktree`, `park`, `session`, `stock`, `shared` (since P5)
      - all hidden from `spell dev --help`, in [devProgram.ts](src/devProgram.ts)
      - `spell epic <verb>`, which [spell.mjs](bin/spell.mjs) sends to [epicMain.ts](src/epicMain.ts)
  - A new or renamed command:
    FIRST [the commands guide](../../guides/dev/commands/commands.md) (root `AGENTS.md`, "Commands").
    - Suggest where it belongs.
    - Then add it to the commands page's `commands.json5`, and run `spell dev commands check`.
  - `spell dev commands` reads the TEXT of the command trees, for each `<receiver>.command(...)` call.
    - The files:  [main.ts](src/main.ts), [devProgram.ts](src/devProgram.ts), and the epic code's
      [EpicProgram.ts](../epics/src/command/EpicProgram.ts).
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
      docs  design  server  vscode
      ```

    - It imports what it needs DIRECTLY, never the barrel:

      ```ts
      $/cli/dev/passThrough    $/cli/cli.types    $/cli/findCheckout
      ```

    - Importing `$/cli` there would load spell into every `spell dev` call.
    - `TOOLS`, in [passThrough.ts](src/dev/passThrough.ts), says how each tool runs:
      a child node process, under `tsx` when it needs aliases.
  - The `epic` tool is lean, but no pass-through:  it runs IN this process (epic `epic-components`).
    - It runs `epic`'s page verbs, and `spell dev plan-doc`.
    - The code:  `EpicTools.planDoc()`, in the epic code,
      which loads `$/epics/tool/PlanDocCommands` on first use.
  - `pack` is lean too, though it's ours, not a pass-through:  `(args, options) => Promise<exitCode>`.
    - That's [packCommand.ts](src/commands/packCommand.ts),
      on [packNew.ts](src/dev/packNew.ts) / [packBuild.ts](src/dev/packBuild.ts), which import no barrel.
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
  - The three entry points and the console guard:  importing any has side effects.
    - [main.ts](src/main.ts), [devMain.ts](src/devMain.ts), [epicMain.ts](src/epicMain.ts),
      [consoleGuard.ts](src/consoleGuard.ts)
  - Nor `devProgram.ts`:  the lean entry builds on it, and it must load without the barrel.

## Tests

As WWOD §20, plus:

- They live in the repo's [tests/cli/](../../tests/cli/), at the same paths as the code.
  - E.g. the core contract's test is [contract.test.ts](../../tests/cli/src/contract.test.ts), in its `src/`.
  - The core contract's pinned outputs too:  one `<Project>.out.txt` each, in that folder's `__snapshots__/contract/`.
- They read spell's frozen test projects, [tests/spaces/@spell/test/](../../tests/spaces/@spell/test/)
  (`@test/<Project>`).
  See "Projects live in spaces" in [spell's AGENTS.md](../spell/AGENTS.md).
  - NEVER write into one, nor into its build folder (`build/spaces/@spell/test/...`).
    Compile with `--stdout`, or make a temp project, as `cli.test.ts` does.
- [cli.test.ts](../../tests/cli/src/cli.test.ts) runs the real bin scripts (`spell.mjs`, `epic.mjs`),
  as separate processes, with no terminal.
- [epicProgram.test.ts](../../tests/cli/src/epicProgram.test.ts) proves the epic command starts lean:
  - nothing its entry ([epicMain.ts](src/epicMain.ts)) imports up front reaches the barrel or spell
  - nor do the epic verbs' old spellings, in [devProgram.ts](src/devProgram.ts)
- The epic command's own tests are the epic code's:  [tests/epics/src/command/](../../tests/epics/src/command/).
- Screens render through `ink-testing-library`, at a fixed `size`.
