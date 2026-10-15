import { For, Show, createMemo } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI } from "$/ui/core"
// Import directly:  the `$/server/site` barrel is the site header's;  this file has no imports, so the pack bundles it
import { URGENT_SELECTOR, epicStateFor, type EpicState } from "$/server/site/EpicState"

import { PlanDates } from "$/epics/dates"
import { PhaseIds } from "$/epics/phases"
import { NOBODY_LISTENING, isAirplane, isImmediate } from "$/epics/review"
// the page's view of the review inbox, as the review controls':  its file, not `epic-review`'s barrel
import { ReviewState } from "$/epics/components/epic-review/ReviewState"
// the fold and filter pieces the blocks share:  their files, not their families' barrels (which would define them here)
import { Fold, expandAllUnder, foldAllUnder } from "$/epics/components/epic-item/Fold"
import { StateFilter } from "$/epics/components/epic-section/StateFilter"
import {
  CHIP,
  CHIP_CLICK_KEYS,
  FILTER,
  FILTER_STATES,
  type StateFilterEntry
} from "$/epics/components/epic-section/EpicSection.types"

import { epicPageVocabulary } from "./EpicPage.en"
import {
  ACTIVE,
  BAR,
  COMMITS_KEY,
  COMMITS_PROPERTY,
  CRUMB_LINKS,
  CRUMBS,
  DONE,
  COPIED_TOAST_ID,
  SEE_ALSO,
  SEE_ALSO_KINDS,
  type SeeAlsoLink,
  COPIED_TOAST_MS,
  FLASH_MS,
  GIT,
  HAS_COMMITS,
  HEAD,
  HEAD_PROPERTY,
  HEADING,
  HEADING_COPY,
  HUNG,
  ICON,
  LAYOUT_ATTRIBUTES,
  META,
  NOTICE,
  OLD_CRUMBS,
  PILL,
  PROMPT,
  REVIEW_LINE,
  REVIEW_NOW,
  SEND,
  STACK_PROPERTY,
  STATUS,
  TODO,
  TOOLBAR,
  TOOLBAR_TOOLS,
  type EpicPageVocabulary,
  type HeaderMarks,
  type PageSignals,
  type PhaseLine,
  type StepLabel
} from "./EpicPage.types"

import collapseAllCSS from "$/epics/components/epic-item/CollapseAll.css?inline"
import chipsCSS from "$/epics/components/epic-section/StateChips.css?inline"
import pageCSS from "./EpicPage.css?inline"
import crumbsCSS from "./Crumbs.css?inline"
import tooltipCSS from "$/epics/components/epic-item/Tooltip.css?inline"

