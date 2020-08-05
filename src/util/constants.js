/** Operation or resource is optional */
export const OPTIONAL = "OPTIONAL"

/** Operation or resource is required -- we'll throw an error if it's not found. */
export const REQUIRED = "REQUIRED"

/** Show confirmation dialog. */
export const CONFIRM = "CONFIRM"

/** Task status */
export const UNSTARTED = "UNSTARTED"
export const ACTIVE = "ACTIVE"
export const SUCCESS = "SUCCESS"
export const FAILURE = "FAILURE"
export const CANCELLED = "CANCELLED"

/** ResolveWith. */
export const LAST = "LAST"
export const RESULTS = "RESULTS"

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
