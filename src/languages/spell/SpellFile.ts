import { TextFile, batch } from "~/util"
import { P } from "~/parser"
import { SP } from "~/languages/spell"
import { spellCore } from "~/spellCore"

/**
 * `rules/Block.js` (still untyped JS) attaches an ad-hoc `errors` array of `Match`es
 * to top-level `block` match on parse failures.  It's not part of core `Match` shape.
 */
type MatchWithErrors = P.Match & { errors?: P.Match[] }

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
      // HACK: things get wierd downstream if we don't get a `match` at all
      // If contents is empty, use a default comment so we'll at least match something.
      const contents = this.contents!.trim() ? this.contents! : `// Blank file ${this.file}`
      const match = this.scope!.parse(contents, "block") as MatchWithErrors | undefined
      // console.warn(this.filePath, match)
      this.setState("match", match)
      // Show errors on the console
      if (match?.errors) {
        match.errors.forEach((error) => {
          // TODO(ast): remove cast when AST/ASTNode typing lands -- `.value` is subclass-specific.
          const value = (error.AST as unknown as { value: string } | undefined)?.value
          let message = `${value} on line ${error.line! + 1}`
          const fileScope = error.getScopeOfType(P.FileScope)
          if (fileScope) message += ` of ${fileScope.name}`
          spellCore.console.error(error, message)
        })
      }
    })
    return this.match
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

  /**
   * Execute our `compiled` code.  No-op if not compiled.
   * - SIDE EFFECT: creates (or replaces) a `<script type="module">` element in `document.body` and lets
   *   it eval `compiled` as an ES module.
   * - NOTE: browser-only -- touches `document` directly.  That's fine even though this whole module is
   *   reachable from the server via `~/languages/spell`'s barrel (see `src/server/project-utils.ts`),
   *   since the server never calls this method.
   */
  executeCompiled(): void {
    const { contents, compiled } = this
    if (!compiled) return
    console.group("attempting to execute compiled output:")
    console.groupCollapsed("spell")
    console.info(contents)
    console.groupEnd()
    console.groupCollapsed("javascript")
    console.info(compiled)
    console.groupEnd()

    // add all types to `global` for local hacking
    try {
      const scriptEl = document.createElement("script")
      scriptEl.setAttribute("id", "compileOutput")
      scriptEl.setAttribute("type", "module")
      scriptEl.innerHTML = compiled

      const existingEl = document.getElementById("compileOutput")

      if (existingEl) {
        existingEl.replaceWith(scriptEl)
      } else {
        document.body.append(scriptEl)
      }
    } catch (e) {
      console.error("error evaling output:", e)
    }
    // groupEnd() in a tick after contents execute
    setTimeout(() => console.groupEnd(), 100)
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
  // ## Rendering utilities
  ////////////////

  /** Convert CodeMirror Position: `{ line, ch }` to char `offset`. */
  offsetForPosition({ line, ch }: { line: number; ch: number }): number | undefined {
    if (!this.inputLines) return undefined
    if (line === 0) return ch
    return this.inputLines.slice(0, line).join("\n").length + 1 + ch
  }

  /** Convert char `offset` to CodeMirror Position: `{ line, ch }`. */
  positionForOffset(offset: number): { line: number; ch: number } {
    let line = 0
    let ch = 0
    if (typeof this.contents === "string") {
      // TODO: offset + 1?
      const lines = this.contents.substr(0, offset).split("\n")
      line = lines.length - 1
      ch = lines[line].length
    }
    return { line, ch }
  }

  ////////////////
  // ## Debug
  ////////////////

  /** Debug string: `ClassName: path`. */
  toString(): string {
    return `${this.constructor.name}: ${this.path}`
  }
}
