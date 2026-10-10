import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { segmentVocabulary } from "./UISegment.en"

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
 * - `disabled`:  unusable, the base class's way (`elementSetup.disabled`):  faded, its content inert,
 *   `aria-disabled`.
 ****************/
export class UISegment extends E.UIComponent<typeof segmentVocabulary> {
  @E.proto static vocabulary = segmentVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { segment: segmentCSS },
    cssStates: ["piled", "inverted"],
    // `loading`:  Fomantic's veil
    loading: "its own"
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## States
  ////////////////

  /** Loading (`loading`):  `:state(loading)` and `aria-busy`. */
  @E.cssState("loading")
  @E.aria("busy")
  get isLoading(): boolean {
    return !!this.loading
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div
        class={this.rootClass}
        part={this.partForName("segment")}
        tabindex={this.scrolling ? 0 : undefined}
        style={this.inverted ? { [UIT.PartOwnerTokens.inverted]: INVERTED } : undefined}
      >
        <slot />
        <Show when={this.loading}>
          <span class={UIT.VISUALLY_HIDDEN} role="status">
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
