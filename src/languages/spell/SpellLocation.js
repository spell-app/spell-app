import global from "global"
import { spellSetup } from "./projectSetup"
/**
 * IMPORTANT: this file MUST NOT import from anything other than `spellSetup`
 * as it is used by the server, and we don't want to pull all of that crap in!
 */

/**
 * Return `true` if the path `segment` passed in is "valid".
 * TODO: enhance with regex?
 */
const LEGAL_SEGMENT_PATTERN = /^[\w\d-$. ]+$/
const SEGMENT_BLACKLIST = [".", ".."]
export function isValidPathSegment(segment) {
  return typeof segment === "string" && !SEGMENT_BLACKLIST.includes(segment) && LEGAL_SEGMENT_PATTERN.test(segment)
}
/**
 * Return `true` if the `/`-delimited `path` passed in is "valid", ignoring any empty spots.
 */
export function isValid(path) {
  return typeof path === "string" && path.split("/").filter(Boolean).every(isValidPathSegment)
}

/**
 * Encapsulate a Spell File's `path` so we can get the various bits quickly and easily.
 * This is roughly analagous to the `window.location` object in the browser.
 *
 * It's impossible to make a `SpellLocation` with an invalid path --
 * it will throw on construction if the path passed in is invalid.
 *
 * If you're in the middle of a process with a `die()` routine, pass that to the constructor
 * to throw via your `die()` rather than creating a generic `TypeError`.
 *
 * These are immutable objects, and are stored in a registry.
 * Doing this repeatedly with the same `path` will always return the same object.
 *
 * Use `.isProjectRoot`, `.isProjectPath` or `.isFilePath` etc to figure the path type.
 *
 * Legal paths are in the form:
 *  `@owner:domain:projectName/folder/folder/fileName.extension`
 *
 * which corresponds to
 *  - `isValid`     `true`
 *  - `projectId`   `@owner:domain:projectName`
 *  - `projectRoot`  `@owner:domain`
 *  - `owner`       `@owner`
 *  - `domain`      `domain`
 *  - `projectName` `projectName`                       (`undefined` if `isProjectRoot`)
 *  - `projectPath` `@owner:domain:projectName`         (`undefined` if `isProjectRoot`)
 *  - `filePath`    `/folder/folder/fileName.extension` (`undefined` if not `.isFilePath`)
 *  - `folder`      `/folder/folder/`                   (`undefined` if not `.isFilePath`)
 *  - `file`        `fileName.extension`                (`undefined` if not `.isFilePath` )
 *  - `fileName`    `fileName`                          (`undefined` if not `.isFilePath` )
 *  - `extension`   `.extension`                        (`undefined` if not `.isFilePath` )
 */
export class SpellLocation {
  /** Registry of known instances. */
  static registry = new Map()

  /** Set to `false` to ignore registry (e.g. on the server). */
  static useRegistry = true

  /**
   * See above: don't construct these directly!
   * Use `new SpellLocation(path)`
   */
  constructor(path, die) {
    try {
      // Throw if the `path` is not a string.
      if (typeof path !== "string" || !path) throw "Path must be a string"

      // Return from registry if present, add if not.
      if (SpellLocation.useRegistry) {
        const existing = SpellLocation.registry.get(path)
        if (existing) return existing
      }

      this.path = path

      // Figure out out bits
      const [projectId, ...filePath] = path.split("/")
      const [owner, domain, projectName] = projectId.split(":")
      const file = filePath.pop()
      this.projectId = projectId
      this.owner = owner
      this.domain = domain
      this.projectName = projectName
      if (file !== undefined || filePath.length) {
        this.folder = filePath.length ? `/${filePath.join("/")}/` : "/"
        this.file = file || undefined
        this.filePath = `${this.folder}${file || ""}`
        const [fileName, ...extension] = file.split(".")
        this.fileName = file.startsWith(".") ? `.${extension.shift() || ""}` : fileName
        this.extension = extension.length ? `.${extension.join(".")}` : undefined
      }

      // Is this a valid path??  Let's take it in steps:
      // 1. Does it match a `projectRoot` in `spellSetup`
      const projectSetup = spellSetup.projectRoots[this.projectRoot]
      this.isValid = !!projectSetup && projectSetup.owner === this.owner && projectSetup.domain === this.domain
      // 2. If it has a projectName, is that valid?
      if (this.isValid && this.projectName) this.isValid = isValidPathSegment(this.projectName)
      // 3. If it has a filePath, does it have a projectName and is the filePath all valid?
      if (this.isValid && this.filePath) this.isValid = !!this.projectName && isValid(this.filePath)
      if (!this.isValid) throw "Invalid path"

      // Add to registry ONLY IF VALID
      if (SpellLocation.useRegistry) SpellLocation.registry.set(path, this)
    } catch (string) {
      if (die) die(string)
      throw new TypeError(`new SpellLocation('${path}'):: ${string}`)
    }
  }

