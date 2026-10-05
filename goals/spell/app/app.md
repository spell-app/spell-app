# 6 · app -- notes for agents

The editor where people write and run spells, and, soon, build them by dragging things around.

- **Page for people:** [app.html](app.html) -- the source of truth for goals, questions and decisions.
- **Status:** draft -- a first pass, not yet talked through.  Updated 2026-10-01.
- **Rules for this folder:** [../AGENTS.md](../../AGENTS.md)

> **Draft.**  Nothing here is decided yet.  Goals and work items are proposals:  don't start a `W` item until
> the page marks it agreed (a `D` decision, or the topic's status `agreed`).

## Context

- **Today:**  a web app (React, Monaco) that compiles as you type and runs the program beside your code, with the
  same language features as VS Code.
- **Strong core:**  the compiler runs in the browser;  the server only reads and writes files.
- **Not yet for people:**  projects live inside the source tree, there's no file list, Help and About are stubs,
  and parser debug panes take half the screen.
- **Next:**  a friendlier shell, a "my projects" folder, then drag-and-drop editing.

### Today

- **Where:**  `packages/app`:  routes `/` (projects), `/edit/...`, `/run/...`;  the editor page is
  `packages/app/src/pages/SpellEditor.tsx`.
- **Editor page:**  Monaco and a console on the left;  the running app, an AST viewer and a match viewer on the
  right;  files from a dropdown.  Compiles two seconds after you stop typing.
- **Serving:**  a vite dev server (:3000) plus an express file API (:3001);  `yarn start` in `packages/app`.
- **Stubs:**  log in, publish, docs, about, help and project settings only log a TODO
  (`packages/app/src/editor.ts`).
- **UI stack:**  React 18 and semantic-ui-react;  a move to Solid and @spell-app/ui is planned but paused.
- **Explorers:**  the Type and Thing explorers exist, but only in `<spell-app>`'s debug pane and the VS Code runner.
- **Server safety:**  fine on localhost, not beyond it (`agents/SUSPECTED-BUGS.md`:  no file locking, stack traces sent
  to the browser).

## Decisions (settled -- don't relitigate)

_None yet._

## Work (proposed)

### W1 · Projects in a user folder

- **Status:** proposed
- **What:** make the projects root configurable;  "duplicate this example"

### W2 · Hide the developer panes

- **Status:** proposed
- **What:** AST and match viewers behind a setting

### W3 · Fix the server's suspected bugs

- **Status:** proposed
- **What:** locking, error responses:  agents/SUSPECTED-BUGS.md, spell §2

## Open questions (ask, don't decide)

- **Q1 · Rebuild the shell on Solid first?** -- or add features on React and migrate later
- **Q2 · What's on the first screen?** -- a gallery of examples?  a blank card?  a guide?
- **Q3 · How does dragging map to text?** -- does dropping a button write spell, JSX, or a layout file?
- **Q4 · Web app, desktop app, or both?** -- and a hosted playground?
- **Q5 · Monaco or CodeMirror?** -- Monaco is heavy and desktop-only;  CodeMirror 6 is lighter and works on phones
- **Q6 · How visible is the parser?** -- AST and match panes:  a developer mode only?

## Goals (direction, not orders)

- **Now → December 2026:**
  - **G1 · A shell for people, not parser developers** -- debug panes behind a switch;  a file list;  clear Run and Edit
  - **G2 · My projects** -- projects in your own folder;  new, duplicate an example, rename, delete
  - **G3 · Guides inside the app** -- the `@system:guides` root is configured but empty;  see docs
  - **G4 · Runs without a dev server** -- a static build plus a storage adapter:  the base for native and web-components
- **2027:**
  - **G5 · Drag-and-drop editing** -- place `ui-*` components, set their properties, attach scripts
  - **G6 · Browse, author and script modes** -- HyperCard's levels, as modes
  - **G7 · Undo you can trust** -- named snapshots and branches
- **Someday:**
  - **G8 · The editor is a spell** -- people can change the editor itself

## Risks to keep in mind

- **R1 · The rewrite trap** -- migrating and adding features at once
- **R2 · A server that trusts its browser** -- fine locally;  a hosted app needs real safety
- **R3 · Monaco's weight** -- slow first load;  no phones or tablets

## Pointers

- `packages/app/AGENTS.md` -- how the app is built
- `packages/app/src/pages/SpellEditor.tsx`, `packages/app/src/editor.ts`, `packages/app/src/server/`
- `/Users/owen/www/spell-app/outstanding/solid-migration.md` -- the paused React-to-Solid plan
- `/Users/owen/www/spell-app/_thoughts/editor needs to.md` -- 2019 editor wishes
