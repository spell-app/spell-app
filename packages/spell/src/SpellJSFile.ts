import { TextFile } from "$/util"
import { SP } from "$/spell"

/**
 * JS / JSX file as part of `SpellProject`.
 * - NOTE: these are singleton instances -- you'll always get the same object back for a given `path`.
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

  /**
   * We've been removed from the server -- clean up memory, etc..
   * - SIDE EFFECT: deletes this instance from `SpellJSFile.registry` and its `SpellLocation` from
   *   `SP.SpellLocation.registry`.
   */
  onRemove(): void {
    super.onRemove()
    SpellJSFile.registry.delete(this.path)
    SP.SpellLocation.registry.delete(this.path)
  }

  /**
   * Path to file, as specified by server.
   * - MUST be passed to constructor.
   */
  /*@writeOnce path*/
  declare path: string

  /** `location` object which we can use to get various bits of `path`. */
  /*@forward("projectId", "projectName", "filePath", "folder", "file", "fileName", "extension")*/
  /*@memoize*/
  get location(): SP.SpellLocation {
    return this.derived("location", () => new SP.SpellLocation(this.path))
  }
  /** `projectId` from `location`. */
  get projectId(): string {
    return this.location.projectId
  }
  /** `projectName` from `location`, if any. */
  get projectName(): string | undefined {
    return this.location.projectName
  }
  /** `filePath` from `location`, if any. */
  get filePath(): string | undefined {
    return this.location.filePath
  }
  /** `folder` from `location`, if any. */
  get folder(): string | undefined {
    return this.location.folder
  }
  /** `file` from `location`, if any. */
  get file(): string | undefined {
    return this.location.file
  }
  /** `fileName` from `location`, if any. */
  get fileName(): string | undefined {
    return this.location.fileName
  }
  /** `extension` from `location`, if any. */
  get extension(): string | undefined {
    return this.location.extension
  }

  /** Pointer to our `SpellProject`. */
  /*@memoize*/
  get project(): SP.SpellProject {
    return this.derived("project", () => new SP.SpellProject(this.projectId))
  }

  /**
   * Our `info` record from project manifest, or `undefined` if not found there.
   * - NOTE: `modified` and `size` may be stale if we've been modified on client since load.
   */
  get info(): SP.ProjectManifestEntry | undefined {
    return this.project.getFileInfo(this.path)
  }

  ////////////////
  // ## Loading / Saving
  ////////////////

  /** Update file contents when you do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  /*@proto*/ get autoUpdateContentsOnSave(): boolean {
    return true
  }

  /** URL to serve the file. */
  get url(): string {
    return `/api/projects/file/${this.projectId}${this.filePath}`
  }

  ////////////////
  // ## Debug
  ////////////////

  /** Debug string: `ClassName: path`. */
  toString(): string {
    return `${this.constructor.name}: ${this.path}`
  }
}
