import global from "global"
import keyBy from "lodash/keyBy"

import { JSON5File, Registry, proto, memoizeForProp, overrideableGetter } from "../../util"
import { SpellFile } from "./SpellFile"

/**
 * Loadable spell project index.
 */
export class SpellProjectIndex extends JSON5File {
  /** Project name. */
  @proto project = undefined
  /** Update file contents when you  do `spellProjectIndex.save({ contents })`. */
  @proto autoUpdateContentsOnSave = true

  /**
   * Construct with a `project` string to get a singleton back for that path.
   * e.g.
   *    a = new SpellProjectIndex("myProject")
   *    b = new SpellProjectIndex("myProject")
   *    a === b  <<<< true
   */
  constructor(propsOrProject) {
    if (typeof propsOrProject === "string") {
      return SpellProjectIndex.registry.get(propsOrProject)
    }
    super(propsOrProject)
  }

  /**
   * Return list of `SpellFiles` in the index.
   * Returns `undefined` if we're not loaded.
   */
  @memoizeForProp("contents") get files() {
    return this.contents?.modules?.map(({ id }) => SpellFile.registry.get(`${this.project}/${id}`))
  }

  /**
   * Return map of `SpellFiles` in the index.
   * Returns `undefined` if we're not loaded.
   */
  @memoizeForProp("files") get fileMap() {
    const { files } = this
    return files && keyBy(files, "filePath")
  }

  /** Derive `url` from our project if not explicitly set. */
  @overrideableGetter get url() {
    return `/api/projects/${this.project}/index`
  }

  /**
   * Use `SpellProjectIndex.registry.get("project")` to get a singleton SpellProjectIndex back for that path.
   * Note that you can also just do `new SpellProjectIndex("project")` to do the same thing.
   */
  static registry = new Registry({
    makeInstanceForPath(project) {
      return new SpellProjectIndex({ project })
    }
  })
}

global.SpellProjectIndex = SpellProjectIndex
