import global from "global"
import { computed } from "mobx"

import { JSON5File, OPTIONAL, REQUIRED, proto } from "../../util"
import { SpellProject } from "./SpellProject"

/**
 * Loadable list of all `SpellProject`s available to this user.
 *
 * Note that this is a singleton -- you'll always get the same object back on `new`.
 *
 * TODO: compile status / etc
 */
export class SpellProjectList extends JSON5File {
  /** Pointer to our singleton instance. */
  static #singleton
  constructor() {
    if (!SpellProjectList.#singleton) SpellProjectList.#singleton = super()
    return SpellProjectList.#singleton
  }

  /**
   * List of all available `SpellProject`s.
   */
  @computed get projects() {
    if (!this.isLoaded) console.warn("SpellProjectList(): Attempting to get list of projects before loading.")
    return this.contents?.map(projectName => new SpellProject(`/project/${projectName}`))
  }

  /**
   * Return a known `project` by path.
   * Pass `isRequired = REQUIRED` to throw if not found.
   */
  getProject(path, isRequired = OPTIONAL) {
    const project = this.projects?.find(p => p.path === path)
    if (!project && isRequired === REQUIRED) throw new TypeError(`SpellProjectList.get("${path}"): project not found.`)
    return project
  }

  @proto url = "/api/projects"
}

global.SpellProjectList = SpellProjectList

// HACK???
global.projects = new SpellProjectList()
