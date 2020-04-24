import global from "global"
import { observable, computed } from "mobx"

import { LoadableManager, proto, forward, memoize, writeOnce, Registry } from "../../util"
import { SpellFileLocation } from "./SpellFileLocation"
import { SpellProjectManifest } from "./SpellProjectManifest"

/**
 * Controller for a `SpellProject`.
 *
 * Note that these are singleton instances --
 * you'll always get the same object back for a given `path`.
 */
export class SpellProject extends LoadableManager {
  /** Registry of known instances. */
  static registry = new Map()
  constructor(path) {
    // Create instance if not already present in registry
    if (!SpellProject.registry.has(path)) {
      const instance = super({ path })
      if (!instance.location.isValidProjectPath)
        throw new TypeError(`SpellProjectManifest initialized with invalid path '${this.path}'`)
      SpellProject.registry.set(path, instance)
    }
    return SpellProject.registry.get(path)
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
   * so you can say `project.projectName` rather than `project.location.projectName`.
   */
  @forward("projectType", "projectName", "projectPath", "isLibraryProject", "isUserProject")
  get location() {
    return new SpellFileLocation(this.path)
  }

  /** Return the files we load automatically when we load.  */
  get loadables() {
    return [this.manifest]
  }

  /**
   * Return our manifest file.
   * Note that we `forward` lots of methods on our `manifest` to this object,
   * so you can say `project.files` rather than `project.manifest.files`.
   */
  @forward("files", "getFile", "getFileOrDie", "loadFile", "loadAllFiles")
  get manifest() {
    return new SpellProjectManifest(this.path)
  }
}

global.SpellProject = SpellProject
