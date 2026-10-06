import { existsSync } from "fs"
import { relative } from "path"
import { fileURLToPath } from "url"
import { DiagnosticSeverity } from "vscode-languageserver"

import { SP } from "$/spell"
import { LSP } from "$/lsp"
import { SpellDiskWorkspace } from "$/lsp/SpellDiskWorkspace"
import { CLI } from "$/cli"

/**
 * One run of a `spell` command:  its flags, and spell loaded from disk -- what every command needs.
 * - Loads projects through the language server's `SpellDiskWorkspace`, and answers questions about them
 *   with its `SpellLanguageService`, so the CLI sees exactly what an editor does.
 * - Output goes straight to `process.stdout` / `stderr`:  `console.*` is spell's logging, see `consoleGuard.ts`.
 * - SIDE EFFECT (constructor):  makes EVERY `LoadableFile` load from disk -- see `installDiskFetch()`.
 */
export class CliSession {
  /** Flags for this run. */
  declare options: CLI.GlobalOptions
  /** Loads projects from disk, and keeps each parsed once. */
  declare workspace: SpellDiskWorkspace
  /** Answers questions about parsed files, e.g. their errors, as the language server would. */
  declare service: LSP.SpellLanguageService
  /** Builds the Type Explorer's tree -- made on first use, see `explorer`. */
  #explorer?: LSP.ScopeExplorer

  constructor(options: CLI.GlobalOptions = {}) {
    this.options = options
    this.workspace = new SpellDiskWorkspace()
    this.service = new LSP.SpellLanguageService(this.workspace)
  }

