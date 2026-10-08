import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { segmentVocabulary } from "./UISegment.vocabulary.en"

import segmentCSS from "./UISegment.css?inline"

/****************
 * ### `UISegment`
 * The component behind `<ui-segment>`:  a box that groups related content on a page.
 *
 * - Its shadow DOM is one box, `<div class="ui … segment" part="segment">`, around a slot for the content.
 *
 * - As an OWNER, it declares `--ui-inverted` on its box, `0` included,
 *   so the parts inside a plain segment nested in an inverted one don't inherit the outer segment's `1`
 *   (`UIParts.css`, "Owner tokens").
 *   - Inline only when `inverted` (`1`):  the sheet declares the `0`,
 *     or `1` for a member of an `<ui-segments inverted>`, which an inline `0` would beat.
 *   - `inverted` itself (`color-scheme: dark`) comes from `UISegment.css`.
 *
 * - `:state(piled)`:  the element becomes the stacking context the rotated sheets sit behind.
 * - `scrolling`:  the box is a keyboard stop (`tabindex=0`), as every scrollable region must be.
 * - `loading`:  `aria-busy` (through `internals`) and a visually hidden `role=status` "Loading…".
 * - `disabled`:  `aria-disabled`.
 ****************/
export class UISegment extends E.UIComponent<typeof segmentVocabulary> {
  @E.proto static vocabulary = segmentVocabulary
  @E.proto static styleSheets = { segment: segmentCSS }

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
   * Marked disabled (`disabled`):  only a look, not `isDisabled`,
   * so the element still takes clicks (its content's links).
   * `:state(disabled)`.
   */
  @E.cssState("disabled")
  get looksDisabled(): boolean {
    return !!this.disabled
  }

  /** SIDE EFFECT:  busy / disabled for assistive tech. */
  @E.onChange("loading", "disabled", { writesDOMElement: true })
  protected onBusyOrDisabledChanged(isLoading: boolean | undefined, isDisabled: boolean | undefined) {
    const { internals } = this.domElement
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

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UISegment extends E.AttributeValues<typeof segmentVocabulary> {}

/** `UIT.PartOwnerTokens.inverted` of an `inverted` segment, inline:  its parts take the dark scheme. */
const INVERTED = "1"
