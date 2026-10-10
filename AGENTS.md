# AGENTS.md

This file guides AI coding agents (Claude Code, Codex, and others)
working with code in this repository.

**ALWAYS, before any code:  READ [WWOD](agents/wwod/WWOD.md), "What Would Owen Do?", the house style.**
- It covers process, style, naming, imports, errors, comments, functions, types, classes, decorators, CSS,
  tests ...
- Its table names the spoke to read for what you're touching.

**If working with Solid (2.0):  READ [the Solid 2 rules](guides/solid/solid-2.md) IN FULL FIRST.**
- Solid work is any of:
  - components, JSX, effects / signals / stores
  - `core` rendering, `$/util` reactivity
  - `@spell-app/ui` elements
  - any React-to-Solid step
- Solid 2 is neither React nor Solid 1,
  and guessing from either produces wrong code.

**If asked for a new skill or `spell` command, or about to add, rename or remove a yarn script:
READ [the commands guide](guides/dev/commands/commands.md) FIRST,**
and suggest where it belongs before building it (see "Commands").

## Overview

- Spell:  the parser, the spell language and its tools, and `@spell-app/ui`.
  - One yarn workspace per folder in `packages/`.
  - The root's yarn scripts of these names run each package's own script of that name:
    `yarn ts`, `yarn test`, and `yarn review`.
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
- Alias:  how code imports the package, `$/name`, with `$` meaning `packages/`.
- Namespace:  the package's self-namespace (WWOD §8).

| Folder | Package | Alias | Namespace | What it is |
| --- | --- | --- | --- | --- |
| [util](packages/util/AGENTS.md) | `@spell-app/util` | `$/util` | | helpers `ui` and spell share:  small generic ones (`@proto` ...), and spell's own in `src/spell/` (lodash, `Observable`, `Task` ...) |
| [parser](packages/parser/AGENTS.md) | `@spell-app/parser` | `$/parser` | `P` | the generic rule-based parser;  Rulex is an opt-in side-effect import, `$/parser/rulex` |
| [markdown](packages/markdown/AGENTS.md) | `@spell-app/markdown` | `$/markdown` | `MD` | GitHub-flavoured markdown on the parser, drawing `ui-*` markup |
| [core](packages/core/AGENTS.md) | `@spell-app/core` | `$/core` | `SC` | the runtime compiled spell runs on |
| [spell](packages/spell/AGENTS.md) | `@spell-app/spell` | `$/spell` | `SP` | the spell LANGUAGE on the parser, every spell project (`projects/`), `PARSING.md` and `readme.md` |
| [lsp](packages/lsp/AGENTS.md) | `@spell-app/lsp` | `$/lsp` | `LSP` | spell's language server (browser-safe) |
| [app](packages/app/AGENTS.md) | `@spell-app/app` | `$/app` | `UI` | the web app, its server, the runner, and the `<spell-app>` / `<spell-editor>` web components;  `yarn start` / `build*` live here |
| `packages/vscode/` | | | | the VS Code extension (below) |
| [ui](packages/ui/AGENTS.md) | `@spell-app/ui` | `$/ui` | | Fomantic UI reborn as `ui-*` custom elements, on Solid 2 |
| [cli](packages/cli/AGENTS.md) | `@spell-app/cli` | `$/cli` | `CLI` | the `spell` command-line tool, running the spell-family packages' SOURCE through `tsx`;  see its [README](packages/cli/README.md) too |
| [docs](packages/docs/AGENTS.md) | `@spell-app/docs` | | | every package's docs:  its `tools/`, the tooling and `_assets` (tracked, versioned per branch) |
| [server](packages/server/AGENTS.md) | `@spell-app/server` | `$/server` | `SRV` | serving pages locally (below) |
| [assembler](packages/assembler/AGENTS.md) | `@spell-app/assembler` | `$/assembler` | `AS` | assembling pages, for every tool that writes them (below) |
| [brand](packages/brand/AGENTS.md) | `@spell-app/brand` | `$/brand` | | Spell's brand, the site header's Brand tab (below) |