/****************
 * ### `EpicPage`
 * The component behind `<epic-page>`:  an epic page --
 * one epic's page, its data in attributes, its Overview and sections as children.
 * - Draws, top to bottom:
 *   - the sticky page header:  ONE line of crumbs, `DOCS / EPICS / <NAME>`, the name in their type, twice their size and bold, the h1
 *     (Owen, 2026-10-13:  "This is all redundant ... Just go with a single set of breadcrumbs")
 *     - a click on the name copies `/epic resume <name>`, and a quiet toast says so
 *     - no `DOCS / EPICS /` while the doc still holds its old `.spell-crumbs` before the page, nor narrow, 720px or
 *       less, where the side bar is too narrow for them (`Crumbs.css`)
 *     - the epic's title isn't drawn:  the name says it (the page's `<title>` and the Epics list still show it)
 *     at its right, while reviewed, Send and Review Now;  then the bedtime label, the step label (the state's icon in
 *     it) and the git toggle (Owen, 2026-10-10:  "Right items:  (=>P14) (whatever the half-filled circle is) (git
 *     icon, but bigger)";  then the state went into the step label:  "Into the pill")
 *   - the toolbar's bar, sticky again, right below the header (`--epic-head-h`):  the new item form, the toolbar
 *   - the review line, and the pill under it while it shows
 *   - the meta lines (branch, worktree, dates, the guide's link from `slot="durable"`)
 *   - a future epic's notice, then its children
 * - The step label follows the phases, in the colours of decision Q20:
 *   - the active one (outlined blue:  Claude is on it;  links to it)
 *   - else DONE (solid green) once every phase is done;  else the next one (grey)
 *   - none without phases;  FUTURE (grey:  not started) for a future epic
 *   - read from the `<epic-phase>`s below, so it follows the live update:  a `MutationObserver` bumps `layout`
 * - The epic's state (Owen, 2026-10-10, epic `airplane` P8), by the ONE rule the Epics list uses too
 *   (`$/server/site/EpicState`):  the step label's icon and colour, why under its tooltip (`part="state"`)
 *   - in progress (blue half circle), errors (red !:  every phase done, items need Owen), paused (grey pause:
 *     untouched for days)
 *   - none on a future epic or a done one:  the label is FUTURE or DONE in its own look
 *   - from the phases and items below and the doc's `updated` date, so it follows the live update too;
 *     a session listening to the review counts as running
 * - The review line under the header:  "To review this doc, type `/epic review <name>`", copied on click (it flashes)
 *   - on every epic page, as today:  it's how a review starts;  airplane mode:  `/airplane land`
 * - SEND AND REVIEW NOW (P10), at the header's right, before its labels:
 *   blue, and wearing the fill rule (Q20).
 *   - there whenever the page is reviewed (served with a token, its inbox answering:
 *     `ReviewClient`, through a `ReviewState` of its own), so they're always in the same place;
 *     grey with nothing to send
 *   - Owen, 2026-10-10:  "The send + do now icons in bottom-right is too hidden.  Move back to the page header,
 *     to the left of P11" (epic `airplane` P8 had put them in a bar stuck to the window's bottom)
 *   - Send (paper plane):
 *     a grey outline with nothing to send, dashed blue with marks not sent, outlined blue once sent
 *     - Owen's comments too (Owen, 2026-10-10, he keeps Send as the way they reach Claude):
 *       a new comment, or his reply on a thread, makes it blue;  its tooltip counts both ("2 marks, 1 comment")
 *   - Review Now (wand):  every mark sent and each revisit asked now;
 *     outlined blue while there's anything to work through
 *   - nobody listening:  their tooltips say so (`NOBODY_LISTENING`)
 *   - what a click did goes to the notice line at the window's bottom (`ReviewState`'s)
 * - THE PILL, under the review line, while marks, comments or Do Now requests wait and nobody can take them:
 *   no session listening (solid orange, a warning), or airplane mode;  a click copies the review line's command,
 *   and, out of airplane mode, starts the review in the epic's own session (`ReviewClient.startReview()`)
 *   - once a Send or Do Now WOKE the epic (epic `epic-workflow` P16), it says what the wake did instead,
 *     until a session listens:  "Typed /epic review <name> into 🚧 <name>:  press Enter there"
 * - NEW ITEMS (epic `airplane` P2):  each item section's own comment-dots button, on its title (`<epic-section>`);
 *   the page's toolbar has none since 2026-10-13
 * - THE TOOLBAR (epic `airplane` P8):  the sticky bar's last row.
 *   - edge to edge, its own rule under it and none above (Owen, 2026-10-10)
 *   - the header's and the bar's measured heights (`top`, `--epic-stack`) take it in
 *   - `slot="toolbar"`:
 *     where the docs runtime puts an epic page's section buttons (`spell-doc-runtime.js` `buildToolbar()`)
 *   - at its right, the PAGE'S STATE FILTER:  every section's chips added up,
 *     a click filtering every section at once (`StateFilter`, through each section's DOM element)
 *   - then expand-all and collapse-all, opening or folding the whole page
 * - SEE ALSO (Owen, 2026-10-13:  "There is no easy way to get to a "decisions" or "details" pages from an epic"),
 *   above its blocks:  the pages the epic made or leans on, each with its kind's icon and word, and its day
 *   - its guide;  every page in its `details/` folder (details pages, choice pages, its review page), newest
 *     first;  then every guide its epic page and parts link to (epic `epic-workflow` P13), newest first
 *   - gathered by the page server (`GET /api/epics/pages`, the tool's `SeeAlso`) as it connects, and again when a
 *     page in the epic's folder changes (`spell-server:file`):  a page made or linked a moment ago shows
 *   - none, or not served (`file://`):  no box
 *   - open, folding (a `<details>`):  short, and it's how to get to them
 * - RUNNING AGENTS (epic `skillz` P3), right before its blocks:  the "Agents running" panel (`<epic-agents>`).
 *   - only while the page is served with a token, the epic's list answers (`AgentsClient`) and an agent runs
 *   - each row a note box that redirects that agent
 *   - in the shadow root:  not a section, so the rail and counts never see it
 * - The git toggle (only when the doc lists commits) shows or hides every `<epic-commit>` below,
 *   through `--epic-commits-display`;  remembered per page (`localStorage`), as today's.
 * - The page-wide signals its blocks read (`signalsOf()`):
 *   - `layout`
 *   - `top`, where top-level titles stick:  the site header's `--spell-site-header-height`
 *     plus this header's and the toolbar bar's heights, re-measured as any of them changes size
 * - EDGE TO EDGE (P14):  its `:host` breaks out of the docs' `<main>` padding
 *   (`--spell-doc-pad-inline`, `spell-doc.css`), so the bands reach across;
 *   everything inside insets itself by `--epic-inset`.
 * - SHARED LOOK:  `EpicPage.css` declares the pack's tokens on its `:host`
 *   (`--epic-*`:  colours, bands, the inset, item state colours, the chip);  every `<epic-*>` below inherits them.
 * - SIDE EFFECT:  observes its subtree and the site header while connected;
 *   follows the page's review and agents clients.
 ****************/
