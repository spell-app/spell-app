# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this repository.

**ALWAYS, before any code:  READ `agents/wwod/WWOD.md` -- WWOD, "What Would Owen Do?", the house style
(process, style, naming, imports, errors, comments, functions, types, classes, decorators, CSS, tests ...).**  Its
table names the spoke to read for what you're touching.  This file holds only what's about THIS repo.

**If working with Solid (2.0) -- components, JSX, effects / signals / stores, `core` rendering, `$/util`
reactivity, `@spell-app/ui` elements, or any React-to-Solid step:  READ `packages/docs/content/solid/solid-2.md` IN FULL
FIRST.**  Solid 2 is neither React nor Solid 1, and guessing from either produces wrong code.

**If asked for a new skill or `spell` command, or about to add, rename or remove a yarn script:  READ
`packages/docs/content/dev/commands/commands.md` FIRST,** and suggest where it belongs before building it (see "Commands").

## Overview

- Spell:  the parser, the spell language and its tools, and `@spell-app/ui` -- one yarn workspace per folder in
  `packages/`.  Root `yarn ts` / `yarn test` / `yarn review` run each package's own script of that name.
- This file holds what's about THIS repo:  packages, worktrees, changelog, commands, toolchain, ledgers.  The house
  style every package shares is WWOD (`agents/wwod/`, above;  shared content, like the ledgers).  Each package's `AGENTS.md` holds only
  what's local to it;  a section there with the same name as one here, or as a WWOD rule, EXTENDS it ("As the
  root's, plus:", "As WWOD §4, plus:").
  - Codex reads every `AGENTS.md` from the root down to its working folder;  Claude Code loads the root `CLAUDE.md`
    plus the package's.  So a rule lives in exactly ONE place.
- Packages (`$/name` is the import alias, `$` meaning `packages/`;  `X` the self-namespace -- WWOD §4):
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
    workspace:  `yarn vscode` / `vscode:build` / `vscode:install` run from the REPO ROOT.
  - `packages/ui/` (`@spell-app/ui`, `$/ui`) -- Fomantic UI reborn as `ui-*` custom elements, on Solid 2.
    See `packages/ui/AGENTS.md`.
  - `packages/solid-element/` (`@spell-app/solid-element`) -- our fork of Solid's custom-element layer
    (`@solidjs/element` + `component-register`), which `@spell-app/ui` is built on.  No `AGENTS.md`:  see its
    `README.md`, and `UPSTREAM.md` for the upstream PR each fix maps to.
  - `packages/cli/` (`@spell-app/cli`, `$/cli`, `CLI`) -- the `spell` command-line tool, running the spell-family
    packages' SOURCE through `tsx`.  See `packages/cli/AGENTS.md` and its `README.md`.
  - `packages/docs/` (`@spell-app/docs`) -- every package's docs:  hand-authored `.html` pages on `@spell-app/ui`,
    their templates, the plan docs `/epic` keeps, the experiments behind them and the tooling.
    Index:  `packages/docs/content/index.html`.  See `packages/docs/AGENTS.md`.
  - `packages/server/` (`@spell-app/server`, `$/server`, `SRV`) -- serving pages locally:  static folders, an
    Express-shaped router, live reload, ports, openers, a file lock, and the ONE page server per checkout
    (`yarn server`) that serves docs, epics, goals and Spell UI docs.  See `packages/server/AGENTS.md`.
- One change may touch several packages, but dependencies flow ONE way:
  `docs` -> anything (its experiments import any package;  nothing imports `docs`),
  `cli` -> `app` -> `lsp` -> `spell` -> `parser` / `core` -> `util`, `app` / `lsp` -> `markdown` -> `parser`, and
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
- Global ambient types (`Prettify`, `Class`, `__PACKAGE_VERSION__` ...) are in the root `types/` folder, which every
  spell-family `tsconfig.json` includes.  `vite.decorators.ts` and `vite.packageVersion.ts` are at the repo root.
- No `~/` or `#name` alias exists any more.  `$` means `packages/`, so `ui` is `$/ui` like the rest;  that can't
  collide with an npm package name (`@spell-app/...`, `solid-js`) the way a bare `name/...` could.

## Worktrees

- Owen works in one VS Code window per package, opened from `workspaces/<pkg>.code-workspace` (`yarn window
  init` writes missing ones;  each has its own theme).  Folder 1 is the REPO ROOT, folder 2 the package.  Why:  the
  Claude panel lists only the sessions saved under a window's FIRST folder, so every window lists every session.
  - So sessions start at the repo root:  read the package's `AGENTS.md` before working in a package.
