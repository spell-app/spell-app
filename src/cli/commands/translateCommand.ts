import { SP } from "spell-lang/spell"
import type { SourceFile } from "spell-lang/spell/translate/translate.types"
import { CLI } from "spell-app/cli"

/**
 * `spell lang translate [project] --to <lang>`:  write a project in another language (epic `spanish` P24).
 * - Here, only what needs the app:  finding the project (an address, a folder, `@here`) and parsing it,
 *   and its `--seed` project too.
 * - The rest is spell-lang's `translateProject()`:  the dictionary, the translating, `claude -p`, the files.
 * - Returns the exit code:  `EXIT.ERRORS` if any line still needs a person.
 */
export async function translateCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.TranslateOptions
): Promise<number> {
  const project = await CLI.projectFor(session, args[0] ?? (await session.defaultProject()))
  const seed = options.seed ? await CLI.projectFor(session, options.seed) : undefined
  const { translateProject } = await import("spell-lang/cli/translateProject")
  return translateProject(
    {
      projectName: project.projectName ?? "Project",
      folder: project.location.serverPath,
      files: await sourceFiles(project),
      seed: seed && (await sourceFiles(seed))
    },
    options
  )
}

/** `project`'s spell files, parsed, in its project file's order:  their paths in the project, e.g. `/Card.spell`. */
async function sourceFiles(project: SP.SpellProject): Promise<SourceFile[]> {
  const files: SourceFile[] = []
  for (const file of project.files) {
    if (!(file instanceof SP.SpellFile)) continue
    const match = await file.parse()
    files.push({ path: file.path.slice(project.projectId.length), contents: file.contents ?? "", match })
  }
  return files
}
