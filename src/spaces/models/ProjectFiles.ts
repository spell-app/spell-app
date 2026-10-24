import { CONFIRM, LoadableFile, getDier, KnownFormat } from "spell/util"
import { SP } from "spell-parser/spell"

/**
 * A project's FILE edits:  create, copy, rename and delete one of its files, as the editor asks.
 * - The editor calls these, never spell:  `SpellProject` only reads, compiles and saves (decision Q20).
 * - Each asks spaces' server (`/api/projects/create/file` ...), which answers the project's new index,
 *   and sets it as the project's `contents`, so its `files` follow at once.
 * - Asked through `LoadableFile.fetch`, as every file is read:  whoever answers files answers these,
 *   e.g. the editor's static build, which refuses them (`StaticFiles`).
 * - Each throws (through `getDier()`) with what it was doing, e.g. "renaming file", for the editor to show.
 * - A prompt you cancel returns `undefined`.
 * - It was `SpellProject`'s, until epic `people-and-orgs` P15.
 */
export class ProjectFiles {
  /**
   * Format of what the editor sends:  JSON, as `application/json`, so the server parses it.
   * - It was a bare `"json"`, which the server took for no body at all:
   *   every create, copy, rename and delete of a project or a file failed with "Path must be a string"
   *   (found in epic `people-and-orgs` P15).
   */
  static REQUEST_FORMAT_JSON = KnownFormat.json

  /** the project whose files these are */
  readonly project: SP.SpellProject

  constructor(project: SP.SpellProject) {
    this.project = project
  }

  /**
   * Create a new file within the project, and return it.
   * - `filePath` is relative to the project, and may or may not start with `/`.
   * - No `filePath`:  asks for one (`prompt()`), suggesting `newFileName`.
   * - NOTE: in theory this handles nested files.
   * - throws if the file is already there, or the server says no;  `undefined` if the prompt is cancelled
   */
  async create(
    filePath: string | undefined,
    contents: string | undefined,
    newFileName = "Untitled.spell",
    die?: ReturnType<typeof getDier>
  ): Promise<SP.AnySpellFile | undefined> {
    const { project } = this
    if (!die) die = getDier(project, "creating file", { projectId: project.projectId, filePath })

    if (!filePath) filePath = prompt("Name for the new file?", newFileName) ?? undefined
    if (!filePath) return undefined
    die.params.filePath = filePath

    await project.loadOrDie(die)
    if (project.getFile(filePath)) die("File already exists.")

    // Tell the server to create the file, which returns updated index
    try {
      project.contents = await LoadableFile.fetch<SP.ProjectManifestJSON5>({
        url: `/api/projects/create/file`,
        contents: {
          projectId: project.projectId,
          filePath,
          contents: contents ?? `## This space intentionally left blank`
        },
        requestFormat: ProjectFiles.REQUEST_FORMAT_JSON,
        format: "json"
      })
    } catch (e) {
      die("Server error creating file", e)
    }

    // Return the file
    return project.getFile(filePath) || die("Server didn't create file.")
  }

  /**
   * Copy an existing file, and return the copy.
   * - No `newFilePath`:  asks for one (`create()`).
   * - throws if the file isn't there, or the server says no
   */
  async duplicate(filePath: string, newFilePath: string | undefined): Promise<SP.AnySpellFile | undefined> {
    const { project } = this
    const die = getDier(project, "duplicating file", {
      projectId: project.projectId,
      originalFilePath: filePath,
      filePath: newFilePath
    })
    await project.loadOrDie(die)

    const file = project.getFile(filePath) || die("File not found.")
    let contents: string | undefined
    try {
      contents = await file.load(undefined)
    } catch (e) {
      die("Server error loading file", e)
    }
    return this.create(newFilePath, contents, file.file, die)
  }

  /**
   * Rename an existing file, keeping its place in the project's file order, and return the renamed file.
   * - No `newFilePath`:  asks for a new name (`prompt()`);  cancelled or unchanged:  `undefined`.
   * - throws if the file isn't there, the new one is, or the server says no
   */
  async rename(filePath: string, newFilePath?: string): Promise<SP.AnySpellFile | undefined> {
    const { project } = this
    const die = getDier(project, "renaming file", { projectId: project.projectId, filePath, newFilePath })
    await project.loadOrDie(die)
    const file = project.getFile(filePath) || die("File not found.")

    if (!newFilePath) {
      const filename = prompt("New name for the file?", file.file)
      if (!filename) return undefined
      newFilePath = SP.SpellLocation.getFileLocation(project.projectId, filename).filePath!
      if (newFilePath === filePath) return undefined
      die.params.newFilePath = newFilePath
    }
    if (project.getFile(newFilePath)) die("New file already exists.")

    // Tell the server to rename the file, which returns the updated index.
    try {
      project.contents = await LoadableFile.fetch<SP.ProjectManifestJSON5>({
        url: `/api/projects/rename/file`,
        contents: { projectId: project.projectId, filePath, newFilePath },
        requestFormat: ProjectFiles.REQUEST_FORMAT_JSON,
        format: "json"
      })
    } catch (e) {
      die("Server error renaming file", e)
    }
    // Have the file clean itself up in a tick (doing it at once trips whatever is drawing it)
    setTimeout(() => file.onRemove(), 10)
    // return the new file
    return project.getFile(newFilePath) || die("Server didn't rename file.")
  }

  /**
   * Delete a file from the project.
   * - `CONFIRM`:  asks first (`confirm()`);  "no" returns `undefined`.
   * - Returns `true` once it's gone.
   * - throws for the project's last file, a file that isn't there, or when the server says no
   */
  async delete(filePath: string, shouldConfirm?: typeof CONFIRM): Promise<boolean | undefined> {
    const { project } = this
    const die = getDier(project, "deleting file", { projectId: project.projectId, filePath })
    await project.loadOrDie(die)
    if (project.files.length === 1) die(`You can't delete the last file in this ${project.type}.`)

    const file = project.getFile(filePath) || die("File not found.")

    if (shouldConfirm === CONFIRM) {
      if (!confirm(`Really remove file '${file.file}'?`)) return undefined
    }

    // Tell the server to delete the file, which returns the updated index.
    try {
      project.contents = await LoadableFile.fetch<SP.ProjectManifestJSON5>({
        url: `/api/projects/remove/file`,
        method: "DELETE",
        contents: { projectId: project.projectId, filePath },
        requestFormat: ProjectFiles.REQUEST_FORMAT_JSON,
        format: "json"
      })
    } catch (e) {
      die("Server error deleting file", e)
    }
    // throw if file is still found
    if (project.getFile(filePath)) die("Server didn't delete the file.")

    // Have the file clean itself up in a tick (doing it at once trips whatever is drawing it)
    setTimeout(() => file.onRemove(), 10)

    return true
  }
}
