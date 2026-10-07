import { Show, createMemo, onSettled, untrack } from "solid-js"
import { Dynamic, isServer, type JSX } from "@solidjs/web"

import { Cell, proto, SlotContent, UIElement, UIT } from "$/ui/core"

import { Chevron } from "$/epics/components/epic-item/Chevron"
import { Fold } from "$/epics/components/epic-item/Fold"

import { epicOptionVocabulary } from "./epic-option.vocabulary.en"
import { EpicChoices } from "./EpicChoices"
import {
  ACTIONS,
  BODY,
  BODY_ID,
  CARD,
  CHECK,
  CHOSEN_CLASS,
  HEADER,
  LETTER_SEPARATOR,
  PANEL,
  RECOMMENDED,
  TITLE,
  TOGGLE,
  type EpicOptionVocabulary
} from "./epic-choices.types"

import choicesCSS from "./epic-choices.css?inline"

/****************
 * ### `<epic-option>`
 * One option of a question:  its header (`A · A named palette (recommended)`), then its pros and cons (its light
 * children, through the default slot).
 * - Open question:  a CARD, its header a band at the top;  the `actions` slot at the header's end for P9's Choose
 *   pill.
 * - Answered (`EpicChoices.isAnswered()`):  a PANEL in the Choices box, folded to its header, which is a button;
 *   the chosen one (`<epic-choices chosen>`) marked with a green check and green text, and open to start with.
 ****************/
export class EpicOption extends UIElement<EpicOptionVocabulary> {
  @proto static vocabulary = epicOptionVocabulary
  @proto static styles = { choices: choicesCSS }
  @proto static delegatesFocus = false

  /** Its question is answered:  a panel, not a card. */
  readonly answered = new Cell(EpicChoices.isAnswered(this.host))

  /** The chosen letter, or `undefined`. */
  readonly chosenLetter = new Cell(EpicChoices.chosenFor(this.host))

  /** Light-DOM slot occupancy:  has it pros and cons? */
  readonly slots = new SlotContent(this.host)

  /** It's the chosen option. */
  readonly chosen = createMemo(() => !!this.attrs.letter && this.chosenLetter.get() === this.attrs.letter)

  /** Answered:  its panel, open while it's the chosen one, until the reader says otherwise. */
  readonly fold = new Fold(this.chosen)

  /** A panel, open. */
  readonly isOpen = createMemo(() => this.answered.get() && this.fold.isOpen())

  protected extraClasses(): string | undefined {
    return [this.answered.get() ? PANEL : CARD, this.chosen() && CHOSEN_CLASS].filter(Boolean).join(" ")
  }

  protected hostStates() {
    return { answered: this.answered.get(), chosen: this.chosen(), open: this.isOpen() }
  }

  mount(): JSX.Element {
    if (!isServer) {
      onSettled(() =>
        EpicChoices.watch(this.host, () => {
          this.answered.set(EpicChoices.isAnswered(this.host))
          this.chosenLetter.set(EpicChoices.chosenFor(this.host))
        })
      )
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
          <span class={ACTIONS} part={this.part("actions")} hidden={!this.slots.has(this.slot("actions"))}>
            <slot name={this.slot("actions")} />
          </span>
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

  /** A click on its header:  folds its panel, once answered. */
  private readonly onHeaderClick = () => {
    if (untrack(this.answered.get)) this.fold.toggle()
  }
}

/** The header's text box while it isn't a button:  an open question's card. */
const TEXT_TAG = "span"

/** The body's class word with no pros and cons:  not drawn. */
const EMPTY = "empty"
