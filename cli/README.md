# `spell-app/cli` -- spell-app's `spell` commands, and the language commands' work

Compile, lint, describe, watch, run and test spell projects from a terminal, and run the spell app.
- `spell` itself is the kit's command line ([the kit's cli/](../../cli/README.md)):
  it reads the command line, prints help, and finds every installed repo's commands.
- This folder adds spell-app's part of it:
  - spell-app's OWN commands:  `spell app create | serve | vscode`, `spell projects`
  - the WORK behind spell-lang's commands (`spell compile`, `lint`, `run` ...), through spell-app's `"language"`
    hook:  they find projects the app's way, so their work is here for now (epic `repo-split` P13)
- It runs straight from the checkout, through `tsx`, so there's no build step.
- It sees projects exactly as the language server does.

The code is in `src/`, imported as `$/cli`.
- Its namespace is `CLI`.
- The kit finds it through `package.json`'s `"spell": { "commands": "./cli/commands.ts", "hooks": "./cli/hooks.ts" }`.
- Spell UI's commands (`spell icon`, `spell ssr`, `spell pack`, `spell design`) are spell-ui's
  ([its cli/](../../spell-ui/cli/README.md)).
- The `epic` command (the epic tools) is spell-epic's, its own repo (epic `epic-eject` I5):  `epic --help`.

Spell itself is the folders beside this one and the packages below it, along with Spell UI:
the parser, the language, the language server, the runtime, and `spaces`, where the projects are.

```
spell/         the kit:  cli/ is the `spell` program;  server/, the page server
spell-app/
  cli/         this folder
  spaces/      where projects live:  the built-in ones (`@spell/`), and projects on disk
  lsp/         the language server
spell-lang/    the package `spell-lang`:  its SOURCE runs, straight from its folders
  cli/         the language commands' list
  spell/       the spell language
  parser/      the generic parser
  core/        the runtime compiled spell runs on;  py/, its Python twin
spell-ui/      the package `spell-ui`
```

- spell-app's root `package.json` depends on `spell-lang`, `spell-ui` and `spell-kit` as workspaces (`workspace:*`).
  - One `yarn` at the kit's root installs everything.
- `$/cli` is this folder's `src/`.
  The other folders' here are alike, e.g. `$/spaces` for spaces';  another repo's package goes by its npm name,
  `spell-lang/spell`.
  - One alias table for the repo:  [`tsconfig.base.json`](../tsconfig.base.json).
- Moved here from the parser's `CLI` branch (`26830ef1`) on 2026-09-30;
  the program itself moved to the kit in epic `repo-split` P13.


## Instructions

### Install

```sh
yarn               # once, at the kit's root:  installs every repo's packages
yarn cli:install   # at the KIT's root:  links `spell` onto your PATH (the kit's cli/bin/spell.mjs)
spell help
```

- The link points at the kit's `cli/bin/spell.mjs`:  edit the source here, and the next `spell` runs the new code.
- In spell-app's yarn scripts, `spell` is the kit's bin:  `yarn vscode` is `spell app vscode`.
- `epic` is spell-epic's `bin/epic`, linked by its own README's "Install".

### Naming what to work on

Every project command takes one or more projects (a lone spell file counts as a one-file project):

| You type | Means |
|---|---|
| `Card.spell`, `./path/to/Project`, `.` | a spell file, or the project in a folder |
| `@here` | the project in the current folder |
| `@spell/library/cards`, `@spell/examples/solitaire`, `owen@spell/errors` | one project, by its address |
| `@spell/test/solitaire/Card.spell` | a file in one:  its name has a dot |
| `@spell/library`, `owen@spell`, `@spell` | a group, or all of a space's groups:  pick from a list, with "All projects" first |

- `--all` takes every project in a group without asking, e.g. in a script.
- With no terminal to ask on, a group lists its projects and exits `2`.
- A group holding just one project uses it without asking.

### Commands

spell-app's own commands, then spell-lang's, whose work is here.
Longer notes on some of them follow the tables.

