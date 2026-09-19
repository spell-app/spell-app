import type * as SP from "./spell.types"

/**
 * Shared client/server setup for project roots and routines for working with paths.
 *
 * We assume `path`s are of the form:
 *  `@owner:domain:projectName/folder/folder/file.extension`
 * See `src/languages/spell/SpellLocation` for how this breaks down.
 *
 */
export const SpellSetup = {
  /** DOCME   */
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
  },

  get projectRootPaths() {
    return Object.keys(this.projectRoots)
  },

  projectSpectForRootPath(path: SP.ProjectRootPath | undefined): SP.ProjectRootSpec {
    const spec = SpellSetup.projectRoots[path!]
    if (!spec) throw new TypeError(`Path '${path}' must be one of: "${this.projectRootPaths.join(`", "`)}"!`)
    return spec
  },

  get domains() {
    return Object.values(this.projectRoots).map((spec) => spec.domain)
  },
  projectSpecForDomain(domain: string | undefined): SP.ProjectRootSpec {
    const spec = Object.values(this.projectRoots).find((spec) => spec.domain === domain)
    if (!spec) throw new TypeError(`Domain '${domain}' must be one of: "${this.projectRootPaths.join(`", "`)}"!`)
    return spec
  }
} as const
export type SpellSetup = typeof SpellSetup
