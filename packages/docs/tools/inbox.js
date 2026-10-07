/**
 * A plan doc's REVIEW INBOX:  the marks Owen leaves on its items from the page, waiting for Claude.
 * - the file:  `epics/<name>/<name>.inbox.json`, beside `<name>.plan.html` (decision D1 of `review-review`);  absent
 *   until the first mark, and deleted again once nothing is in it (`isEmpty()`)
 * - per machine, NOT committed (`.gitignore`):  pending notes and session state, not the record;  what Claude makes
 *   of a mark lands in the plan doc itself
 * - writers:  the page server's route module (`reviewRoutes.ts`, the page's clicks) and `spell dev plan-doc inbox ...`
 *   (Claude taking the marks:  `listen`, `wait`, `apply`, `done`, `clear`).  Both go through `updateInbox()` / `updateInboxAsync()`:  under the file's lock
 *   (`SRV.FileLock`), written atomically (a temp file renamed over it), so neither clobbers the other and a reader
 *   never sees half a file
 * - The helpers on an inbox OBJECT (`setMark()`, `requestNow()`, `markSent()`, `takeNow()` ...) are pure apart from
 *   changing that object:  `inbox.test.js` drives them directly.
 * - Shape (`version: 1`):
 *   - `marks`:  `{ [id]: { action, at, when?, note?, pick? } }`, one per item id (lower-case), the latest wins
 *     - a plain pick:  `{ action: "pick", pick: "B" }`, applied by `plan-doc inbox apply`
 *     - "pick B, but ...":  a revisit carrying the pick, `{ action: "revisit", when, note, pick: "B" }`;  never
 *       applied:  Claude talks it over (`toMark()`)
 *   - `drafts`:  `{ [id]: { action, note, at } }`, a note box's text as Owen types it (`setDraft()`), until the mark
 *     that uses it;  never sent or counted
 *   - `sent`:  ISO time of the last "send to Claude", else `null`;  marks newer than it are unsent (`unsentMarks()`)
 *   - `now`:  `[{ id, action, at, note?, pick? }]`, immediate requests (Add Details, revisit now) for Claude to take
 *   - `working`:  `{ [id]: { action, since } }`, Claude's agents at work on an item (the page shows a spinner)
 *   - `canceled`:  `{ [id]: { action, at, told } }`, a request Owen called off ("nevermind", `cancelNow()`):  the
 *     waiting session stops its agent (`told` once handed over), and a late write into the item is refused
 *   - `listening`:  `{ session, since, seen }` while a Claude session waits on this inbox, else `null`
 *     - `seen`:  its last heartbeat (`plan-doc inbox wait` stamps it every `LISTEN_HEARTBEAT_MS`);  older than
 *       `LISTEN_STALE_MS` (an old file without one:  `since` that old), the session is gone:  `liveListener()` is
 *       `null`, and the routes answer `listening: null` (`forPage()`)
 *   - `handedOver`:  the `sent` time a waiting session last took (`takeWork()`), else `null`:  so a second
 *     `plan-doc inbox wait` doesn't hand the same send over again
 */
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"

import { SRV } from "$/server"

/** The inbox format this module writes;  a file without one is read as this. */
export const INBOX_VERSION = 1

/**
 * What a mark asks of Claude, in the order `plan-doc inbox` prints them.
 * - `approve`:  accept the item as it stands (a judgement call, an answer)
 * - `todo`:  file it as a todo
 * - `details`:  write more details into it (an immediate request:  `requestNow()`)
 * - `revisit`:  talk it through again;  `when` `soon` (with the next batch) or `now` (immediate), `note` Owen's text
 * - `pick`:  a question's option card, by letter (`pick: "B"`)
 */
export const ACTIONS = ["approve", "todo", "details", "revisit", "pick"]

/** Actions an immediate request (`now`) may carry. */
export const NOW_ACTIONS = ["details", "revisit"]

/** A `revisit` mark's `when`. */
export const REVISIT_WHEN = ["soon", "now"]

/** How often a waiting session (`plan-doc inbox wait`) stamps `listening.seen`:  one locked write. */
export const LISTEN_HEARTBEAT_MS = 30_000

/**
 * A `listening` whose heartbeat (`seen`) is older than this is a session that died without `unlisten` (closed
 * tab, crash):  three missed heartbeats.
 */
