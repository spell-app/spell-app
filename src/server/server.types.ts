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

export type ImportEntryJSON = { path: string; active: boolean; contents?: string | null }

export type ImportsFileJSON = { imports: ImportEntryJSON[] }

export type ManifestEntryJSON = { created: number; modified: number; size: number }

export type ManifestJSON = Record<string, ManifestEntryJSON>

export type ProjectIndexJSON = { manifest: ManifestJSON; imports: ImportEntryJSON[] }
