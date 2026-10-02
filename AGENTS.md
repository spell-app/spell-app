# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this repository.

**If working with Solid (2.0) -- components, JSX, effects / signals / stores, `core` rendering, `$/util`
reactivity, `@spell-app/ui` elements, or any React-to-Solid step:  READ `packages/docs/solid/solid-2.md` IN FULL
FIRST.**  Solid 2 is neither React nor Solid 1, and guessing from either produces wrong code.

## Overview

- Spell:  the parser, the spell language and its tools, and `@spell-app/ui` -- one yarn workspace per folder in
  `packages/`.  Root `yarn ts` / `yarn test` / `yarn review` run each package's own script of that name.
- This file holds the conventions EVERY package shares.  Each package's `AGENTS.md` holds only what's local to it;
  a section there with the same name as one here EXTENDS it ("As the root's, plus:").
  - Codex reads every `AGENTS.md` from the root down to its working folder;  Claude Code loads the root `CLAUDE.md`
    plus the package's.  So a rule lives in exactly ONE place.
- Packages (`$/name` is the import alias, `$` meaning `packages/`;  `X` the self-namespace -- see "Imports"):
  - `packages/util/` (`@spell-app/util`, `$/util`) -- helpers `ui` and spell share:  small generic ones (`@proto` ...) and
    spell's own in `src/spell/` (lodash, `Observable`, `Task` ...).  See its `AGENTS.md`.
  - `packages/parser/` (`@spell-app/parser`, `$/parser`, `P`) -- the generic rule-based parser.  Rulex is an opt-in
    side-effect import, `$/parser/rulex`.  See its `AGENTS.md`.
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
    their templates, the plan docs `/plan-doc` keeps, the experiments behind them and the tooling.
    Index:  `packages/docs/index.html`.  See `packages/docs/AGENTS.md`.
  - `packages/server/` (`@spell-app/server`, `$/server`, `SRV`) -- serving pages locally:  static folders, an
    Express-shaped router, live reload, ports, openers, a file lock, and the ONE page server per checkout
    (`yarn server`) that serves docs, plans, goals and Spell UI docs.  See `packages/server/AGENTS.md`.
- One change may touch several packages, but dependencies flow ONE way:
  `docs` -> anything (its experiments import any package;  nothing imports `docs`),
  `cli` -> `app` -> `lsp` -> `spell` -> `parser` / `core` -> `util`, and
  `ui` -> `solid-element` / `util`.  NEVER make `ui` or `solid-element` import `spell` or any package above it:
  `@spell-app/ui` lives on its own.
  - `server` is a LEAF (node built-ins only, imports no package):  ANY package may import it, `ui`'s tools too.
  - The direction is by convention, not enforced:  every alias works from every package.
- ONE alias table, `tsconfig.base.json` at the repo root, read its header comment.  Every package's `tsconfig.json`
  extends it, so `$/parser` means the same file wherever it's compiled from.
- Global ambient types (`Prettify`, `Class`, `__PACKAGE_VERSION__` ...) are in the root `types/` folder, which every
  spell-family `tsconfig.json` includes.  `vite.decorators.ts` and `vite.packageVersion.ts` are at the repo root.
- No `~/` or `#name` alias exists any more.  `$` means `packages/`, so `ui` is `$/ui` like the rest;  that can't
  collide with an npm package name (`@spell-app/...`, `solid-js`) the way a bare `name/...` could.
  Examples below use `parser`'s, e.g. `$/parser`.

## Worktrees

- Owen works in one VS Code window per package, opened from `packages/<pkg>/<pkg>.code-workspace` (`yarn window
  init` writes missing ones;  each has its own theme).  Folder 1 is the REPO ROOT, folder 2 the package.  Why:  the
  Claude panel lists only the sessions saved under a window's FIRST folder, so every window lists every session.
  - So sessions start at the repo root:  read the package's `AGENTS.md` before working in a package.
- Enter a worktree with `/isolate <name>` (`/plan-doc` does it too), or `EnterWorktree`.  The `WorktreeCreate` hook
  (`.claude/hooks/worktree.mjs`) makes `.claude/worktrees/<name>` on branch `<name>` from local `main`, and keeps the
  session saved at the root (Claude's own worktrees move it, and it drops out of every window's list).
- Open the worktree in its OWN new window at once, from the worktree's root:  `node scripts/window.mjs open <name>`;
  `... close <name>` on leaving.  Then `... handoff <name>`:  when the turn ends, the session moves to that window,
  in an editor tab (never the sidebar), and its old tab closes (the `Stop` hook, `.claude/hooks/handoff.mjs`).
  - The window:  `.claude/worktrees/<name>.code-workspace`, the package window's theme with a title bar tinted
    per worktree.  Folders:  the MAIN repo root first (so its Claude panel lists every session), then the
    worktree's `packages/<pkg>` (`<pkg> ⎇ <name>`) and root (`spell-app ⎇ <name>`).
  - Why:  Owen reviews in VS Code;  edits a window doesn't show are invisible there.
  - `node`, not `yarn window`:  `yarn` runs no script in a worktree before its `yarn install`.
