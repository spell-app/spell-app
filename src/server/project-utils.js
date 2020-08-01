/**
 * Utilities for working with projects and project files.
 * The `request_XXX` version can be passed directly to express.
 */
import * as fileUtils from "./file-utils"
import * as responseUtils from "./response-utils"
import { SpellLocation } from "../languages/spell/SpellLocation"

const { respondWithJSON } = responseUtils

// Root of "@system" files
const SYSTEM_SERVER_ROOT = fileUtils.normalizePath(__dirname, "..")
// Root of "@user" files
const USER_SERVER_ROOT = fileUtils.normalizePath(__dirname, "..")

// HACKY!!!
// Make sure we don't save `SpellLocation` instances in the singleton registry
// or we'll leak memory!
SpellLocation.useRegistry = false

/**
 * Add a getter to figure out the `serverPath` for a `SpellLocation`.
 */
Object.defineProperty(SpellLocation.prototype, "serverPath", {
  get() {
    const path = [this.owner === "@system" ? SYSTEM_SERVER_ROOT : USER_SERVER_ROOT, this.domain, this.projectName]
    if (this.filePath) path.push(...this.filePath.split("/"))
    const serverPath = fileUtils.normalizePath(...path.filter(Boolean))
    console.warn(`Server path for path '${this.path}' => '${serverPath}'`)
    return serverPath
  }
})

const DEFAULT_FILE = {
  filePath: "/Untitled.spell",
  contents: "// New file"
}

/**
 * Return list of client projects relative to this projectSpec as JSON blob.
 * Format:
 *   `[ "<project-path>"... ]`
 */
