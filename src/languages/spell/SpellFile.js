import global from "global"
import { observable, computed } from "mobx"
import { TextFile, Registry, proto, memoize, forward, writeOnce, overrideable } from "../../util"
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
  /**
   * Use `SpellFile.for("path")` to get a singleton instance back for the path.
   */
  static for = new Registry(path => new SpellFile(path))

  /**
   * NOTE: don't create these directly!
   * Use `SpellFile.for("path")` to get a singleton instance back for the path.
   */
  constructor(path) {
    super({ path })
    if (!this.location.isValidFilePath) throw new TypeError(`SpellFile initialized with invalid path '${this.path}'`)
  }

  /**
   * Project path as `/project/<projectId>/<filename>` or `/library/<projectId>/<filename>`.
   * MUST be passed to constructor.
   */
  @writeOnce path

  /** `location` object which we can use to get various bits of the path. */
  @forward("projectPath", "projectName", "filePath", "folder", "fileName", "name", "extension")
  get location() {
    return SpellFileLocation.for(this.path)
  }

  /**
   * Return our `project` as a `SpellProject` based on our `path`.
   */
  get project() {
    return SpellProject.for(this.projectPath)
  }

  // ///////////////////////
  //  Parsing / Compiling
  // ///////////////////////

  /**
   * Load our content and attempt to parse it!
   * Pass an explicit `spellParser` if the file is, e.g. building on other files.
   */
  async parse(spellParser = coreSpellParser) {
    await this.load()
    return spellParser.parse(this.contents, "block")
  }

  /**
   * Load, parse and compile our content.
   * Pass an explicit `spellParser` if the file is, e.g. building on other files.
   */
  async compile(spellParser) {
    return (await this.parse(spellParser)).compile()
  }

  // ///////////////////////
  //  Loading / Saving
  // ///////////////////////

  /** Update file contents when you  do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  @proto autoUpdateContentsOnSave = true

  /** Derive `url` from our projectId / filename if not explicitly set. */
  @overrideable get url() {
    return `/api/${this.path}`
  }
}

global.SpellFile = SpellFile
