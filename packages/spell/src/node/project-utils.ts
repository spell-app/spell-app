/**
 * Utilities for working with projects and project files.
 * The `request_XXX` version can be passed directly to a `SRV.Router` route (Express-shaped).
 */
import type { SRV } from "$/server"
import environment from "$/spell/node/environment"

import { SP } from "$/spell"

import * as fileUtils from "./file-utils"
import * as responseUtils from "./response-utils"
import type { ManifestJSON, ProjectFileJSON, ProjectIndexJSON } from "./server.types"

const { respondWithJSON } = responseUtils

/** Express's names, kept so every handler reads as before. */
type Request = SRV.Request
type Response = SRV.Reply

// HACKY!!!
// Make sure we don't save `SP.SpellLocation` instances in the singleton registry or we'll leak memory!
// TESTME: is this still needed?
SP.SpellLocation.useRegistry = false

/**
 * Add a getter to figure out `serverPath` for a `SP.SpellLocation` -- client-side `SpellLocation.serverPath`
 * just throws, this monkey-patches in the real (server-only) implementation for this install.
 * - SECURITY: this is the ONLY place a client-supplied path turns into a real on-disk path -- it relies
 *   entirely on `SpellLocation`'s own constructor having already validated `owner` / `domain` / `projectName`
 *   / `filePath` segments (see `SpellLocation.isValidPathSegment()` -- blocks `.` / `..` segments and anything
 *   outside `[\w\d-$. ]`) before we ever get here.  Every `request_*` handler below reaches this via
 *   `SP.SpellLocation.getFileLocation()` / `getProjectLocation()` / `getProjectRoot()`, which construct
 *   a fresh `SpellLocation` from request params/body -- so validation always re-runs server-side even
 *   though the client validates too.
 * - `fileUtils.normalizePath()` additionally collapses any stray `.`/`..`/`//` that validation missed,
 *   as defense in depth.
 */
Object.defineProperty(SP.SpellLocation.prototype, "serverPath", {
  get() {
    const path = [serverPathForRoot(this.projectRoot), this.projectName]
    if (this.filePath) path.push(...this.filePath.split("/"))
    const serverPath = fileUtils.normalizePath(...path.filter(Boolean))
    console.warn(`Server path for path '${this.path}' => '${serverPath}'`)
    return serverPath
  }
})

/**
 * Folder on disk holding project root `rootPath`'s projects, one sub-folder each.
 * - A root added at runtime says where with `spec.serverPath`.
 * - A built-in root lives in its `folder` -- default its `domain` -- under its `owner`'s files root:
 *   `environment.systemFilesRoot`, `testFilesRoot`, else `userFilesRoot`.  e.g. `projects/system/examples`,
 *   or `projects/user` itself.
 * - Throws if `rootPath` isn't a known root.
 */
export function serverPathForRoot(rootPath: SP.ProjectRootPath): string {
  const spec = SP.SpellSetup.projectSpectForRootPath(rootPath)
  if (spec.serverPath) return spec.serverPath
  return fileUtils.normalizePath(filesRootFor(spec.owner), spec.folder ?? spec.domain)
}

/** Folder holding owner `owner`'s built-in roots, e.g. `projects/system` for `@system`. */
function filesRootFor(owner: string): string {
  if (owner === "@system") return environment.systemFilesRoot
  if (owner === "@test") return environment.testFilesRoot
  return environment.userFilesRoot
}

/** Default file created for a brand-new project, or when `getIndex()` finds a project with zero files. */
const DEFAULT_FILE = {
  filePath: "/Untitled.spell",
  contents: "// New file"
} as const

/**
 * Return list of client projects for `domainId` (a `projectRoot` path like `@user:projects`) as JSON blob.
 * - Format: `[ "<project-path>"... ]`, e.g. `["@user:projects:myProject", ...]`.
 * - Lists (non-empty) subfolders of `domain`'s `serverPath` as project names -- so a "project" is just
 *   a folder on disk.
 */
