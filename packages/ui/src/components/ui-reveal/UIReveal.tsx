import { onSettled } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, HostAttribute, proto, UIElement } from "$/ui/core"

import { revealVocabulary } from "./ui-reveal.vocabulary.en"
import { RevealFallback } from "./ui-reveal.fallback"

import revealCSS from "./ui-reveal.css?inline"
import { WATCHED, FOCUSABLE, VISIBLE, HIDDEN } from "./ui-reveal.types"
import { ARIA_LABEL, GROUP } from "$/ui/components/components.types"

/****************
 * ### `<ui-reveal>`
 * A reveal:  `<div class="ui … reveal" part="reveal">` holding `<div class="visible content" part="visible">`
 * (`slot=visible`, then the default slot) over `<div class="hidden content" part="hidden">` (`slot=hidden`).
 * - Revealed on hover, on `active`, and on FOCUS (`:focus-within`, `ui-reveal.css`):  the root is a tab stop
 *   (`tabindex=0`, `role=group`, named by the host's `aria-label`) unless the content holds a natively focusable
 *   element (a link, a button, a field, `[tabindex]`), whose own focus reveals it -- no second stop.
 *   - NOTE: a focusable CUSTOM element in the content (`<ui-button>`) isn't detected (its control renders later,
 *     in its own shadow root):  the reveal keeps its stop then.
 * - Both contents stay in the accessibility tree:  "hidden" is visual only (the hidden content is under the
 *   visible one), so assistive tech reads both, in order, at any time.
 * - `prefers-reduced-motion`:  the swap is instant (`ui-reveal.css`).
 ****************/
export class UIReveal extends UIElement<typeof revealVocabulary> {
  @proto static vocabulary = revealVocabulary
  @proto static styles = { reveal: revealCSS }
  @proto static Fallback = RevealFallback

  /** The content (light DOM) has a natively focusable element of its own. */
  readonly hasFocusable = new Cell(false)

  /** Host `aria-label`, forwarded to the root while it is the tab stop. */
  readonly ariaLabel = new HostAttribute({ host: this.host, name: ARIA_LABEL })

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    if (isServer) return
    // SIDE EFFECT:  watches the light DOM for focusable content, from the first settle on
    onSettled(() => {
      const observer = new MutationObserver(() => this.scanFocusable())
      observer.observe(this.host, { childList: true, subtree: true, attributeFilter: WATCHED })
      this.scanFocusable()
      return () => observer.disconnect()
    })
  }

  isDisabled(): boolean {
    return this.attrs.disabled
  }

  protected hostStates() {
    return { active: this.attrs.active, disabled: this.attrs.disabled }
  }

  /** Read the light DOM for focusable content now.  MUST NOT run in an owned scope (it writes a signal). */
  private scanFocusable() {
    this.hasFocusable.set(!!this.host.querySelector(FOCUSABLE))
  }

  /** Is the root the tab stop?  Not when the content can take focus itself, nor when disabled.  Tracked. */
  private isStop(): boolean {
    return !this.hasFocusable.get() && !this.attrs.disabled
  }

  render(): JSX.Element {
    return (
      <div
        class={this.classes()}
        part={this.part("reveal")}
        tabindex={this.isStop() ? 0 : undefined}
        role={this.isStop() ? GROUP : undefined}
        aria-label={this.isStop() ? this.ariaLabel.get() : undefined}
      >
        <div class={VISIBLE} part={this.part("visible")}>
          <slot name={this.slot("visible")} />
          <slot />
        </div>
        <div class={HIDDEN} part={this.part("hidden")}>
          <slot name={this.slot("hidden")} />
        </div>
      </div>
    )
  }
}