- NEVER `code --add` / `--remove` (the focused window;  a one-folder window restarts its extensions, Claude panel
  included) or `code -r` (restarts the session).  `code <file>.code-workspace` only through `window.mjs open`.
- Leave with `ExitWorktree` `keep`;  the hook's `remove` never deletes uncommitted or unmerged work.
- Say so in one line ("isolated in worktree <name> (branch <name>), open in its own window, <pkg> ⎇ <name>").

## Solid 2

- `spell` is moving from React to Solid 2 (`2.0.0-rc.13`;  `@spell-app/ui` still pins rc.11) on `@spell-app/ui`.
  Solid 2 is NEITHER React NOR Solid 1.
- The rules:  `packages/docs/solid/solid-2.md` (see the top of this file).  NOT `@`-imported on purpose:
  it loads only when the task needs it.  Claude also has the `solid-2` skill (`.claude/skills/solid-2/`), which
  triggers on Solid work.
- The why and the measurements:  `packages/docs/solid/solid-2.html`.
  The API:  `packages/docs/solid/cheatsheet.html`.
- MUST keep `solid-2.md` up to date when a Solid decision changes or an RC bump changes behaviour.
- How `ui` writes its elements on Solid:  "Solid authoring" in `packages/ui/AGENTS.md`.

## Long-term debt

- `CODE-DEBT.md` tracks structural debt we have knowingly chosen NOT to fix yet.
- It, `SUSPECTED-BUGS.md` and `PAPERCUTS.md` live at the REPO ROOT:  one file each for every package, with a
  `## <package>` section per package.  Add to your package's section.
- Add an entry when a problem is structural, too big to fix in passing, and being tolerated
  deliberately -- especially when a test or lint rule is pinned, skipped or widened to
  accommodate it.  Record the mechanism, not a guess, so nobody rediscovers it.
- NOT for local cleanups (inline `REFACTOR:` marker), suspected bugs (`SUSPECTED-BUGS.md`)
  or tooling papercuts (`PAPERCUTS.md`).
- See that file's header for the entry format.

## Documentation

- Create and maintain a markdown docstring comments before:
  - types and each property in a type
  - classes and class methods/fields
  - loose methods
- Explain _why_, don't just restate the code.
- Make sure to note side effects and unexpected conventions.
- Format:
  - informal style, one line and then `-` bullets
  - DO NOT use jsdoc `@param` etc
  - terse text, e.g. `last server version`, not `the last known server version`
  - two spaces after a period
  - backticked identifiers/types
  - format lists as bullets rather than inline commas
  - `~==` for "equivalent to" and `===` for exactly equals
- Marker vocabulary / invariants: NOTE, TODO, SIDE EFFECT, HACK, NEVER, MUST, DOCME, RENAME, DEPRECATED
- Wrap comments at english phrase boundaries, not mid-clause. Avoid single or double widow words,
  wrap `e.g.` clauses if they don't fit on the original line, etc.
  and drop filler articles (`the`, `a`) that don't earn their place
- Write or clarify docstrings and comments where you see marker `DOCME`.
- Always place a blank line before a group header like the below.
- Separate function code groups like so:

```

////////////////
// ## Group Name
////////////////
```

- Separate components -- React / Solid components, custom element classes -- with a header like so.
  A custom element goes by its tag, e.g. `` ### `<ui-component-name>` ``:

```

/****************
 * ### `<ComponentName>`
 * Description of the component.
 ****************/
```

## Functions

- An inner helper that doesn't use `this` is NOT an inline arrow (`const visit = (...) => ...`).  Either:
  - make it a private helper function, or
  - declare it `function visit(...) {...}` at the BOTTOM of the enclosing function, after any `return`,
    with a docstring saying what it does -- hoisting makes it callable from above.
- Arrow functions stay fine for short callbacks passed inline, e.g. `tokens.map((token) => token.value)`.

## Decorators

- Use STANDARD (TC39 2023-11) decorators, NEVER `experimentalDecorators`.  General-purpose ones live in
  `packages/util/src/decorators.ts` (`@proto`:  import from `$/util`;  `ui` has `$/ui/util`, which re-exports the generic ones).
- Lowered by esbuild via the repo root's `vite.decorators.ts` -- vite 8's own transformer (oxc) doesn't do it yet.
  Which configs use it:  the package's own "Decorators".
- A decorator MUST be the first thing on its line (`@proto static inlineInitialType = false` is fine,
  and preferred) or that plugin won't notice the file.

## Types / Exports

