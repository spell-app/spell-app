import { spawnSync } from "child_process"
import { render } from "ink"
import { fileURLToPath } from "url"

import { SP } from "#spell"
import { LSP } from "~/lsp"
import { CLI } from "~/cli"

/** Switch the terminal to its alternate screen, and back -- so exploring leaves your scrollback as it was. */
const ALTERNATE_SCREEN = { enter: "\u001B[?1049h\u001B[H", leave: "\u001B[?1049l" }

/**
 * `spell explore [target]`:  full-screen Type Explorer for one project -- see `<ExplorerScreen>`.
 * - No target:  `@workspace`, the project in the current folder.
 * - A `.spell` file starts on that file, open;  a project, on the project.
 * - `o` opens the selected thing's declaration in `$SPELL_EDITOR` (default `code`), as `-g path:line`.
 * - Needs a terminal:  otherwise throws, pointing at `spell describe`.
 * - Returns the exit code.
 */
export async function exploreCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.GlobalOptions
): Promise<number> {
  if (!session.isInteractive || !process.stdout.isTTY) {
    throw new CLI.CliError("`spell explore` needs a terminal -- `spell describe` prints the same as text")
  }
  const targets = await session.targets([args[0] ?? CLI.WORKSPACE_ARG])
  if (targets.length > 1) throw new CLI.CliError("Explore one project at a time")
  const target = targets[0]!
  const project = target.kind === "file" ? target.file.project : target.project
  const tree = await session.scopeTree(project)
  const start =
    target.kind === "file" ? CLI.fileNodeFor(tree, session.workspace.uriFor(target.file)) : CLI.projectNodeOf(tree)

  const textOptions = session.describeOptions(project, tree, { ...options, width: 80 })
  process.stdout.write(ALTERNATE_SCREEN.enter)
  try {
    const app = render(
      <CLI.ExplorerScreen
        tree={tree}
        title={project.projectName ?? project.projectId}
        describe={describe}
        onOpen={(node) => openInEditor(session, project, tree, node)}
        initialPath={start?.path}
      />,
      { patchConsole: false, exitOnCtrlC: true }
    )
    await app.waitUntilExit()
  } finally {
    process.stdout.write(ALTERNATE_SCREEN.leave)
  }
  return CLI.EXIT.OK

  /** Details pane lines for `node`:  an overview of a project or file, else all about the one thing. */
  function describe(node: LSP.ScopeNode, flags: { compiled: boolean; inherited: boolean; width: number }) {
    const nodeOptions = { ...textOptions, ...flags }
    const isScope = node.kind === "project" || node.kind === "file"
    return isScope ? CLI.describeOverview(node, nodeOptions) : CLI.describeThing(node, nodeOptions)
  }
}

/**
 * Open where `node` is declared in `$SPELL_EDITOR` -- default `code`, i.e. VS Code -- and say how that went.
 * - The editor must take `-g path:line`, as VS Code and Cursor do.
 */
function openInEditor(
  session: CLI.CliSession,
  project: SP.SpellProject,
  tree: LSP.ScopeNode,
  node: LSP.ScopeNode
): string {
  const declaredAt = session.declaredAt(project, tree, node.path)
  if (!declaredAt) return `${node.name} isn't declared in a file`
  const editor = process.env.SPELL_EDITOR || "code"
  const at = `${fileURLToPath(declaredAt.uri)}:${declaredAt.line}`
  const { error, status } = spawnSync(editor, ["-g", at], { stdio: "ignore", timeout: 10_000 })
  if (error || status) return `Couldn't run '${editor} -g ${at}' -- set SPELL_EDITOR to an editor which takes -g`
  return `Opened ${session.whereIs(declaredAt)} in ${editor}`
}
