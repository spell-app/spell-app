/**
 * A plan doc's REVIEW INBOX:  the marks Owen leaves on its items from the page, waiting for Claude.
 * - the file:  `epics/<name>/<name>.inbox.json`, beside `<name>.plan.html` (decision D1 of `review-review`);  absent
 *   until the first mark, and deleted again once nothing is in it (`isEmpty()`)
 * - per machine, NOT committed (`.gitignore`):  pending notes and session state, not the record;  what Claude makes
 *   of a mark lands in the plan doc itself
 * - writers:  the page server's route module (`reviewRoutes.ts`, the page's clicks) and `yarn plan-doc inbox ...`
 *   (P6:  Claude taking the marks).  Both go through `updateInbox()` / `updateInboxAsync()`:  under the file's lock
 *   (`SRV.FileLock`), written atomically (a temp file renamed over it), so neither clobbers the other and a reader
 *   never sees half a file
 * - The helpers on an inbox OBJECT (`setMark()`, `requestNow()`, `markSent()`, `takeNow()` ...) are pure apart from
 *   changing that object:  `inbox.test.js` drives them directly.
 * - Shape (`version: 1`):
 *   - `marks`:  `{ [id]: { action, at, when?, note?, pick? } }`, one per item id (lower-case), the latest wins
 *   - `sent`:  ISO time of the last "send to Claude", else `null`;  marks newer than it are unsent (`unsentMarks()`)
 *   - `now`:  `[{ id, action, at, note? }]`, immediate requests (Add Details, revisit now) for Claude to take
 *   - `working`:  `{ [id]: { action, since } }`, Claude's agents at work on an item (the page shows a spinner)
 *   - `listening`:  `{ session, since }` while a Claude session waits on this inbox, else `null`
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
  return { version: INBOX_VERSION, marks: {}, sent: null, now: [], working: {}, listening: null }
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
 * Is there nothing in `inbox` worth a file?  No marks, no requests, no agents at work, nobody listening.
 * - `sent` alone doesn't count:  it only dates marks, and there are none
 */
export function isEmpty(inbox) {
  return !Object.keys(inbox.marks).length && !inbox.now.length && !Object.keys(inbox.working).length && !inbox.listening
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
  return checked
}

/**
 * Item `id`'s IMMEDIATE request:  queue `{ id, action, at, note? }` on `now` and set its mark.
 * - `details`:  the mark is `details`;  `revisit`:  `revisit` with `when: "now"` and the note
 * - a request already queued for the same item is replaced, not doubled:  two clicks are one request
 * - returns the queued entry
 */
export function requestNow(inbox, id, action, note = "", at = isoTime()) {
  const key = toItemId(id)
  if (!NOW_ACTIONS.includes(action)) throw new InboxError(`not an immediate action:  ${action} (${NOW_ACTIONS})`)
  const mark = action === "revisit" ? { action, when: "now", note } : { action }
  const checked = setMark(inbox, key, mark, at)
  const entry = { id: key, action, at, ...(checked?.note ? { note: checked.note } : {}) }
  inbox.now = inbox.now.filter((each) => each.id !== key)
  inbox.now.push(entry)
  return entry
}

/** Owen pressed "send to Claude":  every mark so far is sent. */
export function markSent(inbox, at = isoTime()) {
  inbox.sent = at
  return inbox
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
  for (const key of keys) delete inbox.marks[key]
  inbox.now = inbox.now.filter((each) => !keys.includes(each.id))
  return had
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
 * - the page says "No Claude session is reviewing this doc" while it's `null` (decision D6)
 */
export function setListening(inbox, session, at = isoTime()) {
  inbox.listening = session === null ? null : { session, since: at }
  return inbox.listening
}

////////////////
// ## Checks
////////////////

/**
 * `mark` from a request, checked:  only its own fields, in a fixed order.
 * - `action`:  one of `ACTIONS`
 * - `revisit`:  `when` `soon` (default) or `now`;  `note` trimmed, `""` when none
 * - `pick`:  `pick` an option card's letter, `A`-`Z`
 * - throws an `InboxError` for anything else;  `at` is never taken from it (the writer stamps it)
 */
export function toMark(mark) {
  if (!mark || typeof mark !== "object" || Array.isArray(mark)) throw new InboxError("a mark is an object, or null")
  const { action, when = "soon", note = "", pick } = mark
  if (!ACTIONS.includes(action)) throw new InboxError(`no such action:  ${action} (${ACTIONS.join(" | ")})`)
  if (action === "revisit") {
    if (!REVISIT_WHEN.includes(when)) throw new InboxError(`revisit when?  ${REVISIT_WHEN.join(" | ")}`)
    if (typeof note !== "string") throw new InboxError("a revisit's note is text")
    return { action, when, note: note.trim() }
  }
  if (action === "pick") {
    if (typeof pick !== "string" || !OPTION_LETTER.test(pick)) throw new InboxError(`pick which option?  ${pick}`)
    return { action, pick }
  }
  return { action }
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
