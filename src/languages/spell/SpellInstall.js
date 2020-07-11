/** The full shebang */
import global from "global"
import { memoize } from "~/util"

import { spellSetup, SpellProjectRoot } from "."

// Singleton instance, we don't export the class!
class SpellInstall {
  /**
   * Given a `path`, return its `projectId` or `undefined`.
   */
  getProjectId(path) {
    return path?.split?.("/")[0]
  }

  /**
   * Given a `path`, return its project `domain` or `undefined`.
   */
  getProjectDomain(path) {
    return this.getProjectId(path)?.split(":")[1]
  }

  /**
   * Given a `path`, return its `projectName` or `undefined`.
   */
  getProjectName(path) {
    return this.getProjectId(path)?.split(":")[2]
  }

  /**
   * Given a `path`, return its path setup from `spellSetup` or `undefined`.
   */
  getPathSetup = (path) => {
    const domain = this.getProjectDomain(path)
    return spellSetup[domain]
  }

  /** Return project roots by type, creating only once. */
  @memoize
  get projects() {
    return new SpellProjectRoot(spellSetup.projectRoots.projects)
  }
  @memoize
  get library() {
    return new SpellProjectRoot(spellSetup.projectRoots.library)
  }
  @memoize
  get examples() {
    return new SpellProjectRoot(spellSetup.projectRoots.examples)
  }
  @memoize
  get guides() {
    return new SpellProjectRoot(spellSetup.projectRoots.guides)
  }
}

// Create an export instance
export const spellInstall = new SpellInstall()
// HACK
global.spellInstall = spellInstall
