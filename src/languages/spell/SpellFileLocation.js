import global from "global"
import { writeOnce, memoize } from "~/util"
import { spellInstall, SpellProject, SpellProjectList } from "."

/**
 * Encapsulate a Spell File's `path` so we can get the various bits quickly and easily.
 * Immutable object.
 *
 * NOTE: assumes that we have a single level of project paths. ???
 * TODO: add user concept here???
 */
export class SpellFileLocation {
  /** Registry of known instances. */
  static registry = new Map()
  constructor(path) {
    // Return immediatly from registry if already present.
    const existingLocation = SpellFileLocation.registry.get(path)
    if (existingLocation) return existingLocation

    // Throw if invalid path
    if (!spellInstall.isValidPath(path)) {
      throw new TypeError(`SpellFileLocation('${path}'): Path is invalid.`)
    }

    this.path = path
    SpellFileLocation.registry.set(path, this)
  }

  /** Full `path` to the resource. */
  @writeOnce path

  //-----------------
  //  Deriving paths
  //-----------------

  /** Return a file path relative to this project. */
  getFilePath(filePath) {
    return this.projectPath + (filePath.startsWith("/") ? "" : "/") + (filePath || "")
  }

  //-----------------
  //  Syntactic sugar for working with paths.
  //-----------------

  /** ProjectList for this location. */
  get projectList() {
    return spellInstall[this.projectType]
  }

  /** `projectRoot`, e,g `/projects/` or `/library/`. */
  get projectRoot() {
    return this._split_.projectRoot
  }

  /** Is this a library project? */
  get isSystemProject() {
    return spellInstall.isSystemProject(this.projectRoot)
  }

  /** Is this a user's project? */
  get isUserProject() {
    return spellInstall.isUserPath(this.projectRoot)
  }

  /** Project for this location. */
  get project() {
    return new SpellProject(this.projectPath)
  }

  /** Path to the project. */
  get projectPath() {
    const { projectType, projectId } = this._split_
    return `/${projectType}/${projectId}`
  }

  /** Type of the project, e.g. `project`, `library`, `example` or `guide`. */
  get projectType() {
    return this._split_.projectType
  }

  /** Name of the project. */
  get projectId() {
    return this._split_.projectId
  }
  /**
   * Full file path including folder.
   * `undefined` if we're a project path.
   * If we have a value, it will always start with slash.
   */
  get filePath() {
    const { folder, fileName } = this
    if (!folder && !fileName) return undefined
    if (!folder) return `/${fileName}`
    return `${folder}/${fileName}`
  }
  /** File folder within project. */
  get folder() {
    return this._split_.folder
  }
  /** Full file name including extension. */
  get fileName() {
    return this._split_.fileName
  }
  /**
   * Leaf file name without extension. `undefined` if no `fileName`.
   */
  @memoize get name() {
    const { fileName } = this._split_
    if (!fileName) return undefined
    const split = fileName.split(".")
    // If name starts with a period, assume it's a hidden file and return the first bit.
    if (fileName[0] === ".") return `.${split[1] || ""}`
    return split[0] || ""
  }
  /**
   * File extension, e.g. `.spell` or `.foo.bar`.
   * `undefined` if no filename.
   * `""` if there is a filename but no extension.
   */
  @memoize get extension() {
    const { fileName, name } = this
    if (!fileName) return undefined
    return fileName.substr(name.length)
  }

  /**
   * Is this a valid project path?
   * NOTE: Returns false if it has a filePath...
   */
  @memoize get isValidProjectPath() {
    return !!this.projectId && !this.filePath
  }

  /**
   * Is this a valid project file path?
   */
  @memoize get isValidFilePath() {
    return !!this.projectId && !!this.filePath
  }

  /** Split path into rough bits -- further refinement in getters above. */
  @memoize get _split_() {
    const [_empty, projectType, projectId, ...filePath] = this.path.split("/")
    const fileName = filePath.pop() || undefined
    const folder = filePath.length ? `/${filePath.join("")}` : undefined
    return {
      projectPrefix: `/${projectType}/`,
      projectType,
      projectId,
      folder,
      fileName
    }
  }
}

global.SpellFileLocation = SpellFileLocation
