# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this folder, `src/page-server/` of the `spell-app` package (`spell-app/page-server`).

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- What only spell-app's page server does:  `spell-app/page-server` (`PS`), since epic `repo-split` P4.
  - The page server itself is the kit's server's (`spell-kit/server`), and GENERIC:
    [its AGENTS.md](../../../src/server/AGENTS.md).
    It names nothing of spell-app's or spell-epic's folders.
  - This folder is spell-app's own part of it:  one ROUTE MODULE on it, plus what that module runs.
  - When the repos split (P8):  the server package went to spell-server, and this one to spell-app.
    spell-server is the kit's `src/server/` since P9.
- What's in it:
  - [pageServerRoutes.ts](pageServerRoutes.ts) -- the route module, listed FIRST in the root `package.json`'s
    `"pageServer": { "routes": [...] }`;  the page server loads it by path, so NO package imports it.  As it's set up:
    - it starts the bundles' build (`BundleBuild`, below), and stops it with the server
    - it swaps the cdnjs highlight.js tag on every page for the engine's copy (`localHighlight()`):  pages load offline
    - the bridge for the SHARED pages, which every checkout shows:
      what `people-and-orgs` moved OUT of the shared folders answers "not found" (`MOVED_OUT`),
      though the shared repo still holds it for the other checkouts:  `/ui/` and `/brand/components/`
      - Once every page and checkout is past it, it goes.
      - The engine's old folders (`/packages/epics/tools/_assets/` ...) no longer serve:
        the shared pages load `/_epic/...` since `epic-eject` T13 (epic `repo-split` I42).
  - [BundleBuild.ts](BundleBuild.ts) -- the bundles the page server serves are NOT committed, so it builds them.
    - They're the bundle list in the root `package.json`, read through `pageServerSettings()`;
      the kit's `SRV.Bundle` reads the same list:

      ```json
      "pageServer": { "bundles": [...] }
      ```

      - Spell UI's site:  [ui's site/_assets/](../../../spell-ui/site/), every component set's (one build since epic `epic-engine`)
      - the brand pages':  [brand's _assets/ui/](../../../spell-brand/)
    - As the server starts, it runs the checkout's own `spell bundle --stale`, as a child.
      The kit's `SRV.Bundle` (`spell-kit/server`) does the work;  this only spawns it.
    - It logs that child's output (`bundles:  ...`).
    - A request for a MISSING file in one of those folders waits for it (`BUNDLE_WAIT_MS`);
      a component set's `_assets/` too, through the sets' overlay (`componentSetPath()`).
    - Live reload reloads the pages when it ends:  the settings' `watch` names the folders.
    - Only this checkout's:  a worktree's pages, served at `/worktrees/<w>/`,
      use the bundles that worktree's own page server built.
- NOT here, though only spell-app has them:  the component sets and the engine routes.
  They're SETTINGS, in the root `package.json`'s `"pageServer"` (`componentSets`, `engineRoutes`),
  read by the generic server (epic `repo-split` Q3:  "stays in spell-app, configurable").
- Commands:
  - the repo's usual five, at its root (node tests);  this folder's tests alone, `yarn vp test run --project page-server`:

    ```sh
    yarn review    yarn ts    yarn lint    yarn format    yarn test
    ```

  - The tests live in the repo's `tests/page-server/`, at the same paths as the code.

## Imports

- As WWOD §4.
- It imports `spell-kit/server` and `spell-kit/server/page` (the generic page server), never the other way.
- Tests use `spell-kit/server/test/serve` (`serveHandler`, `ask`), as the server's do.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `PS` ~== `spell-app/page-server`
