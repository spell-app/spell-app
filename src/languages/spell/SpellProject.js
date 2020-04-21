import global from "global"
import keyBy from "lodash/keyBy"

import { JSON5File, proto, memoizeForProp, overrideableGetter, Registry } from "../../util"
import { SpellFile } from "./SpellFile"

/**
 * Loadable spell project index.
 */
export class SpellProject extends JSON5File {
  /** Project name. */
  @proto project = undefined
  /** Update file contents when you  do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  @proto autoUpdateContentsOnSave = true

  /**
   * Constructor which expects ONLY `project` or `{ project }`.
   * NOTE: Prefer `SpellProject.get("project")` to get a consistent singleton instance
   *       rather than creating them individually via `new`.
   */
  constructor(props) {
    if (typeof props === "string") props = { project: props }
    super(props)
  }

  /**
   * Return list of `SpellFiles` in the index.
   * Returns `undefined` if we're not loaded.
   */
  @memoizeForProp("contents") get files() {
    return this.contents?.modules?.map(({ id }) => this._getSpellFile(id))
  }
  _getSpellFile(filePath) {
    const path = SpellFile.joinPath({ project: this.project, filePath })
    return SpellFile.get(path)
  }

  /**
   * Return map of `SpellFiles` in the index.
   * Returns `undefined` if we're not loaded.
   */
  @memoizeForProp("files") get fileMap() {
    const { files } = this
    return files && keyBy(files, "filePath")
  }

  /** Derive `url` from our project if not explicitly set. */
  @overrideableGetter get url() {
    return `/api/projects/${this.project}/index`
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
  getFile(filePath) {
    return this.fileMap?.[filePath]
  }

  /** Get file or throw an error if it's not found (or if index is not loaded). */
  getFileOrDie(filePath) {
    const file = this.getFile(filePath)
    if (!file) throw new Error(`SpellProject '${this.project}': file '${filePath}' not found.`)
    return file
  }

  /** Asynchronously load file by name. Loads index if necessary. */
  async loadFile(filePath) {
    await this.load()
    return this.getFileOrDie(filePath).load()
  }

  /**
   * Use `SpellProject.get("project")` to get a singleton SpellProject back for the project.
   */
  static get = new Registry(project => new SpellProject({ project }))
}

global.SpellProject = SpellProject
