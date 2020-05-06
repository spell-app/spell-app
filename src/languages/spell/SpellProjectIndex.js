import global from "global"
// import { computed } from "mobx"

import { JSON5File, forward, memoize, memoizeForProp, writeOnce } from "~/util"
import { SpellFileLocation, SpellProject, SpellFile } from "~/languages/spell"

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
  onRemove() {
    // NOTE: we don't clean up files, we let the Manifest do that.
    super.onRemove()
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
   * Return ordered list of imported `SpellFile`s
   * as `{ path: string, active: boolean, file: SpellFile }`.
   * Returns empty list if we're not loaded or manifest is malformed.
   */
  @memoizeForProp("contents")
  get imports() {
    return this.contents?.imports?.map(item => ({ ...item, file: new SpellFile(item.path) }))
  }

  /**
   * Return active imports as list of `SpellFile`s.
   * Returns empty list if we're not loaded or manifest is malformed.
   */
  @memoizeForProp("imports")
  get activeImports() {
    return this.imports.filter(({ active }) => !!active).map(({ file }) => file)
  }

  //----------------------------
  // LOADING AND SAVING
  //----------------------------

  /** Derive `url` from our path if not explicitly set. */
  get url() {
    return `/api${this.path}/.index`
  }

  /**
   * Attempt to load all of the files, succeeding whether they all load or not.
   * Result is the array of files.
   */
  async loadImports() {
    await this.load()
    const { imports } = this
    await Promise.allSettled(imports.map(({ file }) => file.load()))
    return imports
  }
}

global.SpellProjectIndex = SpellProjectIndex
