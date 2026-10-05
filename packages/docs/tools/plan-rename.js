/**
 * ONE-OFF (2026-10-04, epic `review-review` P4):  rename every plan doc `epics/<n>/<n>.html` to `<n>.plan.html`,
 * and rewrite every link to one.  Kept as the record of how it was done, and for a worktree that merges `main`
 * with plan docs of its own under the old name:  run it again there (idempotent).
 * Usage (from `packages/docs`):  node scripts/plan-rename.js [--dry-run]
 * - renames with `git mv`, so history follows (`git log --follow`)
 * - a doc counts as a plan doc when its body says so (`<body class="... plan-doc">`, `pages.js` `planDocIn()`)
 * - links rewritten, in the repo's tracked `.html`, `.md` and docs `.json` files (not the bundle, not fixtures):
 *   - `epics/<n>/<n>.html` anywhere (absolute, `../epics/...`, with `#d3`, in prose), and the generic
 *     `epics/<name>/<name>.html` the rules and skills name
 *   - inside the epic's own folder:  `"<n>.html` (a page beside it);  in its `details/`:  `"../<n>.html`
 * - prints what it renamed and each file it rewrote;  then run `spell dev docs index`, and oxfmt the changed pages
 */
import { spawnSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative, sep } from "node:path"

import { DOCS, ROOT, planDocIn } from "./pages.js"

/** Tracked files never rewritten:  generated bundles, test fixtures, the knowledge graph's cache. */
const SKIP = [/^packages\/docs\/_assets\//, /\/fixtures\//, /^graphify-out\//, /\/node_modules\//, /\.answer\.json$/]

const dryRun = process.argv.includes("--dry-run")
const epics = join(DOCS, "epics")

////////////////
// ## Rename
////////////////

const names = []
for (const name of readdirSync(epics).sort()) {
  const found = planDocIn(join(epics, name), name)
  if (!found) continue
  names.push(name)
  if (found.endsWith(".plan.html")) continue
  const to = join(epics, name, `${name}.plan.html`)
  console.log(`rename  ${relative(ROOT, found)} -> ${relative(ROOT, to)}`)
  if (!dryRun) run("git", ["mv", found, to])
}

////////////////
// ## Links
////////////////

const files = run("git", ["ls-files", "-z", "--", "*.html", "*.md", "packages/docs/**/*.json"], ROOT)
  .split("\0")
  .filter(Boolean)
  .filter((file) => !SKIP.some((pattern) => pattern.test(file)))
  .map((file) => join(ROOT, file))
  // a file `git mv` just renamed is listed under its new name only once committed
  .map((file) => (existsSync(file) ? file : file.replace(/\.html$/, ".plan.html")))
  .filter((file) => existsSync(file))
let changed = 0
for (const file of files) {
  const before = readFileSync(file, "utf8")
  const after = rewrite(before, file)
  if (after === before) continue
  changed++
  console.log(`links   ${relative(ROOT, file)}`)
  if (!dryRun) writeFileSync(file, after)
}
console.log(`${names.length} plan docs, ${changed} files with links rewritten${dryRun ? " (dry run)" : ""}`)

/**
 * `text` (file `file`) with every link to a plan doc under its new name.
 * - `epics/<n>/<n>.html` -> `epics/<n>/<n>.plan.html`, for every epic `n`, and the generic `<name>` form (also
 *   HTML-escaped, `&lt;name&gt;`)
 * - a page in `epics/<n>/`:  `"<n>.html` / `'<n>.html` / `(<n>.html`;  in `epics/<n>/details/`:  the same after `../`
 */
function rewrite(text, file) {
  let out = text
  for (const name of names) {
    out = out.replace(new RegExp(`(epics/${escape(name)}/)${escape(name)}\\.html\\b`, "g"), `$1${name}.plan.html`)
  }
  for (const placeholder of ["<name>", "&lt;name&gt;"]) {
    const p = escape(placeholder)
    out = out.replace(new RegExp(`(epics/${p}/)${p}\\.html\\b`, "g"), `$1${placeholder}.plan.html`)
  }
  const inside = relative(epics, dirname(file)).split(sep)
  const name = inside[0]
  if (inside[0] === ".." || !names.includes(name)) return out
  const up = inside.length === 2 && inside[1] === "details" ? "\\.\\./" : inside.length === 1 ? "(?:\\./)?" : null
  if (!up) return out
  return out.replace(
    new RegExp(`(["'(\`])(${up})${escape(name)}\\.html(?=[#?"')\`])`, "g"),
    (_whole, quote, prefix) => `${quote}${prefix}${name}.plan.html`
  )
}

/** `value` with RegExp syntax escaped. */
function escape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** `command args` in `cwd` (default `DOCS`);  its stdout;  exits on failure. */
function run(command, args, cwd = DOCS) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
  if (result.status !== 0) {
    process.stderr.write(result.stderr ?? "")
    process.exit(1)
  }
  return result.stdout
}
