import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"

import { SRV } from "$/server"

import { CommentList, type Comment } from "./CommentList"

/****************
 * ### `ReviewInbox`
 * A plan doc's REVIEW INBOX:  the marks Owen leaves on its items from the page, waiting for Claude.
 * - the file:  `epics/<name>/<name>.inbox.json`, beside `<name>.plan.html` (decision D1 of `review-review`);
 *   absent until the first mark, and deleted again once nothing is in it (`isEmpty`)
 * - per machine, NOT committed (`.gitignore`):  pending notes and session state, not the record;
 *   what Claude makes of a mark lands in the plan doc itself
 * - writers:  the page server's route module (`reviewRoutes.ts`, the page's clicks)
 *   and `spell dev plan-doc inbox ...` (Claude taking the marks:  `listen`, `wait`, `apply`, `done`, `clear`).
 *   Both go through `ReviewInbox.update()` / `updateAsync()`:
 *   under the file's lock (`SRV.FileLock`), written atomically (a temp file renamed over it),
 *   so neither clobbers the other and a reader never sees half a file
 * - an instance IS the file's JSON:  its own fields are exactly the file's keys, in the file's order
 *   (so `JSON.stringify()` writes it, and a route answers with it), plus any key a hand edit added;
 *   its methods change only it, so `ReviewInbox.test.ts` drives them directly
 * - Shape (`version: 1`):
 *   - `marks`:
 *     `{ [id]: { action, at, when?, note?, pick?, choices? } }`, one per item id (lower-case), the latest wins
 *     - what takes a mark (`itemIds()`):  an item, an Overview sub-section (`o3`), a phase (`p3`), and the summary,
 *       keyed `summary` (it has no id of its own;  epic `airplane` P2)
 *     - a NEW item Owen asks for from the page (epic `airplane` P2), `{ action: "new", kind, title, note?, near? }`
 *       - under a key of its own, `new1`, `new2` ... (`setNew()`), so several wait at once
 *       - `kind`:  `todo` or `question`;  `near`:  the id of what it's about
 *       - sent with the rest;  `plan-doc inbox apply` makes the item
 *     - a plain pick, `{ action: "pick", pick: "B", choices: 1 }`, on any item kind (I8):
 *       applied by `plan-doc inbox apply`
 *       - `choices`:  WHICH of the item's option card sets, by position, 0 the first (`PlanItem.choiceSets()`):
 *         one item may hold several (its text's, a reply's)
 *       - none (an older mark):  the item's own (`PlanItem.choicesOf()`)
 *     - "pick B, but ...":  a revisit carrying the pick, `{ action: "revisit", when, note, pick: "B" }`;
 *       never applied:  Claude talks it over (`toMark()`)
 *   - `drafts`:  `{ [id]: { action, note, at } }`, a note box's text as Owen types it (`setDraft()`),
 *     until the mark that uses it;  never sent or counted
 *   - `urgency`:  `{ [id]: { calm, at } }`, Owen's click on an open judgement call's or issue's id chip
 *     (`setUrgency()`):  `calm` true, not urgent (blue);  false, urgent (red) again.
 *     Beside its mark, never one:
 *     sent with the marks, written into the doc by `plan-doc inbox apply` (`<epic-item calm>`)
 *   - `sent`:  ISO time of the last "send to Claude", else `null`;  marks newer than it are unsent (`unsentMarks`)
 *   - `now`, `[{ id, action, at, note?, pick?, choices? }]`:
 *     immediate requests (Add Details, revisit now) for Claude to take
 *   - `working`:  `{ [id]: { action, since } }`, Claude's agents at work on an item (the page shows a spinner)
 *   - `canceled`:  `{ [id]: { action, at, told } }`, a request Owen called off ("nevermind", `cancelNow()`):
 *     the waiting session stops its agent (`told` once handed over), and a late write into the item is refused
 *   - `listening`:  `{ session, since, seen }` while a Claude session waits on this inbox, else `null`
 *     - `seen`:  its last heartbeat (`plan-doc inbox wait` stamps it every `LISTEN_HEARTBEAT_MS`);
 *       older than `LISTEN_STALE_MS` (an old file without one:  `since` that old), the session is gone:
 *       `liveListener()` is `null`, and the routes answer `listening: null` (`forPage()`)
 *   - `handedOver`:  the `sent` time a waiting session last took (`takeWork()`), else `null`:
 *     so a second `plan-doc inbox wait` doesn't hand the same send over again
 *   - `comments`:  `{ [cm1 ...]: comment }`, Owen's comments on the page's blocks and on selected text (epic
 *     `airplane` P11), in the shape a guide's inbox holds them (`CommentList`):  waiting until Claude answers them
 *     like a revisit's note (`/epic review`, `/airplane land`), then `answered` (`plan-doc inbox done cm3`);
 *     never sent:  a saved comment is waiting
 * - Node only (`node:fs`, `$/server`'s lock):  NOT in the `$/epics` barrel, imported by path.
 *   Imports no other file of the tool but `CommentList` (its comments).
 * - From `packages/docs/tools/inbox.js` (epic `epic-components`, P7), which now forwards here.
 ****************/
