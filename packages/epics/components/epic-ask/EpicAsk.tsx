import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import {
  AnswerForm,
  type AskPart,
  type AskState,
  type PageAnswer,
  type PartLabels,
  type SentAnswer
} from "$/epics/answers"
// the Other box:  its barrel first, so it's defined wherever `<epic-ask>` is
import "$/epics/components/epic-text-box"

import { epicAskVocabulary } from "./EpicAsk.en"

import askCSS from "./EpicAsk.css?inline"
import tooltipCSS from "$/epics/components/epic-item/Tooltip.css?inline"

/** An option's attributes this reads:  ticked to start with, hidden under Open. */
const SELECTED = "selected"
const DONE = "done"

/** The option attributes its `options` follow:  read while the class is defined (`@E.watches`), so above it. */
const OPTION_ATTRIBUTES = [SELECTED, DONE, "letter"]

/****************
 * ### `EpicAsk`
 * The component behind `<epic-ask>`:  a question Owen answers ON the page (a details page's;
 * epic `epic-workflow` P12).
 * - Its children are a plan doc's:  the question an `<epic-question>`, its options an `<epic-choices>` of
 *   `<epic-option>`s, so it reads as a plan doc's question does.
 *   - Those options are ITS options (`<epic-ask> > <epic-choices> > <epic-option>`):  each draws a tick box, a
 *     comment box, and what the question asks for (the (?) of `more-details`), reading this question
 *     (`EpicOption`'s answering mode).
 *   - Options deeper inside (in an option's text, as the review's item picker quotes a plan doc) are only text.
 * - It draws its line first:  its id chip in the plan doc's state colours, `Pick one` / `Pick several`, and its
 *   tools (Select all, Open | All);  then its children;  then the Other box (`<epic-text-box type="other">`).
 * - It holds what's picked (`picks`) and what wants more details (`moreWanted`):  its options draw from them, and
 *   send a `ui-change` when Owen ticks one, which it takes (`onPick()`).
 *   - Before Owen picks:  the options marked `selected` (ticked to start with:  the review's item picker)
 * - Part of the page's answer (`AnswerForm`) while connected:  its picks under its key, "more details" under
 *   `<key>-more`.
 * - SIDE EFFECT:  writes its state on its `<ui-section>` (`data-state`) and on that section's button in the docs
 *   page's toolbar, whose badge takes its colour (`spell-doc.css`).
 ****************/
export class EpicAsk extends E.UIComponent<typeof epicAskVocabulary> implements AskPart {
  @E.proto static vocabulary = epicAskVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-tooltip": tooltipCSS, "epic-ask": askCSS },
    // a form:  a click on its words must not jump to its first control
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## Its options
  ////////////////

  /** Its options' elements, in order:  `<epic-option>`s of its `<epic-choices>`. */
  @E.watches({ childList: true, subtree: true, attributeFilter: OPTION_ATTRIBUTES })
  get options(): readonly Element[] {
    return isServer ? [] : EpicAsk.optionsOf(this.domElement)
  }

  /** The letters ticked in the page's markup (`<epic-option selected>`):  the picks before Owen picks. */
  get startingPicks(): string[] {
    return this.options.filter((option) => option.hasAttribute(SELECTED)).map(letterOf)
  }

  /** What Owen picked (or the answer sent);  `undefined` until he does:  `startingPicks` then. */
  @E.state accessor chosen: readonly string[] | undefined = undefined

  /** The letters picked. */
  get picks(): readonly string[] {
    return this.chosen ?? this.startingPicks
  }

  /** The letters whose "Provide more details" is pressed. */
  @E.state accessor moreWanted: readonly string[] = []

  /** The Other box's text, as typed. */
  @E.state accessor otherText = ""

  /** Is `letter` picked? */
  isPicked(letter: string): boolean {
    return this.picks.includes(letter)
  }

  /** Is "Provide more details" pressed on `letter`? */
  wantsMore(letter: string): boolean {
    return this.moreWanted.includes(letter)
  }

  ////////////////
  // ## Its key and state
  ////////////////

  /** The key its answer goes under:  `name`, else its section's id, else `""` (not answerable). */
  get key(): string {
    return this.name ?? this.domElement.closest("ui-section[id]")?.id ?? ""
  }

  /** Its place among the page's questions, from 1;  set as it connects. */
  @E.state accessor position = 1

  /** Its chip:  a plan-doc id key in capitals (`q3` -> `Q3`), else `Q` and its place (`Q2`). */
  get chipLabel(): string {
    return /^[a-z]\d+$/.test(this.key) ? this.key.toUpperCase() : `Q${this.position}`
  }

