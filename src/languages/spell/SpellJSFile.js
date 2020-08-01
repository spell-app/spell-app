import { TextFile, memoize, forward, writeOnce, proto } from "~/util"
import { SpellLocation, SpellProject } from "~/languages/spell"

/**
 * JS / JSX file as part of SpellProject.
 *
 * Note that these are singleton instances --
 * you'll always get the same object back for a given `path`.
 */
export class SpellJSFile extends TextFile {
  /** Registry of known instances. */
  static registry = new Map()
  constructor(path) {
    // Return immediately from registry if already present.
    const existing = SpellJSFile.registry.get(path)
    if (existing) return existing

    super({ path })
    if (!this.location.isFilePath) {
      throw new TypeError(`new SpellJSFile('${path}'): Must be initialized with valid file path.`)
    }
    SpellJSFile.registry.set(path, this)
  }

  /** We've been removed from the server -- clean up memory, etc.. */
  onRemove() {
    super.onRemove()
    SpellJSFile.registry.clear(this.path)
    SpellLocation.registry.clear(this.path)
  }

  /**
   * Path to file, as specified by server.
   * MUST be passed to constructor.
   */
  @writeOnce path

  /** `location` object which we can use to get various bits of the path. */
  @forward("projectId", "projectName", "filePath", "folder", "file", "fileName", "extension")
  @memoize
  get location() {
    return new SpellLocation(this.path)
  }

  /**
   * Pointer to our `SpellProject`.
   */
  @memoize
  get project() {
    return new SpellProject(this.projectId)
  }

  /**
   * Return promise which yields our `info` record according to the project manifest.
   * Note that `modified` and `size` may be out of sync if we've been modified on the client.
   */
  get info() {
    return this.project.getFileInfo(this.path)
  }

  //-----------------
  //  Loading / Saving
  //-----------------

  /** Update file contents when you  do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  @proto autoUpdateContentsOnSave = true

  /** URL to serve the file. */
  get url() {
    return `/api/projects/file/${this.projectId}${this.filePath}`
  }

  //-----------------
  //  Debug
  //-----------------
  toString() {
    return `${this.constructor.name}: ${this.path}`
  }
}
