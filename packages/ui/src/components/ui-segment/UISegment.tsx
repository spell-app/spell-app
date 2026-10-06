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
  @E.proto static styles = { segment: segmentCSS }
  @E.proto static Fallback = SegmentFallback

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    const { internals } = this.host
    // SIDE EFFECT:  busy / disabled for assistive tech
    this.hostEffect(
      () => [this.attrs.loading, this.attrs.disabled] as const,
      ([isLoading, isDisabled]) => {
        internals.ariaBusy = isLoading ? UIT.TRUE : null
        internals.ariaDisabled = isDisabled ? UIT.TRUE : null
      }
    )
  }

  protected hostStates() {
    const { piled, inverted, loading, disabled } = this.attrs
    return { piled, inverted, loading, disabled }
  }

  render(): JSX.Element {
    return (
      <div
        class={this.classes()}
        part={this.part("segment")}
        tabindex={this.attrs.scrolling ? 0 : undefined}
        style={this.attrs.inverted ? { [UIT.PART_OWNER_TOKENS.inverted]: INVERTED } : undefined}
      >
        <slot />
        <Show when={this.attrs.loading}>
          <span class={UIT.VISUALLY_HIDDEN} role={UIT.STATUS}>
            {this.text("loading")}
          </span>
        </Show>
      </div>
    )
  }
}

/** `UIT.PART_OWNER_TOKENS.inverted` of an `inverted` segment, inline:  its parts take the dark scheme. */
const INVERTED = "1"
