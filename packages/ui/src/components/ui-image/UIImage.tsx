import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { imageVocabulary } from "./UIImage.en"

import imageCSS from "./UIImage.css?inline"

/****************
 * ### `UIImage`
 * The component behind `<ui-image>`:  an image, optionally a link.
 *
 * - Its shadow DOM is `<img class="ui … image" part="image" src alt width height loading>`;
 *   with `href`, Fomantic's wrapper form, `<a class="ui … image" part="image" href><img part="img" …></a>`,
 *   the link carrying the classes.
 *   The element is `display: contents`:  the inner box IS the image, so it floats and sits in text as Fomantic's did.
 *
 * - `alt` passes straight through:
 *   - `alt=""` is a decorative image (assistive tech skips it)
 *   - a MISSING `alt` stays missing:  a bug to fix in the page, which axe reports,
 *     not one to hide with an empty default
 *   - a linked image's `alt` names the link
 * - `width` / `height` are the native intrinsic size (they reserve space before it loads);
 *   `size` sets the drawn width.
 * - `disabled`:  unusable, the base class's way (`elementSetup.disabled`):
 *   faded, the image (or its link) inert, `aria-disabled`;  a link also loses its `href`.
 ****************/
export class UIImage extends E.UIComponent<typeof imageVocabulary> {
  @E.proto static vocabulary = imageVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { image: imageCSS },
    // `loading`:  Fomantic's placeholder look
    loading: "its own"
  } satisfies Partial<E.ElementSetup>

  render(): JSX.Element {
    return (
      <Show when={this.href} fallback={this.image("image")}>
        <a
          class={this.rootClass}
          part={this.partForName("image")}
          href={this.disabled ? undefined : this.href}
          aria-disabled={this.disabled ? "true" : undefined}
        >
          {this.image("img")}
        </a>
      </Show>
    )
  }

  /** The `<img>`:  the root (part `image`, with the classes), or the link's child (part `img`). */
  private image(part: "image" | "img"): JSX.Element {
    return (
      <img
        class={part === "image" ? this.rootClass : undefined}
        part={this.partForName(part)}
        src={this.src}
        alt={this.alt}
        width={this.width}
        height={this.height}
        loading={this.loading as "eager" | "lazy" | undefined}
      />
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIImage extends E.AttributeValues<typeof imageVocabulary> {}