export const LISTEN_STALE_MS = 90_000

/** An option card's letter. */
const OPTION_LETTER = /^[A-Z]$/

/** An item id:  a letter or two and a number (`q7`, `j12`). */
const ITEM_ID = /^[a-z]{1,2}\d+$/

/** A problem with a request or a file, for the caller to show (the route answers 400). */
export class InboxError extends Error {}

////////////////
// ## The file
////////////////

/**
 * The inbox file of the plan doc at `planDoc`:  `<name>.inbox.json` beside it.
 * - an old plan doc's name (`<name>.html`, before the `.plan.html` rename) gives the same file
 */
export function inboxPath(planDoc) {
  return planDoc.replace(/(\.plan)?\.html$/, ".inbox.json")
}

/** An inbox with nothing in it. */
export function emptyInbox() {
  return {
    version: INBOX_VERSION,
    marks: {},
    drafts: {},
    sent: null,
    now: [],
    working: {},
    canceled: {},
    listening: null,
    handedOver: null
  }
}

/**
 * The inbox in `file`;  an empty one when there's no file.
 * - fills in missing fields, so readers never check:  an older or hand-edited file still reads
 * - NEVER throws on a missing file;  a file that isn't JSON throws an `InboxError` naming it
 */
export function readInbox(file) {
  if (!existsSync(file)) return emptyInbox()
  let raw
  try {
    raw = JSON.parse(readFileSync(file, "utf8"))
  } catch (error) {
    throw new InboxError(`${file} is not JSON:  ${error.message}`)
  }
  return { ...emptyInbox(), ...raw, version: raw.version ?? INBOX_VERSION }
}

/**
 * Write `inbox` to `file`, atomically;  delete the file instead when the inbox is empty (`isEmpty()`).
 * - a temp file (`<file>.tmp`) renamed over it:  readers (the page's poll, `plan-doc inbox`) never see half of it
 * - call it under the lock (`updateInbox()`), or two writers may lose each other's changes
 * - SIDE EFFECT:  writes or removes `file`
 */
export function writeInbox(file, inbox) {
  if (isEmpty(inbox)) return rmSync(file, { force: true })
  writeFileSync(`${file}.tmp`, `${JSON.stringify(inbox, null, 2)}\n`)
  renameSync(`${file}.tmp`, file)
}

/**
 * Change the inbox in `file` with `change(inbox)` under its lock, write it, and return it.
 * - BLOCKS while waiting for the lock (`SRV.FileLock.run()`):  for command-line tools.  A server:
 *   `updateInboxAsync()`
 * - SIDE EFFECT:  writes `file` (or removes it:  `writeInbox()`)
 */
export function updateInbox(file, change) {
  return SRV.FileLock.run(file, () => {
    const inbox = readInbox(file)
    change(inbox)
    writeInbox(file, inbox)
    return inbox
  })
}

/**
 * `updateInbox()` for a server:  waits for the lock with timers, so it keeps serving meanwhile.
 * - `change` runs synchronously, under the lock
 * - SIDE EFFECT:  writes `file` (or removes it)
 */
export function updateInboxAsync(file, change) {
  return SRV.FileLock.runAsync(file, async () => {
    const inbox = readInbox(file)
    change(inbox)
    writeInbox(file, inbox)
    return inbox
  })
}

/**
 * Is there nothing in `inbox` worth a file?  No marks, no drafts, no requests, no agents at work, nobody listening.
 * - `sent` and `handedOver` alone don't count:  they only date marks, and there are none
 */
export function isEmpty(inbox) {
  return (
    !Object.keys(inbox.marks).length &&
    !Object.keys(inbox.drafts).length &&
    !inbox.now.length &&
    !Object.keys(inbox.working).length &&
    !Object.keys(inbox.canceled).length &&
    !inbox.listening
  )
}

////////////////
// ## Drafts
////////////////

/** Actions whose mark carries a note Owen types:  their note box's text is kept as a draft until it's marked. */
export const NOTE_ACTIONS = ["revisit", "todo"]

/**
 * Item `id`'s note box text, as Owen types it (epic `windows-and-review` P1):  kept here, on the server, so a
 * reload from ANY address finds it (the page's `localStorage` is per address, and lost notes that way);  `note`
 * empty or `null` drops it.
 * - not a mark:  never sent, never counted, never wakes a waiting session;  the mark that uses it drops it
 *   (`setMark()`, `requestNow()`)
 * - `note` kept as typed (not trimmed:  the box shows it back as it was)
 * - returns the draft set, or `null`
 */
