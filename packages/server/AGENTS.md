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
  - [mime.ts](src/mime.ts) -- ONE content-type table, `typeFor()`
  - [safePath.ts](src/safePath.ts):
    - `resolveInside()`:  URL path -> file under a root, never outside it
    - `fileInside()`:  the same, for a file that may not be there yet
  - `StaticHandler` -- folders under URL prefixes, with:
    - html / per-extension hooks
    - overlays:  one folder laid over another
    - an `ETag`
  - `Request`, `Reply`, `Router` and [bodies.ts](src/bodies.ts) -- the part of Express the app's API uses
  - [listener.ts](src/listener.ts) -- `toListener()`:  a handler as node's `(req, res)`, with the 404 / error answers
  - [ports.ts](src/ports.ts) -- choosing a port:

    ```ts
    isFree    freePort    listenPreferred
    ```

  - [open.ts](src/open.ts) -- browser, new window, reused Chrome tab, VS Code's Simple Browser
  - `FileLock` -- `<file>.lock`, so tools writing the same file take turns
  - `FileOperations` -- files and folders saved, created, renamed, duplicated and deleted.
    - each under the `FileLock`
    - a save all at once:  a temp file, then a rename
    - nothing of pages or projects
    - In-process, on absolute paths, checking no list:  `SRV.FileOperations.save(file, contents, { ifMatch })` ...
      - Spaces saves its projects' files this way.
      - The page editor (`/api/pages`) saves through `save()` too.
    - Over HTTP, `/api/files` (`route()`), for pages the server served:
      - `PUT ?path=` (save), `POST /create`, `/rename`, `/duplicate`, `DELETE ?path=`
      - every one needs `Guard`'s strong write check (this run's token, same origin)
      - ONLY inside the writable folders, the shared content ones;  anything else:  403
        - the list:  `"writable"`, in the page server's settings (below)
        - today:  `epics`, `guides`, `pages`, `templates`, `brand`
      - The page editor's writes are held to the same list (`FileOperations.writableFile()`).
      - Those folders are links into the shared repo:
        paths are resolved (`fileInside()`), never followed, so they stay "inside".
  - `LiveReload` + [liveClient.ts](src/liveClient.ts) -- live reload over a websocket, and the page-side client.
    - The client:  `/api/server/live.js` (`editPage()`).
    - Its websocket:  `/api/server/live`.
    - [webSocket.ts](src/webSocket.ts) -- the server's half of one (node built-ins).
    - NEVER an `EventSource`, or any other request held open:
      each takes one of Chrome's 6 connections per host, and every VS Code window shares them.
    - HOT RELOAD (epic `epic-workflow` P24):  what a changed file means to a page is `liveAction()`:
      - its own file:  patched in place (the docs runtime), else reloaded
      - a stylesheet it uses:  swapped in place, no reload
        - in VS Code's side-bar views too (Spell Docs, Review):  the live client runs inside their frame,
          with its own socket (the frame is cross-origin to the view)
        - nothing caches a stale one:  every answer is `Cache-Control: no-store`, `_assets/` included,
          so a reload always fetches the stylesheet as it is now
      - a script it loaded, or one beside it:  reloaded, keeping the scroll
        - which:  its `<script src>` tags, and `performance`'s resource entries
          (lazy chunks, `epics.pack.js`, an experiment's `*.bundle.js`)
      - anything else:  `spell-server:file`, and the page decides
    - Each socket opens with `hello` and the server's `run` (`LiveReload.run`, also `SPELL_SERVER.run`):
      a page from an earlier run (the server restarted) reloads, for the new `/api/server/live.js` and token.
    - Reloads go through `reloadGate()`:  one, 500ms after the last change.
      - While the reader types in a field, an "Updated:  reload" pill waits;  it reloads once focus leaves the field.
    - A worktree's pages on the main server (`/worktrees/<w>/`):
      epics' `RunningEpics` reports that worktree's docs assets and packs too, as `/.claude/worktrees/<w>/...`,
      the path the live client reads them under (`servedPath()`).
  - `Guard` -- `Host` check, per-run token, same-origin writes
  - `PidFile` -- a background server's `.spell-server.json`, at its root:  status, ensure, stop.
    - `ensure` restarts a server that started before its code last changed.
      So after a merge, the next opener gets the new routes.
      - its code:  the `sources` folders, by `newestChange()`
      - Nothing restarts it by itself:  the next `spell dev server ensure` (an opener, `/airplane`),
        or the side bar's "Restart Page Server".  Its open pages then reload (`hello`).
    - `stop` waits for the old PROCESS to end (`SIGTERM`, then `SIGKILL` after 10s), not just for it to stop answering.
      - Why:  it stops answering before it lets go of its port.
        `ensure` started the new one while the old one held the port, so the new one took another port,
        and pages on the old one found the server down (epic `airplane`, 2026-10-10).
  - [mainServer.ts](src/mainServer.ts) -- `mainServerUrl()`:  a worktree's file on the MAIN checkout's page server.
    - It asks that server for `/api/epics/running` (`RUNNING_EPICS_API`).
  - [proxy.ts](src/proxy.ts) -- `proxyTo()` / `proxyUpgrade()`:  HTTP and websockets to another local server
  - `WebServer` -- all of the above on node's HTTP server
  - [untilInterrupted.ts](src/untilInterrupted.ts) -- run until `Ctrl-C`
- It's a LEAF:  node built-ins only (json5 / esbuild come in as hooks), and it imports NO other package.
  - So anything may import it:
    ui's tools and site, spaces' node server, cli, app, epics, goals, the VS Code extension.
- NOT in the barrel, opt-in by path (WWOD §8 › "Barrels"):
  - `$/server/page/...` -- the page server (one per checkout):
    - its CLI, `spell dev server`
    - page edits:  `PageEditor`, `/api/pages`
    - its info:  `/api/server`
    - Its settings:  the `"pageServer"` block of the root `package.json`.
      - Read by `pageServerSettings()`, in [settings.ts](src/page/settings.ts).
      - route modules, watched folders, writable folders, bundles
    - It mounts every worktree's files at `/worktrees/<w>/`.
      - The running epics' list is epics' route module, not the server's:
        [runningRoutes.ts](../epics/src/list/runningRoutes.ts), at `/api/epics/running`.
    - Every call is under `/api/`, one prefix per package that answers it.
      The old paths answer "not found" (no redirects, Q30 of `people-and-orgs`).
    - It may use deps (`parse5`).
    - It serves the repo at `/`.
      - TEMPORARY until `people-and-orgs` merges into `main` (its T3), for the SHARED pages every checkout shows:
        - folders this branch moved still serve from their new place (`movedFolderPath()`):
          - the docs assets' old folder, `/packages/docs/tools/_assets/<x>` (J49)
          - the epics pack's, `/packages/epics/pack/<x>` (P18)
        - what it moved OUT of the shared folders answers "not found" (`MOVED_OUT`),
          though the shared repo still holds it for the other checkouts
          - `/ui/` and `/brand/components/`
        - At the merge, a script relinks the shared pages, and both go.
    - And the COMPONENT SETS:  the docs of each set of elements, in Spell UI's page shape, in its package's `docs/`.
      - The list:  `COMPONENT_SETS`, in [page.types.ts](src/page/page.types.ts).
      - Since epic `epic-workflow` P10 / P11;  one layout since `people-and-orgs` P18.
      - Each at `/components/<set>/`.  A new set is one more entry.
        - Spell UI:  [ui's docs/](../ui/docs/), at `/components/ui/`
        - Epic UI:  [epics' docs/](../epics/docs/), at `/components/epics/`
        - App UI:  [app's docs/](../app/docs/), at `/components/app/`
        - the brand's:  [brand's docs/](../brand/docs/), at `/components/brand/`
      - No dev server:  the pages are static, loading Spell UI's site bundle.
      - ONE overlay (`componentSetPath()`):
        - `<prefix>/_assets/` is the set's site bundle (`assets`)
          - for Spell UI:  its own, `SITE_BUNDLE`
          - for the others:  the sets' build, `SETS_BUNDLE`, in Spell UI's bundle's `sets/`
        - the rest is the set's own folder:  its pages, `__parts/`, `__data/`
      - The same at `/worktrees/<w>/components/<set>/`.
      - `<prefix>` redirects to `<prefix>/`:  the one redirect left.
      - Live reload watches each set's folder and its bundle, reporting their changes at the set's address.
    - `BundleBuild` -- the bundles it serves are NOT committed, so it builds them.
      - They're the bundle list in the root `package.json`, read through `pageServerSettings()`;
        the assembler reads the same list:

        ```json
        "pageServer": { "bundles": [...] }
        ```

        - Spell UI's site:  [ui's site/_assets/](../ui/site/), with the component sets' build in its `sets/`
        - the brand pages':  [brand's _assets/ui/](../brand/)
      - On `start()`, it runs the checkout's own `spell dev bundles build --stale`, as a child.
        `$/assembler`'s `Bundle` does the work;  the server only spawns it.
      - It logs that child's output (`bundles:  ...`).
      - A request for a MISSING file in one of those folders waits for it (`BUNDLE_WAIT_MS`).
      - Live reload reloads the pages when it ends.
      - Only this checkout's:  a worktree's pages, served at `/worktrees/<w>/`,
        use the bundles that worktree's own page server built.
    - Spell projects' compiled output (`build/`, never committed) is built the same way,
      but by the app's route module, not here.
      - [ProjectBuild](../spaces/src/server/node/routes/ProjectBuild.ts), in spaces' routes,
        runs `spell compile --stale --all @spell/examples @spell/library` as the page server starts.
      - The page server knows nothing of spell projects.
  - `$/server/site/...` -- browser code:
    - the site header every page shows
    - Spell's favicon, `favicon.ts`:
      - GENERATED from the hat mark, by `yarn favicon` ([favicon.ts](scripts/favicon.ts), in `scripts/`)
      - `WebServer` serves it at the root, after the static files (a folder's own icons win):

        ```
        /favicon.svg  /favicon-32.png  /apple-touch-icon.png  /favicon.ico
        ```

      - `WebServer` imports the leaf, never the browser-only barrel.
    - An epic's state and the Epics page's cards left for `$/epics/list/` (epic `people-and-orgs` P16).
      - `EpicState`, `EpicCards`
  - `$/server/test/...` -- test helpers (`serveHandler`, `ask`)
- Commands:
  - the usual five (node tests):

    ```sh
    yarn review    yarn ts    yarn lint    yarn format    yarn test
    ```

  - The tests live in the repo's `tests/server/`, at the same paths as the code.
    Their helpers are still here, in `test/`.
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
- Tests use `$/server/test/serve` (`serveHandler`, `ask`):  real HTTP, through node's HTTP client.
  Never `fetch`, which resolves `..` before sending.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `SRV` ~== `$/server`
