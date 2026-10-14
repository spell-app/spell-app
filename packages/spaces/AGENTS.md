# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/spaces`.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- Where projects and people live, and the servers that serve them (epic `people-and-orgs`).
  - Born in P14, with the servers:  the editor's, which was the app's, and Python's, which was py's.
  - Spell's projects came in P15:  their groups and lists, their files on disk, and the built-in projects.
  - Next:  people and orgs, the storage adapter and the people store (P5-P9).
  - The whole layout:  the epic's spaces page,
    [its package section](../../epics/people-and-orgs/details/spaces-package.html).
- Its folders:
  - [@spell/](@spell/):  the `@spell` space's built-in projects, committed (see "Projects" below)
    - `examples/`, e.g. `Solitaire/`:  the `@spell/examples` group
    - `library/`, e.g. `cards/`:  the `@spell/library` group;  `people/`, the people library (P7):  people, orgs and
      what they keep, compiled to `people.lib.ts` (the `ts/lib` target), which the app, the people store and the
      `spell` command import
  - [src/models/](src/models/index.ts):  `$/spaces` (`SPACES`), safe in a browser:  the editor imports it.
    - [projectGroups.ts](src/models/projectGroups.ts):  spell's project groups, `PROJECT_GROUPS`
    - [SpellProjectRoot.ts](src/models/SpellProjectRoot.ts):  a group's list of projects,
      and its projects' create, copy, rename and delete
    - [ProjectFiles.ts](src/models/ProjectFiles.ts):  a project's FILE create, copy, rename and delete
    - [spaceNames.ts](src/models/spaceNames.ts):  spaces' own `__` names, `SPACE_NAMES`
  - `src/server/node/`:  node only, imported by path (`$/spaces/server/node/...`), never from the barrel.
    - [environment.ts](src/server/node/environment.ts):  where everything is on disk (see "Projects" below)
    - [projects/](src/server/node/projects/):  projects on disk, and the disk reader (see "Projects" below)
    - [routes/](src/server/node/routes/):  the editor's server (below)
  - [src/server/py/](src/server/py/pyproject.toml):  `spell_quart`, Python's web server, a uv project (below)
- Tests live in the repo's `tests/spaces/`, at the same paths as the code they test:
  - `src/server/node/routes/api.ts` => `tests/spaces/src/server/node/routes/api.test.ts`,
    found by vitest (`vitest.config.ts` points there)
  - `src/server/py/` => `tests/spaces/src/server/py/tests/`, found by its pytest (`testpaths`)
  - And the test projects:  `tests/spaces/@spell/test/` (see "Projects" below)
- `yarn review` here covers both:
  - the TypeScript:  tsc, oxlint / oxfmt and vitest
  - then `spell_quart`:  ruff and pytest, through uv

## Projects

- Spell's project GROUPS are ours:  `SPACES.PROJECT_GROUPS`, in [projectGroups.ts](src/models/projectGroups.ts).
  - Loading that file registers them with spell's registry, `SP.SpellSetup`, which starts empty.
  - So every program that reads a spell path loads them first:  through `$/spaces`, our disk reader,
    or `$/spaces/models/projectGroups` alone (`<spell-app>` does that, to stay light).
  - Spell NEVER imports us.
- Each group is named by its ADDRESS, and its folder comes from that (`SP.SpellUrls.folderFor()`):

  | Group | Folder |
  | --- | --- |
  | `@spell/examples`, `@spell/library`, `@spell/guides` | `packages/spaces/@spell/<group>/`, committed |
  | `@spell/test` | `tests/spaces/@spell/test/`, committed and frozen |
  | `owen@spell` | spell-spaces' `@spell/owen@/`, outside git |

  - spell-spaces:  `<main checkout>/../spell-spaces`, ONE folder for main and every worktree.
    - `SPELL_SPACES_DIR` sets it.
    - Laid out by org, each person's space inside it:  `owen@spell/errors` is `@spell/owen@/errors/`.
  - `SPACES.LOCAL_PERSON` is `owen`, until the people phase reads it from the person's own file.
  - A project is its group's address, a slash and its folder's name, lower-kebab (epic `people-and-orgs` P4,
    decision Q39):  `@spell/examples/drawable-solitaire`;  a file in it, its name with a dot (Q41),
    `@spell/examples/drawable-solitaire/Card.spell`.
  - A `@local/<folder>` group, added at runtime for a folder an editor opened, says its own folder (`serverPath`).
- Where the folders are:  [environment.ts](src/server/node/environment.ts).
  - `spaceFolders`:  `builtins` (`packages/spaces/`), `tests` (`tests/spaces/`), `spaces` (spell-spaces)
  - also `spellSpacesDir`, `repoDir` and `buildDir`
  - Tests point them at temporary folders:  `SPELL_BUILTINS_DIR`, `SPELL_TESTS_DIR`, `SPELL_SPACES_DIR`,
    `SPELL_BUILD_DIR`.
