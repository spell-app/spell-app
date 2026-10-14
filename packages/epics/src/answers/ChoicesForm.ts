import { PlanDates } from "$/epics/dates"
import { ServerLink, sentence, type ServerLinkOptions } from "$/epics/review"

import {
  CHOICES_API,
  CHOICES_SAVE_MS,
  FOLD_KEY_PREFIX,
  SAVED_CHOICES_PAGE,
  type ChoiceRowPart,
  type ChoicesAnswer,
  type ChoicesOrder,
  type ChoicesDraft,
  type ChoicesValues
} from "./answers.types"

/****************
 * ### `ChoicesForm`
 * A CHOICE page's boxes, as its elements hold them (epic `epic-workflow` P12):
 * what Owen typed over Claude's recommendations, the draft that keeps it, and "Do it".
 * - One per page (`forPage()`).
 * - Each row, `<epic-choice-row>`, registers while connected (`add()`);
 *   `<epic-choices-bar>` holds the feedback and "Do it", and draws where things stand.
 * - Saving the draft (`packages/docs/tools/choicesRoutes.ts`, `POST /api/choices/draft`):
 *   - `CHOICES_SAVE_MS` (5s) after the last change
 *   - and as the page goes away (`watch()`:  `pagehide`, the page hidden), a request that outlives the page
 *   - the draft never wakes anyone:  only "Do it" does
 * - "Do it" (`send()`):  `POST /api/choices/answer`, which `epic choices wait` exits with;  pressed again after
 *   changes, it sends again.
 * - On load (`restore()`):  the draft (else the answer) comes back into the boxes and the feedback.
 * - Only the boxes that differ from the recommendation are sent, by row id (`values`), with the feedback.
 * - A table Owen can put in order (`<epic-choice-rows reorder>`, epic `epic-workflow` P15):  its rows' ids in the
 *   order he left them go too (`order`), by its section's id;  on load they come back in `restoredOrder`, which the
 *   table puts its rows in.
 * - Node-safe at import:  no `window` / `document` touched until `forPage()`, `watch()` or `expandAll()`.
 * - Position in the import graph:  `$/epics/review` (the link), `$/epics/dates`, its peer types.
 *   NEVER imports Solid or Spell UI.
 ****************/
export class ChoicesForm {
  /** The feedback box's text, as typed. */
  feedback = ""

  /** The save status:  `saved 12:04`, `saving…`, or why it can't save (`isSaveError`). */
  savedText = ""

  /** The last save failed:  `savedText` says why. */
  isSaveError = false

  /** The answer last sent, if any. */
  sent: ChoicesAnswer | undefined

  /** Changed since the answer was sent:  "press Do it again". */
  isStale = false

  /** Why "Do it" failed, as a sentence;  `""` for none. */
  error = ""

  /** "Do it" on its way. */
  isSending = false

  /** Bumped on every change:  readers compare it, the bar and the rows' tables track it. */
  version = 0

  /** The rows, by id. */
  private readonly rows = new Map<string, ChoiceRowPart>()

  /** The values read back on load, for a row that registers later. */
  private restored: Record<string, string> = {}

  /** The order of each reorderable table read back on load, by its section's id:  the table puts its rows in it. */
  restoredOrder: ChoicesOrder = {}

  /** Called on every change. */
  private readonly listeners = new Set<() => void>()

  /** Something changed since the last save. */
  private isUnsaved = false

  /** The draft save waiting for typing to stop. */
  private timer: ReturnType<typeof setTimeout> | undefined

  /** The page server, as drafts and answers are sent to it. */
  private readonly link: ServerLink

  constructor(private readonly options: ServerLinkOptions) {
    this.link = new ServerLink(options)
  }

  ////////////////
  // ## The page's form
  ////////////////

  /** The page's form, once made. */
  private static current: ChoicesForm | undefined

  /** The page's form, made on the first call (browser only). */
  static forPage(): ChoicesForm {
    ChoicesForm.current ??= new ChoicesForm(ServerLink.pageOptions())
    return ChoicesForm.current
  }

  /** Make `form` the page's from now on (`undefined`:  the next `forPage()` makes one):  tests. */
  static adopt(form: ChoicesForm | undefined) {
    ChoicesForm.current = form
  }

  ////////////////
  // ## Rows
  ////////////////

  /** Register `row` while it's connected (a value read back already goes into its box);  returns the undo. */
  add(row: ChoiceRowPart): () => void {
    this.rows.set(row.rowName, row)
    const value = this.restored[row.rowName]
    if (value !== undefined) row.showValue(value)
    this.notify()
    return () => {
      if (this.rows.get(row.rowName) === row) this.rows.delete(row.rowName)
      this.notify()
    }
  }

  /** How many rows, and how many Owen changed. */
  get counts(): { rows: number; changed: number } {
    const rows = [...this.rows.values()]
    return { rows: rows.length, changed: rows.filter((row) => row.isChanged).length }
  }

