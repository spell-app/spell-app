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
| `solid-js` | 2.0.0-rc.11 | installed |
| `@solidjs/web` | 2.0.0-rc.11 | installed |
| `@spell-app/solid-element` | 0.0.0 | installed |
| `vite` | 8.3.1 | installed |
| `@solidjs/web` | 2.0.0-rc.11 | peer |
| `solid-js` | 2.0.0-rc.11 | peer |
| `@spell-app/solid-element` | workspace:* | dependency |
| `@solidjs/vite-plugin` | 3.0.0-next.46 | dev |
| `@solidjs/web` | 2.0.0-rc.11 | dev |
| `solid-js` | 2.0.0-rc.11 | dev |
<!-- /generated:versions -->

- **Solid 2.0 RC:**  `solid-js` / `@solidjs/web` `2.0.0-rc.11`, pinned exactly (12 RCs in 7 weeks);
  `@solidjs/vite-plugin` `3.0.0-next.46` (native OXC compiler).  `@solidjs/web` owns the JSX types:
  `jsxImportSource: "@solidjs/web"`, `jsx: "preserve"`.
- **The fork:**  `@spell-app/solid-element`, `"link:./packages/solid-element"` in `dependencies`;  its own yarn project
  (own `yarn.lock`, `yarn fork <script>`), with its own tests (`yarn test:fork`).  Its `exports` point the
  `development` condition at `src/index.ts`, so the dev server, Vitest and the docs site compile the fork's
  TypeScript with our Solid plugin;  the library build leaves it external.  Only `yarn vendor` / `yarn measure`
  bundle its BUILT `dist/`, and they build it first when stale (`tools/ForkBuild.ts`).  The HMR plugin is imported
  from source (`./packages/solid-element/src/vite.ts`) by `vite.config.ts` and the Astro config, so a fresh
  checkout never needs the fork's `dist/` to start.
- **Decorators:**  standard (TC39 2023-11) through `vite.decorators.ts` (esbuild pre-pass, `jsx: "preserve"`),
  listed BEFORE `solid()`;  both are `enforce: "pre"`.
- **One Solid:**  `resolve.dedupe: ["solid-js", "@solidjs/web"]` in every Vite config (library, tests, site) and in
  the vendor / measure builds:  the linked fork otherwise resolves its OWN Solid, and two copies can't share owners.
- **Config:**  `vite.config.ts` exports `baseConfig()` (plugins, aliases, dedupe, Lightning CSS with `CSS_TARGETS`),
  used by the library build, `vitest.config.ts` (two projects:  `browser` in chromium, `ssr` in node, each with its
  own Solid plugin instance) and, in part, `site/astro.config.mjs`.

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
- `yarn site:dev` / `yarn site:build` -- the docs site, on the live components

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
| library (as used:  the bindings `dist/` imports) | 78.36 | 28.08 | eager |
| library (full:  every export of the peer set) | 173.54 | 60.50 | comparison |
| core (element core + foundation JS) | 49.81 | 16.22 | eager |
| forms (form base, validation, menu options;  imported by `ui-dropdown`, `ui-input`, `ui-checkbox`, `ui-form`, `ui-select`, `ui-search`, `ui-rating`, `ui-slider`, `ui-calendar`) | 20.56 | 7.45 | eager |
| own, all 54 families | 1420.06 | 400.67 | eager |
| api (`E` / `V` namespaces, `@spell-app/ui/api`) | 0.73 | 0.33 | app only |
| runtime (`UIRuntime` + foundation CSS) | 170.88 | 30.88 | lazy |
| icons (none bundled:  pack indexes and SVGs are separate files, `docs/icons.md`) | 0.00 | 0.00 | lazy |
| family data (emoji name chunks, each loaded on its own) | 459.18 | 106.12 | lazy |
<!-- /generated:bundle-tiers -->

### Own cost per family