export class EpicPage extends E.UIComponent<EpicPageVocabulary> {
  @E.proto static vocabulary = epicPageVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: {
      "epic-tooltip": tooltipCSS,
      "epic-page": pageCSS,
      "epic-crumbs": crumbsCSS,
      "epic-collapse-all": collapseAllCSS,
      "epic-state-chips": chipsCSS
    },
    cssStates: ["future"],
    // a container:  a click on any text in the doc must not jump to the header's first link
    // (focusing it scrolled the page to its top, and the click then missed what it was on:  I7 of `airplane`)
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** Its tag:  what its blocks look for around them. */
  static readonly TAG = epicPageVocabulary.tag

  /** The signals of each page's DOM element (`signalsOf()`). */
  private static readonly pageSignals = new WeakMap<Element, PageSignals>()

  ////////////////
  // ## State
  ////////////////

  /** Light-DOM slot occupancy:  the guide's link. */
  readonly slots = new E.SlotContent(this.domElement)

  /** Every commit shows. */
  @E.cssState("commits")
  @E.state
  accessor showCommits = EpicPage.savedCommits()

  /** The page-wide signals. */
  readonly signals = EpicPage.signalsOf(this.domElement)

  /**
   * The page's view of the review inbox:  only `reviewing()` and the client are read here
   * (it's keyed by the epic's name, never an item's:  no mark is ever the page's).
   */
  readonly review = new ReviewState(() => this.epic)

  /** The review line, just copied:  it flashes and says so. */
  @E.state accessor isCopied = false

  /** Bumped when a section's filter changes (`ui-filter`) or the sections first draw:  the toolbar's chips follow. */
  @E.state accessor filterTick = 0

  /** The sticky header's measured height, px:  where the toolbar's bar sticks, below it (`measure()`). */
  @E.state accessor headHeight = 0

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
  private flashTimer?: E.CancelablePromise<unknown>

  /** The sticky header, as drawn. */
  private header?: HTMLElement

  /** The toolbar's sticky bar under it, as drawn. */
  private bar?: HTMLElement

  ////////////////
  // ## Derived state
  ////////////////

  /** The phases below, read again on every layout change:  each numbered by its place (P15:  never by its id). */
  readonly phases = createMemo((): PhaseLine[] => {
    this.signals.layout.get()
    return Array.from(this.domElement.querySelectorAll("epic-phase"), (phase) => ({
      id: phase.id,
      label: PhaseIds.labelOf(phase),
      status: phase.getAttribute("status") ?? TODO,
      title: phase.getAttribute("title") ?? phase.querySelector(":scope > [slot=title]")?.textContent?.trim() ?? ""
    }))
  })

