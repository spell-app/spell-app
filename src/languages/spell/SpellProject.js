import global from "global"
// import { observable, computed } from "mobx"

import {
  JSON5File,
  state,
  forward,
  memoize,
  writeOnce,
  memoizeForProp,
  $fetch,
  CONFIRM,
  TaskList,
  Task,
  getDier
} from "~/util"
import { ProjectScope } from "~/parser"
import { SpellParser, SpellLocation, SpellFile, SpellCSSFile, SpellJSFile } from "~/languages/spell"
import { spellCore } from "~/spellCore"

/**
 * Controller for a `SpellProject`.
 *
 * Note that these are singleton instances --
 * you'll always get the same object back for a given `path`.
 */
export class SpellProject extends JSON5File {
  /** Registry of known instances. */
  static registry = new Map()
  constructor(path) {
    // Return immediately from registry if already present.
    const existing = SpellProject.registry.get(path)
    if (existing) return existing

    super({ path })
    if (!this.location.isProjectPath) {
      throw new TypeError(`new SpellProject('${path}'): Must be initialized with project path.`)
    }
    SpellProject.registry.set(path, this)
  }

  /** We've been removed from the server -- clean up memory, etc.. */
  onRemove() {
    super.onRemove()
    // eslint-disable-next-line no-unused-expressions
    this.files.forEach((file) => file.onRemove())
    SpellProject.registry.clear(this.path)
  }

  @writeOnce path

  /**
   * Immutable `location` object which we use to get various bits of the path.
   *
   * Note that we `forward` lots of methods on the location object to this object,
   * so you can say `project.projectName` rather than `project.location.projectName`.
   */
  @forward(
    //
    "projectId",
    "owner",
    "projectName",
    "isSystemProject",
    "isUserProject"
  )
  @memoize
  get location() {
    return new SpellLocation(this.path)
  }

  @forward("type", "Type")
  @memoize
  get projectRoot() {
    return new SpellProjectRoot(this.location.projectRoot)
  }

  //-----------------
  //  Compilation
  //-----------------

  /** Parser use for our last parse/compile. */
  @state scope = undefined

  /** Last compiled result as a javascript string. */
  @state compiled = undefined

  @memoize
  get outputFile() {
    const location = this.getFileLocation(".output.js")
    return new SpellJSFile(location.path)
  }

  /** Reset our compiled state. */
  resetCompiled() {
    this.resetState("scope", "compiled")
  }

  parse(parser) {
    this.parser.cancel()
    return this.parser.start(parser)
  }
  compile(parser) {
    this.parser.cancel()
    this.compiler.cancel()
    return this.compiler.start(parser)
  }

  /**
   * Return base project scope, given a `parentScope`.
   * TODOC...
   */
  getScope(parentScope = SpellParser.rootScope) {
    // Make a parser that depends on the parentScope's parser
    // This way rules added to the project won't leak out.
    const parser = parentScope.parser.clone({ module: this.path })
    return new ProjectScope({
      name: this.projectName,
      path: this.path,
      parser,
      scope: parentScope
    })
  }

  /**
   * Return a TaskList we can use to parse our imports.
   * Call as `project.parser.start(parentScope?)`
   */
  @memoize
  get parser() {
    return new TaskList({
      name: `Parsing ${this.type}: ${this.projectName}`,
      tasks: [
        new Task({
          name: `Loading ${this.type}`,
          run: (parentScope) => {
            this.resetCompiled()
            const scope = this.getScope(parentScope)
            this.setState("scope", scope)
            return this.load()
          }
        }),
        TaskList.forEach({
          name: `Parsing imports`,
          list: () => this.activeImports,
          getTask: (file) =>
            new Task({
              name: `Parsing import: ${file.file}`,
              run: () => file.parse(this.scope)
            })
        })
      ]
    })
  }

  /**
   * Return a TaskList we can use to `compile()` our imports.
   * Call as `project.compiler.start(parentScope?)`
   */
  @memoize
  get compiler() {
    return new TaskList({
      debug: true,
      name: `Compiling ${this.type}: ${this.projectName}`,
      tasks: [
        this.parser,
        TaskList.forEach({
          name: `Compiling imports`,
          list: () => this.activeImports,
          getTask: (file) =>
            new Task({
              name: `Compiling import: ${file.file}`,
              run: () => file.compile()
            })
        }),
        new Task({
          name: "Combining output",
          run: (allCompiled) => {
            const compiled = allCompiled.join("\n// -----------\n")
            this.setState("compiled", compiled)
            return compiled
          }
        }),
        new Task({
          name: "Saving compiled output",
          run: async (compiled) => {
            this.outputFile.setContents(compiled)
            return await this.outputFile.save()
          }
        })
      ]
    })
  }

