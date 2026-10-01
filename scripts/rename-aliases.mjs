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
 *    spell imports) are NOT workspace names and stay.
 * 5. `yarn install`, `yarn format` (oxfmt may re-sort imports / re-align tables).
 *
 * ## Skipped
 * `node_modules`, build output (`dist*`, `out`, `.cache`, `.astro`), `.yarn`, lockfiles, binary files,
 * `packages/spell/thoughts/**`, `packages/spell/graphify-out/**`, `PAPERCUTS.md` (a dated log), this script and the
 * historical Phase 4 codemod (`move-packages.mjs`, `package-moves.json`).
 */
import { execFileSync } from "node:child_process"
import { lstatSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"

const ROOT = resolve(import.meta.dirname, "..")
const NEW_SCOPE = "@spell-app"
const OLD_SCOPE = "@spell"

const SKIP_SEGMENT = /(^|\/)(node_modules|dist[^/]*|out|\.cache|\.yarn|\.git|\.astro)(\/|$)/
const SKIP_PREFIX = ["packages/spell/thoughts/", "packages/spell/graphify-out/"]
const SKIP_FILE = new Set([
  "PAPERCUTS.md",
  "yarn.lock",
  "package-lock.json",
  "scripts/rename-aliases.mjs",
  "scripts/move-packages.mjs",
  "scripts/package-moves.json"
])
const MAX_BYTES = 4_000_000

////////////////
// ## Entry
////////////////

/** Reads the repo, applies each step to an in-memory copy, prints a summary per step, writes unless `--dry-run`. */
function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")
  const files = loadFiles()
  const base = files.get("tsconfig.base.json")
  if (base === undefined) die("no tsconfig.base.json at the repo root")

  const aliasNames = packageAliasNames(base)
  const scopeNames = workspaceNames(files)
  const uiPending = /"\$test\/\*"|"\$\/\*"/.test(base)
  const uiEntries = uiEntryNames()
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
    yarn(["workspaces", "foreach", "-A", "--exclude", "spell-root", "run", "format"], true)
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
    "Every package's alias is `#name`\n  (`$/parser`, `$/spell-core`, `$/cli` ...);  `ui` is the exception, `$/` (and `$/ui/test/`), until it becomes `#ui`.\n  The one table is `tsconfig.base.json`.",
    "Every package's alias is `$/name`\n  (`$/parser`, `$/spell-core`, `$/ui` ...), `$` meaning `packages/`.  `ui` is no exception:  its test helpers are\n  `$/ui/test/...`.  The one table is `tsconfig.base.json`."
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
  [".claude/skills/solid-2/SKILL.md", ", #spell-util reactivity", ", `$/spell-util` reactivity"],
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
  //   \`$/parser/test\` / \`$/spell/test\` (test helpers), \`$/spell/node/...\` (node-only:  environment, files on disk).
  // - NOTE: every alias works from every package.  The one-way dependency rule is by convention:
  //   \`cli\` -> \`spell-app\` -> \`lsp\` -> \`spell\` -> \`parser\` / \`spell-core\` -> \`spell-util\` -> \`util\`, and
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
