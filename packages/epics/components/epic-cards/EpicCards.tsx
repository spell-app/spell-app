import { For, Show, createMemo } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"
// Import directly:  the `$/server/site` barrel is the site header's;  these files import only each other
import { epicGroupFor } from "$/epics/list/EpicCards"
import { epicStateFor, type EpicState } from "$/epics/list/EpicState"

import { epicCardsVocabulary } from "./EpicCards.en"
import {
  CARD_GROUPS,
  EPIC_FILE,
  SAGA_EPICS_API,
  type CardsProblem,
  type SagaEpic,
  type SagaEpicsAnswer
} from "./EpicCards.types"

import cardsCSS from "./EpicCards.css?inline"

/****************
 * ### `EpicCards`
 * The component behind `<epic-cards>`:  a saga page's Epics (epic `epic-workflow` P15) --
 * a card for each epic whose page names the saga, grouped by state as on the Epics page.
 * - DRAWN FROM DATA, never a copy in the page:  the page server answers `GET /api/epics/saga?saga=<id>`
 *   (`$/epics/tool/SagaEpics`), reading every epic page's `<epic-page saga>` as it's asked
 *   - asked again whenever an epic page changes (`spell-server:file`):  an epic that joins the saga, finishes a phase
 *     or leaves shows at once
 * - each epic's state and group by the ONE rule the Epics page uses (`$/epics/list/EpicState`, `EpicCards`):
 *   Active, Planning, Urgent, Done;  an empty group isn't drawn;  by title within each
 * - each card:  the state's mark (its why the tooltip), the linked title (its epic page, in that epic's tab), the
 *   epic's summary, and a meta line:  its state, phases done of all, the phase under way
 * - no cards:  a note says why -- no epic names the saga yet, the page opened from disk, or no answer
 * - SIDE EFFECT:  asks the page server while connected, and listens for its file changes
 ****************/
export class EpicCards extends E.UIComponent<typeof epicCardsVocabulary> {
  @E.proto static vocabulary = epicCardsVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-cards": cardsCSS },
    // a list of links:  a click on a card's words must not jump to its first link
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## State
  ////////////////

  /** The epics serving the saga, as last answered;  `undefined` until the first answer. */
  @E.state accessor epics: SagaEpic[] | undefined = undefined

  /** Why no cards show, when that's known:  opened from disk, or no answer. */
  @E.state accessor problem: CardsProblem | undefined = undefined

  /** A question to the page server is on its way:  a file change meanwhile asks again once it's back. */
  private isAsking = false

  /** A file changed while asking:  ask again once the answer is in. */
  private isStale = false

  ////////////////
  // ## Derived state
  ////////////////

  /** The cards in their groups, in `CARD_GROUPS`' order, by title within each;  only groups with cards. */
  readonly groups = createMemo(() => {
    const placed = (this.epics ?? []).map((epic) => {
      const state = epicStateFor(epic.facts)
      return { epic, state, group: epicGroupFor(state) as string }
    })
    return CARD_GROUPS.map((look) => ({
      ...look,
      cards: placed
        .filter((card) => card.group === look.group)
        .sort((a, b) => a.epic.title.localeCompare(b.epic.title, undefined, { numeric: true, sensitivity: "base" }))
    })).filter((group) => group.cards.length)
  })

  /** Why the note shows instead of cards;  `undefined` while there are cards, or before the first answer. */
  readonly note = createMemo((): CardsProblem | undefined => {
    if (this.problem) return this.problem
    return this.epics && !this.epics.length ? "none" : undefined
  })

  ////////////////
  // ## Asking the page server
  ////////////////

  /** Ask while connected, and again whenever an epic page changes. */
  @E.whileConnected
  protected followEpics() {
    if (isServer) return undefined
    if (location.protocol === "file:") {
      this.problem = "file"
      return undefined
    }
    void this.load()
    const onFile = (event: Event) => {
      const path = (event as CustomEvent<{ path: string }>).detail?.path ?? ""
      if (EPIC_FILE.test(path)) void this.load()
    }
    addEventListener("spell-server:file", onFile)
    return () => removeEventListener("spell-server:file", onFile)
  }

  /**
   * Ask the page server for the saga's epics;  one question at a time, a change meanwhile asking once more.
   * - NEVER throws:  no answer is `problem: "server"`
   */
  @E.untracked
  private async load() {
    if (this.isAsking) {
      this.isStale = true
      return
    }
    this.isAsking = true
    try {
      const answer = await fetch(`${SAGA_EPICS_API}?saga=${encodeURIComponent(this.saga ?? "")}`)
      if (!answer.ok) throw new Error(`${answer.status}`)
      const { epics } = (await answer.json()) as SagaEpicsAnswer
      this.epics = Array.isArray(epics) ? epics : []
      this.problem = undefined
    } catch {
      this.problem = "server"
    } finally {
      this.isAsking = false
    }
    if (this.isStale) {
      this.isStale = false
      void this.load()
    }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div
        class={this.rootClass}
        part={this.partForName("base")}
        role="region"
        aria-label={this.translationForKey("label")}
      >
        <Show when={this.note()}>
          {(note) => (
            <p class={NOTE} part={this.partForName("note")}>
              {this.translationForKey(note(), { saga: this.saga ?? "" })}
            </p>
          )}
        </Show>
        <For each={this.groups()} keyed={(group) => group.group}>
          {(group) => (
            <section class={GROUP} part={this.partForName("group")} data-group={group().group}>
              <h3 class={GROUP_TITLE}>
                <ui-icon name={group().icon} />
                {this.translationForKey(group().title)}
                <span class={COUNT}>{group().cards.length}</span>
              </h3>
              <ul class={CARDS}>
                <For each={group().cards} keyed={(card) => card.epic.name}>
                  {(card) => this.card(card().epic, card().state)}
                </For>
              </ul>
            </section>
          )}
        </For>
      </div>
    )
  }

  /** One epic's card:  the state's mark, the linked title, its summary, then its state and phases. */
  private card(epic: SagaEpic, state: EpicState): JSX.Element {
    return (
      <li class={CARD} part={this.partForName("card")} data-epic={epic.name} data-state={state.name}>
        <div class={CARD_TITLE}>
          <span class={MARK} data-color={state.color} title={state.tip}>
            <ui-icon name={state.icon} />
          </span>
          <a href={epic.href} target={epic.name}>
            {epic.title}
          </a>
        </div>
        <Show when={epic.summary}>
          <p class={SUMMARY}>{epic.summary}</p>
        </Show>
        <p class={META}>{this.metaOf(epic, state)}</p>
      </li>
    )
  }

  /** A card's meta line:  `in progress · 6/8 phases · P8 · Review Polish`, each part only when it has something. */
  private metaOf(epic: SagaEpic, state: EpicState): string {
    const phases = state.count ? this.translationForKey("phases", { count: state.count }) : ""
    return [state.words, phases, epic.facts.active ?? ""].filter(Boolean).join(" · ")
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicCards extends E.AttributeValues<typeof epicCardsVocabulary> {}

/** Classes of what it draws. */
const NOTE = "note"
const GROUP = "group"
const GROUP_TITLE = "group-title"
const COUNT = "count"
const CARDS = "card-list"
const CARD = "card"
const CARD_TITLE = "card-title"
const MARK = "mark"
const SUMMARY = "summary"
const META = "meta"
