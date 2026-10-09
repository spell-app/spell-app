# `spell` command line

Compile, check, describe, explore, watch, run and test spell projects from a terminal.  It runs straight from this
checkout, through `tsx`, so there's no build step, and it sees projects exactly as the language server does.

Code:  `src/` (namespace `CLI`, imported as `$/cli`), started by `bin/spell.mjs`.  See the header of `src/main.ts`.

This package holds ONLY the command line.  Spell itself -- the parser, the language, the language server, the
runtime, and the projects in `spell/projects/` -- is the spell-family packages beside this one in the monorepo,
along with `ui`:

```
packages/
  cli/         this package
  spell/       the spell language, and `projects/`:  its SOURCE runs, straight from `../spell/src`
  parser/      the generic parser
  core/  the runtime compiled spell runs on
  lsp/         the language server
  ui/          `@spell-app/ui`
```

- `package.json` depends on `spell` and `ui` as workspaces (`workspace:*`), and the aliases reach the rest;  one `yarn` at the monorepo root installs everything.
- `$/cli` is this package's `src/`;  `$/spell`, `$/parser`, `$/lsp` ... are the others'.  One alias table for the whole
  monorepo:  `tsconfig.base.json`.
- Moved here from the parser's `CLI` branch (`26830ef1`) on 2026-09-30.


## Instructions

### Install

```sh
yarn               # once, anywhere in the monorepo:  installs every package
yarn cli:install   # links `spell` into the first writable folder on your PATH:  ~/.local/bin, npm's global bin,
                   # /usr/local/bin, /opt/homebrew/bin.  Or:  SPELL_BIN_DIR=/some/dir yarn cli:install
spell --help
```

The link points at `bin/spell.mjs` in this checkout.  Edit the source and the next `spell` runs the new code.

### Naming what to work on

Every command takes one or more projects (a lone spell file counts as a one-file project):

| You type | Means |
|---|---|
| `Card.spell`, `./path/to/Project`, `.` | a spell file, or the project in a folder |
| `@workspace` | the project in the current folder |
| `@library/cards`, `@test/Solitaire`, `@examples/Solitaire` | one project, by its root's short name |
| `@system:library:cards` | one project, by full id |
| `@library`, `@examples`, `@user`, `@system` | a whole root:  pick from a list, with "All projects" first |

- `--all` takes every project in a root without asking, e.g. in a script.  With no terminal to ask on, a bare root
  lists its projects and exits `2`.
- A root holding just one project uses it without asking.

### Commands

