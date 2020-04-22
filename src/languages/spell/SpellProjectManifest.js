import global from "global"
import keyBy from "lodash/keyBy"
import { computed } from "mobx"

import { JSON5File, forward, memoize, writeOnce, overrideable, Registry } from "../../util"
import { SpellFileLocation } from "./SpellFileLocation"
import { SpellProject } from "./SpellProject"
import { SpellFile } from "./SpellFile"

/**
 * Loadable spell project index.
 */
export class SpellProjectManifest extends JSON5File {
  /**
   * Use `SpellProjectManifest.for("path")` to get a singleton instance back for the path.
   */
  static for = new Registry(path => new SpellProjectManifest(path))

  /**
   * NOTE: don't create these directly!
   * Use `SpellProjectManifest.for("path")` to get a singleton instance back for the path.
   */
  constructor(path) {
    super({ path })
    if (!this.location.isValidProjectPath)
      throw new TypeError(`SpellProjectManifest initialized with invalid path '${this.path}'`)
  }

  /**
   * Project path as `/project/<projectId>` or `/library/<projectId>`.
   * MUST be passed to constructor.
   */
  @writeOnce path

  /**
   * Immutable `location` object which we use to get various bits of the path.
   *
   * Note that we `forward` lots of methods on the location object to this object,
   * so you can say `manifest.projectName` rather than `manifest.location.projectName`.
   */
  @forward("projectType", "projectName", "projectPath", "isLibraryProject", "isUserProject")
  get location() {
    return SpellFileLocation.for(this.path)
  }

  /** Pointer to our `SpellProject`. */
  get project() {
    return SpellProject.for(this.projectPath)
  }

  /**
   * Return list of `SpellFiles` in the index.
   * Returns `undefined` if we're not loaded or manifest is malformed.
   */
  @computed get files() {
    console.warn("recomputing files")
    return this.contents?.files?.map(({ path }) => SpellFile.get(path))
  }

  /**
   * Return map of `SpellFiles` in the index.
   * Returns `undefined` if we're not loaded.
   */
  @computed get fileMap() {
    const { files } = this
    return files && keyBy(files, "path")
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
    const { files } = this
    await Promise.allSettled(files.map(file => file.load()))
    return files
  }

  /** Synchronously get file by name. Assumes index is loaded. */
  getFile(path) {
    return this.fileMap?.[path]
  }

  /** Get file or throw an error if it's not found (or if index is not loaded). */
  getFileOrDie(path) {
    const file = this.getFile(path)
    if (!file) throw new Error(`SpellProjectManifest '${this.projectId}': file '${path}' not found.`)
    return file
  }

  /** Asynchronously load file by `path` (or `filename` if path doesn't start with slash). */
  async loadFile(path) {
    await this.load()
    return this.getFileOrDie(path).load()
  }
}

global.SpellProjectManifest = SpellProjectManifest
