import { Show, createEffect, createMemo, onSettled, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, IconGlyph, proto, SlotContent, UIElement, UIT } from "$/ui/core"

import { NOBODY_LISTENING, isImmediate } from "$/epics/review"
// the page's view of the review inbox, as an item's:  its file, not `epic-item`'s barrel (which would define it here)
import { ReviewState } from "$/epics/components/epic-item/ReviewState"

import { epicPageVocabulary } from "./epic-page.vocabulary.en"
import { EpicPageFallback } from "./epic-page.fallback"
import {
  ACTIONS,
  ACTIVE,
  COMMITS_KEY,
  COMMITS_PROPERTY,
  DONE,
  FLASH_MS,
  FOLLOW_UPS,
  GIT,
  HAS_COMMITS,
  HEAD,
  HEADING,
  HUNG,
  ICON,
  LAYOUT_ATTRIBUTES,
  META,
  NOTICE,
  OPEN_ITEMS,
  PROMPT,
  REVIEW_LINE,
  REVIEW_NOW,
  SEND,
  SLEEPING,
  STACK_PROPERTY,
  STATUS,
  TODO,
  type EpicPageVocabulary,
  type HeaderMarks,
  type PageSignals,
  type PhaseLine,
  type StepLabel
} from "./epic-page.types"

import pageCSS from "./epic-page.css?inline"

/****************
 * ### `<epic-page>`
 * A plan doc:  one epic's page, its data in attributes, its Overview and sections as children.
 * - Draws the sticky page header (`Epic: <title>`;  at its right Send and Review Now while it's reviewed, the git
 *   toggle, the sleeping mark, the bedtime label and the step label), the review line, the meta lines (branch,
 *   worktree, dates, the durable doc's link from `slot="durable"`), a future epic's notice, then its children.
 * - The step label follows the phases:  the active one (orange, links to it);  else DONE (green) once every phase
 *   is done;  else the next one (grey);  none without phases, FUTURE (violet) for a future epic.  Read from the
 *   `<epic-phase>`s below, so it follows the live update:  a `MutationObserver` bumps `layout`.
 * - The sleeping mark (😴, Owen 2026-10-07:  "so I can see what I need to follow up on"):  phases, none under way,
 *   but open follow-ups (`FOLLOW_UPS`:  questions, calls, issues, todos, tests);  what's open in its tooltip.  Not on
 *   a future epic, nor one still planning.  From the items below, so it follows the live update too.
 * - The review line under the header:  "To review this doc, type `/epic review <name>`", copied on click (it
 *   flashes);  on every plan doc, as today:  it's how a review starts.  While the page is reviewed with no session
 *   listening, it says so first.
 * - REVIEW (P10), only while the page is reviewed (served with a token, its inbox answering:  `ReviewClient`,
 *   through a `ReviewState` of its own):  Send (paper plane:  grey with nothing to send, blue with unsent marks,
 *   outlined blue once sent) and Review Now (wand:  every mark sent and each revisit asked now;  blue while there's
 *   anything to work through).  Nobody listening:  their tooltips say so (`NOBODY_LISTENING`);  what a click did
 *   goes to the notice line at the window's bottom (`ReviewState`'s).
 * - The git toggle (only when the doc lists commits) shows or hides every `<epic-commit>` below, through
 *   `--epic-commits-display`;  remembered per page (`localStorage`), as today's.
 * - The page-wide signals its blocks read (`signalsOf()`):  `top`, where top-level titles stick (the site header's
 *   `--spell-site-header-height` plus this header's height, re-measured as either changes size), and `layout`.
 * - SHARED LOOK:  `epic-page.css` declares the pack's tokens (`--epic-*`:  colours, bands, the inset, item state
 *   colours, the chip) on its `:host`;  every `<epic-*>` below inherits them.
 * - SIDE EFFECT:  observes its subtree and the site header while connected;  follows the page's review client.
 ****************/
