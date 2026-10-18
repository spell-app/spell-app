# `spell` command line

Compile, check, describe, explore, watch, run and test spell projects from a terminal.
- It runs straight from this checkout, through `tsx`, so there's no build step.
- It sees projects exactly as the language server does.

The code is in `src/`, imported as `$/cli`.
- Its namespace is `CLI`.
- It's started by [spell.mjs](bin/spell.mjs), in `bin/`.
  - Its second command, `epic` (the epic tools), by [epic.mjs](bin/epic.mjs):  see "The `epic` command".
- See the header of [`main.ts`](src/main.ts).

This package holds ONLY the command line.
Spell itself is the spell-family packages beside this one in the monorepo, along with `ui`:
the parser, the language, the language server, the runtime, and `spaces`, where the projects are.

```
packages/
  cli/         this package
  spell/       the spell language:  its SOURCE runs, straight from `../spell/src`
  spaces/      where projects live:  the built-in ones (`@spell/`), and projects on disk
  parser/      the generic parser
  core/        the runtime compiled spell runs on, and its Python twin
  lsp/         the language server
  ui/          `@spell-app/ui`
```

- This package depends on spell, spaces and ui as workspaces, and the aliases reach the rest.
  - `package.json` lists them as `workspace:*`.
  - One `yarn` at the monorepo root installs everything.
- `$/cli` is this package's `src/`.
  The others' are alike, e.g. `$/spell` for spell's.
  - One alias table for the whole monorepo:  [`tsconfig.base.json`](../../tsconfig.base.json).
- Moved here from the parser's `CLI` branch (`26830ef1`) on 2026-09-30.


## Instructions

### Install

```sh
yarn               # once, anywhere in the monorepo:  installs every package
yarn cli:install   # links `spell` and `epic` into the first writable folder on your PATH:  ~/.local/bin,
                   # npm's global bin, /usr/local/bin, /opt/homebrew/bin.  Or:  SPELL_BIN_DIR=/some/dir yarn cli:install
spell --help
epic --help
```

The links point at this checkout's [spell.mjs](bin/spell.mjs) and [epic.mjs](bin/epic.mjs):  the package's `bin`.
Edit the source, and the next `spell` or `epic` runs the new code.

### Naming what to work on

Every command takes one or more projects (a lone spell file counts as a one-file project):

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

The spell language's commands, then the repo's own tools (`spell dev ...`), then the epic tools (`epic ...`).
Longer notes on some of them follow the table.