- Projects on disk:  [projects/](src/server/node/projects/).
  - [project-utils.ts](src/server/node/projects/project-utils.ts):  where each project is, a group's list,
    a project's index, and its files' create, copy, rename, delete and save.
    - Each change to a file goes through the page server's file operations, `SRV.FileOperations`, in-process:
      under the file lock, written all at once.
    - A group's list, and a project's file list, leave out our own `__` names (`SPACES.isSpaceName()`):
      known by that list, so `__init__.py` and `__snapshots__/` still list (decision J52).
  - [disk-fetch.ts](src/server/node/projects/disk-fetch.ts):  the DISK READER, for node hosts of spell's
    projects (the language server, the `spell` command, tests).
    - `installDiskFetch()` answers the URLs spell asks for from disk, with the same functions the routes call.
  - `file-utils`, `response-utils` and `server.types` beside them.
- What spell BUILDS for a project goes in `build/` at the repo root, each checkout its own, never committed:
  - `packages/X` => `build/X`, e.g. `build/spaces/@spell/examples/solitaire/`
  - `tests/X` => `build/X`, e.g. `build/spaces/@spell/test/fizzbuzz/`
  - spell-spaces' `X` => `build/spell-spaces/X`, e.g. `build/spell-spaces/@spell/owen@/errors/`
  - anywhere else:  beside the source
  - `buildFolderFor()`, in project-utils;  "Projects" in [spell's PARSING.md](../spell/PARSING.md) has the rest.
- The editor edits projects through our models:
  - a group's projects:  `SPACES.SpellProjectRoot`
  - a project's files:  `new SPACES.ProjectFiles(project).create(...)`, `.duplicate()`, `.rename()`, `.delete()`
  - `SpellProject` itself only reads, compiles and saves (decision Q20).
- Lint and format leave the projects alone:  `packages/spaces/@spell` and `tests/spaces/@spell`, in the root's
  `vite.lint.ts`.

## The editor's server (`src/server/node/routes/`)

- The app's API, `/api/...`, and reading a file, `/spaces/...`:  [api.ts](src/server/node/routes/api.ts),
  `SRV.Router` route tables (`api` and `spaceFiles`).
  - On `$/server`'s Express-shaped router and web server (it was Express):  `SRV.Router` and `SRV.WebServer`.
  - Its handlers are our [project-utils.ts](src/server/node/projects/project-utils.ts)'s.
  - A project or a file is named by its ADDRESS, from ONE function, `SP.SpellUrls` (spell's
    [SpellUrls.ts](../spell/src/SpellUrls.ts)):
    - a file is READ at `/spaces/<project>/<file>`, e.g. `/spaces/@spell/examples/solitaire/Card.spell`
    - and SAVED by `POST /api/projects/file/<project>/<file>`
    - a project's index:  `/api/projects/index/<project>`
    - a group's projects:  `/api/projects/list/<group>`, e.g. `/api/projects/list/owen@spell`
    - Compiled files are files:  `/spaces/<project>/<project>.spell.js`, `.scopes.js`, `.declarations.json`,
      `.en.js`.  A built one is served from the build folder.
    - A URL is split by its group and ONE part for the project before any path is made, and each part decoded on its
      own (`SP.SpellUrls.split()`, decision Q41).
  - [api.test.ts](../../tests/spaces/src/server/node/routes/api.test.ts) pins its behaviour over HTTP.
- [appRoutes.ts](src/server/node/routes/appRoutes.ts):  the app on the PAGE server, a route module
  ([server's AGENTS.md](../server/AGENTS.md)).
  - The page server loads it by its path, from the root `package.json`'s `"pageServer": { "routes": [...] }`.
  - It serves `/api`, `/spaces`, `/element/...` (the app's `dist-element/`) and `/editor`.
    - vite's proxy passes `/api`, `/spaces` and `/element` on to it, from the editor.
  - It starts the editor once the page server listens, and stops it with the page server:
    [EditorServer.ts](src/server/node/routes/EditorServer.ts), vite's dev server, run in `packages/app`.
- [cli.ts](src/server/node/routes/cli.ts):  the API (and `/spaces`) alone, on port 3001.
  - The app's `yarn start:server` / `start:server:prod` run it.
  - It serves the app's own folders (`APP_DIR`:  `dist/`, `dist-element/`, `demo/`), wherever it's started from.
- It BUILDS projects when needed ([ProjectBuild.ts](src/server/node/routes/ProjectBuild.ts)):
  their compiled output and scope packs are in `build/`, never committed (epic `people-and-orgs` P11).
  - A request for a built file that isn't there (`/spaces/<project>/<project>.spell.js`, `.scopes.js` ...)
    compiles its project first, then serves it (`projectBuild.builtFirst()`):  one compile per project at a time,
    waiting at most `COMPILE_WAIT_MS`.
  - The route module starts `spell compile --stale --all @spell/examples @spell/library` as the page server starts,
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
- It imports `$/spell` and `$/server`;  it may import `$/core` and `$/util`.
  - Spell's node-only files too (`$/spell/node/...`).
  - [projectGroups.ts](src/models/projectGroups.ts) imports spell's light `$/spell/SpellSetup` alone,
    so `<spell-app>` can load it by path (`$/spaces/models/projectGroups`) without the parser.
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
