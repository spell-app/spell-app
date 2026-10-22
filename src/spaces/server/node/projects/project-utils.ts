/**
 * Spell's projects ON DISK:  where each is, its list, its index, and its files' create, copy, rename, delete and save.
 * - The `request_XXX` version can be passed directly to a `SRV.Router` route (Express-shaped):  `routes/api.ts`.
 * - Each change to a file goes through the page server's file operations (`SRV.FileOperations`), in-process:
 *   under the file lock, written all at once.
 * - It was spell's (`spell-lang/spell/node/project-utils`), until epic `people-and-orgs` P15.
 * - NOTE: loads spaces' barrel, so spell's project groups are registered (`SPACES.PROJECT_GROUPS`).
 */
import { existsSync } from "fs"
import { isAbsolute, relative, resolve, sep } from "path"

import type { SRV } from "spell-kit/server"
import { json5Edited } from "spell-app/spaces/server/node/storage/json5"
import environment from "spell-app/spaces/server/node/environment"

import { SP } from "spell-lang/spell"
import { projectFileFor } from "spell-lang/spell/node/projectFile"
import { SPACES } from "spell-app/spaces"

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
 * The real, server-only `serverPath` getter for a `SP.SpellLocation`:  where it is on disk, for this install.
 * - Client-side, `SpellLocation.serverPath` just throws:  this monkey-patches in the implementation.
 * - SECURITY: this is the ONLY place a client-supplied path turns into a real on-disk path.
 *   - It relies entirely on `SpellLocation`'s own constructor having already validated its segments,
 *     `owner` / `domain` / `projectName` / `filePath`, before we ever get here.
 *   - That's `SpellLocation.isValidPathSegment()`:  it blocks `.` / `..` segments, and anything outside `[\w\d-$. ]`.
 *   - Every `request_*` handler below reaches this through a fresh `SpellLocation`, built from request params/body:
 *     `SP.SpellLocation.getFileLocation()`, `getProjectLocation()` or `getProjectRoot()`.
 *     So validation always re-runs server-side, even though the client validates too.
 * - `fileUtils.normalizePath()` also collapses any stray `.`/`..`/`//` that validation missed,
 *   as defense in depth.
 * - A file spell BUILDS for its project, e.g. `Solitaire.spell.js`, is in the project's build folder,
 *   not beside its source:  see `isBuiltFile()` and `buildFolderFor()`.
 *   So every reader asks for it by project and name, and this decides where it is on disk.
 */
Object.defineProperty(SP.SpellLocation.prototype, "serverPath", {
  get(this: SP.SpellLocation) {
    const projectFolder = fileUtils.normalizePath(
      ...[serverPathForRoot(this.projectRoot), this.projectName].filter((segment): segment is string => !!segment)
    )
    const path = [isBuiltFile(this) ? buildFolderFor(projectFolder) : projectFolder]
    if (this.filePath) path.push(...this.filePath.split("/"))
    const serverPath = fileUtils.normalizePath(...path.filter(Boolean))
    console.warn(`Server path for path '${this.path}' => '${serverPath}'`)
    return serverPath
  }
})

/**
 * Folder on disk holding project root `rootPath`'s projects, one sub-folder each.
 * - A root added at runtime says where with `spec.serverPath`.
 * - One of spaces' groups (`SP.SpellUrls.folderFor()`):
 *   its address's folder, under the folder `environment` names for its base.
 *   - `@spell/examples` => `spaces/@spell/examples`
 *   - `owen@spell` => `<spell-spaces>/@spell/owen@`
 * - Throws if `rootPath` isn't a known root, or its place has no folder.
 */
export function serverPathForRoot(rootPath: SP.ProjectRootPath): string {
  const spec = SP.SpellSetup.projectSpectForRootPath(rootPath)
  if (spec.serverPath) return spec.serverPath
  return folderForPlace(spec.path)
}

/**
 * Folder on disk of `place`, e.g. `@spell/examples/drawable-solitaire` => `spaces/@spell/examples/drawable-solitaire`.
 * - Throws if `place` has no folder of its own, e.g. `@local/my-folder`.
 */
