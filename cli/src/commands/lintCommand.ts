import { SP } from "spell-lang/spell"
import { CLI } from "$/cli"

/**
 * `spell lint [projects...]`:  parse each project or file and list its errors -- writes nothing of its own.
 * - `spell check` until epic `repo-split` P13.
 * - Errors go to STDOUT, one per line (`path:line:col  message`), so they can be piped, e.g. to `grep`.
 *   `--json` prints them as a JSON array of `CLI.Problem`s instead.
 * - Progress and a count per project go to stderr.
 * - A `.spell` file:  parses its whole project -- it can't parse alone -- but lists only ITS errors.
 * - A project's EDITOR PAGES (`Card.editor.html`) too, against its types, after its spell
 *   (decision Q17;  `CLI.EditorPages`).
 *   - `--fix`:  puts each page right and writes it back,
 *     then lists what it did, one line each (`... fixed:  ...`), on stdout (with `--json`, on stderr).
 *   - What it can't put right is still an error.
 * - SIDE EFFECT:  compiles any project they import which has never been compiled --
 *   see `CliSession.compileImports()`.
 * - Returns the exit code:  `EXIT.ERRORS` if there were any.
 */
export async function lintCommand(session: CLI.CliSession, args: string[], options: CLI.LintOptions): Promise<number> {
  const resolvedProjects = await session.projects(args)
  const status = new CLI.StatusReporter(session.isInteractive)
  const problems: CLI.Problem[] = []
  const fixes: CLI.Problem[] = []
  try {
    for (const resolved of resolvedProjects) {
      if (resolved.kind === "file") {
        problems.push(...(await checkProject(session, resolved.file.project, resolved.file, status)))
        continue
      }
      problems.push(...(await checkProject(session, resolved.project, undefined, status)))
      const pages = await checkPages(session, resolved.project, status, options)
      problems.push(...pages.problems)
      fixes.push(...pages.fixes)
    }
  } finally {
    status.finish()
  }

  for (const fix of fixes) {
    if (options.json) session.err(session.problemLine(fix))
    else session.out(session.problemLine(fix))
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

/**
 * Check `project`'s editor pages against its types -- and with `--fix`, put them right:  see `CLI.EditorPages`.
 * - A row of its own on `status`, only when the project has pages.
 */
async function checkPages(
  session: CLI.CliSession,
  project: SP.SpellProject,
  status: CLI.StatusReporter,
  { fix }: CLI.LintOptions
): Promise<CLI.EditorPageResults> {
  const editorPages = new CLI.EditorPages(session, project)
  if (!editorPages.paths.length) return { pages: 0, problems: [], fixes: [] }
  const row = status.start(`${project.projectId}  (editor pages)`)
  const results = await editorPages.check({ fix })
  const { pages, problems, fixes } = results
  const note = [
    `${pages} page${pages === 1 ? "" : "s"}`,
    problems.length && `${problems.length} error${problems.length === 1 ? "" : "s"}`,
    fixes.length && `fixed ${fixes.length}`
  ]
  status.done(row, problems.length ? "errors" : "ok", note.filter(Boolean).join(" · "))
  return results
}
