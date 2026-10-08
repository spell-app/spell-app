import { AS } from "$/assembler"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError, EXIT, type BundlesOptions } from "$/cli/cli.types"
import { findCheckout } from "$/cli/findCheckout"

/**
 * `spell dev bundles <verb> [<name>...]`:  the bundles the page server serves, BUILT on demand instead of committed
 * (`AS.BUNDLES`:  `ui-site`, Spell UI's docs site;  `brand`, the brand pages).  The logic:  `$/assembler` `Bundle`.
 * - `build [<name>...] [--stale]`:  build them (no name:  all);  `--stale`:  only those whose sources changed since
 *   their last build.  What the page server runs when it starts.
 * - `check [<name>...]`:  exits 1 when one is stale, and says why
 * - `--json`:  the report as JSON;  a build's own output goes to stderr
 * - Runs on the lean `spell dev` entry:  no spell.  In the nearest checkout (`findCheckout()`).
 * - Throws `CliError` for a missing or unknown verb or name.
 */
export async function bundlesCommand(args: string[], options: BundlesOptions = {}): Promise<number> {
  const [verb, ...names] = args
  const root = findCheckout("tsconfig.base.json")
  const bundles = bundlesFor(root, names)
  if (verb === "build") {
    const report: { built: AS.BundleBuilt[]; current: string[]; failed: string[] } = {
      built: [],
      current: [],
      failed: []
    }
    for (const bundle of bundles) {
      if (options.stale && !bundle.isStale) {
        report.current.push(bundle.name)
        continue
      }
      if (!options.json) process.stderr.write(`building ${bundle.name} (${bundle.spec.title}) ...\n`)
      try {
        report.built.push(bundle.build())
      } catch (error) {
        process.stderr.write(`${(error as Error).message}\n`)
        report.failed.push(bundle.name)
      }
    }
    if (options.json) write(JSON.stringify(report, null, 2))
    else {
      for (const built of report.built)
        write(`built ${built.name} in ${built.seconds.toFixed(1)}s  (sources ${built.sources})`)
      for (const name of report.current) write(`${name}:  current`)
      for (const name of report.failed) write(`${name}:  FAILED`)
    }
    return report.failed.length ? EXIT.ERRORS : EXIT.OK
  }
  if (verb === "check") {
    const checks = bundles.map((bundle) => bundle.check())
    const stale = checks.filter((check) => check.stale)
    if (options.json) write(JSON.stringify(checks, null, 2))
    else {
      for (const check of checks) write(`${check.name}:  ${check.stale ? `STALE (${check.stale})` : "current"}`)
      if (stale.length) write(`fix:  spell dev bundles build ${stale.map((check) => check.name).join(" ")}`)
    }
    return stale.length ? EXIT.ERRORS : EXIT.OK
  }
  const what = verb === undefined ? "which bundles command?" : `unknown verb '${verb}':`
  throw new CliError(`${what}  ${BUNDLES_VERBS.join(", ")}`)
}

/** `spell dev bundles`' verbs. */
export const BUNDLES_VERBS = ["build", "check"]

/** The bundles `names` names (none:  every one);  an unknown name is a `CliError`. */
function bundlesFor(root: string, names: string[]): AS.Bundle[] {
  try {
    return AS.Bundle.all(root, names)
  } catch (error) {
    throw new CliError((error as Error).message.replace(/^Bundle\.all\(\):\s+/, ""))
  }
}

/** Print `text` on stdout. */
function write(text: string) {
  process.stdout.write(`${text}\n`)
}