More on some of them:
- `packages/vscode/` is its own yarn project (own `package.json` + `yarn.lock`), NOT a workspace.
  - `spell dev vscode` builds and installs it.
  - Or its two steps:  `spell dev vscode build`, then `install`.
- docs:  the pages themselves are SHARED root folders, not tracked here (see "Shared content").
  - `epics/`, `guides/`, `templates/`
  - `pages/`:  the docs home, [the docs index](pages/index.html)
- server:  static folders, an Express-shaped router, live reload, ports, openers, a file lock.
  - And the ONE page server per checkout (`spell dev server`),
    which serves docs, epics, goals and Spell UI docs.
- assembler:
  - link targets (`Linker`)
  - in-memory formatting (`formatHTML()`)
  - the bundles built on demand (`Bundle`)
  - later, the page server's assembly code
- brand:  Claude Design's pages and tokens (never edited), and their Spell UI copies (`*.spell.html`).
  - And the `<ui-brand-*>` elements those copies need.

### Which package may import which

One change may touch several packages, but dependencies flow ONE way:

```text
docs -> anything          (its experiments import any package, and nothing imports docs)
cli -> app -> lsp -> spell -> parser / core -> util
app / lsp -> markdown -> parser
brand -> ui / server
ui -> util
```

- NEVER make `ui` import `spell` or any package above it:  `@spell-app/ui` lives on its own.
- `server` is a LEAF (node built-ins only, imports no package).
  - ANY package may import it, `ui`'s tools too.
- `assembler` is node-only and imports no package (it uses linkedom and oxfmt).
  - docs and epics import it.
  - Any other node-side package or tool may import it too.
