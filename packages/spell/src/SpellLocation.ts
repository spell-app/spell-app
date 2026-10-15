import { SP } from "$/spell"

/**
 * IMPORTANT: this file MUST NOT import from anything other than `SpellSetup`
 * as it is used by the server, and we don't want to pull all of that crap in!
 */

/**
 * Encapsulate a spell ADDRESS (its `path`) so we can get various bits quickly and easily.
 * - Roughly analagous to `window.location` object in browser.
 * - It's impossible to make a `SpellLocation` with an invalid address:
 *   throws on construction if `path` passed in is invalid.
 * - If you're in the middle of a process with a `die()` routine, pass that to constructor
 *   to throw via your `die()` rather than creating a generic `TypeError`.
 * - Immutable objects, stored in a registry.
 *   Doing this repeatedly with same `path` will always return same object.
 * - Use `.isProjectRoot`, `.isProjectPath` or `.isFilePath` etc to figure path type.
 * - An address is a group's address, then a project's name, then a file, a slash between each
 *   (epic `people-and-orgs` P4, decisions Q28 and Q41).
 *   `@spell/examples/solitaire/folder/Card.spell` is:
 *  - `isValid`     `true`
 *  - `projectRoot` `@spell/examples`                   the group, one of `SpellSetup.projectRoots`
 *  - `space`       `@spell`                            its space:  an org (`@spell`), or a person at one (`owen@spell`)
 *  - `domain`      `examples`                          the group's short name
 *  - `projectId`   `@spell/examples/solitaire`         the project's address (just the group's, for a group)
 *  - `projectName` `solitaire`                         (`undefined` if `isProjectRoot`)
 *  - `filePath`    `/folder/Card.spell`                (`undefined` if no file or folder follows the project)
 *  - `folder`      `/folder/`                          (`undefined` if no file or folder follows the project)
 *  - `file`        `Card.spell`                        (`undefined` if not `.isFilePath`)
 *  - `fileName`    `Card`                              (`undefined` if not `.isFilePath`)
 *  - `extension`   `.spell`                            (`undefined` if not `.isFilePath`)
 * - Where the project ends needs no lookup beyond the group's:  a project's name is ONE part.
 * - What follows the project, by its last part (decision Q41):
 *   - a dot:  a file, `.../solitaire/Card.spell`, `.../solitaire/.hidden`;  so every file has one
 *   - a slash at the end:  a folder, `.../solitaire/assets/`;  the project's own, `.../solitaire/`
 *   - neither:  never a `SpellLocation`
 *     - a page of the running app, `owen@spell/solitaire/rules`
 *     - or a type, where a type is expected (`typeFor()`)
 * - A group's, a project's or a page's name holds no dot.
 */
export class SpellLocation {
  /** Registry of known instances. */
  static registry = new Map<string, SpellLocation>()

  /** Set to `false` to ignore registry (e.g. on the server). */
  static useRegistry = true

  /** Full address, required. */
  readonly path!: string
  /** The project's address, `@spell/examples/solitaire`, or its group's for a group alone;  required. */
  readonly projectId!: string
  /** Its group's address, e.g. `@spell/examples` or `owen@spell`, required. */
  readonly projectRoot!: SP.ProjectRootPath
  /** Its space, e.g. `@spell` or `owen@spell`, required. */
  readonly space!: string
  /** Its group's short name, e.g. `examples` or `projects`, required. */
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
  /**
   * Extension of file as `.extension`, optional.
   * - TESTME: check this for e.g. `file.foo.json`.
   */
  readonly extension?: string

  /**
   * Parse `path` into its pieces, or return existing registry entry for `path` if `useRegistry`.
   * - Throws `TypeError` if `path` is invalid -- or calls `die(reason)` instead, if provided.
   */
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

