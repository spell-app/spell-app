# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/server`.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- Serving pages locally, for every package:  `$/server` (`SRV`).
  - Before this package, six servers each had their own mime table, path check, port choice and opener.
    Now they share these.
  - Docs:  [the page server guide](../../guides/server.html):  the library, the page server's flows,
    route modules, safety, why.
- What's in it:
  - `mime.ts` -- ONE content-type table, `typeFor()`
  - `safePath.ts` -- `resolveInside()`:  URL path -> file under a root, never outside it;
    `fileInside()`, the same for a file that may not be there yet
  - `StaticHandler` -- folders under URL prefixes, with:
    - html / per-extension hooks
    - overlays:  one folder laid over another
    - an `ETag`
  - `Request` / `Reply` / `Router` / `bodies.ts` -- the part of Express the app's `api.ts` uses
  - `listener.ts` -- `toListener()`:  a `Handler` as node's `(req, res)`, with the 404 / error answers
  - `ports.ts` -- `isFree`, `freePort`, `listenPreferred`
  - `open.ts` -- browser, new window, reused Chrome tab, VS Code's Simple Browser
  - `FileLock` -- `<file>.lock`, so tools writing the same file take turns
  - `FileOperations` -- files and folders saved, created, renamed, duplicated and deleted,
    each under the `FileLock`, a save all at once (temp file, then rename).
    Nothing of pages or projects.
    - In-process, on absolute paths, checking no list:  `SRV.FileOperations.save(file, contents, { ifMatch })` ...
      Spaces saves its projects' files this way;  the page editor (`/api/pages`) saves through `save()` too.
    - Over HTTP, `/api/files` (`route()`), for pages the server served:
      - `PUT ?path=` (save), `POST /create`, `/rename`, `/duplicate`, `DELETE ?path=`
      - every one needs `Guard`'s strong write check (this run's token, same origin)
      - ONLY inside the root `package.json`'s `"pageServer"` `"writable"` folders, the shared content ones:
        `epics`, `guides`, `pages`, `templates`, `brand`.  Anything else:  403.
      - `/api/pages`' writes are held to the same list (`FileOperations.writableFile()`).
      - those are links into the shared repo:  paths are resolved (`fileInside()`), never followed,
        so they stay "inside"
  - `LiveReload` + `liveClient.ts` -- live reload over a websocket,
    and the page-side client (`/api/server/live.js`, `editPage()`), its websocket `/api/server/live`.
    - `webSocket.ts` -- the server's half of one (node built-ins).
    - NEVER an `EventSource`, or any other request held open:
      each takes one of Chrome's 6 connections per host, and every VS Code window shares them.
  - `Guard` -- `Host` check, per-run token, same-origin writes
  - `PidFile` -- a background server's `<root>/.spell-server.json`:  status, ensure, stop.
    - `ensure` restarts a server that started before its code last changed (`sources`, `newestChange()`):
      after a merge, the next opener gets the new routes.
  - `mainServer.ts` -- `mainServerUrl()`:  a worktree's file on the MAIN checkout's page server, asking it for
    `/api/epics/running` (`RUNNING_EPICS_API`)
  - `proxy.ts` -- `proxyTo()` / `proxyUpgrade()`:  HTTP and websockets to another local server
  - `WebServer` -- all of the above on `node:http`
  - `untilInterrupted.ts` -- run until `Ctrl-C`
- It's a LEAF:  node built-ins only (json5 / esbuild come in as hooks), and it imports NO other package.
  - So anything may import it:
    `ui`'s tools and site, spaces' `server/node/`, `cli`, `app`, `epics`, `goals`, the VS Code extension.
