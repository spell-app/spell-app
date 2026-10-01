#!/usr/bin/env node
/**
 * Phase 4 codemod:  moves folders of `packages/spell/src` into their own workspace packages, one STEP at a time,
 * and rewrites every import to match.  The steps and what each moves / aliases are DATA, in `package-moves.json`.
 *
 * ## Run
 * - `node scripts/move-packages.mjs --list`                 -- the steps, in order
 * - `node scripts/move-packages.mjs <step> --dry-run`       -- print what would happen, change nothing
 * - `node scripts/move-packages.mjs <step>`                 -- do it, then `yarn install` (new workspaces) and
 *   review with `yarn ts` / `yarn test`.  Run the steps IN ORDER;  the table assumes earlier steps have run.
 * - Idempotent:  re-running a finished step moves and rewrites nothing.
 *
 * ## Undo
 * - Nothing is committed by this script, so `git reset --hard && git clean -fd packages types` (from a tree
 *   that was clean before the run) puts everything back;  `git checkout tsconfig.base.json` undoes just the aliases.
 *
 * ## What a step does
 * 1. `git mv`s every TRACKED file under each `moves` source to its destination (history follows).  The LONGEST
 *    matching source wins, so a file entry overrides the folder it lives in.  A moved `*.test.ts` drags its
 *    `__snapshots__/<name>.test.ts.snap` along.
 * 2. Creates the package skeleton if missing:  `package.json`, `tsconfig.json`, `tsconfig.node.json`,
 *    `vitest.config.ts`, `CLAUDE.md`, a stub `AGENTS.md` (`DOCME`).  `dependencies` is left EMPTY on purpose:
 *    the fix step fills it in.
 * 3. Adds the step's `#alias` + `#alias/*` to `tsconfig.base.json` `paths` (never removes any, except the
 *    last step's `removeAliasPaths`).
 * 4. Rewrites module specifiers in every `.ts` `.tsx` `.mts` `.mjs` `.js` under `packages/` and the repo root's
 *    `vite.*.ts` (minus `excluded` paths, `node_modules`, `dist*`):
 *    - `~/...` alias specifiers, INCLUDING inside comments / docstrings / strings, longest prefix first,
 *      e.g. `` Use `import "~/languages/rulex"` ``.  An alias rule may be limited to files under a folder
 *      (`onlyInFilesUnder`, judged by the file's NEW location).
 *    - RELATIVE specifiers (`from`, `import()`, `import "..."`, `vi.mock()` ...) whose importer or target moved:
 *      re-pointed, and turned into the target package's `#alias` form when they now cross a package boundary.
 *      An importer outside a package's `src/` (repo root, `vite.*.config.ts`, `scripts/`) always gets a relative
 *      path:  vite and node load those before any `tsconfig` alias exists, and `#x` then fails as a package import.
 * 5. Prints a summary:  files moved, files rewritten, specifiers rewritten.
 */
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, posix, resolve } from "node:path"

const ROOT = resolve(import.meta.dirname, "..")
const TABLE = JSON.parse(readFileSync(join(ROOT, "scripts/package-moves.json"), "utf8"))
const SCRIPT_EXT = /\.(?:ts|tsx|mts|mjs|js)$/
const RESOLVE_EXTS = [".ts", ".tsx", ".mts", ".js", ".mjs", ".jsx", ".json", ".css"]

main()

////////////////
// ## Entry
////////////////

/** Parses the command line and runs one step (or lists them). */
function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")
  const names = args.filter((arg) => !arg.startsWith("--"))
  if (args.includes("--list") || names.length === 0) {
    for (const step of TABLE.steps) console.log(`${step.name.padEnd(12)} ${step.package ?? step.alias ?? ""}`)
    return
  }
  for (const name of names) {
    const step = TABLE.steps.find((s) => s.name === name)
    if (!step) die(`unknown step "${name}";  try --list`)
    runStep(step, dryRun)
  }
}

