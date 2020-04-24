import global from "global"
import { observable, computed } from "mobx"

import { LoadableManager, proto, forward, memoize, writeOnce, $fetch, OPTIONAL, REQUIRED } from "../../util"
import { SpellFileLocation } from "./SpellFileLocation"
import { SpellFile } from "./SpellFile"
import { SpellProjectManifest } from "./SpellProjectManifest"
import { SpellProjectIndex } from "./SpellProjectIndex"

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

  /** We've been removed from the server -- clean up memory, etc.. */
  cleanUpOnRemove() {
    this.manifest.cleanUpOnRemove()
    SpellProject.registry.clear(this.path)
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

  //-----------------
  //  Loading
  //-----------------

  /**
   * Return our manifest file.
   */
  get manifest() {
    return new SpellProjectManifest(this.path)
  }
  /**
   * Return all known (non-hidden) files in the folder.
   */
  get files() {
    return this.manifest.files
  }

  /**
   * Return our index file.
   */
  get index() {
    return new SpellProjectIndex(this.path)
  }

  /** Return our imports list. */
  get imports() {
    return this.index.imports
  }

  /** Return the files we load automatically when we load.  */
  get loadables() {
    return [this.manifest, this.index]
  }

  //-----------------
  //  Project file access
  //-----------------

  /** Given a path, make sure it's relative to this project. */
  getFilePath(path) {
    if (typeof path !== "string") throw new TypeError(`getFilePath('${path}'): must pass a string`)
    if (!path.startsWith("/")) path = `${this.projectPath}/${path}`
    return path
  }

  /**
   * Synchronously get one of our files by `path`.
   * If `path` doesn't start with a `/`, we'll assume it's a local file path.
   * Returns `undefined` if file not found or manifest is not loaded.
   */
  getFile(path = "", required = OPTIONAL) {
    path = this.getFilePath(path)
    const file = this.files?.find(f => f.path === path)
    if (!file && required === REQUIRED) throw new TypeError(`spellProject.getFile("${path}"): file not found.`)
    return file
  }

  /** Asynchronously load file by `path` (or `filename` if path doesn't start with slash). */
  async loadFile(path) {
    await this.load()
    return this.getFile(path, REQUIRED).load()
  }

  //-----------------
  //  Project file manipulation
  //-----------------

  /** Create a new project. */
  async createFile(path, contents = "") {
    path = this.getFilePath(path)
    const location = new SpellFileLocation(path)
    if (!location.isValidFilePath) throw new TypeError(`createFile('${path}'): invalid file path`)
    if (this.getFile(path)) throw new TypeError(`createFile('${path}'): file already exists`)

    // Tell the server to create the file
    await $fetch({
      url: "/api/projects/create/file",
      contents: { path, contents },
      requestFormat: "json"
    })
    console.warn("created")
    // Reload the file list and return the file
    await this.reload()
    console.warn("reloaded")
    return this.getFile(path, REQUIRED, `createFile('${path}'): new file not found`)
  }

  /** Duplicate an existing file. */
  async duplicateFile(path, newPath) {
    // Make sure file exists and duplicate does not
    if (this.getFile(newPath)) throw new TypeError(`duplicateFile('${path}, '${newPath}'): new file already exists`)
    const file = this.getFile(path, REQUIRED, `duplicateFile('${path}, '${newPath}'): file not found`)

    const contents = await file.load()
    return this.createFile(newPath, contents)
  }

  /** Remove an existing file from the project. */
  async removeFile(path) {
    const file = this.getFile(path, REQUIRED, `.removeFile('${path}'): file not found`)
    // Tell the server to delete the file
    await $fetch({
      url: "/api/projects/delete/file",
      method: "DELETE",
      contents: { path: file.path },
      requestFormat: "json"
    })
    // Have the file clean itself up
    file.cleanUpOnRemove()
    // reload the file list and make sure the file is no longer available
    await this.reload()
    if (this.getFile(path)) throw new TypeError(`removeFile('${path}'): server didn't delete the file`)
  }

  /** Rename an existing file. */
  async renameFile(path, newPath) {
    await this.duplicateFile(path, newPath)
    await this.removeFile(path)
    // return the renamed file
    return this.getFile(newPath, REQUIRED, `renameFile('${path}, '${newPath}'): new file not found`)
  }
}

global.SpellProject = SpellProject
