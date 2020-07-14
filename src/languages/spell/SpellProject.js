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
  OPTIONAL,
  REQUIRED,
  CONFIRM,
  TaskList,
  Task
} from "~/util"
import { ProjectScope } from "~/parser"
import { spellCore, SpellParser, SpellPath, SpellFile, SpellCSSFile } from "~/languages/spell"

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
    "projectDomain",
    "projectName",
    "isSystemProject",
    "isUserProject",
    "getProjectFile"
  )
  @memoize
  get location() {
    return new SpellPath(this.path)
  }

  //-----------------
  //  Compilation
  //-----------------

  /** Parser use for our last parse/compile. */
  @state scope = undefined

  /** Last compiled result as a javascript string. */
  @state compiled = undefined

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
      name: `Parsing project: ${this.projectName}`,
      tasks: [
        new Task({
          name: "Loading project",
          run: (parentScope) => {
            this.resetCompiled()
            const scope = this.getScope(parentScope)
            this.set("_state.scope", scope)
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
      name: `Compiling project: ${this.projectName}`,
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
            this.set("_state.compiled", compiled)
            return compiled
          }
        })
      ]
    })
  }

  /* Execute our `compiled` code. No-op if not compiled. */
  executeCompiled() {
    const { compiled } = this
    if (!compiled) return

    console.group("attempting to execute compiled output:")

    // Reset spellcore RUNTIME for this run
    spellCore.resetRuntime()

    // Output javascript with line numbers
    console.groupCollapsed("javascript")
    const lines = compiled
      .split("\n")
      .map((line, lineNum) => `${lineNum}`.padStart(4, " ") + `  ${line}`)
      .join("\n")
    console.info(lines)
    console.groupEnd()

    // add all types to `global` for local hacking
    try {
      const scriptEl = document.createElement("script")
      scriptEl.setAttribute("id", "compileOutput")
      scriptEl.setAttribute("type", "module")
      scriptEl.innerHTML = compiled

      const existingEl = document.getElementById("compileOutput")

      if (existingEl) {
        existingEl.replaceWith(scriptEl)
      } else {
        document.body.append(scriptEl)
      }
    } catch (e) {
      console.error("error evaling output:", e)
    }
    // groupEnd() in a tick after contents execute
    setTimeout(() => console.groupEnd(), 100)
  }

  /**
   * One of our `file`s has updated its contents.
   * Have all of our files `resetCompiled()` so they'll compile again.
   */
  updatedContentsFor(file) {
    this.activeImports.forEach((file) => file.resetCompiled())
  }

  //-----------------
  //  Loading / contents
  //-----------------

  /** Derive `url` from our path if not explicitly set. */
  get url() {
    return `/api/projects/index/${this.projectId}`
  }

  /**
   * Return the `manifest` map from our `contents`.
   * Returned objects will also have `path` and `file` pointer to `SpellFile` (etc) for that path.
   * Returns `{}` if not loaded or index is malformed.
   */
  @memoizeForProp("contents")
  get manifest() {
    if (!this.contents?.manifest) return {}
    for (const [path, entry] of Object.entries(this.contents.manifest)) {
      entry.path = path
      entry.file = SpellProject.getFileForPath(path)
    }
    return this.contents.manifest
  }

  /**
   * Return paths of usable files from our mainfest.
   * Returns `[]` if we're not loaded or index is malformed.
   */
  @memoizeForProp("manifest")
  get filePaths() {
    return Object.keys(this.manifest)
  }

  /**
   * Return pointers to all `SpellFiles` in our mainfest.
   * Returns `[]` if we're not loaded.
   */
  @memoizeForProp("filePaths")
  get files() {
    return this.filePaths.map(SpellProject.getFileForPath)
  }

  /**
   * Return the full `imports` list from our `contents`, including inactive items.
   * Returns `[]` if not loaded or index is malformed.
   */
  @memoizeForProp("contents")
  get imports() {
    return this.contents?.imports || []
  }

  /**
   * Return array of `SpellFile` (etc) objects from our active imports.
   * Returns `[]` if we're not loaded or index is malformed.
   */
  @memoizeForProp("imports")
  get activeImports() {
    return this.imports //
      .filter((item) => item.active)
      .map((item) => SpellProject.getFileForPath(item.path))
  }

  //-----------------
  //  Project file access
  //-----------------

  /** Given the `fullPath` to a file, return a `SpellFile` or `SpellCSSFile` etc. */
  static getFileForPath(fullPath) {
    const path = new SpellPath(fullPath)
    if (!path.isFilePath) throw new TypeError(`SpellProject.getFileForPath('${fullPath}'): path is not a file path.`)
    if (path.extension === ".css") return new SpellCSSFile(fullPath)
    return new SpellFile(fullPath)
  }

  /**
   * Give a `path`as:
   * - `fullPath`, e.g. `@user:projects:project/file.spell`
   * - `filePath`, e.g. `file.spell` or `/file.spell`
   * - `SpellPath` for a file
   * return the `SpellPath` for the file.
   *
   * Returns `undefined` if not found.
   * Throws if path is not a valid file path.
   */
  getFilePath(path) {
    if (typeof path === "string") {
      if (path.startsWith("@")) return SpellPath.getFilePath(path)
      return SpellPath.getFilePath(this.projectId, path)
    }
    if (path instanceof SpellPath) {
      if (!path.isFilePath) throw new TypeError(`getFilePath(): must be a file path.`)
      return path
    }
    throw new TypeError(`getFilePath(): typeof path not understood: '${path}'.`)
  }

  /**
   * Synchronously return manifest `info` for a file specified by `filePath`.
   * `filePath` can be any of:
   * - `fullPath`, e.g. `@user:projects:project/file.spell`
   * - `filePath`, e.g. `file.spell` or `/file.spell`
   * - `SpellPath` for a file
   *
   * Returns `undefined` if file not found or manifest is not loaded.
   * Pass `required = REQUIRED` to throw if not found.
   */
  getFileInfo(filePath, required = OPTIONAL, message = `File '${filePath}' not found`) {
    const { path } = this.getFilePath(filePath)
    const fileInfo = this.manifest[path]
    if (!fileInfo && required === REQUIRED) throw new TypeError(message)
    return fileInfo
  }

  /**
   * Synchronously get one of our files as a `SpellFile` or `SpellCSSFile` etc.
   * `filePath` can be any of:
   * - `fullPath`, e.g. `@user:projects:project/file.spell`
   * - `filePath`, e.g. `file.spell` or `/file.spell`
   * - `SpellPath` for a file
   *
   * Returns `undefined` if file not found or manifest is not loaded.
   * Pass `required = REQUIRED` to throw if not found.
   */
  getFile(filePath, required = OPTIONAL, message) {
    const info = this.getFileInfo(filePath, required, message)
    return info?.file
  }

  /** Asynchronously load file by `path` (or `filename` if path doesn't start with `@`). */
  async loadFile(path) {
    await this.load()
    return this.getFile(path, REQUIRED).load()
  }

  //-----------------
  //  Project file manipulation
  //-----------------

  /**
   * Create a new file within this project.
   * `filePath` is a relative to this project, and may or may not start with `/`.
   * NOTE: in theory this handles nested files.
   */
  async createFile(filePath, contents, newFileName = "Untitled.spell") {
    if (!filePath) filePath = prompt("Name for the new file?", newFileName)
    if (!filePath) return undefined

    await this.load()
    if (this.getFile(filePath)) throw new TypeError(`createFile(): file '${filePath} already exists.`)

    // Tell the server to create the file
    await $fetch({
      url: `/api/projects/create/file`,
      contents: {
        projectId: this.projectId,
        filePath,
        contents: contents ?? `## This space intentionally left blank`
      },
      requestFormat: "json"
    })

    // Reload the project and return the file
    await this.reload()
    return this.getFile(filePath, REQUIRED, `createFile(): server didn't create file '${filePath}'.`)
  }

  /**
   * Duplicate an existing file.
   * Returns pointer to new file.
   */
  async duplicateFile(filePath, newFilePath) {
    await this.load()
    const file = this.getFile(filePath, REQUIRED, `duplicateFile(): file '${filePath}' does not exist.`)
    const contents = await file.load()
    return this.createFile(newFilePath, contents, file.file)
  }

  /**
   * Rename an existing file.
   * Returns new file.
   */
  async renameFile(filePath, newFilePath) {
    await this.load()
    const file = this.getFile(filePath, REQUIRED, `renameFile(): file '${filePath}' does not exist.`)

    if (!newFilePath) newFilePath = prompt("New name for the file?", file.file)
    if (!newFilePath) return undefined
    if (this.getFile(newFilePath)) throw new TypeError(`renameFile(): file '${newFilePath} already exists.`)

    // Tell the server to create the file
    await $fetch({
      url: `/api/projects/rename/file`,
      contents: {
        projectId: this.projectId,
        filePath,
        newFilePath
      },
      requestFormat: "json"
    })
    // Reload the project and return the new file
    await this.reload()
    return this.getFile(newFilePath, REQUIRED, `renameFile(): server didn't create '${newFilePath}'.`)
  }

  /**
   * Remove an existing file from the project.
   * Returns `true` on success, `undefined` if cancelled or throws on error.
   */
  async removeFile(filePath, shouldConfirm) {
    await this.load()
    const file = this.getFile(filePath, REQUIRED, `removeFile(): file '${filePath}' not found.`)
    if (shouldConfirm === CONFIRM) {
      if (!confirm(`Really remove file '${file.file}'?`)) return undefined
    }

    // Tell the server to delete the file
    await $fetch({
      url: `/api/projects/remove/file`,
      method: "DELETE",
      contents: {
        projectId: this.projectId,
        filePath
      },
      requestFormat: "json"
    })
    // Have the file clean itself up
    file.onRemove()

    // reload the file list and make sure the file is no longer available
    await this.reload()
    if (this.getFile(filePath)) throw new TypeError(`removeFile('${filePath}'): server didn't delete the file.`)
    return true
  }
}

global.SpellProject = SpellProject
