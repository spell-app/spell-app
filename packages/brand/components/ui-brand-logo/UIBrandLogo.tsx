import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { brandLogoVocabulary } from "./UIBrandLogo.en"

import logoCSS from "./UIBrandLogo.css?inline"

/****************
 * ### `UIBrandLogo`
 * The component behind `<ui-brand-logo>`:  the Spell logo, the hat mark or a lockup (mark + wordmark).
 *
 * - Its shadow DOM is an inline `<svg part="logo">`, outlined from P052 (no font needed),
 *   with `fill: currentColor`, so `tone` (or the page's `color`, with `tone="current"`) colours it.
 * - Height:  `--ui-brand-logo-height` (default `2em`);  the width follows the outline's proportions.
 * - The outlines are their own module (`logoPaths.ts`, ~58 KB), `import()`ed on first use:
 *   the component draws nothing until it lands (a frame).
 * - Named `Spell` / `Spell App` (`role="img"`);  `label=""` makes it decorative (`aria-hidden`).
 ****************/
export class UIBrandLogo extends E.UIComponent<typeof brandLogoVocabulary> {
  @E.proto static vocabulary = brandLogoVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { logo: logoCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** The outlines, once loaded:  `undefined` until then. */
  @E.state accessor paths: typeof import("./logoPaths") | undefined = undefined

  /**
   * Loads the outlines (once per page:  the module is cached);  settles once `paths` is set.
   * - the write lands in a promise callback, never a render
   */
  readonly outlines = import("./logoPaths").then((paths) => {
    this.paths = paths
  })

  /** What to draw:  the viewBox, and either a path (the mark) or SVG markup (a lockup). */
  @E.derived
  get shape() {
    const paths = this.paths
    if (!paths) return undefined
    const lockup = LOCKUP_OF[this.variant ?? "mark"]
    if (!lockup) return { vb: paths.MARK.vb, d: paths.MARK.d, body: undefined }
    const { vb, body } = paths.LOCKUPS[lockup]!
    return { vb, d: undefined, body }
  }

  /** The accessible name:  `label`, else the logo's;  `""`:  none (decorative). */
  get name(): string {
    if (this.label !== undefined) return this.label
    return this.translationForKey(this.variant === "app" ? "spellApp" : "spell")
  }

  render(): JSX.Element {
    return (
      <Show when={this.shape}>
        {(shape) => (
          <svg
            class={["logo", this.tone ?? "ink"]}
            part={this.partForName("logo")}
            viewBox={shape().vb}
            role={this.name ? "img" : undefined}
            aria-label={this.name || undefined}
            aria-hidden={this.name ? undefined : "true"}
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

export interface UIBrandLogo extends E.AttributeValues<typeof brandLogoVocabulary> {}

/** A `variant` -> its lockup in `logoPaths.ts` (`mark` draws `MARK` instead). */
const LOCKUP_OF: Readonly<Record<string, string>> = {
  lockup: "spell-lockup",
  tagline: "spell-lockup-tagline",
  app: "spell-app-lockup"
}
