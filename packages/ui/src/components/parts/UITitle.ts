import { proto } from "$/ui/core"

import { titleVocabulary } from "./parts.vocabulary.en"
import { PartElement } from "./PartElement"

/****************
 * ### `<ui-title>`
 * A title:  `<div class="title">`, or `<a class="title">` with `href`.
 * - A step's, an accordion panel's or a search result's title.
 ****************/
export class UITitle extends PartElement<typeof titleVocabulary> {
  @proto static vocabulary = titleVocabulary

  protected tag(): string {
    return this.attrs.href ? LINK : "div"
  }

  protected href(): string | undefined {
    return this.attrs.href
  }
}

/** Root of a linked title. */
const LINK = "a"
