# `@spell-app/ui` status report

> NOTE (2026-10-09):  "the fork" below, `@spell-app/solid-element`, is gone.  Epic `spell-element` folded it into
> `src/elements/` (`DOMElement`, `UIComponent`, `ShadowEvents`, `HotDefinitions`, `tools/HotElements.ts`):  `ui`'s own
> code now, bundled into `core.js`, no longer a peer.  The prose about it is history;  the generated tables are current.

Eight component families -- `ui-button` (+ `ui-buttons`, `ui-or`), `ui-dropdown` (+ `ui-item`), `ui-icon` /
`ui-icons`, `ui-label` / `ui-labels`, the 13 generic content parts, `ui-divider`, `ui-segment` / `ui-segments`,
`ui-container` -- on **Solid 2.0.0-rc.11** through **`@spell-app/solid-element`** (`packages/solid-element/`, our fork of
`@solidjs/element` + `component-register`), over the foundation in `src/` (vocabularies, CSS, runtime, icons,
native fallbacks).  Packaged as a SHARED RUNTIME:  `solid-js`, `@solidjs/web` and the fork are peer dependencies
(external);  the element core is split into two shared entries (`core.js` for every family, `forms.js` only for
families with a form value);  each family ships only its own classes, sheet and vocabulary, and a form control its
native fallback.

This report holds facts and measurements.  Every table between `generated` markers is rewritten by `yarn report`
(`tools/ReportTables.ts`) from `tools/results/*.json`;  run the commands under "Commands" first.  How we got here
(the Lit vs Solid spikes) is in the appendix.

## Setup & versions

<!-- generated:versions -->
| Package | Version | Kind |
| --- | --- | --- |
| `solid-js` | 2.0.0-rc.13 | installed |
| `@solidjs/web` | 2.0.0-rc.13 | installed |
| `vite` | 8.3.1 | installed |
| `@solidjs/web` | 2.0.0-rc.13 | peer |
| `solid-js` | 2.0.0-rc.13 | peer |
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
    - `src/core.ts` -- the element core (`DOMElement`, `UIComponent`, `ElementDefinition`, `PartComponent` + `PartContext`,
      `Controlled`, `Cell`, `SlotContent`, `HostAttribute`, `IconGlyph`) AND the foundation it uses:  `$/ui/util`,
      `$/ui/vocabulary`, from `$/ui/elements` `ClassBuilder` / `Shorthand` / `OwnerContext` / `NativeFallback`,
      `$/ui/runtime` (the eager loader only), `$/ui/icons` (`IconName`, `BuiltInPacks`), `$/ui/components/components.types`
    - `src/forms.ts` -- `FormComponent`, `DOMFormControl`, `Validator`, `MenuOptions`;  imported by `dropdown` only.
      `ui-button` is form-associated through the fork's `formAssociated` option alone, so it stays on `core`.
  - Every component file (classes AND native fallback) imports shared code through ONE path, `$/ui/core` (and
    `$/ui/forms` where needed);  the vocabulary and the sheet are the family's own.  Two chunking rules:
    - `core.ts` / `forms.ts` re-export `$/ui/elements` LEAVES, never the barrel:  the barrel holds the `forms` files
    - `DOMFormControl` / `FormComponent` import the element core through the `$/ui/core` ENTRY:  importing its leaves made
      Rolldown hoist everything `core` and `forms` share into a third chunk, and `core.js` became a facade
  - `styles` is its own entry (`dist/styles.js`):  the `index` entry re-exports the foundation sheets, and without
    an entry of their own they landed in `index.js`, which the lazy `UIRuntime` chunk then imported -- loading the
    runtime on a button-only page would have pulled every family.
  - `rolldownOptions.preserveEntrySignatures: "allow-extension"`;  `UIButton.css` + the button vocabulary land in a
    shared `button-<hash>.js` (the dropdown adopts `UIButton.css`).
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
| library (as used:  the bindings `dist/` imports) | 65.85 | 24.34 | eager |
| library (full:  every export of the peer set) | 161.25 | 56.83 | comparison |
| core (element core + foundation JS) | 82.97 | 29.59 | eager |
| forms (form base, validation, menu options;  imported by `ui-dropdown`, `ui-input`, `ui-checkbox`, `ui-form`, `ui-select`, `ui-search`, `ui-rating`, `ui-slider`, `ui-calendar`) | 18.22 | 6.34 | eager |
| own, all 61 families | 1441.19 | 400.35 | eager |
| api (`E` / `V` namespaces, `@spell-app/ui/api`) | 0.10 | 0.09 | app only |
| styles (extra entry) | 127.92 | 16.68 | app only |
| runtime (`UIRuntime` + foundation CSS) | 308.10 | 159.80 | lazy |
| icons (none bundled:  pack indexes and SVGs are separate files, `docs/icons.md`) | 0.00 | 0.00 | lazy |
| family data (emoji name chunks, each loaded on its own) | 1238.32 | 334.34 | lazy |
<!-- /generated:bundle-tiers -->

### Own cost per family

