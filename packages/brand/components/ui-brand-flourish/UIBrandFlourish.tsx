import { createEffect, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { Cell, proto, UIComponent, type ElementSetup } from "$/ui/core"

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
export class UIBrandFlourish extends UIComponent<BrandFlourishVocabulary> {
  @proto static vocabulary = brandFlourishVocabulary
  @proto static styleSheets = { flourish: flourishCSS }
  @proto static elementSetup = { delegatesFocus: false } satisfies Partial<ElementSetup>

  /** The element's size, px, as last measured. */
  readonly size = new Cell<{ width: number; height: number }>(FALLBACK_SIZE)

  /** The `<svg>`'s inner markup. */
  readonly art = createMemo(() => {
    const { width, height } = this.size.get()
    const colors = {
      stroke: this.attrs.stroke || DEFAULT_COLORS.stroke,
      fill: this.attrs.fill || DEFAULT_COLORS.fill,
      fill2: this.attrs.fill2 || DEFAULT_COLORS.fill2,
      weight: this.attrs.weight ?? DEFAULT_WEIGHT
    }
    const variant = (this.attrs.variant ?? "swoop") as FlourishVariant
    return Flourish.draw(variant, width, height, this.attrs.seed ?? DEFAULT_SEED, colors)
  })

  render(): JSX.Element {
    this.effects()
    return (
      <svg
        class="art"
        part={this.partForName("art")}
        viewBox={`0 0 ${this.size.get().width} ${this.size.get().height}`}
        aria-hidden="true"
        innerHTML={this.art()}
      />
    )
  }

  /** While connected:  measure the element, and again on every resize. */
  private effects() {
    createEffect(
      () => this.isConnected,
      (connected) => {
        if (!connected) return undefined
        const resizes = new ResizeObserver(() => {
          const { width, height } = this.domElement.getBoundingClientRect()
          if (width && height) this.size.set({ width, height })
        })
        resizes.observe(this.domElement)
        return () => resizes.disconnect()
      }
    )
  }
}
