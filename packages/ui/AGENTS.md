# AGENTS.md

This file guides AI coding agents (Claude Code, Codex, and others)
working with code in this package, `@spell-app/ui`.

**READ [the repo root's AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
- Only what's local is below.
- A section named like a WWOD rule extends it.

**New to how a `<ui-*>` element works:
READ [the custom elements guide](../../guides/custom-elements/custom-elements.html),** with live elements to click.
- It covers the platform, the DOM element / component pair, the decorators, every hook.
- The rules below are its short form.

## Overview

- `@spell-app/ui` is Fomantic UI reborn as `ui-*` custom elements, on a modern CSS foundation:
  - Fomantic's vocabulary (`ui small primary basic icon button`)
  - shadow DOM, `@layer`s, OKLCH tokens
  - accessibility built in
  - usable from any framework or plain HTML
- Built on **Solid 2**:  `solid-js` / `@solidjs/web` `2.0.0-rc.13`, pinned exactly.
- The custom-element layer is `ui`'s own code, in [the element core](src/elements/):
  - `DOMElement`, `UIComponent`, `ShadowEvents`, `HotDefinitions`
  - It's `@solidjs/element` and `component-register`, folded in and fixed (epic `spell-element`, 2026-10-09).
  - Each such file carries their MIT notice.
- The approved design:  [the plan](docs/plan.md).
  - Read its "Decisions" and "Architecture" BEFORE adding a component or runtime service.
  - [The report](docs/report.md) is the generated status report:  bundle, perf, hosts, HMR, fallbacks.
- [The status checklist](docs/status.md):  per component, its status, tests, size, keyboard, docs page, deferred items.
  - MUST be updated in the same change that builds, finishes or defers anything in it.

### The component and the DOM element

Two words for the two objects behind every tag (epic `wwod-spell-ui`, P15):
- the COMPONENT:  the class behind a tag, `UIButton`, one instance per element.
  - It holds the state, `render()`s the shadow DOM and handles the events.
  - Its base is `UIComponent`.
- the DOM ELEMENT:  the tag in the page, the `<ui-button>` itself, with its attributes, properties and events.
  - An instance of `DOMElement` (or a subclass), as the platform's `<a>` is an `HTMLAnchorElement`.
- They point at each other:  `component.domElement`, `domElement.component`.
- "Host" is only the platform's word now (`:host`, `ShadowRoot.host`).
  "Controller" is retired.

### Layout

- [`../util/`](../util/):  `@spell-app/util` (`$/util`), shared with `spell`.
  - Its generic helpers:
    - the decorators `@proto` / `@protoMerged` / `@lazy` / `@once` / `@resets` (`decorators.ts`);
      component files say `@E.lazy`, `@E.once`, `@E.resets`, `E.forget()`
    - `class.ts`, `string.ts` (case, `numberToWord`, `suggest`), `dom.ts` (`closestAcrossShadow` ...), `util.types.ts`
  - [`$/ui/util`](src/util/index.ts) re-exports it, so source keeps saying `from "$/ui/util"`.
    Its declarations ship in `dist/_util/`.
  - That file imports util's GENERIC files one by one (`$/util/class` ...), never the `$/util` barrel:
    - the barrel also holds spell's utilities (lodash, `chalk` ...)
    - so spell's utilities never reach `ui`'s bundles
    - one of the deep-import exceptions (WWOD §4 › "Package aliases, never `../`")
  - Where a helper goes:  SEE:  WWOD §8 › "Promotion path".
  - Everything in `$/ui/util` lands in the `core` bundle (`core.ts` re-exports it), so keep it small.
- [`src/vocabulary/`](src/vocabulary/) (`V`, through the `api` entry):  the naming layer.
  - the vocabulary schema, value sets
  - `Vocabulary`:  the registry, translated names, `replace()` for hot reload
  - `Converters`
  - `SharedVocabulary`:  the attributes and states every component takes (`disabled`, `loading`, `visible`, `animation`)
  - `SkeletonText` (skeleton text <=> `SkeletonSpec`) too, but reached by path, NOT through the barrel.
    - Why:  `core` re-exports the barrel, and no page parses skeleton text.
    - Node tools do:  [the root catalog](tools/RootCatalog.ts).
- [`src/runtime/`](src/runtime/) (`UI`):  the shared `UI` runtime, ONE instance per page.
  - Made by `globalThis.UI ??= new UIRuntime()`.
  - Components call `UI.load()` on connect, which dynamic-imports this chunk once.
  - Services are classes:
    - `Browser`:  sniffing, and the `UI.browser.supports` flags
    - `Keyboard`, `Overlays`, `Focus`, `Styles`, `Vocabulary`, `I18n`, `Transitions`, `Ids`, `Toasts`, `Modals`, `Api`
    - `IconPacks` (`UI.icons`), `Sources` (`UI.sources`), `Themes` (`UI.themes`)
- [`src/icons/`](src/icons/):  the icon PACK format, and the built-in packs.
  - the format:  `IconPackIndex`, `IconName`, `BuiltInPacks`
  - the packs:  `icon-packs/<id>/`, SVG files and a `pack.js`
  - Loading and caching are the runtime's (`UI.icons`).
  - Packs are built by [the icon pack builder](tools/IconPackBuilder.ts), `yarn icons:pack`.
  - More:  [the icons doc](docs/icons.md).
- [`src/elements/`](src/elements/) (`E`):  the element core.
  - library-neutral:  `ClassBuilder`, `Validator`, `MenuOptions`, `OwnerContext`, `Shorthand`, `NativeFallback`
  - the Solid layer:
    - `UIComponent`, the COMPONENT base:  one instance per element, its `render()` returns JSX
    - `DOMElement`, the DOM element base
    - `ElementDefinition`:  vocabulary => the DOM element's attributes
    - `Reactive`:  the reactive members' decorators, `@state`, `@controlled`, `@derived`, `@cssState`, `@onChange`
    - `FormComponent` + `DOMFormControl` (form controls), `Cell`, `SlotContent`
    - `PartContext` + `PartComponent`:  the generic content parts, styled by their owner
    - `IconGlyph`
    - `LoadableComponent` + `DOMLoadableElement`:  the base of the elements that show a text file
      (`source`, inline text, loading / error look, `save()`)
    - `LoadableBody` + `DOMLoadableBodyElement`:  a section's body, loaded from `source` the first time it opens
    - the dev-only `HotDefinitions`, NOT in the barrel
  - The DOM element bases keep their own files (`DOMElement.ts`, `DOMFormControl.ts` ...).
    - Many families and the static render import them.
    - A DOM element knows its component only by type:  the component imports it, never the other way round.
- [The components folder](src/components/), `ui-<name>/`:  one folder per component FAMILY, named after its main tag (`ui-button/`).
  - Every FILE in it is named for its COMPONENT, as any class file is named for its class (`UIButton.css`).
  - Its files are listed below ("A family's files").
- [The `ui-components` family](src/components/ui-components/):  the component packs a `<ui-root>` loads,
  through `<ui-components source>` ("Component packs", below).
- [The docs components folder](src/docs-components/), `ui-docs-<name>/`:
  DOC-ONLY element families, the widgets the docs site is built from (`<ui-docs-example>`, `<ui-docs-api>` ...).
  - Laid out and written EXACTLY like a component family:  same files, same rules.
  - But NOT components:
    - no lib entry
    - not in `ComponentDefinitions.all`, nor the component list (`ComponentDefinitions.docs`)
    - every tag filed under the `documentation` topic
  - `<ui-root>` knows them (`yarn gen:root` scans this folder too),
    but loads them only where the page's bundle called `DocsFamilies.add()`.
    - The site's bundle does;  the library's own `RootLoader` never does (epic `wwod-spell-ui`, I12).
  - A family that renders other widgets in its shadow root imports their families in its barrel,
    and adds their tags to `DocsJSXTags`.
  - They read the site's data through `SiteData` ([the components data](site/_data/components.json)), NEVER the vocabularies.
  - The barrel's header says how to add one.
- [`src/static/`](src/static/) (`$/ui/static`, `SSR`):  the STATIC server render, for SEO.
  - `StaticRender.page()` / `fragment()` turn `ui-*` markup into plain light-DOM HTML in node:
    no shadow DOM, no JS.
  - How:
    - stand-in DOM elements are linkedom elements (`ServerDOMElement`)
    - components render with `renderToString`
    - `StaticFlattener` swaps each DOM element for its root
    - `StaticInteractions` wires what works without JS
  - Node only:  NEVER imported by a component or `$/ui`.
  - Plan:  [the seo plan doc](../../epics/seo/seo.plan.html).
  - Server code, so every file is `<Name>.ssr.ts`, `.server.ts`'s short form
    (WWOD §10 › "Server code stays out of the browser bundle").
    - `static.types.ssr.ts`;  tests are `<Name>.ssr.test.ts`, in the `ssr` project.
    - Except the barrel, `index.ts`.
  - Its files import each other through `SSR` (`import { SSR } from "$/ui/static"`),
    and the element core through `$/ui/core`.
    - A mark a static initializer reads comes from `./static.types.ssr` directly
      (WWOD §4 › "Circular imports";  `barrel.ssr.test.ts`).
- [`core`](src/core.ts) and [`forms`](src/forms.ts):  the two SHARED lib entries (`@spell-app/ui/core`, `@spell-app/ui/forms`).
  - `core`:  the element core, and the foundation JS every family needs.
  - `forms`:  what only form controls with a VALUE need (`FormComponent`, `DOMFormControl`, `Validator`, `MenuOptions`).
  - Component files import shared code ONLY through these (see "Solid authoring").
- [`src/styles/`](src/styles/):  its own lib entry, `@spell-app/ui/styles`.
  - `layers.css`, tokens, colours, sizes, reset, typography, animations, utilities, `native.css`, `themes/`
- [The package's entry](src/index.ts):  `@spell-app/ui`.
  - Registers every family (side effect) and re-exports them,
    plus `UIT`, the runtime, styles and icons.
  - The namespaces `E` / `F` / `V` come from `core` / `forms` / the `api` entry.
- [`test/`](test/):  shared test utils, and cross-family tests.
  - `Fixture.render(html)` (`Fixture.ts`);  `A11y.check(el)` / `expectAccessible(el)` (`A11y.ts`)
  - `ElementFixture`:  render, wait for `ready`, `flush()`;  `breakRender()`
  - `StubOwner`:  stand-in owners (card, feed ...)
  - `PerfRun` (the dropdown benchmark), `fallback.cases.ts`, `dictionary.es.ts`
  - `VisualOpen` + `test.types.ts`:  the visual tests' hooks
  - `visual/baselines/`:  the screenshots (`yarn test:visual`)
  - the `fallback` / `isolation` / `translate` / SSR / DSD tests
  - Every test runs in a REAL browser (Vitest browser mode + Playwright, chromium by default),
    except `*.ssr.test.tsx` (node).
- [`tools/`](tools/):  package tooling, node scripts run by `tsx` (see [the tools README](tools/README.md)).
  - bundle measurement, peer vendoring, import-map smoke pages (framework hosts), LOC, report tables
  - the HMR end-to-end test
  - `tools/demo/`:  the `yarn dev` site;  `tools/visual/`:  the visual tests
  - Results go to `tools/results/` (git-ignored).
  - Environment variables (ours are `SPELL_UI_*`, WWOD §11) are read ONLY in
    [`environment`](tools/environment.ts):  by `tools/`, `scripts/` and the configs alike.
- The docs site, modelled on Fomantic's docs:  "The docs site", below.
- [`docs/`](docs/):  design docs, and the generated `report.md`.
  - `plan.md`, `grammar.md`, `theming.md`, `translation.md`, `icons.md`, `fallback.md`, `runtime.md`
- [`scripts/`](scripts/):  one file per yarn script, named for it (WWOD §8 › "File naming").
  - `<group>:<verb>` runs `<group>-<verb>.ts` here:  `site:data` -> `site-data.ts`, `gen:root` -> `gen-root.ts`.
  - generators:  `gen-*.ts`
  - the site's writers:  `site-data.ts`, `site-index.ts`, `site-kitchen.ts`, `site-sections.ts`, `site-new.ts`
  - the site bundle's build, `site-bundle.ts`, watched by `site-dev.ts`
  - `site-check.ts`, `tokens-alias.ts`, `design-build.ts`
  - What several scripts share:  camelCase helper files, run by none.
    - `browserBundles.ts`:  `gen:spell` / `gen:markdown`
    - `generatedFiles.ts`:  write-or-`--check`, `vp fmt`, markup escaping
    - data:  `iconExtras.ts`
  - A class other code uses lives in `tools/` (PascalCase), and its script here is a few lines:
    `site-check.ts` -> [`SiteCheck`](tools/SiteCheck.ts).
  - A folder of `tools/` with its own flags has a `cli.ts` instead
    ([the tools' cli](tools/cli.ts), [the visual tests' cli](tools/visual/cli.ts):  WWOD §8's `page/cli.ts`).
- [`src/languages/`](src/languages/):  GENERATED, committed.
  - `spell.<lang>.js`:  spell's pre-compiled highlighter, for `<ui-code language="spell">`.
  - Built by `yarn gen:spell`:  the root `AGENTS.md`'s one `ui` -> spell exception.
  - NEVER edit;  lint and format skip it.
- [The markdown bundle](src/components/ui-markdown/md.bundle.js) (`md.bundle.js`, + `.d.ts`, `MDBundle.ts`):
  GENERATED, committed the same way.
  - The pre-compiled markdown engine (`@spell-app/markdown`), built by `yarn gen:markdown`.
  - NEVER edit;  lint and format skip it.
- `reference/Fomantic-UI/`:  a READ-ONLY, git-ignored clone of Fomantic, for porting.
  NEVER edit or import it.

### A family's files

In a family's folder, `ui-<name>/`, every file is named for its component:
- `UI<Name>.tsx` (or `.ts` without JSX):  one component per file.
  - `UIButton.tsx`, `UIButtons.tsx`, `UIOr.tsx`;  family helpers beside them (`SlottedItems.ts`).
  - A family's own DOM element class lives in its component's file, ABOVE the component.
    - `DOMNagElement`, `DOMCheckElement`:  a few members of script API.
    - Above, because its `elementSetup` reads it while the class is defined.
    - Named `DOM<Name>Element`, as the platform's `HTMLAnchorElement`.
    - NO one-liner files (Owen:  "try to avoid one-liner files, e.g. BrandColorHost").
    - A big one (dozens of members) may keep its own file, `DOM<Name>Element.ts`;  none does today.
  - It names its component class, `class DOMNagElement extends E.DOMElement<UINag>`:
    - so `this.component` is a `UINag | undefined`
    - and its script API forwards with no cast:  `close() { return this.component?.close() ?? false }`
    - A type only:  `elementSetup.DOMElement` is what pairs them at run time.
  - The other way round:  a component whose code reads its DOM element's own members says so
    with a `declare readonly domElement: DOM<Name>Element`, not a cast (`FormComponent`, `UIBrandColor`).
    - Except where the same class reads it in a field initializer:
      TypeScript calls that "used before its initialization" (TS2729).
    - So `LoadableComponent` keeps its `as DOMLoadableElement` casts.
- `index.ts`:  the family barrel.
  - Calls `define()` for every tag (SIDE EFFECT), and re-exports the classes.
  - Also the family's lib entry (`@spell-app/ui/ui-button`), and its hot-reload boundary.
- `UI<Name>.css`:  the port of Fomantic's `.less` + `.variables`.
  - A second sheet keeps its suffix (`UIDimmer.page.css`), or names its own tag's component (`UIBrandCheck.css`).
- `UI<Name>.en.ts`:  the tag's VOCABULARY, named for its language.
  - ONE per tag, named for THAT tag's component:
    `UIButton.en.ts`, `UIButtons.en.ts`, `UIOr.en.ts`;  `UIFeedEvent.en.ts` for `<ui-event>`.
  - It holds EVERY name the tag uses:
    tag, attributes (kind + allowed values), values, events, slots, parts, states, text strings.
  - Translations become `UI<Name>.<lang>.ts` (`UIButton.es.ts`).
    - A two-letter code before `.ts` means a vocabulary:
      the tools find them by it (`VocabularyFiles.languageOf()`), so no other family file is named so.
  - It also holds `topics` and `aka`:
    - `topics`:  2+ ids from `ValueSets.topics`;
      how a newcomer looks for it, AND how widget libraries file it
    - `aka`:  other libraries' and everyday names (`ui-modal`:  `dialog`, `lightbox`)
    - A NEW TAG MUST fill both.
      - [The component definitions](src/components/ComponentDefinitions.ts) roll them up, for the docs' component browser.
      - [Its test](src/components/ComponentDefinitions.test.ts) fails on a tag without them.
    - A new or moved tag also needs these two, and their tests fail while they're stale:
      - `yarn gen:root`:  `<ui-root>`'s catalog of tag => family ([its test](src/components/ui-root/UIRoot.catalog.test.ts))
      - `yarn site:data`:  the docs site's data ([its test](tools/SiteDataBuilder.test.ts))
    - Live:  `UIButton.describe()`.
  - And `skeleton`:  what `<ui-root display="skeleton">` draws for the tag.
    - Written as SKELETON TEXT (`SkeletonText`, its grammar in its header):
      `"inline 6 x 2.5"`, `"2 tall"`, `"18 wide: square image, header, 3 line paragraph"`.
    - LEFT OUT for none, never `"none"`, `null` or `false`:
      an optional property left out (epic `wwod-spell-ui` J26).
    - A component pack's vocabularies write it the same way.
    - [The root catalog](tools/RootCatalog.ts) parses it into the catalog:
      `yarn gen:root`, or `spell dev pack build` for a pack.
    - [The vocabularies test](test/vocabularies.test.ts) parses every one, and fails on a typo or a stale catalog.
- `UI<Name>.types.ts`:  the folder's loose constants, types and shared vocabulary pieces,
  when SEVERAL of its files use them.
  - A constant only one class uses is a module `const` below that class ("Classes").
  - A types file left with one constant is folded away:  no one-liner files.
  - A helper function becomes a private static on the one class that uses it,
    else a static on a small class here.
  - Constants used by SEVERAL folders live in [the shared types](src/components/components.types.ts),
    used as `UIT.<NAME>` from `$/ui/core`.
  - NOTE:  a types file imports its vocabularies with `import type` only.
    - Vocabularies import values from it, so a value import is a cycle.
    - `UIParts.types.ts` is the exception.
- Vocabularies and types files are PURE DATA:
  - `$/ui/core` for types only
  - shared constants by value come straight from `components.types`
    (`import * as UIT from "$/ui/components/components.types"`)
  - Why:  core loads the element layer, which node can't,
    and `yarn site:data` / `yarn gen:root` import every vocabulary in node (tsx).
  - [The vocabularies test](test/vocabularies.test.ts) enforces it.
- `UI<Name>.fallback.ts`:  the native fallback (plain DOM, no Solid), shown when the element's render throws.
  - FORM CONTROLS ONLY ("Native fallback", below).
- Tests:
  - `UI<Name>.test.tsx`:  the component
  - `UI<Name>.css.test.ts`:  the sheet, on class-grammar markup
  - `UI<Name>.fallback.test.ts`, `UI<Name>.ssr.test.tsx`, `UI<Name>.a11y.test.ts`, `UI<Name>.perf.test.tsx`
- `examples/`, its `*.html`:  Fomantic's examples in CLASS GRAMMAR:  static markup, for the CSS tests and the site.
- `examples/elements/`, its `*.html`:  the same examples as `ui-*` ELEMENT markup.
  - Used by axe in `UI<Name>.test.tsx`, `yarn dev` and `yarn test:visual`.
- `examples/elements/`, its `<example>.visual.ts`:  optional OPEN states for the visual tests
  ([the visual testing doc](docs/visual-testing.md)).
- Tools that look a family file up by name go through [the family files](tools/FamilyFiles.ts).
  The rest match suffixes (`*.en.ts`), whatever the file's name.

### The docs site

- Modelled on Fomantic's docs, served at `/ui/` by the page server
  (static, live-reloading;  `packages/server`'s `UI_SITE`).
  - Plain `.html` pages on `<ui-*>` widgets:  no build step to view one.
  - From epic `spell-ui-pages`, which replaced the old Astro site.
- In TWO halves since 2026-10-05 (claude-design P6), one constant each in [the tools' types](tools/tools.types.ts).
- `SITE_PAGES`, the HAND-WRITTEN half:  `ui/` at the checkout's root, SHARED content.
  - A link into `../spell-app-dev/ui/` (the root `AGENTS.md`, "Shared content").
  - Edited from any checkout, never committed here.
  - What's in it:
    - the pages:  `*.html`, and `ui-<name>.html` in `components/`
    - `_parts/`:  the layout and footer every page shares
    - `examples/`:  files the examples load
    - `images/`:  Fomantic's docs images
    - `_data/`, its `search.json`:  built from these pages by `yarn site:data`
    - `README.md`:  how pages are made
  - The `site:*` scripts that WRITE pages (`site:new`, `site:index`, `site:kitchen`, `site:sections`)
    write the shared `ui/` from THIS branch's data and template.
    - So a page using an element only this branch has shows it undefined in other checkouts,
      until the branch merges.
- `SITE_BUILD`, the BUILT half:  `site/`, tracked per branch ([the site README](site/README.md):  its files).
  - The page server lays its `_assets/` and `_data/` over the pages at `/ui/`,
    so every page's relative `_assets/...` / `_data/...` links resolve unchanged.
  - `site/_assets/`:  GENERATED, NOT committed.
    - Git-ignored since 2026-10-07:  its hashed chunk names churned every diff and merge.
    - The site bundle (`yarn site:bundle`):  `site.js` + `site.css`, which every page loads.
      Each family is a lazy chunk;  `icon-packs` is a symlink to [the built-in packs](src/icons/icon-packs/).

      ```html
      <link rel="stylesheet" href="_assets/site.css">
      <script type="module" src="_assets/site.js">
      <!-- from components/:  ../_assets/ -->
      ```

    - The page server builds it when it starts, if stale, and a page waits for that.
      - `spell dev bundles build --stale`;  `$/assembler`'s `Bundle`
      - `.bundle.json` records the sources' hash
    - NEVER edit.
  - `site/_src/`:  the bundle's entry (`site.ts`:  what's in it and why), and the site's layout-glue CSS (`site.css`).
    - Its config:  `vite.site.config.ts`.
  - `site/_data/`:  `components.json` and `icons.json` (the icon browser's search terms), GENERATED, committed.
    - Written by `yarn site:data`.
    - Their shapes, `SiteDataFile` / `SiteIconsFile`:  [the docs components' types](src/docs-components/docs-components.types.ts).
    - And `pages.json`, hand-kept per-family facts it reads:
      title, summary, status, token-table overrides, `pages` (the sub-tags with a page of their own).
    - The search file (`SiteSearchFile`) is the shared one, [`search.json`](../../ui/_data/search.json):
      rerun `yarn site:data` after renaming or moving a section.

### Commands

- `yarn review`:  the finishing pass.  MUST pass before you hand work back.
  - tsc (root, node configs), oxlint `--fix`, oxfmt, every test (`ssr`, `browser`)
- `yarn build`:  tsc, then the vite library build into `dist/`.
  - entries:  `core`, `forms`, one per family, `styles`, `index`;  and `dist/icon-packs/`
  - `.d.ts` files beside the `exports` paths, from `declarations()` in `vite.config.ts`
- `yarn test`:  the `ssr` project, then `browser`.
  - `ssr` first:  it writes `ssr-button.html` in `.cache/`, which [the DSD test](test/dsd.test.ts) reads.
- `yarn test:all`:  chromium + firefox + webkit (`yarn test:browsers` once first).
- `yarn test:visual`:  screenshot tests of every element example, light + dark,
  against [the baselines](test/visual/baselines/) (Playwright's `toHaveScreenshot`).
  - Its flags:

    ```sh
    yarn test:visual [--os local|linux|both] [--browsers all|chrome|webkit|firefox] [--update] [--grep <family>] [--parity]
    ```

  - `linux`, the default, renders in Playwright's Docker image.
  - `yarn test:visual:update` ~== `--update`.  More:  [the visual testing doc](docs/visual-testing.md).
  - NOT part of `yarn review` (slow, needs Docker),
    but MUST run before a change that alters rendering is handed back:  CSS, markup, tokens, an example.
  - A change that alters rendering MUST update its baselines in the SAME change (`--update`),
    after reviewing every diff in the HTML report.
    NEVER update to silence a diff you haven't looked at.
  - `--static`:  compares the STATIC server render (`$/ui/static`) with the elements instead.
    - The families:  [the static families](tools/visual/StaticFamilies.ts).
    - Report only:  `static-parity.md`, in the visual tests' results.
    - `--os local` by default.
- `yarn dev`:  `tools/demo/`, every example as class grammar beside elements.  Edits hot-reload.
- `yarn icons:pack`:  verifies a folder of SVGs, and writes its `pack.js` (keeping hand edits).

  ```sh
  yarn icons:pack <folder> --id <id> [--sanitize] [--skip-unsafe | --allow-unsafe]
  ```

  - `--sanitize` strips unsafe attributes first.
  - Files that still fail refuse the pack, unless skipped or allowed.
- `yarn vendor`, `yarn measure`, `yarn smoke`, `yarn report`, `yarn test:hmr`:  see [the tools README](tools/README.md).
  - `yarn report` rewrites the tables of [the report](docs/report.md).  Run it twice:  no diff.
- `yarn site:build` ~== these four, in turn:
  - `yarn site:data`:  `components.json` and `icons.json` in `site/_data/`;  the shared `search.json`
  - `yarn site:index`:  the cards of [the component index](../../ui/components/index.html) (`--check`)
  - `yarn site:kitchen`:  the examples of [the kitchen sink](../../ui/kitchen-sink.html) (`--check`),
    from every family's `types.html` in `examples/elements/`
  - `yarn site:bundle`:  `site/_assets/`, sizes printed
  - Rerun it after changing a vocabulary, a family sheet, an example, or any source the site shows.
  - Then commit `site/_data/`:  `ui/` commits itself, and `site/_assets/` is git-ignored.
    - `spell dev bundles build ui-site` records its sources' hash, so the page server doesn't build it again.
- `yarn site:dev` ([its script](scripts/site-dev.ts)):  `yarn site:bundle`, then live editing.
  - The page server (started if needed) serves `/ui/`,
    while a Vite WATCH build rebuilds `site/_assets/` on every `src/` / `site/_src/` edit,
    and live reload reloads the open pages.
  - Not watched:  `site:data` / `site:index` / `site:kitchen`.
  - A watch rebuild leaves stale hashed chunks:  harmless, they're not committed.
    The page server's next start rebuilds the bundle clean.
- `yarn site:new`:  a site page, from [the template](../../templates/spell-ui-docs.html) ([its script](scripts/site-new.ts)).

  ```sh
  yarn site:new <tag|page> [--title ...] [--summary ...] [--force]
  ```

  - For a tag:  `ui/components/<main tag>.html`.
    A sub-tag its family's `pages` lists gets `<tag>.html` (`ui-radio`).
  - Else `<page>.html`, in `ui/`.
  - Title, summary and status come from [the pages data](site/_data/pages.json).
  - How to write one:  [the pages guide](../../epics/spell-ui-pages/PAGES.md).
- `yarn site:sections [--check] [page...]` ([its script](scripts/site-sections.ts)):
  nests every page's flat level 2 / 3 headers and headed examples into `<ui-section>`s.
  - It writes (or fixes) their ids, `<tab>-<section>-<example>`;  idempotent.
  - `site:index`, `site:kitchen` and `site:new` run it on what they write.
- `yarn design:build [--out <dir>]` (`spell dev design build`):  the claude.ai design system's files (epic `claude-design`).
  - [Its script](scripts/design-build.ts), on [the design export](tools/DesignExport.ts).
  - Written to `<dir>/project/`;  by default `build/design-system/` (git-ignored).
  - Made from the site's components data, the element examples and the Spell theme.
  - Run `yarn site:data` first, after a vocabulary change.
    - It also writes `custom-elements.json` and `html-custom-data.json`, in `site/_data/`:
      VS Code's autocomplete for `<ui-*>` ([the element manifests](tools/ElementManifests.ts)).
    - [The design export's test](tools/DesignExport.test.ts) fails while they're stale.
- `yarn site:check <page...> | --all` ([its script](scripts/site-check.ts), on [the site check](tools/SiteCheck.ts)):
  loads the `ui/` pages from the page server (Playwright).
  - It fails on:
    - console errors, 404s
    - an undefined or unrendered `ui-*`
    - missing tabs, an empty toc
    - phone-width overflow
    - a nav flyout that won't open
  - Screenshots go in `tools/results/`, its `site-check/`.  LOOK at them.
- Generators, each writing COMMITTED files (never edit their output):
  - `yarn gen:styles`:  the token sheets in `src/styles/`
  - `gen:icons`:  the built-in icon packs.  Downloads Font Awesome, needs `reference/Fomantic-UI/`.
  - `gen:emoji`:  `ui-emoji/data/`.  Needs `reference/Fomantic-UI/`.
  - `gen:root`:  `<ui-root>`'s catalog
  - `gen:spell` / `gen:markdown`:  the pre-compiled bundles
- `yarn tokens:alias <family> [--write]`:  the codemod of [the theming doc](docs/theming.md).
  It only prints, without `--write`.
- `yarn tsc`, not `npx tsc`, and no hard-coded `node_modules` paths:
  SEE:  the root `AGENTS.md`, "Toolchain:  Vite+".
  - Here, node code finds a dependency through [`NodePackage`](tools/NodePackage.ts).

## UI rules

- Shadow DOM EVERYWHERE, with SEMANTIC shadow markup:  `<button>`, `<dialog>`, `<input>`, `<nav>`, `<table>` ...
  - NEVER a `<div>` where an element exists.
- Inside shadow roots, keep Fomantic's class grammar on those elements:  `<button class="ui small primary button">`.
  - Why:  it's a mechanical port of the `.less`,
    and the app stylesheet / `::part` override language is the known vocabulary.
  - Translated names never touch CSS.
- Booleans:
  - true:  presence, `""`, `"true"`, `"yes"`
  - false:  `"false"`, `"no"`
- Widths:  the attribute is `width`, NEVER `wide`.
  - It takes columns (`4` of 16), fractions (`1/4`), percentages (`25%`).
  - Exception:  `<ui-sidebar>` and `<ui-flyout>` also take Fomantic's width words
    (`very thin`, `thin`, `wide`, `very wide`).
    The element adds them before the noun:  `ui left thin sidebar`.
- Numeric fields are RIGHT-aligned (`text-align: end`, `tabular-nums`):  Owen's standing rule (2026-10-04).
  - The number is set against its trailing unit:  `250°`, `55%`, `16px`.
  - Text fields (a hex, a name) stay start-aligned.
- Chosen state:  `selected` is canonical (checkbox, radio, toggle, items, tabs, options).
  - `checked` is accepted as an alias, on checkbox / radio only.
- Generic content parts style themselves by OWNER CONTEXT:  `:state(in-card)`, via `PartComponent`.
  - The parts:  `<ui-content>`, `<ui-header>`, `<ui-meta>`, `<ui-description>`, `<ui-extra>`, `<ui-actions>` ...
  - NEVER `ui-card-header`.
  - And no `:host-context` (WWOD §18 › "Reach into `ui-*` elements through `::part()` and tokens").
- Events are `CustomEvent`s:
  - `bubbles: true, composed: true`
  - lowercase kebab `ui-*` names (`ui-change`, `ui-open`)
  - `detail` carries computed state (`{ value }`, `{ open }` ...), plus `originalEvent`
- Rich data (`options`, `rows`) as JS PROPERTIES:
  real accessors on the class, so frameworks find them with `key in el`.
  - Primitives as REFLECTED attributes.
  - First paint MUST NOT need a rich property:  SSR drops them.
- Vocabulary files own every name.
  - NEVER a string literal for one of OUR attribute / event / slot / part names, in a template or `ClassBuilder`:
    read it through the component's vocabulary.
  - A PLATFORM name is written inline ("Functions & types"):  `aria-label`, `click`, `slot`, `role="list"`.
- Class defaults:  as WWOD §12 › "`@proto static` defaults", plus:
  - vocabulary, default settings and part names are `@proto static` (from `$/ui/util`),
    so instances carry no per-instance copies
- Libraries:  `lodash-es` only (it tree-shakes).
  - Any other runtime dependency:  WWOD §2 › "Ask before adding a dependency".
- Platform:  WWOD §18 › "Modern CSS" says what's assumed, and what's flagged.
  - assumed:  anchor positioning, no JS fallback ...
  - flagged through `UI.browser.supports`:  Safari's gaps

## CSS

As WWOD §18, plus:

- Units:  sizes derive from the px-valued `--ui-font-size` (default `16px`), and `em` inside components.
  - No `rem` (WWOD §18 › "No `rem`").
- Sizes are ratios of 16.
  - `medium` is a real size meaning "default":  a no-op that emits no class.
- Layers, in order:

  ```css
  @layer ui.reset, ui.tokens, ui.base, ui.components, ui.utilities, ui.theme, ui.app;
  ```

  - Inside `ui.components`, each component declares the sublayers `types, content, variations, states`,
    so states beat variations without `!important`.
- Global sheets:  [`src/styles/`](src/styles/), one file per axis (tokens, colours, sizes, typography, utilities).
  - In `@layer` order, `layers.css` FIRST (its header says so).
- ONE generic rule set for every hue and size, switched by token remap, not per-hue rules.
  - `--ui-color`, `--ui-scale`;  WWOD §18 › "Keep CSS DRY"
- NEVER declare a public component token (`--ui-<tag>-*`) in a component sheet.
  - Declare its private alias instead, and read the alias:
    `--_ui-button-radius: var(--ui-button-radius, var(--ui-radius))`.
  - So values set on the page, an ancestor, the element or `::part()` reach the box.
  - Owner switches are private (`--_ui-card-layout`).
  - See [the theming doc](docs/theming.md), "Component tokens".
    [The component tokens test](test/componentTokens.test.ts) enforces it.
  - Two private shapes, on purpose:
    - `--_ui-<tag>-*`:  a public token's ALIAS
    - `--_<tag>-*` (`--_button-*`):  variation plumbing no page sets
    - NEVER rename one into the other (epic `wwod-spell-ui`, Q13).
- WWOD §18 › "Naming" (PascalCase root classes, nested parts) is for app sheets.
  - Shadow sheets keep Fomantic's class grammar (`.ui.small.button`):  "UI rules" above.
- Breakpoints:  `@custom-media` only ([the media sheet](src/styles/media.css)), never a bare px media query
  (WWOD §18 › "Check at phone width").
- Utilities ([the utilities sheet](src/styles/utilities.css);  [the theming doc](docs/theming.md), "Utilities"):
  - named in the grammar `ui-<property>-<modifier>`:  `ui-text-truncate`, `ui-gap-m`
  - `:` for variants:  `ui-split:column`
  - `-ish` suffix ~== "looks like X but isn't one":  `ui-button-ish`, `ui-link-ish`

## Solid authoring

- Solid's own rules (no writes in an owned scope, staged writes, two-function effects, eager memos):
  SEE:  [the Solid 2 rules](../../guides/solid/solid-2.md).
  - Below:  only what's `ui`'s own.
- A tag's COMPONENT is a class `UI<Name> extends UIComponent<typeof nameVocabulary>`
  (or `FormComponent`, `PartComponent`).  It has:
  - `@proto static vocabulary`
  - `@protoMerged static elementSetup`:  what differs from its base.
    E.g. `styleSheets: { nag: nagCSS }`, `DOMElement: DOMNagElement`, `delegatesFocus: false`, a form control's `Fallback` ...
  - reactive members (below)
  - `render()`, returning JSX
  - The DOM element creates one on its first connect, and keeps it (`keepAlive`) until `domElement.dispose()`.
  - `UI<Name>.define()` in the family's `index.ts` registers it.
- A FORM CONTROL (`F.FormComponent`) inherits what every control needs:
  - `isDisabled`:  `disabled`, or a disabled fieldset, with its class
    - `elementSetup.disabled` is `"its own"`:  each control disables its native control.
  - `isReadOnly`:  `readonly`, `:state(readonly)`
    - Every form vocabulary declares `readonly`;  each control refuses changes its own way.
  - `labels` (`ControlLabels`, refreshed on connect)
  - `isTouched`:  set by `invalid`, cleared by a reset
  - `formName` (`name`), the `required` rule
  - a click on the DOM element itself calling `activateControl()`
  - NEVER copy one of them into a control.  Instead:
    - override a hook (`activateControl()`, `validationRules`)
    - or set `@E.proto static invalidShows = "once touched"` (`FormComponent`'s header)

### Shared states

SHARED STATES:  states every element takes, though its vocabulary never names them.
- Ours:  `disabled`, `loading`, `visible` and `animation`.
- The platform's:  `hidden` and `inert`.
  - `hidden` is just `visible` turned round.
- Documented on `UIComponent`, "Shared states" and "Shown or hidden" (epic `spell-element` P8, P12).
- `SharedVocabulary` adds them to its `ElementDefinition`, its docs data and its manifests.
- NEVER declare them in a vocabulary just to get them.
  - A vocabulary that declares one keeps its own spec and meaning.
  - NONE may declare its own `visible` or `animation`:  shown and hidden would split into two facts.
- `disabled`:  `:state(disabled)` always (`isMarkedDisabled`:  the attribute, or a disabled fieldset).
  The rest is `elementSetup.disabled`:
  - `"unusable"`, the default:  `isDisabled`, so:
    - clicks are swallowed, `aria-disabled`
    - everything inside is inert and dimmed
    - focus inside moves on (`UI.focus.moveOutOf()`)
  - or `"its own"`:  the family's code says what it means.
    - For where it means more than a look, or where inert would hide text (P11, T9).
    - A form control, `<ui-button>`, `<ui-step>`:  disable their own control, and override `isDisabled`.
    - `<ui-icon>`, `<ui-text>`:  only dim, so their text stays findable.
    - `<ui-transition>`:  pauses.
  - A family that is only a Fomantic look stays unusable, the default.
    - E.g. `<ui-segment>`, `<ui-label>`, `<ui-section>` ...
- `loading`:  `:state(loading)` always (`isMarkedLoading`, `true` only).
  The rest is `elementSetup.loading`:
  - `"loader"`, the default:  `aria-busy`, everything inside inert and dimmed, a spinner over it, `:state(busy)`
  - or `"its own"`:  `<ui-button>`'s spinner, `<ui-segment>`'s veil, `<ui-root>`'s message
- ONE shared inert covers `disabled` and `loading` at once (`hasInertContent`).
  - It clears only the boxes IT made inert:  a family's own (`<ui-form loading>`'s veil) stays (I10).
- `visible` and `hidden`:  ONE fact, two names.
  - Documented on `DOMElement`, "Shown or hidden".
  - `el.visible === !el.hidden`.
    Writing either one, as an attribute or a property, sets it.
  - The `hidden` attribute holds it.
    `visible` is written back only where the page wrote one.
  - Neither written:  `elementSetup.visible` says.
    It's shown by default;  `"hidden"` hides it on the first connect.
  - Both written in markup, and they disagree:  `hidden` wins.
    After that, the latest write wins.
  - The component's `isVisible` follows it (controlled, `visible`).
  - Each change runs the hook `onVisibleChange(visible, animation)`:
    - by default, the animation, on the shadow root's top-level boxes
      (a box the family hides itself is left alone)
    - a family overrides it to show and hide its own way
  - While a hide runs, `:state(hiding)` keeps it on screen (`reset.css`).
  - Once the hide is done:  `:state(hidden)`.
  - At once, before it first draws.
  - `hidden="until-found"` stays the browser's.
  - Renamed, since their old meaning clashed:  `<ui-divider spacer>`, `<ui-reveal unclipped>`.
- `animation`:  Fomantic's names, or `none`.
  - `animationToRun` is the first that applies:
    - motion off:  its own `none`, `--ui-motion: none` from around it, or reduced motion
    - its own value
    - `elementSetup.animation`, by default `"fade"`
  - `none` turns motion off for it and everything inside it.
    - It sets `--ui-motion: none`, and `:state(still)`.
    - That also stills the families' CSS motion (a style query).
- `inert`:  the platform's, left UNSTYLED.
  - Families set it on boxes with a look of their own (`<ui-form loading>`'s veil),
    and overlays on what they cover (`<ui-pushable>` on its pusher).
  - So a generic dim would double up.
- The base class's look is in `reset.css`, which every shadow root adopts:
  - the dim keys on `:state(dimmed)`:  `disabled` or `loading` the base class's way, on the shadow root's top-level boxes
  - the spinner on `:state(busy)`
  - the hiding on `[hidden]`:  unlayered, so it beats a family's own display rule
    - No family sheet writes its own `:host([hidden])`.
  - The static render maps them through `data-state` and ARIA (`StaticStylesheet`'s unlayered `HIDDEN`).

### Reactive members

**Reactive members** ([`Reactive`](src/elements/Reactive.ts);  WWOD §12 › "Reactive members"):
decorators over ONE record per instance.
- So `this.x` reads fresh right after `this.x = v` (no flush), and Solid follows the reads in JSX and effects.
- The decorator says how the member works.

#### `@E.state`, `@E.controlled`, attributes

- `@E.state accessor isOpen = false`:  the element's own state.
  - `{ equals }`, `{ ownedWrite }` when needed.
  - Replaces a `Cell` field and its `.get()` / `.set()`.
  - A value that CHANGES after it's made is `@E.state`, even where nothing reactive reads it yet.
    The decorator says the intent (`ThemePreference`'s in-memory look, `RootSettings.generation`).
  - A value made once and kept:  `@E.lazy get x()`, or `@E.once` on a method (a loader's promise).
  - Handles to things the class started (a timer, an observer, an abort controller) stay plain fields:
    nobody should watch them (`UIDocsToc.queuedUpdate`, `ControlLabels.labelObserver`).
- `@E.controlled("open") accessor isOpen = false`:  the DOM element's property when set, else the starting value.
  - A write goes to the DOM element's property.
  - A user change:  `this.requestChange("isOpen", next, () => this.send(...))`.
    And `isControlledByPage("isOpen")`.
- Attributes:  a getter per vocabulary attribute, `this.size` (converted, fresh), made by `register()`.
  - The class declares them for TypeScript, below the class:
    `export interface UIButton extends E.AttributeValues<typeof buttonVocabulary> {}`.
  - A write (`this.indeterminate = false`) sets the DOM ELEMENT's property,
    under the tag's own name for it (a translated tag's too), so it reflects.
  - A member with an attribute's name wins over its getter (and TypeScript flags a type clash).
    - So name members for what they are:  `isOpen`, not `open`.
    - A BASE class never takes a name any vocabulary uses
      (`elementDefinition`, `validationRules`:  `UIComponent`'s doc, "Base classes").
  - Attributes outside the vocabulary, or a vocabulary attribute's raw text:
    `this.attributes["aria-label"]`, `this.attributes.value`.
    - The DOM string or `null`, by CANONICAL name (a translated tag reads its own).
  - Replaces `this.attrs.x` and `HostAttribute`.

#### Derived values

- `get x()`:  a derived value, as a plain getter, fresh by construction.
- `@E.derived get x()` only for real work:  loops, parsing, class strings, new DOM.
  - A self-tracking cache, NOT a Solid memo:
    a memo hears of a change through a staged signal, so it reads stale right after a write.
  - It records the version of every record member it reads, and recomputes on read when one moved.
  - It MUST read only record members:  `@state`, `@controlled`, attributes, other `@derived`.
    - A `Cell`, a memo, `UI.browser` or a module global can't be seen changing outside Solid.
    - Move it into the record, or keep a plain getter.
  - `@E.derived({ equals: E.isSameList })` keeps the old value while an equal one is computed
    (a filtered list keeps its identity).

#### CSS states and ARIA

- `@E.cssState("open")` on a getter or accessor:  `:state(open)` follows it.
  - `cssStates()` only for a computed set.
  - Replaces the old `hostStates()`.
  - A state that only mirrors its attribute, under the same name:
    its name in `elementSetup.cssStates` (`cssStates: ["active", "fluid"]`), no getter.
    - A subclass that adds states spreads its base's list:
      `cssStates: [...TextControl.prototype.elementSetup.cssStates, "inline"]`.
    - `define()` throws on a name the tag has no attribute or member for (a typo).
    - Not the `cssStates()` hook, despite the name:  the hook works out a set in code.
  - Keep a getter (with `@E.cssState`) when something else reads it.
    - `isDisabled`, a base class's hook (`CheckControl.isIndeterminate`), an effect
  - For a state two classes of the chain name, the subclass's member wins.
    For one that a member and `elementSetup.cssStates` both name, the member wins.
- `@E.aria("busy")` on a getter or accessor:  the DOM element's `internals.ariaBusy` follows it.
  - `true` => `"true"`;  `false` / `undefined` => removed;  text as is.
  - `@E.aria("role")`, `@E.aria("label")` ...
  - Short names, one spelling wherever ARIA is written.
    - `E.AriaNames` lists the ones in use (`busy: "ariaBusy"`, for `aria-busy`).
    - A name not there fails TypeScript, so add it there (one line).
  - It stacks with `@E.cssState`, a decorator a line:

    ```ts
    @E.cssState("loading")
    @E.aria("busy")
    get isLoading() { ... }
    ```

  - One effect per element writes them all;  a server render applies it once.
  - The subclass's member wins here too.
  - ARIA that never changes:  `elementSetup.aria`, set once as the component is built, no effect.
    - `{ role: "listitem" }`, `{ role: "status", live: "polite" }`:  the same short names
    - An `@E.aria` member for the same property wins, once it runs.

#### Effects:  `@E.onChange`, `@E.whileConnected`, `@E.watches`

- `@E.onChange("a", "b") onXChanged(a, b)`:  an effect reading the members, calling the method with their values.
  - A function it returns is the cleanup.
  - `{ writesDOMElement: true }` applies once on a server:
    for a method that writes the DOM element beyond ARIA (`:state()`, `tabindex`).
  - Created in `onMount()`, after every field exists.
  - The method runs untracked:  only the members it names re-run it,
    so its other reads need no `untrack()`.
    - To re-run on another member, name it:  there is no tracked mode.
  - Runs only when a member's VALUE changed (`===`, member by member).
    - Why:  a getter member tracks the sources under it,
      and Solid 2 applies an effect on every re-run of its compute.
    - So `startEffects()` puts a memo with `equals` in between.
  - An effect that used to live in `render()` names `isReady` too, and returns early until it's true,
    keeping that timing (`UIShape`, `UISidebar`, `UISection`).
  - `{ defer: true }`:  the method isn't called at the start, only on a change.
    - E.g. `<ui-progress>`'s `ui-change`.
  - A page-wide value, or one an attribute alias holds:  a getter member over it, named in the list.
    - E.g. `UIEmoji.rootSettingsGeneration`, `CheckControl.checkedAttribute`.
    - `protected`, as `@E.on` methods are.
  - A method may read the members itself, instead of taking their values (`UIMarkdown.onMarkdownChanged()`).
  - Conditional, per-item or object-building effects stay explicit `createEffect`s in `onMount()`.
    - Each with its disable comment ("The lint guard", below).
- `@E.whileConnected watchX()`:  runs each time the element connects.
  - A function it returns is the cleanup, run when it disconnects.
  - Sugar over `@E.onChange("isConnected")`, for a listener or observer
    on `window`, the document or the light DOM that must stop while the element is out of the page.
  - Never on a server.
- `@E.watches({ childList: true, subtree: true }) get slotted()`:
  a member read from the DOM element's light DOM, recomputed when what the options name changes.
  - The options:  `MutationObserver`'s `childList`, `subtree`, `characterData`, `attributes`, `attributeFilter`;
    and `equals`, as `@E.derived`'s.
  - Readers hear of it only when the VALUE moved, so a reader writing the light DOM can't loop.
  - Watching starts on its first read in a browser.  On a server it's computed once.
  - On a METHOD:  the method is called with the mutations on each change (not at the start), from `onMount()` on.
    - For a change that writes other members (`UIAccordion`'s panels).
  - ONE `MutationObserver` per instance, stopped when the DOM element is released (NOT on disconnect).
  - Replaces an `onSettled()` + `MutationObserver` + `this.x = this.scan()` block.
  - Its options are read while the class is defined:  a module constant they name goes ABOVE the class.
  - These stay hand-written:
    - a watch on another element (a parent, a changing table)
    - one only while connected (`UIForm`), or only while a setting holds (`UIVisibility`'s images)
    - helper classes with their own element (`SlotContent`, `SlottedItems`)

#### Accessors, listeners, untracked actions

- `this.$.isOpen`:  an `Accessor` of any member, for Solid APIs that take one.
  Everyday code reads `this.isOpen`.
- `@E.on("command") protected onCommand(event)`:  a listener on the DOM element, for the element's whole life.
  - `UIComponent`'s constructor adds each through `this.on()` (browser only).
  - It's removed when the DOM element is released.
  - The method runs untracked.
  - `@E.on("slotchange", { target: "renderRoot" })` listens on the shadow root.
    The other options are `addEventListener()`'s.
  - A plain method, not an arrow-function field;  and `protected`, since TypeScript calls a `private` one unused.
  - Replaces a constructor calling `this.on(type, this.handler)`.
  - `this.on(type, listener, { target })` itself, for a listener added later or under a condition.
    - So no vocabulary may name an attribute `on`.
      Fomantic's `on` setting is `<ui-form validate-on>`, `<ui-dimmer show-on>`, `<ui-popup open-on>`.
    - One stopped by an effect keeps its own `AbortController`, aborted in the cleanup.
- `@E.untracked select(option)`:  an action or handler whose body runs inside `untrack()`.
  - It reads `this.x` plainly, where it used to read `untrack(() => this.x)`.
  - Also on an arrow-function field handed to JSX:
    `@E.untracked private readonly onKeyDown = (event: KeyboardEvent) => { ... }`.
  - Also on a getter read to act on, never to follow:  `@E.untracked private get cssDuration()`.
  - And on a DOM element's script API over its component:
    `@E.untracked get errors() { return this.component?.errors ?? [] }`.
  - NEVER on a method a computation calls to follow its reads:  a getter's helper, JSX, an effect's first function.
    E.g. `UIMenu.itemContext()` stays half-tracked on purpose.
  - `@E.on` and `@E.onChange` methods need none.
  - Nor do the constructor, field initializers and `render()`'s body:
    - every component is BUILT inside `untrack()` (`UIComponent.mount()`, the static render)
    - and `render()` runs once, untracked (`UIComponent.onMount()`)

#### And

- A `disabled` that is only a LOOK:  the default, `"unusable"`.
  - Unless inert would hide text a reader needs:
    then `elementSetup.disabled = "its own"`, and the sheet dims it.
    - E.g. `<ui-icon>`, `<ui-text>`, `<epic-note>` ...
  - `:state(disabled)` comes from `UIComponent` ("Shared states" above), so no `"disabled"` in `elementSetup.cssStates`.
  - ARIA of its own, if any, on a getter:  `@E.aria("disabled") get looksDisabled()`.
  - Never an `isDisabled` override:  the DOM element swallows clicks while `isDisabled`.
- Element-core files import the decorators directly (`import { state } from "./Reactive"`):
  their class definitions read them.
  - Component files use `@E.state` (and `@E.proto`).
- Measured (P14 step 1):
  - 1,000 `<ui-divider>`s build in 33 ms (32 before)
  - 1,000 `<ui-button>`s in 100 ms (130 before)

### Imports in component files

Components, DOM element classes AND `UI<Name>.fallback.ts` import:
- shared code ONLY from `$/ui/core`, and `$/ui/forms` for form controls
  - never `$/ui/util`, `$/ui/vocabulary`, `$/ui/elements` ... directly
- the family's own vocabulary, fallback, helpers and sheet as peers:  `./UIButton.en`, `./UIButton.css?inline`
- Why:  the lib build puts everything `$/ui/core` re-exports into `core.js` in `dist/`.
  A leaf imported by a family AND by `core` splits into a hashed third chunk.
  - For the same reason, `core.ts` / `forms.ts` re-export `$/ui/elements` LEAVES,
    and every `forms` file imports the core through `$/ui/core`.
  - `yarn measure`'s checks catch a violation.
- Through namespaces (WWOD §4 › "ONE namespace per sub-system"):

  ```ts
  import { E, UI, UIT } from "$/ui/core"
  import { F } from "$/ui/forms"
  ```

  - Then `E.UIComponent`, `@E.proto`, `UI.browser`, `UIT.FLUID`, `F.FormComponent` ("Types / Exports").
  - NEVER a bare shared name.
  - Measured (epic `wwod-spell-ui`, Q4):
    - family chunks come out byte-for-byte the same:  Rolldown turns `E.Cell` back into a plain import
    - `core` pays ~0.8 kB gzipped for the `E` object
- The element core (`src/elements/`) too, though `core.ts` / `forms.ts` re-export its own files.
  - The same two imports;  the `forms` files also `import { F } from "$/ui/forms"`.
  - Then `E.Cell`, `E.Warnings`, `E.flatParentFor()`.
  - Never named imports from `./elements.types`, `./Cell`, `$/ui/util`, `$/ui/runtime` ...
  - EXCEPT what a module reads while it EVALUATES:  a direct import from its file,
    under `// Import directly to avoid circular import` (WWOD §4 › "Circular imports").
    - the base class in `extends`
    - a decorator (`@proto`)
    - a static initializer (`static readonly generation = new Cell(0)`)
  - Instance fields, method bodies and types go through `E`.
  - `elements.types.ts` stays `import type` only (`import type { E }`).
  - The `forms` files are the exception's exception:  `extends E.UIComponent` / `@E.proto` are fine there.
    - Why:  the core never imports `forms`, and has always finished loading first.
    - A `forms` peer a class definition reads is still direct:  `FormComponent`'s `DOMFormControl`, `Validator`.
  - [The barrel test](src/elements/barrel.test.ts) checks every export of both entries is live.
  - NEVER import an element-core leaf by path (`$/ui/elements/UIComponent`):  entering the cycle there breaks it.

### Writing reactive code

- **Eager memos and overridables:**  a memo that calls overridable members takes `{ lazy: true }` (or is a getter).
  - Effects that read them are created in `onMount()` (or are `@onChange`), after every subclass field exists.
- **Field order:**  class fields (`accessor`s too) initialize in declaration order, before the subclass constructor body.
  - Declare state ABOVE what reads it in an initializer.
  - Compute a starting value into the initializer:  `@E.state accessor isDirty = this.wasEdited !== undefined`.
- **Where writes go:**  `render()` is an owned scope:  no writes there.
  - Write from event handlers, `onSettled`, promise callbacks, `@onChange` methods (an effect's APPLY),
    or the lifecycle methods.
  - Those that can run inside a Solid render (`onConnect`, the `onFormDisabled` replay)
    defer with `E.afterSolidUpdate()`.
  - Element PROPERTY writes are always legal.
  - A reactive member's write never throws:  inside an owned scope, its notification waits a microtask.
  - A reactive member reads fresh right after a write.
    A `Cell` still reads the OLD value until the flush:  keep the new value in a local.
  - Tests `await ElementFixture.settle()` / `tick()` (which `flush()`) before checking the DOM.  Never sleep.
- **Running something later:**  through `$/ui/util`'s timing helpers ([`timing`](src/util/timing.ts)),
  never the platform's calls, so the code says WHEN:
  - `E.afterSolidUpdate(fn)`:  as soon as the current code finishes (a microtask:  `queueMicrotask()`)
  - `E.beforeNextPaint(fn)`:  just before the next paint (`requestAnimationFrame()`)
  - `E.soon(fn)`:  the next task (`setTimeout(fn, 0)`)
  - `E.after(seconds, fn)`:  once, in SECONDS (`setTimeout()`).
    A promise of `fn`'s result, with `cancel()`.
  - `E.every(seconds, fn)`:  until stopped (`setInterval()`)
  - Each but `afterSolidUpdate()` can be canceled:
    keep what it returns in a field, to cancel a pending one (`this.copiedTimer?.cancel()`).
  - Raw calls stay only in the helpers themselves, and in tests.
- **Events:**  dispatch through `this.send("ui-change", detail)`:  vocabulary-checked, localized on translated tags.
  - Listen on the DOM element (or its shadow root) with `@E.on("command") protected onCommand(event)`:
    for the element's whole life, untracked ("Reactive members").
    `this.on()` for one added later, or under a condition.
  - Inside a component, `onClick={...}` for native events.
    - No `on:` namespace.
    - Rich data as `prop:options` ([the Solid 2 rules](../../guides/solid/solid-2.md), "DOM and `@spell-app/ui` elements").
  - A THIRD-PARTY Solid app listening for `ui-*` events uses a `ref` callback + `addEventListener`
    ([the Solid host app](tools/frameworks/solid/app.tsx)).
    Our app:  WWOD §17 › "Events:  `onClick`, or `on()` for `ui-*`".
  - Listeners OUTSIDE a component see `event.target === domElement` (`composedPath()[0]` is the inner element),
    and an app's delegated `onClick` on a `ui-*` tag runs once.
    - `ShadowEvents` guarantees it, by undoing what Solid's shadow-root delegation leaves on the event:
      `target`, `currentTarget`, its handled marker.
    - NEVER work around a wrong `target` in a component:  fix it there.
- **`keepAlive`:**  a removed element keeps its reactive root, until `dispose()` or garbage collection.
  - So anything page-wide (overlay entries, document listeners) follows `isConnected`, never disposal.
- **Slots carry no Solid context:**  an element's root is owned by whoever CREATED it,
  never by the `<slot>` it's assigned to (epic `spell-element`, Q8).
  - So a `<slot>` may live in any `<Show>` / `<Dynamic>` branch.
  - But context provided around it never reaches slotted elements:  owner data goes through `PartContext` / `OwnerContext`.
- **Native fallback:**  when a render throws, the element:
  - logs once, dispatches a cancelable `ui-error`
  - gets `:state(errored)`, and shows its fallback
  - Its siblings keep working ([the fallback doc](docs/fallback.md)).
  - Only FORM CONTROLS have a fallback of their own, so a broken control still submits its value, validates and resets.
    - `Fallback: <Name>Fallback` in `elementSetup`:  plain DOM on `NativeFallback`, same class grammar, no Solid.
    - Which:  button, input / textarea, checkbox / radio, dropdown, select, search, calendar, slider, rating;
      brand's colour picker and composer.
    - The list and why are in [the fallback doc](docs/fallback.md).
    - Owen, epic `wwod-spell-ui` P15:  "ditch the fallback stuff unless it's necessary for e.g. form functionality".
  - Every other family has none:  a broken element shows a bare `<slot>`, so its children still show.
- **Hot reload** (`yarn dev`):  edits to a family's components, vocabulary, fallback or sheet update live instances in place.
  - Internal state (a query, an open menu) resets.
  - These reload the page:
    - changes the platform reads once:  observed attributes, `formAssociated`, the DOM element's class, shadow options
    - edits to shared code:  `core`, `forms`, `src/elements/`, the runtime
  - `yarn test:hmr` MUST pass after touching `HotDefinitions`, `UIComponent.define()`
    or [the Vite plugin](tools/HotElements.ts).
- **One Solid per page:**  every Vite config dedupes `solid-js` / `@solidjs/web` (`SOLID_DEDUPE`).
  - NEVER `import * as` a Solid package in shipped code:  it pins every export into bundles and vendored copies.
- SSR:  anything that reads the DOM in a constructor needs an `isServer` guard ([the SSR test](test/ssr.ssr.test.tsx)).
  - Static render (`$/ui/static`):  as WWOD §12 › "Brand checks only where `instanceof` can't work", plus:
    - DOM elements are linkedom elements, and node has no such globals.
    - So NEVER `instanceof Element` / `Node` / `ShadowRoot` / `HTMLSlotElement` in shared code:  use `nodeType`, `localName`.
  - An effect whose APPLY writes the DOM element is one of:
    - an `@E.aria` member (`internals.role`, ARIA)
    - `@E.onChange(..., { writesDOMElement: true })` (states, `tabindex` ...)
    - Why:  the server build never runs an apply, so a plain `createEffect` leaves the static output without it.
  - Constant ARIA:  `elementSetup.aria`.

### The lint guard

THE LINT GUARD (epic `spell-element` P10):  `yarn lint` holds component files to the rules above.
- Its rules are named `spell-ui/*`.
- Where:  the component folders, as `PATTERN_FOLDERS` in [the root lint settings](../../vite.lint.ts) lists them.
  - `ui`:  `src/components/`, `src/docs-components/`
  - `epics`:  `components/`
  - `brand`:  `components/`
  - NOT `app` (WWOD §17's function components), NOT the element core (`src/elements/`), NOT tests.
- What it flags ([the rules](../../vite.lint.patterns.ts)).
  Each message names the decorator or helper to use instead.
  - `no-solid-effect`:  `createEffect`, `createRenderEffect`, `onSettled`, `onMount` imported from `solid-js`
  - `no-mutation-observer`:  `new MutationObserver(...)`
  - `no-dom-element-listener`:  `addEventListener` on `this.domElement`, or on a `domElement` local
  - `no-untrack`:  `untrack(...)`
  - `no-raw-timer`:  `setTimeout`, `setInterval`, `queueMicrotask`, `requestAnimationFrame`
  - `no-function-component`:  an exported PascalCase function drawing JSX
- A use that has to stay says why, on the line above.
  The same rule for every package:

  ```ts
  // oxlint-disable-next-line spell-ui/no-mutation-observer -- watches its PARENT, another element
  ```

  - It also goes on the allow-list in [the lint patterns test](tools/LintPatterns.test.ts), with the same reason.
  - The test fails on a disable comment the list doesn't name, so every exception is seen in review.

## Component packs

- A COMPONENT PACK is another package's custom elements, with any tag prefix (`epic-`, `x-` ...),
  loaded on demand by `<ui-root>` like Spell UI's own:

  ```html
  <ui-root><ui-components source="epics.pack.js"></ui-components><epic-page>...</epic-page></ui-root>
  ```

  - From epic `epic-components` P1.
  - Restated in `wwod-spell-ui`'s names when `main` merged in (2026-10-08),
    in place of `wwod-spell-ui` P12's JSON packs.
- The pack is ONE classic script, so it works from `file://`.
  - Built by `spell dev pack build` ([the pack build](../cli/src/dev/packBuild.ts)).
  - As it runs, it calls `SpellUI.registerPack({ name, prefix, catalog, define })`.
  - `catalog` has `ROOT_CATALOG`'s shape (`RootCatalogEntry`:  a folder and a parsed skeleton).
    - Read from the pack's `<Name>.en.ts` vocabularies by [the root catalog](tools/RootCatalog.ts),
      as `yarn gen:root` reads ours (skeleton text, "Overview").
  - `prefix` ends in `-`, is never `ui-`, and starts every catalog tag.
  - A pack's families are written like ours ([the epics package's AGENTS.md](../epics/AGENTS.md)).
- The `ui-components` family ([its folder](src/components/ui-components/)) holds the runtime side:
  - `<ui-components source>` (`UIComponents`):  invisible, no logic, no fallback.
    - The root reads its `source`.
    - The root's barrel imports the family, so it's always defined with the root.
  - `ComponentPacks`:  static, one per page.
    - `load(source)` adds a `<script>` once per resolved URL.
      An already registered name resolves at once.
    - `register()` finds its load by `document.currentScript`,
      else by the name the file implies (`epics.pack.js` => `epics`).
      Then it calls `define()`, and adds the catalog and prefix.
    - `entryOf()`, `owns()`:  for the root.
  - A `define()` may return a promise, when it imports its families first.
    - The load resolves once that settles, so the root waits for the tags.
    - `packages/app`'s `spell.pack.js` (`<spell-app>`, `<spell-editor>`) imports two ES modules that way.
      It's built by Vite, not `spell dev pack build` ([app's AGENTS.md](../app/AGENTS.md), `components/`).
  - A pack's events keep their own names (`spell-open`).
    - Only Spell UI's `ui-*` ones take a translated tag's prefix (`Vocabulary`;  [the translation doc](docs/translation.md)).
  - `registerPack()`:  exported from `$/ui` (`@spell-app/ui`) and the family's barrel.
    The docs bundle puts it on `window.SpellUI`.
- The root (`UIRoot`, `RootLoader`):
  - its first settle round also waits for its packs
  - `RootLoader.undefinedTags()` / `entryOf()` know registered prefixes and catalogs
  - skeletons are found again when a pack registers:  its catalog arrives WITH it, so there's nothing to draw before
  - a pack that fails or times out is a `RootFailure`:  `{ tag: "ui-components", reason, source }`
    - shown in `ui-error`, and in `ui-ready`'s `failed`
    - and a console ERROR naming the `source` (`Warnings.error()`)
    - The root still gets ready.
- Modules a pack shares with the page are `SpellUI.packModules`:
  the EXACT specifier its build leaves external => the page's module.
  - `solid-js`, `@solidjs/web`, `$/ui/core`, `$/ui/forms`
  - Built in [the docs bundle's entry](../docs/tools/_assets/spell-ui.entry.js), NOT in `ui`.
    - It's the one place a Solid package is `import * as`'d, on purpose:
      a pack may use any export, so they must all stay ("One Solid per page" above).
  - A new specifier goes there AND in the pack build's externals.
  - So a pack's elements extend the page's own `UIComponent` / `DOMElement`.
- Tests:  [the component packs test](src/components/ui-components/ComponentPacks.test.ts).
  - On [the classic fixtures](test/fixtures/component-packs/), served by Vitest's dev server.

## Decorators

As WWOD §12, plus:

- [The decorator pre-pass](../../vite.decorators.ts) (`vite.decorators.ts`, at the repo root) is used by `vite.config.ts`.
  - Through `baseConfig()`, shared with `vitest.config.ts` and the site bundle's `vite.site.config.ts`.
- The decorator pre-pass MUST run BEFORE the Solid plugin:  the Solid compiler must see decorator-free code.
  - Both are `enforce: "pre"`;  `baseConfig()` orders them.
- It lowers `accessor` fields too (`@E.state accessor x`).
- It keeps decorator metadata, which `@cssState` / `@onChange` record their lists in:
  `Symbol.metadata`, or esbuild's `Symbol.for("Symbol.metadata")`.

## Types / Exports

As WWOD §8, plus our self-namespaces:  one per lib entry, since each entry is its own bundle.

| Name | Is | What's in it |
| --- | --- | --- |
| `E` | `$/ui/core` | the element core and the foundation:  `E.UIComponent`, `E.proto`, `E.Cell`, `E.Converters` |
| `F` | `$/ui/forms` | what only form controls need:  `F.FormComponent`, `F.MenuOptions` |
| `UI` | the runtime singleton, from `$/ui/runtime` | an instance, read like an app singleton;  never through `E` |
| `UIT` | `$/ui/components/components.types` | the constants, types and `ToggleCommands` several families share:  `UIT.FLUID`, `UIT.Key.enter`, `UIT.ToggleCommands.action(...)`, `UIT.SelectValue` |
| `V` | `$/ui/vocabulary` | namespaced through `vocabulary.api.ts`, from the `api` entry only (why:  that file's header) |
| `SSR` | `$/ui/static` | node only |

- `UIT` is exported from `$/ui/core` and `$/ui`:  never flat, never through `E`.
- The components barrel exports classes by name (`UIButton`, `UIDropdown`), no namespace.

## Imports

As WWOD §4, with `$/ui` / `$/ui/*` as our alias, plus these deliberate EXCEPTIONS.
(`$/ui/test/*`, the test helpers, is longer than `$/ui/*`, so it wins.)

- Component files import shared code from `$/ui/core` / `$/ui/forms` only, as `E` / `F` / `UI` / `UIT`
  ("Solid authoring").
  - Folder peers stay direct imports (`./UIButton.types`), one statement per module.
- The element core (`src/elements/`) imports itself the same way, through `E` / `F`, NOT its peers.
  - Only what a module reads while it evaluates comes from its file directly ("Solid authoring").
- Vocabularies and types files value-import `UIT` as `import * as UIT from "$/ui/components/components.types"`,
  not through `$/ui/core`.
  - Why:  they're PURE DATA that node imports (`yarn site:data`, `yarn gen:root`),
    and `core` loads the element layer, which node can't ("Overview", `UI<Name>.types.ts`).
- What sits BELOW `core` NEVER imports the `$/ui/core` entry:
  - below it:  `$/ui/runtime`, `$/ui/vocabulary`, `$/ui/icons`, `$/ui/util`, types files
  - they take shared helpers by name from `$/ui/util` (no namespace of its own), and `UIT` as above
  - Why:  `core` re-exports the runtime's loader.
    So a lazy runtime chunk importing the entry makes Rolldown split the modules both reach
    into a chunk every page loads (epic `wwod-spell-ui`, I16;  `yarn measure` catches it).
- `tools/` are node scripts:  relative imports with `.ts` extensions, no aliases.  Two exceptions:
  - another package, by its alias
    - `$/server`:  `tsx` resolves the paths, and `../../server/src` would be a `../` across packages
  - PAGE scripts Vite serves or SSR-loads import `ui` through `$/ui/...` (`SSR` for `$/ui/static`), as `src/` does,
    and `tools/` peers relatively.
    - the demo's `*.ts` (`tools/demo/`)
    - the visual tests' `fixture.ts`, `StaticFixture.ts`, `StaticDocument.ts`
- `scripts/` likewise:  relative imports with `.ts` extensions, no aliases.
  - [`Terminal`](tools/Terminal.ts), [`StyleGenerator`](src/styles/StyleGenerator.ts):  a leaf file, never a barrel with `?inline` CSS
  - peers after a blank line (`./generatedFiles.ts`)

## Comments & docs

As WWOD §6, plus:

- An override that only FILLS a hook its base class documents needs no docstring:
  `render()`, `cssStates()`, a fallback's `build()`.
  - One that adds to the base's contract says what it adds:  `/** Disabled by its attribute, or by a disabled fieldset. */`.
  - The base class documents each hook once (epic `wwod-spell-ui`, Q3).
- Likewise these are documented once, with why they're static, on `UIComponent` / `NativeFallback`:
  - `@proto static vocabulary` / `vocabularies` / `degraded`
  - `@protoMerged static elementSetup`:  its keys, on `ElementSetup`

## Functions & types

As WWOD §9, plus:

- A SET of related values (close reasons, key names, positions, modes) is a const array + type:
  `ToastCloseReasons` + `ToastCloseReason`.
- A single vocabulary word (a class word, a part name) stays a named ALL-CAPS constant,
  under a `// ##` group in its types file (epic `wwod-spell-ui`, Q2).
- A PLATFORM string is API, not data:  write it inline.
  - TypeScript checks many of them (WWOD §9 › "Named string constants + `typeof` types").
  - No `UIT.ARIA_LABEL`, no `RESET` (Owen, 2026-10-08, epic `wwod-spell-ui` P17).
  - Platform strings are:
    - HTML attribute names and values:  `"aria-label"`, `"tabindex"`, `"true"`, `"reset"`
    - ARIA roles and states:  `role="list"`, `aria-current="page"`
    - DOM event types (`"click"`, `"focusout"`), tag names (`"div"`, `"slot"`)
    - pseudo-classes (`":popover-open"`), platform CSS property names (`"anchor-name"`)
- Still constants:  our own vocabulary names (`ui-*` attributes, events, parts, slots, states),
  Fomantic class words, tokens, data keys.
  - A word that is both is inline where it's the platform's, a constant where it's ours.
    `"vertical"`:  `aria-orientation="vertical"`, but the toast's `VERTICAL` class word.
  - Key names (`UIT.Key.enter`) stay one map (epic `wwod-spell-ui`, P2).
- A MAP of words or tokens is a PascalCase const object (WWOD §9 › "Const object + `keyof typeof`").
  - `UIT.PusherTokens.dimmed`, `UIT.TransitionCommands.show`
  - a shared vocabulary table too (`...UIT.SourceAttributes`)
  - A frozen pair stays ALL-CAPS:  `UIT.TABLE_SORT_OPT_OUT`, WWOD §9's frozen singletons
    (epic `wwod-spell-ui`, J12, undoing J50's churn-only keep).
- Values are English where they're only ours (`"file protocol"`).
  - Values a page or CSS reads keep their published spelling:
    an event's `detail`, `data-ui-animation`, a vocabulary's attribute values.
- `null` only at platform boundaries:  `getAttribute()`, `setFormValue()`, `useContext`'s default.
  - Everything of ours is `undefined` (epic `wwod-spell-ui`, Q9).

## Classes

As WWOD §12, plus:

- A class setting lives WITH ITS PROPERTY GROUP:
  its `declare` and its `@proto static` default side by side, in the `////` section of the code that uses it.
  - In `UIComponent`:  `elementSetup` under "Element setup", `vocabulary` under "Vocabulary".
  - Owen's "locate code near its siblings" (epic `wwod-spell-ui`, Q11),
    superseding "`@proto static` defaults at the TOP".
  - A subclass that only SETS settings (`@proto static vocabulary = ...`) still lists them first, before its members.
- Per-class settings of the custom element itself are keys of ONE setting, `elementSetup` (type `ElementSetup`).
  - Inherited key by key down the class chain, by `@protoMerged` (`$/util`, as `E.protoMerged`).
  - Its keys:
    - style sheets, the `:state()`s that mirror an attribute
    - form control, focus, slots, part, DOM element class, fallback, unstyled first paint, constant ARIA
    - what each shared state does for it ("Shared states", above)
  - A subclass states only the keys it changes:

    ```ts
    @E.protoMerged static elementSetup = { styleSheets: { nag: nagCSS }, DOMElement: DOMNagElement } satisfies Partial<E.ElementSetup>
    ```

  - Each class's object is chained to its base class's (its prototype):  a key it doesn't state is read from there.
    - ONE object per class, so `Class.elementSetup` and `Class.prototype.elementSetup` are the same.
    - Read keys by name (`this.elementSetup.styleSheets`).
      A spread or `Object.keys()` of the whole object sees only its own class's keys.
  - A base class that others extend types its own as `Partial<E.ElementSetup>`:
    otherwise a subclass stating other keys fails TypeScript's check of the class's static side.
  - Every other class ends its literal with `satisfies Partial<E.ElementSetup>`.
    A misspelt key fails TypeScript, where an untyped literal would take it silently.
  - Only the top level is chained:  a subclass's `styleSheets` REPLACE its base's whole.
    Spread the base's to add to them:
    `styleSheets: { ...UISection.prototype.elementSetup.styleSheets, panel: panelCSS }`.
    - The same goes for `cssStates` and `aria`.
- `vocabulary` stays a setting of its own.
- Developer / debug switches (ALL-CAPS statics:  `UIComponent.ISOLATE_ERRORS`) stay at the top.
- Other statics go after the main methods.  Constants go below the class (next bullet).
- Constants (epic `wwod-spell-ui`, Q18:  bundle size over WWOD §12's `static` constants):
  - Used by ONE class:  a module `const` (not exported) BELOW the class, with its other helpers (WWOD §8),
    each with its docstring.
    - Why:  a module `const` minifies to one letter;  a static's name (`t.LIST_SEPARATOR`) doesn't.
  - ABOVE the class only when something reads it while the class loads:  below, it'd hit the temporal dead zone.
    - a static initializer, a decorator argument, a static's computed key, a module `const` above
    - Say so in one line:  `// Above the class:  <static x> reads it while the class is defined`.
  - Used by SEVERAL files of the folder:  the folder's `.types.ts`.
  - Page-wide registries stay `private static readonly` + `static reset()`, as tests reset them
    (WWOD §15;  epic `wwod-spell-ui`, Q10).
  - Developer / debug switches stay ALL-CAPS statics at the top (`UIComponent.ISOLATE_ERRORS`).
  - A public static read from outside the class is API:  it stays.
  - Applies to `src/elements/`, `src/static/` and `src/runtime/` too, not only component folders.
- Render pieces of a component are private methods named for what they draw, no type word.
  - `thumb()`, not `renderThumb()` / `thumbElement()`.
  - WWOD §17's inner functions are for function components (epic `wwod-spell-ui`, Q12).
- A component reads close to English (Owen, 2026-10-06, epic `wwod-spell-ui` P14):
  - Its `////` sections are by PROPERTY or job, not by runtime phase.
    - A member's state, getter / setter, what's derived from it, its handlers and `@onChange` methods go together.
    - `UIComponent`:  "Readiness and style sheets", "Classes", "Disabled".
    - `LoadableComponent`:  "The text", "Loading", "Errors", "Saving".
  - The public API in code is getters / setters (`isDisabled`, `content`), not `getX()` / `setX()` functions.
    - A method only when it takes arguments (`hasContent(name)`),
      or is an action that sends an event (`save()`, `requestChange()`).
  - Booleans read as English:  `isDirty`, `isSaving`, `delegatesFocus`, `isAFormControl`.
  - Handlers and moment callbacks are `on...`:  `onMount()`, `onLoaded()`, `onError()`, `onFormReset()`.
  - The two event verbs are short:  `send()` an event, `on()` to listen.
- The constructor of `UIComponent` stays `(domElement, definition)`:
  `UIComponent.mount()` and the server render call it.

## Logging

As WWOD §19, EXCEPT the `Logger`:
`$/util`'s would add bytes (and colours only Chrome's console draws) to every component bundle
(epic `wwod-spell-ui`, Q5).
Instead:

- Every console warning goes through `Warnings` (`$/ui/util`):
  - `Warnings.warn(source, message, ...data)`:  for what the page's author must fix
  - `Warnings.devWarn(...)`:  advice, in development builds only
  - ONE format:  `[@spell-app/ui] <source>:  <what happened>`, then the data.
  - NEVER a bare `console.warn`.
- The two `console.error`s:
  - `UIComponent`'s, when an element's render throws (WWOD §19 › "`console.*` is reserved for")
  - `<ui-root>`'s, when a component pack didn't load (`Warnings.error()`):  a whole set of tags is missing
- `tools/` and `scripts/` are node CLIs:  their output goes to `process.stdout` / `stderr`.

## Tests

As WWOD §20, plus:

- An element's tests describe as `describe("<ui-button> keyboard")`:  `ui`'s form of the call path.
- Helper classes use the call path (`describe("SliderScale.ratio()")`),
  and get their own test file beside them (epic `wwod-spell-ui`, Q8).

## Out of scope for WWOD

- Generated files are never edited, only regenerated:
  - `src/languages/`, `md.bundle.js`
  - `site/_assets/`, `site/_data/`
  - `UIRoot.catalog.ts`