<!-- generated:bundle-families -->
| Family | own min+gz kB | classes | css | vocabulary | fallback | imports | page with only it | standalone (library bundled) |
| --- | --: | --: | --: | --: | --: | --- | --: | --: |
| `ui-button` | **11.40** | 3.50 | 4.23 | 2.86 | 1.08 | core | 65.34 | 47.24 |
| `ui-dropdown` | **15.52** | 6.96 | 4.93 | 2.50 | 1.44 | core + forms | 75.79 | 65.81 |
| `ui-icon` | **3.94** | 0.90 | 1.91 | 1.27 | 0.00 | core | 57.88 | 36.28 |
| `ui-label` | **6.77** | 1.56 | 3.56 | 1.75 | 0.00 | core | 60.70 | 50.02 |
| `ui-parts` | **9.71** | 1.53 | 5.66 | 2.57 | 0.00 | core | 63.65 | 46.82 |
| `ui-divider` | **2.25** | 0.67 | 0.94 | 0.80 | 0.00 | core | 56.18 | 34.82 |
| `ui-segment` | **5.61** | 0.91 | 3.34 | 1.50 | 0.00 | core | 59.54 | 37.79 |
| `ui-container` | **1.82** | 0.46 | 0.84 | 0.68 | 0.00 | core | 55.76 | 33.34 |
| `ui-grid` | **6.12** | 0.76 | 3.68 | 1.78 | 0.00 | core | 60.06 | 38.45 |
| `ui-image` | **3.71** | 0.94 | 1.63 | 1.25 | 0.00 | core | 57.65 | 35.19 |
| `ui-text` | **1.19** | 0.46 | 0.40 | 0.45 | 0.00 | core | 55.12 | 32.73 |
| `ui-flag` | **4.12** | 3.13 | 0.51 | 0.62 | 0.00 | core | 58.05 | 36.88 |
| `ui-loader` | **2.57** | 0.64 | 1.28 | 0.79 | 0.00 | core | 56.51 | 34.32 |
| `ui-placeholder` | **3.13** | 1.01 | 1.36 | 0.90 | 0.00 | core | 57.06 | 34.95 |
| `ui-message` | **3.88** | 1.06 | 1.86 | 1.07 | 0.00 | core | 57.82 | 36.80 |
| `ui-breadcrumb` | **3.19** | 1.56 | 1.02 | 0.78 | 0.00 | core | 57.12 | 35.81 |
| `ui-input` | **9.20** | 3.54 | 2.83 | 2.11 | 1.14 | core + forms | 69.47 | 52.61 |
| `ui-checkbox` | **8.07** | 3.96 | 2.73 | 0.75 | 1.09 | core + forms | 68.35 | 47.46 |
| `ui-form` | **9.51** | 5.36 | 2.23 | 2.12 | 0.00 | core + forms | 69.78 | 52.11 |
| `ui-item` | **2.96** | 1.74 | 0.37 | 1.02 | 0.00 | core | 56.89 | 40.33 |
| `ui-list` | **5.42** | 0.97 | 3.52 | 1.00 | 0.00 | core | 59.36 | 45.31 |
| `ui-menu` | **9.25** | 1.87 | 5.39 | 2.03 | 0.00 | core | 63.18 | 49.55 |
| `ui-table` | **11.92** | 4.22 | 5.58 | 2.19 | 0.00 | core | 65.86 | 48.28 |
| `ui-popup` | **7.21** | 3.27 | 2.60 | 1.54 | 0.00 | core | 61.15 | 39.14 |
| `ui-modal` | **6.96** | 3.48 | 2.11 | 1.53 | 0.00 | core | 60.90 | 66.13 |
| `ui-transition` | **3.09** | 2.10 | 0.28 | 0.93 | 0.00 | core | 57.02 | 34.67 |
| `ui-dimmer` | **4.33** | 2.21 | 1.05 | 1.26 | 0.00 | core | 58.26 | 36.20 |
| `ui-flyout` | **3.46** | 0.40 | 1.85 | 1.34 | 0.00 | core | 57.39 | 67.90 |
| `ui-sidebar` | **6.01** | 2.95 | 1.82 | 1.42 | 0.00 | core | 59.95 | 37.95 |
| `ui-shape` | **4.55** | 3.04 | 0.80 | 0.87 | 0.00 | core | 58.48 | 36.13 |
| `ui-card` | **6.54** | 1.90 | 3.01 | 1.73 | 0.00 | core | 60.47 | 52.54 |
| `ui-items` | **2.87** | 0.62 | 1.62 | 0.77 | 0.00 | core | 56.80 | 52.15 |
| `ui-feed` | **3.65** | 1.23 | 1.57 | 0.98 | 0.00 | core | 57.58 | 50.63 |
| `ui-comment` | **2.49** | 1.01 | 0.85 | 0.79 | 0.00 | core | 56.43 | 49.02 |
| `ui-statistic` | **3.56** | 1.02 | 1.38 | 1.32 | 0.00 | core | 57.49 | 46.22 |
| `ui-step` | **7.36** | 1.73 | 3.85 | 1.92 | 0.00 | core | 61.30 | 50.62 |
| `ui-rail` | **1.35** | 0.44 | 0.53 | 0.53 | 0.00 | core | 55.29 | 32.86 |
| `ui-reveal` | **2.38** | 1.00 | 0.91 | 0.63 | 0.00 | core | 56.32 | 34.25 |
| `ui-ad` | **1.85** | 0.52 | 0.85 | 0.61 | 0.00 | core | 55.78 | 33.35 |
| `ui-emoji` | **3.48** | 2.29 | 0.56 | 0.76 | 0.00 | core | 57.41 | 35.37 |
| `ui-select` | **6.79** | 2.48 | 2.25 | 1.09 | 1.47 | core + forms | 67.06 | 53.83 |
| `ui-search` | **11.33** | 6.21 | 2.46 | 2.13 | 1.01 | core + forms | 71.60 | 56.48 |
| `ui-progress` | **5.63** | 2.39 | 2.04 | 1.32 | 0.00 | core | 59.57 | 38.21 |
| `ui-rating` | **5.41** | 2.93 | 0.94 | 0.98 | 1.02 | core + forms | 65.68 | 45.48 |
| `ui-slider` | **8.29** | 4.22 | 1.92 | 1.41 | 1.15 | core + forms | 68.56 | 49.42 |
| `ui-accordion` | **5.92** | 3.13 | 1.61 | 1.33 | 0.00 | core | 59.86 | 56.12 |
| `ui-tab` | **7.09** | 4.13 | 0.97 | 2.19 | 0.00 | core | 61.02 | 49.78 |
| `ui-toast` | **9.31** | 5.53 | 2.23 | 1.81 | 0.00 | core | 63.25 | 56.24 |
| `ui-nag` | **4.39** | 2.35 | 0.95 | 1.23 | 0.00 | core | 58.33 | 37.04 |
| `ui-sticky` | **1.83** | 1.11 | 0.31 | 0.56 | 0.00 | core | 55.77 | 34.28 |
| `ui-visibility` | **2.10** | 1.29 | 0.14 | 0.84 | 0.00 | core | 56.03 | 33.84 |
| `ui-embed` | **4.21** | 2.31 | 0.87 | 1.21 | 0.00 | core | 58.15 | 36.86 |
| `ui-calendar` | **14.32** | 9.45 | 2.04 | 2.21 | 1.07 | core + forms | 74.59 | 58.30 |
| `ui-root` | **7.93** | 5.96 | 0.35 | 1.84 | 0.00 | core | 61.87 | 60.39 |
| `ui-components` | **1.73** | 1.40 | 0.08 | 0.37 | 0.00 | core | 55.66 | 32.42 |
| `ui-section` | **9.85** | 3.91 | 3.50 | 2.62 | 0.00 | core | 63.78 | 50.45 |
| `ui-panel` | **2.05** | 0.41 | 1.28 | 0.47 | 0.00 | core | 55.98 | 52.41 |
| `ui-include` | **2.41** | 1.63 | 0.17 | 0.78 | 0.00 | core | 56.35 | 68.71 |
| `ui-code` | **5.51** | 3.65 | 1.12 | 0.88 | 0.00 | core | 59.44 | 46.86 |
| `ui-markdown` | **67.21** | 64.83 | 1.39 | 1.10 | 0.00 | core | 121.15 | 58.46 |
| `ui-tree-diagram` | **4.61** | 3.49 | 0.67 | 0.61 | 0.00 | core | 58.54 | 38.26 |
<!-- /generated:bundle-families -->

