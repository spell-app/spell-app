import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { imageVocabulary } from "./image.vocabulary.en"
import { ImageFallback } from "./image.fallback"

import imageCSS from "./image.css?inline"

/****************
 * ### `<ui-image>`
 * An image:  `<img class="ui … image" part="image" src alt width height loading>`;  with `href`, Fomantic's
 * wrapper form `<a class="ui … image" part="image" href><img part="img" …></a>`, the link carrying the classes.
 * - `alt` passes straight through:  `alt=""` is a decorative image (skipped by assistive tech), and a MISSING
 *   `alt` stays missing -- a bug to fix in the page, which axe reports, not one to hide with an empty default.
 *   A linked image's `alt` names the link.
 * - `width` / `height` are the native intrinsic size (reserve space before load);  `size` sets the rendered
 *   width.
 * - `disabled`:  a link loses its `href` and gets `aria-disabled`;  `:state(disabled)` for page styling.
 * - Host is `display: contents`:  the root IS the image box, so it floats and sits in text as Fomantic's did.
 ****************/
export class UIImage extends UIElement<typeof imageVocabulary> {
  @proto static vocabulary = imageVocabulary
  @proto static styles = { image: imageCSS }
  @proto static Fallback = ImageFallback

  isDisabled(): boolean {
    return this.attrs.disabled
  }

  protected hostStates() {
    return { disabled: this.attrs.disabled }
  }

  render(): JSX.Element {
    return (
      <Show when={this.attrs.href} fallback={this.image(this.classes(), "image")}>
        <a
          class={this.classes()}
          part={this.part("image")}
          href={this.attrs.disabled ? undefined : this.attrs.href}
          aria-disabled={this.attrs.disabled ? TRUE : undefined}
        >
          {this.image(undefined, "img")}
        </a>
      </Show>
    )
  }

  /** The `<img>`:  the root (classes, part `image`), or the link's child (part `img`). */
  private image(classes: string | undefined, part: "image" | "img"): JSX.Element {
    return (
      <img
        class={classes}
        part={this.part(part)}
        src={this.attrs.src}
        alt={this.attrs.alt}
        width={this.attrs.width}
        height={this.attrs.height}
        loading={this.attrs.loading as "eager" | "lazy" | undefined}
      />
    )
  }
}

/** ARIA boolean. */
const TRUE = "true"
