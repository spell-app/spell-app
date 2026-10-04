import { writeFileSync } from "fs"
import { basename } from "path"
import { fileURLToPath, pathToFileURL } from "url"

import { SP } from "$/spell"
import { installDiskFetch, locationForDiskPath } from "$/spell/node/disk-fetch"
import { LSP } from "$/lsp"

/**
 * The stdio language server's view of the editor's files, hosted on `SP.SpellProject` / `SP.SpellFile` loading from disk.
 * - Maps editor document URIs <=> `SpellFile`s (`LSP.FileAddresses`).
 *   A file's project is its nearest `project.json` folder -- see `locationForDiskPath()`.
 * - Open documents' text wins over disk:  it goes through `project.updateText()`, as the app's editor's does.
 * - Every method that changes anything returns the spell files whose parse changed,
 *   so the server can publish their diagnostics.
 * - SIDE EFFECT (constructor):  makes EVERY `LoadableFile` load from disk -- see `installDiskFetch()`.
 * - NOTE: node-only, so deliberately NOT in the `$/lsp` barrel:  import it from this file.
 */
export class SpellDiskWorkspace implements LSP.FileAddresses {
  /** Latest text of each open document, by URI. */
  #openText = new Map<string, string>()
  /** URI for each file we've mapped, by `file.path` -- the one the editor sent, if it has one. */
  #uriByPath = new Map<string, string>()
  /** `SpellFile` for each URI we've mapped, or `null` if it isn't one. */
  #fileByUri = new Map<string, SP.SpellFile | null>()
  /** First full parse of each project we've seen:  resolves once it's done, successfully or not. */
  #firstParses = new Map<SP.SpellProject, Promise<void>>()

  /** SIDE EFFECT:  `installDiskFetch()`. */
  constructor() {
    installDiskFetch()
  }

  ////////////////
  // ## Files
  ////////////////

  /**
   * `SpellFile` for document `uri`, or `undefined` if it isn't a `.spell` file on disk we can place in a project.
   * - Cached per URI:  finding the project looks for `project.json` up the folder tree.
   */
  fileFor(uri: string): SP.SpellFile | undefined {
    let file = this.#fileByUri.get(uri)
    if (file === undefined) {
      const location = uri.startsWith("file:") ? locationForDiskPath(fileURLToPath(uri)) : undefined
      file = location?.extension === ".spell" ? new SP.SpellFile(location.path) : null
      this.#fileByUri.set(uri, file)
      if (file) this.#uriByPath.set(file.path, uri)
    }
    return file ?? undefined
  }

  /** URI for `file`:  the one the editor sent, else its `file:` URL on disk. */
  uriFor(file: SP.SpellFile | SP.SpellJSFile): string {
    let uri = this.#uriByPath.get(file.path)
    if (!uri) {
      uri = pathToFileURL(file.location.serverPath).href
      this.#uriByPath.set(file.path, uri)
    }
    return uri
  }

  ////////////////
  // ## Changes
  ////////////////

  /**
   * Document `uri` opened, or changed, to `text`.
   * - The first file of a project parses that whole project from disk, then applies `text`.
   * - Returns the spell files whose parse changed -- all of the project's, the first time.
   */
  async update(uri: string, text: string): Promise<SP.SpellFile[]> {
    const file = this.fileFor(uri)
    if (!file) return []
    this.#openText.set(uri, text)
    const { project } = file
    const isFirst = !this.#firstParses.has(project)
    await this.parseOnce(project)
    // Another change may have come in while we waited:  apply the latest.
    const changed = await project.updateText(file, this.#openText.get(uri) ?? text)
    return isFirst ? project.spellFiles : changed
  }

  /** Document `uri` closed:  its file goes back to what's on disk. */
  async close(uri: string): Promise<SP.SpellFile[]> {
    const file = this.fileFor(uri)
    this.#openText.delete(uri)
    if (!file || !this.#firstParses.has(file.project)) return []
    return this.reloadFromDisk(file)
  }

  /**
   * A file changed on disk, e.g. a `git checkout`, or another editor saved it.
   * - `project.json`, or a `.spell` file appearing / disappearing:  the file list may have changed,
   *   so the project re-reads its index and parses from scratch.
   * - A `.spell` file that isn't open:  reloads it.  An open one keeps the editor's text.
   */
  async diskChanged(uri: string, change: LSP.DiskChange): Promise<SP.SpellFile[]> {
    const path = uri.startsWith("file:") ? fileURLToPath(uri) : undefined
    const location = path ? locationForDiskPath(path) : undefined
    if (!path || !location) return []
    const project = new SP.SpellProject(location.projectId)
    if (!this.#firstParses.has(project)) return []

    if (basename(path) === SP.PROJECT_FILE || (location.extension === ".spell" && change !== "changed")) {
      this.#fileByUri.clear()
      return this.refresh(project)
    }
    if (location.extension !== ".spell" || this.#openText.has(uri)) return []
    return this.reloadFromDisk(new SP.SpellFile(location.path))
  }

  /**
   * Parse `project` if we haven't yet, and keep it up to date from then on, as its files change on disk --
   * e.g. a project another one imports, which no open file belongs to.  See `diskChanged()`.
   */
  track(project: SP.SpellProject): Promise<void> {
    return this.parseOnce(project)
  }

  ////////////////
  // ## Scope packs
  ////////////////

  /**
   * Write `project`'s scope pack, `<Project>.scopes.js`, beside its compiled output -- see `LSP.ScopePack`.
   * - Parses -- and tracks -- each project it imports compiled first, to show their sources.
   * - Returns the path written.
   */
  async writeScopes(project: SP.SpellProject, explorer: LSP.ScopeExplorer): Promise<string> {
    await this.track(project)
    for (const imported of LSP.ScopeExplorer.importedProjects(project)) await this.track(imported)
    const compiled = project.outputFile.location.serverPath
    const path = compiled.slice(0, -SP.COMPILED_JS_SUFFIX.length) + SP.SCOPES_JS_SUFFIX
    writeFileSync(path, LSP.scopePackScript(explorer.exportPack(project)))
    return path
  }

  /** Parse `project` from scratch if we haven't yet.  Resolves once that's done, successfully or not. */
  private parseOnce(project: SP.SpellProject): Promise<void> {
    let firstParse = this.#firstParses.get(project)
    if (!firstParse) {
      firstParse = this.parseProject(project)
      this.#firstParses.set(project, firstParse)
    }
    return firstParse
  }

  /** Parse `project` (from scratch unless its incremental parse is good).  A crash is left in `project.parseError`. */
  private async parseProject(project: SP.SpellProject): Promise<void> {
    await project.parse().catch(() => undefined)
  }

  /** Re-read `project`'s index -- which drops its incremental parse -- and parse it from scratch. */
  private async refresh(project: SP.SpellProject): Promise<SP.SpellFile[]> {
    await project.reload(undefined).catch(() => undefined)
    await this.parseProject(project)
    return project.spellFiles
  }

  /** Reload `file` from disk and re-parse whatever that changes. */
  private async reloadFromDisk(file: SP.SpellFile): Promise<SP.SpellFile[]> {
    try {
      await file.reload(undefined)
    } catch {
      return []
    }
    return file.project.updateText(file, file.contents ?? "")
  }
}
