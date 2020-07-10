import global from "global"

/**
 * Shared client/server setup for project roots and routines for working with paths.
 *
 * We assume `path`s are of the form:
 *  `@owner:domain:projectName/folder/folder/file.extension`
 * See `src/languages/spell/SpellPath` for how this breaks down.
 *
 */
class SpellSetup {
  /** TODOC:   */
  projectRoots = {
    projects: {
      owner: "@user",
      domain: "projects",
      description: "User projects"
    },
    library: {
      owner: "@user",
      domain: "library",
      description: "User library"
    },
    examples: {
      owner: "@system",
      domain: "examples",
      description: "Example projects"
    },
    guides: {
      owner: "@system",
      domain: "guides",
      description: "Usage guides"
    }
  }
}
export const spellSetup = new SpellSetup()
// HACK
global.spellSetup = spellSetup
