import type * as SP from "./spell.types"
import type { SpellLocation } from "./SpellLocation"
// Import directly:  this file stays as light as `SpellSetup`, so `<spell-app>` can build URLs without the barrel
import { SpellSetup } from "./SpellSetup"

/**
 * Where a project and its files are, by URL and by folder:  the ONE function spell, spaces' routes and spaces' disk
 * reader share (epic `people-and-orgs` P15).
 * - A project's PLACE is its address:  its group's place, then its name, e.g. `@spell/examples/Solitaire`.
 *   - Each project group (`SP.ProjectRootSpec`) says its own place, e.g. `@system:examples` is `@spell/examples`.
 *   - Until the address phase (P4's second half), the project part is today's name, e.g. `Solitaire`.
 * - A file's URL is its place, then TWO slashes, then the file:  `/spaces/@spell/examples/Solitaire//Card.spell`.
 *   - Saving it is a call:  `/api/projects/file/@spell/examples/Solitaire//Card.spell`.
 *   - A project's index:  `/api/projects/index/<place>`;  a group's projects:  `/api/projects/list/<group's place>`.
 * - The four rules for the two slashes (decision J48):
 *   1. split at the FIRST `//` before turning a URL into a path on disk (`fileForUrl()`):
 *      path functions squash `//` to `/`
 *   2. never a relative `../` across the `//`:  every URL here is written whole
 *   3. every URL starts `/spaces/` or `/api/`, never with the place itself (`//x` names another web site)
 *   4. encode each part on its own (`encodePart()`), never the whole place:  `//` would become `%2F%2F`
 * - Its folder (`folderFor()`):  a base folder and a path under it, e.g. `@spell/examples/Solitaire` is
 *   `@spell/examples/Solitaire` under spaces' built-ins.  Which real folder each base is, only spaces knows.
 * - NOTE: imports only `SpellSetup`:  it never sees a path on disk, and never loads the parser.
 */
