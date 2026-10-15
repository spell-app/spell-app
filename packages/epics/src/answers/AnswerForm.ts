import { PlanDates } from "$/epics/dates"
import { ServerLink, sentence, type ServerLinkOptions } from "$/epics/review"

import { AnswerDraft } from "./AnswerDraft"
import {
  DETAILS_API,
  DETAILS_DRAFT_API,
  DETAILS_PAGE,
  DETAILS_SAVE_MS,
  DETAILS_SETTLE_MS,
  DRAFT_KEY_PREFIX,
  type AnswerPart,
  type AskPart,
  type DetailsDraft,
  type KeptText,
  type PageAnswer,
  type PartLabels,
  type SendFill,
  type SentAnswer,
  type TypedAnswer
} from "./answers.types"

/** What an `AnswerForm` is made from:  its link's facts, and the browser's storage for the draft's own copy. */
export type AnswerFormOptions = ServerLinkOptions & {
  /** `localStorage`;  `null` or none:  no copy in the browser (blocked, private window, tests) */
  storage?: Storage | null
}

/****************
 * ### `AnswerForm`
 * A DETAILS PAGE's answer, as its elements hold it (epic `epic-workflow` P12):
 * what Owen picked and wrote, what was sent, and the sending.
 * - One per page (`forPage()`).
 * - The elements that hold part of the answer register while connected (`add()`):
 *   - each question, `<epic-ask>`:  its picks, "Provide more details"
 *   - each box, `<epic-text-box>`:  Other, a comment (on a section, on an option), the page's notes
 * - `<epic-send>` draws it:  where the answer stands ("Not sent", "Sent 10/8/26 14:34 · 5 of 17 decided"),
 *   Send's fill, the draft's save, and why a send failed.
 * - Sending:  `POST /api/docs/details/answer` (`packages/epics/tools/detailsRoutes.ts`), which writes `<slug>.answer.json`
 *   beside the page, and wakes the waiting session (`epic ask wait`).
 *   - through a `ServerLink`, as the epic page's clients write:  the token, and its one refresh after a restart
 *   - NEVER locks (Owen, 2026-10-08):  a partial answer is fine, everything stays editable, and every Send sends the
 *     whole page again (the route marks what changed since the send before)
 * - On load (`load()`), `GET` reads the answer already sent, and every part shows its share of it.
 *   A part that connects later gets it as it registers.
 * - Keeps a DRAFT of what's typed and not sent (P18:  agents rewrote a page under Owen, and lost what he typed):
 *   - every change Owen makes (`edited()`) goes into `typed`, the page as he left it, at once;  a copy goes into
 *     the browser's storage at once, and to the page server a moment later (`DETAILS_SAVE_MS`,
 *     `POST /api/docs/details/draft`, `<slug>.draft.json`), and as the page goes away (`watch()`)
 *   - the draft wakes nobody:  only Send does;  Send deletes it
 *   - on load, the newest draft newer than the answer (the server's, else the browser's) goes back into the parts,
 *     by id, over the answer sent (`AnswerDraft.over()`):  "Changes not sent"
 *   - an agent's rewrite patched IN PLACE replaces the questions that changed:  a part that joins while there's a
 *     draft shows the draft's share, not the answer's
 *   - what was typed for a question, option or section that's gone from the page is KEPT (`settle()`, a moment
 *     after a part leaves, and after load), shown in its own box (the notes box draws it) and sent with the rest
 *   - only on a details page (`DETAILS_PAGE`):  an element's docs page keeps nothing
 * - Node-safe at import:  no `window` / `document` touched until `forPage()` or `watch()`;  `fetch` and the storage
 *   come in through `AnswerFormOptions`, so tests stub them.
 * - Position in the import graph:  `$/epics/review` (the link), `$/epics/dates`, its peers.
 *   NEVER imports Solid or Spell UI:  the elements bridge its changes (`subscribe()`) into their own state.
 ****************/
export class AnswerForm {
  /** The answer as last sent (or read back on load);  `undefined` before the first send. */
  sent: SentAnswer | undefined

  /** Why the last send failed, as a sentence;  `""` for none. */
  error = ""

  /** A send on its way. */
  isSending = false

  /** Bumped on every change:  readers compare it, `<epic-send>` tracks it. */
  version = 0

  /**
   * Text typed for questions, options or sections gone from the page (an agent's rewrite):  shown in its own box,
   * sent with the rest, until Owen drops it (`dropKept()`).
   */
  kept: KeptText[] = []

