import { spawn, spawnSync } from "child_process"
import { existsSync, lstatSync, mkdtempSync, realpathSync, rmSync, symlinkSync, unlinkSync } from "fs"
import { tmpdir } from "os"
import { dirname, resolve } from "path"
import { fileURLToPath, pathToFileURL } from "url"

import { CLI } from "$/cli"
import environment from "$/spaces/server/node/environment"

/** Our own `src/` folder. */
const CLI_SRC_DIR = resolve(fileURLToPath(import.meta.url), "..", "..")
/** The child process that times one run -- see its header. */
const RUNNER = resolve(CLI_SRC_DIR, "runner", "speedTest.mts")
/** spell's `src/` in a checkout of spell-lang, the repo whose parser is timed (epic `repo-split` P8). */
const SPELL_SRC_IN_CHECKOUT = "spell/src"
/** The run-time alias hook:  the runner's spell resolves its `$/parser` ... by ITS checkout's own table. */
const ALIASES = import.meta.resolve("spell-kit/toolchain/aliases")

/** A run whose average is this much over the others' median is a fluke, e.g. the machine was busy. */
const FLUKE_RATIO = 1.25

/**
 * `spell speed [module]`:  time the parser's rule tests, `SP.spellParser.speedTest()` -- warm-up, then 20 runs --
 * in `--runs` fresh processes (default 3), and print the combined times as a table.
 * - `module`:  only that module's rules, e.g. `if`.
 * - `--against <ref>`, e.g. `HEAD`:  time that commit too, as "Previous", in a temp git worktree
 *   -- see `checkoutOf()`.
 *   The two sides take turns, run by run, so a busy moment hits both alike.
 * - Combining a side's runs -- see `combined()`:  the mean of their averages, the lowest min, the highest max;
 *   with 3 or more runs, one fluke (an average 25% over the median) is dropped.
 * - `--json`:  each side's combined results instead.
 * - Returns the exit code:  `EXIT.ERRORS` if a run crashed.
 */
export async function speedCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.SpeedOptions
): Promise<number> {
  const [module = ""] = args
  const runs = options.runs ?? 3
  if (!Number.isInteger(runs) || runs < 1) throw new CLI.CliError(`--runs must be a whole number, 1 or more`)

  const status = new CLI.StatusReporter(session.isInteractive)
  const current: Side = { label: "Current", spellSrc: environment.srcDir }
  const sides = [current]
  let checkout: string | undefined
  try {
    if (options.against) {
      const row = status.start(`Checking out ${options.against}`)
      checkout = checkoutOf(options.against)
      status.done(row, "ok", session.relative(checkout))
      sides.unshift({ label: "Previous", spellSrc: resolve(checkout, SPELL_SRC_IN_CHECKOUT) })
    }
    for (let run = 1; run <= runs; run++) {
      for (const side of sides) {
        const row = status.start(`${side.label}  run ${run} of ${runs}`)
        const result = await timeOnce(side, module)
        ;(side.results ??= []).push(result)
        status.done(row, "ok", `average ${Math.round(result.average)}`)
      }
    }
  } catch (error) {
    status.done(status.rows.at(-1)!, "failed", error instanceof Error ? error.message : String(error))
    return CLI.EXIT.ERRORS
  } finally {
    status.finish()
    if (checkout) removeCheckout(checkout)
  }

  const totals = sides.map((side) => ({ label: side.label, ...combined(side.results!) }))
  if (options.json) {
    session.out(JSON.stringify(Object.fromEntries(totals.map(({ label, ...rest }) => [label, rest])), null, 2))
  } else {
    session.out(speedTable(totals))
    session.out(totals.map((it) => `${it.label}:  ${it.pass} passed, ${it.fail} failed`).join(";  "))
  }
  return CLI.EXIT.OK
}

////////////////
// ## Timing
////////////////

/**
 * One side of the comparison.
 * - `spellSrc`:  the spell `src/` folder `speedTest.mts` times:  ours (spell-lang's, `spell-lang/spell`), or the
 *   temp checkout's
 * - `results`:  each run's, so far
 */
type Side = {
  label: "Current" | "Previous"
  spellSrc: string
  results?: RunResult[]
}

/** What one run of `speedTest.mts` prints:  `P.SpeedTestResults`, with `failed` as a count. */
type RunResult = {
  pass: number
  fail: number
  failed: number
  initialTime: number
  average: number
  min: number
  max: number
}

/** A side's runs, combined -- see `combined()`.  `average` is NOT rounded. */
type SideTotal = Omit<RunResult, "failed" | "initialTime"> & { label: string; runs: number; dropped: number }

/** Run `side`'s `speedTest.mts` once, for `module`, in a fresh node process.  Rejects if it fails. */
function timeOnce(side: Side, module: string): Promise<RunResult> {
  const spell = `${pathToFileURL(side.spellSrc).href}/`
  const args = [
    "--import",
    import.meta.resolve("tsx/esm"),
    "--import",
    ALIASES,
    RUNNER,
    spell,
    ...(module ? [module] : [])
  ]
  // spell's own settings for `tsx` (its decorators, its JSX), from that side's checkout
  const env = { ...process.env, TSX_TSCONFIG_PATH: resolve(side.spellSrc, "..", "tsconfig.json") }
  return new Promise((done, fail) => {
    const child = spawn(process.execPath, args, { stdio: ["ignore", "pipe", "pipe"], env })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (data) => (stdout += data))
    child.stderr.on("data", (data) => (stderr += data))
    child.on("error", fail)
    child.on("exit", (code) => {
      const last = stdout.trim().split("\n").at(-1) ?? ""
      if (code === 0 && last.startsWith("{")) return done(JSON.parse(last) as RunResult)
      const why = stderr.trim().split("\n").slice(-3).join("\n") || `exit code ${code}`
      fail(new Error(`${side.label} side failed:  ${why}`))
    })
  })
}

