#!/usr/bin/env node
/**
 * Repo-wide rename of the import aliases and the npm scope.  Discovers packages and files, so it can be re-run on a
 * newer `main`.  Nothing is committed.
 *
 * ## Run
 * - `node scripts/rename-aliases.mjs --dry-run`  -- print what would change, write nothing
 * - `node scripts/rename-aliases.mjs`            -- do it, then `yarn install` (lockfile) and `yarn format`
 *   - `--no-install` / `--no-format` skip those
 * - Idempotent:  a second run changes nothing.  Step 1 is gated on `tsconfig.base.json` still having ui's `$/*`
 *   alias (once it is `$/ui/*`, `$/util` means the PACKAGE and must not be rewritten again).
 * - Undo:  `git reset --hard` (from a tree that was clean before the run).
 *
 * ## Steps
 * 0. Folders (gated on `packages/spell-app` existing):  `packages/spell-app` => `packages/app`, `packages/spell-core`
 *    => `packages/core` (with `git mv`);  `packages/spell-util/src` => `packages/util/src/spell/`, merged INTO `util`
 *    (manifests, tsconfig, vitest projects, barrel, lint config;  the rest of `spell-util` is deleted).  Aliases
 *    `#spell-app` => `#app`, `#spell-core` => `#core`, `#spell-util[/x]` => `#util[/spell/x]`;  npm names
 *    `@spell/spell-app` => `@spell-app/app`, `@spell/spell-core` => `@spell-app/core`, `@spell/spell-util` =>
 *    `@spell-app/util` DIRECTLY (never via `@spell/core`, the module name compiled spell imports).  `ui`'s util
 *    barrel is rewritten to import util's GENERIC files one by one, so spell's heavy utilities stay out of `ui`.
 *    `spell-app` is also the GitHub org, the npm scope, the VS Code publisher and the `<spell-app>` element:  only
 *    package-path / package-name / alias contexts are rewritten (`renameStep0`);  the rest by anchored edits.
 * 1. ui's own aliases:  `$/x` => `$/ui/x`, `$test/x` => `$/ui/test/x`, in module specifiers AND mentions
 *    (backticked, quoted, or the ui folder names:  "the $/elements barrel"), in every file;  plus the `paths` lines of
 *    any tsconfig (`"$/*": [".../src/*"]` => `"$/ui": [".../src/index.ts"]` + `"$/ui/*"`, `"$test/*"` => `"$/ui/test/*"`).
 *    Also a few ANCHORED patches (`UI_PATCHES`) for ui's own alias logic that no regex can express:  vite's
 *    declaration rewriter, the docs site's `alias` array.  A patch whose anchor is gone and whose result is absent
 *    is reported as a WARNING:  do it by hand.
 * 2. `#name` => `$/name` for exactly the package aliases in `tsconfig.base.json`, in module specifiers and
 *    quoted / backticked mentions.  Never private fields (`this.#x`), CSS colours, headings, URL fragments.
 * 3. `tsconfig.base.json`:  header comment rewritten, the `ui` section's comment.  (The `paths` keys themselves are
 *    steps 1 and 2.)
 * 4. npm scope:  `@spell/<name>` => `@spell-app/<name>` for exactly the workspace package names (every tracked
 *    `package.json` whose `name` starts `@spell/`).  `@spell/core` / `@spell/project/...` (module names compiled
 *    spell imports) are excluded EXPLICITLY (`RESERVED_MODULES`), on top of not being workspace names.
 * 5. `yarn install`, `yarn format` (oxfmt may re-sort imports / re-align tables).
 *
 * ## Skipped
 * `node_modules`, build output (`dist*`, `out`, `.cache`, `.astro`), `.yarn`, lockfiles, binary files,
 * `packages/spell/thoughts/**`, `packages/spell/graphify-out/**`, `agents/PAPERCUTS.md` (a dated log), this script and the
 * historical Phase 4 codemod (`move-packages.mjs`, `package-moves.json`).
 */
