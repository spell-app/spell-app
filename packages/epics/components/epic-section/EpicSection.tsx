import { For, Show, createEffect, createMemo, onSettled, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, IconGlyph, proto, SlotContent, UIT } from "$/ui/core"

// the review controls, shared with `<epic-item>`:  its files, not its barrel (which would define `<epic-item>` here)
import { NoteBox, ReviewButtons, SaidNote, takeToNote } from "$/epics/components/epic-item/ReviewControls"
import { ReviewState } from "$/epics/components/epic-item/ReviewState"
import { OVERVIEW_BUTTONS, STATUS_SLOT, type ReviewTextKey } from "$/epics/components/epic-item/epic-item.types"

import { epicSectionVocabulary } from "./epic-section.vocabulary.en"
import { EpicSectionFallback } from "./epic-section.fallback"
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
  PHASE_TOGGLES,
  PHASE_TOGGLES_KEY,
  SECTION_LOOKS,
  TOGGLE,
  type ContentsEntry,
  type EpicSectionVocabulary,
  type FilterState,
  type ItemStateName,
  type PhaseToggle,
  type SectionCount,
  type SectionLook
} from "./epic-section.types"

import reviewCSS from "$/epics/components/epic-item/review-controls.css?inline"
import foldCSS from "./epic-fold.css?inline"
import sectionCSS from "./epic-section.css?inline"

/****************
 * ### `<epic-section>`
 * One section of a plan doc, by `kind`:  Phases, Questions ... Log, or one of the Overview's sub-sections.
 * - A fold (`EpicFold`):  its numbered title (`3. Questions`, by its place among the page's blocks;  `1.2 Why` for
 *   an Overview sub-section, its title its own), the kind's icon (fixed per kind:  from the vocabulary),
 *   then its children:  phases, items, log events or prose.
 * - Its COUNT (P10), on the title's badge:  `open/all` of its items (or phases), open being any status but `done`,
 *   `decided` or `canceled`;  none without any.  Counted again whenever a child comes, goes, or changes its `status`
 *   or `state` (its own `MutationObserver`:  the live update, a part loading).
 * - An item section's STATE FILTER (P10), at the title's end:  a grey filter chip, then one round chip per state
 *   its items are in, in the state's colour:  filled while that state's items show.  The grey chip flips between
 *   everything and only what needs Owen (red).  A filtered list says `3 hidden · show all` under it.  Hidden items
 *   go by a `::slotted()` rule drawn in the shadow root:  the doc's markup is never touched.  Remembered per page,
 *   under the old runtime's key (`FILTER_KEY`).
 * - The Phases section's title holds the Files / Verify toggles:  each shows or hides that field in every phase,
 *   through `--epic-files-display` / `--epic-verify-display`, which the fields read;  remembered per page.  Its
 *   Plan changes box (T14):  the `slot="changes"` copies the tool writes, above the phases;  nothing without one.
 * - An item section with no items says "None yet".
 * - An Overview sub-section is reviewed as an item is (decision Q14;  `ReviewControls.tsx`):  Make Todo, Revisit,
 *   Add Details Now in `tools` (no Approve:  Q14 asks for notes, not sign-off), its note box at the end of its body, a
 *   marked note at its top;  only while the page is reviewed.  Claude's status cards (`slot="status"`, P13) just
 *   above the note box.
 * - SIDE EFFECT:  observes its own children while connected (counted kinds only).
 ****************/
export class EpicSection extends EpicFold<EpicSectionVocabulary> {
  @proto static vocabulary = epicSectionVocabulary
  @proto static styles = { "epic-fold": foldCSS, "epic-section": sectionCSS, review: reviewCSS }
  @proto static Fallback = EpicSectionFallback

  ////////////////
  // ## State
  ////////////////

  /** Light-DOM slot occupancy:  has it children (items, phases ...)?  Plan changes? */
  readonly slots = new SlotContent(this.host)

  /** The Phases section's toggles:  which fields show. */
  readonly shown = new Cell<Record<string, boolean>>(untrack(() => EpicSection.savedToggles()))

