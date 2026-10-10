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
  - `safePath.ts` -- `resolveInside()`:  URL path -> file under a root, never outside it
  - `StaticHandler` -- folders under URL prefixes, with:
    - html / per-extension hooks
    - overlays:  one folder laid over another
    - an `ETag`
  - `Request` / `Reply` / `Router` / `bodies.ts` -- the part of Express the app's `api.ts` uses
  - `listener.ts` -- `toListener()`:  a `Handler` as node's `(req, res)`, with the 404 / error answers
  - `ports.ts` -- `isFree`, `freePort`, `listenPreferred`
  - `open.ts` -- browser, new window, reused Chrome tab, VS Code's Simple Browser
  - `FileLock` -- `<file>.lock`, so tools writing the same file take turns
  - `LiveReload` + `liveClient.ts` -- live reload over a websocket,
    and the page-side client (`/_server/live.js`, `editPage()`).
    - `webSocket.ts` -- the server's half of one (node built-ins).
    - NEVER an `EventSource`, or any other request held open:
      each takes one of Chrome's 6 connections per host, and every VS Code window shares them.
  - `Guard` -- `Host` check, per-run token, same-origin writes
  - `PidFile` -- a background server's `<root>/.spell-server.json`:  status, ensure, stop.
    - `ensure` restarts a server that started before its code last changed (`sources`, `newestChange()`):
      after a merge, the next opener gets the new routes.
  - `mainServer.ts` -- `mainServerUrl()`:  a worktree's file on the MAIN checkout's page server
  - `proxy.ts` -- `proxyTo()` / `proxyUpgrade()`:  HTTP and websockets to another local server
  - `WebServer` -- all of the above on `node:http`
  - `untilInterrupted.ts` -- run until `Ctrl-C`
- It's a LEAF:  node built-ins only (json5 / esbuild come in as hooks), and it imports NO other package.
  - So anything may import it:
    `ui`'s tools and site, `spell/node`, `cli`, `app`, `docs`, `goals`, the VS Code extension.
- NOT in the barrel, opt-in by path (WWOD §8 › "Barrels"):
  - `$/server/page/...` -- the page server (one per checkout):
    its CLI (`spell dev server`), page edits, and running epics.
    - Running epics (`RunningEpics`):  the main checkout's server shows every worktree's plan doc.
    - It may use deps (`parse5`).
    - It serves the repo at `/`.
    - And Spell UI's docs, as static pages at `/ui/` (`UI_SITE`, `page.types.ts`).
      - No dev server:  they load the site bundle.
      - The pages:  the shared pages, through the root's `ui/` link.
      - Laid over them (`StaticHandler.overlays`, `uiBuildPath()`):
        the branch's built `_assets/` and `_data/`, from [ui's site](../ui/site/).
      - The same at `/worktrees/<w>/ui/`.
      - Old `/packages/ui/site/<page>` URLs redirect there (`movedUiPage()`).
    - `BundleBuild` -- the bundles it serves are NOT committed, so it builds them.
      - They're `BUNDLE_FOLDERS`:
        - Spell UI's site:  `packages/ui/site/_assets/`
        - the brand pages':  `packages/brand/_assets/ui/`
      - On `start()`, it runs the checkout's own `spell dev bundles build --stale`, as a child.
        `$/assembler`'s `Bundle` does the work;  the server only spawns it.
      - It logs that child's output (`bundles:  ...`).
      - A request for a MISSING file in one of those folders waits for it (`BUNDLE_WAIT_MS`).
      - Live reload reloads the pages when it ends.
      - Only this checkout's:  a worktree's pages, served at `/worktrees/<w>/`,
        use the bundles that worktree's own page server built.
  - `$/server/site/...` -- browser code:
    - the site header every page shows
    - Spell's favicon, `favicon.ts`:
      - GENERATED from the hat mark, by `yarn favicon` ([favicon.ts](scripts/favicon.ts), in `scripts/`)
      - `WebServer` serves it at `/_server/favicon.*` and `/favicon.ico`,
        importing the leaf, never the browser-only barrel
    - `EpicState.ts`:  an epic's state (in progress, errors, paused, future, done).
      - The ONE rule the docs index, `RunningEpics`, `<epic-page>` and the CLI's session icons share.
      - NO imports at all, so plain `node` loads it by path
        (the docs index's [index.js](../docs/tools/index.js)), and the epics pack bundles it.
      - Each imports the file, never the barrel.
    - `EpicCards.ts`, beside it:  the Epics page's cards.
      - Its groups, a card's star and last-worked date, the favourites file.
      - The docs index and `RunningEpics` draw them alike.
      - Its ONE import is `./EpicState.ts`, by file name, so plain `node` loads it too.
  - `$/server/test/...` -- test helpers (`serveHandler`, `ask`)
- Commands:
  - `yarn review`, `yarn ts`, `yarn lint`, `yarn format`, `yarn test` (node)
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