export class EpicPage extends UIElement<EpicPageVocabulary> {
  @proto static vocabulary = epicPageVocabulary
  @proto static styles = { "epic-page": pageCSS }
  @proto static Fallback = EpicPageFallback

  /** Its tag:  what its blocks look for around them. */
  static readonly TAG = epicPageVocabulary.tag

  /** The signals of each page host (`signalsOf()`). */
  private static readonly pageSignals = new WeakMap<Element, PageSignals>()

  ////////////////
  // ## State
  ////////////////

  /** Light-DOM slot occupancy:  the durable doc's link. */
  readonly slots = new SlotContent(this.host)

  /** Every commit shows. */
  readonly showCommits = new Cell(untrack(() => EpicPage.savedCommits()))

  /** The page-wide signals. */
  readonly signals = EpicPage.signalsOf(this.host)

  /**
   * The page's view of the review inbox:  only `reviewing()` and the client are read here (it's keyed by the epic's
   * name, never an item's:  no mark is ever the page's).
   */
  readonly review = new ReviewState(() => this.attrs.epic)

  /** The review line, just copied:  it flashes and says so. */
  readonly copied = new Cell(false)

  /** The meta lines', the header buttons' and the review line's icons. */
  readonly icons = {
    branch: new IconGlyph(this, () => "code branch"),
    folder: new IconGlyph(this, () => "folder"),
    calendar: new IconGlyph(this, () => "calendar"),
    book: new IconGlyph(this, () => "book"),
    git: new IconGlyph(this, () => "git"),
    chevron: new IconGlyph(this, () => "chevron right"),
    send: new IconGlyph(this, () => "paper plane"),
    reviewNow: new IconGlyph(this, () => "wand magic sparkles"),
    copy: new IconGlyph(this, () => "copy")
  }

  /** The review line's flash timer. */
  private flashTimer = 0

  /** The sticky header, as drawn. */
  private header?: HTMLElement

  ////////////////
  // ## Derived state
  ////////////////

  /** The phases below, read again on every layout change. */
  readonly phases = createMemo((): PhaseLine[] => {
    this.signals.layout.get()
    return Array.from(this.host.querySelectorAll("epic-phase"), (phase) => ({
      id: phase.id,
      status: phase.getAttribute("status") ?? TODO,
      title: phase.getAttribute("title") ?? phase.querySelector(":scope > [slot=title]")?.textContent?.trim() ?? ""
    }))
  })

  /** The step label;  `undefined` for none. */
  readonly step = createMemo((): StepLabel | undefined => {
    const phases = this.phases()
    if (!phases.length) {
      return this.attrs.future ? { color: "violet", icon: "seedling", words: this.text("future") } : undefined
    }
    const active = phases.find((phase) => phase.status === ACTIVE)
    if (active) return this.phaseLabel(active, "orange", "circle half stroke", "")
    const next = phases.find((phase) => phase.status !== DONE)
    if (!next) return { color: "green", icon: "check", words: this.text("done") }
    return this.phaseLabel(next, "grey", "circle right", this.text("next"))
  })

  /** Still planning:  no phases yet, and not a future epic.  The `Plan hung?` aside shows. */
  readonly planning = createMemo(() => !this.attrs.future && this.phases().length === 0)

  /**
   * The kickoff prompt as typed, for the `Plan hung?` aside to copy:  the Overview's `slot="prompt"`, a paragraph
   * per blank line, `<br>`s as line breaks;  "" without one.
   */
  readonly prompt = createMemo(() => {
    this.signals.layout.get()
    const quote = this.host.querySelector(PROMPT)
    if (!quote) return ""
    const paragraphs = quote.querySelectorAll("p")
    const blocks = paragraphs.length ? Array.from(paragraphs) : [quote]
    return blocks
      .map((block) =>
        EpicPage.textOf(block)
          .replace(/ *\n */g, "\n")
          .trim()
      )
      .join("\n\n")
  })

