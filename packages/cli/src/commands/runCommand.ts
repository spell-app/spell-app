import { spawn } from "child_process"
import { mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { fileURLToPath, pathToFileURL } from "url"

import environment from "$/spell/node/environment"
import { SP } from "$/spell"
import { LSP } from "$/lsp"
import { CLI } from "$/cli"

/** Our own `src/` folder -- NOT `environment.srcDir`, which is the parser's. */
const CLI_SRC_DIR = resolve(fileURLToPath(import.meta.url), "..", "..")

/**
 * `spell run [project]`:  compile one project and run it under node -- its `print`s show as they happen.
 * - What needs a browser, e.g. `start the game`, is skipped there -- see `runProject.ts` -- and the project then
 *   opens in a browser instead, until `Ctrl-C`.  See `runInBrowser()`.
 * - `--browser`:  open it in a browser anyway;  `--no-browser`:  never.
 * - Returns the program's exit code.
 */
export async function runCommand(session: CLI.CliSession, args: string[], options: CLI.RunOptions): Promise<number> {
  const resolvedProjects = await session.projects(args)
  if (resolvedProjects.length > 1) throw new CLI.CliError("Run one project at a time -- `spell test` takes several")
  return runProjectAs("run", session, resolvedProjects[0]!, options)
}

/**
 * `spell test [projects...]`:  compile each project, then run each `test ...` function it declares, and report.
 * - `--name <text>`:  only tests whose names contain it, e.g. `deck`.
 * - `--watch`:  again whenever a project changes -- that's `spell watch --test`, see `watchCommand()`.
 * - Returns `EXIT.ERRORS` if any test failed, or any project didn't compile or load.
 */
export async function testCommand(session: CLI.CliSession, args: string[], options: CLI.TestOptions): Promise<number> {
  if (options.watch) return CLI.watchCommand(session, args, { ...options, test: true })
  let exitCode: number = CLI.EXIT.OK
  for (const resolved of await session.projects(args)) {
    if ((await runProjectAs("test", session, resolved, options)) !== CLI.EXIT.OK) exitCode = CLI.EXIT.ERRORS
  }
  return exitCode
}

/**
 * Compile `resolved`'s project and run it -- or its tests -- in a fresh node process, `runProject.ts`.
 * - Its compiled javascript goes to a temp file:  running writes nothing into the project.
 *   Projects it imports need their `<Project>.compiled.js`, compiling any which have none.
 * - Errors in the spell are listed, but it runs anyway:  a line which doesn't parse compiles to a comment.
 * - The child shares our terminal, so its output streams straight through.
 * - Returns the child's exit code.
 */
async function runProjectAs(
  mode: CLI.RunSpec["mode"],
  session: CLI.CliSession,
  resolved: CLI.ResolvedProject,
  options: CLI.TestOptions & CLI.RunOptions
): Promise<number> {
  const project = resolved.kind === "file" ? resolved.file.project : resolved.project
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

  const { exitCode, skipped } = await runCompiled(mode, project, options)
  const wantsBrowser = mode === "run" && options.browser !== false && (options.browser || skipped.length > 0)
  if (wantsBrowser && exitCode === CLI.EXIT.OK) return CLI.runInBrowser(session, project)
  return problems.length && exitCode === CLI.EXIT.OK ? CLI.EXIT.ERRORS : exitCode
}

/**
 * Run `project` as last compiled -- its `outputFile.contents` -- or its tests, in `runProject.ts`, a fresh node
 * process.  See `runProjectAs()`.
 * - Its javascript goes to a temp file, removed after.
 * - `capture`:  collect the child's output, rather than streaming it to our terminal -- e.g. for `spell watch --test`.
 * - Resolves to its exit code;  with `capture`, what it wrote to stdout and stderr, together;  and, for `run`, what
 *   it skipped which needs a browser -- see `CLI.RunReport`.
 */
export async function runCompiled(
  mode: CLI.RunSpec["mode"],
  project: SP.SpellProject,
  options: CLI.TestOptions,
  { capture = false }: { capture?: boolean } = {}
): Promise<ChildResult> {
  const name = project.projectName ?? project.projectId
  const code = project.outputFile.contents ?? ""
  return runCode(mode, name, code, { ...options, projects: importedOutputs(project), capture })
}

/**
 * Run `code`, project `name` compiled for any target, in `runProject.ts` -- see `runCompiled()`.
 * - `extension`:  of the temp file it runs from, `.mjs`;  `.mts` for TypeScript (`ts/solid`), which `tsx` strips.
 * - `projects`:  what it imports, by id -- see `importedOutputs()`.
 * - `dom`:  in a fake page, printing what it draws -- see `CLI.RunSpec`.
 * - Used by the core contract test, `contract.test.ts`, to run each target's code the same way.
 */
export async function runCode(
  mode: CLI.RunSpec["mode"],
  name: string,
  code: string,
  {
    extension = ".mjs",
    projects = {},
    capture = false,
    dom,
    ...options
  }: CLI.TestOptions & { extension?: string; projects?: Record<string, string>; capture?: boolean; dom?: boolean } = {}
): Promise<ChildResult> {
  const folder = mkdtempSync(resolve(tmpdir(), "spell-run-"))
  try {
    const entry = resolve(folder, `${name}.compiled${extension}`)
    writeFileSync(entry, code)
    const spec: CLI.RunSpec = {
      mode,
      name,
      entry: pathToFileURL(entry).href,
      projects,
      spellCore: pathToFileURL(resolve(environment.spellCoreDir, "index.ts")).href,
      verbose: options.verbose,
      filter: options.name,
      dom
    }
    return await runChild(spec, capture)
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
}

/** How a `runProject.ts` child went -- see `runCompiled()`. */
export type ChildResult = { exitCode: number; output: string; skipped: string[] }

/**
 * URL of the compiled javascript of each project `project` imports -- and what THEY import -- by id.
 * - For the child's `@spell/project/<id>` imports -- see `hooks.mjs` -- and `runInBrowser()`.
 */
export function importedOutputs(
  project: SP.SpellProject,
  outputs: Record<string, string> = {}
): Record<string, string> {
  for (const imported of LSP.ScopeExplorer.importedProjects(project)) {
    if (outputs[imported.projectId]) continue
    outputs[imported.projectId] = pathToFileURL(imported.outputFile.location.serverPath).href
    importedOutputs(imported, outputs)
  }
  return outputs
}

/**
 * Run `runProject.ts` for `spec` in a child node process, sharing our terminal -- or, with `capture`, collecting
 * its output.  Resolves to its exit code, what it captured, and what it skipped.
 * - `run` gets an IPC channel, for its `CLI.RunReport`.
 * - `tsx` compiles the runner and spell's runtime, with OUR `tsconfig.json` for `~/` paths --
 *   whatever the current folder.
 * - NOTE: `--verbose` reaches the child as `spec.verbose`:  ITS console isn't guarded, see `consoleGuard.ts`.
 */
function runChild(spec: CLI.RunSpec, capture: boolean): Promise<ChildResult> {
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
  const stdio: ("ignore" | "pipe" | "inherit" | "ipc")[] = capture
    ? ["ignore", "pipe", "pipe"]
    : ["inherit", "inherit", "inherit"]
  if (spec.mode === "run") stdio.push("ipc")
  return new Promise((done) => {
    const child = spawn(process.execPath, args, { stdio, env })
    let output = ""
    let skipped: string[] = []
    child.stdout?.on("data", (data) => (output += data))
    child.stderr?.on("data", (data) => (output += data))
    child.on("message", (report: CLI.RunReport) => (skipped = report.skipped))
    child.on("exit", (code, signal) => done({ exitCode: code ?? (signal ? 130 : CLI.EXIT.ERRORS), output, skipped }))
    child.on("error", (error) => done({ exitCode: CLI.EXIT.ERRORS, output: output + error.message, skipped }))
  })
}