export function setDraft(inbox, id, action, note, at = isoTime()) {
  const key = toItemId(id)
  if (!NOTE_ACTIONS.includes(action)) throw new InboxError(`no note box on ${action} (${NOTE_ACTIONS.join(" | ")})`)
  if (note !== null && typeof note !== "string") throw new InboxError("a draft's note is text, or null")
  if (!note?.trim()) {
    delete inbox.drafts[key]
    return null
  }
  inbox.drafts[key] = { action, note, at }
  return inbox.drafts[key]
}

////////////////
// ## Marks
////////////////

/**
 * Set item `id`'s mark to `mark` (checked:  `toMark()`), stamped `at`;  `null` removes it.
 * - the latest mark wins:  a new one replaces the old, whatever its action
 * - removing it, or replacing it with one that waits for a send, drops the item's queued `now` request:  Owen
 *   changed his mind before Claude took it
 * - returns the mark set, or `null`
 */
export function setMark(inbox, id, mark, at = isoTime()) {
  const key = toItemId(id)
  const checked = mark === null ? null : { ...toMark(mark), at }
  if (!checked || !isImmediate(checked)) inbox.now = inbox.now.filter((each) => each.id !== key)
  if (checked) inbox.marks[key] = checked
  else delete inbox.marks[key]
  // the note box's text is in the mark now;  a mark removed (Clear) takes its unsent text with it
  if (!checked || checked.note !== undefined) delete inbox.drafts[key]
  return checked
}

/**
 * Item `id`'s IMMEDIATE request:  queue `{ id, action, at, note?, pick? }` on `now` and set its mark.
 * - `details`:  the mark is `details`;  `revisit`:  `revisit` with `when: "now"` and the note
 * - a revisit keeps the item's pick (a `pick` mark's, or a revisit's):  "pick B, but ..." asked now
 * - a request already queued for the same item is replaced, not doubled:  two clicks are one request
 * - returns the queued entry
 */
export function requestNow(inbox, id, action, note = "", at = isoTime()) {
  const key = toItemId(id)
  if (!NOW_ACTIONS.includes(action)) throw new InboxError(`not an immediate action:  ${action} (${NOW_ACTIONS})`)
  const pick = inbox.marks[key]?.pick
  const mark = action === "revisit" ? { action, when: "now", note, ...(pick && { pick }) } : { action }
  const checked = setMark(inbox, key, mark, at)
  const entry = {
    id: key,
    action,
    at,
    ...(checked?.note ? { note: checked.note } : {}),
    ...(checked?.pick ? { pick: checked.pick } : {})
  }
  inbox.now = inbox.now.filter((each) => each.id !== key)
  inbox.now.push(entry)
  // asked again:  an earlier "nevermind" is over
  delete inbox.canceled[key]
  return entry
}

/**
 * "Nevermind" (epic `windows-and-review` P2):  Owen calls off item `id`'s immediate request (Add Details, revisit
 * now), queued or already being worked on.
 * - its `now` entry, its `working` and its immediate mark go;  a mark waiting for a send isn't one, and stays
 * - recorded in `canceled` (`{ action, at, told }`):  a waiting session is woken to stop the item's agent
 *   (`takeWork()`, `told`), and `plan-doc details` refuses that agent's late write (`isCanceled()`), until
 *   `inbox done | clear` or a new request for the item
 * - returns the entry recorded, or `null` when nothing was asked or running
 */
export function cancelNow(inbox, id, at = isoTime()) {
  const key = toItemId(id)
  const queued = inbox.now.find((each) => each.id === key)
  const work = inbox.working[key]
  const mark = inbox.marks[key]
  if (!queued && !work && !(mark && isImmediate(mark))) return null
  inbox.now = inbox.now.filter((each) => each.id !== key)
  delete inbox.working[key]
  if (mark && isImmediate(mark)) delete inbox.marks[key]
  // a request still queued was never taken:  nobody to tell
  const action = work?.action ?? queued?.action ?? (mark?.action === "revisit" ? "revisit" : "details")
  inbox.canceled[key] = { action, at, told: !work }
  return inbox.canceled[key]
}