export function folderForPlace(place: string): string {
  const folder = SP.SpellUrls.folderFor(place)
  if (!folder) throw new TypeError(`folderForPlace('${place}'):  no folder for this place`)
  return resolve(environment.spaceFolders[folder.base], ...folder.path.split("/"))
}

/**
 * Ends of the names of the files spell BUILDS for a project, which go in its build folder (`buildFolderFor()`):
 * only `<Project>` and one of these, at the top of the project, e.g. `Solitaire.spell.js`.
 * - What's committed stays beside the source, e.g. `Solitaire.declarations.json5`, `Solitaire.en.js`,
 *   `Solitaire.py.en.json5`, `Solitaire.lib.ts`, `Solitaire.app.py`.
 */
const BUILT_SUFFIXES = [
  SP.COMPILED_JS_SUFFIX, // `Solitaire.spell.js`
  SP.COMPILED_TSX_SUFFIX, // `Solitaire.spell.tsx`
  SP.COMPILED_PY_SUFFIX, // `Solitaire.spell.py`
  SP.ELEMENTS_JS_SUFFIX, // `Solitaire.elements.spell.js`, a Python program's page file
  SP.SCOPES_JS_SUFFIX // `Solitaire.scopes.js`, its scope pack
]

/**
 * `BUILT_SUFFIXES`' names before epic `people-and-orgs` P11, e.g. `Solitaire.compiled.js`.
 * - A copy left in someone's checkout must never become one of its project's files:  see `GENERATED_SUFFIXES`.
 */
const OLD_BUILT_SUFFIXES = [".compiled.js", ".compiled.tsx", ".compiled.py", ".elements.js"]

/** Is `location` a file spell builds for its project, e.g. `Solitaire.spell.js`?  See `BUILT_SUFFIXES`. */
export function isBuiltFile(location: SP.SpellLocation): boolean {
  const { projectName, folder, file } = location
  if (!projectName || folder !== "/") return false
  return BUILT_SUFFIXES.some((suffix) => file === `${projectName}${suffix}`)
}

/**
 * Folder on disk for what spell builds for the project in folder `projectFolder`, e.g. its `Solitaire.spell.js`:
 * its path MIRRORED under `build/` at the repo root (epic `people-and-orgs` P11).
 * - The frozen test projects (the `tests` space folder, spell-lang's `tests/spaces/`):  under `build/spaces/`
 *   - `<spell-lang>/tests/spaces/@spell/test/fizzbuzz` => `build/spaces/@spell/test/fizzbuzz`
 * - Under the repo (its packages, its `tests/`):  the same path under `build/`
 *   - `spaces/@spell/examples/drawable-solitaire` => `build/spaces/@spell/examples/drawable-solitaire`
 * - Under spell-spaces:  under `build/spell-spaces/`, so each checkout builds its own
 *   - `<spell-spaces>/@spell/owen@/errors` => `build/spell-spaces/@spell/owen@/errors`
 * - A project anywhere else -- a temporary `@local/<folder>` group, a VS Code workspace elsewhere:
 *   `projectFolder` itself, beside its source, as before `build/`.
 *   - NEVER a `build/` inside its root's folder:  that would list as one of its projects.
 * - `folders`:  where the packages, the test projects, spell.spaces and `build/` are.
 *   - `environment`'s by default;  tests pass their own.
 */
export function buildFolderFor(projectFolder: string, folders: BuildFolders = environment): string {
  const mirrors: Array<[string | undefined, string]> = [
    [folders.testsDir, resolve(folders.buildDir, "spaces")],
    [folders.repoDir && resolve(folders.repoDir, "tests"), folders.buildDir],
    [folders.packagesDir, folders.buildDir],
    [folders.spellSpacesDir, resolve(folders.buildDir, "spell-spaces")]
  ]
  for (const [from, to] of mirrors) {
    const inside = from ? relative(from, projectFolder) : ""
    const isOutside = !inside || isAbsolute(inside) || inside === ".." || inside.startsWith(`..${sep}`)
    if (!isOutside) return resolve(to, inside)
  }
  return projectFolder
}