  /** The step label by the phases alone:  the active one, else the next, DONE (STANDING) or FUTURE;  `undefined` for none. */
  private readonly phaseStep = createMemo((): StepLabel | undefined => {
    const phases = this.phases()
    if (!phases.length) {
      return this.future ? { color: "grey", icon: "seedling", words: this.translationForKey("future") } : undefined
    }
    const active = phases.find((phase) => phase.status === ACTIVE)
    if (active) return this.phaseLabel(active, "blue", "circle half stroke", "")
    const next = phases.find((phase) => phase.status !== DONE)
    // a standing epic is never done:  it waits for the next request (epic `epic-workflow`)
    if (!next && this.standing)
      return { color: "blue", icon: "arrows rotate", words: this.translationForKey("standing") }
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
   * The kickoff prompt as typed, for the `Plan hung?` aside to copy:  the Overview's `slot="prompt"`;
   * "" without one.
   * - a paragraph per blank line, `<br>`s as line breaks
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
   * The epic's state, for the step label's icon and colour (`epicStateFor()`):  in progress, errors or paused;
   * `undefined` for a future epic or a done one, whose step label says so.
   * - running:  a session listening to the page's review (`ReviewClient.listening`);  else the `updated` date decides
   */
  readonly state = createMemo((): EpicState | undefined => {
    this.signals.layout.get()
    const phases = this.phases()
    const active = phases.find((phase) => phase.status === ACTIVE)
    const client = this.review.client
    const state = epicStateFor({
      phases: phases.map((phase) => phase.status),
      updated: this.updated,
      future: this.future,
      standing: this.standing,
      urgent: Array.from(this.domElement.querySelectorAll(URGENT_SELECTOR), (item) => item.id),
      running: this.review.reviewing() && !!client?.listening,
      active: active && `${active.label} · ${active.title}`
    })
    return state.name === "future" || state.name === "done" ? undefined : state
  })

  /**
   * The step label;  `undefined` for none.
   * - while the epic has a state (`state()`), its icon and colour are the state's, the state's why under its tooltip
   *   (Owen, 2026-10-10:  the state's own mark beside it only repeated it)
   */
  readonly step = createMemo((): StepLabel | undefined => {
    const label = this.phaseStep()
    const state = this.state()
    if (!label || !state) return label
    return {
      ...label,
      color: state.color as StepLabel["color"],
      icon: state.icon,
      tip: `${label.tip ?? label.words}\n${state.tip}`
    }
  })

  /** Where the page's marks stand, for Send and Review Now;  `undefined` while the page isn't reviewed. */
  readonly marks = createMemo((): HeaderMarks | undefined => {
    const client = this.review.client
    // tracks the client's changes:  every read below follows them
    if (!this.review.reviewing() || !client) return undefined
    const all = Object.values(client.inbox.marks)
    const unsent = client.unsentMarkCount
    const comments = client.unsentCommentCount
    return {
      send: unsent || comments ? "unsent" : all.length ? "sent" : "idle",
      unsent,
      comments,
      waiting: all.filter((mark) => !isImmediate(mark)).length,
      asked: client.inbox.now.length,
      listening: client.listening,
      woken: client.inbox.woken?.message ?? ""
    }
  })

  /**
   * Does the pill show?  Reviewed, nobody can take the work, and something waits:
   * marks or comments to send or work through, a Do Now not taken, or a wake to tell of (P16).
   */
  readonly hasPill = createMemo((): boolean => {
    const marks = this.marks()
    if (!marks || (!isAirplane() && marks.listening)) return false
    return !!(marks.unsent || marks.comments || marks.waiting || marks.asked || marks.woken)
  })

  /**
   * The toolbar's state chips:  every section's filter (`DOMEpicSectionElement.stateFilter`) added up.
   * - a state is on while every section having it shows it
   * - read again on every layout change and section filter change
   */
  readonly filterChips = createMemo((): StateFilterEntry[] => {
    this.signals.layout.get()
    void this.filterTick
    if (isServer) return []
    const totals = new Map<string, StateFilterEntry>()
    for (const section of this.filterHosts()) {
      for (const entry of section.stateFilter ?? []) {
        const total = totals.get(entry.state)
        if (total) totals.set(entry.state, { ...total, count: total.count + entry.count, on: total.on && entry.on })
        else totals.set(entry.state, { ...entry })
      }
    }
    return FILTER_STATES.flatMap((it) => totals.get(it.state) ?? [])
  })

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * While connected and drawn, watch the subtree (numbers, step label) and the headers' heights (`top`).
   * - `isReady` too:  the header must be drawn to be measured.
   * - Its own `MutationObserver`, not `@watches`:
   *   it bumps `layout`, a page-wide signal the page's blocks read too (`signalsOf()`), not a member of its own.
   * - Its own `ResizeObserver` (no decorator watches sizes), and the window's `resize`.
   */
  @E.onChange("isConnected", "isReady")
  protected watchLayout(connected: boolean, ready: boolean) {
    if (!connected || !ready) return undefined
    // oxlint-disable-next-line spell-ui/no-mutation-observer -- only while connected and drawn;  bumps a page signal
    const mutations = new MutationObserver(this.bumpLayout)
    mutations.observe(this.domElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: LAYOUT_ATTRIBUTES
    })
    const resizes = new ResizeObserver(() => this.measure())
    for (const box of [this.header, this.bar]) if (box) resizes.observe(box)
    const site = document.querySelector("spell-site-header")
    if (site) resizes.observe(site)
    const listeners = new AbortController()
    window.addEventListener("resize", this.measure, { signal: listeners.signal })
    this.measure()
    // the toolbar's chips, once the sections have drawn (`onFilter()` follows their changes after that)
    void customElements
      .whenDefined(SECTIONS)
      .then(() => Promise.all(this.filterHosts().map((section) => section.ready)))
      .then(this.bumpFilters)
    return () => {
      mutations.disconnect()
      resizes.disconnect()
      listeners.abort()
    }
  }

  /** A layout bump queued:  one per batch of mutations. */
  private isLayoutQueued = false

  /** The subtree changed:  `layout` bumped once Solid's current update is done (one bump per batch). */
  private readonly bumpLayout = () => {
    if (this.isLayoutQueued) return
    this.isLayoutQueued = true
    E.afterSolidUpdate(() => {
      this.isLayoutQueued = false
      this.signals.layout.set(this.signals.layout.get() + 1)
    })
  }

  /** A section's filter changed:  the toolbar's chips follow (`bumpFilters()`). */
  @E.on("ui-filter")
  protected onFilter() {
    this.bumpFilters()
  }

  /**
   * The toolbar's chips read again:
   * after Solid's update, so the sections' own memos (what shows) have taken the change.
   */
  private readonly bumpFilters = () =>
    E.afterSolidUpdate(() => {
      this.filterTick++
    })

  /** Follow the review inbox while connected (kept alive:  a removed page stops). */
  @E.whileConnected
  protected followReviews() {
    return this.review.connect()
  }

  ////////////////
  // ## See Also
  ////////////////

  /** The pages the epic made or leans on (`GET /api/epics/pages`), in the server's order;  none until asked. */
  @E.state accessor seeAlso: SeeAlsoLink[] = []

  /**
   * Ask for them while connected, and again when a page in the epic's folder changes:  a details page made, a part
   * linking a guide (never its inbox files, which change with every mark).
   */
  @E.whileConnected
  protected followSeeAlso() {
    if (isServer || location.protocol === "file:" || !this.epic) return undefined
    const folder = `/epics/${this.epic}/`
    void this.loadSeeAlso()
    const onFile = (event: Event) => {
      const path = (event as CustomEvent<{ path: string }>).detail?.path ?? ""
      if (path.includes(folder) && path.endsWith(".html")) void this.loadSeeAlso()
    }
    addEventListener("spell-server:file", onFile)
    return () => removeEventListener("spell-server:file", onFile)
  }

  /** Ask the page server for the epic's pages;  a server without the route, or none at all:  none. */
  @E.untracked
  private async loadSeeAlso() {
    try {
      const answer = await fetch(`/api/epics/pages?epic=${encodeURIComponent(this.epic ?? "")}`)
      if (!answer.ok) return
      const { pages } = (await answer.json()) as { pages?: SeeAlsoLink[] }
      this.seeAlso = Array.isArray(pages) ? pages : []
    } catch {
      // no page server:  no box
    }
  }

  /** The See Also box:  a folding card, each page a link with its kind and the day it last changed. */
  private seeAlsoBox(): JSX.Element {
    return (
      <details class={SEE_ALSO} part={this.partForName("see-also")} open>
        <summary>
          {this.translationForKey("seeAlso")}
          <span class="see-also-count">{this.seeAlso.length}</span>
        </summary>
        <ul>
          <For each={this.seeAlso}>
            {(page) => (
              <li data-kind={page.kind}>
                <ui-icon name={SEE_ALSO_KINDS[page.kind]?.icon ?? "circle question"} />
                <a href={page.href} target={`${this.epic}-${page.href}`}>
                  {page.title}
                </a>
                <span class="see-also-kind">
                  {this.translationForKey(SEE_ALSO_KINDS[page.kind]?.key ?? "seeAlsoDetails")}
                </span>
                <time datetime={page.updated} title={new Date(page.updated).toLocaleString()}>
                  {PlanDates.formatDate(new Date(page.updated), false)}
                </time>
              </li>
            )}
          </For>
        </ul>
      </details>
    )
  }

  render(): JSX.Element {
    return (
      // an EMPTY title:  the DOM element's `title` would otherwise be a tooltip over the whole page (T8)
      <div class={this.rootClass} part={this.partForName("base")} title="" style={this.pageStyle()}>
        <header ref={(element) => (this.header = element)} class={HEAD} part={this.partForName("header")}>
          <h1 class={HEADING} part={this.partForName("heading")}>
            <Show when={!this.hasOldCrumbs()}>{this.crumbs()}</Show>
            <button
              type="button"
              class={HEADING_COPY}
              title={this.translationForKey("copyHeading", { command: this.headingCommand() })}
              onClick={() => this.copyHeading()}
            >
              {this.epic}
            </button>
          </h1>
          <span class={STATUS} part={this.partForName("status")}>
            <Show when={this.marks()}>{(marks) => this.sendButtons(marks)}</Show>
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
                  part={this.state() ? this.partForName("state") : undefined}
                  data-state={this.state()?.name}
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
            <Show when={this.hasCommits()}>{this.gitToggle()}</Show>
          </span>
        </header>
        <div ref={(element) => (this.bar = element)} class={BAR} part={this.partForName("bar")}>
          {this.toolbar()}
        </div>
        {this.reviewLine()}
        <Show when={this.hasPill()}>{this.pill()}</Show>
        {this.metaLines()}
        <Show when={this.future}>{this.futureNotice()}</Show>
        <Show when={this.planning()}>{this.hungNotice()}</Show>
        <Show when={this.seeAlso.length}>{this.seeAlsoBox()}</Show>
        <epic-agents part={this.partForName("agents")} />
        <slot />
      </div>
    )
  }

  /**
   * The crumbs before the epic's name, in the h1:  `Docs / Epics /`, the docs' eyebrow;  the name after them is the
   * h1's own button (Owen, 2026-10-13:  "Just go with a single set of breadcrumbs").
   */
  private crumbs(): JSX.Element {
    return (
      <span class={CRUMBS} part={this.partForName("crumbs")}>
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
        </ui-breadcrumb>
        <span class="crumb-divider" aria-hidden="true">
          /
        </span>
      </span>
    )
  }

  /** The meta lines:  branch, worktree, dates, guide. */
  private metaLines(): JSX.Element {
    return (
      <ul class={META} part={this.partForName("meta")} onClick={(event) => this.copyMeta(event)}>
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

  /**
   * The sticky bar's last row, the TOOLBAR (epic `airplane` P8), in its order:
   * - the docs runtime's section buttons (`slot="toolbar"`)
   * - at the right, the page's state filter (`pageFilter()`), then expand-all and collapse-all
   * - no new item button:  each item section has its own, on its title (Owen, 2026-10-13:  "Remove "comment" icon
   *   from top header -- add it to question/todo/issue/test headers")
   */
  private toolbar(): JSX.Element {
    return (
      <div class={TOOLBAR} part={this.partForName("toolbar")}>
        <slot name={this.slotForName("toolbar")} />
        <span class={TOOLBAR_TOOLS}>
          {this.pageFilter()}
          {Fold.expandAllButton({
            label: this.translationForKey("expandAll"),
            part: this.partForName("expand-all"),
            onCollapse: () => this.expandAll()
          })}
          {Fold.collapseAllButton({
            label: this.translationForKey("collapseAll"),
            part: this.partForName("collapse-all"),
            onCollapse: () => this.collapseAll()
          })}
        </span>
      </div>
    )
  }

  /**
   * The page's state filter, in the toolbar:  a chip per state the page's items are in, with how many.
   * - solid while EVERY section showing that state shows it
   * - a click filters every section at once, by the sections' own rule (`StateFilter.nextShown()`)
   */
  private pageFilter(): JSX.Element {
    return (
      <Show when={this.filterChips().length}>
        <span
          class={FILTER}
          part={this.partForName("filter")}
          role="group"
          aria-label={this.translationForKey("filterLabel")}
        >
          <For each={this.filterChips()}>
            {(chip) => (
              <button
                type="button"
                class={CHIP}
                data-state={chip.state}
                data-color={chip.color}
                aria-pressed={chip.on ? "true" : "false"}
                aria-label={this.chipWords(chip)}
                title={this.chipWords(chip)}
                onClick={() => this.pickState(chip.state)}
              >
                {chip.count}
              </button>
            )}
          </For>
        </span>
      </Show>
    )
  }

  /** A page chip's name and tooltip:  how many, which state, what its click does. */
  private chipWords(chip: StateFilterEntry): string {
    const chips = this.filterChips()
    const present = chips.map((it) => it.state as string)
    const shown = chips.filter((it) => it.on).map((it) => it.state as string)
    const words = this.translationForKey(FILTER_STATES.find((it) => it.state === chip.state)!.words)
    const does = this.translationForKey(CHIP_CLICK_KEYS[StateFilter.clickDoes(present, shown, chip.state)])
    return this.translationForKey("chipWords", { count: chip.count, words, does })
  }

  /**
   * Send (paper plane) and Review Now (wand), at the header's right, before its labels.
   * - blue and wearing the fill rule (Q20);  grey with nothing to send or to work through
   * - a click on a grey one says so on the notice line (`ReviewClient.send()`)
   */
  private sendButtons(marks: () => HeaderMarks): JSX.Element {
    return (
      <>
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
          data-state={marks().waiting || marks().comments ? "ready" : "idle"}
          aria-label={this.reviewNowWords(marks())}
          title={this.withNobody(this.reviewNowWords(marks()), marks(), !!(marks().waiting || marks().comments))}
          onClick={() => void this.review.client?.send({ now: true })}
        >
          {this.icon(this.icons.reviewNow)}
        </button>
      </>
    )
  }

  /**
   * The pill under the review line, while work waits and nobody can take it (`hasPill()`):
   * no Claude session listening (orange), or airplane mode.
   * - what the page server's wake did, once a Send or Do Now woke the epic (epic `epic-workflow` P16):
   *   `Typed /epic review <name> into 🚧 <name>:  press Enter there`, until a session listens
   * - a click copies the review line's command (`/epic review <name>`, `/airplane land`), and, out of airplane
   *   mode, starts the review in the epic's own session (`copyCommand()`), woken or not
   */
  private pill(): JSX.Element {
    const woken = () => (isAirplane() ? "" : (this.marks()?.woken ?? ""))
    return (
      <button
        type="button"
        class={[PILL, { airplane: isAirplane(), flash: this.isCopied }]}
        part={this.partForName("pill")}
        title={this.translationForKey(isAirplane() ? "copyCommand" : "startReview")}
        onClick={() => void this.copyCommand()}
      >
        <Show
          when={woken()}
          fallback={
            <>
              {this.translationForKey(isAirplane() ? "airplanePill" : "nobodyPill")} <code>{this.command()}</code>
            </>
          }
        >
          {woken()}
        </Show>
      </button>
    )
  }

  /** Send's words:  what a click sends (`2 marks, 1 comment`), or why it sends nothing. */
  private sendWords(marks: HeaderMarks): string {
    if (marks.send === "unsent")
      return this.translationForKey("send", { what: this.countWords(marks.unsent, marks.comments) })
    return this.translationForKey(marks.send === "sent" ? "sent" : "sendIdle")
  }

  /** Review Now's words:  what Claude would work through. */
  private reviewNowWords(marks: HeaderMarks): string {
    const total = marks.waiting + marks.comments
    if (!total) return this.translationForKey("reviewNowIdle")
    const what = this.countWords(marks.waiting, marks.comments)
    return this.translationForKey(total === 1 ? "reviewNowOne" : "reviewNowMany", { what })
  }

  /** `marks` marks and `comments` comments, in words:  `2 marks, 1 comment`;  either left out at 0. */
  private countWords(marks: number, comments: number): string {
    const counted = [
      marks ? this.translationForKey(marks === 1 ? "marksOne" : "marksMany", { count: marks }) : "",
      comments ? this.translationForKey(comments === 1 ? "commentsOne" : "commentsMany", { count: comments }) : ""
    ]
    return counted.filter(Boolean).join(", ")
  }

  /** A button's tooltip:  `words`, then that nobody is reviewing when nobody listens and there's something waiting. */
  private withNobody(words: string, marks: HeaderMarks, waiting: boolean): string {
    return marks.listening || !waiting ? words : `${words}.  ${NOBODY_LISTENING}`
  }

  /**
   * The review line:  `To review this doc, type /epic review <name>` (in airplane mode `/airplane land`).
   * - a click copies the command
   * - nobody listening:  the pill under it says so (`pill()`), and copies it too
   */
  private reviewLine(): JSX.Element {
    return (
      <button
        type="button"
        class={[REVIEW_LINE, { flash: this.isCopied }]}
        part={this.partForName("review-line")}
        title={this.translationForKey("copyCommand")}
        onClick={() => void this.copyCommand()}
      >
        {this.icon(this.icons.copy)}
        <span>
          {this.translationForKey(isAirplane() ? "reviewLineAirplane" : "reviewLine")} <code>{this.command()}</code>
        </span>
        <span class="done" aria-live="polite">
          {this.isCopied ? this.translationForKey("copied") : ""}
        </span>
      </button>
    )
  }

  /** `/epic resume <name>`:  what a click on the heading's name copies. */
  private headingCommand(): string {
    return `/epic resume ${this.epic ?? ""}`
  }

  /** What the review line copies:  `/epic review <name>`, or `/airplane land` in airplane mode. */
  private command(): string {
    return isAirplane() ? AIRPLANE_LAND : `/epic review ${this.epic ?? ""}`
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
        <summary title={this.translationForKey("hungTip")}>
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
   * The wrapper's inline style, for everything below:
   * - the sticky stack below this header and its bar (`--epic-stack`)
   * - where the bar sticks (`--epic-head-h`)
   * - every commit shown while the toggle is on
   */
  private pageStyle(): Record<string, string> {
    const style: Record<string, string> = {
      [STACK_PROPERTY]: `${this.signals.top.get()}px`,
      [HEAD_PROPERTY]: `${this.headHeight}px`
    }
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

  /**
   * A toolbar chip, clicked:  every section filtered at once, by the sections' own rule (`StateFilter.nextShown()`).
   * - everything again:  each section's choice forgotten, so a state that comes later shows too
   */
  @E.untracked
  private pickState(state: string) {
    const chips = this.filterChips()
    const present = chips.map((it) => it.state as string)
    const next = StateFilter.nextShown(
      present,
      chips.filter((it) => it.on).map((it) => it.state),
      state
    )
    const states = next.length === present.length ? undefined : next
    for (const section of this.filterHosts()) if (section.stateFilter) section.showStates?.(states)
  }

  /**
   * The toolbar's collapse-all:  every block, item, card and panel on the page folded (`foldAllUnder()`),
   * then the page back at its top, where the folded blocks now all show (Owen, 2026-10-10).
   */
  @E.untracked
  private collapseAll() {
    foldAllUnder(this.domElement)
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  /** The toolbar's expand-all:  every section, phase and item on the page opened (`expandAllUnder()`). */
  @E.untracked
  private expandAll() {
    expandAllUnder(this.domElement)
  }

  /** The sections below that have a state filter (`DOMEpicSectionElement`):  the item sections. */
  private filterHosts(): FilterHost[] {
    return Array.from(this.domElement.querySelectorAll<FilterHost>(SECTIONS))
  }

  /**
   * The review line or the pill, clicked:  copy the command, then flash and say so.
   * - nobody listening, not in airplane mode:  start the review too (epic `airplane` P12):  the page server types
   *   `/epic review <name>` into the session titled for the epic, or says why it didn't (`ReviewClient.startReview()`)
   */
  @E.untracked
  private async copyCommand() {
    const client = this.review.client
    if (client && !client.listening && !isAirplane()) void client.startReview()
    if (!(await this.copyAndSay(this.command()))) return
    // off first, so a second click flashes again
    this.isCopied = false
    this.flashTimer?.cancel()
    E.beforeNextPaint(() => (this.isCopied = true))
    this.flashTimer = E.after((FLASH_MS + 600) / 1000, () => (this.isCopied = false))
  }

  /** The heading's name, clicked:  copy `/epic resume <name>`. */
  @E.untracked
  private copyHeading() {
    void this.copyAndSay(this.headingCommand())
  }

  /** A meta line's command or path (its `<code>`), clicked:  copy its text. */
  @E.untracked
  private copyMeta(event: MouseEvent) {
    const code = (event.target as Element).closest("code")
    if (code?.textContent) void this.copyAndSay(code.textContent)
  }

  /**
   * Copy `text`, and a quiet blue toast says so (Owen, 2026-10-13:  "copied toast in blue.  All file links and
   * commands should be clickable to copy the text").  True when it was copied.
   * - the docs bundle defines `<ui-toast>`;  a page without it just copies
   */
  @E.untracked
  private async copyAndSay(text: string): Promise<boolean> {
    if (!(await EpicPage.copyText(text))) return false
    if (customElements.get("ui-toast")) {
      UI.toast({
        id: COPIED_TOAST_ID,
        class: "blue",
        message: this.translationForKey("copiedText", { text }),
        position: "bottom right",
        displayTime: COPIED_TOAST_MS
      })
    }
    return true
  }

  /**
   * Measure where the toolbar's bar sticks (below this header) and where top-level titles stick:
   * the site header's height plus this header's and the bar's.
   */
  @E.untracked
  private readonly measure = () => {
    const site = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--spell-site-header-height"))
    const head = Math.round(this.header?.getBoundingClientRect().height ?? 0)
    const bar = this.bar?.getBoundingClientRect().height ?? 0
    const top = Math.round((Number.isNaN(site) ? 0 : site) + head + bar)
    if (this.headHeight !== head) this.headHeight = head
    if (this.signals.top.get() !== top) this.signals.top.set(top)
  }

  /** A phase's step label:  `P4`, its name in the tooltip, a link to it. */
  private phaseLabel(phase: PhaseLine, color: StepLabel["color"], icon: string, prefix: string): StepLabel {
    const words = phase.label
    return { color, icon, words, tip: `${prefix}${words} · ${phase.title}`, href: `#${phase.id}` }
  }

  ////////////////
  // ## Page signals
  ////////////////

  /**
   * The page-wide signals of page element `page`, made the first time anyone asks:
   * its blocks may connect before its component exists.
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
   * - the async Clipboard API first
   * - where it's refused (a webview without the permission):  the old `execCommand("copy")` from a hidden textarea,
   *   as the old page runtime's `copyText()`
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

/**
 * A section's DOM element, as the toolbar's filter reads it (`DOMEpicSectionElement`):
 * by its shape, not its class (importing `<epic-section>`'s files here would loop:  they import this one).
 */
type FilterHost = E.DOMElement & {
  readonly stateFilter?: readonly StateFilterEntry[]
  showStates?(states: readonly string[] | undefined): void
}

/** The sections, which filter their items. */
const SECTIONS = "epic-section"

/** What takes Owen's marks after a flight (epic `airplane`):  the review line's command in airplane mode. */
const AIRPLANE_LAND = "/airplane land"
