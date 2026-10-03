/**
 * Types shared by the package tooling (`tools/`):  the package config, and the measurement / smoke / LOC result
 * shapes.
 * - Runtime-light:  `import type` only.
 * - Every `tools/results/*-results.json` has one of these shapes;  `ReportTables` reads them.
 * - The perf shapes (`PerfRecord` ...) live beside the benchmark, in `test/PerfRun.ts` (it runs in the browser).
 */

import type { PerfResult } from "../test/PerfRun.ts"

////////////////
// ## Package config
////////////////

/**
 * How the tooling reads the package:  entries, externals, peer set, buckets (`tools/package.config.ts`).
 * - Paths are absolute, or relative to `root`.
 */
export type PackageConfig = {
  /** display name in reports, e.g. `@spell-app/ui` */
  name: string
  /** repo root, absolute */
  root: string
  /** Vite config file, relative to `root`;  default `vite.config.ts` */
  configFile?: string
  /** family name => entry file, e.g. `{ "ui-button": "src/components/ui-button/index.ts" }` */
  entries: Record<string, string>
  /**
   * Shared entries, in load order, e.g. `[{ name: "core", entry: "src/core.ts" }, { name: "forms", entry: ... }]`.
   * - Each is built as `<name>.js`;  the FIRST is the one every family imports (its "core").
   * - A family's scenarios add only the shared entries its chunk actually imports (statically).
   */
  shared: SharedEntry[]
  /**
   * Entries built WITH the rest but not sized as families or shared tiers, e.g. `{ api: "src/api.ts" }`.
   * - Why:  an entry changes how Rolldown splits the others (`api` makes `core.js` export `__exportAll`), so the
   *   measured `core.js` matches `dist/`'s only when every such entry is in the build.
   * - Their modules belong in `extra:<name>` buckets (`groups`);  each is sized under `MeasureResults.extra`.
   */
  extra?: Record<string, string>
  /** true for module ids the library build leaves EXTERNAL (Solid and the fork, subpaths included) */
  external: (id: string) => boolean
  /**
   * A module re-exporting every peer specifier `dist/` imports, one `export * as <name> from "<spec>"` line each.
   * - `PeerVendor` builds one file per specifier from it;  `BundleMeasure` bundles it once IN FULL as
   *   `libraryFull` (`library` is only the bindings `dist/` imports).
   */
  peerEntry: string
  /** bucket of a module id */
  groups: (moduleId: string) => Bucket
  /** family that "a page with one button" loads;  default `ui-button` */
  pageFamily?: string
  /** where the `*-results.json` files go, relative to `root` */
  results: string
}

/** One shared lib entry (`PackageConfig.shared`). */
export type SharedEntry = {
  /** output name, e.g. `core` => `core.js`;  also its bucket (`shared:<name>`, or `core`) */
  name: string
  /** source file, relative to `root` */
  entry: string
  /** what it holds, for the report's tier table, e.g. `form base, validation, menu options` */
  description?: string
}

/** Which kind of an own family module it is;  `fallback` ~== its native fallback (`ui-<name>.fallback.ts`). */
export type OwnKind = "classes" | "css" | "vocabulary" | "fallback"

/**
 * Bucket a module's bytes are counted in.
 * - `library` -- Solid and the fork (should never appear:  they're external;  a check flags it)
 * - `core` -- element core + foundation JS, the `core.js` chunk;  ~== `shared:core`
 * - `shared:<name>` -- a module of shared entry `<name>` (`shared:forms` => `forms.js`)
 * - `runtime` / `icons` -- the lazy `UIRuntime` chunk and the icon name / alias maps
 * - `data` -- a family's lazily imported data files (`components/ui-<family>/data/`, e.g. the emoji chunks)
 * - `own:<family>:<kind>` -- one family's classes, sheet, vocabulary or fallback
 * - `extra:<name>` -- a module only `PackageConfig.extra` entry `<name>` holds (`extra:api` => `api.js`)
 * - `other` -- unattributed;  reported by a check so nothing is silently dropped
 */
