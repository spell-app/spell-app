import lockfile from "proper-lockfile"
import { getPathFolder, makeFolder, saveFile } from "./file-utils.ts"
import { isFileOrFolderNotFoundError } from "./response-utils.ts"

//----------------------------
//  Locking / Unlocking files
//----------------------------

// Given a `path`, return the path for the lock file (dir).
export function getLockPath(path: string) {
  return `${path}.lock`
}

// Return a promise which yields `true/false` for whether file at `path` is locked.
// Returns `false` if error thrown.
export async function checkLock(path: string) {
  return lockfile.check(path).catch((error) => false)
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
  onCompromised: (error: Error) => {
    console.error("file-utils.lockFile(): lock was compromised!", error)
  }
}
export async function lockFile(path: string, defaultValue: any, options = DEFAULT_LOCK_OPTIONS) {
  // Make sure the directory to the file is present
  const dir = getPathFolder(path)
  await makeFolder(dir)

  // Lock it!
  try {
    return await lockfile.lock(path, options)
  } catch (error) {
    // If file not found, create file and then lock
    if (isFileOrFolderNotFoundError(error)) {
      await saveFile(path, defaultValue)
      return lockfile.lock(path, options)
    }
    throw error
  }
}

//  Unlock file at `path`.
//  No-op if file does not exist or is unlocked.
export function unlockFile(path: string) {
  return lockfile.unlock(path)
}

//----------------------------
//  LockError class
//----------------------------

// Simple lock error.
// Throw this if your subclasses have a lock exception.
export class LockError extends Error {
  get name() {
    return "LockError"
  }
}
