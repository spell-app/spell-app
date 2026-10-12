# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/app`.

**READ the repo root's `AGENTS.md` and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
- the root's:  the repo's layout
- WWOD:  the house style every package shares
- Only what's local is below.
  A section named like a WWOD rule extends it.

## Overview

- The top of the chain (below `cli`):  the web app, its server, and the embeddable web components.
  - Everything else is a package it imports:  spell, lsp, parser, util, Spell UI ...
- The app is Solid 2 (READ the root's Solid 2 pointer for Solid work).
  - So is what compiled spell draws, on the page's Spell UI (epic `output-targets` P10-P11):
    `core`'s [drawing.ts](../core/src/drawing.ts).
  - No React:  every `.tsx` is Solid.
  - `build.test.ts` pins that no chunk holds React, `spell-runtime.js` included.
  - Two test projects (`vitest.config.ts`):
    - `node`, for most tests:  there Solid is its SERVER build
      (`renderToString`;  writes NOT staged, see [solid.test.tsx](src/solid.test.tsx))
    - `browser` (chromium), for `*.browser.test.ts(x)`:  Solid's client build, as in the app
  - `$/app/solid` is the app's UI, all Solid (P8).
    - the pages' shell (`SpellPage`, `SplitPanel`, `AppRoot`)
    - menus, panes, dialogs, and the plumbing
    - `cellsBridge.ts` makes every Solid computation follow spell cells:
      spell Things, `SP.*`, the editor (P11).
      - Each entry imports it before rendering.
      - `tracked()` is a memo over such a read.
- `src/` is the app:
  - `solid/`:  the UI
  - `pages/`:  the pages and the router
  - `ui/`:  `UI`, shared UI types, and Monaco's plumbing
  - `runner/`:  runs compiled spell (below)
  - `spellEditor/`:  `<spell-editor>`'s pane (below)
  - `editor.ts`:  the editor's state and actions, ONE `editor` for the page
  - `index.tsx`:  the entry, drawing the app into `#app-root`
  - `server/`:  its API server ([api.ts](src/server/api.ts), [its entry](src/server/index.ts))
    - It's on `$/server`'s Express-shaped router and web server (it was Express).
      Those are `SRV.Router` and `SRV.WebServer`.
    - `api.test.ts` pins its behaviour over HTTP.
  - The file / project helpers it calls are NOT here.
    They're node-only code in `$/spell/node/...`:
    - `project-utils`
    - `file-utils`
    - `disk-fetch` ...
- `index.html`, `demo/`, `static/` and the `vite*.config.ts` files are here too.
- Scripts run HERE (`cd packages/app`):
  - The editor (vite, port 3000 if free, else any) is the PAGE SERVER's child.
    - [appRoutes.ts](src/server/appRoutes.ts) starts it with `EditorServer`, once the page server listens.
      It stops it with the page server.
      - It's a route module:  see [server's AGENTS.md](../server/AGENTS.md).
    - So `spell dev server` (repo root) runs the API AND the editor.
      - its URL:  in `.spell-server.editor.json`, at the repo root
      - its output:  in `.spell-server.editor.log`
    - `SPELL_NO_EDITOR=1` skips it.
  - `yarn start`:  restarts the page server, then `spell serve --headless`,
    which waits for the editor and prints its URL.
    - `yarn stop` stops vite:  an orphan, or the page server's (then restart the page server).
    - `yarn start:server` / `start:server:prod` still run the API alone,
      on port 3001 ([its entry](src/server/index.ts)).
  - `yarn build`:  the app.
    - `yarn build:runner`:  `dist-runner/`, VS Code's "Run Project" webview
    - `yarn build:element`:  `dist-element/`, the two web components and their pack
      - `<spell-app>` and `<spell-editor>`
      - their pack, `spell.pack.js`
  - ONE Solid per page, across those bundles.
    - `vite.solid.config.ts` builds FIRST, into each folder:
      - `spell-solid.js`:  Solid itself, plus
        - Spell UI's element core (`$/ui/core`) and its root family
        - `@solidjs/h`, which compiled spell draws with
        - icon packs beside it
      - `spell-ui.js`:  `$/ui`, lazy
        - its chunks in `ui/`
        - it also puts `registerPack` on `globalThis.SpellUI`
    - The element / editor / runner builds import them through `sharedSolid()` (`vite.shared.ts`),
      never bundling their own.
    - They take Solid and the core through `spell-solid-shared.js`:
      - the page's own, when it has them (a docs page's `SpellUI.packModules`)
      - else `spell-solid.js`
    - `spell-runtime.js` takes Solid and `h` through it too, since compiled spell draws with Solid.
      It never takes `spell-ui.js`.
    - Pinned by `element.build.test.ts`.
  - `spell dev vscode` is NOT here:  it's the repo root's.
  - `yarn start:lsp` and `yarn scopes` are lsp's:  run them in [its folder](../lsp/).
