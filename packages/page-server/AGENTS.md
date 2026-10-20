# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/page-server`.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- What only spell-app's page server does:  `$/page-server` (`PS`), since epic `repo-split` P4.
  - The page server itself is the server package's, and GENERIC:  [server's AGENTS.md](../server/AGENTS.md).
    It names nothing of spell-app's or spell-epic's folders.
  - This package is spell-app's own part of it:  one ROUTE MODULE on it, plus what that module runs.
  - When the repos split (P8):  the server package goes to the bottom repo, spell-server;  this one to spell-app.
- What's in it:
  - [pageServerRoutes.ts](src/pageServerRoutes.ts) -- the route module, listed FIRST in the root `package.json`'s
    `"pageServer": { "routes": [...] }`;  the page server loads it by path, so NO package imports it.  As it's set up:
    - it starts the bundles' build (`BundleBuild`, below), and stops it with the server
    - it swaps the cdnjs highlight.js tag on every page for the engine's copy (`localHighlight()`):  pages load offline
    - the bridges for the SHARED pages, which every checkout shows:
      - the engine's old folders still serve from spell-epic (`movedFolderPath()`, `MOVED_FOLDERS`):
        a safety net for a page that still links them (the shared pages load `/_epic/...` since `epic-eject` T13)
        - the docs assets' old folders, `/packages/docs/tools/_assets/<x>` (J49), `/packages/epics/tools/_assets/<x>`
        - the epics pack's, `/packages/epics/pack/<x>` (P18), `/packages/epics/components/__pack/<x>`
      - what `people-and-orgs` moved OUT of the shared folders answers "not found" (`MOVED_OUT`),
        though the shared repo still holds it for the other checkouts:  `/ui/` and `/brand/components/`
      - Once every page and checkout is past them, both go.
  - [BundleBuild.ts](src/BundleBuild.ts) -- the bundles the page server serves are NOT committed, so it builds them.
    - They're the bundle list in the root `package.json`, read through `pageServerSettings()`;
      the assembler reads the same list:

      ```json
      "pageServer": { "bundles": [...] }
      ```

      - Spell UI's site:  [ui's site/_assets/](../ui/site/), every component set's (one build since epic `epic-engine`)
      - the brand pages':  [brand's _assets/ui/](../brand/)
    - As the server starts, it runs the checkout's own `spell dev bundles build --stale`, as a child.
      `$/assembler`'s `Bundle` does the work;  this only spawns it.
    - It logs that child's output (`bundles:  ...`).
    - A request for a MISSING file in one of those folders waits for it (`BUNDLE_WAIT_MS`);
      a component set's `_assets/` too, through the sets' overlay (`componentSetPath()`).
    - Live reload reloads the pages when it ends:  the settings' `watch` names the folders.
    - Only this checkout's:  a worktree's pages, served at `/worktrees/<w>/`,
      use the bundles that worktree's own page server built.
- NOT here, though only spell-app has them:  the component sets and the engine routes.
  They're SETTINGS, in the root `package.json`'s `"pageServer"` (`componentSets`, `engineRoutes`), read by the generic
  server (epic `repo-split` Q3:  "stays in spell-app, configurable").
- Commands:
  - the usual five (node tests):

    ```sh
    yarn review    yarn ts    yarn lint    yarn format    yarn test
    ```

  - The tests live in the repo's `tests/page-server/`, at the same paths as the code.

## Imports

- As WWOD §4.
- It imports `$/server` and `$/server/page` (the generic page server), never the other way.
- Tests use `$/server/test/serve` (`serveHandler`, `ask`), as the server's do.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `PS` ~== `$/page-server`
