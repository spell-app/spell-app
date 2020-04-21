import global from "global"
import { TextFile, Registry, proto, overrideableGetter } from "../../util"
import { spellParser as coreSpellParser } from "."
/**
 * Loadable file of spell code.
 */
export class SpellFile extends TextFile {
  /** Project name. Required. */
  @proto project = undefined
  /** File name. Required. */
  @proto filename = undefined
  /** Update file contents when you  do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  @proto autoUpdateContentsOnSave = true

  /**
   * Constructor which expects ONLY `project/filename` or `{ project, filename }`.
   * NOTE: Prefer `SpellFile.get("project/filename")` to get a consistent singleton instance
   *       rather than creating them individually via `new`.
   */
  constructor(props) {
    if (typeof props === "string") props = SpellFile.splitPath(props)
    super(props)
  }

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

  /** Derive `url` from our project / filename if not explicitly set. */
  @overrideableGetter get url() {
    return `/api/projects/${this.path}`
  }

  /**
   * Split string path into `{ project, filename }`.
   * Throws if path is not a string or is malformed!
   */
  static splitPath(path) {
    const [project, ...filePath] = typeof path === "string" ? path.split("/") : []
    if (!project || !filePath.length) {
      throw new TypeError(`SpellFile.splitPath('${path}'): invalid path`)
    }
    return { project, filename: filePath.join("/") }
  }

  /**
   * Join `{ project, filename }` into project path, ignoring other props.
   * Throws if `project` or `filename` is not a valid string.
   */
  static joinPath({ project, filename } = {}) {
    if (typeof project !== "string" || !project)
      throw new TypeError(`SpellFile.joinPath(): invalid project '${project}'`)
    if (typeof filename !== "string" || !filename)
      throw new TypeError(`SpellFile.joinPath(): invalid filename '${filename}'`)
    return `${project}/${filename}`
  }

  /**
   * Use `SpellFile.get("project/filename")` to get a singleton instance back for that path.
   */
  static get = new Registry(path => new SpellFile(SpellFile.splitPath(path)))
}

global.SpellFile = SpellFile
