# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/app`.

**READ the repo root's `AGENTS.md` and WWOD (`agents/wwod/WWOD.md`) FIRST:**  the repo's layout, and the
house style every package shares.  Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- The top of the chain (below `cli`):  the web app, its server, and the embeddable web components.  Everything
  else is a package it imports:  `$/spell`, `$/lsp`, `$/parser`, `$/util`, `@spell-app/ui` ...
- The app is Solid 2 (READ the root's Solid 2 pointer for Solid work);  React is ONLY what compiled spell draws
  with (`core`'s classes, `src/ui/forms/`, `SUIPassThroughs`), loaded by `spell-runtime.js` -- `build.test.ts` pins
  that the app's own chunks hold none:
  - Solid is the DEFAULT JSX:  a new `.tsx` is Solid.  A React file's FIRST line is `/** @jsxImportSource react */`
    -- `tsc` reads it, and so does `vite.shared.ts` (`reactFiles()`), which every `vite*.config.ts` /
    `vitest.config.ts` here builds on.  Restart `vite` after adding or dropping one.  `agents/CODE-DEBT.md` "app".
  - Two test projects (`vitest.config.ts`):  `node` for most tests, where `solid-js` is its SERVER build
    (`renderToString`;  writes NOT staged, see `src/solid.test.tsx`), and `browser` (chromium) for
    `*.browser.test.ts(x)`:  Solid's client build, as in the app.
  - `$/app/solid` is the app's UI, all Solid (P8):  the pages' shell (`SpellPage`, `SplitPanel`, `AppRoot`), menus,
    panes, dialogs, and the plumbing:  `cellsBridge.ts` makes every Solid computation follow spell cells (spell
    Things, `SP.*`, the editor -- P11);  each entry imports it before rendering.  `tracked()` is a memo over such a
    read.  Spell's React kit (`F`, `Thing.Component`) follows them through `$/util`'s `view()`.
- `src/` is the app:
  `solid/` (the UI), `pages/` (the pages and the router), `ui/` (`UI`, `F` for `ui/forms`:  spell PROGRAMS' React
  kit), `runner/`, `spellEditor/`, `editor.ts`, `index.tsx` (Solid `render()` into `#app-root`).
  `src/server/` is its API server (`api.ts`, `index.ts`) on `$/server`'s Express-shaped `SRV.Router` /
  `SRV.WebServer` (it was Express):  `api.test.ts` pins its behaviour over HTTP.  The file / project helpers it
  calls are NOT here, they're node-only code in `$/spell/node/...` (`project-utils`, `file-utils`, `disk-fetch` ...).
- `index.html`, `demo/`, `static/` and the `vite*.config.ts` files are here too.
- Scripts run HERE (`cd packages/app`):
  - The editor (vite, port 3000 if free, else any) is the PAGE SERVER's child:  `src/server/appRoutes.ts` (a route
    module;  see `packages/server`) starts it with `EditorServer` once the page server listens, and stops it with
    the page server.  So `spell dev server` (repo root) runs the API AND the editor;  its URL is in
    `<root>/.spell-server.editor.json`, its output in `.spell-server.editor.log`;  `SPELL_NO_EDITOR=1` skips it.
  - `yarn start` -- restarts the page server, then `spell serve --headless` (waits for the editor, prints its URL).
    `yarn stop` stops vite (an orphan, or the page server's:  then restart the page server).
    `yarn start:server` / `start:server:prod` still run the API alone, on port 3001 (`src/server/index.ts`).
  - `yarn build` -- the app.  `yarn build:runner` -- `dist-runner/` (VS Code's "Run Project" webview).
    `yarn build:element` -- `dist-element/` (`<spell-app>` and `<spell-editor>`).
  - ONE Solid per page across those bundles:  `vite.solid.config.ts` builds FIRST into each folder `spell-solid.js`
    (Solid + `@spell-app/solid-element`) and `spell-ui.js` (`$/ui`, lazy;  its chunks in `ui/`, icon packs beside
    it);  the element / editor / runner builds import them through `sharedSolid()` (`vite.shared.ts`), never
    bundling their own.  `spell-runtime.js` never loads them.  Pinned by `element.build.test.ts`.
  - `spell dev vscode` is NOT here:  it's the repo root's.  `yarn start:lsp` and `yarn scopes` are in `../lsp`.
- `src/ui/monaco/` is the app's Monaco plumbing (no UI), whose language features call the SAME
  `LSP.SpellLanguageService` in-process (so `$/lsp` stays browser-safe:  `../lsp/AGENTS.md`).  The editors on it
  are Solid, `src/solid/monaco/` (`MonacoEditor`, `FileEditor`), whose barrel re-exports the plumbing.
  - Loaded LAZILY, through `$/app/solid`'s `LazyMonaco` (and `<spell-editor>`'s `loadMonaco()`):  NEVER import
    `$/app/ui/monaco` or `$/app/solid/monaco` statically outside those folders -- types aside -- or Monaco (~4.4 MB)
    lands in the main bundle again.
- Routing (P8):  `src/pages/routes.tsx`, `@solidjs/router@next` (`createRouter()`, pinned exactly):
  - the router ships Solid JSX SOURCE (`dist/*.jsx`):  `vite.shared.ts`'s `NOT_SOLID_SOURCE` lets the Solid plugin
    compile it out of `node_modules`.  Another such package goes there too
  - `explicitLinks`:  it takes only `<a link>` clicks, never a running program's own `<a>`s
  - `editor` navigates through `src/pages/navigation.ts` `navigate()` (no Solid in it), which the router's root
    layout hands its `navigate()` to;  route components call `followRoute()`, which hands the URL's params to
    `editor.selectPath()`
  - the editor page's shortcuts are ONE `keydown` listener (`src/pages/editorHotkeys.ts`)
- `index.html` wraps the app in `<ui-root icons="fomantic">`:  the app's icon names are Fomantic's
  (`src/solid/loadUI.ts`).  It still links `semantic.min.css`:  running programs draw with Semantic UI's React kit.
- `src/runner/` runs compiled spell:  the pieces every runner shares -- the web app's editor, VS Code's
  "Run Project" webview (`VSCodeRunner`, `yarn build:runner`) and the `<spell-app>` web component
  (`SpellAppElement`, `yarn build:element` => `dist-element/`, demo at `/demo/spell-app.html` on the dev server).
  - Solid (P7), on `@spell-app/ui`:  the runners import the Solid panes' FILES (`$/app/solid/ThingExplorer`,
    `.../ConsoleLines`, `.../loadUI`), never the `$/app/solid` barrel (it pulls in the editor).  `<spell-app>` and
    `<spell-editor>` are `customElement()`s (`@spell-app/solid-element`) on a base class holding their methods;
    `<spell-app>` wraps its shadow root in `<ui-root icons="fomantic">`, VS Code's webview HTML its `#runner-root`.
  - The PROGRAM still draws with React (`App.start()` makes its own root):  a runner hands it `appRoot`, a `<div>`
    drawn once and never touched again;  Semantic UI's CSS stays wherever programs draw.
  - Programs run on `spell-runtime.js` (`spellRuntime.ts`), NEVER the page's own `core`:  the app loads it
    once (`editor.loadRuntime()`), the VS Code runner once, and each `<spell-app>` its OWN copy (`loadRuntime()`),
    so apps on a page don't share a `spellCore`.  No import map:  `runCompiled()` links each program's imports.
  - So ONLY `spellRuntime.ts` may value-import `$/core`, and the program finds its elements through
    `spellCore.domRoot()`, never `document`:  SEE `../core/AGENTS.md` "Who may value-import it".  Mind barrels:
    `$/app/runner` holds `runCompiled()`, so a bundle's entry imports its runner's file directly.
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
- Styles:  WWOD §18 › "Plain `.css` beside its component" (no Less);  app-wide sheets:  `spell.css`, `syntax.css`.
- Prod builds keep class names (`output.keepNames`, here):  SEE `../parser/AGENTS.md`, `keepNames`.

## Imports

- As WWOD §4, with our own `src/` as `$/app` / `$/app/*`, e.g. `import { UI } from "$/app/ui"`.
- Nothing imports THIS package except `cli` (and the `<script>` entries in `index.html` / `demo/`).

## Decorators

As WWOD §12, plus:

- `vite.decorators.ts` (repo root) is used by every `vite*.config.ts` and `vitest.config.ts` here.
  The server is fine as `tsx` is esbuild already.

## Types / Exports

As WWOD §8, plus our self-namespaces:

- `UI` ~== `$/app/ui`
- `F` ~== `$/app/ui/forms`