/** Plans and (unless `dryRun`) performs one step. */
function runStep(step, dryRun) {
  const tracked = git(["ls-files", "-z"]).split("\0").filter(Boolean)
  const fileMap = planMoves(step, tracked)
  const scan = git(["ls-files", "-z", "-co", "--exclude-standard"])
    .split("\0")
    .filter((file) => file && isScanned(file) && existsSync(join(ROOT, file)))
  const aliasable = aliasablePackages(step)
  const stats = { moved: fileMap.size, rewrittenFiles: 0, specifiers: 0 }
  const writes = []

  for (const file of scan) {
    const oldText = readFileSync(join(ROOT, file), "utf8")
    const newFile = fileMap.get(file) ?? file
    const result = { count: 0 }
    let text = rewriteAliases(oldText, newFile, step, result)
    text = rewriteRelatives(text, file, newFile, step, fileMap, aliasable, result)
    if (text !== oldText) {
      writes.push([newFile, text])
      stats.rewrittenFiles++
      stats.specifiers += result.count
    }
  }

  console.log(`${dryRun ? "[dry run] " : ""}step ${step.name}`)
  if (dryRun) {
    for (const [from, to] of fileMap) console.log(`  mv ${from} -> ${to}`)
    for (const [file] of writes) console.log(`  rewrite ${file}`)
  } else {
    for (const [from, to] of fileMap) {
      mkdirSync(dirname(join(ROOT, to)), { recursive: true })
      git(["mv", from, to])
    }
    for (const from of fileMap.keys()) pruneEmptyDirs(posix.dirname(from))
    for (const [file, text] of writes) writeFileSync(join(ROOT, file), text)
    writeSkeleton(step)
    writeNewFiles(step)
    renamePackage(step)
    editTsconfigBase(step)
    editTsconfigIncludes(step)
  }
  console.log(
    `  files moved: ${stats.moved}\n  files rewritten: ${stats.rewrittenFiles}\n  specifiers rewritten: ${stats.specifiers}`
  )
  if (!dryRun && step.package && stats.moved) console.log(`  next:  yarn install   (new / renamed workspace)`)
}

////////////////
// ## Moves
////////////////

/**
 * `Map` of old path -> new path for every tracked file the step moves.
 * - Longest `from` wins;  a source that equals its destination is skipped, as is one already moved.
 * - Throws if a destination exists and isn't itself being moved away (we would clobber it).
 */
function planMoves(step, tracked) {
  const moves = step.moves.filter(([from, to]) => from !== to).sort((a, b) => b[0].length - a[0].length)
  const trackedSet = new Set(tracked)
  const map = new Map()
  for (const file of tracked) {
    for (const [from, to] of moves) {
      if (file === from || file.startsWith(from + "/")) {
        map.set(file, to + file.slice(from.length))
        break
      }
    }
  }
  // snapshots of explicitly moved test files
  for (const [from, to] of moves) {
    if (!from.endsWith(".test.ts")) continue
    const snap = (path) => `${posix.dirname(path)}/__snapshots__/${posix.basename(path)}.snap`
    if (trackedSet.has(snap(from))) map.set(snap(from), snap(to))
  }
  for (const [from, to] of map) {
    if (existsSync(join(ROOT, to)) && !map.has(to)) die(`${step.name}: would overwrite ${to} (from ${from})`)
  }
  return map
}

/** New path of `path` (a file, or a folder / extension-less spec) under the step's moves, else itself. */
function mapPath(path, fileMap, step) {
  const exact = fileMap.get(path)
  if (exact) return exact
  const moves = step.moves.filter(([from, to]) => from !== to).sort((a, b) => b[0].length - a[0].length)
  for (const [from, to] of moves) if (path === from || path.startsWith(from + "/")) return to + path.slice(from.length)
  return path
}

////////////////
// ## Specifier rewriting
////////////////

/**
 * Rewrites `~/...` tokens by the step's alias rules, wherever they appear (code, comments, strings).
 * - Token must follow a non-word, non-path char, so `foo~/x`, `a/~/x` and `~/.local` are left alone.
 */
function rewriteAliases(text, newFile, step, result) {
  const rules = (step.aliases ?? [])
    .filter((rule) => !rule.onlyInFilesUnder || newFile.startsWith(rule.onlyInFilesUnder))
    .sort((a, b) => b.from.length - a.from.length)
  if (!rules.length) return text
  return text.replace(/(?<![\w$./~@-])(~\/[\w.\-/]*)/g, (token) => {
    const dots = token.match(/\.*$/)[0] // sentence-ending period
    const body = dots ? token.slice(0, -dots.length) : token
    for (const rule of rules) {
      if (body === rule.from || body.startsWith(rule.from + "/")) {
        result.count++
        return rule.to + body.slice(rule.from.length) + dots
      }
    }
    return token
  })
}

