import { JSON5File, CONFIRM, $fetch, getDier, KnownFormat } from "$/util"
import { SP } from "$/spell"

import { LOCAL_PERSON } from "./projectGroups"

/**
 * A project GROUP's list of projects, e.g. `@spell/examples`:  loadable, and the group's project create, copy,
 * rename and delete.
 * - One per group:  `new SpellProjectRoot("@spell/examples")` answers the one already made.
 * - Its groups are spaces' (`PROJECT_GROUPS`):  loading this file registers them with spell.
 * - It was spell's, until epic `people-and-orgs` P15 (decision Q20):  spell never lists projects.
 */
export class SpellProjectRoot extends JSON5File<SP.ProjectPathList> {
  /**
   * Format of what the editor sends:  JSON, as `application/json`, so the server parses it.
   * - It was a bare `"json"`, which the server took for no body at all:  every create, copy, rename and delete of a
   *   project or a file failed with "Path must be a string" (found in epic `people-and-orgs` P15).
   */
  static REQUEST_FORMAT_JSON = KnownFormat.json

  /** Singleton `owen@spell` root:  this machine's person's own projects. */
  static get projects(): SpellProjectRoot {
    return new SpellProjectRoot(`${LOCAL_PERSON}@spell`)
  }
  /** Singleton `@spell/examples` root. */
  static get examples(): SpellProjectRoot {
    return new SpellProjectRoot("@spell/examples")
  }
  /** Singleton `@spell/guides` root. */
  static get guides(): SpellProjectRoot {
    return new SpellProjectRoot("@spell/guides")
  }
  /** Singleton `@spell/test` root -- frozen projects tests run against;  listed in the UI in dev only. */
  static get fixtures(): SpellProjectRoot {
    return new SpellProjectRoot("@spell/test")
  }
  /** Singleton `@spell/library` root -- projects others import, e.g. `@spell/library/cards` in a `project.json`. */
  static get library(): SpellProjectRoot {
    return new SpellProjectRoot("@spell/library")
  }

  /** Return EXISTING singleton root for projectRoot `path` or `undefined`. */
  static rootForPath(rootPath: SP.ProjectRootPath) {
    return this.registry.get(rootPath)
  }

  /** Return singleton root associated with `name` string. */
  static getRoot(name: string | undefined): SpellProjectRoot | undefined {
    if (typeof name !== "string") return undefined
    if (name.startsWith("project")) return SpellProjectRoot.projects
    if (name.startsWith("examples")) return SpellProjectRoot.examples
    if (name.startsWith("guides")) return SpellProjectRoot.guides
    if (name.startsWith("library")) return SpellProjectRoot.library
    if (name.startsWith("fixtures")) return SpellProjectRoot.fixtures
    return undefined
  }

  // From `src/projectSetup.js`
  /*@writeOnce path*/
  /*@writeOnce space*/
  /*@writeOnce domain*/
  /*@writeOnce title*/
  /*@writeOnce Type*/
  /*@writeOnce type*/
  /*@writeOnce description*/
  /*@writeOnce icon*/
  /*@writeOnce location*/

  /** Its address, e.g. `@spell/examples` or `owen@spell`:  see `SP.ProjectRootSpec.path`. */
  declare path: SP.ProjectRootPath
  /** Its space, as `@spell` or `owen@spell`. */
  declare space: string
  /** Its short name, as `projects`, `examples` or `guides`. */
  declare domain: string
  /** User-friendly title of project. */
  declare title: string
  /** Type of project for string concatenation, as `Project`, `Example` or `Guide`. */
  declare Type: string
  /** Type of project for string concatenation, as `project`, `example` or `guide`. */
  declare type: string
  /** User-friendly description of project. */
  declare description: string
  /** Semantic UI icon of project. */
  declare icon: string
  /** Listed in the app's UI only in dev, e.g. `@spell/test` -- see `SP.ProjectRootSpec.devOnly`. */
  declare devOnly?: boolean
  /** Immutable `location` object which we use to get various bits of the path. */
  declare location: SP.SpellLocation

  /** Registry of known instances. */
  static registry = new Map<string, SpellProjectRoot>()

