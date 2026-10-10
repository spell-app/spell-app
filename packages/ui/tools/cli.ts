/// <reference types="node" />

/**
 * The package tooling's command line:  `tsx tools/cli.ts <command>` (the root `yarn vendor`, `yarn measure` ...).
 * - `vendor` -- `PeerVendor`:  one ES module per peer specifier (`solid-js`, `@solidjs/web`)
 *   in `vendor/` + `vendor/importmap.json`, tree-shaken to what `dist/` and the smoke pages import
 * - `measure` -- `BundleMeasure`:
 *   `tools/results/measure-results.json` (library / core / forms / own per family / scenarios / checks)
 * - `smoke` -- `SmokeRunner`:  `dist/` + `vendor/` through an import map, the framework host pages (the Solid 2 app
 *   on the SAME vendored Solid as the components) + the extra pages, headless chromium;
 *   `tools/results/smoke-results.json`
 * - `declarations` -- `DeclarationCheck`:  `dist/**.d.ts` resolve for a consumer (no `$/` alias, nothing outside `dist/`)
 * - `serve` -- the same pages and import map for a person:  prints the URLs, runs until killed
 * - `loc` / `report` -- `LocCount` (`loc-results.json`),
 *   then `ReportTables` rewrites `docs/report.md`'s generated tables
 * - `icons:pack <folder> --id <id> [--label <text>] [--license <text>] [--sanitize]
 *   [--skip-unsafe | --allow-unsafe] [--force]` -- `IconPackBuilder`:
 *   verify a folder of SVGs and write its `pack.js` (keeps hand edits of an existing one)
 *   - `--sanitize`:  first strip unsafe attributes from the SVGs, rewriting those files
 *   - `--skip-unsafe`:  leave files that still fail out of the index, instead of refusing the pack
 *   - `--allow-unsafe`:  index unsafe files anyway (a broken one still refuses the pack)
 * - `smoke` expects a fresh `vite build` and `yarn vendor`;  `measure` builds in memory.
 * - Output goes to stdout / stderr through `Terminal`;  a failed check sets exit code 1, bad arguments exit 1.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { parseArgs } from "node:util"

import {
  BundleMeasure,
  DeclarationCheck,
  HostApp,
  IconPackBuilder,
  IconPackError,
  LocCount,
  PeerVendor,
  ReportTables,
  SmokeRunner,
  Terminal,
  type IconPackUnsafePolicy,
  type ImportMap
} from "./index.ts"
import { DIST_IMPORTS, PACKAGE } from "./package.config.ts"

// Above the dispatch:  it runs as the module loads

/** Every command, for the usage line. */
const COMMANDS = ["vendor", "measure", "smoke", "declarations", "serve", "loc", "report", "icons:pack"]

/** `icons:pack`'s arguments, for its usage line. */
const ICONS_PACK_USAGE =
  "icons:pack <folder> --id <id> [--label <text>] [--license <text>] [--sanitize] [--skip-unsafe | --allow-unsafe] " +
  "[--force]"

const [command, ...args] = process.argv.slice(2)
switch (command) {
  case "vendor":
    await HostApp.ensure()
    await new PeerVendor({
      root: PACKAGE.root,
      peerEntry: PACKAGE.peerEntry,
      // `dist/`, and every page module that imports a peer itself:  the host app, the identity probe,
      // `perf-adapter.js`, the inline scripts of the extra pages (`flush`)
      usedBy: ["dist", "tools/frameworks", "tools/smoke", "tools/demo/fallback.html"]
    }).build()
    break
  case "measure":
    await new BundleMeasure(PACKAGE).write()
    break
  case "smoke":
    if (!(await runner().run()).pages.every((page) => page.ok)) process.exitCode = 1
    break
  case "declarations": {
    const problems = new DeclarationCheck(PACKAGE.root).problems()
    for (const problem of problems) Terminal.err(problem)
    Terminal.out(problems.length ? `declarations:  ${problems.length} problem(s)` : "declarations:  ok")
    if (problems.length) process.exitCode = 1
    break
  }
  case "serve":
    await runner().serve()
    break
  case "loc":
    loc()
    break
  case "report":
    loc()
    new ReportTables({ root: PACKAGE.root }).write()
    break
  case "icons:pack":
    await iconPack(args)
    break
  default:
    Terminal.err(`usage:  tsx tools/cli.ts ${COMMANDS.join(" | ")}`)
    process.exit(1)
}

