import global from "global"
// import { observable, computed } from "mobx"

import {
  LoadableManager,
  state,
  forward,
  memoize,
  writeOnce,
  $fetch,
  OPTIONAL,
  REQUIRED,
  CONFIRM,
  TaskList,
  Task
} from "../../util"
import { SpellParser, Scope } from "."
import { SpellFileLocation } from "./SpellFileLocation"
import { SpellProjectManifest } from "./SpellProjectManifest"
import { SpellProjectIndex } from "./SpellProjectIndex"
/**
 * Controller for a `SpellProject`.
 *
 * Note that these are singleton instances --
 * you'll always get the same object back for a given `path`.
 */
export class SpellProject extends LoadableManager {
  /** Registry of known instances. */
  static registry = new Map()
  constructor(path) {
    // Create instance if not already present in registry
    if (!SpellProject.registry.has(path)) {
      const instance = super({ path })
      if (!instance.location.isValidProjectPath)
        throw new TypeError(`SpellProjectManifest initialized with invalid path '${this.path}'`)
      SpellProject.registry.set(path, instance)
    }
    return SpellProject.registry.get(path)
  }

  /** We've been removed from the server -- clean up memory, etc.. */
  onRemove() {
    super.onRemove()
    this.manifest.onRemove()
    this.index.onRemove()
    SpellProject.registry.clear(this.path)
  }

  /**
   * Project path as `/project/<projectId>` or `/library/<projectId>`.
   * MUST be passed to constructor.
   */
  @writeOnce path

