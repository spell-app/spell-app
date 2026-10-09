/**
 * Loose types, constants, errors and small pure helpers of the page's server clients:
 * the review inbox's (`ReviewClient`), the running agents' (`AgentsClient`),
 * and the link both write through (`ServerLink`).
 * - The inbox's shapes are the route's own (`$/epics/tool/ReviewInbox`), imported as TYPES only:
 *   erased, so the node-only inbox never reaches the pack, and a reply can't drift from what the server writes.
 */

import { PlanDates } from "$/epics/dates"
import type {
  InboxDraft,
  InboxListener,
  InboxMark,
  InboxRecord,
  InboxUrgency,
  NewKind,
  NowAction,
  NowRequest,
  PickFields,
  WorkingEntry
} from "$/epics/tool/ReviewInbox"

////////////////
// ## Constants
////////////////

/** The review store's routes (`$/epics/tool/reviewRoutes.ts`):  every reply is the page's whole inbox. */
export const REVIEW_API = "/api/review"

/**
 * The pages the routes review:  a plan doc's own path, `.../epics/<name>/<name>.plan.html` (`reviewRoutes.ts`
 * `PLAN_DOC`, the same rule:  any other page gets a 403).
 * A copy anywhere else (`preview-epics/`) isn't reviewed, and doesn't ask.
 */
export const PLAN_DOC_PAGE = /\/(?:packages\/docs\/content\/)?epics\/([^/]+)\/\1\.plan\.html$/

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
 * - only a BACKUP:  notes are kept in the inbox as drafts (`POST draft`), which every address reads;
 *   localStorage is per address (port included), which is how notes got lost (epic `windows-and-review` P1)
 */
export const REVISIT_KEY_PREFIX = "spell-revisit:"

/**
 * What the page says when no Claude session waits on the inbox (plan doc `review-review`, D6):
 * `listening` null, which the routes also answer once a session's heartbeat stops (`ReviewInbox.forPage()`).
 */
export const NOBODY_LISTENING = isAirplane()
  ? "Airplane mode:  queued for when you land (/airplane land)"
  : "No Claude session is reviewing this doc:  this waits for the next /epic review"

/**
 * Airplane mode is on (epic `airplane`):  Owen works with no Claude, and everything waits for `/airplane land`.
 * - the page server says so in `window.SPELL_SERVER.airplane`, as it serves the page (`AirplaneMode`):
 *   a page loaded before `spell dev airplane on` learns it on its next load
 * - `false` outside a browser
 */
export function isAirplane(): boolean {
  return typeof window !== "undefined" && !!(window as { SPELL_SERVER?: { airplane?: boolean } }).SPELL_SERVER?.airplane
}

/**
 * The four review actions of an item's line, in their order:  Approve, Revisit, Make Todo, then Do Now (`details`:
 * the inbox's name for an immediate request, kept from Add Details Now;  decision Q20).
 */
export const REVIEW_ACTIONS = ["approve", "revisit", "todo", "details"] as const

/** One of `REVIEW_ACTIONS`. */
export type ReviewAction = (typeof REVIEW_ACTIONS)[number]

/**
 * The summary's key in the inbox:  `<epic-summary>` has no id of its own (epic `airplane` P2).
 * As `ReviewInbox`'s `SUMMARY_ID`:  a copy, since that module is node-only.
 */
export const SUMMARY_ID = "summary"

/** What a new item from the page may be:  as `ReviewInbox`'s `NEW_KINDS` (a copy:  that module is node-only). */
export const NEW_KINDS = ["todo", "question"] as const

/** The longest title a new item may have:  as `ReviewInbox`'s `MAX_TITLE` (a copy:  that module is node-only). */
export const NEW_TITLE_MAX = 300

/** The page's own reload of its HTML:  the server's current token, as it serves the page now. */
export const SERVER_INFO = /window\.SPELL_SERVER = (\{.*?\})<\/script>/

