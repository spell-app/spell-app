import global from "global"

import { TextFile, state, proto, memoize, forward, writeOnce, overridable, batch } from "~/util"
import { ProjectScope, FileScope } from "~/parser"
import { spellCore, SpellProject, SpellParser, SpellLocation } from "~/languages/spell"

/**
 * Loadable file of spell code located at `path`.
 *
 * Note that these are singleton instances --
 * you'll always get the same object back for a given `path`.
 */
export class SpellFile extends TextFile {
  /** Registry of known instances. */
  static registry = new Map()
  constructor(path) {
    // Return immediately from registry if already present.
    const existing = SpellFile.registry.get(path)
    if (existing) return existing

    super({ path })
    if (!this.location.isFilePath) {
      throw new TypeError(`new SpellFile('${path}'): Must be initialized with valid file path.`)
    }
    SpellFile.registry.set(path, this)
  }

  /** We've been removed from the server -- clean up memory, etc.. */
  onRemove() {
    super.onRemove()
    SpellFile.registry.clear(this.path)
    SpellLocation.registry.clear(this.path)
  }

  /**
   * Path to file, as specified by server.
   * MUST be passed to constructor.
   */
  @writeOnce path

  /**
   * Return `location` object as a SpellLocation which we use to get various bits of our `path`.
   */
  @forward("projectId", "projectName", "filePath", "folder", "file", "fileName", "extension")
  @memoize
  get location() {
    return new SpellLocation(this.path)
  }

  /**
   * Pointer to our `SpellProject`.
   */
  @memoize
  get project() {
    return new SpellProject(this.projectId)
  }

  /**
   * Return promise which yields our `info` record according to the project manifest.
   * Note that `modified` and `size` may be out of sync if we've been modified on the client.
   */
  get info() {
    return this.project.getFileInfo(this.path)
  }

  //-----------------
  // Parsing / Compiling
  //-----------------

  /** Our scope with which we've compiled. */
  @state scope = undefined

  /** Our input text split into lines, for offset calculations. */
  @state inputLines = undefined

  /** Results of our last `parse()` as a `Match`. */
  @state match = undefined

  /** AST for our `compiled` output. */
  @state AST = undefined

  /** Our `compiled` output as javascript. */
  @state compiled = undefined

  /** Reset our compiled state. */
  resetCompiled() {
    this.resetState("scope", "inputLines", "match", "AST", "compiled")
  }

  /**
   * Return a `Scope` for parsing this file.
   * Note that if our `parentScope` is NOT the `rootScope`,
   * we'll use the same parser.  This will ensure that
   */
  getScope(parentScope) {
    // If we were passed a `parentScope` with `types`, set up as a `FileScope` and use same parser.
    if (parentScope && parentScope.types) {
      return new FileScope({
        name: this.file,
        path: this.path,
        scope: parentScope
      })
    }
    // Otherwise set up as an ad-hoc `Project` and clone `SpellParser.rootScope.parser`
    console.warn(`spellFile.getScope(): no parentScope for ${this.filePath}`)
    return new ProjectScope({
      name: this.file,
      path: this.path,
      parser: SpellParser.rootScope.parser.clone({ module: this.path }),
      scope: SpellParser.rootScope
    })
  }

  /**
   * Load our content and attempt to parse it!  Returns a `Match` (available as `this.match`).
   * NOTE: if `this.match` is set, we'll assume that's OK.
   * Use `spellFile.resetCompiled()` to clear it.
   * Pass an explicit `parentScope` if the file is, e.g. building on other files.
   */
  async parse(parentScope) {
    if (this.match) return this.match
    await this.load()
    this.resetCompiled()
    batch(() => {
      this.set("_state.inputLines", this.contents.split("\n"))
      this.set("_state.scope", this.getScope(parentScope))
      // HACK: things get wierd downstream if we don't get a `match` at all
      // If contents is empty, use a default comment so we'll at least match something.
      const contents = this.contents.trim() ? this.contents : `// Blank file ${this.file}`
      const match = this.scope.parse(contents, "block")
      // console.warn(this.filePath, match)
      this.set("_state.match", match)
      // Show errors on the console
      if (match.errors) {
        match.errors.forEach((error) => {
          let message = `${error.AST.value} on line ${error.line + 1}`
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
  async compile(parentScope) {
    const match = await this.parse(parentScope)
    batch(() => {
      this.set("_state.AST", match.AST)
      this.set("_state.compiled", match.compile())
    })
    return this.compiled
  }

  /* Execute our `compiled` code. No-op if not compiled. */
  executeCompiled() {
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
  @proto autoUpdateContentsOnSave = true

  /** URL to serve the file. */
  get url() {
    return `/api/projects/file/${this.projectId}${this.filePath}`
  }

  //-----------------
  //  Rendering utilities
  //-----------------

  /** Convert CodeMirror Position: `{ line, ch }` to char `offset`. */
  offsetForPosition({ line, ch }) {
    if (!this.inputLines) return undefined
    if (line === 0) return ch
    return this.inputLines.slice(0, line).join("\n").length + 1 + ch
  }

  /** Convert char `offset` to CodeMirror Position: `{ line, ch }` */
  positionForOffset(offset) {
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
  toString() {
    return `${this.constructor.name}: ${this.path}`
  }
}

global.SpellFile = SpellFile
