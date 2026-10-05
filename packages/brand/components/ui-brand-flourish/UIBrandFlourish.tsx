import { createEffect, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { Cell, proto, UIElement, UIT } from "$/ui/core"

import { brandFlourishVocabulary } from "./ui-brand-flourish.vocabulary.en"
import { BrandFlourishFallback } from "./ui-brand-flourish.fallback"
import { Flourish } from "./Flourish"
import {
  DEFAULT_COLORS,
  DEFAULT_SEED,
  DEFAULT_WEIGHT,
  FALLBACK_SIZE,
  type BrandFlourishVocabulary,
  type FlourishVariant
} from "./ui-brand-flourish.types"

import flourishCSS from "./ui-brand-flourish.css?inline"

/****************
 * ### `<ui-brand-flourish>`
 * Page art:  an `<svg part="art">` drawn by `Flourish`, filling the host, which fills its positioned parent
 * (`position: absolute; inset: 0`, under the content, no pointer events).
 * - Redraws when the box resizes (`ResizeObserver`) or an attribute changes;  the same seed draws the same art.
 * - Colours:  `stroke` / `fill` / `fill2`, else the tokens `--ui-brand-flourish-stroke` / `-fill` / `-fill-2`, else the
 *   `spell-brand` theme's art roles (`--spell-line-flourish`, `--spell-blob`, `--spell-blob-2`), so dark mode follows.
 * - Decorative:  `aria-hidden`.
 * - SIDE EFFECT:  observes the host's size while connected.
 ****************/
export class UIBrandFlourish extends UIElement<BrandFlourishVocabulary> {
  @proto static vocabulary = brandFlourishVocabulary
  @proto static styles = { flourish: flourishCSS }
  @proto static Fallback = BrandFlourishFallback
  @proto static delegatesFocus = false

  /** The host's size, px, as last measured. */
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
        part={this.part("art")}
        viewBox={`0 0 ${this.size.get().width} ${this.size.get().height}`}
        aria-hidden={UIT.TRUE}
        innerHTML={this.art()}
      />
    )
  }

  /** While connected:  measure the host, again on every resize. */
  private effects() {
    createEffect(
      () => this.connected.get(),
      (connected) => {
        if (!connected) return undefined
        const resizes = new ResizeObserver(() => {
          const { width, height } = this.host.getBoundingClientRect()
          if (width && height) this.size.set({ width, height })
        })
        resizes.observe(this.host)
        return () => resizes.disconnect()
      }
    )
  }
}