- Enter a worktree with `/isolate <name>` (`/epic` does it too), or `EnterWorktree`.  The `WorktreeCreate` hook
  (`.claude/hooks/worktree.mjs`) makes `.claude/worktrees/<name>` on branch `<name>` from local `main`, and keeps the
  session saved at the root (Claude's own worktrees move it, and it drops out of every window's list).
- New window, or stay?  `node scripts/window.mjs stay-check` recommends one, with reasons, and Owen picks in a
  modal (`.claude/skills/isolate/SKILL.md`, "Start", step 2b).  Staying is fine when the session is its window's
  only one.
  - A session that stays:  same tab, only its folder changes;  its changes show in Source Control, since every
    package window has `git.detectWorktrees` on (each worktree its own repo there).
  - NEVER add a worktree's folders to a package window (`window.mjs add`):  VS Code writes them into
    `workspaces/<pkg>.code-workspace`, and they stay there after the worktree is gone (three did, by 2026-10-03).
    Nobody sees them:  those files are `skip-worktree` in the main checkout, so Owen's theme changes never show
    as changes either.
  - A branch that changes those files merges onto `main` only once the flag is off:  back up the local files,
    `git update-index --no-skip-worktree`, `git checkout --` them, merge, write the local edits back on top, set the
    flag again (`agents/PAPERCUTS.md`, "claude-code").
- A new window:  open it at once, from the worktree's root:  `node scripts/window.mjs open <name>`.
  On leaving (`/isolate done`), the session does NOT move back:  it stays in that window, which Owen closes
  (`... close <name>` closes it and deletes its file).  Then `... handoff <name> --prompt continue`:  when the turn ends, the session
  moves to that window, in an editor tab (never the sidebar), `continue` typed into it, and its old tab closes
  (the `Stop` hook, `.claude/hooks/handoff.mjs`).
  - So END THE TURN right after `handoff`:  the rest (`yarn install` ...) happens in the new window.
  - The old tab is found by the session's title.  The `UserPromptSubmit` hook `.claude/hooks/prompt-gate.mjs`
    renames the session on `/isolate <name>`, `/epic <name>` and `/unpark <name>`.  It also blocks those prompts in
    plan mode or inside another worktree, saving their text to `~/.spell/prompts/<name>.md` first.
  - The window:  `workspaces/ongoing/<name>.code-workspace` (git-ignored), the package window's theme with a title
    bar tinted per worktree.  Folders:  the MAIN repo root first (so its Claude panel lists every session), then the
    worktree's root (`⎇ <name>`);  no package folder, and `packages/` shows in both.
  - Why:  Owen reviews in VS Code;  edits a window doesn't show are invisible there.
  - `node`, not `yarn window`:  `yarn` runs no script in a worktree before its `yarn install`.
  - A doc shown while the move is pending (`yarn plan-doc open`, `window.mjs show`) waits, then shows beside the
    session in the window it moved to.
  - A running epic's plan doc is on the MAIN checkout's page server too (`/worktrees/<w>/...`), listed in the docs
    index's Epics section, with the merged ones;  `yarn server url` gives that URL (`packages/docs/content/server.html`,
    "Running epics").
- NEVER `code --add` / `--remove` (the focused window;  a one-folder window restarts its extensions, Claude panel
  included) or `code -r` (restarts the session).  `code <file>.code-workspace` only through `window.mjs open`.
- Leave with `ExitWorktree` `keep`;  the hook's `remove` never deletes uncommitted or unmerged work.
- Shelve a session's work while another session changes what it depends on:  `/park` (a WIP commit in its own
  worktree, plus a `PARKED-<name>.md` note), `/unpark` to pick it back up, or `/wait-for <other>` to wait for
  that session to finish, then merge `main` in and carry on by itself.
- Say so in one line ("isolated in worktree <name> (branch <name>), open in its own window, ⎇ <name>", or
  "..., staying in this window").

## Changelog