| Command | What it does |
|---|---|
| `spell help [command]` | Lists the commands, or shows one's options:  `spell help compile` ~== `spell compile --help`. |
| `spell serve [project]` | Runs everything (the editor, and this checkout's page server), and opens the editor on `project` in your browser, until `Ctrl-C`. |
| `spell dev commands [list\|check]` | Every yarn script, `spell` command and skill, checked against the commands page. |
| `spell dev wwod [check] [files...]` | Checks the agents' rules:  their WWOD citations and repo paths. |
| `spell dev goals` | PARKED:  says the goals tools are in `packages/goals.zip` (epic `epic-goals` rebuilds them). |
| `spell dev docs <verb> ...` | The docs tools:  `update`, `index`, `new`, `open`, `link` ... |
| `spell dev server <verb> ...` | This checkout's page server, its own verbs as they are. |
| `epic worktree merge-main [--continue]` | Merges `main` into this checkout's branch, regenerating every generated file both sides changed. |
| `spell dev pack <verb> ...` | Component packs:  another package's custom elements (`<epic-*>` ...), which a page loads on demand through `<ui-root>`. |
| `epic window <command> ...` | VS Code windows per package and worktree. |
| `spell dev vscode [build\|install]` | The VS Code extension:  build it, install it, or (no verb) both. |
| `spell icons [query]` | Finds `@spell-app/ui` icons by name, alias or keyword. |
| `spell static <pages...>` | `@spell-app/ui` pages as plain HTML, for crawlers and no-JS readers. |
| `spell compile <projects...>` | Compiles each project, writing its output into `build/`, its declarations and words beside it. |
| `spell check <projects...>` | Lists errors on stdout as `path:line:col  message`.  `--json` for a JSON list. |
| `spell describe <project> [name] [member]` | What the Type Explorer shows, as text.  E.g. `spell describe Card.spell Card color`.  `--compiled`, `--inherited`, `--json`. |
| `spell explore [project]` | Full-screen Type Explorer.  Reloads as files change. |
| `spell watch [projects...]` | Recompiles on every save, with a live list of errors.  `q` / `Ctrl-C` stops it. |
| `spell run [project]` | Compiles and runs the project under node.  Its `print`s show as they happen.  `--target ts` / `py` runs it as that target compiles it:  a Python program that draws is served as its web app.  `yarn dev`, `dev:ts`, `dev:py` from a project's folder. |
| `spell test [projects...]` | Runs each `to test ...` and reports ✓, or ✗ with the checks that failed. |
| `spell format <projects...>` | Tidies `.spell` files' whitespace, as VS Code's Format Document does. |
| `spell projects [group]` | Lists the project groups, or one group's projects, by address.  `--json`. |
| `spell speed [module]` | Times the parser's rule tests (`SP.spellParser.speedTest()`), 3 fresh runs, as a markdown table. |
| `spell parse "<text>"` | How spell reads a line:  its match tree, then its javascript. |
| `spell repl [project]` | `spell parse`, a line at a time:  what a line declares, later lines know. |
| `spell explain <word>` | Rules `word` names or starts (`print`, `repeat`):  syntax and an example. |
| `spell new <name>` | Makes `<name>/__project.json5`, and a starter `<name>.spell` that prints a hello. |
| `epic <verb> <epic>[#<id>] ...` | Edits an epic's page as the `/epic` skill does, from anywhere:  `epic summary seo`, `epic close seo#J3`. |
| `epic ask <verb> ...` | Details pages:  the `/details` skill's tool. |
| `epic choices <verb> ...` | Choice pages:  a table of names Claude recommends, one row per use site, which Owen goes through one by one. |
| `epic comments <verb> ...` | Comments Owen leaves on docs pages:  list them, gather them into an epic, answer one. |
| `epic notes <verb> ...` | Page notes:  the notes Owen leaves on docs pages from their bubbles (epic `airplane`). |
| `epic agents <verb> ...` | The running-agents list, of this checkout's epic or of the checkout. |
| `epic airplane <verb> ...` | Airplane mode:  the docs worked on with no Claude, everything kept for `/airplane land`. |
| `epic send \| requests \| file \| home \| merge ...` | Requests between epics' sessions (`/send`), and merging a standing epic's phase. |

#### The spell commands, in more detail

- `serve`:
  - The editor:  the spell app's, on vite, with hot reload.
  - The page server:  this checkout's (`spell dev server`).
    It serves the app's `/api`, which saves files to disk, plus docs, epics, goals and Spell UI.
  - `--port <n>`:  the editor's;  default 3000.
  - `--headless`.
- `icons`:  each hit's name, pack and other names.
  - `--pack <id>`, `--json`.
  - `--open` shows them as pictures in your browser (click one to copy its name), until `Ctrl-C`.
- `static`:  each `ui-*` element rendered to light DOM (no shadow DOM), the scripts that load the elements removed.
  - Writes `page.static.html` beside `page.html`.
  - And ONE minified stylesheet per output folder, `ui.static.css`, which every page there links
    (the browser caches it).
  - `-o <file>` (one page), or `-o <folder>` (several).
  - `--css <file>`:  one stylesheet elsewhere.
  - `--inline-css`:  each page's own `<style>` instead.
  - `--no-minify`.
  - A folder:  every `.html` in it.
- `compile`:  writes each project's compiled javascript, and its declarations and words.
  - The compiled javascript, `<Project>.spell.js`, goes in the project's build folder.
  - Its declarations and words are committed beside its source:
    `<Project>.declarations.json5` and `<Project>.en.js`.
  - The build folder:  in `build/` at the repo root, never committed, at the project's own path.
    - under `packages/`:  `build/spaces/@spell/examples/solitaire`
    - under `tests/`:  `build/spaces/@spell/test/fizzbuzz`
    - in spell-spaces:  `build/spell-spaces/@spell/owen@/errors`
    - A project anywhere else keeps its output beside its source.
    - See "Projects" in [PARSING.md](../spell/PARSING.md).
  - Also each other target's output, e.g. Python's:  the project's targets, or the one `--target <name>` names.
    - A project's targets are the `"targets"` in its project file.
      Every target is in `SP.TARGETS`.
  - A target with a type checker is checked once written:  TypeScript by `tsc`, Python by `pyright`.
    Its errors are listed, but don't fail the compile.
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
- `explore`'s keys:
  - `↑↓` move, `←→` fold
  - `Tab` switch pane, `/` filter
  - `c` compiled, `i` inherited
  - `o` open in editor, `e` edit its description
  - `q` quit
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
  - Never writes into the test projects, `tests/spaces/@spell/test/`.
- `speed`:
  - `--against HEAD` times that commit too, in a temp worktree, and adds a Change row.
  - `--runs`, `--json`.
- `parse`:  reads the line as a statement, then as an expression.
  - `--rule` for another rule, e.g. `--rule expression`.
  - `--in <project>` parses in that project's scope.
  - `--json`.
- `repl`:  a line at a time.
  - `↑↓`:  earlier lines;  `Esc` quits.
  - Piped, it reads stdin.
- `explain`:  `--in <project>`:  also what that project declares by that name, as the editor's hover.
  `--json`.
- `new`:  makes the project in Owen's own space, `owen@spell`.
  - Its folder:  `../spell-spaces/@spell/owen@/`, in spell-spaces beside the main checkout.
  - `--in <folder>`:  in that folder instead.
  - Refuses a folder with anything in it.

#### The `spell dev` commands, in more detail

- `dev` commands are the repo-tool commands, `spell dev <noun> <verb>`.
  `dev commands` was the first:  the plan for the rest is the commands page's Roadmap.
- `dev commands`:  checks against [the commands page's data](../../guides/dev/commands/commands.json5).
  - `list` marks each ✓ / ✗.
  - `check` prints only the gaps, and exits 1 on any.
  - `--json`.
- `dev wwod`:  run it after editing WWOD or an `AGENTS.md`.
  - It checks that every `WWOD §N › "title"` citation names a real section and rule.
  - And that every backticked repo path exists.
  - Where:
    - WWOD ([agents/wwod](../../agents/wwod/))
    - every `AGENTS.md` and `CLAUDE.md`, the goals' too
    - `solid-2.md`
    - skills, for citations only
  - Exits 1 on a broken one.  `--json`.
- `dev goals`:  PARKED (epic `epic-workflow` P6):  a stub that says so.
  - The goals tool, its skills and routes are in `packages/goals.zip`;  epic `epic-goals` rebuilds them.
- `dev docs`:  each verb runs as the root's `yarn docs:<verb>` did, in the docs tools' package, [epics](../epics/).
  - Arguments are passed as they are, e.g. `spell dev docs open solid/solid-2 --vs`.
- `dev server`:  this checkout's page server.
  - Its verbs:

    ```
    serve
    start | ensure
    stop
    status
    url <file>
    ```

  - `start --all`:  every web server of the checkout (page server, editor, Spell UI), and where each is.
    That's [`serve.mjs`](../../scripts/serve.mjs).
  - Root `yarn server`, `yarn serve`.
  - `epic server` runs the same, the caller's checkout's copy:  the page server serves its own checkout.
- `epic worktree merge-main`:  merges main into a branch.
  - `/isolate done` and park's Resume use it.
  - Its old spelling, `dev worktree merge-main`, still works.
  - The generated files it regenerates:  bundles, site and brand assets, snapshots, `yarn.lock`.
    - The list:  [the repo's generators list](../../.epic/generators.json5), each branch's own.
    - Read by `MainMerge.generatorsOf()`.
  - Then commits "Merge main into `<branch>`".
  - Another file in conflict stops it mid-merge:  resolve, `git add`, then `--continue`.
  - Lists snapshot entries neither side had, to review.
  - `--json`.
- `dev pack`:  what each pack's own build and check scripts run.
  - That's `yarn pack:build` and `yarn pack:check`, in the pack.
  - `new <name> [--prefix x-]`:  makes `packages/<name>/` from the package templates, and wires it into the checkout.
    - Only the files it lacks;  `package.json` is merged.
    - The templates:  [the package templates](templates/pack/package/).
  - `element <pack> <tag>`:  adds one family, from [the element templates](templates/pack/element/).
  - `build <pack>`:  writes `components/__pack/`.
    - the catalog, from the vocabularies, by Spell UI's [`RootCatalog.ts`](../ui/tools/RootCatalog.ts)
    - the entry
    - ONE classic script, `<pack>.pack.js`
  - `check [<pack>]`:  exits 1 when `components/__pack/` is stale.  No pack:  every pack.
  - Making a pack or an element builds it too, unless `--no-build`.
  - `--json`.
- `epic window`:  runs [`window.mjs`](../../scripts/window.mjs) for the caller's checkout.
  - The copy it runs:  the one beside the running `epic`.
  - Its old spelling, `dev window`, still works.
  - Its commands:

    ```
    open  close  handoff  show  which  stay-check ...
    ```

  - Works in a worktree before its `yarn install`.
  - Root `yarn window`.
- `dev vscode`:
  - `build`:  makes its `.vsix`, running these in the extension's folder:

    ```sh
    # in packages/vscode
    yarn install && yarn build && yarn package
    ```

  - `install`:  into VS Code
  - The root's yarn scripts do the same:

    ```sh
    yarn vscode           # both
    yarn vscode:build
    yarn vscode:install
    ```

#### The `epic` command

- `epic` is the epic tools' own command (epic `epic-workflow` P9):
  epic pages, the pages Owen answers on, agents, airplane mode.
  - A second bin of this package, [epic.mjs](bin/epic.mjs):  `yarn cli:install` links it beside `spell`.
    - Root `yarn epic` runs it too.
    - `yarn ask` runs `epic ask`.
  - It starts LEAN, as `spell dev` does:  [epicMain.ts](src/epicMain.ts) loads no spell, for any verb.
  - Its tree is the epic code's, `EpicProgram` ([the epics package's command folder](../epics/src/command/)),
    a class per verb group (epic `epic-eject` P5).
    - The worktree, session, park, stock, shared and window verbs were `spell dev ...`:  those still work.
    - Every verb runs the code of the `epic` that was called, on the caller's checkout:  `epic --version` says which.
  - `epic --help` lists every verb, under headings.
  - `epic help <verb>` shows one verb's;  so does `epic <verb> --help`.
- What a verb acts on:  `epic <verb> <epic>#<id>`.

  ```
  seo        the epic's page, epics/seo/seo.plan.html
  seo#J3     an item:  J3 (a comment, seo#M3, too)
  seo#P3     a phase:  P3 (seo#3 too)
  seo#J      a new item of that kind, for add:  epic add seo#J "Title"
  ```

  - E.g.:

    ```sh
    epic summary seo
    epic close seo#J3
    epic phase seo#P3 done --done "<ul>...</ul>"
    epic update seo#P3 --goal "<p>...</p>" --estimate 2h
    ```

  - [epicArgs.ts](../epics/src/command/epicArgs.ts) turns the address into the `epic` tool's own arguments:
    `seo#J3` becomes `close seo J3`.
  - A phase is written one way, `seo#P3`:
    the other spellings read the same, but nothing prints them.
  - An id always goes after the `#`.
    - The tool's own order, `epic close seo J3`, is refused.
    - The message spells it right:  `epic close seo#J3`.
  - Every verb's help has its usage, what it does and an example, a group's verbs too (`epic ask new --help`).
    - An unknown verb exits 1, listing the verbs.
    - A usage error exits 2.
- The OLD spellings still work, until no caller is left:
  - `spell dev plan-doc <command> <name> <id> ...`:  the tool's own order, older checkouts' and scripts'
  - `spell dev details | choices | comments | notes | agents | airplane`
    - These two are hidden from `spell dev --help`.
      Root `yarn plan-doc` and `yarn details` still run them.
  - `spell epic <verb>`.
  - `epic add-request <epic>#P7 <rN> --from ... --file f`:  `epic file`'s old name, hidden.
  - `spell plan-doc` is GONE:  it was deprecated, and its callers moved.
- An epic's page:  its verbs edit `<name>.plan.html`, in the epic's own folder.
  - `new`, `summary`, `phase`, `add`, `close`, `inbox` ...
  - Works in the nearest checkout:  a worktree's, when run in one.
  - The `epic` tool runs in this process:  `epic summary seo` takes ~0.4s.
- `ask`:  details pages, the `/details` skill's tool.  Runs [`details.js`](../epics/tools/details.js).
- `choices`:  runs [`choices.js`](../epics/tools/choices.js).
  - Its verbs:

    ```
    new <slug> --rows <rows.json5>
    show
    wait
    answer
    list
    ```

  - Owen sends a page with "Do it".
  - What they are:  [the choice-page guide](../../guides/syntax-choices.html).
- `notes`:  runs [`notes.ts`](../epics/tools/notes.ts), in the caller's folder.
  The notes are written into the pages.
  - `list [<epic>] [--all] [--json]`, the default:  every `new` note in the shared folders.
    - An epic's:  the notes on the pages it owns.
  - `answer <page>#<id> --file <html>`:  Claude's reply under the note, which is then `answered`.
  - `done <page>#<id>`.
  - A note is named as an epic page's comment is, `guides/x.html#n3` (the two words, `guides/x.html n3`, still read).
- `comments`:  runs [`comments.ts`](../epics/tools/comments.ts):  comments Owen leaves on docs pages.
  - Its verbs:

    ```
    list [<epic>]
    gather
    working <page>#<id> on | off
    answer <page>#<id> --file <html>
    ```
- `agents`:  for the `/bg` skill, and every agent Claude starts.
  Runs [`agents.ts`](../epics/tools/agents.ts).
  - The list:  this checkout's epic's, else the checkout's.  Both git-ignored.
    - an epic's:  `agents.json5`, in its `epics/<epic>/` folder
    - a checkout's:  `.spell-agents.json5`, at its root
  - Its verbs:

    ```
    add <name> "<task>" [--status active|"blocked on <name>"] [--task-id <id>]   prints the full name
    set <name> [--status] [--task-id]
    done <name>
    list [--json]                                     the default
    wait [--every <s>] [--max <s>] [--json]           in the background:  exits 0 with Owen's untold redirect
                                                      notes from the epic page, 3 when nothing runs, 2 on timeout
    told <name>
    ```

  - Any verb takes `--epic <name>`.
  - Names get a prefix:  the epic's, else the worktree's, else `main`.
    E.g. `add aaa` in epic skillz makes `skillz-aaa`.
  - An entry leaves when its agent finishes;  the file goes when empty.
- `airplane`:  runs [airplane.ts](../epics/tools/airplane.ts).
  - Its verbs:

    ```
    status  on  off  check [--fix]  inbox
    ```

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
- `o` in `explore` opens the file in your editor, at its line:  VS Code by default;  Cursor works too.
  - It runs `$SPELL_EDITOR -g path:line`, else `code -g path:line`.
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
- `static` writes:
  - `<page>.static.html` beside each page
  - `ui.static.css` in each output folder
  - or where `-o` / `--css` say
- These write nothing of their own:

  ```
  check  describe  explore  run  test
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

- `dev pack new` / `element` write a pack's files, never over one that's there.
  They also edit the checkout's root files:

  ```
  package.json, tsconfig.base.json, vitest.config.ts, vite.lint.ts, .gitattributes,
  .epic/generators.json5, and the shared commands page, guides/dev/commands/commands.json5
  ```

- `dev pack build` writes the pack's `components/__pack/`.

### `dev pack`

- Templates:  [`templates/pack/`](templates/pack/).
  - Every file is `*.template`, so no tool reads one as code.
  - Its tokens are filled in by `PackTokens`, in [`packNew.ts`](src/dev/packNew.ts):

    ```
    __pack__  __prefix__  __tag__  __Class__ ...
    ```

  - A file named `gitignore.template` becomes `.gitignore`.
  - How they're filled, and how to add one:  [the templates README](templates/README.md).
- A pack is a package whose `package.json` has `"spellPack": { "prefix": "epic-" }`.
- The build runs Vite in-process (`configFile: false`), on the checkout's Spell UI `baseConfig()`.
  - Only Solid and Spell UI's core and forms stay external (`PACK_MODULES`):

    ```
    solid-js  @solidjs/web  $/ui/core  $/ui/forms
    ```

    They're read from `globalThis.SpellUI.packModules`.
  - Any other Spell UI or Solid import fails the build.
- `define()`, in the generated entry, imports every family barrel:
  inlined in the one script, run when called.
  It returns that promise.
- Staleness:  a hash of `components/` and `src/` (tests left out).
  - Recorded in the catalog's second line, and the script's banner.
  - The catalog's text is compared too.
  - The check doesn't build, so each pack's test runs it.
- `pack new` adds the pack's scripts to the commands page, beside `brand`'s.
  - So on `main`, the commands check names them as missing until the branch merges.

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
    `yarn build:element`, in app's package
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

### `serve`

- Starts this checkout's PAGE SERVER if it isn't running:  [`packages/server`](../server/), on port 4747, else any free one.
  - Its route modules serve the app's `/api` (spaces' `appRoutes.ts`), docs, epics and Spell UI's docs.
- Runs the app's own `yarn start:dev` (vite), in its own process group, passing `/api` on to the page server.
  - Records it in `.spell-server.editor.json`,
    so the site header's "Editor" (`/editor` on the page server) reaches it.
- `Ctrl-C`, or vite stopping:  stops vite, and the page server if it started it.
  - A page server that already ran stays.
  - It stops no other servers, and runs no `yarn install`.
- Refuses an editor port in use, rather than drifting to another.
  - Ask for another, `spell serve --port 3100`, or stop what's there, `yarn stop` in app's package.
- Opens only projects in the app's roots (`spell projects`):  a project in some other folder opens the chooser.
- Their output is hidden unless `--verbose`, or one fails.

### `static`

- Renders through `@spell-app/ui`'s static server render
  (`$/ui/static`;  [its epic page](../../epics/seo/seo.plan.html)).
  - In a child process, [`renderStatic.ts`](src/runner/renderStatic.ts),
    on an SSR-only Vite server ([`StaticRenderer.ts`](../ui/tools/StaticRenderer.ts)).
  - Why a child:  `ui`'s Solid JSX must compile for the server, which `tsx` can't.
  - Each run starts Vite and compiles every family, so a page takes about 3 seconds.
    Several pages share one run.
- Renders the families in [`StaticCatalog`](../ui/src/static/), in `ui`.
  Any other Spell UI tag, e.g. `ui-code` or `ui-markdown`, stays as it is, and is listed on stderr.
- Removes the scripts that would load the elements:  on a static page they'd show the content twice.
  - A script, or a `<link rel="modulepreload">`, whose `src` or text names any of:
    - `@spell-app/ui`, `$/ui`
    - Spell UI's `src/` or `dist/`, or a family folder
    - the docs' `spell-ui.js` bundle
  - Other scripts stay, import maps too.
- Links the stylesheet FIRST in `<head>`, before the page's own CSS.
  - Its `@layer ui-slotted, page, ui;` sets the layer order, before a page sheet names a `ui.*` layer.
- Rewrites the page's own CSS for the flattened output, e.g. `ui-card` => `[data-ui="card"]`.
  - `::part()` and `:state()` too.
  - Its `<style>`s.
  - Each LOCAL linked stylesheet the rewrite changes,
    inlined in its place as a `<style data-static-from="...">` (relative `url()`s rebased).
  - Remote sheets, `@import`s and sheets that don't parse stay as they are:
    their rules for `ui-*` elements and their parts don't apply to the static page.
- ONE stylesheet per output folder, `ui.static.css` (or `--css <file>`), linked from every page there,
  so the browser fetches it once.
  - It holds the families its pages use AND whatever it held before.
  - Its first line, `/*! spell-static {...} */`, records what it covers:  tags, and which sheets they adopt.
  - A later run builds the union, so re-rendering one page never drops another page's styles.
  - To start a folder's sheet afresh, delete it.
- `--inline-css`:  each page gets its own stylesheet, holding only its families, in a `<style>`;  no file.
- Minified by Lightning CSS, sheet by sheet.
  - Nothing is lowered:  modern CSS stays as it is.

    ```
    @scope  @layer  :where()  light-dark()
    ```

  - A family sheet it can't parse (`ui-popup`'s `@container anchored()`) only has its comments and
    blank lines stripped, with a warning.
- Never overwrites a page:  `-o` naming the input is refused.
  Outputs are overwritten without asking.

### `speed`

- Each run is a fresh node process:  [`speedTest.mts`](src/runner/speedTest.mts) (a warm-up, then 20 timed passes).
- A side's runs combine as:  the mean of their averages, the lowest min, the highest max.
  - With 3 or more runs, ONE fluke -- an average 25% over the median -- is dropped.
- `--against <ref>`:
  - makes a temp `git worktree` of the ref, links our `node_modules` into it, and copies the runner in --
    a ref with different dependencies may not run
  - the ref must have `packages/spell` and the `$/` aliases:  from the monorepo on
  - the two sides take turns, run by run
  - the worktree is removed afterwards, even on failure

### `watch`

- It watches each project's folder:  its spell files, CSS and project file.
  It ignores `*.spell.js` and `*.scopes.js`.
- Watching both a project and one it imports:  the importer rebuilds, from scratch, after the imported one does.
  - A project imported but not watched isn't seen changing.
- On macOS a save arrives as a `rename` event, so `watch` ignores event types and looks at what's on disk.
  See [the papercuts log](../../agents/PAPERCUTS.md).

### `explore`

- It needs a real terminal.
  Otherwise it says to use `describe`, which prints the same text.
- `o` needs an editor that opens in its own window and takes `-g`.
  A terminal editor like vim can't run inside the full-screen view.
- It reads the project once:  quit and restart to see edits.

### General

- **It runs the other packages' working copies:**  whatever is in their folders right now, e.g. `../spell`.
  - A half-finished change there breaks `spell`.
  - And `yarn ts` here reports their type errors too.
- **Startup takes about half a second:**  `tsx` compiles their source on each run, and caches it.
  - `spell dev ...` and `epic ...` start in about a fifth of that:
    the bin scripts run [devMain.ts](src/devMain.ts) and [epicMain.ts](src/epicMain.ts), which load no spell.
    - Then the tool, as a child `node`:  `epic window which` takes ~0.17s.
    - Or the `epic` tool, in the same process:  `epic summary` takes ~0.4s.
  - Its commands that need spell (`session`, `stock` ...) take the usual half second.
- **Ink is pinned at 5,** from when this lived in the parser, whose app is on React 18:  6+ needs React 19.
  This repo has its own React, so it's free to move.
- **`yarn` warns `YN0072 ... --preserve-symlinks`,** about the two links.  Ignore it.
  - Node follows each link to the real folder,
    so those packages' imports find their own dependencies -- which is what we want.
- **`console.*` is silenced in the CLI:**  spell logs a lot, e.g. every `serverPath` lookup.
  - That's [`consoleGuard.ts`](src/consoleGuard.ts).
  - Write output with `session.out()` / `session.err()`.
  - An Ink screen MUST render with `patchConsole: false`.
- **Property names show as `short_suit`, not `short-suit`:**  that's what the Type Explorer gives.
  See the parser's section of [the suspected-bugs log](../../agents/SUSPECTED-BUGS.md).
- **Name clashes:**  a shell alias or function named `spell` hides the command.
  Check `type -a spell` in a login shell.
- **Test projects:**  running a test project (`tests/spaces/@spell/test/`) from VS Code's ▶ Run Project writes into it.
  - It writes `settings.json5` there;  its compiled javascript goes in `build/`.
  - Test projects should stay frozen, so delete it.


## TODO

### Commands not built yet

- `spell lsp`:  start the language server, so the extension spawns it rather than a `tsx` path

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
  - Tests:  54 in all, in the repo's `tests/cli/src/**/*.test.ts(x)`.
    They include end-to-end runs of the bin script ([spell.mjs](bin/spell.mjs)).
- The one thing it needs IN spell, in [`SpellProject.ts`](../spell/src/SpellProject.ts):
  `SpellProject.compile(parentScope, { save })`.
  - `save: false` skips writing `<Project>.spell.js`.
  - Without it, `compile --stdout` would write into the project, as would running or testing it.
- Brought up to date with the parser's scope-tree rework when it moved here:
  - things in the Type Explorer's tree are named by `path`, not `id`
  - where something is comes from its details' `line`, and the file it's in (see `CLI.declaredAt()`)
    - so explore's `o` opens at a line, no longer a column
  - the first line of `describe <name>` is worked out here, as details no longer carry one
    - see `summary()`, in [describeText.ts](src/describeText.ts)
  - members list in the order they're declared, as the Type Explorer now shows them
- Two suspected bugs found along the way, in the parser's section of [the suspected-bugs log](../../agents/SUSPECTED-BUGS.md):
  - `SpellDiskWorkspace.diskChanged(uri, "created")` keeps a loaded file's old text
  - `ScopeExplorer` property names
