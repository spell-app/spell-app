/**
 * Turns a command-line argument into what it names:  a project, a `.spell` file, or a whole project root.
 * - Spell addresses (`SP.SpellLocation.isAddress()`, epic `people-and-orgs` P4):
 *   - `@spell/library/cards`, `owen@spell/errors`:  a project
 *   - `@spell/test/solitaire/Card.spell`:  a file in one
 *   - `@spell/examples`, `owen@spell`:  a whole group;  `@spell`:  every group in that space
 * - `@workspace` ~== `.`, and `@workspace/Foo.spell` ~== `./Foo.spell`:  the command line's own word, not an
 *   address.
 * - Anything else is a path on disk, from the current folder:
 *   - a `.spell` file, or a project's `project.json`
 *   - a folder:  the project it's in, or a known root's folder, e.g. `packages/spaces/@spell/examples`
 * - NEVER a folder that isn't inside a project:  loading it would WRITE a `project.json` there,
 *   see `projectUtils.getIndex()`.
 * - Throws `CLI.CliError` for anything it can't place.
 */
import { existsSync, statSync } from "fs"
import { basename, dirname, extname, resolve } from "path"

import { SP } from "$/spell"
import { locationForDiskPath } from "$/spaces/server/node/projects/disk-fetch"
import * as projectUtils from "$/spaces/server/node/projects/project-utils"
import { CLI } from "$/cli"

/** Stands for the current folder:  `@workspace` ~== `.` */
export const WORKSPACE_ARG = "@workspace"

/** The space of the groups made at runtime, as folders turn up:  `@local/<folder>`. */
export const LOCAL_SPACE = "@local"

/**
 * What `arg` names, relative to `cwd` if it's a path on disk.
 * - SIDE EFFECT:  a project outside the known groups registers a `@local/<folder>` group -- see
 *   `locationForDiskPath()`.
 */
export async function resolveProject(arg: string, cwd = process.cwd()): Promise<CLI.CliProject> {
  if (arg === WORKSPACE_ARG) return resolveDiskPath(arg, cwd)
  if (arg.startsWith(`${WORKSPACE_ARG}/`))
    return resolveDiskPath(arg, resolve(cwd, arg.slice(WORKSPACE_ARG.length + 1)))
  if (SP.SpellLocation.isAddress(arg)) return resolveSpellPath(arg)
  return resolveDiskPath(arg, resolve(cwd, arg))
}

/**
 * Project groups `name` stands for, e.g. `@spell/library` => that group, `@spell` => every group in that space.
 * - Leaves out the `@local/<folder>` groups:  they're only made as folders turn up.
 */
export function rootsNamed(name: string): SP.ProjectRootSpec[] {
  const roots = knownRoots()
  const exact = roots.filter((spec) => spec.path === name)
  if (exact.length) return exact
  return roots.filter((spec) => spec.space === name)
}

/** Project groups a person names, in setup order -- not the `@local/<folder>` ones made as folders turn up. */
export function knownRoots(): SP.ProjectRootSpec[] {
  return Object.values(SP.SpellSetup.projectRoots).filter((spec) => spec.space !== LOCAL_SPACE)
}

/** What to type for group `spec`, as `resolveProject()` reads it:  its address, e.g. `@spell/library`. */
export function rootName(spec: SP.ProjectRootSpec): string {
  return spec.path
}

/**
 * Ids of the projects in `roots`, e.g. `["@spell/library/cards"]`.
 * - Only folders holding a `project.json` -- see the header.
 * - A root whose folder doesn't exist, e.g. `@spell/guides` before any guide is written, has none.
 */
export async function projectIdsIn(roots: SP.ProjectRootSpec[]): Promise<string[]> {
  const present = roots.filter((spec) => existsSync(projectUtils.serverPathForRoot(spec.path)))
  const lists = await Promise.all(present.map((spec) => projectUtils.getProjectList(spec.path)))
  return lists.flat().filter((projectId) => hasManifest(new SP.SpellLocation(projectId).serverPath))
}

