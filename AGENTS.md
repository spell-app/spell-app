# AGENTS.md

This file guides AI coding agents (Claude Code, Codex, and others)
working with code in this repository, `spell-app`.

**ALWAYS, before any code:  READ [WWOD](agents/wwod/WWOD.md), "What Would Owen Do?", the house style.**
- It covers process, style, naming, imports, errors, comments,
  functions, types, classes, decorators, CSS, tests ...
- Its table names the spoke to read for what you're touching.

**If working with Solid (2.0):  READ [the Solid 2 rules](../spell.epics/guides/solid/solid-2.md) IN FULL FIRST.**
- Solid work is any of:
  - components, JSX, effects / signals / stores
  - `core` rendering, `spell-kit/util` reactivity
  - `spell-ui` elements
  - any React-to-Solid step
- Solid 2 is neither React nor Solid 1,
  and guessing from either produces wrong code.

**If asked for a new skill or `spell` command, or about to add, rename or remove a yarn script:
READ [the commands guide](../spell.epics/guides/dev/commands/commands.md) FIRST,**
and suggest where it belongs before building it (see "Commands").

## Overview

- spell-app:  Spell's editor and its servers.
  - The editor app, `<spell-app>` / `<spell-editor>`, the runner;  spaces, where projects and people live;
    the language server;  the `spell` CLI;  the page server's Spell layer;  the spell language's VS Code extension.
  - Since epic `repo-split` P8 it holds only those.
    Every other package is in the kit, or in a repo of its own beside this one (below, "The other repos").
