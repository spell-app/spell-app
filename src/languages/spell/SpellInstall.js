/** The full shebang */
import global from "global"
import { memoize } from "~/util"

import { SpellProjectList } from "."

export const SPELL_PROJECT_ROOTS = [
  {
    key: "projects",
    description: "User projects",
    projectRoot: "/projects/",
    apiPrefix: "/api/projects",
    type: "user"
  },
  {
    key: "library",
    description: "Library projects",
    projectRoot: "/library/",
    apiPrefix: "/api/library",
    type: "system"
  },
  {
    key: "examples",
    description: "Example projects",
    projectRoot: "/examples/",
    apiPrefix: "/api/examples",
    type: "system"
  },
  {
    key: "guides",
    description: "Guides",
    projectRoot: "/guides/",
    apiPrefix: "/api/guides",
    type: "system"
  }
]

// Singleton instance, we don't export the class!
class SpellInstall {
  getPathSetup = (path) => {
    if (typeof path !== "string") return undefined
    return SPELL_PROJECT_ROOTS.find(({ projectRoot }) => path.startsWith(projectRoot))
  }

  isValidPath = (path) => {
    return !!this.getPathSetup(path)
  }

  isUserPath = (path) => {
    return !!SpellInstall.getPathSetup(path)?.type === "user"
  }

  isSystemPath = (path) => {
    return !!SpellInstall.getPathSetup(path)?.type === "system"
  }

  /** Return project roots by type. */
  @memoize
  get projects() {
    const setup = SPELL_PROJECT_ROOTS.find(({ key }) => key === "projects")
    return new SpellProjectList(setup)
  }
  @memoize
  get library() {
    const setup = SPELL_PROJECT_ROOTS.find(({ key }) => key === "library")
    return new SpellProjectList(setup)
  }
  @memoize
  get examples() {
    const setup = SPELL_PROJECT_ROOTS.find(({ key }) => key === "examples")
    return new SpellProjectList(setup)
  }
  @memoize
  get guides() {
    const setup = SPELL_PROJECT_ROOTS.find(({ key }) => key === "guides")
    return new SpellProjectList(setup)
  }
}

// Create an export instance
export const spellInstall = new SpellInstall()
// HACK
global.spellInstall = spellInstall
