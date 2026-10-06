# `@spell-app/ui` status report

Eight component families -- `ui-button` (+ `ui-buttons`, `ui-or`), `ui-dropdown` (+ `ui-item`), `ui-icon` /
`ui-icons`, `ui-label` / `ui-labels`, the 13 generic content parts, `ui-divider`, `ui-segment` / `ui-segments`,
`ui-container` -- on **Solid 2.0.0-rc.11** through **`@spell-app/solid-element`** (`packages/solid-element/`, our fork of
`@solidjs/element` + `component-register`), over the foundation in `src/` (vocabularies, CSS, runtime, icons,
native fallbacks).  Packaged as a SHARED RUNTIME:  `solid-js`, `@solidjs/web` and the fork are peer dependencies
(external);  the element core is split into two shared entries (`core.js` for every family, `forms.js` only for
families with a form value);  each family ships only its own classes, sheet, vocabulary and native fallback.

This report holds facts and measurements.  Every table between `generated` markers is rewritten by `yarn report`
(`tools/ReportTables.ts`) from `tools/results/*.json`;  run the commands under "Commands" first.  How we got here
(the Lit vs Solid spikes) is in the appendix.

## Setup & versions

<!-- generated:versions -->
| Package | Version | Kind |
| --- | --- | --- |
| `solid-js` | 2.0.0-rc.13 | installed |
| `@solidjs/web` | 2.0.0-rc.13 | installed |
| `@spell-app/solid-element` | 0.0.0 | installed |
| `vite` | 8.3.1 | installed |
| `@solidjs/web` | 2.0.0-rc.13 | peer |
| `solid-js` | 2.0.0-rc.13 | peer |
| `@spell-app/solid-element` | workspace:* | dependency |
| `@solidjs/vite-plugin` | 3.0.0-next.47 | dev |
| `@solidjs/web` | 2.0.0-rc.13 | dev |
| `solid-js` | 2.0.0-rc.13 | dev |
<!-- /generated:versions -->

- **Solid 2.0 RC:**  `solid-js` / `@solidjs/web` `2.0.0-rc.11`, pinned exactly (12 RCs in 7 weeks);
  `@solidjs/vite-plugin` `3.0.0-next.46` (native OXC compiler).  `@solidjs/web` owns the JSX types:
  `jsxImportSource: "@solidjs/web"`, `jsx: "preserve"`.