export class ReviewInbox {
  /** the format this writes;  a file without one is read as this */
  version: number = INBOX_VERSION
  /** one mark per item id (lower-case), the latest wins */
  marks: Record<string, InboxMark> = {}
  /** a note box's text as Owen types it, per item:  never sent or counted */
  drafts: Record<string, InboxDraft> = {}
  /** Owen's urgency for an item (its id chip clicked), until applied */
  urgency: Record<string, InboxUrgency> = {}
  /** ISO time of the last "send to Claude", else `null` */
  sent: string | null = null
  /** immediate requests (Add Details, revisit now), oldest first */
  now: NowRequest[] = []
  /** Claude's agents at work, per item (the page's spinner) */
  working: Record<string, WorkingEntry> = {}
  /** requests Owen called off ("nevermind"), per item */
  canceled: Record<string, InboxCancel> = {}
  /** the Claude session waiting on this inbox, else `null` */
  listening: InboxListener | null = null
  /** the `sent` time a waiting session last took, else `null` */
  handedOver: string | null = null
  /** Owen's comments on the page's blocks, by id (`cm1` ...):  `CommentList` */
  comments: Record<string, Comment> = {}

  /**
   * An inbox:  empty, or the fields of `record` (a file's JSON) over an empty one's.
   * - a field the record lacks keeps its empty value, so readers never check;  a key it adds is kept, after them
   */
  constructor(record: Partial<InboxRecord> & Record<string, unknown> = {}) {
    Object.assign(this, record)
  }

  /** The comments, to read or change (in place). */
  get commentList(): CommentList {
    return new CommentList(this.comments)
  }

  ////////////////
  // ## The file
  ////////////////

  /**
   * The inbox file of the plan doc at `planDoc`:  `<name>.inbox.json` beside it.
   * - an old plan doc's name (`<name>.html`, before the `.plan.html` rename) gives the same file
   * - STATIC, as every file helper here:  they work on paths, before any inbox is read
   */
  static pathFor(planDoc: string): string {
    return planDoc.replace(/(\.plan)?\.html$/, ".inbox.json")
  }

  /**
   * The inbox in `file`;  an empty one when there's no file.
   * - fills in missing fields, so readers never check:  an older or hand-edited file still reads
   * - NEVER throws on a missing file;  a file that isn't JSON throws an `InboxError` naming it
   */
  static read(file: string): ReviewInbox {
    if (!existsSync(file)) return new ReviewInbox()
    let raw: Record<string, unknown>
    try {
      raw = JSON.parse(readFileSync(file, "utf8"))
    } catch (error) {
      throw new InboxError(`${file} is not JSON:  ${(error as Error).message}`)
    }
    return new ReviewInbox({ ...raw, version: (raw.version as number | undefined) ?? INBOX_VERSION })
  }

  /**
   * Write this inbox to `file`, atomically;  delete the file instead when the inbox is empty (`isEmpty`).
   * - a temp file (`<file>.tmp`) renamed over it:  readers (the page's poll, `plan-doc inbox`) never see half of it
   * - call it under the lock (`update()`), or two writers may lose each other's changes
   * - SIDE EFFECT:  writes or removes `file`
   */
  writeTo(file: string): void {
    if (this.isEmpty) return rmSync(file, { force: true })
    writeFileSync(`${file}.tmp`, `${JSON.stringify(this, null, 2)}\n`)
    renameSync(`${file}.tmp`, file)
  }

  /**
   * Change the inbox in `file` with `change(inbox)` under its lock, write it, and return it.
   * - BLOCKS while waiting for the lock (`SRV.FileLock.run()`):  for command-line tools.  A server:  `updateAsync()`
   * - SIDE EFFECT:  writes `file` (or removes it:  `writeTo()`)
   */
  static update(file: string, change: (inbox: ReviewInbox) => unknown): ReviewInbox {
    return SRV.FileLock.run(file, () => {
      const inbox = ReviewInbox.read(file)
      change(inbox)
      inbox.writeTo(file)
      return inbox
    })
  }

  /**
   * `update()` for a server:  waits for the lock with timers, so it keeps serving meanwhile.
   * - `change` runs synchronously, under the lock
   * - SIDE EFFECT:  writes `file` (or removes it)
   */
  static updateAsync(file: string, change: (inbox: ReviewInbox) => unknown): Promise<ReviewInbox> {
    return SRV.FileLock.runAsync(file, async () => {
      const inbox = ReviewInbox.read(file)
      change(inbox)
      inbox.writeTo(file)
      return inbox
    })
  }

  /**
   * Is there nothing in this inbox worth a file?
   * No marks, no drafts, no urgency, no requests, no agents at work, nobody listening.
   * - `sent` and `handedOver` alone don't count:  they only date marks, and there are none
   */
  get isEmpty(): boolean {
    return (
      !Object.keys(this.marks).length &&
      !Object.keys(this.drafts).length &&
      !Object.keys(this.urgency).length &&
      !this.now.length &&
      !Object.keys(this.working).length &&
      !Object.keys(this.canceled).length &&
      !Object.keys(this.comments).length &&
      !this.listening
    )
  }

  ////////////////
  // ## Drafts
  ////////////////

  /**
   * Item `id`'s note box text, as Owen types it (epic `windows-and-review` P1):  kept here, on the server, so a
   * reload from ANY address finds it (the page's `localStorage` is per address, and lost notes that way);
   * `note` empty or `null` drops it.
   * - not a mark:  never sent, never counted, never wakes a waiting session;
   *   the mark that uses it drops it (`setMark()`, `requestNow()`)
   * - `note` kept as typed (not trimmed:  the box shows it back as it was)
   * - returns the draft set, or `null`
   */
  setDraft(id: unknown, action: unknown, note: unknown, at = isoTime()): InboxDraft | null {
    const key = ReviewInbox.toItemId(id)
    if (!isNoteAction(action)) throw new InboxError(`no note box on ${action} (${NOTE_ACTIONS.join(" | ")})`)
    if (note !== null && typeof note !== "string") throw new InboxError("a draft's note is text, or null")
    if (!note?.trim()) {
      delete this.drafts[key]
      return null
    }
    this.drafts[key] = { action, note, at }
    return this.drafts[key]
  }

