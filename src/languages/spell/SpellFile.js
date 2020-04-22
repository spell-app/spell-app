import global from "global"
import { observable, computed } from "mobx"
import { TextFile, Registry, proto, overrideable } from "../../util"
import { spellParser as coreSpellParser } from "."
import { SpellProject } from "./SpellProject"
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
  @observable path = ""

  /**
   * Constructor which expects ONLY `project/<projectId>/<filename>`.
   * NOTE: Prefer `SpellFile.get(<path>)` to get a consistent singleton instance
   *       rather than creating them individually via `new`.
   */
  constructor(path) {
    // SpellProject.validateProjectFilePath(path)
    super()
    this.path = path
  }

  // ///////////////////////
  //  Syntactic sugar
  // ///////////////////////

  /**
   * Return our `projectId` based on our `path`.
   */
  @computed get projectId() {
    return SpellProject.splitPath(this.path).projectId
  }

  /**
   * Return our `filename` based on our `path`.
   */
  get filename() {
    return SpellProject.splitPath(this.path).filename
  }

  /**
   * Return our `extension` based on our `path`.
   */
  get extension() {
    return SpellProject.splitPath(this.path).extension
  }

  /**
   * Return our `project` as a `SpellProject` based on our `path`.
   */
  get project() {
    const { type, projectId } = SpellProject.splitPath(this.path)
    return SpellProject.get(`${type}/${projectId}`)
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

  /** Return our `path` */
  get path() {
    return SpellFile.joinPath(this)
  }

  /** Derive `url` from our projectId / filename if not explicitly set. */
  @overrideable get url() {
    return `/api/${this.path}`
  }

  /**
   * Split string path into `{ projectId, filename }`.
   * Throws if path is not a string or is malformed!
   */
  static splitPath(path) {
    const [projectId, ...filename] = typeof path === "string" ? path.split("/") : []
    if (!projectId || !filename.length) {
      throw new TypeError(`SpellFile.splitPath('${path}'): invalid path`)
    }
    return { projectId, filename: filename.join("/") }
  }

  /**
   * Join `{ projectId, filename }` into project path, ignoring other props.
   * Throws if `projectId` or `filename` is not a valid string.
   */
  static joinPath({ projectId, filename } = {}) {
    if (typeof projectId !== "string" || !projectId)
      throw new TypeError(`SpellFile.joinPath(): invalid project '${projectId}'`)
    if (typeof filename !== "string" || !filename)
      throw new TypeError(`SpellFile.joinPath(): invalid filename '${filename}'`)
    return `${projectId}/${filename}`
  }

  /**
   * Use `SpellFile.get("project/<projectId>/<filename>")` to get a singleton instance back for that path.
   */
  static get = new Registry(path => new SpellFile(path))
}

global.SpellFile = SpellFile
