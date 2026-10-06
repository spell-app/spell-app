import { E, UIT } from "$/ui/core"
import { PartElement } from "./PartElement"
import { authorVocabulary } from "./ui-author.vocabulary.en"

/****************
 * ### `<ui-author>`
 * An author:  `<span class="author">`, or `<a class="author">` with `href` (a profile link).
 * - Fomantic's comment `.author` and feed `.user`.
 ****************/
export class UIAuthor extends PartElement<typeof authorVocabulary> {
  @E.proto static vocabulary = authorVocabulary

  protected tag(): string {
    return this.attrs.href ? UIT.ANCHOR_TAG : "span"
  }

  protected href(): string | undefined {
    return this.attrs.href
  }

  protected target(): string | undefined {
    return this.attrs.href ? this.attrs.target : undefined
  }
}
