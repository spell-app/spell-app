//////////////////////////////
//
//  Generic file manipulation utilities.
//
//////////////////////////////

import JSON5 from "json5"
import path from "path"
import fse from "fs-extra"
import lockfile from "proper-lockfile"
import chalk from "chalk"
import mime from "mime-types"

//////////////////////////////
//  Contstants
//////////////////////////////

const TEXT = "utf8"
const BINARY = "binary"

//////////////////////////////
//  Proxy `path` and `fs-extra` utilites so they're easy to mock
//////////////////////////////

// Join paths.
export const joinPath = path.join

// Get folder name for a path.
export const folderName = path.dirname

// Get leaf file name for a path.
export const filename = path.basename

// Does file at `path` exist?
export const pathExists = fse.pathExists

// Return extension name for a path
export const extension = path.extname

//////////////////////////////
//  MimeTypes
//////////////////////////////

// Given a `filename`, guess the mimetype
export function getMimeType(filename) {
  return mime.lookup(filename)
}

// Given a `filename`, return the Content-Type header string for it.
export function getContentType(filename) {
  return mime.contentType(filename)
}

//////////////////////////////
//  Loading files
//////////////////////////////

// Load file at `path`, returns a promise which fields file results.
// If `optional` is `true`, we'll return `null` for any file that can't be found.
export async function loadFile(path, options = "utf8", optional = false) {
  try {
    return await fse.readFile(path, options)
  } catch (error) {
    if (optional && error.code === "ENOENT") return null
    throw error
  }
}

// Load a bunch of files, yielding a single promise whose result is an array of contents.
// If `optional` is truthy, we will return `null` for any file which can't be found.
// Otherwise the promise will reject if if ANY of the files can't be found or on other error.
export function loadFiles(paths, options, optional = false) {
  const promises = paths.map(path => loadFile(path, options, optional))
  return Promise.all(promises)
}

// Promise which loads a JSON file at `path` and parses contents into JSON object.
// If file is empty, we'll return `null`.
// If `optional` is truthy, we will return `null` if the file can't be found.
// Otherwise we'll throw the error.
export async function loadJSONFile(path, optional = false) {
  const contents = await loadFile(path, "utf-8", optional)
  return JSON5.parse(contents)
}

//////////////////////////////
//  Saving files
//////////////////////////////

// Use this function to write files, making sure directories are created as necessary.
export async function saveFile(path, fileData, format) {
  const dir = folderName(path)
  await fse.mkdirp(dir)
  return fse.writeFile(path, fileData, format)
}

// Save `json` data to file at `path`.
// Returns a promise which will be fullfilled or rejected.
// Converts `json` to string if necessary.
export function saveJSONFile(path, json) {
  if (typeof json !== "string") {
    try {
      json = JSON5.stringify(json, null, "  ")
    } catch (e) {
      return Promise.reject(e)
    }
  }
  return saveFile(path, json, TEXT)
}

// Save base64-encoded file `base64Data` to disk at `path`.
// ASSUMES contents has a file description header like:
//  `data:<mimeType>;base64,`
// If `format` is TEXT we'll save as text (assuming UTF8)
// If `format` if BINARY we'll save as binary.
//
// Otherwise we'll look at `mimeType`:
//  - if that starts with `text`, we'll save as text
//  - otherwise we'll save as binary.
//
export function saveBase64File(path, base64Data, format) {
  //  console.warn("saveBase64File: path: ", path, " file start: ", base64Data.substr(0, 200));

  // Parse base64 header in file data.
  const [match, mimeType] = base64Data.match(/^data:(.*?);base64,/) || []
  if (!match) {
    const message = `expected base64 header!  got: ${base64Data.substr(0, 200)}...`
    //  console.warn("saveBase64File: " + message);
    throw new TypeError(message)
  }
  // Remove header before converting
  const contents = base64Data.replace(match, "")

  // Figure out if we're processing a TEXT or BINARY file
  if (format === undefined) {
    if (mimeType.startsWith("text/") || mimeType === "application/json") format = TEXT
    else format = BINARY
  }

  //  console.warn(`Saving base64 file to ${path} as '${format}'`);

  // Convert from base64 to normal format
  const fileData = new Buffer(contents, "base64").toString(format)

  // Save it!
  return saveFile(path, fileData, format)
}