  /** Where it stands (`AskState`):  more details asked, or only Other written;  picked;  nothing yet. */
  get askState(): AskState {
    const picked = this.picks.length > 0
    if (this.moreWanted.length || (this.otherText.trim() && !picked)) return "working"
    return picked ? "done" : "attention"
  }

  /** Nothing yet:  red. */
  @E.cssState("attention")
  get needsAnswer(): boolean {
    return this.askState === "attention"
  }

  /** Picked:  green. */
  @E.cssState("done")
  get isDecided(): boolean {
    return this.askState === "done"
  }

  /** Claude has more to do:  blue. */
  @E.cssState("working")
  get isClaudesTurn(): boolean {
    return this.askState === "working"
  }

  ////////////////
  // ## Its tools
  ////////////////

  /** The filter's choice:  `open` (the options not `done`) or `all`. */
  @E.state accessor showing: "open" | "all" = "open"

  /** Options marked `done` are hidden:  the filter is on, showing Open. */
  get hidesDone(): boolean {
    return !!this.filter && this.showing === "open"
  }

  /** Its options shown (not hidden by the filter). */
  get shownOptions(): Element[] {
    return this.options.filter((option) => !(this.hidesDone && option.hasAttribute(DONE)))
  }

  /** Every option shown is ticked:  the button says Select none. */
  get isAllSelected(): boolean {
    const shown = this.shownOptions
    return shown.length > 0 && shown.every((option) => this.isPicked(letterOf(option)))
  }

  ////////////////
  // ## Connected
  ////////////////

  /** The page's form, while it's registered there. */
  private form: AnswerForm | undefined

  /** While connected:  its place among the page's questions, and its part of the page's answer;  returns the undo. */
  @E.whileConnected
  protected joinForm() {
    this.position = Array.from(document.querySelectorAll(this.domElement.localName)).indexOf(this.domElement) + 1
    const form = AnswerForm.forPage()
    this.form = form
    const leave = form.add(this)
    return () => {
      leave()
      this.form = undefined
    }
  }

  /**
   * Its state on its section (`data-state`), and on that section's toolbar button (the docs runtime copies it from
   * the section when it builds the toolbar, so a later change goes to both).
   */
  @E.onChange("askState", "isConnected")
  protected markState(state: AskState, connected: boolean) {
    if (!connected) return
    const section = this.domElement.closest("ui-section[id]")
    section?.setAttribute(STATE_ATTRIBUTE, state)
    if (section)
      document
        .querySelector(`nav.spell-toolbar [data-rail="${CSS.escape(section.id)}"]`)
        ?.setAttribute(STATE_ATTRIBUTE, state)
  }

