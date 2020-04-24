import global from "global"
import { computed } from "mobx"

import { JSON5File, forward, memoize, writeOnce, overrideable, OPTIONAL, REQUIRED } from "../../util"
import { SpellFileLocation } from "./SpellFileLocation"
import { SpellProject } from "./SpellProject"
import { SpellFile } from "./SpellFile"

/**
 * Manifest of files for a given `SpellProject`.
 *
 * Note that these are singleton instances --
 * you'll always get the same object back for a given `path`.
 */
export class SpellProjectManifest extends JSON5File {
  /** Registry of known instances. */
  static registry = new Map()
  constructor(path) {
    // Create instance if not already present in registry
    if (!SpellProjectManifest.registry.has(path)) {
      const instance = super({ path })
      if (!instance.location.isValidProjectPath)
        throw new TypeError(`SpellProjectManifest initialized with invalid path '${this.path}'`)
      SpellProjectManifest.registry.set(path, instance)
    }
    return SpellProjectManifest.registry.get(path)
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
    return new SpellFileLocation(this.path)
  }

  /** Pointer to our `SpellProject`. */
  get project() {
    return new SpellProject(this.projectPath)
  }

  /**
   * Return list of `SpellFiles` in the index.
   * Returns `undefined` if we're not loaded or manifest is malformed.
   */
  @computed get files() {
    if (!this.isLoaded) console.warn("SpellProjectManifest(): Attempting to get list of files before loading.")
    return this.contents?.files?.map(({ path }) => new SpellFile(path))
  }

  /** LOADING AND SAVING */

  /** Derive `url` from our path if not explicitly set. */
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

  /**
   * Synchronously get one of our files by `path`.
   * If `path` doesn't start with a `/`, we'll assume it's a local file path.
   * Returns `undefined` if file not found or manifest is not loaded.
   */
  getFile(path = "", isRequired = OPTIONAL) {
    if (!path.startsWith("/")) path = `${this.projectPath}/${path}`
    const file = this.files?.find(f => f.path === path)
    if (!file && isRequired === REQUIRED)
      throw new TypeError(`SpellProjectManifest.getFile("${path}"): file not found.`)
    return file
  }

  /** Asynchronously load file by `path` (or `filename` if path doesn't start with slash). */
  async loadFile(path) {
    await this.load()
    return this.getFile(path, REQUIRED).load()
  }
}

global.SpellProjectManifest = SpellProjectManifest
