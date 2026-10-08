import { Show, createMemo, onSettled, untrack, type Accessor } from "solid-js"
import { Dynamic, isServer, type JSX } from "@solidjs/web"

import { Cell, proto, SlotContent, UIElement, UIT } from "$/ui/core"

import { NOBODY_LISTENING, ReviewClient } from "$/epics/review"
import { Chevron } from "$/epics/components/epic-item/Chevron"
import { Fold } from "$/epics/components/epic-item/Fold"
import { CLOSED_STATUSES } from "$/epics/components/epic-item/epic-item.types"

import { epicOptionVocabulary } from "./epic-option.vocabulary.en"
import { EpicChoices } from "./EpicChoices"
import {
  ACTIONS,
  BODY,
  BODY_ID,
  CARD,
  CHECK,
  CHOOSE,
  CHOSEN_CLASS,
  HEADER,
  ITEM_TAG,
  LETTER_SEPARATOR,
  ORIGINAL_TAG,
  PANEL,
  PICKED,
  RECOMMENDED,
  SENT,
  TITLE,
  TOGGLE,
  type EpicOptionVocabulary,
  type PillState
} from "./epic-choices.types"

import choicesCSS from "./epic-choices.css?inline"

/****************
 * ### `<epic-option>`
 * One option of a question:  its header (`A · A named palette (recommended)`), then its pros and cons (its light
 * children, through the default slot).
 * - Open question:  a CARD, its header a band at the top.
 * - Answered (`EpicChoices.isAnswered()`):  a PANEL in the Choices box, folded to its header, which is a button;
 *   the chosen one (`<epic-choices chosen>`) marked with a green check and green text, and open to start with.
 * - Reviewed (the page's `ReviewClient` is `reviewing`:  served by the page server, its inbox answering):  a
 *   "Choose" pill at the header's end (`pill()`) marks its letter as the item's pick through the client
 *   (`ReviewClient.choose()`);  again, un-picks it.  Picked:  the pill filled orange, `Chosen`, the card framed
 *   orange (an answered panel:  its title orange);  once sent, the pill outlined.
 *   - on an OPEN question's cards;  on an ANSWERED one's panels, but the chosen one, only while it's revisited
 *     (its note box open, a draft, a revisit or a pick):  "pick B instead, because ..."
 *   - never in an Original Discussion (`<epic-original>`):  history, not a choice
 * - SIDE EFFECT:  the first one connected makes the page's `ReviewClient` (`forPage()`), which reads the inbox
 ****************/
export class EpicOption extends UIElement<EpicOptionVocabulary> {
  @proto static vocabulary = epicOptionVocabulary
  @proto static styles = { choices: choicesCSS }
  @proto static delegatesFocus = false

  /** The page's review inbox (`ReviewClient.forPage()`), once connected;  never on the server. */
  private review: ReviewClient | undefined

  /** The id of the item it belongs to:  the mark its pick goes in.  Read once connected. */
  private itemId: string | undefined

  /** It sits in an Original Discussion:  history, never a pill.  Read once connected. */
  private inOriginal = false

  /** Its question is answered:  a panel, not a card. */
  readonly answered = new Cell(EpicChoices.isAnswered(this.host))

  /** The chosen letter, or `undefined`. */
  readonly chosenLetter = new Cell(EpicChoices.chosenFor(this.host))

  /** Its item's `status`:  a closed one's options take pills only while revisited. */
  readonly itemStatus = new Cell(EpicChoices.itemStatusFor(this.host))

  /** The page's review inbox's `version` as last seen:  bumped on every change, so `pill()` follows the inbox. */
  readonly inboxVersion = new Cell(0)

  /** Light-DOM slot occupancy:  has it pros and cons? */
  readonly slots = new SlotContent(this.host)

  /** It's the chosen option. */
  readonly chosen = createMemo(() => !!this.attrs.letter && this.chosenLetter.get() === this.attrs.letter)

  /** Answered:  its panel, open while it's the chosen one, until the reader says otherwise. */
  readonly fold = new Fold(this.chosen)

  /** A panel, open. */
  readonly isOpen = createMemo(() => this.answered.get() && this.fold.isOpen())

  /**
   * Its Choose pill, while the page is reviewed and the option takes one (see the banner);  else `undefined`.
   * - reads the client through `inboxVersion`:  the client itself isn't reactive
   */
  readonly pill = createMemo((): PillState | undefined => {
    this.inboxVersion.get()
    const client = this.review
    const id = this.itemId
    const letter = this.attrs.letter
    if (!client?.reviewing || !id || !letter || this.inOriginal) return undefined
    const mark = client.markOf(id)
    const closed = (CLOSED_STATUSES as readonly string[]).includes(this.itemStatus.get() ?? "")
    const revisiting =
      this.answered.get() &&
      (client.isBoxOpen(id) || !!client.draftOf(id) || mark?.action === "revisit" || !!mark?.pick)
    if (closed && !(revisiting && !this.chosen())) return undefined
    const picked = mark?.pick === letter
    return { picked, sent: picked && !!mark && client.isSent(mark), listening: client.listening }
  })

  protected extraClasses(): string | undefined {
    const classes = [this.answered.get() ? PANEL : CARD, this.chosen() && CHOSEN_CLASS, this.pill()?.picked && PICKED]
    return classes.filter(Boolean).join(" ")
  }

