/**
 * `convert.ts` -- converts plan docs to `<epic-*>` markup, and proves each lost nothing (`ConvertRun`, `Converter`);
 * a doc already converted takes the second pass, to P14's elements (`Upgrader`).  `spell dev plan-doc convert` runs
 * the same;  or run it from the checkout's root:
 *
 *   yarn tsx --tsconfig packages/epics/tsconfig.json packages/epics/src/convert/convert.ts <name> | --all
 *     [--dry-run] [--out <folder>] [--verbose]
 *
 * - reads the checkout's `epics/` (the shared docs);  writes ONLY under `--out`, each doc that converted cleanly
 *   (`<folder>/<name>/<name>.plan.html` + `parts/`).  No `--out` (or `--dry-run`):  converts and reports, writes
 *   nothing.
 * - exits 1 when any doc fails:  can't convert, invalid markup, or a proof that isn't clean
 * - Node only:  a script, not in any barrel.
 */
import { ConvertRun } from "./ConvertRun"

const USAGE = "usage:  convert.ts <name> ... | --all  [--dry-run] [--out <folder>] [--verbose]"

const args = process.argv.slice(2)
const flag = (name: string) => args.includes(name)
const outIndex = args.indexOf("--out")
const out = outIndex >= 0 ? args[outIndex + 1] : undefined
const names = args.filter((arg, index) => !arg.startsWith("--") && (outIndex < 0 || index !== outIndex + 1))
const run = new ConvertRun()

if ((outIndex >= 0 && !out) || (!flag("--all") && !names.length)) {
  console.error(USAGE)
  process.exit(2)
}

const results = await run.run({ names: flag("--all") ? run.names : names, out: flag("--dry-run") ? undefined : out })
for (const line of ConvertRun.report(results, { verbose: flag("--verbose") })) console.log(line)
const failed = results.filter(({ conversion }) => !conversion?.proof.clean || conversion.problems.length)
console.log(
  `\n${results.length - failed.length} of ${results.length} docs converted cleanly${out && !flag("--dry-run") ? ` into ${out}` : " (dry run:  nothing written)"}`
)
process.exit(failed.length ? 1 : 0)