| Command | What it does |
|---|---|
| `spell app create <name>` | Makes `<name>/__project.json5`, and a starter `<name>.spell` that prints a hello.  Was `spell new`. |
| `spell app serve [project]` | Runs everything (the editor, and this checkout's page server), and opens the editor on `project` in your browser, until `Ctrl-C`.  Was `spell serve`. |
| `spell app vscode [build\|install]` | The VS Code extension:  build it, install it, or (no verb) both.  Was `spell dev vscode`. |
| `spell projects [group]` | Lists the project groups, or one group's projects, by address.  `--json`. |

| spell-lang's command | What it does |
|---|---|
| `spell compile <projects...>` | Compiles each project, writing its output into `build/`, its declarations and words beside it. |
| `spell lint <projects...>` | Lists errors on stdout as `path:line:col  message`.  `--json` for a JSON list.  Was `spell check`. |
| `spell describe <project> [name] [member]` | What the Type Explorer shows, as text.  E.g. `spell describe Card.spell Card color`.  `--compiled`, `--inherited`, `--json`. |
| `spell watch [projects...]` | Recompiles on every save, with a live list of errors.  `q` / `Ctrl-C` stops it. |
| `spell run [project]` | Compiles and runs the project under node.  Its `print`s show as they happen.  `--target ts` / `py` runs it as that target compiles it:  a Python program that draws is served as its web app.  `yarn dev`, `dev:ts`, `dev:py` from a project's folder. |
| `spell test [projects...]` | Runs each `to test ...` and reports ✓, or ✗ with the checks that failed. |
| `spell format <projects...>` | Tidies `.spell` files' whitespace, as VS Code's Format Document does. |
| `spell speedtest [module]` | Times the parser's rule tests (`SP.spellParser.speedTest()`), 3 fresh runs, as a markdown table.  Was `spell speed`. |
| `spell parse "<text>"` | How spell reads a line:  its match tree, then its javascript. |
| `spell repl [project]` | `spell parse`, a line at a time:  what a line declares, later lines know. |
| `spell explain <word>` | Rules `word` names or starts (`print`, `repeat`):  syntax and an example. |

- `spell explore`, the full-screen Type Explorer, is gone (Owen, epic `repo-split` P13):  `spell describe` prints
  the same text.
- The kit's commands (`spell server`, `spell bundle`, `spell commands`, `spell wwod`):
  [the kit's cli/](../../cli/README.md).

#### spell-app's commands, in more detail

- `app create`:  makes the project in Owen's own space, `owen@spell`.
  - Its folder:  `../spell-spaces/@spell/owen@/`, in spell-spaces beside the main checkout.
  - `--in <folder>`:  in that folder instead.
  - Refuses a folder with anything in it.
- `app serve`:
  - The editor:  the spell app's, on vite, with hot reload.
  - The page server:  this checkout's (`spell server`).
    It serves the app's `/api`, which saves files to disk, plus docs, epics, goals and Spell UI.
  - `--port <n>`:  the editor's;  default 3000.
  - `--headless`.
- `app vscode`:
  - `build`:  makes its `.vsix`, running these in the extension's folder:

    ```sh
    # in vscode/
    yarn install && yarn build && yarn package
    ```

  - `install`:  into VS Code
  - Refuses from a branch behind `main` (it would downgrade every window), unless `--force`.
    - `main`:  the repo's base branch, `epic config baseBranch`.
  - spell-app's yarn scripts do the same:

    ```sh
    yarn vscode           # both
    yarn vscode:build
    yarn vscode:install
    ```

#### spell-lang's commands, in more detail

- `compile`:  writes each project's compiled javascript, and its declarations and words.
  - The compiled javascript, `<Project>.spell.js`, goes in the project's build folder.
  - Its declarations and words are committed beside its source:
    `<Project>.declarations.json5` and `<Project>.en.js`.
  - The build folder:  in `build/` at spell-app's root, never committed, at the project's own path.
    - in spell-app's spaces:  `build/spaces/@spell/examples/solitaire`
    - the frozen test projects:  `build/spaces/@spell/test/fizzbuzz`
    - in spell-spaces:  `build/spell-spaces/@spell/owen@/errors`
    - A project anywhere else keeps its output beside its source.
    - See "Projects" in [PARSING.md](../../spell-lang/spell/PARSING.md).
  - Also each other target's output, e.g. Python's:  the project's targets, or the one `--target <name>` names.
    - A project's targets are the `"targets"` in its project file.
      Every target is in `SP.TARGETS`.
  - A target with a type checker is checked once written:  TypeScript by `tsc`, Python by `pyright`.
    Its errors are listed, but don't fail the compile.
  - Each `*.editor.html` page compiles to its `<type-editor>` module, beside the program's own output.
  - With no errors, its scope pack, `<Project>.scopes.js`.
  - `--stdout` prints it and writes nothing.
  - `--force` recompiles the projects it imports, too.
  - `--stale` compiles only the projects that are out of date, and the same for what they import;
    the rest say "up to date".
    - Out of date:  a file it builds is missing, or one of its files, its project file,
      an import's declarations or spell's compiler changed since its build (`CLI.staleBecause()`).
    - The page server runs `spell compile --stale --all @spell/examples @spell/library` as it starts,
      and spaces' routes compile a project whose built file is missing:  nothing to run by hand in a fresh checkout.
  - A `.spell` file prints its javascript.
- `lint`:  the project's editor pages (`*.editor.html`) too, against its types.
  - `--fix` puts each page right and writes it back, then says what it did.
- `watch`:
  - `--check-only` re-checks and writes nothing.
  - `--test` runs tests after each clean rebuild (`--name` picks which).
  - Rebuilds a watched project when one it imports changes.
- `run`:  a project that shows a UI then opens in your browser, until `Ctrl-C`.
  `--browser` always, `--no-browser` never.
  - What it prints goes to stdout;  a dump of a whole thing (`print the card`) to stderr.
  - `--seed <n>` starts its random numbers from `n` (1 to 2147483646):  the same deal every run.
- `test`:
  - `--verbose` shows every check.
  - `--name <text>` runs only tests whose names contain it.
  - `--seed <n>`, as `run`'s.
  - `--watch` is `spell watch --test`.
- `format`:
  - `--check` writes nothing, lists what would change, and exits 1 if anything would.
  - Never writes into the test projects, spell-lang's `tests/spaces/@spell/test/`.
- `speedtest`:
  - `--against HEAD` times that commit too, in a temp worktree, and adds a Change row.
  - `--runs`, `--json`.
- `parse`:  reads the line as a statement, then as an expression.
  - `--rule` for another rule, e.g. `--rule expression`.
  - `--in <project>` parses in that project's scope.
  - `--tree`:  the spell tree (what it means), not the match tree;  with `--html`, as a `<ui-tree-diagram>`.
  - `--json`.
- `repl`:  a line at a time.
  - `↑↓`:  earlier lines;  `Esc` quits.
  - Piped, it reads stdin.
- `explain`:  `--in <project>`:  also what that project declares by that name, as the editor's hover.
  `--json`.

#### Everywhere

- No project named:  the project here, for every command.
  - Outside a project, in a terminal, `spell` asks, completing as you type, like a shell.
    - `Tab` completes, a level at a time:
      - a group, `@spell/examples/`
      - then a project, `@spell/examples/solitaire/`
      - then "entire project", or one of its files
  - Your last 3 picks come first (kept in `.recent-projects.json`, gitignored).
  - Piped, it says to name one.
- Names in `describe` ignore case, and a space, a dash and an underscore are all alike.
  E.g. `stock pile` finds `Stock_Pile`.
- Everywhere:  `--verbose` lets spell's own logging through, on stderr.
  `NO_COLOR=1` turns colour off.
- Exit codes:
  - `0`:  fine
  - `1`:  the spell has errors, or a test failed
  - `2`:  the command line is wrong
- Output goes to stdout;  progress and screens go to stderr.
  So `spell compile --stdout x | less` still works.


## Caveats

### What can write files

- `compile` writes the compiled javascript, `<Project>.spell.js`, into the project's build folder, as the app does.
  - With no errors, also `<Project>.scopes.js` there, as the language server does.
  - `--stale` writes only the projects that are out of date.
  - And its declarations and words beside its source, `<Project>.declarations.json5` and `<Project>.en.js`.
  - `--stdout` writes neither.
  - `watch` the same after each rebuild, unless `--check-only`.
- `lint --fix` writes the editor pages it puts right.
- `app create` writes the new project's two files.
- These write nothing of their own:

  ```
  lint  describe  run  test
  ```

  - But if a project imports one that has NEVER been compiled, it's compiled first,
    which writes that project's `.spell.js`.
    Parsing fails without it.
- An imported project's existing `.spell.js` is used as is, even if its sources changed since.
  Compile it first.
- `run` / `test` compile to a temp file, never into the project.
- A folder, or a loose `.spell` file, with no project file at or above it is REFUSED:
  loading it would write one there.
  - That's `projectUtils.getIndex()`.
- Loading any project may still rewrite its project file, if its imports are out of step with its files.
  That's `getIndex()`, the same as in the app.

### `run` / `test`

- They run in a separate node process, so each run gets a fresh `core`.
- Under node, what needs a browser does nothing, with a note:
  starting a UI (`start the game`), and installing styles.
- Then `run` on a UI project opens it in your browser:
  - a page with app's `<spell-app>` element, served from localhost until `Ctrl-C`:
    - the project as compiled for this run (nothing written)
    - its scope pack, for the Type Explorer
    - the compiled projects it imports
  - the first time in a checkout, it builds `<spell-app>`, which takes a few seconds:
    `yarn build:element`, in spell-app
  - no live reload:  it serves what was compiled at the start
  - `SPELL_NO_BROWSER=1` prints the URL instead of opening a browser
- Other browser-only code, e.g. touching `document` directly, will throw.
- `test`:
  - A test the project runs ITSELF as it loads counts once, and isn't run again.
    A second run would start from what the first left behind, e.g. a dealt deck.
  - A test that throws FAILS, with the error.
    Spell's own `core.test()` swallows it silently.
  - It finds tests by their exported function names:  `test_*`.
  - `print` inside a test is hidden unless `--verbose`.

### `app serve`

- Starts this checkout's PAGE SERVER if it isn't running:  [the kit's `server`](../../server/), on port 4747, else any
  free one.
  - Its route modules serve the app's `/api` (spaces' `appRoutes.ts`), docs, epics and Spell UI's docs.
- The editor is the page server's CHILD (spaces' `EditorServer`):  vite, in its own process group,
  passing `/api` on to the page server.
  - Recorded in `.spell-server.editor.json`,
    so the site header's "Editor" (`/editor` on the page server) reaches it.
- `Ctrl-C`, or vite stopping:  stops vite, and the page server if it started it.
  - A page server that already ran stays.
  - It stops no other servers, and runs no `yarn install`.
- Refuses an editor port in use, rather than drifting to another.
  - Ask for another, `spell app serve --port 3100`, or stop what's there, `yarn stop` in spell-app.
- Opens only projects in the app's roots (`spell projects`):  a project in some other folder opens the chooser.
- Their output is hidden unless `--verbose`, or one fails.

### `speedtest`

- Each run is a fresh node process:  [`speedTest.mts`](src/runner/speedTest.mts) (a warm-up, then 20 timed passes).
- A side's runs combine as:  the mean of their averages, the lowest min, the highest max.
  - With 3 or more runs, ONE fluke -- an average 25% over the median -- is dropped.
- `--against <ref>`:
  - makes a temp `git worktree` of spell-lang (the repo of our `spell-lang/spell`) at the ref, and links the top
    repo's `node_modules` into it -- a ref with different dependencies may not run
  - the runner times each side's spell `src/` (`speedTest.mts <spell src URL>`), its `$/` imports by that side's own
    alias table (the run-time alias hook)
  - the ref must have `spell/src`:  spell-lang's, since epic `repo-split` P8
  - the two sides take turns, run by run
  - the worktree is removed afterwards, even on failure

### `watch`

- It watches each project's folder:  its spell files, CSS and project file.
  It ignores `*.spell.js` and `*.scopes.js`.
- Watching both a project and one it imports:  the importer rebuilds, from scratch, after the imported one does.
  - A project imported but not watched isn't seen changing.
- On macOS a save arrives as a `rename` event, so `watch` ignores event types and looks at what's on disk.
  See [the papercuts log](../agents/PAPERCUTS.md).

### General

- **It runs the other packages' working copies:**  whatever is in their folders right now, e.g. `../../spell-lang/spell`.
  - A half-finished change there breaks `spell`.
  - And `yarn ts` here reports their type errors too.
- **Startup takes about half a second** for a command that loads spell:  `tsx` compiles their source on each run,
  and caches it.
  - `spell help` and the commands that load no spell (`spell app vscode`, the kit's) start in a fraction of that:
    each repo's command list loads nothing of spell until a command runs.
- **Ink is pinned at 5,** from when this lived in the parser, whose app is on React 18:  6+ needs React 19.
  This repo has its own React, so it's free to move.
- **`yarn` warns `YN0072 ... --preserve-symlinks`,** about the two links.  Ignore it.
  - Node follows each link to the real folder,
    so those packages' imports find their own dependencies -- which is what we want.
- **`console.*` is silenced in the CLI:**  spell logs a lot, e.g. every `serverPath` lookup.
  - That's [`consoleGuard.ts`](src/consoleGuard.ts), which `loadApp()` ([hooks.ts](hooks.ts)) loads first.
  - Write output with `session.out()` / `session.err()`.
  - An Ink screen MUST render with `patchConsole: false`.
- **Property names show as `short_suit`, not `short-suit`:**  that's what the Type Explorer gives.
  See the parser's section of [the suspected-bugs log](../agents/SUSPECTED-BUGS.md).
- **Name clashes:**  a shell alias or function named `spell` hides the command.
  Check `type -a spell` in a login shell.
- **Test projects:**  running a test project (spell-lang's `tests/spaces/@spell/test/`) from VS Code's ▶ Run Project
  writes into it.
  - It writes `settings.json5` there;  its compiled javascript goes in `build/`.
  - Test projects should stay frozen, so delete it.


## Files

| Path | What |
| --- | --- |
| [commands.ts](commands.ts) | spell-app's commands:  `spell app create \| serve \| vscode`, `spell projects` |
| [hooks.ts](hooks.ts) | the `"language"` hook, and `loadApp()`:  `consoleGuard` first, then the work |
| [src/languageCommands.ts](src/languageCommands.ts) | `languageCommands` (spell-lang's `LanguageCommands`) and `appCommands`, each on a new `CliSession` |
| [src/index.ts](src/index.ts) | the `$/cli` barrel |
| [src/cli.types.ts](src/cli.types.ts) | our types;  the kit's `CliError`, `EXIT` and the language commands' flags, re-exported |
| [src/CliSession.ts](src/CliSession.ts) | one command's run:  its flags, projects loaded from disk, their problems |
| [src/resolveProject.ts](src/resolveProject.ts) | an argument to what it names:  a project, a file, a group |
| [src/projectChoices.ts](src/projectChoices.ts), [src/recentProjects.ts](src/recentProjects.ts) | the "which project?" prompt's choices, your last picks first |
| [src/staleBecause.ts](src/staleBecause.ts) | why a project's build is out of date (`compile --stale`) |
| [src/EditorPages.ts](src/EditorPages.ts) | a project's editor pages, checked against its types (`lint`) and compiled (`compile`) |
| [src/schemas.ts](src/schemas.ts) | a library's JSON Schemas, written by `compile` |
| [src/scopeTree.ts](src/scopeTree.ts), [src/describeText.ts](src/describeText.ts) | the Type Explorer's tree, walked and written as text (`describe`) |
| [src/parseText.ts](src/parseText.ts) | `parse` and `repl`:  a line's match tree, spell tree and javascript |
| [src/runTarget.ts](src/runTarget.ts) | `run --target ts \| py` |
| [src/runInBrowser.ts](src/runInBrowser.ts), [src/serve.ts](src/serve.ts) | `run` on a UI project:  the `<spell-app>` page, served on localhost |
| [src/consoleGuard.ts](src/consoleGuard.ts) | SIDE EFFECT:  silences `console.*`, or sends it to stderr with `--verbose` |
| [src/commands/](src/commands/) | each command's work, `<name>Command.ts` |
| [src/ui/](src/ui/) | Ink screens:  progress, the project prompt and picker, `watch`, `repl` |
| [src/runner/](src/runner/) | child processes:  `runProject.ts` (`run`, `test`), `speedTest.mts` (`speedtest`) |
| `bin/spell.mjs`, `src/main.ts`, `src/devMain.ts`, `src/devProgram.ts`, `src/findCheckout.ts`, `scripts/install-cli.mjs` | *(none -- the kit's `cli/`:  [its README](../../cli/README.md))* |
| `src/commands/{bundles,commands,wwod,pony,server}Command.ts`, `src/dev/wwod.ts`, `src/dev/passThrough.ts` | *(none -- the kit's `cli/`)* |
| `src/commands/{icons,static,pack,design}Command.ts`, `src/iconSearch.ts`, `src/dev/pack*.ts`, `src/runner/renderStatic.ts`, `templates/` | *(none -- spell-ui's `cli/`:  [its README](../../spell-ui/cli/README.md))* |
| `src/commands/docsCommand.ts` | *(none -- gone:  `epic pages <verb>`)* |
| `src/commands/exploreCommand.tsx`, `src/ui/{ExplorerScreen,TreePane,DetailsPane}.tsx` | *(none -- gone with `spell explore`)* |


## TODO

### Commands not built yet

- `spell lsp`:  start the language server, so the extension spawns it rather than a `tsx` path

### Moving the language commands' work to spell-lang

- Their list is spell-lang's already;  their work waits here, behind the `"language"` hook, for what spell-lang
  doesn't have yet:  [spell-lang's cli/README.md](../../spell-lang/cli/README.md) lists what each needs.

### Improvements

- Bundle into one file, so it installs without a checkout.  It needs:
  - `keepNames` (rules register by class name)
  - the `~` alias
  - `__PACKAGE_VERSION__`
  - `environment.ts` to stop finding the projects folder next to `src/`
- `run`:
  optionally run UI projects in a real browser (e.g. playwright, already a dev dependency), or under a fake DOM.

### Review items

- Not yet reviewed by a person.
  - Tests:  in the repo's `tests/cli/src/**/*.test.ts(x)`.
    They include end-to-end runs of the kit's `spell`, every language command among them.
- The one thing it needs IN spell, in [`SpellProject.ts`](../../spell-lang/spell/src/SpellProject.ts):
  `SpellProject.compile(parentScope, { save })`.
  - `save: false` skips writing `<Project>.spell.js`.
  - Without it, `compile --stdout` would write into the project, as would running or testing it.
- Brought up to date with the parser's scope-tree rework when it moved here:
  - things in the Type Explorer's tree are named by `path`, not `id`
  - where something is comes from its details' `line`, and the file it's in (see `CLI.declaredAt()`)
  - the first line of `describe <name>` is worked out here, as details no longer carry one
    - see `summary()`, in [describeText.ts](src/describeText.ts)
  - members list in the order they're declared, as the Type Explorer now shows them
- Two suspected bugs found along the way, in the parser's section of [the suspected-bugs log](../agents/SUSPECTED-BUGS.md):
  - `SpellDiskWorkspace.diskChanged(uri, "created")` keeps a loaded file's old text
  - `ScopeExplorer` property names