/** The running-agents routes (`packages/docs/tools/agentRoutes.ts`):  every reply is the epic's list, `{ agents }`. */
export const AGENTS_API = "/api/agents"

/** The running-agents list's file, beside the plan doc (`AgentList.ts`):  the page server announces its changes. */
export const AGENTS_FILE = "agents.json"

////////////////
// ## Types
////////////////

/** The inbox as the page keeps it:  every field a route's reply has that the page reads. */
export type Inbox = Pick<InboxRecord, "marks" | "drafts" | "urgency" | "sent" | "now" | "working" | "listening">

/** A mark to set, before the route stamps it. */
export type MarkInput = Omit<InboxMark, "at">

/** A new item to ask for from the page (`POST new`, epic `airplane` P2):  `near`, the id of what it's about. */
export type NewItemInput = { kind: NewKind; title: string; note?: string; near?: string }

/** A new item waiting in the inbox (`ReviewClient.newItems()`):  its key (`new1`) and its mark. */
export type NewItem = { id: string } & InboxMark & { kind: NewKind; title: string }

/** An item's immediate request on its way or being worked on:  `queued` while it waits with nobody listening. */
export type Running = { action: NowAction; queued: boolean }

/** The page server's facts the client needs:  `window.SPELL_SERVER`'s. */
export type ServerInfo = {
  /** the write token (`x-server-token`) */
  token: string
  /** the page's file, as the server announces changes (`spell-server:file`'s `path`) */
  file?: string
}

/** What a `ServerLink` (and an `AgentsClient`) is made from:  the page's facts, and `fetch` (stubbed in tests). */
export type ServerLinkOptions = {
  /** the page's URL path:  every route's `page` */
  page: string
  /** the page server's info;  none (`file://`, a plain static server):  nothing to review, no agents */
  server?: ServerInfo
  /** `location.protocol`:  `file:` never asks */
  protocol?: string
  /** `fetch`, bound */
  fetch: typeof fetch
}

/** What a `ReviewClient` is made from:  its link's facts, plus the browser's storage and the page's items. */
export type ReviewClientOptions = ServerLinkOptions & {
  /** `localStorage`, for the note backups;  `null`:  none (blocked, private window) */
  storage?: Storage | null
  /**
   * Is `id` an item or section of this page?
   * - a backup for one that's gone is dropped
   * - default:  always
   */
  hasItem?: (id: string) => boolean
}

/** What a write takes, besides its body. */
export type WriteOptions = {
  /** the caller says what went wrong (from `lastWriteError`):  no notice */
  quiet?: boolean
  /** the page is going away:  `fetch`'s `keepalive` */
  keepalive?: boolean
}

/**
 * One running agent, as the page shows it:  `AgentList.ts`'s `RunningAgent`, every field there (`agentsOf()`).
 * - a COPY of that shape:  `epics` never imports `docs`, which holds the list (the root's dependency rule)
 */
export type RunningAgent = {
  /** its full name, prefixed:  `skillz-aaa` */
  name: string
  /** what it does, a sentence or less */
  task: string
  /** `active`, or `blocked on <name>` */
  status: string
  /** when it was added, ISO;  `""` for unknown */
  started: string
  /** Owen's notes to it so far, oldest first */
  redirects: AgentRedirect[]
}

/** A note Owen sent a running agent from the page. */
export type AgentRedirect = {
  /** what he typed */
  note: string
  /** when he sent it, ISO */
  at: string
  /** when a session passed it on, ISO;  `""`:  not yet */
  told: string
}

export type {
  InboxDraft,
  InboxListener,
  InboxMark,
  InboxUrgency,
  NewKind,
  NowAction,
  NowRequest,
  PickFields,
  WorkingEntry
}

////////////////
// ## Errors
////////////////

/**
 * A POST to the page server didn't go through (`ServerLink.post()`).  Its message says why, for people, in
 * lower case (`sentence()` makes it one):  the route's `error`, a stale token, no server.
 */
export class ServerWriteError extends Error {}
ServerWriteError.prototype.name = "ServerWriteError"