- **The fork:**  `@spell-app/solid-element`, `"link:./packages/solid-element"` in `dependencies`;  its own yarn project
  (own `yarn.lock`, `yarn fork <script>`), with its own tests (`yarn test:fork`).  Its `exports` point the
  `development` condition at `src/index.ts`, so the dev server, Vitest and the docs site compile the fork's
  TypeScript with our Solid plugin;  the library build leaves it external.  Only `yarn vendor` / `yarn measure`
  bundle its BUILT `dist/`, and they build it first when stale (`tools/ForkBuild.ts`).  The HMR plugin is imported
  from source (`./packages/solid-element/src/vite.ts`) by `vite.config.ts` (and so the site bundle's config), so a fresh
  checkout never needs the fork's `dist/` to start.
- **Decorators:**  standard (TC39 2023-11) through `vite.decorators.ts` (esbuild pre-pass, `jsx: "preserve"`),
  listed BEFORE `solid()`;  both are `enforce: "pre"`.
- **One Solid:**  `resolve.dedupe: ["solid-js", "@solidjs/web"]` in every Vite config (library, tests, site) and in
  the vendor / measure builds:  the linked fork otherwise resolves its OWN Solid, and two copies can't share owners.
- **Config:**  `vite.config.ts` exports `baseConfig()` (plugins, aliases, dedupe, Lightning CSS with `CSS_TARGETS`),
  used by the library build, `vitest.config.ts` (two projects:  `browser` in chromium, `ssr` in node, each with its
  own Solid plugin instance) and the docs site's bundle, `vite.site.config.ts`.

### Commands

From the repo root:
- `yarn review` -- tsc (root, node configs, the fork), oxlint `--fix` (incl. the fork), oxfmt, then every test:
  `ssr`, `browser`, and the fork's suite
- `yarn build` -- `dist/`:  `core.js`, `forms.js`, one entry per family, `styles.js`, `index.js`, lazy runtime
  chunk, `icon-packs/` (icon packs:  SVG files + `pack.js`), `.d.ts`
- `yarn vendor` -- `vendor/`:  one ES module per peer specifier + `vendor/importmap.json` (`PeerVendor`)
- `yarn measure` -- `tools/results/measure-results.json` (`BundleMeasure`)
- `yarn smoke` -- builds, then runs the import-map pages in headless chromium:  `smoke-results.json`
  (`SmokeRunner`).  Needs network for esm.sh (React, Solid 1.9) and unpkg (Vue) only.
- `yarn serve` -- the same pages for a person (prints URLs)
- `yarn report` -- `loc-results.json` (`LocCount`), then this file's tables (`ReportTables`)
- `yarn test:hmr` -- hot module replacement end to end:  dev server + headless chromium + real file edits
- `yarn dev` -- `tools/demo/`:  every example as class grammar beside element markup, plus perf, translate, HMR
  pages;  `yarn screenshots` writes one PNG per example pair
- `yarn site:build` / `yarn site:dev` -- the docs site's data, generated pages and bundle;  `site:dev` rebuilds the
  bundle on every edit while the page server serves `/ui/`

### Final state

At the promotion (2026-09-29):  `yarn review` clean -- `browser` 1102 tests (1101 passed, 1 todo) in 63 files,
`ssr` 1, the fork 121 in 13 files · `yarn build` clean (`dist/glyphs/` 2,163 files;  `dist/icon-packs/` 2,167 SVGs since 2026-09-30) · `yarn vendor` 3 specifiers,
all tree-shaken · `yarn measure` all checks pass · `yarn smoke` 8 / 8 pages · `yarn test:hmr` 8 / 8 ·
`yarn report` twice, no diff · `yarn site:build` 9 pages, live `ui-button` / `ui-dropdown`.

## Bundle

### Method

- **Packaging:**
  - `solid-js`, `@solidjs/*` and `@spell-app/solid-element` are external, as a FUNCTION so subpaths match
    (`SOLID_EXTERNAL` in `vite.config.ts`).  `dist/` contains no Solid or fork code and imports the three by
    specifier.
  - **Two shared entries** (`SHARED_ENTRIES`):
    - `src/core.ts` -- the element core (`UIHost`, `UIElement`, `ElementDefinition`, `ContentPart` + `PartContext`,
      `Controlled`, `Cell`, `SlotContent`, `HostAttribute`, `IconGlyph`) AND the foundation it uses:  `$/ui/util`,
      `$/ui/vocabulary`, from `$/ui/elements` `ClassBuilder` / `Shorthand` / `OwnerContext` / `NativeFallback`,
      `$/ui/runtime` (the eager loader only), `$/ui/icons` (`IconName`, `BuiltInPacks`), `$/ui/components/components.types`
    - `src/forms.ts` -- `FormElement`, `FormHost`, `Validator`, `MenuOptions`;  imported by `dropdown` only.
      `ui-button` is form-associated through the fork's `formAssociated` option alone, so it stays on `core`.
  - Every component file (classes AND native fallback) imports shared code through ONE path, `$/ui/core` (and
    `$/ui/forms` where needed);  the vocabulary and the sheet are the family's own.  Two chunking rules:
    - `core.ts` / `forms.ts` re-export `$/ui/elements` LEAVES, never the barrel:  the barrel holds the `forms` files
    - `FormHost` / `FormElement` import the element core through the `$/ui/core` ENTRY:  importing its leaves made
      Rolldown hoist everything `core` and `forms` share into a third chunk, and `core.js` became a facade
  - `styles` is its own entry (`dist/styles.js`):  the `index` entry re-exports the foundation sheets, and without
    an entry of their own they landed in `index.js`, which the lazy `UIRuntime` chunk then imported -- loading the
    runtime on a button-only page would have pulled every family.
  - `rolldownOptions.preserveEntrySignatures: "allow-extension"`;  `ui-button.css` + the button vocabulary land in a
    shared `button-<hash>.js` (the dropdown adopts `ui-button.css`).
  - The `E` / `V` namespaces are their own entry, `api` (`src/api.ts`, `@spell-app/ui/api`);  `index.js` is flat.
    Namespacing a module that `core` also reaches (as `index.ts` once did with `export * as V from "$/ui/vocabulary"`)
    made Rolldown move its runtime module (`__name`, `__exportAll`) out of `core.js` into a shared
    `rolldown-runtime-<hash>.js` that `core.js` and every family imported:  one more request per page (0.19 kB
    min+gz).  So `V` namespaces an api-only re-export of the barrel (`vocabulary.api.ts`), and `api.ts` imports the
    `forms` entry so the `forms` leaves stay in `forms.js`.  `core.js` keeps the helpers and exports `__exportAll`
    to `api.js` (+0.06 kB min+gz).  A button-only page:  3 of our files instead of 4.  The check
    `no Rolldown runtime chunk` guards it.
  - Icons are separate files (`dist/icon-packs/<id>/`:  SVGs + `pack.js`, copied by `emitIconPacks()`), found
    relative to the chunk holding `BuiltInPacks` (`core.js`) and loaded by the runtime (`UI.icons`);  see
    `docs/icons.md`.
- **Measuring** (`BundleMeasure`):  the repo's Vite config, built in memory with entries `core` + `forms` + one per
  family + `api` (it changes how `core.js` comes out;  `vite:dts` and the icon-pack copy dropped;  no `index` or
  `styles`);  every module is attributed to a bucket by id (`tools/package.config.ts`):  `library`, `core`,
  `shared:forms`, `own:<family>:classes|css|vocabulary|fallback`, `extra:api`, lazy `runtime` / `icons`.  Each tier
  is minified (esbuild) and gzipped (level 9) ON ITS OWN;  a scenario sums, per family, only the shared entries its
  chunk imports.  `library (as used)` bundles exactly the bindings `dist/` imports from each peer specifier;
  `library (full)` every export, for comparison.
- **Standalone** (for comparison):  each family built ALONE with Solid and the fork bundled and tree-shaken, eager
  chunks summed -- what an app bundling everything itself would ship.

### Tiers

<!-- generated:bundle-tiers -->
| Tier | min kB | min+gz kB | Loaded |
| --- | --: | --: | --- |
| library (as used:  the bindings `dist/` imports) | 78.42 | 28.08 | eager |
| library (full:  every export of the peer set) | 175.32 | 61.03 | comparison |
| core (element core + foundation JS) | 76.97 | 25.25 | eager |
| forms (form base, validation, menu options;  imported by `ui-dropdown`, `ui-input`, `ui-checkbox`, `ui-form`, `ui-select`, `ui-search`, `ui-rating`, `ui-slider`, `ui-calendar`) | 21.54 | 7.63 | eager |
| own, all 59 families | 1788.41 | 512.00 | eager |
| api (`E` / `V` namespaces, `@spell-app/ui/api`) | 0.10 | 0.09 | app only |
| styles (extra entry) | 127.58 | 16.62 | app only |
| runtime (`UIRuntime` + foundation CSS) | 365.28 | 193.64 | lazy |
| icons (none bundled:  pack indexes and SVGs are separate files, `docs/icons.md`) | 0.00 | 0.00 | lazy |
| family data (emoji name chunks, each loaded on its own) | 1213.11 | 327.13 | lazy |
<!-- /generated:bundle-tiers -->

### Own cost per family

<!-- generated:bundle-families -->
| Family | own min+gz kB | classes | css | vocabulary | fallback | imports | page with only it | standalone (library bundled) |
| --- | --: | --: | --: | --: | --: | --- | --: | --: |
| `ui-button` | **14.10** | 4.99 | 4.23 | 2.87 | 2.20 | core | 67.43 | 47.38 |
| `ui-dropdown` | **17.27** | 7.63 | 4.90 | 2.51 | 2.53 | core + forms | 78.23 | 67.94 |
| `ui-icon` | **5.84** | 2.19 | 1.91 | 1.29 | 1.59 | core | 59.17 | 37.46 |
| `ui-label` | **8.86** | 2.89 | 3.56 | 1.78 | 1.57 | core | 62.19 | 52.05 |
| `ui-parts` | **15.41** | 5.52 | 5.66 | 2.58 | 1.59 | core | 68.74 | 53.04 |
| `ui-divider` | **3.87** | 1.67 | 0.94 | 0.80 | 1.49 | core | 57.19 | 35.54 |
| `ui-segment` | **7.50** | 2.27 | 3.34 | 1.52 | 1.45 | core | 60.83 | 39.05 |
| `ui-container` | **3.39** | 1.45 | 0.84 | 0.69 | 1.40 | core | 56.71 | 34.35 |
| `ui-grid` | **9.40** | 2.53 | 3.68 | 1.79 | 1.42 | core | 62.73 | 40.95 |
| `ui-image` | **5.71** | 2.31 | 1.63 | 1.28 | 1.60 | core | 59.04 | 36.87 |
| `ui-text` | **2.76** | 1.47 | 0.40 | 0.46 | 1.40 | core | 56.08 | 33.72 |
| `ui-flag` | **5.97** | 4.15 | 0.56 | 0.64 | 1.65 | core | 59.29 | 38.73 |
| `ui-loader` | **4.30** | 1.65 | 1.28 | 0.79 | 1.54 | core | 57.63 | 35.72 |
| `ui-placeholder` | **5.95** | 3.31 | 1.36 | 0.90 | 1.54 | core | 59.28 | 37.27 |
| `ui-message` | **5.82** | 2.04 | 1.86 | 1.09 | 1.84 | core | 59.15 | 37.73 |
| `ui-breadcrumb` | **5.34** | 2.99 | 1.02 | 0.80 | 1.77 | core | 58.67 | 37.13 |
| `ui-input` | **10.80** | 4.68 | 2.83 | 2.11 | 2.24 | core + forms | 71.76 | 53.78 |
| `ui-checkbox` | **9.44** | 5.21 | 2.73 | 0.65 | 2.14 | core + forms | 70.39 | 49.01 |
| `ui-form` | **11.49** | 6.62 | 2.23 | 2.14 | 1.57 | core + forms | 72.45 | 54.60 |
| `ui-item` | **4.98** | 2.79 | 0.37 | 1.02 | 1.92 | core | 58.31 | 41.44 |
| `ui-list` | **7.29** | 2.02 | 3.52 | 1.02 | 1.65 | core | 60.62 | 47.51 |
| `ui-menu` | **11.89** | 2.88 | 5.39 | 2.03 | 1.62 | core | 65.22 | 52.12 |
| `ui-table` | **14.59** | 4.99 | 5.58 | 2.21 | 1.94 | core | 67.91 | 49.80 |
| `ui-popup` | **8.97** | 4.13 | 2.59 | 1.55 | 1.84 | core | 62.30 | 40.02 |
| `ui-modal` | **9.22** | 4.33 | 2.11 | 1.54 | 2.44 | core | 62.55 | 73.97 |
| `ui-transition` | **5.06** | 3.09 | 0.28 | 0.94 | 1.90 | core | 58.39 | 36.08 |
| `ui-dimmer` | **6.27** | 3.02 | 1.05 | 1.27 | 2.11 | core | 59.60 | 37.57 |
| `ui-flyout` | **5.17** | 1.41 | 1.85 | 1.35 | 1.55 | core | 58.50 | 76.61 |
| `ui-sidebar` | **8.45** | 4.56 | 1.82 | 1.44 | 1.88 | core | 61.78 | 39.88 |
| `ui-shape` | **6.35** | 4.31 | 0.80 | 0.88 | 1.56 | core | 59.67 | 37.41 |
| `ui-card` | **9.00** | 3.34 | 3.01 | 1.76 | 1.90 | core | 62.32 | 59.23 |
| `ui-items` | **4.51** | 1.59 | 1.62 | 0.79 | 1.50 | core | 57.84 | 58.91 |
| `ui-feed` | **5.95** | 2.68 | 1.57 | 1.00 | 1.88 | core | 59.28 | 56.81 |
| `ui-comment` | **4.53** | 2.39 | 0.85 | 0.81 | 1.70 | core | 57.85 | 54.99 |
| `ui-statistic` | **5.41** | 2.32 | 1.38 | 1.34 | 1.56 | core | 58.74 | 48.54 |
| `ui-step` | **10.43** | 3.09 | 3.85 | 1.93 | 1.96 | core | 63.76 | 52.89 |
| `ui-rail` | **2.93** | 1.45 | 0.53 | 0.54 | 1.40 | core | 56.25 | 33.89 |
| `ui-reveal` | **4.14** | 2.04 | 0.91 | 0.64 | 1.58 | core | 57.46 | 35.39 |
| `ui-ad` | **3.50** | 1.52 | 0.85 | 0.63 | 1.51 | core | 56.83 | 34.46 |
| `ui-emoji` | **5.16** | 3.25 | 0.61 | 0.77 | 1.57 | core | 58.49 | 36.73 |
| `ui-select` | **8.02** | 3.31 | 2.21 | 1.11 | 2.58 | core + forms | 68.98 | 54.81 |
| `ui-search` | **13.10** | 6.77 | 2.46 | 2.14 | 2.13 | core + forms | 74.06 | 57.06 |
| `ui-progress` | **7.45** | 3.32 | 2.07 | 1.32 | 1.77 | core | 60.78 | 39.13 |
| `ui-rating` | **6.57** | 3.68 | 0.94 | 1.00 | 2.12 | core + forms | 67.53 | 45.47 |
| `ui-slider` | **9.49** | 4.98 | 1.92 | 1.42 | 2.27 | core + forms | 70.45 | 49.45 |
| `ui-accordion` | **7.73** | 3.99 | 1.61 | 1.38 | 1.91 | core | 61.05 | 61.62 |
| `ui-tab` | **9.22** | 5.25 | 0.97 | 2.21 | 2.15 | core | 62.55 | 51.75 |
| `ui-toast` | **11.34** | 6.44 | 2.23 | 1.82 | 2.16 | core | 64.66 | 58.45 |
| `ui-nag` | **6.20** | 3.30 | 0.95 | 1.24 | 1.77 | core | 59.53 | 37.96 |
| `ui-sticky` | **3.37** | 2.00 | 0.31 | 0.57 | 1.52 | core | 56.70 | 35.61 |
| `ui-visibility` | **3.73** | 2.23 | 0.14 | 0.85 | 1.60 | core | 57.06 | 35.01 |
| `ui-embed` | **6.43** | 3.59 | 0.87 | 1.23 | 2.11 | core | 59.76 | 38.09 |
| `ui-calendar` | **15.84** | 9.82 | 2.04 | 2.22 | 2.19 | core + forms | 76.80 | 58.66 |
| `ui-root` | **8.90** | 6.46 | 0.35 | 1.79 | 1.37 | core | 62.23 | 63.36 |
| `ui-section` | **13.83** | 5.12 | 3.48 | 2.67 | 3.04 | core | 67.15 | 53.05 |
| `ui-panel` | **3.60** | 1.40 | 1.28 | 0.47 | 1.41 | core | 56.93 | 56.70 |
| `ui-include` | **4.06** | 2.58 | 0.17 | 0.81 | 1.52 | core | 57.38 | 73.82 |
| `ui-code` | **7.02** | 4.45 | 1.12 | 0.91 | 1.55 | core | 60.35 | 50.01 |
| `ui-markdown` | **69.06** | 65.23 | 1.39 | 1.14 | 1.52 | core | 122.39 | 61.39 |
<!-- /generated:bundle-families -->

### Scenarios

<!-- generated:bundle-scenarios -->
| Scenario | Adds up | shared runtime min+gz kB | standalone build |
| --- | --- | --: | --: |
| page with one button | library + core + own:ui-button | **67.43** | 47.38 |
| all families | library + core + forms + own (59 families) | **572.95** | 507.12 |
| app already ships the library | core + forms + own (59 families) | **544.87** | -- |
<!-- /generated:bundle-scenarios -->

### Checks

<!-- generated:bundle-checks -->
| Check | Result |
| --- | --- |
| every family entry imports `core.js` | pass |
| no Rolldown runtime chunk (`rolldown-runtime-<hash>.js`):  its helpers stay in `core.js` | pass |
| no shared-entry module outside its own chunk (`core.js`, `forms.js` ...) | pass |
| no Solid / fork module in `dist/` | pass |
| no doc-only `<ui-docs-*>` module in `dist/` | pass |
| runtime + icon data only in lazy chunks | pass |
| every module attributed to a bucket | pass |
| every external specifier is in the peer set | pass |
| `light-dark()` kept as is (never lowered to `--lightningcss-*` variables) | pass |
<!-- /generated:bundle-checks -->

### Notes

- **Unchanged by the promotion:**  within 0.05 kB of the spike's last numbers (core 14.59 vs 14.63, page with one
  button 53.03 vs 53.08, all families 118.71 vs 118.76);  `core` lost a little with the per-icon glyph loader.
