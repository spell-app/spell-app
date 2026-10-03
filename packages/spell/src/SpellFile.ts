import { TextFile, batch } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"

/**
 * Loadable file of spell code located at `path`.
 * - NOTE: these are singleton instances -- you'll always get the same object back for a given `path`.
 */
export class SpellFile extends TextFile {
  /** Registry of known instances. */
  static registry = new Map<string, SpellFile>()
  constructor(path: string) {
    // Return immediately from registry if already present.
    const existing = SpellFile.registry.get(path)
    if (existing) return existing

    super({})
    Object.assign(this, { path })
    if (!this.location.isFilePath) {
      throw new TypeError(`new SpellFile('${path}'): Must be initialized with valid file path.`)
    }
    SpellFile.registry.set(path, this)
  }

  /**
   * We've been removed from the server -- clean up memory, etc..
   * - SIDE EFFECT: drops our entry from `SpellFile.registry` and shared `SP.SpellLocation.registry`.
   */
  onRemove(): void {
    super.onRemove()
    SpellFile.registry.delete(this.path)
    SP.SpellLocation.registry.delete(this.path)
  }

  /**
   * Path to file, as specified by server.
   * - MUST be passed to constructor.
   */
  /*@writeOnce path*/
  declare path: string

  /** Return `location` as an `SP.SpellLocation`, so we can pull various bits out of our `path`. */
  /*@forward("projectId", "projectName", "filePath", "folder", "file", "fileName", "extension")*/
  /*@memoize*/
  get location(): SP.SpellLocation {
    return this.derived("location", () => new SP.SpellLocation(this.path))
  }
  /** `projectId` from `location`. */
  get projectId(): string {
    return this.location.projectId
  }
  /** `projectName` from `location`, if any. */
  get projectName(): string | undefined {
    return this.location.projectName
  }
  /** `filePath` from `location`, if any. */
  get filePath(): string | undefined {
    return this.location.filePath
  }
  /** `folder` from `location`, if any. */
  get folder(): string | undefined {
    return this.location.folder
  }
  /** `file` from `location`, if any. */
  get file(): string | undefined {
    return this.location.file
  }
  /** `fileName` from `location`, if any. */
  get fileName(): string | undefined {
    return this.location.fileName
  }
  /** `extension` from `location`, if any. */
  get extension(): string | undefined {
    return this.location.extension
  }

  /** Pointer to our `SpellProject`. */
  /*@memoize*/
  get project(): SP.SpellProject {
    return this.derived("project", () => new SP.SpellProject(this.projectId))
  }

  /** Does our project parse us, i.e. are we active in its `project.json`? */
  get isActive(): boolean {
    return this.project.spellFiles.includes(this)
  }

  /**
   * Our `info` record from project manifest, or `undefined` if not found there.
   * - NOTE: `modified` and `size` may be stale if we've been modified on client since load.
   */
  get info(): SP.ProjectManifestEntry | undefined {
    return this.project.getFileInfo(this.path)
  }

  ////////////////
  // ## Parsing / Compiling
  ////////////////

  /** Our scope with which we've compiled. */
  /*@state*/ get scope(): P.FileScope | P.ProjectScope | undefined {
    return this.getState("scope", () => undefined)
  }
  set scope(scope: P.FileScope | P.ProjectScope | undefined) {
    this.setState("scope", scope)
  }

  /** Our input text split into lines, for offset calculations. */
  /*@state*/ get inputLines(): string[] | undefined {
    return this.getState("inputLines", () => undefined)
  }
  set inputLines(inputLines: string[] | undefined) {
    this.setState("inputLines", inputLines)
  }

  /** Results of our last `parse()` as a `Match`. */
  /*@state*/ get match(): P.Match | undefined {
    return this.getState("match", () => undefined)
  }
  set match(match: P.Match | undefined) {
    this.setState("match", match)
  }

  /** AST for our `compiled` output. */
  /*@state*/ get AST(): P.ASTNode | undefined {
    return this.getState("AST", () => undefined)
  }
  set AST(AST: P.ASTNode | undefined) {
    this.setState("AST", AST)
  }

  /** Our `compiled` output as javascript. */
  /*@state*/ get compiled(): string | undefined {
    return this.getState("compiled", () => undefined)
  }
  set compiled(compiled: string | undefined) {
    this.setState("compiled", compiled)
  }

  /** Reset our compiled state. */
  resetCompiled(): void {
    this.resetState("scope", "inputLines", "match", "AST", "compiled")
  }

