# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this folder, `src/app/` of the `spell-app` package (`spell-app/app`),
and in the app's build folder, `app/` at the repo's root.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
- the root's:  the repo's layout
- WWOD:  the house style every package shares
- Only what's local is below.
  A section named like a WWOD rule extends it.

## Overview

- The top of the chain (below `cli`):  the web app and the embeddable web components.
  - Everything else is a package it imports:  spell, lsp, parser, util, Spell UI ...
  - Its server is spaces' (below).
- The app is Solid 2 (READ the root's Solid 2 pointer for Solid work).
  - So is what compiled spell draws, on the page's Spell UI (epic `output-targets` P10-P11):
    `core`'s [drawing.ts](../../../spell-parser/src/core/drawing.ts).
  - No React:  every `.tsx` is Solid.
  - `build.test.ts` pins that no chunk holds React, `spell-runtime.js` included.
  - Two test projects (the root's `vitest.config.ts`):
    - Both read the repo's `tests/app/`, where the tests live at the same paths as the code:
      the test of this folder's `index.tsx` is [solid.test.tsx](../../tests/app/solid.test.tsx).
    - `app:node`, for most tests:  there Solid is its SERVER build
      (`renderToString`;  writes NOT staged, see [solid.test.tsx](../../tests/app/solid.test.tsx))
    - `app:browser` (chromium), for `*.browser.test.ts(x)`:  Solid's client build, as in the app
  - `spell-app/app/solid` is the app's UI, all Solid (P8).
    - the pages' shell (`SpellPage`, `SplitPanel`, `AppRoot`)
    - menus, panes, dialogs, and the plumbing
    - `cellsBridge.ts` makes every Solid computation follow spell cells:
      spell Things, `SP.*`, the editor (P11).
      - Each entry imports it before rendering.
      - `tracked()` is a memo over such a read.
- `src/` is the app:
  - `solid/`:  the UI
  - `pages/`:  the pages and the router
  - `ui/`:  `UI`, shared UI types, Monaco's plumbing,
    and the editor's words, `AppTexts` ([README-app.md](../../README-app.md), "The editor's words")
  - `runner/`:  runs compiled spell (below)
  - `spellEditor/`:  `<spell-editor>`'s pane (below)
  - `editor.ts`:  the editor's state and actions, ONE `editor` for the page
  - `index.tsx`:  the entry, drawing the app into `#app-root`
- Its server is NOT here (epic `people-and-orgs` P14):  it's spaces' ([spaces' AGENTS.md](../spaces/AGENTS.md)).
  - the API, the editor's route module and `ProjectBuild`
  - in spaces' [route modules folder](../spaces/server/node/routes/)
- In its build folder, [app/](../../app/) at the repo's root (Vite's root:  its paths are from there):
  - the page, `index.html`
  - `demo/`, `static/`, `scripts/` (App UI's data and pictures, `stop.mjs`)
  - the vite configs, `vite*.config.ts`;  the tests' are the root's `vitest.config.ts`
  - `docs/`, App UI (below);  the builds, `dist*/`
- Its scripts are the repo root's, the builds `cd app && ...` (epic `repo-split` P11):
  - The editor (vite, port 3000 if free, else any) is the PAGE SERVER's child.
    - Spaces' [appRoutes.ts](../spaces/server/node/routes/appRoutes.ts) starts it (`EditorServer`)
      once the page server listens, and stops it with the page server.
      - It's a route module ([the kit's server AGENTS.md](../../../src/server/AGENTS.md)).
    - So `spell server` (repo root) runs the API AND the editor.
      - its URL:  in `.spell-server.editor.json`, at the checkout's root
      - its output:  in `.spell-server.editor.log`
    - `SPELL_NO_EDITOR=1` skips it.
  - `yarn start`:  restarts the page server, then runs `spell app serve --headless`,
    which waits for the editor and prints its URL.
    - `yarn stop` stops vite:  an orphan, or the page server's (then restart the page server).
    - `yarn start:server` / `start:server:prod` still run the API alone,
      on port 3001 ([its entry](../spaces/server/node/routes/cli.ts), in spaces).
  - `yarn build`:  the app.
    - `yarn build:runner`:  `app/dist-runner/`, VS Code's "Run Project" webview
    - `yarn build:element`:  `app/dist-element/`, the web components and their pack
      - `<spell-app>` and `<spell-editor>`
      - `<spell-code>` and `<spell-markdown>`, and `spell-language.js` (`vite.code.config.ts`, below)
      - their pack, `spell.pack.js`
    - `yarn build:page`:  `app/dist-page/`, the page side of a Python spell app (epic `python-target` P20)
      - `spell-page.js` ([spellPage.ts](runner/spellPage.ts)):  the page's `@spell/core`
        - It exports what `spell-runtime.js` does, `css` included:
          [spellPage.test.ts](../../tests/app/runner/spellPage.test.ts) fails on one it leaves out.
      - It sets the page up itself.
      - spaces' `spell_quart`, Python's web server, serves it ([spaces' AGENTS.md](../spaces/AGENTS.md)).
  - `spell app preview build`:  `app/dist-static/`, the STATIC build, the public preview (epic `debut` P9)
    - the editor in Vite's `static` mode, plus the examples and guides compiled, their lists and indexes as files
      ([PreviewSite.ts](../cli/PreviewSite.ts));  `spell app preview serve` shows it as a host would
    - ONE flag hides what needs a server:  `isStaticBuild` in code, `:root.spell-static` in CSS
      ([static/](static/));  the actions it leaves out are `HIDDEN_IN_STATIC_BUILD` (`Actions.tsx`)
    - Files load through `LoadableFile.fetch`, answered by `StaticFiles`:  the build's copies,
      a visitor's edits kept in their browser's `localStorage`, "Reset Example" forgets them
  - ONE Solid per page, across those bundles.
    - `vite.solid.config.ts` builds FIRST, into each folder:
      - `spell-solid.js`:  Solid itself, plus
        - Spell UI's element core (`spell-ui/core`, which carries `spell/element`) and its root family
        - `@solidjs/h`, which compiled spell draws with
        - icon packs beside it
      - `spell-ui.js`:  the `spell-ui` barrel, lazy
        - its chunks in `ui/`
        - it also puts `registerPack` on `globalThis.SpellUI`
    - The element / editor / runner builds import them through `sharedSolid()` (`vite.shared.ts`),
      never bundling their own.
    - They take Solid and the core through `spell-solid-shared.js`:
      - the page's own, when it has them (a docs page's `SpellUI.packModules`)
      - else `spell-solid.js`
    - `<spell-code>` and `<spell-markdown>` take the Spell UI families they extend through `spell-ui-shared.js`
      (`SHARED_FAMILIES`, `vite.shared.ts`):
      - the page's own, on the same condition:  its `SpellUI.packModules` MUST then name them too
        (`spell-ui/components/ui-code`, `spell-ui/components/ui-markdown`), or the script stops with an error saying so
      - else `spell-ui.js`'s
    - `spell-runtime.js` takes Solid and `h` through it too, since compiled spell draws with Solid.
      It never takes `spell-ui.js`.
    - Pinned by `element.build.test.ts`.
  - `spell app vscode` is NOT here:  it's the repo root's.
  - `yarn lsp:start` and `yarn lsp:scopes` are [lsp](../lsp/)'s.
- [The app's Monaco plumbing](ui/monaco/) (no UI).
  - Its language features call the SAME `LSP.SpellLanguageService`, in-process.
    So `spell-app/lsp` stays browser-safe:  [lsp's AGENTS.md](../lsp/AGENTS.md).
  - The editors on it are Solid:  `MonacoEditor`, `FileEditor` ([their folder](solid/monaco/)).
    Its barrel re-exports the plumbing.
  - Loaded LAZILY:
    - in the app, through `spell-app/app/solid`'s `LazyMonaco`
    - in `<spell-editor>`, through its `loadMonaco()`
    - NEVER import `spell-app/app/ui/monaco` or `spell-app/app/solid/monaco` statically outside those folders, types aside.
    - Or Monaco (~4.4 MB) lands in the main bundle again.
- Routing (P8):  [the routes](pages/routes.tsx), on `@solidjs/router@next` (`createRouter()`, pinned exactly).
  - The router ships its Solid JSX as SOURCE (`.jsx` files, in its dist folder).
    - [`NOT_SOLID_SOURCE`](../../app/vite.shared.ts) lets the Solid plugin compile it out of `node_modules`.
    - Another such package goes there too.
  - `explicitLinks`:  it takes only `<a link>` clicks, never a running program's own links.
  - `editor` navigates through `navigate()`, in [navigation.ts](pages/navigation.ts) (no Solid in it).
    - The router's root layout hands it its `navigate()`.
    - Route components call `followRoute()`, which hands the URL's params to `editor.selectPath()`.
  - The editor page's shortcuts are ONE `keydown` listener ([editorHotkeys.ts](pages/editorHotkeys.ts)).
- `index.html` wraps the app in `<ui-root icons="fomantic">`.
  - So the app's icon names are Fomantic's ([loadUI.ts](solid/loadUI.ts)).
  - It still links `semantic.min.css`:  running programs draw with Semantic UI's class words.
- `runner/` runs compiled spell:  the pieces every runner shares.
  - the runners:
    - the web app's editor
    - VS Code's "Run Project" webview (`VSCodeRunner`, `yarn build:runner`)
      - Its Run Tests runs the project's tests on a runtime copy of their own (`testApp()`),
        as `spell test` does (`core.runTests()`, which both share).
      - How they went shows in Program Output ([testResults.ts](runner/testResults.ts)),
        and goes to the extension, which shows each failed check on its line (lsp's `spell/testDiagnostics`).
    - the `<spell-app>` web component, in `components/spell-app/`
      - built by `yarn build:element`, into `dist-element/`
      - its demo:  `/demo/spell-app.html`, on the dev server
  - Solid (P7), on `spell-ui`.
    - The runners import the Solid panes' FILES, never the `spell-app/app/solid` barrel (it pulls in the editor).
      - e.g. `spell-app/app/solid/ThingExplorer`, `.../ConsoleLines`, `.../loadUI`
    - `<spell-app>` is a root itself, with Fomantic's icons by default.
    - VS Code's webview HTML wraps its `#runner-root` in `<ui-root icons="fomantic">`.
  - The PROGRAM draws with the page's Solid too:  `App.start()` mounts its own root (`core.mountApp()`).
    - A runner hands it `appRoot`, a `<div>` drawn once and never touched again.
    - Semantic UI's CSS stays wherever programs draw.
    - Each drawn thing has its own error boundary:  a stand-in, a `ui-error`, and the rest keeps drawing.
  - Programs run on `spell-runtime.js`, NEVER the page's own `core`.
    - It's built from [spellRuntime.ts](runner/spellRuntime.ts).
    - The app loads it once (`editor.loadRuntime()`), and so does the VS Code runner.
    - Each `<spell-app>` loads its OWN copy (`loadRuntime()`).
      So apps on a page don't share a `core`.
    - No import map:  `runCompiled()` links each program's imports.
    - A recompile of the same program keeps its things, e.g. the game in progress
      (`keepThings`, epic `drawable-thing` P16).
      - Restart starts afresh, on purpose:  each runner's own (`restart()`, `editor.restartApp()`).
      - The program's start is skipped:  its top-level test calls, and starting its app (P17).
      - It starts afresh, all the same, when (`runCompiled()`):
        - the edit changed the file that starts its app
        - or one of its things can't come over
  - So ONLY `spellRuntime.ts` may value-import `spell-parser/core`.
    - The program finds its elements through `core.domRoot()`, never `document`.
    - SEE [core's AGENTS.md](../../../spell-parser/src/core/AGENTS.md), "Who may value-import it".
    - Mind barrels:  `spell-app/app/runner` holds `runCompiled()`, so a bundle's entry imports its runner's file directly.
  - A drawable thing draws as its own Spell UI element (epic `drawable-thing`).
    - e.g. `a card is a drawable thing` draws as `<solitaire-card>`.
    - The element:  [SpellElement.tsx](runner/SpellElement.tsx).
    - A drawable class names its tag as it's declared:
      `static elementTag = core.defineElement(this, ...)`.
      - Core asks `core.elementDefiner` once the class is whole.
      - `installSpellElements()` fills that in, per runtime copy.
    - `draw the card` then draws `<solitaire-card>`.
      Its `thing` is the card, which the element draws inside it (`drawOwn()`).
      - It loads the Spell UI families its drawing uses itself (`loadSpellUIFamilies()`):
        no root sees into its shadow root.  A Spanish program's `<es-texto>` too (epic `spanish` J96).
    - A drawable LIST's element holds its items as its children (`core.drawItems()`), shown through its drawing's slot.
      - Its `to draw it` is the wrapper in its shadow root;  each child is what its `to draw each item` draws,
        by default the item's own element (epic `spanish` P20).
    - The example:  `@spell/examples/Solitaire`, each card its own element, each pile styled by its `<css>`.
    - ONE tag per type per page, shared by every runtime copy (`SPELL_ELEMENTS`, on `globalThis`).
    - Compiled TypeScript writes each type's element class itself (P10):
      - e.g. `class CardElement extends SpellElement<Card>`
      - saying only its attributes, methods and sheet
      - and hands it over:  `core.useElement(Card, CardElement)`
      - The page builds the tag on it (`defineFor()`), adding what it left out:
        so both targets draw the same element.
      - It imports `SpellElement` by the name `@spell/elements` ([spellElements.ts](runner/spellElements.ts)):
        - the runtime exports it
        - `runCompiled()` points that name at the runtime too
  - Its Type Explorer reads scope packs, `<Project>.scopes.js` (`LSP.ScopePack`):  no parser in the page.
    - `yarn lsp:scopes [--compile] <projectId...>` writes them.
    - So does the language server, after each clean compile.
  - Its Thing Explorer reads the runtime copy's `core.things` (`ThingRegistry`).
    - Each `Thing`, and each instance of a `List` sub-class, registers itself as it's made.
    - The program's exports are its top-level things.
    - It labels their properties and actions in spell's words, `move (a card) to (a pile)`.
      - The words come from the project's words file, `<Project>.en.js`, committed beside its source.
      - The code:  `SP.SpellWords`, and the runner's [words.ts](runner/words.ts).
      - Each runner loads the file beside the scope pack:
        - `<spell-app>`, by URL
        - VS Code's, from the extension's `run` message, which brings them
        - an editor's, in what it pushes
      - No words file:  each by its name, `move to pile`.
- `components/`:  `<spell-app>` and `<spell-editor>` (epic `spell-element`, P4);
  `<spell-code>` and `<spell-markdown>` (epic `repo-split` P2).
  - They're Spell UI components, written as a component pack's families are
    ([spell-epic's AGENTS.md](../../../spell-epic/src/AGENTS.md)).
  - `components/<tag>/` holds:
    - `<Name>.en.ts`:  the vocabulary
    - `<Name>.tsx`:  two classes
      - the DOM element class, with its script API (`DOMSpellAppElement`)
      - then the component, on `E.UIComponent` (`import { E } from "spell/element"`).
        `<spell-app>`'s is on `UIRoot`.
    - Held to Spell UI's patterns by the lint guard, as every set's elements are (`spell-ui/*`:
      [ui's AGENTS.md](../../../spell-ui/AGENTS.md), "The lint guard";  since epic `people-and-orgs` P17).
    - `index.ts`:  defines the tag;  also the bundle's entry
  - `spell-app/app/components/<tag>` imports one.
  - `<spell-app>` is a ROOT (`SpellApp extends UIRoot`, J37):  a page needs nothing around it.
    - It loads each Spell UI family the runner draws, the first time one appears (in its shadow root too).
      A drawable thing's element loads its own:  a root never sees into another element's shadow root.
    - It never loads all of `spell-ui`:  `loadUI.ts` is the editor app's and VS Code's, not its.
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
  - The pack is NOT `spell pack build`'s one classic script.
    - [vite.element.config.ts](../../app/vite.element.config.ts) writes it, with `componentPack()`:  a classic `spell.pack.js`.
    - Its `define()` imports each family's ES module beside it, one per folder of `components/`.
      - One that won't load is a warning, and the rest still define:
        `spell-code.js` on a docs page whose Spell UI shares no code family, where `<spell-app>` still runs.
    - They need lazy chunks (Monaco, the parser), and `spell-runtime.js` per app.
  - On a docs page (with Spell UI of its own), both take Solid and Spell UI's core from the page.
    - That's `SpellUI.packModules`, through `spell-solid-shared.js`.
    - Never a second copy (T3).
  - Leaving the page releases each (`domElement.dispose()`) a microtask later.
    A move in one go keeps it.
  - `<spell-code>` and `<spell-markdown>`:  spell's code and markdown, as SUBCLASSES of Spell UI's `<ui-code>` and
    `<ui-markdown>`, which hold nothing of spell (epic `repo-split` P2, Q19 / Q24).
    - `<spell-code>` (`SpellCode extends UICode`):  `language` is `spell` unless it says otherwise.
      - Its family registers `spell` with the page's `UI.code` as it loads ([SpellLanguage](components/spell-code/SpellLanguage.ts)),
        so EVERY `<ui-code language="spell">` on the page is coloured, and every spell block of a markdown.
      - The colours are spell's parser's (`SP.SpellHighlighter`), from source:  a lazy chunk, on first use.
    - `<spell-markdown>` (`SpellMarkdown extends UIMarkdown`):  drawn by spell's engine (`spell-parser/markdown`), plain and
      `editable`, in `ui-*` elements ([MDEngine](components/spell-markdown/MDEngine.ts), a lazy chunk).
      - It overrides `UIMarkdown.loadEngine()`;  its barrel imports the families the engine draws with, and
        `<spell-code>` for its spell blocks.
    - Built by [vite.code.config.ts](../../app/vite.code.config.ts), its own build (`yarn build:element` runs it last):
      - `spell-code.js`, `spell-markdown.js`:  the families' barrels;  the pack imports them too
      - `spell-language.js` ([spellLanguage.ts](spellLanguage.ts)):  ONLY `spell` registered, no element,
        on a page with Spell UI of its own
        - what the page server adds to the docs pages it serves (its `"pageScripts"`:
          [the kit's server AGENTS.md](../../../src/server/AGENTS.md)), so epic pages and guides colour spell (Q23)
        - it needs only the page's core, so any docs bundle will do
    - Compiled spell's `<markdown>` blocks stay `<ui-markdown>` (marked):
      they're plain text in a drawing (`LayoutSpell.ts`, `MarkdownBlock`).
- `app/docs/` is App UI (epic `epic-workflow` P11):  the docs pages of the app's components, a COMPONENT SET.
  - Served at `/components/app/`.
  - Laid out as every set is since P18 of `people-and-orgs` (the root's `AGENTS.md`).
  - ONE flat folder:
    - a page per documented component, `<Name>.html` (the web components' `spell-app.html` ...)
    - its home, `index.html`
    - `__parts/` (the layout and footer, every page's frame) and `__data/`
    - `_images/` (the pictures) and `_examples/` (snippets a page shows):
      they aren't frame or data, so they keep one `_`
  - Spell UI's page shape, on Spell UI's site bundle:  the page server lays its `_assets/` over the folder.
    - the page server's `componentSets` setting, in the root [package.json](../../package.json)
  - Links are written as from the page's SERVED address (`/components/app/x.html`):
    - `../../` is the checkout's root
    - `../../spell-ui/ui-button.html` is a Spell UI page
    - the layout and footer, in `__parts/`, are one level deeper
  - What it documents, and in which group:  [the hand-kept facts](../../app/docs/__data/pages.json5).
  - Each page's props, attributes and "Used in" tables come from the code:  `yarn site:data`.
    - [The data builder](tools/AppUIDataBuilder.ts) reads, for each listed file:
      - its exported components with a banner (`### `<Name>``)
      - their props types ([ComponentSource](tools/ComponentSource.ts))
      - and every JSX use in the app
    - The web components and the drawable thing's element:  their vocabularies, by Spell UI's own builder.
    - It writes the set's data, COMMITTED:  `components.json5` and `search.json5`, in `__data/`.
    - [Its test](../../tests/app/tools/AppUIDataBuilder.test.ts) fails while:
      - they're stale
      - a listed page is missing, or unlinked from the home
      - its component's banner doesn't point at it
    - So rerun it after changing a documented component's banner, props or uses.
  - Pictures, for what needs the whole editor around it:  `yarn site:pictures [name...]`.
    - headless screenshots of this checkout's running editor, into `app/docs/_images/` ([its script](../../app/scripts/site-pictures.ts))
    - Opening the editor compiles its project, which may rewrite its declarations and words files:
      check `git status` after.
      - `*.declarations.json5` / `*.en.js`
      - its `*.spell.js` goes in `build/`, never committed
  - Live examples (the web components, the runner's pieces) need `yarn build:element`:
    the layout loads `/element/spell.pack.js`.
  - A new page:
    1. its entry in `pages.json5`, then `yarn site:data`
    2. a copy of a page like it:  `Notice.html` for a picture, `spell-app.html` for a live one
    3. linked from `index.html`
- `spellEditor/` is `<spell-editor>`'s pane:  the app's Monaco editor, as a web component.
  - `yarn build:element` => `spell-editor.js`
  - its demo:  `/demo/spell-editor.html`
  - It edits a server project, and feeds `<spell-app>`s what it compiles.
    - That's `SPELL_COMPILED_EVENT`, and `SpellCompiled` in [runner.types.ts](runner/runner.types.ts).
  - Its OWN build, `vite.editor.config.ts`, so Monaco's CSS stays out of `spell-app.css`.
    - Monaco is a lazy chunk:  the parser compiles, and apps run, before it loads.
    - Pinned by `element.build.test.ts`.
  - Several on a page edit several projects.
    - Each `SpellModels.use()`s its own.
    - Each listens with `SpellMonaco.onEdit()` / `onOpen()`, NOT through the app's editor.
    - NEVER import `UI` or `LazyMonaco` there.
- Styles:  WWOD §18 › "Plain `.css` beside its component" (no Less).
  - app-wide sheets:  `spell.css`, `syntax.css`
  - The top bar's SPACING is one rule, in `solid/chrome.css` (Owen, 2026-10-24):
    groups 60px apart (`--spell-bar-group-gap`), icons in a group 12px apart (`--spell-bar-icon-gap`).
    A new item takes its place in a group;  never a margin of its own.
- Prod builds keep class names (`output.keepNames`, here):
  SEE [parser's AGENTS.md](../../../spell-parser/src/parser/AGENTS.md), `keepNames`.

## Imports

- As WWOD §4, with our own source as `spell-app/app` / `spell-app/app/*`:  a file's path under the repo's `src/`.
  - e.g. `import { UI } from "spell-app/app/ui"`, `import "spell-app/app/components/spell-code"`
  - Vite's own entries and `index.html`'s script are paths from `app/`, Vite's root:  `../src/app/index.tsx`.
    - The dev server asks for that one as `/src/app/index.tsx`, as a URL can't go above its root:
      `repoSourceInDev()`, in [vite.config.ts](../../app/vite.config.ts), finds it in the repo's `src/`.
- Nothing imports THIS folder except `cli`.
  And the `<script>` entries in its own pages:  `index.html` and the demos.
- It may import spaces' models, `spell-app/spaces` (the same repo, spell-app);
  NEVER `spell-app/spaces/server/node/...`, which is node only.
  - Another repo's packages by npm name (`spell-parser/spell`, `spell-ui/core` ...):
    the root's [AGENTS.md](../../AGENTS.md), "Import names and global types".
  - The editor ([editor.ts](editor.ts)) does:
    - a group's projects are `SPACES.SpellProjectRoot`
    - a project's file create, copy, rename and delete are `SPACES.ProjectFiles` (never `SpellProject`'s)
  - The "You" panel ([YouPanel.tsx](solid/modals/YouPanel.tsx), epic `people-and-orgs` P9)
    talks to spaces' people routes in plain JSON:  it never loads the people library.
    - the route:  `/api/people/me`
    - typed by `SPACES.MeAnswer`
  - `<spell-app>` loads only the light files, without the parser:
    - `spell-app/spaces/models/projectGroups`, which registers spell's project groups
    - `spell-parser/spell/SpellSetup`
    - `spell-parser/spell/SpellUrls`
  - Every project file's URL comes from `SP.SpellUrls`:  `/spaces/<project>/<file>`, compiled files too.

## Decorators

As WWOD §12, plus:

- The toolchain's decorator pre-pass, `spell/toolchain/decorators`, is used by every vite config here,
  `vitest.config.ts` included.
  - The server is fine, as `tsx` is esbuild already.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `UI` ~== `spell-app/app/ui`
