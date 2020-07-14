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
  getProject(path, required = OPTIONAL, dieMessage = `Error in getProject("${path}"): project not found.`) {
    const project = this.projects?.find((p) => p.path === path)
    if (!project && required === REQUIRED) {
      throw new TypeError(dieMessage || dieMessage)
    }
    return project
  }

  //-----------------
  //  Project CRUD
  //-----------------

  /**
   * Show `prompt()` to get new filename.
   * Returns `projectId` or `undefined`
   */
  promptForProjectId({ projectId, defaultName, message = "Name for the new project?" } = {}) {
    const originalProject = projectId && new SpellPath(projectId)
    if (!defaultName) defaultName = originalProject?.projectName || "Untitled"

    const projectName = prompt(message, defaultName)
    if (!projectName) return undefined
    const { owner, domain } = originalProject || this
    return `${owner}:${domain}:${projectName}`
  }

  /**
   * Create a new project at `projectId`.
   * Returns new project, `undefined` if cancelled, or throws on error.
   */
  async createProject(projectId) {
    if (!projectId) projectId = this.promptForProjectId()
    if (!projectId) return undefined
    const location = new SpellPath(projectId)
    const errorPrefix = `Error creating project '${location.projectName}'::`

    if (!location.isProjectPath) throw new TypeError(`${errorPrefix} Project name is not valid.`)

    await this.load()
    if (this.getProject(projectId)) throw new TypeError(`${errorPrefix} Project already exists.`)

    // Tell the server to create the project, which returns new projects list
    const newContents = await $fetch({
      url: `/api/projects/create/project`,
      contents: {
        projectId,
        filePath: "Untitled.spell",
        contents: "## this space intentionally left blank"
      },
      requestFormat: "json",
      format: "json"
    })
    this.setContents(newContents)
    // Return the new project
    return this.getProject(projectId, REQUIRED, `${errorPrefix} Server couldn't create the new project.`)
  }

  /**
   * Duplicate an existing project.
   * Returns new project, `undefined` if cancelled, or throws on error.
   */
  async duplicateProject(projectId, newProjectId) {
    const location = new SpellPath(projectId)
    const errorPrefix = `Error duplicating project '${location.projectName}'::`

    await this.load()
    const project = this.getProject(projectId, REQUIRED, `${errorPrefix} Project does not exizt.`)

    if (!newProjectId) newProjectId = this.promptForProjectId({ projectId })
    if (!newProjectId) return undefined

    const newProjectPath = new SpellPath(newProjectId)
    if (!newProjectPath.isProjectPath) {
      throw new TypeError(`${errorPrefix} '${newProjectId}' is not a project id.`)
    }
    if (this.getProject(newProjectId)) {
      throw new TypeError(`${errorPrefix} Project '${newProjectId}' already exists.`)
    }

    // Tell the server to duplicate the project, which returns new projects list
    const newContents = await $fetch({
      url: `/api/projects/duplicate/project`,
      contents: { projectId, newProjectId },
      requestFormat: "json",
      format: "json"
    })
    this.setContents(newContents)
    // Return the new project
    return this.getProject(newProjectId, REQUIRED, `${errorPrefix} Couldn't create new project '${newProjectId}'.`)
  }

  /**
   * Rename an existing project.
   * Returns new project, `undefined` if cancelled, or throws on error.
   */
  async renameProject(projectId, newProjectId) {
    const location = new SpellPath(projectId)
    const errorPrefix = `Error renaming project '${location.projectName}'::`

    await this.load()
    const project = this.getProject(projectId, REQUIRED, `${errorPrefix} Project '${projectId}' not found.`)

    if (!newProjectId) newProjectId = this.promptForProjectId({ projectId, message: "New name for the project?" })
    if (!newProjectId || newProjectId === projectId) return undefined

    // Throw if project already exists
    if (this.getProject(newProjectId)) throw new TypeError(`${errorPrefix} Project '${newProjectId}' already exists.`)

    // Tell the server to duplicate the project, which returns new projects list
    const newContents = await $fetch({
      url: `/api/projects/rename/project`,
      contents: { projectId, newProjectId },
      requestFormat: "json",
      format: "json"
    })
    this.setContents(newContents)
    // Have the project clean itself up in a tick
    // (delay is so React doesn't barf on hooks).
    setTimeout(() => project.onRemove(), 10)
    // Return the new project
    return this.getProject(newProjectId, REQUIRED, `${errorPrefix} Couldn't create new project '${newProjectId}'.`)
  }

  /**
   * Remove an existing project.
   * Returns `true` on success, `false` if cancelled, or throws on error.
   */
  async removeProject(projectId, shouldConfirm) {
    const location = new SpellPath(projectId)
    const errorPrefix = `Error duplicating project '${location.projectName}'::`

    await this.load()
    if (this.projects.length === 1) throw new TypeError(`${errorPrefix} You can't delete the last project.`)
    const project = this.getProject(projectId, REQUIRED, `${errorPrefix} Project not found.`)

    if (shouldConfirm === CONFIRM) {
      if (!confirm(`Really remove project '${project.projectName}'?`)) return false
    }

    // Tell the server to delete the project, which returns new projects list
    const newContents = await $fetch({
      url: `/api/projects/remove/project`,
      method: "DELETE",
      contents: { projectId },
      requestFormat: "json",
      format: "json"
    })
    this.setContents(newContents)
    // Barf if the project still exists
    if (this.getProject(projectId)) throw new TypeError(`${errorPrefix} Server didn't delete project '${projectId}'.`)
    // Have the project clean itself up in a tick
    // (delay is so React doesn't barf on hooks).
    setTimeout(() => project.onRemove(), 10)
    return true
  }
}

global.SpellProjectRoot = SpellProjectRoot
