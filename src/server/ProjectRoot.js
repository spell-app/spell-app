/**
 * `ProjectRoot` -- manager for a set of spell projects.
 */
import * as fileUtils from "./file-utils"
import * as responseUtils from "./response-utils"
import { SpellPath } from "../languages/spell/SpellPath"

const { respondWithJSON } = responseUtils

const USER_SERVER_PATH = fileUtils.normalizePath(__dirname, "..")
const SYSTEM_SERVER_PATH = fileUtils.normalizePath(__dirname, "..")

// HACKY!!!
// Make sure we don't save `SpellPath`s in the singleton registry
// or we would have a memory leak!
SpellPath.useRegistry = false

Object.defineProperty(SpellPath.prototype, "serverPath", {
  get() {
    const path = [this.owner === "@system" ? SYSTEM_SERVER_PATH : USER_SERVER_PATH, this.domain, this.projectName]
    if (this.filePath) path.push(...this.filePath.split("/"))
    const serverPath = fileUtils.normalizePath(...path.filter(Boolean))
    console.warn(`Server path for path '${this.path}' => '${serverPath}'`)
    return serverPath
  }
})
SpellPath.prototype.getPathForFile = function (filePath) {
  const fullPath = this.projectId + (filePath.startsWith("/") ? "" : "/") + filePath
  return new SpellPath(fullPath)
}

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

  get serverPath() {
    if (this.type === "user") return `${USER_SERVER_PATH}/${this.key}`
    return `${SYSTEM_SERVER_PATH}/${this.key}`
  }

  /**
   * Return `true` if server `path` is "legal".
   * Use this to, e.g., guard against paths containing ".." from going outside of our root.
   */
  static LEGAL_PROJECT_ID = /^[\w\d-]+$/
  static LEGAL_PATH_SEGMENT = /^[\w\d-\.]+$/
  isValidServerPath(path) {
    return true
    // if (!path.startsWith(this.serverPath)) return false
    // return fileUtils.splitPath(path).some((segment) => {
    //   return segment === ".." || !ProjectRoot.LEGAL_PATH_SEGMENT.test(segment)
    // })
  }

  // TODO
  isValidProjectId(projectId) {
    return true
  }

  // `@library:`
  getProjectDomainName(projectId) {
    return projectId.split(":")[0] + ":"
  }

  // `library`
  getProjectDomainName(projectId) {
    return projectId.split(":")[0].substr(1)
  }

  getProjectName(projectId) {
    return projectId.split(":")[1]
  }

  /**
   * Given a `projectId` and one or more `pathSegments`, return server path for resource.
   * Throws is invalid `projectId` or resulting `path`.
   *
   * TODO: `pathSuffix` items might come in from the client with `/` in it, which won't work on windows!
   */
  getServerPath = (projectId, ...pathSuffix) => {
    const projectName = this.getProjectName(projectId)
    const path = fileUtils.joinPath(this.serverPath, projectName, ...pathSuffix)
    console.warn("getServerPath", { projectId, projectName, pathSuffix, path })
    // if (!ProjectRoot.LEGAL_PROJECT_ID.test(projectId)) {
    //   throw new TypeError(`getServerPath(): invalid projectId: '${projectId}' for path '${path}'`)
    // }
    // if (!this.isValidServerPath(path)) {
    //   throw new TypeError(`getServerPath(): invalid path: '${path}'`)
    // }
    return path
  }

  /** Given one or more `path` strings, return client URL resource. */
  getURL = (projectId, ...path) => {
    return fileUtils.joinURL(projectId, ...path)
  }

  //----------------------------
  //  Projects list
  //----------------------------

  /**
   * Return list of client projects relative to this projectSpec as JSON blob.
   * Format:
   *   `[ "<project-path>"... ]`
   */
  getProjectList = async (domainPath) => {
    const path = new SpellPath(domainPath)
    if (!path.isDomainPath) throw new TypeError(`You must pass a valid domain path, got '${domainPath}'`)
    const options = { includeFolders: true, includeFiles: false, namesOnly: true }
    const projectNames = await fileUtils.getFolderContents(path.serverPath, options)
    return projectNames.map((projectName) => `${path.owner}:${path.domain}:${projectName}`)
  }

  /** Send projects list as part of a request. */
  request_getProjectList = respondWithJSON(async () => this.getProjectList("@user:projects"))

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
    const project = new SpellPath(projectId)
    if (!project.isProjectPath) throw new TypeError(`You must pass a valid projectId, got '${projectId}'`)
    const options = { includeFolders: false, ignoreHidden: true, namesOnly: true }
    const fileNames = await fileUtils.getFolderContents(project.serverPath, options)
    const files = await Promise.all(
      fileNames.map(async (name) => {
        const filePath = project.getPathForFile(name)
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

    console.info(`Creating index for project ${this.getURL(projectId)}`)
    const options = { includeFolders: false, ignoreHidden: true, namesOnly: true }
    const files = await fileUtils.getFolderContents(project.serverPath, options)
    return {
      imports: files.map((name) => {
        const file = project.getPathForFile(name)
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
    const project = new SpellPath(projectId)
    if (!project.isProjectPath) throw new TypeError(`You must pass a valid projectId, got '${projectId}'`)
    const file = project.getPathForFile(filePath)
    if (!file.isFilePath) throw new TypeError(`You must pass a valid filePath, got '${filePath}'`)
    responseUtils.sendJSONFile(response, file.serverPath)
  }

  /**
   * Save a (non-nested!) file in a project.
   * TODO: format according to extension!!!
   */
  saveFile = async (projectId, filePath, contents) => {
    const path = this.getServerPath(projectId, filePath)
    return await fileUtils.saveFile(path, contents)
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
    const startFilePath = this.getServerPath(projectId, filePath)
    return await fileUtils.saveFile(startFilePath, contents)
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
    const path = this.getServerPath(projectId)
    const newPath = this.getServerPath(newProjectId)
    return await fileUtils.movePath(path, newPath)
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
    const path = this.getServerPath(projectId)
    const newPath = this.getServerPath(newProjectId)
    return await fileUtils.copyPath(path, newPath)
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
    const path = this.getServerPath(projectId)
    return await fileUtils.deletePath(path)
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
    const path = this.getServerPath(projectId, filePath)
    const newPath = this.getServerPath(projectId, newFilePath)
    return await fileUtils.movePath(path, newPath)
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
    const path = this.getServerPath(projectId, filePath)
    return await fileUtils.deletePath(path)
  }
  request_removeFile = respondWithJSON(async (request) => {
    const { projectId, filePath } = request.body
    return await this.removeFile(projectId, filePath)
  })
}
