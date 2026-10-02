/**
 * Types shared across `$/server`, plus its one small error class.
 * - MUST stay runtime-light:  `import type` only.
 */
import type { SRV } from "$/server"

////////////////
// ## Handlers
////////////////

/**
 * One step of handling a request:  answer through `reply`, or call `next()` to pass it on.
 * - `next(error)` skips to the server's error answer
 * - may be async:  a rejection ~== `next(error)`
 */
export type Handler = (request: SRV.Request, reply: SRV.Reply, next: Next) => unknown

/** Pass a request on to the next handler;  with `error`, straight to the error answer. */
export type Next = (error?: unknown) => void

/** Named parts of a matched route, e.g. `{ projectId: "Solitaire" }`;  a bare `*` lands in `"0"`. */
export type RouteParams = Record<string, string>

/** Query string values:  one string, or several when the key repeats. */
export type Query = Record<string, string | string[]>

////////////////
// ## Static files
////////////////

/**
 * Rewrite an `.html` page on its way out, e.g. inject an import map or `window.SPELL_SERVER`.
 * - `path`:  the URL path asked for;  `file`:  the file on disk
 */
export type HtmlTransform = (html: string, context: ServedFile) => string

/**
 * Turn a file into something else on its way out, e.g. `.ts` -> JavaScript.
 * - returns the new body and its content type
 */
export type FileTransform = (source: string, context: ServedFile) => { body: string | Uint8Array; type: string }

/** The file a static request resolved to. */
export type ServedFile = {
  /** URL path asked for, decoded, e.g. `/packages/docs/index.html` */
  path: string
  /** absolute file on disk */
  file: string
  /** the request, for headers or query */
  request: SRV.Request
}

/**
 * A folder served under a URL prefix.
 * - `prefix`:  e.g. `/element/`;  `/` serves the folder at the root
 * - `dotFiles`:  serve names starting with `.` (default:  403)
 * - `index`:  file a folder resolves to (default `index.html`);  `false`:  folders 404
 */
export type Mount = {
  prefix: string
  dir: string
  dotFiles?: boolean
  index?: string | false
}

////////////////
// ## Servers
////////////////

/**
 * What a running server writes to its pid file, and answers `/_server/ping` with.
 * - `root`:  the folder it serves;  a pid file whose server answers for another root is stale
 */
export type ServerInfo = {
  pid: number
  port: number
  root: string
  /** ISO time it started */
  started: string
  /** branch checked out at `root`, if any */
  branch?: string
  /** worktree name, when `root` is `.claude/worktrees/<name>` */
  worktree?: string
}

////////////////
// ## Errors
////////////////

/**
 * An error with the HTTP status to answer it with, e.g. `new HttpError(413, "body too big")`.
 * - a handler throws it (or `next(it)`s it);  the server answers `status` with `{ error: message }`
 * - `body`:  answered instead of `{ error: message }`, when set
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: unknown
  ) {
    super(message)
  }
}

/** A `FileLock` that stayed held past its wait. */
export class FileLockError extends Error {}