| Command | What it does |
|---|---|
| `spell help [command]` | Lists the commands, or shows one's options:  `spell help compile` ~== `spell compile --help`. |
| `spell serve [project]` | Runs everything -- the spell app's editor (vite, hot reload) and this checkout's page server (`spell dev server`:  the app's `/api`, which saves files to disk, plus docs, epics, goals and Spell UI) -- and opens the editor on `project` in your browser, until `Ctrl-C`.  `--port <n>` (the editor's;  default 3000), `--headless`. |
| `spell dev commands [list\|check]` | Every yarn script, `spell` command and skill, against the commands page (`guides/dev/commands/commands.json`):  `list` marks each ✓ / ✗, `check` prints only the gaps and exits 1 on any.  `--json`.  The first of the repo-tool commands, `spell dev <noun> <verb>`:  the plan for the rest is that page's Roadmap. |
| `spell dev agents <verb> ...` | The running-agents list of this checkout's epic (`epics/<epic>/agents.json`), else of the checkout (`.spell-agents.json` at its root);  both git-ignored.  `add <name> "<task>" [--status active\|"blocked on <name>"] [--task-id <id>]` (prints the full name), `set <name> [--status] [--task-id]`, `done <name>`, `list [--json]` (the default), `wait [--every <s>] [--max <s>] [--json]` (in the background:  exits 0 with Owen's untold redirect notes from the plan doc, 3 when nothing runs, 2 on timeout), `told <name>`;  any verb `--epic <name>`.  Names get a prefix:  the epic's, else the worktree's, else `main` (`add aaa` in epic `skillz` is `skillz-aaa`).  An entry leaves when its agent finishes;  the file goes when empty.  Runs `packages/docs/tools/agents.ts`;  for the `/bg` skill and every agent Claude starts. |
| `spell dev wwod [check] [files...]` | The agents' rules:  every `WWOD §N › "title"` citation names a real section and rule, and every backticked repo path exists, in WWOD (`agents/wwod/`), the `AGENTS.md` / `CLAUDE.md` files, `goals/AGENTS.md` and `solid-2.md`;  skills for citations only.  Exits 1 on a broken one.  `--json`.  Run it after editing WWOD or an `AGENTS.md`. |
| `spell dev plan-doc <command> <name> ...` | Edits a plan doc (`epics/<name>/<name>.plan.html`) as the `/epic` skill does, from anywhere, in the nearest checkout (a worktree's, when run in one).  Alone, lists its commands, e.g. `summary <name>`, `phase <name> 2 done`.  Root `yarn plan-doc`;  `spell plan-doc` still works (deprecated). |
| `spell dev goals <command> ...` | The goals tool (`packages/docs/tools/goals/`) of the nearest goals folder:  `help` lists its commands.  Root `yarn goals`;  `spell goals` still works (deprecated). |
| `spell dev docs <verb> ...` | The docs tools:  `update`, `index`, `new`, `open`, `link` -- each as root `yarn docs:<verb>` ran it, in `packages/docs`, arguments passed as they are, e.g. `spell dev docs open solid/solid-2 --vs`. |
| `spell dev details <command> ...` | The `/details` skill's tool, `packages/docs/tools/details.js`.  Root `yarn details`. |
| `spell dev choices <command> ...` | Syntax-choices pages, `packages/docs/tools/choices.js`:  `new <slug> --rows <rows.json>`, `show`, `wait`, `answer`, `list` -- a table of names Claude recommends, one row per use site, which Owen goes through one by one and sends with "Do it" (`guides/syntax-choices.html`). |
| `spell dev server <verb> ...` | This checkout's page server, its own verbs as they are:  `serve`, `start` / `ensure`, `stop`, `status`, `url <file>`.  `start --all`:  every web server of the checkout (page server, editor, Spell UI) and where each is, `scripts/serve.mjs`.  Root `yarn server`, `yarn serve`. |
| `spell dev worktree merge-main [--continue]` | Merges `main` into this checkout's branch, regenerating every generated file both sides changed (bundles, site and brand assets, snapshots, `yarn.lock`;  the table:  `GENERATORS` in `src/dev/mergeMain.ts`), then commits "Merge main into `<branch>`".  Another file in conflict stops it mid-merge:  resolve, `git add`, then `--continue`.  Lists snapshot entries neither side had, to review.  `--json`.  `/isolate done` and park Resume use it. |
| `spell dev pack <verb> ...` | Component packs:  another package's custom elements (`<epic-*>` ...), which a page loads on demand through `<ui-root>`.  `new <name> [--prefix x-]` makes `packages/<name>/` from `templates/pack/package/` (only the files it lacks;  `package.json` merged) and wires it into the checkout;  `element <pack> <tag>` adds one family from `templates/pack/element/`;  `build <pack>` writes `pack/`:  the catalog (from the vocabularies, by Spell UI's `tools/RootCatalog.ts`), the entry, and ONE classic script, `<pack>.pack.js`;  `check [<pack>]` exits 1 when `pack/` is stale (no pack:  every pack).  `new` / `element` build too, unless `--no-build`.  `--json`.  Each pack's `yarn pack:build` / `pack:check`. |
| `spell dev window <command> ...` | VS Code windows per package and worktree, `scripts/window.mjs`:  `open`, `close`, `handoff`, `show`, `which`, `stay-check` ...  Works in a worktree before its `yarn install`.  Root `yarn window`. |
| `spell dev vscode [build\|install]` | The VS Code extension:  `build` its `.vsix` (`yarn install`, `build`, `package` in `packages/vscode`), `install` it into VS Code, no verb both.  Root `yarn vscode`, `vscode:build`, `vscode:install`. |
| `spell icons [query]` | Finds `@spell-app/ui` icons by name, alias or keyword:  name, pack, other names.  `--pack <id>`, `--json`.  `--open` shows them as pictures in your browser (click one to copy its name), until `Ctrl-C`. |
| `spell static <pages...>` | `@spell-app/ui` pages as plain HTML for crawlers and no-JS readers:  each `ui-*` element rendered to light DOM (no shadow DOM), the scripts that load the elements removed.  Writes `page.static.html` beside `page.html`, and ONE minified stylesheet per output folder, `ui.static.css`, which every page there links (the browser caches it).  `-o <file>` (one page) or `-o <folder>` (several), `--css <file>` (one stylesheet elsewhere), `--inline-css` (each page's own `<style>` instead), `--no-minify`.  A folder:  every `.html` in it. |
| `spell compile <projects...>` | Writes each project's `<Project>.compiled.js` and `<Project>.declarations.json`, each other target's output (`--target <name>`, or `project.json`'s `"targets"`:  `SP.TARGETS`), and with no errors its scope pack `<Project>.scopes.js`.  `--stdout` prints it and writes nothing.  `--force` recompiles the projects it imports, too.  A `.spell` file prints its javascript. |
| `spell check <projects...>` | Lists errors on stdout as `path:line:col  message`.  `--json` for a JSON list. |
| `spell describe <project> [name] [member]` | What the Type Explorer shows, as text.  E.g. `spell describe Card.spell Card color`.  `--compiled`, `--inherited`, `--json`. |
| `spell explore [project]` | Full-screen Type Explorer.  `↑↓` move, `←→` fold, `Tab` switch pane, `/` filter, `c` compiled, `i` inherited, `o` open in editor, `e` edit its description, `q` quit.  Reloads as files change. |
| `spell watch [projects...]` | Recompiles on every save, with a live list of errors.  `--check-only` re-checks and writes nothing.  `--test` runs tests after each clean rebuild (`--name` picks which).  Rebuilds a watched project when one it imports changes.  `q` / `Ctrl-C` stops it. |
| `spell run [project]` | Compiles and runs the project under node.  Its `print`s show as they happen.  One that shows a UI then opens in your browser, until `Ctrl-C`.  `--browser` always, `--no-browser` never. |
| `spell test [projects...]` | Runs each `to test ...` and reports ✓, or ✗ with the checks that failed.  `--verbose` shows every check.  `--name <text>` runs only tests whose names contain it.  `--watch` is `spell watch --test`. |
| `spell format <projects...>` | Tidies `.spell` files' whitespace, as VS Code's Format Document does.  `--check` writes nothing, lists what would change, exits 1 if anything would.  Never writes into `projects/test/`. |
| `spell projects [root]` | Lists the project roots, or one root's projects, with the names to type.  `--json`. |
| `spell speed [module]` | Times the parser's rule tests (`SP.spellParser.speedTest()`), 3 fresh runs, as a markdown table.  `--against HEAD` times that commit too, in a temp worktree, and adds a Change row.  `--runs`, `--json`. |
| `spell parse "<text>"` | How spell reads a line:  its match tree, then its javascript.  Tried as a `statement`, then an `expression`;  `--rule` for another.  `--in <project>` parses in that project's scope.  `--json`. |
| `spell repl [project]` | `spell parse`, a line at a time;  what a line declares, later lines know.  `↑↓` earlier lines, `Esc` quits.  Piped, it reads stdin. |
| `spell explain <word>` | Rules `word` names or starts (`print`, `repeat`):  syntax and an example.  `--in <project>`:  also what that project declares by that name, as the editor's hover.  `--json`. |
| `spell new <name>` | Makes `<name>/project.json` and a starter `<name>.spell` that prints a hello.  In `@user`'s folder, or `--in <folder>`.  Refuses a folder with anything in it. |

- No project named:  the project here, for every command.  Outside a project, in a terminal, `spell` asks -- completing as
  you type, like a shell:  `Tab` completes a root (`@examples/`), then a project, then "entire project" or one of
  its files;  your last 3 picks come first (kept in `.recent-projects.json`, gitignored).  Piped, it says to name one.
- Names in `describe` ignore case, and spaces ~== `-` ~== `_`:  `stock pile` finds `Stock_Pile`.
- Everywhere:  `--verbose` lets spell's own logging through, on stderr.  `NO_COLOR=1` turns colour off.
- `o` in `explore` runs `$SPELL_EDITOR -g path:line`, `code` by default.  Cursor works too.
- Exit codes:  `0` fine, `1` the spell has errors or a test failed, `2` the command line is wrong.
- Output goes to stdout;  progress and screens go to stderr.  So `spell compile --stdout x | less` still works.


## Caveats

### What can write files

- `compile` writes `<Project>.compiled.js`, as the app does.  With no errors, also `<Project>.scopes.js`, as the
  language server does.  `--stdout` writes neither.  `watch` the same after each rebuild, unless `--check-only`.
- `static` writes `<page>.static.html` beside each page and `ui.static.css` in each output folder, or where `-o` /
  `--css` say.
- `check`, `describe`, `explore`, `run` and `test` write nothing of their own.  But if a project imports one that
  has NEVER been compiled, it's compiled first, which writes that project's `.compiled.js`.  Parsing fails without it.
- An imported project's existing `.compiled.js` is used as is, even if its sources changed since.  Compile it first.
- `run` / `test` compile to a temp file, never into the project.
- A folder, or a loose `.spell` file, with no `project.json` at or above it is REFUSED:  loading it would write
  a `project.json` there (`projectUtils.getIndex()`).
- Loading any project may still rewrite its `project.json` if its imports are out of step with its files.  That's
  `getIndex()`, the same as in the app.

- `dev pack new` / `element` write a pack's files (never over one that's there) and edit the checkout's root files:
  `package.json`, `tsconfig.base.json`, `vitest.config.ts`, `vite.lint.ts`, `.gitattributes`, `src/dev/mergeMain.ts`
  and the shared commands page, `guides/dev/commands/commands.json`.  `dev pack build` writes the pack's `pack/`.

### `dev pack`

- Templates:  `templates/pack/`, every file `*.template` (so no tool reads one as code), with `__token__`s filled in
  (`__pack__`, `__prefix__`, `__tag__`, `__Class__` ...:  `PackTokens` in `src/dev/packNew.ts`).  A file named
  `gitignore.template` becomes `.gitignore`.  How they're filled, and how to add one:  `templates/README.md`.
- A pack is a package whose `package.json` has `"spellPack": { "prefix": "epic-" }`.
- The build runs Vite in-process (`configFile: false`) on the checkout's Spell UI `baseConfig()`;  only `solid-js`,
  `@solidjs/web`, `$/ui/core` and `$/ui/forms` stay external (`PACK_MODULES`), read from
  `globalThis.SpellUI.packModules`;  any other Spell UI or Solid import fails the build.
- `define()`, in the generated entry, imports every family barrel:  inlined in the one script, run when called;  it
  returns that promise.
- Staleness:  a hash of `components/` and `src/` (tests left out), recorded in the catalog's second line and the
  script's banner;  the catalog's text is compared too.  Doesn't build, so each pack's test runs it.
- `pack new` adds the pack's scripts to the commands page beside `brand`'s:  main's `spell dev commands check` names
  them as missing until the branch merges.

### `run` / `test`

- They run in a separate node process, so each run gets a fresh `spellCore`.
- Under node, what needs a browser does nothing, with a note:  starting a UI (`start the game`) and installing
  styles.  Then `run` on a UI project opens it in your browser:
  - a page with `app`'s `<spell-app>` element, served from `localhost` until `Ctrl-C`:  the project as compiled for
    this run (nothing written), its scope pack for the Type Explorer, and the compiled projects it imports
  - the first time in a checkout, it builds `<spell-app>` (`yarn build:element` in `packages/app`, a few seconds)
  - no live reload:  it serves what was compiled at the start
  - `SPELL_NO_BROWSER=1` prints the URL instead of opening a browser
- Other browser-only code, e.g. touching `document` directly, will throw.
- `test`:
  - A test the project runs ITSELF as it loads counts once, and isn't run again.  A second run would start from
    what the first left behind, e.g. a dealt deck.
  - A test that throws FAILS, with the error.  Spell's own `spellCore.test()` swallows it silently.
  - It finds tests by their exported function names:  `test_*`.
  - `print` inside a test is hidden unless `--verbose`.

### `serve`

- Starts this checkout's PAGE SERVER if it isn't running (`packages/server`;  port 4747, else any free one), whose
  route modules serve the app's `/api` (`app`'s `appRoutes.ts`), goals' buttons, docs, epics and `/ui/`.