export const SpellUrls = {
  /** Where a file is READ:  `/spaces/<place>//<file>`. */
  SPACES: "/spaces/",
  /** Where a file is SAVED:  `POST /api/projects/file/<place>//<file>`. */
  SAVE: "/api/projects/file/",
  /** A project's index:  `GET /api/projects/index/<place>`. */
  INDEX: "/api/projects/index/",
  /** A group's projects:  `GET /api/projects/list/<group's place>`. */
  LIST: "/api/projects/list/",
  /** Between a place and a thing in it, in a URL and an address alike. */
  STEP: "//",
  /** The test projects' group:  their folder is under the repo's `tests/`, not spaces' built-ins. */
  TEST_PLACE: "@spell/test",
  /** The org whose own space is the repo's built-ins, `packages/spaces/@spell/`. */
  BUILT_IN_ORG: "spell",

  ////////////////
  // ## URLs
  ////////////////

  /**
   * Place of project `projectId`, e.g. `@system:examples:Solitaire` => `@spell/examples/Solitaire`;
   * a group's own, `@system:examples` => `@spell/examples`.
   * - throws `TypeError` if its group isn't registered (`SpellSetup.addProjectRoot()`)
   */
  placeFor(projectId: string): string {
    const [rootPath, projectName] = splitProjectId(projectId)
    const { place } = SpellSetup.projectSpectForRootPath(rootPath)
    return projectName ? `${place}/${projectName}` : place
  },

  /** URL to READ the file at `path` (e.g. `@system:examples:Solitaire/Card.spell`):  `/spaces/<place>//<file>`. */
  fileUrl(path: string | SpellLocation): string {
    return SpellUrls.SPACES + tailFor(path)
  },

  /** URL to SAVE the file at `path`:  `/api/projects/file/<place>//<file>`. */
  saveUrl(path: string | SpellLocation): string {
    return SpellUrls.SAVE + tailFor(path)
  },

  /** URL of project `projectId`'s index:  `/api/projects/index/<place>`. */
  indexUrl(projectId: string): string {
    return SpellUrls.INDEX + encodePlace(SpellUrls.placeFor(projectId))
  },

  /** URL of group `rootPath`'s project list:  `/api/projects/list/<group's place>`. */
  listUrl(rootPath: string): string {
    return SpellUrls.LIST + encodePlace(SpellUrls.placeFor(rootPath))
  },

  ////////////////
  // ## Back from a URL
  ////////////////

  /**
   * The project and file a file's URL names, from `/spaces/...` or `/api/projects/file/...` (or just its tail,
   * `<place>//<file>`), e.g. `{ projectId: "@system:examples:Solitaire", filePath: "/Card.spell",
   * path: "@system:examples:Solitaire/Card.spell" }`.
   * - Splits at the FIRST `//`, then decodes each part on its own.
   * - throws `TypeError`:  no `//`, a part that won't decode, or a place no group holds
   * - NOTE: says nothing of whether its parts are valid names:  `new SpellLocation(path)` checks that.
   */
  fileForUrl(url: string): { projectId: string; filePath: string; path: string } {
    const tail = tailOf(url, [SpellUrls.SPACES, SpellUrls.SAVE])
    const at = tail.indexOf(SpellUrls.STEP)
    if (at < 0) throw new TypeError(`SpellUrls.fileForUrl('${url}'):  no '//' between the project and the file`)
    const projectId = SpellUrls.projectIdFor(decodeParts(tail.slice(0, at), url))
    const filePath = `/${decodeParts(tail.slice(at + SpellUrls.STEP.length), url)}`
    return { projectId, filePath, path: `${projectId}${filePath}` }
  },

  /**
   * Project id (or group path) of `place`, e.g. `@spell/examples/Solitaire` => `@system:examples:Solitaire`,
   * `@spell/examples` => `@system:examples`.
   * - The group is the one whose place is the LONGEST start of `place`;  one more part, the project's name.
   * - Takes a URL's tail too, still encoded:  `/api/projects/index/<place>` => its project.
   * - throws `TypeError` if no group holds it, or more than one part follows the group's place
   */
  projectIdFor(place: string): string {
    if (/%/.test(place)) place = decodeParts(place, place)
    for (const prefix of [SpellUrls.INDEX, SpellUrls.LIST])
      if (place.startsWith(prefix)) place = place.slice(prefix.length)
    const spec = Object.values(SpellSetup.projectRoots)
      .filter((it) => place === it.place || place.startsWith(`${it.place}/`))
      .sort((a, b) => b.place.length - a.place.length)[0]
    const rest = spec ? place.slice(spec.place.length + 1) : ""
    if (!spec || rest.includes("/")) throw new TypeError(`SpellUrls.projectIdFor('${place}'):  no project group there`)
    return rest ? `${spec.path}:${rest}` : spec.path
  },

  ////////////////
  // ## Folders
  ////////////////

  /**
   * Which folder holds `place`:  a `base` and the `path` under it, `/`-separated.
   * - `@spell/test/FizzBuzz` => `{ base: "tests", path: "@spell/test/FizzBuzz" }`:  the repo's `tests/spaces/`
   * - `@spell/examples/Solitaire` => `{ base: "builtins", path: "@spell/examples/Solitaire" }`:  `packages/spaces/`
   * - `owen@spell/errors` => `{ base: "spaces", path: "@spell/owen@/errors" }`:  spell-spaces, beside the repo;
   *   a person's space is inside their org's, so `@` says what each folder is
   * - `@three-degrees/bubble-trouble` => `{ base: "spaces", path: "@three-degrees/bubble-trouble" }`
   * - `undefined` for a place with no folder of its own, e.g. `@local/my-folder`:  its group says where
   *   (`SP.ProjectRootSpec.serverPath`)
   */
  folderFor(place: string): { base: SP.SpaceFolderBase; path: string } | undefined {
    const [space = "", ...rest] = place.split("/")
    const match = /^([^@/]*)@([^@/]+)$/.exec(space)
    if (!match) return undefined
    const [, person, org] = match
    if (org === "local") return undefined
    if (person) return { base: "spaces", path: [`@${org}`, `${person}@`, ...rest].join("/") }
    if (org !== SpellUrls.BUILT_IN_ORG) return { base: "spaces", path: place }
    const isTest = place === SpellUrls.TEST_PLACE || place.startsWith(`${SpellUrls.TEST_PLACE}/`)
    return { base: isTest ? "tests" : "builtins", path: place }
  },

  /** One part of a URL, encoded on its own:  `@` stays as is, so a place reads as its address. */
  encodePart(part: string): string {
    return encodeURIComponent(part).replace(/%40/g, "@")
  }
}
/** `typeof SpellUrls`, exported so consumers can type a reference to it. */
export type SpellUrls = typeof SpellUrls

/** `<place>//<file>` for `path`, each part encoded. */
function tailFor(path: string | SpellLocation): string {
  const full = typeof path === "string" ? SpellSetup.expandAlias(path) : path.path
  const slash = full.indexOf("/")
  if (slash < 0) throw new TypeError(`SpellUrls:  '${full}' isn't a file's path`)
  const file = full.slice(slash + 1).replace(/^\/+/, "")
  return `${encodePlace(SpellUrls.placeFor(full.slice(0, slash)))}${SpellUrls.STEP}${encodePlace(file)}`
}

/** `place` (or a file's path) with each `/`-part encoded on its own. */
function encodePlace(place: string): string {
  return place.split("/").map(SpellUrls.encodePart).join("/")
}

/** `encoded` with each `/`-part decoded on its own;  throws `TypeError` (naming `url`) when one won't decode. */
function decodeParts(encoded: string, url: string): string {
  try {
    return encoded
      .split("/")
      .map((part) => decodeURIComponent(part))
      .join("/")
  } catch {
    throw new TypeError(`SpellUrls:  can't decode '${url}'`)
  }
}

/** `url`'s path with the first of `prefixes` it starts with taken off, and its query and hash. */
function tailOf(url: string, prefixes: string[]): string {
  const path = url.split(/[?#]/)[0]!
  const prefix = prefixes.find((it) => path.startsWith(it))
  return prefix ? path.slice(prefix.length) : path
}

/** `projectId` as its group's path and its project's name (`undefined` for a group alone). */
function splitProjectId(projectId: string): [SP.ProjectRootPath, string | undefined] {
  const [owner, domain, projectName] = SpellSetup.expandAlias(projectId).split(":")
  return [`${owner}:${domain}` as SP.ProjectRootPath, projectName || undefined]
}
