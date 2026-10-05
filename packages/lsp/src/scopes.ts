/**
 * `yarn scopes`:  write scope packs -- what `<spell-app>`'s Type Explorer shows with no parser.  See `LSP.ScopePack`.
 * - `yarn scopes @system:examples:Solitaire @examples/Calculator ...`:  each project's `<Project>.scopes.js`,
 *   beside its compiled output -- parsing it, and the projects it imports, first.
 * - `yarn scopes --compile <projectId...>`:  compile each first, to `<Project>.compiled.js` -- in the order given,
 *   so a project another imports goes first.
 * - `yarn scopes --builtins`:  the built-in types' pack, `core`'s `src/spellCore.scopes.js`.
 *   GENERATED from `SP.BUILT_IN_TYPE_TABLE`, whose entries hold its docs:  edit those, then run this.
 * - The language server writes a project's pack itself after each clean compile, as do `spell compile` and
 *   `spell watch` (`packages/cli`) -- all through `SpellDiskWorkspace.writeScopes()`.
 * - NODE ONLY, and NOT in the `$/lsp` barrel:  it runs the moment it's imported.
 */
// FIRST:  defines `__PACKAGE_VERSION__`, which vite would, before anything reads it
import "$/spell/node/packageVersion.node"

import { writeFileSync } from "fs"
import { relative, resolve } from "path"

import environment from "$/spell/node/environment"
import { SP } from "$/spell"
import { LSP } from "$/lsp"
import { SpellDiskWorkspace } from "$/lsp/SpellDiskWorkspace"

const args = process.argv.slice(2).filter((arg) => arg !== "--compile")
const compile = args.length < process.argv.length - 2
if (!args.length) {
  process.stderr.write("usage:  yarn scopes [--compile] <projectId...>  |  yarn scopes --builtins\n")
  process.exit(1)
}

const workspace = new SpellDiskWorkspace()
const explorer = new LSP.ScopeExplorer(new LSP.SpellLanguageService(workspace))
let failed = false
for (const arg of args) {
  try {
    const path = arg === "--builtins" ? writeBuiltIns() : await writeProject(arg)
    process.stdout.write(`wrote ${relative(process.cwd(), path)}\n`)
  } catch (error) {
    failed = true
    process.stderr.write(`${arg}:  ${error instanceof Error ? error.message : String(error)}\n`)
  }
}
// NOTE: exits explicitly -- a parse can leave timers running, which would keep the process alive.
process.exit(failed ? 1 : 0)

/**
 * Write the scope pack of the project `arg` names -- a full id, or a root's alias, e.g. `@examples/Solitaire`.
 * - With `--compile`, compile it first -- throwing if it has parse errors, as the language server won't write
 *   its pack then either.
 */
async function writeProject(arg: string): Promise<string> {
  const project = new SP.SpellProject(SP.SpellProject.projectIdForImport(arg))
  await project.load()
  if (compile) {
    await workspace.track(project)
    await project.compile()
    // as the language server's `compileProject()` counts them
    const [first] = project.spellFiles
    const files = first ? explorer.service.projectInfo(first).files.filter((file) => file.errors) : []
    if (files.length) throw new Error(`parse errors in ${files.map((file) => file.file).join(", ")}`)
    process.stdout.write(`wrote ${relative(process.cwd(), project.outputFile.location.serverPath)}\n`)
  }
  return workspace.writeScopes(project, explorer)
}

/** Write the built-in types' pack to `core`'s `src/spellCore.scopes.js`. */
function writeBuiltIns(): string {
  const path = resolve(environment.spellCoreDir, `spellCore${SP.SCOPES_JS_SUFFIX}`)
  writeFileSync(path, LSP.scopePackScript(explorer.exportBuiltIns()))
  return path
}