  /** Bumped when a counted child comes, goes or changes its status or state:  the count and filter follow. */
  readonly childChanges = new Cell(0)

  /** The states the reader chose to show, as last left on this page;  `undefined`:  every state. */
  readonly chosen = new Cell<readonly string[] | undefined>(
    untrack(() => EpicSection.savedFilters()[this.attrs.id ?? ""])
  )

  /** An Overview sub-section's view of the review inbox (other kinds:  no id, never reviewed). */
  readonly reviewState = new ReviewState(() => (this.attrs.kind === "overview-part" ? this.attrs.id : undefined))

  /** An Overview sub-section's note box `<textarea>`, once drawn:  Revisit and Edit focus it. */
  private noteInput: HTMLTextAreaElement | undefined

  /** The toggles' icons, in `PHASE_TOGGLES`' order;  the filter chip's;  the Plan changes box's. */
  readonly toggleGlyphs = PHASE_TOGGLES.map((toggle) => new IconGlyph(this, () => toggle.icon))
  readonly filterGlyph = new IconGlyph(this, () => "filter")
  readonly changesGlyph = new IconGlyph(this, () => "pen to square")

  ////////////////
  // ## Derived state
  ////////////////

  /** The kind's look:  icon and title key;  `undefined` for an Overview sub-section. */
  readonly look = createMemo((): SectionLook | undefined => {
    const kind = this.attrs.kind
    return kind && kind !== "overview-part" ? SECTION_LOOKS[kind] : undefined
  })

  /** Its icon (after `look`, which it reads:  memos compute as they're made). */
  readonly glyph = new IconGlyph(this, () => this.look()?.icon)

  /** Its number, by its place:  `3` for the third block of the page;  `1.2` for the Overview's second part. */
  readonly number = createMemo(() => {
    this.layout()
    return this.connected.get() ? this.place(this.attrs.kind) : ""
  })

  /** An item section with nothing in it, and no part on its way. */
  readonly empty = createMemo(() => this.holdsItems() && !this.slots.has("") && !this.attrs.source)

  /** Its counted children (items, or phases), read again on every change to them. */
  readonly counted = createMemo((): Element[] => {
    this.childChanges.get()
    this.slots.occupied()
    if (!this.counts() || isServer) return []
    return Array.from(this.host.querySelectorAll(COUNTED))
  })

  /** Its count:  `{ open, total }`;  `undefined` for a kind that isn't counted, or with nothing to count. */
  readonly count = createMemo((): SectionCount | undefined => EpicSection.countOf(this.counted()))

