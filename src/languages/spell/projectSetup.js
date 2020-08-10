import global from "global"

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
  projectRoots = {
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
    // "@user:library": {
    //   owner: "@user",
    //   domain: "library",
    //   label: "Library",
    //   singular: "Library",
    //   type: "library",
    //   description: "User library",
    //   icon: "app store ios"
    // },
  }
}
export const spellSetup = new SpellSetup()
// HACK
global.spellSetup = spellSetup