/** Did Owen call off item `id`'s request (`cancelNow()`), and nothing asked since? */
export function isCanceled(inbox, id) {
  return toItemId(id) in inbox.canceled
}

/** Owen pressed "send to Claude":  every mark so far is sent. */
export function markSent(inbox, at = isoTime()) {
  inbox.sent = at
  return inbox
}

/**
 * "Review Now" (epic `windows-and-review` P4, Q2):  send every mark AND have the listening session work through the
 * batch at once;  returns the ids it asked now.
 * - each revisit waiting for a send, or sent and still being talked over, becomes an immediate request
 *   (`requestNow()`, its note and its pick kept):  a background agent answers it INTO its item (Q3), the page's
 *   spinner on it meanwhile
 * - approvals, picks and todos go with the send (`markSent()`), as "send to Claude" sends them
 */
export function reviewNow(inbox, at = isoTime()) {
  const revisits = markList(inbox).filter((mark) => mark.action === "revisit" && !isImmediate(mark))
  for (const mark of revisits) requestNow(inbox, mark.id, "revisit", mark.note ?? "", at)
  markSent(inbox, at)
  return revisits.map((mark) => mark.id)
}

/**
 * Marks waiting for Owen's "send to Claude":  `[{ id, ...mark }]`, oldest first.
 * - newer than `sent` (all of them before the first send)
 * - NOT immediate ones (`details`, `revisit` `now`):  `requestNow()` already handed them over
 */
export function unsentMarks(inbox) {
  const sent = inbox.sent ? Date.parse(inbox.sent) : -Infinity
  return markList(inbox).filter((mark) => !isImmediate(mark) && Date.parse(mark.at) > sent)
}

/**
 * Marks a "send to Claude" handed over:  `[{ id, ...mark }]`, oldest first.
 * - made at or before `sent`;  none before the first send
 * - NOT immediate ones:  those went through `now` (`takeWork()`)
 * - still here until Claude applies or clears them:  a revisit being talked over stays sent
 */
export function sentMarks(inbox) {
  if (!inbox.sent) return []
  const sent = Date.parse(inbox.sent)
  return markList(inbox).filter((mark) => !isImmediate(mark) && Date.parse(mark.at) <= sent)
}

/** Every mark as `[{ id, ...mark }]`, oldest first. */
export function markList(inbox) {
  return Object.entries(inbox.marks)
    .map(([id, mark]) => ({ id, ...mark }))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
}

/** Is `mark` an immediate request (`requestNow()`), not one waiting for a send? */
export function isImmediate(mark) {
  return mark.action === "details" || (mark.action === "revisit" && mark.when === "now")
}

/**
 * Remove the marks of items `ids` (Claude applied them);  returns the ids that had one.
 * - their `now` requests go too
 */
export function clearMarks(inbox, ids) {
  const keys = ids.map(toItemId)
  const had = keys.filter((key) => key in inbox.marks)
  for (const key of keys) {
    delete inbox.marks[key]
    // the session is through with the item:  a "nevermind" on it has done its job
    delete inbox.canceled[key]
  }
  inbox.now = inbox.now.filter((each) => !keys.includes(each.id))
  return had
}

/**
 * Claude's agent finished items `ids` (`plan-doc inbox done`):  their IMMEDIATE marks go (`clearMarks()`).
 * Returns `{ had, kept }`:  the ids whose mark went, and those whose mark stayed.
 * - a mark Owen changed meanwhile to one waiting for a send stays, for the next send:  e.g. he asked "revisit now",
 *   then chose card B while the agent worked (now a revisit `soon` with the note and the `pick`)
 */
export function finishMarks(inbox, ids) {
  const keys = ids.map(toItemId)
  const kept = keys.filter((key) => key in inbox.marks && !isImmediate(inbox.marks[key]))
  const had = clearMarks(
    inbox,
    keys.filter((key) => !kept.includes(key))
  )
  return { had, kept }
}

////////////////
// ## Claude's side (P6)
////////////////

/** Take every queued immediate request:  returns them, oldest first, and empties `now`. */
export function takeNow(inbox) {
  const taken = inbox.now
  inbox.now = []
  return taken
}

/**
 * Claude's agent started (`action`) or finished (`null`) work on item `id`:  the page's spinner follows.
 * - returns the entry set, or `null`
 */
