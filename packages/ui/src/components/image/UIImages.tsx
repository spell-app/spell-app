import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/core"

import { imagesVocabulary } from "./image.vocabulary.en"
import { ImageFallback } from "./image.fallback"

import imageCSS from "./image.css?inline"

/****************
 * ### `<ui-images>`
 * A group of images in one wrapping row:  `<div class="ui … images" part="group"><slot></slot></div>`.
 * - `image.css` hands the group look (size, border, radius, spacing) to each child through `--_ui-images-*`
 *   tokens:  a `display: contents` image host takes no box styles from `::slotted()`.
 ****************/
export class UIImages extends UIElement<typeof imagesVocabulary> {
  @proto static vocabulary = imagesVocabulary
  @proto static styles = { image: imageCSS }
  @proto static Fallback = ImageFallback
  @proto static delegatesFocus = false

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("group")}>
        <slot />
      </div>
    )
  }
}
