import type * as SP from "./spell.types"

/**
 * The registry of project GROUPS (project roots), shared by the browser and node, plus routines for working with
 * `path`s.
 * - `path`s are of form `@owner:domain:projectName/folder/folder/file.extension` -- see `SpellLocation`
 *   for how a path breaks down into its pieces.
 * - It starts EMPTY:  the groups are spaces' (`$/spaces`, `SPACES.PROJECT_GROUPS`), which registers them with
 *   `addProjectRoot()` as it loads (epic `people-and-orgs` P15).
 *   - So every program that reads a path loads spaces' groups first:  the editor, `<spell-app>`, the language server,
 *     the `spell` command, the routes, the tests.  Without them, every path is "invalid".
 * - NOTE: kept deliberately dependency-free (`import type` only) -- `SpellLocation.ts` and `SpellUrls.ts` (which
 *   must stay light:  `<spell-app>` and the server import them) depend on this file, so anything pulled in here
 *   would leak into their bundles too.
 */
export const SpellSetup = {
  /**
   * Registry of valid project roots (`@owner:domain` pairs), keyed by their `path`.
   * - Drives `SpellLocation`'s path validation -- any path's `@owner:domain` must resolve here to be valid.
   * - Where each one's projects are:  its `place` (`SpellUrls.folderFor()`), or a runtime root's `serverPath`.
   * - Filled by `addProjectRoot()`:  spaces' groups as it loads, and `@workspace:<folder>` roots at runtime.
   */
  projectRoots: {} as Record<SP.ProjectRootPath, SP.ProjectRootSpec>,

  /**
   * Register a project root, e.g. one of spaces' groups, or `@workspace:my-folder` for a folder an editor opened.
   * - Returns the spec, or the EXISTING spec if `spec.path` is already registered (first one wins).
   * - SIDE EFFECT: `SpellLocation` accepts paths under it from now on.
   */
  addProjectRoot(spec: SP.ProjectRootSpec): SP.ProjectRootSpec {
    return (this.projectRoots[spec.path] ??= spec)
  },

  /** All registered project root `path`s, e.g. `["@user:projects", "@system:examples", "@system:guides", ...]`. */
  get projectRootPaths() {
    return Object.keys(this.projectRoots)
  },

  /** Return `ProjectRootSpec` for `path` (`projectRoots[path]`); throws if `path` isn't a known root. */
  projectSpectForRootPath(path: SP.ProjectRootPath | undefined): SP.ProjectRootSpec {
    const spec = SpellSetup.projectRoots[path!]
    if (!spec) throw new TypeError(`Path '${path}' must be one of: "${this.projectRootPaths.join(`", "`)}"!`)
    return spec
  },

  /**
   * `path` with a root's `alias` expanded, e.g. `@test/FizzBuzz/Card.spell` => `@test:fixtures:FizzBuzz/Card.spell`,
   * or `@library/cards` => `@system:library:cards`.  Anything else as is.
   * - See `ProjectRootSpec.alias`.  `SpellLocation` does this first, so any path may be written short.
   */
  expandAlias(path: string): string {
    const match = typeof path === "string" ? path.match(/^(@[^/:]+)\/(.+)$/) : null
    if (!match) return path
    const spec = Object.values(this.projectRoots).find((it) => it.alias === match[1])
    return spec ? `${spec.path}:${match[2]}` : path
  },

  /** All known project domains, e.g. `["projects", "examples", "guides", "library"]`. */
  get domains() {
    return Object.values(this.projectRoots).map((spec) => spec.domain)
  },
  /** Return `ProjectRootSpec` whose `domain` matches; throws if none match. */
  projectSpecForDomain(domain: string | undefined): SP.ProjectRootSpec {
    const spec = Object.values(this.projectRoots).find((spec) => spec.domain === domain)
    if (!spec) throw new TypeError(`Domain '${domain}' must be one of: "${this.projectRootPaths.join(`", "`)}"!`)
    return spec
  }
}
/** `typeof SpellSetup`, exported so consumers can type a reference to it. */
export type SpellSetup = typeof SpellSetup
