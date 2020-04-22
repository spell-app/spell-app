import global from "global"
import { observable, computed } from "mobx"

import { Loadable, proto, forward, memoize, writeOnce, Registry } from "../../util"
import { SpellFileLocation } from "./SpellFileLocation"
import { SpellProjectManifest } from "./SpellProjectManifest"

/**
 * Loadable spell project index.
 */
export class SpellProject extends Loadable {
  /**
   * Use `SpellProject.for("path")` to get a singleton instance back for the project.
   */
  static for = new Registry(path => new SpellProject(path))

  /**
   * NOTE: don't create these directly!
   * Use `SpellProject.for("path")` to get a singleton instance back for the path.
   */
  constructor(path) {
    super({ path })
    if (!this.location.isValidProjectPath)
      throw new TypeError(`SpellProject initialized with invalid path '${this.path}'`)
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
    return SpellFileLocation.for(this.path)
  }

  /**
   * Return our manifest file.
   * Note that we `forward` lots of methods on the location object to this object,
   * so you can say `project.files` rather than `project.manifest.files`.
   */
  @forward("files", "fileMap", "getFile", "getFileOrDie", "loadFile", "loadAllFiles")
  get manifest() {
    return SpellProjectManifest.for(this.path)
  }

  getLoader() {
    return this.manifest.load()
  }
}

global.SpellProject = SpellProject
