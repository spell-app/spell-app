/**
 * Utilities for working with projects and project files.
 * The `request_XXX` variant can be passed directly to express.
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
// Make sure we don't save `SpellPath` instances in the singleton registry
// or we'll leak memory!
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
 * Return list of client projects relative to this projectSpec as JSON blob.
 * Format:
 *   `[ "<project-path>"... ]`
 */
export const getProjectList = async (domainId) => {
  const domain = SpellPath.getDomainPath(domainId)
  const options = { includeFolders: true, includeFiles: false, namesOnly: true }
  const projectNames = await fileUtils.getFolderContents(domain.serverPath, options)
  return projectNames.map((projectName) => `${domain.owner}:${domain.domain}:${projectName}`)
}

/** Send projects list as part of a request. */
export const request_getProjectList = respondWithJSON(async (request) => {
  const { domainId } = request.params
  return await getProjectList(domainId)
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
export const getManifest = async (projectId) => {
  const project = SpellPath.getProjectPath(projectId)
  const options = { includeFolders: false, ignoreHidden: true, namesOnly: true }
  const fileNames = await fileUtils.getFolderContents(project.serverPath, options)
  const files = await Promise.all(
    fileNames.map(async (name) => {
      const filePath = SpellPath.getFilePath(project, name)
      const { created, modified } = await fileUtils.getPathInfo(filePath.serverPath)
      return { name, path: filePath.path, created, modified }
    })
  )

  return { files }
}
export const request_getManifest = respondWithJSON(async (request) => {
  const { projectId } = request.params
  return await getManifest(projectId)
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
export const getIndex = async (projectId) => {
  const project = new SpellPath(projectId)
  if (!project.isProjectPath) throw new TypeError(`You must pass a valid projectId, got '${projectId}'`)

  // TODO: load index from disk if present
  // const path = getServerPath(projectId, ".index.json5")
  // const exists = await fileUtils.pathExists(path)
  // if (exists) return responseUtils.sendJSONFile(response, path)

  console.info(`Creating index for project ${projectId}`)
  const options = { includeFolders: false, ignoreHidden: true, namesOnly: true }
  const files = await fileUtils.getFolderContents(project.serverPath, options)
  return {
    imports: files.map((name) => {
      const file = SpellPath.getFilePath(project, name)
      return { path: file.path, active: true }
    })
  }
}
export const request_getIndex = respondWithJSON(async (request) => {
  const { projectId } = request.params
  return await getIndex(projectId)
})

//----------------------------
//  Get/save project files
//----------------------------

/**
 * Return a file from a project.
 * TODO: return proper file type according to mime-type and/or request???!
 */
export const request_getFile = (request, response) => {
  const { projectId, filePath } = request.params
  const project = SpellPath.getProjectPath(projectId)
  const file = SpellPath.getFilePath(project, filePath)
  responseUtils.sendJSONFile(response, file.serverPath)
}

/**
 * Save a (non-nested!) file in a project.
 * TODO: format according to extension!!!
 */
export const saveFile = async (projectId, filePath, contents) => {
  const project = SpellPath.getProjectPath(projectId)
  const file = SpellPath.getFilePath(project, filePath)
  return await fileUtils.saveFile(file.serverPath, contents)
}
export const request_saveFile = respondWithJSON(async (request) => {
  const { projectId, filePath } = request.params
  const contents = request.body
  return await saveFile(projectId, filePath, contents)
})

//----------------------------
//  Project manipulation
//----------------------------

/**
 * Create project `projectId` by creating file at `filePath` within it.
 */
export const createProject = async (projectId, filePath = "Untitled.spell", contents = "") => {
  const project = SpellPath.getProjectPath(projectId)
  const file = SpellPath.getFilePath(project, filePath)
  return await fileUtils.saveFile(file.serverPath, contents)
}
export const request_createProject = respondWithJSON(async (request) => {
  const { projectId, filePath, contents } = request.body
  return createProject(projectId, filePath, contents)
})

/**
 * Rename project `projectId` to `newProjectId`.
 */
export const renameProject = async (projectId, newProjectId) => {
  const project = SpellPath.getProjectPath(projectId)
  const newProject = SpellPath.getProjectPath(newProjectId)
  return await fileUtils.movePath(project.serverPath, newProject.serverPath)
}
export const request_renameProject = respondWithJSON(async (request) => {
  const { projectId, newProjectId } = request.body
  return await renameProject(projectId, newProjectId)
})

/**
 * Duplicate project `projectId` as `newProjectId`.
 */
export const duplicateProject = async (projectId, newProjectId) => {
  const project = SpellPath.getProjectPath(projectId)
  const newProject = SpellPath.getProjectPath(newProjectId)
  return await fileUtils.copyPath(project.serverPath, newProject.serverPath)
}
export const request_duplicateProject = respondWithJSON(async (request) => {
  const { projectId, newProjectId } = request.body
  return await duplicateProject(projectId, newProjectId)
})

/**
 * Remove (permanently delete) project `projectId`.
 */
export const removeProject = async (projectId) => {
  const project = SpellPath.getProjectPath(projectId)
  return await fileUtils.deletePath(project.serverPath)
}
export const request_removeProject = respondWithJSON(async (request) => {
  const { projectId } = request.body
  return removeProject(projectId)
})

//----------------------------
//  Project file manipulation
//----------------------------

/**
 * Create a new project file.
 * TODO: save in the index!
 */
export const createFile = async (projectId, filePath, contents) => {
  return await saveFile(projectId, filePath, contents)
}
export const request_createFile = respondWithJSON(async (request) => {
  const { projectId, filePath, contents } = request.body
  return await createFile(projectId, filePath, contents)
})

/**
 * Rename a project file.
 * TODO: update index!
 */
export const renameFile = async (projectId, filePath, newFilePath) => {
  const project = SpellPath.getProjectPath(projectId)
  const file = SpellPath.getFilePath(project, filePath)
  const newFile = SpellPath.getFilePath(project, newFilePath)
  return await fileUtils.movePath(file.serverPath, newFile.servePath)
}
export const request_renameFile = respondWithJSON(async (request) => {
  const { projectId, filePath, newFilePath } = request.body
  return await renameFile(projectId, filePath, newFilePath)
})

/**
 * Delete a project file.
 * TODO: update index!
 */
export const removeFile = async (projectId, filePath) => {
  const project = SpellPath.getProjectPath(projectId)
  const file = SpellPath.getFilePath(project, filePath)
  return await fileUtils.deletePath(file.serverPath)
}
export const request_removeFile = respondWithJSON(async (request) => {
  const { projectId, filePath } = request.body
  return await removeFile(projectId, filePath)
})
