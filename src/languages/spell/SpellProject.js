import global from "global"
import keyBy from "lodash/keyBy"

import { JSON5File, proto, memoizeForProp, overrideableGetter, Registry } from "../../util"
import { SpellFile } from "./SpellFile"

/**
 * Loadable spell project index.
 */
export class SpellProject extends JSON5File {
  /** Project name. */
  @proto projectId = undefined
  /** Update file contents when you  do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  @proto autoUpdateContentsOnSave = true

  /**
   * Constructor which expects ONLY `projectId` or `{ projectId }`.
   * NOTE: Prefer `SpellProject.get("projectId")` to get a consistent singleton instance
   *       rather than creating them individually via `new`.
   */
  constructor(props) {
    if (typeof props === "string") props = { projectId: props }
    super(props)
  }

  /**
   * Return list of `SpellFiles` in the index.
   * Returns `undefined` if we're not loaded.
   */
  @memoizeForProp("contents") get files() {
    return this.contents?.files?.map(({ name }) =>
      SpellFile.get(SpellFile.joinPath({ projectId: this.projectId, filename: name }))
    )
  }

  /**
   * Return map of `SpellFiles` in the index.
   * Returns `undefined` if we're not loaded.
   */
  @memoizeForProp("files") get fileMap() {
    const { files } = this
    return files && keyBy(files, "filename")
  }

  /** Derive `url` from our projectId if not explicitly set. */
  @overrideableGetter get url() {
    return `/api/projects/${this.projectId}/index`
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
   * Use `SpellProject.get("projectId")` to get a singleton SpellProject back for the project.
   */
  static get = new Registry(projectId => new SpellProject({ projectId }))
}

global.SpellProject = SpellProject
