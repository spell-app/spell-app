import global from "global"

import { JSON5File, OPTIONAL, REQUIRED, CONFIRM, proto, memoizeForProp, $fetch } from "~/util"
import { SpellPath, SpellProject } from "~/languages/spell"

/**
 * Loadable list of all `SpellProject`s available to this user.
 * NOTE: don't create these directly, use the ones set up by `SpellInstall`.
 */
export class SpellProjectRoot extends JSON5File {
  // From `src/projectSetup.js`
  // owner: "@user"
  // domain: "projects",
  // description: "User projects",

  /** URL to load the project list. */
  get url() {
    return `/api/projects/list/@user:projects`
  }

  /**
   * List of paths for all available `SpellProject`s.
   */
  @memoizeForProp("contents")
  get projectPaths() {
    // console.warn("setting projectPaths")
    // if (!this.isLoaded) console.warn("SpellProjectRoot(): Attempting to get list of projects before loading.")
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
  //  Project CRUD
  //-----------------

  /**
   * Show `prompt()` to get new filename.  Returns `projectId` or `undefined`
   */
  promptForProjectId(message, defaultName, originalProjectId) {
    const originalProject = originalProjectId && new SpellFile(originalProjectId)
    if (!defaultName) defaultName = originalProject ? originalProject.projectName : "Untitled"

    const projectName = prompt(message, defaultName)
    if (!projectName) return undefined
    if (originalProject) return originalProject.getPeerProject(projectName)
    return `${this.owner}:${this.domain}:${projectName}`
  }

  /** Create a new project `projectId`. */
  async createProject(projectId) {
    if (!projectId) {
      projectId = this.promptForProjectId("Name for the new project?", "Untitled")
      if (!projectId) return undefined
    }

    const projectPath = new SpellPath(projectId)
    if (!projectPath.isProjectPath) throw new TypeError(`createProject(): projectId '${projectId}' is invalid.`)

    await this.load()
    if (this.getProject(projectId)) throw new TypeError(`createProject(): project '${projectId}' already exists.`)

    // Tell the server to create the project
    await $fetch({
      url: `/api/projects/create/project`,
      contents: {
        projectId,
        filePath: "Untitled.spell",
        contents: "## this space intentionally left blank"
      },
      requestFormat: "json"
    })
    // Reload the projects list and return the project
    await this.reload()
    return this.getProject(projectId, REQUIRED, `createProject(): couldn't create new project '${projectId}'.`)
  }

  /** Duplicate an existing project. */
  async duplicateProject(projectId, newProjectId) {
    await this.load()
    const project = this.getProject(projectId, REQUIRED, `duplicateProject(): project '${projectId}' not found.`)

    if (!newProjectId) {
      newProjectId = this.promptForProjectId("Name for the new project?", undefined, projectId)
      if (!newProjectId) return undefined
    }
    const newProjectPath = new SpellPath(newProjectId)
    if (!newProjectPath.isProjectPath) throw new TypeError(`duplicateProject(): '${newProjectId}' is not a project id.`)
    if (this.getProject(newProjectId)) {
      throw new TypeError(`duplicateProject(): project '${newProjectId}' already exists.`)
    }

    // Tell the server to duplicate the project
    await $fetch({
      url: `/api/projects/duplicate/project`,
      contents: { projectId, newProjectId },
      requestFormat: "json"
    })
    // reload the project list and return the new project
    await this.reload()
    return this.getProject(newProjectId, REQUIRED, `duplicateProject(): couldn't create new project '${newProjectId}'.`)
  }

  /** Rename an existing project. */
  async renameProject(projectId, newProjectId) {
    await this.load()
    const project = this.getProject(projectId, REQUIRED, `renameProject(): project '${projectId}' not found.`)

    if (!newProjectId) {
      newProjectId = this.promptForProjectId("New name for the project?", undefined, projectId)
      if (!newProjectId) return undefined
    }

    if (this.getProject(newProjectId)) throw new TypeError(`renameProject(): project '${newProjectId}' already exists.`)

    // Tell the server to duplicate the project
    await $fetch({
      url: `/api/projects/rename/project`,
      contents: { projectId, newProjectId },
      requestFormat: "json"
    })
    // Have the project clean itself up
    project.onRemove()

    // reload the project list and return the new project
    await this.reload()
    return this.getProject(newProjectId, REQUIRED, `renameProject(): couldn't create new project '${newProjectId}'.`)
  }

  /**
   * Remove an existing project.
   * Returns `true` on success, `false` if cancelled or throws on error.
   */
  async removeProject(projectId, shouldConfirm) {
    await this.load()
    const project = this.getProject(projectId, REQUIRED, `removeProject(): project '${projectId}' not found.`)

    if (shouldConfirm === CONFIRM) {
      if (!confirm(`Really remove project '${project.projectName}'?`)) return false
    }

    // Tell the server to delete the project
    await $fetch({
      url: `/api/projects/remove/project`,
      method: "DELETE",
      contents: { projectId },
      requestFormat: "json"
    })
    // Have the project clean itself up
    project.onRemove()

    // reload the project list and make sure the project is no longer available
    await this.reload()
    if (this.getProject(projectId)) throw new TypeError(`removeProject(): server didn't delete project '${projectId}'.`)
    return true
  }
}

global.SpellProjectRoot = SpellProjectRoot
