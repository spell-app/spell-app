import { basename } from "path"
import { fileURLToPath } from "url"

import { describeTypecheckError, typecheck } from "$/spell/node/typecheck"
import { describePyrightError, pyright } from "$/spell/node/pyright"
import { SP } from "$/spell"
import { CLI } from "$/cli"

/**
 * `spell compile <project...>`:  compile each project (or lone spell file), showing progress and errors on stderr.
 * - A project:  writes `<Project>.compiled.js`, `<Project>.declarations.json` and its words, `<Project>.en.js`
 *   (`SP.SpellWords`), as the app does, plus each other
 *   target's output, e.g. `<Project>.compiled.tsx` -- see `SP.TARGETS` -- or, with `--stdout`, prints one and
 *   writes nothing.  `--target <name>`:  that target, this run, instead of `project.json`'s.
 *   A target checked by `tsc` (`ts/solid`) is checked once written:  its errors are listed, but don't fail the
 *   compile -- see `typecheckTargets()`.
 *   Compiled with no errors, it also writes `<Project>.scopes.js`, as the language server does -- see
 *   `SpellDiskWorkspace.writeScopes()`.
 * - A `.spell` file:  prints its compiled javascript.  Writes nothing.
 * - Projects it imports that have never been compiled are compiled first -- see `CliSession.compileImports()`.
 *   `--force`:  ALL of them, even those already compiled.
 * - Returns the exit code:  `EXIT.ERRORS` if anything had errors.
 *   Warnings, e.g. a property with no type (`SP.SpellWarnings`), are listed under the errors, never counted:
 *   a project with only warnings compiles clean, its scope pack too.
 * - NOTE: a line which doesn't parse doesn't stop the compile -- it compiles to a `PARSE ERROR` comment.
 */
export async function compileCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.CompileOptions
): Promise<number> {
  const resolvedProjects = await session.projects(args)
  const status = new CLI.StatusReporter(session.isInteractive)
  // printed once `status` is done, so the two don't interleave
  const output: string[] = []
  let exitCode: number = CLI.EXIT.OK
  try {
    for (const resolved of resolvedProjects) {
      const ok =
        resolved.kind === "file"
          ? await compileFile(session, resolved.file, status, output)
          : await compileProject(session, resolved.project, status, output, options)
      if (!ok) exitCode = CLI.EXIT.ERRORS
    }
  } finally {
    status.finish()
  }
  for (const text of output) session.out(text)
  return exitCode
}

/**
 * Compile `project`, adding its output to `output` if `--stdout`.
 * - Returns whether it compiled without errors.
 */
async function compileProject(
  session: CLI.CliSession,
  project: SP.SpellProject,
  status: CLI.StatusReporter,
  output: string[],
  { stdout, force, target }: CLI.CompileOptions
): Promise<boolean> {
  const row = status.start(project.projectId)
  let targets: SP.Target[]
  try {
    await session.compileImports(project, status, force)
    await project.compile(undefined, { save: !stdout, targets: target ? [target] : undefined })
    targets = project.targets
  } catch (error) {
    status.done(row, "failed", error instanceof Error ? error.message : String(error))
    return false
  }
  // `--stdout`:  the target asked for, else the one that runs
  const printed = targets.find(({ name }) => name === target) ?? targets[0]!
  if (stdout) output.push(project.outputFileFor(printed).contents ?? "")
  const files = [...targets.map((it) => project.outputFileFor(it)), project.declarationsFile, project.wordsFile]
  const wrote = stdout ? [] : files.map((file) => file.location.serverPath)
  // a CLEAN compile writes its scope pack too, as the language server does
  if (!stdout && !session.problems(project).length) {
    wrote.push(await session.workspace.writeScopes(project, session.explorer))
  }
  const checked = stdout ? { counts: {}, details: [] } : typecheckTargets(session, project, targets)
  const notes = [
    ...Object.entries(checked.counts).map(
      ([checker, count]) => count && `${count} ${checker} error${count === 1 ? "" : "s"}`
    ),
    wrote.length && `wrote ${wrote.map((path) => session.relative(path)).join(", ")}`
  ]
  const note = notes.filter(Boolean).join(" · ") || undefined
  return !session.report(status, row, project, { note, details: checked.details }).length
}

/**
 * Each of `project`'s targets' checker on it, as just written:  `tsc` on `ts/solid`, `pyright` on `py` (epic
 * `python-target` P13).  Its errors, as lines under the project, e.g. `Solitaire.compiled.tsx:135:18  TS18048 ...`;
 * how many, by checker.
 * - Shown, NOT counted as the project's errors:  most come from the core's loose types, not the spell (epic
 *   `output-targets`, C5) -- the exit code stays the spell's.
 */
function typecheckTargets(
  session: CLI.CliSession,
  project: SP.SpellProject,
  targets: SP.Target[]
): { counts: Record<string, number>; details: string[] } {
  const details: string[] = []
  const counts: Record<string, number> = {}
  const projects = Object.fromEntries(
    Object.entries(CLI.importedOutputs(project)).map(([id, url]) => [id, fileURLToPath(url)])
  )
  for (const target of targets) {
    const checker = target.checkedBy
    if (!checker) continue
    const file = project.outputFileFor(target)
    const name = basename(file.location.serverPath)
    const path = session.relative(file.location.serverPath)
    const code = { [name]: file.contents ?? "" }
    const found =
      checker === "pyright"
        ? pyright(code).errors[name]!.map(describePyrightError)
        : typecheck(code, { projects }).errors[name]!.map(describeTypecheckError)
    counts[checker] = (counts[checker] ?? 0) + found.length
    details.push(...found.map((error) => `${path}:${error}`))
  }
  return { counts, details }
}

/**
 * Compile `file` in its project, adding its javascript to `output`.
 * - Returns whether its PROJECT parsed without errors -- a file's code can depend on any of them.
 */
async function compileFile(
  session: CLI.CliSession,
  file: SP.SpellFile,
  status: CLI.StatusReporter,
  output: string[]
): Promise<boolean> {
  const row = status.start(`${file.file}  (${file.project.projectId})`)
  try {
    await session.parse(file.project, status)
  } catch (error) {
    status.done(row, "failed", error instanceof Error ? error.message : String(error))
    return false
  }
  output.push(session.service.compiled(file))
  return !session.report(status, row, file.project).length
}
