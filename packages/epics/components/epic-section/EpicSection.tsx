import { For, Show, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

// the review controls, shared with `<epic-item>`:  its files, not its barrel (which would define `<epic-item>` here)
import { NoteBox, ReviewButtons, SaidNote, takeToNote } from "$/epics/components/epic-item/ReviewControls"
import { ReviewState } from "$/epics/components/epic-item/ReviewState"
import {
  NEEDS_OWEN,
  OVERVIEW_BUTTONS,
  STATUS_SLOT,
  type ReviewTextKey
} from "$/epics/components/epic-item/EpicItem.types"
// the fold pieces every `<epic-*>` fold shares:  their files, not `epic-item`'s barrel
import { Chevron } from "$/epics/components/epic-item/Chevron"
import { Fold } from "$/epics/components/epic-item/Fold"

import { epicSectionVocabulary } from "./EpicSection.en"
import { EpicFold } from "./EpicFold"
import {
  CHANGES,
  CHANGES_HEAD,
  CHIP,
  CLOSED_STATUSES,
  COUNT_ATTRIBUTES,
  COUNTED,
  EMPTY,
  FILTER,
  FILTER_KEY,
  FILTER_STATES,
  HIDDEN_NOTE,
  ITEM_KINDS,
  NUMBERED_BLOCKS,
  PHASE_TOGGLES,
  PHASE_TOGGLES_KEY,
  REPORT,
  SECTION_LOOKS,
  TOGGLE,
  type ContentsEntry,
  type EpicSectionVocabulary,
  type FilterState,
  type ItemStateName,
  type PhaseToggle,
  type SectionCount,
  type SectionLook
} from "./EpicSection.types"

import reviewCSS from "$/epics/components/epic-item/ReviewControls.css?inline"
import foldCSS from "./EpicFold.css?inline"
import sectionCSS from "./EpicSection.css?inline"

/****************
 * ### `EpicSection`
 * The component behind `<epic-section>`:  one section of a plan doc, by `kind`:  Phases, Questions ... Log, or one of the Overview's sub-sections.
 * - A fold (`EpicFold`):  its numbered title (`3. Questions`, by its place among the page's blocks;  `1.2 Why` for
 *   an Overview sub-section, its title its own), the kind's icon (fixed per kind:  from the vocabulary),
 *   then its children:  phases, items, log events or prose.
 * - Its COUNT (P10), on the title's badge:  `open/all` of its items (or phases), open being any status but `done`,
 *   `decided` or `canceled`;  none without any.  Counted again whenever a child comes, goes, or changes its `status`
 *   or `state` (`@fromContent`:  the live update, a part loading).
 * - An item section's STATE FILTER (P10), at the title's end:  a grey filter chip, then one round chip per state
 *   its items are in, in the state's colour:  filled while that state's items show.  The grey chip flips between
 *   everything and only what needs Owen (red).  A filtered list says `3 hidden · show all` under it.  Hidden items
 *   go by a `::slotted()` rule drawn in the shadow root:  the doc's markup is never touched.  Remembered per page,
 *   under the old runtime's key (`FILTER_KEY`).
 * - The Phases section's title holds the Files / Verify toggles:  each shows or hides that field in every phase,
 *   through `--epic-files-display` / `--epic-verify-display`, which the fields read;  remembered per page.  Its
 *   Plan changes box (T14):  the `slot="changes"` copies the tool writes, above the phases;  nothing without one.
 * - An item section with no items says "None yet".
 * - A REPORT (`kind="report"`, P14):  prose a run wrote for Owen to read (an overnight `/bedtime` report), right after
 *   the Overview, on the page's section band;  titled its own (`title`), never numbered, so the sections after it
 *   keep theirs.
 * - An Overview sub-section is reviewed as an item is (decision Q14;  `ReviewControls.tsx`):  Make Todo, Revisit,
 *   Add Details Now in `tools` (no Approve:  Q14 asks for notes, not sign-off), its note box at the end of its body, a
 *   marked note at its top;  only while the page is reviewed.  Claude's status cards (`slot="status"`, P13) just
 *   above the note box.
 * - SIDE EFFECT:  observes its own children, from the first count on (`@fromContent`).
 ****************/
export class EpicSection extends EpicFold<EpicSectionVocabulary> {
  @E.proto static vocabulary = epicSectionVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-fold": foldCSS, "epic-section": sectionCSS, review: reviewCSS }
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## State
  ////////////////

  /** Light-DOM slot occupancy:  has it children (items, phases ...)?  Plan changes? */
  readonly slots = new E.SlotContent(this.domElement)

  /** The Phases section's toggles:  which fields show. */
  @E.state accessor shown: Record<string, boolean> = EpicSection.savedToggles()

  /** The states the reader chose to show, as last left on this page;  `undefined`:  every state. */
  @E.state accessor chosen: readonly string[] | undefined = EpicSection.savedFilters()[untrack(() => this.id) ?? ""]

  /** An Overview sub-section's view of the review inbox (other kinds:  no id, never reviewed). */
  readonly reviewState = new ReviewState(() => (this.kind === "overview-part" ? this.id : undefined))

  /** An Overview sub-section's note box `<textarea>`, once drawn:  Revisit and Edit focus it. */
  private noteInput: HTMLTextAreaElement | undefined

  /** The toggles' icons, in `PHASE_TOGGLES`' order;  the filter chip's;  the Plan changes box's. */
  readonly toggleGlyphs = PHASE_TOGGLES.map((toggle) => new E.IconGlyph({ owner: this, name: () => toggle.icon }))
  readonly filterGlyph = new E.IconGlyph({ owner: this, name: () => "filter" })
  readonly changesGlyph = new E.IconGlyph({ owner: this, name: () => "pen to square" })

  /** The Plan changes box's fold:  every titled box folds (Owen, 2026-10-08);  folded to start, as every section. */
  readonly changesFold = new Fold(() => false)

  ////////////////
  // ## Derived state
  ////////////////

  /** The kind's look:  icon and title key;  `undefined` for an Overview sub-section or a report (titled their own). */
  readonly look = createMemo((): SectionLook | undefined => {
    const kind = this.kind
    return kind && kind in SECTION_LOOKS ? SECTION_LOOKS[kind as keyof typeof SECTION_LOOKS] : undefined
  })

  /** Its icon (after `look`, which it reads:  memos compute as they're made). */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => this.look()?.icon })

  /**
   * Its number, by its place:  `3` for the third block of the page;  `1.2` for the Overview's second part;  "" for a
   * report, which isn't numbered.
   */
  readonly number = createMemo(() => {
    void this.layout
    return this.isConnected ? this.place(this.kind) : ""
  })

  /** An item section with nothing in it, and no part on its way. */
  readonly empty = createMemo(() => this.holdsItems() && !this.slots.hasContent("") && !this.source)

  /**
   * Its counted children (items, or phases), read again whenever a child comes, goes or changes its status or state:
   * the count and filter follow.
   * - A NEW list on every change, so the count reads the children's `status` again.
   */
  @E.fromContent({ childList: true, subtree: true, attributeFilter: COUNT_ATTRIBUTES })
  get counted(): readonly Element[] {
    void this.slots.filledSlots
    if (!this.counts() || isServer) return NOTHING_COUNTED
    return Array.from(this.domElement.querySelectorAll(COUNTED))
  }

  /** Its count:  `{ open, total }`;  `undefined` for a kind that isn't counted, or with nothing to count. */
  readonly count = createMemo((): SectionCount | undefined => EpicSection.countOf(this.counted))

  /** Each item's state, in page order (items only:  phases aren't filtered). */
  readonly itemStates = createMemo((): { item: Element; state: ItemStateName }[] =>
    this.holdsItems()
      ? this.counted
          .filter((child) => child.localName === "epic-item")
          .map((item) => ({ item, state: EpicSection.stateOf(item) }))
      : []
  )

  /** The states its items are in, in the filter's order:  its state chips. */
  readonly present = createMemo((): FilterState[] => {
    const states = new Set(this.itemStates().map((it) => it.state))
    return FILTER_STATES.filter((it) => states.has(it.state))
  })

  /**
   * The states showing:  the reader's choice, of the states there are now;  every state when that leaves none (the
   * old runtime's rule:  a remembered filter never hides a whole list).
   */
  readonly showing = createMemo((): ReadonlySet<string> => {
    const present = this.present().map((it) => it.state as string)
    const chosen = (this.chosen ?? present).filter((state) => present.includes(state))
    return new Set(chosen.length ? chosen : present)
  })

  /** Every state the section has shows. */
  readonly showingAll = createMemo(() => this.showing().size >= this.present().length)

  /** The items the filter hides. */
  readonly hidden = createMemo(() => this.itemStates().filter((it) => !this.showing().has(it.state)))

  ////////////////
  // ## Element hooks
  ////////////////

  /** Its title has tools:  the Phases toggles, or a state filter with chips. */
  @E.cssState("tools")
  get hasTools(): boolean {
    return this.kind === "phases" || this.present().length > 0
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** An Overview sub-section follows the review inbox while connected (kept alive:  a removed one stops). */
  @E.whileConnected
  protected followReviews() {
    return untrack(() => this.kind) === "overview-part" ? this.reviewState.connect() : undefined
  }

  render(): JSX.Element {
    // read once:  a section never changes its kind
    const look = untrack(this.look)
    const kind = untrack(() => this.kind)
    return this.renderFold({
      title: () => this.heading(),
      icon: look ? () => this.glyph.svg : undefined,
      badge: () => {
        const count = this.count()
        return count ? `${count.open}/${count.total}` : undefined
      },
      tools:
        kind === "phases"
          ? () => this.toggles()
          : kind === "overview-part"
            ? () => this.reviewButtons()
            : this.holdsItems()
              ? () => this.filter()
              : undefined,
      before:
        kind === "overview-part" ? () => this.saidNote() : kind === "phases" ? () => this.planChanges() : undefined,
      after: () => (
        <>
          <Show when={this.empty()}>
            <p class={EMPTY} part={this.partForName("empty")}>
              {this.translationForKey("noneYet")}
            </p>
          </Show>
          <Show when={this.hidden().length}>{this.hiddenNote()}</Show>
          {/* Claude's status cards (P13):  at the end of its body, above the note box */}
          <Show when={kind === "overview-part"}>
            <slot name={this.slotForName(STATUS_SLOT)} />
          </Show>
          <Show when={kind === "overview-part" && this.reviewState.reviewing()}>{this.noteBox()}</Show>
        </>
      )
    })
  }

  /**
   * The contents entry (`EpicFold.contentsEntry()`):  `3. Questions` with its kind's icon and its count, or an
   * Overview sub-section's `1.2 <its title>`.  Read fresh from the page:  the count from its children now, never
   * a memo a pending change hasn't reached yet (the live update re-reads the contents right after it patches).
   */
  contentsEntry(): ContentsEntry {
    const kind = this.domElement.getAttribute("kind") ?? ""
    const number = this.domElement.isConnected ? this.place(kind) : ""
    if (kind === "overview-part" || !(kind in SECTION_LOOKS))
      return { label: `${number} ${EpicSection.titleText(this.domElement)}`.trim() }
    const look = SECTION_LOOKS[kind as keyof typeof SECTION_LOOKS]
    const counted = kind === "phases" || (ITEM_KINDS as readonly string[]).includes(kind)
    const children = counted ? Array.from(this.domElement.querySelectorAll(COUNTED)) : []
    return {
      label: `${number}. ${this.translationForKey(look.title)}`,
      icon: look.icon,
      count: EpicSection.countOf(children)
    }
  }

  /** The title:  `3. Questions`, an Overview sub-section's `1.2 <its title>`, or a report's own. */
  private heading(): JSX.Element {
    const look = this.look()
    if (look) return `${this.number()}. ${this.translationForKey(look.title)}`
    return (
      <>
        <Show when={this.number()}>
          <span class="number">{this.number()}</span>{" "}
        </Show>
        <slot name={this.slotForName("title")}>{this.title}</slot>
      </>
    )
  }

  ////////////////
  // ## The state filter
  ////////////////

  /** The filter's chips:  the grey filter chip, then one per state its items are in. */
  private filter(): JSX.Element {
    return (
      <Show when={this.present().length}>
        <span
          class={FILTER}
          part={this.partForName("filter")}
          role="group"
          aria-label={this.translationForKey("filterLabel")}
        >
          <button
            type="button"
            class={CHIP}
            data-state="all"
            aria-pressed={this.showingAll() ? "true" : "false"}
            aria-label={this.allWords()}
            title={this.allWords()}
            onClick={this.toggleAll}
          >
            {this.filterGlyph.svg}
          </button>
          <For each={this.present()}>
            {(state) => {
              const on = () => this.showing().has(state.state)
              const words = () =>
                this.translationForKey(on() ? "showing" : "hiding", { words: this.translationForKey(state.words) })
              return (
                <button
                  type="button"
                  class={CHIP}
                  data-state={state.state}
                  data-color={state.color}
                  aria-pressed={on() ? "true" : "false"}
                  aria-label={words()}
                  title={words()}
                  onClick={() => this.flipState(state.state)}
                />
              )
            }}
          </For>
          {/* the hidden items, by id:  nothing in the doc changes */}
          <style>{this.hiddenRules()}</style>
        </span>
      </Show>
    )
  }

  /** Under a filtered list:  `3 hidden · show all`;  a click shows everything. */
  private hiddenNote(): JSX.Element {
    return (
      <button type="button" class={HIDDEN_NOTE} part={this.partForName("hidden-note")} onClick={this.showAll}>
        {this.translationForKey("hiddenNote", { count: this.hidden().length })}
      </button>
    )
  }

  /** The grey chip's words:  what its click does. */
  private allWords(): string {
    return this.translationForKey(this.showingAll() && this.needsYou() ? "showNeeds" : "showAll")
  }

  /** Some item needs Owen (`NEEDS_OWEN`:  red, or orange, his turn to pick):  the grey chip can show only those. */
  private needsYou(): boolean {
    return this.present().some((it) => NEEDS_OWEN.has(it.state))
  }

  /** The rule hiding the filtered-out items:  `::slotted(#q3, ...)`;  `""` with none. */
  private hiddenRules(): string {
    const hidden = this.hidden()
    if (!hidden.length || isServer) return ""
    const selectors = hidden.map((it) => `::slotted(#${CSS.escape(it.item.id)})`)
    return `${selectors.join(", ")} { display: none; }`
  }

  ////////////////
  // ## The Phases section
  ////////////////

  /** The Phases title's toggles:  bare icons, the accent while pressed. */
  private toggles(): JSX.Element {
    return (
      <For each={PHASE_TOGGLES}>
        {(toggle, index) => {
          const on = () => !!this.shown[toggle.field]
          const label = () => this.translationForKey(on() ? toggle.hide : toggle.show)
          return (
            <button
              type="button"
              class={TOGGLE}
              aria-pressed={on() ? "true" : "false"}
              aria-label={label()}
              title={label()}
              onClick={() => this.flip(toggle)}
            >
              {this.toggleGlyphs[index()]!.svg}
            </button>
          )
        }}
      </For>
    )
  }

  /**
   * The Plan changes box (T14):  the tool's copies of each change to a phase still to do;  nothing without one.
   * - it FOLDS, like every titled box (Owen, 2026-10-08):  its heading is a button with the chevron and how many
   *   changes it holds;  folded, the changes are hidden `until-found` (find-in-page still reaches them)
   */
  private planChanges(): JSX.Element {
    const slot = this.slotForName("changes")
    const count = () =>
      this.slots.hasContent(slot) ? this.domElement.querySelectorAll(`:scope > [slot="${slot}"]`).length : 0
    return (
      <Show when={this.slots.hasContent(slot)}>
        <div class={CHANGES} part={this.partForName("changes")}>
          <button
            type="button"
            class={CHANGES_HEAD}
            aria-expanded={this.changesFold.isOpen() ? "true" : "false"}
            aria-controls={CHANGES_BODY}
            onClick={this.changesFold.toggle}
          >
            <Chevron />
            <span class="icon" aria-hidden="true">
              {this.changesGlyph.svg}
            </span>
            {this.translationForKey("changesTitle")}
            <span class="count">{count()}</span>
          </button>
          <div ref={this.changesFold.watch} id={CHANGES_BODY} class="changes-body" hidden={this.changesFold.hidden()}>
            <slot name={slot} />
          </div>
        </div>
      </Show>
    )
  }

  /** The Phases section's fields to show:  each toggle's custom property, `block` while it's on. */
  protected foldStyle(): Record<string, string> | undefined {
    if (this.kind !== "phases") return undefined
    const shown = this.shown
    const style: Record<string, string> = {}
    for (const toggle of PHASE_TOGGLES) if (shown[toggle.field]) style[toggle.property] = "block"
    return style
  }

  ////////////////
  // ## Review (an Overview sub-section)
  ////////////////

  /** The review buttons at the title's end:  Make Todo, Revisit, Add Details Now. */
  private reviewButtons(): JSX.Element {
    return (
      <Show when={this.reviewState.reviewing()}>
        <ReviewButtons
          review={this.reviewState}
          text={this.reviewText}
          label={this.idLabel()}
          buttons={OVERVIEW_BUTTONS}
          part={this.partForName("review-buttons")}
          onOpenBox={() => this.takeToNote()}
        />
      </Show>
    )
  }

  /** A marked note, at the top of its body. */
  private saidNote(): JSX.Element {
    return (
      <Show when={this.reviewState.reviewing()}>
        <SaidNote
          review={this.reviewState}
          text={this.reviewText}
          part={this.partForName("said")}
          onEdit={() => this.takeToNote(this.reviewState.mark()?.note)}
        />
      </Show>
    )
  }

  /** The note box, at the end of its body. */
  private noteBox(): JSX.Element {
    return (
      <NoteBox
        review={this.reviewState}
        text={this.reviewText}
        label={this.idLabel()}
        part={this.partForName("note-box")}
        ref={(note) => (this.noteInput = note)}
        onEscape={() => this.leaveNote()}
        onUsed={() => this.leaveNote()}
      />
    )
  }

  /** Its id as shown:  `O1`. */
  private idLabel(): string {
    return (this.id ?? "").toUpperCase()
  }

  /** Its texts, as the review controls ask for them. */
  private readonly reviewText = (key: ReviewTextKey, params?: Record<string, string | number>) =>
    this.translationForKey(key, params)

  /** Take the reader to its note box (Revisit;  Edit, with the marked `note`):  unfolded first. */
  private takeToNote(note?: string) {
    takeToNote(
      this.reviewState,
      () => void this.reveal(),
      () => this.noteInput,
      note
    )
  }

  /** Done with the note box:  it stays, but stops counting as written in once it's empty. */
  @E.untracked
  private leaveNote() {
    if (!this.noteInput?.value.trim()) this.reviewState.client?.closeBox(this.reviewState.id(), false)
  }

  ////////////////
  // ## Behaviour
  ////////////////

  /** A toggle, clicked:  show or hide its field in every phase, and remember it. */
  @E.untracked
  private flip(toggle: PhaseToggle) {
    const shown = { ...this.shown }
    shown[toggle.field] = !shown[toggle.field]
    this.shown = shown
    EpicSection.save(PHASE_TOGGLES_KEY, shown)
  }

  /** A state chip, clicked:  its items shown or hidden, the others as they were. */
  @E.untracked
  private flipState(state: string) {
    const showing = new Set(this.showing())
    if (showing.has(state)) showing.delete(state)
    else showing.add(state)
    this.choose([...showing])
  }

  /** The grey chip, clicked:  everything showing and some item needs Owen:  only those;  else everything. */
  @E.untracked
  private readonly toggleAll = () => {
    const all = this.present().map((it) => it.state as string)
    this.choose(this.showingAll() && this.needsYou() ? all.filter((state) => NEEDS_OWEN.has(state)) : all)
  }

  /** "Show all", under a filtered list. */
  @E.untracked
  private readonly showAll = () => {
    this.choose(this.present().map((it) => it.state))
  }

  /** The reader chose to show `states`:  shown, and remembered for this page. */
  @E.untracked
  private choose(states: string[]) {
    this.chosen = states
    const id = this.id
    if (!id) return
    EpicSection.save(FILTER_KEY, { ...EpicSection.savedFilters(), [id]: states })
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** A kind that holds items (Questions ... To test). */
  private holdsItems(): boolean {
    return (ITEM_KINDS as readonly string[]).includes(this.kind ?? "")
  }

  /** Its number by its place now, as `kind`:  `3`, or an Overview sub-section's `1.2`;  "" unplaced, or a report. */
  private place(kind: string | undefined): string {
    const parent = this.domElement.parentElement
    if (!parent || kind === REPORT) return ""
    if (kind === "overview-part") {
      const own = EpicSection.placeOf(this.domElement, ":scope > epic-section")
      const overview = EpicSection.placeOf(parent, NUMBERED_BLOCKS) || 1
      return `${overview}.${own}`
    }
    return String(EpicSection.placeOf(this.domElement, NUMBERED_BLOCKS))
  }

  /** A kind that's counted:  items, or phases.  A method:  memos above call it as they're made. */
  private counts(): boolean {
    return this.kind === "phases" || this.holdsItems()
  }

  /**
   * The count of `children` (items, or phases):  open being any status but `CLOSED_STATUSES`',  `attention` the items
   * that need Owen (`NEEDS_OWEN`:  red, or orange, his turn to pick);  none without any.
   */
  private static countOf(children: readonly Element[]): SectionCount | undefined {
    if (!children.length) return undefined
    const open = children.filter(
      (child) => !(CLOSED_STATUSES as readonly string[]).includes(child.getAttribute("status") ?? "")
    ).length
    const attention = children.filter((child) => NEEDS_OWEN.has(child.getAttribute("state") ?? "")).length
    return { open, total: children.length, attention }
  }

  /** `element`'s place, from 1, among its parent's children matching `selector`;  0 when it isn't one. */
  private static placeOf(element: Element, selector: string): number {
    const siblings = Array.from(element.parentElement?.querySelectorAll(selector) ?? [])
    return siblings.indexOf(element) + 1
  }

  /**
   * An item's state, as its id chip reads it (`<epic-item>`'s `itemState`):  `state` when it's one of ours, else
   * `old` once closed, `open` before.
   */
  private static stateOf(item: Element): ItemStateName {
    const state = item.getAttribute("state")
    const known = FILTER_STATES.find((it) => it.state === state)
    if (known) return known.state
    return (CLOSED_STATUSES as readonly string[]).includes(item.getAttribute("status") ?? "") ? "old" : "open"
  }

  /** The Phases toggles as last left on this page;  none without storage. */
  private static savedToggles(): Record<string, boolean> {
    return EpicSection.saved(PHASE_TOGGLES_KEY) as Record<string, boolean>
  }

  /** The state filters as last left on this page, by section id;  none without storage. */
  private static savedFilters(): Record<string, readonly string[]> {
    const saved = EpicSection.saved(FILTER_KEY)
    const filters: Record<string, readonly string[]> = {}
    for (const [id, states] of Object.entries(saved)) if (Array.isArray(states)) filters[id] = states as string[]
    return filters
  }

  /** This page's JSON under `prefix`;  `{}` without storage, or for bad JSON. */
  private static saved(prefix: string): Record<string, unknown> {
    try {
      const value = JSON.parse(localStorage.getItem(prefix + location.pathname) ?? "{}") as unknown
      return value && typeof value === "object" ? (value as Record<string, unknown>) : {}
    } catch {
      return {}
    }
  }

  /** Keep `value` for this page under `prefix`;  a browser that blocks storage just doesn't remember. */
  private static save(prefix: string, value: object) {
    try {
      localStorage.setItem(prefix + location.pathname, JSON.stringify(value))
    } catch {
      // private mode:  the choice lasts the visit
    }
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicSection extends E.AttributeValues<EpicSectionVocabulary> {}

/** No counted children:  a kind that isn't counted, or a server render.  One list, so a recount keeps it. */
const NOTHING_COUNTED: readonly Element[] = []

/** `id` of the Plan changes box's body, which its heading controls. */
const CHANGES_BODY = "changes-body"
