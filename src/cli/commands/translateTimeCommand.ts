import { basename } from "path"

import type { TimedProject } from "spell-parser/cli/translateTimes"
import { CLI } from "spell-app/cli"

/**
 * `spell translate speedtest [projects...] --to <lang>`:  time `spell translate`, run after run, on scratch copies
 * (epic `spanish` P29).
 * - Here, only what needs the app:  finding the projects (addresses, folders), each one's twin a person translated,
 *   and each run's translation, found and parsed as `spell translate` does (`translateSourceFor()`).
 * - spell-parser's `timeTranslations()` does the rest:  the copies, the runs, the table, the clean-up.
 * - No projects:  Solitaire and todos-form-based (`TIMED_BY_DEFAULT`), the two the translator's numbers were
 *   measured on by hand.
 * - Returns the exit code:  `EXIT.ERRORS` if any run threw.
 * - throws `CliError` for `--reference` with more than one project
 */
export async function translateTimeCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.TranslateTimeOptions
): Promise<number> {
  const addresses = args.length ? args : TIMED_BY_DEFAULT
  if (options.reference && addresses.length > 1) {
    throw new CLI.CliError("--reference is one project's translation:  time that project alone")
  }
  const projects: TimedProject[] = []
  for (const address of addresses) {
    const project = await CLI.projectFor(session, address)
    const folder = project.location.serverPath
    const reference = options.reference ?? TRANSLATED_BY_HAND[project.projectId]?.[options.to]
    projects.push({ projectName: project.projectName ?? basename(folder), folder, reference })
  }
  const { timeTranslations } = await import("spell-parser/cli/translateTimes")
  const { translationOf } = await import("spell-parser/cli/translateProject")
  const report = await timeTranslations(projects, options, async (folder, translateOptions, reference) => {
    // a session of its own each run:  nothing parsed or compiled carried over from the last
    const runSession = new CLI.CliSession(options)
    const project = await CLI.projectFor(runSession, folder)
    const source = await CLI.translateSourceFor(runSession, project, translateOptions, reference)
    return translationOf(source, translateOptions, undefined, { print: false })
  })
  return report.exitCode
}

/** The projects `spell translate speedtest` times with none named. */
export const TIMED_BY_DEFAULT = ["@spell/examples/Solitaire", "@spell/test/todos-form-based"]

/** Each example a person translated by hand, by its address, then language:  its twin, to compare names with. */
const TRANSLATED_BY_HAND: Record<string, Record<string, string>> = {
  "@spell/examples/Solitaire": { es: "@spell/examples/Solitario" },
  "@spell/examples/TaskList": { es: "@spell/examples/ListaDeTareas" }
}
