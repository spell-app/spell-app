/** Operation or resource is optional. */
export const OPTIONAL = "OPTIONAL"

/** Operation or resource is required -- we'll throw an error if it's not found. */
export const REQUIRED = "REQUIRED"

/**
 * Marker for "we looked, and there isn't one" -- use instead of `null`, which is too easy to confuse
 * with `undefined` ~== "we never looked".
 */
export const NONE = "NONE"

/**
 * Our `package.json` version, e.g. `"0.8.0"` -- the app's, for showing in the editor.
 * - NOT the spell language's:  that's `SP.SPELL_VERSION`, which changes on its own schedule.
 * - Handed over by vite -- see `vite.packageVersion.ts`.  `"unknown"` where nothing defines it, e.g. a script
 *   `tsx` runs without importing `src/packageVersion.node.ts`:  EVERYTHING loads `~/util`, so it mustn't throw.
 */
export const PACKAGE_VERSION: string = typeof __PACKAGE_VERSION__ === "string" ? __PACKAGE_VERSION__ : "unknown"

/** Show confirmation dialog. */
export const CONFIRM = "CONFIRM"

/** Task status -- used by `Task`/`TaskList`. */
export const TaskStatus = {
  UNSTARTED: "UNSTARTED",
  ACTIVE: "ACTIVE",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE"
} as const
/** Value type for `TaskStatus`, e.g. `"ACTIVE"`. */
export type TaskStatus = keyof typeof TaskStatus

/** How a `TaskList` should resolve its overall promise -- used by `Task`/`TaskList`. */
export const TaskResolveWith = {
  /** Resolve with just result of last task in list. */
  LAST_TASK: "LAST_TASK",
  /** Resolve with array of every task's result. */
  RESULTS: "RESULTS"
} as const
/** Value type for `TaskResolveWith`, e.g. `"LAST_TASK"`. */
export type TaskResolveWith = keyof typeof TaskResolveWith

/** Well-known file formats as mime-types -- used by `$fetch()`/`LoadableFile` to pick response handling. */
export const KnownFormat = {
  text: "text/plain",
  json: "application/json",
  json5: "application/json5",
  gif: "image/gif",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  binary: "binary" // generic "binary" response, not an actual mime type
} as const
/** Key type for `KnownFormat`, e.g. `"json"`. */
export type KnownFormatName = keyof typeof KnownFormat
/** Value type for `KnownFormat`, e.g. `"application/json"`. */
export type KnownFormatMimeType = (typeof KnownFormat)[keyof typeof KnownFormat]
/** NOTE: same as `KnownFormatMimeType` -- named to read naturally as `format: KnownFormat`. */
export type KnownFormat = KnownFormatMimeType

/**
 * Response types which will return a `blob()` response.
 * - OK to update this in other files.
 */
export const BINARY_FORMATS = [
  "binary",
  "blob",
  KnownFormat.gif,
  KnownFormat.png,
  KnownFormat.jpeg,
  KnownFormat.binary
] as const
/** Value type for `BINARY_FORMATS`. */
export type BinaryFormats = (typeof BINARY_FORMATS)[number]