  /**
   * Given `projectRoot` as `@spell/examples` etc, return a singleton `SpellProjectRoot`.
   * Throws if `projectRoot` is not in `SpellSetup.projectRoots`.
   * - TODO: Calling this with `new ()` will return existing record.  This violates the principle
   *   of least surprise, move to `rootForProjectRootPath()`?
   */
  constructor(path: SP.ProjectRootPath) {
    // Return immediately from registry if already present.
    const existing = SpellProjectRoot.registry.get(path)
    if (existing) return existing

    const setup = SP.SpellSetup.projectSpectForRootPath(path)
    super({})
    // CLAUDE TODO: can this just be super(setup)
    Object.assign(this, setup)
    this.location = new SP.SpellLocation(this.path)
    SpellProjectRoot.registry.set(this.path, this)
  }

  /** URL to load the project list:  `/api/projects/list/<group's address>` (`SP.SpellUrls.listUrl()`). */
  get url(): string {
    return SP.SpellUrls.listUrl(this.path)
  }

  /** Load our index if necessary, calling `die()` if something goes wrong. */
  async loadOrDie(die: ReturnType<typeof getDier>): Promise<void> {
    if (this.isLoaded) return
    try {
      await this.load(undefined)
    } catch (e) {
      die("Error loading project list", e)
    }
  }

  /** List of paths for all available `SpellProject`s. */
  /*@memoizeForProp("contents")*/
  get projectPaths(): SP.ProjectPathList {
    return this.derivedFrom("projectPaths", () => this.contents || [], [this.contents])
  }

  /**
   * Pointers to all available `SpellProject`s.
   * - NOTE: this will throw if server sends invalid paths!!!
   * - TODOC: it's tricky to use this in a component!
   */
  /*@memoizeForProp("projectPaths")*/
  get projects(): SP.SpellProject[] {
    return this.derivedFrom("projectPaths", () => this.projectPaths.map((path) => new SP.SpellProject(path)), [
      this.contents
    ])
  }

  /**
   * Assuming we're loaded, return a known project by `path`.
   * Returns `undefined` if not found.
   */
  getProject(path: string): SP.SpellProject | undefined {
    return this.projects?.find((p) => p.path === path)
  }

  ////////////////
  // ## Project CRUD
  ////////////////

  /**
   * Show `prompt()` to get new filename.
   * - If you're basing off of a different project, pass its `projectId` (which MUST be valid!!!).
   * - Returns `projectId` or `undefined`.
   */
  promptForProjectId({
    projectId,
    defaultName,
    message = `Name for the new ${this.type}?`,
    die
  }: {
    projectId?: string
    defaultName?: string
    message?: string
    die?: ReturnType<typeof getDier>
  } = {}): string | undefined {
    const originalLocation = projectId ? new SP.SpellLocation(projectId, die) : undefined
    if (!defaultName) defaultName = originalLocation?.projectName || "untitled"

    // lower-kebab, as every project's name (decision Q39):  `My Thing` => `my-thing`
    const projectName = SP.SpellLocation.kebab(prompt(message, defaultName) ?? "")
    if (!projectName) return undefined
    return `${originalLocation?.projectRoot ?? this.path}/${projectName}`
  }

  /**
   * Create a new project at `projectId`.
   * Returns new project, `undefined` if cancelled, or throws on error.
   */
  async createApp(projectId?: string): Promise<SP.SpellProject | undefined> {
    const die = getDier(this, `creating ${this.type}`, { projectId })

    if (!projectId) projectId = this.promptForProjectId({ die })
    if (!projectId) return undefined
    die.params.projectId = projectId

    const location = new SP.SpellLocation(projectId, die)
    if (!location.isProjectPath) die("You must pass a projectId.")

    await this.loadOrDie(die)
    if (this.getProject(projectId)) die(`${this.Type} already exists.`)

    // Tell the server to create the project, which returns new projects list
    try {
      const newContents = await $fetch<SP.ProjectPathList>({
        url: `/api/projects/create/project`,
        contents: {
          projectId,
          filePath: "Untitled.spell",
          contents: "## this space intentionally left blank"
        },
        requestFormat: SpellProjectRoot.REQUEST_FORMAT_JSON,
        format: "json"
      })
      this.contents = newContents
    } catch (e) {
      die(`Server error creating ${this.type}`, e)
    }
    // Return the new project
    return this.getProject(projectId) || die(`Server didn't create the new ${this.type}.`)
  }

