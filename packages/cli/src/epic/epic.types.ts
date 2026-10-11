import type { CLI } from "$/cli"

/**
 * Types for `spell epic`'s tools (`src/epic/`):  requests sent to an epic from other sessions.
 * - Types only.
 */

/**
 * One request Owen sent an epic from another session (`requests.ts`):  its `request.md`, read.
 * - `from`:  the sending session's title and id, `🚧 python (83d39e12)`
 * - `at`:  when, local time to the minute
 * - `status`:  `new` until the epic's session files it, then `filed`
 * - `filed`:  where it went, `P7 · Comment Threads`
 * - `text`:  Owen's words, verbatim
 * - `context`:  what the sender was looking at
 * - `images`:  file names beside `request.md`
 */
export type EpicRequest = {
  id: string
  epic: string
  from: string
  at: string
  status: string
  filed?: string
  text: string
  context?: string
  images: string[]
}

/** What `sendRequest()` takes:  see its docs. */
export type SendRequestProps = {
  root: string
  epic: string
  text: string
  from?: string
  images?: number
  context?: string
  home?: string
}

/**
 * What `sendRequest()` did.
 * - `folder`:  where the request was written
 * - `receivers`:  the epic's running sessions, to tell (`SendMessage`);  none:  open its window
 * - `fromEpic`:  the sender IS one of the epic's sessions:  it takes the request up itself
 */
export type SentRequest = {
  request: EpicRequest
  folder: string
  receivers: CLI.RunningSession[]
  fromEpic: boolean
}

/** One image from a transcript:  its type (`image/png`) and its bytes, base64. */
export type PastedImage = {
  mediaType: string
  data: string
}

/**
 * `spell epic` flags.
 * - `text` / `file`:  `send`:  Owen's words, given inline or in a file
 * - `images`:  `send`:  how many of the newest pasted images to keep
 * - `from`:  `send`:  the sending session's id (default `CLAUDE_CODE_SESSION_ID`)
 * - `context`:  `send`:  what the sender was looking at
 * - `json`:  print the result as JSON
 */
export type EpicOptions = CLI.GlobalOptions & {
  text?: string
  file?: string
  images?: string
  from?: string
  context?: string
  json?: boolean
}
