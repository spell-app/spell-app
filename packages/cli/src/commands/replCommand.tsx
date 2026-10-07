import { render } from "ink"
import { createInterface } from "readline"

import { CLI } from "$/cli"

/**
 * `spell repl [project]`:  `spell parse`, a line at a time -- each line's match tree and javascript.
 * - Lines parse in one scope, so what a line declares, e.g. `x is 3`, later lines know.
 * - `project`:  parse inside that project's scope.  None:  only spell's own rules.
 * - In a terminal:  a live `<ReplScreen>`.  Otherwise, e.g. piped:  reads lines from stdin, and prints each
 *   result as `spell parse` does, with a blank line between.
 * - Returns the exit code:  piped, `EXIT.ERRORS` if any line failed.
 */
export async function replCommand(session: CLI.CliSession, args: string[], _options: CLI.GlobalOptions) {
  const [arg] = args
  const project = arg ? await CLI.projectFor(session, arg) : undefined
  const scope = CLI.lineScope(project)
  const parse = (text: string) => CLI.parseText(text, scope, { commit: true })

  if (session.isInteractive) {
    const title = `spell repl -- ${project ? `in ${project.projectId}` : "spell's own rules"}`
    const app = render(<CLI.ReplScreen title={title} onLine={parse} />, {
      stdout: process.stderr,
      patchConsole: false,
      exitOnCtrlC: true
    })
    await app.waitUntilExit()
    return CLI.EXIT.OK
  }

  let exitCode: number = CLI.EXIT.OK
  let first = true
  for await (const line of createInterface({ input: process.stdin })) {
    if (!line.trim()) continue
    const result = parse(line)
    session.out(`${first ? "" : "\n"}${CLI.entryLines(result).join("\n")}`)
    first = false
    if (result.error) exitCode = CLI.EXIT.ERRORS
  }
  return exitCode
}
