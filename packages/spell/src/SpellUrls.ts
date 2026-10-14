import type * as SP from "./spell.types"
import type { SpellLocation } from "./SpellLocation"
// Import directly:  this file stays as light as `SpellSetup`, so `<spell-app>` can build URLs without the barrel
import { SpellSetup } from "./SpellSetup"

/**
 * Where a project and its files are, by URL and by folder:  the ONE function spell, spaces' routes and spaces' disk
 * reader share (epic `people-and-orgs` P15).
 * - A project's URLs hold its ADDRESS as it is (P4), e.g. `@spell/examples/solitaire`.
 * - A file's URL is its address:  `/spaces/@spell/examples/solitaire/Card.spell`.
 *   - Saving it is a call:  `/api/projects/file/@spell/examples/solitaire/Card.spell`.
 *   - A project's index:  `/api/projects/index/<address>`;  a group's projects:  `/api/projects/list/<address>`.
 * - Where the project ends:  its group's address, then ONE part (`split()`);  what follows is the file, which has a
 *   dot in its name (decision Q41).
 * - Each part is encoded on its own (`encodeAddress()`), so the address's slashes stay slashes.
 * - Every URL starts `/spaces/` or `/api/`, and is written whole, never relative.
 * - Its folder (`folderFor()`):  a base folder and a path under it, e.g. `@spell/examples/solitaire` is
 *   `@spell/examples/solitaire` under spaces' built-ins.  Which real folder each base is, only spaces knows.
 * - NOTE: imports only `SpellSetup`:  it never sees a path on disk, and never loads the parser.
 */