- **Vendored Solid now shrinks too.**  The Solid 2 host page's identity probe moved out of shipped code into the
  page (`tools/frameworks/solid/identity.js`), and binds `createSignal` / `render` instead of `import * as` both
  packages.  `yarn vendor` now tree-shakes all three specifiers to the bindings `dist/` and the smoke pages import:
  30.4 kB min+gz over five files (was 59.9 kB, everything).  `library (as used)` (26.7 kB, one bundle) is what an
  app bundler ships;  the vendored set is a little larger because the pages themselves use `render`, `flush` ...
- **The fork costs 1.5 kB more than what it replaces:**  3.67 kB min+gz vs 2.13 for `@solidjs/element` +
  `component-register` (`yarn fork measure`), for options, prototype accessors, converters, synchronous
  reflection, form hooks, lifecycle hooks and the error boundary.
- **`forms` keeps a button page lean:**  a page with only buttons loads `core` but not `forms`;  the dropdown loads
  both.
- **Fallback bytes are mostly decorator helpers:**  each `ui-<name>.fallback.ts` is minified and gzipped on its own
  here, and about 1.2 kB of that is esbuild's lowered-decorator helpers, repeated in every file with a decorator.
  Net of them the fallbacks are 0.15-1.25 kB each (`docs/fallback.md`).
- **Lazy:**  `UIRuntime` (31.0 kB, with `UI.icons` since 2026-09-30);  icons load from the page's packs:  the
  default pack's index (14.2 kB gzip) on the first icon, then one SVG file per icon drawn.  `label` imports `ui-parts.css` itself (a statistic's label adopts it), counted once, under `parts`.

## LOC

<!-- generated:loc -->
| Group | Files | Lines | Code lines |
| --- | --: | --: | --: |
| element core | 32 | 5774 | 2978 |
| components | 371 | 31116 | 20383 |
| vocabularies & fallbacks | 0 | 0 | 0 |
| foundation | 46 | 10037 | 5144 |
| tests | 318 | 49992 | 42013 |
| tooling | 77 | 13117 | 8932 |
<!-- /generated:loc -->

### Per file