- [The app's Monaco plumbing](src/ui/monaco/) (no UI).
  - Its language features call the SAME `LSP.SpellLanguageService`, in-process.
    So `$/lsp` stays browser-safe:  [lsp's AGENTS.md](../lsp/AGENTS.md).
  - The editors on it are Solid:  `MonacoEditor`, `FileEditor` ([their folder](src/solid/monaco/)).
    Its barrel re-exports the plumbing.
  - Loaded LAZILY:
    - in the app, through `$/app/solid`'s `LazyMonaco`
    - in `<spell-editor>`, through its `loadMonaco()`
    - NEVER import `$/app/ui/monaco` or `$/app/solid/monaco` statically outside those folders, types aside.
    - Or Monaco (~4.4 MB) lands in the main bundle again.
- Routing (P8):  [the routes](src/pages/routes.tsx), on `@solidjs/router@next` (`createRouter()`, pinned exactly).
  - The router ships its Solid JSX as SOURCE (`.jsx` files, in its dist folder).
    - [`NOT_SOLID_SOURCE`](vite.shared.ts) lets the Solid plugin compile it out of `node_modules`.
    - Another such package goes there too.
  - `explicitLinks`:  it takes only `<a link>` clicks, never a running program's own links.
  - `editor` navigates through `navigate()`, in [navigation.ts](src/pages/navigation.ts) (no Solid in it).
    - The router's root layout hands it its `navigate()`.
    - Route components call `followRoute()`, which hands the URL's params to `editor.selectPath()`.
  - The editor page's shortcuts are ONE `keydown` listener ([editorHotkeys.ts](src/pages/editorHotkeys.ts)).
- `index.html` wraps the app in `<ui-root icons="fomantic">`.
  - So the app's icon names are Fomantic's ([loadUI.ts](src/solid/loadUI.ts)).
  - It still links `semantic.min.css`:  running programs draw with Semantic UI's class words.
- `src/runner/` runs compiled spell:  the pieces every runner shares.
  - the runners:
    - the web app's editor
    - VS Code's "Run Project" webview (`VSCodeRunner`, `yarn build:runner`)
    - the `<spell-app>` web component, in `components/spell-app/`
      - built by `yarn build:element`, into `dist-element/`
      - its demo:  `/demo/spell-app.html`, on the dev server
  - Solid (P7), on `@spell-app/ui`.
    - The runners import the Solid panes' FILES, never the `$/app/solid` barrel (it pulls in the editor).
      - e.g. `$/app/solid/ThingExplorer`, `.../ConsoleLines`, `.../loadUI`
    - `<spell-app>` is a root itself, with Fomantic's icons by default.
    - VS Code's webview HTML wraps its `#runner-root` in `<ui-root icons="fomantic">`.
  - The PROGRAM draws with the page's Solid too:  `App.start()` mounts its own root (`spellCore.mountApp()`).
    - A runner hands it `appRoot`, a `<div>` drawn once and never touched again.
    - Semantic UI's CSS stays wherever programs draw.
    - Each drawn thing has its own error boundary:  a stand-in, a `ui-error`, and the rest keeps drawing.
  - Programs run on `spell-runtime.js`, NEVER the page's own `core`.
    - It's built from [spellRuntime.ts](src/runner/spellRuntime.ts).
    - The app loads it once (`editor.loadRuntime()`), and so does the VS Code runner.
    - Each `<spell-app>` loads its OWN copy (`loadRuntime()`).
      So apps on a page don't share a `spellCore`.
    - No import map:  `runCompiled()` links each program's imports.
    - A recompile of the same program keeps its things, e.g. the game in progress
      (`keepThings`, epic `drawable-thing` P16).
      - Restart starts afresh, on purpose:  each runner's own (`restart()`, `editor.restartApp()`).
      - The program's start is skipped:  its top-level test calls, and starting its app (P17).
      - It starts afresh when the edit changed the file that starts its app, or a thing can't come over
        (`runCompiled()`).
  - So ONLY `spellRuntime.ts` may value-import `$/core`.
    - The program finds its elements through `spellCore.domRoot()`, never `document`.
    - SEE [core's AGENTS.md](../core/AGENTS.md), "Who may value-import it".
    - Mind barrels:  `$/app/runner` holds `runCompiled()`, so a bundle's entry imports its runner's file directly.
  - A drawable thing draws as its own Spell UI element (epic `drawable-thing`):
    [SpellElement.tsx](src/runner/SpellElement.tsx).
    - e.g. `a card is a drawable thing` draws as `<solitaire-card>`.
    - A drawable class names its tag as it's declared:
      `static elementTag = spellCore.defineElement(this, ...)`.
    - core asks `spellCore.elementDefiner` once the class is whole.
      `installSpellElements()` fills that in, per runtime copy.
    - `draw the card` then draws `<solitaire-card>`.
      Its `thing` is the card, which the element draws inside (`drawOwn()`).
    - The example:  `@examples/Drawable Solitaire`, each card its own element, styled by its `<css>`.
    - ONE tag per type per page, shared by every runtime copy (`SPELL_ELEMENTS`, on `globalThis`).
    - Compiled TypeScript writes each type's element class itself, `class CardElement extends SpellElement<Card>`,
      saying only its attributes, methods and sheet, and hands it over:  `spellCore.useElement(Card, CardElement)`.
      - The page builds the tag on it (`defineFor()`), adding what it left out, so both targets draw the same element.
      - It imports `SpellElement` as `@spell/elements` ([spellElements.ts](src/runner/spellElements.ts)):
        the runtime exports it, and `runCompiled()` points that name at the runtime too.
  - Its Type Explorer reads scope packs, `<Project>.scopes.js` (`LSP.ScopePack`):  no parser in the page.
    - `yarn scopes [--compile] <projectId...>` (in `../lsp`) writes them.
    - So does the language server, after each clean compile.
  - Its Thing Explorer reads the runtime copy's `spellCore.things` (`ThingRegistry`).
    - Each `Thing`, and each instance of a `List` sub-class, registers itself as it's made.
    - The program's exports are its top-level things.
    - It labels their properties and actions in spell's words:  `move (a card) to (a pile)`.
      - The words come from the project's words file, `<Project>.en.js`, beside its compiled output.
      - `SP.SpellWords` reads it, in [words.ts](src/runner/words.ts).
      - Each runner loads it beside the scope pack:  `<spell-app>` by URL, VS Code's from the extension's `words`
        message, an editor's in what it pushes.
      - No words file:  each by its name, `move to pile`.
- `components/`:  `<spell-app>` and `<spell-editor>` (epic `spell-element`, P4).
  - They're Spell UI components, written as a component pack's families are ([epics' AGENTS.md](../epics/AGENTS.md)).
  - `components/<tag>/` holds:
    - `<Name>.en.ts`:  the vocabulary
    - `<Name>.tsx`:  two classes
      - the DOM element class, with its script API (`DOMSpellAppElement`)
      - then the component, on `E.UIComponent`.
        `<spell-app>`'s is on `UIRoot`.
    - `index.ts`:  defines the tag;  also the bundle's entry
  - `$/app/components/<tag>` imports one.
  - `<spell-app>` is a ROOT (`SpellApp extends UIRoot`, J37):  a page needs nothing around it.
    - It loads each Spell UI family the runner draws, the first time one appears (in its shadow root too).
    - It never loads all of `$/ui`:  `loadUI.ts` is the editor app's and VS Code's, not its.
    - A spell tag inside it loads from beside its script (`spell-editor` => `spell-editor.js`).
      So a page with only `<spell-app>`s never downloads the editor.
    - It takes a root's attributes, like its timeout, theme and size.
    - By default its icons are Fomantic's, and its `display` is `immediately`.
    - Inside another root (a docs page, the editor demo), it's a nested root.
  - A page loads them either way:
    - by itself:  `<script type="module" src="/element/spell-app.js">` (or `spell-editor.js`)
    - under a `<ui-root>`, once Spell UI is loaded (`spell-ui.js`)
      - `<ui-components source="/element/spell.pack.js">`
      - e.g. the editor demo:  its editors sit beside the apps, outside any `<spell-app>`
  - The pack is NOT `spell dev pack build`'s one classic script.
    - [vite.element.config.ts](vite.element.config.ts) writes it, with `componentPack()`:  a classic `spell.pack.js`.
    - Its `define()` imports the two ES modules beside it.
    - They need lazy chunks (Monaco, the parser), and `spell-runtime.js` per app.
  - On a docs page (with Spell UI of its own), both take Solid and Spell UI's core from the page.
    - That's `SpellUI.packModules`, through `spell-solid-shared.js`.
    - Never a second copy (T3).
  - Leaving the page releases each (`domElement.dispose()`) a microtask later.
    A move in one go keeps it.
- `src/spellEditor/` is `<spell-editor>`'s pane:  the app's Monaco editor, as a web component.
  - `yarn build:element` => `spell-editor.js`
  - its demo:  `/demo/spell-editor.html`
  - It edits a server project, and feeds `<spell-app>`s what it compiles.
    - That's `SPELL_COMPILED_EVENT`, and `SpellCompiled` in [runner.types.ts](src/runner/runner.types.ts).
  - Its OWN build, `vite.editor.config.ts`, so Monaco's CSS stays out of `spell-app.css`.
    - Monaco is a lazy chunk:  the parser compiles, and apps run, before it loads.
    - Pinned by `element.build.test.ts`.
  - Several on a page edit several projects.
    - Each `SpellModels.use()`s its own.
    - Each listens with `SpellMonaco.onEdit()` / `onOpen()`, NOT through the app's editor.
    - NEVER import `UI` or `LazyMonaco` there.
- Styles:  WWOD §18 › "Plain `.css` beside its component" (no Less).
  - app-wide sheets:  `spell.css`, `syntax.css`
- Prod builds keep class names (`output.keepNames`, here):
  SEE [parser's AGENTS.md](../parser/AGENTS.md), `keepNames`.

## Imports

- As WWOD §4, with our own source as `$/app` / `$/app/*`.
  - e.g. `import { UI } from "$/app/ui"`
- Nothing imports THIS package except `cli`.
  And the `<script>` entries in its own pages:  `index.html` and the demos.

## Decorators

As WWOD §12, plus:

- The repo root's `vite.decorators.ts` is used by every vite config here, `vitest.config.ts` included.
  - The server is fine, as `tsx` is esbuild already.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `UI` ~== `$/app/ui`
