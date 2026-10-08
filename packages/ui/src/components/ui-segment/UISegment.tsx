import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { segmentVocabulary } from "./ui-segment.vocabulary.en"
import { SegmentFallback } from "./ui-segment.fallback"

import segmentCSS from "./ui-segment.css?inline"

/****************
 * ### `<ui-segment>`
 * A segment:  `<div class="ui ... segment" part="segment"><slot></slot></div>`.
 * - OWNER side:  declares `--ui-inverted` on its root, default included (`0`), so parts inside a plain segment
 *   nested in an inverted one don't inherit the outer segment's `1` (`ui-parts.css` "Owner tokens").  Inline only
 *   when `inverted` (`1`):  the sheet declares the `0`, or `1` for a member of an `<ui-segments inverted>`, which an
 *   inline `0` would beat.  `inverted` itself (`color-scheme: dark`) comes from `ui-segment.css`.
 * - `:state(piled)`:  the host becomes the stacking context the rotated sheets sit behind.
 * - `scrolling`:  the root is a keyboard stop (`tabindex=0`), as every scrollable region must be.
 * - `loading`:  `aria-busy` (internals) and a visually hidden `role=status` "Loading…";  `disabled`:
 *   `aria-disabled`.
 ****************/
export class UISegment extends E.UIElement<typeof segmentVocabulary> {
  @E.proto static vocabulary = segmentVocabulary
  @E.proto static styleSheets = { segment: segmentCSS }
  @E.proto static elementSetup = { Fallback: SegmentFallback }

  ////////////////
  // ## States
  ////////////////

  /** Piled sheets (`piled`).  `:state(piled)`. */
  @E.cssState("piled")
  get isPiled(): boolean {
    return !!this.piled
  }

  /** The dark scheme (`inverted`).  `:state(inverted)`. */
  @E.cssState("inverted")
  get isInverted(): boolean {
    return !!this.inverted
  }

  /** Loading (`loading`).  `:state(loading)`. */
  @E.cssState("loading")
  get isLoading(): boolean {
    return !!this.loading
  }

  /**
   * Marked disabled (`disabled`):  a look, not `isDisabled` -- the host still takes clicks (its content's links).
   * `:state(disabled)`.
   */
  @E.cssState("disabled")
  get looksDisabled(): boolean {
    return !!this.disabled
  }

  /** SIDE EFFECT:  busy / disabled for assistive tech. */
  @E.onChange("loading", "disabled", { writesHost: true })
  protected onBusyOrDisabledChanged(isLoading: boolean | undefined, isDisabled: boolean | undefined) {
    const { internals } = this.host
    internals.ariaBusy = isLoading ? UIT.TRUE : null
    internals.ariaDisabled = isDisabled ? UIT.TRUE : null
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div
        class={this.rootClasses}
        part={this.partForName("segment")}
        tabindex={this.scrolling ? 0 : undefined}
        style={this.inverted ? { [UIT.PartOwnerTokens.inverted]: INVERTED } : undefined}
      >
        <slot />
        <Show when={this.loading}>
          <span class={UIT.VISUALLY_HIDDEN} role={UIT.STATUS}>
            {this.translationForKey("loading")}
          </span>
        </Show>
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UISegment extends E.AttributeValues<typeof segmentVocabulary> {}

/** `UIT.PartOwnerTokens.inverted` of an `inverted` segment, inline:  its parts take the dark scheme. */
const INVERTED = "1"