export function setWorking(inbox, id, action, at = isoTime()) {
  const key = toItemId(id)
  if (action === null) {
    delete inbox.working[key]
    return null
  }
  inbox.working[key] = { action, since: at }
  return inbox.working[key]
}

/**
 * Claude session `session` started (or, `null`, stopped) waiting on this inbox.
 * - `seen`:  its first heartbeat (`touchListening()`)
 * - the page says "No Claude session is reviewing this doc" while it's `null`, or stale (`liveListener()`;
 *   decision D6)
 */
export function setListening(inbox, session, at = isoTime()) {
  inbox.listening = session === null ? null : { session, since: at, seen: at }
  return inbox.listening
}

/**
 * The listening session's heartbeat:  `listening.seen` is `at`.  Nobody listening:  nothing (a heartbeat never
 * starts one:  that's `listen`'s).
 * - `plan-doc inbox wait` calls it every `LISTEN_HEARTBEAT_MS`;  the session's other inbox commands, each time
 */
export function touchListening(inbox, at = isoTime()) {
  if (inbox.listening) inbox.listening.seen = at
  return inbox.listening
}

/**
 * The session listening:  `null` when nobody is, or its heartbeat stopped (`seen`, an old file's `since`, older
 * than `LISTEN_STALE_MS` at `now`, in ms).
 * - why:  a session killed without `unlisten` leaves `listening` set;  the page must not claim it's there
 */
export function liveListener(inbox, now = Date.now()) {
  const listening = inbox.listening
  if (!listening) return null
  const seen = Date.parse(listening.seen ?? listening.since)
  return now - seen > LISTEN_STALE_MS ? null : listening
}

/**
 * `inbox` as the page reads it (every route's answer):  the whole inbox, but `listening` `null` once stale
 * (`liveListener()`), so the page keeps no clock rule of its own.
 */
export function forPage(inbox, now = Date.now()) {
  return { ...inbox, listening: liveListener(inbox, now) }
}

/**
 * Is there work for a waiting session (`plan-doc inbox wait`)?  A queued immediate request, or a send it hasn't
 * taken yet (`newSend()`).
 * - cheap, and read without the lock:  `takeWork()` checks again under it
 */
export function hasWork(inbox) {
  return inbox.now.length > 0 || newSend(inbox) || Object.values(inbox.canceled).some((each) => !each.told)
}

/** Has Owen pressed "send to Claude" since a waiting session last took a send (`handedOver`)? */
export function newSend(inbox) {
  if (!inbox.sent) return false
  return !inbox.handedOver || Date.parse(inbox.sent) > Date.parse(inbox.handedOver)
}

/**
 * TAKE the work waiting for a session:  `{ now, sent }`, or `null` when there's none.
 * - `now`:  the queued immediate requests (`takeNow()`), each item marked `working` (the page's spinner) until
 *   Claude's agent is done (`plan-doc inbox done`);  their marks stay till then
 * - `sent`:  `{ at, marks }` for a send not handed over yet (`newSend()`), else `null`:  every sent mark
 *   (`sentMarks()`), each `again: true` when an earlier send already handed it over (a revisit still being talked
 *   over);  `handedOver` becomes `sent`, so a send is taken once
 *   - a send with no marks left (all applied) is taken quietly:  nothing to wake for
 * - call it under the lock (`updateInbox()`)
 */
export function takeWork(inbox, at = isoTime()) {
  const now = takeNow(inbox)
  for (const each of now) setWorking(inbox, each.id, each.action, at)
  let sent = null
  if (newSend(inbox)) {
    const before = inbox.handedOver ? Date.parse(inbox.handedOver) : -Infinity
    const marks = sentMarks(inbox).map((mark) => ({ ...mark, again: Date.parse(mark.at) <= before }))
    inbox.handedOver = inbox.sent
    if (marks.length) sent = { at: inbox.sent, marks }
  }
  // "nevermind"s for work a session took:  stop those agents (`cancelNow()`)
  const canceled = Object.entries(inbox.canceled)
    .filter(([, each]) => !each.told)
    .map(([id, { action, at: when }]) => ({ id, action, at: when }))
  for (const { id } of canceled) inbox.canceled[id].told = true
  return now.length || sent || canceled.length ? { now, sent, canceled } : null
}