export const getProjectList = async (domainId: string) => {
  const domain = SP.SpellLocation.getProjectRoot(domainId)
  const options = { includeFolders: true, includeFiles: false, namesOnly: true, ignoreEmptyFolders: true }
  const projectNames = await fileUtils.getFolderContents(domain.serverPath, options)
  return projectNames.map((projectName) => `${domain.owner}:${domain.domain}:${projectName}`)
}

/**
 * `GET /api/projects/list/:domainId` -- list projects under a project root.
 * - Client sends: `domainId` route param, e.g. `@user:projects`.
 * - Returns: JSON array of project path strings.
 * - Failure: 500 (via `respondWithJSON`) if `domainId` doesn't resolve to a known `SpellSetup.projectRoots` entry.
 */
export const request_getProjectList = respondWithJSON(async (request) => {
  const { domainId } = request.params
  return await getProjectList(domainId)
})

////////////////
// ## Project index
////////////////

/**
 * Given a file `name`, return `true` if we should add it to the manifest.
 * - RENAME: identical body to `isPreloadFile()` below -- currently the same list serves both purposes,
 *   but they're kept as separate functions/constants presumably so they CAN diverge later.
 */
const manifestExtensions = [".spell", ".css", ".js", ".jsx"]
function isManifestFile(name: string) {
  // NOT a project's compiled output, e.g. `Solitaire.compiled.js`, nor a test fixture's snapshot of it,
  // nor its scope pack -- `getIndex()` would make it an import
  if ([SP.COMPILED_JS_SUFFIX, SP.SNAPSHOT_JS_SUFFIX, SP.SCOPES_JS_SUFFIX].some((suffix) => name.endsWith(suffix))) {
    return false
  }
  return manifestExtensions.some((extension) => name.endsWith(extension))
}

/** Given a file `name`, return `true` if we should preload it (fetch `contents` eagerly in `getIndex()`). */
function isPreloadFile(name: string) {
  return manifestExtensions.some((extension) => name.endsWith(extension))
}

/** Return `SP.SpellLocation` for a project's `project.json` file. */
export function getProjectFileLocation(projectId: string) {
  return SP.SpellLocation.getFileLocation(projectId, SP.PROJECT_FILE)
}

/**
 * Load a project's `project.json` file, returning `{ imports: [] }` default if not found.
 * - TODO: why is this arrow function?
 */
export const loadProjectFile = async (projectId: string): Promise<ProjectFileJSON> => {
  const location = getProjectFileLocation(projectId)
  const existing = await fileUtils.loadJSONFile(location.serverPath, "OPTIONAL")
  return existing || { imports: [] }
}

/**
 * Save a project's `project.json` file.
 * - SIDE EFFECT: overwrites file wholesale, no merge with disk -- pass what `loadProjectFile()` gave you,
 *   changed, so its `version` / `exports` / `targets` survive.
 */
export const saveProjectFile = async (projectId: string, contents: ProjectFileJSON) => {
  const location = getProjectFileLocation(projectId)
  return await fileUtils.saveJSONFile(location.serverPath, contents)
}

/**
 * Return `index` for a project as a JSON blob -- see `ProjectIndexJSON`.
 * - `manifest` portion always reflects current state of file system.
 * - `imports` portion is synced with `manifest` (missing files dropped, new files appended as `active`),
 *   and SIDE EFFECT: saved to disk in `project.json` if anything changed.
 * - HACKY: if project has zero manifest-worthy files, creates `DEFAULT_FILE` so there's always at least one.
 */
