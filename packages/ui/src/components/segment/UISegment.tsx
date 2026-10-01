import { Show, createEffect } from "solid-js"
import type { JSX } from "@solidjs/web"

import { PART_OWNER_TOKENS, proto, UIElement } from "$/ui/core"

import { segmentVocabulary } from "./segment.vocabulary.en"
import { SegmentFallback } from "./segment.fallback"

import segmentCSS from "./segment.css?inline"

/****************
 * ### `<ui-segment>`
 * A segment:  `<div class="ui … segment" part="segment"><slot></slot></div>`.
 * - OWNER side:  declares `--ui-inverted` on its root, default included (`0`), so parts inside a plain segment
 *   nested in an inverted one don't inherit the outer segment's `1` (`parts.css` "Owner tokens").  `inverted`
 *   itself (`1`, `color-scheme: dark`) comes from `segment.css`.
 * - `:state(piled)`:  the host becomes the stacking context the rotated sheets sit behind.
 * - `scrolling`:  the root is a keyboard stop (`tabindex=0`), as every scrollable region must be.
 * - `loading`:  `aria-busy` (internals) and a visually hidden `role=status` "Loading…";  `disabled`:
 *   `aria-disabled`.
 ****************/
export class UISegment extends UIElement<typeof segmentVocabulary> {
  @proto static vocabulary = segmentVocabulary
  @proto static styles = { segment: segmentCSS }
  @proto static Fallback = SegmentFallback

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    const { internals } = this.host
    createEffect(
      () => [this.attrs.loading, this.attrs.disabled] as const,
      ([loading, disabled]) => {
        internals.ariaBusy = loading ? TRUE : null
        internals.ariaDisabled = disabled ? TRUE : null
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
        style={{ [PART_OWNER_TOKENS.inverted]: this.attrs.inverted ? "1" : "0" }}
      >
        <slot />
        <Show when={this.attrs.loading}>
          <span class={VISUALLY_HIDDEN} role={STATUS}>
            {this.text("loading")}
          </span>
        </Show>
      </div>
    )
  }
}

/** ARIA boolean. */
const TRUE = "true"

/** Utility class (`utilities.css`, adopted in every root) for the loading announcement. */
const VISUALLY_HIDDEN = "ui-visually-hidden-force"

/** Role of the loading announcement. */
const STATUS = "status"
