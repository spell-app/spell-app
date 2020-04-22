import assert from "assert"
import global from "global"
import keyBy from "lodash/keyBy"
import { observable, computed } from "mobx"

import { JSON5File, proto, memoizeForProp, overrideableGetter, Registry } from "../../util"
import { SpellFile } from "./SpellFile"

/**
 * Loadable spell project index.
 */
export class SpellProject extends JSON5File {
  /** Update file contents when you  do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  @proto autoUpdateContentsOnSave = true

  /**
   * Project path as `project/<projectId>` or `library/<projectId>`.
   * MUST be passed to constructor.
   */
  @observable path = ""

  /**
   * Constructor which expects ONLY `project/<projectId>` or `library/</projectId>`.
   * NOTE: Prefer `SpellProject.get("project/projectId")` to get
   *       a consistent singleton instance rather than creating via `new`.
   */
  constructor(path) {
    SpellProject.validateProjectPath(path)
    super()
    this.path = path
  }

  // ///////////////////////
  //  Syntactic sugar
  // ///////////////////////

  /**
   * Return our `type` based on our `path`
   */
  get type() {
    return SpellProject.splitPath(this.path).type
  }

  /**
   * Return our `projectId` based on our `path`
   */
  get projectId() {
    return SpellProject.splitPath(this.path).projectId
  }

  /**
   * Return list of `SpellFiles` in the index.
   * Returns `undefined` if we're not loaded.
   */
  @memoizeForProp("contents") get files() {
    return this.contents?.files?.map(({ path }) => SpellFile.get(path))
  }

  /**
   * Return map of `SpellFiles` in the index.
   * Returns `undefined` if we're not loaded.
   */
  @memoizeForProp("files") get fileMap() {
    const { files } = this
    return files && keyBy(files, "filename")
  }

  /** LOADING AND SAVING */

  /** Derive `url` from our projectId if not explicitly set. */
  @overrideableGetter get url() {
    return `/api/${this.path}/.manifest`
  }

  /**
   * Attempt to load all of the files, succeeding whether they all load or not.
   * Result is the array of files.
   */
  async loadAllFiles() {
    await this.load()
    await Promise.allSettled(this.files.map(file => file.load()))
    return this.files
  }

  /** Synchronously get file by name. Assumes index is loaded. */
  getFile(filename) {
    return this.fileMap?.[filename]
  }

  /** Get file or throw an error if it's not found (or if index is not loaded). */
  getFileOrDie(filename) {
    const file = this.getFile(filename)
    if (!file) throw new Error(`SpellProject '${this.projectId}': file '${filename}' not found.`)
    return file
  }

  /** Asynchronously load file by name. Loads index if necessary. */
  async loadFile(filename) {
    await this.load()
    return this.getFileOrDie(filename).load()
  }

  /**
   * Split project `path` into `{ type, projectId, filename, extension }`
   */
  static splitPath(path) {
    assert(typeof path === "string", `Invalid project path '${path}: must be a string`)
    const [type, projectId, ...filePath] = path.split("/")
    const filename = filePath.length ? filePath.join("/") : undefined
    let extension = ""
    if (filePath.length) {
      extension = `.${filePath
        .reverse()[0]
        .split(".")
        .slice(1)
        .join(".")}`
    }
    return { type, projectId, filename, extension }
  }

  /** Validate path for a project. */
  static validateProjectPath(path) {
    const { type, projectId, filename } = SpellProject.splitPath(path)
    assert(
      type === "project" || type === "library",
      `Invalid project path '${path}': must start with 'project' or 'library'.`
    )
    assert(projectId.length > 0, `Invalid project path '${path}': invalid projectId.`)
    assert(filename === undefined, `Invalid project path '${path}': must not specify filename`)
  }

  /** Validate path for a project file. */
  static validateProjectFilePath(path) {
    const { type, projectId, filename } = SpellProject.splitPath(path)
    assert(
      type === "project" || type === "library",
      `Invalid project path '${path}': must start with 'project' or 'library'.`
    )
    assert(projectId.length > 0, `Invalid project path '${path}': invalid projectId.`)
    assert(typeof filename === "string" && filename, `Invalid project path '${path}': filename must be a string`)
  }

  /**
   * Use `SpellProject.get("project/<projectId>")` to get a singleton instance back for the project.
   */
  static get = new Registry(path => new SpellProject(path))
}

global.SpellProject = SpellProject