/**
 * Remove the marks Claude applied, `[{ id, at }]`, but only while each is still the one applied:  a mark Owen
 * changed meanwhile (a newer `at`) stays, for the next round.  Returns the ids cleared.
 */
export function clearApplied(inbox, marks) {
  const cleared = []
  for (const { id, at } of marks) {
    const key = toItemId(id)
    if (inbox.marks[key]?.at !== at) continue
    delete inbox.marks[key]
    cleared.push(key)
  }
  return cleared
}

////////////////
// ## Checks
////////////////

/**
 * `mark` from a request, checked:  only its own fields, in a fixed order.
 * - `action`:  one of `ACTIONS`
 * - `revisit`:  `when` `soon` (default) or `now`;  `note` trimmed, `""` when none;  `pick` too, when given (a
 *   letter):  "pick B, but ...", a question's pick with a remark, talked over rather than applied
 * - `pick`:  `pick` an option card's letter, `A`-`Z`
 * - `todo`:  `note` trimmed, kept only when there is one
 * - throws an `InboxError` for anything else;  `at` is never taken from it (the writer stamps it)
 */
export function toMark(mark) {
  if (!mark || typeof mark !== "object" || Array.isArray(mark)) throw new InboxError("a mark is an object, or null")
  const { action, when = "soon", note = "", pick } = mark
  if (!ACTIONS.includes(action)) throw new InboxError(`no such action:  ${action} (${ACTIONS.join(" | ")})`)
  if (action === "revisit") {
    if (!REVISIT_WHEN.includes(when)) throw new InboxError(`revisit when?  ${REVISIT_WHEN.join(" | ")}`)
    if (typeof note !== "string") throw new InboxError("a revisit's note is text")
    if (pick === undefined || pick === null) return { action, when, note: note.trim() }
    return { action, when, note: note.trim(), pick: toLetter(pick) }
  }
  if (action === "pick") return { action, pick: toLetter(pick) }
  // Make Todo's note box (epic `windows-and-review` P2):  why it's worth following up
  if (action === "todo") {
    if (typeof note !== "string") throw new InboxError("a todo's note is text")
    return note.trim() ? { action, note: note.trim() } : { action }
  }
  return { action }
}

/** `pick` as an option card's letter (`A`-`Z`);  an `InboxError` when it isn't one. */
function toLetter(pick) {
  if (typeof pick !== "string" || !OPTION_LETTER.test(pick)) throw new InboxError(`pick which option?  ${pick}`)
  return pick
}

/** `id` as the inbox keys it:  lower-case, as the item's element id;  an `InboxError` when it isn't an item id. */
export function toItemId(id) {
  const key = typeof id === "string" ? id.toLowerCase() : ""
  if (!ITEM_ID.test(key)) throw new InboxError(`not an item id:  ${id}`)
  return key
}

/**
 * The item ids in plan doc `html`:  every `<ui-item>` carrying both an `id` and a `data-status` (an item, not a
 * phase step or a plain list entry).
 * - text, not a DOM:  cheap enough to run on every request
 */
export function itemIds(html) {
  const ids = new Set()
  for (const [tag] of html.matchAll(/<ui-item\b[^>]*>/g)) {
    const id = /\sid="([^"]+)"/.exec(tag)?.[1]
    if (id && /\sdata-status="/.test(tag)) ids.add(id.toLowerCase())
  }
  return ids
}

/**
 * `date` as ISO local time with its offset, to the MILLISECOND:  `2026-10-04T15:02:11.042-04:00`.
 * - as `plan-doc.js` `isoTime()`, plus milliseconds (not imported:  that file imports this one, and pulls in
 *   linkedom)
 * - why milliseconds:  `unsentMarks()` compares a mark's `at` with `sent`;  to the second, a mark made in the same
 *   second as a send would pass for sent
 */
export function isoTime(date = new Date()) {
  const minutes = -date.getTimezoneOffset()
  const sign = minutes < 0 ? "-" : "+"
  const offset = `${sign}${pad(Math.floor(Math.abs(minutes) / 60))}:${pad(Math.abs(minutes) % 60)}`
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  const clock = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  return `${day}T${clock}.${pad(date.getMilliseconds(), 3)}${offset}`

  /** `7` -> `07` (`width` 2), or `007` (3). */
  function pad(value, width = 2) {
    return String(value).padStart(width, "0")
  }
}