  ////////////////
  // ## Urgency
  ////////////////

  /**
   * Owen's urgency for item `id` (its id chip clicked while the page is reviewed):  `calm` true, not urgent (blue);
   * false, urgent (red);  `null` drops it (clicked back to what the doc says).
   * - not a mark:  an item may hold both (approve it AND say it's not urgent);  sent with the marks, as they are
   *   (`sentUrgency`), and written into the doc by `plan-doc inbox apply` (`PlanDoc.setCalm()`)
   * - only an open judgement call or issue is ever red for want of a review (`PlanReader.itemState()`):
   *   only their ids (`CALM_ID`);  an `InboxError` for any other
   * - returns the entry set, or `null`
   */
  setUrgency(id: unknown, calm: unknown, at = isoTime()): InboxUrgency | null {
    const key = ReviewInbox.toItemId(id)
    if (!CALM_ID.test(key)) throw new InboxError(`only a judgement call or an issue is urgent or not:  ${key}`)
    if (calm !== null && typeof calm !== "boolean") throw new InboxError("calm is true, false, or null")
    if (calm === null) {
      delete this.urgency[key]
      return null
    }
    this.urgency[key] = { calm, at }
    return this.urgency[key]
  }

  /** Every urgency as `[{ id, calm, at }]`, oldest first. */
  get urgencyList(): ListedUrgency[] {
    return Object.entries(this.urgency)
      .map(([id, entry]) => ({ id, ...entry }))
      .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
  }

  /** Urgency a "send to Claude" handed over:  set at or before `sent`;  none before the first send. */
  get sentUrgency(): ListedUrgency[] {
    if (!this.sent) return []
    const sent = Date.parse(this.sent)
    return this.urgencyList.filter((entry) => Date.parse(entry.at) <= sent)
  }

  /** Urgency waiting for Owen's "send to Claude":  newer than `sent` (all of it before the first send). */
  get unsentUrgency(): ListedUrgency[] {
    const sent = this.sent ? Date.parse(this.sent) : -Infinity
    return this.urgencyList.filter((entry) => Date.parse(entry.at) > sent)
  }

  /**
   * Remove the urgency Claude applied, `[{ id, at }]`, but only while each is still the one applied (as
   * `clearApplied()`);  returns the ids cleared.
   */
  clearUrgency(entries: { id: string; at: string }[]): string[] {
    const cleared: string[] = []
    for (const { id, at } of entries) {
      const key = ReviewInbox.toItemId(id)
      if (this.urgency[key]?.at !== at) continue
      delete this.urgency[key]
      cleared.push(key)
    }
    return cleared
  }

  ////////////////
  // ## Marks
  ////////////////

  /**
   * Set item `id`'s mark to `mark` (checked:  `toMark()`), stamped `at`;  `null` removes it.
   * - the latest mark wins:  a new one replaces the old, whatever its action
   * - removing it, or replacing it with one that waits for a send, drops the item's queued `now` request:
   *   Owen changed his mind before Claude took it
   * - returns the mark set, or `null`
   */
  setMark(id: unknown, mark: unknown, at = isoTime()): InboxMark | null {
    const key = ReviewInbox.toItemId(id)
    const checked = mark === null ? null : { ...ReviewInbox.toMark(mark), at }
    if (checked && (checked.action === "new") !== NEW_ID.test(key))
      throw new InboxError(`a new item is asked for under its own key (new1 ...), never on an item:  ${key}`)
    if (!checked || !ReviewInbox.isImmediate(checked)) this.now = this.now.filter((each) => each.id !== key)
    if (checked) this.marks[key] = checked
    else delete this.marks[key]
    // the note box's text is in the mark now;  a mark removed (Clear) takes its unsent text with it
    if (!checked || checked.note !== undefined) delete this.drafts[key]
    return checked
  }

  /**
   * A NEW item Owen asks for from the page (epic `airplane` P2):  `entry` (`{ kind, title, note?, near? }`, checked:
   * `toMark()`) under key `id`, or (none) the next free key, `new1`, `new2` ...;  `entry` `null` removes it.
   * - a mark like any other, `{ action: "new", ... }`:  sent with the rest (`unsentMarks`), made into an item by
   *   `plan-doc inbox apply` (`PlanDoc.applyMark()`), editable or removable until then
   * - the key is chosen here, under the inbox's lock:  two pages adding at once never take the same one
   * - returns the key, or `null` once removed
   * - throws an `InboxError` for a bad entry, a key that isn't a new item's, or a removal without a key
   */
  setNew(id: unknown, entry: unknown, at = isoTime()): string | null {
    const given = id !== undefined && id !== null
    if (given && (typeof id !== "string" || !NEW_ID.test(id.toLowerCase())))
      throw new InboxError(`not a new item's key:  ${JSON.stringify(id)}`)
    if (entry === null) {
      if (!given) throw new InboxError("remove which new item?  its key (new1 ...)")
      this.setMark(id, null, at)
      return null
    }
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new InboxError("a new item is an object")
    const key = given ? ReviewInbox.toItemId(id) : this.nextNewId()
    this.setMark(key, { ...entry, action: "new" }, at)
    return key
  }