  /** Does the doc list commits?  Then the git toggle shows. */
  readonly hasCommits = createMemo(() => {
    this.signals.layout.get()
    return !!this.host.querySelector(HAS_COMMITS)
  })

  /**
   * A SLEEPING doc's open follow-ups, in words (`2 questions, 1 todo`):  phases, none under way, items open;  `""`
   * when it isn't sleeping (a future epic, one still planning, one under way, nothing open).
   */
  readonly sleeping = createMemo(() => {
    this.signals.layout.get()
    const phases = this.phases()
    if (this.attrs.future || !phases.length || phases.some((phase) => phase.status === ACTIVE)) return ""
    const counts = new Map<string, number>()
    for (const item of this.host.querySelectorAll(OPEN_ITEMS)) {
      const letter = item.id[0] ?? ""
      if (FOLLOW_UPS[letter]) counts.set(letter, (counts.get(letter) ?? 0) + 1)
    }
    return Object.keys(FOLLOW_UPS)
      .filter((letter) => counts.has(letter))
      .map((letter) => {
        const count = counts.get(letter)!
        return `${count} ${FOLLOW_UPS[letter]![count === 1 ? 0 : 1]}`
      })
      .join(", ")
  })

  /** What the header's review buttons show;  `undefined` while the page isn't reviewed. */
  readonly marks = createMemo((): HeaderMarks | undefined => {
    const client = this.review.client
    // tracks the client's changes:  every read below follows them
    if (!this.review.reviewing() || !client) return undefined
    const all = Object.values(client.inbox.marks)
    const unsent = client.unsentCount
    return {
      send: unsent ? "unsent" : all.length ? "sent" : "idle",
      unsent,
      waiting: all.filter((mark) => !isImmediate(mark)).length,
      listening: client.listening
    }
  })

  ////////////////
  // ## Element hooks
  ////////////////

  protected hostStates() {
    return { future: !!this.attrs.future, commits: this.showCommits.get() }
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * Watch the subtree (numbers, step label) and the headers' heights (`top`) while connected;  follow the review
   * inbox while connected (kept alive:  a removed page stops).
   */
  mount(): JSX.Element {
    if (!isServer) {
      createEffect(
        () => this.connected.get(),
        (connected) => (connected ? this.review.connect() : undefined)
      )
      onSettled(() => {
        let queued = false
        const bump = () => {
          if (queued) return
          queued = true
          queueMicrotask(() => {
            queued = false
            this.signals.layout.set(untrack(() => this.signals.layout.get()) + 1)
          })
        }
        const mutations = new MutationObserver(bump)
        mutations.observe(this.host, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: LAYOUT_ATTRIBUTES
        })
        const resizes = new ResizeObserver(() => this.measure())
        if (this.header) resizes.observe(this.header)
        const site = document.querySelector("spell-site-header")
        if (site) resizes.observe(site)
        window.addEventListener("resize", this.measure)
        this.measure()
        return () => {
          mutations.disconnect()
          resizes.disconnect()
          window.removeEventListener("resize", this.measure)
        }
      })
    }
    return super.mount()
  }