- Runs `app`'s own `yarn start:dev` (vite) in its own process group, passing `/api` on to the page server;  records
  it in `.spell-server.editor.json`, so the site header's "Editor" (`/editor` on the page server) reaches it.
- `Ctrl-C`, or vite stopping:  stops vite, and the page server if it started it (one that already ran, stays).
  It stops no other servers and runs no `yarn install`.
- Refuses an editor port in use, rather than drifting to another:  `spell serve --port 3100`, or `yarn stop` in
  `packages/app`.
- Opens only projects in the app's roots (`spell projects`):  a project in some other folder opens the chooser.
- Their output is hidden unless `--verbose`, or one fails.

### `static`

- Renders through `@spell-app/ui`'s static server render (`$/ui/static`, plan doc `epics/seo/seo.plan.html`)
  in a child process, `src/runner/renderStatic.ts`, on an SSR-only Vite server (`ui/tools/StaticRenderer.ts`):  `ui`'s
  Solid JSX must compile for the server, which `tsx` can't.  Each run starts Vite and compiles every family, so a page
  takes about 3 seconds;  several pages share one run.
- Renders the families in `StaticCatalog` (`ui/src/static/`);  any other `ui-*` tag (`ui-code`, `ui-markdown` ...)
  stays as it is, and is listed on stderr.
