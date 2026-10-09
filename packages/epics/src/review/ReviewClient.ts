import {
  REVIEW_ACTIONS,
  REVIEW_API,
  REVISIT_KEY_PREFIX,
  NOBODY_LISTENING,
  SUMMARY_ID,
  emptyInbox,
  inboxOf,
  isImmediate,
  isSent,
  pickOf,
  type Inbox,
  type InboxDraft,
  type InboxMark,
  type InboxUrgency,
  type MarkInput,
  type NewItem,
  type NewItemInput,
  type NewKind,
  type NowAction,
  type ReviewAction,
  type ReviewClientOptions,
  type Running,
  type WriteOptions
} from "./review.types"
import { ServerLink } from "./ServerLink"

/****************
 * ### `ReviewClient`
 * A page's REVIEW INBOX, as the page sees it:  the marks Owen leaves on its items and Overview sections, read from
 * and written to the page server's review routes (`$/epics/tool/reviewRoutes.ts`), one client per page
 * (`forPage()`).  `<epic-item>` and `<epic-section>` draw their controls from it (`ReviewControls.tsx`);  P10's
 * Send, Review Now and Choose pills call it too (`send()`, `choose()`), and an item's id chip (`toggleCalm()`).
 * - reviewing ONLY when the page is served with a token (`window.SPELL_SERVER`) and its inbox answers:  never from
 *   `file://`, nor from a server without the routes (`reviewing` stays false, and nothing is drawn)
 * - every route's reply is the whole inbox:  a write's answer replaces what's shown;  a failed write re-reads it,
 *   undoing what was shown early
 * - writes through its `ServerLink`:  a 403 on the token (the page server restarted since the page loaded) takes
 *   the server's new token from the page as it's served now, and tries once more
 * - re-reads the inbox every `REVIEW_POLL_MS` while the page is visible, when it becomes visible, and when the page
 *   server says the inbox file changed (the page's live client's `spell-server:file`):  `watch()`, the link's
 * - note drafts:  saved to the inbox (`POST draft`), backed up in localStorage under the old runtime's key
 *   (`REVISIT_KEY_PREFIX`), so a half-typed note survives the switch;  a backup the inbox lacks is handed to it on
 *   start (`adoptBackups()`).  What's being typed also stays in memory (`typed`), for an element drawn anew
 * - who listens:  `inbox.listening` (`null` once a session's heartbeat stopped:  the routes say so)
 * - Node-safe at import, and without `watch()`:  no `window` / `document` touched;  the browser's services come in
 *   through `ReviewClientOptions`, so tests stub `fetch` and storage
 * - Position in the import graph:  its peers (types, `ServerLink`) only;  the inbox's types from `$/epics/tool/ReviewInbox`
 *   (erased).  NEVER imports Solid, Spell UI or the `$/epics` barrel:  elements bridge its changes (`subscribe()`)
 *   into their own signals.
 ****************/
export class ReviewClient {
  /** The inbox as last read or written. */
  inbox: Inbox = emptyInbox()

  /** Served with a token, and the inbox answered:  the controls show. */
  reviewing = false

  /** Why the last write failed, in words:  for a caller that writes `quiet`. */
  lastWriteError = ""

  /** Bumped on every change:  readers compare it, elements track it. */
  version = 0

  /** The page server, as the inbox writes to it:  the write token, its refresh, the watch. */
  private readonly link: ServerLink

  /** Called on every change. */
  private readonly listeners = new Set<() => void>()

  /** Called with every notice. */
  private readonly noticeListeners = new Set<(message: string) => void>()

  /** Immediate requests in flight, id -> their write. */
  private readonly asking = new Map<string, Promise<boolean>>()

  /** Ids whose immediate request is being called off. */
  private readonly calling = new Set<string>()

  /** Ids whose note box is open by itself (an item without details), or holds a draft being written. */
  private readonly boxes = new Set<string>()

  /** What's typed in each note box right now:  kept for an element drawn anew (the live update). */
  private readonly typed = new Map<string, string>()

  /** Writes in flight:  a poll's answer can't overwrite what they're about to. */
  private writing = 0

  /** `start()`'s promise:  one start per client. */
  private starting: Promise<boolean> | undefined

  constructor(private readonly options: ReviewClientOptions) {
    this.link = new ServerLink(options)
  }

