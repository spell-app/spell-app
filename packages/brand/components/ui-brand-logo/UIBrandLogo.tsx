import { Show, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { Cell, proto, UIElement, UIT } from "$/ui/core"

import { brandLogoVocabulary } from "./ui-brand-logo.vocabulary.en"
import { BrandLogoFallback } from "./ui-brand-logo.fallback"
import { LOCKUP_OF, type BrandLogoVocabulary } from "./ui-brand-logo.types"

import logoCSS from "./ui-brand-logo.css?inline"

/****************
 * ### `<ui-brand-logo>`
 * The Spell logo as an inline `<svg part="logo">`, outlined from P052 (no font needed), `fill: currentColor`, so
 * `tone` (or the page's `color`, with `tone="current"`) colours it.
 * - Height:  `--ui-brand-logo-height` (default `2em`);  the width follows the outline's proportions.
 * - The outlines are their own module (`logoPaths.ts`, ~58 KB), `import()`ed on first use:  the element draws
 *   nothing until it lands (a frame).
 * - Named `Spell` / `Spell App` (`role="img"`);  `label=""` makes it decorative (`aria-hidden`).
 ****************/
export class UIBrandLogo extends UIElement<BrandLogoVocabulary> {
  @proto static vocabulary = brandLogoVocabulary
  @proto static styles = { logo: logoCSS }
  @proto static Fallback = BrandLogoFallback
  @proto static delegatesFocus = false

  /** The outlines, once loaded:  `undefined` until then. */
  readonly paths = new Cell<typeof import("./logoPaths") | undefined>(undefined)

  /**
   * Loads the outlines (once per page:  the module is cached);  settles once `paths` is set.
   * - the write lands in a promise callback, never a render
   */
  readonly outlines = import("./logoPaths").then((paths) => this.paths.set(paths))

  /** What to draw:  the viewBox, and either a path (the mark) or SVG markup (a lockup). */
  readonly shape = createMemo(() => {
    const paths = this.paths.get()
    if (!paths) return undefined
    const lockup = LOCKUP_OF[this.attrs.variant ?? "mark"]
    if (!lockup) return { vb: paths.MARK.vb, d: paths.MARK.d, body: undefined }
    const { vb, body } = paths.LOCKUPS[lockup]!
    return { vb, d: undefined, body }
  })

  /** The accessible name:  `label`, else the logo's;  `""`:  none (decorative). */
  readonly name = createMemo(() => {
    if (this.attrs.label !== undefined) return this.attrs.label
    return this.text(this.attrs.variant === "app" ? "spellApp" : "spell")
  })

  render(): JSX.Element {
    return (
      <Show when={this.shape()}>
        {(shape) => (
          <svg
            class={["logo", this.attrs.tone ?? "ink"]}
            part={this.part("logo")}
            viewBox={shape().vb}
            role={this.name() ? "img" : undefined}
            aria-label={this.name() || undefined}
            aria-hidden={this.name() ? undefined : UIT.TRUE}
          >
            <Show when={shape().d} fallback={<g innerHTML={shape().body} />}>
              <path d={shape().d} />
            </Show>
          </svg>
        )}
      </Show>
    )
  }
}
