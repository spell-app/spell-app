# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this folder, `src/spaces/` of the `spell-app` package (`spell-app/spaces`),
and with the `@spell` space's built-in projects, `spaces/@spell/` at the repo's root.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- Where projects and people live, and the servers that serve them (epic `people-and-orgs`).
  - Born in P14, with the servers:  the editor's, which was the app's, and Python's, which was py's.
  - Spell's projects came in P15:  their groups and lists, their files on disk, and the built-in projects.
  - People came in P7-P9:  the people library, the storage adapter (P8) and the people store (P9), below.
  - The whole layout, on the epic's spaces page:
    [its package section](../../../spell.epics/epics/people-and-orgs/details/spaces-package.html).
- Its folders:
  - [@spell/](../../spaces/@spell/):  the `@spell` space's built-in projects, committed (see "Projects" below)
    - `examples/`:  the `@spell/examples` group (fizzbuzz, calculator ...)
    - `library/`:  the `@spell/library` group (people)
      - `people/`, the people library (P7):  people, orgs and what they keep
      - compiled to `people.lib.ts` (the `ts/lib` target):
        the app, the people store and the spell command import it
  - [models/](models/index.ts):  `spell-app/spaces` (`SPACES`), safe in a browser:  the editor imports it.
    - [projectGroups.ts](models/projectGroups.ts):  spell's project groups, `PROJECT_GROUPS`
    - [SpellProjectRoot.ts](models/SpellProjectRoot.ts):  a group's list of projects,
      and its projects' create, copy, rename and delete
    - [ProjectFiles.ts](models/ProjectFiles.ts):  a project's FILE create, copy, rename and delete
    - [spaceNames.ts](models/spaceNames.ts):  spaces' own `__` names, `SPACE_NAMES`
    - [spellUIPack.ts](models/spellUIPack.ts):  Spell UI as a spellx drawing names its components bare
      (`<button>` => `<ui-button>`), registered with spell as the barrel loads (`SP.ComponentPacks`, epic
      `elemental-spell` P7);  `<spell-viewer>` doesn't load it:  it never compiles
    - [SpaceStorage.ts](models/SpaceStorage.ts) and [people.ts](models/people.ts):  types only, see "People"
  - [the node side](server/node/), node only:  imported by path (`spell-app/spaces/server/node/...`), never from the barrel
    - [environment.ts](server/node/environment.ts):  where everything is on disk (see "Projects" below)
    - [projects/](server/node/projects/):  projects on disk, and the disk reader (see "Projects" below)
    - [storage/](server/node/storage/) and [people/](server/node/people/):  see "People" below
    - [prefs/](server/node/prefs/):  see "Preferences" below
    - [routes/](server/node/routes/):  the editor's server (below)
  - [the Python side](server/py/pyproject.toml):  `spell_quart`, Python's web server, a uv project (below)
