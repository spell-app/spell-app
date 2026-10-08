import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { loaderVocabulary } from "./ui-loader.vocabulary.en"
import { LoaderFallback } from "./ui-loader.fallback"
import { POLITE } from "./ui-loader.types"

import loaderCSS from "./ui-loader.css?inline"

/****************
 * ### `<ui-loader>`
 * A spinner, with optional text:  `<div class="ui … loader" part="loader"><slot></slot></div>`.
 * - The spinner is the root's `::before` / `::after`, decorative.
 * - The HOST is the live region, through internals:  `role=status`, `aria-live=polite` -- so it's announced
 *   wherever it's put, with nothing in the shadow root to find.  With no slotted text it's named by the
 *   `loading` text ("Loading…");  slotted text names it otherwise (a status takes its name from content).
 * - Shown only while `active` (Fomantic's rule, in `ui-loader.css`);  `:state(active)` / `:state(disabled)` are
 *   for page styling.
 * - Host is `display: contents`:  a centred loader is positioned against the nearest positioned ancestor in the
 *   flat tree, as Fomantic's `<div class="ui loader">` was.
 ****************/
export class UILoader extends E.UIElement<typeof loaderVocabulary> {
  @E.proto static vocabulary = loaderVocabulary
  @E.proto static styleSheets = { loader: loaderCSS }
  @E.proto static elementSetup = { Fallback: LoaderFallback, delegatesFocus: false }

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    const { internals } = this.host
    internals.role = UIT.STATUS
    internals.ariaLive = POLITE
  }

  ////////////////
  // ## The name
  ////////////////

  /** Light-DOM slot occupancy:  slotted text names the status. */
  readonly slots = new E.SlotContent(this.host)

  /** Has slotted text?  Tracked. */
  get hasText(): boolean {
    return this.slots.hasContent("")
  }

  /**
   * The host's accessible name:  the `loading` text while nothing is slotted.
   * - Waits for `isReady`:  the text reads `UI.i18n` (via `translationForKey()`), which exists once the runtime
   *   loads;  `writesHost`:  a server render (`$/ui/static`) applies it too.
   */
  @E.onChange("isReady", "hasText", { writesHost: true })
  protected onNameChanged(isReady: boolean, hasText: boolean) {
    const label = isReady && !hasText ? this.translationForKey("loading") : undefined
    // `null`:  `ariaLabel` is the platform's, and `null` removes it
    this.host.internals.ariaLabel = label ?? null
  }

  ////////////////
  // ## States
  ////////////////

  /** Shown (`active`).  `:state(active)`. */
  @E.cssState("active")
  get isActive(): boolean {
    return !!this.active
  }

  /**
   * Marked disabled (`disabled`, hides it again):  a look, not `isDisabled` -- the host's clicks aren't swallowed.
   * `:state(disabled)`.
   */
  @E.cssState("disabled")
  get looksDisabled(): boolean {
    return !!this.disabled
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("loader")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UILoader extends E.AttributeValues<typeof loaderVocabulary> {}
