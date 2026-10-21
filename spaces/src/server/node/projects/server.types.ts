//
//  ## Shared types for the express server.
//
//  NOTE: JSON payload shapes exchanged with the client live here;
//  the file/folder helpers that produce them stay in their topical modules (`./file-utils`, `./project-utils`).
//

////////////////
// ## File utilities
////////////////

/** Filtering/formatting options for `getFolderContents()`.  All optional -- see each default below. */
export type GetFolderContentsOptions = {
  /** Perform case-insensitive sort on results.  Default `true`. */
  sort?: boolean
  /** Include directories in results.  Default `false`. */
  includeFolders?: boolean
  /** Include files in results.  Default `true`. */
  includeFiles?: boolean
  /** Return names only, `false` = return full path.  Default `false`. */
  namesOnly?: boolean
  /** Ignore hidden files.  Default `false`. */
  ignoreHidden?: boolean
  /** Ignore empty folders.  Default `false`. */
  ignoreEmptyFolders?: boolean
  /** Only return items where `pattern.test(path)` is `true` for the full path.  Default `undefined`. */
  pattern?: RegExp
}

////////////////
// ## Project JSON payloads
////////////////

/**
 * One entry in a project's `imports` list -- both on disk (its project file) and in `ProjectIndexJSON`.
 * - `path` -- file path relative to project, e.g. `/foo.spell`.
 *   A leading `@` instead means it refers to another project.
 * - `active` -- `true` if file should be included in compilation.
 * - `contents` -- preloaded file contents for `active` files with a preloadable extension.
 *   `undefined`/`null` otherwise.
 */
export type ImportEntryJSON = {
  path: string
  active: boolean
  contents?: string | null
  /** Another project's entry:  names to import -- see `SP.ProjectManifestImport`. */
  import?: string[]
  /** Another project's entry:  semver range for its `version`. */
  version?: string
  /** Another project's entry:  parse its sources rather than its declarations. */
  source?: boolean
}

/**
 * On-disk shape of a project's file, `__project.json5` -- see `SP.PROJECT_FILE`.
 * - `imports` order determines compile order.
 */
export type ProjectFileJSON = {
  /**
   * Its name for people, e.g. `"Todos - Form Based"`, when its folder's name can't say it (decision Q45):
   * default, the title made from the folder's name, `todos-form-based` => `Todos Form Based`.
   */
  title?: string
  /**
   * What it shows, one line for people, e.g. `"A to-do list:  yes/no properties ..."`.
   * - The example apps' table, in spell-app's `README-examples.md`, is made from it (`yarn examples:readme`).
   */
  description?: string
  /** This project's semver, e.g. `"1.2.0"` -- copied into its declarations, for importers' `version` ranges. */
  version?: string
  /** Names it offers importers, e.g. `["Card", "Deck"]` -- default:  everything it declares. */
  exports?: string[]
  /** Targets it compiles to, e.g. `["js/solid", "ts/solid"]` -- default `["js/solid"]`:  see `SP.TARGETS`. */
  targets?: string[]
  /**
   * Where its lists start counting:  `1` (the default), or `0` as javascript and Python do (epic `python-target` P2).
   * - Applied when compiling, on every target:  `card 0 of the deck` is its first card.
   * - Ordinal words don't follow it:  `the first card` is the first either way.
   */
  listsStartAt?: 0 | 1
  /** Files it compiles, in order -- and other projects it imports. */
  imports: ImportEntryJSON[]
}

/**
 * Per-file disk stats, as produced by `fileUtils.getPathInfo()`.
 * - `created` / `modified` -- timestamps in milliseconds.
 * - `size` -- file size in bytes.
 */
export type ManifestEntryJSON = { created: number; modified: number; size: number }

/** Map of file `path` -> `ManifestEntryJSON`, reflecting current on-disk state of a project. */
export type ManifestJSON = Record<string, ManifestEntryJSON>

/**
 * Response shape for `GET /api/projects/index/:projectId` -- see `project-utils.getIndex()`.
 * - And for other project-file routes that return the updated index.
 * - `manifest` -- current on-disk manifest:  NOT persisted, always freshly computed from file system.
 * - `imports` -- import list, synced with `manifest` and persisted back to the project file when it changes.
 * - `title` / `version` / `exports` / `targets` / `listsStartAt` -- straight from the project file (`ProjectFileJSON`).
 * - `buildFolder` -- where its compiled output goes, inside the checkout's `build/`:  `project-utils.buildFolderInBuild()`.
 */
export type ProjectIndexJSON = {
  manifest: ManifestJSON
  title?: string
  imports: ImportEntryJSON[]
  version?: string
  exports?: string[]
  targets?: string[]
  listsStartAt?: 0 | 1
  buildFolder?: string
}