<!-- generated:bundle-families -->
| Family | own min+gz kB | classes | css | vocabulary | fallback | imports | page with only it | standalone (library bundled) |
| --- | --: | --: | --: | --: | --: | --- | --: | --: |
| `ui-button` | **13.20** | 4.49 | 4.13 | 2.64 | 2.11 | core | 57.50 | 43.33 |
| `ui-dropdown` | **16.83** | 7.23 | 4.89 | 2.51 | 2.50 | core + forms | 68.58 | 65.84 |
| `ui-icon` | **5.81** | 2.17 | 1.91 | 1.29 | 1.58 | core | 50.12 | 36.40 |
| `ui-label` | **8.73** | 2.88 | 3.53 | 1.70 | 1.56 | core | 53.04 | 50.79 |
| `ui-parts` | **15.38** | 5.52 | 5.59 | 2.59 | 1.62 | core | 59.68 | 51.93 |
| `ui-divider` | **3.88** | 1.67 | 0.94 | 0.80 | 1.48 | core | 48.18 | 34.46 |
| `ui-segment` | **7.47** | 2.26 | 3.32 | 1.52 | 1.45 | core | 51.77 | 38.02 |
| `ui-container` | **3.39** | 1.45 | 0.84 | 0.69 | 1.40 | core | 47.69 | 33.67 |
| `ui-grid` | **7.95** | 2.47 | 3.31 | 1.59 | 1.46 | core | 52.26 | 39.28 |
| `ui-image` | **5.73** | 2.33 | 1.62 | 1.28 | 1.58 | core | 50.03 | 35.85 |
| `ui-text` | **2.76** | 1.47 | 0.40 | 0.46 | 1.40 | core | 47.06 | 33.03 |
| `ui-flag` | **6.12** | 4.33 | 0.56 | 0.64 | 1.64 | core | 50.43 | 37.62 |
| `ui-loader` | **4.30** | 1.65 | 1.28 | 0.79 | 1.54 | core | 48.61 | 34.70 |
| `ui-placeholder` | **5.98** | 3.33 | 1.36 | 0.90 | 1.54 | core | 50.28 | 36.25 |
| `ui-message` | **5.77** | 2.03 | 1.84 | 1.09 | 1.81 | core | 50.07 | 36.57 |
| `ui-breadcrumb` | **5.17** | 2.78 | 1.02 | 0.80 | 1.80 | core | 49.48 | 35.91 |
| `ui-input` | **10.54** | 4.61 | 2.76 | 2.00 | 2.22 | core + forms | 62.29 | 52.29 |
| `ui-checkbox` | **9.41** | 5.28 | 2.67 | 0.64 | 2.12 | core + forms | 61.17 | 45.80 |
| `ui-form` | **10.85** | 6.33 | 2.17 | 1.94 | 1.61 | core + forms | 62.61 | 49.93 |
| `ui-item` | **4.90** | 2.75 | 0.37 | 1.03 | 1.87 | core | 49.20 | 40.26 |
| `ui-list` | **7.20** | 2.04 | 3.42 | 1.02 | 1.63 | core | 51.51 | 45.98 |
| `ui-menu` | **10.08** | 2.81 | 4.33 | 1.43 | 1.62 | core | 54.39 | 48.33 |
| `ui-table` | **13.91** | 4.62 | 5.44 | 2.09 | 1.92 | core | 58.21 | 48.12 |
| `ui-popup` | **8.72** | 3.91 | 2.56 | 1.55 | 1.83 | core | 53.02 | 38.83 |
| `ui-modal` | **9.01** | 4.10 | 2.11 | 1.54 | 2.47 | core | 53.31 | 71.86 |
| `ui-transition` | **4.91** | 2.94 | 0.28 | 0.94 | 1.89 | core | 49.22 | 35.03 |
| `ui-dimmer` | **6.24** | 3.00 | 1.05 | 1.27 | 2.10 | core | 50.55 | 36.53 |
| `ui-flyout` | **5.24** | 1.49 | 1.82 | 1.35 | 1.59 | core | 49.55 | 75.58 |
| `ui-sidebar` | **8.50** | 4.63 | 1.81 | 1.45 | 1.90 | core | 52.80 | 38.81 |
| `ui-shape` | **6.10** | 4.09 | 0.79 | 0.88 | 1.56 | core | 50.41 | 36.23 |
| `ui-card` | **8.30** | 3.33 | 2.69 | 1.57 | 1.90 | core | 52.60 | 57.31 |
| `ui-items` | **4.17** | 1.55 | 1.45 | 0.66 | 1.50 | core | 48.48 | 57.30 |
| `ui-feed` | **5.93** | 2.68 | 1.57 | 1.00 | 1.88 | core | 50.23 | 55.64 |
| `ui-comment` | **4.52** | 2.38 | 0.85 | 0.81 | 1.70 | core | 48.83 | 53.91 |
| `ui-statistic` | **4.90** | 2.25 | 1.22 | 1.04 | 1.54 | core | 49.21 | 41.68 |
| `ui-step` | **8.83** | 2.99 | 3.59 | 1.58 | 1.86 | core | 53.13 | 50.92 |
| `ui-rail` | **2.93** | 1.45 | 0.53 | 0.54 | 1.40 | core | 47.23 | 33.19 |
| `ui-reveal` | **4.14** | 2.03 | 0.91 | 0.64 | 1.58 | core | 48.45 | 34.38 |
| `ui-ad` | **3.49** | 1.55 | 0.84 | 0.63 | 1.48 | core | 47.79 | 33.74 |
| `ui-emoji` | **4.94** | 3.02 | 0.61 | 0.77 | 1.57 | core | 49.24 | 35.53 |
| `ui-select` | **8.12** | 3.42 | 2.21 | 1.11 | 2.53 | core + forms | 59.87 | 53.54 |
| `ui-search` | **13.02** | 6.71 | 2.44 | 2.16 | 2.12 | core + forms | 64.77 | 53.76 |
| `ui-progress` | **7.45** | 3.32 | 2.07 | 1.32 | 1.76 | core | 51.76 | 38.08 |
| `ui-rating` | **6.54** | 3.64 | 0.94 | 0.99 | 2.11 | core + forms | 58.29 | 42.39 |
| `ui-slider` | **9.12** | 4.84 | 1.82 | 1.31 | 2.23 | core + forms | 60.87 | 44.52 |
| `ui-accordion` | **7.04** | 3.41 | 1.58 | 1.29 | 1.89 | core | 51.34 | 57.70 |
| `ui-tab` | **8.58** | 5.08 | 0.92 | 1.82 | 2.12 | core | 52.88 | 47.91 |
| `ui-toast` | **11.19** | 6.31 | 2.21 | 1.82 | 2.11 | core | 55.50 | 54.29 |
| `ui-nag` | **6.07** | 3.17 | 0.95 | 1.24 | 1.76 | core | 50.38 | 36.66 |
| `ui-sticky` | **3.73** | 2.37 | 0.31 | 0.57 | 1.50 | core | 48.03 | 34.08 |
| `ui-visibility` | **3.64** | 2.13 | 0.14 | 0.85 | 1.60 | core | 47.95 | 33.92 |
| `ui-embed` | **6.39** | 3.58 | 0.87 | 1.23 | 2.06 | core | 50.69 | 36.98 |
| `ui-calendar` | **15.50** | 9.51 | 2.04 | 2.22 | 2.15 | core + forms | 67.25 | 55.14 |
| `ui-root` | **8.08** | 5.79 | 0.35 | 1.63 | 1.37 | core | 52.39 | 58.43 |
<!-- /generated:bundle-families -->

