import { Show, onSettled } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { Chevron } from "$/epics/components/epic-item/Chevron"
import { Fold } from "$/epics/components/epic-item/Fold"

import { epicChoicesVocabulary } from "./EpicChoices.en"
import { ANSWERED, CHOICES_TAG, CHOSEN, ITEM_TAG, STATUS, TOGGLE } from "./EpicChoices.types"

import choicesCSS from "./EpicChoices.css?inline"

/****************
 * ### `EpicChoices`
 * The component behind `<epic-choices>`:  a question's options, `<epic-option>`s, drawn as the question stands.
 * - Open question:  the option cards side by side (as many as fit, at least 14em each;  one column when narrow).
 * - Answered (`chosen`, or `answered` on its `<epic-item>`):  folded away under a `Choices` aside, its options
 *   panels in one box, the chosen one marked and open.  Find-in-page unfolds it.
 * - Reads its item's `answered` and its own `chosen` as they change (`EpicChoices.watch()`);  `<epic-option>` reads
 *   the same, through the same two statics.
 ****************/
export class EpicChoices extends E.UIComponent<typeof epicChoicesVocabulary> {
  @E.proto static vocabulary = epicChoicesVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { choices: choicesCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** Its question is answered:  folded under Choices. */
  @E.cssState("answered")
  @E.state
  accessor questionIsAnswered = EpicChoices.isAnswered(this.domElement)

  /** Its options' box:  folded until the reader opens it. */
  readonly fold = new Fold(() => false)

  /** Answered and unfolded. */
  @E.cssState("open")
  get isOpen(): boolean {
    return this.questionIsAnswered && this.fold.isOpen()
  }

  protected get extraClass(): string | undefined {
    return this.questionIsAnswered ? ANSWERED : undefined
  }

  onMount(): JSX.Element {
    if (!isServer) {
      onSettled(() =>
        EpicChoices.watch(this.domElement, () => (this.questionIsAnswered = EpicChoices.isAnswered(this.domElement)))
      )
    }
    return super.onMount()
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base")}>
        <Show when={this.questionIsAnswered} fallback={<slot />}>
          <button
            type="button"
            class={TOGGLE}
            part={this.partForName("toggle")}
            aria-expanded={this.isOpen ? "true" : "false"}
            aria-controls={PANELS_ID}
            onClick={this.fold.toggle}
          >
            <Chevron />
            {this.translationForKey("choices")}
          </button>
          <div
            ref={this.fold.watch}
            id={PANELS_ID}
            class={PANELS}
            part={this.partForName("panels")}
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
    return !!item && E.Converters.boolean(item.getAttribute(ANSWERED), ANSWERED)
  }

  /** The chosen letter of the `<epic-choices>` `element` is (or sits in), or `undefined`. */
  static chosenFor(element: Element): string | undefined {
    return element.closest(CHOICES_TAG)?.getAttribute(CHOSEN) || undefined
  }

  /** The `status` of the item `element` sits in, or `undefined`. */
  static itemStatusFor(element: Element): string | undefined {
    return element.closest(ITEM_TAG)?.getAttribute(STATUS) ?? undefined
  }

  /**
   * Call `changed` whenever what `isAnswered()` / `chosenFor()` / `itemStatusFor()` read changes:  `chosen`, the
   * item's `answered` and `status`.  Returns how to stop.
   */
  static watch(element: Element, changed: () => void): () => void {
    const observer = new MutationObserver(changed)
    const choices = element.closest(CHOICES_TAG)
    const item = element.closest(ITEM_TAG)
    if (choices) observer.observe(choices, { attributeFilter: [CHOSEN] })
    if (item) observer.observe(item, { attributeFilter: [ANSWERED, STATUS] })
    changed()
    return () => observer.disconnect()
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicChoices extends E.AttributeValues<typeof epicChoicesVocabulary> {}

/** Class of the answered options' box. */
const PANELS = "panels"

/** `id` of that box, for its toggle's `aria-controls`. */
const PANELS_ID = "panels"
