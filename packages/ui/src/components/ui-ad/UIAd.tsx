import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { adVocabulary } from "./UIAd.vocabulary.en"

import adCSS from "./UIAd.css?inline"

/****************
 * ### `UIAd`
 * The component behind `<ui-ad>`:  a box that holds an ad, sized to its IAB `unit`.
 *
 * - Its shadow DOM is one box, `<div class="ui … ad" part="ad">`, around a slot for the ad.
 * - `test`:  adds Fomantic's `test` class and `data-text` on the box:
 *   the given text, or the translated "Ad" (`adTest`) when bare.
 *   `UIAd.css` draws it with `::after`, which assistive tech reads as the box's text.
 * - No role:  see `UIAd.css` (why not an `<aside>`).
 ****************/
export class UIAd extends E.UIComponent<typeof adVocabulary> {
  @E.proto static vocabulary = adVocabulary
  @E.proto static styleSheets = { ad: adCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  protected get extraClasses(): string | undefined {
    return this.isTest ? TEST : undefined
  }

  render(): JSX.Element {
    return (
      <div
        class={this.rootClasses}
        part={this.partForName("ad")}
        data-text={this.isTest ? this.test || this.translationForKey("adTest") : undefined}
      >
        <slot />
      </div>
    )
  }

  /** Is `test` there, bare or with text? */
  private get isTest(): boolean {
    return this.test !== undefined
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIAd extends E.AttributeValues<typeof adVocabulary> {}

/** Fomantic's placeholder class word, on the box of a `test` ad. */
const TEST = "test"
