import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { imagesVocabulary } from "./UIImages.en"

import imageCSS from "./UIImage.css?inline"

/****************
 * ### `UIImages`
 * The component behind `<ui-images>`:  a group of images in one wrapping row.
 *
 * - Its shadow DOM is one box, `<div class="ui … images" part="group">`, around a slot for the images.
 * - `UIImage.css` hands the group's look (size, border, radius, spacing) to each child,
 *   through `--_ui-images-*` tokens:  a `display: contents` `<ui-image>` takes no box styles from `::slotted()`.
 ****************/
export class UIImages extends E.UIComponent<typeof imagesVocabulary> {
  @E.proto static vocabulary = imagesVocabulary
  @E.proto static styleSheets = { image: imageCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("group")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIImages extends E.AttributeValues<typeof imagesVocabulary> {}
