//----------------------------
//
//  Generic file manipulation utilities.
//
//----------------------------

import chalk from "chalk"
import JSON5 from "json5"
import nodejs_path from "path"
import fse, { Stats, CopyOptions, MoveOptions } from "fs-extra"
import filterAsync from "node-filter-async"

import { isFileOrFolderNotFoundError } from "./response-utils.ts"

//----------------------------
//  File encoding formats for `readFile()`, `writeFile()`, etc.
//----------------------------
export const FORMAT = {
  TEXT: "utf8",
  BINARY: "binary",
  BASE64: "base64",
} as const
// REFACTOR: rename?  Get this from somewhere else?
type EncodingFormat = (typeof FORMAT)[keyof typeof FORMAT]

//
//----------------------------
//  Path utlities.
//  We wrap nodeJS `path` routines so they're easy to mock
//  and to present a better semantic interface than the original screwy names.
//----------------------------
//

/**
 * Split server `path` according to native path separator for this platform.
 */
export function splitPath(path: string) {
  return path.split(nodejs_path.sep)
}

/**
 * Join `pathSegments` with native path delimiter for this platform.
 * e.g. INPUT                     MAC/UNIX              WINDOWS
 *      ("a", "b", "c.html")      "a/b/c.html"          "a\\b\\c.html"
 */
export function joinPath(...pathSegments: string[]) {
  return nodejs_path.join(...pathSegments)
}

/**
 * Normalize `...pathSegments` by resoving `..` and `.` segments, or squishing together `//`.
 * Returns the path as a single string.
 */
export function normalizePath(...pathSegments: string[]) {
  const path = joinPath(...pathSegments)
  return nodejs_path.normalize(path)
}

/**
 * Split url `url` by `/`
 */
export function splitURL(path: string) {
  return path.split("/")
}

/**
 * Join `pathSegments` with slashes as for a URL, no matter which platform.
 * "Normalizes" path to get rid of any `..`, `.`, `//` etc
 * e.g. INPUT                         OUTPUT
 *      ("/a", "b", "c.html")         "/a/b/c.html"
 *      ("a", "b", "c.html")          "a/b/c.html"
 *      ("a", "b", "..", "c.html")    "a/c.html"
 *      ("a", "", "b", "c.html")      "a/b.html"
 */
export function joinURL(...pathSegments: string[]) {
  const path = nodejs_path.posix.join(...pathSegments)
  return nodejs_path.normalize(path)
}

/**
 * Get folder path for a `path`, everything up to leaf file name.
 */
export function getPathFolder(path: string) {
  return nodejs_path.dirname(path)
}

/**
 * Get leaf file name for a server `path`, e.g. `foo.html`.
 */
export function getPathFile(path: string) {
  return nodejs_path.basename(path)
}

/**
 * Return extension name for a server `path`.
 * TODO: consider different semantics for this...
 * See: https://nodejs.org/api/path.html#path_path_extname_path
 */
export function getPathExtension(path: string) {
  return nodejs_path.extname(path)
}

//
//----------------------------
//  Generic File / Folder manipulation
//  Proxied to: make easy to mock, return consistent results, provide semantic method names.
//----------------------------
//

/**
 * Return `true` if file or folder at `path` exists.
 */
export async function pathExists(path: string) {
  return fse.pathExists(path)
}

/**
 * Get disk info for a server `path`.
 * Returns `PathStatWrapper`, see its getters for possible values.
 */
export async function getPathInfo(path: string) {
  const stats = await fse.stat(path)
  return new PathStatWrapper(path, stats)
}

/** Wrapper for `fs.Stats` to provide more semantic properties. */
class PathStatWrapper {
  path: string
  stats: Stats
  constructor(path: string, stats: Stats) {
    this.path = path
    this.stats = stats
  }
  /** Does the path represent a folder? */
  get isFolder() {
    return this.stats.isDirectory()
  }
  /** Does the path represent a file? */
  get isFile() {
    return this.stats.isFile()
  }
  /** Does the path represent a symbolic link? */
  get isLink() {
    return this.stats.isSymbolicLink()
  }
  /** Creation time in milliseconds. */
  get created() {
    return Math.floor(this.stats.birthtimeMs)
  }
  /** Last modified time in milliseconds. */
  get modified() {
    return Math.floor(this.stats.mtimeMs)
  }
  /** Last access time in milliseconds. */
  get accessed() {
    return Math.floor(this.stats.atimeMs)
  }
  /** File size in bytes. */
  get size() {
    return this.stats.size
  }
}