- `packages/docs/content/changelog.html` -- what the repo shipped, newest first.  MUST be kept up to date by every `/isolate`
  and `/epic`:
  - `/epic`:  at its Doc Review, add the entry to "2. In worktrees";  when it merges into `main`, move it under
    its month in "3. Merged into main"
  - `/isolate done`:  before merging into `main`, add an entry for what the branch shipped (skip a branch with
    nothing worth a reader's time:  typo fixes, a papercut)
- An entry:  one nested `<ui-section id="<epic or worktree name>" header="YYYY-MM-DD · Title">` under its month,
  newest first (the page's header comment has the markup):
  - a `spell-meta` list with LINKS:  the plan doc (`epics/<name>/<name>.plan.html`, `target="<name>"`), the durable
    doc, the branch
  - EVERYTHING it shipped, one bullet each, by phase when there are phases -- not a summary
- Then finish the page as `packages/docs/AGENTS.md` says ("Finishing a page"), and bump its footer's date and
  commit.

## Commands

- Three ways to make the repo do something:  the `spell` CLI, Claude skills, yarn scripts.  Their map, one row
  per operation:  `packages/docs/content/dev/commands/commands.html` (data:  `commands.json` beside it;  shown by the page
  server:  `yarn docs:open dev/commands/commands.html`).
- Target:  the CLI drives everything.  Repo tools are `spell dev <noun> <verb>`;  skills keep judgement and dialog
  and call it;  yarn keeps each package's own scripts and aliases the rest.
- Owen asks for a new skill or `spell` command, or you add a yarn script to solve a problem:  READ
  `packages/docs/content/dev/commands/commands.md`, then SUGGEST, before building:  where it belongs, its name, what it
  replaces, which roadmap move it advances.
- MUST keep the page true in the same change:  `commands.json`, then `yarn commands:check`.
- Tools are TypeScript (or node JS in `packages/docs/tools`), never python:  one language.  Skills reach them as
  `spell dev ...`:  `spell` is `yarn cli:install`'s link, made once per machine;  without it,
  `node packages/cli/bin/spell.mjs dev ...` from a checkout's root.

## Solid 2

- `spell`'s editor app, runners and web components are Solid 2 (`2.0.0-rc.13`, every package, one copy at the root)
  on `@spell-app/ui`;  compiled spell still draws with React, for now (`agents/CODE-DEBT.md`, "app").
  Solid 2 is NEITHER React NOR Solid 1.
- The rules:  `packages/docs/content/solid/solid-2.md` (see the top of this file).  NOT `@`-imported on purpose:
  it loads only when the task needs it.  Claude also has the `solid-2` skill (`.claude/skills/solid-2/`), which
  triggers on Solid work.
- The why and the measurements:  `packages/docs/content/solid/solid-2.html`.
  The API:  `packages/docs/content/solid/cheatsheet.html`.
- MUST keep `solid-2.md` up to date when a Solid decision changes or an RC bump changes behaviour.
- How `ui` writes its elements on Solid:  "Solid authoring" in `packages/ui/AGENTS.md`.
- House style for app components, on top of `solid-2.md`:  WWOD §17 (`agents/wwod/solid.md`).

## Toolchain:  Vite+

- One dev dependency, `vite-plus` (command `vp`), pins vite (as `@voidzero-dev/vite-plus-core`), vitest, oxlint,
  oxfmt and tsgolint together:  the versions are the yarn `catalog:` in `.yarnrc.yml`.  Node 24 (`engines`).
  - Bump them together:  `vite-plus` and every `catalog:` entry to what `vp toolchain` lists.  NEVER pin one tool
    on its own.
- Commands, run in a package or the root:  `yarn vp lint`, `yarn vp fmt [--check]`, `yarn vp test`, `yarn vp check`.
  `yarn oxfmt` / `yarn oxlint` no longer work in a package (not its own deps);  `yarn vitest` still does.
- Tests import from `vite-plus/test` (`/browser`, `/browser-playwright`), configs from `vite-plus`:  lint rule
  `vite-plus/prefer-vite-plus-imports`.
- Lint / format settings:  the repo root's `vite.lint.ts`, spread by every `vite.config.ts` (`lint` / `fmt`
  blocks).  No `.oxlintrc.json` / `.oxfmtrc.json` any more.
  - The editor and `vp check` read the ROOT block only:  a rule for some packages goes in `rootLint()`'s
    `overrides` too.
- Root `ts` / `test:packages` / `review` are `vp run` over every `@spell-app/*` package:  `ts` and
  `test:packages` 4 at a time, `review` one at a time (its tests flake under load).
  - NEVER `vp run --cache` a plain script:  its file tracking misses TS 7's native `tsc`, so it replays a stale
    pass.  A cached task needs `run.tasks` with explicit `cache.input` (`packages/docs/content/epics/vite-plus`, I1).
  - Flags BEFORE the task name (`vp run --cache -r ts`):  after it, they go to the task.

## Long-term debt

- `agents/CODE-DEBT.md` tracks structural debt we have knowingly chosen NOT to fix yet.
- It, `agents/SUSPECTED-BUGS.md` and `agents/PAPERCUTS.md` live at the REPO ROOT:  one file each for every package, with a
  `## <package>` section per package.  Add to your package's section.
- Add an entry when a problem is structural, too big to fix in passing, and being tolerated
  deliberately -- especially when a test or lint rule is pinned, skipped or widened to
  accommodate it.  Record the mechanism, not a guess, so nobody rediscovers it.
- NOT for local cleanups (inline `REFACTOR:` marker), suspected bugs (`agents/SUSPECTED-BUGS.md`)
  or tooling papercuts (`agents/PAPERCUTS.md`).
- See that file's header for the entry format.