  ////////////////
  // ## The page's client
  ////////////////

  /** The page's client, once made. */
  private static current: ReviewClient | undefined

  /**
   * The page's client, made and started on the first call (browser only):  `page` is `location.pathname`, the
   * server's info `window.SPELL_SERVER`, and it `watch()`es the page.
   * - SIDE EFFECT:  the first call reads the inbox and starts polling
   */
  static forPage(): ReviewClient {
    if (ReviewClient.current) return ReviewClient.current
    const client = new ReviewClient(ReviewClient.pageOptions())
    ReviewClient.current = client
    void client
      .start()
      .then((reviewing) => reviewing && client.watch(window))
      .catch((error: unknown) => console.error("ReviewClient:  couldn't start", error))
    return client
  }

  /** Make `client` the page's from now on (`undefined`:  the next `forPage()` makes one):  tests, on a stubbed fetch. */
  static adopt(client: ReviewClient | undefined) {
    ReviewClient.current = client
  }

  /** The page's facts and services, as the browser has them. */
  private static pageOptions(): ReviewClientOptions {
    return {
      ...ServerLink.pageOptions(),
      storage: ReviewClient.storageOf(window),
      // the summary has no id of its own:  it's there when the page has one
      hasItem: (id) => !!document.getElementById(id) || (id === SUMMARY_ID && !!document.querySelector(SUMMARY_TAG))
    }
  }

  /** `window`'s localStorage, or `null` where reading it throws (blocked site data). */
  private static storageOf(window: Window): Storage | null {
    try {
      return window.localStorage
    } catch {
      return null
    }
  }

  ////////////////
  // ## Start
  ////////////////

  /**
   * Read the inbox;  if it answers, the page is being reviewed:  backups handed over, drafts' boxes reopened.  True
   * when reviewing.  Once per client.
   * - only a page the routes review (`PLAN_DOC_PAGE`), served with a token:  else it never asks
   * - NEVER throws
   */
  start(): Promise<boolean> {
    this.starting ??= this.begin()
    return this.starting
  }

  /** `start()`'s work. */
  private async begin(): Promise<boolean> {
    if (!this.link.servesPlanDoc || !(await this.load())) return false
    this.reviewing = true
    await this.adoptBackups()
    // a note being written reopens where it was, from any address
    for (const id of Object.keys(this.inbox.drafts)) this.boxes.add(id)
    this.changed()
    return true
  }

  /**
   * Keep the inbox fresh on `window`'s page:  a poll every `REVIEW_POLL_MS` while visible, a read when it becomes
   * visible, and one when the page server says the inbox file changed (`spell-server:file`, the page's live client:
   * never a connection of our own, each holds one of Chrome's 6 per host).  Returns the undo.
   */
  watch(window: Window): () => void {
    const inboxFile = this.link.file.replace(/(?:\.plan)?\.html$/, ".inbox.json")
    return this.link.watch(window, inboxFile, () => void this.refresh())
  }

  ////////////////
  // ## Listening
  ////////////////

  /** Call `listener` on every change (a read, a write, a box opened);  returns the undo. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** Call `listener` with every notice (a failed write, nobody listening);  returns the undo. */
  onNotice(listener: (message: string) => void): () => void {
    this.noticeListeners.add(listener)
    return () => this.noticeListeners.delete(listener)
  }

  /** Say `message` to the page (`onNotice()`'s listeners:  the notice line). */
  notify(message: string) {
    for (const listener of this.noticeListeners) listener(message)
  }

  ////////////////
  // ## Reads
  ////////////////

  /** Item `id`'s mark, if any. */
  markOf(id: string): InboxMark | undefined {
    return this.inbox.marks[id]
  }

  /** Item `id`'s saved draft, if any. */
  draftOf(id: string): InboxDraft | undefined {
    return this.inbox.drafts[id]
  }

  /** Has `mark` gone to Claude? */
  isSent(mark: InboxMark): boolean {
    return isSent(mark, this.inbox.sent)
  }

  /** Is a Claude session waiting on the inbox? */
  get listening(): boolean {
    return !!this.inbox.listening
  }

