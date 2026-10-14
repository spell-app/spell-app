import { Show, type Accessor } from "solid-js"
import { Dynamic, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { NOBODY_LISTENING, ReviewClient, picks } from "$/epics/review"
// Import directly:  the question's class, not its barrel (which would define `<epic-ask>` here)
import { EpicAsk } from "$/epics/components/epic-ask/EpicAsk"
import { Fold } from "$/epics/components/epic-item/Fold"
import type { EpicItem } from "$/epics/components/epic-item/EpicItem"
// an answering option's comment box:  its barrel first, so it's defined wherever the option is
import "$/epics/components/epic-text-box"
import { CLOSED_STATUSES } from "$/epics/components/epic-item/EpicItem.types"

import { epicOptionVocabulary } from "./EpicOption.en"
import { EpicChoices } from "./EpicChoices"
import { ITEM_TAG, ORIGINAL_TAG, TOGGLE, type CardSet } from "./EpicChoices.types"

import choicesCSS from "./EpicChoices.css?inline"
import tooltipCSS from "$/epics/components/epic-item/Tooltip.css?inline"

/****************
 * ### `EpicOption`
 * The component behind `<epic-option>`:  one option of a question.
 * - its header:  `A · A named palette`
 *   - a violet thumbs-up after the recommended one's title, no word (Owen, 2026-10-08)
 * - then its pros and cons:  its light children, through the default slot
 *
 * - Open question:  a CARD, its header a band at the top, open to start with.
 *   - the header is a button that folds its pros and cons (Owen, 2026-10-08:  everything in a section box folds)
 * - Answered (`EpicChoices.isAnswered()`):  a PANEL in the Choices box, folded to its header, which is a button.
 *   - the chosen one (`<epic-choices chosen>`):  marked with a green check and green text, and open to start with
 * - Either way the fold is page state;  folded, the pros and cons are `hidden="until-found"`.
 * - REVIEWED (the page's `ReviewClient` is `reviewing`:  served by the page server, its inbox answering):
 *   a "Choose" pill at the header's end (`pill()`).
 *   - a click marks its letter as the item's pick through the client (`ReviewClient.choose()`);  again, un-picks it
 *   - a pick is an action chosen:  the item folds (`EpicItem.foldAfterAction()`, Owen, 2026-10-10);
 *     an un-pick doesn't
 *   - a pick is a decision, so green, wearing the fill rule (decision Q20):
 *     - available:  the pill a grey outline
 *     - picked:  `Chosen · not sent`, the pill and the card's frame DASHED green (an answered panel:  its title green)
 *     - once sent:  `Chosen · sent`, outlined green
 *     - applied (its set's `chosen`):  `Chosen`, the pill SOLID green;
 *       a question answered with it, any other item approved with it (`plan-doc inbox apply`)
 *   - from the pick on, the card says Chosen (Owen, 2026-10-10):  a sent pick Claude took off the inbox
 *     stays `Chosen · sent` until the doc's `chosen` reaches the page (`ReviewClient.takenPickOf()`)
 *   - WHEREVER its cards are (I8):  an item's text, a reply, More Details;
 *     the pick names its card set by position (`EpicChoices.setOf()`), as an item may hold several
 *   - on an OPEN item's cards
 *   - on a CLOSED one's (an answered question, an accepted call), but the chosen one,
 *     only while it's revisited (its note box open, a draft, a revisit or a pick):  "pick B instead, because ..."
 *   - never in an Original Discussion (`<epic-original>`):  history, not a choice
 * - SIDE EFFECT:  the first one connected makes the page's `ReviewClient` (`forPage()`), which reads the inbox
 *
 * - ANSWERING, an option of an `<epic-ask>` (a page Owen answers on, epic `epic-workflow` P12):  a card, drawn
 *   from its question (`ask`), which holds the picks.
 *   - its header:  the fold chevron (when it has pros and cons), then its tick box labelled by `A · title` (a click
 *     on the title ticks it), the thumbs-up, its `badge`;  at the end, the (?) of `more-details` and its state icon
 *   - a comment box under it, always shown (`<epic-text-box>` for `<key>-<letter>`)
 *   - ticked:  framed green;  `done`, under the question's Open:  hidden
 *   - a tick, an untick or the (?) sends `ui-change`, which its question takes
 ****************/
export class EpicOption extends E.UIComponent<typeof epicOptionVocabulary> {
  @E.proto static vocabulary = epicOptionVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-tooltip": tooltipCSS, "epic-choices": choicesCSS },
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
  // ## Answering:  an option of an `<epic-ask>`
  ////////////////

  /** The `<epic-ask>` it's an option of, drawn;  `undefined` for an epic page's option.  Read again as it connects. */
  @E.state accessor ask: EpicAsk | undefined = EpicOption.askFor(this.domElement)

  /** An option of an `<epic-ask>`:  a tick box and a comment box. */
  @E.cssState("answering")
  get isAnswering(): boolean {
    return !!this.ask
  }

  /** Ticked, in its question. */
  @E.cssState("ticked")
  get isTicked(): boolean {
    return !!this.ask && this.ask.isPicked(this.letter ?? "")
  }

  /** "Provide more details" pressed on it, in its question. */
  get wantsMore(): boolean {
    return !!this.ask && this.ask.wantsMore(this.letter ?? "")
  }

  /** Hidden by its question's filter:  `done`, while the filter shows Open. */
  @E.cssState("filtered")
  get isFiltered(): boolean {
    return !!this.ask?.hidesDone && !!this.done
  }

  /** Its state icon (`state-icon`). */
  readonly stateGlyph = new E.IconGlyph({ owner: this, name: () => (this.ask ? this.stateIcon : undefined) })

  /** The (?) of "Provide more details". */
  readonly moreGlyph = new E.IconGlyph({
    owner: this,
    name: () => (this.ask?.moreDetails ? MORE_ICON : undefined)
  })

  /** The drawn `<epic-ask>` `element` is an option of, if any. */
  private static askFor(element: Element): EpicAsk | undefined {
    const host = EpicAsk.askOf(element) as E.DOMElement | null
    return host?.component as EpicAsk | undefined
  }

  /** While connected, find its question again:  it may have moved. */
  @E.whileConnected
  protected findAsk() {
    this.ask = EpicOption.askFor(this.domElement)
    return undefined
  }

  ////////////////
  // ## Folding
  ////////////////

  /**
   * Open or folded, until the reader says otherwise:
   * a card (open question) open;  an answered panel open while it's the chosen one.
   */
  readonly fold = new Fold(() => !this.questionIsAnswered || this.isChosen)

  /** Light-DOM slot occupancy:  has it pros and cons? */
  readonly slots = new E.SlotContent(this.domElement)

  /** Does its header fold it?  An answered panel always;  a card with pros and cons. */
  get canFold(): boolean {
    return this.questionIsAnswered || this.slots.hasContent("")
  }

  /** Unfolded (a card or panel that folds). */
  @E.cssState("open")
  get isOpen(): boolean {
    return this.canFold && this.fold.isOpen()
  }

  /** The recommended one's mark:  a violet thumbs-up, no word (Owen, 2026-10-08, decision Q20's Q6). */
  readonly thumbsUp = new E.IconGlyph({ owner: this, name: () => (this.recommended ? RECOMMENDED_ICON : undefined) })

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
    const set = this.cardSet()
    if (!client?.reviewing || !id || !letter || !set) return undefined
    const listening = client.listening
    // applied:  its set's `chosen`, solid (the fill rule's done)
    if (this.isChosen) return { picked: true, sent: true, applied: true, listening }
    const mark = client.markOf(id)
    // Claude took the pick off the inbox, and the doc's `chosen` isn't on the page yet:  still Chosen, sent
    const taken = !mark && !this.chosenLetter && picks(client.takenPickOf(id), letter, set.index, set.own)
    const closed = (CLOSED_STATUSES as readonly string[]).includes(this.itemStatus ?? "")
    const revisiting =
      client.isBoxOpen(id) || !!client.draftOf(id) || mark?.action === "revisit" || !!mark?.pick || taken
    if (closed && !revisiting) return undefined
    if (taken) return { picked: true, sent: true, applied: false, listening }
    const picked = picks(mark, letter, set.index, set.own)
    return { picked, sent: picked && !!mark && client.isSent(mark), applied: false, listening }
  }

  /**
   * Which card set of its item it's in (`EpicChoices.setOf()`):  what its pick names (I8);
   * `undefined` in an Original Discussion (history:  never a pill), or outside an item.
   */
  private cardSet(): CardSet | undefined {
    return this.inOriginal ? undefined : EpicChoices.setOf(this.domElement)
  }

  /** Its letter is the item's pick, in review (P10), not applied yet (applied:  `chosen`). */
  @E.cssState("picked")
  get isPicked(): boolean {
    return !!this.pill?.picked && !this.pill.applied
  }

  /** Words before the noun:  card or panel, `chosen`, `picked` in review, and `sent` once that pick has gone. */
  protected get extraClass(): string | undefined {
    const sent = this.isPicked && this.pill?.sent
    const classes = [
      this.questionIsAnswered ? PANEL : CARD,
      this.isChosen && CHOSEN_CLASS,
      this.isPicked && PICKED,
      sent && SENT,
      this.isAnswering && ANSWERING,
      this.isTicked && TICKED
    ]
    return classes.filter(Boolean).join(" ")
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * While connected:  follow its question -- answered, the chosen letter, its item's status.  Returns the undo.
   * - `EpicChoices.watch()`'s own `MutationObserver`, not `@watches`:
   *   it watches its `<epic-choices>` and `<epic-item>`, ANCESTORS.
   */
  @E.whileConnected
  protected watchQuestion() {
    return EpicChoices.watch(this.domElement, () => {
      this.questionIsAnswered = EpicChoices.isAnswered(this.domElement)
      this.chosenLetter = EpicChoices.chosenFor(this.domElement)
      this.itemStatus = EpicChoices.itemStatusFor(this.domElement)
    })
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base")}>
        <Show when={this.ask} fallback={this.reviewHeader()}>
          {(ask) => this.answeringHeader(ask)}
        </Show>
        <div
          ref={this.fold.watch}
          id={BODY_ID}
          class={[BODY, { [EMPTY]: !this.slots.hasContent("") }]}
          part={this.partForName("body")}
          hidden={this.canFold ? this.fold.hidden() : undefined}
        >
          <slot />
        </div>
        <Show when={this.ask}>
          {(ask) => (
            <epic-text-box
              class={COMMENT}
              part={this.partForName("comment")}
              type="comment"
              for={`${ask().key}-${this.letter ?? ""}`}
              placeholder={this.translationForKey("commentOn", { letter: this.letter ?? "" })}
              label={this.translationForKey("commentLabel", { letter: this.letter ?? "", title: this.title ?? "" })}
            />
          )}
        </Show>
      </div>
    )
  }

  /**
   * An answering option's header (`ask`, `<Show>`'s accessor):  the fold chevron (with pros and cons), the tick box
   * labelled by `A · title` and the thumbs-up, the badge;  at its end the (?) and the state icon.
   */
  private answeringHeader(ask: Accessor<EpicAsk>): JSX.Element {
    return (
      <div class={HEADER} part={this.partForName("header")}>
        <Show when={this.canFold}>
          <button
            type="button"
            class={FOLD}
            part={this.partForName("toggle")}
            aria-expanded={this.isOpen ? "true" : "false"}
            aria-controls={BODY_ID}
            title={this.translationForKey(this.isOpen ? "foldTip" : "unfoldTip", { letter: this.letter ?? "" })}
            onClick={this.fold.toggle}
          >
            {Fold.chevron()}
          </button>
        </Show>
        <label class={PICK}>
          <input
            type={ask().multiple ? "checkbox" : "radio"}
            class={TICK}
            part={this.partForName("tick")}
            checked={this.isTicked}
            onChange={this.onTick}
          />
          <span class={TITLE} part={this.partForName("title")}>
            {this.letter}
            {LETTER_SEPARATOR}
            <slot name={this.slotForName("title")}>{this.title}</slot>
            {this.recommendedMark()}
          </span>
        </label>
        <Show when={this.badge}>
          <ui-label
            class={BADGE}
            part={this.partForName("badge")}
            size="mini"
            basic=""
            color={this.badgeColor ?? "grey"}
          >
            {this.badge}
          </ui-label>
        </Show>
        <span class={MARKS}>
          <Show when={ask().moreDetails}>
            <button
              type="button"
              class={MORE}
              part={this.partForName("more")}
              aria-pressed={this.wantsMore ? "true" : "false"}
              aria-label={this.translationForKey("moreTip")}
              title={this.translationForKey("moreTip")}
              onClick={this.onMore}
            >
              {this.moreGlyph.svg}
            </button>
          </Show>
          <Show when={this.stateIcon}>
            <span
              class={STATE_MARK}
              part={this.partForName("state")}
              data-color={this.stateColor ?? "grey"}
              role="img"
              aria-label={this.stateLabel ?? this.stateIcon}
              title={this.stateLabel}
            >
              {this.stateGlyph.svg}
            </span>
          </Show>
        </span>
      </div>
    )
  }

  /** The recommended one's thumbs-up, after its title:  violet, no word. */
  private recommendedMark(): JSX.Element {
    return (
      <Show when={this.recommended}>
        {" "}
        <span
          class={RECOMMENDED}
          part={this.partForName("recommended")}
          role="img"
          aria-label={this.translationForKey("recommended")}
          title={this.translationForKey("recommended")}
        >
          {this.thumbsUp.svg}
        </span>
      </Show>
    )
  }

  /** An epic page's option's header:  the fold toggle (its whole title), the Choose pill while reviewed. */
  private reviewHeader(): JSX.Element {
    return (
      <div class={HEADER} part={this.partForName("header")}>
        <Dynamic
          component={this.canFold ? "button" : "span"}
          type={this.canFold ? "button" : undefined}
          class={TOGGLE}
          part={this.partForName("toggle")}
          aria-expanded={this.canFold ? (this.isOpen ? "true" : "false") : undefined}
          aria-controls={this.canFold ? BODY_ID : undefined}
          title={
            this.canFold
              ? this.translationForKey(this.isOpen ? "foldTip" : "unfoldTip", { letter: this.letter ?? "" })
              : undefined
          }
          onClick={this.onHeaderClick}
        >
          <Show when={this.canFold}>{Fold.chevron()}</Show>
          <Show when={this.isChosen && this.questionIsAnswered}>
            <svg class={CHECK} part={this.partForName("check")} viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2.5 8.5l3.5 3.5 7.5-8" />
            </svg>
          </Show>
          <span class={TITLE} part={this.partForName("title")}>
            {this.letter}
            {LETTER_SEPARATOR}
            <slot name={this.slotForName("title")}>{this.title}</slot>
            {this.recommendedMark()}
          </span>
        </Dynamic>
        <Show when={this.pill}>{(pill) => this.pillButton(pill)}</Show>
      </div>
    )
  }

  /**
   * The Choose pill, at the header's end;  its words from `pillLabel()`:
   * - `Choose`:  a grey outline
   * - picked:  `Chosen · not sent`, dashed green
   * - sent:  `Chosen · sent`, outlined green
   * - applied (its set's `chosen`):  `Chosen`, solid green, and a click does nothing
   * - its tooltip says what a click does, and whether the pick has gone to Claude
   * - `pill`:  `<Show>`'s accessor, read in each binding:
   *   the callback's body runs once, so a value read there would never change
   */
  private pillButton(pill: Accessor<PillState>): JSX.Element {
    return (
      <span class={ACTIONS} part={this.partForName("actions")}>
        <button
          type="button"
          class={[CHOOSE, { [SENT]: pill().sent && !pill().applied, [APPLIED]: pill().applied }]}
          part={this.partForName("choose")}
          aria-pressed={pill().picked ? "true" : "false"}
          aria-disabled={pill().applied ? "true" : undefined}
          title={this.pillTip(pill())}
          onClick={this.onChoose}
        >
          {this.translationForKey(pillLabel(pill()))}
        </button>
      </span>
    )
  }

  /**
   * The pill's tooltip:  `Pick B`;  picked, `B is picked:  click to un-pick · sent` (or `not sent yet`);
   * applied, `B is the chosen option`.
   */
  private pillTip(pill: PillState): string {
    const letter = this.letter ?? ""
    if (pill.applied) return this.translationForKey("tipApplied", { letter })
    if (!pill.picked) return this.translationForKey("tipChoose", { letter })
    const where = this.translationForKey(pill.sent ? "tipSent" : "tipNotSent")
    const tip = `${this.translationForKey("tipChosen", { letter })} · ${where}`
    return pill.sent && !pill.listening ? `${tip}.  ${NOBODY_LISTENING}` : tip
  }

  ////////////////
  // ## Events
  ////////////////

  /** Answering:  its tick box changed:  its question hears it (`ui-change`);  unticked, its (?) goes off too. */
  private readonly onTick = (event: Event) => {
    const selected = (event.currentTarget as HTMLInputElement).checked
    this.send("ui-change", { letter: this.letter ?? "", selected, more: selected && this.wantsMore })
  }

  /** Answering:  its (?) pressed:  on, it's ticked too;  off, its tick stays as it is. */
  private readonly onMore = () => {
    const more = !this.wantsMore
    this.send("ui-change", { letter: this.letter ?? "", selected: more || this.isTicked, more })
  }

  /** A click on its header:  folds its card or panel (a card with no pros and cons has nothing to fold). */
  private readonly onHeaderClick = () => {
    if (this.canFold) this.fold.toggle()
  }

  /**
   * A click on its Choose pill:
   * - pick its letter in its card set (by the set's position:  I8), and fold the item
   * - or un-pick it when it's the pick
   * - applied already (its set's `chosen`):  nothing
   */
  private readonly onChoose = (event: MouseEvent) => {
    // a panel's header folds on a click;  the item's line would too
    event.stopPropagation()
    const id = this.itemId
    const letter = this.letter
    const set = this.cardSet()
    const pill = this.pill
    if (!this.review || !id || !letter || !set || pill?.applied) return
    // a failed write is the client's own notice, and re-reads the inbox:  nothing to do here
    void this.review.choose(id, pill?.picked ? null : letter, set.index).catch((error: unknown) => console.error(error))
    if (!pill?.picked) this.itemComponent()?.foldAfterAction()
  }

  /** The `<epic-item>` it belongs to, drawn;  else `undefined`. */
  private itemComponent(): EpicItem | undefined {
    const item = this.domElement.closest(ITEM_TAG) as E.DOMElement | null
    return item?.component as EpicItem | undefined
  }

  /**
   * While connected, follow the page's review inbox;  returns the undo.
   * - the client made (or found), the item's id read
   * - `inboxVersion` bumped on each of its changes
   */
  @E.whileConnected
  protected followReview(): () => void {
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
  /** its letter is its set's `chosen`:  the pick applied (solid, and a click does nothing) */
  applied: boolean
  /** a Claude session waits on the inbox */
  listening: boolean
}

/**
 * The pill's words, which say where the pick stands (Owen, 2026-10-10:  "losing the Chosen marker"):
 * `Choose`;  picked, `Chosen · not sent`, then `Chosen · sent`;  applied, `Chosen`.
 */
function pillLabel(pill: PillState): "choose" | "chosenNotSent" | "chosenSent" | "chosen" {
  if (!pill.picked) return "choose"
  if (pill.applied) return "chosen"
  return pill.sent ? "chosenSent" : "chosenNotSent"
}

/** Class names inside the shadow root. */
const HEADER = "header"
const CHECK = "check"
const TITLE = "title"
const RECOMMENDED = "recommended"

/** The recommended option's icon, after its title. */
const RECOMMENDED_ICON = "thumbs up"
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

/** Class word on the pill of its set's chosen option:  the pick applied, solid. */
const APPLIED = "applied"

/** Class words of an answering option (an `<epic-ask>`'s):  the box, ticked. */
const ANSWERING = "answering"
const TICKED = "ticked"

/** Classes of an answering option's header:  its fold button, the label around tick and title, the tick box. */
const FOLD = "fold"
const PICK = "pick"
const TICK = "tick"

/** Classes of an answering option's badge, the box at its header's end, the (?), its state icon, its comment box. */
const BADGE = "badge"
const MARKS = "marks"
const MORE = "more"
const STATE_MARK = "state-mark"
const COMMENT = "comment"

/** The (?) of "Provide more details". */
const MORE_ICON = "circle question"

/** The body's class word with no pros and cons:  not drawn. */
const EMPTY = "empty"

/** `id` of its body, for its header's `aria-controls`. */
const BODY_ID = "body"

/** Between an option's letter and its title:  `A · A named palette`. */
const LETTER_SEPARATOR = " · "
