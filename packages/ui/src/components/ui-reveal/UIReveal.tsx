import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { revealVocabulary } from "./UIReveal.en"

import revealCSS from "./UIReveal.css?inline"

/**
 * Attributes that change what's focusable.
 * - Above the class:  `@watches` reads it while the class is defined.
 */
const WATCHED = ["href", "disabled", "tabindex", "contenteditable", "type"]

/****************
 * ### `UIReveal`
 * The component behind `<ui-reveal>`:  content that gives way to other content on hover or focus.
 * Its shadow DOM:
 * `<div class="ui … reveal" part="reveal">` holding `<div class="visible content" part="visible">`
 * (`slot=visible`, then the default slot) over `<div class="hidden content" part="hidden">` (`slot=hidden`).
 *
 * - Revealed on hover, on `active`, and on FOCUS (`:focus-within`, `UIReveal.css`).
 *   - The root is a tab stop (`tabindex=0`, `role=group`, named by the DOM element's `aria-label`),
 *     unless the content holds a natively focusable element (a link, a button, a field, `[tabindex]`),
 *     whose own focus reveals it:  no second stop.
 *   - NOTE: a focusable CUSTOM element in the content (`<ui-button>`) isn't detected
 *     (its control draws later, in its own shadow root):  the reveal keeps its stop then.
 * - Both contents stay in the accessibility tree:
 *   "hidden" is visual only (the hidden content is under the visible one),
 *   so assistive tech reads both, in order, at any time.
 * - `prefers-reduced-motion`:  the swap is instant (`UIReveal.css`).
 ****************/
export class UIReveal extends E.UIComponent<typeof revealVocabulary> {
  @E.proto static vocabulary = revealVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { reveal: revealCSS },
    cssStates: ["active"],
    // `disabled`:  it never reveals
    disabled: "its own"
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## The tab stop
  ////////////////

  /** The content (light DOM) has a natively focusable element of its own;  follows it.  Never on a server. */
  @E.watches({ childList: true, subtree: true, attributeFilter: WATCHED })
  get contentHasFocusable(): boolean {
    return !isServer && !!this.domElement.querySelector(FOCUSABLE)
  }

  /**
   * Is the root the tab stop?  Not when the content can take focus itself, nor when disabled.
   * - Tracked.
   */
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

  render(): JSX.Element {
    return (
      <div
        class={this.rootClass}
        part={this.partForName("reveal")}
        tabindex={this.isTabStop ? 0 : undefined}
        role={this.isTabStop ? "group" : undefined}
        aria-label={this.isTabStop ? (this.attributes["aria-label"] ?? undefined) : undefined}
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

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIReveal extends E.AttributeValues<typeof revealVocabulary> {}

/** The class words of the visible content box (part and slot `visible`:  `UIT.VISIBLE`). */
const VISIBLE_CONTENT = "visible content"

/** The class words of the hidden content box. */
const HIDDEN_CONTENT = "hidden content"

/** Natively focusable content:  it reveals the reveal itself (`:focus-within`). */
const FOCUSABLE =
  "a[href], area[href], button:not([disabled]), input:not([disabled], [type=hidden]), select:not([disabled]), " +
  "textarea:not([disabled]), summary, [contenteditable]:not([contenteditable=false]), [tabindex]:not([tabindex='-1'])"
