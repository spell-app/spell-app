import type { JSX } from "@solidjs/web"

import { proto, UIElement, UIT } from "$/ui/core"

import { brandBlobVocabulary } from "./ui-brand-blob.vocabulary.en"
import { BrandBlobFallback } from "./ui-brand-blob.fallback"
import type { BrandBlobVocabulary } from "./ui-brand-blob.types"

import blobCSS from "./ui-brand-blob.css?inline"

/****************
 * ### `<ui-brand-blob>`
 * One soft shape (`<div part="blob">`) in a corner of its positioned parent, hanging past the edges:  the brand's
 * "lavender blobs tucked into corners, never behind body text" (`readme.md`, "Backgrounds & motifs").
 * - The PARENT must be positioned and clip (`position: relative; overflow: hidden`), as every brand page's hero is.
 * - Size and overhang:  `--ui-brand-blob-width` / `-height` / `-x` / `-y` (`ui-brand-blob.css`).
 * - Colours from the `spell-brand` theme's art roles (`--spell-blob` ...), so dark mode follows.
 * - Decorative:  `aria-hidden`, no pointer events.
 ****************/
export class UIBrandBlob extends UIElement<BrandBlobVocabulary> {
  @proto static vocabulary = brandBlobVocabulary
  @proto static styles = { blob: blobCSS }
  @proto static Fallback = BrandBlobFallback
  @proto static delegatesFocus = false

  render(): JSX.Element {
    return (
      <div
        class={[
          "blob",
          this.attrs.shape ?? "organic",
          this.attrs.corner ?? "bottom-right",
          `tone-${this.attrs.tone ?? "blob"}`
        ]}
        part={this.part("blob")}
        aria-hidden={UIT.TRUE}
      />
    )
  }
}
