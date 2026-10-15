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

    - Its tree:  [epicProgram.ts](src/epicProgram.ts);  `epic --help` lists it, under headings.
    - It starts LEAN, as `spell dev` does:
      [epicMain.ts](src/epicMain.ts) loads commander and `epicProgram.ts`, never the barrel.
    - An epic page's verbs run the plan-doc tool in this process (`planDocCommand()`).
      - First [epicArgs.ts](src/epic/epicArgs.ts) turns `seo#J3` into the tool's own arguments (`close seo J3`).
      - A thin translation, tested verb by verb.
    - The groups are pass-throughs, as below:

      ```
      ask  choices  comments  notes  agents  airplane
      ```

    - Five verbs need the barrel (session helpers), so they're handed over to `main.ts` as `spell epic <verb>`:

      ```
      send  requests  file  home  merge
      ```

      - That runs [epicCommand.ts](src/commands/epicCommand.ts), on [the epic folder](src/epic/).
    - The old spellings still run the same tools, until no caller is left:
      - `spell dev plan-doc <verb> <name> <id> ...` (and `spell dev details`, `choices` ...)
        - hidden from `spell dev --help`
      - `spell epic <verb>`, which [spell.mjs](bin/spell.mjs) sends to [epicMain.ts](src/epicMain.ts)
  - A new or renamed command:
    FIRST [the commands guide](../../guides/dev/commands/commands.md) (root `AGENTS.md`, "Commands").
    - Suggest where it belongs.
    - Then add it to the commands page's `commands.json`, and run `spell dev commands check`.
  - `spell dev commands` reads the TEXT of the command trees, for each `<receiver>.command(...)` call.
    - The files:  [main.ts](src/main.ts), [devProgram.ts](src/devProgram.ts), [epicProgram.ts](src/epicProgram.ts).
    - The calls:

      ```ts
      program.command(...)    dev.command(...)    epic.command(...)
      ```

    - So keep those receivers' names, and each verb's name a literal at its call.
  - `spell dev` starts LEAN:  the bin script runs [devMain.ts](src/devMain.ts).
    - That loads commander and [devProgram.ts](src/devProgram.ts) (the `dev` tree),
      never the `$/cli` barrel, which loads spell (~0.5s).
    - A dev command that needs the barrel (`session`, `stock` ...) hands over to [main.ts](src/main.ts).
  - A pass-through is `(args) => Promise<exitCode>`.
    - The pass-throughs:

      ```
      docs  details (epic ask)  server  window  vscode
      ```

    - It imports what it needs DIRECTLY, never the barrel:

      ```ts
      $/cli/dev/passThrough    $/cli/cli.types    $/cli/findCheckout
      ```

    - Importing `$/cli` there would load spell into every `spell dev` call.
    - `TOOLS`, in [passThrough.ts](src/dev/passThrough.ts), says how each tool runs:
      a child node process, under `tsx` when it needs aliases.
  - The plan-doc tool is lean, but no pass-through:  it runs IN this process (epic `epic-components`).
    - It's `epic`'s page verbs, and `spell dev plan-doc`.
    - That's [planDocCommand.ts](src/commands/planDocCommand.ts),
      loading `$/epics/tool/PlanDocCommands` on first use.
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
  - Nor `devProgram.ts` or `epicProgram.ts`:  the lean entries build on them, and they must load without the barrel.

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
- `epicProgram.test.ts` proves the epic command starts lean:
  nothing its entry, `epicMain.ts`, imports up front reaches the barrel or spell.
- Screens render through `ink-testing-library`, at a fixed `size`.