### Scenarios

<!-- generated:bundle-scenarios -->
| Scenario | Adds up | shared runtime min+gz kB | standalone build |
| --- | --- | --: | --: |
| page with one button | library + core + own:ui-button | **65.34** | 47.24 |
| all families | library + core + forms + own (61 families) | **460.62** | 403.14 |
| app already ships the library | core + forms + own (61 families) | **436.28** | -- |
<!-- /generated:bundle-scenarios -->

### Checks

<!-- generated:bundle-checks -->
| Check | Result |
| --- | --- |
| every family entry imports `core.js` | pass |
| no Rolldown runtime chunk (`rolldown-runtime-<hash>.js`):  its helpers stay in `core.js` | pass |
| no shared-entry module outside its own chunk (`core.js`, `forms.js` ...) | pass |
| no Solid module in `dist/` | pass |
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
- **Fallback bytes are mostly decorator helpers:**  each `UI<Name>.fallback.ts` (form controls only, since epic
  `wwod-spell-ui` P15) is minified and gzipped on its own here, and about 1.2 kB of that is esbuild's
  lowered-decorator helpers, repeated in every file with a decorator.  Net of them the fallbacks are 0.15-1.25 kB
  each (`docs/fallback.md`).
- **Lazy:**  `UIRuntime` (31.0 kB, with `UI.icons` since 2026-09-30);  icons load from the page's packs:  the
  default pack's index (14.2 kB gzip) on the first icon, then one SVG file per icon drawn.  `label` imports `UIParts.css` itself (a statistic's label adopts it), counted once, under `parts`.

## LOC