<!-- generated:loc-files -->
| File | Lines | Code lines |
| --- | --: | --: |
| `core.ts` | 65 | 28 |
| `elements/Cell.ts` | 25 | 10 |
| `elements/ClassBuilder.ts` | 178 | 116 |
| `elements/ContentPart.tsx` | 87 | 46 |
| `elements/ControlLabels.ts` | 187 | 110 |
| `elements/Controlled.ts` | 89 | 41 |
| `elements/ElementDefinition.ts` | 224 | 128 |
| `elements/FormElement.ts` | 142 | 61 |
| `elements/FormHost.ts` | 50 | 24 |
| `elements/HostAttribute.ts` | 38 | 19 |
| `elements/HotDefinitions.ts` | 125 | 62 |
| `elements/IconGlyph.ts` | 135 | 64 |
| `elements/LabelWatch.ts` | 104 | 64 |
| `elements/MenuOptions.ts` | 318 | 184 |
| `elements/NativeFallback.ts` | 265 | 118 |
| `elements/OwnerContext.ts` | 62 | 28 |
| `elements/PartContext.ts` | 280 | 137 |
| `elements/RootSettings.ts` | 73 | 32 |
| `elements/Shorthand.ts` | 98 | 52 |
| `elements/SlotContent.ts` | 53 | 30 |
| `elements/SourceBody.ts` | 175 | 90 |
| `elements/SourceBodyHost.ts` | 31 | 13 |
| `elements/SourceElement.tsx` | 474 | 285 |
| `elements/SourceHost.ts` | 136 | 60 |
| `elements/SourceMarkup.ts` | 135 | 91 |
| `elements/StickyWatch.ts` | 213 | 114 |
| `elements/UIElement.tsx` | 646 | 270 |
| `elements/UIHost.ts` | 81 | 30 |
| `elements/Validator.ts` | 460 | 331 |
| `elements/elements.types.ts` | 756 | 307 |
| `elements/index.ts` | 46 | 27 |
| `forms.ts` | 23 | 6 |
| `components/ui-accordion/UIAccordion.tsx` | 387 | 224 |
| `components/ui-accordion/index.ts` | 13 | 4 |
| `components/ui-accordion/ui-accordion.fallback.ts` | 72 | 51 |
| `components/ui-accordion/ui-accordion.types.ts` | 39 | 6 |
| `components/ui-accordion/ui-accordion.vocabulary.en.ts` | 130 | 104 |
| `components/ui-ad/UIAd.tsx` | 43 | 29 |
| `components/ui-ad/index.ts` | 10 | 3 |
| `components/ui-ad/ui-ad.fallback.ts` | 33 | 22 |
| `components/ui-ad/ui-ad.types.ts` | 11 | 1 |
| `components/ui-ad/ui-ad.vocabulary.en.ts` | 70 | 54 |
| `components/ui-breadcrumb/UIBreadcrumb.tsx` | 80 | 48 |
| `components/ui-breadcrumb/UIBreadcrumbSection.tsx` | 60 | 39 |
| `components/ui-breadcrumb/index.ts` | 13 | 5 |
| `components/ui-breadcrumb/ui-breadcrumb-section.vocabulary.en.ts` | 38 | 27 |
| `components/ui-breadcrumb/ui-breadcrumb.fallback.ts` | 57 | 39 |
| `components/ui-breadcrumb/ui-breadcrumb.types.ts` | 12 | 1 |
| `components/ui-breadcrumb/ui-breadcrumb.vocabulary.en.ts` | 48 | 33 |
| `components/ui-button/UIButton.tsx` | 375 | 226 |
| `components/ui-button/UIButtons.tsx` | 34 | 23 |
| `components/ui-button/UIOr.tsx` | 23 | 14 |
| `components/ui-button/index.ts` | 14 | 7 |
| `components/ui-button/ui-button.fallback.ts` | 109 | 77 |
| `components/ui-button/ui-button.types.ts` | 46 | 16 |
| `components/ui-button/ui-button.vocabulary.en.ts` | 167 | 151 |
| `components/ui-button/ui-buttons.vocabulary.en.ts` | 79 | 68 |
| `components/ui-button/ui-or.vocabulary.en.ts` | 33 | 22 |
| `components/ui-calendar/UICalendar.tsx` | 926 | 613 |
| `components/ui-calendar/index.ts` | 13 | 3 |
| `components/ui-calendar/ui-calendar.fallback.ts` | 98 | 67 |
| `components/ui-calendar/ui-calendar.types.ts` | 169 | 69 |
| `components/ui-calendar/ui-calendar.vocabulary.en.ts` | 189 | 173 |
| `components/ui-card/UICard.tsx` | 197 | 130 |
| `components/ui-card/UICards.tsx` | 47 | 27 |
| `components/ui-card/index.ts` | 15 | 6 |
| `components/ui-card/ui-card.fallback.ts` | 66 | 48 |
| `components/ui-card/ui-card.types.ts` | 26 | 5 |
| `components/ui-card/ui-card.vocabulary.en.ts` | 102 | 85 |
| `components/ui-card/ui-cards.vocabulary.en.ts` | 64 | 53 |
| `components/ui-checkbox/UICheckbox.tsx` | 47 | 27 |
| `components/ui-checkbox/UIRadio.tsx` | 147 | 93 |
| `components/ui-checkbox/index.ts` | 13 | 5 |
| `components/ui-checkbox/ui-checkbox.fallback.ts` | 94 | 61 |
| `components/ui-checkbox/ui-checkbox.types.ts` | 142 | 82 |
| `components/ui-checkbox/ui-checkbox.vocabulary.en.ts` | 56 | 38 |
| `components/ui-checkbox/ui-radio.vocabulary.en.ts` | 45 | 32 |
| `components/ui-code/UICode.tsx` | 184 | 114 |
| `components/ui-code/UICodeHost.ts` | 16 | 7 |
| `components/ui-code/index.ts` | 22 | 11 |
| `components/ui-code/ui-code.fallback.ts` | 27 | 16 |
| `components/ui-code/ui-code.types.ts` | 28 | 8 |
| `components/ui-code/ui-code.vocabulary.en.ts` | 75 | 62 |
| `components/ui-comment/UIComment.tsx` | 58 | 37 |
| `components/ui-comment/UIComments.tsx` | 63 | 39 |
| `components/ui-comment/index.ts` | 16 | 6 |
| `components/ui-comment/ui-comment.fallback.ts` | 38 | 27 |
| `components/ui-comment/ui-comment.types.ts` | 25 | 5 |
| `components/ui-comment/ui-comment.vocabulary.en.ts` | 56 | 39 |
| `components/ui-comment/ui-comments.vocabulary.en.ts` | 48 | 36 |
| `components/ui-container/UIContainer.tsx` | 26 | 17 |
| `components/ui-container/index.ts` | 11 | 3 |
| `components/ui-container/ui-container.fallback.ts` | 15 | 9 |
| `components/ui-container/ui-container.vocabulary.en.ts` | 58 | 46 |
| `components/ui-dimmer/UIDimmer.tsx` | 313 | 203 |
| `components/ui-dimmer/index.ts` | 13 | 3 |
| `components/ui-dimmer/ui-dimmer.fallback.ts` | 79 | 56 |
| `components/ui-dimmer/ui-dimmer.vocabulary.en.ts` | 105 | 89 |
| `components/ui-divider/UIDivider.tsx` | 46 | 30 |
| `components/ui-divider/index.ts` | 10 | 3 |
| `components/ui-divider/ui-divider.fallback.ts` | 27 | 20 |
| `components/ui-divider/ui-divider.types.ts` | 11 | 1 |
| `components/ui-divider/ui-divider.vocabulary.en.ts` | 59 | 47 |
| `components/ui-dropdown/SlottedItems.ts` | 131 | 81 |
| `components/ui-dropdown/UIDropdown.tsx` | 939 | 635 |
| `components/ui-dropdown/index.ts` | 14 | 4 |
| `components/ui-dropdown/ui-dropdown.fallback.ts` | 151 | 114 |
| `components/ui-dropdown/ui-dropdown.types.ts` | 43 | 14 |
| `components/ui-dropdown/ui-dropdown.vocabulary.en.ts` | 207 | 192 |
| `components/ui-embed/UIEmbed.tsx` | 183 | 118 |
| `components/ui-embed/UIEmbedHost.ts` | 27 | 13 |
| `components/ui-embed/index.ts` | 12 | 5 |
| `components/ui-embed/ui-embed.fallback.ts` | 107 | 82 |
| `components/ui-embed/ui-embed.types.ts` | 76 | 27 |
| `components/ui-embed/ui-embed.vocabulary.en.ts` | 110 | 95 |
| `components/ui-emoji/UIEmoji.tsx` | 101 | 62 |
| `components/ui-emoji/index.ts` | 14 | 4 |
| `components/ui-emoji/ui-emoji.fallback.ts` | 34 | 25 |
| `components/ui-emoji/ui-emoji.vocabulary.en.ts` | 68 | 46 |
| `components/ui-feed/UIFeed.tsx` | 42 | 26 |
| `components/ui-feed/UIFeedEvent.tsx` | 106 | 63 |
| `components/ui-feed/index.ts` | 15 | 6 |
| `components/ui-feed/ui-event.vocabulary.en.ts` | 54 | 42 |
| `components/ui-feed/ui-feed.fallback.ts` | 49 | 38 |
| `components/ui-feed/ui-feed.types.ts` | 12 | 3 |
| `components/ui-feed/ui-feed.vocabulary.en.ts` | 54 | 38 |
| `components/ui-flag/UIFlag.tsx` | 62 | 38 |
| `components/ui-flag/index.ts` | 12 | 4 |
| `components/ui-flag/ui-flag.fallback.ts` | 38 | 28 |
| `components/ui-flag/ui-flag.types.ts` | 320 | 295 |
| `components/ui-flag/ui-flag.vocabulary.en.ts` | 64 | 38 |
| `components/ui-flyout/UIFlyout.tsx` | 38 | 20 |
| `components/ui-flyout/index.ts` | 18 | 4 |
| `components/ui-flyout/ui-flyout.fallback.ts` | 26 | 16 |
| `components/ui-flyout/ui-flyout.types.ts` | 13 | 3 |
| `components/ui-flyout/ui-flyout.vocabulary.en.ts` | 131 | 112 |
| `components/ui-form/UIField.tsx` | 78 | 48 |
| `components/ui-form/UIFields.tsx` | 34 | 22 |
| `components/ui-form/UIForm.tsx` | 459 | 291 |
| `components/ui-form/UIFormHost.ts` | 45 | 25 |
| `components/ui-form/index.ts` | 16 | 7 |
| `components/ui-form/ui-field.vocabulary.en.ts` | 60 | 46 |
| `components/ui-form/ui-fields.vocabulary.en.ts` | 65 | 52 |
| `components/ui-form/ui-form.fallback.ts` | 27 | 17 |
| `components/ui-form/ui-form.types.ts` | 99 | 38 |
| `components/ui-form/ui-form.vocabulary.en.ts` | 125 | 105 |
| `components/ui-grid/UIColumn.ts` | 14 | 6 |
| `components/ui-grid/UIGrid.ts` | 30 | 12 |
| `components/ui-grid/UIRow.ts` | 12 | 6 |
| `components/ui-grid/index.ts` | 15 | 7 |
| `components/ui-grid/ui-column.vocabulary.en.ts` | 107 | 90 |
| `components/ui-grid/ui-grid.fallback.ts` | 18 | 11 |
| `components/ui-grid/ui-grid.types.ts` | 14 | 2 |
| `components/ui-grid/ui-grid.vocabulary.en.ts` | 132 | 113 |
| `components/ui-grid/ui-row.vocabulary.en.ts` | 91 | 72 |
| `components/ui-icon/UIIcon.tsx` | 63 | 36 |
| `components/ui-icon/UIIcons.tsx` | 38 | 24 |
| `components/ui-icon/index.ts` | 13 | 5 |
| `components/ui-icon/ui-icon.fallback.ts` | 38 | 29 |
| `components/ui-icon/ui-icon.types.ts` | 27 | 8 |
| `components/ui-icon/ui-icon.vocabulary.en.ts` | 90 | 74 |
| `components/ui-icon/ui-icons.vocabulary.en.ts` | 44 | 29 |
| `components/ui-image/UIImage.tsx` | 64 | 44 |
| `components/ui-image/UIImages.tsx` | 28 | 18 |
| `components/ui-image/index.ts` | 13 | 5 |
| `components/ui-image/ui-image.fallback.ts` | 46 | 31 |
| `components/ui-image/ui-image.vocabulary.en.ts` | 89 | 71 |
| `components/ui-image/ui-images.vocabulary.en.ts` | 42 | 31 |
| `components/ui-include/UIInclude.tsx` | 232 | 132 |
| `components/ui-include/UIIncludeHost.ts` | 17 | 7 |
| `components/ui-include/index.ts` | 15 | 6 |
| `components/ui-include/ui-include.fallback.ts` | 22 | 15 |
| `components/ui-include/ui-include.types.ts` | 34 | 9 |
| `components/ui-include/ui-include.vocabulary.en.ts` | 61 | 48 |
| `components/ui-input/UIInput.tsx` | 216 | 142 |
| `components/ui-input/UITextarea.tsx` | 48 | 37 |
| `components/ui-input/index.ts` | 12 | 5 |
| `components/ui-input/ui-input.fallback.ts` | 111 | 83 |
| `components/ui-input/ui-input.types.ts` | 56 | 18 |
| `components/ui-input/ui-input.vocabulary.en.ts` | 179 | 155 |
| `components/ui-input/ui-textarea.vocabulary.en.ts` | 94 | 74 |
| `components/ui-item/UIItem.tsx` | 256 | 143 |
| `components/ui-item/index.ts` | 13 | 4 |
| `components/ui-item/ui-item.fallback.ts` | 62 | 44 |
| `components/ui-item/ui-item.vocabulary.en.ts` | 98 | 81 |
| `components/ui-items/UIItems.tsx` | 58 | 34 |
| `components/ui-items/index.ts` | 14 | 5 |
| `components/ui-items/ui-items.fallback.ts` | 19 | 12 |
| `components/ui-items/ui-items.vocabulary.en.ts` | 76 | 61 |
| `components/ui-label/UILabel.tsx` | 155 | 91 |
| `components/ui-label/UILabels.tsx` | 24 | 15 |
| `components/ui-label/index.ts` | 12 | 5 |
| `components/ui-label/ui-label.fallback.ts` | 32 | 26 |
| `components/ui-label/ui-label.types.ts` | 11 | 1 |
| `components/ui-label/ui-label.vocabulary.en.ts` | 132 | 115 |
| `components/ui-label/ui-labels.vocabulary.en.ts` | 39 | 28 |
| `components/ui-list/UIList.tsx` | 136 | 70 |
| `components/ui-list/index.ts` | 13 | 4 |
| `components/ui-list/ui-list.fallback.ts` | 35 | 21 |
| `components/ui-list/ui-list.vocabulary.en.ts` | 86 | 69 |
| `components/ui-loader/UILoader.tsx` | 67 | 40 |
| `components/ui-loader/index.ts` | 10 | 3 |
| `components/ui-loader/ui-loader.fallback.ts` | 25 | 17 |
| `components/ui-loader/ui-loader.types.ts` | 11 | 1 |
| `components/ui-loader/ui-loader.vocabulary.en.ts` | 66 | 50 |
| `components/ui-markdown/UIMarkdown.tsx` | 471 | 299 |
| `components/ui-markdown/UIMarkdownHost.ts` | 32 | 13 |
| `components/ui-markdown/index.ts` | 19 | 8 |
| `components/ui-markdown/ui-markdown.fallback.ts` | 23 | 14 |
| `components/ui-markdown/ui-markdown.types.ts` | 65 | 23 |
| `components/ui-markdown/ui-markdown.vocabulary.en.ts` | 87 | 74 |
| `components/ui-menu/UIMenu.tsx` | 295 | 168 |
| `components/ui-menu/index.ts` | 13 | 4 |
| `components/ui-menu/ui-menu.fallback.ts` | 29 | 20 |
| `components/ui-menu/ui-menu.types.ts` | 36 | 12 |
| `components/ui-menu/ui-menu.vocabulary.en.ts` | 177 | 153 |
| `components/ui-message/UIMessage.tsx` | 94 | 55 |
| `components/ui-message/index.ts` | 10 | 3 |
| `components/ui-message/ui-message.fallback.ts` | 54 | 38 |
| `components/ui-message/ui-message.vocabulary.en.ts` | 92 | 74 |
| `components/ui-modal/UIModal.tsx` | 24 | 13 |
| `components/ui-modal/index.ts` | 26 | 11 |
| `components/ui-modal/ui-modal.fallback.ts` | 135 | 96 |
| `components/ui-modal/ui-modal.types.ts` | 97 | 34 |
| `components/ui-modal/ui-modal.vocabulary.en.ts` | 145 | 126 |
| `components/ui-nag/UINag.tsx` | 237 | 145 |
| `components/ui-nag/UINagHost.ts` | 34 | 19 |
| `components/ui-nag/index.ts` | 12 | 5 |
| `components/ui-nag/ui-nag.fallback.ts` | 37 | 27 |
| `components/ui-nag/ui-nag.types.ts` | 26 | 10 |
| `components/ui-nag/ui-nag.vocabulary.en.ts` | 103 | 90 |
| `components/ui-panel/UIPanel.tsx` | 45 | 17 |
| `components/ui-panel/index.ts` | 11 | 3 |
| `components/ui-panel/ui-panel.fallback.ts` | 24 | 11 |
| `components/ui-panel/ui-panel.types.ts` | 14 | 2 |
| `components/ui-panel/ui-panel.vocabulary.en.ts` | 49 | 24 |
| `components/ui-parts/PartElement.ts` | 12 | 5 |
| `components/ui-parts/UIActions.ts` | 13 | 6 |
| `components/ui-parts/UIAuthor.ts` | 24 | 15 |
| `components/ui-parts/UIAvatar.tsx` | 28 | 18 |
| `components/ui-parts/UIContent.ts` | 19 | 9 |
| `components/ui-parts/UIDate.ts` | 23 | 13 |
| `components/ui-parts/UIDescription.ts` | 13 | 6 |
| `components/ui-parts/UIDetail.ts` | 21 | 12 |
| `components/ui-parts/UIExtra.ts` | 13 | 6 |
| `components/ui-parts/UIHeader.tsx` | 48 | 30 |
| `components/ui-parts/UIMeta.ts` | 13 | 6 |
| `components/ui-parts/UISummary.ts` | 13 | 6 |
| `components/ui-parts/UITitle.ts` | 20 | 12 |
| `components/ui-parts/UIValue.ts` | 13 | 6 |
| `components/ui-parts/index.ts` | 48 | 41 |
| `components/ui-parts/ui-actions.vocabulary.en.ts` | 38 | 21 |
| `components/ui-parts/ui-author.vocabulary.en.ts` | 39 | 22 |
| `components/ui-parts/ui-avatar.vocabulary.en.ts` | 43 | 26 |
| `components/ui-parts/ui-content.vocabulary.en.ts` | 64 | 47 |
| `components/ui-parts/ui-date.vocabulary.en.ts` | 33 | 16 |
| `components/ui-parts/ui-description.vocabulary.en.ts` | 42 | 25 |
| `components/ui-parts/ui-detail.vocabulary.en.ts` | 33 | 16 |
| `components/ui-parts/ui-extra.vocabulary.en.ts` | 37 | 20 |
| `components/ui-parts/ui-header.vocabulary.en.ts` | 90 | 73 |
| `components/ui-parts/ui-meta.vocabulary.en.ts` | 38 | 21 |
| `components/ui-parts/ui-parts.fallback.ts` | 38 | 25 |
| `components/ui-parts/ui-parts.types.ts` | 65 | 44 |
| `components/ui-parts/ui-summary.vocabulary.en.ts` | 33 | 16 |
| `components/ui-parts/ui-title.vocabulary.en.ts` | 37 | 20 |
| `components/ui-parts/ui-value.vocabulary.en.ts` | 36 | 19 |
| `components/ui-placeholder/UIPlaceholder.tsx` | 39 | 25 |
| `components/ui-placeholder/UIPlaceholderHeader.ts` | 12 | 6 |
| `components/ui-placeholder/UIPlaceholderImage.ts` | 16 | 9 |
| `components/ui-placeholder/UIPlaceholderLine.ts` | 17 | 9 |
| `components/ui-placeholder/UIPlaceholderParagraph.ts` | 11 | 6 |
| `components/ui-placeholder/index.ts` | 21 | 11 |
| `components/ui-placeholder/ui-placeholder-header.vocabulary.en.ts` | 34 | 16 |
| `components/ui-placeholder/ui-placeholder-image.vocabulary.en.ts` | 41 | 23 |
| `components/ui-placeholder/ui-placeholder-line.vocabulary.en.ts` | 42 | 24 |
| `components/ui-placeholder/ui-placeholder-paragraph.vocabulary.en.ts` | 34 | 16 |
| `components/ui-placeholder/ui-placeholder.fallback.ts` | 36 | 26 |
| `components/ui-placeholder/ui-placeholder.vocabulary.en.ts` | 47 | 29 |
| `components/ui-popup/UIPopup.tsx` | 617 | 360 |
| `components/ui-popup/index.ts` | 11 | 3 |
| `components/ui-popup/ui-popup.fallback.ts` | 58 | 39 |
| `components/ui-popup/ui-popup.types.ts` | 46 | 11 |
| `components/ui-popup/ui-popup.vocabulary.en.ts` | 138 | 118 |
| `components/ui-progress/UIProgress.tsx` | 245 | 160 |
| `components/ui-progress/index.ts` | 13 | 4 |
| `components/ui-progress/ui-progress.fallback.ts` | 46 | 30 |
| `components/ui-progress/ui-progress.types.ts` | 14 | 1 |
| `components/ui-progress/ui-progress.vocabulary.en.ts` | 126 | 110 |
| `components/ui-rail/UIRail.tsx` | 29 | 18 |
| `components/ui-rail/index.ts` | 10 | 3 |
| `components/ui-rail/ui-rail.fallback.ts` | 16 | 9 |
| `components/ui-rail/ui-rail.vocabulary.en.ts` | 47 | 32 |
| `components/ui-rating/UIRating.tsx` | 422 | 272 |
| `components/ui-rating/index.ts` | 11 | 3 |
| `components/ui-rating/ui-rating.fallback.ts` | 100 | 70 |
| `components/ui-rating/ui-rating.types.ts` | 18 | 3 |
| `components/ui-rating/ui-rating.vocabulary.en.ts` | 76 | 62 |
| `components/ui-reveal/UIReveal.tsx` | 92 | 59 |
| `components/ui-reveal/index.ts` | 11 | 3 |
| `components/ui-reveal/ui-reveal.fallback.ts` | 35 | 27 |
| `components/ui-reveal/ui-reveal.types.ts` | 17 | 3 |
| `components/ui-reveal/ui-reveal.vocabulary.en.ts` | 66 | 51 |
| `components/ui-root/UIRoot.tsx` | 384 | 239 |
| `components/ui-root/index.ts` | 19 | 8 |
| `components/ui-root/ui-root.catalog.ts` | 206 | 202 |
| `components/ui-root/ui-root.fallback.ts` | 17 | 10 |
| `components/ui-root/ui-root.types.ts` | 72 | 28 |
| `components/ui-root/ui-root.vocabulary.en.ts` | 145 | 131 |
| `components/ui-search/UISearch.tsx` | 760 | 526 |
| `components/ui-search/index.ts` | 12 | 4 |
| `components/ui-search/ui-search.fallback.ts` | 99 | 69 |
| `components/ui-search/ui-search.types.ts` | 78 | 23 |
| `components/ui-search/ui-search.vocabulary.en.ts` | 187 | 168 |
| `components/ui-section/UISection.tsx` | 506 | 299 |
| `components/ui-section/UISections.tsx` | 35 | 17 |
| `components/ui-section/index.ts` | 16 | 5 |
| `components/ui-section/ui-section.fallback.ts` | 284 | 189 |
| `components/ui-section/ui-section.types.ts` | 105 | 24 |
| `components/ui-section/ui-section.vocabulary.en.ts` | 218 | 198 |
| `components/ui-section/ui-sections.vocabulary.en.ts` | 42 | 28 |
| `components/ui-segment/UISegment.tsx` | 65 | 44 |
| `components/ui-segment/UISegments.tsx` | 28 | 18 |
| `components/ui-segment/index.ts` | 13 | 5 |
| `components/ui-segment/ui-segment.fallback.ts` | 15 | 9 |
| `components/ui-segment/ui-segment.vocabulary.en.ts` | 98 | 84 |
| `components/ui-segment/ui-segments.vocabulary.en.ts` | 48 | 34 |
| `components/ui-select/UISelect.tsx` | 357 | 222 |
| `components/ui-select/index.ts` | 13 | 4 |
| `components/ui-select/ui-select.fallback.ts` | 171 | 129 |
| `components/ui-select/ui-select.types.ts` | 65 | 21 |
| `components/ui-select/ui-select.vocabulary.en.ts` | 92 | 73 |
| `components/ui-shape/UIShape.tsx` | 406 | 260 |
| `components/ui-shape/UISide.tsx` | 56 | 36 |
| `components/ui-shape/index.ts` | 13 | 6 |
| `components/ui-shape/ui-shape.fallback.ts` | 33 | 20 |
| `components/ui-shape/ui-shape.types.ts` | 28 | 5 |
| `components/ui-shape/ui-shape.vocabulary.en.ts` | 63 | 48 |
| `components/ui-shape/ui-side.vocabulary.en.ts` | 36 | 22 |
| `components/ui-sidebar/UIPushable.tsx` | 119 | 76 |
| `components/ui-sidebar/UIPusher.tsx` | 35 | 22 |
| `components/ui-sidebar/UISidebar.tsx` | 330 | 202 |
| `components/ui-sidebar/index.ts` | 15 | 7 |
| `components/ui-sidebar/ui-pushable.vocabulary.en.ts` | 36 | 16 |
| `components/ui-sidebar/ui-pusher.vocabulary.en.ts` | 36 | 16 |
| `components/ui-sidebar/ui-sidebar.fallback.ts` | 62 | 39 |
| `components/ui-sidebar/ui-sidebar.types.ts` | 26 | 6 |
| `components/ui-sidebar/ui-sidebar.vocabulary.en.ts` | 109 | 89 |
| `components/ui-slider/UISlider.tsx` | 549 | 351 |
| `components/ui-slider/index.ts` | 13 | 4 |
| `components/ui-slider/ui-slider.fallback.ts` | 117 | 81 |
| `components/ui-slider/ui-slider.types.ts` | 19 | 3 |
| `components/ui-slider/ui-slider.vocabulary.en.ts` | 117 | 103 |
| `components/ui-statistic/UIStatistic.tsx` | 63 | 40 |
| `components/ui-statistic/UIStatistics.tsx` | 42 | 22 |
| `components/ui-statistic/index.ts` | 15 | 5 |
| `components/ui-statistic/ui-statistic.fallback.ts` | 28 | 20 |
| `components/ui-statistic/ui-statistic.types.ts` | 14 | 1 |
| `components/ui-statistic/ui-statistic.vocabulary.en.ts` | 68 | 47 |
| `components/ui-statistic/ui-statistics.vocabulary.en.ts` | 79 | 59 |
| `components/ui-step/UIStep.tsx` | 157 | 96 |
| `components/ui-step/UISteps.tsx` | 51 | 25 |
| `components/ui-step/index.ts` | 14 | 5 |
| `components/ui-step/ui-step.fallback.ts` | 68 | 51 |
| `components/ui-step/ui-step.types.ts` | 19 | 3 |
| `components/ui-step/ui-step.vocabulary.en.ts` | 85 | 65 |
| `components/ui-step/ui-steps.vocabulary.en.ts` | 111 | 92 |
| `components/ui-sticky/UISticky.tsx` | 163 | 85 |
| `components/ui-sticky/index.ts` | 10 | 3 |
| `components/ui-sticky/ui-sticky.fallback.ts` | 20 | 13 |
| `components/ui-sticky/ui-sticky.types.ts` | 21 | 4 |
| `components/ui-sticky/ui-sticky.vocabulary.en.ts` | 62 | 49 |
| `components/ui-tab/UITab.tsx` | 168 | 105 |
| `components/ui-tab/UITabs.tsx` | 503 | 287 |
| `components/ui-tab/index.ts` | 14 | 5 |
| `components/ui-tab/ui-tab.fallback.ts` | 94 | 63 |
| `components/ui-tab/ui-tab.types.ts` | 49 | 15 |
| `components/ui-tab/ui-tab.vocabulary.en.ts` | 79 | 58 |
| `components/ui-tab/ui-tabs.vocabulary.en.ts` | 161 | 137 |
| `components/ui-table/UITable.tsx` | 486 | 282 |
| `components/ui-table/index.ts` | 11 | 3 |
| `components/ui-table/ui-table.fallback.ts` | 76 | 51 |
| `components/ui-table/ui-table.types.ts` | 25 | 4 |
| `components/ui-table/ui-table.vocabulary.en.ts` | 203 | 186 |
| `components/ui-text/UIText.tsx` | 32 | 21 |
| `components/ui-text/index.ts` | 10 | 3 |
| `components/ui-text/ui-text.fallback.ts` | 15 | 9 |
| `components/ui-text/ui-text.vocabulary.en.ts` | 44 | 30 |
| `components/ui-toast/UIToast.tsx` | 627 | 401 |
| `components/ui-toast/UIToastHost.ts` | 19 | 10 |
| `components/ui-toast/index.ts` | 19 | 8 |
| `components/ui-toast/ui-toast.fallback.ts` | 79 | 60 |
| `components/ui-toast/ui-toast.types.ts` | 59 | 17 |
| `components/ui-toast/ui-toast.vocabulary.en.ts` | 160 | 142 |
| `components/ui-transition/UITransition.tsx` | 303 | 180 |
| `components/ui-transition/index.ts` | 14 | 4 |
| `components/ui-transition/ui-transition.fallback.ts` | 78 | 49 |
| `components/ui-transition/ui-transition.types.ts` | 59 | 35 |
| `components/ui-transition/ui-transition.vocabulary.en.ts` | 89 | 73 |
| `components/ui-visibility/UIVisibility.tsx` | 179 | 118 |
| `components/ui-visibility/index.ts` | 13 | 3 |
| `components/ui-visibility/ui-visibility.fallback.ts` | 31 | 23 |
| `components/ui-visibility/ui-visibility.types.ts` | 35 | 8 |
| `components/ui-visibility/ui-visibility.vocabulary.en.ts` | 72 | 59 |
<!-- /generated:loc-files -->

