import type { JSX } from "@solidjs/web"

import { E } from "$/spell-solid"

import { brandBlobVocabulary } from "./BrandBlob.en"

import blobCSS from "./BrandBlob.css?inline"

/****************
 * ### `BrandBlob`
 * The component behind `<brand-blob>`:  page art, one soft shape in a corner of its positioned parent.
 *
 * - Its shadow DOM is one `<div part="blob">`, hanging past the parent's edges:
 *   the brand's "lavender blobs tucked into corners, never behind body text" (`readme.md`, "Backgrounds & motifs").
 * - The PARENT must be positioned and clip (`position: relative; overflow: hidden`), as every brand page's hero is.
 * - Size and overhang:  `--brand-blob-width` / `-height` / `-x` / `-y` (`BrandBlob.css`).
 * - Colours from the `spell-brand` theme's art roles (`--spell-blob` ...), so dark mode follows.
 * - Decorative:  `aria-hidden`, no pointer events.
 ****************/
export class BrandBlob extends E.UIComponent<typeof brandBlobVocabulary> {
  @E.proto static vocabulary = brandBlobVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { blob: blobCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  render(): JSX.Element {
    return (
      <div
        class={["blob", this.shape ?? "organic", this.corner ?? "bottom-right", `tone-${this.tone ?? "blob"}`]}
        part={this.partForName("blob")}
        aria-hidden="true"
      />
    )
  }
}

export interface BrandBlob extends E.AttributeValues<typeof brandBlobVocabulary> {}
