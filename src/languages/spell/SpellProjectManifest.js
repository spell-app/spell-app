import global from "global"
// import { computed } from "mobx"

import { JSON5File, forward, memoize, memoizeForProp, writeOnce } from "~/util"
import { SpellFileLocation, SpellProject, SpellFile } from "~/languages/spell"

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

  /** We've been removed from the server -- clean up memory, etc.. */
  onRemove() {
    super.onRemove()
    // eslint-disable-next-line no-unused-expressions
    this.files?.forEach((file) => file.onRemove())
    SpellProjectManifest.registry.clear(this.path)
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
  @memoize
  get location() {
    return new SpellFileLocation(this.path)
  }

  /** Pointer to our `SpellProject`. */
  @memoize
  get project() {
    return new SpellProject(this.projectPath)
  }

  /**
   * Return paths of `SpellFiles` in our mainfest.
   * Returns `[]` if we're not loaded or manifest is malformed.
   */
  @memoizeForProp("contents")
  get filePaths() {
    return this.contents?.files.map((file) => file.path) || []
  }

  /**
   * Return pointers to all `SpellFiles` in our mainfest.
   * Returns `[]` if we're not loaded.
   */
  @memoizeForProp("filePaths")
  get files() {
    return this.filePaths.map((path) => this.project.getFileForPath(path))
  }

  //----------------------------
  // LOADING AND SAVING
  //----------------------------

  /** Derive `url` from our path if not explicitly set. */
  get url() {
    return `/api${this.path}/.manifest`
  }

  /**
   * Attempt to load all of the files, succeeding whether they all load or not.
   * Result is the array of files.
   */
  async loadAll() {
    await this.load()
    const { files } = this
    await Promise.allSettled(files.map((file) => file.load()))
    return files
  }
}

global.SpellProjectManifest = SpellProjectManifest
