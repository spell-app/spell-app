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

Every command takes one or more targets:

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
| `spell serve [target]` | Runs everything -- the spell app's editor (vite, hot reload) and this checkout's page server (`yarn server`:  the app's `/api`, which saves files to disk, plus docs, epics, goals and Spell UI) -- and opens the editor on `target` in your browser, until `Ctrl-C`.  `--port <n>` (the editor's;  default 3000), `--headless`. |
| `spell plan-doc <command> <name> ...` | Edits a plan doc (`packages/docs/epics/<name>/<name>.html`) as the `/epic` skill does:  `yarn plan-doc` from anywhere, in the nearest checkout (a worktree's, when run in one).  `spell plan-doc` alone lists its commands, e.g. `summary <name>`, `phase <name> 2 done`. |
| `spell icons [query]` | Finds `@spell-app/ui` icons by name, alias or keyword:  name, pack, other names.  `--pack <id>`, `--json`.  `--open` shows them as pictures in your browser (click one to copy its name), until `Ctrl-C`. |
| `spell static <pages...>` | `@spell-app/ui` pages as plain HTML for crawlers and no-JS readers:  each `ui-*` element rendered to light DOM (no shadow DOM), the scripts that load the elements removed.  Writes `page.static.html` beside `page.html`, and the stylesheet it needs, minified, as `page.static.css` beside that.  `-o <file>` (one page) or `-o <folder>` (several), `--inline` (a `<style>` instead), `--css <file>` (one stylesheet for every page), `--no-minify`.  A folder:  every `.html` in it. |
| `spell compile <targets...>` | Writes each project's `<Project>.compiled.js`, and with no errors its scope pack `<Project>.scopes.js`.  `--stdout` prints it and writes nothing.  `--force` recompiles the projects it imports, too.  A `.spell` file prints its javascript. |
| `spell check <targets...>` | Lists errors on stdout as `path:line:col  message`.  `--json` for a JSON list. |
| `spell describe <target> [name] [member]` | What the Type Explorer shows, as text.  E.g. `spell describe Card.spell Card color`.  `--compiled`, `--inherited`, `--json`. |
| `spell explore [target]` | Full-screen Type Explorer.  `↑↓` move, `←→` fold, `Tab` switch pane, `/` filter, `c` compiled, `i` inherited, `o` open in editor, `e` edit its description, `q` quit.  Reloads as files change. |
| `spell watch [targets...]` | Recompiles on every save, with a live list of errors.  `--check-only` re-checks and writes nothing.  `--test` runs tests after each clean rebuild (`--name` picks which).  Rebuilds a watched project when one it imports changes.  `q` / `Ctrl-C` stops it. |
| `spell run [target]` | Compiles and runs the project under node.  Its `print`s show as they happen.  One that shows a UI then opens in your browser, until `Ctrl-C`.  `--browser` always, `--no-browser` never. |
| `spell test [targets...]` | Runs each `to test ...` and reports ✓, or ✗ with the checks that failed.  `--verbose` shows every check.  `--name <text>` runs only tests whose names contain it.  `--watch` is `spell watch --test`. |
| `spell format <targets...>` | Tidies `.spell` files' whitespace, as VS Code's Format Document does.  `--check` writes nothing, lists what would change, exits 1 if anything would.  Never writes into `projects/test/`. |
| `spell projects [root]` | Lists the project roots, or one root's projects, with the names to type.  `--json`. |
| `spell speed [module]` | Times the parser's rule tests (`SP.spellParser.speedTest()`), 3 fresh runs, as a markdown table.  `--against HEAD` times that commit too, in a temp worktree, and adds a Change row.  `--runs`, `--json`. |
| `spell parse "<text>"` | How spell reads a line:  its match tree, then its javascript.  Tried as a `statement`, then an `expression`;  `--rule` for another.  `--in <target>` parses in that project's scope.  `--json`. |
| `spell repl [target]` | `spell parse`, a line at a time;  what a line declares, later lines know.  `↑↓` earlier lines, `Esc` quits.  Piped, it reads stdin. |
| `spell explain <word>` | Rules `word` names or starts (`print`, `repeat`):  syntax and an example.  `--in <target>`:  also what that project declares by that name, as the editor's hover.  `--json`. |
| `spell new <name>` | Makes `<name>/project.json` and a starter `<name>.spell` that prints a hello.  In `@user`'s folder, or `--in <folder>`.  Refuses a folder with anything in it. |

- No target:  the project here, for every command.  Outside a project, in a terminal, `spell` asks -- completing as
  you type, like a shell:  `Tab` completes a root (`@examples/`), then a project, then "entire project" or one of
  its files;  your last 3 picks come first (kept in `.recent-targets.json`, gitignored).  Piped, it says to name one.
- Names in `describe` ignore case, and spaces ~== `-` ~== `_`:  `stock pile` finds `Stock_Pile`.
- Everywhere:  `--verbose` lets spell's own logging through, on stderr.  `NO_COLOR=1` turns colour off.
- `o` in `explore` runs `$SPELL_EDITOR -g path:line`, `code` by default.  Cursor works too.
- Exit codes:  `0` fine, `1` the spell has errors or a test failed, `2` the command line is wrong.
- Output goes to stdout;  progress and screens go to stderr.  So `spell compile --stdout x | less` still works.


## Caveats

### What can write files

- `compile` writes `<Project>.compiled.js`, as the app does.  With no errors, also `<Project>.scopes.js`, as the
  language server does.  `--stdout` writes neither.  `watch` the same after each rebuild, unless `--check-only`.
- `static` writes `<page>.static.html` and `<page>.static.css` beside each page, or where `-o` / `--css` say.
- `check`, `describe`, `explore`, `run` and `test` write nothing of their own.  But if a project imports one that
  has NEVER been compiled, it's compiled first, which writes that project's `.compiled.js`.  Parsing fails without it.
- An imported project's existing `.compiled.js` is used as is, even if its sources changed since.  Compile it first.
- `run` / `test` compile to a temp file, never into the project.
- A folder, or a loose `.spell` file, with no `project.json` at or above it is REFUSED:  loading it would write
  a `project.json` there (`projectUtils.getIndex()`).
- Loading any project may still rewrite its `project.json` if its imports are out of step with its files.  That's
  `getIndex()`, the same as in the app.

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

- Renders through `@spell-app/ui`'s static server render (`$/ui/server`, plan doc `packages/docs/epics/seo/seo.html`)
  in a child process, `src/runner/renderStatic.ts`, on an SSR-only Vite server (`ui/tools/StaticRenderer.ts`):  `ui`'s
  Solid JSX must compile for the server, which `tsx` can't.  Each run starts Vite and compiles every family, so a page
  takes about 3 seconds;  several pages share one run.
- Renders the families in `StaticCatalog` (`ui/src/server/`);  any other `ui-*` tag (`ui-code`, `ui-markdown` ...)
  stays as it is, and is listed on stderr.
- Removes a `<script>` (or `<link rel="modulepreload">`) whose `src` or text names `@spell-app/ui`, `$/ui`, `ui`'s
  `src/` / `dist/`, a family folder, or the docs' `spell-ui.js` bundle:  the elements must not load on a static page,
  or they'd show the content twice.  Other scripts stay, import maps too.
- Links the stylesheet FIRST in `<head>`, before the page's own CSS:  its `@layer ui-slotted, page, ui;` sets the layer
  order before a page sheet names a `ui.*` layer.
- Rewrites the page's own `<style>`s for the flattened output (`ui-card` => `[data-ui="card"]`, `::part()`,
  `:state()`), but NOT its linked stylesheets:  page CSS in a `.css` file that targets `ui-*` tags or `::part()`
  doesn't apply to the static page.