  /** The next free new item key:  `new<N>`, one past the highest waiting. */
  private nextNewId(): string {
    const numbers = Object.keys(this.marks)
      .filter((key) => NEW_ID.test(key))
      .map((key) => Number(key.slice(NEW_PREFIX.length)))
    return `${NEW_PREFIX}${Math.max(0, ...numbers) + 1}`
  }

  /**
   * Item `id`'s IMMEDIATE request:  queue `{ id, action, at, note?, pick?, choices? }` on `now` and set its mark.
   * - `details`:  the mark is `details`;  `revisit`:  `revisit` with `when: "now"` and the note
   * - a revisit keeps the item's pick (a `pick` mark's, or a revisit's, with its card set):
   *   "pick B, but ..." asked now
   * - a request already queued for the same item is replaced, not doubled:  two clicks are one request
   * - returns the queued entry
   */
  requestNow(id: unknown, action: unknown, note = "", at = isoTime()): NowRequest {
    const key = ReviewInbox.toItemId(id)
    if (!isNowAction(action)) throw new InboxError(`not an immediate action:  ${action} (${NOW_ACTIONS})`)
    const pick = ReviewInbox.pickOf(this.marks[key])
    const mark = action === "revisit" ? { action, when: "now", note, ...pick } : { action }
    const checked = this.setMark(key, mark, at)
    const entry: NowRequest = {
      id: key,
      action,
      at,
      ...(checked?.note ? { note: checked.note } : {}),
      ...ReviewInbox.pickOf(checked)
    }
    this.now = this.now.filter((each) => each.id !== key)
    this.now.push(entry)
    // asked again:  an earlier "nevermind" is over
    delete this.canceled[key]
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
  cancelNow(id: unknown, at = isoTime()): InboxCancel | null {
    const key = ReviewInbox.toItemId(id)
    const queued = this.now.find((each) => each.id === key)
    const work = this.working[key]
    const mark = this.marks[key]
    if (!queued && !work && !(mark && ReviewInbox.isImmediate(mark))) return null
    this.now = this.now.filter((each) => each.id !== key)
    delete this.working[key]
    if (mark && ReviewInbox.isImmediate(mark)) delete this.marks[key]
    // a request still queued was never taken:  nobody to tell
    const action = work?.action ?? queued?.action ?? (mark?.action === "revisit" ? "revisit" : "details")
    this.canceled[key] = { action, at, told: !work }
    return this.canceled[key]
  }

  /** Did Owen call off item `id`'s request (`cancelNow()`), and nothing asked since? */
  isCanceled(id: unknown): boolean {
    return ReviewInbox.toItemId(id) in this.canceled
  }

  /** Owen pressed "send to Claude":  every mark so far is sent. */
  markSent(at = isoTime()): this {
    this.sent = at
    return this
  }

  /**
   * "Review Now" (epic `windows-and-review` P4, Q2):  send every mark AND have the listening session work through
   * the batch at once;  returns the ids it asked now.
   * - each revisit waiting for a send, or sent and still being talked over, becomes an immediate request
   *   (`requestNow()`, its note and its pick kept):  a background agent answers it INTO its item (Q3), the page's
   *   spinner on it meanwhile
   * - approvals, picks and todos go with the send (`markSent()`), as "send to Claude" sends them
   */
  reviewNow(at = isoTime()): string[] {
    const revisits = this.markList.filter((mark) => mark.action === "revisit" && !ReviewInbox.isImmediate(mark))
    for (const mark of revisits) this.requestNow(mark.id, "revisit", mark.note ?? "", at)
    this.markSent(at)
    return revisits.map((mark) => mark.id)
  }

  /**
   * Marks waiting for Owen's "send to Claude":  `[{ id, ...mark }]`, oldest first.
   * - newer than `sent` (all of them before the first send)
   * - NOT immediate ones (`details`, `revisit` `now`):  `requestNow()` already handed them over
   */
  get unsentMarks(): ListedMark[] {
    const sent = this.sent ? Date.parse(this.sent) : -Infinity
    return this.markList.filter((mark) => !ReviewInbox.isImmediate(mark) && Date.parse(mark.at) > sent)
  }

  /**
   * Marks a "send to Claude" handed over:  `[{ id, ...mark }]`, oldest first.
   * - made at or before `sent`;  none before the first send
   * - NOT immediate ones:  those went through `now` (`takeWork()`)
   * - still here until Claude applies or clears them:  a revisit being talked over stays sent
   */
  get sentMarks(): ListedMark[] {
    if (!this.sent) return []
    const sent = Date.parse(this.sent)
    return this.markList.filter((mark) => !ReviewInbox.isImmediate(mark) && Date.parse(mark.at) <= sent)
  }

  /** Every mark as `[{ id, ...mark }]`, oldest first. */
  get markList(): ListedMark[] {
    return Object.entries(this.marks)
      .map(([id, mark]) => ({ id, ...mark }))
      .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
  }

  /**
   * Remove the marks of items `ids` (Claude applied them);  returns the ids that had one.
   * - their `now` requests go too
   */
  clearMarks(ids: string[]): string[] {
    const keys = ids.map(ReviewInbox.toItemId)
    const had = keys.filter((key) => key in this.marks)
    for (const key of keys) {
      delete this.marks[key]
      // the session is through with the item:  a "nevermind" on it has done its job
      delete this.canceled[key]
    }
    this.now = this.now.filter((each) => !keys.includes(each.id))
    return had
  }

  /**
   * Claude's agent finished items `ids` (`plan-doc inbox done`):  their IMMEDIATE marks go (`clearMarks()`).
   * Returns `{ had, kept }`:  the ids whose mark went, and those whose mark stayed.
   * - a mark Owen changed meanwhile to one waiting for a send stays, for the next send:
   *   e.g. he asked "revisit now", then chose card B while the agent worked
   *   (now a revisit `soon` with the note and the `pick`)
   */
  finishMarks(ids: string[]): { had: string[]; kept: string[] } {
    const keys = ids.map(ReviewInbox.toItemId)
    const kept = keys.filter((key) => key in this.marks && !ReviewInbox.isImmediate(this.marks[key]))
    const had = this.clearMarks(keys.filter((key) => !kept.includes(key)))
    return { had, kept }
  }

  ////////////////
  // ## Claude's side (P6)
  ////////////////

  /** Take every queued immediate request:  returns them, oldest first, and empties `now`. */
  takeNow(): NowRequest[] {
    const taken = this.now
    this.now = []
    return taken
  }

  /**
   * Claude's agent started (`action`) or finished (`null`) work on item `id`:  the page's spinner follows.
   * - returns the entry set, or `null`
   */
  setWorking(id: unknown, action: NowAction | null, at = isoTime()): WorkingEntry | null {
    const key = ReviewInbox.toItemId(id)
    if (action === null) {
      delete this.working[key]
      return null
    }
    this.working[key] = { action, since: at }
    return this.working[key]
  }

  /**
   * Claude session `session` started (or, `null`, stopped) waiting on this inbox.
   * - `seen`:  its first heartbeat (`touchListening()`)
   * - the page says "No Claude session is reviewing this doc" while it's `null`, or stale (`liveListener()`;
   *   decision D6)
   */
  setListening(session: string | null, at = isoTime()): InboxListener | null {
    this.listening = session === null ? null : { session, since: at, seen: at }
    return this.listening
  }

  /**
   * The listening session's heartbeat:  `listening.seen` is `at`.
   * Nobody listening:  nothing (a heartbeat never starts one:  that's `listen`'s).
   * - `plan-doc inbox wait` calls it every `LISTEN_HEARTBEAT_MS`;  the session's other inbox commands, each time
   */
  touchListening(at = isoTime()): InboxListener | null {
    if (this.listening) this.listening.seen = at
    return this.listening
  }

  /**
   * The session listening:  `null` when nobody is, or its heartbeat stopped (`seen`, an old file's `since`, older
   * than `LISTEN_STALE_MS` at `now`, in ms).
   * - why:  a session killed without `unlisten` leaves `listening` set;  the page must not claim it's there
   */
  liveListener(now = Date.now()): InboxListener | null {
    const listening = this.listening
    if (!listening) return null
    const seen = Date.parse(listening.seen ?? listening.since)
    return now - seen > LISTEN_STALE_MS ? null : listening
  }

  /**
   * The inbox as the page reads it (every route's answer):  the whole inbox, but `listening` `null` once stale
   * (`liveListener()`), so the page keeps no clock rule of its own.
   * - a plain copy:  this inbox is untouched
   */
  forPage(now = Date.now()): InboxRecord {
    return { ...this.toRecord(), listening: this.liveListener(now) }
  }

  /**
   * The inbox as a plain record:  its own fields, the file's keys in the file's order (a hand-added one too).
   * - a shallow copy:  what `JSON.stringify()` writes of this inbox
   */
  toRecord(): InboxRecord {
    return Object.assign({}, this)
  }

  /**
   * Is there work for a waiting session (`plan-doc inbox wait`)?
   * A queued immediate request, or a send it hasn't taken yet (`hasNewSend`).
   * - cheap, and read without the lock:  `takeWork()` checks again under it
   */
  get hasWork(): boolean {
    return this.now.length > 0 || this.hasNewSend || Object.values(this.canceled).some((each) => !each.told)
  }

  /** Has Owen pressed "send to Claude" since a waiting session last took a send (`handedOver`)? */
  get hasNewSend(): boolean {
    if (!this.sent) return false
    return !this.handedOver || Date.parse(this.sent) > Date.parse(this.handedOver)
  }

  /**
   * TAKE the work waiting for a session:  `{ now, sent, canceled }`, or `null` when there's none.
   * - `now`:  the queued immediate requests (`takeNow()`), each item marked `working` (the page's spinner) until
   *   Claude's agent is done (`plan-doc inbox done`);  their marks stay till then
   * - `sent`:  `{ at, marks, urgency }` for a send not handed over yet (`hasNewSend`), else `null`:
   *   every sent mark (`sentMarks`), each `again: true` when an earlier send already handed it over
   *   (a revisit still being talked over), and the sent urgency (`sentUrgency`);
   *   `handedOver` becomes `sent`, so a send is taken once
   *   - a send with nothing left (all applied) is taken quietly:  nothing to wake for
   * - `canceled`:  "nevermind"s for work a session took:  stop those agents (`cancelNow()`)
   * - call it under the lock (`update()`)
   */
  takeWork(at = isoTime()): TakenWork | null {
    const now = this.takeNow()
    for (const each of now) this.setWorking(each.id, each.action, at)
    let sent: TakenWork["sent"] = null
    if (this.hasNewSend) {
      const before = this.handedOver ? Date.parse(this.handedOver) : -Infinity
      const marks = this.sentMarks.map((mark) => ({ ...mark, again: Date.parse(mark.at) <= before }))
      const urgency = this.sentUrgency
      this.handedOver = this.sent
      if (marks.length || urgency.length) sent = { at: this.sent!, marks, urgency }
    }
    const canceled = Object.entries(this.canceled)
      .filter(([, each]) => !each.told)
      .map(([id, { action, at: when }]) => ({ id, action, at: when }))
    for (const { id } of canceled) this.canceled[id].told = true
    return now.length || sent || canceled.length ? { now, sent, canceled } : null
  }

  /**
   * Remove the marks Claude applied, `[{ id, at }]`, but only while each is still the one applied:
   * a mark Owen changed meanwhile (a newer `at`) stays, for the next round.  Returns the ids cleared.
   */
  clearApplied(marks: { id: string; at: string }[]): string[] {
    const cleared: string[] = []
    for (const { id, at } of marks) {
      const key = ReviewInbox.toItemId(id)
      if (this.marks[key]?.at !== at) continue
      delete this.marks[key]
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
   *   letter):  "pick B, but ...", a pick with a remark, talked over rather than applied
   * - `pick`:  `pick` an option card's letter, `A`-`Z`
   * - with a pick:  `choices` too, when given:  which of the item's option card sets it's from, by position (`0`,
   *   `1` ...:  I8);  none, the item's own
   * - `todo`, `next`, `drop`:  `note` trimmed, kept only when there is one
   * - `new` (a new item, `setNew()`):  `kind` one of `NEW_KINDS`;  `title` trimmed, never empty, at most
   *   `MAX_TITLE` characters;  `note` trimmed, kept only when there is one;  `near` an id (`toItemId()`, lower-case),
   *   kept only when given.  Whether the doc HAS that id is the route's to check (it reads the doc)
   * - throws an `InboxError` for anything else;  `at` is never taken from it (the writer stamps it)
   * - STATIC, as every check here:  pure, on a request before any inbox is read
   */
  static toMark(mark: unknown): CheckedMark {
    if (!mark || typeof mark !== "object" || Array.isArray(mark)) throw new InboxError("a mark is an object, or null")
    const { action, when = "soon", note = "", pick, choices } = mark as Record<string, unknown>
    if (action === "new") return toNewItem(mark as Record<string, unknown>)
    if (!isAction(action)) throw new InboxError(`no such action:  ${action} (${ACTIONS.join(" | ")})`)
    if (action === "revisit") {
      if (!REVISIT_WHEN.includes(when as RevisitWhen))
        throw new InboxError(`revisit when?  ${REVISIT_WHEN.join(" | ")}`)
      if (typeof note !== "string") throw new InboxError("a revisit's note is text")
      if (pick === undefined || pick === null) return { action, when: when as RevisitWhen, note: note.trim() }
      return { action, when: when as RevisitWhen, note: note.trim(), pick: toLetter(pick), ...toChoices(choices) }
    }
    if (action === "pick") return { action, pick: toLetter(pick), ...toChoices(choices) }
    // Make Todo's note box (epic `windows-and-review` P2):  why it's worth following up;
    // a todo's plane and x take the note box's words too (Owen, 2026-10-09)
    if (action === "todo" || action === "next" || action === "drop") {
      if (typeof note !== "string") throw new InboxError(`a ${action} mark's note is text`)
      return note.trim() ? { action, note: note.trim() } : { action }
    }
    return { action }
  }

  /**
   * `id` as the inbox keys it:  lower-case, as the item's element id;  an `InboxError` when it isn't an item id.
   * - also the summary's key, `summary`, and a new item's, `new1` (epic `airplane` P2)
   */
  static toItemId(this: void, id: unknown): string {
    const key = typeof id === "string" ? id.toLowerCase() : ""
    if (!ITEM_ID.test(key) && key !== SUMMARY_ID && !NEW_ID.test(key)) throw new InboxError(`not an item id:  ${id}`)
    return key
  }

  /** Is `id` a new item's key (`new1`:  `setNew()`), not something the doc has? */
  static isNewId(this: void, id: string): boolean {
    return NEW_ID.test(id.toLowerCase())
  }

  /**
   * `mark`'s pick, to carry into another mark:  `{ pick, choices? }`, or `{}` when it has none.
   * - "pick B, but ...":  a pick that becomes a revisit, or a revisit asked now, keeps WHICH cards it picked from
   */
  static pickOf(mark: PickFields | null | undefined): PickFields {
    if (!mark?.pick) return {}
    return { pick: mark.pick, ...(mark.choices !== undefined && { choices: mark.choices }) }
  }

  /** Is `mark` an immediate request (`requestNow()`), not one waiting for a send? */
  static isImmediate(mark: { action: string; when?: string }): boolean {
    return mark.action === "details" || (mark.action === "revisit" && mark.when === "now")
  }

  /**
   * The ids a review mark may name in plan doc `html` (a skeleton:  every item's line is in it):
   * - every `<epic-item id>`, and every Overview sub-section, `<epic-section kind="overview-part" id>`
   *   (Q14:  they take review notes too)
   * - every phase, `<epic-phase id>`, and the summary, `summary` while the doc has an `<epic-summary>` (epic
   *   `airplane` P2:  notes on them too)
   * - text, not a DOM:  cheap enough to run on every request;  attributes in any order, across lines
   */
  static itemIds(html: string): Set<string> {
    const ids = new Set<string>()
    for (const [tag, name] of html.matchAll(/<(epic-item|epic-section|epic-phase|epic-summary)\b[^>]*>/g)) {
      if (name === "epic-summary") {
        ids.add(SUMMARY_ID)
        continue
      }
      const id = /\sid="([^"]+)"/.exec(tag)?.[1]
      if (!id) continue
      const markable =
        name === "epic-item" || name === "epic-phase" || (name === "epic-section" && /\skind="overview-part"/.test(tag))
      if (markable) ids.add(id.toLowerCase())
    }
    return ids
  }
}