  /**
   * Duplicate an existing project.
   * Returns new project, `undefined` if cancelled, or throws on error.
   */
  async duplicateApp(projectId: string, newProjectId?: string): Promise<SP.SpellProject | undefined> {
    const die = getDier(this, `duplicating ${this.type}`, { projectId, newProjectId })

    new SP.SpellLocation(projectId, die)

    await this.loadOrDie(die)
    if (!this.getProject(projectId)) die(`${this.Type} does not exist.`)

    if (!newProjectId) newProjectId = this.promptForProjectId({ projectId, die })
    if (!newProjectId) return undefined
    die.params.newProjectId = newProjectId

    const newLocation = new SP.SpellLocation(newProjectId, die)
    if (!newLocation.isProjectPath) die("You must pass a newProjectId.")
    if (this.getProject(newProjectId)) die(`New ${this.type} already exists.`)

    // Tell the server to duplicate the project, which returns new projects list
    try {
      const newContents = await $fetch<SP.ProjectPathList>({
        url: `/api/projects/duplicate/project`,
        contents: { projectId, newProjectId },
        requestFormat: SpellProjectRoot.REQUEST_FORMAT_JSON,
        format: "json"
      })
      this.contents = newContents
    } catch (e) {
      die(`Server error duplicating ${this.type}`, e)
    }
    // Return the new project
    return this.getProject(newProjectId) || die(`Couldn't create new ${this.type}`)
  }

  /**
   * Rename an existing project.
   * Returns new project, `undefined` if cancelled, or throws on error.
   */
  async renameApp(projectId: string, newProjectId?: string): Promise<SP.SpellProject | undefined> {
    const die = getDier(this, `renaming ${this.type}`, { projectId, newProjectId })

    new SP.SpellLocation(projectId, die)

    await this.loadOrDie(die)
    const project = this.getProject(projectId) || die(`${this.Type} does not exist.`)

    if (!newProjectId)
      newProjectId = this.promptForProjectId({ projectId, message: `New name for the ${this.type}?`, die })
    if (!newProjectId || newProjectId === projectId) return undefined
    die.params.newProjectId = newProjectId

    const newLocation = new SP.SpellLocation(newProjectId, die)
    if (!newLocation.isProjectPath) die("You must pass a newProjectId.")
    if (this.getProject(newProjectId)) die(`New ${this.type} already exists.`)

    // Tell the server to rename the project, which returns new projects list
    try {
      const newContents = await $fetch<SP.ProjectPathList>({
        url: `/api/projects/rename/project`,
        contents: { projectId, newProjectId },
        requestFormat: SpellProjectRoot.REQUEST_FORMAT_JSON,
        format: "json"
      })
      this.contents = newContents
      // Have the project clean itself up in a tick (delay is so React doesn't barf on hooks).
      setTimeout(() => project.onRemove(), 10)
    } catch (e) {
      die(`Server error renaming ${this.type}`, e)
    }

    // Return the new project
    return this.getProject(newProjectId) || die(`Server couldn't rename ${this.type}.`)
  }

  /**
   * Remove an existing project.
   * Returns `true` on success, `false` if cancelled, or throws on error.
   */
  async deleteApp(projectId: string, shouldConfirm?: typeof CONFIRM): Promise<boolean> {
    const die = getDier(this, `removing ${this.type}`, { projectId })
    new SP.SpellLocation(projectId, die)

    await this.loadOrDie(die)
    const project = this.getProject(projectId) || die(`${this.Type} does not exist.`)

    if (shouldConfirm === CONFIRM) {
      if (!confirm(`Really remove ${this.type} '${project.projectName}'?`)) return false
    }

    // Tell the server to remove the project, which returns new projects list
    try {
      const newContents = await $fetch<SP.ProjectPathList>({
        url: `/api/projects/remove/project`,
        method: "DELETE",
        contents: { projectId },
        requestFormat: SpellProjectRoot.REQUEST_FORMAT_JSON,
        format: "json"
      })
      this.contents = newContents
    } catch (e) {
      die(`Server error deleting ${this.type}`, e)
    }
    // Barf if the project still exists
    if (this.getProject(projectId)) die(`Server didn't delete ${this.type}.`)

    // Have the project clean itself up in a tick
    // (delay is so React doesn't barf on hooks).
    setTimeout(() => project.onRemove(), 10)
    return true
  }

  ////////////////
  // ## Debug
  ////////////////

  /** Debug string, e.g. `SpellProjectRoot: owen@spell`. */
  toString(): string {
    return `${this.constructor.name}: ${this.path}`
  }
}
