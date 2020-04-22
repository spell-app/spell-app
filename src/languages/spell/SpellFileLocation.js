import global from "global"
import { writeOnce, memoize } from "../../util/decorators"

/**
 * Encapsulate a Spell File's `path` so we can get the various bits quickly and easily.
 * Immutable object.
 * NOTE: assumes that we have a flat heirarchy of project paths. ???
 * TODO: add user concept here???
 */
export class SpellFileLocation {
  @writeOnce path
  constructor(path) {
    if (typeof path !== "string" || !path) throw new TypeError("Invalid path!")
    this.path = path
  }
  @memoize get _split_() {
    const [projectType, projectName, ...filePath] = this.path.split("/")
    const fileName = filePath.pop() || undefined
    const folder = filePath.length ? `/${filePath.join("")}` : undefined
    return {
      projectType,
      projectName,
      folder,
      fileName
    }
  }
  /** Path to the project. */
  get projectPath() {
    const { projectType, projectName } = this._split_
    return `${projectType}/${projectName}`
  }
  /** Type of the project, expected to be `project` or `library`. */
  get projectType() {
    return this._split_.projectType
  }
  /** Is this a library project? */
  get isLibraryProject() {
    return this.projectType === "library"
  }
  /** Is this a user's project? */
  get isUserProject() {
    return this.projectType === "project"
  }
  /** Name of the project. */
  get projectName() {
    return this._split_.projectName
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
    const { projectType, projectName, filePath } = this
    return (projectType === "project" || projectType === "library") && !!projectName && !filePath
  }

  /**
   * Is this a valid project file path?
   */
  @memoize get isValidFilePath() {
    const { projectType, projectName, filePath } = this
    return (projectType === "project" || projectType === "library") && !!projectName && !!filePath
  }
}

global.SpellFileLocation = SpellFileLocation
