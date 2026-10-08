import { E } from "$/ui/core"
import { PartElement } from "./PartElement"
import { dateVocabulary } from "./ui-date.vocabulary.en"

/****************
 * ### `<ui-date>`
 * A date:  `<time class="date" datetime>`, so the machine-readable value travels with the text.
 * - Inside a feed summary it goes inline and small:  `ui-parts.css` style-queries the summary's `--_ui-part`.
 ****************/
export class UIDate extends PartElement<typeof dateVocabulary> {
  @E.proto static vocabulary = dateVocabulary

  protected get rootTag(): string {
    return TIME
  }

  protected get rootDatetime(): string | undefined {
    return this.datetime
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIDate extends E.AttributeValues<typeof dateVocabulary> {}

/** Root element. */
const TIME = "time"
