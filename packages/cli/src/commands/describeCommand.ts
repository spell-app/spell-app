import { SP } from "$/spell"
import { LSP } from "$/lsp"
import { CLI } from "$/cli"

/**
 * `spell describe [project] [name] [member]`:  what the Type Explorer shows, as text -- see `describeText.ts`.
 * - No name:  an overview of the file or project -- each type with its members, each function and variable.
 * - `name`:  that ONE thing in full, e.g. `Card`, `test card setup`, `Suits`.  `member` picks one of its members,
 *   e.g. `spell describe Card.spell Card color`.
 * - Names match ignoring case, and spaces ~== `-` ~== `_`.  Looked for in the project first, then anywhere
 *   its project can see:  built-in types, imported projects.
 * - `--json` prints the explorer's own data:  the node, or the thing and its details.
 * - Returns the exit code.
 */
export async function describeCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.DescribeOptions
): Promise<number> {
  const [arg, ...names] = args
  const resolvedProjects = await session.projects(arg === undefined ? [] : [arg])
  if (names.length && resolvedProjects.length > 1)
    throw new CLI.CliError(`Name one project to look for '${names.join(" ")}' in`)

  const width = process.stdout.columns || 100
  const sections: string[] = []
  for (const resolved of resolvedProjects) {
    const project = resolved.kind === "file" ? resolved.file.project : resolved.project
    const tree = await session.scopeTree(project)
    const textOptions = session.describeOptions(project, tree, { ...options, width })

    const scope =
      resolved.kind === "file"
        ? CLI.fileNodeFor(tree, session.workspace.uriFor(resolved.file))
        : CLI.projectNodeOf(tree)
    if (!scope) throw new CLI.CliError(`'${arg}' isn't parsed in its project -- is it active in ${SP.PROJECT_FILE}?`)
    if (!names.length) {
      sections.push(options.json ? JSON.stringify(scope, null, 2) : CLI.describeOverview(scope, textOptions).join("\n"))
      continue
    }

    const thing = findThing(scope, names) ?? findThing(tree, names)
    if (!thing) throw new CLI.CliError(`Nothing called '${names.join(" ")}' in ${arg}`)
    sections.push(
      options.json
        ? JSON.stringify({ thing, details: textOptions.detailsOf(thing.path) }, null, 2)
        : CLI.describeThing(thing, textOptions).join("\n")
    )
  }
  session.out(sections.join("\n\n"))
  return CLI.EXIT.OK
}

/**
 * The thing `names` name below `scope`:  `names[0]` anywhere below it -- a node first, else a member --
 * then `names[1]`, if given, among ITS members.
 */
function findThing(scope: LSP.ScopeNode, names: string[]): LSP.ScopeNode | LSP.ScopeMember | undefined {
  const [name, member] = names.map(CLI.normalizedName)
  const nodes = CLI.descendants(scope)
  const thing =
    nodes.find((node) => CLI.normalizedName(node.name) === name) ??
    nodes.flatMap((node) => node.members).find((it) => CLI.normalizedName(it.name) === name)
  if (!thing || member === undefined) return thing
  if (!("members" in thing)) return undefined
  return (
    thing.children.find((node) => CLI.normalizedName(node.name) === member) ??
    thing.members.find((it) => CLI.normalizedName(it.name) === member)
  )
}
