/** Operation or resource is optional */
export const OPTIONAL = "OPTIONAL"

/** Operation or resource is required -- we'll throw an error if it's not found. */
export const REQUIRED = "REQUIRED"

/** Show confirmation dialog. */
export const CONFIRM = "CONFIRM"

/** Task status */
export const TaskStatus = {
  UNSTARTED: "UNSTARTED",
  ACTIVE: "ACTIVE",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE"
} as const
export type TaskStatus = keyof typeof TaskStatus

/** ResolveWith. */
export const TaskResolveWith = {
  LAST_TASK: "LAST_TASK",
  RESULTS: "RESULTS"
} as const
export type TaskResolveWith = keyof typeof TaskResolveWith

/** Well-known file formats as mime-types. */
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
export type KnownFormatName = keyof typeof KnownFormat
export type KnownFormatMimeType = (typeof KnownFormat)[keyof typeof KnownFormat]
export type KnownFormat = KnownFormatMimeType

/** Response types which will return a `blob()` response.
 * OK to update this in other files.
 */
export const BINARY_FORMATS = [
  "binary",
  "blob",
  KnownFormat.gif,
  KnownFormat.png,
  KnownFormat.jpeg,
  KnownFormat.binary
] as const
export type BinaryFormats = (typeof BINARY_FORMATS)[number]
