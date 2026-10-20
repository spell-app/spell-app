# AGENTS.md

This file guides AI coding agents (Claude Code, Codex, and others)
working with code in this repository.

**ALWAYS, before any code:  READ [WWOD](agents/wwod/WWOD.md), "What Would Owen Do?", the house style.**
- It covers process, style, naming, imports, errors, comments,
  functions, types, classes, decorators, CSS, tests ...
- Its table names the spoke to read for what you're touching.

**If working with Solid (2.0):  READ [the Solid 2 rules](../spell-app.epics/guides/solid/solid-2.md) IN FULL FIRST.**
- Solid work is any of:
  - components, JSX, effects / signals / stores
  - `core` rendering, `$/util` reactivity
  - `@spell-app/ui` elements
  - any React-to-Solid step
- Solid 2 is neither React nor Solid 1,
  and guessing from either produces wrong code.

**If asked for a new skill or `spell` command, or about to add, rename or remove a yarn script:
READ [the commands guide](../spell-app.epics/guides/dev/commands/commands.md) FIRST,**
and suggest where it belongs before building it (see "Commands").

## Overview

- Spell:  the parser, the spell language and its tools, and `@spell-app/ui`.
  - One yarn workspace per folder in `packages/`.
  - Three of the root's yarn scripts run each package's own script of the same name:

    ```sh
    yarn ts    yarn test    yarn review
    ```

  - Every package's TESTS live in `tests/<package>/`, at the same path as the code they test.
    - E.g. core's [saving.ts](packages/core/src/saving.ts) is tested by [saving.test.ts](tests/core/src/saving.test.ts).
    - With their snapshots and test data;  each package's `yarn test`, `yarn ts`, lint and format still cover them.
    - Each package's Vitest finds them (its config's `dir`).
    - A `tsconfig.json` in each package's tests folder gives them the package's own settings and the aliases.
    - Test helpers (`$/spell/test`, `$/ui/test` ...) stay in their packages, for now.
    - Spell's test projects are spaces' test data:  `tests/spaces/@spell/test/`, frozen.
- This file holds what's about THIS repo:  packages, worktrees, changelog, commands, toolchain, ledgers.
  - The house style every package shares is WWOD (`agents/wwod/`, above).
    It's shared content, like the ledgers.
  - Each package's `AGENTS.md` holds only what's local to it.
  - A section there with the same name as one here, or as a WWOD rule, EXTENDS it
    ("As the root's, plus:", "As WWOD §4, plus:").
  - Codex reads every `AGENTS.md` from the root down to its working folder;
    Claude Code loads the root `CLAUDE.md` plus the package's.
    So a rule lives in exactly ONE place.

### Packages

Each folder links to its own `AGENTS.md`:  read it before working there.
- Alias:  how code imports the package, `$/name`, where `$` is the packages folder.
- Namespace:  the package's self-namespace (WWOD §8).