export const getIndex = async (projectId: string): Promise<ProjectIndexJSON> => {
  const location = SP.SpellLocation.getProjectLocation(projectId)

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
  const manifest: ManifestJSON = {}
  await Promise.all(
    fileNames.map(async (name) => {
      const location = SP.SpellLocation.getFileLocation(projectId, name)
      const { created, modified, size } = await fileUtils.getPathInfo(location.serverPath)
      manifest[location.path] = { created, modified, size }
    })
  )

  // get `imports` from existing imports file if present
  const importsFile = await loadProjectFile(projectId)
  // Filter imports: which are not in existingPaths
  const existingPaths = { ...manifest }
  let anythingChanged = false
  importsFile.imports = importsFile.imports.filter(({ path }: { path: string }) => {
    // Full paths including projectId refer to other projects
    // So assume we should leave them alone.
    if (path.startsWith("@")) return true

    // Get the location relative to this project
    const location = SP.SpellLocation.getFileLocation(projectId, path)
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
    const location = new SP.SpellLocation(path)
    if (!location.filePath) return
    // Record as a local `filePath` string, which includes the folder / leading slash
    importsFile.imports.push({ path: location.filePath, active: true })
    anythingChanged = true
  })

  // Save the new imports if anything changed
  // NOTE: we explicitly do not save the `manifest`
  if (anythingChanged) await saveProjectFile(projectId, importsFile)

  // Set `contents` for the active imports
  await Promise.all(
    importsFile.imports.map(async (entry) => {
      const { path, active } = entry
      if (!active || !isPreloadFile(path)) return
      const location = SP.SpellLocation.getFileLocation(projectId, path)
      entry.contents = await fileUtils.loadFile(location.serverPath)
    })
  )

  // return manifest and imports
  const { version, exports, targets } = importsFile
  return { imports: importsFile.imports, manifest, version, exports, targets }
}

/**
 * `GET /api/projects/index/:projectId` -- fetch (and resync) a project's index.
 * - Client sends: `projectId` route param, e.g. `@user:projects:myProject`.
 * - Returns: `ProjectIndexJSON`.
 * - Failure: 500 if `projectId` is not a valid project path.
 */
export const request_getIndex = respondWithJSON(async (request) => {
  const { projectId } = request.params
  return await getIndex(projectId)
})

////////////////
// ## Get/save project files
////////////////

/**
 * `GET /api/projects/file/:projectId/:filePath*` -- fetch raw contents of one project file.
 * - Client sends: `projectId` and `filePath` route params (`filePath*` is a wildcard, so it can include
 *   `/`-separated nested folders).
 * - Returns: raw file body via `SRV.Reply.sendFile()` (mime type set from extension); `{ dotfiles: "allow" }`
 *   so dotfiles can be fetched too.
 * - Failure: 404 (via `responseUtils.sendFile()`) if file not found; 500 if `projectId`/`filePath` don't
 *   resolve to a valid file path (thrown by `SpellLocation.getFileLocation()`) or if the send itself fails.
 * - NOTE: deliberately NOT wrapped in `respondWithJSON` -- that would send a JSON body on top of the file
 *   we already streamed.  We catch by hand instead so a rejection can't go unhandled and hang the client.
 * - TODO: return proper file type according to mime-type and/or request???!
 */
export const request_getFile = async (request: Request, response: Response) => {
  const { projectId, filePath } = request.params
  try {
    const location = SP.SpellLocation.getFileLocation(projectId, filePath)
    await responseUtils.sendFile(response, location.serverPath, { dotfiles: "allow" })
  } catch (error) {
    // Can't send an error body once the file has started streaming -- the client sees a truncated response.
    if (response.headersSent) return
    responseUtils.sendError(response, 500, error as Error)
  }
}

/**
 * Return project `projectId`'s compiled JS, `<Project>.compiled.js`, as a JS module.
 * - What a runner fetches for `@spell/project/<projectId>`, so one project's compiled output can `import`
 *   another's -- see `SP.SPELL_PROJECT_MODULE`, and `runCompiled()` in `src/app/runner/`.
 * - Not found => 404:  that project has never been compiled.
 */