- Removes a `<script>` (or `<link rel="modulepreload">`) whose `src` or text names `@spell-app/ui`, `$/ui`, `ui`'s
  `src/` / `dist/`, a family folder, or the docs' `spell-ui.js` bundle:  the elements must not load on a static page,
  or they'd show the content twice.  Other scripts stay, import maps too.
- Links the stylesheet FIRST in `<head>`, before the page's own CSS:  its `@layer ui-slotted, page, ui;` sets the layer
  order before a page sheet names a `ui.*` layer.
- Rewrites the page's own CSS for the flattened output (`ui-card` => `[data-ui="card"]`, `::part()`, `:state()`):
  its `<style>`s, and each LOCAL linked stylesheet the rewrite changes, inlined in its place as a
  `<style data-static-from="...">` (relative `url()`s rebased).  Remote sheets, `@import`s and sheets that don't
  parse stay as they are:  their `ui-*` / `::part()` rules don't apply to the static page.
- ONE stylesheet per output folder, `ui.static.css` (or `--css <file>`), linked from every page there, so the
  browser fetches it once.  It holds the families its pages use AND whatever it held before:  its first line,
  `/*! spell-static {...} */`, records what it covers (tags, and which sheets they adopt), and a later run builds the
  union, so re-rendering one page never drops another page's styles.  To start a folder's sheet afresh, delete it.
