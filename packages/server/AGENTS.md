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
  - Docs:  [the page server guide](../../../spell-app.epics/guides/server.html):  the library, the page server's flows,
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

  - [open.ts](src/open.ts) -- browser, new window, reused Chrome tab (VS Code's doc preview is spell-epic's own opener)
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
        - today:  `epics`, `guides`, `pages`, `brand`
          (not `templates` since epic `epic-eject` T11:  they're spell-epic's, at the engine route `/templates/`)
      - The page editor's writes are held to the same list (`FileOperations.writableFile()`).
      - Those folders are the shared content folder's, once the page server serves it (`FileOperations.content`,
        `serveContent()`, below);  else the checkout's.
        - In a checkout that still links them in:  paths are resolved (`fileInside()`), never followed,
          so they stay "inside".
  - `LiveReload` + [liveClient.ts](src/liveClient.ts) -- live reload over a websocket, and the page-side client.
    - The client:  `/api/server/live.js` (`editPage()`).
    - Its websocket:  `/api/server/live`.
    - [webSocket.ts](src/webSocket.ts) -- the server's half of one (node built-ins).
    - NEVER an `EventSource`, or any other request held open:
      each takes one of Chrome's 6 connections per host, and every VS Code window shares them.
    - HOT RELOAD (epic `epic-workflow` P24):  what a changed file means to a page is `liveAction()`:
      - its own file:  patched in place (the docs runtime), else reloaded
      - a stylesheet it uses:  swapped in place, no reload
        - in VS Code's side-bar views too (spell-epic's Epic Docs and Review):  the live client runs inside their frame,
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
      epics' `RunningEpics` reports that worktree's docs assets and packs too.
      - It reports them as `/.claude/worktrees/<w>/...`, the path the live client reads them under (`servedPath()`).
      - The path starts with the worktrees' folder, from the root, which the server tells every page:
        `SPELL_SERVER.worktreesPath`, by `urlPathOf()`.
        So worktrees beside the repo work too (epic `epic-eject` P7).
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
    - A file of the shared content folder, by its own path (`.../spell-app.epics/epics/...`, as spell-epic hands
      them out):  its path there, `/epics/...` (epic `epic-eject` I20).
      - The content folder:  the one the server says it serves, `contentFolder` in its `/api/server`.
      - Which main checkout, when the caller names none (the doc preview):  the one beside the content repo whose
        pid file names it (`contentServerOf()`).
  - [checkout.ts](src/checkout.ts) -- `checkoutOf()`:  the git checkout a path is in, and its MAIN checkout.
    - Read from the disk as git finds them (a worktree's `.git` file, git's common dir), with no `git` run.
    - Plain `node` loads it by path (epics' `EpicConfig`, for the hooks), so node built-ins only.
    - [Test helpers](test/checkouts.ts) that fake one:  `fakeMainCheckout()`, `fakeWorktree()`.
  - [proxy.ts](src/proxy.ts) -- `proxyTo()` / `proxyUpgrade()`:  HTTP and websockets to another local server
  - `WebServer` -- all of the above on node's HTTP server
  - [untilInterrupted.ts](src/untilInterrupted.ts) -- run until `Ctrl-C`
- It's a LEAF:  node built-ins only (json5 / esbuild come in as hooks), and it imports NO other package.
  - So anything may import it:
    ui's tools and site, spaces' node server, cli, app, page-server, epics, goals, the VS Code extension.
- It's GENERIC (epic `repo-split` P4):  its code names nothing of spell-app's or spell-epic's folders.
  - What the page server serves beyond the checkout comes from its settings (below):
    the component sets, the engine routes, the page scripts, the route modules.
  - What only spell-app's page server does is [page-server](../page-server/AGENTS.md)'s route module.
  - It goes to the bottom repo, spell-server, when the repos split (P8);  page-server goes to spell-app.
- NOT in the barrel, opt-in by path (WWOD §8 › "Barrels"):
  - `$/server/page/...` -- the page server (one per checkout):
    - its CLI, `spell dev server`
    - page edits:  `PageEditor`, `/api/pages`
    - its info:  `/api/server`
    - Its settings:  the `"pageServer"` block of the root `package.json`.
      - Read by `pageServerSettings()`, in [settings.ts](src/page/settings.ts);
        `componentSets()` and `engineRoutes()` read their two lists out of them.
      - route modules, watched folders, writable folders, bundles, page scripts, component sets, engine routes
      - Plain `node` loads `settings.ts` and `page.types.ts` by path (spell-epic's tools):
        node built-ins and type imports only, and `./settings.ts` with its extension.
    - PAGE SCRIPTS (`"pageScripts"`, epic `repo-split` P2):  module scripts it adds to every HTML page it serves,
      before `</body>` (`PageServer.withPageScripts()`).
      - Each says its URL (`src`), the file it is (`file`, from the root) and the pages it skips (`skip`, URL prefixes).
        - Added only while its file exists:  a checkout that hasn't built it serves its pages without it, no 404.
        - `skip` is matched without a worktree's `/worktrees/<w>` prefix.
      - Today one:  the app's `spell-language.js` (`/element/`, `yarn build:element`), skipping the component sets.
        - It registers spell with the page's `UI.code`, so epic pages and guides colour `language="spell"`
          though spell-epic imports nothing of the app (Q23).
        - Not the component sets' pages:  Spell UI's docs show no spell, and App UI loads `<spell-code>` from its pack.
      - The server knows nothing of what they are:  the paths are the settings'.
    - It mounts every worktree's files at `/worktrees/<w>/`, once a route module says where they are:
      `serveWorktrees(dir)` (epic `epic-eject` P4).
      - The running epics' route module does, in the main checkout:
        [runningRoutes.ts](../../spell-epic/src/list/runningRoutes.ts) (spell-epic's), which also answers
        `/api/epics/running`.
      - Why:  the worktrees' folder is in the repo's epic settings (`.epic/config.json5`, read by epics' `EpicConfig`),
        and this package imports no other.
      - It then tells the folder:
        - to `/api/server` and pages:  `worktrees`
        - to pages, its URL path too:  `worktreesPath`
    - It serves the ENGINE ROUTES too (`engineRoutePath()`, epic `epic-eject` P7):  URL prefixes served from a folder
      of the checkout, under every worktree's address too (`/worktrees/<w>/templates/...`).
      - The list:  the settings' `"engineRoutes"`, each a route and its folder (epic `repo-split` P4).
      - Today spell-app's:  `/_epic/assets/`, `/_epic/pack/` and `/templates/`, from spell-epic through the checkout's
        `spell-epic` link:  where spell-epic's one server per machine serves the engine too, and the pages load it from.
      - A checkout without the link answers "not found" there, and loads no epic route module.
      - Live reload reports a change in one at its route.
    - Route modules add to every page's `window.SPELL_SERVER`:  `addPageConfig()`.
      - e.g. epics' airplane mode ([airplaneRoutes.ts](../../spell-epic/src/tools/airplaneRoutes.ts)),
        whose switch, `AirplaneMode`, moved to epics in `epic-eject` P4.
    - Tests set a route module up by hand with `server.routeContext()`.
    - Every call is under `/api/`, one prefix per package that answers it.
      The old paths answer "not found" (no redirects, Q30 of `people-and-orgs`).
    - It may use deps (`parse5`).
    - It serves the repo at `/`.
      - And the SHARED CONTENT folder after it (`serveContent(dir)`, epic `epic-eject` P12):
        epics, guides, pages, sagas, brand ... with no link at the checkout's root.
        - The checkout first:  a path it has is its own (the brand pages load `../packages/brand/_assets/...`).
        - Under every worktree's address too (`/worktrees/<w>/...`), after that worktree's own files:
          a catch-all mount (`Mount.skip`).
        - The running epics' route module calls it, in every checkout:
          the folder is the repo's `.epic/config.json5`'s `contentFolder`, which this package can't read.
          - `RouteContext.serveContent` is optional:  a server that serves the content itself (spell-epic's
            `EpicServer`) has none.
        - Live reload watches it whole, reporting each change at `/<path>` and under every worktree's address.
        - A page from it is told its path there (`SPELL_SERVER.file`, `/epics/x/x.plan.html`).
        - `/api/files` and `/api/pages` write in it:  the `"writable"` names are its folders.
        - `/api/server` reports it (`contentFolder`);  `spell dev server url <file>` gives a file of it its path there
          (`contentPathOf()`).
      - The shared pages' bridges (the engine's old folders, `/ui/` answering "not found"):  page-server's route
        module ([page-server's AGENTS.md](../page-server/AGENTS.md)).
    - And the COMPONENT SETS:  the docs of each set of elements, in Spell UI's page shape, in its package's `docs/`.
      - The list:  the settings' `"componentSets"`, by id, in the top bar's order (`componentSets()`, epic `repo-split`
        P4;  `ComponentSet`, in [page.types.ts](src/page/page.types.ts)).
        - Each:  its `name`, its pages' folder (`dir`) and the site bundle laid over it (`assets`).
        - Today spell-app's four:  Spell UI, Epic UI (spell-epic's, through the link), App UI, the brand's.
      - Since epic `epic-workflow` P10 / P11;  one layout since `people-and-orgs` P18.
      - Each at `/components/<id>/`.  A new set is one more entry in the settings.
      - No dev server:  the pages are static, loading their site bundle.
      - ONE overlay (`componentSetPath()`):
        - `<prefix>/_assets/` is the set's site bundle (`assets`)
        - the rest is the set's own folder:  its pages, `__parts/`, `__data/`
      - The same at `/worktrees/<w>/components/<set>/`.
      - `<prefix>` redirects to `<prefix>/`:  the one redirect left.
      - Live reload watches each set's folder and its bundle, reporting their changes at the set's address.
      - Settings that name no sets:  the sets of the checkout this package is in (`COMPONENT_SETS`).
        - REFACTOR:  only for spell-epic's route-module tests, whose scratch checkouts name none;
          with `COMPONENT_SETS`, `SITE_BUNDLE` and `SETS_BUNDLE` (spell-epic imports them), it goes once spell-epic
          reads `componentSets()` (epic `repo-split` P4's T entry).
    - The bundles it serves are NOT committed:  page-server's route module builds them (`BundleBuild`).
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
