import { PlanDates } from "$/epics/dates"
import { ServerLink, sentence, type ServerLinkOptions } from "$/epics/review"

import {
  DETAILS_API,
  DETAILS_PAGE,
  type AnswerPart,
  type AskPart,
  type PageAnswer,
  type SendFill,
  type SentAnswer
} from "./answers.types"

/****************
 * ### `AnswerForm`
 * A DETAILS PAGE's answer, as its elements hold it (epic `epic-workflow` P12):
 * what Owen picked and wrote, what was sent, and the sending.
 * - One per page (`forPage()`).
 * - The elements that hold part of the answer register while connected (`add()`):
 *   - each question, `<epic-ask>`:  its picks, "Provide more details"
 *   - each box, `<epic-text-box>`:  Other, a comment (on a section, on an option), the page's notes
 * - `<epic-send>` draws it:  where the answer stands ("Not sent", "Sent 10/8/26 14:34 · 5 of 17 decided"),
 *   Send's fill, and why a send failed.
 * - Sending:  `POST /api/details/answer` (`packages/docs/tools/detailsRoutes.ts`), which writes `<slug>.answer.json`
 *   beside the page, and wakes the waiting session (`epic ask wait`).
 *   - through a `ServerLink`, as the plan doc's clients write:  the token, and its one refresh after a restart
 *   - NEVER locks (Owen, 2026-10-08):  a partial answer is fine, everything stays editable, and every Send sends the
 *     whole page again (the route marks what changed since the send before)
 * - On load (`load()`), `GET` reads the answer already sent, and every part shows its share of it.
 *   A part that connects later gets it as it registers.
 * - Node-safe at import:  no `window` / `document` touched until `forPage()`;  `fetch` comes in through
 *   `ServerLinkOptions`, so tests stub it.
 * - Position in the import graph:  `$/epics/review` (the link), `$/epics/dates`, its peer types.
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

  constructor(private readonly options: ServerLinkOptions) {
    this.link = new ServerLink(options)
  }

  ////////////////
  // ## The page's form
  ////////////////

  /** The page's form, once made. */
  private static current: AnswerForm | undefined

  /** The page's form, made on the first call (browser only). */
  static forPage(): AnswerForm {
    AnswerForm.current ??= new AnswerForm(ServerLink.pageOptions())
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
   * - the answer already read back:  it shows its share at once,
   *   and the page counts as sent still, unless it had changes before
   */
  add(part: AnswerPart): () => void {
    this.parts.add(part)
    if (this.sent) {
      const wasPending = this.isPending
      part.showAnswer(this.sent)
      if (!wasPending) this.sentSnapshot = this.snapshot()
    }
    this.changed()
    return () => {
      this.parts.delete(part)
      this.changed()
    }
  }

  /** Something on the page changed:  everyone listening hears it. */
  changed() {
    this.version++
    for (const listener of this.listeners) listener()
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
   */
  gather(): PageAnswer {
    const page: PageAnswer = { answers: {}, comments: {}, notes: "" }
    for (const part of this.inPageOrder()) part.gatherInto(page)
    return { answers: sorted(page.answers), comments: sorted(page.comments), notes: page.notes }
  }

  /** `gather()` as one string, to compare with what was sent. */
  snapshot(): string {
    return JSON.stringify(this.gather())
  }

  /** Nothing on the page:  no pick, Other, comment or note. */
  get isEmpty(): boolean {
    const { answers, comments, notes } = this.gather()
    const picked = Object.values(answers).some((each) => each.picked.length || each.other)
    return !picked && !notes && !Object.keys(comments).length
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

  ////////////////
  // ## Sending
  ////////////////

  /**
   * Send the whole page;  it stays as it is, editable.
   * - refused (the reason in `error`):  nothing on a page never sent, no page server
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
    } catch (failure) {
      this.error = `${sentence((failure as Error).message)}  Send again, or answer in chat instead.`
    } finally {
      this.isSending = false
      this.changed()
    }
  }

  /**
   * Read back the answer already sent (`<slug>.answer.json`, through the route), and show it in every part.
   * - once per form;  nothing from `file://`, without a page server, or off a details page (`DETAILS_PAGE`:  an
   *   element's docs page, say)
   * - NEVER throws:  no answer, or no route, shows nothing
   */
  load(): Promise<void> {
    this.loading ??= this.read()
    return this.loading
  }

  /** `load()`'s work. */
  private async read() {
    if (!this.options.server || this.options.protocol === "file:" || !DETAILS_PAGE.test(this.options.page)) return
    try {
      const response = await this.options.fetch(`${DETAILS_API}?page=${encodeURIComponent(this.options.page)}`, {
        cache: "no-store"
      })
      if (!response.ok) return
      const { answer } = (await response.json()) as { answer?: SentAnswer | null }
      if (!answer) return
      this.sent = answer
      for (const part of this.parts) part.showAnswer(answer)
      this.sentSnapshot = this.snapshot()
      this.changed()
    } catch {
      // no answer yet, or a server without the route:  nothing to show
    }
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
}

////////////////
// ## Helpers
////////////////

/** `record` with its keys sorted. */
function sorted<T>(record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record).sort(([one], [other]) => (one < other ? -1 : one > other ? 1 : 0)))
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
