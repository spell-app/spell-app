/**
 * `ProjectRoot` -- manager for a set of spell projects.
 */
import * as fileUtils from "./file-utils"
import * as responseUtils from "./response-utils"
import { SpellPath } from "../languages/spell/SpellPath"

const { respondWithJSON } = responseUtils

// Root of "@system" files
const SYSTEM_SERVER_ROOT = fileUtils.normalizePath(__dirname, "..")
// Root of "@user" files
const USER_SERVER_ROOT = fileUtils.normalizePath(__dirname, "..")

// HACKY!!!
// Make sure we don't save `SpellPath`s in the singleton registry
// or we would have a memory leak!
SpellPath.useRegistry = false

/**
 * Add a getter to figure out the `serverPath` for a `SpellPath`.
 */
Object.defineProperty(SpellPath.prototype, "serverPath", {
  get() {
    const path = [this.owner === "@system" ? SYSTEM_SERVER_ROOT : USER_SERVER_ROOT, this.domain, this.projectName]
    if (this.filePath) path.push(...this.filePath.split("/"))
    const serverPath = fileUtils.normalizePath(...path.filter(Boolean))
    console.warn(`Server path for path '${this.path}' => '${serverPath}'`)
    return serverPath
  }
})

/**
 * `ProjectRoot` class: encompasses
 */
export class ProjectRoot {
  // pathName: "projects",
  // key: "projects",
  // domain = "projects"
  // type = "user"
  // description = "User projects"

  /** TODOC */
  constructor(props) {
    Object.assign(this, props)
    fileUtils.logJSON("Created projectList", this)
  }

  //----------------------------
  //  Path Utilities
  //----------------------------

  /**
   * Get `SpellPath` for `domainId` string, throwing if it's not a valid DOMAIN path.
   */
  getDomainPath(domainId) {
    const domain = new SpellPath(domainId)
    if (!domain.isDomainPath) throw new TypeError(`You must pass a valid domain, got '${domainId}'`)
    return domain
  }

  /**
   * Get `SpellPath` for `projectId`, throwing if it's not a valid PROJECT path.
   */
  getProjectPath(projectId) {
    const project = new SpellPath(projectId)
    if (!project.isProjectPath) throw new TypeError(`You must pass a valid projectId, got '${projectId}'`)
    return project
  }

  /**
   * Get `SpellPath` for `project` (as a SpellPath) and `filePath`,
   * throwing if it's not a valid FILE path.
   */
  getFilePath(project, filePath) {
    const fullPath = project.path + (filePath.startsWith("/") ? filePath : `/${filePath}`)
    const file = new SpellPath(fullPath)
    if (!file.isFilePath) throw new TypeError(`You must pass a valid filePath, got '${filePath}'`)
    return file
  }

  //----------------------------
  //  Projects list
  //----------------------------

  /**
   * Return list of client projects relative to this projectSpec as JSON blob.
   * Format:
   *   `[ "<project-path>"... ]`
   */
  getProjectList = async (domainId) => {
    const domain = this.getDomainPath(domainId)
    const options = { includeFolders: true, includeFiles: false, namesOnly: true }
    const projectNames = await fileUtils.getFolderContents(domain.serverPath, options)
    return projectNames.map((projectName) => `${domain.owner}:${domain.domain}:${projectName}`)
  }

  /** Send projects list as part of a request. */
  request_getProjectList = respondWithJSON(async (request) => {
    const { domainId } = request.params
    return await this.getProjectList(domainId)
  })

  //----------------------------
  //  Project manifest
  //----------------------------

  /**
   * Return `manifest.json` for a project as JSON blob.
   * NOTE: does not handle nested folders!!!
   * Format:
   *   `{ files: [ { name, path, created, modified }... ] }`
   */
  getManifest = async (projectId) => {
    const project = this.getProjectPath(projectId)
    const options = { includeFolders: false, ignoreHidden: true, namesOnly: true }
    const fileNames = await fileUtils.getFolderContents(project.serverPath, options)
    const files = await Promise.all(
      fileNames.map(async (name) => {
        const filePath = this.getFilePath(project, name)
        const { created, modified } = await fileUtils.getPathInfo(filePath.serverPath)
        return { name, path: filePath.path, created, modified }
      })
    )

    return { files }
  }
  request_getManifest = respondWithJSON(async (request) => {
    const { projectId } = request.params
    return await this.getManifest(projectId)
  })

  //----------------------------
  //  Project index
  //----------------------------

