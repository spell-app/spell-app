# AGENTS.md

This file guides AI coding agents (Claude Code, Codex, and others)
working with code in this repository, `spell-app`.

**ALWAYS, before any code:  READ [WWOD](agents/wwod/WWOD.md), "What Would Owen Do?", the house style.**
- It covers process, style, naming, imports, errors, comments,
  functions, types, classes, decorators, CSS, tests ...
- Its table names the spoke to read for what you're touching.

**The rules for every repo are the kit's:  [its AGENTS.md](../AGENTS.md).**
- Among them:  the Solid 2 rules and the commands guide, to read first;  the toolchain;
  worktrees and windows;  the shared content;  the changelog;  the words;  the logs.
- Claude's own:  [the kit's CLAUDE.md](../CLAUDE.md).

## Overview

- spell-app:  Spell's editor and its servers.
  - The editor app, `<spell-app>` / `<spell-editor>`, the runner;  spaces, where projects and people live;
    the language server;  the `spell` CLI;  the app's part of the kit's page server;  the spell language's VS Code
    extension.
  - Since epic `repo-split` P8 it holds only those.
    Every other package is in the kit, or in a repo of its own beside this one (below, "The other repos").
- It's a CHILD REPO of the kit `spell-kit` (the top repo), at `~/www/spell/spell-app/`.
  - The kit holds the ONE install for every repo:  no `yarn.lock` here.
    - `yarn install` at `~/www/spell`, never here.
    - Its rules across repos:  [the kit's AGENTS.md](../AGENTS.md).
  - ONE npm package, `spell-app` (epic `repo-split` P11, Q36;  unscoped):
    its root [package.json](package.json), one version.
    - ALL its code is under ONE [src/](src/), a folder each (`app`, `spaces`, `lsp`, `cli`).
    - A file's import name is the package's name, then its path under `src/`, no extension
      (epic `repo-split` P14, Q47):
      - `spell-app/app/solid` (a folder's barrel, its `index.ts`), `spell-app/spaces/models/projectGroups`
      - the SAME name inside this repo and from every other:  no `$/` aliases, no `../`
      - same-folder peers stay `./Peer`
    - Its `exports` map every name to its file, each with spell-app's own condition, `spell-app-source`:
      - one wildcard entry, `"./*"`, for every file
      - an explicit entry for each folder barrel imported as a folder (`./app/solid`, `./cli` ...):
        `tsx` won't load a folder through the wildcard from another repo
      - one file outside `src/`, which spaces' `PeopleStore` stands on:
        the people library, `spell-app/spaces/@spell/library/people/people.lib.ts`
      - TypeScript reads them as SOURCE (the condition, in [tsconfig.json](tsconfig.json)).
      - Vite, Vitest, `tsx` and oxlint read the source too (`default`), adding the extension themselves.
      - No `types` (declarations):  no repo above reads spell-app.
    - The folders have NO `package.json` of their own:
      their dependencies, scripts and the `spell` bin are the root's.
    - TypeScript sees two programs (below, "Import names and global types"):
      - [tsconfig.json](tsconfig.json):  the browser code, `app`, spaces' models, the language service
      - [tsconfig.node.json](tsconfig.node.json):  what needs node
        - the cli, spaces' servers (the app's route module on the page server among them), the language server's process
        - the app's docs-data tools, the scripts and configs
    - ONE [vite.config.ts](vite.config.ts) (lint, format),
      and ONE [vitest.config.ts](vitest.config.ts), a project per folder.
    - Beside `src/`:
      - the app's build folder `app/`:  its Vite configs, `index.html`, `scripts/`, docs pages and builds
      - the `@spell` space's built-in projects, in `spaces/@spell/`, the frozen test projects among them
      - `tests/`, `scripts/`
  - The checks, at the root, each over the whole repo (below, "Toolchain"):

    ```sh
    yarn ts    yarn test    yarn lint    yarn format    yarn review
    ```

- Every folder's TESTS live in `tests/<folder>/`, at the same path as the code they test under `src/`.
  - E.g. spaces' [projectGroups.ts](src/spaces/models/projectGroups.ts) is tested by
    [projectGroups.test.ts](tests/spaces/models/projectGroups.test.ts).
  - With their snapshots and test data;  the repo's `yarn test`, `yarn ts`, lint and format cover them.
  - They import by package name too:  `import { SPACES } from "spell-app/spaces"`.
  - [vitest.config.ts](vitest.config.ts) has a project per folder, over its tests:
    the app's two are `app:node` and `app:browser`;  and `spell`, below.
  - [The tests' tsconfig](tests/tsconfig.json) checks them with node's settings;
    [the app's tests' one](tests/app/tsconfig.json), with the app's (Solid's JSX).
  - Spell's frozen test projects (`@spell/test`) are HERE, beside the other `@spell` groups:
    [spaces/@spell/test/](spaces/@spell/test/) (spell-lang's from epic `repo-split` P8 until epic `spanish` P18).
    - Owen, 2026-10-22:  "Seems like all of the @spell/ packages should live in spell-app":
      so a test project may import another `@spell` project:  `counter-app` imports `counter`, a frozen counter library.
    - The tests that compile them whole are here too, in [tests/spell/](tests/spell/), the `spell` project:
      their snapshots, `tsc` and pyright on them, whole-project parsing.
      - The examples Solitaire and Solitario are tested as they are, never a frozen copy:
        their snapshots are in `tests/spell/__examples__/<Project>/`, re-blessed when an example changes.
      - The same paths they had in spell-lang:  `tests/spell/test/fixtures.test.ts`, `tests/spell/parserTests/...`.
      - Their helpers:  [spell-app/spaces/test](src/spaces/test/index.ts) (`loadFixtureProject()`, `compiledFixture()` ...).
      - `yarn spell:test:fixtures` runs the snapshot tests;  `yarn spell:test:fixtures:bless` rewrites the snapshots.
    - spell-lang's own tests write their projects inline, and never read these.
- This file holds what's about THIS repo:  its folders, the other repos it reaches, its commands and toolchain.
  - The house style every repo shares is WWOD (`agents/wwod/`, above).
  - Each folder's `AGENTS.md` holds only what's local to it.
  - A section there with the same name as one here, or as a WWOD rule, EXTENDS it
    ("As the root's, plus:", "As WWOD §4, plus:").
  - Codex reads every `AGENTS.md` from the root down to its working folder;
    Claude Code loads the root `CLAUDE.md` plus the folder's.
    So a rule lives in exactly ONE place:  across repos, the kit's [AGENTS.md](../AGENTS.md).

### Folders

Each folder of `src/` links to its own `AGENTS.md`:  read it before working there.
- Import:  its barrel's name, the same from this repo and every other.
- Namespace:  the folder's self-namespace (WWOD §8).

| Folder | Import | Namespace | What it is |
| --- | --- | --- | --- |
| [app](src/app/AGENTS.md) | `spell-app/app` | `UI` | the web app, the runner, and the `<spell-app>` / `<spell-editor>` web components (`src/app/components/`);  `yarn start` / `build*` are its scripts, at the repo's root;  its build folder is `app/` (Vite's configs and root), with App UI, the docs pages of its components, in `app/docs/` (at `/components/app/`) |
| [spaces](src/spaces/AGENTS.md) | `spell-app/spaces` | `SPACES` | where projects and people live:  its models (`models/`, browser-safe:  spell's project groups and lists), projects on disk (`server/node/projects/`), and the servers that serve them, the editor's (`server/node/`) and Python's, `spell_quart` (`server/py/`, a uv project);  the built-in projects are in `spaces/@spell/`, beside `src/` |
| [lsp](src/lsp/AGENTS.md) | `spell-app/lsp` | `LSP` | spell's language server:  the service browser-safe, its process (`server.ts`) and disk workspace node only |
| [cli](src/cli/AGENTS.md) | `spell-app/cli` | `CLI` | the `spell` command-line tool, running the spell-family packages' SOURCE through `tsx`;  see the kit's [README-cli.md](../README-cli.md) too |
| `vscode/` | | | the spell language's VS Code extension (below) |

More on some of them:
- The VS Code extension, [vscode/](vscode/), is its own yarn project, NOT part of the `spell-app` package:
  its own `package.json` and `yarn.lock`.
  - `spell app vscode` builds and installs it.
  - Or its two steps:  `spell app vscode build`, then `install`.
  - Its tests run in plain node, as two projects of spell-app's `yarn test`:
    - `vscode`:  its plain-node parts, in this repo's [tests/vscode/](tests/vscode/) ([spellAppRoot.test.ts](tests/vscode/spellAppRoot.test.ts))
    - `vscode:elements`:  the elements help, in [vscode/tests/](vscode/tests/), by the extension's own
      [config](vscode/vitest.config.ts), with a stand-in for the `vscode` module ([fakeVscode.ts](vscode/tests/fakeVscode.ts));
      `yarn test` in `vscode/` runs it alone, and its `yarn check` type-checks it
  - Its language server runs lsp's source, [server.ts](src/lsp/server.ts), with `tsx`, from the checkout's root
    (`LSP_SERVER`, [extension.ts](vscode/src/extension.ts)).
    - A checkout from before epic `repo-split` P14 (`lsp/src/server.ts`) doesn't run:  it says so, naming the file.
  - Whose lsp:  the WINDOW's spell-app checkout, found when the server starts, so one install works everywhere:
    - the `spell.parserRoot` setting, if set
    - else the window's folders:  first one that is spell-app or holds it, only then one inside a checkout
      (the content repo sits inside the main checkout's kit);  in each pass the worktree's before the main
      checkout's, whatever order the window lists them in (a worktree's `.git` is a file)
    - else, last, the checkout it was built in
    - The extension's output says which it picked;  the code is `findSpellApp()` ([spellAppRoot.ts](vscode/src/spellAppRoot.ts)).
  - In `.tsx` / `.jsx` files it also gives custom elements' slot, part and dashed-attribute help
    ([ElementsHelp.ts](vscode/src/ElementsHelp.ts), the kit's `JsxElementHelp` bundled in, with TypeScript 6 to read JSX);
    and it carries Spell UI's and the brand's HTML and CSS data, copied in by its build:
    a vocabulary change shows there after `spell app vscode`.
  - The Review tab, the Epic Docs view and the window bridge are spell-epic's own extension, not this one.
- THE PAGE SERVER is the kit's, started from the kit's root only (`spell server start`, from any folder;
  epic `repo-split` P16):  [the kit's server AGENTS.md](../src/server/AGENTS.md).
  - spell-app declares ITS part of its settings in its own [package.json](package.json), `"pageServer"`, the way it
    declares its `"spell": { "commands" }`;  the kit merges every installed repo's part, paths from each repo's folder:
    - `routes`:  the app's route module, [appRoutes.ts](src/spaces/server/node/routes/appRoutes.ts) (the app's
      `/api`, `/element/`, the editor, the built-in projects' build)
    - `pageScripts`:  `spell-language.js` (`app/dist-element/`), which colours spell on the docs pages
    - `componentSets`:  App UI, `app/docs`, with Spell UI's site bundle (`../spell-ui/site/_assets`)
  - Until P16 its `src/page-server/` added the bundles' build, the offline highlight.js swap and the `/ui/` bridge,
    and its `package.json` held every repo's settings:  now the kit's server, spell-epic's `localCopies` and the
    content repo's `gone`.
  - The editor's record, `.spell-server.editor.json`, is at the page server's root:  the kit's
    ([the epic settings](.epic/config.json5)' `app.urlFile`).
- COMPONENT SETS (epic `epic-workflow` P10;  one layout since `people-and-orgs` P18):
  a set of elements and their docs pages in Spell UI's page shape, tracked with their repo.
  - In the set's package:
    - `components/`:  the elements (this repo's:  `src/app/components/`)
    - `docs/`:  ONE flat folder of pages (this repo's:  `app/docs/`);  an element's page is its tag, `epic-item.html`
      - `__parts/`:  every page's frame
      - `__data/`:  the side column's data
  - Served at `/components/<set>/` by the kit's page server,
    which lays a build of Spell UI's site over the folder at `_assets/`.
    - The list:  `componentSets`, in each repo's part of its settings (its `package.json`'s `"pageServer"`).
  - The sets:
    - Spell UI:  [spell-ui's docs/](../spell-ui/docs/), at `/components/ui/`
    - Epic UI:  [spell-epic's docs/](../spell-epic/src/docs/), at `/components/epics/`
    - App UI:  [app's docs/](app/docs/), at `/components/app/`:  this repo's only one
    - Brand UI:  [spell-brand's docs/](../spell-brand/docs/), at `/components/brand/`
  - A set that's a component PACK (epics, brand) is built by the kit's pack tooling, `spell-pack build`
    ([ComponentPack.ts](../src/element-tools/ComponentPack.ts)):  each pack's `yarn pack:build`.
    `spell pack build <pack>` calls the same tool, and finds the brand's pack in `../spell-brand/`.
  - The top bar's Spell/UI, Epic/UI and App/UI tabs;  the brand's set lights the Brand tab.
    - The tabs are settings too:  `siteTabs`, in the CONTENT repo's part (`spell.epics/page-server.json5`), in the
      bar's order, each naming what lights it (epic `repo-split` I4, P16;
      [the kit's server AGENTS.md](../src/server/AGENTS.md)).
      The kit's header names none of them;  the kit's [siteTabs.test.ts](../tests/server/site/siteTabs.test.ts) pins
      them.
  - The old addresses (`/ui/`, `/epic-ui/`, `/app-ui/`, `/brand/components/`) answer "not found" (Q30).

### The other repos

Every other package is in the kit `spell-kit` (`~/www/spell`), the repo around this one,
or in a repo of its own beside this one inside the kit (`~/www/spell/<repo>/`).
- Each is its own git repo, with its own history (epic `repo-split` P8;  the kit since P9).
- The list, lowest first, and what each needs:  the kit's [repos.json5](../repos.json5).
- Each is ONE package, its code under its one `src/`:  the kit's [AGENTS.md](../AGENTS.md), "Which repo holds what".

| Repo | What it holds | Its rules |
| --- | --- | --- |
| spell-kit (the kit) | `spell-kit`:  the helpers, the toolchain, the server, the element base and its tools, the `spell` program;  and WWOD.  Its folders:  the kit's AGENTS.md, "The kit's folders" | [AGENTS.md](../AGENTS.md) |
| spell-lang | `spell-lang`:  `spell-lang/parser`, `markdown`, `core`, `py` and `spell`:  the parser, the language, its runtime and its writers | [AGENTS.md](../spell-lang/AGENTS.md) |
| spell-ui | `spell-ui`:  Spell UI, Fomantic UI reborn as `ui-*` custom elements, and its docs site | [AGENTS.md](../spell-ui/AGENTS.md) |
| spell-brand | `spell-brand`:  Claude Design's pages and tokens, their Spell UI copies, the `<brand-*>` pack | [AGENTS.md](../spell-brand/AGENTS.md) |
| spell-epic | `spell-epic`:  the epic engine, a Claude Code plugin (below, "spell-epic") | [AGENTS.md](../spell-epic/AGENTS.md) |

- spell-app is the highest code repo.
  - It NEEDS spell-lang, spell-brand, spell-ui and the kit:  it imports them.
  - It names spell-epic nowhere since epic `repo-split` P16:  spell-epic declares its own part of the kit's page
    server's settings.  No spell-app source imports it.
  - No repo below imports spell-app:  every arrow points down.

### Which folder may import which

One change may touch several folders, but dependencies flow ONE way:

```text
cli -> app -> lsp -> spaces             (this repo's)
app / cli -> spaces                     (the app:  spaces' models only, never server/node)
lsp -> spaces                           (its node files:  projects on disk, in `SpellDiskWorkspace`)
any folder here -> any repo below       (by npm name:  spell-lang/spell, spell-ui/core ...)
```

- `spaces` (epic `people-and-orgs`):  where projects and people live, and the servers that serve them.
  - NEVER make it import the app, lsp or cli folders.
  - Its models (`spell-app/spaces`) are safe in a browser.
  - `spell-app/spaces/server/node/...` is node only, imported file by file.
  - The page server loads its route module by PATH (this repo's part of its settings, `"pageServer"`), not by import.
  - Spell's project groups (`@spell/examples`, `owen@spell` ...) are spaces'.
    Loading `spell-app/spaces` registers them with spell,
    so every program that reads a spell path loads spaces first ([spaces' AGENTS.md](src/spaces/AGENTS.md)).
  - Owen's own projects are NOT in git:  they're in spell.spaces, `../spell.spaces` beside this repo in the kit,
    one folder for main and every worktree (`SPELL_SPACES_DIR` sets it;  `../spell-spaces` before epic `repo-split` P8).
  - Folders of other repos it needs at run time (spell's `src/`, the core's) it finds by
    PACKAGE, through `node_modules` (`environment.packageFolder("spell-lang/py")` ...), never by a path into that repo.
- A package of ANOTHER repo is imported by its npm name too (`spell-lang/spell`, `spell-ui/core` ...),
  never by a `../` path:  the rules are the kit's ([AGENTS.md](../AGENTS.md), "Imports across repos", "Tests").

### Import names and global types

- Every import is a package name, this repo's own too (`spell-app/app/solid`;  epic `repo-split` P14, Q47):
  the kit's [AGENTS.md](../AGENTS.md), "Imports across repos", says how each tool reads one.
  - NO `paths` in any tsconfig, no `$/` alias, no `../`:  same-folder peers stay `./Peer`.
  - This repo's names, by its `exports` (above, "Overview"):  TypeScript reads them as SOURCE,
    through the `spell-app-source` condition ([tsconfig.json](tsconfig.json)'s `customConditions`).
  - Another repo's:  `tsc` reads its BUILT DECLARATIONS, which `yarn ts` rebuilds first where stale
    (`spell-types --below`);  Vite, Vitest, `tsx` and node read its source.
  - Plain node (no `tsx`:  a Vite config's run-time lookups, `createRequire().resolve()`) adds no extension.
    - a file by its name WITH `.ts`:  `spell-kit/element-tools/RootCatalog.ts`
    - a folder by its barrel's entry
  - This repo's own folders are read by no repo above:  no declarations, no `"spellTypes"`.
- `tsx` reads ONE tsconfig for every file it runs, the one where it runs:
  - the kit's `spell` (its `bin/spell.mjs`):  the kit's `tsconfig.tsx.json`, its node settings over every repo's
    files (`tsx` applies a tsconfig only to the files it includes;  epic `repo-split` I69)
  - the page server:  the kit's `tsconfig.node.json`
  - this repo's scripts, from its root:  [tsconfig.json](tsconfig.json) (`tsx app/scripts/site-data.ts`)
  - `spell run`'s runner:  [tsconfig.node.json](tsconfig.node.json) (`TSX_TSCONFIG_PATH`)
  - each with `target: ES2020`, so spell-lang's standard decorators are lowered
- Global ambient types are the toolchain's, [its types](../src/toolchain/types/index.d.ts).
  - Used bare, no import (WWOD §9 › "Ambient globals used bare").
  - A `tsconfig.json` that wants them names them:  `"types": [..., "spell-kit/toolchain/types"]`.
  - The types:  `Prettify`, `Class`, `AbstractClass`, `SplitString`, `__PACKAGE_VERSION__`;  `vite/client`'s.
- The decorator pre-pass and the version stamp are the toolchain's too:
  `spell-kit/toolchain/decorators`, `spell-kit/toolchain/packageVersion`.
- A string that only NAMES a module is the import name too:
  a page's `SpellUI.packModules` keys (`"spell-ui/core"`, `"spell-kit/element"`),
  the run-time names every page and spell-epic's bundles share.
  - Epic `repo-split` P14, Q45;  the kit's [packModules.ts](../src/element-tools/packModules.ts).

### Paths in the page server's settings

This repo's part of the page server's settings (its `package.json`'s `"pageServer"`) names its folders from this
repo's root (`app/docs`), and another repo's by its path from here:  Spell UI's site bundle, `../spell-ui/site/_assets`.
- The kit's server reads every part from the kit's root, so every folder is inside it (`/spell-ui/docs/`):
  no `/_beside/` mounts any more (epic `repo-split` P16).
- spell-epic's `spell-epic` link at the checkout's root (below, "spell-epic"):
  nothing of spell-app's goes through it any more (epic `repo-split` I42).

## Words, worktrees, shared content, changelog

Every repo's, so the kit's [AGENTS.md](../AGENTS.md) has them:  "Words", "Worktrees", "Shared content", "Changelog".
- This repo's part in them:
  - its epic settings, [.epic/config.json5](.epic/config.json5):  the same content folder as the kit's,
    `../spell.epics`;  its `worktreesFolder` is read only for the worktrees from before the kit
  - its generated files, for `epic worktree merge-main`:  its root `.gitattributes` and
    [the generators list](.epic/generators.json5)
  - its VS Code settings' `search.exclude` ([settings.json](.vscode/settings.json))
  - the parked sagas' tooling, `goals.zip`, at its root

## Commands

As the kit's ([AGENTS.md](../AGENTS.md), "Commands"), plus:

- This repo's own commands are in its [commands.ts](src/cli/commands.ts):
  `spell app create | serve | vscode`, `spell projects`.
- The language commands' work (`spell compile`, `run`, `lint` ...) is here too, behind a hook
  ([cli's AGENTS.md](src/cli/AGENTS.md)).

### spell-epic

- The epic engine is a repo of its own beside this one, `../spell-epic` (epic `epic-eject` P6, 2026-10-17):
  in the kit `spell-kit` (the top repo) since epic `repo-split` P8, a child repo like this one.
  - A Claude Code plugin, holding:
    - the epics package (`spell-epic`, one package laid out as a repo:  `src/`, `tests/`)
    - the `epic` command (`bin/epic`)
    - the hooks (`hooks/hooks.json`) and the window script (`src/window.mjs`)
    - the epic skills (`/epic`, `/isolate`, `/details`, `/bg`, `/send` ... 17 of them) and every template
  - A plain workspace of the kit's install since epic `epic-engine` P10 (`workspace:*` deps, no `.spell-app`
    link, no `portal:`).
  - Its README says how it's laid out and installed.
  - Its rules:  [its AGENTS.md](../spell-epic/AGENTS.md) and [its code's](../spell-epic/src/AGENTS.md).
- LIVE since the switch (epic `epic-eject` I5, 2026-10-18):  this repo carries no copy of the engine.
  - Gone from here:  the epics package and its tests, the window script, the hooks and the epic skills.
  - Make epic changes IN spell-epic, with its own checks (`yarn ts`, `yarn test`, `yarn lint`), and commit there.
  - Claude Code runs its hooks and skills as the installed plugin (`spell-epic@spell-epic`), and puts its `bin/epic`
    on every session's `PATH`;  [the repo's Claude settings](.claude/settings.json) hold no hooks.
- How this repo reaches it:
  - it doesn't, for the page server:  spell-epic declares its own part of the kit's page server's settings
    (epic `repo-split` P16)
  - a git-ignored link at every checkout's root, `spell-epic`, to the spell-epic checkout:
    nothing of spell-app's goes through it since epic `repo-split` I42;
    spell-epic's own linker still lays its pages' links to its code under it (its `RepoList.linkRootOf()`)
  - Where it points:  `engineFolder` in [the repo's epic settings](.epic/config.json5)
    (`../spell-epic`, from the main checkout).
  - `epic shared link` makes it (the worktree hook runs that for every new worktree), only in a checkout whose
    `.gitignore` ignores `spell-epic`:  a branch cut before the switch runs its own copy.
  - The main checkout:  `ln -s ../spell-epic spell-epic`, once (or `epic shared link` there).
  - The old URL bridges that went through it (`MOVED_FOLDERS`, the engine's folders from before `epic-eject`) are
    gone:  the shared pages load `/_epic/...` since `epic-eject` T13.
  - The kit's `spell` reaches spell-epic as a child repo of the kit, not through the link:
    `epic` itself (`epicBin()`), the engine's design tools (`spell design ...`), the commands page's check
    (`spell commands`)
  - The page server's epic route modules, the folders it watches, the engine's routes (`/_epic/assets/`,
    `/_epic/pack/`, `/templates/`) and Epic UI at `/components/epics/` are spell-epic's own part of the kit's page
    server's settings, in its `package.json` ([the kit's server AGENTS.md](../src/server/AGENTS.md)).
  - A kit without spell-epic (CI) loads no epic routes;  the tests that need the engine skip themselves.
- `spell dev` and its old spellings of the epic verbs are gone (epic `repo-split` P13):
  callers say `epic <verb>` (`epic pages <verb>` for the docs tools, `epic ask` for details pages).
  - `spell design <sync verb>` (Spell UI's command) runs the engine's design tool.
  - `spell design bundle | check` run spell-brand's (epic `repo-split` P10).
- The generated files `epic worktree merge-main` rebuilds are this repo's own list, each branch's own:
  [the generators list](.epic/generators.json5) (T4).
  - The engine's own (the docs bundle, the epics pack, Epic UI's data) are spell-epic's to build.
- Its page bundles are built in spell-epic from the MAIN checkouts:
  a worktree's change to Spell UI shows on the epic pages only once it's merged,
  and the bundle rebuilt there (`yarn pack:build`, the docs bundle).

## Solid 2

- `spell`'s editor app, runners and web components are Solid 2, on `spell-ui`.
  - Version `2.0.0-rc.17`, for every package of every repo:  one copy, pinned by the kit's `resolutions`.
  - So is what compiled spell draws (epic `output-targets` P10-P11).
  - React is left only in the `spell` CLI's terminal screens (Ink).
- The rules:  [solid-2.md](../spell.epics/guides/solid/solid-2.md), read IN FULL before Solid work
  (the kit's [AGENTS.md](../AGENTS.md), at its top).
  - NOT `@`-imported on purpose:  it loads only when the task needs it.
  - Claude also has the [solid-2 skill](.claude/skills/solid-2/SKILL.md), which triggers on Solid work.
- The why and the measurements:  [the Solid 2 guide](../spell.epics/guides/solid/solid-2.html).
- The API:  [the Solid 2 cheatsheet](../spell.epics/guides/solid/cheatsheet.html).
- MUST keep `solid-2.md` up to date when a Solid decision changes, or an RC bump changes behaviour.
- How `ui` writes its elements on Solid:  "Solid authoring" in [spell-ui's AGENTS.md](../spell-ui/AGENTS.md).
- House style for app components, on top of `solid-2.md`:  WWOD §17 ([solid.md](agents/wwod/solid.md)).

## Toolchain

As the kit's ([AGENTS.md](../AGENTS.md), "Toolchain:  Vite+"), plus:

- The ONE [vite.config.ts](vite.config.ts), at the root, spreads the toolchain's lint settings in:
  - `packageLint({ react: true })` for the whole repo (the cli's screens are Ink's)
  - the `spell-ui/*` rules on the app's web components (`patternLintIn(["src/app/components"])`)
- The root's `ts`, `test`, `lint`, `lint:fix`, `format` and `format:check` each run over the whole repo
  (epic `repo-split` P14:  no `"spellFolders"` any more);  `review` runs them one after another.
  - `ts`:  the lower repos' declarations first (`spell-types --below`), then `tsc` over the two programs
    (`tsconfig.json`, `tsconfig.node.json`) and the tests' two (`tests/`, `tests/app/`).
  - `test`:  Vitest, a project per folder ([vitest.config.ts](vitest.config.ts)), then spaces' Python tests (pytest).
  - `lint`:  oxlint over `src`, `tests`, `scripts` and `app`, then ruff;  `format`:  oxfmt, then ruff format.
    - spaces' Python is a uv project, `src/spaces/server/py/`:  `uv run --directory src/spaces/server/py ...`.
  - One folder's tests:  `yarn vp test run --project spaces`.
    - The projects:  `spaces`, `lsp`, `app:node`, `app:browser`, `cli`, `spell`, `vscode`;
      and `vscode:elements`, the extension's elements help, by its own [config](vscode/vitest.config.ts).
  - No more `yarn workspaces foreach`, nor `vp run -F`:  the repo is one workspace of the kit's install.
- `yarn vitest` here (and the VS Code vitest extension) reads the same [vitest.config.ts](vitest.config.ts).

## Long-term debt

The three logs, and what goes in each:  the kit's [AGENTS.md](../AGENTS.md), "Long-term debt".
- This repo's entries go under its packages' sections (`## app` ...).