<!-- generated:loc -->
| Group | Files | Lines | Code lines |
| --- | --: | --: | --: |
| element core | 33 | 8326 | 4196 |
| components | 163 | 18886 | 10789 |
| vocabularies & fallbacks | 109 | 9377 | 7272 |
| foundation | 48 | 10265 | 5262 |
| tests | 323 | 56016 | 44661 |
| tooling | 86 | 13434 | 9094 |
<!-- /generated:loc -->

### Per file

<!-- generated:loc-files -->
| File | Lines | Code lines |
| --- | --: | --: |
| `core.ts` | 71 | 28 |
| `elements/Cell.ts` | 28 | 10 |
| `elements/ClassBuilder.ts` | 179 | 116 |
| `elements/ControlLabels.ts` | 184 | 108 |
| `elements/Controlled.ts` | 92 | 41 |
| `elements/DOMElement.ts` | 501 | 234 |
| `elements/DOMFormControl.ts` | 53 | 24 |
| `elements/DOMLoadableBodyElement.ts` | 34 | 13 |
| `elements/DOMLoadableElement.ts` | 138 | 58 |
| `elements/ElementDefinition.ts` | 243 | 133 |
| `elements/FormComponent.ts` | 166 | 58 |
| `elements/HotDefinitions.ts` | 302 | 172 |
| `elements/IconGlyph.ts` | 146 | 66 |
| `elements/LabelWatch.ts` | 104 | 64 |
| `elements/LoadableBody.ts` | 181 | 93 |
| `elements/LoadableComponent.tsx` | 467 | 265 |
| `elements/MenuOptions.ts` | 318 | 184 |
| `elements/NativeFallback.ts` | 261 | 119 |
| `elements/OwnerContext.ts` | 62 | 28 |
| `elements/PartComponent.tsx` | 85 | 42 |
| `elements/PartContext.ts` | 294 | 131 |
| `elements/Reactive.ts` | 1293 | 736 |
| `elements/RootSettings.ts` | 73 | 32 |
| `elements/ShadowEvents.ts` | 238 | 128 |
| `elements/Shorthand.ts` | 98 | 52 |
| `elements/SlotContent.ts` | 60 | 31 |
| `elements/SourceMarkup.ts` | 135 | 91 |
| `elements/StickyWatch.ts` | 207 | 112 |
| `elements/UIComponent.tsx` | 886 | 330 |
| `elements/Validator.ts` | 460 | 331 |
| `elements/elements.types.ts` | 894 | 333 |
| `elements/index.ts` | 50 | 27 |
| `forms.ts` | 23 | 6 |
| `components/ui-accordion/UIAccordion.tsx` | 420 | 224 |
| `components/ui-accordion/index.ts` | 15 | 4 |
| `components/ui-ad/UIAd.tsx` | 51 | 30 |
| `components/ui-ad/index.ts` | 11 | 3 |
| `components/ui-breadcrumb/UIBreadcrumb.tsx` | 89 | 48 |
| `components/ui-breadcrumb/UIBreadcrumbSection.tsx` | 63 | 35 |
| `components/ui-breadcrumb/index.ts` | 14 | 5 |
| `components/ui-button/UIButton.tsx` | 423 | 235 |
| `components/ui-button/UIButtons.tsx` | 50 | 29 |
| `components/ui-button/UIOr.tsx` | 37 | 22 |
| `components/ui-button/index.ts` | 15 | 7 |
| `components/ui-calendar/UICalendar.tsx` | 958 | 633 |
| `components/ui-calendar/index.ts` | 14 | 3 |
| `components/ui-card/UICard.tsx` | 221 | 128 |
| `components/ui-card/UICards.tsx` | 59 | 29 |
| `components/ui-card/index.ts` | 16 | 6 |
| `components/ui-checkbox/UICheckbox.tsx` | 62 | 29 |
| `components/ui-checkbox/UIRadio.tsx` | 165 | 91 |
| `components/ui-checkbox/index.ts` | 15 | 6 |
| `components/ui-code/UICode.tsx` | 203 | 116 |
| `components/ui-code/index.ts` | 23 | 10 |
| `components/ui-comment/UIComment.tsx` | 67 | 37 |
| `components/ui-comment/UIComments.tsx` | 78 | 43 |
| `components/ui-comment/index.ts` | 17 | 6 |
| `components/ui-components/UIComponents.ts` | 30 | 16 |
| `components/ui-components/index.ts` | 15 | 5 |
| `components/ui-container/UIContainer.tsx` | 29 | 16 |
| `components/ui-container/index.ts` | 11 | 3 |
| `components/ui-dimmer/UIDimmer.tsx` | 338 | 204 |
| `components/ui-dimmer/index.ts` | 14 | 3 |
| `components/ui-divider/UIDivider.tsx` | 55 | 28 |
| `components/ui-divider/index.ts` | 11 | 3 |
| `components/ui-dropdown/SlottedItems.ts` | 127 | 79 |
| `components/ui-dropdown/UIDropdown.tsx` | 929 | 617 |
| `components/ui-dropdown/index.ts` | 16 | 4 |
| `components/ui-embed/UIEmbed.tsx` | 223 | 123 |
| `components/ui-embed/index.ts` | 13 | 4 |
| `components/ui-emoji/UIEmoji.tsx` | 114 | 64 |
| `components/ui-emoji/index.ts` | 16 | 4 |
| `components/ui-feed/UIFeed.tsx` | 46 | 24 |
| `components/ui-feed/UIFeedEvent.tsx` | 110 | 59 |
| `components/ui-feed/index.ts` | 16 | 6 |
| `components/ui-flag/UIFlag.tsx` | 69 | 38 |
| `components/ui-flag/index.ts` | 13 | 4 |
| `components/ui-flyout/UIFlyout.tsx` | 47 | 20 |
| `components/ui-flyout/index.ts` | 18 | 4 |
| `components/ui-form/UIField.tsx` | 144 | 74 |
| `components/ui-form/UIFields.tsx` | 61 | 37 |
| `components/ui-form/UIForm.tsx` | 525 | 316 |
| `components/ui-form/index.ts` | 18 | 7 |
| `components/ui-grid/UIColumn.ts` | 20 | 7 |
| `components/ui-grid/UIGrid.ts` | 36 | 14 |
| `components/ui-grid/UIRow.ts` | 17 | 7 |
| `components/ui-grid/index.ts` | 17 | 7 |
| `components/ui-icon/UIIcon.tsx` | 68 | 29 |
| `components/ui-icon/UIIcons.tsx` | 38 | 21 |
| `components/ui-icon/index.ts` | 14 | 5 |
| `components/ui-image/UIImage.tsx` | 67 | 41 |
| `components/ui-image/UIImages.tsx` | 33 | 19 |
| `components/ui-image/index.ts` | 14 | 5 |
| `components/ui-include/UIInclude.tsx` | 262 | 137 |
| `components/ui-include/index.ts` | 16 | 5 |
| `components/ui-input/UIInput.tsx` | 245 | 159 |
| `components/ui-input/UITextarea.tsx` | 58 | 43 |
| `components/ui-input/index.ts` | 13 | 5 |
| `components/ui-item/UIItem.tsx` | 278 | 143 |
| `components/ui-item/index.ts` | 14 | 4 |
| `components/ui-items/UIItems.tsx` | 70 | 36 |
| `components/ui-items/index.ts` | 15 | 5 |
| `components/ui-label/UILabel.tsx` | 174 | 99 |
| `components/ui-label/UILabels.tsx` | 29 | 16 |
| `components/ui-label/index.ts` | 13 | 5 |
| `components/ui-list/UIList.tsx` | 156 | 73 |
| `components/ui-list/index.ts` | 14 | 4 |
| `components/ui-loader/UILoader.tsx` | 71 | 29 |
| `components/ui-loader/index.ts` | 11 | 3 |
| `components/ui-markdown/UIMarkdown.tsx` | 491 | 295 |
| `components/ui-markdown/index.ts` | 20 | 7 |
| `components/ui-menu/UIMenu.tsx` | 332 | 182 |
| `components/ui-menu/index.ts` | 14 | 4 |
| `components/ui-message/UIMessage.tsx` | 104 | 57 |
| `components/ui-message/index.ts` | 11 | 3 |
| `components/ui-modal/UIModal.tsx` | 28 | 12 |
| `components/ui-modal/index.ts` | 24 | 10 |
| `components/ui-nag/UINag.tsx` | 265 | 150 |
| `components/ui-nag/index.ts` | 13 | 4 |
| `components/ui-panel/UIPanel.tsx` | 55 | 18 |
| `components/ui-panel/index.ts` | 13 | 3 |
| `components/ui-parts/UIActions.ts` | 16 | 6 |
| `components/ui-parts/UIAuthor.ts` | 28 | 15 |
| `components/ui-parts/UIAvatar.tsx` | 31 | 18 |
| `components/ui-parts/UIContent.ts` | 23 | 9 |
| `components/ui-parts/UIDate.ts` | 24 | 12 |
| `components/ui-parts/UIDescription.ts` | 16 | 6 |
| `components/ui-parts/UIDetail.ts` | 25 | 12 |
| `components/ui-parts/UIExtra.ts` | 17 | 6 |
| `components/ui-parts/UIHeader.tsx` | 52 | 29 |
| `components/ui-parts/UIMeta.ts` | 16 | 6 |
| `components/ui-parts/UISummary.ts` | 17 | 6 |
| `components/ui-parts/UITitle.ts` | 23 | 12 |
| `components/ui-parts/UIValue.ts` | 16 | 6 |
| `components/ui-parts/index.ts` | 50 | 41 |
| `components/ui-placeholder/UIPlaceholder.tsx` | 41 | 24 |
| `components/ui-placeholder/UIPlaceholderHeader.ts` | 15 | 7 |
| `components/ui-placeholder/UIPlaceholderImage.ts` | 19 | 10 |
| `components/ui-placeholder/UIPlaceholderLine.ts` | 20 | 10 |
| `components/ui-placeholder/UIPlaceholderParagraph.ts` | 14 | 7 |
| `components/ui-placeholder/index.ts` | 21 | 11 |
| `components/ui-popup/UIPopup.tsx` | 620 | 337 |
| `components/ui-popup/index.ts` | 12 | 3 |
| `components/ui-progress/UIProgress.tsx` | 257 | 144 |
| `components/ui-progress/index.ts` | 13 | 4 |
| `components/ui-rail/UIRail.tsx` | 31 | 18 |
| `components/ui-rail/index.ts` | 11 | 3 |
| `components/ui-rating/UIRating.tsx` | 459 | 272 |
| `components/ui-rating/index.ts` | 12 | 3 |
| `components/ui-reveal/UIReveal.tsx` | 93 | 46 |
| `components/ui-reveal/index.ts` | 11 | 3 |
| `components/ui-root/UIRoot.catalog.ts` | 208 | 204 |
| `components/ui-root/UIRoot.tsx` | 483 | 265 |
| `components/ui-root/index.ts` | 23 | 9 |
| `components/ui-search/UISearch.tsx` | 785 | 527 |
| `components/ui-search/index.ts` | 13 | 4 |
| `components/ui-section/UISection.tsx` | 600 | 326 |
| `components/ui-section/UISections.tsx` | 46 | 22 |
| `components/ui-section/index.ts` | 18 | 5 |
| `components/ui-segment/UISegment.tsx` | 80 | 39 |
| `components/ui-segment/UISegments.tsx` | 30 | 17 |
| `components/ui-segment/index.ts` | 14 | 5 |
| `components/ui-select/UISelect.tsx` | 364 | 217 |
| `components/ui-select/index.ts` | 14 | 4 |
| `components/ui-shape/UIShape.tsx` | 443 | 265 |
| `components/ui-shape/UISide.tsx` | 64 | 38 |
| `components/ui-shape/index.ts` | 14 | 5 |
| `components/ui-sidebar/UIPushable.tsx` | 134 | 77 |
| `components/ui-sidebar/UIPusher.tsx` | 43 | 24 |
| `components/ui-sidebar/UISidebar.tsx` | 308 | 185 |
| `components/ui-sidebar/index.ts` | 17 | 7 |
| `components/ui-slider/UISlider.tsx` | 566 | 347 |
| `components/ui-slider/index.ts` | 13 | 4 |
| `components/ui-statistic/UIStatistic.tsx` | 78 | 44 |
| `components/ui-statistic/UIStatistics.tsx` | 57 | 30 |
| `components/ui-statistic/index.ts` | 17 | 5 |
| `components/ui-step/UIStep.tsx` | 184 | 100 |
| `components/ui-step/UISteps.tsx` | 70 | 34 |
| `components/ui-step/index.ts` | 15 | 5 |
| `components/ui-sticky/UISticky.tsx` | 180 | 87 |
| `components/ui-sticky/index.ts` | 11 | 3 |
| `components/ui-tab/UITab.tsx` | 182 | 104 |
| `components/ui-tab/UITabs.tsx` | 506 | 295 |
| `components/ui-tab/index.ts` | 16 | 5 |
| `components/ui-table/UITable.tsx` | 509 | 286 |
| `components/ui-table/index.ts` | 12 | 3 |
| `components/ui-text/UIText.tsx` | 35 | 20 |
| `components/ui-text/index.ts` | 11 | 3 |
| `components/ui-toast/UIToast.tsx` | 668 | 404 |
| `components/ui-toast/index.ts` | 19 | 7 |
| `components/ui-transition/UITransition.tsx` | 342 | 188 |
| `components/ui-transition/index.ts` | 14 | 3 |
| `components/ui-tree-diagram/UITreeDiagram.tsx` | 225 | 141 |
| `components/ui-tree-diagram/index.ts` | 24 | 14 |
| `components/ui-visibility/UIVisibility.tsx` | 188 | 116 |
| `components/ui-visibility/index.ts` | 13 | 3 |
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
- **Platform options instead of plumbing:**  `UIComponent.define()` passes `BaseElement` (`DOMElement` / `DOMFormControl`),
  `shadowRootInit: { mode: "open", delegatesFocus }`, `internals: true`, `formAssociated`, `keepAlive: true`,
  `errorBoundary`, `onError`, `fallback`.