Counted by `LocCount` (non-blank, non-comment lines as "code").  The fork is not counted here:  693 code lines in
15 modules (vs 349 for the two originals), each fix one module + one test file
(`packages/solid-element/UPSTREAM.md`).

## Element core

### Declaring attributes and properties

- **Nothing is declared per attribute.**  `ElementDefinition` walks the vocabulary and hands the fork one prop per
  attribute:  `{ value, attribute, property?, reflect, converter: { fromAttribute, fromProperty, toAttribute } }`,
  keyed by camelCase canonical name.  The fork's props ARE `this.attrs`:  one signal each, already converted,
  typed from the `as const` vocabulary (`AttributeValues<V>`).
- **Booleans:**  `Converters.boolean` (`yes` / `no` work) on BOTH paths:  `el.primary = "yes"` stores `true`.
  Reflection writes `""` or removes the attribute, never `"true"`.  Attribute writes never reflect back.
- **Values:**  localized values are canonicalized on the way in, from attributes AND property writes
  (`button.color = "verde"` on `<ie-boton>` stores `green`, reflects `verde`);  arrays reflect comma-joined;
  `json` kinds (`options`) observe their attribute but never reflect.
- **Reserved names:**  the fork THROWS at definition when a prop's property would shadow an element member
  (`hidden`, `title`, `style`, its own `dispose` ...) unless renamed with the vocabulary's `property`
  (`dividerHidden`).