/** A problem with a request or a file, for the caller to show (the route answers 400). */
export class InboxError extends Error {}
InboxError.prototype.name = "InboxError"

////////////////
// ## Types
////////////////

/** An inbox file's JSON:  `ReviewInbox`'s own fields (see its banner for each one's meaning). */
export type InboxRecord = {
  version: number
  marks: Record<string, InboxMark>
  drafts: Record<string, InboxDraft>
  urgency: Record<string, InboxUrgency>
  sent: string | null
  now: NowRequest[]
  working: Record<string, WorkingEntry>
  canceled: Record<string, InboxCancel>
  listening: InboxListener | null
  handedOver: string | null
  comments: Record<string, Comment>
}

/** One item's mark, as stored:  checked (`ReviewInbox.toMark()`) and stamped. */
export type InboxMark = CheckedMark & { at: string }

/**
 * A mark as `ReviewInbox.toMark()` checks it, before it's stamped.
 * - `when`, `note`:  a revisit's (`note` a todo's and a new item's too);  `pick`:  a pick's letter, or a revisit's
 *   "pick B, but ..."
 * - `choices`:  with a pick, which of the item's option card sets it's from, by position (I8);  none:  its own
 * - `kind`, `title`, `near`:  a new item's (`action: "new"`, epic `airplane` P2)
 */
