import { E } from "$/ui/core"
import { dateVocabulary } from "./UIDate.en"

/****************
 * ### `UIDate`
 * The component behind `<ui-date>`:  a date, `<time class="date" datetime>`,
 * so the machine-readable value travels with the text.
 *
 * - Inside a feed summary it goes inline and small:  `UIParts.css` style-queries the summary's `--_ui-part`.
 ****************/
export class UIDate extends E.PartComponent<typeof dateVocabulary> {
  @E.proto static vocabulary = dateVocabulary

  protected get rootTag(): string {
    return "time"
  }

  protected get rootDatetime(): string | undefined {
    return this.datetime
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIDate extends E.AttributeValues<typeof dateVocabulary> {}
