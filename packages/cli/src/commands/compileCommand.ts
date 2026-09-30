import { SP } from "~/languages/spell"
import { CLI } from "~/cli"

/**
 * `spell compile <target...>`:  compile each target, showing progress and errors on stderr.
 * - A project:  writes `<Project>.compiled.js`, as the app does -- or, with `--stdout`, prints it and writes nothing.
 * - A `.spell` file:  prints its compiled javascript.  Writes nothing.
 * - Projects it imports that have never been compiled are compiled first -- see `CliSession.compileImports()`.
 * - Returns the exit code:  `EXIT.ERRORS` if anything had errors.
 * - NOTE: a line which doesn't parse doesn't stop the compile -- it compiles to a `PARSE ERROR` comment.
 */
export async function compileCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.CompileOptions
): Promise<number> {
  const targets = await session.targets(args)
  const status = new CLI.StatusReporter(session.isInteractive)
  // printed once `status` is done, so the two don't interleave
  const output: string[] = []
  let exitCode: number = CLI.EXIT.OK
  try {
    for (const target of targets) {
      const ok =
        target.kind === "file"
          ? await compileFile(session, target.file, status, output)
          : await compileProject(session, target.project, status, output, options)
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
  { stdout }: CLI.CompileOptions
): Promise<boolean> {
  const row = status.start(project.projectId)
  try {
    await session.compileImports(project, status)
    await project.compile(undefined, { save: !stdout })
  } catch (error) {
    status.done(row, "failed", error instanceof Error ? error.message : String(error))
    return false
  }
  if (stdout) output.push(project.outputFile.contents ?? "")
  const note = stdout ? undefined : `wrote ${session.relative(project.outputFile.location.serverPath)}`
  return !session.report(status, row, project, { note }).length
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
