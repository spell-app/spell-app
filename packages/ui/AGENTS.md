# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/ui`.

**READ the repo root's `AGENTS.md` and WWOD (`agents/wwod/WWOD.md`) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

**New to how a `<ui-*>` element works (the platform, the DOM element / component pair, the decorators, every hook):
READ the guide, `guides/custom-elements/custom-elements.html`,** with live elements to click.
The rules below are its short form.

## Overview

- `@spell-app/ui` is Fomantic UI reborn as `ui-*` custom elements on a modern CSS foundation:
  Fomantic's vocabulary (`ui small primary basic icon button`), shadow DOM, `@layer`s, OKLCH tokens,
  accessibility built in.
  - Usable from any framework or plain HTML.
  - Built on **Solid 2** (`solid-js` / `@solidjs/web` `2.0.0-rc.13`, pinned exactly).
  - The custom-element layer is `ui`'s own code
    (`DOMElement`, `UIComponent`, `ShadowEvents`, `HotDefinitions`, in `src/elements/`):
    `@solidjs/element` and `component-register`, folded in and fixed
    (epic `spell-element`, 2026-10-09;  each such file carries their MIT notice).
- The approved design is `docs/plan.md`.
  - Read "Decisions" and "Architecture" there BEFORE adding a component or runtime service.
  - `docs/report.md` is the generated status report (bundle, perf, hosts, HMR, fallbacks).
- `docs/status.md` is the per-component checklist (status, tests, size, keyboard, docs page, deferred items).
  MUST be updated in the same change that builds, finishes or defers anything in it.
