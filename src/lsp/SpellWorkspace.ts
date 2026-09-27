import { basename } from "path"
import { fileURLToPath, pathToFileURL } from "url"

import { SP } from "~/languages/spell"
import { installDiskFetch, locationForDiskPath } from "~/server/disk-fetch"
import type { LSP } from "~/lsp"

/**
 * The spell projects an editor has open, hosted on `SP.SpellProject` / `SP.SpellFile` loading from disk.
 * - Maps editor document URIs <=> `SpellFile`s.
 *   A file's project is its nearest `.imports.json` folder -- see `locationForDiskPath()`.
 * - Open documents' text wins over disk:  it goes into `file.contents`,
 *   then re-parses as little as possible through `project.updatedContentsFor()`, as the app's editor does.
 * - Every method that changes anything returns the spell files whose parse changed,
 *   so the server can publish their diagnostics.
 * - SIDE EFFECT (constructor):  makes EVERY `LoadableFile` load from disk -- see `installDiskFetch()`.
 * - NOTE: `SpellProject` / `SpellFile` are process-wide singletons, so one workspace per process.
 */
export class SpellWorkspace {
  /** Latest text of each open document, by URI. */
  #openText = new Map<string, string>()
  /** URI for each file we've mapped, by `file.path` -- the one the editor sent, if it has one. */
  #uriByPath = new Map<string, string>()
  /** `SpellFile` for each URI we've mapped, or `null` if it isn't one. */
  #fileByUri = new Map<string, SP.SpellFile | null>()
  /** First full parse of each project we've seen:  resolves once it's done, successfully or not. */
  #firstParses = new Map<SP.SpellProject, Promise<void>>()
  /** Why each project's last full parse failed, if it did, e.g. a rule crashed. */
  readonly problems = new Map<SP.SpellProject, string>()

  /** SIDE EFFECT:  `installDiskFetch()`. */
  constructor() {
    installDiskFetch()
  }

  ////////////////
  // ## Files
  ////////////////

  /** Projects we've loaded, in the order we met them. */
  get projects(): SP.SpellProject[] {
    return [...this.#firstParses.keys()]
  }

  /** Spell files `project` parses:  its active `.spell` imports, in order. */
  spellFiles(project: SP.SpellProject): SP.SpellFile[] {
    return project.activeImports.filter((file): file is SP.SpellFile => file instanceof SP.SpellFile)
  }

  /** Does `file`'s project parse it, i.e. is it active in `.imports.json`? */
  isActive(file: SP.SpellFile): boolean {
    return this.spellFiles(file.project).includes(file)
  }

  /**
   * `SpellFile` for document `uri`, or `undefined` if it isn't a `.spell` file on disk we can place in a project.
   * - Cached per URI:  finding the project looks for `.imports.json` up the folder tree.
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
  uriFor(file: SP.SpellFile): string {
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
    const changed = await this.applyText(file, this.#openText.get(uri) ?? text)
    return isFirst ? this.spellFiles(project) : changed
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
   * - `.imports.json`, or a `.spell` file appearing / disappearing:  the file list may have changed,
   *   so the project re-reads its index and parses from scratch.
   * - A `.spell` file that isn't open:  reloads it.  An open one keeps the editor's text.
   */
  async diskChanged(uri: string, change: LSP.DiskChange): Promise<SP.SpellFile[]> {
    const path = uri.startsWith("file:") ? fileURLToPath(uri) : undefined
    const location = path ? locationForDiskPath(path) : undefined
    if (!path || !location) return []
    const project = new SP.SpellProject(location.projectId)
    if (!this.#firstParses.has(project)) return []

    if (basename(path) === ".imports.json" || (location.extension === ".spell" && change !== "changed")) {
      this.#fileByUri.clear()
      return this.refresh(project)
    }
    if (location.extension !== ".spell" || this.#openText.has(uri)) return []
    return this.reloadFromDisk(new SP.SpellFile(location.path))
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

  /** Parse `project` (from scratch unless its incremental parse is good), recording any failure in `problems`. */
  private async parseProject(project: SP.SpellProject): Promise<void> {
    try {
      await project.parse()
      this.problems.delete(project)
    } catch (error) {
      this.problems.set(project, error instanceof Error ? error.message : String(error))
    }
  }

  /** Re-read `project`'s index -- which drops its incremental parse -- and parse it from scratch. */
  private async refresh(project: SP.SpellProject): Promise<SP.SpellFile[]> {
    await project.reload(undefined).catch(() => undefined)
    await this.parseProject(project)
    return this.spellFiles(project)
  }

  /** Reload `file` from disk and re-parse whatever that changes. */
  private async reloadFromDisk(file: SP.SpellFile): Promise<SP.SpellFile[]> {
    try {
      await file.reload(undefined)
    } catch {
      return []
    }
    return this.applyText(file, file.contents ?? "")
  }

  /**
   * `file` now has `text`:  re-parse as little as possible, and return the spell files whose parse changed.
   * - A file its project doesn't parse just takes the text, so it's there if it becomes active.
   * - If the incremental parse couldn't cope, `updatedContentsFor()` dropped it:  parse from scratch.
   */
  private async applyText(file: SP.SpellFile, text: string): Promise<SP.SpellFile[]> {
    const { project } = file
    if (file.contents !== text) file.contents = text
    if (!this.isActive(file)) return [file]

    const before = new Map(this.spellFiles(project).map((it) => [it, it.match]))
    project.updatedContentsFor(file)
    if (!project.incremental) await this.parseProject(project)
    return this.spellFiles(project).filter((it) => it.match !== before.get(it))
  }
}
