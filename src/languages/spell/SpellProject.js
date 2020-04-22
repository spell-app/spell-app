import assert from "assert"
import global from "global"
import keyBy from "lodash/keyBy"
import { observable, computed } from "mobx"

import { JSON5File, proto, forward, memoize, memoizeForProp, writeOnce, overrideable, Registry } from "../../util"
import { SpellFileLocation } from "./SpellFileLocation"
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
  @writeOnce path

  /**
   * Constructor which expects ONLY `project/<projectId>` or `library/</projectId>`.
   * NOTE: Prefer `SpellProject.get("project/projectId")` to get
   *       a consistent singleton instance rather than creating via `new`.
   */
  constructor(path) {
    super({ path })
    if (!this.location.isValidProjectPath)
      throw new TypeError(`SpellProject initialized with invalid path '${this.path}'`)
  }

  /** `location` object which we can use to get various bits of the path. */
  @forward("projectType", "projectPath", "isLibraryProject", "isUserProject", "projectName")
  @memoize
  get location() {
    return new SpellFileLocation(this.path)
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
  @overrideable get url() {
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
   * Use `SpellProject.get("project/<projectId>")` to get a singleton instance back for the project.
   */
  static get = new Registry(path => new SpellProject(path))
}

global.SpellProject = SpellProject
