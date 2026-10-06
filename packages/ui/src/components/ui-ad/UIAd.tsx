import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { adVocabulary } from "./ui-ad.vocabulary.en"
import { AdFallback } from "./ui-ad.fallback"
import { TEST } from "./ui-ad.types"

import adCSS from "./ui-ad.css?inline"

/****************
 * ### `<ui-ad>`
 * An ad slot:  `<div class="ui … ad" part="ad"><slot></slot></div>`, sized to its IAB `unit`.
 * - `test`:  adds Fomantic's `test` class and `data-text` on the root -- the given text, or the translated "Ad"
 *   (`adTest`) when bare;  `ui-ad.css` draws it with `::after`, which assistive tech reads as the box's text.
 * - No role:  see `ui-ad.css` (why not `<aside>`).
 ****************/
export class UIAd extends E.UIElement<typeof adVocabulary> {
  @E.proto static vocabulary = adVocabulary
  @E.proto static styles = { ad: adCSS }
  @E.proto static Fallback = AdFallback
  @E.proto static delegatesFocus = false

  protected extraClasses(): string | undefined {
    return this.isTest() ? TEST : undefined
  }

  render(): JSX.Element {
    return (
      <div
        class={this.classes()}
        part={this.part("ad")}
        data-text={this.isTest() ? this.attrs.test || this.text("adTest") : undefined}
      >
        <slot />
      </div>
    )
  }

  /** `test` present, bare or with text? */
  private isTest(): boolean {
    return this.attrs.test !== undefined
  }
}
