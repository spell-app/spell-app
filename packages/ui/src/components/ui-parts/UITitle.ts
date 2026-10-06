import { E, UIT } from "$/ui/core"
import { PartElement } from "./PartElement"
import { titleVocabulary } from "./ui-title.vocabulary.en"

/****************
 * ### `<ui-title>`
 * A title:  `<div class="title">`, or `<a class="title">` with `href`.
 * - A step's, an accordion panel's or a search result's title.
 ****************/
export class UITitle extends PartElement<typeof titleVocabulary> {
  @E.proto static vocabulary = titleVocabulary

  protected tag(): string {
    return this.attrs.href ? UIT.ANCHOR_TAG : "div"
  }

  protected href(): string | undefined {
    return this.attrs.href
  }
}
