import global from "global"

import { JSON5File, OPTIONAL, REQUIRED, CONFIRM, proto, memoizeForProp, $fetch } from "~/util"
import { SpellFileLocation, SpellProject } from "~/languages/spell"

/**
 * Loadable list of all `SpellProject`s available to this user.
 * NOTE: don't create these directly, use the ones set up by `SpellInstall`.
 */
export class SpellProjectList extends JSON5File {
  /**
   * Root of project / file "paths", e.g. `/projects/`
   * MUST be passed to constructor.
   */
  // projectRoot

  /**
   * Root for all `project` urls, e.g. for `createProject()` etc.
   * MUST be passed to constructor.
   */
  // apiPrefix

  constructor(props) {
    super(props)
    // if (!this.projectRoot || !this.apiPrefix)
    //   throw new TypeError("new ProjectList(): don't create these manually, use ones created by `spellInstall`.")
  }

  /** URL to load the project list. */
  get url() {
    return `${this.apiPrefix}/list`
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

  /** Return full projectPath for project specified by `projectId`. */
  getPathForProjectId(projectId) {
    if (typeof projectId !== "string") throw new TypeError(`getPathForProjectId('${path}'): must pass a string`)
    return `${this.projectRoot}${projectId}`
  }

  /** Given projectId, return just the `name` portion. */
  getNameForProjectId(projectId) {
    return projectId
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
    path = this.getPathForProjectId(projectId)

    const location = new SpellFileLocation(path)
    if (!location.isValidProjectPath) throw new TypeError(`Error in createProject: path '${path}' is invalid.`)
    if (this.getProject(path)) throw new TypeError(`Error in createProject: project '${path}' already exists.`)

    // Tell the server to create the project
    await $fetch({
      url: `${this.apiPrefix}/create/project`,
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
    const path = this.getPathForProjectId(projectId)
    const project = this.getProject(path, REQUIRED, `Error in duplicateProject: project '${path}' not found.`)

    if (!newProjectId) {
      newProjectId = prompt("Name for the new project?", this.getNameForProjectId(projectId))
      if (!newProjectId) return undefined
    }
    newPath = this.getPathForProjectId(newProjectId)
    if (this.getProject(newPath)) throw new TypeError(`Error in duplicateProject: project '${newPath}' already exists.`)

    // Tell the server to duplicate the project
    await $fetch({
      url: `${this.apiPrefix}/duplicate/project`,
      contents: { projectId, newProjectId },
      requestFormat: "json"
    })
    // reload the project list and return the new project
    await this.reload()
    return this.getProject(newPath, REQUIRED, `Error in duplicateProject: couldn't create new project '${newPath}'.`)
  }

  /** Rename an existing project. */
  async renameProject(projectId, newProjectId) {
    const path = this.getPathForProjectId(projectId)
    const project = this.getProject(path, REQUIRED, `Error in renameProject: project '${path}' not found.`)

    if (!newProjectId) {
      newProjectId = prompt("New name for the project?", this.getNameForProjectId(projectId))
      if (!newProjectId) return undefined
    }
    newPath = this.getPathForProjectId(newProjectId)
    if (this.getProject(newPath)) throw new TypeError(`Error in renameProject: project '${newPath}' already exists.`)

    // Tell the server to duplicate the project
    await $fetch({
      url: `${this.apiPrefix}/rename/project`,
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
    const path = this.getPathForProjectId(projectId)
    const project = this.getProject(path, REQUIRED, `Error in removeProject: project '${path}' not found.`)

    if (shouldConfirm === CONFIRM) {
      const projectName = this.getNameForProjectId(projectId)
      if (!confirm(`Really remove project '${projectName}'?`)) return false
    }
    // Tell the server to delete the project
    await $fetch({
      url: `${this.apiPrefix}/remove/project`,
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
