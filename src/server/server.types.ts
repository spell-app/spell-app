//
//  ## Shared types for the express server.
//
//  NOTE: JSON payload shapes exchanged with the client live here; the file/folder helpers that
//  produce them stay in their topical modules (`./file-utils`, `./project-utils`).
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
 * One entry in a project's `imports` list -- both on disk (`.imports.json`) and in `ProjectIndexJSON`.
 * - `path` -- file path relative to project, e.g. `/foo.spell` -- a leading `@` instead means it refers
 *   to another project.
 * - `active` -- `true` if file should be included in compilation.
 * - `contents` -- preloaded file contents for `active` files with a preloadable extension.  `undefined`/`null`
 *   otherwise.
 */
export type ImportEntryJSON = { path: string; active: boolean; contents?: string | null }

/** On-disk shape of a project's `.imports.json` file -- `imports` order determines compile order. */
export type ImportsFileJSON = { imports: ImportEntryJSON[] }

/**
 * Per-file disk stats, as produced by `fileUtils.getPathInfo()`.
 * - `created` / `modified` -- timestamps in milliseconds.
 * - `size` -- file size in bytes.
 */
export type ManifestEntryJSON = { created: number; modified: number; size: number }

/** Map of file `path` -> `ManifestEntryJSON`, reflecting current on-disk state of a project. */
export type ManifestJSON = Record<string, ManifestEntryJSON>

/**
 * Response shape for `GET /api/projects/index/:projectId` (and other project-file routes that return
 * the updated index) -- see `project-utils.getIndex()`.
 * - `manifest` -- current on-disk manifest -- NOT persisted, always freshly computed from file system.
 * - `imports` -- import list, synced with `manifest` and persisted back to `.imports.json` when it changes.
 */
export type ProjectIndexJSON = { manifest: ManifestJSON; imports: ImportEntryJSON[] }
