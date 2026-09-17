import global from "global"

import { TextFile, batch } from "~/util"
import { ProjectScope, FileScope, type Scope, type Match } from "~/parser"
import type { ASTNode } from "~/parser/ast/AST"
import { SpellProject, SpellParser, SpellLocation } from "~/languages/spell"
import { spellCore } from "~/spellCore"
import type { ProjectManifestEntry } from "./SpellProject"

/**
 * `rules/Block.js` (still untyped JS) attaches an ad-hoc `errors` array of `Match`es
 * to the top-level `block` match on parse failures. It's not part of the core `Match` shape.
 */
type MatchWithErrors = Match & { errors?: Match[] }

/**
 * Loadable file of spell code located at `path`.
 *
 * Note that these are singleton instances --
 * you'll always get the same object back for a given `path`.
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

  /** We've been removed from the server -- clean up memory, etc.. */
  onRemove(): void {
    super.onRemove()
    SpellFile.registry.clear()
    SpellLocation.registry.clear()
  }

  /**
   * Path to file, as specified by server.
   * MUST be passed to constructor.
   */
  /*@writeOnce path*/
  declare path: string

  /**
   * Return `location` object as a SpellLocation which we use to get various bits of our `path`.
   */
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
  // Parsing / Compiling
  //-----------------

  /** Our scope with which we've compiled. */
  /*@state*/ get scope(): FileScope | ProjectScope | undefined {
    return this.getState("scope", () => undefined)
  }
  set scope(scope: FileScope | ProjectScope | undefined) {
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
    this.resetState("scope", "inputLines", "match", "AST", "compiled")
  }

  /**
   * Return a `Scope` for parsing this file.
   * Note that if our `parentScope` is NOT the `rootScope`,
   * we'll use the same parser.  This will ensure that
   */
  getScope(parentScope: Scope | undefined): FileScope | ProjectScope {
    // If we were passed a `parentScope` with `types`, set up as a `FileScope` and use same parser.
    if (parentScope && parentScope.types) {
      return new FileScope({
        name: this.file,
        path: this.path,
        parentScope
      })
    }
    // Otherwise set up as an ad-hoc `Project` and clone `SpellParser.rootScope.parser`
    console.warn(`spellFile.getScope(): no parentScope for ${this.filePath}`)
    return new ProjectScope({
      name: this.file,
      path: this.path,
      parser: SpellParser.rootScope.parser!.clone({ module: this.path }),
      parentScope: SpellParser.rootScope
    })
  }

  /**
   * Load our content and attempt to parse it!  Returns a `Match` (available as `this.match`).
   * NOTE: if `this.match` is set, we'll assume that's OK.
   * Use `spellFile.resetCompiled()` to clear it.
   * Pass an explicit `parentScope` if the file is, e.g. building on other files.
   */
  async parse(parentScope?: Scope): Promise<Match | undefined> {
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
          const fileScope = error.getScopeOfType(FileScope)
          if (fileScope) message += ` of ${fileScope.name}`
          spellCore.console.error(error, message)
        })
      }
    })
    return this.match
  }

  /**
   * Compile our content.
   */
  async compile(parentScope?: Scope): Promise<string | undefined> {
    const match = await this.parse(parentScope)
    batch(() => {
      this.setState("AST", match?.AST)
      this.setState("compiled", match?.compile() as string | undefined)
    })
    return this.compiled
  }

  /* Execute our `compiled` code. No-op if not compiled. */
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

  //-----------------
  //  Loading / Saving
  //-----------------

  /** Update file contents when you  do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  /*@proto*/ get autoUpdateContentsOnSave(): boolean {
    return true
  }

  /** URL to serve the file. */
  get url(): string {
    return `/api/projects/file/${this.projectId}${this.filePath}`
  }

  //-----------------
  //  Rendering utilities
  //-----------------

  /** Convert CodeMirror Position: `{ line, ch }` to char `offset`. */
  offsetForPosition({ line, ch }: { line: number; ch: number }): number | undefined {
    if (!this.inputLines) return undefined
    if (line === 0) return ch
    return this.inputLines.slice(0, line).join("\n").length + 1 + ch
  }

  /** Convert char `offset` to CodeMirror Position: `{ line, ch }` */
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

  //-----------------
  //  Debug
  //-----------------
  toString(): string {
    return `${this.constructor.name}: ${this.path}`
  }
}

global.SpellFile = SpellFile