export const SpellUrls = {
  /** Where a file is READ:  `/spaces/<address>`. */
  SPACES: "/spaces/",
  /** Where a file is SAVED:  `POST /api/projects/file/<address>`. */
  SAVE: "/api/projects/file/",
  /** A project's index:  `GET /api/projects/index/<project's address>`. */
  INDEX: "/api/projects/index/",
  /** A group's projects:  `GET /api/projects/list/<group's address>`. */
  LIST: "/api/projects/list/",
  /** The test projects' group:  their folder is under the repo's `tests/`, not spaces' built-ins. */
  TEST_PLACE: "@spell/test",
  /** The org whose own space is the repo's built-ins, `packages/spaces/@spell/`. */
  BUILT_IN_ORG: "spell",

  ////////////////
  // ## URLs
  ////////////////

  /** URL to READ the file at `path` (e.g. `@spell/examples/solitaire/Card.spell`):  `/spaces/<address>`. */
  fileUrl(path: string | SpellLocation): string {
    return SpellUrls.SPACES + tailFor(path)
  },

  /** URL to SAVE the file at `path`:  `/api/projects/file/<address>`. */
  saveUrl(path: string | SpellLocation): string {
    return SpellUrls.SAVE + tailFor(path)
  },

  /** URL of project `projectId`'s index:  `/api/projects/index/<address>`. */
  indexUrl(projectId: string): string {
    return SpellUrls.INDEX + SpellUrls.encodeAddress(projectId)
  },

  /** URL of group `rootPath`'s project list:  `/api/projects/list/<group's address>`. */
  listUrl(rootPath: string): string {
    return SpellUrls.LIST + SpellUrls.encodeAddress(rootPath)
  },

  ////////////////
  // ## Back from a URL
  ////////////////

  /**
   * The project and file a file's URL names, from `/spaces/...` or `/api/projects/file/...` (or just its tail,
   * the address), e.g. `{ projectId: "@spell/examples/solitaire", filePath: "/Card.spell",
   * path: "@spell/examples/solitaire/Card.spell" }`.
   * - Decodes each part on its own, then splits off the group and the project (`split()`).
   * - throws `TypeError`:  a part that won't decode, a project no group holds, or no file after it
   * - NOTE: says nothing of whether its parts are valid names:  `new SpellLocation(path)` checks that.
   */
  fileForUrl(url: string): { projectId: string; filePath: string; path: string } {
    const address = decodeParts(tailOf(url, [SpellUrls.SPACES, SpellUrls.SAVE]), url)
    const { projectId, rest } = SpellUrls.split(address)
    if (!rest) throw new TypeError(`SpellUrls.fileForUrl('${url}'):  no file after the project`)
    return { projectId, filePath: `/${rest}`, path: address }
  },

  /**
   * `address` split where its project ends:  its group's address, then ONE part (decision Q41), e.g.
   * `@spell/examples/solitaire/a/Card.spell` => `{ projectId: "@spell/examples/solitaire", rest: "a/Card.spell" }`.
   * - `rest` is `""` for a project or a group alone.
   * - throws `TypeError` if no group holds it
   */
  split(address: string): { projectId: string; rest: string } {
    const group = SpellSetup.groupFor(address)
    if (!group) throw new TypeError(`SpellUrls:  no project group holds '${address}'`)
    if (address === group.path) return { projectId: address, rest: "" }
    const [project, ...rest] = address.slice(group.path.length + 1).split("/")
    return { projectId: `${group.path}/${project}`, rest: rest.join("/") }
  },

  /**
   * The project (or group) address `place` names, checked:  a group's address, or a group's and ONE more part,
   * the project's name, e.g. `@spell/examples/solitaire`, `@spell/examples`.
   * - Takes a URL's tail too, still encoded:  `/api/projects/index/<address>` => its project.
   * - throws `TypeError` if no group holds it, or more than one part follows the group's address
   */
  projectIdFor(place: string): string {
    if (/%/.test(place)) place = decodeParts(place, place)
    for (const prefix of [SpellUrls.INDEX, SpellUrls.LIST])
      if (place.startsWith(prefix)) place = place.slice(prefix.length)
    const group = SpellSetup.groupFor(place)
    const rest = group ? place.slice(group.path.length + 1) : ""
    if (!group || rest.includes("/")) throw new TypeError(`SpellUrls.projectIdFor('${place}'):  no project group there`)
    return place
  },

  /**
   * `address` without a page of its running app:  `owen@spell/solitaire/rules` => `owen@spell/solitaire`.
   * - A page is what follows a project when its last part has no dot and no slash after it (decision Q41);
   *   a file's address (`.../Card.spell`) or a folder's (`.../assets/`) is as it is.
   * - An address no group holds:  as it is, for `new SpellLocation()` to refuse.
   */
  withoutPage(address: string): string {
    if (!SpellSetup.groupFor(address)) return address
    const { projectId, rest } = SpellUrls.split(address)
    const last = rest.slice(rest.lastIndexOf("/") + 1)
    return !rest || rest.endsWith("/") || last.includes(".") ? address : projectId
  },

  ////////////////
  // ## Folders
  ////////////////

  /**
   * Which folder holds `place`:  a `base` and the `path` under it, `/`-separated.
   * - `@spell/test/fizzbuzz` => `{ base: "tests", path: "@spell/test/fizzbuzz" }`:  the repo's `tests/spaces/`
   * - `@spell/examples/solitaire` => `{ base: "builtins", path: "@spell/examples/solitaire" }`:  `packages/spaces/`
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
  },

  /** `address` with each `/`-part encoded on its own (`encodePart()`):  its slashes stay slashes. */
  encodeAddress(address: string): string {
    return address.split("/").map(SpellUrls.encodePart).join("/")
  }
}
/** `typeof SpellUrls`, exported so consumers can type a reference to it. */
export type SpellUrls = typeof SpellUrls

/** The address of `path` with each part encoded, checked to name a file:  a dot in its last part (decision Q41). */
function tailFor(path: string | SpellLocation): string {
  const full = typeof path === "string" ? path : path.path
  if (!full.slice(full.lastIndexOf("/") + 1).includes("."))
    throw new TypeError(`SpellUrls:  '${full}' isn't a file's address`)
  return SpellUrls.encodeAddress(full)
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