export const request_getCompiled = (request: Request, response: Response) =>
  sendProjectFile(request, response, SP.COMPILED_JS_SUFFIX, "text/javascript")

/**
 * Send project `projectId`'s scope pack, `<Project>.scopes.js`, as javascript -- 404 if it hasn't been written.
 * - A classic script, NOT a module:  `<spell-app>` loads it with a `<script>` tag.  See `LSP.ScopePack`.
 */
export const request_getScopes = (request: Request, response: Response) =>
  sendProjectFile(request, response, SP.SCOPES_JS_SUFFIX, "text/javascript")

/**
 * Send project `projectId`'s declarations, `<Project>.declarations.json` -- 404 if it hasn't been compiled since
 * they had a file of their own.  What a runner's Type Explorer finds each declaration's code by.
 */
export const request_getDeclarations = (request: Request, response: Response) =>
  sendProjectFile(request, response, SP.DECLARATIONS_JSON_SUFFIX, "application/json")

/** Send request's project's `<Project><suffix>` file as `type`. */
async function sendProjectFile(request: Request, response: Response, suffix: string, type: string) {
  const { projectId } = request.params
  try {
    const location = SP.SpellLocation.getProjectLocation(projectId)
    const file = SP.SpellLocation.getFileLocation(projectId, `${location.projectName}${suffix}`)
    response.type(type)
    await responseUtils.sendFile(response, file.serverPath)
  } catch (error) {
    // Can't send an error body once the file has started streaming -- the client sees a truncated response.
    if (response.headersSent) return
    responseUtils.sendError(response, 500, error as Error)
  }
}

/**
 * Save a file in a project, creating intervening folders as needed (see `fileUtils.saveFile()`).
 * - NOTE: comment here used to say "non-nested!", but `filePath` CAN include folder segments --
 *   `SpellLocation.getFileLocation()` and `fileUtils.saveFile()` both handle it; doc corrected to match code.
 * - SIDE EFFECT: overwrites file wholesale, no locking against concurrent writers (see `lock-utils.ts`).
 * - TODO: format according to extension!!!
 */
export const saveFile = async (projectId: string, filePath: string, contents: any) => {
  const location = SP.SpellLocation.getFileLocation(projectId, filePath)
  return await fileUtils.saveFile(location.serverPath, contents)
}

/**
 * `POST /api/projects/file/:projectId/:filePath*` -- save/overwrite one project file.
 * - Client sends: `projectId` / `filePath` route params, raw body as file contents (text or JSON per
 *   `Content-Type`, see `bodyParser` setup in `server/index.ts`).
 * - Returns: `true` on success.
 * - Failure: 500 (via `respondWithJSON`) on invalid path or write error.
 */
export const request_saveFile = respondWithJSON(async (request) => {
  const { projectId, filePath } = request.params
  const contents = request.body
  return await saveFile(projectId, filePath, contents)
})

////////////////
// ## Project manipulation
////////////////

/** Create project `projectId` by creating file at `filePath` (default `DEFAULT_FILE`) within it. */
export const createProject = async (projectId: string, filePath: string, contents: any) => {
  const location = SP.SpellLocation.getFileLocation(projectId, filePath || DEFAULT_FILE.filePath)
  return await fileUtils.saveFile(location.serverPath, contents || DEFAULT_FILE.contents)
}

/**
 * `POST /api/projects/create/project` -- create a new project.
 * - Client sends body: `{ projectId, filePath?, contents? }` -- `projectId` is the new project's full
 *   path, e.g. `@user:projects:myProject`; `filePath`/`contents` default to `DEFAULT_FILE`.
 * - Returns: updated project list (see `getProjectList()`) for `projectId`'s `projectRoot`.
 * - Failure: 500 if `projectId` is invalid, or on write error.
 */
export const request_createProject = respondWithJSON(async (request) => {
  const { projectId, filePath, contents } = request.body
  await createProject(projectId, filePath, contents)
  return await getProjectList(projectId)
})

