import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { ImageFallback } from "./ui-image.fallback"
import { imagesVocabulary } from "./ui-images.vocabulary.en"

import imageCSS from "./ui-image.css?inline"

/****************
 * ### `<ui-images>`
 * A group of images in one wrapping row:  `<div class="ui … images" part="group"><slot></slot></div>`.
 * - `ui-image.css` hands the group look (size, border, radius, spacing) to each child through `--_ui-images-*`
 *   tokens:  a `display: contents` image host takes no box styles from `::slotted()`.
 ****************/
export class UIImages extends E.UIElement<typeof imagesVocabulary> {
  @E.proto static vocabulary = imagesVocabulary
  @E.proto static styleSheets = { image: imageCSS }
  @E.proto static elementSetup = { Fallback: ImageFallback, delegatesFocus: false }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("group")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIImages extends E.AttributeValues<typeof imagesVocabulary> {}