  ////////////////
  // ## Drawing
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base")}>
        <div class={LINE} part={this.partForName("line")}>
          <span
            class={CHIP}
            part={this.partForName("chip")}
            title={this.translationForKey(`${this.askState}Tip`, { id: this.chipLabel })}
          >
            {this.chipLabel}
          </span>
          <span class={HOW} part={this.partForName("how")}>
            {this.translationForKey(this.multiple ? "pickSeveral" : "pickOne")}
          </span>
          <span class={TOOLS} part={this.partForName("tools")}>
            <Show when={this.multiple && this.selectAll}>
              <ui-button
                size="mini"
                basic=""
                circular=""
                icon="list check"
                aria-pressed={this.isAllSelected ? "true" : "false"}
                onClick={this.onSelectAll}
              >
                {this.translationForKey(this.isAllSelected ? "selectNone" : "selectAll")}
              </ui-button>
            </Show>
            <Show when={this.filter}>
              <span class={FILTER} role="group">
                <ui-button
                  size="mini"
                  basic=""
                  circular=""
                  icon="filter"
                  active={this.showing === "open" ? "" : undefined}
                  aria-pressed={this.showing === "open" ? "true" : "false"}
                  title={this.translationForKey("openTip")}
                  onClick={() => (this.showing = "open")}
                >
                  {this.translationForKey("open")}
                </ui-button>
                <ui-button
                  size="mini"
                  basic=""
                  circular=""
                  icon="list check"
                  active={this.showing === "all" ? "" : undefined}
                  aria-pressed={this.showing === "all" ? "true" : "false"}
                  title={this.translationForKey("allTip")}
                  onClick={() => (this.showing = "all")}
                >
                  {this.translationForKey("all")}
                </ui-button>
              </span>
            </Show>
          </span>
        </div>
        <slot />
        <epic-text-box
          class={OTHER}
          part={this.partForName("other")}
          type="other"
          for={this.key}
          placeholder={this.translationForKey(this.multiple ? "otherSeveral" : "otherOne")}
          onInput={this.onOtherInput}
        />
      </div>
    )
  }

  ////////////////
  // ## Events
  ////////////////

  /**
   * One of its options was ticked, unticked, or had its (?) pressed (`<epic-option>`'s `ui-change`):
   * - pick one:  a tick picks it alone
   * - "Provide more details" pressed:  the option is ticked too
   * - options further down (quoted in an option's text) are none of its business
   */
  @E.on("ui-change")
  protected onPick(event: Event) {
    const option = event.target as Element
    if (!this.options.includes(option)) return
    const { selected, more } = (event as CustomEvent<{ selected: boolean; more: boolean }>).detail
    const letter = letterOf(option)
    const ticked = selected || more
    const others = this.multiple ? this.picks.filter((each) => each !== letter) : []
    this.chosen = ticked ? [...others, letter] : others
    this.moreWanted = more
      ? [...this.moreWanted.filter((each) => each !== letter), letter]
      : this.moreWanted.filter((each) => each !== letter)
    this.form?.edited()
  }

  /** Select all:  tick every option shown;  once they all are, untick them (Select none). */
  private readonly onSelectAll = () => {
    const shown = this.shownOptions.map(letterOf)
    const rest = this.picks.filter((letter) => !shown.includes(letter))
    this.chosen = this.isAllSelected ? rest : [...rest, ...shown]
    this.form?.edited()
  }

  /** Typing in Other:  its state follows (the box tells the form itself). */
  private readonly onOtherInput = (event: InputEvent) => {
    this.otherText = (event.currentTarget as HTMLElement & { value: string }).value
  }

  ////////////////
  // ## Its part of the answer
  ////////////////

  /** Its picks under its key;  "more details" under `<key>-more`, when it asks for them. */
  gatherInto(page: PageAnswer) {
    const key = this.key
    if (!key) return
    const answer = (page.answers[key] ??= { picked: [] })
    answer.picked = [...this.picks]
    if (this.moreDetails) page.answers[`${key}${MORE_SUFFIX}`] = { picked: [...this.moreWanted] }
  }

  /**
   * Its ids, for a draft (P18):  its key, under its section's title (`Q1 · Which layout?`), and each option's
   * (`q1-B`), under the option's (`B · Blue`).
   */
  labelsInto(labels: PartLabels) {
    const key = this.key
    if (!key) return
    labels[key] = this.domElement.closest("ui-section[id]")?.getAttribute("header") ?? this.chipLabel
    for (const option of this.options) {
      const letter = letterOf(option)
      labels[`${key}-${letter}`] = `${letter} · ${option.getAttribute("title") ?? letter}`
    }
  }

  /** Show `answer`, as sent:  its picks, its "more details" and its Other (the box shows its own text). */
  showAnswer(answer: SentAnswer) {
    const key = this.key
    const got = answer.answers?.[key]
    this.chosen = [...(got?.picked ?? [])]
    this.otherText = got?.other ?? ""
    this.moreWanted = [...(answer.answers?.[`${key}${MORE_SUFFIX}`]?.picked ?? [])]
  }

  ////////////////
  // ## Shared with `<epic-option>`
  ////////////////

  /**
   * The `<epic-ask>` whose option `option` is (`<epic-ask> > <epic-choices> > <epic-option>`), or `null`:
   * an option anywhere else draws as a plan doc's.
   */
  static askOf(option: Element): Element | null {
    const choices = option.parentElement
    const ask = choices?.localName === CHOICES_TAG ? choices.parentElement : null
    return ask?.localName === ASK_TAG ? ask : null
  }

  /** The options of the `<epic-ask>` `ask`, in order. */
  static optionsOf(ask: Element): Element[] {
    return Array.from(ask.children)
      .filter((child) => child.localName === CHOICES_TAG)
      .flatMap((choices) => Array.from(choices.children).filter((child) => child.localName === OPTION_TAG))
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicAsk extends E.AttributeValues<typeof epicAskVocabulary> {}

/** An option's letter (`A`;  the item picker's are item ids, `J7`). */
function letterOf(option: Element): string {
  return option.getAttribute("letter") ?? ""
}

/** The tags of a question's options. */
const ASK_TAG = "epic-ask"
const CHOICES_TAG = "epic-choices"
const OPTION_TAG = "epic-option"

/** The answer key of "Provide more details":  `<key>-more`. */
const MORE_SUFFIX = "-more"

/** The attribute its state goes in, on its section and the toolbar's button:  the docs runtime's. */
const STATE_ATTRIBUTE = "data-state"

/** Classes of the shadow markup. */
const LINE = "line"
const CHIP = "chip"
const HOW = "how"
const TOOLS = "tools"
const FILTER = "filter"
const OTHER = "other"