////////////////
// ## Helpers
////////////////

/** A route's reply as an inbox, every field there. */
export function inboxOf(reply: unknown): Inbox {
  const record = (reply ?? {}) as Partial<Record<keyof Inbox, unknown>>
  return {
    marks: isObject(record.marks) ? (record.marks as Inbox["marks"]) : {},
    drafts: isObject(record.drafts) ? (record.drafts as Inbox["drafts"]) : {},
    urgency: isObject(record.urgency) ? (record.urgency as Inbox["urgency"]) : {},
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

/**
 * `mark`'s pick, to carry into another mark (a revisit's "pick B, but ..."):  `{ pick, choices? }`, or `{}`.
 * As `ReviewInbox.pickOf()`.
 */
export function pickOf(mark: PickFields | null | undefined): PickFields {
  if (!mark?.pick) return {}
  return { pick: mark.pick, ...(mark.choices !== undefined && { choices: mark.choices }) }
}

/**
 * Is `mark`'s pick option `letter` of card set `choices` (its position among the item's sets, I8)?
 * A mark without `choices` (from before I8) picks from the item's OWN set:  `own` says whether set `choices` is it.
 */
export function picks(mark: PickFields | null | undefined, letter: string, choices: number, own: boolean): boolean {
  if (mark?.pick !== letter) return false
  return mark.choices === undefined ? own : mark.choices === choices
}

/**
 * ISO time `iso` as the reader's clock time, 24-hour, `14:42`;  `""` for none.
 * - a time shown alone (`saved 14:42`, a redirect's `told 14:43`):
 *   `PlanDates`' time half, never the locale's `2:42 PM`
 */
export function clockOf(iso: string | null | undefined): string {
  const date = iso ? new Date(iso) : null
  if (!date || isNaN(date.getTime())) return ""
  return PlanDates.clock(date)
}

/** A route's reply as the running agents, every field there (`AgentList.ts` has their shape);  `[]` for none. */
export function agentsOf(reply: unknown): RunningAgent[] {
  const agents = (reply as { agents?: unknown } | null)?.agents
  if (!Array.isArray(agents)) return []
  return (agents as (Record<string, unknown> | null)[])
    .filter((agent) => typeof agent?.name === "string")
    .map((agent) => ({
      name: agent!.name as string,
      task: stringOr(agent!.task, ""),
      status: stringOr(agent!.status, "active"),
      started: stringOr(agent!.started, ""),
      redirects: (Array.isArray(agent!.redirects) ? (agent!.redirects as (Record<string, unknown> | null)[]) : []).map(
        (redirect) => ({
          note: stringOr(redirect?.note, ""),
          at: stringOr(redirect?.at, ""),
          told: stringOr(redirect?.told, "")
        })
      )
    }))
}

/** `value` when it's a string, else `fallback`:  a reply's field, read safely. */
function stringOr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback
}

/** How long ago ISO time `iso` was, to `now` (ms):  `<1m`, `3m`, `2h 5m`, `1d 4h`;  `""` for none. */
export function ageOf(iso: string, now: number): string {
  const minutes = Math.floor((now - Date.parse(iso)) / 60_000)
  if (Number.isNaN(minutes)) return ""
  if (minutes < 1) return "<1m"
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return minutes % 60 ? `${hours}h ${minutes % 60}m` : `${hours}h`
  const days = Math.floor(hours / 24)
  return hours % 24 ? `${days}d ${hours % 24}h` : `${days}d`
}

/** `message` as a sentence:  a capital first, a full stop last (unless it ends in one already);  `""` for none. */
export function sentence(message: string): string {
  if (!message) return ""
  return `${message[0]!.toUpperCase()}${message.slice(1)}${/[.!?]$/.test(message) ? "" : "."}`
}

/** A plain object (not null, not an array)? */
function isObject(value: unknown): boolean {
  return !!value && typeof value === "object" && !Array.isArray(value)
}
