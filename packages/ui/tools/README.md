# `tools/` -- package tooling

Node-side measurement, vendoring, smoke, report, HMR, docs-site and design-export tooling for `@spell-app/ui`, plus
the pages it drives.  Run through `packages/ui`'s yarn scripts;  results land in `tools/results/` (git-ignored), and
`yarn report` turns them into the tables of `docs/report.md`.

- The CLASSES live here (PascalCase files);  a yarn script that only runs one is a few lines in `../scripts/`, named
  for the script (`yarn site:check` -> `scripts/site-check.ts` -> `SiteCheck.main()`).  A folder with its own flags
  has a `cli.ts` (`cli.ts` here, `visual/cli.ts`).
- Output goes through `Terminal` (stdout / stderr), never `console.*`;  environment variables through `environment`.

| File | What |
|---|---|
| `cli.ts` | the command line behind `yarn vendor`, `measure`, `smoke` (`declarations`, then `smoke`), `serve`, `report` (`loc`, then `report`), `icons:pack`:  its commands `vendor`, `measure`, `smoke`, `declarations`, `serve`, `loc`, `report`, `icons:pack` |
| `index.ts` | the barrel:  the measure / vendor / LOC / report / smoke / icon-pack classes and `Terminal`;  NOT the site and design tools, `StaticRenderer` / `StaticDocument`, the pages or the scripts (its header says why) |
| `Terminal.ts` | `Terminal.out()` / `err()`:  where every tool and script prints (stdout / stderr, the shape of `packages/cli`'s `CliSession`) |
| `NodePackage.ts` | finds an installed dependency's folder (`NodePackage.need("emojibase-data")`), wherever yarn hoisted it:  NEVER a hard-coded `node_modules` path |
| `package.config.ts` | `PACKAGE` (`PackageConfig`):  entries, shared entries (`core`, `forms`), externals, peer list, module => bucket;  `DIST_IMPORTS` for import maps |
| `tools.types.ts` | `PackageConfig`, result shapes (`MeasureResults`, `SmokeResults`, `LocResults`) and `kB()`, `SolidIdentityHook`, the site's two halves (`SITE_PAGES`, `SITE_BUILD`), the static pages' and the design export's shapes, the error classes `IconPackError` and `SiteCheckError` |
| `BundleMeasure.ts` | in-memory `vite build` with the repo's config, modules bucketed into library / shared entries / own per family / lazy;  the library AS USED (bindings `dist/` imports) and in full;  standalone per-family builds;  structural checks |
| `PeerVendor.ts` | one ES module per peer specifier + `importmap.json` in `vendor/`, deduped (ONE Solid), tree-shaken to the bindings `dist/` and the pages import |
| `DeclarationCheck.ts` | `yarn smoke` runs it after `vite build`:  every `exports` `types` path exists, and no `dist/**.d.ts` import is an alias (`$/util`, `$/ui`) or leaves `dist/` |
| `ForkBuild.ts` | builds `packages/solid-element` when its `dist/` is missing or stale (`vendor`, `measure`) |
| `HostApp.ts` | compiles the Solid 2 host app (`frameworks/solid/app.tsx`) with Solid external |
| `SmokeRunner.ts` + `StaticServer.ts` | (`StaticServer` is a thin wrapper over `SRV.WebServer`) serves `dist/`, `vendor/`, `tools/`, `test/` from ONE static server, injects the import map, drives each page in headless chromium |
| `LocCount.ts` | lines / code lines per file, by group |
| `ReportTables.ts` | rewrites the `generated:<name>` tables of `docs/report.md` |
| `peers.ts` | the peer specifiers `dist/` imports |
| `IconPackBuilder.ts` | `yarn icons:pack <folder> --id <id>`:  verifies a folder of SVGs (no script, no external resources) and writes its `pack.js` index, keeping hand edits;  `--sanitize` strips unsafe attributes first, `--skip-unsafe` / `--allow-unsafe` leave out / keep files that still fail;  also run by `scripts/gen-icons.ts` |
| `SiteDataBuilder.ts` | `yarn site:data` (`scripts/site-data.ts`):  `site/_data/components.json` (`SiteDataFile`) from every vocabulary and family sheet, `icons.json`, and keeps `pages.json` complete;  `SiteDataBuilder.test.ts` fails while they're stale |
| `SiteSearchBuilder.ts` | the shared `ui/_data/search.json` (`SiteSearchFile`):  every page's title and sections, read from the page files, for `<ui-docs-search>`;  through `SiteDataBuilder.searchText()` |
| `FamilyTokens.ts` | one family's public CSS tokens, read from its sheets:  its docs page's token table |
| `FoundationTokens.ts` | the foundation tokens (`--ui-font-size`, palette, radii, motion ...), grouped for the theming page's tables, read from the generated sheets |
| `VocabularyFiles.ts` | every English vocabulary of a folder of families, read from its `<tag>.vocabulary.en.ts` files in node:  what `yarn gen:root`, `yarn site:data` (`SiteDataBuilder`) and `yarn site:bundle` (the docs' component pack) read |
| `ThemeFamilies.ts` | which families each theme sheet (`src/styles/themes/*.css`) touches, read from its CSS at build time (`SiteDataFile.themes`) |
| `SiteCheck.ts` | `yarn site:check <page...> \| --all [--out <dir>]` (`scripts/site-check.ts` hands it the arguments):  the plain-HTML docs site (the shared `ui/*.html`, `ui/components/ui-<name>.html`) in headless chromium, from the page server's `/ui/` (`spell dev server ensure`):  errors and failed requests, undefined / unrendered `ui-*`, the four component tabs each loaded from its `#hash`, `ui-docs-toc`, phone overflow (with the offending elements), the nav flyout, dark;  screenshots in `tools/results/site-check/`, JSON summary on stdout, exit 1 on any problem |
| `StaticRenderer.ts` | the SSR-only Vite server (`mode: "test"`, `ssr.noExternal` Solid) the static server render (`$/ui/static`) runs on from node:  `ssrLoadModule()` compiles the controllers' JSX for the server, which `tsx` can't.  Used by `visual/StaticPages.ts` and `spell static` (`packages/cli`, `src/runner/renderStatic.ts`) |
| `StaticDocument.ts` | loaded BY that server (never by node):  `render(html, options)` turns a whole page static (every `StaticCatalog` family, the element-loading scripts removed, the stylesheet linked first in `<head>` or inline) and `stylesheet(tags)` builds and minifies (Lightning CSS) the sheet for those families;  `spell static`'s engine.  Its types (and `StaticDocumentModule`, for callers that can't type-check it) are in `tools.types.ts` |
| `DesignExport.ts` | `yarn design:build [--out <dir>]` (`scripts/design-build.ts`, also `spell dev design build`):  the claude.ai Design System's files in `<dir>/project/` (default `build/design-system/`, git-ignored) -- brand book README, `tokens.json`, `components/index.d.ts`, a README + `preview.html` per family, the cover, `design-system.json`;  keeps `components/bundle.js` / `bundle.css` (the design bundle's).  `DesignTokens` resolves the `spell-brand` theme's `:root` tokens per scheme (colour maths in `DesignColor`);  `DesignComponents` writes the cards from `site/_data/components.json` and the element examples;  `DesignBrand` adds the brand's `<ui-brand-*>` cards (a "Brand" group), reading `packages/brand/_data/components.json` and the shared `brand/components/*.html` examples as data:  `ui` imports nothing of `brand` |
| `DesignTokens.ts`, `DesignColor.ts`, `DesignComponents.ts`, `DesignBrand.ts` | `DesignExport`'s parts (above) |
| `ElementManifests.ts` | `custom-elements.json` (Custom Elements Manifest 2.1) and `html-custom-data.json` (VS Code `html.customData`, loaded by the repo's `.vscode/settings.json`), written by `yarn site:data` into `site/_data/` from the same data |
| `environment.ts` | `environment`:  EVERY environment variable `tools/`, `scripts/` and the configs read, parsed once (`SPELL_UI_TEST_ALL`, `SPELL_UI_SOLID_PROD`, `SPELL_UI_FA_PACKAGE_DIR`, `CI`, `INIT_CWD`, and `yarn test:visual`'s `SPELL_UI_VISUAL_*`, `VisualVariables`);  nowhere else reads `process.env` |
| `DevServer.ts` | the package's Vite dev server started from node (`test:visual`, `test:hmr`, `screenshots`):  preferred port or the next free one, and its REAL `origin` |
| `hmr.e2e.ts` | `yarn test:hmr`:  dev server + headless chromium + real file edits, 8 scenarios (`node:test`:  run as a plain script) |
| `screenshots.ts` | `yarn screenshots [families]`:  one PNG per example pair of `demo/index.html`, for a quick look (no baselines;  regression tests are `visual/`) |
| `*.test.ts` | `DesignExport`, `IconPackBuilder`, `SiteDataBuilder` (fails while `site/_data/` is stale), `SiteSearchBuilder`:  in the `ssr` project |
| `results/` | what the tools write (git-ignored):  `measure-results.json`, `perf-results.json`, `site-check/`, `visual/` |
| `frameworks/` | host pages `vanilla` / `react` (esm.sh) / `vue` (unpkg) / `solid` (Solid 2 app + `identity.js` probe), the shared round trip `check.js`, `perf.html` |
| `smoke/` | extra import-map pages:  `compat-solid-1.9.html`, `translate.html`, `perf-adapter.js` |
| `visual/` | `yarn test:visual`:  Playwright `toHaveScreenshot` of every `examples/elements/*.html`, light + dark, per browser, on the host (`--os local`) or Linux browsers in Playwright's Docker image (`--os linux`);  see [`docs/visual-testing.md`](../docs/visual-testing.md).  `cli.ts` (flags) => `VisualRunner` (dev server, one Playwright run per OS, pruning) + `DockerBrowserServer` (Docker checks / start, the browser server container);  `playwright.config.ts`, `visual.spec.ts` (tests generated by `VisualExamples`), `fixture.html` / `Fixture.ts` (the page:  one example, settled), `ParityReport` (`--parity` / `--static` reports);  `--static`:  `StaticFamilies` (families compared, the classes to define), `StaticPages` (Vite plugin serving `/static/...` through an SSR-only Vite server, `StaticRenderer`), `StaticFixture` (loaded by that server:  renders one example, builds the stylesheet);  `VisualSettings` (viewport, time, tolerances, paths);  `visual.types.ts` (types, `VisualError` / `FlagError`, `VisualMarkups`) |
| `demo/` | `yarn dev` pages:  every example side by side (`index.html`), `perf`, `translate`, `hmr`;  `fallback.html` is also a smoke page;  `FamilySheets` puts every family sheet on the page (also the visual fixture's) |

Order:  `yarn build`, `yarn vendor`, `yarn measure`, `yarn test` (writes `perf-results.json`), `yarn smoke`,
`yarn report`.

## Notes

- **Imports:**  these are node scripts run by `tsx`:  relative imports with `.ts` extensions (`../vite.config.ts`
  for `COMPONENTS` / `SHARED_ENTRIES` / `SOLID_EXTERNAL`), never the `$` aliases, except another package's
  (`$/server`).  Page scripts Vite serves or SSR-loads (`demo/*.ts`, `visual/fixture.ts`, `visual/StaticFixture.ts`)
  import `ui` through `$/ui/...`, as `src/` does (`packages/ui/AGENTS.md` "Imports").  Browser-side helpers they
  serve (`test/PerfRun.ts`, `test/dictionary.es.ts`) are transpiled on the fly by `StaticServer` and may import
  types only.
- **Pages:**  a smoke page imports `@spell-app/ui...` and the peers by specifier, and publishes
  `window.smokeResult = { ok, label, checks }`.  `kind: "compat"` is reported as COMPATIBILITY.  A page module
  that imports a peer binding itself must be listed in `PeerVendor`'s `usedBy` (`cli.ts`), or the vendored
  file lacks it ("does not provide an export named ...").
- **The identity probe** (`frameworks/solid/identity.js`) is the ONLY place that proves the host app and the
  components share one Solid;  it binds `createSignal` / `render` and never `import * as` a package, so the
  vendored Solid stays tree-shaken.
- **Buckets:**  any module `package.config.ts` can't place is `other` and fails the `unattributed` check;  a
  `shared:<name>` module outside `<name>.js` fails `coreOutsideCore`.
