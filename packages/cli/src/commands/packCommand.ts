// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError, EXIT, type PackOptions } from "$/cli/cli.types"
import type { PackScaffoldReport } from "$/cli/dev/dev.types"
import { buildPack, checkPack, packNames } from "$/cli/dev/packBuild"
import { newElement, newPack } from "$/cli/dev/packNew"
import { findCheckout } from "$/cli/findCheckout"

/**
 * `spell dev pack <verb> ...`:  component packs (epic `epic-components`) -- another package's custom elements, which
 * a page loads on demand through `<ui-root>`.  The logic:  `src/dev/packNew.ts`, `src/dev/packBuild.ts`.
 * - `new <name> [--prefix x-]`:  `packages/<name>/` from the templates (missing files only), wired into the checkout,
 *   then built
 * - `element <pack> <tag>`:  one element family, `components/<tag>/`, then the pack rebuilt
 * - `build <pack>`:  `pack/`:  the catalog from the vocabularies, the entry, the classic script
 * - `check [<pack>]`:  exits 1 when a pack's `pack/` is stale;  no pack:  every pack in the checkout
 * - `--no-build` (`new`, `element`):  write the files only;  `--json`:  the report as JSON
 * - Runs on the lean `spell dev` entry:  no spell.  In the nearest checkout (`findCheckout()`).
 * - Throws `CliError` for a missing or unknown verb or name.
 */
export async function packCommand(args: string[], options: PackOptions = {}): Promise<number> {
  const [verb, ...names] = args
  const root = findCheckout("tsconfig.base.json")
  if (verb === "new" || verb === "element") {
    const wanted = verb === "new" ? 1 : 2
    if (names.length !== wanted) throw new CliError(`pack ${verb}:  ${verb === "new" ? "<name>" : "<pack> <tag>"}`)
    const build = options.build !== false
    const report =
      verb === "new"
        ? await newPack(root, names[0]!, { prefix: options.prefix, build })
        : await newElement(root, names[0]!, names[1]!, { build })
    write(options.json ? JSON.stringify(report, null, 2) : scaffoldLines(report, verb === "new").join("\n"))
    return EXIT.OK
  }
  if (verb === "build") {
    if (names.length !== 1) throw new CliError("pack build:  <pack>")
    const report = await buildPack(root, names[0]!)
    write(
      options.json
        ? JSON.stringify(report, null, 2)
        : [`built ${report.pack}:  ${report.tags.length} tags, sources ${report.hash}`, ...report.files].join("\n  ")
    )
    return EXIT.OK
  }
  if (verb === "check") {
    const packs = names.length ? names : packNames(root)
    const reports = []
    for (const name of packs) reports.push(await checkPack(root, name))
    const stale = reports.filter((report) => report.stale.length)
    if (options.json) write(JSON.stringify(reports, null, 2))
    else if (!packs.length) write("no component packs in this checkout")
    else {
      for (const report of reports) {
        const state = report.stale.length ? "STALE" : "current"
        write([`${report.pack}:  ${state}`, ...report.stale].join("\n  "))
      }
      if (stale.length) write(`fix:  ${stale.map((report) => `spell dev pack build ${report.pack}`).join(";  ")}`)
    }
    return stale.length ? EXIT.ERRORS : EXIT.OK
  }
  const what = verb === undefined ? "which pack command?" : `unknown verb '${verb}':`
  throw new CliError(`${what}  ${PACK_VERBS.join(", ")}`)
}

/** `spell dev pack`'s verbs. */
export const PACK_VERBS = ["new", "element", "build", "check"]

/** `report` as lines:  what was created, updated, skipped and built;  then what to do next, after `new`. */
function scaffoldLines(report: PackScaffoldReport, isNew: boolean): string[] {
  const lines = [
    ...report.created.map((file) => `created  ${file}`),
    ...report.updated.map((file) => `updated  ${file}`),
    ...report.skipped.map((file) => `skipped  ${file}`)
  ]
  if (report.built) lines.push(`built    ${report.built.files.join(", ")}  (sources ${report.built.hash})`)
  else lines.push(`not built:  \`spell dev pack build ${report.pack}\``)
  if (isNew && report.updated.some((line) => line.startsWith("package.json "))) {
    lines.push(`next:  \`yarn install\` (a new workspace), then \`spell dev pack element ${report.pack} <tag>\``)
  }
  return lines
}

/** Print `text` on stdout. */
function write(text: string) {
  process.stdout.write(`${text}\n`)
}