### Scenarios

<!-- generated:bundle-scenarios -->
| Scenario | Adds up | shared runtime min+gz kB | standalone build |
| --- | --- | --: | --: |
| page with one button | library + core + own:ui-button | **57.50** | 43.33 |
| all families | library + core + forms + own (54 families) | **452.43** | 451.12 |
| app already ships the library | core + forms + own (54 families) | **424.35** | -- |
<!-- /generated:bundle-scenarios -->

### Checks

<!-- generated:bundle-checks -->
| Check | Result |
| --- | --- |
| every family entry imports `core.js` | pass |
| no Rolldown runtime chunk (`rolldown-runtime-<hash>.js`):  its helpers stay in `core.js` | pass |
| no shared-entry module outside its own chunk (`core.js`, `forms.js` ...) | pass |
| no Solid / fork module in `dist/` | pass |
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
| element core | 25 | 3943 | 2241 |
| components | 351 | 27089 | 18500 |
| vocabularies & fallbacks | 0 | 0 | 0 |
| foundation | 43 | 8300 | 4471 |
| tests | 213 | 36698 | 30850 |
| tooling | 53 | 6311 | 4422 |
<!-- /generated:loc -->

### Per file

<!-- generated:loc-files -->
| File | Lines | Code lines |
| --- | --: | --: |
| `core.ts` | 45 | 21 |
| `elements/Cell.ts` | 23 | 10 |
| `elements/ClassBuilder.ts` | 185 | 122 |
| `elements/ContentPart.tsx` | 85 | 48 |
| `elements/ControlLabels.ts` | 243 | 157 |
| `elements/Controlled.ts` | 86 | 41 |
| `elements/ElementDefinition.ts` | 217 | 133 |
| `elements/FormElement.ts` | 137 | 68 |
| `elements/FormHost.ts` | 46 | 24 |
| `elements/HostAttribute.ts` | 25 | 15 |
| `elements/HotDefinitions.ts` | 126 | 71 |
| `elements/IconGlyph.ts` | 92 | 52 |
| `elements/MenuOptions.ts` | 303 | 191 |
| `elements/NativeFallback.ts` | 212 | 118 |
| `elements/OwnerContext.ts` | 85 | 47 |
| `elements/PartContext.ts` | 222 | 124 |
| `elements/RootSettings.ts` | 61 | 31 |
| `elements/Shorthand.ts` | 96 | 54 |
| `elements/SlotContent.ts` | 46 | 29 |
| `elements/UIElement.tsx` | 502 | 271 |
| `elements/UIHost.ts` | 74 | 30 |
| `elements/Validator.ts` | 458 | 342 |
| `elements/elements.types.ts` | 518 | 215 |
| `elements/index.ts` | 38 | 22 |
| `forms.ts` | 18 | 5 |
| `components/ui-accordion/UIAccordion.tsx` | 252 | 156 |
| `components/ui-accordion/index.ts` | 13 | 4 |
| `components/ui-accordion/ui-accordion.fallback.ts` | 65 | 51 |
| `components/ui-accordion/ui-accordion.types.ts` | 49 | 21 |
| `components/ui-accordion/ui-accordion.vocabulary.en.ts` | 120 | 98 |
| `components/ui-ad/UIAd.tsx` | 44 | 29 |
| `components/ui-ad/index.ts` | 10 | 3 |
| `components/ui-ad/ui-ad.fallback.ts` | 27 | 19 |
| `components/ui-ad/ui-ad.types.ts` | 13 | 3 |
| `components/ui-ad/ui-ad.vocabulary.en.ts` | 70 | 54 |
| `components/ui-breadcrumb/UIBreadcrumb.tsx` | 64 | 39 |
| `components/ui-breadcrumb/UIBreadcrumbSection.tsx` | 58 | 38 |
| `components/ui-breadcrumb/index.ts` | 13 | 5 |
| `components/ui-breadcrumb/ui-breadcrumb-section.vocabulary.en.ts` | 38 | 27 |
| `components/ui-breadcrumb/ui-breadcrumb.fallback.ts` | 57 | 39 |
| `components/ui-breadcrumb/ui-breadcrumb.types.ts` | 23 | 6 |
| `components/ui-breadcrumb/ui-breadcrumb.vocabulary.en.ts` | 48 | 33 |
| `components/ui-button/UIButton.tsx` | 278 | 188 |
| `components/ui-button/UIButtons.tsx` | 35 | 23 |
| `components/ui-button/UIOr.tsx` | 24 | 14 |
| `components/ui-button/index.ts` | 14 | 7 |
| `components/ui-button/ui-button.fallback.ts` | 91 | 68 |
| `components/ui-button/ui-button.vocabulary.en.ts` | 152 | 136 |
| `components/ui-button/ui-buttons.vocabulary.en.ts` | 70 | 59 |
| `components/ui-button/ui-or.vocabulary.en.ts` | 33 | 22 |
| `components/ui-calendar/UICalendar.tsx` | 810 | 597 |
| `components/ui-calendar/index.ts` | 13 | 3 |
| `components/ui-calendar/ui-calendar.fallback.ts` | 77 | 56 |
| `components/ui-calendar/ui-calendar.types.ts` | 266 | 158 |
| `components/ui-calendar/ui-calendar.vocabulary.en.ts` | 189 | 173 |
| `components/ui-card/UICard.tsx` | 190 | 133 |
| `components/ui-card/UICards.tsx` | 43 | 24 |
| `components/ui-card/index.ts` | 15 | 6 |
| `components/ui-card/ui-card.fallback.ts` | 65 | 47 |
| `components/ui-card/ui-card.types.ts` | 58 | 27 |
| `components/ui-card/ui-card.vocabulary.en.ts` | 96 | 79 |
| `components/ui-card/ui-cards.vocabulary.en.ts` | 54 | 43 |
| `components/ui-checkbox/UICheckbox.tsx` | 45 | 26 |
| `components/ui-checkbox/UIRadio.tsx` | 138 | 90 |
| `components/ui-checkbox/index.ts` | 13 | 5 |
| `components/ui-checkbox/ui-checkbox.fallback.ts` | 78 | 57 |
| `components/ui-checkbox/ui-checkbox.types.ts` | 133 | 88 |
| `components/ui-checkbox/ui-checkbox.vocabulary.en.ts` | 53 | 35 |
| `components/ui-checkbox/ui-radio.vocabulary.en.ts` | 42 | 29 |
| `components/ui-comment/UIComment.tsx` | 59 | 37 |
| `components/ui-comment/UIComments.tsx` | 64 | 39 |
| `components/ui-comment/index.ts` | 16 | 6 |
| `components/ui-comment/ui-comment.fallback.ts` | 44 | 30 |
| `components/ui-comment/ui-comment.types.ts` | 17 | 5 |
| `components/ui-comment/ui-comment.vocabulary.en.ts` | 56 | 39 |
| `components/ui-comment/ui-comments.vocabulary.en.ts` | 48 | 36 |
| `components/ui-container/UIContainer.tsx` | 27 | 17 |
| `components/ui-container/index.ts` | 10 | 3 |
| `components/ui-container/ui-container.fallback.ts` | 16 | 9 |
| `components/ui-container/ui-container.vocabulary.en.ts` | 58 | 46 |
| `components/ui-dimmer/UIDimmer.tsx` | 310 | 205 |
| `components/ui-dimmer/index.ts` | 13 | 3 |
| `components/ui-dimmer/ui-dimmer.fallback.ts` | 78 | 56 |
| `components/ui-dimmer/ui-dimmer.types.ts` | 25 | 9 |
| `components/ui-dimmer/ui-dimmer.vocabulary.en.ts` | 104 | 88 |
| `components/ui-divider/UIDivider.tsx` | 47 | 30 |
| `components/ui-divider/index.ts` | 10 | 3 |
| `components/ui-divider/ui-divider.fallback.ts` | 27 | 19 |
| `components/ui-divider/ui-divider.types.ts` | 11 | 2 |
| `components/ui-divider/ui-divider.vocabulary.en.ts` | 59 | 47 |
| `components/ui-dropdown/SlottedItems.ts` | 131 | 92 |
| `components/ui-dropdown/UIDropdown.tsx` | 848 | 632 |
| `components/ui-dropdown/index.ts` | 14 | 4 |
| `components/ui-dropdown/ui-dropdown.fallback.ts` | 138 | 111 |
| `components/ui-dropdown/ui-dropdown.types.ts` | 53 | 26 |
| `components/ui-dropdown/ui-dropdown.vocabulary.en.ts` | 207 | 192 |
| `components/ui-embed/UIEmbed.tsx` | 184 | 118 |
| `components/ui-embed/UIEmbedHost.ts` | 25 | 13 |
| `components/ui-embed/index.ts` | 12 | 5 |
| `components/ui-embed/ui-embed.fallback.ts` | 85 | 67 |
| `components/ui-embed/ui-embed.types.ts` | 59 | 29 |
| `components/ui-embed/ui-embed.vocabulary.en.ts` | 110 | 95 |
| `components/ui-emoji/UIEmoji.tsx` | 78 | 52 |
| `components/ui-emoji/index.ts` | 14 | 4 |
| `components/ui-emoji/ui-emoji.fallback.ts` | 35 | 25 |
| `components/ui-emoji/ui-emoji.types.ts` | 47 | 14 |
| `components/ui-emoji/ui-emoji.vocabulary.en.ts` | 68 | 46 |
| `components/ui-feed/UIFeed.tsx` | 39 | 22 |
| `components/ui-feed/UIFeedEvent.tsx` | 109 | 66 |
| `components/ui-feed/index.ts` | 15 | 6 |
| `components/ui-feed/ui-event.vocabulary.en.ts` | 54 | 42 |
| `components/ui-feed/ui-feed.fallback.ts` | 53 | 39 |
| `components/ui-feed/ui-feed.types.ts` | 24 | 8 |
| `components/ui-feed/ui-feed.vocabulary.en.ts` | 54 | 38 |
| `components/ui-flag/UIFlag.tsx` | 56 | 35 |
| `components/ui-flag/index.ts` | 12 | 4 |
| `components/ui-flag/ui-flag.fallback.ts` | 38 | 27 |
| `components/ui-flag/ui-flag.types.ts` | 337 | 307 |
| `components/ui-flag/ui-flag.vocabulary.en.ts` | 59 | 38 |
| `components/ui-flyout/UIFlyout.tsx` | 43 | 24 |
| `components/ui-flyout/index.ts` | 14 | 3 |
| `components/ui-flyout/ui-flyout.fallback.ts` | 31 | 20 |
| `components/ui-flyout/ui-flyout.types.ts` | 16 | 4 |
| `components/ui-flyout/ui-flyout.vocabulary.en.ts` | 131 | 112 |
| `components/ui-form/UIField.tsx` | 81 | 54 |
| `components/ui-form/UIFields.tsx` | 41 | 28 |
| `components/ui-form/UIForm.tsx` | 389 | 267 |
| `components/ui-form/UIFormHost.ts` | 44 | 25 |
| `components/ui-form/index.ts` | 16 | 7 |
| `components/ui-form/ui-field.vocabulary.en.ts` | 65 | 46 |
| `components/ui-form/ui-fields.vocabulary.en.ts` | 60 | 42 |
| `components/ui-form/ui-form.fallback.ts` | 36 | 22 |
| `components/ui-form/ui-form.types.ts` | 105 | 59 |
| `components/ui-form/ui-form.vocabulary.en.ts` | 115 | 96 |
| `components/ui-grid/UIColumn.ts` | 15 | 6 |
| `components/ui-grid/UIGrid.ts` | 15 | 6 |
| `components/ui-grid/UIRow.ts` | 13 | 6 |
| `components/ui-grid/index.ts` | 15 | 7 |
| `components/ui-grid/ui-column.vocabulary.en.ts` | 107 | 90 |
| `components/ui-grid/ui-grid.fallback.ts` | 28 | 16 |
| `components/ui-grid/ui-grid.types.ts` | 7 | 1 |
| `components/ui-grid/ui-grid.vocabulary.en.ts` | 117 | 98 |
| `components/ui-grid/ui-row.vocabulary.en.ts` | 91 | 72 |
| `components/ui-icon/UIIcon.tsx` | 65 | 40 |
| `components/ui-icon/UIIcons.tsx` | 40 | 28 |
| `components/ui-icon/index.ts` | 13 | 5 |
| `components/ui-icon/ui-icon.fallback.ts` | 39 | 29 |
| `components/ui-icon/ui-icon.types.ts` | 7 | 1 |
| `components/ui-icon/ui-icon.vocabulary.en.ts` | 90 | 74 |
| `components/ui-icon/ui-icons.vocabulary.en.ts` | 44 | 29 |
| `components/ui-image/UIImage.tsx` | 65 | 44 |
| `components/ui-image/UIImages.tsx` | 29 | 18 |
| `components/ui-image/index.ts` | 13 | 5 |
| `components/ui-image/ui-image.fallback.ts` | 47 | 33 |
| `components/ui-image/ui-image.types.ts` | 7 | 1 |
| `components/ui-image/ui-image.vocabulary.en.ts` | 89 | 71 |
| `components/ui-image/ui-images.vocabulary.en.ts` | 48 | 31 |
| `components/ui-input/UIInput.tsx` | 209 | 145 |
| `components/ui-input/UITextarea.tsx` | 48 | 36 |
| `components/ui-input/index.ts` | 12 | 5 |
| `components/ui-input/ui-input.fallback.ts` | 103 | 80 |
| `components/ui-input/ui-input.types.ts` | 61 | 34 |
| `components/ui-input/ui-input.vocabulary.en.ts` | 171 | 147 |
| `components/ui-input/ui-textarea.vocabulary.en.ts` | 96 | 74 |
| `components/ui-item/UIItem.tsx` | 235 | 142 |
| `components/ui-item/index.ts` | 13 | 4 |
| `components/ui-item/ui-item.fallback.ts` | 58 | 43 |
| `components/ui-item/ui-item.types.ts` | 32 | 12 |
| `components/ui-item/ui-item.vocabulary.en.ts` | 98 | 81 |
| `components/ui-items/UIItems.tsx` | 46 | 25 |
| `components/ui-items/index.ts` | 14 | 5 |
| `components/ui-items/ui-items.fallback.ts` | 20 | 12 |
| `components/ui-items/ui-items.types.ts` | 15 | 8 |
| `components/ui-items/ui-items.vocabulary.en.ts` | 66 | 51 |
| `components/ui-label/UILabel.tsx` | 145 | 89 |
| `components/ui-label/UILabels.tsx` | 25 | 15 |
| `components/ui-label/index.ts` | 12 | 5 |
| `components/ui-label/ui-label.fallback.ts` | 32 | 25 |
| `components/ui-label/ui-label.types.ts` | 13 | 3 |
| `components/ui-label/ui-label.vocabulary.en.ts` | 126 | 109 |
| `components/ui-label/ui-labels.vocabulary.en.ts` | 44 | 27 |
| `components/ui-list/UIList.tsx` | 134 | 72 |
| `components/ui-list/index.ts` | 13 | 4 |
| `components/ui-list/ui-list.fallback.ts` | 39 | 25 |
| `components/ui-list/ui-list.types.ts` | 20 | 6 |
| `components/ui-list/ui-list.vocabulary.en.ts` | 86 | 69 |
| `components/ui-loader/UILoader.tsx` | 65 | 40 |
| `components/ui-loader/index.ts` | 10 | 3 |
| `components/ui-loader/ui-loader.fallback.ts` | 25 | 16 |
| `components/ui-loader/ui-loader.types.ts` | 7 | 1 |
| `components/ui-loader/ui-loader.vocabulary.en.ts` | 65 | 50 |
| `components/ui-menu/UIMenu.tsx` | 255 | 163 |
| `components/ui-menu/index.ts` | 13 | 4 |
| `components/ui-menu/ui-menu.fallback.ts` | 29 | 19 |
| `components/ui-menu/ui-menu.types.ts` | 27 | 9 |
| `components/ui-menu/ui-menu.vocabulary.en.ts` | 126 | 108 |
| `components/ui-message/UIMessage.tsx` | 94 | 55 |
| `components/ui-message/index.ts` | 10 | 3 |
| `components/ui-message/ui-message.fallback.ts` | 48 | 37 |
| `components/ui-message/ui-message.types.ts` | 4 | 0 |
| `components/ui-message/ui-message.vocabulary.en.ts` | 92 | 74 |
| `components/ui-modal/UIModal.tsx` | 24 | 12 |
| `components/ui-modal/index.ts` | 27 | 11 |
| `components/ui-modal/ui-modal.fallback.ts` | 122 | 90 |
| `components/ui-modal/ui-modal.types.ts` | 65 | 34 |
| `components/ui-modal/ui-modal.vocabulary.en.ts` | 145 | 126 |
| `components/ui-nag/UINag.tsx` | 203 | 125 |
| `components/ui-nag/UINagHost.ts` | 35 | 19 |
| `components/ui-nag/index.ts` | 12 | 5 |
| `components/ui-nag/ui-nag.fallback.ts` | 41 | 31 |
| `components/ui-nag/ui-nag.types.ts` | 64 | 34 |
| `components/ui-nag/ui-nag.vocabulary.en.ts` | 103 | 90 |
| `components/ui-parts/PartElement.ts` | 13 | 5 |
| `components/ui-parts/UIActions.ts` | 14 | 6 |
| `components/ui-parts/UIAuthor.ts` | 25 | 15 |
| `components/ui-parts/UIAvatar.tsx` | 29 | 18 |
| `components/ui-parts/UIContent.ts` | 20 | 9 |
| `components/ui-parts/UIDate.ts` | 22 | 13 |
| `components/ui-parts/UIDescription.ts` | 14 | 6 |
| `components/ui-parts/UIDetail.ts` | 22 | 12 |
| `components/ui-parts/UIExtra.ts` | 14 | 6 |
| `components/ui-parts/UIHeader.tsx` | 49 | 30 |
| `components/ui-parts/UIMeta.ts` | 14 | 6 |
| `components/ui-parts/UISummary.ts` | 14 | 6 |
| `components/ui-parts/UITitle.ts` | 21 | 12 |
| `components/ui-parts/UIValue.ts` | 14 | 6 |
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
| `components/ui-parts/ui-parts.fallback.ts` | 43 | 28 |
| `components/ui-parts/ui-parts.types.ts` | 58 | 45 |
| `components/ui-parts/ui-summary.vocabulary.en.ts` | 33 | 16 |
| `components/ui-parts/ui-title.vocabulary.en.ts` | 37 | 20 |
| `components/ui-parts/ui-value.vocabulary.en.ts` | 36 | 19 |
| `components/ui-placeholder/UIPlaceholder.tsx` | 41 | 26 |
| `components/ui-placeholder/UIPlaceholderHeader.ts` | 13 | 6 |
| `components/ui-placeholder/UIPlaceholderImage.ts` | 17 | 9 |
| `components/ui-placeholder/UIPlaceholderLine.ts` | 18 | 9 |
| `components/ui-placeholder/UIPlaceholderParagraph.ts` | 12 | 6 |
| `components/ui-placeholder/index.ts` | 21 | 11 |
| `components/ui-placeholder/ui-placeholder-header.vocabulary.en.ts` | 34 | 16 |
| `components/ui-placeholder/ui-placeholder-image.vocabulary.en.ts` | 41 | 23 |
| `components/ui-placeholder/ui-placeholder-line.vocabulary.en.ts` | 42 | 24 |
| `components/ui-placeholder/ui-placeholder-paragraph.vocabulary.en.ts` | 34 | 16 |
| `components/ui-placeholder/ui-placeholder.fallback.ts` | 34 | 22 |
| `components/ui-placeholder/ui-placeholder.types.ts` | 25 | 13 |
| `components/ui-placeholder/ui-placeholder.vocabulary.en.ts` | 47 | 29 |
| `components/ui-popup/UIPopup.tsx` | 478 | 305 |
| `components/ui-popup/index.ts` | 11 | 3 |
| `components/ui-popup/ui-popup.fallback.ts` | 58 | 40 |
| `components/ui-popup/ui-popup.types.ts` | 71 | 34 |
| `components/ui-popup/ui-popup.vocabulary.en.ts` | 135 | 117 |
| `components/ui-progress/UIProgress.tsx` | 228 | 156 |
| `components/ui-progress/index.ts` | 13 | 4 |
| `components/ui-progress/ui-progress.fallback.ts` | 43 | 29 |
| `components/ui-progress/ui-progress.types.ts` | 39 | 12 |
| `components/ui-progress/ui-progress.vocabulary.en.ts` | 126 | 110 |
| `components/ui-rail/UIRail.tsx` | 30 | 18 |
| `components/ui-rail/index.ts` | 10 | 3 |
| `components/ui-rail/ui-rail.fallback.ts` | 17 | 9 |
| `components/ui-rail/ui-rail.types.ts` | 3 | 0 |
| `components/ui-rail/ui-rail.vocabulary.en.ts` | 47 | 32 |
| `components/ui-rating/UIRating.tsx` | 388 | 265 |
| `components/ui-rating/index.ts` | 11 | 3 |
| `components/ui-rating/ui-rating.fallback.ts` | 86 | 64 |
| `components/ui-rating/ui-rating.types.ts` | 41 | 11 |
| `components/ui-rating/ui-rating.vocabulary.en.ts` | 76 | 62 |
| `components/ui-reveal/UIReveal.tsx` | 86 | 56 |
| `components/ui-reveal/index.ts` | 11 | 3 |
| `components/ui-reveal/ui-reveal.fallback.ts` | 35 | 26 |
| `components/ui-reveal/ui-reveal.types.ts` | 21 | 6 |
| `components/ui-reveal/ui-reveal.vocabulary.en.ts` | 66 | 51 |
| `components/ui-root/UIRoot.tsx` | 332 | 226 |
| `components/ui-root/index.ts` | 14 | 6 |
| `components/ui-root/ui-root.catalog.ts` | 154 | 150 |
| `components/ui-root/ui-root.fallback.ts` | 20 | 10 |
| `components/ui-root/ui-root.types.ts` | 72 | 33 |
| `components/ui-root/ui-root.vocabulary.en.ts` | 135 | 121 |
| `components/ui-search/UISearch.tsx` | 699 | 529 |
| `components/ui-search/index.ts` | 12 | 4 |
| `components/ui-search/ui-search.fallback.ts` | 87 | 66 |
| `components/ui-search/ui-search.types.ts` | 95 | 44 |
| `components/ui-search/ui-search.vocabulary.en.ts` | 184 | 167 |
| `components/ui-segment/UISegment.tsx` | 63 | 44 |
| `components/ui-segment/UISegments.tsx` | 29 | 18 |
| `components/ui-segment/index.ts` | 13 | 5 |
| `components/ui-segment/ui-segment.fallback.ts` | 16 | 9 |
| `components/ui-segment/ui-segment.types.ts` | 3 | 0 |
| `components/ui-segment/ui-segment.vocabulary.en.ts` | 98 | 84 |
| `components/ui-segment/ui-segments.vocabulary.en.ts` | 48 | 34 |
| `components/ui-select/UISelect.tsx` | 319 | 217 |
| `components/ui-select/index.ts` | 13 | 4 |
| `components/ui-select/ui-select.fallback.ts` | 150 | 121 |
| `components/ui-select/ui-select.types.ts` | 71 | 36 |
| `components/ui-select/ui-select.vocabulary.en.ts` | 91 | 73 |
| `components/ui-shape/UIShape.tsx` | 334 | 226 |
| `components/ui-shape/UISide.tsx` | 35 | 22 |
| `components/ui-shape/index.ts` | 13 | 6 |
| `components/ui-shape/ui-shape.fallback.ts` | 34 | 22 |
| `components/ui-shape/ui-shape.types.ts` | 51 | 19 |
| `components/ui-shape/ui-shape.vocabulary.en.ts` | 63 | 48 |
| `components/ui-shape/ui-side.vocabulary.en.ts` | 36 | 22 |
| `components/ui-sidebar/UIPushable.tsx` | 107 | 73 |
| `components/ui-sidebar/UIPusher.tsx` | 34 | 22 |
| `components/ui-sidebar/UISidebar.tsx` | 332 | 217 |
| `components/ui-sidebar/index.ts` | 15 | 7 |
| `components/ui-sidebar/ui-pushable.vocabulary.en.ts` | 36 | 16 |
| `components/ui-sidebar/ui-pusher.vocabulary.en.ts` | 36 | 16 |
| `components/ui-sidebar/ui-sidebar.fallback.ts` | 68 | 46 |
| `components/ui-sidebar/ui-sidebar.types.ts` | 81 | 32 |
| `components/ui-sidebar/ui-sidebar.vocabulary.en.ts` | 109 | 89 |
| `components/ui-slider/UISlider.tsx` | 474 | 333 |
| `components/ui-slider/index.ts` | 13 | 4 |
| `components/ui-slider/ui-slider.fallback.ts` | 97 | 74 |
| `components/ui-slider/ui-slider.types.ts` | 68 | 31 |
| `components/ui-slider/ui-slider.vocabulary.en.ts` | 104 | 90 |
| `components/ui-statistic/UIStatistic.tsx` | 59 | 38 |
| `components/ui-statistic/UIStatistics.tsx` | 32 | 19 |
| `components/ui-statistic/index.ts` | 15 | 5 |
| `components/ui-statistic/ui-statistic.fallback.ts` | 28 | 19 |
| `components/ui-statistic/ui-statistic.types.ts` | 21 | 5 |
| `components/ui-statistic/ui-statistic.vocabulary.en.ts` | 68 | 47 |
| `components/ui-statistic/ui-statistics.vocabulary.en.ts` | 54 | 34 |
| `components/ui-step/UIStep.tsx` | 138 | 85 |
| `components/ui-step/UISteps.tsx` | 38 | 22 |
| `components/ui-step/index.ts` | 14 | 5 |
| `components/ui-step/ui-step.fallback.ts` | 62 | 49 |
| `components/ui-step/ui-step.types.ts` | 40 | 10 |
| `components/ui-step/ui-step.vocabulary.en.ts` | 85 | 65 |
| `components/ui-step/ui-steps.vocabulary.en.ts` | 81 | 62 |
| `components/ui-sticky/UISticky.tsx` | 185 | 119 |
| `components/ui-sticky/index.ts` | 10 | 3 |
| `components/ui-sticky/ui-sticky.fallback.ts` | 20 | 12 |
| `components/ui-sticky/ui-sticky.types.ts` | 34 | 14 |
| `components/ui-sticky/ui-sticky.vocabulary.en.ts` | 62 | 49 |
| `components/ui-tab/UITab.tsx` | 170 | 113 |
| `components/ui-tab/UITabs.tsx` | 475 | 292 |
| `components/ui-tab/index.ts` | 14 | 5 |
| `components/ui-tab/ui-tab.fallback.ts` | 100 | 76 |
| `components/ui-tab/ui-tab.types.ts` | 95 | 33 |
| `components/ui-tab/ui-tab.vocabulary.en.ts` | 79 | 58 |
| `components/ui-tab/ui-tabs.vocabulary.en.ts` | 114 | 93 |
| `components/ui-table/UITable.tsx` | 394 | 239 |
| `components/ui-table/index.ts` | 11 | 3 |
| `components/ui-table/ui-table.fallback.ts` | 65 | 46 |
| `components/ui-table/ui-table.types.ts` | 58 | 13 |
| `components/ui-table/ui-table.vocabulary.en.ts` | 195 | 178 |
| `components/ui-text/UIText.tsx` | 33 | 21 |
| `components/ui-text/index.ts` | 10 | 3 |
| `components/ui-text/ui-text.fallback.ts` | 16 | 9 |
| `components/ui-text/ui-text.types.ts` | 3 | 0 |
| `components/ui-text/ui-text.vocabulary.en.ts` | 44 | 30 |
| `components/ui-toast/UIToast.tsx` | 592 | 409 |
| `components/ui-toast/UIToastHost.ts` | 19 | 10 |
| `components/ui-toast/index.ts` | 20 | 8 |
| `components/ui-toast/ui-toast.fallback.ts` | 70 | 52 |
| `components/ui-toast/ui-toast.types.ts` | 157 | 80 |
| `components/ui-toast/ui-toast.vocabulary.en.ts` | 160 | 142 |
| `components/ui-transition/UITransition.tsx` | 267 | 163 |
| `components/ui-transition/index.ts` | 14 | 4 |
| `components/ui-transition/ui-transition.fallback.ts` | 71 | 47 |
| `components/ui-transition/ui-transition.types.ts` | 82 | 51 |
| `components/ui-transition/ui-transition.vocabulary.en.ts` | 89 | 73 |
| `components/ui-visibility/UIVisibility.tsx` | 130 | 99 |
| `components/ui-visibility/index.ts` | 13 | 3 |
| `components/ui-visibility/ui-visibility.fallback.ts` | 32 | 24 |
| `components/ui-visibility/ui-visibility.types.ts` | 31 | 15 |
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
- **No signal writes in owned scopes:**  the fork's hooks can run inside a Solid render, so `connected` and the
  fieldset `formDisabled` replay are deferred a microtask.
