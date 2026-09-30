# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this repository.

**Code conventions are the parser's:  READ `../spell/AGENTS.md` FIRST** -- its Documentation, Functions,
Types / Exports and Imports sections all apply here.  Only what DIFFERS is below.

## Overview

- This repo is the `spell` command-line tool, and nothing else:  `bin/spell.mjs` runs `src/main.ts` through `tsx`.
  `README.md` has instructions, caveats and TODO.
- Spell itself is NOT here.  It's the `spell` package beside this one (`../spell`), as is `ui`
  (`../ui`, `@spell/ui`) -- `package.json` depends on both as workspaces (`workspace:*`).
  - The parser's SOURCE runs, with no build:  `~/lsp`, `~/languages/spell` ... are `../spell/src/...`.
  - `~/cli` (`CLI`) is OUR `src/`;  any other `~/...` is the parser's.  So `src/foo.ts` is `~/cli/foo`, NEVER `~/foo`.
  - That's set in `tsconfig.json` (for `tsc`, and `tsx` at run time) AND `vitest.config.ts`:  MUST keep the two in step.
  - `tsconfig.json` extends the parser's, since the parser's files compile through it.  So `yarn ts` here reports
    the parser's type errors too.
  - Something the command line needs OF the parser is a change in THAT repo, e.g.
    `SpellProject.compile(parentScope, { save })`.
- Projects load the language server's way (`SpellDiskWorkspace`), and questions about them go to its
  `SpellLanguageService` and `ScopeExplorer`, so the command line sees what an editor does.
- Ink (React for terminals) draws its screens, `src/ui/`.
  - `console.*` is SILENCED -- output goes to `process.stdout` / `stderr`.  See `src/consoleGuard.ts`.
  - An Ink screen MUST render with `patchConsole: false`, or Ink puts `console.*` back on screen.
  - Ink is pinned at 5:  6+ needs React 19.
- `src/runner/` is the CHILD process of `spell run` / `spell test`.  It NEVER imports `~/cli`'s values:
  it needs only spell's runtime.
- Each command is `src/commands/<name>Command.ts`:  `(session, args, options) => Promise<exitCode>`, wired up
  in `main.ts`.

## Imports

- As the parser's rules, with `CLI` ~== `~/cli` as our one namespace:  `import { CLI } from "~/cli"`.
- Import order puts the parser's barrels (`~/languages/spell`, `~/lsp`) before our own.
- `main.ts` and `consoleGuard.ts` are NOT in the barrel:  importing either has side effects.

## Tests

- `yarn test`.  Every module's tests sit beside it, `<module>.test.ts(x)`.
- They read the parser's frozen projects, `../spell/projects/test/` (`@test/<Project>`) -- see "Overview" in
  the parser's `AGENTS.md`.  NEVER write into one:  compile with `--stdout`, or make a temp project, as
  `cli.test.ts` does.
- `cli.test.ts` runs the real `bin/spell.mjs`, as a separate process, with no terminal.
- Screens render through `ink-testing-library`, at a fixed `size`.
- `yarn review` ~== `yarn ts` + `yarn lint:fix` + `yarn format` + `yarn test`.