export type Bucket =
  | "library"
  | "core"
  | `shared:${string}`
  | "runtime"
  | "icons"
  | "data"
  | "other"
  | `own:${string}:${OwnKind}`
  | `extra:${string}`

////////////////
// ## Measurement results (`measure-results.json`)
////////////////

/**
 * Size of some code, in BYTES.
 * - `min` -- esbuild `transform({ minify: true })`
 * - `gzip` -- gzip level 9 of `min`
 */
export type Size = { min: number; gzip: number }

/** One family's own cost, split by kind. */
export type OwnSize = Size & { classes: Size; css: Size; vocabulary: Size; fallback: Size; modules: string[] }

/** One shared entry's cost. */
export type SharedSize = Size & { entry: string; description?: string }

/** What one family loads besides its own code. */
export type FamilyNeeds = {
  /** shared entries its chunk imports (statically, directly or through another chunk), in load order */
  shared: string[]
  /** a page with ONLY this family:  library + `shared` + own, min+gz bytes */
  page: number
}

/** A named sum of tiers, e.g. "page with one button". */
export type Scenario = {
  /** what it adds up, e.g. `["library", "core", "own:button"]` */
  parts: string[]
  /** Σ `gzip` of the parts, each gzipped on its own (a page fetches them as separate files) */
  gzip: number
}

/** One emitted chunk. */
export type ChunkSize = Size & {
  file: string
  /** only reachable through dynamic `import()` */
  lazy: boolean
  /** static imports:  sibling chunks and external specifiers */
  imports: string[]
}

/** Everything `BundleMeasure` writes. */
export type MeasureResults = {
  package: string
  date: string
  units: string
  /** installed versions of the peer packages and the measuring toolchain */
  versions: Record<string, string>
  /**
   * The peer set AS USED:  exactly the bindings `dist/` imports from each specifier (`bindings`), bundled once and
   * tree-shaken -- what an app bundler (or `yarn vendor`) ships.  The scenarios add this one.
   * - `bindings`:  specifier => imported names, `"*"` for a namespace import.
   */
  library: Size & { specifiers: string[]; bindings: Record<string, string[]> }
  /** The FULL peer set, every export of every specifier (untree-shaken). */
  libraryFull: Size
  /** every shared entry, by name, in load order */
  shared: Record<string, SharedSize>
  own: Record<string, OwnSize>
  /** per family:  which shared entries it imports */
  families: Record<string, FamilyNeeds>
  scenarios: Record<ScenarioName, Scenario>
  /**
   * Each family built ALONE with the library bundled and tree-shaken (eager chunks, each min+gz, summed), plus
   * `all families` in one such build:  what an app that bundles everything itself would ship, for comparison.
   */
  standalone: Record<string, Size>
  /** lazy tiers;  `data` is missing from results files older than the `data` bucket */
  lazy: { runtime: Size; icons: Size; data?: Size }
  /** each `PackageConfig.extra` entry's own code (`extra:<name>` buckets), e.g. `api` */
  extra: Record<string, Size>
  chunks: ChunkSize[]
  checks: MeasureChecks
}

/** Scenario keys, in report order. */
export type ScenarioName = "page with one button" | "all families" | "app already ships the library"