/**
 * Where `buildFolderFor()` mirrors from, and to.
 * - `packagesDir`, `buildDir`:  where the repo's packages are (its root, epic `repo-split` P8) and its `build/`
 * - `repoDir`:  the checkout, whose `tests/` mirror too
 * - `testsDir`:  the `tests` space folder, the frozen test projects' (spell-lang's `tests/spaces/`):  under `build/spaces/`
 * - `spellSpacesDir`:  spell-spaces, mirrored under `build/spell-spaces/`
 */
export type BuildFolders = {
  packagesDir: string
  buildDir: string
  repoDir?: string
  testsDir?: string
  spellSpacesDir?: string
}

/**
 * Where project `projectId`'s built files go, inside the checkout's build folder:
 * its index's `buildFolder`, `/`-separated.
 * - e.g. `spaces/@spell/examples/drawable-solitaire`, for `build/spaces/@spell/examples/drawable-solitaire`
 * - No `../` (decision J33):  a Python web app names it so, and `spell_quart.built_folder()` finds the checkout's.
 * - `undefined` for a project whose built files sit beside its source (`buildFolderFor()`).
 */
export function buildFolderInBuild(projectId: string): string | undefined {
  const projectFolder = SP.SpellLocation.getProjectLocation(projectId).serverPath
  const buildFolder = buildFolderFor(projectFolder)
  if (buildFolder === projectFolder) return undefined
  return relative(environment.buildDir, buildFolder).split(sep).join("/")
}

/** Default file created for a brand-new project, or when `getIndex()` finds a project with zero files. */
const DEFAULT_FILE = {
  filePath: "/Untitled.spell",
  contents: "// New file"
} as const

/**
 * Return list of client projects for `domainId` (a `projectRoot` path like `owen@spell`) as JSON blob.
 * - Format: `[ "<project-path>"... ]`, e.g. `["owen@spell/myProject", ...]`.
 * - Spaces' own folders (`SPACES.isSpaceName()`, e.g. `__members/`) are never projects.
 * - Lists (non-empty) subfolders of `domain`'s `serverPath` as project names:
 *   a "project" is just a folder on disk.
 * - A root whose folder doesn't exist yet has no projects:  `[]`, e.g. `@spell/guides` before its first guide.
 *   Creating a project makes the folder.
 */
export const getProjectList = async (domainId: string): Promise<SP.ProjectList> => {
  const domain = SP.SpellLocation.getProjectRoot(domainId)
  if (!(await fileUtils.pathExists(domain.serverPath))) return []
  const options = { includeFolders: true, includeFiles: false, namesOnly: true, ignoreEmptyFolders: true }
  const projectNames = (await fileUtils.getFolderContents(domain.serverPath, options)).filter(
    (name) => !SPACES.isSpaceName(name) && SP.SpellLocation.isValidPathSegment(name)
  )
  return Promise.all(
    projectNames.map(async (projectName) => {
      const path = `${domain.projectRoot}/${projectName}`
      const { title } = await loadProjectFile(path).catch(() => ({ title: undefined }))
      return title ? { path, title } : { path }
    })
  )
}

/**
 * `GET /api/projects/list/<group>` -- list projects in a group, e.g. `/api/projects/list/@spell/examples`.
 * - Returns: `SP.ProjectList`, each project's address and its title if its file has one:
 *   `[{ path: "@spell/examples/todos-form-based", title: "Todos - Form Based" }, { path: "@spell/examples/calculator" }]`.
 * - Failure: 500 (via `respondWithJSON`) if the place isn't a known group's (`SP.SpellUrls.projectIdFor()`).
 */
export const request_getProjectList = respondWithJSON(async (request) => {
  return await getProjectList(SP.SpellUrls.projectIdFor(tailOf(request, SP.SpellUrls.LIST)))
})

////////////////
// ## Project index
////////////////

/**
 * Ends of the names of files spell WRITES, which are never one of a project's own files.
 * - Listed, `getIndex()` would make a `.js` one an import of the project, and parse the rest as spell.
 * - Its words files, e.g. `Solitaire.en.js`, are left out by `SP.SpellWords.isWordsFile()`.
 * - The old names are here too (`OLD_BUILT_SUFFIXES`).
 */
