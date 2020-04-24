import global from "global"
import { computed } from "mobx"

import { JSON5File, OPTIONAL, REQUIRED, proto, $fetch } from "../../util"
import { SpellFileLocation } from "./SpellFileLocation"
import { SpellProject } from "./SpellProject"

/**
 * Loadable list of all `SpellProject`s available to this user.
 *
 * Note that this is a singleton -- you'll always get the same object back on `new`.
 *
 * TODO: compile status / etc
 */
export class SpellProjectList extends JSON5File {
  @proto url = "/api/projects"

  /** Pointer to our singleton instance. */
  static #singleton
  constructor() {
    if (!SpellProjectList.#singleton) SpellProjectList.#singleton = super()
    return SpellProjectList.#singleton
  }

  /**
   * List of all available `SpellProject`s.
   */
  @computed get projects() {
    if (!this.isLoaded) console.warn("SpellProjectList(): Attempting to get list of projects before loading.")
    return this.contents?.map(projectName => new SpellProject(`/project/${projectName}`))
  }

  /**
   * Return a known `project` by path.
   * Pass `required = REQUIRED` to throw if not found.
   * Pass `dieMessage` for a custom error message.
   */
  getProject(path, required = OPTIONAL, dieMessage) {
    const project = this.projects?.find(p => p.path === path)
    if (!project && required === REQUIRED) {
      throw new TypeError(dieMessage || `SpellProjectList.getProject("${path}"): project not found.`)
    }
    return project
  }

  //-----------------
  //  Project manipulation
  //-----------------

  /** Create a new project. */
  async createProject(path) {
    const location = new SpellFileLocation(path)
    if (!location.isValidProjectPath) throw new TypeError(`createProject('${path}'): invalid project path`)
    if (this.getProject(path)) throw new TypeError(`createProject('${path}'): project already exists`)

    // Tell the server to create the project
    await $fetch({
      url: "/api/projects/create",
      contents: {
        path,
        startFile: "Untitled.spell",
        startFileContents: "## this space intentionally left blank"
      },
      requestFormat: "json"
    })
    // Reload the projects list and return the project
    await this.reload()
    return this.getProject(path, REQUIRED, `createProject('${path}'): new project not found`)
  }

  /** Duplicate an existing project. */
  async duplicateProject(path, newPath) {
    // Make sure project exists and duplicate does not
    this.getProject(path, REQUIRED, `duplicateProject('${path}, '${newPath}'): project not found`)
    if (this.getProject(newPath))
      throw new TypeError(`duplicateProject('${path}, '${newPath}'): new project already exists`)

    // Tell the server to duplicate the project
    await $fetch({
      url: "/api/projects/duplicate",
      contents: { path, newPath },
      requestFormat: "json"
    })
    // reload the project list and return the new project
    await this.reload()
    return this.getProject(newPath, REQUIRED, `duplicateProject('${path}'): new project not found`)
  }

  /** Remove an existing project. */
  async removeProject(path) {
    const project = this.getProject(path, REQUIRED, `.removeProject('${path}'): project not found`)

    // Tell the server to delete the project
    await $fetch({
      url: "/api/projects/delete",
      method: "DELETE",
      contents: { path },
      requestFormat: "json"
    })
    // Have the project clean itself up
    project.cleanUpOnRemove()

    // reload the project list and make sure the project is no longer available
    await this.reload()
    if (this.getProject(path)) throw new TypeError(`removeProject('${path}'): server didn't delete the project`)
  }

  /** Rename an existing project. */
  async renameProject(path, newPath) {
    if (path === newPath)
      throw new TypeError(`SpellProjectList.renameProject('${path}, '${newPath}'): paths are the same!`)

    await this.duplicateProject(path, newPath)
    await this.removeProject(path)
    // return the renamed project
    return this.getProject(newPath, REQUIRED, `renameProject('${path}, '${newPath}'): new project not found`)
  }
}

global.SpellProjectList = SpellProjectList

// HACK???
global.projects = new SpellProjectList()
