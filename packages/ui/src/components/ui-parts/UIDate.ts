import { proto } from "$/ui/core"

import { dateVocabulary } from "./ui-date.vocabulary.en"
import { PartElement } from "./PartElement"
import { TIME } from "./ui-parts.types"

/****************
 * ### `<ui-date>`
 * A date:  `<time class="date" datetime>`, so the machine-readable value travels with the text.
 * - Inside a feed summary it goes inline and small:  `ui-parts.css` style-queries the summary's `--_ui-part`.
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