- Each page's stylesheet holds only the families it uses;  with `--css` the one stylesheet covers every page's.
- Minified by Lightning CSS, which keeps `@scope`, `@layer`, `:where()` and `light-dark()` (nothing is lowered).  If
  it can't parse the stylesheet, comments and blank lines are stripped instead, with a warning.
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
  See `PAPERCUTS.md`.

### `explore`

- It needs a real terminal.  Otherwise it says to use `describe`, which prints the same text.
- `o` needs an editor that opens in its own window and takes `-g`.  A terminal editor like vim can't run inside
  the full-screen view.
- It reads the project once:  quit and restart to see edits.

### General

- **It runs the other packages' working copies:**  whatever is in `../spell`, `../parser`, `../lsp` ... right now.
  A half-finished change there breaks `spell`, and `yarn ts` here reports their type errors too.
- **Startup takes about half a second:**  `tsx` compiles their source on each run, and caches it.
- **Ink is pinned at 5,** from when this lived in the parser, whose app is on React 18:  6+ needs React 19.
  This repo has its own React, so it's free to move.
- **`yarn` warns `YN0072 ... --preserve-symlinks`,** about the two links.  Ignore it:  node follows each link to
  the real folder, so those packages' imports find their own dependencies -- which is what we want.
- **`console.*` is silenced in the CLI** (`src/consoleGuard.ts`):  spell logs a lot, e.g. every `serverPath`
  lookup.  Write output with `session.out()` / `session.err()`.  An Ink screen MUST render with
  `patchConsole: false`.
- **Property names show as `short_suit`, not `short-suit`:**  that's what the Type Explorer gives.  See the
  parser's `SUSPECTED-BUGS.md`.
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
- Two suspected bugs found along the way, in the parser's `SUSPECTED-BUGS.md`:
  - `SpellDiskWorkspace.diskChanged(uri, "created")` keeps a loaded file's old text
  - `ScopeExplorer` property names