import { execFileSync } from "node:child_process"
import { existsSync, lstatSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"

const ROOT = resolve(import.meta.dirname, "..")
const NEW_SCOPE = "@spell-app"
const OLD_SCOPE = "@spell"

const SKIP_SEGMENT = /(^|\/)(node_modules|dist[^/]*|out|\.cache|\.yarn|\.git|\.astro)(\/|$)/
const SKIP_PREFIX = ["packages/spell/thoughts/", "packages/spell/graphify-out/"]
const SKIP_FILE = new Set([
  "agents/PAPERCUTS.md",
  "yarn.lock",
  "package-lock.json",
  "scripts/rename-aliases.mjs",
  "scripts/move-packages.mjs",
  "scripts/package-moves.json"
])
const MAX_BYTES = 4_000_000

/**
 * `@spell/<name>` module names compiled spell imports (`@spell/core` = the runtime, `@spell/project/<id>`):  NOT npm
 * packages, NEVER renamed by step 4 even if a workspace were ever called that.
 */
const RESERVED_MODULES = ["core", "project"]

////////////////
// ## Entry
////////////////

/** Reads the repo, applies each step to an in-memory copy, prints a summary per step, writes unless `--dry-run`. */
function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")
  let files = loadFiles()
  if (!files.has("tsconfig.base.json")) die("no tsconfig.base.json at the repo root")
  const tag = dryRun ? "[dry run] " : ""
  const changed = new Set()

  /** Applies `transform(file, text) => { text, n }` to every file, records the result, returns counts. */
  const run = (transform) => {
    let n = 0
    let nFiles = 0
    for (const [file, text] of files) {
      const result = transform(file, text)
      if (result.text === text) continue
      files.set(file, result.text)
      changed.add(file)
      n += result.n
      nFiles++
    }
    return { n, nFiles }
  }

  console.log(
    `${tag}step 0:  \`spell-app\` => \`app\`, \`spell-core\` => \`core\`, \`spell-util\` merged into \`util/src/spell/\``
  )
  if (!step0Pending()) console.log("  already done (no packages/spell-app);  skipped")
  else {
    const prep = prepareStep0(files, dryRun)
    files = prep.files
    for (const file of prep.generated) changed.add(file)
    console.log(
      `  folders moved:  ${dryRun ? "(dry run) " : ""}spell-app, spell-core, spell-util/src => util/src/spell;  ` +
        `${prep.manifests} manifests merged / repointed, ${prep.generated.size} files generated`
    )
    const before = run((file, text) => applyStep0Before(file, text))
    console.log(`  anchored edits and line removals:  ${before.n} in ${before.nFiles} files`)
    const names = run((file, text) => renameStep0(text))
    console.log(`  names, folders, aliases rewritten:  ${names.n} in ${names.nFiles} files`)
    const after = run((file, text) => applyPatches(STEP0_AFTER, "step0", file, text))
    console.log(`  wording / config edits:  ${after.n} in ${after.nFiles} files`)
    reportMissingPatches(STEP0_BEFORE, "step0b", files)
    reportMissingPatches(STEP0_AFTER, "step0", files)
  }

  const base = files.get("tsconfig.base.json")
  const aliasNames = packageAliasNames(base)
  const scopeNames = workspaceNames(files)
  const uiPending = /"\$test\/\*"|"\$\/\*"/.test(base)
  const uiEntries = uiEntryNames()

  console.log(`${tag}step 1:  ui's own aliases (\`$/x\` => \`$/ui/x\`, \`$test/x\` => \`$/ui/test/x\`)`)
  if (!uiPending) console.log("  already done (tsconfig.base.json has no `$/*` / `$test/*`);  skipped")
  else {
    const patches = run((file, text) => applyPatches(UI_PATCHES, "ui", file, text))
    console.log(`  anchored patches:  ${patches.n} in ${patches.nFiles} files`)
    reportMissingPatches(UI_PATCHES, "ui", files)
    const uiRegexes = uiPatterns(uiEntries)
    const specs = run((file, text) => renameUiAliases(text, uiRegexes))
    console.log(`  specifiers / mentions rewritten:  ${specs.n} in ${specs.nFiles} files`)
  }

  console.log(`${tag}step 2:  \`#name\` => \`$/name\` for ${aliasNames.map((name) => `#${name}`).join(" ")}`)
  const hash = hashPatterns(aliasNames)
  const step2 = run((file, text) => renameHashAliases(text, hash))
  console.log(`  specifiers / mentions rewritten:  ${step2.n} in ${step2.nFiles} files`)

  console.log(`${tag}step 3:  tsconfig.base.json header and \`ui\` section`)
  const step3 = run((file, text) => (file === "tsconfig.base.json" ? rewriteTsconfigBase(text) : { text, n: 0 }))
  console.log(`  rewritten:  ${step3.n ? "yes" : "already done"}`)

  console.log(`${tag}step 4:  \`${OLD_SCOPE}/<name>\` => \`${NEW_SCOPE}/<name>\` for ${scopeNames.length} workspace packages`)
  console.log(`  ${scopeNames.map((name) => `${OLD_SCOPE}/${name}`).join(" ")}`)
  const scope = scopePattern(scopeNames)
  const step4 = run((file, text) => renameScope(text, scope))
  console.log(`  names rewritten:  ${step4.n} in ${step4.nFiles} files`)

  console.log(`${tag}prose:  anchored wording edits (AGENTS.md "Imports" ..., test titles)`)
  const prose = run((file, text) => applyPatches(PROSE_PATCHES, "prose", file, text))
  console.log(`  patches applied:  ${prose.n} in ${prose.nFiles} files`)
  reportMissingPatches(PROSE_PATCHES, "prose", files)

  console.log(`${tag}total:  ${changed.size} files changed`)
  if (dryRun) {
    for (const file of [...changed].sort()) console.log(`  would change ${file}`)
    return
  }
  for (const file of changed) writeFileSync(join(ROOT, file), files.get(file))
  if (!changed.size) return
  if (!args.includes("--no-install")) {
    console.log("step 5:  yarn install")
    yarn(["install"])
  }
  if (!args.includes("--no-format")) {
    console.log("step 5:  yarn format (every workspace)")
    yarn(["workspaces", "foreach", "-A", "--exclude", "spell-app", "run", "format"], true)
  }
}

////////////////
// ## Discovery
////////////////

/** `Map` of path => text for every scanned (tracked or untracked-not-ignored, text, not skipped) file. */
function loadFiles() {
  const listed = git(["ls-files", "-z", "-co", "--exclude-standard"]).split("\0").filter(Boolean)
  const files = new Map()
  for (const file of listed) {
    if (SKIP_FILE.has(file) || SKIP_SEGMENT.test(file) || SKIP_PREFIX.some((prefix) => file.startsWith(prefix))) continue
    let stat
    try {
      stat = lstatSync(join(ROOT, file))
    } catch {
      continue // listed but deleted in the working tree
    }
    if (!stat.isFile() || stat.size > MAX_BYTES) continue
    const buffer = readFileSync(join(ROOT, file))
    if (buffer.subarray(0, 8000).includes(0)) continue
    files.set(file, buffer.toString("utf8"))
  }
  return files
}

/**
 * Package alias names from `tsconfig.base.json` `paths`:  keys `#name` (before the rename) or `$/name` (after),
 * not `*` entries.  `ui` is not one:  its keys are `$/*`, then `$/ui`.
 */
function packageAliasNames(baseText) {
  const names = new Set()
  for (const [, name] of baseText.matchAll(/^\s*"#([\w-]+)":/gm)) names.add(name)
  for (const [, name] of baseText.matchAll(/^\s*"\$\/([\w-]+)":/gm)) if (name !== "ui") names.add(name)
  return [...names].sort((a, b) => b.length - a.length)
}

/** `name` of every tracked `package.json` starting `@spell/`, minus the scope, longest first. */
function workspaceNames(files) {
  const names = []
  for (const [file, text] of files) {
    if (!/(^|\/)package\.json$/.test(file)) continue
    let name
    try {
      name = JSON.parse(text).name
    } catch {
      continue
    }
    if (typeof name === "string" && name.startsWith(`${OLD_SCOPE}/`)) names.push(name.slice(OLD_SCOPE.length + 1))
  }
  for (const reserved of RESERVED_MODULES) {
    const at = names.indexOf(reserved)
    if (at >= 0) names.splice(at, 1)
  }
  for (const reserved of RESERVED_MODULES) {
    const at = names.indexOf(reserved)
    if (at >= 0) names.splice(at, 1)
  }
  return [...new Set(names)].sort((a, b) => b.length - a.length)
}

/** Top-level names (extension-less) in `packages/ui/src`:  the `x` of every legal `$/x` before the rename. */
function uiEntryNames() {
  const names = new Set()
  for (const entry of readdirSync(join(ROOT, "packages/ui/src"))) names.add(entry.split(".")[0])
  names.delete("")
  return [...names].sort((a, b) => b.length - a.length)
}

////////////////
// ## Step 0:  folder renames and the `spell-util` merge
////////////////

/** Step 0 is pending while the old folders exist (and the new ones don't):  the gate that makes reruns safe. */
function step0Pending() {
  return (
    existsSync(join(ROOT, "packages/spell-app/package.json")) &&
    !existsSync(join(ROOT, "packages/app")) &&
    !existsSync(join(ROOT, "packages/core"))
  )
}

/** New path of a file under step 0's folder moves, `null` when it is deleted, else itself. */
function step0Path(file) {
  const folder = /^packages\/spell-(app|core)\//.exec(file)
  if (folder) return `packages/${folder[1]}/${file.slice(folder[0].length)}`
  if (file.startsWith("packages/spell-util/src/"))
    return `packages/util/src/spell/${file.slice("packages/spell-util/src/".length)}`
  if (file === "packages/spell-util/.oxlintrc.json") return "packages/util/.oxlintrc.json"
  if (file.startsWith("packages/spell-util/")) return null
  return file
}

/** `files` re-keyed by `mapPath` (entries it maps to `null` dropped), same order. */
function rekey(files, mapPath) {
  const next = new Map()
  for (const [file, text] of files) {
    const to = mapPath(file)
    if (to !== null) next.set(to, text)
  }
  return next
}

/** Performs step 0's folder moves with `git mv` / `git rm`, so history follows. */
function moveFolders() {
  git(["mv", "packages/spell-app", "packages/app"])
  git(["mv", "packages/spell-core", "packages/core"])
  git(["mv", "packages/spell-util/.oxlintrc.json", "packages/util/.oxlintrc.json"])
  git(["mv", "packages/spell-util/src", "packages/util/src/spell"])
  git(["rm", "-rfq", "--ignore-unmatch", "packages/spell-util"])
  rmSync(join(ROOT, "packages/spell-util"), { recursive: true, force: true })
}

/**
 * Merges `spell-util`'s manifest into `util`'s and repoints every dependent, in `files` (keys are the NEW paths;
 * `spellUtilManifest` is the old `spell-util` manifest text).  Returns how many files it changed.
 * - `util` gains `spell-util`'s `dependencies` / `devDependencies` (no duplicates;  `util`'s own versions win).
 * - A package depending on `@spell/spell-util` now depends on `@spell/util` instead (step 4 renames the scope), or
 *   just drops the line when it already had it.
 * - The root `package.json` `workspaces` loses `packages/spell-util`.
 */
function mergeManifests(files, spellUtilManifest, generated) {
  const spellUtil = JSON.parse(spellUtilManifest)
  let n = 0
  for (const [file, text] of files) {
    if (file === "package.json") {
      const next = text.replace(/^\s*"packages\/spell-util",?\n/m, "")
      if (next !== text) (files.set(file, next), generated.add(file), n++)
      continue
    }
    if (!/^packages\/(?:[^/]+\/)*package\.json$/.test(file) || file.includes("/node_modules/")) continue
    if (file === "packages/util/package.json") {
      files.set(file, mergeUtilManifest(JSON.parse(text), spellUtil))
      generated.add(file)
      n++
      continue
    }
    if (!text.includes('"@spell/spell-util"')) continue
    const json = JSON.parse(text)
    for (const section of ["dependencies", "devDependencies", "peerDependencies"]) {
      const deps = json[section]
      if (!deps || !("@spell/spell-util" in deps)) continue
      json[section] = Object.fromEntries(
        Object.entries(deps).flatMap(([name, version]) =>
          name === "@spell/spell-util" ? (deps["@spell/util"] ? [] : [["@spell/util", version]]) : [[name, version]]
        )
      )
    }
    files.set(file, `${JSON.stringify(json, null, 2)}\n`)
    generated.add(file)
    n++
  }
  return n
}

/** `util`'s manifest plus `spell-util`'s dependencies, as text. */
function mergeUtilManifest(util, spellUtil) {
  const sorted = (object) => Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)))
  const dependencies = sorted(
    Object.fromEntries(Object.entries(spellUtil.dependencies ?? {}).filter(([name]) => name !== "@spell/util"))
  )
  const devDependencies = sorted({ ...spellUtil.devDependencies, ...util.devDependencies })
  const out = {}
  for (const [key, value] of Object.entries(util)) {
    if (key === "devDependencies") out.dependencies = dependencies
    out[key] = key === "devDependencies" ? devDependencies : value
  }
  out.description =
    "Helpers shared by @spell/ui, spell and the CLI:  generic ones (@proto, class, string, DOM) and spell's own (src/spell/)"
  return `${JSON.stringify(out, null, 2)}\n`
}

