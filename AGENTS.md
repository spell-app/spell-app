# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this repository.

**ALWAYS, before any code:  READ `agents/wwod/WWOD.md` -- WWOD, "What Would Owen Do?", the house style
(process, style, naming, imports, errors, comments, functions, types, classes, decorators, CSS, tests ...).**  Its
table names the spoke to read for what you're touching.

**If working with Solid (2.0) -- components, JSX, effects / signals / stores, `core` rendering, `$/util`
reactivity, `@spell-app/ui` elements, or any React-to-Solid step:  READ `guides/solid/solid-2.md`
IN FULL FIRST.**  Solid 2 is neither React nor Solid 1, and guessing from either produces wrong code.

**If asked for a new skill or `spell` command, or about to add, rename or remove a yarn script:  READ
`guides/dev/commands/commands.md` FIRST,** and suggest where it belongs before building it
(see "Commands").

## Overview

- Spell:  the parser, the spell language and its tools, and `@spell-app/ui` -- one yarn workspace per folder in
  `packages/`.  Root `yarn ts` / `yarn test` / `yarn review` run each package's own script of that name.
- This file holds what's about THIS repo:  packages, worktrees, changelog, commands, toolchain, ledgers.  The house
  style every package shares is WWOD (`agents/wwod/`, above;  shared content, like the ledgers).  Each package's
  `AGENTS.md` holds only what's local to it;  a section there with the same name as one here, or as a WWOD rule,
  EXTENDS it ("As the root's, plus:", "As WWOD §4, plus:").
  - Codex reads every `AGENTS.md` from the root down to its working folder;  Claude Code loads the root `CLAUDE.md`
    plus the package's.  So a rule lives in exactly ONE place.