  render(): JSX.Element {
    return (
      // an EMPTY title:  the host's `title` would otherwise be a tooltip over the whole page (T8)
      <div class={this.classes()} part={this.part("base")} title="" style={this.pageStyle()}>
        <header ref={(element) => (this.header = element)} class={HEAD} part={this.part("header")}>
          <h1 class={HEADING} part={this.part("heading")}>
            {this.text("heading", { title: this.attrs.title ?? "" })}
          </h1>
          <Show when={this.marks()}>{(marks) => this.reviewButtons(marks)}</Show>
          <Show when={this.hasCommits()}>{this.gitToggle()}</Show>
          <span class={STATUS} part={this.part("status")}>
            <Show when={this.sleeping()}>
              {(words) => (
                <span
                  class={SLEEPING}
                  part={this.part("sleeping")}
                  role="img"
                  aria-label={this.text("sleeping", { words: words() })}
                  title={this.text("sleeping", { words: words() })}
                >
                  😴
                </span>
              )}
            </Show>
            <Show when={this.attrs.bedtime}>
              {(phases) => (
                <ui-label basic="" color="violet" icon="moon" title={this.text("bedtimeTip", { phases: phases() })}>
                  <span class="bedtime">{this.text("bedtime", { phases: phases() })}</span>
                </ui-label>
              )}
            </Show>
            <Show when={this.step()}>
              {(step) => (
                <ui-label
                  basic={step().color === "green" || step().color === "violet" ? undefined : ""}
                  color={step().color}
                  icon={step().icon}
                  href={step().href}
                  title={step().tip}
                >
                  {step().words}
                </ui-label>
              )}
            </Show>
          </span>
        </header>
        {this.reviewLine()}
        {this.metaLines()}
        <Show when={this.attrs.future}>{this.futureNotice()}</Show>
        <Show when={this.planning()}>{this.hungNotice()}</Show>
        <slot />
      </div>
    )
  }

  /** The meta lines:  branch, worktree, dates, durable doc. */
  private metaLines(): JSX.Element {
    return (
      <ul class={META} part={this.part("meta")}>
        <li>
          {this.icon(this.icons.branch)}
          <span>
            <Show
              when={this.attrs.branch}
              fallback={
                <>
                  {this.text("futureEpic")} <code>/epic future {this.attrs.epic}</code>, {this.text("noBranch")}
                </>
              }
            >
              {this.text("planDoc")} <code>/epic {this.attrs.epic}</code>, {this.text("branch")}{" "}
              <code>{this.attrs.branch}</code>
            </Show>
          </span>
        </li>
        <li>
          {this.icon(this.icons.folder)}
          <span>
            {this.text("worktree")}{" "}
            <Show when={this.attrs.worktree} fallback={this.text("noWorktree")}>
              <code class="path">{this.attrs.worktree}</code>
            </Show>
          </span>
        </li>
        <Show when={this.attrs.started || this.attrs.updated}>
          <li>
            {this.icon(this.icons.calendar)}
            <span>
              <Show when={this.attrs.started}>
                {this.text("started")} <time>{this.attrs.started}</time>
              </Show>
              <Show when={this.attrs.started && this.attrs.updated}>, </Show>
              <Show when={this.attrs.updated}>
                {this.text("updated")} <time>{this.attrs.updated}</time>
              </Show>
            </span>
          </li>
        </Show>
        <li class="durable" hidden={!this.slots.has(this.slot("durable"))}>
          {this.icon(this.icons.book)}
          <span>
            <b>{this.text("durable")}</b> <slot name={this.slot("durable")} />
          </span>
        </li>
      </ul>
    )
  }

  /** Send and Review Now:  round icon buttons, coloured by what waits (`marks`). */
  private reviewButtons(marks: () => HeaderMarks): JSX.Element {
    return (
      <span class={ACTIONS} part={this.part("actions")}>
        <button
          type={UIT.BUTTON}
          class={SEND}
          part={this.part("send")}
          data-state={marks().send}
          aria-label={this.sendWords(marks())}
          title={this.withNobody(this.sendWords(marks()), marks(), marks().send !== "idle")}
          onClick={() => void this.review.client?.send()}
        >
          {this.icon(this.icons.send)}
        </button>
        <button
          type={UIT.BUTTON}
          class={REVIEW_NOW}
          part={this.part("review-now")}
          data-state={marks().waiting ? "ready" : "idle"}
          aria-label={this.reviewNowWords(marks())}
          title={this.withNobody(this.reviewNowWords(marks()), marks(), !!marks().waiting)}
          onClick={() => void this.review.client?.send({ now: true })}
        >
          {this.icon(this.icons.reviewNow)}
        </button>
      </span>
    )
  }

  /** Send's words:  what a click sends, or why it sends nothing. */
  private sendWords(marks: HeaderMarks): string {
    if (marks.send === "unsent") {
      return marks.unsent === 1 ? this.text("sendOne") : this.text("sendMany", { count: marks.unsent })
    }
    return this.text(marks.send === "sent" ? "sent" : "sendIdle")
  }

