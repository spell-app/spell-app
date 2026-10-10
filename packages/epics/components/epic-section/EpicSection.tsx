import { For, Show, createMemo } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { NOBODY_LISTENING, SUMMARY_ID, type NewItem, type NewKind } from "$/epics/review"
// its view of the review inbox:  the file, not `epic-review`'s barrel (`index.ts` defines that family)
import { ReviewState } from "$/epics/components/epic-review/ReviewState"
import { SHOW_NOTE, type ReviewShows } from "$/epics/components/epic-review/EpicReview.types"
import { NEW_KIND_LOOKS } from "$/epics/components/epic-new-item/EpicNewItem.types"
import { NEEDS_OWEN, STATUS_SLOT, STATUS_STATES } from "$/epics/components/epic-item/EpicItem.types"
// the fold pieces every `<epic-*>` fold shares:  their files, not `epic-item`'s barrel
import { Fold } from "$/epics/components/epic-item/Fold"

import { epicSectionVocabulary } from "./EpicSection.en"
import { DOMEpicFoldElement, EpicFold } from "./EpicFold"
import { StateFilter } from "./StateFilter"
import {
  CHANGES,
  CHANGES_HEAD,
  CHIP,
  CHIP_CLICK_KEYS,
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
  type SectionLook,
  type StateFilterEntry
} from "./EpicSection.types"

import collapseAllCSS from "$/epics/components/epic-item/CollapseAll.css?inline"
import foldCSS from "./EpicFold.css?inline"
import sectionCSS from "./EpicSection.css?inline"
import chipsCSS from "./StateChips.css?inline"

/****************
 * ### `DOMEpicSectionElement`
 * The DOM element of `<epic-section>`:  a fold's (`DOMEpicFoldElement`), plus its state filter,
 * which the plan doc's toolbar reads and sets to filter every section at once (`spell-doc-runtime.js`).
 * - Above `EpicSection`:  its `elementSetup` reads it while the class is defined.
 ****************/
export class DOMEpicSectionElement extends DOMEpicFoldElement {
  /**
   * Its state filter:  each state its items are in, how many, and whether they show;  none without items.
   * Read untracked (`EpicSection.stateFilter()`):  the page follows its `ui-filter` instead.
   */
  get stateFilter(): readonly StateFilterEntry[] | undefined {
    return this.section?.stateFilter()
  }

  /** Show its items in `states` only (none:  every state), as if picked on its own chips;  remembered. */
  showStates(states: readonly string[] | undefined): void {
    this.section?.showStates(states)
  }

  /** Its component, as a section. */
  private get section(): EpicSection | undefined {
    return this.component as EpicSection | undefined
  }
}

