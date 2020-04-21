import global from "global"

import { Loadable, Registry, proto, memoizeForProp } from "../../util"
import { SpellProjectIndex } from "./SpellProjectIndex"

/**
 * Loadable spell project.
 */
export class SpellProject extends Loadable {
  /** Project name. */
  @proto project = undefined
  /** Update file contents when you  do `spellProjectIndex.save({ contents })`. */
  @proto autoUpdateContentsOnSave = true

  /**
   * Construct with a `project` string to get a singleton back for that path.
   * e.g.
   *    a = new SpellProject("myProject")
   *    b = new SpellProject("myProject")
   *    a === b  <<<< true
   */
  constructor(propsOrProject) {
    if (typeof propsOrProject === "string") {
      return SpellProject.registry.get(propsOrProject)
    }
    super(propsOrProject)
  }

  get index() {
    return SpellProjectIndex.registry.get(this.project)
  }

  get files() {
    return this.index.files
  }

  get fileMap() {
    return this.index.fileMap
  }

  /** LOADING */

  /** Load index and all files when told do `load()` */
  getLoader() {
    return Promise.all([this.loadIndex(), this.loadFiles()])
  }

  /** Load just the index. Result is the index itself. */
  async loadIndex() {
    await this.index.load()
    return this.index
  }

  /**
   * Attempt to load all of the files, succeeding whether they all load or not.
   * Result is the array of files.
   */
  async loadFiles() {
    await this.loadIndex()
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
    if (!file) throw new Error(`project '${this.project}': file '${filename}' not found.`)
    return file
  }

  /** Asynchronously load file by name. Loads index if necessary. */
  async loadFile(filename) {
    await this.loadIndex()
    return this.getFileOrDie(filename).load()
  }

  /**
   * Use `SpellProject.registry.get("project")` to get a singleton SpellProject back for that path.
   * Note that you can also just do `new SpellProject("project")` to do the same thing.
   */
  static registry = new Registry({
    makeInstanceForPath(project) {
      return new SpellProject({ project })
    }
  })
}

global.SpellProject = SpellProject
