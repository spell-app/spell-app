import { SP } from "$/spell"
import { CLI } from "$/cli"

/**
 * `spell check [projects...]`:  parse each project or file and list its errors -- writes nothing of its own.
 * - Errors go to STDOUT, one per line (`path:line:col  message`), so they can be piped, e.g. to `grep`.
 *   `--json` prints them as a JSON array of `CLI.Problem`s instead.
 * - Progress and a count per project go to stderr.
 * - A `.spell` file:  parses its whole project -- it can't parse alone -- but lists only ITS errors.
 * - SIDE EFFECT:  compiles any project they import which has never been compiled --
 *   see `CliSession.compileImports()`.
 * - Returns the exit code:  `EXIT.ERRORS` if there were any.
 */
export async function checkCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.CheckOptions
): Promise<number> {
  const resolvedProjects = await session.projects(args)
  const status = new CLI.StatusReporter(session.isInteractive)
  const problems: CLI.Problem[] = []
  try {
    for (const resolved of resolvedProjects) {
      const found =
        resolved.kind === "file"
          ? await checkProject(session, resolved.file.project, resolved.file, status)
          : await checkProject(session, resolved.project, undefined, status)
      problems.push(...found)
    }
  } finally {
    status.finish()
  }

  if (options.json) session.out(JSON.stringify(problems, null, 2))
  else for (const problem of problems) session.out(session.problemLine(problem))
  return problems.length ? CLI.EXIT.ERRORS : CLI.EXIT.OK
}

/** Parse `project`, and return its problems -- only `file`'s, if given. */
async function checkProject(
  session: CLI.CliSession,
  project: SP.SpellProject,
  file: SP.SpellFile | undefined,
  status: CLI.StatusReporter
): Promise<CLI.Problem[]> {
  const row = status.start(file ? `${file.file}  (${project.projectId})` : project.projectId)
  try {
    await session.parse(project, status)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    status.done(row, "failed", message)
    return [{ project: project.projectId, message }]
  }
  return session.report(status, row, project, { file, list: false })
}
