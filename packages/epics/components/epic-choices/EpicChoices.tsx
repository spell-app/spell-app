import { Show, createMemo, onSettled } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, Converters, proto, UIElement, UIT } from "$/ui/core"

import { Chevron } from "$/epics/components/epic-item/Chevron"
import { Fold } from "$/epics/components/epic-item/Fold"

import { epicChoicesVocabulary } from "./epic-choices.vocabulary.en"
import { EpicChoicesFallback } from "./epic-choices.fallback"
import {
  ANSWERED,
  CHOICES_TAG,
  CHOSEN,
  ITEM_TAG,
  PANELS,
  PANELS_ID,
  TOGGLE,
  type EpicChoicesVocabulary
} from "./epic-choices.types"

import choicesCSS from "./epic-choices.css?inline"

/****************
 * ### `<epic-choices>`
 * A question's options, `<epic-option>`s, drawn as the question stands.
 * - Open question:  the option cards side by side (as many as fit, at least 14em each;  one column when narrow).
 * - Answered (`chosen`, or `answered` on its `<epic-item>`):  folded away under a `Choices` aside, its options
 *   panels in one box, the chosen one marked and open.  Find-in-page unfolds it.
 * - Reads its item's `answered` and its own `chosen` as they change (`EpicChoices.watch()`);  `<epic-option>` reads
 *   the same, through the same two statics.
 ****************/
export class EpicChoices extends UIElement<EpicChoicesVocabulary> {
  @proto static vocabulary = epicChoicesVocabulary
  @proto static styles = { choices: choicesCSS }
  @proto static Fallback = EpicChoicesFallback
  @proto static delegatesFocus = false

  /** Its question is answered:  folded under Choices. */
  readonly answered = new Cell(EpicChoices.isAnswered(this.host))

  /** Its options' box:  folded until the reader opens it. */
  readonly fold = new Fold(() => false)

  /** Answered and unfolded. */
  readonly isOpen = createMemo(() => this.answered.get() && this.fold.isOpen())

  protected extraClasses(): string | undefined {
    return this.answered.get() ? ANSWERED : undefined
  }

  protected hostStates() {
    return { answered: this.answered.get(), open: this.isOpen() }
  }

  mount(): JSX.Element {
    if (!isServer)
      onSettled(() => EpicChoices.watch(this.host, () => this.answered.set(EpicChoices.isAnswered(this.host))))
    return super.mount()
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <Show when={this.answered.get()} fallback={<slot />}>
          <button
            type={UIT.BUTTON}
            class={TOGGLE}
            part={this.part("toggle")}
            aria-expanded={this.isOpen() ? UIT.TRUE : UIT.FALSE}
            aria-controls={PANELS_ID}
            onClick={this.fold.toggle}
          >
            <Chevron />
            {this.text("choices")}
          </button>
          <div
            ref={this.fold.watch}
            id={PANELS_ID}
            class={PANELS}
            part={this.part("panels")}
            hidden={this.fold.hidden()}
          >
            <slot />
          </div>
        </Show>
      </div>
    )
  }

  ////////////////
  // ## Shared with `<epic-option>`
  ////////////////

  /** Is the question `element` sits in answered?  Its `<epic-choices chosen>`, or its `<epic-item answered>`. */
  static isAnswered(element: Element): boolean {
    if (EpicChoices.chosenFor(element)) return true
    const item = element.closest(ITEM_TAG)
    return !!item && Converters.boolean(item.getAttribute(ANSWERED), ANSWERED)
  }

  /** The chosen letter of the `<epic-choices>` `element` is (or sits in), or `undefined`. */
  static chosenFor(element: Element): string | undefined {
    return element.closest(CHOICES_TAG)?.getAttribute(CHOSEN) || undefined
  }

  /**
   * Call `changed` whenever what `isAnswered()` / `chosenFor()` read changes:  `chosen`, the item's `answered`.
   * Returns how to stop.
   */
  static watch(element: Element, changed: () => void): () => void {
    const observer = new MutationObserver(changed)
    const choices = element.closest(CHOICES_TAG)
    const item = element.closest(ITEM_TAG)
    if (choices) observer.observe(choices, { attributeFilter: [CHOSEN] })
    if (item) observer.observe(item, { attributeFilter: [ANSWERED] })
    changed()
    return () => observer.disconnect()
  }
}