export type CheckedMark = { action: MarkAction; when?: RevisitWhen; note?: string } & PickFields & NewItemFields

/**
 * A new item's fields (`action: "new"`, `ReviewInbox.setNew()`):  `kind` `todo` or `question`, `title`, and `near`,
 * the id of what it's about (an item, a phase, an Overview sub-section, `summary`).
 */
export type NewItemFields = { kind?: NewKind; title?: string; near?: string }

/**
 * A pick's fields, on a mark or a `now` request:  `pick`, the option's letter;  `choices`, which of the item's
 * `<epic-choices>` it's from, by position (`PlanItem.choiceSets()`), none for the item's own (`choicesOf()`).
 */
export type PickFields = { pick?: string; choices?: number }

/** A mark with its item id:  `markList`, `sentMarks`, `unsentMarks`. */
export type ListedMark = { id: string } & InboxMark

/** A note box's text, as typed. */
export type InboxDraft = { action: NoteAction; note: string; at: string }

/** Owen's urgency for an item:  `calm` true, not urgent;  false, urgent again. */
export type InboxUrgency = { calm: boolean; at: string }

/** An urgency with its item id:  `urgencyList`, `sentUrgency`, `unsentUrgency`. */
export type ListedUrgency = { id: string } & InboxUrgency

/** An immediate request, queued on `now`. */
export type NowRequest = { id: string; action: NowAction; at: string; note?: string } & PickFields