- `--inline-css`:  each page gets its own stylesheet, holding only its families, in a `<style>`;  no file.
- Minified by Lightning CSS, which keeps `@scope`, `@layer`, `:where()` and `light-dark()` (nothing is lowered),
  sheet by sheet:  a family sheet it can't parse (`ui-popup`'s `@container anchored()`) only has its comments and
  blank lines stripped, with a warning.
- Never overwrites a page:  `-o` naming the input is refused.  Outputs are overwritten without asking.

### `speed`

- Each run is a fresh node process:  `src/runner/speedTest.mts` (a warm-up, then 20 timed passes).
- A side's runs combine as:  the mean of their averages, the lowest min, the highest max.  With 3 or more runs, ONE
  fluke -- an average 25% over the median -- is dropped.
- `--against <ref>`:
  - makes a temp `git worktree` of the ref, links our `node_modules` into it, and copies the runner in -- a ref
    with different dependencies may not run
  - the ref must have `packages/spell` and the `$/` aliases:  from the monorepo on
  - the two sides take turns, run by run;  the worktree is removed afterwards, even on failure

### `watch`

- It watches each project's folder:  `.spell`, `.css`, `project.json`.  It ignores `*.compiled.js` and `*.scopes.js`.
- Watching both a project and one it imports:  the importer rebuilds, from scratch, after the imported one does.
  A project imported but not watched isn't seen changing.