const GENERATED_SUFFIXES = [
  ...BUILT_SUFFIXES, // `Solitaire.spell.js`, `.spell.tsx`, `.spell.py`, `.elements.spell.js`, `.scopes.js`
  SP.SNAPSHOT_JS_SUFFIX, // `Solitaire.snapshot.js`, a test fixture's snapshot of its compiled output
  ...OLD_BUILT_SUFFIXES
]

/**
 * Given a file `name`, return `true` if we should add it to the manifest.
 * - RENAME: shares its extension list with `isPreloadFile()` below, kept a separate function so they CAN diverge.
 *   They have:  this one also leaves out compiled output, snapshots, scope packs, page files and words files.
 * - Leaves out spaces' own names, by the list spaces keeps (`SPACES.isSpaceName()`, decision J52):
 *   `__init__.js` or `__helpers__.spell` still list.
 * - Lists property editor pages (`SP.EDITOR_PAGE_SUFFIX`, `Card.editor.html`):  the editor opens them as text.
 */
const manifestExtensions = [".spell", ".css", ".js", ".jsx", SP.EDITOR_PAGE_SUFFIX]
export function isManifestFile(name: string, projectName = "") {
  if (SPACES.isSpaceName(name)) return false
  if (GENERATED_SUFFIXES.some((suffix) => name.endsWith(suffix))) return false
  if (SP.SpellWords.isWordsFile(name, projectName)) return false
  return manifestExtensions.some((extension) => name.endsWith(extension))
}

/** Given a file `name`, return `true` if we should preload it (fetch `contents` eagerly in `getIndex()`). */
function isPreloadFile(name: string) {
  return manifestExtensions.some((extension) => name.endsWith(extension))
}

/**
 * Path on disk of a project's file:  the one it has, `__project.json5` or an old `project.json`.
 * - Else where `__project.json5` would be (`projectFileFor()`).
 */
export function projectFilePath(projectId: string): string {
  return projectFileFor(SP.SpellLocation.getProjectLocation(projectId).serverPath)
}

/** Load a project's file (`projectFilePath()`), as JSON5;  `{ imports: [] }` if it has none, or no imports. */
export async function loadProjectFile(projectId: string): Promise<ProjectFileJSON> {
  const existing: Partial<ProjectFileJSON> | null = await fileUtils.loadJSONFile(projectFilePath(projectId), "OPTIONAL")
  return { ...existing, imports: existing?.imports ?? [] }
}

/**
 * Save a project's file, as `__project.json5`, its comments kept (`editJSON5File()`, decision T1).
 * - Pass what `loadProjectFile()` gave you, changed:  a key `contents` leaves out is removed.
 * - SIDE EFFECT:  an old `project.json` is written as `__project.json5`, and removed.
 */
export async function saveProjectFile(projectId: string, contents: ProjectFileJSON): Promise<boolean> {
  const existing = projectFilePath(projectId)
  const file = SP.SpellLocation.getFileLocation(projectId, SP.PROJECT_FILE).serverPath
  const source = (await fileUtils.loadFile(existing, fileUtils.FORMAT.TEXT, "OPTIONAL")) ?? ""
  const saved = await fileUtils.saveTextFile(file, json5Edited(source, contents))
  if (existing !== file) await fileUtils.deletePath(existing)
  return saved
}

/**
 * Return `index` for a project as a JSON blob -- see `ProjectIndexJSON`.
 * - `manifest` portion always reflects current state of file system.
 * - `imports` portion is synced with `manifest` (missing files dropped, new files appended as `active`).
 *   - SIDE EFFECT:  saved to disk, in the project's file (`saveProjectFile()`), if anything changed.
 * - HACKY: if project has zero manifest-worthy files, creates `DEFAULT_FILE` so there's always at least one.
 */