- Packages (`$/name` is the import alias, `$` meaning `packages/`;  `X` the self-namespace -- WWOD §8):
  - `packages/util/` (`@spell-app/util`, `$/util`) -- helpers `ui` and spell share:  small generic ones (`@proto` ...) and
    spell's own in `src/spell/` (lodash, `Observable`, `Task` ...).  See its `AGENTS.md`.
  - `packages/parser/` (`@spell-app/parser`, `$/parser`, `P`) -- the generic rule-based parser.  Rulex is an opt-in
    side-effect import, `$/parser/rulex`.  See its `AGENTS.md`.
  - `packages/markdown/` (`@spell-app/markdown`, `$/markdown`, `MD`) -- GitHub-flavoured markdown on the parser,
    drawing `ui-*` markup.  See its `AGENTS.md`.
  - `packages/core/` (`@spell-app/core`, `$/core`, `SC`) -- the runtime compiled spell runs on.
    See its `AGENTS.md`.
  - `packages/spell/` (`@spell-app/spell`, `$/spell`, `SP`) -- the spell LANGUAGE on the parser, every spell project
    (`projects/`), `PARSING.md` and `readme.md`.  See `packages/spell/AGENTS.md`.
  - `packages/lsp/` (`@spell-app/lsp`, `$/lsp`, `LSP`) -- spell's language server (browser-safe).  See its `AGENTS.md`.
  - `packages/app/` (`@spell-app/app`, `$/app`, `UI` / `F`) -- the web app, its server, the runner,
    and the `<spell-app>` / `<spell-editor>` web components.  `yarn start` / `build*` live here.
    See its `AGENTS.md`.
  - `packages/vscode/` -- the VS Code extension.  Its own yarn project (own `package.json` + `yarn.lock`), NOT a
    workspace:  `spell dev vscode` (or its two steps, `spell dev vscode build` / `install`) builds and installs it.
  - `packages/ui/` (`@spell-app/ui`, `$/ui`) -- Fomantic UI reborn as `ui-*` custom elements, on Solid 2.
    See `packages/ui/AGENTS.md`.
  - `packages/solid-element/` (`@spell-app/solid-element`) -- our fork of Solid's custom-element layer
    (`@solidjs/element` + `component-register`), which `@spell-app/ui` is built on.  No `AGENTS.md`:  see its
    `README.md`, and `UPSTREAM.md` for the upstream PR each fix maps to.
  - `packages/cli/` (`@spell-app/cli`, `$/cli`, `CLI`) -- the `spell` command-line tool, running the spell-family
    packages' SOURCE through `tsx`.  See `packages/cli/AGENTS.md` and its `README.md`.
  - `packages/docs/` (`@spell-app/docs`) -- every package's docs:  its `tools/`, the tooling and `_assets`
    (tracked, versioned per branch).  The pages themselves are SHARED root folders, not tracked here (see "Shared
    content"):  `epics/`, `guides/`, `templates/`, `pages/` (the docs home, `pages/index.html`).
    See `packages/docs/AGENTS.md`.
  - `packages/server/` (`@spell-app/server`, `$/server`, `SRV`) -- serving pages locally:  static folders, an
    Express-shaped router, live reload, ports, openers, a file lock, and the ONE page server per checkout
    (`spell dev server`) that serves docs, epics, goals and Spell UI docs.  See `packages/server/AGENTS.md`.
  - `packages/brand/` (`@spell-app/brand`, `$/brand`) -- Spell's brand:  Claude Design's pages and tokens (never edited), their
    Spell UI copies (`*.spell.html`), and the `<ui-brand-*>` elements those need.  The site header's Brand tab.
    See `packages/brand/AGENTS.md`.
- One change may touch several packages, but dependencies flow ONE way:
  `docs` -> anything (its experiments import any package;  nothing imports `docs`),
  `cli` -> `app` -> `lsp` -> `spell` -> `parser` / `core` -> `util`, `app` / `lsp` -> `markdown` -> `parser`,
  `brand` -> `ui` / `server`, and
  `ui` -> `solid-element` / `util`.  NEVER make `ui` or `solid-element` import `spell` or any package above it:
  `@spell-app/ui` lives on its own.
  - `server` is a LEAF (node built-ins only, imports no package):  ANY package may import it, `ui`'s tools too.
  - The ONE exception:  `ui` ships spell's highlighter PRE-COMPILED, `packages/ui/src/languages/spell.<lang>.js`, a
    committed bundle `yarn gen:spell` (in `packages/ui`) builds from `packages/spell/src/highlight/browser.ts`.  `ui`'s
    source never imports `$/spell`;  regenerate after changing spell's grammar.
    - Likewise markdown:  `packages/ui/src/components/ui-markdown/md.bundle.js`, built by `yarn gen:markdown` (in
      `packages/ui`) from `packages/markdown/src/browser.ts`;  regenerate after changing `markdown` or `parser`.
  - The direction is by convention, not enforced:  every alias works from every package.
- ONE alias table, `tsconfig.base.json` at the repo root, read its header comment.  Every package's `tsconfig.json`
  extends it, so `$/parser` means the same file wherever it's compiled from.
- Global ambient types (`Prettify`, `Class`, `AbstractClass`, `SplitString`, `__PACKAGE_VERSION__`, the `React*`
  aliases) are in the root `types/` folder, which every spell-family `tsconfig.json` includes:  used bare, no import
  (WWOD §9 › "Ambient globals used bare").  `vite.decorators.ts` and `vite.packageVersion.ts` are at the repo root.
- No `~/` or `#name` alias exists any more.  `$` means `packages/`, so `ui` is `$/ui` like the rest;  that can't
  collide with an npm package name (`@spell-app/...`, `solid-js`) the way a bare `name/...` could.

## Worktrees

- Owen works in VS Code windows opened from `workspaces/<pkg>.code-workspace` (`spell dev window init` writes
  missing ones and brings the rest up to date;  each has its own theme).  Each shows the WHOLE branch:  folder 1 is
  the REPO ROOT, then the shared content repo;  no package folder since 2026-10-06.  Why the root first:  the Claude
  panel lists only the sessions saved under a window's FIRST folder, so every window lists every session.
  - So sessions start at the repo root:  read the package's `AGENTS.md` before working in a package.
  - Each file shows ONCE in Explorer and Quick Open:  the window's `files.exclude` (`scripts/window.mjs`
    `filesExclude()`) shows the shared links only under `spell-app-dev`, and a worktree's window hides the main
    root's files (beside its git-ignored `.spell-main` marker);  `.vscode/settings.json` `search.exclude` keeps
    generated files, icons and screenshots out of Quick Open and Find.
