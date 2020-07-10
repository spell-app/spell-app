//----------------------------
//
//  Generic file manipulation utilities.
//
//----------------------------

import JSON5 from "json5"
import nodejs_path from "path"
import fse from "fs-extra"
import filterAsync from "node-filter-async"
import chalk from "chalk"
// import mime from "mime-types"

//----------------------------
//  File encoding formats for `readFile()`, `writeFile()`, etc.
//----------------------------
const FORMAT = {
  TEXT: "utf8",
  BINARY: "binary",
  BASE64: "base64"
}

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
export function splitPath(path) {
  return path.split(nodejs_path.sep)
}

/**
 * Join `pathSegments` with native path delimiter for this platform.
 * e.g. INPUT                     MAC/UNIX              WINDOWS
 *      ("a", "b", "c.html")      "a/b/c.html"          "a\\b\\c.html"
 */
export function joinPath(...pathSegments) {
  return nodejs_path.join(...pathSegments)
}

/**
 * Normalize `...pathSegments` by resoving `..` and `.` segments, or squishing together `//`.
 * Returns the path as a single string.
 */
export function normalizePath(...pathSegments) {
  const path = joinPath(...pathSegments)
  return nodejs_path.normalize(path)
}

/**
 * Split url `url` by `/`
 */
export function splitURL(path) {
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
export function joinURL(...pathSegments) {
  const path = nodejs_path.posix.join(...pathSegments)
  return nodejs_path.normalize(path)
}

/**
 * Get folder path for a `path`, everything up to leaf file name.
 */
export function getPathFolder(path) {
  return nodejs_path.dirname(path)
}

/**
 * Get leaf file name for a server `path`, e.g. `foo.html`.
 */
export function getPathFile(path) {
  return nodejs_path.basename(path)
}

/**
 * Return extension name for a server `path`.
 * TODO: consider different semantics for this...
 * See: https://nodejs.org/api/path.html#path_path_extname_path
 */
export function getPathExtension(path) {
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
export async function pathExists(path) {
  return fse.pathExists(path)
}

/**
 * Get disk info for a server `path`.
 * Returns `PathStatWrapper`, see its getters for possible values.
 */
export async function getPathInfo(path) {
  const stats = await fse.stat(path)
  return new PathStatWrapper(path, stats)
}
class PathStatWrapper {
  constructor(path, stats) {
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
export async function copyPath(path, newPath, fseOptions) {
  await fse.copy(path, newPath, fseOptions)
  return true
}

/**
 * Delete a file or folder from server `path`.
 * Promise resolves with `true` on success, rejects on error.
 */
export async function deletePath(path) {
  await fse.remove(path)
  return true
}

/**
 * Move / rename a file or folder from server `path` to `newPath`.
 * Pass `overwrite = true` to overwrite existing file/folder, otherwise it will reject.
 * Promise resolves with `true` on success, rejects on error.
 */
export async function movePath(path, newPath, overwrite = false) {
  await fse.move(path, newPath, overwrite)
  return true
}

//----------------------------
//  Folder utilities
//----------------------------

/**
 * Return `true` if `path` is a folder (directory).
 */
export async function pathIsAFolder(path) {
  return (await fse.stat(path)).isDirectory()
}

/**
 * Make folder at server `path` (if it doesn't already exist).
 * Promise resolves with `true` on success, rejects on error.
 */
export async function makeFolder(path) {
  await fse.ensureDir(path)
  return true
}

/**
 * Return array (single level of) files in folder at server `path`, as paths or filenames.
 * See method body for `options`.
 * TODO: `includeNested` to recurse down directories??
 */
export async function getFolderContents(path, options = {}) {
  const {
    sort = true, // `true` = perform case-insensitive sort on results
    includeFolders = false, // `true` = include directories
    includeFiles = true, // `true` = include files
    namesOnly = false, // `true` = return names only, `false` = return full path
    ignoreHidden = false, // `true` = ignore hidden files
    pattern // only return items where `pattern.test(path)` is `true` for the full path
  } = options

  // get "paths" and convert to full paths
  let paths = await fse.readdir(path)
  paths = paths.map((name) => joinPath(path, name))

  if (!includeFolders || !includeFiles) {
    paths = await filterAsync(paths, async (nextPath) => {
      const isFolder = await pathIsAFolder(nextPath)
      if (includeFolders && isFolder) return true
      if (includeFiles && !isFolder) return true
      return false
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

/**
 * Case-insensitive sort callback, e.g. `array.sort(caseInsensitiveSort)`.
 * NOTE: treats numbers as numbers, anything else will be converted to a string!
 */
export function caseInsensitiveSort(a, b) {
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
export async function loadFile(path, format = FORMAT.TEXT, optional = false) {
  try {
    return await fse.readFile(path, format)
  } catch (error) {
    if (optional && error.code === "ENOENT") return null
    throw error
  }
}

/**
 * Load text file at `path`, resolving with file contents as text.
 * Promise will reject if something goes wrong or path does not exist.
 * Pass `optional = true` to instead resolve with `null` for missing files.
 */
export async function loadTextFile(path, optional = false) {
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
export async function loadJSONFile(path, optional = false) {
  const contents = await loadFile(path, FORMAT.TEXT, optional)
  return JSON5.parse(contents)
}

/**
 * Load binary file at `path`, resolving with file contents as binary BLOB.
 * Promise will reject if something goes wrong or path does not exist.
 * Pass `optional = true` to instead resolve with `null` for missing files.
 */
export async function loadBinaryFile(path, optional = false) {
  return loadFile(path, FORMAT.BINARY, optional)
}

/**
 * Load a list of `paths`, yielding a single promise whose result is an array of file contents.
 * Promise will reject if something goes wrong or ANY specified path does not exist.
 * Pass `optional = true` to instead resolve with `null` for any missing files.
 */
export function loadFiles(paths, format, optional = false) {
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
export async function saveFile(path, fileData, format = FORMAT.TEXT) {
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
export async function saveTextFile(path, text) {
  return saveFile(path, text, FORMAT.TEXT)
}

/**
 * Save `json` data to file at server `path` as straight `JSON`.
 * Promise resolves with `true` on success, rejects on error.
 * Converts `json` to `JSON` string if necessary -- promise will reject is stringify throws.
 */
export async function saveJSONFile(path, json) {
  if (typeof json !== "string") json = JSON.stringify(json, null, "  ")
  return saveTextFile(path, json)
}

/**
 * Save `json` data to file at server `path` as `JSON5`.
 * Promise resolves with `true` on success, rejects on error.
 * Converts `json` to `JSON5` string if necessary -- promise will reject is stringify throws.
 */
export async function saveJSON5File(path, json) {
  if (typeof json !== "string") json = JSON5.stringify(json, null, "  ")
  return saveTextFile(path, json)
}

/**
 * Write binary `blob` to disk at server `path` as binary.
 * Creates any intervening folders as necessary.
 * Resolves with `true` on succecss.
 */
export async function saveBinaryFile(path, blob) {
  return saveFile(path, blob, FORMAT.BINARY)
}

// UNUSED / UNTESTED
//
// Save base64-encoded file `base64Data` to disk at `path`.
// ASSUMES contents has a file description header like:
//  `data:<mimeType>;base64,`
// If `format` is FORMAT.TEXT we'll save as text (assuming UTF8)
// If `format` if FORMAT.BINARY we'll save as binary.
//
// Otherwise we'll look at `mimeType`:
//  - if that starts with `text`, we'll save as text
//  - otherwise we'll save as binary.
//
// export function saveBase64File(path, base64Data, format) {
//   //  console.warn("saveBase64File: path: ", path, " file start: ", base64Data.substr(0, 200));
//   // Parse base64 header in file data.
//   const [match, mimeType] = base64Data.match(/^data:(.*?);base64,/) || []
//   if (!match) {
//     const message = `expected base64 header!  got: ${base64Data.substr(0, 200)}...`
//     //  console.warn("saveBase64File: " + message);
//     throw new TypeError(message)
//   }
//   // Remove header before converting
//   const contents = base64Data.replace(match, "")
//   // Figure out if we're processing a TEXT or BINARY file
//   if (format === undefined) {
//     if (mimeType.startsWith("text/") || mimeType === "application/json") format = FORMAT.TEXT
//     else format = BINARY
//   }
//   //  console.warn(`Saving base64 file to ${path} as '${format}'`);
//   // Convert from base64 to normal format
//   const fileData = Buffer.from(contents, FORMAT.BASE64).toString(format)
//   // Save it!
//   return saveFile(path, fileData, format)
// }

//----------------------------
//  MimeTypes
//----------------------------

// UNUSED / UNTESTED
//
// // Given a file `name`, guess the mimetype
// // TODO: does this work with `path`?
// export function getMimeType(name) {
//   return mime.lookup(name)
// }

// UNUSED / UNTESTED
//
// // Given a file `name`, return the Content-Type header string for it.
// // TODO: does this work with `path`?
// export function getContentType(name) {
//   return mime.contentType(name)
// }

//----------------------------
//  DEBUG
//----------------------------

// Log `jsonData` (object or string) to console with optional `message`
export function logJSON(message, jsonData = null) {
  if (typeof jsonData !== "string") jsonData = JSON5.stringify(jsonData, null, "  ")
  console.warn(chalk.bold(message))
  console.warn(chalk.grey(jsonData))
}

// Log `error` (Error) to console with optional `message`
export function logError(error, message = error.message) {
  console.warn(chalk.red.bold.inverse("ERROR: ", message))
  console.warn(error)
}
