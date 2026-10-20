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
  - `core` rendering, `@spell-app/util` reactivity
  - `@spell-app/ui` elements
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
    Every other package is in a repo of its own, beside this one (below, "The other repos").
- It's a CHILD REPO of the top repo `spell`, at `~/www/spell/spell-app/`.
  - The top repo holds the ONE install for every repo:  no `yarn.lock` here.
    - `yarn install` at `~/www/spell`, never here.
    - Its rules across repos:  [the top repo's AGENTS.md](../AGENTS.md).
  - Each package is a folder at this repo's root (no `packages/` folder), named in the root `package.json`'s
    `workspaces`.
  - Four of the root's yarn scripts run each package's own script of the same name
    (`yarn workspaces foreach`, this repo's packages only):

    ```sh
    yarn ts    yarn test    yarn lint    yarn review
    ```

- Every package's TESTS live in `tests/<package>/`, at the same path as the code they test.
  - E.g. spaces' [projectGroups.ts](spaces/src/models/projectGroups.ts) is tested by
    [projectGroups.test.ts](tests/spaces/src/models/projectGroups.test.ts).
  - With their snapshots and test data;  each package's `yarn test`, `yarn ts`, lint and format still cover them.
  - Each package's Vitest finds them (its config's `dir`).
  - A `tsconfig.json` in each package's tests folder gives them the package's own settings and the aliases.
  - Spell's frozen test projects (`@spell/test`) are NOT here since P8:  spell-lang's,
    [`../spell-lang/tests/spaces/@spell/test/`](../spell-lang/tests/spaces/@spell/test/).
    - spell's own tests read them, and a lower repo may not read a higher one's files.
    - spaces reads them DOWN, through the installed `@spell-app/spell` (its environment's `tests` space folder).
- This file holds what's about THIS repo:  packages, worktrees, changelog, commands, toolchain, ledgers.
  - The house style every repo shares is WWOD (`agents/wwod/`, above).
  - Each package's `AGENTS.md` holds only what's local to it.
  - A section there with the same name as one here, or as a WWOD rule, EXTENDS it
    ("As the root's, plus:", "As WWOD §4, plus:").
  - Codex reads every `AGENTS.md` from the root down to its working folder;
    Claude Code loads the root `CLAUDE.md` plus the package's.
    So a rule lives in exactly ONE place.

### Packages

Each folder links to its own `AGENTS.md`:  read it before working there.
- Alias:  how code in THIS repo imports the package, `$/name` (from another repo:  its npm name).
- Namespace:  the package's self-namespace (WWOD §8).

| Folder | Package | Alias | Namespace | What it is |
| --- | --- | --- | --- | --- |
| [app](app/AGENTS.md) | `@spell-app/app` | `$/app` | `UI` | the web app, the runner, and the `<spell-app>` / `<spell-editor>` web components;  `yarn start` / `build*` live here;  App UI, the docs pages of its components, in `docs/` (at `/components/app/`) |
| [spaces](spaces/AGENTS.md) | `@spell-app/spaces` | `$/spaces` | `SPACES` | where projects and people live:  the built-in projects (`@spell/`), its models (`models/`, browser-safe:  spell's project groups and lists), projects on disk (`server/node/projects/`), and the servers that serve them, the editor's (`server/node/`) and Python's, `spell_quart` (`server/py/`, a uv project) |
| [lsp](lsp/AGENTS.md) | `@spell-app/lsp` | `$/lsp` | `LSP` | spell's language server (browser-safe) |
| [cli](cli/AGENTS.md) | `@spell-app/cli` | `$/cli` | `CLI` | the `spell` command-line tool, running the spell-family packages' SOURCE through `tsx`;  see its [README](cli/README.md) too |
| [page-server](page-server/AGENTS.md) | `@spell-app/page-server` | `$/page-server` | `PS` | what only spell-app's page server does, as a route module on spell-server's generic one:  building its bundles, the shared pages' bridges (below) |
| `vscode/` | | | | the spell language's VS Code extension (below) |

More on some of them:
- The VS Code extension, [vscode/](vscode/), is its own yarn project, NOT a workspace:
  its own `package.json` and `yarn.lock`.
  - `spell dev vscode` builds and installs it.
  - Or its two steps:  `spell dev vscode build`, then `install`.
  - Its language server runs lsp's source with `tsx`, loading the run-time alias hook (below, "Aliases").
  - The Review tab, the Epic Docs view and the window bridge are spell-epic's own extension, not this one.
- page-server:  spell-app's own part of its page server, a route module on spell-server's (`@spell-app/server`).
  - building the bundles it serves (`BundleBuild`, with spell's own CLI)
  - the offline highlight.js swap, and the shared pages' bridges (the engine's old folders, `/ui/`)
- COMPONENT SETS (epic `epic-workflow` P10;  one layout since `people-and-orgs` P18):
  a set of elements and their docs pages in Spell UI's page shape, tracked with their repo.
  - In the set's package:
    - `components/`:  the elements
    - `docs/`:  ONE flat folder of pages;  an element's page is its tag, `epic-item.html`
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
  - A set that's a component PACK (epics, brand) is built by Spell UI's own pack tooling, `spell-ui-pack build`
    ([ComponentPack.ts](../spell-ui/tools/ComponentPack.ts)):  each pack's `yarn pack:build`.
    `spell dev pack build <pack>` calls the same tool, and finds the brand's pack in `../spell-brand/`.
  - The top bar's Spell/UI, Epic/UI and App/UI tabs;  the brand's set lights the Brand tab.
  - The old addresses (`/ui/`, `/epic-ui/`, `/app-ui/`, `/brand/components/`) answer "not found" (Q30).

### The other repos

Every other package is in a repo of its own, beside this one in the top repo `spell` (`~/www/spell/<repo>/`),
each its own git repo with its own history (epic `repo-split` P8).
The list, lowest first, and what each needs:  the top repo's [repos.json5](../repos.json5).

| Repo | What it holds | Its rules |
| --- | --- | --- |
| spell-util | `@spell-app/util` (the helpers every package shares) and `@spell-app/toolchain` (the lint and format settings, the decorator pre-pass, the version stamp, the base tsconfig, the global types, `spell-types`, the run-time alias hook) | [AGENTS.md](../spell-util/AGENTS.md) |
| spell-server | `@spell-app/server` (serving pages locally, the generic page server) and `@spell-app/assembler` (assembling pages:  Linker, formatHTML, Bundle, DataFile) | [AGENTS.md](../spell-server/AGENTS.md) |
| spell-element | `@spell-app/spell-element`, flat:  what makes a custom element on Solid, for every component set | [AGENTS.md](../spell-element/AGENTS.md) |
| spell-lang | `@spell-app/parser`, `markdown`, `core`, `py` and `spell`:  the parser, the language, its runtime and its writers;  and spell's frozen test projects | [AGENTS.md](../spell-lang/AGENTS.md) |
| spell-ui | `@spell-app/ui`, flat:  Spell UI, Fomantic UI reborn as `ui-*` custom elements, and its docs site | [AGENTS.md](../spell-ui/AGENTS.md) |
| spell-brand | `@spell-app/brand`, flat:  Claude Design's pages and tokens, their Spell UI copies, the `<brand-*>` pack | [AGENTS.md](../spell-brand/AGENTS.md) |
| spell-epic | `@spell-app/epics`, flat:  the epic engine, a Claude Code plugin (below, "spell-epic") | [AGENTS.md](../spell-epic/AGENTS.md) |

- spell-app is the highest code repo.
  - It NEEDS spell-lang, spell-brand, spell-ui, spell-server, spell-element and spell-util:  it imports them.
  - It RUNS spell-epic, by its page server's settings only (its route modules and folders):  no spell-app source
    imports it.
  - No repo below imports spell-app:  every arrow points down.

### Which package may import which

One change may touch several packages, but dependencies flow ONE way:

```text
cli -> app -> lsp -> spaces             (this repo's)
app / cli -> spaces                     (the app:  spaces' models only, never server/node)
lsp -> spaces                           (its node files:  projects on disk, in `SpellDiskWorkspace`)
page-server -> @spell-app/server        (its route module runs on spell-server's generic page server)
any package here -> any repo below      (by npm name:  @spell-app/spell, @spell-app/ui/core ...)
```

- `spaces` (epic `people-and-orgs`):  where projects and people live, and the servers that serve them.
  - NEVER make it import the app, lsp or cli packages.
  - Its models (`$/spaces`) are safe in a browser;  `$/spaces/server/node/...` is node only, imported by path.
  - The page server loads its route module by PATH (the root `package.json`'s `"pageServer"`), not by import.
  - Spell's project groups (`@spell/examples`, `owen@spell` ...) are spaces'.
    Loading `$/spaces` registers them with spell,
    so every program that reads a spell path loads spaces first ([spaces' AGENTS.md](spaces/AGENTS.md)).
  - Owen's own projects are NOT in git:  they're in spell.spaces, `../spell.spaces` beside this repo in the top repo,
    one folder for main and every worktree (`SPELL_SPACES_DIR` sets it;  `../spell-spaces` before epic `repo-split` P8).
  - Folders of other repos it needs at run time (spell's `src/`, the core's, the frozen test projects) it finds by
    PACKAGE, through `node_modules` (`environment.packageFolder("@spell-app/py")` ...), never by a path into that repo.
- `page-server`:  NO package imports it;  the page server loads its route module by PATH, from its settings.
- A package of ANOTHER repo is imported by its npm name, an entry its `package.json` `exports` names:
  `@spell-app/spell`, `@spell-app/ui/core`, `@spell-app/server/page` ...
  - NEVER a `$/` alias into another repo:  lint fails it (`spell/no-cross-repo-alias`, the toolchain's
    [lint.imports.ts](../spell-util/toolchain/src/lint.imports.ts)).
  - NEVER a `../` path into another repo's files:  lint fails that too (`spell/no-cross-package-import`).
- No repo below may import this one;  nor may its tests reach this repo's files (tests only reach down).

### Aliases and global types

- `$/name` names a package of THIS repo:  `$/spaces`, `$/app/components/...`.
  - The table:  [tsconfig.base.json](tsconfig.base.json) at the repo root, read its header comment.
  - It holds ONLY this repo's names.
  - Every package's `tsconfig.json` extends it:  `"extends": "../tsconfig.base.json"`.
  - It extends the TypeScript settings every repo shares, `@spell-app/toolchain/tsconfig.base.json`.
- A package of another repo goes by its npm name (above).  How each tool reads it:
  - `tsc` reads that package's BUILT DECLARATIONS (epic `repo-split` I12), never its source.
    - Each package's `exports` entry is `{ "types": "./dist-types/src/x.d.ts", "default": "./src/x.ts" }`.
    - `dist-types/` is built by the toolchain's `spell-types` (git-ignored), every `$/` name in it rewritten as a
      relative path:  so this repo's table is enough to read it.
    - Every repo's `yarn ts` runs `spell-types --below` first:  the lower repos' declarations, rebuilt where stale
      (incremental:  a second or two each when nothing changed).
    - This repo's own packages are read by no repo above, so they keep a bare `tsc`.
  - Vite and Vitest read its SOURCE (`default`):  their `resolve.tsconfigPaths` reads the tsconfig nearest the
    IMPORTING file, so that file's own repo's aliases.
  - `tsx` and node read its source too, but `tsx` reads ONE tsconfig for every file it runs.
    - So every `tsx` program here loads the RUN-TIME ALIAS HOOK, `@spell-app/toolchain/aliases`:
      a node resolve hook that resolves each `$/` import by the importing file's OWN repo's table.
    - The CLI's [bin/spell.mjs](cli/bin/spell.mjs), after `tsx`'s `register()`.
    - Every child process it starts (the runner, `spell speed`, the static renderer, the repo tools of
      `spell dev`):  `--import tsx/esm --import <the hook>`.
    - The page server's background process (spell-server's `PageServer.ensure()`), which loads spell-epic's and
      spaces' route modules.
    - Package scripts:  `tsx --import @spell-app/toolchain/aliases scripts/site-data.ts`.
    - A new `tsx` run without it fails with `Cannot find package '$'` on the first other repo's file.
- Global ambient types are the toolchain's, [its types](../spell-util/toolchain/types/index.d.ts).
  - Used bare, no import (WWOD §9 › "Ambient globals used bare").
  - A `tsconfig.json` that wants them names them:  `"types": [..., "@spell-app/toolchain/types"]`.
  - The types:  `Prettify`, `Class`, `AbstractClass`, `SplitString`, `__PACKAGE_VERSION__`;  `vite/client`'s.
- The decorator pre-pass and the version stamp are the toolchain's too:
  `@spell-app/toolchain/decorators`, `@spell-app/toolchain/packageVersion`.
- A string that only NAMES a module keeps its `$/` name:  a page's `SpellUI.packModules` keys (`"$/ui/core"`),
  the run-time names every page and spell-epic's bundles share (`packModuleKey()`,
  [packModules.ts](../spell-ui/tools/packModules.ts)).

### Folders beside the checkout

The page server's settings, the root `package.json`'s `"pageServer"`, name folders of the other repos by their
paths from this repo's root:

- component sets' pages and Spell UI's site bundle:  `../spell-ui/docs`, `../spell-ui/site/_assets`,
  `../spell-brand/docs`, `../spell-epic/src/docs`
- engine routes:  `/_epic/assets/` from `../spell-epic/src/tools/_assets`, `/_epic/pack/`, `/templates/`
- route modules:  `../spell-epic/src/tools/detailsRoutes.ts` ...
- bundles:  `../spell-ui/site/_assets`, `../spell-brand/_assets/ui`
- How they're served:  spell-server's page server mounts each folder outside the checkout on its own, at
  `/_beside/<path>/` (`/_beside/spell-ui/docs/`), and the component sets' and engine routes' addresses lead there.
  - Only the folders the settings name:  never the top repo whole.
  - From a worktree's address (`/worktrees/<w>/`), a folder beside is the MAIN checkout's, until epic `repo-split`
    P9 gives each epic a worktree of every repo.
- spell-epic's `spell-epic` link at the checkout's root (below, "spell-epic") stays:  the CLI's engine tools and
  the old URL bridges go through it.

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
  - the `spell dev plan-doc` spelling
  - So does the record:  log entries, quotes, commit messages.
- Pointing at a saga, an epic or an item (epic `epic-workflow` P15, J32):
  - In Owen's prompts, "saga drawable-spell" names a saga, and a SHORT ADDRESS names a saga, an epic or an item:
    `SAGA:/drawable-spell` (the saga page), `SAGA:/drawable-spell/python-target#T1` (item T1 of that epic).
    - The colon form (`SAGA:/drawable-spell:python-target#T1`) means the same;  ids in any case.
  - Resolve one with the openers, which take an address:
    `spell dev docs open SAGA:/...` shows it, `spell dev docs link SAGA:/... --show` gives its links.
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
  - folder 1 is the REPO ROOT, then the shared content repo
  - no package folder since 2026-10-06
  - Why the root first:  the Claude panel lists only the sessions saved under a window's FIRST folder,
    so every window lists every session.
  - So sessions start at the repo root:  read the package's `AGENTS.md` before working in a package.
  - With the top repo (epic `repo-split` P9), folder 1 becomes the TOP repo, `~/www/spell`, for the same reason:
    every session of every repo is saved under it.  Worktrees of several repos are P9's too.
- Each file shows ONCE in Explorer and Quick Open:
  - The window's `files.exclude` shows the shared links only under `spell.epics`
    ([filesExclude()](../spell-epic/src/window.mjs) writes it).
  - A worktree's window hides the main root's files (beside its git-ignored `.spell-main` marker).
  - `search.exclude` in [the repo's VS Code settings](.vscode/settings.json)
    keeps generated files, icons and screenshots out of Quick Open and Find.

### Entering one

- Enter a worktree with `/isolate <name>` (`/epic` does it too), or with Claude's own `EnterWorktree`.
- The `WorktreeCreate` hook ([worktree.mjs](../spell-epic/hooks/worktree.mjs), spell-epic's plugin's):
  - makes the worktree `.claude/worktrees/<name>` on its own branch, `<name>`, from local main
    - which folder and branch:  `worktreesFolder` and `baseBranch` in [the repo's epic settings](.epic/config.json5)
      (`EpicConfig`;  `epic config` prints them)
  - keeps the session saved at the root
    (Claude's own worktrees move it, and it drops out of every window's list)
- New window, or stay?
  - `epic window stay-check` recommends one, with reasons, and Owen picks in a modal
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
  - `yarn window` couldn't:  yarn runs no script there before `yarn install`.
- A doc shown while the move is pending waits, then shows beside the session in the window it moved to.
  - That's `epic open <name> --review` or `epic window show`.
- A running epic's epic page is shared (see "Shared content"):  ONE file, the same in every checkout.
  - So the MAIN checkout's page server shows it too,
    listed on the Epics list page with the merged ones.
  - `spell dev server url` gives that URL ([the page server guide](../spell.epics/guides/server.html), "Running epics").
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
    - By hand:  `spell dev bundles build [--stale]`, or `check`.
    - The code:  `Bundle`, in spell-server's `@spell-app/assembler`.
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
  - `agents/` -- one copy of the rules for every branch:
    - the three logs:
      [PAPERCUTS.md](agents/PAPERCUTS.md), [SUSPECTED-BUGS.md](agents/SUSPECTED-BUGS.md),
      [CODE-DEBT.md](agents/CODE-DEBT.md)
    - WWOD, the house style (`agents/wwod/`)

### How they're linked

- They're ONE shared content repo, the same for main and every worktree.
  - It's `../spell.epics`, beside the main checkout in the top repo `spell`:  an ordinary git repo, local only.
    - `~/www/spell/spell.epics` (epic `repo-split` J5;  `../spell-app.epics` before).
    - Until the move (epic `repo-split` P9) puts the real folder there, a link to it.
  - Where it is:  `contentFolder`, in [the repo's epic settings](.epic/config.json5) (epic `epic-eject` P4).
    `epic config contentFolder` prints it.
  - So every worktree sees every edit at once:  no per-branch copy, and these files never conflict on merge.
- Only `agents/` is linked in at every checkout's root, a folder SYMLINK (epic `epic-eject` P12):
  the instructions name `agents/...` from the checkout.
  - Folders, never single-file links:  Claude's Edit refuses to write through a link to a file.
  - The rest (`epics`, `guides`, `pages`, `brand`, `ui`, `goals`, `sagas`) are found in the content folder itself:
    - the page server serves it at `/`, after the checkout's own files (`serveContent()`,
      [spell-server's server AGENTS.md](../spell-server/server/AGENTS.md)), and under every worktree's address
    - the tools read it from the epic settings (spell-epic's `EpicConfig`, the assembler's `contentFolderOf()`)
    - a checkout cut before P12 still links them in, by its own manifest, until it merges `main`
- Claude edits shared files at their REAL path, from main or any worktree.
  - That's `$(epic config contentFolder)/<path>`:  `/Users/owen/www/spell/spell.epics/<path>` once the move
    (epic `repo-split` P9) puts it there, `/Users/owen/www/spell-app/spell-app.epics/<path>` until then.
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
    - `epic shared commit` (every turn) runs the reorg's repair first.
    - `epic shared repair` does it by hand
      ([reorgShared()](../spell-epic/src/tools/relocate.js)).

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
    [src/tools/](../spell-epic/src/tools/) since `epic-eject` I5),
    once, when that epic merges into main (`relocate.js relink`).
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
  - Shown by the page server:  `spell dev docs open guides/dev/commands/commands.html`.
- Target:  the CLI drives everything.
  - Repo tools are `spell dev <noun> <verb>`.
  - Skills keep judgement and dialog, and call it.
  - Yarn keeps each package's own scripts, and aliases the rest.
- Owen asks for a new skill or `spell` command, or you add a yarn script to solve a problem:
  - READ [the commands guide](../spell.epics/guides/dev/commands/commands.md).
  - Then SUGGEST, before building:  where it belongs, its name, what it replaces,
    which roadmap move it advances.
- MUST keep the page true in the same change:  `commands.json5`, then `spell dev commands check`.
  - `commands.json5` and `commands.md` are shared, but the check reads each branch's CLI.
  - So a branch adding a command can make main's check fail until it merges
    ([the code-debt log](agents/CODE-DEBT.md), "docs").
- Tools are TypeScript (or node JS in [the docs tools](../spell-epic/src/tools/)), never python:  one language.
- Skills reach them as `spell dev ...`.
  - `spell` is the link `yarn cli:install` makes, once per machine.
  - Without it:  `node cli/bin/spell.mjs dev ...` from a checkout's root.

### spell-epic

- The epic engine is a repo of its own beside this one, `../spell-epic` (epic `epic-eject` P6, 2026-10-17):
  in the top repo `spell` since epic `repo-split` P8, a child repo like this one.
  - A Claude Code plugin, holding:
    - the epics package (`@spell-app/epics`, one package laid out as a repo:  `src/`, `tests/`), and the `epic`
      command (`bin/epic`)
    - the hooks (`hooks/hooks.json`) and the window script (`src/window.mjs`)
    - the epic skills (`/epic`, `/isolate`, `/details`, `/bg`, `/send` ... 17 of them) and every template
  - A plain workspace of the top repo's install since epic `epic-engine` P10 (`workspace:*` deps, no `.spell-app`
    link, no `portal:`).
  - Its README says how it's laid out and installed;  its [AGENTS.md](../spell-epic/AGENTS.md) and
    [src/AGENTS.md](../spell-epic/src/AGENTS.md) hold its rules.
- LIVE since the switch (epic `epic-eject` I5, 2026-10-18):  this repo carries no copy of the engine.
  - Gone from here:  the epics package and its tests, the window script, the hooks and the epic skills.
  - Make epic changes IN spell-epic, with its own checks (`yarn ts`, `yarn test`, `yarn lint`), and commit there.
  - Claude Code runs its hooks and skills as the installed plugin (`spell-epic@spell-epic`), and puts its `bin/epic`
    on every session's `PATH`;  [the repo's Claude settings](.claude/settings.json) hold no hooks.
- How this repo reaches it:
  - its page server's settings name its folders beside this repo, `../spell-epic/...` (above, "Folders beside the
    checkout")
  - and a git-ignored link at every checkout's root, `spell-epic`, to the spell-epic checkout, for the CLI's engine
    tools (`epic` itself, the design tools) and the old URL bridges
  - Where it points:  `engineFolder` in [the repo's epic settings](.epic/config.json5) (`../spell-epic`, from the
    main checkout).
  - `epic shared link` makes it (the worktree hook runs that for every new worktree), only in a checkout whose
    `.gitignore` ignores `spell-epic`:  a branch cut before the switch runs its own copy.
  - The main checkout:  `ln -s ../spell-epic spell-epic`, once (or `epic shared link` there).
  - Through the link:
    - the CLI's `epic` (`epicBin()`) and the engine's design tools (`spell dev design ...`)
    - the commands page's check (`spell dev commands`):  `epic`'s verbs and the plugin's skills
  - Beside it, by the settings:
    - the page server's epic route modules and the folders it watches (the root `package.json`'s `"pageServer"`)
    - the engine's routes, `/_epic/assets/` and `/_epic/pack/`, and Epic UI at `/components/epics/`
      (`engineRoutes`, `componentSets`;  [spell-server's server AGENTS.md](../spell-server/server/AGENTS.md))
    - its route modules run with their own aliases (`$/epics`, `$/server` through its `.spell-app`), by the
      run-time alias hook;  this repo's table has no `$/epics` since epic `repo-split` P8
  - A checkout without spell-epic beside it (CI) loads no epic routes;  the tests that need the engine skip themselves.
- `spell dev` keeps the old spellings, hidden, each handed on to `epic` (`runEpic()` in the CLI's `passThrough.ts`):
  - `spell dev plan-doc <tool order>` is `epic plan-doc`;  `spell dev details` is `epic ask`
  - `spell dev docs <verb>` is `epic pages <verb>`
  - `choices`, `comments`, `notes`, `agents`, `airplane`, `window`, `session`, `worktree`, `park`, `stock`, `shared`:
    the same verb of `epic`;  and `spell epic <verb>` is `epic <verb>`
  - `spell dev design bundle | check | <sync verb>` run the engine's design tools straight from the link.
- The generated files `epic worktree merge-main` rebuilds are this repo's own list, each branch's own:
  [the generators list](.epic/generators.json5) (T4).
  - The engine's own (the docs bundle, the epics pack, Epic UI's data) are spell-epic's to build.
- Its page bundles are built in spell-epic from the MAIN checkouts:  a worktree's change to Spell UI shows on
  the epic pages only once it's merged and the bundle rebuilt there (`yarn pack:build`, the docs bundle).

## Solid 2

- `spell`'s editor app, runners and web components are Solid 2, on `@spell-app/ui`.
  - Version `2.0.0-rc.13`, for every package of every repo:  one copy, pinned by the top repo's `resolutions`.
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
  - The versions are the yarn `catalog:` in the top repo's `.yarnrc.yml` (this repo's `.yarnrc.yml` is a copy of it,
    with no `yarnPath`:  the yarn release lives once, in the top repo).
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

- `yarn review` is the finishing pass (WWOD §1):  each package's, or the root's over all of them
  (or the top repo's, over every repo).
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
- NEVER hard-code `<package>/node_modules/<dep>`:  yarn hoists to the top repo's `node_modules`.
  - Node code resolves the package instead (in `ui`:  [NodePackage](../spell-ui/tools/NodePackage.ts)).
  - Nor `<repo>/node_modules`:  this repo has none, the install is the top repo's.
- Lint / format settings:  the toolchain's, `@spell-app/toolchain/lint` ([lint.ts](../spell-util/toolchain/src/lint.ts)).
  - Every `vite.config.ts` spreads it, in its lint and fmt blocks, the root's too.
  - No `.oxlintrc.json` / `.oxfmtrc.json` any more.
  - The editor and `vp check` read the ROOT block only.
    So a rule for some packages goes in `rootLint()`'s `overrides` too.
  - Our own rules, two JS plugins beside it:
    - `lint.patterns.ts`:  its rules, `spell-ui/*`, guard Spell UI's patterns in component files:
      "The lint guard" in [spell-ui's AGENTS.md](../spell-ui/AGENTS.md).
    - `lint.imports.ts`, everywhere:
      - `spell/no-cross-package-import` fails a `../` import from one package (or its tests) into another's folder
        (WWOD §4 › "Package aliases, never `../`")
      - `spell/no-cross-repo-alias` fails a `$/` alias into another repo's package (above, "Which package")
    - Their tests:  spell-ui's `tests/tools/LintPatterns.test.ts`, spell-util's
      `tests/toolchain/src/lint.imports.test.ts`.
- The root's `ts`, `test`, `lint`, `format` and `review` run this repo's packages' own, with
  `yarn workspaces foreach -W --exclude spell-app` (this repo's workspaces only, never another repo's):
  - `ts` first builds the lower repos' declarations (`spell-types --below`), then each package's, in dependency order
    (`--topological-dev`), 4 at a time
  - `review`, one at a time:  its tests flake under load
  - NOT `vp run -F '@spell-app/*'`, as before epic `repo-split` P8:  under the top install it matches EVERY repo's
    packages.
- `yarn vitest` here (and the VS Code vitest extension) reads the root's [vitest.config.ts](vitest.config.ts):  every
  package's projects, in one run.

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
