import { TextFile, batch } from "~/util"
import { Tokens, RootScope, type Scope, type Match } from "~/parser"
import type { ASTNode } from "~/parser/ast/AST"
import { SpellLocation, SpellProject, SpellParser } from "~/languages/spell"
import type { ProjectManifestEntry } from "./SpellProject"

/**
 * CSS file as part of SpellProject.
 *
 * Note that these are singleton instances --
 * you'll always get the same object back for a given `path`.
 */
export class SpellCSSFile extends TextFile {
  /** Registry of known instances. */
  static registry = new Map<string, SpellCSSFile>()
  constructor(path: string) {
    // Return immediately from registry if already present.
    const existing = SpellCSSFile.registry.get(path)
    if (existing) return existing

    super({})
    Object.assign(this, { path })
    if (!this.location.isFilePath) {
      throw new TypeError(`new SpellCSSFile('${path}'): Must be initialized with valid file path.`)
    }
    SpellCSSFile.registry.set(path, this)
  }

  /** We've been removed from the server -- clean up memory, etc.. */
  onRemove(): void {
    super.onRemove()
    SpellCSSFile.registry.clear()
    SpellLocation.registry.clear()
  }

  /**
   * Path to file, as specified by server.
   * MUST be passed to constructor.
   */
  /*@writeOnce path*/
  declare path: string

  /** `location` object which we can use to get various bits of the path. */
  /*@forward("projectId", "projectName", "filePath", "folder", "file", "fileName", "extension")*/
  /*@memoize*/
  get location(): SpellLocation {
    return this.derived("location", () => new SpellLocation(this.path))
  }
  get projectId(): string {
    return this.location.projectId
  }
  get projectName(): string | undefined {
    return this.location.projectName
  }
  get filePath(): string | undefined {
    return this.location.filePath
  }
  get folder(): string | undefined {
    return this.location.folder
  }
  get file(): string | undefined {
    return this.location.file
  }
  get fileName(): string | undefined {
    return this.location.fileName
  }
  get extension(): string | undefined {
    return this.location.extension
  }

  /**
   * Pointer to our `SpellProject`.
   */
  /*@memoize*/
  get project(): SpellProject {
    return this.derived("project", () => new SpellProject(this.projectId))
  }

  /**
   * Return promise which yields our `info` record according to the project manifest.
   * Note that `modified` and `size` may be out of sync if we've been modified on the client.
   */
  get info(): ProjectManifestEntry | undefined {
    return this.project.getFileInfo(this.path)
  }

  //-----------------
  //  Compiling/etc
  //-----------------

  /** Our scope with which we've compiled. */
  /*@state*/ get scope(): RootScope | undefined {
    return this.getState("scope", () => undefined)
  }
  set scope(scope: RootScope | undefined) {
    this.setState("scope", scope)
  }

  /** Results of our last `parse()` as a `Match`. */
  /*@state*/ get match(): Match | undefined {
    return this.getState("match", () => undefined)
  }
  set match(match: Match | undefined) {
    this.setState("match", match)
  }

  /** AST for our `compiled` output. */
  /*@state*/ get AST(): ASTNode | undefined {
    return this.getState("AST", () => undefined)
  }
  set AST(AST: ASTNode | undefined) {
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
    this.resetState("scope", "match", "AST", "compiled")
  }

  /**
   * Return a `Scope` for parsing this file, which is always the `rootScope`.
   * TODO... ????
   */
  getScope(_parentScope?: Scope): RootScope {
    return SpellParser.rootScope
  }

  /** "parse" the css file */
  async parse(parentScope?: Scope): Promise<Match | undefined> {
    if (this.match) return this.match
    await this.load(undefined)
    this.resetCompiled()
    const token = new Tokens.Text({ value: this.contents, raw: this.contents, offset: 0 })
    const scope = this.getScope(parentScope)
    // NOTE: `Scope.parse()` is typed for string input only; call `parser.parse()` directly
    // (exactly what `Scope.parse()` would do internally) so we can pass tokens instead.
    const match = scope.parser?.parse([token], "css", scope)
    batch(() => {
      this.setState("scope", scope)
      this.setState("match", match)
    })
    return this.match
  }

  /** "compile" the CSS file  */
  async compile(parentScope?: Scope): Promise<string | undefined> {
    const match = await this.parse(parentScope)
    batch(() => {
      this.setState("AST", match?.AST)
      this.setState("compiled", match?.compile() as string | undefined)
    })
    return this.compiled
  }

  //-----------------
  //  Loading / Saving
  //-----------------

  /** Update file contents when you  do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  /*@proto*/ get autoUpdateContentsOnSave(): boolean {
    return true
  }

  /** Derive `url` from our `path` if not explicitly set. */
  /*@overridable*/ get url(): string {
    return `/api/projects/file/${this.projectId}${this.filePath}`
  }
  set url(url: string) {
    this.override("url", { get: () => url })
  }

  //-----------------
  //  Rendering utilities
  //-----------------

  /** Convert CodeMirror Position: `{ line, ch }` to char `offset`. */
  offsetForPosition(_position: { line: number; ch: number }): number | undefined {
    // NOTE: unlike `SpellFile`, `SpellCSSFile` never tracks `inputLines`, so this always returns `undefined`.
    return undefined
  }

  //-----------------
  //  Debug
  //-----------------
  toString(): string {
    return `${this.constructor.name}: ${this.path}`
  }
}
