import { Show, onSettled, type Accessor } from "solid-js"
import { Dynamic, isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { NOBODY_LISTENING, ReviewClient } from "$/epics/review"
import { Chevron } from "$/epics/components/epic-item/Chevron"
import { Fold } from "$/epics/components/epic-item/Fold"
import { CLOSED_STATUSES } from "$/epics/components/epic-item/EpicItem.types"

import { epicOptionVocabulary } from "./EpicOption.en"
import { EpicChoices } from "./EpicChoices"
import { ITEM_TAG, TOGGLE } from "./EpicChoices.types"

import choicesCSS from "./EpicChoices.css?inline"

/****************
 * ### `EpicOption`
 * The component behind `<epic-option>`:  one option of a question -- its header (`A · A named palette
 * (recommended)`), then its pros and cons (its light children, through the default slot).
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
export class EpicOption extends E.UIComponent<typeof epicOptionVocabulary> {
  @E.proto static vocabulary = epicOptionVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { choices: choicesCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** The page's review inbox (`ReviewClient.forPage()`), once connected;  never on the server. */
  private review: ReviewClient | undefined

  /** The id of the item it belongs to:  the mark its pick goes in.  Read once connected. */
  private itemId: string | undefined

  /** It sits in an Original Discussion:  history, never a pill.  Read once connected. */
  private inOriginal = false

  ////////////////
  // ## The question
  ////////////////

  /** Its question is answered:  a panel, not a card. */
  @E.cssState("answered")
  @E.state
  accessor questionIsAnswered = EpicChoices.isAnswered(this.domElement)

  /** The chosen letter, or `undefined`. */
  @E.state accessor chosenLetter = EpicChoices.chosenFor(this.domElement)

  /** Its item's `status`:  a closed one's options take pills only while revisited. */
  @E.state accessor itemStatus = EpicChoices.itemStatusFor(this.domElement)

  /** It's the chosen option. */
  @E.cssState("chosen")
  get isChosen(): boolean {
    return !!this.letter && this.chosenLetter === this.letter
  }

  ////////////////
  // ## Folding
  ////////////////

  /** Answered:  its panel, open while it's the chosen one, until the reader says otherwise. */
  readonly fold = new Fold(() => this.isChosen)

  /** A panel, open. */
  @E.cssState("open")
  get isOpen(): boolean {
    return this.questionIsAnswered && this.fold.isOpen()
  }

  /** Light-DOM slot occupancy:  has it pros and cons? */
  readonly slots = new E.SlotContent(this.domElement)

  ////////////////
  // ## The Choose pill
  ////////////////

  /** The page's review inbox's `version` as last seen:  bumped on every change, so `pill` follows the inbox. */
  @E.state accessor inboxVersion = 0

  /**
   * Its Choose pill, while the page is reviewed and the option takes one (see the banner);  else `undefined`.
   * - reads the client through `inboxVersion`:  the client itself isn't reactive
   */
  get pill(): PillState | undefined {
    void this.inboxVersion
    const client = this.review
    const id = this.itemId
    const letter = this.letter
    if (!client?.reviewing || !id || !letter || this.inOriginal) return undefined
    const mark = client.markOf(id)
    const closed = (CLOSED_STATUSES as readonly string[]).includes(this.itemStatus ?? "")
    const revisiting =
      this.questionIsAnswered &&
      (client.isBoxOpen(id) || !!client.draftOf(id) || mark?.action === "revisit" || !!mark?.pick)
    if (closed && !(revisiting && !this.isChosen)) return undefined
    const picked = mark?.pick === letter
    return { picked, sent: picked && !!mark && client.isSent(mark), listening: client.listening }
  }

  /** Its letter is the item's pick, in review (P10). */
  @E.cssState("picked")
  get isPicked(): boolean {
    return !!this.pill?.picked
  }

  protected get extraClass(): string | undefined {
    const classes = [this.questionIsAnswered ? PANEL : CARD, this.isChosen && CHOSEN_CLASS, this.isPicked && PICKED]
    return classes.filter(Boolean).join(" ")
  }

  ////////////////
  // ## Rendering
  ////////////////

  onMount(): JSX.Element {
    if (!isServer) {
      onSettled(() =>
        EpicChoices.watch(this.domElement, () => {
          this.questionIsAnswered = EpicChoices.isAnswered(this.domElement)
          this.chosenLetter = EpicChoices.chosenFor(this.domElement)
          this.itemStatus = EpicChoices.itemStatusFor(this.domElement)
        })
      )
      onSettled(() => this.followReview())
    }
    return super.onMount()
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base")}>
        <div class={HEADER} part={this.partForName("header")}>
          <Dynamic
            component={this.questionIsAnswered ? "button" : "span"}
            type={this.questionIsAnswered ? "button" : undefined}
            class={TOGGLE}
            part={this.partForName("toggle")}
            aria-expanded={this.questionIsAnswered ? (this.isOpen ? "true" : "false") : undefined}
            aria-controls={this.questionIsAnswered ? BODY_ID : undefined}
            onClick={this.onHeaderClick}
          >
            <Show when={this.questionIsAnswered}>
              <Chevron />
            </Show>
            <Show when={this.isChosen && this.questionIsAnswered}>
              <svg class={CHECK} part={this.partForName("check")} viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2.5 8.5l3.5 3.5 7.5-8" />
              </svg>
            </Show>
            <span class={TITLE} part={this.partForName("title")}>
              {this.letter}
              {LETTER_SEPARATOR}
              <slot name={this.slotForName("title")}>{this.title}</slot>
              <Show when={this.recommended}>
                {" "}
                <span class={RECOMMENDED} part={this.partForName("recommended")}>
                  {this.translationForKey("recommended")}
                </span>
              </Show>
            </span>
          </Dynamic>
          <Show when={this.pill}>{(pill) => this.pillButton(pill)}</Show>
        </div>
        <div
          ref={this.fold.watch}
          id={BODY_ID}
          class={[BODY, { [EMPTY]: !this.slots.hasContent("") }]}
          part={this.partForName("body")}
          hidden={this.questionIsAnswered ? this.fold.hidden() : undefined}
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
  private pillButton(pill: Accessor<PillState>): JSX.Element {
    return (
      <span class={ACTIONS} part={this.partForName("actions")}>
        <button
          type="button"
          class={[CHOOSE, { [SENT]: pill().sent }]}
          part={this.partForName("choose")}
          aria-pressed={pill().picked ? "true" : "false"}
          title={this.pillTip(pill())}
          onClick={this.onChoose}
        >
          {this.translationForKey(pill().picked ? "chosen" : "choose")}
        </button>
      </span>
    )
  }

  /** The pill's tooltip:  `Pick B`;  picked, `B is picked:  click to un-pick · sent` (or `not sent yet`). */
  private pillTip(pill: PillState): string {
    const letter = this.letter ?? ""
    if (!pill.picked) return this.translationForKey("tipChoose", { letter })
    const where = this.translationForKey(pill.sent ? "tipSent" : "tipNotSent")
    const tip = `${this.translationForKey("tipChosen", { letter })} · ${where}`
    return pill.sent && !pill.listening ? `${tip}.  ${NOBODY_LISTENING}` : tip
  }

  ////////////////
  // ## Events
  ////////////////

  /** A click on its header:  folds its panel, once answered. */
  private readonly onHeaderClick = () => {
    if (this.questionIsAnswered) this.fold.toggle()
  }

  /** A click on its Choose pill:  pick its letter, or un-pick it when it's the pick. */
  private readonly onChoose = (event: MouseEvent) => {
    // a panel's header folds on a click;  the item's line would too
    event.stopPropagation()
    const id = this.itemId
    const letter = this.letter
    if (!this.review || !id || !letter) return
    const picked = !!this.pill?.picked
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
    this.itemId = this.domElement.closest(ITEM_TAG)?.id || undefined
    this.inOriginal = !!this.domElement.closest(ORIGINAL_TAG)
    this.inboxVersion = client.version
    return client.subscribe(() => (this.inboxVersion = client.version))
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicOption extends E.AttributeValues<typeof epicOptionVocabulary> {}

/** What an option's Choose pill shows:  is its letter the item's pick, has that gone to Claude, does anyone listen. */
export type PillState = {
  /** its letter is the item's pick */
  picked: boolean
  /** picked, and the mark carrying the pick has gone to Claude */
  sent: boolean
  /** a Claude session waits on the inbox */
  listening: boolean
}

/** An item's Original Discussion:  history, not a choice, so its options never take a Choose pill. */
const ORIGINAL_TAG = "epic-original"

/** Class names inside the shadow root. */
const HEADER = "header"
const CHECK = "check"
const TITLE = "title"
const RECOMMENDED = "recommended"
const ACTIONS = "actions"
const CHOOSE = "choose"
const BODY = "body"

/** Class words on the box:  answered (a panel, not a card), chosen, picked in review (P10). */
const PANEL = "panel"
const CARD = "card"
const CHOSEN_CLASS = "chosen"
const PICKED = "picked"

/** Class word on a picked pill whose mark has gone to Claude:  outlined, not filled. */
const SENT = "sent"

/** The body's class word with no pros and cons:  not drawn. */
const EMPTY = "empty"

/** `id` of its body, for its header's `aria-controls`. */
const BODY_ID = "body"

/** Between an option's letter and its title:  `A · A named palette`. */
const LETTER_SEPARATOR = " · "