/** Host pages + the extra pages, against `dist/` and the vendored Solid. */
function runner() {
  const vendorMap = join(PACKAGE.root, "vendor", "importmap.json")
  if (!existsSync(vendorMap)) throw new Error("cli runner():  no vendor/importmap.json;  run `yarn vendor` first")
  const vendored = JSON.parse(readFileSync(vendorMap, "utf8")) as ImportMap
  return new SmokeRunner({
    name: PACKAGE.name,
    root: PACKAGE.root,
    results: PACKAGE.results,
    importMap: { imports: { ...vendored.imports, ...DIST_IMPORTS } },
    perfAdapter: "tools/smoke/perf-adapter.js",
    pages: [
      { path: "tools/smoke/compat-solid-1.9.html", kind: "compat" },
      { path: "tools/smoke/translate.html", kind: "check" },
      { path: "tools/demo/fallback.html", kind: "check" }
    ]
  })
}

/** Lines / code lines of the element core, components, foundation, tests and tooling. */
function loc() {
  const results = new LocCount({
    name: PACKAGE.name,
    root: PACKAGE.root,
    groups: {
      "element core": ["src/elements/*.{ts,tsx}", "src/core.ts", "src/forms.ts", "!src/elements/*.test.{ts,tsx}"],
      components: [
        "src/components/*/UI*.{ts,tsx}",
        "src/components/*/index.ts",
        "src/components/ui-dropdown/SlottedItems.ts",
        "!src/components/**/*.test.{ts,tsx}",
        // a family's other files are named for its component too (`UIButton.en.ts`):  counted below
        "!src/components/*/*.{[a-z][a-z],fallback,types}.ts"
      ],
      "vocabularies & fallbacks": ["src/components/*/*.[a-z][a-z].ts", "src/components/*/*.fallback.ts"],
      foundation: [
        "src/{util,vocabulary,runtime,styles,icons}/*.ts",
        "src/components/*.ts",
        "src/index.ts",
        "!src/**/*.test.ts"
      ],
      tests: ["src/**/*.test.{ts,tsx}", "test/**/*.{ts,tsx}"],
      tooling: ["tools/**/*.{ts,tsx,js,html}", "vite.config.ts", "vitest.config.ts"]
    }
  }).count()
  const folder = join(PACKAGE.root, PACKAGE.results)
  mkdirSync(folder, { recursive: true })
  writeFileSync(join(folder, "loc-results.json"), `${JSON.stringify(results, null, 2)}\n`)
}

/** `icons:pack`:  verify a folder of SVGs and write its `pack.js`;  prints what changed, or every problem. */
async function iconPack(argv: string[]) {
  const { positionals, values } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      id: { type: "string" },
      label: { type: "string" },
      license: { type: "string" },
      sanitize: { type: "boolean" },
      "skip-unsafe": { type: "boolean" },
      "allow-unsafe": { type: "boolean" },
      force: { type: "boolean" }
    }
  })
  const [folder] = positionals
  if (!folder || !values.id || (values["skip-unsafe"] && values["allow-unsafe"])) {
    Terminal.err(`usage:  tsx tools/cli.ts ${ICONS_PACK_USAGE}`)
    process.exit(1)
  }
  const unsafe: IconPackUnsafePolicy = values["skip-unsafe"] ? "skip" : values["allow-unsafe"] ? "allow" : "refuse"
  try {
    const report = await new IconPackBuilder({
      folder: resolve(folder),
      id: values.id,
      label: values.label,
      license: values.license,
      sanitize: values.sanitize,
      unsafe,
      force: values.force
    }).build()
    const lines = [`${report.index}:  ${report.count} icons`]
    if (report.added.length) lines.push(`  added:  ${report.added.join(", ")}`)
    if (report.dropped.length) lines.push(`  dropped:  ${report.dropped.join(", ")}`)
    if (report.unreachable.length) lines.push(`  no name of their own:  ${report.unreachable.join(", ")}`)
    for (const { file, reason } of report.sanitized) lines.push(`  sanitized ${file}:  ${reason}`)
    for (const { file, reason } of report.skipped) lines.push(`  skipped ${file}:  ${reason}`)
    for (const { file, reason } of report.allowed) lines.push(`  UNSAFE, indexed anyway:  ${file}:  ${reason}`)
    Terminal.out(lines.join("\n"))
  } catch (error) {
    if (!(error instanceof IconPackError)) throw error
    Terminal.err(error.message)
    process.exitCode = 1
  }
}
