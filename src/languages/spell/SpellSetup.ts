import global from "global"

export interface ProjectRoot {
  /** Owner of project, as `@user` or `@system`. */
  owner: string
  /** Domain of project, as `projects`, `examples` or `guides`. */
  domain: string
  /** User-friendly title of project. */
  title: string
  /** Type of project for string concatenation, as `Project`, `Example` or `Guide`. */
  Type: string
  /** Type of project for string concatenation, as `project`, `example` or `guide`. */
  type: string
  /** User friendly description of project. */
  description: string
  /** Semantic UI icon of project. */
  icon: string
}

export interface ProjectRootMap {
  [key: string]: ProjectRoot
}

/**
 * Shared client/server setup for project roots and routines for working with paths.
 *
 * We assume `path`s are of the form:
 *  `@owner:domain:projectName/folder/folder/file.extension`
 * See `src/languages/spell/SpellLocation` for how this breaks down.
 *
 */
class SpellSetup {
  /** TODOC:   */
  projectRoots: ProjectRootMap = {
    "@user:projects": {
      owner: "@user",
      domain: "projects",
      title: "Projects",
      Type: "Project",
      type: "project",
      description: "User projects blah blah blah",
      icon: "app store ios"
    },
    "@system:examples": {
      owner: "@system",
      domain: "examples",
      title: "Examples",
      Type: "Example",
      type: "example",
      description: "Example projects",
      icon: "app store ios"
    },
    "@system:guides": {
      owner: "@system",
      domain: "guides",
      title: "Guides",
      Type: "Guide",
      type: "guide",
      description: "Usage guides",
      icon: "newspaper outline"
    }
  }

  projectRootForDomain(domain: string | undefined): ProjectRoot {
    const root = Object.values(this.projectRoots).find((root) => root.domain === domain)
    if (!root) throw new TypeError(`Domain '${domain}' must be one of: "projects", "examples" or "guides"!`)
    return root
  }
}

export const spellSetup = new SpellSetup()
// HACK
global.spellSetup = spellSetup