  /**
   * Execute our `compiled` code. No-op if not compiled.
   * Returns compiled module `exports` or `error` on JS error.
   */
  static runAsImport = true // `false` to run by script injection
  async executeCompiled() {
    if (!this.compiled) return

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
      // Use `?<timestamp>` to create a unique URL each time
      this.exports = await import(this.outputFile.url + `?${Date.now()}`)
      return this.exports
    } catch (e) {
      if (Error.captureStackTrace) Error.captureStackTrace(e, this.executeCompiled)
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
  updatedContentsFor(file) {
    this.activeImports.forEach((item) => item.resetCompiled())
  }

  //-----------------
  //  Loading / contents
  //-----------------

  /** Derive `url` from our path if not explicitly set. */
  get url() {
    return `/api/projects/index/${this.projectId}`
  }

  /**
   * HACK HACK HACK
   * When our `contents` are updated,
   * immediately re-calculate derived properties below
   * to try to avoid react-easy-state rendering errors  :-(
   */
  onContentsUpdated() {
    // eslint-disable-next-line no-unused-vars
    const { manifest, files, imports, activeImports } = this
  }

  /**
   * Load our index if necesssary, calling `die()` if something goes wrong.
   */
  async loadOrDie(die) {
    if (this.isLoaded) return
    try {
      this.load()
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
  @memoizeForProp("contents")
  get manifest() {
    if (!this.contents?.manifest) return {}
    // add useful stuff to manifest entries
    Object.entries(this.contents.manifest).forEach(([path, entry]) => {
      entry.path = path
      entry.location = new SpellLocation(path)
      entry.file = SpellProject.getFileForPath(path)
    })
    return this.contents.manifest
  }

  /**
   * Return pointers to all `SpellFiles` in our mainfest.
   * Returns `[]` if we're not loaded.
   */
  @memoizeForProp("contents")
  get files() {
    return Object.values(this.manifest).map((item) => item.file)
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
  @memoizeForProp("contents")
  get imports() {
    if (!this.contents?.imports) return []
    return this.contents.imports.map(({ path, active, contents }) => {
      const location = SpellLocation.getFileLocation(this.projectId, path)
      const file = SpellProject.getFileForPath(location.path)
      if (contents !== undefined) file.setContents(contents)
      return {
        path: location.path,
        active,
        location,
        file
      }
    })
  }

  /**
   * Return array of `SpellFile` (etc) objects from our `active` imports.
   * Returns `[]` if we're not loaded or index is malformed.
   */
  @memoizeForProp("contents")
  get activeImports() {
    const { manifest } = this
    return this.imports //
      .filter((item) => item.active)
      .map((item) => manifest[item.path]?.file)
  }

  //-----------------
  //  Project file access
  //-----------------

  /** Given the `fullPath` to a file, return a `SpellFile` or `SpellCSSFile` etc. */
  static getFileForPath(fullPath) {
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
    const Constructor = SpellProject.extensionMap[location.extension] || SpellProject.extensionMap.default
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
  getFileLocation(path) {
    let location
    if (path instanceof SpellLocation) {
      location = path
    } else if (typeof path === "string") {
      if (path.startsWith("@")) location = SpellLocation.getFileLocation(path)
      else location = SpellLocation.getFileLocation(this.projectId, path)
    }
    if (location?.isFilePath) return location
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
  getFileInfo(filePath) {
    const location = this.getFileLocation(filePath)
    if (location) return this.manifest[location.path]
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
  getFile(filePath) {
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
  async createFile(filePath, contents, newFileName = "Untitled.spell", die) {
    if (!die) die = getDier(this, "creating file", { projectId: this.projectId, filePath })

    if (!filePath) filePath = prompt("Name for the new file?", newFileName)
    if (!filePath) return undefined
    die.params.filePath = filePath

    await this.loadOrDie(die)
    if (this.getFile(filePath)) die("File already exists.")

    // Tell the server to create the file, which returns updated index
    try {
      const newIndex = await $fetch({
        url: `/api/projects/create/file`,
        contents: {
          projectId: this.projectId,
          filePath,
          contents: contents ?? `## This space intentionally left blank`
        },
        requestFormat: "json",
        format: "json"
      })
      this.setContents(newIndex)
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
  async duplicateFile(filePath, newFilePath) {
    const die = getDier(this, "duplicating file", {
      projectId: this.projectId,
      originalFilePath: filePath,
      filePath: newFilePath
    })
    await this.loadOrDie(die)

    const file = this.getFile(filePath) || die("File not found.")
    let contents
    try {
      contents = await file.load()
    } catch (e) {
      die("Server error loading file", e)
    }
    return this.createFile(newFilePath, contents, file.file, die)
  }

  /**
   * Rename an existing file.
   * Returns new file.
   */
  async renameFile(filePath, newFilePath) {
    const die = getDier(this, "renaming file", { projectId: this.projectId, filePath, newFilePath })
    await this.loadOrDie(die)
    const file = this.getFile(filePath) || die("File not found.")

    if (!newFilePath) {
      const filename = prompt("New name for the file?", file.file)
      if (!filename) return undefined
      newFilePath = SpellLocation.getFileLocation(this.projectId, filename).filePath
      if (newFilePath === filePath) return undefined
      die.params.newFilePath = newFilePath
    }
    if (this.getFile(newFilePath)) die("New file already exists.")

    // Tell the server to rename the file, which returns the updated index.
    try {
      const newIndex = await $fetch({
        url: `/api/projects/rename/file`,
        contents: {
          projectId: this.projectId,
          filePath,
          newFilePath
        },
        requestFormat: "json",
        format: "json"
      })
      this.setContents(newIndex)
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
  async deleteFile(filePath, shouldConfirm) {
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
      const newIndex = await $fetch({
        url: `/api/projects/remove/file`,
        method: "DELETE",
        contents: {
          projectId: this.projectId,
          filePath
        },
        requestFormat: "json",
        format: "json"
      })
      this.setContents(newIndex)
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
  toString() {
    return `${this.constructor.name}: ${this.path}`
  }
}

global.SpellProject = SpellProject
