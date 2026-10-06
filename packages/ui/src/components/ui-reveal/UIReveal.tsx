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
  @E.proto static styles = { reveal: revealCSS }
  @E.proto static Fallback = RevealFallback

  /** The content (light DOM) has a natively focusable element of its own. */
  readonly hasFocusable = new E.Cell(false)

  /** Host `aria-label`, forwarded to the root while it is the tab stop. */
  readonly ariaLabel = new E.HostAttribute({ host: this.host, name: UIT.ARIA_LABEL })

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

  isDisabled(): boolean {
    return this.attrs.disabled
  }

  protected hostStates() {
    return { active: this.attrs.active, disabled: this.attrs.disabled }
  }

  render(): JSX.Element {
    return (
      <div
        class={this.classes()}
        part={this.part("reveal")}
        tabindex={this.isStop() ? 0 : undefined}
        role={this.isStop() ? UIT.GROUP : undefined}
        aria-label={this.isStop() ? this.ariaLabel.get() : undefined}
      >
        <div class={VISIBLE_CONTENT} part={this.part("visible")}>
          <slot name={this.slot("visible")} />
          <slot />
        </div>
        <div class={HIDDEN_CONTENT} part={this.part("hidden")}>
          <slot name={this.slot("hidden")} />
        </div>
      </div>
    )
  }

  /** Read the light DOM for focusable content now.  MUST NOT run in an owned scope (it writes a signal). */
  private scanFocusable() {
    this.hasFocusable.set(!!this.host.querySelector(FOCUSABLE))
  }

  /** Is the root the tab stop?  Not when the content can take focus itself, nor when disabled.  Tracked. */
  private isStop(): boolean {
    return !this.hasFocusable.get() && !this.attrs.disabled
  }
}

/** Natively focusable content:  it reveals the reveal itself (`:focus-within`). */
const FOCUSABLE =
  "a[href], area[href], button:not([disabled]), input:not([disabled], [type=hidden]), select:not([disabled]), " +
  "textarea:not([disabled]), summary, [contenteditable]:not([contenteditable=false]), [tabindex]:not([tabindex='-1'])"

/** Attributes that change what's focusable. */
const WATCHED = ["href", "disabled", "tabindex", "contenteditable", "type"]