- Enter a worktree with `/isolate <name>` (`/epic` does it too), or `EnterWorktree`.  The `WorktreeCreate` hook
  (`.claude/hooks/worktree.mjs`) makes `.claude/worktrees/<name>` on branch `<name>` from local `main`, and keeps the
  session saved at the root (Claude's own worktrees move it, and it drops out of every window's list).
- New window, or stay?  `spell dev window stay-check` recommends one, with reasons, and Owen picks in a
  modal (`.claude/skills/isolate/SKILL.md`, "Start", step 2b).  Staying is fine when the session is its window's
  only one.
  - A session that stays:  same tab, only its folder changes;  its changes show in Source Control, since every
    package window has `git.detectWorktrees` on (each worktree its own repo there).  The window is titled
    `⎇ <name>` and its title bar tinted at once (`spell dev window stay <name>`), put back at `/isolate done`.
  - NEVER add a worktree's folders to a package window (`spell dev window add`):  VS Code writes them into
    `workspaces/<pkg>.code-workspace`, and they stay there after the worktree is gone (three did, by 2026-10-03).
    Nobody sees them:  those files are `skip-worktree` in the main checkout, so Owen's theme changes never show
    as changes either.
  - A branch that changes those files merges onto `main` only once the flag is off:  back up the local files,
    `git update-index --no-skip-worktree`, `git checkout --` them, merge, write the local edits back on top, set the
    flag again (`agents/PAPERCUTS.md`, "claude-code").
- A new window:  open it at once, from the worktree's root:  `spell dev window open <name>`.
  On leaving (`/isolate done`), the session does NOT move back:  it stays in that window, which Owen closes
  (`... close <name>` closes it and deletes its file).  Then `... handoff <name> --prompt continue`:  when the turn ends, the session
  moves to that window, in an editor tab (never the sidebar), `continue` typed into it, and its old tab closes
  (the `Stop` hook, `.claude/hooks/handoff.mjs`).
  - So END THE TURN right after `handoff`:  the rest (`yarn install` ...) happens in the new window.
  - The old tab is found by the session's title.  The `UserPromptSubmit` hook `.claude/hooks/prompt-gate.mjs`
    renames the session on `/isolate <name>`, `/epic <name>` and `/unpark <name>`.  It also blocks those prompts in
    plan mode or inside another worktree, saving their text to `~/.spell/prompts/<name>.md` first.
  - The window:  `workspaces/ongoing/<name>.code-workspace` (git-ignored), in the look of the window it's opened
    from, or the one asked for (`/epic <name> -purple`:  Tomorrow Night Blue's look in one of 12 hues,
    `spell dev window color`;  `/epic color <look>` recolours the window you're in, live).  Folders:  the MAIN repo root first (so its Claude panel lists every session), then the
    worktree's root (`⎇ <name>`), then the shared content repo;  the main root's files hidden (above).
  - Why:  Owen reviews in VS Code;  edits a window doesn't show are invisible there.
  - `spell dev window` works in a fresh worktree, before its `yarn install`:  the `spell` link runs the MAIN
    checkout's CLI, which has its packages.  (`yarn window` couldn't:  yarn runs no script there before `yarn install`.)
  - A doc shown while the move is pending (`spell dev plan-doc open`, `spell dev window show`) waits, then shows
    beside the session in the window it moved to.
  - A running epic's plan doc is shared (see "Shared content"):  ONE file, the same in every checkout, so the MAIN
    checkout's page server shows it too, listed in the docs index's Epics section with the merged ones;
    `spell dev server url` gives that URL (`guides/server.html`, "Running epics").
- NEVER `code --add` / `--remove` (the focused window;  a one-folder window restarts its extensions, Claude panel
  included) or `code -r` (restarts the session).  `code <file>.code-workspace` only through `spell dev window open`.