/**
 * Copy a file or folder from server `path` to `newPath`.
 * Promise resolves with `true` on success, rejects on error.
 * For `fseOptions` see: https://github.com/jprichardson/node-fs-extra/blob/HEAD/docs/copy.md
 */
export async function copyPath(path: string, newPath: string, options?: CopyOptions) {
  await fse.copy(path, newPath, options)
  return true
}

/**
 * Delete a file or folder from server `path`.
 * Promise resolves with `true` on success, rejects on error.
 */
export async function deletePath(path: string) {
  await fse.remove(path)
  return true
}

/**
 * Move / rename a file or folder from server `path` to `newPath`.
 * Pass `overwrite = true` to overwrite existing file/folder, otherwise it will reject.
 * Promise resolves with `true` on success, rejects on error.
 */
export async function movePath(path: string, newPath: string, options?: MoveOptions) {
  await fse.move(path, newPath, options)
  return true
}

//----------------------------
//  Folder utilities
//----------------------------

/**
 * Return `true` if `path` is a folder (directory).
 */
export async function pathIsAFolder(path: string) {
  return (await fse.stat(path)).isDirectory()
}

/**
 * Make folder at server `path` (if it doesn't already exist).
 * Promise resolves with `true` on success, rejects on error.
 */
export async function makeFolder(path: string) {
  await fse.ensureDir(path)
  return true
}

/**
 * Return array (single level of) files in folder at server `path`, as paths or filenames.
 * See method body for `options`.
 * TODO: `includeNested` to recurse down directories??
 */
