import { execFileSync } from "child_process"
import { existsSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { dirname, join, resolve } from "path"
import { fileURLToPath } from "url"

/**
 * The repo's code folders:  what compiled spell is checked against.
 * - Found from this file's folder, `packages/spell/src/node/`.
 * - `srcDir`:  spell's `src/`
 * - `packagesDir`:  the repo's `packages/`
 * - `coreDir`:  `core`'s `src/`
 * - Spell's own folders only.
 *   Where PROJECTS are is spaces' (`$/spaces/server/node/environment`), which spell never imports.
 */
export const CODE_FOLDERS = (() => {
  const srcDir = resolve(fileURLToPath(import.meta.url), "..", "..")
  const packagesDir = resolve(srcDir, "..", "..")
  return { srcDir, packagesDir, coreDir: resolve(packagesDir, "core", "src") }
})()

/**
 * `tsc` on compiled spell's TypeScript (the `ts/solid` target):  what it says is wrong, by file.
 * - Checked against `@spell/core`'s SOURCE, with `core`'s own `strict` settings, `strictFunctionTypes` too.
 *   - So a collection helper's callback takes its collection's item type (`CollectionOf`),
 *     e.g. a `Card` for a `List<Card>` (epic `output-targets`, J14, T7).
 * - Solid's JSX, read as `app` reads its own (`jsx: "preserve"`, `jsxImportSource: "@solidjs/web"`).
 *   - `<ui-*>` tags are typed as `app` types them (`UI_JSX_TYPES`).
 * - Standard decorators (`@prop`, `@drawn`), never `experimentalDecorators`.
 * - A drawable type's element class (epic `drawable-thing` P10), `class CardElement extends SpellElement<Card>`:
 *   - checked against app's `SpellElement` and Spell UI's source
 *   - as `@spell/elements` is app's `spellElements.ts`
 *   - With the 2023 javascript library, which Spell UI's own files use (`toReversed()`, `findLast()`).
 * - `files`:  each file's name, e.g. `Solitaire.tsx`, and its code.
 *   - Written to a temp folder, checked together.
 *   - The folder links the repo's `node_modules`, so `solid-js` and `@solidjs/web` resolve from it.
 * - `projects`:  each project they import, `@spell/project/<id>`, as the path of its compiled output.
 * - Used by `spell compile` (on a `ts/solid` target) and spell's `typescript.test.ts`.
 * - NODE-ONLY:  runs the workspace's `tsc` (TypeScript 7) in a child process.
 */
export function typecheck(
  files: Record<string, string>,
  { projects = {} }: { projects?: Record<string, string> } = {}
): TypecheckResult {
  return inTscFolder(files, projects, (folder) => {
    const result: TypecheckResult = {
      errors: Object.fromEntries(Object.keys(files).map((name) => [name, []])),
      other: []
    }
    for (const line of runTsc(folder)) {
      const found = line.match(/^(.*?)\((\d+),(\d+)\): error (TS\d+): (.*)$/)
      const errors = found && result.errors[found[1]!]
      if (found && errors) errors.push({ line: +found[2]!, column: +found[3]!, code: found[4]!, message: found[5]! })
      else result.other.push(line)
    }
    return result
  })
}

/** What `typecheck()` found. */
export type TypecheckResult = {
  /** Each file's errors, by its name -- none:  `[]`. */
  errors: Record<string, TypecheckError[]>
  /** Errors anywhere else, e.g. in `core`'s own files, as `tsc` printed them. */
  other: string[]
}

/** One `tsc` error in a checked file:  1-based `line` and `column`, `code` e.g. `TS2345`. */
export type TypecheckError = { line: number; column: number; code: string; message: string }

/** `"135:18 TS18048 'core.RUNTIME' is possibly 'undefined'."` */
export function describeTypecheckError({ line, column, code, message }: TypecheckError): string {
  return `${line}:${column} ${code} ${message}`
}

/**
 * The first `node_modules/.bin/<name>` at or above `packages/spell/`, e.g. `tsc`.
 * - Why a search:  yarn hoists to the monorepo root.
 * - Throws if none, i.e. no `yarn install`.
 */
export function nodeBinary(name: string): string {
  const start = resolve(CODE_FOLDERS.srcDir, "..")
  for (let folder = start; ; folder = dirname(folder)) {
    const candidate = resolve(folder, `node_modules/.bin/${name}`)
    if (existsSync(candidate)) return candidate
    if (dirname(folder) === folder)
      throw new Error(`no node_modules/.bin/${name} at or above ${start}:  run \`yarn install\``)
  }
}

/** The `node_modules` folder yarn hoists to:  the one holding `.bin/tsc`. */
function nodeModulesDir(): string {
  return dirname(dirname(nodeBinary("tsc")))
}

/**
 * `<ui-*>` tags' JSX types:  `app`'s, which types each `ui-*` tag loosely (HTML attributes, plus anything else).
 * - `@spell-app/ui` ships no JSX types:  this is where the app's Solid code gets them,
 *   so compiled spell's `<ui-button>` checks the same way.
 * - A declaration file only:  nothing of `app`'s runs here.
 */
const UI_JSX_TYPES = "app/src/solid/solid.types.ts"

/**
 * What compiled TypeScript imports as `@spell/elements`:  app's `SpellElement`, and Spell UI's `E`.
 * - Its source, for its types:  nothing of `app`'s runs here.
 */
const SPELL_ELEMENTS_SOURCE = "app/src/runner/spellElements.ts"

/**
 * A `tsconfig.json` checking `names`, with `@spell/core` pointing at `core`'s source.
 * - `core`'s settings, plus Solid's JSX and `<ui-*>`'s JSX types -- see `typecheck()`.
 * - `@spell/elements` pointing at app's source.
 * - The aliases Spell UI's files import each other by:  `$/spell-element` too, which Spell UI's core re-exports.
 */
function tsconfig(names: string[], projects: Record<string, string>) {
  const { packagesDir, coreDir } = CODE_FOLDERS
  const repo = resolve(packagesDir, "..")
  const imported = Object.fromEntries(Object.entries(projects).map(([id, path]) => [`@spell/project/${id}`, [path]]))
  return {
    extends: resolve(coreDir, "..", "tsconfig.json"),
    compilerOptions: {
      paths: {
        "@spell/core": [`${coreDir}/index.ts`],
        "$/util": [`${packagesDir}/util/src/index.ts`],
        "$/util/*": [`${packagesDir}/util/src/*`],
        "$/core": [`${coreDir}/index.ts`],
        "$/core/*": [`${coreDir}/*`],
        "@spell/elements": [resolve(packagesDir, SPELL_ELEMENTS_SOURCE)],
        "$/spell-element": [`${packagesDir}/spell-element/src/index.ts`],
        "$/spell-element/*": [`${packagesDir}/spell-element/src/*`],
        "$/ui": [`${packagesDir}/ui/src/index.ts`],
        "$/ui/*": [`${packagesDir}/ui/src/*`],
        // Spell UI's families, outside its `src/` (as `tsconfig.base.json`):  longer than `$/ui/*`, so it wins
        "$/ui/components/*": [`${packagesDir}/ui/components/*`],
        ...imported
      },
      lib: ["ES2023", "DOM", "DOM.Iterable"],
      jsx: "preserve",
      jsxImportSource: "@solidjs/web",
      // the repo's global types (`Prettify` ...), through the folder's `node_modules` link;  `vite/client`:  `core`
      // uses none of it (the toolchain's types bring it all the same)
      types: ["node", "@spell-app/toolchain/types"],
      // `node_modules` too:  a scoped package's types (`@spell-app/toolchain/types`) are looked up only there
      typeRoots: [`${repo}/node_modules/@types`, `${repo}/node_modules`],
      noUnusedLocals: false
    },
    files: [...names, resolve(packagesDir, UI_JSX_TYPES)],
    // none:  `files` only (else `core`'s own `include` would be inherited)
    include: []
  }
}

/**
 * `run(folder)`, with `files` written into a new temp folder, and a `tsconfig.json` for them (`tsconfig()`).
 * - The folder is removed after.
 * - The folder links the repo's `node_modules`, so `solid-js` and `@solidjs/web` resolve from it.
 */
function inTscFolder<T>(
  files: Record<string, string>,
  projects: Record<string, string>,
  run: (folder: string) => T
): T {
  const folder = mkdtempSync(join(tmpdir(), "spell-tsc-"))
  try {
    // a link, NOT a copy:  `rmSync()` below removes the link, never what it points to
    symlinkSync(nodeModulesDir(), join(folder, "node_modules"), "dir")
    for (const [name, code] of Object.entries(files)) writeFileSync(join(folder, name), code)
    writeFileSync(join(folder, "tsconfig.json"), JSON.stringify(tsconfig(Object.keys(files), projects), null, 2))
    return run(folder)
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
}

/**
 * `tsc`'s error lines for the project in `folder`, run there, so a file's are `Solitaire.tsx(...)`;  none if clean.
 */
function runTsc(folder: string): string[] {
  try {
    execFileSync(nodeBinary("tsc"), ["-p", "tsconfig.json", "--pretty", "false"], {
      cwd: folder,
      encoding: "utf8"
    })
    return []
  } catch (error) {
    const { stdout = "", stderr = "" } = error as { stdout?: string; stderr?: string }
    return `${stdout}${stderr}`.split("\n").filter((line) => line.includes("error TS"))
  }
}
