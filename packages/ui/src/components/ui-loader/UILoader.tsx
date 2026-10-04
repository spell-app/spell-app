import { createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { proto, SlotContent, UIElement, UIT } from "$/ui/core"

import { loaderVocabulary } from "./ui-loader.vocabulary.en"
import { LoaderFallback } from "./ui-loader.fallback"

import loaderCSS from "./ui-loader.css?inline"
import { POLITE } from "./ui-loader.types"

/****************
 * ### `<ui-loader>`
 * A spinner, with optional text:  `<div class="ui … loader" part="loader"><slot></slot></div>`;  the spinner is
 * the root's `::before` / `::after`, decorative.
 * - The HOST is the live region, through internals:  `role=status`, `aria-live=polite` -- so it's announced
 *   wherever it's put, with nothing in the shadow root to find.  With no slotted text it's named by the
 *   `loading` text ("Loading…");  slotted text names it otherwise (a status takes its name from content).
 * - Shown only while `active` (Fomantic's rule, in `ui-loader.css`);  `:state(active)` / `:state(disabled)` are
 *   for page styling.
 * - Host is `display: contents`:  a centred loader is positioned against the nearest positioned ancestor in the
 *   flat tree, as Fomantic's `<div class="ui loader">` was.
 ****************/
export class UILoader extends UIElement<typeof loaderVocabulary> {
  @proto static vocabulary = loaderVocabulary
  @proto static styles = { loader: loaderCSS }
  @proto static Fallback = LoaderFallback
  @proto static delegatesFocus = false

  /** Light-DOM slot occupancy:  slotted text names the status. */
  readonly slots = new SlotContent(this.host)

  /** Has slotted text? */
  readonly hasText = createMemo(() => this.slots.has(""))

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    const { internals } = this.host
    internals.role = UIT.STATUS
    internals.ariaLive = POLITE
  }

  mount(): JSX.Element {
    // here, not in the constructor:  the name reads `UI.i18n` (via `text()`), which exists once the runtime loads;
    // `hostEffect`:  a server render (`$/ui/server`) applies it too
    this.hostEffect(
      () => (this.loaded() && !this.hasText() ? this.text("loading") : null),
      (label) => {
        this.host.internals.ariaLabel = label
      }
    )
    return super.mount()
  }

  protected hostStates() {
    return { active: this.attrs.active, disabled: this.attrs.disabled }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("loader")}>
        <slot />
      </div>
    )
  }
}
