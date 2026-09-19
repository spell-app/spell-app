import { TextFile } from "~/util"
import { SP } from "~/languages/spell"

/**
 * JS / JSX file as part of SpellProject.
 *
 * Note that these are singleton instances --
 * you'll always get the same object back for a given `path`.
 */
export class SpellJSFile extends TextFile {
  /** Registry of known instances. */
  static registry = new Map<string, SpellJSFile>()
  constructor(path: string) {
    // Return immediately from registry if already present.
    const existing = SpellJSFile.registry.get(path)
    if (existing) return existing

    super({})
    this.path = path
    if (!this.location.isFilePath) {
      throw new TypeError(`new SpellJSFile('${path}'): Must be initialized with valid file path.`)
    }
    SpellJSFile.registry.set(path, this)
  }

  /** We've been removed from the server -- clean up memory, etc.. */
  onRemove(): void {
    super.onRemove()
    SpellJSFile.registry.delete(this.path)
    SP.SpellLocation.registry.delete(this.path)
  }

  /**
   * Path to file, as specified by server.
   * MUST be passed to constructor.
   */
  /*@writeOnce path*/
  declare path: string

  /** `location` object which we can use to get various bits of the path. */
  /*@forward("projectId", "projectName", "filePath", "folder", "file", "fileName", "extension")*/
  /*@memoize*/
  get location(): SP.SpellLocation {
    return this.derived("location", () => new SP.SpellLocation(this.path))
  }
  get projectId(): string {
    return this.location.projectId
  }
  get projectName(): string | undefined {
    return this.location.projectName
  }
  get filePath(): string | undefined {
    return this.location.filePath
  }
  get folder(): string | undefined {
    return this.location.folder
  }
  get file(): string | undefined {
    return this.location.file
  }
  get fileName(): string | undefined {
    return this.location.fileName
  }
  get extension(): string | undefined {
    return this.location.extension
  }

  /**
   * Pointer to our `SpellProject`.
   */
  /*@memoize*/
  get project(): SP.SpellProject {
    return this.derived("project", () => new SP.SpellProject(this.projectId))
  }

  /**
   * Return promise which yields our `info` record according to the project manifest.
   * Note that `modified` and `size` may be out of sync if we've been modified on the client.
   */
  get info(): SP.ProjectManifestEntry | undefined {
    return this.project.getFileInfo(this.path)
  }

  //-----------------
  //  Loading / Saving
  //-----------------

  /** Update file contents when you  do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  /*@proto*/ get autoUpdateContentsOnSave(): boolean {
    return true
  }

  /** URL to serve the file. */
  get url(): string {
    return `/api/projects/file/${this.projectId}${this.filePath}`
  }

  //-----------------
  //  Debug
  //-----------------
  toString(): string {
    return `${this.constructor.name}: ${this.path}`
  }
}
