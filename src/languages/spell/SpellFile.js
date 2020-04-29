import global from "global"
import prettier from "prettier/standalone"
import babylon from "prettier/parser-babylon"

import { TextFile, batch, prop, proto, memoize, forward, writeOnce, overrideable } from "../../util"
import { spellParser as coreSpellParser } from "."
import { SpellProject } from "./SpellProject"
import { SpellFileLocation } from "./SpellFileLocation"

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
    // Create instance if not already present in registry
    if (!SpellFile.registry.has(path)) {
      const instance = super({ path })
      if (!instance.location.isValidFilePath)
        throw new TypeError(`SpellFile initialized with invalid path '${this.path}'`)
      SpellFile.registry.set(path, instance)
    }
    return SpellFile.registry.get(path)
  }

  /** We've been removed from the server -- clean up memory, etc.. */
  onRemove() {
    super.onRemove()
    SpellFile.registry.clear(this.path)
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
  // Parsing / Compiling
  //-----------------

  /** Our parser. */
  @prop parser = undefined

  /** Results of our last `parse()` as a `Match`. */
  @prop matched = undefined

  /** Our `compiled` output as javascript. */
  @prop compiled = undefined

  /**
   * Load our content and attempt to parse it!
   * Pass an explicit `spellParser` if the file is, e.g. building on other files.
   */
  async parse(parser = coreSpellParser) {
    this.set({ parser, matched: undefined, compiled: undefined })
    await this.load()
    this.matched = this.parser.parse(this.contents, "block")
    return this.matched
  }

  /**
   * Load, parse and compile our content.
   * Pass an explicit `spellParser` if the file is, e.g. building on other files.
   */
  async compile(parser = coreSpellParser) {
    const output = (await this.parse(parser)).compile()
    batch(() => {
      this.compiled = output
      try {
        // Use prettier to format the output.  This will throw if the code is bad.
        this.compiled = prettier.format(output, { parser: "babel", plugins: [babylon] })
      } catch (e) {
        console.warn("Prettier error:", e)
      }
    })
  }

  /** Clear all of our compiled goop. */
  clearCompiled() {
    this.set({ parser: undefined, matched: undefined, compiled: undefined })
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

  /** Derive `url` from our projectId / filename if not explicitly set. */
  @overrideable get url() {
    return `/api${this.path}`
  }

  /** When our contents are changed, update our parser vars. */
  setContents(...args) {
    this.clearCompiled()
    return super.setContents(...args)
  }
}

global.SpellFile = SpellFile