  protected hostStates() {
    return { answered: this.answered.get(), chosen: this.chosen(), open: this.isOpen(), picked: !!this.pill()?.picked }
  }

  mount(): JSX.Element {
    if (!isServer) {
      onSettled(() =>
        EpicChoices.watch(this.host, () => {
          this.answered.set(EpicChoices.isAnswered(this.host))
          this.chosenLetter.set(EpicChoices.chosenFor(this.host))
          this.itemStatus.set(EpicChoices.itemStatusFor(this.host))
        })
      )
      onSettled(() => this.followReview())
    }
    return super.mount()
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <div class={HEADER} part={this.part("header")}>
          <Dynamic
            component={this.answered.get() ? UIT.BUTTON : TEXT_TAG}
            type={this.answered.get() ? UIT.BUTTON : undefined}
            class={TOGGLE}
            part={this.part("toggle")}
            aria-expanded={this.answered.get() ? (this.isOpen() ? UIT.TRUE : UIT.FALSE) : undefined}
            aria-controls={this.answered.get() ? BODY_ID : undefined}
            onClick={this.onHeaderClick}
          >
            <Show when={this.answered.get()}>
              <Chevron />
            </Show>
            <Show when={this.chosen() && this.answered.get()}>
              <svg class={CHECK} part={this.part("check")} viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2.5 8.5l3.5 3.5 7.5-8" />
              </svg>
            </Show>
            <span class={TITLE} part={this.part("title")}>
              {this.attrs.letter}
              {LETTER_SEPARATOR}
              <slot name={this.slot("title")}>{this.attrs.title}</slot>
              <Show when={this.attrs.recommended}>
                {" "}
                <span class={RECOMMENDED} part={this.part("recommended")}>
                  {this.text("recommended")}
                </span>
              </Show>
            </span>
          </Dynamic>
          <Show when={this.pill()}>{(pill) => this.renderPill(pill)}</Show>
        </div>
        <div
          ref={this.fold.watch}
          id={BODY_ID}
          class={[BODY, { [EMPTY]: !this.slots.has("") }]}
          part={this.part("body")}
          hidden={this.answered.get() ? this.fold.hidden() : undefined}
        >
          <slot />
        </div>
      </div>
    )
  }

  /**
   * The Choose pill, at the header's end:  `Choose`, an orange outline;  picked, `Chosen`, filled;  sent, outlined
   * again.  Its tooltip says what a click does, and whether the pick has gone to Claude.
   * - `pill`:  `<Show>`'s accessor, read in each binding:  the callback's body runs once, so a value read there
   *   would never change
   */
  private renderPill(pill: Accessor<PillState>): JSX.Element {
    return (
      <span class={ACTIONS} part={this.part("actions")}>
        <button
          type={UIT.BUTTON}
          class={[CHOOSE, { [SENT]: pill().sent }]}
          part={this.part("choose")}
          aria-pressed={pill().picked ? UIT.TRUE : UIT.FALSE}
          title={this.pillTip(pill())}
          onClick={this.onChoose}
        >
          {this.text(pill().picked ? "chosen" : "choose")}
        </button>
      </span>
    )
  }

  /** The pill's tooltip:  `Pick B`;  picked, `B is picked:  click to un-pick · sent` (or `not sent yet`). */
  private pillTip(pill: PillState): string {
    const letter = this.attrs.letter ?? ""
    if (!pill.picked) return this.text("tipChoose", { letter })
    const where = this.text(pill.sent ? "tipSent" : "tipNotSent")
    const tip = `${this.text("tipChosen", { letter })} · ${where}`
    return pill.sent && !pill.listening ? `${tip}.  ${NOBODY_LISTENING}` : tip
  }

  ////////////////
  // ## Events
  ////////////////

  /** A click on its header:  folds its panel, once answered. */
  private readonly onHeaderClick = () => {
    if (untrack(this.answered.get)) this.fold.toggle()
  }

  /** A click on its Choose pill:  pick its letter, or un-pick it when it's the pick. */
  private readonly onChoose = (event: MouseEvent) => {
    // a panel's header folds on a click;  the item's line would too
    event.stopPropagation()
    const id = this.itemId
    const letter = untrack(() => this.attrs.letter)
    if (!this.review || !id || !letter) return
    const picked = !!untrack(this.pill)?.picked
    // a failed write is the client's own notice, and re-reads the inbox:  nothing to do here
    void this.review.choose(id, picked ? null : letter).catch((error: unknown) => console.error(error))
  }

  /**
   * Follow the page's review inbox:  the client made (or found), the item's id read, `inboxVersion` bumped on each of
   * its changes.  Returns the undo.
   */
  private followReview(): () => void {
    const client = ReviewClient.forPage()
    this.review = client
    this.itemId = this.host.closest(ITEM_TAG)?.id || undefined
    this.inOriginal = !!this.host.closest(ORIGINAL_TAG)
    this.inboxVersion.set(client.version)
    return client.subscribe(() => this.inboxVersion.set(client.version))
  }
}

/** The header's text box while it isn't a button:  an open question's card. */
const TEXT_TAG = "span"

/** The body's class word with no pros and cons:  not drawn. */
const EMPTY = "empty"