  /**
   * Item `id`'s immediate request, if one is on its way or being worked on:  `{ action, queued }` (`queued`:  waiting,
   * nobody listening);  else `null`.
   */
  runningOf(id: string): Running | null {
    if (this.calling.has(id)) return null
    const work = this.inbox.working[id]
    if (work) return { action: work.action === "revisit" ? "revisit" : "details", queued: false }
    const entry = this.inbox.now.find((each) => each.id === id)
    if (!this.asking.has(id) && !entry) return null
    const action = entry?.action ?? (this.inbox.marks[id]?.action === "revisit" ? "revisit" : "details")
    return { action, queued: !this.asking.has(id) && !this.inbox.listening }
  }

  /**
   * The review button whose work on item `id` is on its way or under way (it spins;  a click calls it off);  else
   * `null`.  The mark's own button (Approve, Make Todo, Revisit:  Claude took a sent mark), else Do Now (`details`:
   * Add Details, a revisit now).
   */
  busyButtonOf(id: string): ReviewAction | null {
    if (!this.runningOf(id)) return null
    const mark = this.inbox.marks[id]
    const own = mark && !isImmediate(mark) && REVIEW_ACTIONS.find((action) => action === mark.action)
    return own || "details"
  }

  /** Has Claude taken item `id`'s request (`working`), rather than it waiting to be taken? */
  isWorkedOn(id: string): boolean {
    return !!this.inbox.working[id]
  }

  /** Is `id`'s note box open by itself (an item without details), or being written in? */
  isBoxOpen(id: string): boolean {
    return this.boxes.has(id)
  }

  /** What's typed in `id`'s note box:  in memory, else its draft;  `""` for nothing. */
  typedOf(id: string): string {
    return this.typed.get(id) ?? this.inbox.drafts[id]?.note ?? ""
  }

  /** Item `id`'s urgency Owen set on the page, not applied yet:  `true` not urgent, `false` urgent;  else none. */
  calmOf(id: string): boolean | undefined {
    return this.inbox.urgency[id]?.calm
  }

  /**
   * The new items Owen asked for from the page, waiting in the inbox (`{ action: "new" }` marks, epic `airplane` P2),
   * in the order he added them;  `kind`:  only those.
   */
  newItems(kind?: NewKind): NewItem[] {
    return Object.entries(this.inbox.marks)
      .filter(([, mark]) => mark.action === "new" && (!kind || mark.kind === kind))
      .map(([id, mark]) => ({ id, ...mark }) as NewItem)
      .sort((a, b) => newNumber(a.id) - newNumber(b.id))
  }

  /** How many marks and urgencies wait for "Send to Claude". */
  get unsentCount(): number {
    return this.unsentMarks().length + this.unsentUrgency().length
  }

  ////////////////
  // ## Buttons
  ////////////////

  /**
   * The reader clicked `id`'s `action` button.  `"open-box"` when Revisit should take them to the note box (the
   * caller opens it);  else `undefined`, the click handled.
   * - running (it spins):  "nevermind", called off (`cancel()`)
   * - chosen already:  cleared, back to no action;  a revisit carrying a pick keeps the pick ("pick B, but ..."
   *   without the "but")
   * - else:  Approve and Make Todo mark it;  Revisit opens the note box;  Do Now (`details`, decision Q20) asks at
   *   once:  with a note in the box, Claude answers it now (a revisit now, as the note box's Do Now was);  without,
   *   Claude adds details
   */
  press(id: string, action: ReviewAction): "open-box" | undefined {
    const mark = this.inbox.marks[id]
    if (this.busyButtonOf(id) === action) return void this.cancel(id)
    if (action === "details") {
      const note = this.typedOf(id).trim()
      return void (note ? this.useNote(id, "now", note) : this.askNow(id, "details"))
    }
    if (mark?.action === action && !isImmediate(mark)) {
      const pick = action === "revisit" ? pickOf(mark) : {}
      return void this.save(id, pick.pick ? { action: "pick", ...pick } : null)
    }
    if (action === "revisit") return "open-box"
    void this.save(id, { action })
    return undefined
  }

