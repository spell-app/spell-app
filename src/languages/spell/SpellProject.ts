import global from "global"
// import { observable, computed } from "mobx"

import { JSON5File, $fetch, CONFIRM, TaskList, Task, getDier, type KnownFormatMimeType } from "~/util"
import { ProjectScope, type Scope } from "~/parser"
import { SpellParser, SpellLocation, SpellFile, SpellCSSFile, SpellJSFile, SpellProjectRoot } from "~/languages/spell"
import { spellCore } from "~/spellCore"

// NOTE: the server accepts the bare `"json"` string for `requestFormat` (which becomes the
// `Content-Type` header); cast it once here against `$FetchRequestParams`'s stricter
// `KnownFormatMimeType` type rather than changing the actual value sent to the server.
const REQUEST_FORMAT_JSON = "json" as KnownFormatMimeType

/** Any of the file classes a `SpellProject` can hold in its manifest. */
export type AnySpellFile = SpellFile | SpellJSFile | SpellCSSFile

/** The subset of `AnySpellFile` that can actually be `parse()`d/`compile()`d as spell source. */
export type CompilableSpellFile = SpellFile | SpellCSSFile

/** A single entry in `contents.manifest`, augmented with `path`/`location`/`file` once loaded. */
export type ProjectManifestEntry = {
  /** File creation time (ms epoch), from the server. */
  created: number
  /** File last-modified time (ms epoch), from the server. */
  modified: number
  /** File size in bytes, from the server. */
  size: number
  /** Full path, added by the `manifest` getter once loaded. */
  path?: string
  /** `SpellLocation` for `path`, added by the `manifest` getter once loaded. */
  location?: SpellLocation
  /** Pointer to the loaded file, added by the `manifest` getter once loaded. */
  file?: AnySpellFile
}

/** A single entry in `contents.imports`. */
export type ProjectManifestImport = {
  path: string
  active: boolean
  contents?: string
}

/** JSON5 shape of a project's index file, as read/written by the server. */
export type ProjectManifest = {
  manifest: Record<string, ProjectManifestEntry>
  imports: ProjectManifestImport[]
}

/** Derived (client-side) import reference, as returned by `project.imports`. */
export type ProjectImportRef = {
  path: string
  active: boolean
  location: SpellLocation
  file: AnySpellFile
}

/**
 * Controller for a `SpellProject`.
 *
 * Note that these are singleton instances --
 * you'll always get the same object back for a given `path`.
 */
export class SpellProject extends JSON5File<ProjectManifest> {
  /** Registry of known instances. */
  static registry = new Map<string, SpellProject>()
  constructor(path: string) {
    // Return immediately from registry if already present.
    const existing = SpellProject.registry.get(path)
    if (existing) return existing

    super({})
    Object.assign(this, { path })
    if (!this.location.isProjectPath) {
      throw new TypeError(`new SpellProject('${path}'): Must be initialized with project path.`)
    }
    SpellProject.registry.set(path, this)
  }

  /** We've been removed from the server -- clean up memory, etc.. */
  onRemove(): void {
    super.onRemove()
    // eslint-disable-next-line no-unused-expressions
    this.files.forEach((file) => file.onRemove())
    SpellProject.registry.clear()
  }

  /*@writeOnce path*/
  declare path: string

  /**
   * Immutable `location` object which we use to get various bits of the path.
   *
   * Note that we `forward` lots of methods on the location object to this object,
   * so you can say `project.projectName` rather than `project.location.projectName`.
   */
  /*@forward("projectId", "owner", "projectName", "isSystemProject", "isUserProject")*/
  /*@memoize*/
  get location(): SpellLocation {
    return this.derived("location", () => new SpellLocation(this.path))
  }
  get projectId(): string {
    return this.location.projectId
  }
  get owner(): string {
    return this.location.owner
  }
  get projectName(): string | undefined {
    return this.location.projectName
  }
  get isSystemProject(): boolean {
    return this.location.isSystemProject
  }
  get isUserProject(): boolean {
    return this.location.isUserProject
  }

  /*@forward("type", "Type")*/
  /*@memoize*/
  get projectRoot(): SpellProjectRoot {
    return this.derived("projectRoot", () => new SpellProjectRoot(this.location.projectRoot))
  }
  get type(): string {
    return this.projectRoot.type
  }
  get Type(): string {
    return this.projectRoot.Type
  }

