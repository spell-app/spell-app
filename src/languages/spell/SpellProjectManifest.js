import global from "global"
// import { computed } from "mobx"

import { JSON5File, forward, memoize, memoizeForProp, writeOnce } from "../../util"
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

  /** We've been removed from the server -- clean up memory, etc.. */
  cleanUpOnRemove() {
    if (this.isLoaded) this.files.forEach(file => file.cleanUpOnRemove())
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
   * Return list of `SpellFiles` in the index.
   * Returns `undefined` if we're not loaded or manifest is malformed.
   */
  // @computed
  @memoizeForProp("contents")
  get files() {
    if (!this.isLoaded) console.warn("SpellProjectManifest(): Attempting to get list of files before loading.")
    console.warn("recalculating files", this.contents)
    return this.contents?.files?.map(({ path }) => new SpellFile(path))
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
    await Promise.allSettled(files.map(file => file.load()))
    return files
  }
}

global.SpellProjectManifest = SpellProjectManifest
