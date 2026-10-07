import { spawnSync } from "child_process"
import { watch, writeFileSync, type FSWatcher } from "fs"
import { render } from "ink"
import { resolve } from "path"
import { fileURLToPath, pathToFileURL } from "url"

import { SP } from "$/spell"
import { LSP } from "$/lsp"
import { CLI } from "$/cli"

/** Switch the terminal to its alternate screen, and back -- so exploring leaves your scrollback as it was. */
const ALTERNATE_SCREEN = { enter: "\u001B[?1049h\u001B[H", leave: "\u001B[?1049l" }

/** Wait this long after a change for more, e.g. an editor saving several files, before reloading. */
const SETTLE_MS = 150

/**
 * `spell explore [project]`:  full-screen Type Explorer for one project -- see `<ExplorerScreen>`.
 * - None named:  the project here -- or, outside one, asks.  See `CliSession.defaultProject()`.
 * - A `.spell` file starts on that file, open;  a project, on the project.
 * - `o` opens the selected thing's declaration in `$SPELL_EDITOR` (default `code`), as `-g path:line`.
 * - `e` edits its description, writing the file -- never in a test project.
 * - Reloads as the project's files change, as `spell watch` sees them.
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
  const resolvedProjects = await session.projects(args.slice(0, 1))
  if (resolvedProjects.length > 1) throw new CLI.CliError("Explore one project at a time")
  const resolved = resolvedProjects[0]!
  const project = resolved.kind === "file" ? resolved.file.project : resolved.project
  let tree = await session.scopeTree(project)
  const start =
    resolved.kind === "file" ? CLI.fileNodeFor(tree, session.workspace.uriFor(resolved.file)) : CLI.projectNodeOf(tree)

  let textOptions = session.describeOptions(project, tree, { ...options, width: 80 })
  process.stdout.write(ALTERNATE_SCREEN.enter)
  let watcher: FSWatcher | undefined
  try {
    const app = render(screen(), { patchConsole: false, exitOnCtrlC: true })
    watcher = watchForChanges(session, project, async () => {
      tree = session.explorer.tree(project)
      textOptions = session.describeOptions(project, tree, { ...options, width: 80 })
      app.rerender(screen())
    })
    await app.waitUntilExit()
  } finally {
    watcher?.close()
    process.stdout.write(ALTERNATE_SCREEN.leave)
  }
  return CLI.EXIT.OK

  /** The screen, for the current `tree`. */
  function screen() {
    return (
      <CLI.ExplorerScreen
        tree={tree}
        title={project.projectName ?? project.projectId}
        describe={describe}
        onOpen={(node) => openInEditor(session, project, tree, node)}
        descriptionOf={(node) => descriptionOf(node)}
        onEdit={(node, text) => editDescription(node, text)}
        initialPath={start?.path}
      />
    )
  }

  /** Details pane lines for `node`:  an overview of a project or file, else all about the one thing. */
  function describe(node: LSP.ScopeNode, flags: { compiled: boolean; inherited: boolean; width: number }) {
    const nodeOptions = { ...textOptions, ...flags }
    const isScope = node.kind === "project" || node.kind === "file"
    return isScope ? CLI.describeOverview(node, nodeOptions) : CLI.describeThing(node, nodeOptions)
  }

  /** `node`'s description, `""` if none -- `undefined` if it isn't declared in a file of THIS project. */
  function descriptionOf(node: LSP.ScopeNode): string | undefined {
    const at = session.declaredAt(project, tree, node.path)
    const file = at && session.workspace.fileFor(at.uri)
    if (!file || file.project.projectId !== project.projectId) return undefined
    return session.explorer.details(project, node.path)?.description ?? ""
  }

  /**
   * Make `text` `node`'s description, in the file it's declared in -- see `SpellLanguageService.descriptionEdits()`.
   * - Writes the file;  the watcher then reloads the tree.  Never in a test project.
   * - Returns what happened, for the footer.
   */
  function editDescription(node: LSP.ScopeNode, text: string): string {
    const at = session.declaredAt(project, tree, node.path)
    const file = at && session.workspace.fileFor(at.uri)
    if (!at || !file) return `${node.name} isn't declared in a file`
    const path = file.location.serverPath
    if (CLI.isTestProject(path)) return `Won't edit ${session.whereIs(at)}:  test projects stay frozen`
    const edits = session.service.descriptionEdits(file, at.line, text)
    if (!edits) return `Couldn't find ${node.name}'s statement at ${session.whereIs(at)}`
    writeFileSync(path, CLI.applyEdits(file.contents ?? "", edits))
    return `Saved ${node.name}'s description in ${session.whereIs(at)}`
  }
}

/**
 * Watch `project`'s folder, as `spell watch` does:  take each change into the workspace, then -- once changes
 * settle -- call `onChange()`.  See `CLI.isWatched()` and `CLI.kindOf()`.
 */
function watchForChanges(session: CLI.CliSession, project: SP.SpellProject, onChange: () => Promise<void>) {
  const changes = new Set<string>()
  let timer: ReturnType<typeof setTimeout> | undefined
  const folder = project.location.serverPath
  return watch(folder, { recursive: true }, (_event, filename) => {
    if (!filename || !CLI.isWatched(filename)) return
    changes.add(resolve(folder, filename))
    clearTimeout(timer)
    timer = setTimeout(async () => {
      const paths = [...changes]
      changes.clear()
      for (const path of paths) await session.workspace.diskChanged(pathToFileURL(path).href, CLI.kindOf(project, path))
      await onChange()
    }, SETTLE_MS)
  })
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