/** Merged `util/tsconfig.json`:  `util`'s options widened by `spell-util`'s (node + vite types, JSX, JSON, `types/`). */
function mergeTsconfig(utilText, spellUtilText) {
  const util = JSON.parse(utilText)
  const spell = JSON.parse(spellUtilText)
  const compilerOptions = { ...util.compilerOptions, ...spell.compilerOptions }
  // `target` stays `spell-util`'s (ES2020):  at ES2022 `Logger`'s static initialisers are flagged (TS2729)
  compilerOptions.lib = util.compilerOptions.lib
  return `${JSON.stringify({ ...util, compilerOptions, include: ["src", "../../types"] }, null, 2)}\n`
}

/** `util/vitest.config.ts` after the merge:  the browser tests, plus a node project for `src/spell/`. */
const UTIL_VITEST_CONFIG = `import { defineConfig, type TestProjectConfiguration } from "vitest/config"
import { playwright } from "@vitest/browser-playwright"

import { standardDecorators } from "../../vite.decorators.ts"
import { packageVersion } from "../../vite.packageVersion.ts"

/**
 * Two projects:
 * - \`browser\` -- the generic helpers' tests, in a REAL browser (Vitest browser mode + Playwright, chromium):
 *   \`dom.test.ts\` needs shadow roots and a custom element registry, and \`decorators.test.ts\` proves \`@proto\` after
 *   esbuild lowers standard decorators.
 * - \`spell\` -- the tests of \`src/spell/\` (spell's utilities), in node:  fetch, tasks, constants.
 * - \`standardDecorators()\` is what lowers decorators:  Vite 8's own transform (oxc) doesn't.  See \`AGENTS.md\`.
 * - Aliases (\`#util\` ...) come from the repo root's \`tsconfig.base.json\`, through \`resolve.tsconfigPaths\`.
 * - \`prefix\` / \`root\`:  the repo root's \`vitest.config.ts\` lists these with \`util:\` names and \`root\` set to this
 *   package, since vitest doesn't nest \`projects\`.  Own run:  no prefix, \`root\` is the config's folder.
 */
export function utilProjects({ prefix = "", root }: { prefix?: string; root?: string } = {}): TestProjectConfiguration[] {
  return [
    {
      plugins: [standardDecorators()],
      resolve: { tsconfigPaths: true },
      ...(root && { root }),
      test: {
        name: \`\${prefix}browser\`,
        include: ["src/**/*.test.ts"],
        exclude: ["**/node_modules/**", "src/spell/**"],
        browser: {
          enabled: true,
          provider: playwright(),
          headless: true,
          instances: [{ browser: "chromium" }]
        }
      }
    },
    {
      plugins: [standardDecorators(), packageVersion()],
      resolve: { tsconfigPaths: true },
      ...(root && { root }),
      test: {
        name: \`\${prefix}spell\`,
        environment: "node",
        include: ["src/spell/**/*.test.ts"]
      }
    }
  ]
}

export default defineConfig({
  test: {
    projects: utilProjects()
  }
})
`

/** New header + barrel of `util/src/index.ts`. */
const UTIL_INDEX = `/**
 * Barrel for \`#util\` (\`@spell/util\`) -- helpers shared by \`ui\`, \`spell\` and \`cli\`, in two layers.
 * - GENERIC (the files beside this one):  \`@proto\`, class, name-case string and shadow-aware DOM helpers.  No runtime
 *   dependencies, safe anywhere, including \`*.types.ts\` files and SSR / node tooling.  \`@spell/ui\` is published and
 *   bundles what it imports from here.
 * - SPELL'S (\`./spell\`, flattened in LAST):  lodash, \`chalk\`, \`pluralize\`, the React-era state libraries, fetch,
 *   tasks, prefs.  NEVER import them from \`ui\`:  \`ui\`'s \`src/util/index.ts\` imports the generic files one by one
 *   (\`#util/class\` ...) and never this barrel, so none of it lands in \`ui\`'s bundles or published declarations.
 * - NOTE: no namespace here (unlike \`UI\` / \`E\`):  utilities are imported by name,
 *   e.g. \`import { proto, kebabCase } from "#util"\`.
 * - NOTE: other packages import \`#util\` ONLY, never \`#util/<file>\` -- except \`ui\`'s util barrel, see above.
 */

export * from "./util.types"

export * from "./class"
export * from "./decorators"
export * from "./string"
export * from "./dom"

export * from "./spell"
`

