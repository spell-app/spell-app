import { spawn } from "child_process"
import { mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { fileURLToPath, pathToFileURL } from "url"

import environment from "#spell/node/environment"
import { SP } from "#spell"
import { LSP } from "#lsp"
import { CLI } from "#cli"

/** Our own `src/` folder -- NOT `environment.srcDir`, which is the parser's. */
const CLI_SRC_DIR = resolve(fileURLToPath(import.meta.url), "..", "..")

/**
 * `spell run <target>`:  compile one project and run it under node -- its `print`s show as they happen.
 * - What needs a browser, e.g. `start the game`, is skipped, with a note -- see `runProject.ts`.
 * - Returns the program's exit code.
 */
export async function runCommand(session: CLI.CliSession, args: string[], options: CLI.GlobalOptions): Promise<number> {
  const targets = await session.targets(args)
  if (targets.length > 1) throw new CLI.CliError("Run one project at a time -- `spell test` takes several")
  return runProjectAs("run", session, targets[0]!, options)
}

/**
 * `spell test <target...>`:  compile each project, then run each `test ...` function it declares, and report.
 * - Returns `EXIT.ERRORS` if any test failed, or any project didn't compile or load.
 */
export async function testCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.GlobalOptions
): Promise<number> {
  let exitCode: number = CLI.EXIT.OK
  for (const target of await session.targets(args)) {
    if ((await runProjectAs("test", session, target, options)) !== CLI.EXIT.OK) exitCode = CLI.EXIT.ERRORS
  }
  return exitCode
}

/**
 * Compile `target`'s project and run it -- or its tests -- in a fresh node process, `runProject.ts`.
 * - Its compiled javascript goes to a temp file:  running writes nothing into the project.
 *   Projects it imports need their `<Project>.compiled.js`, compiling any which have none.
 * - Errors in the spell are listed, but it runs anyway:  a line which doesn't parse compiles to a comment.
 * - The child shares our terminal, so its output streams straight through.
 * - Returns the child's exit code.
 */
async function runProjectAs(
  mode: CLI.RunSpec["mode"],
  session: CLI.CliSession,
  target: CLI.ResolvedTarget,
  options: CLI.GlobalOptions
): Promise<number> {
  const project = target.kind === "file" ? target.file.project : target.project
  const status = new CLI.StatusReporter(session.isInteractive)
  const row = status.start(`Compiling ${project.projectId}`)
  let problems: CLI.Problem[]
  try {
    await session.compileImports(project, status)
    await project.compile(undefined, { save: false })
    problems = session.report(status, row, project)
  } catch (error) {
    status.done(row, "failed", error instanceof Error ? error.message : String(error))
    return CLI.EXIT.ERRORS
  } finally {
    // a clean compile is just progress:  clear it off, so the program's output stands alone
    status.finish({ clear: status.rows.every((it) => it.state === "ok") })
  }

  const folder = mkdtempSync(resolve(tmpdir(), "spell-run-"))
  try {
    const entry = resolve(folder, `${project.projectName}.compiled.mjs`)
    writeFileSync(entry, project.outputFile.contents ?? "")
    const spec: CLI.RunSpec = {
      mode,
      name: project.projectName ?? project.projectId,
      entry: pathToFileURL(entry).href,
      projects: importedOutputs(project),
      spellCore: pathToFileURL(resolve(environment.spellCoreDir, "index.ts")).href,
      verbose: options.verbose
    }
    const exitCode = await runChild(spec)
    return problems.length && exitCode === CLI.EXIT.OK ? CLI.EXIT.ERRORS : exitCode
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
}

/**
 * URL of the compiled javascript of each project `project` imports -- and what THEY import -- by id.
 * - For the child's `@spell/project/<id>` imports -- see `hooks.mjs`.
 */
function importedOutputs(project: SP.SpellProject, outputs: Record<string, string> = {}): Record<string, string> {
  for (const imported of LSP.ScopeExplorer.importedProjects(project)) {
    if (outputs[imported.projectId]) continue
    outputs[imported.projectId] = pathToFileURL(imported.outputFile.location.serverPath).href
    importedOutputs(imported, outputs)
  }
  return outputs
}

/**
 * Run `runProject.ts` for `spec` in a child node process, sharing our terminal.  Resolves to its exit code.
 * - `tsx` compiles the runner and spell's runtime, with OUR `tsconfig.json` for `~/` paths --
 *   whatever the current folder.
 * - NOTE: `--verbose` reaches the child as `spec.verbose`:  ITS console isn't guarded, see `consoleGuard.ts`.
 */
function runChild(spec: CLI.RunSpec): Promise<number> {
  const runner = resolve(CLI_SRC_DIR, "runner")
  const args = [
    "--import",
    import.meta.resolve("tsx/esm"),
    "--import",
    pathToFileURL(resolve(runner, "hooks.mjs")).href,
    resolve(runner, "runProject.ts")
  ]
  const env = {
    ...process.env,
    SPELL_RUN: JSON.stringify(spec),
    TSX_TSCONFIG_PATH: resolve(CLI_SRC_DIR, "..", "tsconfig.json")
  }
  return new Promise((done) => {
    const child = spawn(process.execPath, args, { stdio: "inherit", env })
    child.on("exit", (code, signal) => done(code ?? (signal ? 130 : CLI.EXIT.ERRORS)))
    child.on("error", () => done(CLI.EXIT.ERRORS))
  })
}