- **Pre-upgrade properties:**  the fork's upgrade step (captured in the constructor, re-applied through the
  setters).
- **Platform options instead of plumbing:**  `UIElement.define()` passes `BaseElement` (`UIHost` / `FormHost`),
  `shadowRootInit: { mode: "open", delegatesFocus }`, `internals: true`, `formAssociated`, `keepAlive: true`,
  `errorBoundary`, `onError`, `fallback`.
- **Names:**  no attribute, event, slot or part literal in a template:  `this.part("button")`, `this.slot("icon")`,
  `this.emit("ui-toggle", ...)`, type-checked against the vocabulary.

### Templating, owner context, content parts

- JSX compiles to real DOM with fine-grained bindings.  `<Show>` / `<For>` (keyed:  filtering never recreates a
  row that stays visible);  contract classes use Solid 2's `class={[ITEM, { [ACTIVE]: chosen }]}`;  `<Dynamic>`
  for a part's varying root tag;  icon `<svg>` clones inserted as is (`IconGlyph.draw()`).
- **`PartContext`** holds the owner as a signal and a page-wide registry filled by `UIElement.define()`;
  resolution is `OwnerContext.find()` over the flat tree, with a barrier at every registered non-part component.
  It re-resolves on every re-connect (the fork's `onConnect`;  `keepAlive` keeps the controller across moves), on
  `slotchange` in any element's shadow root, and once after first settle.
- **`ContentPart`** (in `core`) + a family base `PartElement` (in `parts`) make the 13 parts cheap:  six are
  14-line files.
- **App context reaches components:**  `UIElement.AppContext` is read by every controller;  on the Solid 2 host
  page the app provides it around the dropdown and the component sees the app's value.
- **Platform limit:**  no event tells an element its assigned slot changed;  a foreign component re-slotting a
  part isn't seen until the part reconnects.

### What Solid 2 asks of component authors

The rules are in `AGENTS.md`, "Solid authoring".
- **Eager memos:**  Solid 2 memos compute at creation;  base-class memos that call overridables are
  `{ lazy: true }`, and effects that call overridables are created in `mount()`, after subclass fields exist.
- **No signal writes in owned scopes:**  the fork's hooks can run inside a Solid render, so `isConnected` and the
  fieldset `isFormDisabled` replay are deferred a microtask.
- **Writes land on a microtask:**  tests `flush()` (`ElementFixture.settle()` / `tick()`).
- **`keepAlive` has a cost:**  a removed element keeps its reactive root until `dispose()` or garbage collection;
  anything page-wide (overlay entries) must follow `isConnected`, not disposal.
- **Dev diagnostics** flag the `classes()` memo as `WIDE_SCOPE_DEPS` (it reads every attribute);  the production
  build drops them.

## Hot module replacement

Edit a component in `yarn dev` and every live instance updates in place:  same host objects,
host attributes and properties kept (the dropdown's `options` and controlled `value` included), no page reload.
Open `tools/demo/hmr.html` and edit `UIButton.tsx`, `ui-button.css` or `ui-button.vocabulary.en.ts`.

- **How:**
  - The fork's `solidElementHot()` (`vite.config.ts`, `apply: "serve"`) appends
    `import.meta.hot.accept(() => hotUpdate(import.meta.hot))` to each component barrel
    (`src/components/ui-<name>/index.ts`, the modules that call `define()`).  An edit to a component class, its
    vocabulary or fallback climbs to its barrel, which Vite re-runs with the fresh modules.
  - `define()` is idempotent per tag, so the barrel's `UIButton.define()` would return the OLD class.
    `HotDefinitions` (`src/elements/`, dev only, the plugin's `setup` import) wraps it:  a DIFFERENT class of the
    SAME name defining a known tag is a new version, and takes over every tag the old one had (`<ie-boton>`
    included) through `UIElement.defineTag()`.
  - The fork swaps each class's component, props and options in place, migrates each instance's values, then
    `hotUpdate()` disposes and re-renders every live instance.
  - A changed vocabulary goes through `UI.vocabulary.replace()` (the registry refuses a SECOND object for a tag
    otherwise), which also re-resolves the runtime's translated names from it;  changed English texts reach
    `UI.i18n` where no translation replaced them.
  - CSS:  `?inline` component sheets self-accept;  `HotDefinitions.updateStyle()` re-registers the sheet by name
    and `Styles.register()` replaces its rules in every adopted shadow root.  Nothing re-renders.
- **Limits:**
  - Component-internal state resets:  a search query, the highlighted row, an open menu, an uncontrolled toggle.
  - Anything the platform reads once can't change:  observed attributes, `formAssociated`, the host base class,
    shadow root options.  The page reloads with `<ui-button>: observed attributes changed (+size), full reload`.
  - Shared code (`core`, `forms`, `UIElement`, the runtime, `HotDefinitions`) reaches several barrels:  full
    reload.  A module reaching ONE barrel (a vocabulary, a fallback, `SlottedItems`) stays hot.
  - A class renamed in the edit, or a vocabulary whose tag changed, defines as NEW;  old instances keep the old.
- **Test:**  `yarn test:hmr` (`tools/hmr.e2e.ts`) starts the dev server, opens `tools/demo/hmr.html` in headless
  chromium and edits the real files (restored after each scenario, then checked against their original text and
  `git diff --quiet`).  8 / 8 pass, ~4 s:  component code (button;  dropdown keeping its properties), CSS without
  re-render, a vocabulary text, a throwing render (fallback, then recovery), a syntax error, a new vocabulary
  attribute (full reload), shared code (full reload).
- **Cost:**  dev only.  The plugin appends ~200 bytes to each barrel and style module;  the fork's HMR paths sit
  behind `import.meta.hot`, which a build replaces with `undefined`.

## Performance

### Method

`test/PerfRun.ts`:  a `search selection` dropdown, 1000 options set through the `options` property, open by a
click on the search input, then `"united sta"` typed one character per keystroke (rows narrow 1000 => 30).  Per
step, from just before the event:  `update` until `flush()` returns, `+ layout` after a forced reflow, `+ frame`
after the next animation frame.  A warm-up pass runs first and is dropped.  Two runs:  the dropdown perf test (dev
Solid, Vite dev server) and the smoke perf page (`dist/` + vendored production Solid,
`tools/smoke/perf-adapter.js`).

### Results

<!-- generated:perf -->
| Where | Build | Open: update / + layout / + frame ms | Keystroke update min / avg / max ms | + layout | + frame |
| --- | --- | --: | --: | --: | --: |
| vitest browser mode | dev (Vite dev server) | 23.8 / 23.8 / 26.4 | 0.5 / **2.2** / 5.8 | 1.4 / **4.2** / 11.8 | 9.8 / **15.1** / 16.6 |
| smoke perf page | production (`dist/` + vendored peers) | 17.3 / 17.3 / 18.8 | 0.3 / **1.4** / 3.9 | 0.8 / **3.2** / 10.2 | 14.2 / **15.7** / 16.4 |
<!-- /generated:perf -->

- The test asserts an average update under 16 ms;  it passes with large headroom.  No windowing needed.
- The worst keystroke is the first (`u`):  all 1000 rows still match and each gets `<mark>` highlighting.  First
  open renders all 1000 rows;  it dominates.
- Headless chromium runs at 60 Hz, so `+ frame` snaps to vsync (about 16.7 ms);  compare `update` and `+ layout`.
- `tools/demo/perf.html` runs the same benchmark under `yarn dev`;  set `SPELL_UI_SOLID_PROD=1` for production Solid
  there (the plugin's dev defaults, with performance tracks, are about 5x slower).

## Framework hosts

### Method

`SmokeRunner`:  `yarn build`, then ONE static server (no Vite dev server) serves `dist/`, `vendor/`, `tools/` and
`test/`, and injects one `<script type="importmap">` into every page:  `solid-js`, `@solidjs/web`,
`@spell-app/solid-element` => `/vendor/...`, `@spell-app/ui` => `/dist/index.js`, `@spell-app/ui/core`, `@spell-app/ui/forms`,
`@spell-app/ui/ui-<family>` => `/dist/ui-<name>.js`.  `PeerVendor` builds the three specifiers in one build with the peer
packages deduped (ONE Solid), tree-shaken to the bindings `dist/` and the pages import.  Requests to any host
other than esm.sh / unpkg are blocked.  Each host mounts ONE `<ui-dropdown>` with `options` as a property,
`value="b"` and `open`, and runs the round trip in `tools/frameworks/check.js` (DOM and ARIA only).

### Results

<!-- generated:smoke -->
| Page | Kind | Host | Result | Checks |
| --- | --- | --- | --- | --- |
| `vanilla.html` | host | vanilla | PASS | ok: initialValue, initiallyOpen, optionsIsProperty, pickUpdatesHost, closesAfterPick, hostSetsValue, hostOpens |
| `react.html` | host | react 19.3.0 | PASS | ok: initialValue, initiallyOpen, optionsIsProperty, pickUpdatesHost, closesAfterPick, hostSetsValue, hostOpens |
| `vue.html` | host | vue 3.5.43 | PASS | ok: initialValue, initiallyOpen, optionsIsProperty, pickUpdatesHost, closesAfterPick, hostSetsValue, hostOpens |
| `solid.html` | host | solid 2.0.0-rc.13 (app) + identity hook | PASS | ok: initialValue, initiallyOpen, optionsIsProperty, pickUpdatesHost, closesAfterPick, hostSetsValue, hostOpens, appContext, solidIdentity, webIdentity, contextReachesComponent, unmount, overlaysAfterUnmount |
| `perf.html` | perf | perf (production) | PASS | 1000 options, query `united sta` |
| `compat-solid-1.9.html` | COMPATIBILITY | solid 1.9.9 (esm.sh) + vendored Solid 2 | PASS | ok: initialValue, initiallyOpen, optionsIsProperty, pickUpdatesHost, closesAfterPick, hostSetsValue, hostOpens, appContext, unmount; contextReachesComponent: null (as expected) |
| `translate.html` | check | es (ie-boton, ie-desplegable) | PASS | ok: largePrimary, redBasic, smallBlueDisabled, localizedEvent, localizedPropertyValue |
| `fallback.html` | check | every family, working + failed | PASS | ok: button, dropdown, icon, label, segment, container, divider, parts, oneErrorEach, fallbackSubmits, iconGlyph; 8 console error(s) |
<!-- /generated:smoke -->

### Solid 2 host

- `tools/frameworks/solid/app.tsx`, a compiled Solid 2 app (`HostApp`) with `solid-js` / `@solidjs/web` external.
  Bindings:  `prop:options`, `prop:value`, `prop:open`;  `ui-*` listeners through a `ref` callback (Solid 2
  dropped `on:`).
- The page's identity probe (`identity.js`, loaded before the app;  never in `dist/`) proves:
  - **one module instance** -- `solidIdentity` / `webIdentity`:  the app's `createSignal` / `render` ARE the
    functions the components' copy exports
  - **context flows** -- `contextReachesComponent`:  the app wraps the dropdown in
    `<UIElement.AppContext value="from-the-app">` and the controller inside reads it (owner adoption across the
    custom-element boundary, through the fork's shadow-crossing owner lookup)
  - **signal => prop** (`hostSetsValue`) and **`ui-change` => signal** (`pickUpdatesHost`) with no glue
  - plus the app's own context, unmount, and `overlaysAfterUnmount` (the overlay entry follows `isConnected`)

### Other pages

- **`compat-solid-1.9.html`** -- a COMPATIBILITY check:  a Solid 1.9.9 app from esm.sh next to the page's
  vendored Solid 2.  The round trip passes;  a 1.9 context can't reach the Solid 2 components (`null`, as
  expected).
- **`translate.html`** -- `UIButton.define("ie-boton", es)` and `UIDropdown.define("ie-desplegable", es)` on the
  built classes;  classes canonical, `ie-cambio` fires, a localized PROPERTY value is stored canonical and
  reflected localized.
- **`fallback.html`** (`tools/demo/`) -- every family working beside its failed copy;  its console errors are the
  8 intentional failures.  Also checks that the working `ui-icon` draws its SVG from `dist/icon-packs/`.

### Notes

- `options` always arrived as a property;  the vanilla page sets `options`, `value` and the listener BEFORE the
  element is defined:  the fork's upgrade step is the backstop.
- **Controlled values:**  re-setting `el.value` in a `ui-change` handler reverts the UI (tested).
- **React caveat:**  a React handler that rejects a change leaves the element showing the new value while React
  state keeps the old one;  React won't re-set a prop that hasn't changed.

## Forms & accessibility

- **Form association** is the fork's `formAssociated` option;  form callbacks arrive as hooks:  `onFormReset` =>
  `FormElement.formReset()`, `onFormDisabled` => `UIElement.formDisabled`.  `FormHost` is the form-control API
  (`form`, `validity`, `checkValidity()` ...).
- `FormElement`:  `formValue()` feeds `internals.setFormValue()` (a `string[]` becomes a `FormData`);  `required`
  runs `Validator` into `setValidity(flags, message, anchor)` with `:state(invalid)`;  reset restores the
  connect-time value;  a disabled `<fieldset>` disables the control.
- **Submit buttons:**  `<ui-button type="submit">` calls `internals.form.requestSubmit()`, sending `name=value` by
  setting the button's form value for the duration (a custom element can't be the form's `submitter`).
  **Known gap:**  Enter in a text field doesn't find a custom element as the form's default button.
- **Keyboard:**  `delegatesFocus`;  the APG combobox pattern with real key events (arrows, Home / End, PageUp /
  PageDown, Enter, Space, Tab, Escape routed by `UI.overlays`, type-ahead, Backspace removing the last label).
- **ARIA:**  `aria-activedescendant` needs the listbox in the combobox's own shadow root, so rich `<ui-item>`
  content is PROJECTED into its row;  the combobox is named from `placeholder` (else `text`, else `name`);  a host
  `aria-label` is forwarded to the inner control.
- **axe** passes on every element-markup example (`src/components/ui-<name>/examples/elements/`, 39 files),
  `color-contrast` included (text inside a `.ui.disabled` element exempt, as WCAG exempts inactive components --
  `test/A11y.ts`), with `heading-order` off for two pages of heading demos;  and on every family's native fallback.

## SSR / Declarative Shadow DOM

**DIY, no hydration.**  The fork has no server render yet.  `test/ssr.ssr.test.tsx` (node project) renders the
REAL `UIButton` controller under `@solidjs/web`'s server `renderToString` against a stub host, and wraps it in
`<template shadowrootmode="open" shadowrootdelegatesfocus>` with the foundation CSS + `ui-button.css` inlined.  The
browser half (`test/dsd.test.ts`) parses it with `setHTMLUnsafe`, paints a styled button before any script, then
defines the element:  the fork ADOPTS the declarative root and empties it before its first render.

- The client render replaces the server markup.
- Inlined CSS is about 147 kB per instance uncompressed (DSD has no shared constructable sheets).
- The `ssr` project needs its own Solid plugin instance and `test.css` enabled;  anything that reads the DOM in a
  constructor needs an `isServer` guard.  `yarn test` runs `ssr` first:  `dsd.test.ts` imports its output.

## Error handling & native fallback

- **Boundary:**  the fork's error boundary (on by default) around each element's render.  A throw in the
  constructor, in render, in a memo during an update or in an effect stays local:  the element stops rendering, a
  sibling keeps updating, new elements still render.  Without it (`errorBoundary: false`) the same throw logs
  `[REACTIVITY_HALTED]` and the sibling freezes (tested, `test/isolation.test.tsx`).
- **Hook:**  `UIElement.define()` passes the fork's `onError` (ONE `console.error` naming the tag, a cancelable,
  bubbling, composed `ui-error` with `detail: { error }`;  the fork sets `:state(errored)`) and `fallback`:
  unless `ui-error` was cancelled, the family's `@proto static Fallback` builds its native DOM into the shadow
  root a microtask later.  An element without one (groups, `ui-item`, `ui-or`) gets a bare `<slot>`.
- **What degrades** is listed per family in `docs/fallback.md`;  in short:  button loses `ui-toggle`, the glyph
  and the spinner;  the dropdown becomes a native `<select>` (form value, validity, `host.value` and `ui-change`
  keep working);  parts lose `:state(in-<owner>)` styling.
- **Tests:**  `test/fallback.cases.ts`, run by `test/fallback.test.tsx` through a `FallbackAdapter`
  (`ElementFixture.breakRender()` makes a RENDERED element's next update throw).  All 7 pass, axe included.

## Translation

- `UIButton.define("ie-boton", es)` and `UIDropdown.define("ie-desplegable", es)`, with a 20-line dictionary
  (`test/dictionary.es.ts`):  `test/translate.test.tsx`, `tools/demo/translate.html` (dev) and
  `tools/smoke/translate.html` (from `dist/`).
- A second `ElementDefinition` for the same controller class, from the localized vocabulary:  localized attribute
  AND property names (`primario`, `"primario" in el`) under the SAME canonical keys.  Classes stay canonical;
  events are localized (`ie-cambio`).  A canonical attribute the dictionary doesn't translate still works.

## Testing

- **Suite:**  Vitest, two projects:  `browser` (chromium;  `SPELL_UI_TEST_ALL=1` adds firefox and webkit) and `ssr`
  (node).  Component tests live beside their component (`ui-<name>.test.tsx`);  cross-family ones in `test/`
  (fallback, isolation, translate, SSR, DSD).  The class-grammar CSS tests (`ui-<name>.css.test.ts`) stay:  they test
  the sheets on static markup, which the element tests don't cover.
- **Synchronization:**  `UIHost.ready` + `flush()` (`ElementFixture.render()` / `settle()` / `tick()`);  no sleeps
  except the type-ahead buffer.
- **Halts:**  the fork's boundary keeps one bug from hanging unrelated tests;  a 10 s `testTimeout` stays as a
  guard.
- **Recording numbers:**  `commands.writeFile` (browser-test console output doesn't reach the terminal):  the
  perf test writes `tools/results/perf-results.json`.

## Risks

- **RC churn:**  `solid-js` 2.0 went from rc.0 (2026-08-12) to rc.11 (2026-09-28);  `@solidjs/vite-plugin`
  published 20 `3.0.0-next` builds in the same window.  Exact pins are mandatory;  the fork pins its peers.
- **Owning a fork:**  `@spell-app/solid-element` (15 modules, 121 tests) is ours until upstream takes it.
  `UPSTREAM.md` maps each fix to a PR against `solidjs/solid` `next` `packages/element`;  nothing is filed without
  Owen's go-ahead.
- **One Solid per page, or context stops:**  sharing works only when app and components resolve to ONE copy.
  Linked peers need `dedupe` everywhere (Vite configs, vendor build, library measurement), or a second Solid
  sneaks in silently.
- **`keepAlive` retention** (Element core);  **React rejected-change drift** (Framework hosts);  **no hydration**
  (SSR).
- **Runtime budget:**  the lazy runtime chunk is about 27 kB min+gz, inside the 50 kB budget.

## Foundation bugs

Open (from the spikes;  none changed by the promotion):
1. ~~**Palette contrast.**~~  Fixed:  per-colour `--ui-<colour>-on` foregrounds picked by WCAG contrast at
   generation time, darker red / green / blue / pink, `-text` capped at L 0.5 (`docs/theming.md`, "Contrast";
   `src/styles/colors.contrast.test.ts`).
2. `src/components/ui-parts/ui-parts.css`:  an in-feed `.date` outside a summary is a `<time>` with no `display`, so it
   stays inline (Fomantic's is a block).
3. `src/components/ui-segment/examples/variations.html`:  `ui top seamless attached segment` breaks the grammar
   order, so `[class*="top attached"]` never matches the static fragment;  the element emits
   `seamless top attached`.
4. `src/components/ui-label/examples/content.html` (`aria-label` on a role-less span) and inputs with no accessible
   name in `label/examples/{content,types}.html`.
5. `heading-order`:  `parts/examples/header.html` and `segment/examples/variations.html` fail it (originals too).
6. **Tag clash:**  the parts' `in-item` owner (Fomantic's `.items > .item`) vs the dropdown's `<ui-item>`;  the
   test stub is `stub-item`.
7. **Text keys are one flat namespace:**  `loading` in both `button` and `segment` vocabularies.
8. **Segment owns no parts:**  an owner of TOKENS only, and a barrier for part lookup.
9. `src/components/ui-button/examples/types.html`:  the `left labeled` example's inner icon button has no accessible
   name (axe `button-name`).

## Appendix: history

The base library was chosen by building the same eight families twice, on Lit 3.3 and on Solid 2.0 RC, with
shared measuring tools:  the comparison and the decision (Owen, 2026-09-30:  Solid 2) are in
`docs/spike-lit-vs-solid.md`.  The spikes lived in `spike/` until this promotion:
- `git checkout archive/lit-spike -- spike/lit` restores the Lit spike and its report
- tag `archive/spikes` is the last commit with `spike/` (the Solid spike, the fork before its move to
  `packages/`, the shared tooling, the icon-loading experiment);  the Solid spike's full report was
  `spike/solid/REPORT.md` there

Spike-era numbers worth keeping:
- **Milestone 0** (button + dropdown, on `@solidjs/element` + `component-register`, Solid bundled into each
  build):  `ui-button` alone 47.71 kB;  a page with one `<ui-button>` first loaded 90.48 kB (eager icon aliases
  14.68, `UIRuntime` 28.09).  Workarounds then:  a capturing registry for base class / form association / shadow
  options, our own `convert()` / `reflect()` (bare booleans parsed false, `true` reflected `"true"`), a
  pre-upgrade property stash;  reconnect re-rendered from scratch;  one uncaught error halted every Solid element.
- **Batch 1** (icon, label, parts, divider, segment, container):  a per-element error boundary (+1.42 kB), the
  removal HACK for bare booleans, `safeKey()` renaming `style` / `hidden`;  274 tests.
- **Shared runtime + fork** (the round before promotion):  peers externalized, `core` + `forms` entries, the fork
  replacing ~120 code lines of workarounds, native fallbacks, HMR;  283 tests + 108 in the fork (121 by the
  promotion).  Element core before / after the fork:  1599 / 868 => 1592 / 845 lines / code lines.
- **Promotion** (this report):  `spike/solid` => `src/`, `spike/shared` => `tools/`, the fork =>
  `packages/solid-element`;  the identity probe moved into the host page (vendored Solid 59.9 => 30.4 kB);
  `Vocabulary.replace()` replaced the HMR vocabulary HACK.
