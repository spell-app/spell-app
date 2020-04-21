/** Operation is optional */
export const OPTIONAL = Symbol("OPTIONAL")

/** Skip some operation */
export const SKIP = Symbol("SKIP")

/** Loading states. */
export const UNLOADED = Symbol("UNLOADED")
export const LOADING = Symbol("LOADING")
export const LOADED = Symbol("LOADED")
export const LOAD_ERROR = Symbol("LOAD_ERROR")

/** Saving states. */
export const DIRTY = Symbol("DIRTY")
export const UNSAVED = Symbol("UNSAVED")
export const SAVING = Symbol("SAVING")
export const SAVED = Symbol("SAVED")
export const SAVE_ERROR = Symbol("SAVE_ERROR")

/** Well-known file formats as mime-types. */
export const KNOWN_FORMATS = {
  text: "text/plain",
  json: "application/json",
  json5: "application/json5",
  gif: "image/gif",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  binary: "binary" // generic "binary" response, not an actual mime type
}

/** Response types which will return a `blob()` response.
 * OK to update this in other files.
 */
export const BINARY_FORMATS = [
  "binary",
  "blob",
  KNOWN_FORMATS.gif,
  KNOWN_FORMATS.png,
  KNOWN_FORMATS.jpeg,
  KNOWN_FORMATS.binary
]