/**
 * `runs` combined:  the mean of their averages, the lowest min, the highest max.
 * - With 3 or more runs, ONE fluke is dropped first:
 *   the slowest, if its average is over `FLUKE_RATIO` times the median.
 */
export function combined(runs: RunResult[]): Omit<SideTotal, "label"> {
  let kept = runs
  if (runs.length >= 3) {
    const sorted = [...runs].sort((a, b) => a.average - b.average)
    const median = sorted[Math.floor(sorted.length / 2)]!.average
    const slowest = sorted.at(-1)!
    if (slowest.average > median * FLUKE_RATIO) kept = runs.filter((it) => it !== slowest)
  }
  const { pass, fail } = kept.at(-1)!
  return {
    pass,
    fail,
    average: kept.reduce((total, it) => total + it.average, 0) / kept.length,
    min: Math.min(...kept.map((it) => it.min)),
    max: Math.max(...kept.map((it) => it.max)),
    runs: runs.length,
    dropped: runs.length - kept.length
  }
}

/**
 * Markdown table of `totals` -- with a "Change" row when there are two, `(current - previous) / previous` as a
 * whole %, the averages' from their unrounded values.
 * - Owen's format:  bold row headers, no units, value columns right-aligned and all as wide as "Average".
 */
export function speedTable(totals: Pick<SideTotal, "label" | "average" | "min" | "max">[]): string {
  const headers = ["Average", "&nbsp;&nbsp;&nbsp;Min", "&nbsp;&nbsp;&nbsp;Max"]
  const rows = totals.map((it) => [`**${it.label}**`, ...[it.average, it.min, it.max].map((n) => `${Math.round(n)}`)])
  const [previous, current] = totals
  if (previous && current) {
    const change = (now: number, was: number) => {
      const percent = Math.round(((now - was) / was) * 100)
      return `${percent > 0 ? "+" : ""}${percent}%`
    }
    rows.push([
      "**Change**",
      change(current.average, previous.average),
      change(current.min, previous.min),
      change(current.max, previous.max)
    ])
  }
  const labelWidth = Math.max(...rows.map((row) => row[0]!.length))
  const line = (cells: string[]) =>
    `| ${cells[0]!.padEnd(labelWidth)} | ${cells
      .slice(1)
      .map((cell, index) => cell.padStart(headers[index]!.length))
      .join(" | ")} |`
  return [
    line(["", ...headers]),
    `|${"-".repeat(labelWidth + 2)}|${headers.map((it) => `${"-".repeat(it.length + 1)}:`).join("|")}|`,
    ...rows.map(line)
  ].join("\n")
}

////////////////
// ## The other checkout
////////////////

/**
 * A temp git worktree of spell-lang (the repo of our `spell-lang/spell`) at `ref`, ready to time:  the top repo's
 * `node_modules` linked in (epic `repo-split` P7:  one install for every repo), so its packages from the OTHER repos
 * (`spell-kit/util`) are ours, its own (`$/parser` ...) its own.
 * - A `ref` with different dependencies may not run.
 * - `removeCheckout()` when done.
 */
function checkoutOf(ref: string): string {
  const repo = spellLangRepo()
  const folder = realpathSync(mkdtempSync(resolve(tmpdir(), "spell-speed-")))
  try {
    git(["worktree", "add", "--detach", folder, ref], repo)
    symlinkSync(installedModules(), resolve(folder, "node_modules"))
    if (!existsSync(resolve(folder, SPELL_SRC_IN_CHECKOUT))) {
      throw new CLI.CliError(`${ref} has no ${SPELL_SRC_IN_CHECKOUT}:  it's from before spell-lang was its own repo`)
    }
  } catch (error) {
    removeCheckout(folder)
    throw error
  }
  return folder
}

/** spell-lang's checkout:  the git repo our spell's source is in. */
function spellLangRepo(): string {
  return git(["rev-parse", "--show-toplevel"], environment.srcDir)
}

/** The `node_modules` our spell is installed from:  the nearest one above spell's source (the top repo's). */
function installedModules(): string {
  for (let dir = environment.srcDir; ; dir = dirname(dir)) {
    if (existsSync(resolve(dir, "node_modules", "spell-lang"))) return resolve(dir, "node_modules")
    if (dirname(dir) === dir) throw new CLI.CliError(`no node_modules above ${environment.srcDir}`)
  }
}

/**
 * Remove the worktree `checkoutOf()` made.
 * - Unlinks our `node_modules` FIRST, so nothing deleting the folder can reach through them.
 */
function removeCheckout(folder: string): void {
  const modules = resolve(folder, "node_modules")
  if (lstatSync(modules, { throwIfNoEntry: false })?.isSymbolicLink()) unlinkSync(modules)
  const repo = spellLangRepo()
  spawnSync("git", ["worktree", "remove", "--force", folder], { cwd: repo })
  rmSync(folder, { recursive: true, force: true })
  spawnSync("git", ["worktree", "prune"], { cwd: repo })
}

/** Run `git ...args` in `cwd`, returning its output -- or throwing `CLI.CliError` with what it said. */
function git(args: string[], cwd: string): string {
  const { status, stdout, stderr } = spawnSync("git", args, { cwd, encoding: "utf8" })
  if (status !== 0) throw new CLI.CliError(`git ${args[0]} failed:  ${stderr.trim()}`)
  return stdout.trim()
}