/****************
 * ### `EpicSection`
 * The component behind `<epic-section>`:  one section of a plan doc, by `kind`:
 * Phases, Questions ... Log, or one of the Overview's sub-sections.
 * - A fold (`EpicFold`):  its numbered title, the kind's icon (fixed per kind, from the vocabulary),
 *   then its children:  phases, items, log events or prose.
 *   - the title:  `3. Questions`, by its place among the page's blocks;
 *     `1.2 Why` for an Overview sub-section, its title its own
 * - Its COUNT (P10), on the title's badge:  `open/all` of its items (or phases),
 *   open being any status but `done`, `decided` or `canceled`;  none without any.
 *   Counted again whenever a child comes, goes, or changes its `status` or `state`
 *   (`@watches`:  the live update, a part loading).
 * - An item section's STATE FILTER (P10;  chips with counts, epic `airplane` P8), at the title's end:
 *   - one chip per state its items are in, in the state's colour, with how many:
 *     solid while that state's items show, outlined while hidden
 *   - a click (Owen, 2026-10-10;  `StateFilter.nextShown()`):
 *     everything showing, only that state;  else a hidden state shows too and a shown one hides;
 *     the only one showing, everything again
 *   - a filtered list says `3 hidden · show all` under it
 *   - hidden items go by a `::slotted()` rule drawn in the shadow root:  the doc's markup is never touched
 *   - remembered per page, under the old runtime's key (`FILTER_KEY`);  `ui-filter` says it changed
 *   - the page's toolbar filters every section at once, through its DOM element (`DOMEpicSectionElement`)
 * - The Phases section's title holds the Files / Verify toggles:
 *   - each shows or hides that field in every phase,
 *     through `--epic-files-display` / `--epic-verify-display`, which the fields read
 *   - remembered per page
 * - The Phases section's Plan changes box (T14):  the `slot="changes"` copies the tool writes, above the phases;
 *   nothing without one.
 * - An item section with no items says "None yet".
 * - A REPORT (`kind="report"`, P14):  prose a run wrote for Owen to read (an overnight `/bedtime` report).
 *   - right after the Overview, on the page's section band
 *   - titled its own (`title`), never numbered, so the sections after it keep theirs
 * - An Overview sub-section is reviewed as an item is, only while the page is reviewed
 *   (decision Q14;  `<epic-review buttons="part">`):
 *   - Revisit, Make Todo, Do Now in `tools` (no Approve:  Q14 asks for notes, not sign-off)
 *   - its note box at the end of its body, a marked note at its top
 *   - Claude's status cards (`slot="status"`, P13) just above the note box
 *   - Revisit and Edit unfold it (`epic-show-note`)
 * - NEW ITEMS (epic `airplane` P2), while the page is reviewed:
 *   the Todos and Questions sections end with
 *   - the new items of their kind Owen asked for and Claude hasn't made yet (Edit, Remove:  `newItemList()`)
 *   - then a New todo / New question button, which opens the form there (`<epic-new-item>`)
 * - SIDE EFFECT:  observes its own children, from the first count on (`@watches`);
 *   follows the review inbox while connected (an Overview sub-section, Todos, Questions).
 ****************/
