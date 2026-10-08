import { E } from "$/ui/core"
import { authorVocabulary } from "./UIAuthor.en"

/****************
 * ### `UIAuthor`
 * The component behind `<ui-author>`:  who wrote something, `<span class="author">`,
 * or `<a class="author">` with `href` (a link to their profile).
 *
 * - Fomantic's comment `.author`, and its feed `.user`.
 ****************/
export class UIAuthor extends E.PartComponent<typeof authorVocabulary> {
  @E.proto static vocabulary = authorVocabulary

  protected get rootTag(): string {
    return this.href ? "a" : "span"
  }

  protected get rootHref(): string | undefined {
    return this.href
  }

  protected get rootTarget(): string | undefined {
    return this.href ? this.target : undefined
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIAuthor extends E.AttributeValues<typeof authorVocabulary> {}
