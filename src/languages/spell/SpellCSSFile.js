import global from "global"

import { TextFile, proto, memoize, forward, writeOnce, overrideable, state } from "~/util"
import { Token } from "~/parser"
import { SpellProject, SpellFileLocation } from "~/languages/spell"
import { batch } from "../../util"

/**
 * CSS file as part of SpellProject.
 *
 * Note that these are singleton instances --
 * you'll always get the same object back for a given `path`.
 */
export class SpellCSSFile extends TextFile {
  /** Registry of known instances. */
  static registry = new Map()
  constructor(path) {
    // Create instance if not already present in registry
    if (!SpellCSSFile.registry.has(path)) {
      const instance = super({ path })
      if (!instance.location.isValidFilePath)
        throw new TypeError(`SpellCSSFile initialized with invalid path '${this.path}'`)
      SpellCSSFile.registry.set(path, instance)
    }
    return SpellCSSFile.registry.get(path)
  }

  /** We've been removed from the server -- clean up memory, etc.. */
  onRemove() {
    super.onRemove()
    SpellCSSFile.registry.clear(this.path)
  }

  /**
   * Project path as `/project/<projectId>/<filename>` or `/library/<projectId>/<filename>`.
   * MUST be passed to constructor.
   */
  @writeOnce path

  /** `location` object which we can use to get various bits of the path. */
  @forward("projectPath", "projectName", "filePath", "folder", "fileName", "name", "extension")
  @memoize
  get location() {
    return new SpellFileLocation(this.path)
  }

  /**
   * Return our `project` as a `SpellProject` based on our `path`.
   */
  @memoize get project() {
    return new SpellProject(this.projectPath)
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
  //  Compiling/etc
  //-----------------

  /** Our scope with which we've compiled. */
  @state scope = undefined

  /** Results of our last `parse()` as a `Match`. */
  @state match = undefined

  /** AST for our `compiled` output. */
  @state AST = undefined

  /** Our `compiled` output as javascript. */
  @state compiled = undefined

  /** Reset our compiled state. */
  resetCompiled() {
    this.resetState("scope", "match", "AST", "compiled")
  }

  /**
   * Return a `Scope` for parsing this file, which is always the `rootScope`.
   * TODO... ????
   */
  getScope() {
    return SpellParser.rootScope
  }

  /** Reset our compiled state. */
  resetCompiled() {
    this.resetState("scope", "match", "AST", "compiled")
  }

  /** "parse" the css file */
  async parse(parentScope) {
    if (this.match) return this.match
    await this.load()
    this.resetCompiled()
    const token = new Token.Text({ value: this.contents, raw: this.contents, offset: 0 })
    const scope = this.getScope(parentScope)
    const match = scope.parse([token], "css")
    // HACK
    match.fileName = this.name
    batch(() => {
      this.set("_state.scope", scope)
      this.set("_state.match", match)
    })
    return this.match
  }

  /** "compile" the CSS file  */
  async compile(parentScope) {
    const match = await this.parse(parentScope)
    batch(() => {
      this.set("_state.AST", match.AST)
      this.set("_state.compiled", match.compile())
    })
    return this.compiled
  }

  //-----------------
  //  Loading / Saving
  //-----------------

  /** Update file contents when you  do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  @proto autoUpdateContentsOnSave = true

  /** Derive `url` from our projectId / filename if not explicitly set. */
  @overrideable get url() {
    return `/api${this.path}`
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
