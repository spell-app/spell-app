# `tools/` -- package tooling

Node-side measurement, vendoring, smoke, report and HMR tooling for `@spell-app/ui`, plus the pages it drives.  Run
from the repo root through the root scripts;  results land in `tools/results/` (git-ignored), and `yarn report`
turns them into the tables of `docs/report.md`.

| File | What |
|---|---|
| `cli.ts` | the command line behind `yarn vendor`, `measure`, `smoke`, `serve`, `report` |
| `package.config.ts` | `PACKAGE` (`PackageConfig`):  entries, shared entries (`core`, `forms`), externals, peer list, module => bucket;  `DIST_IMPORTS` for import maps |
| `tools.types.ts` | `PackageConfig`, result shapes (`MeasureResults`, `SmokeResults`, `LocResults`), `SolidIdentityHook` |
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
| `SiteCheck.ts` | `yarn site:check <page...> \| --all [--out <dir>]`:  the plain-HTML docs site (`site/*.html`, `site/components/ui-<name>.html`) in headless chromium, from the page server's `/ui/` (`spell dev server ensure`):  errors and failed requests, undefined / unrendered `ui-*`, the four component tabs each loaded from its `#hash`, `ui-docs-toc`, phone overflow (with the offending elements), the nav flyout, dark;  screenshots in `tools/results/site-check/`, JSON summary on stdout, exit 1 on any problem |
| `StaticRenderer.ts` | the SSR-only Vite server (`mode: "test"`, `ssr.noExternal` Solid) the static server render (`$/ui/server`) runs on from node:  `ssrLoadModule()` compiles the controllers' JSX for the server, which `tsx` can't.  Used by `visual/StaticPages.ts` and `spell static` (`packages/cli`, `src/runner/renderStatic.ts`) |
| `StaticDocument.ts` | loaded BY that server (never by node):  `render(html, options)` turns a whole page static (every `StaticCatalog` family, the element-loading scripts removed, the stylesheet linked first in `<head>` or inline) and `stylesheet(tags)` builds and minifies (Lightning CSS) the sheet for those families;  `spell static`'s engine.  Its types (and `StaticDocumentModule`, for callers that can't type-check it) are in `tools.types.ts` |
| `DesignExport.ts` | `yarn design:build [--out <dir>]` (`scripts/design-build.ts`, also `spell dev design build`):  the claude.ai Design System's files in `<dir>/project/` (default `build/design-system/`, git-ignored) -- brand book README, `tokens.json`, `components/index.d.ts`, a README + `preview.html` per family, the cover, `design-system.json`;  keeps `components/bundle.js` / `bundle.css` (the design bundle's).  `DesignTokens` resolves the Spell theme's `:root` tokens per scheme (colour maths in `DesignColor`);  `DesignComponents` writes the cards from `site/_data/components.json` and the element examples |
| `ElementManifests.ts` | `custom-elements.json` (Custom Elements Manifest 2.1) and `html-custom-data.json` (VS Code `html.customData`, loaded by the repo's `.vscode/settings.json`), written by `yarn site:data` into `site/_data/` from the same data |
| `hmr.e2e.ts` | `yarn test:hmr`:  dev server + headless chromium + real file edits, 8 scenarios |
| `screenshots.ts` | `yarn screenshots`:  one PNG per example pair of `demo/index.html`, for a quick look (no baselines;  regression tests are `visual/`) |
| `frameworks/` | host pages `vanilla` / `react` (esm.sh) / `vue` (unpkg) / `solid` (Solid 2 app + `identity.js` probe), the shared round trip `check.js`, `perf.html` |
| `smoke/` | extra import-map pages:  `compat-solid-1.9.html`, `translate.html`, `perf-adapter.js` |
| `visual/` | `yarn test:visual`:  Playwright `toHaveScreenshot` of every `examples/elements/*.html`, light + dark, per browser, on the host (`--os local`) or Linux browsers in Playwright's Docker image (`--os linux`);  see [`docs/visual-testing.md`](../docs/visual-testing.md).  `cli.ts` (flags) => `VisualRunner` (dev server, one Playwright run per OS, pruning) + `DockerBrowserServer` (Docker checks / start, the browser server container);  `playwright.config.ts`, `visual.spec.ts` (tests generated by `VisualExamples`), `fixture.html` / `fixture.ts` (the page:  one example, settled), `ParityReport` (`--parity` / `--static` reports);  `--static`:  `StaticFamilies` (families compared, the classes to define), `StaticPages` (Vite plugin serving `/static/...` through an SSR-only Vite server, `StaticRenderer`), `StaticFixture` (loaded by that server:  renders one example, builds the stylesheet);  `VisualSettings` (viewport, time, tolerances, paths) |
| `demo/` | `yarn dev` pages:  every example side by side (`index.html`), `perf`, `translate`, `hmr`;  `fallback.html` is also a smoke page |

Order:  `yarn build`, `yarn vendor`, `yarn measure`, `yarn test` (writes `perf-results.json`), `yarn smoke`,
`yarn report`.

## Notes

- **Imports:**  these are node scripts run by `tsx`:  relative imports with `.ts` extensions (`../vite.config.ts`
  for `COMPONENTS` / `SHARED_ENTRIES` / `SOLID_EXTERNAL`), never the `$` aliases.  Browser-side helpers they
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