  /**
   * The page as Owen left it, by id, since he last changed it (or since a draft came back);  `undefined` with
   * nothing typed since the last send.
   * - holds what a part that just left had, until `settle()` keeps it
   */
  typed: TypedAnswer | undefined

  /** The draft's save:  `draft saved 14:04`, `saving draft…`, or why it can't be (`isDraftError`). */
  draftText = ""

  /** The draft's last save failed:  `draftText` says why. */
  isDraftError = false

  /** The page as last sent (`snapshot()`), to tell "Changes not sent";  `null` before the first send. */
  private sentSnapshot: string | null = null

  /** The parts, as registered. */
  private readonly parts = new Set<AnswerPart>()

  /** Called on every change. */
  private readonly listeners = new Set<() => void>()

  /** The page server, as answers are sent to it:  the write token, its refresh. */
  private readonly link: ServerLink

  /** `load()`'s promise:  one load per form. */
  private loading: Promise<void> | undefined

  /** Something changed since the draft's last save. */
  private isUnsaved = false

  /** The draft's save waiting for typing to stop. */
  private saveTimer: ReturnType<typeof setTimeout> | undefined

  /** `settle()` waiting for the parts of a rewrite to join. */
  private settleTimer: ReturnType<typeof setTimeout> | undefined

  constructor(private readonly options: AnswerFormOptions) {
    this.link = new ServerLink(options)
  }

  ////////////////
  // ## The page's form
  ////////////////

  /** The page's form, once made. */
  private static current: AnswerForm | undefined

  /** The page's form, made on the first call (browser only). */
  static forPage(): AnswerForm {
    AnswerForm.current ??= new AnswerForm({ ...ServerLink.pageOptions(), storage: storageOf(window) })
    return AnswerForm.current
  }

  /** Make `form` the page's from now on (`undefined`:  the next `forPage()` makes one):  tests. */
  static adopt(form: AnswerForm | undefined) {
    AnswerForm.current = form
  }

  ////////////////
  // ## Parts
  ////////////////

  /**
   * Register `part` while it's connected;  returns the undo.
   * - the answer already read back (or a draft over it):  it shows its share at once,
   *   and the page counts as sent still, unless it had changes before
   * - the undo, with a draft:  what it held is kept if it doesn't come back (`settle()`)
   */
  add(part: AnswerPart): () => void {
    this.parts.add(part)
    const shown = this.shown
    if (shown) {
      const wasPending = this.isPending
      part.showAnswer(shown)
      if (!wasPending && this.sent) this.sentSnapshot = this.snapshot()
    }
    this.changed()
    return () => {
      this.parts.delete(part)
      if (this.typed) this.settleSoon()
      this.changed()
    }
  }

  /** Something on the page changed:  everyone listening hears it. */
  changed() {
    this.version++
    for (const listener of this.listeners) listener()
  }

  /**
   * Owen changed something (a pick, a box):  everyone hears it, and on a details page the draft follows:
   * `typed` at once, the browser's copy at once, the page server's a moment later.
   */
  edited() {
    if (this.keepsDrafts) {
      this.typed = AnswerDraft.over(this.typed ?? EMPTY, this.current())
      this.writeLocal()
      this.saveSoon()
    }
    this.changed()
  }

  /** Call `listener` on every change;  returns the undo. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** The questions, in page order. */
  get asks(): AskPart[] {
    return this.inPageOrder().filter((part): part is AskPart => "askState" in part)
  }

  /** How many questions are decided (anything but `attention`), of how many. */
  get decided(): { decided: number; total: number } {
    const asks = this.asks
    return { decided: asks.filter((ask) => ask.askState !== "attention").length, total: asks.length }
  }

  ////////////////
  // ## The answer
  ////////////////

  /**
   * What the page holds now, as the route takes it, its keys sorted:
   * the same page gathers the same, whatever order its parts registered in.
   * - `kept`, when there is any
   */
  gather(): PageAnswer {
    const page: PageAnswer = { answers: {}, comments: {}, notes: "" }
    for (const part of this.inPageOrder()) part.gatherInto(page)
    const gathered: PageAnswer = { answers: sorted(page.answers), comments: sorted(page.comments), notes: page.notes }
    if (this.kept.length) gathered.kept = this.kept.map((each) => ({ ...each }))
    return gathered
  }

  /** The ids the page's parts hold answers under, with their titles (`PartLabels`). */
  labels(): PartLabels {
    const labels: PartLabels = {}
    for (const part of this.inPageOrder()) part.labelsInto(labels)
    return labels
  }

  /** `gather()` as one string, to compare with what was sent. */
  snapshot(): string {
    return JSON.stringify(this.gather())
  }

