import { Show, createMemo, onSettled, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, IconGlyph, proto, SlotContent, UIElement, UIT } from "$/ui/core"

import { epicPageVocabulary } from "./epic-page.vocabulary.en"
import { EpicPageFallback } from "./epic-page.fallback"
import {
  ACTIVE,
  COMMITS_KEY,
  COMMITS_PROPERTY,
  DONE,
  GIT,
  HAS_COMMITS,
  HEAD,
  HEADING,
  HUNG,
  ICON,
  LAYOUT_ATTRIBUTES,
  META,
  NOTICE,
  PROMPT,
  STACK_PROPERTY,
  STATUS,
  TODO,
  type EpicPageVocabulary,
  type PageSignals,
  type PhaseLine,
  type StepLabel
} from "./epic-page.types"

import pageCSS from "./epic-page.css?inline"

/****************
 * ### `<epic-page>`
 * A plan doc:  one epic's page, its data in attributes, its Overview and sections as children.
 * - Draws the sticky page header (`Epic: <title>`;  at its right the `actions` part (P10's Send and Review Now),
 *   the git toggle, the bedtime label and the step label), the meta lines (branch, worktree, dates, the durable
 *   doc's link from `slot="durable"`), a future epic's notice, then its children.
 * - The step label follows the phases:  the active one (orange, links to it);  else DONE (green) once every phase
 *   is done;  else the next one (grey);  none without phases, FUTURE (violet) for a future epic.  Read from the
 *   `<epic-phase>`s below, so it follows the live update:  a `MutationObserver` bumps `layout`.
 * - The git toggle (only when the doc lists commits) shows or hides every `<epic-commit>` below, through
 *   `--epic-commits-display`;  remembered per page (`localStorage`), as today's.
 * - The page-wide signals its blocks read (`signalsOf()`):  `top`, where top-level titles stick (the site header's
 *   `--spell-site-header-height` plus this header's height, re-measured as either changes size), and `layout`.
 * - SHARED LOOK:  `epic-page.css` declares the pack's tokens (`--epic-*`:  colours, bands, the inset, item state
 *   colours, the chip) on its `:host`;  every `<epic-*>` below inherits them.
 * - SIDE EFFECT:  observes its subtree and the site header while connected.
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

  /** The meta lines' and the git toggle's icons. */
  readonly icons = {
    branch: new IconGlyph(this, () => "code branch"),
    folder: new IconGlyph(this, () => "folder"),
    calendar: new IconGlyph(this, () => "calendar"),
    book: new IconGlyph(this, () => "book"),
    git: new IconGlyph(this, () => "git"),
    chevron: new IconGlyph(this, () => "chevron right")
  }

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

  ////////////////
  // ## Element hooks
  ////////////////

  protected hostStates() {
    return { future: !!this.attrs.future, commits: this.showCommits.get() }
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Watch the subtree (numbers, step label) and the headers' heights (`top`) while connected. */
  mount(): JSX.Element {
    if (!isServer) {
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
          <span class="actions" part={this.part("actions")} />
          <Show when={this.hasCommits()}>{this.gitToggle()}</Show>
          <span class={STATUS} part={this.part("status")}>
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

  /** Is the git toggle on for this page, as last left?  `false` without storage. */
  private static savedCommits(): boolean {
    try {
      return localStorage.getItem(COMMITS_KEY + location.pathname) === "1"
    } catch {
      return false
    }
  }
}