/** New header of `util/src/spell/index.ts` (was `spell-util`'s barrel;  its `export * from "#util"` goes). */
const UTIL_SPELL_HEADER = `/**
 * Barrel for \`#util/spell\` -- spell's own utilities, flattened into \`#util\` by \`../index.ts\`.
 * - Grouped below by rough concern: constants, app plumbing, language helpers, fetch/observable, DOM, tasks.
 * - A sub-folder, not beside the generic helpers:  \`ui\` is published and bundles the generic files, and these pull in
 *   lodash, \`chalk\`, \`pluralize\` and the React-era state libraries.  \`string.ts\` and \`DOM.ts\` also share a name with
 *   the generic \`../string.ts\` / \`../dom.ts\` (and macOS is case-insensitive).
 * - NOTE: files here import the generic helpers by deep path (\`#util/class\`), never the \`#util\` barrel:  it re-exports
 *   this folder, which would be a cycle.
 * - NOTE: \`ResponseErrors.ts\` is deliberately NOT re-exported here -- its error classes (\`ResponseError\`,
 *   \`MissingResourceError\`, etc) are consumed directly by \`$fetch.ts\`/\`LoadableFile.ts\` via relative import,
 *   not by outside callers, so they stay off this barrel's public surface.
 *   TODO: confirm that's intentional rather than a gap -- no other file imports them today.
 */
`

/** New `ui/src/util/index.ts`:  util's GENERIC files only, one by one. */
function uiUtilBarrel(genericFiles) {
  return `/**
 * Barrel for \`$/util\` -- general-purpose utilities with no dependency on the rest of the package.
 * - Re-exports \`packages/util\`'s GENERIC files (\`@proto\`, class / string / DOM helpers, \`Prettify\` ...), shared with
 *   \`spell\`:  they live there, not here, so every package shares ONE copy.
 * - NOTE: imports them one by one (\`#util/class\` ...), NEVER \`#util\`'s barrel:  that also flattens in \`#util/spell\`
 *   (lodash, \`chalk\`, \`pluralize\`, fetch, tasks ...), which would land in \`ui\`'s \`core\` bundle and published
 *   declarations.  An allowed exception to "import another package's barrel only";  add a file here when \`util\`
 *   gains a GENERIC one.  \`yarn measure\` and \`yarn smoke\` catch a leak.
 * - Safe to import anywhere, including \`*.types.ts\` files and the runtime's lazily-loaded chunk.
 * - NOTE: no namespace here (unlike \`UI\` / \`E\`):  utilities are imported by name,
 *   e.g. \`import { proto, kebabCase } from "$/util"\`.
 * - Nothing package-specific lives here yet.
 */

${genericFiles.map((name) => `export * from "#util/${name}"`).join("\n")}
`
}

/**
 * Step 0 text rules, on text whose file paths are already the NEW ones.  In order:
 * 1. npm names:  `@spell/spell-app` => `@spell-app/app`, `@spell/spell-core` => `@spell-app/core`,
 *    `@spell/spell-util` => `@spell-app/util` (DIRECTLY, never via `@spell/core`:  that is the module name compiled
 *    spell imports).
 * 2. folders:  `packages/spell-app` / `packages/spell-core` / `packages/spell-util[/src]`, and `../spell-app` etc.
 * 3. aliases:  `#spell-app` => `#app`, `#spell-core` => `#core`, `#spell-util[/x]` => `#util[/spell/x]`.
 * 4. the words `spell-core` / `spell-util` (never after `/ . @ # $ - <`, nor before `-` or `.ext`) => `core` / `util`.
 * 5. `spell-app` ONLY as a backticked package (`` `spell-app` ``, `` `spell-app/...` ``):  it is also the GitHub org,
 *    the npm scope, the VS Code publisher and the `<spell-app>` element, which stay.
 */
