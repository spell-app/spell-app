# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/spaces`.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- Where projects and people live, and the servers that serve them (epic `people-and-orgs`).
  - Born in P14, with the servers:  the editor's, which was the app's, and Python's, which was py's.
  - Next (P15):  spell's project groups and lists, its project files on disk, and the built-in projects
    (`@spell/`, beside `src/`).
  - Then people and orgs, the storage adapter and the people store (P5-P9).
  - The whole layout:  the epic's spaces page,
    [its package section](../../epics/people-and-orgs/details/spaces-package.html).
- Its folders:
  - [src/models/](src/models/index.ts):  `$/spaces` (`SPACES`), safe in a browser:  the editor imports it.
    Nothing there yet.
  - `src/server/node/`:  node only, imported by path (`$/spaces/server/node/...`), never from the barrel.
    - [routes/](src/server/node/routes/):  the editor's server (below)
  - [src/server/py/](src/server/py/pyproject.toml):  `spell_quart`, Python's web server, a uv project (below)
- Tests live in the repo's `tests/spaces/`, at the same paths as the code they test:
  - `src/server/node/routes/api.ts` => `tests/spaces/src/server/node/routes/api.test.ts`,
    found by vitest (`vitest.config.ts` points there)
  - `src/server/py/` => `tests/spaces/src/server/py/tests/`, found by its pytest (`testpaths`)
- `yarn review` here covers both:
  - the TypeScript:  tsc, oxlint / oxfmt and vitest
  - then `spell_quart`:  ruff and pytest, through uv

## The editor's server (`src/server/node/routes/`)

- The app's API, `/api/...`:  [api.ts](src/server/node/routes/api.ts), one `SRV.Router` route table.
  - On `$/server`'s Express-shaped router and web server (it was Express):  `SRV.Router` and `SRV.WebServer`.
  - Its handlers are spell's node-only helpers, for now:  `$/spell/node/project-utils`, `response-utils` ...
    (they move here in P15).
  - [api.test.ts](../../tests/spaces/src/server/node/routes/api.test.ts) pins its behaviour over HTTP.
- [appRoutes.ts](src/server/node/routes/appRoutes.ts):  the app on the PAGE server, a route module
  ([server's AGENTS.md](../server/AGENTS.md)).
  - The page server loads it by its path, from the root `package.json`'s `"pageServer": { "routes": [...] }`.
  - It serves `/api`, `/element/...` (the app's `dist-element/`) and `/editor`.
  - It starts the editor once the page server listens, and stops it with the page server:
    [EditorServer.ts](src/server/node/routes/EditorServer.ts), vite's dev server, run in `packages/app`.
- [cli.ts](src/server/node/routes/cli.ts):  the API alone, on port 3001.
  - The app's `yarn start:server` / `start:server:prod` run it.
  - It serves the app's own folders (`APP_DIR`:  `dist/`, `dist-element/`, `demo/`), wherever it's started from.
- It BUILDS projects when needed ([ProjectBuild.ts](src/server/node/routes/ProjectBuild.ts)):
  their compiled output and scope packs are in `build/`, never committed (epic `people-and-orgs` P11).
  - A request for a built file that isn't there (`/api/projects/compiled/...`, `scopes/...`, a `file/...` of a
    built name) compiles its project first, then serves it:  one compile per project at a time,
    waiting at most `COMPILE_WAIT_MS`.
  - The route module starts `spell compile --stale --all @examples @library` as the page server starts,
    in the background:  the demo pages and App UI's live examples run them.
  - A child process, the checkout's own `spell compile`:  it compiles as the CLI does,
    and the page server keeps serving pages meanwhile.

## Python's web server (`src/server/py/`)

- `spell_quart`:  a Python spell program served as a web app on Quart (epic `python-target` P20).
  - A uv project, [pyproject.toml](src/server/py/pyproject.toml) with its `uv.lock`:  Python 3.12 or later.
  - It depends on Quart, and on py's `spell_core`, by a path to it (`../../../../py/core`).
  - It moved here from py's `quart/` in P14 (decision Q21).
- `SpellSessions`:  a game per visitor (a cookie), the program run once for each, on a core of its own.
  - A page per WebSocket:  the state down when it opens,
    then a patch after each message and at each pause (`core.before_pause`).
- `page_html()`:  the page.
  - It loads the page side (app's `yarn build:page`, into `dist-page/`), and the program's drawing half.
  - `assets_folder()` finds the page side in the app's folder, or at `$SPELL_PAGE_ASSETS`.
- `spell run <project> --target py` (`yarn dev:py` in a project's folder) serves one:
  cli's [runTarget.ts](../cli/src/runTarget.ts) compiles it into a temp folder with its imports, builds the page side
  if it's stale, and runs its app under uv here, until `Ctrl-C`.
- cli's [quartApp.test.ts](../../tests/cli/src/quartApp.test.ts) plays Solitaire through a compiled app,
  in headless Chromium.
- The yarn scripts here run its checks:

  ```sh
  uv run --directory src/server/py pytest -q                                                  # yarn test
  uv run --directory src/server/py ruff check . ../../../../../tests/spaces/src/server/py/tests  # yarn lint
  uv run --directory src/server/py ruff format . ../../../../../tests/spaces/src/server/py/tests # yarn format
  ```

## Imports

- As WWOD §4, with our own `src/` as `$/spaces` / `$/spaces/*`.
- It imports `$/spell` (its node-only files too) and `$/server`;  it may import `$/core` and `$/util`.
  - NEVER `$/app`, `$/lsp` or `$/cli`:  they import it.
  - `spell` NEVER imports it.
- NOT in the barrel (WWOD §8 › "Barrels"):  everything under `src/server/`.
  - `routes/cli.ts` and `appRoutes.ts` start servers or load spell's version first:  import neither from a barrel.

## Decorators

As WWOD §12, plus:

- The repo root's `vite.decorators.ts` is used by `vitest.config.ts` here:  the routes load spell, whose rules use
  them.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `SPACES` ~== `$/spaces`
