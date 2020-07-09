import global from "global"

import { JSON5File, OPTIONAL, REQUIRED, CONFIRM, proto, memoizeForProp, $fetch } from "~/util"
import { SpellFileLocation, SpellProject } from "~/languages/spell"

/**
 * Loadable list of all `SpellProject`s available to this user.
 *
 * Note that this is a singleton -- you'll always get the same object back on `new`.
 *
 * TODO: compile status / etc
 */
export class SpellProjectList extends JSON5File {
  /** Root for all `project` urls. */
  projectAPI = "/api/projects"

  /** Root for all `file` urls. */
  fileAPI = "/api/project"

  get url() {
    return this.projectAPI
  }

  /** Pointer to our singleton instance. */
  static #singleton
  constructor() {
    if (!SpellProjectList.#singleton) SpellProjectList.#singleton = super()
    return SpellProjectList.#singleton
  }

  /**
   * List of paths for all available `SpellProject`s.
   */
  @memoizeForProp("contents")
  get projectPaths() {
    // console.warn("setting projectPaths")
    // if (!this.isLoaded) console.warn("SpellProjectList(): Attempting to get list of projects before loading.")
    return this.contents || []
  }

  /**
   * Pointers to all available `SpellProject`s.
   * NOTE: it's tricky to use this in a component!
   */
  @memoizeForProp("projectPaths")
  get projects() {
    // console.warn("setting projects")
    return this.projectPaths.map((path) => new SpellProject(path))
  }

  /** DOCME Given a path, make sure it's relative to this project. */
  getProjectPath(path) {
    if (typeof path !== "string") throw new TypeError(`getProjectPath('${path}'): must pass a string`)
    if (!path.startsWith("/")) return `/project/${path}`
    return path
  }

  /**
   * Return a known `project` by path.
   * Pass `required = REQUIRED` to throw if not found.
   * Pass `dieMessage` for a custom error message.
   */
  getProject(path, required = OPTIONAL, dieMessage) {
    const project = this.projects?.find((p) => p.path === path)
    if (!project && required === REQUIRED) {
      throw new TypeError(dieMessage || `Error in getProject("${path}"): project not found.`)
    }
    return project
  }

  //-----------------
  //  Project manipulation
  //-----------------

  /** Create a new project `projectId`. */
  async createProject(projectId) {
    if (!projectId) projectId = prompt("Name for the new project?", "Untitled")
    if (!projectId) return undefined
    path = this.getProjectPath(projectId)

    const location = new SpellFileLocation(path)
    if (!location.isValidProjectPath) throw new TypeError(`Error in createProject: path '${path}' is invalid.`)
    if (this.getProject(path)) throw new TypeError(`Error in createProject: project '${path}' already exists.`)

    // Tell the server to create the project
    await $fetch({
      url: `${this.projectAPI}/create/project`,
      contents: {
        projectId,
        filePath: "Untitled.spell",
        contents: "## this space intentionally left blank"
      },
      requestFormat: "json"
    })
    // Reload the projects list and return the project
    await this.reload()
    return this.getProject(path, REQUIRED, `Error in createProject: couldn't create new project '${path}'.`)
  }

  /** Duplicate an existing project. */
  async duplicateProject(projectId, newProjectId) {
    const path = this.getProjectPath(projectId)
    const project = this.getProject(path, REQUIRED, `Error in duplicateProject: project '${path}' not found.`)

    if (!newProjectId) newProjectId = prompt("Name for the new project?", projectId)
    if (!newProjectId) return undefined
    newPath = this.getProjectPath(newProjectId)
    if (this.getProject(newPath)) throw new TypeError(`Error in duplicateProject: project '${newPath}' already exists.`)

    // Tell the server to duplicate the project
    await $fetch({
      url: `${this.projectAPI}/duplicate/project`,
      contents: { projectId, newProjectId },
      requestFormat: "json"
    })
    // reload the project list and return the new project
    await this.reload()
    return this.getProject(newPath, REQUIRED, `Error in duplicateProject: couldn't create new project '${newPath}'.`)
  }

  /** Rename an existing project. */
  async renameProject(projectId, newProjectId) {
    const path = this.getProjectPath(projectId)
    const project = this.getProject(path, REQUIRED, `Error in renameProject: project '${path}' not found.`)

    if (!newProjectId) newProjectId = prompt("New name for the project?", projectId)
    if (!newProjectId) return undefined
    newPath = this.getProjectPath(newProjectId)
    if (this.getProject(newPath)) throw new TypeError(`Error in renameProject: project '${newPath}' already exists.`)

    // Tell the server to duplicate the project
    await $fetch({
      url: `${this.projectAPI}/rename/project`,
      contents: { projectId, newProjectId },
      requestFormat: "json"
    })
    // reload the project list and return the new project
    await this.reload()
    return this.getProject(newPath, REQUIRED, `Error in renameProject: couldn't create new project '${newPath}'.`)
  }

  /**
   * Remove an existing project.
   * Returns `true` on success, `false` if cancelled or throws on error.
   */
  async removeProject(projectId, shouldConfirm) {
    const path = this.getProjectPath(projectId)
    const project = this.getProject(path, REQUIRED, `Error in removeProject: project '${path}' not found.`)
    if (shouldConfirm === CONFIRM) {
      if (!confirm(`Really remove project '${project.projectId}'?`)) return false
    }
    // Tell the server to delete the project
    await $fetch({
      url: `${this.projectAPI}/remove/project`,
      method: "DELETE",
      contents: { projectId },
      requestFormat: "json"
    })
    // Have the project clean itself up
    project.onRemove()

    // reload the project list and make sure the project is no longer available
    await this.reload()
    if (this.getProject(path)) throw new TypeError(`Error in removeProject: server didn't delete project '${path}'.`)
    return true
  }
}

global.SpellProjectList = SpellProjectList

// HACK???
global.projects = new SpellProjectList()
