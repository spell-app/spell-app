import global from "global"
// import { computed } from "mobx"

import { JSON5File, forward, memoize, memoizeForProp, writeOnce } from "~/util"
import { SpellProject, SpellPath } from "~/languages/spell"

/**
 * Manifest of files for a given `SpellProject`.
 *
 * Note that these are singleton instances --
 * you'll always get the same object back for a given project `path`.
 */
export class SpellProjectManifest extends JSON5File {
  /** Registry of known instances. */
  static registry = new Map()
  constructor(path) {
    // Return immediately from registry if already present.
    const existing = SpellProjectManifest.registry.get(path)
    if (existing) return existing

    // Setup as normal and implicitly return `this`
    super({ path })
    if (!this.location.isProjectPath) {
      throw new TypeError(`new SpellProjectManifest('${path}'): Must be initialized with project path.`)
    }
    SpellProjectManifest.registry.set(path, this)
  }

  /** We've been removed from the server -- clean up memory, etc.. */
  onRemove() {
    super.onRemove()
    // eslint-disable-next-line no-unused-expressions
    this.files?.forEach((file) => file.onRemove())
    SpellProjectManifest.registry.clear(this.path)
  }

  /**
   * Path to project, as specified by server.
   * MUST be passed to constructor.
   */
  @writeOnce path

  /**
   * Immutable `location` object which we use to get various bits of the path.
   *
   * Note that we `forward` lots of methods on the location object to this object,
   * so you can say `manifest.projectName` rather than `manifest.location.projectName`.
   */
  @forward("projectId", "projectDomain", "projectName", "projectPath", "isSystemProject", "isUserProject")
  @memoize
  get location() {
    return new SpellPath(this.path)
  }
  @memoize get project() {
    return new SpellProject(this.projectId)
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
    return this.filePaths.map((path) => SpellProject.getFileForPath(path))
  }

  //----------------------------
  // LOADING AND SAVING
  //----------------------------

  /** Derive `url` from our path if not explicitly set. */
  get url() {
    return `/api/projects/manifest/${this.projectId}`
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