  /** Nothing on the page:  no pick, Other, comment, note or kept text. */
  get isEmpty(): boolean {
    const { answers, comments, notes, kept } = this.gather()
    const picked = Object.values(answers).some((each) => each.picked.length || each.other)
    return !picked && !notes && !Object.keys(comments).length && !kept?.length
  }

  /** Something not sent:  the page differs from the send (never sent:  anything on it). */
  get isPending(): boolean {
    return this.sentSnapshot === null ? !this.isEmpty : this.snapshot() !== this.sentSnapshot
  }

  /** Where the answer stands, for Send's fill (`SendFill`). */
  get fill(): SendFill {
    return this.isPending ? "pending" : this.sent ? "sent" : "rest"
  }

  /**
   * The words beside Send, and their colour:
   * - "Not sent" (grey, nothing on the page;  blue, something on it)
   * - "Changes not sent" (blue)
   * - "Sent 10/8/26 14:34 · 5 of 17 decided" (green)
   */
  get stateLine(): { text: string; color: "grey" | "blue" | "green" } {
    if (this.isPending) return { text: this.sent ? "Changes not sent" : "Not sent", color: "blue" }
    if (!this.sent) return { text: "Not sent", color: "grey" }
    const { decided, total } = this.decided
    const when = PlanDates.formatDate(new Date(this.sent.answered))
    return { text: `Sent ${when} · ${decided} of ${total} decided`, color: "green" }
  }

  /** Drop `item` from the kept text (Owen's ×):  a change like any other, so the draft follows. */
  dropKept(item: KeptText) {
    this.kept = this.kept.filter((each) => each !== item)
    if (this.typed) this.typed = { ...this.typed, kept: [...this.kept] }
    this.edited()
  }

  ////////////////
  // ## Sending
  ////////////////

  /**
   * Send the whole page;  it stays as it is, editable.
   * - refused (the reason in `error`):  nothing on a page never sent, no page server
   * - sent:  the draft is done with (the route deletes its file;  the browser's copy goes too)
   * - NEVER throws:  a failure is `error`, said for people
   */
  async send(): Promise<void> {
    if (this.isSending) return
    if (!this.sent && this.isEmpty)
      return this.fail("Pick an option, or write something (Other, a comment, a note) first.")
    if (!this.options.server?.token || this.options.protocol === "file:")
      return this.fail("This page isn't on the page server, so it can't send:  answer in chat instead.")
    this.isSending = true
    this.error = ""
    this.changed()
    try {
      const page = this.gather()
      const reply = (await this.link.post(DETAILS_API, { page: this.options.page, ...page })) as {
        answer?: SentAnswer
      }
      this.sent = reply.answer
      this.sentSnapshot = this.snapshot()
      this.draftDone()
    } catch (failure) {
      this.error = `${sentence((failure as Error).message)}  Send again, or answer in chat instead.`
    } finally {
      this.isSending = false
      this.changed()
    }
  }

  /**
   * Read back the answer already sent (`<slug>.answer.json`, through the route), and show it in every part;  then
   * the newest draft newer than it (the server's `<slug>.draft.json`, or the browser's copy) over it.
   * - once per form;  nothing off a details page (`DETAILS_PAGE`:  an element's docs page, say);  from `file://`
   *   or without a page server, only the browser's copy
   * - NEVER throws:  no answer, or no route, shows nothing
   */
  load(): Promise<void> {
    this.loading ??= this.read()
    return this.loading
  }

  /** `load()`'s work. */
  private async read() {
    if (!this.keepsDrafts) return
    const [answer, draft] = await Promise.all([
      this.fetchJson<SentAnswer>(DETAILS_API, "answer"),
      this.fetchJson<DetailsDraft>(DETAILS_DRAFT_API, "draft")
    ])
    if (answer) {
      this.sent = answer
      this.kept = answer.kept ?? []
      for (const part of this.parts) part.showAnswer(answer)
      this.sentSnapshot = this.snapshot()
    }
    const local = this.readLocal()
    const newest = AnswerDraft.newest([draft, local], answer)
    if (newest) this.putBack(newest, { isSaved: newest === draft })
    this.changed()
  }

