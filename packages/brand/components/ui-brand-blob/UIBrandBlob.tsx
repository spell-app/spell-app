import type { JSX } from "@solidjs/web"

import { proto, protoMerged, UIComponent, type ElementSetup, type AttributeValues } from "$/ui/core"

import { brandBlobVocabulary } from "./UIBrandBlob.en"

import blobCSS from "./UIBrandBlob.css?inline"

/****************
 * ### `UIBrandBlob`
 * The component behind `<ui-brand-blob>`:  page art, one soft shape in a corner of its positioned parent.
 *
 * - Its shadow DOM is one `<div part="blob">`, hanging past the parent's edges:
 *   the brand's "lavender blobs tucked into corners, never behind body text" (`readme.md`, "Backgrounds & motifs").
 * - The PARENT must be positioned and clip (`position: relative; overflow: hidden`), as every brand page's hero is.
 * - Size and overhang:  `--ui-brand-blob-width` / `-height` / `-x` / `-y` (`UIBrandBlob.css`).
 * - Colours from the `spell-brand` theme's art roles (`--spell-blob` ...), so dark mode follows.
 * - Decorative:  `aria-hidden`, no pointer events.
 ****************/
export class UIBrandBlob extends UIComponent<typeof brandBlobVocabulary> {
  @proto static vocabulary = brandBlobVocabulary
  @protoMerged static elementSetup = {
    styleSheets: { blob: blobCSS },
    delegatesFocus: false
  } satisfies Partial<ElementSetup>

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

export interface UIBrandBlob extends AttributeValues<typeof brandBlobVocabulary> {}
