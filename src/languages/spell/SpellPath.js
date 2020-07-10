import global from "global"
import { spellSetup } from "./projectSetup"

/**
 * Encapsulate a Spell File's `path` so we can get the various bits quickly and easily.
 * These are immutable objects, and are stored in a registry.
 * You can call `new SpellPath("/some/path")` repeatedly and get the same object back.
 * Use `isValidPath`, `isProjectPath` or `isFilePath` to make sure you've got a good path!
 *
 * Paths are assumed to be in the form:
 *  `@owner:domain:projectName/folder/folder/file.extension`
 *
 * which corresponds to
 *  - `projectId`   `@owner:domain:projectName`
 *  - `owner`       `@owner`
 *  - `domain`      `domain`
 *  - `projectName` `projectName`
 *  - `folder`      `/folder/folder/`  (`undefined` for project path)
 *  - `fileName`    `file.extension`   (`undefined` for folder or project path)
 *  - `name`        `file`             (`undefined` for folder or project path)
 *  - `extension`   `.extension`       (`undefined` for folder project path)
 */
export class SpellPath {
  /** Registry of known instances. */
  static registry = new Map()

  /** Set to `false` to ignore registry (e.g. on the server). */
  static useRegistry = true

  constructor(path) {
    // Throw if we `path` is not a string.
    if (typeof path !== "string" || !path) {
      throw new TypeError(`new SpellPath('${path}': Path must be a string.`)
    }

    // Return from registry if present, add if not.
    if (SpellPath.useRegistry) {
      const existing = SpellPath.registry.get(path)
      if (existing) return existing
      SpellPath.registry.set(path, this)
    }

    this.path = path

    // Figure out out bits
    const [projectId, ...filePath] = path.split("/")
    const [owner, domain, projectName] = projectId.split(":")
    const fileName = filePath.pop()
    this.projectId = projectId
    this.owner = owner
    this.domain = domain
    this.projectName = projectName
    if (fileName !== undefined || filePath.length) {
      this.folder = filePath.length ? `/${filePath.join("/")}/` : "/"
      this.fileName = fileName || undefined
      this.filePath = `${this.folder}${fileName || ""}`
      const [name, ...extension] = fileName.split(".")
      this.name = fileName.startsWith(".") ? `.${extension.shift() || ""}` : name
      this.extension = extension.length ? `.${extension.join(".")}` : undefined
    }
  }

  /**
   * Is this a valid path for a project or a file?
   */
  get isValidPath() {
    const projectRoot = spellSetup.projectRoots[this.domain]
    return !!projectRoot && projectRoot.owner === this.owner && projectRoot.domain === this.domain && !!this.projectName
  }

  /**
   * Is this a valid project path?
   * NOTE: Returns false if it has a filePath...
   */
  get isProjectPath() {
    return this.isValidPath && !this.folder && !this.fileName
  }

  /**
   * Is this a valid file path?
   */
  get isFilePath() {
    return this.isValidPath && !!this.folder && !!this.fileName
  }

  /**
   * Is this a valid folder path (with no file)?
   */
  get isFolderPath() {
    return this.isValidPath && !!this.folder && !this.fileName
  }

  /** Is this a system project? */
  get isSystemProject() {
    return this.isValidPath && this.owner === "@system"
  }

  /** Is this a user project? */
  get isUserProject() {
    return this.isValidPath && this.owner === "@user"
  }

  //-----------------
  //  Syntactic sugar for working with paths.
  //-----------------

  /** Project for this location. */
  get project() {
    return new SpellProject(this.projectId)
  }
}

global.SpellPath = SpellPath