- Tests live in the repo's `tests/spaces/`, at the same paths as the code they test:
  - TypeScript, found by vitest (the root's `vitest.config.ts`, its `spaces` project):
    - [api.ts](server/node/routes/api.ts) => [api.test.ts](../../tests/spaces/server/node/routes/api.test.ts)
  - Python:  [the Python server's tests](../../tests/spaces/server/py/tests/), found by its pytest (`testpaths`)
  - The frozen test projects themselves are beside the built-ins, in `spaces/@spell/test/` (see "Projects" below).
    The tests that compile them whole are the repo's `tests/spell/`, its `spell` project, not ours.
    - Among them `counter`, a frozen counter library, which `counter-app` imports:
      for the tests of one project importing another.
      - Those of the runner, the core contract, `spell compile` and `spell explain --in`.
    - The built-in examples are tested as they are, not as frozen copies (`EXAMPLE_FIXTURES`):
      their snapshots are in `tests/spell/__examples__/<Project>/`, re-blessed when an example changes.
    - So is every guide, `@spell/guides`, since epic `debut` P10.
      Its snapshots are in `tests/spell/__guides__/<Project>/`.
- [test/](test/index.ts), node only:
  the test helpers for the frozen test projects and the tested examples and guides, `spell-app/spaces/test`
  - among them:
    - `loadFixtureProject()`
    - `fixturePath()`
    - `fixtureProjectId()`
    - `compiledFixture()` ...
  - Imported by tests only, by name, never from the barrel.
  - Inline projects are spell-parser's helpers', `spell-parser/spell/test` (`parseSpellProject()`).
- The repo's checks (its root `package.json`'s scripts) cover both:
  - the TypeScript:  tsc, oxlint / oxfmt and vitest
  - then `spell_quart`:  ruff and pytest, through uv

## Projects

- Spell's project GROUPS are ours:  `SPACES.PROJECT_GROUPS`, in [projectGroups.ts](models/projectGroups.ts).
  - Loading that file registers them with spell's registry, `SP.SpellSetup`, which starts empty.
  - So every program that reads a spell path loads them first, one of these ways:
    - through `spell-app/spaces`
    - through our disk reader (below)
    - or `spell-app/spaces/models/projectGroups` alone:  `<spell-viewer>` does that, to stay light
  - Spell NEVER imports us.
- Each group is named by its ADDRESS, and its folder comes from that (`SP.SpellUrls.folderFor()`):

  | Group | Folder |
  | --- | --- |
  | `@spell/examples`, `@spell/library`, `@spell/guides` | `spaces/@spell/<group>/`, committed |
  | `@spell/test` | `spaces/@spell/test/`, committed and frozen (spell-parser's `tests/spaces/` until epic `spanish` P18) |
  | `owen@spell` | spell.spaces' `@spell/owen@/`, outside git |

  - spell.spaces:  `<main checkout>/../spell.spaces`, in the kit `spell`:  ONE folder for main and every worktree.
    - It was `../spell-spaces` before epic `repo-split` P8.
    - `SPELL_SPACES_DIR` sets it.
    - Laid out by org, each person's space inside it:  `owen@spell/errors` is `@spell/owen@/errors/`.
  - `SPACES.LOCAL_PERSON` is `owen`:  who this machine's person is, until a machine can have more than one person.
    - `SPACES.HOME_ORG` is their org for now, spell:  so their space is `@spell/owen@/`.
  - A project's address:  its group's address, a slash and its folder's name, lower-kebab (P4, decision Q39).
    - Or as titled, as Solitaire's is, and its Spanish twin's:  `Solitaire`, `Solitario`.
      Owen's call, in epic `spanish` P11.
    - e.g. `@spell/examples/Solitaire`
    - a file in it:  its name, which has a dot (Q41), e.g. `@spell/examples/Solitaire/Solitaire.spell`
  - A `@local/<folder>` group, added at runtime for a folder an editor opened, says its own folder (`serverPath`).
- Where the folders are:  [environment.ts](server/node/environment.ts).

  | Name | Folder | Tests set it with |
  | --- | --- | --- |
  | `spaceFolders.builtins` | `spaces/`:  the built-in groups and the test projects, `testFilesRoot` | `SPELL_BUILTINS_DIR` |
  | `spaceFolders.spaces`, `spellSpacesDir` | spell.spaces, `../spell.spaces` beside the main checkout | `SPELL_SPACES_DIR` |
  | `buildDir` | `build/` at the repo root | `SPELL_BUILD_DIR` |
  | `repoDir`, `packagesDir` | this checkout's root (its folders are there) | |
  | `srcDir`, `coreDir`, `packageFolder()` | spell-parser's folders, found by package through `node_modules` | |

- Projects on disk:  [projects/](server/node/projects/).
  - [project-utils.ts](server/node/projects/project-utils.ts):  where each project is, a group's list,
    a project's index, and its files' create, copy, rename, delete and save.
    - Each change to a file goes through the page server's file operations, `SRV.FileOperations`, in-process:
      under the file lock, written all at once.
    - A group's list, and a project's file list, leave out our own `__` names (`SPACES.isSpaceName()`).
      - Known by that list of names:  so `__init__.py` and `__snapshots__/` still list (decision J52).
  - [disk-fetch.ts](server/node/projects/disk-fetch.ts):  the DISK READER, for node hosts of spell's
    projects (the language server, the `spell` command, tests).
    - `installDiskFetch()` answers the URLs spell asks for from disk, with the same functions the routes call.
  - Beside them, their helpers:
    - [file-utils](server/node/projects/file-utils.ts)
    - [response-utils](server/node/projects/response-utils.ts)
    - [server.types](server/node/projects/server.types.ts)
- What spell BUILDS for a project goes in `build/` at the repo root, each checkout its own, never committed:

  | Source | Built into | e.g. |
  | --- | --- | --- |
  | this repo's `tests/X` | `build/X` | |
  | this repo's `X` | `build/X` | `build/spaces/@spell/examples/Solitaire/`, `build/spaces/@spell/test/fizzbuzz/` |
  | spell.spaces' `X` | `build/spell-spaces/X` | `build/spell-spaces/@spell/owen@/errors/` |
  | another spell-app checkout's `spaces/X` or `tests/X` | THAT checkout's `build/...` | a worktree's example, opened by the main checkout's language server (epic `spanish` P21) |
  | anywhere else | beside the source | |

  - `buildFolderFor()`, in project-utils;  "Projects" in [spell's PARSING.md](../../../spell-parser/src/spell/PARSING.md) has the rest.
- The editor edits projects through our models:
  - a group's projects:  `SPACES.SpellProjectRoot`
  - a project's files:  `new SPACES.ProjectFiles(project)`, to create, duplicate, rename and delete them
  - `SpellProject` itself only reads, compiles and saves (decision Q20).
- Lint and format leave the projects alone:  `spaces/@spell`, the test projects among them.
  - Their ignore list is in the toolchain's [lint.ts](../../../src/toolchain/lint.ts).

## People

- Spaces' files go through ONE interface, `SpaceStorage` ([SpaceStorage.ts](models/SpaceStorage.ts), P8):
  read, write, list, remove, watch, by paths relative to spell-spaces (`@spell/owen@/__me.json5`).
  - The disk's:  [DiskStorage.ts](server/node/storage/DiskStorage.ts).
    - It writes through the page server's file operations.
    - It keeps each folder's list, and one recursive watcher drops a folder's when anyone changes it.
  - JSON5 is read and written in ONE place, [json5.ts](server/node/storage/json5.ts), on json5-writer:
    an edit writes the whole value back, every comment where it was;  double quotes, no trailing commas.
    - The editing itself, `json5Edited()`, is the kit's util's ([json5.ts](../../../src/util/node/json5.ts)):
      the component sets' site data writers use it too, and ui may import no spell-family package
      (epic `epic-workflow` P20).
  - The page server's `--spaces <dir>` points it elsewhere (`SPELL_SPACES_DIR`).
- The PEOPLE STORE ([PeopleStore.ts](server/node/people/PeopleStore.ts), P9):
  people and orgs, as the people library's things (`@spell/library/people`).
  - Their files:
    - a person, `Person#owen@spell`:  `@spell/owen@/__me.json5`
    - an org, `Org#spell`:  `@spell/__org.json5`, with its members inside it
      (each a membership:  a person and a role, guest, member, admin or spell-admin)
  - Read:  each file checked against its class (`checkEntry()`, its problems returned, read anyway), brought up to
    its version, and every person or org it names read too.
  - Written:  ONE file at a time, its comments kept;  a friend is written as a reference, never into their file.
  - `me()` writes a starter `__me.json5` the first time, from git's name and email.
  - Nobody is refused a save yet, under `@spell` either (J46):  the permissions UI is todo T8.
- Its routes ([peopleRoutes.ts](server/node/people/peopleRoutes.ts)), what the app's "You" panel calls:
  - `GET /api/people/me`:  this machine's person (`SPACES.LOCAL_PERSON`), their orgs and roles, their file's problems
  - `POST /api/people/me`:  their changes written, answered as `GET`
  - The answers' types:  [people.ts](models/people.ts), safe in a browser.

## Preferences

- Each person's preferences, kept in their space (epic `prefs-and-undo` P2):  [SpacePrefs.ts](server/node/prefs/SpacePrefs.ts).
  - One JSON5 file per store, in the person's `__prefs/` folder:
    - the editor's:  `@spell/owen@/__prefs/spellEditor.json5`
    - a store named like a project is a folder and a file:  `__prefs/@owen/solitaire.json5`
  - Through `SpaceStorage` and spaces' JSON5 writer:  a person's comments stay.
  - One change at a time to each file.
  - A store name that would reach outside `__prefs/`, or a key that can't be one:  `SRV.HttpError(400)`.
- Its routes ([prefsRoutes.ts](server/node/prefs/prefsRoutes.ts)), what the kit's `ServerPlace` asks:
  - load and save a key:  `GET /api/prefs/load`, `POST /api/prefs/save`
  - list and forget the keys under a prefix:  `GET /api/prefs/keys`, `POST /api/prefs/forget`
  - the protocol's types are the kit's (`spell/util`'s `PrefLoadAnswer` ...):  the client is generic
  - whose:  `prefsPersonFor()`, this machine's person until sign-in, the ONE function sign-in replaces
- `respondWithJSON()` answers a thrown `SRV.HttpError` with its status, anything else with 500.

## The editor's server

- Its folder:  [routes/](server/node/routes/).
- [api.ts](server/node/routes/api.ts):  two `SRV.Router` route tables.
  - `api`:  the app's API, `/api/...`
  - `spaceFiles`:  reading a file, `/spaces/...`
  - On the kit's server's Express-shaped router and web server (it was Express):  `SRV.Router`, `SRV.WebServer`.
  - Its handlers are our [project-utils.ts](server/node/projects/project-utils.ts)'s.
  - A project or a file is named by its ADDRESS, from ONE function, `SP.SpellUrls` (spell's
    [SpellUrls.ts](../../../spell-parser/src/spell/SpellUrls.ts)):
    - a file is READ at `/spaces/<project>/<file>`, e.g. `/spaces/@spell/examples/Solitaire/Solitaire.spell`
    - and SAVED by `POST /api/projects/file/<project>/<file>`
    - a project's index:  `/api/projects/index/<project>`
    - a group's projects:  `/api/projects/list/<group>`, e.g. `/api/projects/list/owen@spell`
    - Compiled files are files, `/spaces/<project>/<project>.spell.js` (its program) and the rest beside it:
      - `.scopes.js`, its scope pack
      - `.declarations.json5`
      - `.en.js`
      - A built one is served from the build folder.
    - A URL is split by its group and ONE part for the project before any path is made, and each part decoded on its
      own (`SP.SpellUrls.split()`, decision Q41).
  - [api.test.ts](../../tests/spaces/server/node/routes/api.test.ts) pins its behaviour over HTTP.
- [appRoutes.ts](server/node/routes/appRoutes.ts):  the app on the PAGE server.
  - A route module ([the kit's server AGENTS.md](../../../src/server/AGENTS.md)):  the page server loads it by its path,
    from the root `package.json`'s `"pageServer": { "routes": [...] }`.
  - What it serves (vite's proxy passes the first three on to it, from the editor):
    - `/api`
    - `/spaces`
    - `/element/...`:  the app's `dist-element/`
    - `/editor`
  - It starts the editor once the page server listens, and stops it with the page server:
    [EditorServer.ts](server/node/routes/EditorServer.ts), vite's dev server, run in `app/`.
- [cli.ts](server/node/routes/cli.ts):  the API (and `/spaces`) alone, on port 3001.
  - The app's `yarn start:server` / `start:server:prod` run it.
  - It serves the app's own folders (`APP_DIR`), wherever it's started from:  its dist, dist-element and demo.
- It BUILDS projects when needed ([ProjectBuild.ts](server/node/routes/ProjectBuild.ts)):
  their compiled output and scope packs are in `build/`, never committed (epic `people-and-orgs` P11).
  - A request for a built file that isn't there (`/spaces/<project>/<project>.spell.js` ...)
    compiles its project first, then serves it (`projectBuild.builtFirst()`).
    - One compile per project at a time, waiting at most `COMPILE_WAIT_MS`.
  - The route module starts `spell compile --stale --all @spell/examples @spell/library` as the page server starts,
    in the background:  the demo pages and App UI's live examples run them.
  - A child process, the checkout's own `spell compile`:  it compiles as the CLI does,
    and the page server keeps serving pages meanwhile.

## Python's web server

- `spell_quart`:  a Python spell program served as a web app on Quart (epic `python-target` P20).
  - A uv project, [pyproject.toml](server/py/pyproject.toml) with its `uv.lock`:  Python 3.12 or later.
  - It depends on Quart, and on py's `spell_core`, by a path to it (`../../../../../spell-parser/src/py/core`).
  - It moved here from py's `quart/` in P14 (decision Q21).
- `SpellSessions`:  a game per visitor (a cookie), the program run once for each, on a core of its own.
  - A page per WebSocket:  the state down when it opens,
    then a patch after each message and at each pause (`core.before_pause`).
- `page_html()`:  the page.
  - It loads the page side (app's `yarn build:page`, into `dist-page/`), and the program's drawing half.
  - `assets_folder()` finds the page side in the app's folder, or at `$SPELL_PAGE_ASSETS`.
- `spell run <project> --target py` serves one (or `yarn dev:py` in a project's folder).
  cli's [runTarget.ts](../cli/runTarget.ts):
  - compiles it into a temporary folder, with its imports
  - builds the page side, if it's stale
  - runs its app under uv here, until `Ctrl-C`
- cli's [quartApp.test.ts](../../tests/cli/quartApp.test.ts) plays Solitaire through a compiled app,
  in headless Chromium.
- The repo's checks run its own, from the repo's root:

  ```sh
  uv run --directory src/spaces/server/py pytest -q                                              # yarn test
  uv run --directory src/spaces/server/py ruff check . ../../../../tests/spaces/server/py/tests  # yarn lint
  uv run --directory src/spaces/server/py ruff format . ../../../../tests/spaces/server/py/tests # yarn format
  ```

## Imports

- As WWOD §4, with our own source folder as `spell-app/spaces` and `spell-app/spaces/*`.
- What it imports:
  - `spell-parser/spell`, and spell's node-only files too (`spell-parser/spell/node/...`)
  - `spell/server`
  - it may import `spell-parser/core` and `spell/util`
  - [projectGroups.ts](models/projectGroups.ts) imports spell's light `spell-parser/spell/SpellSetup` alone.
    So `<spell-viewer>` can load it by path, `spell-app/spaces/models/projectGroups`, without the parser.
- NEVER the app, lsp or cli folders:  they import it.
- `spell` NEVER imports it.
- NOT in the barrel (WWOD §8 › "Barrels"):  everything under `server/`, and `test/`.
  - [cli.ts](server/node/routes/cli.ts) and [appRoutes.ts](server/node/routes/appRoutes.ts)
    start servers or load spell's version first:  import neither from a barrel.

## Decorators

As WWOD §12, plus:

- The root's `vitest.config.ts` uses the toolchain's `spell/toolchain/decorators`:
  the routes load spell, whose rules use decorators.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `SPACES` ~== `spell-app/spaces`
