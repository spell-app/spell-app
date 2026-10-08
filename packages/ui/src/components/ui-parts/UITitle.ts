import { E, UIT } from "$/ui/core"
import { titleVocabulary } from "./UITitle.vocabulary.en"

/****************
 * ### `UITitle`
 * The component behind `<ui-title>`:  a title, `<div class="title">`, or `<a class="title">` with `href`.
 *
 * - A step's, an accordion panel's or a search result's title.
 ****************/
export class UITitle extends E.PartComponent<typeof titleVocabulary> {
  @E.proto static vocabulary = titleVocabulary

  protected get rootTag(): string {
    return this.href ? UIT.ANCHOR_TAG : "div"
  }

  protected get rootHref(): string | undefined {
    return this.href
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UITitle extends E.AttributeValues<typeof titleVocabulary> {}
