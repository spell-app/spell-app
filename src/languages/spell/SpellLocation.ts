import global from "global"
import { spellSetup } from "./SpellSetup"

/**
 * IMPORTANT: this file MUST NOT import from anything other than `spellSetup`
 * as it is used by the server, and we don't want to pull all of that crap in!
 */

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
 *  - `projectRoot` `@owner:domain`
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
  static registry = new Map<string, SpellLocation>()

  /** Set to `false` to ignore registry (e.g. on the server). */
  static useRegistry = true

  /** Full path, required. */
  readonly path!: string
  /** Owner/domain/projectName, as `@owner:domain:projectName`, required. */
  readonly projectId!: string
  /** Owner of project, as `@user` or `@system`, required. */
  readonly owner!: string
  /** Domain of project, required. */
  readonly domain!: string
  /** Name of project, optional. */
  readonly projectName?: string
  /** Folder path, optional. NOTE: folders MUST end with `/`! */
  readonly folder?: string
  /** File path, optional. */
  readonly filePath?: string
  /** File name including extension, optional. */
  readonly file?: string
  /** File name without extension, optional. */
  readonly fileName?: string
  /** Extension of file as `.extension`, optional. */
  // TESTME: check this for e.g. `file.foo.json`.
  readonly extension?: string

  constructor(path: string, die?: (error: string) => never) {
    try {
      // Return from registry if present, add if not.
      if (SpellLocation.useRegistry) {
        const existing = SpellLocation.registry.get(path)
        if (existing) return existing
      }
      // Throw if the `path` is not a string.
      if (typeof path !== "string" || !path) throw "Path must be a string"

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
        if (file) {
          const [fileName, ...extension] = file.split(".")
          this.fileName = file.startsWith(".") ? `.${extension.shift() || ""}` : fileName
          this.extension = extension.length ? `.${extension.join(".")}` : undefined
        }
      }

      // Is this a valid path??  Let's take it in steps:
      // 1. Does it match a `projectRoot` in `spellSetup`
      const projectSetup = spellSetup.projectRoots[this.projectRoot as keyof typeof spellSetup.projectRoots]
      let isValid = !!projectSetup && projectSetup.owner === this.owner && projectSetup.domain === this.domain
      // 2. If it has a projectName, is that valid?
      if (isValid && this.projectName) isValid = SpellLocation.isValidPathSegment(this.projectName)
      // 3. If it has a filePath, does it have a projectName and is the filePath all valid?
      if (isValid && this.filePath) isValid = !!this.projectName && SpellLocation.isValidPath(this.filePath)
      if (!isValid) throw "Invalid path"

      // Add to registry ONLY IF VALID
      if (SpellLocation.useRegistry) SpellLocation.registry.set(path, this)
    } catch (string) {
      if (die) die(string as string)
      throw new TypeError(`new SpellLocation('${path}'):: ${string}`)
    }
  }

  /**
   * Is this a project DOMAIN path?
   */
  get isProjectRoot(): boolean {
    return !this.projectName && !this.folder && !this.filePath
  }

  /**
   * Is this a project path?
   */
  get isProjectPath(): boolean {
    return !!this.projectName && !this.folder && !this.file
  }

  /**
   * Is this a folder path (with no file)?
   */
  get isFolderPath(): boolean {
    return !!this.projectId && !!this.folder && !this.file
  }

  /**
   * Is this a file path?
   */
  get isFilePath(): boolean {
    return !!this.projectId && !!this.folder && !!this.file
  }

  /** Is this a system project? */
  get isSystemProject(): boolean {
    return this.owner === "@system"
  }

  /** Is this a user project? */
  get isUserProject(): boolean {
    return this.owner === "@user"
  }

  //-----------------
  //  Syntactic sugar
  //-----------------

  /**
   * Return our `projectRoot` as `@user:projects` or `@system:examples`
   */
  get projectRoot(): string {
    return `${this.owner}:${this.domain}`
  }

  /**
   * Return our `projectPath` as `@user:projects:projectName` etc.
   */
  get projectPath(): string | undefined {
    if (this.isProjectRoot) return undefined
    return `${this.projectRoot}:${this.projectName}`
  }

  /**
   * Return the `serverPath` for this location, works on server only.
   * - NOTE: this will throw on the client!
   * - NOTE: we monkey-patch this in `server/project-utils` to work with the current install.
   */
  get serverPath(): string {
    throw new TypeError(`serverPath is not available on the client!`)
  }

  //-----------------
  //  Navigation
  //-----------------

  /**
   * Return the font-end `editorUrl` to load this location.
   */
  get editorUrl(): string {
    if (this.isProjectRoot) return `/edit/${this.domain}`
    if (this.isProjectPath) return `/edit/${this.domain}/${this.projectName}`.replace(/ /g, "+")
    return `/edit/${this.domain}/${this.projectName}${this.filePath}`.replace(/ /g, "+")
  }

  /**
   * Return the font-end `runnerUrl` to load this location.
   */
  get runnerUrl(): string {
    if (this.isProjectRoot) return `/run/${this.domain}`
    if (this.isProjectPath) return `/run/${this.domain}/${this.projectName}`.replace(/ /g, "+")
    return `/run/${this.domain}/${this.projectName}${this.filePath}`.replace(/ /g, "+")
  }

  /**
   * Given `URLParams` of `{ domain, project, filePath }`
   * return the associated `path` string.
   */
  // TESTME: changed pattern so we no longer pull in `spellSetup`SpellProjectRoot`!
  static pathForUrl({
    domain,
    project,
    filePath
  }: {
    domain?: string
    project?: string
    filePath?: string
  } = {}): string {
    let root = spellSetup.projectRootForDomain(domain)
    let path = `${root.owner}:${root.domain}`
    if (project) {
      path += `:${project}`
      if (filePath) path += filePath.startsWith("/") ? filePath : `/${filePath}`
    }
    return path.replace(/\+/g, " ")
  }

  //-----------------
  //  Get a path of the specified type or throw on invalid path.
  //-----------------

  /**
   * Get `SpellLocation` for the `domain` portion of any valid `path` string.
   * Throws if you pass an invalid path.
   */
  static getProjectRoot(path: string): SpellLocation {
    const location = new SpellLocation(path)
    return location.isProjectRoot ? location : new SpellLocation(location.projectRoot)
  }

  /**
   * Get `SpellLocation` for the `projectId` portion of any valid `path` string.
   * Throws if you pass an invalid path.
   */
  static getProjectLocation(path: string): SpellLocation {
    const location = new SpellLocation(path)
    return location.isProjectPath ? location : new SpellLocation(location.projectId)
  }

  /**
   * Get `SpellLocation` for a full file `path` or `projectId` and `filePath`.
   *
   * Note: unlike `getProjectLocation` and `getProjectRoot`,
   *       this throws if it's not a valid FILE path.
   */
  static getFileLocation(projectId: string, filePath?: string): SpellLocation {
    let fullPath = projectId
    if (typeof filePath === "string") {
      if (filePath.startsWith("@")) fullPath = filePath
      else fullPath += filePath.startsWith("/") ? filePath : `/${filePath}`
    }
    const path = new SpellLocation(fullPath)
    if (!path.isFilePath) throw new TypeError(`You must pass a valid filePath, got '${filePath}': ${fullPath}`)
    return path
  }

  //-----------------
  //  Path validation
  //-----------------

  /**
   * Return `true` if the path `segment` passed in is "valid".
   * TODO: enhance with regex?
   */

  // TODO: do we need to export this?
  static isValidPathSegment(segment: string): boolean {
    const LEGAL_SEGMENT_PATTERN = /^[\w\d-$. ]+$/
    const SEGMENT_BLACKLIST = [".", ".."]
    return typeof segment === "string" && !SEGMENT_BLACKLIST.includes(segment) && LEGAL_SEGMENT_PATTERN.test(segment)
  }

  /**
   * Return `true` if the `/`-delimited `path` passed in is "valid", ignoring any empty spots.
   */
  static isValidPath(path: string): boolean {
    return typeof path === "string" && path.split("/").filter(Boolean).every(this.isValidPathSegment)
  }

  //-----------------
  //  Debug
  //-----------------
  toString(): string {
    return `SpellLocation: ${this.path}`
  }
}

global.SpellLocation = SpellLocation
