/**
 * Loose types, constants and small pure helpers of the review client (`ReviewClient`).
 * - The inbox's shapes are the route's own (`$/epics/tool/ReviewInbox`), imported as TYPES only:  erased, so the
 *   node-only inbox never reaches the pack, and a reply can't drift from what the server writes.
 */

import type {
  InboxDraft,
  InboxListener,
  InboxMark,
  InboxRecord,
  NowAction,
  NowRequest,
  WorkingEntry
} from "$/epics/tool/ReviewInbox"

////////////////
// ## Constants
////////////////

/** The review store's routes (`$/epics/tool/reviewRoutes.ts`):  every reply is the page's whole inbox. */
export const REVIEW_API = "/api/review"

/** How often a VISIBLE page re-reads its inbox, so what Claude does to it shows. */
export const REVIEW_POLL_MS = 4000

/** How long a note box waits after the last keystroke before saving its draft. */
export const DRAFT_SAVE_MS = 10_000

/** How long a review notice stays up. */
export const NOTICE_MS = 6000

/** How long a note box opened for the reader keeps taking the focus while its item's body loads. */
export const FOCUS_HOLD_MS = 3000

/**
 * localStorage key prefix of a page's note-box backups:  `spell-revisit:<path>`, `{ [item id]: text }`.
 * - the SAME key as the old runtime's (`spell-doc-runtime.js` `REVISIT_KEY_PREFIX`):  a note half-typed on a page
 *   the old runtime drew is handed to the inbox here (`ReviewClient.adoptBackups()`)
 * - only a BACKUP:  notes are kept in the inbox as drafts (`POST draft`), which every address reads;  localStorage
 *   is per address (port included), which is how notes got lost (epic `windows-and-review` P1)
 */
export const REVISIT_KEY_PREFIX = "spell-revisit:"

/**
 * What the page says when no Claude session waits on the inbox (plan doc `review-review`, D6):  `listening` null,
 * which the routes also answer once a session's heartbeat stops (`ReviewInbox.forPage()`).
 */
export const NOBODY_LISTENING = "No Claude session is reviewing this doc:  this waits for the next /epic review"

/** The four review actions of an item's line, in their order. */
export const REVIEW_ACTIONS = ["approve", "todo", "revisit", "details"] as const

/** One of `REVIEW_ACTIONS`. */
export type ReviewAction = (typeof REVIEW_ACTIONS)[number]

/** The page's own reload of its HTML:  the server's current token, as it serves the page now. */
export const SERVER_INFO = /window\.SPELL_SERVER = (\{.*?\})<\/script>/

////////////////
// ## Types
////////////////

/** The inbox as the page keeps it:  every field a route's reply has that the page reads. */
export type Inbox = Pick<InboxRecord, "marks" | "drafts" | "sent" | "now" | "working" | "listening">

/** A mark to set, before the route stamps it. */
export type MarkInput = Omit<InboxMark, "at">

/** An item's immediate request on its way or being worked on:  `queued` while it waits with nobody listening. */
export type Running = { action: NowAction; queued: boolean }

/** The page server's facts the client needs:  `window.SPELL_SERVER`'s. */
export type ServerInfo = {
  /** the write token (`x-server-token`) */
  token: string
  /** the page's file, as the server announces changes (`spell-server:file`'s `path`) */
  file?: string
}

/** What a client is made from:  the page's facts, and the browser's services (stubbed in tests). */
export type ReviewClientOptions = {
  /** the page's URL path:  every route's `page` */
  page: string
  /** the page server's info;  none (`file://`, a plain static server):  nothing to review */
  server?: ServerInfo
  /** `location.protocol`:  `file:` never reviews */
  protocol?: string
  /** `fetch`, bound */
  fetch: typeof fetch
  /** `localStorage`, for the note backups;  `null`:  none (blocked, private window) */
  storage?: Storage | null
  /** Is `id` an item or section of this page?  A backup for one that's gone is dropped.  Default:  always. */
  hasItem?: (id: string) => boolean
}

/** What a write takes, besides its body. */
export type WriteOptions = {
  /** the caller says what went wrong (from `lastWriteError`):  no notice */
  quiet?: boolean
  /** the page is going away:  `fetch`'s `keepalive` */
  keepalive?: boolean
}

export type { InboxDraft, InboxListener, InboxMark, NowAction, NowRequest, WorkingEntry }

////////////////
// ## Helpers
////////////////

/** A route's reply as an inbox, every field there. */
export function inboxOf(reply: unknown): Inbox {
  const record = (reply ?? {}) as Partial<Record<keyof Inbox, unknown>>
  return {
    marks: isObject(record.marks) ? (record.marks as Inbox["marks"]) : {},
    drafts: isObject(record.drafts) ? (record.drafts as Inbox["drafts"]) : {},
    sent: typeof record.sent === "string" ? record.sent : null,
    now: Array.isArray(record.now) ? (record.now as NowRequest[]) : [],
    working: isObject(record.working) ? (record.working as Inbox["working"]) : {},
    listening: isObject(record.listening) ? (record.listening as InboxListener) : null
  }
}

/** An empty inbox:  before the first read. */
export function emptyInbox(): Inbox {
  return inboxOf(null)
}

/**
 * Has `mark` gone to Claude?  Made before the last "Send to Claude" (`sent`, ISO time or null), or an immediate one
 * (Add Details, revisit now:  handed over when made), as `ReviewInbox.unsentMarks` counts.
 */
export function isSent(mark: { action: string; when?: string; at: string }, sent: string | null): boolean {
  if (isImmediate(mark)) return true
  return !!sent && Date.parse(mark.at) <= Date.parse(sent)
}

/** Is `mark` an immediate request (Add Details, revisit now), handed over when made?  As `ReviewInbox`'s. */
export function isImmediate(mark: { action: string; when?: string }): boolean {
  return mark.action === "details" || (mark.action === "revisit" && mark.when === "now")
}

/** ISO time `iso` as the reader's clock time, `10:42`;  `""` for none. */
export function clockOf(iso: string | null | undefined): string {
  const date = iso ? new Date(iso) : null
  if (!date || isNaN(date.getTime())) return ""
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

/** A plain object (not null, not an array)? */
function isObject(value: unknown): boolean {
  return !!value && typeof value === "object" && !Array.isArray(value)
}