////////////////
// ## Spell paths
////////////////

/** `arg`, an address:  a group or a space, else a project or a file. */
async function resolveSpellPath(arg: string): Promise<CLI.CliProject> {
  const roots = rootsNamed(arg)
  if (roots.length) return resolveRoots(arg, roots)
  return resolveLocation(arg, arg)
}

/** What full spell path `path` names:  a project, or a `.spell` file in one. */
async function resolveLocation(arg: string, path: string): Promise<CLI.CliProject> {
  let location: SP.SpellLocation
  try {
    location = new SP.SpellLocation(path)
  } catch {
    throw new CLI.CliError(`'${arg}' isn't a project, a spell file or a project root -- see \`spell --help\``)
  }
  if (location.isProjectRoot) return resolveRoots(arg, [SP.SpellSetup.projectSpectForRootPath(location.projectRoot)])

  const projectDir = new SP.SpellLocation(location.projectId).serverPath
  if (!hasManifest(projectDir)) throw new CLI.CliError(`No project '${location.projectId}' (looked in ${projectDir})`)
  if (location.isProjectPath) return { kind: "project", arg, project: new SP.SpellProject(location.projectId) }

  if (location.extension !== ".spell") throw new CLI.CliError(`'${arg}' isn't a .spell file`)
  if (!existsSync(location.serverPath)) throw new CLI.CliError(`No file '${arg}' (looked for ${location.serverPath})`)
  return { kind: "file", arg, file: new SP.SpellFile(location.path) }
}

/** A root covering all of `roots`' projects. */
async function resolveRoots(arg: string, roots: SP.ProjectRootSpec[]): Promise<CLI.CliProject> {
  const title = roots.map((spec) => spec.title).join(", ")
  return { kind: "root", arg, title, projectIds: await projectIdsIn(roots) }
}

////////////////
// ## Disk paths
////////////////

/** What `path` on disk names -- `arg`, as typed. */
async function resolveDiskPath(arg: string, path: string): Promise<CLI.CliProject> {
  if (!existsSync(path)) throw new CLI.CliError(`No such file or folder:  ${arg}`)
  const isFolder = statSync(path).isDirectory()
  const isManifest = basename(path) === SP.PROJECT_FILE
  if (!isFolder && !isManifest && extname(path) !== ".spell") {
    throw new CLI.CliError(`'${arg}' isn't a .spell file, a project.json or a folder`)
  }

  if (isFolder) {
    const roots = Object.values(SP.SpellSetup.projectRoots).filter(
      (spec) => projectUtils.serverPathForRoot(spec.path) === path
    )
    if (roots.length) return resolveRoots(arg, roots)
  }

  // `locationForDiskPath()` falls back to a file's own folder, which loading would write a `project.json` into
  const folder = isFolder ? path : dirname(path)
  if (!projectDirAbove(folder)) {
    throw new CLI.CliError(`'${arg}' isn't in a spell project:  no ${SP.PROJECT_FILE} in ${folder} or above it`)
  }
  // it looks for `project.json` from a FILE's folder up, so hand it one in the folder
  const location = locationForDiskPath(isFolder ? resolve(path, SP.PROJECT_FILE) : path)
  if (!location) throw new CLI.CliError(`'${arg}' has a folder or file name spell can't use`)

  const project = new SP.SpellProject(location.projectId)
  if (isFolder || isManifest) return { kind: "project", arg, project }
  return { kind: "file", arg, file: new SP.SpellFile(location.path) }
}

/** Nearest folder at or above `folder` holding a `project.json`, if any. */
export function projectDirAbove(folder: string): string | undefined {
  for (let dir = folder; ; dir = dirname(dir)) {
    if (hasManifest(dir)) return dir
    if (dirname(dir) === dir) return undefined
  }
}

/** Does folder `projectDir` hold a `project.json`? */
function hasManifest(projectDir: string): boolean {
  return existsSync(resolve(projectDir, SP.PROJECT_FILE))
}
