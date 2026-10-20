# `@spell-app/ui` status report

> NOTE (2026-10-09):  "the fork" below means `@spell-app/solid-element`, which is gone:
> epic `spell-element` folded it into `src/elements/`
> (`DOMElement`, `UIComponent`, `ShadowEvents`, `HotDefinitions`, `tools/HotElements.ts`),
> `ui`'s own code now, bundled into `core.js`, no longer a peer.
> The prose about it is history;  the generated tables are current.

Eight component families, on **Solid 2.0.0-rc.11**, through **`@spell-app/solid-element`**:
- The families:
  - `ui-button` (+ `ui-buttons`, `ui-or`), `ui-dropdown` (+ `ui-item`)
  - `ui-icon` / `ui-icons`, `ui-label` / `ui-labels`
  - the 13 generic content parts
  - `ui-divider`, `ui-segment` / `ui-segments`, `ui-container`
- `@spell-app/solid-element` (`packages/solid-element/`) is our fork of `@solidjs/element` + `component-register`.
- Over the foundation in `src/`:  vocabularies, CSS, runtime, icons, native fallbacks.
- Packaged as a SHARED RUNTIME:
  - `solid-js`, `@solidjs/web` and the fork are peer dependencies (external)
  - the element core is split into two shared entries:
    `core.js` for every family, `forms.js` only for families with a form value
  - each family ships only its own classes, sheet and vocabulary, and a form control its native fallback

This report holds facts and measurements.
- Every table between `generated` markers is rewritten by `yarn report` (`tools/ReportTables.ts`),
  from `tools/results/*.json`.
  Run the commands under "Commands" first.
- How we got here (the Lit vs Solid spikes) is in the appendix.

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

- **Solid 2.0 RC:**  `solid-js` / `@solidjs/web` `2.0.0-rc.11`, pinned exactly (12 RCs in 7 weeks).
  - `@solidjs/vite-plugin` `3.0.0-next.46` (native OXC compiler).
  - `@solidjs/web` owns the JSX types:  `jsxImportSource: "@solidjs/web"`, `jsx: "preserve"`.
