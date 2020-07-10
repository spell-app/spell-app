import global from "global"
import { writeOnce, memoize } from "~/util"
import { spellInstall, SpellProject, SpellProjectList } from "."

/**
 * Encapsulate a Spell File's `path` so we can get the various bits quickly and easily.
 * Immutable object.
 * You can call `new SpellFileLocation("/some/path")` repeatedly and get the same object back.
 * Use `isValidPath`, `isValidProjectPath` or `isValidFilePath` to make sure you've got a good path!
 *
 * NOTE: assumes that we have a single level of project paths. ???
 * TODO: add user concept here???
 */
export class SpellFileLocation {
  /** Registry of known instances. */
  static registry = new Map()
  constructor(path) {
    // Return immediately from registry if already present.
    const existing = SpellFileLocation.registry.get(path)
    if (existing) return existing

    // Setup as normal and implicitly return `this`
    this.path = path
    SpellFileLocation.registry.set(path, this)
  }

  /**
   * Path to file or project, as specified by server.
   * MUST be passed to constructor.
   */
  @writeOnce path

  /**
   * Is this a valid path for a project or a file?
   */
  get isValidPath() {
    return spellInstall.isValidPath(this.path) && !!this.projectId
  }

  /**
   * Is this a valid project path?
   * NOTE: Returns false if it has a filePath...
   */
  get isValidProjectPath() {
    return this.isValidPath && !this.filePath
  }

  /**
   * Is this a valid project file path?
   */
  get isValidFilePath() {
    return this.isValidPath && !!this.filePath
  }

  //-----------------
  //  Deriving paths
  //-----------------

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
    return spellInstall.isSystemPath(this.projectRoot)
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
    const { projectType, projectName } = this._split_
    return `/${projectType}/${projectName}`
  }

  /** Type of the project, e.g. `project`, `library`, `example` or `guide`. */
  get projectType() {
    return this._split_.projectType
  }

  /** Name of the project. */
  get projectId() {
    return this._split_.projectId
  }

  /** Name of the project. */
  get projectName() {
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

  /** Split path into rough bits -- further refinement in getters above. */
  @memoize get _split_() {
    const [_empty, projectType, projectId, ...filePath] = this.path.split("/")
    const fileName = filePath.pop() || undefined
    const folder = filePath.length ? `/${filePath.join("")}` : undefined
    return {
      projectRoot: `/${projectType}/`,
      projectType,
      projectId,
      projectName: projectId,
      folder,
      fileName
    }
  }
}

global.SpellFileLocation = SpellFileLocation
