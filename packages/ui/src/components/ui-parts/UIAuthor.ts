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

  protected get rootTag(): string {
    return this.href ? UIT.ANCHOR_TAG : "span"
  }

  protected get rootHref(): string | undefined {
    return this.href
  }

  protected get rootTarget(): string | undefined {
    return this.href ? this.target : undefined
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIAuthor extends E.AttributeValues<typeof authorVocabulary> {}