/** Duplicate project `projectId` as `newProjectId` -- recursive folder copy via `fileUtils.copyPath()`. */
export const duplicateApp = async (projectId: string, newProjectId: string) => {
  const location = SP.SpellLocation.getProjectLocation(projectId)
  const newLocation = SP.SpellLocation.getProjectLocation(newProjectId)
  return await fileUtils.copyPath(location.serverPath, newLocation.serverPath)
}

/**
 * `POST /api/projects/duplicate/project` -- duplicate an existing project.
 * - Client sends body: `{ projectId, newProjectId }`.
 * - Returns: updated project list for `projectId`'s `projectRoot`.
 * - Failure: 500 if either id is invalid, or if `fse.copy()` rejects (e.g. `newProjectId` already exists).
 */
export const request_duplicateApp = respondWithJSON(async (request) => {
  const { projectId, newProjectId } = request.body
  await duplicateApp(projectId, newProjectId)
  return await getProjectList(projectId)
})

/** Rename project `projectId` to `newProjectId` -- folder move via `fileUtils.movePath()`. */
export const renameApp = async (projectId: string, newProjectId: string) => {
  const location = SP.SpellLocation.getProjectLocation(projectId)
  const newLocation = SP.SpellLocation.getProjectLocation(newProjectId)
  return await fileUtils.movePath(location.serverPath, newLocation.serverPath)
}

/**
 * `POST /api/projects/rename/project` -- rename an existing project.
 * - Client sends body: `{ projectId, newProjectId }`.
 * - Returns: updated project list for `projectId`'s `projectRoot`.
 * - Failure: 500 if either id is invalid, or if `fse.move()` rejects (e.g. `newProjectId` already exists --
 *   no `overwrite` option passed here).
 */
export const request_renameApp = respondWithJSON(async (request) => {
  const { projectId, newProjectId } = request.body
  await renameApp(projectId, newProjectId)
  return await getProjectList(projectId)
})

/** Remove (permanently delete) project `projectId` -- recursive folder delete via `fileUtils.deletePath()`. */
export const deleteApp = async (projectId: string) => {
  const location = SP.SpellLocation.getProjectLocation(projectId)
  return await fileUtils.deletePath(location.serverPath)
}

/**
 * `DELETE /api/projects/remove/project` -- permanently delete a project.
 * - Client sends body: `{ projectId }` -- NOTE: a `DELETE` request carrying a JSON body, which
 *   `SpellProjectRoot.deleteApp()` on the client relies on; works here because body parsers in
 *   `server/index.ts` are mounted unconditionally, not just for `POST`.
 * - Returns: updated project list for `projectId`'s `projectRoot`.
 * - Failure: 500 if `projectId` is invalid.  No confirmation/undo server-side -- deletion is immediate
 *   and permanent; the client's `confirm()` prompt is the only safety net.
 */
export const request_deleteApp = respondWithJSON(async (request) => {
  const { projectId } = request.body
  await deleteApp(projectId)
  return await getProjectList(projectId)
})

////////////////
// ## Project file manipulation
////////////////

/** Create a new project file -- just `saveFile()` under another name, since creating/overwriting are same op. */
export const createFile = async (projectId: string, filePath: string, contents: any) => {
  return await saveFile(projectId, filePath, contents)
}

/**
 * `POST /api/projects/create/file` -- create a new file within an existing project.
 * - Client sends body: `{ projectId, filePath, contents }`.
 * - Returns: updated `ProjectIndexJSON` -- `getIndex()` will pick up new file and `import` it at the end.
 * - Failure: 500 if `projectId`/`filePath` invalid, or on write error.
 * - NOTE: no check that file doesn't already exist -- this silently overwrites (client-side
 *   `SpellProject.createFile()` checks first, but nothing stops another caller skipping that).
 */
