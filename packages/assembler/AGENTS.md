# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/assembler`.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- ASSEMBLING pages:  `$/assembler` (`AS`).
  The steps between a page's content and its file on disk, for every tool that writes pages.
  - Born in epic `epic-components` P7 (Owen, Q15 / I1).
    The `epic` tool moved into the epics package, which then could not import the docs package,
    so what both need to write a page lives here (they're one package since `people-and-orgs` P16;  it stays).
  - `Linker` -- a page's links:
    - `<code>path</code>` references become links
    - every link gets a named target (one per destination)
    - `check()` verifies them
    - It was the docs tools' `doc-links.js`, which is now its command line.
  - [`formatHTML()`](src/format.ts):  formats a page's text in memory, as `vp fmt` would format its file (oxfmt).
    It was the docs tools' `plan-parts.js`'s.
  - `Bundle` -- the bundles only the page server serves, BUILT on demand instead of committed.
    - WHICH bundles exist:  the output folders the root `package.json` lists (`Bundle.specs()`).
      The page server reads the same list:

      ```json
      "pageServer": { "bundles": [...] }
      ```

    - HOW each is built:  `BUNDLES`, in [assembler.types.ts](src/assembler.types.ts):
      - `ui-site`:  Spell UI's docs site
      - `brand`:  the brand pages
    - `check()`:  stale when never built, its entry missing or rewritten, or its sources' hash changed.
    - `build()`:  runs its package's script, then records the hash in its output folder (`.bundle.json`).
    - Its command line:  `spell dev bundles build [<name>...] [--stale]` / `check`.
    - The page server runs `build --stale` when it starts:  `BundleBuild`, in the server package.
    - Why (Owen, 2026-10-07):  their chunk names carry content hashes,
      so every Spell UI change deleted and re-added most of their files, in every diff and merge.
    - A new bundle:
      - a `BUNDLES` entry
      - its output folder in the root `package.json`'s bundle list (above)
      - and in the root `.gitignore`
  - [json5.ts](src/json5.ts), opt-in by path (`$/assembler/json5`), NOT in the barrel:  json5-writer loads jscodeshift,
    which every `epic` call would else pay for.
    - JSON5 written with its comments kept:  `json5Edited(source, value)`, on json5-writer
      (Owen's pick, `people-and-orgs` J41);  spaces' people and projects go through it.
    - A generator's output over a file somebody wrote a comment into:  `keepingComments()` / `keepingCommentsIn()`,
      for the component sets' site data (`docs/__data/*.json5`, epic `epic-workflow` P20).
    - `readJSON5File()`.
    - Here, not in spaces, so ui's tools may import it (ui imports no spell-family package).
    - json5-writer ships no types:  it loads it with `createRequire()` and types what it uses itself,
      so no program compiling it (ui's tools, spaces, their tests) needs an ambient declaration.
  - Next (Owen, 2026-10-07):  most of the page server's assembly code,
    so other assembly tools can be built on it (e.g. a redone goals package).
    - Grow it by capability:  one class per file, its types in `assembler.types.ts`.
- Node only:  it uses node's file system and child processes, `git`, oxfmt, linkedom and json5-writer.
  - It imports NO other package:  spell-epic (its docs tools too) and any other node-side package or tool may import it.
  - NEVER make it import spell-epic's code:  spell-epic imports this.
  - `DataFile` (`$/assembler/DataFile`):  the tooling's JSON5 data files, here since epic `epic-eject` I5, so the CLI
    reads the commands page's data without the engine.
  - `contentFolderOf()` (`$/assembler/contentFolder`, epic `epic-eject` P12):  the repo's shared content folder,
    `contentFolder` in the main checkout's `.epic/config.json5`, so a tool finds the content with no link at the
    checkout's root.
    - The `Linker` lays it under the checkout (`content`), and the CLI reads the commands page's data and the WWOD
      check's shared citers from it.
    - Opt-in by path, like `DataFile`:  the CLI's lean `spell dev` loads no linkedom.
- It knows the checkout's LAYOUT as folder names, never as imports:  `Linker` takes the checkout's root.
  - The folder names:
    - `packages/*/src`, and `packages/*/components` (a component set's elements)
    - `tests/`, where every package's tests live
    - the shared areas:
      - `pages/`
      - `guides/`
      - `epics/`
      - `templates/`
      - in the shared content folder (`contentFolderOf()`), laid under the checkout:
        its folders the checkout has none of are found there (`Linker`'s `content`)
    - the epic engine's code, docs tools included:  spell-epic's `src/`, through the checkout's `spell-epic` link
- Commands, the usual five (node tests):

  ```sh
  yarn review    yarn ts    yarn lint    yarn format    yarn test
  ```

  - The tests live in the repo's `tests/assembler/`, at the same paths as the code.

## Imports

- As WWOD §4, plus ONE climb:  `format.ts` imports the repo root's lint settings (`fmtConfig`).
  - As `../../../vite.lint.ts`, since no alias reaches the root (every `vite.config.ts` does the same).
- The docs tools are JavaScript:  [doc-links.js](../../spell-epic/src/tools/doc-links.js) imports `$/assembler`
  statically.
  - So it runs under `tsx`, never plain node:
    `docLinksRun()`, in the docs tools' [pages.js](../../spell-epic/src/tools/pages.js).

## Types / Exports

As WWOD §8, plus our self-namespace:

- `AS` ~== `$/assembler`