export const getIndex = async (projectId: string): Promise<ProjectIndexJSON> => {
  const location = SP.SpellLocation.getProjectLocation(projectId)

  // Get non-hidden files in project which the front-end knows how to deal with
  const options = { includeFolders: false, ignoreHidden: true, namesOnly: true }
  let fileNames = (await fileUtils.getFolderContents(location.serverPath, options)) //
    .filter((name) => isManifestFile(name, location.projectName))

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
    if (SP.SpellLocation.isAddress(path)) return true

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
  const { title, version, exports, targets, listsStartAt } = importsFile
  const buildFolder = buildFolderInBuild(projectId)
  return { imports: importsFile.imports, manifest, title, version, exports, targets, listsStartAt, buildFolder }
}

/**
 * `GET /api/projects/index/<project>` -- fetch (and resync) a project's index.
 * - e.g. `/api/projects/index/@spell/examples/drawable-solitaire`
 * - Returns: `ProjectIndexJSON`.
 * - Failure: 500 if the place isn't a project's (`SP.SpellUrls.projectIdFor()`).
 */
export const request_getIndex = respondWithJSON(async (request) => {
  return await getIndex(SP.SpellUrls.projectIdFor(tailOf(request, SP.SpellUrls.INDEX)))
})

/**
 * The still-encoded rest of `request`'s path after `prefix`, e.g. `@spell/examples` for `/api/projects/list/...`.
 * - From the path AS IT ARRIVED (`originalUrl`):
 *   a route's params are decoded whole, and a place is decoded part by part (`SP.SpellUrls`, rule 4).
 */
