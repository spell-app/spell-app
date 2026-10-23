/**
 * Spaces' DISK READER:  `$fetch()` answered from disk, in-process, for node hosts of `SpellProject` & co. --
 * the language server, the `spell` command, tests.
 * - `LoadableFile.fetch` is how every `SpellProject` / `SpellFile` / `SpellProjectRoot` reaches its `url`.
 * - `installDiskFetch()` swaps `$fetch()` for `diskFetch()`, which answers the same URLs spell builds:
 *   `/spaces/<project>/<file>`, `/api/projects/...` (`SP.SpellUrls`).
 *   - With the same `project-utils` functions the routes call:  see `routes/api.ts` for that route table.
 * - Spell never sees a path on disk:  in a browser the page server answers these URLs, here this does.
 * - `locationForDiskPath()` maps a file on disk back to a `SpellLocation`,
 *   registering a `@local/<folder>` project group for a folder outside the built-in ones.
 * - NOTE: importing this pulls in `project-utils.ts`,
 *   which patches `SpellLocation.serverPath` and turns `SpellLocation.useRegistry` off.
 */

import { basename, dirname, resolve, sep } from "path"

import { LoadableFile, type $FetchParams } from "spell-kit/util"
// Deliberately not in the `spell-kit/util` barrel -- see its header.
import { MissingResourceError } from "spell-kit/util/spell/ResponseErrors"
import { SP } from "spell-lang/spell"
import { hasProjectFile } from "spell-lang/spell/node/projectFile"

import * as fileUtils from "./file-utils"
import * as projectUtils from "./project-utils"
import { isFileOrFolderNotFoundError } from "./response-utils"

/**
 * URL shapes we answer, as `routes/api.ts` does, by their prefix (`SP.SpellUrls`).
 * - Each is handed the URL as it is, still encoded:
 *   an address is decoded part by part, never as a whole, then split by its group (`SP.SpellUrls`).
 * - `GET` unless the caller passes `contents`.
 */
const ROUTES: Array<{ prefix: string; handle: (url: string, $params: $FetchParams) => Promise<unknown> }> = [
  { prefix: SP.SpellUrls.LIST, handle: (url) => projectUtils.getProjectList(SP.SpellUrls.projectIdFor(url)) },
  {
    prefix: SP.SpellUrls.INDEX,
    // loose spell files opened from disk:  never a project file written into their folder
    handle: (url) => projectUtils.getIndex(SP.SpellUrls.projectIdFor(url), { saving: "if it has one" })
  },
  {
    prefix: SP.SpellUrls.SPACES,
    handle: (url) =>
      fileUtils.loadFile(projectUtils.fileOrOldName(projectUtils.locationForUrl(url).serverPath)) as Promise<string>
  },
  {
    prefix: SP.SpellUrls.SAVE,
    handle: (url, { contents }) => {
      const location = projectUtils.locationForUrl(url)
      return projectUtils.saveFile(location.projectId, location.filePath!, contents)
    }
  }
]

/**
 * `$fetch()` look-alike answering spell's URLs from disk:  `/spaces/...` and `/api/projects/...`.
 * - Same result shapes as over HTTP:  a project list, a project index, a file's text, or `true` for a save.
 * - A project index is already an object, so a `json5` `format` needs no parsing.
 * - A missing file returns `defaultContents` if given, else throws `MissingResourceError`, as a 404 would.
 *   So does a URL we don't answer.
 */
export async function diskFetch<T = any>($params: $FetchParams): Promise<T> {
  const url = $params.url.split(/[?#]/)[0]!
  for (const { prefix, handle } of ROUTES) {
    if (!url.startsWith(prefix)) continue
    try {
      return (await handle(url, $params)) as T
    } catch (error) {
      if (!isFileOrFolderNotFoundError(error)) throw error
      if ($params.defaultContents !== undefined) return $params.defaultContents as T
      throw new MissingResourceError({ url, message: `Not found on disk: ${url}` })
    }
  }
  throw new MissingResourceError({ url, message: `No disk route for: ${url}` })
}

/**
 * Make every `LoadableFile` load and save through `diskFetch()` from now on.
 * - Spell's project groups are registered by then:  `project-utils.ts` loads spaces' barrel (`SPACES.PROJECT_GROUPS`).
 */
export function installDiskFetch() {
  LoadableFile.fetch = diskFetch
}

////////////////
// ## Disk paths => SpellLocations
////////////////

/**
 * `SpellLocation` for the file at absolute `diskPath`, e.g. an editor's open document.
 * - Its project is the nearest enclosing folder holding a project file (`__project.json5`, or an old `project.json`),
 *   else the file's own folder.
 * - A project under a known root's folder maps onto that root:
 *   e.g. `spaces/@spell/examples`, or your space's in spell.spaces.
 * - Otherwise the project's PARENT folder becomes a new `@local/<folder-name>` group.
 *   SIDE EFFECT: registers that root with `SpellSetup.addProjectRoot()`.
 * - Returns `undefined` if any folder or file name can't be a `SpellLocation` segment,
 *   see `SpellLocation.isValidPathSegment()`.
 */
export function locationForDiskPath(diskPath: string): SP.SpellLocation | undefined {
  diskPath = resolve(diskPath)
  const projectDir = findProjectDir(dirname(diskPath))
  const parentDir = dirname(projectDir)
  const rootPath = rootForFolder(parentDir) ?? addLocalRoot(parentDir)
  if (!rootPath) return undefined

  const projectName = basename(projectDir)
  const filePath = diskPath.slice(projectDir.length).split(sep).join("/")
  if (!SP.SpellLocation.isValidPathSegment(projectName) || !SP.SpellLocation.isValidPath(filePath)) return undefined
  return new SP.SpellLocation(SP.SpellLocation.join(`${rootPath}/${projectName}`, filePath))
}

/** Nearest folder at or above `folder` holding a project file (`hasProjectFile()`), else `folder` itself. */
function findProjectDir(folder: string): string {
  for (let dir = folder; ; dir = dirname(dir)) {
    if (hasProjectFile(dir)) return dir
    if (dirname(dir) === dir) return folder
  }
}

/** Path of the known project root whose projects live in `folder`, if any. */
function rootForFolder(folder: string): SP.ProjectRootPath | undefined {
  const roots = Object.keys(SP.SpellSetup.projectRoots) as SP.ProjectRootPath[]
  return roots.find((root) => projectUtils.serverPathForRoot(root) === folder)
}

/**
 * Register `folder` as a `@local/<folder-name>` project group and return its address.
 * - Returns `undefined` if the folder name can't be a path segment.
 * - A different folder with the same name gets `-2`, `-3`... so both can be open at once.
 */
function addLocalRoot(folder: string): SP.ProjectRootPath | undefined {
  const domain = basename(folder)
  if (!SP.SpellLocation.isValidPathSegment(domain)) return undefined
  for (let attempt = 1; ; attempt++) {
    const path: SP.ProjectRootPath = `@local/${attempt === 1 ? domain : `${domain}-${attempt}`}`
    const spec = SP.SpellSetup.addProjectRoot({
      path,
      space: "@local",
      domain,
      title: domain,
      Type: "Project",
      type: "project",
      description: `Projects in ${folder}`,
      icon: "folder",
      serverPath: folder
    })
    if (spec.serverPath === folder) return path
  }
}