  //-----------------
  //  Compilation
  //-----------------

  /** Parser use for our last parse/compile. */
  /*@state*/ get scope(): ProjectScope | undefined {
    return this.getState("scope", () => undefined)
  }
  set scope(scope: ProjectScope | undefined) {
    this.setState("scope", scope)
  }

  /** Last compiled result as a javascript string. */
  /*@state*/ get compiled(): string | undefined {
    return this.getState("compiled", () => undefined)
  }
  set compiled(compiled: string | undefined) {
    this.setState("compiled", compiled)
  }

  /*@memoize*/
  get outputFile(): SpellJSFile {
    return this.derived("outputFile", () => {
      const location = this.getFileLocation(".output.js")!
      return new SpellJSFile(location.path)
    })
  }

  /** Reset our compiled state. */
  resetCompiled(): void {
    this.resetState("scope", "compiled")
  }

  parse(parser?: Scope): Promise<unknown> {
    this.parser.cancel()
    return this.parser.start(parser)
  }
  compile(parser?: Scope): Promise<unknown> {
    this.parser.cancel()
    this.compiler.cancel()
    return this.compiler.start(parser)
  }

  /**
   * Return base project scope, given a `parentScope`.
   * TODOC...
   */
  getScope(parentScope: Scope = SpellParser.rootScope): ProjectScope {
    // Make a parser that depends on the parentScope's parser
    // This way rules added to the project won't leak out.
    const parser = parentScope.parser!.clone({ module: this.path })
    return new ProjectScope({
      name: this.projectName,
      path: this.path,
      parser,
      parentScope
    })
  }

  /**
   * Return a TaskList we can use to parse our imports.
   * Call as `project.parser.start(parentScope?)`
   */
  /*@memoize*/
  get parser(): TaskList {
    return this.derived("parser", () => {
      return new TaskList({
        name: `Parsing ${this.type}: ${this.projectName}`,
        tasks: [
          new Task({
            name: `Loading ${this.type}`,
            run: (parentScope) => {
              this.resetCompiled()
              const scope = this.getScope(parentScope as Scope | undefined)
              this.setState("scope", scope)
              return this.load(undefined)
            }
          }),
          TaskList.forEach({
            name: `Parsing imports`,
            list: () => this.activeImports,
            getTask: (file: AnySpellFile) =>
              new Task({
                name: `Parsing import: ${file.file}`,
                run: () => (file as CompilableSpellFile).parse(this.scope)
              })
          })
        ]
      })
    })
  }

  /**
   * Return a TaskList we can use to `compile()` our imports.
   * Call as `project.compiler.start(parentScope?)`
   */
  /*@memoize*/
  get compiler(): TaskList {
    return this.derived("compiler", () => {
      return new TaskList({
        debug: false,
        name: `Compiling ${this.type}: ${this.projectName}`,
        tasks: [
          this.parser,
          TaskList.forEach({
            name: `Compiling imports`,
            list: () => this.activeImports,
            getTask: (file: AnySpellFile) =>
              new Task({
                name: `Compiling import: ${file.file}`,
                run: () => (file as CompilableSpellFile).compile()
              })
          }),
          new Task({
            name: "Combining output",
            run: async (allCompiled) => {
              const compiled = (allCompiled as string[]).join("\n// -----------\n")
              this.setState("compiled", compiled)
              return compiled
            }
          }),
          new Task({
            name: "Saving compiled output",
            run: async (compiled) => {
              this.outputFile.contents = compiled as string
              return await this.outputFile.save(undefined)
            }
          })
        ]
      })
    })
  }

  /**
   * Execute our `compiled` code. No-op if not compiled.
   * Returns compiled module `exports` or `error` on JS error.
   */
  static runAsImport = true // `false` to run by script injection

  /** Module `exports` from our last successful `executeCompiled()`. */
  exports?: unknown
  /** Error thrown by our last failed `executeCompiled()`. */
  executionError?: unknown