function tailOf(request: Request, prefix: string): string {
  const path = request.originalUrl.split(/[?#]/)[0]!
  const at = path.indexOf(prefix)
  return at < 0 ? "" : path.slice(at + prefix.length)
}

////////////////
// ## Get/save project files
////////////////

/**
 * The file a file's URL names, as a `SpellLocation`.
 * - e.g. `/spaces/@spell/examples/drawable-solitaire/Card.spell` or `/api/projects/file/<project>/<file>`
 * - Split by its group and project BEFORE any path is made (`SP.SpellUrls.fileForUrl()`),
 *   then checked part by part (`new SP.SpellLocation()`).
 * - throws `TypeError` if it names no project's file
 */
export function locationForUrl(url: string): SP.SpellLocation {
  return SP.SpellLocation.getFileLocation(SP.SpellUrls.fileForUrl(url).path)
}

/**
 * Path on disk of file `serverPath`, or of its OLD name when it's a `.json5` file not there yet
 * (epic `people-and-orgs` P12).
 * - `Errors.declarations.json5` is read from an `Errors.declarations.json` that a compile before the rename left,
 *   until the project compiles again.
 */
export function fileOrOldName(serverPath: string): string {
  if (!serverPath.endsWith(".json5") || existsSync(serverPath)) return serverPath
  const old = serverPath.slice(0, -1)
  return existsSync(old) ? old : serverPath
}

/**
 * `GET /spaces/<project>/<file>` -- one project file, as it is on disk, e.g. `/spaces/@spell/examples/drawable-solitaire/Card.spell`.
 * - A file spell BUILDS (`Solitaire.spell.js`, `.scopes.js` ...) is served from the project's build folder
 *   (`serverPath`):  its URL sits beside its source's.
 * - Returns:  raw file body via `SRV.Reply.sendFile()`, `{ dotfiles: "allow" }`, so dotfiles can be fetched too.
 *   - Its mime type is set from its extension, `.js` as javascript:
 *     so a runner imports a compiled project from here, and `<spell-app>` loads its scope pack.
 * - Failure:
 *   - 404 (via `responseUtils.sendFile()`) if file not found
 *   - 400 if the URL names no project's file (no file after the project, an unknown group, a bad part)
 * - NOTE: deliberately NOT wrapped in `respondWithJSON`:
 *   that would send a JSON body on top of the file we already streamed.
 *   We catch by hand instead, so a rejection can't go unhandled and hang the client.
 */
export const request_getFile = async (request: Request, response: Response) => {
  let location: SP.SpellLocation
  try {
    location = locationForUrl(request.originalUrl)
  } catch (error) {
    return responseUtils.sendError(response, 400, error as Error)
  }
  try {
    await responseUtils.sendFile(response, fileOrOldName(location.serverPath), { dotfiles: "allow" })
  } catch (error) {
    // Can't send an error body once the file has started streaming -- the client sees a truncated response.
    if (response.headersSent) return
    responseUtils.sendError(response, 500, error as Error)
  }
}

/**
 * Save a file in a project, creating intervening folders as needed (see `fileUtils.saveFile()`).
 * - NOTE: `filePath` CAN include folder segments:
 *   `SpellLocation.getFileLocation()` and `fileUtils.saveFile()` both handle it.
 * - SIDE EFFECT: overwrites file wholesale, all at once, under the file lock:  the last save wins.
 * - TODO: format according to extension!!!
 */
export const saveFile = async (projectId: string, filePath: string, contents: any) => {
  const location = SP.SpellLocation.getFileLocation(projectId, filePath)
  return await fileUtils.saveFile(location.serverPath, contents)
}

/**
 * `POST /api/projects/file/<project>/<file>` -- save/overwrite one project file.
 * - e.g. `/api/projects/file/owen@spell/errors/1.spell`;  reading it is `GET /spaces/<project>/<file>`.
 * - Client sends: raw body as file contents.
 *   Text or JSON per `Content-Type`:  see the body parsing in `routes/appRoutes.ts`.
 * - Returns: `true` on success.
 * - Failure: 500 (via `respondWithJSON`) on invalid path or write error.
 */
export const request_saveFile = respondWithJSON(async (request) => {
  const location = locationForUrl(request.originalUrl)
  return await saveFile(location.projectId, location.filePath!, request.body)
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
 * - Client sends body: `{ projectId, title?, filePath?, contents? }`.
 *   - `projectId`:  the new project's full path, e.g. `owen@spell/my-project`
 *   - `title`:  its title, when its name can't say it, `My Project!` -- see `setProjectTitle()`
 *   - `filePath` / `contents`:  default to `DEFAULT_FILE`
 * - Returns: updated project list (see `getProjectList()`) for `projectId`'s `projectRoot`.
 * - Failure: 500 if `projectId` is invalid, or on write error.
 */
export const request_createProject = respondWithJSON(async (request) => {
  const { projectId, title, filePath, contents } = request.body
  await createProject(projectId, filePath, contents)
  await setProjectTitle(projectId, title)
  return await getProjectList(projectId)
})

/**
 * Duplicate project `projectId` as `newProjectId` -- recursive folder copy via `fileUtils.copyPath()`.
 * - Its build folder is NOT copied, nor what spell wrote for it beside its source:
 *   all named for the old project, e.g. `Old.spell.js`, `Old.en.js`.
 * - The copy's first compile writes its own.  See `forgetBuilt()`.
 */
export const duplicateApp = async (projectId: string, newProjectId: string) => {
  const location = SP.SpellLocation.getProjectLocation(projectId)
  const newLocation = SP.SpellLocation.getProjectLocation(newProjectId)
  await fileUtils.copyPath(location.serverPath, newLocation.serverPath)
  await forgetBuilt(location, newLocation)
  return true
}

/**
 * `POST /api/projects/duplicate/project` -- duplicate an existing project.
 * - Client sends body: `{ projectId, newProjectId, title? }`:  `title` the copy's, see `setProjectTitle()`.
 * - Returns: updated project list for `projectId`'s `projectRoot`.
 * - Failure: 500 if either id is invalid, or if `fse.copy()` rejects (e.g. `newProjectId` already exists).
 */
export const request_duplicateApp = respondWithJSON(async (request) => {
  const { projectId, newProjectId, title } = request.body
  await duplicateApp(projectId, newProjectId)
  await setProjectTitle(newProjectId, title)
  return await getProjectList(projectId)
})

/**
 * Rename project `projectId` to `newProjectId` -- folder move via `fileUtils.movePath()`.
 * - Its build folder is deleted, not moved, as is what spell wrote for it beside its source:
 *   all named for the old project, e.g. `Old.spell.js`, `Old.en.js`.
 * - The next compile writes the new project's.  See `forgetBuilt()`.
 */
export const renameApp = async (projectId: string, newProjectId: string) => {
  const location = SP.SpellLocation.getProjectLocation(projectId)
  const newLocation = SP.SpellLocation.getProjectLocation(newProjectId)
  await fileUtils.movePath(location.serverPath, newLocation.serverPath)
  await clearBuildFolder(location.serverPath)
  await forgetBuilt(location, newLocation)
  return true
}

/**
 * `POST /api/projects/rename/project` -- rename an existing project.
 * - Client sends body: `{ projectId, newProjectId, title? }`:  `title` its new one, see `setProjectTitle()`.
 * - Returns: updated project list for `projectId`'s `projectRoot`.
 * - Failure: 500 if either id is invalid, or if `fse.move()` rejects,
 *   e.g. `newProjectId` already exists (no `overwrite` option passed here).
 */
export const request_renameApp = respondWithJSON(async (request) => {
  const { projectId, newProjectId, title } = request.body
  await renameApp(projectId, newProjectId)
  await setProjectTitle(newProjectId, title)
  return await getProjectList(projectId)
})

/**
 * SIDE EFFECT:  project `projectId`'s file says `title` (decision Q45), its comments kept.
 * - text:  its title, e.g. `Todos - Form Based`
 * - `null`:  none, its title made from its name
 * - `undefined`:  left as it is
 */
export async function setProjectTitle(projectId: string, title: string | null | undefined): Promise<void> {
  if (title === undefined) return
  const { title: old, ...rest } = await loadProjectFile(projectId)
  if ((old ?? null) === title) return
  await saveProjectFile(projectId, title === null ? rest : { title, ...rest })
}

/**
 * SIDE EFFECT:  project `projectId`'s file says `settings`, its comments and its `imports` kept
 * (Project Settings, epic `property-editor` P5).
 * - Only the settings a person edits (`SPACES.PROJECT_SETTINGS`), never its `imports`.
 * - A setting that's `null`, `""` or `[]` is removed:  its default applies.
 * - A setting `settings` doesn't name is left as it is.
 * - Returns the settings the file says now.
 */
export async function saveProjectSettings(
  projectId: string,
  settings: SPACES.ProjectSettings
): Promise<SPACES.ProjectSettings> {
  const file: Record<string, unknown> = { ...(await loadProjectFile(projectId)) }
  for (const key of SPACES.PROJECT_SETTINGS) {
    if (!(key in settings)) continue
    const value = settings[key]
    const isEmpty = value === null || value === "" || (Array.isArray(value) && !value.length)
    if (isEmpty) delete file[key]
    else file[key] = value
  }
  await saveProjectFile(projectId, file as ProjectFileJSON)
  return Object.fromEntries(SPACES.PROJECT_SETTINGS.filter((key) => key in file).map((key) => [key, file[key]]))
}

/**
 * `POST /api/projects/settings/project` -- save a project's settings into its project file.
 * - Client sends body:  `{ projectId, settings }`, see `saveProjectSettings()`.
 * - Returns:  the settings its file says now.
 * - Failure:  500 if `projectId` is invalid, or on write error.
 */
export const request_saveProjectSettings = respondWithJSON(async (request) => {
  const { projectId, settings } = request.body
  return await saveProjectSettings(projectId, settings ?? {})
})

/**
 * Remove (permanently delete) project `projectId` -- recursive folder delete via `fileUtils.deletePath()`.
 * - Its build folder too.
 */
export const deleteApp = async (projectId: string) => {
  const location = SP.SpellLocation.getProjectLocation(projectId)
  await fileUtils.deletePath(location.serverPath)
  await clearBuildFolder(location.serverPath)
  return true
}

/**
 * SIDE EFFECT:  delete the build folder of the project in `projectFolder` (`buildFolderFor()`), if it has one.
 * - Does nothing for a project whose built files sit beside its source:  they go with its folder.
 */
async function clearBuildFolder(projectFolder: string): Promise<void> {
  const buildFolder = buildFolderFor(projectFolder)
  if (buildFolder !== projectFolder) await fileUtils.deletePath(buildFolder)
}

/**
 * SIDE EFFECT:  project `location` was just copied or moved to `newLocation`:
 * delete what spell wrote for the old one there, so it never serves output built for another project,
 * or for an older one of its name.
 * - `newLocation`'s build folder, if it has one, e.g. a deleted project of that name's.
 * - When the name changed, the old name's generated files beside its source (`isGeneratedFileOf()`),
 *   e.g. `Old.declarations.json5`;  `Old.en.js` would list as one of its javascript files.
 *   - NOT its `Old.lib.ts` or `Old.app.py`:  code others may import or have edited.  Compiling writes new ones.
 */
async function forgetBuilt(location: SP.SpellLocation, newLocation: SP.SpellLocation): Promise<void> {
  await clearBuildFolder(newLocation.serverPath)
  const { projectName } = location
  if (!projectName || projectName === newLocation.projectName) return
  const names = await fileUtils.getFolderContents(newLocation.serverPath, { namesOnly: true })
  const generated = names.filter((name) => isGeneratedFileOf(name, projectName))
  await Promise.all(generated.map((name) => fileUtils.deletePath(resolve(newLocation.serverPath, name))))
}

/**
 * Is `name` a file spell writes for project `projectName`, and writes again on each compile?
 * - Its compiled output, under any name it has had, e.g. `Solitaire.spell.js`, `Solitaire.compiled.js`.
 *   NOT a fixture's snapshot, `Solitaire.snapshot.js`:  a test's expected output.
 * - Its declarations, `Solitaire.declarations.json5`.
 * - Its words, in any language (`Solitaire.en.js`), and each target's own (`Solitaire.py.en.json5`).
 * - The `.json` names those two had before epic `people-and-orgs` P12, too.
 */
function isGeneratedFileOf(name: string, projectName: string): boolean {
  if (SP.SpellWords.isWordsFile(name, projectName)) return true
  const targetWords = Object.values(SP.TARGETS).flatMap((target) => target.wordsSuffix ?? [])
  const json5 = [SP.DECLARATIONS_JSON_SUFFIX, ...targetWords]
  const oldNames = json5.filter((suffix) => suffix.endsWith(".json5")).map((suffix) => suffix.slice(0, -1))
  const suffixes = [...BUILT_SUFFIXES, ...OLD_BUILT_SUFFIXES, ...json5, ...oldNames]
  return suffixes.some((suffix) => name === `${projectName}${suffix}`)
}

/**
 * `DELETE /api/projects/remove/project` -- permanently delete a project.
 * - Client sends body: `{ projectId }`.
 *   - NOTE: a `DELETE` request carrying a JSON body, which `SpellProjectRoot.deleteApp()` on the client relies on.
 *   - It works because the routes' body parser (`SRV.parseBodies()`, in `cli.ts` and `appRoutes.ts`)
 *     reads a body for every verb, not just `POST`.
 * - Returns: updated project list for `projectId`'s `projectRoot`.
 * - Failure: 500 if `projectId` is invalid.
 * - No confirmation/undo server-side:  deletion is immediate and permanent.
 *   The client's `confirm()` prompt is the only safety net.
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
 * - NOTE: no check that file doesn't already exist:  this silently overwrites.
 *   Client-side `SPACES.ProjectFiles.create()` checks first, but nothing stops another caller skipping that.
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

/** Delete a project file.  Does NOT touch the project's file directly -- next `getIndex()` resyncs it away. */
export const deleteFile = async (projectId: string, filePath: string) => {
  const location = SP.SpellLocation.getFileLocation(projectId, filePath)
  return await fileUtils.deletePath(location.serverPath)
}

/**
 * `DELETE /api/projects/remove/file` -- delete a file from a project.
 * - Client sends body: `{ projectId, filePath }` (see `request_deleteApp` for the `DELETE`-with-body note).
 * - Returns: updated `ProjectIndexJSON`.
 * - Failure: 500 if `projectId`/`filePath` invalid.
 * - No server-side check this isn't the project's last file:
 *   that guard lives only in client's `SPACES.ProjectFiles.delete()`.
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
 * - Client sends: for `POST`, raw Spell source as body.
 *   `GET` ignores body and compiles `DEFAULT_FILE_CONTENTS` instead:
 *   handy for hitting the route from a browser URL bar.
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
