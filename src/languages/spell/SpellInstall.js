/** The full shebang */
import global from "global"
import { memoize } from "~/util"

import { SPELL_PROJECT_ROOTS } from "~/projectSetup"
import { SpellProjectList } from "."

// Singleton instance, we don't export the class!
class SpellInstall {
  getPathSetup = (path) => {
    if (typeof path !== "string") return undefined
    return Object.values(SPELL_PROJECT_ROOTS).find(({ projectRoot }) => path.startsWith(projectRoot))
  }

  isValidPath = (path) => {
    return !!this.getPathSetup(path)
  }

  isUserPath = (path) => {
    return !!(this.getPathSetup(path)?.type === "user")
  }

  isSystemPath = (path) => {
    return !!(this.getPathSetup(path)?.type === "system")
  }

  /** Return project roots by type. */
  @memoize
  get projects() {
    return new SpellProjectList(SPELL_PROJECT_ROOTS.projects)
  }
  @memoize
  get library() {
    return new SpellProjectList(SPELL_PROJECT_ROOTS.library)
  }
  @memoize
  get examples() {
    return new SpellProjectList(SPELL_PROJECT_ROOTS.examples)
  }
  @memoize
  get guides() {
    return new SpellProjectList(SPELL_PROJECT_ROOTS.guides)
  }
}

// Create an export instance
export const spellInstall = new SpellInstall()
// HACK
global.spellInstall = spellInstall