/**
 * Re-points relative module specifiers whose importer or target moved.
 * - Resolves against the OLD tree (nothing has moved yet when this runs).
 * - Crossing into another package that has a `#alias` => alias form;  else a fresh relative path.
 */
function rewriteRelatives(text, oldFile, newFile, step, fileMap, aliasable, result) {
  const re = /(\b(?:from|import|mock|doMock|importActual|importOriginal|require)\s*\(?\s*)(["'])(\.\.?(?:\/[^"'\n]*)?)\2/g
  return text.replace(re, (whole, lead, quote, spec) => {
    const [specPath, query = ""] = spec.split(/(?=\?)/, 2)
    const target = resolveSpec(oldFile, specPath)
    const targetMoved = target.file ? fileMap.has(target.file) : mapPath(target.base, fileMap, step) !== target.base
    if (newFile === oldFile && !targetMoved) return whole

    const newTarget = target.file ? mapPath(target.file, fileMap, step) : null
    const newBase = newTarget ? mappedBaseFor(target, newTarget) : mapPath(target.base, fileMap, step)
    const barrel = newTarget && step.barrelAliases?.[newTarget]
    const next = (barrel || specifierFor(newFile, newBase, aliasable)) + query
    if (next === spec) return whole
    result.count++
    return `${lead}${quote}${next}${quote}`
  })
}

/** Applies the spec's original spelling (`kind`) to a resolved file path `file`. */
function mappedBaseFor(target, file) {
  switch (target.kind) {
    case "exact":
      return file
    case "ext":
      return file.endsWith(target.ext) ? file.slice(0, -target.ext.length) : file
    case "js":
      return file.replace(/\.(?:ts|tsx|mts)$/, target.jsExt)
    case "index":
      return /\/index\.[a-z]+$/.test(file) ? posix.dirname(file) : file.replace(/\.[a-z]+$/, "")
    default:
      return file
  }
}

/** Resolves `spec` (relative, no query) from `oldFile` against the real tree:  `{ file, kind, ext, base }`. */
function resolveSpec(oldFile, spec) {
  const base = posix.normalize(posix.join(posix.dirname(oldFile), spec))
  const isFile = (path) => existsSync(join(ROOT, path)) && statSync(join(ROOT, path)).isFile()
  if (isFile(base)) return { file: base, kind: "exact", base }
  for (const ext of RESOLVE_EXTS) if (isFile(base + ext)) return { file: base + ext, kind: "ext", ext, base }
  const js = base.match(/\.(m?js)$/)
  if (js) {
    for (const ext of [".ts", ".tsx", ".mts"]) {
      if (isFile(base.slice(0, -js[0].length) + ext)) {
        return { file: base.slice(0, -js[0].length) + ext, kind: "js", jsExt: js[0], base }
      }
    }
  }
  for (const ext of RESOLVE_EXTS) {
    if (isFile(`${base}/index${ext}`)) return { file: `${base}/index${ext}`, kind: "index", base }
  }
  return { file: null, kind: "none", base }
}

/**
 * Specifier from `newFile` to `newBase`:  `#alias/...` across a package boundary into an aliased package's
 * `src/`, else relative.
 * - Importers outside any package (repo root) stay relative.
 */
function specifierFor(newFile, newBase, aliasable) {
  const importerPkg = packageOf(newFile)
  const targetPkg = packageOf(newBase)
  const importerInSrc = importerPkg && newFile.startsWith(`packages/${importerPkg}/src/`)
  if (importerInSrc && targetPkg && importerPkg !== targetPkg && aliasable.has(targetPkg)) {
    const srcDir = `packages/${targetPkg}/src`
    if (newBase === srcDir || newBase.startsWith(srcDir + "/")) {
      let rest = newBase.slice(srcDir.length)
      if (rest === "/index") rest = ""
      return `#${targetPkg}${rest}`
    }
  }
  const rel = posix.relative(posix.dirname(newFile), newBase)
  return rel.startsWith(".") ? rel : `./${rel}`
}

/** Package folder name of a repo-relative path (`packages/<name>/...`), else `null`. */
function packageOf(path) {
  return path.match(/^packages\/([^/]+)\//)?.[1] ?? null
}

/** Folder names of packages that have a `#alias` in `tsconfig.base.json` once this step's own has been added. */
function aliasablePackages(step) {
  const base = readFileSync(join(ROOT, "tsconfig.base.json"), "utf8")
  const set = new Set([...base.matchAll(/^\s*"#([\w-]+)":/gm)].map((m) => m[1]))
  if (step.alias) set.add(step.alias.slice(1))
  return set
}

/** Which files get rewritten:  our script types, outside the excluded paths and `node_modules` / `dist*`. */
function isScanned(file) {
  if (!SCRIPT_EXT.test(file)) return false
  if (!file.startsWith("packages/") && !/^vite\.[\w.]+\.ts$/.test(file) && !file.startsWith("types/")) return false
  if (TABLE.excluded.some((path) => file === path || file.startsWith(path))) return false
  return !file.split("/").some((part) => part === "node_modules" || part.startsWith("dist"))
}

////////////////
// ## Package skeleton and config edits
////////////////

/** Creates the step's package files that are missing (never overwrites). */
function writeSkeleton(step) {
  if (!step.package) return
  const dir = join(ROOT, step.dir)
  mkdirSync(dir, { recursive: true })
  const util = JSON.parse(readFileSync(join(ROOT, "packages/util/package.json"), "utf8"))
  const spellPackage = JSON.parse(readFileSync(join(ROOT, "packages/spell/package.json"), "utf8"))
  const devDependencies = { ...util.devDependencies }
  delete devDependencies["@vitest/browser-playwright"]
  delete devDependencies.playwright
  const pkg = {
    name: step.package,
    version: spellPackage.version,
    private: true,
    type: "module",
    scripts: util.scripts,
    dependencies: {},
    devDependencies,
    engines: util.engines,
    packageManager: util.packageManager
  }
  putIfMissing(join(dir, "package.json"), JSON.stringify(pkg, null, 2) + "\n")

  const spellTsconfig = JSON.parse(stripJsonComments(readFileSync(join(ROOT, "packages/spell/tsconfig.json"), "utf8")))
  const tsconfig = {
    extends: "../../tsconfig.base.json",
    // `types` is explicit because TS 6+ defaults it to `[]`:  `spell` only gets node's globals today through
    // `src/vite-env.d.ts` -> `vite/client`, which does not travel with the moved code
    compilerOptions: { ...spellTsconfig.compilerOptions, types: ["node", "vite/client"] },
    include: ["src", "../../types"]
  }
  putIfMissing(join(dir, "tsconfig.json"), inlineArrays(JSON.stringify(tsconfig, null, 2)) + "\n")

  const nodeInclude = [...(step.nodeInclude ?? ["vitest.config.ts"]), "../../vite.decorators.ts", "../../vite.packageVersion.ts", "../../types"]
  // NOTE: no `extends`:  config files import each other RELATIVELY (see "What a step does"), and with the alias
  // table `../../types` would drag the whole `spell` source into this tiny program
  const nodeTsconfig = {
    compilerOptions: {
      target: "ES2022",
      lib: ["ES2023"],
      module: "ESNext",
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      types: ["node"]
    },
    include: nodeInclude
  }
  putIfMissing(join(dir, "tsconfig.node.json"), inlineArrays(JSON.stringify(nodeTsconfig, null, 2)) + "\n")

  putIfMissing(
    join(dir, "vitest.config.ts"),
    `import { defineConfig } from "vitest/config"

import { standardDecorators } from "../../vite.decorators.ts"
import { packageVersion } from "../../vite.packageVersion.ts"

/**
 * DOCME: vitest config for \`${step.package}\`.
 * - Aliases (\`#spell-util\` ...) come from the repo root's \`tsconfig.base.json\`, through \`resolve.tsconfigPaths\`.
 * - \`standardDecorators()\` lowers standard decorators:  vite 8's own transform (oxc) doesn't.
 */
export default defineConfig({
  plugins: [standardDecorators(), packageVersion()],
  resolve: { tsconfigPaths: true }
})
`
  )
  putIfMissing(
    join(dir, "CLAUDE.md"),
    readFileSync(join(ROOT, "packages/util/CLAUDE.md"), "utf8")
  )
  putIfMissing(
    join(dir, "AGENTS.md"),
    `# AGENTS.md

DOCME:  what \`${step.package}\` is, its \`${step.alias}\` import alias, and what is local to it.
Sections here EXTEND the repo root's \`AGENTS.md\` ("As the root's, plus:").
`
  )
}

/** Writes the step's `newFiles` (path -> text) if missing. */
function writeNewFiles(step) {
  for (const [path, text] of Object.entries(step.newFiles ?? {})) {
    mkdirSync(dirname(join(ROOT, path)), { recursive: true })
    putIfMissing(join(ROOT, path), text)
  }
}

/** Renames the package in its own `package.json` and in every sibling's dependency list. */
function renamePackage(step) {
  const rename = step.renamePackage
  if (!rename) return
  const files = git(["ls-files", "-z", "packages/*/package.json"]).split("\0").filter(Boolean)
  for (const pkgJson of files.filter((file) => !TABLE.excluded.some((path) => file.startsWith(path)))) {
    const file = join(ROOT, pkgJson)
    const text = readFileSync(file, "utf8")
    const next = text.replaceAll(`"${rename.from}"`, `"${rename.to}"`)
    if (next !== text) writeFileSync(file, next)
  }
}

/** Adds the step's `#alias` / `#alias/*` to `tsconfig.base.json` (after the last `#` entry), and removes `removeAliasPaths`. */
function editTsconfigBase(step) {
  const file = join(ROOT, "tsconfig.base.json")
  let lines = readFileSync(file, "utf8").split("\n")
  if (step.alias && !lines.some((line) => line.includes(`"${step.alias}":`))) {
    const dir = step.dir ?? `packages/${step.alias.slice(1)}`
    const entry = step.entry ?? "index.ts"
    const last = lines.map((line) => /^\s*"#[^"]+":/.test(line)).lastIndexOf(true)
    lines.splice(last + 1, 0, `      "${step.alias}": ["./${dir}/src/${entry}"],`, `      "${step.alias}/*": ["./${dir}/src/*"],`)
  }
  for (const key of step.removeAliasPaths ?? []) lines = lines.filter((line) => !line.trimStart().startsWith(`"${key}":`))
  if (step.removeAliasPaths) {
    lines = lines.filter((line) => !/^\s*\/\/ `(?:cli|spell)`\s*$/.test(line))
    lines = lines.map((line) =>
      line.includes("// ## Per-package aliases, until each becomes a `#` one (Phase 4)")
        ? line.replace("Per-package aliases, until each becomes a `#` one (Phase 4)", "`ui`:  not yet a shared `#` package")
        : line
    )
  }
  writeFileSync(file, lines.join("\n"))
}

/** Adds / removes entries in the `include` array of the named packages' `tsconfig.json`. */
function editTsconfigIncludes(step) {
  const spec = step.tsconfigInclude
  if (!spec) return
  for (const name of spec.packages) {
    const file = join(ROOT, "packages", name, "tsconfig.json")
    const text = readFileSync(file, "utf8")
    const next = text.replace(/"include":\s*\[([^\]]*)\]/, (_, body) => {
      const items = JSON.parse(`[${body}]`).filter((item) => !spec.remove.includes(item))
      if (!items.includes(spec.add)) items.push(spec.add)
      return `"include": ${JSON.stringify(items).replaceAll('","', '", "')}`
    })
    if (next !== text) writeFileSync(file, next)
  }
}

////////////////
// ## Helpers
////////////////

/** `git` in the repo root, returning stdout. */
function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 })
}

/** Removes `dir` and its parents while they are empty:  `git mv` leaves the emptied source folders behind. */
function pruneEmptyDirs(dir) {
  while (dir && dir !== "." && dir !== "packages") {
    const abs = join(ROOT, dir)
    if (!existsSync(abs) || readdirSync(abs).length) return
    rmdirSync(abs)
    dir = posix.dirname(dir)
  }
}

/** Writes `text` to `file` unless it exists. */
function putIfMissing(file, text) {
  if (!existsSync(file)) writeFileSync(file, text)
}

/** Drops whole-line `//` comments so a `tsconfig.json` can be `JSON.parse`d. */
function stripJsonComments(text) {
  return text.replace(/^\s*\/\/.*$/gm, "")
}

/** Puts short arrays of strings back on one line, as oxfmt lays them out. */
function inlineArrays(json) {
  return json.replace(/\[\n((?:\s+"[^"\n]*",?\n)+)\s*\]/g, (_, body) => {
    const items = [...body.matchAll(/"[^"\n]*"/g)].map((m) => m[0])
    return `[${items.join(", ")}]`
  })
}

/** Prints `message` to stderr and exits non-zero. */
function die(message) {
  console.error(`move-packages: ${message}`)
  process.exit(1)
}
