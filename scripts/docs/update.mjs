/**
 * `yarn docs:update`:  re-create every `docs/**\/<name>.spell.html` from its hand-written `<name>.html`, rendered
 * with the LATEST @spell/ui (its working tree), then check each in a real browser.
 * Usage:  node scripts/docs/update.mjs [--skip-ui-build] [--no-check]
 * - `--skip-ui-build`:  reuse `../ui/dist` instead of rebuilding UI (the bundle is still rebuilt)
 * - `--no-check`:  skip the browser checks (`check-spell.mjs`)
 * - Steps, stopping at the first that fails:
 *   1. `bundle-spell-ui.mjs` -- builds UI, bundles `docs/_assets/spell-ui.js`
 *   2. finds the sources:  `docs/**\/*.html` except `*.spell.html`, `docs/_template.html`, `docs/_assets/**`
 *   3. `doc-links.py --check` on the sources -- a broken link in a source would be copied into its output
 *   4. `to-spell.mjs` -- writes each `<name>.spell.html`
 *   5. `check-spell.mjs` on each output, screenshots in a temp folder -- checks every doc, THEN fails if any did
 */
import { spawnSync } from "node:child_process"
import { mkdtempSync, readdirSync, statSync } from "node:fs"
import { tmpdir } from "node:os"
import { basename, dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const DOCS = join(REPO, "docs")
const args = process.argv.slice(2)
const skipUiBuild = args.includes("--skip-ui-build")
const check = !args.includes("--no-check")
const unknown = args.filter((arg) => arg !== "--skip-ui-build" && arg !== "--no-check")
if (unknown.length) {
  console.error(`unknown argument(s):  ${unknown.join(" ")}\nusage:  yarn docs:update [--skip-ui-build] [--no-check]`)
  process.exit(2)
}

step("bundle @spell/ui", "node", ["scripts/docs/bundle-spell-ui.mjs", ...(skipUiBuild ? ["--skip-ui-build"] : [])])

const sources = findSources(DOCS).map((path) => relative(REPO, path))
if (!sources.length) fail("find sources", "no source docs under docs/")
console.log(`\n== sources:  ${sources.join(", ")}`)

step("check source links", "python3", ["scripts/doc-links.py", "--check", ...sources])
step("convert", "node", ["scripts/docs/to-spell.mjs", ...sources])

const outputs = sources.map((source) => source.replace(/\.html$/, ".spell.html"))
const missing = outputs.filter((output) => !exists(join(REPO, output)))
if (missing.length) fail("convert", `to-spell.mjs didn't write:  ${missing.join(", ")}`)

const results = []
if (check) {
  const shots = mkdtempSync(join(tmpdir(), "spell-docs-"))
  for (const output of outputs) {
    const outDir = join(shots, basename(output, ".spell.html"))
    const run = step(`check ${output}`, "node", ["scripts/docs/check-spell.mjs", output, outDir], {
      capture: true,
      mayFail: true
    })
    results.push({ output, ...parseSummary(run.stdout), screenshots: outDir, passed: run.status === 0 })
  }
}

console.log("\n== docs:update summary")
const bundle = join(DOCS, "_assets/spell-ui.js")
if (exists(bundle)) console.log(`  ${relative(REPO, bundle)}  ${kb(bundle)}`)
for (const output of outputs) {
  const result = results.find((r) => r.output === output)
  const verdict = !result
    ? "not checked"
    : result.passed
      ? "checks passed"
      : `${result.problems?.length ?? "?"} problem(s)`
  console.log(`  ${output}  ${kb(join(REPO, output))}  ${verdict}`)
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
    cwd: REPO,
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

/** Every source doc under `dir`:  `.html`, not `.spell.html`, not `_template.html`, nothing under `_assets/`. */
function findSources(dir) {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (path !== join(DOCS, "_assets")) found.push(...findSources(path))
    } else if (entry.name.endsWith(".html") && !entry.name.endsWith(".spell.html")) {
      if (path !== join(DOCS, "_template.html")) found.push(path)
    }
  }
  return found
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
