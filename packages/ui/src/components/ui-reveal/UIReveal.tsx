import { onSettled } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { revealVocabulary } from "./ui-reveal.vocabulary.en"
import { RevealFallback } from "./ui-reveal.fallback"
import { HIDDEN_CONTENT, VISIBLE_CONTENT } from "./ui-reveal.types"

import revealCSS from "./ui-reveal.css?inline"

/****************
 * ### `<ui-reveal>`
 * A reveal:  `<div class="ui ... reveal" part="reveal">` holding `<div class="visible content" part="visible">`
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
export class UIReveal extends E.UIElement<typeof revealVocabulary> {
  @E.proto static vocabulary = revealVocabulary
  @E.proto static styleSheets = { reveal: revealCSS }
  @E.proto static elementSetup = { Fallback: RevealFallback }

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
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

  ////////////////
  // ## The tab stop
  ////////////////

  /** The content (light DOM) has a natively focusable element of its own. */
  @E.state accessor contentHasFocusable = false

  /** Read the light DOM for focusable content now. */
  private scanFocusable() {
    this.contentHasFocusable = !!this.host.querySelector(FOCUSABLE)
  }

  /** Is the root the tab stop?  Not when the content can take focus itself, nor when disabled.  Tracked. */
  private get isTabStop(): boolean {
    return !this.contentHasFocusable && !this.disabled
  }

  ////////////////
  // ## States
  ////////////////

  /** Never reveals (`disabled`);  `:state(disabled)`. */
  @E.cssState("disabled")
  get isDisabled(): boolean {
    return this.disabled
  }

  /** Revealed by `active`:  `:state(active)`. */
  @E.cssState("active")
  get isActive(): boolean {
    return this.active
  }

  render(): JSX.Element {
    return (
      <div
        class={this.rootClasses}
        part={this.partForName("reveal")}
        tabindex={this.isTabStop ? 0 : undefined}
        role={this.isTabStop ? UIT.GROUP : undefined}
        aria-label={this.isTabStop ? (this.attributes[UIT.ARIA_LABEL] ?? undefined) : undefined}
      >
        <div class={VISIBLE_CONTENT} part={this.partForName("visible")}>
          <slot name={this.slotForName("visible")} />
          <slot />
        </div>
        <div class={HIDDEN_CONTENT} part={this.partForName("hidden")}>
          <slot name={this.slotForName("hidden")} />
        </div>
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIReveal extends E.AttributeValues<typeof revealVocabulary> {}

/** Natively focusable content:  it reveals the reveal itself (`:focus-within`). */
const FOCUSABLE =
  "a[href], area[href], button:not([disabled]), input:not([disabled], [type=hidden]), select:not([disabled]), " +
  "textarea:not([disabled]), summary, [contenteditable]:not([contenteditable=false]), [tabindex]:not([tabindex='-1'])"

/** Attributes that change what's focusable. */
const WATCHED = ["href", "disabled", "tabindex", "contenteditable", "type"]