export async function getFolderContents(path: string, options: GetFolderContentsOptions = {}) {
  const {
    sort = true,
    includeFolders = false,
    includeFiles = true,
    namesOnly = false,
    ignoreHidden = false,
    ignoreEmptyFolders = false,
    pattern,
  } = options

  // get "paths" and convert to full paths
  let paths = await fse.readdir(path)
  paths = paths.map((name) => joinPath(path, name))

  if (!includeFolders || !includeFiles) {
    paths = await filterAsync(paths, async (nextPath) => {
      const isFolder = await pathIsAFolder(nextPath)
      if (!isFolder) return includeFiles
      if (!includeFolders) return false
      if (ignoreEmptyFolders) {
        const files = await fse.readdir(nextPath)
        if (files.length === 0) return false
      }
      return true
    })
  }

  // If a RegExp `pattern` was provided, remove things which don't match
  if (pattern) paths = paths.filter((path) => pattern.test(path))

  // if `ignoreHidden` was specified, remove file names starting with "."
  if (ignoreHidden) paths = paths.filter((path) => !getPathFile(path).startsWith("."))

  // If `namesOnly` was specified, remove path bits.
  if (namesOnly) paths = paths.map((path) => getPathFile(path))

  // Sort case-insensitive
  if (sort) paths.sort(caseInsensitiveSort)
  return paths
}
export interface GetFolderContentsOptions {
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

/**
 * Case-insensitive sort callback, e.g. `array.sort(caseInsensitiveSort)`.
 * NOTE: treats numbers as numbers, anything else will be converted to a string!
 */
// REFACTOR: use locale-aware sort, which includes fuzzy matching and "numbers as numbers" functionality
export function caseInsensitiveSort(a: any, b: any) {
  a = typeof a === "number" ? a : `${a}`.toLowerCase()
  b = typeof b === "number" ? b : `${b}`.toLowerCase()
  return a === b ? 0 : a < b ? -1 : 1
}

//----------------------------
//  Loading files
//----------------------------

/**
 * Load file at `path`, resolving with file contents.
 * Default is to read as a text file, use `FORMAT.BINARY` to read as a binary file.
 * Promise will reject if something goes wrong or path does not exist.
 * Pass `optional = true` to instead resolve with `null` for missing files.
 */
// REFACTOR: output will vary based on format, so we should return a typed object
// REFACTOR: single `{ format, optional }` parameter
export async function loadFile(path: string, format: EncodingFormat = FORMAT.TEXT, optional?: "OPTIONAL") {
  try {
    return await fse.readFile(path, format)
  } catch (error) {
    if (optional && isFileOrFolderNotFoundError(error)) return null
    throw error
  }
}

/**
 * Load text file at `path`, resolving with file contents as text.
 * Promise will reject if something goes wrong or path does not exist.
 * Pass `optional = true` to instead resolve with `null` for missing files.
 */
// REFACTOR: single `{ optional }` parameter
export async function loadTextFile(path: string, optional?: "OPTIONAL"): Promise<string | null> {
  return loadFile(path, FORMAT.TEXT, optional)
}

/**
 * Load a JSON file at `path`, reslving with file contents as a JSON object.
 * If file is empty, we'll return `null`.
 * Promise will reject if JSON parse fails or path does not exist.
 * Pass `optional = true` to instead resolve with `null` for missing files.
 *
 * Note that we parse with `JSON5.parse()`, which is a bit more forgiving
 * than normal `JSON.parse()` -- the output will be usable as normal `JSON`.
 */
// REFACTOR: single `{ optional, validtor? }` parameter
export async function loadJSONFile(path: string, optional?: "OPTIONAL"): Promise<any | null> {
  const contents = await loadFile(path, FORMAT.TEXT, optional)
  if (contents == null) return null
  return JSON5.parse(contents)
}

/**
 * Load binary file at `path`, resolving with file contents as binary BLOB.
 * Promise will reject if something goes wrong or path does not exist.
 * Pass `optional = true` to instead resolve with `null` for missing files.
 */
// REFACTOR: unused
// REFACTOR: single `{ optional }` parameter
// REFACTOR: convert base64 to buffer?
export async function loadBinaryFile(path: string, optional?: "OPTIONAL") {
  return loadFile(path, FORMAT.BINARY, optional)
}

/**
 * Load a list of `paths`, yielding a single promise whose result is an array of file contents.
 * Promise will reject if something goes wrong or ANY specified path does not exist.
 * Pass `optional = true` to instead resolve with `null` for any missing files.
 */
export function loadFiles(paths: string[], format: EncodingFormat, optional?: "OPTIONAL") {
  const promises = paths.map((path) => loadFile(path, format, optional))
  return Promise.all(promises)
}

//----------------------------
//  Saving files
//----------------------------

/**
 * Write `fileData` to disk at server `path` according to file `format`.
 * Creates any intervening folders as necessary.
 * Resolves with `true` on succecss.
 */
export async function saveFile(path: string, fileData: any, format: EncodingFormat = FORMAT.TEXT): Promise<boolean> {
  // Make sure directory exists
  await makeFolder(getPathFolder(path))
  await fse.writeFile(path, fileData, format)
  return true
}

/**
 * Write `text` to disk at server `path` as utf-8 text.
 * Creates any intervening folders as necessary.
 * Resolves with `true` on succecss.
 */
export async function saveTextFile(path: string, text: string): Promise<boolean> {
  return saveFile(path, text, FORMAT.TEXT)
}

/**
 * Save `json` data to file at server `path` as straight `JSON`.
 * Promise resolves with `true` on success, rejects on error.
 * Converts `json` to `JSON` string if necessary -- promise will reject is stringify throws.
 */
export async function saveJSONFile(path: string, json: any): Promise<boolean> {
  if (typeof json !== "string") json = JSON.stringify(json, null, "  ")
  return saveTextFile(path, json)
}

/**
 * Save `json` data to file at server `path` as `JSON5`.
 * Promise resolves with `true` on success, rejects on error.
 * Converts `json` to `JSON5` string if necessary -- promise will reject is stringify throws.
 */
export async function saveJSON5File(path: string, json: any): Promise<boolean> {
  if (typeof json !== "string") json = JSON5.stringify(json, null, "  ")
  return saveTextFile(path, json)
}

/**
 * Write binary `blob` to disk at server `path` as binary.
 * Creates any intervening folders as necessary.
 * Resolves with `true` on succecss.
 */
export async function saveBinaryFile(path: string, blob: any) {
  return saveFile(path, blob, FORMAT.BINARY)
}

//----------------------------
//  DEBUG
//----------------------------

// Log `jsonData` (object or string) to console with optional `message`
export function logJSON(message: string, jsonData: any = null) {
  if (typeof jsonData !== "string") jsonData = JSON5.stringify(jsonData, null, "  ")
  console.warn(chalk.bold(message))
  console.warn(chalk.grey(jsonData))
}

// Log `error` (Error) to console with optional `message`
export function logError(error: Error, message: string = error.message) {
  console.warn(chalk.red.bold.inverse("ERROR: ", message))
  console.warn(error)
}