  /**
   * Put `draft` back into the parts, over the answer sent;  then keep what was typed for ids gone from the page.
   * - `isSaved`:  the page server has it;  else (the browser's copy) it's saved there once more
   */
  private putBack(draft: DetailsDraft, { isSaved }: { isSaved: boolean }) {
    const { answers, comments, notes, labels, kept } = draft
    this.typed = { answers, comments, notes, labels, ...(kept?.length ? { kept } : {}) }
    this.kept = kept ?? []
    const shown = this.shown!
    for (const part of this.parts) part.showAnswer(shown)
    this.setDraftText(`draft from ${clockOf(draft.saved)} put back`)
    if (!isSaved) {
      this.isUnsaved = true
      this.saveSoon()
    }
    this.settleSoon()
  }

  /** Say why it can't send. */
  private fail(message: string) {
    this.error = message
    this.changed()
  }

  /** The parts, in page order. */
  private inPageOrder(): AnswerPart[] {
    return [...this.parts].sort((one, other) => pageOrder(one.domElement, other.domElement))
  }

  ////////////////
  // ## The draft
  ////////////////

  /** Does this page keep drafts:  a details page (`DETAILS_PAGE`), not an element's docs page? */
  get keepsDrafts(): boolean {
    return DETAILS_PAGE.test(this.options.page)
  }

  /**
   * What each part shows:  the answer sent, with `typed` laid over it when there is one;  `undefined` before
   * either.
   */
  get shown(): SentAnswer | undefined {
    if (!this.typed) return this.sent
    const view = AnswerDraft.over(this.sent ?? EMPTY, this.typed)
    return { page: this.options.page, answered: this.sent?.answered ?? "", changes: this.sent?.changes ?? 0, ...view }
  }

  /**
   * Keep what was typed for ids gone from the page (`AnswerDraft.settle()`):  the kept box shows it, the draft
   * and the next Send carry it.
   * - a part that shows a pick of an option now gone is told again, without it
   * - nothing typed (`typed`):  nothing to keep
   */
  settle() {
    if (this.settleTimer) clearTimeout(this.settleTimer)
    if (!this.typed) return
    const before = AnswerDraft.over(this.typed, this.current())
    const { typed, kept } = AnswerDraft.settle(before, this.labels(), this.sent)
    const isMoved = kept.length !== this.kept.length || JSON.stringify(typed.answers) !== JSON.stringify(before.answers)
    this.typed = typed
    if (!isMoved) return
    this.kept = kept
    const shown = this.shown!
    for (const part of this.parts) part.showAnswer(shown)
    this.writeLocal()
    this.isUnsaved = true
    this.saveSoon()
    this.changed()
  }

  /**
   * Save the draft to the page server now, if anything changed since the last save.
   * - `keepalive`:  the page is going away;  the request outlives it
   * - NEVER throws:  a failure shows in `draftText` (the browser's copy still has it), and the next change tries
   *   again
   */
  async saveDraft({ keepalive = false }: { keepalive?: boolean } = {}): Promise<void> {
    if (this.saveTimer) clearTimeout(this.saveTimer)
    if (!this.isUnsaved || !this.typed || !this.keepsDrafts) return
    if (!this.options.server?.token || this.options.protocol === "file:")
      return this.setDraftText("draft kept in this browser only:  this page isn't on the page server", true)
    this.isUnsaved = false
    // the server stamps it `saved`
    const { page, answers, comments, notes, labels, kept } = this.draftNow()
    this.writeLocal()
    this.setDraftText("saving draft…")
    this.changed()
    try {
      const body = { page, answers, comments, notes, labels, kept: kept ?? [] }
      const reply = (await this.link.post(DETAILS_DRAFT_API, body, { keepalive })) as { draft: DetailsDraft }
      // sent meanwhile:  the send said where things stand
      if (this.typed) this.setDraftText(`draft saved ${clockOf(reply.draft.saved)}`)
    } catch (failure) {
      this.isUnsaved = true
      this.setDraftText(`draft kept in this browser only:  ${(failure as Error).message}`, true)
    }
    this.changed()
  }

  /**
   * Save the draft as the page goes away (`pagehide`, or the page hidden), on `window`'s page;  returns the undo.
   * - SIDE EFFECT:  listens on `window` and its document until undone
   */
  watch(window: Window): () => void {
    const leaving = () => void this.saveDraft({ keepalive: true })
    const hidden = () => {
      if (window.document.visibilityState === "hidden") leaving()
    }
    window.addEventListener("pagehide", leaving)
    window.document.addEventListener("visibilitychange", hidden)
    return () => {
      window.removeEventListener("pagehide", leaving)
      window.document.removeEventListener("visibilitychange", hidden)
      if (this.saveTimer) clearTimeout(this.saveTimer)
      if (this.settleTimer) clearTimeout(this.settleTimer)
    }
  }