export class EpicSection extends EpicFold<EpicSectionVocabulary> {
  @E.proto static vocabulary = epicSectionVocabulary
  @E.protoMerged static elementSetup = {
    DOMElement: DOMEpicSectionElement,
    styleSheets: {
      "epic-fold": foldCSS,
      "epic-collapse-all": collapseAllCSS,
      "epic-state-chips": chipsCSS,
      "epic-section": sectionCSS
    }
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## State
  ////////////////

  /** Light-DOM slot occupancy:  has it children (items, phases ...)?  Plan changes? */
  readonly slots = new E.SlotContent(this.domElement)

  /** The Phases section's toggles:  which fields show. */
  @E.state accessor shown: Record<string, boolean> = EpicSection.savedToggles()

  /**
   * The states the reader chose to show, as last left on this page;  `undefined`:  every state.
   * - by the DOM element's own `id`, read plainly:  a starting value, never followed
   */
  @E.state accessor chosen: readonly string[] | undefined = EpicSection.savedFilters()[this.domElement.id]

  /**
   * Its view of the review inbox:
   * - an Overview sub-section's:  keyed by its id (is the page reviewed?  has it a marked note?)
   * - the Todos and Questions sections':  for their new items (no id:  never marked themselves)
   * - other kinds never read it
   */
  readonly reviewState = new ReviewState(() => (this.kind === "overview-part" ? this.id : undefined))

  /** The Todos or Questions section's `<epic-new-item>`, as drawn:  Edit on a waiting item opens its form on it. */
  private newItem: (HTMLElement & { open: boolean; editing?: string }) | undefined

  /** The toggles' icons, in `PHASE_TOGGLES`' order;  the Plan changes box's. */
  readonly toggleGlyphs = PHASE_TOGGLES.map((toggle) => new E.IconGlyph({ owner: this, name: () => toggle.icon }))
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
   * Its number, by its place:  `3` for the third block of the page;  `1.2` for the Overview's second part;
   * "" for a report, which isn't numbered.
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
  @E.watches({ childList: true, subtree: true, attributeFilter: COUNT_ATTRIBUTES })
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

  /** How many of its items are in each state. */
  readonly stateCounts = createMemo((): ReadonlyMap<string, number> => {
    const counts = new Map<string, number>()
    for (const { state } of this.itemStates()) counts.set(state, (counts.get(state) ?? 0) + 1)
    return counts
  })

  /**
   * The states showing:  the reader's choice, of the states there are now;  none chosen, every state.
   * - NOTE: a choice can leave none of them now (the page's toolbar showed only red, and this section has none):
   *   then every item is hidden, and `3 hidden · show all` says so
   *   (Owen, 2026-10-10:  filter "everything on the page").
   *   Before, such a choice showed everything.
   */
  readonly showing = createMemo((): ReadonlySet<string> => {
    const present = this.present().map((it) => it.state as string)
    return new Set(this.chosen ? this.chosen.filter((state) => present.includes(state)) : present)
  })

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

  /**
   * Follow the review inbox while connected (kept alive:  a removed one stops):
   * - an Overview sub-section, for its marks
   * - the Todos and Questions sections, for their new items
   */
  @E.whileConnected
  protected followReviews() {
    const follows = this.kind === "overview-part" || !!this.newKind()
    return follows ? this.reviewState.connect() : undefined
  }

  render(): JSX.Element {
    // read once:  a section never changes its kind
    // (`render()`'s body runs once, untracked:  `UIComponent.onMount()`)
    const look = this.look()
    const kind = this.kind
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
          <Show when={kind === "overview-part" && this.reviewState.reviewing()}>
            {this.reviewControl("note", "note-box")}
          </Show>
          <Show when={this.reviewState.reviewing() && this.newKind()}>{(newKind) => this.newItems(newKind())}</Show>
        </>
      )
    })
  }

  /**
   * The contents entry (`EpicFold.contentsEntry()`):
   * `3. Questions` with its kind's icon and its count, or an Overview sub-section's `1.2 <its title>`.
   * - read fresh from the page:  the count from its children now, never a memo a pending change hasn't reached yet
   *   (the live update re-reads the contents right after it patches)
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

  /** The filter's chips:  one per state its items are in, with how many, solid while they show. */
  private filter(): JSX.Element {
    return (
      <Show when={this.present().length}>
        <span
          class={FILTER}
          part={this.partForName("filter")}
          role="group"
          aria-label={this.translationForKey("filterLabel")}
        >
          <For each={this.present()}>
            {(state) => {
              const on = () => this.showing().has(state.state)
              const words = () => this.chipWords(state)
              return (
                <button
                  type="button"
                  class={CHIP}
                  data-state={state.state}
                  data-color={state.color}
                  aria-pressed={on() ? "true" : "false"}
                  aria-label={words()}
                  title={words()}
                  onClick={() => this.pickState(state.state)}
                >
                  {this.stateCounts().get(state.state) ?? 0}
                </button>
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

  /** A chip's name and tooltip:  how many, which state, and what its click does (`StateFilter.clickDoes()`). */
  private chipWords(state: FilterState): string {
    const words = this.translationForKey(state.words)
    const count = this.stateCounts().get(state.state) ?? 0
    const present = this.present().map((it) => it.state as string)
    const does = this.translationForKey(
      CHIP_CLICK_KEYS[StateFilter.clickDoes(present, [...this.showing()], state.state)]
    )
    return this.translationForKey("chipWords", { count, words, does })
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
   * - it FOLDS, like every titled box (Owen, 2026-10-08):
   *   its heading is a button with the chevron and how many changes it holds
   * - folded, the changes are hidden `until-found` (find-in-page still reaches them)
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
            {Fold.chevron()}
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

  /** The review buttons at the title's end:  Revisit, Make Todo, Do Now. */
  private reviewButtons(): JSX.Element {
    return <Show when={this.reviewState.reviewing()}>{this.reviewControl("buttons", "review-buttons")}</Show>
  }

  /** A marked note, at the top of its body. */
  private saidNote(): JSX.Element {
    return (
      <Show when={this.reviewState.reviewing() && this.reviewState.noted()}>{this.reviewControl("said", "said")}</Show>
    )
  }

  /** One of its review controls (`<epic-review>`):  what it `shows`, as its `part`. */
  private reviewControl(shows: ReviewShows, part: "review-buttons" | "note-box" | "said"): JSX.Element {
    return <epic-review of={this.id} shows={shows} buttons="part" part={this.partForName(part)} />
  }

  /** Revisit or Edit, pressed on its own review controls:  unfolded, to show the note box. */
  @E.on(SHOW_NOTE, { target: "renderRoot" })
  protected onShowNote(event: Event) {
    // its own controls' only:  a nested element's come through here too
    if ((event.target as Node).getRootNode() !== event.currentTarget) return
    event.stopPropagation()
    void this.reveal()
  }

  ////////////////
  // ## New items (the Todos and Questions sections:  epic `airplane` P2)
  ////////////////

  /**
   * At the end of the Todos or Questions section, while reviewed:
   * - the new items of its kind waiting to be made (`newItemList()`)
   * - then its New todo / New question button, or the form it opened (`<epic-new-item>`)
   */
  private newItems(kind: NewKind): JSX.Element {
    return (
      <>
        {this.newItemList(kind)}
        <epic-new-item
          ref={(element: HTMLElement) => (this.newItem = element as typeof this.newItem)}
          adds={kind}
          part={this.partForName("new-item")}
        />
      </>
    )
  }

  /**
   * The new items of one kind waiting to be made, each a card:
   * its icon, "Todo" or "Question", its title, its note, what it's about (a link), then Edit and Remove.
   * - the fill rule (decision Q20):  dashed until sent, outlined once sent
   * - its tooltip says which, and that it waits for a review while nobody is listening
   * - draws nothing while none waits
   */
  private newItemList(kind: NewKind): JSX.Element {
    const items = () => this.reviewState.newItems(kind)
    return (
      <Show when={items().length}>
        <ul class={NEW_LIST} part={this.partForName("new-list")}>
          <For each={items()} keyed={(it) => it.id}>
            {(it) => (
              <li class={NEW_CARD} data-fill={this.isSent(it()) ? "outline" : "dashed"} title={this.cardTip(it())}>
                <ui-icon name={NEW_KIND_LOOKS[it().kind].icon} />
                <span class="what">{this.translationForKey(NEW_KIND_LOOKS[it().kind].label)}</span>
                <span class="title">{it().title}</span>
                <span class="tools">
                  <button
                    type="button"
                    title={this.translationForKey("newEdit")}
                    aria-label={`${this.translationForKey("newEdit")}:  ${it().title}`}
                    onClick={() => this.editNew(it())}
                  >
                    <ui-icon name="pen" />
                  </button>
                  <button
                    type="button"
                    title={this.translationForKey("newRemove")}
                    aria-label={`${this.translationForKey("newRemove")}:  ${it().title}`}
                    onClick={() => void this.reviewState.client?.removeNew(it().id)}
                  >
                    <ui-icon name="trash can" />
                  </button>
                </span>
                <Show when={it().note}>{(note) => <p class="note">{note()}</p>}</Show>
                <Show when={it().near}>
                  {(near) => (
                    <a class="about" href={`#${near() === SUMMARY_ID ? SUMMARY_LINK : near()}`}>
                      {this.translationForKey("newAbout", {
                        id: near() === SUMMARY_ID ? near() : near().toUpperCase()
                      })}
                    </a>
                  )}
                </Show>
              </li>
            )}
          </For>
        </ul>
      </Show>
    )
  }

  /** Has waiting `item` gone with a send? */
  private isSent(item: NewItem): boolean {
    return this.reviewState.client?.isSent(item) ?? false
  }

  /** A waiting card's tooltip:  how far it got;  nobody listening, that it waits for a review. */
  private cardTip(item: NewItem): string {
    const state = this.translationForKey(this.isSent(item) ? "newSent" : "newUnsent")
    return this.reviewState.listening() ? state : `${state}.  ${NOBODY_LISTENING}`
  }

  /** Edit on a waiting card:  the section's `<epic-new-item>` opens its form on it. */
  @E.untracked
  private editNew(item: NewItem) {
    const box = this.newItem
    if (!box) return
    box.editing = item.id
    box.open = true
  }

  /** The kind of new item this section takes (`todo` in Todos, `question` in Questions);  none for any other. */
  private newKind(): NewKind | undefined {
    const kind = this.kind
    return (Object.keys(NEW_KIND_LOOKS) as NewKind[]).find((each) => NEW_KIND_LOOKS[each].section === kind)
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

  /** A state chip, clicked:  what shows next, by `StateFilter.nextShown()`'s rule. */
  @E.untracked
  private pickState(state: string) {
    const present = this.present().map((it) => it.state as string)
    const next = StateFilter.nextShown(present, [...this.showing()], state)
    this.showStates(next.length === present.length ? undefined : next)
  }

  /** "Show all", under a filtered list. */
  @E.untracked
  private readonly showAll = () => {
    this.showStates(undefined)
  }

  /**
   * Show its items in `states` only;  none:  every state, now and as new ones come.
   * - Remembered for this page;  `ui-filter` tells the page (its toolbar's chips follow).
   * - Its DOM element's `showStates()`:  the page's toolbar filters every section through it.
   */
  @E.untracked
  showStates(states: readonly string[] | undefined) {
    this.chosen = states ? [...states] : undefined
    this.send("ui-filter", { states: states ? [...states] : undefined })
    const id = this.id
    if (!id) return
    const saved: Record<string, readonly string[]> = { ...EpicSection.savedFilters() }
    if (states) saved[id] = [...states]
    else delete saved[id]
    EpicSection.save(FILTER_KEY, saved)
  }

  /**
   * Its state filter, for the page's toolbar (`DOMEpicSectionElement.stateFilter`):
   * each state its items are in, how many, and whether they show;  none without items.
   */
  @E.untracked
  stateFilter(): StateFilterEntry[] | undefined {
    const present = this.present()
    if (!present.length) return undefined
    const counts = this.stateCounts()
    const showing = this.showing()
    return present.map((it) => ({
      state: it.state,
      color: it.color,
      count: counts.get(it.state) ?? 0,
      on: showing.has(it.state)
    }))
  }

  /** Collapse-all:  the Plan changes box folds too. */
  protected foldOwnBoxes(): number {
    return this.changesFold.close() ? 1 : 0
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
   * The count of `children` (items, or phases);  none without any.
   * - `open`:  any status but `CLOSED_STATUSES`'
   * - `attention`:  the items that need Owen (`NEEDS_OWEN`:  red, or orange, his turn to pick)
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
   * An item's state, as its id chip reads it (`<epic-item>`'s `itemState`):
   * `state` when it's one of ours, else by its status
   * (`STATUS_STATES`:  decided or done `recent`, canceled `old`, else `open`).
   */
  private static stateOf(item: Element): ItemStateName {
    const state = item.getAttribute("state")
    const known = FILTER_STATES.find((it) => it.state === state)
    if (known) return known.state
    return STATUS_STATES[item.getAttribute("status") ?? ""] ?? "open"
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

/** Classes of the waiting new items (`newItemList()`):  the list, a card. */
const NEW_LIST = "new-list"
const NEW_CARD = "new-card"

/** Where a waiting item's link to the summary goes:  it has no id, so the Overview it opens. */
const SUMMARY_LINK = "overview"