/** An agent at work on an item. */
export type WorkingEntry = { action: NowAction; since: string }

/** A request Owen called off;  `told` once a waiting session heard of it. */
export type InboxCancel = { action: NowAction; at: string; told: boolean }

/** The session waiting on the inbox:  `seen` its last heartbeat (missing in an old file). */
export type InboxListener = { session: string; since: string; seen?: string }

/** What `ReviewInbox.takeWork()` hands a waiting session. */
export type TakenWork = {
  now: NowRequest[]
  sent: { at: string; marks: (ListedMark & { again: boolean })[]; urgency: ListedUrgency[] } | null
  canceled: { id: string; action: NowAction; at: string }[]
}

////////////////
// ## Constants
////////////////

/** The inbox format this module writes;  a file without one is read as this. */
export const INBOX_VERSION = 1

/**
 * What a mark asks of Claude, in the order `plan-doc inbox` prints them.
 * - `approve`:  accept the item as it stands (a judgement call, an answer)
 * - `todo`:  file it as a todo
 * - `next`:  a todo's plane (Owen, 2026-10-09):  do it in the next phase,
 *   queued into the first phase still to do (`PlanDoc.applyAction()`)
 * - `drop`:  a todo's x:  drop it, canceled
 * - `details`:  write more details into it (an immediate request:  `requestNow()`)
 * - `revisit`:  talk it through again;  `when` `soon` (with the next batch) or `now` (immediate), `note` Owen's text
 * - `pick`:  an option card, by letter (`pick: "B"`), on any item (I8):  `choices` says which card set
 * - `new`:  a new todo or question Owen asks for from the page (`setNew()`, epic `airplane` P2), under its own key
 */
export const ACTIONS = ["approve", "todo", "next", "drop", "details", "revisit", "pick", "new"] as const
/** One of `ACTIONS`. */
export type MarkAction = (typeof ACTIONS)[number]

/** What a new item from the page may be (`setNew()`):  `plan-doc add`'s kinds Owen asks for. */
export const NEW_KINDS = ["todo", "question"] as const
/** One of `NEW_KINDS`. */
export type NewKind = (typeof NEW_KINDS)[number]

/** The summary's key in the inbox:  `<epic-summary>` has no id of its own (epic `airplane` P2). */
export const SUMMARY_ID = "summary"

/** Actions an immediate request (`now`) may carry. */
export const NOW_ACTIONS = ["details", "revisit"] as const
/** One of `NOW_ACTIONS`. */
export type NowAction = (typeof NOW_ACTIONS)[number]