  /** Each item's state, in page order (items only:  phases aren't filtered). */
  readonly itemStates = createMemo((): { item: Element; state: ItemStateName }[] =>
    this.holdsItems()
      ? this.counted()
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
    const chosen = (this.chosen.get() ?? present).filter((state) => present.includes(state))
    return new Set(chosen.length ? chosen : present)
  })

  /** Every state the section has shows. */
  readonly showingAll = createMemo(() => this.showing().size >= this.present().length)

  /** The items the filter hides. */
  readonly hidden = createMemo(() => this.itemStates().filter((it) => !this.showing().has(it.state)))

  ////////////////
  // ## Element hooks
  ////////////////

  /** The fold's states, and `tools`:  the Phases toggles, or a state filter with chips. */
  protected hostStates() {
    const tools = this.attrs.kind === "phases" || this.present().length > 0
    return { ...(super.hostStates() as Record<string, boolean>), tools } as never
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * Count its children again as they change (counted kinds);  an Overview sub-section follows the review inbox while
   * connected (kept alive:  a removed one stops).
   */
  mount(): JSX.Element {
    if (!isServer && untrack(() => this.counts())) {
      onSettled(() => {
        const bump = () => this.childChanges.set(untrack(() => this.childChanges.get()) + 1)
        const observer = new MutationObserver(bump)
        observer.observe(this.host, { childList: true, subtree: true, attributeFilter: COUNT_ATTRIBUTES })
        bump()
        return () => observer.disconnect()
      })
    }
    if (!isServer && untrack(() => this.attrs.kind) === "overview-part") {
      createEffect(
        () => this.connected.get(),
        (connected) => (connected ? this.reviewState.connect() : undefined)
      )
    }
    return super.mount()
  }

  render(): JSX.Element {
    // read once:  a section never changes its kind
    const look = untrack(this.look)
    const kind = untrack(() => this.attrs.kind)
    return this.renderFold({
      title: () => this.title(),
      icon: look ? () => this.glyph.svg() : undefined,
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
            <p class={EMPTY} part={this.part("empty")}>
              {this.text("noneYet")}
            </p>
          </Show>
          <Show when={this.hidden().length}>{this.hiddenNote()}</Show>
          {/* Claude's status cards (P13):  at the end of its body, above the note box */}
          <Show when={kind === "overview-part"}>
            <slot name={this.slot(STATUS_SLOT)} />
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
    const kind = this.host.getAttribute("kind") ?? ""
    const number = this.host.isConnected ? this.place(kind) : ""
    if (kind === "overview-part" || !(kind in SECTION_LOOKS))
      return { label: `${number} ${EpicSection.titleText(this.host)}`.trim() }
    const look = SECTION_LOOKS[kind as keyof typeof SECTION_LOOKS]
    const counted = kind === "phases" || (ITEM_KINDS as readonly string[]).includes(kind)
    const children = counted ? Array.from(this.host.querySelectorAll(COUNTED)) : []
    return { label: `${number}. ${this.text(look.title)}`, icon: look.icon, count: EpicSection.countOf(children) }
  }

  /** The title:  `3. Questions`, or an Overview sub-section's `1.2 <its title>`. */
  private title(): JSX.Element {
    const look = this.look()
    if (look) return `${this.number()}. ${this.text(look.title)}`
    return (
      <>
        <span class="number">{this.number()}</span> <slot name={this.slot("title")}>{this.attrs.title}</slot>
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
        <span class={FILTER} part={this.part("filter")} role="group" aria-label={this.text("filterLabel")}>
          <button
            type={UIT.BUTTON}
            class={CHIP}
            data-state="all"
            aria-pressed={this.showingAll() ? UIT.TRUE : UIT.FALSE}
            aria-label={this.allWords()}
            title={this.allWords()}
            onClick={this.toggleAll}
          >
            {this.filterGlyph.svg()}
          </button>
          <For each={this.present()}>
            {(state) => {
              const on = () => this.showing().has(state.state)
              const words = () => this.text(on() ? "showing" : "hiding", { words: this.text(state.words) })
              return (
                <button
                  type={UIT.BUTTON}
                  class={CHIP}
                  data-state={state.state}
                  data-color={state.color}
                  aria-pressed={on() ? UIT.TRUE : UIT.FALSE}
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
      <button type={UIT.BUTTON} class={HIDDEN_NOTE} part={this.part("hidden-note")} onClick={this.showAll}>
        {this.text("hiddenNote", { count: this.hidden().length })}
      </button>
    )
  }

  /** The grey chip's words:  what its click does. */
  private allWords(): string {
    return this.text(this.showingAll() && this.needsYou() ? "showNeeds" : "showAll")
  }

  /** Some item needs Owen (red):  the grey chip can show only those. */
  private needsYou(): boolean {
    return this.present().some((it) => it.state === "attention")
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
          const on = () => !!this.shown.get()[toggle.field]
          const label = () => this.text(on() ? toggle.hide : toggle.show)
          return (
            <button
              type={UIT.BUTTON}
              class={TOGGLE}
              aria-pressed={on() ? UIT.TRUE : UIT.FALSE}
              aria-label={label()}
              title={label()}
              onClick={() => this.flip(toggle)}
            >
              {this.toggleGlyphs[index()]!.svg()}
            </button>
          )
        }}
      </For>
    )
  }

  /** The Plan changes box (T14):  the tool's copies of each change to a phase still to do;  nothing without one. */
  private planChanges(): JSX.Element {
    return (
      <Show when={this.slots.has(this.slot("changes"))}>
        <div class={CHANGES} part={this.part("changes")}>
          <p class={CHANGES_HEAD}>
            <span class="icon" aria-hidden={UIT.TRUE}>
              {this.changesGlyph.svg()}
            </span>
            {this.text("changesTitle")}
          </p>
          <slot name={this.slot("changes")} />
        </div>
      </Show>
    )
  }

  /** The Phases section's fields to show:  each toggle's custom property, `block` while it's on. */
  protected foldStyle(): Record<string, string> | undefined {
    if (this.attrs.kind !== "phases") return undefined
    const shown = this.shown.get()
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
          part={this.part("review-buttons")}
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
          part={this.part("said")}
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
        part={this.part("note-box")}
        ref={(note) => (this.noteInput = note)}
        onEscape={() => this.leaveNote()}
        onUsed={() => this.leaveNote()}
      />
    )
  }

  /** Its id as shown:  `O1`. */
  private idLabel(): string {
    return (this.attrs.id ?? "").toUpperCase()
  }

  /** Its texts, as the review controls ask for them. */
  private readonly reviewText = (key: ReviewTextKey, params?: Record<string, string | number>) => this.text(key, params)

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
  private leaveNote() {
    if (!this.noteInput?.value.trim()) this.reviewState.client?.closeBox(untrack(this.reviewState.id), false)
  }

  ////////////////
  // ## Behaviour
  ////////////////

  /** A toggle, clicked:  show or hide its field in every phase, and remember it. */
  private flip(toggle: PhaseToggle) {
    const shown = { ...untrack(() => this.shown.get()) }
    shown[toggle.field] = !shown[toggle.field]
    this.shown.set(shown)
    EpicSection.save(PHASE_TOGGLES_KEY, shown)
  }

  /** A state chip, clicked:  its items shown or hidden, the others as they were. */
  private flipState(state: string) {
    const showing = new Set(untrack(this.showing))
    if (showing.has(state)) showing.delete(state)
    else showing.add(state)
    this.choose([...showing])
  }

  /** The grey chip, clicked:  everything showing and some item needs Owen:  only those;  else everything. */
  private readonly toggleAll = () => {
    const all = untrack(this.present).map((it) => it.state as string)
    this.choose(untrack(this.showingAll) && untrack(() => this.needsYou()) ? ["attention"] : all)
  }

  /** "Show all", under a filtered list. */
  private readonly showAll = () => {
    this.choose(untrack(this.present).map((it) => it.state))
  }

  /** The reader chose to show `states`:  shown, and remembered for this page. */
  private choose(states: string[]) {
    this.chosen.set(states)
    const id = untrack(() => this.attrs.id)
    if (!id) return
    EpicSection.save(FILTER_KEY, { ...EpicSection.savedFilters(), [id]: states })
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** A kind that holds items (Questions ... To test). */
  private holdsItems(): boolean {
    return (ITEM_KINDS as readonly string[]).includes(this.attrs.kind ?? "")
  }

  /** Its number by its place now, as `kind`:  `3`, or an Overview sub-section's `1.2`;  "" unplaced. */
  private place(kind: string | undefined): string {
    const parent = this.host.parentElement
    if (!parent) return ""
    if (kind === "overview-part") {
      const own = EpicSection.placeOf(this.host, ":scope > epic-section")
      const overview = EpicSection.placeOf(parent, ":scope > epic-overview, :scope > epic-section") || 1
      return `${overview}.${own}`
    }
    return String(EpicSection.placeOf(this.host, ":scope > epic-overview, :scope > epic-section"))
  }

  /** A kind that's counted:  items, or phases.  A method:  memos above call it as they're made. */
  private counts(): boolean {
    return this.attrs.kind === "phases" || this.holdsItems()
  }

  /** The count of `children` (items, or phases):  open being any status but `CLOSED_STATUSES`';  none without any. */
  private static countOf(children: readonly Element[]): SectionCount | undefined {
    if (!children.length) return undefined
    const open = children.filter(
      (child) => !(CLOSED_STATUSES as readonly string[]).includes(child.getAttribute("status") ?? "")
    ).length
    return { open, total: children.length }
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