export const request_createFile = respondWithJSON(async (request) => {
  const { projectId, filePath, contents } = request.body
  await createFile(projectId, filePath, contents)
  return await getIndex(projectId)
})

/**
 * Rename a project file, keeping its position in `imports` (rewriting its `path` entry in place)
 * rather than letting `getIndex()`'s resync drop-and-re-append it at end.
 */
export const renameFile = async (projectId: string, filePath: string, newFilePath: string) => {
  const location = SP.SpellLocation.getFileLocation(projectId, filePath)
  const newLocation = SP.SpellLocation.getFileLocation(projectId, newFilePath)
  await fileUtils.movePath(location.serverPath, newLocation.serverPath)

  // update `imports` so file order stays the same
  const importsFile = await loadProjectFile(projectId)
  importsFile.imports = importsFile.imports.map((item) => {
    if (item.path === filePath) return { ...item, path: newFilePath }
    return item
  })
  await saveProjectFile(projectId, importsFile)

  return true
}

/**
 * `POST /api/projects/rename/file` -- rename/move a file within a project.
 * - Client sends body: `{ projectId, filePath, newFilePath }`.
 * - Returns: updated `ProjectIndexJSON`.
 * - Failure: 500 if either path is invalid, or if `fse.move()` rejects (e.g. `newFilePath` exists).
 */
export const request_renameFile = respondWithJSON(async (request) => {
  const { projectId, filePath, newFilePath } = request.body
  await renameFile(projectId, filePath, newFilePath)
  return await getIndex(projectId)
})

/** Delete a project file.  Does NOT touch `project.json` directly -- next `getIndex()` resyncs it away. */
export const deleteFile = async (projectId: string, filePath: string) => {
  const location = SP.SpellLocation.getFileLocation(projectId, filePath)
  return await fileUtils.deletePath(location.serverPath)
}

/**
 * `DELETE /api/projects/remove/file` -- delete a file from a project.
 * - Client sends body: `{ projectId, filePath }` (see `request_deleteApp` for the `DELETE`-with-body note).
 * - Returns: updated `ProjectIndexJSON`.
 * - Failure: 500 if `projectId`/`filePath` invalid.  No server-side check this isn't the project's
 *   last file -- that guard lives only in client's `SpellProject.deleteFile()`.
 */
export const request_deleteFile = respondWithJSON(async (request) => {
  const { projectId, filePath } = request.body
  await deleteFile(projectId, filePath)
  return await getIndex(projectId)
})

////////////////
// ## Compilation
////////////////

/** Compile standalone `fileContents` (Spell source, not tied to any project) to a JS string. */
export const compileFile = async (fileContents: string) => {
  const compiled = SP.spellParser.compile(fileContents)
  return compiled
}

/**
 * `GET|POST /api/compile/file` -- compile arbitrary Spell source, unrelated to any saved project/file.
 * - Client sends: for `POST`, raw Spell source as body; `GET` ignores body and compiles
 *   `DEFAULT_FILE_CONTENTS` instead (handy for hitting the route from a browser URL bar).
 * - Returns: compiled JS as a string.
 * - Failure: 500 (via `respondWithJSON`) with compiler error + stack trace if source doesn't parse/compile.
 */
export const request_compileFile = respondWithJSON(async (request) => {
  const contents =
    request.method === "GET" //
      ? DEFAULT_FILE_CONTENTS
      : request.body
  return await compileFile(contents)
})

/** Sample Spell source compiled by `GET /api/compile/file` -- exists purely to give that route something to show. */
const DEFAULT_FILE_CONTENTS = `## definition of a Card with nice english aliases for working with it
a card is a thing
## properties of cards
// card ranks
cards have a rank as one of ace, 2, 3, 4, 5, 6, 7, 8, 9, 10, jack, queen or king
// card suits
cards have a suit as one of clubs, diamonds, hearts or spades
`