/** Actions whose mark carries a note Owen types:  their note box's text is kept as a draft until it's marked. */
export const NOTE_ACTIONS = ["revisit", "todo"] as const
/** One of `NOTE_ACTIONS`. */
export type NoteAction = (typeof NOTE_ACTIONS)[number]

/** A `revisit` mark's `when`. */
export const REVISIT_WHEN = ["soon", "now"] as const
/** One of `REVISIT_WHEN`. */
export type RevisitWhen = (typeof REVISIT_WHEN)[number]

/** How often a waiting session (`plan-doc inbox wait`) stamps `listening.seen`:  one locked write. */
export const LISTEN_HEARTBEAT_MS = 30_000

/**
 * A `listening` whose heartbeat (`seen`) is older than this is a session that died without `unlisten` (closed
 * tab, crash):  three missed heartbeats.
 */
export const LISTEN_STALE_MS = 90_000

/** An option card's letter. */
const OPTION_LETTER = /^[A-Z]$/

/** The highest card set position a pick may name:  a sanity bound, far above any item's count. */
const MAX_CHOICES = 99

/** An item id:  a letter or two and a number (`q7`, `j12`;  a phase's `p3`, an Overview sub-section's `o3`). */
const ITEM_ID = /^[a-z]{1,2}\d+$/

/** A new item's key (`setNew()`):  `new1`, `new2` ... */
const NEW_PREFIX = "new"
const NEW_ID = /^new\d+$/

/** The longest title a new item may have:  a line, not a page. */
const MAX_TITLE = 300

/**
 * The items Owen may call urgent or not (`setUrgency()`):  judgement calls and issues, the kinds red while open and
 * not reviewed (`PlanReader.itemState()`, the same rule:  `CALM_ID` in `planDoc.types.ts`).
 */
const CALM_ID = /^[ij]\d+$/

////////////////
// ## Helpers
////////////////

/** Is `action` one of `ACTIONS`? */
function isAction(action: unknown): action is MarkAction {
  return ACTIONS.includes(action as MarkAction)
}

/** Is `action` one of `NOW_ACTIONS`? */
function isNowAction(action: unknown): action is NowAction {
  return NOW_ACTIONS.includes(action as NowAction)
}

/** Is `action` one of `NOTE_ACTIONS`? */
function isNoteAction(action: unknown): action is NoteAction {
  return NOTE_ACTIONS.includes(action as NoteAction)
}

/** `pick` as an option card's letter (`A`-`Z`);  an `InboxError` when it isn't one. */
function toLetter(pick: unknown): string {
  if (typeof pick !== "string" || !OPTION_LETTER.test(pick)) throw new InboxError(`pick which option?  ${pick}`)
  return pick
}

/**
 * A new item's mark (`action: "new"`) from a request, checked (`ReviewInbox.toMark()`):
 * `{ action, kind, title, note?, near? }`, in that order.
 * - an `InboxError` for a bad kind, a missing or long title, a note that isn't text, or a `near` that isn't an id
 */
function toNewItem({ kind, title, note = "", near }: Record<string, unknown>): CheckedMark {
  if (!NEW_KINDS.includes(kind as NewKind)) throw new InboxError(`a new what?  ${kind} (${NEW_KINDS.join(" | ")})`)
  if (typeof title !== "string" || !title.trim()) throw new InboxError("a new item needs a title")
  if (title.trim().length > MAX_TITLE) throw new InboxError(`a title is a line:  ${MAX_TITLE} characters at most`)
  if (typeof note !== "string") throw new InboxError("a new item's note is text")
  const about = near === undefined || near === null || near === "" ? undefined : ReviewInbox.toItemId(near)
  if (about && NEW_ID.test(about)) throw new InboxError(`a new item can't be about another one:  ${near}`)
  return {
    action: "new",
    kind: kind as NewKind,
    title: title.trim(),
    ...(note.trim() ? { note: note.trim() } : {}),
    ...(about ? { near: about } : {})
  }
}

/**
 * `choices`, a pick's card set by position, as a mark's field:  `{ choices }`, or `{}` when not given;
 * an `InboxError` when it isn't a whole number from 0 to `MAX_CHOICES`.
 */
function toChoices(choices: unknown): { choices?: number } {
  if (choices === undefined || choices === null) return {}
  if (!Number.isInteger(choices) || (choices as number) < 0 || (choices as number) > MAX_CHOICES)
    throw new InboxError(`pick from which option cards?  ${JSON.stringify(choices)}`)
  return { choices: choices as number }
}

/**
 * `date` as ISO local time with its offset, to the MILLISECOND:  `2026-10-04T15:02:11.042-04:00`.
 * - as `PlanDoc`'s `isoTime()`, plus milliseconds
 * - why milliseconds:  `unsentMarks` compares a mark's `at` with `sent`;  to the second, a mark made in the same
 *   second as a send would pass for sent
 */
export function isoTime(date = new Date()): string {
  const minutes = -date.getTimezoneOffset()
  const sign = minutes < 0 ? "-" : "+"
  const offset = `${sign}${pad(Math.floor(Math.abs(minutes) / 60))}:${pad(Math.abs(minutes) % 60)}`
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  const clock = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  return `${day}T${clock}.${pad(date.getMilliseconds(), 3)}${offset}`

  /** `7` -> `07` (`width` 2), or `007` (3). */
  function pad(value: number, width = 2) {
    return String(value).padStart(width, "0")
  }
}
