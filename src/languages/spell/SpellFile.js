import global from "global"

import { TextFile, state, proto, memoize, forward, writeOnce, overrideable, batch } from "~/util"
import { ProjectScope, FileScope } from "~/parser"
import { SpellParser, SpellProject, SpellFileLocation } from "~/languages/spell"

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
  }

  /**
   * Path to file, as specified by server.
   * MUST be passed to constructor.
   */
  @writeOnce path

  /** `location` object which we can use to get various bits of the path. */
  @forward("project", "projectId", "projectName", "filePath", "folder", "fileName", "name", "extension")
  @memoize
  get location() {
    return new SpellFileLocation(this.path)
  }

  /**
   * Return our `created` time according to the server as a timestamp.
   */
  get created() {
    return this.project.getFileInfo(this.path).created
  }

  /**
   * Return our `modified` time according to the server as a timestamp.
   * NOTE: this may be out of sync if we've been modified on the client.
   */
  get modified() {
    return this.project.getFileInfo(this.path).modified
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
    if (parentScope && parentScope.types) return new FileScope({ name: this.fileName, scope: parentScope })
    // Otherwise set up as an ad-hoc `Project` and clone `SpellParser.rootScope.parser`
    console.warn(`spellFile.getScope(): no parentScope`)
    return new ProjectScope({
      name: this.fileName,
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
      const match = this.scope.parse(this.contents, "block")
      this.set("_state.match", match)
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
}

global.SpellFile = SpellFile
