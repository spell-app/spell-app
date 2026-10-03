/**
 * `yarn docs:update`:  rebuild the @spell-app/ui bundle from the LATEST UI, then check every `**\/<name>.html`
 * page in a real browser.  Pages are hand-authored:  nothing here writes them.
 * Usage (from `packages/docs`):  node scripts/update.js [--skip-ui-build] [--no-check]
 * - `--skip-ui-build`:  reuse `../ui/dist` instead of rebuilding UI (the bundle is still rebuilt)
 * - `--no-check`:  skip the browser checks (`check-spell.js`)
 * - Steps, stopping at the first that fails:
 *   1. `bundle-spell-ui.js` -- builds UI, bundles `_assets/spell-ui.js`
 *   2. `index.js` -- rewrites the docs index's lists
 *   3. finds the pages (`pages.js` `findPages()`)
 *   4. `doc-links.js --check` on the pages
 *   5. `check-spell.js` on each page, screenshots in a temp folder -- checks every page, THEN fails if any did
 */
import { spawnSync } from "node:child_process"
import { mkdtempSync, statSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, relative } from "node:path"

import { DOCS, findPages } from "./pages.js"

const args = process.argv.slice(2)
const skipUiBuild = args.includes("--skip-ui-build")
const check = !args.includes("--no-check")
const unknown = args.filter((arg) => arg !== "--skip-ui-build" && arg !== "--no-check")
if (unknown.length) {
  console.error(`unknown argument(s):  ${unknown.join(" ")}\nusage:  yarn docs:update [--skip-ui-build] [--no-check]`)
  process.exit(2)
}

step("bundle @spell-app/ui", "node", ["scripts/bundle-spell-ui.js", ...(skipUiBuild ? ["--skip-ui-build"] : [])])

step("index", "node", ["scripts/index.js"])

const pages = findPages().map((path) => relative(DOCS, path))
if (!pages.length) fail("find pages", "no .html pages")
console.log(`\n== pages:  ${pages.join(", ")}`)

step("check links", "node", ["scripts/doc-links.js", "--check", ...pages])

const results = []
if (check) {
  const shots = mkdtempSync(join(tmpdir(), "spell-docs-"))
  for (const output of pages) {
    const outDir = join(shots, output.replace(/\.html$/, "").replaceAll("/", "--"))
    const run = step(`check ${output}`, "node", ["scripts/check-spell.js", output, outDir], {
      capture: true,
      mayFail: true
    })
    results.push({ output, ...parseSummary(run.stdout), screenshots: outDir, passed: run.status === 0 })
  }
}

console.log("\n== docs:update summary")
const bundle = join(DOCS, "_assets/spell-ui.js")
if (exists(bundle)) console.log(`  ${relative(DOCS, bundle)}  ${kb(bundle)}`)
for (const output of pages) {
  const result = results.find((r) => r.output === output)
  const verdict = !result
    ? "not checked"
    : result.passed
      ? "checks passed"
      : `${result.problems?.length ?? "?"} problem(s)`
  console.log(`  ${output}  ${kb(join(DOCS, output))}  ${verdict}`)
  for (const problem of result?.problems ?? []) console.log(`    - ${problem}`)
  if (result) console.log(`    screenshots:  ${result.screenshots}`)
}
const failed = results.filter((result) => !result.passed)
if (failed.length) fail("check", `${failed.map((result) => result.output).join(", ")} failed its checks`)

/**
 * Run `command args` from the repo root;  on a non-zero exit print why and stop the whole update.
 * - `capture`:  pipe stdout (still echoed) so the caller can read it, e.g. check-spell's JSON summary
 * - `mayFail`:  return a failed run instead of stopping, so every doc gets checked before the update fails
 */
function step(name, command, commandArgs, { capture = false, mayFail = false } = {}) {
  console.log(`\n== ${name}:  ${command} ${commandArgs.join(" ")}`)
  const run = spawnSync(command, commandArgs, {
    cwd: DOCS,
    encoding: "utf8",
    stdio: capture ? ["inherit", "pipe", "inherit"] : "inherit"
  })
  if (capture && run.stdout) process.stdout.write(run.stdout)
  if (run.error) fail(name, String(run.error))
  if (run.status !== 0 && !mayFail) fail(name, `exited with ${run.status ?? run.signal}`)
  return run
}

/** Print which step failed and exit 1, so `yarn` reports the failure. */
function fail(name, why) {
  console.error(`\n== docs:update FAILED at "${name}":  ${why}`)
  process.exit(1)
}

/** check-spell's JSON summary:  the last `{` at the start of a line to the end of its stdout. */
function parseSummary(stdout) {
  const start = stdout.lastIndexOf("\n{") + 1
  try {
    return JSON.parse(stdout.slice(start))
  } catch {
    return {}
  }
}

/** Whether `path` exists. */
function exists(path) {
  try {
    statSync(path)
    return true
  } catch {
    return false
  }
}

/** Size of `path` in KB, e.g. `123.4 KB`. */
function kb(path) {
  return `${(statSync(path).size / 1024).toFixed(1)} KB`
}