export const getProjectList = async (domainId) => {
  const domain = SpellLocation.getProjectRoot(domainId)
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
//  Project index
//----------------------------

/**
 * Given a file `name`, return `true` if we should add it to the manifest.
 */
function isManifestFile(name) {
  return name.endsWith(".spell") || name.endsWith(".css")
}

/**
 * Return the `SpellLocation` for project `imports` file.
 */
export function getImportsLocation(projectId) {
  return SpellLocation.getFileLocation(projectId, ".imports.json")
}

/**
 * Load a project `.imports.json` file, returning default import file if not found.
 */
export const loadImports = async (projectId) => {
  const location = getImportsLocation(projectId)
  const existing = await fileUtils.loadJSONFile(location.serverPath, "OPTIONAL")
  return existing || { imports: [] }
}

/**
 * Save a project `.imports.json` file.
 */
export const saveImports = async (projectId, contents) => {
  const location = getImportsLocation(projectId)
  return await fileUtils.saveJSONFile(location.serverPath, contents)
}

/**
 * Return `index` for a project as a JSON blob.
 *
 * Returned value includes:
 *  - `manifest: { [path]: { created, modified, size }  }`
 *  - `imports: [ { path, active } ] }`
 *
 * The `manifest` portion will reflect the current state of the file system.
 * The `imports` portion will be synced with the `manifest`,
 * and will be saved to disk as `.imports.json` if imports change.
 */
export const getIndex = async (projectId) => {
  const location = SpellLocation.getProjectLocation(projectId)

  // Get non-hidden files in project which the front-end knows how to deal with
  const options = { includeFolders: false, ignoreHidden: true, namesOnly: true }
  let fileNames = (await fileUtils.getFolderContents(location.serverPath, options)) //
    .filter(isManifestFile)

  // HACKY: make sure we have at least one valid file by creating a default file
  if (!fileNames.length) {
    await createFile(projectId, DEFAULT_FILE.filePath, DEFAULT_FILE.contents)
    fileNames = [DEFAULT_FILE.filePath]
  }

  // create manifest including created/modified/size info per file
  const manifest = {}
  await Promise.all(
    fileNames.map(async (name) => {
      const location = SpellLocation.getFileLocation(projectId, name)
      const { created, modified, size } = await fileUtils.getPathInfo(location.serverPath)
      manifest[location.path] = { created, modified, size }
    })
  )

  // get `imports` from existing imports file if present
  const importsFile = await loadImports(projectId)
  // Filter imports: which are not in existingPaths
  const existingPaths = { ...manifest }
  let anythingChanged = false
  importsFile.imports = importsFile.imports.filter(({ path }) => {
    // Full paths including projectId refer to other projects
    // So assume we should leave them alone.
    if (path.startsWith("@")) return true

    // Get the location relative to this project
    const location = SpellLocation.getFileLocation(projectId, path)
    // if not found, remove from imports
    if (!existingPaths[location.path]) {
      anythingChanged = true
      return false
    }
    // otherwise return from existing so we know it was found below
    delete existingPaths[location.path]
    return true
  })
  // Anything left in `existingPaths` is MISSING from the imports,
  // add at the end of the imports as `active`.
  Object.keys(existingPaths).forEach((path) => {
    const location = new SpellLocation(path)
    // Record as a local `filepa` string, which includes the folder / leading slash
    importsFile.imports.push({ path: location.filePath, active: true })
    anythingChanged = true
  })

  // Save the new imports if anything changed
  // NOTE: we explicitly do not save the `manifest`
  if (anythingChanged) await saveImports(projectId, importsFile)

  // return manifest and imports
  return { ...importsFile, manifest }
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
  const location = SpellLocation.getFileLocation(projectId, filePath)
  responseUtils.send(response, location.serverPath, { dotfiles: "allow" })
}

/**
 * Save a (non-nested!) file in a project.
 * TODO: format according to extension!!!
 */
export const saveFile = async (projectId, filePath, contents) => {
  const location = SpellLocation.getFileLocation(projectId, filePath)
  return await fileUtils.saveFile(location.serverPath, contents)
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
 * Request version returns updated project list.
 */
export const createProject = async (projectId, filePath, contents) => {
  const location = SpellLocation.getFileLocation(projectId, filePath || DEFAULT_FILE.filePath)
  return await fileUtils.saveFile(location.serverPath, contents || DEFAULT_FILE.contents)
}
export const request_createProject = respondWithJSON(async (request) => {
  const { projectId, filePath, contents } = request.body
  await createProject(projectId, filePath, contents)
  return await getProjectList(projectId)
})

/**
 * Duplicate project `projectId` as `newProjectId`.
 * Request version returns updated project list.
 */
export const duplicateProject = async (projectId, newProjectId) => {
  const location = SpellLocation.getProjectLocation(projectId)
  const newLocation = SpellLocation.getProjectLocation(newProjectId)
  return await fileUtils.copyPath(location.serverPath, newLocation.serverPath)
}
export const request_duplicateProject = respondWithJSON(async (request) => {
  const { projectId, newProjectId } = request.body
  await duplicateProject(projectId, newProjectId)
  return await getProjectList(projectId)
})

/**
 * Rename project `projectId` to `newProjectId`.
 * Request version returns updated project list.
 */
export const renameProject = async (projectId, newProjectId) => {
  const location = SpellLocation.getProjectLocation(projectId)
  const newLocation = SpellLocation.getProjectLocation(newProjectId)
  return await fileUtils.movePath(location.serverPath, newLocation.serverPath)
}
export const request_renameProject = respondWithJSON(async (request) => {
  const { projectId, newProjectId } = request.body
  await renameProject(projectId, newProjectId)
  return await getProjectList(projectId)
})

/**
 * Remove (permanently delete) project `projectId`.
 * Request version returns updated project list.
 */
export const deleteProject = async (projectId) => {
  const location = SpellLocation.getProjectLocation(projectId)
  return await fileUtils.deletePath(location.serverPath)
}
export const request_deleteProject = respondWithJSON(async (request) => {
  const { projectId } = request.body
  await deleteProject(projectId)
  return await getProjectList(projectId)
})

//----------------------------
//  Project file manipulation
//----------------------------

/**
 * Create a new project file.
 * Request version returns updated index, which will `import` new file at the end.
 */
export const createFile = async (projectId, filePath, contents) => {
  return await saveFile(projectId, filePath, contents)
}
export const request_createFile = respondWithJSON(async (request) => {
  const { projectId, filePath, contents } = request.body
  await createFile(projectId, filePath, contents)
  return await getIndex(projectId)
})

/**
 * Rename a project file.
 * Request version returns updated index.
 */
export const renameFile = async (projectId, filePath, newFilePath) => {
  const location = SpellLocation.getFileLocation(projectId, filePath)
  const newLocation = SpellLocation.getFileLocation(projectId, newFilePath)
  await fileUtils.movePath(location.serverPath, newLocation.serverPath)

  // update `imports` so file order stays the same
  let importsFile = await loadImports(projectId)
  importsFile.imports = importsFile.imports.map((item) => {
    if (item.path === filePath) return { ...item, path: newFilePath }
    return item
  })
  await saveImports(projectId, importsFile)

  return true
}
export const request_renameFile = respondWithJSON(async (request) => {
  const { projectId, filePath, newFilePath } = request.body
  await renameFile(projectId, filePath, newFilePath)
  return await getIndex(projectId)
})

/**
 * Delete a project file.
 * Request version returns updated index.
 */
export const deleteFile = async (projectId, filePath) => {
  const location = SpellLocation.getFileLocation(projectId, filePath)
  return await fileUtils.deletePath(location.serverPath)
}
export const request_deleteFile = respondWithJSON(async (request) => {
  const { projectId, filePath } = request.body
  await deleteFile(projectId, filePath)
  return await getIndex(projectId)
})