  async executeCompiled(): Promise<unknown> {
    if (!this.compiled) return undefined

    // reset runtime environment
    spellCore.resetRuntime()
    delete this.exports
    delete this.executionError

    // METHOD 2 (working except we can't get line number of failure)
    // Run by importing our `outputFile` as a module.
    // This lets us catch errors and get access to module `exports`.
    // Unfortunately, we don't get the line number of the error
    // (although Chrome does get the line number if we re-throw the error.)
    try {
      const url = this.outputFile.url
      // REFACTOR: ???  Use `?<timestamp>` to create a unique URL each time
      // url += `?${Date.now()
      this.exports = await import(/* @vite-ignore */ url)
      return this.exports
    } catch (e) {
      if (Error.captureStackTrace) Error.captureStackTrace(e as object, this.executeCompiled)
      this.executionError = e
      return e
    }

    // METHOD 1
    // Alternate method of running: create a <script> tag
    // Problem with this is that we don't get access to errors
    // or `exports` in the compiled code.
    //
    // const scriptEl = document.createElement("script")
    // scriptEl.setAttribute("id", "compileOutput")
    // scriptEl.setAttribute("type", "module")
    // scriptEl.innerHTML = this.compiled
    // const existingEl = document.getElementById("compileOutput")
    // if (existingEl) {
    //   existingEl.replaceWith(scriptEl)
    // } else {
    //   document.body.append(scriptEl)
    // }
  }

  /**
   * One of our `file`s has updated its contents.
   * Have all of our files `resetCompiled()` so they'll compile again.
   */
  updatedContentsFor(_file: AnySpellFile): void {
    ;(this.activeImports as CompilableSpellFile[]).forEach((item) => item.resetCompiled())
  }

  //-----------------
  //  Loading / contents
  //-----------------

  /** Derive `url` from our path if not explicitly set. */
  get url(): string {
    return `/api/projects/index/${this.projectId}`
  }

  /**
   * HACK HACK HACK
   * When our `contents` are updated,
   * immediately re-calculate derived properties below
   * to to avoid react-easy-state rendering errors  :-(
   */
  onContentsUpdated(): void {
    const { manifest, files, imports, activeImports } = this
    void manifest
    void files
    void imports
    void activeImports
  }

  /**
   * Load our index if necesssary, calling `die()` if something goes wrong.
   */
  async loadOrDie(die: ReturnType<typeof getDier>): Promise<void> {
    if (this.isLoaded) return
    try {
      this.load(undefined)
    } catch (e) {
      die(`Error loading ${this.type} index`, e)
    }
  }

  /**
   * Return the `manifest` map from our `contents`.
   * Returns `{}` if not loaded or index is malformed.
   *
   * Returned objects will have:
   *  - `path` string
   *  - `location` as SpellLocation for its `path`
   *  - `file` as pointer to `SpellFile` (etc) for its `path`
   *  - `created` as created timestamp
   *  - `modified` as last modified timestamp
   *  - `size` as file size in bytes
   */
  /*@memoizeForProp("contents")*/
  get manifest(): Record<string, ProjectManifestEntry> {
    return this.derivedFrom(
      "manifest",
      () => {
        if (!this.contents?.manifest) return {}
        // add useful stuff to manifest entries
        Object.entries(this.contents.manifest).forEach(([path, entry]) => {
          entry.path = path
          entry.location = new SpellLocation(path)
          entry.file = SpellProject.getFileForPath(path)
        })
        return this.contents.manifest
      },
      [this.contents]
    )
  }

  /**
   * Return pointers to all `SpellFiles` in our mainfest.
   * Returns `[]` if we're not loaded.
   */
  /*@memoizeForProp("contents")*/
  get files(): AnySpellFile[] {
    return this.derivedFrom(
      "files",
      () => {
        console.info("getFiles", this, this.manifest)
        return Object.values(this.manifest).map((item) => item.file!)
      },
      [this.contents]
    )
  }

  /**
   * Return the full ordered `imports` list from our `contents`, including inactive items.
   * Returns `[]` if not loaded or index is malformed.
   *
   * Returned objects will have:
   *  - `path` full path string
   *  - `active` boolean, `true` if the file should be included in compilation
   *  - `location` as SpellLocation for its `path`
   *  - `file` as pointer to `SpellFile` (etc) for its `path`
   *  - `contents` as file contents (NOTE: only for text files with certain extensions!)
   */
  /*@memoizeForProp("contents")*/
  get imports(): ProjectImportRef[] {
    return this.derivedFrom(
      "imports",
      () => {
        if (!this.contents?.imports) return []
        return this.contents.imports.map(({ path, active }) => {
          const location = SpellLocation.getFileLocation(this.projectId, path)
          const file = SpellProject.getFileForPath(location.path)
          return {
            path: location.path,
            active,
            location,
            file
          }
        })
      },
      [this.contents]
    )
  }

