import type * as SP from "./spell.types"

/**
 * Shared client/server setup for project roots, plus routines for working with `path`s.
 * - `path`s are of form `@owner:domain:projectName/folder/folder/file.extension` -- see `SpellLocation`
 *   for how a path breaks down into its pieces.
 * - NOTE: kept deliberately dependency-free (`import type` only) -- `SpellLocation.ts` (which itself must
 *   stay light because the server imports it directly) depends on this file, so anything pulled in here
 *   would leak into the server bundle too.
 */
export const SpellSetup = {
  /**
   * Registry of valid project roots (`@owner:domain` pairs), keyed by their `path`.
   * - Drives `SpellLocation`'s path validation -- any path's `@owner:domain` must resolve here to be valid.
   * - Add a new domain (e.g. a new top-level project category) by adding an entry here,
   *   or at runtime with `addProjectRoot()`.
   */
  projectRoots: {
    "@user:projects": {
      path: "@user:projects",
      owner: "@user",
      domain: "projects",
      title: "Projects",
      Type: "Project",
      type: "project",
      description: "User projects",
      icon: "app store ios"
    } satisfies SP.ProjectRootSpec,
    "@system:examples": {
      path: "@system:examples",
      owner: "@system",
      domain: "examples",
      title: "Examples",
      Type: "Example",
      type: "example",
      description: "Example projects",
      icon: "app store ios"
    } satisfies SP.ProjectRootSpec,
    "@system:guides": {
      path: "@system:guides",
      owner: "@system",
      domain: "guides",
      title: "Guides",
      Type: "Guide",
      type: "guide",
      description: "Usage guides",
      icon: "newspaper outline"
    } satisfies SP.ProjectRootSpec
  } as Record<SP.ProjectRootPath, SP.ProjectRootSpec>,

  /**
   * Register a project root at runtime, e.g. `@workspace:my-folder` for a folder an editor opened.
   * - Returns the spec, or the EXISTING spec if `spec.path` is already registered (first one wins).
   * - SIDE EFFECT: `SpellLocation` accepts paths under it from now on.
   */
  addProjectRoot(spec: SP.ProjectRootSpec): SP.ProjectRootSpec {
    return (this.projectRoots[spec.path] ??= spec)
  },

  /** All valid project root `path`s, e.g. `["@user:projects", "@system:examples", "@system:guides"]`. */
  get projectRootPaths() {
    return Object.keys(this.projectRoots)
  },

  /** Return `ProjectRootSpec` for `path` (`projectRoots[path]`); throws if `path` isn't a known root. */
  projectSpectForRootPath(path: SP.ProjectRootPath | undefined): SP.ProjectRootSpec {
    const spec = SpellSetup.projectRoots[path!]
    if (!spec) throw new TypeError(`Path '${path}' must be one of: "${this.projectRootPaths.join(`", "`)}"!`)
    return spec
  },

  /** All known project domains, e.g. `["projects", "examples", "guides"]`. */
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
