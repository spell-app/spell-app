// Prints `packages=<json array>` for `$GITHUB_OUTPUT`:  the package folders a change needs reviewed.
// - A package is reviewed when its own files change, OR a package it depends on does
//   (`DEPENDENTS`), since its tests run that package's source.
// - A change outside `packages/` (root configs, lockfile, this workflow) reviews everything.
// - So does a base CI can't diff against:  a new branch (`0000...`), or a commit a force push replaced.
// - Usage:  `node .github/scripts/changed-packages.mjs <base-ref>`
import { execFileSync } from "node:child_process"
import { readdirSync, readFileSync } from "node:fs"

/** Package folder => folders that import it, directly or not.  MUST follow the one-way flow in `tsconfig.base.json`. */
const DEPENDENTS = {
  util: ["ui", "parser", "core", "spell", "lsp", "app", "cli"],
  ui: ["cli"],
  parser: ["spell", "lsp", "app", "cli"],
  core: ["spell", "lsp", "app", "cli"],
  spell: ["lsp", "app", "cli"],
  lsp: ["app", "cli"],
  app: ["cli"],
  // the extension runs `lsp` and `app`'s runner, but has no checks of its own yet
  vscode: [],
  cli: []
}

/** Package folders with a `test` script:  `vscode` (its own yarn project) has none. */
const ALL = readdirSync("packages", { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && hasTests(entry.name))
  .map((entry) => entry.name)

const base = process.argv[2] ?? "HEAD~1"
const files = changedFiles(base)

const picked = new Set()
for (const file of files) {
  const match = /^packages\/([^/]+)\//.exec(file)
  if (!match) {
    ALL.forEach((name) => picked.add(name))
    break
  }
  if (ALL.includes(match[1])) picked.add(match[1])
  for (const dependent of DEPENDENTS[match[1]] ?? ALL) picked.add(dependent)
}

console.log(`packages=${JSON.stringify(ALL.filter((name) => picked.has(name)))}`)

/** Files changed since `base`, or `["<all>"]` (outside `packages/`, so everything) when `base` can't be diffed. */
function changedFiles(base) {
  try {
    return execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], { encoding: "utf8", stdio: "pipe" })
      .split("\n")
      .filter(Boolean)
  } catch {
    return ["<all>"]
  }
}

/** `packages/<name>` has a `test` script. */
function hasTests(name) {
  try {
    return Boolean(JSON.parse(readFileSync(`packages/${name}/package.json`, "utf8")).scripts?.test)
  } catch {
    return false
  }
}