function renameStep0(text) {
  let n = 0
  const sub = (regex, replacement) => {
    text = text.replace(regex, (...args) => {
      n++
      return typeof replacement === "function"
        ? replacement(...args)
        : replacement.replace(/\$(\d)/g, (_, index) => args[index])
    })
  }
  sub(/(?<![\w])@spell(\\?\/)spell-app(?![\w-])/g, "@spell-app$1app")
  sub(/(?<![\w])@spell(\\?\/)spell-core(?![\w-])/g, "@spell-app$1core")
  sub(/(?<![\w])@spell(\\?\/)spell-util(?![\w-])/g, "@spell-app$1util")
  sub(/packages\/spell-util\/src(?![\w-])/g, "packages/util/src/spell")
  sub(/packages\/spell-(app|core)(?![\w-]|\.\w)/g, "packages/$1")
  sub(/packages\/spell-util(?![\w-]|\.\w)/g, "packages/util")
  sub(/(\.\.\/)spell-util\/src(?![\w-])/g, "$1util/src/spell")
  sub(/(\.\.\/)spell-(app|core)(?![\w-]|\.\w)/g, "$1$2")
  sub(/(\.\.\/)spell-util(?![\w-]|\.\w)/g, "$1util")
  sub(/(["'`])#spell-util\//g, "$1#util/spell/")
  sub(/(["'`])#spell-util(?=["'`])/g, "$1#util")
  sub(/(["'`])#spell-(app|core)(?=[/"'`])/g, "$1#$2")
  sub(/(?<=[\s(\[])#spell-util\/(?=\w)/g, "#util/spell/")
  sub(/(?<=[\s(\[])#spell-(app|core)(?=\/\w)/g, "#$1")
  sub(/(?<![\w@#/.$<-])spell-(core|util)(?![\w-]|\.\w)/g, (_, name) => name)
  sub(/(?<=`)spell-app(?=[`/])/g, "app")
  return { text, n }
}

/** Preparation of step 0:  moves (real run), re-keys `files`, merges manifests, writes the generated files. */
function prepareStep0(files, dryRun) {
  const spellUtilManifest = files.get("packages/spell-util/package.json")
  const spellUtilTsconfig = files.get("packages/spell-util/tsconfig.json")
  const spellUtilTsconfigNode = files.get("packages/spell-util/tsconfig.node.json")
  // `util`'s GENERIC files, before the merge:  what `ui`'s util barrel may import
  const genericFiles = readdirSync(join(ROOT, "packages/util/src"))
    .filter((name) => /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) && name !== "index.ts")
    .map((name) => name.replace(/\.tsx?$/, ""))
    .sort()
  genericExportMap = new Map()
  for (const name of genericFiles) {
    const text = files.get(`packages/util/src/${name}.ts`) ?? ""
    for (const [, id] of text.matchAll(
      /export\s+(?:declare\s+)?(?:abstract\s+)?(?:async\s+)?(?:const|let|function\*?|class|type|interface|enum)\s+(\w+)/g
    ))
      genericExportMap.set(id, name)
    for (const [, list] of text.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g))
      for (const item of list.split(",")) {
        const id = item.trim().split(/\s+as\s+/).pop()
        if (id) genericExportMap.set(id, name)
      }
  }
  if (!dryRun) moveFolders()
  files = rekey(files, step0Path)
  const generated = new Set()
  const set = (file, text) => (files.set(file, text), generated.add(file))
  const manifests = mergeManifests(files, spellUtilManifest, generated)
  set("packages/util/tsconfig.json", mergeTsconfig(files.get("packages/util/tsconfig.json"), spellUtilTsconfig))
  // `spell-util`'s node config also includes \`vite.packageVersion.ts\` and \`types/\`, which \`vitest.config.ts\` now needs
  set("packages/util/tsconfig.node.json", spellUtilTsconfigNode)
  set("packages/util/vitest.config.ts", UTIL_VITEST_CONFIG)
  set("packages/util/src/index.ts", UTIL_INDEX)
  set("packages/ui/src/util/index.ts", uiUtilBarrel(genericFiles))
  return { files, generated, manifests }
}

/** Exports of `util`'s generic files:  name => file (no extension).  Filled by `prepareStep0`. */
let genericExportMap = new Map()

/** `#util` imports inside `util/src/spell/**` split by the generic FILE each name lives in (no cycle through the barrel). */
function splitUtilImports(text) {
  return text.replace(/^import (type )?\{([^}]*)\} from "#util"$/gm, (match, typeKw = "", names) => {
    const groups = new Map()
    for (const item of names
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)) {
      const id = item
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0]
        .trim()
      const file = genericExportMap.get(id)
      if (!file) return match
      groups.set(file, [...(groups.get(file) ?? []), item])
    }
    return [...groups].map(([file, items]) => `import ${typeKw}{ ${items.join(", ")} } from "#util/${file}"`).join("\n")
  })
}

/** New `DEPENDENTS` of `.github/scripts/changed-packages.mjs`:  `spell-util` gone, `spell-app` / `spell-core` renamed. */
const NEW_DEPENDENTS = `const DEPENDENTS = {
  util: ["solid-element", "ui", "parser", "core", "spell", "lsp", "app", "cli"],
  "solid-element": ["ui", "cli"],
  ui: ["cli"],
  parser: ["spell", "lsp", "app", "cli"],
  core: ["spell", "lsp", "app", "cli"],
  spell: ["lsp", "app", "cli"],
  lsp: ["app", "cli"],
  app: ["cli"],
  // the extension runs \`lsp\` and \`app\`'s runner, but has no checks of its own yet
  vscode: [],
  cli: []
}
`

/** Replacement of agents/CODE-DEBT.md's `spell-util` bullet in "Phase 4 package split:  compromises". */
const NEW_CODE_DEBT_BULLET = `- **\`util/src/spell/\` is the old \`~/util\`, whole.**
  - **Cost**:  \`parser\` and \`core\` depend on lodash, \`chalk\`, \`pluralize\`, \`query-string\` and the React-era
    state libraries (\`@nx-js/observer-util\`, \`@risingstack/react-easy-state\`) for a handful of helpers each;  a
    published \`@spell/parser\` would drag them in.  They sit in \`util\`'s \`package.json\`, beside the generic helpers
    \`ui\` bundles, and \`ui\`'s util barrel must import the generic files one by one to keep them out.
  - **Cause**:  \`~/util\` mixed generic helpers (\`string\`, \`assert\`, \`paths\`) with reactive state (\`Observable\`,
    \`extend\`), browser fetch (\`$fetch\`, \`Loadable\`) and app prefs (\`AppPrefStore\`, \`prefs\`).  The split moved it
    whole into \`spell-util\`, which was then merged into \`util\` as the sub-folder \`src/spell/\`.
  - **Fix**:  generic, dependency-free helpers => beside \`util\`'s generic files;  reactive state => \`core\`;
    fetch / loadable / prefs => \`app\` or \`spell/node\`;  then \`src/spell/\` and its dependencies go.  Watch \`ui\`'s
    bundle size (\`yarn measure\`).
  - **Pinned at**:  \`packages/util/package.json\` \`dependencies\`, and \`packages/ui/src/util/index.ts\`' file-by-file
    imports.
`

/** Line / block removals and structural rewrites of step 0 that no literal patch can express. */
function applyStep0Before(file, text) {
  let n = 0
  const sub = (regex, replacement) => {
    const next = text.replace(regex, replacement)
    if (next !== text) (n++, (text = next))
  }
  if (file === "tsconfig.base.json") sub(/^\s*"#spell-util(?:\/\*)?":.*\n/gm, "")
  if (file === "README.md") sub(/^\| \[`packages\/spell-util`\].*\n/m, "")
  if (file === "packages/cli/README.md") sub(/^\s*spell-util\/\s+utilities\n/m, "")
  if (file === "AGENTS.md")
    sub(/^  - `packages\/spell-util\/` \(`@spell\/spell-util`, `#spell-util`\)[^\n]*\n[^\n]*\n/m, "")
  if (file === "agents/CODE-DEBT.md")
    sub(
      /- \*\*`spell-util` is the old `~\/util`, whole\.\*\*[\s\S]*?\*\*Pinned at\*\*:  `packages\/spell-util\/package\.json` `dependencies`\.\n/,
      () => NEW_CODE_DEBT_BULLET
    )
  if (file === ".github/scripts/changed-packages.mjs") sub(/const DEPENDENTS = \{[\s\S]*?\n\}\n/, () => NEW_DEPENDENTS)
  if (file === "packages/util/src/spell/index.ts")
    sub(/^\/\*\*[\s\S]*?\*\/\n\nexport \* from "#util"\n/, () => `${UTIL_SPELL_HEADER}\n`)
  if (file.startsWith("packages/util/src/spell/") && /\.tsx?$/.test(file)) sub(/^import (type )?\{[^}]*\} from "#util"$/gm, (m) => splitUtilImports(m))
  const patched = applyPatches(STEP0_BEFORE, "step0b", file, text)
  return { text: patched.text, n: n + patched.n }
}

/** Anchored edits BEFORE the renames (text still says `spell-util` / `#spell-util`). */
const STEP0_BEFORE = [
  ["packages/spell/src/node/environment.ts", '"spell-core", "src"', '"core", "src"'],
  ["packages/spell/src/node/environment.ts", '"spell-app", "static"', '"app", "static"'],
  ["AGENTS.md", "`parser` / `spell-core` -> `spell-util` -> `util`", "`parser` / `core` -> `util`"],
  ["README.md", "`parser` / `spell-core` -> `spell-util` -> `util`", "`parser` / `core` -> `util`"],
  [
    "AGENTS.md",
    "- `packages/util/` (`@spell/util`, `#util`) -- small generic helpers `ui` and spell's utilities share.",
    "- `packages/util/` (`@spell/util`, `#util`) -- helpers `ui` and spell share:  small generic ones (`@proto` ...) and\n    spell's own in `src/spell/` (lodash, `Observable`, `Task` ...).  See its `AGENTS.md`."
  ],
  [
    "AGENTS.md",
    "import from `#util`, or `#spell-util` / `$/util`, which re-export it",
    "import from `#util`;  `ui` has `$/util`, which re-exports the generic ones"
  ],
  ["AGENTS.md", "(`#spell-util`, `#util`, `$/util`)", "(`#util`, `$/util`)"],
  ["AGENTS.md", "- `#util` / `#spell-util` and other general utilities", "- `#util` and other general utilities"],
  [
    "README.md",
    "`spell`, `parser`, `spell-core`,\n  `spell-util`, `lsp`, `spell-app`, `cli`, `solid-element`, plus `ui:ssr` and `ui:browser`.",
    "`spell`, `parser`, `core`,\n  `lsp`, `app`, `cli`, `solid-element`, plus `util:browser`, `util:spell`, `ui:ssr` and `ui:browser`."
  ]
]

/** Anchored edits AFTER the renames and BEFORE step 1:  `#name` is a package alias, `$/x` is still ui's own. */
const STEP0_AFTER = [
  // `util`'s own `package.json` isn't `spell`'s any more, and the test moved one folder deeper
  [
    "packages/util/src/spell/constants.test.ts",
    'resolve(import.meta.dirname, "..", "package.json")',
    'resolve(import.meta.dirname, "..", "..", "..", "spell", "package.json")'
  ],
  [
    "packages/util/src/spell/constants.test.ts",
    "every spell-family package shares one version (`spell`'s, which vite hands over), so ours will do",
    "every spell-family package shares one version, `spell`'s, which vite hands over"
  ],
  [
    "vitest.config.ts",
    'import { uiProjects } from "./packages/ui/vitest.config.ts"\n',
    'import { uiProjects } from "./packages/ui/vitest.config.ts"\nimport { utilProjects } from "./packages/util/vitest.config.ts"\n'
  ],
  [
    "vitest.config.ts",
    '  ui: uiProjects({ prefix: "ui:", root: resolve(PACKAGES_DIR, "ui") })\n',
    '  ui: uiProjects({ prefix: "ui:", root: resolve(PACKAGES_DIR, "ui") }),\n  util: utilProjects({ prefix: "util:", root: resolve(PACKAGES_DIR, "util") })\n'
  ],
  [
    "vitest.config.ts",
    " * - `ui`:  `ssr` MUST run before",
    " * - `util`:  `browser` (generic helpers) and `spell` (node, `src/spell/`).\n * - `ui`:  `ssr` MUST run before"
  ],
  [
    "packages/ui/vite.config.ts",
    'exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "../util/src/**/*.test.ts"],',
    'exclude: [\n      "src/**/*.test.ts",\n      "src/**/*.test.tsx",\n      "../util/src/**/*.test.ts",\n      "../util/src/spell/**",\n      "../util/src/index.ts"\n    ],'
  ],
  [
    "packages/ui/vite.config.ts",
    " * - `util` is not published on its own, so its declarations ship inside `@spell/ui`.",
    " * - `util` is not published on its own, so its GENERIC declarations ship inside `@spell/ui`.  NOT `util/src/spell/` or\n *   `util`'s barrel (which flattens it in):  `exclude` lists them, and `src/util/index.ts` imports file by file."
  ],
  [
    "packages/ui/AGENTS.md",
    "    A helper only `ui` uses goes in `src/util/`, one `spell` also needs moves to `#util`.",
    "    `src/util/index.ts` imports util's GENERIC files one by one (`#util/class` ...), never `#util`'s barrel, which also\n    holds spell's utilities (lodash, `chalk` ...):  an allowed exception to the barrel-only rule.\n    A helper only `ui` uses goes in `src/util/`, one `spell` also needs moves to `#util`."
  ],
  [
    "AGENTS.md",
    "    - `#spell/node/...` (node-only:  environment, files on disk)\n",
    "    - `#spell/node/...` (node-only:  environment, files on disk)\n    - `#util/class`, `#util/decorators` ... (`util`'s GENERIC files, from `ui`'s `src/util/index.ts` only:  the barrel\n      also holds spell's heavy utilities)\n"
  ],
  [
    "packages/util/AGENTS.md",
    "anything needing a dependency `ui` doesn't already have (`pluralize`, CommonJS `lodash` ...):  it stays in its\n    package, e.g. `util`'s `src/string.ts`",
    "anything needing a dependency `ui` doesn't already have (`pluralize`, CommonJS `lodash` ...):  it goes in\n    `src/spell/`, never beside the generic files"
  ],
  [
    "packages/util/AGENTS.md",
    "anything only ONE package uses:  `ui`'s `core.ts` re-exports `$/util` wholesale, so every helper here lands in\n    `ui`'s `core` bundle (`yarn measure`), used or not",
    "anything only ONE package uses:  `ui`'s `core.ts` re-exports its `$/util` wholesale, which imports every GENERIC\n    file here, so each lands in `ui`'s `core` bundle (`yarn measure`), used or not"
  ],
  [
    "packages/util/AGENTS.md",
    "- Packages import `#util` (the barrel) ONLY, never `#util/<file>`.  Each keeps its own `util` barrel\n  (`#util`, `$/util`) for package-specific helpers, and that barrel re-exports `#util`.",
    "- Packages import `#util` (the barrel) ONLY, never `#util/<file>` -- with ONE exception:  `ui`'s `src/util/index.ts`\n  imports the generic files one by one (`#util/class` ...), so spell's utilities never reach `ui`'s bundles or published\n  declarations.  `ui` keeps its own `util` barrel (`$/util`) for package-specific helpers."
  ],
  [
    "packages/util/AGENTS.md",
    "\n## Decorators\n",
    "\n## Spell's utilities (`src/spell/`)\n\n- Spell's own utilities, flattened into the `#util` barrel LAST:  lodash and string helpers, `Observable` /\n  `Derivative` / `Loadable`, `Task` / `TaskList`, `$fetch`, `Logger`, prefs, `assert` / `die`, DOM helpers.  The bottom\n  of the spell chain:  every spell-family package may import it, and it imports nothing above it.\n  - Formerly the package `spell-util`.  A sub-folder, not loose files:  `string.ts` / `DOM.ts` would clash with the generic\n    `string.ts` / `dom.ts` (macOS is case-insensitive), and nothing in `ui` may import it.\n  - Its dependencies (lodash, `chalk`, `pluralize`, `react` ...) are `util`'s `dependencies`.  `ui` bundles none of\n    them:  `yarn measure` and `yarn smoke` (declarations) prove it.\n- Files in `src/spell/` import the generic helpers by deep path (`#util/class`), NEVER the `#util` barrel (it re-exports\n  this folder:  a cycle).\n- NOTE: `ResponseErrors.ts` is deliberately NOT in `src/spell/index.ts` -- see its header.\n- Reactivity here (`Observable`, `getProp` / `setProp`, stores) is Solid work:  READ the root's Solid 2 pointer first.\n- Tests: the generic ones run in a real browser (`util:browser`), `src/spell/**` in node (`util:spell`);\n  `vitest.config.ts` exports `utilProjects()` for the root run.\n\n## Decorators\n"
  ],
  [
    "packages/util/AGENTS.md",
    "- Commands:  `yarn review`, `yarn ts`, `yarn lint`, `yarn format`, `yarn test` (a real browser, chromium).",
    "- Commands:  `yarn review`, `yarn ts`, `yarn lint`, `yarn format`, `yarn test` (a real browser, chromium, for the\n  generic files;  node for `src/spell/`)."
  ]
]

////////////////
// ## Step 1:  ui's own aliases
////////////////

/** Not preceded by a word char, `\`, `$`, `^`, `]`, `/`, `.` or `-`:  skips regexes like `/^\d+$/`, `a/$/b`. */
const NOT_AFTER = "(?<![\\w\\\\$^\\]/.-])"

/** Regexes for step 1, built from ui's top-level folder / file names. */
function uiPatterns(entries) {
  const alternation = entries.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")
  return {
    src: new RegExp(`${NOT_AFTER}\\$\\/(?=(?:${alternation})(?![\\w-]))`, "g"),
    test: new RegExp(`${NOT_AFTER}\\$test\\/`, "g"),
    // `$test` alone, quoted:  "target of `$test`"
    testBare: /(?<=["'`])\$test(?=["'`])/g,
    // tsconfig `paths` lines
    pathSrc: /^(\s*)"\$\/\*":\s*\["([^"]*)\*"\](,?)$/gm,
    pathTest: /^(\s*)"\$test\/\*":/gm
  }
}

/** Rewrites ui's alias in `text`, counting each rewrite. */
function renameUiAliases(text, re) {
  let n = 0
  const bump = (replacement) => (...args) => (n++, typeof replacement === "function" ? replacement(...args) : replacement)
  text = text.replace(re.pathSrc, (_, indent, folder, comma) => {
    n++
    return `${indent}"$/ui": ["${folder}index.ts"],\n${indent}"$/ui/*": ["${folder}*"]${comma}`
  })
  text = text.replace(re.pathTest, (_, indent) => (n++, `${indent}"$/ui/test/*":`))
  text = text.replace(re.test, bump("$/ui/test/"))
  text = text.replace(re.testBare, bump("$/ui/test"))
  text = text.replace(re.src, bump("$/ui/"))
  return { text, n }
}

/**
 * ANCHORED literal edits that need ui's alias logic rewritten, not just renamed.  `[file, old, new]`:  applied when
 * `old` is present (so a second run does nothing).  Written in step-1 terms (`$/util` is the PACKAGE, `$/ui` is ui);
 * the later steps may still rename text inside `new` (`@spell\/ui`).
 */
const UI_PATCHES = [
  [
    "packages/ui/site/astro.config.mjs",
    [
      "      // Array form so `$test` is matched before `$`;  string keys match `$` exactly or `$/...` only.",
      "      alias: [",
      "        { find: /^#util$/, replacement: `${UTIL}/index.ts` },",
      "        { find: /^#util\\//, replacement: `${UTIL}/` },",
      "        { find: /^\\$test(?=\\/|$)/, replacement: TEST },",
      "        { find: /^\\$(?=\\/|$)/, replacement: SRC },"
    ].join("\n"),
    [
      "      // Array form, first match wins:  `$/ui/test` before `$/ui`;  `#util` is the shared `packages/util`.",
      "      alias: [",
      "        { find: /^\\$\\/util$/, replacement: `${UTIL}/index.ts` },",
      "        { find: /^\\$\\/util\\//, replacement: `${UTIL}/` },",
      "        { find: /^\\$\\/ui\\/test(?=\\/|$)/, replacement: TEST },",
      "        { find: /^\\$\\/ui$/, replacement: `${SRC}/index.ts` },",
      "        { find: /^\\$\\/ui\\//, replacement: `${SRC}/` },"
    ].join("\n")
  ],
  ["packages/ui/site/astro.config.mjs", "target of the `$` alias", "target of the `$/ui` alias"],
  ["packages/ui/site/astro.config.mjs", "target of `$test`", "target of `$/ui/test`"],
  ["packages/ui/site/astro.config.mjs", "target of the `#util` alias", "target of the `#util` alias"],
  // vite-plugin-dts `beforeWriteFile`:  `$/util` (the package) vs `$/ui/...`
  [
    "packages/ui/vite.config.ts",
    '(#util|\\$\\/[^"\']+|\\.\\.?\\/[^"\']*)',
    '(\\$\\/[^"\']+|\\.\\.?\\/[^"\']*)'
  ],
  [
    "packages/ui/vite.config.ts",
    [
      "        : specifier === \"#util\"",
      "          ? path.join(utilSrc, \"index\")",
      "          : path.join(uiSrc, specifier.slice(\"$/\".length))"
    ].join("\n"),
    [
      "        : specifier === \"#util\" || specifier.startsWith(\"#util/\")",
      "          ? path.join(utilSrc, specifier.slice(\"#util\".length) || \"index\")",
      "          : specifier === \"$/ui\"",
      "            ? path.join(uiSrc, \"index\")",
      "            : path.join(uiSrc, specifier.slice(\"$/ui/\".length))"
    ].join("\n")
  ],
  ["packages/ui/vite.config.ts", "Aliases (`$/`, `$test/`, `#util` ...)", "Aliases (`$/ui`, `$/ui/test`, `#util` ...)"],
  ["packages/ui/vite.config.ts", "rewrites `#util` and `$/`\n", "rewrites `#util` and `$/ui`\n"],
  ["packages/ui/vite.config.ts", "NO `#util`, `$/` or `$test` in", "NO `$/` alias in"],
  ["packages/ui/tools/DeclarationCheck.ts", "`#util`, `$/`, `$test/` (build-time", "`#util`, `$/ui` ... (build-time"],
  ["packages/ui/tools/README.md", "an alias (`#util`, `$/`)", "an alias (`#util`, `$/ui`)"],
  ["packages/ui/tools/cli.ts", "(no `#util` / `$/`, nothing", "(no `$/` alias, nothing"]
]

/** Per patch list:  `Map` of patch index => "applied" | "present" | "missing", filled by `applyPatches`. */
const patchState = new Map()

/** Applies the `patches` for `file`;  `list` names the list in `patchState`. */
function applyPatches(patches, list, file, text) {
  let n = 0
  patches.forEach(([target, from, to], index) => {
    if (target !== file) return
    const key = `${list}:${index}`
    if (text.includes(to)) patchState.set(key, patchState.get(key) ?? "present") // `to` may contain `from`
    else if (text.includes(from)) {
      text = text.split(from).join(to)
      n++
      patchState.set(key, "applied")
    } else if (!patchState.has(key)) patchState.set(key, "missing")
  })
  return { text, n }
}

/** Warns about patches whose old text AND new text are both absent:  the file moved on, edit by hand. */
function reportMissingPatches(patches, list, files) {
  patches.forEach(([target, from], index) => {
    const state = patchState.get(`${list}:${index}`)
    if (state === "applied" || state === "present") return
    const why = files.has(target) ? "anchor not found" : "file not found"
    console.log(`  WARNING ${list} patch ${index} for ${target} (${why}):  ${JSON.stringify(from.slice(0, 70))}`)
  })
}

////////////////
// ## Step 2:  `#name` => `$/name`
////////////////

/** Regexes for step 2.  Quoted / backticked, or unquoted only when a `/word` follows:  never `this.#x`. */
function hashPatterns(names) {
  const alternation = names.join("|")
  return {
    quoted: new RegExp(`(["'\`])#(${alternation})(?=[/"'\`])`, "g"),
    unquoted: new RegExp(`(?<=[\\s(\\[])#(${alternation})(?=\\/[\\w.*])`, "g")
  }
}

/** Rewrites `#name` aliases in `text`. */
function renameHashAliases(text, re) {
  let n = 0
  text = text.replace(re.quoted, (_, quote, name) => (n++, `${quote}$/${name}`))
  text = text.replace(re.unquoted, (_, name) => (n++, `$/${name}`))
  return { text, n }
}

////////////////
// ## Prose
////////////////

/**
 * Wording no regex can fix, as ANCHORED `[file, old, new]` edits on the text AFTER steps 1-4 (so `$/parser`, not
 * `#parser`).  Idempotent like `UI_PATCHES`;  one that no longer matches warns:  do it by hand.
 */
const PROSE_PATCHES = [
  [
    "AGENTS.md",
    '- Packages (`#name` is the import alias, `X` the self-namespace -- see "Imports"):',
    '- Packages (`$/name` is the import alias, `$` meaning `packages/`;  `X` the self-namespace -- see "Imports"):'
  ],
  ["AGENTS.md", "(`@spell-app/ui`, `$/`) -- Fomantic UI", "(`@spell-app/ui`, `$/ui`) -- Fomantic UI"],
  [
    "AGENTS.md",
    "- No `~/` alias exists any more.  `ui` keeps `$/` and `$/ui/test/` until it becomes `#ui`.\n",
    "- No `~/` or `#name` alias exists any more.  `$` means `packages/`, so `ui` is `$/ui` like the rest;  that can't\n" +
      "  collide with an npm package name (`@spell-app/...`, `solid-js`) the way a bare `name/...` could.\n"
  ],
  [
    "AGENTS.md",
    "Every package's alias is `#name`\n  (`$/parser`, `$/core`, `$/cli` ...);  `ui` is the exception, `$/` (and `$/ui/test/`), until it becomes `#ui`.\n  The one table is `tsconfig.base.json`.",
    "Every package's alias is `$/name`\n  (`$/parser`, `$/core`, `$/ui` ...), `$` meaning `packages/`.  `ui` is no exception:  its test helpers are\n  `$/ui/test/...`.  The one table is `tsconfig.base.json`."
  ],
  [
    "AGENTS.md",
    "INSIDE a package, `#name` is its barrel and `#name/deep/path` any file",
    "INSIDE a package, `$/name` is its barrel and `$/name/deep/path` any file"
  ],
  [
    "AGENTS.md",
    "    - `$/parser/test` and `$/spell/test` (test helpers)\n",
    "    - `$/parser/test` and `$/spell/test` (test helpers)\n    - `$/ui/test/...` (`ui`'s test helpers)\n"
  ],
  ["AGENTS.md", "else `#name/path/to/foo.css`", "else `$/name/path/to/foo.css`"],
  ["packages/ui/AGENTS.md", "As the root's, with `$` as our alias, plus:", "As the root's, with `$/ui` / `$/ui/*` as our alias, plus:"],
  [
    "packages/ui/AGENTS.md",
    "the only other\n  alias.",
    "the only other\n  entry point (`$/ui/test/*` is longer than `$/ui/*`, so it wins)."
  ],
  [".claude/skills/solid-2/SKILL.md", ", #spell-util reactivity", ", `$/util` reactivity"],
  ["packages/lsp/src/barrel.test.ts", 'describe("#lsp barrel"', 'describe("$/lsp barrel"'],
  ["packages/parser/src/barrel.test.ts", 'describe("#parser barrel contents"', 'describe("$/parser barrel contents"'],
  ["packages/parser/src/barrel.test.ts", 'describe("#parser barrel entry order"', 'describe("$/parser barrel entry order"']
]

////////////////
// ## Step 3:  tsconfig.base.json
////////////////

/** New header comment of `tsconfig.base.json`, and the `ui` section's comment. */
const BASE_HEADER = `{
  // ONE import-alias table for the whole monorepo.  Every package's \`tsconfig.json\` extends this, so an alias means
  // the same thing wherever a file is compiled from -- e.g. \`cli\` compiling \`spell\`'s source.
  // - \`tsc\` and \`tsx\` read it through each package's \`tsconfig.json\`;  vite / vitest through \`resolve.tsconfigPaths\`,
  //   which finds the tsconfig nearest the IMPORTING file.
  // - MUST stay the only \`paths\` in the repo:  a package that sets its own \`paths\` REPLACES this table, never adds to it.
  // - Paths are fixed, never \`\${configDir}\`:  \`tsx\` can't resolve it (4.20 throws, 4.23 ignores it).
  // - \`$\` means \`packages/\`:  \`$/name\` is a package's barrel, \`$/name/...\` a file in its \`src/\`, and \`$/ui/test/...\`
  //   \`ui\`'s test helpers.  It can't collide with an npm name (\`@spell-app/...\`) the way a bare \`name/...\` could.
  // - From ANOTHER package, import the barrel only, except these entry points:  \`$/parser/rulex\` (opt-in),
  //   \`$/parser/test\` / \`$/spell/test\` (test helpers), \`$/spell/node/...\` (node-only:  environment, files on disk),
  //   and \`$/util/class\` etc. (\`util\`'s GENERIC files, imported one by one by \`ui\`'s \`src/util/index.ts\` only:  the
  //   \`$/util\` barrel also holds spell's heavy utilities, which \`ui\` must not bundle).
  // - NOTE: every alias works from every package.  The one-way dependency rule is by convention:
  //   \`cli\` -> \`app\` -> \`lsp\` -> \`spell\` -> \`parser\` / \`core\` -> \`util\`, and
  //   \`ui\` -> \`solid-element\` / \`util\`.  e.g. \`ui\` MUST NOT import \`$/spell\`.
`

/** Replaces the header (everything before `"compilerOptions"`) and the `ui` section comment. */
function rewriteTsconfigBase(text) {
  const start = text.indexOf('  "compilerOptions"')
  if (start < 0) return { text, n: 0 }
  let next = BASE_HEADER + text.slice(start)
  next = next.replace(
    /^(\s*)\/\/ ## `ui`:.*$/m,
    "$1// ## `ui`:  barrel, files and test helpers;  `$/ui/test/*` is longer than `$/ui/*`, so it wins"
  )
  return { text: next, n: next === text ? 0 : 1 }
}

////////////////
// ## Step 4:  npm scope
////////////////

/** Regex for `@spell/<workspace name>` (also regex-escaped `@spell\/name`), whole names only. */
function scopePattern(names) {
  if (!names.length) return undefined // all renamed already:  an empty alternation would match every `@spell/`
  return new RegExp(`(?<![\\w])${OLD_SCOPE}(\\\\?\\/)(${names.join("|")})(?![\\w-])`, "g")
}

/** Rewrites workspace package names to the new scope. */
function renameScope(text, re) {
  if (!re) return { text, n: 0 }
  let n = 0
  text = text.replace(re, (_, slash, name) => (n++, `${NEW_SCOPE}${slash}${name}`))
  return { text, n }
}

////////////////
// ## Helpers
////////////////

/** Runs `git` in the repo root, returns stdout. */
function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 })
}

/** Runs `yarn` in the repo root, output passed through;  with `soft`, a failure only warns. */
function yarn(args, soft = false) {
  try {
    execFileSync("yarn", args, { cwd: ROOT, stdio: "inherit" })
  } catch (error) {
    if (!soft) throw error
    console.log("  WARNING:  yarn failed;  see above")
  }
}

/** Prints `message` and exits 1. */
function die(message) {
  console.error(message)
  process.exit(1)
}

main()
