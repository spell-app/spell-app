# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/ui`.

**READ the repo root's `AGENTS.md` and WWOD (`agents/wwod/WWOD.md`) FIRST:**  the repo's layout, and the
house style every package shares.  Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- `@spell-app/ui` is Fomantic UI reborn as `ui-*` custom elements on a modern CSS foundation:  Fomantic's
  vocabulary (`ui small primary basic icon button`), shadow DOM, `@layer`s, OKLCH tokens, accessibility built in.
  Usable from any framework or plain HTML.  Built on **Solid 2** (`solid-js` / `@solidjs/web` `2.0.0-rc.13`,
  pinned exactly) through our fork of its custom-element layer, `@spell-app/solid-element`.
- The approved design is `docs/plan.md`.  Read "Decisions" and "Architecture" there BEFORE adding a component
  or runtime service.  `docs/report.md` is the generated status report (bundle, perf, hosts, HMR, fallbacks).
- `docs/status.md` is the per-component checklist (status, tests, size, keyboard, docs page, deferred items).
  MUST be updated in the same change that builds, finishes or defers anything in it.
- Layout:
  - `../solid-element/` -- `@spell-app/solid-element`, the fork of `@solidjs/element` + `component-register`
    (upgrade, forms, lifecycle, error boundary, HMR fixes;  `UPSTREAM.md` maps each to a PR).  A workspace of
    the monorepo (`workspace:*`), with its own tests (its dependencies are hoisted to the root `node_modules`, like every package's);  run its scripts with
    `yarn fork <script>`.  NEVER import its files from `src/`:  use the package name.
  - `../util/` -- `@spell-app/util` (`$/util`), shared with `spell`:  `@proto` (`decorators.ts`), `class.ts`, `string.ts`
    (case, `numberToWord`, `suggest`), `dom.ts` (`closestAcrossShadow` ...), `util.types.ts`.  `src/util/index.ts`
    (`$/ui/util`) re-exports it, so source keeps saying `from "$/ui/util"`;  its declarations ship in `dist/_util/`.
    `src/util/index.ts` imports util's GENERIC files one by one (`$/util/class` ...), never `$/util`'s barrel, which
    also holds spell's utilities (lodash, `chalk` ...):  one of the deep-import exceptions (WWOD §4 › "Package
    aliases, never `../`"), so spell's utilities never reach `ui`'s bundles.
    Where a helper goes:  SEE:  WWOD §8 › "Promotion path".  Everything in `$/ui/util` lands in the `core` bundle
    (`core.ts` re-exports it), so keep it small
  - `src/vocabulary/` (`V`) -- the naming layer:  vocabulary schema, value sets, `Vocabulary` (registry, translated
    names, `replace()` for hot reload), `Converters`
  - `src/runtime/` (`UI`) -- the shared `UI` runtime, ONE instance per page (`globalThis.UI ??= new UIRuntime()`).
    Components call `UI.load()` on connect, which dynamic-imports this chunk once.  Services are classes:
    `Browser` (sniffing + `UI.browser.supports` flags), `Keyboard`, `Overlays`, `Focus`, `Styles`, `Vocabulary`,
    `I18n`, `Transitions`, `Ids`, `Toasts`, `Modals`, `Api`, `IconPacks` (`UI.icons`), `Sources` (`UI.sources`)
  - `src/icons/` -- the icon PACK format (`IconPackIndex`, `IconName`, `BuiltInPacks`) and the built-in packs
    (`icon-packs/<id>/`:  SVG files + `pack.js`);  loading and caching are the runtime's (`UI.icons`);  packs are built by
    `tools/IconPackBuilder.ts` (`yarn icons:pack`);  see `docs/icons.md`
  - `src/elements/` (`E`) -- the element core:
    - library-neutral:  `ClassBuilder`, `Validator`, `MenuOptions`, `OwnerContext`, `Shorthand`, `NativeFallback`
    - the Solid layer:  `UIHost` / `FormHost` (host base classes), `UIElement` (the CONTROLLER base:  one instance
      per element, `render()` returns JSX), `ElementDefinition` (vocabulary => the fork's props), `FormElement`,
      `Controlled`, `Cell`, `SlotContent`, `HostAttribute`, `PartContext` + `ContentPart` (owner context),
      `IconGlyph`, `SourceElement` + `SourceHost` (the base of the elements that show a text file:  `source`, inline
      text, loading / error look, `save()`), and the dev-only `HotDefinitions` (NOT in the barrel)
  - `src/components/ui-<name>/` -- one folder per component FAMILY, named after its main tag (`ui-button/`);  the
    family's own files carry the same name (`ui-button.css`):
    - `UI<Name>.tsx` (or `.ts` without JSX) -- one element class per file:  `UIButton.tsx`, `UIButtons.tsx`,
      `UIOr.tsx`;  family helpers beside them (`SlottedItems.ts`, `PartElement.ts`)
    - `index.ts` -- the family barrel:  calls `define()` for every tag (SIDE EFFECT), re-exports the classes.
      Also the family's lib entry (`@spell-app/ui/ui-button`) and its hot-reload boundary
    - `ui-<name>.css` -- port of Fomantic's `.less` + `.variables`
    - `<tag>.vocabulary.en.ts` -- ONE per tag (`ui-button.vocabulary.en.ts`, `ui-buttons.vocabulary.en.ts`,
      `ui-or.vocabulary.en.ts`):  EVERY name the tag uses:  tag, attributes (kind + allowed values), values, events,
      slots, parts, states, text strings.  Translations become `<tag>.vocabulary.<lang>.ts`
      - and `topics` (2+ ids from `ValueSets.topics`:  how a newcomer looks for it AND how widget libraries file it)
        + `aka` (other libraries' / everyday names:  `ui-modal`:  `dialog`, `lightbox`).  A NEW TAG MUST fill both;
        `src/components/component-definitions.ts` rolls them up (the docs' component browser) and
        `test/component-definitions.test.ts` fails on a tag without them.  A new or moved tag also needs `yarn gen:root`
        (`<ui-root>`'s catalog of tag => family;  `test/root-catalog.test.ts` fails while it's stale) and `yarn site:data`
        (the docs site's data;  `tools/SiteDataBuilder.test.ts` fails while it's stale).  Live:  `UIButton.describe()`
    - `ui-<name>.types.ts` -- the folder's loose constants, types and shared vocabulary pieces (nothing top-level
      stays loose in an element / fallback / helper file, but a constant only its class uses:  "Classes");  a
      helper function becomes a private static on the one class that uses it, else a static on a small class here.  Constants used by SEVERAL folders live in
      `src/components/components.types.ts` and are used as `UIT.<NAME>` from `$/ui/core`.  NOTE:  a types file imports its
      vocabularies with `import type` only (vocabularies import values from it:  a value import is a cycle);
      `ui-parts.types.ts` is the exception
    - vocabularies and types files are PURE DATA:  `$/ui/core` for types only;  shared constants by value come
      straight from `components.types` (`import * as UIT from "$/ui/components/components.types"`).  Why:  core loads
      the element layer, which node can't, and `yarn site:data` / `yarn gen:root` import every vocabulary in node
      (tsx).  `test/vocabularies.test.ts` enforces it
    - `ui-<name>.fallback.ts` -- the native fallback (plain DOM, no Solid) shown when the element's render throws
    - `ui-<name>.test.tsx` (elements), `ui-<name>.css.test.ts` (the sheet on class-grammar markup),
      `ui-<name>.fallback.test.ts`, `ui-<name>.a11y.test.ts`, `ui-<name>.perf.test.tsx`
    - `examples/*.html` -- Fomantic's examples in CLASS GRAMMAR (static markup, the CSS tests and the site);
      `examples/elements/*.html` -- the same examples as `ui-*` ELEMENT markup (axe in `ui-<name>.test.tsx`,
      `yarn dev`, `yarn test:visual`);  `examples/elements/<example>.visual.ts` -- optional OPEN states for the
      visual tests (`docs/visual-testing.md`)
  - `src/docs-components/ui-docs-<name>/` -- DOC-ONLY element families (`<ui-docs-example>`, `<ui-docs-api>` ...):  the
    widgets the docs site is built from, laid out and written EXACTLY like a component family (same files, same
    rules), but NOT components:  no lib entry, not in `ComponentDefinitions.all` / the component list
    (`ComponentDefinitions.docs`), every tag filed under the `documentation` topic.  `<ui-root>` knows them (`yarn gen:root`
    scans this folder too), but loads them only where the page's bundle called `DocsFamilies.add()` (the site's
    does;  never the library's own `RootLoader`:  epic `wwod-spell-ui`, I12).  A family that renders other widgets in
    its shadow root imports their families in its barrel, and adds their tags to `DocsJSXTags`.  They read the site's
    data through `SiteData` (`site/_data/components.json`), NEVER the vocabularies.  The barrel's header says how to
    add one
  - `src/static/` (`$/ui/static`, `SSR`) -- the STATIC server render:  `StaticRender.page()` / `fragment()` turn
    `ui-*` markup into plain light-DOM HTML (no shadow DOM, no JS) in node, for SEO.  Stand-in hosts are linkedom
    elements (`ServerHost`), controllers render with `renderToString`, `StaticFlattener` swaps each host for its
    root, `StaticInteractions` wires what works without JS.  Node only:  NEVER imported by a component or `$/ui`.
    Plan:  `epics/seo/seo.plan.html`
    - Server code, so every file is `<Name>.server.ts` (`static.types.server.ts`;  tests `<Name>.server.ssr.test.ts`,
      in the `ssr` project) except the barrel, `index.ts` (WWOD §10 › "Server code stays out of the browser bundle")
    - Its files import each other through `SSR` (`import { SSR } from "$/ui/static"`) and the element core through
      `$/ui/core`;  a mark a static initializer reads comes from `./static.types.server` directly (WWOD §4 ›
      "Circular imports";  `barrel.ssr.test.ts`)
  - `src/core.ts`, `src/forms.ts` -- the two SHARED lib entries (`@spell-app/ui/core`, `@spell-app/ui/forms`):  `core` is
    the element core + the foundation JS every family needs;  `forms` what only form controls with a VALUE need
    (`FormElement`, `FormHost`, `Validator`, `MenuOptions`).  Component files import shared code ONLY through
    these (see "Solid authoring")
  - `src/styles/` -- `layers.css`, tokens, colours, sizes, reset, typography, animations, utilities, `native.css`,
    `themes/`;  its own lib entry (`@spell-app/ui/styles`)
  - `src/index.ts` -- `@spell-app/ui`:  registers every family (side effect) and re-exports them, plus `E`, `V`, the
    runtime, styles and icons
  - `test/` -- shared test utils and cross-family tests:  `Fixture.render(html)` (`fixture.ts`),
    `A11y.check(el)` / `expectAccessible(el)` (`a11y.ts`), `ElementFixture` (render + wait for `ready` +
    `flush()`, `breakRender()`), `StubOwner` (stand-in owners:  card, feed ...), `PerfRun` (the dropdown
    benchmark), `fallback.cases.ts`, `dictionary.es.ts`, `VisualOpen` + `test.types.ts` (visual-test hooks),
    `visual/baselines/` (screenshots, `yarn test:visual`);  `fallback` / `isolation` / `translate` / SSR / DSD
    tests.  Every test runs in a REAL browser (Vitest browser mode + Playwright, chromium by default), except
    `*.ssr.test.tsx` (node)
  - `tools/` -- package tooling (node scripts run by `tsx`, see `tools/README.md`):  bundle measurement, peer
    vendoring, import-map smoke pages (framework hosts), LOC, report tables, the HMR end-to-end test;
    `tools/demo/` is the `yarn dev` site;  `tools/visual/` the visual tests;  results go to `tools/results/`
    (git-ignored)
  - the docs site, modelled on Fomantic's docs, served at `/ui/` by the page server (static, live-reloading;
    `packages/server`'s `UI_SITE`):  plain `.html` pages on `<ui-*>` widgets, no build step to view one (epic
    `spell-ui-pages`, which replaced the old Astro site).  In TWO halves since 2026-10-05 (claude-design P6), one
    constant each in `tools/tools.types.ts`:
    - `SITE_PAGES`, the HAND-WRITTEN half:  `ui/` at the checkout's root, SHARED content (a link into
      `../spell-app-dev/ui/`;  root `AGENTS.md` "Shared content"):  `*.html`, `components/ui-<name>.html`, `_parts/`
      (the layout and footer every page shares), `examples/` (files the examples load), `images/` (Fomantic's docs
      images), `_data/search.json` (built from these pages by `yarn site:data`), and `README.md`:  how pages are
      made.  Edited from any checkout, never committed here
    - the `site:*` scripts that WRITE pages (`site:new`, `site:index`, `site:kitchen`, `site:sections`) write the
      shared `ui/` from THIS branch's data and template:  a page using an element only this branch has shows it
      undefined in other checkouts until the branch merges
    - `SITE_BUILD`, the BUILT half:  `site/`, tracked per branch (`site/README.md`:  its files);  the page server
      lays its `_assets/` and `_data/` over the pages at `/ui/`, so every page's relative `_assets/...` /
      `_data/...` links resolve unchanged:
    - `site/_assets/` -- GENERATED, committed:  the site bundle (`yarn site:bundle`):  `site.js` + `site.css` (what
      every page loads:  `<link rel="stylesheet" href="_assets/site.css">` + `<script type="module"
      src="_assets/site.js">`, `../_assets/` from `components/`), each family a lazy chunk, `icon-packs` a symlink
      to `src/icons/icon-packs`.  NEVER edit
    - `site/_src/` -- the bundle's entry (`site.ts`:  what's in it and why) and the site's layout-glue CSS
      (`site.css`);  config `vite.site.config.ts`
    - `site/_data/` -- `components.json` and `icons.json` (the icon browser's search terms), GENERATED, committed
      (`yarn site:data`;  shapes `SiteDataFile` / `SiteIconsFile` in `src/docs-components/docs-components.types.ts`),
      and `pages.json`, hand-kept per-family facts it reads (title, summary, status, token-table overrides, `pages`:
      the sub-tags with a page of their own).  The search file (`SiteSearchFile`) is the shared
      `ui/_data/search.json`:  rerun `yarn site:data` after renaming or moving a section
  - `docs/` -- design docs (`plan.md`, `grammar.md`, `theming.md`, `translation.md`, `icons.md`, `fallback.md`,
    `runtime.md`) and the generated `report.md`
  - `scripts/` -- generators (`gen-styles.ts`, `gen-icons.ts`, `gen-root-catalog.ts`, `gen-spell.ts`,
    `gen-markdown.ts`, `gen-site-data.ts`, `site-new.ts`, `site-components-index.ts`, `site-kitchen-sink.ts`) and the
    site bundle's build (`site-bundle.ts`, watched by `site-dev.ts`)
  - `src/languages/` -- GENERATED, committed:  `spell.<lang>.js`, spell's pre-compiled highlighter for
    `<ui-code language="spell">` (`yarn gen:spell`;  the root `AGENTS.md`'s one `ui` -> spell exception).  NEVER edit;
    lint and format skip it
  - `src/components/ui-markdown/md.bundle.js` (+ `.d.ts`, `MDBundle.ts`) -- GENERATED, committed the same way:  the
    pre-compiled markdown engine (`@spell-app/markdown`, `yarn gen:markdown`).  NEVER edit;  lint and format skip it
  - `reference/Fomantic-UI/` -- READ-ONLY, git-ignored clone of Fomantic for porting.  NEVER edit or import it.
- Commands:
  - `yarn review` -- tsc (root, node configs, the fork) + oxlint `--fix` + oxfmt + every test (`ssr`, `browser`,
    the fork's);  MUST pass before you hand work back
  - `yarn build` -- tsc + vite library build into `dist/` (entries `core`, `forms`, one per family, `styles`,
    `index`;  `dist/icon-packs/`;  `.d.ts` beside the `exports` paths, from `declarations()` in `vite.config.ts`)
  - `yarn test` -- `ssr` project first (it writes `.cache/ssr-button.html`, which `test/dsd.test.ts` reads), then
    `browser`, then `yarn test:fork`
  - `yarn test:all` -- chromium + firefox + webkit (`yarn test:browsers` once first)
  - `yarn test:visual [--os local|linux|both] [--browsers all|chrome|webkit|firefox] [--update] [--grep <family>]
    [--parity]` -- screenshot tests of every element example, light + dark, against the baselines in
    `test/visual/baselines/` (Playwright `toHaveScreenshot`;  `linux`, the default, renders in Playwright's
    Docker image).  `yarn test:visual:update` ~== `--update`.  See `docs/visual-testing.md`
    - NOT part of `yarn review` (slow, needs Docker), but MUST run before a change that alters rendering (CSS,
      markup, tokens, an example) is handed back
    - a change that alters rendering MUST update its baselines in the SAME change (`--update`), after reviewing
      every diff in the HTML report;  never update to silence a diff you haven't looked at
    - `--static` -- instead, compare the STATIC server render (`$/ui/static`) of the families in
      `tools/visual/StaticFamilies.ts` with the elements;  report only (`tools/results/visual/static-parity.md`),
      `--os local` by default
  - `yarn dev` -- `tools/demo/`:  every example as class grammar beside elements;  edits hot-reload
  - `yarn icons:pack <folder> --id <id> [--sanitize] [--skip-unsafe | --allow-unsafe]` -- verify a folder of SVGs
    and write its `pack.js` (keeps hand edits);  `--sanitize` strips unsafe attributes first;  files that still fail
    refuse the pack, unless skipped or allowed
  - `yarn vendor`, `yarn measure`, `yarn smoke`, `yarn report`, `yarn test:hmr` -- see `tools/README.md`;
    `yarn report` rewrites `docs/report.md`'s tables (run it twice:  no diff)
  - `yarn fork <script>`, `yarn fork:install`, `yarn fork:build` -- the fork's own scripts.  Its `dist/` is only
    needed by `yarn vendor` / `yarn measure`, which build it when stale (`tools/ForkBuild.ts`);  dev, tests,
    the site and the library build use its source
  - `yarn site:build` ~== `yarn site:data` (`site/_data/components.json`, `icons.json`;  the shared
    `ui/_data/search.json`) + `yarn site:index` (the component index's cards, `ui/components/index.html`;  `--check`)
    + `yarn site:kitchen` (the kitchen sink's examples, `ui/kitchen-sink.html`, from every family's
    `examples/elements/types.html`;  `--check`) + `yarn site:bundle` (`site/_assets/`, sizes printed):  rerun after
    changing a vocabulary, a family sheet, an example or any source the site shows, and commit the output in `site/`
    (`ui/` commits itself)
  - `yarn site:dev` -- `scripts/site-dev.ts`:  `yarn site:bundle`, then the page server (started if needed) serves
    `/ui/` while a Vite WATCH build rebuilds `site/_assets/` on every `src/` / `site/_src/` edit, and live reload
    reloads the open pages.  Not watched:  `site:data` / `site:index` / `site:kitchen`.  A watch rebuild leaves stale
    hashed chunks:  `yarn site:build` before committing
  - `yarn site:new <tag|page> [--title ...] [--summary ...] [--force]` -- a site page from the template
    (`templates/spell-ui-docs.html`, `scripts/site-new.ts`):  `ui/components/<main tag>.html` for a
    tag (`<tag>.html` for a sub-tag its family's `pages` lists:  `ui-radio`), else `ui/<page>.html`;  title /
    summary / status from `site/_data/pages.json`.  How to write one:  `epics/spell-ui-pages/PAGES.md`
  - `yarn site:sections [--check] [page...]` -- `scripts/site-sections.ts`:  nests every page's flat level 2 / 3
    headers and headed examples into `<ui-section>`s and writes (or fixes) their ids, `<tab>-<section>-<example>`;
    idempotent.  `site:index`, `site:kitchen` and `site:new` run it on what they write
  - `yarn design:build [--out <dir>]` (`spell dev design build`) -- `tools/DesignExport.ts`:  the claude.ai design
    system's files (epic `claude-design`) in `<dir>/project/`, default `build/design-system/` (git-ignored), from
    `site/_data/components.json`, the element examples and the Spell theme;  `yarn site:data` first after a
    vocabulary change.  `yarn site:data` also writes `site/_data/custom-elements.json` and `html-custom-data.json`
    (VS Code autocomplete for `<ui-*>`, `tools/ElementManifests.ts`);  `tools/DesignExport.test.ts` fails while stale
  - `yarn site:check <page...> | --all` -- `tools/SiteCheck.ts`:  loads the `ui/` pages from the page server
    (Playwright), fails on console errors, 404s, undefined / unrendered `ui-*`, missing tabs, an empty toc,
    phone-width overflow, a nav flyout that won't open;  screenshots in `tools/results/site-check/`.  LOOK at them
  - `yarn tsc`, not `npx tsc`, and no hard-coded `node_modules` paths:  SEE:  root `AGENTS.md` "Toolchain:  Vite+".
    Here, node code finds a dependency through `tools/NodePackage.ts`.

## UI rules

- Shadow DOM EVERYWHERE, with SEMANTIC shadow markup:  `<button>`, `<dialog>`, `<input>`, `<nav>`, `<table>` ...
  NEVER a `<div>` where an element exists.
- Inside shadow roots, keep Fomantic's class grammar on those elements:  `<button class="ui small primary button">`.
  Why:  it's a mechanical port of the `.less`, and the app stylesheet / `::part` override language is the known
  vocabulary.  Translated names never touch CSS.
- Booleans:  presence / `""` / `"true"` / `"yes"` ~== true;  `"false"` / `"no"` ~== false.
- Widths:  attribute is `width`, NEVER `wide`;  accepts columns (`4` of 16), fractions (`1/4`), percentages (`25%`).
  Exception:  `<ui-sidebar>` and `<ui-flyout>` also take Fomantic's width words (`very thin`, `thin`, `wide`,
  `very wide`), which the element adds after the noun (`ui left sidebar thin`).
- Numeric fields:  RIGHT-aligned (`text-align: end`, `tabular-nums`), the number set against its trailing unit
  (`250°`, `55%`, `16px`);  text fields (a hex, a name) stay start-aligned.  Owen's standing rule (2026-10-04).
- Chosen state:  `selected` is canonical (checkbox, radio, toggle, items, tabs, options);
  `checked` is accepted as an alias on checkbox / radio only.
- Generic content parts (`<ui-content>`, `<ui-header>`, `<ui-meta>`, `<ui-description>`, `<ui-extra>`,
  `<ui-actions>` ...) style themselves by OWNER CONTEXT (`:state(in-card)` via `ContentPart`).
  NEVER `ui-card-header` (and no `:host-context`:  WWOD §18 › "Reach into `ui-*` elements through `::part()` and
  tokens").
- Events:  `CustomEvent`s, `bubbles: true, composed: true`, lowercase kebab `ui-*` names (`ui-change`, `ui-open`);
  `detail` carries computed state (`{ value }`, `{ open }` ...) plus `originalEvent`.
- Rich data (`options`, `rows`) as JS PROPERTIES -- real accessors on the class, so frameworks find them with `key in el`.
  Primitives as REFLECTED attributes.  First paint MUST NOT need a rich property (SSR drops them).
- Vocabulary files own every name:  NEVER a string literal for an attribute / event / slot / part name in a
  template or `ClassBuilder` -- read it through the component's vocabulary.
- Class defaults:  as WWOD §12 › "`@proto static` defaults", plus:  vocabulary, default settings and part names are
  `@proto static` (from `$/ui/util`), so instances carry no per-instance copies.
- Libraries:  `lodash-es` only (tree-shakes).  Any other runtime dependency:  WWOD §2 › "Ask before adding a
  dependency".
- Platform:  what's assumed (anchor positioning, no JS fallback ...) and what's flagged through
  `UI.browser.supports` (Safari's gaps):  WWOD §18 › "Modern CSS".

## CSS

As WWOD §18, plus:

- Units:  sizes derive from px-valued `--ui-font-size` (default `16px`) and `em` inside components (no `rem`:
  WWOD §18 › "No `rem`").
- Sizes are ratios of 16.  `medium` is a real size meaning "default" -- a no-op that emits no class.
- Layers:  `@layer ui.reset, ui.tokens, ui.base, ui.components, ui.utilities, ui.theme, ui.app;`
  - inside `ui.components` each component declares sublayers `types, content, variations, states`,
    so states beat variations without `!important`
- Global sheets:  `src/styles/`, one file per axis (tokens, colours, sizes, typography, utilities), in `@layer`
  order, `layers.css` FIRST (`layers.css`'s header).
- ONE generic rule set for every hue and size, switched by token remap (`--ui-color`, `--ui-scale`;  WWOD §18 ›
  "Keep CSS DRY"), not per-hue rules.
- NEVER declare a public component token (`--ui-<tag>-*`) in a component sheet:  declare its private alias
  (`--_ui-button-radius: var(--ui-button-radius, var(--ui-radius))`) and read the alias, so values set on the
  page, an ancestor, the host or `::part()` reach the box.  Owner switches are private (`--_ui-card-layout`).
  See `docs/theming.md` "Component tokens";  `test/component-tokens.test.ts` enforces it.
  - Two private shapes, on purpose:  `--_ui-<tag>-*` is a public token's ALIAS;  `--_<tag>-*` (`--_button-*`) is
    variation plumbing no page sets.  NEVER rename one into the other (epic `wwod-spell-ui`, Q13).
- WWOD §18 › "Naming" (PascalCase root classes, nested parts) is for app sheets:  shadow sheets keep Fomantic's class
  grammar (`.ui.small.button`), "UI rules" above.
- Breakpoints:  `@custom-media` only (`src/styles/media.css`), never a bare px media query (WWOD §18 › "Check at
  phone width").
- Utilities (`src/styles/utilities.css`, `docs/theming.md` "Utilities"):  named in the grammar
  `ui-<property>-<modifier>` (`ui-text-truncate`, `ui-gap-m`), `:` for variants (`ui-split:column`).
  - `-ish` suffix ~== "looks like X but isn't one":  `ui-button-ish`, `ui-link-ish`.

## Solid authoring

- Solid's own rules (no writes in an owned scope, staged writes, two-function effects, eager memos):  SEE:
  `guides/solid/solid-2.md`.  Below:  only what's `ui`'s own.
- An element is a CONTROLLER class `UI<Name> extends UIElement<typeof nameVocabulary>` (or `FormElement`,
  `ContentPart`):  `@proto static vocabulary` / `styles` / `Fallback` (/ `formAssociated`, `delegatesFocus`),
  signals and memos as FIELDS, `render()` returning JSX.  The fork creates one per element on first connect and
  keeps it (`keepAlive`) until `host.dispose()`.  `UI<Name>.define()` in the family's `index.ts` registers it.
- Imports in component files (element classes AND `ui-<name>.fallback.ts`):  shared code ONLY from `$/ui/core` (and
  `$/ui/forms` for form controls), never `$/ui/util`, `$/ui/vocabulary`, `$/ui/elements` ... directly;  the family's own
  vocabulary, fallback, helpers and sheet as peers (`./ui-button.vocabulary.en`, `./ui-button.css?inline`).  Why:  the
  lib build puts everything `$/ui/core` re-exports into `dist/core.js`;  a leaf imported by a family AND by `core`
  splits into a hashed third chunk.  For the same reason `core.ts` / `forms.ts` re-export `$/ui/elements` LEAVES, and
  every `forms` file imports the core through `$/ui/core` (`yarn measure`'s checks catch a violation).
  - Through namespaces, WWOD §4 › "ONE namespace per sub-system":  `import { E, UI, UIT } from "$/ui/core"` (+
    `import { F } from "$/ui/forms"`), then `E.UIElement`, `@E.proto`, `UI.browser`, `UIT.ARIA_LABEL`, `F.FormElement`
    ("Types / Exports").  NEVER a bare shared name.  Measured (epic `wwod-spell-ui`, Q4):  family chunks come out
    byte-for-byte the same (Rolldown turns `E.Cell` back into a plain import);  `core` pays ~0.8 kB gzipped for the
    `E` object.
  - The element core (`src/elements/`) too, though `core.ts` / `forms.ts` re-export its own files:  `import { E, UI,
    UIT } from "$/ui/core"` (the `forms` files also `import { F } from "$/ui/forms"`), `E.Cell`, `E.Warnings`,
    `E.flatParentFor()`, never named imports from `./elements.types`, `./Cell`, `$/ui/util`, `$/ui/runtime` ...
    EXCEPT what a module reads while it EVALUATES -- the base class in `extends`, a decorator (`@proto`), a static
    initializer (`static readonly generation = new Cell(0)`) -- which is a direct import from its file, under
    `// Import directly to avoid circular import` (WWOD §4 › "Circular imports").  Instance fields, method bodies
    and types go through `E`.  `elements.types.ts` stays `import type` only (`import type { E }`).
    - The `forms` files are the exception's exception:  `extends E.UIElement` / `@E.proto` are fine there, since the
      core never imports `forms` and has always finished loading first;  a `forms` peer a class definition reads
      (`FormElement`'s `FormHost`, `Validator`) is still direct.
    - `src/elements/barrel.test.ts` checks every export of both entries is live;  NEVER import an element-core leaf by
      path (`$/ui/elements/UIElement`):  entering the cycle there breaks it.
  - TODO (epic `wwod-spell-ui`, P5-P7):  component files move to `E` / `F` phase by phase.
- **Eager memos and overridables:**  base-class memos that call overridable methods take `{ lazy: true }`;
  effects that call overridables are created in `mount()`, after every subclass field exists.
- **`Cell` field order:**  class fields initialize in declaration order, before the subclass constructor body.
  Declare every signal as a `Cell` field ABOVE the memos that read it;  compute a starting value into the initial
  value (`new Cell(untrack(() => ...))`), never by writing during setup.
- **Where writes go:**  `render()` is an owned scope (no signal writes there).  Write from event handlers,
  `onSettled`, promise callbacks, the effect's APPLY function or the fork's hooks;  hooks that can run inside a
  Solid render (`onConnect`, the `onFormDisabled` replay) defer with `queueMicrotask`.  Element PROPERTY writes are
  always legal.
  - A read right after a write sees the old value:  keep the new value in a local.  Tests
    `await ElementFixture.settle()` / `tick()` (which `flush()`), never sleep.
- **Events:**  dispatch through `this.emit("ui-change", detail)` (vocabulary-checked, localized on translated
  tags).  Inside a component, `onClick={...}` for native events (no `on:` namespace;  rich data as
  `prop:options`:  `solid-2.md` "DOM and `@spell-app/ui` elements").
  - A THIRD-PARTY Solid app listening for `ui-*` events uses a `ref` callback + `addEventListener`
    (`tools/frameworks/solid/app.tsx`);  our app:  WWOD §17 › "Events:  `onClick`, or `on()` for `ui-*`".
  - Listeners OUTSIDE a component see `event.target === host` (`composedPath()[0]` is the inner element), and an
    app's delegated `onClick` on a `ui-*` tag runs once.  The fork's `events.ts` guarantees it by undoing what
    Solid's shadow-root delegation leaves on the event (`target`, `currentTarget`, its handled marker);  NEVER
    work around a wrong `target` in a component -- fix it there (`packages/solid-element/UPSTREAM.md`, PR 10).
- **`keepAlive`:**  a removed element keeps its reactive root (until `dispose()` or garbage collection), so
  anything page-wide (overlay entries, document listeners) follows `connected()`, never disposal.
- **Slots carry no Solid context:**  an element's root is owned by whoever CREATED it, never by the `<slot>` it's
  assigned to (fork PR 11), so a `<slot>` may live in any `<Show>` / `<Dynamic>` branch, but context provided
  around it never reaches slotted elements.  Owner data goes through `PartContext` / `OwnerContext`.
- **Native fallback:**  every family sets `@proto static Fallback = <Name>Fallback` (plain DOM on
  `NativeFallback`, same class grammar, no Solid).  When a render throws, the element logs once, dispatches a
  cancelable `ui-error`, gets `:state(errored)` and shows the fallback;  siblings keep working
  (`docs/fallback.md`).
- **Hot reload** (`yarn dev`):  edits to a family's classes, vocabulary, fallback or sheet
  update live instances in place;  internal state (a query, an open menu) resets.  Changes the platform reads
  once (observed attributes, `formAssociated`, the host base class, shadow options) and edits to shared code
  (`core`, `forms`, `src/elements/`, the runtime) reload the page.  `yarn test:hmr` MUST pass after touching
  `HotDefinitions`, `UIElement.define()` or the fork's HMR.
- **One Solid per page:**  every Vite config dedupes `solid-js` / `@solidjs/web` (`SOLID_DEDUPE`);  NEVER
  `import * as` a Solid package in shipped code (it pins every export into bundles and vendored copies).
- SSR:  anything that reads the DOM in a constructor needs an `isServer` guard (`test/ssr.ssr.test.tsx`).
  - Static render (`$/ui/static`):  as WWOD §12 › "Brand checks only where `instanceof` can't work", plus:  hosts
    are linkedom elements, so NEVER `instanceof Element` / `Node` / `ShadowRoot` / `HTMLSlotElement` in shared code
    (node has no such globals):  `nodeType`, `localName`.
  - An effect whose APPLY writes the host (`internals.role`, ARIA, states) is `this.hostEffect(compute, apply)`:  the
    server build never runs an apply, so a plain `createEffect` leaves the static output without it.

## Decorators

As WWOD §12, plus:

- `vite.decorators.ts` (repo root) is used by `vite.config.ts` (`baseConfig()`, shared with `vitest.config.ts` and
  the site bundle's `vite.site.config.ts`).
- The decorator pre-pass MUST run BEFORE the Solid plugin (both are `enforce: "pre"`;  `baseConfig()` orders them):
  the Solid compiler must see decorator-free code.

## Types / Exports

As WWOD §8, plus our self-namespaces (one per lib entry, since each entry is its own bundle):

- `E` ~== `$/ui/core`:  the element core and the foundation (`E.UIElement`, `E.proto`, `E.Cell`, `E.Converters`)
- `F` ~== `$/ui/forms`:  what only form controls need (`F.FormElement`, `F.MenuOptions`)
- `UI` ~== the runtime singleton from `$/ui/runtime`:  an instance, read like an app singleton, never through `E`
- `UIT` ~== `$/ui/components/components.types` -- the constants, types and `ToggleCommands` several families share:
  `UIT.TRUE`, `UIT.ARIA_LABEL`, `UIT.ToggleCommands.action(...)`, `UIT.SelectValue`.  Exported from `$/ui/core` and `$/ui`,
  never flat, never through `E`
- `V` ~== `$/ui/vocabulary`, namespaced through `vocabulary.api.ts` from the `api` entry only (why:  that file's
  header)
- `SSR` ~== `$/ui/static` (node only)
- the components barrel exports classes by name (`UIButton`, `UIDropdown`), no namespace

## Imports

As WWOD §4, with `$/ui` / `$/ui/*` as our alias (`$/ui/test/*`, the test helpers, is longer than `$/ui/*`, so it
wins), plus these deliberate EXCEPTIONS:

- Component files import shared code from `$/ui/core` / `$/ui/forms` only, as `E` / `F` / `UI` / `UIT` ("Solid
  authoring").  Folder peers stay direct imports (`./ui-button.types`), one statement per module.
- The element core (`src/elements/`) imports itself the same way, through `E` / `F`, NOT its peers:  only what a
  module reads while it evaluates comes from its file directly ("Solid authoring").
- Vocabularies and types files value-import `UIT` as `import * as UIT from "$/ui/components/components.types"`, not
  through `$/ui/core`.  Why:  they're PURE DATA that node imports (`yarn site:data`, `yarn gen:root`), and `core`
  loads the element layer, which node can't ("Overview", `ui-<name>.types.ts`)
- `tools/` are node scripts:  relative imports with `.ts` extensions, no aliases.

## Comments & docs

As WWOD §6, plus:

- An override that only FILLS a hook its base class documents (`render()`, `hostStates()`, a fallback's `build()`)
  needs no docstring;  one that adds to the base's contract says what it adds:  `/** Disabled by its attribute, or by
  a disabled fieldset. */`.  The base class documents each hook once (epic `wwod-spell-ui`, Q3).
- Likewise `@proto static vocabulary` / `vocabularies` / `styles` / `Fallback` / `degraded`:  documented once, with
  why they're static, on `UIElement` / `NativeFallback`.

## Functions & types

As WWOD §9, plus:

- A SET of related values (close reasons, key names, positions, modes) is a const array + type:
  `ToastCloseReasons` + `ToastCloseReason`.  A single vocabulary word (a class word, a part name) stays a named
  ALL-CAPS constant, under a `// ##` group in its types file (epic `wwod-spell-ui`, Q2).
- Values are English where they're only ours (`"file protocol"`);  values a page or CSS reads (an event's `detail`,
  `data-ui-animation`, a vocabulary's attribute values) keep their published spelling.
- `null` only at platform boundaries:  `getAttribute()`, `setFormValue()`, the fork's `toAttribute`, `useContext`'s
  default.  Everything of ours is `undefined` (epic `wwod-spell-ui`, Q9).

## Classes

As WWOD §12, plus:

- `@proto static` defaults stay at the TOP of the class:  they're its declared config (epic `wwod-spell-ui`, Q11).
  Other statics go after the main methods;  constants go below the class (next bullet).
- Constants (epic `wwod-spell-ui`, Q18:  bundle size over WWOD §12's `static` constants):
  - Used by ONE class:  a module `const` (not exported) BELOW the class, with its other helpers (WWOD §8), each with
    its docstring.  Why:  a module `const` minifies to one letter;  a static's name (`t.LIST_SEPARATOR`) doesn't.
  - ABOVE the class only when something reads it while the class loads (a static initializer, a decorator argument,
    a static's computed key, a module `const` above):  below, it'd hit the temporal dead zone.  Say so in one line:
    `// Above the class:  <static x> reads it while the class is defined`.
  - Used by SEVERAL files of the folder:  the folder's `.types.ts`.
  - Page-wide registries stay `private static readonly` + `static reset()`, as tests reset them (WWOD §15;  epic
    `wwod-spell-ui`, Q10);  developer / debug switches stay ALL-CAPS statics at the top (`UIElement.ISOLATE_ERRORS`).
  - A public static read from outside the class is API:  it stays.
  - Applies to `src/elements/`, `src/static/` and `src/runtime/` too, not only component folders.
- Render pieces of a controller class are private methods named for what they draw, no type word:  `thumb()`, not
  `renderThumb()` / `thumbElement()` (WWOD §17's inner functions are for function components;  epic
  `wwod-spell-ui`, Q12).
- The constructor of `UIElement` stays `(host, definition, attrs)`:  the forked custom-element layer calls it.

## Logging

As WWOD §19, EXCEPT the `Logger`:  `$/util`'s would add bytes (and colours only Chrome's console draws) to every
component bundle (epic `wwod-spell-ui`, Q5).  Instead:

- Every console warning goes through `Warnings` (`$/ui/util`):  `Warnings.warn(source, message, ...data)` for what
  the page's author must fix, `Warnings.devWarn(...)` for advice in development builds only.  ONE format:
  `[@spell-app/ui] <source>:  <what happened>`, then the data.  NEVER a bare `console.warn`.
- The one `console.error`:  `UIElement`'s when an element's render throws (WWOD §19 › "`console.*` is reserved for").
- `tools/` and `scripts/` are node CLIs:  their output goes to `process.stdout` / `stderr`.

## Tests

As WWOD §20, plus:

- An element's tests describe as `describe("<ui-button> keyboard")`:  `ui`'s form of the call path.  Helper classes
  use the call path (`describe("SliderScale.ratio()")`) and get their own test file beside them (epic
  `wwod-spell-ui`, Q8).

## Out of scope for WWOD

- `packages/solid-element/`:  a fork whose modules map 1:1 to upstream PRs (`UPSTREAM.md`);  keeps upstream's shape.
- Generated files (`src/languages/`, `md.bundle.js`, `site/_assets/`, `site/_data/`, `ui-root.catalog.ts`):  never
  edited, only regenerated.
