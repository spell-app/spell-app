import { proto } from "$/core"

import { dateVocabulary } from "./parts.vocabulary.en"
import { PartElement } from "./PartElement"

/****************
 * ### `<ui-date>`
 * A date:  `<time class="date" datetime>`, so the machine-readable value travels with the text.
 * - Inside a feed summary it goes inline and small:  `parts.css` style-queries the summary's `--_ui-part`.
 ****************/
export class UIDate extends PartElement<typeof dateVocabulary> {
  @proto static vocabulary = dateVocabulary

  protected tag(): string {
    return TIME
  }

  protected datetime(): string | undefined {
    return this.attrs.datetime
  }
}

/** Root element. */
const TIME = "time"
