/**
 * `yarn scopes`:  write scope packs -- what `<spell-app>`'s Type Explorer shows with no parser.  See `LSP.ScopePack`.
 * - `yarn scopes @system:examples:Solitaire @examples/Calculator ...`:  each project's `<Project>.scopes.js`,
 *   beside its compiled output -- parsing it, and the projects it imports, first.
 * - `yarn scopes --builtins`:  the built-in types' pack, `src/spellCore/spellCore.scopes.js`.
 *   NOTE: OVERWRITES any hand edits there -- diff it before keeping.
 * - The language server writes a project's pack itself after each clean compile.
 *   TODO: `spell compile` should too, once the CLI branch is merged -- via `SpellDiskWorkspace.writeScopes()`.
 * - NODE ONLY, and NOT in the `~/lsp` barrel:  it runs the moment it's imported.
 */
// FIRST:  defines `__PACKAGE_VERSION__`, which vite would, before anything reads it
import "~/packageVersion.node"

import { writeFileSync } from "fs"
import { relative, resolve } from "path"

import environment from "~/environment"
import { SP } from "~/languages/spell"
import { LSP } from "~/lsp"
import { SpellDiskWorkspace } from "~/lsp/SpellDiskWorkspace"

const args = process.argv.slice(2)
if (!args.length) {
  process.stderr.write("usage:  yarn scopes <projectId...>  |  yarn scopes --builtins\n")
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

/** Write the scope pack of the project `arg` names -- a full id, or a root's alias, e.g. `@examples/Solitaire`. */
async function writeProject(arg: string): Promise<string> {
  const project = new SP.SpellProject(SP.SpellProject.projectIdForImport(arg))
  await project.load()
  return workspace.writeScopes(project, explorer)
}

/** Write the built-in types' pack to `src/spellCore/spellCore.scopes.js`. */
function writeBuiltIns(): string {
  const path = resolve(environment.srcDir, "spellCore", `spellCore${SP.SCOPES_JS_SUFFIX}`)
  writeFileSync(path, LSP.scopePackScript(explorer.exportBuiltIns()))
  return path
}