- ALWAYS use `type` rather than `interface`. Wrap with `Prettify` (from the package's `util`) when combining types.
- One exported class per file, file named for the class.  e.g. `Keyword.ts`, `Symbol.ts`
  rather than both living in `Literal.ts`.
- Types and helper functions appear AFTER the durable JS structure that uses them,
  e.g. `ScopeProps` goes directly below `class Scope`.
- Centralize shared types in a single `<folder>.types.ts` per folder, e.g. `parser.types.ts`, `rules.types.ts`.
  - NEVER bare `types.ts` or `constants.ts` -- constants, small error classes
    and pure helpers for those types live in `<folder>.types.ts` too.
  - Group with `// ## Group Name` headers.
  - MUST be runtime-light:  `import type` only, apart from the package's utilities (`$/util`, `$/ui/util`).
  - Exception: class constructor props (`XProps`) and React component props live in the defining file.
    Move to `<folder>.types.ts` once a second file needs them.
- Create barrel `index.ts` for each folder:
  - header comment block explaining the barrel, with `NOTE:` for anything deliberately left out or namespaced
  - `export * from "./<folder>.types"` first, then leaf files base-classes-first
  - sub-folder barrels are flattened in:  `export * from "./rules"`
- Each sub-system has ONE self-namespace, exported from its top barrel:  `export * as P from "."`
  - each package's `AGENTS.md` lists its own, e.g. `P` ~== `$/parser`
  - NEVER create a second namespace for a sub-folder (no `R` for rules) -- flatten into parent.
  - Exception: namespace a file whose names would collide when flattened:
    `export * as render from "./renderAST"` + `export * as stringify from "./stringifyAST"`,
    which deliberately export the same names with different return types.
  - Prefer a disambiguating affix over a namespace when the names allow it -- token and AST classes
    are `WordToken` / `ASTLiteral` etc. and flatten straight into `$/parser`.
  - NOTE: `export *` through a circular barrel is riskier than a named re-export -- it must read the
    leaf's key list EAGERLY, so a mid-body leaf contributes nothing.  See `parser`'s `src/barrel.test.ts`.
- Barrels MUST NOT pull in optional sub-systems.  Make them opt-in via side-effect import,
  e.g. `import "$/parser/rulex"` registers itself on `Parser.rulexParser`.
- When refactoring imports and exports, if you encounter circular import problems
  create smoke tests (`barrel.test.ts`) ensuring no circular import problems in
  TS/rollup/browser for various entry points.

## Imports

- ALWAYS import starting from a package alias, NEVER start import from `../`.  Every package's alias is `$/name`
  (`$/parser`, `$/core`, `$/ui` ...), `$` meaning `packages/`.  `ui` is no exception:  its test helpers are
  `$/ui/test/...`.  The one table is `tsconfig.base.json`.
  - INSIDE a package, `$/name` is its barrel and `$/name/deep/path` any file in its `src/`, e.g. `$/app/ui`.
  - From ANOTHER package, import the BARREL only (`$/parser`, never `$/parser/rules/Rule`), except the entry points
    named in `tsconfig.base.json`'s header:
    - `$/parser/rulex` (opt-in side-effect import)
    - `$/parser/test` and `$/spell/test` (test helpers)
    - `$/ui/test/...` (`ui`'s test helpers)
    - `$/spell/node/...` (node-only:  environment, files on disk)
    - `$/util/class`, `$/util/decorators` ... (`util`'s GENERIC files, from `ui`'s `src/util/index.ts` only:  the barrel
      also holds spell's heavy utilities)
  - Other aliases and exceptions are in the package's own "Imports".
- OK to import from direct peers: `import { Rule } from "./Rule"`, but not subdirectories -- use `$/parser/...` instead.
- Prefer ONE namespace import per sub-system and qualify at use site:
  `import { P } from "$/parser"` => `P.Match`, `new P.Symbol(...)`, `P.ASTExpression`.
  - Applies INSIDE the sub-system as well.
  - Self-import uses full path too, even from same folder as the barrel:
    `import { P } from "$/parser"`, NEVER `import { P } from "."`.
    Only the barrel itself says `"."`:  `export * as P from "."`.
  - NEVER reach into another sub-system's leaf file for something its barrel exports.
  - OK to refer to file's own class unqualified.
  - Tests may mix: `import { P, Match, Parser } from "$/parser"`.
- Circularity rules for files inside a barrel:
  - `P.X` as a VALUE is fine inside function / method bodies -- resolved at call time.
  - NEVER use `P.X` at module-evaluation time:  `extends` clauses, static initializers,
    top-level `new`.  Circular reentry silently yields `undefined` / broken `instanceof`.
  - Import base classes directly from the defining file, with comment:
    `// Import directly to avoid circular import`
  - Use `import type { P }` when file only needs types, e.g. `*.types.ts`, `Tokens.ts`.
- Import order:
  - node_modules
  - (blank line)
  - `$/util` and other general utilities, general-to-specific
  - other sub-system barrels
  - own barrel
  - direct peer files, base classes first
  - (blank line)
  - side-effect imports (`import "$/parser/rulex"`)
  - css files (`./foo.css` if in same folder, else `$/name/path/to/foo.css`)
- One import statement per module.  Inline type imports:  `import { P, type AnyMatch } from "$/parser"`.
