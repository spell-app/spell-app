/**
 * Turns a command-line argument into what it names:  a project, a `.spell` file, or a whole project root.
 * - Spell paths:
 *   - `@library/cards`, `@test/Solitaire/Card.spell`:  a root's `alias`, see `SpellSetup.expandAlias()`
 *   - `@examples/Solitaire`:  a root's domain
 *   - `@system:library:cards`:  full id
 *   - `@library`, `@system:examples`, `@user`, `@system`:  a bare root -- or several, for an owner with more than one
 * - `@workspace` ~== `.`, and `@workspace/Foo.spell` ~== `./Foo.spell`.
 * - Anything else is a path on disk, from the current folder:
 *   - a `.spell` file, or a project's `project.json`
 *   - a folder:  the project it's in, or a known root's folder, e.g. `projects/system/examples`
 * - NEVER a folder that isn't inside a project:  loading it would WRITE a `project.json` there,
 *   see `projectUtils.getIndex()`.
 * - Throws `CLI.CliError` for anything it can't place.
 */
import { existsSync, statSync } from "fs"
import { basename, dirname, extname, resolve } from "path"

import { SP } from "$/spell"
import { locationForDiskPath } from "$/spell/node/disk-fetch"
import * as projectUtils from "$/spell/node/project-utils"
import { CLI } from "$/cli"

/** Stands for the current folder:  `@workspace` ~== `.` */
export const WORKSPACE_ARG = "@workspace"

/**
 * What `arg` names, relative to `cwd` if it's a path on disk.
 * - SIDE EFFECT:  a project outside the known roots registers a `@workspace:<folder>` root -- see `locationForDiskPath()`.
 */
export async function resolveProject(arg: string, cwd = process.cwd()): Promise<CLI.CliProject> {
  if (arg === WORKSPACE_ARG) return resolveDiskPath(arg, cwd)
  if (arg.startsWith(`${WORKSPACE_ARG}/`))
    return resolveDiskPath(arg, resolve(cwd, arg.slice(WORKSPACE_ARG.length + 1)))
  if (arg.startsWith("@")) return resolveSpellPath(arg)
  return resolveDiskPath(arg, resolve(cwd, arg))
}

/**
 * Project roots `name` stands for, e.g. `@library` => `[@system:library]`, `@system` => its three roots.
 * - Tries, in order:  a root's full path, its `alias`, `@<domain>`, then `@<owner>`.
 * - Leaves out `@workspace:*` roots:  they're only made as folders turn up.
 */
export function rootsNamed(name: string): SP.ProjectRootSpec[] {
  const roots = Object.values(SP.SpellSetup.projectRoots).filter((spec) => spec.owner !== WORKSPACE_ARG)
  const exact = roots.filter((spec) => spec.path === name || spec.alias === name)
  if (exact.length) return exact
  const byDomain = roots.filter((spec) => `@${spec.domain}` === name)
  if (byDomain.length) return byDomain
  return roots.filter((spec) => spec.owner === name)
}

/** Project roots a person names, in setup order -- not the `@workspace:*` ones made as folders turn up. */
export function knownRoots(): SP.ProjectRootSpec[] {
  return Object.values(SP.SpellSetup.projectRoots).filter((spec) => spec.owner !== WORKSPACE_ARG)
}

/**
 * What to type for root `spec`, as `resolveProject()` reads it:  its `alias`, e.g. `@library`;  else its owner if
 * it's the owner's only root, e.g. `@user`;  else `@<domain>`.
 */
export function rootName(spec: SP.ProjectRootSpec): string {
  if (spec.alias) return spec.alias
  return knownRoots().filter((it) => it.owner === spec.owner).length === 1 ? spec.owner : `@${spec.domain}`
}

/**
 * Ids of the projects in `roots`, e.g. `["@system:library:cards"]`.
 * - Only folders holding a `project.json` -- see the header.
 * - A root whose folder doesn't exist, e.g. `@guides` before any guide is written, has none.
 */
export async function projectIdsIn(roots: SP.ProjectRootSpec[]): Promise<string[]> {
  const present = roots.filter((spec) => existsSync(projectUtils.serverPathForRoot(spec.path)))
  const lists = await Promise.all(present.map((spec) => projectUtils.getProjectList(spec.path)))
  return lists.flat().filter((projectId) => hasManifest(new SP.SpellLocation(projectId).serverPath))
}

////////////////
// ## Spell paths
////////////////

/** `arg` starting with `@`, other than `@workspace`. */
async function resolveSpellPath(arg: string): Promise<CLI.CliProject> {
  const [head, ...rest] = arg.split("/")
  const roots = rootsNamed(head!)
  if (!roots.length) return resolveLocation(arg, arg)
  if (!rest.length) return resolveRoots(arg, roots)
  if (roots.length > 1) {
    const names = roots.map((spec) => spec.alias ?? spec.path).join(", ")
    throw new CLI.CliError(
      `'${head}' is several project roots (${names}) -- name one, e.g. '${roots[0]!.path}:${rest[0]}'`
    )
  }
  return resolveLocation(arg, `${roots[0]!.path}:${rest.join("/")}`)
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