- Leave with `ExitWorktree` `keep`;  the hook's `remove` never deletes uncommitted or unmerged work.
- Merge `main` into a branch with `spell dev worktree merge-main`, never a bare `git merge main`:  it REGENERATES
  each generated file both sides changed (bundles, site and brand assets, snapshots, `yarn.lock`) from the merged
  source, and stops on any other conflict (`--continue` once they're resolved and added).
  - Those files are `merge=binary` in the root `.gitattributes` (never line-merged), `-diff` when minified, and
    `linguist-generated` (collapsed in GitHub's PR diffs).  A new committed generated file:  add it there AND to
    `GENERATORS` in `packages/cli/src/dev/mergeMain.ts`.
  - It reports snapshot entries with a value NEITHER side had:  new behaviour nobody reviewed;  show them to Owen.
  - NOT `merge=ours`:  it drops the other side's changes silently, and GitHub ignores merge drivers anyway.
- Shelve a session's work while another session changes what it depends on:  `/park` (a WIP commit in its own
  worktree, plus a `PARKED-<name>.md` note), `/unpark` to pick it back up, or `/wait-for <other>` to wait for
  that session to finish, then merge `main` in and carry on by itself.
- Say so in one line ("isolated in worktree <name> (branch <name>), open in its own window, ⎇ <name>", or
  "..., staying in this window").

## Shared content

- These root folders are NOT tracked by spell-app (epic `shared-content`, live since 2026-10-04;  split into root
  folders by epic `claude-design` P4, 2026-10-05), and page URLs follow them (`/epics/seo/seo.plan.html`):
  - `epics/` -- plan docs, `epics/<name>/<name>.plan.html`, with their inboxes and details pages
  - `guides/` -- every other docs page (`guides/solid/solid-2.html`), with its `.md`, `.json`, `experiments/`
  - `templates/` -- one starting point per kind of page
  - `pages/` -- the docs home, `pages/index.html`, and the scratch details pages, `pages/details/`
  - `ui/` -- Spell UI's hand-written docs pages (claude-design P6), served at `/ui/` with each branch's built
    `packages/ui/site/_assets/` and `_data/` laid over them (`packages/ui/AGENTS.md`, `site/`)
  - `goals/` -- the goal sets (their tooling:  `packages/docs/tools/goals/`, tracked)
  - `agents/` -- the three logs (`agents/PAPERCUTS.md`, `agents/SUSPECTED-BUGS.md`, `agents/CODE-DEBT.md`), and
    WWOD, the house style (`agents/wwod/`):  one copy of the rules for every branch
- In EVERY checkout (main and each worktree) they're folder SYMLINKS into one shared content repo beside the main
  checkout, `../spell-app-dev`:  an ordinary git repo, local only.
  - So every worktree sees every edit at once:  no per-branch copy, and these files never conflict on merge.
  - Folders, never single-file links:  Claude's Edit refuses to write through a link to a file.
  - Claude edits shared files at their REAL path:  `/Users/owen/www/spell-app/spell-app-dev/<path>` (e.g.
    `.../spell-app-dev/agents/PAPERCUTS.md`), from main or any worktree.  A worktree session's Edit / Write refuses a
    path through the links ("Edit the worktree copy of this file instead of the shared-checkout path":  there is no
    worktree copy), before any hook could step in.  Reading and tools (`spell dev plan-doc`, the page server) use the
    links as usual.
  - The manifest:  the root `package.json`'s `"shared": { "dir", "links" }`, and `.gitignore`'s
    `# shared:start` ... `# shared:end` block.  A checkout's links are its OWN branch's manifest's:
    `spell dev shared link` after merging a manifest change.
  - Old paths (until every checkout has merged the reorg, claude-design T1):  the shared repo's
    `packages/docs/content/` holds a link per old entry into the root folders (`epics -> ../../../epics`,
    `solid -> ../../../guides/solid`), so older code still finds `packages/docs/content/...`;  the page server
    redirects `/packages/docs/content/<x>` to the new URL.  Older code writes old-style links and pages at old
    paths:  `spell dev shared commit` (every turn) runs the reorg's repair first, and `spell dev shared repair`
    does it by hand (`packages/docs/tools/relocate.js` `reorgShared()`).
- Commits:  the shared repo is committed by itself after every Claude turn (`Stop` hook
  `.claude/hooks/shared-commit.mjs` -> `spell dev shared commit`), as `auto: <checkout>` with `Session:` /
  `Checkout:` trailers.  Nobody commits those files by hand.
  - NEVER `git add` / `git checkout --` / `git restore` the shared paths in spell-app.
  - NEVER run git inside a shared folder (`epics/`, `guides/` ...:  it's the shared repo there):  run it in the
    spell-app checkout.
- `spell dev shared status | init | link | commit | migrate <worktree> | repair` (`--dry-run` on the last two).
  - A new worktree is linked by the `WorktreeCreate` hook.
  - A worktree cut before the cutover runs `spell dev shared migrate <name>` before it merges `main`;  first
    merging `0fc52e02` (main just before the cutover) if it predates the docs move.
  - After merging a branch from before the docs move:  `spell dev shared repair` moves pages it left at
    `packages/docs/<x>` into their shared folders, and fixes links (and their tab names) written for an old layout.
- Shared docs may link code another branch has and this one doesn't yet:  `doc-links.js --check` reports those as
  missing in this checkout.
- Package windows show `spell-app-dev` as a folder, with its own Source Control:  the auto commits.
- Searching:  the links are git-ignored.
  - `grep -R` follows them (`grep -r` doesn't);  `rg` needs `-L --no-ignore-vcs`;  or search `../spell-app-dev`.
- Plan-doc item fixes carry the epic's name:  `<epic> I3:  ...`;  phase commits stay `P3:  <phase name> -- ...`.

## Changelog

- `guides/changelog.html` -- what the repo shipped, newest first.  MUST be kept up to date by every
  `/isolate` and `/epic`:
  - `/epic`:  at its Doc Review, add the entry to "2. In worktrees";  when it merges into `main`, move it under
    its month in "3. Merged into main"
  - `/isolate done`:  before merging into `main`, add an entry for what the branch shipped (skip a branch with
    nothing worth a reader's time:  typo fixes, a papercut)
- It's shared (see "Shared content"):  write an entry straight into it, from any checkout.  No branch commit, no
  merge conflicts:  the `Stop` hook commits it.
- An entry:  one nested `<ui-section id="<epic or worktree name>" header="YYYY-MM-DD · Title">` under its month,
  newest first (the page's header comment has the markup):
  - a `spell-meta` list with LINKS:  the plan doc (`epics/<name>/<name>.plan.html`, `target="<name>"`), the durable
    doc, the branch
  - EVERYTHING it shipped, one bullet each, by phase when there are phases -- not a summary
- Then finish the page as `packages/docs/AGENTS.md` says ("Finishing a page"), and bump its footer's date.

## Commands

- Three ways to make the repo do something:  the `spell` CLI, Claude skills, yarn scripts.  Their map, one row
  per operation:  `guides/dev/commands/commands.html` (data:  `commands.json` beside it;  shown by
  the page server:  `spell dev docs open guides/dev/commands/commands.html`).
- Target:  the CLI drives everything.  Repo tools are `spell dev <noun> <verb>`;  skills keep judgement and dialog
  and call it;  yarn keeps each package's own scripts and aliases the rest.
- Owen asks for a new skill or `spell` command, or you add a yarn script to solve a problem:  READ
  `guides/dev/commands/commands.md`, then SUGGEST, before building:  where it belongs, its name,
  what it replaces, which roadmap move it advances.
- MUST keep the page true in the same change:  `commands.json`, then `spell dev commands check`.
  - `commands.json` / `commands.md` are shared, but the check reads each branch's CLI:  a branch adding a command
    can make main's check fail until it merges (`agents/CODE-DEBT.md`, "docs").
- Tools are TypeScript (or node JS in `packages/docs/tools`), never python:  one language.  Skills reach them as
  `spell dev ...`:  `spell` is `yarn cli:install`'s link, made once per machine;  without it,
  `node packages/cli/bin/spell.mjs dev ...` from a checkout's root.

## Solid 2

- `spell`'s editor app, runners and web components are Solid 2 (`2.0.0-rc.13`, every package, one copy at the root)
  on `@spell-app/ui`;  compiled spell still draws with React, for now (`agents/CODE-DEBT.md`, "app").
- The rules:  `guides/solid/solid-2.md` (see the top of this file).  NOT `@`-imported on purpose:
  it loads only when the task needs it.  Claude also has the `solid-2` skill (`.claude/skills/solid-2/`), which
  triggers on Solid work.
- The why and the measurements:  `guides/solid/solid-2.html`.
  The API:  `guides/solid/cheatsheet.html`.
- MUST keep `solid-2.md` up to date when a Solid decision changes or an RC bump changes behaviour.
- How `ui` writes its elements on Solid:  "Solid authoring" in `packages/ui/AGENTS.md`.
- House style for app components, on top of `solid-2.md`:  WWOD §17 (`agents/wwod/solid.md`).

## Toolchain:  Vite+

- One dev dependency, `vite-plus` (command `vp`), pins vite (as `@voidzero-dev/vite-plus-core`), vitest, oxlint,
  oxfmt and tsgolint together:  the versions are the yarn `catalog:` in `.yarnrc.yml`.  Node 24 (`engines`).
  - Bump them together:  `vite-plus` and every `catalog:` entry to what `vp toolchain` lists.  NEVER pin one tool
    on its own.
- Commands, run in a package or the root:  `yarn vp lint`, `yarn vp fmt [--check]`, `yarn vp test`, `yarn vp check`.
- `yarn review` (each package's, or the root's over all of them) ~== `yarn ts` + `yarn lint:fix` + `yarn format` +
  `yarn test`:  the finishing pass (WWOD §1).
  `yarn oxfmt` / `yarn oxlint` no longer work in a package (not its own deps);  `yarn vitest` still does.
- Configs import from `vite-plus` (lint rule `vite-plus/prefer-vite-plus-imports`);  tests:  WWOD §20 › "Test APIs
  come from Vite+".
- `yarn tsc`, never `npx tsc`:  yarn picks the workspace's TypeScript 7.  Why:  a dependency's own TypeScript can
  take `.bin/tsc` (`ui`'s `vite-plugin-dts` needs `@typescript/typescript6`;  hoisting makes the root's 7 today, by
  luck of the hoister:  `agents/PAPERCUTS.md`, `## ui`).
- NEVER hard-code `<package>/node_modules/<dep>`:  yarn hoists to the root.  Node code resolves the package instead
  (`ui`:  `tools/NodePackage.ts`).
- Lint / format settings:  the repo root's `vite.lint.ts`, spread by every `vite.config.ts` (`lint` / `fmt`
  blocks).  No `.oxlintrc.json` / `.oxfmtrc.json` any more.
  - The editor and `vp check` read the ROOT block only:  a rule for some packages goes in `rootLint()`'s
    `overrides` too.
- Root `ts` / `test:packages` / `review` are `vp run` over every `@spell-app/*` package:  `ts` and
  `test:packages` 4 at a time, `review` one at a time (its tests flake under load).
  - NEVER `vp run --cache` a plain script:  its file tracking misses TS 7's native `tsc`, so it replays a stale
    pass.  A cached task needs `run.tasks` with explicit `cache.input` (`epics/vite-plus`, I1).
  - Flags BEFORE the task name (`vp run --cache -r ts`):  after it, they go to the task.

## Long-term debt

- `agents/CODE-DEBT.md` tracks structural debt we have knowingly chosen NOT to fix yet.
- It, `agents/SUSPECTED-BUGS.md` and `agents/PAPERCUTS.md` live in `agents/`, shared (see "Shared content"):  one
  file each for every package, with a `## <package>` section per package.  Add to your package's section.
- Add an entry when a problem is structural, too big to fix in passing, and being tolerated
  deliberately -- especially when a test or lint rule is pinned, skipped or widened to
  accommodate it.  Record the mechanism, not a guess, so nobody rediscovers it.
- NOT for local cleanups (inline `REFACTOR:` marker), suspected bugs (`agents/SUSPECTED-BUGS.md`)
  or tooling papercuts (`agents/PAPERCUTS.md`).
- See that file's header for the entry format.
- `agents/PAPERCUTS.md`:  anything that slowed down development.  Lost time to one mid-session?  Append
  date · symptom · fix · project.  Check it FIRST when tooling fails mysteriously.
- `agents/SUSPECTED-BUGS.md`:  something that looks like a bug, but you're not sure:  add it under its package.