  /** Builds the Type Explorer's tree, e.g. for `spell describe`. */
  get explorer(): LSP.ScopeExplorer {
    return (this.#explorer ??= new LSP.ScopeExplorer(this.service))
  }

  /**
   * Can we ask questions and draw screens?
   * - Screens draw on STDERR, so `spell compile --stdout | less` can still ask which project.
   */
  get isInteractive(): boolean {
    return !!process.stdin.isTTY && !!process.stderr.isTTY
  }

  ////////////////
  // ## Targets
  ////////////////

  /**
   * What `args` name, in order, with each bare root turned into its projects -- see `projectsFor()`.
   * - No `args`:  see `defaultTarget()`.
   * - Throws `CLI.CliError` for anything it can't place.
   */
  async targets(args: string[]): Promise<CLI.ResolvedTarget[]> {
    const targets: CLI.ResolvedTarget[] = []
    for (const arg of args.length ? args : [await this.defaultTarget()]) {
      const target = await CLI.resolveTarget(arg)
      if (target.kind !== "root") {
        targets.push(target)
        continue
      }
      for (const projectId of await this.projectsFor(target)) {
        targets.push({ kind: "project", arg: projectId, project: new SP.SpellProject(projectId) })
      }
    }
    return targets
  }

  /**
   * The target when none was given:
   * - In a project's folder, or below it:  that project, `@workspace`.
   * - Otherwise, in a terminal:  ask, at a `<TargetPrompt>`.  Throws `CLI.CliError` if cancelled.
   * - Otherwise:  throws `CLI.CliError`, saying to name one.
   */
  async defaultTarget(): Promise<string> {
    if (CLI.projectDirAbove(process.cwd())) return CLI.WORKSPACE_ARG
    if (!this.isInteractive) {
      throw new CLI.CliError("No spell project here -- name one, e.g. @examples/Solitaire, or `spell projects`")
    }
    const target = await CLI.promptForTarget()
    if (!target) throw new CLI.CliError("Cancelled")
    return target
  }

  /**
   * Which of `root`'s projects to use.
   * - Just one:  that one.
   * - `--all`:  all of them.
   * - Otherwise we ask, with "All projects" first -- or, with no terminal to ask on, throw listing them.
   */
  async projectsFor(root: Extract<CLI.CliTarget, { kind: "root" }>): Promise<string[]> {
    const { projectIds } = root
    if (!projectIds.length) throw new CLI.CliError(`No projects in ${root.title}`)
    if (projectIds.length === 1 || this.options.all) return projectIds
    if (!this.isInteractive) {
      const list = projectIds.map((projectId) => `  ${projectId}`)
      throw new CLI.CliError([`${root.arg} holds several projects -- name one, or pass --all:`, ...list].join("\n"))
    }
    const picked = await CLI.pickProjects(root)
    if (!picked.length) throw new CLI.CliError("Cancelled")
    return picked
  }

  ////////////////
  // ## Parsing
  ////////////////

  /**
   * Parse `project` once, after compiling whatever it imports that's never been compiled -- see `compileImports()`.
   * - A crash is left in `project.parseError`, NOT thrown.
   */
  async parse(project: SP.SpellProject, status?: CLI.StatusReporter): Promise<void> {
    await this.compileImports(project, status)
    await this.workspace.track(project)
  }

  /**
   * Compile each project `project` imports -- and what THEY import -- which has no `<Project>.compiled.js` yet.
   * - Why:  a compiled import is read from that file, so parsing `project` fails without it.
   * - NOTE: an existing one is used as is, even if its sources have changed since -- unless `force`
   *   (`spell compile --force`), which recompiles them all, what they import first.
   * - Shows each on `status`, if given.
   */
  async compileImports(
    project: SP.SpellProject,
    status?: CLI.StatusReporter,
    force = false,
    seen = new Set<SP.SpellProject>()
  ) {
    await project.load(undefined)
    for (const imported of LSP.ScopeExplorer.importedProjects(project)) {
      if (seen.has(imported)) continue
      seen.add(imported)
      if (!force && existsSync(imported.outputFile.location.serverPath)) continue

      const row = status?.start(`${imported.projectId}  (imported by ${project.projectName})`)
      await this.compileImports(imported, status, force, seen)
      await imported.compile()
      if (row)
        this.report(status!, row, imported, { note: `wrote ${this.relative(imported.outputFile.location.serverPath)}` })
    }
  }

  /**
   * `project`'s Type Explorer tree, once it -- and every project it imports -- has parsed.
   * - Shows parsing progress only in a terminal, and clears it off once done:  it isn't the output.
   */
  async scopeTree(project: SP.SpellProject): Promise<LSP.ScopeNode> {
    const status = this.isInteractive ? new CLI.StatusReporter(true) : undefined
    const row = status?.start(`Parsing ${project.projectId}`)
    try {
      await this.parse(project, status)
      // the tree shows each imported project's own parse -- see `ScopeExplorer.importedProjects()`
      for (const imported of LSP.ScopeExplorer.importedProjects(project)) await this.workspace.track(imported)
      if (row) status!.done(row, "ok")
    } finally {
      status?.finish({ clear: true })
    }
    return this.explorer.tree(project)
  }

  /**
   * Where node or member `path` of `project`'s `tree` is declared -- `undefined` if it isn't in a file,
   * e.g. a built-in.  See `CLI.declaredAt()`.
   */
  declaredAt(project: SP.SpellProject, tree: LSP.ScopeNode, path: string): CLI.DeclaredAt | undefined {
    return CLI.declaredAt(tree, path, this.explorer.details(project, path))
  }

  /** `at` as people read it:  `path:line`, the path relative to the current folder. */
  whereIs({ uri, line }: CLI.DeclaredAt): string {
    return `${this.relative(fileURLToPath(uri))}:${line}`
  }

  /**
   * Options for describing `project`'s `tree` as text -- see `CLI.describeOverview()`:  `options`, plus how to
   * find each thing's details, and where it's declared.
   */
  describeOptions(
    project: SP.SpellProject,
    tree: LSP.ScopeNode,
    options: Omit<CLI.DescribeTextOptions, "detailsOf" | "whereIs">
  ): CLI.DescribeTextOptions {
    return {
      ...options,
      detailsOf: (path) => this.explorer.details(project, path),
      whereIs: (path) => {
        const at = this.declaredAt(project, tree, path)
        return at && this.whereIs(at)
      }
    }
  }

  ////////////////
  // ## Problems
  ////////////////

  /**
   * Errors in `project` -- or only those in `file`, if given -- as an editor would show them.
   * - A parse which crashed outright is ONE problem, with no file:  the editor shows it atop every file.
   */
  problems(project: SP.SpellProject, file?: SP.SpellFile): CLI.Problem[] {
    const { projectId, parseError } = project
    if (parseError) return [{ project: projectId, message: `Parser crashed:  ${parseError}` }]
    return (file ? [file] : project.spellFiles).flatMap((it) =>
      this.service.diagnostics(it).flatMap(({ range: { start }, message, severity }) => {
        if (severity !== DiagnosticSeverity.Error) return []
        const path = it.location.serverPath
        const text = typeof message === "string" ? message : message.value
        return [{ project: projectId, path, line: start.line + 1, column: start.character + 1, message: text }]
      })
    )
  }

  /**
   * `problem` on one line:  `path:line:col  message`, which terminals and editors can click.
   * - Its path is relative to the current folder.
   */
  problemLine({ project, path, line, column, message }: CLI.Problem): string {
    return path ? `${this.relative(path)}:${line}:${column}  ${message}` : `${project}:  ${message}`
  }

  /**
   * Finish `row` for `project` -- or just its `file`:  ok, or how many errors, listing them under it.
   * - `note` follows the error count, e.g. where the output went.
   * - `list: false` leaves the errors out, e.g. when they're printed elsewhere.
   * - `details`:  more lines under it, after the errors, e.g. `tsc`'s on a `ts/solid` target -- not counted.
   * - Returns its problems.
   */
  report(
    status: CLI.StatusReporter,
    row: CLI.StatusRow,
    project: SP.SpellProject,
    {
      note,
      file,
      list = true,
      details: more = []
    }: { note?: string; file?: SP.SpellFile; list?: boolean; details?: string[] } = {}
  ): CLI.Problem[] {
    const problems = this.problems(project, file)
    const count = problems.length ? `${problems.length} error${problems.length === 1 ? "" : "s"}` : undefined
    const details = [...(list ? problems.map((problem) => this.problemLine(problem)) : []), ...more]
    status.done(
      row,
      problems.length ? "errors" : "ok",
      [count, note].filter(Boolean).join(" · "),
      details.length ? details : undefined
    )
    return problems
  }

  ////////////////
  // ## Output
  ////////////////

  /** Write `text` to stdout, on its own line. */
  out(text: string): void {
    process.stdout.write(text.endsWith("\n") ? text : `${text}\n`)
  }

  /** Write `text` to stderr, on its own line. */
  err(text: string): void {
    process.stderr.write(text.endsWith("\n") ? text : `${text}\n`)
  }

  /** `path` relative to the current folder, if it's under it. */
  relative(path: string): string {
    const rel = relative(process.cwd(), path)
    return rel.startsWith("..") ? path : rel
  }
}