/** Structural checks of `dist/`:  each is `[]` when healthy. */
export type MeasureChecks = {
  /** family entries that DON'T statically import the first shared entry's chunk (`core.js`) */
  entriesMissingCore: string[]
  /**
   * Chunks holding Rolldown's runtime module (`\0rolldown/runtime.js`:  `__name`, `__exportAll` ...) that aren't the
   * first shared entry's:  a `rolldown-runtime-<hash>.js` every chunk using a helper imports, one more request per page
   */
  runtimeChunks: string[]
  /** shared-entry module ids found outside that entry's own chunk (e.g. hoisted into a common chunk) */
  coreOutsideCore: string[]
  /** `library`-bucket module ids found anywhere in the build (should be external) */
  libraryBundled: string[]
  /** `runtime` / `icons` / `data` module ids found in an eager chunk */
  lazyInEager: string[]
  /** `other`-bucket module ids */
  unattributed: string[]
  /** external specifiers `dist/` imports that `peerEntry` doesn't list (an import map would miss them) */
  peersMissing: string[]
  /**
   * Chunks whose CSS had `light-dark()` lowered into `--lightningcss-light` variables:  those are fixed where a token
   * is declared (`:root`), so `.ui-dark` / `<ui-root theme="dark">` change nothing (`build.cssTarget`, `vite.config.ts`)
   */
  lightDarkLowered: string[]
}

////////////////
// ## Smoke results (`smoke-results.json`)
////////////////

/** What each smoke page leaves in `window.smokeResult`. */
export type PageResult = {
  ok: boolean
  /** e.g. `react 19.2.0` */
  label: string
  /** named checks;  `true` / values, `false` for a failed one */
  checks: Record<string, unknown>
  /** perf pages only */
  perf?: PerfResult
}

/** One page, as the runner saw it. */
export type SmokePage = PageResult & {
  /** served path, e.g. `/tools/frameworks/react.html` */
  path: string
  title: string
  /** `host` (a framework page), `compat` (a COMPATIBILITY check), `check` (extra page), `perf` */
  kind: SmokePageKind
  errors: string[]
  warnings: string[]
}

/** How a smoke page is reported. */
export type SmokePageKind = "host" | "compat" | "check" | "perf"

/** `smoke-results.json`. */
export type SmokeResults = {
  package: string
  date: string
  browser: string
  pages: SmokePage[]
}

/** An `<script type="importmap">` body. */
export type ImportMap = { imports: Record<string, string> }

////////////////
// ## Solid host app
////////////////

/**
 * What the Solid 2 host page (`frameworks/solid.html`) hands its app, so the app can prove it and the components
 * share one runtime:  `globalThis.__uiSolidIdentity`, set by the page's own module (`frameworks/solid/identity.js`)
 * BEFORE the app mounts.  Never set by shipped code.
 * - Bindings rather than `import * as` namespaces:  a namespace import keeps every export of a package alive, so
 *   the vendored Solid couldn't shrink to the bindings in use.  One module instance ~== the same function objects.
 */
export type SolidIdentityHook = {
  /** a `solid-js` export as the components' copy resolves it (`createSignal`) */
  solidJs: { createSignal: unknown }
  /** a `@solidjs/web` export, same (`render`) */
  web?: { render: unknown }
  /** a context (`createContext()`) the components read;  the app provides a value around the dropdown */
  context?: unknown
  /** what `context` resolved to inside `element` (read in its render and stored) */
  read?: (element: Element) => unknown
}

////////////////
// ## LOC (`loc-results.json`)
////////////////

/** One counted file. */
export type LocFile = {
  /** relative to the root */
  path: string
  group: string
  /** every line */
  lines: number
  /** non-blank, non-comment lines */
  code: number
}

/** `LocCount.count()` result. */
export type LocResults = {
  package: string
  files: LocFile[]
  groups: Record<string, { files: number; lines: number; code: number }>
}

////////////////
// ## Icon packs (`IconPackBuilder`)
////////////////

/** One reason a pack failed verification:  which SVG, and why. */
export type IconPackProblem = {
  /** SVG path relative to the pack folder */
  file: string
  /** e.g. `<script> element`, `external href "https://…"` */
  reason: string
}

