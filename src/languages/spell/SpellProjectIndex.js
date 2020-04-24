import global from "global"
import { computed } from "mobx"

import { JSON5File, forward, proto, writeOnce, overrideable } from "../../util"
import { SpellFileLocation } from "./SpellFileLocation"
import { SpellProject } from "./SpellProject"
import { SpellFile } from "./SpellFile"

/**
 * Index of imports for a given `SpellProject`.
 *
 * Note that these are singleton instances --
 * you'll always get the same object back for a given `path`.
 */
export class SpellProjectIndex extends JSON5File {
  /** Registry of known instances. */
  static registry = new Map()
  constructor(path) {
    // Create instance if not already present in registry
    if (!SpellProjectIndex.registry.has(path)) {
      const instance = super({ path })
      if (!instance.location.isValidProjectPath)
        throw new TypeError(`SpellProjectIndex initialized with invalid path '${this.path}'`)
      SpellProjectIndex.registry.set(path, instance)
    }
    return SpellProjectIndex.registry.get(path)
  }

  /** We've been removed from the server -- clean up memory, etc.. */
  cleanUpOnRemove() {
    // NOTE: we don't clean up files, we let the Manifest do that.
    SpellProjectIndex.registry.clear(this.path)
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
  @computed get imports() {
    if (!this.isLoaded) console.warn("SpellProjectIndex(): Attempting to get list of imports before loading.")
    return this.contents?.imports?.map(({ path }) => new SpellFile(path))
  }

  //----------------------------
  // LOADING AND SAVING
  //----------------------------

  /** Derive `url` from our path if not explicitly set. */
  @overrideable get url() {
    return `/api${this.path}/.index`
  }

  /**
   * Attempt to load all of the files, succeeding whether they all load or not.
   * Result is the array of files.
   */
  async loadAll() {
    await this.load()
    const { imports } = this
    await Promise.allSettled(imports.map(file => file.load()))
    return imports
  }
}

global.SpellProjectIndex = SpellProjectIndex
