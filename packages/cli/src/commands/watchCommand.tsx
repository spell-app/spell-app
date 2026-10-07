import chalk from "chalk"
import { existsSync, watch, type FSWatcher } from "fs"
import { render, type Instance } from "ink"
import { basename, resolve } from "path"
import { pathToFileURL } from "url"

import { SP } from "$/spell"
import { LSP } from "$/lsp"
import { CLI } from "$/cli"

/** Wait this long after a change for more, e.g. an editor saving several files, before rebuilding. */
const SETTLE_MS = 150

/** Most errors listed per project:  the rest are counted. */
const MAX_LISTED = 12

/**
 * `spell watch [projects...]`:  recompile each project -- or `--check-only`, re-check it -- whenever its files change.
 * - None named:  the project here -- or, outside one, asks.  See `CliSession.defaultProject()`.
 * - Watches each project's folder:  `.spell` and `.css` files, and `project.json`.  NOT `<Project>.compiled.js`
 *   or `<Project>.scopes.js`, which compiling writes -- the scope pack after each recompile with no errors.
 * - Changes go through the language server's workspace, so only what changed re-parses.
 * - Watching both a project and one that imports it:  the importer rebuilds after it, from scratch, so it sees
 *   what changed.  Only what's watched:  a project imported but not watched isn't.
 * - `--test`:  after each rebuild with no errors, run the project's tests -- `--name` picks which -- and show how
 *   they went, with what failed.  `spell test --watch` is the same.
 * - In a terminal:  a live `<WatchScreen>`.  Otherwise, e.g. piped:  a timestamped line per rebuild, on stderr.
 * - Runs until `q` or `Ctrl-C`.  Returns the exit code.
 */
export async function watchCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.WatchOptions
): Promise<number> {
  if (options.test && options.checkOnly) throw new CLI.CliError("--test runs what's compiled:  drop --check-only")
  const resolvedProjects = await session.projects(args)
  const projects = [...new Set(resolvedProjects.map((it) => (it.kind === "file" ? it.file.project : it.project)))]
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
   * Take in `project`'s changes, then re-check or recompile it -- and with `--test`, test it -- and show how that
   * went.  Then rebuild what imports it.
   * - One at a time per project:  changes arriving meanwhile wait, then rebuild again.
   * - `isFirst`:  parse it from scratch instead -- compiling any never-compiled project it imports.  Its importers
   *   are building for the first time too, so they're left be.
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
      // a CLEAN recompile writes its scope pack too, as the language server does
      if (!options.checkOnly && !problems.length) await session.workspace.writeScopes(project, session.explorer)
      const what = options.checkOnly ? "checked" : "compiled"
      const count = problems.length ? ` · ${problems.length} error${problems.length === 1 ? "" : "s"}` : ""
      const tests = options.test && !problems.length ? await test(project) : undefined
      update(row, {
        state: problems.length || tests?.failed ? "errors" : "ok",
        note: `${what} ${clock()}${count}${tests ? ` · ${tests.summary}` : ""}`,
        details: listed([...problems, ...(tests?.details ?? [])])
      })
    } catch (error) {
      update(row, { state: "failed", note: `${clock()} · ${error instanceof Error ? error.message : String(error)}` })
    } finally {
      build.running = false
    }
    if (!isFirst) for (const importer of importersOf(project)) rebuildFromScratch(importer)
    if (build.again) {
      build.again = false
      await rebuild(project)
    }
  }

  /** Run `project`'s tests, as last compiled -- how many passed, and what failed.  See `testOutcome()`. */
  async function test(project: SP.SpellProject) {
    const { exitCode, output } = await CLI.runCompiled("test", project, options, { capture: true })
    return testOutcome(output, exitCode)
  }

  /** Watched projects which import `project` -- see `ScopeExplorer.importedProjects()`. */
  function importersOf(project: SP.SpellProject): SP.SpellProject[] {
    return projects.filter(
      (it) =>
        it !== project &&
        LSP.ScopeExplorer.importedProjects(it).some((imported) => imported.projectId === project.projectId)
    )
  }

  /**
   * Rebuild `project` from scratch, e.g. after a project it imports recompiled:  a compiled import's declarations
   * are read as the project parses from scratch -- see `SpellProject.loadImportScope()`.
   * - Done as its `project.json` changing, which the workspace takes as "re-read and re-parse everything".
   */
  function rebuildFromScratch(project: SP.SpellProject) {
    changed(project, resolve(project.location.serverPath, SP.PROJECT_FILE))
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
export function kindOf(project: SP.SpellProject, path: string): LSP.DiskChange {
  if (!existsSync(path)) return "deleted"
  return project.files.some((file) => file.location.serverPath === path) ? "changed" : "created"
}

/** Does a change to `filename`, in a project folder, need a rebuild?  Its spell, css or `project.json` -- not output. */
export function isWatched(filename: string): boolean {
  const name = basename(filename)
  if (name.startsWith(".") || name.endsWith(SP.COMPILED_JS_SUFFIX) || name.endsWith(SP.SNAPSHOT_JS_SUFFIX)) return false
  return name === SP.PROJECT_FILE || name.endsWith(".spell") || name.endsWith(".css")
}

/**
 * How a test run went, from what `runProject.ts` printed and its `exitCode`:
 * - `summary`:  its last line, e.g. `2 passed`, `0 passed, 1 failed` -- or `no tests`
 * - `details`:  each failing test and its failed checks;  or, if it crashed, its last lines
 * - `failed`:  did any fail, or did it crash?
 */
export function testOutcome(output: string, exitCode: number): { summary: string; details: string[]; failed: boolean } {
  const lines = output.trimEnd().split("\n")
  const last = lines.at(-1) ?? ""
  const failed = exitCode !== CLI.EXIT.OK
  if (/^\d+ passed/.test(last)) {
    const details: string[] = []
    let inFailure = false
    for (const line of lines) {
      if (!line.startsWith(" ")) inFailure = line.startsWith("✗")
      if (inFailure) details.push(line)
    }
    return { summary: last, details, failed }
  }
  if (!failed) return { summary: "no tests", details: [], failed }
  return { summary: chalk.red("tests crashed"), details: lines.slice(-5), failed }
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
