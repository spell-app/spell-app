import { Show, createEffect, createMemo, onSettled, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { PlanDates } from "$/epics/dates"
import { AgentsClient, NOBODY_LISTENING, isImmediate } from "$/epics/review"
// the page's view of the review inbox, as an item's:  its file, not `epic-item`'s barrel (which would define it here)
import { ReviewState } from "$/epics/components/epic-item/ReviewState"

import { epicPageVocabulary } from "./EpicPage.en"
import { AgentsPanel } from "./AgentsPanel"
import {
  ACTIONS,
  ACTIVE,
  COMMITS_KEY,
  COMMITS_PROPERTY,
  CRUMB_LINKS,
  CRUMBS,
  DONE,
  FLASH_MS,
  FOLLOW_UPS,
  GIT,
  HAS_COMMITS,
  HEAD,
  HEADING,
  HEADING_COPY,
  HUNG,
  ICON,
  LAYOUT_ATTRIBUTES,
  META,
  NOTICE,
  OLD_CRUMBS,
  OPEN_ITEMS,
  PROMPT,
  REVIEW_LINE,
  REVIEW_NOW,
  SEND,
  SLEEPING,
  STACK_PROPERTY,
  STATUS,
  SUBHEAD,
  TITLES,
  TODO,
  type EpicPageVocabulary,
  type HeaderMarks,
  type PageSignals,
  type PageText,
  type PhaseLine,
  type StepLabel
} from "./EpicPage.types"

import pageCSS from "./EpicPage.css?inline"
import crumbsCSS from "./Crumbs.css?inline"
import agentsCSS from "./AgentsPanel.css?inline"

/****************
 * ### `EpicPage`
 * The component behind `<epic-page>`:  a plan doc -- one epic's page, its data in attributes, its Overview and
 * sections as children.
 * - Draws the crumbs (`Docs › Epics › <title>`, P14:  none while the doc still holds its old `.spell-crumbs` before
 *   the page), the sticky page header (the h1 `/epic <name>`, copied on click, over the epic's title;  at its right Send
 *   and Review Now while it's reviewed, the git toggle, the sleeping mark, the bedtime label and the step label), the
 *   review line, the meta lines (branch, worktree, dates, the durable doc's link from `slot="durable"`), a future
 *   epic's notice, then its children.
 * - The step label follows the phases, in the colours of decision Q20:  the active one (outlined blue:  Claude is on
 *   it;  links to it);  else DONE (solid green) once every phase is done;  else the next one (grey);  none without
 *   phases, FUTURE (grey:  not started) for a future epic.  Read from the
 *   `<epic-phase>`s below, so it follows the live update:  a `MutationObserver` bumps `layout`.
 * - The sleeping mark (😴, Owen 2026-10-07:  "so I can see what I need to follow up on"):  phases, none under way,
 *   but open follow-ups (`FOLLOW_UPS`:  questions, calls, issues, todos, tests);  what's open in its tooltip.  Not on
 *   a future epic, nor one still planning.  From the items below, so it follows the live update too.
 * - The review line under the header:  "To review this doc, type `/epic review <name>`", copied on click (it
 *   flashes);  on every plan doc, as today:  it's how a review starts.  While the page is reviewed with no session
 *   listening, it says so first, in solid orange (a warning).
 * - REVIEW (P10), only while the page is reviewed (served with a token, its inbox answering:  `ReviewClient`,
 *   through a `ReviewState` of its own), blue and wearing the fill rule (Q20):  Send (paper plane:  a grey outline
 *   with nothing to send, dashed blue with marks not sent, outlined blue once sent) and Review Now (wand:  every mark
 *   sent and each revisit asked now;  outlined blue while there's anything to work through).  Nobody listening:  their tooltips say so (`NOBODY_LISTENING`);  what a click did
 *   goes to the notice line at the window's bottom (`ReviewState`'s).
 * - RUNNING AGENTS (epic `skillz` P3), right before its blocks:  the "Agents running" panel (`<AgentsPanel>`), only
 *   while the page is served with a token, the epic's list answers (`AgentsClient`) and an agent runs;  each row a
 *   note box that redirects that agent.  In the shadow root:  not a section, so the contents and counts never see it.
 * - The git toggle (only when the doc lists commits) shows or hides every `<epic-commit>` below, through
 *   `--epic-commits-display`;  remembered per page (`localStorage`), as today's.
 * - The page-wide signals its blocks read (`signalsOf()`):  `top`, where top-level titles stick (the site header's
 *   `--spell-site-header-height` plus this header's height, re-measured as either changes size), and `layout`.
 * - EDGE TO EDGE (P14):  its `:host` breaks out of the docs' `<main>` padding (`--spell-doc-pad-inline`,
 *   `spell-doc.css`), so the bands reach across;  everything inside insets itself by `--epic-inset`.
 * - SHARED LOOK:  `EpicPage.css` declares the pack's tokens (`--epic-*`:  colours, bands, the inset, item state
 *   colours, the chip) on its `:host`;  every `<epic-*>` below inherits them.
 * - SIDE EFFECT:  observes its subtree and the site header while connected;  follows the page's review and agents
 *   clients.
 ****************/
export class EpicPage extends E.UIComponent<EpicPageVocabulary> {
  @E.proto static vocabulary = epicPageVocabulary
  @E.proto static styleSheets = { "epic-page": pageCSS, "epic-crumbs": crumbsCSS, "epic-agents": agentsCSS }

  /** Its tag:  what its blocks look for around them. */
  static readonly TAG = epicPageVocabulary.tag

  /** The signals of each page's DOM element (`signalsOf()`). */
  private static readonly pageSignals = new WeakMap<Element, PageSignals>()

  ////////////////
  // ## State
  ////////////////

  /** Light-DOM slot occupancy:  the durable doc's link. */
  readonly slots = new E.SlotContent(this.domElement)

  /** Every commit shows. */
  @E.cssState("commits")
  @E.state
  accessor showCommits = EpicPage.savedCommits()

  /** The page-wide signals. */
  readonly signals = EpicPage.signalsOf(this.domElement)

  /**
   * The page's view of the review inbox:  only `reviewing()` and the client are read here (it's keyed by the epic's
   * name, never an item's:  no mark is ever the page's).
   */
  readonly review = new ReviewState(() => this.epic)

  /** The epic's running agents, for the panel;  none in a server render. */
  readonly agents = isServer ? undefined : AgentsClient.forPage()

  /** The review line, just copied:  it flashes and says so. */
  @E.state accessor isCopied = false

  /** The heading, just copied:  it says so. */
  @E.state accessor isHeadingCopied = false

  /** The meta lines', the header buttons' and the review line's icons. */
  readonly icons = {
    branch: new E.IconGlyph({ owner: this, name: () => "code branch" }),
    folder: new E.IconGlyph({ owner: this, name: () => "folder" }),
    calendar: new E.IconGlyph({ owner: this, name: () => "calendar" }),
    book: new E.IconGlyph({ owner: this, name: () => "book" }),
    git: new E.IconGlyph({ owner: this, name: () => "git" }),
    chevron: new E.IconGlyph({ owner: this, name: () => "chevron right" }),
    send: new E.IconGlyph({ owner: this, name: () => "paper plane" }),
    reviewNow: new E.IconGlyph({ owner: this, name: () => "wand magic sparkles" }),
    copy: new E.IconGlyph({ owner: this, name: () => "copy" })
  }

  /** The review line's flash timer. */
  private flashTimer = 0

  /** Clears the heading's "copied". */
  private headingTimer = 0

  /** The sticky header, as drawn. */
  private header?: HTMLElement

  ////////////////
  // ## Derived state
  ////////////////

  /** The phases below, read again on every layout change. */
  readonly phases = createMemo((): PhaseLine[] => {
    this.signals.layout.get()
    return Array.from(this.domElement.querySelectorAll("epic-phase"), (phase) => ({
      id: phase.id,
      status: phase.getAttribute("status") ?? TODO,
      title: phase.getAttribute("title") ?? phase.querySelector(":scope > [slot=title]")?.textContent?.trim() ?? ""
    }))
  })

  /** The step label;  `undefined` for none. */
  readonly step = createMemo((): StepLabel | undefined => {
    const phases = this.phases()
    if (!phases.length) {
      return this.future ? { color: "grey", icon: "seedling", words: this.translationForKey("future") } : undefined
    }
    const active = phases.find((phase) => phase.status === ACTIVE)
    if (active) return this.phaseLabel(active, "blue", "circle half stroke", "")
    const next = phases.find((phase) => phase.status !== DONE)
    if (!next) return { color: "green", icon: "check", words: this.translationForKey("done") }
    return this.phaseLabel(next, "grey", "circle right", this.translationForKey("next"))
  })

  /** Does the doc still hold its old crumbs before the page (`OLD_CRUMBS`)?  Then it draws none of its own. */
  readonly hasOldCrumbs = createMemo(
    () => this.isConnected && !!this.domElement.parentElement?.querySelector(OLD_CRUMBS)
  )

  /** Still planning:  no phases yet, and not a future epic.  The `Plan hung?` aside shows. */
  readonly planning = createMemo(() => !this.future && this.phases().length === 0)

  /**
   * The kickoff prompt as typed, for the `Plan hung?` aside to copy:  the Overview's `slot="prompt"`, a paragraph
   * per blank line, `<br>`s as line breaks;  "" without one.
   */
  readonly prompt = createMemo(() => {
    this.signals.layout.get()
    const quote = this.domElement.querySelector(PROMPT)
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
    return !!this.domElement.querySelector(HAS_COMMITS)
  })

  /**
   * A SLEEPING doc's open follow-ups, in words (`2 questions, 1 todo`):  phases, none under way, items open;  `""`
   * when it isn't sleeping (a future epic, one still planning, one under way, nothing open).
   */
  readonly sleeping = createMemo(() => {
    this.signals.layout.get()
    const phases = this.phases()
    if (this.future || !phases.length || phases.some((phase) => phase.status === ACTIVE)) return ""
    const counts = new Map<string, number>()
    for (const item of this.domElement.querySelectorAll(OPEN_ITEMS)) {
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

  /** A future epic:  not planned yet. */
  @E.cssState("future")
  get isFuture(): boolean {
    return !!this.future
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * Watch the subtree (numbers, step label) and the headers' heights (`top`) while connected;  follow the review
   * inbox while connected (kept alive:  a removed page stops).
   */
  onMount(): JSX.Element {
    if (!isServer) {
      createEffect(
        () => this.isConnected,
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
        mutations.observe(this.domElement, {
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
    return super.onMount()
  }

  render(): JSX.Element {
    return (
      // an EMPTY title:  the DOM element's `title` would otherwise be a tooltip over the whole page (T8)
      <div class={this.rootClasses} part={this.partForName("base")} title="" style={this.pageStyle()}>
        <Show when={!this.hasOldCrumbs()}>{this.crumbs()}</Show>
        <header ref={(element) => (this.header = element)} class={HEAD} part={this.partForName("header")}>
          <div class={TITLES}>
            <h1 class={HEADING} part={this.partForName("heading")}>
              <button
                type="button"
                class={[HEADING_COPY, { flash: this.isHeadingCopied }]}
                title={this.translationForKey("copyHeading", { command: this.headingCommand() })}
                onClick={() => void this.copyHeading()}
              >
                {this.headingCommand()}
              </button>
              <span class="done" aria-live="polite">
                {this.isHeadingCopied ? this.translationForKey("copied") : ""}
              </span>
            </h1>
            <Show when={this.title}>
              <p class={SUBHEAD} part={this.partForName("subhead")}>
                {this.title}
              </p>
            </Show>
          </div>
          <Show when={this.marks()}>{(marks) => this.reviewButtons(marks)}</Show>
          <Show when={this.hasCommits()}>{this.gitToggle()}</Show>
          <span class={STATUS} part={this.partForName("status")}>
            <Show when={this.sleeping()}>
              {(words) => (
                <span
                  class={SLEEPING}
                  part={this.partForName("sleeping")}
                  role="img"
                  aria-label={this.translationForKey("sleeping", { words: words() })}
                  title={this.translationForKey("sleeping", { words: words() })}
                >
                  😴
                </span>
              )}
            </Show>
            <Show when={this.bedtime}>
              {(phases) => (
                <ui-label
                  class="bedtime-label"
                  basic=""
                  color="violet"
                  icon="bed"
                  title={this.translationForKey("bedtimeTip", { phases: phases() })}
                >
                  <span class="bedtime">{this.translationForKey("bedtime", { phases: phases() })}</span>
                </ui-label>
              )}
            </Show>
            <Show when={this.step()}>
              {(step) => (
                <ui-label
                  basic={step().color === "green" ? undefined : ""}
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
        <Show when={this.future}>{this.futureNotice()}</Show>
        <Show when={this.planning()}>{this.hungNotice()}</Show>
        <AgentsPanel
          client={this.agents}
          connected={this.isConnected}
          top={this.signals.top.get()}
          text={this.pageText}
        />
        <slot />
      </div>
    )
  }

  /** The crumbs:  `Docs › Epics › <title>`, the docs' eyebrow over the header. */
  private crumbs(): JSX.Element {
    return (
      <ui-breadcrumb
        class={CRUMBS}
        part={this.partForName("crumbs")}
        size="small"
        aria-label={this.translationForKey("crumbs")}
      >
        <ui-breadcrumb-section href={CRUMB_LINKS.docs.href} target={CRUMB_LINKS.docs.target}>
          {this.translationForKey("crumbDocs")}
        </ui-breadcrumb-section>
        <ui-breadcrumb-section href={CRUMB_LINKS.epics.href} target={CRUMB_LINKS.epics.target}>
          {this.translationForKey("crumbEpics")}
        </ui-breadcrumb-section>
        <ui-breadcrumb-section active="">{this.title || this.epic}</ui-breadcrumb-section>
      </ui-breadcrumb>
    )
  }

  /** The meta lines:  branch, worktree, dates, durable doc. */
  private metaLines(): JSX.Element {
    return (
      <ul class={META} part={this.partForName("meta")}>
        <li>
          {this.icon(this.icons.branch)}
          <span>
            <Show
              when={this.branch}
              fallback={
                <>
                  {this.translationForKey("futureEpic")} <code>/epic future {this.epic}</code>,{" "}
                  {this.translationForKey("noBranch")}
                </>
              }
            >
              {this.translationForKey("planDoc")} <code>/epic {this.epic}</code>, {this.translationForKey("branch")}{" "}
              <code>{this.branch}</code>
            </Show>
          </span>
        </li>
        <li>
          {this.icon(this.icons.folder)}
          <span>
            {this.translationForKey("worktree")}{" "}
            <Show when={this.worktree} fallback={this.translationForKey("noWorktree")}>
              <code class="path">{this.worktree}</code>
            </Show>
          </span>
        </li>
        <Show when={this.started || this.updated}>
          <li>
            {this.icon(this.icons.calendar)}
            <span>
              <Show when={this.started}>
                {this.translationForKey("started")}{" "}
                <time datetime={this.started}>{PlanDates.format(this.started)}</time>
              </Show>
              <Show when={this.started && this.updated}>, </Show>
              <Show when={this.updated}>
                {this.translationForKey("updated")}{" "}
                <time datetime={this.updated}>{PlanDates.format(this.updated)}</time>
              </Show>
            </span>
          </li>
        </Show>
        <li class="durable" hidden={!this.slots.hasContent(this.slotForName("durable"))}>
          {this.icon(this.icons.book)}
          <span>
            <b>{this.translationForKey("durable")}</b> <slot name={this.slotForName("durable")} />
          </span>
        </li>
      </ul>
    )
  }

  /** Send and Review Now:  round icon buttons, coloured by what waits (`marks`). */
  private reviewButtons(marks: () => HeaderMarks): JSX.Element {
    return (
      <span class={ACTIONS} part={this.partForName("actions")}>
        <button
          type="button"
          class={SEND}
          part={this.partForName("send")}
          data-state={marks().send}
          aria-label={this.sendWords(marks())}
          title={this.withNobody(this.sendWords(marks()), marks(), marks().send !== "idle")}
          onClick={() => void this.review.client?.send()}
        >
          {this.icon(this.icons.send)}
        </button>
        <button
          type="button"
          class={REVIEW_NOW}
          part={this.partForName("review-now")}
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
      return marks.unsent === 1
        ? this.translationForKey("sendOne")
        : this.translationForKey("sendMany", { count: marks.unsent })
    }
    return this.translationForKey(marks.send === "sent" ? "sent" : "sendIdle")
  }

  /** Review Now's words:  what Claude would work through. */
  private reviewNowWords(marks: HeaderMarks): string {
    if (!marks.waiting) return this.translationForKey("reviewNowIdle")
    return marks.waiting === 1
      ? this.translationForKey("reviewNowOne")
      : this.translationForKey("reviewNowMany", { count: marks.waiting })
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
        type="button"
        class={[REVIEW_LINE, { flash: this.isCopied, nobody: nobody() }]}
        part={this.partForName("review-line")}
        title={this.translationForKey("copyCommand")}
        onClick={() => void this.copyCommand()}
      >
        {this.icon(this.icons.copy)}
        <span>
          {this.translationForKey(nobody() ? "reviewLineNobody" : "reviewLine")} <code>{this.command()}</code>
        </span>
        <span class="done" aria-live="polite">
          {this.isCopied ? this.translationForKey("copied") : ""}
        </span>
      </button>
    )
  }

  /** `/epic <name>`:  the heading, which a click copies. */
  private headingCommand(): string {
    return `/epic ${this.epic ?? ""}`
  }

  /** `/epic review <name>`:  what the review line copies. */
  private command(): string {
    return `/epic review ${this.epic ?? ""}`
  }

  /** The git toggle:  a round icon button, pressed while every commit shows. */
  private gitToggle(): JSX.Element {
    return (
      <button
        type="button"
        class={GIT}
        part={this.partForName("git")}
        aria-pressed={this.showCommits ? "true" : "false"}
        aria-label={this.translationForKey(this.showCommits ? "hideCommits" : "showCommits")}
        title={this.translationForKey(this.showCommits ? "hideCommits" : "showCommits")}
        onClick={this.toggleCommits}
      >
        {this.icon(this.icons.git)}
      </button>
    )
  }

  /** A doc still planning:  the folded `Plan hung?` aside -- how to restart the session, and the prompt to copy. */
  private hungNotice(): JSX.Element {
    return (
      <details class={HUNG} part={this.partForName("hung")}>
        <summary>
          <span class="chevron" aria-hidden="true">
            {this.icons.chevron.svg}
          </span>
          {this.translationForKey("hung")}
        </summary>
        <div class="aside">
          <p>
            {this.translationForKey("hungBefore")} <code>/epic {this.epic}</code> {this.translationForKey("hungAfter")}
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
        part={this.partForName("notice")}
        state="info"
        size="small"
        header={this.translationForKey("futureHeader")}
      >
        <p>
          {this.translationForKey("futureBody")}{" "}
          <a href="details/analysis.html">{this.translationForKey("analysisPage")}</a>. <code>/epic {this.epic}</code>{" "}
          {this.translationForKey("futurePlan")}
        </p>
      </ui-message>
    )
  }

  /** An icon's box:  its glyph centred on the first line of what follows. */
  private icon(glyph: E.IconGlyph): JSX.Element {
    return (
      <span class={ICON} aria-hidden="true">
        {glyph.svg}
      </span>
    )
  }

  /**
   * The wrapper's inline style, for everything below:  the sticky stack below this header (`--epic-stack`);  every
   * commit shown while the toggle is on.
   */
  private pageStyle(): Record<string, string> {
    const style: Record<string, string> = { [STACK_PROPERTY]: `${this.signals.top.get()}px` }
    if (this.showCommits) style[COMMITS_PROPERTY] = "block"
    return style
  }

  ////////////////
  // ## Behaviour
  ////////////////

  /** The git toggle, clicked:  show or hide every commit, and remember it. */
  private readonly toggleCommits = () => {
    const on = !this.showCommits
    this.showCommits = on
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
    this.isCopied = false
    clearTimeout(this.flashTimer)
    requestAnimationFrame(() => (this.isCopied = true))
    this.flashTimer = window.setTimeout(() => (this.isCopied = false), FLASH_MS + 600)
  }

  /** The heading, clicked:  copy `/epic <name>`, then say so for a moment. */
  private async copyHeading() {
    if (!(await EpicPage.copyText(untrack(() => this.headingCommand())))) return
    this.isHeadingCopied = true
    clearTimeout(this.headingTimer)
    this.headingTimer = window.setTimeout(() => (this.isHeadingCopied = false), FLASH_MS + 600)
  }

  /** `translationForKey()`, as a plain function:  for the pieces drawn as their own components (`<AgentsPanel>`). */
  private readonly pageText: PageText = (key, params) => this.translationForKey(key, params)

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
   * The page-wide signals of page element `page`, made the first time anyone asks:  its blocks may connect before
   * its component exists.
   */
  static signalsOf(page: Element): PageSignals {
    let signals = EpicPage.pageSignals.get(page)
    if (!signals) {
      signals = { top: new E.Cell(0), layout: new E.Cell(0) }
      EpicPage.pageSignals.set(page, signals)
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

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicPage extends E.AttributeValues<EpicPageVocabulary> {}
