import chalk from "chalk"
import { existsSync, watch, type FSWatcher } from "fs"
import { render, type Instance } from "ink"
import { basename, resolve } from "path"
import { pathToFileURL } from "url"

import { SP } from "#spell"
import { LSP } from "~/lsp"
import { CLI } from "~/cli"

/** Wait this long after a change for more, e.g. an editor saving several files, before rebuilding. */
const SETTLE_MS = 150

/** Most errors listed per project:  the rest are counted. */
const MAX_LISTED = 12

/**
 * `spell watch [target...]`:  recompile each project -- or `--check-only`, re-check it -- whenever its files change.
 * - No target:  `@workspace`, the project in the current folder.
 * - Watches each project's folder:  `.spell` and `.css` files, and `project.json`.  NOT `<Project>.compiled.js`,
 *   which compiling writes.
 * - Changes go through the language server's workspace, so only what changed re-parses.
 * - In a terminal:  a live `<WatchScreen>`.  Otherwise, e.g. piped:  a timestamped line per rebuild, on stderr.
 * - Runs until `q` or `Ctrl-C`.  Returns the exit code.
 * - NOTE: a project another one imports, changing, doesn't rebuild the importer -- watch both.
 */
export async function watchCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.WatchOptions
): Promise<number> {
  const targets = await session.targets(args.length ? args : [CLI.WORKSPACE_ARG])
  const projects = [...new Set(targets.map((it) => (it.kind === "file" ? it.file.project : it.project)))]
  const verb = options.checkOnly ? "re-checking" : "recompiling"
  const rows = new Map(
    projects.map((project) => [project, { label: project.projectId, state: "running" } as CLI.StatusRow])
  )
  const builds = new Map<SP.SpellProject, Build>(projects.map((project) => [project, { changes: new Set() }]))

  let app: Instance | undefined
  if (session.isInteractive) {
    app = render(<CLI.WatchScreen rows={[...rows.values()]} verb={verb} />, {
      stdout: process.stderr,
      patchConsole: false,
      exitOnCtrlC: true
    })
  }
  // watch BEFORE the first build:  macOS takes a moment to start watching a folder, missing changes meanwhile.
  // A change during the first build just rebuilds again after it -- see `rebuild()`.
  const watchers: FSWatcher[] = projects.map((project) =>
    watch(project.location.serverPath, { recursive: true }, (_event, filename) => {
      if (filename && isWatched(filename)) changed(project, resolve(project.location.serverPath, filename))
    })
  )
  const stopped = app ? app.waitUntilExit() : new Promise((done) => process.once("SIGINT", done))
  for (const project of projects) await rebuild(project, true)
  try {
    await stopped
  } finally {
    for (const watcher of watchers) watcher.close()
    app?.unmount()
  }
  return CLI.EXIT.OK

  /** `path` in `project` changed:  note it, and rebuild once changes settle. */
  function changed(project: SP.SpellProject, path: string) {
    const build = builds.get(project)!
    build.changes.add(path)
    clearTimeout(build.timer)
    build.timer = setTimeout(() => void rebuild(project), SETTLE_MS)
  }

  /**
   * Take in `project`'s changes, then re-check or recompile it, and show how that went.
   * - One at a time per project:  changes arriving meanwhile wait, then rebuild again.
   * - `isFirst`:  parse it from scratch instead -- compiling any never-compiled project it imports.
   */
  async function rebuild(project: SP.SpellProject, isFirst = false): Promise<void> {
    const build = builds.get(project)!
    if (build.running) {
      build.again = true
      return
    }
    const row = rows.get(project)!
    const changes = [...build.changes]
    build.changes.clear()
    build.running = true
    update(row, { state: "running", note: undefined })
    try {
      if (isFirst) await session.parse(project)
      for (const path of changes) await session.workspace.diskChanged(pathToFileURL(path).href, kindOf(project, path))
      if (!options.checkOnly) await project.compile()
      const problems = session.problems(project).map((problem) => session.problemLine(problem))
      const what = options.checkOnly ? "checked" : "compiled"
      const count = problems.length ? ` · ${problems.length} error${problems.length === 1 ? "" : "s"}` : ""
      update(row, {
        state: problems.length ? "errors" : "ok",
        note: `${what} ${clock()}${count}`,
        details: listed(problems)
      })
    } catch (error) {
      update(row, { state: "failed", note: `${clock()} · ${error instanceof Error ? error.message : String(error)}` })
    } finally {
      build.running = false
    }
    if (build.again) {
      build.again = false
      await rebuild(project)
    }
  }

  /** Change `row`, then show it:  redraw the screen, or -- with no screen -- log it once it's done. */
  function update(row: CLI.StatusRow, changes: Partial<CLI.StatusRow>) {
    Object.assign(row, { details: undefined }, changes)
    if (app) return app.rerender(<CLI.WatchScreen rows={[...rows.values()]} verb={verb} />)
    if (row.state === "running") return
    const mark = row.state === "ok" ? chalk.green(CLI.STATE_MARK[row.state]) : chalk.red(CLI.STATE_MARK[row.state])
    const lines = [
      `${mark} ${row.label}  ${chalk.dim(row.note ?? "")}`,
      ...(row.details ?? []).map((it) => `    ${it}`)
    ]
    session.err(lines.join("\n"))
  }
}

/**
 * Where one project's rebuilding has got to.
 * - `changes`:  paths changed since it last started
 * - `timer`:  waiting for changes to settle
 * - `running`:  rebuilding now
 * - `again`:  changes came in while running:  rebuild once more after
 */
type Build = {
  changes: Set<string>
  timer?: ReturnType<typeof setTimeout>
  running?: boolean
  again?: boolean
}

/**
 * What happened to `path` in `project`, going by what's there NOW -- NOT by `fs.watch()`'s event:
 * macOS reports a plain save as a `rename`, which would look like a new file.
 * - Gone:  `deleted`.  One of `project`'s files already:  `changed`.  Otherwise:  `created`.
 * - Why it matters:  a `created` file makes the workspace re-read the project's file list, keeping the text it
 *   already has for files it knows -- so a save reported that way compiles the OLD text.
 */
function kindOf(project: SP.SpellProject, path: string): LSP.DiskChange {
  if (!existsSync(path)) return "deleted"
  return project.files.some((file) => file.location.serverPath === path) ? "changed" : "created"
}

/** Does a change to `filename`, in a project folder, need a rebuild?  Its spell, css or `project.json` -- not output. */
function isWatched(filename: string): boolean {
  const name = basename(filename)
  if (name.startsWith(".") || name.endsWith(SP.COMPILED_JS_SUFFIX) || name.endsWith(SP.SNAPSHOT_JS_SUFFIX)) return false
  return name === SP.PROJECT_FILE || name.endsWith(".spell") || name.endsWith(".css")
}

/** `problems`, at most `MAX_LISTED` of them, then how many more. */
function listed(problems: string[]): string[] {
  if (problems.length <= MAX_LISTED) return problems
  return [...problems.slice(0, MAX_LISTED), chalk.dim(`...and ${problems.length - MAX_LISTED} more`)]
}

/** Time now, e.g. `14:03:27`. */
function clock(): string {
  return new Date().toLocaleTimeString("en-GB")
}