  /** The changed boxes, by row id, as typed. */
  collect(): Record<string, string> {
    const values: Record<string, string> = {}
    for (const row of this.rows.values()) if (row.isChanged) values[row.rowName] = row.value
    return values
  }

  /** Each reorderable table's row ids, in their order now, by its section's id;  `{}` for a page with none. */
  collectOrder(): ChoicesOrder {
    const tables = new Map<string, ChoiceRowPart[]>()
    for (const row of this.rows.values()) {
      if (row.orderKey === undefined) continue
      if (!tables.has(row.orderKey)) tables.set(row.orderKey, [])
      tables.get(row.orderKey)!.push(row)
    }
    const order: ChoicesOrder = {}
    for (const [key, rows] of tables)
      order[key] = rows.sort((one, other) => one.orderIndex - other.orderIndex).map((row) => row.rowName)
    return order
  }

  ////////////////
  // ## Changes
  ////////////////

  /**
   * A box or the feedback changed:  everyone listening hears it, the draft saves once typing stops
   * (`CHOICES_SAVE_MS`), and a sent answer is stale.
   */
  changed() {
    this.isUnsaved = true
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => void this.save(), CHOICES_SAVE_MS)
    this.setSaved("not saved yet")
    if (this.sent) this.isStale = true
    this.notify()
  }

  /** The feedback box changed to `text`. */
  setFeedback(text: string) {
    this.feedback = text
    this.changed()
  }

  /** Call `listener` on every change;  returns the undo. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Save what's typed as the page goes away (`pagehide`, or the page hidden), on `window`'s page;  returns the undo.
   * - SIDE EFFECT:  listens on `window` and its document until undone
   */
  watch(window: Window): () => void {
    const leaving = () => void this.save({ keepalive: true })
    const hidden = () => {
      if (window.document.visibilityState === "hidden") leaving()
    }
    window.addEventListener("pagehide", leaving)
    window.document.addEventListener("visibilitychange", hidden)
    return () => {
      window.removeEventListener("pagehide", leaving)
      window.document.removeEventListener("visibilitychange", hidden)
      if (this.timer) clearTimeout(this.timer)
    }
  }

  ////////////////
  // ## Saving and sending
  ////////////////

  /**
   * Save the draft now, if anything changed since the last save.
   * - `keepalive`:  the page is going away;  the request outlives it
   * - NEVER throws:  a failure shows in `savedText`, and the next change tries again
   */
  async save({ keepalive = false }: { keepalive?: boolean } = {}): Promise<void> {
    if (this.timer) clearTimeout(this.timer)
    if (!this.isUnsaved) return
    this.isUnsaved = false
    this.setSaved("saving…")
    this.notify()
    try {
      const { draft } = (await this.post("draft", keepalive)) as { draft: ChoicesDraft }
      this.setSaved(`saved ${clockOf(draft.saved)}`)
    } catch (failure) {
      this.isUnsaved = true
      this.setSaved(`can't save:  ${(failure as Error).message}`, { isError: true })
    }
    this.notify()
  }

  /**
   * "Do it":  send every changed box and the feedback;  `sent` is what went, or `error` why not.
   * - NEVER throws
   */
  async send(): Promise<void> {
    if (this.isSending) return
    if (this.timer) clearTimeout(this.timer)
    this.error = ""
    this.isSending = true
    this.notify()
    try {
      const { answer } = (await this.post("answer")) as { answer: ChoicesAnswer }
      this.isUnsaved = false
      this.sent = answer
      this.isStale = false
      this.setSaved(`saved ${clockOf(answer.answered)}`)
    } catch (failure) {
      this.error = `Not sent:  ${(failure as Error).message}`
    } finally {
      this.isSending = false
      this.notify()
    }
  }

  /**
   * The "Sent" message for the answer sent, or `""`:  when, how often, what;
   * `isStale`:  changed since, so it says to press Do it again.
   */
  get sentText(): string {
    const answer = this.sent
    if (!answer) return ""
    const changes = Object.keys(answer.values ?? {}).length
    const again = answer.changes ? ` (sent ${answer.changes + 1} times)` : ""
    const at = clockOf(answer.answered)
    if (this.isStale) return `Sent at ${at}${again};  changed since:  press Do it again to send the new ones.`
    const what = `${changes} changed, ${this.rows.size - changes} as recommended`
    return `Sent to Claude at ${at}${again}:  ${what}.  Change anything and press Do it again to resend.`
  }

  /**
   * What was typed and sent before, back into the boxes:  the draft, else the answer;  the feedback returns in
   * `feedback`.
   * - the template (a page outside a `details/` folder, not naming its rows):  says nothing is saved
   * - NEVER throws:  a failure shows in `savedText`
   */
  async restore(): Promise<void> {
    if (!this.options.server || this.options.protocol === "file:") return
    if (!SAVED_CHOICES_PAGE.test(this.options.page)) {
      this.setSaved("a template:  nothing here is saved")
      return this.notify()
    }
    try {
      const [draft, answer] = await Promise.all([this.fetchJson("draft"), this.fetchJson("answer")])
      const last = (draft ?? answer) as ChoicesDraft | ChoicesAnswer | undefined
      if (last) {
        this.restored = last.values ?? {}
        for (const [id, value] of Object.entries(this.restored)) this.rows.get(id)?.showValue(value)
        this.feedback = last.feedback ?? ""
        this.restoredOrder = last.order ?? {}
      }
      if (draft) this.setSaved(`saved ${clockOf((draft as ChoicesDraft).saved)}`)
      if (answer) this.sent = answer as ChoicesAnswer
    } catch (failure) {
      this.setSaved(`can't load what you typed:  ${(failure as Error).message}`, { isError: true })
    }
    this.notify()
  }

  ////////////////
  // ## Files
  ////////////////

  /**
   * `file` (from the repo's root) at `line`, for VS Code:  `vscode://file/<checkout>/<file>:<line>`, which VS Code
   * opens AT the line;  `#` before the page server says where the checkout is (the link then does nothing).
   * - the checkout:  the one the page server serves (`root`);  a `/worktrees/<w>/` page's, that worktree
   */
  static fileUrl(file: string, line: number, { root, pathname }: { root?: string; pathname: string }): string {
    if (!root) return "#"
    const worktree = /^\/worktrees\/([^/]+)\//.exec(pathname)?.[1]
    const checkout = worktree ? `${root}/.claude/worktrees/${worktree}` : root
    return `vscode://file${encodeURI(`${checkout}/${file}`)}:${line}`
  }

  ////////////////
  // ## Folds
  ////////////////

  /**
   * Unfold every section holding rows in `document`, or, once they all are, fold them again;  true when they're
   * now all open.
   * - remembered as the reader's own folds are:  a property set fires no `ui-open`, so this writes the docs
   *   runtime's store itself (`FOLD_KEY_PREFIX` + path)
   */
  static expandAll(document: Document): boolean {
    const sections = ChoicesForm.sectionsOf(document)
    const isAllOpen = ChoicesForm.isAllOpen(document)
    for (const section of sections) section.collapsed = isAllOpen
    try {
      const key = `${FOLD_KEY_PREFIX}${document.location.pathname}`
      const folds = JSON.parse(localStorage.getItem(key) ?? "{}") as Record<string, boolean>
      for (const section of sections) folds[section.id] = isAllOpen
      localStorage.setItem(key, JSON.stringify(folds))
    } catch {
      // storage blocked:  the folds just aren't remembered
    }
    return !isAllOpen
  }

  /** Is every section holding rows in `document` open? */
  static isAllOpen(document: Document): boolean {
    return ChoicesForm.sectionsOf(document).every((section) => !section.collapsed)
  }

  /** The `<ui-section>`s holding rows (`<epic-choice-rows>`). */
  private static sectionsOf(document: Document): Array<Element & { collapsed: boolean; id: string }> {
    return [...document.querySelectorAll("ui-section:has(> epic-choice-rows)")] as Array<
      Element & { collapsed: boolean; id: string }
    >
  }

  ////////////////
  // ## Helpers
  ////////////////

  /**
   * POST the page's boxes to `/api/choices/<what>`;  the route's reply.
   * - throws an `Error` saying, in Owen's words, what to do:  reload, restart the server, open it from the server
   */
  private async post(what: "draft" | "answer", keepalive = false): Promise<unknown> {
    if (!this.options.server?.token)
      throw new Error("this page isn't on the page server:  open it with `epic choices show`")
    const order = this.collectOrder()
    const body: ChoicesValues & { page: string } = {
      page: this.options.page,
      values: this.collect(),
      feedback: this.feedback.trim(),
      ...(Object.keys(order).length > 0 && { order })
    }
    return this.link.post(`${CHOICES_API}/${what}`, body, { keepalive })
  }

  /** `GET /api/choices/<what>` for this page:  the draft or answer, or `undefined`. */
  private async fetchJson(what: "draft" | "answer"): Promise<unknown> {
    const response = await this.options.fetch(`${CHOICES_API}/${what}?page=${encodeURIComponent(this.options.page)}`, {
      cache: "no-store"
    })
    if (response.status === 404) throw new Error("page server too old, restart it")
    if (!response.ok) return undefined
    return ((await response.json()) as Record<string, unknown>)[what] ?? undefined
  }

  /** The save status;  `isError`:  in red. */
  private setSaved(text: string, { isError = false }: { isError?: boolean } = {}) {
    this.savedText = isError ? sentence(text) : text
    this.isSaveError = isError
  }

  /** Everyone listening hears of a change. */
  private notify() {
    this.version++
    for (const listener of this.listeners) listener()
  }
}

/** `iso`'s local time of day, `14:04`. */
function clockOf(iso: string): string {
  return PlanDates.clock(new Date(iso))
}
