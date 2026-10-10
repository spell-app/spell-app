import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { brandFlourishVocabulary } from "./UIBrandFlourish.en"
import { Flourish } from "./Flourish"
import {
  DEFAULT_COLORS,
  DEFAULT_SEED,
  DEFAULT_WEIGHT,
  FALLBACK_SIZE,
  type BrandFlourishVocabulary,
  type FlourishVariant
} from "./UIBrandFlourish.types"

import flourishCSS from "./UIBrandFlourish.css?inline"

/****************
 * ### `UIBrandFlourish`
 * The component behind `<ui-brand-flourish>`:  page art (a swoop, blobs, curls …) behind its parent's content.
 *
 * - Its shadow DOM is one `<svg part="art">`, drawn by `Flourish`, filling the element,
 *   which fills its positioned parent (`position: absolute; inset: 0`, under the content, no pointer events).
 * - It draws again when the box resizes (`ResizeObserver`) or an attribute changes;
 *   the same seed draws the same art.
 * - Colours:  `stroke` / `fill` / `fill2`, else the tokens `--ui-brand-flourish-stroke` / `-fill` / `-fill-2`,
 *   else the `spell-brand` theme's art roles (`--spell-line-flourish`, `--spell-blob`, `--spell-blob-2`),
 *   so dark mode follows.
 * - Decorative:  `aria-hidden`.
 * - SIDE EFFECT:  watches the element's size while connected.
 ****************/
export class UIBrandFlourish extends E.UIComponent<BrandFlourishVocabulary> {
  @E.proto static vocabulary = brandFlourishVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { flourish: flourishCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** The element's size, px, as last measured. */
  @E.state accessor size: { width: number; height: number } = FALLBACK_SIZE

  /** The `<svg>`'s inner markup. */
  @E.derived
  get art(): string {
    const { width, height } = this.size
    const colors = {
      stroke: this.stroke || DEFAULT_COLORS.stroke,
      fill: this.fill || DEFAULT_COLORS.fill,
      fill2: this.fill2 || DEFAULT_COLORS.fill2,
      weight: this.weight ?? DEFAULT_WEIGHT
    }
    const variant = (this.variant ?? "swoop") as FlourishVariant
    return Flourish.draw(variant, width, height, this.seed ?? DEFAULT_SEED, colors)
  }

  render(): JSX.Element {
    return (
      <svg
        class="art"
        part={this.partForName("art")}
        viewBox={`0 0 ${this.size.width} ${this.size.height}`}
        aria-hidden="true"
        innerHTML={this.art}
      />
    )
  }

  /** While connected:  measure the element, and again on every resize (no decorator watches a size). */
  @E.whileConnected
  protected measure() {
    const resizes = new ResizeObserver(() => {
      const { width, height } = this.domElement.getBoundingClientRect()
      if (width && height) this.size = { width, height }
    })
    resizes.observe(this.domElement)
    return () => resizes.disconnect()
  }
}

export interface UIBrandFlourish extends E.AttributeValues<BrandFlourishVocabulary> {}
