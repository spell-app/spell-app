import { execFileSync } from "child_process"
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { dirname, join, resolve } from "path"

import environment from "$/spell/node/environment"

/**
 * `tsc` on compiled spell's TypeScript (the `ts/solid` target):  what it says is wrong, by file.
 * - Checked against `@spell/core`'s SOURCE, with `core`'s own `strict` settings -- but NOT `strictFunctionTypes`:
 *   `core` types every callback's item `unknown`, so a callback taking a `Card` couldn't be passed to it (epic
 *   `output-targets`, J14).
 * - `files`:  each file's name, e.g. `Solitaire.ts`, and its code.  Written to a temp folder, checked together.
 * - `projects`:  each project they import, `@spell/project/<id>`, as the path of its compiled output.
 * - Used by `spell compile` (on a `ts/solid` target) and spell's `typescript.test.ts`.
 * - NODE-ONLY:  runs the workspace's `tsc` (TypeScript 7) in a child process.
 */
export function typecheck(
  files: Record<string, string>,
  { projects = {} }: { projects?: Record<string, string> } = {}
): TypecheckResult {
  const folder = mkdtempSync(join(tmpdir(), "spell-tsc-"))
  try {
    for (const [name, code] of Object.entries(files)) writeFileSync(join(folder, name), code)
    writeFileSync(join(folder, "tsconfig.json"), JSON.stringify(tsconfig(Object.keys(files), projects), null, 2))
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
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
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

/** `"135:18 TS18048 'spellCore.RUNTIME' is possibly 'undefined'."` */
export function describeTypecheckError({ line, column, code, message }: TypecheckError): string {
  return `${line}:${column} ${code} ${message}`
}

/**
 * The first `node_modules/.bin/<name>` at or above `packages/spell/`, e.g. `tsc`.
 * - Why a search:  yarn hoists to the monorepo root.  Throws if none, i.e. no `yarn install`.
 */
export function nodeBinary(name: string): string {
  const start = resolve(environment.srcDir, "..")
  for (let folder = start; ; folder = dirname(folder)) {
    const candidate = resolve(folder, `node_modules/.bin/${name}`)
    if (existsSync(candidate)) return candidate
    if (dirname(folder) === folder)
      throw new Error(`no node_modules/.bin/${name} at or above ${start}:  run \`yarn install\``)
  }
}

/** A `tsconfig.json` checking `names`, with `@spell/core` pointing at `core`'s source. */
function tsconfig(names: string[], projects: Record<string, string>) {
  const { packagesDir, spellCoreDir } = environment
  const repo = resolve(packagesDir, "..")
  const imported = Object.fromEntries(Object.entries(projects).map(([id, path]) => [`@spell/project/${id}`, [path]]))
  return {
    extends: resolve(spellCoreDir, "..", "tsconfig.json"),
    compilerOptions: {
      paths: {
        "@spell/core": [`${spellCoreDir}/index.ts`],
        "$/util": [`${packagesDir}/util/src/index.ts`],
        "$/util/*": [`${packagesDir}/util/src/*`],
        "$/core": [`${spellCoreDir}/index.ts`],
        "$/core/*": [`${spellCoreDir}/*`],
        ...imported
      },
      // `vite/client` isn't found from a temp folder:  `core` uses none of it
      types: ["node"],
      typeRoots: [`${repo}/node_modules/@types`],
      noUnusedLocals: false,
      strictFunctionTypes: false
    },
    files: names,
    include: [`${repo}/types`]
  }
}

/** `tsc`'s error lines for the project in `folder`, run there, so a file's are `Solitaire.ts(...)`;  none if clean. */
function runTsc(folder: string): string[] {
  try {
    execFileSync(nodeBinary("tsc"), ["-p", "tsconfig.json", "--pretty", "false"], { cwd: folder, encoding: "utf8" })
    return []
  } catch (error) {
    const { stdout = "", stderr = "" } = error as { stdout?: string; stderr?: string }
    return `${stdout}${stderr}`.split("\n").filter((line) => line.includes("error TS"))
  }
}