- On macOS a save arrives as a `rename` event, so `watch` ignores event types and looks at what's on disk.
  See `agents/PAPERCUTS.md`.

### `explore`

- It needs a real terminal.  Otherwise it says to use `describe`, which prints the same text.
- `o` needs an editor that opens in its own window and takes `-g`.  A terminal editor like vim can't run inside
  the full-screen view.
- It reads the project once:  quit and restart to see edits.

### General

- **It runs the other packages' working copies:**  whatever is in `../spell`, `../parser`, `../lsp` ... right now.
  A half-finished change there breaks `spell`, and `yarn ts` here reports their type errors too.
- **Startup takes about half a second:**  `tsx` compiles their source on each run, and caches it.
  `spell dev ...` starts in about a fifth of that:  `bin/spell.mjs` runs `src/devMain.ts`, which loads no spell, then
  the tool as a child `node` (`spell dev window which` ~0.17s), or `plan-doc`'s in the same process
  (`spell dev plan-doc summary` ~0.3s).  Its commands
  that need spell (`session`, `stock` ...) take the usual half second.
- **Ink is pinned at 5,** from when this lived in the parser, whose app is on React 18:  6+ needs React 19.
  This repo has its own React, so it's free to move.
- **`yarn` warns `YN0072 ... --preserve-symlinks`,** about the two links.  Ignore it:  node follows each link to
  the real folder, so those packages' imports find their own dependencies -- which is what we want.
- **`console.*` is silenced in the CLI** (`src/consoleGuard.ts`):  spell logs a lot, e.g. every `serverPath`
  lookup.  Write output with `session.out()` / `session.err()`.  An Ink screen MUST render with
  `patchConsole: false`.
- **Property names show as `short_suit`, not `short-suit`:**  that's what the Type Explorer gives.  See the
  parser's `agents/SUSPECTED-BUGS.md`.
- **Name clashes:**  a shell alias or function named `spell` hides the command.  Check `type -a spell` in a login
  shell.
- **Test projects:**  running a `projects/test/` project from VS Code's ▶ Run Project writes `<Project>.compiled.js`
  and `settings.json5` into it.  Test projects should stay frozen, so delete those.


## TODO

### Commands not built yet

- `spell lsp`:  start the language server, so the extension spawns `spell lsp` rather than a `tsx` path

### Improvements

- Bundle into one file, so it installs without a checkout.  It needs:
  - `keepNames` (rules register by class name)
  - the `~` alias
  - `__PACKAGE_VERSION__`
  - `environment.ts` to stop finding `projects/` next to `src/`
- `run`:  optionally run UI projects in a real browser (e.g. playwright, already a dev dependency), or under a fake
  DOM.

### Review items

- Not yet reviewed by a person.  Tests:  `src/**/*.test.ts(x)`, 54 in all, including end-to-end runs of
  `bin/spell.mjs`.
- The one thing it needs IN spell:  `SpellProject.compile(parentScope, { save })` in
  `../spell/src/SpellProject.ts`.  `save: false` skips writing `<Project>.compiled.js`.
  Without it `--stdout`, `run` and `test` would write into the project.
- Brought up to date with the parser's scope-tree rework when it moved here:
  - things in the Type Explorer's tree are named by `path`, not `id`
  - where something is comes from its details' `line` and the file it's in -- see `CLI.declaredAt()` -- so
    `o` in `explore` opens at a line, no longer a column
  - the first line of `describe <name>` is worked out here -- see `summary()` in `describeText.ts` -- as details
    no longer carry one
  - members list in the order they're declared, as the Type Explorer now shows them
- Two suspected bugs found along the way, in the parser's `agents/SUSPECTED-BUGS.md`:
  - `SpellDiskWorkspace.diskChanged(uri, "created")` keeps a loaded file's old text
  - `ScopeExplorer` property names
