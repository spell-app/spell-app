import global from "global"
import { spellSetup } from "./projectSetup"
/**
 * IMPORTANT: this file MUST NOT import from anything other than `spellSetup`
 * as it is used by the server, and we don't want to pull all of that crap in!
 */

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
      throw new TypeError(`new SpellPath('${path}'): Path must be a string.`)
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
   * Is this a valid project DOMAIN path?
   */
  get isDomainPath() {
    const projectRoot = spellSetup.projectRoots[this.domain]
    return (
      !!projectRoot &&
      projectRoot.owner === this.owner &&
      projectRoot.domain === this.domain &&
      !this.projectName &&
      !this.folder &&
      !this.filePath
    )
  }

  /**
   * Is this a valid project path?
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
  //  Syntactic sugar
  //-----------------

  /** `domainPath` as `@user:projects` or `@system:examples` */
  get domainPath() {
    return `${this.owner}:${this.domain}`
  }

  //-----------------
  //  Syntactic sugar for working with paths.
  //-----------------

  /** Get a peer project, in the same domain as this one. */
  getDomainProject(projectName) {
    const projectPath = `${this.domainPath}:${projectName}`
    return new SpellFile(projectPath)
  }

  /** Get a peer file, in the same domain as this one. */
  getProjectFile(filePath) {
    return SpellPath.getFilePath(this, filePath)
  }

  //-----------------
  //  Get a path of the specified type or throw on invalid path.
  //-----------------

  /**
   * Get `SpellPath` for `domainId` string, throwing if it's not a valid DOMAIN path.
   */
  static getDomainPath(domainId) {
    const domain = new SpellPath(domainId)
    if (!domain.isDomainPath) throw new TypeError(`You must pass a valid domain, got '${domainId}'`)
    return domain
  }

  /**
   * Get `SpellPath` for `projectId`, throwing if it's not a valid PROJECT path.
   */
  static getProjectPath(projectId) {
    const project = new SpellPath(projectId)
    if (!project.isProjectPath) throw new TypeError(`You must pass a valid projectId, got '${projectId}'`)
    return project
  }

  /**
   * Get `SpellPath` for a full file `path` or `project` (as a SpellPath) and `filePath`,
   * throwing if it's not a valid FILE path.
   */
  static getFilePath(project, filePath) {
    let fullPath
    if (arguments.length === 1 && typeof project === "string") fullPath = project
    else fullPath = project.path + (filePath?.startsWith?.("/") ? filePath : `/${filePath}`)
    const file = new SpellPath(fullPath)
    if (!file.isFilePath) throw new TypeError(`You must pass a valid filePath, got '${filePath}'`)
    return file
  }
}

global.SpellPath = SpellPath
