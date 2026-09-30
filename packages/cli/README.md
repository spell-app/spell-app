# `spell` command line

Compile, check, describe, explore, watch, run and test spell projects from a terminal.  It runs straight from this
checkout, through `tsx`, so there's no build step, and it sees projects exactly as the language server does.

Code:  `src/` (namespace `CLI`, imported as `~/cli`), started by `bin/spell.mjs`.  See the header of `src/main.ts`.

This package holds ONLY the command line.  Spell itself -- the parser, the language server, the runtime, and the
projects in `projects/` -- is the `spell` package beside this one in the monorepo, along with `ui`:

```
packages/
  cli/      this package
  spell/    spell itself:  its SOURCE runs, straight from `../spell/src`
  ui/       `@spell/ui`
```

- `package.json` depends on both as workspaces (`workspace:*`);  one `yarn` at the monorepo root installs everything.
- `~/cli` is this repo's `src/`;  any other `~/...` is the parser's `src/`.  See `tsconfig.json`.
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
| `spell compile <targets...>` | Writes each project's `<Project>.compiled.js`.  `--stdout` prints it and writes nothing.  A `.spell` file prints its javascript. |
| `spell check <targets...>` | Lists errors on stdout as `path:line:col  message`.  `--json` for a JSON list. |
| `spell describe <target> [name] [member]` | What the Type Explorer shows, as text.  E.g. `spell describe Card.spell Card color`.  `--compiled`, `--inherited`, `--json`. |
| `spell explore [target]` | Full-screen Type Explorer.  `↑↓` move, `←→` fold, `Tab` switch pane, `/` filter, `c` compiled, `i` inherited, `o` open in editor, `q` quit. |
| `spell watch [targets...]` | Recompiles on every save, with a live list of errors.  `--check-only` re-checks and writes nothing.  `q` / `Ctrl-C` stops it. |
| `spell run [target]` | Compiles and runs the project under node.  Its `print`s show as they happen. |
| `spell test [targets...]` | Runs each `to test ...` and reports ✓, or ✗ with the checks that failed.  `--verbose` shows every check. |

- No target, for `explore` / `watch` / `run` / `test`, means `@workspace`.
- Names in `describe` ignore case, and spaces ~== `-` ~== `_`:  `stock pile` finds `Stock_Pile`.
- Everywhere:  `--verbose` lets spell's own logging through, on stderr.  `NO_COLOR=1` turns colour off.
- `o` in `explore` runs `$SPELL_EDITOR -g path:line`, `code` by default.  Cursor works too.
- Exit codes:  `0` fine, `1` the spell has errors or a test failed, `2` the command line is wrong.
- Output goes to stdout;  progress and screens go to stderr.  So `spell compile --stdout x | less` still works.


## Caveats

### What can write files

- `compile` writes `<Project>.compiled.js`, as the app does.  `--stdout` doesn't.
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
- What needs a browser does nothing, with a note:  starting a UI (`start the game`) and installing styles.
  So `run` on a UI project runs its logic, then says to use the app or VS Code's ▶ Run Project.
- Other browser-only code, e.g. touching `document` directly, will throw.
- `test`:
  - A test the project runs ITSELF as it loads counts once, and isn't run again.  A second run would start from
    what the first left behind, e.g. a dealt deck.
  - A test that throws FAILS, with the error.  Spell's own `spellCore.test()` swallows it silently.
  - It finds tests by their exported function names:  `test_*`.
  - `print` inside a test is hidden unless `--verbose`.

### `watch`

- It watches each project's folder:  `.spell`, `.css`, `project.json`.  It ignores `*.compiled.js`.
- A project another imports doesn't rebuild the importer when it changes.  Watch both.
- On macOS a save arrives as a `rename` event, so `watch` ignores event types and looks at what's on disk.
  See `PAPERCUTS.md`.

### `explore`

- It needs a real terminal.  Otherwise it says to use `describe`, which prints the same text.
- `o` needs an editor that opens in its own window and takes `-g`.  A terminal editor like vim can't run inside
  the full-screen view.
- It reads the project once:  quit and restart to see edits.

### General

- **It runs the parser's working copy:**  whatever is in `../spell` right now.  A half-finished
  change there breaks `spell`, and `yarn ts` here reports the parser's type errors too.
- **Startup takes about half a second:**  `tsx` compiles the parser on each run, and caches it.
- **Ink is pinned at 5,** from when this lived in the parser, whose app is on React 18:  6+ needs React 19.
  This repo has its own React, so it's free to move.
- **`yarn` warns `YN0072 ... --preserve-symlinks`,** about the two links.  Ignore it:  node follows each link to
  the real folder, so the parser's imports find the parser's own packages -- which is what we want.
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

- `spell format [--check]`:  apply `SpellLanguageService.formatting()` edits
- `spell explain <word>`:  hover text / rule syntax for a word, via `workspaceSymbols()` + `describeRecord()`
- `spell parse "<text>" [--rule x]` / `spell repl`:  a line's match tree and compiled output, for debugging rules
- `spell new <name>`:  make a project
- `spell lsp`:  start the language server, so the extension spawns `spell lsp` rather than a `tsx` path
- `spell speed`:  `SP.spellParser.speedTest()`
- `spell projects [root]`:  list roots and projects

### Improvements

- Bundle into one file, so it installs without a checkout.  It needs:
  - `keepNames` (rules register by class name)
  - the `~` alias
  - `__PACKAGE_VERSION__`
  - `environment.ts` to stop finding `projects/` next to `src/`
- `watch`:  rebuild importers when a project they import changes.  Also, optionally, run tests after each rebuild.
- `explore`:  reload on file changes (share `watch`'s workspace updates);  show the Type Explorer's editable
  descriptions.
- `run`:  optionally run UI projects in a real browser (e.g. playwright, already a dev dependency), or under a fake
  DOM.
- `compile`:  a `--force` to recompile imported projects even when their `.compiled.js` exists.
- `compile`:  write the project's scope pack, `<Project>.scopes.js`, as the language server does after a clean
  compile -- via `SpellDiskWorkspace.writeScopes()`.  See the `TODO` in the parser's `src/lsp/scopes.ts`.
- `test`:  a `--watch`, and filtering tests by name.

### Review items

- Not yet reviewed by a person.  Tests:  `src/**/*.test.ts(x)`, 54 in all, including end-to-end runs of
  `bin/spell.mjs`.
- The one thing it needs IN the parser:  `SpellProject.compile(parentScope, { save })` in
  `src/languages/spell/SpellProject.ts`.  `save: false` skips writing `<Project>.compiled.js`.
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