- NOT in the barrel, opt-in by path (WWOD §8 › "Barrels"):
  - `$/server/page/...` -- the page server (one per checkout):
    its CLI (`spell dev server`), page edits (`PageEditor`, `/api/pages`), its info (`/api/server`).
    - Its settings:  the root `package.json`'s `"pageServer"` block (`pageServerSettings()`, `settings.ts`):
      route modules, watched folders, writable folders, bundles.
    - It mounts every worktree's files at `/worktrees/<w>/`.
      The running epics' list is epics' route module ([runningRoutes.ts](../epics/src/list/runningRoutes.ts),
      `/api/epics/running`), not the server's.
    - Every call is under `/api/`, one prefix per package that answers it;  the old paths answer "not found" (no
      redirects, Q30 of `people-and-orgs`).
    - It may use deps (`parse5`).
    - It serves the repo at `/`.
      - TEMPORARY until `people-and-orgs` merges into `main` (its T3), for the SHARED pages every checkout shows:
        - folders this branch moved still serve from their new place (`movedFolderPath()`):  the docs assets' old
          folder, `/packages/docs/tools/_assets/<x>` (J49), and the epics pack's, `/packages/epics/pack/<x>` (P18)
        - what it moved OUT of the shared folders answers "not found", though the shared repo still holds it for
          the other checkouts (`MOVED_OUT`):  `/ui/` and `/brand/components/`
        - At the merge, a script relinks the shared pages, and both go.
    - And the COMPONENT SETS (`COMPONENT_SETS`, `page.types.ts`;  epic `epic-workflow` P10 / P11, one layout since
      `people-and-orgs` P18):  the docs of each set of elements, in Spell UI's page shape, in its package's `docs/`.
      - Each at `/components/<set>/`:  Spell UI (`packages/ui/docs/`) at `/components/ui/`, Epic UI
        (`packages/epics/docs/`) at `/components/epics/`, App UI (`packages/app/docs/`) at `/components/app/`, the
        brand's (`packages/brand/docs/`) at `/components/brand/`.  A new set is one more entry.
      - No dev server:  the pages are static, loading Spell UI's site bundle.
      - ONE overlay (`componentSetPath()`):  `<prefix>/_assets/` is the set's site bundle (`assets`:  Spell UI's own,
        `SITE_BUNDLE`, for Spell UI;  the sets' build, `SETS_BUNDLE` in `packages/ui/site/_assets/sets/`, for the
        others), the rest the set's own folder (its pages, `__parts/`, `__data/`).
      - The same at `/worktrees/<w>/components/<set>/`.
      - `<prefix>` redirects to `<prefix>/`:  the one redirect left.
      - Live reload watches each set's folder and its bundle, reporting their changes at the set's address.
    - `BundleBuild` -- the bundles it serves are NOT committed, so it builds them.
      - They're the root `package.json`'s `"pageServer": { "bundles": [...] }`, read through `pageServerSettings()`
        (the assembler reads the same list):
        - Spell UI's site:  `packages/ui/site/_assets/` (the component sets' build in its `sets/`)
        - the brand pages':  `packages/brand/_assets/ui/`
      - On `start()`, it runs the checkout's own `spell dev bundles build --stale`, as a child.
        `$/assembler`'s `Bundle` does the work;  the server only spawns it.
      - It logs that child's output (`bundles:  ...`).
      - A request for a MISSING file in one of those folders waits for it (`BUNDLE_WAIT_MS`).
      - Live reload reloads the pages when it ends.
      - Only this checkout's:  a worktree's pages, served at `/worktrees/<w>/`,
        use the bundles that worktree's own page server built.
    - Spell projects' compiled output (`build/`, never committed) is built the same way, but by the app's route
      module, not here:  `ProjectBuild`, in [spaces' routes](../spaces/src/server/node/routes/ProjectBuild.ts), runs
      `spell compile --stale --all @examples @library` as the page server starts.
      The page server knows nothing of spell projects.
  - `$/server/site/...` -- browser code:
    - the site header every page shows
    - Spell's favicon, `favicon.ts`:
      - GENERATED from the hat mark, by `yarn favicon` ([favicon.ts](scripts/favicon.ts), in `scripts/`)
      - `WebServer` serves it at the root:  `/favicon.svg`, `/favicon-32.png`, `/apple-touch-icon.png`,
        `/favicon.ico`, after the static files (a folder's own icons win);
        importing the leaf, never the browser-only barrel
    - An epic's state and the Epics page's cards left for `$/epics/list/` (`EpicState`, `EpicCards`;
      epic `people-and-orgs` P16).
  - `$/server/test/...` -- test helpers (`serveHandler`, `ask`)
- Commands:
  - `yarn review`, `yarn ts`, `yarn lint`, `yarn format`, `yarn test` (node)
  - The tests live in the repo's `tests/server/`, at the same paths as the code;
    their helpers are still here, in `test/`.
  - `yarn favicon [--hat 0.74]` after the hat mark changes (headless Chromium renders the PNGs)

## Express, on purpose

- `Request` / `Reply` / `Router` keep Express's names and behaviour, so handlers move over unchanged:
  - `params`, `query`, `body` (default `{}`), `originalUrl`, `baseUrl`
  - `status().send()`
  - `send(string)` is `text/html`
  - `sendFile` skips dot files
- ONE deliberate difference:  `:name*` holds the WHOLE rest of the path.
  Express 4 put only the first segment there.

## Imports

- As WWOD §4.
- Tests use `$/server/test/serve` (`serveHandler`, `ask`):  real HTTP through `node:http`.
  Never `fetch`, which resolves `..` before sending.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `SRV` ~== `$/server`