- The ONE exception:  `ui` ships spell's highlighter PRE-COMPILED.
  - It's a committed bundle per language:  [`spell.<lang>.js`](packages/ui/src/languages/).
  - `yarn gen:spell` (in `packages/ui`) builds it
    from [the highlighter's browser entry](packages/spell/src/highlight/browser.ts).
  - `ui`'s source never imports `$/spell`.
  - Regenerate after changing spell's grammar.
  - Likewise markdown:  [md.bundle.js](packages/ui/src/components/ui-markdown/md.bundle.js).
    - `yarn gen:markdown` (in `packages/ui`) builds it
      from [markdown's browser entry](packages/markdown/src/browser.ts).
    - Regenerate after changing `markdown` or `parser`.
- The direction is by convention, not enforced:  every alias works from every package.

### Aliases and global types

- ONE alias table, `tsconfig.base.json` at the repo root:  read its header comment.
  - Every package's `tsconfig.json` extends it,
    so `$/parser` means the same file wherever it's compiled from.
- Global ambient types are in the root `types/` folder.
  - Used bare, no import (WWOD §9 › "Ambient globals used bare").
  - Every spell-family `tsconfig.json` includes that folder.
  - The types:  `Prettify`, `Class`, `AbstractClass`, `SplitString`, `__PACKAGE_VERSION__`.
- `vite.decorators.ts` and `vite.packageVersion.ts` are at the repo root.
- No `~/` or `#name` alias exists any more.
  - `$` means `packages/`, so `ui` is `$/ui` like the rest.
  - That can't collide with an npm package name (`@spell-app/...`, `solid-js`),
    the way a bare `name/...` could.

## Worktrees

### Windows

- Owen works in VS Code windows opened from `workspaces/<pkg>.code-workspace`.
  - `spell dev window init` writes missing ones, and brings the rest up to date.
  - Each has its own theme.
- Each window shows the WHOLE branch:
  - folder 1 is the REPO ROOT, then the shared content repo
  - no package folder since 2026-10-06
  - Why the root first:  the Claude panel lists only the sessions saved under a window's FIRST folder,
    so every window lists every session.
  - So sessions start at the repo root:  read the package's `AGENTS.md` before working in a package.
- Each file shows ONCE in Explorer and Quick Open:
  - The window's `files.exclude` shows the shared links only under `spell-app-dev`
    ([filesExclude()](scripts/window.mjs) writes it).
  - A worktree's window hides the main root's files (beside its git-ignored `.spell-main` marker).
  - `search.exclude` in [the repo's VS Code settings](.vscode/settings.json)
    keeps generated files, icons and screenshots out of Quick Open and Find.

### Entering one

- Enter a worktree with `/isolate <name>` (`/epic` does it too), or `EnterWorktree`.
- The `WorktreeCreate` hook ([worktree.mjs](.claude/hooks/worktree.mjs)):
  - makes `.claude/worktrees/<name>` on branch `<name>`, from local `main`
  - keeps the session saved at the root
    (Claude's own worktrees move it, and it drops out of every window's list)
- New window, or stay?
  - `spell dev window stay-check` recommends one, with reasons, and Owen picks in a modal
    ([the isolate skill](.claude/skills/isolate/SKILL.md), "Start", step 2b).
  - Staying is fine when the session is its window's only one.
  - A session that stays:  same tab, only its folder changes.
    - Its changes show in Source Control,
      since every package window has `git.detectWorktrees` on (each worktree its own repo there).
    - The window is titled `⎇ <name>` and its title bar tinted at once (`spell dev window stay <name>`).
    - Both are put back at `/isolate done`.
  - NEVER add a worktree's folders to a package window (`spell dev window add`).
    - VS Code writes them into `workspaces/<pkg>.code-workspace`,
      and they stay there after the worktree is gone (three did, by 2026-10-03).
    - Nobody sees them:  those files are `skip-worktree` in the main checkout,
      so Owen's theme changes never show as changes either.
  - A branch that changes those files merges onto `main` only once the flag is off
    ([the papercuts log](agents/PAPERCUTS.md), "claude-code"):
    1. back up the local files
    2. `git update-index --no-skip-worktree`
    3. `git checkout --` them
    4. merge
    5. write the local edits back on top
    6. set the flag again

### A new window

- Open it at once, from the worktree's root:  `spell dev window open <name>`.
- On leaving (`/isolate done`), the session does NOT move back:  it stays in that window, which Owen closes.
  - `... close <name>` closes it and deletes its file.
- Then `... handoff <name> --prompt continue`.
  When the turn ends:
  - the session moves to that window, in an editor tab (never the sidebar)
  - `continue` is typed into it
  - its old tab closes (the `Stop` hook, [handoff.mjs](.claude/hooks/handoff.mjs))
- So END THE TURN right after `handoff`:  the rest (`yarn install` ...) happens in the new window.
- The old tab is found by the session's title.
  - The `UserPromptSubmit` hook, [prompt-gate.mjs](.claude/hooks/prompt-gate.mjs), renames the session
    on `/isolate <name>`, `/epic <name>` and `/unpark <name>`.
  - The hook also blocks those prompts in plan mode or inside another worktree,
    saving their text to `~/.spell/prompts/<name>.md` first.
  - Except `/epic <name>` inside another worktree:  it means "open a window for `<name>`",
    so Claude offers one.
    - `spell dev window launch <name>`:  a NEW session there.
    - The epic skill's "From another worktree" has the steps.
- The window's file, `workspaces/ongoing/<name>.code-workspace`, is git-ignored.
  - Its look:  that of the window it's opened from, or the one asked for.
  - `/epic <name> -purple`:  Tomorrow Night Blue's look in one of 12 hues (`spell dev window color`).
  - `/epic color <look>` recolours the window you're in, live.
  - Its folders:  the MAIN repo root first (so its Claude panel lists every session),
    then the worktree's root (`⎇ <name>`), then the shared content repo.
  - The main root's files are hidden (above).
- Why:  Owen reviews in VS Code;  edits a window doesn't show are invisible there.
- `spell dev window` works in a fresh worktree, before its `yarn install`.
  - The `spell` link runs the MAIN checkout's CLI, which has its packages.
  - `yarn window` couldn't:  yarn runs no script there before `yarn install`.
- A doc shown while the move is pending waits, then shows beside the session in the window it moved to.
  - That's `spell dev plan-doc open` or `spell dev window show`.
- A running epic's plan doc is shared (see "Shared content"):  ONE file, the same in every checkout.
  - So the MAIN checkout's page server shows it too,
    listed in the docs index's Epics section with the merged ones.
  - `spell dev server url` gives that URL ([the page server guide](guides/server.html), "Running epics").
- NEVER `code --add` / `--remove`:
  they act on the focused window, and a one-folder window restarts its extensions, Claude panel included.
- NEVER `code -r`:  it restarts the session.
- `code <file>.code-workspace` only through `spell dev window open`.

### Leaving, merging, shelving

- Leave with `ExitWorktree` `keep`.
  - The hook's `remove` never deletes uncommitted or unmerged work.
- Merge `main` into a branch with `spell dev worktree merge-main`, never a bare `git merge main`.
  - It REGENERATES each generated file both sides changed, from the merged source:
    bundles, site and brand data, snapshots, `yarn.lock`.
  - It stops on any other conflict;  `--continue` once they're resolved and added.
  - Those generated files are marked in the root `.gitattributes`:
    - `merge=binary`:  never line-merged
    - `-diff`, when minified
    - `linguist-generated`:  collapsed in GitHub's PR diffs
  - A new committed generated file:
    add it there AND to `GENERATORS` in [mergeMain.ts](packages/cli/src/dev/mergeMain.ts).
  - NOT committed at all (since 2026-10-07):  the bundles only the page server serves,
    whose hashed chunk names churned every diff.
    - Spell UI's docs site:  its `_assets/`, in [ui's site](packages/ui/site/)
    - the brand pages':  `_assets/ui/`, in [brand](packages/brand/)
    - They're git-ignored.
      The page server builds the stale ones when it starts, and a page waits for them.
    - `spell dev bundles build [--stale]` / `check`;  `Bundle` in `$/assembler`.
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
  - `epics/` -- plan docs, `epics/<name>/<name>.plan.html`, with their inboxes and details pages
  - `guides/` -- every other docs page ([the Solid 2 guide](guides/solid/solid-2.html), say),
    with its `.md`, `.json`, `experiments/`
  - `templates/` -- one starting point per kind of page
  - `pages/` -- [the docs home](pages/index.html), and the scratch details pages, `pages/details/`
  - `ui/` -- Spell UI's hand-written docs pages (claude-design P6), served at `/ui/`.
    - Each branch's built `_assets/` and `_data/`, from [ui's site](packages/ui/site/), are laid over them.
    - Those assets are built by the page server, not committed.
    - More:  [ui's AGENTS.md](packages/ui/AGENTS.md), `site/`.
  - `brand/` -- the Brand tab's pages ([brand's AGENTS.md](packages/brand/AGENTS.md)):
    Claude Design's exports and their Spell UI copies
  - `goals/` -- the goal sets.
    Their tooling is tracked, in [docs' goals tools](packages/docs/tools/goals/).
  - `agents/` -- one copy of the rules for every branch:
    - the three logs:
      [PAPERCUTS.md](agents/PAPERCUTS.md), [SUSPECTED-BUGS.md](agents/SUSPECTED-BUGS.md),
      [CODE-DEBT.md](agents/CODE-DEBT.md)
    - WWOD, the house style (`agents/wwod/`)

### How they're linked

- In EVERY checkout (main and each worktree) they're folder SYMLINKS into one shared content repo.
  - It's `../spell-app-dev`, beside the main checkout:  an ordinary git repo, local only.
  - So every worktree sees every edit at once:  no per-branch copy, and these files never conflict on merge.
  - Folders, never single-file links:  Claude's Edit refuses to write through a link to a file.
- Claude edits shared files at their REAL path, from main or any worktree.
  - That's `/Users/owen/www/spell-app/spell-app-dev/<path>`.
  - E.g. `.../spell-app-dev/agents/PAPERCUTS.md`.
  - A worktree session's Edit / Write refuses a path through the links, before any hook could step in.
    It says "Edit the worktree copy of this file instead of the shared-checkout path":
    there is no worktree copy.
  - Reading and tools (`spell dev plan-doc`, the page server) use the links as usual.
- The manifest has two parts:
  - the root `package.json`'s `"shared": { "dir", "links" }`
  - the `# shared:start` ... `# shared:end` block in `.gitignore`
  - A checkout's links are its OWN branch's manifest's:
    `spell dev shared link` after merging a manifest change.
- Old paths last until every checkout has merged the reorg (claude-design T1).
  - The shared repo's `packages/docs/content/` holds a link per old entry into the root folders:
    `epics -> ../../../epics`, `solid -> ../../../guides/solid`.
  - So older code still finds `packages/docs/content/...`.
  - The page server redirects `/packages/docs/content/<x>` to the new URL.
  - Older code writes old-style links, and pages at old paths.
    - `spell dev shared commit` (every turn) runs the reorg's repair first.
    - `spell dev shared repair` does it by hand
      ([reorgShared()](packages/docs/tools/relocate.js)).

### Commits

- The shared repo is committed by itself after every Claude turn.
  - The `Stop` hook, [shared-commit.mjs](.claude/hooks/shared-commit.mjs), runs `spell dev shared commit`.
  - Nobody commits those files by hand.
- One commit per place the files live:
  - `auto: epic <name>`
  - `auto: guides/<folder or file>`
  - `auto: goals/<set>`
  - `auto: agents`;  `pages`, `templates`, `ui` and `brand` likewise
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

- `spell dev shared status | init | link | commit | migrate <worktree> | repair`
  - `--dry-run` on the last two
- A new worktree is linked by the `WorktreeCreate` hook.
- A worktree cut before the cutover runs `spell dev shared migrate <name>` before it merges `main`.
  - First it merges `0fc52e02` (main just before the cutover), if it predates the docs move.
- After merging a branch from before the docs move:  `spell dev shared repair`.
  - It moves pages the branch left in `packages/docs/` into their shared folders.
  - It fixes links (and their tab names) written for an old layout.
- Shared docs may link code another branch has and this one doesn't yet:
  `doc-links.js --check` reports those as missing in this checkout.
- Package windows show `spell-app-dev` as a folder, with its own Source Control:  the auto commits.
- Searching:  the links are git-ignored.
  - `grep -R` follows them (`grep -r` doesn't).
  - `rg` needs `-L --no-ignore-vcs`.
  - Or search `../spell-app-dev`.
- Plan-doc item fixes carry the epic's name:  `<epic> I3:  ...`.
  - Phase commits stay `P3:  <phase name> -- ...`.

## Changelog

- [The changelog](guides/changelog.html):  what the repo shipped, newest first.
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
    - the plan doc:  `epics/<name>/<name>.plan.html`, with `target="<name>"`
    - the durable doc
    - the branch
  - Then EVERYTHING it shipped, one bullet each, by phase when there are phases -- not a summary.
- Then finish the page as [docs' AGENTS.md](packages/docs/AGENTS.md) says ("Finishing a page"),
  and bump its footer's date.

## Commands

- Three ways to make the repo do something:  the `spell` CLI, Claude skills, yarn scripts.
- Their map, one row per operation:  [the commands page](guides/dev/commands/commands.html).
  - Its data:  `commands.json` beside it.
  - Shown by the page server:  `spell dev docs open guides/dev/commands/commands.html`.
- Target:  the CLI drives everything.
  - Repo tools are `spell dev <noun> <verb>`.
  - Skills keep judgement and dialog, and call it.
  - Yarn keeps each package's own scripts, and aliases the rest.
- Owen asks for a new skill or `spell` command, or you add a yarn script to solve a problem:
  - READ [the commands guide](guides/dev/commands/commands.md).
  - Then SUGGEST, before building:  where it belongs, its name, what it replaces,
    which roadmap move it advances.
- MUST keep the page true in the same change:  `commands.json`, then `spell dev commands check`.
  - `commands.json` and `commands.md` are shared, but the check reads each branch's CLI.
  - So a branch adding a command can make main's check fail until it merges
    ([the code-debt log](agents/CODE-DEBT.md), "docs").
- Tools are TypeScript (or node JS in [docs' tools](packages/docs/tools/)), never python:  one language.
- Skills reach them as `spell dev ...`.
  - `spell` is the link `yarn cli:install` makes, once per machine.
  - Without it:  `node packages/cli/bin/spell.mjs dev ...` from a checkout's root.

## Solid 2

- `spell`'s editor app, runners and web components are Solid 2, on `@spell-app/ui`.
  - Version `2.0.0-rc.13`, for every package:  one copy at the root.
  - So is what compiled spell draws (epic `output-targets` P10-P11).
  - React is left only in the `spell` CLI's terminal screens (Ink).
- The rules:  [solid-2.md](guides/solid/solid-2.md) (see the top of this file).
  - NOT `@`-imported on purpose:  it loads only when the task needs it.
  - Claude also has the [solid-2 skill](.claude/skills/solid-2/SKILL.md), which triggers on Solid work.
- The why and the measurements:  [the Solid 2 guide](guides/solid/solid-2.html).
- The API:  [the Solid 2 cheatsheet](guides/solid/cheatsheet.html).
- MUST keep `solid-2.md` up to date when a Solid decision changes, or an RC bump changes behaviour.
- How `ui` writes its elements on Solid:  "Solid authoring" in [ui's AGENTS.md](packages/ui/AGENTS.md).
- House style for app components, on top of `solid-2.md`:  WWOD §17 ([solid.md](agents/wwod/solid.md)).

## Toolchain:  Vite+

- One dev dependency, `vite-plus` (command `vp`), pins these together:
  - vite (as `@voidzero-dev/vite-plus-core`)
  - vitest, oxlint, oxfmt and tsgolint
  - The versions are the yarn `catalog:` in `.yarnrc.yml`.
- Node 24 (`engines`).
- Bump them together:  `vite-plus` and every `catalog:` entry, to what `vp toolchain` lists.
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

- `yarn oxfmt` / `yarn oxlint` no longer work in a package (not its own deps);  `yarn vitest` still does.
- Configs import from `vite-plus` (lint rule `vite-plus/prefer-vite-plus-imports`).
  - Tests:  WWOD §20 › "Test APIs come from Vite+".
- `yarn tsc`, never `npx tsc`:  yarn picks the workspace's TypeScript 7.
  - Why:  a dependency's own TypeScript can take `.bin/tsc`.
  - `ui`'s `vite-plugin-dts` needs `@typescript/typescript6`.
  - Hoisting makes it the root's 7 today, by luck of the hoister
    ([the papercuts log](agents/PAPERCUTS.md), "## ui").
- NEVER hard-code `<package>/node_modules/<dep>`:  yarn hoists to the root.
  - Node code resolves the package instead (in `ui`:  [NodePackage](packages/ui/tools/NodePackage.ts)).
- Lint / format settings:  the repo root's `vite.lint.ts`.
  - Every `vite.config.ts` spreads it, in its `lint` / `fmt` blocks.
  - No `.oxlintrc.json` / `.oxfmtrc.json` any more.
  - The editor and `vp check` read the ROOT block only:
    a rule for some packages goes in `rootLint()`'s `overrides` too.
- The root's `ts`, `test:packages` and `review` are `vp run` over every `@spell-app/*` package.
  - `ts` and `test:packages` run 4 at a time.
  - `review` runs one at a time:  its tests flake under load.
  - NEVER `vp run --cache` a plain script.
    Its file tracking misses TS 7's native `tsc`, so it replays a stale pass.
  - A cached task needs `run.tasks` with explicit `cache.input` (`epics/vite-plus`, I1).
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
