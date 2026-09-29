/**
 * `$fetch()` answered from DISK, in-process, for node hosts of `SpellProject` & co. such as the language server.
 * - `LoadableFile.fetch` is how every `SpellProject` / `SpellFile` / `SpellProjectRoot` reaches its `url`.
 * - `installDiskFetch()` swaps `$fetch()` for `diskFetch()`, which resolves the same `/api/projects/...` URLs
 *   with the same `project-utils` functions the express routes call -- see `api.ts` for that route table.
 * - `locationForDiskPath()` maps a file on disk back to a `SpellLocation`,
 *   registering a `@workspace:<folder>` project root for a folder outside the built-in ones.
 * - NOTE: importing this pulls in `project-utils.ts`,
 *   which patches `SpellLocation.serverPath` and turns `SpellLocation.useRegistry` off.
 */
import { existsSync } from "fs"
import { basename, dirname, resolve, sep } from "path"

import { LoadableFile, type $FetchParams } from "~/util"
// Deliberately not in the `~/util` barrel -- see its header.
import { MissingResourceError } from "~/util/ResponseErrors"
import { SP } from "~/languages/spell"

import * as fileUtils from "./file-utils"
import * as projectUtils from "./project-utils"
import { isFileOrFolderNotFoundError } from "./response-utils"

/** URL shapes we answer, in `api.ts` order -- `GET` unless the caller passes `contents`. */
const ROUTES: Array<{ pattern: RegExp; handle: (groups: string[], $params: $FetchParams) => Promise<unknown> }> = [
  { pattern: /^\/api\/projects\/list\/([^/]+)$/, handle: ([domainId]) => projectUtils.getProjectList(domainId!) },
  { pattern: /^\/api\/projects\/index\/([^/]+)$/, handle: ([projectId]) => projectUtils.getIndex(projectId!) },
  {
    pattern: /^\/api\/projects\/file\/([^/]+)(\/.+)$/,
    handle: async ([projectId, filePath], { contents, method = contents != null ? "POST" : "GET" }) => {
      if (method === "GET") {
        const location = SP.SpellLocation.getFileLocation(projectId!, filePath!)
        return fileUtils.loadFile(location.serverPath)
      }
      return projectUtils.saveFile(projectId!, filePath!, contents)
    }
  }
]

/**
 * `$fetch()` look-alike answering `/api/projects/...` URLs from disk.
 * - Same result shapes as over HTTP:  a project list, a project index, a file's text, or `true` for a save.
 * - A project index is already an object, so a `json5` `format` needs no parsing.
 * - A missing file returns `defaultContents` if given, else throws `MissingResourceError`, as a 404 would.
 *   So does a URL we don't answer.
 */
export async function diskFetch<T = any>($params: $FetchParams): Promise<T> {
  const url = decodeURIComponent($params.url.split("?")[0]!)
  for (const { pattern, handle } of ROUTES) {
    const matched = pattern.exec(url)
    if (!matched) continue
    try {
      return (await handle(matched.slice(1), $params)) as T
    } catch (error) {
      if (!isFileOrFolderNotFoundError(error)) throw error
      if ($params.defaultContents !== undefined) return $params.defaultContents as T
      throw new MissingResourceError({ url, message: `Not found on disk: ${url}` })
    }
  }
  throw new MissingResourceError({ url, message: `No disk route for: ${url}` })
}

/** Make every `LoadableFile` load and save through `diskFetch()` from now on. */
export function installDiskFetch() {
  LoadableFile.fetch = diskFetch
}

////////////////
// ## Disk paths => SpellLocations
////////////////

/**
 * `SpellLocation` for the file at absolute `diskPath`, e.g. an editor's open document.
 * - Its project is the nearest enclosing folder holding `project.json`, else the file's own folder.
 * - A project under a known root's folder maps onto that root, e.g. `projects/system/examples` or `projects/user`.
 * - Otherwise the project's PARENT folder becomes a new `@workspace:<folder-name>` root.
 *   SIDE EFFECT: registers that root with `SpellSetup.addProjectRoot()`.
 * - Returns `undefined` if any folder or file name can't be a `SpellLocation` segment,
 *   see `SpellLocation.isValidPathSegment()`.
 */
export function locationForDiskPath(diskPath: string): SP.SpellLocation | undefined {
  diskPath = resolve(diskPath)
  const projectDir = findProjectDir(dirname(diskPath))
  const parentDir = dirname(projectDir)
  const rootPath = rootForFolder(parentDir) ?? addWorkspaceRoot(parentDir)
  if (!rootPath) return undefined

  const projectName = basename(projectDir)
  const filePath = diskPath.slice(projectDir.length).split(sep).join("/")
  if (!SP.SpellLocation.isValidPathSegment(projectName) || !SP.SpellLocation.isValidPath(filePath)) return undefined
  return new SP.SpellLocation(`${rootPath}:${projectName}${filePath}`)
}

/** Nearest folder at or above `folder` holding `project.json`, else `folder` itself. */
function findProjectDir(folder: string): string {
  for (let dir = folder; ; dir = dirname(dir)) {
    if (existsSync(resolve(dir, SP.PROJECT_FILE))) return dir
    if (dirname(dir) === dir) return folder
  }
}

/** Path of the known project root whose projects live in `folder`, if any. */
function rootForFolder(folder: string): SP.ProjectRootPath | undefined {
  const roots = Object.keys(SP.SpellSetup.projectRoots) as SP.ProjectRootPath[]
  return roots.find((root) => projectUtils.serverPathForRoot(root) === folder)
}

/**
 * Register `folder` as a `@workspace:<folder-name>` project root and return its path.
 * - Returns `undefined` if the folder name can't be a path segment.
 * - A different folder with the same name gets `-2`, `-3`... so both can be open at once.
 */
function addWorkspaceRoot(folder: string): SP.ProjectRootPath | undefined {
  const domain = basename(folder)
  if (!SP.SpellLocation.isValidPathSegment(domain)) return undefined
  for (let attempt = 1; ; attempt++) {
    const path: SP.ProjectRootPath = `@workspace:${attempt === 1 ? domain : `${domain}-${attempt}`}`
    const spec = SP.SpellSetup.addProjectRoot({
      path,
      owner: "@workspace",
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
