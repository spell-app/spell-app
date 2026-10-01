import chalk from "chalk"

import { SP } from "$/spell"
import { CLI } from "$/cli"

/**
 * `spell projects [root]`:  list the project roots -- or, given one, e.g. `@library`, the projects in it.
 * - A root's line:  the name to type (its `alias`, or `@<domain>`), its full path, its title, how many projects.
 * - A project's line:  the name to type, e.g. `@library/cards`, then its full id.
 * - `--json`:  the same as JSON, for scripts.
 * - Returns the exit code -- `EXIT.USAGE` for a root it doesn't know.
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
        name: CLI.rootName(spec),
        path: spec.path,
        title: spec.title,
        projects: (await CLI.projectIdsIn([spec])).length
      }))
    )
    if (options.json) session.out(JSON.stringify(roots, null, 2))
    else {
      const width = Math.max(...roots.map((root) => root.name.length))
      const pathWidth = Math.max(...roots.map((root) => root.path.length))
      const titleWidth = Math.max(...roots.map((root) => root.title.length))
      for (const root of roots) {
        const count = `${root.projects} project${root.projects === 1 ? "" : "s"}`
        const path = chalk.dim(root.path.padEnd(pathWidth))
        session.out(`${root.name.padEnd(width)}  ${path}  ${root.title.padEnd(titleWidth)}  ${chalk.dim(count)}`)
      }
    }
    return CLI.EXIT.OK
  }

  const roots = CLI.rootsNamed(name)
  if (!roots.length) throw new CLI.CliError(`'${name}' isn't a project root -- \`spell projects\` lists them`)
  const projects = (await CLI.projectIdsIn(roots)).map((id) => ({ name: shortName(id, roots), id }))
  if (options.json) session.out(JSON.stringify(projects, null, 2))
  else {
    const width = Math.max(0, ...projects.map((project) => project.name.length))
    for (const project of projects) session.out(`${project.name.padEnd(width)}  ${chalk.dim(project.id)}`)
  }
  return CLI.EXIT.OK
}

/** What to type for project `id` in one of `roots`, e.g. `@library/cards` -- or the full id. */
function shortName(id: string, roots: SP.ProjectRootSpec[]): string {
  const spec = roots.find((it) => id.startsWith(`${it.path}:`))
  return spec ? `${CLI.rootName(spec)}/${id.slice(spec.path.length + 1)}` : id
}