  /**
   * Return `index.json` for a project as a JSON blob.
   * Format:
   *   `{ imports: [ { path, active }...] }`
   * TODO: verify that all files in project are present in index???
   */
  getIndex = async (projectId) => {
    const project = new SpellPath(projectId)
    if (!project.isProjectPath) throw new TypeError(`You must pass a valid projectId, got '${projectId}'`)

    // const path = this.getServerPath(projectId, ".index.json5")
    // const exists = await fileUtils.pathExists(path)
    // if (exists) return responseUtils.sendJSONFile(response, path)

    console.info(`Creating index for project ${projectId}`)
    const options = { includeFolders: false, ignoreHidden: true, namesOnly: true }
    const files = await fileUtils.getFolderContents(project.serverPath, options)
    return {
      imports: files.map((name) => {
        const file = this.getFilePath(project, name)
        return { path: file.path, active: true }
      })
    }
  }
  request_getIndex = respondWithJSON(async (request) => {
    const { projectId } = request.params
    return await this.getIndex(projectId)
  })

  //----------------------------
  //  Get/save project files
  //----------------------------

  /**
   * Return a file from a project.
   * TODO: return proper file type according to mime-type and/or request???!
   */
  request_getFile = (request, response) => {
    const { projectId, filePath } = request.params
    const project = this.getProjectPath(projectId)
    const file = this.getFilePath(project, filePath)
    responseUtils.sendJSONFile(response, file.serverPath)
  }

  /**
   * Save a (non-nested!) file in a project.
   * TODO: format according to extension!!!
   */
  saveFile = async (projectId, filePath, contents) => {
    const project = this.getProjectPath(projectId)
    const file = this.getFilePath(project, filePath)
    return await fileUtils.saveFile(file.serverPath, contents)
  }
  request_saveFile = respondWithJSON(async (request) => {
    const { projectId, filePath } = request.params
    const contents = request.body
    return await this.saveFile(projectId, filePath, contents)
  })

  //----------------------------
  //  Project manipulation
  //----------------------------

  /**
   * Create project `projectId` by creating file at `filePath` within it.
   * Request returns the updated `projectList`.
   */
  createProject = async (projectId, filePath = "Untitled.spell", contents = "") => {
    const project = this.getProjectPath(projectId)
    const file = this.getFilePath(project, filePath)
    return await fileUtils.saveFile(file.serverPath, contents)
  }
  request_createProject = respondWithJSON(async (request) => {
    const { projectId, filePath, contents } = request.body
    await this.createProject(projectId, filePath, contents)
    return this.getProjectList()
  })

  /**
   * Rename project `projectId` to `newProjectId`.
   * Request returns the updated `projectList`.
   */
  renameProject = async (projectId, newProjectId) => {
    const project = this.getProjectPath(projectId)
    const newProject = this.getProjectPath(newProjectId)
    return await fileUtils.movePath(project.serverPath, newProject.serverPath)
  }
  request_renameProject = respondWithJSON(async (request) => {
    const { projectId, newProjectId } = request.body
    await this.renameProject(projectId, newProjectId)
    return this.getProjectList()
  })

  /**
   * Duplicate project `projectId` as `newProjectId`.
   * Request returns the updated `projectList`.
   */
  duplicateProject = async (projectId, newProjectId) => {
    const project = this.getProjectPath(projectId)
    const newProject = this.getProjectPath(newProjectId)
    return await fileUtils.copyPath(project.serverPath, newProject.serverPath)
  }
  request_duplicateProject = respondWithJSON(async (request) => {
    const { projectId, newProjectId } = request.body
    await this.duplicateProject(projectId, newProjectId)
    return this.getProjectList()
  })

  /**
   * Remove (permanently delete) project `projectId`.
   * Request returns the updated `projectList`.
   */
  removeProject = async (projectId) => {
    const project = this.getProjectPath(projectId)
    return await fileUtils.deletePath(project.serverPath)
  }
  request_removeProject = respondWithJSON(async (request) => {
    const { projectId } = request.body
    await this.removeProject(projectId)
    return this.getProjectList()
  })

  //----------------------------
  //  Project file manipulation
  //----------------------------

  /**
   * Create a new project file.
   * TODO: save in the index!
   */
  createFile = async (projectId, filePath, contents) => {
    return await this.saveFile(projectId, filePath, contents)
  }
  request_createFile = respondWithJSON(async (request) => {
    const { projectId, filePath, contents } = request.body
    return await this.createFile(projectId, filePath, contents)
  })

  /**
   * Rename a project file.
   * TODO: update index!
   */
  renameFile = async (projectId, filePath, newFilePath) => {
    const project = this.getProjectPath(projectId)
    const file = this.getFilePath(project, filePath)
    const newFile = this.getFilePath(project, newFilePath)
    return await fileUtils.movePath(file.serverPath, newFile.servePath)
  }
  request_renameFile = respondWithJSON(async (request) => {
    const { projectId, filePath, newFilePath } = request.body
    return await this.renameFile(projectId, filePath, newFilePath)
  })

  /**
   * Delete a project file.
   * TODO: update index!
   */
  removeFile = async (projectId, filePath) => {
    const project = this.getProjectPath(projectId)
    const file = this.getFilePath(project, filePath)
    return await fileUtils.deletePath(file.serverPath)
  }
  request_removeFile = respondWithJSON(async (request) => {
    const { projectId, filePath } = request.body
    return await this.removeFile(projectId, filePath)
  })
}