      // Figure out out bits:  the group, then ONE part for the project, then a file or a folder
      const group = SP.SpellSetup.groupFor(path)
      if (!group) throw "Invalid path"
      this.projectRoot = group.path
      this.space = group.space
      this.domain = group.domain
      const [projectName, ...filePath] = path === group.path ? [] : path.slice(group.path.length + 1).split("/")
      this.projectName = projectName || undefined
      this.projectId = projectName ? `${group.path}/${projectName}` : group.path
      if (filePath.length) {
        const file = filePath.pop()!
        // no dot and no slash at the end:  a page of the running app (or a type), never a location
        if (file && !file.includes(".")) throw "Invalid path:  a file's name has a dot, a folder ends in a slash"
        // an empty part, e.g. the two slashes addresses had before decision Q41:  `solitaire//Card.spell`
        if (filePath.includes("")) throw "Invalid path:  an empty part"
        this.folder = filePath.length ? `/${filePath.join("/")}/` : "/"
        this.file = file || undefined
        this.filePath = `${this.folder}${file}`
        if (file) {
          const [fileName, ...extension] = file.split(".")
          this.fileName = file.startsWith(".") ? `.${extension.shift() || ""}` : fileName
          this.extension = extension.length ? `.${extension.join(".")}` : undefined
        }
      }

      // Is this a valid path??  Its group is known (above);  then:
      // 1. If it has a projectName, is that a valid part, with no dot?
      let isValid =
        !this.projectName || (SpellLocation.isValidPathSegment(this.projectName) && !this.projectName.includes("."))
      // 2. If it has a filePath, does it have a projectName and is the filePath all valid?
      if (isValid && this.filePath) isValid = !!this.projectName && SpellLocation.isValidPath(this.filePath)
      if (!isValid) throw "Invalid path"