  /**
   * Pick option `letter` of card set `choices` on `id` (`null`:  drop the pick):  a "Choose" pill (P10).
   * - `choices`:  which of the item's `<epic-choices>` the option is in, by position (I8:  its text's, a reply's
   *   ...);  none, its own
   * - a revisit keeps its note:  "pick B, but ...";  one asked NOW turns `soon`, so the pick waits for the send with
   *   it (an immediate mark counts as sent:  Claude would never see the new pick)
   * - anything else becomes a plain pick, or none
   */
  choose(id: string, letter: string | null, choices?: number): Promise<boolean> {
    const mark = this.inbox.marks[id]
    const pick = letter ? { pick: letter, ...(choices !== undefined && { choices }) } : {}
    if (mark?.action !== "revisit") return this.save(id, letter ? { action: "pick", ...pick } : null)
    return this.save(id, { action: "revisit", when: "soon", note: mark.note ?? "", ...pick })
  }

  /**
   * Item `id`'s id chip clicked:  urgent becomes not urgent, and back (`docCalm`:  what the doc says, `calm`), shown
   * at once, then saved;  back to what the doc says, the inbox forgets it.
   */
  toggleCalm(id: string, docCalm: boolean): Promise<boolean> {
    const calm = !(this.calmOf(id) ?? docCalm)
    if (calm === docCalm) delete this.inbox.urgency[id]
    else this.inbox.urgency[id] = { calm, at: new Date().toISOString() }
    this.changed()
    return this.write("urgency", { id, calm: calm === docCalm ? null : calm })
  }

  ////////////////
  // ## Note box
  ////////////////

  /** Open `id`'s note box by itself (an item without details:  under its line). */
  openBox(id: string) {
    this.boxes.add(id)
    this.changed()
  }

  /** Close `id`'s note box;  `used`:  its note became a mark, so what was typed goes too. */
  closeBox(id: string, used: boolean) {
    this.boxes.delete(id)
    if (used) this.forgetTyped(id)
    this.changed()
  }

  /** `text` is in `id`'s note box now:  kept in memory and in this browser's backup (not saved:  `saveDraft()`). */
  type(id: string, text: string) {
    this.typed.set(id, text)
    this.backup(id, text)
  }

  /**
   * Make `id`'s note a mark:  `how` is the note box button pressed (`todo`, `soon`:  Later, `now`:  Do Now);  what was
   * typed is dropped from memory and the backup (the mark carries it).
   * - Later keeps the item's pick:  "pick B, but ..."
   */
  useNote(id: string, how: "todo" | "soon" | "now", note: string): Promise<boolean> {
    this.forgetTyped(id)
    this.boxes.delete(id)
    if (how === "now") return this.askNow(id, "revisit", note)
    if (how === "todo") return this.save(id, { action: "todo", note })
    return this.save(id, { action: "revisit", when: "soon", note, ...pickOf(this.inbox.marks[id]) })
  }

  /** Save `text` as `id`'s draft in the inbox;  true when saved (the backup then goes). */
  async saveDraft(id: string, text: string, { keepalive = false }: { keepalive?: boolean } = {}): Promise<boolean> {
    const saved = await this.write("draft", { id, action: "revisit", note: text }, { quiet: true, keepalive })
    if (saved && this.typedOf(id) === text) this.backup(id, "")
    return saved
  }

  ////////////////
  // ## Writes
  ////////////////

  /** Mark item `id` (`mark`, or `null` to clear), shown at once, then saved. */
  async save(id: string, mark: MarkInput | null): Promise<boolean> {
    if (mark) this.inbox.marks[id] = { ...mark, at: new Date().toISOString() }
    else delete this.inbox.marks[id]
    this.changed()
    return this.write("mark", { id, mark })
  }

  /**
   * Ask for a new todo or question (`entry`) from the page, or (`id`, `new1`) change one still waiting (epic
   * `airplane` P2):  saved to the inbox (`POST new`), which keys it;  true when saved.
   * - waits for the server's answer before it shows:  the key is the server's to choose
   * - says it's saved, and that it waits for Send (and for a review, with nobody listening)
   */
  async saveNew(entry: NewItemInput, id?: string): Promise<boolean> {
    if (id) {
      const mark = this.inbox.marks[id]
      if (mark) this.inbox.marks[id] = { ...mark, ...entry, action: "new" }
      this.changed()
    }
    const written = await this.write("new", id ? { id, entry } : { entry })
    if (!written) return false
    const what = `${id ? "Changed" : "Saved"}:  a new ${entry.kind}`
    this.notify(this.inbox.listening ? `${what}, sent with your next Send` : `${what}.  ${NOBODY_LISTENING}`)
    return true
  }