- **The fork:**  `@spell-app/solid-element`, `"link:./packages/solid-element"` in `dependencies`.
  - Its own yarn project (own `yarn.lock`, `yarn fork <script>`), with its own tests (`yarn test:fork`).
  - Its `exports` point the `development` condition at `src/index.ts`,
    so the dev server, Vitest and the docs site compile the fork's TypeScript with our Solid plugin.
  - The library build leaves it external.
  - Only `yarn vendor` / `yarn measure` bundle its BUILT `dist/`,
    and they build it first when stale (`tools/ForkBuild.ts`).
  - The HMR plugin is imported from source (`./packages/solid-element/src/vite.ts`) by `vite.config.ts`
    (and so by the site bundle's config), so a fresh checkout never needs the fork's `dist/` to start.
- **Decorators:**  standard (TC39 2023-11), through `vite.decorators.ts` (esbuild pre-pass, `jsx: "preserve"`).
  - Listed BEFORE `solid()`;  both are `enforce: "pre"`.
- **One Solid:**  `resolve.dedupe: ["solid-js", "@solidjs/web"]` in every Vite config (library, tests, site),
  and in the vendor / measure builds.
  - Otherwise the linked fork resolves its OWN Solid, and two copies can't share owners.
- **Config:**  `vite.config.ts` exports `baseConfig()`:  plugins, aliases, dedupe, Lightning CSS with `CSS_TARGETS`.
  It's used by:
  - the library build
  - `vitest.config.ts`:  two projects, `browser` in chromium and `ssr` in node, each with its own Solid plugin instance
  - the docs site's bundle, `vite.site.config.ts`

### Commands

From the repo root:
- `yarn review` -- tsc (root, node configs, the fork), oxlint `--fix` (incl. the fork), oxfmt, then every test:
  `ssr`, `browser`, and the fork's suite
- `yarn build` -- `dist/`:
  `core.js`, `forms.js`, one entry per family, `styles.js`, `index.js`, the lazy runtime chunk,
  `icon-packs/` (icon packs:  SVG files + `pack.js`), `.d.ts`
- `yarn vendor` -- `vendor/`:  one ES module per peer specifier + `vendor/importmap.json` (`PeerVendor`)
- `yarn measure` -- `tools/results/measure-results.json` (`BundleMeasure`)
- `yarn smoke` -- builds, then runs the import-map pages in headless chromium:  `smoke-results.json` (`SmokeRunner`).
  - Needs network only for esm.sh (React, Solid 1.9) and unpkg (Vue).
- `yarn serve` -- the same pages for a person (prints URLs)
- `yarn report` -- `loc-results.json` (`LocCount`), then this file's tables (`ReportTables`)
- `yarn test:hmr` -- hot module replacement end to end:  dev server + headless chromium + real file edits
- `yarn dev` -- `tools/demo/`:  every example as class grammar beside element markup, plus perf, translate, HMR pages.
  - `yarn screenshots` writes one PNG per example pair.
- `yarn site:build` / `yarn site:dev` -- the docs site's data, generated pages and bundle.
  - `site:dev` rebuilds the bundle on every edit, while the page server serves `/ui/`.

### Final state

At the promotion (2026-09-29):
- `yarn review` clean:
  - `browser`:  1102 tests (1101 passed, 1 todo) in 63 files
  - `ssr`:  1
  - the fork:  121 in 13 files
- `yarn build` clean:  `dist/glyphs/` 2,163 files;  `dist/icon-packs/` 2,167 SVGs since 2026-09-30
- `yarn vendor`:  3 specifiers, all tree-shaken
- `yarn measure`:  all checks pass
- `yarn smoke`:  8 / 8 pages
- `yarn test:hmr`:  8 / 8
- `yarn report` twice, no diff
- `yarn site:build`:  9 pages, live `ui-button` / `ui-dropdown`

## Bundle

### Method

- **Packaging:**
  - `solid-js`, `@solidjs/*` and `@spell-app/solid-element` are external, as a FUNCTION so subpaths match
    (`SOLID_EXTERNAL` in `vite.config.ts`).
    - `dist/` contains no Solid or fork code, and imports the three by specifier.
  - **Two shared entries** (`SHARED_ENTRIES`):
    - `src/core.ts` -- the element core AND the foundation it uses:
      - the element core:  `DOMElement`, `UIComponent`, `ElementDefinition`, `PartComponent` + `PartContext`,
        `Controlled`, `Cell`, `SlotContent`, `HostAttribute`, `IconGlyph`
      - `$/ui/util`, `$/ui/vocabulary`
      - from `$/ui/elements`:  `ClassBuilder` / `Shorthand` / `OwnerContext` / `NativeFallback`
      - `$/ui/runtime` (the eager loader only), `$/ui/icons` (`IconName`, `BuiltInPacks`)
      - `$/ui/components/components.types`
    - `src/forms.ts` -- `FormComponent`, `DOMFormControl`, `Validator`, `MenuOptions`;  imported by `dropdown` only.
      - `ui-button` is form-associated through the fork's `formAssociated` option alone, so it stays on `core`.
  - Every component file (classes AND native fallback) imports shared code through ONE path, `$/ui/core`
    (and `$/ui/forms` where needed).
    - The vocabulary and the sheet are the family's own.
    - Two chunking rules:
      - `core.ts` / `forms.ts` re-export `$/ui/elements` LEAVES, never the barrel:  the barrel holds the `forms` files.
      - `DOMFormControl` / `FormComponent` import the element core through the `$/ui/core` ENTRY.
        Importing its leaves made Rolldown hoist everything `core` and `forms` share into a third chunk,
        and `core.js` became a facade.
  - `styles` is its own entry (`dist/styles.js`).
    - The `index` entry re-exports the foundation sheets.
      Without an entry of their own, they landed in `index.js`, which the lazy `UIRuntime` chunk then imported:
      loading the runtime on a button-only page would have pulled every family.
  - `rolldownOptions.preserveEntrySignatures: "allow-extension"`.
    - `UIButton.css` + the button vocabulary land in a shared `button-<hash>.js` (the dropdown adopts `UIButton.css`).
  - The `E` / `V` namespaces are their own entry, `api` (`src/api.ts`, `@spell-app/ui/api`);  `index.js` is flat.
    - Why:  namespacing a module that `core` also reaches
      (as `index.ts` once did, with `export * as V from "$/ui/vocabulary"`)
      made Rolldown move its runtime module (`__name`, `__exportAll`) out of `core.js`,
      into a shared `rolldown-runtime-<hash>.js` that `core.js` and every family imported.
      That was one more request per page (0.19 kB min+gz).
    - So `V` namespaces an api-only re-export of the barrel (`vocabulary.api.ts`),
      and `api.ts` imports the `forms` entry, so the `forms` leaves stay in `forms.js`.
    - `core.js` keeps the helpers, and exports `__exportAll` to `api.js` (+0.06 kB min+gz).
    - A button-only page:  3 of our files instead of 4.
    - The check `no Rolldown runtime chunk` guards it.
  - Icons are separate files:  `dist/icon-packs/<id>/`, SVGs + `pack.js`, copied by `emitIconPacks()`.
    - They're found relative to the chunk holding `BuiltInPacks` (`core.js`),
      and loaded by the runtime (`UI.icons`);  see [the icons doc](icons.md).
- **Measuring** (`BundleMeasure`):  the repo's Vite config, built in memory.
  - Entries `core` + `forms` + one per family + `api` (it changes how `core.js` comes out).
    `vite:dts` and the icon-pack copy dropped;  no `index` or `styles`.
  - Every module is attributed to a bucket by id (`tools/package.config.ts`):
    `library`, `core`, `shared:forms`, `own:<family>:classes|css|vocabulary|fallback`, `extra:api`,
    lazy `runtime` / `icons`.
  - Each tier is minified (esbuild) and gzipped (level 9) ON ITS OWN.
  - A scenario sums, per family, only the shared entries its chunk imports.
  - `library (as used)` bundles exactly the bindings `dist/` imports from each peer specifier;
    `library (full)` every export, for comparison.
- **Standalone** (for comparison):  each family built ALONE, with Solid and the fork bundled and tree-shaken,
  eager chunks summed.
  What an app bundling everything itself would ship.

### Tiers

<!-- generated:bundle-tiers -->
| Tier | min kB | min+gz kB | Loaded |
| --- | --: | --: | --- |
| library (as used:  the bindings `dist/` imports) | 65.85 | 24.34 | eager |
| library (full:  every export of the peer set) | 161.25 | 56.83 | comparison |
| core (element core + foundation JS) | 94.10 | 33.27 | eager |
| forms (form base, validation, menu options;  imported by `ui-dropdown`, `ui-input`, `ui-checkbox`, `ui-form`, `ui-select`, `ui-search`, `ui-rating`, `ui-slider`, `ui-calendar`) | 19.39 | 6.71 | eager |
| own, all 61 families | 1248.64 | 340.59 | eager |
| api (`E` / `V` namespaces, `@spell-app/ui/api`) | 0.14 | 0.10 | app only |
| styles (extra entry) | 128.99 | 17.01 | app only |
| runtime (`UIRuntime` + foundation CSS) | 308.43 | 159.92 | lazy |
| icons (none bundled:  pack indexes and SVGs are separate files, `notes/icons.md`) | 0.00 | 0.00 | lazy |
| family data (emoji name chunks, each loaded on its own) | 687.58 | 178.82 | lazy |
<!-- /generated:bundle-tiers -->

### Own cost per family

<!-- generated:bundle-families -->
| Family | own min+gz kB | classes | css | vocabulary | fallback | imports | page with only it | standalone (library bundled) |
| --- | --: | --: | --: | --: | --: | --- | --: | --: |
| `ui-button` | **11.37** | 3.48 | 4.22 | 2.86 | 1.08 | core | 68.98 | 48.03 |
| `ui-dropdown` | **15.44** | 6.88 | 4.93 | 2.50 | 1.44 | core + forms | 79.76 | 67.94 |
| `ui-icon` | **3.91** | 0.88 | 1.90 | 1.27 | 0.00 | core | 61.53 | 34.35 |
| `ui-label` | **6.70** | 1.51 | 3.55 | 1.75 | 0.00 | core | 64.32 | 48.15 |
| `ui-parts` | **9.76** | 1.59 | 5.65 | 2.57 | 0.00 | core | 67.37 | 43.39 |
| `ui-divider` | **2.19** | 0.67 | 0.93 | 0.73 | 0.00 | core | 59.80 | 33.07 |
| `ui-segment` | **5.55** | 0.86 | 3.33 | 1.50 | 0.00 | core | 63.16 | 34.56 |
| `ui-container` | **1.81** | 0.46 | 0.83 | 0.68 | 0.00 | core | 59.42 | 30.18 |
| `ui-grid` | **6.11** | 0.76 | 3.67 | 1.78 | 0.00 | core | 63.72 | 35.01 |
| `ui-image` | **3.64** | 0.88 | 1.62 | 1.25 | 0.00 | core | 61.26 | 31.94 |
| `ui-text` | **1.16** | 0.45 | 0.39 | 0.45 | 0.00 | core | 58.78 | 29.51 |
| `ui-flag` | **4.10** | 3.13 | 0.49 | 0.62 | 0.00 | core | 61.72 | 34.96 |
| `ui-loader` | **2.52** | 0.65 | 1.27 | 0.73 | 0.00 | core | 60.14 | 31.36 |
| `ui-placeholder` | **3.11** | 1.00 | 1.34 | 0.90 | 0.00 | core | 60.73 | 31.80 |
| `ui-message` | **3.86** | 1.05 | 1.85 | 1.07 | 0.00 | core | 61.48 | 35.06 |
| `ui-breadcrumb` | **3.17** | 1.54 | 1.00 | 0.78 | 0.00 | core | 60.78 | 34.08 |
| `ui-input` | **9.02** | 3.36 | 2.83 | 2.11 | 1.14 | core + forms | 73.34 | 53.59 |
| `ui-checkbox` | **7.91** | 3.80 | 2.72 | 0.75 | 1.09 | core + forms | 72.23 | 48.44 |
| `ui-form` | **12.42** | 7.59 | 2.34 | 2.69 | 0.00 | core + forms | 76.75 | 55.35 |
| `ui-item` | **2.96** | 1.75 | 0.36 | 1.02 | 0.00 | core | 60.57 | 40.45 |
| `ui-list` | **5.41** | 0.97 | 3.51 | 1.00 | 0.00 | core | 63.03 | 45.49 |
| `ui-menu` | **9.26** | 1.88 | 5.39 | 2.03 | 0.00 | core | 66.87 | 49.67 |
| `ui-table` | **11.91** | 4.22 | 5.57 | 2.19 | 0.00 | core | 69.53 | 48.58 |
| `ui-popup` | **7.29** | 3.43 | 2.60 | 1.48 | 0.00 | core | 64.91 | 37.57 |
| `ui-modal` | **7.05** | 3.65 | 2.11 | 1.47 | 0.00 | core | 64.67 | 66.87 |
| `ui-transition` | **2.66** | 1.83 | 0.28 | 0.73 | 0.00 | core | 60.27 | 32.73 |
| `ui-dimmer` | **4.43** | 2.35 | 1.07 | 1.20 | 0.00 | core | 62.04 | 34.54 |
| `ui-flyout` | **3.48** | 0.50 | 1.85 | 1.28 | 0.00 | core | 61.10 | 68.67 |
| `ui-sidebar` | **6.01** | 3.01 | 1.82 | 1.36 | 0.00 | core | 63.63 | 36.09 |
| `ui-shape` | **4.57** | 3.06 | 0.80 | 0.87 | 0.00 | core | 62.19 | 34.35 |
| `ui-card` | **6.50** | 1.88 | 3.00 | 1.73 | 0.00 | core | 64.12 | 49.43 |
| `ui-items` | **2.86** | 0.62 | 1.61 | 0.77 | 0.00 | core | 60.48 | 52.26 |
| `ui-feed` | **3.57** | 1.17 | 1.56 | 0.98 | 0.00 | core | 61.19 | 48.83 |
| `ui-comment` | **2.40** | 0.93 | 0.84 | 0.79 | 0.00 | core | 60.02 | 45.72 |
| `ui-statistic` | **3.54** | 1.01 | 1.37 | 1.32 | 0.00 | core | 61.15 | 43.02 |
| `ui-step` | **7.35** | 1.74 | 3.84 | 1.92 | 0.00 | core | 64.97 | 50.62 |
| `ui-rail` | **1.34** | 0.44 | 0.51 | 0.53 | 0.00 | core | 58.95 | 29.70 |
| `ui-reveal` | **2.44** | 0.99 | 0.89 | 0.69 | 0.00 | core | 60.06 | 31.05 |
| `ui-ad` | **1.84** | 0.52 | 0.85 | 0.61 | 0.00 | core | 59.45 | 30.17 |
| `ui-emoji` | **3.48** | 2.30 | 0.54 | 0.76 | 0.00 | core | 61.09 | 32.16 |
| `ui-select` | **6.78** | 2.35 | 2.23 | 1.16 | 1.55 | core + forms | 71.11 | 55.02 |
| `ui-search` | **11.30** | 6.12 | 2.45 | 2.20 | 1.02 | core + forms | 75.63 | 57.59 |
| `ui-progress` | **5.60** | 2.36 | 2.04 | 1.32 | 0.00 | core | 63.21 | 37.71 |
| `ui-rating` | **5.16** | 2.69 | 0.93 | 0.98 | 1.02 | core + forms | 69.48 | 46.49 |
| `ui-slider` | **8.29** | 4.10 | 1.91 | 1.54 | 1.15 | core + forms | 72.62 | 50.60 |
| `ui-accordion` | **5.90** | 3.12 | 1.59 | 1.33 | 0.00 | core | 63.52 | 54.44 |
| `ui-tab` | **7.11** | 4.16 | 0.97 | 2.19 | 0.00 | core | 64.73 | 50.71 |
| `ui-toast` | **9.31** | 5.53 | 2.22 | 1.81 | 0.00 | core | 66.92 | 56.83 |
| `ui-nag` | **4.38** | 2.35 | 0.94 | 1.23 | 0.00 | core | 62.00 | 35.34 |
| `ui-sticky` | **1.82** | 1.11 | 0.29 | 0.56 | 0.00 | core | 59.44 | 31.15 |
| `ui-visibility` | **2.06** | 1.31 | 0.12 | 0.79 | 0.00 | core | 59.67 | 32.09 |
| `ui-embed` | **4.20** | 2.31 | 0.85 | 1.21 | 0.00 | core | 61.82 | 35.13 |
| `ui-calendar` | **14.19** | 9.34 | 2.03 | 2.21 | 1.07 | core + forms | 78.52 | 59.38 |
| `ui-root` | **8.11** | 6.14 | 0.35 | 1.84 | 0.00 | core | 65.72 | 64.74 |
| `ui-components` | **1.80** | 1.48 | 0.08 | 0.37 | 0.00 | core | 59.41 | 29.14 |
| `ui-section` | **9.80** | 3.87 | 3.48 | 2.62 | 0.00 | core | 67.42 | 50.31 |
| `ui-panel` | **2.05** | 0.41 | 1.28 | 0.47 | 0.00 | core | 59.66 | 52.02 |
| `ui-include` | **2.40** | 1.63 | 0.16 | 0.78 | 0.00 | core | 60.02 | 72.93 |
| `ui-code` | **5.31** | 3.43 | 1.12 | 0.90 | 0.00 | core | 62.92 | 44.16 |
| `ui-markdown` | **6.33** | 4.02 | 1.39 | 1.06 | 0.00 | core | 63.95 | 50.50 |
| `ui-tree-diagram` | **4.60** | 3.49 | 0.66 | 0.61 | 0.00 | core | 62.21 | 35.09 |
<!-- /generated:bundle-families -->

### Scenarios

<!-- generated:bundle-scenarios -->
| Scenario | Adds up | shared runtime min+gz kB | standalone build |
| --- | --- | --: | --: |
| page with one button | library + core + own:ui-button | **68.98** | 48.03 |
| all families | library + core + forms + own (61 families) | **404.92** | 410.51 |
| app already ships the library | core + forms + own (61 families) | **380.57** | -- |
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

- **Unchanged by the promotion:**  within 0.05 kB of the spike's last numbers.
  - core 14.59 vs 14.63, page with one button 53.03 vs 53.08, all families 118.71 vs 118.76
  - `core` lost a little with the per-icon glyph loader.
- **Vendored Solid now shrinks too.**
  - The Solid 2 host page's identity probe moved out of shipped code, into the page
    (`tools/frameworks/solid/identity.js`).
    It binds `createSignal` / `render`, instead of `import * as` both packages.
  - `yarn vendor` now tree-shakes all three specifiers to the bindings `dist/` and the smoke pages import:
    30.4 kB min+gz over five files (was 59.9 kB, everything).
  - `library (as used)` (26.7 kB, one bundle) is what an app bundler ships.
    The vendored set is a little larger, because the pages themselves use `render`, `flush` ...
- **The fork costs 1.5 kB more than what it replaces:**
  3.67 kB min+gz vs 2.13 for `@solidjs/element` + `component-register` (`yarn fork measure`).
  - For options, prototype accessors, converters, synchronous reflection, form hooks, lifecycle hooks
    and the error boundary.
- **`forms` keeps a button page lean:**  a page with only buttons loads `core` but not `forms`;
  the dropdown loads both.
- **Fallback bytes are mostly decorator helpers.**
  - Each `UI<Name>.fallback.ts` (form controls only, since epic `wwod-spell-ui` P15)
    is minified and gzipped on its own here.
  - About 1.2 kB of that is esbuild's lowered-decorator helpers, repeated in every file with a decorator.
  - Net of them, the fallbacks are 0.15-1.25 kB each ([the fallback doc](fallback.md)).
- **Lazy:**
  - `UIRuntime`:  31.0 kB, with `UI.icons` since 2026-09-30.
  - Icons load from the page's packs:
    the default pack's index (14.2 kB gzip) on the first icon, then one SVG file per icon drawn.
  - `label` imports `UIParts.css` itself (a statistic's label adopts it):  counted once, under `parts`.

## LOC

<!-- generated:loc -->
| Group | Files | Lines | Code lines |
| --- | --: | --: | --: |
| element core | 23 | 4314 | 2221 |
| components | 164 | 19338 | 10868 |
| vocabularies & fallbacks | 110 | 9452 | 7302 |
| foundation | 48 | 10174 | 5277 |
| tests | 333 | 56017 | 44739 |
| tooling | 75 | 12617 | 8334 |
<!-- /generated:loc -->

### Per file

<!-- generated:loc-files -->
| File | Lines | Code lines |
| --- | --: | --: |
| `core.ts` | 76 | 21 |
| `elements/ClassBuilder.ts` | 181 | 116 |
| `elements/ControlLabels.ts` | 184 | 108 |
| `elements/DOMFormControl.ts` | 64 | 29 |
| `elements/DOMLoadableBodyElement.ts` | 35 | 13 |
| `elements/DOMLoadableElement.ts` | 139 | 58 |
| `elements/FormComponent.ts` | 321 | 98 |
| `elements/IconGlyph.ts` | 146 | 66 |
| `elements/LabelWatch.ts` | 104 | 64 |
| `elements/LoadableBody.ts` | 194 | 95 |
| `elements/LoadableComponent.tsx` | 483 | 264 |
| `elements/MenuOptions.ts` | 318 | 184 |
| `elements/NativeFallback.ts` | 263 | 119 |
| `elements/PartComponent.tsx` | 91 | 42 |
| `elements/RootSettings.ts` | 73 | 32 |
| `elements/Shorthand.ts` | 98 | 52 |
| `elements/SourceMarkup.ts` | 135 | 91 |
| `elements/SpellUISettings.ts` | 85 | 56 |
| `elements/StickyWatch.ts` | 207 | 112 |
| `elements/Validator.ts` | 460 | 331 |
| `elements/elements.types.ts` | 585 | 246 |
| `elements/index.ts` | 45 | 18 |
| `forms.ts` | 27 | 6 |
| `components/ui-accordion/UIAccordion.tsx` | 421 | 224 |
| `components/ui-accordion/index.ts` | 15 | 4 |
| `components/ui-ad/UIAd.tsx` | 51 | 30 |
| `components/ui-ad/index.ts` | 11 | 3 |
| `components/ui-breadcrumb/UIBreadcrumb.tsx` | 90 | 48 |
| `components/ui-breadcrumb/UIBreadcrumbSection.tsx` | 64 | 35 |
| `components/ui-breadcrumb/index.ts` | 14 | 5 |
| `components/ui-button/UIButton.tsx` | 426 | 235 |
| `components/ui-button/UIButtons.tsx` | 50 | 29 |
| `components/ui-button/UIOr.tsx` | 37 | 22 |
| `components/ui-button/index.ts` | 15 | 7 |
| `components/ui-calendar/UICalendar.tsx` | 946 | 621 |
| `components/ui-calendar/index.ts` | 14 | 3 |
| `components/ui-card/UICard.tsx` | 218 | 124 |
| `components/ui-card/UICards.tsx` | 59 | 29 |
| `components/ui-card/index.ts` | 16 | 6 |
| `components/ui-checkbox/UICheckbox.tsx` | 62 | 29 |
| `components/ui-checkbox/UIRadio.tsx` | 171 | 95 |
| `components/ui-checkbox/index.ts` | 15 | 6 |
| `components/ui-code/UICode.tsx` | 199 | 111 |
| `components/ui-code/index.ts` | 20 | 7 |
| `components/ui-comment/UIComment.tsx` | 59 | 29 |
| `components/ui-comment/UIComments.tsx` | 75 | 39 |
| `components/ui-comment/index.ts` | 17 | 6 |
| `components/ui-components/UIComponents.ts` | 32 | 16 |
| `components/ui-components/index.ts` | 15 | 5 |
| `components/ui-container/UIContainer.tsx` | 29 | 16 |
| `components/ui-container/index.ts` | 11 | 3 |
| `components/ui-dimmer/UIDimmer.tsx` | 361 | 212 |
| `components/ui-dimmer/index.ts` | 14 | 3 |
| `components/ui-divider/UIDivider.tsx` | 52 | 28 |
| `components/ui-divider/index.ts` | 11 | 3 |
| `components/ui-dropdown/SlottedItems.ts` | 133 | 79 |
| `components/ui-dropdown/UIDropdown.tsx` | 931 | 610 |
| `components/ui-dropdown/index.ts` | 16 | 4 |
| `components/ui-embed/UIEmbed.tsx` | 223 | 123 |
| `components/ui-embed/index.ts` | 13 | 4 |
| `components/ui-emoji/UIEmoji.tsx` | 113 | 56 |
| `components/ui-emoji/index.ts` | 16 | 4 |
| `components/ui-feed/UIFeed.tsx` | 46 | 24 |
| `components/ui-feed/UIFeedEvent.tsx` | 106 | 55 |
| `components/ui-feed/index.ts` | 16 | 6 |
| `components/ui-flag/UIFlag.tsx` | 69 | 38 |
| `components/ui-flag/index.ts` | 13 | 4 |
| `components/ui-flyout/UIFlyout.tsx` | 54 | 25 |
| `components/ui-flyout/index.ts` | 18 | 4 |
| `components/ui-form/UIField.tsx` | 145 | 74 |
| `components/ui-form/UIFields.tsx` | 62 | 36 |
| `components/ui-form/UIForm.tsx` | 612 | 362 |
| `components/ui-form/UIRepeat.tsx` | 197 | 100 |
| `components/ui-form/index.ts` | 21 | 9 |
| `components/ui-grid/UIColumn.ts` | 20 | 7 |
| `components/ui-grid/UIGrid.ts` | 37 | 14 |
| `components/ui-grid/UIRow.ts` | 17 | 7 |
| `components/ui-grid/index.ts` | 17 | 7 |
| `components/ui-icon/UIIcon.tsx` | 72 | 32 |
| `components/ui-icon/UIIcons.tsx` | 44 | 25 |
| `components/ui-icon/index.ts` | 14 | 5 |
| `components/ui-image/UIImage.tsx` | 68 | 40 |
| `components/ui-image/UIImages.tsx` | 33 | 19 |
| `components/ui-image/index.ts` | 14 | 5 |
| `components/ui-include/UIInclude.tsx` | 264 | 137 |
| `components/ui-include/index.ts` | 16 | 5 |
| `components/ui-input/UIInput.tsx` | 247 | 160 |
| `components/ui-input/UITextarea.tsx` | 58 | 43 |
| `components/ui-input/index.ts` | 13 | 5 |
| `components/ui-item/UIItem.tsx` | 290 | 144 |
| `components/ui-item/index.ts` | 14 | 4 |
| `components/ui-items/UIItems.tsx` | 73 | 36 |
| `components/ui-items/index.ts` | 15 | 5 |
| `components/ui-label/UILabel.tsx` | 172 | 95 |
| `components/ui-label/UILabels.tsx` | 31 | 18 |
| `components/ui-label/index.ts` | 13 | 5 |
| `components/ui-list/UIList.tsx` | 156 | 73 |
| `components/ui-list/index.ts` | 14 | 4 |
| `components/ui-loader/UILoader.tsx` | 79 | 33 |
| `components/ui-loader/index.ts` | 11 | 3 |
| `components/ui-markdown/UIMarkdown.tsx` | 491 | 289 |
| `components/ui-markdown/index.ts` | 22 | 8 |
| `components/ui-menu/UIMenu.tsx` | 336 | 182 |
| `components/ui-menu/index.ts` | 14 | 4 |
| `components/ui-message/UIMessage.tsx` | 107 | 59 |
| `components/ui-message/index.ts` | 11 | 3 |
| `components/ui-modal/UIModal.tsx` | 33 | 16 |
| `components/ui-modal/index.ts` | 24 | 10 |
| `components/ui-nag/UINag.tsx` | 268 | 149 |
| `components/ui-nag/index.ts` | 13 | 4 |
| `components/ui-panel/UIPanel.tsx` | 57 | 18 |
| `components/ui-panel/index.ts` | 13 | 3 |
| `components/ui-parts/UIActions.ts` | 16 | 6 |
| `components/ui-parts/UIAuthor.ts` | 28 | 15 |
| `components/ui-parts/UIAvatar.tsx` | 31 | 18 |
| `components/ui-parts/UIContent.ts` | 23 | 9 |
| `components/ui-parts/UIDate.ts` | 24 | 12 |
| `components/ui-parts/UIDescription.ts` | 16 | 6 |
| `components/ui-parts/UIDetail.ts` | 25 | 12 |
| `components/ui-parts/UIExtra.ts` | 17 | 6 |
| `components/ui-parts/UIHeader.tsx` | 56 | 32 |
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
| `components/ui-popup/UIPopup.tsx` | 657 | 348 |
| `components/ui-popup/index.ts` | 12 | 3 |
| `components/ui-progress/UIProgress.tsx` | 254 | 142 |
| `components/ui-progress/index.ts` | 13 | 4 |
| `components/ui-rail/UIRail.tsx` | 31 | 18 |
| `components/ui-rail/index.ts` | 11 | 3 |
| `components/ui-rating/UIRating.tsx` | 413 | 243 |
| `components/ui-rating/index.ts` | 12 | 3 |
| `components/ui-reveal/UIReveal.tsx` | 102 | 49 |
| `components/ui-reveal/index.ts` | 11 | 3 |
| `components/ui-root/UIRoot.catalog.ts` | 218 | 214 |
| `components/ui-root/UIRoot.tsx` | 555 | 288 |
| `components/ui-root/index.ts` | 30 | 10 |
| `components/ui-search/UISearch.tsx` | 776 | 517 |
| `components/ui-search/index.ts` | 13 | 4 |
| `components/ui-section/UISection.tsx` | 596 | 319 |
| `components/ui-section/UISections.tsx` | 46 | 22 |
| `components/ui-section/index.ts` | 18 | 5 |
| `components/ui-segment/UISegment.tsx` | 75 | 37 |
| `components/ui-segment/UISegments.tsx` | 34 | 20 |
| `components/ui-segment/index.ts` | 14 | 5 |
| `components/ui-select/UISelect.tsx` | 343 | 203 |
| `components/ui-select/index.ts` | 14 | 4 |
| `components/ui-shape/UIShape.tsx` | 451 | 267 |
| `components/ui-shape/UISide.tsx` | 65 | 38 |
| `components/ui-shape/index.ts` | 14 | 5 |
| `components/ui-sidebar/UIPushable.tsx` | 134 | 77 |
| `components/ui-sidebar/UIPusher.tsx` | 44 | 24 |
| `components/ui-sidebar/UISidebar.tsx` | 322 | 189 |
| `components/ui-sidebar/index.ts` | 17 | 7 |
| `components/ui-slider/UISlider.tsx` | 553 | 328 |
| `components/ui-slider/index.ts` | 13 | 4 |
| `components/ui-statistic/UIStatistic.tsx` | 80 | 44 |
| `components/ui-statistic/UIStatistics.tsx` | 57 | 30 |
| `components/ui-statistic/index.ts` | 17 | 5 |
| `components/ui-step/UIStep.tsx` | 191 | 101 |
| `components/ui-step/UISteps.tsx` | 75 | 34 |
| `components/ui-step/index.ts` | 15 | 5 |
| `components/ui-sticky/UISticky.tsx` | 182 | 87 |
| `components/ui-sticky/index.ts` | 11 | 3 |
| `components/ui-tab/UITab.tsx` | 193 | 108 |
| `components/ui-tab/UITabs.tsx` | 512 | 292 |
| `components/ui-tab/index.ts` | 16 | 5 |
| `components/ui-table/UITable.tsx` | 516 | 286 |
| `components/ui-table/index.ts` | 12 | 3 |
| `components/ui-text/UIText.tsx` | 35 | 20 |
| `components/ui-text/index.ts` | 11 | 3 |
| `components/ui-toast/UIToast.tsx` | 673 | 404 |
| `components/ui-toast/index.ts` | 19 | 7 |
| `components/ui-transition/UITransition.tsx` | 321 | 170 |
| `components/ui-transition/index.ts` | 14 | 3 |
| `components/ui-tree-diagram/UITreeDiagram.tsx` | 226 | 141 |
| `components/ui-tree-diagram/index.ts` | 24 | 14 |
| `components/ui-visibility/UIVisibility.tsx` | 191 | 115 |
| `components/ui-visibility/index.ts` | 13 | 3 |
<!-- /generated:loc-files -->

Counted by `LocCount`:  non-blank, non-comment lines as "code".
- The fork is not counted here:  693 code lines in 15 modules (vs 349 for the two originals).
- Each fix is one module + one test file (`packages/solid-element/UPSTREAM.md`).

## Element core

### Declaring attributes and properties

- **Nothing is declared per attribute.**  `ElementDefinition` walks the vocabulary, and hands the fork one prop per
  attribute, keyed by camelCase canonical name:
  `{ value, attribute, property?, reflect, converter: { fromAttribute, fromProperty, toAttribute } }`.
  - The fork's props ARE `this.attrs`:  one signal each, already converted.
  - They're typed from the `as const` vocabulary (`AttributeValues<V>`).
- **Booleans:**  `Converters.boolean` (`yes` / `no` work), on BOTH paths:  `el.primary = "yes"` stores `true`.
  - Reflection writes `""` or removes the attribute, never `"true"`.
  - Attribute writes never reflect back.
- **Values:**  localized values are canonicalized on the way in, from attributes AND property writes.
  - `button.color = "verde"` on `<ie-boton>` stores `green`, and reflects `verde`.
  - Arrays reflect comma-joined.
  - `json` kinds (`options`) observe their attribute, but never reflect.
- **Reserved names:**  the fork THROWS at definition when a prop's property would shadow an element member
  (`hidden`, `title`, `style`, its own `dispose` ...).
  - Unless it's renamed with the vocabulary's `property`.
- **Pre-upgrade properties:**  the fork's upgrade step (captured in the constructor, re-applied through the setters).
- **Platform options instead of plumbing:**  `UIComponent.define()` passes:
  - `BaseElement` (`DOMElement` / `DOMFormControl`)
  - `shadowRootInit: { mode: "open", delegatesFocus }`
  - `internals: true`, `formAssociated`, `keepAlive: true`
  - `errorBoundary`, `onError`, `fallback`
- **Names:**  no attribute, event, slot or part literal in a template.
  - Instead:  `this.part("button")`, `this.slot("icon")`, `this.emit("ui-toggle", ...)`,
    type-checked against the vocabulary.

### Templating, owner context, content parts

- JSX compiles to real DOM, with fine-grained bindings.
  - `<Show>` / `<For>`:  keyed, so filtering never recreates a row that stays visible.
  - Contract classes use Solid 2's `class={[ITEM, { [ACTIVE]: chosen }]}`.
  - `<Dynamic>` for a part's varying root tag.
  - Icon `<svg>` clones are inserted as is (`IconGlyph.draw()`).
- **`PartContext`** holds the owner as a signal, and a page-wide registry filled by `UIComponent.define()`.
  - Resolution is `OwnerContext.find()` over the flat tree, with a barrier at every registered non-part component.
  - It re-resolves on every re-connect (the fork's `onConnect`;  `keepAlive` keeps the component across moves),
    on `slotchange` in any element's shadow root, and once after first settle.
- **`PartComponent`** (in `core`) makes the 13 parts cheap:  most are a dozen lines.
- **App context reaches components:**  `UIComponent.AppContext` is read by every component.
  - On the Solid 2 host page, the app provides it around the dropdown, and the component sees the app's value.
- **Platform limit:**  no event tells an element its assigned slot changed.
  - So a foreign component re-slotting a part isn't seen until the part reconnects.

### What Solid 2 asks of component authors

The rules are in [ui's AGENTS.md](../AGENTS.md), "Solid authoring".
- **Eager memos:**  Solid 2 memos compute at creation.
  - Base-class memos that call overridables are `{ lazy: true }`.
  - Effects that call overridables are created in `onMount()`, after subclass fields exist.
- **No signal writes in owned scopes:**  the fork's hooks can run inside a Solid render,
  so `isConnected` and the fieldset `formIsDisabled` replay are deferred a microtask.
- **Writes land on a microtask:**  tests `flush()` (`ElementFixture.settle()` / `tick()`).
- **`keepAlive` has a cost:**  a removed element keeps its reactive root until `dispose()` or garbage collection.
  - Anything page-wide (overlay entries) must follow `isConnected`, not disposal.
- **Dev diagnostics** flagged the `classes()` memo (now the `rootClass` getter) as `WIDE_SCOPE_DEPS`:
  it reads every attribute.
  - The production build drops them.

## Hot module replacement

Edit a component in `yarn dev`, and every live instance updates in place.
- The same DOM elements, with their attributes and properties kept
  (the dropdown's `options` and controlled `value` included);  no page reload.
- Try it:  open `tools/demo/hmr.html`, and edit `UIButton.tsx`, `UIButton.css` or `UIButton.en.ts`.

- **How:**
  - The fork's `solidElementHot()` (`vite.config.ts`, `apply: "serve"`) appends to each component barrel:
    `import.meta.hot.accept(() => hotUpdate(import.meta.hot))`.
    - The barrels are `components/ui-<name>/index.ts`, the modules that call `define()`.
    - An edit to a component class, its vocabulary or fallback climbs to its barrel,
      which Vite re-runs with the fresh modules.
  - `define()` is idempotent per tag, so the barrel's `UIButton.define()` would return the OLD class.
    - `HotDefinitions` wraps it (in `src/elements/`;  dev only, the plugin's `setup` import).
    - A DIFFERENT class of the SAME name, defining a known tag, is a new version.
      It takes over every tag the old one had (`<ie-boton>` included), through `UIComponent.defineTag()`.
  - The fork swaps each class's component, props and options in place, and migrates each instance's values.
    Then `hotUpdate()` disposes and re-renders every live instance.
  - A changed vocabulary goes through `UI.vocabulary.replace()`:
    otherwise the registry refuses a SECOND object for a tag.
    - It also re-resolves the runtime's translated names from it.
    - Changed English texts reach `UI.i18n`, where no translation replaced them.
  - CSS:  `?inline` component sheets self-accept.
    - `HotDefinitions.updateStyle()` re-registers the sheet by name,
      and `Styles.register()` replaces its rules in every adopted shadow root.
    - Nothing re-renders.
- **Limits:**
  - Component-internal state resets:  a search query, the highlighted row, an open menu, an uncontrolled toggle.
  - Anything the platform reads once can't change:
    observed attributes, `formAssociated`, the DOM element's base class, shadow root options.
    - The page reloads, with `<ui-button>: observed attributes changed (+size), full reload`.
  - Shared code (`core`, `forms`, `UIComponent`, the runtime, `HotDefinitions`) reaches several barrels:  full reload.
    - A module reaching ONE barrel (a vocabulary, a fallback, `SlottedItems`) stays hot.
  - A class renamed in the edit, or a vocabulary whose tag changed, defines as NEW;  old instances keep the old.
- **Test:**  `yarn test:hmr` (`tools/hmr.e2e.ts`).
  - It starts the dev server, opens `tools/demo/hmr.html` in headless chromium, and edits the real files.
  - Each file is restored after each scenario,
    then checked against its original text and `git diff --quiet`.
  - 8 / 8 pass, ~4 s:
    - component code:  button;  dropdown keeping its properties
    - CSS without re-render
    - a vocabulary text
    - a throwing render:  fallback, then recovery
    - a syntax error
    - a new vocabulary attribute (full reload)
    - shared code (full reload)
- **Cost:**  dev only.
  - The plugin appends ~200 bytes to each barrel and style module.
  - The fork's HMR paths sit behind `import.meta.hot`, which a build replaces with `undefined`.

## Performance

### Method

`test/PerfRun.ts`:  a `search selection` dropdown, with 1000 options set through the `options` property.
- Opened by a click on the search input.
- Then `"united sta"` is typed one character per keystroke:  rows narrow 1000 => 30.
- Per step, timed from just before the event:
  - `update`:  until `flush()` returns
  - `+ layout`:  after a forced reflow
  - `+ frame`:  after the next animation frame
- A warm-up pass runs first, and is dropped.
- Two runs:
  - the dropdown perf test:  dev Solid, Vite dev server
  - the smoke perf page:  `dist/` + vendored production Solid (`tools/smoke/perf-adapter.js`)

### Results

<!-- generated:perf -->
| Where | Build | Open: update / + layout / + frame ms | Keystroke update min / avg / max ms | + layout | + frame |
| --- | --- | --: | --: | --: | --: |
| vitest browser mode | dev (Vite dev server) | 32.8 / 32.9 / 34.8 | 0.7 / **3.7** / 12.2 | 1.5 / **6.7** / 18.6 | 9.9 / **16.0** / 20.6 |
<!-- /generated:perf -->

- The test asserts an average update under 16 ms;  it passes with large headroom.  No windowing needed.
- The worst keystroke is the first (`u`):  all 1000 rows still match, and each gets `<mark>` highlighting.
- First open renders all 1000 rows;  it dominates.
- Headless chromium runs at 60 Hz, so `+ frame` snaps to vsync (about 16.7 ms):  compare `update` and `+ layout`.
- `tools/demo/perf.html` runs the same benchmark under `yarn dev`.
  - Set `SPELL_UI_SOLID_PROD=1` for production Solid there:
    the plugin's dev defaults, with performance tracks, are about 5x slower.

## Framework hosts

### Method

`SmokeRunner`:  `yarn build`, then ONE static server (no Vite dev server) serves `dist/`, `vendor/`, `tools/` and `test/`.
- It injects one `<script type="importmap">` into every page:
  - `solid-js`, `@solidjs/web`, `@spell-app/solid-element` => `/vendor/...`
  - `@spell-app/ui` => `/dist/index.js`
  - `@spell-app/ui/core`, `@spell-app/ui/forms`
  - `@spell-app/ui/ui-<family>` => `/dist/ui-<name>.js`
- `PeerVendor` builds the three specifiers in one build, with the peer packages deduped (ONE Solid),
  tree-shaken to the bindings `dist/` and the pages import.
- Requests to any host other than esm.sh / unpkg are blocked.
- Each host mounts ONE `<ui-dropdown>`, with `options` as a property, `value="b"` and `open`.
  It runs the round trip in `tools/frameworks/check.js` (DOM and ARIA only).

### Results

<!-- generated:smoke -->
_Not measured yet:  run `yarn smoke`._
<!-- /generated:smoke -->

### Solid 2 host

- `tools/frameworks/solid/app.tsx`:  a compiled Solid 2 app (`HostApp`), with `solid-js` / `@solidjs/web` external.
  - Bindings:  `prop:options`, `prop:value`, `prop:open`.
  - `ui-*` listeners go through a `ref` callback (Solid 2 dropped `on:`).
- The page's identity probe (`identity.js`, loaded before the app;  never in `dist/`) proves:
  - **one module instance** -- `solidIdentity` / `webIdentity`:
    the app's `createSignal` / `render` ARE the functions the components' copy exports
  - **context flows** -- `contextReachesComponent`:
    the app wraps the dropdown in `<UIComponent.AppContext value="from-the-app">`, and the component inside reads it.
    That's owner adoption across the custom-element boundary, through the fork's shadow-crossing owner lookup.
  - **signal => prop** (`hostSetsValue`) and **`ui-change` => signal** (`pickUpdatesHost`), with no glue
  - plus the app's own context, unmount, and `overlaysAfterUnmount` (the overlay entry follows `isConnected`)

### Other pages

- **`compat-solid-1.9.html`** -- a COMPATIBILITY check:
  a Solid 1.9.9 app from esm.sh, next to the page's vendored Solid 2.
  - The round trip passes.
  - A 1.9 context can't reach the Solid 2 components (`null`, as expected).
- **`translate.html`** -- `UIButton.define("ie-boton", es)` and `UIDropdown.define("ie-desplegable", es)`,
  on the built classes.
  - Classes stay canonical;  `ie-cambio` fires.
  - A localized PROPERTY value is stored canonical, and reflected localized.
- **`fallback.html`** (`tools/demo/`) -- every form control working, beside its failed copy showing its native fallback.
  - Its console errors are the 9 intentional failures.
  - It also checks that a `ui-icon` draws its SVG from `dist/icon-packs/`.

### Notes

- `options` always arrived as a property.
  - The vanilla page sets `options`, `value` and the listener BEFORE the element is defined:
    the fork's upgrade step is the backstop.
- **Controlled values:**  re-setting `el.value` in a `ui-change` handler reverts the UI (tested).
- **React caveat:**  a React handler that rejects a change leaves the element showing the new value,
  while React state keeps the old one.
  - React won't re-set a prop that hasn't changed.

## Forms & accessibility

- **Form association** is the fork's `formAssociated` option.
  - Form callbacks arrive as hooks:
    `onFormReset` => `FormComponent.onFormReset()`, `onFormDisabled` => `UIComponent.formDisabled`.
  - `DOMFormControl` is the form-control API (`form`, `validity`, `checkValidity()` ...).
- `FormComponent`:
  - `formValue()` feeds `internals.setFormValue()`;  a `string[]` becomes a `FormData`.
  - `required` runs `Validator` into `setValidity(flags, message, anchor)`, with `:state(invalid)`.
  - Reset restores the connect-time value.
  - A disabled `<fieldset>` disables the control.
- **Submit buttons:**  `<ui-button type="submit">` calls `internals.form.requestSubmit()`.
  - It sends `name=value` by setting the button's form value for the duration
    (a custom element can't be the form's `submitter`).
  - **Known gap:**  Enter in a text field doesn't find a custom element as the form's default button.
- **Keyboard:**  `delegatesFocus`, and the APG combobox pattern with real key events:
  arrows, Home / End, PageUp / PageDown, Enter, Space, Tab, Escape routed by `UI.overlays`, type-ahead,
  Backspace removing the last label.
- **ARIA:**
  - `aria-activedescendant` needs the listbox in the combobox's own shadow root,
    so rich `<ui-item>` content is PROJECTED into its row.
  - The combobox is named from `placeholder`, else `text`, else `name`.
  - The DOM element's `aria-label` is forwarded to the inner control.
- **axe** passes on every element-markup example (`components/ui-<name>/examples/elements/`, 39 files),
  and on every form control's native fallback.
  - `color-contrast` included:  text inside a `.ui.disabled` element is exempt
    (as WCAG exempts inactive components;  `test/A11y.ts`).
  - `heading-order` is off for two pages of heading demos.

## SSR / Declarative Shadow DOM

**DIY, no hydration.**  The fork has no server render yet.
- The server half:  `test/ssr.ssr.test.tsx` (node project) renders the REAL `UIButton` component
  under `@solidjs/web`'s server `renderToString`, against a stub DOM element.
  - It wraps it in `<template shadowrootmode="open" shadowrootdelegatesfocus>`,
    with the foundation CSS + `UIButton.css` inlined.
- The browser half:  `test/dsd.test.ts` parses it with `setHTMLUnsafe`, and paints a styled button before any script.
  - Then it defines the element:  the fork ADOPTS the declarative root, and empties it before its first render.

- The client render replaces the server markup.
- Inlined CSS is about 147 kB per instance, uncompressed (DSD has no shared constructable sheets).
- The `ssr` project needs its own Solid plugin instance, and `test.css` enabled.
- Anything that reads the DOM in a constructor needs an `isServer` guard.
- `yarn test` runs `ssr` first:  `dsd.test.ts` imports its output.

## Error handling & native fallback

- **Boundary:**  the fork's error boundary (on by default), around each element's render.
  - A throw stays local:  in the constructor, in render, in a memo during an update, or in an effect.
    The element stops rendering, a sibling keeps updating, and new elements still render.
  - Without it (`errorBoundary: false`), the same throw logs `[REACTIVITY_HALTED]` and the sibling freezes
    (tested, `test/isolation.test.tsx`).
- **Hook:**  `UIComponent.define()` passes the fork's `onError` and `fallback`.
  - `onError`:
    - ONE `console.error`, naming the tag
    - a cancelable, bubbling, composed `ui-error`, with `detail: { error }`
    - the fork sets `:state(errored)`
  - `fallback`:  unless `ui-error` was cancelled, a form control's `elementSetup.Fallback`
    builds its native DOM into the shadow root, a microtask later.
  - Every other element (since epic `wwod-spell-ui` P15) gets a bare `<slot>`:  its children still show.
- **What degrades** is listed per family in [the fallback doc](fallback.md).  In short:
  - the button loses `ui-toggle`, the glyph and the spinner
  - the dropdown becomes a native `<select>`:
    form value, validity, `element.value` and `ui-change` keep working
- **Tests:**  `test/fallback.cases.ts`, run by `test/fallback.test.tsx` through a `FallbackAdapter`.
  - `ElementFixture.breakRender()` makes a RENDERED element's next update throw.
  - All 8 pass, axe included.

## Translation

- `UIButton.define("ie-boton", es)` and `UIDropdown.define("ie-desplegable", es)`,
  with a 20-line dictionary (`test/dictionary.es.ts`).
  - Run by `test/translate.test.tsx`, `tools/demo/translate.html` (dev) and `tools/smoke/translate.html` (from `dist/`).
- A second `ElementDefinition` for the same component class, from the localized vocabulary.
  - Localized attribute AND property names (`primario`, `"primario" in el`), under the SAME canonical keys.
  - Classes stay canonical;  events are localized (`ie-cambio`).
  - A canonical attribute the dictionary doesn't translate still works.

## Testing

- **Suite:**  Vitest, two projects:
  - `browser`:  chromium;  `SPELL_UI_TEST_ALL=1` adds firefox and webkit
  - `ssr`:  node
  - Component tests live beside their component (`UI<Name>.test.tsx`);
    cross-family ones in `test/` (fallback, isolation, translate, SSR, DSD).
  - The class-grammar CSS tests (`UI<Name>.css.test.ts`) stay:
    they test the sheets on static markup, which the element tests don't cover.
- **Synchronization:**  `DOMElement.ready` + `flush()` (`ElementFixture.render()` / `settle()` / `tick()`).
  - No sleeps, except the type-ahead buffer.
- **Halts:**  the fork's boundary keeps one bug from hanging unrelated tests.
  - A 10 s `testTimeout` stays, as a guard.
- **Recording numbers:**  `commands.writeFile`, since browser-test console output doesn't reach the terminal.
  - The perf test writes `tools/results/perf-results.json`.

## Risks

- **RC churn:**  `solid-js` 2.0 went from rc.0 (2026-08-12) to rc.11 (2026-09-28).
  - `@solidjs/vite-plugin` published 20 `3.0.0-next` builds in the same window.
  - Exact pins are mandatory;  the fork pins its peers.
- **Owning a fork:**  `@spell-app/solid-element` (15 modules, 121 tests) is ours, until upstream takes it.
  - `UPSTREAM.md` maps each fix to a PR against `solidjs/solid` `next` `packages/element`.
  - Nothing is filed without Owen's go-ahead.
- **One Solid per page, or context stops:**  sharing works only when app and components resolve to ONE copy.
  - Linked peers need `dedupe` everywhere (Vite configs, vendor build, library measurement),
    or a second Solid sneaks in silently.
- Also see:
  - **`keepAlive` retention** (Element core)
  - **React rejected-change drift** (Framework hosts)
  - **no hydration** (SSR)
- **Runtime budget:**  the lazy runtime chunk is about 27 kB min+gz, inside the 50 kB budget.

## Foundation bugs

Open (from the spikes;  none changed by the promotion):
1. ~~**Palette contrast.**~~  Fixed ([theming](theming.md), "Contrast";  `src/styles/colors.contrast.test.ts`):
   - per-colour `--ui-<colour>-on` foregrounds, picked by WCAG contrast at generation time
   - darker red / green / blue / pink
   - `-text` capped at L 0.5
2. `components/ui-parts/UIParts.css`:  an in-feed `.date` outside a summary is a `<time>` with no `display`,
   so it stays inline (Fomantic's is a block).
3. `components/ui-segment/examples/variations.html`:  `ui top seamless attached segment` breaks the grammar order,
   so `[class*="top attached"]` never matches the static fragment.
   The element emits `seamless top attached`.
4. `components/ui-label/examples/content.html` (`aria-label` on a role-less span),
   and inputs with no accessible name in `label/examples/{content,types}.html`.
5. `heading-order`:  `parts/examples/header.html` and `segment/examples/variations.html` fail it (originals too).
6. **Tag clash:**  the parts' `in-item` owner (Fomantic's `.items > .item`) vs the dropdown's `<ui-item>`.
   The test stub is `stub-item`.
7. **Text keys are one flat namespace:**  `loading` in both `button` and `segment` vocabularies.
8. **Segment owns no parts:**  an owner of TOKENS only, and a barrier for part lookup.
9. `components/ui-button/examples/types.html`:
   the `left labeled` example's inner icon button has no accessible name (axe `button-name`).

## Appendix: history

The base library was chosen by building the same eight families twice, on Lit 3.3 and on Solid 2.0 RC,
with shared measuring tools.
- The comparison and the decision (Owen, 2026-09-30:  Solid 2) are in [Lit vs Solid](spike-lit-vs-solid.md).
- The spikes lived in `spike/` until this promotion:
  - `git checkout archive/lit-spike -- spike/lit` restores the Lit spike and its report.
  - Tag `archive/spikes` is the last commit with `spike/`:
    the Solid spike, the fork before its move to `packages/`, the shared tooling, the icon-loading experiment.
    The Solid spike's full report was `spike/solid/REPORT.md` there.

Spike-era numbers worth keeping:
- **Milestone 0** (button + dropdown, on `@solidjs/element` + `component-register`, Solid bundled into each build):
  - `ui-button` alone:  47.71 kB
  - A page with one `<ui-button>` first loaded 90.48 kB (eager icon aliases 14.68, `UIRuntime` 28.09).
  - Workarounds then:
    - a capturing registry, for base class / form association / shadow options
    - our own `convert()` / `reflect()` (bare booleans parsed false, `true` reflected `"true"`)
    - a pre-upgrade property stash
  - Reconnect re-rendered from scratch.
  - One uncaught error halted every Solid element.
- **Batch 1** (icon, label, parts, divider, segment, container):
  - a per-element error boundary (+1.42 kB)
  - the removal HACK for bare booleans
  - `safeKey()`, renaming `style` / `hidden`
  - 274 tests
- **Shared runtime + fork** (the round before promotion):
  - peers externalized;  `core` + `forms` entries
  - the fork, replacing ~120 code lines of workarounds
  - native fallbacks, HMR
  - 283 tests + 108 in the fork (121 by the promotion)
  - Element core before / after the fork:  1599 / 868 => 1592 / 845 lines / code lines.
- **Promotion** (this report):
  - `spike/solid` => `src/`, `spike/shared` => `tools/`, the fork => `packages/solid-element`
  - the identity probe moved into the host page (vendored Solid 59.9 => 30.4 kB)
  - `Vocabulary.replace()` replaced the HMR vocabulary HACK
