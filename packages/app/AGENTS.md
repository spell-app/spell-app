# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/app`.

**Root conventions apply:  READ the repo root's `AGENTS.md` FIRST** -- its Solid 2, Documentation, Functions,
Types / Exports and Imports sections all apply here.  Only what DIFFERS is below.

## Overview

- The top of the chain (below `cli`):  the web app, its server, and the embeddable web components.  Everything
  else is a package it imports:  `$/spell`, `$/lsp`, `$/parser`, `$/util`, `@spell-app/ui` ...
- React and Solid side by side, while the app moves to Solid 2 (READ the root's Solid 2 pointer for Solid work):
  - Solid is the DEFAULT JSX:  a new `.tsx` is Solid.  A React file's FIRST line is `/** @jsxImportSource react */`
    -- `tsc` reads it, and so does `vite.shared.ts` (`reactFiles()`), which every `vite*.config.ts` /
    `vitest.config.ts` here builds on.  Restart `vite` after adding or dropping one.  `CODE-DEBT.md` "app".
  - Two test projects (`vitest.config.ts`):  `node` for most tests, where `solid-js` is its SERVER build
    (`renderToString`;  writes NOT staged, see `src/solid.test.tsx`), and `browser` (chromium) for
    `*.browser.test.ts(x)`:  Solid's client build, as in the app.
  - `$/app/solid` is the Solid plumbing:  `tracked()` lets Solid code see `easy-state` (spell Things, the editor
    store) change.
- `src/` is the app:
  `ui/` (`UI`, `F` for `ui/forms`), `pages/`, `runner/`, `spellEditor/`, `editor.ts`, `index.tsx`.
  `src/server/` is its API server (`api.ts`, `index.ts`) on `$/server`'s Express-shaped `SRV.Router` /
  `SRV.WebServer` (it was Express):  `api.test.ts` pins its behaviour over HTTP.  The file / project helpers it
  calls are NOT here, they're node-only code in `$/spell/node/...` (`project-utils`, `file-utils`, `disk-fetch` ...).
- `index.html`, `demo/`, `static/` and the `vite*.config.ts` files are here too.
- Scripts run HERE (`cd packages/app`):
  - `yarn start` -- `spell serve --headless`:  the editor (port 3000, vite) and the page server with the API on it
    (`src/server/appRoutes.ts`, a route module;  see `packages/server`).  `yarn stop` stops vite.
    `yarn start:server` / `start:server:prod` still run the API alone, on port 3001 (`src/server/index.ts`).
  - `yarn build` -- the app.  `yarn build:runner` -- `dist-runner/` (VS Code's "Run Project" webview).
    `yarn build:element` -- `dist-element/` (`<spell-app>` and `<spell-editor>`).
  - `yarn vscode` is NOT here:  it's the repo root's.  `yarn start:lsp` and `yarn scopes` are in `../lsp`.
- `src/ui/monaco/` is the app's Monaco plumbing (no UI), whose language features call the SAME
  `LSP.SpellLanguageService` in-process.  `$/lsp` MUST stay browser-safe for it.  The editors on it are Solid,
  `src/solid/monaco/` (`MonacoEditor`, `FileEditor`), whose barrel re-exports the plumbing.
  - Loaded LAZILY, through `$/app/solid`'s `LazyMonaco` (and `<spell-editor>`'s `loadMonaco()`):  NEVER import
    `$/app/ui/monaco` or `$/app/solid/monaco` statically outside those folders -- types aside -- or Monaco (~4.4 MB)
    lands in the main bundle again.
- Solid panes in React pages (P6, until P8):  the React `UI` barrel's `./islands` mounts the Solid panes under
  their old names (`UI.InputRoot`, `UI.ConsoleRoot` ...);  the runners' `./runnerIslands` likewise, importing the
  Solid files directly.  An island's wrapper is `.SolidIsland`, `display: contents`:  a `> *` rule reaches its pane
  with `> .SolidIsland > *` (`SplitPanel.css`).  `index.html` wraps the app in `<ui-root icons="fomantic">`:  the
  app's icon names are Fomantic's (`src/solid/loadUI.ts`).
- `src/runner/` runs compiled spell:  the pieces every runner shares -- the web app's editor, VS Code's
  "Run Project" webview (`VSCodeRunner`, `yarn build:runner`) and the `<spell-app>` web component
  (`SpellAppElement`, `yarn build:element` => `dist-element/`, demo at `/demo/spell-app.html` on the dev server).
  - Programs run on `spell-runtime.js` (`spellRuntime.ts`), NEVER the page's own `core`:  the app loads it
    once (`editor.loadRuntime()`), the VS Code runner once, and each `<spell-app>` its OWN copy (`loadRuntime()`),
    so apps on a page don't share a `spellCore`.  No import map:  `runCompiled()` links each program's imports.
  - So ONLY `spellRuntime.ts` may value-import `$/core`, in every bundle:  anything else -- the app, the
    parser, the forms -- puts it in a shared chunk, or loads a second one.  They read
    `$/core/spellCore.types` (runtime-light), or the runtime's, e.g. `runtimeConsole()`.  Mind barrels:
    `$/app/runner` holds `runCompiled()`, so a bundle's entry imports its runner's file directly.
    Pinned by `element.build.test.ts` and `build.test.ts`.  See `../core/AGENTS.md`.
  - It runs in a shadow root:  `spellCore.appRoot` is where an app mounts, and `spellCore.domRoot()` where to look
    elements up and add styles -- NEVER `document`.
  - Its Type Explorer reads scope packs, `<Project>.scopes.js` (`LSP.ScopePack`) -- no parser in the page.
  - Its Thing Explorer reads the runtime copy's `spellCore.things` (`ThingRegistry`):  each `Thing`, and each
    instance of a `List` sub-class, registers itself as it's made;  the program's exports are its top-level things.
    `yarn scopes [--compile] <projectId...>` (in `../lsp`) writes them;  so does the language server, after each
    clean compile.
- `src/spellEditor/` is `<spell-editor>` (`SpellEditorElement`, `yarn build:element` => `spell-editor.js`, demo at
  `/demo/spell-editor.html`):  the app's Monaco editor as a web component, editing a server project and feeding
  `<spell-app>`s what it compiles (`SPELL_COMPILED_EVENT`, `SpellCompiled` in `runner.types.ts`).
  - Its OWN build, `vite.editor.config.ts`, so Monaco's CSS stays out of `spell-app.css`.  Monaco is a lazy chunk:
    the parser compiles, and apps run, before it loads.  Pinned by `element.build.test.ts`.
  - Several on a page edit several projects:  each `SpellModels.use()`s its own, and listens with
    `SpellMonaco.onEdit()` / `onOpen()` -- NOT the app's `editor`.  NEVER import `UI` or `LazyMonaco` there.
- Styles are plain `.css`:  native nesting, custom properties (`spell.css`, `syntax.css`) -- no Less.
- Prod build MUST keep `output.keepNames` (`vite.config.ts`, and `vite.editor.config.ts`):  a rule's class name IS
  its rule name.  Pinned by `build.test.ts`.

## Imports

- As the root's, with our own `src/` as `$/app` / `$/app/*`, e.g. `import { UI } from "$/app/ui"`.
- Nothing imports THIS package except `cli` (and the `<script>` entries in `index.html` / `demo/`).

## Decorators

As the root's, plus:

- `vite.decorators.ts` (repo root) is used by every `vite*.config.ts` and `vitest.config.ts` here.
  The server is fine as `tsx` is esbuild already.

## Types / Exports

As the root's, plus our self-namespaces:

- `UI` ~== `$/app/ui`
- `F` ~== `$/app/ui/forms`
