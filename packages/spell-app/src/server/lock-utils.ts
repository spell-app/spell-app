import lockfile from "proper-lockfile"
import { getPathFolder, makeFolder, saveFile } from "#spell/node/file-utils"
import { isFileOrFolderNotFoundError } from "#spell/node/response-utils"

/**
 * Rationale: several client requests can race to read-modify-write same on-disk file
 * (e.g. two saves to `project.json` in flight at once) -- an OS-level lock file (`proper-lockfile`,
 * which uses an atomically-created directory as the lock) prevents one write from clobbering another.
 * - TODO: nothing in `src/server` currently calls `lockFile()` / `checkLock()` / `unlockFile()` --
 *   verify whether locking was meant to wrap `project-utils.saveFile()` / `saveProjectFile()` and got
 *   dropped, or whether this module is dead code left over from an earlier approach.
 */

////////////////
// ## Locking / Unlocking files
////////////////

/** Given a `path`, return path for its lock file (directory). */
export function getLockPath(path: string) {
  return `${path}.lock`
}

/** Return `true`/`false` for whether file at `path` is locked.  Returns `false` if error thrown. */
export async function checkLock(path: string) {
  return lockfile.check(path).catch((error) => false)
}

/**
 * Options passed to `proper-lockfile`'s `lock()` by `lockFile()` below.
 * - `onCompromised` NEVER lets a lost lock crash server -- it just logs.
 */
export const DEFAULT_LOCK_OPTIONS = {
  /** Retry lock up to 10 times. */
  retries: 10,
  /** Don't kill server if the lock was compromised!!!! */
  onCompromised: (error: Error) => {
    console.error("file-utils.lockFile(): lock was compromised!", error)
  }
}

/**
 * Create a lock file for file at `path`.
 * - If no file was found at `path`, we'll create it with `defaultValue`, THEN create lock.
 * - Ensures file (and parent directories) exist.
 * - Returns a promise which yields a `release()` callback.
 * - NOTE: this doesn't seem like the best way to do this...
 */
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

/** Unlock file at `path`.  No-op if file does not exist or is unlocked. */
export function unlockFile(path: string) {
  return lockfile.unlock(path)
}

////////////////
// ## LockError class
////////////////

/**
 * Simple lock error.
 * - Throw this if your subclasses have a lock exception.
 */
export class LockError extends Error {
  /** Fixed to `"LockError"` so `instanceof`-averse code can check `error.name` instead. */
  get name() {
    return "LockError"
  }
}
