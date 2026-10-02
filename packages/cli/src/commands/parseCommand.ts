import chalk from "chalk"

import type { SP } from "$/spell"
import { CLI } from "$/cli"

/**
 * `spell parse "<text>"`:  how spell reads a line -- its match tree, then the javascript it compiles to.
 * - Tried as a `statement`, then an `expression` -- or as `--rule <name>`.  Several lines parse as a `block`.
 * - `--in <target>`:  parse inside that project's scope, so its types and phrases are known.
 * - `--json`:  the result as JSON -- see `CLI.ParsedText`.
 * - Returns the exit code:  `EXIT.ERRORS` if it didn't parse or compile.
 */
export async function parseCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.ParseOptions
): Promise<number> {
  const [text = ""] = args
  const project = options.in ? await projectFor(session, options.in) : undefined
  const result = CLI.parseText(text, CLI.lineScope(project), { rule: options.rule })
  if (options.json) {
    session.out(JSON.stringify(result, null, 2))
  } else {
    if (result.tree.length) session.out(CLI.colorTree(result.tree).join("\n"))
    if (result.compiled !== undefined) session.out(`\n${result.compiled}`)
    if (result.error) session.err(chalk.red(result.error))
  }
  return result.error ? CLI.EXIT.ERRORS : CLI.EXIT.OK
}

/**
 * The project `arg` names, parsed -- for `--in`.
 * - A `.spell` file means its project.  Throws `CLI.CliError` for several.
 */
export async function projectFor(session: CLI.CliSession, arg: string): Promise<SP.SpellProject> {
  const targets = await session.targets([arg])
  if (targets.length !== 1) throw new CLI.CliError(`'${arg}' is several projects -- name one`)
  const [target] = targets
  const project = target!.kind === "file" ? target!.file.project : target!.project
  const status = session.isInteractive ? new CLI.StatusReporter(true) : undefined
  const row = status?.start(`Parsing ${project.projectId}`)
  try {
    await session.parse(project, status)
    if (row) status!.done(row, "ok")
  } finally {
    status?.finish({ clear: true })
  }
  return project
}