  /**
   * Return a `Scope` for parsing this file.
   * - If `parentScope` has `types` (a real project scope), returns a `P.FileScope` under it, reusing its
   *   parser.
   * - Otherwise falls back to an ad-hoc `P.ProjectScope` cloned from `SpellParser.rootScope`'s parser --
   *   logs a warning, since it means we don't know what project we belong to.
   */
  getScope(parentScope: P.Scope | undefined): P.FileScope | P.ProjectScope {
    // If we were passed a `parentScope` with `types`, set up as a `FileScope` and use same parser.
    if (parentScope && parentScope.types) {
      return new P.FileScope({
        name: this.file,
        path: this.path,
        parentScope
      })
    }
    // Otherwise set up as an ad-hoc `Project` and clone `SpellParser.rootScope.parser`
    console.warn(`spellFile.getScope(): no parentScope for ${this.filePath}`)
    return new P.ProjectScope({
      name: this.file,
      path: this.path,
      parser: SP.SpellParser.rootScope.parser!.clone({ module: this.path }),
      parentScope: SP.SpellParser.rootScope
    })
  }

  /**
   * Load our content and attempt to parse it -- returns a `Match` (also available as `this.match`).
   * - NOTE: if `this.match` is already set, we assume that's fine and return it as-is.  Call
   *   `spellFile.resetCompiled()` first to force a re-parse.
   * - Pass explicit `parentScope` if this file is, e.g. building on other files.
   */
  async parse(parentScope?: P.Scope): Promise<P.Match | undefined> {
    if (this.match) return this.match
    await this.load(undefined)
    this.resetCompiled()
    batch(() => {
      this.setState("inputLines", this.contents!.split("\n"))
      this.setState("scope", this.getScope(parentScope))
      const match = this.scope!.parse(this.parseText, "block")
      this.setState("match", match)
      this.logParseErrors()
    })
    return this.match
  }

  /**
   * Text we actually parse:  our `contents`, or a stand-in comment if blank.
   * - HACK: things get weird downstream if we don't get a `match` at all.
   */
  get parseText(): string {
    return this.contents?.trim() ? this.contents : `// Blank file ${this.file}`
  }

  /**
   * Take on the result of an incremental parse of our `parseText` -- see `SpellProject.updateText()`.
   * - SIDE EFFECT: clears `AST` / `compiled`, to rebuild from the new `match`.
   */
  setParsed(parse: P.IncrementalParse): void {
    batch(() => {
      this.setState("scope", parse.scope as P.FileScope)
      this.setState("inputLines", this.contents?.split("\n"))
      this.setState("match", parse.match)
      this.resetState("AST", "compiled")
    })
  }

  /**
   * Where parse errors are logged as files parse -- none by default:  the parser has no console of its own.
   * - The app points it at the console of the runtime its programs run on, so they show in "Program Output".
   * - NOT `spellCore.console`:  the parser MUST NOT load `spellCore` -- each runner runs its own copy.  See
   *   `spellRuntime.ts`.
   */
  static errorConsole?: { error(...args: unknown[]): void }

  /** Show our `match`'s parse errors on `SpellFile.errorConsole`, if there is one. */
  logParseErrors(): void {
    const log = SpellFile.errorConsole
    if (!log) return
    const errors = this.match && SP.Block.getParseErrors(this.match)
    errors?.forEach((error) => {
      // TODO(ast): remove cast when AST/ASTNode typing lands -- `.value` is subclass-specific.
      const value = (error.AST as unknown as { value: string } | undefined)?.value
      let message = `${value} on line ${error.line! + 1}`
      const fileScope = error.getScopeOfType(P.FileScope)
      if (fileScope) message += ` of ${fileScope.name}`
      log.error(error, message)
    })
  }

  /** Compile our content. */
  async compile(parentScope?: P.Scope): Promise<string | undefined> {
    const match = await this.parse(parentScope)
    batch(() => {
      this.setState("AST", match?.AST)
      this.setState("compiled", match?.compile() as string | undefined)
    })
    return this.compiled
  }

  ////////////////
  // ## Loading / Saving
  ////////////////

  /** Update file contents when you do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  /*@proto*/ get autoUpdateContentsOnSave(): boolean {
    return true
  }

  /** URL to serve the file. */
  get url(): string {
    return `/api/projects/file/${this.projectId}${this.filePath}`
  }

  ////////////////
  // ## Debug
  ////////////////

  /** Debug string: `ClassName: path`. */
  toString(): string {
    return `${this.constructor.name}: ${this.path}`
  }
}