  /**
   * Return array of `SpellFile` (etc) objects from our `active` imports.
   * Returns `[]` if we're not loaded or index is malformed.
   */
  /*@memoizeForProp("contents")*/
  get activeImports(): AnySpellFile[] {
    return this.derivedFrom(
      "activeImports",
      () => {
        const { manifest } = this
        return this.imports //
          .filter((item) => item.active)
          .map((item) => manifest[item.path]?.file) as AnySpellFile[]
      },
      [this.contents]
    )
  }

  //-----------------
  //  Project file access
  //-----------------

  /** Given the `fullPath` to a file, return a `SpellFile` or `SpellCSSFile` etc. */
  static extensionMap?: Record<string, new (path: string) => AnySpellFile>
  static getFileForPath(fullPath: string): AnySpellFile {
    if (!SpellProject.extensionMap) {
      SpellProject.extensionMap = {
        ".css": SpellCSSFile,
        ".js": SpellJSFile,
        ".jsx": SpellJSFile,
        default: SpellFile
      }
    }
    const location = new SpellLocation(fullPath)
    if (!location.isFilePath) {
      throw new TypeError(`SpellProject.getFileForPath('${fullPath}'): path is not a file path.`)
    }
    const extension = location.extension
    const Constructor = (extension && SpellProject.extensionMap[extension]) || SpellProject.extensionMap.default
    return new Constructor(fullPath)
  }

  /**
   * Given a `path`as:
   * - `fullPath`, e.g. `@user:projects:project/file.spell`
   * - `filePath`, e.g. `file.spell` or `/file.spell`
   * - `SpellLocation` for a file
   * return the `SpellLocation` for the file.
   *
   * Returns `undefined` if not found, path is not valid or is not a file path.
   */
  getFileLocation(path: string | SpellLocation): SpellLocation | undefined {
    let location: SpellLocation | undefined
    if (path instanceof SpellLocation) {
      location = path
    } else if (typeof path === "string") {
      try {
        if (path.startsWith("@")) location = SpellLocation.getFileLocation(path)
        else location = SpellLocation.getFileLocation(this.projectId, path)
      } catch {
        return undefined
      }
    }
    if (location?.isFilePath) return location
    return undefined
  }

  /**
   * Assuming we're loaded, return manifest `info` for a file specified by `filePath`.
   * `filePath` can be any of:
   * - `fullPath`, e.g. `@user:projects:project/file.spell`
   * - `filePath`, e.g. `file.spell` or `/file.spell`
   * - `SpellLocation` for a file
   *
   * Returns `undefined` if file not found, couldn't load index, etc.
   */
  getFileInfo(filePath: string | SpellLocation): ProjectManifestEntry | undefined {
    const location = this.getFileLocation(filePath)
    if (location) return this.manifest[location.path]
    return undefined
  }

  /**
   * Assuming we're loaded, then return one of our `files` as a `SpellFile` or `SpellCSSFile` etc.
   * `filePath` can be any of:
   * - `fullPath`, e.g. `@user:projects:project/file.spell`
   * - `filePath`, e.g. `file.spell` or `/file.spell`
   * - `SpellLocation` for a file
   *
   * Returns `undefined` if file not found, couldn't load index, etc.
   */
  getFile(filePath: string | SpellLocation): AnySpellFile | undefined {
    return this.getFileInfo(filePath)?.file
  }

  //-----------------
  //  Project file manipulation
  //-----------------