- It's a CHILD REPO of the kit `spell-kit` (the top repo), at `~/www/spell/spell-app/`.
  - The kit holds the ONE install for every repo:  no `yarn.lock` here.
    - `yarn install` at `~/www/spell`, never here.
    - Its rules across repos:  [the kit's AGENTS.md](../AGENTS.md).
  - ONE npm package, `spell-app` (epic `repo-split` P11, Q36;  unscoped):
    its root [package.json](package.json), one version.
    - ALL its code is under ONE [src/](src/), a folder each (`app`, `spaces`, `lsp`, `cli`, `page-server`).
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
        - the cli, the page server's routes, spaces' servers, the language server's process
        - the app's docs-data tools, the scripts and configs
    - ONE [vite.config.ts](vite.config.ts) (lint, format),
      and ONE [vitest.config.ts](vitest.config.ts), a project per folder.
    - Beside `src/`:
      - the app's build folder `app/`:  its Vite configs, `index.html`, `scripts/`, docs pages and builds
      - the `@spell` space's built-in projects, in `spaces/@spell/`
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
    the app's two are `app:node` and `app:browser`.
  - [The tests' tsconfig](tests/tsconfig.json) checks them with node's settings;
    [the app's tests' one](tests/app/tsconfig.json), with the app's (Solid's JSX).
  - Spell's frozen test projects (`@spell/test`) are NOT here since P8:
    they're [spell-lang's](../spell-lang/tests/spaces/@spell/test/).
    - spell's own tests read them, and a lower repo may not read a higher one's files.
    - spaces reads them DOWN, through the installed `spell-lang/spell` (its environment's `tests` space folder).
- This file holds what's about THIS repo:  packages, worktrees, changelog, commands, toolchain, ledgers.
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
| [page-server](src/page-server/AGENTS.md) | `spell-app/page-server` | `PS` | what only spell-app's page server does, as a route module on the kit's generic one (`spell-kit/server`):  building its bundles, the shared pages' bridges (below) |
| `vscode/` | | | the spell language's VS Code extension (below) |

More on some of them:
- The VS Code extension, [vscode/](vscode/), is its own yarn project, NOT part of the `spell-app` package:
  its own `package.json` and `yarn.lock`.
  - `spell app vscode` builds and installs it.
  - Or its two steps:  `spell app vscode build`, then `install`.
  - Its language server runs lsp's source, [server.ts](src/lsp/server.ts), with `tsx`, from the checkout's root
    (`LSP_SERVER`, [extension.ts](vscode/src/extension.ts)).
    - A checkout from before epic `repo-split` P14 (`lsp/src/server.ts`) doesn't run:  it says so, naming the file.
  - Whose lsp:  the WINDOW's spell-app checkout, found when the server starts, so one install works everywhere:
    - the `spell.parserRoot` setting, if set
    - else the window's folders, the worktree's before the main checkout's
      (a folder that is spell-app, holds it, or is inside one)
    - else, last, the checkout it was built in
    - The extension's output says which it picked;  the code is `findSpellApp()` ([spellAppRoot.ts](vscode/src/spellAppRoot.ts)).
  - In `.tsx` / `.jsx` files it also gives custom elements' slot, part and dashed-attribute help
    ([ElementsHelp.ts](vscode/src/ElementsHelp.ts), the kit's `JsxElementHelp` bundled in, with TypeScript 6 to read JSX);
    and it carries Spell UI's and the brand's HTML and CSS data, copied in by its build:
    a vocabulary change shows there after `spell app vscode`.
  - The Review tab, the Epic Docs view and the window bridge are spell-epic's own extension, not this one.
- page-server:  spell-app's own part of its page server, a route module on the kit's (`spell-kit/server`).
  - building the bundles it serves (`BundleBuild`, with spell's own CLI)
  - the offline highlight.js swap, and the shared pages' bridges (the engine's old folders, `/ui/`)
- COMPONENT SETS (epic `epic-workflow` P10;  one layout since `people-and-orgs` P18):
  a set of elements and their docs pages in Spell UI's page shape, tracked with their repo.
  - In the set's package:
    - `components/`:  the elements (this repo's:  `src/app/components/`)
    - `docs/`:  ONE flat folder of pages (this repo's:  `app/docs/`);  an element's page is its tag, `epic-item.html`
      - `__parts/`:  every page's frame
      - `__data/`:  the side column's data
  - Served at `/components/<set>/` by this repo's page server,
    which lays a build of Spell UI's site over the folder at `_assets/`.
    - The list:  `componentSets`, in the root `package.json`'s `"pageServer"`.
  - The sets:
    - Spell UI:  [spell-ui's docs/](../spell-ui/docs/), at `/components/ui/`
    - Epic UI:  [spell-epic's docs/](../spell-epic/src/docs/), at `/components/epics/`
    - App UI:  [app's docs/](app/docs/), at `/components/app/`:  this repo's only one
    - Brand UI:  [spell-brand's docs/](../spell-brand/docs/), at `/components/brand/`
  - A set that's a component PACK (epics, brand) is built by the kit's pack tooling, `spell-pack build`
    ([ComponentPack.ts](../src/element-tools/ComponentPack.ts)):  each pack's `yarn pack:build`.
    `spell pack build <pack>` calls the same tool, and finds the brand's pack in `../spell-brand/`.
  - The top bar's Spell/UI, Epic/UI and App/UI tabs;  the brand's set lights the Brand tab.
    - The tabs are settings too:  `siteTabs`, in the root `package.json`'s `"pageServer"`, in the bar's order, each
      naming what lights it (epic `repo-split` I4;  [the kit's server AGENTS.md](../src/server/AGENTS.md)).
      The kit's header names none of them;  [siteTabs.test.ts](tests/page-server/siteTabs.test.ts) pins them.
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
| spell-lang | `spell-lang`:  `spell-lang/parser`, `markdown`, `core`, `py` and `spell`:  the parser, the language, its runtime and its writers;  and spell's frozen test projects | [AGENTS.md](../spell-lang/AGENTS.md) |
| spell-ui | `spell-ui`:  Spell UI, Fomantic UI reborn as `ui-*` custom elements, and its docs site | [AGENTS.md](../spell-ui/AGENTS.md) |
| spell-brand | `spell-brand`:  Claude Design's pages and tokens, their Spell UI copies, the `<brand-*>` pack | [AGENTS.md](../spell-brand/AGENTS.md) |
| spell-epic | `spell-epic`:  the epic engine, a Claude Code plugin (below, "spell-epic") | [AGENTS.md](../spell-epic/AGENTS.md) |

- spell-app is the highest code repo.
  - It NEEDS spell-lang, spell-brand, spell-ui and the kit:  it imports them.
  - It RUNS spell-epic, by its page server's settings only (its route modules and folders):
    no spell-app source imports it.
  - No repo below imports spell-app:  every arrow points down.

### Which folder may import which

One change may touch several folders, but dependencies flow ONE way:

```text
cli -> app -> lsp -> spaces             (this repo's)
app / cli -> spaces                     (the app:  spaces' models only, never server/node)
lsp -> spaces                           (its node files:  projects on disk, in `SpellDiskWorkspace`)
page-server -> spell-kit/server        (its route module runs on the kit's generic page server)
any folder here -> any repo below       (by npm name:  spell-lang/spell, spell-ui/core ...)
```

- `spaces` (epic `people-and-orgs`):  where projects and people live, and the servers that serve them.
  - NEVER make it import the app, lsp or cli folders.
  - Its models (`spell-app/spaces`) are safe in a browser.
  - `spell-app/spaces/server/node/...` is node only, imported file by file.
  - The page server loads its route module by PATH (the root `package.json`'s `"pageServer"`), not by import.
  - Spell's project groups (`@spell/examples`, `owen@spell` ...) are spaces'.
    Loading `spell-app/spaces` registers them with spell,
    so every program that reads a spell path loads spaces first ([spaces' AGENTS.md](src/spaces/AGENTS.md)).
  - Owen's own projects are NOT in git:  they're in spell.spaces, `../spell.spaces` beside this repo in the kit,
    one folder for main and every worktree (`SPELL_SPACES_DIR` sets it;  `../spell-spaces` before epic `repo-split` P8).
  - Folders of other repos it needs at run time (spell's `src/`, the core's, the frozen test projects) it finds by
    PACKAGE, through `node_modules` (`environment.packageFolder("spell-lang/py")` ...), never by a path into that repo.
- `page-server`:  NO folder imports it;  the page server loads its route module by PATH, from its settings.
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
  - the kit's `spell` (its `bin/spell.mjs`) and the page server, the kit's `tsconfig.node.json`
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

### Folders beside the checkout

The page server's settings, the root `package.json`'s `"pageServer"`,
name folders of the other repos by their paths from this repo's root:

- component sets' pages and Spell UI's site bundle:
  `../spell-ui/docs`, `../spell-ui/site/_assets`, `../spell-brand/docs`, `../spell-epic/src/docs`
- engine routes:  `/_epic/assets/` from `../spell-epic/src/tools/_assets`, `/_epic/pack/`, `/templates/`;
  `/_brand/assets/` from `../spell-brand/assets` (the brand's logo, fonts and reference images, epic `repo-split` P10)
- route modules:  `../spell-epic/src/tools/detailsRoutes.ts` ...
- bundles:  `../spell-ui/site/_assets`, `../spell-brand/_assets/ui`
- How they're served:  the kit's page server (`spell-kit/server`) mounts each folder outside the checkout on its own,
  at `/_beside/<path>/` (`/_beside/spell-ui/docs/`).
  The component sets' and engine routes' addresses lead there.
  - Only the folders the settings name:  never the kit whole.
  - From a worktree's address (`/worktrees/<w>/`), a folder beside is still the MAIN checkout's:
    the server doesn't serve the epic worktree's own copy of the other repos yet.
- spell-epic's `spell-epic` link at the checkout's root (below, "spell-epic"):
  nothing of spell-app's goes through it any more (epic `repo-split` I42).

## Words

- Each kind of page has ONE name (Owen, 2026-10-14, epic `epic-workflow` P14).
  - Write these, in docs, skills, comments, labels and messages:
    epic page, saga page, details page, review page, choice page, guide, cheatsheet, commands page,
    components page, components guide, brand page, home page, list page, changelog, template.
  - What each one is, and where it lives:  "Page kinds" in [spell-epic's AGENTS.md](../spell-epic/src/AGENTS.md).
- Owen still says the older words.  Read them as the new ones, but write the new ones:
  - "plan doc", "epic doc" -- the epic page
  - "epic name" -- the epic id (its folder, `epics/<epic-id>/`)
  - "durable doc" -- the epic's guide;  "syntax-choices page" -- a choice page;
    "analysis page" -- a review page;  "docs index", "docs home" -- the home page;
    "goal", "goals page" -- a saga (an epic of epics), a saga page
- Names only code reads keep the old words:
  - `<epic-id>.plan.html`, `PlanDoc`, `plan-doc.md`
  - spell-epic's `yarn plan-doc` (the `epic` tool in its own order)
  - So does the record:  log entries, quotes, commit messages.
- Pointing at a saga, an epic or an item (epic `epic-workflow` P15, J32):
  - In Owen's prompts, "saga drawable-spell" names a saga, and a SHORT ADDRESS names a saga, an epic or an item:
    `SAGA:/drawable-spell` (the saga page), `SAGA:/drawable-spell/python-target#T1` (item T1 of that epic).
    - The colon form (`SAGA:/drawable-spell:python-target#T1`) means the same;  ids in any case.
  - Resolve one with the openers, which take an address:
    `epic pages open SAGA:/...` shows it, `epic pages link SAGA:/... --show` gives its links.
  - In pages, write `<epic-link epic="python-target" item="T1"></epic-link>`, not a path;
    a plain `<a href="SAGA:/...">` works too.  The rules:  [spell-epic's AGENTS.md](../spell-epic/src/AGENTS.md), "Links".

## Worktrees

### Windows

- Owen works in VS Code windows opened from their WINDOW FILES, `<pkg>.code-workspace`.
  - They live in the content repo's `windows/` folder, not in this repo (epic `epic-eject` P13):
    `../spell.epics/windows/`, each machine's own, git-ignored there.
    - Where:  `windowsFolder` in [the repo's epic settings](.epic/config.json5);  `epic config windowsFolder` prints it.
    - A worktree's window file is in its `ongoing/` folder.
    - Before P13 they were this repo's `workspaces/`, tracked and marked `skip-worktree`:
      `epic window move` carried them over once.
  - `epic window init` writes missing ones, and brings the rest up to date.
  - Each has its own theme.
- Each window shows the WHOLE branch:
  - folder 1 is the KIT's root, `~/www/spell` (since epic `repo-split` P9), then the shared content repo
    - a worktree's window:  the kit's root, the worktree (`⎇ <name>`), the content repo
  - no package folder since 2026-10-06
  - Why the kit first:  the Claude panel lists only the sessions saved under a window's FIRST folder,
    so every window lists every session, of every repo.
  - So sessions start at the kit's root:
    read the repo's and the folder's `AGENTS.md` before working in one.
- Each file shows ONCE in Explorer and Quick Open:
  - The window's `files.exclude` shows the shared links only under `spell.epics`
    ([filesExclude()](../spell-epic/src/window.mjs) writes it).
  - A worktree's window hides the main root's files (beside its git-ignored `.spell-main` marker).
  - `search.exclude` in [the repo's VS Code settings](.vscode/settings.json)
    keeps generated files, icons and screenshots out of Quick Open and Find.

### Entering one

- Enter a worktree with `/isolate <name>` (`/epic` does it too), or with Claude's own `EnterWorktree`.
- The `WorktreeCreate` hook ([worktree.mjs](../spell-epic/hooks/worktree.mjs), spell-epic's plugin's):
  - makes an epic's worktree on its own branch, `<name>`, from local main:
    a worktree of the kit at `~/www/spell.worktrees/<name>/`, with a worktree of each child repo inside it
    - which folder and branch:  `worktreesFolder` and `baseBranch` in the KIT's epic settings,
      which win over [this repo's](.epic/config.json5) (`EpicConfig`;  `epic config` prints them)
    - older worktrees, made before the kit, are still found in `.claude/worktrees/<name>`
  - keeps the session saved at the root
    (Claude's own worktrees move it, and it drops out of every window's list)
- New window, or stay?
  - `epic window should-stay` recommends one, with reasons, and Owen picks in a modal
    ([the isolate skill](../spell-epic/skills/isolate/SKILL.md), "Start", step 2b).
  - Staying is fine when the session is its window's only one.
  - A session that stays:  same tab, only its folder changes.
    - Its changes show in Source Control,
      since every package window has `git.detectWorktrees` on (each worktree its own repo there).
    - The window is titled `⎇ <name>` and its title bar tinted at once (`epic window stay <name>`).
    - Both are put back at `/isolate done`.
  - NEVER add a worktree's folders to a package window (`epic window add`).
    - VS Code writes them into the window file,
      and they stay there after the worktree is gone (three did, by 2026-10-03).
    - Nobody sees them:  the window files are in no git repo.

### A new window

- Open it at once, from the worktree's root:  `epic window open <name>`.
- On leaving (`/isolate done`), the session does NOT move back:  it stays in that window, which Owen closes.
  - `... close <name>` closes it and deletes its file.
- Then `... handoff <name> --prompt continue`.
  When the turn ends:
  - the session moves to that window, in an editor tab (never the sidebar)
  - `continue` is typed into it
  - its old tab closes (the `Stop` hook, [handoff.mjs](../spell-epic/hooks/handoff.mjs))
- So END THE TURN right after `handoff`:  the rest (`yarn install` ...) happens in the new window.
- The old tab is found by the session's title.
  - The `UserPromptSubmit` hook, [prompt-gate.mjs](../spell-epic/hooks/prompt-gate.mjs), renames the session
    on `/isolate <name>`, `/epic <name>` and `/unpark <name>`.
  - The hook also blocks those prompts in plan mode or inside another worktree,
    saving their text to `~/.spell/prompts/<name>.md` first.
  - Except `/epic <name>` inside another worktree:  it means "open a window for `<name>`",
    so Claude offers one.
    - `epic window launch <name>`:  a NEW session there.
      - Its window already open (epic `epic-eject` P10, Owen's r2):
        - the window's file and look stay as they are
        - the epic's running session there is typed into;  a new one starts only when none runs
    - The epic skill's "From another worktree" has the steps.
- The window's file:  `<name>.code-workspace`, in the windows folder's `ongoing/` (above, "Windows").
  - Its look:  that of the window it's opened from, or the one asked for.
  - `/epic <name> -purple`:  Tomorrow Night Blue's look in one of 12 hues (`epic window color`).
  - `/epic color <look>` recolours the window you're in, live.
  - Its folders:  the MAIN repo root first (so its Claude panel lists every session),
    then the worktree's root (`⎇ <name>`), then the shared content repo.
  - The main root's files are hidden (above).
- Why:  Owen reviews in VS Code;  edits a window doesn't show are invisible there.
- `epic window` works in a fresh worktree, before its `yarn install`.
  - The `spell` link runs the MAIN checkout's CLI, which has its packages.
  - `yarn` couldn't run it:  yarn runs no script there before `yarn install`.
- A doc shown while the move is pending waits, then shows beside the session in the window it moved to.
  - That's `epic open <name> --review` or `epic window show`.
- A running epic's epic page is shared (see "Shared content"):  ONE file, the same in every checkout.
  - So the MAIN checkout's page server shows it too,
    listed on the Epics list page with the merged ones.
  - `spell server url` gives that URL ([the page server guide](../spell.epics/guides/server.html), "Running epics").
- NEVER `code --add` / `--remove`:
  they act on the focused window, and a one-folder window restarts its extensions, Claude panel included.
- NEVER `code -r`:  it restarts the session.
- `code <file>.code-workspace` only through `epic window open`.

### Leaving, merging, shelving

- Leave with `ExitWorktree` `keep`.
  - The hook's `remove` never deletes uncommitted or unmerged work.
- Merge main into a branch with `epic worktree merge-main`, never a bare `git merge main`.
  - It REGENERATES each generated file both sides changed, from the merged source:
    bundles, site and brand data, snapshots, `yarn.lock`.
  - It stops on any other conflict;  `--continue` once they're resolved and added.
  - Those generated files are marked in the root `.gitattributes`:
    - `merge=binary`:  never line-merged
    - `-diff`, when minified
    - `linguist-generated`:  collapsed in GitHub's PR diffs
  - A new committed generated file:
    add it there AND to [the generators list](.epic/generators.json5)
    (each branch's own, read by `MainMerge`).
  - NOT committed at all (since 2026-10-07):  the bundles only the page server serves,
    whose hashed chunk names churned every diff.
    - Spell UI's docs site:  its `_assets/`, in [spell-ui's site](../spell-ui/site/)
    - the brand pages':  `_assets/ui/`, in [spell-brand](../spell-brand/)
    - They're git-ignored.
      The page server builds the stale ones when it starts, and a page waits for them.
    - By hand:  `spell bundle [--stale]`, or `check`.
    - The code:  `Bundle`, in the kit's `spell-kit/server`.
    - A merge untracks any `main` still commits.
  - It reports snapshot entries with a value NEITHER side had:
    new behaviour nobody reviewed;  show them to Owen.
  - NOT `merge=ours`:  it drops the other side's changes silently,
    and GitHub ignores merge drivers anyway.
- Shelve a session's work while another session changes what it depends on:
  - `/park`:  a WIP commit in its own worktree, plus a `PARKED-<name>.md` note
  - `/unpark`:  pick it back up
  - `/wait-for <other>`:  wait for that session to finish, then merge `main` in and carry on by itself
- Say so in one line:
  "isolated in worktree <name> (branch <name>), open in its own window, ⎇ <name>",
  or "..., staying in this window".

## Shared content

- These root folders are NOT tracked by spell-app, and page URLs follow them (`/epics/seo/seo.plan.html`).
  - Epic `shared-content` made them, live since 2026-10-04.
  - Epic `claude-design` P4 split them into root folders, 2026-10-05.
- The folders:
  - `epics/` -- epic pages, `epics/<name>/<name>.plan.html`, with their inboxes and details pages
  - `guides/` -- every other docs page ([the Solid 2 guide](../spell.epics/guides/solid/solid-2.html), say),
    with its Markdown, JSON and `experiments/`
  - `pages/` -- [the docs' home page](../spell.epics/pages/index.html), and the scratch details pages, `pages/details/`
  - `ui/` -- Spell UI's hand-written docs pages (claude-design P6), LEFT for the other checkouts.
    - Since epic `people-and-orgs` P18 they're in [spell-ui's docs/](../spell-ui/docs/), served at `/components/ui/`.
    - This branch's page server answers "not found" for `/ui/`;  the merge removes the folder (that epic's T3).
  - `brand/` -- the Brand tab's pages ([spell-brand's AGENTS.md](../spell-brand/AGENTS.md)):
    Claude Design's exports and their Spell UI copies
  - `sagas/` -- the SAGAS, each an epic of epics (epic `epic-workflow` P15):
    - `sagas/sagas.json5`:  the list, in Owen's order;  changed only through `epic saga ...`
    - `sagas/<id>/<id>.saga.html`:  each saga's page
    - `sagas/index.html`:  the Sagas list page, the top bar's tab
    - an epic names its saga with `<epic-page saga="<id>">`, a guide with `<meta name="spell-saga" content="<id>">`
  - `goals/` -- the first saga pages (once goal sets), PARKED since 2026-10-11 (epic `epic-workflow` P6):
    read only, buttons saying TODO.
    Their tooling is in `goals.zip`, at this repo's root (`packages/goals.zip` before epic `repo-split` P8);
    epic `epic-goals` rebuilds it ([the parked sagas guide](../spell.epics/guides/goals/goals.html)).
  - `agents/` -- one copy of the logs for every repo and branch:
    - the three logs:
      [PAPERCUTS.md](agents/PAPERCUTS.md), [SUSPECTED-BUGS.md](agents/SUSPECTED-BUGS.md),
      [CODE-DEBT.md](agents/CODE-DEBT.md)
    - WWOD, the house style (`agents/wwod/`):  tracked in the kit since epic `repo-split` P9;
      the copy here stays for the checkouts from before the split, until it's deleted

### How they're linked

- They're ONE shared content repo, the same for main and every worktree.
  - It's `../spell.epics`, beside the main checkout in the kit `spell-kit`:  an ordinary git repo, local only.
    - `~/www/spell/spell.epics` (epic `repo-split` J5;  `../spell-app.epics` before).
  - Where it is:  `contentFolder`, in [the repo's epic settings](.epic/config.json5) (epic `epic-eject` P4).
    `epic config contentFolder` prints it.
  - So every worktree sees every edit at once:  no per-branch copy, and these files never conflict on merge.
- Only `agents/` is linked in at every checkout's root, a folder SYMLINK (epic `epic-eject` P12):
  the instructions name `agents/...` from the checkout.
  - Since epic `repo-split` P9 it links to the kit's `../agents/`,
    made by every `yarn install` in the kit (its `postinstall`):
    WWOD, tracked there, and links to the three logs in the content repo.
  - Folders, never single-file links:  Claude's Edit refuses to write through a link to a file.
  - The rest (`epics`, `guides`, `pages`, `brand`, `ui`, `goals`, `sagas`) are found in the content folder itself:
    - the page server serves it at `/`, after the checkout's own files, and under every worktree's address
      (`serveContent()`, [the kit's server AGENTS.md](../src/server/AGENTS.md))
    - the tools read it from the epic settings (spell-epic's `EpicConfig`, the kit server's `contentFolderOf()`)
    - a checkout cut before P12 still links them in, by its own manifest, until it merges `main`
- Claude edits shared files at their REAL path, from main or any worktree.
  - That's `$(epic config contentFolder)/<path>`:  `/Users/owen/www/spell/spell.epics/<path>`.
    - `/Users/owen/www/spell-app/spell-app.epics/<path>` before epic `repo-split` P9.
  - E.g. `.../spell.epics/agents/PAPERCUTS.md`.
  - A worktree session's Edit / Write refuses a path through the links, before any hook could step in.
    It says "Edit the worktree copy of this file instead of the shared-checkout path":
    there is no worktree copy.
  - Reading goes through `agents/` as usual;  every other shared file by its real path.
- The manifest has two parts:
  - the root `package.json`'s `"shared": { "links" }`
    (its old `"dir"` is the epic settings' `contentFolder` since epic `epic-eject` P4)
  - the `# shared:start` ... `# shared:end` block in `.gitignore`
  - A checkout's links are its OWN branch's manifest's:
    `epic shared link` after merging a manifest change.
- Old paths last until every checkout has merged the reorg (claude-design T1).
  - The shared repo's old docs folder holds a link per old entry into the root folders,
    so older code still finds its files there:

    ```text
    packages/docs/content/epics -> ../../../epics
    packages/docs/content/solid -> ../../../guides/solid
    ```

  - The old URLs, `/packages/docs/content/<x>`, answer "not found":
    the page server redirects none since `people-and-orgs` P16 (Q30).
  - Older code writes old-style links, and pages at old paths.
    - The repair that moved them (`epic shared repair`, once also the first step of every turn's
      `epic shared commit`) is gone since epic `repo-split` Q45:  its work is done.

### Commits

- The shared repo is committed by itself after every Claude turn.
  - The `Stop` hook, [shared-commit.mjs](../spell-epic/hooks/shared-commit.mjs), runs `epic shared commit`.
  - Nobody commits those files by hand.
- One commit per place the files live:
  - `auto: epic <name>`
  - `auto: guides/<folder or file>`
  - `auto: goals/<set>`
  - `auto: agents`, and likewise for pages, ui and brand
  - else `auto: other`
- Trailers:
  - `Turn-end: <checkout>`:  whose turn swept them up, NOT their author.
    Any turn commits every session's pending edits.
  - `Session:`
- NEVER touch the shared paths in spell-app with any of these:
  - `git add`
  - `git checkout --`
  - `git restore`
- NEVER run git inside a shared folder (`epics/`, `guides/` ...):
  it's the shared repo there.
  Run it in the spell-app checkout.

### Commands and tips

- `epic shared status | init | link | commit | migrate <worktree>`
  - `--dry-run` on `migrate`
- A new worktree is linked by the `WorktreeCreate` hook.
- A worktree cut before the cutover runs `epic shared migrate <name>` before it merges `main`.
  - First it merges `0fc52e02` (main just before the cutover), if it predates the docs move.
- After merging a branch from before the docs move, `epic shared repair` used to tidy up after it.
  It's gone since epic `repo-split` Q45, its work done:
  - It moved pages the branch left in the old docs package's folder into their shared folders.
  - It fixed links (and their tab names) written for an old layout.
  - And the docs package's end (`people-and-orgs` P16):
    the shared pages' links into its old tools folder now point into spell-epic's [src/tools/](../spell-epic/src/tools/)
    (`relocate.js relink`, run once).
- Shared docs may link code another branch has and this one doesn't yet:
  `doc-links.js --check` reports those as missing in this checkout.
- Package windows show `spell.epics` as a folder, with its own Source Control:  the auto commits.
- Searching:  the links are git-ignored.
  - `grep -R` follows them (`grep -r` doesn't).
  - `rg` needs `-L --no-ignore-vcs`.
  - Or search `../spell.epics`.
- Plan-doc item fixes carry the epic's name:  `<epic> I3:  ...`.
  - Phase commits stay `P3:  <phase name> -- ...`.

## Changelog

- [The changelog](../spell.epics/guides/changelog.html):  what the repo shipped, newest first.
- MUST be kept up to date by every `/isolate` and `/epic`:
  - `/epic`:  at its Doc Review, add the entry to "2. In worktrees".
    When it merges into `main`, move it under its month in "3. Merged into main".
  - `/isolate done`:  before merging into `main`, add an entry for what the branch shipped.
    Skip a branch with nothing worth a reader's time:  typo fixes, a papercut.
- It's shared (see "Shared content"):  write an entry straight into it, from any checkout.
  - No branch commit, no merge conflicts:  the `Stop` hook commits it.
- An entry is one nested `<ui-section>` under its month, newest first.
  - Its markup:  `<ui-section id="<epic or worktree name>" header="YYYY-MM-DD · Title">`.
  - The page's header comment has the markup in full.
  - Inside, a `spell-meta` list with LINKS:
    - the epic page:  `epics/<name>/<name>.plan.html`, with `target="<name>"`
    - the guide
    - the branch
  - Then EVERYTHING it shipped, one bullet each, by phase when there are phases -- not a summary.
- Then finish the page as [spell-epic's AGENTS.md](../spell-epic/src/AGENTS.md) says ("Finishing a page"),
  and bump its footer's date.

## Commands

- Three ways to make the repo do something:  the `spell` CLI, Claude skills, yarn scripts.
- Their map, one row per operation:  [the commands page](../spell.epics/guides/dev/commands/commands.html).
  - Its data:  `commands.json5` beside it.
  - Shown by the page server:  `epic pages open guides/dev/commands/commands.html`.
- Target:  the CLI drives everything.
  - Repo tools are `spell <noun> <verb>`:  the kit's `spell`, every repo's commands under one name.
    - e.g. `spell server start`, `spell pack build`, `spell app vscode`
  - Skills keep judgement and dialog, and call it.
  - Yarn keeps each folder's own scripts (at the root:  the app's unprefixed, the others' prefixed, `lsp:start`),
    and aliases the rest.
- Owen asks for a new skill or `spell` command, or you add a yarn script to solve a problem:
  - READ [the commands guide](../spell.epics/guides/dev/commands/commands.md).
  - Then SUGGEST, before building:  where it belongs, its name, what it replaces,
    which roadmap move it advances.
- MUST keep the page true in the same change:  `commands.json5`, then `spell commands check`.
  - `commands.json5` and `commands.md` are shared, but the check reads each branch's CLI.
  - So a branch adding a command can make main's check fail until it merges
    ([the code-debt log](agents/CODE-DEBT.md), "docs").
- Tools are TypeScript (or node JS in [the docs tools](../spell-epic/src/tools/)), never python:  one language.
- Skills reach them as `spell ...` (and the epic tools as `epic ...`).
  - `spell` is the link `yarn cli:install` makes, once per machine, at the KIT's root:
    the kit's [spell.mjs](../bin/spell.mjs) (epic `repo-split` P13;  this repo's `cli/` until then).
  - Without it:  `node ../bin/spell.mjs ...` from this repo's root.
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
  - its page server's settings name its folders beside this repo, `../spell-epic/...`
    (above, "Folders beside the checkout")
  - and a git-ignored link at every checkout's root, `spell-epic`, to the spell-epic checkout:
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
  - Beside it, by the settings:
    - the page server's epic route modules and the folders it watches (the root `package.json`'s `"pageServer"`)
    - the engine's routes, `/_epic/assets/` and `/_epic/pack/`, and Epic UI at `/components/epics/`
      (`engineRoutes`, `componentSets`;  [the kit's server AGENTS.md](../src/server/AGENTS.md))
    - its route modules import by package name, as this repo's do:
      `spell-epic/...`, `spell-kit/server` (epic `repo-split` P14)
  - A checkout without spell-epic beside it (CI) loads no epic routes;  the tests that need the engine skip themselves.
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
  - Version `2.0.0-rc.13`, for every package of every repo:  one copy, pinned by the kit's `resolutions`.
  - So is what compiled spell draws (epic `output-targets` P10-P11).
  - React is left only in the `spell` CLI's terminal screens (Ink).
- The rules:  [solid-2.md](../spell.epics/guides/solid/solid-2.md) (see the top of this file).
  - NOT `@`-imported on purpose:  it loads only when the task needs it.
  - Claude also has the [solid-2 skill](.claude/skills/solid-2/SKILL.md), which triggers on Solid work.
- The why and the measurements:  [the Solid 2 guide](../spell.epics/guides/solid/solid-2.html).
- The API:  [the Solid 2 cheatsheet](../spell.epics/guides/solid/cheatsheet.html).
- MUST keep `solid-2.md` up to date when a Solid decision changes, or an RC bump changes behaviour.
- How `ui` writes its elements on Solid:  "Solid authoring" in [spell-ui's AGENTS.md](../spell-ui/AGENTS.md).
- House style for app components, on top of `solid-2.md`:  WWOD §17 ([solid.md](agents/wwod/solid.md)).

## Toolchain:  Vite+

- One dev dependency, `vite-plus` (command `vp`), pins these together:
  - vite (as `@voidzero-dev/vite-plus-core`)
  - vitest, oxlint, oxfmt and tsgolint
  - The versions are the yarn `catalog:` in the kit's `.yarnrc.yml` (this repo's `.yarnrc.yml` is a copy of it,
    with no `yarnPath`:  the yarn release lives once, in the kit).
- Node 24 (`engines`).
- Bump them together, in the kit:  `vite-plus` and every `catalog:` entry (the kit's [AGENTS.md](../AGENTS.md)).
  - To what `vp toolchain` lists.
  - NEVER pin one tool on its own.
- Commands, run at the root:

  ```sh
  yarn vp lint
  yarn vp fmt [--check]
  yarn vp test
  yarn vp check
  ```

- `yarn review` is the finishing pass (WWOD §1):  the root's, over every folder (or the kit's, over every repo).
  - It's about the same (`~==`) as all four of these:

    ```sh
    yarn ts + yarn lint:fix + yarn format + yarn test
    ```

- `yarn oxfmt` and `yarn oxlint` don't work:  they're not deps of their own, only `vp`'s.
  - `yarn vitest` does.
- Configs import from `vite-plus` (lint rule `vite-plus/prefer-vite-plus-imports`).
  - Tests:  WWOD §20 › "Test APIs come from Vite+".
- `yarn tsc`, never `npx tsc`:  yarn picks the workspace's TypeScript 7.
  - Why:  a dependency's own TypeScript can take `.bin/tsc`.
    - E.g. ui's `vite-plugin-dts` needs TypeScript 6 (`@typescript/typescript6`).
    - Today `.bin/tsc` is the root's 7, but only by luck of the hoister
      ([the papercuts log](agents/PAPERCUTS.md), "## ui").
- NEVER hard-code `<package>/node_modules/<dep>`:  yarn hoists to the kit's `node_modules`.
  - Node code resolves the package instead (the kit's [NodePackage](../src/element-tools/NodePackage.ts)).
  - Nor `<repo>/node_modules`:  this repo has none, the install is the kit's.
- Lint / format settings:  the toolchain's, `spell-kit/toolchain/lint` ([lint.ts](../src/toolchain/lint.ts)).
  - The ONE [vite.config.ts](vite.config.ts), at the root, spreads it in its lint and fmt blocks:
    - `packageLint({ react: true })` for the whole repo (the cli's screens are Ink's)
    - the `spell-ui/*` rules on the app's web components (`patternLintIn(["src/app/components"])`)
  - No `.oxlintrc.json` / `.oxfmtrc.json` any more.
  - Our own rules, two JS plugins beside [lint.ts](../src/toolchain/lint.ts):
    - `lint.patterns.ts`:  its rules, `spell-ui/*`, guard Spell UI's patterns in component files:
      "The lint guard" in [spell-ui's AGENTS.md](../spell-ui/AGENTS.md).
    - `lint.imports.ts`, everywhere:
      - `spell/no-parent-import` fails a module path starting `../` that lands in a package's `src/` (any repo's):
        its fix is the package name + path under `src/`;  `../` to a file outside `src/` (a config) is fine
    - Their tests:
      - spell-ui's [LintPatterns.test.ts](../spell-ui/tests/tools/LintPatterns.test.ts)
      - the kit's [lint.imports.test.ts](../tests/toolchain/lint.imports.test.ts)
- The root's `ts`, `test`, `lint`, `lint:fix`, `format` and `format:check` each run over the whole repo
  (epic `repo-split` P14:  no `"spellFolders"` any more);  `review` runs them one after another.
  - `ts`:  the lower repos' declarations first (`spell-types --below`), then `tsc` over the two programs
    (`tsconfig.json`, `tsconfig.node.json`) and the tests' two (`tests/`, `tests/app/`).
  - `test`:  Vitest, a project per folder ([vitest.config.ts](vitest.config.ts)), then spaces' Python tests (pytest).
  - `lint`:  oxlint over `src`, `tests`, `scripts` and `app`, then ruff;  `format`:  oxfmt, then ruff format.
    - spaces' Python is a uv project, `src/spaces/server/py/`:  `uv run --directory src/spaces/server/py ...`.
  - One folder's tests:  `yarn vp test run --project spaces`.
    - The projects:  `spaces`, `lsp`, `app:node`, `app:browser`, `cli`, `page-server`.
  - No more `yarn workspaces foreach`, nor `vp run -F`:  the repo is one workspace of the kit's install.
- `yarn vitest` here (and the VS Code vitest extension) reads the same [vitest.config.ts](vitest.config.ts).

## Long-term debt

- [The code-debt log](agents/CODE-DEBT.md) tracks structural debt we have knowingly chosen NOT to fix yet.
- It and the other two logs live in `agents/`, shared (see "Shared content"):
  - [the suspected-bugs log](agents/SUSPECTED-BUGS.md)
  - [the papercuts log](agents/PAPERCUTS.md)
  - One file each for every package, with a `## <package>` section per package.
  - Add to your package's section.
- Add a code-debt entry when a problem is structural, too big to fix in passing, and being tolerated deliberately.
  - Especially when a test or lint rule is pinned, skipped or widened to accommodate it.
  - Record the mechanism, not a guess, so nobody rediscovers it.
- NOT for:
  - local cleanups:  an inline `REFACTOR:` marker
  - suspected bugs:  the suspected-bugs log
  - tooling papercuts:  the papercuts log
- See that file's header for the entry format.
- The papercuts log:  anything that slowed down development.
  - Lost time to one mid-session?  Append date · symptom · fix · project.
  - Check it FIRST when tooling fails mysteriously.
- The suspected-bugs log:  something that looks like a bug, but you're not sure.
  Add it under its package.
