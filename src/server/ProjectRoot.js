/**
 * `ProjectRoot` -- manager for a set of spell projects.
 */
import * as fileUtils from "./file-utils"
import * as responseUtils from "./response-utils"

const { respondWithJSON } = responseUtils

const USER_SERVER_PATH = fileUtils.normalizePath(__dirname, "..")
const SYSTEM_SERVER_PATH = fileUtils.normalizePath(__dirname, "..")

/**
 * `ProjectRoot` class: encompasses
 */
export class ProjectRoot {
  // key = "projects"
  // type = "user"
  // description = "User projects"
  // projectRoot = "/projects/"
  // apiPrefix = "/api/projects"

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

  /**
   * Given a `projectId` and one or more `pathSegments`, return server path for resource.
   * Throws is invalid `projectId` or resulting `path`.
   *
   * TODO: `pathSuffix` items might come in from the client with `/` in it, which won't work on windows!
   */
  getServerPath = (projectId, ...pathSuffix) => {
    const path = fileUtils.joinPath(this.serverPath, projectId, ...pathSuffix)
    if (!ProjectRoot.LEGAL_PROJECT_ID.test(projectId)) {
      throw new TypeError(`getServerPath(): invalid projectId: '${projectId}' for path '${path}'`)
    }
    if (!this.isValidServerPath(path)) {
      throw new TypeError(`getServerPath(): invalid path: '${path}'`)
    }
    return path
  }

  /** Given one or more `path` strings, return client URL resource. */
  getURL = (...path) => {
    return fileUtils.joinURL(this.projectRoot, ...path)
  }

  //----------------------------
  //  Projects list
  //----------------------------

  /**
   * Return list of client projects relative to this projectSpec as JSON blob.
   * Format:
   *   `[ "/projects/project1", "/projects/project2" ]`
   */
  getProjectList = async () => {
    const options = { includeDirs: true, includeFiles: false, namesOnly: true }
    const projectIds = await fileUtils.getFolderContents(this.serverPath, options)
    return projectIds.map((projectId) => this.getURL(projectId))
  }

  /** Send projects list as part of a request. */
  request_getProjectList = respondWithJSON(async () => this.getProjectList())

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
  //  Project manifest
  //----------------------------

  /**
   * Return `manifest.json` for a project as JSON blob.
   * NOTE: does not handle nested folders!!!
   * Format:
   *   `{ files: [ { name, path, created, modified }... ] }`
   */
  getManifest = async (projectId) => {
    // TODO: check options if we have nested folders
    const options = { foldersOnly: true, namesOnly: true, ignoreHidden: true }
    const fileNames = await fileUtils.getFolderContents(this.getServerPath(projectId), options)
    const files = await Promise.all(
      fileNames.map(async (name) => {
        const serverPath = this.getServerPath(projectId, name)
        const { created, modified } = await fileUtils.getPathInfo(serverPath)
        return { name, path: this.getURL(projectId, name), created, modified }
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
    const path = this.getServerPath(projectId, ".index.json5")
    const exists = await fileUtils.pathExists(path)
    if (exists) return responseUtils.sendJSONFile(response, path)

    console.info(`Creating index for project ${this.getURL(projectId)}`)
    const options = { ignoreHidden: true, namesOnly: true }
    const files = await fileUtils.getFolderContents(this.getServerPath(projectId), options)
    return {
      imports: files.map((name) => ({ path: this.getURL(projectId, name), active: true }))
    }
  }
  request_getIndex = respondWithJSON(async (request) => {
    const { projectId } = request.params
    return await this.getIndex(projectId)
  })

  //----------------------------
  //  Project file manipulation
  //----------------------------

  /**
   * Return a file from a project.
   * TODO: return proper file type according to mime-type and/or request???!
   */
  request_getFile = (request, response) => {
    const { projectId, filePath } = request.params
    const path = this.getServerPath(projectId, filePath)
    responseUtils.sendJSONFile(response, path)
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