  /**
   * Is this a project DOMAIN path?
   */
  get isProjectRoot() {
    return !this.projectName && !this.folder && !this.filePath
  }

  /**
   * Is this a project path?
   */
  get isProjectPath() {
    return !!this.projectName && !this.folder && !this.file
  }

  /**
   * Is this a folder path (with no file)?
   */
  get isFolderPath() {
    return !!this.projectId && !!this.folder && !this.file
  }

  /**
   * Is this a file path?
   */
  get isFilePath() {
    return !!this.projectId && !!this.folder && !!this.file
  }

  /** Is this a system project? */
  get isSystemProject() {
    return this.owner === "@system"
  }

  /** Is this a user project? */
  get isUserProject() {
    return this.owner === "@user"
  }

  //-----------------
  //  Syntactic sugar
  //-----------------

  /**
   * Return our `projectRoot` as `@user:projects` or `@system:examples`
   */
  get projectRoot() {
    return `${this.owner}:${this.domain}`
  }

  /**
   * Return our `projectPath` as `@user:projects:projectName` etc.
   */
  get projectPath() {
    if (this.isProjectRoot) return undefined
    return `${this.projectRoot}:${this.projectName}`
  }

  /**
   * Return the font-end `url` to load this location.
   */
  get url() {
    if (this.isDomainPath) return `/${this.domain}`
    if (this.isProjectPath) return `/${this.domain}/${this.projectName}`
    return `/${this.domain}/${this.projectName}${this.filePath}`
  }

  /**
   * Given a `path` string, return the appropriate `url` or `undefined`.
   */
  static urlForPath(path) {
    try {
      return new SpellLocation(path).url
    } catch (e) {
      return undefined
    }
  }

  /**
   * Given `urlParams` of `{ domain, project, filePath }`
   * return the associated `path` string.
   */
  static pathForUrl({ domain, project, filePath } = {}) {
    let path = domain?.startsWith("example") ? "@system:examples" : "@user:projects"
    if (!project) return path
    path += `:${project}`
    if (!filePath) return path
    path += filePath.startsWith("/") ? filePath : `/${filePath}`
    return path
  }

  //-----------------
  //  Get a path of the specified type or throw on invalid path.
  //-----------------

  /**
   * Get `SpellLocation` for the `domain` portion of any valid `path` string.
   * Throws if you pass an invalid path.
   */
  static getProjectRoot(path) {
    const location = new SpellLocation(path)
    return location.isProjectRoot ? location : new SpellLocation(location.projectRoot)
  }

  /**
   * Get `SpellLocation` for the `projectId` portion of any valid `path` string.
   * Throws if you pass an invalid path.
   */
  static getProjectLocation(path) {
    const location = new SpellLocation(path)
    return location.isProjectPath ? location : new SpellLocation(location.projectId)
  }

  /**
   * Get `SpellLocation` for a full file `path` or `projectId` and `filePath`.
   *
   * Note: unlike `getProjectLocation` and `getProjectRoot`,
   *       this throws if it's not a valid FILE path.
   */
  static getFileLocation(projectId, filePath) {
    let fullPath = projectId
    if (typeof filePath === "string") {
      if (filePath.startsWith("@")) fullPath = filePath
      else fullPath += filePath.startsWith("/") ? filePath : `/${filePath}`
    }
    const path = new SpellLocation(fullPath)
    if (!path.isFilePath) throw new TypeError(`You must pass a valid filePath, got '${filePath}': ${fullPath}`)
    return path
  }
}

global.SpellLocation = SpellLocation