  /** The page as it is now, with the ids it's under. */
  private current(): TypedAnswer {
    return { ...this.gather(), labels: this.labels() }
  }

  /** The draft as it stands:  `typed`, with the page as it is now laid over it. */
  private draftNow(): DetailsDraft {
    const typed = AnswerDraft.over(this.typed ?? EMPTY, this.current())
    return { page: this.options.page, saved: new Date().toISOString(), ...typed }
  }

  /** Save the draft `DETAILS_SAVE_MS` after the last change. */
  private saveSoon() {
    this.isUnsaved = true
    if (this.saveTimer) clearTimeout(this.saveTimer)
    this.saveTimer = setTimeout(() => void this.saveDraft(), DETAILS_SAVE_MS)
    if (!this.isDraftError) this.setDraftText("draft not saved yet")
  }

  /** `settle()` once the parts of a rewrite have joined (`DETAILS_SETTLE_MS`). */
  private settleSoon() {
    if (this.settleTimer) clearTimeout(this.settleTimer)
    this.settleTimer = setTimeout(() => this.settle(), DETAILS_SETTLE_MS)
  }

  /** Sent:  the draft is done with;  nothing to save, and the browser's copy goes. */
  private draftDone() {
    if (this.saveTimer) clearTimeout(this.saveTimer)
    this.isUnsaved = false
    this.typed = undefined
    this.setDraftText("")
    try {
      this.options.storage?.removeItem(this.localKey)
    } catch {
      // storage blocked:  nothing was kept there either
    }
  }

  /** The draft's save status;  `isError`:  in orange, a warning (`templates/epics/plan-doc.md`, "Colours"). */
  private setDraftText(text: string, isError = false) {
    this.draftText = text
    this.isDraftError = isError
  }

  /** The browser's copy's key:  `DRAFT_KEY_PREFIX` + the page's path. */
  private get localKey(): string {
    return `${DRAFT_KEY_PREFIX}${this.options.page}`
  }

  /** Write the draft to the browser's copy;  storage that throws (blocked, full) just doesn't keep it. */
  private writeLocal() {
    try {
      this.options.storage?.setItem(this.localKey, JSON.stringify(this.draftNow()))
    } catch {
      // nowhere to keep it:  the page server's copy still is
    }
  }

  /** The browser's copy of the draft, or `undefined` (none, bad JSON, storage that throws). */
  private readLocal(): DetailsDraft | undefined {
    try {
      const text = this.options.storage?.getItem(this.localKey)
      const draft = text ? (JSON.parse(text) as DetailsDraft) : undefined
      return draft && typeof draft.saved === "string" && draft.answers && draft.labels ? draft : undefined
    } catch {
      return undefined
    }
  }

  /**
   * `GET <api>?page=` for this page:  the reply's `what`, or `undefined` (none, no route, no page server).
   * - NEVER throws
   */
  private async fetchJson<T>(api: string, what: string): Promise<T | undefined> {
    if (!this.options.server || this.options.protocol === "file:") return undefined
    try {
      const response = await this.options.fetch(`${api}?page=${encodeURIComponent(this.options.page)}`, {
        cache: "no-store"
      })
      if (!response.ok) return undefined
      return ((await response.json()) as Record<string, T | null>)[what] ?? undefined
    } catch {
      return undefined
    }
  }
}

////////////////
// ## Helpers
////////////////

/** A page with nothing on it:  what a first change is laid over. */
const EMPTY: TypedAnswer = { answers: {}, comments: {}, notes: "", labels: {} }

/** `record` with its keys sorted. */
function sorted<T>(record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record).sort(([one], [other]) => (one < other ? -1 : one > other ? 1 : 0)))
}

/** `iso`'s local time of day, `14:04`. */
function clockOf(iso: string): string {
  return PlanDates.clock(new Date(iso))
}

/** `window`'s localStorage, or `null` where reading it throws (blocked site data). */
function storageOf(window: Window): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * `one` before `other` in the page (negative), after (positive), or neither (0).
 * - across shadow roots too:  a box drawn inside a question's shadow root counts as where its question is
 */
function pageOrder(one: Element, other: Element): number {
  const position = hostOf(one).compareDocumentPosition(hostOf(other))
  if (position & 4 /* FOLLOWING */) return -1
  if (position & 2 /* PRECEDING */) return 1
  return 0
}

/** `element`, or the outermost host it's drawn inside, as the page's light DOM has it. */
function hostOf(element: Element): Element {
  let at = element
  for (let root = at.getRootNode(); "host" in root; root = at.getRootNode()) at = (root as ShadowRoot).host
  return at
}