  /**
   * Immutable `location` object which we use to get various bits of the path.
   *
   * Note that we `forward` lots of methods on the location object to this object,
   * so you can say `project.projectName` rather than `project.location.projectName`.
   */
  @forward("projectType", "projectName", "projectPath", "isLibraryProject", "isUserProject")
  @memoize
  get location() {
    return new SpellFileLocation(this.path)
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
    return new Scope.Project({
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
          run: parentScope => {
            this.resetCompiled()
            const scope = this.getScope(parentScope)
            this.set("_state.scope", scope)
            return this.load()
          }
        }),
        TaskList.forEach({
          name: `Parsing imports`,
          list: () => this.activeImports,
          getTask: file =>
            new Task({
              name: `Parsing import: ${file.fileName}`,
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
          getTask: file =>
            new Task({
              name: `Compiling import: ${file.fileName}`,
              run: () => file.compile()
            })
        }),
        new Task({
          name: "Combining output",
          run: allCompiled => {
            const compiled = allCompiled.join("\n// -----------\n")
            this.set("_state.compiled", compiled)
            return compiled
          }
        })
      ]
    })
  }

  /**
   * One of our `file`s has updated its contents.
   * Have it, and any files after it, `resetCompiled()`.
   */
  updatedContentsFor(file) {
    const imports = this.activeImports
    const index = imports.indexOf(file)
    if (index !== -1) imports.slice(index).forEach(it => it.resetCompiled())
  }

  //-----------------
  //  Loading
  //-----------------

  /**
   * Return our manifest file.
   * Also `spellProject.filePaths` and `spellProject.files`.
   */
  @forward("filePaths", "files")
  @memoize
  get manifest() {
    return new SpellProjectManifest(this.path)
  }

  /**
   * Return our index file.
   * Also `spellProject.imports` and `spellProject.activeImports` to import setup.
   */
  @forward("imports", "activeImports")
  @memoize
  get index() {
    return new SpellProjectIndex(this.path)
  }

  /** Return the files we load automatically when we load.  */
  get loadables() {
    return [this.manifest, this.index]
  }

  //-----------------
  //  Project file access
  //-----------------

  /** Given a path, make sure it's relative to this project. */
  getFilePath(path) {
    if (typeof path !== "string") throw new TypeError(`getFilePath('${path}'): must pass a string`)
    if (!path.startsWith("/")) path = `${this.projectPath}/${path}`
    return path
  }

  /**
   * Synchronously get one of our files by `path`.
   * If `path` doesn't start with a `/`, we'll assume it's a local file path.
   * Returns `undefined` if file not found or manifest is not loaded.
   */
  getFile(path = "", required = OPTIONAL) {
    path = this.getFilePath(path)
    const file = this.files?.find(f => f.path === path)
    if (!file && required === REQUIRED) throw new TypeError(`spellProject.getFile("${path}"): file not found.`)
    return file
  }

  /**
   * Return manifest `info` for a file specified by `path`.
   * If `path` doesn't start with a `/`, we'll assume it's a local file path.
   * Returns `undefined` if file not found or manifest is not loaded.
   */
  getFileInfo(path = "", required = OPTIONAL) {
    path = this.getFilePath(path)
    const fileInfo = this.manifest.contents.files?.find(f => f.path === path)
    if (!fileInfo && required === REQUIRED) throw new TypeError(`spellProject.getFileInfo("${path}"): file not found.`)
    return fileInfo
  }

  /** Asynchronously load file by `path` (or `filename` if path doesn't start with slash). */
  async loadFile(path) {
    await this.load()
    return this.getFile(path, REQUIRED).load()
  }

  //-----------------
  //  Project file manipulation
  //-----------------

  /** Create a new project. */
  async createFile(path, contents) {
    if (!path) path = prompt("Name for the new file?", "Untitled.spell")
    if (!path) return undefined
    path = this.getFilePath(path)
    const location = new SpellFileLocation(path)
    if (!location.isValidFilePath) throw new TypeError(`Error in createFile: path '${path}' is invalid.`)

    if (typeof contents !== "string") contents = `## File ${location.fileName}`
    if (this.getFile(path)) throw new TypeError(`Error in createFile: file '${path}' already exists.`)

    // Tell the server to create the file
    await $fetch({
      url: "/api/projects/create/file",
      contents: { path, contents },
      requestFormat: "json"
    })
    // Reload the projectList and return the file
    await this.reload()
    return this.getFile(path, REQUIRED, `Error in createFile: server didn't create file '${path}'.`)
  }

  /** Duplicate an existing file. */
  async duplicateFile(path, newPath) {
    path = this.getFilePath(path)
    const file = this.getFile(path, REQUIRED, `Error in duplicateFile: file '${path}' does not exist.`)

    if (!newPath) newPath = prompt("Name for the new file?", file.fileName)
    if (!newPath) return undefined
    newPath = this.getFilePath(newPath)
    if (this.getFile(newPath)) throw new TypeError(`Error in duplicateFile: file '${newPath} already exists.`)

    const contents = await file.load()
    return this.createFile(newPath, contents)
  }

  /**
   * Remove an existing file from the project.
   * Returns `true` on success, `false` if cancelled or throws on error.
   */
  async removeFile(path, shouldConfirm) {
    const file = this.getFile(path, REQUIRED, `Error in removeFile: file '${path}' not found.`)
    if (shouldConfirm === CONFIRM) {
      if (!confirm(`Really remove file '${file.fileName}'?`)) return undefined
    }

    // Tell the server to delete the file
    await $fetch({
      url: "/api/projects/delete/file",
      method: "DELETE",
      contents: { path: file.path },
      requestFormat: "json"
    })
    // Have the file clean itself up
    file.onRemove()
    // reload the file list and make sure the file is no longer available
    await this.reload()
    if (this.getFile(path)) throw new TypeError(`removeFile('${path}'): server didn't delete the file`)
    return true
  }

  /** Rename an existing file. */
  async renameFile(path, newPath) {
    await this.duplicateFile(path, newPath)
    await this.removeFile(path)
    return this.getFile(newPath, REQUIRED, `Error in enameFile: server didn't rename file to '${newPath}'`)
  }
}

global.SpellProject = SpellProject