| Folder | Package | Alias | Namespace | What it is |
| --- | --- | --- | --- | --- |
| [util](packages/util/AGENTS.md) | `@spell-app/util` | `$/util` | | helpers `ui` and spell share:  small generic ones (`@proto` ...), and spell's own in `src/spell/` (lodash, `Observable`, `Task` ...) |
| [parser](packages/parser/AGENTS.md) | `@spell-app/parser` | `$/parser` | `P` | the generic rule-based parser;  Rulex is an opt-in side-effect import, `$/parser/rulex` |
| [markdown](packages/markdown/AGENTS.md) | `@spell-app/markdown` | `$/markdown` | `MD` | GitHub-flavoured markdown on the parser, drawing `ui-*` markup |
| [core](packages/core/AGENTS.md) | `@spell-app/core` | `$/core` | `SC` | the runtime compiled spell runs on |
| [py](packages/py/AGENTS.md) | `@spell-app/py` | `$/py` | `PY` | Python's writers (`ts/`) and `spell_core` (`core/`, a uv project) |
| [spell](packages/spell/AGENTS.md) | `@spell-app/spell` | `$/spell` | `SP` | the spell LANGUAGE on the parser, `PARSING.md` and `readme.md` |
| [spaces](packages/spaces/AGENTS.md) | `@spell-app/spaces` | `$/spaces` | `SPACES` | where projects and people live:  the built-in projects (`@spell/`), its models (`models/`, browser-safe:  spell's project groups and lists), projects on disk (`server/node/projects/`), and the servers that serve them, the editor's (`server/node/`) and Python's, `spell_quart` (`server/py/`, a uv project) |
| [lsp](packages/lsp/AGENTS.md) | `@spell-app/lsp` | `$/lsp` | `LSP` | spell's language server (browser-safe) |
| [app](packages/app/AGENTS.md) | `@spell-app/app` | `$/app` | `UI` | the web app, the runner, and the `<spell-app>` / `<spell-editor>` web components;  `yarn start` / `build*` live here;  App UI, the docs pages of its components, in `docs/` (at `/components/app/`) |
| `packages/vscode/` | | | | the VS Code extension (below) |
| [spell-solid](packages/spell-solid/AGENTS.md) | `@spell-app/spell-solid` | `$/spell-solid` | `E` | what makes a custom element on Solid, for EVERY set's elements (Spell UI's, the epics', the app's, the brand's):  the component and DOM element bases, the reactive members' decorators, shadow events, hot reloading;  Spell UI's `core` carries it (below) |
| [ui](packages/ui/AGENTS.md) | `@spell-app/ui` | `$/ui` | | Fomantic UI reborn as `ui-*` custom elements, on Solid 2, written on `$/spell-solid` |
| [cli](packages/cli/AGENTS.md) | `@spell-app/cli` | `$/cli` | `CLI` | the `spell` command-line tool, running the spell-family packages' SOURCE through `tsx`;  see its [README](packages/cli/README.md) too |
| [spell-epic](spell-epic/src/AGENTS.md) (NOT a package here) | `@spell-app/epics` | `$/epics` | `EP` | the epic engine, its own repo (below, "spell-epic"):  epic pages' `<epic-*>` elements (a component pack), Epic UI (at `/components/epics/`), the `epic` command, the hooks and epic skills;  AND every docs page's tooling:  the docs tools and the `_assets` every page loads (`/_epic/assets/`) |
| [server](packages/server/AGENTS.md) | `@spell-app/server` | `$/server` | `SRV` | serving pages locally (below) |
| [assembler](packages/assembler/AGENTS.md) | `@spell-app/assembler` | `$/assembler` | `AS` | assembling pages, for every tool that writes them (below) |
| [brand](packages/brand/AGENTS.md) | `@spell-app/brand` | `$/brand` | | Spell's brand, the site header's Brand tab (below);  its `<brand-*>` elements (a component pack) and their docs pages (Brand UI, `docs/`, at `/components/brand/`) |

More on some of them:
- COMPONENT SETS (epic `epic-workflow` P10;  one layout since `people-and-orgs` P18):
  a set of elements and their docs pages in Spell UI's page shape,
  tracked with their branch, beside the code they describe.
  - In the set's package:
    - `components/`:  the elements
    - `docs/`:  ONE flat folder of pages;  an element's page is its tag, `epic-item.html`
      - `__parts/`:  every page's frame
      - `__data/`:  the side column's data
  - Served at `/components/<set>/` by the page server,
    which lays a build of Spell UI's site over the folder at `_assets/`.
    - The list:  `COMPONENT_SETS` ([server's AGENTS.md](packages/server/AGENTS.md)).
  - The sets:
    - Spell UI:  [ui's docs/](packages/ui/docs/), at `/components/ui/`
    - Epic UI:  [spell-epic's docs/](spell-epic/src/docs/), at `/components/epics/`:  spell-epic's, through the
      checkout's `spell-epic` link (below)
    - App UI:  [app's docs/](packages/app/docs/), at `/components/app/`
    - Brand UI:  [brand's docs/](packages/brand/docs/), at `/components/brand/`
  - A set that's a component PACK (epics, brand) is built by `spell dev pack build`:  the epics' in spell-epic
    (its `yarn pack:build`).
    - It writes the pack, `components/__pack/`, and the set's `docs/__data/` too.
  - The top bar's Spell/UI, Epic/UI and App/UI tabs;  the brand's set lights the Brand tab.
  - The old addresses (`/ui/`, `/epic-ui/`, `/app-ui/`, `/brand/components/`) answer "not found" (Q30).
- The VS Code extension, [packages/vscode/](packages/vscode/), is its own yarn project, NOT a workspace:
  its own `package.json` and `yarn.lock`.
  - `spell dev vscode` builds and installs it.
  - Or its two steps:  `spell dev vscode build`, then `install`.
- spell-epic:  the docs pages' tooling too, since the docs package went into the epics package
  (epic `people-and-orgs` P16, Q23), and that into spell-epic (epic `epic-eject` I5).
  - The pages themselves are SHARED root folders, tracked by no package (see "Shared content").
  - `epics/`, `guides/`
  - `pages/`:  [the docs' home page](../spell-app.epics/pages/index.html)
  - NOT the templates (epic `epic-eject` T11):  spell-epic's own `templates/`, through the `spell-epic` link,
    served at `/templates/` (an engine route);  `epic pages template <name>` prints one's path.
  - Its route modules answer under `/api/epics/` (review, agents, running, favorite, new) and `/api/docs/`
    (details, choices, comments, show):  the root `package.json`'s `"pageServer"` names them through the link.
- server:  static folders, an Express-shaped router, live reload, ports, openers, a file lock.
  - And the ONE page server per checkout (`spell dev server`),
    which serves docs, epics, the parked saga pages and Spell UI's docs site.
  - Every call is under `/api/`, one prefix per package that answers it.
    - The server's own:  `/api/server` and `/api/files`.
    - Its page editor's:  `/api/pages`.
    - The old paths answer "not found" (Q30, no redirects).
  - Its settings:  the `"pageServer"` block of the root `package.json`.
    - route modules
    - watched and writable folders
    - the ONE list of bundles (`bundles`), which the assembler reads too
- assembler:
  - link targets (`Linker`)
  - in-memory formatting (`formatHTML()`)
  - the bundles built on demand (`Bundle`)
  - JSON5 written with its comments kept (`$/assembler/json5`):  spaces' files, the component sets' site data
  - later, the page server's assembly code
- brand:  Claude Design's pages and tokens (never edited), and their Spell UI copies (`*.spell.html`).
  - And the `<brand-*>` elements those copies need:  a component pack.
    - Its prefix:  `brand-`.
      It was `<ui-brand-*>` before `people-and-orgs` P18 (Q26).
    - Its docs set:  Brand UI, [brand's docs/](packages/brand/docs/), at `/components/brand/`.

### Which package may import which

One change may touch several packages, but dependencies flow ONE way:

```text
spell-epic -> ui / server / assembler / util / spell-solid   (the engine, its own repo:  NO package here imports it)
cli -> app -> lsp -> spaces -> spell -> parser / core -> util
app / cli -> spaces       (the app:  spaces' models only, never server/node)
lsp -> spaces             (its node files:  projects on disk, in `SpellDiskWorkspace`)
spaces -> core / server   (server/node:  its route modules, run by the page server)
spaces -> ui              (models only;  allowed, not used yet)
spaces' server/py -> py's spell_core   (Python, by path in its pyproject.toml)
spell -> py -> parser     (Python's writers;  `py/core`'s Python imports no package)
app / lsp -> markdown -> parser
brand -> ui / server
ui / epics / app / brand -> spell-solid -> util   (every set's elements are written on it;  a space's too)
ui -> util
```

- NEVER make `ui` import `spell` or any package above it:  Spell UI lives on its own.
- `spell-solid` (epic `people-and-orgs` P17):  what makes a custom element on Solid, out of Spell UI.
  - NEVER make it import `ui`, or any package but util's generic files (`$/util/class` ...):
    what an element needs of the page's runtime (words, styles, animations) Spell UI hands it as it loads
    ([spell-solid's AGENTS.md](packages/spell-solid/AGENTS.md), "Settings").
  - ONE copy per page:  Spell UI's `core` entry re-exports all of it, and a component pack reads it from the page
    (`SpellUI.packModules`), as it reads Solid.
- `spaces` (epic `people-and-orgs`):  where projects and people live, and the servers that serve them.
  - NEVER make it import the app, lsp or cli packages;  NEVER make `spell` import it.
  - Its models (`$/spaces`) are safe in a browser;  `$/spaces/server/node/...` is node only, imported by path.
  - The page server loads its route module by PATH (the root `package.json`'s `"pageServer"`), not by import.
  - Spell's project groups (`@spell/examples`, `owen@spell` ...) are spaces'.
    Loading `$/spaces` registers them with spell,
    so every program that reads a spell path loads spaces first ([spaces' AGENTS.md](packages/spaces/AGENTS.md)).
  - Owen's own projects are NOT in git:  they're in spell-spaces, `../spell-spaces` beside the main checkout,
    one folder for main and every worktree (`SPELL_SPACES_DIR` sets it).
- `server` is a LEAF (node built-ins only, imports no package).
  - ANY package may import it, `ui`'s tools too.
- `assembler` is node-only and imports no package (it uses linkedom, oxfmt and json5-writer).
  - epics (its docs tools and its `epic` tool) imports it.
  - So do spaces and ui's tools (the site data writers), for `$/assembler/json5`.
  - Any other node-side package or tool may import it too.
- No exceptions (since epic `repo-split` P2):  `ui` holds nothing of spell, not even pre-compiled.
  - `<ui-code>` colours with highlight.js, and `<ui-markdown>` draws with marked.
  - Spell's own are the app's subclasses, `<spell-code>` and `<spell-markdown>`
    ([app's AGENTS.md](packages/app/AGENTS.md), `components/`), built from source with the app:
    nothing to regenerate after a grammar change.
  - The docs pages colour spell because the page server adds the app's `spell-language.js` to them
    (its `"pageScripts"`, [server's AGENTS.md](packages/server/AGENTS.md)):  spell-epic imports nothing of the app.
- The direction is by convention, not enforced:  every alias works from every package.

### Aliases and global types

- ONE alias table, `tsconfig.base.json` at the repo root:  read its header comment.
  - Every package's `tsconfig.json` extends it,
    so `$/parser` means the same file wherever it's compiled from.
- Global ambient types are in the root `types/` folder.
  - Used bare, no import (WWOD §9 › "Ambient globals used bare").
  - Every spell-family `tsconfig.json` includes that folder.
  - The types:  `Prettify`, `Class`, `AbstractClass`, `SplitString`, `__PACKAGE_VERSION__`.
  - NOT json5-writer's, which ships no types of its own:
    the one file that uses it types what it uses, [the assembler's json5.ts](packages/assembler/src/json5.ts).
- `vite.decorators.ts` and `vite.packageVersion.ts` are at the repo root.
- No `~/` or `#name` alias exists any more.
  - `$` means the packages folder, so ui is `$/ui` like the rest.
  - That can't collide with an npm package name (`@spell-app/...`, `solid-js`),
    the way a bare name could.

## Words

- Each kind of page has ONE name (Owen, 2026-10-14, epic `epic-workflow` P14).
  - Write these, in docs, skills, comments, labels and messages:
    epic page, saga page, details page, review page, choice page, guide, cheatsheet, commands page,
    components page, components guide, brand page, home page, list page, changelog, template.
  - What each one is, and where it lives:  "Page kinds" in [spell-epic's AGENTS.md](spell-epic/src/AGENTS.md).
- Owen still says the older words.  Read them as the new ones, but write the new ones:
  - "plan doc", "epic doc" -- the epic page
  - "epic name" -- the epic id (its folder, `epics/<epic-id>/`)
  - "durable doc" -- the epic's guide;  "syntax-choices page" -- a choice page;
    "analysis page" -- a review page;  "docs index", "docs home" -- the home page;
    "goal", "goals page" -- a saga (an epic of epics), a saga page
- Names only code reads keep the old words:
  - `<epic-id>.plan.html`, `PlanDoc`, `plan-doc.md`
  - the `spell dev plan-doc` spelling
  - So does the record:  log entries, quotes, commit messages.
- Pointing at a saga, an epic or an item (epic `epic-workflow` P15, J32):
  - In Owen's prompts, "saga drawable-spell" names a saga, and a SHORT ADDRESS names a saga, an epic or an item:
    `SAGA:/drawable-spell` (the saga page), `SAGA:/drawable-spell/python-target#T1` (item T1 of that epic).
    - The colon form (`SAGA:/drawable-spell:python-target#T1`) means the same;  ids in any case.
  - Resolve one with the openers, which take an address:
    `spell dev docs open SAGA:/...` shows it, `spell dev docs link SAGA:/... --show` gives its links.
  - In pages, write `<epic-link epic="python-target" item="T1"></epic-link>`, not a path;
    a plain `<a href="SAGA:/...">` works too.  The rules:  [spell-epic's AGENTS.md](spell-epic/src/AGENTS.md), "Links".

## Worktrees

### Windows

- Owen works in VS Code windows opened from their WINDOW FILES, `<pkg>.code-workspace`.
  - They live in the content repo's `windows/` folder, not in this repo (epic `epic-eject` P13):
    `../spell-app.epics/windows/`, each machine's own, git-ignored there.
    - Where:  `windowsFolder` in [the repo's epic settings](.epic/config.json5);  `epic config windowsFolder` prints it.
    - A worktree's window file is in its `ongoing/` folder.
    - Before P13 they were this repo's `workspaces/`, tracked and marked `skip-worktree`:
      `epic window move` carried them over once.
  - `epic window init` writes missing ones, and brings the rest up to date.
  - Each has its own theme.
- Each window shows the WHOLE branch:
  - folder 1 is the REPO ROOT, then the shared content repo
  - no package folder since 2026-10-06
  - Why the root first:  the Claude panel lists only the sessions saved under a window's FIRST folder,
    so every window lists every session.
  - So sessions start at the repo root:  read the package's `AGENTS.md` before working in a package.
- Each file shows ONCE in Explorer and Quick Open:
  - The window's `files.exclude` shows the shared links only under `spell-app.epics`
    ([filesExclude()](spell-epic/src/window.mjs) writes it).
  - A worktree's window hides the main root's files (beside its git-ignored `.spell-main` marker).
  - `search.exclude` in [the repo's VS Code settings](.vscode/settings.json)
    keeps generated files, icons and screenshots out of Quick Open and Find.

### Entering one

- Enter a worktree with `/isolate <name>` (`/epic` does it too), or with Claude's own `EnterWorktree`.
- The `WorktreeCreate` hook ([worktree.mjs](spell-epic/hooks/worktree.mjs), spell-epic's plugin's):
  - makes the worktree `.claude/worktrees/<name>` on its own branch, `<name>`, from local main
    - which folder and branch:  `worktreesFolder` and `baseBranch` in [the repo's epic settings](.epic/config.json5)
      (`EpicConfig`;  `epic config` prints them)
  - keeps the session saved at the root
    (Claude's own worktrees move it, and it drops out of every window's list)
- New window, or stay?
  - `epic window stay-check` recommends one, with reasons, and Owen picks in a modal
    ([the isolate skill](spell-epic/skills/isolate/SKILL.md), "Start", step 2b).
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
  - its old tab closes (the `Stop` hook, [handoff.mjs](spell-epic/hooks/handoff.mjs))
- So END THE TURN right after `handoff`:  the rest (`yarn install` ...) happens in the new window.
- The old tab is found by the session's title.
  - The `UserPromptSubmit` hook, [prompt-gate.mjs](spell-epic/hooks/prompt-gate.mjs), renames the session
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
  - `yarn window` couldn't:  yarn runs no script there before `yarn install`.
- A doc shown while the move is pending waits, then shows beside the session in the window it moved to.
  - That's `epic open <name> --review` or `epic window show`.
- A running epic's epic page is shared (see "Shared content"):  ONE file, the same in every checkout.
  - So the MAIN checkout's page server shows it too,
    listed on the Epics list page with the merged ones.
  - `spell dev server url` gives that URL ([the page server guide](../spell-app.epics/guides/server.html), "Running epics").
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
    - Spell UI's docs site:  its `_assets/`, in [ui's site](packages/ui/site/)
    - the brand pages':  `_assets/ui/`, in [brand](packages/brand/)
    - They're git-ignored.
      The page server builds the stale ones when it starts, and a page waits for them.
    - By hand:  `spell dev bundles build [--stale]`, or `check`.
    - The code:  `Bundle`, in `$/assembler`.
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
  - `guides/` -- every other docs page ([the Solid 2 guide](../spell-app.epics/guides/solid/solid-2.html), say),
    with its Markdown, JSON and `experiments/`
  - `pages/` -- [the docs' home page](../spell-app.epics/pages/index.html), and the scratch details pages, `pages/details/`
  - `ui/` -- Spell UI's hand-written docs pages (claude-design P6), LEFT for the other checkouts.
    - Since epic `people-and-orgs` P18 they're in [ui's docs/](packages/ui/docs/), served at `/components/ui/`.
    - This branch's page server answers "not found" for `/ui/`;  the merge removes the folder (that epic's T3).
  - `brand/` -- the Brand tab's pages ([brand's AGENTS.md](packages/brand/AGENTS.md)):
    Claude Design's exports and their Spell UI copies
  - `sagas/` -- the SAGAS, each an epic of epics (epic `epic-workflow` P15):
    - `sagas/sagas.json5`:  the list, in Owen's order;  changed only through `epic saga ...`
    - `sagas/<id>/<id>.saga.html`:  each saga's page
    - `sagas/index.html`:  the Sagas list page, the top bar's tab
    - an epic names its saga with `<epic-page saga="<id>">`, a guide with `<meta name="spell-saga" content="<id>">`
  - `goals/` -- the first saga pages (once goal sets), PARKED since 2026-10-11 (epic `epic-workflow` P6):
    read only, buttons saying TODO.
    Their tooling is in `packages/goals.zip`;
    epic `epic-goals` rebuilds it ([the parked sagas guide](../spell-app.epics/guides/goals/goals.html)).
  - `agents/` -- one copy of the rules for every branch:
    - the three logs:
      [PAPERCUTS.md](agents/PAPERCUTS.md), [SUSPECTED-BUGS.md](agents/SUSPECTED-BUGS.md),
      [CODE-DEBT.md](agents/CODE-DEBT.md)
    - WWOD, the house style (`agents/wwod/`)

### How they're linked

- They're ONE shared content repo, the same for main and every worktree.
  - It's `../spell-app.epics`, beside the main checkout:  an ordinary git repo, local only.
  - Where it is:  `contentFolder`, in [the repo's epic settings](.epic/config.json5) (epic `epic-eject` P4).
    `epic config contentFolder` prints it.
  - So every worktree sees every edit at once:  no per-branch copy, and these files never conflict on merge.
- Only `agents/` is linked in at every checkout's root, a folder SYMLINK (epic `epic-eject` P12):
  the instructions name `agents/...` from the checkout.
  - Folders, never single-file links:  Claude's Edit refuses to write through a link to a file.
  - The rest (`epics`, `guides`, `pages`, `brand`, `ui`, `goals`, `sagas`) are found in the content folder itself:
    - the page server serves it at `/`, after the checkout's own files (`serveContent()`,
      [server's AGENTS.md](packages/server/AGENTS.md)), and under every worktree's address
    - the tools read it from the epic settings (spell-epic's `EpicConfig`, `$/assembler`'s `contentFolderOf()`)
    - a checkout cut before P12 still links them in, by its own manifest, until it merges `main`
- Claude edits shared files at their REAL path, from main or any worktree.
  - That's `/Users/owen/www/spell-app/spell-app.epics/<path>`:  `$(epic config contentFolder)/<path>`.
  - E.g. `.../spell-app.epics/agents/PAPERCUTS.md`.
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
    - `epic shared commit` (every turn) runs the reorg's repair first.
    - `epic shared repair` does it by hand
      ([reorgShared()](spell-epic/src/tools/relocate.js)).

### Commits

- The shared repo is committed by itself after every Claude turn.
  - The `Stop` hook, [shared-commit.mjs](spell-epic/hooks/shared-commit.mjs), runs `epic shared commit`.
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

- `epic shared status | init | link | commit | migrate <worktree> | repair`
  - `--dry-run` on the last two
- A new worktree is linked by the `WorktreeCreate` hook.
- A worktree cut before the cutover runs `epic shared migrate <name>` before it merges `main`.
  - First it merges `0fc52e02` (main just before the cutover), if it predates the docs move.
- After merging a branch from before the docs move:  `epic shared repair`.
  - It moves pages the branch left in the old docs package's folder into their shared folders.
  - It fixes links (and their tab names) written for an old layout.
  - And the docs package's end (`people-and-orgs` P16):
    the shared pages' links into its old tools folder point into the epics package's `tools/` (spell-epic's
    [src/tools/](spell-epic/src/tools/) since `epic-eject` I5),
    once, when that epic merges into main (`relocate.js relink`).
- Shared docs may link code another branch has and this one doesn't yet:
  `doc-links.js --check` reports those as missing in this checkout.
- Package windows show `spell-app.epics` as a folder, with its own Source Control:  the auto commits.
- Searching:  the links are git-ignored.
  - `grep -R` follows them (`grep -r` doesn't).
  - `rg` needs `-L --no-ignore-vcs`.
  - Or search `../spell-app.epics`.
- Plan-doc item fixes carry the epic's name:  `<epic> I3:  ...`.
  - Phase commits stay `P3:  <phase name> -- ...`.

## Changelog

- [The changelog](../spell-app.epics/guides/changelog.html):  what the repo shipped, newest first.
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
- Then finish the page as [spell-epic's AGENTS.md](spell-epic/src/AGENTS.md) says ("Finishing a page"),
  and bump its footer's date.

## Commands

- Three ways to make the repo do something:  the `spell` CLI, Claude skills, yarn scripts.
- Their map, one row per operation:  [the commands page](../spell-app.epics/guides/dev/commands/commands.html).
  - Its data:  `commands.json5` beside it.
  - Shown by the page server:  `spell dev docs open guides/dev/commands/commands.html`.
- Target:  the CLI drives everything.
  - Repo tools are `spell dev <noun> <verb>`.
  - Skills keep judgement and dialog, and call it.
  - Yarn keeps each package's own scripts, and aliases the rest.
- Owen asks for a new skill or `spell` command, or you add a yarn script to solve a problem:
  - READ [the commands guide](../spell-app.epics/guides/dev/commands/commands.md).
  - Then SUGGEST, before building:  where it belongs, its name, what it replaces,
    which roadmap move it advances.
- MUST keep the page true in the same change:  `commands.json5`, then `spell dev commands check`.
  - `commands.json5` and `commands.md` are shared, but the check reads each branch's CLI.
  - So a branch adding a command can make main's check fail until it merges
    ([the code-debt log](agents/CODE-DEBT.md), "docs").
- Tools are TypeScript (or node JS in [the docs tools](spell-epic/src/tools/)), never python:  one language.
- Skills reach them as `spell dev ...`.
  - `spell` is the link `yarn cli:install` makes, once per machine.
  - Without it:  `node packages/cli/bin/spell.mjs dev ...` from a checkout's root.

### spell-epic

- The epic engine is a repo of its own beside this one, `../spell-epic` (epic `epic-eject` P6, 2026-10-17).
  - A Claude Code plugin, holding:
    - the epics package (`@spell-app/epics`, one package laid out as a repo:  `src/`, `tests/`), and the `epic`
      command (`bin/epic`)
    - the hooks (`hooks/hooks.json`) and the window script (`src/window.mjs`)
    - the epic skills (`/epic`, `/isolate`, `/details`, `/bg`, `/send` ... 17 of them) and every template
  - It takes `ui`, `server`, `assembler`, `util` and `spell-solid` from spell-app's main checkout (`portal:`,
    through its own `.spell-app` link).
  - Its README says how it's laid out and installed;  its [AGENTS.md](spell-epic/AGENTS.md) and
    [src/AGENTS.md](spell-epic/src/AGENTS.md) hold its rules.
- LIVE since the switch (epic `epic-eject` I5, 2026-10-18):  this repo carries no copy of the engine.
  - Gone from here:  the epics package and its tests, the window script, the hooks and the epic skills.
  - Make epic changes IN spell-epic, with its own checks (`yarn ts`, `yarn test`, `yarn lint`), and commit there.
  - Claude Code runs its hooks and skills as the installed plugin (`spell-epic@spell-epic`), and puts its `bin/epic`
    on every session's `PATH`;  [the repo's Claude settings](.claude/settings.json) hold no hooks.
- How this repo reaches it:  a git-ignored link at every checkout's root, `spell-epic`, to the spell-epic checkout.
  - Where it points:  `engineFolder` in [the repo's epic settings](.epic/config.json5) (`../spell-epic`, from the
    main checkout).
  - `epic shared link` makes it (the worktree hook runs that for every new worktree), only in a checkout whose
    `.gitignore` ignores `spell-epic`:  a branch cut before the switch runs its own copy.
  - The main checkout:  `ln -s ../spell-epic spell-epic`, once (or `epic shared link` there).
  - Through it:
    - the `$/epics` aliases ([tsconfig.base.json](tsconfig.base.json));  NO spell-app source imports them
    - the page server's epic route modules and the folders it watches (the root `package.json`'s `"pageServer"`)
    - the engine's routes, `/_epic/assets/` and `/_epic/pack/`, and Epic UI at `/components/epics/`
      (`ENGINE_ROUTES`, `COMPONENT_SETS`, [server's AGENTS.md](packages/server/AGENTS.md))
    - the commands page's check (`spell dev commands`):  `epic`'s verbs and the plugin's skills
  - A checkout without the link (CI) loads no epic routes;  the tests that need the engine skip themselves.
- `spell dev` keeps the old spellings, hidden, each handed on to `epic` (`runEpic()` in the CLI's `passThrough.ts`):
  - `spell dev plan-doc <tool order>` is `epic plan-doc`;  `spell dev details` is `epic ask`
  - `spell dev docs <verb>` is `epic pages <verb>`
  - `choices`, `comments`, `notes`, `agents`, `airplane`, `window`, `session`, `worktree`, `park`, `stock`, `shared`:
    the same verb of `epic`;  and `spell epic <verb>` is `epic <verb>`
  - `spell dev design bundle | check | <sync verb>` run the engine's design tools straight from the link.
- The generated files `epic worktree merge-main` rebuilds are this repo's own list, each branch's own:
  [the generators list](.epic/generators.json5) (T4).
  - The engine's own (the docs bundle, the epics pack, Epic UI's data) are spell-epic's to build.
- Its page bundles are built in spell-epic from spell-app's MAIN checkout:  a worktree's change to Spell UI shows on
  the epic pages only once it's merged and the bundle rebuilt there (`yarn pack:build`, the docs bundle).

## Solid 2

- `spell`'s editor app, runners and web components are Solid 2, on `@spell-app/ui`.
  - Version `2.0.0-rc.13`, for every package:  one copy at the root.
  - So is what compiled spell draws (epic `output-targets` P10-P11).
  - React is left only in the `spell` CLI's terminal screens (Ink).
- The rules:  [solid-2.md](../spell-app.epics/guides/solid/solid-2.md) (see the top of this file).
  - NOT `@`-imported on purpose:  it loads only when the task needs it.
  - Claude also has the [solid-2 skill](.claude/skills/solid-2/SKILL.md), which triggers on Solid work.
- The why and the measurements:  [the Solid 2 guide](../spell-app.epics/guides/solid/solid-2.html).
- The API:  [the Solid 2 cheatsheet](../spell-app.epics/guides/solid/cheatsheet.html).
- MUST keep `solid-2.md` up to date when a Solid decision changes, or an RC bump changes behaviour.
- How `ui` writes its elements on Solid:  "Solid authoring" in [ui's AGENTS.md](packages/ui/AGENTS.md).
- House style for app components, on top of `solid-2.md`:  WWOD §17 ([solid.md](agents/wwod/solid.md)).

## Toolchain:  Vite+

- One dev dependency, `vite-plus` (command `vp`), pins these together:
  - vite (as `@voidzero-dev/vite-plus-core`)
  - vitest, oxlint, oxfmt and tsgolint
  - The versions are the yarn `catalog:` in `.yarnrc.yml`.
- Node 24 (`engines`).
- Bump them together:  `vite-plus` and every `catalog:` entry.
  - To what `vp toolchain` lists.
  - NEVER pin one tool on its own.
- Commands, run in a package or the root:

  ```sh
  yarn vp lint
  yarn vp fmt [--check]
  yarn vp test
  yarn vp check
  ```

- `yarn review` is the finishing pass (WWOD §1):  each package's, or the root's over all of them.
  - It's about the same (`~==`) as all four of these:

    ```sh
    yarn ts + yarn lint:fix + yarn format + yarn test
    ```

- In a package, `yarn oxfmt` and `yarn oxlint` no longer work:  they're not its own deps.
  - `yarn vitest` still does.
- Configs import from `vite-plus` (lint rule `vite-plus/prefer-vite-plus-imports`).
  - Tests:  WWOD §20 › "Test APIs come from Vite+".
- `yarn tsc`, never `npx tsc`:  yarn picks the workspace's TypeScript 7.
  - Why:  a dependency's own TypeScript can take `.bin/tsc`.
    - E.g. ui's `vite-plugin-dts` needs TypeScript 6 (`@typescript/typescript6`).
    - Today `.bin/tsc` is the root's 7, but only by luck of the hoister
      ([the papercuts log](agents/PAPERCUTS.md), "## ui").
- NEVER hard-code `<package>/node_modules/<dep>`:  yarn hoists to the root.
  - Node code resolves the package instead (in `ui`:  [NodePackage](packages/ui/tools/NodePackage.ts)).
- Lint / format settings:  the repo root's `vite.lint.ts`.
  - Every `vite.config.ts` spreads it, in its lint and fmt blocks.
  - No `.oxlintrc.json` / `.oxfmtrc.json` any more.
  - The editor and `vp check` read the ROOT block only.
    So a rule for some packages goes in `rootLint()`'s `overrides` too.
  - Our own rules:  `vite.lint.patterns.ts` beside it, a JS plugin.
    - Its rules, `spell-ui/*`, guard Spell UI's patterns in component files:
      "The lint guard" in [ui's AGENTS.md](packages/ui/AGENTS.md).
- Three of the root's scripts run over every `@spell-app/*` package, with `vp run`:
  - `ts` and `test:packages`, 4 at a time
  - `review`, one at a time:  its tests flake under load
  - NEVER `vp run --cache` a plain script.
    Its file tracking misses TS 7's native `tsc`, so it replays a stale pass.
  - A cached task needs `run.tasks` with explicit `cache.input` (epic `vite-plus`, I1).
  - Flags go BEFORE the task name (`vp run --cache -r ts`):  after it, they go to the task.

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
