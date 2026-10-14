import type * as SP from "./spell.types"

/**
 * The registry of project GROUPS (project roots), shared by the browser and node, plus routines for working with
 * ADDRESSES.
 * - An address is a group's, then a project, then a file, one slash between each:  `@spell/examples/solitaire/Card.spell`
 *   (epic `people-and-orgs` P4) -- see `SpellLocation` for how one breaks down into its pieces.
 * - It starts EMPTY:  the groups are spaces' (`$/spaces`, `SPACES.PROJECT_GROUPS`), which registers them with
 *   `addProjectRoot()` as it loads (epic `people-and-orgs` P15).
 *   - So every program that reads an address loads spaces' groups first:  the editor, `<spell-app>`, the language
 *     server, the `spell` command, the routes, the tests.  Without them, every address is "invalid".
 * - NOTE: kept deliberately dependency-free (`import type` only) -- `SpellLocation.ts` and `SpellUrls.ts` (which
 *   must stay light:  `<spell-app>` and the server import them) depend on this file, so anything pulled in here
 *   would leak into their bundles too.
 */
export const SpellSetup = {
  /**
   * Registry of project groups, keyed by their address, e.g. `@spell/examples`.
   * - Drives `SpellLocation`'s validation:  an address must start with one of these to be valid.
   * - Where each one's projects are:  its address (`SpellUrls.folderFor()`), or a runtime group's `serverPath`.
   * - Filled by `addProjectRoot()`:  spaces' groups as it loads, and `@local/<folder>` groups at runtime.
   */
  projectRoots: {} as Record<SP.ProjectRootPath, SP.ProjectRootSpec>,

  /**
   * Register a project group, e.g. one of spaces' groups, or `@local/my-folder` for a folder an editor opened.
   * - Returns the spec, or the EXISTING spec if `spec.path` is already registered (first one wins).
   * - SIDE EFFECT: `SpellLocation` accepts addresses under it from now on.
   */
  addProjectRoot(spec: SP.ProjectRootSpec): SP.ProjectRootSpec {
    return (this.projectRoots[spec.path] ??= spec)
  },

  /** All registered groups' addresses, e.g. `["owen@spell", "@spell/examples", "@spell/guides", ...]`. */
  get projectRootPaths() {
    return Object.keys(this.projectRoots)
  },

  /** Return `ProjectRootSpec` for `path` (`projectRoots[path]`); throws if `path` isn't a known group. */
  projectSpectForRootPath(path: SP.ProjectRootPath | undefined): SP.ProjectRootSpec {
    const spec = SpellSetup.projectRoots[path!]
    if (!spec) throw new TypeError(`Path '${path}' must be one of: "${this.projectRootPaths.join(`", "`)}"!`)
    return spec
  },

  /**
   * The group `place` is in:  the one whose address is the LONGEST start of it, a whole part at a time,
   * e.g. `@spell/examples/solitaire` => `@spell/examples`'s;  `undefined` if none.
   * - `place`:  an address;  a file's address too, since group addresses are whole parts.
   */
  groupFor(place: string): SP.ProjectRootSpec | undefined {
    return Object.values(this.projectRoots)
      .filter((it) => place === it.path || place.startsWith(`${it.path}/`))
      .sort((a, b) => b.path.length - a.path.length)[0]
  }
}
/** `typeof SpellSetup`, exported so consumers can type a reference to it. */
export type SpellSetup = typeof SpellSetup
