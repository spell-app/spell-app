import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { loaderVocabulary } from "./UILoader.en"

import loaderCSS from "./UILoader.css?inline"

/****************
 * ### `UILoader`
 * The component behind `<ui-loader>`:  a spinner, with optional text, showing that something is loading.
 *
 * - Its shadow DOM is one box, `<div class="ui … loader" part="loader">`, around a slot for the text.
 *   The spinner is the box's `::before` / `::after`, decorative.
 * - The element is `display: contents`:  a centred loader is positioned against the nearest positioned ancestor
 *   in the flat tree, as Fomantic's `<div class="ui loader">` was.
 *
 * - The ELEMENT is the live region, through `internals`:
 *   `role=status`, `aria-live=polite`, so it's announced wherever it's put, with nothing in the shadow root to find.
 *   - With no slotted text, it's named by the `loading` text ("Loading…");
 *     slotted text names it otherwise (a status takes its name from its content).
 *
 * - It shows only while `active` (Fomantic's rule, in `UILoader.css`);
 *   `:state(active)` and `:state(disabled)` are for the page's styles.
 ****************/
@E.cssStates("active")
export class UILoader extends E.UIComponent<typeof loaderVocabulary> {
  @E.proto static vocabulary = loaderVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { loader: loaderCSS },
    delegatesFocus: false,
    aria: { role: "status", live: "polite" },
    // `disabled`:  only a look
    disabled: "its own"
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## The name
  ////////////////

  /** Which of its slots have content in the light DOM:  slotted text names the status. */
  readonly slots = new E.SlotContent(this.domElement)

  /** Has slotted text?  Tracked. */
  get hasText(): boolean {
    return this.slots.hasContent("")
  }

  /**
   * The element's accessible name:  the `loading` text while nothing is slotted.
   * - Waits for `isReady`:
   *   the text reads `UI.i18n` (via `translationForKey()`), which exists once the runtime loads.
   * - A server render (`$/ui/static`) applies it too.
   */
  @E.aria("label")
  protected get accessibleName(): string | undefined {
    return this.isReady && !this.hasText ? this.translationForKey("loading") : undefined
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("loader")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UILoader extends E.AttributeValues<typeof loaderVocabulary> {}