//////////////////////////////
//  Removing files
//////////////////////////////

// Remove a server file via hard delete.
// Returns a promise
// If `optional` is `true`, we'll swallow the error if the file can't be found.
// NOTE: consider moving to a `trash` folder so we can undelete.
export function removeFile(path, optional = false) {
  const promise = fse.unlink(path)

  // Swallow error if optional
  if (optional) return promise.catch(e => null)

  return promise
}

//////////////////////////////
//  Locking / Unlocking files
//////////////////////////////

// Given a `path`, return the path for the lock file (dir).
export function getLockPath(path) {
  return `${path}.lock`
}

// Return a promise which yields `true/false` for whether file at `path` is locked.
// Returns `false` if error thrown.
export function checkLock(path) {
  return lockfile.check(path).catch(error => false)
}

//  Create a lock file for file at `path`.
//  If `defaultValue` is undefined and no file was found at `path`,
//   we'll create the file with `defaultValue`, THEN create the lock.
//  Ensures file (and parent directories) exist.
//  Returns a promise which yields a `release()` callback.
//
// NOTE: this doesn't seem like the best way to do this...
export const DEFAULT_LOCK_OPTIONS = {
  // Retry lock up to 10 times
  retries: 10,
  // Don't kill the server if the lock was compromised!!!!
  onCompromised: error => {
    console.error("file-utils.lockFile(): lock was compromised!", error)
  }
}
export async function lockFile(path, defaultValue, options = DEFAULT_LOCK_OPTIONS) {
  // Make sure the directory to the file is present
  const dir = folderName(path)
  await fse.mkdirp(dir)

  // Lock it!
  try {
    return await lockfile.lock(path, options)
  } catch (e) {
    // If file not found, create file and then lock
    if (e.code === "ENOENT") {
      await saveFile(path, defaultValue)
      return await lockfile.lock(path, options)
    }
    throw e
  }
}

//  Unlock file at `path`.
//  No-op if file does not exist or is unlocked.
export function unlockFile(path) {
  return lockfile.unlock(path)
}

//////////////////////////////
//  LockError class
//////////////////////////////

// Simple lock error.
// Throw this if your subclasses have a lock exception.
export class LockError {
  constructor(message) {
    this.name = "LockError"
    this.message = message
    this.stack = new Error().stack
  }
}
LockError.prototype = Object.create(Error.prototype)

//////////////////////////////
//  List files in a dir
//////////////////////////////
export function listContents(directory, options = {}) {
  const { includeDirs = false, includeFiles = true, namesOnly = false, ignoreHidden = false, pattern } = options
  let paths = fse.readdirSync(directory).map(fileName => path.join(directory, fileName))

  if (!includeDirs || !includeFiles)
    paths = paths.filter(path => {
      const isDir = fse.statSync(path).isDirectory()
      if (includeDirs && isDir) return true
      if (includeFiles && !isDir) return true
      return false
    })

  // If a RegExp `pattern` was provided, remove things which don't match
  if (pattern) paths = paths.filter(file => pattern.test(file))

  // if `ignoreHidden` was specified, remove file names starting with "."
  if (ignoreHidden) {
    paths = paths.filter(_path => !path.basename(_path).startsWith("."))
  }

  // If `namesOnly` was specified, remove path bits.
  if (namesOnly) paths = paths.map(_path => path.basename(_path))

  return paths
}

//////////////////////////////
//  DEBUG
//////////////////////////////

// Log `jsonData` (object or string) to console with optional `message`
export function logJSON(message, jsonData = null) {
  console.warn(message)

  // Convert object to string
  if (typeof jsonData !== "string") jsonData = JSON5.stringify(jsonData, null, "  ")

  // Indent string before warning
  jsonData = "  " + jsonData.split("\n").join("  \n") + "\n"
  console.warn(jsonData)
}

// Log `error` (Error) to console with optional `message`
export function logError(error, message = error.message) {
  console.warn(chalk.red.bold.inverse("ERROR: ", message))
  console.warn(error)
}
