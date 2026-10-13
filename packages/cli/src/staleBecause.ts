import { readdirSync, statSync } from "fs"
import { basename, join, relative } from "path"

import environment from "$/spaces/server/node/environment"
import { SP } from "$/spell"
import { LSP } from "$/lsp"

/**
 * Why `project`'s build is out of date, e.g. `"Card.spell changed since"`;  `undefined` when it's up to date.
 * - What `spell compile --stale` asks of each project, and of each project it imports.
 * - Out of date when one of the files it BUILDS is missing, or anything it's built FROM changed since the oldest of
 *   them.
 * - The files it builds:
 *   - each target's output (`project.targets`), e.g. `Solitaire.spell.js`, `Solitaire.lib.ts`
 *   - its declarations and words, e.g. `Solitaire.declarations.json`, `Solitaire.en.js`
 *   - NOT its scope pack:  only a clean compile writes one, so a project with errors would never be up to date
 * - What it's built from:
 *   - its own files (its index's manifest) and its `project.json`
 *   - each project it imports:  that one's declarations, which parsing reads
 *     - one imported with `source: true`:  that one's files and `project.json`, as they compile into ours
 *   - spell itself, `COMPILER_SOURCES`:  after a change to the compiler, every project is out of date
 * - By modification time, as `make` does:  a file saved unchanged still counts as changed.
 * - SIDE EFFECT:  loads `project`, and any project it imports with `source: true`.
 */
export async function staleBecause(project: SP.SpellProject): Promise<string | undefined> {
  await project.load(undefined)
  const built = [
    ...project.targets.map((target) => project.outputFileFor(target)),
    project.declarationsFile,
    project.wordsFile
  ].map((file) => file.location.serverPath)
  const missing = built.find((path) => !modifiedAt(path))
  if (missing) return `no ${basename(missing)}`
  const builtAt = Math.min(...built.map((path) => modifiedAt(path)!))

  for (const source of await sourcesOf(project)) {
    if ((modifiedAt(source) ?? 0) > builtAt) return `${relative(project.location.serverPath, source)} changed since`
  }
  for (const imported of LSP.ScopeExplorer.importedProjects(project)) {
    const declarations = imported.declarationsFile.location.serverPath
    if ((modifiedAt(declarations) ?? 0) > builtAt) return `${imported.projectId}'s declarations changed since`
  }
  if (compilerChangedAt() > builtAt) return "spell's compiler changed since"
  return undefined
}

/**
 * Spell's compiler:  what decides what a project builds to, as folders and files under `packages/`.
 * - the parser and its writers, spell's rules, the language server's scope packs, Python's writers
 * - core's built-in types' declarations, which every project parses against
 * - NOT core's runtime:  compiled code imports it, so a change to it needs no rebuild
 */
export const COMPILER_SOURCES = ["parser/src", "spell/src", "lsp/src", "py/ts", "core/spellCore.declarations.json"]

////////////////
// ## Helpers
////////////////

/** Paths on disk of what `project` is built from, besides its imports' declarations:  see `staleBecause()`. */
async function sourcesOf(project: SP.SpellProject): Promise<string[]> {
  const sourceImports = project.projectImports.filter((it) => it.source).map((it) => new SP.SpellProject(it.projectId))
  const sources: string[] = []
  for (const each of [project, ...sourceImports]) {
    await each.load(undefined)
    sources.push(SP.SpellLocation.getFileLocation(each.projectId, SP.PROJECT_FILE).serverPath)
    for (const entry of Object.values(each.manifest)) sources.push(entry.location!.serverPath)
  }
  return sources
}

/** When file `path` last changed, in ms;  `undefined` when it isn't there. */
function modifiedAt(path: string): number | undefined {
  return statSync(path, { throwIfNoEntry: false })?.mtimeMs
}

/** When anything in `COMPILER_SOURCES` last changed, in ms:  worked out once per process. */
function compilerChangedAt(): number {
  return (compilerChanged ??= newestIn(COMPILER_SOURCES.map((source) => join(environment.packagesDir, source))))
}
let compilerChanged: number | undefined

/** When the newest file at or under `paths` last changed, in ms;  dot files and `node_modules` left out. */
function newestIn(paths: string[]): number {
  let newest = 0
  for (const path of paths) walk(path)
  return newest

  /** fold `path`, or every file under it, into `newest` */
  function walk(path: string): void {
    const stat = statSync(path, { throwIfNoEntry: false })
    if (!stat) return
    if (!stat.isDirectory()) {
      newest = Math.max(newest, stat.mtimeMs)
      return
    }
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue
      walk(join(path, entry.name))
    }
  }
}