  /**
   * Create a new file within this project.
   * `filePath` is a relative to this project, and may or may not start with `/`.
   * NOTE: in theory this handles nested files.
   */
  async createFile(
    filePath: string | undefined,
    contents: string | undefined,
    newFileName = "Untitled.spell",
    die?: ReturnType<typeof getDier>
  ): Promise<AnySpellFile | undefined> {
    if (!die) die = getDier(this, "creating file", { projectId: this.projectId, filePath })

    if (!filePath) filePath = prompt("Name for the new file?", newFileName) ?? undefined
    if (!filePath) return undefined
    die.params.filePath = filePath

    await this.loadOrDie(die)
    if (this.getFile(filePath)) die("File already exists.")

    // Tell the server to create the file, which returns updated index
    try {
      const newIndex = await $fetch<ProjectManifest>({
        url: `/api/projects/create/file`,
        contents: {
          projectId: this.projectId,
          filePath,
          contents: contents ?? `## This space intentionally left blank`
        },
        requestFormat: REQUEST_FORMAT_JSON,
        format: "json"
      })
      this.contents = newIndex
    } catch (e) {
      die("Server error creating file", e)
    }

    // Return the file
    return this.getFile(filePath) || die("Server didn't create file.")
  }

  /**
   * Duplicate an existing file.
   * Returns pointer to new file.
   */
  async duplicateFile(filePath: string, newFilePath: string | undefined): Promise<AnySpellFile | undefined> {
    const die = getDier(this, "duplicating file", {
      projectId: this.projectId,
      originalFilePath: filePath,
      filePath: newFilePath
    })
    await this.loadOrDie(die)

    const file = this.getFile(filePath) || die("File not found.")
    let contents: string | undefined
    try {
      contents = await file.load(undefined)
    } catch (e) {
      die("Server error loading file", e)
    }
    return this.createFile(newFilePath, contents, file.file, die)
  }

  /**
   * Rename an existing file.
   * Returns new file.
   */
  async renameFile(filePath: string, newFilePath?: string): Promise<AnySpellFile | undefined> {
    const die = getDier(this, "renaming file", { projectId: this.projectId, filePath, newFilePath })
    await this.loadOrDie(die)
    const file = this.getFile(filePath) || die("File not found.")

    if (!newFilePath) {
      const filename = prompt("New name for the file?", file.file)
      if (!filename) return undefined
      newFilePath = SpellLocation.getFileLocation(this.projectId, filename).filePath!
      if (newFilePath === filePath) return undefined
      die.params.newFilePath = newFilePath
    }
    if (this.getFile(newFilePath)) die("New file already exists.")

    // Tell the server to rename the file, which returns the updated index.
    try {
      const newIndex = await $fetch<ProjectManifest>({
        url: `/api/projects/rename/file`,
        contents: {
          projectId: this.projectId,
          filePath,
          newFilePath
        },
        requestFormat: REQUEST_FORMAT_JSON,
        format: "json"
      })
      this.contents = newIndex
    } catch (e) {
      die("Server error renaming file", e)
    }
    // Have the file clean itself up in a tick
    // (doing it immediately causes react to barf)
    setTimeout(() => file.onRemove(), 10)
    // return the new file
    return this.getFile(newFilePath) || die("Server didn't rename file.")
  }

  /**
   * Remove an existing file from the project.
   * Returns `true` on success, `undefined` if cancelled, or throws on error.
   */
  async deleteFile(filePath: string, shouldConfirm?: typeof CONFIRM): Promise<boolean | undefined> {
    const die = getDier(this, "deleting file", { projectId: this.projectId, filePath })
    await this.loadOrDie(die)
    if (this.files.length === 1) die(`You can't delete the last file in this ${this.type}.`)

    const file = this.getFile(filePath) || die("File not found.")

    if (shouldConfirm === CONFIRM) {
      if (!confirm(`Really remove file '${file.file}'?`)) return undefined
    }

    // console.warn("before:", { activeImports: this.activeImports })
    // Tell the server to delete the file, which returns the updated index.
    try {
      const newIndex = await $fetch<ProjectManifest>({
        url: `/api/projects/remove/file`,
        method: "DELETE",
        contents: {
          projectId: this.projectId,
          filePath
        },
        requestFormat: REQUEST_FORMAT_JSON,
        format: "json"
      })
      this.contents = newIndex
    } catch (e) {
      die("Server error deleting file", e)
    }
    // throw if file is still found
    if (this.getFile(filePath)) die("Server didn't delete the file.")

    // Have the file clean itself up in a tick
    // (doing it immediately causes react to barf)
    setTimeout(() => file.onRemove(), 10)

    return true
  }

  //-----------------
  //  Debug
  //-----------------
  toString(): string {
    return `${this.constructor.name}: ${this.path}`
  }
}

global.SpellProject = SpellProject