/** What one `IconPackBuilder.build()` did. */
export type IconPackReport = {
  /** absolute path of the written `pack.js` */
  index: string
  /** icons in the index */
  count: number
  /** keys new since the previous `pack.js` (every key on a first run) */
  added: string[]
  /** keys the previous `pack.js` had whose SVG is gone */
  dropped: string[]
  /** keys with no name of their own:  file name taken by another entry, and no `alias` */
  unreachable: string[]
  /** attributes `sanitize` removed, per file (`reason` says which);  empty without `sanitize` */
  sanitized: IconPackProblem[]
  /** files left out of the index (`unsafe: "skip"`), with why */
  skipped: IconPackProblem[]
  /** unsafe files indexed anyway (`unsafe: "allow"`), with why */
  allowed: IconPackProblem[]
}

////////////////
// ## Static pages (`StaticDocument`, `spell static`)
////////////////

/** How `StaticDocument.render()` treats one page's stylesheet. */
export type StaticDocumentOptions = {
  /**
   * Link the stylesheet at this URL, relative to the page (`page.static.css`).
   * - Left out:  the page's stylesheet goes INLINE, in a `<style>`.
   */
  href?: string
  /**
   * One stylesheet for several pages, built once they've all rendered (`StaticDocument.stylesheet()`):  no `css` in
   * the result, and what pages adopt adds up from page to page.
   * - MUST come with `href`.
   */
  shared?: boolean
  /** Minify the stylesheet (`StaticDocument.minify()`);  default `true`. */
  minify?: boolean
  /**
   * The page's file (absolute):  its LOCAL linked stylesheets are read from beside it and rewritten for the static
   * output (`StaticDocument.inlineLinkedSheets()`).  Left out:  links stay as they are.
   */
  input?: string
  /** Where the page is written (absolute):  `url()`s in an inlined sheet are made relative to it;  default `input`. */
  output?: string
}

/** One page `StaticDocument.render()` turned static. */
export type StaticDocumentResult = {
  /** the whole document */
  html: string
  /** its own stylesheet, as linked or inlined;  none when `shared` */
  css?: StaticStylesheetResult
  /** `ui-*` tags rendered, e.g. `ui-card` */
  tags: string[]
  /** `ui-*` tags left as they were, with how many:  no family for them in `StaticCatalog` (`ui-code`) */
  unrendered: Record<string, number>
  /** each element-loading `<script>` / `<link rel="modulepreload">` removed:  its `src` / `href`, or `inline` */
  dropped: string[]
  /** each local linked stylesheet rewritten and inlined (`StaticDocument.inlineLinkedSheets()`):  its `href` */
  inlined: string[]
}

/**
 * What `server.ssrLoadModule(StaticRenderer.DOCUMENT)` resolves to:  `StaticDocument`'s API.
 * - Why a type of its own:  `packages/cli` can't type-check `StaticDocument.ts` itself, which reaches every family's
 *   Solid JSX.
 */
export type StaticDocumentModule = {
  StaticDocument: {
    render(html: string, options?: StaticDocumentOptions): Promise<StaticDocumentResult>
    stylesheet(tags: Iterable<string>, minify?: boolean, coverage?: StaticCoverage): StaticStylesheetResult
  }
}

/** A static stylesheet, as `StaticDocument.stylesheet()` built it. */
export type StaticStylesheetResult = {
  /** the CSS, minified unless asked not to */
  text: string
  /** its size before minifying, in bytes */
  fullSize: number
  /** why minifying fell back to stripping comments and blank lines, if it did */
  minifyFallback?: string
  /** what it covers:  every tag it styles and what they adopt -- for the next run to build on */
  coverage: StaticCoverage
}

/**
 * What a shared stylesheet covers, so a later run that renders only SOME of its pages still builds one that styles
 * them all (`spell static` keeps it in the sheet's first line).
 */
export type StaticCoverage = {
  /** every tag the sheet styles, e.g. `ui-card` */
  tags: string[]
  /** sheet name => nouns seen adopting it (`StaticRender.sheetUsage.users`) */
  users: Record<string, string[]>
  /** adoption orders seen (`StaticRender.sheetUsage.orders`) */
  orders: string[][]
}