- **Writes land on a microtask:**  tests `flush()` (`ElementFixture.settle()` / `tick()`).
- **`keepAlive` has a cost:**  a removed element keeps its reactive root until `dispose()` or garbage collection;
  anything page-wide (overlay entries) must follow `connected`, not disposal.
- **Dev diagnostics** flag the `classes()` memo as `WIDE_SCOPE_DEPS` (it reads every attribute);  the production
  build drops them.

## Hot module replacement

Edit a component in `yarn dev` (or `yarn site:dev`) and every live instance updates in place:  same host objects,
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
| vitest browser mode | dev (Vite dev server) | 56.0 / 56.0 / 58.0 | 1.0 / **4.6** / 17.0 | 1.0 / **6.2** / 21.0 | 6.0 / **14.8** / 21.0 |
| smoke perf page | production (`dist/` + vendored peers) | 14.7 / 14.7 / 16.3 | 0.2 / **1.4** / 3.7 | 0.9 / **3.2** / 8.5 | 14.6 / **15.8** / 16.6 |
<!-- /generated:perf -->

- The test asserts an average update under 16 ms;  it passes with large headroom.  No windowing needed.
- The worst keystroke is the first (`u`):  all 1000 rows still match and each gets `<mark>` highlighting.  First
  open renders all 1000 rows;  it dominates.
- Headless chromium runs at 60 Hz, so `+ frame` snaps to vsync (about 16.7 ms);  compare `update` and `+ layout`.
- `tools/demo/perf.html` runs the same benchmark under `yarn dev`;  set `UI_SOLID_PROD=1` for production Solid
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
| `solid.html` | host | solid 2.0.0-rc.11 (app) + identity hook | PASS | ok: initialValue, initiallyOpen, optionsIsProperty, pickUpdatesHost, closesAfterPick, hostSetsValue, hostOpens, appContext, solidIdentity, webIdentity, contextReachesComponent, unmount, overlaysAfterUnmount |
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
  - plus the app's own context, unmount, and `overlaysAfterUnmount` (the overlay entry follows `connected`)

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
  `test/a11y.ts`), with `heading-order` off for two pages of heading demos;  and on every family's native fallback.

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

- **Suite:**  Vitest, two projects:  `browser` (chromium;  `UI_TEST_ALL=1` adds firefox and webkit) and `ssr`
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