  /** Remove new item `id` (`new1`) before Claude makes it:  shown at once, then saved. */
  removeNew(id: string): Promise<boolean> {
    delete this.inbox.marks[id]
    this.changed()
    return this.write("new", { id, entry: null })
  }

  /**
   * Ask Claude to act on item `id` NOW (`details` | `revisit`):  queued in the inbox's `now`.
   * - a revisit keeps the item's pick (the route does too:  `ReviewInbox.requestNow()`)
   * - nobody listening:  says so
   */
  async askNow(id: string, action: NowAction, note?: string): Promise<boolean> {
    const pick = pickOf(this.inbox.marks[id])
    const at = new Date().toISOString()
    this.inbox.marks[id] =
      action === "revisit" ? { action, when: "now", note: note ?? "", ...pick, at } : { action, at }
    const request = this.write("now", note === undefined ? { id, action } : { id, action, note })
    this.asking.set(id, request)
    this.changed()
    const written = await request
    this.asking.delete(id)
    // called off on its way:  `cancel()` takes it from here
    if (this.calling.has(id)) return written
    this.changed()
    if (written && !this.inbox.listening) this.notify(NOBODY_LISTENING)
    return written
  }

  /**
   * "Nevermind":  call off item `id`'s immediate request (Add Details Now, revisit now), queued or being worked on
   * (`POST cancel`);  shown at once.  A revisit's note comes back as a draft, its box open, so nothing typed is lost.
   * - a request still on its way waits to land first:  a cancel that reached the server before it would find
   *   nothing to call off, and the request would be queued after it
   */
  async cancel(id: string): Promise<boolean> {
    const mark = this.inbox.marks[id]
    const note = mark?.action === "revisit" ? (mark.note ?? "") : ""
    this.calling.add(id)
    this.forgetRequest(id)
    if (this.asking.has(id)) {
      await this.asking.get(id)
      // its answer put the request back on the page
      this.forgetRequest(id)
    }
    const written = await this.write("cancel", { id })
    this.calling.delete(id)
    this.changed()
    if (!written) return false
    this.notify("Called off:  Claude stops working on it.")
    if (!note) return true
    this.typed.set(id, note)
    this.boxes.add(id)
    await this.write("draft", { id, action: "revisit", note }, { quiet: true })
    return true
  }

  /**
   * "Send to Claude" (`now`:  Review Now, every revisit waiting asked now too);  says what went, or why nothing did
   * (P10's header buttons).
   */
  async send({ now = false }: { now?: boolean } = {}): Promise<boolean> {
    const marks = Object.values(this.inbox.marks)
    const waiting = [
      ...(now ? marks.filter((mark) => !isImmediate(mark)) : this.unsentMarks()),
      ...this.unsentUrgency()
    ]
    if (!waiting.length) {
      this.notify(
        now
          ? "Nothing to work through:  mark an item first"
          : marks.length
            ? "Sent already:  waiting for Claude"
            : "Nothing to send:  mark an item first"
      )
      return false
    }
    if (!(await this.write("send", now ? { now: true } : {}))) return false
    const count = waiting.length
    this.notify(
      !this.inbox.listening
        ? `Saved.  ${NOBODY_LISTENING}`
        : now
          ? `Claude is working through ${count} now:  answers land in the items`
          : `Sent ${count} to Claude`
    )
    return true
  }

  /**
   * Read the inbox again (a poll, the page server's word) unless a write is in flight;  true when it answered.
   * - NEVER throws
   */
  async refresh(): Promise<boolean> {
    if (this.writing) return false
    const read = await this.load()
    if (read) this.changed()
    return read
  }

  ////////////////
  // ## Backups
  ////////////////

  /**
   * Hand the inbox every note backup it lacks (an older page's drafts, or a save that failed), then drop the backups
   * it took:  nothing typed before this page is lost in the switch.
   * - an item gone from the page, or already holding the note:  its backup goes, quietly
   */
  async adoptBackups() {
    const backups = this.readBackups()
    for (const [id, text] of Object.entries(backups)) {
      const known =
        !!this.inbox.drafts[id] || this.inbox.marks[id]?.note === text.trim() || !(this.options.hasItem?.(id) ?? true)
      if (known || !text.trim() || (await this.write("draft", { id, action: "revisit", note: text }, { quiet: true })))
        delete backups[id]
    }
    this.writeBackups(backups)
  }

