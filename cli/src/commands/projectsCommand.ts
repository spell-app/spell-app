import chalk from "chalk"

import { SP } from "spell-lang/spell"
import { CLI } from "$/cli"

/**
 * `spell projects [group]`:  list the project groups -- or, given one, e.g. `@spell/library`, the projects in it.
 * - A group's line:  its address (what to type), its title, how many projects.
 * - A project's line:  its name, e.g. `cards`, then its address, `@spell/library/cards`.
 * - `--json`:  the same as JSON, for scripts.
 * - Returns the exit code -- `EXIT.USAGE` for a group it doesn't know.
 */
export async function projectsCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.ProjectsOptions
): Promise<number> {
  const [name] = args
  if (name === undefined) {
    const roots = await Promise.all(
      CLI.knownRoots().map(async (spec) => ({
        path: CLI.rootName(spec),
        title: spec.title,
        projects: (await CLI.projectIdsIn([spec])).length
      }))
    )
    if (options.json) session.out(JSON.stringify(roots, null, 2))
    else {
      const pathWidth = Math.max(...roots.map((root) => root.path.length))
      const titleWidth = Math.max(...roots.map((root) => root.title.length))
      for (const root of roots) {
        const count = `${root.projects} project${root.projects === 1 ? "" : "s"}`
        session.out(`${root.path.padEnd(pathWidth)}  ${root.title.padEnd(titleWidth)}  ${chalk.dim(count)}`)
      }
    }
    return CLI.EXIT.OK
  }

  const roots = CLI.rootsNamed(name)
  if (!roots.length) throw new CLI.CliError(`'${name}' isn't a project group -- \`spell projects\` lists them`)
  const projects = (await CLI.projectIdsIn(roots)).map((id) => ({ name: new SP.SpellLocation(id).projectName!, id }))
  if (options.json) session.out(JSON.stringify(projects, null, 2))
  else {
    const width = Math.max(0, ...projects.map((project) => project.name.length))
    for (const project of projects) session.out(`${project.name.padEnd(width)}  ${chalk.dim(project.id)}`)
  }
  return CLI.EXIT.OK
}