  /** Review Now's words:  what Claude would work through. */
  private reviewNowWords(marks: HeaderMarks): string {
    if (!marks.waiting) return this.text("reviewNowIdle")
    return marks.waiting === 1 ? this.text("reviewNowOne") : this.text("reviewNowMany", { count: marks.waiting })
  }

  /** A button's tooltip:  `words`, then that nobody is reviewing when nobody listens and there's something waiting. */
  private withNobody(words: string, marks: HeaderMarks, waiting: boolean): string {
    return marks.listening || !waiting ? words : `${words}.  ${NOBODY_LISTENING}`
  }

  /**
   * The review line:  `To review this doc, type /epic review <name>`, a click copies the command;  reviewed with
   * nobody listening, it says so first.
   */
  private reviewLine(): JSX.Element {
    const nobody = () => !!this.marks() && !this.marks()!.listening
    return (
      <button
        type={UIT.BUTTON}
        class={[REVIEW_LINE, { flash: this.copied.get(), nobody: nobody() }]}
        part={this.part("review-line")}
        title={this.text("copyCommand")}
        onClick={() => void this.copyCommand()}
      >
        {this.icon(this.icons.copy)}
        <span>
          {this.text(nobody() ? "reviewLineNobody" : "reviewLine")} <code>{this.command()}</code>
        </span>
        <span class="done" aria-live="polite">
          {this.copied.get() ? this.text("copied") : ""}
        </span>
      </button>
    )
  }

  /** `/epic review <name>`:  what the review line copies. */
  private command(): string {
    return `/epic review ${this.attrs.epic ?? ""}`
  }

  /** The git toggle:  a round icon button, pressed while every commit shows. */
  private gitToggle(): JSX.Element {
    return (
      <button
        type={UIT.BUTTON}
        class={GIT}
        part={this.part("git")}
        aria-pressed={this.showCommits.get() ? UIT.TRUE : UIT.FALSE}
        aria-label={this.text(this.showCommits.get() ? "hideCommits" : "showCommits")}
        title={this.text(this.showCommits.get() ? "hideCommits" : "showCommits")}
        onClick={this.toggleCommits}
      >
        {this.icon(this.icons.git)}
      </button>
    )
  }

  /** A doc still planning:  the folded `Plan hung?` aside -- how to restart the session, and the prompt to copy. */
  private hungNotice(): JSX.Element {
    return (
      <details class={HUNG} part={this.part("hung")}>
        <summary>
          <span class="chevron" aria-hidden={UIT.TRUE}>
            {this.icons.chevron.svg()}
          </span>
          {this.text("hung")}
        </summary>
        <div class="aside">
          <p>
            {this.text("hungBefore")} <code>/epic {this.attrs.epic}</code> {this.text("hungAfter")}
          </p>
          <Show when={this.prompt()}>
            <ui-code language="text" wrap="" copy="">
              {this.prompt()}
            </ui-code>
          </Show>
        </div>
      </details>
    )
  }

  /** A future epic's notice:  not planned yet, and where its open questions are. */
  private futureNotice(): JSX.Element {
    return (
      <ui-message
        class={NOTICE}
        part={this.part("notice")}
        state="info"
        size="small"
        header={this.text("futureHeader")}
      >
        <p>
          {this.text("futureBody")} <a href="details/analysis.html">{this.text("analysisPage")}</a>.{" "}
          <code>/epic {this.attrs.epic}</code> {this.text("futurePlan")}
        </p>
      </ui-message>
    )
  }

  /** An icon's box:  its glyph centred on the first line of what follows. */
  private icon(glyph: IconGlyph): JSX.Element {
    return (
      <span class={ICON} aria-hidden={UIT.TRUE}>
        {glyph.svg()}
      </span>
    )
  }