- Layout:
  - `../util/` -- `@spell-app/util` (`$/util`), shared with `spell`:
    `@proto` / `@protoMerged` / `@lazy` / `@once`
    (`decorators.ts`;  component files say `@E.lazy`, `@E.once`, `E.forget()`),
    `class.ts`, `string.ts` (case, `numberToWord`, `suggest`), `dom.ts` (`closestAcrossShadow` ...), `util.types.ts`.
    - `src/util/index.ts` (`$/ui/util`) re-exports it, so source keeps saying `from "$/ui/util"`;
      its declarations ship in `dist/_util/`.
    - `src/util/index.ts` imports util's GENERIC files one by one (`$/util/class` ...),
      never `$/util`'s barrel, which also holds spell's utilities (lodash, `chalk` ...):
      one of the deep-import exceptions (WWOD §4 › "Package aliases, never `../`"),
      so spell's utilities never reach `ui`'s bundles.
    - Where a helper goes:  SEE:  WWOD §8 › "Promotion path".
    - Everything in `$/ui/util` lands in the `core` bundle (`core.ts` re-exports it), so keep it small
  - `src/vocabulary/` (`V` through the `api` entry) -- the naming layer:
    vocabulary schema, value sets, `Vocabulary` (registry, translated names, `replace()` for hot reload), `Converters`,
    `SharedVocabulary` (the attributes and states every component takes:  `disabled`, `loading`, `visible`);
    `SkeletonText` (skeleton text <=> `SkeletonSpec`) too, but reached by path, NOT through the barrel:
    `core` re-exports the barrel, and no page parses skeleton text (node tools do:  `tools/RootCatalog.ts`)
  - `src/runtime/` (`UI`) -- the shared `UI` runtime, ONE instance per page (`globalThis.UI ??= new UIRuntime()`).
    - Components call `UI.load()` on connect, which dynamic-imports this chunk once.
    - Services are classes:  `Browser` (sniffing + `UI.browser.supports` flags), `Keyboard`, `Overlays`,
      `Focus`, `Styles`, `Vocabulary`, `I18n`, `Transitions`, `Ids`, `Toasts`, `Modals`, `Api`,
      `IconPacks` (`UI.icons`), `Sources` (`UI.sources`), `Themes` (`UI.themes`)
  - `src/icons/` -- the icon PACK format (`IconPackIndex`, `IconName`, `BuiltInPacks`) and the built-in packs
    (`icon-packs/<id>/`:  SVG files + `pack.js`);  loading and caching are the runtime's (`UI.icons`);
    packs are built by `tools/IconPackBuilder.ts` (`yarn icons:pack`);  see `docs/icons.md`
  - Two words for the two objects behind every tag (epic `wwod-spell-ui`, P15):
    - the COMPONENT -- the class behind a tag, `UIButton`, one instance per element:
      it holds the state, `render()`s the shadow DOM and handles the events.  Its base is `UIComponent`.
    - the DOM ELEMENT -- the tag in the page, the `<ui-button>` itself, with its attributes, properties and events:
      an instance of `DOMElement` (or a subclass), as the platform's `<a>` is an `HTMLAnchorElement`.
    - They point at each other:  `component.domElement`, `domElement.component`.
      "Host" is only the platform's word now (`:host`, `ShadowRoot.host`);  "controller" is retired.
  - `src/elements/` (`E`) -- the element core:
    - library-neutral:  `ClassBuilder`, `Validator`, `MenuOptions`, `OwnerContext`, `Shorthand`, `NativeFallback`
    - the Solid layer:
      - `UIComponent` (the COMPONENT base:  one instance per element, `render()` returns JSX)
        and `DOMElement` (the DOM element base)
      - `ElementDefinition` (vocabulary => the DOM element's attributes)
      - `Reactive` (the reactive members' decorators:  `@state`, `@controlled`, `@derived`, `@cssState`, `@onChange`)
      - `FormComponent` + `DOMFormControl` (form controls), `Cell`, `SlotContent`
      - `PartContext` + `PartComponent` (the generic content parts, styled by their owner)
      - `IconGlyph`
      - `LoadableComponent` + `DOMLoadableElement` (the base of the elements that show a text file:
        `source`, inline text, loading / error look, `save()`)
      - `LoadableBody` + `DOMLoadableBodyElement` (a section's body loaded from `source` the first time it opens)
      - the dev-only `HotDefinitions` (NOT in the barrel)
    - the DOM element bases keep their own files (`DOMElement.ts`, `DOMFormControl.ts` ...):
      many families and the static render import them, and a DOM element knows its component only by type
      (the component imports it, never the other way round)
  - `src/components/ui-<name>/` -- one folder per component FAMILY, named after its main tag (`ui-button/`);
    every FILE in it is named for its COMPONENT, as any class file is named for its class (`UIButton.css`):
    - `UI<Name>.tsx` (or `.ts` without JSX) -- one component per file:  `UIButton.tsx`, `UIButtons.tsx`, `UIOr.tsx`;
      family helpers beside them (`SlottedItems.ts`)
      - a family's own DOM element class (`DOMNagElement`, `DOMCheckElement`:  a few members of script API)
        lives in its component's file, ABOVE the component (its `elementSetup` reads it while the class is defined),
        named `DOM<Name>Element` as the platform's `HTMLAnchorElement`;
        NO one-liner files (Owen:  "try to avoid one-liner files, e.g. BrandColorHost").
        A big one (dozens of members) may keep its own file, `DOM<Name>Element.ts`;  none does today
        - it names its component class, `class DOMNagElement extends E.DOMElement<UINag>`,
          so `this.component` is a `UINag | undefined` and its script API forwards with no cast:
          `close() { return this.component?.close() ?? false }`.
          A type only:  `elementSetup.DOMElement` is what pairs them at run time
        - the other way round, a component whose code reads its DOM element's own members says so with a
          `declare readonly domElement: DOM<Name>Element` (`FormComponent`, `UIBrandColor`), not a cast.
          Except where the same class reads it in a field initializer:
          TypeScript calls that "used before its initialization" (TS2729),
          so `LoadableComponent` keeps its `as DOMLoadableElement` casts
    - `index.ts` -- the family barrel:  calls `define()` for every tag (SIDE EFFECT), re-exports the classes.
      Also the family's lib entry (`@spell-app/ui/ui-button`) and its hot-reload boundary
    - `UI<Name>.css` -- port of Fomantic's `.less` + `.variables`;  a second sheet keeps its suffix
      (`UIDimmer.page.css`), or names its own tag's component (`UIBrandCheck.css`)
    - `UI<Name>.en.ts` -- the tag's VOCABULARY, named for its language:
      ONE per tag, named for THAT tag's component
      (`UIButton.en.ts`, `UIButtons.en.ts`, `UIOr.en.ts`, `UIFeedEvent.en.ts` for `<ui-event>`).
      It holds EVERY name the tag uses:
      tag, attributes (kind + allowed values), values, events, slots, parts, states, text strings.
      - Translations become `UI<Name>.<lang>.ts` (`UIButton.es.ts`).
        A two-letter code before `.ts` means a vocabulary:
        the tools find them by it (`VocabularyFiles.languageOf()`), so no other family file is named so
      - and `topics` (2+ ids from `ValueSets.topics`:  how a newcomer looks for it AND how widget libraries file it)
        and `aka` (other libraries' / everyday names:  `ui-modal`:  `dialog`, `lightbox`).
        - A NEW TAG MUST fill both:  `src/components/ComponentDefinitions.ts` rolls them up (the docs' component
          browser), and `src/components/ComponentDefinitions.test.ts` fails on a tag without them.
        - A new or moved tag also needs `yarn gen:root` (`<ui-root>`'s catalog of tag => family)
          and `yarn site:data` (the docs site's data):
          `src/components/ui-root/UIRoot.catalog.test.ts` and `tools/SiteDataBuilder.test.ts` fail while they're stale.
        - Live:  `UIButton.describe()`
      - and `skeleton`:  what `<ui-root display="skeleton">` draws for the tag,
        as SKELETON TEXT (`SkeletonText`, its grammar in its header):
        `"inline 6 x 2.5"`, `"2 tall"`, `"18 wide: square image, header, 3 line paragraph"`;
        LEFT OUT for none (never `"none"`, `null` or `false`:  an optional property left out, epic `wwod-spell-ui` J26).
        - A component pack's vocabularies write it the same way.
        - `tools/RootCatalog.ts` parses it into the catalog (`yarn gen:root`;  `spell dev pack build` for a pack);
          `test/vocabularies.test.ts` parses every one and fails on a typo or a stale catalog
    - `UI<Name>.types.ts` -- the folder's loose constants, types and shared vocabulary pieces,
      when SEVERAL of its files use them
      (a constant only one class uses is a module `const` below that class:  "Classes";
      a types file left with one constant is folded away, no one-liner files);
      a helper function becomes a private static on the one class that uses it, else a static on a small class here.
      - Constants used by SEVERAL folders live in `src/components/components.types.ts`,
        used as `UIT.<NAME>` from `$/ui/core`.
      - NOTE:  a types file imports its vocabularies with `import type` only
        (vocabularies import values from it:  a value import is a cycle);  `UIParts.types.ts` is the exception
    - vocabularies and types files are PURE DATA:  `$/ui/core` for types only;
      shared constants by value come straight from `components.types`
      (`import * as UIT from "$/ui/components/components.types"`).
      - Why:  core loads the element layer, which node can't,
        and `yarn site:data` / `yarn gen:root` import every vocabulary in node (tsx).
      - `test/vocabularies.test.ts` enforces it
    - `UI<Name>.fallback.ts` -- the native fallback (plain DOM, no Solid) shown when the element's render throws:
      FORM CONTROLS ONLY ("Native fallback", below)
    - `UI<Name>.test.tsx` (the component), `UI<Name>.css.test.ts` (the sheet on class-grammar markup),
      `UI<Name>.fallback.test.ts`, `UI<Name>.ssr.test.tsx`, `UI<Name>.a11y.test.ts`, `UI<Name>.perf.test.tsx`
    - `examples/*.html` -- Fomantic's examples in CLASS GRAMMAR (static markup, the CSS tests and the site)
    - `examples/elements/*.html` -- the same examples as `ui-*` ELEMENT markup
      (axe in `UI<Name>.test.tsx`, `yarn dev`, `yarn test:visual`)
    - `examples/elements/<example>.visual.ts` -- optional OPEN states for the visual tests (`docs/visual-testing.md`)
    - tools that look a family file up by name go through `tools/FamilyFiles.ts`;
      the rest match suffixes (`*.en.ts`), whatever the file's name
  - `src/components/ui-components/` -- `<ui-components source>`, the component packs a `<ui-root>` loads:
    "Component packs", below
  - `src/docs-components/ui-docs-<name>/` -- DOC-ONLY element families (`<ui-docs-example>`, `<ui-docs-api>` ...):
    the widgets the docs site is built from, laid out and written EXACTLY like a component family
    (same files, same rules), but NOT components:
    no lib entry, not in `ComponentDefinitions.all` / the component list (`ComponentDefinitions.docs`),
    every tag filed under the `documentation` topic.
    - `<ui-root>` knows them (`yarn gen:root` scans this folder too),
      but loads them only where the page's bundle called `DocsFamilies.add()`
      (the site's does;  never the library's own `RootLoader`:  epic `wwod-spell-ui`, I12).
    - A family that renders other widgets in its shadow root imports their families in its barrel,
      and adds their tags to `DocsJSXTags`.
    - They read the site's data through `SiteData` (`site/_data/components.json`), NEVER the vocabularies.
    - The barrel's header says how to add one
  - `src/static/` (`$/ui/static`, `SSR`) -- the STATIC server render:
    `StaticRender.page()` / `fragment()` turn `ui-*` markup into plain light-DOM HTML (no shadow DOM, no JS) in node,
    for SEO.
    - Stand-in DOM elements are linkedom elements (`ServerDOMElement`), components render with `renderToString`,
      `StaticFlattener` swaps each DOM element for its root, `StaticInteractions` wires what works without JS.
    - Node only:  NEVER imported by a component or `$/ui`.
    - Plan:  `epics/seo/seo.plan.html`
    - Server code, so every file is `<Name>.ssr.ts`, `.server.ts`'s short form
      (`static.types.ssr.ts`;  tests `<Name>.ssr.test.ts`, in the `ssr` project) except the barrel, `index.ts`
      (WWOD §10 › "Server code stays out of the browser bundle")
    - Its files import each other through `SSR` (`import { SSR } from "$/ui/static"`)
      and the element core through `$/ui/core`;
      a mark a static initializer reads comes from `./static.types.ssr` directly
      (WWOD §4 › "Circular imports";  `barrel.ssr.test.ts`)
  - `src/core.ts`, `src/forms.ts` -- the two SHARED lib entries (`@spell-app/ui/core`, `@spell-app/ui/forms`):
    `core` is the element core + the foundation JS every family needs;
    `forms` what only form controls with a VALUE need (`FormComponent`, `DOMFormControl`, `Validator`, `MenuOptions`).
    Component files import shared code ONLY through these (see "Solid authoring")
  - `src/styles/` -- `layers.css`, tokens, colours, sizes, reset, typography, animations, utilities, `native.css`,
    `themes/`;  its own lib entry (`@spell-app/ui/styles`)
  - `src/index.ts` -- `@spell-app/ui`:
    registers every family (side effect) and re-exports them, plus `UIT`, the runtime, styles and icons;
    the namespaces `E` / `F` / `V` come from `core` / `forms` / the `api` entry
  - `test/` -- shared test utils and cross-family tests:
    `Fixture.render(html)` (`Fixture.ts`), `A11y.check(el)` / `expectAccessible(el)` (`A11y.ts`),
    `ElementFixture` (render + wait for `ready` + `flush()`, `breakRender()`),
    `StubOwner` (stand-in owners:  card, feed ...), `PerfRun` (the dropdown benchmark), `fallback.cases.ts`,
    `dictionary.es.ts`, `VisualOpen` + `test.types.ts` (visual-test hooks),
    `visual/baselines/` (screenshots, `yarn test:visual`);  `fallback` / `isolation` / `translate` / SSR / DSD tests.
    - Every test runs in a REAL browser (Vitest browser mode + Playwright, chromium by default),
      except `*.ssr.test.tsx` (node)
  - `tools/` -- package tooling (node scripts run by `tsx`, see `tools/README.md`):
    bundle measurement, peer vendoring, import-map smoke pages (framework hosts), LOC, report tables,
    the HMR end-to-end test;
    `tools/demo/` is the `yarn dev` site;  `tools/visual/` the visual tests;
    results go to `tools/results/` (git-ignored).
    Environment variables (ours `SPELL_UI_*`, WWOD §11) are read ONLY in `tools/environment.ts` (`environment`):
    by `tools/`, `scripts/` and the configs alike
  - the docs site, modelled on Fomantic's docs, served at `/ui/` by the page server
    (static, live-reloading;  `packages/server`'s `UI_SITE`):
    plain `.html` pages on `<ui-*>` widgets, no build step to view one
    (epic `spell-ui-pages`, which replaced the old Astro site).
    In TWO halves since 2026-10-05 (claude-design P6), one constant each in `tools/tools.types.ts`:
    - `SITE_PAGES`, the HAND-WRITTEN half:  `ui/` at the checkout's root, SHARED content
      (a link into `../spell-app-dev/ui/`;  root `AGENTS.md` "Shared content"):
      `*.html`, `components/ui-<name>.html`, `_parts/` (the layout and footer every page shares),
      `examples/` (files the examples load), `images/` (Fomantic's docs images),
      `_data/search.json` (built from these pages by `yarn site:data`), and `README.md`:  how pages are made.
      Edited from any checkout, never committed here
    - the `site:*` scripts that WRITE pages (`site:new`, `site:index`, `site:kitchen`, `site:sections`)
      write the shared `ui/` from THIS branch's data and template:
      a page using an element only this branch has shows it undefined in other checkouts until the branch merges
    - `SITE_BUILD`, the BUILT half:  `site/`, tracked per branch (`site/README.md`:  its files);
      the page server lays its `_assets/` and `_data/` over the pages at `/ui/`,
      so every page's relative `_assets/...` / `_data/...` links resolve unchanged:
    - `site/_assets/` -- GENERATED, NOT committed (git-ignored since 2026-10-07:
      its hashed chunk names churned every diff and merge):
      the site bundle (`yarn site:bundle`):  `site.js` + `site.css`, which every page loads
      (`<link rel="stylesheet" href="_assets/site.css">` + `<script type="module" src="_assets/site.js">`,
      `../_assets/` from `components/`), each family a lazy chunk, `icon-packs` a symlink to `src/icons/icon-packs`.
      - The page server builds it when it starts, if stale (`spell dev bundles build --stale`;
        `$/assembler` `Bundle`, `.bundle.json` records the sources' hash), and a page waits for that.
      - NEVER edit
    - `site/_src/` -- the bundle's entry (`site.ts`:  what's in it and why) and the site's layout-glue CSS (`site.css`);
      config `vite.site.config.ts`
    - `site/_data/` -- `components.json` and `icons.json` (the icon browser's search terms), GENERATED, committed
      (`yarn site:data`;  shapes `SiteDataFile` / `SiteIconsFile` in `src/docs-components/docs-components.types.ts`),
      and `pages.json`, hand-kept per-family facts it reads
      (title, summary, status, token-table overrides, `pages`:  the sub-tags with a page of their own).
      - The search file (`SiteSearchFile`) is the shared `ui/_data/search.json`:
        rerun `yarn site:data` after renaming or moving a section
  - `docs/` -- design docs (`plan.md`, `grammar.md`, `theming.md`, `translation.md`, `icons.md`, `fallback.md`,
    `runtime.md`) and the generated `report.md`
  - `scripts/` -- one file per yarn script, named for it (WWOD §8 › "File naming"):
    `<group>:<verb>` runs `scripts/<group>-<verb>.ts` (`site:data` -> `site-data.ts`, `gen:root` -> `gen-root.ts`):
    generators (`gen-*.ts`),
    the site's writers (`site-data.ts`, `site-index.ts`, `site-kitchen.ts`, `site-sections.ts`, `site-new.ts`),
    the site bundle's build (`site-bundle.ts`, watched by `site-dev.ts`), `site-check.ts`, `tokens-alias.ts`,
    `design-build.ts`
    - what several scripts share:  camelCase helper files, run by none
      (`browserBundles.ts`:  `gen:spell` / `gen:markdown`;
      `generatedFiles.ts`:  write-or-`--check`, `vp fmt`, markup escaping);  data:  `iconExtras.ts`
    - a class other code uses lives in `tools/` (PascalCase),
      its script is a few lines here (`site-check.ts` -> `tools/SiteCheck.ts`);
      a folder of `tools/` with its own flags has a `cli.ts` instead
      (`tools/cli.ts`, `tools/visual/cli.ts`:  WWOD §8's `page/cli.ts`)
  - `src/languages/` -- GENERATED, committed:
    `spell.<lang>.js`, spell's pre-compiled highlighter for `<ui-code language="spell">`
    (`yarn gen:spell`;  the root `AGENTS.md`'s one `ui` -> spell exception).
    NEVER edit;  lint and format skip it
  - `src/components/ui-markdown/md.bundle.js` (+ `.d.ts`, `MDBundle.ts`) -- GENERATED, committed the same way:
    the pre-compiled markdown engine (`@spell-app/markdown`, `yarn gen:markdown`).
    NEVER edit;  lint and format skip it
  - `reference/Fomantic-UI/` -- READ-ONLY, git-ignored clone of Fomantic for porting.  NEVER edit or import it.
- Commands:
  - `yarn review` -- tsc (root, node configs) + oxlint `--fix` + oxfmt + every test (`ssr`, `browser`);
    MUST pass before you hand work back
  - `yarn build` -- tsc + vite library build into `dist/`
    (entries `core`, `forms`, one per family, `styles`, `index`;  `dist/icon-packs/`;
    `.d.ts` beside the `exports` paths, from `declarations()` in `vite.config.ts`)
  - `yarn test` -- the `ssr` project, then `browser`
    (`ssr` first:  it writes `.cache/ssr-button.html`, which `test/dsd.test.ts` reads)
  - `yarn test:all` -- chromium + firefox + webkit (`yarn test:browsers` once first)
  - `yarn test:visual [--os local|linux|both] [--browsers all|chrome|webkit|firefox] [--update] [--grep <family>]
    [--parity]` -- screenshot tests of every element example, light + dark,
    against the baselines in `test/visual/baselines/` (Playwright `toHaveScreenshot`;
    `linux`, the default, renders in Playwright's Docker image).
    - `yarn test:visual:update` ~== `--update`;  see `docs/visual-testing.md`
    - NOT part of `yarn review` (slow, needs Docker),
      but MUST run before a change that alters rendering (CSS, markup, tokens, an example) is handed back
    - a change that alters rendering MUST update its baselines in the SAME change (`--update`),
      after reviewing every diff in the HTML report;  never update to silence a diff you haven't looked at
    - `--static` -- instead, compare the STATIC server render (`$/ui/static`)
      of the families in `tools/visual/StaticFamilies.ts` with the elements;
      report only (`tools/results/visual/static-parity.md`), `--os local` by default
  - `yarn dev` -- `tools/demo/`:  every example as class grammar beside elements;  edits hot-reload
  - `yarn icons:pack <folder> --id <id> [--sanitize] [--skip-unsafe | --allow-unsafe]` --
    verify a folder of SVGs and write its `pack.js` (keeps hand edits);  `--sanitize` strips unsafe attributes first;
    files that still fail refuse the pack, unless skipped or allowed
  - `yarn vendor`, `yarn measure`, `yarn smoke`, `yarn report`, `yarn test:hmr` -- see `tools/README.md`;
    `yarn report` rewrites `docs/report.md`'s tables (run it twice:  no diff)
  - `yarn site:build` ~== these four, in turn:
    - `yarn site:data` (`site/_data/components.json`, `icons.json`;  the shared `ui/_data/search.json`)
    - `yarn site:index` (the component index's cards, `ui/components/index.html`;  `--check`)
    - `yarn site:kitchen` (the kitchen sink's examples, `ui/kitchen-sink.html`,
      from every family's `examples/elements/types.html`;  `--check`)
    - `yarn site:bundle` (`site/_assets/`, sizes printed)
    - rerun it after changing a vocabulary, a family sheet, an example or any source the site shows,
      and commit `site/_data/`:  `ui/` commits itself, and `site/_assets/` is git-ignored
      (`spell dev bundles build ui-site` records its sources' hash, so the page server doesn't build it again)
  - `yarn site:dev` -- `scripts/site-dev.ts`:  `yarn site:bundle`, then the page server (started if needed)
    serves `/ui/` while a Vite WATCH build rebuilds `site/_assets/` on every `src/` / `site/_src/` edit,
    and live reload reloads the open pages.
    - Not watched:  `site:data` / `site:index` / `site:kitchen`.
    - A watch rebuild leaves stale hashed chunks (harmless:  not committed);
      the page server's next start rebuilds the bundle clean
  - `yarn site:new <tag|page> [--title ...] [--summary ...] [--force]` --
    a site page from the template (`templates/spell-ui-docs.html`, `scripts/site-new.ts`):
    `ui/components/<main tag>.html` for a tag
    (`<tag>.html` for a sub-tag its family's `pages` lists:  `ui-radio`), else `ui/<page>.html`;
    title / summary / status from `site/_data/pages.json`.
    How to write one:  `epics/spell-ui-pages/PAGES.md`
  - `yarn site:sections [--check] [page...]` -- `scripts/site-sections.ts`:
    nests every page's flat level 2 / 3 headers and headed examples into `<ui-section>`s
    and writes (or fixes) their ids, `<tab>-<section>-<example>`;  idempotent.
    `site:index`, `site:kitchen` and `site:new` run it on what they write
  - `yarn design:build [--out <dir>]` (`spell dev design build`) --
    `scripts/design-build.ts` on `tools/DesignExport.ts`:
    the claude.ai design system's files (epic `claude-design`) in `<dir>/project/`,
    default `build/design-system/` (git-ignored),
    from `site/_data/components.json`, the element examples and the Spell theme.
    - `yarn site:data` first after a vocabulary change.
      It also writes `site/_data/custom-elements.json` and `html-custom-data.json`
      (VS Code autocomplete for `<ui-*>`, `tools/ElementManifests.ts`);  `tools/DesignExport.test.ts` fails while stale
  - `yarn site:check <page...> | --all` -- `scripts/site-check.ts` on `tools/SiteCheck.ts`:
    loads the `ui/` pages from the page server (Playwright),
    fails on console errors, 404s, undefined / unrendered `ui-*`, missing tabs, an empty toc, phone-width overflow,
    a nav flyout that won't open;  screenshots in `tools/results/site-check/`.  LOOK at them
  - Generators, each writing COMMITTED files (never edit their output):
    - `yarn gen:styles` (`src/styles/` token sheets)
    - `gen:icons` (the built-in icon packs;  downloads Font Awesome, needs `reference/Fomantic-UI/`)
    - `gen:emoji` (`ui-emoji/data/`;  needs `reference/Fomantic-UI/`)
    - `gen:root` (`<ui-root>`'s catalog)
    - `gen:spell` / `gen:markdown` (the pre-compiled bundles)
  - `yarn tokens:alias <family> [--write]` is `docs/theming.md`'s codemod (prints only, without `--write`)
  - `yarn tsc`, not `npx tsc`, and no hard-coded `node_modules` paths:  SEE:  root `AGENTS.md` "Toolchain:  Vite+".
    Here, node code finds a dependency through `tools/NodePackage.ts`.

## UI rules

- Shadow DOM EVERYWHERE, with SEMANTIC shadow markup:  `<button>`, `<dialog>`, `<input>`, `<nav>`, `<table>` ...
  NEVER a `<div>` where an element exists.
- Inside shadow roots, keep Fomantic's class grammar on those elements:  `<button class="ui small primary button">`.
  - Why:  it's a mechanical port of the `.less`,
    and the app stylesheet / `::part` override language is the known vocabulary.
  - Translated names never touch CSS.
- Booleans:  presence / `""` / `"true"` / `"yes"` ~== true;  `"false"` / `"no"` ~== false.
- Widths:  attribute is `width`, NEVER `wide`;  accepts columns (`4` of 16), fractions (`1/4`), percentages (`25%`).
  Exception:  `<ui-sidebar>` and `<ui-flyout>` also take Fomantic's width words
  (`very thin`, `thin`, `wide`, `very wide`), which the element adds before the noun (`ui left thin sidebar`).
- Numeric fields are RIGHT-aligned (`text-align: end`, `tabular-nums`),
  the number set against its trailing unit (`250°`, `55%`, `16px`);
  text fields (a hex, a name) stay start-aligned.  Owen's standing rule (2026-10-04).
- Chosen state:  `selected` is canonical (checkbox, radio, toggle, items, tabs, options);
  `checked` is accepted as an alias on checkbox / radio only.
- Generic content parts
  (`<ui-content>`, `<ui-header>`, `<ui-meta>`, `<ui-description>`, `<ui-extra>`, `<ui-actions>` ...)
  style themselves by OWNER CONTEXT (`:state(in-card)` via `PartComponent`).
  NEVER `ui-card-header`
  (and no `:host-context`:  WWOD §18 › "Reach into `ui-*` elements through `::part()` and tokens").
- Events:  `CustomEvent`s, `bubbles: true, composed: true`, lowercase kebab `ui-*` names (`ui-change`, `ui-open`);
  `detail` carries computed state (`{ value }`, `{ open }` ...) plus `originalEvent`.
- Rich data (`options`, `rows`) as JS PROPERTIES --
  real accessors on the class, so frameworks find them with `key in el`.
  - Primitives as REFLECTED attributes.
  - First paint MUST NOT need a rich property (SSR drops them).
- Vocabulary files own every name:
  NEVER a string literal for one of OUR attribute / event / slot / part names in a template or `ClassBuilder` --
  read it through the component's vocabulary.
  A PLATFORM name (`aria-label`, `click`, `slot`, `role="list"`) is written inline ("Functions & types").
- Class defaults:  as WWOD §12 › "`@proto static` defaults", plus:
  vocabulary, default settings and part names are `@proto static` (from `$/ui/util`),
  so instances carry no per-instance copies.
- Libraries:  `lodash-es` only (tree-shakes).
  Any other runtime dependency:  WWOD §2 › "Ask before adding a dependency".
- Platform:  what's assumed (anchor positioning, no JS fallback ...)
  and what's flagged through `UI.browser.supports` (Safari's gaps):  WWOD §18 › "Modern CSS".

## CSS

As WWOD §18, plus:

- Units:  sizes derive from px-valued `--ui-font-size` (default `16px`) and `em` inside components
  (no `rem`:  WWOD §18 › "No `rem`").
- Sizes are ratios of 16.  `medium` is a real size meaning "default" -- a no-op that emits no class.
- Layers:  `@layer ui.reset, ui.tokens, ui.base, ui.components, ui.utilities, ui.theme, ui.app;`
  - inside `ui.components` each component declares sublayers `types, content, variations, states`,
    so states beat variations without `!important`
- Global sheets:  `src/styles/`, one file per axis (tokens, colours, sizes, typography, utilities),
  in `@layer` order, `layers.css` FIRST (`layers.css`'s header).
- ONE generic rule set for every hue and size,
  switched by token remap (`--ui-color`, `--ui-scale`;  WWOD §18 › "Keep CSS DRY"), not per-hue rules.
- NEVER declare a public component token (`--ui-<tag>-*`) in a component sheet:
  declare its private alias (`--_ui-button-radius: var(--ui-button-radius, var(--ui-radius))`) and read the alias,
  so values set on the page, an ancestor, the element or `::part()` reach the box.
  - Owner switches are private (`--_ui-card-layout`).
  - See `docs/theming.md` "Component tokens";  `test/componentTokens.test.ts` enforces it.
  - Two private shapes, on purpose:  `--_ui-<tag>-*` is a public token's ALIAS;
    `--_<tag>-*` (`--_button-*`) is variation plumbing no page sets.
    NEVER rename one into the other (epic `wwod-spell-ui`, Q13).
- WWOD §18 › "Naming" (PascalCase root classes, nested parts) is for app sheets:
  shadow sheets keep Fomantic's class grammar (`.ui.small.button`), "UI rules" above.
- Breakpoints:  `@custom-media` only (`src/styles/media.css`), never a bare px media query
  (WWOD §18 › "Check at phone width").
- Utilities (`src/styles/utilities.css`, `docs/theming.md` "Utilities"):
  named in the grammar `ui-<property>-<modifier>` (`ui-text-truncate`, `ui-gap-m`),
  `:` for variants (`ui-split:column`).
  - `-ish` suffix ~== "looks like X but isn't one":  `ui-button-ish`, `ui-link-ish`.

## Solid authoring

- Solid's own rules (no writes in an owned scope, staged writes, two-function effects, eager memos):
  SEE:  `guides/solid/solid-2.md`.  Below:  only what's `ui`'s own.
- A tag's COMPONENT is a class `UI<Name> extends UIComponent<typeof nameVocabulary>`
  (or `FormComponent`, `PartComponent`):
  `@proto static vocabulary`, `@protoMerged static elementSetup` (what differs from its base:
  `styleSheets: { nag: nagCSS }`, `DOMElement: DOMNagElement`, `delegatesFocus: false`,
  a form control's `Fallback` ...),
  reactive members (below), `render()` returning JSX.
  - The DOM element creates one on its first connect and keeps it (`keepAlive`) until `domElement.dispose()`.
  - `UI<Name>.define()` in the family's `index.ts` registers it.
- A FORM CONTROL (`F.FormComponent`) inherits what every control needs:
  - `isDisabled` (`disabled` or a disabled fieldset, with its class;
    `elementSetup.disabled` is `"its own"`:  each control disables its native control)
  - `isReadOnly` (`readonly`, `:state(readonly)`;
    every form vocabulary declares `readonly`, each control refuses changes its own way)
  - `labels` (`ControlLabels`, refreshed on connect), `isTouched` (set by `invalid`, cleared by a reset),
    `formName` (`name`), the `required` rule
  - a click on the DOM element itself calling `activateControl()`
  - NEVER copy one of them into a control:  override a hook instead (`activateControl()`, `validationRules`),
    or set `@E.proto static invalidShows = "once touched"` (`FormComponent`'s header).
- SHARED STATES (`UIComponent`, "Shared states";  epic `spell-element` P8):
  every element takes `disabled`, `loading` and `visible`, though its vocabulary never names them
  (`SharedVocabulary` adds them to its `ElementDefinition`, its docs data and its manifests),
  and the platform's `hidden` and `inert`.
  NEVER declare them in a vocabulary just to get them;  a vocabulary that declares one keeps its own spec and meaning
  (`<ui-sidebar visible>` starts hidden, `<ui-reveal visible>` stops clipping).
  - `disabled`:  `:state(disabled)` always (`isMarkedDisabled`:  the attribute, or a disabled fieldset);
    the rest is `elementSetup.disabled`:
    - `"unusable"`, the default:  `isDisabled`, so clicks are swallowed, `aria-disabled`,
      everything inside inert and dimmed, focus inside moves on (`UI.focus.moveOutOf()`)
    - or `"its own"`:  the family's code says what it means.
      A form control, `<ui-button>`, `<ui-step>` disable their own control and override `isDisabled`;
      `<ui-icon>`, `<ui-text>` only dim (text stays findable);  `<ui-transition>` pauses.
      Only where it means more than a look, or inert would hide text (P11, T9):
      a Fomantic look alone (`<ui-segment>`, `<ui-label>`, `<ui-section>` ...) is unusable
  - `loading`:  `:state(loading)` always (`isMarkedLoading`, `true` only);  the rest is `elementSetup.loading`:
    - `"loader"`, the default:  `aria-busy`, everything inside inert and dimmed, a spinner over it, `:state(busy)`
    - or `"its own"`:  `<ui-button>`'s spinner, `<ui-segment>`'s veil, `<ui-root>`'s message
  - `visible="false"`:  animates the element out (`elementSetup.visibleAnimation`, default `"fade"`,
    through `UI.transitions` on the shadow root's boxes), then `:state(hidden)`;
    `visible` / `="true"` animates it back.
    - At once before it first draws.
    - `el.visible = false` reflects as `visible="false"` (a `true` default)
  - `hidden`:  instant, before scripts and in the static render;
    `reset.css` makes it beat a family's own `:host { display }` (unlayered);  both set, `hidden` wins.
    `<ui-divider hidden>` keeps Fomantic's meaning
  - `inert`:  the platform's, left UNSTYLED:  families set it on boxes with a look of their own
    (`<ui-form loading>`'s veil), and overlays on what they cover (`<ui-pushable>` on its pusher),
    so a generic dim would double up
  - the base class's look is in `reset.css` (every shadow root adopts it):
    the dim keys on `:state(dimmed)` (`disabled` or `loading` the base class's way;  the shadow root's top-level boxes),
    the spinner on `:state(busy)`, the hiding on `[hidden]` / `:state(hidden)`;
    the static render maps them through `data-state` and ARIA (`StaticStylesheet`'s unlayered `HIDDEN`)
- **Reactive members** (`src/elements/Reactive.ts`;  WWOD §12 › "Reactive members"):
  decorators over ONE record per instance, so `this.x` reads fresh right after `this.x = v` (no flush),
  and Solid follows the reads in JSX and effects.  The decorator says how the member works:
  - `@E.state accessor isOpen = false` -- the element's own state (`{ equals }`, `{ ownedWrite }` when needed).
    Replaces a `Cell` field and its `.get()` / `.set()`.
  - `@E.controlled("open") accessor isOpen = false` -- the DOM element's property when set, else the starting value;
    a write goes to the DOM element's property.
    - A user change:  `this.requestChange("isOpen", next, () => this.send(...))`;  `isControlledByPage("isOpen")`.
  - attributes:  a getter per vocabulary attribute, `this.size` (converted, fresh), made by `register()`;
    the class declares them for TypeScript, below the class:
    `export interface UIButton extends E.AttributeValues<typeof buttonVocabulary> {}`.
    - A write (`this.indeterminate = false`) sets the DOM ELEMENT's property
      under the tag's own name for it (a translated tag's too), so it reflects.
    - A member with an attribute's name wins over its getter (and TypeScript flags a type clash),
      so name members for what they are (`isOpen`, not `open`);
      a BASE class never takes a name any vocabulary uses
      (`elementDefinition`, `validationRules`:  `UIComponent`'s doc, "Member names").
    - Attributes outside the vocabulary, or a vocabulary attribute's raw text:
      `this.attributes["aria-label"]`, `this.attributes.value` --
      the DOM string or `null`, by CANONICAL name (a translated tag reads its own).
    - Replaces `this.attrs.x` and `HostAttribute`.
  - `get x()` -- a derived value:  a plain getter, fresh by construction.
    - `@E.derived get x()` only for real work (loops, parsing, class strings, new DOM):
      a self-tracking cache, NOT a Solid memo
      (a memo hears of a change through a staged signal, so it reads stale right after a write).
    - It records the version of every record member it reads and recomputes on read when one moved.
    - It MUST read only record members (`@state`, `@controlled`, attributes, other `@derived`):
      a `Cell`, a memo, `UI.browser` or a module global can't be seen changing outside Solid --
      move it into the record, or keep a plain getter.
    - `@E.derived({ equals: E.isSameList })` keeps the old value while an equal one is computed
      (a filtered list keeps its identity).
  - `@E.cssState("open")` on a getter or accessor -- `:state(open)` follows it;
    `cssStates()` only for a computed set.  Replaces the old `hostStates()`.
    - A state that only mirrors its attribute, under the same name:
      `@E.cssStates("loading", "fluid")` on the CLASS, no getter (TypeScript flags a name the class has no member for).
      Keep a getter (with `@E.cssState`) when something else reads it:
      `isDisabled`, a base class's hook (`CheckControl.isIndeterminate`), an effect.
    - For a state two classes of the chain name, the subclass's member wins.
  - `@E.aria("ariaBusy")` on a getter or accessor -- the DOM element's `internals.ariaBusy` follows it:
    `true` => `"true"`, `false` / `undefined` => removed, text as is.
    - `@E.aria("role")`, `@E.aria("ariaLabel")` ...;
      stacks with `@E.cssState`, a decorator a line
      (`@E.cssState("loading")`, `@E.aria("ariaBusy")`, `get isLoading()`).
    - One effect per element writes them all;  a server render applies it once.
    - The subclass's member wins here too.
    - ARIA that never changes:
      `elementSetup.aria` (`{ role: "listitem" }`, `{ role: "status", ariaLive: "polite" }`),
      set once as the component is built, no effect.  An `@E.aria` member for the same property wins once it runs.
  - `@E.onChange("a", "b") onXChanged(a, b)` -- an effect reading the members, calling the method with their values;
    a function it returns is the cleanup;  `{ writesDOMElement: true }` applies once on a server,
    for a method that writes the DOM element beyond ARIA (`:state()`, `tabindex`).
    - Created in `onMount()`, after every field exists.
    - The method runs untracked:  only the members it names re-run it, so its other reads need no `untrack()`.
    - Runs only when a member's VALUE changed (`===`, member by member):
      a getter member tracks the sources under it, and Solid 2 applies an effect on every re-run of its compute,
      so `startEffects()` puts a memo with `equals` in between.
    - An effect that used to live in `render()` names `isReady` too and returns early until it's true,
      keeping that timing (`UIShape`, `UISidebar`, `UISection`).
    - `{ defer: true }`:  not called at the start, only on a change (`<ui-progress>`'s `ui-change`).
    - A page-wide value, or one an attribute alias holds:  a getter member over it, named in the list
      (`UIEmoji.rootSettingsGeneration`, `CheckControl.checkedAttribute`);  `protected`, as `@E.on` methods are.
    - A method may read the members itself instead of taking their values (`UIMarkdown.onMarkdownChanged()`).
    - Conditional, per-item or object-building effects stay explicit `createEffect`s in `onMount()`,
      each with its disable comment ("The lint guard").
  - `@E.whileConnected watchX()` -- runs each time the element connects;
    a function it returns is the cleanup, run when it disconnects.
    - Sugar over `@E.onChange("isConnected")` for a listener or observer
      on `window`, the document or the light DOM that must stop while the element is out of the page.
    - Never on a server.
  - `@E.fromContent({ childList: true, subtree: true }) get slotted()` --
    a member read from the DOM element's light DOM, recomputed when what the options name changes
    (`MutationObserver`'s `childList`, `subtree`, `characterData`, `attributes`, `attributeFilter`;
    `equals` as `@E.derived`'s).
    - Readers hear of it only when the VALUE moved, so a reader writing the light DOM can't loop.
    - Watching starts on its first read in a browser;  on a server it's computed once.
    - On a METHOD:  the method is called with the mutations on each change (not at the start), from `onMount()` on,
      for a change that writes other members (`UIAccordion`'s panels).
    - ONE `MutationObserver` per instance, stopped when the DOM element is released (NOT on disconnect).
    - Replaces an `onSettled()` + `MutationObserver` + `this.x = this.scan()` block.
    - Its options are read while the class is defined:  a module constant they name goes ABOVE the class.
    - Stays hand-written:  a watch on another element (a parent, a changing table),
      one only while connected (`UIForm`) or only while a setting holds (`UIVisibility`'s images),
      and helper classes with their own element (`SlotContent`, `SlottedItems`).
  - `this.$.isOpen` -- an `Accessor` of any member, for Solid APIs that take one;  everyday code reads `this.isOpen`.
  - `@E.on("command") protected onCommand(event)` -- a listener on the DOM element for the element's whole life:
    `UIComponent`'s constructor adds each through `this.on()` (browser only),
    and it's removed when the DOM element is released.
    - The method runs untracked.
    - `@E.on("slotchange", { target: "renderRoot" })` listens on the shadow root;
      the other options are `addEventListener()`'s.
    - A plain method, not an arrow-function field, and `protected`:  TypeScript calls a `private` one unused.
    - Replaces a constructor calling `this.on(type, this.handler)`.
    - `this.on(type, listener, { target })` itself for a listener added later or under a condition.
      - So no vocabulary may name an attribute `on`
        (Fomantic's `on` setting is `<ui-form validate-on>`, `<ui-dimmer show-on>`, `<ui-popup open-on>`).
      - One stopped by an effect keeps its own `AbortController`, aborted in the cleanup.
  - `@E.untracked select(option)` -- an action or handler whose body runs inside `untrack()`:
    it reads `this.x` plainly where it used to read `untrack(() => this.x)`.
    - Also on an arrow-function field handed to JSX
      (`@E.untracked private readonly onKeyDown = (event: KeyboardEvent) => { ... }`),
      and on a getter read to act on, never to follow (`@E.untracked private get cssDuration()`),
      a DOM element's script API over its component too
      (`@E.untracked get errors() { return this.component?.errors ?? [] }`).
    - NEVER on a method a computation calls to follow its reads (a getter's helper, JSX, an effect's first function):
      e.g. `UIMenu.itemContext()` stays half-tracked on purpose.
    - `@E.on` and `@E.onChange` methods need none.
    - Nor do the constructor, field initializers and `render()`'s body:
      every component is BUILT inside `untrack()` (`UIComponent.mount()`, the static render),
      and `render()` runs once, untracked (`UIComponent.onMount()`).
  - A `disabled` that is only a LOOK:  the default, `"unusable"`, unless inert would hide text a reader needs
    (`<ui-icon>`, `<ui-text>`, `<epic-note>` ...:  `elementSetup.disabled = "its own"`, and the sheet dims it);
    `:state(disabled)` comes from `UIComponent` ("Shared states" above), so no `@E.cssStates("disabled")`;
    ARIA of its own, if any, on a getter (`@E.aria("ariaDisabled") get looksDisabled()`).
    Never an `isDisabled` override (the DOM element swallows clicks while `isDisabled`).
  - Element-core files import the decorators directly (`import { state } from "./Reactive"`:
    their class definitions read them);  component files use `@E.state` (and `@E.proto`).
  - Measured (P14 step 1):  1,000 `<ui-divider>`s build in 33 ms (32 before), 1,000 `<ui-button>`s in 100 ms (130).
- Imports in component files (components, DOM element classes AND `UI<Name>.fallback.ts`):
  shared code ONLY from `$/ui/core` (and `$/ui/forms` for form controls),
  never `$/ui/util`, `$/ui/vocabulary`, `$/ui/elements` ... directly;
  the family's own vocabulary, fallback, helpers and sheet as peers (`./UIButton.en`, `./UIButton.css?inline`).
  - Why:  the lib build puts everything `$/ui/core` re-exports into `dist/core.js`;
    a leaf imported by a family AND by `core` splits into a hashed third chunk.
  - For the same reason `core.ts` / `forms.ts` re-export `$/ui/elements` LEAVES,
    and every `forms` file imports the core through `$/ui/core` (`yarn measure`'s checks catch a violation).
  - Through namespaces, WWOD §4 › "ONE namespace per sub-system":
    `import { E, UI, UIT } from "$/ui/core"` (+ `import { F } from "$/ui/forms"`), then `E.UIComponent`,
    `@E.proto`, `UI.browser`, `UIT.FLUID`, `F.FormComponent` ("Types / Exports").
    - NEVER a bare shared name.
    - Measured (epic `wwod-spell-ui`, Q4):
      family chunks come out byte-for-byte the same (Rolldown turns `E.Cell` back into a plain import);
      `core` pays ~0.8 kB gzipped for the `E` object.
  - The element core (`src/elements/`) too, though `core.ts` / `forms.ts` re-export its own files:
    `import { E, UI, UIT } from "$/ui/core"` (the `forms` files also `import { F } from "$/ui/forms"`),
    then `E.Cell`, `E.Warnings`, `E.flatParentFor()`,
    never named imports from `./elements.types`, `./Cell`, `$/ui/util`, `$/ui/runtime` ...
    - EXCEPT what a module reads while it EVALUATES -- the base class in `extends`, a decorator (`@proto`),
      a static initializer (`static readonly generation = new Cell(0)`):
      that's a direct import from its file, under `// Import directly to avoid circular import`
      (WWOD §4 › "Circular imports").
    - Instance fields, method bodies and types go through `E`.
    - `elements.types.ts` stays `import type` only (`import type { E }`).
    - The `forms` files are the exception's exception:  `extends E.UIComponent` / `@E.proto` are fine there,
      since the core never imports `forms` and has always finished loading first;
      a `forms` peer a class definition reads (`FormComponent`'s `DOMFormControl`, `Validator`) is still direct.
    - `src/elements/barrel.test.ts` checks every export of both entries is live;
      NEVER import an element-core leaf by path (`$/ui/elements/UIComponent`):  entering the cycle there breaks it.
- **Eager memos and overridables:**  a memo that calls overridable members takes `{ lazy: true }` (or is a getter);
  effects that read them are created in `onMount()` (or are `@onChange`), after every subclass field exists.
- **Field order:**  class fields (`accessor`s too) initialize in declaration order,
  before the subclass constructor body.
  Declare state ABOVE what reads it in an initializer;
  compute a starting value into the initializer (`@E.state accessor isDirty = this.wasEdited !== undefined`).
- **Where writes go:**  `render()` is an owned scope:  no writes there.
  - Write from event handlers, `onSettled`, promise callbacks, `@onChange` methods (an effect's APPLY)
    or the lifecycle methods;  those that can run inside a Solid render
    (`onConnect`, the `onFormDisabled` replay) defer with `E.afterSolidUpdate()`.
  - Element PROPERTY writes are always legal.
  - A reactive member's write never throws:  inside an owned scope its notification waits a microtask.
  - A reactive member reads fresh right after a write;  a `Cell` still reads the OLD value until the flush:
    keep the new value in a local.
    Tests `await ElementFixture.settle()` / `tick()` (which `flush()`) before checking the DOM, never sleep.
- **Running something later:**  through `$/ui/util`'s timing helpers (`src/util/timing.ts`),
  never the platform's calls, so the code says WHEN:
  - `E.afterSolidUpdate(fn)` -- as soon as the current code finishes (a microtask:  `queueMicrotask()`)
  - `E.beforeNextPaint(fn)` -- just before the next paint (`requestAnimationFrame()`)
  - `E.soon(fn)` -- the next task (`setTimeout(fn, 0)`)
  - `E.after(seconds, fn)` -- once, in SECONDS:  a promise of `fn`'s result, with `cancel()` (`setTimeout()`)
  - `E.every(seconds, fn)` -- until stopped (`setInterval()`)
  - Each but `afterSolidUpdate()` can be canceled:
    keep what it returns in a field, to cancel a pending one (`this.copiedTimer?.cancel()`).
  - Raw calls stay only in the helpers themselves and tests.
- **Events:**  dispatch through `this.send("ui-change", detail)` (vocabulary-checked, localized on translated tags).
  - Listen on the DOM element (or its shadow root) with `@E.on("command") protected onCommand(event)`,
    for the element's whole life, untracked ("Reactive members");
    `this.on()` for one added later or under a condition.
  - Inside a component, `onClick={...}` for native events
    (no `on:` namespace;  rich data as `prop:options`:  `solid-2.md` "DOM and `@spell-app/ui` elements").
  - A THIRD-PARTY Solid app listening for `ui-*` events uses a `ref` callback + `addEventListener`
    (`tools/frameworks/solid/app.tsx`);  our app:  WWOD §17 › "Events:  `onClick`, or `on()` for `ui-*`".
  - Listeners OUTSIDE a component see `event.target === domElement` (`composedPath()[0]` is the inner element),
    and an app's delegated `onClick` on a `ui-*` tag runs once.
    `ShadowEvents` guarantees it by undoing what Solid's shadow-root delegation leaves on the event
    (`target`, `currentTarget`, its handled marker);
    NEVER work around a wrong `target` in a component -- fix it there.
- **`keepAlive`:**  a removed element keeps its reactive root (until `dispose()` or garbage collection),
  so anything page-wide (overlay entries, document listeners) follows `isConnected`, never disposal.
- **Slots carry no Solid context:**  an element's root is owned by whoever CREATED it,
  never by the `<slot>` it's assigned to (epic `spell-element`, Q8).
  So a `<slot>` may live in any `<Show>` / `<Dynamic>` branch, but context provided around it never reaches
  slotted elements:  owner data goes through `PartContext` / `OwnerContext`.
- **Native fallback:**  when a render throws, the element logs once, dispatches a cancelable `ui-error`,
  gets `:state(errored)` and shows its fallback;  siblings keep working (`docs/fallback.md`).
  - Only FORM CONTROLS have a fallback of their own
    (`Fallback: <Name>Fallback` in `elementSetup`:  plain DOM on `NativeFallback`, same class grammar, no Solid),
    so a broken control still submits its value, validates and resets:
    button, input / textarea, checkbox / radio, dropdown, select, search, calendar, slider, rating;
    brand's colour picker and composer.
    The list and why are in `docs/fallback.md`
    (Owen, epic `wwod-spell-ui` P15:  "ditch the fallback stuff unless it's necessary for e.g. form functionality").
  - Every other family has none:  a broken element shows a bare `<slot>`, so its children still show.
- **Hot reload** (`yarn dev`):  edits to a family's components, vocabulary, fallback or sheet
  update live instances in place;  internal state (a query, an open menu) resets.
  - Changes the platform reads once (observed attributes, `formAssociated`, the DOM element's class, shadow options)
    and edits to shared code (`core`, `forms`, `src/elements/`, the runtime) reload the page.
  - `yarn test:hmr` MUST pass after touching `HotDefinitions`, `UIComponent.define()`
    or `tools/HotElements.ts` (the Vite plugin).
- **One Solid per page:**  every Vite config dedupes `solid-js` / `@solidjs/web` (`SOLID_DEDUPE`);
  NEVER `import * as` a Solid package in shipped code (it pins every export into bundles and vendored copies).
- SSR:  anything that reads the DOM in a constructor needs an `isServer` guard (`test/ssr.ssr.test.tsx`).
  - Static render (`$/ui/static`):  as WWOD §12 › "Brand checks only where `instanceof` can't work", plus:
    DOM elements are linkedom elements,
    so NEVER `instanceof Element` / `Node` / `ShadowRoot` / `HTMLSlotElement` in shared code
    (node has no such globals):  `nodeType`, `localName`.
  - An effect whose APPLY writes the DOM element is an `@E.aria` member (`internals.role`, ARIA)
    or `@E.onChange(..., { writesDOMElement: true })` (states, `tabindex` ...):
    the server build never runs an apply, so a plain `createEffect` leaves the static output without it.
    Constant ARIA:  `elementSetup.aria`.
- **The lint guard** (`spell-ui/*`, epic `spell-element` P10):  `yarn lint` holds component files to the above.
  - Where:  the component folders of `ui` (`src/components/`, `src/docs-components/`), `epics` (`components/`) and
    `brand` (`components/`), as the root `vite.lint.ts`'s `PATTERN_FOLDERS` lists them.
    NOT `app` (WWOD §17's function components), NOT the element core (`src/elements/`), NOT tests.
  - What it flags, each message naming the decorator or helper to use instead
    (the rules:  `vite.lint.patterns.ts` at the repo root):
    - `no-solid-effect`:  `createEffect`, `createRenderEffect`, `onSettled`, `onMount` imported from `solid-js`
    - `no-mutation-observer`:  `new MutationObserver(...)`
    - `no-dom-element-listener`:  `addEventListener` on `this.domElement` (or a `domElement` local)
    - `no-untrack`:  `untrack(...)`
    - `no-raw-timer`:  `setTimeout`, `setInterval`, `queueMicrotask`, `requestAnimationFrame`
    - `no-function-component`:  an exported PascalCase function drawing JSX
  - A use that has to stay says why, on the line above, same rule for every package:
    `// oxlint-disable-next-line spell-ui/no-mutation-observer -- watches its PARENT, another element`.
    - And goes on the allow-list in `tools/LintPatterns.test.ts`, with the same reason:
      the test fails on a disable comment the list doesn't name, so every exception is seen in review.

## Component packs

- A COMPONENT PACK is another package's custom elements (with any tag prefix, `epic-`, `x-` ...),
  loaded on demand by `<ui-root>` like Spell UI's own
  (epic `epic-components` P1;  restated in `wwod-spell-ui`'s names when `main` merged in, 2026-10-08,
  in place of `wwod-spell-ui` P12's JSON packs):
  `<ui-root><ui-components source="epics.pack.js"></ui-components><epic-page>...</epic-page></ui-root>`.
- The pack is ONE classic script (works from `file://`),
  built by `spell dev pack build` (`packages/cli/src/dev/packBuild.ts`),
  that calls `SpellUI.registerPack({ name, prefix, catalog, define })` as it runs.
  - `catalog` has `ROOT_CATALOG`'s shape (`RootCatalogEntry`, a folder and a parsed skeleton),
    read from the pack's `<Name>.en.ts` vocabularies by `tools/RootCatalog.ts`,
    as `yarn gen:root` reads ours (skeleton text, "Overview");
    `prefix` ends in `-`, is never `ui-`, and starts every catalog tag.
  - A pack's families are written like ours (`packages/epics/AGENTS.md`).
- The `ui-components` family (`src/components/ui-components/`) holds the runtime side:
  - `<ui-components source>` (`UIComponents`):  invisible, no logic, no fallback;  the root reads its `source`.
    The root's barrel imports the family, so it's always defined with the root
  - `ComponentPacks` (static, one per page):
    `load(source)` adds a `<script>` once per resolved URL (an already registered name resolves at once);
    `register()` finds its load by `document.currentScript`,
    else by the name the file implies (`epics.pack.js` => `epics`),
    calls `define()`, then adds the catalog and prefix;  `entryOf()`, `owns()` for the root
  - a `define()` may return a promise (it imports its families first):
    the load resolves once that settles, so the root waits for the tags.
    `packages/app`'s `spell.pack.js` (`<spell-app>`, `<spell-editor>`) imports two ES modules that way,
    built by Vite, not `spell dev pack build` (`packages/app/AGENTS.md`, `components/`)
  - a pack's events keep their own names (`spell-open`):
    only Spell UI's `ui-*` ones take a translated tag's prefix (`Vocabulary`, `docs/translation.md`)
  - `registerPack()`:  exported from `$/ui` (`@spell-app/ui`) and the family's barrel;
    the docs bundle puts it on `window.SpellUI`
- The root (`UIRoot`, `RootLoader`):  its first settle round also waits for its packs;
  `RootLoader.undefinedTags()` / `entryOf()` know registered prefixes and catalogs;
  skeletons are found again when a pack registers (its catalog arrives WITH it:  nothing to draw before);
  a pack that fails or times out is a `RootFailure` `{ tag: "ui-components", reason, source }`
  (`ui-error`, `ui-ready`'s `failed`) and a console ERROR naming the `source` (`Warnings.error()`),
  and the root still gets ready.
- Modules a pack shares with the page are `SpellUI.packModules`:
  the EXACT specifier its build leaves external => the page's module
  (`solid-js`, `@solidjs/web`, `$/ui/core`, `$/ui/forms`).
  - Built in the docs bundle's entry (`packages/docs/tools/_assets/spell-ui.entry.js`), NOT in `ui`:
    the one place a Solid package is `import * as`'d, on purpose ("One Solid per page" above:
    a pack may use any export, so they must all stay).
  - A new specifier goes there AND in the pack build's externals.
  - So a pack's elements extend the page's own `UIComponent` / `DOMElement`.
- Tests are in `src/components/ui-components/ComponentPacks.test.ts`,
  on the classic fixtures in `test/fixtures/component-packs/` (served by Vitest's dev server).

## Decorators

As WWOD §12, plus:

- `vite.decorators.ts` (repo root) is used by `vite.config.ts`
  (`baseConfig()`, shared with `vitest.config.ts` and the site bundle's `vite.site.config.ts`).
- The decorator pre-pass MUST run BEFORE the Solid plugin (both are `enforce: "pre"`;  `baseConfig()` orders them):
  the Solid compiler must see decorator-free code.
- It lowers `accessor` fields too (`@E.state accessor x`),
  and keeps decorator metadata (`Symbol.metadata`, or esbuild's `Symbol.for("Symbol.metadata")`),
  which `@cssState` / `@onChange` record their lists in.

## Types / Exports

As WWOD §8, plus our self-namespaces (one per lib entry, since each entry is its own bundle):

- `E` ~== `$/ui/core`:  the element core and the foundation (`E.UIComponent`, `E.proto`, `E.Cell`, `E.Converters`)
- `F` ~== `$/ui/forms`:  what only form controls need (`F.FormComponent`, `F.MenuOptions`)
- `UI` ~== the runtime singleton from `$/ui/runtime`:  an instance, read like an app singleton, never through `E`
- `UIT` ~== `$/ui/components/components.types` -- the constants, types and `ToggleCommands` several families share:
  `UIT.FLUID`, `UIT.Key.enter`, `UIT.ToggleCommands.action(...)`, `UIT.SelectValue`.
  Exported from `$/ui/core` and `$/ui`, never flat, never through `E`
- `V` ~== `$/ui/vocabulary`, namespaced through `vocabulary.api.ts` from the `api` entry only (why:  that file's header)
- `SSR` ~== `$/ui/static` (node only)
- the components barrel exports classes by name (`UIButton`, `UIDropdown`), no namespace

## Imports

As WWOD §4, with `$/ui` / `$/ui/*` as our alias (`$/ui/test/*`, the test helpers, is longer than `$/ui/*`, so it
wins), plus these deliberate EXCEPTIONS:

- Component files import shared code from `$/ui/core` / `$/ui/forms` only, as `E` / `F` / `UI` / `UIT`
  ("Solid authoring").  Folder peers stay direct imports (`./UIButton.types`), one statement per module.
- The element core (`src/elements/`) imports itself the same way, through `E` / `F`, NOT its peers:
  only what a module reads while it evaluates comes from its file directly ("Solid authoring").
- Vocabularies and types files value-import `UIT` as `import * as UIT from "$/ui/components/components.types"`,
  not through `$/ui/core`.
  Why:  they're PURE DATA that node imports (`yarn site:data`, `yarn gen:root`),
  and `core` loads the element layer, which node can't ("Overview", `UI<Name>.types.ts`)
- What sits BELOW `core` -- `$/ui/runtime`, `$/ui/vocabulary`, `$/ui/icons`, `$/ui/util`, types files --
  NEVER imports the `$/ui/core` entry:
  shared helpers by name from `$/ui/util` (no namespace of its own), `UIT` as above.
  Why:  `core` re-exports the runtime's loader, so a lazy runtime chunk importing the entry
  makes Rolldown split the modules both reach into a chunk every page loads
  (epic `wwod-spell-ui`, I16;  `yarn measure` catches it).
- `tools/` are node scripts:  relative imports with `.ts` extensions, no aliases.  Two exceptions:
  - another package by its alias
    (`$/server`:  `tsx` resolves the paths;  `../../server/src` would be a `../` across packages)
  - PAGE scripts Vite serves or SSR-loads
    (`tools/demo/*.ts`, `tools/visual/fixture.ts`, `StaticFixture.ts`, `StaticDocument.ts`)
    import `ui` through `$/ui/...` (`SSR` for `$/ui/static`), as `src/` does, and `tools/` peers relatively.
- `scripts/` likewise:  relative imports with `.ts` extensions
  (`../tools/Terminal.ts`, `../src/styles/StyleGenerator.ts` -- a leaf file, never a barrel with `?inline` CSS),
  no aliases;  peers after a blank line (`./generatedFiles.ts`).

## Comments & docs

As WWOD §6, plus:

- An override that only FILLS a hook its base class documents (`render()`, `cssStates()`, a fallback's `build()`)
  needs no docstring;  one that adds to the base's contract says what it adds:
  `/** Disabled by its attribute, or by a disabled fieldset. */`.
  The base class documents each hook once (epic `wwod-spell-ui`, Q3).
- Likewise `@proto static vocabulary` / `vocabularies` / `degraded`
  and `@protoMerged static elementSetup` (its keys on `ElementSetup`):
  documented once, with why they're static, on `UIComponent` / `NativeFallback`.

## Functions & types

As WWOD §9, plus:

- A SET of related values (close reasons, key names, positions, modes) is a const array + type:
  `ToastCloseReasons` + `ToastCloseReason`.
  A single vocabulary word (a class word, a part name) stays a named ALL-CAPS constant,
  under a `// ##` group in its types file (epic `wwod-spell-ui`, Q2).
  - A PLATFORM string is API, not data:  write it inline;
    TypeScript checks many of them (WWOD §9 › "Named string constants + `typeof` types").
    No `UIT.ARIA_LABEL`, no `RESET` (Owen, 2026-10-08, epic `wwod-spell-ui` P17):
    - HTML attribute names and values (`"aria-label"`, `"tabindex"`, `"true"`, `"reset"`)
    - ARIA roles and states (`role="list"`, `aria-current="page"`)
    - DOM event types (`"click"`, `"focusout"`), tag names (`"div"`, `"slot"`)
    - pseudo-classes (`":popover-open"`), platform CSS property names (`"anchor-name"`)
  - Still constants:  our own vocabulary names (`ui-*` attributes, events, parts, slots, states),
    Fomantic class words, tokens, data keys.
    - A word that is both is inline where it's the platform's, a constant where it's ours
      (`"vertical"`:  `aria-orientation="vertical"`;  the toast's `VERTICAL` class word).
    - Key names (`UIT.Key.enter`) stay one map (epic `wwod-spell-ui`, P2).
  - A MAP of words or tokens is a PascalCase const object (WWOD §9 › "Const object + `keyof typeof`"):
    `UIT.PusherTokens.dimmed`, `UIT.TransitionCommands.show`;
    a shared vocabulary table too (`...UIT.SourceAttributes`).
    - A frozen pair stays ALL-CAPS (`UIT.TABLE_SORT_OPT_OUT`, WWOD §9's frozen singletons)
      (epic `wwod-spell-ui`, J12, undoing J50's churn-only keep).
- Values are English where they're only ours (`"file protocol"`);
  values a page or CSS reads (an event's `detail`, `data-ui-animation`, a vocabulary's attribute values)
  keep their published spelling.
- `null` only at platform boundaries:  `getAttribute()`, `setFormValue()`, `useContext`'s default.
  Everything of ours is `undefined` (epic `wwod-spell-ui`, Q9).

## Classes

As WWOD §12, plus:

- A class setting lives WITH ITS PROPERTY GROUP:  its `declare` and its `@proto static` default side by side,
  in the `////` section of the code that uses it (`UIComponent`:
  `elementSetup` under "Element setup", `vocabulary` under "Vocabulary").
  - Owen's "locate code near its siblings" (epic `wwod-spell-ui`, Q11),
    superseding "`@proto static` defaults at the TOP".
  - A subclass that only SETS settings (`@proto static vocabulary = ...`) still lists them first, before its members.
  - Per-class settings of the custom element itself are keys of ONE setting, `elementSetup` (type `ElementSetup`),
    MERGED down the class chain, base class first, by `@protoMerged` (`$/util`, as `E.protoMerged`):
    style sheets, form control, focus, slots, part, DOM element class, fallback, unstyled first paint,
    constant ARIA, and what the shared `disabled`, `loading` and `visible` do for it.
    A subclass states only the keys it changes:
    ```ts
    @E.protoMerged static elementSetup = { styleSheets: { nag: nagCSS }, DOMElement: DOMNagElement } satisfies Partial<E.ElementSetup>
    ```
    - `this.elementSetup` (`Class.prototype.elementSetup` from outside) is the merged result;
      the static `Class.elementSetup` only what that class stated.
    - A base class that others extend types its own as `Partial<E.ElementSetup>`:
      otherwise a subclass stating other keys fails TypeScript's check of the class's static side.
    - Every other class ends its literal with `satisfies Partial<E.ElementSetup>`:
      a misspelt key fails TypeScript, where an untyped literal would take it silently.
    - Keys merge one level deep:  a subclass's `styleSheets` REPLACE its base's whole;
      spread the base's to add to them:
      `styleSheets: { ...UISection.prototype.elementSetup.styleSheets, panel: panelCSS }`.
  - `vocabulary` stays a setting of its own.
  - Developer / debug switches (ALL-CAPS statics:  `UIComponent.ISOLATE_ERRORS`) stay at the top.
  - Other statics go after the main methods;  constants go below the class (next bullet).
- Constants (epic `wwod-spell-ui`, Q18:  bundle size over WWOD §12's `static` constants):
  - Used by ONE class:  a module `const` (not exported) BELOW the class, with its other helpers (WWOD §8),
    each with its docstring.
    Why:  a module `const` minifies to one letter;  a static's name (`t.LIST_SEPARATOR`) doesn't.
  - ABOVE the class only when something reads it while the class loads
    (a static initializer, a decorator argument, a static's computed key, a module `const` above):
    below, it'd hit the temporal dead zone.
    Say so in one line:  `// Above the class:  <static x> reads it while the class is defined`.
  - Used by SEVERAL files of the folder:  the folder's `.types.ts`.
  - Page-wide registries stay `private static readonly` + `static reset()`, as tests reset them
    (WWOD §15;  epic `wwod-spell-ui`, Q10);
    developer / debug switches stay ALL-CAPS statics at the top (`UIComponent.ISOLATE_ERRORS`).
  - A public static read from outside the class is API:  it stays.
  - Applies to `src/elements/`, `src/static/` and `src/runtime/` too, not only component folders.
- Render pieces of a component are private methods named for what they draw, no type word:
  `thumb()`, not `renderThumb()` / `thumbElement()`
  (WWOD §17's inner functions are for function components;  epic `wwod-spell-ui`, Q12).
- A component reads close to English (Owen, 2026-10-06, epic `wwod-spell-ui` P14):
  - its `////` sections are by PROPERTY or job, not by runtime phase:
    a member's state, getter / setter, what's derived from it, its handlers and `@onChange` methods together
    (`UIComponent`:  "Readiness and style sheets", "Classes", "Disabled";
    `LoadableComponent`:  "The text", "Loading", "Errors", "Saving")
  - the public API in code is getters / setters (`isDisabled`, `content`), not `getX()` / `setX()` functions;
    a method only when it takes arguments (`hasContent(name)`)
    or is an action that sends an event (`save()`, `requestChange()`)
  - booleans read as English (`isDirty`, `isSaving`, `delegatesFocus`, `isAFormControl`);
    handlers and moment callbacks are `on...` (`onMount()`, `onLoaded()`, `onError()`, `onFormReset()`);
    the two event verbs are short:  `send()` an event, `on()` to listen
- The constructor of `UIComponent` stays `(domElement, definition)`:
  `UIComponent.mount()` and the server render call it.

## Logging

As WWOD §19, EXCEPT the `Logger`:
`$/util`'s would add bytes (and colours only Chrome's console draws) to every component bundle
(epic `wwod-spell-ui`, Q5).  Instead:

- Every console warning goes through `Warnings` (`$/ui/util`):
  `Warnings.warn(source, message, ...data)` for what the page's author must fix,
  `Warnings.devWarn(...)` for advice in development builds only.
  - ONE format:  `[@spell-app/ui] <source>:  <what happened>`, then the data.
  - NEVER a bare `console.warn`.
- The two `console.error`s:
  `UIComponent`'s when an element's render throws (WWOD §19 › "`console.*` is reserved for"),
  and `<ui-root>`'s when a component pack didn't load (`Warnings.error()`:  a whole set of tags is missing).
- `tools/` and `scripts/` are node CLIs:  their output goes to `process.stdout` / `stderr`.

## Tests

As WWOD §20, plus:

- An element's tests describe as `describe("<ui-button> keyboard")`:  `ui`'s form of the call path.
  Helper classes use the call path (`describe("SliderScale.ratio()")`)
  and get their own test file beside them (epic `wwod-spell-ui`, Q8).

## Out of scope for WWOD

- Generated files (`src/languages/`, `md.bundle.js`, `site/_assets/`, `site/_data/`, `UIRoot.catalog.ts`):
  never edited, only regenerated.