  /** Keep `text` as item `id`'s note backup in this browser;  empty drops it. */
  backup(id: string, text: string) {
    const backups = this.readBackups()
    if (text) backups[id] = text
    else delete backups[id]
    this.writeBackups(backups)
  }

  /** This page's backups, `{ [id]: text }`;  `{}` for none, bad JSON, or storage that throws. */
  readBackups(): Record<string, string> {
    try {
      const value = JSON.parse(this.options.storage?.getItem(this.backupKey) ?? "{}") as unknown
      return value && typeof value === "object" ? (value as Record<string, string>) : {}
    } catch {
      return {}
    }
  }

  /** Save `backups`;  a browser that blocks storage just doesn't remember. */
  private writeBackups(backups: Record<string, string>) {
    try {
      if (Object.keys(backups).length) this.options.storage?.setItem(this.backupKey, JSON.stringify(backups))
      else this.options.storage?.removeItem(this.backupKey)
    } catch {
      // private window:  not remembered
    }
  }

  /** The page's backup key:  the old runtime's, so its backups are found. */
  private get backupKey(): string {
    return `${REVISIT_KEY_PREFIX}${this.options.page}`
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** The marks not sent yet. */
  private unsentMarks(): InboxMark[] {
    return Object.values(this.inbox.marks).filter((mark) => !this.isSent(mark))
  }

  /** The urgencies not sent yet:  set after the last send. */
  private unsentUrgency(): InboxUrgency[] {
    return Object.values(this.inbox.urgency).filter(
      (entry) => !isSent({ action: "urgency", at: entry.at }, this.inbox.sent)
    )
  }

  /** Everyone told something changed. */
  private changed() {
    this.version++
    for (const listener of this.listeners) listener()
  }

  /** Drop what was typed in `id`'s box:  its note became a mark. */
  private forgetTyped(id: string) {
    this.typed.delete(id)
    delete this.inbox.drafts[id]
    this.backup(id, "")
  }

  /** Take `id`'s immediate request off the page (its `now` entry, its work, its mark), and show it. */
  private forgetRequest(id: string) {
    this.inbox.now = this.inbox.now.filter((each) => each.id !== id)
    delete this.inbox.working[id]
    const asked = this.inbox.marks[id]
    if (asked && isImmediate(asked)) delete this.inbox.marks[id]
    this.changed()
  }

  /** Read the inbox;  true when it answered (a write in flight wins:  its answer is newer). */
  private async load(): Promise<boolean> {
    try {
      const url = `${REVIEW_API}/inbox?page=${encodeURIComponent(this.options.page)}`
      const response = await this.options.fetch(url, { cache: "no-store" })
      if (!response.ok) return false
      const read = inboxOf(await response.json())
      if (!this.writing) this.inbox = read
      return true
    } catch {
      return false
    }
  }

  /**
   * POST `body` (plus `page`) to `route`;  the reply is the new inbox.  True when written;  else says why (a notice,
   * unless `quiet`:  the caller says it, from `lastWriteError`) and re-reads the inbox, undoing what was shown early.
   * - a 403 on the token:  the link takes the server's new token and tries once more (`ServerLink.post()`)
   */
  private async write(route: string, body: object, { quiet = false, keepalive = false }: WriteOptions = {}) {
    this.writing++
    let error = ""
    try {
      const reply = await this.link.post(`${REVIEW_API}/${route}`, { page: this.options.page, ...body }, { keepalive })
      this.inbox = inboxOf(reply)
      this.changed()
      return true
    } catch (failure) {
      error = (failure as Error).message
    } finally {
      this.writing--
    }
    this.lastWriteError = error
    if (!quiet) this.notify(`${error[0]!.toUpperCase()}${error.slice(1)}.`)
    await this.load()
    this.changed()
    return false
  }
}

/** The summary's tag:  how the page finds it, having no id. */
const SUMMARY_TAG = "epic-summary"

/** A new item key's number:  `new12` -> 12, for their order. */
function newNumber(id: string): number {
  return Number(id.replace(/^\D+/, "")) || 0
}