  /**
   * The wrapper's inline style, for everything below:  the sticky stack below this header (`--epic-stack`);  every
   * commit shown while the toggle is on.
   */
  private pageStyle(): Record<string, string> {
    const style: Record<string, string> = { [STACK_PROPERTY]: `${this.signals.top.get()}px` }
    if (this.showCommits.get()) style[COMMITS_PROPERTY] = "block"
    return style
  }

  ////////////////
  // ## Behaviour
  ////////////////

  /** The git toggle, clicked:  show or hide every commit, and remember it. */
  private readonly toggleCommits = () => {
    const on = !untrack(() => this.showCommits.get())
    this.showCommits.set(on)
    try {
      localStorage.setItem(COMMITS_KEY + location.pathname, on ? "1" : "")
    } catch {
      // private mode:  the choice lasts the visit
    }
  }

  /** The review line, clicked:  copy the command, then flash and say so. */
  private async copyCommand() {
    if (!(await EpicPage.copyText(untrack(() => this.command())))) return
    // off first, so a second click flashes again
    this.copied.set(false)
    clearTimeout(this.flashTimer)
    requestAnimationFrame(() => this.copied.set(true))
    this.flashTimer = window.setTimeout(() => this.copied.set(false), FLASH_MS + 600)
  }

  /** Measure where top-level titles stick:  the site header's height plus this header's. */
  private readonly measure = () => {
    const site = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--spell-site-header-height"))
    const head = this.header?.getBoundingClientRect().height ?? 0
    const top = Math.round((Number.isNaN(site) ? 0 : site) + head)
    if (untrack(() => this.signals.top.get()) !== top) this.signals.top.set(top)
  }

  /** A phase's step label:  `P4`, its name in the tooltip, a link to it. */
  private phaseLabel(phase: PhaseLine, color: StepLabel["color"], icon: string, prefix: string): StepLabel {
    const words = phase.id.toUpperCase()
    return { color, icon, words, tip: `${prefix}${words} · ${phase.title}`, href: `#${phase.id}` }
  }

  ////////////////
  // ## Page signals
  ////////////////

  /**
   * The page-wide signals of page host `host`, made the first time anyone asks:  its blocks may connect before its
   * controller exists.
   */
  static signalsOf(host: Element): PageSignals {
    let signals = EpicPage.pageSignals.get(host)
    if (!signals) {
      signals = { top: new Cell(0), layout: new Cell(0) }
      EpicPage.pageSignals.set(host, signals)
    }
    return signals
  }

  /** `element`'s text as typed:  white space as one space, a `<br>` as a line break. */
  private static textOf(element: Element): string {
    let text = ""
    for (const node of element.childNodes) {
      // the source's own line breaks and indents are layout, not text:  one space
      if (node.nodeType === Node.TEXT_NODE) text += (node.textContent ?? "").replace(/\s+/g, " ")
      else if ((node as Element).localName === "br") text += "\n"
      else if (node.nodeType === Node.ELEMENT_NODE) text += EpicPage.textOf(node as Element)
    }
    return text
  }

  /**
   * Put `value` on the clipboard;  true when it got there.
   * - the async Clipboard API first;  where it's refused (a webview without the permission), the old
   *   `execCommand("copy")` from a hidden textarea, as the old runtime's `copyText()`
   * - NEVER throws
   */
  private static async copyText(value: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      const area = document.createElement("textarea")
      area.value = value
      area.setAttribute("readonly", "")
      area.style.cssText = "position: fixed; opacity: 0; pointer-events: none"
      document.body.append(area)
      area.select()
      // oxlint-disable-next-line typescript/no-deprecated -- the fallback where the Clipboard API is refused
      const copied = document.execCommand("copy")
      area.remove()
      return copied
    }
  }

  /** Is the git toggle on for this page, as last left?  `false` without storage. */
  private static savedCommits(): boolean {
    try {
      return localStorage.getItem(COMMITS_KEY + location.pathname) === "1"
    } catch {
      return false
    }
  }
}
