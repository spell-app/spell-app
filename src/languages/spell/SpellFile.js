import global from "global"
import { observable, computed } from "mobx"
import { TextFile, Registry, proto, memoize, forward, writeOnce, overrideable } from "../../util"
import { spellParser as coreSpellParser } from "."
import { SpellProject } from "./SpellProject"
import { SpellFileLocation } from "./SpellFileLocation"
/**
 * Loadable file of spell code.
 */
export class SpellFile extends TextFile {
  /** Update file contents when you  do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  @proto autoUpdateContentsOnSave = true

  /**
   * Project path as `project/<projectId>/<filename>` or `library/<projectId>/<filename>`.
   * MUST be passed to constructor.
   */
  @writeOnce path

  /**
   * Constructor which expects ONLY `project/<projectId>/<filename>`.
   * NOTE: Prefer `SpellFile.get(<path>)` to get a consistent singleton instance
   *       rather than creating them individually via `new`.
   */
  constructor(path) {
    super({ path })
    if (!this.location.isValidFilePath) throw new TypeError(`SpellFile initialized with invalid path '${this.path}'`)
  }

  /** `location` object which we can use to get various bits of the path. */
  @forward("projectPath", "projectName", "filePath", "folder", "fileName", "name", "extension")
  @memoize
  get location() {
    return new SpellFileLocation(this.path)
  }

  /**
   * Return our `project` as a `SpellProject` based on our `path`.
   */
  get project() {
    return SpellProject.get(this.projectPath)
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

  /** Derive `url` from our projectId / filename if not explicitly set. */
  @overrideable get url() {
    return `/api/${this.path}`
  }

  /**
   * Use `SpellFile.get("project/<projectId>/<filename>")` to get a singleton instance back for that path.
   */
  static get = new Registry(path => new SpellFile(path))
}

global.SpellFile = SpellFile