      // Add to registry ONLY IF VALID
      if (SpellLocation.useRegistry) SpellLocation.registry.set(path, this)
    } catch (string) {
      if (die) die(string as string)
      throw new TypeError(`new SpellLocation('${path}'):: ${string}`, { cause: string })
    }
  }

  /** Is this a project GROUP's address? */
  get isProjectRoot(): boolean {
    return !this.projectName && !this.folder && !this.filePath
  }

  /** Is this a project path? */
  get isProjectPath(): boolean {
    return !!this.projectName && !this.folder && !this.file
  }

  /** Is this a folder path (with no file)? */
  get isFolderPath(): boolean {
    return !!this.projectId && !!this.folder && !this.file
  }

  /** Is this a file path? */
  get isFilePath(): boolean {
    return !!this.projectId && !!this.folder && !!this.file
  }

  ////////////////
  // ## Syntactic sugar
  ////////////////

  /** Return our `projectPath`, e.g. `@spell/examples/solitaire`;  `undefined` for a group. */
  get projectPath(): string | undefined {
    if (this.isProjectRoot) return undefined
    return this.projectId
  }

  /**
   * Return `serverPath` for this location, works on server only.
   * - NOTE: this will throw on client!
   * - NOTE: we monkey-patch this in `server/project-utils` to work with current install.
   */
  get serverPath(): string {
    throw new TypeError(`serverPath is not available on the client!`)
  }

  ////////////////
  // ## Navigation
  ////////////////

  /** Return front-end `editorUrl` to load this location:  `/edit/<address>`, e.g. `/edit/owen@spell/errors`. */
  get editorUrl(): string {
    return `/edit/${SP.SpellUrls.encodeAddress(this.path)}`
  }

  /** Return front-end `runnerUrl` to load this location:  `/run/<address>`, e.g. `/run/@spell/examples/solitaire`. */
  get runnerUrl(): string {
    return `/run/${SP.SpellUrls.encodeAddress(this.path)}`
  }

  /**
   * The address an app URL's tail names, after its `/edit/` or `/run/`, e.g. `@spell/examples/solitaire/Card.spell`.
   * - Each part decoded on its own.
   * - NOTE: says nothing of whether it's valid:  `new SpellLocation()` checks that.
   */
  static addressForUrl(tail: string): string {
    return tail
      .split("/")
      .map((part) => decodeURIComponent(part))
      .join("/")
  }

  ////////////////
  // ## Get a path of the specified type or throw on invalid path.
  ////////////////

  /**
   * Get `SpellLocation` for the group of any valid `path` string.
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
   * Get `SpellLocation` for a full file `path`, or a `projectId` and a `filePath` in it (`Card.spell` or `/Card.spell`).
   * - A `filePath` that's an address of its own (`SpellLocation.isAddress()`) is taken whole.
   * - NOTE: this throws if it's not a valid FILE path, unlike `getProjectLocation` and `getProjectRoot`.
   */
  static getFileLocation(projectId: string, filePath?: string): SpellLocation {
    let fullPath = projectId
    if (typeof filePath === "string") {
      fullPath = SpellLocation.isAddress(filePath) ? filePath : SpellLocation.join(projectId, filePath)
    }
    const path = new SpellLocation(fullPath)
    if (!path.isFilePath) throw new TypeError(`You must pass a valid filePath, got '${filePath}': ${fullPath}`)
    return path
  }

  /** The address of `filePath` (`Card.spell` or `/Card.spell`) in project `projectId`:  `<projectId>/Card.spell`. */
  static join(projectId: string, filePath: string): string {
    return `${projectId}/${filePath.replace(/^\/+/, "")}`
  }

  /**
   * The file's path in its project, from a file's address:  `@spell/library/cards/a/Card.spell` => `/a/Card.spell`.
   * - `undefined` if it isn't a file's address, or its group isn't registered (a compile with no groups:  a test's).
   */
  static filePathOf(address: string): string | undefined {
    try {
      return new SpellLocation(address).filePath
    } catch {
      return undefined
    }
  }

  /**
   * Is `text` an address, `@spell/library/cards` or `owen@spell/errors`,
   * rather than a file's path in a project (`/Card.spell`)?
   * - An address's first part holds an `@`, which no file's name may (`isValidPathSegment()`).
   */
  static isAddress(text: string): boolean {
    return /^[^/]*@/.test(text)
  }

  /**
   * The type a TYPE's address names, e.g. for a file's `"$schema"` (decision J3).
   * - Its project, its name, and the version it names, if any:
   *   - `@spell/library/people/Person` => `{ projectId: "@spell/library/people", type: "Person" }`:  the newest version
   *   - `@spell/library/people/Person__v2` => `{ ..., type: "Person", version: 2 }` (decision J51)
   * - A type looks like a page of the running app:
   *   where the address is used says it names a type (decision Q41).
   * - throws `TypeError` if it isn't one:
   *   - no project before it
   *   - or a name that isn't a type's:  a type's starts with a capital, as spell's do
   *     (`Card.spell`, `people`, `a-b` aren't)
   * - Its project's group isn't checked:  that waits for loading it.
   */
  static typeFor(address: string): { projectId: string; type: string; version?: number } {
    const slash = address.lastIndexOf("/")
    const match = /^([A-Z][\w$]*?)(?:__v(\d+))?$/.exec(address.slice(slash + 1))
    if (!SpellLocation.isAddress(address) || slash < 0 || !match)
      throw new TypeError(
        `SpellLocation.typeFor('${address}'):  not a type's address, e.g. '@spell/library/people/Person'`
      )
    const [, type, version] = match
    return { projectId: address.slice(0, slash), type: type!, ...(version && { version: Number(version) }) }
  }

  /**
   * `name` as a project's name, lower-kebab (decision Q39).
   * - `Drawable Solitaire` => `drawable-solitaire`
   * - `OutlineSolitaire` => `outline-solitaire`
   * - `""` if nothing's left
   */
  static kebab(name: string): string {
    return name
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  /** A project's `name` for people:  `drawable-solitaire` => `Drawable Solitaire`;  any other name as it is. */
  static titleFor(name: string): string {
    if (name !== SpellLocation.kebab(name)) return name
    return name.replace(
      /(^|-)([a-z0-9])/g,
      (_all, dash: string, letter: string) => `${dash ? " " : ""}${letter.toUpperCase()}`
    )
  }

  ////////////////
  // ## Path validation
  ////////////////

  /**
   * Return `true` if path `segment` passed in is "valid".
   * - TODO: enhance with regex?
   * - TODO: do we need to export this?
   */
  static isValidPathSegment(segment: string): boolean {
    const LEGAL_SEGMENT_PATTERN = /^[\w\d-$. ]+$/
    const SEGMENT_BLACKLIST = [".", ".."]
    return typeof segment === "string" && !SEGMENT_BLACKLIST.includes(segment) && LEGAL_SEGMENT_PATTERN.test(segment)
  }

  /**
   * Return `true` if the `/`-delimited `path` passed in is "valid", ignoring any empty spots.
   */
  static isValidPath(path: string): boolean {
    return typeof path === "string" && path.split("/").filter(Boolean).every(SpellLocation.isValidPathSegment)
  }

  ////////////////
  // ## Debug
  ////////////////

  /** Debug string, e.g. `SpellLocation: owen@spell/errors`. */
  toString(): string {
    return `SpellLocation: ${this.path}`
  }
}
