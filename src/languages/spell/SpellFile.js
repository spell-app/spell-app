import global from "global"
import { TextFile, Registry, proto, overrideableGetter } from "../../util"
import { spellParser as coreSpellParser } from "."
/**
 * Loadable file of spell code.
 */
export class SpellFile extends TextFile {
  /** Project name. Required. */
  @proto projectId = undefined
  /** File name. Required. */
  @proto filename = undefined
  /** Update file contents when you  do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  @proto autoUpdateContentsOnSave = true

  /**
   * Constructor which expects ONLY `projectId/filename` or `{ projectId, filename }`.
   * NOTE: Prefer `SpellFile.get("projectId/filename")` to get a consistent singleton instance
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

  /** Derive `url` from our projectId / filename if not explicitly set. */
  @overrideableGetter get url() {
    return `/api/projects/${this.path}`
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
   * Use `SpellFile.get("projectId/filename")` to get a singleton instance back for that path.
   */
  static get = new Registry(path => new SpellFile(path))
}

global.SpellFile = SpellFile