- **Names:**  no attribute, event, slot or part literal in a template:  `this.part("button")`, `this.slot("icon")`,
  `this.emit("ui-toggle", ...)`, type-checked against the vocabulary.

### Templating, owner context, content parts

- JSX compiles to real DOM with fine-grained bindings.  `<Show>` / `<For>` (keyed:  filtering never recreates a
  row that stays visible);  contract classes use Solid 2's `class={[ITEM, { [ACTIVE]: chosen }]}`;  `<Dynamic>`
  for a part's varying root tag;  icon `<svg>` clones inserted as is (`IconGlyph.draw()`).
- **`PartContext`** holds the owner as a signal and a page-wide registry filled by `UIComponent.define()`;
  resolution is `OwnerContext.find()` over the flat tree, with a barrier at every registered non-part component.
  It re-resolves on every re-connect (the fork's `onConnect`;  `keepAlive` keeps the component across moves), on
  `slotchange` in any element's shadow root, and once after first settle.
- **`PartComponent`** (in `core`) makes the 13 parts cheap:  most are a dozen lines.
- **App context reaches components:**  `UIComponent.AppContext` is read by every component;  on the Solid 2 host
  page the app provides it around the dropdown and the component sees the app's value.
- **Platform limit:**  no event tells an element its assigned slot changed;  a foreign component re-slotting a
  part isn't seen until the part reconnects.

### What Solid 2 asks of component authors

The rules are in `AGENTS.md`, "Solid authoring".
- **Eager memos:**  Solid 2 memos compute at creation;  base-class memos that call overridables are
  `{ lazy: true }`, and effects that call overridables are created in `onMount()`, after subclass fields exist.
- **No signal writes in owned scopes:**  the fork's hooks can run inside a Solid render, so `isConnected` and the
  fieldset `formIsDisabled` replay are deferred a microtask.
- **Writes land on a microtask:**  tests `flush()` (`ElementFixture.settle()` / `tick()`).
- **`keepAlive` has a cost:**  a removed element keeps its reactive root until `dispose()` or garbage collection;
  anything page-wide (overlay entries) must follow `isConnected`, not disposal.
- **Dev diagnostics** flagged the `classes()` memo (now the `rootClass` getter) as `WIDE_SCOPE_DEPS` (it reads every attribute);  the production
  build drops them.

## Hot module replacement

Edit a component in `yarn dev` and every live instance updates in place:  same DOM elements,
their attributes and properties kept (the dropdown's `options` and controlled `value` included), no page reload.
Open `tools/demo/hmr.html` and edit `UIButton.tsx`, `UIButton.css` or `UIButton.en.ts`.

- **How:**
  - The fork's `solidElementHot()` (`vite.config.ts`, `apply: "serve"`) appends
    `import.meta.hot.accept(() => hotUpdate(import.meta.hot))` to each component barrel
    (`src/components/ui-<name>/index.ts`, the modules that call `define()`).  An edit to a component class, its
    vocabulary or fallback climbs to its barrel, which Vite re-runs with the fresh modules.
  - `define()` is idempotent per tag, so the barrel's `UIButton.define()` would return the OLD class.
    `HotDefinitions` (`src/elements/`, dev only, the plugin's `setup` import) wraps it:  a DIFFERENT class of the
    SAME name defining a known tag is a new version, and takes over every tag the old one had (`<ie-boton>`
    included) through `UIComponent.defineTag()`.
  - The fork swaps each class's component, props and options in place, migrates each instance's values, then
    `hotUpdate()` disposes and re-renders every live instance.
  - A changed vocabulary goes through `UI.vocabulary.replace()` (the registry refuses a SECOND object for a tag
    otherwise), which also re-resolves the runtime's translated names from it;  changed English texts reach
    `UI.i18n` where no translation replaced them.
  - CSS:  `?inline` component sheets self-accept;  `HotDefinitions.updateStyle()` re-registers the sheet by name
    and `Styles.register()` replaces its rules in every adopted shadow root.  Nothing re-renders.
- **Limits:**
  - Component-internal state resets:  a search query, the highlighted row, an open menu, an uncontrolled toggle.
  - Anything the platform reads once can't change:  observed attributes, `formAssociated`, the DOM element's base class,
    shadow root options.  The page reloads with `<ui-button>: observed attributes changed (+size), full reload`.
  - Shared code (`core`, `forms`, `UIComponent`, the runtime, `HotDefinitions`) reaches several barrels:  full
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
| vitest browser mode | dev (Vite dev server) | 40.5 / 40.5 / 42.8 | 0.8 / **4.5** / 11.3 | 1.9 / **8.0** / 19.7 | 6.5 / **15.1** / 20.9 |
| smoke perf page | production (`dist/` + vendored peers) | 31.9 / 31.9 / 34.1 | 0.7 / **3.0** / 8.2 | 1.8 / **5.8** / 16.6 | 13.0 / **15.5** / 16.6 |
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
| `fallback.html` | check | every form control, working + failed | PASS | ok: button, dropdown, input, checkbox, select, search, rating, slider, calendar, oneErrorEach, fallbackSubmits, iconGlyph; 9 console error(s) |
<!-- /generated:smoke -->

### Solid 2 host

- `tools/frameworks/solid/app.tsx`, a compiled Solid 2 app (`HostApp`) with `solid-js` / `@solidjs/web` external.
  Bindings:  `prop:options`, `prop:value`, `prop:open`;  `ui-*` listeners through a `ref` callback (Solid 2
  dropped `on:`).
- The page's identity probe (`identity.js`, loaded before the app;  never in `dist/`) proves:
  - **one module instance** -- `solidIdentity` / `webIdentity`:  the app's `createSignal` / `render` ARE the
    functions the components' copy exports
  - **context flows** -- `contextReachesComponent`:  the app wraps the dropdown in
    `<UIComponent.AppContext value="from-the-app">` and the component inside reads it (owner adoption across the
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
- **`fallback.html`** (`tools/demo/`) -- every form control working beside its failed copy, showing its native
  fallback;  its console errors are the 9 intentional failures.  Also checks that a `ui-icon` draws its SVG from
  `dist/icon-packs/`.

### Notes

- `options` always arrived as a property;  the vanilla page sets `options`, `value` and the listener BEFORE the
  element is defined:  the fork's upgrade step is the backstop.
- **Controlled values:**  re-setting `el.value` in a `ui-change` handler reverts the UI (tested).
- **React caveat:**  a React handler that rejects a change leaves the element showing the new value while React
  state keeps the old one;  React won't re-set a prop that hasn't changed.

## Forms & accessibility

- **Form association** is the fork's `formAssociated` option;  form callbacks arrive as hooks:  `onFormReset` =>
  `FormComponent.onFormReset()`, `onFormDisabled` => `UIComponent.formDisabled`.  `DOMFormControl` is the form-control API
  (`form`, `validity`, `checkValidity()` ...).
- `FormComponent`:  `formValue()` feeds `internals.setFormValue()` (a `string[]` becomes a `FormData`);  `required`
  runs `Validator` into `setValidity(flags, message, anchor)` with `:state(invalid)`;  reset restores the
  connect-time value;  a disabled `<fieldset>` disables the control.
- **Submit buttons:**  `<ui-button type="submit">` calls `internals.form.requestSubmit()`, sending `name=value` by
  setting the button's form value for the duration (a custom element can't be the form's `submitter`).
  **Known gap:**  Enter in a text field doesn't find a custom element as the form's default button.
- **Keyboard:**  `delegatesFocus`;  the APG combobox pattern with real key events (arrows, Home / End, PageUp /
  PageDown, Enter, Space, Tab, Escape routed by `UI.overlays`, type-ahead, Backspace removing the last label).
- **ARIA:**  `aria-activedescendant` needs the listbox in the combobox's own shadow root, so rich `<ui-item>`
  content is PROJECTED into its row;  the combobox is named from `placeholder` (else `text`, else `name`);
  the DOM element's `aria-label` is forwarded to the inner control.
- **axe** passes on every element-markup example (`src/components/ui-<name>/examples/elements/`, 39 files),
  `color-contrast` included (text inside a `.ui.disabled` element exempt, as WCAG exempts inactive components --
  `test/A11y.ts`), with `heading-order` off for two pages of heading demos;
  and on every form control's native fallback.

## SSR / Declarative Shadow DOM

**DIY, no hydration.**  The fork has no server render yet.  `test/ssr.ssr.test.tsx` (node project) renders the
REAL `UIButton` component under `@solidjs/web`'s server `renderToString` against a stub DOM element, and wraps it in
`<template shadowrootmode="open" shadowrootdelegatesfocus>` with the foundation CSS + `UIButton.css` inlined.  The
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
- **Hook:**  `UIComponent.define()` passes the fork's `onError` (ONE `console.error` naming the tag, a cancelable,
  bubbling, composed `ui-error` with `detail: { error }`;  the fork sets `:state(errored)`) and `fallback`:
  unless `ui-error` was cancelled, a form control's `elementSetup.Fallback` builds its native DOM into the shadow
  root a microtask later.  Every other element (since epic `wwod-spell-ui` P15) gets a bare `<slot>`:  its children
  still show.
- **What degrades** is listed per family in `docs/fallback.md`;  in short:  button loses `ui-toggle`, the glyph
  and the spinner;  the dropdown becomes a native `<select>` (form value, validity, `element.value` and
  `ui-change` keep working).
- **Tests:**  `test/fallback.cases.ts`, run by `test/fallback.test.tsx` through a `FallbackAdapter`
  (`ElementFixture.breakRender()` makes a RENDERED element's next update throw).  All 8 pass, axe included.

## Translation

- `UIButton.define("ie-boton", es)` and `UIDropdown.define("ie-desplegable", es)`, with a 20-line dictionary
  (`test/dictionary.es.ts`):  `test/translate.test.tsx`, `tools/demo/translate.html` (dev) and
  `tools/smoke/translate.html` (from `dist/`).
- A second `ElementDefinition` for the same component class, from the localized vocabulary:  localized attribute
  AND property names (`primario`, `"primario" in el`) under the SAME canonical keys.  Classes stay canonical;
  events are localized (`ie-cambio`).  A canonical attribute the dictionary doesn't translate still works.

## Testing

- **Suite:**  Vitest, two projects:  `browser` (chromium;  `SPELL_UI_TEST_ALL=1` adds firefox and webkit) and `ssr`
  (node).  Component tests live beside their component (`UI<Name>.test.tsx`);  cross-family ones in `test/`
  (fallback, isolation, translate, SSR, DSD).  The class-grammar CSS tests (`UI<Name>.css.test.ts`) stay:  they test
  the sheets on static markup, which the element tests don't cover.
- **Synchronization:**  `DOMElement.ready` + `flush()` (`ElementFixture.render()` / `settle()` / `tick()`);  no sleeps
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
2. `src/components/ui-parts/UIParts.css`:  an in-feed `.date` outside a summary is a `<time>` with no `display`, so it
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
